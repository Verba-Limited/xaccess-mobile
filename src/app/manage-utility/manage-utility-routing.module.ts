import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageUtilityPage } from './manage-utility.page';

const routes: Routes = [
  { path: '', component: ManageUtilityPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageUtilityPageRoutingModule {}
