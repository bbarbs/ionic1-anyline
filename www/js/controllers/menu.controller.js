/**
 * App controller, injected in app.js as dependency.
 **/
angular.module('menu.controller', [])

/**
 * Controller of menu.html.
 * see: app.js ui-router configuration.
 **/
.controller('MenuCtrl', function ($q, $scope, $state, $timeout, $rootScope, $ionicLoading, $ionicHistory, PouchDBService, UtilityService, LocalStorage, CutoutAlignment) {
    // Scope data objects.
    $scope.data = {
        userFullname: LocalStorage.get('userFullname')
    };
    // Load all data stored in locastorage.
    $rootScope.settings.listOfAlignment = $rootScope.settings.listOfAlignment.concat(CutoutAlignment);
    $rootScope.settings.cutoutAlignment.position = LocalStorage.get('cutoutAlignment');
    $rootScope.settings.meterBeepOnResult = LocalStorage.get('meterBeepOnResult') == 1 ? true : false;
    $rootScope.settings.meterVibrateOnResult = LocalStorage.get('meterVibrateOnResult') == 1 ? true : false;
    $rootScope.settings.meterBlinkOnResult = LocalStorage.get('meterBlinkOnResult') == 1 ? true : false;
    $rootScope.settings.tagVibrateOnRead = LocalStorage.get('tagVibrateOnRead') == 1 ? true : false;
    $rootScope.settings.tagBeepOnRead = LocalStorage.get('tagBeepOnRead') == 1 ? true : false;
    $rootScope.settings.confirmDelete = LocalStorage.get('confirmDelete') == 1 ? true : false;
    $rootScope.settings.listSwipeable = LocalStorage.get('listSwipeable') == 1 ? true : false;

    // Check what state is active.
    $scope.isActive = function (stateName) {
        var active = stateName == $state.current.name;
        return active;
    };

    // Get the first letter of user name and set to uppercase.
    $scope.getAndSetToUppercase = function (username) {
        return username.charAt(0).toUpperCase();
    };

    // Remove all user data stored in locastorage.
    function clearUserStorage() {
        LocalStorage.removeItem('userPk');
        LocalStorage.removeItem('username');
        LocalStorage.removeItem('password');
        LocalStorage.removeItem('userFullname');
    }

    // Logout.
    $scope.logout = function () {



        PouchDBService.remove('station_1');
        PouchDBService.remove('station_2');



        // Remove all user details from localstorage.
        clearUserStorage();
        // Navigate to login page.
        $state.go('home.login');
        // Clear history and cache.
        $scope.$on('$ionicView.afterLeave', function () {
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
        });
        // Show loading bar.
        $ionicLoading.show({
            template: '<ion-spinner></ion-spinner><span style="font-size: 12px; float: right; margin: 0 0 0 15px; padding: 5px;">Logging out...</span>'
        });
        $timeout(function () {
            // Complete loading.
            $ionicLoading.hide();
        }, 5000);
    };

    // Listen to event on init database.
    var onInitDB = $scope.$on('$listener:onInitDB', function () {
        // Watch db changes.
        PouchDBService.watchDBChange();
        // Load meter reading list.
        PouchDBService.query('flow-meter-list', 'flowMeter')
            .then(function (res) {
                // Add list to global scope.
                $rootScope.list.flowMeterList = $rootScope.list.flowMeterList.concat(PouchDBService.mapDoctoArray(res));
            }).catch(function (err) {
                console.log(err);
            });
        // Load save nfc tag.
        PouchDBService.query('nfc-tag-list', 'nfcTag')
            .then(function (res) {
                // Add list of nfc tag message to list.
                $rootScope.list.nfcTagList = $rootScope.list.nfcTagList.concat(PouchDBService.mapDoctoArray(res));
            }).catch(function (err) {
                console.log(err);
            });
    });

    // Check if location is enabled.
    if (window.cordova) {
        UtilityService.checkLocation()
            .catch(function (error) {
                if (error.code !== cordova.plugins.locationAccuracy.ERROR_USER_DISAGREED) {
                    // Popup.
                    $ionicPopup.show({
                        cssClass: 'myPopup',
                        title: 'Error set Location Mode',
                        template: 'Would you like to switch to the Location Settings page and do this manually?',
                        buttons: [{
                            text: 'No'
                    }, {
                            text: 'Yes',
                            onTap: function (e) {
                                cordova.plugins.diagnostic.switchToLocationSettings();
                            }
                    }]
                    });
                }
            });
    }

    // Listen to event when scope is destroyed.
    $scope.$on('$destroy', function () {
        onInitDB();
    });
});