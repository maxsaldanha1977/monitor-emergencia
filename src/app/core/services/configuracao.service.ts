import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { Configuracao } from '../model/Configuracao';
import { ConfiguracaoPost } from '../model/ConfiguracaoPost';
import { ConfiguracaoUpdate } from '../model/ConfiguracaoUpdate';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracaoService {

  private http = inject(HttpClient);
  private api = inject(ConfigService).getConfig().apiUrl;

  getAllConfiguracao(): Observable<Configuracao[]> {
    return this.http.get<Configuracao[]>(`${this.api}/configs`);
  }

  getConfiguracaoById(id: any):  Observable<Configuracao> {
    return this.http.get<Configuracao>(`${this.api}/configs/${id}`);
  }

  postConfiguracao(body: ConfiguracaoPost): Observable<ConfiguracaoPost> {
    return this.http.post<ConfiguracaoPost>(`${this.api}/configs/`, body);
  }

  putConfiguracao(id: any, body: ConfiguracaoUpdate): Observable<ConfiguracaoUpdate> {
    return this.http.put<ConfiguracaoUpdate>(`${this.api}/configs/${id}`, body);
  }

  deleteConfiguracao(id: any): Observable<void> {
    return this.http.delete<void>(`${this.api}/configs/${id}`);
  }

}
