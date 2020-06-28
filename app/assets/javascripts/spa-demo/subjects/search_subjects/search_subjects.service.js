(function () {
    "use strict";

    angular
        .module("spa-demo.subjects")
        .service("spa-demo.subjects.searchSubjects", SearchSubjects);

    SearchSubjects.$inject =
        ["$rootScope", "$q", "$resource", "spa-demo.authz.Authz", "spa-demo.subjects.Thing",
            "spa-demo.subjects.ThingImage", "spa-demo.config.APP_CONFIG"];


    function SearchSubjects($rootScope, $q, $resource, Authz, Thing, ThingImage, APP_CONFIG) {

        var typesResource = $resource(APP_CONFIG.server_url + "/api/types");
        var service = this;

        service.version = 0;
        service.things = [];
        service.thingIdx = null;
        service.thing_images = [];
        service.types = [];
        service.refresh = refresh;
        service.refreshThingImages = refreshThingImages;

        refresh();

        $rootScope.$watch(function () {
            return Authz.getAuthorizedUserId();
        }, refresh);

        return;

        ////////////////
        function refresh() {
            console.log("refresh");

            var p1 = refreshThings();
            var p2 = refreshTypes();
            $q.all([p1, p2]).then(
                function () {
                    console.log("refreshed");
                });
        }

        function refreshThingImages(thing_id) {
            var result = ThingImage.query({thing_id: thing_id});
            result.$promise.then(
                function (thing_images) {
                    service.thing_images = thing_images;
                    service.version += 1;
                    console.log("refreshThingImages", service.thing_images);
                });
            return result.$promise;
        }

        function refreshThings() {
            var result = Thing.query();
            result.$promise.then(
                function (things) {
                    service.things = things;
                    service.version += 1;
                    if (!service.thingIdx || service.thingIdx > things.length) {
                        service.thingIdx = 0;
                    }
                    console.log("refreshThings", service);
                });
            return result.$promise;
        }

        function refreshTypes() {
            var result = typesResource.query();
            result.$promise.then(
                function (types) {
                    service.types = types;
                    service.version += 1;
                    console.log("refreshTypes", service);
                });
            return result.$promise;
        }
    }

    SearchSubjects.prototype.getImages = function () {
        return this.images;
    }

    SearchSubjects.prototype.getThings = function () {
        return this.things;
    }

    SearchSubjects.prototype.getThingImages = function () {
        return this.thing_images;
    }

    SearchSubjects.prototype.getTypes = function () {
        return this.types;
    }

    SearchSubjects.prototype.getCurrentThing = function () {
        return this.things.length > 0 ? this.things[this.thingIdx] : null;
    }

    SearchSubjects.prototype.setCurrentImage = function (index) {
        if (index >= 0 && this.images.length > 0) {
            this.imageIdx = (index < this.images.length) ? index : 0;
        } else if (index < 0 && this.images.length > 0) {
            this.imageIdx = this.images.length - 1;
        } else {
            this.imageIdx = null;
        }

        console.log("setCurrentImage", this.imageIdx, this.getCurrentImage());
        return this.getCurrentImage();
    }

    SearchSubjects.prototype.setCurrentThing = function (id, skipImage) {

        var thingIdx = this.things.findIndex(function (thing) {
            return thing.id === id;
        });

        if (thingIdx === -1) {
            this.thingIdx = null;
            this.thing_images = [];
        } else {
            this.thingIdx = thingIdx;
            this.thing_images = this.refreshThingImages(id);
        }

        if (!skipImage) {
            //this.setCurrentImageForCurrentThing();
        }

        console.log("setCurrentThing", this.thingIdx, this.getCurrentThing(), this.thing_images);
        return this.getCurrentThing();
    }

    SearchSubjects.prototype.setCurrentImageForCurrentThing = function () {
        var image = this.getCurrentImage();
        var thing = this.getCurrentThing();
        if (!thing) {
            this.imageIdx = null;
        } else if ((thing && (!image || thing.thing_id !== image.thing_id)) || image.priority !== 0) {
            for (var i = 0; i < this.images.length; i++) {
                image = this.images[i];
                if (image.thing_id === thing.thing_id && image.priority === 0) {
                    this.setCurrentImage(i, true);
                    break;
                }
            }
        }
    }
})();
