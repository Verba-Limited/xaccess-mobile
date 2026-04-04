import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyNeighborPage } from './my-neighbor.page';
import { EstateAdministratorPage } from './estate-administrator.page';
import { MyNeighborInfoPage } from './my-neighbor-info.page';

const routes: Routes = [
  { path: '', component: MyNeighborPage },
  { path: 'administrator', component: EstateAdministratorPage },
  { path: 'info', component: MyNeighborInfoPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyNeighborPageRoutingModule {}
