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
  logoUrl: string | null = null;
  loading = true;
  api: String = environment.api;
  configs: Configuracao[] = []; // Variável para armazenar as configurações
  imageUrl: any;
  id: any; //Incializador do id selecionado no select
  ano: any = new Date().getFullYear();
  order: string = 'idConfig'; //identificação para ordenação da listagem
  disableSelect = new FormControl(false); // Variável para desabilitar o botão de  acessar;
  dataHoraFormatada: string = ''; // Variável para armazenar a data e hora formatada

  constructor() {}

  ngOnInit(): void {
    this.getConfiguracao();
    this.logoUrl = this.imageService.defaultLogo;
    this.loadLogo();
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
  private loadLogo() {
    this.imageService.getLogo().subscribe({
      next: (url) => {
        this.logoUrl = url;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onImageLoad() {
    this.loading = false;
  }

  onImageError() {
    this.logoUrl = this.imageService.defaultLogo;
    this.loading = false;
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
    if (this.logoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.logoUrl);
    }
  }
}
