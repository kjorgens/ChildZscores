(function () {
  'use strict';

  angular
    .module ('children')
    .controller('ChildrenController', ChildrenController);

  ChildrenController.$inject = ['$rootScope', '$scope','$state', '$timeout', 'childResolve', 'ModalService', 'Authentication', 'ZScores','PouchService'];

  function ChildrenController($rootScope, $scope, $state, $timeout, child, ModalService, Authentication, ZScores, PouchService) {
    var vm = this;
    vm.child = child;
    vm.appIsOffline = !$rootScope.appOnline;
    //
    //vm.appIsOffline = true;

    if(vm.child.firstName){
      checkAllFieldsValid();
    }
//    vm.zscoreString = childInfoString();
    vm.authentication = Authentication;
    vm.error = null;
    vm.form = {};
    vm.remove = remove;
    vm.create = create;
//    vm.addSurvey = addSurvey;
    vm.update = update;
    vm.find = find;
    vm.findOne = findOne;
//    vm.fileToPouch = fileToPouch;
    vm.setMonthCount = setMonthCount;
    vm.today = today;
    vm.checkFirstNameIsValid = checkFirstNameIsValid;
    vm.checkLastNameIsValid = checkLastNameIsValid;
    vm.checkGenderIsValid = checkGenderIsValid;
    //vm.checkHeightIsValid = checkHeightIsValid;
    //vm.checkWeightIsValid = checkWeightIsValid;
    vm.checkMotherIsValid = checkMotherIsValid;
    vm.checkFatherIsValid = checkLastNameIsValid;
    vm.checkStreetAddressIsValid = checkStreetAddressIsValid;
    vm.checkCityIsValid = checkCityIsValid;
    vm.checkStakeIsValid = checkStakeIsValid;
    vm.checkWardIsValid = checkWardIsValid;
    vm.checkMonthAgeIsValid = checkMonthAgeIsValid;
    vm.checkAllFieldsValid = checkAllFieldsValid;
//    vm.childInfoString = childInfoString;
//    vm.syncUpstream = syncUpstream;
    vm.ageIsValid = false;
    vm.childHeightIsValid = false;
    vm.childweightIsValid = false;
    vm.firstNameIsValid = true;
    vm.lastNameIsValid = true;
    vm.genderIsValid = true;
    //vm.heightIsValid = true;
    //vm.weightIsValid = true;
    vm.motherIsValid = true;
    vm.fatherIsValid = true;
    vm.birthDate = new Date (vm.child.birthDate) || new Date();
    vm.surveyDate = new Date ();
    //vm.survey = {};
    //vm.surveys = [];
    //vm.newChild = {};

    // Put event listeners into place

    //function fileToPouch(file, dbToCreate) {
    //  PouchService.createDatabase (dbToCreate);
    //}

    //function createDB(dbToCreate){
    //  PouchService.createDatabase (dbToCreate);
    //}

    function setSurveyList(surveys){
      $scope.$apply(function(){
        vm.surveys = surveys;
      });
    }

    function surveyErrors(error){
      vm.surveyError = error;
    }

    if($state.current.name !== 'children.edit'){
      PouchService.getSurveys(vm.child._id, setSurveyList, surveyErrors);
    }

    //   vm.db = new pouchDB('testDB');

    function checkAllFieldsValid() {
      checkFirstNameIsValid ();
      checkLastNameIsValid ();
      checkGenderIsValid ();
//      checkHeightIsValid ();
//      checkWeightIsValid ();
      checkMotherIsValid ();
      checkFatherIsValid ();
      checkStreetAddressIsValid ();
      checkCityIsValid ();
      checkStakeIsValid ();
      checkWardIsValid ();
      checkMonthAgeIsValid ();

      if (vm.firstNameIsValid === true && vm.lastNameIsValid === true && vm.genderIsValid === true) {
        vm.allFieldsValid = true;
      }
      else {
        vm.allFieldsValid = false;
      }
    }

 //   vm.zScoreGetter = ZScores.getMethod;

    function setMonthCount() {
      //if (vm.child.birthMonthsIn) {
      //  if (vm.childHeightIsValid && vm.childWeightIsValid) {
      //    vm.zScoreGetter (vm.child.gender, vm.child.monthAge, vm.child.height, vm.child.weight, function (zscore) {
      //      vm.child.zScore = zscore;
      //    });
      //    vm.zscoreString = childInfoString ();
      //  }
      //} else {
      var months;
      var birthDay = vm.birthDate.getDate ();
      var birthYear = vm.birthDate.getFullYear ();
      var birthMonth = vm.birthDate.getMonth ();
      var rightNow = new Date ();
      var y1 = ((rightNow.getFullYear () - 2001) * 365) + (rightNow.getMonth () * 30.5) + rightNow.getDay ();
      var y2 = (birthYear - 2001) * 365 + ((birthMonth - 1) * 30.5) + birthDay;
      vm.monthAge = Number((y1 - y2) / 30.5).toFixed(2);
      if (vm.monthAge > 60) {
        vm.ageIsValid = false;
      }
      else {
        vm.ageIsValid = true;
        vm.child.monthAge = vm.monthAge.toFixed(2);
        //if (vm.childHeightIsValid && vm.childWeightIsValid) {
        //  vm.zScoreGetter (vm.child.gender, vm.child.monthAge, vm.child.height, vm.child.weight, function (zscore) {
        //    vm.child.zScore = zscore;
        //  });
        //  vm.zscoreString = childInfoString ();
        //}
      }
      //     }
    }

    //function checkHeightIsValid () {
    //  if (vm.child.height) {
    //    if (vm.child.height > 110 || vm.child.height < 45) {
    //      vm.heightIsValid = false;
    //    }
    //    else {
    //      vm.heightIsValid = true;
    //      if (vm.ageIsValid && vm.weightIsValid) {
    //        vm.zScoreGetter (vm.child.gender, vm.child.birthMonthsIn || vm.monthAge, vm.child.height, vm.child.weight, function (zscore) {
    //          vm.child.zScore = zscore;
    //        });
    //        vm.zscoreString = childInfoString();
    //      }
    //    }
    //  }
    //  else {
    //    vm.heightIsValid = false;
    //  }
    //}
    //
    //function checkWeightIsValid () {
    //  if (vm.child.weight) {
    //    if (vm.child.weight > 18 || vm.child.weight < 3) {
    //      vm.weightIsValid = false;
    //    }
    //    else {
    //      vm.weightIsValid = true;
    //      if(vm.ageIsValid && vm.heightIsValid) {
    //        vm.zScoreGetter (vm.child.gender, vm.child.birthMonthsIn || vm.monthAge, vm.child.height, vm.child.weight, function (zscore) {
    //          vm.child.zScore = zscore;
    //        });
    //        vm.zscoreString = childInfoString ();
    //      }
    //    }
    //  }
    //  else {
    //    vm.weightIsValid = false;
    //  }
    //}

    function checkFirstNameIsValid() {
      if (vm.child.firstName) {
        if (vm.child.firstName.length < 1 || vm.child.firstName.length > 25) {
          vm.firstNameIsValid = false;
        }
        else {
          vm.firstNameIsValid = true;
        }
      }
      else {
        vm.firstNameIsValid = false;
      }
    }

    function checkLastNameIsValid() {
      if (vm.child.lastName) {
        if (vm.child.lastName.length < 1 || vm.child.lastName.length > 25) {
          vm.lastNameIsValid = false;
        }
        else {
          vm.lastNameIsValid = true;
        }
      }
      else {
        vm.lastNameIsValid = false;
      }
    }

    function checkGenderIsValid() {
      if (vm.child.gender) {
        vm.genderIsValid = true;
      }
      else {
        vm.genderIsValid = false;
      }
    }



    function checkMotherIsValid() {
      if (vm.child.mother) {
        if (vm.child.mother.length < 1 || vm.child.mother.length > 25) {
          vm.motherIsValid = false;
        }
        else {
          vm.motherIsValid = true;
        }
      }
      else {
        vm.motherIsValid = false;
      }
    }

    function checkFatherIsValid() {
      if (vm.child.father) {
        if (vm.child.father.length < 1 || vm.child.father.length > 25) {
          vm.fatherIsValid = false;
        }
        else {
          vm.fatherIsValid = true;
        }
      }
      else {
        vm.fatherIsValid = false;
      }
    }

    function checkStreetAddressIsValid () {
      if (vm.child.address) {
        if (vm.child.address.length < 1 || vm.child.address.length > 25) {
          vm.streetAddressIsValid = false;
        }
        else {
          vm.streetAddressIsValid = true;
        }
      }
      else {
        vm.streetAddressIsValid = false;
      }
    }

    function checkCityIsValid () {
      if (vm.child.city) {
        if (vm.child.city.length < 1 || vm.child.city.length > 25) {
          vm.cityIsValid = false;
        }
        else {
          vm.cityIsValid = true;
        }
      }
      else {
        vm.cityIsValid = false;
      }
    }


    function checkStakeIsValid () {
      if (vm.child.stake) {
        if (vm.child.stake.length < 1 || vm.child.stake.length > 25) {
          vm.stakeIsValid = false;
        }
        else {
          vm.stakeIsValid = true;
        }
      }
      else {
        vm.stakeIsValid = false;
      }
    }

    function checkWardIsValid () {
      if (vm.child.ward) {
        if (vm.child.ward.length < 1 || vm.child.ward.length > 25) {
          vm.wardIsValid = false;
        }
        else {
          vm.wardIsValid = true;
        }
      }
      else {
        vm.wardIsValid = false;
      }
    }

    function today() {
      vm.dt = new Date ();
    }
    vm.today ();

    vm.clear = function () {
      vm.dt = null;
    };

    vm.toggleMin = function () {
      vm.minDate = vm.minDate ? null : new Date ();
    };
    vm.toggleMin ();
    vm.maxDate = new Date ();
    var year = vm.maxDate.getFullYear ();
    var month = vm.maxDate.getMonth ();
    var day = vm.maxDate.getDate ();
    vm.minStartDate = new Date (year - 5, month, day);

    function checkMonthAgeIsValid() {
      if (vm.child.monthAge) {
        if (vm.child.monthAge.length < 1 || vm.child.monthAge.length > 60) {
          vm.monthAgeIsValid = false;
        }
        else {
          vm.monthAgeIsValid = true;
          vm.birthDate = new Date (year, month - vm.child.monthAge, day);
          vm.ageIsValid = true;
        }
      }
      else {
        vm.monthAgeIsValid = false;
      }
    }
    //function childInfoString(zscores) {
    //  if(vm.child.firstName) {
    //    return 'Age: ' + Number(vm.child.monthAge).toFixed (2) + ' months,' +
    //        '  Z scores: H/A:' + Number(vm.child.zScore.ha).toFixed (2) + ' W/A:' +
    //        Number(vm.child.zScore.wa).toFixed (2) + ' W/H:' +
    //        Number(vm.child.zScore.wl).toFixed (2);
    //  }
    //}

    //var replicateIn = function (input) {
    //  vm.repInData = input;
    //  $state.go('children.list');
    //};
    //
    //var replicateError = function (err) {
    //  vm.repError = err;
    //};
    //
    //function syncUpstream() {
    //  PouchService.sync ('http://192.168.0.50:5984/child_survey', replicateIn, replicateError);
    //}

    function updated(child){
      vm.child = child;
    }
    //function errorHandle(error){
    //  vm.error = error;
    //}

 //   vm.birthMonthsIn = 0;

//    function addSurvey(isValid) {
//      var bday = new Date(vm.child.birthDate);
//      var birthDay = bday.getDate ();
//      var birthYear = bday.getFullYear ();
//      var birthMonth = bday.getMonth ();
//
//      var rightNow = new Date ();
//      var y1 = ((rightNow.getFullYear () - 2001) * 365) + (rightNow.getMonth () * 30.5) + rightNow.getDay ();
//      var y2 = (birthYear - 2001) * 365 + ((birthMonth - 1) * 30.5) + birthDay;
//      var ageInMonths = (y1 - y2) / 30.5;
//      var zScore = {};
//      vm.zScoreGetter(vm.child.gender,vm.child.monthAge,vm.child.height,vm.child.weight, function(zscore){
//        vm.zScore = zscore;
////        vm.zscoreString = childInfoString ();
//      });
//
//      var surveyObject = {
//        owner: vm.child._id,
//        surveyDate: vm.dt,
//        zScore: vm.zScore,
//        gender: vm.child.gender,
//        weight: vm.child.weight,
//        height: vm.child.height,
//        monthAge: vm.child.monthAge,
//        comments: vm.child.comments,
//        interviewer: vm.authentication.user.displayName
//      };
//
//      //if($state.params.newSurvey === false) {
//      //  surveyObject._id = vm.child._id;
//      //  surveyObject._rev = vm.child._rev;
//      //}
//
//      function setSurveyList(surveys){
//        vm.surveys = surveys;
//      }
//
//      function surveyErrors(error){
//        vm.surveyError = error;
//      }
//
//      function newSurvey(survey) {
////        vm.child.surveys.push(survey);
////        PouchService.updateChild(vm.child, updated, errorHandle);
////        PouchService.getSurveys(vm.child._id, setSurveyList, surveyErrors);
//        $state.go('children.view',{ childId: vm.child._id });
//      }
//      function newChildError(error) {
//        vm.newChildError = error;
//      }
//      PouchService.insert (surveyObject, newSurvey, newChildError);
//    }
    function childUpdated(child) {
      $state.go ('children.view', { childId: child.id });
    }

    function addedError(error) {
      vm.newChildError = error;
    }

    function newChild(childCreated) {
      //      childObject.surveys.push(survey);
      //     PouchService.addNew(childObject, updated, errorHandle);
      vm.child = childCreated;
      $state.go ('children.view', { childId: vm.child.id });
      //      $location.path ('children/' + value.id);
    }

    function errorHandle(error) {
      vm.newChildError = error;
    }
    // Create new Child
    function create(isValid) {
      if (vm.child._id){
        PouchService.insert (vm.child, childUpdated, addedError);
      } else {
        vm.error = null;
        if (!isValid) {
          $scope.$broadcast ('show-errors-check-validity', 'childForm');

          return false;
        }
        var birthDay = vm.birthDate.getDate ();
        var birthYear = vm.birthDate.getFullYear ();
        var birthMonth = vm.birthDate.getMonth ();

        var rightNow = new Date ();
        var y1 = ((rightNow.getFullYear () - 2001) * 365) + (rightNow.getMonth () * 30.5) + rightNow.getDay ();
        var y2 = (birthYear - 2001) * 365 + ((birthMonth - 1) * 30.5) + birthDay;
        var ageInMonths = Math.round((y1 - y2) / 30.5);
        var zScore = {};
        //vm.zScoreGetter(this.gender,ageInMonths,this.height,this.weight, function(zscore){
        //  vm.zScore = zscore;
        //});

        //var surveyObject = {
        //  created: vm.dt,
        //  zScore: vm.child.zScore,
        //  weight: vm.child.weight,
        //  height: vm.child.height,
        //  comments: vm.child.comments,
        //  interviewer: vm.authentication.user.displayName
        //};

        var childObject = {
          created: vm.dt,
          monthAge: Number(vm.child.monthAge).toFixed(2) || ageInMonths.toFixed(2),
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
          interviewer: vm.authentication.user.displayName
          //       branch: this.branch
        };

        //    function updated(data){
        //      vm.updated = data;
        //    }
        //


        PouchService.insert (childObject, newChild, errorHandle);
        //     PouchService.insert (childObject, newChildRef, newChildError);
        //     var child = new Children (childObject);


        //     child.$save(function (response) {
        //       $location.path('children/' + response._id);
        ////       vm.birthDate = Date.now;
        vm.created = Date.now;
        vm.birthdate = '';
        vm.monthAge = 0;
        //vm.weight = '';
        //vm.height = '';
        vm.firstName = '';
        vm.lastName = '';
        vm.comments = '';
        vm.father = '';
        vm.mother = '';
        vm.address = '';
        vm.city = '';
        vm.stake = '';
        vm.ward = '';
      }
    }

    var removeResponse = function (res) {
      vm.remResponse = res;
//      $location.path('');
    };

    var removeError = function (error) {
      vm.remError = error;
    };

    // Remove existing Child
    function remove(child) {
      if (child) {
        vm.surveys.docs.forEach(function(toRemove){
          PouchService.remove (toRemove, removeResponse, removeError);
        });
        PouchService.remove (child, removeResponse, removeError);
        $state.go('children.list');
        //for (var i in vm.children) {
        //  if (vm.children[i] === child) {
        //    vm.children.splice(i, 1);
        //  }
        //}
      }
    }

    // Update existing Child
    function update(isValid) {
      vm.error = null;

      if (!isValid) {
        $scope.$broadcast ('show-errors-check-validity', 'childForm');
        return false;
      }
      var child = vm.child;
      PouchService.put (child);
    }

    var setChildren = function (res) {
      vm.children = res;
    };

    var listChildrenErrors = function (error) {
      vm.error = error;
    };

    // Find a list of Children
    function find() {
      PouchService.getAll (setChildren, listChildrenErrors);
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
      PouchService.get ({ childId: vm.childId }, getUser, getError);
    }
  }
})();
