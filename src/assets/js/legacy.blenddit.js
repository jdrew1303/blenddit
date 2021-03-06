// app_loader - Fetch vendor scripts asynchronously from CDN, use local if not available.
// Wrapped in self invoking function in effort to help garbage collector.
(function app_loader() {
    var
    require = function(files, callback, errorFn, type) {
        for (var i = 0; i < files.length; i++) {
            type == 'script'
                ? writeScript(files[i], callback, errorFn) 
                : writeLink(files[i], callback, errorFn);
        }
    },
    removeBroken = function(type, paramSrc) {
        var files = document.getElementsByTagName(type=='script'?'script':'link');
        for (var i = 0, len = files.length; i < len; i++) {
            if (paramSrc == (type == 'script' ? files[i].src : files[i].href)) {
                files[i].parentNode.removeChild(files[i]); break;
            }
        }
    },
    successEvent = function(elem, successFn) {
        elem.addEventListener('load', function successEvent(e) {
            if (successFn) successFn(e);
            elem.removeEventListener('load', successEvent, 'false');
        }, false);
    },
    failEvent  = function(elem, failFn) {
        elem.addEventListener('error', function failEvent(e) {
            if (failFn) failFn(e);
            elem.removeEventListener('error', failEvent, 'false');
        }, false);
    },
    writeLink = function(href, success, fail) {
        var l = document.createElement('link'),
            head = document.getElementsByTagName('head')[0];
        l.type = 'text/css';
        l.rel = 'stylesheet';
        successEvent(l, success);
        failEvent(l, fail);
        l.href = href;
        head.appendChild(l);
    },
    writeScript = function(src, success, fail) {
        var s = document.createElement('script'),
            head = document.getElementsByTagName('head')[0];
        s.type = "text/javascript";
        s.async = true;
        successEvent(s, success);
        failEvent(s, fail);
        s.src = src;
        head.appendChild(s);
    },
    getMetaValue = function(name) {
        var nodeList = document.getElementsByTagName('meta');
        for (var i = 0, len = nodeList.length; i < len; i++) {
            if (nodeList[i].getAttribute('name') == name)
                return nodeList[i].getAttribute('content');
        } return "";
    },
    scriptSuccessEvent = function() {
        if (jQuery && firstTime) {
            firstTime = false;
            require([
                scripts.bootstrapCDN,
                scripts.pjaxCDN,
                scripts.typeaheadCDN
            ], scriptSuccessEvent, scriptErrorEvent, 'script');
        }
        var ready = typeof jQuery !== 'undefined' && // jQuery
                    typeof jQuery.pjax !== 'undefined' && // pjax
                    typeof jQuery.fn.emulateTransitionEnd !== 'undefined' && // Bootstrap
                    typeof Bloodhound !== 'undefined'; // typeahead
        if (ready) {
            (function app_extensions() {
                $.fn.launchPopOver = function(closeTime, options) {
                    var that = this, popoverState = $(this).data('bs.popover');
                    if (typeof popoverState === 'undefined' || !popoverState.enabled) {
                        $(this).popover(options);
                    } else {
                        popoverState.options.placement = options.placement;
                        popoverState.options.title = options.title;
                        popoverState.options.content = options.content;
                    }
                    popoverState = $(this).data('bs.popover');
                    if (typeof popoverState.timeoutId !== 'undefined') {
                        clearTimeout(popoverState.timeoutId);
                    }
                    $(this).popover('show');
                    popoverState.timeoutId = setTimeout(function(){
                        $(that).popover('hide');
                    }, closeTime);
                };
                $.fn.hasWidthOverflowed = function(){
                    return this.length > 0 
                        ? this[0].scrollWidth > this[0].clientWidth && this[0].clientWidth > 640
                        : false;
                };
                document.getElementsByDataAttribute = function(className, dataAttr, dataValue) {
                    var nodeList = document.querySelectorAll(className), nodeArray = [];
                    nodeList.forEach(function(node) {
                        if (node.getAttribute(dataAttr)==dataValue) nodeArray.push(node);
                    });
                    return nodeArray;
                };
                NodeList.prototype.forEach = HTMLCollection.prototype.forEach = function(callback) {
                    for (var i = 0, len = this.length; i < len; i++) {
                        if (callback) callback(this[i], i);
                    }
                };
            })();
            init();
        }
    },
    scriptErrorEvent = function(evt) { // CDN broke, use local
        try {
            var brokenScript = evt.srcElement.src, localScript;
            console.warn('Error loading CDN resource: '+brokenScript+'. Loading local resource.');
            removeBroken('script', brokenScript);
            switch (brokenScript) {
                case scripts.jqueryCDN:
                    localScript = scripts.jqueryLocal; break;
                case scripts.bootstrapCDN:
                    localScript = scripts.bootstrapLocal; break;
                case scripts.pjaxCDN:
                    localScript = scripts.pjaxLocal; break;
                case scripts.typeaheadCDN:
                    localScript = scripts.typeaheadLocal; break;
            }
            require([localScript], scriptSuccessEvent, scriptErrorEvent, 'script');
        } catch(err) { throw err; }
    },
    cssErrorEvent = function(evt) {
        console.error('Error loading resource: '+evt.srcElement.href);
        removeBroken('link', evt.srcElement.href);
    },
    firstTime = true,
    isDebug = getMetaValue('debug')=='true' ? true : false,
    assets = isDebug ? '/src/assets/' : '/dist/assets/',
    scripts = {
        'jqueryCDN' : window.location.protocol+'//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js',
        'bootstrapCDN' : window.location.protocol+'//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js',
        'pjaxCDN' : window.location.protocol+'//cdnjs.cloudflare.com/ajax/libs/jquery.pjax/1.9.6/jquery.pjax.min.js',
        'typeaheadCDN' : window.location.protocol+'//cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/typeahead.bundle.min.js',
        'jqueryLocal' : assets+'js/jquery-2.1.3.min.js',
        'bootstrapLocal' : assets+'js/bootstrap.min.js',
        'pjaxLocal' : assets+'js/jquery.pjax.min.js',
        'typeaheadLocal' : assets+'js/typeahead.bundle.min.js'
    },
    styles = {
        'app' : assets+'css/'+(isDebug ? 'legacy.blenddit.css' : 'legacy.blenddit.min.css')+'?v='+getMetaValue('version'),
        'fontawesomeCDN' : window.location.protocol+'//netdna.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.css',
        'googleFont' : window.location.protocol+'//fonts.googleapis.com/css?family=Roboto:400,700'
    };
    require([scripts.jqueryCDN], scriptSuccessEvent, scriptErrorEvent, 'script');
    require([styles.googleFont, styles.fontawesomeCDN, styles.app], undefined, cssErrorEvent, 'link');
})();

// Fn (Function) utility object
var Fn = function() {};
Fn.prototype = {
    remove : function(arr, from, to) {
        var rest = arr.slice((to || from) + 1 || arr.length);
        arr.length = from < 0 ? arr.length + from : from;
        return arr.push.apply(arr, rest);
    },
    takeWhile : function(arr, param, f) {
        var returnArr = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            if (f(arr[i], param)) {
                returnArr.push(arr[i]);
            } else { break; }
        }
        return returnArr;
    },
    any : function(cls, f) {
        var bool = false;
        $(cls).each(function(i,elem) {
            if (f(elem)) { bool = true; return;}
        }); return bool;
    },
    deleteCookie : function(cname) {
        this.setCookie(cname, undefined, true);
    },
    setCookie : function(cname, cvalue, deleteFlag) {
        if (deleteFlag) {
            document.cookie = cname + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            return;
        }
        var d = new Date();
        d.setTime(d.getTime() + (3650*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + encodeURIComponent(cvalue) + "; "+expires;
    },
    getCookie : function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) === 0)
                return decodeURIComponent(c.substring(name.length,c.length));
        }
        return "";
    },
    cookieExists : function(cname) {
        return this.getCookie(cname) ? true : false;
    },
    getFromStorage : function(item) {
        if (item == 'config') {
            return localStorage
                ? localStorage.getItem(item)
                    ? JSON.parse(localStorage.getItem(item)) : []
                : this.cookieExists(item)
                    ? JSON.parse(this.getCookie(item)) : []
        } else {
            return localStorage
                ? localStorage.getItem(item)
                    ? JSON.parse(localStorage.getItem(item)) : {}
                : this.cookieExists(item)
                    ? JSON.parse(this.getCookie(item)) : {}
        }
    },
    setInStorage : function(name, item) {
        var item = typeof item === "string" ? item : JSON.stringify(item);
        if (localStorage) {
            localStorage.setItem(name, item);
            this.cookieExists(name) ? this.deleteCookie(name) : void 0;
        } else {
            this.setCookie(name, item);
        }
    },
    brokenImage : function(img) {
        $(img).parents('.media a').empty().append(tmpl('tmpl_ap',{}));
    },
    getBlurred : function() {
        document.activeElement.blur();
        $('input').blur();
    },
    setUserSession : function(name, data) {
        var isEmptyObject = Object.keys(JSON.parse(decodeURIComponent(atob(data)))).length === 0;
        if (!isEmptyObject) this.setInStorage(name, data);
    },
    getUserSession : function(name) {
        return localStorage.getItem(name)
            ? JSON.parse(decodeURIComponent(atob(localStorage.getItem(name)))) : undefined
    },
    getRedditAuthHeader : function() {
        var headerObj = undefined,
            ruser = this.getUserSession('ruser'),
            ratelimit = ruser.x_ratelimit_remaining 
                ? parseInt(ruser.x_ratelimit_remaining) > 0 || parseInt(ruser.x_ratelimit_reset) <= 0
                    ? true : false
                : true
        if (ruser && ratelimit) { headerObj = {'Authorization':'bearer '+ruser.at} }
        if (ruser && !ratelimit) { alert('Please wait '+ruser.x_ratelimit_reset+' seconds.'); }
        return headerObj;
    },
    setRedditResponseHeader : function(data, textStatus, jqXHR) {
        if (jqXHR.status==200 && typeof jqXHR.getResponseHeader === 'function') {
            new Fn().setUserSessionAttributes('ruser',{
                x_ratelimit_remaining : jqXHR.getResponseHeader('x-ratelimit-remaining'),
                x_ratelimit_reset : jqXHR.getResponseHeader('x-ratelimit-reset')
            });
        }
    },
    setUserSessionAttributes : function(type, attrObj) {
        var session = this.getUserSession(type);
        Object.keys(attrObj).forEach(function(attr) {
            session[attr] = attrObj[attr];
        });
        this.setUserSession(type, btoa(encodeURIComponent(JSON.stringify(session))));
    }
};

