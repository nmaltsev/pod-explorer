import * as UITools from './common.js';
import {Model} from './model.js';

const popupUri = '/pages/popup.html';


const CONTROLS = UITools.findNodes();


const MODEL = new Model();

// DOM event listeners
UITools.bindEvents(CONTROLS, {
	'onclick loginBtn': function() {
		solid.auth.popupLogin({ popupUri });
	},
	'onclick logoutBtn': function() {
		solid.auth.logout();
	},
	'onsubmit profileSelectForm': function(e) {
		e.preventDefault();
		MODEL.viewedWebId = CONTROLS.profileField.value;
	},
	'onsubmit writeReview': function(e) {

	},
	'onsubmit bookmarkForm': function(e) {
		e.preventDefault();
		MODEL.sendReview(
			'#' + ~~(1000000 * Math.random()),
			CONTROLS.bookmarkFormUrlField.value,
			CONTROLS.bookmarkFormTitleField.value
		);
	}, 
	'onreset bookmarkForm': function(e) {
		e.preventDefault();
		CONTROLS.bookmarkFormTitleField.value = '';
		CONTROLS.bookmarkFormUrlField.value = '';
	}
});

// Model event listeners
// When viewedWebId is changed we download and render all related information
MODEL.on('change:viewedWebId', async function(model, webId){
	await MODEL.populate(webId);

	let 	fullName = MODEL.getNameOf(webId), 
			friends = MODEL.getFriendsOf(webId);

	CONTROLS.fullNameLabel.textContent = fullName || '';
	CONTROLS.profileField.value = webId;
  	UITools.emptyNode(CONTROLS.friends);
  
	friends.forEach(async (friend) => {
		await MODEL.populate(friend);

		const fullName = MODEL.getNameOf(friend);

		let $a = UITools.cr('a');
		let $li = UITools.cr('li');

		$a.textContent = fullName ? fullName : friend.value;
		$a.onclick = function() {
			MODEL.viewedWebId = friend.value;
		};
		$li.appendChild($a);
		CONTROLS.friends.appendChild($li);
	});
});
MODEL.on('change:bookmarks', async function(model, bookmarks){
	console.log('New Bookmarks');
	console.dir(bookmarks);
	// TODO render bookmarks
	UITools.emptyNode(CONTROLS.bookmarkList);
	
	var $a, $li;
	// TODO create document fragment
	for (var i = 0; i < bookmarks.length; i++) {
		$a = UITools.cr('a');
		$li = UITools.cr('li');
		$a.textContent = bookmarks[i].title;
		$a.setAttribute('href', bookmarks[i].recall);
		$a.setAttribute('target', '_blank');

		$li.appendChild($a);
		CONTROLS.bookmarkList.appendChild($li);	
	}	

	
});
MODEL.on('bookmarkSended', function(model) {
	console.log('Bookmark sended');
	CONTROLS.bookmarkFormTitleField.value = '';
	CONTROLS.bookmarkFormUrlField.value = '';
	model.fetchBookmarks();

});
// Trouble handler
MODEL.on('change:troubles', function(model, trouble) {
	if (trouble) {
		// TODO if 401 error switch on authorization page
		console.warn('Catch troubles')
		console.dir(trouble);
	} else {

	}
});


window.model = MODEL;

// Update components to match the user's login status
solid.auth.trackSession(async (session) => {
	const loggedIn_b = !!session;
	
	UITools.toggle(CONTROLS.logoutBlock, loggedIn_b);
	UITools.toggle(CONTROLS.loginBlock, !loggedIn_b);
	UITools.toggle(CONTROLS.loadingBlock, false);

	if (loggedIn_b) {
		MODEL.viewedWebId = session.webId;
		MODEL.webId = session.webId;
		await MODEL.populate(MODEL.webId);

		CONTROLS.userLabel.textContent = session.webId;

		MODEL.fetchPublicTypeIndex();
	} else {
		CONTROLS.userLabel.textContent = '';		
	}
});
