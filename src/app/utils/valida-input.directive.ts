import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appValidaInput]',
})
export class ValidaInputDirective { 
  @Input() maxValor: number = 0;
  @Input() minValor: number = 0;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let currentValue = Number(input.value);

    // Verifica se o input é do tipo number
    if (input.type === 'number') {
      if (this.maxValor && currentValue > this.maxValor) {
        this.el.nativeElement.style.border = '1px solid red';
      } else if (this.minValor && currentValue < this.minValor) {
        this.el.nativeElement.style.border = '1px solid red';
      } else {
        this.el.nativeElement.style.border = 'none';
      }
    } else if (input.type === 'text') {
      // Exemplo: validação de tamanho mínimo/máximo para texto
      if (this.maxValor && input.value.length > this.maxValor) {
        this.el.nativeElement.style.border = '1px solid red';
      } else if (this.minValor && input.value.length < this.minValor) {
        this.el.nativeElement.style.border = '1px solid red';
      } else {
        this.el.nativeElement.style.border = 'none';
      }
    } else {
      // Para outros tipos de input, remove a borda vermelha
      this.el.nativeElement.style.border = 'none';
    }
  }
}
