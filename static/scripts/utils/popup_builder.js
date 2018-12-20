import {Events} from './common.js';

// @param {Object} conf.events
// @param {String} conf.className
class PopupBuilder extends Events{
	constructor (conf, extend) {
		super();
		if(extend != null) Object.assign(this, extend);
		this.el = document.createElement('dialog');
		this.el.className = conf.className;
		// this.el.style.display = 'none';
		this.el.setAttribute('tabindex', 0);
		this.initialize(conf);	
	}
} 


PopupBuilder.prototype.stack = [], // stack for opened popups
PopupBuilder.prototype.CATCH_DEFIS = /-(\w)/g;

PopupBuilder.prototype._replaceDefis = function(str, p) {return p.toUpperCase();};
PopupBuilder.prototype._bindByRole = function($target, controls){
	let 	roleNodes = ($target || this.el).querySelectorAll('[data-co]');
	let 	i = roleNodes.length;
	let 	field;
	let 	controlsMap = controls || this.controls;

	while (i-- >0) {
		field = roleNodes[i].dataset.co.replace(this.CATCH_DEFIS, this._replaceDefis);
		controlsMap[field] = roleNodes[i];
	}
	return controlsMap;
};
PopupBuilder.prototype._bindEvents = function(events){
	var 	pos, controlName, eventName;

	for(var key in events){
		pos = key.indexOf(' ');
		
		if(pos != -1){
			eventName = key.substr(pos + 1);
			controlName = key.substr(0, pos);

			if(this.controls[controlName]){
				this.controls[controlName]['on' + eventName] = events[key].bind(this);
			}
		}
	}
};
PopupBuilder.prototype.initialize = function(conf){
	this.children = {};
	this.render(conf);

	if(conf.className) this.el.className = conf.className;
	this.$heap = conf.heap || document.getElementById('node-heap') || document.body;
	this.$heap.appendChild(this.el);

	this.destroyOnClose = conf.destroyOnClose != undefined ? conf.destroyOnClose : true;
	// if(conf.css) $4.css(this.controls.content, conf.css);

	setTimeout(function(){
		this.el.focus();
	}.bind(this), 0);
	this.el.onclick = function(e){
		if(this.controls.content.contains(e.target)){
			e.stopPropagation();
		}else{
			this.close();	
		}
	}.bind(this);
	this.el.onkeydown = function(e){
		if(e.keyCode == 27) this.close();
	}.bind(this);
};
PopupBuilder.prototype.render = function(conf){
	this.controls = {};
	this.el.innerHTML = this.template.replace('%content%', conf.content || '');
	this._bindByRole();
	if(conf.events) this._bindEvents(conf.events);
};
PopupBuilder.prototype.template = 
'<div class="m3-dialog-scroller"><div class="m3-dialog-inner clearfix" data-co="content">%content%</div></div>';

PopupBuilder.prototype.remove = function(){
	this.controls = null;

	for (key in this.children) {
		this.children[key].remove();
	}
	this.el.remove();
	this.model && this.model.off();
	// Remove popup from stack
	var stackPos = this.stack.indexOf(this);
	
	if(stackPos != -1) this.stack.splice(stackPos, 1);

	return this;
};
PopupBuilder.prototype.open = function(){
	if(this.onopen) this.onopen(this);
	document.documentElement.style.overflow = 'hidden';
	document.body.overflow = 'hidden';
	// this.el.style.display = '';
	this.el.setAttribute('open', true);
	this.stack.push(this);
	return this;
};
PopupBuilder.prototype.close = function(status){
	this.onclose && this.onclose(this, status) || this._completeClose();
};
PopupBuilder.prototype._completeClose = function(){
	// this.el.style.display = 'none';
	this.el.removeAttribute('open');
	document.documentElement.style.overflow = '';
	document.body.overflow = '';
	this.destroyOnClose && this.remove();
};

export {
	PopupBuilder,
}