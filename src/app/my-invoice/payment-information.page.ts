import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { BillingApiService } from '../core/services/billing-api.service';

@Component({
  selector: 'app-payment-information',
  templateUrl: './payment-information.page.html',
  styleUrls: ['./payment-information.page.scss'],
  standalone: false,
})
export class PaymentInformationPage implements OnInit {
  selectedCategory = 'Utility Fee';
  amount = '#2,000,00';
  categories = ['Utility Fee', 'Service Charge', 'Other Invoices'];
  invoiceId: string | null = null;
  paystackBusy = false;

  constructor(
    private readonly router: Router,
    private readonly billingApi: BillingApiService,
    private readonly toastCtrl: ToastController,
  ) {}

  ngOnInit(): void {
    const state = history.state as {
      category?: string;
      amount?: string;
      invoiceId?: string;
    };
    if (state?.category) this.selectedCategory = state.category;
    if (state?.amount) this.amount = state.amount;
    if (state?.invoiceId) this.invoiceId = state.invoiceId;
  }

  payWithPaystack(): void {
    if (!this.invoiceId) {
      void this.toastCtrl
        .create({
          message: 'No billable invoice. Open an invoice from history or pay from the summary when you have a balance.',
          duration: 4000,
          color: 'warning',
          position: 'bottom',
        })
        .then((t) => t.present());
      return;
    }
    this.paystackBusy = true;
    this.billingApi
      .payInvoice(this.invoiceId, { paymentMethod: 'PAYSTACK' })
      .pipe(finalize(() => (this.paystackBusy = false)))
      .subscribe({
        next: async () => {
          const t = await this.toastCtrl.create({
            message: 'Payment recorded via Paystack (demo).',
            duration: 2500,
            color: 'success',
            position: 'bottom',
          });
          await t.present();
          void this.router.navigate(['/my-invoice']);
        },
        error: async () => {
          const t = await this.toastCtrl.create({
            message: 'Could not record payment.',
            duration: 3500,
            color: 'danger',
            position: 'bottom',
          });
          await t.present();
        },
      });
  }

  payWithCard(): void {
    this.router.navigate(['/my-invoice/card'], {
      state: {
        category: this.selectedCategory,
        amount: this.amount,
        invoiceId: this.invoiceId ?? undefined,
      },
    });
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
