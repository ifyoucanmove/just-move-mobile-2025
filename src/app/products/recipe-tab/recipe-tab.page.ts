import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from 'src/app/services/recipe';
import { environment } from 'src/environments/environment';
import { IonTabs, NavController, Platform } from '@ionic/angular/standalone';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar.component';
import { FilterDialogComponent } from 'src/app/shared/filter-dialog/filter-dialog.component';
import { ModalController } from '@ionic/angular/standalone';
import { Shopify } from 'src/app/services/shopify';
import { AuthService } from 'src/app/services/auth';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { trophyOutline, cartOutline, receiptOutline, storefrontOutline } from 'ionicons/icons';
import { Customer } from 'src/app/services/customer';
import { Challenges } from 'src/app/services/challenges';
import { Common } from 'src/app/services/common';
import { Favorites } from 'src/app/services/favorites';

@Component({
  selector: 'app-recipe-tab',
  templateUrl: './recipe-tab.page.html',
  styleUrls: ['./recipe-tab.page.scss'],
  standalone: true,
  imports: [SharedModule,SidebarComponent]
})
export class RecipeTabPage implements OnInit {

  @ViewChild(IonTabs) tabs!: IonTabs;

  recipes: any[] = [];
  allRecipes: any[] = []; // Store all recipes for filtering
  categoryList: any[] = environment.categoryList;
  selectedCategories: Set<string> = new Set(); // Track selected categories
 searchText: string = '';

  selectedCategory = 'home';
  categories = ['Shakes', 'Smoothie Bowls', 'Juices', 'Teas'];
  favoriteCount = 113;
  title = "";
  allActiveChallenges:any;
  challengeDatas:any[] = [];
  challenges = [];
  cat = "";

  isTrial = false;
  status:string = "";
  challengePurchases = [];
  isPaused : boolean = false;
  backButtonSubscription?: Subscription;
  lastBackPress = 0;
  backButtonPressCount = 0;
  searchTextHome: string = '';

  recipesHome:any[] = [];
  currentSlideIndex: number = 0;
  touchStartX: number = 0;
  touchEndX: number = 0;
  favorites: any[] = [];
  constructor(public router:Router, 
    public recipeService: RecipeService,
    public shopifyService:Shopify,
    public route:ActivatedRoute,
    public authService:AuthService,
    public customerService:Customer,
    public challengeService:Challenges,
    public common:Common,
    private platform: Platform,
    public favoritesService: Favorites,
    private navCtrl: NavController,
    private modalController: ModalController) { 
      addIcons({
        trophyOutline,
        cartOutline,
        receiptOutline,
        storefrontOutline
      });
    }

  ngOnInit() {
    this.getFavorites();
    this.recipeService.getRecipes().subscribe((res:any) => {
      console.log(res);
      this.allRecipes = res;
      this.recipes = res;

      this.searchByText();
    },(err:any) => {
      console.log(err);
    });
 console.log(this.authService.userDetails)
    console.log(this.authService.currentUser,"s")
      this.shopifyService.loadCartItems(this.authService.currentUser?.email || ''); 
   
  }



  searchByText() {
    this.route.queryParams.subscribe((res) => {
      this.searchText = res['search'];
      console.log(this.searchText,"search text");
      this.filterRecipes();
    });
  }
  ngAfterViewInit() {
    // Set the shakes (recipes) tab as active initially
    setTimeout(() => {
      if (this.tabs) {
        this.tabs.select('home');
        console.log(this.tabs.getSelected(),"tabs");
        if (this.tabs.getSelected() == 'home') {
          // Handle back button for double-tap to exit
        // this.setupBackButtonHandler();
          }
      }
    }, 0);
  }
  getRecipeImage(recipe: any): string {
    return recipe.image?.url || 'assets/images/placeholder.jpg';
  }

  handleImageError(event: any) {
    event.target.src = 'assets/images/placeholder.jpg';
  }

  toggleCategory(category: any) {
    const categoryValue = category.value;
    if (this.selectedCategories.has(categoryValue)) {
      this.selectedCategories.delete(categoryValue);
    } else {
      this.selectedCategories.add(categoryValue);
    }
    this.filterRecipes();
  }

  filterRecipes() {
    if (this.selectedCategories.size === 0 && !this.searchText) {
      // If no categories selected, show all recipes
      this.recipes = this.allRecipes;
      this.recipeService.swiperRecipes = this.recipes;
    } else {
      // Filter recipes that match any of the selected categories or if search text is not empty, then filter the recipes by search text
      if(this.selectedCategories.size > 0) {
      this.recipes = this.allRecipes.filter(recipe => 
        (recipe.category && this.selectedCategories.has(recipe.category))
      );
      this.recipeService.swiperRecipes = this.recipes;
    }
      if(this.searchText && this.searchText.trim()) {
        this.recipes = this.recipes.filter(recipe => recipe.title.toLowerCase().includes(this.searchText.toLowerCase()) || recipe.description.toLowerCase().includes(this.searchText.toLowerCase()));
        this.recipeService.swiperRecipes = this.recipes;
      }
      if(this.selectedCategories.size === 0 && this.searchText) {
        this.recipes = this.allRecipes.filter(recipe => recipe.title.toLowerCase().includes(this.searchText.toLowerCase()) || recipe.description.toLowerCase().includes(this.searchText.toLowerCase()));
        this.recipeService.swiperRecipes = this.recipes;
      }
    }
  }

  isCategorySelected(category: any): boolean {
    return this.selectedCategories.has(category.value);
  }

  toggleSidebar() {
    this.common.isSidebarOpen = !this.common.isSidebarOpen;
  }

  goToProductDetail(id:string) {
    this.router.navigate(['/product-detail', id]);
    }
  async openFilterDialog() {
    //open filter dialog using modal controller
    const modal = await this.modalController.create({
      component: FilterDialogComponent,
      componentProps: {
        categoryList: this.categoryList,
        selectedCategories: new Set(this.selectedCategories)
      },
      cssClass: 'filter-dialog-modal'
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    console.log(data,"data");
    if (data && data.selectedCategories) {
      // Convert array back to Set
      this.selectedCategories = new Set(data.selectedCategories);
      console.log(this.selectedCategories,"selected categories");
      this.filterRecipes();
    }
  }
  search() {
    if (this.searchText && this.searchText.trim()) {
    this.router.navigate(['/products/recipe-tab'], {
        queryParams: { search: this.searchText.trim() }
      });
    } else {
      this.router.navigate(['/products/recipe-tab']);
    }
  }

  onSearchInput() {
     this.router.navigate(['/products/recipe-tab'], {
      queryParams: { search: this.searchText.trim() }
    });
   // this.filterRecipes();
  }

  onSearchClear() {
    this.searchText = '';
    this.router.navigate(['/products/recipe-tab']);
  //  this.filterRecipes();
  }

  addToFavorites(recipe: any) {
    console.log(recipe,'recipe');
    let favObj={
      id: recipe.id,
      postId: recipe.id,
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
      this.common.showSuccessToast('Added to favorites',3000);
    },(err:any) => {
      console.log(err,'err');
    });
  }

  removeFromFavorites(recipe: any) {
    
    const favorite = this.favorites.find((item:any) => item.postId === recipe.id);
    console.log(favorite,'favorite');
    this.favoritesService.deleteFavoriteItem(favorite.id).subscribe((res:any) => {
      console.log(res,'res');
      this.common.showSuccessToast('Removed from favorites',3000);
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