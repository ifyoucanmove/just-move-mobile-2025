import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Challenges } from 'src/app/services/challenges';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from 'src/app/services/customer';
import { Subscription } from 'rxjs';
import { Completed } from 'src/app/services/completed';
import { Auth } from '@angular/fire/auth';
import { User } from 'src/app/services/user';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';

@Component({
  selector: 'app-challenge-home',
  templateUrl: './challenge-home.page.html',
  styleUrls: ['./challenge-home.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class ChallengeHomePage implements OnInit {
  title = "";
  menuButton = false;

  showChallenge = true;
  showWeek1Menu = true;
  showWeek2Menu = true;
  showWeek3Menu = true;
  showWeek4Menu = true;
  showWeek5Menu = true;
  showMaterials = true;

  challengeId = "";
  watchData:any = [];
  isCompleted: boolean = false;
  watchDataLoaded: boolean = false;
  challengeWatchSubscription: Subscription = new Subscription();
  userId: any;
  week4DayCount!: number;
  weekFinalDayCount!: number;
  customerChallengeData:any = {};
  customerDataLoaded: boolean = false;
  repeatCount: number = 0;
  totalDays!: number;
  weekCount!: number;

  isMiniChallenge = false;
  isTrial = false;
  isMiniChallengePaid!: boolean;

  isMiniSubscription: boolean = false;
  linkFullChallenge = "";

  challengeDatas : any = {};

  previewVideo1 : any = '';
  previewVideo2 : any = '';
  previewVideo3 : any = '';

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  posterUrl: string = '';

  constructor(
    private challengeService: Challenges,
    private route: ActivatedRoute,
    private router: Router,
    private completedService: Completed,
    private afAuth: Auth,
    private customerService: Customer,
    private userService: User
  ) {}

  ionViewWillLeave() {
    this.challengeWatchSubscription.unsubscribe();
  }



  ngOnInit() {
  
   this.userId = this.userService.email;
    this.route.queryParams.subscribe((param) => {
     console.log("this.challengeService.challengeDatas", this.challengeService.challengeDatas);
     let index = this.challengeService.challengeDatas.findIndex((item:any) => item.id == "yNObVzzG2h62C8I3PlA8");
     console.log("index", index);
     this.challengeService.selectedChallengeIndex = index;
      let selectedIndex = index;
      this.title =
        this.challengeService.challengeDatas[selectedIndex].dashTitle;
      this.linkFullChallenge = this.challengeService.challengeDatas[
        selectedIndex
      ].linkFullChallenge
        ? this.challengeService.challengeDatas[selectedIndex].linkFullChallenge
        : "";
      this.isMiniChallenge =
        this.challengeService.challengeDatas[selectedIndex]._isMiniChallenge;
      this.challengeDatas =
        this.challengeService.challengeDatas[selectedIndex];
      //  console.log("this.challengeDatas", this.challengeDatas.previewVideo1);
      this.challengeDatas = this.challengeService.challengeDatas.find((item:any) => item.id == "yNObVzzG2h62C8I3PlA8");
    //find index of this.challengeDatas
  
    console.log("result", this.challengeService.challengeDatas[index]);
     // this.checkDatas();
      this.loadChallengeWatchData();
      this.challengeId = this.challengeService.challengeDatas[selectedIndex].id;
      this.totalDays =
        (parseInt(
          this.challengeService.challengeDatas[selectedIndex].weekTotalCount,
          10
        ) -
          1) *
          7 +
        parseInt(
          this.challengeService.challengeDatas[selectedIndex].weekFinalDayCount,
          10
        );
      this.weekCount = Number(
        this.challengeService.challengeDatas[selectedIndex].weekTotalCount
      );
      if (this.totalDays > 25) {
        this.week4DayCount = 7;
        this.weekFinalDayCount = 2;
      } else {
        this.week4DayCount = this.totalDays - 21;
        this.weekFinalDayCount = 0;
      }

      this.watchDataLoaded = false;
    });
    if (this.router.getCurrentNavigation()?.extras.state) {
      this.menuButton = true;
    } else {
      this.menuButton = false;
    }
    var that = this;
    this.afAuth.onAuthStateChanged(function (user) {
      if (user) {
        that.loadCustomerData(user.email);
      }
    });
  }

  ngAfterViewInit() {
    // Subscribe to query parameters
    this.route.queryParams.subscribe((params) => {
      const previewBanner1 = params['previewBanner1'] || this.challengeDatas.previewBanner1;
      if (previewBanner1) {
        this.posterUrl = previewBanner1;
      } else {
        this.setVideoFrameAsPoster();
      }
    });
  }

  setVideoFrameAsPoster() {
    if (!this.videoElement) return;
  
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
  
    // Wait until video can play
    video.addEventListener('canplay', () => {
      video.currentTime = 2; // Seek to 2 seconds
    }, { once: true });
  
    // Draw frame when seek completes
    video.addEventListener('seeked', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.posterUrl = canvas.toDataURL('image/jpeg');
    }, { once: true });
  }


  loadCustomerData(email:any) {
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
        repeatCount =
        this.customerChallengeData[this.challengeId]?.repeatCount ?? 0;
        this.repeatCount = repeatCount;
        this.loadChallengeWatchData();
      });
  }

  checkDatas() {
    const today = new Date().getTime();
    const show =
      this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].challengeEndDate.seconds * 1000;
    const materials =
      this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].materialOpens.seconds * 1000;
    const w1 =
      this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].week1Opens.seconds * 1000;
    const w2 =
      this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].week2Opens.seconds * 1000;
    const w3 =
      this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].week3Opens.seconds * 1000;
    const w4 =
      this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].week4Opens.seconds * 1000;

    this.showChallenge = today < show ? true : false;
    console.log("COming here", this.challengeDatas);
    try {
      this.isMiniSubscription = this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].is7Days
        ? this.challengeService.challengeDatas[
            this.challengeService.selectedChallengeIndex
          ].is7Days
        : false;
    } catch (error) {
      console.log("Inisde error", error);
    }
    console.log("COming here");

    if (this.isMiniChallenge) {
      if (today > w1) {
        this.showWeek1Menu = true;
      }
      this.showMaterials = false;
      this.showWeek2Menu = false;
      this.showWeek3Menu = false;
      this.showWeek4Menu = false;
    }
    //  else if (this.isMiniSubscription) {
    //   console.log("Is Mini");

    //   if (today > w1) {
    //     this.showWeek1Menu = true;
    //   }
    //   this.showMaterials = today > materials ? true : false;
    //   this.showWeek2Menu = false;
    //   this.showWeek3Menu = false;
    //   this.showWeek4Menu = false;
    //   this.showWeek5Menu = false;
    // }
     else {
      console.log("Else");
      this.showMaterials = today > materials ? true : false;
      this.showWeek1Menu = today > w1 ? true : false;
      this.showWeek2Menu = today > w2 ? true : false;
      this.showWeek3Menu = today > w3 ? true : false;
      this.showWeek4Menu = today > w4 ? true : false;
      this.showWeek5Menu = today > w4 ? true : false;
    }
  }

  loadChallengeWatchData() {
    if (!this.customerDataLoaded) return;
    console.log(
      "Data passing",
      this.userId,
      this.challengeId,
      this.repeatCount
    );

    this.challengeWatchSubscription = this.completedService
      .loadChallengeWeekData(this.userId, this.challengeId, this.repeatCount)
      .subscribe((res) => {
        this.watchDataLoaded = true;
        this.watchData = res;
      });
  }

  isDayVideoWatched(day: number) {
    let data = this.watchData.filter((data:any) => {
      return data.day == String(day);
    });
    if (data.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  getDayWatchCount(day:number) {
    let data = this.watchData.filter((data:any) => {
      return data.day == String(day);
    });
    if (data.length > 0) {
      let count = Math.max.apply(
        Math,
        data.map(function (watchData:any) {
          return watchData.watchCount;
        })
      );
      if (count > 1) return count;
      else return "";
    } else {
      return "";
    }
  }



  async weekClicked(week: number){
 
    switch(week){
      case 1 :
        break;
        case 2 : 
        this.router.navigate(['challenge/challenge-week2'])
        break;
        case 3 : 
        this.router.navigate(['challenge/challenge-week3'])
        break;
        case 4 : 
        this.router.navigate(['challenge/challenge-week4'])
        break;
        case 5 : 
        this.router.navigate(['/tabs/challenge/week5'])
        break;
        
  }
  }

  onVideoPlay(){
    let payload = {
      resource: "challenge-preview",
      type: "play",
      challengeId: this.challengeId,
      module: "challenge",
    };
  }

  addMeasurement(){
    this.router.navigate(['/tabs/challenge/measurements'], {queryParams : {type : 'challenge', challengeId : this.challengeId}});
  }

}
