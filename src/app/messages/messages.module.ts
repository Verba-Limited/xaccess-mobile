import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessagesPageRoutingModule } from './messages-routing.module';
import { MessagesPage } from './messages.page';
import { ComposeMessagePage } from './compose-message.page';
import { MessageInfoPage } from './message-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    MessagesPageRoutingModule
  ],
  declarations: [MessagesPage, ComposeMessagePage, MessageInfoPage]
})
export class MessagesPageModule {}
