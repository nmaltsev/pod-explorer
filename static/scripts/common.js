function toggle($n, show_b) {
	if (show_b !== null ? show_b : $n.style.display == 'none') {
		console.log('toggle')
		console.dir($n)
		console.dir(show_b)
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

				console.log('Property %s updated', preferences_c[privateProperty_s])
			}
		});
	}
	
	return class_o;
}

export {
	$decorate,
	bindEvents,
	findNodes,
	toggle,
	cr,
	emptyNode		
};