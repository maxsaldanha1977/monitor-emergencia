import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { Monitor } from '../../core/model/Monitor';
import { ConfigService } from '../../core/services/config.service';

@Injectable({
  providedIn: 'root'
})
export class MonitorService {
  private http = inject(HttpClient);
   private api = inject(ConfigService).getConfig().apiUrl;

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
