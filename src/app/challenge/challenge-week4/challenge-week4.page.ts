import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { WeekSelectorComponent } from 'src/app/shared/week-selector/week-selector.component';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { Challenges } from 'src/app/services/challenges';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from 'src/app/services/customer';
import { Completed } from 'src/app/services/completed';
import { User } from 'src/app/services/user';
import { Auth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';
import { AlertController } from '@ionic/angular/standalone';
@Component({
  selector: 'app-challenge-week4',
  templateUrl: './challenge-week4.page.html',
  styleUrls: ['./challenge-week4.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent, WeekSelectorComponent]
})
export class ChallengeWeek4Page implements OnInit {

  isSuperChallenge = false;
  challengeDay22: any = {};
  challengeDay23: any = {};
  challengeDay24: any = {};
  challengeDay25: any = {};
  challengeDay26: any = {};
  challengeDay27: any = {};
  challengeDay28: any = {};
  week4Message: string = '';
  daysOfTheWeek: string[] = [];
  title: any;

  challengeId = "";
  watchData: any = [];
  isCompleted: boolean = false;
  watchDataLoaded: boolean = false;
  challengeWatchSubscription: Subscription = new Subscription();
  userId: any;

  weekFinalDayCount: number = 0;
  customerDataLoaded: boolean = false;
  customerChallengeData: any = {};
  repeatCount: number = 0;
  totalDays: number = 0;

  days: any;
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
          repeatCount =
            this.customerChallengeData[this.challengeId].repeatCount;
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
    if (this.totalDays > 25) this.weekFinalDayCount = 7;
    else this.weekFinalDayCount =  this.totalDays - 21;
    // this.weekFinalDayCount = parseInt(
    //   this.challengeService.challengeDatas[selectedIndex].weekFinalDayCount
    // );
    this.watchDataLoaded = false;
    this.loadChallengeWatchData();
    if (this.customerService.isSuperChallenge) {
      this.isSuperChallenge = true;
    }
    this.challengeDay22 = {};
    this.challengeDay23 = {};
    this.challengeDay24 = {};
    this.challengeDay25 = {};
    this.challengeDay26 = {};
    this.challengeDay27 = {};
    this.challengeDay28 = {};

    this.title = this.challengeService.challengeDatas[selectedIndex].dashTitle;
    this.week4Message =
      this.challengeService.challengeDatas[selectedIndex].week4Message;
    this.daysOfTheWeek = this.challengeService.getDaysOfTheWeek(
      this.challengeService.challengeDatas[selectedIndex].weeklyFirstDay,
      this.weekFinalDayCount
    );
    await this.challengeService.getActiveChallengeVideosData();
    this.challengeDay22 = this.challengeService.challengeDay22;
    this.challengeDay23 = this.challengeService.challengeDay23;
    this.challengeDay24 = this.challengeService.challengeDay24;
    this.challengeDay25 = this.challengeService.challengeDay25;
    this.challengeDay26 = this.challengeService.challengeDay26;
    this.challengeDay27 = this.challengeService.challengeDay27;
    this.challengeDay28 = this.challengeService.challengeDay28;


    this.days = [
      {
        isWatched: this.isDayVideoWatched(22),
        day: 22,
        dayData: this.challengeDay22,
        dayOfWeek: 0,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(23),
        day: 23,
        dayData: this.challengeDay23,
        dayOfWeek: 1,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(24),
        day: 24,
        dayData: this.challengeDay24,
        dayOfWeek: 2,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(25),
        day: 25,
        dayData: this.challengeDay25,
        dayOfWeek: 3,
        load: false
      }
    ];


    if (this.totalDays > 25) {
      this.days.push(
        {
          isWatched: this.isDayVideoWatched(26),
          day: 26,
          dayData: this.challengeDay26,
          dayOfWeek: 4,
          load: false
        },
        {
          isWatched: this.isDayVideoWatched(27),
          day: 27,
          dayData: this.challengeDay27,
          dayOfWeek: 5,
          load: false
        },
        {
          isWatched: this.isDayVideoWatched(28),
          day: 28,
          dayData: this.challengeDay28,
          dayOfWeek: 6,
          load: false
        },
      );
    }
  }

  getChallengeImage(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay22.image;
      case 1:
        return this.challengeDay23.image;
      case 2:
        return this.challengeDay24.image;
      case 3:
        return this.challengeDay25.image;
      case 4:
        return this.challengeDay26.image;
      case 5:
        return this.challengeDay27.image;
      case 6:
        return this.challengeDay28.image;
    }
  }

  getChallengeVideo(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay22.url;
      case 1:
        return this.challengeDay23.url;
      case 2:
        return this.challengeDay24.url;
      case 3:
        return this.challengeDay25.url;
      case 4:
        return this.challengeDay26.url;
      case 5:
        return this.challengeDay27.url;
      case 6:
        return this.challengeDay28.url;
    }
  }

  getChallenge(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay22;
      case 1:
        return this.challengeDay23;
      case 2:
        return this.challengeDay24;
      case 3:
        return this.challengeDay25;
      case 4:
        return this.challengeDay26;
      case 5:
        return this.challengeDay27;
      case 6:
        return this.challengeDay28;
    }
  }



  
  getSuperChallengeImage(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay22.imageSuper;
      case 1:
        return this.challengeDay23.imageSuper;
      case 2:
        return this.challengeDay24.imageSuper;
      case 3:
        return this.challengeDay25.imageSuper;
      case 4:
        return this.challengeDay26.imageSuper;
      case 5:
        return this.challengeDay27.imageSuper;
      case 6:
        return this.challengeDay28.imageSuper;
    }
  }

  goToDayPage(day:any) {
    const today = new Date().getTime();
    const show =
      this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].challengeEndDate.seconds * 1000;

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

