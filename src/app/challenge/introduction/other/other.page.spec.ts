import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OtherPage } from './other.page';

describe('OtherPage', () => {
  let component: OtherPage;
  let fixture: ComponentFixture<OtherPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
