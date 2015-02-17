(function(a){function z(b,k,c){var f=this;return this.on("click.pjax",b,function(b){var d=a.extend({},s(k,c));d.container||(d.container=a(this).attr("data-pjax")||f);n(b,d)})}function n(b,k,c){c=s(k,c);k=b.currentTarget;if("A"!==k.tagName.toUpperCase())throw"$.fn.pjax or $.pjax.click requires an anchor element";if(!(1<b.which||b.metaKey||b.ctrlKey||b.shiftKey||b.altKey||location.protocol!==k.protocol||location.hostname!==k.hostname||k.hash&&k.href.replace(k.hash,"")===location.href.replace(location.hash,
"")||k.href===location.href+"#")){var f={url:k.href,container:a(k).attr("data-pjax"),target:k};c=a.extend({},f,c);f=a.Event("pjax:click");a(k).trigger(f,[c]);f.isDefaultPrevented()||(e(c),b.preventDefault(),a(k).trigger("pjax:clicked",[c]))}}function B(b,c,f){f=s(c,f);c=b.currentTarget;if("FORM"!==c.tagName.toUpperCase())throw"$.pjax.submit requires a form element";c={type:c.method.toUpperCase(),url:c.action,data:a(c).serializeArray(),container:a(c).attr("data-pjax"),target:c};e(a.extend({},c,f));
b.preventDefault()}function e(b){function c(b,f){var k=a.Event(b,{relatedTarget:l});d.trigger(k,f);return!k.isDefaultPrevented()}b=a.extend(!0,{},a.ajaxSettings,e.defaults,b);a.isFunction(b.url)&&(b.url=b.url());var l=b.target,p=F(b.url).hash,d=b.context=I(b.container);b.data||(b.data={});b.data._pjax=d.selector;var h;b.beforeSend=function(a,f){"GET"!==f.type&&(f.timeout=0);a.setRequestHeader("X-PJAX","true");a.setRequestHeader("X-PJAX-Container",d.selector);if(!c("pjax:beforeSend",[a,f]))return!1;
0<f.timeout&&(h=setTimeout(function(){c("pjax:timeout",[a,b])&&a.abort("timeout")},f.timeout),f.timeout=0);b.requestUrl=F(f.url).href};b.complete=function(a,f){h&&clearTimeout(h);c("pjax:complete",[a,f,b]);c("pjax:end",[a,b])};b.error=function(a,f,d){var m=H("",a,b);a=c("pjax:error",[a,f,d,b]);"GET"==b.type&&("abort"!==f&&a)&&G(m.url)};b.success=function(f,l,g){var m="function"===typeof a.pjax.defaults.version?a.pjax.defaults.version():a.pjax.defaults.version,h=g.getResponseHeader("X-PJAX-Version"),
w=H(f,g,b);if(m&&h&&m!==h)G(w.url);else if(w.contents){e.state={id:b.id||(new Date).getTime(),url:w.url,title:w.title,container:d.selector,fragment:b.fragment,timeout:b.timeout};(b.push||b.replace)&&window.history.replaceState(e.state,w.title,w.url);try{document.activeElement.blur()}catch(A){}w.title&&(document.title=w.title);d.html(w.contents);(m=d.find("input[autofocus], textarea[autofocus]").last()[0])&&document.activeElement!==m&&m.focus();M(w.scripts);"number"===typeof b.scrollTo&&a(window).scrollTop(b.scrollTo);
""!==p&&(m=F(w.url),m.hash=p,e.state.url=m.href,window.history.replaceState(e.state,w.title,m.href),w=a(m.hash),w.length&&a(window).scrollTop(w.offset().top));c("pjax:success",[f,l,g,b])}else G(w.url)};e.state||(e.state={id:(new Date).getTime(),url:window.location.href,title:document.title,container:d.selector,fragment:b.fragment,timeout:b.timeout},window.history.replaceState(e.state,document.title));var g=e.xhr;g&&4>g.readyState&&(g.onreadystatechange=a.noop,g.abort());e.options=b;g=e.xhr=a.ajax(b);
0<g.readyState&&(b.push&&!b.replace&&(f(e.state.id,d.clone().contents()),window.history.pushState(null,"",K(b.requestUrl))),c("pjax:start",[g,b]),c("pjax:send",[g,b]));return e.xhr}function y(b,c){return e(a.extend({url:window.location.href,push:!1,replace:!0,scrollTo:!1},s(b,c)))}function G(a){window.history.replaceState(null,"","#");window.location.replace(a)}function J(b){if((b=b.state)&&b.container){if(c&&A==b.url||e.state&&e.state.id===b.id)return;var f=a(b.container);if(f.length){var d,p=x[b.id];
if(e.state){var g=d=e.state.id<b.id?"forward":"back",h=e.state.id,v=f.clone().contents();x[h]=v;"forward"===g?(g=r,v=t):(g=t,v=r);g.push(h);(h=v.pop())&&delete x[h]}d=a.Event("pjax:popstate",{state:b,direction:d});f.trigger(d);d={id:b.id,url:b.url,container:f,push:!1,fragment:b.fragment,timeout:b.timeout,scrollTo:!1};p?(f.trigger("pjax:start",[null,d]),b.title&&(document.title=b.title),f.html(p),e.state=b,f.trigger("pjax:end",[null,d])):e(d);f[0].offsetHeight}else G(location.href)}c=!1}function L(b){var c=
a.isFunction(b.url)?b.url():b.url,f=b.type?b.type.toUpperCase():"GET",d=a("<form>",{method:"GET"===f?"GET":"POST",action:c,style:"display:none"});"GET"!==f&&"POST"!==f&&d.append(a("<input>",{type:"hidden",name:"_method",value:f.toLowerCase()}));b=b.data;if("string"===typeof b)a.each(b.split("&"),function(b,c){var f=c.split("=");d.append(a("<input>",{type:"hidden",name:f[0],value:f[1]}))});else if("object"===typeof b)for(key in b)d.append(a("<input>",{type:"hidden",name:key,value:b[key]}));a(document.body).append(d);
d.submit()}function K(a){return a.replace(/\?_pjax=[^&]+&?/,"?").replace(/_pjax=[^&]+&?/,"").replace(/[\?&]$/,"")}function F(a){var c=document.createElement("a");c.href=a;return c}function s(b,c){b&&c?c.container=b:c=a.isPlainObject(b)?b:{container:b};c.container&&(c.container=I(c.container));return c}function I(b){b=a(b);if(b.length){if(""!==b.selector&&b.context===document)return b;if(b.attr("id"))return a("#"+b.attr("id"));throw"cant get selector for pjax container!";}throw"no pjax container for "+
b.selector;}function D(b){return a.parseHTML(b,document,!0)}function H(b,c,f){var d={};d.url=K(c.getResponseHeader("X-PJAX-URL")||f.requestUrl);if(/<html/i.test(b)){c=a(D(b.match(/<head[^>]*>([\s\S.]*)<\/head>/i)[0]));var g=a(D(b.match(/<body[^>]*>([\s\S.]*)<\/body>/i)[0]))}else c=g=a(D(b));if(0===g.length)return d;d.title=c.filter("title").add(c.find("title")).last().text();f.fragment?(b="body"===f.fragment?g:g.filter(f.fragment).add(g.find(f.fragment)).first(),b.length&&(d.contents=b.contents(),
d.title||(d.title=b.attr("title")||b.data("title")))):/<html/i.test(b)||(d.contents=g);d.contents&&(d.contents=d.contents.not(function(){return a(this).is("title")}),d.contents.find("title").remove(),d.scripts=d.contents.filter("script[src]").add(d.contents.find("script[src]")).remove(),d.contents=d.contents.not(d.scripts));d.title&&(d.title=a.trim(d.title));return d}function M(b){if(b){var c=a("script[src]");b.each(function(){var b=this.src;if(!c.filter(function(){return this.src===b}).length){var f=
document.createElement("script");f.type=a(this).attr("type");f.src=a(this).attr("src");document.head.appendChild(f)}})}}function f(a,c){x[a]=c;for(r.push(a);t.length;)delete x[t.shift()];for(;r.length>e.defaults.maxCacheLength;)delete x[r.shift()]}function d(){return a("meta").filter(function(){var b=a(this).attr("http-equiv");return b&&"X-PJAX-VERSION"===b.toUpperCase()}).attr("content")}function g(){a.fn.pjax=z;a.pjax=e;a.pjax.enable=a.noop;a.pjax.disable=h;a.pjax.click=n;a.pjax.submit=B;a.pjax.reload=
y;a.pjax.defaults={timeout:650,push:!0,replace:!1,type:"GET",dataType:"html",scrollTo:0,maxCacheLength:20,version:d};a(window).on("popstate.pjax",J)}function h(){a.fn.pjax=function(){return this};a.pjax=L;a.pjax.enable=g;a.pjax.disable=a.noop;a.pjax.click=a.noop;a.pjax.submit=a.noop;a.pjax.reload=function(){window.location.reload()};a(window).off("popstate.pjax",J)}var c=!0,A=window.location.href,v=window.history.state;v&&v.container&&(e.state=v);"state"in window.history&&(c=!1);var x={},t=[],r=[];
0>a.inArray("state",a.event.props)&&a.event.props.push("state");a.support.pjax=window.history&&window.history.pushState&&window.history.replaceState&&!navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/);a.support.pjax?g():h()})(jQuery);var hljs=new function(){function a(a){return a.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function z(a,d){var g=a&&a.exec(d);return g&&0==g.index}function n(a){a=(a.className+" "+(a.parentNode?a.parentNode.className:"")).split(/\s+/);a=a.map(function(a){return a.replace(/^lang(uage)?-/,"")});return a.filter(function(a){return I(a)||/no(-?)highlight/.test(a)})[0]}function B(a,d){var g={},h;for(h in a)g[h]=a[h];if(d)for(h in d)g[h]=d[h];return g}function e(a){var d=[];(function h(a,
f){for(var e=a.firstChild;e;e=e.nextSibling)3==e.nodeType?f+=e.nodeValue.length:1==e.nodeType&&(d.push({event:"start",offset:f,node:e}),f=h(e,f),e.nodeName.toLowerCase().match(/br|hr|img|input/)||d.push({event:"stop",offset:f,node:e}));return f})(a,0);return d}function y(f,d,g){function h(){return f.length&&d.length?f[0].offset!=d[0].offset?f[0].offset<d[0].offset?f:d:"start"==d[0].event?f:d:f.length?f:d}function c(b){t+="<"+b.nodeName.toLowerCase()+Array.prototype.map.call(b.attributes,function(b){return" "+
b.nodeName+'="'+a(b.value)+'"'}).join("")+">"}function e(a){t+="</"+a.nodeName.toLowerCase()+">"}function v(a){("start"==a.event?c:e)(a.node)}for(var x=0,t="",r=[];f.length||d.length;){var b=h(),t=t+a(g.substr(x,b[0].offset-x)),x=b[0].offset;if(b==f){r.reverse().forEach(e);do v(b.splice(0,1)[0]),b=h();while(b==f&&b.length&&b[0].offset==x);r.reverse().forEach(c)}else"start"==b[0].event?r.push(b[0].node):r.pop(),v(b.splice(0,1)[0])}return t+a(g.substr(x))}function G(a){function d(a){return a&&a.source||
a}function g(c,g){return RegExp(d(c),"m"+(a.cI?"i":"")+(g?"g":""))}function e(c,A){if(!c.compiled){c.compiled=!0;c.k=c.k||c.bK;if(c.k){var v={},x=function(b,c){a.cI&&(c=c.toLowerCase());c.split(" ").forEach(function(a){a=a.split("|");v[a[0]]=[b,a[1]?Number(a[1]):1]})};"string"==typeof c.k?x("keyword",c.k):Object.keys(c.k).forEach(function(a){x(a,c.k[a])});c.k=v}c.lR=g(c.l||/\b[A-Za-z0-9_]+\b/,!0);A&&(c.bK&&(c.b="\\b("+c.bK.split(" ").join("|")+")\\b"),c.b||(c.b=/\B|\b/),c.bR=g(c.b),c.e||c.eW||(c.e=
/\B|\b/),c.e&&(c.eR=g(c.e)),c.tE=d(c.e)||"",c.eW&&A.tE&&(c.tE+=(c.e?"|":"")+A.tE));c.i&&(c.iR=g(c.i));void 0===c.r&&(c.r=1);c.c||(c.c=[]);var t=[];c.c.forEach(function(a){a.v?a.v.forEach(function(c){t.push(B(a,c))}):t.push("self"==a?c:a)});c.c=t;c.c.forEach(function(a){e(a,c)});c.starts&&e(c.starts,A);var r=c.c.map(function(a){return a.bK?"\\.?("+a.b+")\\.?":a.b}).concat([c.tE,c.i]).map(d).filter(Boolean);c.t=r.length?g(r.join("|"),!0):{exec:function(a){return null}}}}e(a)}function J(f,d,g,e){function c(a,
b){if(z(a.eR,b))return a;if(a.eW)return c(a.parent,b)}function A(a,b,c,f){f='<span class="'+(f?"":D.classPrefix);return f+(a+'">')+b+(c?"":"</span>")}function v(){var c;if(void 0!==b.sL)b.sL&&!H[b.sL]?c=a(p):(c=b.sL?J(b.sL,p,!0,k):L(p),0<b.r&&(n+=c.r),"continuous"==b.subLanguageMode&&(k=c.top),c=A(c.language,c.value,!1,!0));else if(b.k){c="";var f=0;b.lR.lastIndex=0;for(var d=b.lR.exec(p);d;){c+=a(p.substr(f,d.index-f));var f=b,e=d,e=r.cI?e[0].toLowerCase():e[0];(f=f.k.hasOwnProperty(e)&&f.k[e])?
(n+=f[1],c+=A(f[0],a(d[0]))):c+=a(d[0]);f=b.lR.lastIndex;d=b.lR.exec(p)}c+=a(p.substr(f))}else c=a(p);return c}function x(c,f){var d=c.cN?A(c.cN,"",!0):"";c.rB?(l+=d,p=""):c.eB?(l+=a(f)+d,p=""):(l+=d,p=f);b=Object.create(c,{parent:{value:b}})}function t(f,d){p+=f;if(void 0===d)return l+=v(),0;var e;a:{e=b;for(var h=0;h<e.c.length;h++)if(z(e.c[h].bR,d)){e=e.c[h];break a}e=void 0}if(e)return l+=v(),x(e,d),e.rB?0:d.length;if(e=c(b,d)){h=b;h.rE||h.eE||(p+=d);l+=v();do b.cN&&(l+="</span>"),n+=b.r,b=b.parent;
while(b!=e.parent);h.eE&&(l+=a(d));p="";e.starts&&x(e.starts,"");return h.rE?0:d.length}if(!g&&z(b.iR,d))throw Error('Illegal lexeme "'+d+'" for mode "'+(b.cN||"<unnamed>")+'"');p+=d;return d.length||1}var r=I(f);if(!r)throw Error('Unknown language: "'+f+'"');G(r);var b=e||r,k,l="";for(e=b;e!=r;e=e.parent)e.cN&&(l=A(e.cN,"",!0)+l);var p="",n=0;try{for(var s,B,y=0;;){b.t.lastIndex=y;s=b.t.exec(d);if(!s)break;B=t(d.substr(y,s.index-y),s[0]);y=s.index+B}t(d.substr(y));for(e=b;e.parent;e=e.parent)e.cN&&
(l+="</span>");return{r:n,value:l,language:f,top:b}}catch(F){if(-1!=F.message.indexOf("Illegal"))return{r:0,value:a(d)};throw F;}}function L(f,d){d=d||D.languages||Object.keys(H);var e={r:0,value:a(f)},h=e;d.forEach(function(a){if(I(a)){var d=J(a,f,!1);d.language=a;d.r>h.r&&(h=d);d.r>e.r&&(h=e,e=d)}});h.language&&(e.second_best=h);return e}function K(a){D.tabReplace&&(a=a.replace(/^((<[^>]+>|\t)+)/gm,function(a,f,e,c){return f.replace(/\t/g,D.tabReplace)}));D.useBR&&(a=a.replace(/\n/g,"<br>"));return a}
function F(a){var d=n(a);if(!/no(-?)highlight/.test(d)){var g;D.useBR?(g=document.createElementNS("http://www.w3.org/1999/xhtml","div"),g.innerHTML=a.innerHTML.replace(/\n/g,"").replace(/<br[ \/]*>/g,"\n")):g=a;var h=g.textContent,c=d?J(d,h,!0):L(h);g=e(g);if(g.length){var s=document.createElementNS("http://www.w3.org/1999/xhtml","div");s.innerHTML=c.value;c.value=y(g,e(s),h)}c.value=K(c.value);a.innerHTML=c.value;a.className+=" hljs "+(!d&&c.language||"");a.result={language:c.language,re:c.r};c.second_best&&
(a.second_best={language:c.second_best.language,re:c.second_best.r})}}function s(){if(!s.called){s.called=!0;var a=document.querySelectorAll("pre code");Array.prototype.forEach.call(a,F)}}function I(a){return H[a]||H[M[a]]}var D={classPrefix:"hljs-",tabReplace:null,useBR:!1,languages:void 0},H={},M={};this.highlight=J;this.highlightAuto=L;this.fixMarkup=K;this.highlightBlock=F;this.configure=function(a){D=B(D,a)};this.initHighlighting=s;this.initHighlightingOnLoad=function(){addEventListener("DOMContentLoaded",
s,!1);addEventListener("load",s,!1)};this.registerLanguage=function(a,d){var e=H[a]=d(this);e.aliases&&e.aliases.forEach(function(d){M[d]=a})};this.listLanguages=function(){return Object.keys(H)};this.getLanguage=I;this.inherit=B;this.IR="[a-zA-Z][a-zA-Z0-9_]*";this.UIR="[a-zA-Z_][a-zA-Z0-9_]*";this.NR="\\b\\d+(\\.\\d+)?";this.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";this.BNR="\\b(0b[01]+)";this.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";
this.BE={b:"\\\\[\\s\\S]",r:0};this.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[this.BE]};this.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[this.BE]};this.PWM={b:/\b(a|an|the|are|I|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such)\b/};this.CLCM={cN:"comment",b:"//",e:"$",c:[this.PWM]};this.CBCM={cN:"comment",b:"/\\*",e:"\\*/",c:[this.PWM]};this.HCM={cN:"comment",b:"#",e:"$",c:[this.PWM]};this.NM={cN:"number",b:this.NR,r:0};this.CNM={cN:"number",b:this.CNR,r:0};this.BNM=
{cN:"number",b:this.BNR,r:0};this.CSSNM={cN:"number",b:this.NR+"(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",r:0};this.RM={cN:"regexp",b:/\//,e:/\/[gim]*/,i:/\n/,c:[this.BE,{b:/\[/,e:/\]/,r:0,c:[this.BE]}]};this.TM={cN:"title",b:this.IR,r:0};this.UTM={cN:"title",b:this.UIR,r:0}};
hljs.registerLanguage("javascript",function(a){return{aliases:["js"],k:{keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const class",literal:"true false null undefined NaN Infinity",built_in:"eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document"},
c:[{cN:"pi",b:/^\s*('|")use strict('|")/,r:10},a.ASM,a.QSM,a.CLCM,a.CBCM,a.CNM,{b:"("+a.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[a.CLCM,a.CBCM,a.RM,{b:/</,e:/>;/,r:0,sL:"xml"}],r:0},{cN:"function",bK:"function",e:/\{/,eE:!0,c:[a.inherit(a.TM,{b:/[A-Za-z$_][0-9A-Za-z$_]*/}),{cN:"params",b:/\(/,e:/\)/,c:[a.CLCM,a.CBCM],i:/["'\(]/}],i:/\[|%/},{b:/\$[(.]/},{b:"\\."+a.IR,r:0}]}});if("undefined"===!window.jQuery)throw Error("app.js requires jQuery");else{var app=function(a){function z(a){if(Storage)return JSON.parse(localStorage.getItem(a))}function n(a,b){Storage&&localStorage.setItem(a,JSON.stringify(b))}function B(){a(document).pjax("a[data-pjax]","#pjax-container");a(document).on("pjax:send",function(){});a(document).on("pjax:end",function(){0<a("#listsjs").length?y():0<a("#merger").length?G():(a(".teams").hide(),a("#sidebarTrigger").hide(),a(".navbar-fixed-top").show(),
a(".navbar-brand > .text-warning").text("kurtlocker.org"),a(".social").show())})}function e(){a("#sidebarTrigger").unbind("click").click(function(b){b.preventDefault();a("#wrapper").toggleClass("toggled")})}function y(){0<a("#listsjs").length&&(e(),a("#sidebarTrigger").show(),a(".navbar-brand > .text-warning").text("[ l [ i [ s ] t ] s ]"),a("div.js").each(function(b,u){a(u).text(a(u).text().trim());hljs.highlightBlock(u)}),a(".sidebarFunc").unbind("click").click(function(){a(".sidebarFunc").removeClass("blue-dotted");
a(this).addClass("blue-dotted");a(".nav-tabs").removeClass("blue-dotted");a("#function-"+a(this).attr("num")).addClass("blue-dotted");a("html, body").animate({scrollTop:a("#function-"+a(this).attr("num")).offset().top-60},500);a("#wrapper").hasClass("toggled")&&a("#wrapper").toggleClass("toggled")}),a("#page-content-wrapper").unbind("click").click(function(){a("#wrapper").hasClass("toggled")&&a("#wrapper").toggleClass("toggled")}))}function G(){0<a("#merger").length&&(a(".teams").show(),a(".social").hide(),
a(".navbar-fixed-top").hide(),a(".navbar-brand > .text-warning").text("thread merger"),a(".open-controls").unbind("click").click(function(){I()}),a("#delete-column").unbind("click").click(function(){q.remove(a(this).data("column"));A(a(this).data("column"));n("config",q);k();f()}),0<q.length&&(k(),f()),J(),s())}function J(){var a;Object.keys(T).length?a=T:a={subs:"nfl nba mlb nhl mls hockey soccer".split(" "),match:["Game Thread","Match Thread","Live Thread"]};L(a);K(a.match)}function L(b){var u=
b.match,c="",d="";b.subs.forEach(function(a,b){c+=F(a,"input")});u.forEach(function(a,b){d+=F(a,"input")});a("#watch-subreddits .list-group.contain, #watch-matching .list-group.contain").children().remove();a("#watch-subreddits .list-group.contain").append(c);a("#watch-matching .list-group.contain").append(d)}function K(b){a("#watch-threads .list-group.contain").children().remove();a("#watch-subreddits input").each(function(c,d){O("/r/"+d.value,"","",{target:b,callback:function(c,u){c.data.children.forEach(function(c,
u){b.some(function(a){return RegExp(a.toLowerCase()).test(c.data.title.toLowerCase())})&&a("#watch-threads .list-group.contain").append(F(c.data));m(a("#watch-threads .list-group-item"),100)})}})})}function F(a,b){return"input"==b?"<li class='list-group-item'><div class='input-group'><input class='form-control' type='text' value='"+a+"'></input><span class='input-group-addon'><i class='fa fa-close'></i></span></div></li>":"<li class='list-group-item nopacity'>"+a.title+" <span class='text-primary'>in /r/"+
a.subreddit+"</span></li>"}function s(){app.height=window.innerHeight;a(".frame-content, .edit-form").css("height",window.innerHeight-107);a(window).unbind("resize").bind("resize",function(){app.height!=window.innerHeight&&(a(".frame-content, .edit-form").css("height",window.innerHeight-107),app.height=window.innerHeight)})}function I(){ba();k();D();a("#save-changes").unbind("click").bind("click",function(){M();n("config",q);f()});a("#controlModal").unbind("hide.bs.modal").on("hide.bs.modal",function(b){a("#config-rows").children().remove()});
a("#controlModal").modal()}function D(){m(a("a.white"),100);a("#reddit-logout").unbind("click").bind("click",function(){U("/reddit-logout",function(b,c,d){a(".config-account").children().remove();a(".config-account").append(b);m(a("a.white"),100)})})}function H(){a("#reddit-block, #twitter-block").unbind("click").bind("click",function(){"reddit-block"==this.id&&(P("#reddit","column-settings","sub-group-controls","subreddit-controls","thread-controls","delete-controls"),p(),a("#vendor-group, #reddit").toggleClass("hide"))})}
function M(){!a("#reddit").hasClass("hide")&&any(".thread-controls",function(b){return null!=a(b).val()})&&(l(".sub-group-controls",".subreddit-controls",".thread-controls","#reddit .column-settings"),k(),a("#cancel-column").trigger("click"))}function f(){a(".carousel-inner").children().remove();0==q.length?a("#greeting").show():a("#greeting").hide();for(var b=0,u=q.length;b<u;b++)c(q[b],b)}function d(b,c){for(var d="<div class='edit-button-group'><button type='button' class='add-thread-button btn btn-primary btn-default'>Add Thread</button><button style='float:right;' type='button' class='save-edit-button btn btn-primary btn-default'>Save</button><button style='float:right; margin-right: 5px;' type='button' class='cancel-edit-button btn btn-default'>Cancel</button></div>",
f=a("<div>").append(a("#template > option").clone()).html(),e=a("<div>").append(a(".column-settings").children().clone().each(function(){var b=a(this).find("label"),d=a(this).find("*[id]");b.attr("for",b.attr("for")+"-"+c);d.attr("id",d.attr("id")+"-"+c)})).html(),C=0,ca=b.threads.length;C<ca;C++)d+="<div class='subreddit-group-edit'>"+("<div class='form-group'><label class='control-label'>Subreddit</label><span style='float:right;'><i class='fa fa-close fa-lg delete-edit'></i></span><select class='form-control subreddit-edit'>"+
f+"</select></div>")+("<div class='form-group'><label class='control-label'>Threads</label><select data-column='"+c+"' class='form-control thread-edit'></select></div>")+"</div>";d+="<div class='edit-column-settings'>"+e+"</div>";a(".edit-form[data-column="+c+"]").append(d);a("#column-name-"+c).val(b.settings.name);a("#refresh-"+c).val(b.settings.refreshRate);a("#limit-"+c).val(b.settings.limitPosts);a("#sortBy-"+c).val(b.settings.sortBy);a(".edit-form[data-column="+c+"] .subreddit-edit").each(function(b,
d){this.value=q[c].threads[b].subreddit;a(this).unbind("change").bind("change",function(){var b=a(".edit-form[data-column="+c+"] .subreddit-group-edit").index(a(this).parent().parent());O(this.value,"","",{target:["edit-form .thread-edit",b,c],callback:R})})});Q("delete-edit");P(".edit-form[data-column="+c+"]","edit-button-group","subreddit-group-edit","subreddit-edit","thread-edit","delete-edit");h(b,c);g(b,c)}function g(b,u){a(".edit-form[data-column="+u+"] .save-edit-button").unbind("click").bind("click",
function(){var a=".edit-form[data-column="+u+"]";l(a+" .subreddit-group-edit",".subreddit-edit",".thread-edit",a+" .edit-column-settings",u);n("config",q);c(q[u],u);t(u)})}function h(b,u){a(".edit-form[data-column="+u+"] .cancel-edit-button").unbind("click").bind("click",function(){c(b,u);t(u)})}function c(b,c){a(".item[data-column="+c+"]").remove();var f="<div data-column='"+c+"' class='item "+(0==c?"active":"")+"'>"+("<div data-column='"+c+"' data-type='"+b.type+"' class='frame-position nopacity'>"+
("<div class='frame-container'>"+("<i data-column='"+c+"' class='nopacity loading fa fa-refresh fa-spin fa-2x'></i><div class='frame-overlay' data-column='"+c+"'><div data-column='"+c+"' class='frame'><h6 class='frame-header'>"+("reddit"==b.type?"<i class='fa fa-reddit fa-lg'></i> ":"<i class='fa fa-twitter'></i> ")+b.settings.name+("<span style='float:right;'><i data-column='"+c+"' class='fa fa-toggle-on fa-lg refreshSwitch'></i><i data-column='"+c+"' class='fa fa-edit fa-lg'></i><i data-column='"+
c+"' class='fa fa-close fa-lg'></i></span>")+"</h6>"+("<div data-column='"+c+"' class='frame-edit nopacity hide'><form data-column='"+c+"' role='form' class='edit-form'></form></div>")+"</div></div>"+("<div data-column='"+c+"' class='frame-content nopacity'></div>"))+"</div>")+"</div>")+"</div>",e=a(".carousel-inner");0==c?0<e.children().length?a(f).insertBefore(".item:first"):e.append(f):a(f).insertAfter(a(".item[data-column="+(c-1)+"]"));x(c);d(b,c);"reddit"==b.type&&(r(b,c),v(c));s();m(".frame-position[data-column="+
c+"]",100)}function A(a){clearInterval(app["r"+a]);delete app["r"+a]}function v(b){A(b);a(".refreshSwitch[data-column="+b+"]").hasClass("fa-toggle-on")?app["r"+b]=setInterval(function(){r(q[b],b)},1E3*parseInt(q[b].settings.refreshRate)):clearInterval(app["r"+b])}function x(b){a(".refreshSwitch[data-column="+b+"]").unbind("click").bind("click",function(){var b=a(this).data("column");a(this).toggleClass("fa-toggle-on fa-toggle-off");a(this).hasClass("fa-toggle-on")&&r(q[b],b);v(b)});a(".fa-edit[data-column="+
b+"]").unbind("click").bind("click",function(){var b=a(this).data("column"),c=a(".frame-edit[data-column="+b+"]"),d=a(".frame-content[data-column="+b+"]");c.hasClass("hide")?(c.removeClass("hide"),d.removeClass("faded").addClass("hide"),m(c,100),a(".edit-form[data-column="+b+"] .subreddit-group-edit").each(function(b,c){var d=a(this).find(".subreddit-edit").val(),u=a(this).find(".thread-edit").val();"default"!=d&&null==u&&a(this).find(".subreddit-edit").trigger("change")})):(c.removeClass("faded").addClass("hide"),
d.removeClass("hide"),m(d,100))});a(".fa-close[data-column="+b+"]").unbind("click").bind("click",function(){var b=a(this).data("column");a("#delete-column").data("column",b);a("#column-to-delete").text(q[b].settings.name);a("#delete-column-modal").modal()})}function t(b){a(".item").removeClass("active");a(".item[data-column="+b+"]").addClass("active")}function r(c,d){Y(d);for(var f=[],e=0,g=c.threads.length;e<g;e++)O(c.threads[e].thread,c.settings.sortBy,c.settings.limitPosts,{target:d,callback:function(c,
e){f=f.concat([c.concat(e)]);if(q[e].threads&&q[e].threads.length==f.length){var E=da(f);0==a(".frame-content[data-column="+d+"]").children().length&&0<E[1].data.children.length&&b(E[1].data.children[0].data.name,e);aa(E,e);S(e)}}})}function b(a,b){"undefined"!==typeof a&&(app["firstComment"+b]=a)}function k(){if(0<q.length){a("#current-config").removeClass("hide");var b=a("#config-rows");b.children().remove();for(var c="",d=0,e=q.length;d<e;d++)c+="<div data-columnNum='"+d+"' class='col-xs-12 col-md-8 config-panel-column nopacity'>"+
q[d].settings.name+"<span class='icon-right icon-config'><i class='fa fa-edit fa-lg'></i><i class='fa fa-close fa-lg'></i></span></div>";b.append(c);m(b.children(),100);b.find(".fa-close").unbind("click").bind("click",function(){var b=a(this).parent().parent().data("columnnum");A(b);q.remove(b);n("config",q);k()})}else a("#current-config").removeClass("hide").addClass("hide")}function l(b,c,d,e,f){var C={},g={},h=[];b=a(b);e=a(e).find(".form-control");var k="undefined"!==typeof f&&"reddit"==a(".frame-position[data-column="+
f+"]").data("type")||!a("#reddit").hasClass("hide")?"reddit":"twitter";b.each(function(b,e){if(a(e).find(d).val()){var f={},C=a(e).find(d+" option:selected");f.subreddit=a(e).find(c).val();f.thread=a(e).find(d).val();f.threadid=C.data("threadid");f.threadtitle=C.data("threadtitle");f.subid=C.data("subid");h.push(f)}});0<b.length&&(C.threads=h,g.name=e[0].value,g.refreshRate=e[1].value,g.limitPosts=e[2].value,g.sortBy=e[3].value,C.settings=g,C.type=k,"undefined"!==typeof f?q[f]=C:q=q.concat(C))}function p(){a("#cancel-column").unbind("click").bind("click",
function(){a(".sub-group-controls").remove();a("#add-a-column, #reddit").toggleClass("hide");a("#helpBlock-1").hasClass("hide")&&a("#add-button, .add-thread-button, [id^=helpBlock-], .fa-arrow-circle-right, .sub-group-controls, .column-settings").toggleClass("hide")})}function P(b,c,d,e,f,C){a(b+" .add-thread-button").unbind("click").click(function(){var g="<div class='"+d+" nopacity'>"+("<div class='form-group'><label class='control-label'>Subreddit</label><span style='float:right;'><i class='fa fa-close fa-lg "+
C+"'></i></span><select class='form-control "+e+"'></select></div>")+("<div class='form-group'><label class='control-label'>Threads</label><select class='form-control "+f+"'></select></div>")+"</div>",h=a("#template > option").clone();a(g).insertAfter(b+" ."+c);a(b+" ."+e+":first").append(h);a(b+" ."+e+":first").unbind("change").bind("change",function(){var b=a("."+d).index(a(this).parent().parent());O(this.value,"","",{target:[f,b],callback:R})});m("."+d,100);Q(C)})}function Q(b){a("."+b).unbind("click").bind("click",
function(){a(this).parent().parent().parent().remove()})}function ba(){a("#add-a-column").unbind("click").bind("click",function(){a(this).removeClass("hide").addClass("hide");a("#vendor-group").removeClass("hide");H()})}function R(b,c){var d=c[2]?a(a("."+c[0]+"[data-column="+c[2]+"]")[c[1]]):a(a("."+c[0])[c[1]]);d.children().remove();b.data.children.forEach(function(a,b){d.append("<option data-subid='"+a.data.subreddit_id+"' data-threadtitle='"+a.data.title+"' data-threadid='"+a.data.id+"' value='"+
a.data.permalink+"'>"+a.data.title+"</option>")});if(0<q.length&&"undefined"!==typeof c[2]){var e=q[c[2]].threads[c[1]];0==d.find("option[data-threadid="+e.threadid+"]").length&&e.subid==d.find("option:selected").data("subid")&&d.append("<option data-subid='"+e.subid+"' data-threadtitle='"+e.threadtitle+"' data-threadid='"+e.threadid+"' value='"+e.thread+"'>"+e.threadtitle+"</option>");d.find("option[data-threadid="+e.threadid+"]").prop("selected",!0)}}function Y(b){a(".frame-overlay[data-column="+
b+"]").addClass("half-fade");a(".loading[data-column="+b+"]").addClass("faded")}function S(b){a(".frame-overlay[data-column="+b+"]").removeClass("half-fade");a(".loading[data-column="+b+"]").removeClass("faded")}function m(b,c){setTimeout(function(){a(b).addClass("faded")},c)}function Z(){a(".reply-switch").unbind("click").bind("click",function(){var b=a(this).parent().parent().find(".reply-form");b.hasClass("hide")?(b.removeClass("hide"),b.find("form").removeClass("hide"),b.find(".submitting").removeClass("faded").addClass("hide"),
m(b,100)):b.removeClass("faded").addClass("hide")});a(".save-reply").unbind("click").click(function(){function b(c,d,e){c&&c.needsLogin?a("#login-reddit-modal").modal():c.statusCode?console.log(c.statusCode):c.json&&0<c.json.errors.length?console.log(c.json.errors):(c=c.json.data.things,a(N(c,!0)).insertAfter("#"+c[0].data.parent_id+" .comment-footer:first"),a("#"+c[0].data.parent_id+" .fa-reply:first").trigger("click"),w(),m(a("#"+c[0].data.name),100))}function c(a,b,d){console.log(b)}var d=this.form.thing_id.value,
e=this.form.text.value,f=a(this.form.previousSibling);0!=e.length&&(a(this.form).addClass("hide"),m(f.removeClass("hide"),100),ea("/save-reddit-reply",{thing_id:d,text:e},b,c))});a(".cancel-reply").unbind("click").click(function(){console.log("shut it down!")})}function w(){a(".md a").each(function(b,c){a(c).attr("target","_blank");"/u/"==a(c).attr("href").substring(0,3)||"/r/"==a(c).attr("href").substring(0,3)?a(c).attr("href","http://www.reddit.com"+a(c).attr("href")):""});Z();fa();ha()}function aa(c,
d){var e=a(".frame-content[data-column="+d+"]");if(e.children().length){e=app["firstComment"+d];if(e!=c[1].data.children[0].data.name){var f=takeWhile(c[1].data.children,e,function(a,b){return a.data.name!=b});a(N(f,!0,!0)).insertBefore(".frame-content[data-column="+d+"] #"+e);f.forEach(function(b){m(a("#"+b.data.name),500)});b(c[1].data.children[0].data.name,d)}V(c[1].data.children)}else e.append(N(c[1].data.children,!1,!0)),m(e,1E3);w()}function V(b){b.forEach(function(b){var c="more"!=b.kind&&
b.data.replies.hasOwnProperty("data")?b.data.replies.data.children:[],d=c.length,e="#"+b.data.name+" .comment-footer[data-id="+b.data.name+"]";"undefined"!==typeof b.data.created_utc?a(e+" .time-elapsed").text(W(b.data.created_utc)):"";"undefind"!==typeof b.data.score?a(".score[data-id="+b.data.name+"]").text(b.data.score):"";b=b.data.name;var f=a("#"+b+" .media[data-parentid="+b+"]"),g=a(e+" .reply"),h=a(e+" .reply .reply-num"),E=d-f.length,k="<a class='btn new-comment'><span class='text-primary diff'>"+
E+" new</span></a>",l="<span class='reply-num text-warning'>"+d+"</span><span class='text-warning'>&nbsp;<i class='fa expand fa-plus-square'></i>&nbsp;</span>";0<d&&0<g.length?(g.data("replylength",d),h.text(d),0<E&&0==a(e+" .new-comment").length?a(k).insertAfter(e+" .reply"):(!a("footer[data-id="+b+"] .reply").children().length&&0<f.length&&(a("footer[data-id="+b+"] .reply").append(l),a("footer[data-id="+b+"] .reply .expand").toggleClass("fa-plus-square fa-minus-square")),a(e+" .new-comment .diff").text(E+
" new")),X(e+" .new-comment")):0<d&&(a("<a data-name='"+b+"' data-replylength='"+d+"' class='btn reply'></a>").insertAfter(e+" .refresh-comment"),0<E&&(a(k).insertAfter(e+" .reply"),X(e+" .new-comment")),f.hasClass("faded")&&(a("footer[data-id="+b+"] .reply").append(l),a("footer[data-id="+b+"] .reply .expand").toggleClass("fa-plus-square fa-minus-square")));V(c)})}function X(b){a(b).unbind("click").bind("click",function(){a(this).parent().parent().find(".refresh-comment").trigger("click")})}function N(b,
c,d,e){b=b||[];var f="";b.forEach(function(b,g){var h="more"!=b.kind&&b.data.replies.hasOwnProperty("data")?b.data.replies.data.children:[],E=h.length,E="more"!=b.kind?"<footer data-id='"+b.data.name+"' class='comment-footer'><div class='links-container btn-group'><a class='btn time-elapsed white'>"+W(b.data.created_utc)+"</a><a class='btn reply-switch'><i class='fa fa-reply fa-lg'></i></a><a class='btn perma' href='"+("http://www.reddit.com/comments/"+b.data.link_id.substr(3)+"/_/"+b.data.id)+"' target='_blank'><i class='fa fa-link fa-lg'></i></a><a class='btn refresh-comment' data-linkid='"+
b.data.link_id+"' data-id='"+b.data.id+"'><i class='fa fa-refresh fa-lg'></i></a>"+(0!=E?"<a data-name='"+b.data.name+"' data-replylength='"+E+"' class='btn reply'><span class='reply-num text-warning'>"+E+"</span><span class='text-warning'>&nbsp;<i class='fa expand fa-plus-square'></i>&nbsp;</span></a>":"")+"</div>"+("<div class='nopacity hide reply-form'><div class='submitting nopacity hide'>Submitting...</div><form action='javascript:void(0)'>"+("<input type='hidden' name='thing_id' value='"+b.data.name+
"''>")+("<textarea name='text' class='form-control' placeholder='Reply to "+b.data.author+"..'></textarea>")+"<div class='reply-buttons'><button class='cancel-reply btn btn-default'>Cancel</button><button type='submit' class='save-reply btn btn-primary'>Save</button></div></form></div>")+"</footer>":"",h=a("<div/>").html(b.data.body_html).text()+E+N(h,!0,!1,!0);body="<div class='media-body'>"+("more"!=b.kind?"<div class='media-heading btn-group'><a class='btn vote'><i class='fa fa-arrow-up'></i></a><a data-id='"+
b.data.name+"' class='score btn'>"+b.data.score+"</a><a class='btn vote vote-last'><i class='fa fa-arrow-down'></i></a><a class='btn author' href='http://www.reddit.com/u/"+b.data.author+"' target='_blank'>"+b.data.author+"</a>"+(b.data.author_flair_css_class?"<a class='flair btn'>"+b.data.author_flair_css_class+"</a>":"&nbsp;")+"</div>"+h:"<div class='load-comments' data-parent='"+b.data.parent_id+"' class='load-comments'><i class='fa fa-download'></i>&nbsp; load more comments</div>"+h)+"</div>";
thumbnail="more"!=b.kind?"<div class='thumb pull-left "+(d?"icon-"+b.data.subreddit:"")+"'></div>":"";media="<div data-parentid='"+b.data.parent_id+"' data-linkid='"+b.data.link_id+"' data-icon='"+("icon-"+b.data.subreddit)+"' id='"+b.data.name+"' class='media"+(d?" parent ":e?" hide":"")+""+(c?" nopacity":"")+"'>"+thumbnail+body+"</div>";f+=media});return f}function ha(){a(".reply").unbind("click").click("click",function(){var b=a(this).data("name"),b=a("#"+b+" .media[data-parentid="+b+"]"),c=a(this).find(".expand");
c.hasClass("fa-plus-square")?(c.removeClass("fa-plus-square").addClass("fa-minus-square"),m(b.removeClass("hide"),100)):(c.removeClass("fa-minus-square").addClass("fa-plus-square"),b.removeClass("faded").addClass("hide"))})}function fa(){a(".refresh-comment, .load-comments").unbind("click").bind("click",function(){var b=a(this).data("linkid"),c=a(this).data("id")?a(this).data("id"):a("#"+a(this).data("parent")).attr("id").substr(3),d=a("#t1_"+c).hasClass("parent");ia(b?b:a("#"+a(this).data("parent")).data("linkid"),
c,function(b){b=N(b[1].data.children);a("#t1_"+c).replaceWith(b);d&&(a("#t1_"+c).addClass("parent"),a("#t1_"+c).children(":first").addClass(a("#t1_"+c).data("icon")));a("footer[data-id=t1_"+c+"] .reply .expand").toggleClass("fa-plus-square fa-minus-square");a("#t1_"+c+" .media[data-parentid="+a("#t1_"+c).attr("id")+"]").removeClass("hide").addClass("faded");a("#t1_"+c).addClass("nopacity");m(a("#t1_"+c),100);w()})})}function ia(a,b,c,d){U("http://www.reddit.com/comments/"+a.substr(3)+"/_/"+b+".json?sort=new",
c,d)}function W(a){if(a){var b=new Date(1E3*a),c=(new Date).getTime(),d=c-b.getTime(),e=Math.floor(d/864E5),d=d-864E5*e,f=Math.floor(d/36E5),d=d-36E5*f,g=Math.floor(d/6E4),d=Math.floor((d-6E4*g)/1E3);return 0!=!e||0>=e?0==e&&0==!f?f+"h":0==e&&0==f&&0==!g?g+"m":0==e&&0==f&&0==g&&0==!d?d+"s":1E3>c-1E3*a?"1s":b.toLocaleTimeString():e+"d"}}function da(a){var b=[];a.forEach(function(a,c){0<a.length&&(b=b.concat(a[1].data.children))});b=b.filter(function(a){if("more"!=a.kind)return a}).sort(ja);a[0][1].data.children=
b;return a[0]}function ja(a,b){return"more"!=a.kind&&"more"==b.kind?1:"more"==a.kind&&"more"!=b.kind?-1:a.data.created_utc<b.data.created_utc?1:a.data.created_utc>b.data.created_utc?-1:0}function U(b,c,d,e){a.ajax({url:b,type:"GET",timeout:7E3,cache:!1}).done(function(a,b,d){c&&c(a,b,d)}).fail(function(a,b,c){d&&d(a,b,c)}).always(function(){e&&e()})}function ea(b,c,d,e,f){a.ajax({url:b,type:"POST",timeout:7E3,data:c,cache:!1}).done(function(a,b,c){d&&d(a,b,c)}).fail(function(a,b,c){e&&e(a,b,c)}).always(function(){f&&
f()})}function O(b,c,d,e){a.ajax({url:"http://www.reddit.com"+b+"/.json?sort="+c+"&limit="+d+"&jsonp=?",dataType:"json",timeout:7E3,cache:!1}).done(function(a,b,c){e.callback(a,e.target)}).fail(function(a,c,d){"timeout"==d?console.log(c):console.log(d+": error retrieving - "+b);S(e.target)}).always(function(){e.always&&e.always(e.target)})}var q=localStorage.getItem("config")?z("config"):[],T=localStorage.getItem("watch")?z("watch"):{};return{init:function(){B();y();G()}}}(jQuery);$(document).ready(function(){app.init()})}
Array.prototype.remove=function(a,z){var n=this.slice((z||a)+1||this.length);this.length=0>a?this.length+a:a;return this.push.apply(this,n)};function takeWhile(a,z,n){for(var B=[],e=0,y=a.length;e<y;e++)if(n(a[e],z))B.push(a[e]);else break;return B}function any(a,z){var n=!1;$(a).each(function(a,e){z(e)&&(n=!0)});return n};(function(a,z,n,B,e,y,G){a.GoogleAnalyticsObject=e;a[e]=a[e]||function(){(a[e].q=a[e].q||[]).push(arguments)};a[e].l=1*new Date;y=z.createElement(n);G=z.getElementsByTagName(n)[0];y.async=1;y.src=B;G.parentNode.insertBefore(y,G)})(window,document,"script","//www.google-analytics.com/analytics.js","ga");ga("create","UA-57745225-1","auto");ga("send","pageview");
