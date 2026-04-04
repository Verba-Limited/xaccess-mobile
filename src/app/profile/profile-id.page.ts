import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { AuthApiService } from '../core/services/auth-api.service';
import { TokenStorageService } from '../core/services/token-storage.service';

@Component({
  selector: 'app-profile-id',
  templateUrl: './profile-id.page.html',
  styleUrls: ['./profile-id.page.scss'],
  standalone: false,
})
export class ProfileIdPage implements ViewWillEnter {
  userName = '—';
  /** Short label for display */
  userId = '—';
  private fullUserId = '';

  constructor(
    private readonly router: Router,
    private readonly authApi: AuthApiService,
    private readonly tokens: TokenStorageService,
  ) {}

  ionViewWillEnter(): void {
    const snap = this.tokens.getUserSnapshot();
    if (snap) {
      this.applySnapshot(snap.fullName, snap.id);
    }
    this.authApi.me().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.applySnapshot(res.data.fullName, res.data.id);
        }
      },
      error: () => {
        /* keep snapshot */
      },
    });
  }

  private applySnapshot(fullName: string, id: string): void {
    this.userName = fullName || '—';
    this.fullUserId = id;
    this.userId = id.length > 8 ? `${id.slice(0, 8)}…` : id;
  }

  get qrCodeData(): string {
    return `${this.userName}|${this.fullUserId || this.userId}`;
  }

  get qrCodeUrl(): string {
    const data = encodeURIComponent(this.qrCodeData);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
  }

  logout(): void {
    this.tokens.clearSession();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
