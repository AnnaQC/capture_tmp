'use strict';

/*jshint strict:false */
/* global jQuery: false */
/* global chrome: false */

/* Pattern Capture */

var $ = jQuery;

Array.prototype.clone = function () { return this.slice(0); };

var autoSearchInCRMEnabled = true;

var ButtonActions = {
    Layout: undefined,
    Actions: [],
    ExecuteClick: function (e) {

        // Stop event propagation
        try {
            e.preventDefault();
            e.stopPropagation();
        } catch (error) { }

        // Add VISITED class to the button image
        try {
            $(e.target).parent().addClass('Visited');
        } catch (errro) { }

        var action = e.data;
        //var id = $(this).attr('id');
        //for (var i = 0; i < ButtonActions.Actions.length; i++) { if (ButtonActions.Actions[i].ID === id) { action = ButtonActions.Actions[i]; break; } }
        //for (var i = 0; i < ButtonActions.Actions.length; i++) { if (ButtonActions.Actions[i].Sender === this) { action = ButtonActions.Actions[i]; break; } }
        //for (var i = 0; i < ButtonActions.Actions.length; i++) { if (ButtonActions.Actions[i] === e.data) { action = ButtonActions.Actions[i]; break; } }
        var res = {};
        if (action === undefined || action === null || action.Action === undefined) { return; }
        switch (action.Action.toLowerCase()) {
            case 'capture':
                showCaptureNotificationBar('Contact was selected. Please open Capture! to add selected contacts.', 100, 5000);
                res = {
                    Name: 'root', Index: 0, Group: null, Selector: null,
                    Data: {
                        Name: action.Group.Group, Index: 0, Group: action.Group, Selector: action.Path,
                        Data: PatternSelectionEngine.ProcessGroupFields(action.Group.GroupFields, action.Path, action.Group, { Retrieve: true })
                    }
                };
                //console.log(res);
                //console.log(action);
                port.postMessage({ AddData: { data: res, sourceUrl: document.URL } });

                if (res && res.Data && res.Data.Name === 'Search Results Page')
                { CaptureEmbeddedObject.NavigateToNextPageOfGoogleResults(); }

                break;
            case 'capturegroup':
                showCaptureNotificationBar('Contacts were selected. Please open Capture! to add selected contacts.', 100, 5000);
                //res = { Name: 'root', Index: 0, Group: null, Selector: null, Data: PatternSelectionEngine.ProcessGroupFields(action.Group.GroupFields, action.Path, action.Group, { Retrieve: true }) };
                res = {
                    Name: 'root', Index: 0, Group: null, Selector: null,
                    Data: {
                        Name: action.Group.Group, Index: 0, Group: action.Group, Selector: action.Path,
                        Data: PatternSelectionEngine.ProcessGroupFields(action.Group.GroupFields, action.Path, action.Group, { Retrieve: true })
                    }
                };
                //console.log(res);
                //console.log(action);
                port.postMessage({ AddData: { data: res, sourceUrl: document.URL } });

                if (res && res.Data && res.Data.Name === 'Search Results Page')
                { CaptureEmbeddedObject.NavigateToNextPageOfGoogleResults(); }

                break;
            case 'addbuttons':
                if (ButtonActions.Layout !== undefined) {
                    res = { Name: 'root', Index: 0, Group: null, Selector: null, Data: PatternSelectionEngine.ProcessGroupFields(action.Group.GroupFields, action.Path, action.Group, { Retrieve: false, Buttons: true }) };
                }
                break;
            case 'removebuttons': PatternSelectionEngine.RemoveButtons(action.Path); break;
            case 'showbuttons': PatternSelectionEngine.ShowButtons(action.Path); break;
            case 'hidebuttons': PatternSelectionEngine.HideButtons(action.Path); break;
            case 'alert': alert(action.Path.join(' ')); break;
            case 'select':
                break;
            default:
                break;

        }

        //var action = ButtonActions.Actions.find(function (e, i, a) { return e.ID === id; });
        //console.log(id);
        //console.log(action);

        //console.log($(this).attr('id'));
        //alert($(this).attr('id'));
        //alert(ID);
        //alert(Index);
        //alert(Actions[Index]);
    }
};

var ValueProcessors = {

    Append: function (Field, Params) {
        if (!Params || Params.indexOf('<*>') === -1) {
            return Field.Value;
        }
        Field.Value = Params.replace(/<\*>/, Field.Value);
        return [Field];
    },

    Pad: function (Field, Params) {
        if (Params === undefined) { Params = { Pad: 0, Char: ' ' }; }
        else {
            if (Params.Pad === undefined) { Params.Pad = 0; }
            if (Params.Char === undefined) { Params.Char = ' '; }
        }
        while (Field.Value.length < Params.Pad) { Field.Value += Params.Char; }
        return Field.Value;
    },

    CollapseWhiteSpace: function (Field, Params) {
        Field.Value = Field.Value.replace(/([\s]{2,})/g, ' ');
        return [Field];
    },
    TrimWhiteSpace: function (Field, Params) {
        Field.Value = Field.Value.replace(/^([\s]*)/g, '').replace(/([\s]*)$/g, '');
        return [Field];
    },
    Trim: function (Field, Params) {
        if (Params) {
            var trim = new RegExp('/^[' + Params + ']*/', 'g');
            Field.Value = Field.Value.replace(trim, '');
            trim = new RegExp('/[' + Params + ']*$/', 'g');
            Field.Value = Field.Value.replace(trim, '');
        }
        else { Field.Value = Field.Value.trim(); }
        return [Field];
    },
    Remove: function (Field, Params) {
        if (Params instanceof RegExp) { Field.Value = Field.Value.replace(Params, ''); }
        else if (Params instanceof Object) { Field.Value = Field.Value.replace(new RegExp(Params.Pattern, Params.Modifiers), ''); }
        else if (typeof (Params) === 'string') { Field.Value = Field.Value.replace(new RegExp(Params, 'g'), ''); }
        return [Field];
    },
    Replace: function (Field, Params) {
        if (Params instanceof Object) {
            if (Params.New === undefined) { Params.New = ''; }
            //Field.Value = Field.Value.replace(new RegExp(Params.Pattern, Params.Modifiers), Params.New);

            if (Params.Search instanceof RegExp) {
                Field.Value = Field.Value.replace(Params.Search, Params.New);
            }
            else if (Params.Search instanceof Object) {
                Field.Value = Field.Value.replace(new RegExp(Params.Search.Pattern, Params.Search.Modifiers), Params.New);
            }
            else if (typeof (Params.Search) === 'string') {
                Field.Value = Field.Value.replace(new RegExp(Params.Search, 'g'), Params.New);
            }
        }

        return [Field];
    },

    ParseHandle: function (Field, Params) {
        if (Field.Value.match(/^((http)(s)?(:\/\/))?([\w]{1,}[\.]){1,}[\w]{2,3}$/g)) {
            Field.Name = 'Website';
            Field.Value = ValueProcessors.Remove(Field, '^(http)(s)?(:\/\/)')[0].Value;
            return [Field];
        }

        if (Field.Value.match(/^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,4})$/g)) {
            Field.Name = 'Email';
            Field.Value = ValueProcessors.Remove(Field, '^(http)(s)?(:\/\/)')[0].Value;
            return [Field];
        }

        if (Field.Value.match(/^[A-Z]*$/g)) {
            Field.Name = 'Company';
            return [Field];
        }

        var words;
        if (Field.Value.search(/[\-_.]/g) >= 0) {
            words = ValueProcessors.SplitRegex(Field, /[\-_]/g).map(function (s) { return ValueProcessors.Trim(s, '\\-\\_')[0].Value; });
            Field.Value = words.join(' ').replace(/[\s]{2,}/g, ' ');
        }
        else if (Field.Value.indexOf(' ') === -1) {
            words = ValueProcessors.SplitRegex(Field, /(?=[A-Z])/).map(function (s) { return s.Value; });
            Field.Value = words.join(' ');
        }
        else { words = ValueProcessors.Split(Field, ' ').map(function (s) { return s.Value; }); }

        var pre = ['the'];
        var suf = ['the'];
        var int = ['co', 'company', 'inc', 'incorp', 'incorporated', 'est', 'established', 'establish', 'llc', 'llp', 'corp', 'corporation', 'coop', 'cooperative', 'limited', 'lc', 'ltd', 'assoc', 'association'];

        if ((pre.indexOf(words[0].toLowerCase().replace(/[.]/g, '')) >= 0) || (suf.indexOf(words[words.length - 1].toLowerCase().replace(/[.]/g, '')) >= 0)) {
            Field.Name = 'Company';
            return [Field];
        }

        for (var i = 0; i < words.length; i++) {
            if (int.indexOf(words[i].toLowerCase().replace(/[\s,;'.]/g, '')) >= 0) {
                Field.Name = 'Company';
                return [Field];
            }
        }

        Field.Name = 'FullName';
        var flds = ValueProcessors.SplitFullName(Field, undefined);

        if (flds.length > 2) { return flds; }

        Field.Name = 'Handle';
        return [Field];



        ///([a-z](?=[A-Z]))/g


    },
    SplitRegex: function (Field, Params) {
        return ValueProcessors.Split(Field, Params);
    },
    Split: function (Field, Params) {
        var vals = [];
        if (Params instanceof RegExp) { vals = Field.Value.split(Params); }
        else if (Params instanceof Object) { vals = Field.Value.split(new RegExp(Params.Pattern, Params.Modifiers)); }
        else if (typeof (Params) === 'string') { vals = Field.Value.split(new RegExp(Params, 'g')); }
        else { return [Field]; }

        var flds = [];
        for (var i = 0; i < vals.length; i++) { flds.push({ Name: Field.Name, Value: vals[i], Field: Field.Field, Selector: Field.Selector }); }
        return flds;
    },

    SplitFullName: function (Field, Params) {
        PatternSelectionEngine.Log(Field);
        var pre = ['ms', 'miss', 'mrs', 'mr', 'master', 'rev', 'reverend', 'fr', 'father', 'dr', 'doctor', 'atty', 'attorney', 'prof', 'professor', 'hon', 'honor', 'honorable', 'pres', 'president', 'gov', 'governor', 'coach', 'ofc', 'officer', 'supt', 'superintendent', 'rep', 'representative', 'sen', 'senator', 'amb', 'ambassador', 'treas', 'treasurer', 'sec', 'secretary', 'pvt', 'private', 'cpl', 'corporal', 'sgt', 'sargent', 'adm', 'administrative', 'maj', 'major', 'capt', 'captain', 'cmdr', 'commander', 'lt', 'lieutenant', 'lt col', 'lieutenant colonel', 'col', 'colonel', 'gen', 'general'];
        //'Msgr', 'Monsignor','Sr', 'Sister','Br', 'Brother',
        var suf = ['cpa', 'dc', 'dd', 'dds', 'dmd', 'do', 'dvm', 'edd', 'esq', 'esquire', 'ii', 'second', 'iii', 'third', 'iv', 'fourth', 'jd', 'jr', 'junior', 'lld', 'md', 'od', 'pc', 'pe', 'phd', 'rn', 'rnc', 'sr', 'senior', 'usa', 'usaf', 'usafr', 'usar', 'uscg', 'usmc', 'usmcr', 'usn', 'usnr'];

        var res = {};
        var parts = Field.Value.split(' ');

        while (pre.indexOf(parts[0].toLowerCase().replace(/[.]/g, '')) >= 0) {
            if (res.prefix === undefined) { res.prefix = parts[0]; }
            else { res.prefix += ' ' + parts[0]; }
            parts.splice(0, 1);
        }


        while (suf.indexOf(parts[parts.length - 1].toLowerCase().replace(/[.]/g, '')) >= 0) {
            if (res.suffix === undefined) { res.suffix = parts[parts.length - 1]; }
            else { res.suffix = parts[parts.length - 1] + ' ' + res.suffix; }
            parts.splice(parts.length - 1, 1);
        }

        var full = parts.join(' ');

        //PatternSelectionEngine.Log(res);
        if (full.match(/^[A-z]*$/g)) //First or Last
        {
            if (res.prefix !== undefined || res.suffix !== undefined) { res.last = parts[0]; }
            else { res.first = parts[0]; }
        } else if (full.match(/^[A-z]*[\s]{1,}[A-z]*$/g)) //First, Last
        {
            res.first = parts[0];
            res.last = parts[1];
        } else if (full.match(/^[A-z]*[\s]{1,}[A-z](.)?[\s]{1,}[A-z]*$/g)) //First, Middle (Initial), Last
        {
            res.first = parts[0];
            res.middle = parts[1];
            res.last = parts[2];
        } else if (full.match(/^[A-z]*[\s]{1,}[A-z]*[\s]{1,}[A-z]*$/g)) //First, Middle, Last
        {
            res.first = parts[0];
            res.middle = parts[1];
            res.last = parts[2];
        } else if (full.match(/^[A-z]*[\s]{1,}[A-z]*([\s]{1,}[A-z]*){2,}$/g)) //First, Middle, Last (Multiple)
        {
            res.first = parts[0];
            res.middle = parts[1];
            res.last = '';
            for (var i = 2; i < parts.length; i++) {
                res.last = res.last + ' ' + parts[i];
            }
            res.last = res.last.trim();
        }


        var flds = [];
        flds.push(Field);
        if (res.prefix) { flds.push({ Name: 'Prefix', Value: res.prefix, Field: Field.Field, Selector: Field.Selector }); }
        if (res.first) { flds.push({ Name: 'FirstName', Value: res.first, Field: Field.Field, Selector: Field.Selector }); }
        if (res.middle) { flds.push({ Name: 'MiddleName', Value: res.middle, Field: Field.Field, Selector: Field.Selector }); }
        if (res.last) { flds.push({ Name: 'LastName', Value: res.last, Field: Field.Field, Selector: Field.Selector }); }
        if (res.suffix) { flds.push({ Name: 'Suffix', Value: res.suffix, Field: Field.Field, Selector: Field.Selector }); }

        return flds;
    },

    SplitCompanyTitleSub: function (Value, Split1, Split2) {

        var res = {};

        var p1 = Value.split(Split1);
        PatternSelectionEngine.Log(Split1);
        PatternSelectionEngine.Log(p1);
        var p = p1[0];
        //PatternSelectionEngine.Log(p);
        var p2 = Value.match(Split1)[0];
        //PatternSelectionEngine.Log(p2);
        //PatternSelectionEngine.Log(Value.length);
        //PatternSelectionEngine.Log(p.length);
        //PatternSelectionEngine.Log(p2.length);


        var c = Value.substring(p.length + p2.length, Value.length);
        //PatternSelectionEngine.Log(c);

        if (Split2) {
            var c1 = c.split(Split2);
            //PatternSelectionEngine.Log(c1);
            if (c1.length > 2) {
                p2 = c.match(Split2);
                //PatternSelectionEngine.Log(p2);
                c = c1[0];
                for (var i = 1; i < c1.length - 1; i++) {
                    c = c + p2[i - 1] + c1[i];
                }
            } else { c = c1[0]; }
        }

        res.title = p.trim();
        res.company = c.trim();

        PatternSelectionEngine.Log(res);
        return res;
    },

    SplitCompanyTitle: function (Field, Params) {
        var res = {};
        //var parts = Field.Value.split(' ');
        var full = Field.Value;
        if (full.toLowerCase().indexOf('currently ') === 0) {
            full = full.substring(9, full.length).trim();
            //PatternSelectionEngine.Log(full);
        }
        if (full.toLowerCase().indexOf('a ') === 0 || full.toLowerCase().indexOf('@ ') === 0) {
            full = full.substring(1, full.length).trim();
            //PatternSelectionEngine.Log(full);
        } else if (full.toLowerCase().indexOf('an ') === 0 || full.toLowerCase().indexOf('at ') === 0) {
            full = full.substring(2, full.length).trim();
            //PatternSelectionEngine.Log(full);
        } else if (full.toLowerCase().indexOf('the ') === 0) {
            full = full.substring(3, full.length).trim();
            //PatternSelectionEngine.Log(full);
        }

        PatternSelectionEngine.Log(full);
        var paramsPassed = false;
        try {
            PatternSelectionEngine.Log(Params);
            if (Params && full.match(Params)) {
                PatternSelectionEngine.Log(full.match(Params));
                res = ValueProcessors.SplitCompanyTitleSub(full, Params, undefined);
                paramsPassed = true;
                PatternSelectionEngine.Log('Using Params');
            }
        } catch (e) { PatternSelectionEngine.Log(e); }

        if (!paramsPassed) {
            if (full.match(/([\s](contacted|employed|working)(([\s](@|at|with|by|for|through)|,)[\s]).*([\s](@|at|with|by|for|through)[\s]))/gi)) //Title at Company by Company
            { res = ValueProcessors.SplitCompanyTitleSub(full, /(?:[\s](?:contacted|employed|working)(?:(?:[\s](?:@|at|with|by|for|through)|,)[\s]))/gi, /(?:[\s](?:@|at|with|by|for|through)[\s])/gi); }
            else if (full.match(/([\s](contacted|employed|working))?(([\s](@|at|with|by|for|through))[\s])/gi)) //Title, Title at Company
            { res = ValueProcessors.SplitCompanyTitleSub(full, /(?:[\s](?:contacted|employed|working))?(?:(?:[\s](?:@|at|with|by|for|through))[\s])/gi, undefined); }
            else if (full.match(/([\s](contacted|employed|working))?(([\s](@|at|with|by|for|through)|,)[\s])/gi)) //Title at Company
            { res = ValueProcessors.SplitCompanyTitleSub(full, /(?:[\s](?:contacted|employed|working))?(?:(?:[\s](?:@|at|with|by|for|through)|,)[\s])/gi, undefined); }
        }

        var flds = [];
        flds.push(Field);
        if (res.company) { flds.push({ Name: 'Company', Value: res.company, Field: Field.Field, Selector: Field.Selector }); }
        if (res.title) { flds.push({ Name: 'Title', Value: res.title, Field: Field.Field, Selector: Field.Selector }); }

        return flds;
    },

    URLEncode: function (Field, Params) {
        Field.Value = encodeURIComponent(Field.Value);
        return [Field];
    },
    URLDecode: function (Field, Params) {
        //PatternSelectionEngine.Log('ValueProcessURLDecode');
        //PatternSelectionEngine.Log(Field);
        Field.Value = decodeURIComponent(Field.Value);
        return [Field];
    },
    HTMLEncode: function (Field, Params) {
        Field.Value = $('<div>').text(Field.Value).html();
        return [Field];
    },
    HTMLDecode: function (Field, Params) {
        Field.Value = $('<div>').html(Field.Value).text();
        return [Field];
    },
    ReplaceNonStandardCharacters: function (Field, Params) {
        Field.Value = Field.Value.replace(/[\xa0]/g, ' '); // Non-Breaking Space
        Field.Value = Field.Value.replace(/\u2013|\u2014/g, '-'); // EN Dash - EM Dash
        return [Field];
    },
    ReplaceNonBreakingSpaces: function (Field, Params) {
        Field.Value = Field.Value.replace(/[\xa0]/g, ' '); // Non-Breaking Space
        return [Field];
    },
    GetQueryStringParameter: function (Field, Params) {
        var results;
        if (Params) {
            var name = Params.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)', 'g');
            //PatternSelectionEngine.Log(regex);
            //PatternSelectionEngine.Log(Field.Value);
            results = regex.exec(Field.Value);
            //PatternSelectionEngine.Log(results);
            if (results.length > 1) { Field.Value = (results === null ? '' : results[1]); }
        }
        return [Field];
    },
    RunValueProcess: function (Fields, Process) {
        var fields = Fields;
        //PatternSelectionEngine.Log(Fields);
        //PatternSelectionEngine.Log(Process);

        if (Process) {
            //PatternSelectionEngine.Log('Processing');
            if (!Process.Name) { Process = { Name: Process }; }
            for (var i = 0; i < Fields.length; i++) {
                var fn = ValueProcessors[Process.Name];
                if (typeof fn === 'function') {
                    fields = fn(Fields[i], Process.Params);
                }
                // Bugfix (trailing spaces)
                if (typeof Fields[i].Value === 'string') { Fields[i].Value = Fields[i].Value.trim(); }
            }
        }
        return fields;
    },

};

