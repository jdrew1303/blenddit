/* TODO
	- loadReplies not working for particular comments.
	- Remove makeDelay, just make .media elements fade in all at once
	- fix error on permalink for .both | use data
	- Create error message for 404 get requests to reddit 
	- Link to parent reddit thread?
	- Twitter as a form of source content. (smashing node)
	- Migrate all client-side fetching of content (reddit/twitter) to server side: 
		- Use techniques from smashing node (http/querystring) to build structured html objects
		  for handlebars to template out. (Removes all logic from app.js)
	- modal control panel instead of footer controls (implement wizard?)
		- fields:
			Content Source: NFL, NHL, etc.
				subreddit-1 or custom input 
				subreddit-2 or custom input
			Refresh Rate: 30, 35, 40 seconds (count down timer)
			Sort by: New, best, etc. 
	FUTURE EXPANSION
	- diferrent sports? NBA, CFB, NHL?
*/
if (!window.jQuery === 'undefined') {
	throw new Error('app.js requires jQuery');
} else {
	var app = (function($) {
		var refresh, countdown, refreshSwitch = true,
			dataResponse;
		function pjx() {
			$(document).pjax('a[data-pjax]', '#pjax-container')
			$(document).on('pjax:send', function() {})
			$(document).on('pjax:end', function() {
  				if ($('#listsjs').length>0) { listsjs();  
  				} else if ($('#merger').length>0) { merger();
  				} else {
  					$('.teams').hide(); 
  					$('#sidebarTrigger').hide()
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
				$('.teams').show(); $('.social').hide();
				$('.navbar-brand > .text-warning').text('thread merger')

				/* Click handler on team dropdown that populates the threads with parent content*/
				$('#team1, #team2').unbind('change').change(function() { 
					if (this.id=="team1" && this.value != 'default') {
						getPosts(this.value, '', "team1", setThreads);
					} else if (this.id=="team2" && this.value != 'default') {
						getPosts(this.value, '', "team2", setThreads);
					}
				});
				appendRefreshOptions();
				$('#refresh').unbind('change').change(function() { $('#threads-1').trigger('change'); $('#refreshNumber').text($('#refresh').val())})
				$('.open-controls').unbind('click').click(function() {$('#controlModal').modal();})
				$('.refreshSwitch').unbind('click').click(function() { 
					if ($(this).hasClass('fa-toggle-on')) { 
						$('.refreshSwitch').removeClass('fa-toggle-on'); $('.refreshSwitch').addClass('fa-toggle-off');
						clearTimeout(refresh);
						refreshSwitch = false;
						$('#refreshNumber').text($('#refresh').val())
					} else {
						$('.refreshSwitch').removeClass('fa-toggle-off'); $('.refreshSwitch').addClass('fa-toggle-on');
						clearTimeout(refresh); refreshSwitch = true;
						$('#threads-1').val()!=null 
							? $('#threads-1').trigger('change') : $('#threads-2').trigger('change');
					}
				})
			}
		}
		function appendRefreshOptions() {
			var select = document.getElementById('refresh');
			for (var i = 1; i <= 100; i++) { 
				var option = document.createElement("option");
				if (i==60) option.setAttribute('selected',true);
				option.value=i; option.text = i+' seconds'; select.add(option);
			}
		}
		/* populate the thread drop downs with team posts to select from. Get the comments from the thread selected */
		function setThreads(data, teamNum) {
			var $select = teamNum==="team1" ? $('#threads-1') : $('#threads-2')
			$select.children().remove();
			data.data.children.forEach(function(post,i) {
				$select.append("<option value='"+post.data.permalink+"'>"+post.data.title+"</option>")
			})
			$select.unbind('change').change(function() {
				if ($('#threads-1').val()==null || $('#threads-2').val()==null) {
					var team = this.id==="threads-1" ? "team1":"team2", path = this.value;
					getPosts(path, 'sort=new&', team, displayComments)
					clearTimeout(refresh);
					if (refreshSwitch) refresh = refreshThreads($select);
				} else {
					clearTimeout(refresh);
					if (refreshSwitch) refresh = refreshThreads($select);
					getPostsFromActiveThreads()
				}
			})
			$select.trigger('change');
		}
		function refreshThreads(select) {
			return setTimeout(function() { $(select).trigger('change');}, $('#refresh').val()*1000);
		}
		function getIcon(subreddit) {
			return 'icon-'+subreddit;
		}
		function displayComments(data, teamNum) {
			$('.team1, .team2, .both').remove();
			data[1].data.children.forEach(function(comment,i) {
				var replies = comment.kind!='more'&&comment.data.replies.hasOwnProperty('data') ? comment.data.replies.data.children:[], replyLength = replies.length,
					replyText = replyLength==0 ? "" : replyLength==1 ? replyLength+" reply" : replyLength+" replies";
				var footer = comment.kind!='more' ? "<footer class='comment-footer'><div class='time-container'>"+getTimeElapsed(comment.data.created_utc)+"</div><div class='links-container'><i class='fa fa-reply fa-lg'></i><a href='"+getPermalink(comment.data.link_id,comment.data.id)+"' target='_blank'><i class='fa fa-link fa-lg'></i></a><i class='fa fa-newspaper-o fa-lg'></i><i class='fa fa-reddit fa-lg'></i></div>" : "",
					text = $("<div/>").html(comment.data.body_html).text()+footer+getReplies(replies, teamNum),
		    		heading = comment.kind!='more' 
		    			? "<p class='media-heading'><a style='color:white;' href='http://www.reddit.com/u/"+comment.data.author+"' target='_blank'>"+comment.data.author+"</a>  |  "+comment.data.score+"  |  <a data-name='"+comment.data.name+"' class='"+teamNum+" reply'><span class='text-warning'>"+replyText+"</span></a></p>"+text
		    			: "<div>load more comments</div>"+text;
		    		body = "<div style='padding-top:5px;' class='media-body'>"+heading+"</div>",
		    		thumbnail = comment.kind!='more'
		    			? "<div class='thumb pull-left "+getIcon(comment.data.subreddit)+"'></div>"
		    			: "<a style='padding: 5px 0 0 5px;'class='pull-left' href='#'><i class='fa fa-download'></i></a>",
		    		media = "<div id='"+comment.data.name+"' class='"+teamNum+" media parent "+comment.data.subreddit+"'>"+thumbnail+body+"</div>"
		        $('#merger').append(media);
			});
			$('.md a').attr('target','_blank');
			bindPostProcessComments();
			bindShowReply();
			setTimeout(function() { $('.media').addClass('faded');}, 1000);
		}
		function getReplies(repliesArray, teamNum) {
			repliesArray = repliesArray || []; var htmlString = '';
			repliesArray.forEach(function(reply) {
				var replies = reply.kind!='more'&&reply.data.replies.hasOwnProperty('data')
						? reply.data.replies.data.children:[], replyLength = replies.length,
					replyText = replyLength==0 ? "" : replyLength==1 ? replyLength+" reply" : replyLength+" replies";
				var footer = reply.kind!='more' ? "<footer class='comment-footer'><div class='time-container'>"+getTimeElapsed(reply.data.created_utc)+"</div>	<div class='links-container'><i class='fa fa-reply fa-lg'></i><a href='"+getPermalink(reply.data.link_id,reply.data.id)+"' target='_blank'><i class='fa fa-link fa-lg'></i></a><i class='fa fa-newspaper-o fa-lg'></i><i class='fa fa-reddit fa-lg'></i></div>" : "",
					text = $("<div/>").html(reply.data.body_html).text()+footer+getReplies(replies, teamNum),
		    		heading = reply.kind!='more'
		    			? "<p class='media-heading'><a style='color:white;' href='http://www.reddit.com/u/"+reply.data.author+"' target='_blank'>"+reply.data.author+"</a>  |  "+reply.data.score+"  |  <a data-name='"+reply.data.name+"' class='reply'><span class='text-warning'>"+replyText+"</span></a></p>"+text
		    			: "<div class='loadReplies' id='"+reply.data.id+"' data-name='"+reply.data.name+"' data-team='"+teamNum+"' data-parent='"+reply.data.parent_id+"'>load "+reply.data.count+" replies</div><p></p>";
		    		body = "<div style='padding-top:5px;' class='media-body'>"+heading+"</div>",
		    		thumbnail = reply.kind!='more'
		    			? "<div class='thumb pull-left'></div>"
		    			: "<a style='padding: 5px 0 0 5px;'class='pull-left' href='#'><i class='fa fa-download'></i></a>",
		    		media = "<div id='"+reply.data.name+"' class='"+teamNum+" media hide'>"+thumbnail+body+"</div>";
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
					setTimeout(function() { $('.media:not(.faded)').addClass('faded');}, 1000);
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
		function getPostsFromActiveThreads() {
			getPosts($('#threads-1').val(), 'sort=new&', "team1", function(data1, team1) {
				dataResponse = data1;
				getPosts($('#threads-2').val(), 'sort=new&', "team2", function(data2, team2) {
					var mergedResults = getMergedResults(dataResponse, data2);
					try { displayComments(mergedResults, 'both')
					} catch (e) { console.log(e) }
				});
			})
		}
		function getMergedResults(data1,data2) {
			var returnData;
			if (data1.length==0 && data2.length>0) { returnData = data2;
			} else if (data2.length==0 && data1.length>0) { returnData = data1;
			} else {
				var children = data1[1].data.children
					.concat(data2[1].data.children) // Merge all children from data2 into data1
					.filter(function(x){ if (x.kind != 'more') return x }) // remove 'more comments' from parent
					.sort(function(a,b){ // sort array by time created
						if (a.kind != 'more' && b.kind == 'more') return 1
						if (a.kind == 'more' && b.kind != 'more') return -1
						if (a.data.created_utc < b.data.created_utc) return 1
						if (a.data.created_utc > b.data.created_utc) return -1
						return 0	
					})
				data1[1].data.children = children
				returnData = data1
			}
			return returnData;
		}
		function getPosts(path, sort, teamNum, callback){
			if (!($('#refreshSpinner').length>0)) {$('#refreshNumber').text('').append("<span class='fa fa-refresh fa-spin'></span>");}
			$.getJSON("http://www.reddit.com"+path+"/.json?"+sort+"jsonp=?", function(data) {
			    callback(data, teamNum)
			})
			.fail(function() {console.log('error retrieving - '+path+' json'); callback([], teamNum)})
			.done(function() {
				$('#refreshNumber .fa-spin').remove()
				$('#refreshNumber').text($('#refresh').val());
			})
		}
		return {
			init : function() {
				pjx();
				listsjs();
				merger();
			},
			getPosts : getPosts
		};
	})(jQuery);

	$(document).ready(function() {
		app.init();
	});	
}