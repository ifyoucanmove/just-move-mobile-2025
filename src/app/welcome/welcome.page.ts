import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared/shared-module';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class WelcomePage implements OnInit {

  constructor(public authService:AuthService,public router:Router) { }

  async ngOnInit() {
    // Note: If user is authenticated, welcomeGuard will redirect before this component loads
    // This check is just a safety fallback
    const user = await this.authService.waitForAuthState();
    if(user){
      // Redirect to home if somehow we got here (shouldn't happen due to guard)
      this.router.navigate(['/products/home-tab'], { replaceUrl: true });
    }
  }

  goToSignin() {
    //check if user is already logged in
    const user = this.authService.currentUser;
    if(user){
      this.router.navigate(['/products/home-tab'], { replaceUrl: true });
    }else{
      this.router.navigate(['/signin']);
    }
  }

}
