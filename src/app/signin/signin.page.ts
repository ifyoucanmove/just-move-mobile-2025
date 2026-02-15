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
  constructor(public fb:FormBuilder,
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
      }
    }catch(error:any){
      console.log(error);
      //if auth/invalid-credential
      if(error.code === 'auth/invalid-credential'){
        this.common.showErrorToast('Invalid credentials');
      }
      else if(error.code === 'auth/user-not-found'){
        this.common.showErrorToast('User not found');
      }
      else if(error.code === 'auth/wrong-password'){
        this.common.showErrorToast('Wrong password');
      }
      else{
        this.common.showErrorToast('Something went wrong');
      }
    } finally {
      this.isLoading = false;
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
