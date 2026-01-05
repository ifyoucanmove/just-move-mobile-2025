import { Component, OnInit, OnDestroy } from '@angular/core';
import { addIcons } from 'ionicons';
import { menuOutline, heartOutline, closeOutline, trophyOutline, cartOutline, receiptOutline, storefrontOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from '../shared/shared/shared-module';
import { AuthService } from '../services/auth';
import { Common } from '../services/common';
import { Customer } from '../services/customer';
import { Challenges } from '../services/challenges';
import { Shopify } from '../services/shopify';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { Platform, NavController } from '@ionic/angular/standalone';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Subscription } from 'rxjs';

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
   SharedModule,
   SidebarComponent
  ],
})
export class HomePage implements OnInit, OnDestroy {
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
  backButtonSubscription?: Subscription;
  lastBackPress = 0;
  backButtonPressCount = 0;

  constructor(public router:Router, public authService:AuthService, private common:Common,
    public route:ActivatedRoute,
    public customerService:Customer,
    public challengeService:Challenges,
    private shopifyService: Shopify,
    private platform: Platform,
    private navCtrl: NavController
  ) {
    addIcons({
      trophyOutline,
      cartOutline,
      receiptOutline,
      storefrontOutline
    });
  }

  
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  goToProductDetail() {
  //  this.router.navigate(['/product-detail']);
  this.router.navigate(['/products']);
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

    const currentUrl = this.router.url;
    if (currentUrl == '/home') {
    // Handle back button for double-tap to exit
    this.setupBackButtonHandler();
    }
  }

  setupBackButtonHandler() {
    // Only handle back button on mobile platforms
    if (this.platform.is('android') || this.platform.is('capacitor')) {
      // Use priority 10 to intercept, but check route and allow default behavior when not on home
      this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(10, () => {
        // Check current route
        const currentUrl = this.router.url;
        
        // Only handle back button when route is /home
        if (currentUrl !== '/home') {
          // Not on home route - allow default back button behavior by using NavController
          this.navCtrl.back();
          return;
        }

        // On /home route - handle double-tap to exit
        const currentTime = new Date().getTime();
        
        // Reset counter if more than 2 seconds have passed since last press
        if (currentTime - this.lastBackPress > 2000) {
          this.backButtonPressCount = 0;
        }
        
        this.lastBackPress = currentTime;
        this.backButtonPressCount++;

        if (this.backButtonPressCount === 1) {
          // First press - show toast message
          this.common.showInfoToast('Press back again to exit');
          // Don't navigate back - prevent default navigation
        } else if (this.backButtonPressCount === 2) {
          // Second press within 2 seconds - exit app
          this.backButtonPressCount = 0;
          App.exitApp();
        }
        // When on home route, don't navigate back - this prevents default behavior
      });
    }
  }

  ngOnDestroy() {
    // Unsubscribe from back button handler
    if (this.backButtonSubscription) {
      this.backButtonSubscription.unsubscribe();
    }
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

  async challengeClicked(challenge: any) {
    console.log("challenge", challenge);

    const email = this.authService.currentUser?.email;
    if (!email) {
      this.common.showInfoToast('Please login to access challenges');
      return;
    }

    // Check if user has purchased this challenge
    try {
      const hasPurchased = await this.customerService.hasChallengePurchase(email, challenge.id);

      if (hasPurchased) {
        // User has purchased - navigate to challenge content
        this.router.navigateByUrl("challenge/challenge-home/" + challenge.id);
      } else {
        // User has NOT purchased - ask for confirmation before redirecting to checkout
        const result = await this.common.showConfirmDialog(
          'Purchase Challenge',
          'You will be redirected to our store to complete your purchase. Continue?',
          'Cancel',
          'Continue'
        );

        if (result === 'confirm') {
          // Create checkout URL and open Shopify
          const checkoutUrl = await this.shopifyService.createChallengeCheckoutUrl(
            challenge.id,
            email,
            'justMove'
          );

          if (checkoutUrl) {
            // Open Shopify checkout in browser
            await Browser.open({ url: checkoutUrl });
          } else {
            this.common.showErrorToast('Unable to load checkout. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error in challengeClicked:', error);
      this.common.showErrorToast('Error checking purchase status. Please try again.');
    }
  }

}
