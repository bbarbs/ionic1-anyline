/**
 * App service, injected in app.js as dependency.
 **/
angular.module('utility.service', [])

/**
 * Utility functions used in meter app.
 */
.factory('UtilityService', function ($q, $filter, $cordovaNetwork, $cordovaClipboard, $cordovaAppVersion, $cordovaSocialSharing, $cordovaGeolocation, $cordovaFile, $cordovaDialogs, $cordovaSpinnerDialog, $cordovaVibration) {
    var self = {};

    // Vibrate.
    self.vibrate = function (ms) {
        if (window.cordova) {
            return $cordovaVibration.vibrate(ms);
        }
    };

    // Toast message.
    self.showToast = function (msg, duration, position) {
        if (window.cordova) {
            window.plugins.toast.showWithOptions({
                message: msg,
                duration: duration,
                position: position,
                addPixelsY: -82
            });
        }
    };

    // Hide toast message.
    self.hideToast = function () {
        if (window.cordova) {
            return window.plugins.toast.hide();
        }
    };

    // Check if device is offline.
    self.isOffline = function () {
        if (window.cordova) {
            return $cordovaNetwork.isOffline();
        }
    };

    // Copy text to clipboard.
    self.copyToClipboard = function (text) {
        if (window.cordova) {
            return $q.when($cordovaClipboard.copy(text));
        }
    };

    // Paste to clipboard.
    self.pasteToClipboard = function () {
        if (window.cordova) {
            return $q.when($cordovaClipboard.paste());
        }
    };

    // Confirm dialog.
    self.confirmDialog = function (message, title, arrayButton) {
        if (window.cordova) {
            return $q.when($cordovaDialogs.confirm(message, title, arrayButton));
        }
    };

    // Prompt dialog.
    self.promptDialog = function (message, title, arrayButton, defaultText) {
        if (window.cordova) {
            return $q.when($cordovaDialogs.prompt(message, title, arrayButton, defaultText));
        }
    };

    // Alert dialog.
    self.alertDialog = function(message, title, buttonName) {
        if(window.cordova) {
            return $q.when($cordovaDialogs.alert(message, title, buttonName));
        }
    };

    // Beep.
    self.beep = function (count) {
        if (window.cordova) {
            return $cordovaDialogs.beep(count);
        }
    };

    // Vibrate.
    self.vibrate = function (times) {
        if (window.cordova) {
            return $cordovaVibration.vibrate(times);
        }
    };

    // Show spinner dialog.
    self.showSpinnerDialog = function (title, message, persistent) {
        if (window.cordova) {
            return $cordovaSpinnerDialog.show(title, message, persistent);
        }
    };

    // Hide spinner dialog.
    self.hideSpinnerDialog = function () {
        if (window.cordova) {
            return $cordovaSpinnerDialog.hide();
        }
    };

    // Speak text.
    self.textToSpeech = function (text, locale, rate) {
        if (window.cordova) {
            var deferred = $q.defer();
            TTS.speak({
                text: text,
                locale: locale,
                rate: rate
            }, function () {
                deferred.resolve();
            }, function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }
    };

    // Get app version number.
    self.getAppVersionNumber = function () {
        if (window.cordova) {
            return $q.when($cordovaAppVersion.getVersionNumber());
        }
    };

    // Share plugin.
    self.share = function (message, subject, file, link) {
        if (window.cordova) {
            return $q.when($cordovaSocialSharing.share(message, subject, file, link));
        }
    };

    // Get the geolocation of user.
    self.getCurrentPosition = function (options) {
        if (window.cordova) {
            return $q.when($cordovaGeolocation.getCurrentPosition(options));
        }
    };

    // Generate id.
    self.generateID = function (prefix) {
        var id = new Date().getTime();
        return id++ + prefix;
    };

    // Check if location is enabled.
    self.checkLocation = function () {
        if (window.cordova) {
            var deferred = $q.defer();
            cordova.plugins.locationAccuracy.request(function onRequestSuccess(success) {
                deferred.resolve(success);
            }, function onRequestFailure(error) {
                deferred.reject(error);
            }, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
            return deferred.promise;
        }
    };

    // Remove file.
    self.removeFile = function (path) {
        if (window.cordova) {
            var deferred = $q.defer();
            window.resolveLocalFileSystemURL(path, function (result) {
                result.remove(function (res) {
                    deferred.resolve();
                }, function (err) {
                    deferred.reject(err);
                });
            });
            return deferred.promise;
        }
    };

    // Convert image to base64.
    self.getBase64Image = function (path) {
        if (window.cordova) {
            var deferred = $q.defer();
            window.plugins.Base64.encodeFile(path, function (base64) {
                deferred.resolve(base64.replace('data:image/*;charset=utf-8;base64', ''));
            });
            return deferred.promise;
        }
    };

    // Show short month name.
    self.getMonthName = function (index) {
        var monthNames = [];
        monthNames[0] = "Jan";
        monthNames[1] = "Feb";
        monthNames[2] = "Mar";
        monthNames[3] = "Apr";
        monthNames[4] = "May";
        monthNames[5] = "Jun";
        monthNames[6] = "Jul";
        monthNames[7] = "Aug";
        monthNames[8] = "Sep";
        monthNames[9] = "Oct";
        monthNames[10] = "Nov";
        monthNames[11] = "Dec";
        return monthNames[index]
    };

    /** Sort array.
     * Usage:
     *  array.sort(
     *    array.sortBy(fieldName, true/false, function(a){
     *      return a;
     *    })
     *  );
     **/
    self.sortBy = function (field, reverse, primer) {
        var key = function (x) {
            return primer ? primer(x[field]) : x[field];
        };
        return function (a, b) {
            var A = key(a),
                B = key(b);
            return ((A < B) ? -1 : ((A > B) ? 1 : 0)) * [-1, 1][+!!reverse];
        };
    };

    // Get the recent date.
    function getPresentDate() {
        var d = new Date().getDate();
        var m = new Date().getMonth();
        var y = new Date().getFullYear();
        var fullDate = d + "-" + m + "-" + y;
        return fullDate;
    }

    // Format date and time.
    self.formatDateTime = function (obj) {
        var d = new Date(obj).getDate();
        var m = new Date(obj).getMonth();
        var y = new Date(obj).getFullYear();
        var full_ = d + "-" + m + "-" + y;
        if (getPresentDate() == full_) {
            return $filter('date')(new Date(obj), 'h:mm a');
        } else {
            return $filter('date')(new Date(obj), 'MMM d');
        }
    };

    // Generate random color.
    self.randomColor = function (brightness) {
        function randomChannel(brightness) {
            var r = 255 - brightness;
            var n = 0 | ((Math.random() * r) + brightness);
            var s = n.toString(16);
            return (s.length == 1) ? '0' + s : s;
        }
        return '#' + randomChannel(brightness) + randomChannel(brightness) + randomChannel(brightness);
    };

    return self;
});