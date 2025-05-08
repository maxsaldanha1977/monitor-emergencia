import { Routes } from '@angular/router';
import { MonitorComponent } from './components/monitor/monitor.component';
import { ConfiguracaoComponent } from './components/configuracao/configuracao.component';
import { EditarComponent } from './components/configuracao/editar/editar.component';
import { CriarComponent } from './components/configuracao/criar/criar.component';
import { LoginComponent } from './components/login/login.component';

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
