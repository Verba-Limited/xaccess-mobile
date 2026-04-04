import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MessagesPage } from './messages.page';
import { ComposeMessagePage } from './compose-message.page';
import { MessageInfoPage } from './message-info.page';

const routes: Routes = [
  { path: '', component: MessagesPage },
  { path: 'compose', component: ComposeMessagePage },
  { path: 'info', component: MessageInfoPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MessagesPageRoutingModule {}
