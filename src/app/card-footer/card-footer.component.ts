import { Component, OnInit } from '@angular/core';
import { Customer } from '../services/customer';
import { AuthService } from '../services/auth';
import { Shopify, ShopifyStores } from '../services/shopify';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { addIcons } from 'ionicons';
import { cart } from 'ionicons/icons';
import { SharedModule } from '../shared/shared/shared-module';

@Component({
  selector: 'app-card-footer',
  templateUrl: './card-footer.component.html',
  styleUrls: ['./card-footer.component.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class CardFooterComponent  implements OnInit {
  noOfItems : number = 0;
  total : number = 0;
  selectedStore : string = '';
  constructor(private shopifyService : Shopify,
     private router : Router, private authService : AuthService,
      private afAuth : Auth, public customerService : Customer) {
    addIcons({cart})
   }

  ngOnInit() {
    this.selectedStore= this.shopifyService.selectedStore;
    this.afAuth.onAuthStateChanged(user=>{
      this.getCartItem$(this.selectedStore)?.subscribe(res=>{
        console.log("Cart Items", res);
        if(res.length){
          this.total = res.reduce((sum, item) => {
            return sum + item.price.amount * item.quantity;
          }, 0);
          this.noOfItems = res.length;
        }else{
          this.noOfItems = 0;
          this.total = 0;
        }
      })
    })
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



  cartClicked(){
    this.selectedStore = 'justMove';
    console.log("Selected Store", this.selectedStore);
    this.router.navigate(['/my-cart/'], {queryParams : {store : 'justMove'}});
  }

}

