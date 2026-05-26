import { Component, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Header } from '../../layout/header/header';
import { Hero } from '../../layout/hero/hero';

type RegisterForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
  repeatPassword: FormControl<string>;
}>;

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const repeatPassword = control.get('repeatPassword')?.value;

  if (!password || !repeatPassword || password === repeatPassword) {
    return null;
  }

  return { passwordMismatch: true };
};

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, Header, Hero],
  styleUrl: './register.scss',
  template: `
    <app-header
      [links]="[]"
      actionLabel="Back home"
      actionRoute="/"
      navLabel="Register navigation"
      brandMode="route"
      brandRoute="/"
    />

    <app-hero
      eyebrow="Start creating"
      heading="Create your Postly account"
      description="Set up your workspace and start planning, drafting, and publishing in one calm flow."
      [showActions]="false"
      [customPanel]="true"
      panelCaption="Register form"
    >
      <div hero-panel class="media-slot register-panel">
        <form class="register-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="register-form__intro">
            <p class="register-form__eyebrow">Account setup</p>
          </div>

          <div class="field">
            <label class="field__label" for="email">Email</label>
            <input
              id="email"
              class="field__input"
              type="email"
              formControlName="email"
              autocomplete="email"
              placeholder="you@company.com"
            />
            @if (email.invalid && (email.touched || email.dirty)) {
              <p class="field__error">Enter a valid email address.</p>
            }
          </div>

          <div class="field">
            <label class="field__label" for="password">Password</label>
            <input
              id="password"
              class="field__input"
              type="password"
              formControlName="password"
              autocomplete="new-password"
              placeholder="Create a password"
            />
            @if (password.invalid && (password.touched || password.dirty)) {
              <p class="field__error">Password must be at least 8 characters long.</p>
            }
          </div>

          <div class="field">
            <label class="field__label" for="repeat-password">Repeat password</label>
            <input
              id="repeat-password"
              class="field__input"
              type="password"
              formControlName="repeatPassword"
              autocomplete="new-password"
              placeholder="Repeat your password"
            />
            @if (repeatPassword.invalid && (repeatPassword.touched || repeatPassword.dirty)) {
              <p class="field__error">Please repeat your password.</p>
            } @else if (form.hasError('passwordMismatch') && (repeatPassword.touched || repeatPassword.dirty)) {
              <p class="field__error">Passwords do not match.</p>
            }
          </div>

          <button type="submit" class="btn btn--primary submit-btn">Create account</button>

          <p class="auth-switch">
            Already have an account?
            <a routerLink="/login" class="auth-switch__link">Log in</a>
          </p>

          @if (submitted()) {
            <p class="form-status" role="status">
              Registration form submitted. Connect this screen to your sign-up flow next.
            </p>
          }
        </form>
      </div>
    </app-hero>
  `,
})
export class RegisterPage {
  protected readonly form: RegisterForm = new FormGroup(
    {
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      repeatPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordsMatchValidator }
  );

  protected readonly submitted = signal(false);

  protected get email(): FormControl<string> {
    return this.form.controls.email;
  }

  protected get password(): FormControl<string> {
    return this.form.controls.password;
  }

  protected get repeatPassword(): FormControl<string> {
    return this.form.controls.repeatPassword;
  }

  protected submit(): void {
    this.submitted.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.set(true);
  }
}
