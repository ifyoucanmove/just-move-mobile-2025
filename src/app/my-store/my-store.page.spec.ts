import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyStorePage } from './my-store.page';

describe('MyStorePage', () => {
  let component: MyStorePage;
  let fixture: ComponentFixture<MyStorePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyStorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
