import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import {
  NeighborDirectoryEntry,
  UsersApiService,
} from '../core/services/users-api.service';

export interface NeighborMember {
  name: string;
  email: string;
  phone: string;
  address: string;
  id: string;
}

@Component({
  selector: 'app-my-neighbor',
  templateUrl: './my-neighbor.page.html',
  styleUrls: ['./my-neighbor.page.scss'],
  standalone: false,
})
export class MyNeighborPage implements ViewWillEnter {
  estateName = '';
  administratorName = '';
  administratorPhone: string | null = null;
  administratorEmail: string | null = null;
  memberSearch = '';
  estateMembers: NeighborMember[] = [];
  loading = false;

  constructor(
    private readonly router: Router,
    private readonly usersApi: UsersApiService,
  ) {}

  ionViewWillEnter(): void {
    this.loading = true;
    this.usersApi
      .getCommunityContext()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (ctx) => {
          this.estateName = ctx.community?.name ?? '—';
          const a = ctx.administrator;
          this.administratorName = a?.fullName ?? '—';
          this.administratorPhone = a?.phone ?? null;
          this.administratorEmail = a?.email ?? null;
        },
        error: () => {
          this.estateName = '—';
          this.administratorName = '—';
          this.administratorPhone = null;
          this.administratorEmail = null;
        },
      });
    this.usersApi.getNeighborDirectory().subscribe({
      next: (list: NeighborDirectoryEntry[]) => {
        this.estateMembers = list.map((m) => ({
          id: m.id,
          name: m.fullName,
          email: '—',
          phone: m.phone ?? '—',
          address: m.unitLabel ?? '—',
        }));
      },
      error: () => {
        this.estateMembers = [];
      },
    });
  }

  get filteredMembers(): NeighborMember[] {
    const q = (this.memberSearch || '').trim().toLowerCase();
    if (!q) return this.estateMembers;
    return this.estateMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q),
    );
  }

  goToAdministrator(): void {
    this.router.navigate(['/my-neighbor/administrator'], {
      state: {
        name: this.administratorName,
        role: 'Estate Administrator',
        phone: this.administratorPhone,
        email: this.administratorEmail,
      },
    });
  }

  goToMemberInfo(member: NeighborMember): void {
    this.router.navigate(['/my-neighbor/info'], { state: { resident: member } });
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
