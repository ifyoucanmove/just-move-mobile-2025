import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavTabPage } from './fav-tab.page';

describe('FavTabPage', () => {
  let component: FavTabPage;
  let fixture: ComponentFixture<FavTabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FavTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
