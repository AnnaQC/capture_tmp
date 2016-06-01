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
var debug = false;

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


/////////////////////////////////////////
//////////// TEST ROUTINES //////////////
/////////////////////////////////////////


var loadPatternsAndApply = function (alpha, successCallback) {

    console.log('Load Patterns');
    console.log('Alpha?', alpha);

    var sources = [];
    if (!alpha) {
        sources.push({ Url: 'https://www.broadlook.com/capturecorepatterns1.0.txt', Name: 'Core' });
        sources.push({ Url: 'https://capture-patterns.s3.amazonaws.com/capture-community-patterns-1.0.txt', Name: 'Community' });
    }
    else {
        sources.push({ Url: 'https://www.broadlook.com/capturecorepatternsalpha.txt', Name: 'Core-Alpha' });
        sources.push({ Url: 'https://capture-patterns.s3.amazonaws.com/capture-community-patterns-alpha.txt', Name: 'Community-Alpha' });
    }

    var sourcesProcessed = 0;
    var patterns = []

    var applyPatterns = function () {
        if (sourcesProcessed < 2) {
            return;
        }
        messages.patternParser({ patterns: patterns, options: { Retrieve: true, Buttons: false } }, null, function (response) {
            console.log('Pattern Parser Reposne > ', response);
            successCallback(response);
        });

    };

    var onPatternsLoaded = function (patterns1) {
        sourcesProcessed++;
        patterns = patterns.concat(patterns1);
        applyPatterns();
    };

    var onPatternsNotLoaded = function (error) {
        sourcesProcessed++;
        applyPatterns();
    };

    var loadPatterns = function (source, successCallback, errorCallback) {

        var ts = (new Date()).getMilliseconds();
        var cachePrevention = '?ts=' + ts.toString();
        var url = source.Url + cachePrevention;

        console.log('Loading patterns from ' + url);

        $.get(url)
            .success(function (data) {
                try {
                    var patterns = JSON.parse(data);
                    console.log('Loading patterns', patterns.length);
                    try { successCallback(patterns); } catch (e) { }
                } catch (e) {
                    console.error('Error parsing patterns', e);
                    try { errorCallback(e.message); } catch (e) { }
                }
            })
            .error(function (e) {
                console.error('Error loading patterns', e);
                try { errorCallback(); } catch (e) { }
            });
    };

    loadPatterns(sources[0], onPatternsLoaded, onPatternsNotLoaded);
    loadPatterns(sources[1], onPatternsLoaded, onPatternsNotLoaded);

};

var socialDomains = [
      { domain: 'linkedin.com', venue: 'linkedin' },
      { domain: 'facebook.com', venue: 'facebook' },
      { domain: 'foursquare.com', venue: 'foursquare' },
      { domain: 'twitter.com', venue: 'twitter' },
      { domain: 'youtube', venue: 'youtube' },
      { domain: 'vimeo.com', venue: 'vimeo' },
      { domain: 'flickr.com', venue: 'flickr' },
      { domain: 'pinterest.com', venue: 'pinterest' },
      { domain: 'gravatar.com', venue: 'gravatar' },
      { domain: 'klout.com', venue: 'klout' },
      { domain: 'myspace.com', venue: 'myspace' },
      { domain: 'profiles.google.com', venue: 'googleprofile' },
      { domain: 'plus.google.com', venue: 'googleplus' },
      { domain: 'picasaweb.google.com', venue: 'googleplus' },
];

