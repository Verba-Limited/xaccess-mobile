import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingController, ToastController, ViewWillEnter } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AuthApiService } from '../core/services/auth-api.service';
import { UsersApiService } from '../core/services/users-api.service';
import { TokenStorageService } from '../core/services/token-storage.service';

@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.page.html',
  styleUrls: ['./edit-account.page.scss'],
  standalone: false,
})
export class EditAccountPage implements ViewWillEnter {
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly usersApi: UsersApiService,
    private readonly tokens: TokenStorageService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController,
  ) {
    const u = this.tokens.getUserSnapshot();
    this.form = this.fb.group({
      name: [u?.fullName ?? '', Validators.required],
      mobileNumber: [u?.phone ?? ''],
      email: [{ value: u?.email ?? '', disabled: true }],
      address: [u?.unitLabel ?? ''],
    });
  }

  ionViewWillEnter(): void {
    this.authApi.me().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const u = res.data;
          this.tokens.setUserSnapshot(u);
          this.form.patchValue({
            name: u.fullName,
            mobileNumber: u.phone ?? '',
            email: u.email,
            address: u.unitLabel ?? '',
          });
        }
      },
      error: () => { /* keep existing form values */ },
    });
  }

  async done(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const loading = await this.loadingCtrl.create({ message: 'Saving…' });
    await loading.present();
    const v = this.form.getRawValue();
    this.usersApi
      .patchMe({
        fullName: v.name?.trim(),
        phone: v.mobileNumber?.trim() || null,
        unitLabel: v.address?.trim() || null,
      })
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: (user) => {
          const token = this.tokens.getAccessToken();
          if (token) {
            this.tokens.persistSession(token, user);
          }
          void this.router.navigate(['/profile/account']);
        },
        error: (err: HttpErrorResponse) => {
          void this.toastErr(err);
        },
      });
  }

  private async toastErr(err: HttpErrorResponse): Promise<void> {
    const body = err.error as { message?: string | string[] } | null;
    let msg = 'Could not save';
    if (body?.message) {
      msg = Array.isArray(body.message) ? body.message.join(', ') : String(body.message);
    }
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 3500,
      color: 'danger',
      position: 'bottom',
    });
    await t.present();
  }

  changePassword(): void {
    this.router.navigate(['/profile/account/change-password']);
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
