import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared/shared-module';
import { MainHeaderComponent } from '../shared/main-header/main-header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../services/customer';
import { Shopify, SHOPIFY_SORT_KEY, ShopifyStores } from '../services/shopify';
import { ActionSheetController } from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { swapVertical } from 'ionicons/icons';
import { ArrayToCommaSeparatedPipe } from '../pipes/array-to-comma-separated.pipe';
import { CardFooterComponent } from '../card-footer/card-footer.component';
import { ToastService } from '../services/toast.service';
@Component({
  selector: 'app-my-store',
  templateUrl: './my-store.page.html',
  styleUrls: ['./my-store.page.scss'],
  standalone: true,
  imports: [SharedModule,
     MainHeaderComponent,ArrayToCommaSeparatedPipe,CardFooterComponent]
})

export class MyStorePage implements OnInit {
  isLoading: boolean = true;
  isCollectionsLoading: boolean = true;
  products: any[] = [];
  productsUnfiltered: any[] = [];
  store: string = "";
  selectedSort = "bestSelling";
  searchName: string = "";
  collections: any[] = [];
  showAll = false;
  @ViewChild("content", { static: false }) content!: IonContent;
  searchTerm = "";
  cartItems: any[] = [];

  constructor(
    private shopifyService: Shopify,
    private router: Router,
    private route: ActivatedRoute,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private cdr : ChangeDetectorRef,
    private toastService : ToastService,
    public customerService : Customer
  ) {
    addIcons({swapVertical})
  }

  ngOnInit() {
    this.route.queryParams.subscribe(async (param) => {
      this.isLoading = true;
      this.products = [];
      this.store = this.shopifyService.selectedStore;
      this.getCartItem$(this.store)?.subscribe((res:any) => {
        this.cartItems = res;
        console.log("Cart Items", this.cartItems);
        this.checkProductsInCart();
      });
      console.log("Store", this.shopifyService.selectedStore);

      this.shopifyService.updateStoreFrontClinet(this.store);
    //  this.logService.logActivity("store", `${this.store}-accessed`);

      if (this.store == "sayItLoud") {
        this.isLoading = false;
        return;
      }

      let collections = await this.shopifyService.getCollections();

      this.collections = collections.map((item:any) => item.node);
      console.log("Collections", this.collections);
      this.isCollectionsLoading = false;
      // this.getGraphqlQuery();
      console.log("ngoninit trigger");
      this.loadSortedProducts();

      // let vendor = this.getVendor(this.store);

      // this.shopifyService.getinventory(vendor).subscribe((res) => {
      //   this.isLoading = false;
      //   this.products = res;
      //   console.log(res);
      // },(err=>{
      //   this.isLoading = false;
      //   this.products = [];
      // }));
    });
  }

  async getGraphqlQuery(type?: "next" | "previous" | "", id?: string) {
    // this.shopifyService.getGraphqlQuery(type, id).then(res=>{
    //   console.log("Products", res);

    //   this.products = res;
    //   this.isLoading = false;
    // }).catch(err=>{
    //   this.isLoading = false;
    //   this.products = [];
    // })
    // this.isLoading = true;
    // try {
    //   this.products = await this.shopifyService.getAllProducts();
    //   console.log(this.products);
    // } catch (error) {
    //   console.error("Error fetching products:", error);
    //   this.products = [];
    // } finally {
    //   this.isLoading = false;
    // }
  }

  getVendor(store: string) {
    if (store == "justMove") return "Just Move";
    if (store == "pejaAmari") return "Peja Amari";
    if (store == "teamLashae") return "Team Lashea";
    if (store == "sayItLoud") return "Say It Loud";
    return "Just Move";
  }

  productClicked(product: any) {
    if (product.availableForSale) this.shopifyService.stateData = product;
    this.router.navigate(["/shopify-details"], { state: product });
  }

  // Not used as of now so commenting, update after function is added with paginations
  // onIonInfinite(ev) {
  //   this.shopifyService.getGraphqlQuery('next', this.shopifyService.pageInfo.endCursor!).then((res : any)=>{
  //     (ev as InfiniteScrollCustomEvent).target.complete();
  //     console.log("RES", res);

  //    if(res && res.length){
  //     this.products.push(...res);
  //    }
  //   }).catch(err=>{
  //     (ev as InfiniteScrollCustomEvent).target.complete();
  //   })
  // }

