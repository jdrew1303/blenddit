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
        if (ready) initialize();
    },
    scriptErrorEvent = function(evt) { // CDN broke, use local
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
    },
    cssErrorEvent = function(evt) {
        console.error('Error loading resource: '+evt.srcElement.href);
        removeBroken('link', evt.srcElement.href);
    },
    firstTime = true,
    scripts = {
        'jqueryCDN' : window.location.protocol+'//ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js',
        'bootstrapCDN' : window.location.protocol+'//maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js',
        'pjaxCDN' : window.location.protocol+'//cdnjs.cloudflare.com/ajax/libs/jquery.pjax/1.9.6/jquery.pjax.min.js',
        'typeaheadCDN' : window.location.protocol+'//cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.10.5/typeahead.bundle.min.js',
        'jqueryLocal' : 'static-assets/js/jquery-2.1.3.min.js',
        'bootstrapLocal' : 'static-assets/js/bootstrap.min.js',
        'pjaxLocal' : 'static-assets/js/jquery.pjax.min.js',
        'typeaheadLocal' : 'static-assets/js/typeahead.bundle.min.js' 
    },
    styles = {
        'app' : 'static-assets/css/'+(getMetaValue('debug')=='true' ? 'app.css' : 'all.css')+'?v='+getMetaValue('version'),
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
    setCookie : function(cname, cvalue) {
        document.cookie = cname + "=" + encodeURIComponent(cvalue) + ";";
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
    getBlurred : function() {
        document.activeElement.blur();
        $('input').blur();
    },
    cookieExists : function(cname) {
        return this.getCookie(cname) ? true : false;
    },
    brokenImage : function(img) {
        $(img).parents('.media a').empty().append(new Tmpl().ap());
    },
    getFromCookie : function(item) { 
        return item == 'config' 
            ? this.cookieExists(item) ? JSON.parse(this.getCookie(item)) : []
            : this.cookieExists(item) ? JSON.parse(this.getCookie(item)) : {}
    },
    setInCookie : function(name, item) { this.setCookie(name, JSON.stringify(item));}
}

// Tmpl (Template) utility object
var Tmpl = function() {};
Tmpl.prototype = {
    a : function(thing) {
        return ["<li class='list-group-item'>",
                    "<div class='input-group'>",
                        "<input class='form-control' type='text' value='"+thing+"'></input>",
                        "<span class='input-group-addon'><i class='fa fa-close'></i></span>",
                "</div></li>"].join('');
    },
    b : function(thing, timeElapsed) {
        return ["<li data-subid="+thing.subreddit_id+" data-subreddit="+thing.subreddit+" data-thread="+thing.permalink,
                    " data-threadid="+thing.id+" class='list-group-item nopacity'>",
                    thing.title,
                    " <span class='text-primary'>in /r/"+thing.subreddit+"</span>",
                    "<span class='badge pull-right'>"+timeElapsed+"</span>",
                "</li>"].join('');
    },
    c : function(ulClass, btnArr) {
        var buttons = function() {
            var htmlString = "";
            btnArr.forEach(function(arr){
                htmlString += "<a class='btn "+arr[0]+"'><i class='fa fa-"+arr[1]+" fa-2x'></i></a>";
            }); return htmlString; }();
        return ["<ul class='list-group controls "+ulClass+"'>",
                    "<li class='list-group-item controls'>",
                        "<div class='btn-group'>",
                            buttons,
                        "</div>",
                    "</li>",
                "</ul>"].join('');
    },
    d : function(columnNum) {
        return ["<div class='form-group'>",
                    "<label class='control-label label-width'>Threads <span class='info-edit label label-default pull-right'>Info</span></label>",
                    "<select data-column='"+columnNum+"' class='form-control thread-edit'></select>",
                "</div>"].join('');
    },
    e : function() {
        return ["<div class='form-group'>",
                    "<label class='control-label label-width'>Subreddit <span class='label label-danger delete-edit pull-right'>Delete</span></label>",
                    "<input type='text' class='form-control subreddit-edit' placeholder='Enter a subreddit'>",
                "</div>"].join('');
    },
    f : function(subreddit, threads) { return "<div class='subreddit-group-edit'>"+subreddit+threads+"</div>"; },
    g : function(settings) {
        return ["<form action='javascript:void(0);' class='edit-column-settings'>"+settings,
                    "<input type='submit' class='hide'>",
                "</form>"].join('');
    },
    h : function(navTabType, addThreadTab, settingsTab, postTab) {
        return ['<ul class="nav nav-tabs">',
                    '<li class="active"><a href="#'+navTabType+'-add" data-toggle="tab">Add</a></li>',
                    '<li><a data-toggle="tab" href="#'+navTabType+'-settings">Settings</a></li>',
                    (postTab ? '<li class="post-tab"><a data-toggle="tab" href="#'+navTabType+'-post">Post</a></li>' : ''),
                '</ul>',
                '<div class="tab-content">',
                    '<div class="tab-pane fade active in" id="'+navTabType+'-add">'+addThreadTab+'</div>',
                    '<div class="tab-pane fade" id="'+navTabType+'-settings">'+settingsTab+'</div>',
                    (postTab ? '<div class="tab-pane fade" id="'+navTabType+'-post">'+postTab+'</div>' : ''),
                '</div>'].join('');
    },
    i : function(num) { return "<div data-column='"+num+"' class='frame-content nopacity'></div>"; },
    j : function(num) {
        return ["<div data-column='"+num+"' class='btn-group column-bars'>",
                    "<a class='btn'>",
                        "<i data-column='"+num+"' class='fa fa-bars fa-lg'></i>",
                    "</a>",
                "</div>"].join('');
    },
    l : function(num, configObj, icons, frameContent) {
        return ["<i data-column='"+num+"' class='nopacity loading fa fa-refresh fa-spin fa-2x'></i>",
                "<div class='frame-overlay' data-column='"+num+"'>",
                    "<div data-column='"+num+"' class='frame'>",
                        "<h6 class='frame-header'>"+(configObj.type=='reddit'
                            ?"<i class='fa fa-reddit fa-lg'></i> ":"<i class='fa fa-twitter'></i> ")+configObj.settings.name,
                        "</h6>",
                        icons,
                    "</div>",
                "</div>"+this.p(num)+frameContent].join('');
    },
    m : function(frame) { return "<div class='frame-container'>"+frame+"</div>"; },
    n : function(num, configObj, frameContainer) {
        return "<div data-column='"+num+"' data-type='"+configObj.type+"' class='frame-position nopacity'>"+frameContainer+"</div>";
    },
    o : function(num, framePosition) {
        return "<div data-column='"+num+"' class='item "+(num===0?'active':'')+"'>"+framePosition+"</div>";
    },
    p : function(columnNum) {
        return ['<div data-column="'+columnNum+'" class="hide column-options btn-group" style="height:0;">',
                    '<a data-column="'+columnNum+'" class="btn column-option teal manage-threads">',
                        '<i class="fa fa-newspaper-o fa-2x"></i>',
                        '<p>THREADS</p>',
                    '</a>',
                    '<form action="javascript:void(0);" data-column="'+columnNum+'" class="hide edit-form teal">',
                        '<input data-column="'+columnNum+'" type="submit" class="hide">',
                    '</form>',
                    '<a data-column="'+columnNum+'" class="btn column-option darkgoldenrod settings-switch">',
                        '<i class="fa fa-cog fa-2x"></i>',
                        '<p>SETTINGS</p>',
                    '</a>',
                    '<div data-column="'+columnNum+'" class="hide settings-tab darkgoldenrod"></div>',
                    '<a data-column="'+columnNum+'" class="btn column-option write-comment-switch cornflowerblue">',
                        '<i class="fa fa-pencil fa-2x"></i>',
                        '<p>WRITE COMMENT</p>',
                    '</a>',
                    '<div data-column="'+columnNum+'" class="hide write-comment cornflowerblue"></div>',
                    '<a data-column="'+columnNum+'" class="refreshSwitch btn column-option slateblue">',
                        '<i class="fa fa-toggle-on fa-2x"></i>',
                        '<p>AUTO REFRESH</p>',
                    '</a>',
                    '<a data-column="'+columnNum+'" class="trash btn column-option darkred">',
                        '<i class="fa fa-trash fa-2x"></i>',
                        '<p>DELETE COLUMN</p>',
                    '</a>',
                '</div>'].join('');
    },
    q : function(i) {
        return ['<div id="collapse'+i+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading'+i+'">',
                    '<div class="panel-body"></div>',
                '</div>'].join('');
    },
    r : function(header, body) { return '<div class="panel panel-default nopacity">'+header+body+'</div>'; },
    s : function(infoClass, threadClass) {
        return ["<div class='form-group'>",
                    "<label class='control-label label-width'>Threads <span class='"+infoClass+" label label-default pull-right'>Info</span></label>",
                    "<select class='form-control "+threadClass+"'></select>",
                "</div>"].join('');
    },
    t : function(deleteClass, subClass) {
        return ["<div class='form-group'>",
                    "<label class='control-label label-width'>Subreddit <span class='"+deleteClass+" label label-danger pull-right'>Delete</span></label>",
                    "<input type='text' class='form-control "+subClass+"' placeholder='Enter a subreddit'>",
                "</div>"].join('');
    },
    u : function(groupClass, subreddit, threads) { return "<div class='"+groupClass+" nopacity'>"+subreddit+threads+"</div>"; },
    v : function(post) {
        return ["<option data-subid='"+post.data.subreddit_id+"' data-threadtitle='"+post.data.title+"' data-threadid='"+post.data.id+"' value='"+post.data.permalink+"'>",
                    post.data.title,
                "</option>"].join('');
    },
    w : function(threadObj) {
        return ["<option data-subid='"+threadObj.subid+"' data-threadtitle='"+threadObj.threadtitle+"' data-threadid='"+threadObj.threadid+"' value='"+threadObj.thread+"'>",
                    threadObj.threadtitle,
                "</option>"].join('');
    },
    x : function(isTopLevel) {
        return ["<div class='reply-buttons'>",
                    "<button class='cancel-reply btn btn-default'>Cancel</button>",
                    "<button type='submit' class='save-reply btn "+(isTopLevel ? 'btn-default' : 'btn-primary')+"'>Save</button>",
                "</div>"].join('');
    },
    y : function(thing_id) { return "<input type='hidden' name='thing_id' value='"+thing_id+"'>"; },
    z : function(author, isTopLevel) {
        return [(isTopLevel ? "<label>Comment</label>" : ""),
                "<textarea name='text' class='form-control textarea-reply'",
                    "placeholder='"+(!isTopLevel ? 'Reply to '+author+'..' : 'Write a comment')+"'></textarea>"].join('');
    },
    aa : function(parentInput, textarea, buttons, topLevel) {
        return ["<div class='"+(!topLevel ? 'nopacity hide' : 'isTopLevel')+" reply-form'>",
                    "<div class='submitting nopacity hide'>"+(topLevel ? "<b><span class='black'>Submitting...</span></b>" : "Submitting...")+"</div>",
                    "<form action='javascript:void(0)'>"+parentInput+textarea+buttons+"</form>",
                "</div>"].join('');
    },
    ab : function(newRepliesNum) { return "<a class='btn new-comment'><span class='text-primary diff'>"+newRepliesNum+" new</span></a>"; },
    ac : function(replyLength) {
        return ["<span class='reply-num text-warning'>"+replyLength+"</span>",
                "<span class='text-warning'>&nbsp;<i class='fa expand fa-plus-square'></i>&nbsp;</span>"].join('');
    },
    ad : function(name, replyLength) { return "<a data-name='"+name+"' data-replylength='"+replyLength+"' class='btn reply'></a>"; },
    ae : function(comment, replyLength, timeElapsed, permaLink, replyForm) {
        return ["<footer data-id='"+comment.data.name+"' class='comment-footer'>",
                    "<div class='links-container btn-group'>",
                        "<a data-created-utc='"+comment.data.created_utc+"' class='btn time-elapsed white'>"+timeElapsed+"</a>",
                        "<a class='btn reply-switch'><i class='fa fa-reply fa-lg'></i></a>",
                        "<a class='btn perma' href='"+permaLink+"' target='_blank'><i class='fa fa-link fa-lg'></i></a>",
                        "<a class='btn refresh-comment' data-linkid='"+comment.data.link_id+"' data-id='"+comment.data.name+"'><i class='fa fa-refresh fa-lg'></i></a>",
                        (replyLength!==0 ? this.af(comment, replyLength) : ''),
                    "</div>",
                    replyForm,
                "</footer>"].join('');
    },
    af : function(comment, replyLength) {
        return ["<a data-name='"+comment.data.name+"' data-replylength='"+replyLength+"' class='btn reply'>",
                    "<span class='reply-num text-warning'>"+replyLength+"</span>",
                    "<span class='text-warning'>&nbsp;<i class='fa expand fa-plus-square'></i>&nbsp;</span>",
                "</a>"].join('');
    },
    ag : function(comment, text) {
        return ["<div class='media-heading btn-group'>",
                    "<a data-id='"+comment.data.name+"' class='btn vote up'><i class='fa fa-arrow-up'></i></a>",
                    "<a data-id='"+comment.data.name+"' class='score btn'>"+comment.data.score+"</a>",
                    "<a data-id='"+comment.data.name+"' class='btn vote down'><i class='fa fa-arrow-down'></i></a>",
                    "<a class='btn from-sub' target='_blank' href='"+window.location.protocol+"//www.reddit.com/r/"+comment.data.subreddit+"'>"+comment.data.subreddit+"</a>",
                    "<a class='btn author' href='"+window.location.protocol+"//www.reddit.com/u/"+comment.data.author+"' target='_blank'>"+comment.data.author+"</a>",
                    (comment.data.author_flair_css_class ? "<a class='flair btn'>"+comment.data.author_flair_css_class+"</a>" : "&nbsp;"),
                "</div>"+text].join('');
    },
    ah : function(comment, text) {
        return ["<div class='load-comments' data-parent='"+comment.data.parent_id+"' class='load-comments'>",
                    "<i class='fa fa-download'></i>&nbsp; load more comments",
                "</div>"+text].join('');
    },
    ai : function(heading) { return "<div class='media-body'>"+heading+"</div>"; },
    aj : function(isParent, icon) { return "<div class='thumb pull-left "+(isParent ? icon : '')+"'></div>";},
    ak : function(comment, icon, isParent, optionalNopacity, thumbnail, body, hide) {
        return ["<div data-parentid='"+comment.data.parent_id+"' data-linkid='"+comment.data.link_id+"' ",
                    "data-icon='"+icon+"' id='"+comment.data.name+"' ",
                    "class='media"+(isParent ? ' parent ' : hide ? ' hide' : '')+""+(optionalNopacity ? ' nopacity' : '')+"'>",
                    thumbnail+body,
                "</div>"].join('');
    },
    al : function() {
        return ['<li class="list-group-item">',
                    '<div class="input-group">',
                        '<input class="form-control" type="text"><span class="input-group-addon"><i class="fa fa-close"></i></span>',
                    '</div>',
                '</li>'].join('');
    },
    am : function() { return '<div class="form-group"><label>Thread</label><select class="form-control post-thread"></select></div>';},
    an : function(url, title) { return '<a target="_blank" href="'+url+'">'+title+'</a>'; },
    ao : function(obj, timeElapsed) {
        return ["<li class='media' data-subreddit='"+obj.data.subreddit+"' data-thread='"+obj.data.permalink+"' ",
                        "data-id='"+obj.data.id+"' data-subid='"+obj.data.subreddit_id+"'>",
                    "<a class='subreddit-thumb pull-left' href='#'>",
                        (obj.data.thumbnail && obj.data.thumbnail != 'self'
                            ? "<img class='media-object' height='70' width='70' src='"+window.location.protocol+obj.data.thumbnail.substr(5)+"' alt='error' onerror='(function(ctx){ new Fn().brokenImage(ctx);})(this)'>"
                            : this.ap()),
                    "</a>",
                    "<div class='media-body'>",
                        "<h4 class='media-heading'>"+obj.data.title+"<span class='badge pull-right'>"+obj.data.score+"</span></h4>",
                        "<p>Submitted "+timeElapsed+" ago by "+obj.data.author+" to /r/"+obj.data.subreddit,
                        " | <span class='text-warning'>"+obj.data.num_comments+" comments</span></p>",
                    "</div>",
                "</li>"].join('');
    },
    ap : function() { return '<div class="subreddit-thumb-alt center-containing"><i class="fa fa-reddit fa-3x"></i></div>'; },
    aq : function(obj, timeElapsed) {
        return ["<li class='media' data-id='"+obj.data.id+"' data-subreddit='"+obj.data.display_name+"'>",
                    "<a class='subreddit-thumb pull-left' href='#'>&nbsp</a>",
                    "<div class='media-body'>",
                        "<h4 class='media-heading'><span class='text-warning'>/r/"+obj.data.display_name+"</span> : "+obj.data.title+"</h4>",
                        "<p>"+obj.data.public_description+"</p>",
                        "<p>"+(obj.data.subscribers ? parseInt(obj.data.subscribers).toLocaleString()+' subscribers, a community for '+timeElapsed : "A community for "+timeElapsed)+"</p>",
                    "</div>",
                "</li>"].join('');
    }
}

function initialize() {
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
            clearTimeout(popoverState.timeoutId);
            $(this).popover('show');
            popoverState.timeoutId = setTimeout(function(){
                $(that).popover('hide');
            }, closeTime);
        };
        $.fn.hasWidthOverflowed = function(){
            return this.length > 0 ? this[0].scrollWidth > this[0].clientWidth : false;
        };
        $.fn.hasHeightOverflowed = function() {
            return this.length > 0 ? this[0].scrollHeight > this[0].clientHeight : false;
        };
        document.getElementsByDataAttribute = function(className, dataAttr, dataValue) {
            var nodeList = document.querySelectorAll(className), nodeArray = [];
            nodeList.forEach(function(node) {
                if (node.getAttribute(dataAttr)==dataValue) nodeArray.push(node);    
            })
            return nodeArray;
        }
        NodeList.prototype.forEach = HTMLCollection.prototype.forEach = function(callback) {
            for (var i = 0, len = this.length; i < len; i++) {
                if (callback) callback(this[i], i);
            }
        }
    })();
    var config,
        watch,
        redditNames = new Bloodhound({
              datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
              queryTokenizer: Bloodhound.tokenizers.whitespace,
              remote: {
                  url : '/search-reddit-names?query=%QUERY',
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
    function pjx() {
        $(document).pjax('a[data-pjax]', '#pjax-container');
        $(document).on('pjax:send', function() {});
        $(document).on('pjax:end', function() {
                if ($('#listsjs').length>0) { listsjs();
                } else if ($('#blenddit').length>0) { blenddit();
                } else {
                    $('.teams').hide();
                    $('#sidebarTrigger').hide();
                    $('.navbar-fixed-top').show();
                    $('.navbar-brand > .text-warning').text('kurtlocker.org');
                    $('.social').show();
                    $('html, body').removeClass('noverflow');
                }
        });
    }
    function sidebarTrigger() {
        $('#sidebarTrigger').unbind('click').click(function(e) { // sidebar toggle
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
        });
    }
    function listsjs() {
        if ($('#listsjs').length>0) {
            sidebarTrigger();
            $('#sidebarTrigger').show();
            $('.navbar-brand > .text-warning').text('[ l [ i [ s ] t ] s ]');
            $('div.js').each(function(i, block) { // code hightlight
                $(block).text($(block).text().trim());
                 hljs.highlightBlock(block);
            });
              $('.sidebarFunc').unbind('click').click(function() {
                  $('.sidebarFunc').removeClass('blue-dotted');
                  $(this).addClass('blue-dotted');
                  $('.nav-tabs').removeClass('blue-dotted');
                  $('#function-'+$(this).attr('num')).addClass('blue-dotted');
                  $("html, body").animate({ scrollTop: $('#function-'+$(this).attr('num')).offset().top-60 }, 500);
                  if ($('#wrapper').hasClass('toggled')) $("#wrapper").toggleClass("toggled");
              });
              $('#page-content-wrapper').unbind('click').click(function() {
                  if ($('#wrapper').hasClass('toggled')) $("#wrapper").toggleClass("toggled");
              });
              $('.navbar-fixed-top, .navbar-fixed-bottom').removeClass('hide');
        }
    }
    function blenddit() {
        if ($('#blenddit').length>0) {
            var fn = new Fn();
            $('.teams').show(); $('.social').hide();
            $('.navbar-fixed-bottom').removeClass('hide');
            !$('.navbar-fixed-top').hasClass('hide') ? $('.navbar-fixed-top').addClass('hide'):void 0;
            $('.open-controls').unbind('click').click(function() {launchControls();});
            $('.help').unbind('click').bind('click', function() {
                console.log('help modal');
            });
            $('#delete-column').unbind('click').click(function() {
                fn.remove(config, $(this).data('column'));
                deleteRefresh($(this).data('column'));
                fn.setInCookie('config', config);
                buildConfigToUI(true);
            });
            $('#carousel').unbind('slid.bs.carousel').bind('slid.bs.carousel', function () {
                autoRefreshOnlyActiveColumn();
            });
            window.autoRefreshState = true;
            config = fn.getFromCookie('config');
            watch = fn.getFromCookie('watch');
            visibilityChange();
            $('[data-toggle="tooltip"]').tooltip();
            $('#reddit-results-collapse, #reddit-greeting-collapse, #reddit-modal-collapse').collapse({'toggle': false});
            redditNames.initialize();
            startBlending();
            contentResizeEvent();
            redditSearch('#reddit-greeting-collapse', true);
            redditSearch('#reddit-results-collapse');
            redditSearch('#search-control-panel', false, function(){ $('#controlModal').modal('hide'); });
            redditSearchRadio();
            columnsOrHomeButton();
        }
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
            config.forEach(function(obj, i) {
                var frameContentExists = $('.frame-content[data-column='+i+']').length > 0;
                typeof exceptNum !== 'undefined' && i == exceptNum && frameContentExists
                    ? typeof window['r'+i] === 'undefined' ? toggleRefresh(i, true) : void 0 // exceptNum case - allow this column to continue refreshing (if toggled on)
                    : frameContentExists ? toggleRefresh(i, false) : void 0; // turn off this column's autorefresh and clear interval 
            });
        } else {
            config.forEach(function(obj, i) {
                var frameContentExists = $('.frame-content[data-column='+i+']').length > 0;
                if (frameContentExists && typeof window['r'+i] === 'undefined') toggleRefresh(i, true); 
            }); // turn on all column auto refresh (if toggled on)
        }
    }
    function columnsOrHomeButton() {
        function buttonType() {
            var type;
            if ($('#greeting').hasClass('hide')) { $('.columns-or-home i').removeClass('fa-columns').addClass('fa-home'); type = 'home';
            } else { $('.columns-or-home i').removeClass('fa-home').addClass('fa-columns'); type = 'columns'; }
            return type;
        } buttonType();
        $('.columns-or-home').unbind('click').bind('click', function() {
            var type = buttonType();
            if (type=='columns') {
                config.length > 0
                    ? buildConfigToUI() : $(this).parent().launchPopOver(3000,
                    popOverOptions('top','No columns','Build at least one column to view columns.'));
            } else { // type home
                $('#watch-threads .list-group.contain').children().length===0 ? watchList() : '';
                showFeature('#greeting');
                buttonType();
            }
        });
    }
    function redditSearchRadio() {
        $('form.reddit-search input[type=radio]').unbind('click').bind('click', function() {
           var $selects = $(this.form).find('select');
           $(this.form).find('input[type=radio]:checked').val()=='submissions'
            ? $selects.removeAttr('disabled')
            : $selects.attr('disabled', true);
        });
    }
    function redditSearch(parent, trigger, callback) {
        if (!$(parent+' .reddit-search-input').hasClass('tt-input')) typeAheadReddit(parent+' .reddit-search-input');
        $(parent+' .reddit-search-submit').unbind('click').bind('click', function() {
            var query = $(parent+' .reddit-search-input.tt-input').val(), fn = new Fn();
            if (query) {
                var radio = $(this.form).find('input[type=radio]:checked').val(),
                    sorted_by = $(this.form).find('select.sorted-by').val(),
                    links_from = $(this.form).find('select.links-from').val();
                radio == "subreddits"
                    ? subredditsSearchAPI({query: query, errorLoc:$(this.form).find('.reddit-search-input.tt-input'), callback: callback})
                    : submissionsSearchAPI({query: query, sorted_by:sorted_by, links_from:links_from, errorLoc:$(this.form).find('.reddit-search-input.tt-input'), callback: callback});
            }
            fn.getBlurred();
        });
        if (trigger) $(parent+' .reddit-search-submit').trigger('click');
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
            if (obj.callback) obj.callback();
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
            .typeahead('val', query);
        if (obj && obj.errorLoc !== window && obj.errorLoc !== null) {
            var $form = obj.errorLoc.parents('form'),
                radioType = $form.find('input[type=radio]:checked').val(),
                sortedBy = $form.find('select.sorted-by').val(),
                linksFrom = $form.find('select.links-from').val();
            $('form.reddit-search').each(function(i, form) {
                $(form).find('input[type=radio][value='+radioType+']').prop('checked',true).trigger('click');
                $(form).find('select.sorted-by option[value='+sortedBy+']').prop('selected',true);
                $(form).find('select.links-from option[value='+linksFrom+']').prop('selected',true);
            });
        }
        $('#reddit-results-collapse').collapse('hide');
    }
    function noResults(jqXHR, textStatus, errorThrown, obj) {
        if (jqXHR.status==403) {
            $('#subreddit-container .reddit-search-input.tt-input').val(obj.query);
            window.scrollTo(0, 0);
            $('#reddit-search-results').launchPopOver(5000,
                popOverOptions('bottom','','This subreddit is private and you do not have access to view it.')); return;
        }
        subredditsSearchAPI(obj);
    }
    function bindLoadMore(after, type, objParam, resetCount) {
        var $media_more = $('.media-more li');
        $media_more.data('after', after); $media_more.data('type', type); $media_more.data('query', objParam.query); 
        resetCount ? $media_more.data('count',25) : $media_more.data('count',$media_more.data('count')+25);
        $('.media-more li').unbind('click').bind('click', function() {
            var type = $(this).data('type'),
                url = type == 'thread' 
                    ? objParam.url+'?count='+$(this).data('count')+'&after='+$(this).data('after')
                    : objParam.url+'&count='+$(this).data('count')+'&after='+$(this).data('after'),
                fn = type == 'thread' || type == 'submissions'
                    ? function(data, textStatus, jqXHR, obj) {
                        if (obj.previousAfter) {
                            threadResults(data, objParam, true, type);
                            $('#subreddit-container .media[data-id='+obj.previousAfter.substr(3)+']')[0].scrollIntoView();
                            bindLoadMore(data.data.after, type, objParam);
                        } else {
                            $('.media-more li').unbind('click');
                        }
                    }
                    : function(data, textStatus, jqXHR, obj) {
                        if (obj.previousAfter) {
                            subredditsMatching(data, objParam.query, true);
                            $('#subreddit-container .media[data-id='+obj.previousAfter.substr(3)+']')[0].scrollIntoView();
                            bindLoadMore(data.data.after, type, objParam);
                        } else {
                            $('.media-more li').unbind('click');
                        }
                    };
            genericGet(url, fn, undefined, undefined, false, this, {query: objParam.query, previousAfter: $(this).data('after')});            
        });
    }
    function subredditsMatching(data, query, loadMore) {
        showFeature('#subreddit-container');
        window.scrollTo(0, 0);
        $('#subreddit-result-title').text('Subreddits matching "'+query+'"..');
        columnsOrHomeButton();
        buildRedditMedia(data, 't5', loadMore);
        bindSubList();
    }
    function threadResults(data, obj, loadMore, type) {
        showFeature('#subreddit-container');
        window.scrollTo(0, 0);
        type == 'submissions'
            ? $('#subreddit-result-title').text('Submissions matching "'+obj.query+'"..') 
            : $('#subreddit-result-title').text('/r/'+obj.query);
        columnsOrHomeButton();
        buildRedditMedia(data, 't3', loadMore);
        bindThreadResults();
    }
    function buildRedditMedia(data, type, loadMore) {
        var html = new Tmpl(),
            $mediaList = $('#subreddit-container .media-results');
        if (loadMore===false) $mediaList.children().remove();
        if (type == 't3') { // we're building a list of threads
            data.data.children.forEach(function(thread, i) {
                $mediaList.append(html.ao(thread, getTimeElapsed(thread.data.created_utc)));
                fadeIn($('#subreddit-container .media-results li:last-child'), 100+(i*50), 'opacity-7');
            });
        } else if (type == 't5') {
            data.data.children.forEach(function(sub, i) {
                $mediaList.append(html.aq(sub, getTimeElapsed(sub.data.created_utc)));
                fadeIn($('#subreddit-container .media-results li:last-child'), 100+(i*50), 'opacity-7');    
            });
        }
    }
    function bindSubList() {
        $('.media-results li').unbind('click').bind('click', function() {
            copyToAllRedditSearches($(this).data('subreddit'));
            threadsOfSubreddit($(this).data('subreddit'));
        });
    }
    function bindThreadResults() {
        $('.media-results li').unbind('click').bind('click', function() {
            var threadObj = {}, data = {};
            data.subreddit_id = $(this).data('subid');
            data.subreddit = $(this).data('subreddit');
            data.permalink = $(this).data('thread');
            data.id = $(this).data('id');
            data.title = $(this).find('h4').text();
            threadObj.data = data;
            addToConfigObj(buildRedditConfigObjByThreads([threadObj]));
            configObjAction();
            makeItemActive(config.length-1);
        });
    }
    function typeAheadReddit(inputSelector, completeFn) {
        $(inputSelector).typeahead(null, {
          name: 'reddit-names',
          displayKey: 'value',
          source: redditNames.ttAdapter()
        }).on('typeahead:selected typeahead:autocompleted', function(){
            if (completeFn) completeFn(this);
        });
    }
    function startBlending() {
        var subredditURI = $('#reddit-uri').data('subreddituri'),
            threadIdURI = $('#reddit-uri').data('threadiduri'),
            threadIdsURI = $('#reddit-uri').data('threadidsuri');
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
    function configObjAction() {
        if (config.length > 0) {
            $('.carousel-inner').children().remove();
            buildConfigToUI();
        } else {
            showFeature('#greeting');
            watchList();
        }
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
                ? children[0].data.title.substring(0,22)+' ...' 
                : children[0].data.title
            : "My Column";
        settings.refreshRate = "60";
        settings.sortBy = "new";
        configObj.type = "reddit";
        configObj.settings = settings;
        configObj.threads = threads;
        return configObj;
    }
    function popOverOptions(paramPlacement, paramTitle, paramContent) {
        return {placement:paramPlacement, title:paramTitle,content:paramContent, trigger:'manual'};
    }
    function watchList() {
        var localWatch;
        Object.keys(watch).length
            ? localWatch = watch
            : localWatch = {
                subs:['nfl','nba', 'mlb', 'nhl', 'mls', 'hockey', 'soccer','collegebasketball'], 
                match:['Game Thread','Match Thread','Live Thread']};
        buildWatchList(localWatch);
        fetchWatchThreads(localWatch.match);
        bindDeleteWatchButtons();
        bindWatchSave();
        bindWatchAdd();
        bindWatchRefresh();
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
                    bindWatchThreads();
                });
            }});
        });
    }
    function bindDeleteWatchButtons() {
        $('#watch-subreddits .input-group-addon, #watch-matching .input-group-addon').unbind('click').click(function() {
            $(this).parent().parent().remove();
        });
    }
    function bindWatchAdd() {
        $('#watch-subreddits .btn.add').unbind('click').bind('click', function() {
            $('#watch-subreddits .list-group.contain').append(new Tmpl().al);
            bindDeleteWatchButtons();
        });
        $('#watch-matching .btn.add').unbind('click').bind('click', function() {
            $('#watch-matching .list-group.contain').append(new Tmpl().al);
            bindDeleteWatchButtons();
        });
    }
    function bindWatchRefresh() {
        $('#watch-threads .btn.refresh').unbind('click').bind('click', function() {
            saveWatchList();
            watchList();
        });
    }
    function bindWatchSave() {
        $('#watch-subreddits .btn.save, #watch-matching .btn.save, #watch-threads .btn.save').unbind('click').bind('click', function() {
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
                        makeItemActive(config.length-1);
                    } else {
                        $('#watch-threads .list-group-item.controls').launchPopOver(3000,
                            popOverOptions('top','Verification', 'Please select at least one thread from the list.'));
                    }
                }
            }
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
        watch = watchList;
        new Fn().setInCookie('watch', watch);
    }
    function bindWatchThreads() {
        $('#watch-threads .list-group-item').unbind('click').click(function() {
            $(this).hasClass('white') ? $(this).removeClass('white') : $(this).addClass('white');
        });
    }
    function buildWatchInputOrThreadHtmlString(thing, type) {
        var html = new Tmpl();
        return  type == 'input'
            ? html.a(thing)
            : html.b(thing, getTimeElapsed(thing.created_utc));
    }
    function contentResizeEvent() {
        window.height = window.innerHeight;
        window.width = window.innerWidth;
        carousel_inner_height();
        frame_content_height();
        autoRefreshOnlyActiveColumn();
        $(window).unbind('resize').bind('resize', function(){
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
        bindControlPanelButtons();
        bindAccounts();
        $('#save-changes').unbind('click').bind('click',function() {
            var newColumnAdded = addColumnToConfig();
            newColumnAdded 
                ? function() { buildConfigToUI(true); makeItemActive(config.length-1); }()
                : buildConfigToUI();
        });
        $('#controlModal').modal();
    }
    function bindControlPanelButtons() { 
        bindAddThreadButton('#reddit','column-settings', 'sub-group-controls', 'subreddit-controls', 'thread-controls', 'delete-controls', 'info-controls');
        bindDeleteColumns();
        var $allButtons = $('#control-panel-buttons .list-group a');
        $('#back-button').unbind('click').bind('click', function() {
            $('#control-panel-buttons .list-group a').removeClass('active').addClass('non-active');
            $('#reddit, #accounts, #delete-columns, #search-control-panel').removeClass('active');
            $('#panel-help').addClass('active');
            $(this).addClass('hide');
        });
        $allButtons.unbind('click').bind('click', function() {
            var $allButtons = $('#control-panel-buttons .list-group a'),
                $allPanels = $('#accounts, #reddit, #delete-columns, #search-control-panel'),
                id = this.id;
            $allButtons.removeClass('active non-active'); 
            $allPanels.removeClass('active');
            $('#back-button').removeClass('hide');
            $('#panel-help').removeClass('active');
            $(this).addClass('active');
            if (id=='reddit-button') { $('#reddit').addClass('active');
            } else if (id=='twitter-button') { void 0;
            } else if (id=='accounts-button') { $('#accounts').addClass('active');
            } else if (id=='search-button') { $('#search-control-panel').addClass('active')    ;
            } else if (id=='remove-button') { $('#delete-columns').addClass('active') }
        });
    }
    function bindDeleteColumns() {
        $('#delete-columns a').unbind('click').bind('click', function() {
            var fn = new Fn();
            if (this.id=='delete-reddit-columns') {
                config = config.filter(function(obj){
                    return obj.type != 'reddit';
                });
                fn.setInCookie('config',config);
                buildConfigToUI(true);
            } else if (this.id=='delete-all-columns') {
                config = [];
                fn.setInCookie('config',[]);
                buildConfigToUI(true);
            }
            $('#controlModal').modal('hide');
        });
    }
    function bindAccounts() {
        $('#reddit-logout').unbind('click').bind('click', function() {
            genericGet('/reddit-logout', function(html) {
                $('[data-reddituser]').data('reddituser',null);
                $('#reddit-logout').replaceWith(html);
            });
        });
    }
    function addColumnToConfig() {
        var newColumnAdded = false;
        if (!$('#reddit').hasClass('hide') && new Fn().any('.thread-controls', function(x){ return !($(x).val()===null)})) {
            // Validate - Does the user have at least one thread?
            // Reset add column functionality, take back to "Add Column"
            newColumnAdded = updateConfigObjFromDOM('.sub-group-controls', '.subreddit-controls', 
                '.thread-controls', '#reddit .column-settings');
            $('#cancel-column').trigger('click');
        } return newColumnAdded;
    }
    function showColumnOption(option, columnNum) {
        hideAllColumnOptions(columnNum);
        $(option).removeClass('hide');
        $(option[0].previousSibling).removeClass('hide');
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
        if (feature == '#content-container') {
            $('html, body').addClass('noverflow');
            autoRefreshOnlyActiveColumn();
        } else { $('html, body').removeClass('noverflow'); }
    }
    function hideAllFeatures() {
        autoRefresh(false);
        $('#main-loader-container, #content-container, #greeting, #subreddit-container')
            .removeClass('faded').addClass('hide');
    }
    function buildConfigToUI(deleteFlag) {
        if (config.length===0) {
            showFeature('#greeting');
            $('#watch-threads .list-group.contain').children().length === 0 ? watchList() : void 0;
        } else {
            showFeature('#content-container');
            if ($('.carousel-inner').children().length === 0 || deleteFlag) {
                if (deleteFlag) $('.carousel-inner').children().remove();
                for (var i = 0, len = config.length; i < len; i++) {
                    buildColumn(config[i], i);
                }
            }
        }
        columnsOrHomeButton();
        contentResizeEvent();
    }
    function buildColumnOptions(configObj, columnNum) {
        var html = new Tmpl();
        var addThreadTab = function() {
            var addThread = html.c('edit-button-group', [['add-thread-button','plus-circle'],['cancel-edit-button','close'],['save-edit-button','save']]);
            for (var i = 0, len = configObj.threads.length; i < len; i++) {
                var threads = html.d(columnNum),
                    subreddit = html.e(),
                    subreddit_group = html.f(subreddit, threads);
                addThread += subreddit_group;
            } return addThread;
        }();
        var settingsTab = function() {
            var settingsButtons = html.c('edit-button-group', [['cancel-edit-button','close'],['save-edit-button','save']]),
                settingSelects = $('<div>').append($('.column-settings').children().clone().each(function() {
                var $label = $(this).find('label'); var $input = $(this).find('*[id]');
                $label.each(function(i, lab){ $(lab).attr('for', $(lab).attr('for')+'-column-'+columnNum)});
                $input.each(function(i, inp){ $(inp).attr('id', $(inp).attr('id')+'-column-'+columnNum)});
            })).html(); return html.g(settingsButtons+settingSelects);
        }();
        var postTab = html.am()+buildReplyForm("","",true);

        $(".edit-form[data-column="+columnNum+"]").append(addThreadTab);
        $(".settings-tab[data-column="+columnNum+"]").append(settingsTab);
        $(".write-comment[data-column="+columnNum+"]").append(postTab);

        bindInputLoad(columnNum);
        bindDeleteThread('delete-edit', 'subreddit-group-edit');
        bindInfoThread('info-edit');
        bindAddThreadButton('.edit-form[data-column='+columnNum+']', "edit-button-group", "subreddit-group-edit", "subreddit-edit", "thread-edit", "delete-edit", "info-edit", columnNum);
        bindCancelEdit(configObj, columnNum);
        bindSaveEdit(configObj, columnNum);
        bindSubmitSave('.edit-form[data-column='+columnNum+']', columnNum);
        bindSubmitSave('.settings-tab[data-column='+columnNum+']', columnNum);
        setSettingsFromConfig(columnNum, configObj);
        preventEnterButton();
    }
    function bindSubmitSave(context) {
        $(context).find('input[type=submit]').unbind('click').bind('click', function() {
            $(context).find('.save-edit-button').trigger('click');
        });
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
    function bindInputLoad(columnNum) {
        var $subreddit_edit = $(".edit-form[data-column="+columnNum+"] .subreddit-edit");
        $subreddit_edit.each(function(index, el) {
            this.value = config[columnNum].threads[index].subreddit;
            typeAheadReddit(el, function(element){
                var group = ".edit-form[data-column="+columnNum+"] .subreddit-edit",
                    index = $(group).parent().parent().parent().index($(element).parent().parent().parent());
                getPosts('/r/'+element.value, '', '', {target: ['.edit-form[data-column='+columnNum+'] .thread-edit',index], errorMsgLoc: element, callback: setThreads});
            });
            $(this).unbind('change').bind('change',function(){
                var group = ".edit-form[data-column="+columnNum+"] .subreddit-edit",
                    index = $(group).parent().parent().parent().index($(this).parent().parent().parent());
                getPosts('/r/'+this.value, '', '', {target: ['.edit-form[data-column='+columnNum+'] .thread-edit',index], errorMsgLoc: this, callback: setThreads});
            });
        });
    }
    function bindSaveEdit(configObj, columnNum) {
        var context = '.column-options[data-column='+columnNum+']';
        $(".column-options[data-column="+columnNum+"] .save-edit-button").unbind('click').bind('click', function() {
            updateConfigObjFromDOM(context+' .subreddit-group-edit', '.subreddit-edit', '.thread-edit', context+' .edit-column-settings', columnNum);
            buildColumn(config[columnNum], columnNum);
            makeItemActive(columnNum);
        });
    }
    function bindCancelEdit(configObj, columnNum) {
        $(".edit-form[data-column="+columnNum+"] .cancel-edit-button, .settings-tab[data-column="+columnNum+"] .cancel-edit-button").unbind('click').bind('click', function() {
            showAllColumnOptions(columnNum);
        });
    }
    function buildColumn(configObj, num) {
        $(".item[data-column="+num+"]").remove();
        var html = new Tmpl(),
            frameContent = html.i(num),
            icons = html.j(num),
            frame = html.l(num, configObj, icons, frameContent),
            frameContainer = html.m(frame),
            framePosition = html.n(num, configObj, frameContainer),
            item = html.o(num, framePosition);
        buildColumnToUI(item, num);
        bindColumnControls(num);
        buildColumnOptions(configObj, num, 'column');
        if (configObj.type=='reddit') {
            getCommentsForColumn(configObj, num);
            toggleRefresh(num);
        }
        contentResizeEvent();
        fadeIn(".frame-position[data-column="+num+"]", 100);
    }
    function deleteRefresh(columnNum) {
        clearInterval(window['r'+columnNum]);
        delete window['r'+columnNum];
    }
    function toggleRefresh(columnNum, override) {
        var condition = typeof override !== 'undefined' 
            ? $(".refreshSwitch[data-column="+columnNum+"] i").hasClass('fa-toggle-on') && override
            : $(".refreshSwitch[data-column="+columnNum+"] i").hasClass('fa-toggle-on'); 
        deleteRefresh(columnNum);
        if (condition && window.autoRefreshState) {
            window['r'+columnNum] = setInterval(function() {
                config[columnNum] ? getCommentsForColumn(config[columnNum], columnNum) : clearInterval(window['r'+columnNum]);
            }, parseInt(config[columnNum].settings.refreshRate)*1000);
        } else {
            clearInterval(window['r'+columnNum]);
        }
    }
    function buildColumnToUI(frameHTML, num) {
        var $carousel_inner = $('.carousel-inner');
        num === 0 ? $carousel_inner.children().length > 0
            ? $(frameHTML).insertBefore('.item:first')
            : $carousel_inner.append(frameHTML)
                : $(frameHTML).insertAfter($(".item[data-column="+(num-1)+"]"));
    }
    function bindColumnControls(columnNum) {
        $(".refreshSwitch[data-column="+columnNum+"]").unbind('click').bind('click',function(){
            var columnNum = $(this).data('column'), $icon = $(this).find('i');
            $icon.toggleClass('fa-toggle-on fa-toggle-off');
            if ($icon.hasClass('fa-toggle-on')) getCommentsForColumn(config[columnNum], columnNum);
            toggleRefresh(columnNum);
        });
        $('.frame[data-column='+columnNum+'] .frame-header').unbind('click').bind('click', function(){
            getCommentsForColumn(config[columnNum], columnNum);
        });
        $(".column-bars[data-column="+columnNum+"] > a").unbind('click').bind('click',function(){  // edit
            var columnNum = $(this).parent().data('column'),
                $columnOptions = $(".column-options[data-column="+columnNum+"]");
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
        });
        $(".manage-threads[data-column="+columnNum+"]").unbind('click').bind('click', function() {
            var columnNum = $(this).data('column'), $edit_form = $('.edit-form[data-column='+columnNum+']');
            !$(this.nextSibling).hasClass('hide') ? showAllColumnOptions(columnNum) : showColumnOption($edit_form, columnNum);
            frame_content_height(columnNum);
        });
        $(".settings-switch[data-column="+columnNum+"]").unbind('click').bind('click', function() {
            var columnNum = $(this).data('column'), $settings_form = $('.settings-tab[data-column='+columnNum+']');
            !$(this.nextSibling).hasClass('hide') ? showAllColumnOptions(columnNum) : showColumnOption($settings_form, columnNum);
        });
        $(".write-comment-switch[data-column="+columnNum+"]").unbind('click').bind('click', function() {
            var columnNum = $(this).data('column'),
                $write_comment = $('.write-comment[data-column='+columnNum+']'),
                targetContext = '.write-comment[data-column='+columnNum+']', fromContext = '.edit-form[data-column='+columnNum+']';
            setPostThreads(targetContext, fromContext);
            !$(this.nextSibling).hasClass('hide') ? showAllColumnOptions(columnNum) : showColumnOption($write_comment, columnNum);
            frame_content_height(columnNum);
        });
        $(".fa-close[data-column="+columnNum+"], .trash[data-column="+columnNum+"]").unbind('click').bind('click',function(){
            var columnNum = $(this).data('column');
            $('#delete-column').data('column', columnNum);
            $('#column-to-delete').text(config[columnNum].settings.name);
            $('#delete-column-modal').modal();
        });
    }
    function makeItemActive(columnNum) {
        $('.item').removeClass('active');
        $(".item[data-column="+columnNum+"]").addClass('active');
    }
    function getCommentsForColumn(configObj, columnNum) {
        showLoader(columnNum);
        var dataArray = [];
        for (var i = 0, len = configObj.threads.length; i < len; i++) {
            var path = configObj.threads[i].thread,
                sort = configObj.settings.sortBy,
                limit = configObj.settings.limitPosts;
            getPosts(path, sort, limit, {target: {columnNum:columnNum,threadNum:i}, errorMsgLoc: '.frame[data-column='+columnNum+']', callback: function(data, target) {
                dataArray = dataArray.concat([data.concat(target.columnNum).concat(target.threadNum)]);
                if (config[target.columnNum].threads && config[target.columnNum].threads.length == dataArray.length) { // done aggregating data from threads of config[target]
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
            fn = new Fn();
        $group.each(function(index, el) {
            if ($(el).find(threadClass).val()) {
                var thread = {}, $option = $(el).find(threadClass+' option:selected');
                thread.subreddit = $(el).find(subClass+'.tt-input').val();
                thread.thread = $(el).find(threadClass).val();
                thread.threadid = $option.data('threadid');
                thread.threadtitle = $option.data('threadtitle');
                thread.subid = $option.data('subid');
                threads.push(thread);
            }
        });
        if ($group.length>0 && fn.any($group.find(threadClass), function(x){ return $(x).val()!==null})) {
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
            fn.setInCookie('config', config);
            return newColumnAdded;
        }
    }
    function addToConfigObj(column) {
        config = config.concat(column);
        new Fn().setInCookie('config', config);
    }
    function bindCancelButton() {
        $('#cancel-column').unbind('click').bind('click',function() {
            $('.sub-group-controls').remove();
            $('#add-a-column, #reddit').toggleClass('hide');
            if ($('#helpBlock-1').hasClass('hide')) {
                $('#add-button, .add-thread-button, [id^=helpBlock-], .fa-arrow-circle-right, .sub-group-controls, .column-settings').toggleClass('hide');
            }
        });
    }
    function bindAddThreadButton(context, target, groupClass, subClass, threadClass, deleteClass, infoClass, optionalColumnNum) {
        $(context+" .add-thread-button").unbind('click').click(function(){
            var html = new Tmpl(),
                threads = html.s(infoClass, threadClass),
                subreddit = html.t(deleteClass, subClass),
                subreddit_group = html.u(groupClass, subreddit, threads);
            $(subreddit_group).insertAfter(context+' .'+target);
            typeof optionalColumnNum !== 'undefined' ? frame_content_height(optionalColumnNum) : void 0;
            typeAheadReddit(context+' .'+subClass+':first', function(element) {
                var index = $(context+' .'+groupClass).index($(element).parent().parent().parent());
                getPosts('/r/'+element.value, '', '', {target: [context+' .'+threadClass,index], errorMsgLoc: element, callback: setThreads});
            });
            bindPopulateThreadSelect(context+' .'+subClass+'.tt-input:first', groupClass, threadClass);
            fadeIn('.'+groupClass, 100);
            bindDeleteThread(deleteClass, groupClass);
            bindInfoThread(infoClass);
            preventEnterButton();
        });
    }
    function preventEnterButton() {
        $('input.subreddit-edit, input.subreddit-controls').unbind('keypress').bind('keypress', function(e){ 
            if (e.which == 13) {
                var fn = new Fn();
                e.preventDefault();
                fn.getBlurred();
                $(this).parent().parent().parent().find('select').focus();
            } 
        });
    }
    function bindPopulateThreadSelect(input, groupClass, threadClass) {
        $(input).unbind('change').bind('change',function(){
            var index = $('.'+groupClass).index($(this).parent().parent().parent());
            getPosts('/r/'+this.value, '', '', {target: ['.'+threadClass,index], errorMsgLoc: this, callback: setThreads});
        });
    }
    function bindInfoThread(infoClass) {
        $('.'+infoClass).unbind('click').bind('click', function() {
            var threadid = $(this).parents('.form-group').find('select option:selected').data('threadid');
            if (threadid) {
                getThreadById(threadid, function(data) {
                    if (data.data.children[0].data.selftext_html) {
                        $('#info-title, #info-content').children().remove();
                        $('#info-title').html(new Tmpl().an(data.data.children[0].data.url, data.data.children[0].data.title));
                        $('#info-content').append($("<div/>").html(data.data.children[0].data.selftext_html).text());
                        $('#author-button').text('/u/'+data.data.children[0].data.author).attr("onclick", "window.open('"+window.location.protocol+"//www.reddit.com/u/"+data.data.children[0].data.author+"','_blank');");
                        $('#time-button').text(getTimeElapsed(data.data.children[0].data.created_utc));
                        externalLinks('#info-content .md a');
                        $('#info-modal').modal();
                    } else {
                        window.open(data.data.children[0].data.url, '_blank');
                    }
                }, undefined, undefined, true, this);
            }
        });
    }
    function bindDeleteThread(deleteClass, groupClass) {
        $('.'+deleteClass).unbind('click').bind('click', function() {
            var columnNum = $(this).parents('.item').data('column');
            $(this).parents('.'+groupClass).remove();
            if (typeof columnNum !== 'undefined') frame_content_height(columnNum);
        });
    }
    function setThreads(data, selectTarget) {
        var html = new Tmpl(),
            $select = typeof selectTarget[2] !== 'undefined' // columnNum was passed
                ? $($(selectTarget[0]+"[data-column="+selectTarget[2]+"]")[selectTarget[1]])
                : $($(selectTarget[0])[selectTarget[1]]);
        $select.children().remove();
        data.data.children.forEach(function(post) {
            $select.append(html.v(post));
        });
        if (config.length > 0 && typeof selectTarget[2] !== 'undefined') {
            var threadObj = config[selectTarget[2]].threads[selectTarget[1]];
            if ($select.find("option[data-threadid="+threadObj.threadid+"]").length===0 && threadObj.subid==$select.find('option:selected').data('subid')) {
                $select.append(html.w(threadObj));
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
    function buildReplyForm(thing_id, author, isTopLevel) {
        var html = new Tmpl(),
            buttons = html.x(isTopLevel),
            parentInput = html.y(thing_id),
            textarea = html.z(author, isTopLevel),
            form = html.aa(parentInput, textarea, buttons, isTopLevel);
        return form;
    }
    function bindVoteCast() {
        $('.vote.up, .vote.down').unbind('click').bind('click', function() {
            if (isRedditUserLoggedIn()) {
                var id = $(this).data('id').split('-')[0],
                    vote_state = $('.score[data-id='+$(this).data('id')+']').data('vote-state'),
                    vote_action = $(this).hasClass('up') ? 1 : -1,
                    dir = vote_action == vote_state ? 0 : vote_action == 1 ? 1 : -1,
                    formData = {id: id, dir: dir},
                    done = function(data, textStatus, jqXHR, obj) {
                        data && data.needsLogin ? $('#login-reddit-modal').modal()
                        : data.statusCode ? console.log(data.statusCode)
                            : data.json && data.json.errors.length > 0 
                                ? alert(data.json.errors[0][1])
                                : updateVoteState(data,obj);
                    },
                    fail = function(jqXHR, textStatus, errorThrown, obj) {
                        alert(textStatus+': Couldn\'t cast vote to '+obj.id);
                    };
                genericPost('/vote', formData, done, fail, undefined, {id:id,dir:dir});
            } else { $('#login-reddit-modal').modal() }
            new Fn().getBlurred();
        });
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
    function bindReplySwitch() {
        $('.reply-switch').unbind('click').bind('click',function() {
            var $replyForm = $(this).parent().parent().find('.reply-form');
            if ($replyForm.hasClass('hide')) {
                $replyForm.removeClass('hide');
                $replyForm.find('form').removeClass('hide');
                $replyForm.find('.submitting').removeClass('faded').addClass('hide');
                fadeIn($replyForm, 100);
            } else {
                $replyForm.removeClass('faded').addClass('hide');
            }
        });
        $('.save-reply').unbind('click').click(function() {
            var $postPane = $(this).parents('.write-comment'),
                thing_id_raw = this.form.thing_id.value,
                thing_id = thing_id_raw.split('-')[0] || 't3_'+$postPane.find('.post-thread option:selected').data('threadid'),
                additionalData = {
                    columnNum: thing_id_raw.split('-')[1] || $postPane.data('column'),
                    threadNum: thing_id_raw.split('-')[2],
                    postPane: $postPane.length > 0 ? $postPane : $(this).parents('.comment-footer')
                },
                text = this.form.text.value,
                $submitting = $(this.form.previousSibling);
            if (text.length===0) return;
            $(this.form).addClass('hide');
            fadeIn($submitting.removeClass('hide'), 100);
            $postPane.length > 0 ? frame_content_height(additionalData.columnNum) : void 0;

            var done = $postPane.length > 0
                ? function(data, textStatus, jqXHR, additionalData) { // submitting comment from nav-tab post
                    data && data.needsLogin ? $('#login-reddit-modal').modal()
                        : data.statusCode ? topLevelCommentFail(additionalData)
                            : data.json && data.json.errors.length > 0 ? function(){ replyLevelCommentFail(additionalData); alert(data.json.errors[0][1]); }()
                                : postTopLevelComment(data.json.data.things, additionalData);
                }
                : function(data, textStatus, jqXHR, additionalData) { // submitting comment from reply
                    data && data.needsLogin ? $('#login-reddit-modal').modal()
                        : data.statusCode ? console.log(data.statusCode)
                            : data.json && data.json.errors.length > 0 ? function(){ replyLevelCommentFail(additionalData); alert(data.json.errors[0][1]); }()
                                : insertReplyIntoDOM(data.json.data.things, additionalData);
                };
            var fail = $postPane.length > 0
                ? function(jqXHR, textStatus, errorThrown, additionalData){
                    topLevelCommentFail(additionalData);
                }
                : function(jqXHR, textStatus, errorThrown, additionalData){
                    replyLevelCommentFail(additionalData);
                };
            var formData = {thing_id: thing_id, text: text };
            genericPost('/save-reddit-reply', formData, done, fail, undefined, additionalData);
        });
        $('.textarea-reply').unbind('focus').bind('focus', function() {
            !isRedditUserLoggedIn() ? $('#login-reddit-modal').modal() : void 0;
        });
        $('.cancel-reply').unbind('click').click(function() {
            var $comment_footer = $(this).parents('.comment-footer');
            $comment_footer.length>0
                ? $comment_footer.find('.reply-switch').trigger('click')
                : showAllColumnOptions($(this).parents('.column-options').data('column'));
        });
    }
    function isRedditUserLoggedIn() {
        return $('[data-reddituser]').data('reddituser') ? true : false;
    }
    function replyLevelCommentFail(additionalData) {
        var $form = $(additionalData.postPane).find('form'),
            $submitting = $(additionalData.postPane).find('.submitting');
        $form.removeClass('hide');
        $submitting.removeClass('hide').addClass('hide');
        $form.launchPopOver(3000, popOverOptions('top','','There was a problem posting your reply. Try again!'));
    }
    function topLevelCommentFail(additionalData) {
        var $form = $(additionalData.postPane).find('form'),
            $submitting = $(additionalData.postPane).find('.submitting');
        $submitting.removeClass('faded').addClass('hide');
        $form.removeClass('hide');
        frame_content_height(additionalData.columnNum);
        $form.find('.textarea-reply').launchPopOver(3000, popOverOptions('top','','There was a problem posting your comment. Try again!'));
    }
    function postTopLevelComment(objArray, additionalData) {
        var $form = $(additionalData.postPane).find('form'),
            $submitting = $(additionalData.postPane).find('.submitting');
        $form.find('.textarea-reply').val('');
        $submitting.removeClass('faded').addClass('hide');
        $form.removeClass('hide');
        frame_content_height(additionalData.columnNum);
        $('.column-bars[data-column='+additionalData.columnNum+'] > a, .frame[data-column='+additionalData.columnNum+'] .frame-header').trigger('click');
    }
    function insertReplyIntoDOM(objArray, additionalData) {
        $(buildCommentHtmlString(appendColNumAndThreadNum(objArray, additionalData.columnNum, additionalData.threadNum),true))
            .insertAfter('#'+objArray[0].data.parent_id+' .comment-footer:first');
        $('#'+objArray[0].data.parent_id+' .fa-reply:first').trigger('click');
        commentBindings();
        fadeIn($('#'+objArray[0].data.name), 100);
    }
    function commentBindings() {
        externalLinks('.md a');
        bindReplySwitch();
        bindVoteCast();
        bindRefreshComment();
        bindShowReply();
    }
    function externalLinks(selector) {
        $(selector).each(function(index, el) {
            $(el).attr('target','_blank');
            $(el).attr('href').substring(0,3)=='/u/' || $(el).attr('href').substring(0,3)=='/r/'
                ? $(el).attr('href', window.location.protocol+'//www.reddit.com'+$(el).attr('href')) : '';
        });
    }
    function displayComments(data, columnNum) {
        var $frameContent = $(".frame-content[data-column="+columnNum+"]");
        if (!$frameContent.children().length) { // first time load
            $frameContent.append(buildCommentHtmlString(data[1].data.children, false, true));
            fadeIn($frameContent, 1000);
        } else { // subsequent loads
            var cachedfirstComment = window['firstComment'+columnNum];
            if (!(cachedfirstComment == data[1].data.children[0].data.name)) {
                var newComments = new Fn().takeWhile(data[1].data.children, cachedfirstComment, function(x, commentName){
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
        commentBindings();
    }
    function updateCreatedUTC(columnNum) {
        var frameContent = document.getElementsByDataAttribute('.frame-content', 'data-column', columnNum)[0],
            collection = frameContent.getElementsByClassName('time-elapsed');
        collection.forEach(function(node) {
           node.text = getTimeElapsed(node.getAttribute('data-created-utc'));
        });
    }
    function updateCommentStats(comments) {
        comments.forEach(function(comment){
            var replies = comment.kind!='more' && comment.data.replies.hasOwnProperty('data')
                ? comment.data.replies.data.children : [], replyLength = replies.length,
                commentId = '#'+comment.data.name,
                commentFooter = commentId+' .comment-footer[data-id='+comment.data.name+']';
            typeof comment.data.score !== 'undefined' ? $('.score[data-id='+comment.data.name+']').text(comment.data.score) : void 0;
            newCommentsOnRefresh(replyLength, comment.data.name, commentFooter);
            updateCommentStats(replies);
        });
    }
    function newCommentsOnRefresh(replyLength, name, commentFooter) {
        var html = new Tmpl(),
            $preloadedReplies = $('#'+name+' .media[data-parentid='+name+']'),
            $replySwitch = $(commentFooter+' .reply'),
            $replyNum = $(commentFooter+' .reply .reply-num'),
            newRepliesNum = replyLength - $preloadedReplies.length,
            newButton = html.ab(newRepliesNum),
            optionalExpander = html.ac(replyLength);
        if (replyLength > 0 && $replySwitch.length>0 && replyLength > $replySwitch.data('replylength')) { // replies exist already
            $replySwitch.data('replylength', replyLength);
            $replyNum.text(replyLength);
            if (newRepliesNum > 0 && $(commentFooter+' .new-comment').length===0) {
                $(newButton).insertAfter(commentFooter+' .reply');
                newCommentBind(commentFooter+' .new-comment');
            } else {
                if (!$('footer[data-id='+name+'] .reply').children().length && $preloadedReplies.length>0) {
                    $('footer[data-id='+name+'] .reply').append(optionalExpander);
                    $('footer[data-id='+name+'] .reply .expand').toggleClass('fa-plus-square fa-minus-square');
                }
                newRepliesNum <= 0 ? void 0 : $(commentFooter+' .new-comment .diff').text(newRepliesNum+' new');
                newCommentBind(commentFooter+' .new-comment');
            }
        } else if (replyLength > 0 && $replySwitch.length===0) { // replies don't exist until now
            var existingRepls = html.ad(name, replyLength);
            $(existingRepls).insertAfter(commentFooter+' .refresh-comment');
            if (newRepliesNum > 0) {
                $(newButton).insertAfter(commentFooter+' .reply');
                newCommentBind(commentFooter+' .new-comment');
            }
            if ($preloadedReplies.hasClass('faded')) {
                $('footer[data-id='+name+'] .reply').append(optionalExpander);
                $('footer[data-id='+name+'] .reply .expand').toggleClass('fa-plus-square fa-minus-square');
            }
        }
    }
    function newCommentBind(newCommentSpan) {
        $(newCommentSpan).unbind('click').bind('click', function() {
            $(this).parent().parent().find('.refresh-comment').trigger('click');
        });
    }
    function buildCommentHtmlString(commentsArray, optionalNopacity, isParent, hide) {
        var commentsArray = commentsArray || []; var htmlString = ''; var html = new Tmpl();
        commentsArray.forEach(function(comment) {
            var replies = comment.kind!='more'&&comment.data.replies.hasOwnProperty('data')
                    ? comment.data.replies.data.children:[], replyLength = replies.length;
            var footer = comment.kind!='more'
                    ? html.ae(comment, replyLength, getTimeElapsed(comment.data.created_utc),
                        getPermalink(comment.data.link_id,comment.data.id),
                        buildReplyForm(comment.data.name, comment.data.author)) : "",
                text = $("<div/>").html(comment.data.body_html).text()+footer+buildCommentHtmlString(replies, true, false, true),
                heading = comment.kind!='more'
                    ? html.ag(comment, text)
                    : html.ah(comment, text),
                body = html.ai(heading),
                thumbnail = comment.kind!='more' ? html.aj(isParent, getIcon(comment.data.subreddit)) : "",
                media = html.ak(comment, getIcon(comment.data.subreddit), isParent, optionalNopacity, thumbnail, body, hide);
            htmlString += media;
        });
        return htmlString;
    }
    function bindShowReply(){
        $('.reply').unbind('click').click('click',function(){
            var name = $(this).data('name'),
                $replies = $('#'+name+' .media[data-parentid='+name+']'),
                $icon = $(this).find('.expand');
            if ($icon.hasClass('fa-plus-square')) {
                $icon.removeClass('fa-plus-square').addClass('fa-minus-square');
                fadeIn($replies.removeClass('hide'), 100);
            } else {
                $icon.removeClass('fa-minus-square').addClass('fa-plus-square');
                $replies.removeClass('faded').addClass('hide');
            }
        });
    }
    function bindRefreshComment() {
        $('.refresh-comment, .load-comments').unbind('click').bind('click', function() {
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
                $('footer[data-id='+id+'] .reply .expand').toggleClass('fa-plus-square fa-minus-square');
                $('#'+id+' .media[data-parentid='+$('#'+id).attr('id')+']').removeClass('hide').addClass('faded');
                $('#'+id).addClass('nopacity');
                fadeIn($('#'+id), 100);
                commentBindings();
            });
        });
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
    function genericGet(url, done, fail, always, cacheBool, errorMsgLoc, additionalData) {
        $.ajax({ url: url, type: "GET", timeout:7000, cache: cacheBool || false })
        .done(function(data, textStatus, jqXHR) { if (done) done(data, textStatus, jqXHR, additionalData); })
        .fail(function(jqXHR, textStatus, errorThrown) {
            if (fail) fail(jqXHR, textStatus, errorThrown, additionalData);
            errorPop(errorMsgLoc, errorThrown);
        })
        .always(function() { if (always) always(); });
    }
    function genericPost(url, data, done, fail, always, additionalData, errorMsgLoc) {
        $.ajax({ url: url, type: 'POST', timeout:7000, data: data, cache: false })
        .done(function(data, textStatus, jqXHR) { if (done) done(data, textStatus, jqXHR, additionalData);})
        .fail(function(jqXHR, textStatus, errorThrown) {
            if (fail) fail(jqXHR, textStatus, errorThrown, additionalData);
            errorPop(errorMsgLoc, errorThrown);
        })
        .always(function() { if (always) always(); });
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
    function init() {
        pjx();
        listsjs();
        blenddit();
    }

    init();
}