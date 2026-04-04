import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccessControlPage } from './access-control.page';

const routes: Routes = [
  { path: '', component: AccessControlPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessControlPageRoutingModule {}
