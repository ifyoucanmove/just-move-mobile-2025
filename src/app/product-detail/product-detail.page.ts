import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { heartOutline } from 'ionicons/icons';
import { SharedModule } from '../shared/shared/shared-module';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../services/recipe';

addIcons({
  heartOutline
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
  constructor(private route: ActivatedRoute,
     private recipeService: RecipeService,
     private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.recipeService.getRecipeById(this.id).subscribe((res:any) => {
        this.recipe = res;
        console.log(this.recipe);
      });
    },(err:any) => {
      console.log(err);
    });
  }

  goBack() {
    this.router.navigate(['/products']);
  }

}
