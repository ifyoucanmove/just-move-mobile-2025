import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Customer } from 'src/app/services/customer';
import { Common } from 'src/app/services/common';
import { ModalController } from '@ionic/angular/standalone';
import { MenuController } from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close, chevronBackOutline, arrowBackOutline } from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';
import { SharedModule } from '../shared/shared-module';
@Component({
  selector: 'app-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class MainHeaderComponent  implements OnInit {

  @Input() title ='';
  @Input() buttonType = '';
  @Input() isLogged = true;
  @Input() headerType = 1;
  @Input('backUrl') backUrl = '';
  platform = '';
  backIcon: string = 'arrow-back-outline';

  constructor(
    private menuCtrl: MenuController,
    private router: Router,
    private customerService: Customer,
    private modalCtrl : ModalController,
    private navCtrl: NavController,
  ) {
    addIcons({close, chevronBackOutline, arrowBackOutline})
  }

  ngOnInit() {
    this.platform = Capacitor.getPlatform();
    console.log(this.platform);
    
    this.setBackIcon();
  }

  setBackIcon() {
    if (this.platform === 'ios') {
      this.backIcon = 'chevron-back-outline';
    } else if (this.platform === 'android' || this.platform === 'web') {
      this.backIcon = 'arrow-back-outline';
    } else {
      this.backIcon = 'arrow-back-outline';
    }
    console.log(this.backIcon);
    
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }
  favoriteClicked() {
    if (this.customerService.status == "active") {
      console.log(this.router.url);
      this.router.navigate(["/favorites"], { queryParams: { from: 'back' } });
    } else {
     /*  this.toastService.presentToast(
        "A subscription is required to access this page"
      ); */
    }
  }
  searchClicked() {
    if (this.customerService.status == "active") {
      this.router.navigate(["/search"], { queryParams: { from: 'back' } });
    } else {
   /*    this.toastService.presentToast(
        "A subscription is required to access this page"
      ); */
    }
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }

  backClicked(){
    console.log('clickeddd');
    
    this.navCtrl.back();
  }
}

