import { Component, inject, OnDestroy, OnInit, VERSION } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Configuracao } from '../../core/model/Configuracao';
import { MatSelectModule } from '@angular/material/select';
import { OrderModule } from 'ngx-order-pipe';
import { count, delay, retry } from 'rxjs';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ServerStatusComponent } from "../../shared/serve-status/serve-status.component";
import { ConfiguracaoService } from '../../shared/services/configuracao.service';
import { ConfigService } from '../../shared/services/config.service';
import { LogoService } from '../../shared/services/logo.service';
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
    ServerStatusComponent
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  private configService = inject(ConfiguracaoService);
  private api = inject(ConfigService).getConfig().apiUrl + '/logo-image';
  private logoService =inject(LogoService);


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

    const result = await this.logoService.loadImage(this.api);
    this.profileImageUrl = result.url;

    if (result.error) {
      this.profileImageError = '';
    }

    this.loadingProfileImage = false;
  }

  handleError() {
    this.profileImageUrl = 'assets/img/logo_bioslab.png';
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
