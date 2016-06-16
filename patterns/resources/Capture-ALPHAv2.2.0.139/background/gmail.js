'use strict';

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {

    var debugMode = true;

    if (debugMode) { console.log('Gmail Listener'); }

    if (request.method === 'getGmailContacts') {

        if (debugMode) { console.log('getGmailContacts'); }

        //<div data-smartmail="gmail_signature">

        var signatures = document.querySelectorAll('[data-smartmail="gmail_signature"]');

        var list = [];
        var i = signatures.length;
        while (i--) {
            var item = { html: signatures[i].outerHTML, text: signatures[i].outerText, type: 'signature' };
            list.push(item);
        }

        var emails = document.querySelectorAll('[email]');
        i = emails.length;
        while (i--) {
            var item = { html: emails[i].outerHTML, text: emails[i].outerText, type: 'email' };
            list.push(item);
        }

        var response = { data: list };

        sendResponse(response);
    }

});