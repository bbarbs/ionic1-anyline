/**
 * App service, injected in app.js as dependency.
 **/
angular.module('anyline.service', [])

/**
 * Anyline service to scan meter reader.
 **/
.factory('AnylineService', function ($q) {
    var self = {};

    // Scan flow meter.
    self.scanMeter = function (sdkName, scanMode, config) {
        if (window.cordova) {
            var deferred = $q.defer();
            cordova.exec(function (success) {
                deferred.resolve(success);
            }, function (error) {
                deferred.reject(error);
            }, sdkName, scanMode, config);
            return deferred.promise;
        }
    };
    return self;
});