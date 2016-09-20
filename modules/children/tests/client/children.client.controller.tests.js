(function () {
  'use strict';

  // Children Controller Spec
  describe('Children Controller Tests', function () {
    // Initialize global variables
    var ChildrenController,
      $scope,
      $httpBackend,
      $state,
      Authentication,
      ChildrenService,
      mockChild;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _Authentication_, _ChildrenService_) {
      // Set a new global scope
      $scope = $rootScope.$new();

      // Point global variables to injected services
      $httpBackend = _$httpBackend_;
      $state = _$state_;
      Authentication = _Authentication_;
      ChildrenService = _ChildrenService_;

      // create mock child
      mockChild = new ChildrenService({
        id: '525a8422f6d0f87f0e407a33',
        title: 'An Child about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Children controller.
      ChildrenController = $controller('ChildrenController as vm', {
        $scope: $scope,
        childResolve: {}
      });

      // Spy on state go
      spyOn($state, 'go');
    }));

    describe('vm.save() as create', function () {
      var sampleChildPostData;

      beforeEach(function () {
        // Create a sample child object
        sampleChildPostData = new ChildrenService({
          title: 'An Child about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        $scope.vm.child = sampleChildPostData;
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (ChildrenService) {
        // Set POST response
        $httpBackend.expectPOST('api/children', sampleChildPostData).respond(mockChild);

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

       // Test URL redirection after the child was created
        expect($state.go).toHaveBeenCalledWith('children.view', {
          childId: mockChild._id
        });
      }));

      it('should set $scope.vm.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/children', sampleChildPostData).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      });
    });

    describe('vm.save() as update', function () {
      beforeEach(function () {
        // Mock child in scope
        $scope.vm.child = mockChild;
      });

      it('should update a valid child', inject(function (ChildrenService) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/children\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        $scope.vm.save(true);
        $httpBackend.flush();

        // Test URL location to new object
        expect($state.go).toHaveBeenCalledWith('children.view', {
          childId: mockChild._id
        });
      }));

      it('should set $scope.vm.error if error', inject(function (ChildrenService) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/children\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        $scope.vm.save(true);
        $httpBackend.flush();

        expect($scope.vm.error).toBe(errorMessage);
      }));
    });

    describe('vm.remove()', function () {
      beforeEach(function () {
        // Create new children array and include the child
        $scope.vm.child = mockChild;
      });

      it('should delete the child and redirect to children', function () {
        // Return true on confirm message
        spyOn(window, 'confirm').and.returnValue(true);

        $httpBackend.expectDELETE(/api\/children\/([0-9a-fA-F]{24})$/).respond(204);

        $scope.vm.remove();
        $httpBackend.flush();

        expect($state.go).toHaveBeenCalledWith('children.list');
      });

      it('should should not delete the child and not redirect', function () {
        // Return false on confirm message
        spyOn(window, 'confirm').and.returnValue(false);

        $scope.vm.remove();

        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
}());
