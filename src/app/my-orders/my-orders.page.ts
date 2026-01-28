import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared/shared-module';
import { MainHeaderComponent } from '../shared/main-header/main-header.component';
import { Shopify } from '../services/shopify';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../services/customer';
import { User } from '../services/user';
import { LoadingController } from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, remove, trash } from 'ionicons/icons';
import { IonAccordionGroup } from '@ionic/angular/standalone';
import { combineLatest } from 'rxjs';
import { Browser } from '@capacitor/browser';
import { Alert } from '../services/alert';
import * as _ from 'lodash';
import { ShopifyStorePipe } from '../pipes/shopify-store.pipe';
import { AuthService } from '../services/auth';
@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.page.html',
  styleUrls: ['./my-orders.page.scss'],
  standalone: true,
  imports: [SharedModule,MainHeaderComponent]
})
export class MyOrdersPage implements OnInit {

  orders: any[] = [];
  completedOrders: any[] = [];
  pendingOrders: any[] = [];
  isLoading: boolean = true;
  selectedSegment: "pending" | "completed" = "pending";

  //for carts

  unfilteredStores:any = [];
  stores:any = [];
  // selectedAccordion = '';
  selectedStore: string = "";
  userDetails: any;
  @ViewChild("accordionGroup", { static: true }) accordionGroup!: IonAccordionGroup;

  constructor(
    private shopifyService: Shopify,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private router: Router,
    private alertController: AlertController,
    private userService: User,
    public customerService : Customer,
    private alertService: Alert,
    private authService: AuthService
  ) {
    addIcons({remove, add, trash})
  }

  ngOnInit() {
    this.userService.userDetails$.subscribe((res)=> {
      if(res){
        this.userDetails = res;
      }
    })
    this.route.queryParams.subscribe((param) => {
      this.isLoading = true;
      this.loadingCtrl.create().then((loadingEl) => {
        // loadingEl.present();
        let email = this.authService.userDetails.email;
        this.shopifyService.getMyorders(email).subscribe(
          (res: any[]) => {
            console.log("Order res", res);
            this.orders = [];
            this.isLoading = false;

            this.orders = res.filter((order) => order.line_items.length > 0);
            // const orders = _.get(res, 'data.orders.edges', []);
            // _.each(orders, (item) => {
            //   const orderNode: any = _.get(item, 'node', {});
            //   const channelName: any = _.get(
            //     orderNode,
            //     'channelInformation.channelDefinition.channelName',
            //     ''
            //   );
            //   const price: any = _.get(
            //     orderNode,
            //     'currentTotalPriceSet.shopMoney.amount',
            //     ''
            //   );
            //   const lineItems: any = _.get(orderNode, 'lineItems.edges', []);
            //   const deliveryStatus = _.get(
            //     orderNode,
            //     'fulfillments[0].displayStatus',
            //     ''
            //   );
            //   this.orders.push({
            //     ...orderNode,
            //     createdAtString: moment(orderNode.createdAt).format(
            //       'MMM D [at] h:mm a'
            //     ),
            //     channelName: channelName,
            //     price: price,
            //     lineItems: lineItems,
            //     lineItemsLength: _.sumBy(lineItems, 'node.quantity'),
            //     tagsString: orderNode.tags.join(','),
            //     deliveryStatus,
            //   });
            // });
            console.log("orders, ", this.orders);
            // this.completedOrders = this.orders.filter(order=>order.displayFinancialStatus == 'PAID');
            // this.pendingOrders = this.orders.filter(order=>order.displayFinancialStatus != 'PAID');
            // this.orders

            loadingEl.dismiss();
          },
          (err) => {
            this.isLoading = false;
            loadingEl.dismiss();
            console.log("error", err);

            this.orders = [];
          }
        );
      });
    });

    combineLatest([
      this.shopifyService.cartItemsJustMove$,
      this.shopifyService.cartItemsPejaAmari$,
      this.shopifyService.cartItemsTeamLashae$,
      this.shopifyService.cartItemsSayItLoud$,
    ]).subscribe((res:any) => {
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
      this.unfilteredStores.sort((a:any, b:any) => b.length - a.length);
      this.stores = this.unfilteredStores.filter((store:any) => store.length > 0);
    });
  }

  calculateCartTotal(cartItems: any[]) {
    return cartItems.reduce((sum, item) => {
      return sum + item.price.amount * item.quantity;
    }, 0);
  }

  orderClicked(order: any) {
   // this.router.navigate(["/tabs/shopify/order-details"], { state: order });
  }

  segmentChanged(event: any) {
    console.log("event", event.detail.value);
    this.selectedSegment = event.detail.value;
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
          console.log("Item deleted and cart updated successfully");
        })
        .catch((error) => {
          loadingEl.dismiss();
          console.error("Error updating cart:", error);
         });
    });
  }

  checkout(store: string) {
    this.loadingCtrl.create().then(async (loadingEl) => {
      loadingEl.present();
      try {
        this.shopifyService.updateStoreFrontClinet(store);
        let items: any[] = [];
        _.each(this.shopifyService.getCart(store), (item) => {
          items.push({
            quantity: item.quantity,
            merchandiseId: item.id,
          });
        });

        let email = this.authService.userDetails.email;
        await this.shopifyService.updateShopifyCustomer(email, store, this.customerService.customerSubscribed$.value) // temp call
        let data = await this.shopifyService.createCheckoutId(items, email);

        loadingEl.dismiss();
        if (data && !data.errors && data.cartCreate.cart.id) {
          const webUrl = data.cartCreate.cart.checkoutUrl;
          console.log("OPENINIG URL", webUrl);

          Browser.open({ url: webUrl });
        } else {
          console.log(data);
          if (data.errors) this.alertService.showFirebaseAlert(data.errors);
        }
      } catch (error) {
        loadingEl.dismiss();
        this.alertService.showFirebaseAlert(error);
      }
    });
  }

  accordionChange(event: any) {
    this.selectedStore = event.detail.value;
    console.log(this.selectedStore);
  }

  trackByStore(index: number, store: any): string {
    return store.store;
  }

}
