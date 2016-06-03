'use strict';

/* global salesforce: false */

var rnd = Math.random();

var debug = 'background.js->' + rnd + '->'; //debug = false;

// Persistent data
var bgProcess = {
    values: {},

    app: null,

    self: null,

    init: function () {

        if (debug) { console.log(debug + 'init'); }

        //self = this;
        bgProcess.values = { pageData: [] };

        if (!chrome.runtime.onMessage || !chrome.runtime.onConnect)
        { return; }

        bgProcess.addMessageListeners();

        bgProcess.addPortListeners();

    },

    getValue: function (key) {
        //if (key === 'settings' && bgProcess.values['firstInstall'] === true ) {
        //    console.log('*** request to get settings ignored (first install)');
        //    return false;
        //}
        var value = bgProcess.values[key];
        //if (debug) { console.log(debug + 'bgProcess->getValue->' + key + '->', value); }
        return value;
    },

    setValue: function (key, value) {
        //if (debug) { console.log(debug + 'bgProcess->setValue->' + key + '->', value); }
        bgProcess.values[key] = value;
    },

    getSettings: function (callback) {

        var localSettings = bgProcess.values['settings'];

        if (localSettings) {
            if (debug) { console.log(debug + 'contentSettings were loaded from local data.', localSettings); }
            callback(localSettings);
            return;
        }

        chrome.storage.sync.get('contentSettings', function (value) {
            //chrome.storage.local.get('contentSettings', function (value) {

            var error = chrome.runtime.lastError;
            if (!error) {

                if (debug) { console.log(debug + 'contentSettings were loaded successfully.', value); }

                if (value && value.contentSettings) {
                    //var value = value.contentSettings[key];
                    callback(value.contentSettings);
                } else {
                    callback(null);
                }

            }
            else {
                console.log('ERROR! Settings were not loaded.', error);
                callback(null);
            }

        });

    },

    getDomain: function (website) {
        var regex = /([a-z0-9-]+)([.]([a-z]{1,3})(?![a-z])){1,2}/ig;
        var d = regex.exec(website);
        if (d && d.length > 0) { d = d[0]; }
        return d;
    },

    addMessageListeners: function () {

        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

            var debug = 'background.js->listener->';

            if (request.target === 'ContactController.setBadgeText') {
                if (debug) { console.log(debug + 'ContactController.setBadgeText', request); }
                var badgeText = '';
                if (request.count) {
                    badgeText = '' + request.count;
                    chrome.browserAction.setBadgeBackgroundColor({ color: '#5cb85c' });
                }
                chrome.browserAction.setBadgeText({ text: badgeText });
                sendResponse('Badge text was set to "' + badgeText + '"');
            }

            if (request.target === 'ContactController.getPatterns') {
                if (debug) { console.log(debug + 'ContactController.getPatterns', request); }

                try {
                    if (debug) { console.log(debug + 'ContactController.getPatterns->sync->get'); }

                    var responseData = null;

                    chrome.storage.sync.get('patternSources', function (response) {
                        //chrome.storage.local.get('patternSources', function (response) {

                        if (debug) { console.log(debug + 'ContactController.getPatterns->sync->getResponse', response, chrome.runtime.lastError); }

                        if (chrome.runtime.lastError)
                        { responseData = [chrome.runtime.lastError]; }
                        else
                        { responseData = [1]; }

                        sendResponse(responseData);
                    });

                } catch (e) {
                    if (debug) { console.log(debug + 'ContactController.getPatterns->error', e); }

                    sendResponse([e.message]);
                }

            }
        });

    },

    addPortListeners: function () {

        chrome.runtime.onConnect.addListener(function (port, b) {

            if (debug) { console.log('******************************** PORT CONNECTED', port, b); }
            if (debug) { console.log(debug + 'addListener', port); }

            port.onMessage.addListener(function (msg) {

                if (debug) { console.log(debug + 'onMessage', msg); }

                if (msg.CheckForAllowNotification != null) {

                    var allow = false;
                    if (debug) { console.log(debug + 'getting contentSettings', msg); }

                    chrome.storage.sync.get('contentSettings', function (value) {
                        //chrome.storage.local.get('contentSettings', function (value) {

                        var error = chrome.runtime.lastError;
                        if (!error) {

                            if (debug) { console.log(debug + 'contentSettings were loaded successfully.', value); }

                            if (value && value.contentSettings) {
                                allow = value.contentSettings.notification || false;
                                if (allow) {
                                    var restricted = value.contentSettings.notificationsRestrictedDomain;
                                    if (restricted) {
                                        var domain = bgProcess.getDomain(msg.CheckForAllowNotification);
                                        if (debug) { console.log(debug + 'Checking domain', domain); }
                                        if (domain) {
                                            allow = restricted.indexOf(domain) < 0;
                                        }
                                    }
                                }
                            }
                            if (debug) { console.log(debug + 'AllowNotification=', allow); }
                            port.postMessage({ AllowNotification: allow });

                        }
                        else {
                            console.log('ERROR! Settings were not loaded.', error);
                        }

                    });

                }

                if (msg.GetPatterns != null) {

                    var isValidPattern = function (pattern) {

                        if (!pattern)
                        { return false; }

                        var v = pattern.SchemaVersion;
                        if (!v || !(v.length >= 2 && v[0] === '1' && v[1] === '.' && v[2] === '0'))
                        { return false; }

                        return true;
                    };

                    chrome.storage.local.get('patterns', function (response) {

                        if (debug) { console.log(debug + 'getPatterns', response, chrome.runtime.lastError); }

                        if (chrome.runtime.lastError)
                        { port.postMessage({ Error: chrome.runtime.lastError }); }
                        else
                        {
                            var pp = [];
                            if (response && response.patterns) {
                                var i = 0;
                                while (i < response.patterns.length) {
                                    if (isValidPattern(response.patterns[i])) {
                                        pp.push(response.patterns[i]);
                                    }
                                    i++;
                                }
                            }

                            // Load manually?
                            if (pp.length === 0) {

                                $.get('http://www.broadlook.com/capturecorepatternsalpha.txt')
                                   .success(function (data) {
                                       try {
                                           if (!(Array.isArray(data) || typeof data === 'object')) // html?
                                           { data = JSON.parse(data); }
                                           console.log(debug + 'Success loading patterns', data.length);
                                           pp = data;
                                           
                                           $.get('https://capture-patterns.s3.amazonaws.com/capture-community-patterns-alpha.txt')
                                             .success(function (data) {
                                                 try {
                                                     if (!(Array.isArray(data) || typeof data === 'object')) // html?
                                                     { data = JSON.parse(data); }
                                                     console.log(debug + 'Success loading patterns', data.length);
                                                     pp = pp.concat(data);
                                                     try {
                                                         chrome.storage.local.set({ patterns: pp });
                                                     } catch (e) {
                                                         console.error(debug + 'Error saving patterns', e.message);
                                                     }
                                                     port.postMessage({ Patterns: pp });
                                                 } catch (e) {
                                                     console.error(debug + 'Error parsing patterns', e.message);
                                                 }
                                             })
                                             .error(function (e) {
                                                 console.error(debug + 'Error loading patterns', e);
                                             });

                                       } catch (e) {
                                           console.error(debug + 'Error parsing patterns', e.message); 
                                           try { errorCallback(e.message); } catch (e) { }
                                       }
                                   })
                                   .error(function (e) {
                                       console.error(debug + 'Error loading patterns', e);
                                   });

                                return;
                            }

                            port.postMessage({ Patterns: pp });
                        }

                    });

                }

                if (msg.AddData != null) {

                    if (debug) { console.log(debug + 'AddData', bgProcess.values); }

                    bgProcess.values.pageData.push(msg.AddData);

                    var badgeText = '';

                    var CountProfiles = function (d) {

                        if (debug) { console.log('CountProfiles=', d); }

                        if (d && d.Data) {
                            if (d.Name === 'root' && d.Data.Name === 'Profiles')
                            { return 1; }
                            else if (d.Name === 'root' && d.Data.Name === 'Search Results Page')
                            { return d.Data.Data[0].Data.length; }
                            else
                            { return 1; }
                        }

                        return 0;
                    };

                    var count = 0;

                    try {
                        var j = bgProcess.values.pageData.length;
                        if (debug) { console.log('j=', j); }
                        while (j--)
                        { count += CountProfiles(bgProcess.values.pageData[j].data); }
                    } catch (e) {
                        console.log('ERROR in CountProfiles', e.message);
                    }


                    badgeText = '' + count; //self.values.pageData.length;
                    chrome.browserAction.setBadgeBackgroundColor({ color: '#0066cc' });

                    chrome.browserAction.setBadgeText({ text: badgeText });

                }


                if (msg.FindInCRM != null) {

                    if (debug) { console.log(debug + 'FindInCRM', bgProcess.values); }

                    var moreText = '';
                    var messageTextParts = [];
                    var list = [];

                    var respond = function (error) {

                        if (debug) { console.log(debug + 'respond', messageTextParts, 'error?', error); }

                        //var initialText = 'Capture sees a contact on this page.<br><strong>Warning</strong>! You may be creating a duplicate record.';
                        var initialText = 'The person you are viewing appears to already be in.';

                        var messageText = initialText;
                        if (messageTextParts.length > 0) {
                            messageText = messageTextParts.join('<br>');
                        }

                        if (moreText)
                        {
                            port.postMessage({ FoundInCRM: { Message: messageText, More: moreText }, Error: error });
                            port.postMessage({ FoundDuplicates: { List: list }, Error: error });
                        }
                        else
                        { port.postMessage({ Error: error }); }

                    };

                    try {

                        var patternData = msg.FindInCRM;

                        var splitFullName = function (full) {

                            var res = { full: full, last: '', first: '', middle: '' };

                            if (full.indexOf(' ') >= 0) {
                                var parts = full.split(' ');
                                if (parts.length === 2) {
                                    res.first = parts[0];
                                    res.last = parts[1];
                                } else if (parts.length > 2) {
                                    res.first = '';
                                    for (var i = 0; i < parts.length - 1; i++) {
                                        res.first += parts[i] + ' ';
                                    }
                                    res.first = res.first.trim();
                                    res.last = parts[parts.length - 1];
                                }
                            }
                            else {
                                res.first = '';
                                res.last = full;
                            }

                            return res;
                        };

                        var createContactHtml = function (r) {


                            var s = '<div class="ContactCard">';
                            s += '<div class="ContactName">';
                            if (r._link) { s += '<a href="' + r._link + '" target="_blank">'; }
                            s += (r.first || '') + ' ' + (r.last || '');
                            if (r._link) { s += '</a>'; }
                            s += '</div>';
                            s += '<div class="ContactJob">' + (r.jobtitle || '') + ((r.company && r.jobtitle) ? ' at ' : '') + '' + (r.company || '') + '</div>';
                            s += '<div class="ContactPhone">' + (r.phone || '') + ' ' + (r.email || '') + '</div>';
                            s += '</div>';

                            var x = {
                                Person: {
                                    Link: r._link || '',
                                    Name: ((r.first || '') + ' ' + (r.last || '')).trim(),
                                    Phone: r.phone || '',
                                    Email: r.email || '',
                                    Title: r.jobtitle || '',
                                    Type: r._type || 'Capture Contact'
                                },
                                Company: {
                                    Name: r.company || '',
                                    Link: r._link || '',
                                    Type: 'Current Customer'
                                },
                                OpenOpp: {
                                    Count: 1, Amount: '$2K', Name: 'Capture'
                                },
                                ClosedOpp: {
                                    Count: 3, Amount: '$10K', Name: 'Profiler, Diver'
                                },
                                NextActivity: {
                                    Type: 'Phone Call', Name: 'Get verbal agreement', When: 'Tomorrow', Link: ''
                                },
                                LastActivity: {
                                    Type: 'Phone Call', Name: 'LVM', When: 'Yesterday', Link: ''
                                },
                            };

                            list.push(x);

                            return s;
                        }

                        var readPatternField = function (field, contact) {

                            if (field.Name === 'Company') {
                                if (field.Value && !contact.company)
                                { contact.company = field.Value; }
                            }
                            else if (field.Name === 'FullName') {
                                if (field.Value && !contact.last && !contact.first) {
                                    var fullNameObj = splitFullName(field.Value);
                                    contact.last = fullNameObj.last;
                                    contact.first = fullNameObj.first;
                                }
                            }
                            else if (field.Name === 'FirstName') {
                                if (field.Value && !contact.first)
                                { contact.first = field.Value; }
                            }
                            else if (field.Name === 'LastName') {
                                if (field.Value && !contact.last)
                                { contact.last = field.Value; }
                            }
                            else if (field.Name.indexOf('Email') === 0) {
                                if (field.Value) {
                                    if (!contact.email)
                                    { contact.email = field.Value; }
                                    else if (!contact.email2 && contact.email.toLowerCase() !== field.Value.toLowerCase())
                                    { contact.email2 = field.Value; }
                                }
                            }
                            else if (field.Name.indexOf('Phone') === 0) {
                                if (field.Value) {
                                    if (!contact.phone)
                                    { contact.phone = field.Value; }
                                    else if (!contact.phone2 && contact.phone.toLowerCase() !== field.Value.toLowerCase())
                                    { contact.phone2 = field.Value; }
                                }
                            }
                            else if (field.Name === 'Title') {
                                if (field.Value && !contact.title)
                                { contact.title = field.Value; }
                            }
                            else if (field.Name === 'Website') {
                                if (field.Value && !contact.website)
                                { contact.website = field.Value; }
                            }
                            else if (field.Name === 'Twitter') {
                                if (field.Value) {
                                    contact.venues = contact.venues || [];
                                    contact.venues.push({ website: 'https://twitter.com/' + field.Value });
                                }
                            }
                            else if (field.Name === 'LinkedIn') {
                                if (field.Value) {
                                    contact.venues = contact.venues || [];
                                    contact.venues.push({ website: field.Value });
                                }
                            }

                        };

                        var readPatternRecord = function (record, contact) {

                            //console.log('reading record', angular.copy(record));
                            if (record) {
                                if (typeof record.length === 'undefined') {
                                    if (record.Values)
                                    { readPatternRecord(record.Values.Data, contact); }
                                    else
                                    { readPatternRecord(record.Data, contact); }
                                }
                                else {
                                    for (var j = 0; j < record.length; j++) {
                                        readPatternField(record[j], contact);
                                        if (record[j].Data)
                                        { readPatternRecord(record[j].Data, contact); }
                                    }
                                }
                            }

                        }

                        var c = {};

                        readPatternRecord(patternData, c);

                        if (debug) { console.log('read record', angular.copy(c)); }

                        if (!c || !c.last) {
                            respond();
                            return;
                        }

                        var s;
                        var utilityControllerScope = angular.element(document.getElementById('UtilityController')).scope();

                        var fullname = (c.full || (c.first + ' ' + c.last));


                        var findDupsInCrm = function () {

                            utilityControllerScope.findDups(c,

                                function(foundRecords) {

                                    if (debug) {
                                        console.log('utilityControllerScope.findDups', foundRecords);
                                    }

                                    if (foundRecords) {

                                        try {

                                            var t = null;
                                            var ss = [];
                                            var countsByType = {};
                                            for (var i = 0; i < foundRecords.length; i++) {
                                                var r = foundRecords[i];

                                                if (typeof countsByType[r._type] === 'undefined') {
                                                    countsByType[r._type] = 1;
                                                } else {
                                                    countsByType[r._type]++;
                                                }

                                                if (!t || t !== r._type) {
                                                    if (t) {
                                                        ss.push('</table><br>');
                                                    }
                                                    t = r._type;
                                                    var header = '<div class="GroupHeader">The following <span class="GroupType">' + t + 's</span> appear to be very similar:</div>' +
                                                        '<hr class="GroupStart"><div class="Capture_Notification_Dups">';
                                                    ss.push(header);
                                                }

                                                var s = createContactHtml(r);
                                                ss.push(s);
                                            }

                                            if (ss.length > 0) {
                                                ss.push('</div>');
                                            }

                                            moreText += ss.join('');

                                            var crm = utilityControllerScope.exportServiceName || '';

                                            for (var c in countsByType) {
                                                if (countsByType.hasOwnProperty(c)) {
                                                    var ending = countsByType[c] === 1 ? '' : 's';
                                                    messageTextParts.push(fullname + ' matches (' + countsByType[c] + ') ' + crm + ' ' + c + ending + '.');
                                                }
                                            }

                                        } catch (e) {
                                            console.log('ERROR in findDups.success', e.message);
                                        }

                                    }

                                    respond();

                                },

                                function(error) {
                                    console.log('ERROR in utilityControllerScope.findDups', error);
                                    respond(error);
                                }

                            );
                        };

                        try {
                            utilityControllerScope.duplicateOf(c,

                                function (dup) {

                                    if (debug) { console.log('dup?', angular.copy(dup)); }

                                    if (dup) {
                                        s = '<div class="GroupHeader">The following <span class="GroupType">Capture Contact</span> appears to be very similar:</div>' +
                                                     '<hr class="GroupStart"><div class="Capture_Notification_Dups">';
                                        s += createContactHtml(dup);
                                        s += '</div><br>';
                                        moreText = s;
                                        messageTextParts.push(fullname + ' is already in Capture.');
                                    }

                                    findDupsInCrm();
                                }

                            );

                        } catch (e) {
                            console.log('ERROR in duplicateOf; scope=', e.message, '; c=', c);
                        }

                    } catch (e) {
                        if (debug) { console.log(debug + 'ERROR', e.message); }
                        respond(e.message);
                    }



                }

                if (msg.App != null) {
                    if (debug) { console.log('******************************** APP', msg.App); }
                    bgProcess.app = msg.App;
                }

            });

            try {
                port.onDisconnect.addListener(function (a) {
                    try {
                        if (debug) { console.log('******************************** PORT DISCONNECTED', a, bgProcess.app); }
                        //bgProcess.app = null;
                        //angular.module('captureApp').$destroy();
                    } catch (e) {
                        console.log('******************************** ERROR in PORT DISCONNECT', e.message);
                    }

                });
            } catch (e) {
                console.log('ERROR in PORT DISCONNECT', e.message);
            }


        });

    }

}

