import { Routes } from '@angular/router';

import { RatesConfigComponent } from './contract-management/rates-config/rates-config.component';
import { ContractListComponent } from './contract-management/contract-list/contract-list.component';
import { ContractFormComponent } from './contract-management/contract-form/contract-form.component';

export const contractRoutes: Routes = [
  {
    path: 'contracts',
    children: [
      {
        path: '',
        component: ContractListComponent,
      },
      {
        path: 'new',
        component: ContractFormComponent,
      },
      {
        path: ':id',
        component: ContractFormComponent,
        children: [
          {
            path: 'rates',
            component: RatesConfigComponent,
          }
        ]
      }
    ]
  }
];
