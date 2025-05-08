import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { Monitor } from '../model/Monitor';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private http = inject(HttpClient);
  
  api: String = environment.api;

  getMonitoramentoById(id: any): Observable<Monitor | null> {
    return this.http.get<Monitor>(`${this.api}/monitoramento/${id}`).pipe(
      catchError(error => {
        if (error.status === 204){
          return of(null);
        }
        return throwError(error);
        
      })
    );
  }

}
