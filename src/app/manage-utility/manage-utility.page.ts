import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController, ViewWillEnter } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { UtilitiesApiService } from '../core/services/utilities-api.service';

@Component({
  selector: 'app-manage-utility',
  templateUrl: './manage-utility.page.html',
  styleUrls: ['./manage-utility.page.scss'],
  standalone: false,
})
export class ManageUtilityPage implements ViewWillEnter {
  period = 'Annual';
  waterControlOn = true;
  powerControlOn = true;

  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  chartData: { power: number; water: number }[] = [];
  loading = false;
  prefsBusy = false;
  /** Avoid PATCH when Ionic fires ionChange after hydrating from API */
  private prefsHydrated = false;

  constructor(
    private readonly router: Router,
    private readonly utilitiesApi: UtilitiesApiService,
    private readonly toastCtrl: ToastController,
  ) {}

  ionViewWillEnter(): void {
    this.prefsHydrated = false;
    this.loading = true;
    forkJoin({
      series: this.utilitiesApi.getUsage(),
      prefs: this.utilitiesApi.getPreferences(),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ series, prefs }) => {
          this.period = prefs.periodLabel;
          this.waterControlOn = prefs.waterControlOn;
          this.powerControlOn = prefs.powerControlOn;
          setTimeout(() => {
            this.prefsHydrated = true;
          }, 400);
          this.chartData = series.map((p) => ({
            power: Math.min(100, Math.round(p.power)),
            water: Math.min(100, Math.round(p.water)),
          }));
          if (this.chartData.length === 0) {
            this.chartData = Array.from({ length: 12 }, () => ({
              power: 0,
              water: 0,
            }));
          }
        },
        error: () => {
          this.chartData = Array.from({ length: 12 }, () => ({
            power: 0,
            water: 0,
          }));
        },
      });
  }

  onPeriodChange(): void {
    if (!this.prefsHydrated) return;
    this.patchPrefs({ periodLabel: this.period });
  }

  onWaterToggle(): void {
    if (!this.prefsHydrated) return;
    this.patchPrefs({ waterControlOn: this.waterControlOn });
  }

  onPowerToggle(): void {
    if (!this.prefsHydrated) return;
    this.patchPrefs({ powerControlOn: this.powerControlOn });
  }

  private patchPrefs(
    body: Partial<{ periodLabel: string; waterControlOn: boolean; powerControlOn: boolean }>,
  ): void {
    if (this.prefsBusy) return;
    this.prefsBusy = true;
    this.utilitiesApi.patchPreferences(body).subscribe({
      next: (p) => {
        this.period = p.periodLabel;
        this.waterControlOn = p.waterControlOn;
        this.powerControlOn = p.powerControlOn;
        this.prefsBusy = false;
      },
      error: async () => {
        this.prefsBusy = false;
        const t = await this.toastCtrl.create({
          message: 'Could not save preferences.',
          duration: 2500,
          color: 'danger',
          position: 'bottom',
        });
        await t.present();
      },
    });
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
