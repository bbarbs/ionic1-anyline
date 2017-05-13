/**
 * App service, injected in app.js as dependency.
 **/
angular.module('nfc-writer.service', [])

/**
 * Near Field Communication write tag service.
 **/
.factory('NFCWriterService', function(PouchDBService, UtilityService) {
    var self = {};
    // Save tag.
    self.saveTagMessage = function (obj) {
        PouchDBService.put(obj)
            .then(function () {
                UtilityService.showToast('Tag Message Saved', 'long', 'bottom');
            })
            .catch(function (err) {
                UtilityService.showToast('Error Saving Tag', 'long', 'bottom');
                console.error(err);
            });
    };
    // Update tag.
    self.updateTagMessage = function (obj) {
        PouchDBService.update(obj)
            .then(function () {
                UtilityService.showToast('Tag Message Updated', 'long', 'bottom');
            })
            .catch(function (err) {
                UtilityService.showToast('Error Updating Tag', 'long', 'bottom');
                console.error(err);
            });
    };
    return self;
});