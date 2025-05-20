import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class TempoMedioService {
  private http = inject(HttpClient);
  private api = inject(ConfigService).getConfig().apiUrl;

  getTempoMedioById(id: any): Observable<any> {
    return this.http.get<any>(`${this.api}/monitoramento/${id}/tempo-medio`);
  }
}
