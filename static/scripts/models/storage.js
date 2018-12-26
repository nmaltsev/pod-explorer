import * as UITools from './../utils/common.js';
import {ACLManager, ACL_ACCESS_MODES, ACLParser, Ruleset, createSafeRuleset} from './acl_manager.js';
import * as Parsers from './../utils/parsers.js';


const RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const WAC = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
const FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
const DCT = $rdf.Namespace("http://purl.org/dc/terms/");
const SIOC = $rdf.Namespace("http://rdfs.org/sioc/ns#");

const SPACE = $rdf.Namespace("http://www.w3.org/ns/pim/space#");
const ACL = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
var LDPX = $rdf.Namespace("http://ns.rww.io/ldpx#");
const LDP = $rdf.Namespace('http://www.w3.org/ns/ldp#')
const NS = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const STAT = $rdf.Namespace('http://www.w3.org/ns/posix/stat#')
const TERMS = $rdf.Namespace('http://purl.org/dc/terms/')


class StorageException {
	constructor(code) {
		this.code = code;
	}
	toString(){
		return `[${this.code}] ${this.codeMap[this.code] || ''}`;
	}
}
StorageException.prototype.codeMap = {
	100: 'Unvalid folder path',
	200: 'File cannot be readed',
	403: 'Access denied',
}