var PatternSelectionEngine = {
    Abs: true,

    Debug: false,

    Layout: null,

    Log: function (message) { if (PatternSelectionEngine.Debug) { console.log(message); } },

    RunValueProcess: function (Fields, Process) {
        return ValueProcessors.RunValueProcess(Fields, Process);
    },


    RunValueProcesses: function (Field, Processes) {
        //PatternSelectionEngine.Log(Field);
        //PatternSelectionEngine.Log(Processes);
        var fields = [Field];
        if (Processes) {
            for (var i = 0; i < Processes.length; i++) {
                fields = PatternSelectionEngine.RunValueProcess(fields, Processes[i]);
            }
        }
        return fields;
    },

    TrimPath: function (Path) {
        if (Path.length !== 0) {

            var path = Path.slice(0);
            path.splice(0, 1);
            return path;
        }
        return Path;
    },

    GetElement: function (Selector) {
        if (Selector === undefined || Selector.length === undefined || Selector.length === 0) { return $('HTML'); }
        //console.log(Selector);

        //PatternSelectionEngine.Log(Selector);

        //var sels = Selector.trim().replace('  ', ' ').split(' IFRAME');
        var sel = Selector[0];
        var s = 0;
        while (s < Selector.length - 1 && (Selector[s + 1] === '' || Selector[s + 1].indexOf(':') === 0)) { sel += Selector[s + 1]; s++; }
        s++;

        var val = $(sel);

        //var iframe = false;
        var iframe = ((sel.toUpperCase().indexOf('IFRAME') === 0) ? true : false);
        //if (sels[s].indexOf('IFRAME') === 0) { iframe = true; }

        PatternSelectionEngine.Log(Selector);
        PatternSelectionEngine.Log(val);

        for (s = s; s < Selector.length; s++) {
            sel = Selector[s];
            while (s < Selector.length - 1 && (Selector[s + 1] === '' || Selector[s + 1].indexOf(':') === 0)) { sel += Selector[s + 1]; s++; }


            //sels[s] = PatternSelectionEngine.ReplaceNthOfType(sels[s]);
            PatternSelectionEngine.Log(Selector[s - 1] + ' || ' + sel + ' - ' + iframe);

            if (iframe) {
                val = $(val).contents().find(sel);
            } else {
                //PatternSelectionEngine.Log(val.length + ' - ' +  sels[s]);
                val = $(val).find(sel);
            }

            //iframe = true;
            iframe = ((sel.indexOf('IFRAME') === 0) ? true : false);
            //PatternSelectionEngine.Log(val);            
        }

        return val;
    },
    GetSelector: function (Element) {
        var resp = { 'Path': '', 'HasID': false, 'VariantID': false };
        var path = $(Element).prop('tagName');
        var classList;
        if ($(Element).attr('id') !== undefined) {
            resp.HasID = true;
            var id = $(Element).attr('id');
            if (id.match(/[\d]{3,500}/g)) {
                resp.VariantID = true;
                classList = id.split(/[\d]{3,500}/g);
                $.each(classList, function (index, item) {
                    if (item !== '') {
                        if (index === 0) { path += '[id^=' + item + ']'; }
                        else if (index === classList.length - 1) { path += '[id$=' + item + ']'; }
                        else { path += '[name*=' + item + ']'; }
                    }
                });
            } else {
                path += '#' + $(Element).attr('id');
            }
        }
        if ($(Element).attr('name') !== undefined) { path += '[name=' + $(Element).attr('name') + ']'; }
        if ($(Element).attr('class') !== undefined) {
            classList = $(Element).attr('class').split(/\s+/);
            $.each(classList, function (index, item) { if (item !== '' && item !== 'BLT_Hover' && item !== 'BLT_Field') { path += '.' + item; } });
        }
        resp.Path = path;
        return resp;
    },

    LocateParent: function (Element, Path) {
        var c = 1;
        if (c > 20) { return '* ' + Path; }
        $(Element).removeClass('BLT_Hover');
        if ($(Element).prop('tagName') === 'BODY') { return Path.join(' '); }

        var Parent = $(Element).parent();

        var resp = PatternSelectionEngine.GetSelector(Parent);
        Path.splice(0, 0, resp.Path);

        //PatternSelectionEngine.Log(Path.join(' '));

        if (resp.HasID === true && resp.VariantID === false) {
            //PatternSelectionEngine.Log($(Path.join(' ')).length + ' - ' + $(Parent).children(Path[1]).length);
            if ($(Path.join(' ')).length === 1 && PatternSelectionEngine.Abs === false) { return Path.join(' '); }
            else if ($(Parent).children(Path[1]).length > 1) {
                //PatternSelectionEngine.Log('B | ' + Selector + ' | ' + val.length);

                $(Parent).children(Path[1]).each(function (index, item) { if ($(item).is($(Element))) { Path[1] = Path[1] + ':nth-of-type(' + (index + 1) + ')'; } });
            }
        }

        return PatternSelectionEngine.LocateParent(Parent, Path);
    },


    GetMultiPath: function (Selector, Path) {
        var selectors = [];
        var subVals;
        var s = 0;
        if (Path.length === 0 || Selector.length === 0) { selectors.push(Selector); }
        else {

            var val = PatternSelectionEngine.GetElement(Selector);

            PatternSelectionEngine.Log('A | ' + Selector + ' | ' + val.length);
            PatternSelectionEngine.Log(Path);
            PatternSelectionEngine.Log(val);

            if (val.length > 1) {
                //var subVals = GetMultiPath(Selector, Path[0]);
                for (var v = 0; v < val.length; v++) {
                    //PatternSelectionEngine.Log('S ' + Selector + ':nth-of-type(' + (v + 1) + ') ' + Path[0]);
                    subVals = PatternSelectionEngine.GetMultiPath(Selector + ':eq(' + v + ') ' + Path[0], PatternSelectionEngine.TrimPath(Path));
                    for (s = 0; s < subVals.length; s++) {
                        selectors.push(subVals[s]);
                    }
                }
            } else {
                subVals = PatternSelectionEngine.GetMultiPath(Selector + ' ' + Path[0], PatternSelectionEngine.TrimPath(Path));
                for (s = 0; s < subVals.length; s++) {
                    //PatternSelectionEngine.Log('B | ' + subVals[s] + ' | ' + subVals.length);
                    selectors.push(subVals[s]);
                }
            }
        }
        //PatternSelectionEngine.Log(selectors);
        return selectors;
    },

    //GetMultiplePaths: function (Path, Selector) {
    //    var selectors = [];
    //    var path = Path.clone();
    //    path.push(Selector);
    //    var val = PatternSelectionEngine.GetElement(path);

    //    //PatternSelectionEngine.Log(Selector + ' | ' + val.length);
    //    //PatternSelectionEngine.Log(val);
    //    //if (val.length > 1) {
    //    //    var sels = Selector.trim().split(' ');
    //    //    //PatternSelectionEngine.Log(sels);
    //    //    selectors = PatternSelectionEngine.GetMultiPath(sels[0].trim(), PatternSelectionEngine.TrimPath(sels));
    //    //} else {
    //    //var path = Path.clone(); path.push(Selector);
    //    selectors.push(path);
    //    //}

    //    //PatternSelectionEngine.Log('=====================================================================================================================================');
    //    //PatternSelectionEngine.Log(selectors);
    //    return selectors;
    //},
    ProcessLayout: function (Layout, Path, Parent, Options) {

        if (Options !== undefined && Options.Buttons === true) {
            $('[capture=\'container\']').remove(); $('[capture=\'style\']').remove(); $('[capture=\'import\']').remove();
            if (Layout.ImportCSS !== undefined) {
                for (var i = 0; i < Layout.ImportCSS.length; i++) {
                    if (Layout.ImportCSS[i].indexOf('chrome-extension://__MSG_@@extension_id__') === 0) { Layout.ImportCSS[i] = chrome.extension.getURL('') + Layout.ImportCSS[i].replace('chrome-extension://__MSG_@@extension_id__/', ''); }
                    //PatternSelectionEngine.   loadCSSCors(Layout.ImportCSS[i]);
                    $('head').append($('<link>').attr('rel', 'stylesheet').attr('type', 'text/css').attr('capture', 'import').attr('crossorigin', 'anonymous').attr('href', Layout.ImportCSS[i]));
                }
            }
            if (Layout.ImportStyle !== undefined) { $('head').append($('<style>').attr('type', 'text/css').attr('capture', 'style').append(Layout.ImportStyle)); }
        }

        if (Options !== undefined && Options.Events === true) { PatternSelectionEngine.BindEvents([], Layout.Events); }

        // Correct for Old Layout
        if (Layout.GroupFields !== undefined) { Layout.Groups = Layout.GroupFields; }

        return PatternSelectionEngine.ProcessGroupFields(Layout.Groups, Path, Parent, Options);
    },

    RemoveButtons: function (Path) {
        var path = Path.clone();
        path.push('[capture = \'container\']');
        var buttons = PatternSelectionEngine.GetElement(path);
        buttons.remove();
    },
    HideButtons: function (Path) {
        var path = Path.clone();
        path.push('[capture = \'container\']');
        var buttons = PatternSelectionEngine.GetElement(path);
        buttons.css('display', 'none');
    },
    ShowButtons: function (Path) {
        var path = Path.clone();
        path.push('[capture = \'container\']');
        var buttons = PatternSelectionEngine.GetElement(path);
        buttons.css('display', null);
    },

    ProcessGroupFields: function (GroupFields, Path, Parent, Options, Targeted) {
        var data = [];
        var fg;

        for (fg = 0; fg < GroupFields.length; fg++) {
            var fieldGroup = GroupFields[fg];
            if (fieldGroup.Group !== undefined) {
                data = PatternSelectionEngine.ProcessGroup(fieldGroup, Path, Parent, data, Options, Targeted);
            } else if (fieldGroup.Field !== undefined) {
                if (Options === undefined || Options.Retrieve || (Options.Targeted && Targeted)) {
                    data = PatternSelectionEngine.ProcessField(fieldGroup, Path, Parent, data);
                }
            }
        }
        return data;
    },

    ProcessGroup: function (Group, Path, Parent, Data, Options, Targeted) {

        if (Group.Targeted) { Targeted = true; }

        var grp = {
            Name: Group.Group,
            GroupType: Group.GroupType,
            Index: 0,
            Group: Group,
            Selector: Path,
            Data: []
        };

        var paths = PatternSelectionEngine.BuildSelector(Path, Group.Selectors);
        paths = PatternSelectionEngine.QualifyPaths(paths, Group.Qualifiers);

        var p = 0;

        var skip = 0;
        var step = 1;
        var take = 0;

        if (Group.Instances !== undefined && Group.Instances !== '*') { Group.Take = Group.Instances; }

        if (Group.Skip) { skip = parseInt(Group.Skip); }
        if (Group.Step) { step = parseInt(Group.Step); }
        if (Group.Take) { take = parseInt(Group.Take); }

        var taken = 0;
        for (p = skip; p < paths.length; p += step) {
            if (skip > p) { continue; }

            if (take === 0 || taken < take) {

                if (Group.Multiple) {

                    grp.Data.push({
                        Name: Group.Group,
                        GroupType: (Group.GroupType === 'Profiles' ? 'Profile' : Group.GroupType),
                        Index: p + 1,
                        Group: Group,
                        Selector: paths[p],
                        Data: PatternSelectionEngine.ProcessGroupFields(Group.GroupFields, paths[p], Group, Options, Targeted)
                    });
                    if (Options !== undefined && Options.Buttons === true) { PatternSelectionEngine.ProcessContainers(Group, paths[p], Options); }
                    if (Options !== undefined && Options.Events === true) { PatternSelectionEngine.BindEvents([], Group.Events); }
                } else {
                    if (PatternSelectionEngine.QualifyPath(paths[p], Group.Qualifiers)) {
                        grp.Data = grp.Data.concat(PatternSelectionEngine.ProcessGroupFields(Group.GroupFields, paths[p], Group, Options, Targeted));
                        if (taken === 0) {
                            if (Options !== undefined && Options.Buttons === true) { PatternSelectionEngine.ProcessContainers(Group, paths[p], Options); }
                            if (Options !== undefined && Options.Events === true) { PatternSelectionEngine.BindEvents([], Group.Events); }
                        }
                    }
                }
                taken++;
            }
        }

        if (grp.Data.length > 0) {
            //PatternSelectionEngine.Log(grp.Data);
            //for (s = 0; s < grp.Data.length; s++) { grp.Data[s].Index = s + 1; }
            Data.push(grp);
        }
        return Data;
    },

    BuildSelector: function (Path, Selectors, Qualifiers) {
        var paths = [];
        var path = [];
        var s;
        if (Selectors instanceof Array) {
            for (s = 0; s < Selectors.length; s++) { paths = paths.concat(PatternSelectionEngine.BuildSelector(Path, Selectors[s], undefined)); }
        } else if (Selectors instanceof Object) {
            path = PatternSelectionEngine.GetScopePath(Path, Selectors.Scope);
            var ps = PatternSelectionEngine.BuildSelector(path, Selectors.Selector, Selectors.Qualifiers);
            for (s = 0; s < ps.length; s++) {
                paths = paths.concat(PatternSelectionEngine.BuildSelector(ps[s], Selectors.Selectors, undefined));
            }
        } else if (typeof Selectors === 'string') {
            path = Path.clone();
            path.push(Selectors);
            var vals = PatternSelectionEngine.GetElement(path);
            if (vals.length == 1) { paths.push(path); }
            else {
                for (var v = 0; v < vals.length; v++) {
                    var p = path.clone();
                    p[p.length - 1] = p[p.length - 1] + ':eq(' + v + ')';
                    paths.push(p);
                }
            }
            //paths.push(path);
        } else { paths.push(Path); }

        return PatternSelectionEngine.QualifyPaths(paths, Qualifiers);
        //return paths;
    },
    QualifyPaths: function (Paths, Qualifiers) {
        var paths = [];
        if (Qualifiers instanceof Array) {
            if (Qualifiers !== undefined) {
                var p;
                for (p = 0; p < Paths.length; p++) {
                    if (Paths[p] instanceof Array && PatternSelectionEngine.QualifyPath(Paths[p], Qualifiers)) {
                        paths.push(Paths[p]);
                    }
                }
            }
            return paths;
        } else { return Paths; }
    },
    QualifyPath: function (Path, Qualifiers) {

        if (Qualifiers instanceof Array) {
            var q;
            for (q = 0; q < Qualifiers.length; q++) { if (!PatternSelectionEngine.QualifyPath(Path, Qualifiers[q])) { return false; } }
        } else if (Qualifiers instanceof Object) {

            var path = PatternSelectionEngine.GetScopePath(Path, Qualifiers.Scope);
            var res = [];
            var vals;
            if (Qualifiers.Selectors !== undefined) {
                for (var s = 0 ; s < Qualifiers.Selectors.length; s++) {
                    var paths = [];
                    paths = PatternSelectionEngine.BuildSelector(path, Qualifiers.Selectors[s]);

                    if (paths.length === 0) { res.push(PatternSelectionEngine.QualifyValue(undefined, Qualifiers)); continue; }

                    var p;
                    for (p = 0; p < paths.length; p++) {
                        vals = PatternSelectionEngine.GetElement(paths[p]);
                        res.push(PatternSelectionEngine.QualifyValue(vals, Qualifiers));
                    }
                }
            } else {
                vals = PatternSelectionEngine.GetElement(path);
                res.push(PatternSelectionEngine.QualifyValue(vals, Qualifiers));
            }


            var r;
            if (Qualifiers.Operand == 'Or') {
                if (Qualifiers.Not) { for (r = 0; r < res.length; r++) { if (!res[r]) { return true; } } }
                else { for (r = 0; r < res.length; r++) { if (res[r]) { return true; } } }
                return false;
            } else {
                if (Qualifiers.Not) { for (r = 0; r < res.length; r++) { if (!res[r]) { } else { return false; } } }
                else { for (r = 0; r < res.length; r++) { if (res[r]) { } else { return false; } } }
                return true;
            }
        }

        return true;
    },

    QualifyValue: function (Values, Qualifier, Attribute) {
        if (Values === undefined) { Values = []; }
        var val = PatternSelectionEngine.GetValue(Values, Attribute);
        switch (Qualifier.ValidationType) {
            case 'NotExists':
                if (Values.length === 0) { return true; } else { return false; } break;
            case 'Equals':
                if (val === Qualifier.Value) { return true; } else { return false; } break;
            case 'Matches':
                if (val === Qualifier.Value) { return true; } else { return false; } break;
            case 'Quantity':
                var qty = 0;
                if (Values) { qty = Values.length; }
                val = parseInt(Qualifier.Value);
                switch (Qualifier.Operand) {
                    case '>': if (Values.length > val) { return true; } else { return false; } break;
                    case '>=': if (Values.length >= val) { return true; } else { return false; } break;
                    case '<': if (Values.length < val) { return true; } else { return false; } break;
                    case '<=': if (Values.length <= val) { return true; } else { return false; } break;
                    case '!=': if (Values.length !== val) { return true; } else { return false; } break;
                    default: if (Values.length === val) { return true; } else { return false; } break; // '='
                }
                return false;
            default:
                if (Values.length < 1) { return false; } else { return true; } break;  // 'Exists'
        }
        return false;
    },
    GetScopePath: function (Path, Scope) {
        if (Scope !== undefined) {
            var path = [];
            var i = 0;
            if (Scope > 0) { for (i = 0; i < Scope && i < Path.length ; i++) { path.push(Path[i]); } }
            else if (Scope < 0) { for (i = 0; i < Path.length + Scope && i < Path.length  ; i++) { path.push(Path[i]); } }
            return path;
        }
        return Path;
    },

    BindEvents: function (Path, Event, Group) {
        if (Event === undefined) { return; }

        if (Event instanceof Array) {
            for (var i = 0; i < Event.length; i++)
            { PatternSelectionEngine.BindEvents(Path, Event[i], Group); }
        } else if (Event instanceof Object) { PatternSelectionEngine.GenerateEventFromObject(Path, Event, Group); }
        else if (typeof Event === 'string') { PatternSelectionEngine.GenerateEventFromString(Path, Event, Group); }
    },
    ValidEvents: ['blur', 'change', 'click', 'dblclick', 'hover', 'error', 'focus', 'focusin', 'focusout', 'keydown', 'keyup', 'keypress', 'load', 'mousedown', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover', 'mouseup', 'ready', 'resize', 'scroll', 'select', 'submit', 'unload'],
    GenerateEventFromObject: function (Path, Event, Group) {
        if (Event === undefined) { return undefined; }

        var paths = PatternSelectionEngine.BuildSelector(Path, Event.Selectors, Event.Qualifiers);

        if (Event.Event !== undefined && PatternSelectionEngine.ValidEvents.indexOf(Event.Event.toLowerCase()) === -1) { return; }


        for (var p = 0; p < paths.length; p++) {
            var vals = PatternSelectionEngine.GetElement(paths[p]);

            for (var v = 0; v < vals.length; v++) {
                var action = PatternSelectionEngine.GenerateAction('Event', Event.Action, Group, Path, vals[v]);

                if (Event.Event === undefined) { $(vals[v]).click(action, ButtonActions.ExecuteClick); continue; }

                if ($(vals[v])[Event.Event.toLowerCase()] !== undefined) {
                    $(vals[v])[Event.Event](action, ButtonActions.ExecuteClick);
                }
            }
        }
    },
    GenerateEventFromString: function (Path, Event, Group) {
        var props = PatternSelectionEngine.ParseProps({ Source: Event });

        switch (Event.toLowerCase()) {
            case 'capture_contact_button_logo': case 'capturelogo': case 'capturebuttonlogo': case 'capturebuttontext':
                if (props.Style === undefined || props.Style === '') { props.Style = 'height: 16px;'; } else { props.Style = 'height: 16px; ' + props.Style; }
                if (props.Class === undefined || props.Class === '') { props.Class = 'Capture_Injected_Button_Logo'; } else { props.Class = 'Capture_Injected_Button_Logo ' + props.Class; }
                return PatternSelectionEngine.GeneratEventFromObject(Path, props, Group);
            case 'capture_contact_button_icon': case 'captureicon': case 'capturebuttonicon':
                if (props.Style === undefined || props.Style === '') { props.Style = 'height: 16px;'; } else { props.Style = 'height: 16px; ' + props.Style; }
                if (props.Class === undefined || props.Class === '') { props.Class = 'Capture_Injected_Button_Icon'; } else { props.Class = 'Capture_Injected_Button_Icon ' + props.Class; }
                return PatternSelectionEngine.GeneratEventFromObject(Path, props, Group);
            case 'capture_group_button_logo': case 'capturegrouplogo': case 'capturegroupbuttonlogo': case 'capturegroupbuttontext':
                if (props.Style === undefined || props.Style === '') { props.Style = 'height: 16px;'; } else { props.Style = 'height: 16px; ' + props.Style; }
                if (props.Class === undefined || props.Class === '') { props.Class = 'Capture_Injected_GroupButton_Logo'; } else { props.Class = 'Capture_Injected_GroupButton_Logo ' + props.Class; }
                return PatternSelectionEngine.GeneratEventFromObject(Path, props, Group);
            case 'capture_group_button_icon': case 'capturegroupicon': case 'capturegroupbuttonicon':
                if (props.Style === undefined || props.Style === '') { props.Style = 'height: 16px;'; } else { props.Style = 'height: 16px; ' + props.Style; }
                if (props.Class === undefined || props.Class === '') { props.Class = 'Capture_Injected_GroupButton_Icon'; } else { props.Class = 'Capture_Injected_GroupButton_Icon ' + props.Class; }

                return PatternSelectionEngine.GeneratEventFromObject(Path, props, Group);
            default:
                try {
                    var container = $(Event);
                    $(parent).append(container);
                    return container;
                } catch (e) { return undefined; }
                return undefined;
        }
        return undefined;
    },

    ProcessContainers: function (Group, Path, Options) {
        //console.log(Group);
        //console.log(Options);

        if (Group.Buttons !== undefined) { Group.Containers = Group.Buttons; }

        if (Group.Containers !== undefined && Options !== undefined && Options.Buttons) {
            return PatternSelectionEngine.GenerateContainers(Path, Group.Containers, Group);
        }
        return undefined;
    },
    GetLastContainer: function (Container) {
        if ($(Container).children().length === 0) { return Container; }
        return PatternSelectionEngine.GetLastContainer($(Container).children().last());
    },

    GenerateContainers: function (Path, Container, Group) {
        if (Container === undefined) { return undefined; }

        if (Container instanceof Array) {
            var containers = [];
            for (var i = 0; i < Container.length; i++)
            { containers.push(PatternSelectionEngine.GenerateContainers(Path, Container[i], Group)); }
            return containers;
        } else if (Container instanceof Object) { return [PatternSelectionEngine.GenerateContainerFromObject(Path, Container, Group)]; }
        else if (typeof Container === 'string') { return [PatternSelectionEngine.GenerateContainerFromString(Path, Container, Group)]; }
        else { return undefined; }
    },
    GenerateContainerFromObject: function (Path, Container, Group) {
        if (Container === undefined) { return undefined; }

        if (Container.Buttons === undefined || Container.Buttons === null || Container.Buttons.length === 0) { return undefined; }

        var container = '';

        container += '<' + (Container.Type !== undefined && Container.Type !== '' ? Container.Type : 'DIV') + ' capture=\'container\' ';
        if (Container.Class !== undefined && Container.Class !== '') { container += 'class=\'' + Container.Class + '\' '; }
        if (Container.Style !== undefined && Container.Style !== '') { container += 'style=\'' + Container.Style + '\' '; }

        if (Container.Attributes !== undefined && Container.Attributes !== '') { container += Container.Attributes + ' '; }

        container += '>';
        if (Container.Contents !== undefined && Container.Contents !== '') { container += Container.Contents; }
        container += '</' + (Container.Type !== undefined && Container.Type !== '' ? Container.Type : 'DIV') + '>';

        container = $(container);

        var paths = PatternSelectionEngine.BuildSelector(Path, Container.Selectors, Container.Qualifiers);

        for (var p = 0; p < paths.length; p++) {
            if (Container.Inner !== undefined) { PatternSelectionEngine.GenerateInner(container, Container.Inner); }

            var parent = PatternSelectionEngine.GetElement(paths[p]);

            if (Container.Position !== undefined) {
                switch (Container.Position.toLowerCase()) {
                    case 'before': $(parent).before(container); break;
                    case 'prepend': $(parent).prepend(container); break;
                    case 'append': $(parent).append(container); break;
                    case 'after': $(parent).after(container); break;
                    case 'wrap': $(parent).wrap(container); break;
                    case 'wrapinner': $(parent).wrapInner(container); break;
                    default: $(parent).append(container); break;
                }
            } else { $(parent).append(container); }
        }

        PatternSelectionEngine.GenerateButtons(PatternSelectionEngine.GetLastContainer(container), Container.Buttons, Group, Path);

        return container;
    },
    GenerateContainerFromString: function (Path, Container, Group) {
        if (Container === undefined) { return undefined; }

        var props = PatternSelectionEngine.ParseProps({ Source: Container });

        switch (props.Value.toLowerCase()) {
            case 'capture_contact_button_logo': case 'capturelogo': case 'capturebuttonlogo': case 'capturebuttontext':
                props = PatternSelectionEngine.FillContainerDefaults(props);
                if (props.Buttons === undefined || props.Buttons === '') { props.Buttons = ['capture_contact_button_logo' + (props.Style !== undefined ? '|' + props.Style : '')]; props.Style = undefined; }
                return PatternSelectionEngine.GenerateContainerFromObject(Path, props, Group);
            case 'capture_contact_button_icon': case 'captureicon': case 'capturebuttonicon':
                props = PatternSelectionEngine.FillContainerDefaults(props);
                if (props.Buttons === undefined || props.Buttons === '') { props.Buttons = ['capture_contact_button_icon' + (props.Style !== undefined ? '|' + props.Style : '')]; props.Style = undefined; }
                return PatternSelectionEngine.GenerateContainerFromObject(Path, props, Group);
            case 'capture_group_button_logo': case 'capturegrouplogo': case 'capturegroupbuttonlogo': case 'capturegroupbuttontext':
                props = PatternSelectionEngine.FillContainerDefaults(props);
                if (props.Buttons === undefined || props.Buttons === '') { props.Buttons = ['capture_group_button_logo' + (props.Style !== undefined ? '|' + props.Style : '')]; props.Style = undefined; }
                return PatternSelectionEngine.GenerateContainerFromObject(Path, props, Group);
            case 'capture_group_button_icon': case 'capturegroupicon': case 'capturegroupbuttonicon':
                props = PatternSelectionEngine.FillContainerDefaults(props);
                if (props.Buttons === undefined || props.Buttons === '') { props.Buttons = ['capture_group_button_icon' + (props.Style !== undefined ? '|' + props.Style : '')]; props.Style = undefined; }
                return PatternSelectionEngine.GenerateContainerFromObject(Path, props, Group);
            case '':
                return PatternSelectionEngine.GenerateContainerFromObject(Path, props, Group);
            default:
                try {
                    var container = $(Container);
                    $(parent).append(container);
                    return container;
                } catch (e) { return undefined; }
                return undefined;
        }
        return undefined;
    },
    FillContainerDefaults: function (Props) {
        if (Props.Class === undefined || Props.Class === '') { Props.Class = 'Capture_Injected_Container_Inline'; }
        if (Props.Position === undefined || Props.Position === '') { Props.Position = 'append'; }
        if (Props.Type === undefined || Props.Type === '') { Props.Type = 'SPAN'; }
        if (Props.Scope === undefined || Props.Scope === '') { Props.Scope = 0; }
        if (Props.Selectors === undefined || Props.Selectors === '') { Props.Selectors = '*:eq(0)'; }
        return Props;
    },

    GenerateButtons: function (Container, Button, Group, Path) {
        if (Button === undefined) { return undefined; }
        if (Button instanceof Array) {
            var buttons = [];
            for (var i = 0; i < Button.length; i++)
            { buttons.push(PatternSelectionEngine.GenerateButtons(Container, Button[i], Group, Path)); }
            return buttons;
        } else if (Button instanceof Object) { return [PatternSelectionEngine.GenerateButtonFromObject(Container, Button, Group, Path)]; }
        else if (typeof Button === 'string') { return [PatternSelectionEngine.GenerateButtonFromString(Container, Button, Group, Path)]; }

        return undefined;
    },
    GenerateButtonFromObject: function (Container, Button, Group, Path) {
        if (Button === undefined) { return undefined; }

        if (Button.Action === undefined) { return undefined; }

        var id = PatternSelectionEngine.GenerateID('Button');
        var button = '';

        button += '<' + (Button.Type !== undefined && Button.Type !== '' ? Button.Type : 'DIV') + ' ';
        button += 'id=\'' + id + '\' ';
        if (Button.Class !== undefined && Button.Class !== '') { button += 'class=\'' + Button.Class + '\' '; }
        if (Button.Style !== undefined && Button.Style !== '') { button += 'style=\'' + Button.Style + '\' '; }
        button += 'title=\'' + (Button.Title !== undefined && Button.Title !== '' ? Button.Title : 'Click to Capture!') + '\' ';

        if (Button.Attributes !== undefined && Button.Attributes !== '') { button += Button.Attributes + ' '; }

        button += '>';
        if (Button.Contents !== undefined && Button.Contents !== '') { button += Button.Contents; }
        button += '</' + (Button.Type !== undefined && Button.Type !== '' ? Button.Type : 'DIV') + '>';

        button = $(button);

        $(Container).append(button);

        $(button).click(PatternSelectionEngine.GenerateAction(id, Button.Action, Group, Path, button[0]), ButtonActions.ExecuteClick);

        if (Button.Inner !== undefined) { PatternSelectionEngine.GenerateInner(button, Button.Inner); }

        //PatternSelectionEngine.GenerateButton($('#' + Action.ID), Button.Inner);
        return button;
    },
    GenerateButtonFromString: function (Container, Button, Group, Path) {
        if (Button === undefined) { return undefined; }

        var props = PatternSelectionEngine.ParseProps({ Source: Button });


        switch (props.Value.toLowerCase()) {
            case 'capture_contact_button_logo': case 'capturelogo': case 'capturebuttonlogo': case 'capturebuttontext':
                if (props.Action === undefined || props.Action === '') { props.Action = 'Capture'; }
                if (props.Title === undefined || props.Title === '') { props.Title = 'Capture Contact'; }
                if (props.Inner === undefined || props.Inner === '') { props.Inner = '<img />'; }
                if (props.Style === undefined || props.Style === '') { props.Style = PatternSelectionEngine.GetDefualtButtonStyle(props.Param); }
                if (props.Class === undefined || props.Class === '') { props.Class = 'Capture_Injected_Button_Logo'; }
                return PatternSelectionEngine.GenerateButtonFromObject(Container, props, Group, Path);
            case 'capture_contact_button_icon': case 'captureicon': case 'capturebuttonicon':
                if (props.Action === undefined || props.Action === '') { props.Action = 'Capture'; }
                if (props.Title === undefined || props.Title === '') { props.Title = 'Capture Contact'; }
                if (props.Inner === undefined || props.Inner === '') { props.Inner = '<img />'; }
                if (props.Style === undefined || props.Style === '') { props.Style = PatternSelectionEngine.GetDefualtButtonStyle(props.Param); }
                if (props.Class === undefined || props.Class === '') { props.Class = 'Capture_Injected_Button_Icon'; }
                return PatternSelectionEngine.GenerateButtonFromObject(Container, props, Group, Path);
            case 'capture_group_button_logo': case 'capturegrouplogo': case 'capturegroupbuttonlogo': case 'capturegroupbuttontext':
                if (props.Action === undefined || props.Action === '') { props.Action = 'CaptureGroup'; }
                if (props.Title === undefined || props.Title === '') { props.Title = 'Capture Group'; }
                if (props.Inner === undefined || props.Inner === '') { props.Inner = '<img />'; }
                if (props.Style === undefined || props.Style === '') { props.Style = PatternSelectionEngine.GetDefualtButtonStyle(props.Param); }
                if (props.Class === undefined || props.Class === '') { props.Class = 'Capture_Injected_GroupButton_Logo'; }
                return PatternSelectionEngine.GenerateButtonFromObject(Container, props, Group, Path);
            case 'capture_group_button_icon': case 'capturegroupicon': case 'capturegroupbuttonicon':
                if (props.Action === undefined || props.Action === '') { props.Action = 'CaptureGroup'; }
                if (props.Title === undefined || props.Title === '') { props.Title = 'Capture Group'; }
                if (props.Inner === undefined || props.Inner === '') { props.Inner = '<img />'; }
                if (props.Style === undefined || props.Style === '') { props.Style = PatternSelectionEngine.GetDefualtButtonStyle(props.Param); }
                if (props.Class === undefined || props.Class === '') { props.Class = 'Capture_Injected_GroupButton_Icon'; }
                return PatternSelectionEngine.GenerateButtonFromObject(Container, props, Group, Path);
            case '':
                return PatternSelectionEngine.GenerateContainerFromObject(Path, props, Group);
            default:
                return undefined;
        }
        return undefined;
    },

    GetDefualtButtonStyle: function (Param) {
        switch (Param) {
            case 'XS': case 'ExtraSmall': return 'height: 8px,';
            case 'S': case 'Small': return 'height: 12px,';
            case 'M': case 'Medium': return 'height: 16px,';
            case 'L': case 'Large': return 'height: 20px,';
            case 'XL': case 'ExtaLarge': return 'height: 24px,';
            default: return '16px';
        }
    },
    GenerateInner: function (Parent, Inner) {
        if (Inner === undefined) { return undefined; }

        if (Inner instanceof Array) {
            var inners = [];
            for (var i = 0; i < Inner.length; i++)
            { inners.push(PatternSelectionEngine.GenerateInner(Parent, Inner[i])); }
            return Parent;
        } else if (Inner instanceof Object) { return [PatternSelectionEngine.GenerateInnerFromObject(Parent, Inner)]; }
        else if (typeof Inner === 'string') { return [PatternSelectionEngine.GenerateInnerFromString(Parent, Inner)]; }

        return undefined;
    },
    GenerateInnerFromObject: function (Parent, Inner) {
        if (Inner === undefined) { return undefined; }

        var inner = '';

        inner += '<' + (Inner.Type !== undefined && Inner.Type !== '' ? Inner.Type : 'DIV') + ' ';
        if (Inner.Class !== undefined && Inner.Class !== '') { inner += 'class=\'' + Inner.Class + '\' '; }
        if (Inner.Style !== undefined && Inner.Style !== '') { inner += 'style=\'' + Inner.Style + '\' '; }

        if (Inner.Attributes !== undefined && Inner.Attributes !== '') { inner += Inner.Attributes + ' '; }

        inner += '>';
        if (Inner.Contents !== undefined && Inner.Contents !== '') { inner += Inner.Contents; }
        inner += '</' + (Inner.Type !== undefined && Inner.Type !== '' ? Inner.Type : 'DIV') + '>';

        //inner += 'onclick='javascript:InnerActions.ExecuteAction(this, ' + (InnerActions.Actions.length - 1) + ', \'' + action.ID + '\');' ';

        inner = $(inner);

        $(Parent).append(inner);

        if (Inner.Inner !== undefined) { PatternSelectionEngine.GenerateInner(inner, Inner.Inner); }

        //PatternSelectionEngine.GenerateInner($('#' + Action.ID), Inner.Inner);
        return inner;
    },
    GenerateInnerFromString: function (Parent, Inner) {
        if (Inner === undefined) { return undefined; }

        var props = PatternSelectionEngine.ParseProps({ Source: Inner });

        if (props.Value === '') {
            return PatternSelectionEngine.GenerateInner(Parent, props);
        } else {
            $(Parent).append($(Inner));
        }

        return undefined;
    },

    ParseProps: function (Props) {
        if (Props === undefined) { return { Value: '' }; }

        var props = Props.Source.indexOf('{');
        Props.Value = Props.Source;

        if (props > 0) {
            Props.Value = Props.Source.substring(0, props);
            props = Props.Source.substring(props);
            try {
                props = JSON.parse(props);
                props.Value = Props.Value;
                props.Source = Props.Source;
                Props = props;
            } catch (e) { }
        } else {
            props = Props.Source.indexOf('|');
            if (props > 0) {
                Props.Value = Props.Source.substring(0, props);
                Props.Style = Props.Source.substring(props + 1);
            }
        }

        var parts = Props.Value.split('.');
        if (parts.length > 0) {
            Props.Param = parts[parts.length - 1];
            Props.Button = parts.splice(0, parts.length - 1).join('.');
        }

        return Props;
    },


    SetAction: function (Action, NewAction) { if (Action !== undefined) { Action.Action = NewAction; } return Action; },

    GenerateID: function (Type) {
        switch (Type) {
            case 'E': case 'Event': return 'C_E_' + PatternSelectionEngine.GenerateGUID();
            case 'B': case 'Button': return 'C_B_' + PatternSelectionEngine.GenerateGUID();
            case 'C': case 'Container': return 'C_C_' + PatternSelectionEngine.GenerateGUID();
            default: return 'C_' + Type + '_' + PatternSelectionEngine.GenerateGUID();
        }
        return 'C_' + Type + '_' + PatternSelectionEngine.GenerateGUID();
    },
    GenerateAction: function (ID, Action, Group, Path, Sender, Event) {
        if (ID === undefined) { ID = PatternSelectionEngine.GenerateID(); }
        else if (ID.length < 20) { ID = PatternSelectionEngine.GenerateID(ID); }
        var action = { ID: ID, Action: Action, Group: Group, Path: Path, Sender: Sender };
        ButtonActions.Actions.push(action);


        return action;
    },

    SortButtons: function (a, b) {
        if (a === undefined && b === undefined) { return 0; }
        if (a === undefined) { return 1; }
        if (b === undefined) { return -1; }

        if (typeof a === 'string' && a.match(/^[0-9]{1,}(-)[a-zA-Z.]*$/g)) { a = { Ordinal: parseInt(a.split('-')[0]) }; }
        if (typeof b === 'string' && b.match(/^[0-9]{1,}(-)[a-zA-Z.]*$/g)) { b = { Ordinal: parseInt(b.split('-')[0]) }; }

        if (a.Ordinal === undefined && b.Ordinal === undefined) { return 0; }
        if (a.Ordinal === undefined) { return 1; }
        if (b.Ordinal === undefined) { return -1; }
        return a.Ordinal - b.Ordinal;
    },
    RemoveOrdinals: function (Buttons) {
        for (var b = 0; b < Buttons.length; b++) {
            if (Buttons[b] instanceof Object) { }
            else if (typeof Buttons[b] === 'string') {
                if (Buttons[b].match(/^[0-9]{1,}(-)[a-zA-Z.]*$/g)) {
                    var bps = Buttons[b].split('-');
                    Buttons[b] = bps[1];
                    //console.log(Buttons[b]);
                }
            } else { Buttons.splice(b, 1); b--; }
        }
        return Buttons;
    },
    GenerateGUID: function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    },
    GetValue: function (Elements, Attribute) {
        var value = null;
        if (Attribute) {
            switch (Attribute) {
                case 'html': value = $(Elements).html(); break;
                case 'text': value = $(Elements).text(); break;
                default: value = $(Elements).attr(Attribute); break;
            }
        }
        else { value = $(Elements).text(); }
        // Bugfix
        if (typeof value === 'string') { value = value.trim(); }
        return value;
    },
    ProcessField: function (Field, Path, Parent, Data) {
        var paths = [];
        var dataFound = false;
        var fldData = { Name: Field.Field, Value: null, Field: Field, Path: null };
        for (var s = 0; s < Field.Selectors.length; s++) {

            paths = PatternSelectionEngine.BuildSelector(Path, Field.Selectors[s]);
            paths = PatternSelectionEngine.QualifyPaths(paths, Field.Qualifiers);

            for (var p = 0; p < paths.length; p++) {
                var vals = PatternSelectionEngine.GetElement(paths[p]);
                for (var v = 0; v < vals.length; v++) {
                    var val = vals[v];
                    var path = paths[p].clone();
                    //path[path.length - 1] = path[path.length - 1] + ':eq(' + v + ')';
                    //if (!PatternSelectionEngine.QualifyPath(path, Field.Qualifiers)) { continue; }

                    //PatternSelectionEngine.Log(val.text());
                    //if (val === '' || val === undefined || val === null || val.length === 0) { continue; }

                    var fld = { Name: Field.Field, Value: PatternSelectionEngine.GetValue(val, Field.Selectors[s].Attribute), Field: Field, Path: path };

                    var fields = PatternSelectionEngine.RunValueProcesses(fld, Field.Selectors[s].Processors);

                    //PatternSelectionEngine.Log(fields);
                    Data = Data.concat(fields);

                    if (Field.Keep === undefined || Field.Keep === 'FirstValue') { return Data; }
                    dataFound = true;
                }

                //var val = PatternSelectionEngine.GetElement(paths[p]);

                ////PatternSelectionEngine.Log(val.text());
                //if (val === '' || val === undefined || val === null || val.length === 0) {
                //    //Data.push();
                //    //if (Field.Keep === undefined || Field.Keep === 'FirstValue') { return Data; }
                //    //dataFound = true;
                //    continue;
                //}

                //for (var v = 0; v < val.length; v++) {

                //    var fld = { Name: Field.Field, Value: null, Field: Field, Path: paths[p] };

                //    if (Field.Selectors[s].Attribute) {
                //        switch (Field.Selectors[s].Attribute) {
                //            case 'html': fld.Value = $(val[v]).html(); break;
                //            case 'text': fld.Value = $(val[v]).text(); break;
                //            default: fld.Value = $(val[v]).attr(Field.Selectors[s].Attribute); break;
                //        }
                //    }
                //    else { fld.Value = $(val[v]).text(); }

                //    var fields = PatternSelectionEngine.RunValueProcesses(fld, Field.Selectors[s].Processors);

                //    //PatternSelectionEngine.Log(fields);
                //    Data = Data.concat(fields);

                //    if (Field.Keep === undefined || Field.Keep === 'FirstValue') { return Data; }
                //    dataFound = true;
                //}

                if (dataFound && (Field.Keep === undefined || Field.Keep === 'FirstSelector')) { return Data; }
            }
        }
        if (!dataFound) { Data.push(fldData); }
        return Data;
    },

    DetermineLayout: function (Patterns) {
        var found = false;
        var p;
        var up;
        var i;
        var l;
        PatternSelectionEngine.Log(Patterns);
        PatternSelectionEngine.Log(Patterns.length);

        for (i = 0; i < Patterns.length; i++) {
            var pattern = Patterns[i];
            PatternSelectionEngine.Log(pattern);
            PatternSelectionEngine.Log(location.host);
            found = false;
            if (pattern.Domains.indexOf(location.host) >= 0) { found = true; }
            else {
                for (p = 0; p < pattern.Domains.length; p++) {
                    PatternSelectionEngine.Log(pattern.Domains[p]);
                    if (location.host.match(new RegExp(pattern.Domains[p], 'g'))) { found = true; break; }
                }
            }

            if (!found && pattern.UserDomains) {
                if (pattern.UserDomains.indexOf(location.host) >= 0) { found = true; }
                else {
                    for (p = 0; p < pattern.UserDomains.length; p++) {
                        PatternSelectionEngine.Log(pattern.Domains[p]);
                        if (location.host.match(new RegExp(pattern.Domains[p], 'g'))) { found = true; break; }
                    }
                }
            }

            if (found) {
                PatternSelectionEngine.Log('Matched Domain: Paths: ' + pattern.Paths.length);
                for (p = 0; p < pattern.Paths.length; p++) {
                    found = false;
                    var path = pattern.Paths[p];
                    PatternSelectionEngine.Log(path);
                    PatternSelectionEngine.Log(document.URL);
                    for (up = 0; up < path.UrlPatterns.length; up++) {
                        PatternSelectionEngine.Log(path.UrlPatterns[up]);
                        if (document.URL.match(new RegExp(path.UrlPatterns[up], 'g'))) { PatternSelectionEngine.Log(path.UrlPatterns[up]); found = true; break; }
                    }

                    if (found) {
                        PatternSelectionEngine.Log('Matched Path: Layouts: ' + path.Layouts.length);
                        found = false;
                        for (l = 0; l < path.Layouts.length; l++) {
                            var layout = path.Layouts[l];
                            PatternSelectionEngine.Log(layout);

                            if (PatternSelectionEngine.QualifyPath([], layout.Qualifiers)) {
                                PatternSelectionEngine.Log('Matched Layout: ' + layout.Name);
                                //alert('Matched Layout: ' + layout.Name);
                                return layout;
                                //break;
                            } else {
                                PatternSelectionEngine.Log('Failed Layout');
                            }
                        }
                        //found = true;
                        //break;
                    } else {
                        PatternSelectionEngine.Log('Failed URL');
                    }
                }
            } else {
                PatternSelectionEngine.Log('Failed Domain');
            }
            //if (found) { break; }
        }
        return null;
    },

};




