import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ConfiguracaoService } from '../../services/configuracao.service';
import { Configuracao } from '../../model/Configuracao';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { CustomFilterPipePipe } from '../../pipe/custom-filter-pipe.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { retry } from 'rxjs';
import { NgPipesModule } from 'ngx-pipes';
import { ServerStatusComponent } from '../serve-status/serve-status.component';

@Component({
  selector: 'app-configuracao',
  imports: [
    MatExpansionModule,
    RouterModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    CustomFilterPipePipe,
    MatTooltipModule,
    MatProgressSpinnerModule,
    NgPipesModule,
    ServerStatusComponent,
  ],
  templateUrl: './configuracao.component.html',
  styleUrl: './configuracao.component.css',
})
export class ConfiguracaoComponent implements OnInit {
  title = 'Perfil de Configuração';

  private configuraracaoService = inject(ConfiguracaoService);

  filter: string = '';
  isLoading: boolean = true;
  textLoading: string = '';
  searchTerm: string = '';

  configuracao: Configuracao[] = [];

  constructor() {}

  ngOnInit(): void {
    this.getAllConfiguracao();
  }

  // Método chamado ao digitar no input
  onSearchInput(event: any): void {
    this.searchTerm = event.target.value.trim(); // Remove espaços em branco
    this.textLoading = '⚠️ Oops! Não encontrei a informação.';
  }
  //Serviço retorna os dados de monitoramento.
  private getAllConfiguracao(): void {
    this.textLoading = 'Carregando a listagem!';
    this.configuraracaoService
      .getAllConfiguracao()
      .pipe(
        retry({
          count: 3,
          delay: 1000,
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.configuracao = response;
            console.log('Configurações carregadas:', this.configuracao);
            Swal.fire({
              position: 'top-end',
              icon: 'success',
              title: 'Listagem, carregada com sucesso!',
              showConfirmButton: false,
              timer: 1500,
            });
          } else {
            this.textLoading =
              '⚠️ Oops! Sem perfil de configuração para exibir.';
          }
        },
        error: (error) => {
          this.textLoading = '❌ Erro no carregamento ...';
          Swal.fire({
            icon: 'error',
            text: 'Oops! Ocorreu um erro, o carregamento das informações!',
            showConfirmButton: false,
            timer: 1500,
          });
          console.error('Erro ao carregar monitoramento:', error);
        },
      });
  }

  //Serviço de exclusão de configuração.
  deleteConfiguracao(id: any): void {
    try {
      Swal.fire({
        title: 'Deseja deletar o Perfil?',
        text: 'Após a exclusão, não será possível reverte a ação!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sim, delete o perfil!',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Deletar Perfil',
            text: 'Perfil, deletado com sucesso!.',
            icon: 'success',
            showConfirmButton: false,
            timer: 1500,
          });
          this.configuraracaoService
            .deleteConfiguracao(id)
            .pipe(
              retry({
                count: 3,
                delay: 1000,
              })
            )
            .subscribe({
              next: () => {
                this.configuracao = this.configuracao.filter(
                  (item) => item.idConfig !== id
                );
              },
            });
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro na exclusão do perfil',
        text: 'Oops! Ocorreu um erro ao realizar a operação!',
      });
    }
  }

  //Função para gerar legenda para a response booleana de status
  status(x: any) {
    if (x === true) {
      return 'Sim';
    } else {
      return 'Não';
    }
  }

  //Função para gerar legenda para a response booleana de status
  local(x: any) {
    if (x === '') {
      return 'Todos';
    } else {
      return x;
    }
  }
}
