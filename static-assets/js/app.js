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
			config = localStorage.getItem('config') ? getFromCache('config') : [],
			watch = localStorage.getItem('watch') ? getFromCache('watch') : {};
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
				$('.open-controls').unbind('click').click(function() {launchControls();})
				$('#delete-column').unbind('click').click(function() {
					config.remove($(this).data('column'));
					deleteRefresh($(this).data('column'))
					setInCache('config', config);
					buildConfigurationPanel();
					buildConfigToUI(); 
				})
				if (config.length > 0) {
					buildConfigurationPanel();
					buildConfigToUI(); 
				} else {
					watchList();
				}
				contentResizeEvent();
			}
		}
		function popOverOptions(paramPlacement, paramTitle, paramContent) {
			return {placement:paramPlacement, title:paramTitle,content:paramContent, trigger:'manual'};
		}
		function watchList() {
			var localWatch;
			Object.keys(watch).length
				? localWatch = watch 
				: localWatch = {subs:['nfl','nba', 'mlb', 'nhl', 'mls', 'hockey', 'soccer'], match:['Game Thread','Match Thread','Live Thread']}
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
			subs.forEach(function(sub, index) { subHtml += buildWatchInputOrThreadHtmlString(sub, 'input'); });
			matchs.forEach(function(match, index){ matchHtml += buildWatchInputOrThreadHtmlString(match, 'input');});
			$('#watch-subreddits .list-group.contain, #watch-matching .list-group.contain').children().remove();
			$('#watch-subreddits .list-group.contain').append(subHtml);
			$('#watch-matching .list-group.contain').append(matchHtml);
		}
		function fetchWatchThreads(matchingArray) {
			$('#watch-threads .list-group.contain').children().remove();
			$('#watch-subreddits input').each(function(i, sub){ 
				getPosts('/r/'+sub.value, '', '', {target:matchingArray, callback: function(data, target){ 
					data.data.children.forEach(function(thread, index) { 
						if (matchingArray.some(function(str){
							var pattern = new RegExp(str.toLowerCase());
							return pattern.test(thread.data.title.toLowerCase())
						})) {
							$('#watch-threads .list-group.contain').append(buildWatchInputOrThreadHtmlString(thread.data))
						}
						fadeIn($('#watch-threads .list-group-item'),100);
						bindWatchThreads()
					})
				}})
			})
		}
		function bindDeleteWatchButtons() {
			$('#watch-subreddits .input-group-addon, #watch-matching .input-group-addon').unbind('click').click(function() {
				$(this).parent().parent().remove();
			});
		}
		function bindWatchAdd() {
			$('#watch-subreddits .btn.add').unbind('click').bind('click', function() {
				$('#watch-subreddits .list-group.contain').addListItem();
				bindDeleteWatchButtons();
			})
			$('#watch-matching .btn.add').unbind('click').bind('click', function() {
				$('#watch-matching .list-group.contain').addListItem();
				bindDeleteWatchButtons();
			})
		}
		function bindWatchRefresh() {
			$('#watch-threads .btn.refresh').unbind('click').bind('click', function() {
				saveWatchList();
				watchList();
			})
		}
		function bindWatchSave() {
			$('#watch-subreddits .btn.save, #watch-matching .btn.save, #watch-threads .btn.save').unbind('click').bind('click', function() {
				function notEmpty(x) { return !($(x).val()=="") };
				var $watchSubs = $('#watch-subreddits .list-group.contain'), $watchMatching = $('#watch-matching .list-group.contain');
				if ($watchSubs.children().length==0 || !any($watchSubs.find('input'),notEmpty) || $watchMatching.children().length==0 || !any($watchMatching.find('input'),notEmpty)) { // validation
					$('#watch-subreddits .list-group-item.controls, #watch-matching .list-group-item.controls, #watch-threads .list-group-item.controls').launchPopOver(3000, popOverOptions('top','Verification','Verify you have one subreddit and one matching pattern added with values.'));
				} else {
					saveWatchList();
					if ($(this).hasClass('wthreads')) {
						function hasWhite(x) { return $(x).hasClass('white')} 
						if (any('#watch-threads .list-group.contain li', hasWhite)) {
							// build column
						} else {
							$('#watch-threads .list-group-item.controls').launchPopOver(3000, popOverOptions('top','Verification', 'Please select at least one thread from the list.'));
						}
					}
				}
			})
		}
		function saveWatchList() {
			var watchList = {}
			watchList.subs = function(){ 
				var subsArray = [];
				$('#watch-subreddits .list-group.contain input').each(function(i, input) { 
					input.value != "" && input.value != null ? subsArray.push(input.value) : ''
				}); return subsArray;
			}();
			watchList.match = function(){ 
				var matchArray = [];
				$('#watch-matching .list-group.contain input').each(function(i, input) { 
					input.value != "" && input.value != null ? matchArray.push(input.value) : ''
				}); return matchArray;
			}();
			watch = watchList;
			setInCache('watch', watch);
		}
		function bindWatchThreads() {
			$('#watch-threads .list-group-item').unbind('click').click(function() {
				$(this).hasClass('white') ? $(this).removeClass('white') : $(this).addClass('white');
			});
		}
		function buildWatchInputOrThreadHtmlString(thing, type) {
			return  type == 'input'
				? "<li class='list-group-item'><div class='input-group'><input class='form-control' type='text' value='"+thing+"'></input><span class='input-group-addon'><i class='fa fa-close'></i></span></div></li>"
				: "<li class='list-group-item nopacity'>"+thing.title+" <span class='text-primary'>in /r/"+thing.subreddit+"</span><span class='badge pull-right'>"+getTimeElapsed(thing.created_utc)+"</span></li>"
		}
		function contentResizeEvent() {
			app.height = window.innerHeight;
			$('.frame-content, .edit-form').css('height', window.innerHeight-107);
			$(window).unbind('resize').bind('resize', function(){
				if (app.height != window.innerHeight) {
					$('.frame-content, .edit-form').css('height', window.innerHeight-107);
					app.height = window.innerHeight;
				}
			});
		}
		function launchControls() {
			vendorGroupDisplay();
			buildConfigurationPanel();
			bindAccounts();
			$('#save-changes').unbind('click').bind('click',function() {
				addColumnToConfig();
				setInCache('config', config);
				buildConfigToUI();
			});
			$('#controlModal').unbind('hide.bs.modal').on('hide.bs.modal', function (e) {
				$('#config-rows').children().remove();
			})
			$('#controlModal').modal();
		}
		function bindAccounts() {
			fadeIn($('a.white'),100);
			$('#reddit-logout').unbind('click').bind('click', function() { 
				genericGet('/reddit-logout', function(data, textStatus, jqXHR) {
					$('.config-account').children().remove()
					$('.config-account').append(data);
					fadeIn($('a.white'),100);
				})
			})
		}
		function vendorGroup() {
			$('#reddit-block, #twitter-block').unbind('click').bind('click',function(){
				if (this.id == 'reddit-block') {
					bindAddThreadButton('#reddit','column-settings', 'sub-group-controls', 'subreddit-controls', 'thread-controls', 'delete-controls');
					bindCancelButton();
					$('#vendor-group, #reddit').toggleClass('hide');
				} // else if (twitter block)
			})
		}
		function addColumnToConfig() {
			if (!$('#reddit').hasClass('hide') && any('.thread-controls', function(x){ return !($(x).val()==null)})) {
				// Validate - Does the user have at least one thread?
				// Reset add column functionality, take back to "Add Column"
				updateConfigObj('.sub-group-controls', '.subreddit-controls', '.thread-controls', '#reddit .column-settings');
				buildConfigurationPanel();
				$('#cancel-column').trigger('click')
			}
		}
		function buildConfigToUI() {
			$('.carousel-inner').children().remove();
			if (config.length==0) {
				$('#greeting').show();
				$('#watch-threads .list-group.contain').children().length == 0 ? watchList() : ''; 
			} else {
				$('#greeting').hide();
			}
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
					config[columnNum] ? getCommentsForColumn(config[columnNum], columnNum) : clearInterval(app['r'+columnNum]);
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
					if (config[target].threads && config[target].threads.length == dataArray.length) { // done aggregating data from threads of config[target]
						var mergedData = getMergedData(dataArray);
						if ($(".frame-content[data-column="+columnNum+"]").children().length==0 && mergedData[1].data.children.length>0) {
							markFirstComment(mergedData[1].data.children[0].data.name, target);	
						}
						displayComments(mergedData, target);
						hideLoader(target);
					}
				}})
			}
		}
		function markFirstComment(firstCommentName, column) {
			if (typeof firstCommentName !== "undefined") {
				app['firstComment'+column] = firstCommentName
			} 
		}
		function buildConfigurationPanel() {
			if (config.length > 0) {  // columns exist
				$('#current-config').removeClass('hide');
				var $configAccordions = $('#accordion'), configPanelHtml = '';
				$configAccordions.children().remove();
				for (var i = 0, len = config.length; i < len; i++) {
					var header = '<div class="panel-heading" role="tab" id="heading'+i+'"><h4 class="panel-title"><a data-toggle="collapse" data-parent="#accordion" href="#collapse'+i+'" aria-expanded="true" aria-controls="collapse'+i+'">'+(i+1)+'. '+config[i].settings.name+'</a></h4></div>',
						body = '<div id="collapse'+i+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading'+i+'"><div class="panel-body">Test</div></div>',
						panel = '<div class="panel panel-default">'+header+body+'</div>';
					configPanelHtml += panel;
				}
				$configAccordions.append(configPanelHtml)
			} else { $('#current-config').removeClass('hide').addClass('hide'); }
		}
		function updateConfigObj(parentClass, subClass, threadClass, settingsClass, num) {
			var column = {}, setting = {}, threads = [], $group = $(parentClass), settings = $(settingsClass).find('.form-control'),
				type = typeof num !== 'undefined' && $(".frame-position[data-column="+num+"]").data('type')=='reddit' || !$('#reddit').hasClass('hide') ? 'reddit' : 'twitter';
			$group.each(function(index, el) {
				if ($(el).find(threadClass).val()) {
					var thread = {}, $option = $(el).find(threadClass+' option:selected');
					thread['subreddit'] = $(el).find(subClass).val();
					thread['thread'] = $(el).find(threadClass).val();
					thread['threadid'] = $option.data('threadid');
					thread['threadtitle'] = $option.data('threadtitle');
					thread['subid'] = $option.data('subid');
					threads.push(thread);
				}
			});
			if ($group.length>0) {
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
					$select.append("<option data-subid='"+threadObj.subid+"' data-threadtitle='"+threadObj.threadtitle+"' data-threadid='"+threadObj.threadid+"' value='"+threadObj.thread+"'>"+threadObj.threadtitle+"</option>")
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
		function buildReplyForm(thing_id, author, replyLength) {
			var buttons = "<div class='reply-buttons'><button class='cancel-reply btn btn-default'>Cancel</button><button type='submit' class='save-reply btn btn-primary'>Save</button></div>",
				parentInput = "<input type='hidden' name='thing_id' value='"+thing_id+"''>",
				textarea = "<textarea name='text' class='form-control' placeholder='Reply to "+author+"..'></textarea>",
				form = "<div class='nopacity hide reply-form'><div class='submitting nopacity hide'>Submitting...</div><form action='javascript:void(0)'>"+parentInput+textarea+buttons+"</form></div>";
			return form;
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
				var thing_id = this.form.thing_id.value,
					text = this.form.text.value,
					$submitting = $(this.form.previousSibling);
				if (text.length==0) return;
				$(this.form).addClass('hide');
				fadeIn($submitting.removeClass('hide'), 100);
				function done(data, textStatus, jqXHR) {
					data && data.needsLogin ? $('#login-reddit-modal').modal()
						: data.statusCode ? console.log(data.statusCode)
							: data.json && data.json.errors.length > 0 ? console.log(data.json.errors)
								: insertReplyIntoDOM(data.json.data.things);
				}
				function fail(jqXHR, textStatus, errorThrown){
					console.log(textStatus)
				}
				var formData = {thing_id: thing_id, text: text };
				genericPost('/save-reddit-reply', formData, done, fail);

			})
			$('.cancel-reply').unbind('click').click(function() { 
				console.log('shut it down!')
			})
		}
		function insertReplyIntoDOM(objArray) {
			$(buildCommentHtmlString(objArray,true)).insertAfter('#'+objArray[0].data.parent_id+' .comment-footer:first');
			$('#'+objArray[0].data.parent_id+' .fa-reply:first').trigger('click');
			commentBindings();
			fadeIn($('#'+objArray[0].data.name), 100);
		}
		function commentBindings() {
			$('.md a').each(function(index, el) {
				$(el).attr('target','_blank');
				$(el).attr('href').substring(0,3)=='/u/' || $(el).attr('href').substring(0,3)=='/r/'
					? $(el).attr('href', 'http://www.reddit.com'+$(el).attr('href')) : '';
			});
			bindReplySwitch();
			bindRefreshComment();
			bindShowReply();
		}
		function displayComments(data, columnNum) {
			var $frameContent = $(".frame-content[data-column="+columnNum+"]");
			if (!$frameContent.children().length) { // first time load
				$frameContent.append(buildCommentHtmlString(data[1].data.children, false, true)); 
				fadeIn($frameContent, 1000);
			} else { // subsequent loads
				var cachedfirstComment = app['firstComment'+columnNum];
				if (!(cachedfirstComment == data[1].data.children[0].data.name)) {
					var newComments = takeWhile(data[1].data.children, cachedfirstComment, function(x, commentName){ 
						return x.data.name != commentName;
					})
					$(buildCommentHtmlString(newComments, true, true)).insertBefore(".frame-content[data-column="+columnNum+"] #"+cachedfirstComment);
					newComments.forEach(function(comment){ fadeIn($('#'+comment.data.name),500) })
					$('.frame-overlay[data-column='+columnNum+']').launchPopOver(3000, popOverOptions('bottom','',newComments.length+' new comments!'))
					markFirstComment(data[1].data.children[0].data.name, columnNum);
				}
				updateCommentStats(data[1].data.children)
			}	
			commentBindings();
		}
		function updateCommentStats(comments) { 
			comments.forEach(function(comment){
				var replies = comment.kind!='more' && comment.data.replies.hasOwnProperty('data') 
					? comment.data.replies.data.children : [], replyLength = replies.length,
					commentId = '#'+comment.data.name,
					commentFooter = commentId+' .comment-footer[data-id='+comment.data.name+']'
				typeof comment.data.created_utc !== 'undefined' ? $(commentFooter+' .time-elapsed').text(getTimeElapsed(comment.data.created_utc)) : '';
				typeof comment.data.score !== 'undefind' ? $('.score[data-id='+comment.data.name+']').text(comment.data.score) : '';
				newCommentsOnRefresh(replyLength, comment.data.name, commentFooter);
				updateCommentStats(replies);
			})
		}
		function newCommentsOnRefresh(replyLength, name, commentFooter) {
			var $preloadedReplies = $('#'+name+' .media[data-parentid='+name+']'),
				$replySwitch = $(commentFooter+' .reply'),
				$replyNum = $(commentFooter+' .reply .reply-num'),
				newRepliesNum = replyLength - $preloadedReplies.length,
				newButton = "<a class='btn new-comment'><span class='text-primary diff'>"+newRepliesNum+" new</span></a>",
				optionalExpander = "<span class='reply-num text-warning'>"+replyLength+"</span><span class='text-warning'>&nbsp;<i class='fa expand fa-plus-square'></i>&nbsp;</span>";
			if (replyLength > 0 && $replySwitch.length>0) { // replies exist already 
				$replySwitch.data('replylength', replyLength);
				$replyNum.text(replyLength);
				if (newRepliesNum > 0 && $(commentFooter+' .new-comment').length==0) { 
					$(newButton).insertAfter(commentFooter+' .reply');
					newCommentBind(commentFooter+' .new-comment');
				} else {
					if (!$('footer[data-id='+name+'] .reply').children().length && $preloadedReplies.length>0) {
						$('footer[data-id='+name+'] .reply').append(optionalExpander)
						$('footer[data-id='+name+'] .reply .expand').toggleClass('fa-plus-square fa-minus-square') 
					}
					$(commentFooter+' .new-comment .diff').text(newRepliesNum+' new');
					newCommentBind(commentFooter+' .new-comment');
				}
			} else if (replyLength > 0) { // replies don't exist until now
				var existingRepls = "<a data-name='"+name+"' data-replylength='"+replyLength+"' class='btn reply'></a>";
				$(existingRepls).insertAfter(commentFooter+' .refresh-comment')
				if (newRepliesNum > 0) {
					$(newButton).insertAfter(commentFooter+' .reply');
					newCommentBind(commentFooter+' .new-comment');
				}
				if ($preloadedReplies.hasClass('faded')) {
					$('footer[data-id='+name+'] .reply').append(optionalExpander);
					$('footer[data-id='+name+'] .reply .expand').toggleClass('fa-plus-square fa-minus-square')	
				}
			}
		}
		function newCommentBind(newCommentSpan) {
			$(newCommentSpan).unbind('click').bind('click', function() {
				$(this).parent().parent().find('.refresh-comment').trigger('click');
			});
		}
		function buildCommentHtmlString(commentsArray, optionalNopacity, isParent, hide) {
			commentsArray = commentsArray || []; var htmlString = '';
			commentsArray.forEach(function(comment,i) {
				var replies = comment.kind!='more'&&comment.data.replies.hasOwnProperty('data') 
						? comment.data.replies.data.children:[], replyLength = replies.length;
				var footer = comment.kind!='more' ? "<footer data-id='"+comment.data.name+"' class='comment-footer'><div class='links-container btn-group'><a class='btn time-elapsed white'>"+getTimeElapsed(comment.data.created_utc)+"</a><a class='btn reply-switch'><i class='fa fa-reply fa-lg'></i></a><a class='btn perma' href='"+getPermalink(comment.data.link_id,comment.data.id)+"' target='_blank'><i class='fa fa-link fa-lg'></i></a><a class='btn refresh-comment' data-linkid='"+comment.data.link_id+"' data-id='"+comment.data.id+"'><i class='fa fa-refresh fa-lg'></i></a>"+(replyLength!=0 ? "<a data-name='"+comment.data.name+"' data-replylength='"+replyLength+"' class='btn reply'><span class='reply-num text-warning'>"+replyLength+"</span><span class='text-warning'>&nbsp;<i class='fa expand fa-plus-square'></i>&nbsp;</span></a>" : '')+"</div>"+buildReplyForm(comment.data.name, comment.data.author)+"</footer>" : "",
					text = $("<div/>").html(comment.data.body_html).text()+footer+buildCommentHtmlString(replies, true, false, true),
		    		heading = comment.kind!='more' 
		    			? "<div class='media-heading btn-group'><a class='btn vote'><i class='fa fa-arrow-up'></i></a><a data-id='"+comment.data.name+"' class='score btn'>"+comment.data.score+"</a><a class='btn vote vote-last'><i class='fa fa-arrow-down'></i></a><a class='btn author' href='http://www.reddit.com/u/"+comment.data.author+"' target='_blank'>"+comment.data.author+"</a>"+(comment.data.author_flair_css_class ? "<a class='flair btn'>"+comment.data.author_flair_css_class+"</a>" : "&nbsp;")+"</div>"+text
		    			: "<div class='load-comments' data-parent='"+comment.data.parent_id+"' class='load-comments'><i class='fa fa-download'></i>&nbsp; load more comments</div>"+text;
		    		body = "<div class='media-body'>"+heading+"</div>",
		    		thumbnail = comment.kind!='more' ? "<div class='thumb pull-left "+(isParent ? getIcon(comment.data.subreddit) : '')+"'></div>" : "",
		    		media = "<div data-parentid='"+comment.data.parent_id+"' data-linkid='"+comment.data.link_id+"' data-icon='"+getIcon(comment.data.subreddit)+"' id='"+comment.data.name+"' class='media"+(isParent ? ' parent ' : hide ? ' hide' : '')+""+(optionalNopacity ? ' nopacity' : '')+"'>"+thumbnail+body+"</div>"
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
					$icon.removeClass('fa-plus-square').addClass('fa-minus-square')
					fadeIn($replies.removeClass('hide'), 100);
				} else {
					$icon.removeClass('fa-minus-square').addClass('fa-plus-square')
					$replies.removeClass('faded').addClass('hide')
				}
			});
		}
		function bindRefreshComment() {
			$('.refresh-comment, .load-comments').unbind('click').bind('click', function() {
				var linkid = $(this).data('linkid'), 
					id = $(this).data('id') ? $(this).data('id') : $('#'+$(this).data('parent')).attr('id').substr(3),
					isTopLevel = $('#t1_'+id).hasClass('parent');
				getComments(linkid ? linkid : $('#'+$(this).data('parent')).data('linkid'), id, function(data){
					var htmlString = buildCommentHtmlString(data[1].data.children);
					$('#t1_'+id).replaceWith(htmlString);
					if (isTopLevel) { 
						$('#t1_'+id).addClass('parent');
						$('#t1_'+id).children(':first').addClass($('#t1_'+id).data('icon'));
					}
					$('footer[data-id=t1_'+id+'] .reply .expand').toggleClass('fa-plus-square fa-minus-square')
					$('#t1_'+id+' .media[data-parentid='+$('#t1_'+id).attr('id')+']').removeClass('hide').addClass('faded');
					$('#t1_'+id).addClass('nopacity')	
					fadeIn($('#t1_'+id), 100);
					commentBindings();
				})
			})
		}
		function getComments(linkid, id, done, fail) {
			genericGet("http://www.reddit.com/comments/"+linkid.substr(3)+"/_/"+id+'.json?sort=new', done, fail);
		}
		function getPermalink(link_id, id) {
			// permalink = http://www.reddit.com/comments/<link_id>1p3qau/_/<id>ccz05xk
			return "http://www.reddit.com/comments/"+link_id.substr(3)+"/_/"+id
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
				return days+'d'
			} else if (days==0&&!hours==0) {
				return hours+'h'
			} else if (days==0&&hours==0&&!minutes==0) {
				return minutes+'m'
			} else if (days==0&&hours==0&&minutes==0&&!seconds==0){
				return seconds+'s'
			} else if ((nowMsec-(then*1000))<1000){
				return '1s'
			}else{ return date.toLocaleTimeString(); }
		}
		function getMergedData(dataArray) {
			var children = [];
			dataArray.forEach(function(data, i){
				if (data.length>0) { children = children.concat(data[1].data.children)} 
			})
			children = children.filter(function(x){ if (x.kind != 'more') return x }).sort(byTimeCreated)
			dataArray[0][1].data.children = children
			return dataArray[0];
		}
		function byTimeCreated(a,b) {
			if (a.kind != 'more' && b.kind == 'more') return 1
			if (a.kind == 'more' && b.kind != 'more') return -1
			if (a.data.created_utc < b.data.created_utc) return 1
			if (a.data.created_utc > b.data.created_utc) return -1
			return 0
		}
		function genericGet(url, done, fail, always) {
			$.ajax({ url: url, type: "GET", timeout:7000, cache: false })
			.done(function(data, textStatus, jqXHR) { if (done) done(data, textStatus, jqXHR); })
			.fail(function(jqXHR, textStatus, errorThrown) { if (fail) fail(jqXHR, textStatus, errorThrown); })
			.always(function() { if (always) always(); });
		}
		function genericPost(url, data, done, fail, always) {
			$.ajax({ url: url, type: 'POST', timeout:7000, data: data, cache: false })
			.done(function(data, textStatus, jqXHR) { if (done) done(data, textStatus, jqXHR);})
			.fail(function(jqXHR, textStatus, errorThrown) { if (fail) fail(jqXHR, textStatus, errorThrown);})
			.always(function() { if (always) always(); });
		}
		function getPosts(path, sort, limit, obj){
			$.ajax({
				url: "http://www.reddit.com"+path+"/.json?sort="+sort+"&limit="+limit+"&jsonp=?",
				dataType: 'json',
				timeout: 7000,
				cache: false
			})
			.done(function(data, textStatus, jqXHR) {
				obj.callback(data, obj.target)
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				if (errorThrown=='timeout') { // 504 Gateway Timeout - connection to reddit server error - display to user
					console.log(textStatus);
				} else { console.log(errorThrown+': error retrieving - '+path);}
				hideLoader(obj.target);
			})
			.always(function() {
				if (obj.always) obj.always(obj.target);
			});
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
}
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
function takeWhile(arr, param, f) {
	var returnArr = [];
	for (var i = 0, len = arr.length; i < len; i++) {
		if (f(arr[i], param)) { returnArr.push(arr[i]) }
		else { break; }
	}
	return returnArr;
}
function any(cls, f) { 
	var bool = false
	$(cls).each(function(i,elem) {
		if (f(elem)) { bool = true; return;}
	}); return bool;
}
$.fn.launchPopOver = function(closeTime, options) {
	var that = this;
	$(this).popover('destroy');
	$(this).popover(options);
	$(this).popover('show');
	setTimeout(function(){ 
		$(that).popover('destroy') 
	}, closeTime);
	return this;
}
$.fn.addListItem = function() { // call on ul element
	$(this).append('<li class="list-group-item"><div class="input-group"><input class="form-control" type="text"><span class="input-group-addon"><i class="fa fa-close"></i></span></div></li>');
	return this;
}