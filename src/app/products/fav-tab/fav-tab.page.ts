import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { SharedModule } from 'src/app/shared/shared/shared-module';
import { Common } from 'src/app/services/common';
import { SidebarComponent } from 'src/app/shared/sidebar/sidebar.component';
import { Favorites } from 'src/app/services/favorites';
import { AuthService } from 'src/app/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fav-tab',
  templateUrl: './fav-tab.page.html',
  styleUrls: ['./fav-tab.page.scss'],
  standalone: true,
  imports: [SharedModule,SidebarComponent]
})
export class FavTabPage implements OnInit {

  favorites: any[] = [];
  isLoading = true;
  constructor(public common:Common,
     public favoritesService: Favorites,
     public authService: AuthService,
     public router: Router) { }

  ngOnInit() {
    this.getFavorites();
  }
  getFavorites() {
    this.favoritesService.getFavorites(this.authService.userDetails.email).subscribe((res:any) => {
      console.log(res,'getFavorites');
      let list = res.filter((item:any) => item.type === 'justmove-recipe');
      this.favorites = list;
      this.isLoading = false;
    },(err:any) => {
      console.log(err,'getFavorites error');
      this.isLoading = false;
    });
  }

  toggleSidebar() {
    this.common.isSidebarOpen = !this.common.isSidebarOpen;
  }
  goToProductDetail(id:string) {
    this.router.navigate(['/product-detail', id]);
  }


  removeFromFavorites(fav:any) {
    console.log(fav,'fav');
    this.favoritesService.deleteFavoriteItem(fav.id).subscribe((res:any) => {
      console.log(res,'res');
      this.common.showSuccessToast('Removed from favorites',3000);
    },(err:any) => {
      console.log(err,'err');
    });
  }

}
