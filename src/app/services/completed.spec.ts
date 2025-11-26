import { TestBed } from '@angular/core/testing';

import { Completed } from './completed';

describe('Completed', () => {
  let service: Completed;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Completed);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
