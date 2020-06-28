(function() {
    "use strict";

    angular
        .module("spa-demo.subjects")
        .factory("spa-demo.subjects.Subject", SubjectFactory);

    SubjectFactory.$inject = ["$resource","spa-demo.config.APP_CONFIG"];
    function SubjectFactory($resource, APP_CONFIG) {
        var service = $resource(APP_CONFIG.server_url + "/api/subjects",
            {},
            { query: { cache:false, isArray:true } }
        );
        return service;
    }
})();