var bgModule = null;

bgProcess.init();

if (typeof angular !== 'undefined') {

    bgModule = angular
        .module('bgModule', ['utilities', 'dialogs', 'webServices', 'bgLinkModule'])
        .factory('bgService',
                    ['helperService', function (helperService) {
                        return {
                            getValue: function (key) {
                                var value = helperService.getValue(key);
                                return value;
                            },
                            setValue: function (key, value) {
                                helperService.setValue(key, value);
                            },

                        };
                    }]
        )
        .controller('UtilityController', ['$scope', '$location', 'contactUtility', 'exportWrapperService', 'storageService',
            function ($scope, $location, contactUtility, exportWrapperService, storageService) {

                $scope.duplicateOf = function (candidate, callback) {

                    var contacts = [];
                    console.log('*** candidate', candidate);

                    var find = function () {
                        console.log('*** contacts', contacts);
                        var dup = contactUtility.duplicateOf(candidate, contacts);
                        console.log('*** dup', dup);
                        callback(dup);
                    };

                    var count = bgProcess.getValue('count');

                    if (typeof count === 'undefined') {
                        storageService.get(['count'],
                            function(response) {
                                console.log('*** response=', response);
                                bgProcess.setValue('count', response.count);

                                var indices = [];
                                count = response.count;
                                while (count--) {
                                    indices.push(count);
                                }

                                storageService.get(indices,
                                    function(response2) {
                                        //console.log('**** response=', response2);
                                        count = response.count;
                                        while (count--) {
                                            bgProcess.setValue(count, response2[count]);
                                            contacts.push(response2[count]);
                                        }
                                        console.log('*** try again');
                                        find();
                                    }
                                );
                            }
                        );

                    } else {

                        console.log('*** count', count);
                        while (count--) {
                            var c = bgProcess.getValue(count);
                            if (c) {
                                contacts.push(c);
                            }
                        }

                        find();
                    }

                };

                $scope.exportServiceName = '';

                $scope.findDups = function (contactOrContacts, successCallback, failureCallback) {

                    var f = function (exportService) {

                        var contacts = [];

                        if (Array.isArray(contactOrContacts)) {
                            var i = contactOrContacts.length;
                            while (i--) {
                                if (contactOrContacts[i]._hidden) {
                                    continue;
                                }
                                contacts.push(contactOrContacts[i]);
                            }
                        } else {
                            contacts.push(contactOrContacts);
                        }

                        var foundRecords = [];

                        //var exportService = exportWrapperService.getService('sf');

                        if (!exportService) {
                            failureCallback();
                            return;
                        }

                        var findLink = function (contacts) {

                            if (!contacts || contacts.length === 0) {
                                if (debug) {
                                    console.log('Duplicates search over');
                                }
                                if (successCallback) {
                                    successCallback(foundRecords);
                                }
                                return;
                            }

                            var contact = contacts.pop();

                            contact.links = [];
                            contact._searched = true;
                            contact._searching = true;

                            if (debug) {
                                console.log('Searching for duplicates', contact);
                            }

                            var findDuplicateContacts = function () {

                                exportService.findDuplicates('Contact', contact, function (response) {
                                    // success
                                    if (debug) {
                                        console.log('Found duplicate contacts', angular.copy(response), contact.links);
                                    }
                                    var crmRecords = response.duplicates;
                                    if (!contact.links) {
                                        contact.links = [];
                                    }
                                    var i = 0;
                                    while (i < crmRecords.length) {
                                        var crmRecord = crmRecords[i];
                                        var found = false;
                                        var j = contact.links.length;
                                        while (j--) {
                                            if (contact.links[j]._link === crmRecord._link) {
                                                found = true;
                                                break;
                                            }
                                        }
                                        if (!found) {
                                            contact.links.push(crmRecord);
                                            foundRecords.push(crmRecord);
                                        }
                                        i++;
                                    }

                                    contact._searching = false;
                                    findLink(contacts);

                                }, function (error) {
                                    // failure
                                    if (debug) {
                                        console.log('ERROR in duplicate search', error);
                                    }
                                    contact._searching = false;
                                    if (error) {
                                        //dialogs.alert.show(error);
                                    } else {
                                        findLink(contacts);
                                    }

                                });

                            };

                            exportService.findDuplicates('Lead', contact, function (response) {
                                // success

                                if (debug) {
                                    console.log('Found duplicate leads', angular.copy(response), contact.links);
                                }

                                //var contact = response.contact;
                                var crmRecords = response.duplicates;

                                if (!contact.links) {
                                    contact.links = [];
                                }
                                var i = 0;
                                while (i < crmRecords.length) {
                                    var crmRecord = crmRecords[i];
                                    var found = false;
                                    var j = contact.links.length;
                                    while (j--) {
                                        if (contact.links[j]._link === crmRecord._link) {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found) {
                                        contact.links.push(crmRecord);
                                        foundRecords.push(crmRecord);
                                    }

                                    //{
                                    //        id: contact.links.length + 1,
                                    //        name: sflead.first + ' ' + sflead.last,
                                    //        company: sflead.company,
                                    //        email: sflead.email,
                                    //        _type: 'lead',
                                    //        _link: $scope.sf.url + '/' + sflead.Id,
                                    //        _sfid: sflead.Id
                                    //    });

                                    i++;
                                }

                                findDuplicateContacts();

                            }, function (error) {
                                // failure
                                if (debug) {
                                    console.log('ERROR in duplicate search', error);
                                }
                                if (error) {
                                    dialogs.alert.show(error);
                                } else {
                                    findDuplicateContacts();
                                }
                            });

                        };

                        exportService.isLoggedIn(

                            // we are logged in already
                            function () {
                                findLink(contacts);
                            },

                            // we are not logged in yet
                            function () {

                                exportService.login(

                                    // login success
                                    function () {
                                        findLink(contacts);
                                    },

                                    // login failure
                                    function (msg) {
                                        try { failureCallback('Please log in to ' + exportService.getName() + ''); } catch (e) { }
                                    },

                                    true // silent! do not open new tabs!

                                );

                            }

                        );

                    };

                    bgProcess.getSettings(


                        function (settings) {

                            console.log('content settings?', settings);

                            // content settings were found
                            if (settings && settings.target) {

                                var exportService = exportWrapperService.getService(settings.target);

                                if (exportService) {
                                    $scope.exportServiceName = exportService.getName();
                                    console.log('name?', exportService.getName());

                                    if (settings.targetParams && settings.targetParams[settings.target]) {
                                        exportService.init(settings.targetParams[settings.target]);
                                    }

                                    f(exportService);
                                }
                            }

                        }

                 );
                };

            }
        ]);

    //bgModule.run(["$rootScope", function ($rootScope) {
    //    $rootScope.appVersion = "0.0.0.1";
    //}]);
}

//chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
//    suggest([
//      { content: text + " one", description: "the first one" },
//      { content: text + " number two", description: "the second entry" }
//    ]);
//});
//chrome.omnibox.onInputEntered.addListener(function (text) {
//    alert('You just typed "' + text + '"');
//});

var initForFirstInstall = function () {
    console.log('*** initForFirstInstall');
    bgProcess.setValue('firstInstall', true);
};

var addOnInstalledHandler = function () {

    chrome.runtime.onInstalled.addListener(function (details) {
        if (details.reason === 'install') {
            console.log('********* This is a first install!');
            initForFirstInstall();
        } else if (details.reason === 'update') {
            var thisVersion = chrome.runtime.getManifest().version;
            console.log('********* Updated from ' + details.previousVersion + ' to ' + thisVersion + '!');
            //initForFirstInstall();
        } else {
            console.log('******** Something else', details);
        }
    });

};

addOnInstalledHandler();