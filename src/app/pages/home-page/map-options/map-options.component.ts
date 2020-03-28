import { Component, OnInit } from '@angular/core';

import { faCog } from '@fortawesome/free-solid-svg-icons';
import { MapOptionsService } from './map-options.service';

@Component({
  selector: 'app-map-options',
  templateUrl: './map-options.component.html',
  styleUrls: [ './map-options.component.scss' ]
})
export class MapOptionsComponent {
  public faCog = faCog;
  public visible: boolean = false;

  constructor(
    public mapOptionsService: MapOptionsService
  ) {
  }

}