var freeEmailDomains = ['0815.ru', '0clickemail.com', '10minutemail.com', '123.com', '123mail.org', '150mail.com', '150ml.com', '163.net', '16mail.com', '1gb.pl', '1me.net', '1mum.com', '20minutemail.com', '21cn.com', '263.net', '2gb.pl', '2-mail.com', '37.com', '420email.com', '4degreez.com', '4email.net', '5.am', '50mail.com', '8.am', 'a.org.ua', 'aaronkwok.net', 'abha.cc', 'abv.bg', 'aemail4u.com', 'aim.com', 'airmail.net', 'airpost.net', 'akcja.pl', 'allmail.net', 'alltel.net', 'altavista.com', 'altavista.net', 'america.hm', 'amexmail.com', 'amorki.pl', 'amrer.net', 'amuro.net', 'amuromail.com', 'andylau.net', 'angelfire.com', 'angelfire.lycos.com', 'anonbox.net', 'aol.co.uk', 'aol.com', 'aol.de', 'aol.fr', 'aol.in', 'aol.nl', 'aol.se', 'aport.ru', 'aroundhawaii.com', 'astaga.com', 'asurfer.com', 'atlas.cz', 'att.net', 'attglobal.net', 'attymail.com', 'ausi.com', 'aussiemail.com.au', 'autograf.pl', 'bahrainmail.com', 'bellatlantic.net', 'bellsouth.net', 'bestmail.us', 'bharatmail.com', 'bigfoot.com', 'bigpond.com', 'bikemechanics.com', 'binkmail.com', 'bitmail.com', 'bk.ru', 'blackplanet.com', 'blazemail.com', 'bluemail.ch', 'boardermail.com', 'bobmail.info', 'bol.com.br', 'bol.uol.com.br', 'bolt.com', 'boltonfans.com', 'bradfordfans.com', 'brain.net.pk', 'brainbench.com', 'bright.net', 'btinternet.com', 'buziaczek.pl', 'byke.com', 'canada.com', 'canada-11.com', 'caramail.com', 'caramail.fr', 'cd2.com', 'centras.lt', 'centurytel.net', 'charter.net', 'chat.ru', 'citlink.net', 'city-of-bath.org', 'city-of-birmingham.com', 'city-of-brighton.org', 'city-of-cambridge.com', 'cityofcardiff.net', 'city-of-coventry.com', 'city-of-edinburgh.com', 'city-of-lichfield.com', 'city-of-lincoln.com', 'city-of-liverpool.com', 'cityoflondon.org', 'city-of-manchester.com', 'city-of-nottingham.com', 'city-of-oxford.com', 'city-of-swansea.com', 'city-of-westminster.com', 'city-of-westminster.net', 'city-of-york.net', 'club4x4.net', 'clubalfa.com', 'clubbers.net', 'clubducati.com', 'clubhonda.net', 'cluemail.com', 'columbus.rr.com', 'comcast.net', 'compuserve.com', 'computermail.net', 'courrieltemporaire.com', 'cox.net', 'crosswinds.net', 'cs.com', 'cyber.net.pk', 'czateria.pl', 'dacoolest.com', 'data.bg', 'daum.net', 'dbzmail.com', 'dcemail.com', 'deadaddress.com', 'delfi.lt', 'dir.bg', 'dispostable.com', 'doctor.com', 'doramail.com', 'dostmail.com', 'draac.com', 'dslextreme.com', 'e4ward.com', 'earthlink.com', 'earthlink.net', 'echina.com', 'elitemail.org', 'email.de', 'email.msn.com', 'email.ro', 'email.ru', 'email60.com', 'emailaccount.com', 'e-mailanywhere.com', 'emailcorner.net', 'emailengine.net', 'emailengine.org', 'emailgroups.net', 'emailplus.org', 'emailsensei.com', 'emailuser.net', 'emirates.net.ae', 'eml.cc', 'epatra.com', 'epix.net', 'es.co.nz', 'etisalat.ae', 'eudoramail.com', 'everymail.com', 'excite.com', 'execpc.com', 'ezzemail.com', 'f1fans.net', 'fastem.com', 'fast-email.com', 'fastemail.us', 'fastemailer.com', 'fastest.cc', 'fastimap.com', 'fastmail.ca', 'fastmail.cn', 'fastmail.co.uk', 'fastmail.com.au', 'fastmail.es', 'fastmail.fm', 'fastmail.in', 'fastmail.jp', 'fastmail.net', 'fast-mail.org', 'fastmail.to', 'fastmail.us', 'fastmailbox.net', 'fastmessaging.com', 'fea.st', 'filzmail.com', 'flash.net', 'f-m.fm', 'fmail.co.uk', 'fmailbox.com', 'fmgirl.com', 'fmguy.com', 'freemail.com.au', 'freemail.de', 'freemail.gr', 'freemail.lt', 'freemail.org.mk', 'freenet.de', 'freestart.hu', 'frontier.my.yahoo.com', 'frontier.net', 'frontiernet.net', 'ftml.net', 'fuorissimo.com', 'fuse.net', 'gateway.net', 'gci.net', 'gmail.com', 'gmx.at', 'gmx.ch', 'gmx.de', 'gmx.fr', 'gmx.net', 'go.com', 'gobrainstorm.net', 'googlemail.com', 'guerrillamail.com', 'hailmail.net', 'hanmail.net', 'hawaii.rr.com', 'heesun.net', 'h-mail.us', 'home.ro', 'hongkong.com', 'hot.ee', 'hotbox.ru', 'hotmail.co.il', 'hotmail.co.jp', 'hotmail.co.th', 'hotmail.co.uk', 'hotmail.com', 'hotmail.com.ar', 'hotmail.com.br', 'hotmail.com.tr', 'hotmail.de', 'hotmail.es', 'hotmail.fr', 'hotmail.it', 'hotmail.jp', 'hotmail.ru', 'hsuchi.net', 'hulapla.de', 'hushmail.com', 'icqmail.com', 'ig.com.br', 'ihug.co.nz', 'iinet.net.au', 'ilovejesus.com', 'imap.cc', 'imap-mail.com', 'imapmail.org', 'in.com', 'inbox.lv', 'inbox.ru', 'incognitomail.com', 'incredimail.com', 'india.com', 'indiainfo.com', 'indiatimes.com', 'indya.com', 'inmail.sk', 'inoutbox.com', 'interia.eu', 'interia.pl', 'internet-e-mail.com', 'internetemails.net', 'internet-mail.org', 'internetmailing.net', 'inwind.it', 'iol.it', 'ipa.net', 'iprimus.com.au', 'ivillage.com', 'iwon.com', 'ix.netcom.com', 'jetemail.net', 'jmail.co.za', 'jpopmail.com', 'jubiimail.dk', 'juno.com', 'justemail.net', 'kayafmmail.co.za', 'kc.rr.com', 'kellychen.com', 'keromail.com', 'kimo.com', 'kinki-kids.com', 'kinkyemail.com', 'kittymail.com', 'ladymail.cz', 'lankamail.com', 'latinmail.com', 'lawyer.com', 'leehom.net', 'leonlai.net', 'letterboxes.org', 'levele.hu', 'libero.it', 'linuxmail.org', 'live.at', 'live.be', 'live.ca', 'live.cl', 'live.cn', 'live.co.kr', 'live.co.uk', 'live.co.za', 'live.com', 'live.com.ar', 'live.com.au', 'live.com.mx', 'live.com.my', 'live.com.sg', 'live.de', 'live.dk', 'live.fr', 'live.hk', 'live.ie', 'live.in', 'live.it', 'live.jp', 'live.nl', 'live.no', 'live.ru', 'live.se', 'louiskoo.com', 'lovers-mail.com', 'lycos.co.de', 'lycos.co.uk', 'lycos.com', 'lycos.es', 'lycos.it', 'lycos.ne.jp', 'lycosemail.com', 'mac.com', 'madrid.com', 'magicmail.co.za', 'magpiesfan.co.uk', 'mail.az', 'mail.be', 'mail.by', 'mail.co.za', 'mail.com', 'mail.cz', 'mail.ee', 'mail.gr', 'mail.lv', 'mail.lycos.com', 'mail.nu', 'mail.pt', 'mail.ru', 'mail.webdunia.com', 'mail2007.com', 'mail2aaron.com', 'mail2abby.com', 'mail2abc.com', 'mail2actor.com', 'mail2admiral.com', 'mail2adorable.com', 'mail2adoration.com', 'mail2adore.com', 'mail2adventure.com', 'mail2aeolus.com', 'mail2aether.com', 'mail2affection.com', 'mail2afghanistan.com', 'mail2africa.com', 'mail2agent.com', 'mail2aha.com', 'mail2ahoy.com', 'mail2aim.com', 'mail2air.com', 'mail2airbag.com', 'mail2airforce.com', 'mail2airport.com', 'mail2alabama.com', 'mail2alan.com', 'mail2alaska.com', 'mail2albania.com', 'mail2alcoholic.com', 'mail2alec.com', 'mail2alexa.com', 'mail2algeria.com', 'mail2alicia.com', 'mail2alien.com', 'mail2allan.com', 'mail2allen.com', 'mail2allison.com', 'mail2alpha.com', 'mail2alyssa.com', 'mail2amanda.com', 'mail2amazing.com', 'mail2amber.com', 'mail2america.com', 'mail2american.com', 'mail2andorra.com', 'mail2andrea.com', 'mail2andy.com', 'mail2anesthesiologist.com', 'mail2angela.com', 'mail2angola.com', 'mail2ann.com', 'mail2anna.com', 'mail2anne.com', 'mail2anthony.com', 'mail2aphrodite.com', 'mail2apollo.com', 'mail2april.com', 'mail2aquarius.com', 'mail2arabia.com', 'mail2arabic.com', 'mail2architect.com', 'mail2ares.com', 'mail2argentina.com', 'mail2aries.com', 'mail2arizona.com', 'mail2arkansas.com', 'mail2armenia.com', 'mail2army.com', 'mail2arnold.com', 'mail2art.com', 'mail2arthur.com', 'mail2artist.com', 'mail2ashley.com', 'mail2ask.com', 'mail2astronomer.com', 'mail2athena.com', 'mail2athlete.com', 'mail2atlas.com', 'mail2atom.com', 'mail2attitude.com', 'mail2auction.com', 'mail2aunt.com', 'mail2australia.com', 'mail2austria.com', 'mail2azerbaijan.com', 'mail2baby.com', 'mail2bahamas.com', 'mail2bahrain.com', 'mail2ballerina.com', 'mail2ballplayer.com', 'mail2band.com', 'mail2bangladesh.com', 'mail2bank.com', 'mail2banker.com', 'mail2bankrupt.com', 'mail2baptist.com', 'mail2bar.com', 'mail2barbados.com', 'mail2barbara.com', 'mail2barter.com', 'mail2basketball.com', 'mail2batter.com', 'mail2beach.com', 'mail2beast.com', 'mail2beatles.com', 'mail2beauty.com', 'mail2becky.com', 'mail2beijing.com', 'mail2belgium.com', 'mail2belize.com', 'mail2ben.com', 'mail2bernard.com', 'mail2beth.com', 'mail2betty.com', 'mail2beverly.com', 'mail2beyond.com', 'mail2biker.com', 'mail2bill.com', 'mail2billionaire.com', 'mail2billy.com', 'mail2bio.com', 'mail2biologist.com', 'mail2black.com', 'mail2blackbelt.com', 'mail2blake.com', 'mail2blind.com', 'mail2blonde.com', 'mail2blues.com', 'mail2bob.com', 'mail2bobby.com', 'mail2bolivia.com', 'mail2bombay.com', 'mail2bonn.com', 'mail2bookmark.com', 'mail2boreas.com', 'mail2bosnia.com', 'mail2boston.com', 'mail2botswana.com', 'mail2bradley.com', 'mail2brazil.com', 'mail2breakfast.com', 'mail2brian.com', 'mail2bride.com', 'mail2brittany.com', 'mail2broker.com', 'mail2brook.com', 'mail2bruce.com', 'mail2brunei.com', 'mail2brunette.com', 'mail2brussels.com', 'mail2bryan.com', 'mail2bug.com', 'mail2bulgaria.com', 'mail2business.com', 'mail2buy.com', 'mail2ca.com', 'mail2california.com', 'mail2calvin.com', 'mail2cambodia.com', 'mail2cameroon.com', 'mail2canada.com', 'mail2cancer.com', 'mail2capeverde.com', 'mail2capricorn.com', 'mail2cardinal.com', 'mail2cardiologist.com', 'mail2care.com', 'mail2caroline.com', 'mail2carolyn.com', 'mail2casey.com', 'mail2cat.com', 'mail2caterer.com', 'mail2cathy.com', 'mail2catlover.com', 'mail2catwalk.com', 'mail2cell.com', 'mail2chad.com', 'mail2champaign.com', 'mail2charles.com', 'mail2chef.com', 'mail2chemist.com', 'mail2cherry.com', 'mail2chicago.com', 'mail2chile.com', 'mail2china.com', 'mail2chinese.com', 'mail2chocolate.com', 'mail2christian.com', 'mail2christie.com', 'mail2christmas.com', 'mail2christy.com', 'mail2chuck.com', 'mail2cindy.com', 'mail2clark.com', 'mail2classifieds.com', 'mail2claude.com', 'mail2cliff.com', 'mail2clinic.com', 'mail2clint.com', 'mail2close.com', 'mail2club.com', 'mail2coach.com', 'mail2coastguard.com', 'mail2colin.com', 'mail2college.com', 'mail2color.com', 'mail2colorado.com', 'mail2columbia.com', 'mail2comedian.com', 'mail2composer.com', 'mail2computer.com', 'mail2computers.com', 'mail2concert.com', 'mail2congo.com', 'mail2connect.com', 'mail2connecticut.com', 'mail2consultant.com', 'mail2convict.com', 'mail2cook.com', 'mail2cool.com', 'mail2cory.com', 'mail2costarica.com', 'mail2country.com', 'mail2courtney.com', 'mail2cowboy.com', 'mail2cowgirl.com', 'mail2craig.com', 'mail2crave.com', 'mail2crazy.com', 'mail2create.com', 'mail2croatia.com', 'mail2cry.com', 'mail2crystal.com', 'mail2cuba.com', 'mail2culture.com', 'mail2curt.com', 'mail2customs.com', 'mail2cute.com', 'mail2cutey.com', 'mail2cynthia.com', 'mail2cyprus.com', 'mail2czechrepublic.com', 'mail2dad.com', 'mail2dale.com', 'mail2dallas.com', 'mail2dan.com', 'mail2dana.com', 'mail2dance.com', 'mail2dancer.com', 'mail2danielle.com', 'mail2danny.com', 'mail2darlene.com', 'mail2darling.com', 'mail2darren.com', 'mail2daughter.com', 'mail2dave.com', 'mail2dawn.com', 'mail2dc.com', 'mail2dealer.com', 'mail2deanna.com', 'mail2dearest.com', 'mail2debbie.com', 'mail2debby.com', 'mail2deer.com', 'mail2delaware.com', 'mail2delicious.com', 'mail2demeter.com', 'mail2democrat.com', 'mail2denise.com', 'mail2denmark.com', 'mail2dennis.com', 'mail2dentist.com', 'mail2derek.com', 'mail2desert.com', 'mail2devoted.com', 'mail2devotion.com', 'mail2diamond.com', 'mail2diana.com', 'mail2diane.com', 'mail2diehard.com', 'mail2dilemma.com', 'mail2dillon.com', 'mail2dinner.com', 'mail2dinosaur.com', 'mail2dionysos.com', 'mail2diplomat.com', 'mail2director.com', 'mail2dirk.com', 'mail2disco.com', 'mail2dive.com', 'mail2diver.com', 'mail2divorced.com', 'mail2djibouti.com', 'mail2doctor.com', 'mail2doglover.com', 'mail2dominic.com', 'mail2dominica.com', 'mail2dominicanrepublic.com', 'mail2don.com', 'mail2donald.com', 'mail2donna.com', 'mail2doris.com', 'mail2dorothy.com', 'mail2doug.com', 'mail2dough.com', 'mail2douglas.com', 'mail2dow.com', 'mail2downtown.com', 'mail2dream.com', 'mail2dreamer.com', 'mail2dude.com', 'mail2dustin.com', 'mail2dyke.com', 'mail2dylan.com', 'mail2earl.com', 'mail2earth.com', 'mail2eastend.com', 'mail2eat.com', 'mail2economist.com', 'mail2ecuador.com', 'mail2eddie.com', 'mail2edgar.com', 'mail2edwin.com', 'mail2egypt.com', 'mail2electron.com', 'mail2eli.com', 'mail2elizabeth.com', 'mail2ellen.com', 'mail2elliot.com', 'mail2elsalvador.com', 'mail2elvis.com', 'mail2emergency.com', 'mail2emily.com', 'mail2engineer.com', 'mail2english.com', 'mail2environmentalist.com', 'mail2eos.com', 'mail2eric.com', 'mail2erica.com', 'mail2erin.com', 'mail2erinyes.com', 'mail2eris.com', 'mail2eritrea.com', 'mail2ernie.com', 'mail2eros.com', 'mail2estonia.com', 'mail2ethan.com', 'mail2ethiopia.com', 'mail2eu.com', 'mail2europe.com', 'mail2eurus.com', 'mail2eva.com', 'mail2evan.com', 'mail2evelyn.com', 'mail2everything.com', 'mail2exciting.com', 'mail2expert.com', 'mail2fairy.com', 'mail2faith.com', 'mail2fanatic.com', 'mail2fancy.com', 'mail2fantasy.com', 'mail2farm.com', 'mail2farmer.com', 'mail2fashion.com', 'mail2fat.com', 'mail2feeling.com', 'mail2female.com', 'mail2fever.com', 'mail2fighter.com', 'mail2fiji.com', 'mail2filmfestival.com', 'mail2films.com', 'mail2finance.com', 'mail2finland.com', 'mail2fireman.com', 'mail2firm.com', 'mail2fisherman.com', 'mail2flexible.com', 'mail2florence.com', 'mail2florida.com', 'mail2floyd.com', 'mail2fly.com', 'mail2fond.com', 'mail2fondness.com', 'mail2football.com', 'mail2footballfan.com', 'mail2found.com', 'mail2france.com', 'mail2frank.com', 'mail2frankfurt.com', 'mail2franklin.com', 'mail2fred.com', 'mail2freddie.com', 'mail2free.com', 'mail2freedom.com', 'mail2french.com', 'mail2freudian.com', 'mail2friendship.com', 'mail2from.com', 'mail2fun.com', 'mail2gabon.com', 'mail2gabriel.com', 'mail2gail.com', 'mail2galaxy.com', 'mail2gambia.com', 'mail2games.com', 'mail2gary.com', 'mail2gavin.com', 'mail2gemini.com', 'mail2gene.com', 'mail2genes.com', 'mail2geneva.com', 'mail2george.com', 'mail2georgia.com', 'mail2gerald.com', 'mail2german.com', 'mail2germany.com', 'mail2ghana.com', 'mail2gilbert.com', 'mail2gina.com', 'mail2girl.com', 'mail2glen.com', 'mail2gloria.com', 'mail2goddess.com', 'mail2gold.com', 'mail2golfclub.com', 'mail2golfer.com', 'mail2gordon.com', 'mail2government.com', 'mail2grab.com', 'mail2grace.com', 'mail2graham.com', 'mail2grandma.com', 'mail2grandpa.com', 'mail2grant.com', 'mail2greece.com', 'mail2green.com', 'mail2greg.com', 'mail2grenada.com', 'mail2gsm.com', 'mail2guard.com', 'mail2guatemala.com', 'mail2guy.com', 'mail2hades.com', 'mail2haiti.com', 'mail2hal.com', 'mail2handhelds.com', 'mail2hank.com', 'mail2hannah.com', 'mail2harold.com', 'mail2harry.com', 'mail2hawaii.com', 'mail2headhunter.com', 'mail2heal.com', 'mail2heather.com', 'mail2heaven.com', 'mail2hebe.com', 'mail2hecate.com', 'mail2heidi.com', 'mail2helen.com', 'mail2hell.com', 'mail2help.com', 'mail2helpdesk.com', 'mail2henry.com', 'mail2hephaestus.com', 'mail2hera.com', 'mail2hercules.com', 'mail2herman.com', 'mail2hermes.com', 'mail2hespera.com', 'mail2hestia.com', 'mail2highschool.com', 'mail2hindu.com', 'mail2hip.com', 'mail2hiphop.com', 'mail2holland.com', 'mail2holly.com', 'mail2hollywood.com', 'mail2homer.com', 'mail2honduras.com', 'mail2honey.com', 'mail2hongkong.com', 'mail2hope.com', 'mail2horse.com', 'mail2hot.com', 'mail2hotel.com', 'mail2houston.com', 'mail2howard.com', 'mail2hugh.com', 'mail2human.com', 'mail2hungary.com', 'mail2hungry.com', 'mail2hygeia.com', 'mail2hyperspace.com', 'mail2hypnos.com', 'mail2ian.com', 'mail2ice-cream.com', 'mail2iceland.com', 'mail2idaho.com', 'mail2idontknow.com', 'mail2illinois.com', 'mail2imam.com', 'mail2in.com', 'mail2india.com', 'mail2indian.com', 'mail2indiana.com', 'mail2indonesia.com', 'mail2infinity.com', 'mail2intense.com', 'mail2iowa.com', 'mail2iran.com', 'mail2iraq.com', 'mail2ireland.com', 'mail2irene.com', 'mail2iris.com', 'mail2irresistible.com', 'mail2irving.com', 'mail2irwin.com', 'mail2isaac.com', 'mail2israel.com', 'mail2italian.com', 'mail2italy.com', 'mail2jackie.com', 'mail2jacob.com', 'mail2jail.com', 'mail2jaime.com', 'mail2jake.com', 'mail2jamaica.com', 'mail2james.com', 'mail2jamie.com', 'mail2jan.com', 'mail2jane.com', 'mail2janet.com', 'mail2janice.com', 'mail2japan.com', 'mail2japanese.com', 'mail2jasmine.com', 'mail2jason.com', 'mail2java.com', 'mail2jay.com', 'mail2jazz.com', 'mail2jed.com', 'mail2jeffrey.com', 'mail2jennifer.com', 'mail2jenny.com', 'mail2jeremy.com', 'mail2jerry.com', 'mail2jessica.com', 'mail2jessie.com', 'mail2jesus.com', 'mail2jew.com', 'mail2jeweler.com', 'mail2jim.com', 'mail2jimmy.com', 'mail2joan.com', 'mail2joann.com', 'mail2joanna.com', 'mail2jody.com', 'mail2joe.com', 'mail2joel.com', 'mail2joey.com', 'mail2john.com', 'mail2join.com', 'mail2jon.com', 'mail2jonathan.com', 'mail2jones.com', 'mail2jordan.com', 'mail2joseph.com', 'mail2josh.com', 'mail2joy.com', 'mail2juan.com', 'mail2judge.com', 'mail2judy.com', 'mail2juggler.com', 'mail2julian.com', 'mail2julie.com', 'mail2jumbo.com', 'mail2junk.com', 'mail2justin.com', 'mail2justme.com', 'mail2kansas.com', 'mail2karate.com', 'mail2karen.com', 'mail2karl.com', 'mail2karma.com', 'mail2kathleen.com', 'mail2kathy.com', 'mail2katie.com', 'mail2kay.com', 'mail2kazakhstan.com', 'mail2keen.com', 'mail2keith.com', 'mail2kelly.com', 'mail2kelsey.com', 'mail2ken.com', 'mail2kendall.com', 'mail2kennedy.com', 'mail2kenneth.com', 'mail2kenny.com', 'mail2kentucky.com', 'mail2kenya.com', 'mail2kerry.com', 'mail2kevin.com', 'mail2kim.com', 'mail2kimberly.com', 'mail2king.com', 'mail2kirk.com', 'mail2kiss.com', 'mail2kosher.com', 'mail2kristin.com', 'mail2kurt.com', 'mail2kuwait.com', 'mail2kyle.com', 'mail2kyrgyzstan.com', 'mail2la.com', 'mail2lacrosse.com', 'mail2lance.com', 'mail2lao.com', 'mail2larry.com', 'mail2latvia.com', 'mail2laugh.com', 'mail2laura.com', 'mail2lauren.com', 'mail2laurie.com', 'mail2lawrence.com', 'mail2lawyer.com', 'mail2lebanon.com', 'mail2lee.com', 'mail2leo.com', 'mail2leon.com', 'mail2leonard.com', 'mail2leone.com', 'mail2leslie.com', 'mail2letter.com', 'mail2liberia.com', 'mail2libertarian.com', 'mail2libra.com', 'mail2libya.com', 'mail2liechtenstein.com', 'mail2life.com', 'mail2linda.com', 'mail2linux.com', 'mail2lionel.com', 'mail2lipstick.com', 'mail2liquid.com', 'mail2lisa.com', 'mail2lithuania.com', 'mail2litigator.com', 'mail2liz.com', 'mail2lloyd.com', 'mail2lois.com', 'mail2lola.com', 'mail2london.com', 'mail2looking.com', 'mail2lori.com', 'mail2lost.com', 'mail2lou.com', 'mail2louis.com', 'mail2louisiana.com', 'mail2lovable.com', 'mail2love.com', 'mail2lucky.com', 'mail2lucy.com', 'mail2lunch.com', 'mail2lust.com', 'mail2luxembourg.com', 'mail2luxury.com', 'mail2lyle.com', 'mail2lynn.com', 'mail2madagascar.com', 'mail2madison.com', 'mail2madrid.com', 'mail2maggie.com', 'mail2mail4.com', 'mail2maine.com', 'mail2malawi.com', 'mail2malaysia.com', 'mail2maldives.com', 'mail2mali.com', 'mail2malta.com', 'mail2mambo.com', 'mail2man.com', 'mail2mandy.com', 'mail2manhunter.com', 'mail2mankind.com', 'mail2many.com', 'mail2marc.com', 'mail2marcia.com', 'mail2margaret.com', 'mail2margie.com', 'mail2marhaba.com', 'mail2maria.com', 'mail2marilyn.com', 'mail2marines.com', 'mail2mark.com', 'mail2marriage.com', 'mail2married.com', 'mail2marries.com', 'mail2mars.com', 'mail2marsha.com', 'mail2marshallislands.com', 'mail2martha.com', 'mail2martin.com', 'mail2marty.com', 'mail2marvin.com', 'mail2mary.com', 'mail2maryland.com', 'mail2mason.com', 'mail2massachusetts.com', 'mail2matt.com', 'mail2matthew.com', 'mail2maurice.com', 'mail2mauritania.com', 'mail2mauritius.com', 'mail2max.com', 'mail2maxwell.com', 'mail2maybe.com', 'mail2mba.com', 'mail2me4u.com', 'mail2mechanic.com', 'mail2medieval.com', 'mail2megan.com', 'mail2mel.com', 'mail2melanie.com', 'mail2melissa.com', 'mail2melody.com', 'mail2member.com', 'mail2memphis.com', 'mail2methodist.com', 'mail2mexican.com', 'mail2mexico.com', 'mail2mgz.com', 'mail2miami.com', 'mail2michael.com', 'mail2michelle.com', 'mail2michigan.com', 'mail2mike.com', 'mail2milan.com', 'mail2milano.com', 'mail2mildred.com', 'mail2milkyway.com', 'mail2millennium.com', 'mail2millionaire.com', 'mail2milton.com', 'mail2mime.com', 'mail2mindreader.com', 'mail2mini.com', 'mail2minister.com', 'mail2minneapolis.com', 'mail2minnesota.com', 'mail2miracle.com', 'mail2missionary.com', 'mail2mississippi.com', 'mail2missouri.com', 'mail2mitch.com', 'mail2model.com', 'mail2mom.com', 'mail2monaco.com', 'mail2money.com', 'mail2mongolia.com', 'mail2monica.com', 'mail2montana.com', 'mail2monty.com', 'mail2moon.com', 'mail2morocco.com', 'mail2morpheus.com', 'mail2mors.com', 'mail2moscow.com', 'mail2moslem.com', 'mail2mouseketeer.com', 'mail2movies.com', 'mail2mozambique.com', 'mail2mp3.com', 'mail2mrright.com', 'mail2msright.com', 'mail2museum.com', 'mail2music.com', 'mail2musician.com', 'mail2muslim.com', 'mail2my.com', 'mail2myboat.com', 'mail2mycar.com', 'mail2mycell.com', 'mail2mygsm.com', 'mail2mylaptop.com', 'mail2mymac.com', 'mail2mypager.com', 'mail2mypalm.com', 'mail2mypc.com', 'mail2myphone.com', 'mail2myplane.com', 'mail2namibia.com', 'mail2nancy.com', 'mail2nasdaq.com', 'mail2nathan.com', 'mail2nauru.com', 'mail2navy.com', 'mail2neal.com', 'mail2nebraska.com', 'mail2ned.com', 'mail2neil.com', 'mail2nelson.com', 'mail2nemesis.com', 'mail2nepal.com', 'mail2netherlands.com', 'mail2network.com', 'mail2nevada.com', 'mail2newhampshire.com', 'mail2newjersey.com', 'mail2newmexico.com', 'mail2newyork.com', 'mail2newzealand.com', 'mail2nicaragua.com', 'mail2nick.com', 'mail2nicole.com', 'mail2niger.com', 'mail2nigeria.com', 'mail2nike.com', 'mail2no.com', 'mail2noah.com', 'mail2noel.com', 'mail2noelle.com', 'mail2normal.com', 'mail2norman.com', 'mail2northamerica.com', 'mail2northcarolina.com', 'mail2northdakota.com', 'mail2northpole.com', 'mail2norway.com', 'mail2notus.com', 'mail2noway.com', 'mail2nowhere.com', 'mail2nuclear.com', 'mail2nun.com', 'mail2ny.com', 'mail2oasis.com', 'mail2ohio.com', 'mail2ok.com', 'mail2oklahoma.com', 'mail2oliver.com', 'mail2oman.com', 'mail2one.com', 'mail2onfire.com', 'mail2online.com', 'mail2oops.com', 'mail2open.com', 'mail2ophthalmologist.com', 'mail2optometrist.com', 'mail2oregon.com', 'mail2oscars.com', 'mail2oslo.com', 'mail2painter.com', 'mail2pakistan.com', 'mail2pan.com', 'mail2panama.com', 'mail2paraguay.com', 'mail2paralegal.com', 'mail2paris.com', 'mail2park.com', 'mail2parker.com', 'mail2party.com', 'mail2passion.com', 'mail2pat.com', 'mail2patricia.com', 'mail2patrick.com', 'mail2patty.com', 'mail2paul.com', 'mail2paula.com', 'mail2pay.com', 'mail2peace.com', 'mail2pediatrician.com', 'mail2peggy.com', 'mail2pennsylvania.com', 'mail2perry.com', 'mail2persephone.com', 'mail2persian.com', 'mail2peru.com', 'mail2pete.com', 'mail2peter.com', 'mail2pharmacist.com', 'mail2phil.com', 'mail2philippines.com', 'mail2phoenix.com', 'mail2phonecall.com', 'mail2phyllis.com', 'mail2pickup.com', 'mail2pilot.com', 'mail2pisces.com', 'mail2planet.com', 'mail2platinum.com', 'mail2plato.com', 'mail2pluto.com', 'mail2pm.com', 'mail2podiatrist.com', 'mail2poet.com', 'mail2poland.com', 'mail2policeman.com', 'mail2policewoman.com', 'mail2politician.com', 'mail2pop.com', 'mail2pope.com', 'mail2popular.com', 'mail2portugal.com', 'mail2poseidon.com', 'mail2potatohead.com', 'mail2power.com', 'mail2presbyterian.com', 'mail2president.com', 'mail2priest.com', 'mail2prince.com', 'mail2princess.com', 'mail2producer.com', 'mail2professor.com', 'mail2protect.com', 'mail2psychiatrist.com', 'mail2psycho.com', 'mail2psychologist.com', 'mail2qatar.com', 'mail2queen.com', 'mail2rabbi.com', 'mail2race.com', 'mail2racer.com', 'mail2rachel.com', 'mail2rage.com', 'mail2rainmaker.com', 'mail2ralph.com', 'mail2randy.com', 'mail2rap.com', 'mail2rare.com', 'mail2rave.com', 'mail2ray.com', 'mail2raymond.com', 'mail2realtor.com', 'mail2rebecca.com', 'mail2recruiter.com', 'mail2recycle.com', 'mail2redhead.com', 'mail2reed.com', 'mail2reggie.com', 'mail2register.com', 'mail2rent.com', 'mail2republican.com', 'mail2resort.com', 'mail2rex.com', 'mail2rhodeisland.com', 'mail2rich.com', 'mail2richard.com', 'mail2ricky.com', 'mail2ride.com', 'mail2riley.com', 'mail2rita.com', 'mail2rob.com', 'mail2robert.com', 'mail2roberta.com', 'mail2robin.com', 'mail2rock.com', 'mail2rocker.com', 'mail2rod.com', 'mail2rodney.com', 'mail2romania.com', 'mail2rome.com', 'mail2ron.com', 'mail2ronald.com', 'mail2ronnie.com', 'mail2rose.com', 'mail2rosie.com', 'mail2roy.com', 'mail2rudy.com', 'mail2rugby.com', 'mail2runner.com', 'mail2russell.com', 'mail2russia.com', 'mail2russian.com', 'mail2rusty.com', 'mail2ruth.com', 'mail2rwanda.com', 'mail2ryan.com', 'mail2sa.com', 'mail2sabrina.com', 'mail2safe.com', 'mail2sagittarius.com', 'mail2sail.com', 'mail2sailor.com', 'mail2sal.com', 'mail2salaam.com', 'mail2sam.com', 'mail2samantha.com', 'mail2samoa.com', 'mail2samurai.com', 'mail2sandra.com', 'mail2sandy.com', 'mail2sanfrancisco.com', 'mail2sanmarino.com', 'mail2santa.com', 'mail2sara.com', 'mail2sarah.com', 'mail2sat.com', 'mail2saturn.com', 'mail2saudi.com', 'mail2saudiarabia.com', 'mail2save.com', 'mail2savings.com', 'mail2school.com', 'mail2scientist.com', 'mail2scorpio.com', 'mail2scott.com', 'mail2sean.com', 'mail2search.com', 'mail2seattle.com', 'mail2secretagent.com', 'mail2senate.com', 'mail2senegal.com', 'mail2sensual.com', 'mail2seth.com', 'mail2sevenseas.com', 'mail2sexy.com', 'mail2seychelles.com', 'mail2shane.com', 'mail2sharon.com', 'mail2shawn.com', 'mail2ship.com', 'mail2shirley.com', 'mail2shoot.com', 'mail2shuttle.com', 'mail2sierraleone.com', 'mail2simon.com', 'mail2singapore.com', 'mail2single.com', 'mail2site.com', 'mail2skater.com', 'mail2skier.com', 'mail2sky.com', 'mail2sleek.com', 'mail2slim.com', 'mail2slovakia.com', 'mail2slovenia.com', 'mail2smile.com', 'mail2smith.com', 'mail2smooth.com', 'mail2soccer.com', 'mail2soccerfan.com', 'mail2socialist.com', 'mail2soldier.com', 'mail2somalia.com', 'mail2son.com', 'mail2song.com', 'mail2sos.com', 'mail2sound.com', 'mail2southafrica.com', 'mail2southamerica.com', 'mail2southcarolina.com', 'mail2southdakota.com', 'mail2southkorea.com', 'mail2southpole.com', 'mail2spain.com', 'mail2spanish.com', 'mail2spare.com', 'mail2spectrum.com', 'mail2splash.com', 'mail2sponsor.com', 'mail2sports.com', 'mail2srilanka.com', 'mail2stacy.com', 'mail2stan.com', 'mail2stanley.com', 'mail2star.com', 'mail2state.com', 'mail2stephanie.com', 'mail2steve.com', 'mail2steven.com', 'mail2stewart.com', 'mail2stlouis.com', 'mail2stock.com', 'mail2stockholm.com', 'mail2stockmarket.com', 'mail2storage.com', 'mail2store.com', 'mail2strong.com', 'mail2student.com', 'mail2studio.com', 'mail2studio54.com', 'mail2stuntman.com', 'mail2subscribe.com', 'mail2sudan.com', 'mail2superstar.com', 'mail2surfer.com', 'mail2suriname.com', 'mail2susan.com', 'mail2suzie.com', 'mail2swaziland.com', 'mail2sweden.com', 'mail2sweetheart.com', 'mail2swim.com', 'mail2swimmer.com', 'mail2swiss.com', 'mail2switzerland.com', 'mail2sydney.com', 'mail2sylvia.com', 'mail2syria.com', 'mail2taboo.com', 'mail2taiwan.com', 'mail2tajikistan.com', 'mail2tammy.com', 'mail2tango.com', 'mail2tanya.com', 'mail2tanzania.com', 'mail2tara.com', 'mail2taurus.com', 'mail2taxi.com', 'mail2taxidermist.com', 'mail2taylor.com', 'mail2taz.com', 'mail2teacher.com', 'mail2technician.com', 'mail2ted.com', 'mail2telephone.com', 'mail2tenderness.com', 'mail2tennessee.com', 'mail2tennis.com', 'mail2tennisfan.com', 'mail2terri.com', 'mail2terry.com', 'mail2test.com', 'mail2texas.com', 'mail2thailand.com', 'mail2therapy.com', 'mail2think.com', 'mail2tickets.com', 'mail2tiffany.com', 'mail2tim.com', 'mail2time.com', 'mail2timothy.com', 'mail2tina.com', 'mail2titanic.com', 'mail2toby.com', 'mail2todd.com', 'mail2togo.com', 'mail2tom.com', 'mail2tommy.com', 'mail2tonga.com', 'mail2tony.com', 'mail2touch.com', 'mail2tourist.com', 'mail2tracey.com', 'mail2tracy.com', 'mail2tramp.com', 'mail2travel.com', 'mail2traveler.com', 'mail2travis.com', 'mail2trekkie.com', 'mail2trex.com', 'mail2triallawyer.com', 'mail2trick.com', 'mail2trillionaire.com', 'mail2troy.com', 'mail2truck.com', 'mail2trump.com', 'mail2try.com', 'mail2tunisia.com', 'mail2turbo.com', 'mail2turkey.com', 'mail2turkmenistan.com', 'mail2tv.com', 'mail2tycoon.com', 'mail2tyler.com', 'mail2u4me.com', 'mail2uae.com', 'mail2uganda.com', 'mail2uk.com', 'mail2ukraine.com', 'mail2uncle.com', 'mail2unsubscribe.com', 'mail2uptown.com', 'mail2uruguay.com', 'mail2usa.com', 'mail2utah.com', 'mail2uzbekistan.com', 'mail2v.com', 'mail2vacation.com', 'mail2valentines.com', 'mail2valerie.com', 'mail2valley.com', 'mail2vamoose.com', 'mail2vanessa.com', 'mail2vanuatu.com', 'mail2venezuela.com', 'mail2venous.com', 'mail2venus.com', 'mail2vermont.com', 'mail2vickie.com', 'mail2victor.com', 'mail2victoria.com', 'mail2vienna.com', 'mail2vietnam.com', 'mail2vince.com', 'mail2virginia.com', 'mail2virgo.com', 'mail2visionary.com', 'mail2vodka.com', 'mail2volleyball.com', 'mail2waiter.com', 'mail2wallstreet.com', 'mail2wally.com', 'mail2walter.com', 'mail2warren.com', 'mail2washington.com', 'mail2wave.com', 'mail2way.com', 'mail2waycool.com', 'mail2wayne.com', 'mail2web.com', 'mail2webmaster.com', 'mail2webtop.com', 'mail2webtv.com', 'mail2weird.com', 'mail2wendell.com', 'mail2wendy.com', 'mail2westend.com', 'mail2westvirginia.com', 'mail2whether.com', 'mail2whip.com', 'mail2white.com', 'mail2whitehouse.com', 'mail2whitney.com', 'mail2why.com', 'mail2wilbur.com', 'mail2wild.com', 'mail2willard.com', 'mail2willie.com', 'mail2wine.com', 'mail2winner.com', 'mail2wired.com', 'mail2wisconsin.com', 'mail2woman.com', 'mail2wonder.com', 'mail2world.com', 'mail2worship.com', 'mail2wow.com', 'mail2www.com', 'mail2wyoming.com', 'mail2xfiles.com', 'mail2xox.com', 'mail2yachtclub.com', 'mail2yahalla.com', 'mail2yemen.com', 'mail2yes.com', 'mail2yugoslavia.com', 'mail2zack.com', 'mail2zambia.com', 'mail2zenith.com', 'mail2zephir.com', 'mail2zeus.com', 'mail2zipper.com', 'mail2zoo.com', 'mail2zoologist.com', 'mail2zurich.com', 'mailandftp.com', 'mailas.com', 'mailbolt.com', 'mailc.net', 'mailcan.com', 'mail-central.com', 'mailcity.com', 'mailexcite.com', 'mailforce.net', 'mailftp.com', 'mailhaven.com', 'mailingaddress.org', 'mailite.com', 'mailmight.com', 'mailnew.com', 'mail-page.com', 'mailsent.net', 'mailservice.ms', 'mailup.net', 'mailworks.org', 'me.com', 'mindspring.com', 'ml1.net', 'mm.st', 'msn.com', 'msnhotmail.com', 'munich.com', 'mweb.co.za', 'my.att.net', 'myfastmail.com', 'mymacmail.com', 'naver.com', 'netaddress.com', 'netscape.aol.com', 'netscape.com', 'netscape.net', 'netzero.com', 'netzero.net', 'newmail.ru', 'nicholastse.net', 'nicolastse.com', 'nm.ru', 'no.yahoo.com', 'nomorespamemails.com', 'norikomail.com', 'norwaymail.com', 'no-spam.ws', 'nospammail.net', 'notmailinator.com', 'nowmymail.com', 'ntlworld.com', 'nycap.rr.com', 'nz.yahoo.com', 'oath.com', 'omanmail.com', 'one.net.au', 'onebox.com', 'onet.eu', 'onet.pl', 'online.no', 'online.ru', 'op.pl', 'operamail.com', 'optimum.net', 'optonline.net', 'optusnet.com.au', 'optuszoo.com.au', 'orange.es', 'otakumail.com', 'ownmail.net', 'ozemail.com.au', 'pacific.net.sg', 'palestinemail.com', 'pandora.be', 'pcconnect.co.nz', 'personal.ro', 'petml.com', 'pisem.net', 'plusmail.com.br', 'poczta.fm', 'poczta.onet.eu', 'poczta.onet.pl', 'popstar.com', 'portugalmail.com', 'portugalmail.pt', 'postinbox.com', 'postino.ch', 'postpro.net', 'proinbox.com', 'promessage.com', 'ptd.net', 'qprfans.com', 'quickinbox.com', 'quik.co.nz', 'qwest.com', 'qwest.net', 'rambler.ru', 'ranmamail.com', 'rcn.com', 'realemail.net', 'reallyfast.biz', 'reallyfast.info', 'rediff.com', 'rediffmail.com', 'rochester.rr.com', 'rocketmail.com', 'rol.ru', 'rushpost.com', 'safe-mail.net', 'safetymail.info', 'safetypost.de', 'sammimail.com', 'satyam.net.in', 'saudia.com', 'se.yahoo.com', 'sent.as', 'sent.at', 'sent.com', 'serwus.pl', 'sesmail.com', 'shaw.ca', 'shitmail.me', 'shootmail.com', 'sify.com', 'sina.com', 'singnet.com.sg', 's-mail.com', 'sneakemail.com', 'sofort-mail.de', 'softhome.net', 'spam.lv', 'spam.su', 'spambog.com', 'spambog.de', 'spambog.ru', 'speedpost.net', 'speedymail.org', 'sprintmail.com', 'ssl-mail.com', 'stribmail.com', 'sunumail.sn', 'super.net.pk', 'supergreatmail.com', 'suremail.info', 'surimail.com', 'swift-mail.com', 'swissmail.net', 'sympatico.ca', 'syriamail.com', 'takas.lt', 'talk21.com', 'tampabay.rr.com', 'techemail.com', 'telecom.one.net.au', 'telepolis.com', 'telkom.net', 'telus.net', 'telusplanet.net', 'tempemail.net', 'tempinbox.com', 'temporarioemail.com.br', 'terra.cl', 'terra.com', 'terra.com.ar', 'terra.com.br', 'terra.es', 'the-fastest.net', 'theinternetemail.com', 'the-quickest.com', 'tin.it', 'tiscalinet.it', 'tmailinator.com', 't-online.de', 'tradermail.info', 'trashmail.ws', 'tudominio.com', 'tudominio.es', 'tudominio.org', 'tut.by', 'tw.yahoo.com', 'twcny.rr.com', 'uk2k.com', 'uk7.net', 'uk8.net', 'ukr.net', 'ukrpost.net', 'uol.com.br', 'usa.net', 'uswest.net', 'uymail.com', 'vahoo.com', 'verizon.net', 'veryfast.biz', 'veryrealemail.com', 'veryspeedy.net', 'videotron.ca', 'vip.interia.pl', 'vipmail.ru', 'virgilio.it', 'virgin.net', 'vodafone.co.nz', 'volcanomail.com', 'voyager.net', 'vp.pl', 'vsnl.com', 'wanadoo.es', 'warpmail.net', 'wave.co.nz', 'web.de', 'web20.a.ua', 'webmail.co.za', 'webmail.ntlworld.com', 'webmails.com', 'websurfer.co.za', 'whipmail.com', 'windowslive.com', 'windstream.net', 'worldnet.att.net', 'xsmail.com', 'xtra.co.nz', 'yahoo.at', 'yahoo.ba', 'yahoo.ca', 'yahoo.cn', 'yahoo.co.in', 'yahoo.co.jp', 'yahoo.co.kr', 'yahoo.co.nz', 'yahoo.co.th', 'yahoo.co.uk', 'yahoo.com', 'yahoo.com.ar', 'yahoo.com.au', 'yahoo.com.br', 'yahoo.com.cn', 'yahoo.com.es', 'yahoo.com.hk', 'yahoo.com.kr', 'yahoo.com.mx', 'yahoo.com.my', 'yahoo.com.ph', 'yahoo.com.ru', 'yahoo.com.sg', 'yahoo.com.tw', 'yahoo.de', 'yahoo.dk', 'yahoo.es', 'yahoo.fr', 'yahoo.gr', 'yahoo.ie', 'yahoo.in', 'yahoo.it', 'yahoo.jp', 'yahoo.kr', 'yahoo.ru', 'yahoo.se', 'yahoomail.com', 'yandex.ru', 'yeah.net', 'yemenmail.com', 'yepmail.net', 'ymail.com', 'yopmail.com', 'yougotemail.com', 'your-mail.com', 'yyhmail.com', 'zapak.com', 'zdnet.co.uk', 'zdnet.com', 'zdnetonebox.com', 'zebra.lt', 'zeenext.com', 'zehnminutenmail.de', 'zipmail.com.br', 'zippymail.info', 'zita.be', 'zmail.ru', 'znajomi.pl'];

