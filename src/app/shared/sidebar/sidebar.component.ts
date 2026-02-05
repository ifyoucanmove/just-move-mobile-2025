import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Common } from '../../services/common';
import { Challenges } from '../../services/challenges';
import { SharedModule } from '../shared/shared-module';
import { addIcons } from 'ionicons';
import { homeOutline, beerOutline, heartOutline, searchOutline, trophyOutline, cartOutline, receiptOutline, storefrontOutline, logOutOutline, closeOutline } from 'ionicons/icons';
import { IonSpinner } from '@ionic/angular/standalone';

addIcons({
  homeOutline,
  beerOutline,
  heartOutline,
  searchOutline,
  trophyOutline,
  cartOutline,
  receiptOutline,
  storefrontOutline,
  logOutOutline,
  closeOutline
});

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [SharedModule,IonSpinner]
})
export class SidebarComponent implements OnInit {

  @Input() isOpen: boolean = false;
  @Output() closeSidebar = new EventEmitter<void>();
  isLoading: boolean = false;
  constructor(
    private router: Router,
    public authService: AuthService,
    private common: Common,
    private challengeService: Challenges
  ) { }

  ngOnInit() {}

  onClose() {
    this.closeSidebar.emit();
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
    this.onClose(); // Close sidebar after navigation
  }

  async logout() {
    //this.isLoading = true;
    const result = await this.common.showConfirmDialog(
      'Logout',
      'Are you sure you want to logout?',
      'Cancel',
      'Logout'
    );

    if (result === 'confirm') {
      // User confirmed logout
      try {
        this.isLoading = true;
        // Cleanup challenges data and subscriptions
        this.challengeService.cleanup();
        // Clear tutorial localStorage
        localStorage.removeItem('product_detail_tutorial_shown');
        await this.authService.signOut();
        
        this.router.navigate(['/welcome'], { replaceUrl: true });
        this.isLoading = false;
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('Logout error:', error);
        this.isLoading = false;
        await this.common.showErrorToast('Failed to logout. Please try again.');
      }
    }
    // If result is 'button1', user cancelled - do nothing
  }

}
