/**
 * App controller, injected in app.js as dependency.
 **/
angular.module('nfc-tag-list.controller', [])

/**
 * Controller of nfc-configuration-list.html.
 * see: app.js ui-router configuration.
 **/
.controller('NFCTagListCtrl', function ($scope, $rootScope, $state, $timeout, $ionicPopover, $ionicListDelegate, $ionicFilterBar, $ionicModal, UtilityService, ListenerService, PouchDBService) {

    // Object for deleted data.
    var undoDeleteObj = {};

    // Scope of data object.
    $scope.data = {
        closeMfbButton: closed,
        hasDeletedData: false
    };

    // Scope icon list.
    $scope.icon = {
        active: 'ion-android-close',
        resting: 'ion-android-add',
        scan: 'ion-android-wifi',
        write: 'ion-android-create',
        erase: 'ion-android-delete'
    };

    // Scope of classname object.
    $scope.className = {
        zoomButton: ''
    };

    // Scope of style.
    $scope.styleValue = {
        roundButtonBottom: '2px'
    };

    // Check/scan tag.
    $scope.scanTag = function () {
        $state.go('app.nfc-scan-tag', {
            scan_action: 'check-tag',
            tag_message: undefined
        });
    };

    // Erase tag.
    $scope.eraseTag = function () {
        $state.go('app.nfc-scan-tag', {
            scan_action: 'erase-tag',
            tag_message: undefined
        });
    };

    // Backdrop click.
    $scope.onBackDropClick = function () {
        // Close floating button.
        $scope.data.closeMfbButton = closed;
    };

    // Filter list.
    $scope.showFilterBar = function () {
        // Close floating button if open.
        $scope.data.closeMfbButton = closed;
    };

    // Write mesage on tag.
    $scope.writeTag = function () {
        $state.go('app.nfc-write-tag', {
            tag_id: undefined,
            tag_message: undefined
        });
    };

    // Edit tag message.
    $scope.editTagMessage = function (item) {
        $state.go('app.nfc-write-tag', {
            tag_id: item._id,
            tag_message: item.tagMessage
        });
    };

    // Order list by date.
    $scope.orderByDate = function (item) {
        return parseInt(item.dateAdded);
    };
    // Filter instance.
    var filterBarInstance;

    // Show filter bar.
    $scope.showFilterBar = function () {
        filterBarInstance = $ionicFilterBar.show({
            items: $rootScope.list.nfcTagList,
            update: function (filteredItems, filterText) {
                $rootScope.list.nfcTagList = filteredItems;
            }
        });
    };

    // Popover.
    $ionicPopover.fromTemplateUrl('templates/nfc-tag-list-popover.html', {
        scope: $scope
    }).then(function (popover) {
        $scope.tagListPopover = popover;
    });

    // Get tag message from popover.
    var tagMessageOnPopover;

    // Open popover.
    $scope.openTagListPopover = function (item, event) {
        // Get tag message.
        tagMessageOnPopover = '';
        tagMessageOnPopover = item.tagMessage;
        // Display popover.
        $scope.tagListPopover.show(event);
    };

    // Write tag.
    $scope.onPopoverWriteTag = function () {
        $scope.tagListPopover.hide();
        $state.go('app.nfc-scan-tag', {
            scan_action: 'write-tag',
            tag_message: tagMessageOnPopover
        });
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
        var index = PouchDBService.binarySearch($rootScope.list.nfcTagList, data._id);
        $rootScope.list.nfcTagList.splice(index, 1);
        // Change round button bottom value.
        $scope.styleValue.roundButtonBottom = '35px';
        // Show undo footer.
        $scope.data.hasDeletedData = true;
        // Do time delay before hiding footer and removing data.
        onHideUndo = $timeout(function () {
            // Hide footer and back to default position the floating button.
            $scope.styleValue.roundButtonBottom = '2px';
            $scope.data.hasDeletedData = false;
            // Remove data in local database.
            PouchDBService.remove(data._id);
        }, 4000);
    }

    // Delete tag by single.
    $scope.onSingleDelete = function (item) {
        // Check if confirm delete is enabled.
        if ($rootScope.settings.confirmDelete) {
            UtilityService.confirmDialog('Delete this tag message?', 'Confirm Delete', ['Cancel', 'Delete'])
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

    // Undo deleted data.
    $scope.undoDelete = function () {
        // Broadcast event that user undo the deleted meter.
        ListenerService.onUndoDelete();
    };

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
        $scope.styleValue.roundButtonBottom = '2px';
        // Hide footer.
        $scope.data.hasDeletedData = false;
        // Save the undo event.
        PouchDBService.upSert(undoDeleteObj)
            .catch(function (err) {
                UtilityService.showToast('Cannot undo data', 'long', 'bottom');
                console.error(err);
            });
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

    // Listen when view leave.
    $scope.$on('$ionicView.leave', function () {
        // Close floating button.
        $scope.data.closeMfbButton = closed;
        // Close option button.
        $ionicListDelegate.closeOptionButtons();
    });

    // Listen to event when scope is destroyed.
    $scope.$on('$destroy', function () {
        // Unsubcribe to listeners when scope is detroyed.
        onViewDelete();
        onListDelete();
        onUndoDelete();
    });
});