import { Component, OnInit } from '@angular/core';
import { latLng, tileLayer, Map, geoJSON, GeoJSON, Browser, Layer, marker, divIcon, layerGroup } from 'leaflet';
import * as _ from 'lodash';
import { GeoDataService } from '../../core/geo-data.service';
import { MunicipalityDataService } from '../../core/municipality-data.service';
import { Feature, FeatureCollection } from 'geojson';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: [ './home-page.component.scss' ]
})
export class HomePageComponent implements OnInit {

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
          attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        })
    ],
    zoom: 8,
    center: latLng(52.2129919, 5.2793703)
  };
  private labelLayer = layerGroup();
  public layers = [
    this.labelLayer
  ];
  private borders: FeatureCollection;
  private borderLayer: GeoJSON<any>;

  constructor(
    private municipalityDataService: MunicipalityDataService,
    private geoDataService: GeoDataService
  ) {
    this.init();
  }

  ngOnInit() {
  }

  public onMapReady($event: Map) {
    console.log($event);
  }

  resetHighlight(e) {
    const layer = e.target;
    this.borderLayer.resetStyle(layer);
  }

  highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
      weight: 2,
      opacity: 1
    });

    if ( !Browser.ie && !Browser.opera && !Browser.edge ) {
      layer.bringToFront();
    }
  }

  private activeKey = () => this.municipalityDataService.selectedFile.key;

  private async init() {
    await this.municipalityDataService.getFiles();
    await this.municipalityDataService.selectLastOne();
    const key = this.activeKey();
    await this.municipalityDataService.getFileByKey(key);

    this.layers.map((layer) => layer.on('click', (event) => console.log(event)));
    this.borders = await this.geoDataService.getMunicipalityBorders();
    this.update();

    // setTimeout(async () => {
    //   const newFile = this.municipalityDataService.files[ 0 ];
    //   this.municipalityDataService.selectedFile = newFile;
    //   const key = this.activeKey();
    //   await this.municipalityDataService.getFileByKey(key);
    //   this.update();
    // }, 2000);
  }

  private update() {
    this.borders.features.map((feature) => {
      feature.properties = {
        ...feature.properties,
        ...this.getProperties(feature.properties)
      };
      return feature;
    });


    if(!_.isNil(this.labelLayer)) {
      this.labelLayer.clearLayers();
    }
    if(!_.isNil(this.borderLayer)) {
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
    this.layers = [
      this.labelLayer,
      this.borderLayer
    ];
  }

  private style(e: Feature<any>) {
    if ( !e.properties ) {
      return;
    }

    var value = e.properties.GemiddeldOverBev;
    var data = {
      weight: 1,
      opacity: 0.1,
      color: '#555',
      fillOpacity: 0,
      fillColor: '#555'
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
      mouseover: (feature) => this.highlightFeature(feature),
      mouseout: (feature) => this.resetHighlight(feature)
    });

    if ( !feature.properties ) {
      return;
    }

    var aantal = feature.properties.Aantal;
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
