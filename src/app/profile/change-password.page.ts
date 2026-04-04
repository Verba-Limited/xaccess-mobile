import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AuthApiService } from '../core/services/auth-api.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
  standalone: false,
})
export class ChangePasswordPage {
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController,
  ) {
    this.form = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordMatchValidator(g: AbstractControl): { [key: string]: boolean } | null {
    const newPassword = g.get('newPassword')?.value;
    const confirmPassword = g.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async updatePassword(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const loading = await this.loadingCtrl.create({ message: 'Updating…' });
    await loading.present();
    const { currentPassword, newPassword } = this.form.value;
    this.authApi
      .changePassword({ currentPassword, newPassword })
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: (res) => {
          if (res.success) {
            void this.router.navigate(['/profile/account']);
          } else {
            void this.toastErr(res.message || 'Failed');
          }
        },
        error: (err: HttpErrorResponse) => void this.toastHttp(err),
      });
  }

  private async toastErr(message: string): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      duration: 3500,
      color: 'danger',
      position: 'bottom',
    });
    await t.present();
  }

  private async toastHttp(err: HttpErrorResponse): Promise<void> {
    const body = err.error as { message?: string | string[] } | null;
    let msg = err.message || 'Request failed';
    if (body?.message) {
      msg = Array.isArray(body.message) ? body.message.join(', ') : String(body.message);
    }
    await this.toastErr(msg);
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
