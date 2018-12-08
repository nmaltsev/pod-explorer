import * as UITools from './common.js';
import {Model, Hotel} from './model.js';
import {Storage, StorageException} from './storage.js';

const popupUri = '/pages/popup.html';


const CONTROLS = UITools.findNodes();
const _storage = new Storage();


window._storage = _storage;
window._controls = CONTROLS;


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
		let action_s;
		
		if (action_s = e.target.dataset.action) {
			let href_s = e.target.dataset.href;
			let id_n = parseInt(e.target.dataset.id);

			if (action_s == 'navigate') {
				_storage.url = href_s;	
			} else if (action_s == 'show'){
				_storage.getContent(href_s).then((data) => {
					console.log('Content:\n %s', data.text);
				});
				
			} else if (action_s == 'remove') {
				if (confirm('Are you sure?')) {
					_storage.removeEntry(href_s).then(function(){
						_storage.url = _storage.url;
					});
					
				}
				
			} else if (action_s == 'info') {
				_storage.getFolderInfo(href_s).then(openRulesetPopup);
			} else if (action_s == 'download') {
				let fname_s;
		
				if (id_n != undefined) {
					fname_s = _storage.nodeList[id_n] && _storage.nodeList[id_n].name.replace(/\//g, '');
				} else {
					fname_s = 'noname';
				}

				_storage.downloadBlob(href_s).then(function(blob){
					UITools.downloadFile(fname_s, blob);
				});
			}
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
		await _storage.getACL();
		CONTROLS.dialogConfigure.setAttribute('open', true);
	},
	'submit dialogConfigureForm': async function(e) {
		e.preventDefault();

		let newVisibilityMode = CONTROLS.selectVisibilityMode.value;
		console.log('newVisibilityMode %s', newVisibilityMode)

		_storage.setACL(newVisibilityMode);

		CONTROLS.dialogConfigure.removeAttribute('open');

	},
	'reset dialogConfigureForm': function(e) {
		if (e) e.preventDefault();
		
		CONTROLS.dialogConfigure.removeAttribute('open');
	},



	'change btnUpload': function(e) {
		let url_s = _storage.url.replace(/\/?$/, '/');
		
		// Download all files
		Promise.all(
			Array.from(e.target.files).map(function(file){
				return _storage
					.upload(url_s + encodeURIComponent(file.name), file)
					.catch(function(e){ return null; });
			})
		).then(function(r){
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
		console.dir(nodes)

		nodes.forEach((node, id) => {
			if (node.type == parent) {

			}
			let $tr = UITools.cr('tr');
			
			$tr.insertAdjacentHTML('beforeEnd', node.type != 'parent' ? `
				<td><span data-href="${node.uri}" data-action="navigate">${node.name}</span></td>
				<td>${node.type}</td>
				<td>${node.dateModified.toLocaleString()}</td>	
				<td>${node.size}</td>
				<td>
					<i data-href="${node.uri}" data-action="show">[S]</i>
					<i data-href="${node.uri}" data-action="remove">[R]</i>
					<i data-href="${node.uri}" data-id="${id}" data-action="download">[D]</i>
					<i data-href="${node.uri}" data-id="${id}" data-action="info">[I]</i>
				</td>
			`: `<td><span data-href="${node.uri}" data-action="navigate">${node.name}</span></td>
				<td colspan="4">&nbsp;</td>`);
			CONTROLS.navigationTableBody.appendChild($tr);	
		});	
	}
})
// Update components to match the user's login status
solid.auth.trackSession(async (session) => {
	const loggedIn_b = !!session;
	
	UITools.toggle(CONTROLS.logoutBlock, loggedIn_b);
	UITools.toggle(CONTROLS.loginBlock, !loggedIn_b);
	UITools.toggle(CONTROLS.loadingBlock, false);

	if (loggedIn_b) {
		CONTROLS.userLabel.textContent = session.webId;

		_storage.url = $rdf.sym(session.webId).site().uri;
		_storage.webId = session.webId;
		_storage.$webId = $rdf.sym(session.webId);
	} else {
		CONTROLS.userLabel.textContent = '';		
	}
});

function openRulesetPopup(d) {
	console.log('[openRulesetPopup]');
	console.dir(d);
}