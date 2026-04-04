import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { TokenStorageService } from '../core/services/token-storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage {
  constructor(
    private readonly router: Router,
    private readonly tokens: TokenStorageService,
    private readonly toastCtrl: ToastController,
  ) {}

  async openSettings(): Promise<void> {
    const t = await this.toastCtrl.create({
      message: 'Settings will be available in a future update.',
      duration: 2500,
      position: 'bottom',
    });
    await t.present();
  }

  openProfileId(): void {
    this.router.navigate(['/profile/id']);
  }

  openAccount(): void {
    this.router.navigate(['/profile/account']);
  }

  async openNotifications(): Promise<void> {
    const t = await this.toastCtrl.create({
      message: 'Notification preferences will be available in a future update.',
      duration: 2500,
      position: 'bottom',
    });
    await t.present();
  }

  logout(): void {
    this.tokens.clearSession();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
