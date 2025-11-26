import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FinalWeekPage } from './final-week.page';

describe('FinalWeekPage', () => {
  let component: FinalWeekPage;
  let fixture: ComponentFixture<FinalWeekPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalWeekPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
