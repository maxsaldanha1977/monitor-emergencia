import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfiguracaoPost } from '../../../model/ConfiguracaoPost';
import { Posto } from '../../../model/Posto';
import { Exame } from '../../../model/Exame';
import { PostoService } from '../../../services/posto.service';
import { ExameService } from '../../../services/exame.service';
import { CommonModule } from '@angular/common';
import { PostoPost } from '../../../model/PostoPost';
import { ExamePost } from '../../../model/ExamePost';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LocalInternacao } from '../../../model/LocalInternacao';
import { LocalInternacaoService } from '../../../services/localInternacao.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { OrderModule } from 'ngx-order-pipe';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { CustomFilterPipePipe } from '../../../pipe/custom-filter-pipe.pipe';
import { CharacterCounterDirective } from '../../../utils/character-counter/character-counter.directive';
import Swal from 'sweetalert2';
import { ConfiguracaoService } from '../../../services/configuracao.service';
import { ValidaInputDirective } from '../../../utils/valida-input.directive';
import { ServerStatusComponent } from '../../serve-status/serve-status.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface PostoComLocais extends Posto {
  locaisDisponiveis: LocalInternacao[];
}

@Component({
  selector: 'app-criar',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    MatTooltipModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatExpansionModule,
    OrderModule,
    FormsModule,
    FilterPipeModule,
    MatFormFieldModule,
    MatIconModule,
    CustomFilterPipePipe,
    CharacterCounterDirective,
    ValidaInputDirective,
    ServerStatusComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './criar.component.html',
  styleUrl: './criar.component.css',
})
export class CriarComponent implements OnInit {
  title = 'Cadastrar Perfil de Configuração';

  private postosService = inject(PostoService);
  private examesService = inject(ExameService);
  private configuracaoService = inject(ConfiguracaoService);
  private lolcalInternacaoService = inject(LocalInternacaoService);
  private fb = inject(FormBuilder);

  posto: any;
  filterExame: string = '';
  filterPosto: string = '';
  textLoading: string = '';
  isLoading: boolean = true;
  configuracaoForm: FormGroup;

  examesDisponiveis: Exame[] = [];
  postosDisponiveis: Posto[] = [];
  examesSelecionados: ExamePost[] = [];
  postosSelecionados: PostoPost[] = [];
  locaisInternacaoDisponiveis: LocalInternacao[] = [];
  locaisInternacaoSelecionados: LocalInternacao[] = [];

  constructor() {
    this.configuracaoForm = this.fb.group({
      descricao: ['', Validators.required],
      tempoDisponibilidade: ['30', Validators.required],
      tempoMedicao: ['5', Validators.required],
      tempoRefreshTela: ['10', Validators.required], //tempoRefreshTela -> tempoTransicao
      tempoMaximoVisita: ['30'],
      exibirExamePendente: ['true', Validators.required],
      exibirRegistroAtendimento: ['true', Validators.required],
      // Removemos os FormArrays pois agora vamos gerenciar as seleções separadamente
    });
  }

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
        this.textLoading = 'Carregando as informações!';
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
              .filter((posto) => posto.locaisDisponiveis.length > 0); // Filtra postos com locais;
          },
          error: (error) => console.error('Erro ao carregar postos', error),
        });
         this.isLoading= false;
      },
      error: (error) =>
        console.error('Erro ao carregar locais de internação', error),
    });

    // Carrega exames disponíveis
    this.examesService.getAllExames().subscribe({
      next: (exames) => (this.examesDisponiveis = exames),
      error: (error) => console.error('Erro ao carregar exames', error),
    });
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
      console.error('Oops! O local selecionado não pertence ao posto informado.');
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
      // Garante o formato exato com todos os campos, mesmo que vazios
      const novoExame = {
        mne: exame.mne,
      };
      this.examesSelecionados.push(novoExame);
    } else {
      this.examesSelecionados.splice(index, 1);
    }
  }

  togglePostoSelecionado(posto: PostoComLocais): void {
    const index = this.postosSelecionados.findIndex(
      (p) => p.codPosto === posto.codPosto
    );

    if (index === -1) {
      // Adiciona novo posto com local vazio
      this.postosSelecionados.push({
        codPosto: posto.codPosto,
        situacao: 'T',
        codLocalInternacao: '',
      });
    } else {
      // Remove o posto da seleção
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

    const locaisDoPosto = this.getLocaisDoPosto(posto.codPosto);

    if (this.isTodosLocaisSelecionados(posto)) {
      // Desmarcar todos
      this.postosSelecionados[postoIndex].locaisSelecionados = [];
      this.postosSelecionados[postoIndex].codLocalInternacao = '';
    } else {
      // Marcar todos
      this.postosSelecionados[postoIndex].locaisSelecionados =
        locaisDoPosto.map((l) => l.codLocalInternacao);
      this.postosSelecionados[postoIndex].codLocalInternacao = '';
    }
  }

  getPostoSelecionado(codPosto: string): PostoPost {
    // Encontra o posto selecionado pelo código
    const posto = this.postosSelecionados.find((p) => p.codPosto === codPosto);

    // Se não encontrar, retorna um objeto padrão
    return (
      posto || {
        codPosto: codPosto,
        situacao: 'T',
        codLocalInternacao: '',
      }
    );
  }

  getLocaisDoPosto(codPosto: string): LocalInternacao[] {
    const posto = this.postosDisponiveis.find((p) => p.codPosto === codPosto);
    return posto ? (posto as PostoComLocais).locaisDisponiveis : [];
  }

  isLocalSelecionadoParaPosto(
    posto: PostoPost,
    local: LocalInternacao
  ): boolean {
    const postoSelecionado = this.postosSelecionados.find(
      (p) => p.codPosto === posto.codPosto
    );
    return (
      postoSelecionado?.locaisSelecionados?.includes(
        local.codLocalInternacao
      ) || false
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
    // Exibe apenas postos que possuem locais de internação associados
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

  transformToPostoComLocais(posto: Posto): PostoComLocais {
    return {
      ...posto,
      locaisDisponiveis: this.getLocaisDoPosto(posto.codPosto), // Ensure this method provides the required data
    };
  }

  onSubmit(): void {
    this.isLoading= true;
    this.textLoading = 'Aguardando resposta do servidor';
    if (
      this.configuracaoForm.valid &&
      this.examesSelecionados.length > 0 &&
      this.postosSelecionados.length > 0 &&
      this.postosSelecionados.every(
        (posto) =>
          posto.codLocalInternacao !== '' ||
          (posto.locaisSelecionados && posto.locaisSelecionados.length > 0)
      )
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

      const configuracao: ConfiguracaoPost = {
        ...this.configuracaoForm.value,
        exames: this.examesSelecionados,
        postos: postosParaEnviar,
      };

      //console.log('Dados a enviar:', JSON.stringify(configuracao, null, 2));

      this.configuracaoService.postConfiguracao(configuracao)
      .subscribe(
        (response) => {
           this.isLoading = false;
          console.log('Sucesso:', response);
          Swal.fire({
            icon: 'success',
            title: 'Cadastro criado com sucesso!',
            showConfirmButton: false,
            timer: 1000,
          });
        },
        (error) => {
          console.error('Erro:', error);
          Swal.fire({
            icon: 'error',
            text: 'Oops! Ocorreu um erro, o cadastro não foi realizado, tente novamente!',
            showConfirmButton: false,
            timer: 1000,
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        text: 'Oops! Preencha pelo menos um local de internação para o posto habilitado!',
        showConfirmButton: true,
      });
    }
  }
}
