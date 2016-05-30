(function () {
    'use strict'
    angular.module('app', ['ngRoute'])
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/quickstart', {
                    templateUrl: 'app/quick-start.html',
                    controller: 'QuickStartController',
                    controllerAs: 'quickStartCtrl'
                })
                .when('/scroll', {
                    templateUrl: 'app/components/scroll/scroll.html',
                    controller: 'ScrollController',
                    controllerAs: 'scrollCtrl'
                })
                .when('/accordion', {
                    templateUrl: 'app/components/accordion/accordion.html',
                    controller: 'AccordionController',
                    controllerAs: 'accordionCtrl'
                })
                .when('/tabs', {
                    templateUrl: 'app/components/tabs/tabs.html',
                    controller: 'TabsController',
                    controllerAs: 'tabsCtrl'
                })
                .when('/positions', {
                    templateUrl: 'app/work/positions/positions.html',
                    controller: 'PositionsController',
                    controllerAs: 'positionsCtrl'
                })
                .when('/dimensions', {
                    templateUrl: 'app/work/dimensions/dimensions.html',
                    controller: 'DimensionsController',
                    controllerAs: 'dimensionsCtrl'
                })
                .otherwise({
                    redirectTo: '/quickstart'
                });
        }])
        .controller('NavController', [function ($routeProvider) {
            var vm = this;
            this.menu = {
                component: {
                    isOpen: false,
                    items: [
                        'Scroll', 'Accordion', 'Tabs'
                    ]
                },
                work: {
                    isOpen: false,
                    items: [
                        'Positions', 'Dimensions'
                        ]
                }
            }
            this.title = 'Quick Start';
            this.toggle = function (value) {
                vm.menu[value].isOpen = !vm.menu[value].isOpen;
            }
            this.select = function (value) {
                this.selectedItem = value;
            }
        }])
        .controller('QuickStartController', [function ($routeProvider) {
            var vm = this;
            this.title = 'Quick Start';
        }]);

    angular.element(document).ready(function () {
        angular.bootstrap(document, ['app']);
    });

})();