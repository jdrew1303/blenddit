"use strict";
const d = document;

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
 * Load the stylesheets and fonts needed for production
 * @param  {boolean}
 * @return {void}
 */
function main_load_links(debug) {
	let head = d.getElementsByTagName('head')[0],
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
	links.forEach( link => {
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
	let debug = Boolean(attr('debug','value'));
	main_load_links(debug);
	OneUI.init();
	OneUI.initHelpers(['appear', 'slimscroll']);
}
window.onload = main_init;