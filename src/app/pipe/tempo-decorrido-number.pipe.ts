import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'appTempoDecorridoNumber',
})
export class TempoDecorridoNumberPipe implements PipeTransform {

   transform(value: string): number {
    if (!value) return 0;
    
    // Remove o "Há " do início
    const tempo = value.replace('Há ', '');
    
    // Extrai horas e minutos
    const partes = tempo.split(' e ');
    
    let horas = 0;
    let minutos = 0;
    
    partes.forEach(parte => {
      if (parte.includes('h')) {
        horas = parseInt(parte.replace('h', ''), 10);
      } else if (parte.includes('min')) {
        minutos = parseInt(parte.replace('min', ''), 10);
      }
    });
    
    return (horas * 60) + minutos;
  }
}