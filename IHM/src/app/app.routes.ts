import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

//Pour activer les guards décommenter les lignes correspondantes dans les routes sauveteur et sportif

export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'login' },
	{
		path: 'login',
		loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
	},
	{
		path: 'register',
		loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent)
	},
	{
		path: 'sauveteur',
		loadChildren: () => import('./sauveteur/sauveteur.module').then(m => m.SauveteurModule),
		//canActivate: [AuthGuard]
	},
	{
		path: 'sportif',
		loadChildren: () => import('./sportif/sportif.module').then(m => m.SportifModule),
		//canActivate: [AuthGuard] 
	},
	{ path: '**', redirectTo: 'login' }
];

