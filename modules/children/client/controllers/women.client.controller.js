(function () {
  'use strict';

  angular
    .module('children')
    .controller('MotherController', MotherController);

  MotherController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$translate', '$location', 'FilterService',
    'MotherResolve', 'Authentication', 'PouchService', 'ModalService'];

  function MotherController($rootScope, $scope, $state, $stateParams, $translate, $location, FilterService,
    mothers, Authentication, PouchService, ModalService) {

    var vm = this;

    vm.motherList = FilterService.searchAndFilter(mothers.docs, '', '', 'firstName');
    vm.whereFrom = $location;

    vm.nursingMother = false;
    if(~$stateParams.screenType.indexOf('nursing')) {
      vm.nursingMother = true;
    }
    var editMother = false;

    $translate.use($rootScope.SelectedLanguage);

    vm.searchStarted = searchStarted;
    vm.focusSearch = 1;
    vm.searchString = FilterService.currentListFilter();
    vm.noSelection = FilterService.getCurrentScreenType() === '';

    vm.stakeDB = $stateParams.stakeDB;
    vm.stakeName = $stateParams.stakeName;
    vm.screenType = $stateParams.screenType;
    vm.selectedStake = vm.stakeName;
    vm.selectedDB = vm.stakeDB;
    vm.selectedWard = $stateParams.ward;
    // vm.selectedStake = localStorage.getItem('selectedStake');
    // vm.selectedDB = sessionStorage.getItem('selectedDBName');
    //vm.selectedWard = localStorage.getItem('selectedWard');

    // if(vm.selectedWard.indexOf('All Wards') === -1){
    //   vm.mother.ward = vm.selectedWard;
    // }
    vm.selectedCountry = sessionStorage.getItem('selectedCountry');
    vm.selectedCountryCode = sessionStorage.getItem('selectedCountryCode');
    vm.selectedCountryImage = sessionStorage.getItem('selectedCountryImage');
    vm.online = $rootScope.appOnline;
    vm.interviewer = localStorage.getItem('lastInterviewer');
//    vm.find();

    vm.yesNo = [{ value: 'Yes', translationId: 'YES' }, { value: 'No', translationId: 'NO' }, { value: 'Unknown', translationId: 'UNKNOWN' }];
//     if ($state.params.hasOwnProperty('motherId')) {
//       editMother = true;
//       vm.mother = mother;
//       vm.firstNameIsValid = true;
//       vm.lastNameIsValid = true;
//       vm.deliveryDateIsValid = true;
//       vm.membershipIsValid = true;
//
//       vm.mother.birthDate = new Date(vm.mother.birthDate);
//       vm.mother.deliveryDate = new Date(vm.mother.deliveryDate);
//
// //      PouchService.getSurveys(vm.mother._id, setSurveyList, surveyErrors);
//     } else {
//       vm.mother = {};
//
//       vm.ageIsValid = undefined;
//       vm.firstNameIsValid = undefined;
//       vm.lastNameIsValid = undefined;
//       vm.membershipIsValid = undefined;
//       vm.surveyDate = new Date();
//       vm.mother.ward = vm.selectedWard;
//       // vm.checkMembershipIsValid = false;
//     }

    vm.appIsOffline = !$rootScope.appOnline;

    vm.userHasAdminRole = false;
    vm.userHasUserRole = false;

    vm.authentication = Authentication;

    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.update = update;
    vm.find = find;
    vm.findOne = findOne;
    // vm.today = today;
    // vm.clearSearch = function(){
    //   vm.searchString = '';
    //   FilterService.searchAndFilter(vm.childList, '', FilterService.currentColorFilter(), 'firstName');
    // };

    function searchStarted() {
      vm.motherList = FilterService.searchAndFilter(vm.motherList, vm.searchString, FilterService.currentColorFilter(), 'firstName');
      if ( FilterService.displayCount() === 1 ){
        FilterService.setSearchFilter(vm.searchString.slice(0, -1));
        vm.focusSearch++;
        $state.go('children.mothers', { motherId: FilterService.getSingleChildId() });
      }
    }

    vm.clearSearch = function(){
      vm.searchString = '';
      vm.motherList = FilterService.searchAndFilter(vm.motherList, '', FilterService.currentColorFilter(), 'firstName');
    };

    vm.goSync = function(){
      $state.go('children.sync', { stakeDB: vm.selectedDB, stakeName: vm.selectedStake, screenType: vm.screenType});
    };

    function performTranslation() {
      $translate(['MOTHER_RECORD', 'UPDATE', 'CREATE', 'EXPECTED_DELIVERY_DATE',
        'EDIT_CHANGE_VALUES', 'ADD_NURSING_MOTHER', 'ADD_PREGNANT_WOMAN']).then(function (translations) {
        vm.motherRec = translations.MOTHER_RECORD;
        vm.update = translations.UPDATE;
        vm.createRec = translations.CREATE;
        vm.deliveryDate = translations.EXPECTED_DELIVERY_DATE;
        vm.edit_existing = translations.EDIT_CHANGE_VALUES;
        vm.add_pregnant = translations.ADD_PREGNANT_WOMAN;
        vm.add_nursing = translations.ADD_NURSING_MOTHER;
      });
    }

    performTranslation();
    $rootScope.$on('$translateChangeSuccess', function () {
      performTranslation();
    });


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

    function updated(mother) {
      vm.mother = mother;
    }


    function motherUpdated(mother) {
      $state.go('children.mothers', { stakeDB: vm.selectedDB, stakeName: vm.selectedStake, screenType: 'mothers',
        searchFilter: FilterService.currentListFilter(), colorFilter: FilterService.currentColorFilter()});
 //     $state.go('mother.view', { motherId: mother.id });
    }

    var removeResponse = function (res) {
      vm.remResponse = res;
    };

    var removeError = function (error) {
      vm.remError = error;
    };

    // Remove existing Mother
    function remove(mother) {
      if (mother) {
        vm.surveys.forEach(function(toRemove) {
          PouchService.remove(toRemove, removeResponse, removeError);
        });
        PouchService.remove(mother, removeResponse, removeError);
        $state.go('children.mothers', { stakeDB: vm.selectedDB, stakeName: vm.selectedStake, screenType: 'mothers',
          searchFilter: FilterService.currentListFilter(), colorFilter: FilterService.currentColorFilter()});
      }
    }

    // Update existing Mother
    function update(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'motherForm');
        return false;
      }
      var mother = vm.mother;
      PouchService.updateMother(mother, motherUpdated, removeError);
    }

    var setMothers = function (res) {
      vm.motherList = FilterService.searchAndFilter(res.docs, '', '', 'firstName');
    //     vm.motherList = res.docs;
    };

    var listMotherErrors = function (error) {
      vm.error = error;
    };

    // Find a list of Mother
    function find() {
      PouchService.queryPregnantWomen(setMothers, listMotherErrors);
    }

    var getUser = function (motherDoc) {
      vm.mother = motherDoc;
    };
    var getError = function (error) {
      vm.getError = error;
    };
    // Find existing Mother
    function findOne() {
      //     var something = $stateParams;
      PouchService.get({ motherId: vm.motherId }, getUser, getError);
    }

    vm.invalidInput = function () {
      return ModalService.infoModal('INPUT_ERROR', 'INVALID_DATA', 'PLEASE_CORRECT');
    };

    // find();
  }
}());
