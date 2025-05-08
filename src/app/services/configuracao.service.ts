import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Configuracao } from '../model/Configuracao';
import { ConfiguracaoPost } from '../model/ConfiguracaoPost';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracaoService {
  private http = inject(HttpClient);

  api: String = environment.api;

  getAllConfiguracao(): Observable<Configuracao[]> {
    return this.http.get<Configuracao[]>(`${this.api}/configs`);
  }

  getConfiguracaoById(id: any):  Observable<Configuracao> {
    return this.http.get<Configuracao>(`${this.api}/configs/${id}`);
  }

  postConfiguracao(body: ConfiguracaoPost): Observable<ConfiguracaoPost> {
    return this.http.post<ConfiguracaoPost>(`${this.api}/configs/`, body);
  }

  putConfiguracao(id: any, body: Configuracao): Observable<Configuracao> {
    return this.http.put<Configuracao>(`${this.api}/configs/${id}`, body);
  }

  deleteConfiguracao(id: any): Observable<void> {
    return this.http.delete<void>(`${this.api}/configs/${id}`);
  }

}
