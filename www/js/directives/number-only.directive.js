/**
 * App directive, injected in app.js as dependency.
 **/
angular.module('number-only.directive', [])

/**
 * Directive that make input element accept numbers only.
 * Usage: <input number-only>
 **/
.directive('numberOnly', function () {
    return {
        require: 'ngModel',
        link: function (scope) {
            scope.$watch('data.editReadingMeter', function (newValue, oldValue) {
                var arr = String(newValue).split("");
                if (arr.length === 0) return;
                if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.')) return;
                if (arr.length === 2 && newValue === '-.') return;
                if (isNaN(newValue)) {
                    scope.data.editReadingMeter = oldValue;
                }
            });
        }
    };
});