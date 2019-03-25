'use strict';

describe('Bountiful kids E2E Tests:', function () {
  describe('Put an entry into the local database', function () {
    it('should put an entry in Brazil test only local data base', function () {
      browser.get('http://localhost:3000').then(function () {
        element(by.css('[ui-sref="authentication.signin"]')).click();
        expect(element(by.id('username')).isPresent()).toBe(true);
        expect(element(by.id('password')).isPresent()).toBe(true);
        element(by.id('username')).sendKeys('karlj');
        element(by.id('password')).sendKeys('Bobert@3873');
        element(by.css('[type="submit"]')).click();
        expect(element(by.binding('country.name')).isPresent()).toBe(true);
        expect(element(by.css('[ng-bind="country.name"]')).isPresent()).toBe(true);
        expect(element.all(by.repeater('country in vm.liahonaStakes.countries')).count()).toEqual(17);
        var brazil = element.all(by.repeater('country in vm.liahonaStakes.countries')).get(0);
        expect(brazil.element(by.binding('country.name')).getText()).toEqual('Brazil');
        brazil.click();
        expect(element.all(by.repeater('stake in vm.selectedCountry.stakes')).count()).toEqual(4);
        expect(element.all(by.repeater('stake in vm.selectedCountry.stakes')).get(3).element(by.binding('stake.stakeName')).getText()).toEqual('Brazil test Only');
        element.all(by.repeater('stake in vm.selectedCountry.stakes')).get(3).click();
        expect(element.all(by.repeater('child in vm.childList.docs')).count()).toEqual(0);
        var addChild = element(by.className('content')).element(by.className('container')).element(by.className('page-header'));
        addChild.element(by.css('[href="/children/create"]')).click();
        expect(element(by.tagName('form')).isPresent()).toBe(true);
        var form = element(by.className('content')).element(by.className('container'))
            .element(by.className('CreateChildFormContainer'));
        var genderField = form.element(by.model("vm.child.gender")).element(by.css('select option:nth-child(2)')).click();
        var ldsField = form.element(by.model("vm.child.memberStatus")).element(by.css('select option:nth-child(2)')).click();
        // expect(form.element(by.model("vm.child.gender")).element(by.css('select option:nth-child(2)')).getText()).toEqual('Boy');
        // expect(form.element(by.model("vm.child.memberStatus")).element(by.css('select option:nth-child(2)')).getText()).toEqual('Yes');
        form.element(by.id('vm.child.firstName')).sendKeys("Bobby");
        form.element(by.id('vm.child.lastName')).sendKeys("Bastion");
        form.element(by.id('vm.child.monthAge')).sendKeys("34");
        form.element(by.id('vm.child.mother')).sendKeys("Bobbymom");
        form.element(by.id('vm.child.father')).sendKeys("Bobbydad");
        form.element(by.id('vm.child.address')).sendKeys("Somewhere over there");
        form.element(by.id('vm.child.city')).sendKeys("City in the valley");
        element(by.className('content')).element(by.className('container')).element(by.id('savechild')).click();
        var ScreenForm = element(by.className('content')).element(by.className('container')).element(by.className('CreateChildFormContainer'));
        ScreenForm.element(by.id('vm.survey.weight')).sendKeys("12");
        ScreenForm.element(by.id('vm.survey.height')).sendKeys("88");
        ScreenForm.element(by.id('vm.survey.comments')).sendKeys("some comments");
        element(by.className('content')).element(by.className('container')).element(by.css('[ng-click="vm.addSurvey()"]')).click();
      });
    });
  });
});
