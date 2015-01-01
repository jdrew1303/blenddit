/* TODO
	- loadReplies not working for particular comments.
	- Create error message for 404 get requests to reddit 
	- Twitter as a form of source content. (smashing node)
	- Migrate all client-side fetching of content (reddit/twitter) to server side: 
		- Use techniques from smashing node (http/querystring) to build structured html objects
		  for handlebars to template out. (Removes all logic from app.js)
	FUTURE EXPANSION
	- diferrent sports? NBA, CFB, NHL?
*/
if (!window.jQuery === 'undefined') {
	throw new Error('app.js requires jQuery');
} else {
	var app = (function($) {
		var refresh, refreshSwitch = true, dataResponse,
			config = Storage && localStorage.getItem('config') ? getFromCache('config') : []  
		function getFromCache(item) { if (Storage) return JSON.parse(localStorage.getItem(item)) }
		function setInCache(name, item) { if (Storage) localStorage.setItem(name, JSON.stringify(item))}
		function pjx() {
			$(document).pjax('a[data-pjax]', '#pjax-container')
			$(document).on('pjax:send', function() {})
			$(document).on('pjax:end', function() {
  				if ($('#listsjs').length>0) { listsjs();  
  				} else if ($('#merger').length>0) { merger();
  				} else {
  					$('.teams').hide(); 
  					$('#sidebarTrigger').hide()
  					$('.navbar-fixed-top').show();
  					$('.navbar-brand > .text-warning').text('kurtlocker.org')
  					$('.social').show();
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
				$('#sidebarTrigger').show()
				$('.navbar-brand > .text-warning').text('[ l [ i [ s ] t ] s ]')  
				$('div.js').each(function(i, block) { // code hightlight
					$(block).text($(block).text().trim()) 
				 	hljs.highlightBlock(block);
				});
			  	$('.sidebarFunc').unbind('click').click(function() {
			  		$('.sidebarFunc').removeClass('blue-dotted'); 
			  		$(this).addClass('blue-dotted');
			  		$('.nav-tabs').removeClass('blue-dotted');
			  		$('#function-'+$(this).attr('num')).addClass('blue-dotted');
			  		$("html, body").animate({ scrollTop: $('#function-'+$(this).attr('num')).offset().top-60 }, 500);
			  		if ($('#wrapper').hasClass('toggled')) $("#wrapper").toggleClass("toggled");
			  	})
			  	$('#page-content-wrapper').unbind('click').click(function() {
			  		if ($('#wrapper').hasClass('toggled')) $("#wrapper").toggleClass("toggled");
			  	});
			}
		}
		/* parent function for thread merger application */
		function merger() {
			if ($('#merger').length>0) {
				$('.teams').show(); $('.social').hide(); $('.navbar-fixed-top').hide();
				$('.navbar-brand > .text-warning').text('thread merger')
				// $('#refresh').unbind('change').change(function() { $('#threads-1').trigger('change'); $('#refreshNumber').text($('#refresh').val())})
				$('.open-controls').unbind('click').click(function() {launchControls();})
				$('#delete-column').unbind('click').click(function() {
					deleteRefresh($(this).data('column'))
					config.remove($(this).data('column'));
					setInCache('config', config);
					buildConfigurationPanel();
					buildConfigToUI(); 
				})
				if (config.length > 0) {
					$('#greeting').hide();
					buildConfigurationPanel();
					buildConfigToUI(); 
				} else {
					launchControls();
				}
				contentResizeEvent();
				preventBounce();
			}
		}
		function preventBounce(){ 
			$('.item').unbind('touchmove').bind('touchmove', function(e){
				e.stopPropagation();
			})
			$(document).unbind('touchmove').bind('touchmove', function(e){
				e.preventDefault();
			})
		}
		function contentResizeEvent() {
			app.height = window.innerHeight;
			$('.frame-content, .edit-form').css('height', window.innerHeight-107);
			$(window).unbind('resize').bind('resize', function(){
				if (app.height != window.innerHeight) {
					$('.frame-content, .edit-form').css('height', window.innerHeight-107);
					app.height = window.innerHeight;
					// $('.edit-form').css('height', window.innerHeight-132)
				}
			});
		}
		function launchControls() {
			vendorGroupDisplay();
			buildConfigurationPanel();
			$('#save-changes').unbind('click').bind('click',function() {
				$('#greeting').hide();
				setInCache('config', config)
				buildConfigToUI();
			});
			$('#controlModal').unbind('hide.bs.modal').on('hide.bs.modal', function (e) {
				$('#config-row-container').children().remove();
			})
			$('#controlModal').modal();
		}
		function vendorGroup() {
			$('#reddit-block, #twitter-block').unbind('click').bind('click',function(){
				if (this.id == 'reddit-block') {
					bindAddThreadButton('#reddit','column-settings', 'sub-group-controls', 'subreddit-controls', 'thread-controls', 'delete-controls');
					bindCancelButton();
					bindForwardBackArrows();
					bindAddButton();
					$('#vendor-group, #reddit').toggleClass('hide');
				} // else if (twitter block)
			})
		}
		function bindAddButton() {
			$('#add-button').unbind('click').bind('click',function() {
				// Validate - Does the user have at least one thread?
				// Reset add column functionality, take back to "Add Column"
				updateConfigObj('.sub-group-controls', '.subreddit-controls', '.thread-controls', '#reddit .column-settings');
				buildConfigurationPanel();
				$('#cancel-column').trigger('click')
			})
		}
		function buildConfigToUI() {
			$('.carousel-inner').children().remove();
			for (var i = 0, len = config.length; i < len; i++) {
				buildColumn(config[i], i)	
			}
		}
		function buildFrameEdit(configObj, columnNum) {
			var htmlString = "<div class='edit-button-group'><button type='button' class='add-thread-button btn btn-primary btn-default'>Add Thread</button><button style='float:right;' type='button' class='save-edit-button btn btn-primary btn-default'>Save</button><button style='float:right; margin-right: 5px;' type='button' class='cancel-edit-button btn btn-default'>Cancel</button></div>",
				options = $('<div>').append($('#template > option').clone()).html(),
				settings = $('<div>').append($('.column-settings').children().clone().each(function() {
					var $label = $(this).find('label'); var $input = $(this).find('*[id]');
					$label.attr('for', $label.attr('for')+'-'+columnNum);
					$input.attr('id', $input.attr('id')+'-'+columnNum);
				})).html();
			for (var i = 0, len = configObj.threads.length; i < len; i++) {
				var threads = "<div class='form-group'><label class='control-label'>Threads</label><select data-column='"+columnNum+"' class='form-control thread-edit'></select></div>",
					subreddit = "<div class='form-group'><label class='control-label'>Subreddit</label><span style='float:right;'><i class='fa fa-close fa-lg delete-edit'></i></span><select class='form-control subreddit-edit'>"+options+"</select></div>",
					subreddit_group = "<div class='subreddit-group-edit'>"+subreddit+threads+"</div>";
				htmlString += subreddit_group;
			}
			htmlString += "<div class='edit-column-settings'>"+settings+"</div>";
			$(".edit-form[data-column="+columnNum+"]").append(htmlString); // edit form attached to column
			$('#column-name-'+columnNum).val(configObj.settings.name);
			$('#refresh-'+columnNum).val(configObj.settings.refreshRate);
			$('#limit-'+columnNum).val(configObj.settings.limitPosts);
			$('#sortBy-'+columnNum).val(configObj.settings.sortBy);
			$(".edit-form[data-column="+columnNum+"] .subreddit-edit").each(function(index, el) {
				this.value = config[columnNum].threads[index].subreddit
				$(this).unbind('change').bind('change',function(){
					var index = $(".edit-form[data-column="+columnNum+"] .subreddit-group-edit").index($(this).parent().parent());
					getPosts(this.value, '', '', {target:['edit-form .thread-edit',index,columnNum],callback: setThreads});
				})
			});
			bindDeleteThread('delete-edit');
			var context = ".edit-form[data-column="+columnNum+"]"
			bindAddThreadButton(context, "edit-button-group", "subreddit-group-edit", "subreddit-edit", "thread-edit", "delete-edit");
			bindCancelEdit(configObj, columnNum);
			bindSaveEdit(configObj, columnNum);
		}
		function bindSaveEdit(configObj, columnNum) {
			$(".edit-form[data-column="+columnNum+"] .save-edit-button").unbind('click').bind('click', function() {
				var context = '.edit-form[data-column='+columnNum+']';
				updateConfigObj(context+' .subreddit-group-edit', '.subreddit-edit', '.thread-edit', context+' .edit-column-settings', columnNum);
				setInCache('config', config);
				buildColumn(config[columnNum], columnNum);
				makeItemActive(columnNum)
			})
		}
		function bindCancelEdit(configObj, columnNum) {
			$(".edit-form[data-column="+columnNum+"] .cancel-edit-button").unbind('click').bind('click', function() {
				buildColumn(configObj, columnNum);
				makeItemActive(columnNum);
			})
		}
		function buildColumn(configObj, num) {
			$(".item[data-column="+num+"]").remove(); 
			var frameContent = "<div data-column='"+num+"' class='frame-content nopacity'></div>",
				icons = "<span style='float:right;'><i data-column='"+num+"' class='fa fa-toggle-on fa-lg refreshSwitch'></i><i data-column='"+num+"' class='fa fa-edit fa-lg'></i><i data-column='"+num+"' class='fa fa-close fa-lg'></i></span>",
				frameEdit = "<div data-column='"+num+"' class='frame-edit nopacity hide'><form data-column='"+num+"' role='form' class='edit-form'></form></div>",
				frame = "<i data-column='"+num+"' class='nopacity loading fa fa-refresh fa-spin fa-2x'></i><div class='frame-overlay' data-column='"+num+"'><div data-column='"+num+"' class='frame'><h6 class='frame-header'>"+(configObj.type=='reddit'?"<i class='fa fa-reddit fa-lg'></i> ":"<i class='fa fa-twitter'></i> ")+configObj.settings.name+icons+"</h6>"+frameEdit+"</div></div>"+frameContent,
				frameContainer = "<div class='frame-container'>"+frame+"</div>",
				framePosition = "<div data-column='"+num+"' data-type='"+configObj.type+"' class='frame-position nopacity'>"+frameContainer+"</div>",
				item = "<div data-column='"+num+"' class='item "+(num==0?'active':'')+"'>"+framePosition+"</div>";
			buildColumnToUI(item, num);
			bindColumnControls(num);
			buildFrameEdit(configObj, num)
			if (configObj.type=='reddit') {
				getCommentsForColumn(configObj, num)
				toggleRefresh(num)
			}
			contentResizeEvent();
			fadeIn(".frame-position[data-column="+num+"]", 100);
		}
		function deleteRefresh(columnNum) {
			clearInterval(app['r'+columnNum]);
			delete app['r'+columnNum];
		}
		function toggleRefresh(columnNum) {
			deleteRefresh(columnNum);
			if ($(".refreshSwitch[data-column="+columnNum+"]").hasClass('fa-toggle-on')) {
				app['r'+columnNum] = setInterval(function() { 
					getCommentsForColumn(config[columnNum], columnNum)
				}, parseInt(config[columnNum].settings.refreshRate)*1000)
			} else {
				clearInterval(app['r'+columnNum]);	
			}
		}
		function buildColumnToUI(frameHTML, num) {
			var $carousel_inner = $('.carousel-inner');
			num == 0 ? $carousel_inner.children().length > 0 
				? $(frameHTML).insertBefore('.item:first')
				: $carousel_inner.append(frameHTML)
					: $(frameHTML).insertAfter($(".item[data-column="+(num-1)+"]")); 
		}
		function bindColumnControls(columnNum) {
			$(".refreshSwitch[data-column="+columnNum+"]").unbind('click').bind('click',function(){ 
				var columnNum = $(this).data('column')
				$(this).toggleClass('fa-toggle-on fa-toggle-off');
				if ($(this).hasClass('fa-toggle-on')) getCommentsForColumn(config[columnNum], columnNum)
				toggleRefresh(columnNum);
			})
			$(".fa-edit[data-column="+columnNum+"]").unbind('click').bind('click',function(){  // edit
				var columnNum = $(this).data('column'),
					$frameEdit = $(".frame-edit[data-column="+columnNum+"]"),
					$frameContent = $(".frame-content[data-column="+columnNum+"]");
				if ($frameEdit.hasClass('hide')) {
					$frameEdit.removeClass('hide')
					$frameContent.removeClass('faded').addClass('hide')
					fadeIn($frameEdit, 100);
					$(".edit-form[data-column="+columnNum+"] .subreddit-group-edit").each(function(index, el) {
						var selectval = $(this).find('.subreddit-edit').val(),
							threadval = $(this).find('.thread-edit').val();
						if (selectval != 'default' && threadval==null) {
							$(this).find('.subreddit-edit').trigger('change')
						}
					});
				} else {
					$frameEdit.removeClass('faded').addClass('hide')
					$frameContent.removeClass('hide');
					fadeIn($frameContent, 100);
				}
			})
			$(".fa-close[data-column="+columnNum+"]").unbind('click').bind('click',function(){ 
				var columnNum = $(this).data('column');
				$('#delete-column').data('column', columnNum);
				$('#column-to-delete').text(config[columnNum].settings.name)
				$('#delete-column-modal').modal();
			})
		} 
		function makeItemActive(columnNum) {
			$('.item').removeClass('active');
			$(".item[data-column="+columnNum+"]").addClass('active')
		}
		function getCommentsForColumn(configObj, columnNum) {
			showLoader(columnNum);
			var dataArray = [];
			for (var i = 0, len = configObj.threads.length; i < len; i++) {
				var path = configObj.threads[i].thread,
					sort = configObj.settings.sortBy,
					limit = configObj.settings.limitPosts;
				getPosts(path, sort, limit, {target: columnNum, callback: function(data, target) {
					dataArray = dataArray.concat([data.concat(target)]);
					if (config[target].threads.length == dataArray.length) { // done aggregating data from threads of config[target]
						var mergedData = getMergedData(dataArray)
						displayComments(mergedData, target);
						hideLoader(target);
					}
				}})
			}
		}
		function buildConfigurationPanel() {
			if (config.length > 0) {  // columns exist
				$('#current-config').removeClass('hide');
				var $configRows = $('#config-row-container');
				$configRows.children().remove();
				var  configPanelHtml='', classes = 'col-xs-12 col-md-8 config-panel-column nopacity', icons = "<span class='icon-right icon-config'><i class='fa fa-edit fa-lg'></i><i class='fa fa-close fa-lg'></i></span>"
				for (var i = 0, len = config.length; i < len; i++) {
					var configColumn = "<div data-columnNum='"+i+"' class='"+classes+"'>"+config[i].settings.name+icons+"</div>"
					configPanelHtml += configColumn;
				}
				$configRows.append(configPanelHtml)
				fadeIn($configRows.children(), 100);
				$configRows.find('.fa-close').unbind('click').bind('click', function(){ 
					var rowNum = $(this).parent().parent().data('columnnum');
					deleteRefresh(rowNum);
					config.remove(rowNum);
					setInCache('config', config);
					buildConfigurationPanel();
				})
			} else { $('#current-config').removeClass('hide').addClass('hide'); }
		}
		function updateConfigObj(parentClass, subClass, threadClass, settingsClass, num) {
			var column = {}, setting = {}, threads = [], $group = $(parentClass), settings = $(settingsClass).find('.form-control'),
				type = typeof num !== 'undefined' && $(".frame-position[data-column="+num+"]").data('type')=='reddit' || !$('#reddit').hasClass('hide') ? 'reddit' : 'twitter';
			$group.each(function(index, el) {
				var thread = {}, $option = $(el).find(threadClass+' option:selected');
				thread['subreddit'] = $(el).find(subClass).val();
				thread['thread'] = $(el).find(threadClass).val();
				thread['threadid'] = $option.data('threadid');
				thread['threadtitle'] = $option.data('threadtitle');
				thread['subid'] = $option.data('subid');
				threads.push(thread);
			});	
			column['threads'] = threads;
			setting['name'] = settings[0].value;
			setting['refreshRate'] = settings[1].value;
			setting['limitPosts'] = settings[2].value;
			setting['sortBy'] = settings[3].value;
			column['settings'] = setting;
			column['type'] = type;
			typeof num !== 'undefined' 
				? config[num] = column 
				: config = config.concat(column);
		}
		function bindForwardBackArrows() {
			$('.fa-arrow-circle-left, .fa-arrow-circle-right').unbind('click').click(function() {
				if ($(this).hasClass('fa-arrow-circle-left')) { // left arrow
					if (!$('.add-thread-button').hasClass('hide')) { // 
						$('#vendor-group, #reddit').toggleClass('hide');
					} else {
						$('#add-button, .add-thread-button, [id^=helpBlock-], .fa-arrow-circle-right, .sub-group-controls, .column-settings').toggleClass('hide');
					}
				} else { // right arrow
					if (!$('.add-thread-button').hasClass('hide')) { //
						$('.add-thread-button').addClass('hide');
						$('#add-button').removeClass('hide')
						$('[id^=helpBlock-], .fa-arrow-circle-right, .sub-group-controls, .column-settings').toggleClass('hide');
					}
				}
			})
		}
		function bindCancelButton() {
			$('#cancel-column').unbind('click').bind('click',function() { 
				$('.sub-group-controls').remove();
				$('#add-a-column, #reddit').toggleClass('hide');
				if ($('#helpBlock-1').hasClass('hide')) {
					$('#add-button, .add-thread-button, [id^=helpBlock-], .fa-arrow-circle-right, .sub-group-controls, .column-settings').toggleClass('hide');
				} 
			})
		}
		function bindAddThreadButton(context, target, groupClass, subClass, threadClass, deleteClass) { 
			$(context+" .add-thread-button").unbind('click').click(function(){
				var	threads = "<div class='form-group'><label class='control-label'>Threads</label><select class='form-control "+threadClass+"'></select></div>",
					subreddit = "<div class='form-group'><label class='control-label'>Subreddit</label><span style='float:right;'><i class='fa fa-close fa-lg "+deleteClass+"'></i></span><select class='form-control "+subClass+"'></select></div>",
					subreddit_group = "<div class='"+groupClass+" nopacity'>"+subreddit+threads+"</div>",
					$options = $('#template > option').clone();
				$(subreddit_group).insertAfter(context+' .'+target);
				$(context+' .'+subClass+':first').append($options);	
				$(context+' .'+subClass+':first').unbind('change').bind('change',function(){
					var index = $('.'+groupClass).index($(this).parent().parent());
					getPosts(this.value, '', '', {target: [threadClass,index], callback: setThreads});
				})	
				fadeIn('.'+groupClass, 100);
				bindDeleteThread(deleteClass);
			});
		}
		function bindDeleteThread(deleteClass) {
			$('.'+deleteClass).unbind('click').bind('click', function() {
				$(this).parent().parent().parent().remove();
			})
		}
		function vendorGroupDisplay() {
			$('#add-a-column').unbind('click').bind('click',function() { 				
				$(this).removeClass('hide').addClass('hide');
				$('#vendor-group').removeClass('hide')
				vendorGroup();
			})
		}
		function setThreads(data, selectTarget) {
			var $select = selectTarget[2] // columnNum was passed
				? $($("."+selectTarget[0]+"[data-column="+selectTarget[2]+"]")[selectTarget[1]])
				: $($('.'+selectTarget[0])[selectTarget[1]]);
			$select.children().remove();
			data.data.children.forEach(function(post,i) {
				$select.append("<option data-subid='"+post.data.subreddit_id+"' data-threadtitle='"+post.data.title+"' data-threadid='"+post.data.id+"' value='"+post.data.permalink+"'>"+post.data.title+"</option>")
			})
			if (config.length > 0 && typeof selectTarget[2] !== 'undefined') {
				var threadObj = config[selectTarget[2]].threads[selectTarget[1]];
				if ($select.find("option[data-threadid="+threadObj.threadid+"]").length==0 && threadObj.subid==$select.find('option:selected').data('subid')) {
					$select.append("<option data-threadid='"+threadObj.threadid+"' value='"+threadObj.thread+"'>"+threadObj.threadtitle+"</option>")
				}
				$select.find("option[data-threadid="+threadObj.threadid+"]").prop('selected',true);
			}
		}
		function showLoader(columnNum) {
			$(".frame-overlay[data-column="+columnNum+"]").addClass('half-fade');
			$(".loading[data-column="+columnNum+"]").addClass('faded')
		}
		function hideLoader(columnNum) {
			$(".frame-overlay[data-column="+columnNum+"]").removeClass('half-fade');
			$(".loading[data-column="+columnNum+"]").removeClass('faded')
		}
		function fadeIn(domElement, millsecs) {
			setTimeout(function(){ $(domElement).addClass('faded')}, millsecs);
		}
		function getIcon(subreddit) {
			return 'icon-'+subreddit;
		}
		function displayComments(data, columnNum) {
			$frameContent = $(".frame-content[data-column="+columnNum+"]");
			$frameContent.children().remove();
			$frameContent.removeClass('faded');
			data[1].data.children.forEach(function(comment,i) {
				var replies = comment.kind!='more'&&comment.data.replies.hasOwnProperty('data') ? comment.data.replies.data.children:[], replyLength = replies.length,
					replyText = replyLength==0 ? "" : replyLength==1 ? replyLength+" reply" : replyLength+" replies";
				var footer = comment.kind!='more' ? "<footer class='comment-footer'><div class='time-container'>"+getTimeElapsed(comment.data.created_utc)+"</div><div class='links-container'><i class='fa fa-reply fa-lg'></i><a href='"+getPermalink(comment.data.link_id,comment.data.id)+"' target='_blank'><i class='fa fa-link fa-lg'></i></a><i class='fa fa-newspaper-o fa-lg'></i><i class='fa fa-reddit fa-lg'></i></div>" : "",
					text = $("<div/>").html(comment.data.body_html).text()+footer+getReplies(replies),
		    		heading = comment.kind!='more' 
		    			? "<p class='media-heading'><a style='color:white;' href='http://www.reddit.com/u/"+comment.data.author+"' target='_blank'>"+comment.data.author+"</a>  |  "+comment.data.score+"  |  <a data-name='"+comment.data.name+"' class='reply'><span class='text-warning'>"+replyText+"</span></a></p>"+text
		    			: "<div>load more comments</div>"+text;
		    		body = "<div class='media-body'>"+heading+"</div>",
		    		thumbnail = comment.kind!='more'
		    			? "<div class='thumb pull-left "+getIcon(comment.data.subreddit)+"'></div>"
		    			: "<a style='padding: 5px 0 0 5px;'class='pull-left' href='#'><i class='fa fa-download'></i></a>",
		    		media = "<div id='"+comment.data.name+"' class='media parent'>"+thumbnail+body+"</div>"
		        $frameContent.append(media);
			});
			fadeIn($frameContent, 1000);
			$('.md a').attr('target','_blank');
			bindPostProcessComments();
			bindShowReply();
		}
		function getReplies(repliesArray) {
			repliesArray = repliesArray || []; var htmlString = '';
			repliesArray.forEach(function(reply) {
				var replies = reply.kind!='more'&&reply.data.replies.hasOwnProperty('data')
						? reply.data.replies.data.children:[], replyLength = replies.length,
					replyText = replyLength==0 ? "" : replyLength==1 ? replyLength+" reply" : replyLength+" replies";
				var footer = reply.kind!='more' ? "<footer class='comment-footer'><div class='time-container'>"+getTimeElapsed(reply.data.created_utc)+"</div>	<div class='links-container'><i class='fa fa-reply fa-lg'></i><a href='"+getPermalink(reply.data.link_id,reply.data.id)+"' target='_blank'><i class='fa fa-link fa-lg'></i></a><i class='fa fa-newspaper-o fa-lg'></i><i class='fa fa-reddit fa-lg'></i></div>" : "",
					text = $("<div/>").html(reply.data.body_html).text()+footer+getReplies(replies),
		    		heading = reply.kind!='more'
		    			? "<p class='media-heading'><a style='color:white;' href='http://www.reddit.com/u/"+reply.data.author+"' target='_blank'>"+reply.data.author+"</a>  |  "+reply.data.score+"  |  <a data-name='"+reply.data.name+"' class='reply'><span class='text-warning'>"+replyText+"</span></a></p>"+text
		    			: "<div class='loadReplies' id='"+reply.data.id+"' data-name='"+reply.data.name+"' data-parent='"+reply.data.parent_id+"'>load "+reply.data.count+" replies</div><p></p>";
		    		body = "<div style='padding-top:5px;' class='media-body'>"+heading+"</div>",
		    		thumbnail = reply.kind!='more'
		    			? "<div class='thumb pull-left'></div>"
		    			: "<a style='padding: 5px 0 0 5px;'class='pull-left' href='#'><i class='fa fa-download'></i></a>",
		    		media = "<div id='"+reply.data.name+"' class='media hide'>"+thumbnail+body+"</div>";
		    	htmlString += media;
			});
			return htmlString;
		}
		function bindShowReply(){ 
			$('.reply').unbind('click').click(function(){ 
				$('#'+$(this).data('name')).find('.hide').removeClass('hide');
			});
		}
		function bindPostProcessComments() {
			$('.loadReplies').unbind('click').click(function() { 
				var team = $(this).data('team'), parent = $(this).data('parent'),
					path = team=='team1' ? $('#threads-1').val() : $('#threads-2').val();
				getPosts(path+parent.substr(3),'',team, function(data, team) {
					var htmlString = getReplies(data[1].data.children, team)
					$('#'+parent).replaceWith(htmlString);
					if ($('#'+parent).parent().attr('id')=='merger' && !$('#'+parent).hasClass('parent')) {$('#'+parent).addClass('parent')}
					$('.media:not(.faded)').find('.md a').attr('target','_blank');
					fadeIn('.media:not(.faded)', 1000);
				})
			});
		}
		function getPermalink(link_id, id) {
			// permalink = http://www.reddit.com/comments/<link_id>1p3qau/_/<id>ccz05xk
			return "http://www.reddit.com/comments/"+link_id.substr(3)+"/_/"+id
		}
		function getTimeElapsed(then) {
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
			if (!days==0) {
				return days+'d'
			} else if (days==0&&!hours==0) {
				return hours+'h'
			} else if (days==0&&hours==0&&!minutes==0) {
				return minutes+'m'
			} else if (days==0&&hours==0&&minutes==0&&!seconds==0){
				return seconds+'s'
			} else { return date.toLocalTimeString(); }
		}
		function getMergedData(dataArray) {
			var children = [];
			dataArray.forEach(function(data, i){ children = children.concat(data[1].data.children)})
			children = 
			children.filter(function(x){ if (x.kind != 'more') return x }) // remove 'more comments' from parent
					.sort(function(a,b){ // sort array by time created
						if (a.kind != 'more' && b.kind == 'more') return 1
						if (a.kind == 'more' && b.kind != 'more') return -1
						if (a.data.created_utc < b.data.created_utc) return 1
						if (a.data.created_utc > b.data.created_utc) return -1
						return 0	
					})
			dataArray[0][1].data.children = children
			return dataArray[0];
		}
		function getPosts(path, sort, limit, obj){
			$.getJSON("http://www.reddit.com"+path+"/.json?sort="+sort+"&limit="+limit+"&jsonp=?", function(data) {
			    obj.callback(data, obj.target)
			})
			.fail(function() {
				console.log('error retrieving - '+path+' json'); 
				obj.callback([], obj.target)
			})
			.always(function() {
				if (obj.always) obj.always(obj.target)
			})
		}
		return {
			init : function() {
				pjx();
				listsjs();
				merger();
			}
		};
	})(jQuery);

	$(document).ready(function() {
		app.init();
	});
	Array.prototype.remove = function(from, to) {
	  var rest = this.slice((to || from) + 1 || this.length);
	  this.length = from < 0 ? this.length + from : from;
	  return this.push.apply(this, rest);
	};	
}