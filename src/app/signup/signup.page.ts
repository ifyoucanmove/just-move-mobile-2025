import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared/shared-module';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Common } from '../services/common';
import { Challenges } from '../services/challenges';
import { IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [SharedModule, IonSpinner]
})
export class SignupPage implements OnInit {

  signupForm!:FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  constructor(public fb:FormBuilder,public router:Router,
    public common:Common,
    public authService:AuthService,
    public location:Location,
    private challengeService: Challenges) { 
      this.signupForm = this.fb.group({
        fname: ['', [Validators.required]],
        lname: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required, this.passwordMatchValidator.bind(this)]]
      });
    }

 async ngOnInit() {
    const user = await this.authService.waitForAuthState();
    if(user){
      // Load challenge data if user is already logged in
      this.challengeService.loadAllChallengeData();
      this.router.navigate(['/products/home-tab'], { replaceUrl: true });
    }
  /*   this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.passwordMatchValidator.bind(this)]]
    }); */

    // Update confirm password validation when password changes (real-time)
    this.signupForm.get('password')?.valueChanges.subscribe(() => {
      this.signupForm.get('confirmPassword')?.updateValueAndValidity({ emitEvent: false });
    });

    // Update confirm password validation when confirm password changes (real-time)
    this.signupForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.signupForm.get('confirmPassword')?.updateValueAndValidity({ emitEvent: false });
    });
  }
  get fnameControl() {
    return this.signupForm.get('fname');
  }

  get lnameControl() {
    return this.signupForm.get('lname');
  }
  // Custom validator to check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    if (!this.signupForm) {
      return null;
    }
    const password = this.signupForm.get('password')?.value;
    const confirmPassword = control.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Helper methods to check validation errors
  get passwordControl() {
    return this.signupForm.get('password');
  }

  get confirmPasswordControl() {
    return this.signupForm.get('confirmPassword');
  }

  get emailControl() {
    return this.signupForm.get('email');
  }



  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goBack() {
    this.location.back();
  }
  async signup() {
    if (this.isLoading) return; // Prevent multiple clicks
    
    if(this.signupForm.valid){
      this.isLoading = true;
      try{
        let result = await this.authService.signUpWithEmailAndPassword(this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.fname, this.signupForm.value.lname);
        if(result){
          this.common.showSuccessToast('Sign up successful');
          // Load challenge data after successful signup
          this.challengeService.loadAllChallengeData();
          this.router.navigate(['/products/home-tab'], { replaceUrl: true });
        }
      }catch(error:any){
         this.handleRegisterError(error);
      } finally {
        this.isLoading = false;
      }
    }else{
    console.log('Form is not valid');
    }
  }
  handleRegisterError(error: any) {
    switch (error.code) {
  
      case 'auth/email-already-in-use':
       this.common.showErrorToast('This email is already registered.');
        break;
  
      case 'auth/invalid-email':
       this.common.showErrorToast('Invalid email format.');
        break;
  
      case 'auth/operation-not-allowed':
       this.common.showErrorToast('Email/password accounts are not enabled.');
        break;
  
      case 'auth/weak-password':
       this.common.showErrorToast('Password is too weak.');
        break;
  
      case 'auth/missing-email':
       this.common.showErrorToast('Email is required.');
        break;
  
      case 'auth/missing-password':
       this.common.showErrorToast('Password is required.');
        break;
  
      case 'auth/network-request-failed':
       this.common.showErrorToast('Network error.');
        break;
  
      case 'auth/too-many-requests':
       this.common.showErrorToast('Too many attempts. Try again later.');
        break;
  
      case 'auth/internal-error':
       this.common.showErrorToast('Internal server error.');
        break;
  
      default:
       this.common.showErrorToast('Unknown error:', error.message);
    }
  }
  goToSignin() {
    this.router.navigate(['/signin']);
  }
}
