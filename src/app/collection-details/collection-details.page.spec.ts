import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionDetailsPage } from './collection-details.page';

describe('CollectionDetailsPage', () => {
  let component: CollectionDetailsPage;
  let fixture: ComponentFixture<CollectionDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
