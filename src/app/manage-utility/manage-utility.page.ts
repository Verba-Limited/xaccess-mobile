import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { ToastController, ViewWillEnter, ViewWillLeave } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import {
  UtilitiesApiService,
  type UsageChartPoint,
  type UtilityAvailabilityGate,
  type UtilityPeriod,
  type UtilityPreferences,
  type ResidentUtilitySubscription,
} from '../core/services/utilities-api.service';

@Component({
  selector: 'app-manage-utility',
  templateUrl: './manage-utility.page.html',
  styleUrls: ['./manage-utility.page.scss'],
  standalone: false,
})
export class ManageUtilityPage implements ViewWillEnter, ViewWillLeave {
  period: UtilityPeriod = 'Annual';
  waterControlOn = true;
  powerControlOn = true;

  chartPoints: UsageChartPoint[] = [];
  totalsElectricityKwh = 0;
  totalsWaterM3 = 0;
  latestMonthLabel = '—';

  loading = false;
  prefsBusy = false;
  payBusy = false;
  paystackBusy = false;
  verifyBusy = false;
  loadError: string | null = null;

  subscription: ResidentUtilitySubscription | null = null;
  utilityGate: UtilityAvailabilityGate | null = null;

  /** Set after Paystack initialize; clear after successful verify. */
  pendingPaystackRef: string | null = null;

  /** Avoid PATCH when Ionic fires ionChange after hydrating from API */
  private prefsHydrated = false;

  constructor(
    private readonly router: Router,
    private readonly utilitiesApi: UtilitiesApiService,
    private readonly toastCtrl: ToastController,
  ) {}

  ionViewWillEnter(): void {
    this.loadAll();
  }

  ionViewWillLeave(): void {
    void Browser.close().catch(() => undefined);
  }

