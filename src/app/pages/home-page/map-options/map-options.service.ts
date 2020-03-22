import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MapOptionsService {
  public hasLabels: string = 'off';
  public options$: Subject<boolean> = new Subject<boolean>();

  public setHasLabels($event: any) {
    this.hasLabels = $event;
    this.options$.next(true);
  }
}
