'use strict';

describe('Children E2E Tests:', function () {
  describe('Test children page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/children');
      expect(element.all(by.repeater('child in children')).count()).toEqual(0);
    });
  });
});
