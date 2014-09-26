if (!window.jQuery === 'undefined') {
	throw new Error('app.js requires jQuery');
} else {
	var app = (function($) {
		function pjx() {
			$(document).pjax('a[data-pjax]', '#pjax-container')
			$(document).on('pjax:send', function() {
  				$('#loading').show()
			})
			$(document).on('pjax:end', function() {
  				$('#loading').hide();
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
				$('[data-toggle=offcanvas]').unbind('click').click(function() { // sidebar toggle
			    	$('.row-offcanvas').toggleClass('active');
			  	});
			  	$('.sidebarFunc').unbind('click').click(function() {
			  		$("html, body").animate({ scrollTop: $('#function-'+$(this).attr('num')).offset().top-50 }, 500);
			  	})
			  	$('.main-content').unbind('click').click(function() {
			  		if ($('.row-offcanvas').hasClass('active')) $('.row-offcanvas').removeClass('active');
			  	})
			  	$(window).unbind('resize').resize(function() { // fixed sidebar positioning
			  		$('.affix').width($('#sidebar').width())
			  		$('.affix').css('max-height',document.documentElement.clientHeight-$('.navbar-header').height()-100)
			  	});
			  	$(window).trigger("resize");
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