const Storage = UITools.$decorateWatchers([
	'url', // current folder
	'prevUrl',
	'troubles',
	'nodeList',
	'isNodeListLoading',
	'sortBy',
], class Storage extends UITools.Events {
	constructor() {
		super();
		let store = $rdf.graph();
		// Fetcher instance will store all the collected data!
		this.fetcher = new $rdf.Fetcher(store);
		this.updater = new $rdf.UpdateManager(store);
	}
	async _loadDir(uri_s) {
		const uri = encodeURI(uri_s.replace(/\/?$/, '/'));
		const store = $rdf.graph();
		const fetcher = new $rdf.Fetcher(store);
		let response;
 
 		try {
 			response = await fetcher.load(uri);
 		} catch (e) {
 			if (
				e.status == 403 
				|| e.status == 404
			) {
				alert(`Can't download "${uri_s}"`);
				return [];
			} else {
				console.log(`Can't download "${uri_s}"`);
				console.dir(response);	
			}
 		}
		
		this._linkHeaders = Parsers.parseLinkHeader(response.headers.get('Link'));

		// get list of all nodes in dir
		const nodes = store.each($rdf.sym(uri), LDP('contains'));

		return nodes.map((node) => {
			return {
				uri: node.value,
				name: decodeURIComponent(node.value.replace(uri, '')),
				type: this._getType(store.each(node, NS('type'))),
				dateModified: new Date(store.any(node, TERMS('modified'))),
				size: store.any(node, STAT('size')).value
			};
		});
	}
	_getType(types) {
		let i_n = types.length;
		let resourceType_s = 'Resource';
		let mediaType_s;
		let type_s;

		while (i_n--> 0) {
			type_s = types[i_n].value; 
			if (type_s.indexOf('http://www.w3.org/ns/ldp#Container') != -1) {
				resourceType_s = 'Directory';
			} else if (type_s.indexOf('http://www.w3.org/ns/iana/media-types/') != -1) {
				mediaType_s = type_s.replace('http://www.w3.org/ns/iana/media-types/', '').replace(/#.*$/, '');
			}
		}

		return mediaType_s ? mediaType_s : resourceType_s;
	}
	async showFolder(uri_s) {
		// Turn off because RDFJSLIB v 0.19.1 doesn't support removing watcher ;)

		// let upd = this.updater.addDownstreamChangeListener(uri_s, async () => {
		// 	console.log('Reviews updated');
		// 	await this.loadDir(uri_s);	
		// });



		// console.log('Upd');
		// console.dir(upd);
		await this.loadDir(uri_s);
	}
	async loadDir(uri_s) {
		this.isNodeListLoading = true;
		const list = this._sort(await this._loadDir(uri_s), this.sortBy);
		const parent_s = Parsers.getParent(uri_s);

		if (parent_s) {
			// Add parent folder at first position 
			list.unshift({
				uri: parent_s,
				name: '...',
				type: 'parent'
			});
		}
		
		this.nodeList = list;
		this.isNodeListLoading = false;
	}

	sort(sortBy) {
		this.sortBy = sortBy;
		let cb = this._sortCallbacks[this.sortBy];

		if (cb) {
			this.nodeList = this.nodeList.sort(cb) 	
		} 
	}
	_sort(inputList, sortBy) {
		let cb = this._sortCallbacks[this.sortBy];

		return cb ? inputList.sort(cb) : inputList;
	}

	async getContent(url_s) {
		let response = await solid.auth.fetch(url_s,{ 
			method: 'GET' 
		});	
		console.log('[getContent] `%s`', url_s);
		console.dir(response);
		
		if (response.status > 199 && response.status < 300) {
			let contentType_s = response.headers.get('Content-Type')
			let text_s = await response.text() || '';	

			return {
				text: text_s,
				contentType: contentType_s
			};
		} else if (response.status == 403) {
			this.troubles = new StorageException(403);
		} else {
			// inform about trouble
			this.troubles = new StorageException(200);
		}

		
		

		// response.body.getReader().read().then((r) => {
		// 	console.log('SRE %s', r.done);
		// 	console.dir(r.value);
		// });

		
	}

	
	async populate(webId, isForce) {
		this.troubles = null;
		try {
			await this.fetcher.load(webId, {force: isForce});	
		} catch (e) {
			this.troubles = e;
		}
	}

	async createFolder(parentUrl, folderName) {
		const response = await solid.auth.fetch(
			parentUrl, 
			{
				method: 'POST',
				headers: { 
					'Content-Type': 'text/turtle',
					Slug: folderName,
					Link: '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
				},
				credentials: 'include',
			}
		);
	}
	async removeEntry(url) {
		await solid.auth.fetch(url, {
			method: 'DELETE'
		});
	}
	async downloadBlob(url_s) {
		let response = await solid.auth.fetch(url_s,{ 
			method: 'GET' 
		});
		
		let blob = await response.blob();

		return blob;	
	}

	isDuplicateFileExist(fname_s) {
		let dupliactes = this.nodeList.filter(function(node) {
			return node.type != 'directory' && node.name == fname_s;
		});

		return dupliactes.length > 0;
	}
	async upload(url_s, body) {
		let response = await solid.auth.fetch(url_s,{ 
			method: 'PUT',
			body 
		});

		if (response.status == 403) {
			this.troubles = new StorageException(403);
		}

		return response;
	}

	//-------------------------------------------------
	// Get ACL data of not downloaded folder
	async getACLInfo(folderUri) {
		const folderResponse = await solid.auth.fetch(
			folderUri, 
			{
				method: 'HEAD',
				headers: { 
					'Content-Type': 'text/turtle',
				},
				credentials: 'include',
			}
		);

		const linkHeaders = Parsers.parseLinkHeader(folderResponse.headers.get('Link'));
		// linkHeaders.type.href values:
		// file resource - http://www.w3.org/ns/ldp#Resource
		// folder resource -http://www.w3.org/ns/ldp#BasicContainer
		let aclUri_s = (linkHeaders.type.href == 'http://www.w3.org/ns/ldp#BasicContainer' ? 
			folderUri : 
			Parsers.getParent(folderUri)
		) + linkHeaders.acl.href;

		console.log('getACLInfo folderUri: %s', folderUri)
		console.dir(linkHeaders)

		let aclResponse = await this._downloadACLFile(aclUri_s);

		if (aclResponse.status == 403) {
			// inform about trouble
			this.troubles = new StorageException(403);
			return;
		}
		// let aclResponse = await this._downloadACLFile(getParent(folderUri) + linkHeaders.acl.href);
		let text_s = await aclResponse.text();
		let rulesets;

		console.warn('aclResponse');
		console.dir(aclResponse);

		if (aclResponse.ok) {
			let aclParser = new ACLParser(text_s, this.webId);

			rulesets = aclParser.getRules();
		} else { // There is no acl file and no rulesets
			rulesets = [];
		}

		return {
			rulesets,
			aclUri: aclUri_s,
			uri: folderUri			
		};
	}


	async _downloadACLFile(aclUrl) {
		// TODO use $rdf.fetcher
		return await solid.auth.fetch(
			aclUrl, 
			{
				method: 'GET',
				headers: { 
					'Content-Type': 'text/turtle',
				},
				credentials: 'include',
			}
		);		
	}

	async updateACL(aclUri_s, rulesets) {
		console.log('updateACL')
		console.dir(rulesets);

		let acl = new ACLManager(this.webId);
		acl.import(rulesets);

		let requestBody = acl.serialize();
		
		console.log('[requestBody]');
		console.dir(requestBody);

		const response = await solid.auth.fetch(
			aclUri_s, 
			{
				method: 'PUT',
				// method: 'PATCH',
				headers: { 
					'Content-Type': 'text/turtle',
				},
				credentials: 'include',
				body: requestBody
			}
		);
	}

	async updateFileContent(url_s, requestBody, contentType) {
		const response = await solid.auth.fetch(
			url_s, 
			{
				method: 'PUT',
				headers: { 
					'Content-Type': contentType,
				},
				credentials: 'include',
				body: requestBody
			}
		);
	}


	async setACL(aclUri_s, folderUri) {
		let acl = new ACLManager(this.webId);

		acl.addRule(aclUri_s + '#owner')
			.setResource(folderUri)
			.forMe()
			.accessMode(ACL_ACCESS_MODES.read, ACL_ACCESS_MODES.write, ACL_ACCESS_MODES.control);
		acl.addRule(aclUri_s + '#public')
			.setResource(folderUri)
			.forNotAuthorized()
			.accessMode(ACL_ACCESS_MODES.read);

		var requestBody = acl.serialize();
		console.log('[setACL] aclUri_s %s, folderUri %s', aclUri_s, folderUri);
		console.dir(requestBody);

		const response = await solid.auth.fetch(
			aclUri_s, 
			{
				method: 'PUT',
				headers: { 
					'Content-Type': 'text/turtle',
				},
				credentials: 'include',
				body: requestBody
			}
		);
	}

	getMetaInformation(resourceUrl) {
		// TODO
		solid.auth.fetch(
			'https://nmaltsev.inrupt.net/.meta', 
			{
			method: 'GET',
			headers: { 
			'Content-Type': 'text/turtle',
			},
			credentials: 'include',
			}
		);      
	}
});

Storage.prototype._sortCallbacks = {
	timeUp: function(n1, n2){ return n1.dateModified < n2.dateModified ? 1 : n1.dateModified > n2.dateModified ? -1 : 0;},
	timeDown: function(n1, n2){ return n1.dateModified < n2.dateModified ? -1 : n1.dateModified > n2.dateModified ? 1 : 0;},
}
export {
	Storage,
	StorageException,
};
