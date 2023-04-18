import {TypedSimpleChanges} from "../effect-on-changes$";
import {mapChanges} from "./map-changes";

describe('mapChanges', () => {

  it('should map TypedSimpleChanges to object', () => {
    const changes = createChanges();

    const result = mapChanges(changes);

    expect(result).toEqual({
      id: 1,
      name: 'test'
    });
  });
});

interface TestModel {
  id: number;
  name: string;
}
function createChanges(): TypedSimpleChanges<TestModel>{
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
