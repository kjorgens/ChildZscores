(function () {
  'use strict';

  angular
      .module('children')
      .controller('WomenCreateController', WomenCreateController);

  WomenCreateController.$inject = ['$rootScope', '$window', '$scope', '$state', '$stateParams', '$translate', 'FilterService',
    'moment', 'MotherResolve', 'Authentication', 'PouchService', 'ModalService'];

  function WomenCreateController($rootScope, $window, $scope, $state, $stateParams, $translate, FilterService,
    moment, mother, Authentication, PouchService, ModalService) {
    var vm = this;
    vm.nursingMother = false;
    vm.editMother = false;
    vm.selectedStake = $stateParams.stakeName;
    vm.stakeName = $stateParams.stakeName;
    vm.stakeDB = $stateParams.stakeDB;
    if(mother.hasOwnProperty('_id')) {
      vm.editMother = true;
      if(mother.hasOwnProperty('childsBirthDate')){
        vm.nursingMother = true;
      }
    } else if(~$stateParams.screenType.indexOf('nursing')) {
      vm.nursingMother = true;
    }

    vm.goBack = function(){
      $state.go('children.listMothers', { stakeDB: vm.stakeDB, stakeName: vm.stakeName,
        searchFilter: FilterService.currentListFilter(), colorFilter: FilterService.currentColorFilter(),
        screenType: vm.nursingMother ? 'nursing' : 'pregnant'});
//      $window.history.back();
    };

    vm.newMother = newMother;
    if (vm.editMother){
      vm.mother = mother;
      vm.firstNameIsValid = true;
      vm.lastNameIsValid = true;
      vm.membershipIsValid = true;

 //     vm.mother.birthDate = new Date(vm.mother.birthDate);
      if(vm.mother.hasOwnProperty('deliveryDate')) {
        vm.deliveryDateIsValid = true;
        vm.mother.deliveryDate = new Date(vm.mother.deliveryDate);
      }
      if(vm.mother.hasOwnProperty('childsBirthDate')){
        vm.childsBirthDateIsValid = true;
        vm.mother.childsBirthDate = new Date(vm.mother.childsBirthDate);
      }
    } else {
      vm.mother = {};

      vm.ageIsValid = undefined;
      vm.firstNameIsValid = undefined;
      vm.lastNameIsValid = undefined;
      vm.membershipIsValid = undefined;
      vm.surveyDate = new Date();
      vm.mother.ward = vm.selectedWard;
    }
    // if( MotherResolve.childsBirthDate || ~$stateParams.screenType.indexOf('nursing')) {
    //   vm.nursingMother = true;
    // }


    $translate.use($rootScope.SelectedLanguage);

    vm.online = $rootScope.appOnline;
    vm.interviewer = localStorage.getItem('lastInterviewer');
//    vm.find();

    vm.yesNo = [{ value: 'Yes', translationId: 'YES' }, { value: 'No', translationId: 'NO' }, { value: 'Unknown', translationId: 'UNKNOWN' }];
    // if ($state.params.motherId) {
    //   vm.editMother = true;
    //   vm.mother = mother;
    //   vm.firstNameIsValid = true;
    //   vm.lastNameIsValid = true;
    //   vm.deliveryDateIsValid = true;
    //   vm.membershipIsValid = true;
    //
    //   vm.mother.birthDate = new Date(vm.mother.birthDate);
    //   if(vm.mother.deliveryDate) {
    //     vm.mother.deliverDate = new Date(vm.mother.deliveryDate);
    //   }
    //   if(vm.mother.childsBirthDate) {
    //     vm.mother.childsBirthDate = new Date(vm.mother.childsBirthDate);
    //   }
    // } else {
    //   vm.mother = {};
    //
    //   vm.ageIsValid = undefined;
    //   vm.firstNameIsValid = undefined;
    //   vm.lastNameIsValid = undefined;
    //   vm.membershipIsValid = undefined;
    //   vm.surveyDate = new Date();
    //   vm.mother.ward = vm.selectedWard;
    // }

    vm.appIsOffline = !$rootScope.appOnline;

    vm.userHasAdminRole = false;
    vm.userHasUserRole = false;

    vm.authentication = Authentication;

    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.create = create;
    vm.update = update;
    vm.find = find;
    // vm.findOne = findOne;
    vm.today = today;

    vm.checkFirstNameIsValid = checkFirstNameIsValid;
    vm.checkLastNameIsValid = checkLastNameIsValid;
    vm.checkDeliveryDateIsValid = checkDeliveryDateIsValid;
    vm.childsBirthDateIsValid = childsBirthDateIsValid;
    vm.checkMembershipIsValid = checkMembershipIsValid;
    vm.checkAllFieldsValid = checkAllFieldsValid;

    function performTranslation() {
      $translate(['MOTHER_RECORD', 'UPDATE', 'CREATE', 'EXPECTED_DELIVERY_DATE',
        'EDIT_CHANGE_VALUES', 'ADD_NURSING_MOTHER', 'ADD_PREGNANT_WOMAN']).then(function (translations) {
        vm.motherRec = translations.MOTHER_RECORD;
        vm.updateMother = translations.UPDATE;
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

    function undefinedTurnFalse() {
      if (vm.firstNameIsValid === undefined) {
        vm.firstNameIsValid = false;
      }
      if (vm.lastNameIsValid === undefined) {
        vm.lastNameIsValid = false;
      }
      if (vm.membershipIsValid === undefined) {
        vm.membershipIsValid = false;
      }
    }

    function checkAllFieldsValid() {
      if (vm.firstNameIsValid === true &&
          vm.lastNameIsValid === true &&
          vm.membershipIsValid === true) {
        vm.allFieldsValid = true;
        vm.invalidFields = false;
      } else if (vm.firstNameIsValid === false ||
          vm.lastNameIsValid === false ||
          vm.membershipIsValid === false) {
        vm.allFieldsValid = false;
        vm.invalidFields = true;
      } else if ((vm.firstNameIsValid === undefined || vm.firstNameIsValid === true) &&
          (vm.lastNameIsValid === undefined || vm.lastNameIsValid === true) &&
          (vm.membershipIsValid === undefined || vm.membershipIsValid === true)) {
        vm.allFieldsValid = true;
      }
    }

    function checkFirstNameIsValid() {
      if (vm.mother.firstName) {
        if (vm.mother.firstName.length < 1) {
          vm.firstNameIsValid = false;
        } else {
          vm.firstNameIsValid = true;
        }
      } else {
        vm.firstNameIsValid = false;
      }
      vm.checkAllFieldsValid();
    }

    function checkLastNameIsValid() {
      if (vm.mother.lastName) {
        if (vm.mother.lastName.length < 1) {
          vm.lastNameIsValid = false;
        } else {
          vm.lastNameIsValid = true;
        }
      } else {
        vm.lastNameIsValid = false;
      }
      vm.checkAllFieldsValid();
    }

    function checkDeliveryDateIsValid() {
      var rightNow = new Date();
      var deliverDelta = moment(vm.mother.deliverDate).diff(moment(rightNow), 'months');
      if (deliverDelta > 9 ) {
        vm.deliveryDateIsValid = false;
      } else {
        vm.deliveryDateIsValid = true;
      }
      vm.checkAllFieldsValid();
    }

    function childsBirthDateIsValid() {
      var rightNow = new Date();
      var childsBirthDate = moment(vm.mother.childsBirthDate).diff(moment(rightNow), 'months');
      if (childsBirthDate > 36 || childsBirthDate < 0) {
        vm.childsBirthDateIsValid = false;
      } else {
        vm.childsBirthDateIsValid = true;
      }
      vm.checkAllFieldsValid();
    }

    function checkMembershipIsValid() {
      if (vm.mother.memberStatus === 'Yes' || vm.mother.memberStatus === 'No' || vm.mother.memberStatus === 'Unknown') {
        vm.membershipIsValid = true;
      } else {
        vm.membershipIsValid = false;
      }
      vm.checkAllFieldsValid();
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

    function updated(mother) {
      vm.mother = mother;
    }

    function motherUpdated(mother) {
      $state.go('children.listMothers', { stakeDB: vm.stakeDB, stakeName: vm.stakeName,
        searchFilter: FilterService.currentListFilter(), colorFilter: FilterService.currentColorFilter(),
        screenType: vm.nursingMother ? 'nursing' : 'pregnant'});
    }

    function addedError(error) {
      vm.newMotherError = error;
    }

    function newMother(motherCreated) {
      vm.mother = motherCreated;
      $state.go('children.listMothers', { stakeDB: vm.stakeDB, stakeName: vm.stakeName,
        searchFilter: FilterService.currentListFilter(), colorFilter: FilterService.currentColorFilter(),
        screenType: vm.nursingMother ? 'nursing' : 'pregnant'});
    }

    function errorHandle(error) {
      vm.newMotherError = error;
    }
    // Create new Mother
    function create(isValid) {
      if (vm.mother.hasOwnProperty('_id')) {
        PouchService.insert(vm.mother, motherUpdated, addedError);
      } else {
        vm.error = null;

        if (!isValid) {
          undefinedTurnFalse();
          vm.invalidFields = true;
          return false;
        } else {
          vm.invalidFields = false;
        }

        var motherObject = {
          created: vm.dt,
//          birthDate: vm.mother.birthDate,
          firstName: vm.mother.firstName,
          lastName: vm.mother.lastName,
          comments: vm.mother.comments,
          address: vm.mother.address,
          city: vm.mother.city,
          ward: vm.mother.ward,
          phone: vm.mother.phone,
          memberStatus: vm.mother.memberStatus,
          _id: 'mthr_',
          interviewer: localStorage.getItem('lastInterviewer')
        };
        vm.nursingMother ? motherObject.childsBirthDate = vm.mother.childsBirthDate : motherObject.deliveryDate = vm.mother.deliveryDate ;

        PouchService.insert(motherObject, newMother, errorHandle);

        vm.mother.firstName = '';
        vm.mother.lastName = '';
        vm.mother.comments = '';
        vm.mother.address = '';
        vm.mother.city = '';
        vm.mother.ward = '';
        vm.mother.memberStatus = '';
        vm.mother.phone = '';
        vm.nursingMother ? vm.mother.childsBirthDate = '' : vm.mother.deliveryDate = '';
      }
    }

    var removeResponse = function (res) {
      vm.remResponse = res;
      $state.go('children.listMothers', { stakeDB: vm.stakeDB, stakeName: vm.stakeName,
        searchFilter: FilterService.currentListFilter(), colorFilter: FilterService.currentColorFilter(),
        screenType: vm.nursingMother ? 'nursing' : 'pregnant'});
    };

    var removeError = function (error) {
      vm.remError = error;
    };

    // Remove existing Mother
    function remove(mother) {
      if (mother) {
        PouchService.remove(mother, removeResponse, removeError);
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

    // var setMothers = function (res) {
    //   vm.motherList = FilterService.searchAndFilter(res.docs, '', FilterService.currentColorFilter(), 'firstName');
    //   //     vm.motherList = res.docs;
    // };
    //
    // var listMotherErrors = function (error) {
    //   vm.error = error;
    // };

    // Find a list of Mother
    // function find() {
    //   PouchService.queryPregnantWomen(setMothers, listMotherErrors);
    // }

    // var getUser = function (motherDoc) {
    //   vm.mother = motherDoc;
    // };
    // var getError = function (error) {
    //   vm.getError = error;
    // };
    // Find existing Mother
    // function findOne() {
    //   //     var something = $stateParams;
    //   PouchService.get({ motherId: vm.motherId }, getUser, getError);
    // }

    vm.invalidInput = function () {
      return ModalService.infoModal('Input Error:', 'Invalid or Missing data', 'Please correct or enter required fields');
    };

    // find();
  }
}());
