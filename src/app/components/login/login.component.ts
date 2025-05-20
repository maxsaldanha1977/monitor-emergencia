import { Component, inject, OnDestroy, OnInit, VERSION } from '@angular/core';
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
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ConfigService } from '../../services/config.service';
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
  private api = inject(ConfigService).getConfig().apiUrl;
  private intervalId: any;


  configs: Configuracao[] = []; // Variável para armazenar as configurações

  profileImageUrl: SafeUrl | null = null;
  loadingProfileImage: boolean = false;
  profileImageError: string = '';

  id: any; //Incializador do id selecionado no select
  ano: any = new Date().getFullYear();
  order: string = 'idConfig'; //identificação para ordenação da listagem
  disableSelect = new FormControl(false); // Variável para desabilitar o botão de  acessar;
  dataHoraFormatada: string = ''; // Variável para armazenar a data e hora formatada
  sanitizer = inject(DomSanitizer);

  constructor() {}

  ngOnInit(): void {
    this.getConfiguracao();
    this.loadImage();
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
  
//Função para carregar a imagem do logo
  async loadImage() {
    this.loadingProfileImage = true;
    this.profileImageError = '';
    try {
      const response = await fetch(this.api  + '/logo-image');
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        throw new Error('A resposta não é uma imagem válida');
      }
      const blob = await response.blob();
      this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(
        URL.createObjectURL(blob)
      );
    } catch (error) {
      console.error('Erro ao carregar imagem:', error);
      this.profileImageError =
        error instanceof Error ? error.message : String(error);
      this.profileImageUrl = this.imageService.defaultImage;
    } finally {
      this.loadingProfileImage = false;
    }
  }

  handleError() {
    this.profileImageUrl = this.imageService.defaultImage;
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
