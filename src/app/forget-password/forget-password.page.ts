import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared/shared-module';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { Common } from '../services/common';
import { Logging } from '../services/logging';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class ForgetPasswordPage implements OnInit {

  forgetPasswordForm!:FormGroup;
  constructor(public router:Router,public location:Location,
    public common:Common,
    public fb:FormBuilder,public authService:AuthService,public logService:Logging) {
      this.forgetPasswordForm = this.fb.group({
        email: ['', Validators.required]
      });
     }

 async ngOnInit() {
    const user = await this.authService.waitForAuthState();
    if(user){
      this.router.navigate(['/products/home-tab']);
    }
    this.logService.logActivity({
      activity: 'Forget password page loaded.',
      page: 'forget-password'
    });
  }

  goToSignin() {
    this.router.navigate(['/signin']);
  }
  goBack() {
    this.location.back();
  }

  async submitForm() {
    if(this.forgetPasswordForm.valid){
      try{
        let result = await this.authService.sendPasswordResetEmail(this.forgetPasswordForm.value.email);
        if(result){
          this.router.navigate(['/signin']);
          this.common.showSuccessToast('Password reset email sent');
          this.logService.logActivity(
            {
              activity: 'Reset password button clicked.',
              page: 'forget-password',
              payload: {
                email: this.forgetPasswordForm.value.email,
              },
            }
          );
        }
      }catch(error:any){
        console.log(error);
        this.handleFirebaseError(error);
        this.logService.logError(
          {
            error: error,
            activity: 'Reset password button clicked.',
            page: 'forget-password',
            payload: {
              email: this.forgetPasswordForm.value.email,
            },
          }
        );
      }
    }else{
      console.log('Form is not valid');
    }
  }

  handleFirebaseError(error: any) {
    console.log(error.code);
    switch (error.code) {
      case 'auth/invalid-email':
        console.log('Invalid email format.');
        this.common.showErrorToast('Invalid email');
        break;
  
      case 'auth/user-not-found':
        console.log('No user found with this email.');
        this.common.showErrorToast('No user found with this email');
        break;
  
      case 'auth/missing-email':
        console.log('Email is required.');
        this.common.showErrorToast('Email is required');
        break;
  
      case 'auth/too-many-requests':
        console.log('Too many attempts. Try again later.');
        this.common.showErrorToast('Too many attempts. Try again later.');
        break;
  
      case 'auth/network-request-failed':
        console.log('Network error. Check your internet connection.');
        this.common.showErrorToast('Network error. Check your internet connection.');
        break;
  
      case 'auth/internal-error':
        console.log('Internal server error.');
        this.common.showErrorToast('Internal server error.');
        break;
  
      default:
        console.log('Unknown error:', error.message);
        this.common.showErrorToast('Unknown error');
    }
  }

}
