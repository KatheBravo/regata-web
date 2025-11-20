import { TestBed } from '@angular/core/testing';

import { Barco } from './barco';

describe('Barco', () => {
  let service: Barco;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Barco);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
