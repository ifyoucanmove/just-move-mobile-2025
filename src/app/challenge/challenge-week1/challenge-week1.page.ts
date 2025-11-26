import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { Subscription } from 'rxjs';
import { Challenges } from 'src/app/services/challenges';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from 'src/app/services/customer';
import { User } from 'src/app/services/user';
import { Completed } from 'src/app/services/completed';
import { Auth } from '@angular/fire/auth';
import { AlertController } from '@ionic/angular/standalone';
import { WeekSelectorComponent } from 'src/app/shared/week-selector/week-selector.component';

@Component({
  selector: 'app-challenge-week1',
  templateUrl: './challenge-week1.page.html',
  styleUrls: ['./challenge-week1.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent, WeekSelectorComponent]
})
export class ChallengeWeek1Page implements OnInit {

  isSuperChallenge = false;
  challengeDay1: any = {};
  challengeDay2: any = {};
  challengeDay3: any = {};
  challengeDay4: any = {};
  challengeDay5: any = {};
  challengeDay6: any = {};
  challengeDay7: any = {};
  week1Message: any;
  daysOfTheWeek: any;
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
  isLoaded = false;
  isPastChallenge: boolean = false;

  days: any;

  constructor(
    private challengeService: Challenges,
    private router: Router,
    private route: ActivatedRoute,
    private customerService: Customer,
    private completedService: Completed,
    private afAuth: Auth,
    private alertController : AlertController,
    private changeDetector : ChangeDetectorRef,
    private userService: User
  ) {}

  ionViewWillLeave() {
    this.challengeWatchSubscription.unsubscribe();
  }

  ngAfterViewInit(): void {

     
  }

  async ngOnInit() {
    
    this.route.queryParams.subscribe((res) => {
      this.isLoaded = false;
      this.loadDatas();
      setTimeout(() => {
        this.isLoaded = true;
     }, 3000);
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
    this.challengeDay1 = {};
    this.challengeDay2 = {};
    this.challengeDay3 = {};
    this.challengeDay4 = {};
    this.challengeDay5 = {};
    this.challengeDay6 = {};
    this.challengeDay7 = {};
    console.log(this.challengeService.challengeDatas);
    this.title = this.challengeService.challengeDatas[selectedIndex].dashTitle;

    this.week1Message =
      this.challengeService.challengeDatas[selectedIndex].week1Message;
    this.daysOfTheWeek = await this.challengeService.getDaysOfTheWeek(
      this.challengeService.challengeDatas[selectedIndex].weeklyFirstDay,
      7
    );
    await this.challengeService.getActiveChallengeVideosData();
    console.log(this.daysOfTheWeek);

    this.challengeDay1 = this.challengeService.challengeDay1;
    this.challengeDay2 = this.challengeService.challengeDay2;
    this.challengeDay3 = this.challengeService.challengeDay3;
    this.challengeDay4 = this.challengeService.challengeDay4;
    this.challengeDay5 = this.challengeService.challengeDay5;
    this.challengeDay6 = this.challengeService.challengeDay6;
    this.challengeDay7 = this.challengeService.challengeDay7;
    console.log(this.challengeDay7);

    this.days = [
      {
        isWatched: this.isDayVideoWatched(1),
        day: 1,
        dayData: this.challengeDay1,
        dayOfWeek: 0,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(2),
        day: 2,
        dayData: this.challengeDay2,
        dayOfWeek: 1,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(3),
        day: 3,
        dayData: this.challengeDay3,
        dayOfWeek: 2,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(4),
        day: 4,
        dayData: this.challengeDay4,
        dayOfWeek: 3,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(5),
        day: 5,
        dayData: this.challengeDay5,
        dayOfWeek: 4,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(6),
        day: 6,
        dayData: this.challengeDay6,
        dayOfWeek: 5,
        load: false
      },
      {
        isWatched: this.isDayVideoWatched(7),
        day: 7,
        dayData: this.challengeDay7,
        dayOfWeek: 6,
        load: false
      },
    ];
   
    this.changeDetector.detectChanges();
  }

  getChallengeImage(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay1.image;
      case 1:
        return this.challengeDay2.image;
      case 2:
        return this.challengeDay3.image;
      case 3:
        return this.challengeDay4.image;
      case 4:
        return this.challengeDay5.image;
      case 5:
        return this.challengeDay6.image;
      case 6:
        return this.challengeDay7.image;
    }
  }
  getChallengeVideo(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay1.url;
      case 1:
        return this.challengeDay2.url;
      case 2:
        return this.challengeDay3.url;
      case 3:
        return this.challengeDay4.url;
      case 4:
        return this.challengeDay5.url;
      case 5:
        return this.challengeDay6.url;
      case 6:
        return this.challengeDay7.url;
    }
  }

  getChallenge(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay1;
      case 1:
        return this.challengeDay2;
      case 2:
        return this.challengeDay3;
      case 3:
        return this.challengeDay4;
      case 4:
        return this.challengeDay5;
      case 5:
        return this.challengeDay6;
      case 6:
        return this.challengeDay7;
    }
  }



  getSuperChallengeImage(i:number) {
    switch (i) {
      case 0:
        return this.challengeDay1.imageSuper;
      case 1:
        return this.challengeDay2.imageSuper;
      case 2:
        return this.challengeDay3.imageSuper;
      case 3:
        return this.challengeDay4.imageSuper;
      case 4:
        return this.challengeDay5.imageSuper;
      case 5:
        return this.challengeDay6.imageSuper;
      case 6:
        return this.challengeDay7.imageSuper;
    }
  }

  goToDayPage(day:any) {
    const today = new Date().getTime();
    const show =
      this.challengeService.challengeDatas[
        this.challengeService.selectedChallengeIndex
      ].challengeEndDate.seconds * 1000;

    if (today < show) {
      this.router.navigate(["/challenge/day", day]);
      
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

  getDayWatchCount(day: any): any {
    const data = this.watchData.filter((data: any) => data.day == String(day));
    
    if (data.length > 0) {
      const count = Math.max(...data.map((watchData: any) => watchData.watchCount));
      return count > 1 ? count : '';
    } else {
      return '';
    }
  }

  getDayWatchDate(day:any) {
    const data = this.watchData.filter((res:any) => {
      return res.day === String(day);
    });
    if (data.length > 0) {
      return data[0].date;
    } else {
      return null;
    }
  }


}
