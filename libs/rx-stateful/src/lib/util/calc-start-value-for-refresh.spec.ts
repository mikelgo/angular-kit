import {calcStartValueForRefresh} from "./calc-start-value-for-refresh";

describe('calcStartValueForRefresh', () => {
  describe('keepValueOnRefresh ', () => {
    it('should return without value property when keepValueOnRefresh = true', () => {
      const result = calcStartValueForRefresh({ keepValueOnRefresh: true });

      expect(result).not.toHaveProperty('value');
    });
    it('should return with property value = null when keepValueOnRefresh = false', () => {
      const result = calcStartValueForRefresh({ keepValueOnRefresh: false });

      expect(result).toHaveProperty('value', null);
    });
  });
});