var messages = {
    ping: function (data, sender, callback) {
        var debug = false; //'selection.js->ping->';
        if (debug) { console.log(debug + 'received', data); }
        callback('pong2');
    },
    patternParser: function (data, sender, callback) {
        var debug = false; //'selection.js->patternParser->';
        var contacts = [];
        var layout = PatternSelectionEngine.DetermineLayout(data.patterns);
        //if (debug) { console.log(debug + 'layout', layout); }
        var response = {
            layout: layout,
            Domain: location.host,
            Url: document.URL
        };

        if (layout !== null) { layout = { 'Name': 'root', 'Index': 0, 'Group': null, 'Selector': null, 'Data': PatternSelectionEngine.ProcessLayout(layout, [], null, data.options) }; }
        response.Values = layout;
        callback(response);
    }
};

chrome.runtime.onMessage.addListener(function (request, sender, callback) {
    if (messages[request.method]) {
        messages[request.method](request.data, sender, callback);
    } else {
        callback(null);
    }
});


chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {

    var debugMode = true;
    var html = null,
        li = null,
        el = null,
        content = null;


    if (request.method === 'getSelection') {

        if (debugMode) { console.log('selection.js:getSelection'); }

        var selection = window.getSelection();

        if (!selection || (selection.rangeCount === 0)) {

            if (debugMode) { console.log('selection.js:length=none'); }

            sendResponse({ data: null });
            return;
        }


        var range = selection.getRangeAt(0);
        content = range.cloneContents();
        var enclosure = document.createElement('div');
        enclosure.appendChild(content);
        html = enclosure.innerHTML;

        if (debugMode) { console.log('selection.js:length=' + (html ? html.length : -1)); }

        sendResponse({ data: html });
    }
    else if (request.method === 'getParentPage') {

        if (debugMode) { console.log('selection.js:getParentPage'); }


        html = null;

        if (window.parent && window.parent.document) {

            if (!html) {
                html = window.parent.document.documentElement.innerHTML;
            }

            if (!html) {
                html = window.parent.document.innerHTML;
            }
        }


        if (debugMode) { console.log('selection.js:length=' + (html ? html.length : -1)); }

        sendResponse({ data: html });
    }
    else if (request.method === 'getPage') {

        if (debugMode) { console.log('selection.js:getPage'); }


        html = null;

        if (!html) {
            html = window.document.innerHTML;
        }

        if (!html) {
            html = window.document.documentElement.innerHTML;
        }

        if (debugMode) { console.log('selection.js:length=' + (html ? html.length : -1)); }

        sendResponse({ data: html });
    }
    else if (request.method === 'ping') {
        sendResponse('pong');
    }
    else if (request.method === 'getOAuth') {
        console.log(debug + 'getOAuth');
        var accessToken = document.getElementById('accessToken');
        var refreshToken = document.getElementById('refreshToken');
        var response = {};
        if (accessToken && refreshToken) {
            response.accessToken = accessToken.value;
            response.refreshToken = refreshToken.value;
        }
        console.log(debug + 'getOAuth Response > ', response);
        sendResponse(response);
    }
    else if (request.method.indexOf('highlightGoogleResult') === 0) {

        var url = request.method.replace('highlightGoogleResult', '');
        var css = 'background-color: rgb(255, 251, 204);';
        var cites = document.getElementsByTagName('cite');

        if (cites) {

            var i = cites.length;
            while (i--) {

                var cite = cites[i];

                if (cite.innerText === url) {

                    li = null;
                    el = cite;
                    do {
                        el = el.parentNode;
                        if (el && el.tagName && el.tagName.toLowerCase() === 'div' && el.className === 'rc') {
                            li = el;
                            break;
                        }
                    } while (el && el.parentNode);

                    if (li) {
                        li.scrollIntoView();
                        li.style.cssText = css;
                    }

                } else {

                    li = null;
                    el = cite;
                    do {
                        el = el.parentNode;
                        if (el && el.tagName && el.tagName.toLowerCase() === 'div' && el.className === 'rc') {
                            li = el;
                            break;
                        }
                    } while (el && el.parentNode);

                    if (li && li.style.cssText === css) {
                        li.style.cssText = '';
                    }

                }
            }
        }
    }
    else if (request.method.indexOf('downloadCSVFile') === 0) {
        // Obsolete! 
        console.log('downloadCSVFile', request);

        var downloadFileFromText = function (filename, content) {
            var a = document.createElement('a');
            var blob = new Blob([content], { type: 'text/csv;charset=UTF-8' });
            a.href = window.URL.createObjectURL(blob);
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click(); //this is probably the key - simulating a click on a download link
            //delete a;// we don't need this anymore
        };


        var filename = request.filename;
        content = request.content;

        downloadFileFromText(filename, content);

    }
    /*
    //  Obsolete: CTK 6-12-14
    TODO: Remove
    else if (request.method === 'doPatternCapture') {

        var contacts = [];

        var val = PatternSelectionEngine.DetermineLayout(request.patterns);
        //console.log(val);
        var response = {};
        response.Layout = val;
        response.Domain = location.host;
        response.Url = document.URL;

        if (val !== null) { val = { 'Name': 'root', 'Index': 0, 'Group': null, 'Selector': null, 'Data': PatternSelectionEngine.RetreiveData(val.GroupFields, '') }; }
        //console.log(val);
        response.Values = val;

        //Callback(response);

        sendResponse({ data: response });
    }*/
});



