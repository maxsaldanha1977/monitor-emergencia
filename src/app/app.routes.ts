import { Routes } from '@angular/router';
import { MonitorComponent } from './features/monitor/monitor.component';
import { ConfiguracaoComponent } from './features/configuracao/configuracao.component';
import { EditarComponent } from './features/configuracao/editar/editar.component';
import { CriarComponent } from './features/configuracao/criar/criar.component';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'monitor/:id',
    component: MonitorComponent,
  },
  {
    path: '',
    children: [{
        path: 'configuracao',
        component: ConfiguracaoComponent
    },
    {
        path: 'editar/:id',
        component: EditarComponent

    },
    {
        path: 'criar',
        component: CriarComponent

    }
    ]
}
];
