import { Routes } from '@angular/router';
import { LoginComponent } from './module/features/login/login.component';
import { MonitorComponent } from './module/features/monitor/monitor.component';
import { ConfiguracaoComponent } from './module/features/configuracao/configuracao.component';
import { EditarComponent } from './module/features/configuracao/editar/editar.component';
import { CriarComponent } from './module/features/configuracao/criar/criar.component';

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
