/**
 * App directive, injected in app.js as dependency.
 **/
angular.module('focus-me.directive', [])

/**
 * Focus directive, use it when want the element to focus on load
 * put it in the label wrapping as attribute for input element.
 * Usage: focus-me
 **/
.directive('focusMe', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            $timeout(function () {
                element[0].focus();
            }, 150);
        }
    };
});