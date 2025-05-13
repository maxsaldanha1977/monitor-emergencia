import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { ConfiguracaoService } from '../../../services/configuracao.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostoService } from '../../../services/posto.service';
import { ExameService } from '../../../services/exame.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Posto } from '../../../model/Posto';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Exame } from '../../../model/Exame';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { ConfiguracaoPost } from '../../../model/ConfiguracaoPost';
import { LocalInternacao } from '../../../model/LocalInternacao';
import { LocalInternacaoService } from '../../../services/localInternacao.service';
import { OrderModule } from 'ngx-order-pipe';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { CustomFilterPipePipe } from '../../../pipe/custom-filter-pipe.pipe';
import { CharacterCounterDirective } from '../../../utils/character-counter/character-counter.directive';
import { ExamePost } from '../../../model/ExamePost';
import { PostoPost } from '../../../model/PostoPost';
import { ConfiguracaoUpdate } from '../../../model/ConfiguracaoUpdate';

interface PostoComLocais extends Posto {
  locaisDisponiveis: LocalInternacao[];
}

@Component({
  selector: 'app-editar',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatToolbarModule,
    RouterModule,
    MatButtonModule,
    MatTooltipModule,
    CharacterCounterDirective,
    CustomFilterPipePipe,
    OrderModule,
    FilterPipeModule
  ],
  templateUrl: './editar.component.html',
  styleUrl: './editar.component.css',
})
export class EditarComponent implements OnInit {
  title: string = 'Editar Perfil de Configuração';

