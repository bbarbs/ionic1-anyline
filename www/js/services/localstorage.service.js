/**
 * App service, injected in app.js as dependency.
 **/
angular.module('localstorage.service', [])

/**
 * Store data in localstorage.
 * Usage: LocalStorage.set('name', 'Logimine');
 *        console.log(LocalStorage.get('name'));
 *        LocalStorage.setObject('salary', {
 *        name: 'Mark',
 *        text: 'Hoping someday will increase.'
 *        });
 *        var increase = LocalStorage.getObject('salary');
 *        console.log(increase);
 **/
.factory('LocalStorage', function ($window) {
    // Saving value to localstorage by its key and value.
    var self = {};

    // Save single data.
    self.set = function (key, value) {
        $window.localStorage[key] = value;
    };
    // Get specific value by its key.
    self.get = function (key, defaultValue) {
        return $window.localStorage[key] || defaultValue;
    };
    // Save multiple values with single key in json format.
    self.setObject = function (key, value) {
        $window.localStorage[key] = JSON.stringify(value);
    };
    // Get data in json format.
    self.getObject = function (key) {
        return JSON.parse($window.localStorage[key] || '{}');
    };
    // Remove item in localstorage.
    self.removeItem = function (key) {
        return $window.localStorage.removeItem(key);
    };
    // Remove all data in local storage.
    self.removeAll = function () {
        return $window.localStorage.clear();
    };

    return self;
});