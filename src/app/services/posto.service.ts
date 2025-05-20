import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Posto } from '../model/Posto';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class PostoService {
  private http = inject(HttpClient);
  private api = inject(ConfigService).getConfig().apiUrl;

  getAllPostos(): Observable<Posto[]> {
    return this.http.get<Posto[]>(`${this.api}/postos`);
  }

  getPostoById(id: any): Observable<Posto> {
    return this.http.get<Posto>(`${this.api}/postos/${id}`);
  }
}
