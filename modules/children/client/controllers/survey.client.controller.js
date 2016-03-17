(function () {
  'use strict';

  angular
      .module('children')
      .controller('SurveyController', SurveyController);

  SurveyController.$inject = ['$scope', '$state', '$timeout', 'moment', 'surveyResolve', 'Authentication', 'ZScores', 'PouchService'];

  function SurveyController($scope, $state, $timeout, moment, survey, Authentication, ZScores, PouchService) {
    var vm = this;
    vm.survey = survey;

    getOwner($state.params.childId);

    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.addSurvey = addSurvey;
    vm.update = update;
    vm.today = today;
    vm.commentOverride = commentOverride;

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
  //  vm.checkGenderIsValid = checkGenderIsValid;
    vm.checkHeightIsValid = checkHeightIsValid;
    vm.checkWeightIsValid = checkWeightIsValid;
 //   vm.checkMonthAgeIsValid = checkMonthAgeIsValid;
    vm.checkAllFieldsValid = checkAllFieldsValid;

    vm.ageIsValid = false;
    vm.childHeightIsValid = false;
    vm.childweightIsValid = false;
 //   vm.genderIsValid = true;
//    vm.heightIsValid = true;
//    vm.weightIsValid = true;
    vm.birthDate = new Date();
    vm.surveyDate = new Date();
    vm.survey.comments = '';
    vm.rightNow = vm.surveyDate;
    vm.surveys = [];

    // Put event listeners into place

    function createDB(dbToCreate) {
      PouchService.createDatabase(dbToCreate);
    }

    function setSurveyList(surveys) {
      $scope.$apply(function() {
        vm.surveys = surveys;
      });
    }

    function surveyErrors(error) {
      vm.surveyError = error;
    }

    function checkAllFieldsValid() {
   //   checkGenderIsValid ();
      checkHeightIsValid();
      checkWeightIsValid();
      checkMonthAgeIsValid();
    }

    vm.zScoreGetter = ZScores.getMethod;

    function checkHeightIsValid () {
      if (vm.survey.height) {
        if (vm.survey.height > 110 || vm.survey.height < 45) {
          vm.childHeightIsValid = false;
        } else {
          vm.childHeightIsValid = true;
          if (vm.ageIsValid && vm.weightIsValid) {
            vm.zScoreGetter(vm.survey.gender, vm.ageInMonths || vm.monthAge, vm.survey.height, vm.survey.weight, function (zscore) {
              vm.survey.zScore = zscore;
            });
          }
        }
      } else {
        vm.childHeightIsValid = false;
      }
    }

    function checkWeightIsValid () {
      if (vm.survey.weight) {
        if (vm.survey.weight > 18 || vm.survey.weight < 3) {
          vm.childweightIsValid = false;
        } else {
          vm.childweightIsValid = true;
          if (vm.ageIsValid && vm.heightIsValid) {
            vm.zScoreGetter(vm.survey.gender, vm.ageInMonths || vm.monthAge, vm.survey.height, vm.survey.weight, function (zscore) {
              vm.survey.zScore = zscore;
            });
          }
        }
      } else {
        vm.childweightIsValid = false;
      }
    }

    function commentOverride() {
      if (vm.survey.comments.indexOf('age=') !== -1) {
        var parts = vm.survey.comments.split('=');
        vm.ageOverride = parts[1];
      }
    }

    //function checkGenderIsValid() {
    //  if (vm.survey.gender) {
    //    vm.genderIsValid = true;
    //  }
    //  else {
    //    vm.genderIsValid = false;
    //  }
    //}

    function checkMonthAgeIsValid() {
      var bday = new Date(vm.child.birthDate);
      vm.ageInMonths = moment(vm.surveyDate).diff(moment(bday), 'months');
      if (vm.ageInMonths > 60) {
        vm.ageIsValid = false;
      } else {
        vm.ageIsValid = true;
        vm.child.monthAge = vm.ageInMonths;
      }
    }

    function today() {
      vm.dt = new Date();
    }
    vm.today();

    vm.clear = function () {
      vm.dt = null;
    };

    function surveyAdded(survey) {
      $state.go('children.view', { childId: vm.child._id });
    }

    function surveyUpdated(survey) {
      $state.go('children.view', { childId: vm.survey.owner });
    }

    function addedError(error) {
      vm.newChildError = error;
    }

    function monthDiff(d1, d2) {
      var months;
      months = (d2.getFullYear() - d1.getFullYear()) * 12;
      months -= d1.getMonth() + 1;
      months += d2.getMonth();
      return months <= 0 ? 0 : months;
    }

    function addSurvey(isValid) {
      commentOverride();
      if (vm.survey._id) {
        vm.zScoreGetter(vm.child.gender, vm.ageOverride || vm.child.monthAge, vm.survey.height, vm.survey.weight, function (zscore) {
          vm.zScore = zscore;
        });
        vm.survey.zScore = vm.zScore;
        PouchService.insert(vm.survey, surveyUpdated, addedError);
      } else {
        var bday = new Date(vm.child.birthDate);

        var rightNow = new Date();
        var ageMoments = moment(rightNow).diff(moment(bday), 'months');
        var zScore = {};
        vm.zScoreGetter(vm.child.gender, vm.ageOverride || ageMoments, vm.survey.height, vm.survey.weight, function (zscore) {
          vm.zScore = zscore;
        });

        var surveyObject = {
          owner: vm.child._id,
          surveyDate: vm.dt,
          zScore: vm.zScore,
          gender: vm.child.gender,
          weight: vm.survey.weight,
          height: vm.survey.height,
          monthAge: vm.ageOverride || ageMoments,
          comments: vm.child.comments
      //    interviewer: vm.authentication.user.displayName
        };
        PouchService.insert(surveyObject, surveyAdded, addedError);
      }
    }

    var removeResponse = function (res) {
      vm.remResponse = res;
      $state.go('children.view', { childId: vm.child._id });

    };

    var removeError = function (error) {
      vm.remError = error;
    };

    // Remove existing survey
    function remove(survey) {
      PouchService.remove(survey, removeResponse, removeError);
    }

    // Update existing survey
    function update(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'surveyForm');
        return false;
      }
      PouchService.put(vm.survey);
    }

    function getUser (childDoc) {
      vm.child = childDoc;
    }

    function getError (error) {
      vm.getError = error;
    }
    // Find existing Survey
    function getOwner(ownerId) {
      PouchService.get({ childId: ownerId }, getUser, getError);
    }
  }
}());
