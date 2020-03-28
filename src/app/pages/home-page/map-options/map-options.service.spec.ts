import { TestBed } from '@angular/core/testing';

import { MapOptionsService } from './map-options.service';

describe('MapOptionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MapOptionsService = TestBed.get(MapOptionsService);
    expect(service).toBeTruthy();
  });
});
