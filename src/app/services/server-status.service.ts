// server-status.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, fromEvent, interval, of } from 'rxjs';
import { catchError, finalize, map, throttleTime } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ConfigStatusService } from './configStatus.service';

@Injectable({ providedIn: 'root' })
export class ServerStatusService {
  private http = inject(HttpClient);
  private readonly checkInterval = 2000; // 5 segundos
  private isOnline = false;
  private connectionCheckInProgress = false;
  private configStatusService = inject(ConfigStatusService);
  private statusSubject = new BehaviorSubject<
    'online' | 'offline' | 'checking'
  >('checking');

  public serverStatus$ = this.statusSubject.asObservable();

  constructor() {
    this.setupConnectionMonitoring();
  }

  private setupConnectionMonitoring(): void {
    // Monitora eventos online/offline do navegador
    fromEvent(window, 'online').subscribe(() => this.checkConnection());
    fromEvent(window, 'offline').subscribe(() => this.handleOffline());

    // Verificação periódica independente do status do navegador
    interval(this.checkInterval).subscribe(() => this.checkConnection());

    // Primeira verificação imediata
    this.checkConnection();
  }
// Verifica a conexão com o servidor
  checkConnection(): Observable<boolean> {
    if (this.connectionCheckInProgress) {
      return of(this.statusSubject.value === 'online');
    }
    if (!this.configStatusService.isReady) {
      console.error('Configurações não carregadas');
      return of(false);
    }
    const healthCheckUrl =
      `${this.configStatusService.apiUrl}/check-api`.replace(
        /([^:]\/)\/+/g,
        '$1'
      );
    return this.http
      .get(`${healthCheckUrl}`, {
        observe: 'response',
        headers: { 'Cache-Control': 'no-cache' },
      })
      .pipe(
        throttleTime(1000),
        map((response) => {
          const isOnline = response.status === 200;
          this.updateServerStatus(isOnline);
          console.log('Status do servidor:', isOnline);
          return isOnline;
        }),
        catchError((error) => {
          this.updateServerStatus(false);
          console.error('Erro ao verificar o status do servidor', error);
          return of(false);
        }),
        finalize(() => {
          this.connectionCheckInProgress = false;
        })
      );
  }

  private handleOffline(): void {
    if (this.statusSubject.value !== 'offline') {
      this.updateServerStatus(false);
    }
  }

  private updateServerStatus(online: boolean): void {
    this.isOnline = online;
    const newStatus = online ? 'online' : 'offline';

    // Só emite mudança se o status for diferente
    if (this.statusSubject.value !== newStatus) {
      this.statusSubject.next(newStatus);

      if (online) {
        this.notifyServerBackOnline();
      } else {
        this.notifyServerOffline();
      }
    }
  }

  private notifyServerOffline(): void {
    Swal.fire({
      title: 'Conexão perdida',
      text: 'Não foi possível contactar o servidor',
      icon: 'error',
      allowOutsideClick: false,
      showConfirmButton: false,
      timerProgressBar: true,
      didOpen: () => Swal.showLoading(),
    });
  }

  private notifyServerBackOnline(): void {
    Swal.fire({
      title: 'Conexão estabelecida!',
      text: 'O servidor está respondendo normalmente',
      icon: 'success',
      timer: 3000,
      showConfirmButton: false,
    });
  }
}
