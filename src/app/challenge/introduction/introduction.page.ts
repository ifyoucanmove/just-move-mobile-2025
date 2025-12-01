import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { Challenges } from 'src/app/services/challenges';
import { ActivatedRoute } from '@angular/router';
import { Customer } from 'src/app/services/customer';
import { User } from 'src/app/services/user';
import { cog, fileTrayFull, hourglass, image, informationCircle, logoFacebook, reader } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { AlertController } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.page.html',
  styleUrls: ['./introduction.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class IntroductionPage implements OnInit {

  timelineInfo: any = {};
  isSuperChallenge: boolean = false;
  introMessage = "";
  bannerImage = null;
  isMiniChallenge = false;
  name = '';
  userDetails: any;
  constructor(
    private challengeService: Challenges,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private customerService: Customer,
    private userService: User,
    private authService: AuthService
  ) {
    addIcons({informationCircle, logoFacebook, hourglass, cog, image, fileTrayFull, reader})
  }

  ngOnInit() {
    this.userDetails = this.authService.userDetails;
    console.log("User Details ", this.authService.userDetails);
    
    this.route.queryParams.subscribe((res) => {
      this.name = this.userDetails.fname +' '+ this.userDetails.lname;
      this.isSuperChallenge = this.customerService.isSuperChallenge;
      let selectedIndex = this.challengeService.selectedChallengeIndex;
      this.isMiniChallenge = this.challengeService.challengeDatas[selectedIndex]?._isMiniChallenge;
      this.introMessage = this.challengeService.challengeDatas[
        selectedIndex
      ]?.dashIntroMessage;
      this.bannerImage = this.challengeService.challengeDatas[selectedIndex]
        ?.dashBannerUrl
        ? this.challengeService.challengeDatas[selectedIndex]?.dashBannerUrl
        : null;
      this.timelineInfo = {
        title: this.challengeService.challengeDatas[selectedIndex]?.dashTitle,
        signupDates: this.challengeService.challengeDatas[selectedIndex]
          ?.dashIntroTime0,
        firstDate: this.challengeService.challengeDatas[selectedIndex]
          ?.dashIntroTime1,
        secondDate: this.challengeService.challengeDatas[selectedIndex]
          ?.dashIntroTime2,
        thirdDate: this.challengeService.challengeDatas[selectedIndex]
          ?.dashIntroTime3,
        lastDate: this.challengeService.challengeDatas[selectedIndex]
          ?.dashIntroTime4,
        };
    });
    // if (this.challengeService.challengeData) {
    //   this.timelineInfo = {
    //     title: this.challengeService.challengeData.dashTitle,
    //     signupDates: this.challengeService.challengeData.dashIntroTime0,
    //     firstDate: this.challengeService.challengeData.dashIntroTime1,
    //     secondDate: this.challengeService.challengeData.dashIntroTime2,
    //     thirdDate: this.challengeService.challengeData.dashIntroTime3,
    //     lastDate: this.challengeService.challengeData.dashIntroTime4,
    //   };
    // } else {
    //   this.challengeService.getActiveChallengeData().subscribe((res) => {
    //     this.timelineInfo = {
    //       title: this.challengeService.challengeData.dashTitle,
    //       signupDates: this.challengeService.challengeData.dashIntroTime0,
    //       firstDate: this.challengeService.challengeData.dashIntroTime1,
    //       secondDate: this.challengeService.challengeData.dashIntroTime2,
    //       thirdDate: this.challengeService.challengeData.dashIntroTime3,
    //       lastDate: this.challengeService.challengeData.dashIntroTime4,
    //     };
    //   });
    // }
  }


}
