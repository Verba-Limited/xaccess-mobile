import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { JoinCommunityPage } from './join-community.page';

const routes: Routes = [{ path: '', component: JoinCommunityPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JoinCommunityPageRoutingModule {}
