'use strict';

/* global angular: false */

//     Create a namespace for our utilities (defined in untilites sub folder)
var utilitiesModule = angular.module('utilities', []);

'use strict';

/* global angular: false */

angular.module('utilities')
.factory('xmlUtility', [function () {
    return {
        prolog:   '<?xml version="1.0"?>',
        xmlencode: function (string) {
            if (!string) { return ''; }
            return string.replace(/\&/g, '&' + 'amp;').replace(/</g, '&' + 'lt;').replace(/>/g, '&' + 'gt;').replace(/\'/g, '&' + 'apos;').replace(/\"/g, '&' + 'quot;');
        },
        xmldecode: function (string) {
            if (!string) { return ''; }
            return string.replace(/\&amp;/g, '&').replace(/\&lt;/g, '<').replace(/\&gt;/g, '>').replace(/\&apos;/g, '\'').replace(/\&quot;/g, '"');
        },

        //  Duplicate of xmlEncode, which just xml encodes a string
        encode: function (string) {
            if (typeof string === 'undefined') { string = ''; }
            string += '';
            if (!string) { return ''; }
            return string.replace(/\&/g, '&' + 'amp;').replace(/</g, '&' + 'lt;').replace(/>/g, '&' + 'gt;').replace(/\'/g, '&' + 'apos;').replace(/\"/g, '&' + 'quot;');
        },
        //  Wraps tags around a string
        tag: function(string, tag, onlyIfValid){

            if(onlyIfValid && !string) { return ''; }
            return '<' + tag + '>' + string + '</' + tag +'>';
        },
        //  XML encodes a string then wraps it in tags
        encodeAndWrap: function(string, tag, onlyIfValid){
            if(onlyIfValid && !string) { return ''; }
            return this.tag(this.encode(string), tag);
        },
        //  xml encode a string, wrap it in tags, and push it into an array
        encodeWrapPush: function(stringToEncode, tagToWrap, arrayToPush, onlyIfValid){
            if(onlyIfValid && !stringToEncode){ return; }
            arrayToPush.push(this.encodeAndWrap(stringToEncode, tagToWrap));
        },
        //  Wrap a string in tags, and push into an array
        wrapAndPush: function(data, tagToWrap, arrayToPush, onlyIfValid){
            if(onlyIfValid && !data){ return; }
            arrayToPush.push(this.tag(data, tagToWrap));
        },

        //  encodes paramaters object into xml header {key:value, key2:value2} BECOMES  <?xml version="1.0"?><request><key>value</key><key2>value2</key2></request>
        encodeParameters: function(parameters){
            var result = '';
            for(var key in parameters){
                if(parameters[key]) {
                    result += this.encodeAndWrap(parameters[key], key);
                }
            }
            return this.prolog + this.tag(result, 'request');
        },




        getTagValueWithPosition: function (html, tag, className, attr) {

            var pos = null;

            if (!html) { return { value: '', position: pos };  }


            var n = html.length;
            var tagCharIndex = 0;
            var attrCharIndex = 0;
            var classCharIndex = 0;

            var state = 'tag-search';
            if (!attr) {
                attr = ' class=';
            }
            var value = [];

            var tagCounter = 0;
            var i = 0;
            while (i < n) {

                switch (state) {

                     case 'tag-search':

                         if (html[i] === tag[tagCharIndex]) {
                             if (tagCharIndex === (tag.length - 1)) {
                                 attrCharIndex = 0;
                                 if (className) {
                                     state = 'attr-search';
                                 } else {
                                     state = 'value-search';
                                 }
                             } else {
                                 tagCharIndex++;
                             }
                         }
                         else {
                             tagCharIndex = 0;
                         }

                         break;

                     case 'attr-search':

                         if (html[i] === attr[attrCharIndex]) {
                             if (attrCharIndex === (attr.length - 1)) {
                                 state = 'class-search';
                                 classCharIndex = 0;
                                 i++; // skip an opening quote
                             } else {
                                 attrCharIndex++;
                             }
                         }
                         else {
                             attrCharIndex = 0;

                             if (html[i] === '>') {
                                 tagCharIndex = 0;
                                 state = 'tag-search';
                             }
                         }


                         break;

                     case 'class-search':

                         if (html[i] === className[classCharIndex]) {
                             if (classCharIndex === (className.length - 1)) {
                                 state = 'value-search';
                             } else {
                                 classCharIndex++;
                             }
                         }
                         else {
                             classCharIndex = 0;

                             if (html[i] === '>' || html[i] === '"' || html[i] === '\'') {
                                 tagCharIndex = 0;
                                 state = 'tag-search';
                             }
                         }

                         break;

                     case 'value-search':

                         if (html[i] === '>') {
                             state = 'value-read';
                         }

                         break;

                     case 'value-read':

                         if (html[i] === '<' && html.substring(i, i + tag.length + 3) === ('</' + tag + '>')) {
                             tagCounter--;
                             if (tagCounter < 0) {
                                 pos = i;
                                 state = 'done';
                                 break;
                             }
                             //return xmlUtility.xmldecode(value.join('')).trim();
                         }
                         else if (html[i] === '<' && html.substring(i, i + tag.length + 1) === ('<' + tag)) {
                             tagCounter++;
                         }
                         
                         value.push(html[i]);
                         

                         break;

                     default:
                }
                i++;
            }
            return { value: this.xmldecode(value.join('')).trim(), position: pos };
        },
        getTagValue: function (html, tag, className, attr) {
            return this.getTagValueWithPosition(html, tag, className, attr).value;
        },

        getTagValues: function (html, tag, className, attr) {

            if (!html) { return []; }

            var results = [];

            var n = html.length;
            var tagCharIndex = 0;
            var attrCharIndex = 0;
            var classCharIndex = 0;

            var state = 'tag-search';
            if (!attr) {
                attr = ' class=';
            }
            var value = [];
            var tagCounter = 0;

            var i = 0;
            while (i < n) {

                switch (state) {

                     case 'tag-search':

                         if (html[i] === tag[tagCharIndex]) {
                             if (tagCharIndex === (tag.length - 1)) {
                                 attrCharIndex = 0;
                                 if (className) {
                                     state = 'attr-search';
                                 } else {
                                     state = 'value-search';
                                 }
                             } else {
                                 tagCharIndex++;
                             }
                         }
                         else {
                             tagCharIndex = 0;
                         }

                         break;

                     case 'attr-search':

                         if (html[i] === attr[attrCharIndex]) {
                             if (attrCharIndex === (attr.length - 1)) {
                                 state = 'class-search';
                                 classCharIndex = 0;
                                 i++; // skip an opening quote
                             } else {
                                 attrCharIndex++;
                             }
                         }
                         else {
                             attrCharIndex = 0;

                             if (html[i] === '>') {
                                 tagCharIndex = 0;
                                 state = 'tag-search';
                             }
                         }


                         break;

                     case 'class-search':

                         if (html[i] === className[classCharIndex]) {
                             if (classCharIndex === (className.length - 1)) {
                                 state = 'value-search';
                             } else {
                                 classCharIndex++;
                             }
                         }
                         else {
                             classCharIndex = 0;

                             if (html[i] === '>' || html[i] === '"' || html[i] === '\'') {
                                 tagCharIndex = 0;
                                 state = 'tag-search';
                             }
                         }

                         break;

                     case 'value-search':

                         if (html[i] === '>') {
                             state = 'value-read';
                             tagCounter = 0;
                         }

                         break;

                     case 'value-read':

                         if (html[i] === '<' && html.substring(i, i + tag.length + 3) === ('</' + tag + '>')) {
                             tagCounter--;

                             if (tagCounter < 0) {
                                 var res = this.xmldecode(value.join('')).trim();
                                 results.push({ value: res, position: i });
                                 value = [];
                                 state = 'tag-search';
                                 tagCharIndex = 0;
                                 attrCharIndex = 0;
                                 classCharIndex = 0;
                                 i = i + tag.length + 2;
                             } else {
                                 //console.log('tag counter >= 0', results.length, html.substring(i, i + 20));
                             }
                         }
                         else if (html[i] === '<' && html.substring(i, i + tag.length + 1) === ('<' + tag)) {
                             tagCounter++;
                         }
                         else {
                             value.push(html[i]);
                         }

                         break;

                     default:
                }
                i++;
            }
            return results;
        },

        getAttrValue: function (html, tag, attr) {

            if (!html) { return ''; }

            var n = html.length;
            var tagCharIndex = 0;
            var attrCharIndex = 0;


            var state = 'tag-search';
            if (!attr) {
                attr = 'href';
            }
            attr = ' ' + attr + '=';
            var value = [];

            //console.log('html: ' + html);
            //console.log('tag: ' + tag);
            //console.log('attr: ' + attr);

            var i = 0;
            while (i < n) {

                switch (state) {

                     case 'tag-search':
                         //console.log(state);
                         if (html[i] === tag[tagCharIndex]) {
                             if (tagCharIndex === (tag.length - 1)) {
                                 attrCharIndex = 0;
                                 state = 'attr-search';
                             } else {
                                 tagCharIndex++;
                             }
                         }
                         else {
                             tagCharIndex = 0;
                         }

                         break;

                     case 'attr-search':
                         //console.log(state);
                         if (html[i] === attr[attrCharIndex]) {
                             if (attrCharIndex === (attr.length - 1)) {
                                 state = 'value-read';
                                 if (html[i + 1] === '"' || html[i + 1] === '\'') {
                                     i++; // skip an opening quote
                                 }
                             } else {
                                 attrCharIndex++;
                             }
                         }
                         else {
                             attrCharIndex = 0;

                             if (html[i] === '>') {
                                 tagCharIndex = 0;
                                 state = 'tag-search';
                             }
                         }


                         break;

                     case 'value-read':
                         //console.log(html[i]);
                         //console.log(state);
                         if (html[i] === '<' || html[i] === '"' || html[i] === '\'' || html[i] === ' ') {
                             //return xmlUtility.xmldecode(value.join('')).trim();
                             state = 'done';
                         }
                         else {
                             value.push(html[i]);
                         }

                         break;

                     default:
                         //console.log('default: ' + state);
                         break;
                }
                i++;
            }
            return this.xmldecode(value.join('')).trim();
        },

        removeTags: function (s) {
            //console.log('removeTags');
            //console.log(s);
            if (s) {
                var regex = /(<([^>]+)>)/ig;
                s = s.replace(regex, '');
            }
            //console.log(s);
            return s;
        },

        getTags: function (s) {
            if (s) {
                var tagArray = s.match(/(<([^>]+)>)/ig);
                if (tagArray) {
                    return tagArray;
                }
            }
            return [];
        },

        getTagName: function(tag){
            tag = tag.substring(1);
            return tag.substring(0, tag.length - 1);

        }

    };
}]);

'use strict';

/* global angular: false */
/* global firstNameGraphDriver: false */

angular.module('utilities')
.factory('contactUtility', ['xmlUtility', function (xmlUtility) {
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

    var debug = 'contact-utility.js';

    var self = {

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

                contact.linkedin = self.getVenue(contact, 'linkedin.com');
                contact.twitter = self.getVenue(contact, 'twitter.com');
                contact.facebook = self.getVenue(contact, 'facebook.com');
                contact.employeesAvg = self.getEmployeesAvg(contact.employees);
                contact.revenueAvg = self.getRevenueAvg(contact.revenue);
                contact._hasOtherVenues = false;

                contact.website = self.fixUrl(contact.website);
                contact.full = self.fixFullName('', contact.first, contact.last, contact.middle);
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
                    contact.venues[i].personal = self.isIndividualProfile(w, contact.company, contact.first, contact.last);
                    // Delete company website form the list of venues
                    if (w === contact.website) {
                        console.warn('Deleting venue', angular.copy(contact.venues[i]));
                        contact.venues.splice(i, 1);
                    }
                }

                // Sort: facebook, linkedin, twiiter, others
                var pos = 0;
                var copy = null;
                if (contact.facebook) {
                    angular.forEach(contact.venues, function (venue, index) {
                        if (venue.website === contact.facebook) {
                            if (index !== pos) {
                                copy = angular.copy(venue);
                                contact.venues.splice(index, 1);
                                contact.venues.splice(pos, 0, copy);
                            }
                            pos++;
                        }
                    });
                }
                if (contact.linkedin) {
                    angular.forEach(contact.venues, function (venue, index) {
                        if (venue.website === contact.linkedin) {
                            if (index !== pos) {
                                copy = angular.copy(venue);
                                contact.venues.splice(index, 1);
                                contact.venues.splice(pos, 0, copy);
                            }
                            pos++;
                        }
                    });
                }
                if (contact.twitter) {
                    angular.forEach(contact.venues, function (venue, index) {
                        if (venue.website === contact.twitter) {
                            if (index !== pos) {
                                copy = angular.copy(venue);
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
                k = ', Inc.'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ', Inc'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ' Inc.'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ' Inc'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ', LLC'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ' LLC'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ', The'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ' LTD'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ' Co'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ' Corporation'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ' Corp'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ' GmbH'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ' Group'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ' PLC'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
                k = ' LLP'; if (self.endsWith(value, k) > 0) { return value.substring(0, value.length - k.length); }
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

                var abbr = self.abbreviate(company).toLowerCase();
                if (abbr.length > 1 && url.indexOf('twitter.com/' + abbr) >= 0) {
                    return false;
                }

                var firstWord = self.firstWord(company).toLowerCase();
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

                var abbr = self.abbreviate(company).toLowerCase();
                if (abbr.length > 1 && url.indexOf('facebook.com/' + abbr) >= 0) {
                    return false;
                }

                var firstWord = self.firstWord(company).toLowerCase();
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
                var abbr = self.abbreviate(company).toLowerCase();
                var firstWord = self.firstWord(company).toLowerCase();
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
                if (self.isNumber(range)) { return range; }
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
                if (self.isNumber(range)) { return range; }
                var separator = ' to ';
                if (range.indexOf(separator) < 0) {
                    separator = '-';
                }
                var sides = range.split(separator);

                if (sides.length === 2) {
                    //var low = parseInt(sides[0].trim().replace(/\$/g, ''), 10);
                    //var high = parseInt(sides[1].trim().replace(/\$/g, ''), 10);
                    var low = self.parseCurrency(sides[0]);
                    var high = self.parseCurrency(sides[1]);
                    high = self.fixHighRange(high, low);
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

            //console.log('reading record', angular.copy(record));
            if (record) {
                for (var j = 0; j < record.length; j++) {
                    this.readPatternField(record[j], contact);
                    if (record[j].Data)
                    { this.readPatternRecord(record[j].Data, contact); }
                }
            }

            self.sortVenues(contact);

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
                    console.log('Unsupported field', field.Name, angular.copy(field));
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
                venue.website = self.fixUrl(venue.website, preserveCase);
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
                            if (!self.isLinkedInIndividualProfile(w)) {
                                continue;
                            }
                        } else if (filterBy === 'twitter.com') {
                            if (!self.isTwitterIndividualProfile(w, contact.company, contact.first, contact.last)) {
                                continue;
                            }
                        } else if (filterBy === 'facebook.com') {
                            if (!self.isFacebookIndividualProfile(w, contact.company, contact.first, contact.last)) {
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
                            if (debug) { console.log('dup! (1)', angular.copy(contact), angular.copy(candidate)); }
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
                                if (debug) { console.log('dup! (2)', angular.copy(contact), angular.copy(candidate)); }
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

    return self;
}]);

'use strict';

/* global angular: false */

angular.module('utilities')
.factory('chromeUtility', [function () {
    var debug = 'chromeUtility->'; //debug = false;
    var store = {};
    var authToken = '';
    var cachedFields = {};

    var sendMessage = function (tab, method, data, successCallback, failureCallback) {
        if (debug) { console.log(debug + 'sendMessage...', { tab: tab, method: method, data: data }); }
        var timer = setTimeout(function () {
            if (debug) { console.log(debug + 'sendMessage: Timeout!'); }
            try { failureCallback('Something went wrong (Timeout). Please reload the page and try again.'); } catch (e) { }
        }, 5000);
        chrome.tabs.sendMessage(tab.id, { method: method, data: (data || {}) }, function (response) {
            if (debug) { console.log(debug + 'sendMessage: ', response); }
            clearTimeout(timer);
            if (response) {
                try { successCallback(response); } catch (e) { }
            } else {
                try { failureCallback('Please reload this page. Your Capture version has been upgraded since this page was last loaded.'); } catch (e) { }
            }

        });
    };

    var service = {

        isLoggedIn: function () {
            if (!store.authToken) { return false; }
            return (store.authToken.length > 0);
        },


        //  Login to the service
        login: function (interactive, successCallback, failureCallback) {

            if (debug) { console.log(debug + 'interactive?', interactive); }

            if (this.isLoggedIn()) {
                if (debug) { console.log(debug + 'already logged in'); }
                try { successCallback(store.authToken); } catch (e) { }
                return;
            }

            if (!chrome.identity) {
                console.log('ERROR chromeUtility.login->interactive: chrome.identity is not defined');
                try { failureCallback('Cannot access Chrome Identity API'); } catch (e) { } return;
            }

            chrome.identity.getAuthToken({ 'interactive': interactive }, function (token) {
                if (debug) { console.log(debug + 'token?', token); }
                if (token) {
                    store.authToken = token;
                    try { successCallback(store.authToken); } catch (e) { }
                    //return;
                } else {
                    if (chrome.runtime.lastError && chrome.runtime.lastError.message) {
                        console.log('ERROR in chrome.identity.getAuthToken', chrome.runtime.lastError.message);
                        try { failureCallback(chrome.runtime.lastError.message); } catch (e) { }
                    } else {
                        console.log('ERROR in chrome.identity.getAuthToken');
                        try { failureCallback('Unable to retrieve token'); } catch (e) { }
                    }

                }
            });
        },

        logOut: function () {
            store.authToken = '';
        },

        //  Getter
        getAuthToken: function () {
            return store.authToken;
        },
        setAuthToken: function (token) {
            store.authToken = token;
        },


        //  Get key/value from cloud
        getField: function (key, successCallback, failureCallback) {

            if (Array.isArray(key)) {

                console.log('**************** GET (array) ', key);
                var res = {};
                var notfoundKeys = [];

                var syncCallback = function (response) {

                    if (chrome.runtime.lastError) {
                        console.log('********************* ERROR reading from Chrome Sync storage:', { key: notfoundKeys, error: chrome.runtime.lastError });
                        try { failureCallback(chrome.runtime.lastError); } catch (e) { }
                        return;
                    }

                    for (var prop in response) {
                        if (response.hasOwnProperty(prop)) {
                            res.prop = response[prop];
                            cachedFields[prop] = response[prop];
                        }
                    }

                    try { successCallback(res); } catch (e) { }
                };

                for (var i = 0, arrayLength = key.length; i < arrayLength; i++) {
                    var k = key[i];
                    if (cachedFields[k]) {
                        res.k = cachedFields[k];
                    } else {
                        notfoundKeys.push(k);
                    }
                }

                if (notfoundKeys.length === 0) {
                    try { successCallback(res); } catch (e) { }
                } else {
                    if (!chrome.storage) {
                        try { failureCallback('Cannot access Chrome Cloud Storage'); } catch (e) { }
                        return;
                    }
                    // Not all keys were resolved locally --> Get data from the cloud
                    chrome.storage.sync.get(notfoundKeys, syncCallback);
                }


                return;
            }

            console.log('**************** GET ' + key);
            //  Try cache first to avoid all the crazy bandwidth
            if (cachedFields[key]) {
                try { successCallback(cachedFields[key]); } catch (e) { }
                return;
            }

            if (!chrome.storage)
            { try { failureCallback('Cannot access Chrome Cloud Storage'); } catch (e) { } return; }

            //  Get it from the cloud
            chrome.storage.sync.get(key, function (response) {
                if (chrome.runtime.lastError) {
                    console.log('********************* ERROR reading from Chrome Sync storage:', { key: key, error: chrome.runtime.lastError });
                    try { failureCallback(chrome.runtime.lastError); } catch (e) { }
                } else {
                    cachedFields[key] = response[key];
                    try { successCallback(response[key]); } catch (e) { }
                }
            });

        },
        //  Set key/value from cloud
        setField: function (key, data, successCallback, failureCallback) {
            console.log('**************** SET ' + key, angular.copy(data));
            var obj = {};
            obj[key] = data;
            //  Save it in cache for later use
            cachedFields[key] = data;

            if (!chrome.storage)
            { try { failureCallback('Cannot access Chrome Cloud Storage'); } catch (e) { } return; }

            chrome.storage.sync.set(obj, function () {
                if (chrome.runtime.lastError) {
                    console.log('********************* ERROR saving to Chrome Sync storage:', { obj: obj, error: chrome.runtime.lastError });
                    try { failureCallback(chrome.runtime.lastError); } catch (e) { }
                } else {
                    try { successCallback(); } catch (e) { }
                }
            });
        },

        //  Get key/value from local storage
        getFieldLocal: function (key, successCallback, failureCallback) {
            //  Try cache first to avoid all the crazy bandwidth
            if (cachedFields[key]) {
                try { successCallback(cachedFields[key]); } catch (e) { }
                return;
            }
            if (!chrome.storage)
            { try { failureCallback('Cannot access Chrome Local Storage'); } catch (e) { } return; }
            //  Get it from the local storage
            chrome.storage.local.get(key, function (response) {
                cachedFields[key] = response[key];
                try { successCallback(response[key]); } catch (e) { }
            });

        },
        //  Set key/value from cloud
        setFieldLocal: function (key, data, successCallback, failureCallback) {

            var obj = {};
            obj[key] = data;
            //  Save it in cache for later use
            cachedFields[key] = data;

            if (!chrome.storage)
            { try { failureCallback('Cannot access Chrome Local Storage'); } catch (e) { } return; }

            chrome.storage.local.set(obj, function () {
                if (chrome.runtime.lastError) {
                    if (debug) { console.log('Chrome set error:', { obj: obj, error: chrome.runtime.lastError }); }
                    try { failureCallback(); } catch (e) { }
                } else {
                    try { successCallback(); } catch (e) { }
                }
            });
        },

        //  Completely clears a key in chrome sync storage
        clearField: function (key) {
            this.setField(key, {});
        },

        getTabs: function (successCallback, failureCallback) {
            if (debug) { console.log(debug + 'getTabs...'); }
            chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
                function (tabs) {
                    if (debug) { console.log(debug + 'getTabs:', tabs); }
                    if (!tabs || !tabs.length) {
                        try { failureCallback('Chrome has no open tabs.'); } catch (e) { }
                    } else {
                        try { successCallback(tabs); } catch (e) { }
                    }
                });
        },
        getTab: function (successCallback, failureCallback) {
            if (debug) { console.log(debug + 'getTab...'); }
            this.getTabs(function (tabs) {
                if (debug) { console.log(debug + 'getTab:', tabs[0]); }
                try { successCallback(tabs[0]); } catch (e) { }
            }, failureCallback);
        },
        tabLoaded: function (successCallback, failureCallback) {
            if (debug) { console.log(debug + 'tabLoaded...'); }
            this.getTab(function (tab) {
                sendMessage(tab, 'ping', null, function (response) {
                    if (debug) { console.log(debug + 'tabLoaded:', response); }
                    try { successCallback(tab); } catch (e) { }
                }, failureCallback);
            }, failureCallback);
        },


        getCaptureInput: function (options, successCallback, failureCallback) {
            options = options || {};
            if (debug) { console.log(debug + 'getCaptureInput...', options); }
            var service = this;
            this.tabLoaded(function (tab) {
                if (options.selection) {
                    service.getTabSelection(tab, successCallback, failureCallback);
                } else {
                    service.getTabPageParent(tab, successCallback, failureCallback);
                }
            }, failureCallback);
        },

        getTabSelection: function (tab, successCallback, failureCallback) {
            if (debug) { console.log('Retrieving capture input selection...'); }
            var service = this;
            chrome.tabs.sendRequest(tab.id, { method: 'getSelection' },
               function (response) {
                   if (response && response.data && response.data.length > 1) {
                       if (debug) { console.log('Capture input selection found!'); }
                       successCallback({ data: response.data, url: tab.url + '#SELECTION' });
                       return;
                   }

                   failureCallback('Selection is empty or has no recognizable contact data');
                   return;
                   //service.getTabPageParent(tab, successCallback, failureCallback);
               }
            );
        },
        getTabPageParent: function (tab, successCallback, failureCallback) {
            if (debug) { console.log('Retrieving capture input parent page...'); }
            var service = this;
            chrome.tabs.sendRequest(tab.id, { method: 'getParentPage' }, function (response) {
                if (response && response.data && response.data.length > 1) {
                    if (debug) { console.log('Capture input parent page found!'); }
                    successCallback({ data: response.data, url: tab.url });
                    return;
                } else {
                    service.getTabPage(tab, successCallback, failureCallback);
                }

            });
        },

        getTabPage: function (tab, successCallback, failureCallback) {
            if (debug) { console.log('Retrieving capture input page...'); }
            chrome.tabs.sendRequest(tab.id, { method: 'getPage' }, function (response) {
                if (response && response.data && response.data.length > 1) {
                    if (debug) { console.log('Capture input page found!'); }
                    try { successCallback({ data: response.data, url: tab.url }); } catch (e) { }
                    return;
                } else {
                    if (debug) { console.log('page is not empty'); }
                    failureCallback('You must reload the page before it can be captured!');
                }

            });
        },

        doPatternCapture: function (patterns, successCallback, failureCallback) {

            if (debug) { console.log('Calling Pattern Capture...'); }
            var service = this;
            //chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
            //   function (tabs) {
            //       if(debug) {console.log('Received tabs:',tabs);}
            //       if (!tabs || tabs.length === 0) {
            //           if(debug) {console.log('no tabs');}
            //           failureCallback('You have no open tabs to capture.');
            //           return;
            //       }
            //       // call pattern capture
            //       chrome.tabs.sendRequest(tabs[0].id, { method: 'doPatternCapture', patterns: patterns }, function (response) {
            //           if (response && response.data) {
            //               if (debug) { console.log('Pattern Capture executed!', angular.copy(response)); }
            //               try { successCallback(response); } catch (e) { console.log(e); failureCallback(e.message); }
            //               return;
            //           } else {
            //               if (debug) { console.log('Pattern Capture returned no contacts', response); }
            //               failureCallback('Cannot capture this page.');
            //           }

            //       });

            //   });

            if (debug) { console.log(debug + 'doPatternCapture...', { patterns: patterns }); }
            this.tabLoaded(function (tab) {
                sendMessage(tab, 'patternParser', { patterns: patterns, options: { Retrieve: true } }, function (response) {
                    if (debug) { console.log(debug + 'doPatternCapture:', response); }
                    if (!response.layout) {
                        try { failureCallback('No pattern exists for this site.'); } catch (e) { }
                        return;
                    }
                    try { successCallback({ data: response }); } catch (e) { }
                }, failureCallback);

            }, failureCallback);
        },
        openLink: function (url, inCurrentTab) {
            if (!inCurrentTab)
            { chrome.tabs.create({ url: url }, function () { }); }
            else
            {
                chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT, active: true }, function (tabs) {
                    if (!tabs || tabs.length === 0)
                    { chrome.tabs.create({ url: url }, function () { }); }
                    else
                    { chrome.tabs.update(tabs[0].id, { url: url }, function () { }); }
                });

            }
        }



    };
    return service;

}]);

'use strict';

/* global angular: false */

angular.module('utilities')
.factory('environmentUtility', ['$http', '$rootScope', function ($http, $rootScope) {
    //  Private
    var debug = false;
    var loaded = false;
    var loadCallbacks = [];
    var environmentJsonPath = 'components/environment.json';
    var environment = { release: 'local' };

    //  Execute load callbacks
    var loadedCallbacks = function(){
        for(var index in loadCallbacks){
            var callback = loadCallbacks[index];
            if(callback){ callback(); }
        }
    };

    var load = function(){
        if(debug){console.log('environmentUtility.load...:', environmentJsonPath);}
        $http.get(environmentJsonPath)
            .success(function(response){
                if(response) {
                    environment = response;
                    $rootScope.environment = environment;
                }
                if(debug){console.log('environmentUtility.load:', environment);}
                loaded = true;
                loadedCallbacks();
            });
    };


    var getReleaseIndexes = function( targetReleases ){
        var targetIndexes = [];
        for(var index in targetReleases){
            targetIndexes.push(environment.releases.indexOf(targetReleases[index]));
        }
        return targetIndexes;
    };

    load();

    //  Public
    var utility = {
        onLoaded: function(callback){
            if(loaded){
                try{callback();}catch(e){}
                return;
            }
            loadCallbacks.push(callback);
        },

        getRelease: function(){
            return environment.release;
        },
        getReleases: function(){
            return angular.copy(environment.releases);
        },
        isRelease: function(targetRelease){
            return (this.getRelease() === targetRelease);
        },
        releaseIsAbove: function(targetRelease){
            var indexes = getReleaseIndexes([targetRelease, this.getRelease()]);
            return (indexes[1] > indexes[0]);
        },
        releaseIsAtOrAbove: function(targetRelease){
            var indexes = getReleaseIndexes([targetRelease, this.getRelease()]);
            return (indexes[1] >= indexes[0]);
        }

    };
    return utility;
}]);

'use strict';

/* global angular: false */

angular.module('utilities')
.factory('userInfoStore', ['$http', 'chromeUtility', function ($http, chromeUtility) {
    var storeConfig = {
        loaded: false,
        key: 'userInfoStore',
        debug: false,
        //disableChromeStorage: false,
        loadCallbacks: []
    };
    var store = {
        //profile:{},
        //auth: {},
        //license: {}
    };
    var storeLocal = {

    };

    //  Private functions
    var saveStore = function () {
        const functionName = 'Save User Info Store';
        if (storeConfig.debug) { console.log(functionName + ' > Config > ', storeConfig); }

        //if (storeConfig.disableChromeStorage) {
        //    console.warn('Chrome Storage may not be available!');
        //}

        if (storeConfig.debug) { console.log('userInfoStore.saveStore:', store); }

        try {
            chromeUtility.setField(storeConfig.key, store, function () {
                if (storeConfig.debug) { console.log('userInfoStore.saveStore:success'); }
            }, function () {
                if (storeConfig.debug) { console.log('userInfoStore.saveStore:fail', chrome.runtime.lastError); }
            });
        } catch (e) {
            console.error(functionName + ' > Set Cloud', e.message);
        }

        try {
            chromeUtility.setFieldLocal(storeConfig.key, storeLocal, function () {
                if (storeConfig.debug) { console.log('userInfoStore.saveStoreLocal:success'); }
            }, function () {
                if (storeConfig.debug) { console.log('userInfoStore.saveStoreLocal:fail', chrome.runtime.lastError); }
            });
        } catch (e) {
            console.error(functionName + ' > Set Local', e.message);
        }

    };
    var loadStore = function () {
        const functionName = 'Load User Info Store';
        if (storeConfig.loaded) { return; }
        if (storeConfig.debug) { console.log('userInfoStore.loadStore... config=', storeConfig); }

        //if (storeConfig.disableChromeStorage) {
        //    console.warn('Chrome Storage may not be available!');
        //}

        var finish = function () {
            storeConfig.loaded = true;
            //  Do callbacks
            for (var index in storeConfig.loadCallbacks) {
                try { storeConfig.loadCallbacks[index](); } catch (e) { }
            }
        };

        try {
            chromeUtility.getFieldLocal(storeConfig.key, function (data) {
                if (data) { storeLocal = data; }
                if (storeConfig.debug) { console.log('userInfoStore.loadStoreLocal:', data); }
            });
        } catch (e) {
            console.error(functionName + ' > Get Local', e.message);
        }

        try {
            chromeUtility.getField(storeConfig.key, function (data) {
                if (data) { store = data; }
                if (storeConfig.debug) { console.log('userInfoStore.loadStore:', data); }
                finish();
            });
        } catch (e) {
            console.error(functionName + ' > Get Cloud', e.message);
            finish();
        }
    };
    var clearStore = function () {
        if (storeConfig.debug) { console.log('userInfoStore.clearStore:', storeConfig); }
        chromeUtility.clearField(storeConfig.key);
    };
    var setStoreData = function (key, data) {
        var value = angular.copy(data);
        //if (storeConfig.debug) { console.log('userInfoStore.setStoreData:', key, value, 'same=', store[key] === value); }
        if (store[key] === value) { return; }
        store[key] = value;
        saveStore();
    };
    var getStoreData = function (key) {
        var value = angular.copy(store[key]);
        //if (storeConfig.debug) { console.log('userInfoStore.getStoreData:', key, value); }
        return value;
    };
    var setLocalStoreData = function (key, data) {
        var value = angular.copy(data);
        //if (storeConfig.debug) { console.log('userInfoStore.setStoreData:', key, value, 'same=', store[key] === value); }
        if (storeLocal[key] === value) { return; }
        storeLocal[key] = value;
        saveStore();
    };
    var getLocalStoreData = function (key) {
        var value = angular.copy(storeLocal[key]);
        return value;
    };

    //loadStore(); //Test!

    //  Public functions
    var service = {
        isLoaded: function () {
            return storeConfig.loaded;
        },
        onLoaded: function (callback) {
            if (storeConfig.loaded) {
                try { callback(); } catch (e) { }
                return;
            }
            storeConfig.loadCallbacks.push(callback);
        },
        load: function () {
            loadStore();
        },
        loadManual: function (data) {
            //storeConfig.disableChromeStorage = true;
            if (!storeConfig.loaded) {
                store = data;
                storeLocal = data;
            }
            loadStore();
        },
        clear: function () {
            clearStore();
        },

        getSiteKey: function () {
            return getStoreData('siteKey');
        },
        setSiteKey: function (data) {
            setStoreData('siteKey', data);
        },

        getCrmId: function () {
            return getStoreData('crmId');
        },
        setCrmId: function (data) {
            setStoreData('crmId', data);
        },


        getShieldAuth: function () {
            return getStoreData('ShieldAuth');
        },
        setShieldAuth: function (data) {
            setStoreData('ShieldAuth', data);
        },

        getShieldId: function () {
            return getStoreData('ShieldId');
        },
        setShieldId: function (data) {
            setStoreData('ShieldId', data);
        },

        getShieldScheme: function () {
            return getStoreData('ShieldScheme');
        },
        setShieldScheme: function (data) {
            setStoreData('ShieldScheme', data);

            // removed old value
            if (getStoreData('ShieldSchema'))
            { setStoreData('ShieldSchema', null); }
        },

        getProfileName: function () {
            return getStoreData('ProfileName');
        },
        setProfileName: function (data) {
            setStoreData('ProfileName', data);
        },

        getProfileTitle: function () {
            return getStoreData('ProfileTitle');
        },
        setProfileTitle: function (data) {
            setStoreData('ProfileTitle', data);
        },

        getProfileCompany: function () {
            return getStoreData('ProfileCompany');
        },
        setProfileCompany: function (data) {
            setStoreData('ProfileCompany', data);
        },

        getProfilePhone: function () {
            return getStoreData('ProfilePhone');
        },
        setProfilePhone: function (data) {
            setStoreData('ProfilePhone', data);
        },

        getProfileTarget: function () {
            var t = getStoreData('ProfileTarget');
            console.log('********************************* get target', t);
            return t;
        },
        setProfileTarget: function (data) {
            console.log('********************************* set target', data);
            setStoreData('ProfileTarget', data);
        },

        getProfileEmail: function () {
            return getStoreData('ProfileEmail');
        },
        setProfileEmail: function (data) {
            setStoreData('ProfileEmail', data);
        },

        getSettings: function () {
            return getStoreData('Settings');
        },
        setSettings: function (data) {
            setStoreData('Settings', data);
        },
        getTarget: function () {
            return getStoreData('Target');
        },
        setTarget: function (data) {
            setStoreData('Target', data);
        },
        getTargetUrl: function () {
            return getStoreData('TargetUrl');
        },
        setTargetUrl: function (data) {
            setStoreData('TargetUrl', data);
        },
    };

    return service;
}]);

'use strict';

/* global angular: false */
/* global $: false */

//     Setup a namespace for our dialogs (defined in dialogs sub folder)
//      This one (.min) is used on the background page
angular.module('dialogs', [])
.controller('dialogs', ['$scope', 'dialogs',
    function ($scope, dialogs) {
        $scope.templates = dialogs.getTemplates();
    }])
.factory('dialogs', [function () {
    var debug = true;
    var templates = [];
    var dialogHelper = function( template ){
        templates.push(template);
        return {

            callback: {
                callbacks: {},
                add: function(key, callback){
                    this.callbacks[key] = callback;
                },
                execute: function(key, data){
                    try{ this.callbacks[key](data); }catch(e){}
                },
                reset: function(){
                    this.callbacks = {};
                },
                exists: function(key){
                    return this.callbacks[key];
                }

            },
            template: template,
            events: {
                show: function(){},
                hide: function(){},
                update: function(){}
            },
            modal: {
                show: function(selector){
                    $( selector ).modal('show');
                },
                hide: function(selector){
                    $( selector ).modal('hide');
                }
            },
            refresh: function(scope){
                if(!scope){ return; }
                if(!scope.$$phase) { scope.$apply(); }
            },

            show: function (data) { return this.events.show(data); },
            update: function (data) { return this.events.update(data); },
            hide: function(){ this.events.hide(); }
        };
    };

    var factory = {
        refreshScope: function(scope){ if (!scope.$$phase) { scope.$apply(); } },
        getTemplates: function() { return templates; },
        createHelper: function(template) { return dialogHelper(template); },

        //  -------- Add dialogs here --------  //
        alert: dialogHelper('components/dialogs/alert/view.html'),
        progress: dialogHelper('components/dialogs/progress/view.html'),
        text: dialogHelper('components/dialogs/text/view.html'),
        busy: dialogHelper('components/dialogs/busy/view.html'),
        confirm: dialogHelper('components/dialogs/confirm/view.html'),
        lookup: dialogHelper('components/dialogs/lookup/view.html'),
        list: dialogHelper('components/dialogs/list/view.html'),
        map: dialogHelper('components/dialogs/map/view.html'),
        select: dialogHelper('components/dialogs/select/view.html'),

        //capture: {
        //    list: dialogHelper('components/dialogs/capture/list/view.html'),
        //    clipboard: dialogHelper('components/dialogs/capture/clipboard/view.html')
        //},

        //searches: {
        //    edit: dialogHelper('components/dialogs/searches/edit/view.html'),
        //    run:  dialogHelper('components/dialogs/searches/run/view.html')
        //},

        //contacts: {
        //    edit: dialogHelper('components/dialogs/contacts/edit/view.html'),
        //}

    };
    return factory;
}]);
'use strict';

/* global angular: false */

angular.module('dialogs')
.controller('dialogs.alert', ['$scope', 'dialogs',
    function ($scope, dialogs) {
        var dialog = dialogs.alert;

        $scope.pre = false;

        //  Register available callback methods
        dialog.ok = function(callback){
            dialog.callback.add('ok', callback);
            return dialog;
        };

        //  Register show and hide methods
        dialog.events.show = function (message) {
            if (message && message.text) {
                $scope.message = message.text;
                $scope.pre = message.pre || false;
            }
            else {
                $scope.message = message;
                $scope.pre = false;
            }
            dialog.modal.show($scope.modalSelector);
            dialog.refresh($scope);
            dialog.callback.reset();
            return dialog;
        };

        dialog.events.hide = function(){
            dialog.modal.hide($scope.modalSelector);
        };

        //  Expose callbacks to UI
        $scope.ok = function(){
            dialog.events.hide();
            dialog.callback.execute('ok');
        };
    }]);
'use strict';

/* global angular: false */

angular.module('dialogs')
.controller('dialogs.progress', ['$scope', 'dialogs',
    function ($scope, dialogs) {
        var dialog = dialogs.progress;

        $scope.min = 0;
        $scope.max = 100;
        $scope.value = 0;
        $scope.percent = 0;

        var calc = function () {
            var v = ($scope.value - $scope.min) / ($scope.max - $scope.min) * 100;
            $scope.percent = Math.round(v);
        };

        dialog.cancel = function(callback){
            dialog.callback.add('cancel', callback);
            return dialog;
        };

        dialog.events.show = function(data){
            $scope.message = data.message;
            $scope.min = (data.min ? data.min : 0);
            $scope.max = (data.max ? data.max : 100);
            $scope.value = (data.value ? data.value : 0);
            calc();
            dialog.modal.show($scope.modalSelector);
            dialog.refresh($scope);
            dialog.callback.reset();
            return dialog;
        };

        dialog.events.update = function (data) {
            console.log('Updating progress', angular.copy(data));
            if (data.message) { $scope.message = data.message; }
            if (data.min) { $scope.min = data.min; }
            if (data.max) { $scope.max = data.max; }
            if (data.value) { $scope.value = data.value; }
            calc();
            dialog.refresh($scope);
        };

        dialog.events.hide = function(){
            dialog.modal.hide($scope.modalSelector);
        };

        $scope.cancel = function(){
            dialog.events.hide();
            dialog.callback.execute('cancel');
        };
    }]);
'use strict';

/* global angular: false */

angular.module('dialogs')
.controller('dialogs.busy', ['$scope', 'dialogs',
    function ($scope, dialogs) {
        var dialog = dialogs.busy;

        dialog.visible = false;

        var debug = 'dialogs/busy/controller.js->'; debug = false;

        dialog.cancel = function (callback) {
            dialog.callback.add('cancel', callback);
            return dialog;
        };

        $scope.hasCallback = function (key) {
            return dialog.callback.exists(key);
        };

        dialog.events.show = function (message) {
            //console.warn('busy-show');
            $scope.message = message;
            if (debug) { console.log(debug + 'show->', $scope.message); }
            //if (dialog.visible) {
            //    dialog.visible = false;
            //    dialog.modal.hide($scope.modalSelector);
            //}
            if (!dialog.visible) {
                dialog.modal.show($scope.modalSelector);
                dialog.visible = true;
                //if (!$scope.$$phase) { $scope.$apply(); }
            }
            dialog.refresh($scope);
            dialog.callback.reset();
            return dialog;
        };

        dialog.events.hide = function () {
            //console.warn('busy-hide');
            if (debug) { console.log(debug + 'hide->', $scope.message); }
            if (dialog.visible) {
                dialog.visible = false;
                dialog.modal.hide($scope.modalSelector);
                //if (!$scope.$$phase) { $scope.$apply(); }
            }
        };

        $scope.cancel = function () {
            dialog.events.hide();
            dialog.callback.execute('cancel');
        };
    }]);
'use strict';

/* global angular: false */

angular.module('dialogs')
.controller('dialogs.text', ['$scope', 'dialogs',
    function ($scope, dialogs) {
        var dialog = dialogs.text;

        //  Register available callback methods
        dialog.confirm = function (callback) {
            dialog.callback.add('confirm', callback);
            return dialog;
        };
        dialog.cancel = function (callback) {
            dialog.callback.add('cancel', callback);
            return dialog;
        };
        //  Register show and hide methods
        dialog.events.show = function (data) {
            $scope.message = data.message;
            $scope.value = (data.value ? data.value : '');
            $scope.placeholder = (data.placeholder ? data.placeholder : '');
            $scope.max = (data.max ? data.max : 100);
            $scope.required = (data.required ? data.required : false);
            $scope.readOnly = (data.readOnly ? data.readOnly : false);
            dialog.modal.show($scope.modalSelector);
            dialog.refresh($scope);
            dialog.callback.reset();
            window.setTimeout(function () {
                var el = document.getElementById('dialog-text-input');
                if (el) { el.focus(); }
            }, 500);
            return dialog;
        };

        dialog.events.hide = function () {
            dialog.modal.hide($scope.modalSelector);
        };

        $scope.satisfied = function () {
            if ($scope.required && !$scope.value) {
                $scope.errorMessage = 'Value is required';
                return false;
            }
            $scope.errorMessage = '';
            return true;
        };
        //  Expose callbacks to UI
        $scope.confirm = function () {
            if ($scope.required && !$scope.value) { return $scope.required; }
            dialog.events.hide();
            dialog.callback.execute('confirm', $scope.value);
        };
        $scope.cancel = function () {
            dialog.events.hide();
            dialog.callback.execute('cancel');
        };
    }]);
'use strict';

/* global angular: false */

angular.module('dialogs')
.controller('dialogs.confirm', ['$scope', 'dialogs',
    function ($scope, dialogs) {
        var dialog = dialogs.confirm;

        //  Register available callback methods
        dialog.confirm = function(callback){
            dialog.callback.add('confirm', callback);
            return dialog;
        };
        dialog.cancel = function(callback){
            dialog.callback.add('cancel', callback);
            return dialog;
        };

        //  Register show and hide methods
        dialog.events.show = function(message){
            $scope.message = message;
            dialog.modal.show($scope.modalSelector);
            dialog.refresh($scope);
            dialog.callback.reset();
            return dialog;
        };
        dialog.events.hide = function(){
            dialog.modal.hide($scope.modalSelector);
        };

        //  Expose callbacks to UI
        $scope.confirm = function(){
            dialog.events.hide();
            dialog.callback.execute('confirm');
        };
        $scope.cancel = function(){
            dialog.events.hide();
            dialog.callback.execute('cancel');
        };
    }]);
'use strict';

/* global angular: false */

angular.module('dialogs')
.controller('dialogs.lookup', ['$scope', '$timeout', 'dialogs', 'chromeUtility', 'googleService', 'contactUtility',
    function ($scope, $timeout, dialogs, chromeUtility, googleService, contactUtility) {
        var dialog = dialogs.lookup;

        $scope.exportService = null;
        $scope.items = []; // [{label: '', link: ''}]
        $scope.searching = false;
        $scope.selectedIndex = 0;
        $scope.value = 0;
        $scope.allowNew = false;
        $scope.required = false;
        $scope.lookupDefinition = null;

        //  Register available callback methods
        dialog.select = function (callback) {
            dialog.callback.add('select', callback);
            return dialog;
        };
        //dialog.new = function (callback) {
        //    dialog.callback.add('new', callback);
        //    return dialog;
        //};
        dialog.cancel = function (callback) {
            dialog.callback.add('cancel', callback);
            return dialog;
        };


        //  Register show and hide methods
        dialog.events.show = function (data) {

            console.log('Show lookup for ', data);

            if (data.lookup) {
                $scope.message = data.lookup.message || ('Select value');
                $scope.type = data.lookup.type;
            } else {
                $scope.message = '';
                $scope.type = '';
            }

            $scope.message2 = (data.lookup && data.lookup.message2) || '';
            $scope.selectedIndex = 0;
            $scope.selectButtonLabel = (data.lookup && data.lookup.selectButtonLabel) || 'Continue';

            $scope.allowNew = data.lookup && data.lookup.allowNew;
            $scope.required = data.lookup && data.lookup.required;
            $scope.showGoogle = data.lookup && data.lookup.showGoogle;

            $scope.lookupDefinition = data.lookup;

            $scope.value = data.value;
            $scope.exportService = data.exportService;
            dialog.modal.show($scope.modalSelector);
            dialog.refresh($scope);
            dialog.callback.reset();

            $scope.initChoices();

            //if (!$scope.value)
            //    $scope.value = '';


            $scope.find();


            return dialog;
        };
        dialog.events.hide = function () {
            dialog.modal.hide($scope.modalSelector);
        };

        $scope.initChoices = function () {
            $scope.items = [];
            if (!$scope.required) {
                $scope.items.push({
                    label:
                        $scope.lookupDefinition.noLabel ? $scope.lookupDefinition.noLabel :
                        ($scope.lookupDefinition.picklist ? 'No value' : 'No ' + ($scope.type || 'value')),
                    link: null,
                    id: null,
                    newName: null
                });
            }
            if ($scope.allowNew) {
                $scope.items.push({
                    label: 'Create new ' + $scope.type + ': ' + $scope.value,
                    link: null,
                    id: null,
                    newName: $scope.value
                });
            }
        };

        $scope.find = function () {

            $scope.searching = true;
            if (!$scope.$$phase) { $scope.$apply(); }
            $scope.initChoices();

            var offset = $scope.items.length;

            if ($scope.lookupDefinition.fixedlist) {
                $scope.searching = false;
                var k = 0;
                var list = $scope.lookupDefinition.fixedlist;
                while (k < list.length) {
                    var lookupObject = { label: list[k].label, id: list[k].value };
                    $scope.items.push(lookupObject);

                    if ($scope.value && lookupObject.id === $scope.value.id)
                    { $scope.selectedIndex = k + offset; }

                    k++;
                }
                if (!$scope.$$phase) { $scope.$apply(); }
                return;
            }

            if ($scope.lookupDefinition.picklist) {

                $scope.exportService.getFields($scope.lookupDefinition.type, function (list) {
                    console.log('getFields response', angular.copy(list));
                    $scope.searching = false;
                    var i = list.length;
                    while (i--) {
                        if (list[i].name === $scope.lookupDefinition.crmProperty) {
                            var j = 0;

                            while (j < list[i].values.length) {
                                var lookupObject = { label: list[i].values[j].label, id: list[i].values[j].value };

                                if ($scope.value && lookupObject.id === $scope.value.id)
                                { $scope.selectedIndex = j + offset; }

                                $scope.items.push(lookupObject);
                                j++;
                            }
                        }
                    }

                    if (!$scope.$$phase) { $scope.$apply(); }

                }, function (error) {
                    console.log('getFields error', error);
                    $scope.searching = false;
                    dialogs.alert.show(error);
                });

                return;
            }

            var successCallback = function (records) {
                console.log('RECORDS', records);
                $scope.searching = false;
                $scope.errorMessage = '';

                angular.forEach(records, function (value, index) {
                    var lookupObject = $scope.exportService.toLookupObject(value, $scope.type);
                    $scope.items.push(lookupObject);
                });

                //$scope.items = //[{ id: 1, label: 'Test', link: 'http://broadlook.com' }, { id: 2, label: 'Test 2', link: 'http://broadlook.com' }];
                if (!$scope.$$phase) { $scope.$apply(); }
            };

            var failCallback = function (msg) {
                $scope.items = [];
                $scope.searching = false;
                $scope.errorMessage = msg;

                if (!$scope.$$phase) { $scope.$apply(); }
            };


            var query = {};
            query[$scope.lookupDefinition.appProperty] = ($scope.value || '');
            //{ company: $scope.value }
            $scope.exportService.findRecord($scope.type, query, [$scope.lookupDefinition.appProperty], successCallback, failCallback);
        };

        //  Expose callbacks to UI
        $scope.select = function (selectedValue) {
            dialog.events.hide();
            dialog.callback.execute('select', selectedValue);
        };
        //$scope.new = function () {
        //    dialog.events.hide();
        //    dialog.callback.execute('new');
        //};
        $scope.cancel = function () {
            dialog.events.hide();
            dialog.callback.execute('cancel');
        };

        $scope.openLink = function (link) {
            if (!link)
            { return; }
            if (link.indexOf('://') < 0)
            { link = 'http://' + link; }
            chromeUtility.openLink(link, true);
        };

        $scope.setValue = function (value) {
            console.log('Setting value: ', value);
            $scope.selectedIndex = value;
        };

        var isCompanyWebsite = function (url, title, searchstring) {
            var res = true;


            if (!url) {
                res = false;
            }

            // Second level domain
            if (res) {
                var domain = contactUtility.getDomain(url);
                var path = url.trim().toLowerCase().split(domain)[1];
                console.log('*** domain ', domain, path);
                if (path.length > 1) { res = false; }
            }


            console.log('*** www? ', res, url, title, searchstring);


            return res;
        };

        var parseGoogle = function () {

            chromeUtility.getCaptureInput({}, function (response) {
                console.log('Input:', response);
                var html = response.data;
                //var url = response.url;

                var results = googleService.parseGoogle(html);

                console.log('***** RESULT:', results);

                var searchstring = $scope.value;

                for (var i = 0; i < results.length; i++) {

                    var url = results[i].sourceurl;
                    var title = results[i].sourcetitle;

                    if (!isCompanyWebsite(url, title, searchstring)) {
                        continue;
                    }

                    var domain = contactUtility.getDomain(url);

                    $scope.items.push({
                        id: i,
                        label: domain + ' (' + title + ')',
                        link: domain
                    });
                }

                if (!$scope.$$phase) { $scope.$apply(); }

                //if (linkedinService.isProfile(html)) {
                //    console.log('Parsing linkedin....');
                //    successCallback(linkedinService.parseProfile(html, url));

                //} else if (googleService.isGoogle(html, url)) {
                //    console.log('Parsing google....');
                //    successCallback(googleService.parseGoogle(html));

                //} else {
                //    console.log('Calling parsing service...');
                //    parsingService.capture(html, url, 'text/html', successCallback, failureCallback);
                //}

            }, function (error) {

                console.log('ERROR::', error);
                //failureCallback(error);
            });


        };

        $scope.searchWeb = function () {

            var url = 'https://google.com/search?num=10&q=' + encodeURIComponent($scope.value || '');

            chromeUtility.openLink(url, true);

            $timeout(parseGoogle, 3000);
        };

        //environmentUtility.onLoaded(function () {
        //    $scope.isLocal = environmentUtility.isRelease('local');
        //    $scope.isAlpha = environmentUtility.isRelease('alpha');
        //    $scope.isBeta = environmentUtility.isRelease('beta');
        //    $scope.isProduction = environmentUtility.isRelease('production');
        //});

    }]);
'use strict';

/* global angular: false */

angular.module('dialogs')
.controller('dialogs.list', ['$scope', 'dialogs', 'chromeUtility',
    function ($scope, dialogs, chromeUtility) {
        var dialog = dialogs.list;

        $scope.data = { setName: [], setPattern: [] }; 

        //  Register available callback methods
        dialog.select = function (callback) {
            dialog.callback.add('select', callback);
            return dialog;
        };

        dialog.cancel = function (callback) {
            dialog.callback.add('cancel', callback);
            return dialog;
        };

        //  Register show and hide methods
        dialog.events.show = function (data) {

            console.log('Show list', data);

            $scope.data = data;

            dialog.modal.show($scope.modalSelector);
            dialog.refresh($scope);
            dialog.callback.reset();

            return dialog;
        };

        dialog.events.hide = function () {
            dialog.modal.hide($scope.modalSelector);
        };

        var removeA = function (arr) {
            var what, a = arguments, L = a.length, ax;
            while (L > 1 && arr.length) {
                what = a[--L];
                while ((ax = arr.indexOf(what)) !== -1) {
                    arr.splice(ax, 1);
                }
            }
            return arr;
        };

        $scope.deletePattern = function (item) {
            //$scope.data.setPattern.splice(index, 1);
            removeA($scope.data.setPattern, item);
        };

        $scope.deleteName = function (item) {
            //$scope.data.setName.splice(index, 1);
            removeA($scope.data.setName, item);
        };

        //  Expose callbacks to UI
        $scope.select = function () {
            dialog.events.hide();
            dialog.callback.execute('select', $scope.data);
        };

        $scope.cancel = function () {
            dialog.events.hide();
            dialog.callback.execute('cancel');
        };

    }]);
'use strict';

/* global angular: false */

angular.module('dialogs')
.controller('dialogs.map', ['$scope', 'dialogs', 'chromeUtility',
    function ($scope, dialogs, chromeUtility) {
        var dialog = dialogs.map;
        $scope.dialog = dialog;

        $scope.data = null;
        //$scope.map = null;
        //$scope.captureMap = null;
        $scope.defaultCaptureMap = {
            fields: [

                { captureField: 'address1', label: 'Address Line 1' },
                { captureField: 'address2', label: 'Address Line 2' },
                { captureField: 'address', label: 'Address Line 1 and 2' },
                { captureField: 'bio', label: 'Bio' },
                { captureField: 'city', label: 'City' },
                { captureField: 'company', label: 'Company Name' },
                { captureField: 'country', label: 'Country' },
                { captureField: 'countryCode', label: 'Country Code' },
                { captureField: 'email', label: 'Email' },
                { captureField: 'emailverbool', label: 'Email Verified' },
                { captureField: 'email2', label: 'Email 2' },
                { captureField: 'email2verbool', label: 'Email 2 Verified' },
                { captureField: 'employees', label: 'Employees (Range)' },
                { captureField: 'employeesAvg', label: 'Employees (Number)' },
                { captureField: 'facebook', label: 'Facebook' },
                { captureField: 'first', label: 'First Name' },
                { captureField: 'full', label: 'Full Name' },
                { captureField: 'industry', label: 'Industry' },
                { captureField: 'jobtitle', label: 'Job Title' },
                { captureField: 'last', label: 'Last Name' },
                { captureField: 'linkedin', label: 'LinkedIn' },
                { captureField: 'middle', label: 'Middle Name' },
                { captureField: 'phone', label: 'Phone' },
                { captureField: 'phone2', label: 'Phone 2' },
                { captureField: 'revenue', label: 'Revenue (Range)' },
                { captureField: 'revenueAvg', label: 'Revenue (Number)' },
                { captureField: 'state', label: 'State' },
                { captureField: 'stateCode', label: 'State Code' },
                { captureField: 'twitter', label: 'Twitter' },
                { captureField: 'website', label: 'Website' },
                { captureField: 'zip', label: 'Zip Code' },

                //{ captureField: 'first', label: 'First Name' },
                //{ captureField: 'middle', label: 'Middle Name' },
                //{ captureField: 'last', label: 'Last Name' },
                //{ captureField: 'full', label: 'Full Name' },
                //{ captureField: 'jobtitle', label: 'Job Title' },
                //{ captureField: 'company', label: 'Company Name' },
                //{ captureField: 'email', label: 'Email' },
                //{ captureField: 'email2', label: 'Email 2' },
                //{ captureField: 'phone', label: 'Phone' },
                //{ captureField: 'phone2', label: 'Phone 2' },
                //{ captureField: 'website', label: 'Website' },
                //{ captureField: 'bio', label: 'Bio' },
                //{ captureField: 'address', label: 'Address Line 1 and 2' },
                //{ captureField: 'address1', label: 'Address Line 1' },
                //{ captureField: 'address2', label: 'Address Line 2' },
                //{ captureField: 'city', label: 'City' },
                //{ captureField: 'state', label: 'State' },
                //{ captureField: 'stateCode', label: 'State Code' },
                //{ captureField: 'zip', label: 'Zip Code' },
                //{ captureField: 'country', label: 'Country' },
                //{ captureField: 'countryCode', label: 'Country Code' },
                //{ captureField: 'facebook', label: 'Facebook' },
                //{ captureField: 'linkedin', label: 'LinkedIn' },
                //{ captureField: 'twitter', label: 'Twitter' },
                //{ captureField: 'industry', label: 'Industry' },
                //{ captureField: 'employees', label: 'Employees (Range)' },
                //{ captureField: 'employeesAvg', label: 'Employees (Number)' },
                //{ captureField: 'revenue', label: 'Revenue' },
                //{ captureField: 'emailver', label: 'Email 1 Verified' },
                //{ captureField: 'email2ver', label: 'Email 2 Verified' }
            ]
        };

        //  Register available callback methods
        dialog.save = function (callback) {
            dialog.callback.add('save', callback);
            return dialog;
        };

        dialog.cancel = function (callback) {
            dialog.callback.add('cancel', callback);
            return dialog;
        };


        //  Register show and hide methods
        dialog.events.show = function (data) {

            console.log('Show map for ', data);

            // data structure:
            // 
            //  Current list of fields in CRM:
            //  data.availableFields [ { label, name, required }]
            //
            //  Previously saved map:
            //  data.entity { 
            //      label,
            //      map: { 
            //          fields: [ 
            //              target: { label, name, required }, 
            //              source: { type: 'capture|lookup|text', value: {...}}
            //          ] 
            //      } 
            //  }
            //
            // type: 'capture', value: { captureField: 'first', label: 'First Name' }
            // type: 'text', value: { text: 'Added by Capture! v1.2' }
            // type: 'lookup',   value: { appProperty: 'company', message: 'Select Account', type: 'Account', required: false, allowNew: true }

            $scope.label = angular.copy(data.entity.label);


            var fields = [];

            if (data.entity.map) {
                fields = angular.copy(data.entity.map.fields);
            }

            console.log('fields before step 1', angular.copy(fields));

            var i, j, found;

            // Step 1: Delete fields that are not in CRM anymore and update those that are.

            i = fields.length;
            while (i--) {

                if (fields[i].target && !fields[i].target.required) {
                    fields[i].target.required = false;
                }

                // Skip actions (e.g. Add to Campaign)
                //if (fields[i].target && fields[i].target.name && fields[i].target.name.length > 3 && fields[i].target.name.substring(0, 3) === '___') {
                if (fields[i].target && fields[i].target.type && fields[i].target.type === 'action') {
                    continue;
                }

                found = false;

                j = data.availableFields.length;
                while (j--) {
                    if (fields[i].target && fields[i].target.name === data.availableFields[j].name) {
                        found = true;
                        // Update definition
                        fields[i].target = data.availableFields[j];
                        break;
                    }
                }

                //if (!found) {
                //    // delete not found field
                //    fields.splice(i, 1);
                //}

            }

            console.log('fields after step 1', angular.copy(fields));

            // Step 2: Add fields that are not on the map

            i = data.availableFields.length;
            while (i--) {

                found = false;

                j = fields.length;
                while (j--) {
                    if (fields[j].target.name === data.availableFields[i].name) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    // add not found field
                    fields.push({ target: data.availableFields[i], source: { type: '', value: null } });
                }

            }

            console.log('fields after step 2', angular.copy(fields));

            $scope.fields = fields;
            $scope.availableEntities = data.availableEntities;

            //$scope.captureMap = angular.copy(captureMap);
            //$scope.map = angular.copy(data.entity.map.fields);

            dialog.modal.show($scope.modalSelector);
            dialog.refresh($scope);
            dialog.callback.reset();

            return dialog;
        };
        dialog.events.hide = function () {
            dialog.modal.hide($scope.modalSelector);
        };


        //  Expose callbacks to UI
        $scope.save = function () {
            dialog.events.hide();
            console.log('map->save', $scope.captureMap, $scope.data);
            var f = [];
            var i = 0;
            while (i < $scope.fields.length) {
                if ($scope.fields[i].source.type) {
                    f.push($scope.fields[i]);
                }
                i++;
            }
            console.log('Mapped fields', angular.copy(f));
            dialog.callback.execute('save', f);
        };

        $scope.cancel = function () {
            dialog.events.hide();
            dialog.callback.execute('cancel');
        };

    }]);
'use strict';

/* global angular: false */

/**
 * @class captureApp.webServices
 * @memberOf captureApp    
 */

//     Setup a namespace for our webservices (defined in webservices sub folder)
var webServicesModule = angular.module('webServices', ['utilities']);

'use strict';

/* global angular: false */

angular.module('webServices')
.factory('endpoints', ['environmentUtility', function (environmentUtility) {
    var onReadyCallbacks = [];
    var isReady = false;
    var ready = function () {
        isReady = true;
        for (var index in onReadyCallbacks) {
            onReadyCallbacks[index]();
        }

    };
    //  When environment is loaded, do our stuff!
    environmentUtility.onLoaded(ready);

    var mainApiServer = 'https://account.broadlook.com/';
    var stagingApiServer = 'https://account-staging.broadlook.com/';
    var devApiServer = 'https://account-staging.broadlook.com/';
    //var devApiServer = 'http://localhost:52000/';
    //var devApiServer = 'https://account.broadlook.com/';

    var localApiServer = devApiServer;
    var alphaApiServer = stagingApiServer;
    var betaApiServer = stagingApiServer;
    var productionApiServer = mainApiServer;


    return {
        broadlook: {
            account: {
                local: localApiServer,
                alpha: alphaApiServer,
                beta: betaApiServer,
                production: productionApiServer,
                current: function (release) { return this[environmentUtility.getRelease()]; }
            },
            parser: {
                local: localApiServer + 'api/v1/contact/capture',
                alpha: alphaApiServer + 'api/v1/contact/capture',
                beta: betaApiServer + 'api/v1/contact/capture',
                production: productionApiServer + 'api/v1/contact/capture',
                current: function (release) { return this[environmentUtility.getRelease()]; }
            },
            register: {
                local: localApiServer + 'api/v1/org/registerapp',
                alpha: alphaApiServer + 'api/v1/org/registerapp',
                beta: betaApiServer + 'api/v1/org/registerapp',
                production: productionApiServer + 'api/v1/org/registerapp',
                current: function (release) { return this[environmentUtility.getRelease()]; }
            },
            diver: {
                local: localApiServer,
                alpha: alphaApiServer,
                beta: betaApiServer,
                production: productionApiServer,
                current: function (release) { return this[environmentUtility.getRelease()]; }
            },
            research: {
                local: localApiServer,
                alpha: alphaApiServer,
                beta: betaApiServer,
                production: productionApiServer,
                current: function (release) { return this[environmentUtility.getRelease()]; }
            },
            profiler: {
                local: {
                    accounts: localApiServer,
                    webProfiler: 'http://wprpc.broadlook.com/rpc2/'
                },
                alpha: {
                    accounts: alphaApiServer,
                    webProfiler: 'http://wprpc.broadlook.com/rpc2/'
                },
                beta: {
                    accounts: betaApiServer,
                    webProfiler: 'http://wprpc.broadlook.com/rpc2/'
                },
                production: {
                    accounts: productionApiServer,
                    webProfiler: 'http://wprpc.broadlook.com/rpc2/'
                },
                current: function (release) { return this[environmentUtility.getRelease()]; }
            },
            searches: {
                local: {
                    searches: localApiServer
                },
                alpha: {
                    searches: alphaApiServer
                },
                beta: {
                    searches: betaApiServer
                },
                production: {
                    searches: productionApiServer
                },

                current: function (release) { return this[environmentUtility.getRelease()]; }
            },
            shield: {
                local: { v1: 'https://crmshield.broadlook.com/', v2: localApiServer + 'api/v1/shield/' },
                alpha: { v1: 'https://crmshield.broadlook.com/', v2: alphaApiServer + 'api/v1/shield/' },
                beta: { v1: 'https://crmshield.broadlook.com/', v2: betaApiServer + 'api/v1/shield/' },
                production: { v1: 'https://crmshield.broadlook.com/', v2: productionApiServer + 'api/v1/shield/' },
                current: function (release) { return this[environmentUtility.getRelease()]; }
            },
            store: {
                local: {
                    store: localApiServer
                },
                alpha: {
                    store: alphaApiServer
                },
                beta: {
                    store: betaApiServer
                },
                production: {
                    store: productionApiServer
                },

                current: function (release) { return this[environmentUtility.getRelease()]; }
            },
            storage: {
                local: localApiServer + 'api/v1/storage/',
                alpha: alphaApiServer + 'api/v1/storage/',
                beta: betaApiServer + 'api/v1/storage/',
                production: productionApiServer + 'api/v1/storage/',
                current: function (release) { return this[environmentUtility.getRelease()]; }
            },
            limit: {
                local: localApiServer + 'api/v1/org/',
                alpha: alphaApiServer + 'api/v1/org/',
                beta: betaApiServer + 'api/v1/org/',
                production: productionApiServer + 'api/v1/org/',
                current: function (release) { return this[environmentUtility.getRelease()]; }
            },
            stratus: {
                local: { api: 'https://dq.broadlook.com/api/v1/', web: 'https://dq.broadlook.com/#/' },
                alpha: { api: 'https://dq.broadlook.com/api/v1/', web: 'https://dq.broadlook.com/#/' },
                beta: { api: 'https://dq.broadlook.com/api/v1/', web: 'https://dq.broadlook.com/#/' },
                production: { api: 'https://dq.broadlook.com/api/v1/', web: 'https://dq.broadlook.com/#/' },
                current: function (release) { return this[environmentUtility.getRelease()]; }
            }
        },
        google: {
            local: 'https://www.googleapis.com/plus/v1/people/me',
            alpha: 'https://www.googleapis.com/plus/v1/people/me',
            beta: 'https://www.googleapis.com/plus/v1/people/me',
            production: 'https://www.googleapis.com/plus/v1/people/me',
            current: function () { return this.production; }
        },
        totango: {
            local: 'http://sdr.totango.com/pixel.gif/',
            alpha: 'http://sdr.totango.com/pixel.gif/',
            beta: 'http://sdr.totango.com/pixel.gif/',
            production: 'http://sdr.totango.com/pixel.gif/',
            current: function () { return this[environmentUtility.getRelease()]; }
        },

        //  Sometimes a service loads before the environment loads...  Register a callback when endpoints is ready here
        onReady: function (callback) {
            if (isReady) { callback(); }
            else { onReadyCallbacks.push(callback); }
        },

        accountService: function () { return this.broadlook.account.current(); },
        parsingService: function () { return this.broadlook.parser.current(); },
        registrationService: function () { return this.broadlook.register.current(); },
        googlePlusService: function () { return this.google.current(); },
        limitService: function () { return this.broadlook.limit.current(); },
        profilerService: function () { return this.broadlook.profiler.current(); },
        searchService: function () { return this.broadlook.searches.current(); },
        shieldService: function () { return this.broadlook.shield.current(); },
        storeService: function () { return this.broadlook.store.current(); },
        totangoService: function () { return this.totango.current(); },
        researchService: function () { return this.broadlook.research.current(); },
        storageService: function () { return this.broadlook.storage.current(); }

    };
}]);

/**
 * @class captureApp.webServices.salesforce
 * @memberOf captureApp.webServices.exportTargetVer2
 * @description This is Salesforce AngularJS service.
 */

'use strict';

/* global angular: false */
/* global jQuery: false */
/* global geographyData: false */
/* global backgroundUtility: false */


angular.module('webServices')//exportService 
//angular.module('exportService')
//.factory('salesforce', ['$http', '$q', '$timeout', 'endpoints', 'dialogs', function ($http, $q, $timeout, endpoints, dialogs) {
.factory('salesforce', ['$http', '$q', '$timeout', 'dialogs', 'userInfoStore', 'bgService', 'environmentUtility', function ($http, $q, $timeout, dialogs, userInfoStore, bgService, environmentUtility) {
    var debug = 'saleforce.js->';
    const consolePrefix = 'Salesforce > ';
    var savedRefreshToken = null;
    var enableOAuth = true;
    var OAuthServer = 'https://account-staging.broadlook.com';
    var store = { cache: {} };
    var invalidSessions = {};
    var enteredValues = {};
    const apiClientApi = 'RingLeadCapture';

    environmentUtility.onLoaded(function () {
        var isLocal = environmentUtility.isRelease('local');
        var isAlpha = environmentUtility.isRelease('alpha');
        var isBeta = environmentUtility.isRelease('beta');
        var isProduction = environmentUtility.isRelease('production');

        if (isBeta || isProduction) {
            OAuthServer = 'https://account.broadlook.com';
        } else {
            OAuthServer = 'https://account-staging.broadlook.com';
        }
        //enableOAuth = isLocal || isAlpha;

        //enableOAuth = isAlpha;
    });

    var mapField = function (source, sourceKey, target, targetKey) {
        var sourceKeyParts = sourceKey.split('.');
        if (sourceKeyParts.length === 2) {
            try {
                target[targetKey] = source[sourceKeyParts[0]][sourceKeyParts[1]];
            } catch (e) {
                target[targetKey] = null;
            }
        }
        else { target[targetKey] = source[sourceKey]; }
    };
    var mapFromField = function (target, targetKey, source, sourceKey) {
        mapField(source, sourceKey, target, targetKey);
    };
    var initStore = function (session, url, refreshToken) {
        const functionName = 'Init Store';
        try {

            if (debug) { console.warn(consolePrefix + functionName, arguments); }

            if (!session) { // logout
                store = { cache: {} };
            }

            if (session && url) {
                store.id = session;
                store.url = url;
                store.ts = new Date();
            }

            console.warn('enableOAuth > ', enableOAuth);
            if (enableOAuth) {
                savedRefreshToken = refreshToken || savedRefreshToken;
                if (!store.id || !store.url) {                   
                    refreshAccessToken(savedRefreshToken); // calls initStore(session, url); refreshToken will be undefined
                }

                //if (refreshToken) {

                //    if (savedRefreshToken !== refreshToken || !store.id || !store.url) {
                //        savedRefreshToken = refreshToken || savedRefreshToken;
                //        refreshAccessToken(refreshToken); // calls initStore(session, url); refreshToken will be undefined
                //    } else {
                //        savedRefreshToken = refreshToken || savedRefreshToken;
                //    }
                //}
            }

            if (debug) { console.log(consolePrefix + functionName, angular.copy(store)); }
        } catch (e) {
            console.error(functionName, e.message);
        }
    };

    var initStoreAsync = function (data) {
        const functionName = 'Init Store';
        try {

            if (debug) { console.warn(consolePrefix + functionName, arguments); }

            var deferred = $q.defer();
           
            var resolve = function () {
                $timeout(function () {
                    deferred.resolve(true);
                }, 1);
            };

            var reject = function (msg) {
                $timeout(function () {
                    deferred.reject(msg);
                }, 1);
            };

            store = { cache: {} };

            var done = false;

            if (data.session && data.url) {
                store.id = data.session;
                store.url = data.url;
                store.ts = new Date();
                done = true;
            }

            console.warn('enableOAuth > ', enableOAuth);

            if (enableOAuth) {
                savedRefreshToken = data.refreshToken || savedRefreshToken;
                if (!store.id || !store.url) {
                    refreshAccessTokenAsync({ refreshToken: savedRefreshToken }); // calls initStore(session, url); refreshToken will be undefined
                    return deferred.promise;
                } else {
                    done = true;
                }
            }

            if (done) { resolve(); } else { reject('Not logged in'); }

            if (debug) { console.log(consolePrefix + functionName, angular.copy(store)); }

            return deferred.promise;
            
        } catch (e) {
            console.error(functionName, e.message);
        }
    };

    var defaultOnSuccessHandler = function (data, status, headers, config, successCallback, failureCallback) {

        if (!data) {
            var message = 'Salesforce API call failed';

            //Read header: Sforce-Limit-Info: api-usage=50035/48000
            var apiUsage = headers('Sforce-Limit-Info');
            if (apiUsage) {
                message += ': ' + apiUsage;
            }

            failureCallback(message);

            return;
        }

        successCallback(data);
    };

    var defaultOnErrorHandler = function (errorResponse, status, failureCallback) {
        const functionName = 'On Error';
        try {
            console.error(consolePrefix + functionName + ' > Status > ', status, ' > Response > ', angular.copy(errorResponse));

            if (errorResponse) {
                if (errorResponse.responseJSON && errorResponse.responseJSON.length > 0 && errorResponse.responseJSON[0].message) {
                    failureCallback(errorResponse.responseJSON[0].message);
                }
                else if (errorResponse.statusText) {
                    failureCallback(errorResponse.statusText);
                }
                else if (errorResponse.length > 0) {

                    var errorCode = errorResponse[0].errorCode;

                    if (errorCode === 'INVALID_SESSION_ID') {
                        service.logout(true);
                        failureCallback('Session expired. Please log in.');
                    }
                    else { failureCallback(errorResponse[0].message); }
                }
                else { failureCallback(errorResponse); }
            }
            else { failureCallback('Salesforce API Error'); }

        } catch (e) {
            console.error(functionName + ' > On Error > ', e.message);
            failureCallback('Salesforce API Exception');
        }

    };

    var checkSession = function () {

        if (!store || typeof store.url === 'undefined') {
            console.error('Session Not initialized > ', angular.copy(store));
            throw { message: 'Session expired. Please log in.' };
        }

    };

    var refreshingToken = false;
    var refreshAccessToken = function (refreshToken) {
        const functionName = 'Refresh Access Token';
        refreshingToken = true;
        var config = {
            method: 'POST',
            url: 'https://login.salesforce.com/services/oauth2/token',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
            data: 'grant_type=refresh_token&client_id=3MVG99OxTyEMCQ3gxoS7zJYNasAk6gttQLnv.h_VYo.HG6xh5esLG.s5JPB_.5FyUCqgNxn_RxgWE7AiuZe41&refresh_token=' + refreshToken
        };

        if (debug) { console.log(consolePrefix + functionName + ' > Request > ', config); }

        $http(config).success(function (data, status, headers, config) {

            console.warn('refresh token > ', data);
            refreshingToken = false;
            initStore(data.access_token, data.instance_url);
        });

    };

    var refreshAccessTokenAsync = function (data) {
        const functionName = 'Refresh Access Token';

        var deferred = $q.defer();
        //service.isLoggedIn(
        //    function () { deferred.resolve(true); },
        //    function (msg) { deferred.reject(msg); }
        //);



        var config = {
            method: 'POST',
            url: 'https://login.salesforce.com/services/oauth2/token',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
            data: 'grant_type=refresh_token&client_id=3MVG99OxTyEMCQ3gxoS7zJYNasAk6gttQLnv.h_VYo.HG6xh5esLG.s5JPB_.5FyUCqgNxn_RxgWE7AiuZe41&refresh_token=' + data.refreshToken
        };

        if (debug) { console.log(consolePrefix + functionName + ' > Request > ', config); }

        $http(config).success(function (data, status, headers, config) {

            console.warn('refresh token > ', data);

            initStoreAsync(data.access_token, data.instance_url);

            //deferred.resolve(true);
        });

        return deferred.promise;
    };

    var service = {

        getName: function () {
            return 'Salesforce';
        },

        getInterfaceVersion: function () {
            return 2;
        },

        /**
        * @function init
        * @description Initializes store object. Not used for Salesforce.
        * @memberOf captureApp.webServices.exportTargetVer1.salesforce
        * @param {object} settings - List of target-specific settings.
        */
        init: function (settings) {
            if (settings) {
                if (settings.Session && settings.Url) {
                    initStore(settings.Session, settings.Url);
                }

                console.warn('enableOAuth > ', enableOAuth);
                if (enableOAuth) {
                    if (settings.refreshToken || settings.accessToken) {
                        //$q
                        //    .when({ accessToken: settings.accessToken, url: settings.Url, refreshToken: settings.refreshToken })
                        //    .then(initStoreAsync);
                        initStore(settings.accessToken, settings.Url, settings.refreshToken);                       
                    }
                }
            }
        },

        //login: function (successCallback, failCallback, silent) {

        //    console.log('000000000000000000 LOGIN 000000000000000000');

        //    if (debug) { console.log(debug + 'Logging into Salesforce...'); }

        //    if (!store.refreshToken) {
        //        try { failCallback('Please open Settings and enter your user credentials'); } catch (e) { }
        //        return;
        //    }

        //    //var openTab = function () {
        //    //    try {
        //    //        // TODO validate the assumption that any pcrDatabaseId contains uid (before period) and that the url form is the same for all PCR users/orgs 
        //    //        var uid = store.pcrDatabaseId.split('.')[0];
        //    //        chrome.tabs.create({ url: 'https://www2.pcrecruiter.net/pcr.asp?uid=odbc.' + uid }, function () { });
        //    //    } catch (e) {

        //    //    }
        //    //};

        //    var config = {
        //        'client_id': '9ca842e02dce70de6ead42609a88032e569ccd6de8e4cc656d799cf52065eb41',
        //        'client_secret': 'c13303124a00dfc9cdf36dcf5bd045a496632374182e106d1e56c570e6d1f790',
        //        'grant_type': 'refresh_token',
        //        'refresh_token': '4b0d686b856f9645de68192d7fc5d3baaccb91e3d11afac8bb477ef9ab3c64cd'//store.refreshToken
        //    };

        //    var request = buildRequest('', successCallback, failCallback);
        //    request.url = 'https://accounts.salesloft.com/oauth/token';
        //    request.type = 'POST';
        //    request.data = JSON.stringify(config);
        //    request.success = function (successResponse, status, xhr) {
        //        store.refreshToken = successResponse.refresh_token;
        //        store.accessToken = successResponse.access_token;


        //        //if (silent === false) {
        //        //    openTab();
        //        //}
        //        console.log('000000000000000000 ACCESS TOKEN 000000000000000000');
        //        console.log(store.accessToken);
        //        successCallback();
        //    };
        //    jQuery.ajax(request);
        //},
        //  Log us in
        login: function (successCallback, failCallback, silent, options) {
            const functionName = 'Is Logged In';
            try {
                if (debug) { console.log('Logging into salesforce... silent=', silent); }

                if (options && options.enableOAuth) {
                    enableOAuth = true;
                }

                console.warn('enableOAuth > ', enableOAuth);
                if (enableOAuth) {

                    if (silent) {
                        initStore(store.id,  store.url, savedRefreshToken);
                    } else {

                        var target = 'sf';
                        var sitekey = userInfoStore.getSiteKey();
                        var refreshToken = savedRefreshToken || '';
                        var server = OAuthServer; // 'https://account-staging.broadlook.com';
                        // DEV MODE!
                        //if (true) {
                        //    server = 'http://localhost:52000';
                        //}
                        var url = server + '/Capture/Auth/?sitekey=' + sitekey + '&target=' + target + '&refreshToken=' + refreshToken;

                        // reset local settings
                        bgService.setValue('settings', null);

                        //$scope.openPage(url, true);
                        chrome.tabs.create({ url: url }, function () { });
                    }

                    return;
                }



                //chrome.tabs.create({ url: 'https://na1.salesforce.com/001/o' }, function () { });

                if (debug) { console.log(debug + 'Looking for salesforce session...'); }
                var checkTabs = function (tabs) {
                    if (!tabs || tabs.length === 0) {
                        if (debug) { console.log(debug + 'salesforce tab not found'); }
                        if (silent) {
                            try { failCallback(); } catch (e) { }
                        }
                        else {
                            chrome.tabs.create({ url: 'https://login.salesforce.com' }, function () { });
                            //chrome.tabs.create({ url: 'https://na1.salesforce.com/001/o' }, function () { });
                        }
                        return;
                    }

                    var tab = tabs.pop();
                    //if (tab.url && tab.url.indexOf('https://') === 0 && tab.url.indexOf('salesforce.com/') > 0) {
                    if (tab.url && tab.url.indexOf('https://') === 0 && (tab.url.indexOf('.salesforce.com/') > 0 || tab.url.indexOf('.visual.force.com/') > 0 || tab.url.indexOf('.lightning.force.com/') > 0)) {
                        if (debug) { console.log(functionName + ' > Salesforce tab found > ', tab.url); }
                        var url;
                        var parts;
                        if (tab.url.indexOf('.visual.force.com/') > 0) {
                            url = tab.url.substring(0, tab.url.indexOf('.visual.force.com/'));// + 'visual.force.com'; // no ending "/"
                            parts = url.split('.');
                            url = 'https://' + parts[parts.length - 1] + '.salesforce.com';
                        }
                        else if (tab.url.indexOf('.lightning.force.com/') > 0) {
                            url = tab.url.substring(0, tab.url.indexOf('.lightning.force.com/'));
                            parts = url.split('//');
                            url = 'https://' + parts[parts.length - 1] + '.salesforce.com';
                        }
                        else {
                            url = tab.url.substring(0, tab.url.indexOf('.salesforce.com/') + 15); // no ending "/"
                        }

                        //if (debug) { console.log(debug + 'salesforce tab found, querying for session id', tab.url); }

                        chrome.cookies.getAll({ 'url': tab.url }, function (cookies) {
                            for (var i = 0; i < cookies.length; i++) {
                                try {
                                    var cookie = cookies[i];
                                    if (cookie.name === 'sid' && invalidSessions[cookie.value] !== true) {
                                        var session = cookie.value;
                                        //var url = tab.url.substring(0, tab.url.indexOf('salesforce.com/') + 14);// no ending "/"
                                        initStore(session, url);
                                        if (debug) { console.log(debug + 'store.ts:', store.ts); }
                                        try { successCallback(); } catch (e) { }
                                        return;
                                    }
                                } catch (e) {
                                    console.log('ERROR in cookie', e.message);
                                }
                            }
                            checkTabs(tabs);
                        });

                    } else {
                        checkTabs(tabs);
                    }
                };

                //chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, checkTabs);
                chrome.tabs.query({}, checkTabs);

            } catch (e) {
                console.error(functionName, e.message);
                failCallback(e.message);
            }
        },

        logout: function (expireSession) {
            console.log('logout. expire? ', expireSession);
            if (expireSession && store.id) {
                invalidSessions[store.id] = true;
            }
            initStore();
        },

        //  Get login info
        isLoggedIn: function (successCallback, failCallback) {
            const functionName = 'Is Logged In';
            try {

                if (debug) { console.log(functionName, store); }

                console.warn('enableOAuth > ', enableOAuth);
                if (enableOAuth) {
                    if (store.id || refreshingToken) {
                        try { successCallback(); } catch (e) { }
                    } else {
                        try { failCallback(); } catch (e) { }
                    }
                    return;
                }


                if (store.id) {
                    if (debug) { console.log(debug + 'store.ts:', store.ts); }

                    if (store.ts) {
                        try {
                            var daysOld = (new Date().getTime() - store.ts.getTime()) / (1000 * 60 * 60 * 24);
                            if (debug) { console.log(debug + 'daysOld:', daysOld); }
                            if (daysOld < 1) {
                                try { successCallback(); } catch (e) { }
                                return;
                            } else {
                                // force expire
                                initStore();
                            }
                        } catch (e) {
                            console.log('*** ERROR in SF daysOld', e.message);
                        }
                    }

                }
                if (debug) { console.log(debug + 'Looking for salesforce session...'); }
                var checkTabs = function (tabs) {
                    if (!tabs || tabs.length === 0) {
                        if (debug) { console.log(debug + 'salesforce tab not found'); }
                        try { failCallback(); } catch (e) { }
                        return;
                    }

                    var tab = tabs.pop();
                    //if (debug) { console.log(debug + 'tab', tab.url, angular.copy(tabs)); }
                    //if (tab.url && tab.url.indexOf('https://') === 0 && tab.url.indexOf('salesforce.com/') > 0) {

                    //    if (debug) { console.log(debug + 'salesforce tab found, querying for session id', tab.url); }

                    if (tab.url && tab.url.indexOf('https://') === 0 &&
                    (tab.url.indexOf('.salesforce.com/') > 0 || tab.url.indexOf('.visual.force.com/') > 0 || tab.url.indexOf('.lightning.force.com/') > 0)) {
                        if (debug) { console.log(functionName + ' > Salesforce tab found > ', tab.url); }
                        var url;
                        try {
                            var parts;
                            if (tab.url.indexOf('.visual.force.com/') > 0) {
                                url = tab.url.substring(0, tab.url.indexOf('.visual.force.com/'));// + 'visual.force.com'; // no ending "/"
                                parts = url.split('.');
                                url = 'https://' + parts[parts.length - 1] + '.salesforce.com';
                            }
                            else if (tab.url.indexOf('.lightning.force.com/') > 0) {
                                url = tab.url.substring(0, tab.url.indexOf('.lightning.force.com/'));
                                parts = url.split('//');
                                url = 'https://' + parts[parts.length - 1] + '.salesforce.com';
                            }
                            else {
                                url = tab.url.substring(0, tab.url.indexOf('.salesforce.com/') + 15); // no ending "/"
                            }
                            console.log(functionName + ' > Salesforce URL found > ', url);
                        } catch (e) {
                            console.error('URL detection failed', e.message);
                        }

                        chrome.cookies.getAll({ 'url': tab.url },

                            function (cookies) {
                                //console.log('cookies', cookies);
                                for (var i = 0; i < cookies.length; i++) {
                                    try {
                                        var cookie = cookies[i];
                                        if (cookie.name === 'sid') {
                                            var session = cookie.value;
                                            //var url = tab.url.substring(0, tab.url.indexOf('salesforce.com/') + 14); // no ending "/"
                                            initStore(session, url);
                                            if (debug) { console.log(debug + 'store.ts:', store.ts); }
                                            try { successCallback(); } catch (e) { }
                                            return;
                                        }
                                    } catch (e) {
                                        console.log('ERROR in cookie', e.message);
                                    }
                                }
                                if (debug) { console.log(debug + 'WARNING: Cookie not found'); }
                                checkTabs(tabs);
                            }

                        );

                    } else {
                        checkTabs(tabs);
                    }
                };

                chrome.tabs.query({}, checkTabs);

            } catch (e) {
                console.error(functionName, e.message);
                failCallback(e.message);
            }
        },

        asyncIsLoggedIn: function () {

            console.log('CHECKING IF ASYNC LOGGED IN');

            var deferred = $q.defer();
            service.isLoggedIn(
                function () { deferred.resolve(true); },
                function (msg) { deferred.reject(msg); }
            );
            return deferred.promise;
        },

        getEntities: function (successCallback, failureCallback) {
            const functionName = 'Get Entities';
            try {
                if (debug) { console.log(consolePrefix + functionName); }
                //successCallback([{ name: 'Lead', type: 'lead' }]);

                checkSession();

                //if (typeof store.url === 'undefined') {
                //    console.error(functionName + ' > Not initialized > ', store);
                //    try { failureCallback('Session expired. Please log in.'); } catch (e) { }
                //    return;
                //}

                //// Use cached values
                //if (store.cache.entities) {
                //    var list = angular.copy(store.cache.entities);
                //    console.log(consolePrefix + functionName + ' > Read from cache > ', list);
                //    successCallback(list);
                //    return;
                //}

                var config = {
                    method: 'GET',
                    url: store.url + '/services/data/v34.0/sobjects',
                    headers: { 'Authorization': 'Bearer ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
                };
                if (debug) { console.log(consolePrefix + functionName + ' > Request > ', config); }

                $http(config).success(function (data, status, headers, config) {

                    var onTrueSuccess = function (data) {
                        try {

                            var list = [];
                            angular.forEach(data.sobjects, function (sobject, index) {
                                list.push({ name: sobject.name, label: sobject.label });
                            });

                            // Cache 
                            store.cache.entities = angular.copy(list);

                            successCallback(list);

                        } catch (e) {
                            console.error(functionName + ' > On True Success > ', e.message);
                            failureCallback('Salesforce API response is invalid');
                        }
                    };

                    defaultOnSuccessHandler(data, status, headers, config, onTrueSuccess, failureCallback);
                }

                ).error(function (data, status) {
                    defaultOnErrorHandler(data, status, failureCallback);
                });

            } catch (e) {
                console.error(functionName, e.message);
                failureCallback(e.message);
            }

        },

        // successCallback: function(fields)
        // fields: [ {name: '', label: '' } ]
        getFields: function (entityType, successCallback, failureCallback) {
            const functionName = 'Get Fields';
            try {
                if (debug) { console.log(consolePrefix + functionName + ' > Type > ', entityType); }

                var config = {
                    method: 'GET',
                    url: store.url + '/services/data/v34.0/sobjects/' + entityType + '/describe',
                    headers: { 'Authorization': 'Bearer ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
                };
                if (debug) { console.log(consolePrefix + functionName + ' > Request > ', config); }

                $http(config).success(function (data, status, headers, config) {

                    var onTrueSuccess = function (data) {
                        try {

                            var list = [];
                            angular.forEach(data.fields, function (field, index) {

                                if (!field.updateable) { return; }

                                var values = [];
                                if (field.picklistValues) {
                                    angular.forEach(field.picklistValues, function (picklistValue) {
                                        values.push({ value: picklistValue.value, label: picklistValue.label });
                                    });
                                }

                                var f = { name: field.name, label: field.label, length: field.length };

                                f.required = !field.nillable && field.updateable;

                                if (values.length > 0) {
                                    f.values = values;
                                }

                                list.push(f);

                            });

                            //store.cache['fields:' + entityType] = angular.copy(list);

                            successCallback(list);

                        } catch (e) {
                            console.error(functionName + ' > On True Success > ', e.message);
                            failureCallback('Salesforce API response is invalid');
                        }
                    };

                    defaultOnSuccessHandler(data, status, headers, config, onTrueSuccess, failureCallback);
                }

                ).error(function (data, status) {
                    defaultOnErrorHandler(data, status, failureCallback);
                });

                //jQuery.ajax({
                //    type: 'GET',
                //    url: url,
                //    contentType: 'application/json',
                //    beforeSend: function (xhr) {
                //        xhr.setRequestHeader('Authorization', 'Bearer ' + store.id);
                //        xhr.setRequestHeader('Accept', 'application/json');
                //    },
                //    success: function (successResponse) {

                //        console.log('successResponse=', successResponse);

                //        if (!successResponse) {
                //            console.error('null response!');
                //            failureCallback('Cannot get Salesforce object description');
                //            return;
                //        }

                //        var ff = [];
                //        angular.forEach(successResponse.fields, function (field, index) {

                //            //var def = null;
                //            var vv = [];
                //            if (field.picklistValues) {
                //                angular.forEach(field.picklistValues, function (pv, pvi) {
                //                    vv.push({ value: pv.value, label: pv.label });
                //                    //if()
                //                    //default: value.default
                //                });
                //            }

                //            if (field.updateable) {
                //                var f = { name: field.name, label: field.label, length: field.length };

                //                f.required = !field.nillable && field.updateable;

                //                if (vv.length > 0) {
                //                    f.values = vv;
                //                }

                //                ff.push(f);
                //            }
                //        });

                //        successCallback(ff);
                //    },
                //    error: function (errorResponse) {

                //        console.error('errorResponse=', errorResponse);
                //        failureCallback(errorResponse);
                //    }

                //});
            } catch (e) {
                console.error(functionName, e.message);
                failureCallback(e.message);
            }
        },

        // successCallback: function(maps)
        // maps: [ {captureField: { name: '', label: '' }, crmField: { name: '', label: '' } } ]
        getDefaultExportMaps: function (successCallback, failureCallback) {

            console.log('GETTING DEFAULT EXPORT MAPS');

            var defaultCaptureMap = {
                fields: [
                    { captureField: 'first', label: 'First Name', crmField: null },
                    { captureField: 'last', label: 'Last Name', crmField: null },
                    { captureField: 'jobtitle', label: 'Job Title', crmField: null },
                    { captureField: 'company', label: 'Company Name', crmField: null },
                    { captureField: 'email', label: 'Email', crmField: null },
                    { captureField: 'phone', label: 'Phone', crmField: null },
                    { captureField: 'phone2', label: 'Phone 2', crmField: null },
                    { captureField: 'website', label: 'Website', crmField: null },
                    { captureField: 'bio', label: 'Bio', crmField: null },
                    { captureField: 'address1', label: 'Address Line 1', crmField: null },
                    { captureField: 'address2', label: 'Address Line 2', crmField: null },
                    { captureField: 'city', label: 'City', crmField: null },
                    { captureField: 'state', label: 'State', crmField: null },
                    { captureField: 'zip', label: 'Zip Code', crmField: null },
                    { captureField: 'country', label: 'Country', crmField: null },
                ]
            };

            //var contactMap = {
            //    fields: [
            //        { captureField: 'first', label: 'First Name',  crmField: { name: 'FirstName', label: 'First Name' } },
            //        { captureField: 'last', label: 'Last Name', crmField: { name: 'LastName', label: 'Last Name' } },
            //        { captureField: 'jobtitle', label: 'Job Title', crmField: { name: 'Title', label: 'Title' } },
            //        { captureField: 'company', label: 'Company Name', crmField: { name: 'Account.Name', label: 'Account Name' } },
            //        { captureField: 'email', label: 'Email', crmField: { name: 'Email', label: 'Email' } },
            //        { captureField: 'phone', label: 'Phone', crmField: { name: 'Phone', label: 'Phone' } },
            //        { captureField: 'phone2', label: 'Phone 2', crmField: { name: 'MobilePhone', label: 'Mobile Phone' } },
            //        { captureField: 'website', label: 'Website', crmField: null },
            //        { captureField: 'bio', label: 'Bio', crmField: { name: 'Description', label: 'Description' } },
            //        { captureField: 'address1', label: 'Address Line 1', crmField: { name: 'MailingStreet', label: 'Mailing Street' } },
            //        { captureField: 'address2', label: 'Address Line 2', crmField: null },
            //        { captureField: 'city', label: 'City', crmField: { name: 'MailingCity', label: 'Mailing City' } },
            //        { captureField: 'state', label: 'State', crmField: { name: 'MailingState', label: 'Mailing State' } },
            //        { captureField: 'zip', label: 'Zip Code', crmField: { name: 'MailingPostalCode', label: 'Mailing Postal Code' } },
            //        { captureField: 'country', label: 'Country', crmField: { name: 'MailingCountry', label: 'Mailing Country' } },
            //    ]
            //};

            var contactMap = {
                fields: [
                    { target: { name: 'FirstName', label: 'First Name' }, source: { type: 'capture', value: { captureField: 'first', label: 'First Name' } } },
                    { target: { name: 'LastName', label: 'Last Name' }, source: { type: 'capture', value: { captureField: 'last', label: 'Last Name' } } },
                    { target: { name: 'Title', label: 'Title' }, source: { type: 'capture', value: { captureField: 'jobtitle', label: 'Job Title' } } },
                    { target: { name: 'Company', label: 'Company' }, source: { type: 'capture', value: { captureField: 'company', label: 'Company Name' } } },
                    { target: { name: 'Email', label: 'Email' }, source: { type: 'capture', value: { captureField: 'email', label: 'Email' } } },
                    { target: { name: 'Phone', label: 'Phone' }, source: { type: 'capture', value: { captureField: 'phone', label: 'Phone' } } },
                    { target: { name: 'MobilePhone', label: 'Mobile Phone' }, source: { type: 'capture', value: { captureField: 'phone2', label: 'Phone 2' } } },
                    { target: { name: 'Description', label: 'Description' }, source: { type: 'capture', value: { captureField: 'bio', label: 'Bio' } } },
                    { target: { name: 'MailingStreet', label: 'Street' }, source: { type: 'capture', value: { captureField: 'address', label: 'Address Line 1 and 2' } } },
                    { target: { name: 'MailingCity', label: 'City' }, source: { type: 'capture', value: { captureField: 'city', label: 'City' } } },
                    { target: { name: 'MailingStateCode', label: 'State/Province Code' }, source: { type: 'capture', value: { captureField: 'stateCode', label: 'State Code' } } },
                    { target: { name: 'MailingPostalCode', label: 'Postal Code' }, source: { type: 'capture', value: { captureField: 'zip', label: 'Zip Code' } } },
                    { target: { name: 'MailingCountryCode', label: 'Country Code' }, source: { type: 'capture', value: { captureField: 'countryCode', label: 'Country Code' } } },
                    {
                        target: { name: 'AccountId', label: 'Account Name' }, source: {
                            type: 'lookup',
                            value: {
                                appProperty: 'company',
                                message: 'Select Account',
                                type: 'Account',
                                required: false,
                                allowNew: true,
                                resolve: 'createNewAccount'
                            }
                        }
                    },
                    {
                        target: { name: 'CampaignMember', label: 'Add To Campaign' },
                        source: {
                            type: 'action',
                            value: {
                                appProperty: 'campaign',
                                message: 'Add Contact to Campaign',
                                type: 'Campaign',
                                required: false,
                                enabled: false,
                                resolve: 'addContactToCampaign'
                            }
                        }
                    },
                ]
            };

            var leadMap = {
                fields: [
                    { target: { name: 'FirstName', label: 'First Name' }, source: { type: 'capture', value: { captureField: 'first', label: 'First Name' } } },
                    { target: { name: 'LastName', label: 'Last Name' }, source: { type: 'capture', value: { captureField: 'last', label: 'Last Name' } } },
                    { target: { name: 'Title', label: 'Title' }, source: { type: 'capture', value: { captureField: 'jobtitle', label: 'Job Title' } } },
                    { target: { name: 'Company', label: 'Company' }, source: { type: 'capture', value: { captureField: 'company', label: 'Company Name' } } },
                    { target: { name: 'Email', label: 'Email' }, source: { type: 'capture', value: { captureField: 'email', label: 'Email' } } },
                    { target: { name: 'Phone', label: 'Phone' }, source: { type: 'capture', value: { captureField: 'phone', label: 'Phone' } } },
                    { target: { name: 'MobilePhone', label: 'Mobile Phone' }, source: { type: 'capture', value: { captureField: 'phone2', label: 'Phone 2' } } },
                    { target: { name: 'Website', label: 'Website' }, source: { type: 'capture', value: { captureField: 'website', label: 'Website' } } },
                    { target: { name: 'Description', label: 'Description' }, source: { type: 'capture', value: { captureField: 'bio', label: 'Bio' } } },
                    { target: { name: 'Street', label: 'Street' }, source: { type: 'capture', value: { captureField: 'address', label: 'Address Line 1 and 2' } } },
                    { target: { name: 'City', label: 'City' }, source: { type: 'capture', value: { captureField: 'city', label: 'City' } } },
                    { target: { name: 'StateCode', label: 'State/Province Code' }, source: { type: 'capture', value: { captureField: 'stateCode', label: 'State Code' } } },
                    { target: { name: 'PostalCode', label: 'Postal Code' }, source: { type: 'capture', value: { captureField: 'zip', label: 'Zip Code' } } },
                    { target: { name: 'CountryCode', label: 'Country Code' }, source: { type: 'capture', value: { captureField: 'countryCode', label: 'Country Code' } } },
                    {
                        target: { name: 'CampaignMember', label: 'Add To Campaign' },
                        source: {
                            type: 'action',
                            value: {
                                message: 'Add Lead to Campaign',
                                type: 'Campaign',
                                required: false,
                                enabled: true,
                                resolve: 'addLeadToCampaign'
                                //function (service, lookupId, objectId, successCallback, failCallback) {
                                //    service.createRecord('CampaignMember', { CampaignId: lookupId, LeadId: objectId }, {}, successCallback, failCallback);
                                //},

                            }
                        }
                    },
                    {
                        target: { name: 'LeadSource', label: 'Lead Source' },
                        source: {
                            type: 'picklist',
                            value: {
                                message: 'Set Lead Source',
                                defaultValue: null,
                                required: false,
                                allowNew: false
                            }
                        }
                    },


                //return [{
                //    crmProperty: 'Campaign', appProperty: 'campaign', message: 'Select Campaign', type: 'Campaign', required: false, allowNew: false,
                //    resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //        service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    },
                //}, {
                //    crmProperty: 'LeadSource', appProperty: null, message: 'Select Lead Source', type: 'Lead', required: true, allowNew: false,
                //    picklist: true//,
                //    //resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //    //    console.log('resolve called', lookupId, objectId)
                //    //    //service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    //},
                //}];

                    //{ captureField: 'first', label: 'First Name', crmField: { name: 'FirstName', label: 'First Name' } },
                    //{ captureField: 'last', label: 'Last Name', crmField: { name: 'LastName', label: 'Last Name' } },
                    //{ captureField: 'jobtitle', label: 'Job Title', crmField: { name: 'Title', label: 'Title' } },
                    //{ captureField: 'company', label: 'Company Name', crmField: { name: 'Company', label: 'Company' } },
                    //{ captureField: 'email', label: 'Email', crmField: { name: 'Email', label: 'Email' } },
                    //{ captureField: 'phone', label: 'Phone', crmField: { name: 'Phone', label: 'Phone' } },
                    //{ captureField: 'phone2', label: 'Phone 2', crmField: { name: 'MobilePhone', label: 'Mobile Phone' } },
                    //{ captureField: 'website', label: 'Website', crmField: { name: 'Website', label: 'Website' } },
                    //{ captureField: 'bio', label: 'Bio', crmField: { name: 'Description', label: 'Description' } },
                    //{ captureField: 'address1', label: 'Address Line 1', crmField: { name: 'Street', label: 'Street' } },
                    //{ captureField: 'address2', label: 'Address Line 2', crmField: null },
                    //{ captureField: 'city', label: 'City', crmField: { name: 'City', label: 'City' } },
                    //{ captureField: 'state', label: 'State', crmField: { name: 'State', label: 'State' } },
                    //{ captureField: 'zip', label: 'Zip Code', crmField: { name: 'PostalCode', label: 'Postal Code' } },
                    //{ captureField: 'country', label: 'Country', crmField: { name: 'Country', label: 'Country' } },
                ]
            };


            var maps = [];

            maps.push({ name: 'lead', label: 'Lead', map: leadMap });
            maps.push({ name: 'contact', label: 'Contact', map: contactMap });

            successCallback(maps);
        },

        resolveLookup: function (actionId, lookupId, objectId, successCallback, failCallback) {

            console.log('RESOLVING LOOKUP');

            if (actionId === 'addLeadToCampaign') {
                service.createRecord('CampaignMember', { CampaignId: lookupId, LeadId: objectId }, {}, successCallback, failCallback);
            } else if (actionId === 'addContactToCampaign') {
                service.createRecord('CampaignMember', { CampaignId: lookupId, ContactId: objectId }, {}, successCallback, failCallback);
            } else if (actionId === 'createNewAccount') {

                if (lookupId && typeof lookupId.newName === 'undefined') {
                    console.log('EXISTING ACCOUNT', lookupId);
                    //service.updateRecord(objectId, 'Contact', { AccountId: lookupId }, successCallback, failCallback); // No need: was already posted
                    successCallback();
                } else {

                    console.log('NEW ACCOUNT', lookupId.newName);

                    var createSourceRecord = angular.copy(lookupId.record);
                    //Replace new Account name with user-entered value
                    createSourceRecord.company = lookupId.newName;
                    var createOptions = { map: lookupId.map };

                    service.createRecord('Account', createSourceRecord, createOptions,

                        // account was created
                        function (accountLink, accountId) {
                            console.log('account was created', accountLink, accountId, lookupId, objectId);
                            if (objectId) {
                                // Link was requested
                                var updateData = {};
                                updateData[lookupId.crmProperty] = accountId;
                                service.updateRecord(objectId, 'Contact', updateData, successCallback, failCallback);
                            } else {
                                // Link was not requested
                                successCallback(accountLink, accountId);
                            }
                        },

                        // Account was not created
                        function (msg) {
                            console.error('account was not created', msg);
                            failCallback('Account was not created');
                        }
                    );
                }
            } else {
                console.log('ERROR: Unknown action', lookupId);
                failCallback('Unknown action');
            }
        },

        getDefinition: function (entityType, successCallback, failureCallback) {

            console.log('GETTING DEFINITION');

            var def = {};
            entityType = entityType.toLowerCase();
            if (entityType === 'lead') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description', 'RevenueAvg', 'EmployeesAvg'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description', 'RevenueAvg', 'EmployeesAvg', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { display: 'First Name', group: 'G1' },
                            'LastName': { display: 'Last Name', group: 'G1' },
                            'Title': { display: 'Job Title', group: 'G1' },
                            'Company': { display: 'Company', group: 'G1' },
                            'Email': { display: 'Email', group: 'G1' },
                            'Phone': { display: 'Phone', group: 'G1' },
                            'MobilePhone': { display: 'Mobile Phone', group: 'G1' },
                            'Website': { display: 'Website', group: 'G1' },
                            'Description': { display: 'Description', group: 'G1' },
                            'RevenueAvg': { id: 'AnnualRevenue', display: 'Annual Revenue', group: 'G1' },
                            'EmployeesAvg': { id: 'NumberOfEmployees', display: 'Employees', group: 'G1' },

                            'Street': { display: 'Street', group: 'G2' },
                            'City': { display: 'City', group: 'G2' },
                            'State': { display: 'State/Province', group: 'G2' },
                            'PostalCode': { display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { display: 'Country', group: 'G2' },
                        }
                    }
                };

            } else if (entityType === 'contact') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { id: 'G1', display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'MobilePhone', 'Description'] },
                            'G2': { id: 'G2', display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'MobilePhone', 'Description', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { id: 'FirstName', display: 'First Name', group: 'G1' },
                            'LastName': { id: 'LastName', display: 'Last Name', group: 'G1' },
                            'Title': { id: 'Title', display: 'Job Title', group: 'G1' },
                            'Email': { id: 'Email', display: 'Email', group: 'G1' },
                            'Phone': { id: 'Phone', display: 'Phone', group: 'G1' },
                            'MobilePhone': { id: 'MobilePhone', display: 'Mobile Phone', group: 'G1' },
                            //'Website': { id: 'Website', display: 'Website', group: 'G1' },
                            'Description': { id: 'Description', display: 'Description', group: 'G1' },

                            'Street': { id: 'Street', display: 'Street', group: 'G2' },
                            'City': { id: 'City', display: 'City', group: 'G2' },
                            'State': { id: 'State', display: 'State/Province', group: 'G2' },
                            'PostalCode': { id: 'PostalCode', display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { id: 'Country', display: 'Country', group: 'G2' }
                        }
                    }
                };
            } else {
                failureCallback('Invalid record type');
            }
            successCallback(def);
        },

        //  From sf lead to app contact
        fromLead: function (sfObject) {
            var contact = {};
            mapFromField(contact, 'first', sfObject, 'FirstName');
            mapFromField(contact, 'last', sfObject, 'LastName');
            mapFromField(contact, 'jobtitle', sfObject, 'Title');
            mapFromField(contact, 'company', sfObject, 'Company');
            mapFromField(contact, 'email', sfObject, 'Email');
            mapFromField(contact, 'phone', sfObject, 'Phone');
            mapFromField(contact, 'phone2', sfObject, 'MobilePhone');
            mapFromField(contact, 'website', sfObject, 'Website');
            mapFromField(contact, 'bio', sfObject, 'Description');
            mapFromField(contact, 'revenue', sfObject, 'AnnualRevenue');
            mapFromField(contact, 'revenueAvg', sfObject, 'AnnualRevenue');
            mapFromField(contact, 'employees', sfObject, 'NumberOfEmployees');
            mapFromField(contact, 'employeesAvg', sfObject, 'NumberOfEmployees');
            mapFromField(contact, 'address1', sfObject, 'Street');
            mapFromField(contact, 'city', sfObject, 'City');
            mapFromField(contact, 'state', sfObject, 'State');
            mapFromField(contact, 'zip', sfObject, 'PostalCode');
            mapFromField(contact, 'country', sfObject, 'Country');
            contact._link = store.url + '/' + sfObject.Id;
            contact._type = 'Lead';
            contact._id = sfObject.Id;
            return contact;
        },
        //  From app contact to sf lead
        toLead: function (contact) {
            var sfObject = {};
            mapField(contact, 'first', sfObject, 'FirstName');
            mapField(contact, 'last', sfObject, 'LastName');
            mapField(contact, 'jobtitle', sfObject, 'Title');
            mapField(contact, 'company', sfObject, 'Company');
            mapField(contact, 'email', sfObject, 'Email');
            mapField(contact, 'phone', sfObject, 'Phone');
            mapField(contact, 'phone2', sfObject, 'MobilePhone');
            mapField(contact, 'website', sfObject, 'Website');
            mapField(contact, 'bio', sfObject, 'Description');
            mapField(contact, 'revenueAvg', sfObject, 'AnnualRevenue');
            mapField(contact, 'employeesAvg', sfObject, 'NumberOfEmployees');
            mapField(contact, 'address1', sfObject, 'Street');
            mapField(contact, 'city', sfObject, 'City');
            mapField(contact, 'state', sfObject, 'State');
            mapField(contact, 'zip', sfObject, 'PostalCode');
            mapField(contact, 'country', sfObject, 'Country');
            return sfObject;
        },
        //  From sf contact to app contact
        fromContact: function (sfObject) {
            var contact = {};
            mapFromField(contact, 'first', sfObject, 'FirstName');
            mapFromField(contact, 'last', sfObject, 'LastName');
            mapFromField(contact, 'jobtitle', sfObject, 'Title');
            mapFromField(contact, 'company', sfObject, 'Account.Name');
            mapFromField(contact, 'email', sfObject, 'Email');
            mapFromField(contact, 'phone', sfObject, 'Phone');
            mapFromField(contact, 'phone2', sfObject, 'MobilePhone');
            mapFromField(contact, 'bio', sfObject, 'Description');
            mapFromField(contact, 'address1', sfObject, 'MailingStreet');
            mapFromField(contact, 'city', sfObject, 'MailingCity');
            mapFromField(contact, 'state', sfObject, 'MailingState');
            mapFromField(contact, 'zip', sfObject, 'MailingPostalCode');
            mapFromField(contact, 'country', sfObject, 'MailingCountry');
            contact._link = store.url + '/' + sfObject.Id;
            contact._type = 'Contact';
            contact._id = sfObject.Id;
            return contact;
        },
        //  from app contact to sf contact
        toContact: function (contact) {
            var sfObject = {};
            mapField(contact, 'first', sfObject, 'FirstName');
            mapField(contact, 'last', sfObject, 'LastName');
            mapField(contact, 'jobtitle', sfObject, 'Title');
            mapField(contact, 'email', sfObject, 'Email');
            mapField(contact, 'phone', sfObject, 'Phone');
            mapField(contact, 'phone2', sfObject, 'MobilePhone');
            mapField(contact, 'bio', sfObject, 'Description');
            mapField(contact, 'address1', sfObject, 'MailingStreet');
            mapField(contact, 'city', sfObject, 'MailingCity');
            mapField(contact, 'state', sfObject, 'MailingState');
            mapField(contact, 'zip', sfObject, 'MailingPostalCode');
            mapField(contact, 'country', sfObject, 'MailingCountry');
            return sfObject;
        },
        //  From sf account to app contact
        fromAccount: function (sfObject) {
            var contact = {};
            mapFromField(contact, 'website', sfObject, 'Website');
            mapFromField(contact, 'company', sfObject, 'Name');
            //mapFromField(contact, 'jobtitle', sfObject, 'Title');
            //mapFromField(contact, 'email', sfObject, 'Email');
            //mapFromField(contact, 'phone', sfObject, 'Phone');
            //mapFromField(contact, 'phone2', sfObject, 'MobilePhone');
            //mapFromField(contact, 'bio', sfObject, 'Description');
            //mapFromField(contact, 'address1', sfObject, 'MailingStreet');
            mapFromField(contact, 'city', sfObject, 'BillingCity');
            mapFromField(contact, 'state', sfObject, 'BillingState');
            //mapFromField(contact, 'zip', sfObject, 'MailingPostalCode');
            //mapFromField(contact, 'country', sfObject, 'MailingCountry');
            //mapFromField(contact, 'country', sfObject, 'MailingCountry');
            contact._createdDate = sfObject.CreatedDate;
            contact._link = store.url + '/' + sfObject.Id;
            //contact._link = store.url + sfObject.attributes.url;
            contact._type = 'Account';
            contact._id = sfObject.Id;
            return contact;
        },
        //  From app contact to sf object
        toNativeRecord: function (contact, entityType) {
            entityType = entityType.toLowerCase();
            if (entityType === 'contact') { return this.toContact(contact); }
            if (entityType === 'lead') { return this.toLead(contact); }
        },
        //  From sf entity to app contact
        fromNativeRecord: function (sfEntity, entityType) {
            entityType = entityType.toLowerCase();
            if (entityType === 'contact') { return this.fromContact(sfEntity); }
            if (entityType === 'lead') { return this.fromLead(sfEntity); }
            if (entityType === 'account') { return this.fromAccount(sfEntity); }
        },

        //  From CRM object to lookup object (each object is defined as {label: '', link: ''})
        toLookupObject: function (crmObject, entityType) {
            if (debug) { console.log(debug + 'toLookupObject->entityType', entityType, '->crmObject', crmObject); }

            entityType = entityType.toLowerCase();
            var lookupObject = { label: '', link: '' };
            var appObject = null;
            if (entityType === 'contact') { appObject = this.fromContact(crmObject); }
            else if (entityType === 'lead') {
                appObject = this.fromLead(crmObject);
            }
            else if (entityType === 'account') {
                appObject = this.fromAccount(crmObject);
                var cityState = '';
                if (appObject.city) { cityState = appObject.city; }
                if (appObject.state) {
                    if (cityState) { cityState = cityState + ', ' + appObject.state; }
                    else { cityState = appObject.state; }
                }
                if (cityState) { cityState = ' (' + cityState + ')'; }
                lookupObject.label = (appObject.company || '(no name)') + cityState;
                lookupObject.link = appObject._link;
                lookupObject.id = appObject._id;
            }
            else if (entityType === 'campaign') {
                lookupObject.label = (crmObject.Name || '(no name)');
                lookupObject.link = store.url + '/' + crmObject.Id;
                lookupObject.id = crmObject.Id;
            } else {
                // Assume there is Id and Name fields
                lookupObject.label = (crmObject.Name || '(no name)');
                lookupObject.link = store.url + '/' + crmObject.Id;
                lookupObject.id = crmObject.Id;
            }
            if (debug) { console.log(debug + 'toLookupObject->result', lookupObject); }
            return lookupObject;
        },

        getRequiredLookups: function (entityType, actualMap) {

            console.log('GETTING REQUIRED LOOKUPS');

            entityType = entityType.toLowerCase();

            if (actualMap) {

                if (debug) { console.log(debug + 'getRequiredLookups->map', actualMap); }

                var aa = [];

                // convert map def to lookup def

                for (var i = 0, l = actualMap.fields.length; i < l; i++) {
                    var f = actualMap.fields[i];
                    if (f.source && (f.source.type === 'lookup' || f.source.type === 'picklist' || f.source.type === 'action')) {

                        if (f.source && f.source.value && f.source.value.enabled === false) {
                            console.log('disabled action', angular.copy(f));
                            continue;
                        }

                        var a;

                        if (f.source.value) {
                            a = {
                                crmProperty: f.target.name,
                                appProperty: f.source.value.appProperty,
                                message: f.source.value.message,
                                type: f.source.value.type,
                                defaultValue: f.source.value.defaultValue ? { id: f.source.value.defaultValue.value, label: f.source.value.defaultValue.label } : null,
                                required: f.source.value.required,
                                allowNew: f.source.value.allowNew,
                                picklist: f.source.value.picklist || f.source.type === 'picklist',
                                resolve: f.source.value.resolve,
                                hidden: f.source.value.hidden
                            };

                            if (a.crmProperty === 'CampaignMember' && !a.appProperty) {
                                a.appProperty = 'campaign';
                            }
                        } else {
                            a = {
                                crmProperty: f.target.name,
                                appProperty: '',
                                message: '',
                                type: '',
                                defaultValue: '',
                                required: false,
                                allowNew: false,
                                picklist: f.source.type === 'picklist',
                                resolve: null,
                            };
                        }

                        if (f.source.type === 'picklist') {
                            a.type = entityType;
                            a.allowNew = false;
                        }


                        aa.push(a);
                    }
                }

                if (debug) { console.log(debug + 'getRequiredLookups->result', aa); }

                return aa;
            }

            if (entityType === 'contact') {
                return [{ crmProperty: 'AccountId', appProperty: 'company', message: 'Select Account', type: 'Account', required: false, allowNew: true }
                    //,
                    //    { crmProperty: 'OwnerId', appProperty: 'full', message: 'Select account owner', type: 'SystemUser', required: false, allowNew: false }
                ];
            }
            if (entityType === 'lead') {
                //return [{
                //    crmProperty: 'Campaign', appProperty: 'campaign', message: 'Select Campaign', type: 'Campaign', required: false, allowNew: false,
                //    resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //        service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    },
                //}, {
                //    crmProperty: 'LeadSource', appProperty: null, message: 'Select Lead Source', type: 'Lead', required: true, allowNew: false,
                //    picklist: true//,
                //    //resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //    //    console.log('resolve called', lookupId, objectId)
                //    //    //service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    //},
                //}];
            }
            if (entityType === 'account') { return []; }
            return [];
        },


        asyncGetDefinition: function (entityType) {
            var deferred = $q.defer();
            service.getDefinition(entityType,
                function (def) { deferred.resolve(def); },
                function (msg) { deferred.reject(msg); }
            );
            return deferred.promise;
        },

        //-- CRUD --//
        //  Create a record with data provided
        //      successCallback: function(recordId)
        createRecord: function (recordType, captureRecord, createOptions, successCallback, failCallback) {

            console.log('CREATING RECORD WITH');
            console.log(recordType);

            if (recordType === 'lead') { recordType = 'Lead'; }
            if (recordType === 'contact') { recordType = 'Contact'; }
            if (recordType === 'account') { recordType = 'Account'; }

            //var service = this;
            var attemptsLeft = 10;
            var record = {};
            var url = store.url + '/services/data/v34.0/sobjects/' + recordType + '/';

            var createRecordWithMap = function (map, captureRecord) {

                var r = {};

                if (map && map.fields) {
                    var i = map.fields.length;
                    while (i--) {
                        var f = map.fields[i];
                        if (f.target && f.target.name) {
                            if (f.source) {
                                var a = r[f.target.name];
                                var b = '';
                                var l = f.target.length || 0;
                                if (f.source.type === 'capture') {
                                    b = captureRecord[f.source.value.captureField] || '';
                                    if (a) {
                                        r[f.target.name] = service.limitstr(a + ' ' + b, l);
                                    } else {
                                        r[f.target.name] = service.limitstr(b, l);
                                    }
                                } else if (f.source.type === 'text' && f.source.value) {
                                    b = f.source.value.text || '';
                                    if (r[f.target.name]) {
                                        r[f.target.name] = service.limitstr(a + ' ' + b, l);
                                    } else {
                                        r[f.target.name] = service.limitstr(b, l);
                                    }
                                }
                                //else if (f.source.type === 'lookup')
                                //{ r[f.target.name] = f.source.value.text; }
                            }
                        }
                    }
                }

                if (createOptions && createOptions.mappedProperties) {
                    var j = createOptions.mappedProperties.length;
                    while (j--)
                    { r[createOptions.mappedProperties[j].name] = createOptions.mappedProperties[j].value; }
                }

                console.log('SF record', r);

                return r;
            };

            var handleError = function (errorResponse, f) {

                if (debug) { console.log(debug + 'handleError', errorResponse); }

                var tryAgain = false;
                var delayDecision = false;
                var msg = '';
                var text = '';

                var makeDecision = function () {

                    if (tryAgain) {
                        if (debug) { console.log(debug + 'trying again', record); }
                        f();
                    }
                    else {
                        if (msg === '') {
                            msg = errorResponse.responseText;
                        }
                        if (typeof msg === 'undefined' || msg === '') {
                            msg = 'Export error';
                        }
                        failCallback(msg);
                    }
                };


                if (errorResponse.responseJSON) {

                    var i = errorResponse.responseJSON.length;

                    if (i--) {

                        msg += errorResponse.responseJSON[i].message + '  ';

                        var errorCode = errorResponse.responseJSON[i].errorCode;

                        if (errorCode === 'INVALID_SESSION_ID') {
                            service.logout(true);
                            failCallback('Session expired. Please log in.');
                            //} else if (errorCode === 'INVALID_FIELD_FOR_INSERT_UPDATE') {
                            //    var k = errorResponse.responseJSON[i].fields.length;
                            //    while (k--) {
                            //        delete record[errorResponse.responseJSON[i].fields[k]];
                            //        tryAgain = attemptsLeft > 0;
                            //        attemptsLeft--;
                            //    }
                        } else if (errorCode === 'FIELD_INTEGRITY_EXCEPTION') {
                            var j = errorResponse.responseJSON[i].fields.length;
                            while (j--) {
                                delete record[errorResponse.responseJSON[i].fields[j]];
                                tryAgain = attemptsLeft > 0;
                                attemptsLeft--;
                            }
                        } else if (errorCode === 'REQUIRED_FIELD_MISSING') {

                            var requiredField = errorResponse.responseJSON[i].message.split('[')[1];

                            if (requiredField) {
                                requiredField = requiredField.split(']')[0].split(',')[0].trim();

                                if (typeof enteredValues[requiredField] !== 'undefined') {
                                    record[requiredField] = enteredValues[requiredField];
                                    tryAgain = attemptsLeft > 0;
                                    attemptsLeft--;
                                }
                                else {
                                    //msg = 'Please map value of required field ' + requiredField + ' and try again';
                                    //attemptsLeft = 0;

                                    text = 'Please enter value of required field ' + requiredField + ':';
                                    delayDecision = true;

                                    $timeout(function () {
                                        dialogs.text.show({ message: text, value: '' }).confirm(function (value) {

                                            console.log('New Value = ' + value);
                                            enteredValues[requiredField] = value;
                                            record[requiredField] = value;

                                            if (typeof value === 'undefined') {
                                                attemptsLeft = 0;
                                            }

                                            tryAgain = attemptsLeft > 0;
                                            attemptsLeft--;

                                            makeDecision();

                                        });
                                    }, 500);
                                }

                            }

                        } else if (errorCode === 'INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST') {

                            var fieldLabel = errorResponse.responseJSON[i].message.split(':')[0];
                            var invalidValue = errorResponse.responseJSON[i].message.split(':')[2];

                            var fieldIndex = 0;
                            if (fieldIndex < errorResponse.responseJSON[i].fields.length) {
                                var fieldName = errorResponse.responseJSON[i].fields[fieldIndex];

                                if (typeof enteredValues[fieldName] !== 'undefined') {
                                    record[fieldName] = enteredValues[fieldName];
                                    tryAgain = attemptsLeft > 0;
                                    attemptsLeft--;
                                }
                                else {
                                    //msg = 'Please map picklist value of field ' + fieldLabel + ' and try again';
                                    //attemptsLeft = 0;

                                    text = 'Please enter valid picklist value of ' + fieldLabel + ':';
                                    delayDecision = true;

                                    $timeout(function () {
                                        dialogs.text.show({ message: text, value: invalidValue }).confirm(function (value) {

                                            console.log('New Value = ' + value);
                                            enteredValues[fieldName] = value;
                                            record[fieldName] = value;

                                            if (!record[fieldName]) {
                                                attemptsLeft = 0;
                                            }

                                            makeDecision();

                                        });
                                    }, 500);
                                }
                                fieldIndex++;
                            }

                            tryAgain = attemptsLeft > 0;
                            attemptsLeft--;

                        } else if (errorCode === 'INVALID_FIELD') {

                            if (errorResponse.responseJSON[i].message === 'No such column \'MailingStateCode\' on sobject of type Contact' ||
                                errorResponse.responseJSON[i].message === 'No such column \'MailingCountryCode\' on sobject of type Contact') {

                                delete record.MailingStateCode;
                                delete record.MailingCountryCode;

                                record.MailingState = service.limitstr(captureRecord.state, 0);
                                record.MailingCountry = service.limitstr(captureRecord.country, 0);

                                tryAgain = attemptsLeft > 0;
                                attemptsLeft--;

                            } else if (errorResponse.responseJSON[i].message === 'No such column \'StateCode\' on sobject of type Lead' ||
                                errorResponse.responseJSON[i].message === 'No such column \'CountryCode\' on sobject of type Lead') {

                                delete record.StateCode;
                                delete record.CountryCode;

                                record.State = service.limitstr(captureRecord.state, 0);
                                record.Country = service.limitstr(captureRecord.country, 0);

                                tryAgain = attemptsLeft > 0;
                                attemptsLeft--;

                            } else {

                                if (errorResponse.responseJSON[i].message.indexOf('No such column' >= 0)) {
                                    var missingField = errorResponse.responseJSON[i].message.split('\'')[1];
                                    if (missingField) {
                                        delete record[missingField];
                                        tryAgain = attemptsLeft > 0;
                                        attemptsLeft--;
                                    }
                                }

                            }
                        }

                    }
                }

                if (!delayDecision)
                { makeDecision(); }

            };

            var handleSuccess = function (successResponse) {

                if (debug) { console.log(debug + 'handleSuccess', successResponse); }

                //var fields = {};
                //fields[data.mappedProperties[0].name] = '0014000001Ym7q7'; //data.mappedProperties[0].value;
                //updateRecord(successResponse.id, { 'FirstName': 'Alex' });
                //updateRecord(successResponse.id, { 'accid': '0014000001Ym7q7' });

                if (successResponse && successResponse.success)
                { successCallback(store.url + '/' + successResponse.id, successResponse.id); }
                else
                { failCallback('Record was not created'); }

            };

            var composeDescription = function (contact) {
                var s = [];
                s.push('Added by Capture!');
                if (contact.mark && contact.mark !== 'Default') { s.push('List: [' + contact.mark + ']'); }
                if (contact.email2) { s.push('Email 2: ' + contact.email2); }
                if (contact.sourceurl) { s.push('Source URL: ' + contact.sourceurl); }
                if (contact.venues) {
                    s.push('Social Links:');
                    for (var i = 0; i < contact.venues.length; i++)
                    { s.push(contact.venues[i].website); }
                    //{ s.push(contact.venues[i].type + ': ' + contact.venues[i].website); }
                }
                if (contact.bio) { s.push('Bio:\n' + contact.bio); }


                return s.join('\n').trim();
            };

            var createLead = function (contact) { //, session, url, crmid, sitekey) {

                //console.log('SF', session, url, store.id);


                var countryCode = service.convertCountryToSalesforceCountryCode(contact.country);
                var stateCode = service.convertStateToSalesforceStateCode(contact.state);

                if (service.isUSState(stateCode)) {
                    countryCode = 'US';
                }

                record = {
                    'LastName': service.limitstr(contact.last, 80),
                    'FirstName': service.limitstr(contact.first, 40),
                    'Email': service.limitstr(contact.email, 0),
                    'Company': service.limitstr(contact.company ? contact.company : 'Unknown', 255),
                    'Title': service.limitstr(contact.jobtitle, 128),
                    'Street': service.limitstr((contact.address1 ? contact.address1 : '') + (contact.address2 ? ' ' + contact.address2 : ''), 0),
                    'City': service.limitstr(contact.city, 0),
                    'State': service.limitstr(contact.state, 0),
                    'StateCode': service.limitstr(stateCode, 0),
                    'PostalCode': service.limitstr(contact.zip, 0),
                    'Country': service.limitstr(contact.country, 0),
                    'CountryCode': service.limitstr(countryCode, 0),
                    'Website': service.limitstr(contact.website, 255),
                    'Phone': service.limitstr(contact.phone, 0),
                    'MobilePhone': service.limitstr(contact.phone2, 0),
                    'Fax': service.limitstr(contact.fax, 0),
                    //'LeadSource': service.limitstr((contact.mark && contact.mark !== 'Default' ? contact.mark : 'Capture!'), 0),
                    'Description': service.limitstr(composeDescription(contact), 32000)
                };

                if (record.StateCode !== '') {
                    delete record.State;
                }
                if (record.CountryCode !== '') {
                    delete record.Country;
                }

                if (createOptions && createOptions.mappedProperties) {
                    var i = createOptions.mappedProperties.length;
                    while (i--)
                    { record[createOptions.mappedProperties[i].name] = createOptions.mappedProperties[i].value; }
                }

                console.log('SF Record', JSON.stringify(record), JSON.stringify(contact));

                var f = function () {
                    try {
                        if (debug) { console.log(debug + 'post', angular.copy(record)); }
                        //calls Salesforce REST API with jQuery
                        jQuery.ajax({
                            type: 'POST',
                            url: url, //url + code + 'Lead/',
                            contentType: 'application/json',
                            dataType: 'json',
                            data: JSON.stringify(record),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + store.id);
                                xhr.setRequestHeader('Accept', 'application/json');
                            },
                            success: function (successResponse) {
                                handleSuccess(successResponse);
                            },
                            error: function (errorResponse) {
                                handleError(errorResponse, f);
                            }

                        });
                    } catch (e) {
                        console.log('create sf lead failed', e);
                        failCallback('Record was not created');
                    }
                };

                f();

            };

            var createContact = function (contact) {

                var countryCode = service.convertCountryToSalesforceCountryCode(contact.country);
                var stateCode = service.convertStateToSalesforceStateCode(contact.state);

                if (service.isUSState(stateCode))
                { countryCode = 'US'; }

                record = {
                    //'AccountId': '', // passed as mappedProperties
                    'LastName': service.limitstr(contact.last, 80),
                    'FirstName': service.limitstr(contact.first, 40),
                    'Email': service.limitstr(contact.email, 0),
                    'Title': service.limitstr(contact.jobtitle, 128),
                    'MailingStreet': service.limitstr((contact.address1 ? contact.address1 : '') + (contact.address2 ? ' ' + contact.address2 : ''), 0),
                    'MailingCity': service.limitstr(contact.city, 0),
                    'MailingState': service.limitstr(contact.state, 0),
                    'MailingStateCode': service.limitstr(stateCode, 0),
                    'MailingPostalCode': service.limitstr(contact.zip, 0),
                    'MailingCountry': service.limitstr(contact.country, 0),
                    'MailingCountryCode': service.limitstr(countryCode, 0),
                    'Phone': service.limitstr(contact.phone, 0),
                    'MobilePhone': service.limitstr(contact.phone2, 0),
                    'Fax': service.limitstr(contact.fax, 0),
                    'Description': service.limitstr(composeDescription(contact), 32000)
                };

                if (record.MailingStateCode !== '') {
                    delete record.MailingState;
                }
                if (record.MailingCountryCode !== '') {
                    delete record.MailingCountry;
                }

                if (createOptions && createOptions.mappedProperties) {
                    var i = createOptions.mappedProperties.length;
                    while (i--) {
                        var fieldName = createOptions.mappedProperties[i].name;
                        record[fieldName] = createOptions.mappedProperties[i].value;
                    }
                }

                var f = function () {

                    if (debug) { console.log(debug + 'post', url, angular.copy(record)); }
                    try {
                        //calls Salesforce REST API with jQuery
                        jQuery.ajax({
                            type: 'POST',
                            url: url,
                            contentType: 'application/json',
                            dataType: 'json',
                            data: JSON.stringify(record),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + store.id);
                                xhr.setRequestHeader('Accept', 'application/json');
                            },
                            success: function (successResponse) {
                                handleSuccess(successResponse);
                            },
                            error: function (errorResponse) {
                                handleError(errorResponse, f);
                            }
                        });
                    } catch (e) {
                        console.log('create sf contact failed', e);
                        failCallback('Record was not created');
                    }
                };

                f();

            };

            var createAccount = function (contact) {

                //if (map && map.fields && map.fields.length > 0) {
                //    record = createRecordWithMap(map, contact);
                //} else {
                var countryCode = service.convertCountryToSalesforceCountryCode(contact.country);
                var stateCode = service.convertStateToSalesforceStateCode(contact.state);

                if (service.isUSState(stateCode)) {
                    countryCode = 'US';
                }

                record = {
                    'Name': service.limitstr(contact.company || 'Unknown', 255),
                    'BillingStreet': service.limitstr((contact.address1 ? contact.address1 : '') + (contact.address2 ? ' ' + contact.address2 : ''), 0),
                    'BillingCity': service.limitstr(contact.city, 40),
                    'BillingState': service.limitstr(contact.state, 80),
                    'BillingStateCode': service.limitstr(stateCode, 0),
                    'BillingPostalCode': service.limitstr(contact.zip, 20),
                    'BillingCountry': service.limitstr(contact.country, 80),
                    'BillingCountryCode': service.limitstr(countryCode, 0),
                    'Website': service.limitstr(contact.website, 255),
                    'Phone': service.limitstr(contact.phone, 0),
                    'Fax': service.limitstr(contact.fax, 0),
                    'Description': service.limitstr('Added by Capture!', 32000)
                };

                if (record.BillingStateCode !== '') {
                    delete record.BillingState;
                }
                if (record.BillingCountryCode !== '') {
                    delete record.BillingCountry;
                }
                //}

                if (createOptions && createOptions.mappedProperties) {
                    var i = createOptions.mappedProperties.length;
                    while (i--)
                    { record[createOptions.mappedProperties[i].name] = createOptions.mappedProperties[i].value; }
                }

                console.log('SF Record', JSON.stringify(record), JSON.stringify(contact));

                var f = function () {
                    try {
                        if (debug) { console.log(debug + 'post', angular.copy(record)); }

                        //calls Salesforce REST API with jQuery
                        jQuery.ajax({
                            type: 'POST',
                            url: url,
                            contentType: 'application/json',
                            dataType: 'json',
                            data: JSON.stringify(record),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + store.id);
                                xhr.setRequestHeader('Accept', 'application/json');
                            },
                            success: function (successResponse) {
                                console.log('**** CREATE ACCOUNT SUCCESS');
                                handleSuccess(successResponse);
                            },
                            error: function (errorResponse) {
                                console.log('**** CREATE ACCOUNT FAIL');
                                handleError(errorResponse, f);
                            }

                        });
                    } catch (e) {
                        console.log('create sf account failed', e);
                        failCallback(e.message);
                    }
                };

                f();

            };

            var createNewRecord = function (recordType, record2) {

                record = record2; // fixing the scope

                if (debug) { console.log(debug + 'createNewRecord->type:', recordType, '->record:', record); }

                var f = function () {
                    try {
                        if (debug) { console.log(debug + 'post', angular.copy(record)); }
                        //calls Salesforce REST API with jQuery
                        jQuery.ajax({
                            type: 'POST',
                            url: store.url + '/services/data/v34.0/sobjects/' + recordType + '/',
                            contentType: 'application/json',
                            dataType: 'json',
                            data: JSON.stringify(record),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + store.id);
                                xhr.setRequestHeader('Accept', 'application/json');
                            },
                            success: function (successResponse) {
                                handleSuccess(successResponse);
                            },
                            error: function (errorResponse) {
                                handleError(errorResponse, f);
                            }

                        });
                    } catch (e) {
                        console.log('create failed', e);
                        failCallback(e.message);
                    }
                };

                f();

            };


            console.log('SF create record', captureRecord);


            if (createOptions && createOptions.map && createOptions.map.fields && createOptions.map.fields.length > 0) {

                captureRecord.address = ((captureRecord.address1 ? captureRecord.address1 : '') +
                    (captureRecord.address2 ? ' ' + captureRecord.address2 : '')).trim();

                captureRecord.stateCode = service.convertStateToSalesforceStateCode(captureRecord.state);
                captureRecord.countryCode = service.convertCountryToSalesforceCountryCode(captureRecord.country);
                if (service.isUSState(captureRecord.stateCode)) {
                    captureRecord.countryCode = 'US';
                }

                var rec = createRecordWithMap(createOptions.map, captureRecord);

                createNewRecord(recordType, rec);

            } else {

                if (recordType.toUpperCase() === 'LEAD')
                { createLead(captureRecord); }
                else if (recordType.toUpperCase() === 'CONTACT')
                { createContact(captureRecord); }
                else if (recordType.toUpperCase() === 'ACCOUNT')
                { createAccount(captureRecord); }
                else
                { createNewRecord(recordType, captureRecord); }

            }

        },

        //  Update an existing record with data
        //      successCallback: function(recordId)
        updateRecord: function (recordId, recordType, record, successCallback, failCallback, original) {
            if (recordType === 'lead') { recordType = 'Lead'; }
            if (recordType === 'contact') { recordType = 'Contact'; }
            var headers = { 'Content-type': 'application/json', 'Authorization': 'Bearer ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' };
            var url = store.url + '/services/data/v34.0/sobjects/' + recordType + '/' + recordId;

            if (original) {
                // remove fields that did not change
                for (var a in original) {
                    if (record[a] === original[a]) {
                        delete record[a];
                    }
                }
                console.log(consolePrefix + 'Update > Cleaned Record > ', record);
            }

            var config = { method: 'PATCH', url: url, data: record, headers: headers };
            console.log('salesforce.updateRecord...', config);
            $http(config).success(function (response) {
                if (debug) { console.log('salesforce.updateRecord:', response); }
                try { successCallback(response); } catch (e) { }
            }).error(function (response, status) {
                if (debug) { console.error('salesforce.updateRecord:', status, response); }

                // Missing field?
                if (status === 400) {
                    var error = response[0];
                    if (error.errorCode === 'INVALID_FIELD' && error.message.indexOf('No such column' >= 0)) {
                        var missingField = error.message.split('\'')[1];
                        if (missingField) {
                            delete record[missingField];
                            service.updateRecord(recordId, recordType, record, successCallback, failCallback, original);
                            return;
                        }
                    }
                }

                var msg = '';
                if (response && response.length > 0) {
                    var i = 0;
                    while (i < response.length) {
                        if (response[i].message)
                        { msg += response[i].message + ' '; }
                        i++;
                    }
                }
                try { failCallback('Cannot update Salesforce record: (' + status + ') ' + (msg || response)); } catch (e) { }
            });
        },

        //  Retrieve record from service
        //      successCallback: function(recordId, data)
        retrieveRecord: function (recordId, recordType, successCallback, failureCallback) {

            console.log('RETRIEVING RECORD');
            try {
                if (recordType === 'lead') { recordType = 'Lead'; }
                if (recordType === 'contact') { recordType = 'Contact'; }
                var config = { headers: { 'Content-type': 'application/json', 'Authorization': 'Bearer ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' } };
                var url = store.url + '/services/data/v34.0/sobjects/' + recordType + '/' + recordId;
                console.log('salesforce.retrieveRecord...', { url: url, config: config });
                $http.get(url, config).success(

                    //function (response) {
                    //    if (debug) { console.log('salesforce.retrieveRecord:', response); }
                    //    try { successCallback(response); } catch (e) { }
                    //}

                    function (data, status, headers, config) {
                        defaultOnSuccessHandler(data, status, headers, config, successCallback, failureCallback);
                    }

                ).error(function (response, status) {
                    console.error('Retrieve Record > Error > ', response, status);
                    var error = '';
                    if (response.message) { error = response.message; }
                    else { error = JSON.stringify(response); }
                    try { failureCallback('Cannot retrieve Salesforce record: (' + status + ') ' + error, status); } catch (e) { }
                });
            } catch (e) {
                console.error('Retrieve Record > Exception > ', e.message);
                var details = 'Chrome exception';
                if (e && e.message) {
                    details = e.message;
                }
                failureCallback('Cannot retrieve Salesforce record: ' + details);
            }
        },

        asyncRetrieveRecord: function (recordId, recordType) {
            var deferred = $q.defer();
            service.retrieveRecord(recordId, recordType,
                function (response) { deferred.resolve(response); },
                function (msg) { deferred.reject(msg); }
            );
            return deferred.promise;
        },

        //  Delete record from service
        //      successCallback: function(recordId)
        deleteRecord: function (recordId, successCallback, failCallback) {
        },
        //-- /CRUD --//


        //-- Search --//
        //  Find a record using a query: { first:'', last:'', email:''} object
        //      successCallback: function(nativeRecords[])
        findRecord: function (recordType, query, fields, successCallback, failureCallback) {
            const functionName = 'Find Record';
            try {

                console.log(consolePrefix + functionName, ' > Type > ', recordType, ' > Query > ', query, ' > Fields >', fields);

                checkSession();

                //var service = this;

                var encodeParam = function (p) {
                    p = p || '';
                    p = p.replace('\\', '\\\\');
                    p = p.replace('\'', '\\\'');
                    p = p.replace('\"', '\\\"');
                    return encodeURIComponent(p);
                    //return p.replace(/'/g, '%5C%27');
                };

                if (debug) { console.log(debug + 'findRecord->type:', recordType, '->query:', query, '->fields:', fields); }

                if (recordType === 'account') { recordType = 'Account'; }
                if (recordType === 'lead') { recordType = 'Lead'; }
                if (recordType === 'contact') { recordType = 'Contact'; }
                if (recordType === 'campaign') { recordType = 'Campaign'; }

                var where = [];

                if (query) {

                    if (query.email)
                    { where.push('Email=\'' + encodeParam(query.email) + '\''); }

                    if (query.email_endsWith)
                    { where.push('Email+LIKE+\'%25' + encodeParam(query.email_endsWith) + '\''); }

                    if (query.last)
                    { where.push('LastName=\'' + encodeParam(query.last) + '\''); }

                    if (query.first)
                    { where.push('FirstName=\'' + encodeParam(query.first) + '\''); }

                    if (query.middle)
                    { where.push('MiddleName=\'' + encodeParam(query.middle) + '\''); } // The field may be disabled!

                    if (recordType === 'Account') {
                        if (query.company)
                        { where.push('Name+LIKE+\'%25' + encodeParam(query.company) + '%25\''); }
                        if (query.website)
                        { where.push('Website+LIKE+\'%25' + encodeParam(query.website) + '%25\''); }
                    }

                    if (recordType === 'Campaign') {
                        if (query.campaign)
                        { where.push('Name+LIKE+\'%25' + encodeParam(query.campaign) + '%25\''); }
                    }

                }
                var whereStr = where.join('+AND+');
                if (recordType === 'Account') {
                    whereStr = where.join('+OR+');
                }
                if (whereStr) { whereStr = '+WHERE+' + whereStr; } else { whereStr = '+'; }
                console.log(whereStr);

                var fieldsStr = 'Id,Name'; // * is not supported by SOQL SELECT Syntax
                var f;

                if (recordType === 'user') {
                    fieldsStr = 'Id,Name';
                }

                if (recordType === 'Account') {
                    f = [];

                    f.push('ID');

                    if (fields.indexOf('company') > -1) { f.push('Name'); }
                    if (fields.indexOf('website') > -1) { f.push('Website'); }
                    if (fields.indexOf('_createdDate') > -1) { f.push('CreatedDate'); }

                    f.push('BillingCity');
                    f.push('BillingState');

                    fieldsStr = f.join(',');
                }

                if (recordType === 'Contact') {
                    f = [];

                    f.push('ID');

                    if (fields.indexOf('first') > -1) { f.push('FirstName'); }
                    if (fields.indexOf('last') > -1) { f.push('LastName'); }
                    if (fields.indexOf('email') > -1) { f.push('Email'); }
                    //if (fields.indexOf('middle') > -1) { f.push('MiddleName '); }

                    fieldsStr = f.join(',');
                }

                if (recordType === 'Lead') {
                    f = [];

                    f.push('ID');

                    if (fields.indexOf('first') > -1) { f.push('FirstName'); }
                    if (fields.indexOf('last') > -1) { f.push('LastName'); }
                    if (fields.indexOf('email') > -1) { f.push('Email'); }
                    //if (fields.indexOf('middle') > -1) { f.push('MiddleName '); }

                    fieldsStr = f.join(',');
                }

                if (recordType === 'Campaign') {
                    f = [];

                    f.push('ID');
                    f.push('Name');

                    fieldsStr = f.join(',');
                }

                var headers = { 'Content-type': 'application/json', 'Authorization': 'Bearer ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' };
                var url = store.url + '/services/data/v34.0/query/?q=SELECT+' + fieldsStr + '+FROM+' + recordType + whereStr;

                if (query && query.limit > 0)
                { url = url + '+LIMIT+' + query.limit; }
                else if (query && query.limit === 0)
                { }
                else
                { url = url + '+LIMIT+50'; }

                var config = { method: 'GET', url: url, headers: headers };
                if (debug) { console.log(debug + 'findRecord->config:', config); }

                var allRecords = [];

                var errorHandler = function (response, status) {
                    try {
                        if (debug) { console.error(consolePrefix + functionName + '> Failure Response > ', response); }
                        var msg = '';
                        if (response && response.length > 0) {

                            if (response[0].errorCode === 'INVALID_SESSION_ID') {
                                service.logout(true);
                            }

                            var i = 0;
                            while (i < response.length) {
                                if (response[i].message)
                                { msg += response[i].message + ' '; }
                                i++;
                            }
                        }
                        try { failureCallback('Cannot find Salesforce record: (' + (status || '') + ') ' + (msg || response)); } catch (e) { }
                    } catch (e) {
                        console.error(functionName, e.message);
                        failureCallback(e.message);
                    }
                };

                var successHandler = function (response) {
                    try {
                        if (debug) { console.log(consolePrefix + functionName + ' > Success Response > ', response); }

                        allRecords = allRecords.concat(response.records);

                        if (!response.done && response.nextRecordsUrl) {
                            config.url = store.url + response.nextRecordsUrl;
                            $http(config).success(successHandler).error(errorHandler);
                        }
                        else { try { successCallback(allRecords); } catch (e) { } }
                    } catch (e) {
                        console.error(functionName, e.message);
                        failureCallback(e.message);
                    }

                };

                $http(config).success(successHandler).error(errorHandler);

            } catch (e) {
                console.error(functionName, e.message);
                failureCallback(e.message);
            }

        },
        //-- /Search --//


        //-- Auth --//
        //  Authenticate with the service
        //      successCallback: function(authId)
        authenticate: function (credentials, successCallback, failCallback) {
            // https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id= &redirect_uri=
        },

        //  is this client currently authenticated?
        //      return true/false
        isAuthenticated: function () {
        },
        //-- /Auth --//


        //-- Define --//
        //  Get a list of all available entities (lead, contact, account, etc)
        //      successCallback: function(entityList)
        listEntities: function (successCallback, failCallback) {
        },

        //  Get the definition for an entity (field names of a lead or contact)
        //      successCallback: function(entityDefinition)
        defineEntity: function (entity, successCallback, failCallback) {
        },
        //-- /Define --//


        findDuplicates: function (recordType, contact, successCallback, failCallback) {
            const functionName = 'Find Duplicates';
            try {

                if (debug) { console.log(consolePrefix + functionName, recordType, contact); }

                if (typeof store.url === 'undefined') {
                    console.error(functionName + ' > Not initialized > ', store);
                    try { failCallback('Session expired. Please log in.'); } catch (e) { }
                    return;
                }

                var encode = function (s) {
                    if (typeof s === 'undefined') { s = ''; }
                    return s.replace(/'/g, '\\\'');
                };

                if (recordType === 'lead') { recordType = 'Lead'; }
                if (recordType === 'contact') { recordType = 'Contact'; }

                var fields = 'ID,LastName,FirstName,Email,Company,Phone,Title';
                if (recordType === 'Contact') { fields = 'ID,LastName,FirstName,Email,Title,Phone,Account.Name'; }

                var from = recordType;
                if (recordType === 'Contact')
                { from = 'Contact,Contact.Account'; }

                var where = '';

                var dups = [];

                var reponseHandle = null;
                var returnResponse = function () {
                    try {
                        successCallback({ duplicates: dups });
                    } catch (e) { }
                };

                var query = function (q) {

                    try {

                        //calls Salesforce REST API with jQuery
                        jQuery.ajax({
                            type: 'GET',
                            url: store.url + '/services/data/v34.0/query/?q=' + q,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'Bearer ' + store.id);
                                xhr.setRequestHeader('Accept', 'application/json');
                            },
                            success: function (sfdata) {
                                console.log('findDuplicates results', sfdata);

                                if (!sfdata.records)
                                { try { failCallback(); } catch (e) { } }


                                for (var i = 0; i < sfdata.records.length; i++) {
                                    var dup = {};
                                    if (recordType === 'Lead') { dup = service.fromLead(sfdata.records[i]); }
                                    else if (recordType === 'Contact') { dup = service.fromContact(sfdata.records[i]); }
                                    dups.push(dup);
                                }

                                if (reponseHandle) {
                                    window.clearTimeout(reponseHandle);
                                }
                                reponseHandle = window.setTimeout(returnResponse, 2000);

                            },
                            failure: function (error) {
                                console.log('ERROR in findDuplicates', error); // 401 [{"message":"Session expired or invalid","errorCode":"INVALID_SESSION_ID"}]
                                try { failCallback(); } catch (e) { }
                            },
                            xhr: function () {
                                var xhr = new window.XMLHttpRequest();
                                xhr.addEventListener('error', function (evt) {
                                    console.log('XHR Event: an error occured');
                                }, false);
                                xhr.addEventListener('abort', function () {
                                    console.log('XHR Event: cancelled');
                                }, false);
                                return xhr;
                            },
                            error: function (errorResponse) {
                                console.log('AJAX error in request: ' + JSON.stringify(errorResponse || '', null, 2));

                                if (errorResponse && errorResponse.responseJSON && errorResponse.responseJSON.length > 0) {
                                    var errorCode = errorResponse.responseJSON[0].errorCode;
                                    var message = errorResponse.responseJSON[0].message;

                                    if (errorCode === 'INVALID_SESSION_ID') {
                                        try {
                                            //var loginCallback = 
                                            service.logout(true);
                                            try { failCallback(message); } catch (e) { }
                                            //TODO: Add a callback to login and do not return an error.
                                            //service.login(function () {
                                            //    service.findDuplicates(recordType, contact, successCallback, failCallback);
                                            //}, function (error) {
                                            //    console.error(functionName + ' > Login Failure > ', error || message);
                                            //    try { failCallback(error || message); } catch (e) { }
                                            //}, true);
                                        } catch (e) {
                                            console.error(functionName + ' > Relogin Failure > ', e.message);
                                            try { failCallback(e.message); } catch (e) { }
                                        }
                                    } else {
                                        //API_DISABLED_FOR_ORG
                                        try { failCallback(message); } catch (e) { }
                                    }
                                }
                                else {
                                    try { failCallback(); } catch (e) { }
                                }
                            }
                        })
                        ;

                    } catch (e) {
                        console.log('ERROR in query', e.message);
                        try { failCallback(); } catch (e) { }
                    }

                };


                if (contact.email) {
                    where = 'Email=\'' + encode(contact.email) + '\'';
                    if (recordType === 'Lead')
                    { where += '+AND+IsConverted=False'; }
                    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
                }

                if (contact.last && contact.first) {
                    where = 'LastName=\'' + encode(contact.last) + '\'+AND+FirstName=\'' + encode(contact.first) + '\'';
                    if (recordType === 'Lead')
                    { where += '+AND+IsConverted=False'; }
                    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
                }

                //if (contact.phone && contact.last) {
                //    where = 'LastName=\'' + encode(contact.last) + '\'+AND+Phone=\'' + encode(contact.phone) + '\'';
                //    if (recordType === 'Lead')
                //    { where += '+AND+IsConverted=False'; }
                //    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
                //}

                if (contact.email2) {
                    where = 'Email=\'' + contact.email2 + '\'';
                    if (recordType === 'Lead')
                    { where += '+AND+IsConverted=False'; }
                    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
                }

            } catch (e) {
                console.error(functionName, e.message);
                failCallback(e.message);
            }
        },


        getDetails: function (captureRecord, parentRecordType, successCallback, failCallback) {





            console.log('getDetails', captureRecord);

            var recordId = captureRecord._id;



            var config = { headers: { 'Content-type': 'application/json', 'Authorization': 'Bearer ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' } };
            var url = null;

            if (parentRecordType.toLowerCase() === 'lead') {
                url = store.url + '/services/data/v33.0/query/?q=SELECT LastActivityDate, ' +
                    ' (SELECT ActivityDate, ActivityType, Description, Status, Subject, Owner.Name FROM ActivityHistories LIMIT 10),' +
                    ' (SELECT ActivityDate, Description, Status, Subject, Owner.Name FROM Tasks LIMIT 10)' +
                    ' FROM Lead WHERE Id = \'' + recordId + '\'';
            }
            else if (parentRecordType.toLowerCase() === 'contact') {
                url = store.url + '/services/data/v33.0/query/?q=SELECT LastActivityDate, ' +
                    ' Account.Name, Account.Website, ' +
                    ' (SELECT ActivityDate, ActivityType, Description, Status, Subject, Owner.Name FROM ActivityHistories LIMIT 10),' +
                    ' (SELECT ActivityDate, Description, Status, Subject, Owner.Name FROM Tasks LIMIT 10),' +
                    ' (SELECT Amount, IsClosed, IsWon, CloseDate, LastActivityDate, StageName, Type, Description, Owner.Name FROM Opportunities LIMIT 10)' +
                    ' FROM Contact WHERE Id = \'' + recordId + '\'';
            } else {
                try { failCallback('Cannot retrieve Salesforce record type: ' + parentRecordType); } catch (e) { }
                return;
            }

            captureRecord._act = captureRecord._act || {};
            captureRecord._opp = captureRecord._opp || {};

            var parseOpp = function (record) {

                var detailRecord = null;
                var detailRecordId = null;

                if (typeof record.Opportunities === 'object' && record.Opportunities !== null && record.Opportunities.totalSize > 0) {

                    for (var i = 0; i < record.Opportunities.totalSize; i++) {
                        detailRecord = record.Opportunities.records[i];
                        console.log('getDetails->opp', detailRecord);
                        detailRecordId = detailRecord.attributes.url.substring(detailRecord.attributes.url.lastIndexOf('/') + 1);
                        //console.log('***** opp link', detailRecord.attributes.url, detailRecordId, store.url);
                        var a = detailRecord.Amount;
                        var n;
                        if (detailRecord.Amount && detailRecord.Amount > 1000000) {
                            n = Math.round(detailRecord.Amount / 1000000);
                            a = '$' + n + 'K';
                        }
                        else if (detailRecord.Amount && detailRecord.Amount > 1000) {
                            n = Math.round(detailRecord.Amount / 1000);
                            a = '$' + n + 'K';
                        }
                        var opp = {
                            who: detailRecord.Owner.Name,
                            when: detailRecord.LastActivityDate,
                            what: detailRecord.Name + ' ' + a,
                            details: detailRecord.Description,
                            link: store.url + '/' + detailRecordId
                        };

                        if (i === 0) {
                            captureRecord._opp.last = opp;
                        } else {
                            captureRecord._opp.next = opp;
                        }
                    }
                }
            };

            var successHandler2 = function (response) {
                console.log('getDetails->successCallback2', response);

                try {

                    if (response !== null && response.totalSize > 0) {

                        var record = response.records[0];

                        parseOpp(record);

                    }
                } catch (e) {
                    console.log('********************* ERROR in getDetails->successCallback2: ' + e.message);
                }

                console.log('captureRecord = ', captureRecord);

                try { successCallback(captureRecord); } catch (e) { }

            };

            var successHandler = function (response) {
                console.log('getDetails->successCallback', response);

                var suspendCallback = false;

                try {

                    if (response !== null && response.totalSize > 0) {

                        var record = response.records[0];
                        var detailRecord = null;
                        var detailRecordId = null;

                        captureRecord._dt = record.LastActivityDate;

                        if (typeof record.Account === 'object' && record.Account !== null) {
                            detailRecord = record.Account;
                            console.log('*** getDetails->account', detailRecord);
                            captureRecord.company = captureRecord.company || detailRecord.Name;
                            captureRecord.website = captureRecord.website || detailRecord.Website;
                            captureRecord._website = detailRecord.Website;
                            detailRecordId = detailRecord.attributes.url.substring(detailRecord.attributes.url.lastIndexOf('/') + 1);
                            captureRecord._companyLink = store.url + '/' + detailRecordId;
                            console.log('*** getDetails->account->captureRecord', captureRecord);
                            // Query for opportunities
                            if (detailRecordId) {

                                url = store.url + '/services/data/v33.0/query/?q=SELECT ' +
                                   ' (SELECT Name, Amount, IsClosed, IsWon, CloseDate, LastActivityDate, StageName, Type, Description, Owner.Name FROM Opportunities LIMIT 10)' +
                                   ' FROM Account WHERE Id = \'' + detailRecordId + '\'';

                                $http.get(url, config)
                                    .success(successHandler2)
                                    .error(function (response, status) {
                                        var error = 'Cannot retrieve Salesforce record';
                                        if (response.message) { error = response.message; }
                                        console.log('ERROR in salesforce.retrieveOppRecord:' + JSON.stringify(response));
                                        try { failCallback('Cannot retrieve Salesforce record: (' + status + ') ' + response, status); } catch (e) { }
                                    });

                                suspendCallback = true;

                            }

                        }

                        if (typeof record.ActivityHistories === 'object' && record.ActivityHistories !== null && record.ActivityHistories.totalSize > 0) {
                            detailRecord = record.ActivityHistories.records[0];
                            console.log('*** getDetails->activityRecord', detailRecord);
                            detailRecordId = detailRecord.attributes.url.substring(detailRecord.attributes.url.lastIndexOf('/') + 1);
                            captureRecord._act.last = {
                                who: detailRecord.Owner.Name,
                                when: detailRecord.ActivityDate,
                                what: detailRecord.Subject,
                                details: detailRecord.Description,
                                link: store.url + '/' + detailRecordId
                            };
                        }

                        if (typeof record.Tasks === 'object' && record.Tasks !== null && record.Tasks.totalSize > 0) {
                            detailRecord = record.Tasks.records[record.Tasks.totalSize - 1];
                            console.log('*** getDetails->task', detailRecord);
                            detailRecordId = detailRecord.attributes.url.substring(detailRecord.attributes.url.lastIndexOf('/') + 1);
                            captureRecord._act.next = {
                                who: detailRecord.Owner.Name,
                                when: detailRecord.ActivityDate,
                                what: detailRecord.Subject,
                                details: detailRecord.Description,
                                link: store.url + '/' + detailRecordId
                            };
                        }

                        parseOpp(record);

                        //if (typeof record.Opportunities === 'object' && record.Opportunities !== null && record.Opportunities.totalSize > 0) {
                        //    detailRecord = record.Opportunities.records[record.Opportunities.totalSize - 1];
                        //    console.log('getDetails->opp', detailRecord);
                        //    detailRecordId = detailRecord.attributes.url.substring(detailRecord.attributes.url.indexOf('/Opportunities/') + 15);
                        //    captureRecord._opp.last = {
                        //        who: detailRecord.Owner.Name,
                        //        when: detailRecord.LastActivityDate,
                        //        what: detailRecord.Amount,
                        //        details: detailRecord.Description,
                        //        link: store.url + '/' + detailRecordId
                        //    };
                        //}

                    }
                } catch (e) {
                    console.log('********************* ERROR in getDetails->successCallback: ' + e.message);
                }

                console.log('captureRecord = ', captureRecord);

                if (!suspendCallback) {
                    try { successCallback(captureRecord); } catch (e) { }
                }

            };

            $http.get(url, config)
                .success(successHandler)
                .error(function (response, status) {
                    var error = 'Cannot retrieve Salesforce record';
                    if (response.message) { error = response.message; }
                    if (debug) { console.log('salesforce.retrieveRecord:' + JSON.stringify(response)); }
                    try { failCallback('Cannot retrieve Salesforce record: (' + status + ') ' + response, status); } catch (e) { }
                });

        },
        // ***********************************
        // ** Salesforce-specific functions **
        // ***********************************

        convertStateToSalesforceStateCode: function (state) {

            if (typeof state === 'undefined' || state === null || state === '') {
                return '';
            }

            var key = state.toLowerCase();
            var r = geographyData.stateNameLowerToStateCodeDict[key];
            if (!r) {
                r = state;
            }
            return r.toUpperCase();

        },

        convertCountryToSalesforceCountryCode: function (country) {

            if (typeof country === 'undefined' || country === null || country === '') {
                return '';
            }

            var key = country.toLowerCase();
            var r = geographyData.countryNameLowerToCountryCodeDict[key];
            if (!r) {
                r = country;
            }
            return r.toUpperCase();
        },

        isUSState: geographyData.isUSStateCode,

        limitstr: //backgroundUtility.limitstr,
            function (s, limit) {
                if (!s || !limit) {
                    return s;
                }
                if (s.length > limit) {
                    return s.substring(0, limit);
                }
                return s;
            },


        //var updateRecord = function (id, fields) {

        //    if (debug) { console.log(debug + 'updateRecord', id, angular.copy(fields)); }

        //    //calls Salesforce REST API with jQuery
        //    jQuery.ajax({
        //        type: 'PATCH',
        //        url: url + id,
        //        contentType: 'application/json',
        //        dataType: 'json',
        //        data: JSON.stringify(fields),
        //        beforeSend: function (xhr) {
        //            xhr.setRequestHeader('Authorization', 'Bearer ' + store.id);
        //            xhr.setRequestHeader('Accept', 'application/json');
        //        },
        //        success: function (successResponse) {
        //            handleSuccess(successResponse);
        //        },
        //        error: function (errorResponse) {
        //            handleError(errorResponse, f);
        //        }
        //    });

        //};

        /**
        * @function validateRecord
        * @description Validates if record can be exported. Returns list of errors.
        * @memberOf captureApp.webServices.exportTargetVer1.salesforce
        * @param {recordType} recordType - Record type
        * @param {captureContact} captureRecord - Source Capture Contact. 
        */
        validateRecord: function (recordType, captureRecord) {

            var errors = [];

            if (!captureRecord) {
                errors.push('Record does not exist');
            } else {
                if (!captureRecord.last) {
                    errors.push('Last name is required');
                }
            }

            return errors;
        }

    };
    return service;
}]);
/**
 * @class captureApp.webServices.exportTargetVer1.salesloft
 * @memberOf captureApp.webServices.exportTargetVer1
 * @description This is Salesloft AngularJS service.
 * @constructor
 * @param {object} $http - Angular HTTP service.
 * @param {object} $q - jQuery.
 * @param {object} endpoints - Capture enpoints service.
 * @param {object} dialogs - Capture dialogs service.
 */

/**********************************************************************
* Salesloft AngularJS service
* Author: Justin Stull  
* Email: jstull@ringlead.com
* Version: 0.0.1

failCallback: function( errorMessage, statusCode (optional), other (optional) )

Minimum implementation:

- createRecord
- isLoggedIn
- login

**********************************************************************/
'use strict';

/* global angular: false */
/* global jQuery: false */
/* global geographyData: false */
/* global backgroundUtility: false */

angular.module('webServices')
.factory('salesloft', ['$http', '$q', 'endpoints', 'dialogs', function ($http, $q, endpoints, dialogs) {

    var debug = 'salesloft.js->';
    var defaultUrl = 'https://sdr.salesloft.com/public_api/v1/';
    var store = {};

    /* Builds basic Salesloft REST url from provided Service URL and Team Pipeline ID*/
    var buildUrl = function (serviceUrl, body) {
        return serviceUrl + body;
    };

    var getVenue = function (contact, filter) {
        if (contact.venues) {
            var i;
            for (i = 0; i < contact.venues.length; i++) {
                var w = contact.venues[i].website;
                console.log('*** VENUE ***', w);
                if (w && w.indexOf(filter) >= 0) {
                    return w;
                }
            }
        }
        return null;
    };
    var getCustomFieldValue = function (contact, fieldName) {
        if (contact.CustomFields) {
            var i;
            for (i = 0; i < contact.CustomFields.length; i++) {
                var w = contact.CustomFields[i].Values[0];
                if (w !== undefined && contact.CustomFields[i].FieldName === fieldName) {
                    return w;
                }
            }
        }
        return null;
    };



    /* Handles error response from Salesloft API. It should try to return string message if provided. 
    *
    * r - HTTP response
    * asJson - if true, then error message will returns as JSON object, otherwise as String.
    */
    var handleErrorMessageText = function (r, asJson) {
        var status = r.status || 500;
        var msg = '';
        if (r.responseJSON) { msg = r.responseJSON; }
        else if (r.responseText) {
            try {
                msg = JSON.parse(r.responseText);
            } catch (err) {
                msg = r.responseText;
            }
        } else if (r.statusText) {
            msg = r.statusText;
        } else {
            msg = 'Unknown error';
        }
        if (asJson !== undefined) {
            return msg;
        } else {
            if (msg.hasOwnProperty('message')) { msg = msg.message; }
            return msg;
        }
    };

    var getDomain = function (website) {
        var regex = /([a-z0-9-]+)([.]([a-z]{1,3})(?![a-z-])){1,2}/ig;
        var d = regex.exec(website);
        if (d && d.length > 0) { d = d[0]; }
        if (d && d.length > 0) { d = d.toLowerCase(); }
        console.log('domain', d, 'website', website);
        return d;
    };

    var mapField = function (source, sourceKey, target, targetKey) {
        target[targetKey] = source[sourceKey];
    };
    var mapFromField = function (target, targetKey, source, sourceKey) {
        mapField(source, sourceKey, target, targetKey);
    };
    var toContact = function (captureRecord) {

        if (debug) {
            console.log(debug + 'toContact:in', captureRecord);
        }

        var nativeRecord = {};
        nativeRecord.CustomFields = [];
        mapField(captureRecord, 'first', nativeRecord, 'first_name');
        mapField(captureRecord, 'last', nativeRecord, 'last_name');
        mapField(captureRecord, 'jobtitle', nativeRecord, 'title');
        mapField(captureRecord, 'company', nativeRecord, 'company_name');
        mapField(captureRecord, 'website', nativeRecord, 'website');
        mapField(captureRecord, 'email', nativeRecord, 'email_address');
        mapField(captureRecord, 'phone', nativeRecord, 'phone');
        mapField(captureRecord, 'phone2', nativeRecord, 'mobile_phone');
        mapField(captureRecord, 'city', nativeRecord, 'city');
        mapField(captureRecord, 'state', nativeRecord, 'state');

        if (debug) {
            console.log(debug + 'toContact:out', nativeRecord);
        }

        return nativeRecord;
    };


    var fromContact = function (nativeRecord) {

        if (debug) {
            console.log(debug + 'fromContact:in', nativeRecord);
        }

        var captureRecord = {};
        captureRecord.venues = [];

        mapFromField(captureRecord, 'first', nativeRecord, 'first_name');
        mapFromField(captureRecord, 'last', nativeRecord, 'last_name');
        mapFromField(captureRecord, 'jobtitle', nativeRecord, 'title');
        mapFromField(captureRecord, 'company', nativeRecord, 'company_name');
        mapFromField(captureRecord, 'website', nativeRecord, 'website');
        mapFromField(captureRecord, 'email', nativeRecord, 'email_address');
        mapFromField(captureRecord, 'phone', nativeRecord, 'phone');
        mapFromField(captureRecord, 'phone2', nativeRecord, 'mobile_phone');
        mapFromField(captureRecord, 'city', nativeRecord, 'city');
        mapFromField(captureRecord, 'state', nativeRecord, 'state');


        if (debug) {
            console.log(debug + 'fromContact:venues', captureRecord.venues);
        }

        captureRecord._link = 'https://sdr.salesloft.com/app/people/' + nativeRecord.id + '/activities';
        captureRecord._type = 'Contact';
        captureRecord._id = nativeRecord.id;

        console.log('000000000000000000000 LINK: ' + captureRecord._link);

        if (debug) {
            console.log(debug + 'fromContact:out', captureRecord);
        }

        return captureRecord;
    };


    /*
    * Returns default HTTP request template.
    *
    * method - called Salesloft REST method
    */
    var buildRequest = function (method, successCallback, failCallback) {
        return {
            type: 'GET',
            contentType: 'application/json',
            crossDomain: true,
            success: function (successResponse, textStatus, xhr) {
                successCallback(successResponse, textStatus, xhr);
            },
            error: function (errorResponse) {
                var response = handleErrorMessageText(errorResponse);
                failCallback(response, errorResponse.status || 500);
            }
        };
    };

    var service = {


        /**
        * @function getName
        * @description Return name of export target.
        * @memberOf captureApp.webServices.exportTargetVer1.salesloft
        */
        getName: function () {
            return 'Salesloft';
        },


        /**
        * @function init
        * @description Initializes store object. Sets user credentials, owner and team pipeline id.
        * @memberOf captureApp.webServices.exportTargetVer1.salesloft
        * @param {object} o - List of target-specific settings.
        */
        init: function (o) {
            console.log('000000000000000000 INIT 000000000000000000');
            if (debug) { console.log(debug + 'Initializing Login ...'); }
            console.log('Store Refresh Token: ', store.refreshToken);
            if (!store.refreshToken) {
                store.accessToken = o.refreshToken;
            }
            //https://stratus.ringlead.com/v1/Authentication/dbe14c64-63a3-40f5-ad96-c8f06befd50a/_AUTHENTICATE?url=https://stratus.ringlead.com/v1/AUTHENTICATION/Request?token={0}
            console.log(store.refreshToken);
        },


        /**
        * @function login
        * @description Logs user in. Either silently (if possible) or interactively.
        * @memberOf captureApp.webServices.exportTargetVer1.salesloft
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - This callback informs that user was logged in successfully. 
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback - This callback informs that user cannot log in.
        */
        login: function (successCallback, failCallback, silent) {

            console.log('000000000000000000 LOGIN 000000000000000000');

            if (debug) { console.log(debug + 'Logging into Salesloft...'); }

            if (!store.refreshToken) {
                try { failCallback('Please open Settings and enter your user credentials'); } catch (e) { }
                return;
            }

            //var openTab = function () {
            //    try {
            //        // TODO validate the assumption that any pcrDatabaseId contains uid (before period) and that the url form is the same for all PCR users/orgs 
            //        var uid = store.pcrDatabaseId.split('.')[0];
            //        chrome.tabs.create({ url: 'https://www2.pcrecruiter.net/pcr.asp?uid=odbc.' + uid }, function () { });
            //    } catch (e) {

            //    }
            //};

            var config = {
                'client_id': '9ca842e02dce70de6ead42609a88032e569ccd6de8e4cc656d799cf52065eb41',
                'client_secret': 'c13303124a00dfc9cdf36dcf5bd045a496632374182e106d1e56c570e6d1f790',
                'grant_type': 'refresh_token',
                'refresh_token': store.refreshToken
            };

            var request = buildRequest('', successCallback, failCallback);
            request.url = 'https://accounts.salesloft.com/oauth/token';
            request.type = 'POST';
            request.data = JSON.stringify(config);
            request.success = function (successResponse, status, xhr) {
                store.refreshToken = successResponse.refresh_token;
                store.accessToken = successResponse.access_token;


                //if (silent === false) {
                //    openTab();
                //}
                console.log('000000000000000000 ACCESS TOKEN 000000000000000000');
                console.log(store.accessToken);
                successCallback();
            };
            jQuery.ajax(request);
        },

        /**
         * @function logout
         * @description Logs user out. Cleans up store variable.I
         * @memberOf captureApp.webServices.exportTargetVer1.pcrecruiter
         */
        logout: function () {
            if (debug) { console.log(debug + 'Logged out...'); }
        },


        /**
         * @function isLoggedIn
         * @description Checks if user is logged in.
         * @memberOf captureApp.webServices.exportTargetVer1.pcrecruiter
         * @param {captureApp.webServices.exportTargetVer1~isLoggedInSuccessCallback} successCallback - This callback informs that user is currently logged in.
         * @param {captureApp.webServices.exportTargetVer1~isLoggedInFailCallback} failCallback - This callback informs that user is not currently logged in.
         */
        isLoggedIn: function (successCallback, failCallback) {
            var isLogged = store.accessToken !== undefined ? true : false;

            if (debug) { console.log(debug + 'isLogged', isLogged); }

            if (!isLogged) {
                // Since we can do it... Do silent login.
                service.login(successCallback, failCallback);
            }
            else { try { successCallback(); } catch (e) { } }
        },


        /**
       * @function createRecord
       * @description Creates record.
       * @memberOf captureApp.webServices.exportTargetVer1.pcrecruiter
       * @param {recordType} recordType - Destination Record Type
       * @param {captureContact} captureRecord - Source Capture Record.
       * @param {object} createOptions - Options (For future use)
       * @param {captureApp.webServices.exportTargetVer1~createRecordSuccessCallback} successCallback 
       * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback
       */
        createRecord: function (recordType, captureRecord, createOptions, successCallback, failCallback) {

            console.log('000000000000000000 CREATE RECORD 000000000000000000');

            if (debug) { console.log(debug + 'createRecord', captureRecord); }

            var createContact = function () {

                console.log('000000000000000000 CREATE CONTACT 000000000000000000');

                var record = {
                    'email_address': (captureRecord.email || ''),
                    'first_name': (captureRecord.first || ''),
                    'last_name': (captureRecord.last || ''),
                    'phone': (captureRecord.phone || ''),
                    'mobile_phone': (captureRecord.phone2 || ''),
                    'linkedin_url': (getVenue(captureRecord, 'linkedin.com') || ''),
                    'company_id': (''), //TODO
                    'company_name': (captureRecord.company || ''),
                    'company_url': (captureRecord.website || ''),
                    'title': (captureRecord.jobtitle || ''),
                    'city': (captureRecord.city || ''),
                    'state': (captureRecord.state || '')
                };

                if (createOptions && createOptions.mappedProperties) {
                    var j = createOptions.mappedProperties.length;
                    while (j--)
                    { record[createOptions.mappedProperties[j].name] = createOptions.mappedProperties[j].value; }
                }

                if (debug) { console.log(debug + 'post', angular.copy(record)); }

                //var successCallback2 = function (successResponse, textStatus, xhr) {

                //if (debug) { console.log(debug + 'response', successResponse); }
                /*var urlBody = 'candidates';
                var request = buildRequest(nativeRecordType, successCallback, failCallback);
                request.beforeSend = function (xhr) {
                    xhr.setRequestHeader('Authorization', 'BEARER ' + store.authId);
                request.url = buildUrl(defaultUrl, urlBody);
                request.type = 'POST';
                request.data = JSON.stringify(record);
                jQuery.ajax(request);*/

                var url = buildUrl(defaultUrl, 'people.json');

                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + store.accessToken
                    }
                };

                $http.post(url, record, config)
                    .success(function (data, status, headers, config) {
                        if (debug) { console.log(debug + 'response', data, status); }
                        try { successCallback(); } catch (e) { }
                    })
                    .error(function (data, status, headers, config) {
                        console.log(debug + 'ERROR in POST', data, status, headers, config);
                        try { failCallback(); } catch (e) { }
                    });

            };

            var createCompany = function (nativeRecordType) {

                console.log('000000000000000000 CREATE COMPANY 000000000000000000');

                var record = {
                    'name': (captureRecord.company || ''),
                    'domain': (captureRecord.website || ''),
                    'city': (captureRecord.city || ''),
                    'country': (captureRecord.country || ''),
                    'phone': (captureRecord.phone || ''),
                    'state': (captureRecord.state || ''),
                    'website': (captureRecord.website || '')
                };

                if (debug) { console.log(debug + 'post', angular.copy(record)); }

                var successCallback2 = function (successResponse, textStatus, xhr) {

                    if (debug) { console.log(debug + 'response', successResponse); }

                    var id = successResponse.id;
                    var link = '';

                    try { successCallback(link, id); } catch (e) { }
                };
                var urlBody = 'companies.json';
                var request = buildRequest(nativeRecordType, successCallback2, failCallback);
                request.beforeSend = function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + store.accessToken);
                };
                request.url = buildUrl(defaultUrl, urlBody);
                request.type = 'POST';
                request.data = JSON.stringify(record);

                jQuery.ajax(request);
            };

            if (recordType.toUpperCase() === 'CONTACT') {
                createContact('Contacts');
            } else if (recordType.toUpperCase() === 'ACCOUNT') {
                createCompany('Account');
            } else {
                failCallback('Invalid record type: ' + (recordType || 'Null'));
            }

        },


        /**
        * @function updateRecord
        * @description Updates record.
        * @memberOf captureApp.webServices.exportTargetVer1.salesloft
        * @param {string} recordId - Record ID
        * @param {recordType} recordType - Record Type ('lead', 'contact' or 'account')
        * @param {object} record - Native record. Include only fields to be updated. 
        * @param {captureApp.webServices.exportTargetVer1~updateRecordSuccessCallback} successCallback 
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback
        */
        updateRecord: function (recordId, recordType, record, successCallback, failCallback) {

            console.log('000000000000000000 UPDATE RECORD 000000000000000000');

            if (debug) { console.log(debug + 'updateRecord', recordId, recordType, record); }

            var updateContact = function (nativeRecordType) {

                if (debug) { console.log(debug + 'post', angular.copy(record)); }

                var successCallback2 = function (successResponse, textStatus, xhr) {

                    if (debug) { console.log(debug + 'response', successResponse); }
                    try { successCallback(recordId); } catch (e) { }
                };

                var buildRequest2 = function (method, id, successCallback, failCallback) {
                    var urlBody = 'people/';
                    return {
                        type: 'GET',
                        url: buildUrl(defaultUrl, urlBody) + id,
                        contentType: 'application/json',
                        crossDomain: true,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + store.accessToken);
                        },
                        success: function (successResponse, textStatus, xhr) {
                            successCallback(successResponse, textStatus, xhr);
                        },
                        error: function (errorResponse) {
                            var response = handleErrorMessageText(errorResponse);
                            failCallback(response, errorResponse.status || 500);
                        }
                    };
                };

                var request = buildRequest2(nativeRecordType, recordId, successCallback2, failCallback);
                request.type = 'PATCH';
                request.data = JSON.stringify(record);

                jQuery.ajax(request);
            };

            if (recordType.toUpperCase() === 'CONTACT') {
                updateContact('Contacts');
            } else {
                failCallback('Invalid record type');
            }

        },

        //  From CRM object to lookup object (each object is defined as {label: '', link: ''})
        toLookupObject: function (crmObject, entityType) {
            //if (debug) { console.log(debug + 'toLookupObject->entityType', entityType, '->crmObject', crmObject); }

            console.log('000000000000000000 TO LOOKUP OBJECT 000000000000000000');

            var lookupObject = { label: '', link: '' };

            try {
                if (entityType.toLowerCase() === 'account') {

                    console.log('000000000000000000 TO LOOKUP OBJECT ACCOUNT 000000000000000000');
                    console.log(crmObject);

                    var cityState = '';
                    if (crmObject && (crmObject.City || crmObject.State)) {
                        cityState = ' (' + (crmObject.City || '') + ((crmObject.City && crmObject.State) ? ', ' : '') + (crmObject.State || '') + ')';
                    }
                    lookupObject.label = (crmObject.domain || '(no name)');
                    lookupObject.link = '';
                    lookupObject.id = crmObject.id;
                }
            } catch (e) {
                console.log('ERROR in toLookupObject', e.message);
            }

            //if (debug) { console.log(debug + 'toLookupObject->result', lookupObject); }
            return lookupObject;
        },

        /**
        * @function getRequiredLookups
        * @description Returns an array of lookups required prior to saving a record .
        * @memberOf captureApp.webServices.exportTargetVer1.salesloft
        * @param {recordType} recordType - Record type 
        * @return {captureApp.webServices.exportTargetVer1~lookup[]}
        */
        getRequiredLookups: function (entityType, actualMap) {

            console.log('000000000000000000 GET REQUIRED LOOKUPS 000000000000000000');

            entityType = entityType.toLowerCase();

            if (actualMap) {

                if (debug) { console.log(debug + 'getRequiredLookups->map', actualMap); }

                var aa = [];

                // convert map def to lookup def

                for (var i = 0, l = actualMap.fields.length; i < l; i++) {
                    var f = actualMap.fields[i];
                    if (f.source && (f.source.type === 'lookup' || f.source.type === 'picklist' || f.source.type === 'action')) {

                        if (f.source && f.source.value && f.source.value.enabled === false) {
                            console.log('disabled action', angular.copy(f));
                            continue;
                        }

                        var a;

                        if (f.source.value) {
                            a = {
                                crmProperty: f.target.name,
                                appProperty: f.source.value.appProperty,
                                message: f.source.value.message,
                                type: f.source.value.type,
                                defaultValue: f.source.value.defaultValue ? { id: f.source.value.defaultValue.value, label: f.source.value.defaultValue.label } : null,
                                required: f.source.value.required,
                                allowNew: f.source.value.allowNew,
                                picklist: f.source.value.picklist || f.source.type === 'picklist',
                                resolve: f.source.value.resolve,
                                hidden: f.source.value.hidden
                            };
                        } else {
                            a = {
                                crmProperty: f.target.name,
                                appProperty: '',
                                message: '',
                                type: '',
                                defaultValue: '',
                                required: false,
                                allowNew: false,
                                picklist: f.source.type === 'picklist',
                                resolve: null,
                            };
                        }

                        if (f.source.type === 'picklist') {
                            a.type = entityType;
                            a.allowNew = false;
                        }


                        aa.push(a);
                    }
                }

                if (debug) { console.log(debug + 'getRequiredLookups->result', aa); }

                return aa;
            }

            if (entityType === 'contact') {
                console.log('000000000000000000 GET REQUIRED LOOKUPS CONTACT 000000000000000000');
                return [ //{ crmProperty: 'company_id', appProperty: 'website', message: 'Select Company Domain', type: 'Account', required: false, allowNew: true, resolve: 'createNewAccount' }
                    //,
                    //    { crmProperty: 'OwnerId', appProperty: 'full', message: 'Select account owner', type: 'SystemUser', required: false, allowNew: false }
                ];
            }
            /*if (entityType === 'lead') {
                //return [{
                //    crmProperty: 'Campaign', appProperty: 'campaign', message: 'Select Campaign', type: 'Campaign', required: false, allowNew: false,
                //    resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //        service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    },
                //}, {
                //    crmProperty: 'LeadSource', appProperty: null, message: 'Select Lead Source', type: 'Lead', required: true, allowNew: false,
                //    picklist: true//,
                //    //resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //    //    console.log('resolve called', lookupId, objectId)
                //    //    //service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    //},
                //}];
            }*/
            if (entityType === 'account') { return []; }
            return [];
        },

        resolveLookup: function (actionId, lookupId, objectId, successCallback, failCallback) {

            console.log('000000000000000000 RESOLVE LOOKUP 000000000000000000');

            console.log(debug + 'resolveLookup->action->', actionId);
            console.log(debug + 'resolveLookup->lookup->', lookupId);
            console.log(debug + 'resolveLookup->object->', objectId);

            if (actionId === 'createNewAccount') {

                console.log('000000000000000000 RESOLVE LOOKUP CREATE NEW ACCOUNT 000000000000000000');

                if (!lookupId.newName) {
                    // existing account, quit
                    try { successCallback(); } catch (e) { }
                    return;
                }

                var createSourceRecord = angular.copy(lookupId.record);
                createSourceRecord.company = lookupId.newName;

                service.createRecord('Account', createSourceRecord, null,

                    // created successfully
                    function (accountLink, accountId) {
                        console.log('account was created', accountLink, accountId);
                        var updateData = {};
                        updateData[lookupId.crmProperty] = accountId;
                        // update the new candidate
                        service.updateRecord(objectId, 'Contact', updateData, successCallback, failCallback);
                    },

                    // create failed
                    function (msg) {
                        console.log('account was not created', msg);
                        failCallback('Account was not created');
                    }

                );

            } else if (actionId === 'addToCadence') {


            } else {

                console.log('ERROR: Unknown action', lookupId);
                failCallback('Unknown action');

            }

        },


        /**
        * @function getDefaultExportMaps
        * @description (Reserved for future use) Return an empty array. 
        * maps: [ {captureField: { name: '', label: '' }, crmField: { name: '', label: '' } } ]
        * @memberOf captureApp.webServices.exportTargetVer1.salesloft
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback  - pass the empty array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback 
        */
        getDefaultExportMaps: function (successCallback, failureCallback) {

            var maps = [];

            //maps.push({ name: 'contact', label: 'Contact', map: null });

            successCallback(maps);
        },


        /**
        * @function getDefinition
        * @description Returns configuration for Multi-Merge dialog. 
        * How to modify:
        * 1. Put native field names in def.fields.map.{Field}.id
        * 2. Remove lines that do not have corresponding native fields, or where fields are read-only
        * @memberOf captureApp.webServices.exportTargetVer1.salesloft
        * @param {string} recordType - 'lead', 'contact' or 'account'. 
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback  - pass the empty array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback 
        */
        getDefinition: function (recordType, successCallback, failureCallback) {

            console.log('000000000000000000 GET RECORD TYPE 000000000000000000');


            if (debug) { console.log(debug + 'getDefinition', recordType); }


            var def = {};
            recordType = recordType.toLowerCase();
            /*if (recordType === 'lead') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { display: 'First Name', group: 'G1' },
                            'LastName': { display: 'Last Name', group: 'G1' },
                            'Title': { display: 'Job Title', group: 'G1' },
                            'Company': { display: 'Company', group: 'G1' },
                            'Email': { display: 'Email', group: 'G1' },
                            'Phone': { display: 'Phone', group: 'G1' },
                            'MobilePhone': { display: 'Mobile Phone', group: 'G1' },
                            'Website': { display: 'Website', group: 'G1' },
                            'Description': { display: 'Description', group: 'G1' },

                            'Street': { display: 'Street', group: 'G2' },
                            'City': { display: 'City', group: 'G2' },
                            'State': { display: 'State/Province', group: 'G2' },
                            'PostalCode': { display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { display: 'Country', group: 'G2' },
                        }
                    }
                };

            } else*/ if (recordType === 'contact') {

                console.log('000000000000000000 GET RECORD TYPE CONTACT 000000000000000000');
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'MobilePhone', 'Linkedin'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'MobilePhone', 'Linkedin', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { id: 'first_name', display: 'First Name', group: 'G1' },
                            'LastName': { id: 'last_name', display: 'Last Name', group: 'G1' },
                            'Title': { id: 'title', display: 'Position', group: 'G1' },
                            //'Company': { id: 'QUICK_ACCOUNT_NAME', display: 'Company', group: 'G1' },
                            'Email': { id: 'email_address', display: 'Email 1', group: 'G1' },
                            'Phone': { id: 'phone', display: 'Work Phone', group: 'G1' },
                            'MobilePhone': { id: 'mobile_phone', display: 'Phone 2', group: 'G1' },
                            //'Website': { id: 'Website', display: 'Website', group: 'G1' },
                            'Linkedin': { id: 'linkedin_url', display: 'Linkedin', group: 'G1' },

                            //'Street': { id: 'Address', display: 'Address', group: 'G2' },
                            'City': { id: 'city', display: 'City', group: 'G2' },
                            'State': { id: 'state', display: 'State/Province', group: 'G2' },
                            //'PostalCode': { id: 'PostalCode', display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { id: 'country', display: 'Country', group: 'G2' }
                        }
                    }
                };
            } else {
                failureCallback('Invalid record type');
            }
            successCallback(def);
        },


        /**
        * @function toNativeRecord
        * @description Converts Capture Contact to native record. 
        * @memberOf captureApp.webServices.exportTargetVer1.pipeliner
        * @param {captureContact} captureRecord - Capture Contact
        * @param {recordType} recordType - Record type. 
        * @return {object} - Native record
        */
        toNativeRecord: function (captureRecord, recordType) {
            recordType = recordType.toLowerCase();
            if (recordType === 'contact') { return toContact(captureRecord); }
            return null;
        },


        /**
        * @function fromNativeRecord
        * @description Converts native record to Capture Contact. 
        * @memberOf captureApp.webServices.exportTargetVer1.salesloft
        * @param {object} nativeRecord - Native record
        * @param {recordType} recordType - Record type. 
        * @return {captureContact} - Capture Contact
        */
        fromNativeRecord: function (nativeRecord, recordType) {
            recordType = recordType.toLowerCase();
            if (recordType === 'contact') { return fromContact(nativeRecord); }
            return null;
        },


        /**
        * @function findDuplicates
        * @description Returns an array of duplicate records of given type.
        * @memberOf captureApp.webServices.exportTargetVer1.salesloft
        * @param {captureContact} recordType - Record type. 
        * @param {captureContact} captureRecord - Source Capture Contact. 
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - Pass the resulting array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback  
        * @return {captureContact[]} - Array of Capture Contacts
        */
        findDuplicates: function (recordType, captureRecord, successCallback, failCallback) {

            console.log('000000000000000000 FINDING DUPLICATES 000000000000000000');

            if (debug) { console.log(debug + 'findcoDuplicates', recordType, captureRecord); }


            var findContact = function () {

                if (debug) { console.log(debug + 'findContact', angular.copy(captureRecord)); }

                var filter;

                if (captureRecord.email){
                    filter = encodeURIComponent(captureRecord.email);
                } else {
                    try { failCallback('Salesloft Requires an Email to create a Contact'); } catch (e) { }
                    return;
                }

                if (debug) { console.log(debug + 'filter', filter); }

                var successCallback2 = function (successResponse, textStatus, xhr) {

                    console.log('Response: ', successResponse);
                    if (debug) { console.log(debug + 'response', successResponse); }

                    var dups = [];
                    var dup = fromContact(successResponse);
                    dups.push(dup);
                    if (debug) { console.log(debug + 'List Dups', dups); }
                    try { successCallback({ duplicates: dups }); } catch (e) { }
                };

                var buildRequest2 = function (method, filter, successCallback, failCallback) {
                    var urlBody = 'people/' + filter;
                    return {
                        type: 'GET',
                        url: buildUrl(defaultUrl, urlBody),
                        contentType: 'application/json',
                        crossDomain: true,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + store.accessToken);
                        },
                        success: function (successResponse, textStatus, xhr) {
                            console.log('Duplicates Found');
                            console.log(successResponse);
                            successCallback(successResponse, textStatus, xhr);
                        },
                        error: function (errorResponse) {

                            console.log(errorResponse);
                            var response = errorResponse;
                            if (errorResponse.status === 404) {

                                console.log('FIND DUPLICATE 404');
                                failCallback();
                            } else {

                                console.log('FIND DUPLICATE OTHER ERROR');
                                failCallback(response, errorResponse.status || 500);
                            }
                            
                        }
                    };

                };

                var request = buildRequest2(recordType, filter, successCallback2, failCallback);

                jQuery.ajax(request);
            };

            if (recordType.toUpperCase() === 'CONTACT') {
                recordType = 'Contacts';
                findContact();
            } else {
                try { successCallback({ duplicates: [] }); } catch (e) { }
            }


        },

        findRecord: function (recordType, query, fields, successCallback, failCallback) {
            console.log('000000000000000000 FINDING RECORD 000000000000000000');

            //var service = this;             
            var urlBody;
            var encodeParam = function (p) {
                return p.replace(/'/g, '%5C%27');
            };

            if (debug) { console.log(debug + 'findRecord->type:', recordType, '->query:', query, '->fields:', fields); }

            if (recordType === 'account') { recordType = 'Account'; }
            if (recordType === 'lead') { recordType = 'Lead'; }
            if (recordType === 'contact') { recordType = 'Contact'; }
            if (recordType === 'campaign') { recordType = 'Campaign'; }

            var where = [];

            if (query) {

                if (query.email)
                { where.push('Email=\'' + encodeParam(query.email) + '\''); }

                if (query.email_endsWith)
                { successCallback(); }

                if (query.last)
                { where.push('LastName=\'' + encodeParam(query.last) + '\''); }

                if (query.first)
                { where.push('FirstName=\'' + encodeParam(query.first) + '\''); }

                if (recordType === 'Account') {
                    if (query.company)
                    { where.push('Name+LIKE+\'%25' + encodeParam(query.company) + '%25\''); }
                }

                /*if (recordType === 'Campaign') {
                    if (query.campaign)
                    { where.push('Name+LIKE+\'%25' + encodeParam(query.campaign) + '%25\''); }
                }*/

                if (recordType === 'Cadence') {
                    if (query.cadence)
                    {where.push('');}
                }

            }
            var whereStr = where.join('+AND+');
            if (whereStr) { whereStr = '+WHERE+' + whereStr; } else { whereStr = '+'; }
            console.log(whereStr);

            var fieldsStr = '*';
            var f;


            if (recordType === 'Account') {

                console.log('000000000000000000 FINDING RECORD ACCOUNT 000000000000000000');
                console.log('Fields: ', fields);
                console.log('Query: ', query);
                urlBody = 'companies/' + query.website;
                f = [];

                f.push('ID');

                if (fields.indexOf('company') > -1) { f.push('Name'); }
                if (fields.indexOf('website') > -1) { f.push('Website'); }
                if (fields.indexOf('_createdDate') > -1) { f.push('CreatedDate'); }

                fieldsStr = f.join(',');
            }

            if (recordType === 'Contact') {
                urlBody = 'people/';
                f = [];

                f.push('ID');

                if (fields.indexOf('first') > -1) { f.push('FirstName'); }
                if (fields.indexOf('last') > -1) { f.push('LastName'); }
                if (fields.indexOf('email') > -1) { f.push('Email'); }
                //if (fields.indexOf('middle') > -1) { f.push('MiddleName '); }

                fieldsStr = f.join(',');
            }

            if (recordType === 'Cadence') {
                urlBody = '';

            }

            var headers = { 'Content-type': 'application/json', 'Authorization': 'Bearer ' + store.accessToken, 'Accept': 'application/json' };
            var config = {
                method: 'GET',
                url: buildUrl(defaultUrl, urlBody),
                headers: headers
            };
            if (debug) { console.log(debug + 'findRecord->config:', config); }

            var allRecords = [];

            var errorHandler = function (response, status) {

                if (debug) { console.log(debug + 'findRecord->failResponse', response); }
                var msg = '';
                if (response && response.length > 0) {

                    if (response[0].errorCode === 'INVALID_SESSION_ID') {
                        console.log(service);
                        service.logout();
                        failCallback('Session expired. Please log in.');
                    }

                    var i = 0;
                    while (i < response.length) {
                        if (response[i].message)
                        { msg += response[i].message + ' '; }
                        i++;
                    }
                }
                if (status === 404) {
                    try { successCallback(allRecords); } catch (e) { }
                } else {
                    try { failCallback(response, status || 500); } catch (e) { }
                }
                

            };

            var successHandler = function (response) {

                if (debug) { console.log(debug + 'findRecord->successResponse', response); }

                allRecords = allRecords.concat(response);

                /*if (!response.done && response.nextRecordsUrl) {
                    config.url = store.url + response.nextRecordsUrl;
                    $http(config).success(successHandler).error(errorHandler);
                }
                else { try { successCallback(allRecords); } catch (e) { } }
                */
                try { successCallback(allRecords); } catch (e) { }
            };

            $http(config).success(successHandler).error(errorHandler);

        },

        /**
        * @function retrieveRecord
        * @description Returns single recor.
        * @memberOf captureApp.webServices.exportTargetVer1.pipeliner
        * @param {string} recordId - Record ID 
        * @param {recordType} recordType - Record type
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - Pass the native record as a parameter
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback - Return error message
        */
        retrieveRecord: function (recordId, recordType, successCallback, failCallback) {

            console.log('000000000000000000 RETREIVE RECORD 000000000000000000');

            if (recordType.toLowerCase() === 'lead') { recordType = 'Leads'; }
            if (recordType.toLowerCase() === 'contact') { recordType = 'Contacts'; }

            var buildRequest2 = function (method, id, successCallback, failCallback) {
                var urlBody = 'people/';
                return {
                    type: 'GET',
                    url: buildUrl(defaultUrl, urlBody) + id,
                    contentType: 'application/json',
                    crossDomain: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + store.accessToken);
                    },
                    success: function (successResponse, textStatus, xhr) {
                        successCallback(successResponse, textStatus, xhr);
                    },
                    error: function (errorResponse) {
                        var response = handleErrorMessageText(errorResponse);
                        failCallback(response, errorResponse.status || 500);
                    }
                };
            };

            var successCallback2 = function (successResponse, textStatus, xhr) {

                if (debug) { console.log(debug + 'response', successResponse); }

                try { successCallback(successResponse); } catch (e) { }
            };

            var request = buildRequest2(recordType, recordId, successCallback2, failCallback);

            jQuery.ajax(request);
        },


        /*
        * Returns JSON with all Team Pipeline Clients. Function is supposed to help obtain value for OWNER_ID field.
        * E.g.: {
        *   "Stefan Smihla (stefan.smihla@pipelinersales)": 12345,
        *   "Example User (example@user.com)": 56789
        * }
        */
        getClients: function (successCallback, failCallback) {

            if (debug) { console.log(debug + 'getClients'); }

            var successFunc = function (successResponse) {
                var clients = {};
                for (var i in successResponse) {
                    var item = successResponse[i];
                    var firstname = item.FIRSTNAME || '';
                    var surname = item.LASTNAME || '';
                    var fullname = firstname + ' ' + surname + ' (' + item.EMAIL + ')';
                    clients[fullname] = item.ID;
                }
                //successCallback(JSON.stringify(clients));
                successCallback(clients);
            };

            service.getEntities('Clients', successFunc, failCallback);
        },

        /* Sets Sales Unit ID. This value will be needed fpr required SALES_UNIT_ID. */
        setSalesUnit: function (salesUnit) {
            store.salesUnit = salesUnit;
        },

        getEntities: function (nativeRecordType, successCallback, failCallback) {

            if (debug) { console.log(debug + 'getEntities', nativeRecordType); }

            var request = buildRequest(nativeRecordType, successCallback, failCallback);
            request.success = successCallback;
            jQuery.ajax(request);
        },

    };

    return service;
}]);
/**
 * @class captureApp.webServices.exportTargetVer1.marketo
 * @memberOf captureApp.webServices.exportTargetVer1
 * @description This is Marketo AngularJS service.
 * @constructor
 * @param {object} $http - Angular HTTP service.
 * @param {object} $q - Angular q service.
 * @param {object} endpoints - Capture enpoints service.
 * @param {object} dialogs - Capture dialogs service.
 */

/**********************************************************************
* Marketo AngularJS service
* Author: Justin Stull  
* Email: jstull@ringlead.com
* Version: 0.0.1

failCallback: function( errorMessage, statusCode (optional), other (optional) )

Minimum implementation:

- createRecord
- isLoggedIn
- login

**********************************************************************/
'use strict';

/* global angular: false */
/* global jQuery: false */
/* global geographyData: false */
/* global backgroundUtility: false */

angular.module('webServices')
.factory('marketo', ['$http', '$q', 'endpoints', 'dialogs', function ($http, $q, endpoints, dialogs) {

    var debug = 'marketo.js->';
    var defaultUrl = 'mktorest.com';
    var store = {};

    /* Builds basic Marketo REST url from provided Service URL and Marketo ID*/
    var buildUrl = function (instance, domain, body) {
        return 'https://' + instance + '.' + domain + body;
    };

    var getVenue = function (record, domain) {
        if (record && record.venues) {
            var venueCount = record.venues.length;
            for (var i = 0; i < venueCount; i++) {
                var profile = record.venues[i].website;
                if (profile && profile.indexOf(domain) >= 0) {
                    return profile;
                }
            }
        }
        return '';
    };

    /* Handles error response from Marketo API. It should try to return string message if provided. 
    *
    * r - HTTP response
    * asJson - if true, then error message will returns as JSON object, otherwise as String.
    */
    var handleErrorMessageText = function (r, asJson) {
        var status = r.status || 500;
        var msg = '';
        if (r.responseJSON) { msg = r.responseJSON; }
        else if (r.responseText) {
            try {
                msg = JSON.parse(r.responseText);
            } catch (err) {
                msg = r.responseText;
            }
        } else if (r.statusText) {
            msg = r.statusText;
        } else {
            msg = 'Unknown error';
        }
        if (asJson !== undefined) {
            return msg;
        } else {
            if (msg.hasOwnProperty('message')) { msg = msg.message; }
            return msg;
        }
    };


    var mapField = function (source, sourceKey, target, targetKey) {
        var sourceKeyParts = sourceKey.split('.');

        if (sourceKeyParts.length === 2) {
            try {
                target[targetKey] = source[sourceKeyParts[0]][sourceKeyParts[1]];
            } catch (e) {
                target[targetKey] = null;
            }
        }
        else { target[targetKey] = source[sourceKey]; }
    };
    var mapFromField = function (target, targetKey, source, sourceKey) {
        mapField(source, sourceKey, target, targetKey);
    };


    var toContact = function (captureRecord) {

        if (debug) {
            console.log(debug + 'toContact:IN', captureRecord);
        }

        var nativeRecord = {};
        mapField(captureRecord, 'first', nativeRecord, 'firstName');
        mapField(captureRecord, 'last', nativeRecord, 'lastName');
        mapField(captureRecord, 'jobtitle', nativeRecord, 'title');
        mapField(captureRecord, 'company', nativeRecord, 'company');
        mapField(captureRecord, 'website', nativeRecord, 'website');
        mapField(captureRecord, 'email', nativeRecord, 'email');
        mapField(captureRecord, 'phone', nativeRecord, 'mainPhone');
        mapField(captureRecord, 'phone2', nativeRecord, 'phone');
        //mapField(captureRecord, 'bio', nativeRecord, 'Notes');
        mapField(captureRecord, 'address1', nativeRecord, 'address');
        mapField(captureRecord, 'city', nativeRecord, 'city');
        mapField(captureRecord, 'state', nativeRecord, 'state');
        mapField(captureRecord, 'zip', nativeRecord, 'postalCode');
        mapField(captureRecord, 'country', nativeRecord, 'country');
        mapField(captureRecord, 'linkedin', nativeRecord, 'linkedInProfileURL');
        mapField(captureRecord, 'facebook', nativeRecord, 'facebookProfileURL');
        mapField(captureRecord, 'twitter', nativeRecord, 'twitterProfileURL');

        if (debug) {
            console.log(debug + 'toContact:OUT', nativeRecord);
        }

        return nativeRecord;
    };

    var fromContact = function (nativeRecord) {


        if (debug) {
            console.log(debug + 'fromContact:IN', nativeRecord);
        }
        var captureRecord = {};
        captureRecord.venues = [{}, {}, {}];
        mapFromField(captureRecord, 'first', nativeRecord, 'firstName');
        mapFromField(captureRecord, 'last', nativeRecord, 'lastName');
        mapFromField(captureRecord, 'jobtitle', nativeRecord, 'title');
        mapFromField(captureRecord, 'company', nativeRecord, 'company');
        mapFromField(captureRecord, 'website', nativeRecord, 'website');
        mapFromField(captureRecord, 'email', nativeRecord, 'email');
        mapFromField(captureRecord, 'phone', nativeRecord, 'mainPhone');
        mapFromField(captureRecord, 'phone2', nativeRecord, 'phone');
        //mapFromField(captureRecord, 'bio', nativeRecord, 'Notes');
        mapFromField(captureRecord, 'address1', nativeRecord, 'address');
        mapFromField(captureRecord, 'city', nativeRecord, 'city');
        mapFromField(captureRecord, 'state', nativeRecord, 'state');
        mapFromField(captureRecord, 'zip', nativeRecord, 'postalCode');
        mapFromField(captureRecord, 'country', nativeRecord, 'country');
        mapFromField(captureRecord.venues[0], 'website', nativeRecord, 'linkedInProfileURL');
        mapFromField(captureRecord.venues[1], 'website', nativeRecord, 'facebookProfileURL');
        mapFromField(captureRecord.venues[2], 'website', nativeRecord, 'twitterProfileURL');
        //mapFromField(captureRecord, 'sourceurl', nativeRecord, 'LinkedIn');
        captureRecord._link = 'https://app-sjh.marketo.com/leadDatabase/loadLeadDetail?leadId=' + nativeRecord.id;
        captureRecord._type = 'Contact';
        captureRecord._id = nativeRecord.id;

        if (debug) {
            console.log(debug + 'fromContact:OUT', captureRecord);
        }

        return captureRecord;
    };

    /*
    Handles the expiration counter. Clears the access token in store when the expiration is up.
    */
    var currentTime = function () {
        var time = new Date();
        return time.getTime();
    };

    var expirationMarker = function (time, duration) {
        return time + (duration * 1000);
    };

    var checkExpiration = function () {
        return currentTime() < store.keyExpires;
    };

    var service = {


        /**
        * @function getName
        * @description Return name of export target.
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        */
        getName: function () {
            return 'Marketo';
        },


        /**
        * @function init
        * @description Initializes store object. Sets user credentials, owner and team pipeline id.
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        * @param {object} o - List of target-specific settings.
        */
        init: function (o) {

            if (debug) { console.log(debug + 'Initializing Credentials ...'); }
            console.log(o);
            store.username = o.username;
            store.password = o.password;
            store.marketoId = o.marketoId;

        },


        /**
        * @function login
        * @description Logs user in. Either silently (if possible) or interactively.
        * There is need to provide Username, Password, Database ID, API Key and App ID.
        * Follow 'http://www.marketo.net/apidocs_v2/ to see how to obtain the API key and App ID.
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - This callback informs that user was logged in successfully. 
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback - This callback informs that user cannot log in.
        */
        login: function (successCallback, failCallback) {
            if (debug) { console.log(debug + 'Logging into Marketo...'); }

            var username = store.username;
            var password = store.password;
            var marketoId = store.marketoId;

            var url = buildUrl(store.marketoId, defaultUrl, '/identity/oauth/token?grant_type=client_credentials&client_id=' + username + '&client_secret=' + password);
            $http.get(url)
                    .success(function (data, status, headers, config) {
                        if (debug) { console.log(debug + 'MARKETO LOGIN SUCCESSFUL', data, status); }
                        store.authToken = data.access_token;
                        store.keyExpires = expirationMarker(currentTime(), data.expires_in);
                    })
                    .error(function (data, status, headers, config) {
                        console.log(debug + 'ERROR in GET', data, status, headers, config);
                        try { failCallback(); } catch (e) { }
                    });
        },

        /**
         * @function logout
         * @description Logs user out. Cleans up store variable.I
         * @memberOf captureApp.webServices.exportTargetVer1.marketo
         */
        logout: function () {

            //var urlBody = 'access-token?SessionId=' + store.authId + '&AppId=' + appId + '&ApiKey=' + apiKey;

            //var request = buildRequest('', function () { }, function () { });

            //request.url = buildUrl(defaultUrl, urlBody);
            //request.type = 'DELETE';
            //jQuery.ajax(request);
            store = {};
            if (debug) { console.log(debug + 'Logged out...'); }
        },


        /**
         * @function isLoggedIn
         * @description Checks if user is logged in.
         * @memberOf captureApp.webServices.exportTargetVer1.marketo
         * @param {captureApp.webServices.exportTargetVer1~isLoggedInSuccessCallback} successCallback - This callback informs that user is currently logged in.
         * @param {captureApp.webServices.exportTargetVer1~isLoggedInFailCallback} failCallback - This callback informs that user is not currently logged in.
         */
        isLoggedIn: function (successCallback, failCallback) {
            var isLogged = !!(store.authToken !== undefined && checkExpiration());

            if (debug) { console.log(debug + 'isLogged', isLogged); }

            if (!isLogged) {
                // Since we can do it... Do silent login.
                service.login(successCallback, failCallback);
            }
            else { try { successCallback(); } catch (e) { } }
        },


        /**
       * @function createRecord
       * @description Creates record.
       * @memberOf captureApp.webServices.exportTargetVer1.marketo
       * @param {recordType} recordType - Destination Record Type
       * @param {captureContact} captureRecord - Source Capture Record.
       * @param {object} createOptions - Options (For future use)
       * @param {captureApp.webServices.exportTargetVer1~createRecordSuccessCallback} successCallback 
       * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback
       */
        createRecord: function (recordType, captureRecord, createOptions, successCallback, failCallback) {

            console.log(captureRecord.venues);

            if (debug) { console.log(debug + 'createRecord', captureRecord); }

            var createLead = function (nativeRecordType) {

                var input = {
                    'firstName': (captureRecord.first || ''),
                    'lastName': (captureRecord.last || ''),
                    'email': (captureRecord.email || ''),
                    'title': (captureRecord.jobtitle || ''),
                    'company': (captureRecord.company || ''),
                    'mainPhone': (captureRecord.phone || ''),
                    'phone': (captureRecord.phone2 || ''),
                    'website': (captureRecord.website || ''),
                    //'Notes': 'Created by Capture!' + '\n\n' + (captureRecord.bio || ''),
                    'address': (captureRecord.address1 || '') + '\n' + (captureRecord.address2 || ''),
                    'city': (captureRecord.city || ''),
                    'state': (captureRecord.state || ''),
                    'postalCode': (captureRecord.zip || ''),
                    'country': (captureRecord.country || ''),
                    'linkedInProfileURL': getVenue(captureRecord, 'linkedin.com'),
                    'facebookProfileURL': getVenue(captureRecord, 'facebook.com'),
                    'twitterProfileURL': getVenue(captureRecord, 'twitter.com')
                };

                console.log('THIS IS THE LINKEDIN RESULT');
                console.log(input.linkedInProfileURL);

                var record = {
                    'action': 'createOnly',
                    'lookupField': 'email',
                    'input': [input]
                };

                if (createOptions && createOptions.mappedProperties) {
                    var j = createOptions.mappedProperties.length;
                    while (j--)
                    { record[createOptions.mappedProperties[j].name] = createOptions.mappedProperties[j].value; }
                }

                if (debug) { console.log(debug + 'post', angular.copy(record)); }

                var url = buildUrl(store.marketoId, defaultUrl, '/rest/v1/leads.json');

                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + store.authToken
                    }
                };

                $http.post(url, record, config)
                    .success(function (data, status, headers, config) {
                        var id = data.result[0].id;
                        var link = 'https://app-sjh.marketo.com/leadDatabase/loadLeadDetail?leadId=' + id;
                        if (debug) { console.log(debug + 'response', data, status); }
                        if (id !== undefined) {
                            try { successCallback(link, id); } catch (e) { }
                        } else {
                            try { failCallback('Not Processed. ' + data.result[0].reasons[0].message + '.'); } catch (e) { }
                        }

                    })
                    .error(function (data, status, headers, config) {
                        console.log(debug + 'ERROR in POST', data, status, headers, config);
                        try { failCallback(); } catch (e) { }
                    });

            };


            if (recordType.toUpperCase() === 'CONTACT') {
                createLead('Contacts');
            } else {
                failCallback('Invalid record type');
            }

        },


        /**
        * @function updateRecord
        * @description Updates record.
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        * @param {string} recordId - Record ID
        * @param {recordType} recordType - Record Type ('lead', 'contact' or 'account')
        * @param {object} record - Native record. Include only fields to be updated. 
        * @param {captureApp.webServices.exportTargetVer1~updateRecordSuccessCallback} successCallback 
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback
        */
        updateRecord: function (recordId, recordType, record, successCallback, failCallback) {

            if (debug) { console.log(debug + 'updateRecord', recordId, recordType, record); }

            var updateContact = function (nativeRecordType) {

                var info = {
                    'action': 'updateOnly',
                    'lookupField': 'email',
                    'input': [record]
                };

                var config = {
                    headers: {
                        'Authorization': 'Bearer ' + store.authToken
                    }
                };

                var url = buildUrl(store.marketoId, defaultUrl, '/rest/v1/leads.json');

                $http.post(url, info, config)
                    .success(function (data, status, headers, config) {
                        if (debug) { console.log(debug + 'response', data, status); }
                        try { successCallback(recordId); } catch (e) { }
                    })
                    .error(function (data, status, headers, config) {
                        if (debug) { console.log(debug + 'ERROR in Update', data, status, headers, config); }
                        try { failCallback(); } catch (e) { }
                    });

            };

            if (recordType.toUpperCase() === 'CONTACT') {
                updateContact('Contacts');
            } else {
                failCallback('Invalid record type');
            }

        },

        //  From CRM object to lookup object (each object is defined as {label: '', link: ''})
        toLookupObject: function (crmObject, entityType) {
            if (debug) { console.log(debug + 'toLookupObject->entityType', entityType, '->crmObject', crmObject); }

            entityType = entityType.toLowerCase();
            var lookupObject = { label: '', link: '' };
            var appObject = null;
            //if (entityType === 'contact') { appObject = this.fromContact(crmObject); }
            //if (entityType === 'lead') {
            //    appObject = this.fromLead(crmObject);
            //}
            if (entityType === 'account') {
                var cityState = '';
                lookupObject.label = (crmObject.CompanyName || '(no name)') + cityState;
                lookupObject.link = 'https://pcr.com/?cid=' + crmObject.CompanyId; // Fake link. TODO: Make real link.
                lookupObject.id = crmObject.CompanyId;
            }
            //if (entityType === 'campaign') {
            //    lookupObject.label = (crmObject.Name || '(no name)');
            //    lookupObject.link = store.url + '/' + crmObject.Id;
            //    lookupObject.id = crmObject.Id;
            //}
            if (debug) { console.log(debug + 'toLookupObject->result', lookupObject); }
            return lookupObject;
        },

        /**
        * @function getRequiredLookups
        * @description Returns an array of lookups required prior to saving a record .
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        * @param {recordType} recordType - Record type 
        * @return {captureApp.webServices.exportTargetVer1~lookup[]}
        */
        getRequiredLookups: function (entityType, actualMap) {
            return;
        },

        resolveLookup: function (actionId, lookupId, objectId, successCallback, failCallback) {

            console.log(debug + 'resolveLookup->action->', actionId);
            console.log(debug + 'resolveLookup->lookup->', lookupId);
            console.log(debug + 'resolveLookup->object->', objectId);

            if (actionId === 'createNewAccount') {

                console.log('NEW ACCOUNT', lookupId);

                if (!lookupId.newName) {
                    // existing account, quit
                    try { successCallback(); } catch (e) { }
                    return;
                }

                var createSourceRecord = angular.copy(lookupId.record);
                createSourceRecord.company = lookupId.newName;

                service.createRecord('Account', createSourceRecord, null,

                    // created successfully
                    function (accountLink, accountId) {
                        console.log('account was created', accountLink, accountId);
                        var updateData = {};
                        updateData[lookupId.crmProperty] = accountId;
                        // update the new candidate
                        service.updateRecord(objectId, 'Contact', updateData, successCallback, failCallback);
                    },

                    // create failed
                    function (msg) {
                        console.log('account was not created', msg);
                        failCallback('Account was not created');
                    }

                );

            } else {

                console.log('ERROR: Unknown action', lookupId);
                failCallback('Unknown action');

            }

        },


        /**
        * @function getDefaultExportMaps
        * @description (Reserved for future use) Return an empty array. 
        * maps: [ {captureField: { name: '', label: '' }, crmField: { name: '', label: '' } } ]
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback  - pass the empty array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback 
        */
        getDefaultExportMaps: function (successCallback, failureCallback) {

            var maps = [];

            //maps.push({ name: 'contact', label: 'Contact', map: null });

            successCallback(maps);
        },


        /**
        * @function getDefinition
        * @description Returns configuration for Multi-Merge dialog. 
        * How to modify:
        * 1. Put native field names in def.fields.map.{Field}.id
        * 2. Remove lines that do not have corresponding native fields, or where fields are read-only
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        * @param {string} recordType - 'lead', 'contact' or 'account'. 
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback  - pass the empty array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback 
        */
        getDefinition: function (recordType, successCallback, failureCallback) {


            if (debug) { console.log(debug + 'getDefinition', recordType); }


            var def = {};
            recordType = recordType.toLowerCase();
            /*if (recordType === 'lead') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { display: 'First Name', group: 'G1' },
                            'LastName': { display: 'Last Name', group: 'G1' },
                            'Title': { display: 'Job Title', group: 'G1' },
                            'Company': { display: 'Company', group: 'G1' },
                            'Email': { display: 'Email', group: 'G1' },
                            'Phone': { display: 'Phone', group: 'G1' },
                            'MobilePhone': { display: 'Mobile Phone', group: 'G1' },
                            'Website': { display: 'Website', group: 'G1' },
                            'Description': { display: 'Description', group: 'G1' },

                            'Street': { display: 'Street', group: 'G2' },
                            'City': { display: 'City', group: 'G2' },
                            'State': { display: 'State/Province', group: 'G2' },
                            'PostalCode': { display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { display: 'Country', group: 'G2' },
                        }
                    }
                };

            } else*/ if (recordType === 'contact') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Linkedin', 'Facebook', 'Twitter'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Linkedin', 'Facebook', 'Twitter', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { id: 'firstName', display: 'First Name', group: 'G1' },
                            'LastName': { id: 'lastName', display: 'Last Name', group: 'G1' },
                            'Title': { id: 'title', display: 'Position', group: 'G1' },
                            'Company': { id: 'company', display: 'Company', group: 'G1' },
                            'Email': { id: 'email', display: 'Email', group: 'G1' },
                            'Phone': { id: 'mainPhone', display: 'Main Phone', group: 'G1' },
                            'MobilePhone': { id: 'phone', display: 'Secondary Phone', group: 'G1' },
                            'Website': { id: 'website', display: 'Website', group: 'G1' },
                            'Linkedin': { id: 'linkedin', display: 'Linkedin', group: 'G1' },
                            'Facebook': { id: 'facebook', display: 'Facebook', group: 'G1' },
                            'Twitter': { id: 'twitter', display: 'Twitter', group: 'G1' },
                            //'Description': { id: 'Notes', display: 'Comments', group: 'G1' },

                            'Street': { id: 'address', display: 'Address', group: 'G2' },
                            'City': { id: 'city', display: 'City', group: 'G2' },
                            'State': { id: 'state', display: 'State/Province', group: 'G2' },
                            'PostalCode': { id: 'postalCode', display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { id: 'country', display: 'Country', group: 'G2' }
                        }
                    }
                };
            } else {
                failureCallback('Invalid record type');
            }
            successCallback(def);
        },


        /**
        * @function toNativeRecord
        * @description Converts Capture Contact to native record. 
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        * @param {captureContact} captureRecord - Capture Contact
        * @param {recordType} recordType - Record type. 
        * @return {object} - Native record
        */
        toNativeRecord: function (captureRecord, recordType) {
            recordType = recordType.toLowerCase();
            console.log('CAPTURE RECORD');
            console.log(captureRecord);
            if (recordType === 'contact') { return toContact(captureRecord); }
            return null;
        },


        /**
        * @function fromNativeRecord
        * @description Converts native record to Capture Contact. 
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        * @param {object} nativeRecord - Native record
        * @param {recordType} recordType - Record type. 
        * @return {captureContact} - Capture Contact
        */
        fromNativeRecord: function (nativeRecord, recordType) {
            recordType = recordType.toLowerCase();
            console.log(nativeRecord);
            if (recordType === 'contact') {
                console.log('RETURNING POSITIVE FROM NATIVE RECORD');
                return fromContact(nativeRecord.result[0]);
            }
            console.log('RETURNING NULL FROM NATIVE RECORD');
            return null;
        },


        /**
        * @function findDuplicates
        * @description Returns an array of duplicate records of given type.
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        * @param {captureContact} recordType - Record type. 
        * @param {captureContact} captureRecord - Source Capture Contact. 
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - Pass the resulting array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback  
        * @return {captureContact[]} - Array of Capture Contacts
        */
        findDuplicates: function (recordType, captureRecord, successCallback, failCallback) {

            if (debug) { console.log(debug + 'findcoDuplicates', recordType, captureRecord); }


            var findContact = function () {

                if (debug) { console.log(debug + 'findContact', angular.copy(captureRecord)); }


                var successCallback2 = function (successResponse, textStatus, xhr) {


                    if (debug) { console.log(debug + 'response', successResponse); }

                    if (successResponse.errors && successResponse.errors.length > 0) {
                        try { failCallback(successResponse.errors[0].message); } catch (e) { }
                    }

                    var dups = [];
                    if (successResponse.result.length > 0) {
                        for (var i = 0; i < successResponse.result.length; i++) {
                            var dup;
                            dup = fromContact(successResponse.result[i]);
                            dups.push(dup);
                        }
                    }
                    if (debug) { console.log(debug + 'List Dups', dups); }
                    try { successCallback({ duplicates: dups }); } catch (e) { }
                };

                var buildRequest2 = function (method, filter, successCallback, failCallback) {
                    return {
                        type: 'GET',
                        url: buildUrl(store.marketoId, defaultUrl, '/rest/v1/leads.json') + filter,
                        contentType: 'application/json',
                        crossDomain: true,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'Bearer ' + store.authToken);
                        },
                        success: function (successResponse, textStatus, xhr) {
                            console.log('Duplicates Found');
                            console.log(successResponse);
                            successCallback(successResponse, textStatus, xhr);
                        },
                        error: function (errorResponse) {

                            console.log(errorResponse);
                            var response = handleErrorMessageText(errorResponse);

                            failCallback(response, errorResponse.status || 500);
                        }
                    };

                };

                if (captureRecord.email) {

                    var emails = captureRecord.email;
                    if (captureRecord.email2) {
                        emails += ','+ captureRecord.email2;
                    }

                    var filter = '?filterType=email&filterValues=' + emails + '&fields=firstName,lastName,email,title,website,company,mainPhone,phone,address,city,state,postalCode,country,linkedInProfileURL,facebookProfileURL,twitterProfileURL';
                    if (debug) {
                        console.log(debug + 'filter', filter);
                    }
                    var request = buildRequest2(recordType, filter, successCallback2, failCallback);
                    jQuery.ajax(request);

                } else {
                    // no email = no dups 
                    try { successCallback({ duplicates: [] }); } catch (e) { }
                }

            };

            if (recordType.toUpperCase() === 'CONTACT') {
                recordType = 'Contacts';
                findContact();
            } else {
                try { successCallback({ duplicates: [] }); } catch (e) { }
            }

        },

        /*findDuplicates: function (recordType, contact, successCallback, failCallback) {

            var encode = function (s) {
                if (typeof s === 'undefined') { s = ''; }
                return s.replace(/'/g, '\\\'');
            };

            if (recordType === 'contact') { recordType = 'Contact'; }

            var fields = 'ID,LastName,FirstName,Email,Company,Phone,Title';
            if (recordType === 'Contact') { fields = 'ID,LastName,FirstName,Email,Title,Phone,Account.Name'; }

            var from = recordType;
            if (recordType === 'Contact')
            { from = 'Contact,Contact.Account'; }

            var where = '';

            var dups = [];

            var reponseHandle = null;
            var returnResponse = function() {
                try {
                    successCallback({ duplicates: dups });
                } catch (e) {}
            };

            var query = function (q) {
                var urlBody = 'candidates';

                try {

                    //calls Salesforce REST API with jQuery
                    jQuery.ajax({
                        type: 'GET',
                        url: buildUrl(defaultUrl, urlBody),
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'BEARER ' + store.authId);
                            xhr.setRequestHeader('Accept', 'application/json');
                        },
                        success: function (sfdata) {
                            console.log('findDuplicates results', sfdata);

                            if (!sfdata.records)
                            { try { failCallback(); } catch (e) { } }

                            
                            for (var i = 0; i < sfdata.records.length; i++) {
                                var dup = {};
                                if (recordType === 'Lead') { dup = service.fromLead(sfdata.records[i]); }
                                else if (recordType === 'Contact') { dup = service.fromContact(sfdata.records[i]); }
                                dups.push(dup);
                            }

                            if (reponseHandle) {
                                window.clearTimeout(reponseHandle);
                            }
                            reponseHandle = window.setTimeout(returnResponse, 2000);

                        },
                        failure: function (error) {
                            console.log('ERROR in findDuplicates', error);
                            try { failCallback(); } catch (e) { }
                        }
                    });

                } catch (e) {
                    console.log('ERROR in query', e.message);
                    try { failCallback(); } catch (e) { }
                }

            };

            if (recordType.toUpperCase() === 'CONTACT') {
                query('?query=FirstName eq ' + (captureRecord.first || '') + ' AND LastName eq ' + (captureRecord.last || ''));
            }

            //if (contact.phone && contact.last) {
            //    where = 'LastName=\'' + encode(contact.last) + '\'+AND+Phone=\'' + encode(contact.phone) + '\'';
            //    if (recordType === 'Lead')
            //    { where += '+AND+IsConverted=False'; }
            //    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
            //}

            //if (contact.email2) {
            //    where = 'Email=\'' + contact.email2 + '\'';
            //    if (recordType === 'Lead')
            //    { where += '+AND+IsConverted=False'; }
            //    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
            //}


        },*/



        findRecord: function (recordType, query, fields, successCallback, failCallback) {

            //var service = this;             
            var urlBody;
            var encodeParam = function (p) {
                return p.replace(/'/g, '%5C%27');
            };

            if (debug) { console.log(debug + 'findRecord->type:', recordType, '->query:', query, '->fields:', fields); }

            if (recordType === 'account') { recordType = 'Account'; }
            if (recordType === 'lead') { recordType = 'Lead'; }
            if (recordType === 'contact') { recordType = 'Contact'; }
            if (recordType === 'campaign') { recordType = 'Campaign'; }

            var where = [];

            if (query) {

                if (query.email)
                { where.push('Email=\'' + encodeParam(query.email) + '\''); }

                if (query.email_endsWith)
                { where.push('Email+LIKE+\'%25' + encodeParam(query.email_endsWith) + '\''); }

                if (query.last)
                { where.push('LastName=\'' + encodeParam(query.last) + '\''); }

                if (query.first)
                { where.push('FirstName=\'' + encodeParam(query.first) + '\''); }

                if (recordType === 'Account') {
                    if (query.company)
                    { where.push('Name+LIKE+\'%25' + encodeParam(query.company) + '%25\''); }
                }

                if (recordType === 'Campaign') {
                    if (query.campaign)
                    { where.push('Name+LIKE+\'%25' + encodeParam(query.campaign) + '%25\''); }
                }

            }
            var whereStr = where.join('+AND+');
            if (whereStr) { whereStr = '+WHERE+' + whereStr; } else { whereStr = '+'; }
            console.log(whereStr);

            var fieldsStr = '*';
            var f;

            if (recordType === 'Account') {
                urlBody = 'companies';
                f = [];

                f.push('ID');

                if (fields.indexOf('company') > -1) { f.push('Name'); }
                if (fields.indexOf('website') > -1) { f.push('Website'); }
                if (fields.indexOf('_createdDate') > -1) { f.push('CreatedDate'); }

                f.push('BillingCity');
                f.push('BillingState');

                fieldsStr = f.join(',');
            }

            if (recordType === 'Contact') {
                urlBody = 'candidates';
                f = [];

                f.push('ID');

                if (fields.indexOf('first') > -1) { f.push('FirstName'); }
                if (fields.indexOf('last') > -1) { f.push('LastName'); }
                if (fields.indexOf('email') > -1) { f.push('Email'); }
                //if (fields.indexOf('middle') > -1) { f.push('MiddleName '); }

                fieldsStr = f.join(',');
            }

            if (recordType === 'Lead') {
                f = [];

                f.push('ID');

                if (fields.indexOf('first') > -1) { f.push('FirstName'); }
                if (fields.indexOf('last') > -1) { f.push('LastName'); }
                if (fields.indexOf('email') > -1) { f.push('Email'); }
                //if (fields.indexOf('middle') > -1) { f.push('MiddleName '); }

                fieldsStr = f.join(',');
            }

            if (recordType === 'Campaign') {

                f = [];

                f.push('ID');
                f.push('Name');

                fieldsStr = f.join(',');
            }

            var headers = { 'Content-type': 'application/json', 'Authorization': 'BEARER ' + store.authId, 'Accept': 'application/json' };
            var config = {
                method: 'GET',
                url: buildUrl(defaultUrl, urlBody),
                headers: headers
            };
            if (debug) { console.log(debug + 'findRecord->config:', config); }

            var allRecords = [];

            var errorHandler = function (response, status) {

                if (debug) { console.log(debug + 'findRecord->failResponse', response); }
                var msg = '';
                if (response && response.length > 0) {

                    if (response[0].errorCode === 'INVALID_SESSION_ID') {
                        console.log(service);
                        service.logout();
                        failCallback('Session expired. Please log in.');
                    }

                    var i = 0;
                    while (i < response.length) {
                        if (response[i].message)
                        { msg += response[i].message + ' '; }
                        i++;
                    }
                }
                try { failCallback('Cannot find PCRecruiter record: (' + status + ') ' + (msg || response)); } catch (e) { }

            };

            var successHandler = function (response) {

                if (debug) { console.log(debug + 'findRecord->successResponse', response); }

                allRecords = allRecords.concat(response.Results);

                /*if (!response.done && response.nextRecordsUrl) {
                    config.url = store.url + response.nextRecordsUrl;
                    $http(config).success(successHandler).error(errorHandler);
                }
                else { try { successCallback(allRecords); } catch (e) { } }
                */
                try { successCallback(allRecords); } catch (e) { }
            };

            $http(config).success(successHandler).error(errorHandler);

        },

        /**
        * @function retrieveRecord
        * @description Returns single recor.
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        * @param {string} recordId - Record ID 
        * @param {recordType} recordType - Record type
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - Pass the native record as a parameter
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback - Return error message
        */
        retrieveRecord: function (recordId, recordType, successCallback, failCallback) {

            if (recordType.toLowerCase() === 'lead') { recordType = 'Leads'; }
            if (recordType.toLowerCase() === 'contact') { recordType = 'Contacts'; }

            var fields = 'id,firstName,lastName,email,website,title,company,mainPhone,phone,address,city,state,postalCode,country,linkedInProfileURL,facebookProfileURL,twitterProfileURL';

            var buildRequest2 = function (method, id, successCallback, failCallback) {
                console.log('Marketo Lead Id --> ' + id);
                if (debug) { console.log(debug + buildUrl(store.marketoId, defaultUrl, '/rest/v1/lead/' + id + '.json?fields=' + fields)); }
                return {
                    type: 'GET',
                    url: buildUrl(store.marketoId, defaultUrl, '/rest/v1/lead/' + id + '.json?fields=' + fields),
                    contentType: 'application/json',
                    crossDomain: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'Bearer ' + store.authToken);
                    },
                    success: function (successResponse, textStatus, xhr) {
                        successCallback(successResponse, textStatus, xhr);
                    },
                    error: function (errorResponse) {
                        var response = handleErrorMessageText(errorResponse);
                        failCallback(response, errorResponse.status || 500);
                    }
                };
            };

            var successCallback2 = function (successResponse, textStatus, xhr) {

                if (debug) { console.log(debug + 'response', successResponse); }

                try { successCallback(successResponse); } catch (e) { }
            };

            var request = buildRequest2(recordType, recordId, successCallback2, failCallback);

            jQuery.ajax(request);
        },


        /*
        * Returns JSON with all Team Pipeline Clients. Function is supposed to help obtain value for OWNER_ID field.
        * E.g.: {
        *   "Stefan Smihla (stefan.smihla@pipelinersales)": 12345,
        *   "Example User (example@user.com)": 56789
        * }
        */
        getClients: function (successCallback, failCallback) {

            if (debug) { console.log(debug + 'getClients'); }

            var successFunc = function (successResponse) {
                var clients = {};
                for (var i in successResponse) {
                    var item = successResponse[i];
                    var firstname = item.FIRSTNAME || '';
                    var surname = item.LASTNAME || '';
                    var fullname = firstname + ' ' + surname + ' (' + item.EMAIL + ')';
                    clients[fullname] = item.ID;
                }
                //successCallback(JSON.stringify(clients));
                successCallback(clients);
            };

            service.getEntities('Clients', successFunc, failCallback);
        },

        /* Sets Sales Unit ID. This value will be needed fpr required SALES_UNIT_ID. */
        setSalesUnit: function (salesUnit) {
            store.salesUnit = salesUnit;
        },

        getEntities: function (nativeRecordType, successCallback, failCallback) {
            try {
                failCallback('Not implemented');
            } catch (e) {

            } 
            //if (debug) { console.log(debug + 'getEntities', nativeRecordType); }

            //var request = buildRequest(nativeRecordType, successCallback, failCallback);
            //request.success = successCallback;
            //jQuery.ajax(request);
        },

        /**
        * @function validateRecord
        * @description Validates if record can be exported. Returns list of errors.
        * @memberOf captureApp.webServices.exportTargetVer1.marketo
        * @param {recordType} recordType - Record type
        * @param {captureContact} captureRecord - Source Capture Contact. 
        */
        validateRecord: function (recordType, captureRecord) {

            var errors = [];

            if (!captureRecord) {
                errors.push('Record does not exist');
            } else {
                if (!captureRecord.email) {
                    errors.push('Email is required');
                }
            }

            return errors;
        }

    };

    return service;
}]);
/**
 * @class captureApp.webServices.dynamicsCrm
 * @memberOf captureApp.webServices
 * @description This is Microsoft Dynamics CRM AngularJS service.
 */

'use strict';

/* global angular: false */

angular.module('webServices')
.factory('dynamicsCrm', ['$http', '$q', function ($http, $q) {
    var debug = true;

    var store = {};

    var mapField = function (source, sourceKey, target, targetKey) {
        target[targetKey] = source[sourceKey];
    };
    var mapFromField = function (target, targetKey, source, sourceKey) {
        mapField(source, sourceKey, target, targetKey);
    };

    var service = {

        /**
         * @function getName
         * @description Return name of export target.
         * @memberOf captureApp.webServices.dynamicsCrm
         */
        getName: function () {
            return 'Microsoft Dynamics CRM';
        },


        /**
         * @function init
         * @description Initializes store object.
         * @memberOf captureApp.webServices.dynamicsCrm
         * @param {object} o - List of target-specific settings.
         */
        init: function (o) {
            store.defaultUrl = o.url;
            if (store.defaultUrl && store.defaultUrl[store.defaultUrl.length - 1] !== '/') {
                store.defaultUrl += '/';
            }
        },


        /**
        * @function login
        * @description Logs user in. Either silently (if possible) or interactively.
        * @memberOf captureApp.webServices.dynamicsCrm
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - This callback informs that user was logged in successfully. 
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback - This callback informs that user cannot log in.
        */
        login: function (successCallback, failCallback, silent) {

            if (debug) {
                console.log('Logging into Dynamics CRM...', store.url);
            }

            if (store.url) {
                try { successCallback(); } catch (e) { }
            } else {

                if (silent) {
                    try { failCallback(); } catch (e) { }
                } else {
                    chrome.tabs.create({ url: store.url || store.defaultUrl || 'http://www.microsoft.com/en-us/dynamics/crm-login.aspx' }, function () { });
                }
            }
        },


        /**
         * @function logout
         * @description Logs user out. Cleans up store variable.
         * @memberOf captureApp.webServices.dynamicsCrm
         */
        logout: function () {
            store = {};
            if (debug) { console.log(debug + 'Logged out...'); }
        },


        /**
         * @function isLoggedIn
         * @description Checks if user is logged in.
         * @memberOf captureApp.webServices.dynamicsCrm
         * @param {captureApp.webServices.exportTargetVer1~isLoggedInSuccessCallback} successCallback - This callback informs that user is currently logged in.
         * @param {captureApp.webServices.exportTargetVer1~isLoggedInFailCallback} failCallback - This callback informs that user is not currently logged in.
         */
        isLoggedIn: function (successCallback, failCallback) {

            if (store.url) {
                if (debug) { console.log('store.url found', store.url); }
                try { successCallback(); } catch (e) { }
                return;
            }

            var checkUrl = function (url) {
                var found = false;
                if (url) {
                    if (store.defaultUrl) {
                        found = url.indexOf(store.defaultUrl) > -1;
                        if (found) {
                            store.url = store.defaultUrl;
                            console.log('STORE URL SET TO' + store.url);
                        }
                    }
                    else {
                        found = url.indexOf('https://') === 0 && url.indexOf('dynamics.com/') > 0;
                        if (found) {
                            store.url = url.substring(0, url.indexOf('dynamics.com/') + 13);
                            console.log('STORE URL SET TO' + store.url);
                        }
                    }
                }
                //console.log('tab.url', angular.copy(url), found, angular.copy(store.url));
                return found;
            };

            if (debug) { console.log('Looking for Dynamics CRM session...'); }
            var checkTabs = function (tabs) {
                if (!tabs || tabs.length === 0) {
                    try { failCallback(); } catch (e) { }
                    return;
                }

                var tab = tabs.pop();


                if (checkUrl(tab.url)) {
                    if (debug) { console.log('dynamics tab found', tab.url); }
                    try { successCallback(); } catch (e) { }
                    return;
                } else {
                    checkTabs(tabs);
                }
            };

            chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, checkTabs);
        },

        //asyncIsLoggedIn: function () {
        //    var deferred = $q.defer();
        //    service.isLoggedIn(
        //        function () { deferred.resolve(true); },
        //        function (msg) { deferred.reject(msg); }
        //    );
        //    return deferred.promise;
        //},

        /**
         * @function getDefinition
         * @description Maps CRM record to multimerge candidate
         * @memberOf captureApp.webServices.dynamicsCrm
         * @param {captureApp.webServices.exportTargetVer1~getDeninitionSuccessCallback} successCallback
         * @param {captureApp.webServices.exportTargetVer1~failureCallback} failCallback
         */
        getDefinition: function (entityType, successCallback, failureCallback) {
            var def = {};
            entityType = entityType.toLowerCase();
            if (entityType === 'lead') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description',
                            'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { id: 'FirstName', display: 'First Name', group: 'G1' },
                            'LastName': { id: 'LastName', display: 'Last Name', group: 'G1' },
                            'Title': { id: 'JobTitle', display: 'Job Title', group: 'G1' },
                            'Company': { id: 'CompanyName', display: 'Company', group: 'G1' },
                            'Email': { id: 'EMailAddress1', display: 'Email', group: 'G1' },
                            'Phone': { id: 'Telephone1', display: 'Phone', group: 'G1' },
                            'MobilePhone': { id: 'Telephone2', display: 'Phone 2', group: 'G1' },
                            'Website': { id: 'WebSiteUrl', display: 'Website', group: 'G1' },
                            'Description': { id: 'Description', display: 'Description', group: 'G1' },

                            'Street': { id: 'Address1_Line1', display: 'Address1_Line1', group: 'G2' },
                            'City': { id: 'Address1_City', display: 'City', group: 'G2' },
                            'State': { id: 'Address1_StateOrProvince', display: 'State/Province', group: 'G2' },
                            'PostalCode': { id: 'Address1_PostalCode', display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { id: 'Address1_Country', display: 'Country', group: 'G2' },
                        }
                    }
                };
            } else if (entityType === 'contact') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { id: 'G1', display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'MobilePhone', 'Description'] },
                            'G2': { id: 'G2', display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'MobilePhone', 'Description',
                            'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { id: 'FirstName', display: 'First Name', group: 'G1' },
                            'LastName': { id: 'LastName', display: 'Last Name', group: 'G1' },
                            'Title': { id: 'JobTitle', display: 'Job Title', group: 'G1' },
                            'Email': { id: 'EMailAddress1', display: 'Email', group: 'G1' },
                            'Phone': { id: 'Telephone1', display: 'Phone', group: 'G1' },
                            'MobilePhone': { id: 'Telephone2', display: 'Phone 2', group: 'G1' },
                            //'Website': { id: 'WebSiteUrl', display: 'Website', group: 'G1' },
                            'Description': { id: 'Description', display: 'Description', group: 'G1' },

                            'Street': { id: 'Address1_Line1', display: 'Street', group: 'G2' },
                            'City': { id: 'Address1_City', display: 'City', group: 'G2' },
                            'State': { id: 'Address1_StateOrProvince', display: 'State/Province', group: 'G2' },
                            'PostalCode': { id: 'Address1_PostalCode', display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { id: 'Address1_Country', display: 'Country', group: 'G2' }
                        }
                    }
                };
            } else {
                failureCallback('Invalid record type');
            }
            successCallback(def);
        },

        //  From CRM lead to app contact
        fromLead: function (crmObject) {
            var contact = {};
            mapFromField(contact, 'first', crmObject, 'FirstName');
            //mapFromField(contact, 'middle', crmObject, 'MiddleName');
            mapFromField(contact, 'last', crmObject, 'LastName');
            mapFromField(contact, 'jobtitle', crmObject, 'JobTitle');
            mapFromField(contact, 'company', crmObject, 'CompanyName');
            mapFromField(contact, 'email', crmObject, 'EMailAddress1');
            mapFromField(contact, 'phone', crmObject, 'Telephone1');
            mapFromField(contact, 'phone2', crmObject, 'Telephone2');
            mapFromField(contact, 'website', crmObject, 'WebSiteUrl');
            mapFromField(contact, 'bio', crmObject, 'Description');
            mapFromField(contact, 'address1', crmObject, 'Address1_Line1');
            mapFromField(contact, 'city', crmObject, 'Address1_City');
            mapFromField(contact, 'state', crmObject, 'Address1_StateOrProvince');
            mapFromField(contact, 'zip', crmObject, 'Address1_PostalCode');
            mapFromField(contact, 'country', crmObject, 'Address1_Country');
            contact._link = store.url + 'main.aspx?etn=lead&id=' + String(crmObject.LeadId) + '&pagetype=entityrecord';
            contact._type = 'Lead';
            contact._id = crmObject.LeadId;
            return contact;
        },
        //  From app contact to CRM lead
        toLead: function (contact) {
            var crmObject = {};
            mapField(contact, 'first', crmObject, 'FirstName');
            //mapField(contact, 'middle', crmObject, 'MiddleName');
            mapField(contact, 'last', crmObject, 'LastName');
            mapField(contact, 'jobtitle', crmObject, 'JobTitle');
            mapField(contact, 'company', crmObject, 'CompanyName');
            mapField(contact, 'email', crmObject, 'EMailAddress1');
            mapField(contact, 'phone', crmObject, 'Telephone1');
            mapField(contact, 'phone2', crmObject, 'Telephone2');
            mapField(contact, 'website', crmObject, 'WebSiteUrl');
            mapField(contact, 'bio', crmObject, 'Description');
            mapField(contact, 'address1', crmObject, 'Address1_Line1');
            mapField(contact, 'city', crmObject, 'Address1_City');
            mapField(contact, 'state', crmObject, 'Address1_StateOrProvince');
            mapField(contact, 'zip', crmObject, 'Address1_PostalCode');
            mapField(contact, 'country', crmObject, 'Address1_Country');
            return crmObject;
        },
        //  From CRM contact to app contact
        fromContact: function (crmObject) {
            var contact = {};
            mapFromField(contact, 'first', crmObject, 'FirstName');
            mapFromField(contact, 'last', crmObject, 'LastName');
            mapFromField(contact, 'jobtitle', crmObject, 'JobTitle');
            mapFromField(contact, 'email', crmObject, 'EMailAddress1');
            mapFromField(contact, 'phone', crmObject, 'Telephone1');
            mapFromField(contact, 'phone2', crmObject, 'Telephone2');
            mapFromField(contact, 'bio', crmObject, 'Description');
            mapFromField(contact, 'address1', crmObject, 'Address1_Line1');
            mapFromField(contact, 'city', crmObject, 'Address1_City');
            mapFromField(contact, 'state', crmObject, 'Address1_StateOrProvince');
            mapFromField(contact, 'zip', crmObject, 'Address1_PostalCode');
            mapFromField(contact, 'country', crmObject, 'Address1_Country');
            contact._link = store.url + 'main.aspx?etn=contact&id=' + String(crmObject.ContactId) + '&pagetype=entityrecord';
            contact._type = 'Contact';
            contact._id = crmObject.ContactId;
            return contact;
        },
        //  from app contact to CRM contact
        toContact: function (contact) {
            var crmObject = {};
            mapField(contact, 'first', crmObject, 'FirstName');

            mapField(contact, 'last', crmObject, 'LastName');
            mapField(contact, 'jobtitle', crmObject, 'JobTitle');
            mapField(contact, 'email', crmObject, 'EMailAddress1');
            mapField(contact, 'phone', crmObject, 'Telephone1');
            mapField(contact, 'phone2', crmObject, 'Telephone2');
            mapField(contact, 'bio', crmObject, 'Description');
            mapField(contact, 'address1', crmObject, 'Address1_Line1');
            mapField(contact, 'city', crmObject, 'Address1_City');
            mapField(contact, 'state', crmObject, 'Address1_StateOrProvince');
            mapField(contact, 'zip', crmObject, 'Address1_PostalCode');
            mapField(contact, 'country', crmObject, 'Address1_Country');
            return crmObject;
        },
        fromAccount: function (crmObject) {
            var contact = {};
            //mapFromField(contact, 'first', crmObject, 'FirstName');
            //mapFromField(contact, 'last', crmObject, 'LastName');
            //mapFromField(contact, 'jobtitle', crmObject, 'JobTitle');
            mapFromField(contact, 'company', crmObject, 'Name');
            mapFromField(contact, 'email', crmObject, 'EMailAddress1');
            mapFromField(contact, 'phone', crmObject, 'Telephone1');
            mapFromField(contact, 'phone2', crmObject, 'Telephone2');
            mapFromField(contact, 'website', crmObject, 'WebSiteUrl');
            mapFromField(contact, 'bio', crmObject, 'Description');
            mapFromField(contact, 'address1', crmObject, 'Address1_Line1');
            mapFromField(contact, 'city', crmObject, 'Address1_City');
            mapFromField(contact, 'state', crmObject, 'Address1_StateOrProvince');
            mapFromField(contact, 'zip', crmObject, 'Address1_PostalCode');
            mapFromField(contact, 'country', crmObject, 'Address1_Country');
            contact._link = store.url + 'main.aspx?etn=account&id=' + String(crmObject.AccountId) + '&pagetype=entityrecord';
            contact._type = 'Account';
            contact._id = crmObject.AccountId;
            return contact;
        },
        //  From app contact to CRM object
        toNativeRecord: function (contact, entityType) {
            entityType = entityType.toLowerCase();
            if (entityType === 'contact') { return this.toContact(contact); }
            if (entityType === 'lead') { return this.toLead(contact); }
        },
        //  From CRM object to app contact
        fromNativeRecord: function (crmObject, entityType) {
            entityType = entityType.toLowerCase();
            if (entityType === 'contact') { return this.fromContact(crmObject); }
            if (entityType === 'lead') { return this.fromLead(crmObject); }
            if (entityType === 'account') { return this.fromAccount(crmObject); }
        },

        //  From CRM object to lookup object (each object is defined as {label: '', link: ''})
        toLookupObject: function (crmObject, entityType) {
            entityType = entityType.toLowerCase();
            var lookupObject = { label: '', link: '' };
            var appObject = null;
            if (entityType === 'contact') { appObject = this.fromContact(crmObject); }
            if (entityType === 'lead') { appObject = this.fromLead(crmObject); }
            if (entityType === 'account') {
                appObject = this.fromAccount(crmObject);
                var cityState = '';
                if (appObject.city) { cityState = appObject.city; }
                if (appObject.state) {
                    if (cityState) { cityState = cityState + ', ' + appObject.state; }
                    else { cityState = appObject.state; }
                }
                if (cityState) { cityState = ' (' + cityState + ')'; }
                lookupObject.label = (appObject.company || '(no name)') + cityState;
                lookupObject.link = appObject._link;
                lookupObject.id = appObject._id;
            }
            if (entityType === 'systemuser') {
                lookupObject.label = crmObject.FullName;
                lookupObject.link = crmObject.__metadata.uri;
                lookupObject.id = crmObject.SystemUserId;
            }
            return lookupObject;
        },


        /**
       * @function getRequiredLookups
       * @description Returns an array of lookups required prior to saving a record .
       * @memberOf captureApp.webServices.dynamicsCrm
       * @param {string} entityType - 'lead', 'contact' or 'account'. 
       * @return {captureApp.webServices.exportTargetVer1~lookup[]}
       */
        getRequiredLookups: function (entityType) {
            entityType = entityType.toLowerCase();
            if (entityType === 'contact') {
                return [{ crmProperty: 'ParentCustomerId', appProperty: 'company', message: 'Select parent account', type: 'Account', required: false, allowNew: false }
                    //,
                    //    { crmProperty: 'OwnerId', appProperty: 'full', message: 'Select account owner', type: 'SystemUser', required: false, allowNew: false }
                ];
            }
            if (entityType === 'lead') { return []; }
            if (entityType === 'account') { return []; }

            return [];
        },

        //asyncGetDefinition: function (entityType) {
        //    var deferred = $q.defer();
        //    service.getDefinition(entityType,
        //        function (def) { deferred.resolve(def); },
        //        function (msg) { deferred.reject(msg); }
        //    );
        //    return deferred.promise;
        //},

        //-- CRUD --//
        //  Create a record with data provided
        //      successCallback: function(recordId)

        /**
       * @function createRecord
       * @description Creates record.
       * @memberOf captureApp.webServices.dynamicsCrm
       * @param {recordType} recordType - Destination Record Type
       * @param {captureContact} captureRecord - Source Capture Record.
       * @param {object} createOptions - Options (For future use) 
       * @param {captureApp.webServices.exportTargetVer1~createRecordSuccessCallback} successCallback
       * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback
       */
        createRecord: function (recordType, captureRecord, createOptions, successCallback, failCallback) {
            var self = this;
            var record = {};
            recordType = recordType.toLowerCase();
            if (recordType === 'lead') {
                recordType = 'Lead';
                record = this.toLead(captureRecord);
            }
            if (recordType === 'contact') {
                recordType = 'Contact';
                record = this.toContact(captureRecord);
            }
            if (recordType === 'account') {
                recordType = 'Account';
                record = this.toAccount(captureRecord);
            }
            var headers = { 'Content-type': 'application/json; charset=utf-8', 'Accept': 'application/json' };
            var url = store.url + 'XRMServices/2011/OrganizationData.svc/' + recordType + 'Set';


            var config = { method: 'POST', url: url, data: record, headers: headers };
            console.log('dynamics.createRecord...', config, store);
            $http(config).success(function (response) {
                if (debug) { console.log('dynamics.createRecord:', response); }
                var newRecord = { _link: null };
                if (recordType === 'Lead') { newRecord = self.fromLead(response.d); }
                if (recordType === 'Contact') { newRecord = self.fromContact(response.d); }
                try { successCallback(newRecord._link, newRecord._id); } catch (e) { }
            }).error(function (response, status) {
                if (debug) { console.log('dynamics.createRecord:', response); }
                try { failCallback('Cannot create Dynamics record: (' + status + ') ' + response); } catch (e) { }
            });
        },

        //  Update an existing record with data
        //      successCallback: function(recordId)

        /**
      * @function updateRecord
      * @description Updates record.
      * @memberOf captureApp.webServices.dynamicsCrm
      * @param {string} recordId - Record ID. 
      * @param {string} recordType - Record Type. 
      * @param {captureApp.webServices.exportTargetVer1~createRecordParameters} data - Data. 
      * @param {captureApp.webServices.exportTargetVer1~updateRecordSuccessCallback} successCallback 
      * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback
      */
        updateRecord: function (recordId, recordType, data, successCallback, failCallback) {
            if (recordType === 'lead') { recordType = 'Lead'; }
            if (recordType === 'contact') { recordType = 'Contact'; }
            var headers = { 'Content-type': 'application/json; charset=utf-8', 'Accept': 'application/json', 'X-HTTP-Method': 'MERGE' };
            var url = store.url + 'XRMServices/2011/OrganizationData.svc/' + recordType + 'Set' + '(guid\'' + recordId + '\')';
            var config = { method: 'POST', url: url, data: data, headers: headers };
            console.log('dynamics.updateRecord...', config);
            $http(config).success(function (response) {
                if (debug) { console.log('dynamics.updateRecord:', response); }
                try {
                    var id = null;
                    if (response && response.d) {
                        if (recordType === 'Lead') { id = response.d.LeadId; }
                        if (recordType === 'Contact') { id = response.d.ContactId; }
                        if (recordType === 'Account') { id = response.d.AccountId; }
                    }
                    successCallback(id);
                } catch (e) { }
            }).error(function (response, status) {
                if (debug) { console.log('dynamics.updateRecord:', response); }
                try { failCallback('Cannot update Dynamics record: (' + status + ') ' + response); } catch (e) { }
            });
        },

        //  Retrieve record from service
        //      successCallback: function(recordId, data)
        retrieveRecord: function (recordId, recordType, successCallback, failCallback) {
            var self = this;

            if (recordType === 'lead') { recordType = 'Lead'; }
            if (recordType === 'contact') { recordType = 'Contact'; }
            if (recordType === 'account') { recordType = 'Account'; }

            var headers = { 'Content-type': 'application/json; charset=utf-8', 'Accept': 'application/json' };
            var url = store.url + 'XRMServices/2011/OrganizationData.svc/' + recordType + 'Set(guid\'' + recordId + '\')';
            var config = { method: 'GET', url: url, headers: headers };
            console.log('dynamics.retrieveRecord...', config, store);
            $http(config).success(function (response) {
                if (debug) { console.log('dynamics.retrieveRecord:', response); }

                if (!response.d)
                { try { failCallback(); } catch (e) { } }

                try { successCallback(response.d); } catch (e) { }
            }).error(function (response, status) {
                if (debug) { console.log('dynamics.retrieveRecord:', response); }
                try { failCallback('Cannot retrieve Dynamics record: (' + status + ') ' + response); } catch (e) { } //.error.message.value
            });
        },

        //asyncRetrieveRecord: function (recordId, recordType) {
        //    var deferred = $q.defer();
        //    service.retrieveRecord(recordId, recordType,
        //        function (response) { deferred.resolve(response); },
        //        function (msg) { deferred.reject(msg); }
        //    );
        //    return deferred.promise;
        //},

        //  Delete record from service
        //      successCallback: function(recordId)
        //deleteRecord: function (recordId, successCallback, failCallback) {
        //},
        //-- /CRUD --//


        //-- Search --//
        //  Find records using a query: { first:'', last:'', email:''} object
        //      recordType: string
        //      query: object
        //      fields: array of app contact property names
        //      successCallback: function(arrayOfNativeRecords)
        findRecord: function (recordType, query, fields, successCallback, failCallback) {

            if (recordType === 'account') { recordType = 'Account'; }
            if (recordType === 'lead') { recordType = 'Lead'; }
            if (recordType === 'contact') { recordType = 'Contact'; }

            //try { failCallback('Not implemented'); } catch (e) { }

            var where = [];

            if (query) {

                if (recordType === 'Account') {

                    if (query.company)
                    { where.push('substringof(\'' + encodeURIComponent(query.company.replace(/'/g, '\'\'')) + '\',Name)'); }

                    if (query.email)
                    { where.push('substringof(\'' + encodeURIComponent(query.email.replace(/'/g, '\'\'')) + '\',EMailAddress1)'); }

                }
                else {

                    if (query.email)
                    { where.push('EMailAddress1=\'' + query.email + '\''); }

                    if (query.last)
                    { where.push('LastName=\'' + query.last + '\''); }

                    if (query.first)
                    { where.push('FirstName=\'' + query.first + '\''); }
                }

            }

            var whereStr = '';

            if (where.length > 0)
            { whereStr = '$filter=' + where.join(' and '); }

            console.log(whereStr);

            var fieldStr = '';

            if (recordType === 'Account')
            { fieldStr = '$select=Name,AccountId,Address1_StateOrProvince,Address1_City'; }
            else if (recordType === 'SystemUser')
            { fieldStr = '$select=FullName,SystemUserId'; }

            var headers = { 'Content-type': 'application/json; charset=utf-8', 'Accept': 'application/json' };
            var url = store.url + 'XRMServices/2011/OrganizationData.svc/' + recordType + 'Set/' + ((whereStr || fieldStr) ? '?' : '') + whereStr + (whereStr ? '&' : '') + fieldStr;
            var config = { method: 'GET', url: url, headers: headers };
            console.log('dynamics.retrieveRecord...', config, store);
            $http(config).success(function (response) {
                if (debug) { console.log('dynamics.retrieveRecord:', response); }

                if (!response.d)
                { try { failCallback(); } catch (e) { } }

                try { successCallback(response.d.results); } catch (e) { }
            }).error(function (response, status) {
                if (debug) { console.log('dynamics.retrieveRecord:', response); }
                try { failCallback('Cannot retrieve Dynamics record: (' + status + ') ' + response); } catch (e) { } //.error.message.value
            });

        },
        //-- /Search --//

        //-- Define --//
        //  Get a list of all available entities (lead, contact, account, etc)
        //      successCallback: function(entityList)
        listEntities: function (successCallback, failCallback) {
        },

        //  Get the definition for an entity (field names of a lead or contact)
        //      successCallback: function(entityDefinition)
        defineEntity: function (entity, successCallback, failCallback) {
        },
        //-- /Define --//



        /**
       * @function findDuplicates
       * @description Returns an array of duplicate records of given type.
       * 
       * @memberOf captureApp.webServices.dynamicsCrm
       * @param {string} recordType - 'lead', 'contact' or 'account'. 
       * @param {captureContact} contact - Capture contact. 
       * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - Pass the resulting array
       * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback  
       * @return {object[]}
       */
        findDuplicates: function (recordType, contact, successCallback, failCallback) {

            var self = this;

            if (recordType === 'lead') { recordType = 'Lead'; }
            if (recordType === 'contact') { recordType = 'Contact'; }

            var dups = [];

            var reponseHandle = null;
            var returnResponse = function () {
                try {
                    if (debug) { console.log(debug + 'dups (final)', angular.copy(dups)); }

                    successCallback({ duplicates: dups });
                } catch (e) { }
            };

            var findRecords = function (recordType, where) {

                var headers = { 'Content-type': 'application/json; charset=utf-8', 'Accept': 'application/json' };
                var url = store.url + 'XRMServices/2011/OrganizationData.svc/' + recordType + 'Set?$filter=' + where;
                var config = { method: 'GET', url: url, headers: headers };
                console.log('dynamics.findDuplicates...', config, store);
                $http(config).success(function (response) {
                    if (debug) { console.log('dynamics.findDuplicates:', response); }

                    if (!response.d.results) { try { failCallback(); } catch (e) { } }


                    for (var i = 0; i < response.d.results.length; i++) {
                        var dup = {};
                        if (recordType === 'Lead') { dup = self.fromLead(response.d.results[i]); }
                        else if (recordType === 'Contact') { dup = self.fromContact(response.d.results[i]); }
                        dups.push(dup);
                    }

                    //try { successCallback({ duplicates: dups }); } catch (e) { }

                    if (reponseHandle) {
                        window.clearTimeout(reponseHandle);
                    }
                    reponseHandle = window.setTimeout(returnResponse, 2000);

                }).error(function (response, status) {
                    if (debug) { console.log('dynamics.findDuplicates:', response); }
                    try { failCallback('Cannot find duplicate Dynamics record: (' + status + ') ' + response.error.message.value); } catch (e) { }
                });

            };

            var where = '';

            if (contact.email) {
                where = 'EMailAddress1 eq \'' + encodeURIComponent(contact.email) + '\'';
                if (contact.email2) {
                    where = '(' + where + ')+or+(EMailAddress1 eq \'' + encodeURIComponent(contact.email2) + '\')';
                }
                findRecords(recordType, where);
            }


            if (contact.last) {
                where = '(LastName eq \'' + encodeURIComponent(contact.last) + '\')+and+(FirstName eq \'' + encodeURIComponent(contact.first) + '\')';
                findRecords(recordType, where);
            }


        }
    };
    return service;
}]);
/**
 * @class captureApp.webServices.jobscience
 * @memberOf captureApp.webServices.exportTargetVer2
 * @description This is Job Science AngularJS service.
 */

'use strict';

/* global angular: false */
/* global jQuery: false */
/* global geographyData: false */
/* global backgroundUtility: false */


angular.module('webServices')//exportService 
//angular.module('exportService')
//.factory('jobscience', ['$http', '$q', '$timeout', 'endpoints', 'dialogs', function ($http, $q, $timeout, endpoints, dialogs) {
.factory('jobscience', ['$http', '$q', '$timeout', 'dialogs', function ($http, $q, $timeout, dialogs) {
    var debug = 'jobscience.js->';
    const consolePrefix = 'Job Science > ';
    var store = { cache: {} };
    var invalidSessions = {};
    var enteredValues = {};

    var mapField = function (source, sourceKey, target, targetKey) {
        var sourceKeyParts = sourceKey.split('.');
        if (sourceKeyParts.length === 2) {
            try {
                target[targetKey] = source[sourceKeyParts[0]][sourceKeyParts[1]];
            } catch (e) {
                target[targetKey] = null;
            }
        }
        else { target[targetKey] = source[sourceKey]; }
    };
    var mapFromField = function (target, targetKey, source, sourceKey) {
        mapField(source, sourceKey, target, targetKey);
    };
    var initStore = function (session, url) {
        const functionName = 'Init Store';
        try {
            store = { cache: {} };
            if (session && url) {
                store.id = session;
                store.url = url;
                store.ts = new Date();
            }
            if (debug) { console.log(consolePrefix + functionName, angular.copy(store)); }
        } catch (e) {
            console.error(functionName, e.message);
        }
    };

    var defaultOnSuccessHandler = function (data, status, headers, config, successCallback, failureCallback) {

        if (!data) {
            var message = 'Job Science API call failed';

            //Read header: Sforce-Limit-Info: api-usage=50035/48000
            var apiUsage = headers('Sforce-Limit-Info');
            if (apiUsage) {
                message += ': ' + apiUsage;
            }

            failureCallback(message);

            return;
        }

        successCallback(data);
    };

    var defaultOnErrorHandler = function (errorResponse, status, failureCallback) {
        const functionName = 'On Error';
        try {
            console.error(consolePrefix + functionName + ' > Status > ', status, ' > Response > ', angular.copy(errorResponse));

            if (errorResponse) {
                if (errorResponse.responseJSON && errorResponse.responseJSON.length > 0 && errorResponse.responseJSON[0].message) {
                    failureCallback(errorResponse.responseJSON[0].message);
                }
                else if (errorResponse.statusText) {
                    failureCallback(errorResponse.statusText);
                }
                else if (errorResponse.length > 0) {

                    var errorCode = errorResponse[0].errorCode;

                    if (errorCode === 'INVALID_SESSION_ID') {
                        service.logout(true);
                        failureCallback('Session expired. Please log in.');
                    }
                }
                else { failureCallback(errorResponse); }
            }
            else { failureCallback('Job Science API Error'); }

        } catch (e) {
            console.error(functionName + ' > On Error > ', e.message);
            failureCallback('Job Science API Exception');
        }

    };

    var checkSession = function () {

        if (!store || typeof store.url === 'undefined') {
            console.error('Session Not initialized > ', angular.copy(store));
            throw { message: 'Session expired. Please log in.' };
        }

    };

    var service = {

        getName: function () {
            return 'Job Science';
        },

        getInterfaceVersion: function () {
            return 2;
        },

        /**
        * @function init
        * @description Initializes store object. Not used for Job Science.
        * @memberOf captureApp.webServices.exportTargetVer1.jobscience
        * @param {object} settings - List of target-specific settings.
        */
        init: function (settings) {
            if (settings) {
                if (settings.Session && settings.Url) {
                    initStore(settings.Session, settings.Url);
                }
            }
        },

        //  Log us in
        login: function (successCallback, failCallback, silent) {
            const functionName = 'Is Logged In';
            try {
                if (debug) { console.log('Logging into jobscience... silent=', silent); }
                //chrome.tabs.create({ url: 'https://na1.salesforce.com/001/o' }, function () { });

                if (debug) { console.log(debug + 'Looking for jobscience session...'); }
                var checkTabs = function (tabs) {
                    if (!tabs || tabs.length === 0) {
                        if (debug) { console.log(debug + 'jobscience tab not found'); }
                        if (silent) {
                            try { failCallback(); } catch (e) { }
                        }
                        else {
                            chrome.tabs.create({ url: 'https://login.salesforce.com' }, function () { });
                            //chrome.tabs.create({ url: 'https://na1.salesforce.com/001/o' }, function () { });
                        }
                        return;
                    }

                    var tab = tabs.pop();
                    //if (tab.url && tab.url.indexOf('https://') === 0 && tab.url.indexOf('salesforce.com/') > 0) {
                    if (tab.url && tab.url.indexOf('https://') === 0 && (tab.url.indexOf('.salesforce.com/') > 0 || tab.url.indexOf('.visual.force.com/') > 0)) {
                        if (debug) { console.log(functionName + ' > Job Science tab found > ', tab.url); }
                        var url;
                        if (tab.url.indexOf('.visual.force.com/') > 0) {
                            url = tab.url.substring(0, tab.url.indexOf('.visual.force.com/'));// + 'visual.force.com'; // no ending "/"
                            var parts = url.split('.');
                            url = 'https://' + parts[parts.length - 1] + '.salesforce.com';
                        }
                        else {
                            url = tab.url.substring(0, tab.url.indexOf('.salesforce.com/') + 15); // no ending "/"
                        }

                        //if (debug) { console.log(debug + 'salesforce tab found, querying for session id', tab.url); }

                        chrome.cookies.getAll({ 'url': tab.url }, function (cookies) {
                            for (var i = 0; i < cookies.length; i++) {
                                try {
                                    var cookie = cookies[i];
                                    if (cookie.name === 'sid' && invalidSessions[cookie.value] !== true) {
                                        var session = cookie.value;
                                        //var url = tab.url.substring(0, tab.url.indexOf('salesforce.com/') + 14);// no ending "/"
                                        initStore(session, url);
                                        if (debug) { console.log(debug + 'store.ts:', store.ts); }
                                        try { successCallback(); } catch (e) { }
                                        return;
                                    }
                                } catch (e) {
                                    console.log('ERROR in cookie', e.message);
                                }
                            }
                            checkTabs(tabs);
                        });

                    } else {
                        checkTabs(tabs);
                    }
                };

                //chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, checkTabs);
                chrome.tabs.query({}, checkTabs);
            } catch (e) {
                console.error(functionName, e.message);
                failCallback(e.message);
            }
        },

        logout: function (expireSession) {
            console.log('logout. expire? ', expireSession);
            if (expireSession && store.id) {
                invalidSessions[store.id] = true;
            }
            initStore();
        },

        //  Get login info
        isLoggedIn: function (successCallback, failCallback) {
            const functionName = 'Is Logged In';
            try {
                if (store.id) {
                    if (debug) { console.log(debug + 'store.ts:', store.ts); }

                    if (store.ts) {
                        try {
                            var daysOld = (new Date().getTime() - store.ts.getTime()) / (1000 * 60 * 60 * 24);
                            if (debug) { console.log(debug + 'daysOld:', daysOld); }
                            if (daysOld < 1) {
                                try { successCallback(); } catch (e) { }
                                return;
                            } else {
                                // force expire
                                initStore();
                            }
                        } catch (e) {
                            console.log('*** ERROR in SF daysOld', e.message);
                        }
                    }

                }
                if (debug) { console.log(debug + 'Looking for jobscience session...'); }
                var checkTabs = function (tabs) {
                    if (!tabs || tabs.length === 0) {
                        if (debug) { console.log(debug + 'jobscience tab not found'); }
                        try { failCallback(); } catch (e) { }
                        return;
                    }

                    var tab = tabs.pop();
                    //if (debug) { console.log(debug + 'tab', tab.url, angular.copy(tabs)); }
                    //if (tab.url && tab.url.indexOf('https://') === 0 && tab.url.indexOf('salesforce.com/') > 0) {

                    //    if (debug) { console.log(debug + 'salesforce tab found, querying for session id', tab.url); }

                    if (tab.url && tab.url.indexOf('https://') === 0 && (tab.url.indexOf('.salesforce.com/') > 0 || tab.url.indexOf('.visual.force.com/') > 0)) {
                        if (debug) { console.log(functionName + ' > Job Science tab found > ', tab.url); }
                        var url;
                        if (tab.url.indexOf('.visual.force.com/') > 0) {
                            url = tab.url.substring(0, tab.url.indexOf('.visual.force.com/'));// + 'visual.force.com'; // no ending "/"
                            var parts = url.split('.');
                            url = 'https://' + parts[parts.length - 1] + '.salesforce.com';
                        }
                        else {
                            url = tab.url.substring(0, tab.url.indexOf('.salesforce.com/') + 15); // no ending "/"
                        }

                        chrome.cookies.getAll({ 'url': tab.url },

                            function (cookies) {
                                //console.log('cookies', cookies);
                                for (var i = 0; i < cookies.length; i++) {
                                    try {
                                        var cookie = cookies[i];
                                        if (cookie.name === 'sid') {
                                            var session = cookie.value;
                                            //var url = tab.url.substring(0, tab.url.indexOf('salesforce.com/') + 14); // no ending "/"
                                            initStore(session, url);
                                            if (debug) { console.log(debug + 'store.ts:', store.ts); }
                                            try { successCallback(); } catch (e) { }
                                            return;
                                        }
                                    } catch (e) {
                                        console.log('ERROR in cookie', e.message);
                                    }
                                }
                                if (debug) { console.log(debug + 'WARNING: Cookie not found'); }
                                checkTabs(tabs);
                            }

                        );

                    } else {
                        checkTabs(tabs);
                    }
                };

                chrome.tabs.query({}, checkTabs);

            } catch (e) {
                console.error(functionName, e.message);
                failCallback(e.message);
            }
        },

        asyncIsLoggedIn: function () {

            console.log('CHECKING IF ASYNC LOGGED IN');

            var deferred = $q.defer();
            service.isLoggedIn(
                function () { deferred.resolve(true); },
                function (msg) { deferred.reject(msg); }
            );
            return deferred.promise;
        },

        getEntities: function (successCallback, failureCallback) {
            const functionName = 'Get Entities';
            try {
                if (debug) { console.log(consolePrefix + functionName); }
                //successCallback([{ name: 'Lead', type: 'lead' }]);

                checkSession();

                //if (typeof store.url === 'undefined') {
                //    console.error(functionName + ' > Not initialized > ', store);
                //    try { failureCallback('Session expired. Please log in.'); } catch (e) { }
                //    return;
                //}

                //// Use cached values
                //if (store.cache.entities) {
                //    var list = angular.copy(store.cache.entities);
                //    console.log(consolePrefix + functionName + ' > Read from cache > ', list);
                //    successCallback(list);
                //    return;
                //}

                var config = {
                    method: 'GET',
                    url: store.url + '/services/data/v34.0/sobjects',
                    headers: { 'Authorization': 'OAuth ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
                };
                if (debug) { console.log(consolePrefix + functionName + ' > Request > ', config); }

                $http(config).success(function (data, status, headers, config) {

                    var onTrueSuccess = function (data) {
                        try {

                            var list = [];
                            angular.forEach(data.sobjects, function (sobject, index) {
                                list.push({ name: sobject.name, label: sobject.label });
                            });

                            // Cache 
                            store.cache.entities = angular.copy(list);

                            successCallback(list);

                        } catch (e) {
                            console.error(functionName + ' > On True Success > ', e.message);
                            failureCallback('Job Science API response is invalid');
                        }
                    };

                    defaultOnSuccessHandler(data, status, headers, config, onTrueSuccess, failureCallback);
                }

                ).error(function (data, status) {
                    defaultOnErrorHandler(data, status, failureCallback);
                });

            } catch (e) {
                console.error(functionName, e.message);
                failureCallback(e.message);
            }

        },

        // successCallback: function(fields)
        // fields: [ {name: '', label: '' } ]
        getFields: function (entityType, successCallback, failureCallback) {
            if (entityType === 'candidate') {
                entityType = 'contact';
            }
            const functionName = 'Get Fields';
            try {
                if (debug) { console.log(consolePrefix + functionName + ' > Type > ', entityType); }

                var config = {
                    method: 'GET',
                    url: store.url + '/services/data/v34.0/sobjects/' + entityType + '/describe',
                    headers: { 'Authorization': 'OAuth ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
                };
                if (debug) { console.log(consolePrefix + functionName + ' > Request > ', config); }

                $http(config).success(function (data, status, headers, config) {

                    var onTrueSuccess = function (data) {
                        try {

                            var list = [];
                            angular.forEach(data.fields, function (field, index) {

                                if (!field.updateable) { return; }

                                var values = [];
                                if (field.picklistValues) {
                                    angular.forEach(field.picklistValues, function (picklistValue) {
                                        values.push({ value: picklistValue.value, label: picklistValue.label });
                                    });
                                }

                                var f = { name: field.name, label: field.label, length: field.length };

                                f.required = !field.nillable && field.updateable;

                                if (values.length > 0) {
                                    f.values = values;
                                }

                                list.push(f);

                            });

                            //store.cache['fields:' + entityType] = angular.copy(list);

                            successCallback(list);

                        } catch (e) {
                            console.error(functionName + ' > On True Success > ', e.message);
                            failureCallback('Job Science API response is invalid');
                        }
                    };

                    defaultOnSuccessHandler(data, status, headers, config, onTrueSuccess, failureCallback);
                }

                ).error(function (data, status) {
                    defaultOnErrorHandler(data, status, failureCallback);
                });

                //jQuery.ajax({
                //    type: 'GET',
                //    url: url,
                //    contentType: 'application/json',
                //    beforeSend: function (xhr) {
                //        xhr.setRequestHeader('Authorization', 'OAuth ' + store.id);
                //        xhr.setRequestHeader('Accept', 'application/json');
                //    },
                //    success: function (successResponse) {

                //        console.log('successResponse=', successResponse);

                //        if (!successResponse) {
                //            console.error('null response!');
                //            failureCallback('Cannot get Job Science object description');
                //            return;
                //        }

                //        var ff = [];
                //        angular.forEach(successResponse.fields, function (field, index) {

                //            //var def = null;
                //            var vv = [];
                //            if (field.picklistValues) {
                //                angular.forEach(field.picklistValues, function (pv, pvi) {
                //                    vv.push({ value: pv.value, label: pv.label });
                //                    //if()
                //                    //default: value.default
                //                });
                //            }

                //            if (field.updateable) {
                //                var f = { name: field.name, label: field.label, length: field.length };

                //                f.required = !field.nillable && field.updateable;

                //                if (vv.length > 0) {
                //                    f.values = vv;
                //                }

                //                ff.push(f);
                //            }
                //        });

                //        successCallback(ff);
                //    },
                //    error: function (errorResponse) {

                //        console.error('errorResponse=', errorResponse);
                //        failureCallback(errorResponse);
                //    }

                //});
            } catch (e) {
                console.error(functionName, e.message);
                failureCallback(e.message);
            }
        },

        // successCallback: function(maps)
        // maps: [ {captureField: { name: '', label: '' }, crmField: { name: '', label: '' } } ]
        getDefaultExportMaps: function (successCallback, failureCallback) {

            console.log('GETTING DEFAULT EXPORT MAPS');

            var defaultCaptureMap = {
                fields: [
                    { captureField: 'first', label: 'First Name', crmField: null },
                    { captureField: 'last', label: 'Last Name', crmField: null },
                    { captureField: 'jobtitle', label: 'Job Title', crmField: null },
                    { captureField: 'company', label: 'Company Name', crmField: null },
                    { captureField: 'email', label: 'Email', crmField: null },
                    { captureField: 'phone', label: 'Phone', crmField: null },
                    { captureField: 'phone2', label: 'Phone 2', crmField: null },
                    { captureField: 'website', label: 'Website', crmField: null },
                    { captureField: 'bio', label: 'Bio', crmField: null },
                    { captureField: 'address1', label: 'Address Line 1', crmField: null },
                    { captureField: 'address2', label: 'Address Line 2', crmField: null },
                    { captureField: 'city', label: 'City', crmField: null },
                    { captureField: 'state', label: 'State', crmField: null },
                    { captureField: 'zip', label: 'Zip Code', crmField: null },
                    { captureField: 'country', label: 'Country', crmField: null },
                ]
            };

            //var contactMap = {
            //    fields: [
            //        { captureField: 'first', label: 'First Name',  crmField: { name: 'FirstName', label: 'First Name' } },
            //        { captureField: 'last', label: 'Last Name', crmField: { name: 'LastName', label: 'Last Name' } },
            //        { captureField: 'jobtitle', label: 'Job Title', crmField: { name: 'Title', label: 'Title' } },
            //        { captureField: 'company', label: 'Company Name', crmField: { name: 'Account.Name', label: 'Account Name' } },
            //        { captureField: 'email', label: 'Email', crmField: { name: 'Email', label: 'Email' } },
            //        { captureField: 'phone', label: 'Phone', crmField: { name: 'Phone', label: 'Phone' } },
            //        { captureField: 'phone2', label: 'Phone 2', crmField: { name: 'MobilePhone', label: 'Mobile Phone' } },
            //        { captureField: 'website', label: 'Website', crmField: null },
            //        { captureField: 'bio', label: 'Bio', crmField: { name: 'Description', label: 'Description' } },
            //        { captureField: 'address1', label: 'Address Line 1', crmField: { name: 'MailingStreet', label: 'Mailing Street' } },
            //        { captureField: 'address2', label: 'Address Line 2', crmField: null },
            //        { captureField: 'city', label: 'City', crmField: { name: 'MailingCity', label: 'Mailing City' } },
            //        { captureField: 'state', label: 'State', crmField: { name: 'MailingState', label: 'Mailing State' } },
            //        { captureField: 'zip', label: 'Zip Code', crmField: { name: 'MailingPostalCode', label: 'Mailing Postal Code' } },
            //        { captureField: 'country', label: 'Country', crmField: { name: 'MailingCountry', label: 'Mailing Country' } },
            //    ]
            //};

            var contactMap = {
                fields: [
                    { target: { name: 'FirstName', label: 'First Name' }, source: { type: 'capture', value: { captureField: 'first', label: 'First Name' } } },
                    { target: { name: 'LastName', label: 'Last Name' }, source: { type: 'capture', value: { captureField: 'last', label: 'Last Name' } } },
                    { target: { name: 'Title', label: 'Title' }, source: { type: 'capture', value: { captureField: 'jobtitle', label: 'Job Title' } } },
                    { target: { name: 'Company', label: 'Company' }, source: { type: 'capture', value: { captureField: 'company', label: 'Company Name' } } },
                    { target: { name: 'Email', label: 'Email' }, source: { type: 'capture', value: { captureField: 'email', label: 'Email' } } },
                    { target: { name: 'Phone', label: 'Phone' }, source: { type: 'capture', value: { captureField: 'phone', label: 'Phone' } } },
                    { target: { name: 'MobilePhone', label: 'Mobile Phone' }, source: { type: 'capture', value: { captureField: 'phone2', label: 'Phone 2' } } },
                    { target: { name: 'Description', label: 'Description' }, source: { type: 'capture', value: { captureField: 'bio', label: 'Bio' } } },
                    { target: { name: 'MailingStreet', label: 'Street' }, source: { type: 'capture', value: { captureField: 'address', label: 'Address Line 1 and 2' } } },
                    { target: { name: 'MailingCity', label: 'City' }, source: { type: 'capture', value: { captureField: 'city', label: 'City' } } },
                    { target: { name: 'MailingStateCode', label: 'State/Province Code' }, source: { type: 'capture', value: { captureField: 'stateCode', label: 'State Code' } } },
                    { target: { name: 'MailingPostalCode', label: 'Postal Code' }, source: { type: 'capture', value: { captureField: 'zip', label: 'Zip Code' } } },
                    { target: { name: 'MailingCountryCode', label: 'Country Code' }, source: { type: 'capture', value: { captureField: 'countryCode', label: 'Country Code' } } },
                    {
                        target: { name: 'AccountId', label: 'Account Name' }, source: {
                            type: 'lookup',
                            value: {
                                appProperty: 'company',
                                message: 'Select Account',
                                type: 'Account',
                                required: false,
                                allowNew: true,
                                resolve: 'createNewAccount'
                            }
                        }
                    },
                ]
            };

            var candidateMap = {
                fields: [
                    { target: { name: 'FirstName', label: 'First Name' }, source: { type: 'capture', value: { captureField: 'first', label: 'First Name' } } },
                    { target: { name: 'LastName', label: 'Last Name' }, source: { type: 'capture', value: { captureField: 'last', label: 'Last Name' } } },
                    { target: { name: 'Title', label: 'Title' }, source: { type: 'capture', value: { captureField: 'jobtitle', label: 'Job Title' } } },
                    { target: { name: 'Company', label: 'Company' }, source: { type: 'capture', value: { captureField: 'company', label: 'Company Name' } } },
                    { target: { name: 'Email', label: 'Email' }, source: { type: 'capture', value: { captureField: 'email', label: 'Email' } } },
                    { target: { name: 'Phone', label: 'Phone' }, source: { type: 'capture', value: { captureField: 'phone', label: 'Phone' } } },
                    { target: { name: 'MobilePhone', label: 'Mobile Phone' }, source: { type: 'capture', value: { captureField: 'phone2', label: 'Phone 2' } } },
                    { target: { name: 'Website', label: 'Website' }, source: { type: 'capture', value: { captureField: 'website', label: 'Website' } } },
                    { target: { name: 'Description', label: 'Description' }, source: { type: 'capture', value: { captureField: 'bio', label: 'Bio' } } },
                    { target: { name: 'Street', label: 'Street' }, source: { type: 'capture', value: { captureField: 'address', label: 'Address Line 1 and 2' } } },
                    { target: { name: 'City', label: 'City' }, source: { type: 'capture', value: { captureField: 'city', label: 'City' } } },
                    { target: { name: 'StateCode', label: 'State/Province Code' }, source: { type: 'capture', value: { captureField: 'stateCode', label: 'State Code' } } },
                    { target: { name: 'PostalCode', label: 'Postal Code' }, source: { type: 'capture', value: { captureField: 'zip', label: 'Zip Code' } } },
                    { target: { name: 'CountryCode', label: 'Country Code' }, source: { type: 'capture', value: { captureField: 'countryCode', label: 'Country Code' } } },


                //return [{
                //    crmProperty: 'Campaign', appProperty: 'campaign', message: 'Select Campaign', type: 'Campaign', required: false, allowNew: false,
                //    resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //        service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    },
                //}, {
                //    crmProperty: 'LeadSource', appProperty: null, message: 'Select Lead Source', type: 'Lead', required: true, allowNew: false,
                //    picklist: true//,
                //    //resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //    //    console.log('resolve called', lookupId, objectId)
                //    //    //service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    //},
                //}];

                    //{ captureField: 'first', label: 'First Name', crmField: { name: 'FirstName', label: 'First Name' } },
                    //{ captureField: 'last', label: 'Last Name', crmField: { name: 'LastName', label: 'Last Name' } },
                    //{ captureField: 'jobtitle', label: 'Job Title', crmField: { name: 'Title', label: 'Title' } },
                    //{ captureField: 'company', label: 'Company Name', crmField: { name: 'Company', label: 'Company' } },
                    //{ captureField: 'email', label: 'Email', crmField: { name: 'Email', label: 'Email' } },
                    //{ captureField: 'phone', label: 'Phone', crmField: { name: 'Phone', label: 'Phone' } },
                    //{ captureField: 'phone2', label: 'Phone 2', crmField: { name: 'MobilePhone', label: 'Mobile Phone' } },
                    //{ captureField: 'website', label: 'Website', crmField: { name: 'Website', label: 'Website' } },
                    //{ captureField: 'bio', label: 'Bio', crmField: { name: 'Description', label: 'Description' } },
                    //{ captureField: 'address1', label: 'Address Line 1', crmField: { name: 'Street', label: 'Street' } },
                    //{ captureField: 'address2', label: 'Address Line 2', crmField: null },
                    //{ captureField: 'city', label: 'City', crmField: { name: 'City', label: 'City' } },
                    //{ captureField: 'state', label: 'State', crmField: { name: 'State', label: 'State' } },
                    //{ captureField: 'zip', label: 'Zip Code', crmField: { name: 'PostalCode', label: 'Postal Code' } },
                    //{ captureField: 'country', label: 'Country', crmField: { name: 'Country', label: 'Country' } },
                ]
            };


            var maps = [];

            maps.push({ name: 'candidate', label: 'Candidate', map: candidateMap });
            maps.push({ name: 'contact', label: 'Contact', map: contactMap });

            successCallback(maps);
        },

        resolveLookup: function (actionId, lookupId, objectId, successCallback, failCallback) {

            console.log('RESOLVING LOOKUP');

            if (actionId === 'addLeadToCampaign') {
                service.createRecord('CampaignMember', { CampaignId: lookupId, LeadId: objectId }, {}, successCallback, failCallback);
            } else if (actionId === 'addContactToCampaign') {
                service.createRecord('CampaignMember', { CampaignId: lookupId, ContactId: objectId }, {}, successCallback, failCallback);
            } else if (actionId === 'createNewAccount') {

                if (lookupId && typeof lookupId.newName === 'undefined') {
                    console.log('EXISTING ACCOUNT', lookupId);
                    //service.updateRecord(objectId, 'Contact', { AccountId: lookupId }, successCallback, failCallback); // No need: was already posted
                    successCallback();
                } else {

                    console.log('NEW ACCOUNT', lookupId.newName);

                    var createSourceRecord = angular.copy(lookupId.record);
                    //Replace new Account name with user-entered value
                    createSourceRecord.company = lookupId.newName;
                    var createOptions = { map: lookupId.map };

                    service.createRecord('Account', createSourceRecord, createOptions,

                        // account was created
                        function (accountLink, accountId) {
                            console.log('account was created', accountLink, accountId, lookupId, objectId);
                            if (objectId) {
                                // Link was requested
                                var updateData = {};
                                updateData[lookupId.crmProperty] = accountId;
                                service.updateRecord(objectId, 'Contact', updateData, successCallback, failCallback);
                            } else {
                                // Link was not requested
                                successCallback(accountLink, accountId);
                            }
                        },

                        // Account was not created
                        function (msg) {
                            console.error('account was not created', msg);
                            failCallback('Account was not created');
                        }
                    );
                }
            } else {
                console.log('ERROR: Unknown action', lookupId);
                failCallback('Unknown action');
            }
        },

        getDefinition: function (entityType, successCallback, failureCallback) {

            console.log('GETTING DEFINITION');

            var def = {};
            entityType = entityType.toLowerCase();
            if (entityType === 'candidate') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description', 'RevenueAvg', 'EmployeesAvg'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description', 'RevenueAvg', 'EmployeesAvg', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { display: 'First Name', group: 'G1' },
                            'LastName': { display: 'Last Name', group: 'G1' },
                            'Title': { display: 'Job Title', group: 'G1' },
                            'Company': { display: 'Company', group: 'G1' },
                            'Email': { display: 'Email', group: 'G1' },
                            'Phone': { display: 'Phone', group: 'G1' },
                            'MobilePhone': { display: 'Mobile Phone', group: 'G1' },
                            'Website': { display: 'Website', group: 'G1' },
                            'Description': { display: 'Description', group: 'G1' },

                            'Street': { display: 'Street', group: 'G2' },
                            'City': { display: 'City', group: 'G2' },
                            'State': { display: 'State/Province', group: 'G2' },
                            'PostalCode': { display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { display: 'Country', group: 'G2' },
                        }
                    }
                };

            } else if (entityType === 'contact') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { id: 'G1', display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'MobilePhone', 'Description'] },
                            'G2': { id: 'G2', display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'MobilePhone', 'Description', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { id: 'FirstName', display: 'First Name', group: 'G1' },
                            'LastName': { id: 'LastName', display: 'Last Name', group: 'G1' },
                            'Title': { id: 'Title', display: 'Job Title', group: 'G1' },
                            'Email': { id: 'Email', display: 'Email', group: 'G1' },
                            'Phone': { id: 'Phone', display: 'Phone', group: 'G1' },
                            'MobilePhone': { id: 'MobilePhone', display: 'Mobile Phone', group: 'G1' },
                            //'Website': { id: 'Website', display: 'Website', group: 'G1' },
                            'Description': { id: 'Description', display: 'Description', group: 'G1' },

                            'Street': { id: 'Street', display: 'Street', group: 'G2' },
                            'City': { id: 'City', display: 'City', group: 'G2' },
                            'State': { id: 'State', display: 'State/Province', group: 'G2' },
                            'PostalCode': { id: 'PostalCode', display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { id: 'Country', display: 'Country', group: 'G2' }
                        }
                    }
                };
            } else {
                failureCallback('Invalid record type');
            }
            successCallback(def);
        },

        //  From sf candidate to app contact
        fromCandidate: function (sfObject) {
            var contact = {};
            mapFromField(contact, 'first', sfObject, 'FirstName');
            mapFromField(contact, 'last', sfObject, 'LastName');
            mapFromField(contact, 'jobtitle', sfObject, 'Title');
            mapFromField(contact, 'company', sfObject, 'Company');
            mapFromField(contact, 'email', sfObject, 'Email');
            mapFromField(contact, 'phone', sfObject, 'Phone');
            mapFromField(contact, 'phone2', sfObject, 'MobilePhone');
            mapFromField(contact, 'website', sfObject, 'Website');
            mapFromField(contact, 'bio', sfObject, 'Description');
            mapFromField(contact, 'address1', sfObject, 'Street');
            mapFromField(contact, 'city', sfObject, 'City');
            mapFromField(contact, 'state', sfObject, 'State');
            mapFromField(contact, 'zip', sfObject, 'PostalCode');
            mapFromField(contact, 'country', sfObject, 'Country');
            contact._link = store.url + '/' + sfObject.Id;
            contact._type = 'Candidate';
            contact._id = sfObject.Id;
            return contact;
        },
        //  From app contact to sf candidate
        toCandidate: function (contact) {
            var sfObject = {};
            mapField(contact, 'first', sfObject, 'FirstName');
            mapField(contact, 'last', sfObject, 'LastName');
            mapField(contact, 'jobtitle', sfObject, 'Title');
            mapField(contact, 'company', sfObject, 'Company');
            mapField(contact, 'email', sfObject, 'Email');
            mapField(contact, 'phone', sfObject, 'Phone');
            mapField(contact, 'phone2', sfObject, 'MobilePhone');
            mapField(contact, 'website', sfObject, 'Website');
            mapField(contact, 'bio', sfObject, 'Description');
            mapField(contact, 'address1', sfObject, 'Street');
            mapField(contact, 'city', sfObject, 'City');
            mapField(contact, 'state', sfObject, 'State');
            mapField(contact, 'zip', sfObject, 'PostalCode');
            mapField(contact, 'country', sfObject, 'Country');
            return sfObject;
        },
        //  From sf contact to app contact
        fromContact: function (sfObject) {
            var contact = {};
            mapFromField(contact, 'first', sfObject, 'FirstName');
            mapFromField(contact, 'last', sfObject, 'LastName');
            mapFromField(contact, 'jobtitle', sfObject, 'Title');
            mapFromField(contact, 'company', sfObject, 'Account.Name');
            mapFromField(contact, 'email', sfObject, 'Email');
            mapFromField(contact, 'phone', sfObject, 'Phone');
            mapFromField(contact, 'phone2', sfObject, 'MobilePhone');
            mapFromField(contact, 'bio', sfObject, 'Description');
            mapFromField(contact, 'address1', sfObject, 'MailingStreet');
            mapFromField(contact, 'city', sfObject, 'MailingCity');
            mapFromField(contact, 'state', sfObject, 'MailingState');
            mapFromField(contact, 'zip', sfObject, 'MailingPostalCode');
            mapFromField(contact, 'country', sfObject, 'MailingCountry');
            contact._link = store.url + '/' + sfObject.Id;
            contact._type = 'Contact';
            contact._id = sfObject.Id;
            return contact;
        },
        //  from app contact to sf contact
        toContact: function (contact) {
            var sfObject = {};
            mapField(contact, 'first', sfObject, 'FirstName');
            mapField(contact, 'last', sfObject, 'LastName');
            mapField(contact, 'jobtitle', sfObject, 'Title');
            mapField(contact, 'email', sfObject, 'Email');
            mapField(contact, 'phone', sfObject, 'Phone');
            mapField(contact, 'phone2', sfObject, 'MobilePhone');
            mapField(contact, 'bio', sfObject, 'Description');
            mapField(contact, 'address1', sfObject, 'MailingStreet');
            mapField(contact, 'city', sfObject, 'MailingCity');
            mapField(contact, 'state', sfObject, 'MailingState');
            mapField(contact, 'zip', sfObject, 'MailingPostalCode');
            mapField(contact, 'country', sfObject, 'MailingCountry');
            return sfObject;
        },
        //  From sf account to app contact
        fromAccount: function (sfObject) {
            var contact = {};
            mapFromField(contact, 'website', sfObject, 'Website');
            mapFromField(contact, 'company', sfObject, 'Name');
            //mapFromField(contact, 'jobtitle', sfObject, 'Title');
            //mapFromField(contact, 'email', sfObject, 'Email');
            //mapFromField(contact, 'phone', sfObject, 'Phone');
            //mapFromField(contact, 'phone2', sfObject, 'MobilePhone');
            //mapFromField(contact, 'bio', sfObject, 'Description');
            //mapFromField(contact, 'address1', sfObject, 'MailingStreet');
            mapFromField(contact, 'city', sfObject, 'BillingCity');
            mapFromField(contact, 'state', sfObject, 'BillingState');
            //mapFromField(contact, 'zip', sfObject, 'MailingPostalCode');
            //mapFromField(contact, 'country', sfObject, 'MailingCountry');
            //mapFromField(contact, 'country', sfObject, 'MailingCountry');
            contact._createdDate = sfObject.CreatedDate;
            contact._link = store.url + '/' + sfObject.Id;
            //contact._link = store.url + sfObject.attributes.url;
            contact._type = 'Account';
            contact._id = sfObject.Id;
            return contact;
        },
        //  From app contact to sf object
        toNativeRecord: function (contact, entityType) {
            entityType = entityType.toLowerCase();
            if (entityType === 'contact') { return this.toContact(contact); }
            if (entityType === 'candidate') { return this.toCandidate(contact); }
        },
        //  From sf entity to app contact
        fromNativeRecord: function (sfEntity, entityType) {
            entityType = entityType.toLowerCase();
            if (entityType === 'contact') { return this.fromContact(sfEntity); }
            if (entityType === 'candidate') { return this.fromCandidate(sfEntity); }
            if (entityType === 'account') { return this.fromAccount(sfEntity); }
        },

        //  From CRM object to lookup object (each object is defined as {label: '', link: ''})
        toLookupObject: function (crmObject, entityType) {
            if (debug) { console.log(debug + 'toLookupObject->entityType', entityType, '->crmObject', crmObject); }

            entityType = entityType.toLowerCase();
            var lookupObject = { label: '', link: '' };
            var appObject = null;
            if (entityType === 'contact') { appObject = this.fromContact(crmObject); }
            else if (entityType === 'candidate') {
                appObject = this.fromCandidate(crmObject);
            }
            else if (entityType === 'account') {
                appObject = this.fromAccount(crmObject);
                var cityState = '';
                if (appObject.city) { cityState = appObject.city; }
                if (appObject.state) {
                    if (cityState) { cityState = cityState + ', ' + appObject.state; }
                    else { cityState = appObject.state; }
                }
                if (cityState) { cityState = ' (' + cityState + ')'; }
                lookupObject.label = (appObject.company || '(no name)') + cityState;
                lookupObject.link = appObject._link;
                lookupObject.id = appObject._id;
            }
            else if (entityType === 'campaign') {
                lookupObject.label = (crmObject.Name || '(no name)');
                lookupObject.link = store.url + '/' + crmObject.Id;
                lookupObject.id = crmObject.Id;
            } else {
                // Assume there is Id and Name fields
                lookupObject.label = (crmObject.Name || '(no name)');
                lookupObject.link = store.url + '/' + crmObject.Id;
                lookupObject.id = crmObject.Id;
            }
            if (debug) { console.log(debug + 'toLookupObject->result', lookupObject); }
            return lookupObject;
        },

        getRequiredLookups: function (entityType, actualMap) {

            console.log('GETTING REQUIRED LOOKUPS');

            entityType = entityType.toLowerCase();

            if (actualMap) {

                if (debug) { console.log(debug + 'getRequiredLookups->map', actualMap); }

                var aa = [];

                // convert map def to lookup def

                for (var i = 0, l = actualMap.fields.length; i < l; i++) {
                    var f = actualMap.fields[i];
                    if (f.source && (f.source.type === 'lookup' || f.source.type === 'picklist' || f.source.type === 'action')) {

                        if (f.source && f.source.value && f.source.value.enabled === false) {
                            console.log('disabled action', angular.copy(f));
                            continue;
                        }

                        var a;

                        if (f.source.value) {
                            a = {
                                crmProperty: f.target.name,
                                appProperty: f.source.value.appProperty,
                                message: f.source.value.message,
                                type: f.source.value.type,
                                defaultValue: f.source.value.defaultValue ? { id: f.source.value.defaultValue.value, label: f.source.value.defaultValue.label } : null,
                                required: f.source.value.required,
                                allowNew: f.source.value.allowNew,
                                picklist: f.source.value.picklist || f.source.type === 'picklist',
                                resolve: f.source.value.resolve,
                                hidden: f.source.value.hidden
                            };

                            if (a.crmProperty === 'CampaignMember' && !a.appProperty) {
                                a.appProperty = 'campaign';
                            }
                        } else {
                            a = {
                                crmProperty: f.target.name,
                                appProperty: '',
                                message: '',
                                type: '',
                                defaultValue: '',
                                required: false,
                                allowNew: false,
                                picklist: f.source.type === 'picklist',
                                resolve: null,
                            };
                        }

                        if (f.source.type === 'picklist') {
                            a.type = entityType;
                            a.allowNew = false;
                        }


                        aa.push(a);
                    }
                }

                if (debug) { console.log(debug + 'getRequiredLookups->result', aa); }

                return aa;
            }

            if (entityType === 'contact') {
                return [{ crmProperty: 'AccountId', appProperty: 'company', message: 'Select Account', type: 'Account', required: false, allowNew: true }
                    //,
                    //    { crmProperty: 'OwnerId', appProperty: 'full', message: 'Select account owner', type: 'SystemUser', required: false, allowNew: false }
                ];
            }
            if (entityType === 'candidate') {
                //return [{
                //    crmProperty: 'Campaign', appProperty: 'campaign', message: 'Select Campaign', type: 'Campaign', required: false, allowNew: false,
                //    resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //        service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    },
                //}, {
                //    crmProperty: 'LeadSource', appProperty: null, message: 'Select Lead Source', type: 'Lead', required: true, allowNew: false,
                //    picklist: true//,
                //    //resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //    //    console.log('resolve called', lookupId, objectId)
                //    //    //service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    //},
                //}];
            }
            if (entityType === 'account') { return []; }
            return [];
        },


        asyncGetDefinition: function (entityType) {
            var deferred = $q.defer();
            service.getDefinition(entityType,
                function (def) { deferred.resolve(def); },
                function (msg) { deferred.reject(msg); }
            );
            return deferred.promise;
        },

        //-- CRUD --//
        //  Create a record with data provided
        //      successCallback: function(recordId)
        createRecord: function (recordType, captureRecord, createOptions, successCallback, failCallback) {

            console.log('CREATING RECORD WITH');
            console.log(recordType);

            if (recordType === 'candidate') { recordType = 'Candidate'; }
            if (recordType === 'contact') { recordType = 'Contact'; }
            if (recordType === 'account') { recordType = 'Account'; }

            //var service = this;
            var attemptsLeft = 10;
            var record = {};
            var url = store.url + '/services/data/v34.0/sobjects/' + recordType + '/';

            var createRecordWithMap = function (map, captureRecord) {

                var r = {};

                if (map && map.fields) {
                    var i = map.fields.length;
                    while (i--) {
                        var f = map.fields[i];
                        if (f.target && f.target.name) {
                            if (f.source) {
                                var a = r[f.target.name];
                                var b = '';
                                var l = f.target.length || 0;
                                if (f.source.type === 'capture') {
                                    b = captureRecord[f.source.value.captureField] || '';
                                    if (a) {
                                        r[f.target.name] = service.limitstr(a + ' ' + b, l);
                                    } else {
                                        r[f.target.name] = service.limitstr(b, l);
                                    }
                                } else if (f.source.type === 'text' && f.source.value) {
                                    b = f.source.value.text || '';
                                    if (r[f.target.name]) {
                                        r[f.target.name] = service.limitstr(a + ' ' + b, l);
                                    } else {
                                        r[f.target.name] = service.limitstr(b, l);
                                    }
                                }
                                //else if (f.source.type === 'lookup')
                                //{ r[f.target.name] = f.source.value.text; }
                            }
                        }
                    }
                }

                if (createOptions && createOptions.mappedProperties) {
                    var j = createOptions.mappedProperties.length;
                    while (j--)
                    { r[createOptions.mappedProperties[j].name] = createOptions.mappedProperties[j].value; }
                }

                console.log('SF record', r);

                return r;
            };

            var handleError = function (errorResponse, f) {

                if (debug) { console.log(debug + 'handleError', errorResponse); }

                var tryAgain = false;
                var delayDecision = false;
                var msg = '';
                var text = '';

                var makeDecision = function () {

                    if (tryAgain) {
                        if (debug) { console.log(debug + 'trying again', record); }
                        f();
                    }
                    else {
                        if (msg === '') {
                            msg = errorResponse.responseText;
                        }
                        if (typeof msg === 'undefined' || msg === '') {
                            msg = 'Export error';
                        }
                        failCallback(msg);
                    }
                };


                if (errorResponse.responseJSON) {

                    var i = errorResponse.responseJSON.length;

                    if (i--) {

                        msg += errorResponse.responseJSON[i].message + '  ';

                        var errorCode = errorResponse.responseJSON[i].errorCode;

                        if (errorCode === 'INVALID_SESSION_ID') {
                            service.logout(true);
                            failCallback('Session expired. Please log in.');
                            //} else if (errorCode === 'INVALID_FIELD_FOR_INSERT_UPDATE') {
                            //    var k = errorResponse.responseJSON[i].fields.length;
                            //    while (k--) {
                            //        delete record[errorResponse.responseJSON[i].fields[k]];
                            //        tryAgain = attemptsLeft > 0;
                            //        attemptsLeft--;
                            //    }
                        } else if (errorCode === 'FIELD_INTEGRITY_EXCEPTION') {
                            var j = errorResponse.responseJSON[i].fields.length;
                            while (j--) {
                                delete record[errorResponse.responseJSON[i].fields[j]];
                                tryAgain = attemptsLeft > 0;
                                attemptsLeft--;
                            }
                        } else if (errorCode === 'REQUIRED_FIELD_MISSING') {

                            var requiredField = errorResponse.responseJSON[i].message.split('[')[1];

                            if (requiredField) {
                                requiredField = requiredField.split(']')[0];

                                if (typeof enteredValues[requiredField] !== 'undefined') {
                                    record[requiredField] = enteredValues[requiredField];
                                    tryAgain = attemptsLeft > 0;
                                    attemptsLeft--;
                                }
                                else {
                                    //msg = 'Please map value of required field ' + requiredField + ' and try again';
                                    //attemptsLeft = 0;

                                    text = 'Please enter value of required field ' + requiredField + ':';
                                    delayDecision = true;

                                    $timeout(function () {
                                        dialogs.text.show({ message: text, value: '' }).confirm(function (value) {

                                            console.log('New Value = ' + value);
                                            enteredValues[requiredField] = value;
                                            record[requiredField] = value;

                                            if (typeof value === 'undefined') {
                                                attemptsLeft = 0;
                                            }

                                            tryAgain = attemptsLeft > 0;
                                            attemptsLeft--;

                                            makeDecision();

                                        });
                                    }, 500);
                                }

                            }

                        } else if (errorCode === 'INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST') {

                            var fieldLabel = errorResponse.responseJSON[i].message.split(':')[0];
                            var invalidValue = errorResponse.responseJSON[i].message.split(':')[2];

                            var fieldIndex = 0;
                            if (fieldIndex < errorResponse.responseJSON[i].fields.length) {
                                var fieldName = errorResponse.responseJSON[i].fields[fieldIndex];

                                if (typeof enteredValues[fieldName] !== 'undefined') {
                                    record[fieldName] = enteredValues[fieldName];
                                    tryAgain = attemptsLeft > 0;
                                    attemptsLeft--;
                                }
                                else {
                                    //msg = 'Please map picklist value of field ' + fieldLabel + ' and try again';
                                    //attemptsLeft = 0;

                                    text = 'Please enter valid picklist value of ' + fieldLabel + ':';
                                    delayDecision = true;

                                    $timeout(function () {
                                        dialogs.text.show({ message: text, value: invalidValue }).confirm(function (value) {

                                            console.log('New Value = ' + value);
                                            enteredValues[fieldName] = value;
                                            record[fieldName] = value;

                                            if (!record[fieldName]) {
                                                attemptsLeft = 0;
                                            }

                                            makeDecision();

                                        });
                                    }, 500);
                                }
                                fieldIndex++;
                            }

                            tryAgain = attemptsLeft > 0;
                            attemptsLeft--;

                        } else if (errorCode === 'INVALID_FIELD') {

                            if (errorResponse.responseJSON[i].message === 'No such column \'MailingStateCode\' on sobject of type Contact' ||
                                errorResponse.responseJSON[i].message === 'No such column \'MailingCountryCode\' on sobject of type Contact') {

                                delete record.MailingStateCode;
                                delete record.MailingCountryCode;

                                record.MailingState = service.limitstr(captureRecord.state, 0);
                                record.MailingCountry = service.limitstr(captureRecord.country, 0);

                                tryAgain = attemptsLeft > 0;
                                attemptsLeft--;

                            } else if (errorResponse.responseJSON[i].message === 'No such column \'StateCode\' on sobject of type Candidate' ||
                                errorResponse.responseJSON[i].message === 'No such column \'CountryCode\' on sobject of type Candidate') {

                                delete record.StateCode;
                                delete record.CountryCode;

                                record.State = service.limitstr(captureRecord.state, 0);
                                record.Country = service.limitstr(captureRecord.country, 0);

                                tryAgain = attemptsLeft > 0;
                                attemptsLeft--;

                            } else {

                                if (errorResponse.responseJSON[i].message.indexOf('No such column' >= 0)) {
                                    var missingField = errorResponse.responseJSON[i].message.split('\'')[1];
                                    if (missingField) {
                                        delete record[missingField];
                                        tryAgain = attemptsLeft > 0;
                                        attemptsLeft--;
                                    }
                                }

                            }
                        }

                    }
                }

                if (!delayDecision)
                { makeDecision(); }

            };

            var handleSuccess = function (successResponse) {

                if (debug) { console.log(debug + 'handleSuccess', successResponse); }

                //var fields = {};
                //fields[data.mappedProperties[0].name] = '0014000001Ym7q7'; //data.mappedProperties[0].value;
                //updateRecord(successResponse.id, { 'FirstName': 'Alex' });
                //updateRecord(successResponse.id, { 'accid': '0014000001Ym7q7' });

                if (successResponse && successResponse.success)
                { successCallback(store.url + '/' + successResponse.id, successResponse.id); }
                else
                { failCallback('Record was not created'); }

            };

            var composeDescription = function (contact) {
                var s = [];
                s.push('Added by Capture!');
                if (contact.mark && contact.mark !== 'Default') { s.push('List: [' + contact.mark + ']'); }
                if (contact.email2) { s.push('Email 2: ' + contact.email2); }
                if (contact.sourceurl) { s.push('Source URL: ' + contact.sourceurl); }
                if (contact.venues) {
                    s.push('Social Links:');
                    for (var i = 0; i < contact.venues.length; i++)
                    { s.push(contact.venues[i].website); }
                    //{ s.push(contact.venues[i].type + ': ' + contact.venues[i].website); }
                }
                if (contact.bio) { s.push('Bio:\n' + contact.bio); }


                return s.join('\n').trim();
            };

            var createCandidate = function (contact) { //, session, url, crmid, sitekey) {

                //console.log('SF', session, url, store.id);


                var countryCode = service.convertCountryToJobScienceCountryCode(contact.country);
                var stateCode = service.convertStateToJobScienceStateCode(contact.state);

                if (service.isUSState(stateCode)) {
                    countryCode = 'US';
                }

                record = {
                    'LastName': service.limitstr(contact.last, 80),
                    'FirstName': service.limitstr(contact.first, 40),
                    'Email': service.limitstr(contact.email, 0),
                    'Company': service.limitstr(contact.company ? contact.company : 'Unknown', 255),
                    'Title': service.limitstr(contact.jobtitle, 128),
                    'Street': service.limitstr((contact.address1 ? contact.address1 : '') + (contact.address2 ? ' ' + contact.address2 : ''), 0),
                    'City': service.limitstr(contact.city, 0),
                    'State': service.limitstr(contact.state, 0),
                    'StateCode': service.limitstr(stateCode, 0),
                    'PostalCode': service.limitstr(contact.zip, 0),
                    'Country': service.limitstr(contact.country, 0),
                    'CountryCode': service.limitstr(countryCode, 0),
                    'Website': service.limitstr(contact.website, 255),
                    'Phone': service.limitstr(contact.phone, 0),
                    'MobilePhone': service.limitstr(contact.phone2, 0),
                    'Fax': service.limitstr(contact.fax, 0),
                    //'LeadSource': service.limitstr((contact.mark && contact.mark !== 'Default' ? contact.mark : 'Capture!'), 0),
                    'Description': service.limitstr(composeDescription(contact), 32000)
                };

                if (record.StateCode !== '') {
                    delete record.State;
                }
                if (record.CountryCode !== '') {
                    delete record.Country;
                }

                if (createOptions && createOptions.mappedProperties) {
                    var i = createOptions.mappedProperties.length;
                    while (i--)
                    { record[createOptions.mappedProperties[i].name] = createOptions.mappedProperties[i].value; }
                }

                console.log('SF Record', JSON.stringify(record), JSON.stringify(contact));

                var f = function () {
                    try {
                        if (debug) { console.log(debug + 'post', angular.copy(record)); }
                        //calls Job Science REST API with jQuery
                        jQuery.ajax({
                            type: 'POST',
                            url: url, //url + code + 'Lead/',
                            contentType: 'application/json',
                            dataType: 'json',
                            data: JSON.stringify(record),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'OAuth ' + store.id);
                                xhr.setRequestHeader('Accept', 'application/json');
                            },
                            success: function (successResponse) {
                                handleSuccess(successResponse);
                            },
                            error: function (errorResponse) {
                                handleError(errorResponse, f);
                            }

                        });
                    } catch (e) {
                        console.log('create sf candidate failed', e);
                        failCallback('Record was not created');
                    }
                };

                f();

            };

            var createContact = function (contact) {

                var countryCode = service.convertCountryToJobScienceCountryCode(contact.country);
                var stateCode = service.convertStateToJobScienceStateCode(contact.state);

                if (service.isUSState(stateCode))
                { countryCode = 'US'; }

                record = {
                    //'AccountId': '', // passed as mappedProperties
                    'LastName': service.limitstr(contact.last, 80),
                    'FirstName': service.limitstr(contact.first, 40),
                    'Email': service.limitstr(contact.email, 0),
                    'Title': service.limitstr(contact.jobtitle, 128),
                    'MailingStreet': service.limitstr((contact.address1 ? contact.address1 : '') + (contact.address2 ? ' ' + contact.address2 : ''), 0),
                    'MailingCity': service.limitstr(contact.city, 0),
                    'MailingState': service.limitstr(contact.state, 0),
                    'MailingStateCode': service.limitstr(stateCode, 0),
                    'MailingPostalCode': service.limitstr(contact.zip, 0),
                    'MailingCountry': service.limitstr(contact.country, 0),
                    'MailingCountryCode': service.limitstr(countryCode, 0),
                    'Phone': service.limitstr(contact.phone, 0),
                    'MobilePhone': service.limitstr(contact.phone2, 0),
                    'Fax': service.limitstr(contact.fax, 0),
                    'Description': service.limitstr(composeDescription(contact), 32000)
                };

                if (record.MailingStateCode !== '') {
                    delete record.MailingState;
                }
                if (record.MailingCountryCode !== '') {
                    delete record.MailingCountry;
                }

                if (createOptions && createOptions.mappedProperties) {
                    var i = createOptions.mappedProperties.length;
                    while (i--) {
                        var fieldName = createOptions.mappedProperties[i].name;
                        record[fieldName] = createOptions.mappedProperties[i].value;
                    }
                }

                var f = function () {

                    if (debug) { console.log(debug + 'post', url, angular.copy(record)); }
                    try {
                        //calls Job Science REST API with jQuery
                        jQuery.ajax({
                            type: 'POST',
                            url: url,
                            contentType: 'application/json',
                            dataType: 'json',
                            data: JSON.stringify(record),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'OAuth ' + store.id);
                                xhr.setRequestHeader('Accept', 'application/json');
                            },
                            success: function (successResponse) {
                                handleSuccess(successResponse);
                            },
                            error: function (errorResponse) {
                                handleError(errorResponse, f);
                            }
                        });
                    } catch (e) {
                        console.log('create sf contact failed', e);
                        failCallback('Record was not created');
                    }
                };

                f();

            };

            var createAccount = function (contact) {

                //if (map && map.fields && map.fields.length > 0) {
                //    record = createRecordWithMap(map, contact);
                //} else {
                var countryCode = service.convertCountryToJobScienceCountryCode(contact.country);
                var stateCode = service.convertStateToJobScienceStateCode(contact.state);

                if (service.isUSState(stateCode)) {
                    countryCode = 'US';
                }

                record = {
                    'Name': service.limitstr(contact.company || 'Unknown', 255),
                    'BillingStreet': service.limitstr((contact.address1 ? contact.address1 : '') + (contact.address2 ? ' ' + contact.address2 : ''), 0),
                    'BillingCity': service.limitstr(contact.city, 40),
                    'BillingState': service.limitstr(contact.state, 80),
                    'BillingStateCode': service.limitstr(stateCode, 0),
                    'BillingPostalCode': service.limitstr(contact.zip, 20),
                    'BillingCountry': service.limitstr(contact.country, 80),
                    'BillingCountryCode': service.limitstr(countryCode, 0),
                    'Website': service.limitstr(contact.website, 255),
                    'Phone': service.limitstr(contact.phone, 0),
                    'Fax': service.limitstr(contact.fax, 0),
                    'Description': service.limitstr('Added by Capture!', 32000)
                };

                if (record.BillingStateCode !== '') {
                    delete record.BillingState;
                }
                if (record.BillingCountryCode !== '') {
                    delete record.BillingCountry;
                }
                //}

                if (createOptions && createOptions.mappedProperties) {
                    var i = createOptions.mappedProperties.length;
                    while (i--)
                    { record[createOptions.mappedProperties[i].name] = createOptions.mappedProperties[i].value; }
                }

                console.log('SF Record', JSON.stringify(record), JSON.stringify(contact));

                var f = function () {
                    try {
                        if (debug) { console.log(debug + 'post', angular.copy(record)); }

                        //calls Job Science REST API with jQuery
                        jQuery.ajax({
                            type: 'POST',
                            url: url,
                            contentType: 'application/json',
                            dataType: 'json',
                            data: JSON.stringify(record),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'OAuth ' + store.id);
                                xhr.setRequestHeader('Accept', 'application/json');
                            },
                            success: function (successResponse) {
                                console.log('**** CREATE ACCOUNT SUCCESS');
                                handleSuccess(successResponse);
                            },
                            error: function (errorResponse) {
                                console.log('**** CREATE ACCOUNT FAIL');
                                handleError(errorResponse, f);
                            }

                        });
                    } catch (e) {
                        console.log('create sf account failed', e);
                        failCallback(e.message);
                    }
                };

                f();

            };

            var createNewRecord = function (recordType, record2) {

                record = record2; // fixing the scope

                if (debug) { console.log(debug + 'createNewRecord->type:', recordType, '->record:', record); }

                var f = function () {
                    try {
                        if (recordType === 'Candidate') {
                            recordType = 'Contact';
                            record.RecordTypeID = '01236000000dz4B';
                        }
                        if (debug) { console.log(debug + 'post', angular.copy(record)); }
                        //calls Job Science REST API with jQuery
                        jQuery.ajax({
                            type: 'POST',
                            url: store.url + '/services/data/v34.0/sobjects/' + recordType + '/',
                            contentType: 'application/json',
                            dataType: 'json',
                            data: JSON.stringify(record),
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'OAuth ' + store.id);
                                xhr.setRequestHeader('Accept', 'application/json');
                            },
                            success: function (successResponse) {
                                handleSuccess(successResponse);
                            },
                            error: function (errorResponse) {
                                handleError(errorResponse, f);
                            }

                        });
                    } catch (e) {
                        console.log('create failed', e);
                        failCallback(e.message);
                    }
                };

                f();

            };


            console.log('SF create record', captureRecord);


            if (createOptions && createOptions.map && createOptions.map.fields && createOptions.map.fields.length > 0) {

                captureRecord.address = ((captureRecord.address1 ? captureRecord.address1 : '') +
                    (captureRecord.address2 ? ' ' + captureRecord.address2 : '')).trim();

                captureRecord.stateCode = service.convertStateToJobScienceStateCode(captureRecord.state);
                captureRecord.countryCode = service.convertCountryToJobScienceCountryCode(captureRecord.country);
                if (service.isUSState(captureRecord.stateCode)) {
                    captureRecord.countryCode = 'US';
                }

                var rec = createRecordWithMap(createOptions.map, captureRecord);

                createNewRecord(recordType, rec);

            } else {

                if (recordType.toUpperCase() === 'CANDIDATE')
                { createCandidate(captureRecord); }
                else if (recordType.toUpperCase() === 'CONTACT')
                { createContact(captureRecord); }
                else if (recordType.toUpperCase() === 'ACCOUNT')
                { createAccount(captureRecord); }
                else
                { createNewRecord(recordType, captureRecord); }

            }

        },

        //  Update an existing record with data
        //      successCallback: function(recordId)
        updateRecord: function (recordId, recordType, record, successCallback, failCallback, original) {
            if (recordType === 'candidate') { recordType = 'Candidate'; }
            if (recordType === 'contact') { recordType = 'Contact'; }
            var headers = { 'Content-type': 'application/json', 'Authorization': 'OAuth ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' };
            var url = store.url + '/services/data/v34.0/sobjects/' + recordType + '/' + recordId;

            if (original) {
                // remove fields that did not change
                for (var a in original) {
                    if (record[a] === original[a]) {
                        delete record[a];
                    }
                }
                console.log(consolePrefix + 'Update > Cleaned Record > ', record);
            }

            var config = { method: 'PATCH', url: url, data: record, headers: headers };
            console.log('salesforce.updateRecord...', config);
            $http(config).success(function (response) {
                if (debug) { console.log('salesforce.updateRecord:', response); }
                try { successCallback(response); } catch (e) { }
            }).error(function (response, status) {
                if (debug) { console.error('salesforce.updateRecord:', status, response); }
                var msg = '';
                if (response && response.length > 0) {
                    var i = 0;
                    while (i < response.length) {
                        if (response[i].message)
                        { msg += response[i].message + ' '; }
                        i++;
                    }
                }
                try { failCallback('Cannot update Job Science record: (' + status + ') ' + (msg || response)); } catch (e) { }
            });
        },

        //  Retrieve record from service
        //      successCallback: function(recordId, data)
        retrieveRecord: function (recordId, recordType, successCallback, failureCallback) {

            console.log('RETRIEVING RECORD');
            try {
                if (recordType === 'candidate') { recordType = 'Candidate'; }
                if (recordType === 'contact') { recordType = 'Contact'; }
                var config = { headers: { 'Content-type': 'application/json', 'Authorization': 'OAuth ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' } };
                var url = store.url + '/services/data/v34.0/sobjects/' + recordType + '/' + recordId;
                console.log('salesforce.retrieveRecord...', { url: url, config: config });
                $http.get(url, config).success(

                    //function (response) {
                    //    if (debug) { console.log('salesforce.retrieveRecord:', response); }
                    //    try { successCallback(response); } catch (e) { }
                    //}

                    function (data, status, headers, config) {
                        defaultOnSuccessHandler(data, status, headers, config, successCallback, failureCallback);
                    }

                ).error(function (response, status) {
                    console.error('Retrieve Record > Error > ', response, status);
                    var error = '';
                    if (response.message) { error = response.message; }
                    else { error = JSON.stringify(response); }
                    try { failureCallback('Cannot retrieve Job Science record: (' + status + ') ' + error, status); } catch (e) { }
                });
            } catch (e) {
                console.error('Retrieve Record > Exception > ', e.message);
                var details = 'Chrome exception';
                if (e && e.message) {
                    details = e.message;
                }
                failureCallback('Cannot retrieve Job Science record: ' + details);
            }
        },

        asyncRetrieveRecord: function (recordId, recordType) {
            var deferred = $q.defer();
            service.retrieveRecord(recordId, recordType,
                function (response) { deferred.resolve(response); },
                function (msg) { deferred.reject(msg); }
            );
            return deferred.promise;
        },

        //  Delete record from service
        //      successCallback: function(recordId)
        deleteRecord: function (recordId, successCallback, failCallback) {
        },
        //-- /CRUD --//


        //-- Search --//
        //  Find a record using a query: { first:'', last:'', email:''} object
        //      successCallback: function(nativeRecords[])
        findRecord: function (recordType, query, fields, successCallback, failureCallback) {
            const functionName = 'Find Record';
            try {

                console.log(consolePrefix + functionName, ' > Type > ', recordType, ' > Query > ', query, ' > Fields >', fields);

                checkSession();

                //var service = this;

                var encodeParam = function (p) {
                    p = p || '';
                    p = p.replace('\\', '\\\\');
                    p = p.replace('\'', '\\\'');
                    p = p.replace('\"', '\\\"');
                    return encodeURIComponent(p);
                    //return p.replace(/'/g, '%5C%27');
                };

                if (debug) { console.log(debug + 'findRecord->type:', recordType, '->query:', query, '->fields:', fields); }

                if (recordType === 'account') { recordType = 'Account'; }
                if (recordType === 'candidate') { recordType = 'Contact'; }
                if (recordType === 'contact') { recordType = 'Contact'; }
                if (recordType === 'campaign') { recordType = 'Campaign'; }

                var where = [];

                if (query) {

                    if (query.email)
                    { where.push('Email=\'' + encodeParam(query.email) + '\''); }

                    if (query.email_endsWith)
                    { where.push('Email+LIKE+\'%25' + encodeParam(query.email_endsWith) + '\''); }

                    if (query.last)
                    { where.push('LastName=\'' + encodeParam(query.last) + '\''); }

                    if (query.first)
                    { where.push('FirstName=\'' + encodeParam(query.first) + '\''); }

                    if (query.middle)
                    { where.push('MiddleName=\'' + encodeParam(query.middle) + '\''); } // The field may be disabled!

                    if (recordType === 'Account') {
                        if (query.company)
                        { where.push('Name+LIKE+\'%25' + encodeParam(query.company) + '%25\''); }
                        if (query.website)
                        { where.push('Website+LIKE+\'%25' + encodeParam(query.website) + '%25\''); }
                    }

                    if (recordType === 'Campaign') {
                        if (query.campaign)
                        { where.push('Name+LIKE+\'%25' + encodeParam(query.campaign) + '%25\''); }
                    }

                }
                var whereStr = where.join('+AND+');
                if (recordType === 'Account') {
                    whereStr = where.join('+OR+');
                }
                if (whereStr) { whereStr = '+WHERE+' + whereStr; } else { whereStr = '+'; }
                console.log(whereStr);

                var fieldsStr = 'Id,Name'; // * is not supported by SOQL SELECT Syntax
                var f;

                if (recordType === 'user') {
                    fieldsStr = 'Id,Name';
                }

                if (recordType === 'Account') {
                    f = [];

                    f.push('ID');

                    if (fields.indexOf('company') > -1) { f.push('Name'); }
                    if (fields.indexOf('website') > -1) { f.push('Website'); }
                    if (fields.indexOf('_createdDate') > -1) { f.push('CreatedDate'); }

                    f.push('BillingCity');
                    f.push('BillingState');

                    fieldsStr = f.join(',');
                }

                if (recordType === 'Contact') {
                    f = [];

                    f.push('ID');

                    if (fields.indexOf('first') > -1) { f.push('FirstName'); }
                    if (fields.indexOf('last') > -1) { f.push('LastName'); }
                    if (fields.indexOf('email') > -1) { f.push('Email'); }
                    //if (fields.indexOf('middle') > -1) { f.push('MiddleName '); }

                    fieldsStr = f.join(',');
                }

                if (recordType === 'Candidate') {
                    f = [];

                    f.push('ID');

                    if (fields.indexOf('first') > -1) { f.push('FirstName'); }
                    if (fields.indexOf('last') > -1) { f.push('LastName'); }
                    if (fields.indexOf('email') > -1) { f.push('Email'); }
                    //if (fields.indexOf('middle') > -1) { f.push('MiddleName '); }

                    fieldsStr = f.join(',');
                }

                if (recordType === 'Campaign') {
                    f = [];

                    f.push('ID');
                    f.push('Name');

                    fieldsStr = f.join(',');
                }

                var headers = { 'Content-type': 'application/json', 'Authorization': 'OAuth ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' };
                var url = store.url + '/services/data/v34.0/query/?q=SELECT+' + fieldsStr + '+FROM+' + recordType + whereStr;

                if (query && query.limit > 0)
                { url = url + '+LIMIT+' + query.limit; }
                else if (query && query.limit === 0)
                { }
                else
                { url = url + '+LIMIT+50'; }

                var config = { method: 'GET', url: url, headers: headers };
                if (debug) { console.log(debug + 'findRecord->config:', config); }

                var allRecords = [];

                var errorHandler = function (response, status) {
                    try {
                        if (debug) { console.error(consolePrefix + functionName + '> Failure Response > ', response); }
                        var msg = '';
                        if (response && response.length > 0) {

                            if (response[0].errorCode === 'INVALID_SESSION_ID') {
                                service.logout(true);
                            }

                            var i = 0;
                            while (i < response.length) {
                                if (response[i].message)
                                { msg += response[i].message + ' '; }
                                i++;
                            }
                        }
                        try { failureCallback('Cannot find Job Science record: (' + (status || '') + ') ' + (msg || response)); } catch (e) { }
                    } catch (e) {
                        console.error(functionName, e.message);
                        failureCallback(e.message);
                    }
                };

                var successHandler = function (response) {
                    try {
                        if (debug) { console.log(consolePrefix + functionName + ' > Success Response > ', response); }

                        allRecords = allRecords.concat(response.records);

                        if (!response.done && response.nextRecordsUrl) {
                            config.url = store.url + response.nextRecordsUrl;
                            $http(config).success(successHandler).error(errorHandler);
                        }
                        else { try { successCallback(allRecords); } catch (e) { } }
                    } catch (e) {
                        console.error(functionName, e.message);
                        failureCallback(e.message);
                    }

                };

                $http(config).success(successHandler).error(errorHandler);

            } catch (e) {
                console.error(functionName, e.message);
                failureCallback(e.message);
            }

        },
        //-- /Search --//


        //-- Auth --//
        //  Authenticate with the service
        //      successCallback: function(authId)
        authenticate: function (credentials, successCallback, failCallback) {
            // https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id= &redirect_uri=
        },

        //  is this client currently authenticated?
        //      return true/false
        isAuthenticated: function () {
        },
        //-- /Auth --//


        //-- Define --//
        //  Get a list of all available entities (lead, contact, account, etc)
        //      successCallback: function(entityList)
        listEntities: function (successCallback, failCallback) {
        },

        //  Get the definition for an entity (field names of a lead or contact)
        //      successCallback: function(entityDefinition)
        defineEntity: function (entity, successCallback, failCallback) {
        },
        //-- /Define --//


        findDuplicates: function (recordType, contact, successCallback, failCallback) {
            const functionName = 'Find Duplicates';
            try {

                if (debug) { console.log(consolePrefix + functionName, recordType, contact); }

                if (typeof store.url === 'undefined') {
                    console.error(functionName + ' > Not initialized > ', store);
                    try { failCallback('Session expired. Please log in.'); } catch (e) { }
                    return;
                }

                var encode = function (s) {
                    if (typeof s === 'undefined') { s = ''; }
                    return s.replace(/'/g, '\\\'');
                };

                if (recordType === 'candidate') { recordType = 'Contact'; }
                if (recordType === 'contact') { recordType = 'Contact'; }

                var fields = 'ID,LastName,FirstName,Email,Company,Phone,Title';
                if (recordType === 'Contact') { fields = 'ID,LastName,FirstName,Email,Title,Phone,Account.Name'; }

                var from = recordType;
                if (recordType === 'Contact')
                { from = 'Contact,Contact.Account'; }

                var where = '';

                var dups = [];

                var reponseHandle = null;
                var returnResponse = function () {
                    try {
                        successCallback({ duplicates: dups });
                    } catch (e) { }
                };

                var query = function (q) {

                    try {

                        //calls Job Science REST API with jQuery
                        jQuery.ajax({
                            type: 'GET',
                            url: store.url + '/services/data/v34.0/query/?q=' + q,
                            beforeSend: function (xhr) {
                                xhr.setRequestHeader('Authorization', 'OAuth ' + store.id);
                                xhr.setRequestHeader('Accept', 'application/json');
                            },
                            success: function (sfdata) {
                                console.log('findDuplicates results', sfdata);

                                if (!sfdata.records)
                                { try { failCallback(); } catch (e) { } }


                                for (var i = 0; i < sfdata.records.length; i++) {
                                    var dup = {};
                                    if (recordType === 'Candidate') { dup = service.fromCandidate(sfdata.records[i]); }
                                    else if (recordType === 'Contact') { dup = service.fromContact(sfdata.records[i]); }
                                    dups.push(dup);
                                }

                                if (reponseHandle) {
                                    window.clearTimeout(reponseHandle);
                                }
                                reponseHandle = window.setTimeout(returnResponse, 2000);

                            },
                            failure: function (error) {
                                console.log('ERROR in findDuplicates', error); // 401 [{"message":"Session expired or invalid","errorCode":"INVALID_SESSION_ID"}]
                                try { failCallback(); } catch (e) { }
                            },
                            xhr: function () {
                                var xhr = new window.XMLHttpRequest();
                                xhr.addEventListener('error', function (evt) {
                                    console.log('XHR Event: an error occured');
                                }, false);
                                xhr.addEventListener('abort', function () {
                                    console.log('XHR Event: cancelled');
                                }, false);
                                return xhr;
                            },
                            error: function (errorResponse) {
                                console.log('AJAX error in request: ' + JSON.stringify(errorResponse || '', null, 2));

                                if (errorResponse && errorResponse.responseJSON && errorResponse.responseJSON.length > 0 && errorResponse.responseJSON[0].errorCode === 'INVALID_SESSION_ID') {
                                    try {
                                        service.logout(true);
                                        service.login(function () {
                                            service.findDuplicates(recordType, contact, successCallback, failCallback);
                                        }, function (error) {
                                            console.error(functionName + ' > Login Failure > ', error);
                                            try { failCallback(error); } catch (e) { }
                                        }, true);
                                    } catch (e) {
                                        console.error(functionName + ' > Relogin Failure > ', e.message);
                                        try { failCallback(e.message); } catch (e) { }
                                    }
                                }
                                else {
                                    try { failCallback(); } catch (e) { }
                                }
                            }
                        })
                        ;

                    } catch (e) {
                        console.log('ERROR in query', e.message);
                        try { failCallback(); } catch (e) { }
                    }

                };


                if (contact.email) {
                    where = 'Email=\'' + encode(contact.email) + '\'';
                    if (recordType === 'Candidate')
                    { where += '+AND+IsConverted=False'; }
                    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
                }

                if (contact.last && contact.first) {
                    where = 'LastName=\'' + encode(contact.last) + '\'+AND+FirstName=\'' + encode(contact.first) + '\'';
                    if (recordType === 'Candidate')
                    { where += '+AND+IsConverted=False'; }
                    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
                }

                //if (contact.phone && contact.last) {
                //    where = 'LastName=\'' + encode(contact.last) + '\'+AND+Phone=\'' + encode(contact.phone) + '\'';
                //    if (recordType === 'Lead')
                //    { where += '+AND+IsConverted=False'; }
                //    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
                //}

                if (contact.email2) {
                    where = 'Email=\'' + contact.email2 + '\'';
                    if (recordType === 'Candidate')
                    { where += '+AND+IsConverted=False'; }
                    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
                }

            } catch (e) {
                console.error(functionName, e.message);
                failCallback(e.message);
            }
        },


        getDetails: function (captureRecord, parentRecordType, successCallback, failCallback) {





            console.log('getDetails', captureRecord);

            var recordId = captureRecord._id;



            var config = { headers: { 'Content-type': 'application/json', 'Authorization': 'OAuth ' + store.id, 'Accept': 'application/json', 'Cache-Control': 'no-cache' } };
            var url = null;

            if (parentRecordType.toLowerCase() === 'candidate') {
                url = store.url + '/services/data/v33.0/query/?q=SELECT LastActivityDate, ' +
                    ' (SELECT ActivityDate, ActivityType, Description, Status, Subject, Owner.Name FROM ActivityHistories LIMIT 10),' +
                    ' (SELECT ActivityDate, Description, Status, Subject, Owner.Name FROM Tasks LIMIT 10)' +
                    ' FROM Contact WHERE Id = \'' + recordId + '\'';
            }
            else if (parentRecordType.toLowerCase() === 'contact') {
                url = store.url + '/services/data/v33.0/query/?q=SELECT LastActivityDate, ' +
                    ' Account.Name, Account.Website, ' +
                    ' (SELECT ActivityDate, ActivityType, Description, Status, Subject, Owner.Name FROM ActivityHistories LIMIT 10),' +
                    ' (SELECT ActivityDate, Description, Status, Subject, Owner.Name FROM Tasks LIMIT 10),' +
                    ' (SELECT Amount, IsClosed, IsWon, CloseDate, LastActivityDate, StageName, Type, Description, Owner.Name FROM Opportunities LIMIT 10)' +
                    ' FROM Contact WHERE Id = \'' + recordId + '\'';
            } else {
                try { failCallback('Cannot retrieve Job Science record type: ' + parentRecordType); } catch (e) { }
                return;
            }

            captureRecord._act = captureRecord._act || {};
            captureRecord._opp = captureRecord._opp || {};

            var parseOpp = function (record) {

                var detailRecord = null;
                var detailRecordId = null;

                if (typeof record.Opportunities === 'object' && record.Opportunities !== null && record.Opportunities.totalSize > 0) {

                    for (var i = 0; i < record.Opportunities.totalSize; i++) {
                        detailRecord = record.Opportunities.records[i];
                        console.log('getDetails->opp', detailRecord);
                        detailRecordId = detailRecord.attributes.url.substring(detailRecord.attributes.url.lastIndexOf('/') + 1);
                        //console.log('***** opp link', detailRecord.attributes.url, detailRecordId, store.url);
                        var a = detailRecord.Amount;
                        var n;
                        if (detailRecord.Amount && detailRecord.Amount > 1000000) {
                            n = Math.round(detailRecord.Amount / 1000000);
                            a = '$' + n + 'K';
                        }
                        else if (detailRecord.Amount && detailRecord.Amount > 1000) {
                            n = Math.round(detailRecord.Amount / 1000);
                            a = '$' + n + 'K';
                        }
                        var opp = {
                            who: detailRecord.Owner.Name,
                            when: detailRecord.LastActivityDate,
                            what: detailRecord.Name + ' ' + a,
                            details: detailRecord.Description,
                            link: store.url + '/' + detailRecordId
                        };

                        if (i === 0) {
                            captureRecord._opp.last = opp;
                        } else {
                            captureRecord._opp.next = opp;
                        }
                    }
                }
            };

            var successHandler2 = function (response) {
                console.log('getDetails->successCallback2', response);

                try {

                    if (response !== null && response.totalSize > 0) {

                        var record = response.records[0];

                        parseOpp(record);

                    }
                } catch (e) {
                    console.log('********************* ERROR in getDetails->successCallback2: ' + e.message);
                }

                console.log('captureRecord = ', captureRecord);

                try { successCallback(captureRecord); } catch (e) { }

            };

            var successHandler = function (response) {
                console.log('getDetails->successCallback', response);

                var suspendCallback = false;

                try {

                    if (response !== null && response.totalSize > 0) {

                        var record = response.records[0];
                        var detailRecord = null;
                        var detailRecordId = null;

                        captureRecord._dt = record.LastActivityDate;

                        if (typeof record.Account === 'object' && record.Account !== null) {
                            detailRecord = record.Account;
                            console.log('*** getDetails->account', detailRecord);
                            captureRecord.company = captureRecord.company || detailRecord.Name;
                            captureRecord.website = captureRecord.website || detailRecord.Website;
                            captureRecord._website = detailRecord.Website;
                            detailRecordId = detailRecord.attributes.url.substring(detailRecord.attributes.url.lastIndexOf('/') + 1);
                            captureRecord._companyLink = store.url + '/' + detailRecordId;
                            console.log('*** getDetails->account->captureRecord', captureRecord);
                            // Query for opportunities
                            if (detailRecordId) {

                                url = store.url + '/services/data/v33.0/query/?q=SELECT ' +
                                   ' (SELECT Name, Amount, IsClosed, IsWon, CloseDate, LastActivityDate, StageName, Type, Description, Owner.Name FROM Opportunities LIMIT 10)' +
                                   ' FROM Account WHERE Id = \'' + detailRecordId + '\'';

                                $http.get(url, config)
                                    .success(successHandler2)
                                    .error(function (response, status) {
                                        var error = 'Cannot retrieve Job Science record';
                                        if (response.message) { error = response.message; }
                                        console.log('ERROR in salesforce.retrieveOppRecord:' + JSON.stringify(response));
                                        try { failCallback('Cannot retrieve Job Science record: (' + status + ') ' + response, status); } catch (e) { }
                                    });

                                suspendCallback = true;

                            }

                        }

                        if (typeof record.ActivityHistories === 'object' && record.ActivityHistories !== null && record.ActivityHistories.totalSize > 0) {
                            detailRecord = record.ActivityHistories.records[0];
                            console.log('*** getDetails->activityRecord', detailRecord);
                            detailRecordId = detailRecord.attributes.url.substring(detailRecord.attributes.url.lastIndexOf('/') + 1);
                            captureRecord._act.last = {
                                who: detailRecord.Owner.Name,
                                when: detailRecord.ActivityDate,
                                what: detailRecord.Subject,
                                details: detailRecord.Description,
                                link: store.url + '/' + detailRecordId
                            };
                        }

                        if (typeof record.Tasks === 'object' && record.Tasks !== null && record.Tasks.totalSize > 0) {
                            detailRecord = record.Tasks.records[record.Tasks.totalSize - 1];
                            console.log('*** getDetails->task', detailRecord);
                            detailRecordId = detailRecord.attributes.url.substring(detailRecord.attributes.url.lastIndexOf('/') + 1);
                            captureRecord._act.next = {
                                who: detailRecord.Owner.Name,
                                when: detailRecord.ActivityDate,
                                what: detailRecord.Subject,
                                details: detailRecord.Description,
                                link: store.url + '/' + detailRecordId
                            };
                        }

                        parseOpp(record);

                        //if (typeof record.Opportunities === 'object' && record.Opportunities !== null && record.Opportunities.totalSize > 0) {
                        //    detailRecord = record.Opportunities.records[record.Opportunities.totalSize - 1];
                        //    console.log('getDetails->opp', detailRecord);
                        //    detailRecordId = detailRecord.attributes.url.substring(detailRecord.attributes.url.indexOf('/Opportunities/') + 15);
                        //    captureRecord._opp.last = {
                        //        who: detailRecord.Owner.Name,
                        //        when: detailRecord.LastActivityDate,
                        //        what: detailRecord.Amount,
                        //        details: detailRecord.Description,
                        //        link: store.url + '/' + detailRecordId
                        //    };
                        //}

                    }
                } catch (e) {
                    console.log('********************* ERROR in getDetails->successCallback: ' + e.message);
                }

                console.log('captureRecord = ', captureRecord);

                if (!suspendCallback) {
                    try { successCallback(captureRecord); } catch (e) { }
                }

            };

            $http.get(url, config)
                .success(successHandler)
                .error(function (response, status) {
                    var error = 'Cannot retrieve Job Science record';
                    if (response.message) { error = response.message; }
                    if (debug) { console.log('salesforce.retrieveRecord:' + JSON.stringify(response)); }
                    try { failCallback('Cannot retrieve Job Science record: (' + status + ') ' + response, status); } catch (e) { }
                });

        },
        // ***********************************
        // ** Job Science-specific functions **
        // ***********************************

        convertStateToJobScienceStateCode: function (state) {

            if (typeof state === 'undefined' || state === null || state === '') {
                return '';
            }

            var key = state.toLowerCase();
            var r = geographyData.stateNameLowerToStateCodeDict[key];
            if (!r) {
                r = state;
            }
            return r.toUpperCase();

        },

        convertCountryToJobScienceCountryCode: function (country) {

            if (typeof country === 'undefined' || country === null || country === '') {
                return '';
            }

            var key = country.toLowerCase();
            var r = geographyData.countryNameLowerToCountryCodeDict[key];
            if (!r) {
                r = country;
            }
            return r.toUpperCase();
        },

        isUSState: geographyData.isUSStateCode,

        limitstr: //backgroundUtility.limitstr,
            function (s, limit) {
                if (!s || !limit) {
                    return s;
                }
                if (s.length > limit) {
                    return s.substring(0, limit);
                }
                return s;
            },


        //var updateRecord = function (id, fields) {

        //    if (debug) { console.log(debug + 'updateRecord', id, angular.copy(fields)); }

        //    //calls JobScience REST API with jQuery
        //    jQuery.ajax({
        //        type: 'PATCH',
        //        url: url + id,
        //        contentType: 'application/json',
        //        dataType: 'json',
        //        data: JSON.stringify(fields),
        //        beforeSend: function (xhr) {
        //            xhr.setRequestHeader('Authorization', 'OAuth ' + store.id);
        //            xhr.setRequestHeader('Accept', 'application/json');
        //        },
        //        success: function (successResponse) {
        //            handleSuccess(successResponse);
        //        },
        //        error: function (errorResponse) {
        //            handleError(errorResponse, f);
        //        }
        //    });

        //};

        /**
        * @function validateRecord
        * @description Validates if record can be exported. Returns list of errors.
        * @memberOf captureApp.webServices.exportTargetVer1.salesforce
        * @param {recordType} recordType - Record type
        * @param {captureContact} captureRecord - Source Capture Contact. 
        */
        validateRecord: function (recordType, captureRecord) {

            var errors = [];

            if (!captureRecord) {
                errors.push('Record does not exist');
            } else {
                if (!captureRecord.last) {
                    errors.push('Last name is required');
                }
            }

            return errors;
        }

    };
    return service;
}]);
/**
 * @class captureApp.webServices.exportTargetVer1.pipeliner
 * @memberOf captureApp.webServices.exportTargetVer1
 * @description This is Pipeliner AngularJS service.
 * @constructor
 * @param {object} $http - Angular HTTP service.
 * @param {object} $q - jQuery.
 * @param {object} endpoints - Capture enpoints service.
 * @param {object} dialogs - Capture dialogs service.
 */

/**********************************************************************
* PC Recruiter AngularJS service
* Author: Justin Stull  
* Email: jstull@ringlead.com
* Version: 0.0.1

failCallback: function( errorMessage, statusCode (optional), other (optional) )

Minimum implementation:

- createRecord
- isLoggedIn
- login

**********************************************************************/
'use strict';

/* global angular: false */
/* global jQuery: false */
/* global geographyData: false */
/* global backgroundUtility: false */

angular.module('webServices')
.factory('pcrecruiter', ['$http', '$q', 'endpoints', 'dialogs', function ($http, $q, endpoints, dialogs) {

    var debug = 'pcrecruiter.js->';
    var defaultUrl = 'https://pcrecruiter.net';
    var store = {};
    var apiKey = 'fb1b376c2da9b062e49f7da0a3239ebb';
    var appId = '3823a7f1';

    /* Builds basic PC Recruiter REST url from provided Service URL and Team Pipeline ID*/
    var buildUrl = function (serviceUrl, body) {
        return serviceUrl + '/rest/api/' + body;
    };

    var getVenue = function (contact, filter) {
        if (contact.venues) {
            var i;
            for (i = 0; i < contact.venues.length; i++) {
                var w = contact.venues[i].website;
                console.log('*** VENUE ***', w);
                if (w && w.indexOf(filter) >= 0) {
                    return w;
                }
            }
        }
        return null;
    };
    var getCustomFieldValue = function (contact, fieldName) {
        if (contact.CustomFields) {
            var i;
            for (i = 0; i < contact.CustomFields.length; i++) {
                var w = contact.CustomFields[i].Values[0];
                if (w !== undefined && contact.CustomFields[i].FieldName === fieldName) {
                    return w;
                }
            }
        }
        return null;
    };



    /* Handles error response from PCRecruiter SAPI. It should try to return string message if provided. 
    *
    * r - HTTP response
    * asJson - if true, then error message will returns as JSON object, otherwise as String.
    */
    var handleErrorMessageText = function (r, asJson) {
        var status = r.status || 500;
        var msg = '';
        if (r.responseJSON) { msg = r.responseJSON; }
        else if (r.responseText) {
            try {
                msg = JSON.parse(r.responseText);
            } catch (err) {
                msg = r.responseText;
            }
        } else if (r.statusText) {
            msg = r.statusText;
        } else {
            msg = 'Unknown error';
        }
        if (asJson !== undefined) {
            return msg;
        } else {
            if (msg.hasOwnProperty('message')) { msg = msg.message; }
            return msg;
        }
    };

    var getDomain = function (website) {
        var regex = /([a-z0-9-]+)([.]([a-z]{1,3})(?![a-z-])){1,2}/ig;
        var d = regex.exec(website);
        if (d && d.length > 0) { d = d[0]; }
        if (d && d.length > 0) { d = d.toLowerCase(); }
        console.log('domain', d, 'website', website);
        return d;
    };

    var mapField = function (source, sourceKey, target, targetKey) {
        target[targetKey] = source[sourceKey];
    };
    var mapFromField = function (target, targetKey, source, sourceKey) {
        mapField(source, sourceKey, target, targetKey);
    };
    var toContact = function (captureRecord) {

        console.log('000000000000000000 TO CONTACT 000000000000000000');

        if (debug) {
            console.log(debug + 'toContact:in', captureRecord);
        }

        var nativeRecord = {};
        nativeRecord.CustomFields = [];
        mapField(captureRecord, 'first', nativeRecord, 'FirstName');
        mapField(captureRecord, 'last', nativeRecord, 'LastName');
        mapField(captureRecord, 'jobtitle', nativeRecord, 'Title');
        mapField(captureRecord, 'email', nativeRecord, 'EmailAddress');
        mapField(captureRecord, 'phone', nativeRecord, 'WorkPhone');
        mapField(captureRecord, 'phone2', nativeRecord, 'MobilePhone');
        mapField(captureRecord, 'bio', nativeRecord, 'Notes');
        mapField(captureRecord, 'address1', nativeRecord, 'Address');
        mapField(captureRecord, 'city', nativeRecord, 'City');
        mapField(captureRecord, 'state', nativeRecord, 'State');
        mapField(captureRecord, 'zip', nativeRecord, 'PostalCode');
        mapField(captureRecord, 'country', nativeRecord, 'Country');

        nativeRecord.CustomFields.push({
            'FieldName': 'Referrer',
            'FieldType': '',
            'Values': ['Broadlook Capture']
        });

        nativeRecord.CustomFields.push({
            'FieldName': 'ReferrerSource',
            'FieldType': '',
            'Values': ['Broadlook Capture']
        });

        nativeRecord.CustomFields.push({
            'FieldName': 'Referrerdomain',
            'FieldType': '',
            'Values': [getDomain(captureRecord.sourceurl)]
        });

        if (captureRecord.linkedin) {
            nativeRecord.CustomFields.push({
                'FieldName': 'Social_LinkedIn',
                'FieldType': '',
                'Values': [captureRecord.linkedin]
            });
        }

        if (captureRecord.facebook) {
            nativeRecord.CustomFields.push({
                'FieldName': 'Social_Facebook',
                'FieldType': '',
                'Values': [captureRecord.facebook]
            });
        }

        if (captureRecord.twitter) {
            nativeRecord.CustomFields.push({
                'FieldName': 'Social_Twitter',
                'FieldType': '',
                'Values': [captureRecord.twitter]
            });
        }

        if (captureRecord.googlePlus) {
            nativeRecord.CustomFields.push({
                'FieldName': 'Social_GooglePlus',
                'FieldType': '',
                'Values': [captureRecord.googlePlus]
            });
        }

        if (captureRecord.myspace) {
            nativeRecord.CustomFields.push({
                'FieldName': 'Social_MySpace',
                'FieldType': '',
                'Values': [captureRecord.myspace]
            });
        }

        if (captureRecord.pinterest) {
            nativeRecord.CustomFields.push({
                'FieldName': 'Social_Pinterest',
                'FieldType': '',
                'Values': [captureRecord.pinterest]
            });
        }

        if (captureRecord.myLife) {
            nativeRecord.CustomFields.push({
                'FieldName': 'Social_MyLife',
                'FieldType': '',
                'Values': [captureRecord.myLife]
            });
        }

        if (captureRecord.xing) {
            nativeRecord.CustomFields.push({
                'FieldName': 'Social_Xing',
                'FieldType': '',
                'Values': [captureRecord.xing]
            });
        }

        if (debug) {
            console.log(debug + 'toContact:out', nativeRecord);
        }

        return nativeRecord;
    };


    var fromContact = function (nativeRecord) {

        if (debug) {
            console.log(debug + 'fromContact:in', nativeRecord);
        }

        var captureRecord = {};
        captureRecord.venues = [];

        mapFromField(captureRecord, 'first', nativeRecord, 'FirstName');
        mapFromField(captureRecord, 'last', nativeRecord, 'LastName');
        mapFromField(captureRecord, 'jobtitle', nativeRecord, 'Title');
        mapFromField(captureRecord, 'email', nativeRecord, 'EmailAddress');
        mapFromField(captureRecord, 'phone', nativeRecord, 'WorkPhone');
        mapFromField(captureRecord, 'phone2', nativeRecord, 'MobilePhone');
        mapFromField(captureRecord, 'bio', nativeRecord, 'Notes');
        mapFromField(captureRecord, 'address1', nativeRecord, 'Address');
        mapFromField(captureRecord, 'city', nativeRecord, 'City');
        mapFromField(captureRecord, 'state', nativeRecord, 'State');
        mapFromField(captureRecord, 'zip', nativeRecord, 'PostalCode');
        mapFromField(captureRecord, 'country', nativeRecord, 'Country');

        var socialEndpoints = {
            linkedin: getCustomFieldValue(nativeRecord, 'Social_LinkedIn'),
            facebook: getCustomFieldValue(nativeRecord, 'Social_Facebook'),
            twitter: getCustomFieldValue(nativeRecord, 'Social_Twitter'),
            googlePlus: getCustomFieldValue(nativeRecord, 'Social_GooglePlus'),
            myspace: getCustomFieldValue(nativeRecord, 'Social_MySpace'),
            pinterest: getCustomFieldValue(nativeRecord, 'Social_Pinterest'),
            myLife: getCustomFieldValue(nativeRecord, 'Social_MyLife'),
            xing: getCustomFieldValue(nativeRecord, 'Social_Xing')
        };

        if (socialEndpoints.linkedin) {
            captureRecord.venues.push({ website: socialEndpoints.linkedin, type: 'social' });
        }
        console.log(socialEndpoints.facebook);
        if (socialEndpoints.facebook !== null) {
            captureRecord.venues.push({ website: socialEndpoints.facebook, type: 'social' });
        }
        if (socialEndpoints.twitter) {
            captureRecord.venues.push({ website: socialEndpoints.twitter, type: 'social' });
        }
        if (socialEndpoints.googlePlus) {
            captureRecord.venues.push({ website: socialEndpoints.googlePlus, type: 'social' });
        }
        if (socialEndpoints.myspace) {
            captureRecord.venues.push({ website: socialEndpoints.myspace, type: 'social' });
        }
        if (socialEndpoints.pinterest) {
            captureRecord.venues.push({ website: socialEndpoints.pinterest, type: 'social' });
        }
        if (socialEndpoints.myLife) {
            captureRecord.venues.push({ website: socialEndpoints.myLife, type: 'social' });
        }
        if (socialEndpoints.xing) {
            captureRecord.venues.push({ website: socialEndpoints.xing, type: 'social' });
        }
        if (debug) {
            console.log(debug + 'fromContact:venues', captureRecord.venues);
        }

        //mapFromField(captureRecord, 'sourceurl', nativeRecord, 'LinkedIn');
        //https://us.pipelinersales.com/rest_services/v1/us_BroadlookTechnologies1/Contacts/PY-7FFFFFFF-1DEAC92D-7169-465D-80D7-04B2ABD1DF16
        captureRecord._link = 'https://www2.pcrecruiter.net/pcrbin/editna.exe?i=' + store.username + '&i=' + nativeRecord.CandidateId + '&pcr-id=' + store.authId;
        captureRecord._type = 'Contact';
        captureRecord._id = nativeRecord.CandidateId;

        if (debug) {
            console.log(debug + 'fromContact:out', captureRecord);
        }

        return captureRecord;
    };


    /*
    * Returns default HTTP request template.
    *
    * method - called PCRecruiter REST method
    */
    var buildRequest = function (method, successCallback, failCallback) {
        return {
            type: 'GET',
            contentType: 'application/json',
            crossDomain: true,
            success: function (successResponse, textStatus, xhr) {
                successCallback(successResponse, textStatus, xhr);
            },
            error: function (errorResponse) {
                var response = handleErrorMessageText(errorResponse);
                failCallback(response, errorResponse.status || 500);
            }
        };
    };

    var service = {


        /**
        * @function getName
        * @description Return name of export target.
        * @memberOf captureApp.webServices.exportTargetVer1.pcrecruiter
        */
        getName: function () {

            return 'PCRecruiter';
        },


        /**
        * @function init
        * @description Initializes store object. Sets user credentials, owner and team pipeline id.
        * @memberOf captureApp.webServices.exportTargetVer1.pcrecruiter
        * @param {object} o - List of target-specific settings.
        */
        init: function (o) {

            if (debug) { console.log(debug + 'Initializing Login ...'); }
            console.log(o);
            store.username = encodeURIComponent(o.username);
            store.password = encodeURIComponent(o.password);
            store.pcrDatabaseId = o.pcrDatabaseId;

            console.log('STORE PASSWORD ->> ', store.password);
        },


        /**
        * @function login
        * @description Logs user in. Either silently (if possible) or interactively.
        * There is need to provide Username, Password, Database ID, API Key and App ID.
        * Follow 'http://www.pcrecruiter.net/apidocs_v2/ to see how to obtain the API key and App ID.
        * @memberOf captureApp.webServices.exportTargetVer1.pcrecruiter
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - This callback informs that user was logged in successfully. 
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback - This callback informs that user cannot log in.
        */
        login: function (successCallback, failCallback, silent) {

            if (debug) { console.log(debug + 'Logging into PCRecruiter...'); }

            var username = store.username;
            var password = store.password;
            var pcrDatabaseId = store.pcrDatabaseId;

            var urlBody = 'access-token?DatabaseId=' + pcrDatabaseId + '&Username=' + username + '&Password=' + password + '&AppId=' + appId + '&ApiKey=' + apiKey;

            if (!username || !password || !pcrDatabaseId) {
                try { failCallback('Please open Settings and enter your user credentials'); } catch (e) { }
                return;
            }

            var openTab = function () {
                try {
                    // TODO validate the assumption that any pcrDatabaseId contains uid (before period) and that the url form is the same for all PCR users/orgs 
                    var uid = store.pcrDatabaseId.split('.')[0];
                    chrome.tabs.create({ url: 'https://www2.pcrecruiter.net/pcr.asp?uid=odbc.' + uid }, function () { });
                } catch (e) {

                }
            };

            var request = buildRequest('', successCallback, failCallback);
            request.url = buildUrl(defaultUrl, urlBody);
            request.success = function (successResponse, status, xhr) {
                var response = successResponse.SessionId;
                store.authId = response;

                if (silent === false) {
                    openTab();
                }
                successCallback(response);
            };
            jQuery.ajax(request);
            //$http
            //    .get(request.url)
            //    .success(function (response) { request.success(response); })
            //    .error(function (data, status, headers, config) {
            //        openTab();
            //    });
        },

        /**
         * @function logout
         * @description Logs user out. Cleans up store variable.I
         * @memberOf captureApp.webServices.exportTargetVer1.pcrecruiter
         */
        logout: function () {

            var urlBody = 'access-token?SessionId=' + store.authId + '&AppId=' + appId + '&ApiKey=' + apiKey;

            var request = buildRequest('', function () { }, function () { });

            request.url = buildUrl(defaultUrl, urlBody);
            request.type = 'DELETE';
            jQuery.ajax(request);
            store = {};
            if (debug) { console.log(debug + 'Logged out...'); }
        },


        /**
         * @function isLoggedIn
         * @description Checks if user is logged in.
         * @memberOf captureApp.webServices.exportTargetVer1.pcrecruiter
         * @param {captureApp.webServices.exportTargetVer1~isLoggedInSuccessCallback} successCallback - This callback informs that user is currently logged in.
         * @param {captureApp.webServices.exportTargetVer1~isLoggedInFailCallback} failCallback - This callback informs that user is not currently logged in.
         */
        isLoggedIn: function (successCallback, failCallback) {

            var isLogged = store.authId !== undefined ? true : false;

            if (debug) { console.log(debug + 'isLogged', isLogged); }

            if (!isLogged) {
                // Since we can do it... Do silent login.
                service.login(successCallback, failCallback);
            }
            else { try { successCallback(); } catch (e) { } }
        },


        /**
       * @function createRecord
       * @description Creates record.
       * @memberOf captureApp.webServices.exportTargetVer1.pcrecruiter
       * @param {recordType} recordType - Destination Record Type
       * @param {captureContact} captureRecord - Source Capture Record.
       * @param {object} createOptions - Options (For future use)
       * @param {captureApp.webServices.exportTargetVer1~createRecordSuccessCallback} successCallback 
       * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback
       */
        createRecord: function (recordType, captureRecord, createOptions, successCallback, failCallback) {


            if (debug) { console.log(debug + 'createRecord', captureRecord); }

            var createContact = function (nativeRecordType) {


                var record = {
                    'FirstName': (captureRecord.first || ''),
                    'LastName': (captureRecord.last || ''),
                    'EmailAddress': (captureRecord.email || ''),
                    'Title': (captureRecord.jobtitle || ''),
                    'WorkPhone': (captureRecord.phone || ''),
                    'MobilePhone': (captureRecord.phone2 || ''),
                    'Notes': 'Created by Broadlook Capture!' + '\n\n' + (captureRecord.bio || ''),
                    'Address': (captureRecord.address1 || '') + '\n' + (captureRecord.address2 || ''),
                    'City': (captureRecord.city || ''),
                    'State': (captureRecord.state || ''),
                    'PostalCode': (captureRecord.zip || ''),
                    'Country': (captureRecord.country || ''),
                    'CustomFields': [
                        {
                            'FieldName': 'ReferrerSource',
                            'FieldType': '',
                            'Values': ['Added by Broadlook Capture']
                        },
                        {
                            'FieldName': 'Referrer',
                            'FieldType': '',
                            'Values': ['Added by Broadlook Capture']
                        },
                        {
                            'FieldName': 'ReferrerDomain',
                            'FieldType': '',
                            'Values': [getDomain(captureRecord.sourceurl)]
                        },
                        {
                            'FieldName': 'Email_Other',
                            'FieldType': '',
                            'Values': [(captureRecord.email2 || '')]
                        },
                        {
                            'FieldName': 'Social_LinkedIn',
                            'FieldType': '',
                            'Values': [(getVenue(captureRecord, 'linkedin.com') || '')]
                        },
                        {
                            'FieldName': 'Social_Twitter',
                            'FieldType': '',
                            'Values': [(getVenue(captureRecord, 'twitter.com') || '')]
                        },
                        {
                            'FieldName': 'Social_Facebook',
                            'FieldType': '',
                            'Values': [(getVenue(captureRecord, 'facebook.com') || '')]
                        },
                        {
                            'FieldName': 'Social_GooglePlus',
                            'FieldType': '',
                            'Values': [(getVenue(captureRecord, 'google.com') || '')]
                        },
                        {
                            'FieldName': 'Social_MySpace',
                            'FieldType': '',
                            'Values': [(getVenue(captureRecord, 'myspace.com') || '')]
                        },
                        {
                            'FieldName': 'Social_Pinterest',
                            'FieldType': '',
                            'Values': [(getVenue(captureRecord, 'pinterest.com') || '')]
                        },
                        {
                            'FieldName': 'Social_MyLife',
                            'FieldType': '',
                            'Values': [(getVenue(captureRecord, 'mylife.com') || '')]
                        },
                        {
                            'FieldName': 'Social_Xing',
                            'FieldType': '',
                            'Values': [(getVenue(captureRecord, 'xing.com') || '')]
                        }

                    ]
                };

                if (createOptions && createOptions.mappedProperties) {
                    var j = createOptions.mappedProperties.length;
                    while (j--)
                    { record[createOptions.mappedProperties[j].name] = createOptions.mappedProperties[j].value; }
                }

                if (debug) { console.log(debug + 'post', angular.copy(record)); }

                //var successCallback2 = function (successResponse, textStatus, xhr) {

                //if (debug) { console.log(debug + 'response', successResponse); }
                /*var urlBody = 'candidates';
                var request = buildRequest(nativeRecordType, successCallback, failCallback);
                request.beforeSend = function (xhr) {
                    xhr.setRequestHeader('Authorization', 'BEARER ' + store.authId);
                request.url = buildUrl(defaultUrl, urlBody);
                request.type = 'POST';
                request.data = JSON.stringify(record);
                jQuery.ajax(request);*/

                var url = buildUrl(defaultUrl, 'candidates');

                var config = {
                    headers: {
                        'Authorization': 'BEARER ' + store.authId
                    }
                };

                $http.post(url, record, config)
                    .success(function (data, status, headers, config) {
                        if (debug) { console.log(debug + 'response', data, status); }
                        var id = data.CandidateId;
                        //https://www2.pcrecruiter.net/pcrbin/editna.exe?i=ADMIN&i=112989394441873&i=List&i=153172544917257&i=Edit&i=3%2F13%2F2015%2011:30:41%20AM&i=7&i=8&i=9&i=&pcr-id=lqd1cK4ZIMDUIh9teyKTeoHazrDUnxqp3hCac6qtOfu4lQefyDnWn%2BJ9XqpPlxgw9uztSKO%2F1vsK
                        //https://www2.pcrecruiter.net/pcrbin/editna.exe?username=ADMIN&nameGUID=112989394441873&menuSelection=xyz&pageLayout=&i5=xyz&i6=NEWACT&i7=&baseurl=&authresult=&databaseName=&pcr-id=1XOCgeYgn6jzu9P4vCaQc3lLdQhHQiZIXaAJYkp6X%2FrrT%2BxIiZaG%2BFb%2FvoYuGOVEqlQEF4aH5msH
                        // pcr-id is our authId... will be different every session TODO: Open link should grab fresh one every time (contact.ui.js)
                        var link = 'https://www2.pcrecruiter.net/pcrbin/editna.exe?i=' + store.username + '&i=' + id + '&pcr-id=' + store.authId;
                        console.log('**** LINK', link);
                        try { successCallback(link, id); } catch (e) { }
                    })
                    .error(function (data, status, headers, config) {
                        console.log(debug + 'ERROR in POST', data, status, headers, config);
                        try { failCallback(); } catch (e) { }
                    });

            };

            var createCompany = function (nativeRecordType) {


                var record = {
                    'CompanyName': (captureRecord.company || ''),
                    'Phone': (captureRecord.phone || ''),
                    'Address': (captureRecord.address1 || '') + '\n' + (captureRecord.address2 || ''),
                    'City': (captureRecord.city || ''),
                    'State': (captureRecord.state || ''),
                    'PostalCode': (captureRecord.zip || ''),
                    'Country': (captureRecord.country || '')
                };

                if (debug) { console.log(debug + 'post', angular.copy(record)); }

                var successCallback2 = function (successResponse, textStatus, xhr) {

                    if (debug) { console.log(debug + 'response', successResponse); }

                    var id = successResponse.CompanyId;
                    var link = '';

                    try { successCallback(link, id); } catch (e) { }
                };
                var urlBody = 'companies';
                var request = buildRequest(nativeRecordType, successCallback2, failCallback);
                request.beforeSend = function (xhr) {
                    xhr.setRequestHeader('Authorization', 'BEARER ' + store.authId);
                };
                request.url = buildUrl(defaultUrl, urlBody);
                request.type = 'POST';
                request.data = JSON.stringify(record);

                jQuery.ajax(request);
            };

            if (recordType.toUpperCase() === 'CONTACT') {
                createContact('Contacts');
            } else if (recordType.toUpperCase() === 'ACCOUNT') {
                createCompany('Account');
            } else {
                failCallback('Invalid record type: ' + (recordType || 'Null'));
            }

        },


        /**
        * @function updateRecord
        * @description Updates record.
        * @memberOf captureApp.webServices.exportTargetVer1.pcrecruiter
        * @param {string} recordId - Record ID
        * @param {recordType} recordType - Record Type ('lead', 'contact' or 'account')
        * @param {object} record - Native record. Include only fields to be updated. 
        * @param {captureApp.webServices.exportTargetVer1~updateRecordSuccessCallback} successCallback 
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback
        */
        updateRecord: function (recordId, recordType, record, successCallback, failCallback) {


            if (debug) { console.log(debug + 'updateRecord', recordId, recordType, record); }

            var updateContact = function (nativeRecordType) {

                if (debug) { console.log(debug + 'post', angular.copy(record)); }

                var successCallback2 = function (successResponse, textStatus, xhr) {

                    if (debug) { console.log(debug + 'response', successResponse); }

                    try { successCallback(recordId); } catch (e) { }
                };

                var buildRequest2 = function (method, id, successCallback, failCallback) {
                    var urlBody = 'candidates';
                    return {
                        type: 'GET',
                        url: buildUrl(defaultUrl, urlBody) + '/' + id,
                        contentType: 'application/json',
                        crossDomain: true,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'BEARER ' + store.authId);
                        },
                        success: function (successResponse, textStatus, xhr) {
                            successCallback(successResponse, textStatus, xhr);
                        },
                        error: function (errorResponse) {
                            var response = handleErrorMessageText(errorResponse);
                            failCallback(response, errorResponse.status || 500);
                        }
                    };
                };

                var request = buildRequest2(nativeRecordType, recordId, successCallback2, failCallback);
                request.type = 'PUT';
                request.data = JSON.stringify(record);

                jQuery.ajax(request);
            };

            if (recordType.toUpperCase() === 'CONTACT') {
                updateContact('Contacts');
            } else {
                failCallback('Invalid record type');
            }

        },

        //  From CRM object to lookup object (each object is defined as {label: '', link: ''})
        toLookupObject: function (crmObject, entityType) {
            //if (debug) { console.log(debug + 'toLookupObject->entityType', entityType, '->crmObject', crmObject); }


            var lookupObject = { label: '', link: '' };

            try {
                if (entityType.toLowerCase() === 'account') {
                    var cityState = '';
                    if (crmObject && (crmObject.City || crmObject.State)) {
                        cityState = ' (' + (crmObject.City || '') + ((crmObject.City && crmObject.State) ? ', ' : '') + (crmObject.State || '') + ')';
                    }
                    lookupObject.label = (crmObject.CompanyName || '(no name)') + cityState;
                    lookupObject.link = 'https://www2.pcrecruiter.net/pcrbin/editco.exe?i=' + store.username + '&i=' + crmObject.CompanyId + '&pcr-id=' + store.authId;
                    lookupObject.id = crmObject.CompanyId;
                }
            } catch (e) {
                console.log('ERROR in toLookupObject', e.message);
            }

            //if (debug) { console.log(debug + 'toLookupObject->result', lookupObject); }
            return lookupObject;
        },

        /**
        * @function getRequiredLookups
        * @description Returns an array of lookups required prior to saving a record .
        * @memberOf captureApp.webServices.exportTargetVer1.pcrecruiter
        * @param {recordType} recordType - Record type 
        * @return {captureApp.webServices.exportTargetVer1~lookup[]}
        */
        getRequiredLookups: function (entityType, actualMap) {



            entityType = entityType.toLowerCase();

            if (actualMap) {

                if (debug) { console.log(debug + 'getRequiredLookups->map', actualMap); }

                var aa = [];

                // convert map def to lookup def

                for (var i = 0, l = actualMap.fields.length; i < l; i++) {
                    var f = actualMap.fields[i];
                    if (f.source && (f.source.type === 'lookup' || f.source.type === 'picklist' || f.source.type === 'action')) {

                        if (f.source && f.source.value && f.source.value.enabled === false) {
                            console.log('disabled action', angular.copy(f));
                            continue;
                        }

                        var a;

                        if (f.source.value) {
                            a = {
                                crmProperty: f.target.name,
                                appProperty: f.source.value.appProperty,
                                message: f.source.value.message,
                                type: f.source.value.type,
                                defaultValue: f.source.value.defaultValue ? { id: f.source.value.defaultValue.value, label: f.source.value.defaultValue.label } : null,
                                required: f.source.value.required,
                                allowNew: f.source.value.allowNew,
                                picklist: f.source.value.picklist || f.source.type === 'picklist',
                                resolve: f.source.value.resolve,
                                hidden: f.source.value.hidden
                            };
                        } else {
                            a = {
                                crmProperty: f.target.name,
                                appProperty: '',
                                message: '',
                                type: '',
                                defaultValue: '',
                                required: false,
                                allowNew: false,
                                picklist: f.source.type === 'picklist',
                                resolve: null,
                            };
                        }

                        if (f.source.type === 'picklist') {
                            a.type = entityType;
                            a.allowNew = false;
                        }


                        aa.push(a);
                    }
                }

                if (debug) { console.log(debug + 'getRequiredLookups->result', aa); }

                return aa;
            }

            if (entityType === 'contact') {



                return [{ crmProperty: 'CompanyId', appProperty: 'company', message: 'Select Company', type: 'Account', required: false, allowNew: true, resolve: 'createNewAccount', noLabel: 'Default for Candidates' }
                    //,
                    //    { crmProperty: 'OwnerId', appProperty: 'full', message: 'Select account owner', type: 'SystemUser', required: false, allowNew: false }
                ];
            }
            if (entityType === 'lead') {
                //return [{
                //    crmProperty: 'Campaign', appProperty: 'campaign', message: 'Select Campaign', type: 'Campaign', required: false, allowNew: false,
                //    resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //        service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    },
                //}, {
                //    crmProperty: 'LeadSource', appProperty: null, message: 'Select Lead Source', type: 'Lead', required: true, allowNew: false,
                //    picklist: true//,
                //    //resolve: function (service, lookupId, objectId, successCallback, failCallback) {
                //    //    console.log('resolve called', lookupId, objectId)
                //    //    //service.createRecord({ type: 'CampaignMember', record: { CampaignId: lookupId, LeadId: objectId } }, successCallback, failCallback);
                //    //},
                //}];
            }
            if (entityType === 'account') { return []; }
            return [];
        },

        resolveLookup: function (actionId, lookupId, objectId, successCallback, failCallback) {


            console.log(debug + 'resolveLookup->action->', actionId);
            console.log(debug + 'resolveLookup->lookup->', lookupId);
            console.log(debug + 'resolveLookup->object->', objectId);

            if (actionId === 'createNewAccount') {

                console.log('NEW ACCOUNT', lookupId);

                if (!lookupId.newName) {
                    // existing account, quit
                    try { successCallback(); } catch (e) { }
                    return;
                }

                var createSourceRecord = angular.copy(lookupId.record);
                createSourceRecord.company = lookupId.newName;

                service.createRecord('Account', createSourceRecord, null,

                    // created successfully
                    function (accountLink, accountId) {
                        console.log('account was created', accountLink, accountId);
                        var updateData = {};
                        updateData[lookupId.crmProperty] = accountId;
                        // update the new candidate
                        service.updateRecord(objectId, 'Contact', updateData, successCallback, failCallback);
                    },

                    // create failed
                    function (msg) {
                        console.log('account was not created', msg);
                        failCallback('Account was not created');
                    }

                );

            } else {

                console.log('ERROR: Unknown action', lookupId);
                failCallback('Unknown action');

            }

        },


        /**
        * @function getDefaultExportMaps
        * @description (Reserved for future use) Return an empty array. 
        * maps: [ {captureField: { name: '', label: '' }, crmField: { name: '', label: '' } } ]
        * @memberOf captureApp.webServices.exportTargetVer1.pipeliner
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback  - pass the empty array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback 
        */
        getDefaultExportMaps: function (successCallback, failureCallback) {


            var maps = [];

            //maps.push({ name: 'contact', label: 'Contact', map: null });

            successCallback(maps);
        },


        /**
        * @function getDefinition
        * @description Returns configuration for Multi-Merge dialog. 
        * How to modify:
        * 1. Put native field names in def.fields.map.{Field}.id
        * 2. Remove lines that do not have corresponding native fields, or where fields are read-only
        * @memberOf captureApp.webServices.exportTargetVer1.pipeliner
        * @param {string} recordType - 'lead', 'contact' or 'account'. 
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback  - pass the empty array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback 
        */
        getDefinition: function (recordType, successCallback, failureCallback) {



            if (debug) { console.log(debug + 'getDefinition', recordType); }


            var def = {};
            recordType = recordType.toLowerCase();
            /*if (recordType === 'lead') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { display: 'First Name', group: 'G1' },
                            'LastName': { display: 'Last Name', group: 'G1' },
                            'Title': { display: 'Job Title', group: 'G1' },
                            'Company': { display: 'Company', group: 'G1' },
                            'Email': { display: 'Email', group: 'G1' },
                            'Phone': { display: 'Phone', group: 'G1' },
                            'MobilePhone': { display: 'Mobile Phone', group: 'G1' },
                            'Website': { display: 'Website', group: 'G1' },
                            'Description': { display: 'Description', group: 'G1' },

                            'Street': { display: 'Street', group: 'G2' },
                            'City': { display: 'City', group: 'G2' },
                            'State': { display: 'State/Province', group: 'G2' },
                            'PostalCode': { display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { display: 'Country', group: 'G2' },
                        }
                    }
                };

            } else*/ if (recordType === 'contact') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'MobilePhone', 'Description', 'Linkedin', 'Facebook', 'Twitter', 'GooglePlus', 'Myspace', 'Pinterest', 'MyLife', 'Xing'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Email', 'Phone', 'MobilePhone', 'Description', 'Linkedin', 'Facebook', 'Twitter', 'GooglePlus', 'Myspace', 'Pinterest', 'MyLife', 'Xing', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { id: 'FirstName', display: 'First Name', group: 'G1' },
                            'LastName': { id: 'LastName', display: 'Last Name', group: 'G1' },
                            'Title': { id: 'Title', display: 'Position', group: 'G1' },
                            //'Company': { id: 'QUICK_ACCOUNT_NAME', display: 'Company', group: 'G1' },
                            'Email': { id: 'EmailAddress', display: 'Email 1', group: 'G1' },
                            'Phone': { id: 'WorkPhone', display: 'Work Phone', group: 'G1' },
                            'MobilePhone': { id: 'MobilePhone', display: 'Phone 2', group: 'G1' },
                            //'Website': { id: 'Website', display: 'Website', group: 'G1' },
                            'Description': { id: 'Notes', display: 'Comments', group: 'G1' },
                            'Linkedin': { id: 'linkedin', display: 'Linkedin', group: 'G1' },
                            'Facebook': { id: 'facebook', display: 'Facebook', group: 'G1' },
                            'Twitter': { id: 'twitter', display: 'Twitter', group: 'G1' },
                            'GooglePlus': { id: 'googlePlus', display: 'Google+', group: 'G1' },
                            'Myspace': { id: 'myspace', display: 'Myspace', group: 'G1' },
                            'Pinterest': { id: 'pinterest', display: 'Pinterest', group: 'G1' },
                            'MyLife': { id: 'myLife', display: 'My Life', group: 'G1' },
                            'Xing': { id: 'xing', display: 'Xing', group: 'G1' },

                            'Street': { id: 'Address', display: 'Address', group: 'G2' },
                            'City': { id: 'City', display: 'City', group: 'G2' },
                            'State': { id: 'State', display: 'State/Province', group: 'G2' },
                            'PostalCode': { id: 'PostalCode', display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { id: 'Country', display: 'Country', group: 'G2' }
                        }
                    }
                };
            } else {
                failureCallback('Invalid record type');
            }
            successCallback(def);
        },


        /**
        * @function toNativeRecord
        * @description Converts Capture Contact to native record. 
        * @memberOf captureApp.webServices.exportTargetVer1.pipeliner
        * @param {captureContact} captureRecord - Capture Contact
        * @param {recordType} recordType - Record type. 
        * @return {object} - Native record
        */
        toNativeRecord: function (captureRecord, recordType) {


            recordType = recordType.toLowerCase();
            if (recordType === 'contact') { return toContact(captureRecord); }
            return null;
        },


        /**
        * @function fromNativeRecord
        * @description Converts native record to Capture Contact. 
        * @memberOf captureApp.webServices.exportTargetVer1.pipeliner
        * @param {object} nativeRecord - Native record
        * @param {recordType} recordType - Record type. 
        * @return {captureContact} - Capture Contact
        */
        fromNativeRecord: function (nativeRecord, recordType) {


            recordType = recordType.toLowerCase();
            if (recordType === 'contact') { return fromContact(nativeRecord); }
            return null;
        },


        /**
        * @function findDuplicates
        * @description Returns an array of duplicate records of given type.
        * @memberOf captureApp.webServices.exportTargetVer1.pipeliner
        * @param {captureContact} recordType - Record type. 
        * @param {captureContact} captureRecord - Source Capture Contact. 
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - Pass the resulting array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback  
        * @return {captureContact[]} - Array of Capture Contacts
        */
        findDuplicates: function (recordType, captureRecord, successCallback, failCallback) {


            if (debug) { console.log(debug + 'findcoDuplicates', recordType, captureRecord); }


            var findContact = function () {

                if (debug) { console.log(debug + 'findContact', angular.copy(captureRecord)); }

                var filter = '?query=FirstName eq ' + (captureRecord.first || '') + ' AND LastName eq ' + (captureRecord.last || '');

                if (debug) { console.log(debug + 'filter', filter); }

                var successCallback2 = function (successResponse, textStatus, xhr) {


                    if (debug) { console.log(debug + 'response', successResponse); }

                    var dups = [];
                    console.log(successResponse.Results.length);
                    if (successResponse.TotalRecords > 0) {
                        for (var i = 0; i < successResponse.Results.length; i++) {
                            var dup;
                            dup = fromContact(successResponse.Results[i]);
                            dups.push(dup);
                        }
                    }
                    if (debug) { console.log(debug + 'List Dups', dups); }
                    try { successCallback({ duplicates: dups }); } catch (e) { }
                };

                var buildRequest2 = function (method, filter, successCallback, failCallback) {
                    var urlBody = 'candidates';
                    return {
                        type: 'GET',
                        url: buildUrl(defaultUrl, urlBody) + filter,
                        contentType: 'application/json',
                        crossDomain: true,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'BEARER ' + store.authId);
                        },
                        success: function (successResponse, textStatus, xhr) {
                            console.log('Duplicates Found');
                            console.log(successResponse);
                            successCallback(successResponse, textStatus, xhr);
                        },
                        error: function (errorResponse) {

                            console.log(errorResponse);
                            var response = handleErrorMessageText(errorResponse);

                            failCallback(response, errorResponse.status || 500);
                        }
                    };

                };

                var request = buildRequest2(recordType, filter, successCallback2, failCallback);

                jQuery.ajax(request);
            };

            if (recordType.toUpperCase() === 'CONTACT') {
                recordType = 'Contacts';
                findContact();
            } else {
                try { successCallback({ duplicates: [] }); } catch (e) { }
            }

        },

        /*findDuplicates: function (recordType, contact, successCallback, failCallback) {

            var encode = function (s) {
                if (typeof s === 'undefined') { s = ''; }
                return s.replace(/'/g, '\\\'');
            };

            if (recordType === 'contact') { recordType = 'Contact'; }

            var fields = 'ID,LastName,FirstName,Email,Company,Phone,Title';
            if (recordType === 'Contact') { fields = 'ID,LastName,FirstName,Email,Title,Phone,Account.Name'; }

            var from = recordType;
            if (recordType === 'Contact')
            { from = 'Contact,Contact.Account'; }

            var where = '';

            var dups = [];

            var reponseHandle = null;
            var returnResponse = function() {
                try {
                    successCallback({ duplicates: dups });
                } catch (e) {}
            };

            var query = function (q) {
                var urlBody = 'candidates';

                try {

                    //calls Salesforce REST API with jQuery
                    jQuery.ajax({
                        type: 'GET',
                        url: buildUrl(defaultUrl, urlBody),
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', 'BEARER ' + store.authId);
                            xhr.setRequestHeader('Accept', 'application/json');
                        },
                        success: function (sfdata) {
                            console.log('findDuplicates results', sfdata);

                            if (!sfdata.records)
                            { try { failCallback(); } catch (e) { } }

                            
                            for (var i = 0; i < sfdata.records.length; i++) {
                                var dup = {};
                                if (recordType === 'Lead') { dup = service.fromLead(sfdata.records[i]); }
                                else if (recordType === 'Contact') { dup = service.fromContact(sfdata.records[i]); }
                                dups.push(dup);
                            }

                            if (reponseHandle) {
                                window.clearTimeout(reponseHandle);
                            }
                            reponseHandle = window.setTimeout(returnResponse, 2000);

                        },
                        failure: function (error) {
                            console.log('ERROR in findDuplicates', error);
                            try { failCallback(); } catch (e) { }
                        }
                    });

                } catch (e) {
                    console.log('ERROR in query', e.message);
                    try { failCallback(); } catch (e) { }
                }

            };

            if (recordType.toUpperCase() === 'CONTACT') {
                query('?query=FirstName eq ' + (captureRecord.first || '') + ' AND LastName eq ' + (captureRecord.last || ''));
            }

            //if (contact.phone && contact.last) {
            //    where = 'LastName=\'' + encode(contact.last) + '\'+AND+Phone=\'' + encode(contact.phone) + '\'';
            //    if (recordType === 'Lead')
            //    { where += '+AND+IsConverted=False'; }
            //    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
            //}

            //if (contact.email2) {
            //    where = 'Email=\'' + contact.email2 + '\'';
            //    if (recordType === 'Lead')
            //    { where += '+AND+IsConverted=False'; }
            //    query('SELECT+' + fields + '+FROM+' + from + '+WHERE+' + where + '+LIMIT+5');
            //}


        },*/



        findRecord: function (recordType, query, fields, successCallback, failCallback) {


            //var service = this;             
            var urlBody;
            var encodeParam = function (p) {
                return p.replace(/'/g, '%5C%27');
            };

            if (debug) { console.log(debug + 'findRecord->type:', recordType, '->query:', query, '->fields:', fields); }

            if (recordType === 'account') { recordType = 'Account'; }
            if (recordType === 'lead') { recordType = 'Lead'; }
            if (recordType === 'contact') { recordType = 'Contact'; }
            if (recordType === 'campaign') { recordType = 'Campaign'; }

            var where = [];

            if (query) {

                if (query.email)
                { where.push('Email=\'' + encodeParam(query.email) + '\''); }

                if (query.email_endsWith)
                { where.push('Email+LIKE+\'%25' + encodeParam(query.email_endsWith) + '\''); }

                if (query.last)
                { where.push('LastName=\'' + encodeParam(query.last) + '\''); }

                if (query.first)
                { where.push('FirstName=\'' + encodeParam(query.first) + '\''); }

                if (recordType === 'Account') {
                    if (query.company)
                    { where.push('Name+LIKE+\'%25' + encodeParam(query.company) + '%25\''); }
                }

                if (recordType === 'Campaign') {
                    if (query.campaign)
                    { where.push('Name+LIKE+\'%25' + encodeParam(query.campaign) + '%25\''); }
                }

            }
            var whereStr = where.join('+AND+');
            if (whereStr) { whereStr = '+WHERE+' + whereStr; } else { whereStr = '+'; }
            console.log(whereStr);

            var fieldsStr = '*';
            var f;


            if (recordType === 'Account') {
                urlBody = 'companies?Query=CompanyName eq ' + query.company;
                f = [];

                f.push('ID');

                if (fields.indexOf('company') > -1) { f.push('Name'); }
                if (fields.indexOf('website') > -1) { f.push('Website'); }
                if (fields.indexOf('_createdDate') > -1) { f.push('CreatedDate'); }

                f.push('BillingCity');
                f.push('BillingState');

                fieldsStr = f.join(',');
            }

            if (recordType === 'Contact') {
                urlBody = 'candidates';
                f = [];

                f.push('ID');

                if (fields.indexOf('first') > -1) { f.push('FirstName'); }
                if (fields.indexOf('last') > -1) { f.push('LastName'); }
                if (fields.indexOf('email') > -1) { f.push('Email'); }
                //if (fields.indexOf('middle') > -1) { f.push('MiddleName '); }

                fieldsStr = f.join(',');
            }

            if (recordType === 'Lead') {
                f = [];

                f.push('ID');

                if (fields.indexOf('first') > -1) { f.push('FirstName'); }
                if (fields.indexOf('last') > -1) { f.push('LastName'); }
                if (fields.indexOf('email') > -1) { f.push('Email'); }
                //if (fields.indexOf('middle') > -1) { f.push('MiddleName '); }

                fieldsStr = f.join(',');
            }

            if (recordType === 'Campaign') {

                f = [];

                f.push('ID');
                f.push('Name');

                fieldsStr = f.join(',');
            }

            var headers = { 'Content-type': 'application/json', 'Authorization': 'BEARER ' + store.authId, 'Accept': 'application/json' };
            var config = {
                method: 'GET',
                url: buildUrl(defaultUrl, urlBody),
                headers: headers
            };
            if (debug) { console.log(debug + 'findRecord->config:', config); }

            var allRecords = [];

            var errorHandler = function (response, status) {

                if (debug) { console.log(debug + 'findRecord->failResponse', response); }
                var msg = '';
                if (response && response.length > 0) {

                    if (response[0].errorCode === 'INVALID_SESSION_ID') {
                        console.log(service);
                        service.logout();
                        failCallback('Session expired. Please log in.');
                    }

                    var i = 0;
                    while (i < response.length) {
                        if (response[i].message)
                        { msg += response[i].message + ' '; }
                        i++;
                    }
                }
                try { failCallback('Cannot find PCRecruiter record: (' + status + ') ' + (msg || response)); } catch (e) { }

            };

            var successHandler = function (response) {

                if (debug) { console.log(debug + 'findRecord->successResponse', response); }

                allRecords = allRecords.concat(response.Results);

                /*if (!response.done && response.nextRecordsUrl) {
                    config.url = store.url + response.nextRecordsUrl;
                    $http(config).success(successHandler).error(errorHandler);
                }
                else { try { successCallback(allRecords); } catch (e) { } }
                */
                try { successCallback(allRecords); } catch (e) { }
            };

            $http(config).success(successHandler).error(errorHandler);

        },

        /**
        * @function retrieveRecord
        * @description Returns single recor.
        * @memberOf captureApp.webServices.exportTargetVer1.pipeliner
        * @param {string} recordId - Record ID 
        * @param {recordType} recordType - Record type
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - Pass the native record as a parameter
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback - Return error message
        */
        retrieveRecord: function (recordId, recordType, successCallback, failCallback) {

            if (recordType.toLowerCase() === 'lead') { recordType = 'Leads'; }
            if (recordType.toLowerCase() === 'contact') { recordType = 'Contacts'; }

            var buildRequest2 = function (method, id, successCallback, failCallback) {
                var urlBody = 'candidates';
                console.log('PCR ID --> ' + id);
                return {
                    type: 'GET',
                    url: buildUrl(defaultUrl, urlBody) + '/' + id + '?custom=Social_LinkedIn,Social_Facebook,Social_Twitter,Social_GooglePlus,Social_MySpace,Social_Pinterest,Social_MyLife,Social_Xing',
                    contentType: 'application/json',
                    crossDomain: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', 'BEARER ' + store.authId);
                    },
                    success: function (successResponse, textStatus, xhr) {
                        successCallback(successResponse, textStatus, xhr);
                    },
                    error: function (errorResponse) {
                        var response = handleErrorMessageText(errorResponse);
                        failCallback(response, errorResponse.status || 500);
                    }
                };
            };

            var successCallback2 = function (successResponse, textStatus, xhr) {

                if (debug) { console.log(debug + 'response', successResponse); }

                try { successCallback(successResponse); } catch (e) { }
            };

            var request = buildRequest2(recordType, recordId, successCallback2, failCallback);

            jQuery.ajax(request);
        },


        /*
        * Returns JSON with all Team Pipeline Clients. Function is supposed to help obtain value for OWNER_ID field.
        * E.g.: {
        *   "Stefan Smihla (stefan.smihla@pipelinersales)": 12345,
        *   "Example User (example@user.com)": 56789
        * }
        */
        getClients: function (successCallback, failCallback) {

            if (debug) { console.log(debug + 'getClients'); }

            var successFunc = function (successResponse) {
                var clients = {};
                for (var i in successResponse) {
                    var item = successResponse[i];
                    var firstname = item.FIRSTNAME || '';
                    var surname = item.LASTNAME || '';
                    var fullname = firstname + ' ' + surname + ' (' + item.EMAIL + ')';
                    clients[fullname] = item.ID;
                }
                //successCallback(JSON.stringify(clients));
                successCallback(clients);
            };

            service.getEntities('Clients', successFunc, failCallback);
        },

        /* Sets Sales Unit ID. This value will be needed fpr required SALES_UNIT_ID. */
        setSalesUnit: function (salesUnit) {
            store.salesUnit = salesUnit;
        },

        getEntities: function (nativeRecordType, successCallback, failCallback) {

            if (debug) { console.log(debug + 'getEntities', nativeRecordType); }

            var request = buildRequest(nativeRecordType, successCallback, failCallback);
            request.success = successCallback;
            jQuery.ajax(request);
        },

    };

    return service;
}]);
/**
 * @class captureApp.webServices.pipeliner
 * @memberOf captureApp.webServices
 * @description This is Pipeliner CRM AngularJS service.
 */

'use strict';

/* global angular: false */
/* global jQuery: false */

angular.module('webServices')
.factory('pipeliner', ['$http', '$q', 'endpoints', 'dialogs', function ($http, $q, endpoints, dialogs) {
    //app.factory('pipeliner', ['$http', '$q', 'endpoints', 'dialogs', function ($http, $q, endpoints, dialogs) {
    var debug = 'pipeliner.js->';
    var defaultUrl = 'https://us.pipelinersales.com';
    var store = {};

    /* Builds basic Pipeliner REST url from provided Service URL and Team Pipeline ID */
    var buildUrl = function (serviceUrl, teamPipelineId) {
        console.log('Pipeliner Build URL > ', serviceUrl, ' > Team Pipeline ID > ', teamPipelineId);
        return serviceUrl + '/rest_services/v1/' + teamPipelineId;
    };

    /* 
    * Handles error response from Pipeliner SAPI. It should try to return string message if provided. 
    *
    * r - HTTP response
    * asJson - if true, then error message will returns as JSON object, otherwise as String.
    */
    var handleErrorMessageText = function (r, asJson) {
        var status = r.status || 500;
        var msg = '';
        if (r.responseJSON) { msg = r.responseJSON; }
        else if (r.responseText) {
            try {
                msg = JSON.parse(r.responseText);
            } catch (err) {
                msg = r.responseText;
            }
        } else if (r.statusText) {
            msg = r.statusText;
        } else {
            msg = 'Unknown error';
        }
        if (asJson !== undefined) {
            return msg;
        } else {
            if (msg.hasOwnProperty('message')) { msg = msg.message; }
            return msg;
        }
    };


    var mapField = function (source, sourceKey, target, targetKey) {
        var sourceKeyParts = sourceKey.split('.');
        if (sourceKeyParts.length === 2) {
            try {
                target[targetKey] = source[sourceKeyParts[0]][sourceKeyParts[1]];
            } catch (e) {
                target[targetKey] = null;
            }
        }
        else { target[targetKey] = source[sourceKey]; }
    };
    var mapFromField = function (target, targetKey, source, sourceKey) {
        mapField(source, sourceKey, target, targetKey);
    };
    var toContact = function (captureRecord) {

        if (debug) {
            console.log(debug + 'toContact:in', captureRecord);
        }

        var nativeRecord = {};
        mapField(captureRecord, 'first', nativeRecord, 'FIRST_NAME');
        mapField(captureRecord, 'last', nativeRecord, 'SURNAME');
        mapField(captureRecord, 'jobtitle', nativeRecord, 'POSITION');
        mapField(captureRecord, 'email', nativeRecord, 'EMAIL1');
        mapField(captureRecord, 'phone', nativeRecord, 'PHONE1');
        mapField(captureRecord, 'phone2', nativeRecord, 'PHONE2');
        mapField(captureRecord, 'bio', nativeRecord, 'COMMENTS');
        mapField(captureRecord, 'address1', nativeRecord, 'ADDRESS');
        mapField(captureRecord, 'city', nativeRecord, 'CITY');
        mapField(captureRecord, 'state', nativeRecord, 'STATE_PROVINCE');
        mapField(captureRecord, 'zip', nativeRecord, 'ZIP_CODE');
        mapField(captureRecord, 'country', nativeRecord, 'COUNTRY');

        if (debug) {
            console.log(debug + 'toContact:out', nativeRecord);
        }

        return nativeRecord;
    };
    var fromContact = function (nativeRecord) {

        if (debug) {
            console.log(debug + 'fromContact:in', nativeRecord);
        }

        var captureRecord = {};
        mapFromField(captureRecord, 'first', nativeRecord, 'FIRST_NAME');
        mapFromField(captureRecord, 'last', nativeRecord, 'SURNAME');
        mapFromField(captureRecord, 'jobtitle', nativeRecord, 'POSITION');
        mapFromField(captureRecord, 'company', nativeRecord, 'QUICK_ACCOUNT_NAME');
        mapFromField(captureRecord, 'email', nativeRecord, 'EMAIL1');
        mapFromField(captureRecord, 'phone', nativeRecord, 'PHONE1');
        mapFromField(captureRecord, 'phone2', nativeRecord, 'PHONE2');
        mapFromField(captureRecord, 'bio', nativeRecord, 'COMMENTS');
        mapFromField(captureRecord, 'address1', nativeRecord, 'ADDRESS');
        mapFromField(captureRecord, 'city', nativeRecord, 'CITY');
        mapFromField(captureRecord, 'state', nativeRecord, 'STATE_PROVINCE');
        mapFromField(captureRecord, 'zip', nativeRecord, 'ZIP_CODE');
        mapFromField(captureRecord, 'country', nativeRecord, 'COUNTRY');
        //mapFromField(captureRecord, 'sourceurl', nativeRecord, 'LinkedIn');
        //https://us.pipelinersales.com/rest_services/v1/us_BroadlookTechnologies1/Contacts/PY-7FFFFFFF-1DEAC92D-7169-465D-80D7-04B2ABD1DF16
        captureRecord._link = store.url + '/Contacts/' + nativeRecord.ID;
        captureRecord._type = 'Contact';
        captureRecord._id = nativeRecord.ID;

        if (debug) {
            console.log(debug + 'fromContact:out', captureRecord);
        }

        return captureRecord;
    };


    /*
    * Returns default HTTP request template.
    *
    * method - called Pipeliner REST method
    */
    var buildRequest = function (method, successCallback, failCallback) {
        return {
            type: 'GET',
            url: store.url + '/' + method,
            contentType: 'application/json',
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', store.auth);
            },
            success: function (successResponse, textStatus, xhr) {
                try { successCallback(successResponse, textStatus, xhr); } catch (e) { }

            },
            error: function (errorResponse) {
                var response = handleErrorMessageText(errorResponse);
                try { failCallback(response, errorResponse.status || 500); } catch (e) { }
            }
        };
    };

    var service = {


        /**
        * @function getName
        * @description Return name of export target.
        * @memberOf captureApp.webServices.pipeliner
        */
        getName: function () {
            return 'Pipeliner';
        },


        /**
        * @function init
        * @description Initializes store object. Sets user credentials, owner and team pipeline id.
        * @memberOf captureApp.webServices.pipeliner
        * @param {object} o - List of target-specific settings.
        */
        init: function (o) {
            store.username = o.username;
            store.password = o.password;
            store.teamPipelineId = o.teamPipelineId;
            store.ownerId = o.ownerId;
        },


        /**
        * @function login
        * @description Logs user in. Either silently (if possible) or interactively.
        * There is need to provide API Token, API Password and Team Pipeline ID
        * Follow 'http://help.pipelinersales.com/integration/pipeliner-crm-api-key/' to see how to obtain it.
        * @memberOf captureApp.webServices.pipeliner
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - This callback informs that user was logged in successfully. 
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback - This callback informs that user cannot log in.
        */
        login: function (successCallback, failCallback) {
            if (debug) { console.log(debug + 'Logging into Pipeliner...'); }

            var username = store.username;
            var password = store.password;
            var teamPipelineId = store.teamPipelineId;

            if (!username || !password || !teamPipelineId) {
                try { failCallback('Please open Settings and enter your user credentials'); } catch (e) { }
                return;
            }

            store.auth = 'Basic ' + btoa(username + ':' + password);
            var request = buildRequest('', successCallback, failCallback);

            request.url = buildUrl(defaultUrl, teamPipelineId) + '/teamPipelineUrl';
            request.success = function (successResponse) {
                console.log('Pipeliner Login Response > ', successResponse);
                var response = successResponse.substring(1, successResponse.length - 1);
                if (successResponse[0] === 'h') {
                    response = successResponse.substring(0, successResponse.length - 1);
                }
                store.url = buildUrl(response, teamPipelineId);
                successCallback(response);
            };

            jQuery.ajax(request);
        },

        /**
         * @function logout
         * @description Logs user out. Cleans up store variable.
         * @memberOf captureApp.webServices.pipeliner
         */
        logout: function () {
            store = {};
            if (debug) { console.log(debug + 'Logged out...'); }
        },


        /**
         * @function isLoggedIn
         * @description Checks if user is logged in.
         * @memberOf captureApp.webServices.pipeliner
         * @param {captureApp.webServices.exportTargetVer1~isLoggedInSuccessCallback} successCallback - This callback informs that user is currently logged in.
         * @param {captureApp.webServices.exportTargetVer1~isLoggedInFailCallback} failCallback - This callback informs that user is not currently logged in.
         */
        isLoggedIn: function (successCallback, failCallback) {
            var isLogged = store.url !== undefined ? true : false;

            if (debug) { console.log(debug + 'isLogged', isLogged); }

            if (!isLogged) {
                // Since we can do it... Do silent login.
                service.login(successCallback, failCallback);
            }
            else { try { successCallback(); } catch (e) { } }
        },


        /**
       * @function createRecord
       * @description Creates record.
       * @memberOf captureApp.webServices.pipeliner
       * @param {recordType} recordType - Destination Record Type
       * @param {captureContact} captureRecord - Source Capture Record.
       * @param {object} createOptions - Options (For future use)
       * @param {captureApp.webServices.exportTargetVer1~createRecordSuccessCallback} successCallback 
       * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback
       */
        createRecord: function (recordType, captureRecord, createOptions, successCallback, failCallback) {

            if (debug) { console.log(debug + 'createRecord', captureRecord); }

            var linkedin = '';
            var venueIndex;

            var cutLinkedInUrl = function (url) {
                if (!url) {
                    return null;
                }
                var pos = url.indexOf('linkedin.com/in');
                if (pos < 0) {
                    return null;
                }
                var res = url.substring(pos);
                pos = url.indexOf('?');
                if (pos > 0) {
                    res = res.substring(0, pos);
                }
                return res;
            };

            linkedin = cutLinkedInUrl(captureRecord.sourceurl);
            if (!linkedin && typeof captureRecord.venues !== 'undefined') {
                for (venueIndex = 0; venueIndex < captureRecord.venues.length; venueIndex++) {
                    linkedin = cutLinkedInUrl(captureRecord.venues[venueIndex].website);
                    if (linkedin) {
                        break;
                    }
                }
            }

            var country = captureRecord.country || '';
            if (country.toLowerCase() === 'us' || country.toLowerCase() === 'usa') {
                country = 'United States';
            }

            var comments = 'Created by Capture!';

            if (captureRecord.bio) {
                comments += '\n\n' + captureRecord.bio;
            }

            //if (typeof captureRecord.venues !== 'undefined' && captureRecord.venues.length > 0) {
            //    comments += '\n';
            //    for (venueIndex = 0; venueIndex < captureRecord.venues.length; venueIndex++) {
            //        var w = captureRecord.venues[venueIndex].website;
            //        if (w) {
            //            comments += '\n' + w;
            //        }
            //    }
            //}

            var createMessage = function(parentId, message) {
                var record = {
                    'OWNER_ID': store.ownerId,
                    'ADDRESSBOOK_ID': parentId,
                    'SUBJECT': (message || '')
                };

                var request = buildRequest('Messages');
                request.type = 'POST';
                request.data = JSON.stringify(record);

                jQuery.ajax(request);

            };

            var createContact = function (nativeRecordType) {

                var record = {
                    'OWNER_ID': store.ownerId,
                    'SALES_UNIT_ID': '0',
                    //'TITLE': (captureRecord.prefix || ''), // for future use
                    'FIRST_NAME': (captureRecord.first || ''),
                    'MIDDLE_NAME': (captureRecord.middle || ''),
                    'SURNAME': (captureRecord.last || ''),
                    'EMAIL1': (captureRecord.email || ''),
                    'EMAIL2': (captureRecord.email2 || ''),
                    'POSITION': (captureRecord.jobtitle || ''),
                    'QUICK_ACCOUNT_NAME': (captureRecord.company || ''),
                    'PHONE1': (captureRecord.phone || ''),
                    'PHONE2': (captureRecord.phone2 || ''),
                    'COMMENTS': (comments || ''),
                    'ADDRESS': (captureRecord.address1 || '') + '\n' + (captureRecord.address2 || ''),
                    'CITY': (captureRecord.city || ''),
                    'STATE_PROVINCE': (captureRecord.state || ''),
                    'ZIP_CODE': (captureRecord.zip || ''),
                    'COUNTRY': (country || '')//,
                    //'LinkedIn': (linkedin || '')
                };

                if (debug) { console.log(debug + 'post', angular.copy(record)); }

                var successCallback2 = function (successResponse, textStatus, xhr) {

                    if (debug) { console.log(debug + 'response', successResponse, textStatus); }
                    var link = xhr.getResponseHeader('Location'); // Example: https://us.pipelinersales.com/rest_services/v1/us_BroadlookTechnologies1/Contacts/PY-7FFFFFFF-B2216806-D8BB-4743-B032-1C66DE20DC6C
                    var key = '/' + nativeRecordType + '/';


                    // Create Feed Messages with Venue Links
                    if (typeof captureRecord.venues !== 'undefined' && captureRecord.venues.length > 0) {
                        var newRecordId = link.substring(link.indexOf(key) + key.length);
                        var message = '';
                        var ww = [];
                        for (venueIndex = 0; venueIndex < captureRecord.venues.length; venueIndex++) {
                            var w = captureRecord.venues[venueIndex].website;
                            if (w) {
                                ww.push(w);
                            }
                        }
                        message = 'Social networks and other links found by Capture:\n\n' + ww.join('\n');
                        createMessage(newRecordId, message);
                    }

                    try { successCallback(link); } catch (e) { }
                };

                var request = buildRequest(nativeRecordType, successCallback2, failCallback);
                request.type = 'POST';
                request.data = JSON.stringify(record);

                jQuery.ajax(request);
            };

            if (recordType.toUpperCase() === 'CONTACT') {
                createContact('Contacts');
            } else {
                failCallback('Invalid record type');
            }

        },


        /**
        * @function updateRecord
        * @description Updates record.
        * @memberOf captureApp.webServices.pipeliner
        * @param {string} recordId - Record ID
        * @param {recordType} recordType - Record Type ('lead', 'contact' or 'account')
        * @param {object} record - Native record. Include only fields to be updated. 
        * @param {captureApp.webServices.exportTargetVer1~updateRecordSuccessCallback} successCallback 
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback
        */
        updateRecord: function (recordId, recordType, record, successCallback, failCallback) {

            if (debug) { console.log(debug + 'updateRecord', recordId, recordType, record); }

            var updateContact = function (nativeRecordType) {

                if (debug) { console.log(debug + 'post', angular.copy(record)); }

                var successCallback2 = function (successResponse, textStatus, xhr) {

                    if (debug) { console.log(debug + 'response', successResponse); }

                    try { successCallback(recordId); } catch (e) { }
                };

                var buildRequest2 = function (method, id, successCallback, failCallback) {
                    return {
                        type: 'GET',
                        url: store.url + '/' + method + '/' + id,
                        contentType: 'application/json',
                        crossDomain: true,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', store.auth);
                        },
                        success: function (successResponse, textStatus, xhr) {
                            successCallback(successResponse, textStatus, xhr);
                        },
                        error: function (errorResponse) {
                            var response = handleErrorMessageText(errorResponse);
                            failCallback(response, errorResponse.status || 500);
                        }
                    };
                };

                var request = buildRequest2(nativeRecordType, recordId, successCallback2, failCallback);
                request.type = 'PUT';
                request.data = JSON.stringify(record);

                jQuery.ajax(request);
            };

            if (recordType.toUpperCase() === 'CONTACT') {
                updateContact('Contacts');
            } else {
                failCallback('Invalid record type');
            }

        },


        /**
        * @function getRequiredLookups
        * @description Returns an array of lookups required prior to saving a record .
        * @memberOf captureApp.webServices.pipeliner
        * @param {recordType} recordType - Record type 
        * @return {captureApp.webServices.exportTargetVer1~lookup[]}
        */
        getRequiredLookups: function (recordType) {
            return [];
        },


        /**
        * @function getDefaultExportMaps
        * @description (Reserved for future use) Return an empty array. 
        * maps: [ {captureField: { name: '', label: '' }, crmField: { name: '', label: '' } } ]
        * @memberOf captureApp.webServices.pipeliner
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback  - pass the empty array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback 
        */
        getDefaultExportMaps: function (successCallback, failureCallback) {

            var maps = [];

            //maps.push({ name: 'contact', label: 'Contact', map: null });

            successCallback(maps);
        },


        /**
        * @function getDefinition
        * @description Returns configuration for Multi-Merge dialog. 
        * How to modify:
        * 1. Put native field names in def.fields.map.{Field}.id
        * 2. Remove lines that do not have corresponding native fields, or where fields are read-only
        * @memberOf captureApp.webServices.pipeliner
        * @param {string} recordType - 'lead', 'contact' or 'account'. 
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback  - pass the empty array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback 
        */
        getDefinition: function (recordType, successCallback, failureCallback) {


            if (debug) { console.log(debug + 'getDefinition', recordType); }


            var def = {};
            recordType = recordType.toLowerCase();
            //if (recordType === 'lead') {
            //    def = {
            //        groups: {
            //            list: ['G1', 'G2'],
            //            map: {
            //                'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description'] },
            //                'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
            //            }
            //        },
            //        fields: {
            //            list: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Website', 'Description', 'Street', 'City', 'State', 'PostalCode', 'Country'],
            //            map: {
            //                //'FirstName': { id: 'FIRST_NAME', display: 'First Name', group: 'G1' },
            //                //'LastName': { id: 'SURNAME', display: 'Last Name', group: 'G1' },
            //                'FullName': { id: 'QUICK_CONTACT_NAME', display: 'Full Name', group: 'G1' },
            //                'Title': { id: 'POSITION', display: 'Job Title', group: 'G1' },
            //                'Company': { id: 'QUICK_ACCOUNT_NAME', display: 'Company', group: 'G1' },
            //                'Email': { id: 'QUICK_EMAIL', display: 'Email', group: 'G1' },
            //                'Phone': { id: 'QUICK_PHONE', display: 'Phone', group: 'G1' },
            //                //'MobilePhone': { id: 'Telephone2', display: 'Phone 2', group: 'G1' },
            //                //'Website': { id: 'WebSiteUrl', display: 'Website', group: 'G1' },
            //                //'Description': { id: 'Description', display: 'Description', group: 'G1' },

            //                //'Street': { id: 'Address1_Line1', display: 'Address1_Line1', group: 'G2' },
            //                //'City': { id: 'Address1_City', display: 'City', group: 'G2' },
            //                //'State': { id: 'Address1_StateOrProvince', display: 'State/Province', group: 'G2' },
            //                //'PostalCode': { id: 'Address1_PostalCode', display: 'Zip/Postal Code', group: 'G2' },
            //                //'Country': { id: 'Address1_Country', display: 'Country', group: 'G2' },
            //            }
            //        }
            //    };

            //} else
            if (recordType === 'contact') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Description'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Description', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { id: 'FIRST_NAME', display: 'First Name', group: 'G1' },
                            'LastName': { id: 'SURNAME', display: 'Last Name', group: 'G1' },
                            'Title': { id: 'POSITION', display: 'Position', group: 'G1' },
                            'Company': { id: 'QUICK_ACCOUNT_NAME', display: 'Company', group: 'G1' },
                            'Email': { id: 'EMAIL1', display: 'Email 1', group: 'G1' },
                            'Phone': { id: 'PHONE1', display: 'Phone 1', group: 'G1' },
                            'MobilePhone': { id: 'PHONE2', display: 'Phone 2', group: 'G1' },
                            //'Website': { id: 'Website', display: 'Website', group: 'G1' },
                            'Description': { id: 'COMMENTS', display: 'Comments', group: 'G1' },

                            'Street': { id: 'ADDRESS', display: 'Address', group: 'G2' },
                            'City': { id: 'CITY', display: 'City', group: 'G2' },
                            'State': { id: 'STATE_PROVINCE', display: 'State/Province', group: 'G2' },
                            'PostalCode': { id: 'ZIP_CODE', display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { id: 'COUNTRY', display: 'Country', group: 'G2' }
                        }
                    }
                };
            } else {
                failureCallback('Invalid record type');
            }
            successCallback(def);
        },


        /**
        * @function toNativeRecord
        * @description Converts Capture Contact to native record. 
        * @memberOf captureApp.webServices.pipeliner
        * @param {captureContact} captureRecord - Capture Contact
        * @param {recordType} recordType - Record type. 
        * @return {object} - Native record
        */
        toNativeRecord: function (captureRecord, recordType) {
            recordType = recordType.toLowerCase();
            if (recordType === 'contact') { return toContact(captureRecord); }
            return null;
        },


        /**
        * @function fromNativeRecord
        * @description Converts native record to Capture Contact. 
        * @memberOf captureApp.webServices.pipeliner
        * @param {object} nativeRecord - Native record
        * @param {recordType} recordType - Record type. 
        * @return {captureContact} - Capture Contact
        */
        fromNativeRecord: function (nativeRecord, recordType) {
            recordType = recordType.toLowerCase();
            if (recordType === 'contact') { return fromContact(nativeRecord); }
            return null;
        },


        /**
        * @function findDuplicates
        * @description Returns an array of duplicate records of given type.
        * @memberOf captureApp.webServices.pipeliner
        * @param {captureContact} recordType - Record type. 
        * @param {captureContact} captureRecord - Source Capture Contact. 
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - Pass the resulting array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback  
        * @return {captureContact[]} - Array of Capture Contacts
        */
        findDuplicates: function (recordType, captureRecord, successCallback, failCallback) {

            if (debug) { console.log(debug + 'findcoDuplicates', recordType, captureRecord); }

            var dups = [];

            var reponseHandle = null;
            var returnResponse = function () {
                try {
                    if (debug) { console.log(debug + 'dups (final)', angular.copy(dups)); }

                    successCallback({ duplicates: dups });
                } catch (e) { }
            };

            var findRecords = function (filter, nativeRecordType) {

                if (debug) { console.log(debug + 'findRecords', angular.copy(captureRecord)); }


                if (debug) { console.log(debug + 'filter', filter); }

                var successCallback2 = function (successResponse, textStatus, xhr) {


                    if (debug) { console.log(debug + 'response', successResponse); }

                    for (var i = 0; i < successResponse.length; i++) {
                        var dup = {};
                        dup = fromContact(successResponse[i]);
                        dups.push(dup);
                    }

                    if (debug) { console.log(debug + 'dups', angular.copy(dups)); }

                    //try { successCallback({ duplicates: dups }); } catch (e) { }

                    if (reponseHandle) {
                        window.clearTimeout(reponseHandle);
                    }
                    reponseHandle = window.setTimeout(returnResponse, 2000);
                };

                var buildRequest2 = function (method, filter, successCallback, failCallback) {
                    return {
                        type: 'GET',
                        url: store.url + '/' + method + '?filter=' + filter,
                        contentType: 'application/json',
                        crossDomain: true,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader('Authorization', store.auth);
                        },
                        success: function (successResponse, textStatus, xhr) {
                            successCallback(successResponse, textStatus, xhr);
                        },
                        error: function (errorResponse) {
                            var response = handleErrorMessageText(errorResponse);
                            failCallback(response, errorResponse.status || 500);
                        }
                    };
                };

                var request = buildRequest2(nativeRecordType, filter, successCallback2, failCallback);

                jQuery.ajax(request);
            };

            var filter = '';
            var nativeRecordType = '';

            if (recordType.toUpperCase() === 'CONTACT') {

                nativeRecordType = 'Contacts';

                if (captureRecord.email) {
                    filter = 'EMAIL1::' + (captureRecord.email || '');
                    findRecords(filter, nativeRecordType);
                }

                if (captureRecord.last) {
                    filter = 'SURNAME::' + (captureRecord.last || '') + '|' + 'FIRST_NAME::' + (captureRecord.first || '');
                    findRecords(filter, nativeRecordType);
                }

                if (captureRecord.email2) {
                    filter = 'EMAIL1::' + (captureRecord.email2 || '');
                    findRecords(filter, nativeRecordType);
                }

                //} else if (recordType.toUpperCase() === 'LEAD') {

                //    nativeRecordType = 'Leads';

                //    if (captureRecord.email) {
                //        filter = 'EMAIL1::' + (captureRecord.email || '');
                //        findRecords(filter, nativeRecordType);
                //    }

                //    if (captureRecord.last) {
                //        filter = 'SURNAME::' + (captureRecord.last || '') + '|' + 'FIRST_NAME::' + (captureRecord.first || '');
                //        findRecords(filter, nativeRecordType);
                //    }

                //    if (captureRecord.email2) {
                //        filter = 'EMAIL1::' + (captureRecord.email2 || '');
                //        findRecords(filter, nativeRecordType);
                //    }


            } else {
                try { successCallback({ duplicates: [] }); } catch (e) { }
            }

        },


        /**
        * @function retrieveRecord
        * @description Returns single recor.
        * @memberOf captureApp.webServices.pipeliner
        * @param {string} recordId - Record ID 
        * @param {recordType} recordType - Record type
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - Pass the native record as a parameter
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback - Return error message
        */
        retrieveRecord: function (recordId, recordType, successCallback, failCallback) {

            if (recordType.toLowerCase() === 'lead') { recordType = 'Leads'; }
            if (recordType.toLowerCase() === 'contact') { recordType = 'Contacts'; }

            var buildRequest2 = function (method, id, successCallback, failCallback) {
                return {
                    type: 'GET',
                    url: store.url + '/' + method + '/' + id,
                    contentType: 'application/json',
                    crossDomain: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader('Authorization', store.auth);
                    },
                    success: function (successResponse, textStatus, xhr) {
                        successCallback(successResponse, textStatus, xhr);
                    },
                    error: function (errorResponse) {
                        var response = handleErrorMessageText(errorResponse);
                        failCallback(response, errorResponse.status || 500);
                    }
                };
            };

            var successCallback2 = function (successResponse, textStatus, xhr) {

                if (debug) { console.log(debug + 'response', successResponse); }

                try { successCallback(successResponse); } catch (e) { }
            };

            var request = buildRequest2(recordType, recordId, successCallback2, failCallback);

            jQuery.ajax(request);
        },

        //-- Search --//
        //  Find a record using a query: { first:'', last:'', email:''} object
        //      successCallback: function(nativeRecords[])
        findRecord: function (recordType, query, fields, successCallback, failCallback) {

            if (debug) { console.log(debug + 'findRecord->type:', recordType, '->query:', query, '->fields:', fields); }

            try { failCallback('Not implemented: findRecord'); } catch (e) { }
        },

        /*
        * Returns JSON with all Team Pipeline Clients. Function is supposed to help obtain value for OWNER_ID field.
        * E.g.: {
        *   "Stefan Smihla (stefan.smihla@pipelinersales)": 12345,
        *   "Example User (example@user.com)": 56789
        * }
        */
        getClients: function (successCallback, failCallback) {

            if (debug) { console.log(debug + 'getClients'); }

            var successFunc = function (successResponse) {
                var clients = {};
                for (var i in successResponse) {
                    var item = successResponse[i];
                    var firstname = item.FIRSTNAME || '';
                    var surname = item.LASTNAME || '';
                    var fullname = firstname + ' ' + surname + ' (' + item.EMAIL + ')';
                    clients[fullname] = item.ID;
                }
                //successCallback(JSON.stringify(clients));
                successCallback(clients);
            };

            service.getEntities('Clients', successFunc, failCallback);
        },

        /* Sets Sales Unit ID. This value will be needed fpr required SALES_UNIT_ID. */
        setSalesUnit: function (salesUnit) {
            store.salesUnit = salesUnit;
        },

        getEntities: function (nativeRecordType, successCallback, failCallback) {

            if (debug) { console.log(debug + 'getEntities', nativeRecordType); }

            var request = buildRequest(nativeRecordType, successCallback, failCallback);
            request.success = successCallback;
            jQuery.ajax(request);
        },

    };

    return service;
}]);
/**
 * @class captureApp.webServices.zoho
 * @memberOf captureApp.webServices
 * @description This is Zoho CRM AngularJS service.
 */

'use strict';

/* global angular: false */
/* global jQuery: false */

//app
angular.module('webServices')
.factory('zoho', ['$http', '$q', 'endpoints', 'dialogs', function ($http, $q, endpoints, dialogs) {
    var debug = 'zoho.js->'; //debug = false;

    var store = {};

    var url = '';

    var encode = function (string) {
        if (typeof string === 'undefined') { string = ''; }
        string += '';
        if (!string) { return ''; }
        return string.replace(/\&/g, '&' + 'amp;').replace(/</g, '&' + 'lt;').replace(/>/g, '&' + 'gt;').replace(/\'/g, '&' + 'apos;').replace(/\"/g, '&' + 'quot;');
    };

    var mapFromField = function (target, targetKey, sourceAsFLArray, sourceKey) {

        var source = sourceAsFLArray.FL;

        for (var i = 0, l = source.length; i < l; i++) {
            if (source[i].val === sourceKey) {
                target[targetKey] = source[i].content;
            }
        }

    };

    var mapField = function (source, sourceKey, target, targetKey) {

        var value;
        var sourceKeyParts = sourceKey.split('.');
        if (sourceKeyParts.length === 2) {
            try {
                value = source[sourceKeyParts[0]][sourceKeyParts[1]];
            } catch (e) {
                value = null;
            }
        }
        else { value = source[sourceKey]; }

        target.FL.push({ content: value, val: targetKey });
    };


    var fromContact = function (nativeRecord) {

        if (debug) {
            console.log(debug + 'fromContact:in', nativeRecord);
        }

        var captureRecord = {};
        mapFromField(captureRecord, 'first', nativeRecord, 'First Name');
        mapFromField(captureRecord, 'last', nativeRecord, 'Last Name');
        mapFromField(captureRecord, 'jobtitle', nativeRecord, 'Designation');
        mapFromField(captureRecord, 'company', nativeRecord, 'Company');
        mapFromField(captureRecord, 'email', nativeRecord, 'Email');
        mapFromField(captureRecord, 'phone', nativeRecord, 'Phone');
        mapFromField(captureRecord, 'phone2', nativeRecord, 'Mobile');
        mapFromField(captureRecord, 'website', nativeRecord, 'Website');
        mapFromField(captureRecord, 'bio', nativeRecord, 'Description');
        mapFromField(captureRecord, 'address1', nativeRecord, 'Street');
        mapFromField(captureRecord, 'city', nativeRecord, 'City');
        mapFromField(captureRecord, 'state', nativeRecord, 'State');
        mapFromField(captureRecord, 'zip', nativeRecord, 'Zip Code');
        mapFromField(captureRecord, 'country', nativeRecord, 'Country');
        //mapFromField(captureRecord, 'sourceurl', nativeRecord, 'LinkedIn');

        mapFromField(captureRecord, '_id', nativeRecord, 'CONTACTID');
        captureRecord._link = 'https://crm.zoho.com/crm/EntityInfo.do?module=Contacts&id=' + captureRecord._id;
        captureRecord._type = 'Contact';

        if (debug) {
            console.log(debug + 'fromContact:out', captureRecord);
        }

        return captureRecord;
    };

    var fromLead = function (nativeRecord) {

        if (debug) {
            console.log(debug + 'fromLead:in', nativeRecord);
        }

        var captureRecord = {};
        mapFromField(captureRecord, 'first', nativeRecord, 'First Name');
        mapFromField(captureRecord, 'last', nativeRecord, 'Last Name');
        mapFromField(captureRecord, 'jobtitle', nativeRecord, 'Designation');
        mapFromField(captureRecord, 'company', nativeRecord, 'Company');
        mapFromField(captureRecord, 'email', nativeRecord, 'Email');
        mapFromField(captureRecord, 'phone', nativeRecord, 'Phone');
        mapFromField(captureRecord, 'phone2', nativeRecord, 'Mobile');
        mapFromField(captureRecord, 'website', nativeRecord, 'Website');
        mapFromField(captureRecord, 'bio', nativeRecord, 'Description');
        mapFromField(captureRecord, 'address1', nativeRecord, 'Street');
        mapFromField(captureRecord, 'city', nativeRecord, 'City');
        mapFromField(captureRecord, 'state', nativeRecord, 'State');
        mapFromField(captureRecord, 'zip', nativeRecord, 'Zip Code');
        mapFromField(captureRecord, 'country', nativeRecord, 'Country');
        //mapFromField(captureRecord, 'sourceurl', nativeRecord, 'LinkedIn');

        mapFromField(captureRecord, '_id', nativeRecord, 'LEADID');
        captureRecord._link = 'https://crm.zoho.com/crm/EntityInfo.do?module=Leads&id=' + captureRecord._id;
        captureRecord._type = 'Lead';

        if (debug) {
            console.log(debug + 'fromLead:out', captureRecord);
        }

        return captureRecord;
    };

    var fromAccount = function (nativeRecord) {

        if (debug) {
            console.log(debug + 'fromAccount:in', nativeRecord);
        }

        var captureRecord = {};
        //mapFromField(captureRecord, 'first', nativeRecord, 'First Name');
        //mapFromField(captureRecord, 'last', nativeRecord, 'Last Name');
        //mapFromField(captureRecord, 'jobtitle', nativeRecord, 'Designation');
        mapFromField(captureRecord, 'company', nativeRecord, 'Account Name');
        mapFromField(captureRecord, 'email', nativeRecord, 'E-mail');
        mapFromField(captureRecord, 'phone', nativeRecord, 'Phone');
        //mapFromField(captureRecord, 'phone2', nativeRecord, 'Mobile');
        mapFromField(captureRecord, 'website', nativeRecord, 'Website');
        mapFromField(captureRecord, 'bio', nativeRecord, 'Description');
        //mapFromField(captureRecord, 'address1', nativeRecord, 'Street');
        //mapFromField(captureRecord, 'city', nativeRecord, 'City');
        //mapFromField(captureRecord, 'state', nativeRecord, 'State');
        //mapFromField(captureRecord, 'zip', nativeRecord, 'Zip Code');
        //mapFromField(captureRecord, 'country', nativeRecord, 'Country');
        //mapFromField(captureRecord, 'sourceurl', nativeRecord, 'LinkedIn');

        mapFromField(captureRecord, '_id', nativeRecord, 'ACCOUNTID');
        captureRecord._link = 'https://crm.zoho.com/crm/EntityInfo.do?module=Accounts&id=' + captureRecord._id;
        captureRecord._type = 'Account';

        if (debug) {
            console.log(debug + 'fromAccount:out', captureRecord);
        }

        return captureRecord;
    };

    var toLead = function (captureRecord) {

        if (debug) {
            console.log(debug + 'toLead:in', captureRecord);
        }

        var nativeRecord = { FL: [] };
        mapField(captureRecord, 'first', nativeRecord, 'First Name');
        mapField(captureRecord, 'last', nativeRecord, 'Last Name');
        mapField(captureRecord, 'jobtitle', nativeRecord, 'Designation');
        mapField(captureRecord, 'company', nativeRecord, 'Company');
        mapField(captureRecord, 'email', nativeRecord, 'Email');
        mapField(captureRecord, 'phone', nativeRecord, 'Phone');
        mapField(captureRecord, 'phone2', nativeRecord, 'Mobile');
        mapField(captureRecord, 'website', nativeRecord, 'Website');
        mapField(captureRecord, 'bio', nativeRecord, 'Description');
        mapField(captureRecord, 'address1', nativeRecord, 'Street');
        mapField(captureRecord, 'city', nativeRecord, 'City');
        mapField(captureRecord, 'state', nativeRecord, 'State');
        mapField(captureRecord, 'zip', nativeRecord, 'Zip Code');
        mapField(captureRecord, 'country', nativeRecord, 'Country');


        if (debug) {
            console.log(debug + 'toLead:out', nativeRecord);
        }

        return nativeRecord;
    };

    var toContact = function (captureRecord) {

        if (debug) {
            console.log(debug + 'toContact:in', captureRecord);
        }

        var nativeRecord = { FL: [] };
        mapField(captureRecord, 'first', nativeRecord, 'First Name');
        mapField(captureRecord, 'last', nativeRecord, 'Last Name');
        mapField(captureRecord, 'jobtitle', nativeRecord, 'Designation');
        mapField(captureRecord, 'email', nativeRecord, 'Email');
        mapField(captureRecord, 'phone', nativeRecord, 'Phone');
        mapField(captureRecord, 'phone2', nativeRecord, 'Mobile');
        mapField(captureRecord, 'bio', nativeRecord, 'Description');
        mapField(captureRecord, 'address1', nativeRecord, 'Street');
        mapField(captureRecord, 'city', nativeRecord, 'City');
        mapField(captureRecord, 'state', nativeRecord, 'State');
        mapField(captureRecord, 'zip', nativeRecord, 'Zip Code');
        mapField(captureRecord, 'country', nativeRecord, 'Country');

        if (debug) {
            console.log(debug + 'toContact:out', nativeRecord);
        }

        return nativeRecord;
    };

    var service = {

        getName: function () {
            return 'Zoho CRM';
        },

        /* Sets user credentials */
        init: function (o) {

            if (debug) { console.log('ZOHO: init->token', o.token); }

            //store.username = o.username;
            store.token = o.token;
        },

        //  Log us in
        login: function (successCallback, failCallback) {

            var token = store.token;
            if (!token) {
                try { failCallback('Please open Settings, enter valid user credentials and obtain Authorization Token.'); } catch (e) { }
                return;
            }

            console.log('ZOHO: auth token is ', token);
            try { successCallback('Logged in successfully'); } catch (e) { }
        },

        createToken: function (username, password, successCallback, failCallback) {

            var url = 'https://accounts.zoho.com/apiauthtoken/nb/create?SCOPE=ZohoCRM/crmapi&EMAIL_ID=' + username + '&PASSWORD=' + password;

            console.log('createToken');

            jQuery.ajax({
                method: 'Get',
                url: url,
                failure: function (a, b) {
                    console.log('FAILED to create token', a, b);
                    try { failCallback('Please check your internet connection'); } catch (e) { }
                },
                success: function (response) {

                    try {

                        console.log('create token response', response);

                        var regExp = /\AUTHTOKEN=([^*]+)\RESULT/;
                        var matches = regExp.exec(response);

                        if (matches === null) {


                            console.log('FAILED to get token');

                            try {

                                // May fail as:
                                //CAUSE=API_ACCESS_REQUEST_BLOCKED
                                //RESULT = FALSE

                                var regExp2 = /\CAUSE=([^*]+)\RESULT/;
                                var matches2 = regExp2.exec(response);
                                var errorCode = matches2[1].trim();

                                //if (errorCode === 'EXCEEDED_MAXIMUM_ALLOWED_AUTHTOKENS') {
                                //    try { failCallback('Zoho API error: EXCEEDED_MAXIMUM_ALLOWED_AUTHTOKENS'); } catch (e) { }
                                //}
                                //else if (errorCode === 'API_ACCESS_REQUEST_BLOCKED') {
                                //    try { failCallback('Zoho API error: API_ACCESS_REQUEST_BLOCKED'); } catch (e) { }
                                //}
                                //else {
                                try { failCallback('Zoho API error: ' + errorCode); } catch (e) { }
                                //}

                            } catch (e) {
                                console.log('ERROR in createToken.success [no AUTHTOKEN]', e.message);
                                try { failCallback('Please enter valid user credentials'); } catch (e) { }
                            }

                        }
                        else {

                            var token = matches[1].trim();

                            store.token = token;
                            //store.username = username;

                            try { successCallback(token); } catch (e) { }
                        }

                    } catch (e) {
                        console.log('ERROR in createToken.success', e.message);
                        try { failCallback('Error. Please contact Capture! support.'); } catch (e) { }
                    }

                }

            });
        },
        //-------------------------------------------EDIT END-----------------------------------------

        logout: function () {

            if (debug) { console.log(debug + 'calling is loggedin'); }
            store = {};

            try {
                jQuery.cookie('token_number', '');
                jQuery.cookie('emailid', '');
            } catch (e) {
            }

        },


        isLoggedIn: function (successCallback, failCallback) {

            try {

                if (debug) { console.log('isLoggedIn->store', store); }

                if (store && store.token) {
                    try { successCallback(); } catch (e) { }
                    return;
                } else {
                    try { failCallback(); } catch (e) { }
                    return;
                }

            } catch (e) {
                console.log('ERROR in isLoggedIn', e.message);
                try { failCallback(); } catch (e) { }
            }

        },

        asyncIsLoggedIn: function () {
            var deferred = $q.defer();
            service.isLoggedIn(
                function () { deferred.resolve(true); },
                function (msg) { deferred.reject(msg); }
            );
            return deferred.promise;
        },

        getEntities: function (successCallback, failCallback) {

            try { failCallback('Not implemented: getEntities'); } catch (e) { }

            //var url = store.url + '/services/data/v29.0/sobjects';

            //jQuery.ajax({
            //    type: 'GET',
            //    url: url,
            //    contentType: 'application/json',
            //    beforeSend: function (xhr) {
            //        xhr.setRequestHeader('Authorization', 'OAuth ' + store.id);
            //        xhr.setRequestHeader('Accept', 'application/json');
            //    },
            //    success: function (successResponse) {
            //        console.log('successResponse=', successResponse.sobjects);
            //        var list = [];
            //        angular.forEach(successResponse.sobjects, function (sobject, index) {
            //            list.push({ name: sobject.name, label: sobject.label });
            //        });
            //        successCallback(list);
            //    },
            //    error: function (errorResponse) {
            //        console.log('errorResponse=', errorResponse);
            //        if (errorResponse && errorResponse.responseJSON && errorResponse.responseJSON.length > 0 && errorResponse.responseJSON[0].message) {
            //            failureCallback(errorResponse.responseJSON[0].message);
            //        }
            //        else { failureCallback(errorResponse); }
            //    }

            //});

        },

        getFields: function (entityType, successCallback, failCallback) {

            try { failCallback('Not implemented: getFields'); } catch (e) { }

            //var url = store.url + '/services/data/v29.0/sobjects/' + entityType + '/describe';
            //console.log('getFields=', url);
            //jQuery.ajax({
            //    type: 'GET',
            //    url: url,
            //    contentType: 'application/json',
            //    beforeSend: function (xhr) {
            //        xhr.setRequestHeader('Authorization', 'OAuth ' + store.id);
            //        xhr.setRequestHeader('Accept', 'application/json');
            //    },
            //    success: function (successResponse) {

            //        console.log('successResponse=', successResponse);

            //        var ff = [];
            //        angular.forEach(successResponse.fields, function (field, index) {

            //            var vv = [];
            //            if (field.picklistValues) {
            //                angular.forEach(field.picklistValues, function (pv, pvi) {
            //                    vv.push({ value: pv.value, label: pv.label });
            //                });
            //            }

            //            var f = { name: field.name, label: field.label };

            //            if (vv.length > 0) { f.values = vv; }

            //            ff.push(f);
            //        });

            //        successCallback(ff);
            //    },
            //    error: function (errorResponse) {

            //        console.log('errorResponse=', errorResponse);
            //        failureCallback(errorResponse);
            //    }

            //});
        },




        xmlData: function (captureRecord, nativeRecordType) {

            var sendto;
            var name;
            if (nativeRecordType === 'Accounts') {
                sendto = 'Account Name';
                name = captureRecord.company;
            }
            else {
                sendto = 'Company';
                name = captureRecord.company;
            }

            var xmlreq = '<' + nativeRecordType + '>';
            xmlreq += '<row no="1"><FL val="' + sendto + '">' + encode(name) + '</FL>';
            if (captureRecord.first) {
                xmlreq += '<FL val="First Name">' + encode(captureRecord.first) + '</FL>';
            }
            if (captureRecord.last) {
                xmlreq += '<FL val="Last Name">' + encode(captureRecord.last) + '</FL>';
            }
            if (captureRecord.email) {
                xmlreq += '<FL val="Email">' + encode(captureRecord.email) + '</FL>';
            }
            if (captureRecord.email2) {
                xmlreq += '<FL val="Secondary Email">' + encode(captureRecord.email2) + '</FL>';
            }
            if (captureRecord.jobtitle) {
                xmlreq += '<FL val="Title">' + encode(captureRecord.jobtitle) + '</FL>';
            }
            if (captureRecord.phone) {
                xmlreq += '<FL val="Phone">' + encode(captureRecord.phone) + '</FL>';
            }
            if (captureRecord.phone2) {
                xmlreq += '<FL val="Mobile">' + encode(captureRecord.phone2) + '</FL>';
            }
            if (captureRecord.website) {
                xmlreq += '<FL val="Website">' + encode(captureRecord.website) + '</FL>';
            }
            if (nativeRecordType === 'Leads') {
                if (captureRecord.address) {
                    xmlreq += '<FL val="Street">' + encode(captureRecord.address) + '</FL>'; // address1+address2
                }
                if (captureRecord.city) {
                    xmlreq += '<FL val="City">' + encode(captureRecord.city) + '</FL>';
                }
                if (captureRecord.state) {
                    xmlreq += '<FL val="State">' + encode(captureRecord.state) + '</FL>';
                }
                if (captureRecord.zip) {
                    xmlreq += '<FL val="Zip Code">' + encode(captureRecord.zip) + '</FL>';
                }
                if (captureRecord.country) {
                    xmlreq += '<FL val="Country">' + encode(captureRecord.country) + '</FL>';
                }

                if (captureRecord.company) {
                    xmlreq += '<FL val="Company">' + encode(captureRecord.company) + '</FL>';
                }

            } else if (nativeRecordType === 'Contacts') {
                if (captureRecord.address) {
                    xmlreq += '<FL val="Mailing Street">' + encode(captureRecord.address) + '</FL>'; // address1+address2
                }
                if (captureRecord.city) {
                    xmlreq += '<FL val="Mailing City">' + encode(captureRecord.city) + '</FL>';
                }
                if (captureRecord.state) {
                    xmlreq += '<FL val="Mailing State">' + encode(captureRecord.state) + '</FL>';
                }
                if (captureRecord.zip) {
                    xmlreq += '<FL val="Mailing Zip">' + encode(captureRecord.zip) + '</FL>'; // yep... 
                }
                if (captureRecord.country) {
                    xmlreq += '<FL val="Mailing Country">' + encode(captureRecord.country) + '</FL>';
                }

                if (captureRecord.company) {
                    xmlreq += '<FL val="Account Name">' + encode(captureRecord.company) + '</FL>';
                }
            }

            if (captureRecord.bio) {
                xmlreq += '<FL val="Description">' + encode(captureRecord.bio) + '</FL>';
            }
            xmlreq += '</row></' + nativeRecordType + '>';
            return xmlreq;

        },

        /**
        * @function toNativeRecord
        * @description Converts Capture Contact to native record. 
        * @memberOf captureApp.webServices.zoho
        * @param {captureContact} captureRecord - Capture Contact
        * @param {recordType} recordType - Record type. 
        * @return {object} - Native record
        */
        toNativeRecord: function (captureRecord, recordType) {
            recordType = recordType.toLowerCase();
            if (recordType === 'contacts' || recordType === 'contact') { return toContact(captureRecord); }
            else if (recordType === 'leads' || recordType === 'lead') { return toLead(captureRecord); }
            return null;
        },

        /**
        * @function fromNativeRecord
        * @description Converts native record to Capture Contact. 
        * @memberOf captureApp.webServices.zoho
        * @param {object} nativeRecord - Native record
        * @param {recordType} recordType - Record type. 
        * @return {captureContact} - Capture Contact
        */
        fromNativeRecord: function (nativeRecord, recordType) {
            recordType = recordType.toLowerCase();
            if (recordType === 'contacts' || recordType === 'contact') { return fromContact(nativeRecord); }
            else if (recordType === 'leads' || recordType === 'lead') { return fromLead(nativeRecord); }
            return null;
        },

        //  From CRM object to lookup object (each object is defined as {label: '', link: ''})
        toLookupObject: function (crmObject, entityType) {

            if (debug) { console.log(debug + 'toLookupObject->entityType', entityType, '->crmObject', crmObject); }

            entityType = entityType.toLowerCase();
            var lookupObject = { label: '', link: '' };
            var appObject = null;
            if (entityType === 'contact') { appObject = fromContact(crmObject); }
            if (entityType === 'lead') { appObject = fromLead(crmObject); }
            if (entityType === 'account') {
                appObject = fromAccount(crmObject);
                var cityState = '';
                if (appObject.city) { cityState = appObject.city; }
                if (appObject.state) {
                    if (cityState) { cityState = cityState + ', ' + appObject.state; }
                    else { cityState = appObject.state; }
                }
                if (cityState) { cityState = ' (' + cityState + ')'; }
                lookupObject.label = (appObject.company || '(no name)') + cityState;
                lookupObject.link = appObject._link;
                lookupObject.id = appObject._id;
            }
            if (entityType === 'systemuser') {
                lookupObject.label = crmObject.FullName;
                lookupObject.link = crmObject.__metadata.uri;
                lookupObject.id = crmObject.SystemUserId;
            }

            return lookupObject;
        },

        /**
        * @function getRequiredLookups
        * @description Returns an array of lookups required prior to saving a record .
        * @memberOf captureApp.webServices.zoho
        * @param {string} entityType - 'lead', 'contact' or 'account'. 
        * @return {captureApp.webServices.exportTargetVer1~lookup[]}
        */
        getRequiredLookups: function (entityType) {

            entityType = entityType.toLowerCase();
            if (entityType === 'contact') {
                return [{ crmProperty: 'company', appProperty: 'company', message: 'Select parent account', type: 'Account', required: false, allowNew: false }
                ];
            }
            return [];
        },

        /**
        * @function getDefaultExportMaps
        * @description (Reserved for future use) Return an empty array. 
        * maps: [ {captureField: { name: '', label: '' }, crmField: { name: '', label: '' } } ]
        * @memberOf captureApp.webServices.zoho
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback  - pass the empty array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback 
        */
        getDefaultExportMaps: function (successCallback, failureCallback) {

            var maps = [];

            //maps.push({ name: 'contact', label: 'Contact', map: null });

            successCallback(maps);
        },

        /**
                * @function getDefinition
                * @description Returns configuration for Multi-Merge dialog. 
                * How to modify:
                * 1. Put native field names in def.fields.map.{Field}.id
                * 2. Remove lines that do not have corresponding native fields, or where fields are read-only
                * @memberOf captureApp.webServices.zoho
                * @param {string} recordType - 'lead', 'contact' or 'account'. 
                * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback  - pass the empty array
                * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback 
                */
        getDefinition: function (recordType, successCallback, failureCallback) {


            if (debug) { console.log(debug + 'getDefinition', recordType); }


            var def = {};
            recordType = recordType.toLowerCase();
            if (recordType === 'lead') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Description'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Description', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { id: 'First Name', display: 'First Name', group: 'G1' },
                            'LastName': { id: 'Last Name', display: 'Last Name', group: 'G1' },
                            'Title': { id: 'Title', display: 'Position', group: 'G1' },
                            'Company': { id: 'Account Name', display: 'Company', group: 'G1' },
                            'Email': { id: 'Email', display: 'Email 1', group: 'G1' },
                            //Email2?
                            'Phone': { id: 'Phone', display: 'Phone 1', group: 'G1' },
                            'MobilePhone': { id: 'Mobile', display: 'Phone 2', group: 'G1' },
                            //'Website': { id: 'Website', display: 'Website', group: 'G1' },
                            'Description': { id: 'Description', display: 'Comments', group: 'G1' },

                            'Street': { id: '"Street', display: 'Address', group: 'G2' },
                            'City': { id: 'City', display: 'City', group: 'G2' },
                            'State': { id: 'State', display: 'State/Province', group: 'G2' },
                            'PostalCode': { id: 'Zip Code', display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { id: 'Country', display: 'Country', group: 'G2' }
                        }
                    }
                };

            } else if (recordType === 'contact') {
                def = {
                    groups: {
                        list: ['G1', 'G2'],
                        map: {
                            'G1': { display: 'General', fields: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Description'] },
                            'G2': { display: 'Address', fields: ['Street', 'City', 'State', 'PostalCode', 'Country'] }
                        }
                    },
                    fields: {
                        list: ['FirstName', 'LastName', 'Title', 'Company', 'Email', 'Phone', 'MobilePhone', 'Description', 'Street', 'City', 'State', 'PostalCode', 'Country'],
                        map: {
                            'FirstName': { id: 'First Name', display: 'First Name', group: 'G1' },
                            'LastName': { id: 'Last Name', display: 'Last Name', group: 'G1' },
                            'Title': { id: 'Title', display: 'Position', group: 'G1' },
                            //'Company': { id: 'Account Name', display: 'Company', group: 'G1' },
                            'Email': { id: 'Email', display: 'Email 1', group: 'G1' },
                            //Email2?
                            'Phone': { id: 'Phone', display: 'Phone 1', group: 'G1' },
                            'MobilePhone': { id: 'Mobile', display: 'Phone 2', group: 'G1' },
                            //'Website': { id: 'Website', display: 'Website', group: 'G1' },
                            'Description': { id: 'Description', display: 'Comments', group: 'G1' },

                            'Street': { id: '"Mailing Street', display: 'Address', group: 'G2' },
                            'City': { id: 'Mailing City', display: 'City', group: 'G2' },
                            'State': { id: 'Mailing State', display: 'State/Province', group: 'G2' },
                            'PostalCode': { id: 'Mailing Zip', display: 'Zip/Postal Code', group: 'G2' },
                            'Country': { id: 'Mailing Country', display: 'Country', group: 'G2' }
                        }
                    }
                };
            } else {
                failureCallback('Invalid record type');
            }
            successCallback(def);
        },

        asyncGetDefinition: function (entityType) {
            var deferred = $q.defer();
            service.getDefinition(entityType,
                function (def) { deferred.resolve(def); },
                function (msg) { deferred.reject(msg); }
            );
            return deferred.promise;
        },

        //-- CRUD --//
        //  Create a record with data provided
        //      successCallback: function(recordId)
        //      data: { 
        //          type: 'lead' /* lead|contact|account */,
        //          record: { first: '', last: '', jobtitle: '', company: '', email: '', phone: '', phone2: '', website: '', bio: '', address1: '', address2: '', city: '', state: '', zip: '', country: '',  } /* capture record object */
        //      }
        //createRecord: function (data, successCallback, failCallback) {
        /**
        * @function createRecord
        * @description Creates record.
        * @memberOf captureApp.webServices.zoho
        * @param {recordType} recordType - Destination Record Type
        * @param {captureContact} captureRecord - Source Capture Record.
        * @param {object} createOptions - Options (For future use)
        * @param {captureApp.webServices.exportTargetVer1~createRecordSuccessCallback} successCallback 
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback
        */
        createRecord: function (recordType, captureRecord, createOptions, successCallback, failCallback) {

            var xmlreq = null;

            if (debug) { console.log(debug + 'createRecord', recordType, captureRecord, createOptions); }

            try {

                captureRecord.address = ((captureRecord.address1 ? captureRecord.address1 : '') +
                    (captureRecord.address2 ? ' ' + captureRecord.address2 : '')).trim();

                if (recordType.toUpperCase() === 'LEAD') {
                    if (captureRecord.last && captureRecord.company) {
                        xmlreq = service.xmlData(captureRecord, 'Leads');
                    }
                    else {
                        failCallback('Data must contain last and company name');
                        return;
                    }

                }
                if (recordType.toUpperCase() === 'ACCOUNT') {
                    if (captureRecord.company) {
                        xmlreq = service.xmlData(captureRecord, 'Accounts');
                    }
                    else {
                        failCallback('Data must contain Account name');
                        return;
                    }

                }
                if (recordType.toUpperCase() === 'CONTACT') {
                    if (captureRecord.last) {
                        var record = angular.copy(captureRecord);
                        // Set Account Name as in dialog
                        if (createOptions && createOptions.mappedProperties) {
                            var j = createOptions.mappedProperties.length;
                            while (j--)
                            { record[createOptions.mappedProperties[j].name] = createOptions.mappedProperties[j].label; }
                        }
                        xmlreq = service.xmlData(record, 'Contacts');
                    }
                    else {
                        failCallback('Data must contain last name');
                        return;
                    }

                }

                var token = store.token;

                //-----------------------edit-------------------------------------------------------------

                if (recordType.toUpperCase() === 'LEAD') {
                    service.createLead(xmlreq, token, successCallback);
                }
                else if (recordType.toUpperCase() === 'ACCOUNT') {
                    service.createAccount(xmlreq, token, successCallback);
                }
                else if (recordType.toUpperCase() === 'CONTACT')
                { service.createContact(xmlreq, token, successCallback); }


            } catch (e) { }
            //-----------------------edit [1]end-------------------------------------------------------------

        },


        createLead: function (xmlreq, token, successCallback, failCallback) {
            var url = 'https://crm.zoho.com/crm/private/xml/Leads/insertRecords?newFormat=1&authtoken=' + token + '&scope=crmapi';
            service.insertRecord(url, xmlreq, 'Leads', successCallback, failCallback);
        },

        createContact: function (xmlreq, token, successCallback, failCallback) {
            var url = 'https://crm.zoho.com/crm/private/xml/Contacts/insertRecords?newFormat=1&authtoken=' + token + '&scope=crmapi';
            service.insertRecord(url, xmlreq, 'Contacts', successCallback, failCallback);
        },

        createAccount: function (xmlreq, token, successCallback, failCallback) {
            var url = 'https://crm.zoho.com/crm/private/xml/Accounts/insertRecords?newFormat=1&authtoken=' + token + '&scope=crmapi';
            service.insertRecord(url, xmlreq, 'Accounts', successCallback, failCallback);
        },

        insertRecord: function (inserturl, xmlreq, nativeRecordType, successCallback, failCallback) {
            jQuery.ajax({
                method: 'post',
                url: inserturl,
                data: { xmlData: xmlreq },
                failure: function () {
                    failCallback('Please check your internet connection');
                },
                success: function (response) {
                    console.log(response);
                    var xmlText = new XMLSerializer().serializeToString(response),
                    xmlDoc = jQuery.parseXML(xmlText),
                    $xmldataresponse = jQuery(xmlDoc),
                    $message = $xmldataresponse.find('message').text();
                    if ($message.indexOf('successfully') > -1) {
                        var id = $xmldataresponse.find('recorddetail').children().first().text();
                        console.log('ZOHO ID', id);
                        var link = 'https://crm.zoho.com/crm/EntityInfo.do?module=' + nativeRecordType + '&id=' + id;
                        successCallback(link);
                    }
                    else {
                        failCallback('Record inserting Failled due to some technical problem');
                    }
                }
            });

        },

        //  Update an existing record with data
        //      successCallback: function(recordId)
        updateRecord: function (recordId, recordType, data, successCallback, failCallback) {

            try {

                var token = store.token;

                if (recordType.toUpperCase() === 'LEAD') {
                    recordType = 'Leads';
                } else if (recordType.toUpperCase() === 'ACCOUNT') {
                    recordType = 'Accounts';
                } else if (recordType.toUpperCase() === 'CONTACT') {
                    recordType = 'Contacts';
                }

                var captureRecord = service.fromNativeRecord(data, recordType);

                var xmlreq = service.xmlData(captureRecord, recordType);

                jQuery.ajax({
                    method: 'POST',
                    url: 'https://crm.zoho.com/crm/private/xml/' + recordType + '/updateRecords?authtoken=' + token + '&scope=crmapi&id=' + recordId,
                    data: { xmlData: xmlreq },
                    failure: function () {
                        failCallback('Please check your internet connection');
                    },
                    success: function (response) {

                        var xmlText = new XMLSerializer().serializeToString(response),
                        xmlDoc = jQuery.parseXML(xmlText),
                        $xmldataresponse = jQuery(xmlDoc),
                        $message = $xmldataresponse.find('message').text();
                        if ($message.indexOf('successfully') > -1) {
                            successCallback();
                        }
                        else {
                            console.log('ERROR returned by Zoho API', $message);
                            failCallback('Record does not exist');
                        }
                    }
                });

            } catch (e) {
                console.log('ERROR in updateRecord' + e.error);
                try { failCallback('Cannot update this record'); } catch (e) { }
            }

        },

        //  Retrieve record from service
        //      successCallback: function(recordId, data)
        retrieveRecord: function (recordId, recordType, successCallback, failCallback) {

            var token = store.token;

            var f = function (id, nativeRecordType) {

                jQuery.ajax({
                    method: 'POST',
                    url: 'https://crm.zoho.com/crm/private/json/' + nativeRecordType + '/getRecordById?newFormat=1&authtoken=' + token + '&scope=crmapi&id=' + id,
                    failure: function () {
                        try { failCallback('Please check your internet connection'); } catch (e) { }
                    },
                    success: function (response) {
                        try {
                            successCallback(response.response.result[nativeRecordType].row);
                        } catch (e) {
                            console.log('ERROR in retrieveRecord->POST' + e.error);
                            try { failCallback('Cannot retrieve this record'); } catch (e) { }
                        }
                    }
                });

            };

            try {

                if (recordType.toUpperCase() === 'LEAD') {
                    f(recordId, 'Leads');
                } else if (recordType.toUpperCase() === 'CONTACT') {
                    f(recordId, 'Contacts');
                }

            } catch (e) {
                console.log('ERROR in retrieveRecord' + e.error);
                try { failCallback('Cannot retrieve this record'); } catch (e) { }
            }

        },

        asyncRetrieveRecord: function (recordId, recordType) {
            var deferred = $q.defer();
            service.retrieveRecord(recordId, recordType,
                function (response) { deferred.resolve(response); },
                function (msg) { deferred.reject(msg); }
            );
            return deferred.promise;
        },

        //  Delete record from service
        //      successCallback: function(recordId)
        deleteRecord: function (recordId, successCallback, failCallback) {
            try { failCallback('Not implemented: deleteRecord'); } catch (e) { }
        },
        //-- /CRUD --//


        //-- Search --//
        //  Find a record using a query: { first:'', last:'', email:''} object
        //      successCallback: function(nativeRecords[])
        findRecord: function (recordType, query, fields, successCallback, failCallback) {

            if (debug) { console.log(debug + 'findRecord->type:', recordType, '->query:', query, '->fields:', fields); }

            
            var nativeRecordType = '';
            recordType = (recordType || '').toLowerCase();
            if (recordType === 'account') { nativeRecordType = 'Accounts'; }
            if (recordType === 'lead') { nativeRecordType = 'Leads'; }
            if (recordType === 'contact') { nativeRecordType = 'Contacts'; }
   


            var criteria = '';
            if (recordType === 'account') {

                if (query.company) {
                    criteria = '(Account Name:' + encode(query.company) + ')&selectColumns=Accounts(Account%20Name)';
                }
            }


            if (debug) { console.log(debug + 'findRecords->type:', nativeRecordType, '->criteria:', criteria); }
            var token = store.token;
            jQuery.ajax({
                method: 'POST',
                url: 'https://crm.zoho.com/crm/private/json/' + nativeRecordType + '/searchRecords?newFormat=1&authtoken=' + token + '&scope=crmapi&criteria=' + criteria,
                failure: function () {
                    try { failCallback('Please check your internet connection'); } catch (e) { }
                },
                success: function (response) {

                    try {

                        if (debug) { console.log(debug + 'findRecord->response:', response); }

                        if (response.response.error && response.response.error.message) {
                            try { failCallback(response.response.error.message); } catch (e) { }
                            return;
                        }

                        if (!response.response.nodata) {

                            var rows = response.response.result[nativeRecordType].row;

                            // single record?
                            if (!Array.isArray(rows)) {
                                rows = [rows];
                            }

                            try { successCallback(rows); } catch (e) { }

                        } else {

                            try { successCallback([]); } catch (e) { }

                        }

                    } catch (e) {
                        console.log('ERROR in findRecord', e);
                        try { failCallback('Record search failled'); } catch (e) { }
                    }

                }
            });

        },
        //-- /Search --//


        //-- Auth --//
        //  Authenticate with the service
        //      successCallback: function(authId)
        authenticate: function (credentials, successCallback, failCallback) {
            try {

                //--------------------EDIT------------------------------------------------------------
                jQuery.ajax({
                    method: 'Get',
                    url: url,
                    success: function (response) {
                        var regExp = /\AUTHTOKEN=([^*]+)\RESULT/;
                        var matches = regExp.exec(response);
                        if (matches === null) {
                            failCallback('Please open Settings and enter your valid user credentials or check Is user loggedIn into http://zoho.com/crm');
                        }
                        else {
                            successCallback();


                        }
                    }
                });
                //-------------------- END EDIT-----------------------------------------------------------------
            } catch (e) { }

        },

        //  is this client currently authenticated?
        //      return true/false
        isAuthenticated: function () {

        },
        //-- /Auth --//


        //-- Define --//
        //  Get a list of all available entities (lead, contact, account, etc)
        //      successCallback: function(entityList)
        listEntities: function (successCallback, failCallback) {
            try { failCallback('Not implemented: listEntities'); } catch (e) { }
        },

        //  Get the definition for an entity (field names of a lead or contact)
        //      successCallback: function(entityDefinition)
        defineEntity: function (entity, successCallback, failCallback) {
            try { failCallback('Not implemented: defineEntity'); } catch (e) { }
        },
        //-- /Define --//

        /**
        * @function findDuplicates
        * @description Returns an array of duplicate records of given type.
        * @memberOf captureApp.webServices.zoho
        * @param {captureContact} recordType - Record type. 
        * @param {captureContact} captureRecord - Source Capture Contact. 
        * @param {captureApp.webServices.exportTargetVer1~successCallback} successCallback - Pass the resulting array
        * @param {captureApp.webServices.exportTargetVer1~failCallback} failCallback  
        * @return {captureContact[]} - Array of Capture Contacts
        */
        findDuplicates: function (recordType, captureRecord, successCallback, failCallback) {

            var dups = [];

            var reponseHandle = null;
            var returnResponse = function () {
                try {
                    successCallback({ duplicates: dups });
                } catch (e) { }
            };

            var findRecords = function (criteria, nativeRecordType) {

                var token = store.token;

                if (debug) { console.log(debug + 'findRecords->type:', nativeRecordType, '->criteria:', criteria); }

                jQuery.ajax({
                    method: 'POST',
                    url: 'https://crm.zoho.com/crm/private/json/' + nativeRecordType + '/searchRecords?newFormat=1&authtoken=' + token + '&scope=crmapi&criteria=' + criteria,
                    failure: function () {
                        try { failCallback('Please check your internet connection'); } catch (e) { }
                    },
                    success: function (response) {

                        try {
                            if (debug) { console.log(debug + 'findRecords->response:', response); }

                            if (!response.response.nodata) {

                                var rows = response.response.result[nativeRecordType].row;

                                // single record?
                                if (!Array.isArray(rows)) {
                                    rows = [rows];
                                }

                                for (var i = 0, l = rows.length; i < l; i++) {

                                    var row = rows[i];

                                    var dup = service.fromNativeRecord(row, nativeRecordType);

                                    if (dup) {
                                        dups.push(dup);
                                    }
                                }
                            }

                            //try { successCallback({ duplicates: dups }); } catch (e) { }

                            if (reponseHandle) {
                                window.clearTimeout(reponseHandle);
                            }
                            reponseHandle = window.setTimeout(returnResponse, 2000);

                        } catch (e) {
                            console.log('ERROR in findRecords', e);
                            failCallback('Record search failled');
                        }

                    }
                });

            };

            var criteria = '';
            if (recordType.toUpperCase() === 'LEAD') {

                if (captureRecord.email) {
                    criteria = '(Email:' + encode(captureRecord.email) + ')';
                    findRecords(criteria, 'Leads');
                }

                if (captureRecord.last) {
                    criteria = '((Last Name:' + encode(captureRecord.last) + ')AND(First Name:' + encode(captureRecord.first) + '))';
                    findRecords(criteria, 'Leads');
                }

                if (captureRecord.email2) {
                    criteria = '(Email:' + encode(captureRecord.email2) + ')';
                    findRecords(criteria, 'Leads');
                }


            } else if (recordType.toUpperCase() === 'CONTACT') {

                if (captureRecord.email) {
                    criteria = '(Email:' + encode(captureRecord.email) + ')';
                    findRecords(criteria, 'Contacts');
                }

                if (captureRecord.last) {
                    criteria = '((Last Name:' + encode(captureRecord.last) + ')AND(First Name:' + encode(captureRecord.first) + '))';
                    findRecords(criteria, 'Contacts');
                }

                if (captureRecord.email2) {
                    criteria = '(Email:' + encode(captureRecord.email2) + ')';
                    findRecords(criteria, 'Contacts');
                }

            }



        }

    };
    return service;
}]);
'use strict';

/* global angular: false */

/**
 * @class captureApp.webServices.exportWrapperService
 * @memberOf captureApp.webServices  
 * @description This service wraps all other export services and is consumed by the client application.
 */

angular.module('webServices')
    .factory('exportWrapperService', [

        'salesforce', 'salesloft', 'dynamicsCrm', 'pipeliner', 'zoho', 'pcrecruiter', 'marketo', 'jobscience',

        function (salesforceService, salesloftService, dynamicsService, pipelinerService, zohoService, pcrecruiterService, marketoService, jobscienceService) {
            return {

                /**
                  * @function getService
                  * @description Return name of export target.
                  * @memberOf captureApp.webServices.exportWrapperService
                  * @param {serviceCode} serviceCode - Export service code.
                  */
                getService: function (serviceCode) {

                    //console.log('*** get service', serviceCode);

                    var exportService = null;

                    if (serviceCode === 'sf') { exportService = salesforceService; }
                    else if (serviceCode === 'sl') { exportService = salesloftService; }
                    else if (serviceCode === 'ms') { exportService = dynamicsService; }
                    else if (serviceCode === 'mk') { exportService = marketoService; }
                    else if (serviceCode === 'pc') { exportService = pcrecruiterService; }
                    else if (serviceCode === 'pp') { exportService = pipelinerService; }
                    else if (serviceCode === 'zh') { exportService = zohoService; }
                    else if (serviceCode === 'js') { exportService = jobscienceService; }


                    return exportService;
                },

                getServicesList: function (isProduction, licenseType) {

                    //console.log('*** get services list');

                    var crms = [];
                    //crms.push({ label: '- CSV Only -', value: 'no' });
                    crms.push({ label: marketoService.getName(), value: 'mk' });
                    crms.push({ label: dynamicsService.getName(), value: 'ms' });
                    if (licenseType && licenseType !== 'Free') {
                        crms.push({ label: pcrecruiterService.getName(), value: 'pc' });
                    }
                    //if (licenseType && licenseType !== 'Free') {
                    crms.push({ label: pipelinerService.getName(), value: 'pp' });
                    //}
                    if (!isProduction) {
                        crms.push({ label: salesloftService.getName(), value: 'sl' });
                    }
                    crms.push({ label: salesforceService.getName(), value: 'sf' });
                    crms.push({ label: zohoService.getName(), value: 'zh' });
                    if (licenseType && licenseType !== 'Free') {
                        crms.push({ label: jobscienceService.getName(), value: 'js' });
                    }
                    crms.push({ label: 'Other / No CRM', value: 'no' });

                    return crms;

                },

                validateService: function (service) {

                    console.log('Validating service');

                    var errors = [];

                    try {

                        if (!service) {
                            errors.push('Service object is required');
                        } else {

                            if (typeof service.getName !== 'function') { errors.push('Function "getName" is not implemented'); }
                            if (typeof service.login !== 'function') { errors.push('Function "login" is not implemented'); }
                            if (typeof service.init !== 'function') { errors.push('Function "init" is not implemented'); }
                            if (typeof service.logout !== 'function') { errors.push('Function "logout" is not implemented'); }
                            if (typeof service.isLoggedIn !== 'function') { errors.push('Function "isLoggedIn" is not implemented'); }
                            if (typeof service.createRecord !== 'function') { errors.push('Function "createRecord" is not implemented'); }
                            if (typeof service.updateRecord !== 'function') { errors.push('Function "updateRecord" is not implemented'); }
                            if (typeof service.getRequiredLookups !== 'function') { errors.push('Function "getRequiredLookups" is not implemented'); }
                            if (typeof service.getDefaultExportMaps !== 'function') { errors.push('Function "getDefaultExportMaps" is not implemented'); }
                            if (typeof service.getDefinition !== 'function') { errors.push('Function "getDefinition" is not implemented'); }
                            if (typeof service.toNativeRecord !== 'function') { errors.push('Function "toNativeRecord" is not implemented'); }
                            if (typeof service.fromNativeRecord !== 'function') { errors.push('Function "fromNativeRecord" is not implemented'); }
                            if (typeof service.findDuplicates !== 'function') { errors.push('Function "findDuplicates" is not implemented'); }
                            if (typeof service.retrieveRecord !== 'function') { errors.push('Function "retrieveRecord" is not implemented'); }
                            if (typeof service.validateRecord !== 'function') { errors.push('Function "validateRecord" is not implemented'); }

                        }

                    } catch (e) {
                        errors.push('Validation code failed: ' + e.message);
                    }

                    if (errors.length === 0) {
                        console.log('Service is valid');
                    } else {
                        console.log('Service is not valid!');
                        console.log('Errors:');
                        var i = errors.length;
                        while (i--) {
                            console.log('* ' + errors[i]);
                        }
                    }

                    return errors.length === 0;
                }

            };
        }

    ]);


'use strict';

/* global angular: false */

angular.module('webServices')
.factory('storageService', ['$http', 'endpoints', 'xmlUtility', 'contactUtility', 'chromeUtility', 'userInfoStore', function ($http, endpoints, xmlUtility, contactUtility, chromeUtility, userInfoStore) {
    var debug = 'storage-service.js->'; debug = false;

    var setProfile = function (profile) {
        //store.persistent.profile = profile;
        //saveStore();
    };

    var service = {

        get: function (keys, successCallback, failureCallback) {
            var service = this;

            var url = endpoints.storageService() + 'get';

            var params = {
                keys: keys
            };

            var config = {
                headers: { 'Content-type': 'application/json', 'Accept': 'application/json', 'BroadlookSitekey': userInfoStore.getSiteKey() }
            };
            if (debug) { console.log('storageService.get...', { url: url, params: params, config: config }); }

            $http.post(url, params, config)
                .success(function (response) {
                    if (debug) { console.log(debug + 'get.success', response); }
                    if (!response) {
                        if (debug) { console.log('Unknown storage service response:', response); }
                        try { failureCallback('Storage service is unavailable. Please try again later. Error code: SS-68.'); } catch (e) { }
                    } else if (response.success) {
                        var o = {};
                        for (var i = 0; i < response.values.length; i++) {
                            var key = response.values[i].key;

                            var value = response.values[i].value;
                            if (value !== null && value !== '')
                            { value = JSON.parse(value); }

                            //var value = JSON.parse(response.values[i].value);
                            o[key] = value;
                        }
                        try { successCallback(o); } catch (e) { }
                    } else {
                        try { failureCallback(response.message); } catch (e) { }
                    }
                })
                .error(function (data, status, headers, config) {
                    if (debug) { console.log(debug + 'get.error:' + status); }
                    try { failureCallback('Storage service is not available. Please try again later. Error code: SS-88. Url: ' + (url || '')); } catch (e) { }
                });
        },

        set: function (values, successCallback, failureCallback) {
            var service = this;

            var url = endpoints.storageService() + 'set';

            var params = {
                values: []
            };

            for (var prop in values) {
                if (values[prop] !== null && prop) {
                    params.values.push({ key: prop, value: JSON.stringify(values[prop]) });
                }
            }

            var config = {
                headers: { 'Content-type': 'application/json', 'Accept': 'application/json', 'BroadlookSitekey': userInfoStore.getSiteKey() }
            };
            if (debug) { console.log('storageService.set...', { url: url, params: params, config: config }); }

            $http.post(url, params, config)
                .success(function (response) {
                    if (debug) { console.log('storageService.set:', response); }
                    if (!response) {
                        if (debug) { console.log('Unknown storage service response:', response); }
                        try { failureCallback('Storage service is unavailable. Please try again later. Error code: SS-118.'); } catch (e) { }
                    } else if (response.success) {
                        try { successCallback(); } catch (e) { }
                    } else {
                        try { failureCallback(response.message); } catch (e) { }
                    }
                })
                .error(function (data, status, headers, config) {
                    if (debug) { console.log('storageService.set.error:' + status, data); }
                    try { failureCallback('Storage service is unavailable. Please try again later. Error code: SS-127.'); } catch (e) { }
                });
        }
    };
    return service;

}]);

