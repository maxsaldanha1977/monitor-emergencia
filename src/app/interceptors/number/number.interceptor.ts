import type { HttpInterceptorFn } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

// Campos que SEMPRE devem permanecer como string (nunca converter para número)
const PRESERVE_AS_STRING_FIELDS = ['registroPosto',  'codVisita', 'numeroPedido'];

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

function convertNumbersInObject(obj: any, parentKey?: string): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Se o campo estiver na lista de preservação, retorna como string
  if (parentKey && PRESERVE_AS_STRING_FIELDS.includes(parentKey)) {
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
        result[key] = convertNumbersInObject(obj[key], key); // Passa a chave atual como parentKey
      }
    }
    return result;
  }

  // Caso seja string, verifica se é numérica (exceto para campos preservados)
  if (typeof obj === 'string') {
    const trimmedStr = obj.trim();
    const isNumeric = !isNaN(Number(trimmedStr)) && !isNaN(parseFloat(trimmedStr));

    if (isNumeric) {
      // Mantém como string se começar com '0' e não for decimal
      if (trimmedStr.startsWith('0') && !trimmedStr.includes('.')) {
        return obj;
      }
      // Converte para número (int ou float)
      return trimmedStr.includes('.') ? parseFloat(trimmedStr) : parseInt(trimmedStr, 10);
    }
  }

  // Retorna o valor original para outros tipos
  return obj;
}
