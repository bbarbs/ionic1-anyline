/**
 * App controller, injected in app.js as dependency.
 **/
angular.module('nfc-scan-tag.controller', [])

/**
 * Controller of nfc-scan-tag.html.
 * see: app.js ui-router configuration.
 **/
.controller('NFCScanTagCtrl', function ($scope, $rootScope, $state, $ionicHistory, $ionicModal, $stateParams, $timeout, LocalStorage, NFCProtocolService, UtilityService, ListenerService) {

    // Scope data objects.
    $scope.data = {
        scanTagData: '',
        dateScan: new Date(),
        user: LocalStorage.get('userFullname'),
        readOnlyRemark: '',
        showOnWriteTag: false,
        recordToWrite: ''
    };

    // Modal.
    $ionicModal.fromTemplateUrl('templates/view-check-tag-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.checkTagModal = modal;
    });

    // Close modal.
    $scope.closeCheckTag = function () {
        $scope.checkTagModal.hide();
    };

    // Make tag read only.
    $scope.makeTagReadOnly = function () {
        // Check tag notifier.
        if (!$rootScope.notifier.isTagReadOnly) {
            // Show dialog for confirmation
            UtilityService.confirmDialog('When the tag is made read only you will no longer be able to change it. This method cannot be undone.', 'Write Protection', ['Disagree', 'Agree'])
                .then(function (buttonIndex) {
                    switch (buttonIndex) {
                    case 2:
                        // Set tag as read only.
                        $rootScope.notifier.isTagReadOnly = true;
                        break;
                    }
                });
        } else {
            // Mark tag not read only.
            $rootScope.notifier.isTagReadOnly = false;
        }
    };

    // Check tag settings.
    function checkTagSettings() {
        if ($rootScope.settings.tagVibrateOnRead) {
            // Vibrate 100ms.
            UtilityService.vibrate(100);
        }
        if ($rootScope.settings.tagBeepOnRead) {
            // Beep 1 time.
            UtilityService.beep(1);
        }
    }

    // Do scan tag.
    var nfcScan = {
        scanTag: function () {
            NFCProtocolService.scanTag()
                .then(function (nfcEvent) {
                    // Get nfc payload data.
                    //$scope.data.scanTagData = .....;

                    // Check tag settings for action.
                    checkTagSettings();

                    if ($stateParams.scan_action === 'read-flow-meter') {
                        // Broadcast event to start meter reading.
                        ListenerService.onStartMeterReading(nfcEvent);
                        // Go back to previous view.
                        $ionicHistory.goBack();
                    } else if ($stateParams.scan_action === 'check-tag') {
                        // Show tag.
                        $scope.checkTagModal.show();
                        // Stop ndef listener.
                        NFCProtocolService.stopScan();
                    }
                });
        },
        writeTag: function () {
            NFCProtocolService.writeTag($stateParams.tag_message)
                .then(function () {
                    // Check tag settings for action.
                    checkTagSettings();
                }).catch(function (err) {
                    UtilityService.showToast('Cannot Write NDEF Message', 'long', 'bottom');
                    console.log(err);
                });
        },
        eraseTag: function () {
            NFCProtocolService.eraseTag()
                .then(function () {
                    // Check tag settings for action.
                    checkTagSettings();
                    // Go back to previous view.
                    $timeout(function () {
                        $ionicHistory.goBack();
                    }, 100);
                }).catch(function () {
                    UtilityService.showToast('Cannot Erase NDEF Message', 'long', 'bottom');
                });
        }
    };

    // Listen to event when modal is hidden.
    $scope.$on('modal.hidden', function () {
        // Start ndef listener.
        nfcScan.scanTag();
    });

    // Watch tag notifier.
    $scope.$watch('notifier.isTagReadOnly', function (newVal, oldVal) {
        if (newVal) {
            $scope.data.readOnlyRemark = 'Remove Read Only';
        } else {
            $scope.data.readOnlyRemark = 'Make Read Only';
        }
    });

    // Listen to event when about to enter the view.
    $scope.$on('$ionicView.beforeEnter', function () {
        // When doing write tag.
        if ($stateParams.scan_action === 'write-tag') {
            // Set tag read only notifier to default.
            $rootScope.notifier.isTagReadOnly = false;
            // Show read only button and write text.
            $scope.data.showOnWriteTag = true;
            // Get record to write in tag.
            $scope.data.recordToWrite = $stateParams.tag_message;
        } else {
            $scope.data.showOnWriteTag = false;
        }
    });
    
    // Listen to event when view became active.
    $scope.$on('$ionicView.enter', function () {
        if (window.cordova) {
            // Check if nfc is enabled or supported in device.
            NFCProtocolService.isNFCEnable()
                .then(function () {
                    if ($stateParams.scan_action === 'read-flow-meter' || $stateParams.scan_action === 'check-tag') {
                        // Scan tag.
                        nfcScan.scanTag();
                    } else if ($stateParams.scan_action === 'write-tag') {
                        // Write record on tag.
                        nfcScan.writeTag();
                    } else if ($stateParams.scan_action === 'erase-tag') {
                        // Erase record in tag.
                        nfcScan.eraseTag();
                    }
                }).catch(function (err) {
                    console.error(err);
                    // Alert dialog if device is not NFC supported.
                    if (err === 'NO_NFC') {
                        UtilityService.alertDialog('This device is not NFC supported.', 'Warning', 'Ok').then(function () {
                            // Go back to previous view.
                            $ionicHistory.goBack();
                        });
                    } else if (err === 'NFC_DISABLED') {
                        UtilityService.confirmDialog('NFC is not enabled. Redirect to NFC settings?', 'Disable NFC', ['Disagree', 'Agree'])
                            .then(function (buttonIndex) {
                                switch (buttonIndex) {
                                case 2:
                                    // Open NFC settings.
                                    NFCProtocolService.showNFCSettings();
                                    break;
                                }
                            });
                    }
                });
        }
    });

    // Listen to event when view leave.
    $scope.$on('$ionicView.leave', function () {
        // Stop the nfc listener.
        NFCProtocolService.stopScan();
    });
});