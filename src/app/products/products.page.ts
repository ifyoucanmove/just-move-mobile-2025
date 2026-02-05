import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { SharedModule } from '../shared/shared/shared-module';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../services/recipe';
import { environment } from 'src/environments/environment';
import { IonTabs, NavController, Platform } from '@ionic/angular/standalone';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { FilterDialogComponent } from '../shared/filter-dialog/filter-dialog.component';
import { ModalController } from '@ionic/angular/standalone';
import { Shopify } from '../services/shopify';
import { AuthService } from '../services/auth';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { menuOutline, heartOutline, closeOutline, trophyOutline, cartOutline, receiptOutline, storefrontOutline } from 'ionicons/icons';
import { Customer } from '../services/customer';
import { Challenges } from '../services/challenges';
import { Common } from '../services/common';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';


@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class ProductsPage implements OnInit {

  @ViewChild(IonTabs) tabs!: IonTabs;

  constructor(public router:Router, 
    public common:Common,
    public authService:AuthService) { 
      addIcons({
        trophyOutline,
        cartOutline,
        receiptOutline,
        storefrontOutline
      });
    }

  ngOnInit() {
 
  }

  toggleSidebar() {
    this.common.isSidebarOpen = !this.common.isSidebarOpen;
  }

 
}
