import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { inject } from '@angular/core';
import { User } from '../services/user';

export const authenticationGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userService = inject(User);
  
  try {
    console.log('[authenticationGuard] Starting...');
    
    // Wait for auth state to be determined before checking
    const user = await authService.waitForAuthState();
    console.log('[authenticationGuard] User:', user ? user.email : 'none');
    
    userService.email = user?.email || '';
    console.log('[authenticationGuard] User details:', authService.userDetails);
    
    if(user || authService.currentUser){
      console.log('[authenticationGuard] Allowing access');
      return true;
    }else{
      console.log('[authenticationGuard] Redirecting to /welcome');
      router.navigate(['/welcome']);
      return false;
    }
  } catch (error) {
    console.error('[authenticationGuard] Error:', error);
    router.navigate(['/welcome']);
    return false;
  }
};
