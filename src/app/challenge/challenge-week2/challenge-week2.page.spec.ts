import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengeWeek2Page } from './challenge-week2.page';

describe('ChallengeWeek2Page', () => {
  let component: ChallengeWeek2Page;
  let fixture: ComponentFixture<ChallengeWeek2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeWeek2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
