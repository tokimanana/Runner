import { AuthActions } from '@/app/core/auth/store/auth.actions';
import {
  selectAuthError,
  selectIsLoading,
} from '@/app/core/auth/store/auth.selectors';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Store } from '@ngrx/store';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    InputText,
    Message,
    Password,
    Button,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  isLoading$: Observable<boolean> = this.store.select(selectIsLoading);
  error$: Observable<string | null> = this.store.select(selectAuthError);

  onLogin(): void {
    this.loginForm.markAllAsTouched();

    if (this.loginForm.valid) {
      this.store.dispatch(
        AuthActions.login({
          email: this.email?.value,
          password: this.password?.value,
        })
      );
    }
  }
}
