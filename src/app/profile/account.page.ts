import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AuthApiService } from '../core/services/auth-api.service';
import { TokenStorageService } from '../core/services/token-storage.service';
import { PublicUser } from '../core/models/api-response.model';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: false,
})
export class AccountPage implements ViewWillEnter {
  showPassword = false;
  user: PublicUser | null = null;
  loading = false;

  constructor(
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly tokens: TokenStorageService,
  ) {}

  ionViewWillEnter(): void {
    this.user = this.tokens.getUserSnapshot();
    this.loading = true;
    this.authApi
      .me()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.user = res.data;
            this.tokens.setUserSnapshot(res.data);
          }
        },
        error: () => {
          this.user = this.tokens.getUserSnapshot();
        },
      });
  }

  edit(): void {
    this.router.navigate(['/profile/account/edit']);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
