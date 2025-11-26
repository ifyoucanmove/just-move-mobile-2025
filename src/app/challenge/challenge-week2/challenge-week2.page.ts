import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Challenges } from 'src/app/services/challenges';
import { Completed } from 'src/app/services/completed';
import { Customer } from 'src/app/services/customer';
import { User } from 'src/app/services/user';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { WeekSelectorComponent } from 'src/app/shared/week-selector/week-selector.component';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-challenge-week2',
  templateUrl: './challenge-week2.page.html',
  styleUrls: ['./challenge-week2.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent, WeekSelectorComponent]
})
export class ChallengeWeek2Page implements OnInit {

  isSuperChallenge = false;
  challengeDay8: any = {};
  challengeDay9: any = {};
  challengeDay10: any = {};
  challengeDay11: any = {};
  challengeDay12: any = {};
  challengeDay13: any = {};
  challengeDay14: any = {};
  week2Message: string = '';
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
   
    this.route.queryParams.subscribe((res) => {
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
    this.challengeDay8 = {};
    this.challengeDay9 = {};
    this.challengeDay10 = {};
    this.challengeDay11 = {};
    this.challengeDay12 = {};
    this.challengeDay13 = {};
    this.challengeDay14 = {};
    this.title = this.challengeService.challengeDatas[selectedIndex].dashTitle;
    this.week2Message = this.challengeService.challengeDatas[
      selectedIndex
    ].week2Message;
    this.daysOfTheWeek = this.challengeService.getDaysOfTheWeek(
      this.challengeService.challengeDatas[selectedIndex].weeklyFirstDay,
      7
    );
    await this.challengeService.getActiveChallengeVideosData();
    console.log(this.daysOfTheWeek);

    this.challengeDay8 = this.challengeService.challengeDay8;
    this.challengeDay9 = this.challengeService.challengeDay9;
    this.challengeDay10 = this.challengeService.challengeDay10;
    this.challengeDay11 = this.challengeService.challengeDay11;
    this.challengeDay12 = this.challengeService.challengeDay12;
    this.challengeDay13 = this.challengeService.challengeDay13;
    this.challengeDay14 = this.challengeService.challengeDay14;

    this.days = [
      {
        isWatched: this.isDayVideoWatched(8),
        day: 8,
        dayData: this.challengeDay8,
        dayOfWeek: 0,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(9),
        day: 9,
        dayData: this.challengeDay9,
        dayOfWeek: 1,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(10),
        day: 10,
        dayData: this.challengeDay10,
        dayOfWeek: 2,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(11),
        day: 11,
        dayData: this.challengeDay11,
        dayOfWeek: 3,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(12),
        day: 12,
        dayData: this.challengeDay12,
        dayOfWeek: 4,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(13),
        day: 13,
        dayData: this.challengeDay13,
        dayOfWeek: 5,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(14),
        day: 14,
        dayData: this.challengeDay14,
        dayOfWeek: 6,
        load: false
      },
    ];
  }

  getChallengeImage(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay8.image;
      case 1:
        return this.challengeDay9.image;
      case 2:
        return this.challengeDay10.image;
      case 3:
        return this.challengeDay11.image;
      case 4:
        return this.challengeDay12.image;
      case 5:
        return this.challengeDay13.image;
      case 6:
        return this.challengeDay14.image;
    }
  }

  getChallengeVideo(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay8.url;
      case 1:
        return this.challengeDay9.url;
      case 2:
        return this.challengeDay10.url;
      case 3:
        return this.challengeDay11.url;
      case 4:
        return this.challengeDay12.url;
      case 5:
        return this.challengeDay13.url;
      case 6:
        return this.challengeDay14.url;
    }
  }

  getChallenge(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay8;
      case 1:
        return this.challengeDay9;
      case 2:
        return this.challengeDay10;
      case 3:
        return this.challengeDay11;
      case 4:
        return this.challengeDay12;
      case 5:
        return this.challengeDay13;
      case 6:
        return this.challengeDay14;
    }
  }

  getSuperChallengeImage(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay8.imageSuper;
      case 1:
        return this.challengeDay9.imageSuper;
      case 2:
        return this.challengeDay10.imageSuper;
      case 3:
        return this.challengeDay11.imageSuper;
      case 4:
        return this.challengeDay12.imageSuper;
      case 5:
        return this.challengeDay13.imageSuper;
      case 6:
        return this.challengeDay14.imageSuper;
    }
  }

  goToDayPage(day:any) {
    const today = new Date().getTime();
    const show =
      this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].challengeEndDate.seconds * 1000;

    if (today < show) {
      this.router.navigate(["/tabs/challenge/day", day]);
     
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
