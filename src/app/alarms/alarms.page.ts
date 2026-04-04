import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController, ViewWillEnter } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import {
  IncidentsApiService,
  type IncidentDto,
} from '../core/services/incidents-api.service';

export interface AlarmCategory {
  id: string;
  title: string;
  description: string;
  iconPath: string;
}

@Component({
  selector: 'app-alarms',
  templateUrl: './alarms.page.html',
  styleUrls: ['./alarms.page.scss'],
  standalone: false,
})
export class AlarmsPage implements ViewWillEnter {
  readonly alarmCategories: AlarmCategory[] = [
    {
      id: 'FIRE',
      title: 'FIRE',
      description:
        'Any unusual situation which may cause an immediate fire or the hazardous products of fire, which in turn will create an unsafe environment.',
      iconPath: 'assets/images/alarms/Fire.png',
    },
    {
      id: 'MEDICAL',
      title: 'MEDICAL',
      description:
        "Acute injury or illness that poses an immediate risk to a person's life or long-term health",
      iconPath: 'assets/images/alarms/Medical-team.png',
    },
    {
      id: 'BURGLARY',
      title: 'BURGLARY',
      description:
        'Unlawful entry into a building or other location for the purposes of committing an offence',
      iconPath: 'assets/images/alarms/Burglary.png',
    },
    {
      id: 'ROBBERY',
      title: 'ROBBERY',
      description:
        'Unlawful entry into a building or other location for the purposes of committing an offence',
      iconPath: 'assets/images/alarms/Robber.png',
    },
    {
      id: 'KIDNAP',
      title: 'KIDNAP',
      description:
        'Unlawfully seizing and carrying away a person by force or Fraud, or seizing and detaining a person against his or her will',
      iconPath: 'assets/images/alarms/Kidnap.png',
    },
  ];

  recentIncidents: IncidentDto[] = [];
  historyLoading = false;

  constructor(
    private readonly router: Router,
    private readonly incidentsApi: IncidentsApiService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController,
  ) {}

  ionViewWillEnter(): void {
    this.loadHistory();
  }

  private loadHistory(): void {
    this.historyLoading = true;
    this.incidentsApi
      .listMine()
      .pipe(finalize(() => (this.historyLoading = false)))
      .subscribe({
        next: (rows) => {
          this.recentIncidents = rows.slice(0, 20);
        },
        error: () => {
          this.recentIncidents = [];
        },
      });
  }

  formatIncidentWhen(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  async callForHelp(category: AlarmCategory): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Sending alert…' });
    await loading.present();
    this.incidentsApi
      .create({ category: category.id, notes: category.title })
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: async () => {
          this.loadHistory();
          const t = await this.toastCtrl.create({
            message: 'Estate security has been notified.',
            duration: 3000,
            position: 'bottom',
            color: 'success',
          });
          await t.present();
        },
        error: async () => {
          const t = await this.toastCtrl.create({
            message: 'Could not send alert. Try again or call security.',
            duration: 4000,
            position: 'bottom',
            color: 'danger',
          });
          await t.present();
        },
      });
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
