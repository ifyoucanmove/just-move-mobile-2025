import { Injectable, inject } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class Common {

  isSidebarOpen: boolean = false;
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);

  /**
   * Resolves whether the user's current location is in California (US).
   * Uses GPS + Nominatim reverse geocoding, or IP-based location as fallback.
   * @returns Promise<true> if state is California (or CA), otherwise Promise<false>
   */
  async isUserInCalifornia(): Promise<boolean> {
    try {
      const { country, state } = await this.getLocation();
      console.log('Current location:', `${country}, ${state}`, { country, state });
      return this.isCalifornia(state);
    } catch {
      return false;
    }
  }

  private getLocation(): Promise<{ country: string; state: string }> {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.reverseGeocodeWithNominatim(position.coords.latitude, position.coords.longitude)
              .then(resolve)
              .catch(() => this.getLocationFromIp().then(resolve).catch(reject));
          },
          () => this.getLocationFromIp().then(resolve).catch(reject),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
      });
    }
    return this.getLocationFromIp();
  }

  private async reverseGeocodeWithNominatim(lat: number, lon: number): Promise<{ country: string; state: string }> {
   const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en',
        'User-Agent': 'JustMoveSupplement/1.0 (Product Detail; Angular)'
      }
    });
    const data = await res.json() as { address?: { country?: string; state?: string; region?: string } };
    const addr = data?.address || {};
    return {
      country: addr.country || 'Unknown',
      state: addr.state || addr.region || 'Unknown'
    };
  }

  private async getLocationFromIp(): Promise<{ country: string; state: string }> {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json() as { country_name?: string; region?: string };
    return {
      country: data.country_name || 'Unknown',
      state: data.region || 'Unknown'
    };
  }

  private isCalifornia(state: string): boolean {
    if (!state) return false;
    const s = state.trim().toLowerCase();
    return s === 'california' || s === 'ca';
  }

  /**
   * Show success toast message in top right
   * @param message - Success message to display
   * @param duration - Duration in milliseconds (default: 3000)
   */
  async showSuccessToast(message: string, duration: number = 30000) {
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
