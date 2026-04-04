import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { finalize } from 'rxjs/operators';
import { BillingApiService } from '../core/services/billing-api.service';

function formatNgn(minor: number): string {
  const n = minor / 100;
  return `₦${n.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

@Component({
  selector: 'app-card-info',
  templateUrl: './card-info.page.html',
  styleUrls: ['./card-info.page.scss'],
  standalone: false,
})
export class CardInfoPage implements OnInit {
  form: FormGroup;
  selectedCategory = 'Utility Fee';
  amount = '₦0.00';
  invoiceTitle = '';
  loading = false;
  paying = false;
  private invoiceIdForPay: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly billingApi: BillingApiService,
    private readonly toastCtrl: ToastController,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      cardNumber: ['', Validators.required],
      expireDate: ['', Validators.required],
      cvv: ['', Validators.required],
      saveCard: [false],
    });
  }

  ngOnInit(): void {
    const state = history.state as {
      category?: string;
      amount?: string;
      invoiceId?: string;
    };
    if (state?.category) this.selectedCategory = state.category;
    if (state?.amount) this.amount = state.amount;

    const invoiceId = state?.invoiceId;
    if (invoiceId) {
      this.invoiceIdForPay = invoiceId;
      this.loading = true;
      this.billingApi.getInvoice(invoiceId).subscribe({
        next: (inv) => {
          this.loading = false;
          this.invoiceTitle = inv.title;
          this.selectedCategory = inv.title;
          this.amount = formatNgn(inv.amountMinor);
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  payNow(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.invoiceIdForPay) {
      void this.router.navigate(['/my-invoice']);
      return;
    }
    this.paying = true;
    this.billingApi
      .payInvoice(this.invoiceIdForPay, { paymentMethod: 'CARD' })
      .pipe(finalize(() => (this.paying = false)))
      .subscribe({
        next: async () => {
          const t = await this.toastCtrl.create({
            message: 'Payment recorded.',
            duration: 2500,
            color: 'success',
            position: 'bottom',
          });
          await t.present();
          void this.router.navigate(['/my-invoice']);
        },
        error: async () => {
          const t = await this.toastCtrl.create({
            message: 'Could not complete payment.',
            duration: 3500,
            color: 'danger',
            position: 'bottom',
          });
          await t.present();
        },
      });
  }

  onCenterAction(): void {
    this.router.navigate(['/access-control']);
  }
}
