import {
  Component,
  Inject,
  inject,
  OnDestroy,
  OnInit,
  VERSION,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Configuracao } from '../../model/Configuracao';
import { MatSelectModule } from '@angular/material/select';
import { ConfiguracaoService } from '../../services/configuracao.service';
import { OrderModule } from 'ngx-order-pipe';
import { count, delay, retry } from 'rxjs';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    MatToolbarModule,
    RouterModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatSelectModule,
    OrderModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  private intervalId: any;
  private serviceConfig = inject(ConfiguracaoService);
  ano: any = new Date().getFullYear();

  order: string = 'idConfig'; //identificação para ordenação da listagem
  disableSelect = new FormControl(false); // Variável para desabilitar o botão de  acessar;
  configs: Configuracao[] = []; // Variável para armazenar as configurações
  dataHoraFormatada: string = ''; // Variável para armazenar a data e hora formatada
  id: any; //Incializador do id selecionado no select

  constructor() {}

  ngOnInit(): void {
    this.getConfiguracao();
  }

  getConfiguracao() {
    this.serviceConfig
      .getAllConfiguracao()
      .pipe(
        retry({
          count: 3,
          delay: 1000,
        })
      )
      .subscribe({
        next: (response: any) => {
          this.configs = response;
            Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Perfil de Configuração, carregado com sucesso!',
            showConfirmButton: false,
            timer: 1500,
          });
        },
        error: (error) => {
          console.error('Erro ao carregar os perfis:', error);
        },
      });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
