import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  LoadingController,
  ToastController,
  ViewWillEnter,
} from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AccessApiService } from '../core/services/access-api.service';
import type { AccessTokenSummaryDto, CreateAccessTokenRequest } from '../core/models/access.models';

type AccessType = 'one-time' | 'multi-entry' | 'event';

/** Row for “Access History” tab — issued tokens */
export interface TokenListItem {
  tokenId: string;
  id: string;
  name: string;
  status: string;
  datetime: string;
}

function startOfDayIso(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  return new Date(`${dateStr}T00:00:00`).toISOString();
}

function endOfDayIso(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  return new Date(`${dateStr}T23:59:59.999`).toISOString();
}

function mapTokenStatus(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'REVOKED':
      return 'Revoked';
    case 'EXPIRED':
      return 'Expired';
    default:
      return status;
  }
}

function formatTokenDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const datePart = d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} • ${timePart}`;
}

function summaryToRow(t: AccessTokenSummaryDto): TokenListItem {
  const short = t.id.replace(/-/g, '').slice(0, 8).toUpperCase();
  return {
    tokenId: t.id,
    id: short,
    name: t.guestName?.trim() || 'Guest access',
    status: mapTokenStatus(t.status),
    datetime: formatTokenDateTime(t.createdAt),
  };
}

@Component({
  selector: 'app-access-control',
  templateUrl: './access-control.page.html',
  styleUrls: ['./access-control.page.scss'],
  standalone: false,
})
export class AccessControlPage implements ViewWillEnter {
  activeTab: 'generate' | 'history' = 'generate';
  selectedAccessType: AccessType = 'one-time';
  form: FormGroup;
  eventForm: FormGroup;

  historySearch = '';
  tokenRows: TokenListItem[] = [];
  tokensLoading = false;
  tokensError: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly actionSheetCtrl: ActionSheetController,
    private readonly accessApi: AccessApiService,
    private readonly loadingCtrl: LoadingController,
    private readonly toastCtrl: ToastController,
    private readonly alertCtrl: AlertController,
  ) {
    this.form = this.fb.group({
      apartment: ['', Validators.required],
      guestName: ['', Validators.required],
      arrivalDate: ['', Validators.required],
      validityFrom: ['', Validators.required],
      validityTo: ['', Validators.required],
      shareQrCode: [true],
    });
    this.eventForm = this.fb.group({
      apartment: ['', Validators.required],
      eventName: ['', Validators.required],
      eventDateFrom: ['', Validators.required],
      eventDateTo: ['', Validators.required],
      arrivalTimeFrom: ['', Validators.required],
      arrivalTimeTo: ['', Validators.required],
      eventLocation: ['', Validators.required],
    });
  }

  ionViewWillEnter(): void {
    this.loadTokens();
  }

  get filteredTokenRows(): TokenListItem[] {
    const q = this.historySearch.trim().toLowerCase();
    if (!q) return this.tokenRows;
    return this.tokenRows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    );
  }

  setTab(tab: 'generate' | 'history'): void {
    this.activeTab = tab;
    if (tab === 'history') {
      this.loadTokens();
    }
  }

  selectAccessType(type: AccessType): void {
    this.selectedAccessType = type;
  }

  async generateToken(): Promise<void> {
    const body = this.buildCreatePayload();
    if (!body) return;

    const loading = await this.loadingCtrl.create({ message: 'Generating…' });
    await loading.present();

    this.accessApi
      .createToken(body)
      .pipe(finalize(() => void loading.dismiss()))
      .subscribe({
        next: (res) => {
          void this.presentTokenCreatedAlert(res.token);
          this.loadTokens();
        },
        error: (err: HttpErrorResponse | Error) => void this.handleHttpError(err, 'Could not create token'),
      });
  }

  private buildCreatePayload(): CreateAccessTokenRequest | null {
    const methods = { qr: true, password: false, rfid: false };

    if (this.selectedAccessType === 'event') {
      if (this.eventForm.invalid) {
        this.eventForm.markAllAsTouched();
        return null;
      }
      const v = this.eventForm.value as {
        apartment: string;
        eventName: string;
        eventLocation: string;
        eventDateFrom: string;
        eventDateTo: string;
      };
      const guestName = `${v.eventName} @ ${v.eventLocation} (${v.apartment})`;
      return {
        type: 'EVENT',
        methods,
        guestName,
        validFrom: startOfDayIso(v.eventDateFrom),
        validTo: endOfDayIso(v.eventDateTo),
      };
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return null;
    }

    const v = this.form.value as {
      apartment: string;
      guestName: string;
      arrivalDate: string;
      validityFrom: string;
      validityTo: string;
    };
    const guestLabel = v.guestName.trim();
    const apt = v.apartment.trim();
    const guestName = apt ? `${guestLabel} (${apt})` : guestLabel;

    const type: CreateAccessTokenRequest['type'] =
      this.selectedAccessType === 'multi-entry' ? 'PERMANENT' : 'TEMPORARY';

    const validFrom = startOfDayIso(v.arrivalDate || v.validityFrom);
    const validTo = endOfDayIso(v.validityTo);

    return {
      type,
      methods,
      guestName,
      validFrom,
      validTo,
    };
  }

  private async presentTokenCreatedAlert(plainToken: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Access token created',
      subHeader: 'Copy and store it securely. It cannot be shown again.',
      message: plainToken,
      buttons: [
        {
          text: 'Copy',
          handler: () => {
            void this.copyText(plainToken);
          },
        },
        'OK',
      ],
    });
    await alert.present();
  }

  private loadTokens(): void {
    this.tokensLoading = true;
    this.tokensError = null;
    this.accessApi
      .listMyTokens()
      .pipe(finalize(() => (this.tokensLoading = false)))
      .subscribe({
        next: (rows) => {
          this.tokenRows = rows.map(summaryToRow);
        },
        error: (err: HttpErrorResponse) => {
          this.tokenRows = [];
          if (err.status === 403) {
            this.tokensError = 'Issued tokens are available for resident accounts.';
            return;
          }
          this.tokensError = 'Could not load tokens.';
          void this.showToast(this.tokensError);
        },
      });
  }

  private async copyText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      await this.showToast('Copied to clipboard');
    } catch {
      await this.showToast('Could not copy');
    }
  }

  private async showToast(message: string, color: string = 'medium'): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      duration: 2800,
      position: 'bottom',
      color,
    });
    await t.present();
  }

  private handleHttpError(err: HttpErrorResponse | Error, fallback: string): void {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string | string[] } | null;
      let msg = fallback;
      if (body?.message != null) {
        const m = body.message;
        msg = Array.isArray(m) ? m.join(', ') : String(m);
      }
      if (err.status === 403) {
        msg = 'Only residents assigned to a community can create access tokens.';
      }
      void this.showToast(msg, 'danger');
      return;
    }
    void this.showToast(err.message || fallback, 'danger');
  }

  goToHome(): void {
    void this.router.navigate(['/home']);
  }

  goToProfile(): void {
    void this.router.navigate(['/profile']);
  }

  onCenterAction(): void {
    void this.generateToken();
  }

  async openHistoryMenu(item: TokenListItem): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      cssClass: 'access-history-action-sheet',
      htmlAttributes: { 'aria-label': 'Access token options' },
      buttons: [
        {
          text: 'Share details',
          handler: () => this.handleShareDetails(item),
        },
        {
          text: 'Copy token ID',
          handler: () => void this.copyText(item.tokenId),
        },
        {
          text: 'Share QR code',
          handler: () =>
            void this.showToast(
              'The QR secret is only shown once when the token is created.',
              'medium',
            ),
        },
        {
          text: 'Revoke invitation',
          handler: () => void this.confirmRevoke(item),
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {},
        },
      ],
    });
    await actionSheet.present();
  }

  private handleShareDetails(item: TokenListItem): void {
    const text = `${item.name}\nID: ${item.id}\nStatus: ${item.status}\nCreated: ${item.datetime}`;
    void this.copyText(text);
  }

  private async confirmRevoke(item: TokenListItem): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Revoke token?',
      message: 'Guests will no longer be able to use this invitation.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Revoke',
          role: 'destructive',
          handler: () => {
            void this.performRevoke(item.tokenId);
          },
        },
      ],
    });
    await alert.present();
  }

  private async performRevoke(tokenId: string): Promise<void> {
    const loading = await this.loadingCtrl.create({ message: 'Revoking…' });
    await loading.present();
    this.accessApi
      .revokeToken(tokenId)
      .pipe(finalize(() => void loading.dismiss()))
      .subscribe({
        next: () => {
          void this.showToast('Token revoked', 'success');
          this.loadTokens();
        },
        error: (err: HttpErrorResponse | Error) =>
          void this.handleHttpError(err, 'Could not revoke token'),
      });
  }

  openHistoryFilter(): void {
    void this.showToast('Filter options coming soon');
  }
}
