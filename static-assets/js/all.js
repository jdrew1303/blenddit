(function(a){function z(b,H,c){var e=this;return this.on("click.pjax",b,function(b){var d=a.extend({},t(H,c));d.container||(d.container=a(this).attr("data-pjax")||e);u(b,d)})}function u(b,c,e){e=t(c,e);c=b.currentTarget;if("A"!==c.tagName.toUpperCase())throw"$.fn.pjax or $.pjax.click requires an anchor element";if(!(1<b.which||b.metaKey||b.ctrlKey||b.shiftKey||b.altKey||location.protocol!==c.protocol||location.hostname!==c.hostname||c.hash&&c.href.replace(c.hash,"")===location.href.replace(location.hash,
"")||c.href===location.href+"#")){var k={url:c.href,container:a(c).attr("data-pjax"),target:c};e=a.extend({},k,e);k=a.Event("pjax:click");a(c).trigger(k,[e]);k.isDefaultPrevented()||(g(e),b.preventDefault(),a(c).trigger("pjax:clicked",[e]))}}function m(b,c,e){e=t(c,e);c=b.currentTarget;if("FORM"!==c.tagName.toUpperCase())throw"$.pjax.submit requires a form element";c={type:c.method.toUpperCase(),url:c.action,data:a(c).serializeArray(),container:a(c).attr("data-pjax"),target:c};g(a.extend({},c,e));
b.preventDefault()}function g(b){function c(b,e){var k=a.Event(b,{relatedTarget:l});d.trigger(k,e);return!k.isDefaultPrevented()}b=a.extend(!0,{},a.ajaxSettings,g.defaults,b);a.isFunction(b.url)&&(b.url=b.url());var l=b.target,k=x(b.url).hash,d=b.context=A(b.container);b.data||(b.data={});b.data._pjax=d.selector;var f;b.beforeSend=function(a,e){"GET"!==e.type&&(e.timeout=0);a.setRequestHeader("X-PJAX","true");a.setRequestHeader("X-PJAX-Container",d.selector);if(!c("pjax:beforeSend",[a,e]))return!1;
0<e.timeout&&(f=setTimeout(function(){c("pjax:timeout",[a,b])&&a.abort("timeout")},e.timeout),e.timeout=0);b.requestUrl=x(e.url).href};b.complete=function(a,e){f&&clearTimeout(f);c("pjax:complete",[a,e,b]);c("pjax:end",[a,b])};b.error=function(a,e,k){var d=y("",a,b);a=c("pjax:error",[a,e,k,b]);"GET"==b.type&&("abort"!==e&&a)&&D(d.url)};b.success=function(e,l,h){var f="function"===typeof a.pjax.defaults.version?a.pjax.defaults.version():a.pjax.defaults.version,F=h.getResponseHeader("X-PJAX-Version"),
s=y(e,h,b);if(f&&F&&f!==F)D(s.url);else if(s.contents){g.state={id:b.id||(new Date).getTime(),url:s.url,title:s.title,container:d.selector,fragment:b.fragment,timeout:b.timeout};(b.push||b.replace)&&window.history.replaceState(g.state,s.title,s.url);try{document.activeElement.blur()}catch(q){}s.title&&(document.title=s.title);d.html(s.contents);(f=d.find("input[autofocus], textarea[autofocus]").last()[0])&&document.activeElement!==f&&f.focus();B(s.scripts);"number"===typeof b.scrollTo&&a(window).scrollTop(b.scrollTo);
""!==k&&(f=x(s.url),f.hash=k,g.state.url=f.href,window.history.replaceState(g.state,s.title,f.href),s=a(f.hash),s.length&&a(window).scrollTop(s.offset().top));c("pjax:success",[e,l,h,b])}else D(s.url)};g.state||(g.state={id:(new Date).getTime(),url:window.location.href,title:document.title,container:d.selector,fragment:b.fragment,timeout:b.timeout},window.history.replaceState(g.state,document.title));var h=g.xhr;h&&4>h.readyState&&(h.onreadystatechange=a.noop,h.abort());g.options=b;h=g.xhr=a.ajax(b);
0<h.readyState&&(b.push&&!b.replace&&(e(g.state.id,d.clone().contents()),window.history.pushState(null,"",w(b.requestUrl))),c("pjax:start",[h,b]),c("pjax:send",[h,b]));return g.xhr}function G(b,c){return g(a.extend({url:window.location.href,push:!1,replace:!0,scrollTo:!1},t(b,c)))}function D(b){window.history.replaceState(null,"","#");window.location.replace(b)}function C(b){if((b=b.state)&&b.container){if(c&&F==b.url||g.state&&g.state.id===b.id)return;var e=a(b.container);if(e.length){var d,k=r[b.id];
if(g.state){var f=d=g.state.id<b.id?"forward":"back",h=g.state.id,q=e.clone().contents();r[h]=q;"forward"===f?(f=n,q=p):(f=p,q=n);f.push(h);(h=q.pop())&&delete r[h]}d=a.Event("pjax:popstate",{state:b,direction:d});e.trigger(d);d={id:b.id,url:b.url,container:e,push:!1,fragment:b.fragment,timeout:b.timeout,scrollTo:!1};k?(e.trigger("pjax:start",[null,d]),b.title&&(document.title=b.title),e.html(k),g.state=b,e.trigger("pjax:end",[null,d])):g(d);e[0].offsetHeight}else D(location.href)}c=!1}function E(b){var c=
a.isFunction(b.url)?b.url():b.url,e=b.type?b.type.toUpperCase():"GET",d=a("<form>",{method:"GET"===e?"GET":"POST",action:c,style:"display:none"});"GET"!==e&&"POST"!==e&&d.append(a("<input>",{type:"hidden",name:"_method",value:e.toLowerCase()}));b=b.data;if("string"===typeof b)a.each(b.split("&"),function(b,c){var e=c.split("=");d.append(a("<input>",{type:"hidden",name:e[0],value:e[1]}))});else if("object"===typeof b)for(key in b)d.append(a("<input>",{type:"hidden",name:key,value:b[key]}));a(document.body).append(d);
d.submit()}function w(b){return b.replace(/\?_pjax=[^&]+&?/,"?").replace(/_pjax=[^&]+&?/,"").replace(/[\?&]$/,"")}function x(b){var a=document.createElement("a");a.href=b;return a}function t(b,c){b&&c?c.container=b:c=a.isPlainObject(b)?b:{container:b};c.container&&(c.container=A(c.container));return c}function A(b){b=a(b);if(b.length){if(""!==b.selector&&b.context===document)return b;if(b.attr("id"))return a("#"+b.attr("id"));throw"cant get selector for pjax container!";}throw"no pjax container for "+
b.selector;}function v(b){return a.parseHTML(b,document,!0)}function y(b,c,e){var d={};d.url=w(c.getResponseHeader("X-PJAX-URL")||e.requestUrl);if(/<html/i.test(b)){c=a(v(b.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0]));var f=a(v(b.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]))}else c=f=a(v(b));if(0===f.length)return d;d.title=c.filter("title").add(c.find("title")).last().text();e.fragment?(b="body"===e.fragment?f:f.filter(e.fragment).add(f.find(e.fragment)).first(),b.length&&(d.contents=b.contents(),
d.title||(d.title=b.attr("title")||b.data("title")))):/<html/i.test(b)||(d.contents=f);d.contents&&(d.contents=d.contents.not(function(){return a(this).is("title")}),d.contents.find("title").remove(),d.scripts=d.contents.filter("script[src]").add(d.contents.find("script[src]")).remove(),d.contents=d.contents.not(d.scripts));d.title&&(d.title=a.trim(d.title));return d}function B(b){if(b){var c=a("script[src]");b.each(function(){var b=this.src;if(!c.filter(function(){return this.src===b}).length){var e=
document.createElement("script");e.type=a(this).attr("type");e.src=a(this).attr("src");document.head.appendChild(e)}})}}function e(b,a){r[b]=a;for(n.push(b);p.length;)delete r[p.shift()];for(;n.length>g.defaults.maxCacheLength;)delete r[n.shift()]}function d(){return a("meta").filter(function(){var b=a(this).attr("http-equiv");return b&&"X-PJAX-VERSION"===b.toUpperCase()}).attr("content")}function h(){a.fn.pjax=z;a.pjax=g;a.pjax.enable=a.noop;a.pjax.disable=f;a.pjax.click=u;a.pjax.submit=m;a.pjax.reload=
G;a.pjax.defaults={timeout:650,push:!0,replace:!1,type:"GET",dataType:"html",scrollTo:0,maxCacheLength:20,version:d};a(window).on("popstate.pjax",C)}function f(){a.fn.pjax=function(){return this};a.pjax=E;a.pjax.enable=h;a.pjax.disable=a.noop;a.pjax.click=a.noop;a.pjax.submit=a.noop;a.pjax.reload=function(){window.location.reload()};a(window).off("popstate.pjax",C)}var c=!0,F=window.location.href,q=window.history.state;q&&q.container&&(g.state=q);"state"in window.history&&(c=!1);var r={},p=[],n=[];
0>a.inArray("state",a.event.props)&&a.event.props.push("state");a.support.pjax=window.history&&window.history.pushState&&window.history.replaceState&&!navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/);a.support.pjax?h():f()})(jQuery);var hljs=new function(){function a(a){return a.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function z(a,d){var h=a&&a.exec(d);return h&&0==h.index}function u(a){a=(a.className+" "+(a.parentNode?a.parentNode.className:"")).split(/\s+/);a=a.map(function(a){return a.replace(/^lang(uage)?-/,"")});return a.filter(function(a){return A(a)||/no(-?)highlight/.test(a)})[0]}function m(a,d){var h={},f;for(f in a)h[f]=a[f];if(d)for(f in d)h[f]=d[f];return h}function g(a){var d=[];(function f(a,
e){for(var g=a.firstChild;g;g=g.nextSibling)3==g.nodeType?e+=g.nodeValue.length:1==g.nodeType&&(d.push({event:"start",offset:e,node:g}),e=f(g,e),g.nodeName.toLowerCase().match(/br|hr|img|input/)||d.push({event:"stop",offset:e,node:g}));return e})(a,0);return d}function G(e,d,h){function f(){return e.length&&d.length?e[0].offset!=d[0].offset?e[0].offset<d[0].offset?e:d:"start"==d[0].event?e:d:e.length?e:d}function c(b){p+="<"+b.nodeName.toLowerCase()+Array.prototype.map.call(b.attributes,function(b){return" "+
b.nodeName+'="'+a(b.value)+'"'}).join("")+">"}function g(b){p+="</"+b.nodeName.toLowerCase()+">"}function q(b){("start"==b.event?c:g)(b.node)}for(var r=0,p="",n=[];e.length||d.length;){var b=f(),p=p+a(h.substr(r,b[0].offset-r)),r=b[0].offset;if(b==e){n.reverse().forEach(g);do q(b.splice(0,1)[0]),b=f();while(b==e&&b.length&&b[0].offset==r);n.reverse().forEach(c)}else"start"==b[0].event?n.push(b[0].node):n.pop(),q(b.splice(0,1)[0])}return p+a(h.substr(r))}function D(a){function d(a){return a&&a.source||
a}function h(c,f){return RegExp(d(c),"m"+(a.cI?"i":"")+(f?"g":""))}function f(c,g){if(!c.compiled){c.compiled=!0;c.k=c.k||c.bK;if(c.k){var q={},r=function(b,c){a.cI&&(c=c.toLowerCase());c.split(" ").forEach(function(a){a=a.split("|");q[a[0]]=[b,a[1]?Number(a[1]):1]})};"string"==typeof c.k?r("keyword",c.k):Object.keys(c.k).forEach(function(b){r(b,c.k[b])});c.k=q}c.lR=h(c.l||/\b[A-Za-z0-9_]+\b/,!0);g&&(c.bK&&(c.b="\\b("+c.bK.split(" ").join("|")+")\\b"),c.b||(c.b=/\B|\b/),c.bR=h(c.b),c.e||c.eW||(c.e=
/\B|\b/),c.e&&(c.eR=h(c.e)),c.tE=d(c.e)||"",c.eW&&g.tE&&(c.tE+=(c.e?"|":"")+g.tE));c.i&&(c.iR=h(c.i));void 0===c.r&&(c.r=1);c.c||(c.c=[]);var p=[];c.c.forEach(function(b){b.v?b.v.forEach(function(a){p.push(m(b,a))}):p.push("self"==b?c:b)});c.c=p;c.c.forEach(function(b){f(b,c)});c.starts&&f(c.starts,g);var n=c.c.map(function(b){return b.bK?"\\.?("+b.b+")\\.?":b.b}).concat([c.tE,c.i]).map(d).filter(Boolean);c.t=n.length?h(n.join("|"),!0):{exec:function(b){return null}}}}f(a)}function C(e,d,h,f){function c(b,
a){if(z(b.eR,a))return b;if(b.eW)return c(b.parent,a)}function g(b,a,c,e){e='<span class="'+(e?"":v.classPrefix);return e+(b+'">')+a+(c?"":"</span>")}function q(){var c;if(void 0!==b.sL)b.sL&&!y[b.sL]?c=a(k):(c=b.sL?C(b.sL,k,!0,t):E(k),0<b.r&&(m+=c.r),"continuous"==b.subLanguageMode&&(t=c.top),c=g(c.language,c.value,!1,!0));else if(b.k){c="";var e=0;b.lR.lastIndex=0;for(var d=b.lR.exec(k);d;){c+=a(k.substr(e,d.index-e));var e=b,f=d,f=n.cI?f[0].toLowerCase():f[0];(e=e.k.hasOwnProperty(f)&&e.k[f])?
(m+=e[1],c+=g(e[0],a(d[0]))):c+=a(d[0]);e=b.lR.lastIndex;d=b.lR.exec(k)}c+=a(k.substr(e))}else c=a(k);return c}function r(c,e){var d=c.cN?g(c.cN,"",!0):"";c.rB?(l+=d,k=""):c.eB?(l+=a(e)+d,k=""):(l+=d,k=e);b=Object.create(c,{parent:{value:b}})}function p(e,d){k+=e;if(void 0===d)return l+=q(),0;var f;a:{f=b;for(var g=0;g<f.c.length;g++)if(z(f.c[g].bR,d)){f=f.c[g];break a}f=void 0}if(f)return l+=q(),r(f,d),f.rB?0:d.length;if(f=c(b,d)){g=b;g.rE||g.eE||(k+=d);l+=q();do b.cN&&(l+="</span>"),m+=b.r,b=b.parent;
while(b!=f.parent);g.eE&&(l+=a(d));k="";f.starts&&r(f.starts,"");return g.rE?0:d.length}if(!h&&z(b.iR,d))throw Error('Illegal lexeme "'+d+'" for mode "'+(b.cN||"<unnamed>")+'"');k+=d;return d.length||1}var n=A(e);if(!n)throw Error('Unknown language: "'+e+'"');D(n);var b=f||n,t,l="";for(f=b;f!=n;f=f.parent)f.cN&&(l=g(f.cN,"",!0)+l);var k="",m=0;try{for(var u,x,w=0;;){b.t.lastIndex=w;u=b.t.exec(d);if(!u)break;x=p(d.substr(w,u.index-w),u[0]);w=u.index+x}p(d.substr(w));for(f=b;f.parent;f=f.parent)f.cN&&
(l+="</span>");return{r:m,value:l,language:e,top:b}}catch(B){if(-1!=B.message.indexOf("Illegal"))return{r:0,value:a(d)};throw B;}}function E(e,d){d=d||v.languages||Object.keys(y);var g={r:0,value:a(e)},f=g;d.forEach(function(a){if(A(a)){var d=C(a,e,!1);d.language=a;d.r>f.r&&(f=d);d.r>g.r&&(f=g,g=d)}});f.language&&(g.second_best=f);return g}function w(a){v.tabReplace&&(a=a.replace(/^((<[^>]+>|\t)+)/gm,function(a,e,f,c){return e.replace(/\t/g,v.tabReplace)}));v.useBR&&(a=a.replace(/\n/g,"<br>"));return a}
function x(a){var d=u(a);if(!/no(-?)highlight/.test(d)){var h;v.useBR?(h=document.createElementNS("http://www.w3.org/1999/xhtml","div"),h.innerHTML=a.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):h=a;var f=h.textContent,c=d?C(d,f,!0):E(f);h=g(h);if(h.length){var m=document.createElementNS("http://www.w3.org/1999/xhtml","div");m.innerHTML=c.value;c.value=G(h,g(m),f)}c.value=w(c.value);a.innerHTML=c.value;a.className+=" hljs "+(!d&&c.language||"");a.result={language:c.language,re:c.r};c.second_best&&
(a.second_best={language:c.second_best.language,re:c.second_best.r})}}function t(){if(!t.called){t.called=!0;var a=document.querySelectorAll("pre code");Array.prototype.forEach.call(a,x)}}function A(a){return y[a]||y[B[a]]}var v={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0},y={},B={};this.highlight=C;this.highlightAuto=E;this.fixMarkup=w;this.highlightBlock=x;this.configure=function(a){v=m(v,a)};this.initHighlighting=t;this.initHighlightingOnLoad=function(){addEventListener("DOMContentLoaded",
t,!1);addEventListener("load",t,!1)};this.registerLanguage=function(a,d){var g=y[a]=d(this);g.aliases&&g.aliases.forEach(function(d){B[d]=a})};this.listLanguages=function(){return Object.keys(y)};this.getLanguage=A;this.inherit=m;this.IR="[a-zA-Z][a-zA-Z0-9_]*";this.UIR="[a-zA-Z_][a-zA-Z0-9_]*";this.NR="\\b\\d+(\\.\\d+)?";this.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";this.BNR="\\b(0b[01]+)";this.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
this.BE={b:"\\\\[\\s\\S]",r:0};this.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[this.BE]};this.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[this.BE]};this.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/};this.CLCM={cN:"comment",b:"//",e:"$",c:[this.PWM]};this.CBCM={cN:"comment",b:"/\\*",e:"\\*/",c:[this.PWM]};this.HCM={cN:"comment",b:"#",e:"$",c:[this.PWM]};this.NM={cN:"number",b:this.NR,r:0};this.CNM={cN:"number",b:this.CNR,r:0};this.BNM=
{cN:"number",b:this.BNR,r:0};this.CSSNM={cN:"number",b:this.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0};this.RM={cN:"regexp",b:/\//,e:/\/[gim]*/,i:/\n/,c:[this.BE,{b:/\[/,e:/\]/,r:0,c:[this.BE]}]};this.TM={cN:"title",b:this.IR,r:0};this.UTM={cN:"title",b:this.UIR,r:0}};
hljs.registerLanguage("javascript",function(a){return{aliases:["js"],k:{keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document"},
c:[{cN:"pi",b:/^\s*('|")use strict('|")/,r:10},a.ASM,a.QSM,a.CLCM,a.CBCM,a.CNM,{b:"("+a.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[a.CLCM,a.CBCM,a.RM,{b:/</,e:/>;/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[a.inherit(a.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,c:[a.CLCM,a.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+a.IR,r:0}]}});if("undefined"===!window.jQuery)throw Error("app.js requires jQuery");else{var app=function(a){function z(){a(document).pjax("a[data-pjax]","#pjax-container");a(document).on("pjax:send",function(){});a(document).on("pjax:end",function(){0<a("#listsjs").length?u():(a("#listsjsIndex").hide(),a(".navbar-brand > .text-warning").text("kurtlocker.org"))})}function u(){0<a("#listsjs").length&&(a("#listsjsIndex").show(),a(".navbar-brand > .text-warning").text("[ l [ i [ s ] t ] s ]"),a("div.js").each(function(m,
g){a(g).text(a(g).text().trim());hljs.highlightBlock(g)}),a("#listsjsIndex").unbind("click").click(function(m){m.preventDefault();a("#wrapper").toggleClass("toggled")}),a(".sidebarFunc").unbind("click").click(function(){a(".sidebarFunc").removeClass("blue-dotted");a(this).addClass("blue-dotted");a(".nav-tabs").removeClass("blue-dotted");a("#function-"+a(this).attr("num")).addClass("blue-dotted");a("html, body").animate({scrollTop:a("#function-"+a(this).attr("num")).offset().top-60},500);a("#wrapper").hasClass("toggled")&&
a("#wrapper").toggleClass("toggled")}),a("#page-content-wrapper").unbind("click").click(function(){a("#wrapper").hasClass("toggled")&&a("#wrapper").toggleClass("toggled")}))}return{init:function(){z();u()}}}(jQuery);$(document).ready(function(){app.init()})};