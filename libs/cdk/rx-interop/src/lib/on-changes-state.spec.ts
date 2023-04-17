import {TestBed} from "@angular/core/testing";
import {provideOnChanges$} from "./on-changes-state";
import {subscribeSpyTo} from "@hirez_io/observer-spy";
import {TypedSimpleChanges} from "./effect-on-changes$";
import {mapChanges} from "./util/map-changes";
import {map} from "rxjs";

describe('OnChangesState', () => {

  it('should create', async () => {
    const {state} = await setup();
    expect(state).toBeTruthy();
  });

  describe('isInitialized$', () => {
    it('should emit true when connect$ has been called', async () => {
      const {state} = await setup();
      const result = subscribeSpyTo(state.isInitialized$);
      state.connect$({});

      expect(result.getLastValue()).toBe(true);
    });
    it('should emit false initially ', async () => {
      const {state} = await setup();
      const result = subscribeSpyTo(state.isInitialized$);

      expect(result.getLastValue()).toBe(false);
    });
  });

  describe('changes$', () => {
    it('should emit distinct changes', async () => {
      const {state} = await setup();
      const result = subscribeSpyTo(state.changes$);
      const changes: TypedSimpleChanges<Inputs> = createFirstChange();
      state.connect$(changes);
      state.connect$(changes);

      expect(result.getValues()).toEqual([mapChanges(changes)]);
    });
  });

  describe('changesState$', () => {
    it('should emit distinct changeState', async () => {
      const {state} = await setup();
      const result = subscribeSpyTo(state.changesState$);
      const changes: TypedSimpleChanges<Inputs> = createFirstChange();
      state.connect$(changes);
      state.connect$(changes);

      const secondChanges: TypedSimpleChanges<Inputs> = {
        ...changes,
        id: {
          firstChange: false,
          previousValue: 1,
          currentValue: 2,
          isFirstChange(): boolean {
            return false;
          }
        }
      }

      state.connect$(secondChanges);

      expect(result.getValues()).toEqual([mapChanges(changes), mapChanges(secondChanges)]);
    });
  });

  describe('derived calculations', () => {
    it('should be possible', async () => {
      const {state} = await setup();
      const idchanges$ = state.changesState$.pipe(map(changes => changes.id));
      const result = subscribeSpyTo(idchanges$);

      const changes: TypedSimpleChanges<Inputs> = createFirstChange();
      state.connect$(changes);

      expect(result.getLastValue()).toEqual(1);
    });
  })
});



async function setup(){
  await TestBed.configureTestingModule({
    providers: [
      provideOnChanges$()
    ]
  }).compileComponents();

  const state = TestBed.inject(provideOnChanges$())

  return {state};
}

interface Inputs{
  id: number;
  name: string;
}

function createFirstChange(): TypedSimpleChanges<Inputs>{
  return {
    id: {
      firstChange: true,
      previousValue: undefined,
      currentValue: 1,
      isFirstChange(): boolean {
        return true;
      }
    },
    name: {
      firstChange: true,
      previousValue: undefined,
      currentValue: 'test',
      isFirstChange(): boolean {
        return true;
      }
    }
  }
}
