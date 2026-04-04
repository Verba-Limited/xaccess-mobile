import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import {
  EmergencyApiService,
  EmergencyContactRow,
} from '../core/services/emergency-api.service';
import { TokenStorageService } from '../core/services/token-storage.service';

export interface EmergencyContact {
  name: string;
  phone: string;
}

@Component({
  selector: 'app-ice',
  templateUrl: './ice.page.html',
  styleUrls: ['./ice.page.scss'],
  standalone: false,
})
export class IcePage implements ViewWillEnter {
  contacts: EmergencyContact[] = [];
  loading = false;

  constructor(
    private readonly router: Router,
    private readonly emergencyApi: EmergencyApiService,
    private readonly tokens: TokenStorageService,
  ) {}

  ionViewWillEnter(): void {
    const cid = this.tokens.getUserSnapshot()?.communityId ?? null;
    this.loading = true;
    this.emergencyApi
      .list(cid)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rows: EmergencyContactRow[]) => {
          this.contacts = rows.map((r) => ({
            name: r.label,
            phone: r.phone,
          }));
        },
        error: () => {
          this.contacts = [];
        },
      });
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