 /*  onIonInfinite(ev:any) {
    if (!this.shopifyService.pageInfo.hasNextPage) {
      (ev as InfiniteScrollCustomEvent).target.complete();
      return;
    }
    let sortOrder: "ASC" | "DESC" = "DESC";
    let sortBy: SHOPIFY_SORT_KEY = SHOPIFY_SORT_KEY.BEST_SELLING;

    switch (this.selectedSort) {
      case "bestSelling":
        sortBy = SHOPIFY_SORT_KEY.BEST_SELLING;
        sortOrder = "DESC";
        break;
      case "nameAsc":
        sortBy = SHOPIFY_SORT_KEY.TITLE;
        sortOrder = "ASC";
        break;
      case "nameDesc":
        sortBy = SHOPIFY_SORT_KEY.TITLE;
        sortOrder = "DESC";
        break;
      case "priceAsc":
        sortBy = SHOPIFY_SORT_KEY.PRICE;
        sortOrder = "ASC";
        break;
      case "priceDesc":
        sortBy = SHOPIFY_SORT_KEY.PRICE;
        sortOrder = "DESC";
        break;
      case "dateDesc":
        sortBy = SHOPIFY_SORT_KEY.CREATED_AT;
        sortOrder = "DESC";
        break;
    }
    this.shopifyService
      .getAllProducts(
        sortBy,
        sortOrder,
        this.searchTerm || "",
        "next",
        this.shopifyService.pageInfo.endCursor!
      )
      .then((res: any) => {
        (ev as InfiniteScrollCustomEvent).target.complete();
        console.log("RES", res);

        if (res && res.length) {
          this.products.push(...res);
        }
      })
      .catch((err) => {
        (ev as InfiniteScrollCustomEvent).target.complete();
      });
  } */

