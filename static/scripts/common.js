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
	var 	pos, controlName, eventName, elem;

	for(var key in events){
		pos = key.indexOf(' ');
		
		if(pos != -1){
			controlName = key.substr(pos + 1);
			eventName = key.substr(0, pos);
			elem = controls[controlName] || document.all[controlName];

			if(elem){
				elem[eventName] = events[key];
			}
		}
	}
};

function $decorate(preferences_c, class_o) {
	for(let privateProperty_s in preferences_c) {
		Object.defineProperty(class_o.prototype, preferences_c[privateProperty_s], {
			get: function () {
				return this[privateProperty_s];
			},
			set: function(value) {
				this[privateProperty_s] = value;
				// TODO something

				// console.log('Property %s updated', preferences_c[privateProperty_s])
				if (this instanceof Events) {
					this.trigger('change:' + preferences_c[privateProperty_s], value);	
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


export {
	$decorate,
	bindEvents,
	findNodes,
	toggle,
	cr,
	emptyNode,
	Events		
};