import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';

interface NotifPref {
  key: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}

const STORAGE_KEY = 'xaccess_notif_prefs';

@Component({
  selector: 'app-notifications-prefs',
  templateUrl: './notifications-prefs.page.html',
  styleUrls: ['./notifications-prefs.page.scss'],
  standalone: false,
})
export class NotificationsPrefsPage {
  prefs: NotifPref[] = [
    {
      key: 'security_alerts',
      label: 'Security Alerts',
      description: 'Call for help, incident reports, and emergency notifications.',
      icon: 'shield-checkmark-outline',
      enabled: true,
    },
    {
      key: 'visitor_access',
      label: 'Visitor & Access',
      description: 'When a visitor uses your access token to enter.',
      icon: 'people-outline',
      enabled: true,
    },
    {
      key: 'invoice_reminders',
      label: 'Invoice & Billing',
      description: 'Payment due dates, new invoices, and payment confirmations.',
      icon: 'receipt-outline',
      enabled: true,
    },
    {
      key: 'utility_updates',
      label: 'Utility Updates',
      description: 'Water and power control changes, usage summaries.',
      icon: 'flash-outline',
      enabled: true,
    },
    {
      key: 'estate_announcements',
      label: 'Estate Announcements',
      description: 'Messages and broadcasts from your estate manager.',
      icon: 'megaphone-outline',
      enabled: true,
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly toastCtrl: ToastController,
  ) {
    this.loadPrefs();
  }

  private loadPrefs(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedMap: Record<string, boolean> = JSON.parse(saved);
        this.prefs.forEach((p) => {
          if (savedMap[p.key] !== undefined) {
            p.enabled = savedMap[p.key];
          }
        });
      }
    } catch {
      // ignore parse errors
    }
  }

  async onToggle(pref: NotifPref): Promise<void> {
    const map: Record<string, boolean> = {};
    this.prefs.forEach((p) => (map[p.key] = p.enabled));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
      // storage unavailable
    }
    const label = pref.enabled ? 'enabled' : 'disabled';
    const t = await this.toastCtrl.create({
      message: `${pref.label} notifications ${label}.`,
      duration: 1800,
      position: 'bottom',
      color: pref.enabled ? 'success' : 'medium',
    });
    await t.present();
  }

  back(): void {
    this.router.navigate(['/profile']);
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
