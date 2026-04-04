import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import {
  AuthApiService,
  PublicCommunityOption,
} from '../core/services/auth-api.service';
import { TokenStorageService } from '../core/services/token-storage.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
  standalone: false,
})
export class SignUpPage implements OnInit {
  form: FormGroup;
  showPassword = false;
  communities: PublicCommunityOption[] = [];
  communitiesLoading = true;
  communitiesError: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly tokens: TokenStorageService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController,
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      communityId: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit(): void {
    this.authApi.getPublicCommunities().subscribe({
      next: (res) => {
        this.communitiesLoading = false;
        if (res.success && Array.isArray(res.data)) {
          this.communities = res.data;
          if (this.communities.length > 0) {
            this.form
              .get('communityId')
              ?.setValidators([Validators.required]);
            this.form.get('communityId')?.updateValueAndValidity();
          }
        } else {
          this.communitiesError = res.message || 'Could not load communities';
        }
      },
      error: () => {
        this.communitiesLoading = false;
        this.communitiesError = 'Could not load communities. Try again later.';
      },
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  continueWithGoogle(): void {
    // TODO: Implement Google sign-in
    console.log('Continue with Google');
  }

  async createAccount(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const loading = await this.loadingCtrl.create({ message: 'Creating account...' });
    await loading.present();
    const { fullName, email, password, communityId } = this.form.value;
    this.authApi
      .register({
        fullName,
        email,
        password,
        communityId: communityId || undefined,
      })
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: (res) => {
          if (res.success && res.data?.accessToken && res.data.user) {
            this.tokens.persistSession(res.data.accessToken, res.data.user);
            void this.router.navigate(['/home']);
          } else {
            void this.showToast(res.message || 'Registration failed');
          }
        },
        error: (err: HttpErrorResponse) => {
          void this.showToast(this.errorMessage(err));
        },
      });
  }

  goToLogIn(): void {
    void this.router.navigate(['/login']);
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
