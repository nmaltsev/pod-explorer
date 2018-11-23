import * as UITools from './common.js';
import {Model, Hotel} from './model.js';

const popupUri = 'pages/popup.html';


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
	'onsubmit bookmarkForm': function(e) {
		e.preventDefault();
		MODEL.sendBookmark(
			MODEL.generateDocumentUID(),
			CONTROLS.bookmarkFormUrlField.value,
			CONTROLS.bookmarkFormTitleField.value
		);
	}, 
	'onreset bookmarkForm': function(e) {
		e.preventDefault();
		CONTROLS.bookmarkFormTitleField.value = '';
		CONTROLS.bookmarkFormUrlField.value = '';
	},
	'onsubmit reviewForm': async function(e) {
		e.preventDefault();
		let hotel = new Hotel(CONTROLS.reviewFormHotelField.value);
		
		hotel.setAddress(CONTROLS.reviewFormCityField.value, CONTROLS.reviewFormCountryField.value)

		await MODEL.sendReview(
			MODEL.generateDocumentUID(),
			CONTROLS.reviewFormTitleField.value, 
			CONTROLS.reviewFormDescriptionField.value,
			hotel
		);
		CONTROLS.reviewForm.reset();		
	},
	'onreset reviewForm': function(e) {
		e.preventDefault();
		CONTROLS.reviewFormCityField.value = '';
		CONTROLS.reviewFormHotelField.value = '';
		CONTROLS.reviewFormCountryField.value = '';
		CONTROLS.reviewFormTitleField.value = ''; 
		CONTROLS.reviewFormDescriptionField.value = '';
	},
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
// When bookmark form succesfully  submitted we can clean form 
MODEL.on('bookmarkSended', function(model) {
	CONTROLS.bookmarkForm.reset();
	model.fetchBookmarks(true);
});
MODEL.on('reviewSended', function(model) {
	CONTROLS.reviewForm.reset();
	model.fetchReviews(true);
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
MODEL.on('change:reviews', async function(model, reviews){
	UITools.emptyNode(CONTROLS.reviewList);

	var $li, review, title_s, r;

	// // TODO create document fragment
	for (var i = 0; i < reviews.length; i++) {
		$li = UITools.cr('li');
		r = reviews[i];

		if (r.hotel) {
			title_s = r.hotel.getShortName();
		} else {
			title_s = '';
		}

		$li.className = 'review-item';
		$li.insertAdjacentHTML('beforeEnd', 
		`<h3 class="review-item_place">${title_s}</h3>
		<p class="review-item_title">${r.name}</p>
		<pre class="review-item_description">${r.description}</pre>
		<p class="review-item_publication-time">${r.datePublished}</p>`);


		CONTROLS.reviewList.appendChild($li);	
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