// tmpl loads templates from the templates.handlebars script tags and pushes
// data into them using the <%=%> syntax
function tmpl(str, data){
    var fn = !/\W/.test(str) ?
    tmpl(document.getElementById(str).innerHTML) :
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +
        "with(obj){p.push('" +
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',$1,'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'")
      + "');}return p.join('');");
    return data ? fn(data) : fn;
}
function getPressEvent() { // window.pressType comes from user-agent request to server
    return window.pressType;
}
function init() {
    pjx();
    blenddit();
}
function pjx() {
    $(document).pjax('a[data-pjax]', '#pjax-container');
    $(document).on('pjax:send', function() {});
    $(document).on('pjax:end', function() {
        if ($('#listsjs').length>0) { listsjs();
        } else if ($('#blenddit').length>0) { blenddit();
        } else {
            $('.teams').hide();
            $('.navbar-fixed-top').show();
            $('.navbar-brand > .text-warning').text('kurtlocker.org');
            $('.social').show();
            $('html, body').removeClass('noverflow');
        }
    });
}
function blenddit() {
    if ($('#blenddit').length>0) {
        $('.teams').show(); $('.social').hide();
        $('.navbar-fixed-bottom').removeClass('hide');
        !$('.navbar-fixed-top').hasClass('hide') ? $('.navbar-fixed-top').addClass('hide'):void 0;
        $('[data-toggle="tooltip"]').tooltip();
        $('#reddit-results-collapse, #reddit-greeting-collapse, #reddit-modal-collapse').collapse({'toggle': false});
        window.autoRefreshState = true;
        bindAutoRefreshActive();
        visibilityChange();
        redditNames = redditNamesFn();
        redditNames.initialize();
        startBlending();
        contentResizeEvent();
        redditSearch('#reddit-greeting-collapse', true);
        redditSearch('#reddit-results-collapse');
        redditSearch('#search-control-panel', false);
    }
}
function startBlending() {
    var fn = new Fn();
    fn.setUserSession('ruser', redditUser);
    fn.setUserSession('tuser', twitterUser);
    if (subredditURI && threadIdURI) { // user arrived from /r/subreddit/comments/linkid*
        getThreadById(threadIdURI, function(data) {
            if (typeof data.data.children !== 'undefined') {
                addToConfigObj(buildRedditConfigObjByThreads(data.data.children));
            }
        }, undefined, configObjAction);
    } else if (subredditURI) { // user arrived from /r/subreddit
        threadsOfSubreddit(subredditURI);
    } else if (threadIdsURI) { // user arrived from /comments/threadids
        var threadIds = threadIdsURI.toString().split('-'),
            children = [];
        threadIds.forEach(function(threadId, i) {
            getThreadById(threadId,
                function(data) {
                    children = children.concat(data.data.children);
                    threadIds.length == children.length
                        ? children.length!==0
                            ? addToConfigObj(buildRedditConfigObjByThreads(children))
                            : void 0
                        : void 0;
                },
                function(a,b,c,threadId){
                    new Fn().remove(threadIds, threadIds.indexOf(threadId));
                    threadIds.length == children.length
                        ? children.length!==0
                            ? addToConfigObj(buildRedditConfigObjByThreads(children))
                            : void 0
                        : void 0;
                },
                function(){
                    if (threadIds.length == children.length) configObjAction();
                }, false, undefined, threadId);
        });
    } else {
        configObjAction();
    }
}
function checkAccessToken(type){ // returns a deferred ajax call to be used with $.when
    var fn = new Fn(),
        session = fn.getUserSession(type),
        expired = session ? new Date() > new Date(session.ex) : undefined,
        hasRefresh = session && session.hasRefresh===false ? session.hasRefresh : true,
        deferred = $.Deferred();
    if (type=='ruser' && session && expired && hasRefresh) {
        return $.ajax('/refresh-access-token').then(function(data, textStatus, jqXHR) {
            if (jqXHR.status==200 && data.access_token) {
                fn.setUserSessionAttributes('ruser', 
                    {   
                        'at': data.access_token, 
                        'ex': (function() { 
                            var now = new Date(), oneHourFromNow = new Date(now);
                            oneHourFromNow.setMinutes(now.getMinutes()+55);
                            return oneHourFromNow;
                        })()
                    });
                deferred.resolve(jqXHR, data, '').promise();
            } else {
                deferred.reject(jqXHR, data, data.statusCode).promise();
                fn.setUserSessionAttributes('ruser', {hasRefresh: data.hasRefresh})
            }
            return deferred;
        })
    } else if (session && !expired) {
        return deferred.resolve({}, {}, 'pass').promise();
    } else {
        return deferred.reject({}, {}, 'fail').promise();
    }
}

