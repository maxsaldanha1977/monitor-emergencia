import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { LocalInternacao } from '../model/LocalInternacao';

@Injectable({
  providedIn: 'root',
})
export class LocalInternacaoService {
  private http = inject(HttpClient);
  private api = inject(ConfigService).getConfig().apiUrl;

  getAllLocalInternacao(): Observable<LocalInternacao[]> {
    return this.http.get<LocalInternacao[]>(`${this.api}/locais-internacao`);
  }

  getLocalInternacaoById(id: any): Observable<LocalInternacao> {
    return this.http.get<LocalInternacao>(
      `${this.api}/locais-internacao/${id}`
    );
  }
}
