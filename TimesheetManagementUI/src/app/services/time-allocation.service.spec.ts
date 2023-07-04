import { TestBed, inject } from '@angular/core/testing';

import { TimeAllocationService } from './time-allocation.service';

describe('TimeAllocationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeAllocationService]
    });
  });

  it('should be created', inject([TimeAllocationService], (service: TimeAllocationService) => {
    expect(service).toBeTruthy();
  }));
});
