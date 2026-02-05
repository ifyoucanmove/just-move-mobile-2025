import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeTabPage } from './recipe-tab.page';

describe('RecipeTabPage', () => {
  let component: RecipeTabPage;
  let fixture: ComponentFixture<RecipeTabPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RecipeTabPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
