import { Component, Input, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared-module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Completed } from 'src/app/services/completed';
import { User } from 'src/app/services/user';
import { ModalController } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular/standalone';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-mood-capture',
  templateUrl: './mood-capture.component.html',
  styleUrls: ['./mood-capture.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class MoodCaptureComponent  implements OnInit {

  workoutForm: FormGroup;
  energyLevels = Array.from({length: 5}, (_, i) => i + 1);
  userEmail: string = '';

  moods = [
    { emoji: '😊', label: 'Happy', value: 'Happy' },
    { emoji: '😢', label: 'Sad', value: 'Sad' },
    { emoji: '😔', label: 'Defeated', value: 'Defeated' },
    { emoji: '😰', label: 'Anxious', value: 'Anxious' },
    { emoji: '😎', label: 'Confident', value: 'Confident' },
    { emoji: '😩', label: 'Overwhelmed', value: 'Overwhelmed' },
    { emoji: '🤗', label: 'Excited', value: 'Excited' }
  ];
  @Input('data') data : any;
  @Input('type') type : 'workout' | 'day' = 'workout';

  constructor(
    private fb: FormBuilder,
    private service: Completed,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl : LoadingController,
    private userService : User,
    private firestoreService : Firestore
  ) {
    this.workoutForm = this.fb.group({
      beforeEnergy: ['', Validators.required],
      beforeMood: ['', Validators.required],
      afterEnergy: ['', Validators.required],
      afterMood: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (this.data) {
      this.workoutForm.patchValue(this.data.energyData);
    }
    this.userService.userDetails$.subscribe((res)=> {
      if(res){
        this.userEmail = res.email;
      }
    })
  }

  selectEnergyLevel(field: string, level: number) {
    this.workoutForm.get(field)?.setValue(level);
  }

  selectMood(field: string, mood: string) {
    this.workoutForm.get(field)?.setValue(mood);
  }

  getEnergyColor(level: number) {
    // Custom color map that transitions from teal to red
    const colorMap : any = {
      1: '#00ccbd', // Primary teal
      2: '#48b6ab', // Teal transitioning to lighter green
      3: '#8f9f99', // Neutral middle point
      4: '#d68787', // Starting to get reddish
      5: '#ff0000'  // Full red
    };
    return colorMap[level] || '#00ccbd';
  }

  async onSubmit() {
    if (this.workoutForm.valid) {
      this.modalCtrl.dismiss({energyData : this.workoutForm.value});
    }
  }

  async update() {
    if (this.workoutForm.valid) {
      this.loadingCtrl.create().then(async loadingEl=>{
        loadingEl.present();
        try {
          await this.service.updateMoodData(this.data.id, {
            energyData: this.workoutForm.value
          }).toPromise();
          loadingEl.dismiss();
          this.modalCtrl.dismiss(true);
        } catch (err) {
          loadingEl.dismiss();
      
        }
      })
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  continueWithoutSaving() {
    this.modalCtrl.dismiss({});
  }

  saveDayData(){
    const formValue = this.workoutForm.value;
    const beforeFilled = formValue.beforeEnergy && formValue.beforeMood;
    const afterFilled = formValue.afterEnergy && formValue.afterMood;

    if (!beforeFilled) {
    //  this.toastService.presentToast('Please fill the before energy and mood values');
      return;
    }

    if (afterFilled && !beforeFilled) {
   //   this.toastService.presentToast('Before values must be filled if after values are provided');
      return;
    }

    let data = {
      userId: this.userEmail,
      category: "day-energy",
      date: new Date(),
      title: "Day Energy",
      watchCount: 1,
      durationMinutes: 0,
      isEnergyDataAvailable : true,
      energyData: this.workoutForm.value,

      //specific to day
      dateString : this.formatDate(new Date())
    }

    let id = this.userEmail + '-' + data.dateString;

    console.log(id, data);

    this.service.setDocument('completed', id, data).subscribe((res)=>{
      this.modalCtrl.dismiss(true);
    }, (err)=>{
      console.log(err);
    })
  }

  formatDate(date: Date){
   // return to this format  'yyyy-MM-dd'
   let dateString = date.toISOString().split('T')[0];
   let year = dateString.split('-')[0];
   let month = dateString.split('-')[1].padStart(2, '0');
   let day = dateString.split('-')[2];
   return year + '-' + month + '-' + day;
  }
}
