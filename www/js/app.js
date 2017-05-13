/**
 * Local db.
 **/
var db;

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('meterReader', ['ionic', 'ngCordova', 'ng-mfb', 'ionic-color-picker', 'jett.ionic.filter.bar', 'angular-svg-round-progressbar', 'flow-meter-list.controller', 'menu.controller', 'settings.controller', 'view-meter.controller', 'login.controller', 'nfc-scan-tag.controller', 'nfc-tag-list.controller', 'nfc-write-tag.controller', 'anyline.service', 'utility.service', 'localstorage.service', 'pouchdb.service', 'view-meter.service', 'listener.service', 'nfc-protocol.service', 'nfc-writer.service', 'number-only.directive', 'focus-me.directive'])

.run(function ($ionicPlatform, $ionicHistory, $q, $state, $rootScope, $ionicPopup, PouchDBService, DesignDoc, UtilityService, LocalStorage, ListenerService) {
    // Global list.
    $rootScope.list = {
        flowMeterList: [],
        syncMeterList: [],
        unsyncMeterList: [],
        nfcTagList: []
    };
    // Global objects.
    $rootScope.objects = {
        readerResult: {},
        GPSProperties: {}
    };
    // States name.
    $rootScope.states = {
        previousState: '',
        currentState: ''
    };
    // List of settings data.
    $rootScope.settings = {
        appVersionNumber: '',
        listOfAlignment: [],
        cutoutAlignment: {
            position: ''
        },
        meterBeepOnResult: true,
        meterVibrateOnResult: true,
        meterBlinkOnResult: true,
        tagVibrateOnRead: true,
        tagBeepOnRead: true,
        confirmDelete: true,
        listSwipeable: true
    };
    // Global class.
    $rootScope.class = {
        navBarBorder: ''
    };
    // Global notifier.
    $rootScope.notifier = {
        isTagReadOnly: false
    };

    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        // Initialize database.
        PouchDBService.initDB()
            .then(function () {
                ListenerService.onInitDB();
            })
            .catch(function (err) {
                console.error(err);
            });

        // Wait for device ready.
        document.addEventListener('deviceready', function () {
            // Get app version number.
            UtilityService.getAppVersionNumber()
                .then(function (version) {
                    // Save version number to global data.
                    $rootScope.settings.appVersionNumber = version;
                });
        }, false);
    });

    // Callback when hardware back button is used.
    // Applicable on android.
    $ionicPlatform.registerBackButtonAction(function (e) {
        if ($rootScope.isHardwareBackButtonPressed) {
            // Exit app if hardware back button is pressed continuosly twice.
            ionic.Platform.exitApp();
        } else if ($ionicHistory.backView()) {
            // Back to previous view if not from login.
            if ($rootScope.states.previousState !== 'home.login') {
                $ionicHistory.goBack();
            }
        } else {
            // Notify that hardware backbutton if pressed.
            $rootScope.isHardwareBackButtonPressed = true;
            // Show exit message.
            UtilityService.showToast('Press again to exit', 'short', 'bottom');
            // Change value of notifier.
            $timeout(function () {
                $rootScope.isHardwareBackButtonPressed = false;
            }, 1000);
        }
        e.preventDefault();
        return false;
    }, 100);

    // Listener when state change start.
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
        // Navigate to login when conditions is not meet.
        if (LocalStorage.get('userPk') === undefined && toState.name !== "" && toState.isLoginRequired) {
            event.preventDefault();
            $state.go('home.login');
        } else if (LocalStorage.get('userPk') === undefined && fromState.name === "" && toState.isLoginRequired) {
            event.preventDefault();
            $state.go('home.login');
        }
    });

    // Listener when state change successfully.
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState) {
        // Get state names.
        $rootScope.states.previousState = fromState.name;
        $rootScope.states.currentState = toState.name;
    });
})

/**
 * UI-router config.
 **/
.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider

        .state('home', {
        url: '/home',
        abstract: true,
        templateUrl: 'templates/home.html'
    })

    .state('home.login', {
        cache: false,
        url: '/login',
        views: {
            'homeContent': {
                templateUrl: 'templates/login.html',
                controller: 'LoginCtrl'
            }
        },
        isLoginRequired: false
    })

    .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'MenuCtrl'
    })

    .state('app.flow-meter-list', {
        url: '/flow-meter-list',
        views: {
            'menuContent': {
                templateUrl: 'templates/flow-meter-list.html',
                controller: 'FlowMeterListCtrl'
            }
        },
        isLoginRequired: true
    })

    .state('app.nfc-tag-list', {
        url: '/nfc-tag-list',
        views: {
            'menuContent': {
                templateUrl: 'templates/nfc-tag-list.html',
                controller: 'NFCTagListCtrl'
            }
        },
        isLoginRequired: true
    })

    .state('app.nfc-scan-tag', {
        url: '/nfc-scan-tag/:scan_action/:tag_message',
        views: {
            'menuContent': {
                templateUrl: 'templates/nfc-scan-tag.html',
                controller: 'NFCScanTagCtrl'
            }
        },
        isLoginRequired: true
    })

    .state('app.nfc-write-tag', {
        url: '/nfc-write-tag/:tag_id/:tag_message',
        views: {
            'menuContent': {
                templateUrl: 'templates/nfc-write-tag.html',
                controller: 'NFCWriteTagCtrl'
            }
        },
        isLoginRequired: true
    })

    .state('app.view-meter', {
        url: '/view-meter/:flow_id/:tag_message',
        views: {
            'menuContent': {
                templateUrl: 'templates/view-meter.html',
                controller: 'ViewMeterCtrl'
            }
        },
        isLoginRequired: true
    })

    .state('app.settings', {
        url: '/settings',
        views: {
            'menuContent': {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsCtrl'
            }
        },
        isLoginRequired: true
    });

    // If none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise(function ($injector, $location) {
        var $state = $injector.get("$state");
        $state.go("app.flow-meter-list");
        //$state.go("app.nfc-tag-list");
        //$state.go('app.nfc-write-tag');
        //$state.go('app.nfc-scan-tag');
    });
})

/**
 * Constant variables for creating design doc.
 **/
.constant('DesignDoc', [
    {
        'viewName': 'flow-meter-list'
    },
    {
        'viewName': 'meter-station-list'
    },
    {
        'viewName': 'nfc-tag-list'
    }
])

/**
 * List of cut out alignment on reading meter.
 **/
.constant('CutoutAlignment', [
    {
        'position': 'top'
    },
    {
        'position': 'top_half'
    },
    {
        'position': 'center'
    },
    {
        'position': 'bottom'
    },
    {
        'position': 'bottom_half'
    }
]);