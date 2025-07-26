import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exame } from '../model/Exame';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class ExameService {
  private http = inject(HttpClient);
  private api = inject(ConfigService).getConfig().apiUrl;

  getAllExames(): Observable<Exame[]> {
    return this.http.get<Exame[]>(`${this.api}/exames`);
  }

  getExameById(id: any):  Observable<Exame> {
    return this.http.get<Exame>(`${this.api}/exames/${id}`);
  }

}
