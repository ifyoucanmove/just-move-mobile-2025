import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared/shared-module';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Common } from '../services/common';
import { Challenges } from '../services/challenges';
import { Capacitor } from '@capacitor/core';
import { Logging } from '../services/logging';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
  standalone: true,
  imports: [SharedModule,IonSpinner]
})
export class SigninPage implements OnInit {
  signinForm!:FormGroup;
  showPassword: boolean = false;
  isLoading: boolean = false;
  isSocialLoading: { google: boolean; facebook: boolean; apple: boolean } = {
    google: false,
    facebook: false,
    apple: false
  };
  showAppleSignIn: boolean = Capacitor.getPlatform() !== 'android';
  constructor(public fb:FormBuilder,public logService:Logging,
    public authService:AuthService,public common:Common,
    public location:Location,public router:Router,
    private challengeService: Challenges) {
      console.log('SigninPage constructor', Capacitor.getPlatform());
    // Initialize form in constructor to avoid formGroup error
    this.signinForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

 async ngOnInit() {
    const user = await this.authService.waitForAuthState();
    if(user){
      // Load challenge data if user is already logged in
      this.challengeService.loadAllChallengeData();
      this.router.navigate(['/products/home-tab'], { replaceUrl: true });
    }
    this.logService.logActivity({
      activity: 'Sign in page loaded.',
      page: 'signin'
    });
  }

  ionViewWillEnter() {
    // route to home if user is already logged in
    const user = this.authService.currentUser;
    if(user){
      this.router.navigate(['/products/home-tab'], { replaceUrl: true });
    }
  }

 async signin() {
    if (this.isLoading) return; // Prevent multiple clicks
    
    this.isLoading = true;
    
    try{
      let result = await this.authService.signInWithEmailAndPassword(this.signinForm.value.email, this.signinForm.value.password);
      if(result){
       // this.common.showSuccessToast('Sign in successful');
        // Load challenge data after successful login
        this.challengeService.loadAllChallengeData();
        this.router.navigate(['/products/home-tab'], { replaceUrl: true });
        this.logService.logActivity(
          {
            activity: 'Sign in successful.',
            page: 'signin',
            payload: {
              email: this.signinForm.value.email,
            },
          }
        );
      }
    }catch(error:any){
      console.log(error);
      //if auth/invalid-credential
      this.handleLoginError(error);
      this.logService.logError(
        {
          error: error,
          activity: 'Sign in button clicked.',
          page: 'signin',
          payload: {
            email: this.signinForm.value.email,
          },
        }
      );
    } finally {
      this.isLoading = false;
    }
  }

  handleLoginError(error: any) {
    switch (error.code) {
  
      case 'auth/invalid-email':
        this.common.showErrorToast('Invalid email format.');
        break;
  
      case 'auth/user-not-found':
        this.common.showErrorToast('No account found with this email.');
        break;
  
      case 'auth/wrong-password':
        this.common.showErrorToast('Incorrect password.');
        break;
  
      case 'auth/invalid-credential':
        this.common.showErrorToast('Invalid email or password.');
        break;
  
      case 'auth/user-disabled':
        this.common.showErrorToast('This account has been disabled.');
        break;
  
      case 'auth/too-many-requests':
        this.common.showErrorToast('Too many failed attempts. Try again later.');
        break;
  
      case 'auth/network-request-failed':
        this.common.showErrorToast('Network error. Check internet connection.');
        break;
  
      case 'auth/internal-error':
        this.common.showErrorToast('Internal server error.');
        break;
  
      case 'auth/missing-email':
        this.common.showErrorToast('Email is required.');
        break;
  
      case 'auth/missing-password':
        this.common.showErrorToast('Password is required.');
        break;
  
      default:
        this.common.showErrorToast('Unknown error:', error.message);
    }
  }


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goBack() {
    this.location.back();
  }
  goToSignup() {
    this.router.navigate(['/signup']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  // ============ SOCIAL SIGN-IN METHODS ============

  async signInWithGoogle() {
    if (this.isSocialLoading.google) return;

    this.isSocialLoading.google = true;

    try {
      const result = await this.authService.signInWithGoogle();
      if (result) {
        this.challengeService.loadAllChallengeData();
        this.router.navigate(['/products/home-tab'], { replaceUrl: true });
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      this.handleSocialAuthError(error, 'Google');
    } finally {
      this.isSocialLoading.google = false;
    }
  }

  async signInWithFacebook() {
    if (this.isSocialLoading.facebook) return;

    this.isSocialLoading.facebook = true;

    try {
      const result = await this.authService.signInWithFacebook();
      if (result) {
        this.challengeService.loadAllChallengeData();
        this.router.navigate(['/products/home-tab'], { replaceUrl: true });
      }
    } catch (error: any) {
      console.error('Facebook sign-in error:', error);
      this.handleSocialAuthError(error, 'Facebook');
    } finally {
      this.isSocialLoading.facebook = false;
    }
  }

  async signInWithApple() {
    if (this.isSocialLoading.apple) return;

    this.isSocialLoading.apple = true;

    try {
      const result = await this.authService.signInWithApple();
      if (result) {
        this.challengeService.loadAllChallengeData();
        this.router.navigate(['/products/home-tab'], { replaceUrl: true });
      }
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      this.handleSocialAuthError(error, 'Apple');
    } finally {
      this.isSocialLoading.apple = false;
    }
  }

  private handleSocialAuthError(error: any, provider: string) {
    if (error.code === 'auth/account-exists-with-different-credential') {
      this.common.showErrorToast('An account already exists with this email using a different sign-in method');
    } else if (error.code === 'auth/popup-closed-by-user' || error.message?.includes('canceled')) {
      // User cancelled, no need to show error
      console.log(`${provider} sign-in cancelled by user`);
    } else if (error.code === 'auth/network-request-failed') {
      this.common.showErrorToast('Network error. Please check your connection');
    } else {
      this.common.showErrorToast(`${provider} sign-in failed. Please try again`);
    }
  }

}
