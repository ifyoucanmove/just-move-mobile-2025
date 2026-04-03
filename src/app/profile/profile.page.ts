import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { personOutline, trashOutline } from 'ionicons/icons';
import { IonSpinner } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared/shared-module';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { Common } from '../services/common';
import { AuthService } from '../services/auth';
import { Challenges } from '../services/challenges';
import { Logging } from '../services/logging';
import { Browser } from '@capacitor/browser';
import { Customer } from '../services/customer';
import { AlertController, LoadingController } from '@ionic/angular';

addIcons({ personOutline, trashOutline });

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [SharedModule, SidebarComponent, IonSpinner],
})
export class ProfilePage implements OnInit {
  isDeleting = false;
  status: string = '';
  customerData: any;
  hasActiveSubscriptions: boolean = false;
  constructor(
    public common: Common,
    public authService: AuthService,
    private logging: Logging,
    public customerService: Customer,
    private loadingCtrl: LoadingController,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.logging.logActivity({
      activity: 'Profile page loaded.',
      page: 'profile',
    });
    this.loadCustomerData();
  }

  get displayName(): string {
    const d = this.authService.userDetails;
    if (!d) return '';
    const parts = [d.fname, d.lname].filter(Boolean);
    return parts.length ? parts.join(' ') : (d.email || '');
  }

  toggleSidebar(): void {
    this.common.isSidebarOpen = !this.common.isSidebarOpen;
  }

  async onDeleteAccount(): Promise<void> {
    let hasActiveSubscriptions: boolean = true;
    if (this.status == 'Active') {
      hasActiveSubscriptions = true;
    } else {
      hasActiveSubscriptions = false;
    }
    if(hasActiveSubscriptions) {
      await this.common.showErrorToast('You have an active subscription. Please cancel your subscription before deleting your account.');
      return;
    }
    const result = await this.common.showConfirmDialog(
      'Delete account',
      'This permanently deletes your account and profile data. This cannot be undone.',
      'Cancel',
      'Delete'
    );
    if (result !== 'confirm') return;

    try {
      this.deleteAccount();
    } catch (err: any) {
      let msg = err.message;
      await this.common.showErrorToast(msg);
    } finally {
      this.isDeleting = false;
    }
  }

  async presentAlertPrompt() {
   
    if (this.hasActiveSubscriptions) {
      const alert = await this.alertController.create({
        header: "Warning",
        mode: "md",
        message:
          "You have an active subscription, please cancel your subscription by visiting ifyoucanmove website before deleting your account",
        buttons: [
          {
            text: "Cancel",
            role: "cancel",
            handler: (blah) => {},
          },
          {
            text: "Visit Website",
            handler: async () => {
              let url = await this.authService.generateLink('cancel');
              Browser.open({url : url})
              this.logging.logActivity(
              {  page: "settings",
                activity: "redirect to web to cancel active subscription"
              });
            },
          },
        ],
      });
      await alert.present();
    } else {
      const alert = await this.alertController.create({
        message:
          "You are trying to delete your account, please enter your registered email to continue",
        mode: "md",
        inputs: [
          {
            name: "email",
            type: "email",
            placeholder: "Email",
            attributes: {
              autocapitalize: "none",
              autocorrect: "off",
              autocomplete: "email",
              spellcheck: "false",
            },
          },
        ],
        buttons: [
          {
            text: "Cancel",
            role: "cancel",

            handler: () => {},
          },
          {
            text: "Delete",
            cssClass: "alert-red",

            handler: (alert: any) => {
              if (alert.email == this.authService.userDetails.email) {
                console.log("Matches");
                this.deleteAccount();
              } else {
                this.common.showErrorToast(
                  "Your registered email and inputted email doesn't match"
                );
              }
            },
          },
        ],
      });

      await alert.present();
    }
  }


  loadCustomerData() {
    console.log('Working here');

    this.customerService.customer$.subscribe(
      (res: any) => {
        if (res) {
          // res = res[0];
          console.log('CUstomer res', res);
    
          if (res.status === 'active') {
            this.status = 'Active';
          } else if (res.status != 'active' && res.paddle_status == 'paused') {
            this.status = 'Paused';
          } else {
            this.status = 'Not Active';
          }

         
        } else {
          this.status = 'Not Active';
        }

        if (this.status == 'Active') {
          this.hasActiveSubscriptions = true;
        } else {
          this.hasActiveSubscriptions = false;
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  deleteAccount() {
    let url =
      "https://us-central1-ifyoucanmove-dev.cloudfunctions.net/deleteUser";
    this.loadingCtrl.create().then((loadingEl: any) => {
      loadingEl.present();
      this.authService.deleteUser(this.authService.userDetails.uid).subscribe(
        (res) => {
          loadingEl.dismiss();
          this.authService.signOut();
          this.router.navigate(['/welcome']);
          this.logging.logActivity(
           { page: "settings",
            activity: "Account deleted by " + this.authService.userDetails.uid
         } );
         setTimeout(() => {
          window.location.reload();
         }, 1000);
        },
        (err) => {
          loadingEl.dismiss();
        }
      );
    });
  }

 
}
