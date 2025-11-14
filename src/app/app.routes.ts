import { Routes } from '@angular/router';
import { authenticationGuard } from './guard/authentication-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
 
  
  {
    path: 'welcome',
    loadComponent: () => import('./welcome/welcome.page').then( m => m.WelcomePage)
  },
  {
    path: 'signin',
    loadComponent: () => import('./signin/signin.page').then( m => m.SigninPage)
  },
  {
    path: 'signup',
    loadComponent: () => import('./signup/signup.page').then( m => m.SignupPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'product-detail',
    loadComponent: () => import('./product-detail/product-detail.page').then( m => m.ProductDetailPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'products',
    loadComponent: () => import('./products/products.page').then( m => m.ProductsPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forget-password/forget-password.page').then( m => m.ForgetPasswordPage) },
  {
    path: '**',
    redirectTo: 'welcome',
    pathMatch: 'full',
  }
];
