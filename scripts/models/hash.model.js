import * as UITools from './../utils/common.js';

let _3986backmap = {
	'%21': '!',
	'%2A': '*',
	'%27': '\'',
	'%28': '(',
	'%29': ')',
};

function fromRfc3986(val){
	return decodeURIComponent(val.replace(/(%21|%2A|%27|%28|%29)/g, function(m){
		return _3986backmap[m];
	}));
};

function parseQuery(url){
	var 	parts = (url || window.location.search.substr(1)).split('&'),
			pos, key, value, 
			i = parts.length,
			out = Object.create(null);

	while(i-- > 0){
		key = parts[i];
		pos = key.indexOf('=');

		if(pos != -1){
			value = key.substr(pos + 1);
			key = fromRfc3986(key.substr(0, pos));
		}else{
			value = null;
		}
		out[fromRfc3986(key)] = value;
	}
	return out
};


class HashModel extends UITools.Events {
	constructor (watchedProperties) {
		super();
		this._watchedProperties_c = watchedProperties.reduce(function(collection, item){
			return collection[item] = 1, collection;
		}, {});
	}
	update(key_s, value_s) {
		this.state[key_s] = value_s;
		window.location.hash = this._serialize();
	}
	init () {
		window.addEventListener('hashchange', (e) => {
			this.state = this._parse();
			this._trigger();
		}, false);
		this.state = this._parse();
		this._trigger();
	}
	_parse() {
		let state_c = parseQuery(window.location.hash.substr(1));
		let newState = {};

		for (var key_s in state_c) {
			if (this._watchedProperties_c.hasOwnProperty(key_s)) {
				newState[key_s] = state_c[key_s];
			}
		}
		return newState;
	}
	_trigger() {
		for (var key_s in this.state) {
			this.trigger(key_s, this, this.state[key_s]);
		}	
	}
	_serialize() {
		let list = [];

		for (var key_s in this.state) {
			list.push(key_s + '=' + this.state[key_s]);
		}

		return '#' + list.join('&');
	}
};


export {
	HashModel
}