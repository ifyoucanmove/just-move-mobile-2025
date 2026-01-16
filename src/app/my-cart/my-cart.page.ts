import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';

import { Shopify } from '../services/shopify';
import { ActivatedRoute } from '@angular/router';
import { User } from '../services/user';
import { Customer } from '../services/customer';
import { addIcons } from 'ionicons';
import { add, remove, trash } from 'ionicons/icons';
import { AlertController } from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular/standalone';
import { combineLatest } from 'rxjs';
import { Browser } from '@capacitor/browser';
import * as _ from "lodash";
import { SharedModule } from '../shared/shared/shared-module';
import { MainHeaderComponent } from '../shared/main-header/main-header.component';
import { Alert } from '../services/alert';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.page.html',
  styleUrls: ['./my-cart.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent]
})
export class MyCartPage implements OnInit {

  unfilteredStores:any = [];
  stores:any = [];
  // selectedAccordion = '';
  selectedStore: any = "";
 
  @ViewChild("accordionGroup", { static: true }) accordionGroup!: any;

  constructor(
    private shopifyService: Shopify,
    private alertController: AlertController,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private alsertService: Alert,
    private userService: User,
    public customerService : Customer,
    public authService: AuthService
  ) {
    addIcons({remove, add, trash})
  }

  ngOnInit() {
    this.shopifyService.loadCartItems(this.authService.userDetails.email);
    this.route.queryParams.subscribe((param) => {
      if (param) {
        this.selectedStore = param["store"];
        this.filterStores();
        this.ngAfterViewInit();
      } else {
        this.selectedStore = "";
      }    
    });
   
    combineLatest([
      this.shopifyService.cartItemsJustMove$,
      this.shopifyService.cartItemsPejaAmari$,
      this.shopifyService.cartItemsTeamLashae$,
      this.shopifyService.cartItemsSayItLoud$,
    ]).subscribe((res) => {
      console.log("<<<<<<<<<<Cart items>>>>>>>>>>>></Cart>", res);

    
       this.unfilteredStores = [
        {
          store: "justMove",
          cssClass: "bg1",
          imageUrl: "/assets/images/pic1.webp",
          cart: res[0],
          length: res[0].length,
          cartTotal: this.calculateCartTotal(res[0]),
        },
        {
          store: "pejaAmari",
          cssClass: "bg2",
          imageUrl: "assets/images/pic-2.webp",
          cart: res[1],
          length: res[1].length,
          cartTotal: this.calculateCartTotal(res[1]),
        },
        {
          store: "teamLashae",
          cssClass: "bg3",
          imageUrl: "/assets/images/pic-3.webp",
          cart: res[2],
          length: res[2].length,
          cartTotal: this.calculateCartTotal(res[2]),
        },
        {
          store: "sayItLoud",
          cssClass: "bg4",
          imageUrl: "/assets/images/pic-4.1.webp",
          cart: res[3],
          length: res[3].length,
          cartTotal: this.calculateCartTotal(res[3]),
        },
      ]; 
      this.stores.sort((a:any, b:any) => b.length - a.length);
     
      console.log("All stores", this.stores);
      this.filterStores();
    });
  }

  ngAfterViewInit(): void {
    const nativeEl = this.accordionGroup;
    console.log("Native Element", nativeEl);
    if(nativeEl){
      nativeEl.value = this.selectedStore;
    }
  }

  filterStores() {
    console.log("Unfiltered stores", this.unfilteredStores);
    
    const selected = this.unfilteredStores.find((store:any) => store.store === this.selectedStore);
    this.stores = this.unfilteredStores.filter(
      (store:any) => store.length > 0 || store.store === this.selectedStore
    );
    if (selected) {
      this.stores = this.stores.filter((store:any) => store.store !== this.selectedStore);
      this.stores.unshift(selected);
    }

    if (this.stores.length > 1) {
      this.stores = [this.stores[0], ...this.stores.slice(1).sort((a:any, b:any) => b.length - a.length)];
      if (!this.selectedStore) {
        this.selectedStore = this.stores.map((store:any) => store.store);
        console.log("seleddcted store", this.selectedStore);
        
        this.changeDetector.detectChanges();
      }
      
    }

    console.log("Filtered stores", this.stores);
  }

