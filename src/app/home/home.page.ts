import { Component } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonSearchbar, 
  IonButton, 
  IonIcon,
  IonImg
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { menuOutline, heartOutline, closeOutline } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SharedModule } from '../shared/shared/shared-module';
import { AuthService } from '../services/auth';
import { Common } from '../services/common';

addIcons({
  menuOutline,
  heartOutline,
  closeOutline
});

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
   SharedModule
  ],
})
export class HomePage {
  selectedCategory = 'Shakes';
  categories = ['Shakes', 'Smoothie Bowls', 'Juices', 'Teas'];
  favoriteCount = 113;
  isSidebarOpen = false;

  constructor(public router:Router, public authService:AuthService, private common:Common) {
  }
  
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.toggleSidebar(); // Close sidebar after navigation
  }

  goToProductDetail() {
  //  this.router.navigate(['/product-detail']);
  this.router.navigate(['/products']);
  }

  async logout() {
    const result = await this.common.showConfirmDialog(
      'Logout',
      'Are you sure you want to logout?',
      'Cancel',
      'Logout'
    );

    if (result === 'confirm') {
      // User confirmed logout
      try {
        await this.authService.signOut();
        this.router.navigate(['/signin']);
        window.location.reload();
      } catch (error) {
        console.error('Logout error:', error);
        await this.common.showErrorToast('Failed to logout. Please try again.');
      }
    }
    // If result is 'button1', user cancelled - do nothing
  }
}