var blacklistedDomains = ['24timezones.com', '2findlocal.com', '360cities.net', '4-city-information.com', '800wesleys.com', 'a2zgorge.info', 'aaroads.com', 'aboutgreenwoodms.com', 'acadiamagic.com', 'accessesmeralda.com', 'activerain.com', 'adoptapet.com', 'agency.governmentjobs.com', 'aircriticalcare.com', 'airnav.com', 'alabama.hometownlocator.com', 'alibris.com', 'allhomesforsalejacksonvillenc.com', 'all-oregon.com', 'amazon.com', 'americantowns.com', 'amlegal.com', 'angelfire.com', 'answers.yahoo.com', 'apartmentfinder.com', 'apartmenthomeliving.com', 'apartmentratings.com', 'apartments.com', 'apartments-in-ri.com', 'archiplanet.org', 'architecturefirmswilmington.com', 'archive.org', 'area-codes.com', 'areavibes.com', 'arkansas.hometownlocator.com', 'ashevilleguidebook.com', 'auburnalabama.org', 'autos.aol.com', 'autos.yahoo.com', 'b2byellowpages.com', 'barharborinfo.com', 'barharbormagic.com', 'barrington.patch.com', 'baysidecottagerentals.com', 'bedandbreakfast.com', 'beenverified.com', 'bendoregonrealestate.com', 'besthomepro.com', 'bestparttimejob.net', 'bestplaces.net', 'bestrhodeislandweddings.com', 'biddefordmillsmuseum.org', 'bizfinder.registerguard.com', 'bloglines.com', 'bloomberg.com', 'bnbstar.com', 'boatinfoworld.com', 'booking.com', 'books.google.com', 'boston.backpage.com', 'brokencc.com', 'browsevegashomes.com', 'budgetvision.com', 'bulkyitems.cityofws.org', 'business.intuit.com', 'businessfinder.gulflive.com', 'businessfinder.oregonlive.com', 'california.hometownlocator.com', 'camdenmainevacation.com', 'cardcow.com', 'cardetailingwilmingtonnc.com', 'caring.com', 'caselaw.findlaw.com', 'cemeteries.cityofws.org', 'cemeterycensus.com', 'censusviewer.com', 'century21.com', 'chacha.com', 'chamberofcommerce.com', 'chamberorganizer.com', 'cheapflights.com', 'childcarecenter.us', 'chilis.com', 'chrisedwardsgroup.com', 'churchangel.com', 'citiesandvillages.com', 'citizensbank.com', 'city.statelawyers.com', 'citylatitudelongitude.com', 'citymelt.com', 'cityofchicago.org', 'citypictures.info', 'cityprofile.com', 'citysquares.com', 'citytowninfo.com', 'city-usa.net', 'clevelandmschamber.com', 'climate.fizber.com', 'clrsearch.com', 'cmdrmark.com', 'coastaloregon.worldweb.com', 'codeapollo.com', 'codepublishing.com', 'columbiariverimages.com', 'community.lawyers.com', 'companies.findthecompany.com', 'countryhomesofmississippi.com', 'countryhomesofnevada.com', 'countryhomesofnorthcarolina.com', 'countryhomesoforegon.com', 'countryhomesofrhodeisland.com', 'cranstonpolice.com', 'crcpropertyinfo.com', 'creditunionsonline.com', 'crossroadscars.com', 'crossroadsfordsanford.com', 'crossroadskc.com', 'crossroadsokc.com', 'cubitplanning.com', 'dailymail.co.uk', 'data.visionappraisal.com', 'deedrecords.com', 'development.cityofws.org', 'dexknows.com', 'dictionary.reference.com', 'digital.library.unlv.edu', 'distancebetweencities.net', 'distancecalculator.globefeed.com', 'distance-cities.com', 'distancescalculator.com', 'districts.teachade.com', 'docstoc.com', 'doctor.webmd.com', 'doctorhelps.com', 'dominos.com', 'doostang.com', 'dover-foxcroft.org', 'downeast.com', 'dumpstersofamerica.com', 'eachtown.com', 'earthcam.com', 'easternoregon.worldweb.com', 'easystreetrealty-charlotte.com', 'easystreetrealty-raleighdurham.com', 'easystreetrealty-vegas.com', 'ebay.com', 'echo-oregon.com', 'ecode360.com', 'ediblearrangements.com', 'education.jobs-in-oregon.com', 'ehealthscores.com', 'ehow.com', 'elkorose.schopine.com', 'elocalexterminators.com', 'en.db-city.com', 'en.wikipedia.org', 'epodunk.com', 'estately.com', 'everytrail.com', 'examiner.com', 'expedia.com', 'exploreforums.com', 'exploringnevada.com', 'facebook.com', 'factbites.com', 'factsanswer.com', 'faqs.org', 'faremeasure.com', 'farmfresh.org', 'find.hamptonroads.com', 'findagrave.com', 'findamuralist.com', 'finddataentryjobs.com', 'finddogtrainers.com', 'finditonline.com', 'findlocalweather.com', 'findmeglutenfree.com', 'findnotary.com', 'findnursingjobs.net', 'findretailjobs.net', 'firedepartmentdirectory.com', 'firedepartments.net', 'firehouse.com', 'firenews.net', 'fivebelow.com', 'fizber.com', 'flights.expedia.com', 'flipkey.com', 'florist-flowers-roses-delivery.com', 'flowerdeliveryexpress.com', 'forgottennevada.org', 'forlocations.com', 'forms.cityofws.org', 'forrent.com', 'fortwiki.com', 'forums.ghosttowns.com', 'freebase.com', 'freedomspeaks.com', 'freedownloadb.com', 'freenevadamove.com', 'friendlyforecast.com', 'friendsofcolonialpemaquid.org', 'frontdoor.com', 'fuelmeup.com', 'funeral-homes.net', 'gasprices.mapquest.com', 'genforum.genealogy.com', 'geody.com', 'geology.com', 'georgia.hometownlocator.com', 'gesswhoto.com', 'getinsurancejobs.net', 'getlegaljobs.net', 'getofficejobs.net', 'getphysicians.net', 'getrestaurantjobs.net', 'gettruckerjobs.com', 'ghosttownexplorers.org', 'ghosttowngallery.com', 'ghosttowns.com', 'glassdoor.com', 'globalindex.com', 'gluedideas.com', 'go.hubbiz.com', 'goby.com', 'golflink.com', 'gomonroe.org', 'government.jobs-in-oregon.com', 'govlisted.com', 'govsites.org', 'great-maine-vacations.com', 'greatnonprofits.org', 'greatschools.org', 'greensboroareahomes.com', 'groupon.com', 'happyzebra.com', 'healthgrades.com', 'healthtrax.com', 'heraldnews.com', 'hikercentral.com', 'historic-structures.com', 'history.nevadanorthernrailway.net', 'history.rays-place.com', 'homefinder.com', 'homegain.com', 'homehealthcarewilsonnc.com', 'homeinsurancewilson.com', 'homelessshelterdirectory.org', 'homes.com', 'homes.org', 'homesforsaleinjacksonville-nc.com', 'hometownlocator.com', 'hometownusa.com', 'hookandbullet.com', 'hopstop.com', 'hotel.net', 'hotelguides.com', 'hotelplanner.com', 'hotels.com', 'hotfrog.com', 'hotpads.com', 'hotspringsenthusiast.com', 'hoursmap.com', 'houseofnames.com', 'housesforsalelists.com', 'houstonculture.org', 'idaho.hometownlocator.com', 'ilawconnect.com', 'imdb.com', 'imortuary.com', 'indeed.com', 'indexpost.com', 'infomi.com', 'infomine.com', 'info-nc.com', 'insiderpages.com', 'insuranceproviders.com', 'intelius.com', 'itouchmap.com', 'jobcircle.com', 'jobdango.com', 'jobinventory.com', 'jobs.aol.com', 'jobs.monster.com', 'jobs2careers.com', 'jobsinme.com', 'jobswithcities.com', 'junk-car.org', 'justclicklocal.com', 'keepmecurrent.com', 'knmap.com', 'kvcog.org', 'lakesofmaine.org', 'landsat.com', 'landsoforegon.com', 'landwatch.com', 'lasr.net', 'lat-long.com', 'lawcrossing.com', 'lawyers.com', 'lawyersbystate.net', 'learnnc.org', 'legendsofamerica.com', 'lifescript.com', 'linkedin.com', 'livingnewdeal.berkeley.edu', 'livingplaces.com', 'local.answers.com', 'local.commercialappeal.com', 'local.dailyadvance.com', 'local.mapquest.com', 'local.post-gazette.com', 'local.stltoday.com', 'local.triangle411.com', 'local.yahoo.com', 'localbusiness.dailycomet.com', 'localbusiness.ocala.com', 'localbusiness.the-dispatch.com', 'localcrimenews.com', 'localdirectory.wdam.com', 'localdirectory.wect.com', 'localdirectory.wlbt.com', 'localdirectory.wlox.com', 'localdirectory.wmctv.com', 'localism.com', 'localrestaurant411.com', 'localschooldirectory.com', 'localscout.com', 'localsearch.dailytarheel.com', 'local-worship.com', 'locategrave.org', 'loopnet.com', 'lovemyzip.com', 'magicyellow.com', 'maine.hometownlocator.com', 'maine.info', 'maineanencyclopedia.com', 'mainecoastproperties.biz', 'mainegenealogy.net', 'maineguide.com', 'mainememory.net', 'mainetrailfinder.com', 'mainevacation.com', 'mainevacations.net', 'maine-white-pages.com', 'mainstreetmaps.com', 'manta.com', 'mapcarta.com', 'mappery.com', 'mapquest.com', 'maps.cityofreno.net', 'maps-n-stats.com', 'mapsofworld.com', 'maptechnica.com', 'marinas.com', 'massachusetts.hometownlocator.com', 'me.postcodebase.com', 'medicinenet.com', 'memorialflorists.com', 'merchantcircle.com', 'metrolyrics.com', 'michigan.org', 'milebymile.com', 'mines.findthedata.org', 'miningartifacts.org', 'minnesota.hometownlocator.com', 'mississippi.hometownlocator.com', 'mississippi-landsource.com', 'mississippi-phone-book.com', 'moapavalley.travelnevada.com', 'moreheadcitymove.com', 'moreheadcityrestaurants.com', 'mountainproject.com', 'move.com', 'movingideas.org', 'movingtruck.com', 'movoto.com', 'mrwhatis.com', 'mscgr.homestead.com', 'ms-directory.hometownlocator.com', 'msgw.org', 'mslifeteam.com', 'museums.nevadaculture.org', 'music.yahoo.com', 'mycprcertificationonline.com', 'mylife.com', 'mynewplace.com', 'myspace.com', 'myyp.com', 'names.whitepages.com', 'namesandnumbers.com', 'narragansett.patch.com', 'national.citysearch.com', 'nationaljobs.washingtonpost.com', 'nationsonline.org', 'nchistoricsites.org', 'neighborcity.com', 'neighborhoodlink.com', 'neighborhoods.homeseekers.com', 'neighborhoodscout.com', 'nevada.firedepartments.net', 'nevada.hometownlocator.com', 'nevadacounty4sale.com', 'nevadadot.com', 'nevadanewsbureau.com', 'nevadanuggethunters.myfreeforum.org', 'nevadaobserver.com', 'nevada-outback-gems.com', 'nevadatravel.net', 'nevadaweb.com', 'newbernhomeguide.com', 'newcastlemaine.us', 'newenglandmoves.com', 'newenglandsite.com', 'newhomes.move.com', 'newportrischools.org', 'news.hometownusa.com', 'newsbytown.com', 'new-york.educationbug.org', 'newyork.hometownlocator.com', 'nklibrary.org', 'nonprofitfacts.com', 'northcarolina.hometownlocator.com', 'north-carolina.schooltree.org', 'northcarolinacountymaps.com', 'northcarolina-genealogy.com', 'northcarolina-realestate.com', 'northcarolinavacation.com', 'northcoastmaine.worldweb.com', 'nsla.nevadaculture.org', 'nv.postcodebase.com', 'nvghosttowns.topcities.com', 'nvmasons.org', 'nwrealty.com', 'offendex.com', 'offerrunway.com', 'ohwy.com', 'onlineimpactpanel.com', 'onlinenevada.org', 'ontheradio.net', 'oocities.org', 'openhouses.com', 'open-public-records.com', 'oregon.hometownlocator.com', 'oregonbeachvacations.com', 'oregoncities.us', 'oregongenealogy.com', 'oregonhotsprings.immunenet.com', 'oregontravels.com', 'orinfrastructure.org', 'orthopages.com', 'ourparents.com', 'owners.com', 'paddling.net', 'panoramio.com', 'papajohns.com', 'paybill.com', 'pdflike.com', 'pennsylvania.hometownlocator.com', 'peoplefinders.com', 'people--search.org', 'peopleshistory.org', 'petfinder.com', 'pinegrovetreatment.com', 'pizzahut.com', 'placenames.com', 'pointfacts.com', 'police-records.us', 'portlandme.citysearch.com', 'portsmouthri.com', 'postal-code.org', 'powerprofiles.com', 'pressherald.com', 'priceline.com', 'prlog.org', 'propertiesunltd.com', 'propertycrunch.com', 'providencerealestatehomes.com', 'publiclibraries.com', 'publicnotices.portlandtribune.com', 'publicrecordcenter.com', 'publicrecords.com', 'publicrecords.onlinesearches.com', 'public-school-districts.findthedata.org', 'publicschoolreview.com', 'public-schools.findthebest.com', 'questdiagnostics.com', 'quoddyloop.com', 'qwikcast.com', 'radiationthreats.org', 'radio-locator.com', 'radioshack.com', 'raleighrealestatehomes.com', 'ratemyprofessors.com', 'rchurch.com', 'rci-nv.com', 'realestate.aol.com', 'realestate.findportlandoregonhomes.com', 'realestate.gulflive.com', 'realestate.oregonlive.com', 'real-estate-cary.com', 'realtor.com', 'realtyexperts.us', 'recordspedia.com', 'recreationparks.net', 'remax.com', 'reno-laketahoe.worldweb.com', 'renovateyourworld.com', 'rent.com', 'rentals.com', 'residentialproperties.com', 'retail.jobs-in-oregon.com', 'retrove.com', 'rhodeisland.firedepartments.net', 'rhodeisland.hometownlocator.com', 'ricemeteries.tripod.com', 'ricentral.com', 'rihousehunt.com', 'ripleysghosttowns.com', 'roadsideamerica.com', 'roadsidethoughts.com', 'rockymountainprofiles.com', 'rootsweb.ancestry.com', 'rvparkreviews.com', 'salarylist.com', 'satelliteviews.net', 'sawbuck.com', 'schoolbug.org', 'schools.fizber.com', 'schools.publicschoolsreport.com', 'seacoast.com', 'seagrant.gso.uri.edu', 'search.natchezdemocrat.com', 'sebec.lakesonline.com', 'section-8-housing.findthebest.com', 'security4homes.com', 'seeraleighhomes.com', 'seeyprofile.com', 'seniorhousingnet.com', 'serviceslisted.com', 'shortdrives.com', 'silverstateghosttowns.com', 'sites.google.com', 'skyways.org', 'snagajob.com', 'southcarolina.hometownlocator.com', 'southcoastmaine.worldweb.com', 'southnevada.worldweb.com', 'spoke.com', 'spokeo.com', 'sportsbars.com', 'staples.com', 'starbucks.com', 'starkvilledailynews.com', 'statelawyers.com', 'statelocalgov.net', 'stateparks.com', 'stayandplayinthesmokies.com', 'summitpost.org', 'sunsetcities.com', 'superpages.com', 'surnames.meaning-of-names.com', 'switchboard.com', 'taxexemptworld.com', 'terravistarealty.com', 'texas.hometownlocator.com', 'texasroadhouse.com', 'thedirectory.org', 'thefreedictionary.com', 'thegolfnexus.com', 'thepublicrecords.com', 'therapists.psychologytoday.com', 'therealplaces.com', 'therockerbox.com', 'theus50.com', 'the-webcam-network.com', 'ticketmaster.com', 'tides.mobilegeographics.com', 'timetemperature.com', 'tiptopglobe.com', 'tivertonfourcorners.com', 'tonopahnevada.com', 'topix.com', 'topix.net', 'topoquest.com', 'topozone.com', 'totsandtravel.com', 'touristdb.com', 'town-court.com', 'townofbelgrade.com', 'traderjoes.com', 'traillink.com', 'trails.com', 'travel.yahoo.com', 'travela.priceline.com', 'travel-maine.info', 'travelmath.com', 'travelnevada.com', 'traveloregon.com', 'traveltips.u.com', 'tributes.com', 'tripadvisor.com', 'triptrivia.com', 'trulia.com', 'tvtrip.com', 'twitter.com', 'ucomparehealthcare.com', 'unitedelectricalservices.com', 'urbandictionary.com', 'us.jobrapido.com', 'usa.com', 'usacitiesonline.com', 'usanimalcontrol.com', 'usa-people-search.com', 'usatravelparks.blogspot.com', 'usbanklocations.com', 'usbeacon.com', 'uscitydirectories.com', 'us-city-home.com', 'userinstinct.com', 'usgwtombstones.org', 'u-s-history.com', 'usidentify.com', 'us-places.com', 'uspostcards.com', 'usps.com', 'usspecbook.com', 'utah.com', 'utilities.cityofws.org', 'vacationrentals.com', 'vacationrentals411.com', 'verizonwireless.com', 'viewcarolinahomes.com', 'viewphotos.org', 'virginia.hometownlocator.com', 'virginiacitynews.com', 'visitlubecmaine.com', 'visitmaine.com', 'visitmaine.net', 'visitnc.com', 'vitals.com', 'voices.yahoo.com', 'walmart.com', 'washington.hometownlocator.com', 'waymarking.com', 'weather.weatherbug.com', 'weatherbase.com', 'weatherforyou.com', 'weatherstreet.com', 'web.userinstinct.com', 'web1.userinstinct.com', 'web2.userinstinct.com', 'webpages.charter.net', 'webpanda.com', 'webspacecreations.com', 'weplay.com', 'werelate.org', 'wesleyberryflowers.com', 'westcottproperties.com', 'whitepages.com', 'widget.24timezones.com', 'wiki.answers.com', 'wikimapia.org', 'wikitravel.org', 'wmrw.org', 'woonsocketfire.org', 'woonsocketpolice.com', 'woonsocketschools.com', 'worldcasinodirectory.com', 'worldrover.com', 'worldweatheronline.com', 'wpnet.org', 'www1.marshallsonline.com', 'www2.globalscholar.com', 'wyzant.com', 'xphomestation.com', 'xroadschurch.us', 'yardsalesearch.com', 'yellowbook.com', 'yellowbot.com', 'yellownationaldirectory.com', 'yellowpages.foxcharlotte.com', 'yellowpages.norwichbulletin.com', 'yellowpages.washingtonpost.com', 'yellowpagesgoesgreen.org', 'yellowusapages.com', 'yelp.com', 'yelp.com.au', 'youinweb.com', 'yourroadmaptohome.com', 'yp.nevadaappeal.com', 'yp.ocregister.com', 'zetify.com', 'zillow.com', 'zipareacode.net', 'zipcode.org', 'zip-codes.com', 'zipperpages.com'];

