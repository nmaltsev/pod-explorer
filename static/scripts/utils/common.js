function toggle($n, show_b) {
	if (show_b !== null ? show_b : $n.style.display == 'none') {
		$n.style.display = '';
	} else {
		$n.style.display = 'none';
	}
}

function cr(tagName_s) {
	return document.createElement(tagName_s);
}

function emptyNode(node){
	var childNodes = node.childNodes;
	for(var i = childNodes.length; i--;){
		node.removeChild(childNodes[i]);
	}
}

function findNodes($target, controls){
	var 	CATCH_DEFIS = /-(\w)/g,
			replaceDefis = function(str, p1) {return p1.toUpperCase();},
			roleNodes = ($target || document.body).querySelectorAll('[data-co]'),
			controls = controls || {};
		
	for(var i = 0, len = roleNodes.length, field; i < len; i++){
		field = roleNodes[i].getAttribute('data-co').replace(CATCH_DEFIS, replaceDefis);
		controls[field] = roleNodes[i];	
	}
	return controls;
};

function bindEvents(controls, events){
	var 	pos_i, controlName, eventName, elem, _stack_c = [], key;

	for (key in events) {
		pos_i = key.indexOf(' ');
		
		if (pos_i != -1) {
			controlName = key.substr(pos_i + 1);
			eventName = key.substr(0, pos_i);
			elem = controls[controlName] || document.all[controlName];

			if (elem){
				elem[eventName] = events[key];
				elem.addEventListener(eventName, events[key]); 
				_stack_c.push(elem, key, eventName, events[key]);
			}
		}
	}

	return function(control, eventId, eventHandler){
		var offset_i = typeof(control) == 'string' ? 1 : 0;
		var isCleanUp = control == null;

		for (var i = 0; i < _stack_c.length; i += 4) {
			if (
				isCleanUp || (
					_stack_c[i + offset_i] == control 
					&& (eventId != null ? _stack_c[i + 2] == eventId : true) 
					&& (eventHandler != null ? _stack_c[i + 3] == eventHandler : true) 
				)
			) {
				_stack_c[i].removeEventListener(_stack_c[i + 2], _stack_c[i + 3]);
			}	
		}
	};
};

function $decorateWatchers(preferences, class_o) {
	let i_c = preferences.length;
	
	while (i_c --> 0) {
		let 	publicProperty_s = preferences[i_c],
				privateProperty_s = '_' + publicProperty_s;

		Object.defineProperty(class_o.prototype, publicProperty_s, {
			get: function () {
				return this[privateProperty_s];
			},
			set: function(value) {
				let prev = this[privateProperty_s];
				this[privateProperty_s] = value;

				if (this instanceof Events) {
					this.trigger('change:' + publicProperty_s, this, value, prev);	
				}
			}
		});
	}
	
	return class_o;
}

//==================================
// Events
//==================================
function Events(){
	this._handlers = Object.create(null);
};
// @memberOf Events - execute event callbacks
// @param {Object} options - event options
// @return {Bool} - if true - stop event propagation
Events.prototype.trigger = function(name){
	var 	handlers = this._handlers[name],
			i;

	if(Array.isArray(handlers)){
		i = handlers.length;
		while(i-- > 0){
			if(handlers[i](arguments[1], arguments[2], arguments[3])){
				return true;
			}	
		}
	}
	return false;
};
// @memberOf {Events} - remove all event listeners
Events.prototype.destroy = function(){
	for(var key in this._handlers){
		this.off(key);
	}
};
// @memberOf {Events} - attach callback on change
// @param {String} name - property of model
// @param {Function} cb - callback
Events.prototype.on = function(name, cb){
	if(!Array.isArray(this._handlers[name])){
		this._handlers[name] = [];
	}
	this._handlers[name].push(cb);
};
// @memberOf {Events} - deattach event
// @param {String} name - property of model
// @param {Function} cb - callback
Events.prototype.off = function(name, cb){
	var handlers = this._handlers[name];
	
	if(Array.isArray(handlers)){
		if(cb){
			var pos = handlers.indexOf(cb);
			pos != -1 && handlers.splice(pos, 1);

			if(handlers.length == 0){
				delete this._handlers[name];
			}
		}else{
			handlers.length = 0;
			delete this._handlers[name];
		}
	}
};
// @memberOf {Events} - attach callback on change
// @param {String} name - property of model
// @param {Function} cb - callback
// @return {Function} handler
Events.prototype.once = function(name, cb){
	if(!Array.isArray(this._handlers[name])){
		this._handlers[name] = [];
	}
	var _cb = function(args){
		this.off(name, _cb);
		return cb(args);
	}.bind(this);
	this._handlers[name].push(_cb);
	return _cb;
};
Events.prototype.bindEvents = function(eventMap_c) {
	for(var event in eventMap_c) {
		this.on(event, eventMap_c[event]);
	}
}

function downloadFile(fname_s, blob) {
	let link = document.createElement('a');

	link.href = window.URL.createObjectURL(blob);
	link.target = '_blank';
	link.download = fname_s;
	document.body.appendChild(link)
	
	link.click()
	link.remove()
}

function pasteInBuffer(text_s) {
	navigator.permissions
		.query({name: 'clipboard-write'})
		.then((result) => {
			if (result.state != 'granted' && result.state != 'prompt') return;
			
			navigator.clipboard
				.writeText(text_s)
				.catch(function(e) {console.log('Error', e);});
		});
}

const escapeMap = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#x27;'
};
const unescapeMap = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#x27;': "'"
};
function escape(str){
	return str ? str.replace(/[<>&"']/g, function(m){
		return escapeMap[m];
	}.bind(this)) : '';
}
function unescape(str){
	return str.replace(/(&amp;|&lt;|&gt;|&quot;|&#x27;)/g, function(m){
		return this.unescapeMap[m];
	}.bind(this));
}

export {
	$decorateWatchers,
	bindEvents,
	findNodes,
	toggle,
	cr,
	emptyNode,
	Events,
	downloadFile,
	pasteInBuffer,
	escape,
	unescape
};