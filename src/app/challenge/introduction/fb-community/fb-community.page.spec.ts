import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FbCommunityPage } from './fb-community.page';

describe('FbCommunityPage', () => {
  let component: FbCommunityPage;
  let fixture: ComponentFixture<FbCommunityPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FbCommunityPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