var port = null;
//var debug = 'captureContentScript.js->';
var debug = true;

var getPatternsAndCheck = function () {

    if (capturePatterns.length > 0) {
        applyCapturePatterns(capturePatterns);
        return;
    }
    else {
        var message = { GetPatterns: true, CheckForAllowNotification: document.URL };
        if (debug) { console.log(debug + 'sendMessage->', message); }
        port.postMessage(message);
    }

};

var capturePatterns = [];
var broadlookCaptureNotificationBar = null;

var applyCapturePatterns = function (patterns) {

    var showCaptureBar = function (data) {

        var count = 0;

        var CountProfiles = function (d) {

            if (d && d.Values && d.Values.Data) {
                if (d.Values.Name === 'root' && d.Values.Data.length > 0 && d.Values.Data[0].Name === 'Profiles')
                { return d.Values.Data[0].Data.length; }
                else if (d.Values.Name === 'root' && d.Values.Data.length > 0 && d.Values.Data[0].Name === 'Search Results Page')
                { return d.Values.Data[0].Data[0].Data.length; }
                else
                { return d.Values.Data.length; }
            }

            return 0;
        };

        try {
            count = CountProfiles(data);
        } catch (e) {
            console.log('ERROR in CountProfiles', e.message);
        }

        if (debug) { console.log(debug + 'setBadgeText', count); }

    }

    if (debug) { console.log(debug + 'patterns->', patterns); }
    messages.patternParser({ patterns: patterns, options: { Retrieve: true, Buttons: true } }, null, function (response) {
        if (debug) { console.log(debug + 'contacts->', response); }


        if (debug) { console.log('autoSearchInCRMEnabled', autoSearchInCRMEnabled); }
        if (autoSearchInCRMEnabled) {

            try {

                if (response.Values && response.Values.Data && response.Values.Data.length > 0 && response.Values.Data[0].Name === 'Profiles') {
                    if (debug) { console.log(debug + 'multiple contacts. cancelled.'); }
                    return;
                }
            } catch (e) {
                console.log('ERROR in multiple contacts check: ' + e.message);
            }

            var res = {
                Name: 'root', Index: 0, Group: null, Selector: null,
                Data: response
            }

            if (debug) { console.log('FindInCRM', res); }
            port.postMessage({ FindInCRM: res });
        }

        showCaptureBar(response);
    });
};

