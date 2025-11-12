import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared/shared-module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [SharedModule]
})
export class ProductsPage implements OnInit {

  constructor(public router:Router) { }

  ngOnInit() {
  }
  goToProductDetail() {
    this.router.navigate(['/product-detail']);
    }
}
