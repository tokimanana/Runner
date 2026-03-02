import { User } from './../models/auth.model';
import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ email: string; password: string }>(),
    'Login success': props<{ user: User; accessToken: string }>(),
    'Login failure': props<{ error: string }>(),

    Logout: emptyProps(),
    'Logout success': emptyProps(),
  },
});