var addBroadlookCaptureNotificationBar = function () {

    var doc = window.document;
    if (!doc) { doc = window.document.documentElement; }
    if (!doc) {
        console.log('ERROR in addBroadlookCaptureNotificationBar: No document');
        return;
    }

    var bar = document.createElement('div');
    bar.id = 'broadlookCaptureNotificationBar';
    bar.style.position = 'fixed';
    //bar.style.top = '-100px';
    //bar.style.top = '100px';
    //var l = 100 + doc.documentElement.clientWidth;
    //bar.style.left = '' + l + 'px';
    bar.style.display = 'none';
    bar.innerHTML =
        '<div class="CaptureNotificationBarInner">' +
        '<img src="' + chrome.extension.getURL('images/logo/blue-icon-38.png') + '">' +
        '<a style="font-size: 10px; color: #ccc; float: left; width:20px; text-align: left; display: none;" href="#" id="expandCaptureNotificationBarButton">Show</a>' +
        '</div>' +
        '<div style="width: 470px">' +
            '<a style="font-size: 10px; color: #ccc; float: right; width:20px; text-align: right; display: inline-block;" href="#" id="hideCaptureNotificationBarButton">Hide</a>' +
            '<div style="width: 400px; float: left; padding-left: 10px">' +
                '<a style="" id="captureNotificationBarLessLink" href="#" style="display:none">Less</a>' +
                '<div id="captureNotificationBarText" style="width: 100%"></div>' +
                '<a style="" id="captureNotificationBarMoreLink" href="#">More</a>' +
            '</div>' +
        '</div>' +
        '<div id="captureNotificationBarError" style="clear: both; margin-left: 33px; width: 470px; background-color: transparent; display:none"><span id="captureNotificationBarErrorText" style="color: #cc0000"></span></div>';

    if (doc && doc.body) {
        doc.body.appendChild(bar);
    }

    broadlookCaptureNotificationBar = bar;

    $('#hideCaptureNotificationBarButton').click(contractCaptureNotificationBar);
    $('#expandCaptureNotificationBarButton').click(expandCaptureNotificationBar);
    $('#captureNotificationBarMoreLink').click(captureNotificationBarMoreLink);
    $('#captureNotificationBarLessLink').click(captureNotificationBarLessLink);
    $('#captureNotificationBarLessLink').hide();

    setCaptureNotificationBarPosition();

    $(window).on('resize', function () {
        setCaptureNotificationBarPosition();
    });
};

