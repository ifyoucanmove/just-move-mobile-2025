import { Component, Input, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { Completed } from 'src/app/services/completed';
import { AlertController } from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { FirestoreService } from 'src/app/services/firestore';
import { MoodCaptureComponent } from '../mood-capture/mood-capture.component';
import { MainHeaderComponent } from '../main-header/main-header.component';

@Component({
  selector: 'app-completed-history',
  templateUrl: './completed-history.component.html',
  styleUrls: ['./completed-history.component.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class CompletedHistoryComponent  implements OnInit {

 
  @Input('type') type = '';
  @Input('postId') postId = '';
  @Input('userId') userId = '';
  @Input('title') title = '';
  @Input('name') name = '';
  @Input('day') day = '';
  @Input('repeatCount') repeatCount = '';
  @Input('category') category = '';
  isLoading : boolean = true;
  completedData : any = []; 
  moods:any = {
    'Happy': '😊',
    'Sad': '😢',
    'Defeated': '😔',
    'Anxious': '😰',
    'Confident': '😎',
    'Overwhelmed': '😩',
    'Excited': '🤗'
 };

  constructor(private completedService : Completed,
     private alertController : AlertController,
      private loadingCtrl : LoadingController, 
      private firestore : FirestoreService, 
      private modalCtrl : ModalController ) { }

  ngOnInit() {
    console.log(this.title);
    console.log(this.day);

    this.isLoading = true;
    if(this.type == 'category'){
      this.completedService
      .loadCategoryWatchData(this.userId, this.postId)
      .subscribe(
        (res:any) => {
          if (res.length > 0) {
            this.completedData = res.sort((a : any, b : any) => b.watchCount - a.watchCount);
            console.log("Completed Date", res);
            
          } else {
            this.completedData = [];
          }
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
        }
      );
    } else if(this.type === 'combo'){
      this.completedService
      .loadBYOComboData(this.userId, this.postId)
      .subscribe(
        (res:any) => {
          if (res.length > 0) {
            this.completedData = res.sort((a : any, b : any) => b.watchCount - a.watchCount);
            console.log("Completed Date", res);
            
          } else {
            this.completedData = [];
          }
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
        }
      );
    } else if(this.type === 'challenge'){
      this.completedService
      .loadChallengeDayData(this.userId, this.day, this.postId, this.repeatCount)
      .subscribe(
        (res:any) => {
          if (res.length > 0) {
            this.completedData = res.sort((a : any, b : any) => b.watchCount - a.watchCount);
            console.log("Completed Date", res);
            
          } else {
            this.completedData = [];
          }
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
        }
      );
    } else if(this.type === 'cool-downs'){
      this.completedService
      .loadChallengeWarmUpCoolDownData(this.userId, this.postId, this.category)
      .subscribe(
        (res:any) => {
          if (res.length > 0) {
            this.completedData = res.sort((a : any, b : any) => b.watchCount - a.watchCount).filter((item: any) => item.title == this.name);
            console.log("Completed Date", res);
            
          } else {
            this.completedData = [];
          }
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
        }
      );
    } else if(this.type === 'programs'){
      this.completedService
      .loadProgramWatchData(this.userId, this.postId, this.repeatCount)
      .subscribe(
        (res:any) => {
          if (res.length > 0) {
            this.completedData = res.sort((a : any, b : any) => b.watchCount - a.watchCount).filter((item: any) => item.day == this.day);
            console.log("Completed Date", res);
            
          } else {
            this.completedData = [];
          }
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
        }
      );
    }else if(this.type == 'all'){
      this.completedService
      .lodAllMoodIndexData(this.userId)
      .subscribe(
        (res:any) => {
          if (res.length > 0) {
            this.completedData = res.sort((a : any, b : any) => b.watchCount - a.watchCount).filter((item: any) => item.day == this.day);
            console.log("Completed Date", res);
            
          } else {
            this.completedData = [];
          }
          this.isLoading = false;
        },
        (err) => {
          console.log(err);
        }
      );
    }


  }


  async editData(data : any){
     const modal = await this.modalCtrl.create({
          component: MoodCaptureComponent,
          componentProps: {
            data :data
          }
        });
        await modal.present();
  }



    async deleteClicked(itemId : any){
      console.log("deletiung item", itemId);
      
      const alert = await this.alertController.create({
        header: "Warning",
        mode: "ios",
        message:
          "Are you sure you want to delete this completed data? This cannot be undone",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
            handler: (blah) => {},
          },
          {
            text: "Yes",
            handler: () => {
              this.loadingCtrl.create().then((loadingEl) => {
                loadingEl.present();
                this.firestore.deleteDocument("completed", itemId)
              });
            },
          }, 
        ],
      });
      await alert.present();
    }

}
