import type { HttpInterceptorFn } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

export const numberInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    map(event => {
      if (event instanceof HttpResponse) {
        const convertedBody = convertNumbersInObject(event.body);
        return event.clone({ body: convertedBody });
      }
      return event;
    })
  );
};

function convertNumbersInObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Caso seja array, processa cada elemento
  if (Array.isArray(obj)) {
    return obj.map(item => convertNumbersInObject(item));
  }

  // Caso seja objeto, processa cada propriedade
  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = convertNumbersInObject(obj[key]);
      }
    }
    return result;
  }

  // Caso seja string numérica, converte para número
  if (typeof obj === 'string' && !isNaN(Number(obj)) && obj.trim() !== '') {
    // Preserva números decimais
    return obj.includes('.') ? parseFloat(obj) : parseInt(obj, 10);
  }

  // Retorna o valor original para outros tipos
  return obj;
}