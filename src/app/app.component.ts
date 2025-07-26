import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ServerStatusService } from './core/services/server-status.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,  CommonModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
     private serverStatus = inject(ServerStatusService);
     private breakpointObserver = inject(BreakpointObserver);
     isMobile = false;

  constructor() {
    // Verificação inicial ao carregar a aplicação
    this.serverStatus.checkConnection().subscribe();

         // Verificação o tamanho da tela e realiza o blouqueio
      this.breakpointObserver.observe([`(max-width: 767px)`])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }
}
