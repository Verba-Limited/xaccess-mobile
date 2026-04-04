import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AlarmsPageRoutingModule } from './alarms-routing.module';
import { AlarmsPage } from './alarms.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    AlarmsPageRoutingModule
  ],
  declarations: [AlarmsPage]
})
export class AlarmsPageModule {}
