import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { SharedModule } from '../shared/shared/shared-module';
import { Router } from '@angular/router';
import { RecipeService } from '../services/recipe';
import { environment } from 'src/environments/environment';
import { IonTabs } from '@ionic/angular/standalone';
import { SidebarComponent } from '../shared/sidebar/sidebar.component';
import { FilterDialogComponent } from '../shared/filter-dialog/filter-dialog.component';
import { ModalController } from '@ionic/angular/standalone';

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

  constructor(public router:Router, 
    public recipeService: RecipeService,
    private modalController: ModalController) { }

  ngOnInit() {
    this.recipeService.getRecipes().subscribe((res:any) => {
      console.log(res);
      this.allRecipes = res;
      this.recipes = res;
    },(err:any) => {
      console.log(err);
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
    if (this.selectedCategories.size === 0) {
      // If no categories selected, show all recipes
      this.recipes = this.allRecipes;
    } else {
      // Filter recipes that match any of the selected categories
      this.recipes = this.allRecipes.filter(recipe => 
        recipe.category && this.selectedCategories.has(recipe.category)
      );
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
    if (data && data.selectedCategories) {
      // Convert array back to Set
      this.selectedCategories = new Set(data.selectedCategories);
      this.filterRecipes();
    }
  }
}
