import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FeatureCollection, GeoJSON } from 'geojson';
import * as _ from 'lodash';

interface IFile {
  fileName: string;
  key: string;
}

@Injectable()
export class GeoDataService {

  constructor(
    private httpClient: HttpClient
  ) {
  }

  public getMunicipalityBorders(): Promise<FeatureCollection> {
    return this.httpClient.get('assets/geo/gemeentegrenzen_simplified.geojson')
      .toPromise() as any;
  }

  public getSafetyRegionBorders() {
    return this.httpClient.get('assets/geo/gemeentegrenzen_simplified.geojson')
      .toPromise();
  }
}
