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
import { LocalInternacao } from '../../../model/LocalInternacao';
import { LocalInternacaoService } from '../../../services/localInternacao.service';
import { OrderModule } from 'ngx-order-pipe';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { CustomFilterPipePipe } from '../../../pipe/custom-filter-pipe.pipe';
import { CharacterCounterDirective } from '../../../utils/character-counter/character-counter.directive';
import { ExamePost } from '../../../model/ExamePost';
import { PostoPost } from '../../../model/PostoPost';
import { ConfiguracaoUpdate } from '../../../model/ConfiguracaoUpdate';
import { ValidaInputDirective } from '../../../utils/valida-input.directive';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServerStatusComponent } from "../../serve-status/serve-status.component";

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
    FilterPipeModule,
    MatProgressSpinnerModule,
    ValidaInputDirective,
    ServerStatusComponent
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
   textLoading: string = 'Carregando as informações';
  filterExame: string = '';
  filterPosto: string = '';
  configuracaoForm: FormGroup;

  examesDisponiveis: Exame[] = [];
  postosDisponiveis: PostoComLocais[] = [];
  examesSelecionados: ExamePost[] = [];
  postosSelecionados: PostoPost[] = [];
  locaisInternacaoDisponiveis: LocalInternacao[] = [];
  locaisInternacaoSelecionados: LocalInternacao[] = [];
  isLoading: boolean = false;

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
    this.isLoading = true;
    const itemId = this.route.snapshot.paramMap.get('id');

    // Primeiro carrega todos os dados disponíveis
    this.carregarDadosDisponiveis().then(() => {
      if (itemId) {
        this.carregarConfiguracaoExistente(itemId);
      } else {
        // Modo criação - seleciona todos os postos por padrão
        this.postosSelecionados = this.postosDisponiveis.map((posto) => ({
          codPosto: posto.codPosto,
          situacao: 'T',
          codLocalInternacao: '',
          locaisSelecionados: [],
        }));
        this.isLoading = false;
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
            },
          });
        },
        error: (error) => {
          console.error('Erro ao carregar locais de internação', error);
          resolve();
        },
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
          console.log('Configuração existente:', configuracaoExistente); // <-- Mostra o retorno no console

          // Preenche o formulário com os dados básicos
          this.configuracaoForm.patchValue(configuracaoExistente);

          // Preenche os exames selecionados
          this.examesSelecionados = configuracaoExistente.exames
            ? [...configuracaoExistente.exames]
            : [];

          // Trata os postos selecionados
          this.processarPostosSelecionados(configuracaoExistente);

          this.isLoading = false;
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao carregar configuração existente', error);
          this.isLoading = false;
        },
      });
    }

  processarPostosSelecionados(configuracaoExistente: any): void {
    if (
      configuracaoExistente.postos &&
      configuracaoExistente.postos.length > 0
    ) {
      const postosAgrupados: { [codPosto: string]: PostoPost } = {};

      configuracaoExistente.postos.forEach((postoItem: any) => {
        const codPosto = postoItem.codPosto;

        if (!postosAgrupados[codPosto]) {
          postosAgrupados[codPosto] = {
            codPosto: codPosto,
            situacao: postoItem.situacao || 'T',
            codLocalInternacao: postoItem.codLocalInternacao || '',
            locaisSelecionados: [],
          };
        }

        // Se codLocalInternacao estiver vazio, mantém array vazio (todos selecionados)
        if (postoItem.codLocalInternacao) {
          postosAgrupados[codPosto].locaisSelecionados?.push(
            postoItem.codLocalInternacao
          );
        }
      });

      this.postosSelecionados = Object.values(postosAgrupados);
    } else {
      this.postosSelecionados = this.postosDisponiveis.map((posto) => ({
        codPosto: posto.codPosto,
        situacao: 'T',
        codLocalInternacao: '',
        locaisSelecionados: [],
      }));
    }
  }

  //POSTO
  getPostoSelecionado(codPosto: string): PostoPost {
    return (
      this.postosSelecionados.find((p) => p.codPosto === codPosto) || {
        codPosto: codPosto,
        situacao: 'T',
        codLocalInternacao: '',
      }
    );
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
        locaisSelecionados: [],
      });
    } else {
      this.postosSelecionados.splice(index, 1);
    }
  }

  isPostoSelecionado(posto: Posto): boolean {
    return this.postosSelecionados.some((p) => p.codPosto === posto.codPosto);
  }

  deveExibirPosto(posto: PostoComLocais): boolean {
    return posto.locaisDisponiveis && posto.locaisDisponiveis.length > 0;
  }

  //EXAME
  toggleExameSelecionado(exame: ExamePost): void {
    const index = this.examesSelecionados.findIndex((p) => p.mne === exame.mne);

    if (index === -1) {
      this.examesSelecionados.push({ mne: exame.mne });
    } else {
      this.examesSelecionados.splice(index, 1);
    }
  }

  isExameSelecionado(exame: Exame): boolean {
    const selecionado = this.examesSelecionados.some((e) => e.mne === exame.mne);
   // console.log(`Exame ${exame.mne} selecionado:`, selecionado);
    return selecionado;
  }

  //LOCAL DE INTERNAÇÃO

  getLocaisDoPosto(codPosto: string): LocalInternacao[] {
    const posto = this.postosDisponiveis.find((p) => p.codPosto === codPosto);
    return posto ? posto.locaisDisponiveis : [];
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

  toggleTodosLocais(posto: PostoPost): void {
    const postoIndex = this.postosSelecionados.findIndex(
      (p) => p.codPosto === posto.codPosto
    );
    if (postoIndex === -1) return;

    if (this.isTodosLocaisSelecionados(posto)) {
      // Desmarca todos - define array vazio
      this.postosSelecionados[postoIndex].locaisSelecionados = [];
      this.postosSelecionados[postoIndex].codLocalInternacao = '';
    } else {
      // Marca todos - define array com todos os locais
      const locaisDoPosto = this.getLocaisDoPosto(posto.codPosto);
      this.postosSelecionados[postoIndex].locaisSelecionados =
        locaisDoPosto.map((l) => l.codLocalInternacao);
      this.postosSelecionados[postoIndex].codLocalInternacao = '';
    }
  }

  isLocalSelecionadoParaPosto(
    posto: PostoPost,
    local: LocalInternacao
  ): boolean {
    const postoSelecionado = this.postosSelecionados.find(
      (p) => p.codPosto === posto.codPosto
    );

    if (!postoSelecionado) return false;

    // Se codLocalInternacao estiver vazio, considera todos selecionados
    if (postoSelecionado.codLocalInternacao === '') {
      return true;
    }

    // Caso contrário, verifica se o local está na lista de selecionados
    return (
      postoSelecionado.locaisSelecionados?.includes(local.codLocalInternacao) ??
      false
    );
  }

  isTodosLocaisSelecionados(posto: PostoPost): boolean {
    const postoSelecionado = this.postosSelecionados.find(
      (p) => p.codPosto === posto.codPosto
    );
    if (!postoSelecionado) return false;

    // Se codLocalInternacao estiver vazio, considera todos selecionados
    if (postoSelecionado.codLocalInternacao === '') {
      return true;
    }

    const locaisDoPosto = this.getLocaisDoPosto(posto.codPosto);
    return locaisDoPosto.every((local) =>
      postoSelecionado.locaisSelecionados?.includes(local.codLocalInternacao)
    );
  }

  toggleLocalParaPosto(posto: PostoPost, local: LocalInternacao): void {
    const postoIndex = this.postosSelecionados.findIndex(
      (p) => p.codPosto === posto.codPosto
    );

    if (postoIndex === -1) return;

    // Se estava no estado "todos selecionados" (codLocalInternacao vazio)
    if (this.postosSelecionados[postoIndex].codLocalInternacao === '') {
      // Muda para estado de seleção específica, com todos exceto o clicado selecionados
      const todosLocais = this.getLocaisDoPosto(posto.codPosto);
      this.postosSelecionados[postoIndex].locaisSelecionados = todosLocais
        .map((l) => l.codLocalInternacao)
        .filter((cod) => cod !== local.codLocalInternacao);
      this.postosSelecionados[postoIndex].codLocalInternacao =
        this.postosSelecionados[postoIndex].locaisSelecionados[0] || '';
    } else {
      // Estado normal de seleção específica
      if (!this.postosSelecionados[postoIndex].locaisSelecionados) {
        this.postosSelecionados[postoIndex].locaisSelecionados = [];
      }

      const locais = this.postosSelecionados[postoIndex].locaisSelecionados;
      const localIndex = locais.indexOf(local.codLocalInternacao);

      if (localIndex === -1) {
        locais.push(local.codLocalInternacao);
      } else {
        locais.splice(localIndex, 1);
      }

      this.postosSelecionados[postoIndex].codLocalInternacao =
        locais.length > 0 ? locais[0] : '';
    }
  }

  atualizarLocalPosto(codPosto: string, codLocal: string): void {
    const postoIndex = this.postosSelecionados.findIndex(
      (p) => p.codPosto === codPosto
    );
    if (postoIndex !== -1) {
      this.postosSelecionados[postoIndex].codLocalInternacao = codLocal;
    }
  }

  filtrarLocaisPorPosto(posto: Posto): LocalInternacao[] {
    return this.locaisInternacaoDisponiveis.filter(
      (local) => local.codPosto === posto.codPosto
    );
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

      console.log('Dados a enviar:', JSON.stringify(configuracao, null, 2));

      const itemId = this.route.snapshot.paramMap.get('id');
      const operacao = this.configuracaoService.putConfiguracao(
        itemId,
        configuracao
      );
      operacao.subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: itemId
              ? 'Cadastro atualizado com sucesso!'
              : 'Cadastro criado com sucesso!',
            showConfirmButton: false,
            timer: 1000,
          });
        },
        error: (error) => {
          console.error('Erro:', error);
          Swal.fire({
            icon: 'error',
            text: `Ocorreu um erro, o cadastro não foi ${
              itemId ? 'atualizado' : 'realizado'
            }, tente novamente!`,
            showConfirmButton: false,
            timer: 1000,
          });
        },
      });
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Preencha todos os campos obrigatórios e selecione pelo menos um exame e um posto!',
        showConfirmButton: true,
      });
    }
  }
}
