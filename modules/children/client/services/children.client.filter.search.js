(function () {
  'use strict';

  angular
      .module('children.filterListService')
      .factory('FilterService', FilterService);

  FilterService.$inject = [ 'moment' ];

  function FilterService(moment) {
    var factory = {};
    var currentSearch = '';
    var currentColorFilter = '';
    var currentScreenType = '';
    var singleChildId = '';
    var displayCount = 0;

    factory.getCurrentScreenType = function() {
      return currentScreenType;
    };

    factory.getSingleChildId = function() {
      return singleChildId;
    };

    factory.displayCount = function() {
      return displayCount;
    };

    factory.currentListFilter = function() {
      return currentSearch;
    };

    factory.currentColorFilter = function() {
      return currentColorFilter;
    };

    factory.setCurrentScreenType = function(screenType) {
      currentScreenType = screenType;
    };

    factory.setSearchFilter = function(searchFilter) {
      currentSearch = searchFilter;
    };

    factory.setColorFilter = function(colorFilter) {
      currentColorFilter = colorFilter;
    };

    factory.filterByColor = function(list, statusColor) {
      currentColorFilter = statusColor;
      list.forEach(function(child){
        if (~child.statusColor.indexOf(statusColor)) {
          child.display = true;
        } else {
          child.display = false;
        }
      })
    };

    function sortEm(listIn, sortField) {
      listIn.sort(function(x, y) {
        if (x[sortField].toUpperCase() < y[sortField].toUpperCase()) {
          return -1;
        }
        if (x[sortField].toUpperCase() > y[sortField].toUpperCase()) {
          return 1;
        }
        if (x[sortField].toUpperCase() === y[sortField].toUpperCase()) {
          return 0;
        }
        return 0;
      });
      return(listIn);
    }

    function checkAge (birthDate) {
      return moment(new Date()).diff(moment(birthDate), 'months');
    }


    factory.searchAndFilter = function (list, searchFilter, colorFilter, sortField) {
      displayCount = 0;
      currentSearch = searchFilter;
      currentColorFilter = colorFilter;
      var childId;
      list.forEach (function (child) {
        var currentAge = checkAge(child.birthDate);
        if(child.statusColor === undefined){
          child.statusColor = '';
        }
        child.monthAge = currentAge;
        if ((currentSearch === '' || child.firstName.toUpperCase().startsWith(currentSearch.toUpperCase()))
            && (currentColorFilter === '' || ~child.statusColor.indexOf(currentColorFilter)) && (currentAge < 72 || currentAge > 180)) {
          child.display = true;
          child.backGroundColor = child.statusColor + 'Background';
          displayCount++;
          childId = child._id;
        } else {
          child.display = false;
        }
      });
      if (displayCount === 1) {
        singleChildId = childId;
      }
      return sortEm(list, sortField);
    };
    return factory;
  }
}());