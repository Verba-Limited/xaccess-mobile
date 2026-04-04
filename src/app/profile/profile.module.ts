import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { ProfilePage } from './profile.page';
import { ProfileIdPage } from './profile-id.page';
import { AccountPage } from './account.page';
import { EditAccountPage } from './edit-account.page';
import { ChangePasswordPage } from './change-password.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    ProfilePageRoutingModule
  ],
  declarations: [ProfilePage, ProfileIdPage, AccountPage, EditAccountPage, ChangePasswordPage]
})
export class ProfilePageModule {}
