import { TestBed } from '@angular/core/testing';

import { Byo } from './byo';

describe('Byo', () => {
  let service: Byo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Byo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
