import { Component, Input, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { ActivatedRoute, Router } from '@angular/router';
import { Challenges } from 'src/app/services/challenges';
import { User } from 'src/app/services/user';
import { caretDownOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { ActionSheetController } from '@ionic/angular';
@Component({
  selector: 'app-week-selector',
  templateUrl: './week-selector.component.html',
  styleUrls: ['./week-selector.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class WeekSelectorComponent  implements OnInit {


  @Input('value') value:any;
  title = '';
  isMiniChallenge = false;
  
  showChallenge = false;
    showWeek1Menu = false;
    showWeek2Menu = false;
    showWeek3Menu = false;
    showWeek4Menu = false;
    showWeek5Menu = false;
    showMaterials = false;
  
    challengeId = "";
    userId: any;
    week4DayCount: any;
    weekFinalDayCount: any;
    customerDataLoaded: boolean = false;
    totalDays: number = 0;
    weekCount: number = 0;
    isMiniSubscription: boolean = false;
  
  buttons:any = [];
  
  constructor(
    public actionSheetController: ActionSheetController, 
    private router : Router, 
    private challengeService : Challenges, 
    private route : ActivatedRoute,
    private userService: User

  ) {
    addIcons({caretDownOutline})
  }
  
  ngOnInit(): void {
      switch(this.value){
        case '1':
          this.title = "Week 1"
          break;
        case '2':
          this.title = "Week 2"
          break;
        case '3':
          this.title = "Week 3"
          break;
        case '4':
          this.title = "Week 4"
          break;
        case '5':
          this.title = "Week 5"
          break;
          
      }
  

      this.route.queryParams.subscribe((param) => {
        let selectedIndex = this.challengeService.selectedChallengeIndex;
        this.isMiniChallenge = this.challengeService.challengeDatas[selectedIndex]._isMiniChallenge;
        try {
          this.isMiniSubscription = this.challengeService.challengeDatas[
            this.challengeService.selectedChallengeIndex
          ].is7Days
            ? this.challengeService.challengeDatas[
                this.challengeService.selectedChallengeIndex
              ].is7Days
            : false;
        } catch (error) {
          console.log("Inisde error", error);
        }
        this.checkDatas();
        this.userId = this.userService.email;
        this.challengeId = this.challengeService.challengeDatas[selectedIndex].id;
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
          this.weekCount = Number(this.challengeService.challengeDatas[selectedIndex].weekTotalCount);
        if (this.totalDays > 25) {
          this.week4DayCount = 7;
          this.weekFinalDayCount = 2;
        } else {
          this.week4DayCount = this.totalDays - 21;
          this.weekFinalDayCount = 0;
        }
  
    
  
    
      });
      this.buttons = [
        {
          text: 'Week 1',
          id: 'week1-button',
          data: 'week1',
          handler: () => {
            if(this.value == '1') return;
            this.router.navigate(['challenge/week1'])
          }
        }
      ]
      if(this.showWeek2Menu){
        this.buttons.push({
          text: 'Week 2',
          id: 'week2-button',
          data: 'week2',
          handler: () => {
            if(this.value == '2') return;
            this.router.navigate(['challenge/week2'])
          }
        })
      }
      if(this.showWeek3Menu){
        this.buttons.push({
          text: 'Week 3',
          id: 'week3-button',
          data: 'week3',
          handler: () => {
            if(this.value == '3') return;
            this.router.navigate(['challenge/week3'])
          }
        })
      }
      if(this.showWeek4Menu  && this.weekCount >= 4){
        this.buttons.push({
          text: 'Week 4',
          id: 'week4-button',
          data: 'week4',
          handler: () => {
            if(this.value == '4') return;
            this.router.navigate(['challenge/final-week'])
          }
        })
      }
      if(this.showWeek5Menu && this.weekFinalDayCount > 0){
        this.buttons.push({
          text: 'Week 5',
          id: 'week5-button',
          data: 'week5',
          handler: () => {
            if(this.value == '5') return;
            this.router.navigate(['challenge/week5'])
          }
        })
      }
      this.buttons.push({
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      })
    }
  
    
  
    checkDatas() {
      const today = new Date().getTime();
      const show =
        this.challengeService.challengeDatas[
          this.challengeService.selectedChallengeIndex
        ].challengeEndDate.seconds * 1000;
      const materials =
        this.challengeService.challengeDatas[
          this.challengeService.selectedChallengeIndex
        ].materialOpens.seconds * 1000;
      const w1 =
        this.challengeService.challengeDatas[
          this.challengeService.selectedChallengeIndex
        ].week1Opens.seconds * 1000;
      const w2 =
        this.challengeService.challengeDatas[
          this.challengeService.selectedChallengeIndex
        ].week2Opens.seconds * 1000;
      const w3 =
        this.challengeService.challengeDatas[
          this.challengeService.selectedChallengeIndex
        ].week3Opens.seconds * 1000;
      const w4 =
        this.challengeService.challengeDatas[
          this.challengeService.selectedChallengeIndex
        ].week4Opens.seconds * 1000;
  
      this.showChallenge = today < show ? true : false;
  
      if (this.isMiniChallenge) {
        if (today > w1) {
          this.showWeek1Menu = true;
        }
        this.showMaterials = false;
        this.showWeek2Menu = false;
        this.showWeek3Menu = false;
        this.showWeek4Menu = false;
      } 
           else if (this.isMiniSubscription) {
        console.log("Is Mini");
  
        if (today > w1) {
          this.showWeek1Menu = true;
        }
        this.showMaterials = today > materials ? true : false;
        this.showWeek2Menu = false;
        this.showWeek3Menu = false;
        this.showWeek4Menu = false;
        this.showWeek5Menu = false;
      }
      
      else {
      this.showMaterials = today > materials ? true : false;
      this.showWeek1Menu = today > w1 ? true : false;
      this.showWeek2Menu = today > w2 ? true : false;
      this.showWeek3Menu = today > w3 ? true : false;
      this.showWeek4Menu = today > w4 ? true : false;
      this.showWeek5Menu = today > w4 ? true : false;
      }
    
    }
  
  
  
  
  
  
  
  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      buttons: this.buttons
    });
    await actionSheet.present();
  
    const { role, data } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role and data', role, data);
  }
  
  }
