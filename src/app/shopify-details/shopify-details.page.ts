import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared/shared-module';
import { MainHeaderComponent } from '../shared/main-header/main-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Shopify, ShopifyStores } from '../services/shopify';
import { Customer } from '../services/customer';
import { Alert } from '../services/alert';
import { LoadingController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { remove, add, cart } from 'ionicons/icons';
import { ShopifyStorePipe } from '../pipes/shopify-store.pipe';
import { IonSelect } from '@ionic/angular/standalone';
import { IonSelectOption } from '@ionic/angular/standalone';
import { Logging } from '../services/logging';

@Component({
  selector: 'app-shopify-details',
  templateUrl: './shopify-details.page.html',
  styleUrls: ['./shopify-details.page.scss'],
  standalone: true,
  imports: [SharedModule,MainHeaderComponent, ShopifyStorePipe, IonSelect, IonSelectOption]
})
export class ShopifyDetailsPage implements OnInit {

  product: any = null;
  quantity = 0;
  selectedStore = 'justMove';
  selectedVariant: any;
  variantInCart : any = null;
  stores: string[] = ['justMove', 'pejaAmari', 'teamLashae', 'sayItLoud'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private shopifyService: Shopify,
    private loadingCtrl : LoadingController,
    private alsertService : Alert,
    public customerService : Customer,
    public logService: Logging
  ) {
    addIcons({remove, add, cart})
  }

  ngOnInit() {
    this.route.queryParams.subscribe((param) => {
      this.selectedStore = this.shopifyService.selectedStore;
      this.quantity = 0;
      let state = this.router.getCurrentNavigation()?.extras?.state || this.shopifyService.stateData || null;
      console.log("STate", state);
      if(!state) this.router.navigate(['/my-store'])
      this.product = state;
    console.log(this.product);
      this.selectedVariant = this.product?.variants[0];
      console.log(this.selectedVariant)
      this.checkProductInCart();

  
    });
    this.logService.logActivity({
      activity: 'Shopify details page loaded.',
      page: 'shopify-details',
      payload: {
        store: this.selectedStore,
        module: "shopify",
        productId: this.product?.id || '',
        productTitle: this.product?.title || '',
        variantId: this.selectedVariant?.id || '',
      }
    });
  }


  onVariantChange(event: any) {
    console.log("event", event);
    
    const variantId = event.target.value;
    const selected = this.product.variants.find((variant: any) => variant.id == variantId);
    console.log("selected", selected);
    if (selected) {
      this.selectedVariant = selected;
      this.checkProductInCart();
      console.log(this.selectedVariant)
    }
  }


  getCartItem$( store : string){
    let cartItems$;
    switch (store) {
      case ShopifyStores.justMove:
        cartItems$ = this.shopifyService.cartItemsJustMove$;
        break;
      case ShopifyStores.pejaAmari:
        cartItems$ = this.shopifyService.cartItemsPejaAmari$;
        break;
      case ShopifyStores.teamLashae:
        cartItems$ = this.shopifyService.cartItemsTeamLashae$;
        break;
      case ShopifyStores.sayItLoud:
        cartItems$ = this.shopifyService.cartItemsSayItLoud$;
        break;
      default:
        console.error('Invalid store:', store);
        return;
    }
    return cartItems$;
  }



  checkProductInCart() {
    this.stores.forEach((store: string) => {
      const cartItem$ = this.getCartItem$(store);
      if (cartItem$) {
        cartItem$.subscribe((res: any) => {
          console.log(res,'res');
          if(res !== null && res.length > 0){
            const foundProduct = res.find((item:any) => {
              // console.log(item.id === this.selectedVariant.id)
              return item.id === this.selectedVariant.id
            } );
              if (foundProduct) {
                this.variantInCart = foundProduct;        
                // console.log("Variant in cart : ",this.variantInCart)
              }else{
                this.variantInCart = null;
              }
          }
        });
      }
    });
  }



  addToCart() {
   this.loadingCtrl.create().then(loadingEl=>{
    loadingEl.present();
    const cartItems = this.shopifyService.getCart(this.selectedStore);
    const existingItem = cartItems.find((item) => item.id === this.selectedVariant.id);
  
    if (existingItem) {
      existingItem.quantity += this.quantity;
    } else {
      cartItems.push({ ...this.selectedVariant, quantity: this.quantity, parentProductId:this.product.id, parentProductTitle : this.product.title, parentProductVariants : this.product.variants });
    }
  
    this.shopifyService.setCart(this.selectedStore, cartItems);
    this.shopifyService.addToCartsFb(cartItems, this.selectedStore).then(() => {
      console.log('Cart updated successfully');
      this.logService.logActivity(
        {
          activity: 'Add to cart button clicked.',
          page: 'shopify-details',
          payload: {
            productId: this.product.id,
            productTitle: this.product.title,
            variantId: this.selectedVariant.id,
            store: this.selectedStore,
            module: "shopify",
          }
        }
      );
      loadingEl.dismiss();
     }).catch(error => {
      console.error('Error updating cart:', error);
      this.logService.logError(
        {
          error: error,
          activity: 'Add to cart button clicked.',
          page: 'shopify-details',
          payload: {
            store: this.selectedStore,
            module: "shopify",
            productId: this.product.id,
            productTitle: this.product.title,
            variantId: this.selectedVariant.id,
          },
        }
      );
      this.alsertService.showFirebaseAlert(error);
    });
   })
  }
  increaseQuantity() {
    console.log('came here to increaseQuantity');
    
    this.quantity++;
  }
  
  decreaseQuantity() {
    if (this.quantity > 0) {
      this.quantity--;
    }
  }

  increaseQuantityInCart(){
    console.log('came here to increaseQuantityInCart =========>');
    
      const cartItems = this.shopifyService.getCart(this.selectedStore);      
      const item = cartItems.find((item) => item.id === this.selectedVariant.id);
      console.log(item);
      
      if (item) {
        item.quantity++;
        this.shopifyService.setCart(this.selectedStore, cartItems);
        this.shopifyService
        .addToCartsFb(cartItems, this.selectedStore)
        .then(() => {
          console.log('Cart updated successfully');
          this.logService.logActivity(
            {
              activity: 'Increase quantity in cart button clicked.',
              page: 'shopify-details',
              payload: {
                productId: item.parentProductId,
                productTitle: item.parentProductTitle,
                variantId: this.selectedVariant.id,
                store: this.selectedStore,
                module: "shopify"
              }
            }
          );
        })
        .catch((error) => {
          console.error('Error updating cart:', error);
          this.logService.logError(
            {
              error: error,
              activity: 'Increase quantity in cart button clicked.',
              page: 'shopify-details',
              payload: {
                productId: item.parentProductId,
                productTitle: item.parentProductTitle,
                variantId: this.selectedVariant.id,
                store: this.selectedStore,
                module: "shopify"
              }
            }
          );
        });
      }
  }


  decreaseQuantityInCart(){

    const cartItems = this.shopifyService.getCart(this.selectedStore);
    const item = cartItems.find((item) => item.id === this.selectedVariant.id);
    if (item.quantity > 0) {
      item.quantity--;

      if(item.quantity == 0){
        const updatedCartItems = cartItems.filter(
          (item) => item.id !== this.selectedVariant.id
        );
        console.log(updatedCartItems)

        this.shopifyService.setCart(this.selectedStore, updatedCartItems);
        this.shopifyService
          .addToCartsFb(updatedCartItems, this.selectedStore)
          .then(() => {
            this.quantity = 0;
            this.variantInCart = null;
            console.log('Item deleted and cart updated successfully');
            this.logService.logActivity(
              {
                activity: 'Decrease quantity in cart button clicked.',
                page: 'shopify-details',
                payload: {
                  productId: item.parentProductId,
                  productTitle: item.parentProductTitle,
                  variantId: this.selectedVariant.id,
                  store: this.selectedStore,
                  module: "shopify"
                }
              }
            );
          })
          .catch((error) => {
            console.error('Error updating cart:', error);
            this.logService.logError(
              {
                error: error,
                activity: 'Decrease quantity in cart button clicked.',
                page: 'shopify-details',
                payload: {
                  productId: item.parentProductId,
                  productTitle: item.parentProductTitle,
                  variantId: this.selectedVariant.id,
                  store: this.selectedStore,
                  module: "shopify"
                }
              }
            );
          });
      }else{
        this.shopifyService.setCart(this.selectedStore, cartItems);
        this.shopifyService
        .addToCartsFb(cartItems, this.selectedStore)
        .then(() => {
          console.log('Cart updated successfully');
          this.logService.logActivity(
            {
              activity: 'Decrease quantity in cart button clicked.',
              page: 'shopify-details',
              payload: {
                productId: item.parentProductId,
                productTitle: item.parentProductTitle,
                variantId: this.selectedVariant.id,
                store: this.selectedStore,
                module: "shopify"
              }
            }
          );
        })
        .catch((error) => {
          console.error('Error updating cart:', error);
          this.logService.logError(
            {
              error: error,
              activity: 'Decrease quantity in cart button clicked.',
              page: 'shopify-details',
              payload: {
                productId: item.parentProductId,
                productTitle: item.parentProductTitle,
                variantId: this.selectedVariant.id,
                store: this.selectedStore,
                module: "shopify"
              }
            }
          );
          });
        }
      }
  } 

  cartClicked(){
    this.router.navigate(['/my-cart/'], {queryParams : {store : this.selectedStore}});
  }
}

