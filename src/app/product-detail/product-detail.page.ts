import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { addIcons } from 'ionicons';
import { add, cartOutline, heartOutline, remove, closeOutline, arrowBackOutline, arrowForwardOutline, chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { SharedModule } from '../shared/shared/shared-module';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../services/recipe';
import { Shopify, SHOPIFY_SORT_KEY, ShopifyStores } from '../services/shopify';
import { GestureController, LoadingController } from '@ionic/angular';
import { Alert } from '../services/alert';
import { Customer } from '../services/customer';
import { AuthService } from '../services/auth';
import { Location } from '@angular/common';
import { Common } from '../services/common';
import { IonSpinner } from '@ionic/angular/standalone';
import { Gesture } from '@ionic/angular';
import { Favorites } from '../services/favorites';

addIcons({
  heartOutline,
  remove,
  add,
  cartOutline,
  closeOutline,
  arrowBackOutline,
  arrowForwardOutline,
  chevronBackOutline,
  chevronForwardOutline
});

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [SharedModule,IonSpinner]
})
export class ProductDetailPage implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('wrapperContent', { read: ElementRef }) wrapperContent!: ElementRef;
  @ViewChild('tutorialOverlay', { read: ElementRef }) tutorialOverlay!: ElementRef;

  recipe: any;
  id: string = '';
  shopifyInventory: any = [];

  quantity: any = {};
  selectedStore = 'justMove';
  selectedVariant: any;
  stores: string[] = ['justMove', 'pejaAmari', 'teamLashae', 'sayItLoud'];

  checkGetCartButton = false;
  isLoading = false;
  private swipeGesture?: Gesture;
  private tutorialSwipeGesture?: Gesture;
  redirect: string | null = null;
  showTutorial = false;
  currentTutorialStep = 0;
  private readonly TUTORIAL_STORAGE_KEY = 'product_detail_tutorial_shown';
  
  tutorialSteps = [
    {
      icon: 'arrow-back-outline',
      title: 'Swipe Left',
      description: 'Swipe left to go to the previous recipe',
      position: 'left'
    },
    {
      icon: 'arrow-forward-outline',
      title: 'Swipe Right',
      description: 'Swipe right to go to the next recipe',
      position: 'right'
    }
  ];
  favorites: any[] = [];
  constructor(private route: ActivatedRoute,
     private recipeService: RecipeService,
     private shopifyService: Shopify,
     private loadingCtrl : LoadingController,
     private alsertService : Alert,
     public customerService : Customer,
     private authService: AuthService,
     private commonService: Common,
     private location: Location,
     public favoritesService: Favorites,
     private router: Router,
     private gestureCtrl: GestureController) { }

  ngOnInit() {
    this.getFavorites();
    this.shopifyService.loadCartItems(this.authService.userDetails.email);
    this.checkTutorialStatus();
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      console.log(this.id,'id');
      this.recipeService.getRecipeById(this.id).subscribe((res:any) => {
        this.recipe = res;
      if(this.recipe.shopify_inventory?.length > 0) {
          this.getVariants();
         
        }
      });
    },(err:any) => {
      console.log(err);
    });
    this.route.queryParams.subscribe((params) => {
      this.redirect = params['redirect'];
    });
  }

  checkTutorialStatus() {
    const tutorialShown = localStorage.getItem(this.TUTORIAL_STORAGE_KEY);
   // this.showTutorial = true;
   //    this.setupTutorialSwipeGesture();
    if (!tutorialShown) {
      // Show tutorial after a short delay to ensure page is loaded
      setTimeout(() => {
        this.showTutorial = true;
        // Setup tutorial swipe gesture after tutorial is shown
        setTimeout(() => {
          this.setupTutorialSwipeGesture();
        }, 100);
      }, 500);
    }
  }

  closeTutorial() {
    console.log('closeTutorial');
    this.showTutorial = false;
    localStorage.setItem(this.TUTORIAL_STORAGE_KEY, 'true');
    this.currentTutorialStep = 0;
    // Clean up tutorial gesture
    if (this.tutorialSwipeGesture) {
      this.tutorialSwipeGesture.destroy();
      this.tutorialSwipeGesture = undefined;
    }
  }

  setupTutorialSwipeGesture() {
    if (!this.tutorialOverlay?.nativeElement) {
      // Retry if element is not available yet
      setTimeout(() => {
        this.setupTutorialSwipeGesture();
      }, 100);
      return;
    }

    // Destroy existing gesture if any
    if (this.tutorialSwipeGesture) {
      this.tutorialSwipeGesture.destroy();
    }

    const element = this.tutorialOverlay.nativeElement;
    this.tutorialSwipeGesture = this.gestureCtrl.create({
      el: element,
      gestureName: 'tutorial-swipe',
      threshold: 15,
      onEnd: (ev) => {
        const deltaX = ev.deltaX;
        const threshold = 100; 
        console.log(deltaX,'deltaX');
        setTimeout(() => {
        this.closeTutorial();
        }, 1000);
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            // Swipe right - go to previous recipe
         //   this.navigateToRecipe('previous');
          } else {
            // Swipe left - go to next recipe
          //  this.navigateToRecipe('next');
          }
        }
      }
    });

    this.tutorialSwipeGesture.enable();
  }

  nextTutorialStep() {
    if (this.currentTutorialStep < this.tutorialSteps.length - 1) {
      this.currentTutorialStep++;
    } else {
      this.closeTutorial();
    }
  }

  previousTutorialStep() {
    if (this.currentTutorialStep > 0) {
      this.currentTutorialStep--;
    }
  }

  skipTutorial() {
    this.closeTutorial();
  }

  ngAfterViewInit() {
    // Wait for the view to be fully rendered, especially since wrapperContent is inside @if
    setTimeout(() => {
      this.setupSwipeGesture();
    }, 100);
  }

  ngOnDestroy() {
    if (this.swipeGesture) {
      this.swipeGesture.destroy();
    }
    if (this.tutorialSwipeGesture) {
      this.tutorialSwipeGesture.destroy();
    }
  }

  setupSwipeGesture() {
    if (!this.wrapperContent?.nativeElement) {
      // Retry if element is not available yet
      setTimeout(() => {
        this.setupSwipeGesture();
      }, 100);
      return;
    }

    // Destroy existing gesture if any
    if (this.swipeGesture) {
      this.swipeGesture.destroy();
    }

    const element = this.wrapperContent.nativeElement;
    this.swipeGesture = this.gestureCtrl.create({
      el: element,
      gestureName: 'swipe',
      threshold: 15,
      onMove: (ev) => {
        // Optional: Add visual feedback during swipe
      },
      onEnd: (ev) => {
        const deltaX = ev.deltaX;
        const threshold = 100; // Minimum swipe distance

        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            // Swipe right - go to previous recipe
            this.navigateToRecipe('previous');
          } else {
            // Swipe left - go to next recipe
            this.navigateToRecipe('next');
          }
        }
      }
    });

    this.swipeGesture.enable();
  }



 async getVariants() {
   this.checkGetCartButton = false;
    let shopifyInventory = await this.recipeService.getAllProducts(this.recipe.shopify_inventory);
    this.shopifyInventory = shopifyInventory;
    console.log(this.shopifyInventory,'shopifyInventory');
    for(const item of this.shopifyInventory){
      for(const variant of item.variants){
         this.quantity[variant.id] = 1;
        
      }
    }
  }

  goBack() {
   /*  this.location.back(); */
   if(this.redirect === 'home-tab'){
    this.router.navigate(['/products/home-tab']);
   }
   else{
    this.router.navigate(['/products/recipe-tab']);
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
                //  this.quantity[variant.id] = foundVariant.quantity;
                  this.checkGetCartButton = true;
                 }
              
              }
            }

            console.log(this.quantity,'quantity');
          }
         /*  else{
            for(const item of this.shopifyInventory){
              for(const variant of item.variants){
                 this.quantity[variant.id] = 1;
                
              }
            }
          } */
        });
      }
  /*   }); */
  }



  addToCart(variantObject: any) {
   this.isLoading = true;
  /*  this.loadingCtrl.create().then(loadingEl=>{
    loadingEl.present(); */
    const cartItems = this.shopifyService.getCart(this.selectedStore);
    const existingItem = cartItems.find((item) => item.id === variantObject.id);
    console.log(existingItem,'existingItem',cartItems);

    if(existingItem){
      existingItem.quantity = existingItem.quantity + this.quantity[variantObject.id];
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
      this.checkGetCartButton = true;
      //show toast 
      this.commonService.showSuccessToast('Item added to cart successfully',3000);
      this.isLoading = false;
     /*  loadingEl.dismiss(); */
     }).catch(error => {
      console.error('Error updating cart:', error);
      this.alsertService.showFirebaseAlert(error);
      this.isLoading = false;
    });
 /*   }) */
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
      
    //  this.addToCart(variant);
      
  }


  decreaseQuantityInCart(variant: any){

    const cartItems = this.shopifyService.getCart(this.selectedStore);
    const item = cartItems.find((item) => item.id === variant.id);
    console.log(item,'item',cartItems);
     //map quantity with variant.id
     this.quantity[variant.id] = this.quantity[variant.id] ? this.quantity[variant.id] - 1 : 0;
     console.log(this.quantity,'quantity');
  /*    if(this.quantity[variant.id] > 0){
     this.addToCart(variant);
     }
     else{
      this.deleteItem(variant.id, this.selectedStore);
     } */
     
      
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

  async navigateToRecipe(direction: 'next' | 'previous') {
    const swiperRecipes = this.recipeService.swiperRecipes;
    if (!swiperRecipes || swiperRecipes.length === 0) {
      return;
    }

    // Find current recipe index in swiperRecipes array
    const currentIndex = swiperRecipes.findIndex((r: any) => r.id === this.id);
    
    if (currentIndex === -1) {
      // Current recipe not in swiperRecipes, navigate to first recipe
      if (swiperRecipes.length > 0) {
        this.router.navigate(['/product-detail', swiperRecipes[0].id]);
      }
      return;
    }

    // Check boundaries and show toast if trying to swipe beyond limits
    if (direction === 'next') {
      // Swiping left to go to next recipe
      if (currentIndex >= swiperRecipes.length - 1) {
        // Already at the last recipe
        await this.commonService.showErrorToast('You have reached the last recipe', 2000);
        return;
      }
    } else {
      // Swiping right to go to previous recipe
      if (currentIndex <= 0) {
        // Already at the first recipe
        await this.commonService.showErrorToast('You have reached the first recipe', 2000);
        return;
      }
    }

    // Calculate next index
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    const nextRecipe = swiperRecipes[nextIndex];
    
    if (nextRecipe && nextRecipe.id) {
      this.router.navigate(['/product-detail', nextRecipe.id],{queryParams : {redirect : this.redirect}});
    }
  }

  addToFavorites(recipe: any) {
    console.log(recipe,'recipe');
    let favObj={
      id: this.id,
      postId: this.id,
      email: this.authService.userDetails.email,
      title: recipe.title,
      dateCreated: new Date(),
      image: recipe.image?.url,
      description: recipe.description,
      ingredients: recipe.ingredients,
      categories: recipe.category,
      type: 'justmove-recipe'
    }
    console.log(favObj,'favObj');
   this.favoritesService.addFavoriteItem(favObj).subscribe((res:any) => {
      console.log(res,'res');
      this.commonService.showSuccessToast('Added to favorites',3000);
    },(err:any) => {
      console.log(err,'err');
    });
  }

  removeFromFavorites(recipe: any) {
    
    const favorite = this.favorites.find((item:any) => item.postId === this.id);
    console.log(favorite,'favorite');
    this.favoritesService.deleteFavoriteItem(favorite.id).subscribe((res:any) => {
      console.log(res,'res');
      this.commonService.showSuccessToast('Removed from favorites',3000);
    },(err:any) => {
      console.log(err,'err');
    });
  }

  checkFavorites(id:string) {
    return this.favorites.filter((item:any) => item.postId === id).length > 0;
  }

  getFavorites() {
    this.favoritesService.getFavorites(this.authService.userDetails.email).subscribe((res:any) => {
      console.log(res,'getFavorites');
      this.favorites = res;
    },(err:any) => {
      console.log(err,'getFavorites error');
    });
  }

}
