import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ServerStatusComponent } from './components/serve-status/serve-status.component';
import { ServerStatusService } from './services/server-status.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ServerStatusComponent, CommonModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

     serverStatus = inject(ServerStatusService);

  constructor() {
     // Verificação inicial ao carregar a aplicação
     this.serverStatus.checkConnection().subscribe();
  }
}
