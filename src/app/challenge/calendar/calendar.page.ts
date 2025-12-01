import { Component, OnInit, ViewChild } from '@angular/core';

import { SharedModule } from 'src/app/shared/shared/shared-module';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Subscription } from 'rxjs';
import { Challenges } from 'src/app/services/challenges';
import { Completed } from 'src/app/services/completed';
import { Customer } from 'src/app/services/customer';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/services/user';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, chevronBackOutline, chevronForwardOutline, closeCircle, lockClosed } from 'ionicons/icons';
import { CalendarComponent } from 'src/app/shared/calendar/calendar.component';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { MainHeaderComponent } from 'src/app/shared/main-header/main-header.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
  standalone: true,
  imports: [SharedModule,FullCalendarModule, MainHeaderComponent]
})
export class CalendarPage implements OnInit {
  currentMonthYear: string = '';
  
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    // firstDay: 1, // Monday as first day (0 = Sunday, 1 = Monday)
    headerToolbar: false, // We'll use custom navigation
    displayEventTime: false,
    events: [],
    dayCellClassNames: (arg) => {
      // Check if this day cell is today
      const cellDate = arg.date;
      const today = new Date();
      const isToday = cellDate.getDate() === today.getDate() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getFullYear() === today.getFullYear();
      
      return isToday ? ['today-highlight'] : [];
    },
    eventContent: (arg) => {
      const event = arg.event;
      const isWatched = (event.extendedProps as any).isWatched;
      const watchCount = (event.extendedProps as any).watchCount;
      const day = parseInt(event.title);
      const isDisabled = !this.isDayAvailable(day);
      
      let iconHtml = '';
      let hasIcon = false;
      
      if (isDisabled) {
        // iconHtml = '<ion-icon name="lock-closed" class="status-icon disabled-icon"></ion-icon>';
        // hasIcon = true;
      } else if (isWatched) {
        iconHtml = '<ion-icon name="checkmark-circle" class="status-icon completed-icon"></ion-icon>';
        hasIcon = true;
      }
      // For pending (not watched, not disabled), we don't show any icon

      return {
        html: `
          <div class="challenge-day-event ${isDisabled ? 'disabled' : ''} ${isWatched ? 'completed' : 'pending'} ${!hasIcon ? 'no-icon' : ''}">
            ${hasIcon ? `<div class="day-indicator">${iconHtml}</div>` : ''}
            <div class="day-info">
              <span class="day-label">Day</span>
              <span class="day-number-large">${event.title}</span>
              </div>
              </div>
              `
              };
            },
  // ${watchCount > 0 ? `<span class="watch-count">${watchCount} views</span>` : ''}
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 3, // Allow up to 3 events per day before showing +more
    weekends: true,
    datesSet: (info) => {
      // Update current month/year when calendar view changes
      // Get the middle date of the view to ensure we get the correct month
      const viewStart = new Date(info.start);
      const viewEnd = new Date(info.end);
      const middleDate = new Date(viewStart.getTime() + (viewEnd.getTime() - viewStart.getTime()) / 2);
      this.updateCurrentMonthYear(middleDate);
    },
    select: (info) => {
      console.log('Selected date:', info.startStr);
    },
    eventClick: (info) => {
      console.log('Event clicked:', info.event);
      const day = parseInt(info.event.title);
      if (this.isDayAvailable(day)) {
        this.goToDayPage(info.event.title);
      }
    }
  };
  
  userDetails: any = {};
  challengeId:any;
  challengeData:any;
  daysOfTheWeek:any;

  watchData: any[] = [];
  challengeWatchSubscription: Subscription = new Subscription();
  repeatCount:any;
  isCalendarShowing = false;

  days:any=[];
  challengeDays:any[]=[];
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  customerChallengeData: any = {};
  isLoading = true;

  constructor( public challengeService:Challenges,public completedService: Completed,
    public router:Router,
    public route:ActivatedRoute,public customerService:Customer,
    private firestore: Firestore,
    private modalCtrl: ModalController,
    private userService: User, 
  ) { 
    // Initialize icons
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'checkmark-circle': checkmarkCircle,
      'close-circle': closeCircle,
      'lock-closed': lockClosed
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((res:any)=>{
      this.isLoading = true;
      try {
        // Initialize current month/year
        this.updateCurrentMonthYear(new Date());
        
    /*     this.userService.userDetails$.subscribe((user: any) => {
          this.userDetails = user; */
          let selectedIndex = this.challengeService.selectedChallengeIndex;
          this.challengeId = this.challengeService.challengeDatas[selectedIndex].id;        console.log(this.challengeId,"res")
          if(this.challengeId){
            this.getChallenge();
  
            this.customerService.customer$.subscribe((res:any)=>{
  
              if (res.challengeData) {
                this.customerChallengeData = res.challengeData;
                console.log("Here", res.challengeData);
              } else {
                this.customerChallengeData = {};
              }
  
             if(res.challengeData && res.challengeData[this.challengeId]){
              this.repeatCount = res.challengeData[this.challengeId].repeatCount;
              console.log("this.repeatCount",this.repeatCount);
              
             }else{
              this.repeatCount = 0;
             }
            });
            
            console.log("this.repeatCount",this.repeatCount);
            
            this.loadChallengeWatchData(this.userService.email, this.challengeId, this.repeatCount);
            this.getData();
            // this.isLoading = false;
                   
          }
     /*    });*/
      } catch (error) {
        console.log('ngOnInit() Error: ', error);
      }
    }) 
    
  }
  getChallenge(){
    this.challengeService.getChallengeData(this.challengeId).subscribe(res=> {
  this.challengeData = res;
  console.log('challengeData', this.challengeData);
  })
  }

  ionViewDidLeave() {
    console.log("ionViewDidLeave");
    
    this.isLoading = true;
  }


  ngOnDestroy() {
    this.challengeWatchSubscription.unsubscribe();
    this.isLoading = true;
  }
  goToDayPage(day: any) {
    // Calculate total days for this challenge to ensure we don't navigate to invalid days
    const totalDays = (parseInt(this.challengeData[0].weekTotalCount, 10) - 1) * 7 + parseInt(this.challengeData[0].weekFinalDayCount, 10);
    
    if (day > totalDays) {
      console.log('Day is beyond challenge duration');
      return;
    }

    // Determine which week the day belongs to
    this.router.navigate([`/challenge/day`, day]);
    // if(day <= 7){
    //   this.router.navigate([`challenge/${this.challengeId}/challenge-week1/day`, day]);
    // }
    // else if(day <= 14){
    //   this.router.navigate([`challenge/${this.challengeId}/challenge-week2/day`, day]);
    // }
    // else if(day <= 21){
    //   this.router.navigate([`challenge/${this.challengeId}/challenge-week3/day`, day]);
    // }
    // else if(day <= 28){
    //   this.router.navigate([`challenge/${this.challengeId}/challenge-week4/day`, day]);
    // }
    // else if(day <= totalDays){
    //   this.router.navigate([`challenge/${this.challengeId}/challenge-week5/day`, day]);
    // }
  }
  async loadChallengeWatchData(userEmail: string, challengeId: string, repeatCount: number) {
    this.challengeWatchSubscription = this.completedService
      .loadChallengeWeekData(userEmail, challengeId, repeatCount)
      .subscribe((res: any[]) => {
        this.watchData = res;
        console.log(this.watchData,"this.watchData")
        this.mergeData()
      });
  }

 async getData(){
  let selectedIndex = this.challengeService.selectedChallengeIndex;
  let challengeDate =  this.challengeService.challengeDatas[selectedIndex];
    this.daysOfTheWeek = this.challengeService.getDaysOfTheWeek(
      challengeDate.weeklyFirstDay,
      7
    );

  let res =  await this.challengeService.getChallengeVideosDataNew(this.challengeId);
  //console.log(res,"res")
  this.challengeDays = res;
  this.mergeData()
  }
  getChallengeDate(startDate: Date, days: number, format = 'ISO'): string {
    // Create a new date object to avoid modifying the original
    const date = new Date(startDate);
    
    // Validate the date
    if (isNaN(date.getTime())) {
      throw new Error('Invalid start date provided');
    }
    
    // Add days (each day = 24 hours = 86400000 milliseconds)
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // Format the date according to the specified format
    switch (format.toUpperCase()) {
      case 'US':
        // MM/DD/YYYY
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      case 'EU':
        // DD/MM/YYYY
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      case 'ISO':
        // YYYY-MM-DD
        return date.toISOString().split('T')[0];
      case 'LOCALE':
      default:
        // Format like: "Sun Mar 09 2025 11:29:00 GMT+0530 (India Standard Time)"
        return date.toString();
    }
  }

  getMonthAndYear(dateString:any) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adds leading 0
    const year = date.getFullYear();
    return `${year}-${month}-01`;
  }

  async mergeData() {

  
    this.isLoading = false;
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.removeAllEvents();

    // Get start date - for active challenges always use week1Opens
    let startDate: Date;
    let isCustomStartDate = false;
    const isActiveChallenge = this.challengeData[0]._status === 'active';

    if (isActiveChallenge) {
      // For active challenges, always use week1Opens
      startDate = new Date(this.challengeData[0].week1Opens.seconds * 1000);
      isCustomStartDate = false;
    } else if (this.customerService.customer?.challenge_calendar_data?.[this.challengeId]) {
      // For completed challenges, allow custom start date
      const storedDate = this.customerService.customer.challenge_calendar_data[this.challengeId];
      startDate = new Date(storedDate);
      // Validate the date
      if (isNaN(startDate.getTime())) {
        startDate = new Date(this.challengeData[0].week1Opens.seconds * 1000);
      } else {
        isCustomStartDate = true;
      }
    } else {
      startDate = new Date(this.challengeData[0].week1Opens.seconds * 1000);
    }

    // Calculate total days for this challenge
    const totalDays = (parseInt(this.challengeData[0].weekTotalCount, 10) - 1) * 7 + parseInt(this.challengeData[0].weekFinalDayCount, 10);
    console.log('Challenge totalDays calculation:', {
      weekTotalCount: this.challengeData[0].weekTotalCount,
      weekFinalDayCount: this.challengeData[0].weekFinalDayCount,
      totalDays: totalDays
    });

    // Navigate to the month of the start date
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    calendarApi.gotoDate(new Date(year, month, 1));

    this.days = [];

    // Filter challengeDays to only include days up to totalDays
    const validChallengeDays = this.challengeDays.filter((item: any) => item.day <= totalDays);

    validChallengeDays.forEach((item: any) => {
      // For both custom and regular start dates, Day 1 should be on the start date
      const daysToAdd = item.day - 1;
      const eventDate = this.getChallengeDate(startDate, daysToAdd);
      this.days.push({
        isWatched: this.isDayVideoWatched(item.day),
        day: item.day,
        dayData: item,
        dayOfWeek: 0,
        load: false,
        start: eventDate,
        end: eventDate,
        watchCount: this.getDayWatchCount(item.day)
      });
    });

    const formattedEvents = this.days.map((item: any) => ({
      title: item.day,
      start: item.start,
      end: item.end,
      color: '#378006',
      backgroundColor: '#ffffff',
      isWatched: item.isWatched || false,
      watchCount: item.watchCount
    }));

    // Clear existing events and add new ones
    calendarApi.removeAllEvents();
    calendarApi.addEventSource(formattedEvents);

    // Force calendar to re-render
    calendarApi.render();
    // this.isLoading = false;

    console.log("COndes comes here");
    await this.challengeService.getActiveChallengeVideosData();
  }

  isDayVideoWatched(day: number) {
    const data = this.watchData.filter((res) => {
      return res.day === String(day);
    });
    if (data.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  getDayWatchCount(day: any) {
    const data = this.watchData.filter((res) => {
      return res.day === String(day);
    });
    if (data.length > 0) {
      const count = Math.max.apply(
        Math,
        data.map((watchData) => {
          return watchData.watchCount;
        })
      );
      if (count > 1) {
        return count;
      } else { return 0; }
    } else {
      return 0;
    }
  }

  async openDateDialog(): Promise<void> {
    let currentDate = new Date();
    const maxDate = new Date(
      currentDate.getFullYear() + 1,
      currentDate.getMonth(),
      currentDate.getDate()
    );

    if (!this.isCalendarShowing) {
      this.isCalendarShowing = true;
      const modal = await this.modalCtrl.create({
        component: CalendarComponent,
        componentProps: {
          minDate: new Date().toISOString() || null,
          maxDate: maxDate.toISOString() || null
        },
        cssClass: 'calender-modal',
      });
      modal.onDidDismiss().then((data) => {

        if (data.data) {
          console.log(data.data,"data.data")
          this.saveCustomStartDate(data.data);
            // this.measurementForm.get('date')?.patchValue(data.data);
        }
        this.isCalendarShowing = false;
      });
      await modal.present();
    }




    // const dialogRef = this.dialog.open(DateSelectionDialogComponent, {
    //   width: '400px',
    //   data: {
    //     minDate: new Date() // This will disable past dates in the calendar
    //   }
    // });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     // Show confirmation dialog before proceeding
    //     const confirmDialogRef = this.dialog.open(ConfirmationDialogComponent, {
    //       width: 'auto',
    //       height: 'auto',
    //       data: "Are you sure you want to change the start date? This will reset all watched videos to zero."
    //     });

    //     confirmDialogRef.afterClosed().subscribe(confirmResult => {
    //       if (confirmResult) {
    //         this.saveCustomStartDate(result);
    //         this.logService.logActivity(
    //           'web', 
    //           this.customerService.email, 
    //           'challenge-settings', 
    //           `change-start-date - ${this.challengeData[0]?.dashTitle}`, 
    //           {
    //             resource: "challenge-settings", 
    //             type: "change-start-date", 
    //             challengeId: this.challengeId, 
    //             module: "challenge"
    //           }
    //         );
    //       }
    //     });
    //   }
    // });
  }

  async saveCustomStartDate(date: string): Promise<void> {
    try {
      // Ensure we have a valid date
      // if (!(date instanceof Date) || isNaN(date.getTime())) {
      //   throw new Error('Invalid date provided');
      // }

      const data = {
        challenge_calendar_data: {
          [this.challengeId]: date // Store as ISO string
        }
      };

      // Update the calendar start date
    /*   await this.firestore
        .collection('stripe_customers')
        .doc(this.userDetails.email)
        .update(data); */

      let ref = doc(this.firestore, `stripe_customers/${this.userService.email}`);
      updateDoc(ref, data);
      // Get current repeat count before reset
      let challengeData: any = {};
      if (
        this.customerChallengeData[this.challengeId] &&
        this.customerChallengeData[this.challengeId].repeatCount
      ) {
        challengeData = {
          ...this.customerChallengeData,
          [this.challengeId]: {
            repeatCount: this.repeatCount + 1,
            updatedDate: new Date(),
          },
        };
      } else {
        challengeData = {
          ...this.customerChallengeData,
          [this.challengeId]: {
            repeatCount: 1,
            updatedDate: new Date(),
          },
        };
      }

      let data2: any = {
        challengeData: challengeData,
      };
      console.log(data2);

      this.customerService
        .updateCustomer(this.userService.email, data2)
        .subscribe(async (ares) => {
             // Clear existing watch data
      this.watchData = [];
      
      // Get the updated repeat count from customer service
      const chId = this.challengeId.replace(/ /g, "");
      this.repeatCount = (this.customerService.customerChallengeData[chId]?.repeatCount || 0) + 1;

      // Clear existing calendar events
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.removeAllEvents();

      // Reinitialize challenge data
      await this.getChallenge();
      await this.getData();

      // Reload challenge watch data with new repeat count
      await this.loadChallengeWatchData(
        this.userService.email,
        this.challengeId,
        this.repeatCount
      );

   //   this.toastService.presentToast('Start date updated and watch data reset successfully!');

      // Refresh calendar with new start date
      await this.mergeData();

          let payload = {
            resource :"challenge-calendar", type:"reset-watch-data" , challengeId:this.challengeId , module :"challenge"
          }
       //   this.logService.logActivity("challenge-calendar", `reset-watch-data - ${this.challengeData[0].dashTitle}`, ' ', payload);
        });
   



   
    } catch (error) {
      console.error('Error saving start date:', error);
    //  this.toastService.presentToast('Error updating start date');
    }
  }

  isDayAvailable(day: number): boolean {

    if (!this.challengeData || !this.challengeData[0]) {
      console.log('No challenge data available');
      return false;
    }

    const today = new Date().getTime();
    const show = this.challengeData[0].challengeEndDate.seconds * 1000;
    const materials = !this.challengeData[0]._isMiniChallenge ? this.challengeData[0].materialOpens.seconds * 1000 : 0;
    const w1 = this.challengeData[0].week1Opens.seconds * 1000;
    const w2 = !this.challengeData[0]._isMiniChallenge ? this.challengeData[0].week2Opens.seconds * 1000 : 0;
    const w3 = !this.challengeData[0]._isMiniChallenge ? this.challengeData[0].week3Opens.seconds * 1000 : 0;
    const w4 = !this.challengeData[0]._isMiniChallenge ? this.challengeData[0].week4Opens.seconds * 1000 : 0;

    // Calculate total days and week count
    const totalDays = (parseInt(this.challengeData[0].weekTotalCount, 10) - 1) * 7 + parseInt(this.challengeData[0].weekFinalDayCount, 10);
    const weekCount = Number(this.challengeData[0].weekTotalCount);



    // First check if the challenge is still active
    if (today >= show) {
      console.log('Challenge has ended');
      return false;
    }

    // For mini challenges
    if (this.challengeData[0]._isMiniChallenge) {
      const isAvailable = today >= w1;
      console.log('Mini challenge day availability:', isAvailable);
      return isAvailable;
    }

    // For regular challenges
    if (day <= 7) {
      return today >= w1;
    } else if (day <= 14) {
      return today >= w2;
    } else if (day <= 21) {
      return today >= w3;
    } else if (day <= 28) {
      return today >= w4;
    } else if (day <= totalDays) {
      // Week 5 uses week 4's opening time
      return today >= w4;
    }

    return false;
  }

  updateCurrentMonthYear(date: Date): void {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long' 
    };
    this.currentMonthYear = date.toLocaleDateString('en-US', options);
  }

  previousMonth(): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.prev();
  }

  nextMonth(): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.next();
  }
}

