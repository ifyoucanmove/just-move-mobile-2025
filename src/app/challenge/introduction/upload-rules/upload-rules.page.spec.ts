import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadRulesPage } from './upload-rules.page';

describe('UploadRulesPage', () => {
  let component: UploadRulesPage;
  let fixture: ComponentFixture<UploadRulesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadRulesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
