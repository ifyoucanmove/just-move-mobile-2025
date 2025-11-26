import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengeCoolDownsPage } from './challenge-cool-downs.page';

describe('ChallengeCoolDownsPage', () => {
  let component: ChallengeCoolDownsPage;
  let fixture: ComponentFixture<ChallengeCoolDownsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeCoolDownsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
