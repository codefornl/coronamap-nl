import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { MunicipalityDataService } from '../../../core/municipality-data.service';

@Injectable({
  providedIn: 'root'
})
export class MapButtonsService {
  public isRunning = false;
  public isPaused = false;
  public canPause: boolean = false;
  public canGoToStart: boolean = false;
  public canStop: boolean = false;
  public canPlay: boolean = false;
  public canGoPrevious: boolean = false;
  public canGoNext: boolean = false;
  private timer;

  constructor(
    private municipalityDataService: MunicipalityDataService
  ) {
    this.municipalityDataService.selectedFileKey$.subscribe(() => this.check());
    this.check();
  }

  public async play() {
    if ( this.isRunning ) {
      return;
    }

    await this.municipalityDataService.preload();

    if ( !this.isPaused ) {
      this.start();
    }

    clearInterval(this.timer);
    this.isRunning = true;
    this.check();
    this.timer = setInterval(() => {
      if ( this.canGoToNext() ) {
        this.next();
      } else {
        this.stop();
      }
    }, 500);
  }

  public pause() {
    clearInterval(this.timer);
    this.isRunning = false;
    this.isPaused = true;
    this.check();
  }

  public stop() {
    clearInterval(this.timer);
    this.isRunning = false;
    this.isPaused = false;
    this.check();
  }

  public start() {
    const files = this.municipalityDataService.files;

    if ( files.length > 0 ) {
      this.municipalityDataService.select(files[ 0 ].key);
    }
  }

  public previous() {
    const files = this.municipalityDataService.files;
    const item = _.find(files, { key: this.municipalityDataService.selectedFileKey });

    if ( !_.isNil(item) ) {
      const currentIndex = files.indexOf(item);
      const previousIndex = currentIndex - 1;
      const previousItem = files[ previousIndex ];

      if ( _.isNil(previousItem) ) {
        return;
      }

      this.municipalityDataService.select(previousItem.key);
    }
  }

  public canGoToNext() {
    const files = this.municipalityDataService.files;
    const item = _.find(files, { key: this.municipalityDataService.selectedFileKey });

    if ( !_.isNil(item) ) {
      const currentIndex = files.indexOf(item);
      const nextIndex = currentIndex + 1;
      const nextItem = files[ nextIndex ];
      return !_.isNil(nextItem);
    }

    return false;
  }

  public next() {
    const files = this.municipalityDataService.files;
    const item = _.find(files, { key: this.municipalityDataService.selectedFileKey });

    if ( !_.isNil(item) ) {
      const currentIndex = files.indexOf(item);
      const nextIndex = currentIndex + 1;
      const nextItem = files[ nextIndex ];

      if ( _.isNil(nextItem) ) {
        return;
      }

      this.municipalityDataService.select(nextItem.key);
    }
  }

  private check() {
    const item = _.find(this.municipalityDataService.files, { key: this.municipalityDataService.selectedFileKey });

    if ( !_.isNil(item) ) {
      const count = this.municipalityDataService.files.length;
      const currentIndex = this.municipalityDataService.files.indexOf(item);
      this.canGoPrevious = (currentIndex - 1) >= 0;
      this.canGoNext = currentIndex + 1 <= (count - 1);
      this.canGoToStart = this.canGoPrevious;
    } else {
      this.canGoPrevious = false;
      this.canGoNext = false;
      this.canGoToStart = false;
    }

    this.canPlay = !this.isRunning;
    this.canPause = this.isRunning;
    this.canStop = this.isRunning || this.isPaused;
  }
}
