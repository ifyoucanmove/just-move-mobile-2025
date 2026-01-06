import { Component, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
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
  private ngZone = inject(NgZone);
  private authStateUnsubscribe?: () => void;
  private initialNavigationDone = false;

  constructor(
    public challengeService: Challenges,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Wait for router to complete initial navigation first
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      take(1)
    ).subscribe(async () => {
      this.initialNavigationDone = true;

      // Check authentication state after initial navigation
      const user = await this.authService.waitForAuthState();
      if (user || this.authService.currentUser) {
        // User is authenticated - navigate to home
        this.ngZone.run(() => {
          this.router.navigate(['/home'], { replaceUrl: true });
        });
        this.challengeService.loadAllChallengeData();
      }
    });

    // Listen to auth state changes to load challenge data when user logs in
    this.authStateUnsubscribe = onAuthStateChanged(this.auth, async (user: User | null) => {
      // Only handle auth changes after initial navigation is complete
      if (!this.initialNavigationDone) return;

      this.ngZone.run(() => {
        if (user) {
          // User logged in - load challenge data
          this.challengeService.loadAllChallengeData();
        } else {
          // User logged out - cleanup challenge data
          this.challengeService.cleanup();
        }
      });
    });
  }

  ngOnDestroy() {
    // Unsubscribe from auth state changes
    if (this.authStateUnsubscribe) {
      this.authStateUnsubscribe();
    }
  }
}
