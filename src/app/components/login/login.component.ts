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
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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

  api: String = environment.api;
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

 loadImage(): void {
    this.loadingProfileImage = true;
    this.imageService.getImage().subscribe({
      next: (response) => {
        console.log('Resposta da imagem:', response); // Para diagnóstico
        if (response.body instanceof Blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
            this.loadingProfileImage = false;
          };
          reader.readAsDataURL(response.body); // Linha 95 (aproximadamente)
        } else if (response.body) {
          // Tentativa de lidar com Base64 (se o backend enviar assim)
          try {
            const base64String = response.body ; // Ajuste conforme a estrutura do seu JSON
            if (base64String) {
              this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(`data:image/png;base64,${base64String}`);
              this.loadingProfileImage = false;
            } else {
              this.profileImageError = 'Formato de imagem inesperado na resposta.';
              this.loadingProfileImage = false;
              console.error('Corpo da resposta sem dados de imagem válidos:', response.body);
            }
          } catch (error) {
            this.profileImageError = 'Erro ao processar a resposta da imagem.';
            this.loadingProfileImage = false;
            console.error('Erro ao processar Base64:', error, response.body);
          }
        } else {
          this.profileImageError = 'Erro ao receber a imagem de perfil (corpo da resposta vazio).';
          this.loadingProfileImage = false;
        }
      },
      error: (error) => {
        this.profileImageError = 'Erro ao carregar a imagem de perfil: ' + error;
        this.loadingProfileImage = false;
        console.error(error);
      },
    });
  }


  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