var suspiciousDomains = ['salesforce.com', 'asp.net', 'youtube.com', 'wordpress.com', 'twitter.com'];

blacklistedDomains.push('google.com');

var aboutPages = ['leadership', 'leaders', 'bios', 'management', 'team', 'board', 'executive', 'directors', 'personnel'];

var contactUtility = {

    addContacts: null, // call as function (contacts, company, donotsave)

    contacts: [],

    parseSocialVenu: function (url) {
        if (!url) { return 'other'; }
        url = url.toLowerCase();
        for (var index in socialDomains) {
            if (url.indexOf(socialDomains[index].domain) > -1) { return socialDomains[index].venue; }
        }
        return 'other';
    },
    getSocialIcon: function (socialVenu) {
        if (!socialVenu) { return undefined; }
        return 'images/social/' + socialVenu + '.jpg';
    },

    createNewContact: function () {

        var C = function () {

            this.c = new Date();
            //this.c2 = this._createdon.getTime();
            this._dived = false;
            this._enhanced = false;
            this._enhancing = false;
            this._hidden = false;
            this._new = true;

            this.id = null;
            this.flags = null;
            this.phone1src = null;
            this.mark = null;
            this.sourceurl = '';

            this.first = '';
            this.last = '';
            this.jobtitle = '';
            this.company = '';
            this.email = '';
            this.phone = '';
            this.phone2 = '';
            this.website = '';
            this.bio = '';

            this.address1 = '';
            this.address2 = '';
            this.city = '';
            this.state = '';
            this.zip = '';
            this.country = '';

        };

        return new C();

    },

    contactToBlXml: function (c) {
        var contact = [];

        var fields = [];
        xmlUtility.encodeWrapPush(c.id + '', 'Handle', fields, true);
        xmlUtility.encodeWrapPush(c.last, 'LastName', fields, true);
        xmlUtility.encodeWrapPush(c.middle, 'MiddleName', fields, true);
        xmlUtility.encodeWrapPush(c.first, 'FirstName', fields, true);
        xmlUtility.encodeWrapPush(c.jobtitle, 'JobTitle', fields, true);
        xmlUtility.encodeWrapPush(c.email, 'Email', fields, true);
        xmlUtility.encodeWrapPush(c.website, 'Website', fields, true);
        xmlUtility.encodeWrapPush(c.sourceurl, 'SourceURL', fields, true);
        xmlUtility.encodeWrapPush(c.company, 'CompanyName', fields, true);
        xmlUtility.encodeWrapPush(c.bio, 'Biography', fields, true);

        var address = [];
        xmlUtility.encodeWrapPush(c.address1, 'AddressLine1', address, true);
        xmlUtility.encodeWrapPush(c.address2, 'AddressLine2', address, true);
        xmlUtility.encodeWrapPush(c.city, 'City', address, true);
        xmlUtility.encodeWrapPush(c.state, 'State', address, true);
        xmlUtility.encodeWrapPush(c.zip, 'PostalCode', address, true);
        xmlUtility.encodeWrapPush(c.country, 'Country', address, true);
        //  Wrap address in as a field
        xmlUtility.wrapAndPush(address.join(''), 'MainAddress', fields, true);

        //  Wrap fields into contact
        xmlUtility.wrapAndPush(fields.join(''), 'Fields', contact, true);
        var i;
        var lists = [];
        var phones = [];
        if (c.phone) { phones.push(xmlUtility.tag(xmlUtility.encodeAndWrap(c.phone, 'Text'), 'Phone')); }
        if (c.phone2) { phones.push(xmlUtility.tag(xmlUtility.encodeAndWrap(c.phone2, 'Text'), 'Phone')); }

        if (c.phones) {
            for (i = 0; i < c.phones.length; i++) {
                var phone = xmlUtility.encodeAndWrap(c.phones[i].text, 'Text');
                var type = xmlUtility.encodeAndWrap(c.phones[i].type, 'Type');
                phones.push(xmlUtility.tag([phone, type].join(''), 'Phone'));
            }
        }

        if (phones.length) {
            //  Wrap phones into contact
            //xmlUtility.wrapAndPush(xmlUtility.tag(phones.join(''), 'Phones'), 'Lists', lists, true);
            lists.push(xmlUtility.tag(phones.join(''), 'Phones'));
        }
        if (c.venues) {
            var venues = [];
            for (i = 0; i < c.venues.length; i++) {
                var text = xmlUtility.encodeAndWrap(c.venues[i].website, 'Text');
                var vtype = xmlUtility.encodeAndWrap(c.venues[i].type, 'Type');
                var venueparts = [text, vtype];
                venues.push(xmlUtility.tag(venueparts.join(''), 'Venue'));
            }
            if (venues.length) {
                //  Wrap phones into contact
                lists.push(xmlUtility.tag(venues.join(''), 'Venues'));
            }
        }
        if (c.addresses) {
            var addresses = [];
            for (i = 0; i < c.addresses.length; i++) {
                var address1 = xmlUtility.encodeAndWrap(c.addresses[i].address1, 'AddressLine1');
                var address2 = xmlUtility.encodeAndWrap(c.addresses[i].address2, 'AddressLine2');
                //var tag = xmlUtility.encodeAndWrap(c.addresses[i].tag, 'AddressTag');
                var city = xmlUtility.encodeAndWrap(c.addresses[i].city, 'City');
                var country = xmlUtility.encodeAndWrap(c.addresses[i].country, 'Country');
                var zip = xmlUtility.encodeAndWrap(c.addresses[i].zip, 'PostalCode');
                var state = xmlUtility.encodeAndWrap(c.addresses[i].state, 'State');
                addresses.push(xmlUtility.tag([address1, address2, city, country, zip, state].join(''), 'Address'));
            }
            if (addresses.length) {
                lists.push(xmlUtility.tag(addresses.join(''), 'AdditionalAddresses'));
            }
        }
        if (c.emails || c.email2) {
            var emails = [];
            if (c.email2) {
                var email2 = xmlUtility.encodeAndWrap(c.email2, 'Email');
                emails.push(email2);
            }
            if (c.emails) {
                for (i = 0; i < c.emails.length; i++) {
                    var email = xmlUtility.encodeAndWrap(c.emails[i], 'Email');
                    emails.push(email);
                }
            }
            if (emails.length) {
                lists.push(xmlUtility.tag(emails.join(''), 'AdditionalEmails'));
            }
        }
        if (lists.length) {
            xmlUtility.wrapAndPush(lists.join(''), 'Lists', contact, true);
        }
        return xmlUtility.tag(contact.join(''), 'Contact');
    },
    contactsToBlXml: function (c) {
        var contacts = [];
        for (var index in c) {
            contacts.push(this.contactToBlXml(c[index]));
        }
        return xmlUtility.tag(contacts.join(''), 'Contacts');
    },

    contactsToBlJson: function (contacts) {

        var i,
            c,
            a,
            aa = [];

        if (contacts) {
            for (i = 0; i < contacts.length; i++) {

                c = contacts[i];

                if (!c) {
                    continue;
                }

                a = {};

                if (c.id) {
                    a.Handle = [c.id];
                }
                if (c.last) {
                    a.LastName = [c.last];
                }
                if (c.middle) {
                    a.MiddleName = [c.middle];
                }
                if (c.first) {
                    a.FirstName = [c.first];
                }
                if (c.jobtitle) {
                    a.JobTitle = [c.jobtitle];
                }
                if (c.website) {
                    a.Website = [c.website];
                }
                if (c.company) {
                    a.CompanyName = [c.company];
                }
                if (c.address1) {
                    a.AddressLine1 = [c.address1];
                }
                if (c.address2) {
                    a.AddressLine2 = [c.address2];
                }
                if (c.city) {
                    a.City = [c.city];
                }
                if (c.state) {
                    a.State = [c.state];
                }
                if (c.zip) {
                    a.PostalCode = [c.zip];
                }
                if (c.country) {
                    a.Country = [c.country];
                }

                if (c.phone) {
                    a.Phone = [c.phone];
                    if (c.phone2) {
                        a.Phone.push(c.phone2);
                    }
                }

                a.RecordType = ['Person'];

                aa.push(a);
            }
        }
        return aa;
    },

    //     apply overriding contact data to each contact
    applyOverrides: function (contacts, overridingContact) {
        if (!overridingContact) { return; }
        if (!contacts) { return; }
        if (contacts.length === 0) { return; }

        for (var contactIndex in contacts) {
            var contact = contacts[contactIndex];
            for (var fieldKey in contact) {
                if (!overridingContact[fieldKey]) { continue; }
                contact[fieldKey] = overridingContact[fieldKey];
            }
        }
    },

    fixUrl: function (url, preserveCase) {
        // drops http and www, lowercases and trims
        var u = url;
        if (u) {
            //console.log('***************** fixing url: ' + u);
            if (!preserveCase) {
                u = u.toLowerCase();
            }
            u = u.trim();
            if (u.indexOf('://') >= 0) {
                u = u.substring(u.indexOf('://') + 3);
            }
            if (u.indexOf('www.') === 0) {
                u = u.substring(4);
            }
            if (u.lastIndexOf('/') === (u.length - 1)) {
                u = u.substring(0, u.length - 1);
            }
            //console.log('***************** fixed url: ' + u);
        }
        return u;
    },

    sortVenues: function (contact) {
        try {

            contact.venues = contact.venues || [];

            contact.linkedin = contactUtility.getVenue(contact, 'linkedin.com');
            contact.twitter = contactUtility.getVenue(contact, 'twitter.com');
            contact.facebook = contactUtility.getVenue(contact, 'facebook.com');
            contact.employeesAvg = contactUtility.getEmployeesAvg(contact.employees);
            contact.revenueAvg = contactUtility.getRevenueAvg(contact.revenue);
            contact._hasOtherVenues = false;

            contact.website = contactUtility.fixUrl(contact.website);
            contact.full = contactUtility.fixFullName('', contact.first, contact.last, contact.middle);
            contact.emailverbool = parseInt(contact.emailver) > 1;
            contact.email2verbool = parseInt(contact.email2ver) > 1;

            var i = contact.venues.length;
            while (i--) {
                var w = contact.venues[i].website || '';
                if (w.indexOf(contact.facebook) >= 0 || w.indexOf(contact.linkedin) >= 0 || w.indexOf(contact.twitter) >= 0) {
                    contact.venues[i].top = true;
                } else {
                    contact.venues[i].top = false;
                    contact._hasOtherVenues = true;
                }
                contact.venues[i].personal = contactUtility.isIndividualProfile(w, contact.company, contact.first, contact.last);
                // Delete company website form the list of venues
                if (w === contact.website) {
                    console.warn('Deleting venue',contact.venues[i]);
                    contact.venues.splice(i, 1);
                }
            }

            // Sort: facebook, linkedin, twiiter, others
            var pos = 0;
            var copy = null;
            var i;
            if (contact.facebook) {
                contact.venues.forEach(function (venue, index, array) {
                    if (venue.website === contact.facebook) {
                        if (index !== pos) {
                            copy = jQuery.extend({}, venue);
                            contact.venues.splice(index, 1);
                            contact.venues.splice(pos, 0, copy);
                        }
                        pos++;
                    }
                });
            }
            if (contact.linkedin) {
                contact.venues.forEach(function (venue, index, array) {
                    if (venue.website === contact.linkedin) {
                        if (index !== pos) {
                            copy = jQuery.extend({}, venue);
                            contact.venues.splice(index, 1);
                            contact.venues.splice(pos, 0, copy);
                        }
                        pos++;
                    }
                });
            }
            if (contact.twitter) {
                

                contact.venues.forEach(function (venue, index, array) {
                    if (venue.website === contact.twitter) {
                        if (index !== pos) {
                            copy = jQuery.extend({}, venue);
                            contact.venues.splice(index, 1);
                            contact.venues.splice(pos, 0, copy);
                        }
                        pos++;
                    }
                });
            }

        } catch (e) {
            console.error('Calculate Fields > ', e.message);
        }
    },

    endsWith: function (str, suffix) {
        return str.indexOf(suffix, str.length - suffix.length) !== -1;
    },

    stripCompanyName: function (value) {

        if (!value) { return value; }

        var k = '';
        try {
            k = ', Inc.'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ', Inc'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ' Inc.'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ' Inc'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ', LLC'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ' LLC'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ', The'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ' LTD'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ' Co'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ' Corporation'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ' Corp'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ' GmbH'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ' Group'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ' PLC'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
            k = ' LLP'; if (contactUtility.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
        } catch (e) {
            console.log('ERROR in stripCompanyName value:', value, ' error:' + e.message);
        }


        return value;
    },

    abbreviate: function (company) {
        var a = '';

        if (company && company.length > 0) {
            var first = true;
            for (var i = 0; i < company.length; i++) {
                var c = company[i];
                if (c.match(/[a-z]/i)) {
                    if (first) {
                        a = a + c;
                    }
                    first = false;
                } else {
                    first = true;
                }
            }
        }

        return a;
    },

    firstWord: function (company) {
        var a = '';

        if (company && company.length > 0) {
            var first = true;
            for (var i = 0; i < company.length; i++) {
                var c = company[i];
                if (c.match(/[a-z]/i)) {
                    if (first) {
                        a = a + c;
                    }
                } else {
                    first = false;
                    break;
                }
            }
        }

        return a;
    },

    isLinkedInIndividualProfile: function (url) {
        if (!url) { return false; }
        url = url.toLowerCase();
        if (url.indexOf('linkedin.com/in/') >= 0) { return true; }
        if (url.indexOf('linkedin.com/pub/') >= 0 && url.indexOf('inkedin.com/pub/dir/') < 0) { return true; }
        if (url.indexOf('linkedin.com/profile/') >= 0) { return true; }
        return false;
    },

    isTwitterIndividualProfile: function (url, company, first, last) {
        if (!url) { return false; }
        url = url.toLowerCase();
        if (url.indexOf('twitter.com/') >= 0) {

            var abbr = contactUtility.abbreviate(company).toLowerCase();
            if (abbr.length > 1 && url.indexOf('twitter.com/' + abbr) >= 0) {
                return false;
            }

            var firstWord = contactUtility.firstWord(company).toLowerCase();
            if (firstWord.length > 0 && url.indexOf('twitter.com/' + firstWord) >= 0) {
                return false;
            }

            first = (first || '').toLowerCase();
            if (first.length > 0 && url.indexOf(first, url.indexOf('.com/') + 4) > 0) {
                return true;
            }

            last = (last || '').toLowerCase();
            if (last.length > 0 && url.indexOf(last, url.indexOf('.com/') + 4) > 0) {
                return true;
            }

            return false;
        }
        return false;
    },

    isFacebookIndividualProfile: function (url, company, first, last) {
        if (!url) { return false; }
        url = url.toLowerCase();
        if (url.indexOf('facebook.com/') >= 0) {

            var abbr = contactUtility.abbreviate(company).toLowerCase();
            if (abbr.length > 1 && url.indexOf('facebook.com/' + abbr) >= 0) {
                return false;
            }

            var firstWord = contactUtility.firstWord(company).toLowerCase();
            if (firstWord.length > 0 && url.indexOf('facebook.com/' + firstWord) >= 0) {
                return false;
            }

            first = (first || '').toLowerCase();
            if (first.length > 0 && url.indexOf(first, url.indexOf('.com/') + 4) > 0) {
                return true;
            }

            last = (last || '').toLowerCase();
            if (last.length > 0 && url.indexOf(last, url.indexOf('.com/') + 4) > 0) {
                return true;
            }

            return false;
        }
        return false;
    },

    isIndividualProfile: function (url, company, first, last) {
        const functionName = 'Is Individual Profile';
        try {
            if (!url) { return false; }
            url = url.toLowerCase();
            var abbr = contactUtility.abbreviate(company).toLowerCase();
            var firstWord = contactUtility.firstWord(company).toLowerCase();
            first = (first || '').toLowerCase();
            last = (last || '').toLowerCase();

            var checkDomain = function (domain) {
                if (url.indexOf(domain) >= 0) {
                    if (abbr.length > 1 && url.indexOf(domain + abbr) >= 0) {
                        return false;
                    }
                    if (firstWord.length > 0 && url.indexOf(domain + firstWord) >= 0) {
                        return false;
                    }
                    if (first.length > 0 && url.indexOf(first, url.indexOf(domain) + 4) > 0) {
                        return true;
                    }
                    if (last.length > 0 && url.indexOf(last, url.indexOf(domain) + 4) > 0) {
                        return true;
                    }
                }
                return null;
            };
            var domainResult = null;
            domainResult = checkDomain('.com/'); if (domainResult !== null) { return domainResult; }
            domainResult = checkDomain('.so/'); if (domainResult !== null) { return domainResult; }
            domainResult = checkDomain('.net/'); if (domainResult !== null) { return domainResult; }
            domainResult = checkDomain('.org/'); if (domainResult !== null) { return domainResult; }
            domainResult = checkDomain('.me/'); if (domainResult !== null) { return domainResult; }
            domainResult = checkDomain('user/'); if (domainResult !== null) { return domainResult; }
            domainResult = checkDomain(''); if (domainResult !== null) { return domainResult; }
        } catch (e) {
            console.error(functionName, e.message);
        }
        return false;
    },

    addAddress: function (contact, address) {
        contact.addresses = contact.addresses || [];
        if (address) {
            var i = contact.addresses.length;
            while (i--) {
                if (
                    (contact.addresses[i].address1 || '').toLowerCase() === (address.address1 || '').toLowerCase() &&
                    (contact.addresses[i].address2 || '').toLowerCase() === (address.address2 || '').toLowerCase() &&
                    (contact.addresses[i].city || '').toLowerCase() === (address.city || '').toLowerCase() &&
                    (contact.addresses[i].state || '').toLowerCase() === (address.state || '').toLowerCase() &&
                    (contact.addresses[i].zip || '').toLowerCase() === (address.zip || '').toLowerCase() &&
                    (contact.addresses[i].country || '').toLowerCase() === (address.country || '').toLowerCase()
                    ) {
                    //console.log('EQUAL', angular.copy(address), angular.copy(contact.addresses[i]));
                    return;
                }
                else {
                    //console.log('NOT EQUAL', angular.copy(address), angular.copy(contact.addresses[i]));
                }
            }
            if (debug) { console.log(debug + 'addAddress', address); }
            contact.addresses.push(address);
        }
    },

    composeFullAddress: function (contact, separator) {

        if (!contact) { return ''; }

        separator = separator || ' ';

        var a = ((contact.address1 || '') + ' ' + (contact.address2 || '')).trim();
        var b = (contact.city || '').trim();
        var b2 = (contact.state || '').trim();
        var c = (contact.zip || '').trim();
        var d = (contact.country || '').trim();

        if (b && b2) { b = b + ', ' + b2; }
        if (b && c) { c = ' ' + c; }
        if (a && (b || c || d)) { a = a + separator; }
        if (d && (b || c)) { d = separator + d; }

        return a + b + c + d;
    },

    isNumber: function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },

    getEmployeesAvg: function (range) {
        const functionName = 'Get Employees Average';
        try {
            if (!range) { return null; }
            if (contactUtility.isNumber(range)) { return range; }
            var sides = range.split('-');

            if (sides.length === 2) {
                var low = parseInt(sides[0].trim().replace(/,/g, ''), 10);
                var high = parseInt(sides[1].trim().replace(/,/g, ''), 10);
                if (low >= 0 && high > 0) {
                    var avg = Math.round((low + high) / 2);
                    return avg;
                }
            } else {
                // over, under, <, >
                sides = range.split(' ');
                var i = sides.length;
                while (i--) {
                    var num = parseInt(sides[i].trim().replace(/,/g, ''), 10);
                    if (num > 0) { return num; }
                }
            }
        } catch (e) {
            console.error(functionName, e.message);
        }
        return null;
    },

    // Convert string currency (Ex: "$25.0B") to int
    parseCurrency: function (value) {
        if (!value) { return null; }
        value = value.trim();
        if (value.indexOf('$') === 0) {
            value = value.substring(1);
        }
        var correction = 1;
        if (value.indexOf('B') === (value.length - 1)) {
            value = value.substring(0, value.length - 1);
            correction = 1000000000;
        }
        if (value.indexOf('M') === (value.length - 1)) {
            value = value.substring(0, value.length - 1);
            correction = 1000000;
        }
        if (value.indexOf('K') === (value.length - 1)) {
            value = value.substring(0, value.length - 1);
            correction = 1000;
        }
        var num = parseInt(value);
        //console.warn(value, ' => ', num);
        if (value[value.length - 1] === '9') {
            num++;
        }
        num *= correction;
        return num;
    },

    formatCurrency: function (num) {
        if (num >= 1000000000) {
            num = Math.round(num / 1000000000);
            return '$' + num + 'B';
        } else if (num >= 1000000) {
            num = Math.round(num / 1000000);
            return '$' + num + 'M';
        } else if (num >= 1000) {
            num = Math.round(num / 1000);
            return '$' + num + 'K';
        } else {
            return num;
        }
    },

    fixHighRange: function (high, low) {
        while (high < low && high > 0) {
            var s = '' + high;
            var last = s[s.length - 1];
            s = '' + s + last;
            high = parseInt(s);
        }
        return high;
    },

    getRevenueAvg: function (range) {
        const functionName = 'Get Revenue Average';
        try {
            if (!range) { return null; }
            if (contactUtility.isNumber(range)) { return range; }
            var separator = ' to ';
            if (range.indexOf(separator) < 0) {
                separator = '-';
            }
            var sides = range.split(separator);

            if (sides.length === 2) {
                //var low = parseInt(sides[0].trim().replace(/\$/g, ''), 10);
                //var high = parseInt(sides[1].trim().replace(/\$/g, ''), 10);
                var low = contactUtility.parseCurrency(sides[0]);
                var high = contactUtility.parseCurrency(sides[1]);
                high = contactUtility.fixHighRange(high, low);
                if (low >= 0 && high > 0) {
                    var avg = Math.round((low + high) / 2);
                    return avg;
                } else if (high > 0) {
                    return high;
                } else if (low > 0) {
                    return low;
                }
            } else {
                // over, under, <, >
                sides = range.split(' ');
                var i = sides.length;
                while (i--) {
                    var num = parseInt(sides[i].trim().replace(/\$/g, ''), 10);
                    if (num > 0) { return num; }
                }
            }
        } catch (e) {
            console.error(functionName, e.message);
        }
        return null;
    },

    fixCompany: function (company) {
        var pos1;

        // check for parenthesis in company name
        if (company) {

            pos1 = company.indexOf('(');
            if (pos1 > 1) {
                company = company.substring(0, pos1).trim();
            }

            pos1 = company.indexOf(' - ');
            if (pos1 >= 0) {
                company = company.substring(0, pos1).trim();
            }

            pos1 = company.indexOf(';');
            if (pos1 > 1) {
                company = company.substring(0, pos1).trim();
            }
        }

        return company;
    },

    fixTitle: function (title, company) {

        if (title && company) {
            // check for title ending with company name
            var p = title.indexOf(company);
            if (p > 1 && p >= (title.length - company.length - 2)) {
                title = title.substring(0, p - 1).trim();
            }
        }

        if (title) {
            var l = title.length;

            // ends with  "(...)"
            var checkAgain = true;
            while (checkAgain && title[l - 1] === ')') {
                checkAgain = false;
                var x = title.lastIndexOf('(');
                if (x) {
                    title = title.substring(0, x).trim();
                    checkAgain = l !== title.length;
                    l = title.length;
                }
            }

            if (l > 0) {
                if (title[l - 1] === ',') { title = title.substring(0, l - 1).trim(); }
                else if (title[l - 1] === '@') { title = title.substring(0, l - 1).trim(); }
                else if (l > 4 && title.substring(l - 3, l) === ' at') { title = title.substring(0, l - 3).trim(); }
            }

            ////console.log('lrm removal:' + title[0]+'|'+ title.charCodeAt(0));
            //if (title.charCodeAt(0) === 8206) {
            //    title = title.substring(1);
            //    //console.log('lrm removed' + '|' + title.charCodeAt(0));
            //}

            var cleanTitle = [];
            for (var i = 0, len = title.length; i < len; i++) {
                if (title.charCodeAt(i) !== 8206) {
                    cleanTitle.push(title[i]);
                }
            }
            title = cleanTitle.join('');
        }
        //console.log('fixed title=' + title + '|company=' + company + "|")

        // remove "clouds", etc.
        //title = title.replace(/([^a-z\&.,- ]+)/ig, '').trim();

        return title;
    },

    getEmail: function (text, first, last, website) {

        var t = text;
        var f = first;
        var l = last;
        //var d = this.getDomain(website);

        if (!t) { return ''; }

        var regex = /([a-z0-9._]+)@([a-z0-9-]+)([.]([a-z]{1,3})(?![a-z])){1,2}/igm;

        //var matches = text.match(regex);
        //console.log('email', matches);

        var e = regex.exec(text);
        if (e && e.length > 0) {
            //console.log('email', e);
            e = e[0].toLowerCase();
        }

        return e;
    },

    getDomain: function (website) {
        var regex = /([a-z0-9-]+)([.]([a-z]{1,3})(?![a-z-])){1,2}/ig;
        var d = regex.exec(website);
        if (d && d.length > 0) { d = d[0]; }
        if (d && d.length > 0) { d = d.toLowerCase(); }
        //console.log('domain', d, 'website', website);
        return d;
    },

    getPhone: function (text) {
        var regex = /([0-9]{3})-([0-9]{3})-([0-9]{4})/ig;
        var d = regex.exec(text);
        if (d && d.length > 0) {
            d = d[0];
            console.log('PHONE', d);
        } else {
            regex = /(\({1})([0-9]{3})(\({1})(\s*)([0-9]{3})-([0-9]{4})/ig;
            d = regex.exec(text);
            if (d && d.length > 0) {
                d = d[0];
                console.log('PHONE (2)', d);
            }
        }
        return d;
    },

    isFreeEmailDomain: function (emaildomain) {
        if (!emaildomain) { return false; }

        var e = emaildomain.trim().toLowerCase();

        var suffix = '.rr.com';
        if (e.indexOf(suffix, this.length - suffix.length) !== -1)
        { return true; }

        //var d = [];
        //d.push('gmail.com', 'yahoo.com', 'facebook.com', 'live.com', 'hotmail.com', 'aol.com');

        return freeEmailDomains.indexOf(e) >= 0;
    },

    isBlacklistedDomain: function (domain) {
        if (!domain) { return false; }
        var e = domain.trim().toLowerCase();
        return blacklistedDomains.indexOf(e) >= 0;
    },

    isSuspiciousDomain: function (domain) {
        if (!domain) { return false; }
        var e = domain.trim().toLowerCase();
        return suspiciousDomains.indexOf(e) >= 0;
    },

    isAboutPage: function (url) {
        if (!url) { return false; }
        var domain = this.getDomain(url);
        var path = url.trim().toLowerCase().split(domain)[1];
        if (!path) { return false; }
        var i = aboutPages.length;
        while (i--) {
            if (path.indexOf(aboutPages[i]) >= 0) {
                return true;
            }
        }
        return false;
        //var e = url.trim().toLowerCase();
        //return aboutPages.indexOf(e) >= 0;
    },

    isTitle: function (title) {

        //console.log('IS TITLE', title);

        if (!title)
        { return false; }

        if (title.toLowerCase().indexOf('seeking') > -1)
        { return false; }
        if (title.toLowerCase().indexOf('unemployed') > -1)
        { return false; }

        return true;
    },

    fixFullName: function (fullname, first, last, middle) {

        var full, pos1, pos2, suffixStr;
        var stuffInTheMiddle = false;

        full = fullname || '';
        first = first || '';
        last = last || '';
        middle = middle || '';

        pos1 = first.indexOf('('); if (pos1 >= 0) { first = first.substring(0, pos1).trim(); stuffInTheMiddle = true; }
        pos1 = first.indexOf('['); if (pos1 >= 0) { first = first.substring(0, pos1).trim(); stuffInTheMiddle = true; }
        pos1 = last.indexOf('('); if (pos1 >= 0) { last = last.substring(0, pos1).trim(); stuffInTheMiddle = true; }
        pos1 = last.indexOf('['); if (pos1 >= 0) { last = last.substring(0, pos1).trim(); stuffInTheMiddle = true; }

        if (!full || stuffInTheMiddle) {
            full = (((first ? first : '') + ' ' + (middle ? middle : '')).trim() + ' ' + (last ? last : '')).trim();
        }

        pos1 = full.indexOf('(');
        if (pos1 >= 0) {
            suffixStr = '';
            pos2 = full.indexOf(')', pos1 + 1);
            if (pos2 >= 0 && pos2 < (full.length - 1)) {
                suffixStr = full.substring(pos2 + 1).trim();
                if (suffixStr.length > 0) { suffixStr = ' ' + suffixStr; }
            }
            full = full.substring(0, pos1).trim() + suffixStr;
        }

        pos1 = full.indexOf('[');
        if (pos1 >= 0) {
            suffixStr = '';
            pos2 = full.indexOf(']', pos1 + 1);
            if (pos2 >= 0 && pos2 < (full.length - 1)) {
                suffixStr = full.substring(pos2 + 1).trim();
                if (suffixStr.length > 0) { suffixStr = ' ' + suffixStr; }
            }
            full = full.substring(0, pos1).trim() + suffixStr;
        }

        pos1 = full.indexOf('{');
        if (pos1 >= 0) {
            suffixStr = '';
            pos2 = full.indexOf('}', pos1 + 1);
            if (pos2 >= 0 && pos2 < (full.length - 1)) {
                suffixStr = full.substring(pos2 + 1).trim();
                if (suffixStr.length > 0) { suffixStr = ' ' + suffixStr; }
            }
            full = full.substring(0, pos1).trim() + suffixStr;
        }

        pos1 = full.indexOf('"');
        if (pos1 >= 0) {
            pos2 = full.indexOf('"', pos1 + 1);
            if (pos2 > pos1) {
                full = full.substring(0, pos1).trim() + ' ' + full.substring(pos2 + 1).trim();
            }
        }

        pos1 = full.indexOf('='); if (pos1 >= 0) { full = full.substring(0, pos1).trim(); }
        pos1 = full.indexOf('|'); if (pos1 >= 0) { full = full.substring(0, pos1).trim(); }
        pos1 = full.indexOf(';'); if (pos1 >= 0) { full = full.substring(0, pos1).trim(); }
        pos1 = full.indexOf('Interactive'); if (pos1 >= 0) { full = full.replace(/Interactive/gi, ''); }
        pos1 = full.indexOf('TopLinked'); if (pos1 >= 0) { full = full.replace(/TopLinked/gi, ''); }

        pos1 = full.indexOf(',');
        if (pos1 >= 0) {
            pos2 = full.indexOf(' ');
            if (pos2 < pos1) {
                full = full.substring(0, pos1).trim();
            } else {
                full = full.substring(pos1 + 1).trim() + ' ' + full.substring(0, pos1).trim();
            }
        }

        pos1 = full.indexOf('- ');
        if (pos1 >= 0) {
            pos2 = full.indexOf(' ');
            if (pos2 > 0 && pos2 < pos1) {
                full = full.substring(0, pos1).trim();
            }
        }

        full = full.replace(/([^-a-z\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC ]+)/ig, '').trim();

        return full;
    },

    splitFullName: function (full) {

        var res = { full: full, last: '', first: '', middle: '' };

        if (full.indexOf(' ') >= 0) {
            var parts = full.split(' ');
            if (parts.length === 2) {
                res.first = parts[0];
                res.middle = '';
                res.last = parts[1];
            } else if (parts.length === 3) {
                res.first = parts[0];
                res.middle = parts[1];
                res.last = parts[2];
            } if (parts.length > 3) {
                res.first = '';
                for (var i = 0; i < parts.length - 2; i++) {
                    res.first += parts[i] + ' ';
                }
                res.first = res.first.trim();
                res.middle = parts[parts.length - 2];
                res.last = parts[parts.length - 1];
            }
        }
        else {
            res.first = '';
            res.middle = '';
            res.last = full;
        }

        return res;
    },

    readPatternRecord: function (record, contact) {

        if (record) {
            for (var j = 0; j < record.length; j++) {
                this.readPatternField(record[j], contact);
                if (record[j].Data)
                { this.readPatternRecord(record[j].Data, contact); }
            }
        }

        contactUtility.sortVenues(contact);

    },

    scanText: function (text, contact) {

        var emailStr, websiteStr, phoneStr, p1, p2;

        //console.log('scanning', text, this);

        emailStr = this.getEmail(text, contact.first, contact.last, contact.website);
        if (emailStr) {
            if (!contact.email) { contact.email = emailStr; }
            else if (!contact.email2 && contact.email.toLowerCase() !== emailStr.toLowerCase()) { contact.email2 = emailStr; }
        }

        websiteStr = this.getDomain(text);
        if (websiteStr) {
            if (!contact.website) {
                if (!this.isFreeEmailDomain(websiteStr) && !this.isSuspiciousDomain(websiteStr))
                { contact.website = websiteStr; }
            }
        }

        phoneStr = this.getPhone(text);
        if (phoneStr) {
            if (!contact.phone) { contact.phone = this.formatPhone(phoneStr); }
            else if (!contact.phone2 && contact.phone.toLowerCase() !== phoneStr.toLowerCase()) {
                p1 = contact.phone.replace(/[^0-9]+/g, '');
                p2 = phoneStr.replace(/[^0-9]+/g, '');
                console.log('PHONE', p1, p2);
                if (p1.length < 10 || p2.length < 10 || p1.indexOf(p2) < 0)
                { contact.phone2 = this.formatPhone(phoneStr); }
            }
        }
    },

    readPatternField: function (field, contact) {

        var storeUnstructuredData = function () {
            try {
                if (!contact.data) { contact.data = []; }
                contact.data.push({ Name: field.Name, Value: field.Value });
            } catch (e) {
                console.log('ERROR', e.message);
            }
        };

        if (field.Name === 'Company') {
            if (field.Value && !contact.company)
            { contact.company = this.fixCompany(field.Value); }
        }
        else if (field.Name === 'Title') {
            if (field.Value && !contact.jobtitle && this.isTitle(field.Value))
            { contact.jobtitle = this.fixTitle(field.Value); }
        }
        else if (field.Name === 'Location') {
            if (field.Value && !contact.city)
            { contact.city = field.Value; }
        }
        else if (field.Name === 'FullName') {
            if (field.Value && !contact.last && !contact.first) {
                var fullNameStr = this.fixFullName(field.Value, '', '', '');
                var fullNameObj = this.splitFullName(fullNameStr);
                contact.last = fullNameObj.last;
                contact.first = fullNameObj.first;
                contact.middle = fullNameObj.middle;
            }
        }
        else if (field.Name === 'FirstName') {
            if (field.Value && !contact.first)
            { contact.first = field.Value; }
        }
        else if (field.Name === 'MiddleName') {
            if (field.Value && !contact.middle)
            { contact.middle = field.Value; }
        }
        else if (field.Name === 'LastName') {
            if (field.Value && !contact.last)
            { contact.last = this.fixFullName(field.Value, '', '', ''); }
        }
        else if (field.Name === 'Handle') {
            if (field.Value && !contact.handle)
            { contact.handle = field.Value; }
        }
        else if (field.Name === 'BIO' || field.Name === 'Bio') {
            if (field.Value) {
                if (!contact.bio)
                { contact.bio = field.Value; }
                this.scanText(field.Value, contact);
            }
        }
        else if (field.Name === 'Website' || field.Name === 'WebSite') {
            if (field.Value && field.Value.indexOf('Company Website') === -1) {
                var domain = this.getDomain(field.Value);

                if (!contact.website && !this.isSuspiciousDomain(domain))
                { contact.website = field.Value; }
                else {
                    this.addVenue(contact, { website: field.Value, type: 'website' });
                    //if (!contact.venues) { contact.venues = []; }
                    //contact.venues.push({ website: field.Value, type: 'website' });
                }
            }
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
                { contact.phone = this.formatPhone(field.Value); }
                else if (!contact.phone2 && !this.isTheSamePhone(contact.phone, field.Value)) // contact.phone.toLowerCase() !== field.Value.toLowerCase())
                { contact.phone2 = this.formatPhone(field.Value); }
            }
        }
        else if (field.Name === 'Twitter') {
            if (field.Value) {
                //if (!contact.venues) { contact.venues = []; }
                //contact.venues.push({ website: 'https://twitter.com/' + field.Value, type: 'social' });
                this.addVenue(contact, { website: 'https://twitter.com/' + field.Value, type: 'social' });
            }
        }
        else if (field.Name === 'LinkedIn') {
            //if (field.Value)
            //{ contact.sourceurl = field.Value; }
            if (field.Value) {
                this.addVenue(contact, { website: field.Value, type: 'social' });
            }
        }
        else if (field.Name === 'SocialVenue') {
            if (field.Value) {
                //if (!contact.venues) { contact.venues = []; }
                //contact.venues.push({ website: field.Value, type: 'social' });
                this.addVenue(contact, { website: field.Value, type: 'social' });
            }
        }
        else if (field.Name === 'SourceUrl') {
            if (field.Value)
            { contact.sourceurl = field.Value; }
        }
        else if (field.Name === 'Contact') {
            if (field.Value)
            { this.scanText(field.Value, contact); }
        }
        else if (field.Name === 'Address') {
            if (field.Value && !contact.address1) {
                contact.address1 = field.Value;
                //TODO: Parse the address out

                //contactUtility.address
            }
        }
        else if (field.Name === 'School') {
            if (field.Value) { contact.education = (contact.education || '') + field.Name + ': ' + field.Value + '\n'; storeUnstructuredData(); }
        } // Under "Educations"
        else if (field.Name === 'Degree') {
            if (field.Value) { contact.education = (contact.education || '') + field.Name + ': ' + field.Value + '\n'; storeUnstructuredData(); }
        } // Under "Educations"
        else if (field.Name === 'Tenior') {
            if (field.Value) { contact.experience = (contact.experience || '') + field.Name + ': ' + field.Value + '\n'; storeUnstructuredData(); }
        } // Under "Positions"
        else if (field.Name === 'TeniorLocation') {
            if (field.Value) { contact.experience = (contact.experience || '') + field.Name + ': ' + field.Value + '\n'; storeUnstructuredData(); }
        } // Under "Positions"
        else if (field.Name === 'Description') {
            if (field.Value) { contact.experience = (contact.experience || '') + field.Name + ': ' + field.Value + '\n'; storeUnstructuredData(); }
        } // Under "Positions"
        else if (field.Name === 'CompanyTitle') {
            if (field.Value) { contact.experience = (contact.experience || '') + field.Name + ': ' + field.Value + '\n'; storeUnstructuredData(); }
        }
        else {
            if (field.Value) {
                console.log('Unsupported field', field.Name, field);
                storeUnstructuredData();
            }
        }
    },

    isTheSamePhone: function (phone1, phone2) {
        if (!phone1 || !phone2)
        { return false; }

        var p1 = phone1.replace(/[^0-9]/ig, '');
        var p2 = phone2.replace(/[^0-9]/ig, '');

        if (p1.length === 11 && p1[0] === '1')
        { p1 = p1.substring(1); }
        if (p2.length === 11 && p2[0] === '1')
        { p2 = p2.substring(1); }

        console.log('COMPARE PHONES', p1, p2, p1 === p2, phone1, phone2);

        return p1 === p2;
    },

    formatPhone: function (phone) {

        if (!phone)
        { return ''; }

        var p = phone.replace(/[^0-9]/ig, '');

        if (p.length === 11 && p[0] === '1')
        { p = p.substring(1); }

        var s = phone;

        if (p.length === 10)
        { s = '(' + p.substring(0, 3) + ') ' + p.substring(3, 6) + '-' + p.substring(6); }

        console.log('FORMAT PHONES', phone, s);

        return s;

    },

    formatCountry: function (country) {

        if (!country)
        { return ''; }

        if (typeof country !== 'string')
        { return country; }

        var c = country.toLowerCase();

        if (c === 'united states' || c === 'usa' || c === 'u.s.' || c === 'u.s.a.' || c === 'united states of america') {
            country = 'US';
        }

        return country;
    },

    isTheSameFirstName: function (firstName1, firstName2) {

        var isTheSame = function (s1, s2) {

            s1 = s1.toLowerCase().trim();
            s2 = s2.toLowerCase().trim();

            if (s1 === s2) { return true; }

            var result = firstNameGraphDriver.compareFirstNames(s1, s2);
            return result;

            /*
    
            if (s1 === 'abraham' && s2 === 'abe') { return true; }
            else if (s1 === 'alan' && s2 === 'al') { return true; }
            else if (s1 === 'albert' && s2 === 'al') { return true; }
            else if (s1 === 'alexander' && s2 === 'alex') { return true; }
            else if (s1 === 'alexandra' && s2 === 'alex') { return true; }
            else if (s1 === 'alfred' && s2 === 'al') { return true; }
            else if (s1 === 'alice' && s2 === 'ali') { return true; }
            else if (s1 === 'alison' && s2 === 'ali') { return true; }
            else if (s1 === 'allan' && s2 === 'al') { return true; }
            else if (s1 === 'allen' && s2 === 'al') { return true; }
            else if (s1 === 'allison' && s2 === 'alli') { return true; }
            else if (s1 === 'allison' && s2 === 'allie') { return true; }
            else if (s1 === 'allyson' && s2 === 'ally') { return true; }
            else if (s1 === 'aloysius' && s2 === 'al') { return true; }
            else if (s1 === 'andrew' && s2 === 'andy') { return true; }
            else if (s1 === 'angela' && s2 === 'angie') { return true; }
            else if (s1 === 'ann' && s2 === 'annie') { return true; }
            else if (s1 === 'anne' && s2 === 'annie') { return true; }
            else if (s1 === 'anthony' && s2 === 'tony') { return true; }
            else if (s1 === 'archibald' && s2 === 'arch') { return true; }
            else if (s1 === 'archibald' && s2 === 'archie') { return true; }
            else if (s1 === 'arthur' && s2 === 'art') { return true; }
            else if (s1 === 'august' && s2 === 'auggie') { return true; }
            else if (s1 === 'august' && s2 === 'augie') { return true; }
            else if (s1 === 'augustus' && s2 === ' auggie') { return true; }
            else if (s1 === 'augustus' && s2 === 'augie') { return true; }
            else if (s1 === 'barbara' && s2 === 'babs') { return true; }
            else if (s1 === 'barbara' && s2 === 'barbie') { return true; }
            else if (s1 === 'barbara' && s2 === 'barb') { return true; }
            else if (s1 === 'benjamin' && s2 === 'benny') { return true; }
            else if (s1 === 'benjamin' && s2 === 'ben') { return true; }
            else if (s1 === 'bernard' && s2 === 'bernie') { return true; }
            else if (s1 === 'beverly' && s2 === 'bev') { return true; }
            else if (s1 === 'bill' && s2 === 'billy') { return true; }
            else if (s1 === 'bob' && s2 === 'bobby') { return true; }
            else if (s1 === 'bradley' && s2 === 'brad') { return true; }
            else if (s1 === 'burton' && s2 === 'burt') { return true; }
            else if (s1 === 'calvin' && s2 === 'cal') { return true; }
            else if (s1 === 'cassandra' && s2 === 'sandy') { return true; }
            else if (s1 === 'catherine' && s2 === 'cathy') { return true; }
            else if (s1 === 'charles' && s2 === 'chas') { return true; }
            else if (s1 === 'charles' && s2 === 'chuck') { return true; }
            else if (s1 === 'charles' && s2 === 'chucky') { return true; }
            else if (s1 === 'charles' && s2 === 'charlie') { return true; }
            else if (s1 === 'chester' && s2 === 'chet') { return true; }
            else if (s1 === 'chris' && s2 === 'chrissy') { return true; }
            else if (s1 === 'chuck' && s2 === 'chucky') { return true; }
            else if (s1 === 'cynthia' && s2 === 'cindy') { return true; }
            else if (s1 === 'dan' && s2 === 'danny') { return true; }
            else if (s1 === 'daniel' && s2 === 'danny') { return true; }
            else if (s1 === 'daniel' && s2 === 'dan') { return true; }
            else if (s1 === 'david' && s2 === 'davey') { return true; }
            else if (s1 === 'david' && s2 === 'davie') { return true; }
            else if (s1 === 'david' && s2 === 'dave') { return true; }
            else if (s1 === 'deborah' && s2 === 'deb') { return true; }
            else if (s1 === 'deborah' && s2 === 'debbie') { return true; }
            else if (s1 === 'dennis' && s2 === 'denny') { return true; }
            else if (s1 === 'dick' && s2 === 'dicky') { return true; }
            else if (s1 === 'don' && s2 === 'donny') { return true; }
            else if (s1 === 'don' && s2 === 'donnie') { return true; }
            else if (s1 === 'doug' && s2 === 'dougie') { return true; }
            else if (s1 === 'douglas' && s2 === 'doug') { return true; }
            else if (s1 === 'ed' && s2 === 'eddie') { return true; }
            else if (s1 === 'edgar' && s2 === 'eddie') { return true; }
            else if (s1 === 'edgar' && s2 === 'ed') { return true; }
            else if (s1 === 'edward' && s2 === 'eddie') { return true; }
            else if (s1 === 'edward' && s2 === 'ed') { return true; }
            else if (s1 === 'edwin' && s2 === 'eddie') { return true; }
            else if (s1 === 'edwin' && s2 === 'ed') { return true; }
            else if (s1 === 'elizabeth' && s2 === ' beth') { return true; }
            else if (s1 === 'elizabeth' && s2 === ' betsy') { return true; }
            else if (s1 === 'elizabeth' && s2 === ' betty') { return true; }
            else if (s1 === 'elizabeth' && s2 === ' libby') { return true; }
            else if (s1 === 'elizabeth' && s2 === ' liz') { return true; }
            else if (s1 === 'elizabeth' && s2 === 'beth') { return true; }
            else if (s1 === 'eugene' && s2 === 'gene') { return true; }
            else if (s1 === 'frances' && s2 === 'frannie') { return true; }
            else if (s1 === 'frances' && s2 === 'franny') { return true; }
            else if (s1 === 'frances' && s2 === 'fran') { return true; }
            else if (s1 === 'francine' && s2 === 'franny') { return true; }
            else if (s1 === 'francine' && s2 === 'fran') { return true; }
            else if (s1 === 'francis' && s2 === 'fran') { return true; }
            else if (s1 === 'fred' && s2 === 'freddie') { return true; }
            else if (s1 === 'fred' && s2 === 'freddy') { return true; }
            else if (s1 === 'frederic' && s2 === 'freddie') { return true; }
            else if (s1 === 'frederic' && s2 === 'freddy') { return true; }
            else if (s1 === 'frederic' && s2 === 'fred') { return true; }
            else if (s1 === 'frederick' && s2 === 'freddie') { return true; }
            else if (s1 === 'frederick' && s2 === 'freddy') { return true; }
            else if (s1 === 'frederick' && s2 === 'fred') { return true; }
            else if (s1 === 'gabriel' && s2 === 'gabe') { return true; }
            else if (s1 === 'gabriela' && s2 === 'gabbie') { return true; }
            else if (s1 === 'gabriella' && s2 === 'gabbie') { return true; }
            else if (s1 === 'gabrielle' && s2 === 'gabbie') { return true; }
            else if (s1 === 'geoffrey' && s2 === 'geoff') { return true; }
            else if (s1 === 'gerald' && s2 === ' gerry') { return true; }
            else if (s1 === 'gerald' && s2 === 'jerry') { return true; }
            else if (s1 === 'geraldine' && s2 === 'gerri') { return true; }
            else if (s1 === 'geraldine' && s2 === 'gerry') { return true; }
            else if (s1 === 'gordon' && s2 === 'gordy') { return true; }
            else if (s1 === 'gregory' && s2 === 'gregg') { return true; }
            else if (s1 === 'gregory' && s2 === 'greg') { return true; }
            else if (s1 === 'gwendolyn' && s2 === 'wendy') { return true; }
            else if (s1 === 'gwendolyn' && s2 === 'gwen') { return true; }
            else if (s1 === 'gwenyth' && s2 === 'gwen') { return true; }
            else if (s1 === 'harold' && s2 === 'harry') { return true; }
            else if (s1 === 'henry' && s2 === 'hank') { return true; }
            else if (s1 === 'herbert' && s2 === 'herb') { return true; }
            else if (s1 === 'jacob' && s2 === 'jake') { return true; }
            else if (s1 === 'jacqueline' && s2 === 'jackie') { return true; }
            else if (s1 === 'james' && s2 === 'jimmy') { return true; }
            else if (s1 === 'james' && s2 === 'jim') { return true; }
            else if (s1 === 'jefferson' && s2 === 'jeff') { return true; }
            else if (s1 === 'jeffery' && s2 === 'jeff') { return true; }
            else if (s1 === 'jeffrey' && s2 === 'jeff') { return true; }
            else if (s1 === 'jen' && s2 === 'jenny') { return true; }
            else if (s1 === 'jenifer' && s2 === 'jenny') { return true; }
            else if (s1 === 'jenifer' && s2 === 'jen') { return true; }
            else if (s1 === 'jennifer' && s2 === 'jenny') { return true; }
            else if (s1 === 'jennifer' && s2 === 'jen') { return true; }
            else if (s1 === 'jessica' && s2 === 'jessi') { return true; }
            else if (s1 === 'jessica' && s2 === 'jessie') { return true; }
            else if (s1 === 'jessica' && s2 === 'jess') { return true; }
            else if (s1 === 'jim' && s2 === 'jimmy') { return true; }
            else if (s1 === 'joe' && s2 === 'joey') { return true; }
            else if (s1 === 'john' && s2 === 'johnny') { return true; }
            else if (s1 === 'john' && s2 === 'jack') { return true; }
            else if (s1 === 'jonathan' && s2 === 'jon') { return true; }
            else if (s1 === 'jonathon' && s2 === 'jon') { return true; }
            else if (s1 === 'joseph' && s2 === 'joey') { return true; }
            else if (s1 === 'joseph' && s2 === 'joe') { return true; }
            else if (s1 === 'joshua' && s2 === 'josh') { return true; }
            else if (s1 === 'katherine' && s2 === 'kate') { return true; }
            else if (s1 === 'katherine' && s2 === 'kathy') { return true; }
            else if (s1 === 'katherine' && s2 === 'katie') { return true; }
            else if (s1 === 'katherine' && s2 === 'kat') { return true; }
            else if (s1 === 'ken' && s2 === 'kenny') { return true; }
            else if (s1 === 'kenneth' && s2 === 'kenny') { return true; }
            else if (s1 === 'kenneth' && s2 === 'ken') { return true; }
            else if (s1 === 'kimberly' && s2 === 'kim') { return true; }
            else if (s1 === 'kristen' && s2 === 'kris') { return true; }
            else if (s1 === 'kristin' && s2 === 'kris') { return true; }
            else if (s1 === 'kristina' && s2 === 'kristi') { return true; }
            else if (s1 === 'kristina' && s2 === 'kristy') { return true; }
            else if (s1 === 'kristina' && s2 === 'kris') { return true; }
            else if (s1 === 'kristine' && s2 === ' kristi') { return true; }
            else if (s1 === 'kristine' && s2 === ' kristy') { return true; }
            else if (s1 === 'kristine' && s2 === 'kris') { return true; }
            else if (s1 === 'kristofer' && s2 === 'kris') { return true; }
            else if (s1 === 'kristopher' && s2 === 'kris') { return true; }
            else if (s1 === 'laurence' && s2 === 'larry') { return true; }
            else if (s1 === 'lawrence' && s2 === 'larry') { return true; }
            else if (s1 === 'leonard' && s2 === 'lenny') { return true; }
            else if (s1 === 'leonard' && s2 === 'len') { return true; }
            else if (s1 === 'marcus' && s2 === 'marc') { return true; }
            else if (s1 === 'martin' && s2 === 'marty') { return true; }
            else if (s1 === 'marvin' && s2 === 'marv') { return true; }
            else if (s1 === 'matthew' && s2 === 'matt') { return true; }
            else if (s1 === 'megan' && s2 === 'meg') { return true; }
            else if (s1 === 'michael' && s2 === ' mic') { return true; }
            else if (s1 === 'michael' && s2 === ' mick') { return true; }
            else if (s1 === 'michael' && s2 === ' mickey') { return true; }
            else if (s1 === 'michael' && s2 === ' mikey') { return true; }
            else if (s1 === 'michael' && s2 === 'mike') { return true; }
            else if (s1 === 'mick' && s2 === 'mickey') { return true; }
            else if (s1 === 'mike' && s2 === 'mikey') { return true; }
            else if (s1 === 'nathan' && s2 === 'nate') { return true; }
            else if (s1 === 'nathaniel' && s2 === 'nat') { return true; }
            else if (s1 === 'nathaniel' && s2 === 'nate') { return true; }
            else if (s1 === 'nicholas' && s2 === 'nicky') { return true; }
            else if (s1 === 'nicholas' && s2 === 'nick') { return true; }
            else if (s1 === 'nichole' && s2 === 'nicki') { return true; }
            else if (s1 === 'nichole' && s2 === 'nicky') { return true; }
            else if (s1 === 'nichole' && s2 === 'nikki') { return true; }
            else if (s1 === 'nick' && s2 === 'nicky') { return true; }
            else if (s1 === 'nicole' && s2 === 'nicky') { return true; }
            else if (s1 === 'nicole' && s2 === 'nikki') { return true; }
            else if (s1 === 'nicole' && s2 === 'nicki') { return true; }
            else if (s1 === 'norbert' && s2 === 'norb') { return true; }
            else if (s1 === 'norman' && s2 === 'norm') { return true; }
            else if (s1 === 'pamela' && s2 === 'pam') { return true; }
            else if (s1 === 'patricia' && s2 === 'patty') { return true; }
            else if (s1 === 'patricia' && s2 === 'tricia') { return true; }
            else if (s1 === 'patricia' && s2 === 'trish') { return true; }
            else if (s1 === 'patricia' && s2 === 'pat') { return true; }
            else if (s1 === 'patrick' && s2 === 'pat') { return true; }
            else if (s1 === 'philip' && s2 === 'phil') { return true; }
            else if (s1 === 'phillip' && s2 === 'phil') { return true; }
            else if (s1 === 'randall' && s2 === 'randy') { return true; }
            else if (s1 === 'raymond' && s2 === 'ray') { return true; }
            else if (s1 === 'rebecca' && s2 === 'becki') { return true; }
            else if (s1 === 'rebecca' && s2 === 'becky') { return true; }
            else if (s1 === 'reginald' && s2 === 'reg') { return true; }
            else if (s1 === 'reginald' && s2 === 'reggie') { return true; }
            else if (s1 === 'rich' && s2 === 'richie') { return true; }
            else if (s1 === 'richard' && s2 === 'dicky') { return true; }
            else if (s1 === 'richard' && s2 === 'rich') { return true; }
            else if (s1 === 'richard' && s2 === 'richie') { return true; }
            else if (s1 === 'richard' && s2 === 'rick') { return true; }
            else if (s1 === 'richard' && s2 === 'ricky') { return true; }
            else if (s1 === 'richard' && s2 === 'dick') { return true; }
            else if (s1 === 'rick' && s2 === 'ricky') { return true; }
            else if (s1 === 'rob' && s2 === ' robbie') { return true; }
            else if (s1 === 'rob' && s2 === 'robby') { return true; }
            else if (s1 === 'robert' && s2 === ' bobby') { return true; }
            else if (s1 === 'robert' && s2 === ' rob') { return true; }
            else if (s1 === 'robert' && s2 === ' robbie') { return true; }
            else if (s1 === 'robert' && s2 === ' robby') { return true; }
            else if (s1 === 'robert' && s2 === ' robt') { return true; }
            else if (s1 === 'robert' && s2 === 'bob') { return true; }
            else if (s1 === 'rodney' && s2 === 'rod') { return true; }
            else if (s1 === 'roger' && s2 === 'rog') { return true; }
            else if (s1 === 'ron' && s2 === ' ronnie') { return true; }
            else if (s1 === 'ron' && s2 === 'ronny') { return true; }
            else if (s1 === 'ronald' && s2 === 'ronnie') { return true; }
            else if (s1 === 'ronald' && s2 === 'ronny') { return true; }
            else if (s1 === 'ronald' && s2 === 'ron') { return true; }
            else if (s1 === 'russell' && s2 === 'russ') { return true; }
            else if (s1 === 'sam' && s2 === 'sammy') { return true; }
            else if (s1 === 'samantha' && s2 === 'sam') { return true; }
            else if (s1 === 'samuel' && s2 === 'sammy') { return true; }
            else if (s1 === 'samuel' && s2 === 'sam') { return true; }
            else if (s1 === 'sandra' && s2 === 'sandy') { return true; }
            else if (s1 === 'stephanie' && s2 === 'steph') { return true; }
            else if (s1 === 'stephen' && s2 === 'steve') { return true; }
            else if (s1 === 'susan' && s2 === 'susie') { return true; }
            else if (s1 === 'susan' && s2 === 'sue') { return true; }
            else if (s1 === 'susan' && s2 === 'suzi') { return true; }
            else if (s1 === 'susan' && s2 === 'suzie') { return true; }
            else if (s1 === 'suzanne' && s2 === 'sue') { return true; }
            else if (s1 === 'suzanne' && s2 === 'suzi') { return true; }
            else if (s1 === 'suzanne' && s2 === 'suzie') { return true; }
            else if (s1 === 'theodore' && s2 === ' theo') { return true; }
            else if (s1 === 'theodore' && s2 === 'ted') { return true; }
            else if (s1 === 'thomas' && s2 === 'tom') { return true; }
            else if (s1 === 'thomas' && s2 === 'tommy') { return true; }
            else if (s1 === 'thomas' && s2 === 'thom') { return true; }
            else if (s1 === 'tim' && s2 === 'timmy') { return true; }
            else if (s1 === 'timothy' && s2 === 'timmy') { return true; }
            else if (s1 === 'timothy' && s2 === 'tim') { return true; }
            else if (s1 === 'tom' && s2 === 'tommy') { return true; }
            else if (s1 === 'tricia' && s2 === 'trish') { return true; }
            else if (s1 === 'trisha' && s2 === 'trish') { return true; }
            else if (s1 === 'victor' && s2 === 'vic') { return true; }
            else if (s1 === 'victoria' && s2 === 'vicky') { return true; }
            else if (s1 === 'walter' && s2 === 'walt') { return true; }
            else if (s1 === 'walter' && s2 === 'wally') { return true; }
            else if (s1 === 'wesley' && s2 === 'wes') { return true; }
            else if (s1 === 'william' && s2 === 'billy') { return true; }
            else if (s1 === 'william' && s2 === 'will') { return true; }
            else if (s1 === 'william' && s2 === 'willie') { return true; }
            else if (s1 === 'william' && s2 === 'willy') { return true; }
            else if (s1 === 'william' && s2 === 'wm') { return true; }
            else if (s1 === 'william' && s2 === 'bill') { return true; }
            else if (s1 === 'zachary' && s2 === 'zack') { return true; }
            else if (s1 === 'zachary' && s2 === 'zach') { return true; }
    
            return false;*/
        };

        if (!firstName1 || !firstName2)
        { return false; }

        return isTheSame(firstName1, firstName2) || isTheSame(firstName2, firstName1);
    },

    addVenue: function (contact, venue) {
        const preserveCase = true;
        contact.venues = contact.venues || [];
        if (venue && venue.website) {
            venue.website = contactUtility.fixUrl(venue.website, preserveCase);
            var i = contact.venues.length;
            while (i--) {
                if ((contact.venues[i].website || '').toLowerCase() === (venue.website || '').toLowerCase()) { return; }
            }
            contact.venues.push(venue);
        }
    },

    getVenue: function (contact, filterBy) {
        if (contact && contact.venues) {
            var i;
            for (i = 0; i < contact.venues.length; i++) {
                var w = contact.venues[i].website;
                if (w && w.indexOf(filterBy) >= 0) {

                    if (filterBy === 'linkedin.com') {
                        if (!contactUtility.isLinkedInIndividualProfile(w)) {
                            continue;
                        }
                    } else if (filterBy === 'twitter.com') {
                        if (!contactUtility.isTwitterIndividualProfile(w, contact.company, contact.first, contact.last)) {
                            continue;
                        }
                    } else if (filterBy === 'facebook.com') {
                        if (!contactUtility.isFacebookIndividualProfile(w, contact.company, contact.first, contact.last)) {
                            continue;
                        }
                    }

                    return w;
                }
            }
        }
        return null;
    },

    daysBetween: function (date1, date2, keepsign) {

        // The number of milliseconds in one day
        var ONE_DAY = 1000 * 60 * 60 * 24;

        // Convert both dates to milliseconds
        var date1_ms = date1.getTime();
        var date2_ms = date2.getTime();

        // Calculate the difference in milliseconds
        var difference_ms;

        if (keepsign) {
            difference_ms = date1_ms - date2_ms;
        } else {
            difference_ms = Math.abs(date1_ms - date2_ms);
        }

        // Convert back to days and return
        return Math.round(difference_ms / ONE_DAY);

    },

    duplicateOf: function (candidate, contacts) {
        var i, j, contact,
            p1, p2, s1, s2,
            dup = null;

        var isIndividualProfile = function (url) {
            // Is this source URL an indinividual profile
            if (!url) { return false; }
            if (url.indexOf('#SELECTION') > 0) { return false; }
            if (url.indexOf('inkedin.com/in/') > 0) { return true; }
            if (url.indexOf('inkedin.com/pub/') > 0) { return true; }
            if (url.indexOf('inkedin.com/profile/') > 0) { return true; }
            return false;
        };

        var testUrls = function (url1, url2) {

            // For known sites with individual profiles
            if (isIndividualProfile(url1) && isIndividualProfile(candidate.sourceurl)) {

                p1 = url1.indexOf('.com');
                p2 = url2.indexOf('.com');

                if (p1 > 0 && p2 > 0) {

                    s1 = url1.substring(p1);
                    s2 = url2.substring(p2);

                    if (s1.length > 9 && s1 === s2)
                    { return true; }

                } else {

                    s1 = url1;
                    s2 = url2;

                    if (s1.length > 9 && s2.length > 9 && (s1.indexOf(s2) >= 0 || s2.indexOf(s1) >= 0))
                    { return true; }

                }

            }

            return false;
        };

        for (i = 0; i < contacts.length; i++) {

            contact = contacts[i];

            if (contact.id > 0 && contact.id === candidate.id) { continue; }



            if (contact.last && contact.first && candidate.last && candidate.first) {

                if (candidate.last === contact.last && this.isTheSameFirstName(candidate.first, contact.first)) {

                    if ((candidate.email && candidate.email === contact.email) ||
                        (candidate.email2 && candidate.email2 === contact.email) ||
                        (candidate.email && candidate.email === contact.email2) ||
                        (candidate.email2 && candidate.email2 === contact.email2) ||
                        (candidate.phone && candidate.phone === contact.phone) ||
                        (candidate.phone2 && candidate.phone2 === contact.phone) ||
                        (candidate.phone && candidate.phone === contact.phone2) ||
                        (candidate.phone2 && candidate.phone2 === contact.phone2) ||
                        (candidate.website && candidate.website === contact.website) ||
                        (candidate.company && candidate.company === contact.company) ||
                        (candidate.title && candidate.title === contact.title) ||
                        (!(candidate.email || candidate.email2 || candidate.phone || candidate.phone2 || candidate.website || candidate.company || candidate.title))
                        ) {

                        dup = contact;
                        if (debug) { console.log('dup! (1)', contact, candidate); }
                        break;
                    }
                }
            }



            if (!dup && ((contact.sourceurl || contact.venues) && (candidate.sourceurl || candidate.venues))) {

                var l1 = [];
                var l2 = [];

                if (contact.sourceurl) { l1.push(contact.sourceurl); }
                if (contact.venues) {
                    j = contact.venues.length;
                    while (j--)
                    { l1.push(contact.venues[j].website); }
                }

                if (candidate.sourceurl) { l2.push(candidate.sourceurl); }
                if (candidate.venues) {
                    j = candidate.venues.length;
                    while (j--)
                    { l2.push(candidate.venues[j].website); }
                }

                for (var i1 = 0; i1 < l1.length; i1++) {
                    for (var i2 = 0; i2 < l2.length; i2++) {
                        if (testUrls(l1[i1], l2[i2])) {
                            dup = contact;
                            if (debug) { console.log('dup! (2)',contact, candidate); }
                            break;
                        }
                    }
                    if (dup)
                    { break; }
                }

            }

        }

        return dup;
    },

    validateEmail: function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

};

var testPattern = function () {
    console.log('TEST');
    var alpha = true;
    var callback = function (response) {
        try {
            var record = response.Values.Data[0].Data;
            console.log('Pattern Engine Record > ', record);
            var captureRecord = contactUtility.createNewContact();
            contactUtility.readPatternRecord(record, captureRecord);
            console.log('Capture Record > ', captureRecord);
        } catch (e) {
            console.error('Error > ', e.message);
        }

    };
    loadPatternsAndApply(alpha, callback);
}

window.setTimeout(testPattern, 3000);