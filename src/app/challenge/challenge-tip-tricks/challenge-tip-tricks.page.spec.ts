import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengeTipTricksPage } from './challenge-tip-tricks.page';

describe('ChallengeTipTricksPage', () => {
  let component: ChallengeTipTricksPage;
  let fixture: ComponentFixture<ChallengeTipTricksPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeTipTricksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
