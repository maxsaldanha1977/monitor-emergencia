import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TempoMedioService {
  private http = inject(HttpClient);
  
  api: String = environment.api;

   getTempoMedioById(id: any):  Observable<any> {
     return this.http.get<any>(`${this.api}/monitoramento/${id}/tempo-medio`);
   }

}
