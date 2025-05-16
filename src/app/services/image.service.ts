import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private http = inject(HttpClient);
  private readonly api = environment.api + '/logo-image';
  defaultLogo = 'assets/img/logo.png';

  constructor() {}

  getLogo(): Observable<string> {
    // Primeiro verifica os métodos permitidos
    return this.http
      .options(this.api, {
        observe: 'response',
      })
      .pipe(
        switchMap((optionsResponse) => {
          const allowedMethods =
            optionsResponse.headers
              .get('Access-Control-Allow-Methods')
              ?.split(',') || [];

          // Escolhe o método adequado (POST ou GET)
          const method = allowedMethods.includes('POST')
            ? 'POST'
            : allowedMethods.includes('GET')
            ? 'GET'
            : null;

          if (!method) {
            throw new Error('Nenhum método suportado');
          }

          // Faz a requisição com o método adequado
          return this.http.request(method, this.api, {
            responseType: 'blob',
            headers: new HttpHeaders({
              Accept: 'image/png',
              'Content-Type': 'application/json',
            }),
            body: method === 'POST' ? {} : null,
          });
        }),
        map((blob) => URL.createObjectURL(blob)),
        catchError((error) => {
          console.error('Erro ao carregar logo:', error);
          return of(this.defaultLogo);
        })
      );
  }
}
