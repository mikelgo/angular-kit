import {TestBed} from '@angular/core/testing';
import {L2StreamComponent} from './l2-stream.component';

describe(L2StreamComponent.name, () => {

  beforeEach(() => {
    TestBed.overrideComponent(L2StreamComponent, {
      add: {
        imports: [],
        providers: []
      }
    })
  })

  it('renders', () => {
     cy.mount(L2StreamComponent,);
  })

})
