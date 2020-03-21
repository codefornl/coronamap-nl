import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';

interface IFile {
  fileName: string;
  key: string;
}

@Injectable()
export class MunicipalityDataService {
  public files: IFile[];
  public selectedFile: IFile;
  public cache = {};
  private filesUrl = 'https://kapulara.github.io/COVID-19-NL/Municipalities/json/files.json';

  constructor(
    private httpClient: HttpClient
  ) {
    this.getFiles();
  }

  public async getFiles(): Promise<IFile[]> {
    const fileResult: string[] = (await this.httpClient.get(this.filesUrl).toPromise()) as string[];

    this.files = fileResult.map((fileName) => ({
      fileName,
      key: fileName.split('-latest.json').join('')
    }));

    return this.files;
  }

  public async getFileByKey(key): Promise<any> {
    const result = await this.httpClient.get(this.fileUrl(key))
      .toPromise();

    this.cache[key] = this.toCache(result as any);

    return result;
  }

  public async selectLastOne() {
    this.selectedFile = this.files[ this.files.length - 1 ];
  }

  private fileUrl = (key) => `https://kapulara.github.io/COVID-19-NL/Municipalities/json/${key}-latest.json`;

  private toCache(items: any[]) {
    const data = {};

    items.forEach((item) => data[ item[ 'Gemnr' ] ] = item);

    return data;
  }
}
