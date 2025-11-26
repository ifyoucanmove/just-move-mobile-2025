import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengeMainPage } from './challenge-main.page';

describe('ChallengeMainPage', () => {
  let component: ChallengeMainPage;
  let fixture: ComponentFixture<ChallengeMainPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeMainPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
