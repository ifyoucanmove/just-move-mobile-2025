import { Routes } from '@angular/router';
import { authenticationGuard } from './guard/authentication-guard';
import { welcomeGuard } from './guard/welcome-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },
 
  
  {
    path: 'welcome',
    loadComponent: () => import('./welcome/welcome.page').then( m => m.WelcomePage),
    canActivate: [welcomeGuard]
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
    path: 'challenge',
    loadComponent: () => import('./challenge-main/challenge-main.page').then( m => m.ChallengeMainPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/challenge-home/:id',
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
    loadComponent: () => import('./challenge/challenge-week4/challenge-week4.page').then( m => m.ChallengeWeek4Page),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/day/:id',
    loadComponent: () => import('./challenge/challenge-day/challenge-day.page').then( m => m.ChallengeDayPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/final-week',
    loadComponent: () => import('./challenge/final-week/final-week.page').then( m => m.FinalWeekPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/introduction',
    loadComponent: () => import('./challenge/introduction/introduction.page').then( m => m.IntroductionPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/feedback',
    loadComponent: () => import('./challenge/feedback/feedback.page').then( m => m.FeedbackPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/challenge-material',
    loadComponent: () => import('./challenge/challenge-material/challenge-material.page').then( m => m.ChallengeMaterialPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/calendar',
    loadComponent: () => import('./challenge/calendar/calendar.page').then( m => m.CalendarPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/introduction/intro',
    loadComponent: () => import('./challenge/introduction/intro/intro.page').then( m => m.IntroPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/introduction/fb-community',
    loadComponent: () => import('./challenge/introduction/fb-community/fb-community.page').then( m => m.FbCommunityPage)
  },
  {
    path: 'challenge/introduction/materials',
    loadComponent: () => import('./challenge/introduction/materials/materials.page').then( m => m.MaterialsPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/introduction/other',
    loadComponent: () => import('./challenge/introduction/other/other.page').then( m => m.OtherPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/introduction/timeline',
    loadComponent: () => import('./challenge/introduction/timeline/timeline.page').then( m => m.TimelinePage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/introduction/settings',
    loadComponent: () => import('./challenge/introduction/settings/settings.page').then( m => m.SettingsPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'challenge/introduction/upload-rules',
    loadComponent: () => import('./challenge/introduction/upload-rules/upload-rules.page').then( m => m.UploadRulesPage),
   canActivate: [authenticationGuard]
  },
  {
    path: 'my-cart',
    loadComponent: () => import('./my-cart/my-cart.page').then( m => m.MyCartPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'my-store',
    loadComponent: () => import('./my-store/my-store.page').then( m => m.MyStorePage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'my-orders',
    loadComponent: () => import('./my-orders/my-orders.page').then( m => m.MyOrdersPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'collection-details',
    loadComponent: () => import('./collection-details/collection-details.page').then( m => m.CollectionDetailsPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'collection-details/:id',
    loadComponent: () => import('./collection-details/collection-details.page').then( m => m.CollectionDetailsPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'shopify-details',
    loadComponent: () => import('./shopify-details/shopify-details.page').then( m => m.ShopifyDetailsPage),
    canActivate: [authenticationGuard]
  },
  {
    path: 'product-detail/:id',
    loadComponent: () => import('./product-detail/product-detail.page').then( m => m.ProductDetailPage),
    canActivate: [authenticationGuard]
  },
  {
    path: '**',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },

  
  

];