  private postosService = inject(PostoService);
  private examesService = inject(ExameService);
  private configuracaoService = inject(ConfiguracaoService);
  private lolcalInternacaoService = inject(LocalInternacaoService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private changeDetectorRef = inject(ChangeDetectorRef);

  posto: any;
  filterExame: string = '';
  filterPosto: string = '';
  configuracaoForm: FormGroup;

  examesDisponiveis: Exame[] = [];
  postosDisponiveis: PostoComLocais[] = [];
  examesSelecionados: ExamePost[] = [];
  postosSelecionados: PostoPost[] = [];
  locaisInternacaoDisponiveis: LocalInternacao[] = [];
  locaisInternacaoSelecionados: LocalInternacao[] = [];
  carregando: boolean = false;

  constructor() {
    this.configuracaoForm = this.fb.group({
      descricao: ['', Validators.required],
      tempoDisponibilidade: [30, Validators.required],
      tempoMedicao: [5, Validators.required],
      tempoRefreshTela: [10, Validators.required],
      tempoMaximoVisita: [30],
      exibirExamePendente: ['true', Validators.required],
      exibirRegistroAtendimento: ['true', Validators.required],
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.carregando = true;
    const itemId = this.route.snapshot.paramMap.get('id');
    
    // Primeiro carrega todos os dados disponíveis
    this.carregarDadosDisponiveis().then(() => {
      if (itemId) {
        this.carregarConfiguracaoExistente(itemId);
      } else {
        // Modo criação - seleciona todos os postos por padrão
        this.postosSelecionados = this.postosDisponiveis.map(posto => ({
          codPosto: posto.codPosto,
          situacao: 'T',
          codLocalInternacao: '',
          locaisSelecionados: []
        }));
        this.carregando = false;
      }
    });
  }

  carregarDadosDisponiveis(): Promise<void> {
    return new Promise((resolve) => {
      // Carrega locais de internação primeiro
      this.lolcalInternacaoService.getAllLocalInternacao().subscribe({
        next: (locais) => {
          this.locaisInternacaoDisponiveis = locais;
          
          // Depois carrega os postos
          this.postosService.getAllPostos().subscribe({
            next: (postos) => {
              this.postosDisponiveis = postos
                .map((posto) => ({
                  ...posto,
                  locaisDisponiveis: this.filtrarLocaisPorPosto(posto),
                }))
                .filter((posto) => posto.locaisDisponiveis.length > 0);
              
              resolve();
            },
            error: (error) => {
              console.error('Erro ao carregar postos', error);
              resolve();
            }
          });
        },
        error: (error) => {
          console.error('Erro ao carregar locais de internação', error);
          resolve();
        }
      });

      // Carrega exames disponíveis em paralelo
      this.examesService.getAllExames().subscribe({
        next: (exames) => (this.examesDisponiveis = exames),
        error: (error) => console.error('Erro ao carregar exames', error)
      });
    });
  }

  carregarConfiguracaoExistente(itemId: string): void {
    this.configuracaoService.getConfiguracaoById(itemId).subscribe({
      next: (configuracaoExistente) => {
        // Preenche o formulário com os dados básicos
        this.configuracaoForm.patchValue(configuracaoExistente);
        
        // Preenche os exames selecionados
        this.examesSelecionados = configuracaoExistente.exames ? [...configuracaoExistente.exames] : [];
        
        // Trata os postos selecionados
        this.processarPostosSelecionados(configuracaoExistente);
        
        this.carregando = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar configuração existente', error);
        this.carregando = false;
      }
    });
  }

processarPostosSelecionados(configuracaoExistente: any): void {
  if (configuracaoExistente.postos && configuracaoExistente.postos.length > 0) {
    // Objeto temporário para agrupar locais por posto
    const postosAgrupados: {[codPosto: string]: PostoPost} = {};

    // Processa cada item do array de postos
    configuracaoExistente.postos.forEach((postoItem: any) => {
      const codPosto = postoItem.codPosto;
      
      // Se o posto ainda não foi processado, cria uma nova entrada
      if (!postosAgrupados[codPosto]) {
        postosAgrupados[codPosto] = {
          codPosto: codPosto,
          situacao: postoItem.situacao || 'T',
          codLocalInternacao: '',
          locaisSelecionados: []
        };
      }
      
      // Adiciona o local aos selecionados (se houver codLocalInternacao)
      if (postoItem.codLocalInternacao) {
        postosAgrupados[codPosto].locaisSelecionados?.push(postoItem.codLocalInternacao);
      }
    });

    // Converte o objeto agrupado de volta para array
    this.postosSelecionados = Object.values(postosAgrupados).map(posto => {
      // Se não há locais selecionados específicos, mantém o array vazio (todos selecionados)
      if (posto.locaisSelecionados && posto.locaisSelecionados.length === 0) {
        return {
          ...posto,
          codLocalInternacao: ''
        };
      }
      
      // Se há locais selecionados, define o primeiro como codLocalInternacao
      return {
        ...posto,
        codLocalInternacao: posto.locaisSelecionados?.[0] || ''
      };
    });
  } else {
    // Se não houver postos definidos, seleciona todos os postos disponíveis
    this.postosSelecionados = this.postosDisponiveis.map(posto => ({
      codPosto: posto.codPosto,
      situacao: 'T',
      codLocalInternacao: '',
      locaisSelecionados: []
    }));
  }
}

   toggleLocaisSelecionado(posto: Posto, local: LocalInternacao): void {
    // Filtra os locais de internação disponíveis apenas para o posto selecionado
    const locaisDoPosto = this.locaisInternacaoDisponiveis.filter(
      (l) => l.codPosto === posto.codPosto
    );

    if (
      !locaisDoPosto.some(
        (l) => l.codLocalInternacao === local.codLocalInternacao
      )
    ) {
      console.error('O local selecionado não pertence ao posto informado.');
      return;
    }

    const index = this.locaisInternacaoSelecionados.findIndex(
      (p) => p.codLocalInternacao === local.codLocalInternacao
    );

    if (index === -1) {
      // Garante o formato exato com todos os campos, mesmo que vazios
      const novoLocal = {
        codLocalInternacao: local.codLocalInternacao,
        codPosto: posto.codPosto, // Include the required codPosto property
      };
      this.locaisInternacaoSelecionados.push(novoLocal);
    } else {
      this.locaisInternacaoSelecionados.splice(index, 1);
    }
  }

  toggleExameSelecionado(exame: ExamePost): void {
    const index = this.examesSelecionados.findIndex((p) => p.mne === exame.mne);

    if (index === -1) {
      this.examesSelecionados.push({ mne: exame.mne });
    } else {
      this.examesSelecionados.splice(index, 1);
    }
  }

  togglePostoSelecionado(posto: PostoComLocais): void {
    const index = this.postosSelecionados.findIndex(
      (p) => p.codPosto === posto.codPosto
    );

    if (index === -1) {
      this.postosSelecionados.push({
        codPosto: posto.codPosto,
        situacao: 'T',
        codLocalInternacao: '',
        locaisSelecionados: []
      });
    } else {
      this.postosSelecionados.splice(index, 1);
    }
  }

  toggleLocalParaPosto(posto: PostoPost, local: LocalInternacao): void {
    const postoIndex = this.postosSelecionados.findIndex(
      (p) => p.codPosto === posto.codPosto
    );

    if (postoIndex !== -1) {
      // Inicializa o array se não existir
      if (!this.postosSelecionados[postoIndex].locaisSelecionados) {
        this.postosSelecionados[postoIndex].locaisSelecionados = [];
      }

      const locais =
        this.postosSelecionados[postoIndex].locaisSelecionados || [];
      const localIndex = locais.indexOf(local.codLocalInternacao);

      if (localIndex === -1) {
        locais.push(local.codLocalInternacao);
      } else {
        locais.splice(localIndex, 1);
      }

      // Atualiza o local principal (pode ser o primeiro selecionado ou vazio)
      this.postosSelecionados[postoIndex].codLocalInternacao =
        locais.length > 0 ? locais[0] : '';
    }
  }

  toggleTodosLocais(posto: PostoPost): void {
    const postoIndex = this.postosSelecionados.findIndex(
      (p) => p.codPosto === posto.codPosto
    );
    if (postoIndex === -1) return;

    if (this.isTodosLocaisSelecionados(posto)) {
      this.postosSelecionados[postoIndex].locaisSelecionados = [];
      this.postosSelecionados[postoIndex].codLocalInternacao = '';
    } else {
      const locaisDoPosto = this.getLocaisDoPosto(posto.codPosto);
      this.postosSelecionados[postoIndex].locaisSelecionados =
        locaisDoPosto.map((l) => l.codLocalInternacao);
      this.postosSelecionados[postoIndex].codLocalInternacao = '';
    }
  }

  getPostoSelecionado(codPosto: string): PostoPost {
    return (
      this.postosSelecionados.find((p) => p.codPosto === codPosto) || {
        codPosto: codPosto,
        situacao: 'T',
        codLocalInternacao: '',
      }
    );
  }

  getLocaisDoPosto(codPosto: string): LocalInternacao[] {
    const posto = this.postosDisponiveis.find((p) => p.codPosto === codPosto);
    return posto ? posto.locaisDisponiveis : [];
  }

  isLocalSelecionadoParaPosto(posto: PostoPost, local: LocalInternacao): boolean {
    const postoSelecionado = this.postosSelecionados.find(
      (p) => p.codPosto === posto.codPosto
    );
    return (
      postoSelecionado?.locaisSelecionados?.includes(local.codLocalInternacao) || false
    );
  }

  isExameSelecionado(exame: Exame): boolean {
    return this.examesSelecionados.some((e) => e.mne === exame.mne);
  }

  isPostoSelecionado(posto: Posto): boolean {
    return this.postosSelecionados.some((p) => p.codPosto === posto.codPosto);
  }

  isTodosLocaisSelecionados(posto: PostoPost): boolean {
    const locaisDoPosto = this.getLocaisDoPosto(posto.codPosto);
    const postoSelecionado = this.postosSelecionados.find(
      (p) => p.codPosto === posto.codPosto
    );

    if (!postoSelecionado?.locaisSelecionados) return false;

    return locaisDoPosto.every((local) =>
      postoSelecionado.locaisSelecionados?.includes(local.codLocalInternacao)
    );
  }

  filtrarLocaisPorPosto(posto: Posto): LocalInternacao[] {
    return this.locaisInternacaoDisponiveis.filter(
      (local) => local.codPosto === posto.codPosto
    );
  }

  deveExibirPosto(posto: PostoComLocais): boolean {
    return posto.locaisDisponiveis && posto.locaisDisponiveis.length > 0;
  }

  atualizarLocalPosto(codPosto: string, codLocal: string): void {
    const postoIndex = this.postosSelecionados.findIndex(
      (p) => p.codPosto === codPosto
    );
    if (postoIndex !== -1) {
      this.postosSelecionados[postoIndex].codLocalInternacao = codLocal;
    }
  }

  onSubmit(): void {
    if (
      this.configuracaoForm.valid &&
      this.examesSelecionados.length > 0 &&
      this.postosSelecionados.length > 0
    ) {
        const postosParaEnviar = this.postosSelecionados.flatMap((posto) => {
        // Caso "Selecionar todos" esteja marcado (sem locais específicos)
        if (
          this.isTodosLocaisSelecionados(posto) ||
          (!posto.locaisSelecionados && posto.codLocalInternacao === '')
        ) {
          return [
            {
              codPosto: posto.codPosto,
              situacao: posto.situacao,
              codLocalInternacao: '',
            },
          ];
        }

        // Caso tenha locais específicos selecionados
        return (
          posto.locaisSelecionados?.map((localCod) => ({
            codPosto: posto.codPosto,
            situacao: 'T',
            codLocalInternacao: localCod,
          })) || []
        );
      });

      const configuracao: ConfiguracaoUpdate = {
        ...this.configuracaoForm.value,
        exames: this.examesSelecionados,
        postos: postosParaEnviar,
      };
    
  //console.log('Dados a enviar:', JSON.stringify(configuracao, null, 2));
     
      const itemId = this.route.snapshot.paramMap.get('id');
    const operacao = this.configuracaoService.putConfiguracao(itemId, configuracao);
    operacao.subscribe({
        next: (response) => {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: itemId ? 'Cadastro atualizado com sucesso!' : 'Cadastro criado com sucesso!',
            showConfirmButton: false,
            timer: 1000,
          });
        },
        error: (error) => {
          console.error('Erro:', error);
          Swal.fire({
            position: 'top-end',
            icon: 'error',
            text: `Ocorreu um erro, o cadastro não foi ${itemId ? 'atualizado' : 'realizado'}, tente novamente!`,
            showConfirmButton: false,
            timer: 1000,
          });
        }
      });
    } else {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        text: 'Preencha todos os campos obrigatórios e selecione pelo menos um exame e um posto!',
        showConfirmButton: true,
      });
    }
  }
}