import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JoinCommunityPageRoutingModule } from './join-community-routing.module';
import { JoinCommunityPage } from './join-community.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    JoinCommunityPageRoutingModule,
  ],
  declarations: [JoinCommunityPage],
})
export class JoinCommunityPageModule {}
