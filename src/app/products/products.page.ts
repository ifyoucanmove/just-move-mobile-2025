import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared/shared-module';
import { Router } from '@angular/router';
import { RecipeService } from '../services/recipe';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class ProductsPage implements OnInit {

  recipes: any[] = [];
  allRecipes: any[] = []; // Store all recipes for filtering
  categoryList: any[] = environment.categoryList;
  selectedCategories: Set<string> = new Set(); // Track selected categories

  constructor(public router:Router, public recipeService: RecipeService) { }

  ngOnInit() {
    this.recipeService.getRecipes().subscribe((res:any) => {
      console.log(res);
      this.allRecipes = res;
      this.recipes = res;
    },(err:any) => {
      console.log(err);
    });
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

  goToProductDetail(id:string) {
    this.router.navigate(['/product-detail', id]);
    }
}
