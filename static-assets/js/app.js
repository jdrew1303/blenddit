if (!window.jQuery === 'undefined') {
	throw new Error('app.js requires jQuery');
} else {
	var app = (function($) {
		function pjx() {
			$(document).pjax('a[data-pjax]', '#pjax-container')
			$(document).on('pjax:send', function() {
  				$('#loading').show()
			})
			$(document).on('pjax:complete', function() {
  				$('#loading').hide();
			});
		}
		return {
			init : function() {
				pjx();
			}
		};
	})(jQuery);

	$(document).ready(function() {
		app.init();
	});	
}
