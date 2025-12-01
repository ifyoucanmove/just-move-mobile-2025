import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyCartPage } from './my-cart.page';

describe('MyCartPage', () => {
  let component: MyCartPage;
  let fixture: ComponentFixture<MyCartPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCartPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
