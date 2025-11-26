import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Challenges } from 'src/app/services/challenges';
import { Customer } from 'src/app/services/customer';
import { User } from 'src/app/services/user';
import { Auth } from '@angular/fire/auth';
import { Completed } from 'src/app/services/completed';
import { AlertController } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { caretBackOutline, caretForwardOutline, heart, heartOutline } from 'ionicons/icons';
import { Favorites } from 'src/app/services/favorites';
import { Byo } from 'src/app/services/byo';
import { CompletedHistoryComponent } from 'src/app/shared/completed-history/completed-history.component';
import { MoodCaptureComponent } from 'src/app/shared/mood-capture/mood-capture.component';

@Component({
  selector: 'app-challenge-day',
  templateUrl: './challenge-day.page.html',
  styleUrls: ['./challenge-day.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class ChallengeDayPage implements OnInit {

  status: string = '';
  learnMoreClicked: boolean = false;

  promoImage: string = '';
  promoHeader: string = '';
  title: string = '';

  adTitle = "";
  adImageURL = "";
  adLink = "";

  dayImage: string = '';
  dayImageSuper: string = '';
  isSuperChallenge = false;
  video1: any;
  video2: any;
  video3: any;
  message: any;
  video4: any;
  video5: any;
  video6: any;
  dayDatas: any;

  videoTitle1 = "";
  videoTitle2 = "";
  videoTitle3 = "";

  id: string = '';
  hideVideo = false;

  userId: string = "";
  challengeId = "";
  watchData: any = {};
  isCompleted: boolean = false;
  watchDataLoaded: boolean = false;

  challengeWatchSubscription: Subscription = new Subscription();
  allChallengeWatchSubscription: Subscription = new Subscription();
  allWatchDataLoaded: boolean = false;
  allWatchData: any[] = [];
  customerDataLoaded: boolean = false;
  customerChallengeData: any = {};

  equipment = [];
  duration: number = 0;
  repeatCount: number = 0;
  isCompletedEmails!: boolean;
  isComboDetailsLoading: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private challengeService: Challenges,
    private customerService: Customer,
    private changeDetectorRef: ChangeDetectorRef,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private router: Router,
    private completedService: Completed,
    private afAuth: Auth,
    private byoService: Byo,
    private favoriteService : Favorites,
    private userService: User
  ) {
    addIcons({heartOutline, heart, caretBackOutline, caretForwardOutline})
  }

  ionViewWillEnter() {
    this.status = this.customerService.status || '';
  }

  ionViewWillLeave() {
    this.challengeWatchSubscription.unsubscribe();
    this.allChallengeWatchSubscription.unsubscribe();
  }

  ngOnInit() {
    
    this.id = this.route.snapshot.paramMap.get("id") || '';
    this.route.params.subscribe(async (param) => {
      let selectedIndex = this.challengeService.selectedChallengeIndex;
      this.userId = this.userService.email;
      this.challengeId = this.challengeService.challengeDatas[selectedIndex].id;
      this.title = this.challengeService.challengeDatas[selectedIndex].dashTitle;
      this.watchDataLoaded = false;
      this.loadChallengeWatchData();
      this.loadAllChallengeWatchData();

      let payload = {
        resource: "challenge-day",
        type: "view",
        challengeId: this.challengeId,
        module: "challenge",
        day : this.id
      };

    //  this.logService.logActivity("challenge-day", this.title + " - " + this.id, '', payload);
    //  this.logService.logChallengeDayAccess(this.userId, this.challengeId, this.id);

      this.promoImage = this.challengeService.challengeDatas[selectedIndex].nextAdBannerUrl;
      this.promoHeader = this.challengeService.challengeDatas[selectedIndex].nextAdBannerHeader;
      this.adTitle = this.challengeService.challengeDatas[selectedIndex].adTitle;
      this.adImageURL = this.challengeService.challengeDatas[selectedIndex].adImageURL;
      this.adLink = this.challengeService.challengeDatas[selectedIndex].adLink;
      if (this.customerService.isSuperChallenge) {
        this.isSuperChallenge = true;
      }

      this.isCompletedEmails = this.customerService.isCompletedEmails;
      console.log("Is completed service", this.isCompletedEmails);
      if (this.isCompletedEmails === undefined) {
        this.isCompletedEmails = true;
      }
      console.log("Is completed service", this.isCompletedEmails);

      const today = new Date().getTime();
      const show =
        this.challengeService.challengeDatas[selectedIndex].challengeEndDate.seconds * 1000;

      await this.getVideoOfTheDay();
      this.changeDetectorRef.detectChanges();
      if (today < show) {
        console.log(this.dayImage);
      }
    });
    var that = this;
    this.afAuth.onAuthStateChanged(function (user:any) {
      if (user) {
        that.loadCustomerData(user.email);
      }
    });
  }

  loadCustomerData(email: string) {
    this.customerService.loadCustomerSubscriptionDatas(email).subscribe((res: any) => {
      this.customerDataLoaded = true;
      console.log(res);
      if (res.length > 0) {
        res = res[0];
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
        repeatCount = this.customerChallengeData[this.challengeId].repeatCount;
      this.repeatCount = repeatCount;
      this.loadChallengeWatchData();
      this.loadAllChallengeWatchData();
    });
  }



  sendMail() {
    window.open("mailto:support@ifyoucanmove.com");
  }

  async PlayOnChromeCast(media:any) {
    // this.chromeCastService.loadMedia(media);
/*     const modal = await this.modalCtrl.create({
      component: ModalPage,
      cssClass: "available-device-modal",
      componentProps: {
        media: media,
      },
    });
    return await modal.present(); */
  }

  async getVideoOfTheDay() {
    let day = "challengeDay" + this.id;
    let nextDay = "challengeDay" + (parseInt(this.id) + 1);

    console.log("All datas", this.challengeService[day]);

    this.dayDatas = this.challengeService[day];
    this.dayImage = this.challengeService[day]?.image;
    this.dayImageSuper = this.challengeService[day]?.imageSuper;
    this.video1 = this.challengeService[day]?.url;
    this.video2 = this.challengeService[day]?.url2;
    this.video3 = this.challengeService[day]?.url3 ? this.challengeService[day].url3 : "";
    this.message = this.challengeService[day]?.message;
    this.hideVideo = this.challengeService[day].isVideoHidden || false;
    this.duration = this.challengeService[day]?.durationMinutes
      ? this.challengeService[day]?.durationMinutes
      : null;
    this.equipment = this.challengeService[day].equipment
      ? this.challengeService[day].equipment
      : [];

    this.video4 = this.challengeService[nextDay].url;
    this.video5 = this.challengeService[nextDay].url2;
    this.video6 = this.challengeService[nextDay].url3 ? this.challengeService[day].url3 : "";

    this.videoTitle1 = this.challengeService[day].title1 ? this.challengeService[day].title1 : "";
    this.videoTitle2 = this.challengeService[day].title2 ? this.challengeService[day].title2 : "";
    this.videoTitle3 = this.challengeService[day].title3 ? this.challengeService[day].title3 : "";
    console.log("Day Data", this.dayDatas);
    
    console.log("Titkles", this.videoTitle1, this.videoTitle2, this.videoTitle3);
  }

  openAccountPage() {
    this.router.navigateByUrl("/tabs/profile/subscription-billing");
  }

  loadChallengeWatchData() {
    if (!this.customerDataLoaded) return;
    console.log(this.repeatCount);
    this.challengeWatchSubscription = this.completedService
      .loadChallengeDayData(this.userId, this.id, this.challengeId, this.repeatCount)
      .subscribe((res) => {
        this.watchDataLoaded = true;
        if (res.length > 0) {
          this.watchData = res;
          console.log(this.watchData);
          this.isCompleted = true;
          console.log(
            Math.max.apply(
              Math,
              res.map(function (o:any) {
                return o.watchCount;
              })
            )
          );
        } else {
          this.isCompleted = false;
          this.watchData = null;
        }
      });
  }

  loadAllChallengeWatchData() {
    if (!this.customerDataLoaded) return;

    console.log(this.repeatCount);
    this.allChallengeWatchSubscription = this.completedService
      .loadChallengeWeekData(this.userId, this.challengeId, this.repeatCount)
      .subscribe((res) => {
        this.allWatchDataLoaded = true;
        this.allWatchData = res;
      });
  }

  getMaxWatchCount(): number {
    if (!this.watchData || !Array.isArray(this.watchData) || this.watchData.length === 0) return 0;
  
    return this.watchData.length;
  }

  isDayVideoWatched(day:any) {
    let data = this.allWatchData.filter((data) => {
      return data.day == String(day);
    });
    if (data.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  getDayWatchCount(day: any): number | string {
    if (!this.allWatchData || !Array.isArray(this.allWatchData)) return "";
  
    let data = this.allWatchData.filter((data: any) => data.day === String(day));
    return data.length > 1 ? data.length : "";
  }
  

  getNoOfDaysInWeek() {
    if (parseInt(this.id) > 21) {
      return parseInt(
        this.challengeService.challengeDatas[this.challengeService.selectedChallengeIndex]
          .weekFinalDayCount
      );
    } else {
      return 7;
    }
  }

  getWeekFirstDayNumber() {
    let day = parseInt(this.id);
    if (day < 8) {
      return 1;
    } else if (day < 15) {
      return 8;
    } else if (day < 22) {
      return 15;
    } else {
      return 22;
    }
  }

  async markAsComplete() {

    const modal = await this.modalCtrl.create({
      component: MoodCaptureComponent,
      componentProps: {
        data : null
      }
    });
    await modal.present();
    modal.onDidDismiss().then(data=>{
      if(data.data){
        this.doMarkAsComplete(data.data)
      }
    })

  }

  async doMarkAsComplete(completedData: any) {
    let selectedIndex = this.challengeService.selectedChallengeIndex;
    let challengeId = this.challengeService.challengeDatas[selectedIndex].id;
    let data: any = {
      challengeId: challengeId,
      userId: this.userService.email,
      day: this.id,
      category: "challenge",
      title: this.title,
      durationMinutes: this.duration || 0,
      watchCount: this.isCompleted ? this.getMaxWatchCount() + 1 : 1,
      date: new Date(),
      repeatCount: this.repeatCount,
      isCompletedEmails: this.isCompletedEmails === undefined ? true : this.isCompletedEmails,
      isEnergyDataAvailable : false
    };
    console.log("Passing data", data);
    if(completedData.energyData){
      data.isEnergyDataAvailable = true;
      data.energyData = completedData.energyData;
    }
    if (this.isCompleted) {
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
                    resource: "challenge-day",
                    type: "completed",
                    challengeId: this.challengeId,
                    module: "challenge",
                    day : this.id,
                    numberOfCompletion : data.watchCount
                  };
                //  this.logService.logActivity("challenge-day", `completed - ${this.title} - ${this.id} (${data.watchCount})`, '', payload);
                },
                (err) => {
               //   this.logService.logError("challenge-day", JSON.stringify(err));
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
            resource: "challenge-day",
            type: "completed",
            challengeId: this.challengeId,
            module: "challenge",
            day : this.id,
            numberOfCompletion : data.watchCount
          };
        //  this.logService.logActivity("challenge-day", `completed - ${this.title} - ${this.id} (${data.watchCount})`, '', payload);


        },
        (err) => {
       //   this.logService.logError("challenge-day", JSON.stringify(err));
        }
      );
    }
  }


  onVideoPlay(){
    let payload = {
      resource: "challenge-day",
      type: "play",
      challengeId: this.challengeId,
      module: "challenge",
      day : this.id
    };
  //  this.logService.logActivity("challenge-day", `video-played - ${this.title} - ${this.id}`, '', payload);
  }

  getDuration(duration:any): string {
    if (duration < 60) {
      return duration + "m";
    } else {
      return Math.floor(duration / 60) + "h " + (duration % 60) + "m";
    }
  }

  goToDayPage(day:any, type:any) {
    switch (type) {
      case 1:
        day = (parseInt(day) - 1).toString();
        break;
      case 2:
        day = (parseInt(day) + 1).toString();
        break;
    }
    if (day == "0") return;
    const today = new Date().getTime();
    const show =
      this.challengeService.challengeDatas[this.challengeService.selectedChallengeIndex]
        .challengeEndDate.seconds * 1000;

        let challenge = this.challengeService.challengeDatas[this.challengeService.selectedChallengeIndex];

        let totlaChallengeDays =   (parseInt(challenge.weekTotalCount, 10) - 1) * 7 +
        parseInt(challenge.weekFinalDayCount, 10);

    if (today < show && (type == 1 || day <= totlaChallengeDays)) {
      this.router.navigate(["/challenge/day", day], { skipLocationChange: true });
    }else if(type == 2 &&  day > totlaChallengeDays){
   //   this.toastService.presentToast("End of challenge")
    }
  }

  playCombo(id:string, name: string) {
    let comboDetails:any = null;
    this.isComboDetailsLoading = true;
    this.byoService.getCombodetialsByID(id).subscribe(async (res) => {
      comboDetails = res;
      for (let i = 0; i < comboDetails.comboWorkouts.length; i++) {
        await this.byoService
          .loadPostAsPromise(comboDetails.comboWorkouts[i].workoutId)
          .then((data) => {
            console.log("data", data?.data());

            comboDetails.comboWorkouts[i].postDetails = data?.data();
          });
      }
      console.log("Details loaded", comboDetails);
      this.isComboDetailsLoading = false;
      comboDetails.comboWorkouts = comboDetails.comboWorkouts.filter(
        (workout: any) => workout.postDetails
      );

      let data = {
        comboDetails: comboDetails,
        comboId: id,
        comboName: name,
      };
      this.router.navigate(["/tabs/byo/play-combo"], { state: data });

      // this.downloadCombos();
    });
  }

  viewWorkouts(id:string) {
    this.router.navigate(["/tabs/byo/combo-details"], { queryParams: { id: id } });
  }



  addToFavList(): void {
    
    const favItem: any = {
      day : this.id,
      postId: this.challengeId + ":" + this.id,
      challengeId: this.challengeId,
      email: this.userService.email,
      dateCreated: new Date(),
      title: this.title + " : Day " + this.id,
      image: this.dayImage,
      type: 'challenge',
      durationMinutes: this.duration,
    };
    
    console.log("Add to fav", favItem);
    this.favoriteService.addFavoriteItem(favItem).subscribe(
      (res) => {
        console.log(res);


      },
      (err) => {
      
      }
    );
  }

  removeFromFavList(): void {
    const key = "fav::" + this.userService.email;
    const favoriteList = JSON.parse(localStorage.getItem(key) || '[]');
    const favItem = favoriteList.filter((item: { postId: string; }) => item.postId === this.challengeId + ":" + this.id)[0];
    this.favoriteService.deleteFavoriteItem(favItem.id).subscribe((res) => {
   //   this.logService.logActivity(  'challenge-day', `favorite-removed  - ${this.title} - day ${this.id}`, '',{resource :"challenge-day", type:"remove-favourite", challengeId:this.challengeId, day:this.id , module :"challenge"});

    });
  }

  checkFavorites(id:string) {
    const key = "fav::" + this.userService.email;
    const favoriteList = JSON.parse(localStorage.getItem(key) || '[]');
    return favoriteList
      ? favoriteList.filter((item:any) => item.postId ===this.challengeId + ":" +id).length
      : favoriteList;
  }

    async completedHistory(){
   const modal = await this.modalCtrl.create({
    component : CompletedHistoryComponent,
    componentProps : {
      type : 'challenge',
      postId : this.challengeId,
      userId : this.userId,
      title : this.title,
      day: this.id,
      repeatCount: this.repeatCount
    }
   });
   modal.present();
  }


}