  trackByStore(index: number, store: any): string {
    return store.store;
  }

  calculateCartTotal(cartItems: any[]) {
    return cartItems.reduce((sum, item) => {
      return sum + item.price.amount * item.quantity;
    }, 0);
  }

  accordionChange(event: any) {
    
    this.selectedStore = event.detail.value;
    console.log(this.selectedStore);
  }

  increaseQuantity(productId: string, store:any) {
    const cartItems = this.shopifyService.getCart(store);
    const item = cartItems.find((item) => item.id === productId);

    if (item) {
      item.quantity++;
      this.shopifyService.setCart(store, cartItems);
      this.shopifyService
        .addToCartsFb(cartItems, store)
        .then(() => {
         console.log("Cart updated successfully");
        })
        .catch((error) => {
          console.error("Error updating cart:", error);
        });
    }
  }

  decreaseQuantity(productId: string, store: string) {
    const cartItems = this.shopifyService.getCart(store);
    const item = cartItems.find((item) => item.id === productId);

    if (item && item.quantity > 1) {
      item.quantity--;
      this.shopifyService.setCart(store, cartItems);
      this.shopifyService
        .addToCartsFb(cartItems, store)
        .then(() => {
          console.log("Cart updated successfully");
        })
        .catch((error) => {
          console.error("Error updating cart:", error);
        });
    }
  }

  async confirmDelete(productId: string, store: string) {
    console.log("productId", productId);
    console.log("store", store);
    const alert = await this.alertController.create({
      header: "Confirm",
      mode: "ios",
      message: "This action will remove the item from your cart. Do you wish to proceed?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: (blah) => {},
        },
        {
          text: "Yes",
          handler: () => {
            this.deleteItem(productId, store);
          },
        },
      ],
    });
    await alert.present();
  }

  deleteItem(productId: string, store: string) {
    this.loadingCtrl.create().then((loadingEl) => {
      loadingEl.present();
      const cartItems = this.shopifyService.getCart(store);
      const updatedCartItems = cartItems.filter((item) => item.id !== productId);

      this.shopifyService.setCart(store, cartItems);
      this.shopifyService
        .addToCartsFb(updatedCartItems, store)
        .then(() => {
          loadingEl.dismiss();
       //   this.logService.logActivity('cart', `removed-${productId}-${store}`)
          console.log("Item deleted and cart updated successfully");
        })
        .catch((error) => {
          loadingEl.dismiss();
          console.error("Error updating cart:", error);
          this.alsertService.showFirebaseAlert(error);
        });
    });
  }

  checkout(store: string) {

    this.loadingCtrl.create().then(async (loadingEl) => {
      loadingEl.present();
      try {
        console.log("Store", store);
        
        this.shopifyService.updateStoreFrontClinet(store);
         let items: any[] = [];
        _.each(this.shopifyService.getCart(store), (item) => {
          console.log("Item,", item);
          
          items.push({
            quantity: item.quantity,
            merchandiseId: item.id,
          });
        }); 
       /*  let items = [
          {  "merchandiseId": "gid://shopify/ProductVariant/46833640308976",
             "quantity": "2"
           }
         ]; */
         
        let email = this.authService.userDetails.email;
        console.log("email", items);
        await this.shopifyService.updateShopifyCustomer(email,store, this.customerService.customerSubscribed$.value) // temp call
        let data = await this.shopifyService.createCheckoutId(items, email);
      // alert(JSON.stringify(data));
        loadingEl.dismiss();
        if (data && !data.errors && data.cartCreate.cart.id) {
          const webUrl = data.cartCreate.cart.checkoutUrl;
          console.log("OPENINIG URL", webUrl);
          Browser.open({ url: webUrl });
        } else {
          console.log(data);
          if (data.errors) this.alsertService.showFirebaseAlert(data.errors);
        }
      } catch (error) {
        loadingEl.dismiss();
        this.alsertService.showFirebaseAlert(error);
      }
    });
  }


  checkIfStoreSelected(store:any) {
    
    return Array.isArray(this.selectedStore) && this.selectedStore.includes(store.store); 
   
  }



}

