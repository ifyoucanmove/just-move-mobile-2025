import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';

import { Challenges } from 'src/app/services/challenges';
import { User } from 'src/app/services/user';
import { ActivatedRoute } from '@angular/router';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.page.html',
  styleUrls: ['./feedback.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class FeedbackPage implements OnInit {

  clicked = false;
  feedbackForm!: FormGroup;
  title: any;
  userDetails: any;

  constructor(
    private formBuilder: FormBuilder,
    private firestore: Firestore,
    private challengeService: Challenges,
    private route: ActivatedRoute,
    private userService: User,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.feedbackForm = this.formBuilder.group({
      recommend: new FormControl("", Validators.compose([Validators.required])),
      experience: new FormControl(""),
      fb: new FormControl(""),
      benefit: new FormControl(""),
      better: new FormControl(""),
    });
    this.route.queryParams.subscribe((param) => {
      this.title = this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].dashTitle;
    });
   this.userDetails = this.authService.userDetails;

  }

  submitFeedback() {
    const data = {
      for:
        this.challengeService.challengeDatas[
          this.challengeService.selectedChallengeIndex
        ].dashTitle || null,
      recommend: this.feedbackForm.value.recommend || null,
      experience: this.feedbackForm.value.experience || null,
      fb: this.feedbackForm.value.fb || null,
      benefit: this.feedbackForm.value.benefit || null,
      better: this.feedbackForm.value.better || null,
      authorName:
        this.userDetails.fname +
          this.userDetails.lname ||
        this.userDetails.email,
      authorId: this.userDetails.uid,
      authorEmail: this.userDetails.email || null,
      datePublished: new Date(),
    };
    console.log(data);

   /*  this.firestore
      .collection("feedback")
      .add(data)
      .catch((error) => {
   
        return;
      }); */

      let ref = collection(this.firestore, `feedback`);
      addDoc(ref, data).then((res)=> {
        console.log(res);
      }).catch((error)=> {
        console.log(error);
      });

      let id = this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].id;
      let payload = {
        resource :"challenge-feedback", type:"feedback", challengeId:id , module :"challenge"
      }
   
    this.feedbackForm.reset();
    this.clicked = true;
  }
}
