import * as UITools from './common.js';
import {Model, Hotel} from './model.js';
import {Storage, StorageException} from './storage.js';
// import {ACL_ACCESS_MODES, createSafeRuleset, Ruleset} from './acl_manager.js';
import {PopupBuilder} from '../libs/popup_builder.js';
import {createContentPopup} from '../utils/content.popup.js';
import {createTextPopup} from '../utils/text.popup.js';
import {createRulesetPopup} from './popups/ruleset.popup.js';
import {HashModel} from './models/hash.model.js';


const popupUri = '/pages/popup.html';


const CONTROLS = UITools.findNodes();
const _storage = new Storage();
const _hash = new HashModel(['url']); 

window._hash = _hash;
window._storage = _storage;
window._controls = CONTROLS;

function showResourceContent(resourceLink, resourceData) {
	if (resourceData.type.indexOf('text/') != -1) {
		_storage.getContent(resourceLink).then((data) => {
			createContentPopup({
				text: data.text,
				title: resourceLink
			}).open();
		});
	} else if (resourceData.type.indexOf('image/') != -1) {
		createContentPopup({
			image: resourceLink,
			title: resourceLink,
		}).open();
	} else {
		alert('Unsupported file format for viewer ' + resourceData.type);
	}
}

// DOM event listeners
UITools.bindEvents(CONTROLS, {
	'click loginBtn': function() {
		solid.auth.popupLogin({ popupUri });
	},
	'click logoutBtn': function() {
		solid.auth.logout();
	},
	'submit navigationForm': function(e) {
		e.preventDefault();
		_storage.url = CONTROLS.navigationUrl.value;
	},
	'click navigationTableBody': function(e){
		let action_s = e.target.dataset.action;

		if (!action_s) return;
		
		let $tr = e.target.closest('tr');

		if (!$tr) return;

		let href_s = $tr.dataset.href;
		let nodeData = _storage.nodeList[parseInt($tr.dataset.id)];



		switch (action_s) {
			case 'navigate': 
				console.dir(nodeData);
				if (nodeData.type == 'Directory' || nodeData.type == 'parent') {
					_storage.url = href_s;
				} else {
					showResourceContent(href_s, nodeData);
				}
				break;
			case 'show': 
				showResourceContent(href_s, nodeData);
				break;
			case 'edit': 
				if (nodeData.type.indexOf('text/') != -1) {
					_storage.getContent(href_s).then((data) => {
						createTextPopup({
							text: data.text,
							title: href_s,
							onsave: (text_s) => {
								// TODO
								console.log("Save");
								console.dir(text_s);
								_storage.updateFileContent(href_s, text_s, nodeData.type).then(() => {
									console.log('File updated');
								});
							}
						}).open();
					});	
				}
				
				break;
			case 'remove': 
				if (confirm('Are you sure?')) {
					_storage.removeEntry(href_s).then(function(){
						_storage.url = _storage.url;
					});
				}
				break;
			case 'info': 
				_storage.getACLInfo(href_s).then(function(d){
					// openRulesetPopup(d);
					createRulesetPopup(d).open();
				});
				break;
			case 'download': 
				let fname_s;
	
				if (nodeData != undefined) {
					fname_s = nodeData && nodeData.name.replace(/\//g, '');
				} else {
					fname_s = 'noname';
				}

				_storage.downloadBlob(href_s).then(function(blob){
					UITools.downloadFile(fname_s, blob);
				});
				break;
			case 'link': 
				UITools.pasteInBuffer(href_s);
				break;
			// case '': break;
		
		}
	},
	'reset navigationForm': function(e) {
		e.preventDefault();
		if (_storage.prevUrl) {
			_storage.url = _storage.prevUrl;
		}
		// _storage.url = CONTROLS.navigationUrl.value;
	},
	'click fileTableSortByModificationTime': function(e) {
		_storage.sort(_storage.sortBy == 'timeUp' ? 'timeDown' : 'timeUp');
	},



	'click btnCreateFolder': function(e) {
		CONTROLS.dialogCreateFolder.setAttribute('open', true);
		setTimeout(function() {
			CONTROLS.dialogCreateFolderName.focus();
		},100);
		
	},
	'submit dialogCreateFolderForm': async function(e) {
		e.preventDefault();
		CONTROLS.dialogCreateFolder.removeAttribute('open');
		await _storage.createFolder(_storage.url, CONTROLS.dialogCreateFolderName.value);
		_storage.url = _storage.url;
	},
	'reset dialogCreateFolderForm': function(e) {
		if (e) e.preventDefault();
		CONTROLS.dialogCreateFolderName.value = '';
		CONTROLS.dialogCreateFolder.removeAttribute('open');
	},

	'click btnShowInfo': async function(){
		_storage.getACLInfo(_storage.url).then(function(d){
			// openRulesetPopup(d);
			createRulesetPopup(d).open();
		});
	},
	


	'change btnUpload': function(e) {
		let url_s = _storage.url.replace(/\/?$/, '/');
		
		// Download all files
		Promise.all(
			Array.from(e.target.files).map(function(file){
				if (
					_storage.isDuplicateFileExist(file.name) ? 
					confirm(`There is another file with name '${file.name}'.\nOverwrite it?`) :
					true
				) {
					return _storage
						.upload(url_s + encodeURIComponent(file.name), file)
						.catch(function(e){ return null; });	
				} else {
					return Promise.resolve(true);
				}
			})
		).then(function(){
			// Reload list:
			_storage.url = _storage.url;
			e.target.value = null;
		});
	},


});

_storage.bindEvents({
	'change:url': function(model, url, prevUrl){
		console.log('[change:url] %s', url);
		CONTROLS.navigationUrl.value = url;
		_hash.update('url', url);

		model.showFolder(url);
		model.prevUrl = prevUrl;

	},
	'change:prevUrl': function(model, url) {
		if (url) {
			CONTROLS.navigationBackBtn.removeAttribute('disabled');	
		} else {
			CONTROLS.navigationBackBtn.setAttribute('disabled', true);
		}
	},
	'change:nodeList': function(model, nodes){
		UITools.emptyNode(CONTROLS.navigationTableBody);
		// console.dir(nodes)

		nodes.forEach((node, id) => {
			if (node.type == parent) {

			}
			let $tr = UITools.cr('tr');
			$tr.dataset.id = id;
			$tr.dataset.href = node.uri;
			
			$tr.insertAdjacentHTML('beforeEnd', node.type != 'parent' ? `
				<td><span data-href="${node.uri}" data-action="navigate">${node.name}</span></td>
				<td>${node.type}</td>
				<td>${node.dateModified.toLocaleString()}</td>	
				<td>${node.size}</td>
				<td>
					<i data-action="show" title="Show">[S]</i>
					<i data-action="edit" title="Edit file">[E]</i>
					<i data-action="remove" title="Remove">[R]</i>
					<i data-action="download" title="Download">[D]</i>
					<i data-action="info" title="ACL">[I]</i>
					<i data-action="link" title="Get link">[L]</i>
				</td>
			`: `<td><span data-href="${node.uri}" data-action="navigate">${node.name}</span></td>
				<td colspan="4">&nbsp;</td>`);
			CONTROLS.navigationTableBody.appendChild($tr);	
		});	
	}
});

_hash.on('url', function(m, url_s){
	console.log('URL: %s', url_s);
	_storage.url = url_s;
});
_hash.init();

// Attention: _hash.init call must be before
// Update components to match the user's login status
solid.auth.trackSession(async (session) => {
	const loggedIn_b = !!session;
	
	UITools.toggle(CONTROLS.logoutBlock, loggedIn_b);
	UITools.toggle(CONTROLS.loginBlock, !loggedIn_b);
	UITools.toggle(CONTROLS.loadingBlock, false);

	if (loggedIn_b) {
		CONTROLS.userLabel.textContent = session.webId;

		_storage.url = _hash.state.url || $rdf.sym(session.webId).site().uri;
		_storage.webId = session.webId;
		_storage.$webId = $rdf.sym(session.webId);
	} else {
		CONTROLS.userLabel.textContent = '';		
	}
});
