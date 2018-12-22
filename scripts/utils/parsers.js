const _linkexp = /<[^>]*>\s*(\s*;\s*[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*")))*(,|$)/g;
const _paramexp = /[^\(\)<>@,;:"\/\[\]\?={} \t]+=(([^\(\)<>@,;:"\/\[\]\?={} \t]+)|("[^"]*"))/g;

function parseLinkHeader(header) {
	var matches = header.match(_linkexp);
	var rels = {};
	var split, href, ps, link, s;

	for (var i = 0; i < matches.length; i++) {
		split = matches[i].split('>');
		href = split[0].substring(1);
		ps = split[1];
		link = {
			href
		};
		
		s = ps.match(_paramexp);
		for (var j = 0; j < s.length; j++) {
			var p = s[j];
			var paramsplit = p.split('=');
			var name = paramsplit[0];
			link[name] = unquote(paramsplit[1]);
		}

		if (link.rel != undefined) {
			rels[link.rel] = link;
		}
	}   

	return rels;
}

function unquote(value) {
	if (
		value.charAt(0) == '"' && 
		value.charAt(value.length - 1) == '"'
	) return value.substring(1, value.length - 1);
	return value;
}

// get the base name of a path (e.g. filename)
// basename('/root/dir1/file') -> 'file'
function basename(path_s) {
	let path;

	if (path_s.substring(path_s.length - 1) == '/') {
		path = path_s.substring(0, path_s.length - 1);
	} else {
		path = path_s;
	}

	let p_n = path.lastIndexOf('/');

	return p_n > -1 ? path.substr(p_n + 1) : '';
}
function getParent(url_s) {
	let list = url_s.split('/');
	let pos = list.length;

	if (pos > 3 && !list[pos -1] ) {pos--;}
	if (pos > 3) {pos--;}
	if (pos > 3 && !list[pos -1] ) {pos--;}

	return list.length > 4 ? list.slice(0, pos).join('/') + '/' : null;
}

function extractHash(url_s) {
	let i_n = url_s.indexOf('#');

	return i_n > -1 ? url_s.substr(i_n + 1) : url_s;
}

// function getParent(url_s) {
// 	let list = url_s.replace(/(?<!\:)\/+/g,'/').split('/');
// 	let i = list.length;
// 	let j = 0

// 	console.dir(i);

// 	if (list.length < 5) return null;

// 	while(i-- > 3 && j < 1 ){
// 		if (list[i]) j++;
// 	}
	
// 	return list.slice(0, i+1).join('/') + '/';
// }

export {
	parseLinkHeader,
	basename,
	getParent,
	extractHash
}