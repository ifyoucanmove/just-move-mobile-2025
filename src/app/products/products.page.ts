import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { SharedModule } from '../shared/shared/shared-module';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../services/recipe';
import { environment } from 'src/environments/environment';
import { IonTabs } from '@ionic/angular/standalone';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { FilterDialogComponent } from '../shared/filter-dialog/filter-dialog.component';
import { ModalController } from '@ionic/angular/standalone';
import { Shopify } from '../services/shopify';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [SharedModule, SidebarComponent]
})
export class ProductsPage implements OnInit, AfterViewInit {

  @ViewChild(IonTabs) tabs!: IonTabs;

  recipes: any[] = [];
  allRecipes: any[] = []; // Store all recipes for filtering
  categoryList: any[] = environment.categoryList;
  selectedCategories: Set<string> = new Set(); // Track selected categories
  isSidebarOpen = false;
  searchText: string = '';
  constructor(public router:Router, 
    public recipeService: RecipeService,
    public shopifyService:Shopify,
    public route:ActivatedRoute,
    public authService:AuthService,
    private modalController: ModalController) { }

  ngOnInit() {
    this.recipeService.getRecipes().subscribe((res:any) => {
      console.log(res);
      this.allRecipes = res;
      this.recipes = res;

      this.searchByText();
    },(err:any) => {
      console.log(err);
    });
   
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
        this.tabs.select('shakes');
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
    } else {
      // Filter recipes that match any of the selected categories or if search text is not empty, then filter the recipes by search text
      if(this.selectedCategories.size > 0) {
      this.recipes = this.allRecipes.filter(recipe => 
        (recipe.category && this.selectedCategories.has(recipe.category))
      );
    }
      if(this.searchText && this.searchText.trim()) {
        this.recipes = this.recipes.filter(recipe => recipe.title.toLowerCase().includes(this.searchText.toLowerCase()) || recipe.description.toLowerCase().includes(this.searchText.toLowerCase()));
      }
      if(this.selectedCategories.size === 0 && this.searchText) {
        this.recipes = this.allRecipes.filter(recipe => recipe.title.toLowerCase().includes(this.searchText.toLowerCase()) || recipe.description.toLowerCase().includes(this.searchText.toLowerCase()));
      }
    }
  }

  isCategorySelected(category: any): boolean {
    return this.selectedCategories.has(category.value);
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
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
    this.router.navigate(['/products'], {
        queryParams: { search: this.searchText.trim() }
      });
    } else {
      this.router.navigate(['/products']);
    }
  }

  onSearchInput() {
     this.router.navigate(['/products'], {
      queryParams: { search: this.searchText.trim() }
    });
   // this.filterRecipes();
  }

  onSearchClear() {
    this.searchText = '';
    this.router.navigate(['/products']);
  //  this.filterRecipes();
  }
}
