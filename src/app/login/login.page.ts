import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AuthApiService } from '../core/services/auth-api.service';
import { TokenStorageService } from '../core/services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  form: FormGroup;
  showPassword = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly tokens: TokenStorageService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false],
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  continueWithGoogle(): void {
    // TODO: Implement Google sign-in
    console.log('Continue with Google');
  }

  async logIn(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const loading = await this.loadingCtrl.create({ message: 'Signing in...' });
    await loading.present();
    const { email, password } = this.form.value;
    this.authApi
      .login({ email, password })
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: (res) => {
          if (res.success && res.data?.accessToken && res.data.user) {
            this.tokens.persistSession(res.data.accessToken, res.data.user);
            void this.router.navigate(['/home']);
          } else {
            void this.showToast(res.message || 'Login failed');
          }
        },
        error: (err: HttpErrorResponse) => {
          void this.showToast(this.errorMessage(err));
        },
      });
  }

  forgotPassword(): void {
    // TODO: Navigate to forgot-password or show modal
    console.log('Forgot password');
  }

  goToSignUp(): void {
    void this.router.navigate(['/sign-up']);
  }

  private async showToast(message: string): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      duration: 3500,
      position: 'bottom',
      color: 'danger',
    });
    await t.present();
  }

  private errorMessage(err: HttpErrorResponse): string {
    const body = err.error as { message?: string | string[] } | null;
    if (body?.message != null) {
      const m = body.message;
      return Array.isArray(m) ? m.join(', ') : String(m);
    }
    return err.message || 'Request failed';
  }
}
