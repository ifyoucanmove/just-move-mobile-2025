import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared/shared-module';
import { ActivatedRoute, Router } from '@angular/router';
import { Challenges } from '../services/challenges';
import { Customer } from '../services/customer';
import { MainHeaderComponent } from '../shared/main-header/main-header.component';

@Component({
  selector: 'app-challenge-main',
  templateUrl: './challenge-main.page.html',
  styleUrls: ['./challenge-main.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class ChallengeMainPage implements OnInit {
  title = "";
  allActiveChallenges:any;
  challengeDatas:any[] = [];
  challenges = [];
  cat = "";

  isTrial = false;
  status:string = "";
  challengePurchases = [];
  isPaused : boolean = false;
  constructor(public route:ActivatedRoute,public router:Router,
    public customerService:Customer,
    public challengeService:Challenges) { }

  ngOnInit() {
   console.log("changes")
    //this.challengeService.loadAllChallengeData();
    this.route.queryParams.subscribe((res) => {
      // if (this.challenges.length == 1 && this.allActiveChallenges.length == 1) {
      //   this.doRouting();
      // }
      this.cat = res['category'];
      if (res['category'] == "current-and-upcoming") {
        this.loadChallengeData("_status");
      } else if (res['category'] == "past") {
        this.loadChallengeData("_statusSuper");
      }
    });
  }

  loadChallengeData(type:any) {
    try {
        console.log("Inside try catch",type);

        this.challengeService.getNormalChallenges(type).subscribe(
          (res) => {
            console.log(res);
            this.challengeDatas = res;
            this.loadActiveChallenges();
          },
          (err) => {
            console.log(err);
          }
        );
      } catch (error) {
        console.log("error from tryc ", error);
      }

  }

  loadActiveChallenges() {
    this.allActiveChallenges = this.challengeDatas;
    //  let challenges = this.challengeService.challengeDatas;
    // this.isTrial = this.customerService.isTrial;
   /*  this.status = this.customerService.status;
    this.allActiveChallenges = this.challengeDatas;
    if(this.status !== "active" && this.customerService.customer &&  this.customerService.customer.paddle_status == 'paused'){
      this.isPaused = true
    }else{
      this.isPaused = false;
    } */
    // let allChallengePurchases = this.customerService.challengePurchases;
    // this.challengePurchases = allChallengePurchases.filter((challenge) => {
    // return  challenge.expirationDate.toDate().getTime() > new Date().getTime();
    // });

    console.log("CHallenge Purchases", this.challengePurchases);

    if (this.cat == "current-and-upcoming") {
      this.allActiveChallenges.sort((a:any, b:any) => {
        return a.upload01Starts.seconds - b.upload01Starts.seconds;
      });
    } else if (this.cat == "past") {
      this.allActiveChallenges.sort((a:any, b:any) => {
        return b.upload01Starts.seconds - a.upload01Starts.seconds;
      });
    }
    this.allActiveChallenges.forEach((challenge:any) => {
      challenge.totalDays =
        (parseInt(challenge.weekTotalCount, 10) - 1) * 7 +
        parseInt(challenge.weekFinalDayCount, 10);
    });
    console.log(this.allActiveChallenges);


  }

  async challengeClicked(challenge:any) {
    this.router.navigateByUrl("challenge/challenge-home");
  }
}
