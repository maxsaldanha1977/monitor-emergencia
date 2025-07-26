import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private http = inject(HttpClient);
  private config: any;

  constructor() {}

  loadConfig() {
    return this.http
      .get('assets/config.json')
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
