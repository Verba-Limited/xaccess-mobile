import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IcePage } from './ice.page';

const routes: Routes = [
  { path: '', component: IcePage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IcePageRoutingModule {}
