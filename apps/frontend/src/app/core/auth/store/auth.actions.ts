import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from './../models/auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ email: string; password: string }>(),
    'Login success': props<{ user: User }>(),
    'Login failure': props<{ error: string }>(),
    'Refresh success': props<{ user: User }>(),

    Logout: emptyProps(),
    'Logout success': emptyProps(),
  },
});
