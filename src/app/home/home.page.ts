import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import { menuOutline, heartOutline, closeOutline, trophyOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../shared/shared/shared-module';
import { AuthService } from '../services/auth';
import { Common } from '../services/common';
import { Customer } from '../services/customer';
import { Challenges } from '../services/challenges';

addIcons({
  menuOutline,
  heartOutline,
  closeOutline
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
   SharedModule
  ],
})
export class HomePage {
  selectedCategory = 'Shakes';
  categories = ['Shakes', 'Smoothie Bowls', 'Juices', 'Teas'];
  favoriteCount = 113;
  isSidebarOpen = false;
  title = "";
  allActiveChallenges:any;
  challengeDatas:any[] = [];
  challenges = [];
  cat = "";

  isTrial = false;
  status:string = "";
  challengePurchases = [];
  isPaused : boolean = false;
  constructor(public router:Router, public authService:AuthService, private common:Common,

    public route:ActivatedRoute,
    public customerService:Customer,
    public challengeService:Challenges
  ) {
    addIcons({
      trophyOutline
    });
  }
  
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.toggleSidebar(); // Close sidebar after navigation
  }

  goToProductDetail() {
  //  this.router.navigate(['/product-detail']);
  this.router.navigate(['/products']);
  }

  async logout() {
    const result = await this.common.showConfirmDialog(
      'Logout',
      'Are you sure you want to logout?',
      'Cancel',
      'Logout'
    );

    if (result === 'confirm') {
      // User confirmed logout
      try {
        await this.authService.signOut();
        this.router.navigate(['/signin']);
        window.location.reload();
      } catch (error) {
        console.error('Logout error:', error);
        await this.common.showErrorToast('Failed to logout. Please try again.');
      }
    }
    // If result is 'button1', user cancelled - do nothing
  }

 
  

  ngOnInit() {
   console.log("changes")
    //this.challengeService.loadAllChallengeData();
    this.loadChallengeData("_status");
    this.route.queryParams.subscribe((res) => {
     
      this.cat = res['category'];

     /*  if (res['category'] == "current-and-upcoming") {
        this.loadChallengeData("_status");
      } else if (res['category'] == "past") {
        this.loadChallengeData("_statusSuper");
      } */
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
