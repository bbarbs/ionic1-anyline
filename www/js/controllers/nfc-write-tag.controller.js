/**
 * App controller, injected in app.js as dependency.
 **/
angular.module('nfc-write-tag.controller', [])

/**
 * Controller of nfc-write-tag.html.
 * see: app.js ui-router configuration.
 **/
.controller('NFCWriteTagCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicHistory, $ionicPopover, NFCWriterService, UtilityService, ListenerService, PouchDBService) {

    // Scope data object.
    $scope.data = {
        tagMessage: '',
        showWriteTag: false,
        showDeleteTag: false
    };

    // Order list by date.
    $scope.orderByDate = function (item) {
        return parseInt(item.dateAdded);
    };

    // Popover.
    $ionicPopover.fromTemplateUrl('templates/nfc-write-tag-popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.popover = popover;
    });

    // Show popover.
    $scope.openPopover = function (event) {
        // Display popover.
        $scope.popover.show(event);
    };

    // Check if tag exist.
    function isTagExist() {
        for (var i = 0; i < $rootScope.list.nfcTagList.length; i++) {
            if ($scope.data.tagMessage === $rootScope.list.nfcTagList[i].tagMessage) {
                return true;
            }
        }
        return false;
    }

    // Save tag message on database.
    $scope.saveTagMessage = function () {
        if ($scope.data.tagMessage === '') {
            UtilityService.showToast('Add Tag Name', 'short', 'bottom');
        } else {
            // Set fields.
            var obj = {
                _id: UtilityService.generateID('_nfc_tag'),
                tagMessage: $scope.data.tagMessage,
                docType: 'nfcTag',
                dateAdded: new Date().getTime()
            };
            // Check if tag already exist.
            if (isTagExist()) {
                UtilityService.showToast('Tag already exist', 'short', 'bottom');
            } else {
                // Save tag message.
                NFCWriterService.saveTagMessage(obj);
            }
            // Go back to list.
            $ionicHistory.goBack();
        }
    };

    // Move to scan tag and write.
    $scope.proceedWriteTag = function () {
        $scope.popover.hide();
        if ($scope.data.tagMessage === '') {
            UtilityService.showToast('Add Tag Name', 'short', 'bottom');
        } else {
            $state.go('app.nfc-scan-tag', {
                scan_action: 'write-tag',
                tag_message: $scope.data.tagMessage
            });
        }
    };

    function doDeleteTag() {
        var obj = {};
        // Get object.
        for (var i = 0; i < $rootScope.list.nfcTagList.length; i++) {
            if ($rootScope.list.nfcTagList[i]._id === $stateParams.tag_id) {
                obj = $rootScope.list.nfcTagList[i];
                break;
            }
        }
        // Broadcast event.
        ListenerService.onViewDelete(obj);
        // Back to list.
        $ionicHistory.goBack();
    }

    // Delete tag message.
    $scope.deleteTag = function () {
        // Check if confirm delete is enabled.
        if ($rootScope.settings.confirmDelete) {
            UtilityService.confirmDialog('Delete this tag message?', 'Confirm Delete', ['Cancel', 'Delete'])
                .then(function (buttonIndex) {
                    switch (buttonIndex) {
                    case 2:
                        doDeleteTag();
                        break;
                    }
                });
        } else {
            doDeleteTag();
        }
    };

    // Cancel write tag.
    $scope.cancelWriteTag = function () {
        // Update tag message of modified.
        if ($stateParams.tag_id !== '' && $stateParams.tag_message !== $scope.data.tagMessage) {
            for (var i = 0; i < $rootScope.list.nfcTagList.length; i++) {
                if ($rootScope.list.nfcTagList[i]._id === $stateParams.tag_id) {
                    // Update objects.
                    $rootScope.list.nfcTagList[i].tagMessage = $scope.data.tagMessage;
                    // Update database.
                    NFCWriterService.updateTagMessage($rootScope.list.nfcTagList[i]);
                    break;
                }
            }
        }
        // Go back to previous view.
        $ionicHistory.goBack();
    };

    // Select item on list.
    $scope.getTagOnList = function (item) {
        $scope.data.tagMessage = item.tagMessage;
    };

    // Listen when view leave.
    $scope.$on('$ionicView.leave', function () {
        // Hide popover.
        $scope.popover.hide();
    });

    // Listen when view is about to became active.
    $scope.$on('$ionicView.beforeEnter', function () {
        // Hide/show some item in popover.
        $scope.data.showWriteTag = true;

        if ($stateParams.tag_id === '') {
            // Hide delete on popover.
            $scope.data.showDeleteTag = false;
            // Clear tag message.
            $scope.data.tagMessage = '';
        } else if ($stateParams.tag_id !== '') {
            // Show delete on popover.
            $scope.data.showDeleteTag = true;
            // Get tag message.
            $scope.data.tagMessage = $stateParams.tag_message;
        }
    });
});