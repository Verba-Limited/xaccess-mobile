import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ManageUtilityPageRoutingModule } from './manage-utility-routing.module';
import { ManageUtilityPage } from './manage-utility.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    ManageUtilityPageRoutingModule
  ],
  declarations: [ManageUtilityPage]
})
export class ManageUtilityPageModule {}
