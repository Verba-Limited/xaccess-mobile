import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AuthApiService } from '../core/services/auth-api.service';
import { TokenStorageService } from '../core/services/token-storage.service';

@Component({
  selector: 'app-join-community',
  templateUrl: './join-community.page.html',
  styleUrls: ['./join-community.page.scss'],
  standalone: false,
})
export class JoinCommunityPage {
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly tokens: TokenStorageService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController,
  ) {
    this.form = this.fb.group({
      /** Estate slug, e.g. harmony-estate */
      slug: [''],
      /** Optional: paste UUID from estate manager */
      communityId: [''],
    });
  }

  async submit(): Promise<void> {
    const slug = this.form.get('slug')?.value?.trim() as string;
    const communityId = this.form.get('communityId')?.value?.trim() as string;

    if (!communityId && !slug) {
      void this.showToast('Enter an estate slug or community ID.', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Joining estate…' });
    await loading.present();

    const body = communityId ? { communityId } : { slug: slug!.toLowerCase() };

    this.authApi
      .joinCommunity(body)
      .pipe(finalize(() => void loading.dismiss()))
      .subscribe({
        next: (res) => {
          if (res.success && res.data?.accessToken && res.data.user) {
            this.tokens.persistSession(res.data.accessToken, res.data.user);
            void this.showToast('You are now linked to your estate.', 'success');
            void this.router.navigate(['/home'], { replaceUrl: true });
          } else {
            void this.showToast(res.message || 'Could not join', 'danger');
          }
        },
        error: (err: HttpErrorResponse) => {
          void this.showToast(this.errorMessage(err), 'danger');
        },
      });
  }

  goBack(): void {
    void this.router.navigate(['/home']);
  }

  private async showToast(message: string, color: string): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      duration: 3200,
      position: 'bottom',
      color,
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
