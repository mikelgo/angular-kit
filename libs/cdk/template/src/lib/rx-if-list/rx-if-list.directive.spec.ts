import {RxIfListDirective} from './rx-if-list.directive';
import {TestBed} from '@angular/core/testing';
import {Component} from '@angular/core';

describe('RxIfListDirective', () => {
  it('should create an instance of test host', async () => {
    const { component } = await setup(`<div *rxIfList="[]"></div>`);
    expect(component).toBeTruthy();
  });

  it('should not render template when array is empty', async () => {
    const { fixture } = await setup(`<div *rxIfList="[]"></div>`);
    expect(fixture.nativeElement.innerHTML).not.toContain('<div></div>');
  });

  it('should not render template when array is null', async () => {
    const { fixture } = await setup(`<div *rxIfList="null"></div>`);
    expect(fixture.nativeElement.innerHTML).not.toContain('<div></div>');
  });

  it('should not render template when array is undefined', async () => {
    const { fixture } = await setup(`<div *rxIfList="undefined"></div>`);
    expect(fixture.nativeElement.innerHTML).not.toContain('<div></div>');
  });

  it('should render template when array is not empty', async () => {
    const { fixture } = await setup(`<div *rxIfList="['a']"></div>`);
    expect(fixture.nativeElement.innerHTML).toContain('<div></div>');
  });
});

async function setup(template: string) {
  @Component({
    template,
  })
  class TestHostComponent {}

  await TestBed.configureTestingModule({
    declarations: [TestHostComponent],
    imports: [RxIfListDirective],
    //providers: [RxIfListDirective]
  }).compileComponents();

  //const rxIfListDirective = TestBed.inject(RxIfListDirective);
  const fixture = TestBed.createComponent(TestHostComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, component };
}
