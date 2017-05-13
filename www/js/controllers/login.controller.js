/**
 * App controller, injected in app.js as dependency.
 **/
angular.module('login.controller', [])

/**
 * Controller of login.html.
 * see: app.js ui-router configuration.
 **/
.controller('LoginCtrl', function ($q, $scope, $timeout, $rootScope, $state, $ionicLoading, UtilityService, LocalStorage, DesignDoc, PouchDBService, ListenerService) {
    // Set default value on settings.
    function setDefaultSettings() {
        var deferred = $q.defer();
        try {
            if (LocalStorage.get('cutoutAlignment') === undefined) {
                LocalStorage.set('cutoutAlignment', 'top');
            }
            if (LocalStorage.get('meterBeepOnResult') === undefined) {
                LocalStorage.set('meterBeepOnResult', 1);
            }
            if (LocalStorage.get('meterVibrateOnResult') === undefined) {
                LocalStorage.set('meterVibrateOnResult', 1);
            }
            if (LocalStorage.get('meterBlinkOnResult') === undefined) {
                LocalStorage.set('meterBlinkOnResult', 1);
            }
            if(LocalStorage.get('tagVibrateOnRead') === undefined){
                LocalStorage.set('tagVibrateOnRead', 1);
            }
            if(LocalStorage.get('tagBeepOnRead') === undefined){
                LocalStorage.set('tagBeepOnRead', 1);
            }
            if (LocalStorage.get('confirmDelete') === undefined) {
                LocalStorage.set('confirmDelete', 1);
            }
            if(LocalStorage.get('listSwipeable') === undefined) {
                LocalStorage.set('listSwipeable', 1);
            }
            deferred.resolve();
        } catch (err) {
            deferred.reject(err);
        }
        return deferred.promise;
    }

    // Validate user.
    function validateUser(user, pass) {
        var deferred = $q.defer();
        try {
            if (user === 'logimine' && pass === 'pcc4') {
                deferred.resolve();
            } else {
                deferred.reject({
                    error: 'not_authorized'
                });
            }
        } catch (err) {
            deferred.reject(err);
        }
        return deferred.promise;
    }

    // Login user
    $scope.login = function (user, pass) {
        // Show loading bar.
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner><span style="font-size: 12px; float: right; margin: 0 0 0 15px; padding: 5px;">Logging in...</span>'
        });
        // Start user validation.
        $timeout(function () {
            validateUser(user, pass)
                .then(setDefaultSettings)
                .then(PouchDBService.addDesignDoc(DesignDoc))
                .then(PouchDBService.preBuildQuery(DesignDoc))
                .then(function () {
                    // Hide loading bar.
                    $ionicLoading.hide();
                    // Save user credentials in local storage.
                    LocalStorage.set('userPk', 123);
                    LocalStorage.set('username', user);
                    LocalStorage.set('password', pass);
                    LocalStorage.set('userFullname', 'Logimine Asia');
                    // Broadcast listener to load data.
                    ListenerService.onInitDB();
                    // Change state.
                    $state.go('app.flow-meter-list');
                })
                .catch(function (err) {
                    console.error(err);
                    // Hide loading bar.
                    $ionicLoading.hide();
                    // Show toast message.
                    if (err.error === 'not_authorized') {
                        UtilityService.showToast('Error login. Kindly check username and password.', 'long', 'bottom');
                    } else {
                        UtilityService.showToast('Error login.', 'long', 'bottom');
                    }
                });
        }, 5000);
    };
});