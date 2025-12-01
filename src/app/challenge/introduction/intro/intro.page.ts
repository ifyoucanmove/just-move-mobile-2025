import { Component, OnInit } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared/shared-module';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { Challenges } from 'src/app/services/challenges';
import { Customer } from 'src/app/services/customer';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class IntroPage implements OnInit {

  timelineInfo: any = {};
  isSuperChallenge: boolean = false;
  introMessage = "";
  bannerImage = null;
  constructor(
    private challengeService: Challenges,
    private route: ActivatedRoute,
    private customerService: Customer
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((res) => {
      this.isSuperChallenge = this.customerService.isSuperChallenge;
      let selectedIndex = this.challengeService.selectedChallengeIndex;
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
  }
}

