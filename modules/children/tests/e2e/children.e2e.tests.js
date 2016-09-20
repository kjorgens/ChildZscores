'use strict';

describe('liahona kids E2E Tests:', function () {
  describe('Test liahona kids page', function () {
    it('Should List countries', function () {
      browser.get('http://localhost:3000/');
      expect(browser.getCurrentUrl()).toBe('http://localhost:3000/');
      browser.waitForAngular().then(function(input) {
        console.log('angular is ready');
      });
      browser.getTitle().then(function(input){
        console.log('title is ' + input);
      });
 //     element.
      element.all(by.repeater('subitem in item.items')).then(function(input) {
        console.log('Whats Here?');
      });

      var brazil = element(by.repeater('subitem in item.items').row(0));
      expect(element(by.repeater('subitem in item.items').row(0))).toBe('Brazil');

      // Enter Invalid Password
//      element(by.model('vm.passwordDetails.newPassword')).sendKeys('p@$$w0rd!!');
      // Click Submit button
 //     element(by.css('button[type=submit]')).click();
      // Password Error
 //     expect(element.all(by.css('.error-text')).get(0).getText()).toBe('The password must contain at least one uppercase letter.');
    });
  });
});
