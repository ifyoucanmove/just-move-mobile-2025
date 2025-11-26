import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { WeekSelectorComponent } from 'src/app/shared/week-selector/week-selector.component';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { Challenges } from 'src/app/services/challenges';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from 'src/app/services/customer';
import { Completed } from 'src/app/services/completed';
import { Auth } from '@angular/fire/auth';
import { User } from 'src/app/services/user';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular/standalone';
@Component({
  selector: 'app-challenge-week3',
  templateUrl: './challenge-week3.page.html',
  styleUrls: ['./challenge-week3.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent, WeekSelectorComponent]
})
export class ChallengeWeek3Page implements OnInit {

  isSuperChallenge = false;
  challengeDay15: any = {};
  challengeDay16: any = {};
  challengeDay17: any = {};
  challengeDay18: any = {};
  challengeDay19: any = {};
  challengeDay20: any = {};
  challengeDay21: any = {};
  week3Message: string = '';
  daysOfTheWeek: string[] = [];
  title: any;

  challengeId = "";
  watchData:any = [];
  isCompleted: boolean = false;
  watchDataLoaded: boolean = false;
  challengeWatchSubscription: any = new Subscription();
  userId: any;
  customerDataLoaded: boolean = false;
  customerChallengeData: any = {};
  repeatCount: number = 0;
  days:any;
  isPastChallenge: boolean = false;
  userEmail: string = ''

  constructor(
    private challengeService: Challenges,
    private router: Router,
    private route: ActivatedRoute,
    private customerService: Customer,
    private completedService: Completed,
    private afAuth: Auth,
    private alertController : AlertController,
    private userService: User
  ) {}

  async ngOnInit() {
  
    this.route.queryParams.subscribe((param) => {
      this.loadDatas();
    });
    var that = this;
    this.afAuth.onAuthStateChanged(function (user) {
      if (user) {
        that.loadCustomerData(user.email);
      }
    });
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
          repeatCount = this.customerChallengeData[this.challengeId]
            .repeatCount;
        this.repeatCount = repeatCount;
        this.loadChallengeWatchData();
      });
  }

  ionViewWillLeave() {
    this.challengeWatchSubscription.unsubscribe();
  }

  async loadDatas() {
    let selectedIndex = this.challengeService.selectedChallengeIndex;
    this.userId = this.userService.email;
    this.challengeId = this.challengeService.challengeDatas[selectedIndex].id;
    this.isPastChallenge = this.challengeService.challengeDatas[selectedIndex]._statusSuper === 'active';
    this.watchDataLoaded = false;
    this.loadChallengeWatchData();
    if (this.customerService.isSuperChallenge) {
      this.isSuperChallenge = true;
    }
    this.challengeDay15 = {};
    this.challengeDay16 = {};
    this.challengeDay17 = {};
    this.challengeDay18 = {};
    this.challengeDay19 = {};
    this.challengeDay20 = {};
    this.challengeDay21 = {};
    this.title = this.challengeService.challengeDatas[selectedIndex].dashTitle;
    this.week3Message = this.challengeService.challengeDatas[
      selectedIndex
    ].week3Message;
    this.daysOfTheWeek = this.challengeService.getDaysOfTheWeek(
      this.challengeService.challengeDatas[selectedIndex].weeklyFirstDay,
      7
    );
    await this.challengeService.getActiveChallengeVideosData();
    this.challengeDay15 = this.challengeService.challengeDay15;
    this.challengeDay16 = this.challengeService.challengeDay16;
    this.challengeDay17 = this.challengeService.challengeDay17;
    this.challengeDay18 = this.challengeService.challengeDay18;
    this.challengeDay19 = this.challengeService.challengeDay19;
    this.challengeDay20 = this.challengeService.challengeDay20;
    this.challengeDay21 = this.challengeService.challengeDay21;
    this.days = [
      {
        isWatched: this.isDayVideoWatched(15),
        day: 15,
        dayData: this.challengeDay15,
        dayOfWeek: 0,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(16),
        day: 16,
        dayData: this.challengeDay16,
        dayOfWeek: 1,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(17),
        day: 17,
        dayData: this.challengeDay17,
        dayOfWeek: 2,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(18),
        day: 18,
        dayData: this.challengeDay18,
        dayOfWeek: 3,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(19),
        day: 19,
        dayData: this.challengeDay19,
        dayOfWeek: 4,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(20),
        day: 20,
        dayData: this.challengeDay20,
        dayOfWeek: 5,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(21),
        day: 21,
        dayData: this.challengeDay21,
        dayOfWeek: 6,
        load: false
      },
    ];
  }

  getChallengeImage(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay15?.image;
      case 1:
        return this.challengeDay16?.image;
      case 2:
        return this.challengeDay17?.image;
      case 3:
        return this.challengeDay18?.image;
      case 4:
        return this.challengeDay19?.image;
      case 5:
        return this.challengeDay20?.image;
      case 6:
        return this.challengeDay21?.image;
    }
  }

  getChallengeVideo(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay15.url;
      case 1:
        return this.challengeDay16.url;
      case 2:
        return this.challengeDay17.url;
      case 3:
        return this.challengeDay18.url;
      case 4:
        return this.challengeDay19.url;
      case 5:
        return this.challengeDay20.url;
      case 6:
        return this.challengeDay21.url;
    }
  }

  getChallenge(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay15;
      case 1:
        return this.challengeDay16;
      case 2:
        return this.challengeDay17;
      case 3:
        return this.challengeDay18;
      case 4:
        return this.challengeDay19;
      case 5:
        return this.challengeDay20;
      case 6:
        return this.challengeDay21;
    }
  }


  getSuperChallengeImage(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay15.imageSuper;
      case 1:
        return this.challengeDay16.imageSuper;
      case 2:
        return this.challengeDay17.imageSuper;
      case 3:
        return this.challengeDay18.imageSuper;
      case 4:
        return this.challengeDay19.imageSuper;
      case 5:
        return this.challengeDay20.imageSuper;
      case 6:
        return this.challengeDay21.imageSuper;
    }
  }

  goToDayPage(day:any) {
    const today = new Date().getTime();
    const show =
      this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].challengeEndDate.seconds * 1000;

    console.log(today, show);

    if (today < show) {
      this.router.navigate(["challenge/day", day]);
    
    }
  }

  loadChallengeWatchData() {
    if (!this.customerDataLoaded) return;
    console.log(this.repeatCount);
    this.challengeWatchSubscription = this.completedService
      .loadChallengeWeekData(this.userId, this.challengeId, this.repeatCount)
      .subscribe((res) => {
        this.watchDataLoaded = true;
        this.watchData = res;
      });
  }

  isDayVideoWatched(day:any) {
    let data = this.watchData.filter((data:any) => {
      return data.day == String(day);
    });
    if (data.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  getDayWatchCount(day: number): any {
    const data = this.watchData.filter((data: any) => data.day == String(day));
    
    if (data.length > 0) {
      const count = Math.max(...data.map((watchData: any) => watchData.watchCount));
      return count > 1 ? count : '';
    } else {
      return '';
    }
  }


  getDayWatchDate(day: any): any {
    const data = this.watchData.filter((res: any) => res.day === String(day));
    if (data.length > 0) {
      return data[0].date;
    } else {
      return 0; // Default value instead of null
    }
  }


}

