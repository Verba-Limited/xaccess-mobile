import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./sign-up/sign-up.module').then(m => m.SignUpPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'join-community',
    loadChildren: () =>
      import('./join-community/join-community.module').then((m) => m.JoinCommunityPageModule),
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
  },
  {
    path: 'access-control',
    loadChildren: () => import('./access-control/access-control.module').then(m => m.AccessControlPageModule)
  },
  {
    path: 'messages',
    loadChildren: () => import('./messages/messages.module').then(m => m.MessagesPageModule)
  },
  {
    path: 'manage-utility',
    loadChildren: () => import('./manage-utility/manage-utility.module').then(m => m.ManageUtilityPageModule)
  },
  {
    path: 'alarms',
    loadChildren: () => import('./alarms/alarms.module').then(m => m.AlarmsPageModule)
  },
  {
    path: 'ice',
    loadChildren: () => import('./ice/ice.module').then(m => m.IcePageModule)
  },
  {
    path: 'my-neighbor',
    loadChildren: () => import('./my-neighbor/my-neighbor.module').then(m => m.MyNeighborPageModule)
  },
  {
    path: 'my-invoice',
    loadChildren: () => import('./my-invoice/my-invoice.module').then(m => m.MyInvoicePageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
