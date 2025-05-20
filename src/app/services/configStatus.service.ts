import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ConfigStatusService {
  
  private config = signal<any>(null);
  private loaded = signal(false);
  constructor(private http: HttpClient) {}

  //Servico para carregar as configurações do sistema a partir de um arquivo JSON. 
  async loadConfig(): Promise<void> {
    try {
      const data = await this.http
        .get<{ apiUrl: string }>('assets/config.json')
        .toPromise();
      if (!data || !data.apiUrl) {
        throw new Error('Configuração inválida: apiUrl ausente');
      }
      // Garante que a URL termina com /
      const apiUrl = data.apiUrl.endsWith('/') ? data.apiUrl : `${data.apiUrl}`;
      this.config.set({ ...data, apiUrl });
      this.loaded.set(true);
    } catch (err) {
      console.error('Falha ao carregar configurações de host:', err);
      throw err;
    }
  }

  get apiUrl(): string {
    if (!this.loaded()) {
      throw new Error('Configurações de host não carregadas!');
    }
    return this.config()!.apiUrl;
  }

  get isReady(): boolean {
    return this.loaded();
  }
}

