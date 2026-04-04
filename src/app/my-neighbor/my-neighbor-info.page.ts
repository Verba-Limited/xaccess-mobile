import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NeighborMember } from './my-neighbor.page';

@Component({
  selector: 'app-my-neighbor-info',
  templateUrl: './my-neighbor-info.page.html',
  styleUrls: ['./my-neighbor-info.page.scss'],
  standalone: false,
})
export class MyNeighborInfoPage implements OnInit {
  resident: NeighborMember | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.resident = history.state?.['resident'] ?? null;
    if (!this.resident) {
      this.router.navigate(['/my-neighbor']);
    }
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
