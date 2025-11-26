import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengeHomePage } from './challenge-home.page';

describe('ChallengeHomePage', () => {
  let component: ChallengeHomePage;
  let fixture: ComponentFixture<ChallengeHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
