import * as UITools from './common.js';

const popupUri = '/pages/popup.html';
const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');

const CONTROLS = UITools.findNodes();
const Model = UITools.$decorate({
	'_id_n': 'id',
}, class {
	constructor (){

	}
});
const MODEL = new Model();

UITools.bindEvents(CONTROLS, {
	'onclick loginBtn': function() {
		solid.auth.popupLogin({ popupUri });
	},
	'onclick logoutBtn': function() {
		solid.auth.logout();
	},
	'onsubmit profileSelectForm': function(e) {
		e.preventDefault();
		loadProfile();
	},
});

async function loadProfile() {
	// Set up a local data store and associated data fetcher
	const store = $rdf.graph();
	const fetcher = new $rdf.Fetcher(store);

	// Load the person's data into the store
	await fetcher.load(MODEL.id);

	// Display their details
	const fullName = store.any($rdf.sym(MODEL.id), FOAF('name'));
  	const friends = store.each($rdf.sym(MODEL.id), FOAF('knows'));

  	console.log('loadProfile: %s name: %s', MODEL.id, FOAF('name'));

  	CONTROLS.fullNameLabel.textContent = fullName ? fullName.value : '';
  	UITools.emptyNode(CONTROLS.friends);
  
	friends.forEach(async (friend) => {
		await fetcher.load(friend);
		const fullName = store.any(friend, FOAF('name'));

		let $a = UITools.cr('a');
		let $li = UITools.cr('li');

		$a.textContent = fullName ? fullName.value : friend.value;
		$a.onclick = function() {
			MODEL.id = friend.value;
			// TODO move in model change handler
			CONTROLS.profileField.value = friend.value;

			loadProfile();
		};
		$li.appendChild($a);
		CONTROLS.friends.appendChild($li);
	});
}

// Update components to match the user's login status
solid.auth.trackSession(session => {
	const loggedIn_b = !!session;
	
	UITools.toggle(CONTROLS.logoutBlock, loggedIn_b);
	UITools.toggle(CONTROLS.loginBlock, !loggedIn_b);
	UITools.toggle(CONTROLS.loadingBlock, false);

	if (loggedIn_b) {
		MODEL.id = session.webId;

		CONTROLS.userLabel.textContent = session.webId;

		if (!CONTROLS.profileField.value) {
			CONTROLS.profileField.value = session.webId;
		}
	} else {
		CONTROLS.userLabel.textContent = '';		
	}
});

