import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ConfiguracaoService } from '../../services/configuracao.service';
import { Configuracao } from '../../model/Configuracao';
import Swal from 'sweetalert2';
import { OrderModule } from 'ngx-order-pipe';
import { FormsModule } from '@angular/forms';
import { CustomFilterPipePipe } from '../../pipe/custom-filter-pipe.pipe';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-configuracao',
  imports: [
    MatExpansionModule,
    RouterModule,
    MatButtonModule,
    CommonModule,
    OrderModule,
    FormsModule,
    CustomFilterPipePipe,
    MatTooltipModule
  ],
  templateUrl: './configuracao.component.html',
  styleUrl: './configuracao.component.css',
})
export class ConfiguracaoComponent implements OnInit {
  title = 'Configuração de Perfil';  

  private configuraracaoService = inject(ConfiguracaoService);
 
  filter: string = ''; 

  configuracao: Configuracao[] = [];

  constructor() {}

  ngOnInit(): void {
    this.getAllConfiguracao();
  }

  //Serviço retorna os dados de monitoramento.
  getAllConfiguracao(): void {
    try {
      this.configuraracaoService
        .getAllConfiguracao()
        .subscribe((response: any) => {
          this.configuracao = response;
        });
      //SweetAlert2
      Swal.fire({
        icon: 'success',
        title: 'Carregado com sucesso!',
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({        icon: 'error',
        text: 'Ocorreu um erro, o caregamento das informações!',
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }

  deleteConfiguracao(id: any): void {
    try {
      Swal.fire({
        title: 'Deseja deletar o Perfil?',
        text: "Após a exclusão, não será possível reverte a ação!",
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
          });
          this.configuraracaoService.deleteConfiguracao(id).subscribe(() => {
            this.configuracao = this.configuracao.filter(
              (item) => item.idConfig !== id
            );
          });
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro na exclusão do perfil',
        text: 'Ocorreu um erro ao salvar as alterações',
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
