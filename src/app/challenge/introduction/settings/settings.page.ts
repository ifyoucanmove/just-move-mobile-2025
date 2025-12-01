import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { Challenges } from 'src/app/services/challenges';
import { ActivatedRoute } from '@angular/router';
import { Customer } from 'src/app/services/customer';
import { User } from 'src/app/services/user';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class SettingsPage implements OnInit {

  timelineInfo: any = {};
  userId: any;
  customerDataLoaded: boolean = false;
  customerChallengeData: any = {};
  challengeId: any;
  repeatCount: number = 0;
  isCompletedEmails!: boolean;
  completedEmailForm!: FormGroup;

  constructor(
    private challengeService: Challenges,
    private route: ActivatedRoute,
    private customerService: Customer,
    private alertController: AlertController,
    private formBuilder : FormBuilder,
    private userService: User
  ) {}

  ionViewWillEnter() {
  
  }

  ngOnInit() {
    this.userId = this.userService.email;
    this.completedEmailForm = this.formBuilder.group({
      isCompletedEmails : new FormControl(true)
    })
    this.route.queryParams.subscribe((res) => {
      let selectedIndex = this.challengeService.selectedChallengeIndex;
      this.challengeId = this.challengeService.challengeDatas[selectedIndex]?.id;
      this.timelineInfo = {
        title: this.challengeService.challengeDatas[selectedIndex]?.dashTitle,
      };
      console.log("COmpleted Emails ", this.customerService.isCompletedEmails);
      
      this.isCompletedEmails = this.customerService.isCompletedEmails;
      if (this.isCompletedEmails === undefined) {
        this.isCompletedEmails = true;
      }
      this.completedEmailForm.patchValue({
        isCompletedEmails : this.isCompletedEmails
      })
    });
    var that = this;
    if (this.userService.email) {
        that.loadCustomerData(this.userService.email);
      }
  
  }

  loadCustomerData(email:string) {
    this.customerService
      .customer$
      .subscribe((res: any) => {
        this.customerDataLoaded = true;
        console.log(res);
        if (res) {
          // res = res[0];
          if (res.challengeData) {
            this.customerChallengeData = res.challengeData;
            console.log("Here", res.challengeData);
          } else {
            this.customerChallengeData = {};
          }
        } else {
          this.customerChallengeData = {};
        }
        let repeatCount = 0;
        if (
          this.customerChallengeData[this.challengeId] &&
          this.customerChallengeData[this.challengeId].repeatCount
        )
          repeatCount = this.customerChallengeData[this.challengeId]
            .repeatCount;
        this.repeatCount = repeatCount;
      });
  }

  async resetChallengeData() {
    const alert = await this.alertController.create({
      header: "Alert",
      mode: "ios",
      message: "Are you sure you want to reset the challenge watch datas?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: (blah) => {},
        },
        {
          text: "Yes",
          handler: () => {
            let challengeData: any = {};
            if (
              this.customerChallengeData[this.challengeId] &&
              this.customerChallengeData[this.challengeId].repeatCount
            ) {
              challengeData = {
                ...this.customerChallengeData,
                [this.challengeId]: {
                  repeatCount: this.repeatCount + 1,
                  updatedDate: new Date(),
                },
              };
            } else {
              challengeData = {
                ...this.customerChallengeData,
                [this.challengeId]: {
                  repeatCount: 1,
                  updatedDate: new Date(),
                },
              };
            }

            let data: any = {
              challengeData: challengeData,
            };
            console.log(data);

            this.customerService
              .updateCustomer(this.userId, data)
              .subscribe((res) => {
               
                let payload = {
                  resource :"challenge-setting", type:"reset-watch-data" , challengeId:this.challengeId , module :"challenge"
                }
              });
          },
        },
      ],
    });
    await alert.present();
  }


  toggle(){
    console.log("Here");
    
    this.customerService.updateCustomer(this.userId, {
      isCompletedEmails: this.completedEmailForm.value.isCompletedEmails
    }).subscribe(() => {

      if (!this.completedEmailForm.value.isCompletedEmails) {
      //  this.toastService.presentToast("You will no longer receive emails after completing challenge videos!");
      }

      let payload = {
        resource :"challenge-setting", type:"completed-email-toggle" , challengeId:this.challengeId , module :"challenge", value: this.completedEmailForm.value.isCompletedEmails ,
      }
    //  this.logService.logActivity("challenge-settings", `receive-completed-email-toggled - ${this.completedEmailForm.value.isCompletedEmails}`,  '', payload);


    });
  }
}
