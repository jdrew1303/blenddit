(function(a){function v(b,c,l){var d=this;return this.on("click.pjax",b,function(b){var e=a.extend({},s(c,l));e.container||(e.container=a(this).attr("data-pjax")||d);u(b,e)})}function u(b,c,d){d=s(c,d);c=b.currentTarget;if("A"!==c.tagName.toUpperCase())throw"$.fn.pjax or $.pjax.click requires an anchor element";if(!(1<b.which||b.metaKey||b.ctrlKey||b.shiftKey||b.altKey||location.protocol!==c.protocol||location.hostname!==c.hostname||c.hash&&c.href.replace(c.hash,"")===location.href.replace(location.hash,
"")||c.href===location.href+"#")){var k={url:c.href,container:a(c).attr("data-pjax"),target:c};d=a.extend({},k,d);k=a.Event("pjax:click");a(c).trigger(k,[d]);k.isDefaultPrevented()||(g(d),b.preventDefault(),a(c).trigger("pjax:clicked",[d]))}}function x(b,c,d){d=s(c,d);c=b.currentTarget;if("FORM"!==c.tagName.toUpperCase())throw"$.pjax.submit requires a form element";c={type:c.method.toUpperCase(),url:c.action,data:a(c).serializeArray(),container:a(c).attr("data-pjax"),target:c};g(a.extend({},c,d));
b.preventDefault()}function g(b){function c(b,d){var k=a.Event(b,{relatedTarget:l});e.trigger(k,d);return!k.isDefaultPrevented()}b=a.extend(!0,{},a.ajaxSettings,g.defaults,b);a.isFunction(b.url)&&(b.url=b.url());var l=b.target,k=B(b.url).hash,e=b.context=F(b.container);b.data||(b.data={});b.data._pjax=e.selector;var f;b.beforeSend=function(a,d){"GET"!==d.type&&(d.timeout=0);a.setRequestHeader("X-PJAX","true");a.setRequestHeader("X-PJAX-Container",e.selector);if(!c("pjax:beforeSend",[a,d]))return!1;
0<d.timeout&&(f=setTimeout(function(){c("pjax:timeout",[a,b])&&a.abort("timeout")},d.timeout),d.timeout=0);b.requestUrl=B(d.url).href};b.complete=function(a,d){f&&clearTimeout(f);c("pjax:complete",[a,d,b]);c("pjax:end",[a,b])};b.error=function(a,d,k){var e=C("",a,b);a=c("pjax:error",[a,d,k,b]);"GET"==b.type&&("abort"!==d&&a)&&A(e.url)};b.success=function(d,l,h){var f="function"===typeof a.pjax.defaults.version?a.pjax.defaults.version():a.pjax.defaults.version,E=h.getResponseHeader("X-PJAX-Version"),
q=C(d,h,b);if(f&&E&&f!==E)A(q.url);else if(q.contents){g.state={id:b.id||(new Date).getTime(),url:q.url,title:q.title,container:e.selector,fragment:b.fragment,timeout:b.timeout};(b.push||b.replace)&&window.history.replaceState(g.state,q.title,q.url);try{document.activeElement.blur()}catch(p){}q.title&&(document.title=q.title);e.html(q.contents);(f=e.find("input[autofocus], textarea[autofocus]").last()[0])&&document.activeElement!==f&&f.focus();G(q.scripts);"number"===typeof b.scrollTo&&a(window).scrollTop(b.scrollTo);
""!==k&&(f=B(q.url),f.hash=k,g.state.url=f.href,window.history.replaceState(g.state,q.title,f.href),q=a(f.hash),q.length&&a(window).scrollTop(q.offset().top));c("pjax:success",[d,l,h,b])}else A(q.url)};g.state||(g.state={id:(new Date).getTime(),url:window.location.href,title:document.title,container:e.selector,fragment:b.fragment,timeout:b.timeout},window.history.replaceState(g.state,document.title));var h=g.xhr;h&&4>h.readyState&&(h.onreadystatechange=a.noop,h.abort());g.options=b;h=g.xhr=a.ajax(b);
0<h.readyState&&(b.push&&!b.replace&&(d(g.state.id,e.clone().contents()),window.history.pushState(null,"",I(b.requestUrl))),c("pjax:start",[h,b]),c("pjax:send",[h,b]));return g.xhr}function y(b,c){return g(a.extend({url:window.location.href,push:!1,replace:!0,scrollTo:!1},s(b,c)))}function A(a){window.history.replaceState(null,"","#");window.location.replace(a)}function D(b){if((b=b.state)&&b.container){if(c&&E==b.url||g.state&&g.state.id===b.id)return;var d=a(b.container);if(d.length){var e,k=t[b.id];
if(g.state){var f=e=g.state.id<b.id?"forward":"back",h=g.state.id,p=d.clone().contents();t[h]=p;"forward"===f?(f=n,p=r):(f=r,p=n);f.push(h);(h=p.pop())&&delete t[h]}e=a.Event("pjax:popstate",{state:b,direction:e});d.trigger(e);e={id:b.id,url:b.url,container:d,push:!1,fragment:b.fragment,timeout:b.timeout,scrollTo:!1};k?(d.trigger("pjax:start",[null,e]),b.title&&(document.title=b.title),d.html(k),g.state=b,d.trigger("pjax:end",[null,e])):g(e);d[0].offsetHeight}else A(location.href)}c=!1}function H(b){var c=
a.isFunction(b.url)?b.url():b.url,d=b.type?b.type.toUpperCase():"GET",e=a("<form>",{method:"GET"===d?"GET":"POST",action:c,style:"display:none"});"GET"!==d&&"POST"!==d&&e.append(a("<input>",{type:"hidden",name:"_method",value:d.toLowerCase()}));b=b.data;if("string"===typeof b)a.each(b.split("&"),function(b,c){var d=c.split("=");e.append(a("<input>",{type:"hidden",name:d[0],value:d[1]}))});else if("object"===typeof b)for(key in b)e.append(a("<input>",{type:"hidden",name:key,value:b[key]}));a(document.body).append(e);
e.submit()}function I(a){return a.replace(/\?_pjax=[^&]+&?/,"?").replace(/_pjax=[^&]+&?/,"").replace(/[\?&]$/,"")}function B(a){var c=document.createElement("a");c.href=a;return c}function s(b,c){b&&c?c.container=b:c=a.isPlainObject(b)?b:{container:b};c.container&&(c.container=F(c.container));return c}function F(b){b=a(b);if(b.length){if(""!==b.selector&&b.context===document)return b;if(b.attr("id"))return a("#"+b.attr("id"));throw"cant get selector for pjax container!";}throw"no pjax container for "+
b.selector;}function z(b){return a.parseHTML(b,document,!0)}function C(b,c,d){var e={};e.url=I(c.getResponseHeader("X-PJAX-URL")||d.requestUrl);if(/<html/i.test(b)){c=a(z(b.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0]));var f=a(z(b.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]))}else c=f=a(z(b));if(0===f.length)return e;e.title=c.filter("title").add(c.find("title")).last().text();d.fragment?(b="body"===d.fragment?f:f.filter(d.fragment).add(f.find(d.fragment)).first(),b.length&&(e.contents=b.contents(),
e.title||(e.title=b.attr("title")||b.data("title")))):/<html/i.test(b)||(e.contents=f);e.contents&&(e.contents=e.contents.not(function(){return a(this).is("title")}),e.contents.find("title").remove(),e.scripts=e.contents.filter("script[src]").add(e.contents.find("script[src]")).remove(),e.contents=e.contents.not(e.scripts));e.title&&(e.title=a.trim(e.title));return e}function G(b){if(b){var c=a("script[src]");b.each(function(){var b=this.src;if(!c.filter(function(){return this.src===b}).length){var d=
document.createElement("script");d.type=a(this).attr("type");d.src=a(this).attr("src");document.head.appendChild(d)}})}}function d(a,c){t[a]=c;for(n.push(a);r.length;)delete t[r.shift()];for(;n.length>g.defaults.maxCacheLength;)delete t[n.shift()]}function e(){return a("meta").filter(function(){var b=a(this).attr("http-equiv");return b&&"X-PJAX-VERSION"===b.toUpperCase()}).attr("content")}function h(){a.fn.pjax=v;a.pjax=g;a.pjax.enable=a.noop;a.pjax.disable=f;a.pjax.click=u;a.pjax.submit=x;a.pjax.reload=
y;a.pjax.defaults={timeout:650,push:!0,replace:!1,type:"GET",dataType:"html",scrollTo:0,maxCacheLength:20,version:e};a(window).on("popstate.pjax",D)}function f(){a.fn.pjax=function(){return this};a.pjax=H;a.pjax.enable=h;a.pjax.disable=a.noop;a.pjax.click=a.noop;a.pjax.submit=a.noop;a.pjax.reload=function(){window.location.reload()};a(window).off("popstate.pjax",D)}var c=!0,E=window.location.href,p=window.history.state;p&&p.container&&(g.state=p);"state"in window.history&&(c=!1);var t={},r=[],n=[];
0>a.inArray("state",a.event.props)&&a.event.props.push("state");a.support.pjax=window.history&&window.history.pushState&&window.history.replaceState&&!navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/);a.support.pjax?h():f()})(jQuery);var hljs=new function(){function a(a){return a.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function v(a,e){var h=a&&a.exec(e);return h&&0==h.index}function u(a){a=(a.className+" "+(a.parentNode?a.parentNode.className:"")).split(/\s+/);a=a.map(function(a){return a.replace(/^lang(uage)?-/,"")});return a.filter(function(a){return F(a)||/no(-?)highlight/.test(a)})[0]}function x(a,e){var h={},f;for(f in a)h[f]=a[f];if(e)for(f in e)h[f]=e[f];return h}function g(a){var e=[];(function f(a,
d){for(var g=a.firstChild;g;g=g.nextSibling)3==g.nodeType?d+=g.nodeValue.length:1==g.nodeType&&(e.push({event:"start",offset:d,node:g}),d=f(g,d),g.nodeName.toLowerCase().match(/br|hr|img|input/)||e.push({event:"stop",offset:d,node:g}));return d})(a,0);return e}function y(d,e,h){function f(){return d.length&&e.length?d[0].offset!=e[0].offset?d[0].offset<e[0].offset?d:e:"start"==e[0].event?d:e:d.length?d:e}function c(b){r+="<"+b.nodeName.toLowerCase()+Array.prototype.map.call(b.attributes,function(b){return" "+
b.nodeName+'="'+a(b.value)+'"'}).join("")+">"}function g(a){r+="</"+a.nodeName.toLowerCase()+">"}function p(a){("start"==a.event?c:g)(a.node)}for(var t=0,r="",n=[];d.length||e.length;){var b=f(),r=r+a(h.substr(t,b[0].offset-t)),t=b[0].offset;if(b==d){n.reverse().forEach(g);do p(b.splice(0,1)[0]),b=f();while(b==d&&b.length&&b[0].offset==t);n.reverse().forEach(c)}else"start"==b[0].event?n.push(b[0].node):n.pop(),p(b.splice(0,1)[0])}return r+a(h.substr(t))}function A(a){function e(a){return a&&a.source||
a}function h(c,f){return RegExp(e(c),"m"+(a.cI?"i":"")+(f?"g":""))}function f(c,g){if(!c.compiled){c.compiled=!0;c.k=c.k||c.bK;if(c.k){var p={},t=function(b,c){a.cI&&(c=c.toLowerCase());c.split(" ").forEach(function(a){a=a.split("|");p[a[0]]=[b,a[1]?Number(a[1]):1]})};"string"==typeof c.k?t("keyword",c.k):Object.keys(c.k).forEach(function(a){t(a,c.k[a])});c.k=p}c.lR=h(c.l||/\b[A-Za-z0-9_]+\b/,!0);g&&(c.bK&&(c.b="\\b("+c.bK.split(" ").join("|")+")\\b"),c.b||(c.b=/\B|\b/),c.bR=h(c.b),c.e||c.eW||(c.e=
/\B|\b/),c.e&&(c.eR=h(c.e)),c.tE=e(c.e)||"",c.eW&&g.tE&&(c.tE+=(c.e?"|":"")+g.tE));c.i&&(c.iR=h(c.i));void 0===c.r&&(c.r=1);c.c||(c.c=[]);var r=[];c.c.forEach(function(a){a.v?a.v.forEach(function(c){r.push(x(a,c))}):r.push("self"==a?c:a)});c.c=r;c.c.forEach(function(a){f(a,c)});c.starts&&f(c.starts,g);var n=c.c.map(function(a){return a.bK?"\\.?("+a.b+")\\.?":a.b}).concat([c.tE,c.i]).map(e).filter(Boolean);c.t=n.length?h(n.join("|"),!0):{exec:function(a){return null}}}}f(a)}function D(d,e,h,f){function c(a,
b){if(v(a.eR,b))return a;if(a.eW)return c(a.parent,b)}function g(a,b,c,d){d='<span class="'+(d?"":z.classPrefix);return d+(a+'">')+b+(c?"":"</span>")}function p(){var c;if(void 0!==b.sL)b.sL&&!C[b.sL]?c=a(k):(c=b.sL?D(b.sL,k,!0,s):H(k),0<b.r&&(w+=c.r),"continuous"==b.subLanguageMode&&(s=c.top),c=g(c.language,c.value,!1,!0));else if(b.k){c="";var d=0;b.lR.lastIndex=0;for(var e=b.lR.exec(k);e;){c+=a(k.substr(d,e.index-d));var d=b,f=e,f=n.cI?f[0].toLowerCase():f[0];(d=d.k.hasOwnProperty(f)&&d.k[f])?
(w+=d[1],c+=g(d[0],a(e[0]))):c+=a(e[0]);d=b.lR.lastIndex;e=b.lR.exec(k)}c+=a(k.substr(d))}else c=a(k);return c}function t(c,d){var e=c.cN?g(c.cN,"",!0):"";c.rB?(l+=e,k=""):c.eB?(l+=a(d)+e,k=""):(l+=e,k=d);b=Object.create(c,{parent:{value:b}})}function r(d,e){k+=d;if(void 0===e)return l+=p(),0;var f;a:{f=b;for(var g=0;g<f.c.length;g++)if(v(f.c[g].bR,e)){f=f.c[g];break a}f=void 0}if(f)return l+=p(),t(f,e),f.rB?0:e.length;if(f=c(b,e)){g=b;g.rE||g.eE||(k+=e);l+=p();do b.cN&&(l+="</span>"),w+=b.r,b=b.parent;
while(b!=f.parent);g.eE&&(l+=a(e));k="";f.starts&&t(f.starts,"");return g.rE?0:e.length}if(!h&&v(b.iR,e))throw Error('Illegal lexeme "'+e+'" for mode "'+(b.cN||"<unnamed>")+'"');k+=e;return e.length||1}var n=F(d);if(!n)throw Error('Unknown language: "'+d+'"');A(n);var b=f||n,s,l="";for(f=b;f!=n;f=f.parent)f.cN&&(l=g(f.cN,"",!0)+l);var k="",w=0;try{for(var u,y,x=0;;){b.t.lastIndex=x;u=b.t.exec(e);if(!u)break;y=r(e.substr(x,u.index-x),u[0]);x=u.index+y}r(e.substr(x));for(f=b;f.parent;f=f.parent)f.cN&&
(l+="</span>");return{r:w,value:l,language:d,top:b}}catch(B){if(-1!=B.message.indexOf("Illegal"))return{r:0,value:a(e)};throw B;}}function H(d,e){e=e||z.languages||Object.keys(C);var g={r:0,value:a(d)},f=g;e.forEach(function(a){if(F(a)){var e=D(a,d,!1);e.language=a;e.r>f.r&&(f=e);e.r>g.r&&(f=g,g=e)}});f.language&&(g.second_best=f);return g}function I(a){z.tabReplace&&(a=a.replace(/^((<[^>]+>|\t)+)/gm,function(a,d,f,c){return d.replace(/\t/g,z.tabReplace)}));z.useBR&&(a=a.replace(/\n/g,"<br>"));return a}
function B(a){var e=u(a);if(!/no(-?)highlight/.test(e)){var h;z.useBR?(h=document.createElementNS("http://www.w3.org/1999/xhtml","div"),h.innerHTML=a.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):h=a;var f=h.textContent,c=e?D(e,f,!0):H(f);h=g(h);if(h.length){var s=document.createElementNS("http://www.w3.org/1999/xhtml","div");s.innerHTML=c.value;c.value=y(h,g(s),f)}c.value=I(c.value);a.innerHTML=c.value;a.className+=" hljs "+(!e&&c.language||"");a.result={language:c.language,re:c.r};c.second_best&&
(a.second_best={language:c.second_best.language,re:c.second_best.r})}}function s(){if(!s.called){s.called=!0;var a=document.querySelectorAll("pre code");Array.prototype.forEach.call(a,B)}}function F(a){return C[a]||C[G[a]]}var z={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0},C={},G={};this.highlight=D;this.highlightAuto=H;this.fixMarkup=I;this.highlightBlock=B;this.configure=function(a){z=x(z,a)};this.initHighlighting=s;this.initHighlightingOnLoad=function(){addEventListener("DOMContentLoaded",
s,!1);addEventListener("load",s,!1)};this.registerLanguage=function(a,e){var g=C[a]=e(this);g.aliases&&g.aliases.forEach(function(e){G[e]=a})};this.listLanguages=function(){return Object.keys(C)};this.getLanguage=F;this.inherit=x;this.IR="[a-zA-Z][a-zA-Z0-9_]*";this.UIR="[a-zA-Z_][a-zA-Z0-9_]*";this.NR="\\b\\d+(\\.\\d+)?";this.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";this.BNR="\\b(0b[01]+)";this.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
this.BE={b:"\\\\[\\s\\S]",r:0};this.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[this.BE]};this.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[this.BE]};this.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/};this.CLCM={cN:"comment",b:"//",e:"$",c:[this.PWM]};this.CBCM={cN:"comment",b:"/\\*",e:"\\*/",c:[this.PWM]};this.HCM={cN:"comment",b:"#",e:"$",c:[this.PWM]};this.NM={cN:"number",b:this.NR,r:0};this.CNM={cN:"number",b:this.CNR,r:0};this.BNM=
{cN:"number",b:this.BNR,r:0};this.CSSNM={cN:"number",b:this.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0};this.RM={cN:"regexp",b:/\//,e:/\/[gim]*/,i:/\n/,c:[this.BE,{b:/\[/,e:/\]/,r:0,c:[this.BE]}]};this.TM={cN:"title",b:this.IR,r:0};this.UTM={cN:"title",b:this.UIR,r:0}};
hljs.registerLanguage("javascript",function(a){return{aliases:["js"],k:{keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document"},
c:[{cN:"pi",b:/^\s*('|")use strict('|")/,r:10},a.ASM,a.QSM,a.CLCM,a.CBCM,a.CNM,{b:"("+a.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[a.CLCM,a.CBCM,a.RM,{b:/</,e:/>;/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[a.inherit(a.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,c:[a.CLCM,a.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+a.IR,r:0}]}});if("undefined"===!window.jQuery)throw Error("app.js requires jQuery");else{var app=function(a){function v(a,b){Storage&&localStorage.setItem(a,JSON.stringify(b))}function u(){a(document).pjax("a[data-pjax]","#pjax-container");a(document).on("pjax:send",function(){});a(document).on("pjax:end",function(){0<a("#listsjs").length?g():0<a("#merger").length?y():(a(".teams").hide(),a("#sidebarTrigger").hide(),a(".navbar-fixed-top").show(),a(".navbar-brand > .text-warning").text("kurtlocker.org"),a(".social").show())})}
function x(){a("#sidebarTrigger").unbind("click").click(function(b){b.preventDefault();a("#wrapper").toggleClass("toggled")})}function g(){0<a("#listsjs").length&&(x(),a("#sidebarTrigger").show(),a(".navbar-brand > .text-warning").text("[ l [ i [ s ] t ] s ]"),a("div.js").each(function(b,c){a(c).text(a(c).text().trim());hljs.highlightBlock(c)}),a(".sidebarFunc").unbind("click").click(function(){a(".sidebarFunc").removeClass("blue-dotted");a(this).addClass("blue-dotted");a(".nav-tabs").removeClass("blue-dotted");
a("#function-"+a(this).attr("num")).addClass("blue-dotted");a("html, body").animate({scrollTop:a("#function-"+a(this).attr("num")).offset().top-60},500);a("#wrapper").hasClass("toggled")&&a("#wrapper").toggleClass("toggled")}),a("#page-content-wrapper").unbind("click").click(function(){a("#wrapper").hasClass("toggled")&&a("#wrapper").toggleClass("toggled")}))}function y(){0<a("#merger").length&&(a(".teams").show(),a(".social").hide(),a(".navbar-fixed-top").hide(),a(".navbar-brand > .text-warning").text("thread merger"),
a(".open-controls").unbind("click").click(function(){H()}),a("#delete-column").unbind("click").click(function(){d(a(this).data("column"));m.remove(a(this).data("column"));v("config",m);E();s()}),0<m.length?(a("#greeting").hide(),E(),s()):H(),D(),A())}function A(){var a,b=0;document.addEventListener("touchstart",function(c){a=c.touches[0].screenX;b=c.touches[0].screenY});document.addEventListener("touchmove",function(c){var e=Math.abs(c.touches[0].screenX-a);3*Math.abs(c.touches[0].screenY-b)>e&&c.preventDefault()})}
function D(){app.height=window.innerHeight;a(".frame-content, .edit-form").css("height",window.innerHeight-107);a(window).unbind("resize").bind("resize",function(){app.height!=window.innerHeight&&(a(".frame-content, .edit-form").css("height",window.innerHeight-107),app.height=window.innerHeight)})}function H(){N();E();a("#save-changes").unbind("click").bind("click",function(){a("#greeting").hide();v("config",m);s()});a("#controlModal").unbind("hide.bs.modal").on("hide.bs.modal",function(b){a("#config-row-container").children().remove()});
a("#controlModal").modal()}function I(){a("#reddit-block, #twitter-block").unbind("click").bind("click",function(){"reddit-block"==this.id&&(n("#reddit","column-settings","sub-group-controls","subreddit-controls","thread-controls","delete-controls"),r(),t(),B(),a("#vendor-group, #reddit").toggleClass("hide"))})}function B(){a("#add-button").unbind("click").bind("click",function(){p(".sub-group-controls",".subreddit-controls",".thread-controls","#reddit .column-settings");E();a("#cancel-column").trigger("click")})}
function s(){a(".carousel-inner").children().remove();for(var b=0,c=m.length;b<c;b++)G(m[b],b)}function F(c,e){for(var d="<div class='edit-button-group'><button type='button' class='add-thread-button btn btn-primary btn-default'>Add Thread</button><button style='float:right;' type='button' class='save-edit-button btn btn-primary btn-default'>Save</button><button style='float:right; margin-right: 5px;' type='button' class='cancel-edit-button btn btn-default'>Cancel</button></div>",f=a("<div>").append(a("#template > option").clone()).html(),
g=a("<div>").append(a(".column-settings").children().clone().each(function(){var b=a(this).find("label"),c=a(this).find("*[id]");b.attr("for",b.attr("for")+"-"+e);c.attr("id",c.attr("id")+"-"+e)})).html(),h=0,k=c.threads.length;h<k;h++)d+="<div class='subreddit-group-edit'>"+("<div class='form-group'><label class='control-label'>Subreddit</label><span style='float:right;'><i class='fa fa-close fa-lg delete-edit'></i></span><select class='form-control subreddit-edit'>"+f+"</select></div>")+("<div class='form-group'><label class='control-label'>Threads</label><select data-column='"+
e+"' class='form-control thread-edit'></select></div>")+"</div>";d+="<div class='edit-column-settings'>"+g+"</div>";a(".edit-form[data-column="+e+"]").append(d);a("#column-name-"+e).val(c.settings.name);a("#refresh-"+e).val(c.settings.refreshRate);a("#limit-"+e).val(c.settings.limitPosts);a("#sortBy-"+e).val(c.settings.sortBy);a(".edit-form[data-column="+e+"] .subreddit-edit").each(function(b,c){this.value=m[e].threads[b].subreddit;a(this).unbind("change").bind("change",function(){var b=a(".edit-form[data-column="+
e+"] .subreddit-group-edit").index(a(this).parent().parent());q(this.value,"","",{target:["edit-form .thread-edit",b,e],callback:l})})});b("delete-edit");n(".edit-form[data-column="+e+"]","edit-button-group","subreddit-group-edit","subreddit-edit","thread-edit","delete-edit");C(c,e);z(c,e)}function z(b,c){a(".edit-form[data-column="+c+"] .save-edit-button").unbind("click").bind("click",function(){var a=".edit-form[data-column="+c+"]";p(a+" .subreddit-group-edit",".subreddit-edit",".thread-edit",a+
" .edit-column-settings",c);v("config",m);G(m[c],c);f(c)})}function C(b,c){a(".edit-form[data-column="+c+"] .cancel-edit-button").unbind("click").bind("click",function(){G(b,c);f(c)})}function G(b,d){a(".item[data-column="+d+"]").remove();var f="<div data-column='"+d+"' class='item "+(0==d?"active":"")+"'>"+("<div data-column='"+d+"' data-type='"+b.type+"' class='frame-position nopacity'>"+("<div class='frame-container'>"+("<i data-column='"+d+"' class='nopacity loading fa fa-refresh fa-spin fa-2x'></i><div class='frame-overlay' data-column='"+
d+"'><div data-column='"+d+"' class='frame'><h6 class='frame-header'>"+("reddit"==b.type?"<i class='fa fa-reddit fa-lg'></i> ":"<i class='fa fa-twitter'></i> ")+b.settings.name+("<span style='float:right;'><i data-column='"+d+"' class='fa fa-toggle-on fa-lg refreshSwitch'></i><i data-column='"+d+"' class='fa fa-edit fa-lg'></i><i data-column='"+d+"' class='fa fa-close fa-lg'></i></span>")+"</h6>"+("<div data-column='"+d+"' class='frame-edit nopacity hide'><form data-column='"+d+"' role='form' class='edit-form'></form></div>")+
"</div></div>"+("<div data-column='"+d+"' class='frame-content nopacity'></div>"))+"</div>")+"</div>")+"</div>",g=a(".carousel-inner");0==d?0<g.children().length?a(f).insertBefore(".item:first"):g.append(f):a(f).insertAfter(a(".item[data-column="+(d-1)+"]"));h(d);F(b,d);"reddit"==b.type&&(c(b,d),e(d));D();w(".frame-position[data-column="+d+"]",100)}function d(a){clearInterval(app["r"+a]);delete app["r"+a]}function e(b){d(b);a(".refreshSwitch[data-column="+b+"]").hasClass("fa-toggle-on")?app["r"+b]=
setInterval(function(){c(m[b],b)},1E3*parseInt(m[b].settings.refreshRate)):clearInterval(app["r"+b])}function h(b){a(".refreshSwitch[data-column="+b+"]").unbind("click").bind("click",function(){var b=a(this).data("column");a(this).toggleClass("fa-toggle-on fa-toggle-off");a(this).hasClass("fa-toggle-on")&&c(m[b],b);e(b)});a(".fa-edit[data-column="+b+"]").unbind("click").bind("click",function(){var b=a(this).data("column"),c=a(".frame-edit[data-column="+b+"]"),e=a(".frame-content[data-column="+b+"]");
c.hasClass("hide")?(c.removeClass("hide"),e.removeClass("faded").addClass("hide"),w(c,100),a(".edit-form[data-column="+b+"] .subreddit-group-edit").each(function(b,c){var e=a(this).find(".subreddit-edit").val(),d=a(this).find(".thread-edit").val();"default"!=e&&null==d&&a(this).find(".subreddit-edit").trigger("change")})):(c.removeClass("faded").addClass("hide"),e.removeClass("hide"),w(e,100))});a(".fa-close[data-column="+b+"]").unbind("click").bind("click",function(){var b=a(this).data("column");
a("#delete-column").data("column",b);a("#column-to-delete").text(m[b].settings.name);a("#delete-column-modal").modal()})}function f(b){a(".item").removeClass("active");a(".item[data-column="+b+"]").addClass("active")}function c(b,c){k(c);for(var e=[],d=0,f=b.threads.length;d<f;d++)q(b.threads[d].thread,b.settings.sortBy,b.settings.limitPosts,{target:c,callback:function(b,c){e=e.concat([b.concat(c)]);if(m[c].threads.length==e.length){var d=R(e);O(d,c);a(".frame-overlay[data-column="+c+"]").removeClass("half-fade");
a(".loading[data-column="+c+"]").removeClass("faded")}}})}function E(){if(0<m.length){a("#current-config").removeClass("hide");var b=a("#config-row-container");b.children().remove();for(var c="",e=0,f=m.length;e<f;e++)c+="<div data-columnNum='"+e+"' class='col-xs-12 col-md-8 config-panel-column nopacity'>"+m[e].settings.name+"<span class='icon-right icon-config'><i class='fa fa-edit fa-lg'></i><i class='fa fa-close fa-lg'></i></span></div>";b.append(c);w(b.children(),100);b.find(".fa-close").unbind("click").bind("click",
function(){var b=a(this).parent().parent().data("columnnum");d(b);m.remove(b);v("config",m);E()})}else a("#current-config").removeClass("hide").addClass("hide")}function p(b,c,e,d,f){var g={},h={},k=[];b=a(b);d=a(d).find(".form-control");var l="undefined"!==typeof f&&"reddit"==a(".frame-position[data-column="+f+"]").data("type")||!a("#reddit").hasClass("hide")?"reddit":"twitter";b.each(function(b,d){var f={},g=a(d).find(e+" option:selected");f.subreddit=a(d).find(c).val();f.thread=a(d).find(e).val();
f.threadid=g.data("threadid");f.threadtitle=g.data("threadtitle");f.subid=g.data("subid");k.push(f)});g.threads=k;h.name=d[0].value;h.refreshRate=d[1].value;h.limitPosts=d[2].value;h.sortBy=d[3].value;g.settings=h;g.type=l;"undefined"!==typeof f?m[f]=g:m=m.concat(g)}function t(){a(".fa-arrow-circle-left, .fa-arrow-circle-right").unbind("click").click(function(){a(this).hasClass("fa-arrow-circle-left")?a(".add-thread-button").hasClass("hide")?a("#add-button, .add-thread-button, [id^=helpBlock-], .fa-arrow-circle-right, .sub-group-controls, .column-settings").toggleClass("hide"):
a("#vendor-group, #reddit").toggleClass("hide"):a(".add-thread-button").hasClass("hide")||(a(".add-thread-button").addClass("hide"),a("#add-button").removeClass("hide"),a("[id^=helpBlock-], .fa-arrow-circle-right, .sub-group-controls, .column-settings").toggleClass("hide"))})}function r(){a("#cancel-column").unbind("click").bind("click",function(){a(".sub-group-controls").remove();a("#add-a-column, #reddit").toggleClass("hide");a("#helpBlock-1").hasClass("hide")&&a("#add-button, .add-thread-button, [id^=helpBlock-], .fa-arrow-circle-right, .sub-group-controls, .column-settings").toggleClass("hide")})}
function n(c,e,d,f,g,h){a(c+" .add-thread-button").unbind("click").click(function(){var k="<div class='"+d+" nopacity'>"+("<div class='form-group'><label class='control-label'>Subreddit</label><span style='float:right;'><i class='fa fa-close fa-lg "+h+"'></i></span><select class='form-control "+f+"'></select></div>")+("<div class='form-group'><label class='control-label'>Threads</label><select class='form-control "+g+"'></select></div>")+"</div>",m=a("#template > option").clone();a(k).insertAfter(c+
" ."+e);a(c+" ."+f+":first").append(m);a(c+" ."+f+":first").unbind("change").bind("change",function(){var b=a("."+d).index(a(this).parent().parent());q(this.value,"","",{target:[g,b],callback:l})});w("."+d,100);b(h)})}function b(b){a("."+b).unbind("click").bind("click",function(){a(this).parent().parent().parent().remove()})}function N(){a("#add-a-column").unbind("click").bind("click",function(){a(this).removeClass("hide").addClass("hide");a("#vendor-group").removeClass("hide");I()})}function l(b,
c){var e=c[2]?a(a("."+c[0]+"[data-column="+c[2]+"]")[c[1]]):a(a("."+c[0])[c[1]]);e.children().remove();b.data.children.forEach(function(a,b){e.append("<option data-subid='"+a.data.subreddit_id+"' data-threadtitle='"+a.data.title+"' data-threadid='"+a.data.id+"' value='"+a.data.permalink+"'>"+a.data.title+"</option>")});if(0<m.length&&"undefined"!==typeof c[2]){var d=m[c[2]].threads[c[1]];0==e.find("option[data-threadid="+d.threadid+"]").length&&d.subid==e.find("option:selected").data("subid")&&e.append("<option data-threadid='"+
d.threadid+"' value='"+d.thread+"'>"+d.threadtitle+"</option>");e.find("option[data-threadid="+d.threadid+"]").prop("selected",!0)}}function k(b){a(".frame-overlay[data-column="+b+"]").addClass("half-fade");a(".loading[data-column="+b+"]").addClass("faded")}function w(b,c){setTimeout(function(){a(b).addClass("faded")},c)}function O(b,c){$frameContent=a(".frame-content[data-column="+c+"]");$frameContent.children().remove();$frameContent.removeClass("faded");b[1].data.children.forEach(function(b,c){var e=
"more"!=b.kind&&b.data.replies.hasOwnProperty("data")?b.data.replies.data.children:[],d=e.length,d=0==d?"":1==d?d+" reply":d+" replies",f="more"!=b.kind?"<footer class='comment-footer'><div class='time-container'>"+M(b.data.created_utc)+"</div><div class='links-container'><i class='fa fa-reply fa-lg'></i><a href='"+L(b.data.link_id,b.data.id)+"' target='_blank'><i class='fa fa-link fa-lg'></i></a><i class='fa fa-newspaper-o fa-lg'></i><i class='fa fa-reddit fa-lg'></i></div>":"",e=a("<div/>").html(b.data.body_html).text()+
f+K(e);body="<div class='media-body'>"+("more"!=b.kind?"<p class='media-heading'><a style='color:white;' href='http://www.reddit.com/u/"+b.data.author+"' target='_blank'>"+b.data.author+"</a>  |  "+b.data.score+"  |  <a data-name='"+b.data.name+"' class='reply'><span class='text-warning'>"+d+"</span></a></p>"+e:"<div>load more comments</div>"+e)+"</div>";thumbnail="more"!=b.kind?"<div class='thumb pull-left icon-"+b.data.subreddit+"'></div>":"<a style='padding: 5px 0 0 5px;'class='pull-left' href='#'><i class='fa fa-download'></i></a>";
media="<div id='"+b.data.name+"' class='media parent'>"+thumbnail+body+"</div>";$frameContent.append(media)});w($frameContent,1E3);a(".md a").attr("target","_blank");Q();P()}function K(b){b=b||[];var c="";b.forEach(function(b){var e="more"!=b.kind&&b.data.replies.hasOwnProperty("data")?b.data.replies.data.children:[],d=e.length,d=0==d?"":1==d?d+" reply":d+" replies",f="more"!=b.kind?"<footer class='comment-footer'><div class='time-container'>"+M(b.data.created_utc)+"</div>\t<div class='links-container'><i class='fa fa-reply fa-lg'></i><a href='"+
L(b.data.link_id,b.data.id)+"' target='_blank'><i class='fa fa-link fa-lg'></i></a><i class='fa fa-newspaper-o fa-lg'></i><i class='fa fa-reddit fa-lg'></i></div>":"",e=a("<div/>").html(b.data.body_html).text()+f+K(e);body="<div style='padding-top:5px;' class='media-body'>"+("more"!=b.kind?"<p class='media-heading'><a style='color:white;' href='http://www.reddit.com/u/"+b.data.author+"' target='_blank'>"+b.data.author+"</a>  |  "+b.data.score+"  |  <a data-name='"+b.data.name+"' class='reply'><span class='text-warning'>"+
d+"</span></a></p>"+e:"<div class='loadReplies' id='"+b.data.id+"' data-name='"+b.data.name+"' data-parent='"+b.data.parent_id+"'>load "+b.data.count+" replies</div><p></p>")+"</div>";thumbnail="more"!=b.kind?"<div class='thumb pull-left'></div>":"<a style='padding: 5px 0 0 5px;'class='pull-left' href='#'><i class='fa fa-download'></i></a>";media="<div id='"+b.data.name+"' class='media hide'>"+thumbnail+body+"</div>";c+=media});return c}function P(){a(".reply").unbind("click").click(function(){a("#"+
a(this).data("name")).find(".hide").removeClass("hide")})}function Q(){a(".loadReplies").unbind("click").click(function(){var b=a(this).data("team"),c=a(this).data("parent"),e="team1"==b?a("#threads-1").val():a("#threads-2").val();q(e+c.substr(3),"",b,function(b,e){var d=K(b[1].data.children,e);a("#"+c).replaceWith(d);"merger"!=a("#"+c).parent().attr("id")||a("#"+c).hasClass("parent")||a("#"+c).addClass("parent");a(".media:not(.faded)").find(".md a").attr("target","_blank");w(".media:not(.faded)",
1E3)})})}function L(a,b){return"http://www.reddit.com/comments/"+a.substr(3)+"/_/"+b}function M(a){a=new Date(1E3*a);var b=(new Date).getTime()-a.getTime(),c=Math.floor(b/864E5),b=b-864E5*c,e=Math.floor(b/36E5),b=b-36E5*e,d=Math.floor(b/6E4),b=Math.floor((b-6E4*d)/1E3);return 0==!c?c+"d":0==c&&0==!e?e+"h":0==c&&0==e&&0==!d?d+"m":0==c&&0==e&&0==d&&0==!b?b+"s":a.toLocalTimeString()}function R(a){var b=[];a.forEach(function(a,c){b=b.concat(a[1].data.children)});b=b.filter(function(a){if("more"!=a.kind)return a}).sort(function(a,
b){return"more"!=a.kind&&"more"==b.kind?1:"more"==a.kind&&"more"!=b.kind?-1:a.data.created_utc<b.data.created_utc?1:a.data.created_utc>b.data.created_utc?-1:0});a[0][1].data.children=b;return a[0]}function q(b,c,e,d){a.getJSON("http://www.reddit.com"+b+"/.json?sort="+c+"&limit="+e+"&jsonp=?",function(a){d.callback(a,d.target)}).fail(function(){console.log("error retrieving - "+b+" json");d.callback([],d.target)}).always(function(){d.always&&d.always(d.target)})}var J;J=Storage&&localStorage.getItem("config")?
Storage?JSON.parse(localStorage.getItem("config")):void 0:[];var m=J;return{init:function(){u();g();y()}}}(jQuery);$(document).ready(function(){app.init()});Array.prototype.remove=function(a,v){var u=this.slice((v||a)+1||this.length);this.length=0>a?this.length+a:a;return this.push.apply(this,u)}};(function(a,v,u,x,g,y,A){a.GoogleAnalyticsObject=g;a[g]=a[g]||function(){(a[g].q=a[g].q||[]).push(arguments)};a[g].l=1*new Date;y=v.createElement(u);A=v.getElementsByTagName(u)[0];y.async=1;y.src=x;A.parentNode.insertBefore(y,A)})(window,document,"script","//www.google-analytics.com/analytics.js","ga");ga("create","UA-57745225-1","auto");ga("send","pageview");
