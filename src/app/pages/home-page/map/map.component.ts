import { Component, OnDestroy, OnInit } from '@angular/core';
import { faCross, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Feature, FeatureCollection } from 'geojson';
import {
  Browser,
  control,
  divIcon,
  geoJSON,
  GeoJSON,
  latLng,
  Layer,
  layerGroup,
  Map,
  marker,
  PathOptions,
  tileLayer
} from 'leaflet';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { GeoDataService } from '../../../core/geo-data.service';
import { MunicipalityDataService } from '../../../core/municipality-data.service';
import { MapOptionsService } from '../map-options/map-options.service';
import * as moment from 'moment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: [ './map.component.scss' ]
})
export class MapComponent implements OnInit, OnDestroy {
  public warningSign = faExclamationTriangle;
  public crossIcon = faTimes;

  private mapboxToken = 'pk.eyJ1IjoibWlibG9uIiwiYSI6ImNrMGtvajhwaDBsdHQzbm16cGtkcHZlaXUifQ.dJTOE8FJc801TAT0yUhn3g';
  /*

    L..addTo(map);
   */
  public options = {
    layers: [
      tileLayer(
        'https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token=' + this.mapboxToken, {
          tileSize: 512,
          zoomOffset: -1,
          attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
            '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })
    ],
    zoom: 8,
    zoomControl: false,
    center: latLng(52.2129919, 5.2793703)
  };
  private labelLayer = layerGroup();
  public layers = [
    this.labelLayer
  ];
  private borders: FeatureCollection;
  private borderLayer: GeoJSON<any>;
  private optionSubscription: Subscription;
  private showWarningOverride = false;

  constructor(
    private municipalityDataService: MunicipalityDataService,
    private geoDataService: GeoDataService,
    private mapOptionsService: MapOptionsService
  ) {
    this.init();
  }

  ngOnInit() {
  }

  public ngOnDestroy(): void {
    this.optionSubscription.unsubscribe();
  }

  public onMapReady(map: Map) {
    console.log(map);
    control.zoom({
      position: 'topright'
    }).addTo(map);
  }

  resetHighlight(e) {
    const layer = e.target;
    this.borderLayer.resetStyle(layer);
  }

  highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
      weight: 2,
      opacity: 1,
      dashArray: '3'
    });

    if ( !Browser.ie && !Browser.opera && !Browser.edge ) {
      layer.bringToFront();
    }
  }

  public shouldShowWarning() {
    const day = moment(this.activeKey());

    return day.isValid() && day.isSameOrAfter('03-13-2020', 'day') && !this.showWarningOverride;
  }

  public closeWarning() {
    this.showWarningOverride = true;
  }

  private hasLabels = () => this.mapOptionsService.hasLabels === 'on';

  private activeKey = () => this.municipalityDataService.selectedFileKey;

  private async init() {
    await this.municipalityDataService.getFiles();
    await this.municipalityDataService.selectLastOne();
    this.layers.map((layer) => layer.on('click', (event) => console.log(event)));
    this.borders = await this.geoDataService.getMunicipalityBorders();
    this.update(true);
    this.optionSubscription = this.mapOptionsService.options$.subscribe(() => this.update());
    this.municipalityDataService.selectedFileKey$.subscribe(() => this.update(true));
  }

  private async update(load: boolean = false) {
    if ( load ) {
      const key = this.activeKey();
      await this.municipalityDataService.getFileByKey(key);
    }

    this.borders.features.map((feature) => {
      feature.properties = {
        ...feature.properties,
        ...this.getProperties(feature.properties)
      };
      return feature;
    });


    if ( !_.isNil(this.labelLayer) ) {
      this.labelLayer.clearLayers();
    }
    if ( !_.isNil(this.borderLayer) ) {
      this.borderLayer.clearLayers();
    }

    this.layers.length = 0;
    this.borderLayer = (geoJSON(this.borders as any, {
      style: (feature) => this.style(feature),
      onEachFeature: (
        feature,
        layer
      ) => this.onEachFeature(feature, layer)
    }));

    this.layers = this.hasLabels() ? [
      this.labelLayer,
      this.borderLayer
    ] : [ this.borderLayer ];
  }

  private style(e: Feature<any>) {
    if ( !e.properties ) {
      return;
    }

    const value = e.properties.GemiddeldOverBev;
    const data: PathOptions = {
      weight: 1,
      opacity: 0.2,
      fillOpacity: 0,
      fillColor: '#555',
      color: 'white'
    };
    if ( value ) {
      data.fillColor = this.getColor(value);
      data.fillOpacity = 0.5;
    }

    return data;
  }

  private getColor(d: any): string {
    return d > 4096 ? '#800026' :
      d > 1024 ? '#BD0026' :
        d > 256 ? '#E31A1C' :
          d > 64 ? '#FC4E2A' :
            d > 16 ? '#FD8D3C' :
              d > 4 ? '#FEB24C' :
                d > 1 ? '#FED976' :
                  '#FFEDA0';
  }

  private getProperties(properties: any) {
    const key = this.activeKey();
    return this.municipalityDataService.cache[ key ][ properties.Code ];
  }

  private onEachFeature(
    feature: Feature,
    layer: Layer
  ) {
    layer.on({
      mouseover: (mouseOverFeature) => this.highlightFeature(mouseOverFeature),
      mouseout: (mouseOutFeature) => this.resetHighlight(mouseOutFeature)
    });

    if ( !feature.properties || !this.hasLabels() ) {
      return;
    }

    const aantal = feature.properties.Aantal;
    if ( aantal > 0 ) {
      marker((layer as any).getBounds().getCenter(), {
        icon: divIcon({
          className: 'label',
          html: aantal
        })
      }).addTo(this.labelLayer);
    }
  }
}
