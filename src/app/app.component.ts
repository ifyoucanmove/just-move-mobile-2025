import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Challenges } from './services/challenges';
import { AuthService } from './services/auth';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router, NavigationEnd } from '@angular/router';
import { filter, take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit, OnDestroy {
  private auth = inject(Auth);
  private router = inject(Router);
  private authStateUnsubscribe?: () => void;

  constructor(
    public challengeService: Challenges,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    try {
      console.log('[AppComponent] ngOnInit started');
      
      // Check authentication state immediately and redirect before initial navigation
      console.log('[AppComponent] Waiting for auth state...');
      const user = await this.authService.waitForAuthState();
      console.log('[AppComponent] Auth state resolved:', user ? 'User found' : 'No user');
      
      if (user || this.authService.currentUser) {
        // User is authenticated - navigate to home before any component loads
        console.log('[AppComponent] Navigating to /home');
        this.router.navigate(['/home'], { replaceUrl: true });
        this.challengeService.loadAllChallengeData();
      }

      // Listen to auth state changes to load challenge data when user logs in
      this.authStateUnsubscribe = onAuthStateChanged(this.auth, async (user: User | null) => {
        console.log('[AppComponent] Auth state changed:', user ? 'User logged in' : 'User logged out');
        if (user) {
          // User logged in - load challenge data
          this.challengeService.loadAllChallengeData();
        } else {
          // User logged out - cleanup challenge data
          this.challengeService.cleanup();
        }
      });
      
      console.log('[AppComponent] ngOnInit completed successfully');
    } catch (error) {
      console.error('[AppComponent] Error in ngOnInit:', error);
      // Don't block the app - let it navigate to welcome page
      this.router.navigate(['/welcome'], { replaceUrl: true });
    }
  }

  ngOnDestroy() {
    // Unsubscribe from auth state changes
    if (this.authStateUnsubscribe) {
      this.authStateUnsubscribe();
    }
  }
}
