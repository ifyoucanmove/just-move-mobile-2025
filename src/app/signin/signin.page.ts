import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonSpinner, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared/shared-module';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Common } from '../services/common';
import { Challenges } from '../services/challenges';

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
  constructor(public fb:FormBuilder,
    public authService:AuthService,public common:Common,
    public location:Location,public router:Router,
    private challengeService: Challenges) {
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
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }

  ionViewWillEnter() {
    // route to home if user is already logged in
    const user = this.authService.currentUser;
    if(user){
      this.router.navigate(['/home'], { replaceUrl: true });
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
        this.router.navigate(['/home'], { replaceUrl: true });
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

}
