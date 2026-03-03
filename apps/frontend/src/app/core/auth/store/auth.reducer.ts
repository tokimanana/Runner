import { createReducer, on } from '@ngrx/store';
import { initialAuthState } from './auth.state';
import { AuthActions } from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user, accessToken }) => ({
    ...state,
    isLoading: false,
    user,
    accessToken,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),
  on(AuthActions.logout, () => initialAuthState)
);
