import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChallengeMeasurementPage } from './challenge-measurement.page';

describe('ChallengeMeasurementPage', () => {
  let component: ChallengeMeasurementPage;
  let fixture: ComponentFixture<ChallengeMeasurementPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChallengeMeasurementPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
