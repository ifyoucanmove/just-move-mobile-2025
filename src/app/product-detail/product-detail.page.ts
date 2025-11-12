import { Component, OnInit } from '@angular/core';
import { addIcons } from 'ionicons';
import { heartOutline } from 'ionicons/icons';
import { SharedModule } from '../shared/shared/shared-module';

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

  constructor() { }

  ngOnInit() {
  }

}
