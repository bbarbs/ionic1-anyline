/**
 * App service, injected in app.js as dependency.
 **/
angular.module('view-meter.service', [])

/**
 * Service for global functions used in view-meter controller.
 **/
.factory('ViewMeterService', function (PouchDBService, UtilityService) {
    var self = {};
    // Save meter reader.
    self.saveReading = function (obj) {
        PouchDBService.put(obj)
            .then(function () {
                UtilityService.showToast('Meter Reading Saved', 'long', 'bottom');
            })
            .catch(function (err) {
                UtilityService.showToast('Error Saving Meter', 'long', 'bottom');
                console.error(err);
            });
    };
    // Update meter reader.
    self.updateReading = function (obj) {
        PouchDBService.update(obj)
            .then(function () {
                UtilityService.showToast('Meter Reading Updated', 'long', 'bottom');
            })
            .catch(function (err) {
                UtilityService.showToast('Error Updating Meter', 'long', 'bottom');
                console.error(err);
            });
    };
    return self;
});