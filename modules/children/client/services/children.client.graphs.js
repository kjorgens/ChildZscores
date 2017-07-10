(function () {
  'use strict';

  var heightGirls = [
    { x: 1,  y: 46.1 },
    { x: 2,  y: 50.8 },
    { x: 3,  y: 54.4 },
    { x: 4,  y: 57.3 },
    { x: 5,  y: 61.7 },
    { x: 6,  y: 63.3 },
    { x: 7,  y: 64.8 },
    { x: 8,  y: 66.2 },
    { x: 9,  y: 67.5 },
    { x: 10, y: 68.7 },
    { x: 11, y: 69.9 },
    { x: 12, y: 71 },
    { x: 13, y: 72.1 },
    { x: 14, y: 73.1 },
    { x: 15, y: 74.1 },
    { x: 16, y: 75 },
    { x: 17, y: 76 },
    { x: 18, y: 76.9 },
    { x: 19, y: 77.7 },
    { x: 20, y: 78.6 },
    { x: 21, y: 79.4 },
    { x: 22, y: 80.2 },
    { x: 23, y: 81 },
    { x: 24, y: 81.4 },
    { x: 25, y: 81.7 },
    { x: 26, y: 82.5 },
    { x: 27, y: 83.1 },
    { x: 28, y: 83.8 },
    { x: 29, y: 84.5 },
    { x: 30, y: 85.1 },
    { x: 31, y: 85.7 },
    { x: 32, y: 86.4 },
    { x: 33, y: 86.9 },
    { x: 34, y: 87.5 },
    { x: 35, y: 88.1 },
    { x: 36, y: 88.7 },
    { x: 37, y: 89.2 },
    { x: 38, y: 89.8 },
    { x: 39, y: 90.3 },
    { x: 40, y: 90.9 },
    { x: 41, y: 91.4 },
    { x: 42, y: 91.9 },
    { x: 43, y: 92.4 },
    { x: 44, y: 93 },
    { x: 45, y: 93.5 },
    { x: 46, y: 94 },
    { x: 47, y: 94.4 },
    { x: 48, y: 94.9 },
    { x: 49, y: 95.4 },
    { x: 50, y: 95.9 },
    { x: 51, y: 96.4 },
    { x: 52, y: 96.9 },
    { x: 53, y: 97.4 },
    { x: 54, y: 97.8 },
    { x: 55, y: 98.3 },
    { x: 56, y: 98.8 },
    { x: 57, y: 99.3 },
    { x: 58, y: 99.7 },
    { x: 59, y: 100.2 },
    { x: 60, y: 100.7 }
 ];

  var weightGirls = [
    { x: 1, y: 0 }

  ];

  var heightBoys = [
    { x: 1, y: 0 }
  ];

  var weightBoys = [
    { x: 1, y: 0 }
  ];

  angular
    .module('children.graphService')
    .factory('GraphService', GraphService);

  GraphService.$inject = [];

  function GraphService() {
    var factory = {};

    factory.getGirlsHeight = function() {
      return heightGirls;
    };

    factory.getGirlsHeight = function() {
      return weightGirls;
    };

    factory.getGirlsHeight = function() {
      return heightBoys;
    };

    factory.getGirlsHeight = function() {
      return weightBoys;
    };

    return factory;
  }
}());

