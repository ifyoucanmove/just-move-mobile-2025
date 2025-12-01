import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Challenges } from 'src/app/services/challenges';
import { ActivatedRoute } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';

@Component({
  selector: 'app-other',
  templateUrl: './other.page.html',
  styleUrls: ['./other.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class OtherPage implements OnInit {

  timelineInfo: any = {};
  isSuperChallenge: boolean = false;
  introMessage = "";
  bannerImage = null;
  constructor(
    private challengeService: Challenges,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((res) => {
      let selectedIndex = this.challengeService.selectedChallengeIndex;
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

