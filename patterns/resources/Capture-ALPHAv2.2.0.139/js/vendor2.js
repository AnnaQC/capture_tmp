function X2JS(v){var q="1.1.5";v=v||{};h();r();function h(){if(v.escapeMode===undefined){v.escapeMode=true;}v.attributePrefix=v.attributePrefix||"_";v.arrayAccessForm=v.arrayAccessForm||"none";v.emptyNodeForm=v.emptyNodeForm||"text";if(v.enableToStringFunc===undefined){v.enableToStringFunc=true;}v.arrayAccessFormPaths=v.arrayAccessFormPaths||[];if(v.skipEmptyTextNodesForObj===undefined){v.skipEmptyTextNodesForObj=true;}if(v.stripWhitespaces===undefined){v.stripWhitespaces=true;}v.datetimeAccessFormPaths=v.datetimeAccessFormPaths||[];}var g={ELEMENT_NODE:1,TEXT_NODE:3,CDATA_SECTION_NODE:4,COMMENT_NODE:8,DOCUMENT_NODE:9};function r(){function x(z){var y=String(z);if(y.length===1){y="0"+y;}return y;}if(typeof String.prototype.trim!=="function"){String.prototype.trim=function(){return this.replace(/^\s+|^\n+|(\s|\n)+$/g,"");};}if(typeof Date.prototype.toISOString!=="function"){Date.prototype.toISOString=function(){return this.getUTCFullYear()+"-"+x(this.getUTCMonth()+1)+"-"+x(this.getUTCDate())+"T"+x(this.getUTCHours())+":"+x(this.getUTCMinutes())+":"+x(this.getUTCSeconds())+"."+String((this.getUTCMilliseconds()/1000).toFixed(3)).slice(2,5)+"Z";};}}function t(x){var y=x.localName;if(y==null){y=x.baseName;}if(y==null||y==""){y=x.nodeName;}return y;}function o(x){return x.prefix;}function p(x){if(typeof(x)=="string"){return x.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;");}else{return x;}}function j(x){return x.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&#x2F;/g,"/");}function l(B,y,A){switch(v.arrayAccessForm){case"property":if(!(B[y] instanceof Array)){B[y+"_asArray"]=[B[y]];}else{B[y+"_asArray"]=B[y];}break;}if(!(B[y] instanceof Array)&&v.arrayAccessFormPaths.length>0){var x=0;for(;x<v.arrayAccessFormPaths.length;x++){var z=v.arrayAccessFormPaths[x];if(typeof z==="string"){if(z==A){break;}}else{if(z instanceof RegExp){if(z.test(A)){break;}}else{if(typeof z==="function"){if(z(B,y,A)){break;}}}}}if(x!=v.arrayAccessFormPaths.length){B[y]=[B[y]];}}}function a(C){var A=C.split(/[-T:+Z]/g);var B=new Date(A[0],A[1]-1,A[2]);var z=A[5].split(".");B.setHours(A[3],A[4],z[0]);if(z.length>1){B.setMilliseconds(z[1]);}if(A[6]&&A[7]){var y=A[6]*60+Number(A[7]);var x=/\d\d-\d\d:\d\d$/.test(C)?"-":"+";y=0+(x=="-"?-1*y:y);B.setMinutes(B.getMinutes()-y-B.getTimezoneOffset());}else{if(C.indexOf("Z",C.length-1)!==-1){B=new Date(Date.UTC(B.getFullYear(),B.getMonth(),B.getDate(),B.getHours(),B.getMinutes(),B.getSeconds(),B.getMilliseconds()));}}return B;}function n(A,y,z){if(v.datetimeAccessFormPaths.length>0){var B=z.split(".#")[0];var x=0;for(;x<v.datetimeAccessFormPaths.length;x++){var C=v.datetimeAccessFormPaths[x];if(typeof C==="string"){if(C==B){break;}}else{if(C instanceof RegExp){if(C.test(B)){break;}}else{if(typeof C==="function"){if(C(obj,y,B)){break;}}}}}if(x!=v.datetimeAccessFormPaths.length){return a(A);}else{return A;}}else{return A;}}function w(z,E){if(z.nodeType==g.DOCUMENT_NODE){var F=new Object;var x=z.childNodes;for(var G=0;G<x.length;G++){var y=x.item(G);if(y.nodeType==g.ELEMENT_NODE){var D=t(y);F[D]=w(y,D);}}return F;}else{if(z.nodeType==g.ELEMENT_NODE){var F=new Object;F.__cnt=0;var x=z.childNodes;for(var G=0;G<x.length;G++){var y=x.item(G);var D=t(y);if(y.nodeType!=g.COMMENT_NODE){F.__cnt++;if(F[D]==null){F[D]=w(y,E+"."+D);l(F,D,E+"."+D);}else{if(F[D]!=null){if(!(F[D] instanceof Array)){F[D]=[F[D]];l(F,D,E+"."+D);}}(F[D])[F[D].length]=w(y,E+"."+D);}}}for(var A=0;A<z.attributes.length;A++){var B=z.attributes.item(A);F.__cnt++;F[v.attributePrefix+B.name]=B.value;}var C=o(z);if(C!=null&&C!=""){F.__cnt++;F.__prefix=C;}if(F["#text"]!=null){F.__text=F["#text"];if(F.__text instanceof Array){F.__text=F.__text.join("\n");}if(v.escapeMode){F.__text=j(F.__text);}if(v.stripWhitespaces){F.__text=F.__text.trim();}delete F["#text"];if(v.arrayAccessForm=="property"){delete F["#text_asArray"];}F.__text=n(F.__text,D,E+"."+D);}if(F["#cdata-section"]!=null){F.__cdata=F["#cdata-section"];delete F["#cdata-section"];if(v.arrayAccessForm=="property"){delete F["#cdata-section_asArray"];}}if(F.__cnt==1&&F.__text!=null){F=F.__text;}else{if(F.__cnt==0&&v.emptyNodeForm=="text"){F="";}else{if(F.__cnt>1&&F.__text!=null&&v.skipEmptyTextNodesForObj){if((v.stripWhitespaces&&F.__text=="")||(F.__text.trim()=="")){delete F.__text;}}}}delete F.__cnt;if(v.enableToStringFunc&&(F.__text!=null||F.__cdata!=null)){F.toString=function(){return(this.__text!=null?this.__text:"")+(this.__cdata!=null?this.__cdata:"");};}return F;}else{if(z.nodeType==g.TEXT_NODE||z.nodeType==g.CDATA_SECTION_NODE){return z.nodeValue;}}}}function m(E,B,D,y){var A="<"+((E!=null&&E.__prefix!=null)?(E.__prefix+":"):"")+B;if(D!=null){for(var C=0;C<D.length;C++){var z=D[C];var x=E[z];if(v.escapeMode){x=p(x);}A+=" "+z.substr(v.attributePrefix.length)+"='"+x+"'";}}if(!y){A+=">";}else{A+="/>";}return A;}function i(y,x){return"</"+(y.__prefix!=null?(y.__prefix+":"):"")+x+">";}function s(y,x){return y.indexOf(x,y.length-x.length)!==-1;}function u(y,x){if((v.arrayAccessForm=="property"&&s(x.toString(),("_asArray")))||x.toString().indexOf(v.attributePrefix)==0||x.toString().indexOf("__")==0||(y[x] instanceof Function)){return true;}else{return false;}}function k(z){var y=0;if(z instanceof Object){for(var x in z){if(u(z,x)){continue;}y++;}}return y;}function b(z){var y=[];if(z instanceof Object){for(var x in z){if(x.toString().indexOf("__")==-1&&x.toString().indexOf(v.attributePrefix)==0){y.push(x);}}}return y;}function f(y){var x="";if(y.__cdata!=null){x+="<![CDATA["+y.__cdata+"]]>";}if(y.__text!=null){if(v.escapeMode){x+=p(y.__text);}else{x+=y.__text;}}return x;}function c(y){var x="";if(y instanceof Object){x+=f(y);}else{if(y!=null){if(v.escapeMode){x+=p(y);}else{x+=y;}}}return x;}function e(z,B,A){var x="";if(z.length==0){x+=m(z,B,A,true);}else{for(var y=0;y<z.length;y++){x+=m(z[y],B,b(z[y]),false);x+=d(z[y]);x+=i(z[y],B);}}return x;}function d(D){var x="";var B=k(D);if(B>0){for(var A in D){if(u(D,A)){continue;}var z=D[A];var C=b(z);if(z==null||z==undefined){x+=m(z,A,C,true);}else{if(z instanceof Object){if(z instanceof Array){x+=e(z,A,C);}else{if(z instanceof Date){x+=m(z,A,C,false);x+=z.toISOString();x+=i(z,A);}else{var y=k(z);if(y>0||z.__text!=null||z.__cdata!=null){x+=m(z,A,C,false);x+=d(z);x+=i(z,A);}else{x+=m(z,A,C,true);}}}}else{x+=m(z,A,C,false);x+=c(z);x+=i(z,A);}}}}x+=c(D);return x;}this.parseXmlString=function(z){var B=window.ActiveXObject||"ActiveXObject" in window;if(z===undefined){return null;}var A;if(window.DOMParser){var C=new window.DOMParser();var x=null;if(!B){try{x=C.parseFromString("INVALID","text/xml").childNodes[0].namespaceURI;}catch(y){x=null;}}try{A=C.parseFromString(z,"text/xml");if(x!=null&&A.getElementsByTagNameNS(x,"parsererror").length>0){A=null;}}catch(y){A=null;}}else{if(z.indexOf("<?")==0){z=z.substr(z.indexOf("?>")+2);}A=new ActiveXObject("Microsoft.XMLDOM");A.async="false";A.loadXML(z);}return A;};this.asArray=function(x){if(x instanceof Array){return x;}else{return[x];}};this.toXmlDateTime=function(x){if(x instanceof Date){return x.toISOString();}else{if(typeof(x)==="number"){return new Date(x).toISOString();}else{return null;}}};this.asDateTime=function(x){if(typeof(x)=="string"){return a(x);}else{return x;}};this.xml2json=function(x){return w(x);};this.xml_str2json=function(x){var y=this.parseXmlString(x);if(y!=null){return this.xml2json(y);}else{return null;}};this.json2xml_str=function(x){return d(x);};this.json2xml=function(y){var x=this.json2xml_str(y);return this.parseXmlString(x);};this.getVersion=function(){return q;};}
/**
 *  author:		Timothy Groves - http://www.brandspankingnew.net
 *	version:	1.2 - 2006-11-17
 *              1.3 - 2006-12-04
 *              2.0 - 2007-02-07
 *              2.1.1 - 2007-04-13
 *              2.1.2 - 2007-07-07
 *              2.1.3 - 2007-07-19
 *
 */


if (typeof(bsn) == "undefined")
	_b = bsn = {};


if (typeof(_b.Autosuggest) == "undefined")
	_b.Autosuggest = {};
else
	alert("Autosuggest is already set!");












_b.AutoSuggest = function (id, param)
{
	// no DOM - give up!
	//
	if (!document.getElementById)
		return 0;
	
	
	
	
	// get field via DOM
	//
	this.fld = _b.DOM.gE(id);

	if (!this.fld)
		return 0;
	
	
	
	
	// init variables
	//
	this.sInp 	= "";
	this.nInpC 	= 0;
	this.aSug 	= [];
	this.iHigh 	= 0;
	
	
	
	
	// parameters object
	//
	this.oP = param ? param : {};
	
	// defaults	
	//
	var k, def = {minchars:1, meth:"get", varname:"input", className:"autosuggest", timeout:2500, delay:500, offsety:-5, shownoresults: true, noresults: "No results!", maxheight: 250, cache: true, maxentries: 25};
	for (k in def)
	{
		if (typeof(this.oP[k]) != typeof(def[k]))
			this.oP[k] = def[k];
	}
	
	
	// set keyup handler for field
	// and prevent autocomplete from client
	//
	var p = this;
	
	// NOTE: not using addEventListener because UpArrow fired twice in Safari
	//_b.DOM.addEvent( this.fld, 'keyup', function(ev){ return pointer.onKeyPress(ev); } );
	
	this.fld.onkeypress 	= function(ev){ return p.onKeyPress(ev); };
	this.fld.onkeyup 		= function(ev){ return p.onKeyUp(ev); };
	
	this.fld.setAttribute("autocomplete","off");
};
















_b.AutoSuggest.prototype.onKeyPress = function(ev)
{
	
	var key = (window.event) ? window.event.keyCode : ev.keyCode;



	// set responses to keydown events in the field
	// this allows the user to use the arrow keys to scroll through the results
	// ESCAPE clears the list
	// TAB sets the current highlighted value
	//
	var RETURN = 13;
	var TAB = 9;
	var ESC = 27;
	
	var bubble = 1;

	switch(key)
	{
		case RETURN:
			this.setHighlightedValue();
			bubble = 0;
			break;

		case ESC:
			this.clearSuggestions();
			break;
	}

	return bubble;
};



_b.AutoSuggest.prototype.onKeyUp = function(ev)
{
	var key = (window.event) ? window.event.keyCode : ev.keyCode;
	


	// set responses to keydown events in the field
	// this allows the user to use the arrow keys to scroll through the results
	// ESCAPE clears the list
	// TAB sets the current highlighted value
	//

	var ARRUP = 38;
	var ARRDN = 40;
	
	var bubble = 1;

	switch(key)
	{


		case ARRUP:
			this.changeHighlight(key);
			bubble = 0;
			break;


		case ARRDN:
			this.changeHighlight(key);
			bubble = 0;
			break;
		
		
		default:
			this.getSuggestions(this.fld.value);
	}

	return bubble;
	

};








_b.AutoSuggest.prototype.getSuggestions = function (val)
{
	
	// if input stays the same, do nothing
	//
	if (val == this.sInp)
		return 0;
	
	
	// kill list
	//
	_b.DOM.remE(this.idAs);
	
	
	this.sInp = val;
	
	
	// input length is less than the min required to trigger a request
	// do nothing
	//
	if (val.length < this.oP.minchars)
	{
		this.aSug = [];
		this.nInpC = val.length;
		return 0;
	}
	
	
	
	
	var ol = this.nInpC; // old length
	this.nInpC = val.length ? val.length : 0;
	
	
	
	// if caching enabled, and user is typing (ie. length of input is increasing)
	// filter results out of aSuggestions from last request
	//
	var l = this.aSug.length;
	if (this.nInpC > ol && l && l<this.oP.maxentries && this.oP.cache)
	{
		var arr = [];
		for (var i=0;i<l;i++)
		{
			if (this.aSug[i].value.substr(0,val.length).toLowerCase() == val.toLowerCase())
				arr.push( this.aSug[i] );
		}
		this.aSug = arr;
		
		this.createList(this.aSug);
		
		
		
		return false;
	}
	else
	// do new request
	//
	{
		var pointer = this;
		var input = this.sInp;
		clearTimeout(this.ajID);
		this.ajID = setTimeout( function() { pointer.doAjaxRequest(input) }, this.oP.delay );
	}

	return false;
};





_b.AutoSuggest.prototype.doAjaxRequest = function (input)
{
	// check that saved input is still the value of the field
	//
	if (input != this.fld.value)
		return false;
	
	
	var pointer = this;
	
	
	// create ajax request
	//
	if (typeof(this.oP.script) == "function")
		var url = this.oP.script(encodeURIComponent(this.sInp));
	else
		var url = this.oP.script+this.oP.varname+"="+encodeURIComponent(this.sInp);
	
	if (!url)
		return false;
	
	var meth = this.oP.meth;
	var input = this.sInp;
	
	var onSuccessFunc = function (req) { pointer.setSuggestions(req, input) };
	var onErrorFunc = function (status) { alert("AJAX error: "+status); };

	var myAjax = new _b.Ajax();
	myAjax.makeRequest( url, meth, onSuccessFunc, onErrorFunc );
};





_b.AutoSuggest.prototype.setSuggestions = function (req, input)
{
	// if field input no longer matches what was passed to the request
	// don't show the suggestions
	//
	if (input != this.fld.value)
		return false;
	
	
	this.aSug = [];
	
	
	if (this.oP.json)
	{
		var jsondata = eval('(' + req.responseText + ')');
		
		for (var i=0;i<jsondata.results.length;i++)
		{
			this.aSug.push(  { 'id':jsondata.results[i].id, 'value':jsondata.results[i].value, 'info':jsondata.results[i].info }  );
		}
	}
	else
	{

		var xml = req.responseXML;
	
		// traverse xml
		//
		var results = xml.getElementsByTagName('results')[0].childNodes;

		for (var i=0;i<results.length;i++)
		{
			if (results[i].hasChildNodes())
				this.aSug.push(  { 'id':results[i].getAttribute('id'), 'value':results[i].childNodes[0].nodeValue, 'info':results[i].getAttribute('info') }  );
		}
	
	}
	
	this.idAs = "as_"+this.fld.id;
	

	this.createList(this.aSug);

};














_b.AutoSuggest.prototype.createList = function(arr)
{
	var pointer = this;
	
	
	
	
	// get rid of old list
	// and clear the list removal timeout
	//
	_b.DOM.remE(this.idAs);
	this.killTimeout();
	
	
	// if no results, and shownoresults is false, do nothing
	//
	if (arr.length == 0 && !this.oP.shownoresults)
		return false;
	
	
	// create holding div
	//
	var div = _b.DOM.cE("div", {id:this.idAs, className:this.oP.className});	
	
	var hcorner = _b.DOM.cE("div", {className:"as_corner"});
	var hbar = _b.DOM.cE("div", {className:"as_bar"});
	var header = _b.DOM.cE("div", {className:"as_header"});
	header.appendChild(hcorner);
	header.appendChild(hbar);
	div.appendChild(header);
	
	
	
	
	// create and populate ul
	//
	var ul = _b.DOM.cE("ul", {id:"as_ul"});
	
	
	
	
	// loop throught arr of suggestions
	// creating an LI element for each suggestion
	//
	for (var i=0;i<arr.length;i++)
	{
		// format output with the input enclosed in a EM element
		// (as HTML, not DOM)
		//
		var val = arr[i].value;
		var st = val.toLowerCase().indexOf( this.sInp.toLowerCase() );
		var output = val.substring(0,st) + "<em>" + val.substring(st, st+this.sInp.length) + "</em>" + val.substring(st+this.sInp.length);
		
		
		var span 		= _b.DOM.cE("span", {}, output, true);
		if (arr[i].info != "")
		{
			var br			= _b.DOM.cE("br", {});
			span.appendChild(br);
			var small		= _b.DOM.cE("small", {}, arr[i].info);
			span.appendChild(small);
		}
		
		var a 			= _b.DOM.cE("a", { href:"#" });
		
		var tl 		= _b.DOM.cE("span", {className:"tl"}, " ");
		var tr 		= _b.DOM.cE("span", {className:"tr"}, " ");
		a.appendChild(tl);
		a.appendChild(tr);
		
		a.appendChild(span);
		
		a.name = i+1;
		a.onclick = function () { pointer.setHighlightedValue(); return false; };
		a.onmouseover = function () { pointer.setHighlight(this.name); };
		
		var li = _b.DOM.cE(  "li", {}, a  );
		
		ul.appendChild( li );
	}
	
	
	// no results
	//
	if (arr.length == 0 && this.oP.shownoresults)
	{
		var li = _b.DOM.cE(  "li", {className:"as_warning"}, this.oP.noresults  );
		ul.appendChild( li );
	}
	
	
	div.appendChild( ul );
	
	
	var fcorner = _b.DOM.cE("div", {className:"as_corner"});
	var fbar = _b.DOM.cE("div", {className:"as_bar"});
	var footer = _b.DOM.cE("div", {className:"as_footer"});
	footer.appendChild(fcorner);
	footer.appendChild(fbar);
	div.appendChild(footer);
	
	
	
	// get position of target textfield
	// position holding div below it
	// set width of holding div to width of field
	//
	var pos = _b.DOM.getPos(this.fld);
	
	div.style.left = pos.x + "px";
	div.style.top = (parseInt(pos.y) + parseInt(this.fld.offsetHeight) + parseInt(this.oP.offsety)) + "px"; // 307 is a "magic" number that positions the popup properly. TBD.
	div.style.width 	= this.fld.offsetWidth + "px";
	
	
	
	// set mouseover functions for div
	// when mouse pointer leaves div, set a timeout to remove the list after an interval
	// when mouse enters div, kill the timeout so the list won't be removed
	//
	div.onmouseover 	= function(){ pointer.killTimeout() };
	div.onmouseout 		= function(){ pointer.resetTimeout() };


	// add DIV to document
	//
	document.getElementsByTagName("body")[0].appendChild(div);
	
	
	
	// currently no item is highlighted
	//
	this.iHigh = 0;
	
	
	
	
	
	
	// remove list after an interval
	//
	var pointer = this;
	this.toID = setTimeout(function () { pointer.clearSuggestions() }, this.oP.timeout);
};















_b.AutoSuggest.prototype.changeHighlight = function(key)
{	
	var list = _b.DOM.gE("as_ul");
	if (!list)
		return false;
	
	var n;

	if (key == 40)
		n = this.iHigh + 1;
	else if (key == 38)
		n = this.iHigh - 1;
	
	
	if (n > list.childNodes.length)
		n = list.childNodes.length;
	if (n < 1)
		n = 1;
	
	
	this.setHighlight(n);
};



_b.AutoSuggest.prototype.setHighlight = function(n)
{
	var list = _b.DOM.gE("as_ul");
	if (!list)
		return false;
	
	if (this.iHigh > 0)
		this.clearHighlight();
	
	this.iHigh = Number(n);
	
	list.childNodes[this.iHigh-1].className = "as_highlight";


	this.killTimeout();
};


_b.AutoSuggest.prototype.clearHighlight = function()
{
	var list = _b.DOM.gE("as_ul");
	if (!list)
		return false;
	
	if (this.iHigh > 0)
	{
		list.childNodes[this.iHigh-1].className = "";
		this.iHigh = 0;
	}
};


_b.AutoSuggest.prototype.setHighlightedValue = function ()
{
	if (this.iHigh)
	{
		this.sInp = this.fld.value = this.aSug[ this.iHigh-1 ].value;
		
		// move cursor to end of input (safari)
		//
		this.fld.focus();
		if (this.fld.selectionStart)
			this.fld.setSelectionRange(this.sInp.length, this.sInp.length);
		

		this.clearSuggestions();
		
		// pass selected object to callback function, if exists
		//
		if (typeof(this.oP.callback) == "function")
			this.oP.callback( this.aSug[this.iHigh-1] );
	}
};













_b.AutoSuggest.prototype.killTimeout = function()
{
	clearTimeout(this.toID);
};

_b.AutoSuggest.prototype.resetTimeout = function()
{
	clearTimeout(this.toID);
	var pointer = this;
	this.toID = setTimeout(function () { pointer.clearSuggestions() }, 2000);
};







_b.AutoSuggest.prototype.clearSuggestions = function ()
{
	
	this.killTimeout();
	
	var ele = _b.DOM.gE(this.idAs);
	var pointer = this;
	if (ele)
	{
		var fade = new _b.Fader(ele,1,0,250,function () { _b.DOM.remE(pointer.idAs) });
	}
};










// AJAX PROTOTYPE _____________________________________________


if (typeof(_b.Ajax) == "undefined")
	_b.Ajax = {};



_b.Ajax = function ()
{
	this.req = {};
	this.isIE = false;
};



_b.Ajax.prototype.makeRequest = function (url, meth, onComp, onErr)
{
	
	if (meth != "POST")
		meth = "GET";
	
	this.onComplete = onComp;
	this.onError = onErr;
	
	var pointer = this;
	
	// branch for native XMLHttpRequest object
	if (window.XMLHttpRequest)
	{
		this.req = new XMLHttpRequest();
		this.req.onreadystatechange = function () { pointer.processReqChange() };
		this.req.open("GET", url, true); //
		this.req.send(null);
	// branch for IE/Windows ActiveX version
	}
	else if (window.ActiveXObject)
	{
		this.req = new ActiveXObject("Microsoft.XMLHTTP");
		if (this.req)
		{
			this.req.onreadystatechange = function () { pointer.processReqChange() };
			this.req.open(meth, url, true);
			this.req.send();
		}
	}
};


_b.Ajax.prototype.processReqChange = function()
{
	
	// only if req shows "loaded"
	if (this.req.readyState == 4) {
		// only if "OK"
		if (this.req.status == 200)
		{
			this.onComplete( this.req );
		} else {
			this.onError( this.req.status );
		}
	}
};










// DOM PROTOTYPE _____________________________________________


if (typeof(_b.DOM) == "undefined")
	_b.DOM = {};



/* create element */
_b.DOM.cE = function ( type, attr, cont, html )
{
	var ne = document.createElement( type );
	if (!ne)
		return 0;
		
	for (var a in attr)
		ne[a] = attr[a];
	
	var t = typeof(cont);
	
	if (t == "string" && !html)
		ne.appendChild( document.createTextNode(cont) );
	else if (t == "string" && html)
		ne.innerHTML = cont;
	else if (t == "object")
		ne.appendChild( cont );

	return ne;
};



/* get element */
_b.DOM.gE = function ( e )
{
	var t=typeof(e);
	if (t == "undefined")
		return 0;
	else if (t == "string")
	{
		var re = document.getElementById( e );
		if (!re)
			return 0;
		else if (typeof(re.appendChild) != "undefined" )
			return re;
		else
			return 0;
	}
	else if (typeof(e.appendChild) != "undefined")
		return e;
	else
		return 0;
};



/* remove element */
_b.DOM.remE = function ( ele )
{
	var e = this.gE(ele);
	
	if (!e)
		return 0;
	else if (e.parentNode.removeChild(e))
		return true;
	else
		return 0;
};



/* get position */
_b.DOM.getPos = function ( e )
{
	var e = this.gE(e);

	var obj = e;

	var curleft = 0;
	if (obj.offsetParent)
	{
		while (obj.offsetParent)
		{
			curleft += obj.offsetLeft;
			obj = obj.offsetParent;
		}
	}
	else if (obj.x)
		curleft += obj.x;
	
	var obj = e;
	
	var curtop = 0;
	if (obj.offsetParent)
	{
		while (obj.offsetParent)
		{
			curtop += obj.offsetTop;
			obj = obj.offsetParent;
		}
	}
	else if (obj.y)
		curtop += obj.y;

	return {x:curleft, y:curtop};
};










// FADER PROTOTYPE _____________________________________________



if (typeof(_b.Fader) == "undefined")
	_b.Fader = {};





_b.Fader = function (ele, from, to, fadetime, callback)
{	
	if (!ele)
		return 0;
	
	this.e = ele;
	
	this.from = from;
	this.to = to;
	
	this.cb = callback;
	
	this.nDur = fadetime;
		
	this.nInt = 50;
	this.nTime = 0;
	
	var p = this;
	this.nID = setInterval(function() { p._fade() }, this.nInt);
};




_b.Fader.prototype._fade = function()
{
	this.nTime += this.nInt;
	
	var ieop = Math.round( this._tween(this.nTime, this.from, this.to, this.nDur) * 100 );
	var op = ieop / 100;
	
	if (this.e.filters) // internet explorer
	{
		try
		{
			this.e.filters.item("DXImageTransform.Microsoft.Alpha").opacity = ieop;
		} catch (e) { 
			// If it is not set initially, the browser will throw an error.  This will set it if it is not set yet.
			this.e.style.filter = 'progid:DXImageTransform.Microsoft.Alpha(opacity='+ieop+')';
		}
	}
	else // other browsers
	{
		this.e.style.opacity = op;
	}
	
	
	if (this.nTime == this.nDur)
	{
		clearInterval( this.nID );
		if (this.cb != undefined)
			this.cb();
	}
};



_b.Fader.prototype._tween = function(t,b,c,d)
{
	return b + ( (c-b) * (t/d) );
};
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-6875471-4']);
_gaq.push(['_trackPageview']);

(function () {
    window.setTimeout(function () {
        var scrollableArea = $('#scrollArea');
        var savedPosition = scrollableArea.scrollTop();
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
        window.setTimeout(function () {
            scrollableArea.scrollTop(savedPosition);
        }, 2000);
    }, 5000);
})();
/*
 *
 *   INSPINIA - Responsive Admin Theme
 *   version 2.4
 *
 */


$(document).ready(function () {


    // Add body-small class if window less than 768px
    if ($(this).width() < 769) {
        $('body').addClass('body-small')
    } else {
        $('body').removeClass('body-small')
    }

    // MetsiMenu
    $('#side-menu').metisMenu();

    // Collapse ibox function
    $('.collapse-link').click(function () {
        var ibox = $(this).closest('div.ibox');
        var button = $(this).find('i');
        var content = ibox.find('div.ibox-content');
        content.slideToggle(200);
        button.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
        ibox.toggleClass('').toggleClass('border-bottom');
        setTimeout(function () {
            ibox.resize();
            ibox.find('[id^=map-]').resize();
        }, 50);
    });

    // Close ibox function
    $('.close-link').click(function () {
        var content = $(this).closest('div.ibox');
        content.remove();
    });

    // Fullscreen ibox function
    $('.fullscreen-link').click(function () {
        var ibox = $(this).closest('div.ibox');
        var button = $(this).find('i');
        $('body').toggleClass('fullscreen-ibox-mode');
        button.toggleClass('fa-expand').toggleClass('fa-compress');
        ibox.toggleClass('fullscreen');
        setTimeout(function () {
            $(window).trigger('resize');
        }, 100);
    });

    // Close menu in canvas mode
    $('.close-canvas-menu').click(function () {
        $("body").toggleClass("mini-navbar");
        SmoothlyMenu();
    });

    // Run menu of canvas
    $('body.canvas-menu .sidebar-collapse').slimScroll({
        height: '100%',
        railOpacity: 0.9
    });

    // Open close right sidebar
    $('.right-sidebar-toggle').click(function () {
        $('#right-sidebar').toggleClass('sidebar-open');
    });

    // Initialize slimscroll for right sidebar
    $('.sidebar-container').slimScroll({
        height: '100%',
        railOpacity: 0.4,
        wheelStep: 10
    });

    // Open close small chat
    $('.open-small-chat').click(function () {
        $(this).children().toggleClass('fa-comments').toggleClass('fa-remove');
        $('.small-chat-box').toggleClass('active');
    });

    // Initialize slimscroll for small chat
    $('.small-chat-box .content').slimScroll({
        height: '234px',
        railOpacity: 0.4
    });

    // Small todo handler
    $('.check-link').click(function () {
        var button = $(this).find('i');
        var label = $(this).next('span');
        button.toggleClass('fa-check-square').toggleClass('fa-square-o');
        label.toggleClass('todo-completed');
        return false;
    });


    // Minimalize menu
    $('.navbar-minimalize').click(function () {
        $("body").toggleClass("mini-navbar");
        SmoothlyMenu();

    });

    // Tooltips demo
    $('.tooltip-demo').tooltip({
        selector: "[data-toggle=tooltip]",
        container: "body"
    });

    // Move modal to body
    // Fix Bootstrap backdrop issu with animation.css
    $('.modal').appendTo("body");

    // Full height of sidebar
    function fix_height() {
        var heightWithoutNavbar = $("body > #wrapper").height() - 61;
        $(".sidebard-panel").css("min-height", heightWithoutNavbar + "px");

        var navbarHeigh = $('nav.navbar-default').height();
        var wrapperHeigh = $('#page-wrapper').height();

        if (navbarHeigh > wrapperHeigh) {
            $('#page-wrapper').css("min-height", navbarHeigh + "px");
        }

        if (navbarHeigh < wrapperHeigh) {
            $('#page-wrapper').css("min-height", $(window).height() + "px");
        }

        if ($('body').hasClass('fixed-nav')) {
            if (navbarHeigh > wrapperHeigh) {
                $('#page-wrapper').css("min-height", navbarHeigh - 60 + "px");
            } else {
                $('#page-wrapper').css("min-height", $(window).height() - 60 + "px");
            }
        }

    }

    fix_height();

    // Fixed Sidebar
    $(window).bind("load", function () {
        if ($("body").hasClass('fixed-sidebar')) {
            $('.sidebar-collapse').slimScroll({
                height: '100%',
                railOpacity: 0.9
            });
        }
    });

    // Move right sidebar top after scroll
    $(window).scroll(function () {
        if ($(window).scrollTop() > 0 && !$('body').hasClass('fixed-nav')) {
            $('#right-sidebar').addClass('sidebar-top');
        } else {
            $('#right-sidebar').removeClass('sidebar-top');
        }
    });

    $(window).bind("load resize scroll", function () {
        if (!$("body").hasClass('body-small')) {
            fix_height();
        }
    });

    $("[data-toggle=popover]")
        .popover();

    // Add slimscroll to element
    $('.full-height-scroll').slimscroll({
        height: '100%'
    })
});


// Minimalize menu when screen is less than 768px
$(window).bind("resize", function () {
    if ($(this).width() < 769) {
        $('body').addClass('body-small')
    } else {
        $('body').removeClass('body-small')
    }
});

// Local Storage functions
// Set proper body class and plugins based on user configuration
$(document).ready(function () {
    if (localStorageSupport) {

        var collapse = localStorage.getItem("collapse_menu");
        var fixedsidebar = localStorage.getItem("fixedsidebar");
        var fixednavbar = localStorage.getItem("fixednavbar");
        var boxedlayout = localStorage.getItem("boxedlayout");
        var fixedfooter = localStorage.getItem("fixedfooter");

        var body = $('body');

        if (fixedsidebar == 'on') {
            body.addClass('fixed-sidebar');
            $('.sidebar-collapse').slimScroll({
                height: '100%',
                railOpacity: 0.9
            });
        }

        if (collapse == 'on') {
            if (body.hasClass('fixed-sidebar')) {
                if (!body.hasClass('body-small')) {
                    body.addClass('mini-navbar');
                }
            } else {
                if (!body.hasClass('body-small')) {
                    body.addClass('mini-navbar');
                }

            }
        }

        if (fixednavbar == 'on') {
            $(".navbar-static-top").removeClass('navbar-static-top').addClass('navbar-fixed-top');
            body.addClass('fixed-nav');
        }

        if (boxedlayout == 'on') {
            body.addClass('boxed-layout');
        }

        if (fixedfooter == 'on') {
            $(".footer").addClass('fixed');
        }
    }
});

// check if browser support HTML5 local storage
function localStorageSupport() {
    return (('localStorage' in window) && window['localStorage'] !== null)
}

// For demo purpose - animation css script
function animationHover(element, animation) {
    element = $(element);
    element.hover(
        function () {
            element.addClass('animated ' + animation);
        },
        function () {
            //wait for animation to finish before removing classes
            window.setTimeout(function () {
                element.removeClass('animated ' + animation);
            }, 2000);
        });
}

function SmoothlyMenu() {
    if (!$('body').hasClass('mini-navbar') || $('body').hasClass('body-small')) {
        // Hide menu in order to smoothly turn on when maximize menu
        $('#side-menu').hide();
        // For smoothly turn on menu
        setTimeout(
            function () {
                $('#side-menu').fadeIn(400);
            }, 200);
    } else if ($('body').hasClass('fixed-sidebar')) {
        $('#side-menu').hide();
        setTimeout(
            function () {
                $('#side-menu').fadeIn(400);
            }, 100);
    } else {
        // Remove all inline style from jquery fadeIn function to reset menu state
        $('#side-menu').removeAttr('style');
    }
}

// Dragable panels
function WinMove() {
    var element = "[class*=col]";
    var handle = ".ibox-title";
    var connect = "[class*=col]";
    $(element).sortable(
        {
            handle: handle,
            connectWith: connect,
            tolerance: 'pointer',
            forcePlaceholderSize: true,
            opacity: 0.8
        })
        .disableSelection();
}


