(function () {
  'use strict';

  var heightGirls = [
    { x: 1, y: 46.1 },
    { x: 2, y: 50.8 },
    { x: 3, y: 54.4 },
    { x: 4, y: 57.3 },
    { x: 5, y: 61.7 },
    { x: 6, y: 63.3 },
    { x: 7, y: 64.8 },
    { x: 8, y: 66.2 },
    { x: 9, y: 67.5 },
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
    { x: 1, y: 3.4 },
    { x: 2, y: 4.3 },
    { x: 3, y: 5 },
    { x: 4, y: 5.6 },
    { x: 5, y: 6 },
    { x: 6, y: 6.4 },
    { x: 7, y: 6.7 },
    { x: 8, y: 6.9 },
    { x: 9, y: 7.1 },
    { x: 10, y: 7.4 },
    { x: 11, y: 7.6 },
    { x: 12, y: 7.7 },
    { x: 13, y: 7.9 },
    { x: 14, y: 8.1 },
    { x: 15, y: 8.3 },
    { x: 16, y: 8.4 },
    { x: 17, y: 8.6 },
    { x: 18, y: 8.8 },
    { x: 19, y: 8.9 },
    { x: 20, y: 9.1 },
    { x: 21, y: 9.2 },
    { x: 22, y: 9.4 },
    { x: 23, y: 9.5 },
    { x: 24, y: 9.7 },
    { x: 25, y: 9.8 },
    { x: 26, y: 10 },
    { x: 27, y: 10.1 },
    { x: 28, y: 10.2 },
    { x: 29, y: 10.4 },
    { x: 30, y: 10.5 },
    { x: 31, y: 10.7 },
    { x: 32, y: 10.8 },
    { x: 33, y: 10.9 },
    { x: 34, y: 11 },
    { x: 35, y: 11.2 },
    { x: 36, y: 11.3 },
    { x: 37, y: 11.4 },
    { x: 38, y: 11.5 },
    { x: 39, y: 11.6 },
    { x: 40, y: 11.8 },
    { x: 41, y: 11.9 },
    { x: 42, y: 12 },
    { x: 43, y: 12.1 },
    { x: 44, y: 12.2 },
    { x: 45, y: 12.4 },
    { x: 46, y: 12.5 },
    { x: 47, y: 12.6 },
    { x: 48, y: 12.7 },
    { x: 49, y: 12.8 },
    { x: 50, y: 12.9 },
    { x: 51, y: 13.1 },
    { x: 52, y: 13.2 },
    { x: 53, y: 13.3 },
    { x: 54, y: 13.4 },
    { x: 55, y: 13.5 },
    { x: 56, y: 13.6 },
    { x: 57, y: 13.7 },
    { x: 58, y: 13.8 },
    { x: 59, y: 14 },
    { x: 60, y: 14.1 }
  ];

  var heightBoys = [
    { x: 1, y: 45.4 },
    { x: 2, y: 49.8 },
    { x: 3, y: 53 },
    { x: 4, y: 55.6 },
    { x: 5, y: 59.6 },
    { x: 6, y: 61.2 },
    { x: 7, y: 62.7 },
    { x: 8, y: 64 },
    { x: 9, y: 65.3 },
    { x: 10, y: 66.5 },
    { x: 11, y: 67.7 },
    { x: 12, y: 68.9 },
    { x: 13, y: 70 },
    { x: 14, y: 71 },
    { x: 15, y: 72 },
    { x: 16, y: 73 },
    { x: 17, y: 74 },
    { x: 18, y: 74.9 },
    { x: 19, y: 75.8 },
    { x: 20, y: 76.7 },
    { x: 21, y: 77.5 },
    { x: 22, y: 78.4 },
    { x: 23, y: 79.2 },
    { x: 24, y: 79.7 },
    { x: 25, y: 80 },
    { x: 26, y: 80.8 },
    { x: 27, y: 81.5 },
    { x: 28, y: 82.2 },
    { x: 29, y: 82.9 },
    { x: 30, y: 83.6 },
    { x: 31, y: 84.3 },
    { x: 32, y: 84.9 },
    { x: 33, y: 85.6 },
    { x: 34, y: 86.2 },
    { x: 35, y: 86.8 },
    { x: 36, y: 87.4 },
    { x: 37, y: 88 },
    { x: 38, y: 88.6 },
    { x: 39, y: 89.2 },
    { x: 40, y: 89.8 },
    { x: 41, y: 90.4 },
    { x: 42, y: 90.9 },
    { x: 43, y: 91.5 },
    { x: 44, y: 92 },
    { x: 45, y: 92.5 },
    { x: 46, y: 93.1 },
    { x: 47, y: 93.6 },
    { x: 48, y: 94.1 },
    { x: 49, y: 94.6 },
    { x: 50, y: 95.1 },
    { x: 51, y: 95.6 },
    { x: 52, y: 96.1 },
    { x: 53, y: 96.6 },
    { x: 54, y: 97.1 },
    { x: 55, y: 97.7 },
    { x: 56, y: 98.1 },
    { x: 57, y: 98.5 },
    { x: 58, y: 99 },
    { x: 59, y: 99.5 },
    { x: 60, y: 99.9 }
  ];

  var weightBoys = [
    { x: 1, y: 3.2 },
    { x: 2, y: 3.9 },
    { x: 3, y: 4.5 },
    { x: 4, y: 5 },
    { x: 5, y: 5.4 },
    { x: 6, y: 5.7 },
    { x: 7, y: 6 },
    { x: 8, y: 6.3 },
    { x: 9, y: 6.5 },
    { x: 10, y: 6.7 },
    { x: 11, y: 6.9 },
    { x: 12, y: 7 },
    { x: 13, y: 7.2 },
    { x: 14, y: 7.4 },
    { x: 15, y: 7.6 },
    { x: 16, y: 7.7 },
    { x: 17, y: 7.9 },
    { x: 18, y: 8.1 },
    { x: 19, y: 8.2 },
    { x: 20, y: 8.4 },
    { x: 21, y: 8.6 },
    { x: 22, y: 8.7 },
    { x: 23, y: 8.9 },
    { x: 24, y: 9 },
    { x: 25, y: 9.2 },
    { x: 26, y: 9.4 },
    { x: 27, y: 9.5 },
    { x: 28, y: 9.7 },
    { x: 29, y: 9.8 },
    { x: 30, y: 10 },
    { x: 31, y: 10.1 },
    { x: 32, y: 10.3 },
    { x: 33, y: 10.4 },
    { x: 34, y: 10.5 },
    { x: 35, y: 10.7 },
    { x: 36, y: 10.8 },
    { x: 37, y: 10.9 },
    { x: 38, y: 11.1 },
    { x: 39, y: 11.2 },
    { x: 40, y: 11.3 },
    { x: 41, y: 11.5 },
    { x: 42, y: 11.6 },
    { x: 43, y: 11.7 },
    { x: 44, y: 11.8 },
    { x: 45, y: 12 },
    { x: 46, y: 12.1 },
    { x: 47, y: 12.2 },
    { x: 48, y: 12.3 },
    { x: 49, y: 12.4 },
    { x: 50, y: 12.6 },
    { x: 51, y: 12.7 },
    { x: 52, y: 12.8 },
    { x: 53, y: 12.9 },
    { x: 54, y: 13 },
    { x: 55, y: 13.2 },
    { x: 56, y: 13.3 },
    { x: 57, y: 13.4 },
    { x: 58, y: 13.5 },
    { x: 59, y: 13.6 },
    { x: 60, y: 13.7 }
  ];

  var weightPerHeightGirls = [
    { x: 46.1, y: 3.4 },
    { x: 50.8, y: 4.3 },
    { x: 54.4, y: 5 },
    { x: 57.3, y: 5.6 },
    { x: 61.7, y: 6 },
    { x: 63.3, y: 6.4 },
    { x: 64.8, y: 6.7 },
    { x: 66.2, y: 6.9 },
    { x: 67.5, y: 7.1 },
    { x: 68.7, y: 7.4 },
    { x: 69.9, y: 7.6 },
    { x: 71, y: 7.7 },
    { x: 72.1, y: 7.9 },
    { x: 73.1, y: 8.1 },
    { x: 74.1, y: 8.3 },
    { x: 75, y: 8.4 },
    { x: 76, y: 8.6 },
    { x: 76.9, y: 8.8 },
    { x: 77.7, y: 8.9 },
    { x: 78.6, y: 9.1 },
    { x: 79.4, y: 9.2 },
    { x: 80.2, y: 9.4 },
    { x: 81, y: 9.5 },
    { x: 81.4, y: 9.7 },
    { x: 81.7, y: 9.8 },
    { x: 82.5, y: 10 },
    { x: 83.1, y: 10.1 },
    { x: 83.8, y: 10.2 },
    { x: 84.5, y: 10.4 },
    { x: 85.1, y: 10.5 },
    { x: 85.7, y: 10.7 },
    { x: 86.4, y: 10.8 },
    { x: 86.9, y: 10.9 },
    { x: 87.5, y: 11 },
    { x: 88.1, y: 11.2 },
    { x: 88.7, y: 11.3 },
    { x: 89.2, y: 11.4 },
    { x: 89.8, y: 11.5 },
    { x: 90.3, y: 11.6 },
    { x: 90.9, y: 11.8 },
    { x: 91.4, y: 11.9 },
    { x: 91.9, y: 12 },
    { x: 92.4, y: 12.1 },
    { x: 93, y: 12.2 },
    { x: 93.5, y: 12.4 },
    { x: 94, y: 12.5 },
    { x: 94.4, y: 12.6 },
    { x: 94.9, y: 12.7 },
    { x: 95.4, y: 12.8 },
    { x: 95.9, y: 12.9 },
    { x: 96.4, y: 13.1 },
    { x: 96.9, y: 13.2 },
    { x: 97.4, y: 13.3 },
    { x: 97.8, y: 13.4 },
    { x: 98.3, y: 13.5 },
    { x: 98.8, y: 13.6 },
    { x: 99.3, y: 13.7 },
    { x: 99.7, y: 13.8 },
    { x: 100.2, y: 14 },
    { x: 100.7, y: 14.1 }
  ];

  var weightPerHeightBoys = [
    { x: 45.5, y: 3.2 },
    { x: 49.8, y: 3.9 },
    { x: 53, y: 4.5 },
    { x: 55.6, y: 5 },
    { x: 59.6, y: 5.4 },
    { x: 61.2, y: 5.7 },
    { x: 62.7, y: 6 },
    { x: 64, y: 6.3 },
    { x: 65.3, y: 6.5 },
    { x: 66.5, y: 6.7 },
    { x: 67.7, y: 6.9 },
    { x: 68.9, y: 7 },
    { x: 70, y: 7.2 },
    { x: 71, y: 7.4 },
    { x: 72, y: 7.6 },
    { x: 73, y: 7.7 },
    { x: 74, y: 7.9 },
    { x: 74.9, y: 8.1 },
    { x: 75.8, y: 8.2 },
    { x: 76.7, y: 8.4 },
    { x: 77.5, y: 8.6 },
    { x: 78.4, y: 8.7 },
    { x: 79.2, y: 8.9 },
    { x: 79.7, y: 9 },
    { x: 80, y: 9.2 },
    { x: 80.8, y: 9.4 },
    { x: 81.5, y: 9.5 },
    { x: 82.2, y: 9.7 },
    { x: 82.9, y: 9.8 },
    { x: 83.6, y: 10 },
    { x: 84.3, y: 10.1 },
    { x: 84.9, y: 10.3 },
    { x: 85.6, y: 10.4 },
    { x: 86.2, y: 10.5 },
    { x: 86.8, y: 10.7 },
    { x: 87.4, y: 10.8 },
    { x: 88, y: 10.9 },
    { x: 88.6, y: 11.1 },
    { x: 89.2, y: 11.2 },
    { x: 89.8, y: 11.3 },
    { x: 90.4, y: 11.5 },
    { x: 90.9, y: 11.6 },
    { x: 91.5, y: 11.7 },
    { x: 92, y: 11.8 },
    { x: 92.5, y: 12 },
    { x: 93.1, y: 12.1 },
    { x: 93.6, y: 12.2 },
    { x: 94.1, y: 12.3 },
    { x: 94.6, y: 12.4 },
    { x: 95.1, y: 12.6 },
    { x: 95.6, y: 12.7 },
    { x: 96.1, y: 12.8 },
    { x: 96.6, y: 12.9 },
    { x: 97.1, y: 13 },
    { x: 97.7, y: 13.2 },
    { x: 98.1, y: 13.3 },
    { x: 98.5, y: 13.4 },
    { x: 99, y: 13.5 },
    { x: 99.5, y: 13.6 },
    { x: 99.9, y: 13.7 }
  ];

  angular
      .module('children.graphService')
      .factory('GraphService', GraphService);


  GraphService.$inject = ['$translate', '$rootScope'];

  function GraphService($translate, $rootScope) {

    var factory = {};
    // var vm = this;
    // //var minHealth;
    // function performTranslation() {
    //   $translate(['MIN_HEALTH']).then(function (translations) {
    //     vm.minHealth = translations.MIN_HEALTH;
    //   });
    // }

   // performTranslation();
   //  $rootScope.$on('$translateChangeSuccess', function () {
   //    performTranslation();
   //  });

    factory.setupHeightChart = function (heatlthHeight, childHeightH, childAgeH) {
      //performTranslation();
      return {
        chart: {
          type: 'scatterChart',
          yDomain: [45, 110],
          height: 200,
          width: 400,
          scatter: {
            onlyCircles: false
          },
          margin: {
            top: 20,
            right: 20,
            bottom: 40,
            left: 55
          },
          x: function (d) {
            return d.x;
          },
          y: function (d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          dispatch: {
            stateChange: function (e) {
              console.log('stateChange');
            },
            changeState: function (e) {
              console.log('changeState');
            },
            tooltipShow: function (e) {
              console.log('tooltipShow');
            },
            tooltipHide: function (e) {
              console.log('tooltipHide');
            }
          },
          xAxis: {
            axisLabel: (childAgeH),
            tickFormat: function(d) {
              return d3.format('s')(d);
            }
          },
          yAxis: {
            axisLabel: (childHeightH),
            tickFormat: function (d) {
              return d3.format('s')(d);
            },
            axisLabelDistance: -10
          },
          callback: function (chart) {
            console.log('!!! lineChart callback !!!');
          }
        },
        title: {
          enable: true,
          text: (heatlthHeight)
        },
        subtitle: {
          enable: false,
          // text: 'Subtitle for simple line chart. Lorem ipsum dolor sit amet, at eam blandit sadipscing, vim adhuc sanctus disputando ex, cu usu affert alienum urbanitas.',
          css: {
            'text-align': 'center',
            'margin': '10px 13px 0px 7px'
          }
        },
        caption: {
          enable: false,
          html: '<b>Figure 1.</b> Lorem ipsum dolor sit amet, at eam blandit sadipscing, <span style="text-decoration: underline;">vim adhuc sanctus disputando ex</span>, cu usu affert alienum urbanitas. <i>Cum in purto erat, mea ne nominavi persecuti reformidans.</i> Docendi blandit abhorreant ea has, minim tantas alterum pro eu. <span style="color: darkred;">Exerci graeci ad vix, elit tacimates ea duo</span>. Id mel eruditi fuisset. Stet vidit patrioque in pro, eum ex veri verterem abhorreant, id unum oportere intellegam nec<sup>[1, <a href="https://github.com/krispo/angular-nvd3" target="_blank">2</a>, 3]</sup>.',
          css: {
            'text-align': 'justify',
            'margin': '10px 13px 0px 7px'
          }
        }
      };
    };

    factory.setupWeightChart = function (heatlthWeight, childWeightW, childAgeW) {
      return {
        chart: {
          type: 'scatterChart',
          height: 200,
          width: 400,
          margin: {
            top: 20,
            right: 20,
            bottom: 40,
            left: 55
          },
          x: function (d) {
            return d.x;
          },
          y: function (d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          dispatch: {
            stateChange: function (e) {
              console.log('stateChange');
            },
            changeState: function (e) {
              console.log('changeState');
            },
            tooltipShow: function (e) {
              console.log('tooltipShow');
            },
            tooltipHide: function (e) {
              console.log('tooltipHide');
            }
          },
          xAxis: {
            axisLabel: (childAgeW)
          },
          yAxis: {
            axisLabel: (childWeightW),
            tickFormat: function (d) {
              return d3.format('s')(d);
            },
            axisLabelDistance: -10
          },
          callback: function (chart) {
            console.log('!!! lineChart callback !!!');
          }
        },
        title: {
          enable: true,
          text: (heatlthWeight)
          // color: 'Purple'
        },
        subtitle: {
          enable: false,
          // text: 'Subtitle for simple line chart. Lorem ipsum dolor sit amet, at eam blandit sadipscing, vim adhuc sanctus disputando ex, cu usu affert alienum urbanitas.',
          css: {
            'text-align': 'center',
            'margin': '10px 13px 0px 7px'
          }
        },
        caption: {
          enable: false,
          html: '<b>Figure 1.</b> Lorem ipsum dolor sit amet, at eam blandit sadipscing, <span style="text-decoration: underline;">vim adhuc sanctus disputando ex</span>, cu usu affert alienum urbanitas. <i>Cum in purto erat, mea ne nominavi persecuti reformidans.</i> Docendi blandit abhorreant ea has, minim tantas alterum pro eu. <span style="color: darkred;">Exerci graeci ad vix, elit tacimates ea duo</span>. Id mel eruditi fuisset. Stet vidit patrioque in pro, eum ex veri verterem abhorreant, id unum oportere intellegam nec<sup>[1, <a href="https://github.com/krispo/angular-nvd3" target="_blank">2</a>, 3]</sup>.',
          css: {
            'text-align': 'justify',
            'margin': '10px 13px 0px 7px'
          }
        }
      };
    };

    factory.setupWeightPerHeightChart = function (title, weight, height) {
      return {
        chart: {
          type: 'scatterChart',
          height: 200,
          width: 400,
          margin: {
            top: 20,
            right: 20,
            bottom: 40,
            left: 55
          },
          x: function (d) {
            return d.x;
          },
          y: function (d) {
            return d.y;
          },
          useInteractiveGuideline: true,
          dispatch: {
            stateChange: function (e) {
              console.log('stateChange');
            },
            changeState: function (e) {
              console.log('changeState');
            },
            tooltipShow: function (e) {
              console.log('tooltipShow');
            },
            tooltipHide: function (e) {
              console.log('tooltipHide');
            }
          },
          xAxis: {
            axisLabel: (height)
          },
          yAxis: {
            axisLabel: (weight),
            tickFormat: function (d) {
              return d3.format('s')(d);
            },
            axisLabelDistance: -10
          },
          callback: function (chart) {
            console.log('!!! lineChart callback !!!');
          }
        },
        title: {
          enable: true,
          text: (title)
          // color: 'Purple'
        },
        subtitle: {
          enable: false,
          // text: 'Subtitle for simple line chart. Lorem ipsum dolor sit amet, at eam blandit sadipscing, vim adhuc sanctus disputando ex, cu usu affert alienum urbanitas.',
          css: {
            'text-align': 'center',
            'margin': '10px 13px 0px 7px'
          }
        },
        caption: {
          enable: false,
          html: '<b>Figure 1.</b> Lorem ipsum dolor sit amet, at eam blandit sadipscing, <span style="text-decoration: underline;">vim adhuc sanctus disputando ex</span>, cu usu affert alienum urbanitas. <i>Cum in purto erat, mea ne nominavi persecuti reformidans.</i> Docendi blandit abhorreant ea has, minim tantas alterum pro eu. <span style="color: darkred;">Exerci graeci ad vix, elit tacimates ea duo</span>. Id mel eruditi fuisset. Stet vidit patrioque in pro, eum ex veri verterem abhorreant, id unum oportere intellegam nec<sup>[1, <a href="https://github.com/krispo/angular-nvd3" target="_blank">2</a>, 3]</sup>.',
          css: {
            'text-align': 'justify',
            'margin': '10px 13px 0px 7px'
          }
        }
      };
    };

    factory.getChartDataHeight = function(zscoreData, gender, ageC, age) {
      return [
        {
          values: gender === 'Boy' ? getBoysHeight(zscoreData) : getGirlsHeight(zscoreData),      // values - represents the array of {x,y} data points
          key: ageC, // key  - the name of the series.
          color: 'Purple'  // color - optional: choose your own line color.
        },
        // {
        //   values: heightGirls,
        //   key: 'Expected Height Low',
        //   color: '#ff7f0e'
        // },
        {
          values: zscoreData,
          key: age,
          color: 'Black'
        }
      ];
    };

    factory.getChartDataWeight = function(zscoreData, gender) {
      return [
        {
          values: gender === 'Boy' ? getBoysWeight(zscoreData) : getGirlsWeight(zscoreData),      // values - represents the array of {x,y} data points
          key: 'Weight/Age Curve', // key  - the name of the series.
          color: 'blue'  // color - optional: choose your own line color.
        },
        // {
        //   values: weightGirls,
        //   key: 'Expected Weight Low',
        //   color: 'red'
        // },
        {
          values: zscoreData,
          key: 'Childs Weight Curve',
          color: 'Black'
        }
      ];
    };

    factory.getChartDataWeightPerHeight = function(zscoreData, gender) {
      return [
        {
          values: gender === 'Boy' ? getBoysWeightPerHeight(zscoreData) : getGirlsWeightPerHeight(zscoreData),       // values - represents the array of {x,y} data points
          key: 'Weight/Height Curve', // key  - the name of the series.
          color: '#cc0000'  // color - optional: choose your own line color.
        },
        // {
        //   values: weightPerHeightGirls,
        //   key: 'Expected Weight Low',
        //   color: 'red'
        // },
        {
          values: zscoreData,
          key: 'Zscore',
          color: 'Black'
        }
      ];
    };

    function getGirlsHeight(survey) {
      var startHa = survey[0].x - 5;
      var endHa = survey[0].x + 5;
      return heightGirls; // .slice(startHa, endHa);
    }

    function getBoysHeight(survey) {
      var startHa = survey[0].x - 5;
      var endHa = survey[0].x + 5;
      return heightBoys; // .slice(startHa, endHa);
    }

    function getGirlsWeight(survey) {
      var startWa = survey[0].x - 5;
      var endWa = survey[survey.length - 1].x + 5;
      return weightGirls; // .slice(startWa, endWa);
    }

    function getBoysWeight(survey) {
      var startWa = survey[0].x - 5;
      var endWa = survey[survey.length - 1].x + 5;
      return weightBoys;  // .slice(startWa, endWa);
    }

    function getGirlsWeightPerHeight(survey) {
      var startWH = survey[0].x - 5;
      var endWH = survey[survey.length - 1].x + 5;
      return weightPerHeightGirls; // .slice(startWH, endWH);
    }

    function getBoysWeightPerHeight(survey) {
      var startWH = survey[0].x - 5;
      var endWH = survey[survey.length - 1].x + 5;
      return weightPerHeightBoys; // .slice(startWH, endWH)
    }

    return factory;
  }


}());

