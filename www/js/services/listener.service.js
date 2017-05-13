/**
 * App service, injected in app.js as dependency.
 **/
angular.module('listener.service', [])

/**
 * Listener service.
 **/
.factory('ListenerService', function ($timeout, $rootScope) {
    var self = {};

    // Event listener for database initialization.
    self.onInitDB = function () {
        $timeout(function () {
            $rootScope.$broadcast('$listener:onInitDB');
        }, 500);
    };

    // Event listener when user delete data while viewing it.
    self.onViewDelete = function (item) {
        $timeout(function () {
            $rootScope.$broadcast('$listener:onViewDelete', item);
        }, 500);
    };

    // Event listener when user delete data in list.
    self.onListDelete = function (item) {
        $rootScope.$broadcast('$listener:onListDelete', item);
    };

    // Event listener when user undo the delete.
    self.onUndoDelete = function () {
        $rootScope.$broadcast('$listener:onUndoDelete');
    };

    // Event listener when user successfully scan tag upon doing meter reading.
    self.onStartMeterReading = function (item) {
        $timeout(function() {
            $rootScope.$broadcast('$listener:onStartMeterReading', item);
        },500);
    };

    return self;
});