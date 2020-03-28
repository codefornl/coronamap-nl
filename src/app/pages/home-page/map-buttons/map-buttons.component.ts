import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MunicipalityDataService } from '../../../core/municipality-data.service';
import { MapButtonsService } from './map-buttons.service';

@Component({
  selector: 'app-map-buttons',
  templateUrl: './map-buttons.component.html',
  styleUrls: [ './map-buttons.component.scss' ]
})
export class MapButtonsComponent implements OnInit {

  constructor(
    public municipalityDataService: MunicipalityDataService,
    public mapButtonsService: MapButtonsService
  ) {
  }

  ngOnInit() {
  }

}
