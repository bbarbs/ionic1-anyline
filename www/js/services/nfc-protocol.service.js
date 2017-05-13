/**
 * App service, injected in app.js as dependency.
 **/
angular.module('nfc-protocol.service', [])

/**
 * Near Field Communication protocol service.
 **/
.factory('NFCProtocolService', function ($q, $rootScope, UtilityService) {
    var self = {};

    // Scan tag.
    self.scanTag = function () {
        if (window.cordova) {
            var q = $q.defer();
            nfc.addNdefListener(function (nfcEvent) {
                q.resolve(nfcEvent);
            });
            return q.promise;
        }
    };

    // Stop listener.
    self.stopScan = function () {
        if (window.cordova) {
            var q = $q.defer();
            nfc.removeNdefListener(function (nfcEvent) {
                q.resolve(nfcEvent);
            });
            return q.promise;
        }
    };

    // Write tag.
    self.writeTag = function (tagMessage) {
        if (window.cordova) {
            var q = $q.defer();
            nfc.addNdefListener(function (nfcEvent) {
                // Data to record in tag.
                var record = [
                    ndef.textRecord(tagMessage)
                ];
                // Check if tag if mark read only.
                if ($rootScope.notifier.isTagReadOnly) {
                    var readOnly = function () {
                        nfc.makeReadOnly(function () {
                            q.resolve();
                        }, function () {
                            q.reject();
                        });
                    };
                    nfc.write(record, readOnly);
                } else {
                    nfc.write(record, function () {
                        q.resolve();
                    }, function (err) {
                        q.reject(err);
                    });
                }
            });
            return q.promise;
        }
    };

    // Erase tag.
    self.eraseTag = function () {
        if (window.cordova) {
            var q = $q.defer();
            nfc.erase(function () {
                q.resolve;
            }, function () {
                q.reject();
            });
            return q.promise;
        }
    };

    // Show nfc settings.
    self.showNFCSettings = function () {
        if (window.cordova) {
            return nfc.showSettings();
        }
    };

    // Check if nfc is enable/supported in device.
    self.isNFCEnable = function () {
        if (window.cordova) {
            var q = $q.defer();
            nfc.enabled(function () {
                q.resolve();
            }, function (err) {
                q.reject(err);
            });
            return q.promise;
        }
    };

    return self;
});