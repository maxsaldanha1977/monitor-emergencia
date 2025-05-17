import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private http = inject(HttpClient);
 defaultLogo = 'assets/img/logo.png';

  constructor() { }

  getImage(): Observable<string> {
    return this.http.get('http://192.168.239.142:9090/logo-image', {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        // Validação rigorosa do tipo de conteúdo
        if (!this.isValidPng(response)) {
          throw new Error('Invalid PNG response');
        }
        
        return URL.createObjectURL(response.body!);
      }),
      catchError(() => of(this.defaultLogo)) // Fallback
    );
  }

private isValidPng(response: any): boolean {
    const contentType = response.headers.get('Content-Type');
    const isPng = contentType === 'image/png';
    const hasBody = !!response.body;
    const validSize = response.body?.size > 0;

    return isPng && hasBody && validSize;
  }
}