var supressCaptureNotificationBar = false;
var showCaptureNotificationBarTimeout = null;
var hideCaptureNotificationBarTimeout = null;
var captureNotificationBarMoreContent = null;
var captureNotificationBarLessContent = null;
var captureNotificationBarMoreLink = function () {
    $('#captureNotificationBarLessLink').show();
    showCaptureNotificationBar(captureNotificationBarMoreContent, 0, 0, false);
};
var captureNotificationBarLessLink = function () {
    $('#captureNotificationBarLessLink').hide();
    showCaptureNotificationBar(captureNotificationBarLessContent, 0, 0, true);
};

var showCaptureNotificationBar = function (text, showDelay, hideDelay, showMore) {

    try {

        if (debug) { console.log(debug + 'showCaptureNotificationBar', text, showDelay, hideDelay, showMore); }
        if (hideCaptureNotificationBarTimeout)
        { window.clearTimeout(hideCaptureNotificationBarTimeout); }

        if (showCaptureNotificationBarTimeout)
        { window.clearTimeout(showCaptureNotificationBarTimeout); }

        if (supressCaptureNotificationBar) { return; }

        var $bar = $('#broadlookCaptureNotificationBar');


        if (showDelay > 0) {
            showCaptureNotificationBarTimeout = window.setTimeout(function () {
                if (showMore) {
                    $('#captureNotificationBarMoreLink').show();
                } else {
                    $('#captureNotificationBarMoreLink').hide();
                }
                $('#captureNotificationBarText').html(text);
                //$bar.show().animate({ top: '100px' }, { queue: true, duration: 2000 });
                $bar.show().animate({ left: CaptureEmbeddedObject.Bar.Visible.Left.Str }, { queue: true, duration: 2000 });
            }, showDelay);
        } else {
            if (showMore) {
                $('#captureNotificationBarMoreLink').show();
            } else {
                $('#captureNotificationBarMoreLink').hide();
            }
            $('#captureNotificationBarText').html(text);
            //$bar.css({ top: '100px' });
            $bar.css({ left: CaptureEmbeddedObject.Bar.Visible.Left.Str });
            $bar.show();
        }

        console.log($bar);

        if (hideDelay > 0)
        { hideCaptureNotificationBarTimeout = window.setTimeout(contractCaptureNotificationBar, showDelay + hideDelay); }

    } catch (e) {
        console.log(debug + 'ERROR in showCaptureNotificationBar', e.message);
    }

}

var setCaptureError = function (error) {

    if (error) {
        $('#captureNotificationBarErrorText').html(error);
        $('#captureNotificationBarError').show();
    } else {
        $('#captureNotificationBarError').hide();
    }

}

var contractCaptureNotificationBar = function () {
    if (debug) { console.log(debug + 'contractCaptureNotificationBar'); }
    $('#broadlookCaptureNotificationBar').animate({ left: CaptureEmbeddedObject.Bar.Contracted.Left.Str }, { queue: true, duration: 0 });
    $('#expandCaptureNotificationBarButton').show();
};

var expandCaptureNotificationBar = function () {
    if (debug) { console.log(debug + 'expandCaptureNotificationBar'); }
    $('#expandCaptureNotificationBarButton').hide();
    $('#broadlookCaptureNotificationBar').animate({ left: CaptureEmbeddedObject.Bar.Visible.Left.Str }, { queue: true, duration: 0 });
};

var setCaptureNotificationBarPosition = function () {

    var doc = window.document;
    if (!doc) { doc = window.document.documentElement; }
    var barWidth = 500;
    var windowWidth = doc.documentElement.clientWidth;
    var left = windowWidth - barWidth;
    if (debug) {
        console.log('windowWidth=', windowWidth, 'left=', left, 'barWidth=', barWidth);
    }
    if (left < barWidth) {
        left = 0;
        barWidth = windowWidth;
    }

    CaptureEmbeddedObject.Bar = {
        Visible: {
            Left: { Value: left },
            Width: { Value: barWidth }
        },
        Contracted: {
            Left: { Value: left + barWidth - 60 }
        },
        Hidden: {
            Left: { Value: 100 + windowWidth }
        }
    };

    CaptureEmbeddedObject.Bar.Visible.Left.Str = '' + CaptureEmbeddedObject.Bar.Visible.Left.Value + 'px';
    CaptureEmbeddedObject.Bar.Visible.Width.Str = '' + CaptureEmbeddedObject.Bar.Visible.Width.Value + 'px';
    CaptureEmbeddedObject.Bar.Contracted.Left.Str = '' + CaptureEmbeddedObject.Bar.Contracted.Left.Value + 'px';
    CaptureEmbeddedObject.Bar.Hidden.Left.Str = '' + CaptureEmbeddedObject.Bar.Hidden.Left.Value + 'px';

    $('#broadlookCaptureNotificationBar').css('width', CaptureEmbeddedObject.Bar.Visible.Width.Str);
    $('#broadlookCaptureNotificationBar').css('left', CaptureEmbeddedObject.Bar.Hidden.Left.Str);
    $('#broadlookCaptureNotificationBar').css('top', '100px');
};

var captureLastUrl = null;

var initBroadlookCapture = function () {

    if (debug) { console.log(debug + 'init', captureLastUrl, document.URL); }

    captureLastUrl = document.URL;

    if (!port) {

        port = chrome.runtime.connect();

        // [Experimental feature]
        //try {
        //    var el = document.getElementById('CaptureInstallationWizardCustomeEvent');
        //    if (el) {
        //        el.addEventListener('GetSFSessionID', function() {
        //            var eventData = document.getElementById('CaptureInstallationWizardCustomeEvent').innerText;
        //            port.postMessage({ message: 'GetSFSessionID', values: eventData });
        //        });
        //    }
        //} catch (e) {
        //    console.log('ERROR in CaptureInstallationWizardCustomeEvent: ', e.message);
        //} 

        try {
            port.onMessage.addListener(function (msg) {

                if (debug) { console.log(debug + 'Message received', msg); }

                if (msg.Patterns != null) {
                    capturePatterns = msg.Patterns;
                    CaptureEmbeddedObject.Properties.Patterns = msg.Patterns;
                    CaptureEmbeddedObject.Init();
                    applyCapturePatterns(capturePatterns);
                }

                if (msg.AllowNotification != null) {
                    supressCaptureNotificationBar = !msg.AllowNotification;
                }


                if (msg.FoundInCRM != null) {

                    captureNotificationBarLessContent = msg.FoundInCRM.Message;
                    captureNotificationBarMoreContent = null;

                    if (msg.FoundInCRM.More) {
                        captureNotificationBarMoreContent = msg.FoundInCRM.More;
                    }

                    showCaptureNotificationBar(captureNotificationBarLessContent, 100, 5000, true);
                }

                if (msg.FoundDuplicates != null) {

                    try {
                        CaptureEmbeddedObject.Properties.Data = msg.FoundDuplicates.List;
                        CaptureEmbeddedObject.Render();
                    } catch (e) {
                        console.log('ERROR in FoundDuplicates: ' + e.message);
                    }

                }

                if (msg.Error != null) {
                    if (debug) { console.log(debug + 'error', msg.Error); }
                    setCaptureError(msg.Error);
                } else {
                    setCaptureError(null);
                }

                if (msg.GetSFSessionID != null) {
                    try {
                        console.log('**** GetSFSessionID');

                        var session = document.cookie.match(/(^|;\s*)sid=(.+?);/);
                        if (session) { session = session[2]; }

                        console.log('***** SF Session = ' + (session ? session : -1));
                        //var response = { data: session };

                        port.postMessage({ message: 'SetSFSessionID', values: session });

                    } catch (e) {
                        console.log('ERROR in GetSFSessionID Event: ', e.message);
                    }

                }
            });
        } catch (e) {
            console.log('ERROR in ON MESSAGE', e.message);
        }



        //try {
        //    chrome.runtime.onInstalled.addListener(function () {
        //        console.log('ON INSTALLED');
        //    });
        //} catch (e) {
        //    console.log('ERROR in ON INSTALLED', e.message);
        //}



        //try {
        //    port.disconnect = function () {
        //        console.log('PORT DISCONNECTED');
        //    };
        //} catch (e) {
        //    console.log('ERROR in PORT DISCONNECT', e.message);
        //}



        //try {
        //    chrome.runtime.onConnect.addListener(function () {
        //        console.log('PORT CONNECTED');
        //    });
        //} catch (e) {
        //    console.log('ERROR in PORT CONNECT', e.message);
        //}



        //try {
        //    port.onSuspend = function () {
        //        console.log('PORT SUSPENDED');
        //    };
        //} catch (e) {
        //    console.log('ERROR in PORT SUSPEND', e.message);
        //}



        if (debug) { console.log('CREATED PORT', port); }

        $(window).on('unload', function () {
            port = null;
        });
    }

    if (!broadlookCaptureNotificationBar) {
        addBroadlookCaptureNotificationBar();
    }

    getPatternsAndCheck();
}


