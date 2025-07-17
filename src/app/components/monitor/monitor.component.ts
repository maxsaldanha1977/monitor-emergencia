import {
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { calcularDiferencaHora } from '../../utils/time/time-utils';
import { Monitor } from '../../model/Monitor';
import { MonitorService } from '../../services/monitor.service';
import Swal from 'sweetalert2';
import { TempoMedioService } from '../../services/tempoMedio.service';
import { ConfiguracaoService } from '../../services/configuracao.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  catchError,
  count,
  debounceTime,
  delay,
  distinctUntilChanged,
  retry,
  Subject,
} from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ConfigService } from '../../services/config.service';
import { ServerStatusService } from '../../services/server-status.service';
import { ServerStatusComponent } from '../serve-status/serve-status.component';
import { LogoService } from '../../services/logo.service';
import { TempoDecorridoNumberPipe } from '../../pipe/tempo-decorrido-number.pipe';
import { NgPipesModule } from 'ngx-pipes';

@Component({
  selector: 'app-monitor',
  imports: [
    CommonModule,
    RouterModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    ServerStatusComponent,
     NgPipesModule,
    TempoDecorridoNumberPipe,
  ],
  templateUrl: './monitor.component.html',
  styleUrl: './monitor.component.css',
})
export class MonitorComponent implements OnInit, OnDestroy {
  title = 'Monitor de Emergência';


  private monitorService = inject(MonitorService);
  private tempoMedioService = inject(TempoMedioService);
  private configuracaoService = inject(ConfiguracaoService);
  private route = inject(ActivatedRoute);
  private logoService = inject(LogoService);
  private serverStatus = inject(ServerStatusService);
  private api = inject(ConfigService).getConfig().apiUrl + '/logo-image';

  private itemId = this.route.snapshot.paramMap.get('id');

  private intervalIdHora: any;
  private intervalIdAtualizacao: any;
  private intervalIdSlide: any;
  private intervalIdTempoMedio: any;
  private pageSize: number = 6; //Medida padrão para o tamanho do slide para telas 1080p (Full HD): 1080 pixels.
  private tempoRequest: number = 3; //Unidade Minutos - Tempo de atualização padrão devido a cargar de slides

  private resizeSubject = new Subject<number>();
  private previousHeight: number = 0;

   private tamCard = 147;

  status$ = this.serverStatus.serverStatus$;
  windowHeight: number = 0;
  currentPage = 0;
  totalPages = 0;
  profileImageUrl: SafeUrl | null = null;
  loadingProfileImage: boolean = false;
  profileImageError: string = '';
  textLoading: string = '';
  decorrido: string = '';
  dataHoraFormatada: string = '';
  isLoading: boolean = true;
  limiteAlertaAtrasado: number = 120; //Possivel implementação de parâmetro de configuração

  configuracao: any;
  monitoramento: Monitor[] = [];
  tempoMedio = {
    tempoMedio: '',
    baseCalculo: '',
  };

  constructor() {}

  ngOnInit(): void {
    this.initSetInterval();
    this.tam();
    this.loadImage();
    this.windowHeight = window.innerHeight;
    this.resizeSubject
      .pipe(
        debounceTime(1000), // Aguarda 1s sem novas alterações
        distinctUntilChanged() // Só emite se o valor for diferente do anterior
      )
      .subscribe((height) => {
        this.windowHeight = height;
        this.pageSize = Math.floor((this.windowHeight - 80) / this.tamCard);
        this.getMonitoramento();
        console.log('Nova altura:', this.windowHeight);
      });

    // Inicializa com a altura atual
    this.previousHeight = window.innerHeight;
  }

