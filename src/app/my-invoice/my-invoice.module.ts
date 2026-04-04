import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyInvoicePageRoutingModule } from './my-invoice-routing.module';
import { MyInvoicePage } from './my-invoice.page';
import { PaymentInformationPage } from './payment-information.page';
import { CardInfoPage } from './card-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    MyInvoicePageRoutingModule
  ],
  declarations: [MyInvoicePage, PaymentInformationPage, CardInfoPage]
})
export class MyInvoicePageModule {}
