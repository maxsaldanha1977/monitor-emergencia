import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class LogoService {
private readonly MAX_ATTEMPTS = 3;
  private readonly INITIAL_DELAY = 1000; // 1 segundo
  public readonly defaultImage = 'assets/img/logo_bioslab.png';

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Carrega uma imagem com mecanismo de retry
   * @param imageUrl URL da imagem a ser carregada
   * @returns Promise contendo a URL segura da imagem ou a imagem padrão em caso de falha
   */
  async loadImage(imageUrl: string): Promise<{url: SafeUrl, error?: string}> {
    let attempts = 0;
    let errorMessage = '';

    while (attempts < this.MAX_ATTEMPTS) {
      attempts++;

      try {
        const result = await this.tryLoadImage(imageUrl);
        return { url: result };
      } catch (error) {
        console.error(`Tentativa ${attempts} falhou:`, error);
        errorMessage = error instanceof Error ? error.message : String(error);

        if (attempts < this.MAX_ATTEMPTS) {
          // Aguarda um tempo antes de tentar novamente (exponencial backoff)
          await new Promise(resolve =>
            setTimeout(resolve, this.INITIAL_DELAY * Math.pow(2, attempts))
          );
        }
      }
    }

    // Todas as tentativas falharam - retorna a imagem padrão
    return {
      url: this.sanitizer.bypassSecurityTrustUrl(this.defaultImage),
      error: errorMessage
    };
  }

  /**
   * Tenta carregar uma imagem uma única vez
   * @param imageUrl URL da imagem
   * @returns Promise com a URL segura da imagem
   * @throws Error se o carregamento falhar
   */
  private async tryLoadImage(imageUrl: string): Promise<SafeUrl> {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('A resposta não é uma imagem válida');
    }

    const blob = await response.blob();
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
  }

  /**
   * Limpa recursos liberando URLs de objeto
   * @param url URL a ser revogada
   */
  revokeObjectUrl(url: SafeUrl): void {
    if (url) {
      URL.revokeObjectURL(url.toString());
    }
  }
}
