(function () {
  'use strict';

  angular
    .module('children')
    .controller('SurveyController', SurveyController);

  SurveyController.$inject = ['$rootScope', '$scope', '$state', '$timeout', '$translate', 'moment', 'surveyResolve', 'Authentication', 'ZScores', 'PouchService'];

  function SurveyController($rootScope, $scope, $state, $timeout, $translate, moment, survey, Authentication, ZScores, PouchService) {
    var vm = this;
    $translate.use($rootScope.SelectedLanguage);
    vm.survey = survey;
    if (navigator.geolocation) {
      console.log('Geolocation is supported!');
    } else {
      console.log('Geolocation is not supported for this Browser/OS version yet.');
    }
    var geoOptions = {
      maximumAge: 5 * 60 * 1000
    };
    var startPos;
    var geoSuccess = function(position) {
      startPos = position;
      vm.latitude = startPos.coords.latitude;
      vm.longitude = startPos.coords.longitude;
    };
    var geoError = function(error) {
      console.log('Geolocation Error occurred. Error code: ' + error.code);
      // error.code can be:
      //   0: unknown error
      //   1: permission denied
      //   2: position unavailable (error response from location provider)
      //   3: timed out
    };
    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
  //  vm.surveyRemove = surveyRemove;
    function performTranslation() {
      $translate(['BOY', 'GIRL', 'EDIT_CHANGE_VALUES', 'NEW_SCREENING']).then(function (translations) {
        vm.boy = translations.BOY;
        vm.girl = translations.GIRL;
        vm.editMsg = translations.EDIT_CHANGE_VALUES;
        vm.newScreen = translations.NEW_SCREENING;
        vm.updateMsg = translations.UPDATE;
        vm.createMsg = translations.CREATE;
      });
    }
    performTranslation();

    $rootScope.$on('$translateChangeSuccess', function () {
      performTranslation();
    });
    getOwner($state.params.childId);
    vm.selectedStake = localStorage.getItem('selectedStake');
    vm.selectedCountry = localStorage.getItem('selectedCountry');
    vm.selectedCountryImage = localStorage.getItem('selectedCountryImage');
    vm.selectedDB = localStorage.getItem('selectedDBName');
    vm.authentication = Authentication;
    vm.interviewer = localStorage.getItem('lastInterviewer');
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.addSurvey = addSurvey;
    vm.update = update;
    vm.today = today;
    vm.commentOverride = commentOverride;

    vm.authentication = Authentication;

    vm.checkHeightIsValid = checkHeightIsValid;
    vm.checkWeightIsValid = checkWeightIsValid;
    vm.checkAllFieldsValid = checkAllFieldsValid;

    vm.ageIsValid = false;
    vm.childHeightIsValid = false;
    vm.childWeightIsValid = false;

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
          vm.childWeightIsValid = false;
        } else {
          vm.childWeightIsValid = true;
          if (vm.ageIsValid && vm.heightIsValid) {
            vm.zScoreGetter(vm.survey.gender, vm.ageInMonths || vm.monthAge, vm.survey.height, vm.survey.weight, function (zscore) {
              vm.survey.zScore = zscore;
            });
          }
        }
      } else {
        vm.childWeightIsValid = false;
      }
    }

    function commentOverride() {
      if (vm.survey.comments.indexOf('age=') !== -1) {
        var parts = vm.survey.comments.split('=');
        vm.ageOverride = parts[1];
      }
    }

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
 //     commentOverride();
      if (vm.survey._id) {
        vm.zScoreGetter(vm.child.gender, vm.ageOverride || vm.child.monthAge, vm.survey.height, vm.survey.weight, function (zscore) {
          vm.zScore = zscore;
        });
        vm.survey.zScore = vm.zScore;
        PouchService.insert(vm.survey, surveyUpdated, addedError);
      } else {
        vm.survey._id = undefined;
        var bday = new Date(vm.child.birthDate);

        var rightNow = new Date();
        var ageMoments = moment(rightNow).diff(moment(bday), 'months');
        var zScore = {};
        vm.zScoreGetter(vm.child.gender, vm.ageOverride || ageMoments, vm.survey.height, vm.survey.weight, function (zscore) {
          vm.zScore = zscore;
        });

        var surveyObject = {
          _id: 'scr_',
          owner: vm.child._id,
          surveyDate: vm.dt,
          zScore: vm.zScore,
          gender: vm.child.gender,
          weight: vm.survey.weight,
          height: vm.survey.height,
          monthAge: vm.ageOverride || ageMoments,
          comments: vm.child.comments,
          interviewer: vm.interviewer,
          latitude: vm.latitude,
          longitude: vm.longitude
        };
        PouchService.insert(surveyObject, surveyAdded, addedError);
        vm.survey.weight = '';
        vm.survey.height = '';
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

