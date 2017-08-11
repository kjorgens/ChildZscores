(function () {
  'use strict';

  angular
    .module('children')
    .controller('ChildrenController', ChildrenController);

  ChildrenController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$translate', '$window', 'GraphService',
    'FilterService', 'moment', 'childResolve', 'Authentication', 'ZScores', 'usSpinnerService', 'PouchService', 'ModalService'];

  function ChildrenController($rootScope, $scope, $state, $stateParams, $translate, $window, GraphService,
     FilterService, moment, child, Authentication, ZScores, usSpinnerService, PouchService, ModalService) {
    var vm = this;
    vm.options = {};
    vm.data = {};
    vm.zscoreHa = [];
    vm.zscoreWa = [];
    vm.zscoreWH = [];

    vm.callback = callback;
    vm.optionsHeight = GraphService.setupHeightChart();
    vm.optionsWeight = GraphService.setupWeightChart();

    function callback(scope, element) {
      var api = scope.api;
      var chart = scope.chart;
      var svg = scope.svg;
    }

    var editChild = false;
    vm.checkAge = checkAge;
    vm.childTooOld = childTooOld;
    vm.goBack = goBack;
    vm.getChildrenList = getChildrenList;

    vm.zScoreGetter = ZScores.getMethod;
    $translate.use($rootScope.SelectedLanguage);

    vm.selectedStake = localStorage.getItem('selectedStake');
    vm.selectedDB = sessionStorage.getItem('selectedDBName');
    // vm.selectedWard = localStorage.getItem('selectedWard');
    vm.selectedWard = $stateParams.ward;
    // if(vm.selectedWard.indexOf('All Wards') === -1){
    //   vm.child.ward = vm.selectedWard;
    // }
    vm.selectedCountry = sessionStorage.getItem('selectedCountry');
    vm.selectedCountryImage = sessionStorage.getItem('selectedCountryImage');
    vm.online = $rootScope.appOnline;
    vm.interviewer = localStorage.getItem('lastInterviewer');

 //   getChildrenList();
    vm.genders = [{ value: 'Boy', translationId: 'TXT_MALE' }, { value: 'Girl', translationId: 'TXT_FEMALE' }];
    vm.yesNo = [{ value: 'Yes', translationId: 'YES' }, { value: 'No', translationId: 'NO' }, { value: 'Unknown', translationId: 'UNKNOWN' }];
    vm.startSpin = function() {
      if (!vm.spinneractive) {
        usSpinnerService.spin('spinner-sync');
      }
    };

    vm.stopSpin = function() {
      if (vm.spinneractive) {
        usSpinnerService.stop('spinner-sync');
      }
    };

    vm.spinneractive = false;

    $rootScope.$on('us-spinner:spin', function(event, key) {
      vm.spinneractive = true;
    });

    $rootScope.$on('us-spinner:stop', function(event, key) {
      vm.spinneractive = false;
    });

    function goBack() {
      $state.go('children.list', { stakeDB: vm.selectedDB, stakeName: vm.selectedStake, screenType: 'children',
        searchFilter: FilterService.currentListFilter(), colorFilter: FilterService.currentColorFilter() });
    }

    function checkAge() {
      var months;
      var rightNow = new Date();
      var currentAgeMonths = moment(rightNow).diff(moment(vm.child.birthDate), 'months');
      if (currentAgeMonths > 60) {
        vm.childTooOld();
 //       vm.startSpin();
        $state.go('children.list', { stakeDB: vm.selectedDB, stakeName: vm.selectedStake, screenType: 'children',
          searchFilter: FilterService.currentListFilter(), colorFilter: FilterService.currentColorFilter() });
      } else if (vm.initialScreening && currentAgeMonths > 36) {
        childDoesNotQualify();
      }
    }

    if ($state.params.childId) {
      editChild = true;
      vm.child = child;
      vm.checkAge();
      vm.ageIsValid = true;
      vm.firstNameIsValid = true;
      vm.lastNameIsValid = true;
      vm.genderIsValid = true;
      vm.motherIsValid = true;
      vm.fatherIsValid = true;
      vm.birthdateIsValid = true;
      vm.membershipIsValid = true;
      vm.wardIsValid = true;

      vm.child.birthDate = new Date(vm.child.birthDate);
      vm.startSpin();
      PouchService.getSurveys(vm.child._id, setSurveyList, surveyErrors);
    } else {
      vm.child = {};
      // vm.child.gender = 'Boy';
      // vm.child.memberStatus = 'Yes';
      vm.ageIsValid = undefined;
      vm.firstNameIsValid = undefined;
      vm.lastNameIsValid = undefined;
      vm.genderIsValid = undefined;
      vm.membershipIsValid = undefined;
      vm.surveyDate = new Date();
      vm.child.ward = vm.selectedWard;
      vm.checkMembershipIsValid = false;
    }

    vm.appIsOffline = !$rootScope.appOnline;

    vm.userHasAdminRole = false;
    vm.userHasUserRole = false;

    vm.authentication = Authentication;

    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.create = create;
    vm.update = update;
    vm.getChildrenList = getChildrenList;
    vm.findOne = findOne;
    vm.setMonthCount = setMonthCount;
    vm.today = today;

    vm.checkFirstNameIsValid = checkFirstNameIsValid;
    vm.checkLastNameIsValid = checkLastNameIsValid;
    vm.checkGenderIsValid = checkGenderIsValid;
    vm.checkMembershipIsValid = checkMembershipIsValid;
    vm.checkAgeIsValid = checkAgeIsValid;
    vm.checkEnteredAgeIsValid = checkEnteredAgeIsValid;
    vm.checkAllFieldsValid = checkAllFieldsValid;
    function performTranslation() {
      $translate(['BOY', 'GIRL', 'CHILD_RECORD', 'UPDATE', 'CREATE',
        'EDIT_EXISTING_CHILD', 'ADD_NEW_CHILD', 'CHILD_GT_5', 'CHILD_GRAD',
        'INPUT_ERROR', 'INVALID_DATA', 'PLEASE_CORRECT' ]).then(function (translations) {
          vm.boy = translations.BOY;
          vm.girl = translations.GIRL;
          vm.childRec = translations.CHILD_RECORD;
          vm.update = translations.UPDATE;
          vm.createRec = translations.CREATE;
          vm.edit_existing = translations.EDIT_EXISTING_CHILD;
          vm.add_new = translations.ADD_NEW_CHILD;
          vm.childGT5 = translations.CHILD_GT_5;
          vm.childGrad = translations.CHILD_GRAD;
          vm.inputError = translations.INPUT_ERROR;
          vm.invalidData = translations.INVALID_DATA;
          vm.pleaseCorrect = translations.PLEASE_CORRECT;
        });
    }


    performTranslation();
    $rootScope.$on('$translateChangeSuccess', function () {
      performTranslation();
    });

    function gradeZScores(survey) {
      vm.haStatus = 'normalZscore';
      vm.waStatus = 'normalZscore';
      vm.wlStatus = 'normalZscore';
      if (survey.zScore.ha < -2) {
        vm.haStatus = 'redZoneZscore';
        vm.child.screeningStatus = 'redZoneZscore';
      } else {
        if (survey.zScore.ha < -1 && survey.zScore.ha > -2) {
          vm.haStatus = 'marginalZscore';
          vm.child.screeningStatus = 'marginalZscore';
        }
      }
      if (survey.zScore.wa < -2) {
        vm.waStatus = 'redZoneZscore';
        vm.child.screeningStatus = 'redZoneZscore';
      } else {
        if (survey.zScore.wa < -1 && survey.zScore.wa > -2) {
          vm.child.screeningStatus = 'marginalZscore';
          vm.waStatus = 'marginalZscore';
        }
      }
      if (survey.zScore.wl < -3) {
        vm.wlStatus = 'dangerZscore';
        vm.child.screeningStatus = 'dangerZscore';
      } else {
        if (survey.zScore.wl < -2 && survey.zScore.wl > -3) {
          vm.child.screeningStatus = 'redZoneZscore';
          vm.wlStatus = 'redZoneZscore';
        } else {
          if (survey.zScore.wl < -1 && survey.zScore.wl > -2) {
            vm.wlStatus = 'marginalZscore';
            vm.child.screeningStatus = 'marginalZscore';
          }
        }
      }
    }

    function setSurveyList(surveys) {
      vm.stopSpin();
      if ( surveys.docs.length === 1) {
        vm.initialScreening = true;
      }
      surveys.docs.forEach(function(survey){
        survey.colorStatus = PouchService.calcSurveyStatus(survey);
        vm.zscoreHa.push({ x: survey.monthAge, y: survey.height, size: 10, shape: 'diamond' });
        vm.zscoreWa.push({ x: survey.monthAge, y: survey.weight, size: 10, shape: 'diamond' });
        vm.zscoreWH.push({ x: survey.height, y: survey.weight, size: 10, shape: 'diamond' });
      });
      $scope.$apply(function () {
        vm.surveys = surveys.docs;
        vm.zScoreGetter(vm.child.gender, vm.surveys[0].monthAge, vm.surveys[0].height, vm.surveys[0].weight, vm.surveys.length === 1 ? true : false, function (zscore) {
          vm.zScore = zscore;
          vm.actions = zscore.actions;
        });
        vm.dataHeight = GraphService.getChartDataHeight(vm.zscoreHa);
        vm.dataWeight = GraphService.getChartDataWeight(vm.zscoreWa);
        vm.dataHeightWeight = GraphService.getChartDataHeightWeight(vm.zscoreWH);
      });
    }

    function surveyErrors(error) {
      vm.surveyError = error;
    }

    function undefinedTurnFalse() {
      if (vm.firstNameIsValid === undefined) {
        vm.firstNameIsValid = false;
      }
      if (vm.lastNameIsValid === undefined) {
        vm.lastNameIsValid = false;
      }
      if (vm.genderIsValid === undefined) {
        vm.genderIsValid = false;
      }
      if (vm.ageIsValid === undefined) {
        vm.ageIsValid = false;
      }
      if (vm.membershipIsValid === undefined) {
        vm.membershipIsValid = false;
      }
    }

    function checkAllFieldsValid() {
      if (vm.firstNameIsValid === true &&
          vm.lastNameIsValid === true &&
          vm.genderIsValid === true &&
          vm.ageIsValid === true &&
          vm.membershipIsValid === true) {
        vm.allFieldsValid = true;
        vm.invalidFields = false;
      } else if (vm.firstNameIsValid === false ||
          vm.lastNameIsValid === false ||
          vm.genderIsValid === false ||
          vm.ageIsValid === false ||
          vm.membershipIsValid === false) {
        vm.allFieldsValid = false;
        vm.invalidFields = true;
      } else if ((vm.firstNameIsValid === undefined || vm.firstNameIsValid === true) &&
          (vm.lastNameIsValid === undefined || vm.lastNameIsValid === true) &&
          (vm.genderIsValid === undefined || vm.genderIsValid === true) &&
          (vm.ageIsValid === undefined || vm.ageIsValid === true) &&
          (vm.membershipIsValid === undefined || vm.membershipIsValid === true)) {
        vm.allFieldsValid = true;
      }
    }

    function setMonthAge() {

    }

    function setMonthCount() {
      var months;
      var rightNow = new Date();
      vm.child.monthAge = moment(rightNow).diff(moment(vm.child.birthDate), 'months');
      if (vm.child.monthAge > 60) {
        vm.ageIsValid = false;
      } else {
        vm.ageIsValid = true;
        vm.child.monthAge = vm.child.monthAge.toFixed(2);
      }
    }

    function checkFirstNameIsValid() {
      if (vm.child.firstName) {
        if (vm.child.firstName.length < 1) {
          vm.firstNameIsValid = false;
        } else {
          vm.firstNameIsValid = true;
        }
      } else {
        vm.firstNameIsValid = false;
      }
      vm.checkAllFieldsValid();
      // if (FilterService.matchName(FilterService.getCurrentChildList(), {firstName: vm.child.firstName || '_', lastName: vm.child.lastName || '_'})) {
      //   return ModalService.choiceModal(vm.child.firstName + ' ' + vm.child.lastName + ' exists in database', 'Make a selection', '');
      // }
    }

    function checkLastNameIsValid() {
      if (vm.child.lastName) {
        if (vm.child.lastName.length < 1) {
          vm.lastNameIsValid = false;
        } else {
          vm.lastNameIsValid = true;
        }
      } else {
        vm.lastNameIsValid = false;
      }
      var retVal = FilterService.matchName(FilterService.getCurrentChildList(), {firstName: vm.child.firstName || '_', lastName: vm.child.lastName || '_'})
      if (retVal) {
        return ModalService.choiceModal(retVal._id, retVal.firstName + ' ' + retVal.lastName + ' ','EXISTS_DATABASE', 'MAKE_SELECTION', '');
      }
      vm.checkAllFieldsValid();
    }

    function checkGenderIsValid() {
      if (vm.child.gender === 'Boy' || vm.child.gender === 'Girl') {
        vm.genderIsValid = true;
      } else {
        vm.genderIsValid = false;
      }
      vm.checkAllFieldsValid();
    }

    function checkMembershipIsValid() {
      if (vm.child.memberStatus === 'Yes' || vm.child.memberStatus === 'No' || vm.child.memberStatus === 'Unknown') {
        vm.membershipIsValid = true;
      } else {
        vm.membershipIsValid = false;
      }
      vm.checkAllFieldsValid();
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
      if (vm.child.monthAge !== undefined) {
        if (vm.child.monthAge < 1 || vm.child.monthAge > 60) {
          vm.ageIsValid = false;
        } else if (vm.child.monthAge > 36) {
          childDoesNotQualify();
        }else {
          vm.ageIsValid = true;
          vm.child.birthDate = new Date(year, month - vm.child.monthAge, day);
          vm.ageIsValid = true;
        }
      }
      vm.checkAllFieldsValid();
      if (FilterService.matchNameAndAge(FilterService.getCurrentChildList(), {firstName: vm.child.firstName || '_', lastName: vm.child.lastName || '_', monthAge: vm.child.monthAge})) {
        return ModalService.choiceModal(vm.child._id, vm.child.firstName + ' ' + vm.child.lastName + ' ', 'EXISTS_DATABASE', 'MAKE_SELECTION', '');
      }
    }

    function checkAgeIsValid() {
      var rightNow = new Date();
      var monthAge = moment(rightNow).diff(moment(vm.child.birthDate), 'months');
      if (monthAge > 60) {
        vm.ageIsValid = false;
      } else {
        vm.ageIsValid = true;
        vm.child.monthAge = Number(monthAge.toFixed(2));
      }
      vm.checkAllFieldsValid();
      if (FilterService.matchNameAndAge(FilterService.getCurrentChildList(), {firstName: vm.child.firstName || '_', lastName: vm.child.lastName || '_', monthAge: vm.child.monthAge})) {
        return ModalService.choiceModal(vm.child._id, vm.child.firstName + ' ' + vm.child.lastName + ' ', 'EXISTS_DATABASE', 'MAKE_SELECTION', '');
      }
    }

    function ldsMemberChecked() {
      if (vm.memberChecked === 'YES') {
        console.log('child is member');
        // vm.child.memberStatus = 'Yes';
        vm.checkMembershipIsValid = true;

      } else {
        console.log('child is not a member');
        // vm.child.memberStatus = 'No';
        vm.checkMembershipIsValid = true;
      }
      vm.checkAllFieldsValid();
    }

    function updated(child) {
      vm.child = child;
    }

    function childUpdated(child) {
      vm.startSpin();
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
          undefinedTurnFalse();
          vm.invalidFields = true;
          return false;
        } else {
          vm.invalidFields = false;
        }

        var childObject = {
          created: vm.dt,
          monthAge: vm.child.monthAge,
          gender: vm.child.gender,
          birthDate: vm.child.birthDate,
          firstName: vm.child.firstName,
          lastName: vm.child.lastName,
          comments: vm.child.comments,
          father: vm.child.father,
          mother: vm.child.mother,
          address: vm.child.address,
          city: vm.child.city,
          idGroup: vm.child.idGroup,
          ward: vm.child.ward,
          phone: vm.child.phone,
          memberStatus: vm.child.memberStatus,
          screeningStatus: vm.screeningStatus,
          _id: 'chld_',
          interviewer: localStorage.getItem('lastInterviewer')
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
        vm.child.idGroup = '';
        vm.child.ward = '';
        vm.child.memberStatus = '';
        vm.child.phone = '';
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
        vm.startSpin();
        $state.go('children.list', { stakeDB: vm.selectedDB, stakeName: vm.selectedStake, screenType: 'children',
          searchFilter: FilterService.currentListFilter(), colorFilter: FilterService.currentColorFilter() });
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
    function getChildrenList() {
      PouchService.findChildren().then(setChildren);
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

    function childTooOld() {
      return ModalService.infoModal('CHILD_GT_5', 'CHILD_GRAD', '');
    }

    function childDoesNotQualify() {
      return ModalService.infoModal('CHILD_36', 'CHILD_START_TOO_OLD', '');
    }

    vm.invalidInput = function () {
      return ModalService.infoModal('INPUT_ERROR', 'INVALID_DATA', 'PLEASE_CORRECT');
    };
  }
}());