// Contact Capture Test Page

//+function (a) { "use strict"; var b = function (b, c) { this.options = c, this.$element = a(b), this.$backdrop = this.isShown = null, this.options.remote && this.$element.find(".modal-content").load(this.options.remote, a.proxy(function () { this.$element.trigger("loaded.bs.modal") }, this)) }; b.DEFAULTS = { backdrop: !0, keyboard: !0, show: !0 }, b.prototype.toggle = function (a) { return this[this.isShown ? "hide" : "show"](a) }, b.prototype.show = function (b) { var c = this, d = a.Event("show.bs.modal", { relatedTarget: b }); this.$element.trigger(d); if (this.isShown || d.isDefaultPrevented()) return; this.isShown = !0, this.escape(), this.$element.on("click.dismiss.bs.modal", '[data-dismiss="modal"]', a.proxy(this.hide, this)), this.backdrop(function () { var d = a.support.transition && c.$element.hasClass("fade"); c.$element.parent().length || c.$element.appendTo(document.body), c.$element.show().scrollTop(0), d && c.$element[0].offsetWidth, c.$element.addClass("in").attr("aria-hidden", !1), c.enforceFocus(); var e = a.Event("shown.bs.modal", { relatedTarget: b }); d ? c.$element.find(".modal-dialog").one(a.support.transition.end, function () { c.$element.focus().trigger(e) }).emulateTransitionEnd(300) : c.$element.focus().trigger(e) }) }, b.prototype.hide = function (b) { b && b.preventDefault(), b = a.Event("hide.bs.modal"), this.$element.trigger(b); if (!this.isShown || b.isDefaultPrevented()) return; this.isShown = !1, this.escape(), a(document).off("focusin.bs.modal"), this.$element.removeClass("in").attr("aria-hidden", !0).off("click.dismiss.bs.modal"), a.support.transition && this.$element.hasClass("fade") ? this.$element.one(a.support.transition.end, a.proxy(this.hideModal, this)).emulateTransitionEnd(300) : this.hideModal() }, b.prototype.enforceFocus = function () { a(document).off("focusin.bs.modal").on("focusin.bs.modal", a.proxy(function (a) { this.$element[0] !== a.target && !this.$element.has(a.target).length && this.$element.focus() }, this)) }, b.prototype.escape = function () { this.isShown && this.options.keyboard ? this.$element.on("keyup.dismiss.bs.modal", a.proxy(function (a) { a.which == 27 && this.hide() }, this)) : this.isShown || this.$element.off("keyup.dismiss.bs.modal") }, b.prototype.hideModal = function () { var a = this; this.$element.hide(), this.backdrop(function () { a.removeBackdrop(), a.$element.trigger("hidden.bs.modal") }) }, b.prototype.removeBackdrop = function () { this.$backdrop && this.$backdrop.remove(), this.$backdrop = null }, b.prototype.backdrop = function (b) { var c = this.$element.hasClass("fade") ? "fade" : ""; if (this.isShown && this.options.backdrop) { var d = a.support.transition && c; this.$backdrop = a('<div class="modal-backdrop ' + c + '" />').appendTo(document.body), this.$element.on("click.dismiss.bs.modal", a.proxy(function (a) { if (a.target !== a.currentTarget) return; this.options.backdrop == "static" ? this.$element[0].focus.call(this.$element[0]) : this.hide.call(this) }, this)), d && this.$backdrop[0].offsetWidth, this.$backdrop.addClass("in"); if (!b) return; d ? this.$backdrop.one(a.support.transition.end, b).emulateTransitionEnd(150) : b() } else !this.isShown && this.$backdrop ? (this.$backdrop.removeClass("in"), a.support.transition && this.$element.hasClass("fade") ? this.$backdrop.one(a.support.transition.end, b).emulateTransitionEnd(150) : b()) : b && b() }; var c = a.fn.modal; a.fn.modal = function (c, d) { return this.each(function () { var e = a(this), f = e.data("bs.modal"), g = a.extend({}, b.DEFAULTS, e.data(), typeof c == "object" && c); f || e.data("bs.modal", f = new b(this, g)), typeof c == "string" ? f[c](d) : g.show && f.show(d) }) }, a.fn.modal.Constructor = b, a.fn.modal.noConflict = function () { return a.fn.modal = c, this }, a(document).on("click.bs.modal.data-api", '[data-toggle="modal"]', function (b) { var c = a(this), d = c.attr("href"), e = a(c.attr("data-target") || d && d.replace(/.*(?=#[^\s]+$)/, "")), f = e.data("bs.modal") ? "toggle" : a.extend({ remote: !/#/.test(d) && d }, e.data(), c.data()); c.is("a") && b.preventDefault(), e.modal(f, this).one("hide", function () { c.is(":visible") && c.focus() }) }), a(document).on("show.bs.modal", ".modal", function () { a(document.body).addClass("modal-open") }).on("hidden.bs.modal", ".modal", function () { a(document.body).removeClass("modal-open") }) }(jQuery), +function (a) { "use strict"; var b = function (c, d) { this.options = a.extend({}, b.DEFAULTS, d), this.$window = a(window).on("scroll.bs.affix.data-api", a.proxy(this.checkPosition, this)).on("click.bs.affix.data-api", a.proxy(this.checkPositionWithEventLoop, this)), this.$element = a(c), this.affixed = this.unpin = this.pinnedOffset = null, this.checkPosition() }; b.RESET = "affix affix-top affix-bottom", b.DEFAULTS = { offset: 0 }, b.prototype.getPinnedOffset = function () { if (this.pinnedOffset) return this.pinnedOffset; this.$element.removeClass(b.RESET).addClass("affix"); var a = this.$window.scrollTop(), c = this.$element.offset(); return this.pinnedOffset = c.top - a }, b.prototype.checkPositionWithEventLoop = function () { setTimeout(a.proxy(this.checkPosition, this), 1) }, b.prototype.checkPosition = function () { if (!this.$element.is(":visible")) return; var c = a(document).height(), d = this.$window.scrollTop(), e = this.$element.offset(), f = this.options.offset, g = f.top, h = f.bottom; this.affixed == "top" && (e.top += d), typeof f != "object" && (h = g = f), typeof g == "function" && (g = f.top(this.$element)), typeof h == "function" && (h = f.bottom(this.$element)); var i = this.unpin != null && d + this.unpin <= e.top ? !1 : h != null && e.top + this.$element.height() >= c - h ? "bottom" : g != null && d <= g ? "top" : !1; if (this.affixed === i) return; this.unpin && this.$element.css("top", ""); var j = "affix" + (i ? "-" + i : ""), k = a.Event(j + ".bs.affix"); this.$element.trigger(k); if (k.isDefaultPrevented()) return; this.affixed = i, this.unpin = i == "bottom" ? this.getPinnedOffset() : null, this.$element.removeClass(b.RESET).addClass(j).trigger(a.Event(j.replace("affix", "affixed"))), i == "bottom" && this.$element.offset({ top: c - h - this.$element.height() }) }; var c = a.fn.affix; a.fn.affix = function (c) { return this.each(function () { var d = a(this), e = d.data("bs.affix"), f = typeof c == "object" && c; e || d.data("bs.affix", e = new b(this, f)), typeof c == "string" && e[c]() }) }, a.fn.affix.Constructor = b, a.fn.affix.noConflict = function () { return a.fn.affix = c, this }, a(window).on("load", function () { a('[data-spy="affix"]').each(function () { var b = a(this), c = b.data(); c.offset = c.offset || {}, c.offsetBottom && (c.offset.bottom = c.offsetBottom), c.offsetTop && (c.offset.top = c.offsetTop), b.affix(c) }) }) }(jQuery), +function (a) { function b() { var a = document.createElement("bootstrap"), b = { WebkitTransition: "webkitTransitionEnd", MozTransition: "transitionend", OTransition: "oTransitionEnd otransitionend", transition: "transitionend" }; for (var c in b) if (a.style[c] !== undefined) return { end: b[c] }; return !1 } "use strict", a.fn.emulateTransitionEnd = function (b) { var c = !1, d = this; a(this).one(a.support.transition.end, function () { c = !0 }); var e = function () { c || a(d).trigger(a.support.transition.end) }; return setTimeout(e, b), this }, a(function () { a.support.transition = b() }) }(jQuery);

//$().ready(function () {

//    if (document.URL === 'http://broadlook.com/contactcapture/contactcapture2.htm') {

//        console.log('Test document loaded...', document.URL);

//        $('<style>.capture-button { height:23px; width:20px; opacity: 0.4; -webkit-transition: all .25s ease-out;  } .capture-button:hover{ width:40px; height:46px; opacity: 1; -webkit-transform: translate(-10px,-10px);}</style>').appendTo('head');
//        $('<style>.modal-open{overflow:hidden}.modal{display:none;overflow:auto;overflow-y:scroll;position:fixed;top:0;right:0;bottom:0;left:0;z-index:1050;-webkit-overflow-scrolling:touch;outline:0}.modal.fade .modal-dialog{-webkit-transform:translate(0,-25%);-ms-transform:translate(0,-25%);transform:translate(0,-25%);-webkit-transition:-webkit-transform .3s ease-out;-moz-transition:-moz-transform .3s ease-out;-o-transition:-o-transform .3s ease-out;transition:transform .3s ease-out}.modal.in .modal-dialog{-webkit-transform:translate(0,0);-ms-transform:translate(0,0);transform:translate(0,0)}.modal-dialog{position:relative;width:auto;margin:10px}.modal-content{position:relative;background-color:#fff;border:1px solid #999;border:1px solid rgba(0,0,0,.2);border-radius:6px;-webkit-box-shadow:0 3px 9px rgba(0,0,0,.5);box-shadow:0 3px 9px rgba(0,0,0,.5);background-clip:padding-box;outline:0}.modal-backdrop{position:fixed;top:0;right:0;bottom:0;left:0;z-index:1040;background-color:#000}.modal-backdrop.fade{opacity:0;filter:alpha(opacity=0)}.modal-backdrop.in{opacity:.5;filter:alpha(opacity=50)}.modal-header{padding:15px;border-bottom:1px solid #e5e5e5;min-height:16.43px}.modal-header .close{margin-top:-2px}.modal-title{margin:0;line-height:1.42857143}.modal-body{position:relative;padding:20px}.modal-footer{margin-top:15px;padding:19px 20px 20px;text-align:right;border-top:1px solid #e5e5e5}.modal-footer .btn+.btn{margin-left:5px;margin-bottom:0}.modal-footer .btn-group .btn+.btn{margin-left:-1px}.modal-footer .btn-block+.btn-block{margin-left:0}@media (min-width:768px){.modal-dialog{width:600px;margin:30px auto}.modal-content{-webkit-box-shadow:0 5px 15px rgba(0,0,0,.5);box-shadow:0 5px 15px rgba(0,0,0,.5)}.modal-sm{width:300px}}@media (min-width:992px){.modal-lg{width:900px}}</style>').appendTo('head');


//        var modal = ' <div class="modal fade" id="capture-modal" role="dialog" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-body capture-content"> Test Modal! </div><div class="modal-footer">' +
//            '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' +
//            //'<button type="button" class="btn btn-primary capture-button2">Save changes</button>' +
//            '</div></div></div></div>';
//        $(modal).prependTo('body');

//        var imageTemplate = '<img class="capture-button" width="20" src="http://webapp.broadlook.com/images/capture-icon.png"/>';
//        var container = $('.name');


//        container.each(function () {
//            var parent = $(this).parent();
//            var elem = $(imageTemplate).css({
//                "position": "absolute",
//                "left": parent.offset().left + parent.innerWidth() - 20,
//                "top": parent.offset().top,
//                "z-index:": '100'
//            });
//            parent.prepend(elem);
//            $(elem).on('click', function (event) {
//                var content = $(this).parent().html().replace(imageTemplate, '');
//                //console.log('this', content);
//                $('#capture-modal').modal('show');
//                $('.capture-content').html(content);

//                //var captureClick = function () {
//                //};
//                var btn = $('.capture-button2', elem);

//                $(btn).on('click', function (event) {
//                    console.log('Capturing', content);
//                    port.postMessage({ AddData: { data: content, sourceUrl: document.URL } })
//                });
//            });

