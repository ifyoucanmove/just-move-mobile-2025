import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { add, cartOutline, heartOutline, remove } from 'ionicons/icons';
import { SharedModule } from '../shared/shared/shared-module';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../services/recipe';
import { Shopify, SHOPIFY_SORT_KEY, ShopifyStores } from '../services/shopify';
import { LoadingController } from '@ionic/angular';
import { Alert } from '../services/alert';
import { Customer } from '../services/customer';
import { AuthService } from '../services/auth';
import { Location } from '@angular/common';

addIcons({
  heartOutline,
  remove,
  add,
  cartOutline
});

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class ProductDetailPage implements OnInit {

  recipe: any;
  id: string = '';
  shopifyInventory: any = [];

  quantity: any = {};
  selectedStore = 'justMove';
  selectedVariant: any;
  variantInCart : any = null;
  stores: string[] = ['justMove', 'pejaAmari', 'teamLashae', 'sayItLoud'];

  checkGetCartButton = false;
  constructor(private route: ActivatedRoute,
     private recipeService: RecipeService,
     private shopifyService: Shopify,
     private loadingCtrl : LoadingController,
     private alsertService : Alert,
     public customerService : Customer,
     private authService: AuthService,
     private location: Location,
     private router: Router) { }

  ngOnInit() {
    console.log(this.authService.userDetails.email,'userDetails');
    this.shopifyService.loadCartItems(this.authService.userDetails.email);
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.recipeService.getRecipeById(this.id).subscribe((res:any) => {
        this.recipe = res;
        console.log(this.recipe);
        if(this.recipe.shopify_inventory?.length > 0) {
          this.getVariants();
         
        }
      });
    },(err:any) => {
      console.log(err);
    });
  }



 async getVariants() {
    let shopifyInventory = await this.recipeService.getAllProducts(this.recipe.shopify_inventory);
    console.log(shopifyInventory,'shopifyInventory grapg');
    this.shopifyInventory = shopifyInventory;
    setTimeout(() => {
      this.checkProductInCart();
    }, 1000);

   /*  this.recipeService.getShopifyInventory(this.recipe.shopify_inventory).subscribe((res:any) => {
      this.shopifyInventory = res;
    console.log(this.shopifyInventory,'shopifyInventory');
      setTimeout(() => {
        this.checkProductInCart();
      }, 3000);
    },(err:any) => {
      console.log(err);
    }); */
  }

  goBack() {
    this.location.back();
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
   /*  this.stores.forEach((store: string) => { */
      const cartItem$ = this.getCartItem$(this.selectedStore);
      if (cartItem$) {
        cartItem$.subscribe((res: any) => {
          console.log(res,'res');
          if(res !== null && res.length > 0){

            for(const item of this.shopifyInventory){
              for(const variant of item.variants){
                const foundVariant = res.find((item:any) => item.id === variant.id);
                if(foundVariant){
                  //update quantity with foundVariant.quantity
                  this.quantity[variant.id] = foundVariant.quantity;
                  this.checkGetCartButton = true;
                 }
                else{
                  this.quantity[variant.id] = 0;
                }
              }
            }

            console.log(this.quantity,'quantity');
          }
        });
      }
  /*   }); */
  }



  addToCart(variantObject: any) {
   this.loadingCtrl.create().then(loadingEl=>{
    loadingEl.present();
    const cartItems = this.shopifyService.getCart(this.selectedStore);
    const existingItem = cartItems.find((item) => item.id === variantObject.id);
    console.log(existingItem,'existingItem',cartItems);

    if(existingItem){
      existingItem.quantity = this.quantity[variantObject.id];
    }
    else{
      for(const item of this.shopifyInventory){
        console.log(item,'item',variantObject.id);
        const variant = item.variants.find((vare:any) => vare.id === variantObject.id);
        console.log(variant,'variant');
        if(variant){
          cartItems.push({ 
            ...variant, 
            quantity: this.quantity[variant.id], 
            parentProductId:item.id, 
            parentProductTitle : item.title, 
            parentProductVariants : item.variants });
          break;
        }
      }
    }
    console.log(cartItems,'cartItems');
    this.shopifyService.setCart(this.selectedStore, cartItems);
    this.shopifyService.addToCartsFb(cartItems, this.selectedStore).then(() => {
      console.log('Cart updated successfully');
      loadingEl.dismiss();
     }).catch(error => {
      console.error('Error updating cart:', error);
      this.alsertService.showFirebaseAlert(error);
    });
   })
  }


  increaseQuantityInCart(variant: any){
    console.log('came here to increaseQuantityInCart =========>',this.selectedStore);

      const cartItems = this.shopifyService.getCart(this.selectedStore);   
      console.log(cartItems,'cartItems');   
      const item = cartItems.find((item) => item.id === variant.id);
      console.log(item,'item');
      //map quantity with variant.id
      this.quantity[variant.id] = this.quantity[variant.id] ? this.quantity[variant.id] + 1 : 1;
      console.log(this.quantity,'quantity');
      
      this.addToCart(variant);
      
  }


  decreaseQuantityInCart(variant: any){

    const cartItems = this.shopifyService.getCart(this.selectedStore);
    const item = cartItems.find((item) => item.id === variant.id);
    console.log(item,'item',cartItems);
     //map quantity with variant.id
     this.quantity[variant.id] = this.quantity[variant.id] ? this.quantity[variant.id] - 1 : 0;
     console.log(this.quantity,'quantity');
     if(this.quantity[variant.id] > 0){
      this.addToCart(variant);
     }
     else{
      this.deleteItem(variant.id, this.selectedStore);
     }
     
      
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

  cartClicked(){
    this.router.navigate(['/my-cart/'], {queryParams : {store : this.selectedStore}});
  }

}
