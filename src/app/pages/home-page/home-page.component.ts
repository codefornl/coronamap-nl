import { Component } from '@angular/core';
import { MunicipalityDataService } from '../../core/municipality-data.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: [ './home-page.component.scss' ]
})
export class HomePageComponent {
  constructor(
    public municipalityDataService: MunicipalityDataService
  ) {
  }
}