//        });


//        //container.parent().prepend(elem);
//    }
//});

var CaptureEmbeddedObject = {

    //debug: 'selection.js->',

    Properties: {

        Bar: null,
        Data: null,
        Enabled: false,
        Patterns: null,
        SelectedIndex: null,
        Waiting: false,

    },

    Log: function (text) {
        if (debug) { console.log('CaptureEmbeddedObject->' + text); }
    },

    HasPattern: function () {
        var self = this;
        try {
            self.Log('CheckPatterns');


            if (!self.Properties.Patterns || self.Properties.Patterns.length === 0) {
                self.Log('CheckPatterns->No Patterns');
                return false;
            }

            var currentUrl = document.URL;
            //console.log('currentUrl', currentUrl);

            for (var i = 0; i < self.Properties.Patterns.length; i++) {
                var p = self.Properties.Patterns[i];
                //console.log('pattern', p);

                if (p.Domains && p.Domains.length > 0) {
                    for (var j = 0; j < p.Domains.length; j++) {
                        var d = p.Domains[j];
                        if (currentUrl.indexOf(d) >= 0) {
                            self.Log('CheckPatterns->Pattern Found');
                            console.log('domain', d);
                            return true;
                        }
                    }
                }

            }

            self.Log('CheckPatterns->Pattern Not Found');
            return false;


        } catch (e) {
            self.Log('CheckPatterns->Error->' + e.message);
        }

    },

    NavigateToNextPageOfGoogleResults: function () {
        var self = this;
        try {
            self.Log('NavigateToNextPageOfGoogleResults');
            var aElement = $('a#pnnext');
            if (aElement === undefined || aElement.length < 1) {
                self.Log('NavigateToNextPageOfGoogleResults->Link Not Found');
                return;
            }
            aElement[0].click();
            self.Log('NavigateToNextPageOfGoogleResults->Done');
        } catch (e) {
            self.Log('NavigateToNextPageOfGoogleResults->Error->' + e.message);
        }
    },

    GetDoc: function () {
        var doc = window.document;
        if (!doc) { doc = window.document.documentElement; }
        if (!doc) {
            console.log('ERROR in GetDoc: No document');
            return null;
        }
        return doc;
    },

    GetHeight: function (element) {

        var h = 0;

        if (element) {

            var nodeList = element.childNodes;

            if (nodeList) {
                var i = nodeList.length;
                while (i--) {
                    var el = nodeList[i];
                    //console.log('el', el);
                    if (el && el.style) {
                        console.log('style', el.style);
                        if (el.style.position === 'fixed') {
                            console.log('h', elel.style.height);
                            h += el.style.height;
                        }
                    }

                }
            }

        }


        return h;
    },

    DrawCaptureArea: function () {
        var self = CaptureEmbeddedObject;
        try {
            self.Log('DrawCaptureArea');

            if (!self.Properties.Enabled) {
                self.Log('DrawCaptureArea->Disabled');
                return;
            }

            if (self.Properties.Bar) {
                self.Log('DrawCaptureArea->Already created');
                return;
            }

            var doc = self.GetDoc();

            if (!doc || !doc.body) {
                throw { message: 'No body' };
                return;
            }

            var placeholder = document.createElement('div');
            placeholder.id = 'broadlookCaptureTopBarPlaceholder';

            var bar = document.createElement('div');
            bar.id = 'broadlookCaptureTopBar';

            bar.innerHTML = 'Capture Top Bar';

            var first = doc.body.firstChild
            if (first) {
                //doc.body.insertBefore(placeholder, first);
                doc.body.insertBefore(bar, first);
            } else {
                //doc.body.appendChild(placeholder);
                doc.body.appendChild(bar);
            }

            var a = doc.getElementById('header');
            if (a) {
                a.style.top = '68px';
            }

            a = null;
            a = doc.getElementById('searchform');
            if (a) {
                a.style.top = '83px';
            }

            doc.body.style.marginTop = '68px';

            self.Properties.Bar = bar;


            self.Log('DrawCaptureArea->Done');
        } catch (e) {
            self.Log('DrawCaptureArea->Error->' + (e.message || e));
        }

    },

    SelectPage: function (i) {
        var self = CaptureEmbeddedObject;
        try {
            self.Log('SelectPage');
            console.log(i);

            self.Properties.SelectedIndex = i;
            self.Render();

            self.Log('SelectPage->Done');
        } catch (e) {
            self.Log('SelectPage->Error->' + (e.message || e));
        }
    },

    Render: function () {
        var self = CaptureEmbeddedObject;
        try {
            self.Log('Render');
            //self.Properties.Bar.innerHTML = 'Waiting';
            //self.Properties.Bar.innerHTML = self.Properties.Data;

            if (!self.Properties.Enabled) {
                self.Log('Render->Disabled');
                return;
            }

            console.log('Render->Data', self.Properties.Data);

            var h = [];



            if (self.Properties.Data) {

                if (self.Properties.Data.length === 0) {
                    self.Properties.SelectedIndex = null;
                } else {
                    if (self.Properties.SelectedIndex === null || self.Properties.SelectedIndex >= self.Properties.Data.length) {
                        self.Properties.SelectedIndex = 0;
                    }
                }

                var pagingHtml = '<div class="page-area">';
                for (var i = 0; i < self.Properties.Data.length; i++) {

                    //if (self.Properties.Data.length > 1) {
                    var pageNumber = i + 1;
                    pagingHtml += '<div class="page-btn" id="btn_' + i + '">' + pageNumber + '</div>';
                    //}
                }
                pagingHtml += '</div>';

                for (var i = 0; i < self.Properties.Data.length; i++) {


                    if (i !== self.Properties.SelectedIndex) {
                        continue;
                    }

                    var r = self.Properties.Data[i];
                    var s = '';

                    s += '<table id="record_' + i + '" class="main"><tr><td>';

                    // Paging

                    s += '<table class="col"><tr>';
                    s += '  <td rowspan="2">';
                    s += '' + pagingHtml + '';
                    s += '  </td>';
                    s += '</tr></table>';
                    s += '</td><td>';

                    // Icon | Name (_link)  | Email (mailto)
                    //      | Title         | Account Number

                    s += '<table class="col"><tr>';


                    s += '  <td rowspan="2">';
                    s += '' + (r.Person.Type || '') + '';
                    s += '  </td>';


                    s += '  <td>';
                    if (r.Person.Link) { s += '<a href="' + r.Person.Link + '" target="_blank">'; }
                    s += r.Person.Name;
                    if (r.Person.Link) { s += '</a>'; }
                    s += '  </td>';

                    s += '  <td>';
                    if (r.Person.Email) {
                        s += '<a href="mailto:' + r.Person.Email + '" target="_blank">' + (r.Person.Email || '') + '</a>';
                    }
                    s += '  </td>';

                    s += '</tr>';

                    s += '<tr>';

                    s += '  <td>';
                    s += '' + r.Person.Title + '';
                    s += '  </td>';

                    s += '  <td>';
                    s += '' + r.Person.Phone + '';
                    s += '  </td>';

                    s += '</tr></table>';



                    s += '</td><td>';

                    // Account Name (link)
                    // Account Type/Status


                    s += '<table class="col"><tr>';
                    s += '<td>';
                    if (r.Company.Link) { s += '<a href="' + r.Company.Link + '" target="_blank">'; }
                    s += r.Company.Name;
                    if (r.Company.Link) { s += '</a>'; }
                    s += '</td>';
                    s += '</tr><tr>';

                    s += '<td>';
                    s += '' + (r.Company.Type || '') + '';
                    s += '</td>';

                    s += '</tr></table>';


                    s += '</td><td>';

                    // Opps Open:       $       #
                    // Opps Closed Won: $       #


                    s += '<table class="col"><tr>';


                    s += '<td>';
                    s += 'Open:';
                    s += '</td>';

                    s += '<td>';
                    if (r.OpenOpp) {
                        if (r.OpenOpp.Link) { s += '<a href="' + r.OpenOpp.Link + '" target="_blank">'; }
                        s += r.OpenOpp.Name;
                        if (r.OpenOpp.Link) { s += '</a>'; }
                    }
                    s += '</td>';

                    s += '<td>';
                    if (r.OpenOpp) {
                        if (r.OpenOpp.Amount) {
                            s += '' + r.OpenOpp.Amount + '';
                        }
                        if (r.OpenOpp.Count) {
                            s += ' (' + r.OpenOpp.Count + ')';
                        }
                    }
                    s += '</td>';
                    s += '</tr>';
                    s += '<tr>';

                    s += '<td>';
                    s += 'Closed:';
                    s += '</td>';


                    s += '<td>';
                    if (r.ClosedOpp) {
                        if (r.ClosedOpp.Link) { s += '<a href="' + r.ClosedOpp.Link + '" target="_blank">'; }
                        s += r.ClosedOpp.Name;
                        if (r.ClosedOpp.Link) { s += '</a>'; }
                    }
                    s += '</td>';

                    s += '<td>';
                    if (r.ClosedOpp) {
                        if (r.ClosedOpp.Amount) {
                            s += '' + r.ClosedOpp.Amount + '';
                        }
                        if (r.ClosedOpp.Count) {
                            s += ' (' + r.ClosedOpp.Count + ')';
                        }
                    }
                    s += '</td>';

                    s += '</tr></table>';


                    s += '</td><td>';
                    // Next Activity:  Type     Title   Date
                    // Last Activity:  Type     Title   Date

                    s += '<table class="col"><tr>';


                    s += '<td>';
                    if (r.NextActivity) {
                        if (r.NextActivity.Link) { s += '<a href="' + r.NextActivity.Link + '" target="_blank">'; }
                        s += r.NextActivity.Type;
                        if (r.NextActivity.Link) { s += '</a>'; }
                    }
                    s += '</td>';

                    s += '<td>';
                    if (r.NextActivity) {
                        if (r.NextActivity.Link) { s += '<a href="' + r.NextActivity.Link + '" target="_blank">'; }
                        s += r.NextActivity.Name;
                        if (r.NextActivity.Link) { s += '</a>'; }
                    }
                    s += '</td>';

                    s += '<td>';
                    if (r.NextActivity) {
                        s += '' + r.NextActivity.When + '';
                    }
                    s += '</td>';
                    s += '</tr>';
                    s += '<tr>';


                    s += '<td>';
                    if (r.LastActivity) {
                        if (r.LastActivity.Link) { s += '<a href="' + r.LastActivity.Link + '" target="_blank">'; }
                        s += r.LastActivity.Type;
                        if (r.LastActivity.Link) { s += '</a>'; }
                    }
                    s += '</td>';

                    s += '<td>';
                    if (r.LastActivity) {
                        if (r.LastActivity.Link) { s += '<a href="' + r.LastActivity.Link + '" target="_blank">'; }
                        s += r.LastActivity.Name;
                        if (r.LastActivity.Link) { s += '</a>'; }
                    }
                    s += '</td>';

                    s += '<td>';
                    if (r.LastActivity) {
                        s += '' + r.LastActivity.When + '';
                    }
                    s += '</td>';

                    s += '</tr></table>';



                    s += '</td></tr></table>';

                    h.push(s);
                }
            }



            self.Properties.Bar.innerHTML = h.join('');

            // Initiate click handlers

            for (var i = 0; i < self.Properties.Data.length; i++) {

                //if (self.Properties.Data.length > 1) {
                var buttonId = '#btn_' + i;
                $(buttonId, '#broadlookCaptureTopBar').click(self.GenerateFunction(i));

                //}

            }

            self.Log('Render->Done');
        } catch (e) {
            self.Log('Render->Error->' + (e.message || e));
        }

    },

    GenerateFunction: function (i) {
        var f = function () {
            console.log('btn handler');
            CaptureEmbeddedObject.SelectPage(i);
        };
        return f;
    },

    Query: function () {
        var self = CaptureEmbeddedObject;
        try {
            self.Log('Query');
            self.Properties.Waiting = true;
            //port.postMessage({ FindInCRM: res });
            //self.Render();
        } catch (e) {
            self.Log('Query->Error->' + (e.message || e));
        }
    },

    Init: function () {

        var self = this;
        try {
            self.Log('Init');
            if (self.HasPattern()) {
                self.DrawCaptureArea();
                self.Query();
            }
            self.Log('Init->Done');
        } catch (e) {
            self.Log('Init->Error->' + e.message);
        }

    }

};



//$(document).ready(function () {
//    console.log("ready!");

//    window.setTimeout(function () {

//        CaptureEmbeddedObject.NavigateToNextPageOfGoogleResults();

//    }, 3000);

//});

var captureLoadWaitInterval = window.setInterval(function () {
    if (!document || document.readyState !== 'complete') return;
    window.clearInterval(captureLoadWaitInterval);
    initBroadlookCapture();
}, 250);

//var captureLoadWaitInterval = window.setInterval(function () {
//    if (!document || document.readyState !== 'complete') return;
//    window.clearInterval(captureLoadWaitInterval);
//    initBroadlookCapture();
//    //CaptureEmbeddedObject.Init();
//}, 2500);


var captureUrlChangeInterval = window.setInterval(function () {

    if (!document || document.readyState !== 'complete') return;

    if (!captureLastUrl) {
        captureLastUrl = document.URL;
        return;
    }

    if (captureLastUrl !== document.URL) {

        var docURL = document.URL;
        if (docURL.indexOf('#') > 0) { docURL = docURL.substring(0, docURL.indexOf('#')); }
        if (captureLastUrl.indexOf('#') > 0) { captureLastUrl = captureLastUrl.substring(0, captureLastUrl.indexOf('#')); }

        if (captureLastUrl === docURL) {
            captureLastUrl = docURL;
            return;
        }

        if (debug) { console.log(debug + 'hi from capture - new url!', captureLastUrl, docURL); }
        captureLastUrl = docURL;
        initBroadlookCapture();
    }

}, 5000);

