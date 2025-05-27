import { Directive, Input, ElementRef, Renderer2, inject } from '@angular/core';

@Directive({
  selector: '[appAlertaStatus]',
})
export class AlertaStatusDirective {
  renderer = inject(Renderer2);
  el = inject(ElementRef);

  @Input() set appAlertaStatus(status: string) {

    if (status === 'Liberado') {
      this.renderer.addClass(this.el.nativeElement, 'alert-pronto');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'alert-pronto');
    }
  }

    @Input() set appAlertaTempo(tempo: number) {

    if (tempo > 2) {
      this.renderer.addClass(this.el.nativeElement, 'alert-pronto');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'alert-pronto');
    }
  }
}
