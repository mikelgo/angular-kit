import {TestBed} from '@angular/core/testing';
import {L1StreamComponent} from './l1-stream.component';

describe(L1StreamComponent.name, () => {

  beforeEach(() => {
    TestBed.overrideComponent(L1StreamComponent, {
      add: {
        imports: [],
        providers: []
      }
    })
  })

  it('renders', () => {
     cy.mount(L1StreamComponent,);
  })

})
