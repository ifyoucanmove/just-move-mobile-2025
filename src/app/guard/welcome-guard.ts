import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { inject } from '@angular/core';

export const welcomeGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Wait for auth state to be determined
  const user = await authService.waitForAuthState();
  
  // If user is authenticated, redirect to home before loading welcome page
  if (user || authService.currentUser) {
    router.navigate(['/home'], { replaceUrl: true });
    return false; // Prevent welcome page from loading
  }
  
  // If user is not authenticated, allow welcome page to load
  return true;
};

