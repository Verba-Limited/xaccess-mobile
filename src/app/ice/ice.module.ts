import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { IcePageRoutingModule } from './ice-routing.module';
import { IcePage } from './ice.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    IcePageRoutingModule
  ],
  declarations: [IcePage]
})
export class IcePageModule {}
