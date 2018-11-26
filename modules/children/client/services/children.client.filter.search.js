(function () {
  'use strict';

  angular
    .module('children.filterListService')
    .factory('FilterService', FilterService);

  FilterService.$inject = ['moment'];

  function FilterService(moment) {
    var factory = {};
    var currentSearch = '';
    var currentColorFilter = '';
    var currentScreenType = '';
    var singleChildId = '';
    var displayCount = 0;
    var currentChildList;

    factory.setCurrentChildList = function(list) {
      currentChildList = list;
    };

    factory.getCurrentChildList = function() {
      return currentChildList;
    };

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
      });
    };

    function sortEm(listIn, sortField) {
      listIn.sort(function(x, y) {
        if (x[sortField] === undefined || y[sortField] === undefined) {
          console.log('missing info for ' + x._id + ' or ' + y._id);
          return 0;
        }
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
      return (listIn);
    }

    function checkAge (birthDate) {
      return moment(new Date()).diff(new Date(birthDate), 'months');
    }

    factory.matchName = function (list, currentChild) {
      return list.find(function(child) {
        return (~child.firstName.toUpperCase().indexOf(currentChild.firstName.toUpperCase())
          && ~child.lastName.toUpperCase().indexOf(currentChild.lastName.toUpperCase()));
      });
    };

    factory.matchNameAndAge = function(list, currentChild) {
      return list.some(function(child) {
        return (~child.firstName.toUpperCase().indexOf(currentChild.firstName.toUpperCase())
          && ~child.lastName.toUpperCase().indexOf(currentChild.lastName.toUpperCase())
          && child.monthAge === currentChild.monthAge);
      });
    };

    factory.searchAndFilterRegex = function (list, searchFilter, colorFilter, sortField) {
      displayCount = 0;
      currentSearch = searchFilter;
      currentColorFilter = colorFilter;
      var childId;

      if (searchFilter.length > 0) {
        let [firstName, lastName] = searchFilter.split(' ');

        list.forEach((child) => {
          var currentAge = checkAge(child.birthDate);
          if (child.statusColor === undefined) {
            child.statusColor = '';
          }
          let fnmatch = child.firstName.match(new RegExp(firstName, 'i'));
          let lnMatch = lastName === undefined || child.lastName.match(new RegExp(lastName, 'i'));
          let colorThing = (~child.statusColor.indexOf(currentColorFilter));

          child.display = false;
          if (child.firstName.match(new RegExp(firstName, 'i'))) {
            if (currentColorFilter === '' || ~child.statusColor.indexOf(currentColorFilter)) {
              if (currentAge < 60) {
                if (lastName === undefined || child.lastName.match(new RegExp(lastName, 'i'))) {
                  child.display = true;
                  child.backGroundColor = child.statusColor + 'Background';
                  displayCount += 1;
                  childId = child._id;
                  child.display = true;
                }
              }
            }
          }
        });
      } else {
        list.forEach((child) => {
          child.display = false;
          if (currentColorFilter === '' || ~child.statusColor.indexOf(currentColorFilter)) {
            child.display = true;
            child.backGroundColor = child.statusColor + 'Background';
            displayCount += 1;
            childId = child._id;
            child.display = true;
          }
        });
      }
      if (displayCount === 1) {
        singleChildId = childId;
      }
      return sortEm(list, sortField);
    };

    factory.searchAndFilter = function (list, searchFilter, colorFilter, sortField) {
      displayCount = 0;
      currentSearch = searchFilter;
      currentColorFilter = colorFilter;
      var childId;
      list.forEach(function (child) {
        var currentAge = checkAge(child.birthDate);
        if (child.statusColor === undefined) {
          child.statusColor = '';
        }
        child.monthAge = currentAge;
        if ((currentSearch === '' || child.firstName.toUpperCase().startsWith(currentSearch.toUpperCase())) &&
          (currentColorFilter === '' || ~child.statusColor.indexOf(currentColorFilter)) &&
          // (currentAge < 72 || currentAge > 180)) {
          (currentAge < 60)) {
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
