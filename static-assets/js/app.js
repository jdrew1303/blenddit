if (!window.jQuery === 'undefined') {
	throw new Error('app.js requires jQuery');
} else {
	var app = (function($) {
		function pjx() {
			$(document).pjax('a[data-pjax]', '#pjax-container')
			$(document).on('pjax:send', function() {
			})
			$(document).on('pjax:end', function() {
  				if ($('#listsjs').length>0) {
  					listsjs();
  				} else {
  					$('#listsjsIndex').hide()
  					$('.navbar-brand > .text-warning').text('kurtlocker.org')
  				}
			});
		}
		function listsjs() {
			if ($('#listsjs').length>0) {
				$('#listsjsIndex').show()
				$('.navbar-brand > .text-warning').text('[ l [ i [ s ] t ] s ]')  
				$('div.js').each(function(i, block) { // code hightlight
					$(block).text($(block).text().trim()) 
				 	hljs.highlightBlock(block);
				});
				$('#listsjsIndex').unbind('click').click(function(e) { // sidebar toggle
			    	e.preventDefault();
        			$("#wrapper").toggleClass("toggled");
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
		return {
			init : function() {
				pjx();
				listsjs();
			}
		};
	})(jQuery);

	$(document).ready(function() {
		app.init();
	});	
}