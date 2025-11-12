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
    // Wait for auth state to be determined
    const user = await this.authService.waitForAuthState();
    if(user){
      this.router.navigate(['/home']);
    }
  }

}
