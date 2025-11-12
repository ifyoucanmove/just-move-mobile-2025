import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared/shared-module';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Common } from '../services/common';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class SigninPage implements OnInit {
  signinForm!:FormGroup;
  showPassword: boolean = false;
  constructor(public fb:FormBuilder,
    public authService:AuthService,public common:Common,
    public location:Location,public router:Router) {
    // Initialize form in constructor to avoid formGroup error
    this.signinForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

 async ngOnInit() {
    const user = await this.authService.waitForAuthState();
    if(user){
      this.router.navigate(['/home']);
    }
  }

 async signin() {
    console.log(this.signinForm.value);
    try{
      let result = await this.authService.signInWithEmailAndPassword(this.signinForm.value.email, this.signinForm.value.password);
      console.log(result);
      if(result){
        this.common.showSuccessToast('Sign in successful');
        this.router.navigate(['/home']);
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
