(function () {
    "use strict";

    angular
        .module("spa-demo.subjects")
        .component("sdSearchThings", {
            templateUrl: thingsTemplateUrl,
            controller: SearchThingsController,
        })
        .component("sdSearchThingInfo", {
            templateUrl: thingInfoTemplateUrl,
            controller: SearchThingInfoController,
        });

    thingsTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];

    function thingsTemplateUrl(APP_CONFIG) {
        return APP_CONFIG.search_things_html;
    }

    thingInfoTemplateUrl.$inject = ["spa-demo.config.APP_CONFIG"];

    function thingInfoTemplateUrl(APP_CONFIG) {
        return APP_CONFIG.search_thing_info_html;
    }

    SearchThingsController.$inject = ["$scope",
        "spa-demo.subjects.searchSubjects"];

    function SearchThingsController($scope, searchSubjects) {
        var vm = this;
        vm.things = [];
        vm.types = [];
        vm.selectedType = null;
        vm.thingClicked = thingClicked;
        vm.isCurrentThing = searchSubjects.isCurrentThingIndex;

        vm.$onInit = function () {
            console.log("SearchThingsController", $scope);
        }
        vm.$postLink = function () {
            $scope.$watch(
                function () {
                    return searchSubjects.getThings();
                },
                function (things) {
                    vm.things = things;
                }
            );
            $scope.$watch(
                function () {
                    return searchSubjects.getTypes();
                },
                function (types) {
                    vm.types = types;
                }
            );
            $scope.$watch(
                function () {
                    return vm.selectedType;
                },
                function () {
                    vm.things = filteredThings(vm.selectedType);
                    if (vm.things.length > 0) {
                        searchSubjects.setCurrentThing(vm.things[0].id);
                    } else {
                        searchSubjects.setCurrentThing(0);
                    }
                }
            );
        }
        return;

        //////////////
        function filteredThings(type_id) {
            console.log("filteredThings", type_id);
            var things = searchSubjects.getThings();
            if (type_id == null || type_id == "") {
                return things;
            }

            return things.filter(function (thing) {
                var index = thing.types.findIndex(function (type) {
                    return type.id == type_id;
                });

                console.log("filter", type_id, thing.types, index);

                return (index !== -1);
            });
        }

        function thingClicked(id) {
            searchSubjects.setCurrentThing(id);
        }
    }

    SearchThingInfoController.$inject = ["$scope",
        "spa-demo.subjects.searchSubjects",
        "spa-demo.subjects.Thing",
        "spa-demo.authz.Authz"];

    function SearchThingInfoController($scope, searchSubjects, Thing, Authz) {
        var vm = this;
        vm.nextThing = searchSubjects.nextThing;
        vm.previousThing = searchSubjects.previousThing;

        vm.$onInit = function () {
            console.log("SearchThingInfoController", $scope);
        }
        vm.$postLink = function () {
            $scope.$watch(
                function () {
                    return searchSubjects.getCurrentThing();
                },
                newThing
            );
            $scope.$watch(
                function () {
                    return Authz.getAuthorizedUserId();
                },
                function () {
                    newThing(searchSubjects.getCurrentThing());
                }
            );
        }
        return;

        //////////////
        function newThing(link) {
            console.log("newThing", link);
            vm.link = link;
            vm.thing = null;
            if (link && link.id) {
                vm.thing = Thing.get({id: link.id});
            }
        }
    }
})();
