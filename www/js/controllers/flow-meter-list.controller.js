/**
 * App controller, injected in app.js as dependency.
 **/
angular.module('flow-meter-list.controller', [])

/**
 * Controller of flow-meter-list.html.
 * see: app.js ui-router configuration.
 **/
.controller('FlowMeterListCtrl', function ($q, $scope, $timeout, $rootScope, $ionicLoading, $state, $ionicPopup, $ionicListDelegate, $ionicFilterBar, AnylineService, UtilityService, PouchDBService, ListenerService) {

    // Object for deleted data.
    var undoDeleteObj = {};

    // Scope of data objects.
    $scope.data = {
        viewTitle: 'My Reading',
        hasDeletedData: false
    };

    // Scope of classname object.
    $scope.className = {
        zoomButton: ''
    };

    // Scope of style.
    $scope.styleValue = {
        roundButtonBottom: '30px'
    };

    // Format date and time.
    $scope.formatDateTime = function (date) {
        return UtilityService.formatDateTime(date);
    };

    // Order list by date.
    $scope.orderByDate = function (item) {
        return parseInt(item.readingDate);
    };

    // Scan tag.
    $scope.scanTag = function () {
        // Check if location is enabled.
        UtilityService.checkLocation()
            .then(function () {
                // Do scan if location is enabled.
                $state.go('app.nfc-scan-tag', {
                    scan_action: 'read-flow-meter'
                });
            })
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
    };

    // Single delete meter.
    $scope.onSingleDelete = function (item) {
        // Check if confirm delete is enabled.
        if ($rootScope.settings.confirmDelete) {
            UtilityService.confirmDialog('Delete this meter reading?', 'Confirm Delete', ['Cancel', 'Delete'])
                .then(function (buttonIndex) {
                    switch (buttonIndex) {
                    case 2:
                        // Broadcast event on delete.
                        ListenerService.onListDelete(item);
                        break;
                    }
                });
        } else {
            // Broadcast event on delete.
            ListenerService.onListDelete(item);
        }
        // Close option button.
        $ionicListDelegate.closeOptionButtons();
    };

    // Filter instance.
    var filterBarInstance;

    // Show filter bar.
    $scope.showFilterBar = function () {
        filterBarInstance = $ionicFilterBar.show({
            items: $rootScope.list.flowMeterList,
            update: function (filteredItems, filterText) {
                $rootScope.list.flowMeterList = filteredItems;
            }
        });
    };

    // Undo deleted data.
    $scope.undoDelete = function () {
        // Broadcast event that user undo the deleted meter.
        ListenerService.onUndoDelete();
    };

    // Variable for delay on hiding undo footer.
    var onHideUndo;

    // Do delete.
    function doOnDelete(data) {
        // Instantiate var.
        onHideUndo = undefined;
        undoDeleteObj = {};
        // Get deleted data which used when user undo it.
        undoDeleteObj = data;
        // Remove data in list.
        var index = PouchDBService.binarySearch($rootScope.list.flowMeterList, data._id);
        $rootScope.list.flowMeterList.splice(index, 1);
        // Change round button bottom value.
        $scope.styleValue.roundButtonBottom = '65px';
        // Show undo footer.
        $scope.data.hasDeletedData = true;
        // Do time delay before hiding footer and removing data.
        onHideUndo = $timeout(function () {
            // Hide footer and back to default position the floating button.
            $scope.styleValue.roundButtonBottom = '30px';
            $scope.data.hasDeletedData = false;
            // Get image path.
            var path = 'file://' + data.imagePath;
            // Remove data in local database.
            PouchDBService.remove(data._id);
            // Remove image from cache.
            UtilityService.removeFile(path);
        }, 4000);
    }

    // Listen to event when data is deleted while on view.
    var onViewDelete = $scope.$on('$listener:onViewDelete', function (evt, data) {
        // Show undo.
        doOnDelete(data);
    });

    // Listen to event when data is deleted in list.
    var onListDelete = $scope.$on('$listener:onListDelete', function (evt, data) {
        // Show undo.
        doOnDelete(data);
    });

    // Listen to event when user undo the delete.
    var onUndoDelete = $scope.$on('$listener:onUndoDelete', function () {
        // Cancel timeout on undo.
        $timeout.cancel(onHideUndo);
        // Back bottom to default.
        $scope.styleValue.roundButtonBottom = '30px';
        // Hide footer.
        $scope.data.hasDeletedData = false;
        // Save the undo event.
        PouchDBService.upSert(undoDeleteObj)
            .catch(function (err) {
                UtilityService.showToast('Cannot undo data', 'long', 'bottom');
                console.error(err);
            });
    });

    // Listen to event on start meter reading.
    var onStartMeterReading = $scope.$on('$listener:onStartMeterReading', function (evt, nfcEvent) {

        // Validate nfc event.

        // Geolocation config.
        var posOptions = {
            timeout: 5000,
            enableHighAccuracy: true,
            maximumAge: 3000
        };

        // Configuration.
        // see: https://documentation.anyline.io/
        var config = ["eyJzY29wZSI6WyJCQVJDT0RFIiwiTVJaIiwiRU5FUkdZIiwiQU5ZTElORV9PQ1IiLCJET0NVTUVOVCIsIkFMTCJdLCJwbGF0Zm9ybSI6WyJpT1MiLCJBbmRyb2lkIiwiV2luZG93cyJdLCJ2YWxpZCI6IjIwMTctMDItMjUiLCJtYWpvclZlcnNpb24iOiIzIiwiaXNDb21tZXJjaWFsIjpmYWxzZSwidG9sZXJhbmNlRGF5cyI6NjAsImlvc0lkZW50aWZpZXIiOlsiY29tLmxvZ2ltaW5lLm1ldGVyUmVhZGVyIl0sImFuZHJvaWRJZGVudGlmaWVyIjpbImNvbS5sb2dpbWluZS5tZXRlclJlYWRlciJdLCJ3aW5kb3dzSWRlbnRpZmllciI6WyJjb20ubG9naW1pbmUubWV0ZXJSZWFkZXIiXX0KdUVQVWFqMzlPQjBiZEsza3BIUGo3UVZGYm90dW9nMWlhYlMvYjVabkdlRU1kb1FJSDlBZFlzZjRZVnhXbjJKenRzdzVDYjZ0UGxQYm5OMEZkV3VrWjdaUDJUay9aTlExeXhUamZyVVVITnJUMG8rVE9oVTVKbWJ4MzhjRWZ0bGs0T2ZjaXFBWHVLaVArV2VmNE9aaVFkVmwyb3dtRmZmV1ZKaW5EVVVoeHcvbEZyeWlXWUo5eE1vc2RyQ3B4Y0lWM0xtWVNSY2hqQ3J2OW9YWHlpVEZQQ3grcnRWS0xpRVhHclExVnlOM0xSWm5GanNQU0tpYXlpbkd4VGI1QzdpNnNRZS93WVdMTmpwYTlOTU9tbW5idFJ6TCswcnhqWW5UZFozQ3VoQmhjbmN3cnVRdXBwNitrM1ZhZ1ZyZGRwS0V3NEt3V3dLRW1HWGRGSGlEdlN1QnBRPT0=",
            {
                "captureResolution": "1080p",

                "cutout": {
                    "style": "rect",
                    "alignment": $rootScope.settings.cutoutAlignment.position,
                    "offset": {
                        "x": 0,
                        "y": 120
                    },
                    "strokeWidth": 2,
                    "cornerRadius": 4,
                    "strokeColor": "FFFFFF",
                    "outerColor": "000000",
                    "outerAlpha": 0.3
                },
                "flash": {
                    "mode": "manual",
                    "alignment": "bottom_right"
                },
                "meterBeepOnResult": $rootScope.settings.meterBeepOnResult,
                "meterVibrateOnResult": $rootScope.settings.meterVibrateOnResult,
                "blinkAnimationOnResult": $rootScope.settings.meterBlinkOnResult,
                "cancelOnResult": true,
                "reportingEnabled": true
        }
    ];

        // Promise chain.
        var scanMeter = function () {
                return AnylineService.scanMeter('AnylineSDK', 'scanGasMeter', config)
                    .then(function (result) {
                        $rootScope.objects.readerResult = result;
                    });
            },
            getLocationCoordinates = function () {
                // Show loading bar.
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner><span style="font-size: 12px; float: right; margin: 0 0 0 15px; padding: 5px;">Getting location...</span>'
                });
                return UtilityService.getCurrentPosition(posOptions)
                    .then(function (position) {
                        $ionicLoading.hide();
                        // Gps properties.
                        $rootScope.objects.GPSProperties = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        };
                        $state.go('app.view-meter', {
                            flow_id: undefined,
                            tag_message:  ''// check tag nfcevent
                        });
                    });
            },
            catchError = function (error) {
                console.error(error);
                $ionicLoading.hide();
            };

        // Start meter reading.
        $timeout(function () {
            scanMeter()
                .then(getLocationCoordinates)
                .catch(catchError);
        }, 200);
    });

    // Listen when view enter.
    $scope.$on('$ionicView.beforeEnter', function () {
        // Add class zoome out floating button.
        $scope.className.zoomButton = 'transform-zoomout';
    });

    // Listen when enter view.
    $scope.$on('$ionicView.enter', function () {
        // Add class zoom in floating buton.
        $scope.className.zoomButton = 'transform-zoomin';
    });

    // Listen when leaving view.
    $scope.$on('$ionicView.leave', function () {
        // Close option button.
        $ionicListDelegate.closeOptionButtons();
    });

    // Listen to event when scope is destroyed.
    $scope.$on('$destroy', function () {
        // Unsubcribe to listeners when scope is detroyed.
        onViewDelete();
        onListDelete();
        onUndoDelete();
        onStartMeterReading();
    });
});