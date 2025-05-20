// server-status.component.ts
import { Component, inject } from '@angular/core';
import { ServerStatusService } from '../../services/server-status.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-server-status',
  standalone: true,
  imports: [CommonModule],
  template: `
   <div *ngIf="(status$ | async) === 'offline'" class="connection-banner offline">
      ⚠️ Sem conexão com o servidor - Tentando reconectar...
    </div>
    <div *ngIf="(status$ | async) === 'checking'" class="connection-banner checking">
      🔄 Verificando conexão...
    </div>
  `,
  styles: [`
.connection-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 12px;
      text-align: center;
      z-index: 1000;
      animation: slideIn 0.5s;
      color: white;
    }
    
    .offline {
      background-color: #f44336;
    }
    
    .checking {
      background-color: #ff9800;
    }
    
    @keyframes slideIn {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `]
})

export class ServerStatusComponent {
  serverStatus = inject(ServerStatusService);
  status$ = this.serverStatus.serverStatus$;
  
}