import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengeWeek1Page } from './challenge-week1.page';

describe('ChallengeWeek1Page', () => {
  let component: ChallengeWeek1Page;
  let fixture: ComponentFixture<ChallengeWeek1Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeWeek1Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
