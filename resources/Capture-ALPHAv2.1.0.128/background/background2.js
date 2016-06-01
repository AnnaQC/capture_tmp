'use strict';

/* global salesforce: false */

var rnd = Math.random();

var debug = 'background2.js->' + rnd + '->'; debug = false;

var bgLinkModule = null;

if (typeof angular !== 'undefined') {

    bgLinkModule = angular
        .module('bgLinkModule', [])
        .service('helperService', function () {

            this.getValue = function (key) {

                var value = null;

                try {
                    var bg = chrome.extension.getBackgroundPage();
                    value = bg.bgProcess.getValue(angular.copy(key));
                } catch (e) {
                    console.log('ERROR in helperService->getValue', e.message);
                } 

                if (debug) {
                    console.log(debug + 'helperService->getValue', key, value);
                }

                return angular.copy(value);
            };

            this.setValue = function (key, value) {

                if (debug) {
                    console.log(debug + 'helperService->setValue', key);
                }
                try {
                    var bg = chrome.extension.getBackgroundPage();
                    bg.bgProcess.setValue(angular.copy(key), angular.copy(value));
                } catch (e) {
                    console.log('ERROR in helperService->setValue', e.message, value);
                }

            };

        });

}

