import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginGuard } from './core/guards/login.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'converter',
    loadChildren: () => import('./features/converter/converter.module').then(m => m.ConverterModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'history',
    loadChildren: () => import('./features/history/history.module').then(m => m.HistoryModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/converter',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/converter'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 