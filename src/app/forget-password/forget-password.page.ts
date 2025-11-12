import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared/shared-module';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

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
    public fb:FormBuilder,public authService:AuthService) { }

  ngOnInit() {
    this.forgetPasswordForm = this.fb.group({
      email: ['', Validators.required]
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
        }
      }catch(error){
        console.log(error);
      }
    }else{
      console.log('Form is not valid');
    }
  }

}
