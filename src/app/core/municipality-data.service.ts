import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';

interface IFile {
  fileName: string;
  key: string;
}

@Injectable()
export class MunicipalityDataService {
  public files: IFile[];
  public selectedFileKey: string = '';
  public selectedFileKey$: Subject<string> = new Subject();
  public cache = {};
  private filesUrl = 'https://kapulara.github.io/COVID-19-NL/Municipalities/json/files.json';
  public isLoading: boolean = false;

  constructor(
    private httpClient: HttpClient
  ) {
    this.getFiles();
  }

  public async getFiles(): Promise<IFile[]> {
    this.isLoading = false;
    const fileResult: string[] = (await this.httpClient.get(this.filesUrl).toPromise()) as string[];
    this.isLoading = true;

    this.files = fileResult.map((fileName) => ({
      fileName,
      key: fileName.split('-latest.json').join('')
    }));

    return this.files;
  }

  public async getFileByKey(key): Promise<any> {
    if ( !_.isNil(this.cache[ key ]) ) {
      return this.cache[ key ];
    }

    this.isLoading = true;
    const result = await this.httpClient.get(this.fileUrl(key))
      .toPromise();
    this.isLoading = false;

    this.cache[ key ] = this.toCache(result as any);

    return result;
  }

  public async selectLastOne() {
    this.select(this.files[ this.files.length - 1 ].key);
  }

  public onChange($event: Event) {
    console.log($event);
  }

  public select(key: any) {
    this.selectedFileKey = key;
    this.selectedFileKey$.next(this.selectedFileKey);
  }

  public async preload() {
    for (const file of this.files) {
      if ( !_.isNil(this.cache[ file.key ]) ) {
        continue;
      }

      await this.getFileByKey(file.key);
    }
  }

  private fileUrl = (key) => `https://kapulara.github.io/COVID-19-NL/Municipalities/json/${key}-latest.json`;

  private toCache(items: any[]) {
    const data = {};

    items.forEach((item) => data[ item.Gemnr ] = item);

    return data;
  }
}
