'use strict';

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {

    var debugMode = true;

    if (debugMode) { console.log('Salesforce Session ID Listener'); }

    if (request.method === 'getSalesforceSessionID') {

        if (debugMode) { console.log('getSalesforceSessionID'); }

        var session = document.cookie.match(/(^|;\s*)sid=(.+?);/);
        if(session) { session = session[2]; }

        if (debugMode) { console.log('SF Session = ' + (session ? session : -1)); }
        var response = { data: session };

        sendResponse(response);
    }

});