import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalInternacao } from '../model/LocalInternacao';

@Injectable({
  providedIn: 'root'
})
export class LocalInternacaoService {
  private http = inject(HttpClient);
  
  api: String = environment.api;

  getAllLocalInternacao(): Observable<LocalInternacao[]> {
    return this.http.get<LocalInternacao[]>(`${this.api}/locais-internacao`);
  }

  getLocalInternacaoById(id: any):  Observable<LocalInternacao> {
    return this.http.get<LocalInternacao>(`${this.api}/locais-internacao/${id}`);
  }

}
