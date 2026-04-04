import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MyNeighborPageRoutingModule } from './my-neighbor-routing.module';
import { MyNeighborPage } from './my-neighbor.page';
import { EstateAdministratorPage } from './estate-administrator.page';
import { MyNeighborInfoPage } from './my-neighbor-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    MyNeighborPageRoutingModule
  ],
  declarations: [MyNeighborPage, EstateAdministratorPage, MyNeighborInfoPage]
})
export class MyNeighborPageModule {}
