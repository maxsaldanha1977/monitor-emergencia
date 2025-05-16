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
import { environment } from '../../../environments/environment';
import { ImageService } from '../../services/image.service';
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
  private configService = inject(ConfiguracaoService);
  private imageService = inject(ImageService);
  private intervalId: any;

  imageUrl: string | null = null;
  configs: Configuracao[] = []; // Variável para armazenar as configurações

  id: any; //Incializador do id selecionado no select
  ano: any = new Date().getFullYear();
  order: string = 'idConfig'; //identificação para ordenação da listagem
  disableSelect = new FormControl(false); // Variável para desabilitar o botão de  acessar;
  dataHoraFormatada: string = ''; // Variável para armazenar a data e hora formatada

  constructor() {}

  ngOnInit(): void {
    this.getConfiguracao();
    this.updateLogo();
  }

  getConfiguracao() {
    this.configService
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
  // Faz a requisição
  updateLogo() {
    this.imageService.getImage( 'http://192.168.239.142:9090/logo-image').subscribe((success) => {
      if (success) {
        console.log('Logo atualizado!');
        // Forçar recarregamento da imagem
        this.imageUrl = 'assets/img/logo.png?' + Date.now();
      }
    });
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
