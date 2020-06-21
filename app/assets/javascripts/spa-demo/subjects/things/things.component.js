(function() {
  "use strict";

  angular
    .module("spa-demo.subjects")
    .component("sdThingEditor", {
      templateUrl: thingEditorTemplateUrl,
      controller: ThingEditorController,
      bindings: {
        authz: "<"
      },
      require: {
        thingsAuthz: "^sdThingsAuthz"
      }      
    })
    .component("sdThingSelector", {
      templateUrl: thingSelectorTemplateUrl,
      controller: ThingSelectorController,
      bindings: {
        authz: "<"
      }
    })
    ;


  thingEditorTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function thingEditorTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.thing_editor_html;
  }    
  thingSelectorTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];
  function thingSelectorTemplateUrl(APP_CONFIG) {
    return APP_CONFIG.thing_selector_html;
  }    

  ThingEditorController.$inject = ["$scope","$q",
                                   "$state","$stateParams",
                                   "spa-demo.authz.Authz",
                                   "spa-demo.subjects.Thing",
                                   "spa-demo.subjects.ThingImage",
                                   "spa-demo.subjects.ThingTag"];
  function ThingEditorController($scope, $q, $state, $stateParams, 
                                 Authz, Thing, ThingImage, ThingTag) {
    var vm=this;
    vm.create = create;
    vm.clear  = clear;
    vm.update  = update;
    vm.remove  = remove;
    vm.haveDirtyLinks = haveDirtyLinks;
    vm.haveDirtyTags = haveDirtyTags;
    vm.updateImageLinks = updateImageLinks;
    vm.updateTagLinks = updateTagLinks;

    vm.$onInit = function() {
      console.log("ThingEditorController",$scope);
      $scope.$watch(function(){ return Authz.getAuthorizedUserId(); }, 
                    function(){ 
                      if ($stateParams.id) {
                        reload($stateParams.id); 
                      } else {
                        newResource();
                      }
                    });
    }

    return;
    //////////////
    function newResource() {
      vm.item = new Thing();
      vm.thingsAuthz.newItem(vm.item);
      return vm.item;
    }

    function reload(thingId) {
      var itemId = thingId ? thingId : vm.item.id;      
      console.log("re/loading thing", itemId);
      vm.images = ThingImage.query({thing_id:itemId});
      vm.tags = ThingTag.query({thing_id:itemId});
      vm.item = Thing.get({id:itemId});
      vm.thingsAuthz.newItem(vm.item);
      vm.images.$promise.then(
        function(){
          angular.forEach(vm.images, function(ti){
            ti.originalPriority = ti.priority;            
          });                     
        });
      $q.all([vm.item.$promise,vm.images.$promise,vm.tags.$promise]).catch(handleError);
    }
    function haveDirtyLinks() {
      for (var i=0; vm.images && i<vm.images.length; i++) {
        var ti=vm.images[i];
        if (ti.toRemove || ti.originalPriority != ti.priority) {
          return true;
        }        
      }
      return false;
    }
    function haveDirtyTags() {
      for (var i=0; vm.tags && i<vm.tags.length; i++) {
        var ti=vm.tags[i];
        if (ti.toRemove) {
          return true;
        }        
      }
      return false;
    }    

    function create() {      
      vm.item.errors = null;
      vm.item.$save().then(
        function(){
          console.log("thing created", vm.item);
          $state.go(".",{id:vm.item.id});
        },
        handleError);
    }

    function clear() {
      newResource();
      $state.go(".",{id: null});    
    }

    function update() {      
      vm.item.errors = null;
      var update=vm.item.$update();
      updateImageLinks(update);
      updateTagLinks(update);
    }
    function updateImageLinks(promise) {
      console.log("updating links to images");
      var promises = [];
      if (promise) { promises.push(promise); }
      angular.forEach(vm.images, function(ti){
        if (ti.toRemove) {
          promises.push(ti.$remove());
        } else if (ti.originalPriority != ti.priority) {          
          promises.push(ti.$update());
        }
      });

      console.log("waiting for promises", promises);
      $q.all(promises).then(
        function(response){
          console.log("promise.all response", response); 
          //update button will be disabled when not $dirty
          $scope.thingform.$setPristine();
          reload(); 
        }, 
        handleError);    
    }

    function updateTagLinks(promise) {
      console.log("updating links to tags");
      var promises = [];
      if (promise) { promises.push(promise); }
      angular.forEach(vm.tags, function(ti){
        if (ti.toRemove) {
          promises.push(ti.$remove());
        }
      });

      console.log("waiting for promises", promises);
      $q.all(promises).then(
        function(response){
          console.log("promise.all response", response); 
          //update button will be disabled when not $dirty
          $scope.thingform.$setPristine();
          reload(); 
        }, 
        handleError);    
    }

    function remove() {      
      vm.item.$remove().then(
        function(){
          console.log("thing.removed", vm.item);
          clear();
        },
        handleError);
    }

    function handleError(response) {
      console.log("error", response);
      if (response.data) {
        vm.item["errors"]=response.data.errors;          
      } 
      if (!vm.item.errors) {
        vm.item["errors"]={}
        vm.item["errors"]["full_messages"]=[response]; 
      }      
      $scope.thingform.$setPristine();
    }    
  }

  ThingSelectorController.$inject = ["$scope",
                                     "$stateParams",
                                     "spa-demo.authz.Authz",
                                     "spa-demo.subjects.Thing"];
  function ThingSelectorController($scope, $stateParams, Authz, Thing) {
    var vm=this;

    vm.$onInit = function() {
      console.log("ThingSelectorController",$scope);
      $scope.$watch(function(){ return Authz.getAuthorizedUserId(); }, 
                    function(){ 
                      if (!$stateParams.id) {
                        vm.items = Thing.query();        
                      }
                    });
    }
    return;
    //////////////
  }

})();
