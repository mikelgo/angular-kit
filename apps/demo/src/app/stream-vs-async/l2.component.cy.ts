import {TestBed} from '@angular/core/testing';
import {L2Component} from './l2.component';

describe(L2Component.name, () => {

  beforeEach(() => {
    TestBed.overrideComponent(L2Component, {
      add: {
        imports: [],
        providers: []
      }
    })
  })

  it('renders', () => {
     cy.mount(L2Component,);
  })

})
