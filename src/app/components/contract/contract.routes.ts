import { Routes } from '@angular/router';
import { ContractComponent } from './contract.component';
import { ContractFormComponent } from './contract-form/contract-form.component';
import { SeasonRoomRatesComponent } from './season-room-rates/season-room-rates.component';

export const contractRoutes: Routes = [
  {
    path: 'contracts',
    component: ContractComponent,
    children: [
      {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
      },
      {
        path: 'list',
        component: ContractComponent
      },
      {
        path: 'new',
        component: ContractFormComponent
      },
      {
        path: 'edit/:id',
        component: ContractFormComponent
      },
      {
        path: ':id/rates/:seasonId',
        component: SeasonRoomRatesComponent
      }
    ]
  }
];
