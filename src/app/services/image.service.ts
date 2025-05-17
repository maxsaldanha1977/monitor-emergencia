import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private http = inject(HttpClient);
  api = environment.api + '/logo-image';

  constructor() { }

  getImage():Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders({
      'Content-Type': 'image/png', // Indica que esperamos uma resposta do tipo imagem/png
      'Accept': 'image/png'       // Indica que aceitamos uma resposta do tipo imagem/png
    });

    return this.http.get(this.api, { headers: headers, responseType: 'blob', observe: 'response' });
  }

}
