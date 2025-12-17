import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared/shared-module';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Common } from '../services/common';
import { Challenges } from '../services/challenges';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class SignupPage implements OnInit {

  signupForm!:FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(public fb:FormBuilder,public router:Router,
    public common:Common,
    public authService:AuthService,
    public location:Location,
    private challengeService: Challenges) { 
      this.signupForm = this.fb.group({
        name: ['', [Validators.required]],
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
      this.router.navigate(['/home'], { replaceUrl: true });
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

  get nameControl() {
    return this.signupForm.get('name');
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
    if(this.signupForm.valid){
    try{
        let result = await this.authService.signUpWithEmailAndPassword(this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.name);
        if(result){
          this.common.showSuccessToast('Sign up successful');
          // Load challenge data after successful signup
          this.challengeService.loadAllChallengeData();
          this.router.navigate(['/home'], { replaceUrl: true });
        }
      }catch(error:any){
        if(error.code === 'auth/email-already-in-use'){
          this.common.showErrorToast('Email already in use');
        }
        else if(error.code === 'auth/invalid-email'){
          this.common.showErrorToast('Invalid email');
        }
        else{
          this.common.showErrorToast('Something went wrong');
        }
      }
    }else{
      console.log('Form is not valid');
    }
  }
  goToSignin() {
    this.router.navigate(['/signin']);
  }
}
