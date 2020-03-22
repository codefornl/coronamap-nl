import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GeoDataService } from './core/geo-data.service';
import { MunicipalityDataService } from './core/municipality-data.service';

import { HomePageComponent } from './pages/home-page/home-page.component';
import { MapOptionsComponent } from './pages/home-page/map-options/map-options.component';
import { MapComponent } from './pages/home-page/map/map.component';
import { MapButtonsComponent } from './pages/home-page/map-buttons/map-buttons.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,

    AppRoutingModule,
    HttpClientModule,
    LeafletModule.forRoot(),

    FontAwesomeModule,
    BrowserAnimationsModule,

    MatButtonToggleModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [
    AppComponent,
    HomePageComponent,
    MapOptionsComponent,
    MapComponent,
    MapButtonsComponent
  ],
  providers: [
    MunicipalityDataService,
    GeoDataService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
