import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ViewWillEnter } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import {
  BillingApiService,
  InvoiceDto,
} from '../core/services/billing-api.service';

export interface PaymentHistoryItem {
  title: string;
  invoiceNo: string;
  amount: string;
  dateStatus: string;
  id: string;
}

function formatNgn(minor: number): string {
  const n = minor / 100;
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

@Component({
  selector: 'app-my-invoice',
  templateUrl: './my-invoice.page.html',
  styleUrls: ['./my-invoice.page.scss'],
  standalone: false,
})
export class MyInvoicePage implements ViewWillEnter {
  hasOutstandingPayment = false;
  totalAmountDue = '₦0.00';
  dueDate = '—';
  /** First pending invoice id for quick pay flows */
  nextInvoiceId: string | null = null;
  paymentHistory: PaymentHistoryItem[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private readonly router: Router,
    private readonly billingApi: BillingApiService,
  ) {}

  ionViewWillEnter(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.billingApi
      .summary()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (s) => {
          this.hasOutstandingPayment = s.hasOutstanding;
          this.totalAmountDue = formatNgn(s.totalAmountMinor);
          this.nextInvoiceId = s.nextInvoiceId ?? null;
          this.dueDate = s.nextDueDate
            ? new Date(s.nextDueDate).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric',
              })
            : '—';
        },
        error: (e: Error) => {
          this.error = e.message || 'Could not load billing';
        },
      });
    this.billingApi.listInvoices().subscribe({
      next: (list) => {
        this.paymentHistory = list.map((inv: InvoiceDto) => ({
          id: inv.id,
          title: inv.title,
          invoiceNo: inv.invoiceNumber,
          amount: formatNgn(inv.amountMinor),
          dateStatus: `${inv.dueDate} • ${inv.status}`,
        }));
      },
      error: () => {
        this.paymentHistory = [];
      },
    });
  }

  payNow(): void {
    if (!this.hasOutstandingPayment) return;
    this.router.navigate(['/my-invoice/payment'], {
      state: {
        amount: this.totalAmountDue,
        category: 'Utility Fee',
        invoiceId: this.nextInvoiceId,
      },
    });
  }

  openCategory(category: string): void {
    this.router.navigate(['/my-invoice/payment'], {
      state: {
        amount: this.totalAmountDue,
        category,
        invoiceId: this.nextInvoiceId,
      },
    });
  }

  openHistoryItem(item: PaymentHistoryItem): void {
    this.router.navigate(['/my-invoice/card'], {
      state: { invoiceId: item.id },
    });
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
