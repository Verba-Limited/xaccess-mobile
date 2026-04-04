import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-estate-administrator',
  templateUrl: './estate-administrator.page.html',
  styleUrls: ['./estate-administrator.page.scss'],
  standalone: false,
})
export class EstateAdministratorPage implements OnInit {
  name = '—';
  roleLabel = 'Estate Administrator';
  phone: string | null = null;
  email: string | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const state = history.state as {
      name?: string;
      role?: string;
      phone?: string | null;
      email?: string | null;
    };
    if (state?.name) this.name = state.name;
    if (state?.role) this.roleLabel = state.role;
    if (state?.phone !== undefined) this.phone = state.phone;
    if (state?.email !== undefined) this.email = state.email;
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
