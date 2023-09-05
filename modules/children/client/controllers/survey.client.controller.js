(function () {
  'use strict';

  angular
    .module('children')
    .controller('SurveyController', SurveyController);

  SurveyController.$inject = ['$rootScope', '$scope', '$state', '$translate', '$window', 'moment',
    'surveyResolve', 'Authentication', 'ZScores', 'PouchService', 'ModalService'];

  function SurveyController($rootScope, $scope, $state, $translate, $window, moment,
    survey, Authentication, ZScores, PouchService, ModalService) {
    var vm = this;
    $translate.use($rootScope.SelectedLanguage);
    vm.initialSurvey = false;
    vm.survey = survey;

    function checkAllFieldsValid() {

      if (vm.childHeightIsValid === false || vm.childWeightIsValid === false || vm.muacIsValid === false){
        vm.invalidFields = true;
      } else {
        if ((vm.childHeightIsValid === true && vm.childWeightIsValid === true && vm.ageIsValid === true && vm.survey.weight != "" && vm.survey.height != "") 
          || (vm.muacIsValid === true && vm.ageIsValid === true)) {
            vm.allFieldsValid = true;
            vm.invalidFields = false;
          } else {
            vm.invalidFields = false;
          }
      }
    }

    function getSurveys(surveys) {
      if (surveys.docs.length === 0) {
        vm.initialSurvey = true;
      } else {
        vm.initialSurvey = false;
      }
    }

 
    function surveyErrors(error) {
      vm.surveyError = error;
    }

    vm.goBack = function() {
      $window.history.back();
    };

    if (vm.survey._id) {
    //    vm.ageIsValid = true;
    //    vm.childHeightIsValid = true;
    //     vm.childWeightIsValid = true;
      vm.surveyDate = new Date(vm.survey.surveyDate);
    } else {
    //     vm.invalidFields = true;
      vm.survey.height = '';
      vm.survey.weight = '';
      vm.survey.muac = '';
      vm.survey.familyHealthPlan = false;
      vm.survey.followFamilyHealthPlan = false;
      vm.survey.visitedDoctor = false;

      vm.survey.comments = '';

      vm.ageIsValid = false;
      vm.childHeightIsValid = undefined;
      vm.childWeightIsValid = undefined;
      vm.muacIsValid = undefined;
      vm.surveyDate = new Date();
    }
    PouchService.getSurveys($state.params.childId, getSurveys, surveyErrors);
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
      $translate(['BOY', 'GIRL', 'EDIT_CHANGE_VALUES', 'NEW_SCREENING', 'UPDATE', 'CREATE', 'HEIGHT_EXCEEDED', 'REDO_MEASUREMENT']).then(function (translations) {
        vm.boy = translations.BOY;
        vm.girl = translations.GIRL;
        vm.editMsg = translations.EDIT_CHANGE_VALUES;
        vm.newScreen = translations.NEW_SCREENING;
        vm.updateMsg = translations.UPDATE;
        vm.createMsg = translations.CREATE;
        vm.heightExceeded = translations.HEIGHT_EXCEEDED;
        vm.redoMeasurement = translations.REDO_MEASUREMENT;
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
    vm.interviewer = localStorage.getItem('lastInterviewer');
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.addSurvey = addSurvey;
    vm.update = update;
    vm.commentOverride = commentOverride;

    vm.authentication = Authentication;
    vm.calculateAge = calculateAge;
    vm.checkHeightIsValid = checkHeightIsValid;
    vm.checkWeightIsValid = checkWeightIsValid;
    vm.checkMUACIsValid = checkMUACIsValid;
    vm.checkAllFieldsValid = checkAllFieldsValid;

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

    // function surveyErrors(error) {
    //   vm.surveyError = error;
    // }

    vm.zScoreGetter = ZScores.getMethod;

    function checkHeightIsValid () {
      if (vm.survey.height) {
        if ((vm.survey.monthAge < 24 && vm.survey.height > 110)
          || (vm.survey.monthAge > 24 && vm.survey.height > 120)
          || (vm.survey.monthAge < 24 && vm.survey.height < 45)
          || (vm.survey.monthAge > 24 && vm.survey.height < 65)) {
          // vm.invalidInput(vm.heightExceeded, vm.redoMeasurement);
          vm.childHeightIsValid = false;
        } else {
          vm.childHeightIsValid = true;
          if (vm.ageIsValid && vm.weightIsValid) {
            vm.survey.zScore = vm.zScoreGetter(vm.survey.gender, vm.ageInMonths || vm.monthAge, vm.survey.height, vm.survey.weight, vm.initialSurvey);
          }
        }
      } else {
        vm.childHeightIsValid = undefined;
      }
      vm.checkAllFieldsValid();
    }

    function calculateAge () {
      var months,
        screenDate = moment(vm.surveyDate),
        bday = moment(vm.child.birthDate);

      months = screenDate.diff(bday, 'months', true);
      if (months > 60) {
        vm.ageIsValid = false;
        vm.reportError('Too old ', 'Child has graduated', false);
      } else {
        vm.ageIsValid = true;
        vm.survey.monthAge = months.toFixed(2);
      }
      vm.checkAllFieldsValid();
    }
    function checkWeightIsValid () {
      if (vm.survey.weight) {
        if (vm.survey.weight > 18 || vm.survey.weight < 3) {
          vm.childWeightIsValid = false;
        } else {
          vm.childWeightIsValid = true;
          if (vm.ageIsValid && vm.heightIsValid) {
            vm.zscore = vm.zScoreGetter(vm.survey.gender, vm.ageInMonths || vm.monthAge, vm.survey.height, vm.survey.weight, vm.initialSurvey);
          }
        }
      } else {
        vm.childWeightIsValid = undefined;
      }
      vm.checkAllFieldsValid();
    }

    function checkMUACIsValid(){
      if (vm.survey.muac) {
        if (vm.survey.muac >= 5.5 && vm.survey.muac <= 26.5){
          vm.muacIsValid = true;
        } else {
          vm.muacIsValid = false;
        }
      } else {
        vm.muacIsValid = undefined;
      }
      vm.checkAllFieldsValid();
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
      vm.checkAllFieldsValid();
    }

    function updateChildError(err) {
      vm.reportError('ERROR_UPDATING', err.message, true);
    }

    function childUpdated(obj) {
      $state.go('children.view', { childId: vm.child._id });
    }

    function surveyAdded(survey) {
      PouchService.updateChildSups(vm.child._id, childUpdated, updateChildError);
    }

    function surveyUpdated(survey) {
      PouchService.addScreening(survey, vm.child._id, childUpdated, updateChildError);
      $state.go('children.view', { childId: vm.survey.owner });
    }

    function surveyIsAdded() {
      PouchService.updateChildSups(vm.child, childUpdated, updateChildError);
      $state.go('children.view', { childId: vm.survey.owner });
    }

    function addedError(error) {
      vm.newChildError = error;
    }

    function setMonthCount() {
      var months;
      var rightNow = new Date();
      months = moment(new Date()).diff(moment(vm.child.birthDate), 'months');
      if (months > 60) {
        vm.ageIsValid = false;
      } else {
        vm.ageIsValid = true;
        vm.survey.monthAge = months.toFixed(2);
      }
    }

    function undefinedTurnFalse() {
      vm.checkHeightIsValid();
      vm.checkWeightIsValid();
      vm.checkMUACIsValid();
      if (vm.childHeightIsValid === undefined) {
        vm.childHeightIsValid = false;
      }
      if (vm.childWeightIsValid === undefined) {
        vm.childWeightIsValid = false;
      }
      if (vm.checkMUACIsValid === undefined){
        vm.checkMUACIsValid = false;
      }
      if (vm.ageIsValid === undefined) {
        vm.ageIsValid = false;
      }
    }

    function addSurvey() {
      calculateAge();

      zScore = vm.zScoreGetter(vm.child.gender, vm.survey.monthAge, vm.survey.height, vm.survey.weight, vm.initialSurvey);

      if (vm.invalidFields === true || vm.invalidFields === undefined) {
        undefinedTurnFalse();
        return false;
      } else {

        if (((vm.survey.height === '' || vm.survey.height === undefined) && (vm.childWeightIsValid === true))){
          vm.reportError("{{'REQUIRED_HEIGHT_WEIGHT' | translate}}", "{{'ADD_HEIGHT' | translate}}", false); 
          return false;
        } else if (((vm.survey.weight === '' || vm.survey.weight === undefined) && (vm.childHeightIsValid === true))){
          vm.reportError("{{'REQUIRED_HEIGHT_WEIGHT' | translate}}", "{{'ADD_WEIGHT' | translate}}", false); 
          return false;
        } 
        if (vm.survey.height != '' && vm.survey.weight != '') {
          if ((zScore.ha > 5 || zScore.ha < -5) || (zScore.wa > 5 || zScore.wa < -5)){
            vm.reportError("{{'ZSCORE_OUT_OF_RANGE' | translate}}", "{{'RECHECK_HEIGHT_WEIGHT' | translate}}", false);  
          }
        }
       

        var zScore = {};
        if (vm.survey._id) {
          zScore = vm.zScoreGetter(vm.child.gender, vm.survey.monthAge, vm.survey.height, vm.survey.weight, vm.initialSurvey);
          vm.survey.zScore = zScore;
          vm.survey.surveyDate = vm.surveyDate;
          PouchService.insert(vm.survey, surveyUpdated, addedError);
        } else {
          vm.survey._id = undefined;
          var bday = new Date(vm.child.birthDate);
          zScore = vm.zScoreGetter(vm.child.gender, vm.survey.monthAge, vm.survey.height, vm.survey.weight, vm.survey.muac, 
            vm.survey.familyHealthPlan, vm.survey.followFamilyHealthPlan, vm.survey.visitedDoctor, vm.initialSurvey);
          var surveyObject = {
            _id: 'scr_',
            owner: vm.child._id,
            surveyDate: vm.surveyDate,
            zScore: zScore,
            gender: vm.child.gender,
            weight: vm.survey.weight,
            height: vm.survey.height,
            muac: vm.survey.muac,
            familyHealthPlan: vm.survey.familyHealthPlan,
            followFamilyHealthPlan: vm.survey.followFamilyHealthPlan,
            visitedDoctor: vm.survey.visitedDoctor,
            monthAge: vm.survey.monthAge,
            comments: vm.child.comments,
            interviewer: vm.interviewer,
            latitude: vm.latitude,
            longitude: vm.longitude
          };

          PouchService.insert(surveyObject, surveyAdded, addedError);
          vm.survey.weight = '';
          vm.survey.height = '';
          vm.survey.muac = '';
          vm.survey.familyHealthPlan = false;
          vm.survey.followFamilyHealthPlan = false;
          vm.survey.visitedDoctor = false;
        }
      }
    }

    var removeResponse = function (res) {
      vm.remResponse = res;
      PouchService.updateChildSups(vm.child._id, function() {
        $state.go('children.view', { childId: vm.child._id });
      });
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
      vm.survey.surveyDate = vm.surveyDate;
      PouchService.put(vm.survey);
    }

    function getUser (childDoc) {
      vm.child = childDoc;
      calculateAge();
    }

    function getError (error) {
      vm.getError = error;
    }
    // Find existing Survey
    function getOwner(ownerId) {
      PouchService.get({ childId: ownerId }, getUser, getError);
    }

    vm.reportError = function (title, error, notifyKarl) {
      return ModalService.infoModal(title + ' :\n', error + (notifyKarl ? '\n Please contact kjorgens@yahoo.com' : ''));
    };
  }
}());
