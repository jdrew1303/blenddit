if (!window.jQuery === 'undefined') {
	throw new Error('app.js requires jQuery');
} else {
	var app = (function($) {
		var isListsjs = false;
		function pjx() {
			$(document).pjax('a[data-pjax]', '#pjax-container')
			$(document).on('pjax:send', function() {
  				$('#loading').show()
			})
			$(document).on('pjax:end', function() {
  				$('#loading').hide();
  				$('#listsjs').length>0 && !isListsjs 
  					? highlight() : isListsjs = false
			});
		}
		function highlight() {
			if ($('#listsjs').length>0) {
				isListsjs = true; 
				$('div.js').each(function(i, block) {
					$(block).text($(block).text().trim()) 
				 	hljs.highlightBlock(block);
				});
			}
		}
		return {
			init : function() {
				pjx();
				highlight();
			}
		};
	})(jQuery);

	$(document).ready(function() {
		app.init();
	});	
}