function redditNamesFn() {
    return new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            rateLimitWait : 0,
            url : 'https://oauth.reddit.com/api/search_reddit_names',
            transport : function(url, success, error) {
                $.when(checkAccessToken('ruser')).then(
                    function() { // pass: get stuff
                        var fn = new Fn(),
                            headers = fn.getRedditAuthHeader();
                        if (!headers) return;
                        url.headers = headers;
                        $.ajax(url).done(success).fail(error).always(fn.setRedditResponseHeader)
                    },
                    function(jqXHR, data, msg) {} // fail: do nothing
                );
            },
            prepare : function(query, settings) {
                settings.type = 'POST';
                settings.hasContent = true;
                settings.data = $.param({query: query});
                return settings;
            },
            filter: function(data) {
                var keyValues = [];
                if (data.names) {
                    data.names.forEach(function(name) {
                        var keyValueObj = {};
                        keyValueObj.value = name;
                        keyValues.push(keyValueObj);
                    });
                }
                return keyValues;
            }
        }
    });
}
function visibilityChange(){
    var hidden = "hidden";
    if (hidden in document) {
        document.addEventListener("visibilitychange", onchange);
    } else if ((hidden = "mozHidden") in document) {
        document.addEventListener("mozvisibilitychange", onchange);
    } else if ((hidden = "webkitHidden") in document) {
        document.addEventListener("webkitvisibilitychange", onchange);
    } else if ((hidden = "msHidden") in document) {
        document.addEventListener("msvisibilitychange", onchange);
    } else if ("onfocusin" in document) {
        document.onfocusin = document.onfocusout = onchange;
    } else {
        window.onpageshow = window.onpagehide
        = window.onfocus = window.onblur = onchange;
    }
    function onchange(evt) {
        var v = "visible", h = "hidden",
        evtMap = {focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h};
        evt = evt || window.event;
        evt.type in evtMap
            ? evtMap[evt.type] == "hidden" ? autoRefreshStateSwitch(false) : autoRefreshStateSwitch(true)
            : this[hidden] ? autoRefreshStateSwitch(false) : autoRefreshStateSwitch(true);
      }
      function autoRefreshStateSwitch(bool) {
          window.autoRefreshState = bool;
          autoRefresh(bool);
          contentResizeEvent();
      }
    if(document[hidden] !== undefined)
        onchange({type: document[hidden] ? "blur" : "focus"});
}
function autoRefresh(bool, exceptNum) {
    if (!bool) {
        new Fn().getFromStorage('config').forEach(function(obj, i) {
            var frameContentExists = $('.frame-content[data-column='+i+']').length > 0;
            typeof exceptNum !== 'undefined' && i == exceptNum && frameContentExists
                ? typeof window['r'+i] === 'undefined' ? toggleRefresh(i, true) : void 0 // exceptNum case - allow this column to continue refreshing (if toggled on)
                : frameContentExists ? toggleRefresh(i, false) : void 0; // turn off this column's autorefresh and clear interval 
        });
    } else {
        new Fn().getFromStorage('config').forEach(function(obj, i) {
            var frameContentExists = $('.frame-content[data-column='+i+']').length > 0;
            if (frameContentExists && typeof window['r'+i] === 'undefined') toggleRefresh(i, true);
        }); // turn on all column auto refresh (if toggled on)
    }
}
function redditSearch(parent, trigger) {
    if (!$(parent+' .reddit-search-input').hasClass('tt-input')) typeAheadReddit(parent+' .reddit-search-input');
    if (trigger) bindRedditSearch.call($(parent+' .reddit-search-submit'));
}
function submissionsSearchAPI(obj) {
    obj.url = window.location.protocol+'//www.reddit.com/search.json?q='+encodeURIComponent(obj.query)+'&restrict_sr=off&sort='+obj.sorted_by+'&t='+obj.links_from;
    genericGet(obj.url, function(data, textStatus, jqXHR, obj) {
        if (data.data.children.length > 0) {
            threadResults(data, obj, false, 'submissions');
            bindLoadMore(data.data.after, 'submissions', obj, true);
            copyToAllRedditSearches(obj.query, obj);
        } else {
            if (typeof obj.errorLoc === "object" && obj.errorLoc !== null) {
                showFeature("#greeting");
                copyToAllRedditSearches(obj.query, obj);
                $('#watch-threads .list-group.contain').children().length === 0 ? watchList() : void 0;
                $('#headingOne').launchPopOver(3000,
                    popOverOptions('bottom','','There were no results found for "'+obj.query+'"'));
            } else {
                $(obj.errorLoc).launchPopOver(3000,
                    popOverOptions('bottom','','There were no results found for "'+obj.query+'"'));
            }
        }
        if (obj.callback) obj.callback();
    }, undefined, undefined, false, obj.errorLoc, obj);
}
function subredditsSearchAPI(obj) {
    obj.url = window.location.protocol+'//www.reddit.com/subreddits/search.json?q='+encodeURIComponent(obj.query);
    genericGet(obj.url, function(data, textStatus, jqXHR, obj) {
        if (data.data.children.length > 0) {
            subredditsMatching(data, obj.query, false);
            bindLoadMore(data.data.after, 'subreddit', obj, true);
            copyToAllRedditSearches(obj.query, obj);
        } else {
            if (typeof obj.errorLoc === "object" && obj.errorLoc !== null) {
                showFeature("#greeting");
                copyToAllRedditSearches(obj.query, obj);
                $('#watch-threads .list-group.contain').children().length === 0 ? watchList() : void 0;
                $('#headingOne').launchPopOver(3000,
                    popOverOptions('bottom','','There were no results found for "'+obj.query+'"'));
            } else {
                $(obj.errorLoc).launchPopOver(3000,
                    popOverOptions('bottom','','There were no results found for "'+obj.query+'"'));
            }
        }
    }, undefined, undefined, false, obj.errorLoc, obj);
}
function threadsOfSubreddit(query, callback) {
    var url = window.location.protocol+'//www.reddit.com/r/'+query+'.json';
    genericGet(url, function(data, textStatus, jqXHR, obj) {
        threadResults(data, obj, false);
        bindLoadMore(data.data.after, 'thread', obj, true);
        copyToAllRedditSearches(query, obj);
        if (obj.callback) obj.callback();
    }, noResults, undefined, false, undefined, {query: query, errorLoc: this, callback: callback, url: url});
}
function copyToAllRedditSearches(query, obj) {
    $('#reddit-search-results .reddit-search-input.tt-input, form.reddit-search .reddit-search-input.tt-input, #control-panel-panels .reddit-search-input.tt-input')
        .val(query);
    if (obj && obj.errorLoc !== window && obj.errorLoc !== null) {
        var $form = obj.errorLoc.parents('form'),
            radioType = $form.find('input[type=radio]:checked').val(),
            sortedBy = $form.find('select.sorted-by').val(),
            linksFrom = $form.find('select.links-from').val();
        $('form.reddit-search').each(function(i, form) {
            bindRedditSearchRadio.call($(form).find('input[type=radio][value='+radioType+']').prop('checked',true));
            $(form).find('select.sorted-by option[value='+sortedBy+']').prop('selected',true);
            $(form).find('select.links-from option[value='+linksFrom+']').prop('selected',true);
        });
    }
    $('#reddit-results-collapse').collapse('hide');
}
function noResults(jqXHR, textStatus, errorThrown, obj) {
    if (jqXHR.status==403) {
        $('#search-results-container .reddit-search-input.tt-input').val(obj.query);
        window.scrollTo(0, 0);
        $('#reddit-search-results').launchPopOver(5000,
            popOverOptions('bottom','','This subreddit is private and you do not have access to view it.')); return;
    }
    subredditsSearchAPI(obj);
}
function subredditsMatching(data, query, loadMore) {
    showFeature('#search-results-container');
    window.scrollTo(0, 0);
    $('#subreddit-result-title').text('Subreddits matching "'+query+'"..');
    buildRedditMedia(data, 't5', loadMore);
}
function threadResults(data, obj, loadMore, type) {
    showFeature('#search-results-container');
    window.scrollTo(0, 0);
    type == 'submissions'
        ? $('#subreddit-result-title').text('Submissions matching "'+obj.query+'"..') 
        : $('#subreddit-result-title').text('/r/'+obj.query);
    
    buildRedditMedia(data, 't3', loadMore);
}
function typeAheadReddit(inputSelector, completeFn) {
    $(inputSelector).typeahead(null, {
      name: 'reddit-names',
      displayKey: 'value',
      source: redditNames.ttAdapter(),
      limit:20
    }).on('typeahead:selected typeahead:autocompleted', function(){
        if (completeFn) completeFn(this);
    });
}
function configObjAction() {
    if (new Fn().getFromStorage('config').length > 0) {
        $('.carousel-inner').children().remove();
        buildConfigToUI();
    } else {
        showFeature('#greeting');
        watchList();
    }
}
function popOverOptions(paramPlacement, paramTitle, paramContent) {
    return {placement:paramPlacement, title:paramTitle,content:paramContent, trigger:'manual'};
}
function watchList() {
    var localWatch, watch = new Fn().getFromStorage('watch');
    Object.keys(watch).length
        ? localWatch = watch
        : localWatch = {
            subs:['nfl','nba', 'mlb', 'nhl', 'mls', 'hockey', 'soccer','collegebasketball'], 
            match:['Game Thread','Match Thread','Live Thread']};
    buildWatchList(localWatch);
    fetchWatchThreads(localWatch.match);
}
function fetchWatchThreads(matchingArray) {
    $('#watch-threads .list-group.contain').children().remove();
    $('#watch-list-no-results').removeClass('hide');
    $('#watch-subreddits input').each(function(i, sub){
        getPosts('/r/'+sub.value, '', '', {target:matchingArray, callback: function(data){
            data.data.children.forEach(function(thread) {
                if (matchingArray.some(function(str){
                    var pattern = new RegExp(str.toLowerCase());
                    return pattern.test(thread.data.title.toLowerCase());
                })) {
                    $('#watch-list-no-results').addClass('hide');
                    $('#watch-threads .list-group.contain').append(buildWatchInputOrThreadHtmlString(thread.data));
                }
                fadeIn($('#watch-threads .list-group-item'),100);
            });
        }});
    });
}
function saveWatchList() {
    var watchList = {};
    watchList.subs = function(){
        var subsArray = [];
        $('#watch-subreddits .list-group.contain input').each(function(i, input) {
            input.value !== "" && input.value !== null ? subsArray.push(input.value) : '';
        }); return subsArray;
    }();
    watchList.match = function(){
        var matchArray = [];
        $('#watch-matching .list-group.contain input').each(function(i, input) {
            input.value !== "" && input.value !== null ? matchArray.push(input.value) : '';
        }); return matchArray;
    }();
    new Fn().setInStorage('watch', watchList);
}
function contentResizeEvent() {
    window.height = window.innerHeight;
    window.width = window.innerWidth;
    carousel_inner_height();
    frame_content_height();
    autoRefreshOnlyActiveColumn();
    $(window).unbind('resize').on('resize', function(){
        if (window.height != window.innerHeight) {
            carousel_inner_height();
            frame_content_height();
            window.height = window.innerHeight;
        }
        if (window.width != window.innerWidth) {
            carousel_inner_height();
            frame_content_height();
            autoRefreshOnlyActiveColumn();
            window.width = window.innerWidth;
        }
    });
    function carousel_inner_height() {
        $('#greeting').hasClass('hide')
            ? $('.carousel-inner').css('height', window.innerHeight-53)
            : $('.carousel-inner').removeAttr('style');
    }
}
function autoRefreshOnlyActiveColumn() {
    var $activeItem = $('.item.active'),
        exceptNum = $activeItem.data('column');
    if (!$('#content-container').hasClass('hide')) { // we're viewing the columns 
        if (window.innerWidth <= 640) { // We're now in single column view.
            if (typeof exceptNum != "undefined") autoRefresh(false, exceptNum);
        } else { autoRefresh(true); } // We're now in multi-column view    
    } else { autoRefresh(false); }
}
function column_options_height(columnNum, optInt) {
    var $column_options = $('.column-options[data-column='+columnNum+']');
    $column_options.removeAttr('style').css('max-height', $column_options.height());
    frame_content_height(columnNum, optInt);
}
function frame_content_height(columnNum, optInt) {
    var $frame_content = typeof columnNum !== 'undefined' ? $('.frame-content[data-column='+columnNum+']') : $('.frame-content'),
        overFlowed = $('.carousel-inner').hasWidthOverflowed() ? 10 : 0;
    if (typeof columnNum === 'undefined') {
        $frame_content.each(function(i, frameContent) {
            var columnOptionsHeight = $('.column-options[data-column='+i+']').hasClass('hide') ? 0 : $('.column-options[data-column='+i+']').height(),
                localOffset = typeof optInt !== 'undefined' ? optInt : columnOptionsHeight;
            $(frameContent).removeAttr('style').css('height', window.innerHeight-(107+localOffset+overFlowed));
        });
    } else {
        var columnOptionsHeight = $('.column-options[data-column='+columnNum+']').hasClass('hide') ? 0 : $('.column-options[data-column='+columnNum+']').height(),
            localOffset = typeof optInt !== 'undefined' ? optInt : columnOptionsHeight;
        $frame_content.removeAttr('style').css('height', window.innerHeight-(107+localOffset+overFlowed));
    }
}
function launchControls() {
    $('#controls').modal('toggle');
    updateControlsView();
}
function updateControlsView() {
    var fn = new Fn(),
        configArr = fn.getFromStorage('config'),
        ruser = fn.getUserSession('ruser'),
        tuser = fn.getUserSession('tuser'),
        redditAcc = ruser && ruser.ru ? 1 : 0,
        twitterAcc = tuser && tuser.tu ? 1 : 0;
    redditAcc
        ? $('.reddit-account').replaceWith(tmpl('tmpl_ar', {title: ruser.ru, type: "\'ruser\'"}))
        : $('.reddit-account').replaceWith(tmpl('tmpl_as', {type:"\'reddit\'"}))
    twitterAcc
        ? $('.twitter-account').replaceWith(tmpl('tmpl_at', {avatar: tuser.ua, user: tuser.tu, type: "\'tuser\'"}))
        : $('.twitter-account').replaceWith(tmpl('tmpl_au', {type: "\'twitter\'"}))
    $('.panel-red .huge').text(getColumnCount(configArr, 'reddit'));
    $('.panel-primary .huge').text(getColumnCount(configArr, 'twitter'));
    $('.panel-yellow .huge').text(redditAcc+twitterAcc);
}
function getColumnCount(configArr, type) {
    var count = 0;
    configArr.forEach(function(obj) {
        if (obj.type == type) count++;
    });
    return count;
}
function addColumnToConfig() {
    var newColumnAdded = false;
    if (new Fn().any('.thread-controls', function(x){ return !($(x).val()===null)})) { // Validate - Does the user have at least one thread?
        $('.sub-group-controls').length == 1 // If its only one thread, make name
            ? $('#column-name').val($('.sub-group-controls .thread-controls option:selected').text().trim().substr(0,22)+' ...') 
            : $('#column-name').val('My Column');
        newColumnAdded = updateConfigObjFromDOM('.sub-group-controls', '.subreddit-controls', 
            '.thread-controls', '#reddit-column .column-settings');
        if (newColumnAdded) $('#reddit-column').collapse('hide');
    } return newColumnAdded;
}
function showColumnOption(option, columnNum) {
    hideAllColumnOptions(columnNum);
    $(option).removeClass('hide');
    $(option[0].previousElementSibling).removeClass('hide');
}
function showAllColumnOptions(columnNum) {
    $(['.settings-switch[data-column='+columnNum+']', '.manage-threads[data-column='+columnNum+']',
        '.write-comment-switch[data-column='+columnNum+']','.refreshSwitch[data-column='+columnNum+']',
        '.trash[data-column='+columnNum+']'].join(',')).removeClass('hide');
    $(['.write-comment[data-column='+columnNum+']','.edit-form[data-column='+columnNum+']',
        '.settings-tab[data-column='+columnNum+']'].join(',')).addClass('hide');
}
function hideAllColumnOptions(columnNum) {
    $(['.write-comment[data-column='+columnNum+']','.settings-switch[data-column='+columnNum+']',
        '.edit-form[data-column='+columnNum+']','.manage-threads[data-column='+columnNum+']',
        '.settings-tab[data-column='+columnNum+']','.write-comment-switch[data-column='+columnNum+']',
        '.refreshSwitch[data-column='+columnNum+']','.trash[data-column='+columnNum+']'].join(','))
    .addClass('hide');
}
function showFeature(feature) {
    hideAllFeatures();
    fadeIn($(feature).removeClass('hide'),100);
    if (feature == '#greeting') $('.home-button').addClass('active-feature');
    if (feature == '#content-container') {
        var configArr = new Fn().getFromStorage('config');
        $('html, body').addClass('noverflow');
        autoRefreshOnlyActiveColumn();
        $('.columns-button').addClass('active-feature');
        configArr.length > 1 
            ? $('.carousel-control').removeClass('hide')
            : $('.carousel-control').addClass('hide')
    } else { $('html, body').removeClass('noverflow'); }
}
function hideAllFeatures() {
    autoRefresh(false);
    $('#main-loader-container, #content-container, #greeting, #search-results-container')
        .removeClass('faded').addClass('hide');
    $('.home-button, .columns-button, .open-controls').removeClass('active-feature');
    $('.carousel-control').addClass('hide');
}
function setPostThreads(context, fromContext) {
    var $postThread = $(context+' .post-thread'),
        $threadsToGetOptionsFrom = $(fromContext+' .thread-edit');
    $postThread.children().remove();
    $threadsToGetOptionsFrom.each(function(i, select) {
        if ($(select).val()) $postThread.append($(select).find('option:selected').clone());
    });
}
function setSettingsFromConfig(columnNum, configObj) {
    $('#column-name-column-'+columnNum).val(configObj.settings.name);
    $('#refresh-column-'+columnNum).val(configObj.settings.refreshRate);
    $('#limit-column-'+columnNum).val(configObj.settings.limitPosts);
    $('#sortBy-column-'+columnNum).val(configObj.settings.sortBy);
}
function deleteRefresh(columnNum) {
    clearInterval(window['r'+columnNum]);
    delete window['r'+columnNum];
}
function toggleRefresh(columnNum, override) {
    var condition = typeof override !== 'undefined' 
        ? $(".refreshSwitch[data-column="+columnNum+"] i").hasClass('fa-toggle-on') && override
        : $(".refreshSwitch[data-column="+columnNum+"] i").hasClass('fa-toggle-on'),
        config = new Fn().getFromStorage('config');
    deleteRefresh(columnNum);
    if (condition && window.autoRefreshState) {
        window['r'+columnNum] = setInterval(function() {
            config[columnNum] ? getCommentsForColumn(config[columnNum], columnNum) : clearInterval(window['r'+columnNum]);
        }, parseInt(config[columnNum].settings.refreshRate)*1000);
    } else {
        clearInterval(window['r'+columnNum]);
    }
}
function makeItemActive(columnNum) {
    $('.item').removeClass('active');
    $(".item[data-column="+columnNum+"]").addClass('active');
}
function cacheColumn(config, columnNum, data) {
    config[columnNum].cachedComments = data;
    new Fn().setInStorage('config', config);
}
function getCommentsForColumn(configObj, columnNum, fromCache) {
    showLoader(columnNum);
    if (fromCache && configObj.cachedComments)  { // don't call reddit
        configObj.cachedComments.forEach(function(arr) { arr[2] = columnNum; });
        var cachedComments = getMergedData(configObj.cachedComments);
        if (cachedComments && $(".frame-content[data-column="+columnNum+"]").children().length===0 && cachedComments[1].data.children.length>0) {
            markFirstComment(cachedComments[1].data.children[0].data.name, columnNum);
        }
        if (cachedComments) displayComments(cachedComments, columnNum);
        hideLoader(columnNum); 
        return;
    } else { // call reddit
        var dataArray = [];
        for (var i = 0, len = configObj.threads.length; i < len; i++) {
            var path = configObj.threads[i].thread,
                sort = configObj.settings.sortBy,
                limit = configObj.settings.limitPosts;
            getPosts(path, sort, limit, {target: {columnNum:columnNum,threadNum:i}, errorMsgLoc: '.frame[data-column='+columnNum+']', callback: function(data, target) {
                var fn = new Fn(),
                    config = fn.getFromStorage('config');
                dataArray = dataArray.concat([data.concat(target.columnNum).concat(target.threadNum)]);
                if (typeof config[target.columnNum] !== 'undefined' && config[target.columnNum].threads.length == dataArray.length) { // done aggregating data from threads of config[target]
                    cacheColumn(config, columnNum, dataArray);
                    var mergedData = getMergedData(dataArray);
                    if ($(".frame-content[data-column="+columnNum+"]").children().length===0 && mergedData[1].data.children.length>0) {
                        markFirstComment(mergedData[1].data.children[0].data.name, target.columnNum);
                    }
                    displayComments(mergedData, target.columnNum);
                    hideLoader(target.columnNum);
                }
            }});
        }
    }
}
function appendColNumAndThreadNum(children, columnNum, threadNum) {
    children.forEach(function(child) {
        var replies = child.kind!='more'&&child.data.replies.hasOwnProperty('data')
            ? child.data.replies.data.children:[];
        child.data.name += '-'+columnNum+'-'+threadNum;
        child.data.parent_id += '-'+columnNum+'-'+threadNum;
        appendColNumAndThreadNum(replies, columnNum, threadNum);
    });
    return children;
}
function markFirstComment(firstCommentName, column) {
    if (typeof firstCommentName !== "undefined") {
        window['firstComment'+column] = firstCommentName;
    }
}
function updateConfigObjFromDOM(parentClass, subClass, threadClass, settingsClass, num) {
    var column = {}, setting = {}, threads = [], $group = $(parentClass), 
        settings = $(settingsClass).find('.form-control'), newColumnAdded = false,
        type = typeof num !== 'undefined' && $(".frame-position[data-column="+num+"]").data('type')=='reddit' || !$('#reddit').hasClass('hide')
            ? 'reddit' : 'twitter',
        fn = new Fn(), config = fn.getFromStorage('config');
    $group.each(function(index, el) {
        var threadVal = $(el).find(threadClass).val(), 
            subVal = $(el).find(subClass+'.tt-input').val();
        if (threadVal && subVal) {
            var thread = {}, $option = $(el).find(threadClass+' option:selected');
            thread.subreddit = $(el).find(subClass+'.tt-input').val();
            thread.thread = $(el).find(threadClass).val();
            thread.threadid = $option.data('threadid');
            thread.threadtitle = $option.data('threadtitle');
            thread.subid = $option.data('subid');
            threads.push(thread);
        }
    });
    if ($group.length>0 && 
        fn.any($group.find(threadClass), function(x){ return $(x).val()!==null}) &&
        fn.any($group.find(subClass+'.tt-input'), function(x){ return $(x).val()!==""})) {
        column.threads = threads;
        setting.name = settings[0].value;
        setting.refreshRate = settings[1].value;
        setting.limitPosts = settings[2].value;
        setting.sortBy = settings[3].value;
        column.settings = setting;
        column.type = type;
        typeof num !== 'undefined'
            ? config[num] = column
            : function() { config = config.concat(column); newColumnAdded = true; }();
        fn.setInStorage('config', config);
    }
    return newColumnAdded;
}
function addToConfigObj(column) {
    var fn = new Fn();
    fn.setInStorage('config', fn.getFromStorage('config').concat(column));
}
function setThreads(data, selectTarget) {
    var $select = typeof selectTarget[2] !== 'undefined' // columnNum was passed
            ? $($(selectTarget[0]+"[data-column="+selectTarget[2]+"]")[selectTarget[1]])
            : $($(selectTarget[0])[selectTarget[1]]),
        config = new Fn().getFromStorage('config');
    $select.children().remove();
    data.data.children.forEach(function(post) {
        $select.append(tmpl('tmpl_v', {post:post}));
    });
    if (config.length > 0 && typeof selectTarget[2] !== 'undefined') {
        var threadObj = config[selectTarget[2]].threads[selectTarget[1]];
        if ($select.find("option[data-threadid="+threadObj.threadid+"]").length===0 && threadObj.subid==$select.find('option:selected').data('subid')) {
            $select.append(tmpl('tmpl_w', {threadObj:threadObj}));
        }
        $select.find("option[data-threadid="+threadObj.threadid+"]").prop('selected',true);
    }
}
function showLoader(columnNum) {
    $(".frame-overlay[data-column="+columnNum+"]").addClass('half-fade');
    $(".loading[data-column="+columnNum+"]").removeClass('hide').addClass('faded');
}
function hideLoader(columnNum) {
    $(".frame-overlay[data-column="+columnNum+"]").removeClass('half-fade');
    $(".loading[data-column="+columnNum+"]").removeClass('faded');
    setTimeout(function(){$(".loading[data-column="+columnNum+"]").addClass('hide')}, 500);
}
function fadeIn(domElement, millsecs, className) {
    setTimeout(function(){ $(domElement).addClass(className ? className : 'faded')}, millsecs);
}
function getIcon(subreddit) {
    return 'icon-'+subreddit;
}
function updateVoteState(data, obj) {
    var $voteUp = $('.vote.up[data-id^='+obj.id+']'),
        $voteDown = $('.vote.down[data-id^='+obj.id+']');
    $('.score[data-id^='+obj.id+']').data('vote-state', obj.dir);
    if (obj.dir==1) {
        $voteUp.addClass('active'); $voteDown.removeClass('active');
    } else if (obj.dir==-1) {
        $voteDown.addClass('active'); $voteUp.removeClass('active');
    } else { $voteUp.removeClass('active'); $voteDown.removeClass('active'); }
}
function replyLevelCommentFail(additionalData) {
    $('#reply-textarea, #reply-save').removeAttr('disabled');
    $($('#reply-textarea')[0].form)
        .launchPopOver(3000, popOverOptions('top','','There was a problem posting your reply. Try again!'));
}
function topLevelCommentFail(additionalData) {
    var $form = $(additionalData.postPane).find('form');
    $form.find('.save-reply').removeAttr('disabled');
    $form.find('.textarea-reply').removeAttr('disabled');
    frame_content_height(additionalData.columnNum);
    $form.find('.textarea-reply').launchPopOver(3000, popOverOptions('top','','There was a problem posting your comment. Try again!'));
}
function postTopLevelComment(objArray, additionalData) {
    var $form = $(additionalData.postPane).find('form'),
        $textarea = $form.find('.textarea-reply');
    $textarea.val('').removeAttr('disabled');
    $form.find('.save-reply').removeAttr('disabled');
    frame_content_height(additionalData.columnNum);
    bindColumnBars.call($('.column-bars[data-column='+additionalData.columnNum+'] > a'), additionalData.columnNum);
    bindGetCommentsForColumn.call($('.frame[data-column='+additionalData.columnNum+'] .frame-header'), additionalData.columnNum);
}
function insertReplyIntoDOM(objArray, additionalData) {
    $('#reply-textarea, #reply-save').removeAttr('disabled');
    $('#reply-modal').modal('toggle');
    $(buildCommentHtmlString(appendColNumAndThreadNum(objArray, additionalData.columnNum, additionalData.threadNum),true))
        .insertAfter('#'+objArray[0].data.parent_id+' .comment-footer:first');
    externalLinks('.md a');
    fadeIn($('#'+objArray[0].data.name), 100);
}
function externalLinks(selector) {
    $(selector).each(function(index, el) {
        el.onclick = stopProp;
        $(el).attr('target','_blank');
        $(el).attr('href').substring(0,3)=='/u/' || $(el).attr('href').substring(0,3)=='/r/'
            ? $(el).attr('href', window.location.protocol+'//www.reddit.com'+$(el).attr('href')) : '';
    });
}
function displayComments(data, columnNum) {
    var $frameContent = $(".frame-content[data-column="+columnNum+"]");
    if (!$frameContent.children().length) { // first time load
        $frameContent.append(buildCommentHtmlString(data[1].data.children, true, true));
        fadeIn($frameContent.children(), 100);
    } else { // subsequent loads
        var firstComment = window['firstComment'+columnNum];
        if (!(firstComment == data[1].data.children[0].data.name)) {
            var newComments = new Fn().takeWhile(data[1].data.children, firstComment, function(x, commentName){
                return !document.getElementById(x.data.name) && x.data.name != commentName;
            });
            $(".frame-content[data-column="+columnNum+"]").prepend(buildCommentHtmlString(newComments, true, true));
            newComments.forEach(function(comment){ fadeIn($('#'+comment.data.name),500) });
            if (newComments.length > 0) $('.frame-overlay[data-column='+columnNum+']').launchPopOver(3000, popOverOptions('bottom','',newComments.length+' new comments!'));
            markFirstComment(data[1].data.children[0].data.name, columnNum);
        }
        updateCommentStats(data[1].data.children);
        updateCreatedUTC(columnNum);
    }
    externalLinks('.md a');
}
function updateCreatedUTC(columnNum) {
    var frameContent = document.getElementsByDataAttribute('.frame-content', 'data-column', columnNum)[0],
        collection = frameContent.getElementsByClassName('time-elapsed');
    collection.forEach(function(node) {
       node.innerHTML = getTimeElapsed(node.getAttribute('data-created-utc'));
    });
}
function updateCommentStats(comments) {
    comments.forEach(function(comment){
        var replies = comment.kind!='more' && comment.data.replies.hasOwnProperty('data')
            ? comment.data.replies.data.children : [], replyLength = replies.length,
            commentId = '#'+comment.data.name,
            replyContainer = commentId+' .reply-container[data-id='+comment.data.name+']';
        typeof comment.data.score !== 'undefined' ? $('.score[data-id='+comment.data.name+']').text(comment.data.score) : void 0;
        newCommentsOnRefresh(replyLength, comment.data.name, replyContainer);
        updateCommentStats(replies);
    });
}
function newCommentsOnRefresh(replyLength, name, replyContainer) {
    var $preloadedReplies = $('#'+name+' .media[data-parentid='+name+']'),
        $replySwitch = $(replyContainer+' .reply'),
        $replyNum = $(replyContainer+' .reply .reply-num'),
        newRepliesNum = replyLength - $preloadedReplies.length,
        newLink = tmpl('tmpl_ab', {newRepliesNum:newRepliesNum}),
        optionalExpander = tmpl('tmpl_ac', {replyLength:replyLength, replyText:replyLength>1?'replies':'reply'});
    if (replyLength > 0 && $replySwitch.length>0 && replyLength > $replySwitch.data('replylength')) { // replies exist already
        $replySwitch.data('replylength', replyLength);
        $replyNum.text(replyLength);
        if (newRepliesNum > 0 && $(replyContainer+' .new-comment').length===0) {
            $(newLink).insertAfter(replyContainer+' .reply');
        } else {
            if (!$replySwitch.children().length && $preloadedReplies.length>0) {
                $replySwitch.append(optionalExpander);
                $(replyContainer+'.reply .expander').html('&#8722;');
            }
            newRepliesNum <= 0 ? void 0 : $(replyContainer+' .new-comment .diff').text(newRepliesNum+' new');
        }
    } else if (replyLength > 0 && $replySwitch.length===0) { // replies don't exist until now
        var existingRepls = tmpl('tmpl_ad', {name:name, replyLength:replyLength});
        $(replyContainer).append(existingRepls);
        if (newRepliesNum > 0) {
            $(newLink).insertAfter(replyContainer+' .reply');
        }
        if ($preloadedReplies.hasClass('faded')) {
            $(replyContainer+' .reply').append(optionalExpander);
            $(replyContainer+' .reply .expander').html('&#8722;');
        }
    }
}
function getThreadById(id, done, fail, always, cacheBool, errorMsgLoc, additionalData) {
    genericGet(window.location.protocol+"//www.reddit.com/by_id/t3_"+id+'.json', done, fail, always, cacheBool, errorMsgLoc, additionalData);
}
function getCommentsByLink(linkid, done, fail, always) { // get the whole payload of comments from the specific linkid
    genericGet(window.location.protocol+"//www.reddit.com/comments/"+linkid+'.json?sort=new', done, fail, always);
}
function getCommentsById(linkid, id, done, fail, always) { // used to only retrieve replies from a specific id, thus avoiding a huge payload
    genericGet(window.location.protocol+"//www.reddit.com/comments/"+linkid.substr(3)+"/_/"+id+'.json?sort=new', done, fail, always);
}
function getPermalink(link_id, id) {
    // permalink = https://www.reddit.com/comments/<link_id>1p3qau/_/<id>ccz05xk
    return window.location.protocol+"//www.reddit.com/comments/"+link_id.substr(3)+"/_/"+id;
}
function getTimeElapsed(then) {
    if (!then) return;
    var date = new Date(then*1000);
    // Set the unit values in milliseconds.
    var msecPerMinute = 1000 * 60, msecPerHour = msecPerMinute * 60, msecPerDay = msecPerHour * 24;
    var now = new Date();
    var nowMsec = now.getTime();
    var interval = nowMsec - date.getTime();
    var days = Math.floor(interval / msecPerDay );
    interval = interval - (days * msecPerDay );
    var hours = Math.floor(interval / msecPerHour );
    interval = interval - (hours * msecPerHour );
    var minutes = Math.floor(interval / msecPerMinute );
    interval = interval - (minutes * msecPerMinute );
    var seconds = Math.floor(interval / 1000 );
    if (!days==0 && !(days<=0)) {
        return days.toLocaleString()+'d';
    } else if (days==0&&!hours==0) {
        return hours.toLocaleString()+'h';
    } else if (days==0&&hours==0&&!minutes==0) {
        return minutes.toLocaleString()+'m';
    } else if (days==0&&hours==0&&minutes==0&&!seconds==0){
        return seconds.toLocaleString()+'s';
    } else if ((nowMsec-(then*1000))<1000){
        return '1s';
    }else{ return date.toLocaleTimeString(); }
}
function getMergedData(dataArray) {
    var children = [];
    dataArray.forEach(function(data, i){
        if (data.length>0) {
            children = children.concat(appendColNumAndThreadNum(data[1].data.children, dataArray[i][2], dataArray[i][3]));
        }
    });
    children = children.filter(function(x){ if (x.kind != 'more') return x }).sort(byTimeCreated);
    dataArray[0][1].data.children = children;
    return dataArray[0];
}
function byTimeCreated(a,b) {
    if (a.kind != 'more' && b.kind == 'more') return 1;
    if (a.kind == 'more' && b.kind != 'more') return -1;
    if (a.data.created_utc < b.data.created_utc) return 1;
    if (a.data.created_utc > b.data.created_utc) return -1;
    return 0;
}
function errorPop(errorMsgLoc, errorThrown) {
    if (typeof errorMsgLoc !== 'undefined') {
        if (errorThrown=='timeout') {
            $(errorMsgLoc).launchPopOver(3000, popOverOptions('bottom','Servers Busy', 'Reddit servers are busy.'));
        } else {
            $(errorMsgLoc).launchPopOver(3000,
                popOverOptions('bottom','Generic Error', 'There was an error processing this request. Reddit servers could not be reached or are busy. Try refreshing.'));
        }
    }
}
function genericGet(url, done, fail, always, cacheBool, errorMsgLoc, additionalData) {
    $.ajax({ url: url, type: "GET", timeout:7000, cache: cacheBool || false })
    .done(function(data, textStatus, jqXHR) { if (done) done(data, textStatus, jqXHR, additionalData); })
    .fail(function(jqXHR, textStatus, errorThrown) {
        if (fail) fail(jqXHR, textStatus, errorThrown, additionalData);
        errorPop(errorMsgLoc, errorThrown);
    })
    .always(function() { if (always) always(); });
}
function genericPost(url, data, done, fail, always, additionalData, errorMsgLoc, headers) {
    $.ajax({ 
        url: url, 
        type: 'POST', 
        timeout:additionalData.timeout || 7000, 
        data: data, 
        cache: false, 
        headers : headers || {}
    })
    .done(function(data, textStatus, jqXHR) { if (done) done(data, textStatus, jqXHR, additionalData);})
    .fail(function(jqXHR, textStatus, errorThrown) {
        if (fail) fail(jqXHR, textStatus, errorThrown, additionalData);
        errorPop(errorMsgLoc, errorThrown);
    })
    .always(function(data, textStatus, jqXHR) { if (always) always(data, textStatus, jqXHR); });
}
function getPosts(path, sort, limit, obj){
    $.ajax({
        url: window.location.protocol+"//www.reddit.com"+path+"/.json?sort="+sort+"&limit="+limit+"&jsonp=?",
        dataType: 'json',
        timeout: 7000,
        cache: false
    })
    .done(function(data) {
        obj.callback(data, obj.target);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        errorPop(obj.errorMsgLoc, errorThrown);
        hideLoader(obj.target.columnNum);
    })
    .always(function() {
        if (obj.always) obj.always(obj.target);
    });
}
function buildRedditMedia(data, type, loadMore) {
    var $mediaList = $('#search-results-container .media-results');
    if (loadMore===false) $mediaList.children().remove();
    if (type == 't3') { // we're building a list of threads
        data.data.children.forEach(function(thread, i) {
            $mediaList.append(tmpl('tmpl_ao', {
                obj: thread,
                permalink: thread.data.permalink.split('?')[0],
                timeElapsed: getTimeElapsed(thread.data.created_utc),
                thumbnail: thread.data.thumbnail && thread.data.thumbnail != 'self' && thread.data.thumbnail != 'default'
                    ? tmpl('tmpl_ao0', {src: window.location.protocol+thread.data.thumbnail.substr(5)}) 
                    : tmpl('tmpl_ap', {})
            }));
            fadeIn($('#search-results-container .media-results li:last-child'), 100+(i*50), 'opacity-7');
        });
    } else if (type == 't5') {
        data.data.children.forEach(function(sub, i) {
            var timeElapsed = getTimeElapsed(sub.data.created_utc); 
            $mediaList.append(tmpl('tmpl_aq', {
                obj:sub, 
                timeElapsed: timeElapsed,
                subscribers: sub.data.subscribers 
                    ? parseInt(sub.data.subscribers).toLocaleString()+' subscribers, a community for '+timeElapsed 
                    : "A community for "+timeElapsed
            }));
            fadeIn($('#search-results-container .media-results li:last-child'), 100+(i*50), 'opacity-7');    
        });
    }
}
function buildWatchList(watchObj) {
    var subs = watchObj.subs, matchs = watchObj.match,
        subHtml = '', matchHtml = '';
    subs.forEach(function(sub) { subHtml += buildWatchInputOrThreadHtmlString(sub, 'input'); });
    matchs.forEach(function(match){ matchHtml += buildWatchInputOrThreadHtmlString(match, 'input');});
    $('#watch-subreddits .list-group.contain, #watch-matching .list-group.contain').children().remove();
    $('#watch-subreddits .list-group.contain').append(subHtml);
    $('#watch-matching .list-group.contain').append(matchHtml);
}
function buildRedditConfigObjByThreads(children) {
    var configObj = {}, settings = {}, threads = [];
    children.forEach(function(thread){
        var threadObj = {};
        threadObj.subid = thread.data.subreddit_id;
        threadObj.subreddit = (thread.data.subreddit).toLowerCase();
        threadObj.thread = thread.data.permalink;
        threadObj.threadid = thread.data.id;
        threadObj.threadtitle = thread.data.title;
        threads.push(threadObj);
    });
    settings.limitPosts = "50";
    settings.name = children.length==1 
        ? children[0].data.title.length > 25 
            ? children[0].data.title.trim().substring(0,22)+' ...' 
            : children[0].data.title.trim()
        : "My Column";
    settings.refreshRate = "60";
    settings.sortBy = "new";
    configObj.type = "reddit";
    configObj.settings = settings;
    configObj.threads = threads;
    return configObj;
}
function buildColumn(configObj, num, fromCache) {
    $(".item[data-column="+num+"]").remove();
    var frameContent = tmpl('tmpl_i', {num:num}),
        icons = tmpl('tmpl_j', {num:num}),
        frame = tmpl('tmpl_l', {
            bigButtons: tmpl('tmpl_p',{columnNum:num}), 
            type: configObj.type == 'reddit' ? tmpl('tmpl_ired', {}) : tmpl('tmpl_itwt',{}),
            num:num, 
            configObj:configObj, 
            icons:icons, 
            frameContent:frameContent
        }),
        frameContainer = tmpl('tmpl_m', {frame:frame}),
        framePosition = tmpl('tmpl_n', {num:num, configObj:configObj, frameContainer:frameContainer}),
        item = tmpl('tmpl_o', {num:num, active: num===0?'active':'', framePosition:framePosition});
    buildColumnToUI(item, num);
    buildColumnOptions(configObj, num, 'column');
    if (configObj.type=='reddit') {
        getCommentsForColumn(configObj, num, fromCache);
        toggleRefresh(num);
    }
    contentResizeEvent();
    fadeIn(".frame-position[data-column="+num+"]", 100);
}
function buildCommentHtmlString(commentsArray, optionalNopacity, isParent, hide) {
    var commentsArray = commentsArray || []; var htmlString = '';
    commentsArray.forEach(function(comment) {
        var replies = comment.kind!='more'&&comment.data.replies.hasOwnProperty('data')
                ? comment.data.replies.data.children:[], replyLength = replies.length;
        var footer = comment.kind!='more'
                ? tmpl('tmpl_ae', {
                    comment:comment, 
                    replyLength:replyLength,
                    permalink:getPermalink(comment.data.link_id,comment.data.id),
                    replies: replyLength!==0?tmpl('tmpl_af',{comment:comment,replyLength:replyLength,replyText:replyLength>1?'replies':'reply'}):""
                }) : "",
            text = $("<div/>").html(comment.data.body_html).text()+footer+buildCommentHtmlString(replies, true, false, true),
            heading = comment.kind!='more'
                ? tmpl('tmpl_ag', {
                    comment: comment,
                    text: text,
                    timeElapsed:getTimeElapsed(comment.data.created_utc),
                    href: window.location.protocol+"//www.reddit.com/r/"+comment.data.subreddit,
                    authorLink: window.location.protocol+"//www.reddit.com/u/"+comment.data.author,
                    author: comment.data.author,
                    flair: comment.data.author_flair_css_class ? '<a class="flair btn">'+comment.data.author_flair_css_class+"</a>" : "&nbsp;"
                })
                : tmpl('tmpl_ah', {comment:comment, text:text}),
            body = tmpl('tmpl_ai', {heading:heading}),
            thumbnail = comment.kind!='more' ? tmpl('tmpl_aj', {icon: isParent?getIcon(comment.data.subreddit):''}) : "",
            media = tmpl('tmpl_ak', {
                comment:comment, 
                icon:getIcon(comment.data.subreddit),
                parent: isParent?'parent':hide?'hide':'', 
                opacity: optionalNopacity?'nopacity':'',
                thumbnail: thumbnail, 
                body: body
            })
        htmlString += media;
    });
    return htmlString;
}
function buildWatchInputOrThreadHtmlString(thing, type) {
    thing.timeElapsed = getTimeElapsed(thing.created_utc);
    return  type == 'input'
        ? tmpl('tmpl_a', {thing:thing})
        : tmpl('tmpl_b', {thing:thing});
}
function buildColumnToUI(frameHTML, num) {
    var $carousel_inner = $('.carousel-inner');
    num === 0 ? $carousel_inner.children().length > 0
        ? $(frameHTML).insertBefore('.item:first')
        : $carousel_inner.append(frameHTML)
            : $(frameHTML).insertAfter($(".item[data-column="+(num-1)+"]"));
}
function buildReplyForm(thing_id, author, isTopLevel) {
    var buttons = tmpl('tmpl_x', {buttonClass:isTopLevel?'btn-default':'btn-primary'}),
        parentInput = tmpl('tmpl_y', {thing_id:thing_id}),
        textarea = tmpl('tmpl_z', {
            label:isTopLevel?"<label>Comment</label>":"",
            placeholder:isTopLevel?"Write a comment":"Reply to "+author+"..."}),
        form = tmpl('tmpl_aa', {
            className:isTopLevel?'isTopLevel':'nopacity hide',
            submitting:isTopLevel?'<b><span class="black">Submitting...</span></b>' : "Submitting...",
            parentInput:parentInput, 
            textarea:textarea, 
            buttons:buttons
        })
    return form;
}
function buildConfigToUI(deleteFlag) {
    var config = new Fn().getFromStorage('config');
    if (config.length===0) {
        showFeature('#greeting');
        $('#watch-threads .list-group.contain').children().length === 0 ? watchList() : void 0;
    } else {
        showFeature('#content-container');
        if ($('.carousel-inner').children().length === 0 || deleteFlag) {
            if (deleteFlag) $('.carousel-inner').children().remove();
            for (var i = 0, len = config.length; i < len; i++) {
                buildColumn(config[i], i, true);
            }
        }
    }
    contentResizeEvent();
}
function buildButtons(arr) {
    var buttonsHTML = "";
    arr.forEach(function(arr){ 
        buttonsHTML += tmpl('tmpl_c0', {arrPos0: arr[0], arrPos1: arr[1], arrPos2: arr[2]});
    });
    return buttonsHTML;
}
function buildColumnOptions(configObj, columnNum) {
    var addThreadTab = function() {
        var addThread = tmpl('tmpl_c', {ulClass:"edit-button-group", 
            buttons: buildButtons([
                ['add-thread-button','plus-circle', getPressEvent()+'="bindAddThreadButton.call(this, \'.edit-form[data-column='+columnNum+']\', \'edit-button-group\', \'subreddit-group-edit\', \'subreddit-edit\', \'thread-edit\', \'delete-edit\', \'info-edit\', '+columnNum+')"'],
                ['cancel-edit-button','close',getPressEvent()+'="bindCancelEdit.call(this, '+columnNum+')"'],
                ['save-edit-button','save',getPressEvent()+'="bindSaveEdit.call(this, '+columnNum+')"']])
        });
        for (var i = 0, len = configObj.threads.length; i < len; i++) {
            var threads = tmpl('tmpl_d', {columnNum:columnNum}),
                subreddit = tmpl('tmpl_e', {columnNum:columnNum}),
                subreddit_group = tmpl('tmpl_f', {subreddit:subreddit, threads:threads});
            addThread += subreddit_group;
        } return addThread;
    }();
    var settingsTab = function() {
        var settingsButtons = tmpl('tmpl_c', {ulClass:"edit-button-group", 
                buttons: buildButtons([
                    ['cancel-edit-button','close',getPressEvent()+'="bindCancelEdit.call(this, '+columnNum+')"'],
                    ['save-edit-button','save',getPressEvent()+'="bindSaveEdit.call(this, '+columnNum+')"']])
            }),
            settingSelects = $('<div>').append($('.column-settings').children().clone().each(function() {
            var $label = $(this).find('label'); var $input = $(this).find('*[id]');
            $label.each(function(i, lab){ $(lab).attr('for', $(lab).attr('for')+'-column-'+columnNum)});
            $input.each(function(i, inp){ $(inp).attr('id', $(inp).attr('id')+'-column-'+columnNum)});
        })).html(); return tmpl('tmpl_g', {settings:settingsButtons+settingSelects, columnNum: columnNum});
    }();
    var postTab = tmpl('tmpl_am',{})+buildReplyForm("","",true);

    $(".edit-form[data-column="+columnNum+"]").append(addThreadTab);
    $(".settings-tab[data-column="+columnNum+"]").append(settingsTab);
    $(".write-comment[data-column="+columnNum+"]").append(postTab);

    inputLoad(columnNum);
    setSettingsFromConfig(columnNum, configObj);
}
function bindNewComment() {
    event.preventDefault();
    event.stopPropagation();
    var id = $(this).parents('.media').attr('id'),
        refreshComment = $('.refresh-comment[data-id='+id+']');
    bindRefreshComment.call(refreshComment);
}
function bindLoadMore(after, type, objParam, resetCount) {
    event.preventDefault();
    var $media_more = $('.media-more li');
    $media_more.data('after', after); $media_more.data('type', type); $media_more.data('query', objParam.query); 
    resetCount ? $media_more.data('count',25) : $media_more.data('count',$media_more.data('count')+25);
    bindMediaMore(after, type, objParam);
}
function bindMediaMore(after, type, objParam) {
    $('.media-more li').unbind(getPressEvent().slice(2)).on(getPressEvent().slice(2), function() {
        event.preventDefault();
        var type = $(this).data('type'),
            url = type == 'thread' 
                ? objParam.url+'?count='+$(this).data('count')+'&after='+$(this).data('after')
                : objParam.url+'&count='+$(this).data('count')+'&after='+$(this).data('after'),
            fn = type == 'thread' || type == 'submissions'
                ? function(data, textStatus, jqXHR, obj) {
                    if (obj.previousAfter) {
                        threadResults(data, objParam, true, type);
                        $('#search-results-container .media[data-id='+obj.previousAfter.substr(3)+']')[0].scrollIntoView();
                        bindLoadMore(data.data.after, type, objParam);
                    } else {
                        $('.media-more li').unbind('click');
                    }
                }
                : function(data, textStatus, jqXHR, obj) {
                    if (obj.previousAfter) {
                        subredditsMatching(data, objParam.query, true);
                        $('#search-results-container .media[data-id='+obj.previousAfter.substr(3)+']')[0].scrollIntoView();
                        bindLoadMore(data.data.after, type, objParam);
                    } else {
                        $('.media-more li').unbind('click');
                    }
                };
        genericGet(url, fn, undefined, undefined, false, this, {query: objParam.query, previousAfter: $(this).data('after')});            
    });
}
function bindSubList() {
    event.preventDefault();
    copyToAllRedditSearches($(this).data('subreddit'));
    threadsOfSubreddit($(this).data('subreddit'));
}
function bindThreadResults() {
    event.preventDefault();
    var threadObj = {}, data = {};
    data.subreddit_id = $(this).data('subid');
    data.subreddit = $(this).data('subreddit');
    data.permalink = $(this).data('thread');
    data.id = $(this).data('id');
    data.title = $(this).find('h4').text();
    threadObj.data = data;
    addToConfigObj(buildRedditConfigObjByThreads([threadObj]));
    configObjAction();
    makeItemActive(new Fn().getFromStorage('config').length-1);
}
function bindWatchThreads() {
    event.preventDefault();
    $(this).hasClass('white') ? $(this).removeClass('white') : $(this).addClass('white');
}
function bindSignOut(type) {
    event.preventDefault();
    if (localStorage) {
        localStorage.removeItem(type);
    }
    updateControlsView();
}
function bindLogIn(type) {
    window.location = '/auth/'+type;   
}
function bindSubmitSave(columnNum) {
    event.preventDefault();
    bindSaveEdit.call($(this.form).find('.save-edit-button'), columnNum);
}
function inputLoad(columnNum) {
    event.preventDefault();
    var $subreddit_edit = $(".edit-form[data-column="+columnNum+"] .subreddit-edit"),
        config = new Fn().getFromStorage('config');
    $subreddit_edit.each(function(index, el) {
        this.value = config[columnNum].threads[index].subreddit;
        typeAheadReddit(el, function(element){
            var group = ".edit-form[data-column="+columnNum+"] .subreddit-edit",
                index = $(group).parent().parent().parent().index($(element).parent().parent().parent());
            getPosts('/r/'+element.value, '', '', {target: ['.edit-form[data-column='+columnNum+'] .thread-edit',index], errorMsgLoc: element, callback: setThreads});
        });
    });
}
function bindFetchThreadValue(columnNum) {
    event.preventDefault();
    if (this.value) {
        var group = ".edit-form[data-column="+columnNum+"] .subreddit-edit",
            index = $(group).parent().parent().parent().index($(this).parent().parent().parent());
        getPosts('/r/'+this.value, '', '', {target: ['.edit-form[data-column='+columnNum+'] .thread-edit',index], errorMsgLoc: this, callback: setThreads});    
    }
}
function bindSaveEdit(columnNum) {
    event.preventDefault();
    updateConfigObjFromDOM(
        '.column-options[data-column='+columnNum+'] .subreddit-group-edit', 
        '.subreddit-edit', 
        '.thread-edit', 
        '.column-options[data-column='+columnNum+'] .edit-column-settings', 
        columnNum
    );
    buildColumn(new Fn().getFromStorage('config')[columnNum], columnNum);
    makeItemActive(columnNum);
}
function bindCancelEdit(columnNum) {
    event.preventDefault();
    showAllColumnOptions(columnNum);
}
function bindAddThreadButton(context, target, groupClass, subClass, threadClass, deleteClass, infoClass, optionalColumnNum) {
    event.preventDefault();
    var threads = tmpl('tmpl_s', {infoClass:infoClass, threadClass:threadClass}),
        subreddit = tmpl('tmpl_t', {
            input: "\'"+context+' .'+subClass+'.tt-input:first'+"\'", 
            deleteClass:deleteClass, 
            subClass:subClass,
            groupClass:"\'"+groupClass+"\'",
            threadClass:"\'"+threadClass+"\'",
            columnNum: typeof optionalColumnNum !== 'undefined' ? optionalColumnNum : false
        }),
        subreddit_group = tmpl('tmpl_u', {groupClass:groupClass, subreddit:subreddit, threads:threads});
    $(subreddit_group).insertAfter(context+' .'+target);
    typeof optionalColumnNum !== 'undefined' ? frame_content_height(optionalColumnNum) : void 0;
    typeAheadReddit(context+' .'+subClass+':first', function(element) {
        var index = $(context+' .'+groupClass).index($(element).parent().parent().parent());
        getPosts('/r/'+element.value, '', '', {target: [context+' .'+threadClass,index], errorMsgLoc: element, callback: setThreads});
    });
    fadeIn('.'+groupClass, 100);
}
function bindPopulateThreadSelect(input, groupClass, threadClass) {
    event.preventDefault();
    var index = $('.'+groupClass).index($(this).parent().parent().parent());
    getPosts('/r/'+this.value, '', '', {target: ['.'+threadClass,index], errorMsgLoc: this, callback: setThreads});
}
function bindInfoThread(infoClass) {
    event.preventDefault();
    var threadid = $(this).parents('.form-group').find('select option:selected').data('threadid');
    if (threadid) {
        getThreadById(threadid, function(data) {
            if (data.data.children[0].data.selftext_html) {
                $('#info-title, #info-content').children().remove();
                $('#info-title').html(tmpl('tmpl_an', {url:data.data.children[0].data.url, title: data.data.children[0].data.title}));
                $('#info-content').append($("<div/>").html(data.data.children[0].data.selftext_html).text());
                $('#author-button').text('/u/'+data.data.children[0].data.author).attr(getPressEvent(), "window.open('"+window.location.protocol+"//www.reddit.com/u/"+data.data.children[0].data.author+"','_blank');");
                $('#time-button').text(getTimeElapsed(data.data.children[0].data.created_utc));
                externalLinks('#info-content .md a');
                $('#info-modal').modal();
            } else {
                window.open(data.data.children[0].data.url, '_blank');
            }
        }, undefined, undefined, true, this);
    }
}
function bindDeleteThread(columnNum) {
    event.preventDefault();
    $(this).parent().parent().parent().remove();
    if (typeof columnNum !== 'undefined') frame_content_height(columnNum);
}
function bindVoteCast() {
    event.preventDefault(); var me = this;
    $.when(checkAccessToken('ruser')).then(
        function() {
            var fn = new Fn(),
                id = $(this).data('id').split('-')[0],
                vote_state = $('.score[data-id='+$(this).data('id')+']').data('vote-state'),
                vote_action = $(this).hasClass('up') ? 1 : -1,
                dir = vote_action == vote_state ? 0 : vote_action == 1 ? 1 : -1,
                formData = {id: id, dir: dir},
                headers  = fn.getRedditAuthHeader();
            done = function(data, textStatus, jqXHR, obj) {
                data.statusCode ? console.log(data.statusCode)
                    : data.json && data.json.errors.length > 0 
                        ? alert(data.json.errors[0][1])
                        : updateVoteState(data,obj);
            },
            fail = function(jqXHR, textStatus, errorThrown, obj) {
                alert(textStatus+': Couldn\'t cast vote to '+obj.id);
            };
            if (!headers) return;
            genericPost('https://oauth.reddit.com/api/vote', formData, done, fail, fn.setRedditResponseHeader, formData, undefined, headers);    
        }.bind(me),
        function() {$('#login-reddit-modal').modal()}
    )
    new Fn().getBlurred();
}
function bindSaveReply() {
    event.preventDefault();
    var fn = new Fn(),
        $postPane = $(this).parents('.write-comment'),
        thing_id_raw = this.form 
            ? this.form.thing_id.value
            : $(this).parents('.modal-content').find('form')[0].thing_id.value,
        thing_id = thing_id_raw.split('-')[0] || 't3_'+$postPane.find('.post-thread option:selected').data('threadid'),
        additionalData = {
            columnNum: thing_id_raw.split('-')[1] || $postPane.data('column'),
            threadNum: thing_id_raw.split('-')[2],
            postPane: $postPane.length > 0 ? $postPane : $(this).parents('.comment-footer'),
            timeout: 99999
        },
        text = this.form 
            ? this.form.text.value
            : $(this).parents('.modal-content').find('form')[0].text.value
    if (text.length===0) return;
    
    this.form
        ? function(){ $(this.form.text).attr('disabled','disabled'); $(this).attr('disabled','disabled')}.call(this)
        : $('#reply-textarea, #reply-save').attr('disabled','disabled');

    $postPane.length > 0 ? frame_content_height(additionalData.columnNum) : void 0;
    var done = $postPane.length > 0
            ? function(data, textStatus, jqXHR, additionalData) { // submitting comment from nav-tab post
                data.statusCode 
                    ? topLevelCommentFail(additionalData)
                    : data.json && data.json.errors.length > 0 
                        ? function(){ replyLevelCommentFail(additionalData); alert(data.json.errors[0][1]); }()
                        : postTopLevelComment(data.json.data.things, additionalData);
            }
            : function(data, textStatus, jqXHR, additionalData) { // submitting comment from reply
                data.statusCode 
                    ? replyLevelCommentFail(additionalData)
                    : data.json && data.json.errors.length > 0 
                        ? function(){ replyLevelCommentFail(additionalData); alert(data.json.errors[0][1]); }()
                        : insertReplyIntoDOM(data.json.data.things, additionalData);
            },
        fail = $postPane.length > 0
            ? function(jqXHR, textStatus, errorThrown, additionalData){
                topLevelCommentFail(additionalData);
            }
            : function(jqXHR, textStatus, errorThrown, additionalData){
                replyLevelCommentFail(additionalData);
            },
        formData = {thing_id: thing_id, text: text, api_type:'json'},
        headers  = fn.getRedditAuthHeader();
    
    if (!headers) return;
    genericPost('https://oauth.reddit.com/api/comment', formData, done, fail, fn.setRedditResponseHeader, additionalData, undefined, headers);
}
function bindTextAreaReply() {
    event.preventDefault(); var me = this;
    $.when(checkAccessToken('ruser')).then(
        function() { return void 0; }, // pass
        function() { // fail
            if (!$(this).parent().parent().hasClass('isTopLevel')) $('#reply-modal').modal('toggle'); 
            $('#login-reddit-modal').modal(); 
        }.bind(me)
    )
}
function bindCancelReply(){
    event.preventDefault();
    var $comment_footer = $(this).parents('.comment-footer');
    $comment_footer.length>0
        ? bindReplySwitch.call($comment_footer.find('.reply-switch'))
        : showAllColumnOptions($(this).parents('.column-options').data('column'));
}
function bindReplySwitch() {
    event.preventDefault();
    $('#original-comment').children().remove();
    var id = $(this).parent().parent().data('id'),
        $comment = $(".reddit-html[data-id="+id+"]").clone();
        author = $comment.data('author');
    $('#reply-modal').modal('toggle');
    $('#reply-thing').val(id);
    $('#original-comment').html($comment);
    $('#reply-title').text(author+' wrote:');
    $('#reply-textarea').attr('placeholder', 'Reply to '+author+'...');
}
function bindShowReply(){
    event.preventDefault();
    event.stopPropagation();
    var name = $(this).data('name'),
        $replies = $('#'+name+' .media[data-parentid='+name+']'),
        $icon = $(this).find('.expander');
    if ($replies.hasClass('hide')) {
        $icon.html('&#8722;');
        fadeIn($replies.removeClass('hide'), 100);
    } else {
        $icon.html('&#43;');
        $replies.removeClass('faded').addClass('hide');
    }
}
function bindRefreshComment() {
    event.preventDefault();
    var linkid = $(this).data('linkid') || $('#'+$(this).data('parent')).data('linkid'),
        id = $(this).data('id') || $('#'+$(this).data('parent')).attr('id'),
        isTopLevel = $('#'+id).hasClass('parent') || $('#'+$(this).data('parent')).hasClass('parent');
    getCommentsById(linkid, id.substr(3).split('-')[0], function(data){
        var columnNum = id.split('-')[1], threadNum = id.split('-')[2],
            htmlString = buildCommentHtmlString(appendColNumAndThreadNum(data[1].data.children, columnNum, threadNum));
        $('#'+id).replaceWith(htmlString);
        if (isTopLevel) {
            $('#'+id).addClass('parent');
            $('#'+id).children(':first').addClass($('#'+id).data('icon'));
        }
        $('.reply[data-name='+id+'] .expander').html('&#8722;');
        $('#'+id+' .media[data-parentid='+$('#'+id).attr('id')+']').removeClass('hide').addClass('faded');
        $('#'+id).addClass('nopacity');
        fadeIn($('#'+id), 100);
        externalLinks('.md a');
    });
}
function bindDeleteWatchButtons() {
    event.preventDefault();
    $(this).parent().parent().remove();
}
function bindWatchAddSubreddit() {
    event.preventDefault();
    $('#watch-subreddits .list-group.contain').append(tmpl('tmpl_al',{}));
}
function bindWatchAddMatching() {
    event.preventDefault();
    $('#watch-matching .list-group.contain').append(tmpl('tmpl_al',{}));
}
function bindWatchRefresh() {
    event.preventDefault();
    saveWatchList();
    watchList();
}
function bindWatchSave() {
    event.preventDefault();
    function notEmpty(x) { return !($(x).val()==="") }
    var fn = new Fn(),
        $watchSubs = $('#watch-subreddits .list-group.contain'), 
        $watchMatching = $('#watch-matching .list-group.contain');
    if ($watchSubs.children().length===0 || !fn.any($watchSubs.find('input'),notEmpty)
        || $watchMatching.children().length===0 || !fn.any($watchMatching.find('input'),notEmpty)) { // validation
        var watch_controls = '#watch-subreddits .list-group-item.controls, #watch-matching .list-group-item.controls, #watch-threads .list-group-item.controls';
        $(watch_controls).launchPopOver(3000,
            popOverOptions('top','Verification','Verify you have one subreddit and one matching pattern added with values.'));
    } else {
        saveWatchList();
        if ($(this).hasClass('wthreads')) {
            var hasWhite = function(x) { return $(x).hasClass('white'); };
            if (fn.any('#watch-threads .list-group.contain li', hasWhite)) {
                // build column
                var children = [];
                $("#watch-threads .list-group.contain li.white").each(function(i, el) {
                    var threadObj = {}, data = {};
                    data.subreddit_id = $(el).data('subid');
                    data.subreddit = $(el).data('subreddit');
                    data.permalink = $(el).data('thread');
                    data.id = $(el).data('threadid');
                    data.title = $(el).text();
                    threadObj.data = data;
                    children.push(threadObj);
                });
                addToConfigObj(buildRedditConfigObjByThreads(children));
                configObjAction();
                makeItemActive(fn.getFromStorage('config').length-1);
            } else {
                $('#watch-threads .list-group-item.controls').launchPopOver(3000,
                    popOverOptions('top','Verification', 'Please select at least one thread from the list.'));
            }
        }
    }
}
function bindDeleteColumn() {
    var fn = new Fn(),
        config = fn.getFromStorage('config'),
        columnNum = $(this).data('column');
    config.forEach(function(obj, i){ deleteRefresh(i); });
    fn.remove(config, columnNum);
    fn.setInStorage('config', config);
    delete window['firstComment'+columnNum];
    buildConfigToUI(true);
    $('#delete-column-modal').modal('hide');
}
function bindAutoRefreshActive() {
    event.preventDefault();
    $('#carousel').unbind('slid.bs.carousel').on('slid.bs.carousel', function () {
        autoRefreshOnlyActiveColumn();
    });
}
function bindColumnButton() {
    new Fn().getFromStorage('config').length > 0
        ? buildConfigToUI() 
        : $(this).parent().launchPopOver(3000,popOverOptions('top','No columns','Build at least one column to view columns.'));
}
function bindHomeButton() {
    $('#watch-threads .list-group.contain').children().length===0 ? watchList() : '';
    showFeature('#greeting');
}
function bindRedditSearchRadio() {
    var $selects = $(this).parents('form').find('select');
    $(this).parents('form').find('input[type=radio]:checked').val()=='submissions'
        ? $selects.removeAttr('disabled')
        : $selects.attr('disabled', true);
}
function bindSaveChanges() {
    var newColumnAdded = addColumnToConfig();
    newColumnAdded 
        ? function() { 
            buildConfigToUI(true); 
            makeItemActive(new Fn().getFromStorage('config').length-1); 
        }()
        : buildConfigToUI();
    $('.sub-group-controls').remove();
    $('#controls').modal('hide');
}
function bindPreventEnterButton() {
    if (event.which == 13) {
        var fn = new Fn();
        event.preventDefault();
        fn.getBlurred();
        $(this).parent().parent().parent().find('select').focus();
    }
}
function bindRedditSearch(callback) {
    event.preventDefault();
    var query = $(this.form).find('.reddit-search-input.tt-input').val(), 
        fn = new Fn();
    if (query) {
        $('#controls').modal('hide');
        var radio = $(this.form).find('input[type=radio]:checked').val(),
            sorted_by = $(this.form).find('select.sorted-by').val(),
            links_from = $(this.form).find('select.links-from').val();
        radio == "subreddits"
            ? subredditsSearchAPI({query: query, errorLoc:$(this.form).find('.reddit-search-input.tt-input')})
            : submissionsSearchAPI({query: query, sorted_by:sorted_by, links_from:links_from, errorLoc:$(this.form).find('.reddit-search-input.tt-input'), callback: callback});
    }
    fn.getBlurred();
}
function bindRefreshCommentSwitch(columnNum) {
    event.preventDefault();
    var $icon = $(this).find('i');
    $icon.toggleClass('fa-toggle-on fa-toggle-off');
    if ($icon.hasClass('fa-toggle-on')) getCommentsForColumn(new Fn().getFromStorage('config')[columnNum], columnNum);
    toggleRefresh(columnNum);
}
function bindGetCommentsForColumn(columnNum) {
    event.preventDefault();
    getCommentsForColumn(new Fn().getFromStorage('config')[columnNum], columnNum);
}
function bindColumnBars(columnNum) {
    event.preventDefault();
    var $columnOptions = $(".column-options[data-column="+columnNum+"]");
    if ($columnOptions.hasClass('hide')) {
        $columnOptions.removeClass('hide');
        column_options_height(columnNum);
        frame_content_height();
        $(".edit-form[data-column="+columnNum+"] .subreddit-group-edit").each(function(index) {
            var inputVal = $(this).find('.subreddit-edit.tt-input').val(),
                $thread = $(this).find('.thread-edit'),
                threadval = $thread.val(), column = $thread.data('column');
            if (inputVal !== '' && threadval===null) { // existing subreddit thread needs to be populated
                var thread = '.edit-form[data-column='+column+'] .thread-edit';
                getPosts('/r/'+inputVal, '', '', {target: [thread,index,column], errorMsgLoc: this, callback: setThreads});
            }
        });
    } else {
        showAllColumnOptions(columnNum);
        $columnOptions.addClass('hide');
        column_options_height(columnNum, 0);
    }
}
function bindManageThreads(columnNum) {
    event.preventDefault();
    var $edit_form = $('.edit-form[data-column='+columnNum+']');
    !$(this.nextElementSibling).hasClass('hide') ? showAllColumnOptions(columnNum) : showColumnOption($edit_form, columnNum);
    frame_content_height(columnNum);
}
function bindSettings(columnNum) {
    event.preventDefault();
    var $settings_form = $('.settings-tab[data-column='+columnNum+']');
    !$(this.nextElementSibling).hasClass('hide') ? showAllColumnOptions(columnNum) : showColumnOption($settings_form, columnNum);
}
function bindWriteComment(columnNum) {
    event.preventDefault();
    var $write_comment = $('.write-comment[data-column='+columnNum+']'),
        targetContext = '.write-comment[data-column='+columnNum+']', fromContext = '.edit-form[data-column='+columnNum+']';
    setPostThreads(targetContext, fromContext);
    !$(this.nextElementSibling).hasClass('hide') ? showAllColumnOptions(columnNum) : showColumnOption($write_comment, columnNum);
    frame_content_height(columnNum);
}
function bindDeleteColumnButton(columnNum) {
    event.preventDefault();
    $('#delete-column').data('column', columnNum);
    $('#column-to-delete').text(new Fn().getFromStorage('config')[columnNum].settings.name);
    $('#delete-column-modal').modal();
}
function bindHelpModal() {
    $('#help-modal').modal('show');
}
function bindToggleCommentOptions() {
    var extensions = $(this).parents('.media-body:first').find('header:first, footer:first'),
        isHide = extensions.hasClass('hide');
    $('.media-body header, .media-body footer').addClass('hide');
    if (isHide) {
        extensions.removeClass('hide');
    }
}
function stopProp(event) {
    event.stopPropagation();
}