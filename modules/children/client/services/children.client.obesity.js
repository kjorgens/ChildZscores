(function () {
  'use strict';

  var obesityGirls = [
    15.5,
    17.0,
    18.4,
    19.0,
    19.4,
    19.6,
    19.6,
    19.6,
    19.6,
    19.4,
    19.3,
    19.1,
    19.0,
    18.8,
    18.7,
    18.6,
    18.4,
    18.3,
    18.2,
    18.1,
    18.1,
    18.0,
    17.9,
    17.9,
    17.8,
    18.1,
    18.1,
    18.0,
    18.0,
    18.0,
    17.9,
    17.9,
    17.9,
    17.9,
    17.9,
    17.8,
    17.8,
    17.8,
    17.8,
    17.8,
    17.8,
    17.8,
    17.8,
    17.8,
    17.8,
    17.8,
    17.8,
    17.9,
    17.9,
    17.9,
    17.9,
    17.9,
    17.9,
    17.9,
    18.0,
    18.0,
    18.0,
    18.0,
    18.0,
    18.1,
    18.1
  ];

  var obesityBoys = [
    15.8,
    17.3,
    18.8,
    19.4,
    19.7,
    19.8,
    19.9,
    19.9,
    19.8,
    19.7,
    19.5,
    19.4,
    19.2,
    19.1,
    18.9,
    18.8,
    18.7,
    18.6,
    18.5,
    18.4,
    18.3,
    18.2,
    18.1,
    18.0,
    18.0,
    18.3,
    18.2,
    18.2,
    18.1,
    18.1,
    18.0,
    18.0,
    18.0,
    17.9,
    17.9,
    17.9,
    17.8,
    17.8,
    17.8,
    17.7,
    17.7,
    17.7,
    17.7,
    17.7,
    17.7,
    17.6,
    17.6,
    17.6,
    17.6,
    17.6,
    17.6,
    17.6,
    17.6,
    17.6,
    17.6,
    17.6,
    17.6,
    17.6,
    17.6,
    17.7,
    17.7
  ];

  angular
    .module('children.obesityService')
    .factory('Obesity', Obesity);

  Obesity.$inject = [];

  function Obesity() {
    var getObesity = function (child, latestScreen) {
      var bmi = latestScreen.weight / (Math.pow(latestScreen.height / 100, 2));
      var tableBMI = latestScreen.gender === 'Girl' ? obesityGirls[Math.round(latestScreen.monthAge)] : obesityBoys[Math.round(latestScreen.monthAge)];
      return ({ obese: bmi > tableBMI, currentBMI: bmi });
    };

    return { getObesity: getObesity };
  }
}());
