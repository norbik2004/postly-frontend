import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Header } from '../../layout/header/header';
import { Hero } from '../../layout/hero/hero';

type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
  remember: FormControl<boolean>;
}>;

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink, Header, Hero],
  styleUrl: './login.scss',
  template: `
    <app-header
      [links]="[]"
      actionLabel="Back home"
      actionRoute="/"
      navLabel="Login navigation"
      brandMode="route"
      brandRoute="/"
    />

    <app-hero
      eyebrow="Welcome back"
      heading="Log in to your publishing hub"
      description="Jump back into drafts, approvals, and campaigns without losing momentum."
      [showActions]="false"
      [customPanel]="true"
      panelCaption="Login form"
    >
      <div hero-panel class="media-slot login-panel">
        <form class="login-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="login-form__intro">
            <p class="login-form__eyebrow">Account access</p>
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
              autocomplete="current-password"
              placeholder="Enter your password"
            />
            @if (password.invalid && (password.touched || password.dirty)) {
              <p class="field__error">Password must be at least 8 characters long.</p>
            }
          </div>

          <label class="remember-me">
            <input type="checkbox" formControlName="remember" />
            <span>Keep me signed in</span>
          </label>

          <div class="auth-actions">
            <button type="submit" class="btn btn--primary submit-btn">Log in</button>
          </div>

          <p class="auth-switch">
            New to Postly?
            <a routerLink="/register" class="auth-switch__link">Create an account</a>
          </p>

          @if (submitted()) {
            <p class="form-status" role="status">
              Login form submitted. Connect this screen to your authentication flow next.
            </p>
          }
        </form>
      </div>
    </app-hero>
  `,
})
export class LoginPage {
  protected readonly form: LoginForm = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    remember: new FormControl(false, { nonNullable: true }),
  });

  protected readonly submitted = signal(false);

  protected get email(): FormControl<string> {
    return this.form.controls.email;
  }

  protected get password(): FormControl<string> {
    return this.form.controls.password;
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
