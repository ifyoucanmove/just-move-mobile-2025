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
    path: 'challenge',
    loadComponent: () => import('./challenge-main/challenge-main.page').then( m => m.ChallengeMainPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/challenge-home',
    loadComponent: () => import('./challenge/challenge-home/challenge-home.page').then( m => m.ChallengeHomePage),
     canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/challenge-measurement',
    loadComponent: () => import('./challenge/challenge-measurement/challenge-measurement.page').then( m => m.ChallengeMeasurementPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/challenge-cool-downs',
    loadComponent: () => import('./challenge/challenge-cool-downs/challenge-cool-downs.page').then( m => m.ChallengeCoolDownsPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/challenge-tip-tricks',
    loadComponent: () => import('./challenge/challenge-tip-tricks/challenge-tip-tricks.page').then( m => m.ChallengeTipTricksPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/challenge-week1',
    loadComponent: () => import('./challenge/challenge-week1/challenge-week1.page').then( m => m.ChallengeWeek1Page),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/challenge-week2',
    loadComponent: () => import('./challenge/challenge-week2/challenge-week2.page').then( m => m.ChallengeWeek2Page),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/challenge-week3',
    loadComponent: () => import('./challenge/challenge-week3/challenge-week3.page').then( m => m.ChallengeWeek3Page),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/challenge-week4',
    loadComponent: () => import('./challenge/challenge-week4/challenge-week4.page').then( m => m.ChallengeWeek4Page)
  },
  {
    path: 'challenge/day/:id',
    loadComponent: () => import('./challenge/challenge-day/challenge-day.page').then( m => m.ChallengeDayPage),
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
  },
  {
    path: 'challenge-home',
    loadComponent: () => import('./challenge/challenge-home/challenge-home.page').then( m => m.ChallengeHomePage)
  },
  {
    path: 'challenge-measurement',
    loadComponent: () => import('./challenge/challenge-measurement/challenge-measurement.page').then( m => m.ChallengeMeasurementPage)
  },
  {
    path: 'challenge-cool-downs',
    loadComponent: () => import('./challenge/challenge-cool-downs/challenge-cool-downs.page').then( m => m.ChallengeCoolDownsPage)
  },
  {
    path: 'challenge-tip-tricks',
    loadComponent: () => import('./challenge/challenge-tip-tricks/challenge-tip-tricks.page').then( m => m.ChallengeTipTricksPage)
  },
  {
    path: 'challenge-week1',
    loadComponent: () => import('./challenge/challenge-week1/challenge-week1.page').then( m => m.ChallengeWeek1Page)
  },
  {
    path: 'challenge-week2',
    loadComponent: () => import('./challenge/challenge-week2/challenge-week2.page').then( m => m.ChallengeWeek2Page)
  },
  {
    path: 'challenge-week3',
    loadComponent: () => import('./challenge/challenge-week3/challenge-week3.page').then( m => m.ChallengeWeek3Page)
  },
  {
    path: 'challenge-week4',
    loadComponent: () => import('./challenge/challenge-week4/challenge-week4.page').then( m => m.ChallengeWeek4Page)
  },
  {
    path: 'challenge-day',
    loadComponent: () => import('./challenge/challenge-day/challenge-day.page').then( m => m.ChallengeDayPage)
  },
  {
    path: 'final-week',
    loadComponent: () => import('./challenge/final-week/final-week.page').then( m => m.FinalWeekPage)
  }
];
