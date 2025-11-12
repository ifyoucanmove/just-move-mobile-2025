import { Injectable, inject } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class Common {
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  /**
   * Show success toast message in top right
   * @param message - Success message to display
   * @param duration - Duration in milliseconds (default: 3000)
   */
  async showSuccessToast(message: string, duration: number = 3000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'top',
      cssClass: 'success-toast',
      color: 'success',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            console.log('Success toast dismissed');
          }
        }
      ]
    });

    await toast.present();
    return toast;
  }

  /**
   * Show error toast message in top right
   * @param message - Error message to display
   * @param duration - Duration in milliseconds (default: 4000)
   */
  async showErrorToast(message: string, duration: number = 4000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'top',
      cssClass: 'error-toast',
      color: 'danger',
      buttons: [
        {
          text: 'OK',
          role: 'cancel',
          handler: () => {
            console.log('Error toast dismissed');
          }
        }
      ]
    });

    await toast.present();
    return toast;
  }

  /**
   * Show info toast message in top right
   * @param message - Info message to display
   * @param duration - Duration in milliseconds (default: 3000)
   */
  async showInfoToast(message: string, duration: number = 3000) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'top',
      cssClass: 'info-toast',
      color: 'primary',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
    return toast;
  }

  /**
   * Show confirm dialog with two buttons
   * @param title - Dialog title
   * @param message - Dialog message
   * @param button1 - First button text (default: 'Cancel')
   * @param button2 - Second button text (default: 'Confirm')
   * @returns Promise that resolves with 'button1' or 'button2' based on which button was clicked
   */
  async showConfirmDialog(
    title: string,
    message: string,
    button1: string = 'Cancel',
    button2: string = 'Confirm'
  ): Promise<'cancel' | 'confirm'> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: title,
        message: message,
        buttons: [
          {
            text: button1,
            role: 'cancel',
            handler: () => {
              resolve('cancel');
            }
          },
          {
            text: button2,
            handler: () => {
              resolve('confirm');
            }
          }
        ]
      });

      await alert.present();
    });
  }
}
