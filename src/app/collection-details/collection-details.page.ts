import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from '../shared/shared/shared-module';
import { MainHeaderComponent } from '../shared/main-header/main-header.component';
import { Shopify, SHOPIFY_SORT_KEY } from '../services/shopify';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../services/customer';
import { Alert } from '../services/alert';
import { ActionSheetController } from '@ionic/angular/standalone';
import { LoadingController } from '@ionic/angular/standalone';
import { InfiniteScrollCustomEvent } from '@ionic/angular/standalone';
import { CardFooterComponent } from '../card-footer/card-footer.component';
import { IonInfiniteScroll } from '@ionic/angular/standalone';
import { IonInfiniteScrollContent } from '@ionic/angular/standalone';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.page.html',
  styleUrls: ['./collection-details.page.scss'],
  standalone: true,
  imports: [SharedModule, MainHeaderComponent, CardFooterComponent, IonInfiniteScroll, IonInfiniteScrollContent]
})
export class CollectionDetailsPage implements OnInit {

  isLoading: boolean = true;
  products: any[] = [];
  productsUnfiltered: any[] = [];
  store: string = "";
  selectedSort = 'bestSelling';
  searchName: string = '';
  collectionId : string = ''
  collectionName : string = '';

  constructor(
    private shopifyService: Shopify,
    private router: Router,
    private route: ActivatedRoute,
    private actionSheetCtrl : ActionSheetController,
    private loadingCtrl : LoadingController,
    private alertService : Alert,
    public customerService : Customer
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(async (param) => {
      this.isLoading = true;
      this.products = [];
      this.store = this.shopifyService.selectedStore;
      this.shopifyService.updateStoreFrontClinet(this.store);
      this.collectionId = param['id'] || '';
      this.collectionName = param['name'] || '';
    
      let products = await this.shopifyService.getCollection(this.collectionId);
      console.log("Collection products", products);
      this.products = products;
      this.isLoading = false;
    });
  }

  onIonInfinite(ev:any) {
    if (!this.shopifyService.collectionsPageInfo.hasNextPage) {
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
      .getCollection(this.collectionId, sortBy, sortOrder, "next", this.shopifyService.collectionsPageInfo.endCursor!)
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
  }


  productClicked(product: any) {
    if (product.availableForSale) this.shopifyService.stateData = product;
    this.router.navigate(["/shopify-details"], { state: product });
  }


  async sortProducts() {
    this.shopifyService.collectionsPageInfo = {};
    const actionSheet = await this.actionSheetCtrl.create({
      header: "Sort By",
      cssClass: "shopify-sort",
      buttons: [
        {
          text: "Best Selling",
          role: this.selectedSort == "bestSelling" ? "selected" : "",
          data: {
            action: "bestSelling",
          },
        },
        {
          text: "Name (A-Z)",
          role: this.selectedSort == "nameAsc" ? "selected" : "",
          data: {
            action: "nameAsc",
          },
        },
        {
          text: "Name (Z-A)",
          role: this.selectedSort == "nameDesc" ? "selected" : "",
          data: {
            action: "nameDesc",
          },
        },

        {
          text: "Price Low to High",
          role: this.selectedSort == "priceAsc" ? "selected" : "",
          data: {
            action: "priceAsc",
          },
        },
        {
          text: "Price High to Low",
          role: this.selectedSort == "priceDesc" ? "selected" : "",
          data: {
            action: "priceDesc",
          },
        },
        // {
        //   text: "Newest First",
        //   role: this.selectedSort == "dateDesc" ? "selected" : "",
        //   data: {
        //     action: "dateDesc",
        //   },
        // },

        {
          text: "Cancel",
          role: "cancel",
          data: {},
        },
      ],
    });
    actionSheet.onDidDismiss().then((data) => {
      console.log("Data", data);
      if (data.data && data.role != "cancel") {
        if (this.selectedSort != data.data) {
          this.selectedSort = data.data.action;
          this.loadSortedProducts();
        }
      }
    });

    await actionSheet.present();
  }

  async loadSortedProducts(){
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
      this.products = await this.shopifyService.getCollection(this.collectionId, sortBy, sortOrder);
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


  addToCart(product : any, event : Event) {
    event.stopPropagation();
    this.loadingCtrl.create().then(loadingEl=>{
     loadingEl.present();
     const cartItems = this.shopifyService.getCart(this.store);
     const existingItem = cartItems.find((item) => item.id === product.variants[0].id);
   
     if (existingItem) {
       existingItem.quantity += 1;
     } else {
       cartItems.push({ ...product.variants[0], quantity: 1, parentProductId: product.id, parentProductTitle : product.title, parentProductVariants : product.variants });
     }
   
     this.shopifyService.setCart(this.store, cartItems);
     this.shopifyService.addToCartsFb(cartItems, this.store).then(() => {
       loadingEl.dismiss();
      }).catch(error => {
       console.error('Error updating cart:', error);
       this.alertService.showFirebaseAlert(error);
     });
    })
   }

}

