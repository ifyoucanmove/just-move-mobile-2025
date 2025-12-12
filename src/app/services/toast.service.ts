import { Injectable } from "@angular/core";
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: "root",
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      mode: "ios",
      position: "top",
      cssClass: "primary-toast",
    });
    toast.present();
  }


  async presentHomeToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      mode: "ios",
      position: "top",
      cssClass: "primary-toast",
    });
    toast.present();
  }
}
