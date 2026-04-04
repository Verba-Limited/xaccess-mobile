import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyInvoicePage } from './my-invoice.page';
import { PaymentInformationPage } from './payment-information.page';
import { CardInfoPage } from './card-info.page';

const routes: Routes = [
  { path: '', component: MyInvoicePage },
  { path: 'payment', component: PaymentInformationPage },
  { path: 'card', component: CardInfoPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyInvoicePageRoutingModule {}
