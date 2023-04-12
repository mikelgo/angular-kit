import {TestBed} from '@angular/core/testing';
import {StreamVsAsyncComponent} from './stream-vs-async.component';

describe(StreamVsAsyncComponent.name, () => {

  beforeEach(() => {
    TestBed.overrideComponent(StreamVsAsyncComponent, {
      add: {
        imports: [],
        providers: []
      }
    })
  })

  it('renders', () => {
     cy.mount(StreamVsAsyncComponent,);
  })

})
