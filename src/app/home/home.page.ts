import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastController, ViewWillEnter } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { AccessApiService } from '../core/services/access-api.service';
import { AuthApiService } from '../core/services/auth-api.service';
import { TokenStorageService } from '../core/services/token-storage.service';
import { AccessLogDto } from '../core/models/access.models';

export interface AccessHistoryItem {
  name: string;
  status: string;
  id: string;
  datetime: string;
}
const HISTORY_PREVIEW_LIMIT = 8;

function statusLabel(action: AccessLogDto['action']): string {
  switch (action) {
    case 'ENTRY':
      return 'Checked In';
    case 'EXIT':
      return 'Checked Out';
    case 'DENIED':
      return 'Denied';
    default:
      return String(action);
  }
}

function displayName(meta: Record<string, unknown> | null): string {
  if (!meta) return 'Access';
  const g = meta['guestName'] ?? meta['guest'] ?? meta['name'];
  return typeof g === 'string' && g.length > 0 ? g : 'Access';
}

function formatShortId(createdAt: string): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return '—';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${mm}${dd}${yyyy}`;
}

function formatDateTime(createdAt: string): string {
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return createdAt;
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

function mapLogsToHistory(logs: AccessLogDto[]): AccessHistoryItem[] {
  return logs.slice(0, HISTORY_PREVIEW_LIMIT).map((log) => ({
    name: displayName(log.metadata),
    status: statusLabel(log.action),
    id: formatShortId(log.createdAt),
    datetime: formatDateTime(log.createdAt),
  }));
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, ViewWillEnter {
  todayDate = '';

  accessHistory: AccessHistoryItem[] = [];
  accessHistoryLoading = false;
  accessHistoryError: string | null = null;

  /** Resident with no `communityId` — show join-estate banner */
  communityMissing = false;

  constructor(
    private readonly router: Router,
    private readonly accessApi: AccessApiService,
    private readonly authApi: AuthApiService,
    private readonly tokens: TokenStorageService,
    private readonly toastCtrl: ToastController,
  ) {}

  ngOnInit(): void {
    this.todayDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  ionViewWillEnter(): void {
    this.syncCommunityBanner();
    this.loadDashboard();
  }

  private syncCommunityBanner(): void {
    const u = this.tokens.getUserSnapshot();
    this.communityMissing = !!u && u.role === 'RESIDENT' && !u.communityId;
  }

  private loadDashboard(): void {
    this.refreshUserFromApi();
    this.loadAccessHistory();
  }

  /** Keep cached user in sync with server (role, community, etc.). */
  private refreshUserFromApi(): void {
    const token = this.tokens.getAccessToken();
    if (!token) return;
    this.authApi.me().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.tokens.persistSession(token, res.data);
          this.communityMissing =
            res.data.role === 'RESIDENT' && !res.data.communityId;
        }
      },
      error: () => {
        /* offline or expired — keep snapshot */
      },
    });
  }

  private loadAccessHistory(): void {
    if (!this.tokens.hasAccessToken()) {
      this.accessHistory = [];
      return;
    }
    this.accessHistoryLoading = true;
    this.accessHistoryError = null;
    this.accessApi
      .getMyAccessLogs()
      .pipe(finalize(() => (this.accessHistoryLoading = false)))
      .subscribe({
        next: (logs) => {
          this.accessHistory = mapLogsToHistory(logs);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.accessHistory = [];
            this.accessHistoryError =
              'Access history is available for resident accounts.';
            return;
          }
          this.accessHistory = [];
          this.accessHistoryError = 'Could not load access history.';
          void this.showToast(this.accessHistoryError);
        },
      });
  }

  private async showToast(message: string): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'medium',
    });
    await t.present();
  }

  goToJoinCommunity(): void {
    void this.router.navigate(['/join-community']);
  }

  goToAccessControl(): void {
    void this.router.navigate(['/access-control']);
  }

  goToMessaging(): void {
    void this.router.navigate(['/messages']);
  }

  goToManageUtility(): void {
    void this.router.navigate(['/manage-utility']);
  }

  goToMyInvoice(): void {
    void this.router.navigate(['/my-invoice']);
  }

  goToAlarms(): void {
    void this.router.navigate(['/alarms']);
  }

  goToIce(): void {
    void this.router.navigate(['/ice']);
  }

  goToResident(): void {
    void this.router.navigate(['/my-neighbor']);
  }

  viewAllHistory(): void {
    void this.router.navigate(['/access-control']);
  }

  openHistoryMenu(_item: AccessHistoryItem): void {
    void this.router.navigate(['/access-control']);
  }

  onCenterAction(): void {
    void this.router.navigate(['/access-control']);
  }
}
