import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';
import { Challenges } from 'src/app/services/challenges';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';
import { logoFacebook } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-fb-community',
  templateUrl: './fb-community.page.html',
  styleUrls: ['./fb-community.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class FbCommunityPage implements OnInit {

  timelineInfo: any = {};
  constructor(
    private challengeService: Challenges,
    private route: ActivatedRoute,
    private alertController : AlertController,

  ) {
    addIcons({logoFacebook})
  }

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



  async openWebLink(link:string) {
    
    const alert = await this.alertController.create({
      header: "Warning",
      mode: "ios",
      message: "Are you sure you want to open this link?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: (blah) => {},
        },
        {
          text: "Yes",
          handler: () => {
            window.open(link);
           },
        },
      ],
    });
    await alert.present();
  }
}
