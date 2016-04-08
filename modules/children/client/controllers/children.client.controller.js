(function () {
  'use strict';

  angular
    .module('children')
    .controller('ChildrenController', ChildrenController);

  ChildrenController.$inject = ['$rootScope', '$scope', '$state', '$timeout', 'moment', 'childResolve', 'ModalService', 'Authentication', 'ZScores', 'PouchService'];

  function ChildrenController($rootScope, $scope, $state, $timeout, moment, child, ModalService, Authentication, ZScores, PouchService) {
    var vm = this;
    var editChild = false;
    if ($state.params.childId) {
      editChild = true;
      vm.child = child;
      // vm.child.stake = $rootScope.selectedStake;
      vm.ageIsValid = true;
      vm.firstNameIsValid = true;
      vm.lastNameIsValid = true;
      vm.genderIsValid = true;
      vm.motherIsValid = true;
      vm.fatherIsValid = true;
      vm.birthdateIsValid = true;
      vm.stakeIsValid = true;
      vm.entermonthAge = child.monthAge;
      vm.birthDate = new Date(child.birthDate);
      PouchService.getSurveys(vm.child._id, setSurveyList, surveyErrors);
    } else {
      vm.ageIsValid = false;
      vm.stake = $rootScope.selectedStake;
      vm.firstNameIsValid = false;
      vm.lastNameIsValid = false;
      vm.genderIsValid = false;
      vm.birthdateIsValid = false;
 //     vm.stakeIsValid = false;
      vm.surveyDate = new Date();
    }

    vm.appIsOffline = !$rootScope.appOnline;

    vm.userHasAdminRole = false;
    vm.userHasUserRole = false;

    vm.authentication = Authentication;
    if (vm.authentication.user.roles !== undefined && vm.authentication.user.roles !== null) {
      vm.authentication.user.roles.forEach(function (role) {
        if (role.indexOf('admin') !== -1) {
          vm.userHasAdminRole = true;
        }
        if (role.indexOf('user') !== -1) {
          vm.userHasUserRole = true;
        }
      });
    }
    vm.error = null;
    vm.form = {};
    vm.enteredMonthAge = undefined;
    vm.remove = remove;
    vm.create = create;
    vm.update = update;
    vm.find = find;
    vm.findOne = findOne;
    vm.setMonthCount = setMonthCount;
    vm.today = today;

    vm.checkFirstNameIsValid = checkFirstNameIsValid;
    vm.checkLastNameIsValid = checkLastNameIsValid;
    vm.checkGenderIsValid = checkGenderIsValid;
    vm.checkStakeIsValid = checkStakeIsValid;
    vm.checkAgeIsValid = checkAgeIsValid;
    vm.checkEnteredAgeIsValid = checkEnteredAgeIsValid;
    vm.checkAllFieldsValid = checkAllFieldsValid;

    function gradeZScores(survey) {
      if (survey.zScore.ha < -3) {
        vm.haStatus = 'dangerZscore';
        vm.child.screeningStatus = 'dangerZscore';
      } else {
        if (survey.zScore.ha < -2) {
          if (vm.child.screeningStatus !== 'dangerZscore') {
            vm.child.screeningStatus = 'marginalZscore';
          }
          vm.haStatus = 'marginalZscore';
        } else {
          vm.haStatus = 'normalZscore';
        }
      }
      if (survey.zScore.wa < -3) {
        vm.waStatus = 'dangerZscore';
        vm.child.screeningStatus = 'dangerZscore';
      } else {
        if (survey.zScore.wa < -2) {
          if (vm.child.screeningStatus !== 'dangerZscore') {
            vm.child.screeningStatus = 'marginalZscore';
          }
          vm.waStatus = 'marginalZscore';
        } else {
          vm.waStatus = 'normalZscore';
        }
      }
      if (survey.zScore.wl < -3) {
        vm.wlStatus = 'dangerZscore';
        vm.child.screeningStatus = 'dangerZscore';
      } else {
        if (survey.zScore.wl < -2) {
          if (vm.child.screeningStatus !== 'dangerZscore') {
            vm.child.screeningStatus = 'marginalZscore';
          }
          vm.wlStatus = 'marginalZscore';
        } else {
          vm.wlStatus = 'normalZscore';
        }
      }
    }

    function setSurveyList(surveys) {
      $scope.$apply(function() {
        vm.surveys = surveys.docs;
 //       vm.surveys.forEach(function(survey) {
        if (vm.surveys.length > 0) {
          gradeZScores(vm.surveys[0]);
        }
 //       });
      });
    }

    function surveyErrors(error) {
      vm.surveyError = error;
    }

    function checkAllFieldsValid() {
      checkFirstNameIsValid();
      checkLastNameIsValid();
      checkGenderIsValid();
      checkStakeIsValid();
      checkAgeIsValid();

      if (vm.firstNameIsValid === true && vm.lastNameIsValid === true &&
          vm.genderIsalid === true && vm.ageIsValid === true) {
        vm.allFieldsValid = true;
      } else {
        vm.allFieldsValid = false;
      }
    }

    function setMonthAge() {

    }

    function setMonthCount() {
      var months;
      var rightNow = new Date();
      vm.monthAge = moment(rightNow).diff(moment(vm.birthDate), 'months');
      if (vm.monthAge > 60) {
        vm.ageIsValid = false;
      } else {
        vm.ageIsValid = true;
        vm.child.monthAge = vm.enteredMonthAge || vm.monthAge.toFixed(2);
      }
    }

    function checkFirstNameIsValid() {
      if (vm.child.firstName) {
        if (vm.child.firstName.length < 1 || vm.child.firstName.length > 25) {
          vm.firstNameIsValid = false;
        } else {
          vm.firstNameIsValid = true;
        }
      } else {
        vm.firstNameIsValid = false;
      }
    }

    function checkLastNameIsValid() {
      if (vm.child.lastName) {
        if (vm.child.lastName.length < 1 || vm.child.lastName.length > 25) {
          vm.lastNameIsValid = false;
        } else {
          vm.lastNameIsValid = true;
        }
      } else {
        vm.lastNameIsValid = false;
      }
    }

    function checkGenderIsValid() {
      if (vm.child.gender === 'Boy' || vm.child.gender === 'Girl') {
        vm.genderIsValid = true;
      } else {
        vm.genderIsValid = false;
      }
    }

    function checkMotherIsValid() {
      if (vm.child.mother) {
        if (vm.child.mother.length < 1 || vm.child.mother.length > 25) {
          vm.motherIsValid = false;
        } else {
          vm.motherIsValid = true;
        }
      } else {
        vm.motherIsValid = false;
      }
    }

    function checkFatherIsValid() {
      if (vm.child.father) {
        if (vm.child.father.length < 1 || vm.child.father.length > 25) {
          vm.fatherIsValid = false;
        } else {
          vm.fatherIsValid = true;
        }
      } else {
        vm.fatherIsValid = false;
      }
    }

    function checkStakeIsValid () {
      if (vm.child.stake) {
        if (vm.child.stake.length < 1 || vm.child.stake.length > 25) {
          vm.stakeIsValid = false;
        } else {
          vm.stakeIsValid = true;
        }
      } else {
        vm.stakeIsValid = false;
      }
    }

    function checkWardIsValid () {
      if (vm.child.ward) {
        if (vm.child.ward.length < 1 || vm.child.ward.length > 25) {
          vm.wardIsValid = false;
        } else {
          vm.wardIsValid = true;
        }
      } else {
        vm.wardIsValid = false;
      }
    }

    function today() {
      vm.dt = new Date();
    }
    vm.today();

    vm.clear = function () {
      vm.dt = null;
    };

    vm.toggleMin = function () {
      vm.minDate = vm.minDate ? null : new Date();
    };
    vm.toggleMin();
    vm.maxDate = new Date();
    var year = vm.maxDate.getFullYear();
    var month = vm.maxDate.getMonth();
    var day = vm.maxDate.getDate();
    vm.minStartDate = new Date(year - 5, month, day);

    function checkEnteredAgeIsValid() {
      if (vm.enteredMonthAge < 1 || vm.enteredMonthAge > 60) {
        vm.ageIsValid = false;
      } else {
        vm.ageIsValid = true;
        vm.birthDate = new Date(year, month - vm.enteredMonthAge, day);
        vm.ageIsValid = true;
        vm.child.monthAge = vm.enteredMonthAge;
      }
    }

    function checkAgeIsValid() {
      var rightNow = new Date();
      vm.monthAge = moment(rightNow).diff(moment(vm.birthDate), 'months');
      if (vm.monthAge > 60) {
        vm.ageIsValid = false;
      } else {
        vm.ageIsValid = true;
        vm.child.monthAge = vm.enteredMonthAge || vm.monthAge.toFixed(2);
        vm.enteredMonthAge = vm.child.monthAge;
      }
    }

    function updated(child) {
      vm.child = child;
    }

    function childUpdated(child) {
      $state.go('children.view', { childId: child.id });
    }

    function addedError(error) {
      vm.newChildError = error;
    }

    function newChild(childCreated) {
      vm.child = childCreated;
      $state.go('children.newsurvey', { childId: vm.child.id });
    }

    function errorHandle(error) {
      vm.newChildError = error;
    }
    // Create new Child
    function create(isValid) {
      if (vm.child._id) {
        PouchService.insert(vm.child, childUpdated, addedError);
      } else {
        vm.error = null;
        if (!isValid) {
          $scope.$broadcast('show-errors-check-validity', 'childForm');

          return false;
        }

        var childObject = {
          created: vm.dt,
          monthAge: vm.child.monthAge || vm.enteredMonthAge,
          gender: vm.child.gender,
          birthDate: vm.birthDate,
          firstName: vm.child.firstName,
          lastName: vm.child.lastName,
          comments: vm.child.comments,
          father: vm.child.father,
          mother: vm.child.mother,
          address: vm.child.address,
          city: vm.child.city,
          stake: vm.child.stake,
          ward: vm.child.ward,
          screeningStatus: vm.screeningStatus,
          interviewer: vm.authentication.user.displayName
        };

        PouchService.insert(childObject, newChild, errorHandle);

        vm.child.firstName = '';
        vm.child.lastName = '';
        vm.child.gender = '';
        vm.child.comments = '';
        vm.child.father = '';
        vm.child.mother = '';
        vm.child.address = '';
        vm.child.city = '';
        vm.child.stake = '';
        vm.child.ward = '';
        // vm.created = Date.now;
        // vm.birthdate = '';
        // vm.monthAge = 0;
        // vm.firstName = '';
        // vm.lastName = '';
        // vm.comments = '';
        // vm.father = '';
        // vm.mother = '';
        // vm.address = '';
        // vm.city = '';
        // vm.stake = '';
        // vm.ward = '';
      }
    }

    var removeResponse = function (res) {
      vm.remResponse = res;
    };

    var removeError = function (error) {
      vm.remError = error;
    };

    // Remove existing Child
    function remove(child) {
      if (child) {
        vm.surveys.forEach(function(toRemove) {
          PouchService.remove(toRemove, removeResponse, removeError);
        });
        PouchService.remove(child, removeResponse, removeError);
        $state.go('children.list');
      }
    }

    // Update existing Child
    function update(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'childForm');
        return false;
      }
      var child = vm.child;
      PouchService.put(child);
    }

    var setChildren = function (res) {
      vm.children = res;
    };

    var listChildrenErrors = function (error) {
      vm.error = error;
    };

    // Find a list of Children
    function find() {
      PouchService.getAll(setChildren, listChildrenErrors);
    }

    var getUser = function (childDoc) {
      vm.child = childDoc;
    };
    var getError = function (error) {
      vm.getError = error;
    };
    // Find existing Child
    function findOne() {
 //     var something = $stateParams;
      PouchService.get({ childId: vm.childId }, getUser, getError);
    }
  }
}());
