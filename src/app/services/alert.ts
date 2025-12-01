import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';
import { User } from './user';
import { AuthService } from './auth';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class Alert {
  subscribeAlertText =
  "You are being directed to ifyoucanmove.com website in order to signup. You might need to login again. Continue?";
subscribeUpgradeAlertText =
  "You are being directed to ifyoucanmove.com website in order to upgrade. You might need to login again. Continue?";
stripeBillingText =
  "You are being directed to another website in order to view your billing information. Continue?";
anotherWebsiteText = "You are being directed to another website. Continue?";
moveWebsiteText =
  "You are being directed to ifyoucanmove.com website. Continue?";
challengeSubcribeText =
  "You are being directed to ifyoucanmove.com website so you can sign up for the challenge. Continue?";
giftSomeoneText =
  "Note: Remember to email us at support@ifyoucanmove.com about your gift so we can transfer the payment to gift account.";
justMoveSupplementText =
  "You are being directed to the store JUST MOVE SUPPLEMENTS. Continue?";
pejaAndAmariText =
  "You are being directed to the store PEJA + AMARI FASHION. Continue?";
teamLashaeTest = "You are being directed to the store TEAM LASHAE. Continue?";
sayItLoudText = "You are being directed to the store SAY IT LOUD. Continue?";
termsText = "You are being directed to ifyoucanmove.com/terms website. Continue?";
privacyText = "You are being directed to ifyoucanmove.com/privacy website. Continue?";
externalWebsiteText =
"You are being directed to an external website. Continue?";

userDetails:any;

constructor(
  private alertCtrl: AlertController,
  private authService: AuthService,
  private afAuth: Auth,
  private userService: User
) {
  this.userService.userDetails$.subscribe((res) => {
    console.log(res);
    if (res) {
      this.userDetails = res;
      console.log('res', res);
    }
  });
}

public async showAlert(header: string, message: string, buttons: any[]) {
  const alert = await this.alertCtrl.create({
    header: header,
    message: message,
    buttons: buttons,
  });
  alert.present();
}

public async showFirebaseAlert(error: any) {
  if (error.code != "permission-denied") {
    const alert = await this.alertCtrl.create({
      header: "Error",
      message:  error.message || JSON.stringify(error) ,
      buttons: ["Okay"],
    });
    alert.present();
  } else {
    this.authService.signOut();
  }
}


async generateLink(page : string) : Promise<string>{
  let user_email = this.userDetails.email;
  
  const user = await this.afAuth.currentUser;
  if (!user) {
    throw new Error("User is not authenticated.");
  }
  let token = await user.getIdToken();
  return `https://ifyoucanmove.com/login-from-mobile?email=${user_email}&page=${page}&token=${token}`;
}
}
