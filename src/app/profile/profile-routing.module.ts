import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfilePage } from './profile.page';
import { AccountPage } from './account.page';
import { EditAccountPage } from './edit-account.page';
import { ChangePasswordPage } from './change-password.page';
import { ProfileIdPage } from './profile-id.page';

const routes: Routes = [
  { path: '', component: ProfilePage },
  { path: 'id', component: ProfileIdPage },
  { path: 'account', component: AccountPage },
  { path: 'account/edit', component: EditAccountPage },
  { path: 'account/change-password', component: ChangePasswordPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfilePageRoutingModule {}