  tam(): void {
    const larguraTela = window.innerWidth;
    const alturaTela = window.innerHeight;
    console.log(
      'A largura da tela é: ' +
        larguraTela +
        ' pixels' +
        'A altura da tela é: ' +
        alturaTela +
        ' pixels'
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const newHeight = window.innerHeight;

    // Verifica se a altura realmente mudou
    if (newHeight !== this.previousHeight) {
      this.previousHeight = newHeight;
      this.resizeSubject.next(newHeight);
    }
  }

  private initSetInterval(): void {
    this.status$.subscribe((status) => {
      if (status === 'offline') {
        Swal.fire({
          icon: 'error',
          title: 'Oops... Aconteceu alguma coisa.',
          text: 'Parece que você está offline. Verifique sua conexão com a internet.',
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });

    this.configuracaoService
      .getConfiguracaoById(this.itemId)
      .pipe(
        retry({
          count: 3,
          delay: 1000,
        })
      )
      .subscribe({
        next: (response: any) => {
          this.configuracao = response;
          // Atualiza os valores dos intervalos com os dados da API, e converte para milissegundos devido o setInterval
          this.tempoRequest = (this.configuracao.tempoReload || 3) * 60000; //Unidade Minutos - Aguarndando implementação
          const tempoTransicao =
            (this.configuracao.tempoRefreshTela || 10) * 1000; //Unidade Segundos
          const tempoMaximoVisita =
            (this.configuracao.tempoMaximoVisita || 6) * 60000; //Unidade Minutos
          const tempoMedicao = (this.configuracao.tempoMedicao || 8) * 60000; //Unidade Minutos
          this.pageSize = Math.floor((this.windowHeight - 80) / this.tamCard); //Unidade Minutos altura -

          this.intervalIdTempoMedio = setInterval(() => {
            this.getTempoMedio();
          }, tempoMedicao);

          this.intervalIdSlide = setInterval(() => {
            this.nextSlide();
          }, tempoTransicao);

          this.intervalIdAtualizacao = setInterval(() => {
            this.getMonitoramento();
          }, this.tempoRequest);

          //Valida a configuração de exames e postos se cadastrados.
          if (
            this.configuracao.exames.length > 0 ||
            this.configuracao.postos.length > 0
          ) {
            this.getTempoMedio();
            this.getMonitoramento();
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops... Aconteceu alguma coisa.',
              text: 'O Perfil, não possui exame ou posto cadastrado! ',
              showConfirmButton: false,
              footer:
                '<a class="btn btn-danger m-3" href="/configuracao"> <i class="bi bi-gear fa-2x"></i>Ir para CONFIGURACAO</a> <a class="btn m-3"  href="/"> <i class="bi bi-box-arrow-right fa-2x"></i> SAIR</a>',
            });
          }
          this.intervalIdHora = setInterval(() => {
            this.atualizarDataHora();
            this.monitoramento.forEach((monitor) => {
              monitor.decorrido = calcularDiferencaHora(monitor.dtCadastro);
            });
          }, 1000);
          console.log('ConfiguracaoService in setInterval');
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            text: 'Oops! Ocorreu um erro no caregamento das informações! Atualize o navegador ou tente mais tarde.',
            showConfirmButton: false,
            timer: 1500,
          });
        },
      });
  }

  //Serviço retorna os dados de monitoramento.
  private getMonitoramento(): void {
    this.textLoading = '⌛ Carregando os slides...'; //Defini o texto para o pré carregando
    this.monitorService
      .getMonitoramentoById(this.itemId)
      .pipe(
        retry({
          count: 3,
          delay: 1000,
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.monitoramento = response;
            this.totalPages = Math.ceil(
              this.monitoramento.length / this.pageSize
            );
            this.currentPage = 0;
          } else {
            this.textLoading = '⚠️ Oops! Sem exames em análise no momento!';
          }

          console.log('getMonitoramento from Monitor');
        },
        error: (error) => {
          this.textLoading = '❌ Erro no carregamento ...'; //Defini o texto para o pré carregando
          Swal.fire({
            icon: 'error',
            text: 'Oops! Ocorreu um erro no caregamento das informações! Atualize o navegador ou tente mais tarde.',
            showConfirmButton: false,
            timer: 1500,
          });
          console.error('❌ Erro ao carregar monitoramento:', error);
        },
      });
  }

  //Serviço retorna o cálculo de Tempo Médio
  private getTempoMedio(): void {
    this.tempoMedioService
      .getTempoMedioById(this.itemId)
      .pipe(
        retry({
          count: 3,
          delay: 1000,
        })
      )
      .subscribe({
        next: (response: any) => {
          const tempoMedioMinutos = parseInt(response.tempoMedio, 10);
          const horas = Math.floor(tempoMedioMinutos / 60);
          const minutos = tempoMedioMinutos % 60;

          if (tempoMedioMinutos > 0) {
            this.tempoMedio.tempoMedio =
              horas > 0 ? `${horas}h e ${minutos}min` : `${minutos}min`;
          } else {
            this.tempoMedio.tempoMedio = '';
          }
          this.tempoMedio.baseCalculo = response.baseCalculo;
          console.log('getTempoMedio');
        },
        error: (error) => {
          this.textLoading = '⚠️ Oops! Erro no carregamento ...'; //Defini o texto para o pré carregando
          Swal.fire({
            icon: 'error',
            text: 'Oops! Ocorreu um erro no carregamento do tempo médio!',
            showConfirmButton: false,
            timer: 1500,
          });
          console.error('❌ Erro ao carregar tempo médio:', error);
        },
      });
  }

  //Serviço para popular o slide
  get slides(): Monitor[][] {
    // Verifica se monitoramento está vazio (caso 204 No Content)
    if (!this.monitoramento || this.monitoramento.length === 0) {
      return []; // Retorna array vazio ou pode tratar de outra forma se necessário
    }

    const result: Monitor[][] = [];
    //O for faz a verficação em todo o array e o fraciona com o slice
    for (let i = 0; i < this.monitoramento.length; i += this.pageSize) {
      result.push(this.monitoramento.slice(i, i + this.pageSize));
    }
    //O forEach corre todos os status de cada atendimento e faz a comparação com a função every
    this.monitoramento.forEach((statusVisita) => {
      //Atendimento Liberado: Todos os exames LB
      const LB = statusVisita.exames.every((exame) => exame.status === 'LB');

      //Atendimento Pronto: Todos os exames PT, ou LB com pelo menos 1 PT
      const PT =
        statusVisita.exames.some((exame) => exame.status === 'PT') &&
        statusVisita.exames.every(
          (exame) => exame.status === 'PT' || exame.status === 'LB'
        );
      //Atendimento Solicitado: pelo menos 1 exame sem resultado SL - mesmo q alguns resultados prontos ou liberados
      const SL = statusVisita.exames.some((exame) => exame.status === 'SL');

      if (LB) {
        statusVisita.situacao = 'Liberado';
      } else if (PT) {
        statusVisita.situacao = 'Pronto';
      } else if (SL) {
        statusVisita.situacao = 'Solicitado';
      }
    });
    return result;
  }

  //Função para carregar a imagem do logo
  async loadImage() {
    this.loadingProfileImage = true;
    this.profileImageError = '';

    const result = await this.logoService.loadImage(this.api);
    this.profileImageUrl = result.url;

    if (result.error) {
      this.profileImageError = result.error;
    }

    this.loadingProfileImage = false;
  }

  //Função para autormatizar a transição do slide
  nextSlide(): void {
    if (this.totalPages === 0) return;
    this.currentPage = (this.currentPage + 1) % this.totalPages;
  }

  //Funão para transformar o slide
  getTransform(): string {
    return `translateX(-${this.currentPage * 100}%)`;
  }

  //Função para capturar e gerar o relégio da Toolbar
  private atualizarDataHora(): void {
    const agora = new Date();

    const dia = agora.getDate();
    const mes = agora.toLocaleString('pt-BR', { month: 'long' }); // "abril"
    const ano = agora.getFullYear();

    const horas = this.pad(agora.getHours());
    const minutos = this.pad(agora.getMinutes());
    const segundos = this.pad(agora.getSeconds());

    this.dataHoraFormatada = `Hoje, ${dia} de ${mes} de ${ano} às ${horas}h${minutos}min${segundos}s`;
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalIdHora);
    clearInterval(this.intervalIdAtualizacao);
    clearInterval(this.intervalIdSlide);
    clearInterval(this.intervalIdTempoMedio);
  }
  //Função do TypeScript para ajustar a hora que está como int, para exibir 01h ao invês de 1h.
  pad(valor: number): string {
    return valor < 10 ? '0' + valor : valor.toString();
  }

  //Função para gerar legenda para a response booleana de status
  status(x: any) {
    if (x === 'Pronto') {
      return 'Pronto';
    } else if (x === 'Liberado') {
      return 'Liberado';
    } else if (x === 'Solicitado') {
      return 'Solicitado';
    } else {
      return 'Não definido';
    }
  }

  //Função para gerar legenda para a response booleana de status
  statusExame(x: any) {
    if (x === 'EA') {
      return 'Analise';
    } else if (x === 'LB') {
      return 'Liberado';
    } else if (x === 'SL') {
      return 'Solicitado';
    } else if (x === 'PT') {
      return 'Pronto';
    } else {
      return 'Não definido';
    }
  }
}

/*A altura máxima em pixels de uma televisão depende da resolução da mesma. As resoluções mais comuns são 1080p (Full HD), 4K UHD (2160p) e 8K UHD (4320p).
A altura máxima em pixels para cada resolução é:
1080p (Full HD): 1080 pixels.
4K UHD (2160p): 2160 pixels.
8K UHD (4320p): 4320 pixels.
*/
