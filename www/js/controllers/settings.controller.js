/**
 * App controller, injected in app.js as dependency.
 **/
angular.module('settings.controller', [])

/**
 * Controller of settings.html.
 * see: app.js ui-router configuration.
 **/
.controller('SettingsCtrl', function ($scope, $rootScope, $ionicModal, LocalStorage, PouchDBService, UtilityService) {
    // Scope data object.
    $scope.data = {
        itemBorderTop: '2px solid #A9A9A9'
    };

    // Save to local storage when cutout position change.
    $scope.cutoutChange = function (item) {
        LocalStorage.set('cutoutAlignment', item);
    };

    // List swipeable change.
    $scope.onListSwipeableChange = function () {
        var val = $rootScope.settings.listSwipeable ? 1 : 0;
        LocalStorage.set('listSwipeable', val);
    };

    // Tag vibrate change.
    $scope.onTagVibrateChange = function () {
        var val = $rootScope.settings.tagVibrateOnRead ? 1 : 0;
        LocalStorage.set('tagVibrateOnRead', val);
    };

    // Tag beep change.
    $scope.onTagBeepChange = function () {
        var val = $rootScope.settings.tagBeepOnRead ? 1 : 0;
        LocalStorage.set('tagBeepOnRead', val);
    };

    // Meter beep change.
    $scope.onMeterBeepChange = function () {
        var val = $rootScope.settings.meterBeepOnResult ? 1 : 0;
        LocalStorage.set('meterBeepOnResult', val);
    };

    // Meter vibrate change.
    $scope.onMeterVibrateChange = function () {
        var val = $rootScope.settings.meterVibrateOnResult ? 1 : 0;
        LocalStorage.set('meterVibrateOnResult', val);
    };

    // Meter blink change.
    $scope.onMeterBlinkChange = function () {
        var val = $rootScope.settings.meterBlinkOnResult ? 1 : 0;
        LocalStorage.set('meterBlinkOnResult', val);
    };

    // Confirm delete change.
    $scope.onConfirmDeleteChange = function () {
        var val = $rootScope.settings.confirmDelete ? 1 : 0;
        LocalStorage.set('confirmDelete', val);
    };

    // Sync option modal.
    $ionicModal.fromTemplateUrl('templates/sync-options-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.syncOptionsModal = modal;
    });

    // Show sync options.
    $scope.showSyncOptions = function () {
        $scope.syncOptionsModal.show();
    };

    // Close sync modal.
    $scope.closeSyncOptions = function () {
        $scope.syncOptionsModal.hide();
    };
});