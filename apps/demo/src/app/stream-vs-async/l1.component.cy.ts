import {TestBed} from '@angular/core/testing';
import {L1Component} from './l1.component';

describe(L1Component.name, () => {

  beforeEach(() => {
    TestBed.overrideComponent(L1Component, {
      add: {
        imports: [],
        providers: []
      }
    })
  })

  it('renders', () => {
     cy.mount(L1Component,);
  })

})