  private loadAll(): void {
    this.prefsHydrated = false;
    this.loading = true;
    this.loadError = null;
    forkJoin({
      prefs: this.utilitiesApi.getPreferences(),
      usage: this.utilitiesApi.getUsage(null),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ prefs, usage }) => {
          this.applyPreferencesPayload(prefs);
          this.applyUsageReport(usage);
          setTimeout(() => {
            this.prefsHydrated = true;
          }, 400);
        },
        error: (err: HttpErrorResponse) => {
          this.chartPoints = [];
          this.totalsElectricityKwh = 0;
          this.totalsWaterM3 = 0;
          if (err.status === 403) {
            this.loadError = 'Utility management is available for resident accounts.';
          } else if (err.status === 400) {
            this.loadError = 'Join a community to view utility usage.';
          } else {
            this.loadError = 'Could not load utility data.';
          }
        },
      });
  }

  private applyPreferencesPayload(prefs: UtilityPreferences): void {
    this.period = (prefs.periodLabel as UtilityPeriod) ?? 'Annual';
    this.subscription = prefs.subscription ?? null;
    this.utilityGate = prefs.utilityGate ?? null;
    const g = prefs.utilityGate;
    this.waterControlOn =
      prefs.waterControlOn && (g == null || g.canUseWater);
    this.powerControlOn =
      prefs.powerControlOn && (g == null || g.canUsePower);
  }

  private applyUsageReport(report: {
    period: UtilityPeriod;
    points: UsageChartPoint[];
    totals: { electricityKwh: number; waterM3: number };
    latestMonth: string | null;
  }): void {
    this.chartPoints = report.points.length ? report.points : [];
    this.totalsElectricityKwh = report.totals.electricityKwh;
    this.totalsWaterM3 = report.totals.waterM3;
    this.latestMonthLabel = report.latestMonth
      ? this.formatMonthYear(report.latestMonth)
      : '—';
  }

  private formatMonthYear(ym: string): string {
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, (m || 1) - 1, 1);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  /** Water volume for legend: m³ → liters (approx.) */
  get waterLitersDisplay(): string {
    const liters = Math.round(this.totalsWaterM3 * 1000);
    return liters.toLocaleString('en-US');
  }

  get electricityDisplay(): string {
    return `${this.totalsElectricityKwh.toLocaleString('en-US', { maximumFractionDigits: 1 })} kWh`;
  }

  onPeriodChange(): void {
    if (!this.prefsHydrated) return;
    this.patchPrefs({ periodLabel: this.period }, true);
  }

  onWaterToggle(): void {
    if (!this.prefsHydrated) return;
    if (this.waterControlOn && this.utilityGate && !this.utilityGate.canUseWater) {
      this.waterControlOn = false;
      return;
    }
    this.patchPrefs({ waterControlOn: this.waterControlOn }, false);
  }

  onPowerToggle(): void {
    if (!this.prefsHydrated) return;
    if (this.powerControlOn && this.utilityGate && !this.utilityGate.canUsePower) {
      this.powerControlOn = false;
      return;
    }
    this.patchPrefs({ powerControlOn: this.powerControlOn }, false);
  }

  private patchPrefs(
    body: Partial<{
      periodLabel: string;
      waterControlOn: boolean;
      powerControlOn: boolean;
    }>,
    refetchUsage: boolean,
  ): void {
    if (this.prefsBusy) return;
    this.prefsBusy = true;
    this.utilitiesApi.patchPreferences(body).subscribe({
      next: (p) => {
        this.applyPreferencesPayload(p);
        if (refetchUsage) {
          this.utilitiesApi.getUsage(null).subscribe({
            next: (r) => {
              this.applyUsageReport(r);
              this.prefsBusy = false;
            },
            error: async () => {
              this.prefsBusy = false;
              await this.toastLoadError();
            },
          });
        } else {
          this.prefsBusy = false;
        }
      },
      error: async (err: HttpErrorResponse) => {
        this.prefsBusy = false;
        const msg =
          (err.error as { message?: string })?.message ??
          err.message ??
          'Could not save preferences.';
        const t = await this.toastCtrl.create({
          message: msg,
          duration: 2500,
          color: 'danger',
          position: 'bottom',
        });
        await t.present();
      },
    });
  }

  get waterToggleDisabled(): boolean {
    return (
      this.prefsBusy ||
      (!this.waterControlOn &&
        !!this.utilityGate &&
        !this.utilityGate.canUseWater)
    );
  }

  get powerToggleDisabled(): boolean {
    return (
      this.prefsBusy ||
      (!this.powerControlOn &&
        !!this.utilityGate &&
        !this.utilityGate.canUsePower)
    );
  }

  get measurementPeriodLabel(): string {
    const m = this.subscription?.measurementPeriod;
    if (m === 'DAY') return 'Daily';
    if (m === 'WEEK') return 'Weekly';
    if (m === 'MONTH') return 'Monthly';
    if (m === 'YEAR') return 'Yearly';
    return '—';
  }

  formatMoney(minor: number, currency: string): string {
    const major = minor / 100;
    return `${currency} ${major.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  onPayWithPaystack(): void {
    if (this.paystackBusy || this.payBusy) return;
    this.paystackBusy = true;
    this.utilitiesApi
      .initializePaystackUtility()
      .pipe(finalize(() => (this.paystackBusy = false)))
      .subscribe({
        next: async (init) => {
          this.pendingPaystackRef = init.reference;
          try {
            if (Capacitor.isNativePlatform()) {
              await Browser.open({
                url: init.authorizationUrl,
                presentationStyle: 'fullscreen',
                toolbarColor: '#011b33',
              });
              const t = await this.toastCtrl.create({
                message:
                  'Complete payment on Paystack, then return here and tap Confirm Paystack payment.',
                duration: 6000,
                position: 'bottom',
                color: 'medium',
              });
              await t.present();
            } else {
              const w = window.open(
                init.authorizationUrl,
                '_blank',
                'noopener,noreferrer',
              );
              if (w == null) {
                this.pendingPaystackRef = null;
                const t = await this.toastCtrl.create({
                  message:
                    'Could not open Paystack (popup blocked). Allow popups for this site or use the mobile app.',
                  color: 'danger',
                  duration: 5500,
                  position: 'bottom',
                });
                await t.present();
                return;
              }
              const t = await this.toastCtrl.create({
                message:
                  'Paystack opened in a new tab. Pay there, then tap Confirm Paystack payment here.',
                duration: 6000,
                position: 'bottom',
                color: 'medium',
              });
              await t.present();
            }
          } catch (e) {
            this.pendingPaystackRef = null;
            const t = await this.toastCtrl.create({
              message:
                e instanceof Error ? e.message : 'Could not open Paystack checkout.',
              color: 'danger',
              duration: 3500,
              position: 'bottom',
            });
            await t.present();
          }
        },
        error: async (err: HttpErrorResponse) => {
          this.pendingPaystackRef = null;
          const msg =
            (err.error as { message?: string })?.message ??
            err.message ??
            'Could not start Paystack checkout.';
          const t = await this.toastCtrl.create({
            message: msg,
            color: 'danger',
            duration: 4500,
            position: 'bottom',
          });
          await t.present();
        },
      });
  }

  onConfirmPaystackPayment(): void {
    if (!this.pendingPaystackRef || this.verifyBusy) return;
    this.verifyBusy = true;
    const ref = this.pendingPaystackRef;
    this.utilitiesApi
      .verifyPaystackUtility(ref)
      .pipe(
        switchMap(() =>
          forkJoin({
            prefs: this.utilitiesApi.getPreferences(),
            usage: this.utilitiesApi.getUsage(null),
          }),
        ),
        finalize(() => (this.verifyBusy = false)),
      )
      .subscribe({
        next: async ({ prefs, usage }) => {
          this.pendingPaystackRef = null;
          void Browser.close().catch(() => undefined);
          this.applyPreferencesPayload(prefs);
          this.applyUsageReport(usage);
          const t = await this.toastCtrl.create({
            message: 'Payment confirmed. Your prepaid utilities are unlocked.',
            duration: 3200,
            color: 'success',
            position: 'bottom',
          });
          await t.present();
        },
        error: async (err: HttpErrorResponse) => {
          const msg =
            (err.error as { message?: string })?.message ??
            err.message ??
            'Could not confirm payment.';
          const t = await this.toastCtrl.create({
            message: msg,
            color: 'danger',
            duration: 4500,
            position: 'bottom',
          });
          await t.present();
        },
      });
  }

  onPaySubscription(): void {
    if (this.payBusy || this.paystackBusy) return;
    this.payBusy = true;
    this.utilitiesApi
      .payUtilitySubscription()
      .pipe(
        switchMap(() =>
          forkJoin({
            prefs: this.utilitiesApi.getPreferences(),
            usage: this.utilitiesApi.getUsage(null),
          }),
        ),
        finalize(() => (this.payBusy = false)),
      )
      .subscribe({
        next: ({ prefs, usage }) => {
          this.applyPreferencesPayload(prefs);
          this.applyUsageReport(usage);
        },
        error: async (err: HttpErrorResponse) => {
          const msg =
            (err.error as { message?: string })?.message ??
            err.message ??
            'Payment could not be completed.';
          const t = await this.toastCtrl.create({
            message: msg,
            duration: 2800,
            color: 'danger',
            position: 'bottom',
          });
          await t.present();
        },
      });
  }

  private async toastLoadError(): Promise<void> {
    const t = await this.toastCtrl.create({
      message: 'Could not refresh chart.',
      duration: 2200,
      color: 'danger',
      position: 'bottom',
    });
    await t.present();
  }

  onCenterAction(): void {
    void this.router.navigate(['/home']);
  }

  trackByLabel(_i: number, p: UsageChartPoint): string {
    return `${p.label}-${p.yearMonth ?? ''}`;
  }
}
