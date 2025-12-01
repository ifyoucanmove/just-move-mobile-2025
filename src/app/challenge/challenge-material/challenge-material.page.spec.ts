import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengeMaterialPage } from './challenge-material.page';

describe('ChallengeMaterialPage', () => {
  let component: ChallengeMaterialPage;
  let fixture: ComponentFixture<ChallengeMaterialPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeMaterialPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
