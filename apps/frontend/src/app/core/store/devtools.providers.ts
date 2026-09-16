import { EnvironmentProviders } from '@angular/core';
import { provideStoreDevtools } from '@ngrx/store-devtools';

export const devtoolsProviders: EnvironmentProviders[] = [
  provideStoreDevtools({
    maxAge: 25,
    autoPause: true,
  }),
];