  async sortProducts(){
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Sort By',
      cssClass : 'shopify-sort',
      buttons: [
        {
          text: 'Best Selling',
          role : this.selectedSort == 'bestSelling' ? 'selected': '',
          data: {
            action: 'bestSelling',
          },
        },
        {
          text: 'Name (A-Z)',
          role : this.selectedSort == 'nameAsc' ? 'selected': '',
          data: {
            action: 'nameAsc',
          },
        },
        {
          text: 'Name (Z-A)',
          role : this.selectedSort == 'nameDesc' ? 'selected': '',
          data: {
            action: 'nameDesc',
          },
        },

        {
          text: 'Price Low to High',
          role : this.selectedSort == 'priceAsc' ? 'selected': '',
          data: {
            action: 'priceAsc',
          },
        },
        {
          text: 'Price High to Low',
          role : this.selectedSort == 'priceDesc' ? 'selected': '',
          data: {
            action: 'priceDesc',
          },
        },
        {
          text: 'Newest First',
          role : this.selectedSort == 'dateDesc' ? 'selected': '',
          data: {
            action: 'dateDesc',
          },
        },
       
        
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
          },
        },
      ],
    });
    actionSheet.onDidDismiss().then(data=>{
      console.log("Data", data);
      if(data.data && data.role != 'cancel'){
        if(this.selectedSort != data.data){
          this.selectedSort = data.data.action;
          this.loadSortedProducts();
        }
      }
      
    })

    await actionSheet.present();
  }


  async loadSortedProducts() {
    this.shopifyService.pageInfo = {};
    let sortOrder: "ASC" | "DESC" = "DESC";
    let sortBy: SHOPIFY_SORT_KEY = SHOPIFY_SORT_KEY.BEST_SELLING;

    switch (this.selectedSort) {
      case "bestSelling":
        sortBy = SHOPIFY_SORT_KEY.BEST_SELLING;
        sortOrder = "DESC";
        break;
      case "nameAsc":
        sortBy = SHOPIFY_SORT_KEY.TITLE;
        sortOrder = "ASC";
        break;
      case "nameDesc":
        sortBy = SHOPIFY_SORT_KEY.TITLE;
        sortOrder = "DESC";
        break;
      case "priceAsc":
        sortBy = SHOPIFY_SORT_KEY.PRICE;
        sortOrder = "ASC";
        break;
      case "priceDesc":
        sortBy = SHOPIFY_SORT_KEY.PRICE;
        sortOrder = "DESC";
        break;
      case "dateDesc":
        sortBy = SHOPIFY_SORT_KEY.CREATED_AT;
        sortOrder = "DESC";
        break;
    }
    console.log(this.selectedSort, sortBy, sortOrder);

    this.isLoading = true;
    try {
      this.products = await this.shopifyService.getAllProducts(
        sortBy,
        sortOrder,
        this.searchTerm || ""
      );
      this.checkProductsInCart();
      this.productsUnfiltered = this.products;
      // if (this.searchName) this.search();
      console.log(this.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      this.products = [];
      this.productsUnfiltered = [];
    } finally {
      this.isLoading = false;
    }
  }

  search() {
    this.searchTerm = JSON.parse(JSON.stringify(this.searchName));
    console.log("search trigger");

    this.loadSortedProducts();
    // this.products = this.productsUnfiltered;

    // if (this.searchName && this.searchName.trim() !== "") {
    //   let searchResult = this.productsUnfiltered.filter((product: any) => {
    //     return product.title?.toLowerCase().includes(this.searchName.toLowerCase());
    //   });

    //   this.products = searchResult;
    // } else {
    //   this.products = this.productsUnfiltered;
    // }
  }

  resetSearch() {
    if (this.searchTerm && !this.searchName) {
      this.searchTerm = "";
      this.loadSortedProducts();
    }
  }

  viewToggled() {
    this.showAll = !this.showAll;
    if (!this.showAll) this.content.scrollToTop(100);
  }

  collectionClicked(id: string, name: string) {
    this.router.navigate([`/collection-details`], { queryParams: { name, id } });
  }

  async addToCart(product: any, event: Event) {
    event.stopPropagation();
    let variant = null;
    if (product.variants.length > 1) {
      variant =  await this.getVarient(product.variants);
      if(!variant) return;
      if(variant?.availableForSale) {
        variant = variant;
      } 
      else {
        this.toastService.presentToast("This product is out of stock");
        return;
      }
    } else {
      variant = product.variants[0];
    }

    if(!variant) return;


    this.loadingCtrl.create().then((loadingEl) => {
      loadingEl.present();
      const cartItems = this.shopifyService.getCart(this.store);
      const existingItem = cartItems.find((item) => item.id === variant.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cartItems.push({
          ...variant,
          quantity: 1,
          parentProductId: product.id,
          parentProductTitle: product.title,
          parentProductVariants: product.variants,
        });
      }

      this.shopifyService.setCart(this.store, cartItems);
      this.shopifyService
        .addToCartsFb(cartItems, this.store)
        .then(() => {
          console.log("Cart updated successfully");
          loadingEl.dismiss();
         
       //  this.router.navigate(['/my-cart/'], {queryParams : {store : this.store}});
        })
        .catch((error) => {
          console.error("Error updating cart:", error);
       //   this.alertService.showFirebaseAlert(error);
        });
    });
  }

  async getVarient(variants:any): Promise<any> {
    return new Promise(async (resolve) => {
        let buttons = variants.map((varient:any) => ({
            text: varient.title,
            data: {
                id: varient,
            },
            handler: () => {
                resolve(varient); 
            },
        }));
        buttons.push({
            text: "Cancel",
            role: "cancel",
            handler: () => {
                resolve(null);
            },
        });

        const actionSheet = await this.actionSheetCtrl.create({
            header: "Select Varient",
            cssClass: "shopify-sort",
            buttons: buttons,
        });
        await actionSheet.present();
    });
}

  getCartItem$(store: string) {
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
        console.error("Invalid store:", store);
        return;
    }
    return cartItems$;
  }

  checkProductsInCart() {
    this.cdr.detectChanges();
    // let isAdded : boolean = false;
    if (this.cartItems.length && this.products.length) {
      this.cartItems.forEach((cartItem) => {
        let productIndex = this.products.findIndex(
          (product) => product.id == cartItem.parentProductId
        );
        if (productIndex > -1) {
          let currentProduct = this.products[productIndex];
          currentProduct.isAddedInCart = false;
          currentProduct.isAddedInCart = true;
          if (currentProduct.variants && currentProduct.variants.length > 1) {
            let variants = currentProduct.addedVariants || [];
            let currentVariant = currentProduct.variants.find(
              (varient:any) => varient.id == cartItem.id
            ).title;
            if (!variants.includes(currentVariant)) {
              variants.push(currentVariant);
              // isAdded = true;
              
            }

            currentProduct.addedVariants = variants;
            // if(isAdded) this.products = JSON.parse(JSON.stringify(this.products));
          }
        }
      });
    }
    console.log("Products", this.products);
    // this.products = JSON.parse(JSON.stringify(this.products));
    // this.cdr.detach();
    this.cdr.detectChanges();
  }

  getVariant(product:any){
    
    return product.addedVariants || []
  }

}
