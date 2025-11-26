import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengeDayPage } from './challenge-day.page';

describe('ChallengeDayPage', () => {
  let component: ChallengeDayPage;
  let fixture: ComponentFixture<ChallengeDayPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeDayPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
