import {TestBed} from '@angular/core/testing';

import {RxStatefulClient} from './rx-stateful-client.service';
import {provideRxStatefulClient} from "../config/provide-rx-stateful-client";
import {RxStatefulClientFeature} from "../config/config-feature";
import {Observable, of, Subject, switchMap} from "rxjs";
import {inject, Injectable} from "@angular/core";
import {subscribeSpyTo} from "@hirez_io/observer-spy";


describe('RxStatefulClientService', () => {
  it('should be created', () => {
    const {client} = setup();
    expect(client).toBeTruthy();
  });

  it('should create instance of rxStateful', () => {
    const {client} = setup();

    const instance = client.request(of(1));

    expect(instance).toBeTruthy();

  });

  describe('Data Service', () => {
    it('should create services', () => {
      const {client, dataService} = setupDataService();

      expect(client).toBeTruthy();
        expect(dataService).toBeTruthy();

    });
    it('should call request', () => {
      const {client, dataService} = setupDataService();
      jest.spyOn(client, 'request')
      const result = subscribeSpyTo(dataService.getData().value$)

      expect(client.request).toHaveBeenCalled();
      expect(result.getLastValue()).toEqual(dataService.data);
    });
    it('should not throw injection-context error when used with flattening operator', () => {
      const { dataService} = setupDataService();
      const trigger$$ = new Subject<any>()

      const result = subscribeSpyTo(trigger$$.pipe(
          switchMap(() => dataService.getData().value$)
      ))

      trigger$$.next(null)

      expect(result.getLastValue()).toEqual(dataService.data);
      expect(() => dataService.getData()).not.toThrow()

    });
  });
});

interface TestModel {
  id: number;
    name: string;
}
function setup(features?: RxStatefulClientFeature[]){
  TestBed.configureTestingModule({
    providers: [
        features ? provideRxStatefulClient(...features) : provideRxStatefulClient()
    ]
  });

  return {
    client: TestBed.inject(RxStatefulClient)
  };
}

function setupDataService(features?: RxStatefulClientFeature[]){
  @Injectable({
    providedIn: 'root'
  })
  class DataService {
    client = inject(RxStatefulClient)
    data: TestModel[] = [
      {
        id: 1,
        name: 'test'
      },
      {
        id: 2,
        name: 'test2'
      }
    ]

    dataSource$: Observable<TestModel[]> = of(this.data)

    getData(){
      return this.client.request<TestModel[], Error>(this.dataSource$)
    }
  }
  TestBed.configureTestingModule({
    providers: [
      DataService,
      features ? provideRxStatefulClient(...features) : provideRxStatefulClient()
    ]
  });

  return {
    client: TestBed.inject(RxStatefulClient),
    dataService: TestBed.inject(DataService)
  }
}
