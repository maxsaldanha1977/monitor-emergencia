import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[characterCounter]',
  standalone: true
})
export class CharacterCounterDirective {
  @Input() maxLength: number = 0;
  @Input() counterElementId: string = '';
  
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let currentValue = input.value;

    if (currentValue.length > this.maxLength) {
      // Trunca o valor para o limite máximo
      input.value = currentValue.substring(0, this.maxLength);
    }

    const currentLength = input.value.length;
    const counterElement = document.getElementById(this.counterElementId);
    
    if (counterElement) {
      counterElement.textContent = `${currentLength}/${this.maxLength}`;
    }
  }
}