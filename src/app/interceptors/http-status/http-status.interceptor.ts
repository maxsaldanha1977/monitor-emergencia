// http-status.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ServerStatusService } from '../../services/server-status.service';

export const httpStatusInterceptor: HttpInterceptorFn = (req, next) => {
  const serverStatus = inject(ServerStatusService);
  const router = inject(Router);

  // Ignora requisições de health check
  if (req.url.includes('/check-api')) {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
         // Ignora erros de imagens
      if (isImageRequest(req)) {
        return throwError(() => error);
      }

     // Detecta erros de conexão
      if (error.status === 0 || error.error instanceof ErrorEvent) {
        serverStatus.checkConnection().subscribe();
      }
      // Detecta erros do servidor (5xx)
      else if (error.status >= 500) {
        serverStatus.checkConnection().subscribe();
      }
      // Tratamento específico para cada status HTTP
      switch (error.status) {
        case 0: // Erro de conexão (offline)
        serverStatus.checkConnection().subscribe();
          showErrorAlert('Oops! Erro de Comunicação', 'Atualize o navegador ou verifique sua conexão');
          break;

        case 400: // Bad Request
         serverStatus.checkConnection().subscribe();
          handleBadRequest(error);
          break;

        case 401: // Unauthorized
         serverStatus.checkConnection().subscribe();
          handleUnauthorizedError(router);
          break;

        case 403: // Forbidden
         serverStatus.checkConnection().subscribe();
          showErrorAlert('Oops! Acesso negado', 'Você não tem permissão para acessar este recurso');
          break;

        case 404: // Not Found
         serverStatus.checkConnection().subscribe();
          showErrorAlert('Oops! Recurso não encontrado', 'O endereço solicitado não existe');
          break;

        case 408: // Request Timeout
         serverStatus.checkConnection().subscribe();
          showErrorAlert('Oops! Tempo esgotado', 'O servidor demorou muito para responder. Tente novamente mais tarde.');
          break;

        case 429: // Too Many Requests
         serverStatus.checkConnection().subscribe();
          showErrorAlert('Oops! Muitas requisições', 'Por favor, aguarde antes de fazer novas requisições');
          break;

        case 500: // Internal Server Error
         serverStatus.checkConnection().subscribe();
          showErrorAlert('Oops! Erro no servidor', 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.');
          break;

        case 502: // Bad Gateway
        case 503: // Service Unavailable
        case 504: // Gateway Timeout
        serverStatus.checkConnection().subscribe();
          showErrorAlert('Oops! Serviço indisponível', 'O servidor está temporariamente indisponível. Tente novamente mais tarde.');
          break;

        default:
          showErrorAlert(`Erro ${error.status}`, error.message || 'Oops! Ocorreu um erro desconhecido. Tente novamente mais tarde.');
      }

      return throwError(() => error);
    })
  );
};

// Funções auxiliares para tratamento de erros
function handleBadRequest(error: HttpErrorResponse): void {
  let errorMessage = '⚠️ Oops! Requisição inválida';

  if (error.error?.errors) {
    errorMessage = Object.values(error.error.errors).join('\n');
  } else if (error.error?.message) {
    errorMessage = error.error.message;
  }

  showErrorAlert('Dados inválidos', errorMessage);
}

function handleUnauthorizedError(router: Router): void {
  Swal.fire({
    title: 'Oops! Sessão expirada',
    text: 'Por favor, faça login novamente',
    icon: 'warning',
    confirmButtonText: 'OK',
    allowOutsideClick: false
  }).then(() => {
    router.navigate(['/login']);
  });
}

function showErrorAlert(title: string, message: string): void {
  Swal.fire({
    title,
    text: message,
    icon: 'error',
    confirmButtonText: 'OK',
    timer: 5000,
    timerProgressBar: true
  });
}

// Função auxiliar para identificar requisições de imagem
function isImageRequest(req: any): boolean {
  // Verifica pelo URL (ex: termina com .png ou contém /images/)
  if (req.url.match(/\.(png|jpg|jpeg|gif)$/) || req.url.includes('/images/')) {
    return true;
  }

  // Verifica pelo Accept header
  if (req.headers.get('Accept')?.includes('image/')) {
    return true;
  }

  return false;
}
