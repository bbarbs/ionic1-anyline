/**
 * App controller, injected in app.js as dependency.
 **/
angular.module('view-meter.controller', [])

/**
 * Controller of view-meter.html.
 * see: app.js ui-router configuration.
 **/
.controller('ViewMeterCtrl', function ($scope, $rootScope, $stateParams, $state, $timeout, $ionicPopover, $ionicModal, ViewMeterService, UtilityService, LocalStorage, ListenerService) {
    // View array.
    $scope.meterView = {};

    // Scope data objects.
    $scope.data = {
        readingDate: '',
        readingResult: '',
        editReadingMeter: '',
        latitude: '',
        longitude: '',
        isReadingMeterNew: false,
        imagePath: '',
        userFullname: LocalStorage.get('userFullname'),
        tagMessage: '',
        isMeterModified: false,
        meterStatus: ''
    };

    // Scope of classname object.
    $scope.className = {
        zoomButton: ''
    };

    // Save meter reading to database.
    $scope.saveReading = function () {
        // Objects to save in database.
        var obj = {
            _id: UtilityService.generateID('_flow_meter'),
            docType: 'flowMeter',
            readingResult: $scope.data.readingResult,
            imagePath: $scope.data.imagePath,
            readingDate: $scope.data.readingDate,
            latitude: $scope.data.latitude,
            longitude: $scope.data.longitude,
            isChecked: 0,
            userPk: LocalStorage.get('userPk'),
            userFullname: LocalStorage.get('userFullname'),
            isMeterModified: $scope.data.isMeterModified ? 1 : 0,
            dateModified: $scope.data.isMeterModified ? new Date().getTime() : null,
            userPkModified: $scope.data.isMeterModified ? LocalStorage.get('userPk') : null,
            userNameModified: $scope.data.isMeterModified ? LocalStorage.get('userFullname') : null
        };
        // Save data.
        ViewMeterService.saveReading(obj);
        // Back to list.
        $state.go('app.flow-meter-list');
    };

    function doDeleteMeter(obj) {
        // Broadcast event.
        ListenerService.onViewDelete(obj);
        // Back to list.
        $state.go('app.flow-meter-list');
    }

    // Delete reading from database.
    $scope.deleteReading = function () {
        // Check if confirm delete is enabled.
        if ($rootScope.settings.confirmDelete) {
            UtilityService.confirmDialog('Delete this meter reading?', 'Confirm Delete', ['Cancel', 'Delete'])
                .then(function (buttonIndex) {
                    switch (buttonIndex) {
                    case 2:
                        doDeleteMeter($scope.meterView);
                        break;
                    }
                });
        } else {
            doDeleteMeter($scope.meterView);
        }
    };

    // Popover.
    $ionicPopover.fromTemplateUrl('templates/view-meter-popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });

    // Show popover.
    $scope.openPopover = function (event) {
        $scope.popover.show(event);
    };

    // Modal.
    $ionicModal.fromTemplateUrl('templates/edit-meter-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Show modal to edit flow meter.
    $scope.editGasMeter = function () {
        // Get reading.
        $scope.data.editReadingMeter = $scope.data.readingResult;
        // Show modal.
        $scope.modal.show();
    };

    // Close edit modal.
    $scope.closeEditReading = function () {
        $scope.modal.hide();
    };

    // Data of previous meter reading result.
    var prevMeterResult;

    // Update edited meter.
    $scope.updateReading = function () {
        // Get meter result.
        prevMeterResult = $scope.data.readingResult;
        // Set date the reading edited.
        $scope.data.isMeterModified = prevMeterResult !== $scope.data.readingResult ? true : false;
        // Update reading result.
        $scope.data.readingResult = $scope.data.editReadingMeter;
        // If data is not new, update the local database.
        if (!$scope.data.isReadingMeterNew && $scope.data.isMeterModified) {
            $scope.meterView.isMeterModified = 1;
            $scope.meterView.readingResult = $scope.data.editReadingMeter;
            ViewMeterService.updateReading($scope.meterView);
        }
        $scope.modal.hide();
    };

    // Get month short name.
    function getMeterDate() {
        var date = new Date($scope.data.readingDate);
        var day = date.getDate();
        var month = UtilityService.getMonthName(date.getMonth());
        var year = date.getFullYear();
        var hours = date.getHours();
        var min = date.getMinutes();
        var format = day + ' ' + month + ' ' + year + ' ' + hours + ':' + min;
        return format;
    }

    // Share meter.
    $scope.shareReading = function () {
        var getBase64Image = function () {
                return UtilityService.getBase64Image($scope.data.imagePath);
            },
            shareMeter = function (img) {
                var message = '';
                message = 'Meter Type: ' + $scope.data.meterType + '\n' +
                    'Date: ' + getMeterDate() + '\n' +
                    'Reading Result: ' + $scope.data.readingResult + '\n' +
                    'Meter Station: ' + $scope.data.tagMessage + '\n' +
                    'Operator: ' + $scope.data.userFullname + '\n' +
                    'Latitude: ' + $scope.data.latitude + '\n' +
                    'Longitude: ' + $scope.data.longitude;
                // Share result.
                UtilityService.share(message, 'meterReadingImage', 'data:image/png;base64' + img);
            },
            catchError = function (err) {
                console.error(err);
            };
        // Do share.
        getBase64Image()
            .then(shareMeter)
            .catch(catchError);
    };

    // Mail reading result.
    $scope.mailReadMeter = function () {
        // Open native email.
        location.href = "mailto:?subject=Meter Reading Result&body=" +
            "Meter Type:%20" + $scope.data.meterType + "%0D%0A" +
            "Date:%20" + getMeterDate() + "%0D%0A" +
            "Reading Result:%20" + $scope.data.readingResult + "%0D%0A" +
            "Meter Station:%20" + $scope.data.tagMessage + "%0D%0A" +
            "Operator:%20" + $scope.data.userFullname + "%0D%0A" +
            "Latitude:%20" + $scope.data.latitude + "%0D%0A" +
            "Longitude:%20" + $scope.data.longitude;
        // Hide popover.
        $scope.popover.hide();
    };

    // Locate coordinates.
    $scope.showLocation = function () {
        // Open map.
        location.href = "geo:" + $scope.data.latitude + "," + $scope.data.longitude;
    };

    // Meter modification modal.
    $ionicModal.fromTemplateUrl('templates/meter-modified-info-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modifiedModal = modal;
    });

    // Show data of modified meter.
    $scope.showModifiedInfo = function () {
        $scope.modifiedModal.show();
    };

    // Close modification info meter modal.
    $scope.closeModificationModalInfo = function () {
        $scope.modifiedModal.hide();
    };

    // Copy result to clipboard.
    $scope.copyToClipboard = function () {
        var message = '';
        message = 'Meter Type: ' + $scope.data.meterType + '\n' +
            'Date: ' + getMeterDate() + '\n' +
            'Reading Result: ' + $scope.data.readingResult + '\n' +
            'Meter Station: ' + $scope.data.tagMessage + '\n' +
            'Operator: ' + $scope.data.userFullname + '\n' +
            'Latitude: ' + $scope.data.latitude + '\n' +
            'Longitude: ' + $scope.data.longitude;

        // Copy to clipboard.
        UtilityService.copyToClipboard(message)
            .then(function () {
                UtilityService.showToast('Text Copied to Clipboard', 'short', 'bottom');
            })
            .catch(function (err) {
                console.error(err);
            });
        // Hide popover.
        $scope.popover.hide();
    };

    // Watch meter edited scope.
    $scope.$watch('data.isMeterModified', function (newVal, oldVal) {
        if (newVal) {
            $scope.data.meterStatus = 'Meter Modified';
        } else {
            $scope.data.meterStatus = '';
        }
    });

    // Listen when view enter.
    $scope.$on('$ionicView.beforeEnter', function () {
        // Add class no border in nav bar.
        $rootScope.class.navBarBorder = 'no-border-bar';
        // Set the station name.
        $scope.data.tagMessage = $stateParams.tag_message;
        // Add class zoome out floating button.
        $scope.className.zoomButton = 'transform-zoomout';
        // Get data when from list.
        if ($stateParams.flow_id !== '') {
            // Notify that reading is old.
            $scope.data.isReadingMeterNew = false;
            // Loop and get data.
            for (var i = 0, flowList = $rootScope.list.flowMeterList.length; i < flowList; i++) {
                if ($stateParams.meter_id == $rootScope.list.flowMeterList[i]._id) {
                    // Add data to scope array.
                    $scope.meterView = $rootScope.list.flowMeterList[i];
                    // Reading result.
                    $scope.data.readingResult = $rootScope.list.flowMeterList[i].readingResult;
                    $scope.data.readingDate = $rootScope.list.flowMeterList[i].readingDate;
                    // Get GPS properties.
                    $scope.data.latitude = $rootScope.list.flowMeterList[i].latitude;
                    $scope.data.longitude = $rootScope.list.flowMeterList[i].longitude;
                    // Set image source.
                    $scope.data.imagePath = $rootScope.list.flowMeterList[i].imagePath;
                    // Get date edited if present.
                    $scope.data.isMeterModified = $rootScope.list.flowMeterList[i].isMeterModified == 1 ? true : false;
                    break;
                }
            }

            // Get data from global service when new reading.
        } else if ($stateParams.flow_id === '') {
            // Notify that reading is new.
            $scope.data.isReadingMeterNew = true;
            // Get reading data.
            $scope.data.readingResult = $rootScope.objects.readerResult.reading;
            $scope.data.readingDate = new Date().getTime();
            // Get GPS properties.
            $scope.data.latitude = $rootScope.objects.GPSProperties.latitude;
            $scope.data.longitude = $rootScope.objects.GPSProperties.longitude;
            // Set image source.
            $scope.data.imagePath = $rootScope.objects.readerResult.imagePath;
            // Set date edited to null.
            $scope.data.isMeterModified = false;
        }
    });

    // Listen when enter view.
    $scope.$on('$ionicView.enter', function () {
        // Add class zoom in floating buton.
        $scope.className.zoomButton = 'transform-zoomin';
    });

    // Listen when leaving view.
    $scope.$on('$ionicView.leave', function () {
        // Close popover.
        $scope.popover.hide();
        // Remove no border class in nav bar.
        $rootScope.class.navBarBorder = '';
    });
});