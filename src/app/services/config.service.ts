import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private config: any;

  constructor(private http: HttpClient) {}

  loadConfig() {
    return this.http
      .get('/assets/config.json')
      .toPromise()
      .then((config) => {
        this.config = config;
      })
      .catch((err) => {
        console.error('Erro ao carregar configurações:', err);
      });
  }

  getConfig() {
    return this.config;
  }
}
