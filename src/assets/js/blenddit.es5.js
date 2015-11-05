"use strict";
var d = document;

/**
 * Abbreviated version of document.getElementById
 * @param  {element id}
 * @return {element}
 */
function byId(id){return document.getElementById(id)};

/**
 * Returns a attribute value based on the passed element id and 
 * attribute name.
 * @param  {element id}
 * @param  {element attribute name}
 * @return {value}
 */
function attr(id,attr){return byId(id).getAttribute(attr)};

/**
 * Boiler plate function to start configuring custom carousel
 * @return {void}
 */
function main_start_slick() {
	jQuery('.js-slider').slick({
		dots: true,
		infinite: false,
		speed: 300,
		slidesToShow: 4,
		slidesToScroll: 4,
		responsive: [
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: 3,
					slidesToScroll: 3,
					infinite: false,
					dots: true
				}
			},
			{
				breakpoint: 600,
				settings: {
					slidesToShow: 2,
					slidesToScroll: 2
				}
			},
			{
				breakpoint: 480,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1
				}
			}
		]
	});
}

/**
 * Load the stylesheets and fonts needed for production
 * @param  {boolean}
 * @return {void}
 */
function main_load_links(debug) {
	if (debug) { return void 0; }
	var head = d.getElementsByTagName('head')[0],
		version = attr('version','value'),
		links = [
			{ href: 
				['https://fonts.googleapis.com/css?family=Source+Sa',
				'ns+Pro:300,400,400italic,600,700%7COpen+Sans:300,',
				'400,400italic,600,700'].join(''), id:null },
			{ href: '/dist/assets/css/bootstrap.min.css?v='+version, 
				id:null },
			{ href: '/dist/assets/css/blenddit.min.css?v='+version, 
				id:"css-main" }
		];
	links.forEach( function(link ) {
		l = d.createElement('link');
		l.rel = 'stylesheet';
		l.href = link.href;
		if (link.id) l.id = link.id
		head.appendChild(l);
	});
}

/**
 * Initialize the application. If we're in the 
 * production environment, fetch the stylesheets 
 * and fonts needs.
 * @return {void}
 */
function main_init(){
	var debug = attr('debug','value') == "true"
	main_load_links(debug);
	OneUI.init();
	OneUI.initHelpers(['appear', 'slimscroll']);
	main_start_slick();
}
window.onload = main_init;