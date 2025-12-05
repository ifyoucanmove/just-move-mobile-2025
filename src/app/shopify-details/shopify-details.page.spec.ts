import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopifyDetailsPage } from './shopify-details.page';

describe('ShopifyDetailsPage', () => {
  let component: ShopifyDetailsPage;
  let fixture: ComponentFixture<ShopifyDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopifyDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
