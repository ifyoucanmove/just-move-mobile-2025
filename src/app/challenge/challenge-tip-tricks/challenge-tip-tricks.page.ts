import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { Subscription } from 'rxjs';
import { Challenges } from 'src/app/services/challenges';
import { Completed } from 'src/app/services/completed';
import { User } from 'src/app/services/user';
import { Customer } from 'src/app/services/customer';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth';
import { MoodCaptureComponent } from 'src/app/shared/mood-capture/mood-capture.component';
import { CompletedHistoryComponent } from 'src/app/shared/completed-history/completed-history.component';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
@Component({
  selector: 'app-challenge-tip-tricks',
  templateUrl: './challenge-tip-tricks.page.html',
  styleUrls: ['./challenge-tip-tricks.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class ChallengeTipTricksPage implements OnInit {

  title: any;
  challengeId = '';

  videoWatchSubscription: Subscription = new Subscription();
  userId: string = "";
  watchData: any[] = [];
  watchDataLoaded: boolean = false;

  isCompletedEmails: boolean = false;


  constructor(
    private challengeService: Challenges,
    private completedService: Completed,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private customerService : Customer,
    private userService: User,
    private modalCtrl : ModalController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(async (param) => {
      let selectedIndex = this.challengeService.selectedChallengeIndex;
      this.userId = this.userService.email;
      this.challengeId = this.challengeService.challengeDatas[selectedIndex].id;
      this.watchDataLoaded = false;
      this.loadVideoWatchData();
    });
    this.userId = this.userService.email;
  }

  ionViewWillEnter() {
    this.title = this.challengeService.challengeDatas[
      this.challengeService.selectedChallengeIndex
    ].dashTitle;
    this.challengeId = this.challengeService.challengeDatas[
      this.challengeService.selectedChallengeIndex
    ].id;
    console.log("Challenge id", this.challengeId);
    this.isCompletedEmails = this.customerService.isCompletedEmails;
    console.log("Is completed service", this.isCompletedEmails);
    if (this.isCompletedEmails === undefined) {
      this.isCompletedEmails = true;
    }
  }

  loadVideoWatchData() {
    this.videoWatchSubscription = this.completedService
      .loadChallengeWarmUpCoolDownData(
        this.userId,
        this.challengeId,
        "challenge-warm-up"
      )
      .subscribe((res) => {
        console.log('loadChallengeWarmUpCoolDownData',res);
        
        this.watchDataLoaded = true;
        if (res.length > 0) {
          this.watchData = res;
        } else {
          this.watchData = [];
        }
      });
  }

  async markAsComplete(videoName:string, duration:any) {
      const modal = await this.modalCtrl.create({
        component: MoodCaptureComponent,
        componentProps: {
          data : null
        }
      });
      await modal.present();
      modal.onDidDismiss().then(data=>{
        if(data.data){
          this.doMarkAsComplete(videoName, duration, data.data)
        }
      }) 
  
    }

  async doMarkAsComplete(videoName:string, duration:any, completedData: any) {
    let selectedIndex = this.challengeService.selectedChallengeIndex;
    let challengeId = this.challengeService.challengeDatas[selectedIndex].id;
    let data: any = {
      challengeId: challengeId,
      userId:  this.userService.email,
      category: "challenge-warm-up",
      title: videoName + " - " + this.title,
      durationMinutes: duration,
      watchCount: this.isVideoCompleted(videoName + " - " + this.title) ? this.getMaxWatchCount(videoName + " - " + this.title) + 1 : 1,
      date: new Date(),
      isCompletedEmails:
      this.isCompletedEmails === undefined ? true : this.isCompletedEmails,
      isEnergyDataAvailable : false,
    };
    console.log("Passing data", data);
    if(completedData.energyData){
      data.isEnergyDataAvailable = true;
      data.energyData = completedData.energyData;
    }
    if (this.isVideoCompleted(videoName + " - " + this.title)) {
      const alert = await this.alertController.create({
        header: "Alert",
        mode: "ios",
        message: "Are you sure you want to mark this video as complete again?",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
            handler: (blah) => {},
          },
          {
            text: "Yes",
            handler: () => {
              this.completedService.addNewData(data).subscribe(
                (res) => {
                  let payload = {
                    resource :"challenge-warmup", type:"completed", challengeId:this.challengeId, warmupvideo: videoName  , numberOfCompletion: data.watchCount, module :"challenge"
                  }
                },
                (err) => {
                
                }
              );
            },
          },
        ],
      });
      await alert.present();
    } else {
    this.completedService.addNewData(data).subscribe(
      (res) => {
        let payload = {
          resource :"challenge-warmup", type:"completed", challengeId:this.challengeId, warmupvideo: videoName  , numberOfCompletion: data.watchCount, module :"challenge"
        }
      },
      (err) => {
       
      }
    );
    }
  }


  isVideoCompleted(name: string) {
    return (
      this.watchData.filter((data) => data.title == name)
        .length > 0
    );
  }



  getMaxWatchCount(name: string): number {
    if (!this.watchData || !Array.isArray(this.watchData)) return 0;
    const count = this.watchData.filter((data: any) => data.title === name).length;
    return count > 0 ? count : 0;
  }



  videoPlayed(name : string){
    let payload= {
      resource :"challenge-warmup", type:"view", challengeId:this.challengeId, warmupvideo: name , module :"challenge"
    }
  }

  async completedHistory(name: string){
    const modal = await this.modalCtrl.create({
    component : CompletedHistoryComponent,
    componentProps : {
      type : 'cool-downs',
      postId : this.challengeId,
      userId : this.userId,
      title : this.title,
      category: 'challenge-warm-up',
      name: name
    }
    });
    modal.present(); 
  }
}
