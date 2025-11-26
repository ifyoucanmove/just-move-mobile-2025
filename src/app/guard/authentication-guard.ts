import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { inject } from '@angular/core';
import { User } from '../services/user';

export const authenticationGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const userService = inject(User);
  // Wait for auth state to be determined before checking
  const user = await authService.waitForAuthState();
  userService.email = user?.email || '';
  console.log(user, 'currentUser after wait');
  
  if(user || authService.currentUser){
    return true;
  }else{
    router.navigate(['/welcome']);
    return false;
  }
};
