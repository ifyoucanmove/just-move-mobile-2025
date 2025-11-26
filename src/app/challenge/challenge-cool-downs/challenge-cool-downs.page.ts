import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Completed } from 'src/app/services/completed';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/services/user';
import { Challenges } from 'src/app/services/challenges';
import { Customer } from 'src/app/services/customer';
import { AlertController, ModalController } from '@ionic/angular/standalone';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { MoodCaptureComponent } from 'src/app/shared/mood-capture/mood-capture.component';
import { CompletedHistoryComponent } from 'src/app/shared/completed-history/completed-history.component';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';


@Component({
  selector: 'app-challenge-cool-downs',
  templateUrl: './challenge-cool-downs.page.html',
  styleUrls: ['./challenge-cool-downs.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class ChallengeCoolDownsPage implements OnInit {

  title: any;
  videoWatchSubscription: Subscription = new Subscription();

  userId: string = "";
  challengeId = "";
  watchData: any[] = [];
  watchDataLoaded: boolean = false;

  isCompletedEmails: boolean = false;

  constructor(
    private challengeService: Challenges,
    private completedService: Completed,
    private route: ActivatedRoute,
    private customerService : Customer,
    private userService: User,
    private modalCtrl : ModalController,
    private alertController: AlertController
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
    this.title =
      this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].dashTitle;

      this.isCompletedEmails = this.customerService.isCompletedEmails;
     if (this.isCompletedEmails === undefined) {
        this.isCompletedEmails = true;
      }
  }

  loadVideoWatchData() {
    this.videoWatchSubscription = this.completedService
      .loadChallengeWarmUpCoolDownData(
        this.userId,
        this.challengeId,
        "challenge-cool-down"
      )
      .subscribe((res) => {
        this.watchDataLoaded = true;
        if (res.length > 0) {
          this.watchData = res;
          console.log(this.watchData);
          console.log(
            Math.max.apply(
              Math,
              res.map(function (o:any) {
                return o.watchCount;
              })
            )
          );
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

  async doMarkAsComplete(videoName:any, duration:any, complatedData: any) {
    let selectedIndex = this.challengeService.selectedChallengeIndex;
    let challengeId = this.challengeService.challengeDatas[selectedIndex].id;
    let data:any = {
      challengeId: challengeId,
      userId: this.userService.email,
      category: "challenge-cool-down",
      title: videoName + " - " + this.title,
      durationMinutes: duration,
      watchCount: this.isVideoCompleted(videoName + " - " + this.title) ? this.getMaxWatchCount(videoName + " - " + this.title) + 1 : 1,
      date: new Date(),
      isCompletedEmails:
      this.isCompletedEmails === undefined ? true : this.isCompletedEmails,
      isEnergyDataAvailable : false
    };
    console.log("Passing data", data);
    if(complatedData.energyData){
      data.isEnergyDataAvailable = true;
      data.energyData = complatedData.energyData;
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
                    resource :"challenge-cooldown", type:"completed", challengeId:this.challengeId, cooldownvideo: videoName  , numberOfCompletion: data.watchCount, module :"challenge"
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
          resource :"challenge-cooldown", type:"completed", challengeId:this.challengeId, cooldownvideo: videoName  , numberOfCompletion: data.watchCount, module :"challenge"
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
  return this.watchData.filter((data: any) => data.title === name).length;
}

  videoPlayed(name : string){
    let payload= {
      resource :"challenge-cooldown", type:"view", challengeId:this.challengeId, cooldownvideo: name , module :"challenge"
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
      category: 'challenge-cool-down',
      name: name
    }
   });
   modal.present(); 
  }
}
