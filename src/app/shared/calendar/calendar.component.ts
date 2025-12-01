import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared-module';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class CalendarComponent  implements OnInit {

  @Input("selectedDate") selectedDate = null;
  @Input("type") type = 1;
  @Input() minDate!: string;
  @Input() maxDate!: string;
  date: any;
  calenderDate = null;

  constructor(
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    console.log(this.type);
    if(!this.maxDate){
      this.maxDate = new Date().toISOString();
    }
    // Calculate minDate as two year before the current date
  const currentDate = new Date();
  const lastYearDate = new Date(
    currentDate.getFullYear() - 2,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  if(!this.minDate){
    this.minDate = lastYearDate.toISOString();
  }

    if (this.selectedDate) {
      this.calenderDate = this.selectedDate;
      this.date = this.selectedDate;
    }


  }

  async changeDate(dateVal: any) {
    this.date = dateVal.split(".")[0];
    console.log(this.date);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2); // Add 1 to month since getMonth() returns 0-11
    const day = ("0" + date.getDate()).slice(-2);
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  save() {
    console.log(this.date);
    if (!this.date) {
      const currentDate = new Date();
      this.date = this.formatDate(currentDate);
      console.log(this.date);
    }
    this.modalCtrl.dismiss(this.date);
  }
}
