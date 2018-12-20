import * as UITools from './common.js';
import {Model, Hotel} from './model.js';
import {Storage, StorageException} from './storage.js';

const popupUri = '/pages/popup.html';


const CONTROLS = UITools.findNodes();
const MODEL = new Model();

window._model = MODEL;
window._controls = CONTROLS;

// DOM event listeners
UITools.bindEvents(CONTROLS, {
	'click loginBtn': function() {
		solid.auth.popupLogin({ popupUri });
	},
	'click logoutBtn': function() {
		solid.auth.logout();
	},
	'submit profileSelectForm': function(e) {
		e.preventDefault();
		MODEL.viewedWebId = CONTROLS.profileField.value;
	},
	'submit bookmarkForm': function(e) {
		e.preventDefault();
		MODEL.sendBookmark(
			MODEL.generateDocumentUID(),
			CONTROLS.bookmarkFormUrlField.value,
			CONTROLS.bookmarkFormTitleField.value
		);
	}, 
	'reset bookmarkForm': function(e) {
		if(e) e.preventDefault();
		CONTROLS.bookmarkFormTitleField.value = '';
		CONTROLS.bookmarkFormUrlField.value = '';
	},
	'submit reviewForm': async function(e) {
		e.preventDefault();
		/*let hotel = new Hotel(CONTROLS.reviewFormHotelField.value);
		
		hotel.setAddress(CONTROLS.reviewFormCityField.value, CONTROLS.reviewFormCountryField.value)

		await MODEL.sendReview(
			MODEL.generateDocumentUID(),
			CONTROLS.reviewFormTitleField.value, 
			CONTROLS.reviewFormDescriptionField.value,
			hotel
		);
		CONTROLS.reviewForm.reset();*/
		let hotel = new Hotel(CONTROLS.reviewFormHotelField.value).setAddress(CONTROLS.reviewFormCityField.value, CONTROLS.reviewFormCountryField.value);

		if (MODEL.currentEditReview) {
			// MODEL.currentEditReview ? MODEL.currentEditReview.id
			MODEL.updateReview(
				MODEL.currentEditReview.id,
				CONTROLS.reviewFormTitleField.value, 
				CONTROLS.reviewFormDescriptionField.value,
				hotel
			).then(() => {
				// Cleanup edit model
				MODEL.currentEditReview = null;
			}, (e) => {
				console.log('Update fail');
				console.dir(e);
			});
		} else {
			// Form in Create mode
			MODEL.sendReview(
				MODEL.generateDocumentUID(),
				CONTROLS.reviewFormTitleField.value, 
				CONTROLS.reviewFormDescriptionField.value,
				hotel
			).then(() => {
				// Cleanup edit model
				MODEL.currentEditReview = null;
			}, (e) => {
				console.log('Create fail');
				console.dir(e);
			});	
		}
	},
	'reset reviewForm': function(e) {
		if (e) e.preventDefault();
		
		if (MODEL.currentEditReview) {
			// If form in edit mode - restore form to init values
			MODEL.currentEditReview = MODEL.currentEditReview; 
		} else {
			MODEL.currentEditReview = null;
			// TODO remove
			// CONTROLS.reviewFormCityField.value = '';
			// CONTROLS.reviewFormHotelField.value = '';
			// CONTROLS.reviewFormCountryField.value = '';
			// CONTROLS.reviewFormTitleField.value = ''; 
			// CONTROLS.reviewFormDescriptionField.value = '';
		}
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
				_storage.getFolderInfo(href_s).then(function(){
					
				});
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



});

// Model event listeners
MODEL.bindEvents({
	// When viewedWebId is changed we download and render all related information
	'change:viewedWebId': async function(model, webId){
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
	},
	'change:bookmarks': async function(model, bookmarks){
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
	},
	// When bookmark form succesfully  submitted we can clean form 
	'bookmarkSended': function(model) {
		CONTROLS.bookmarkForm.reset();
		model.fetchBookmarks(true);
	},
	'reviewSended': function(model) {
		console.log('[TRIG reviewSended]');
		CONTROLS.reviewForm.reset();
		model.fetchReviews(true);
	},
	// Trouble handler
	'change:troubles': function(model, trouble) {
		if (trouble) {
			// TODO if 401 error switch on authorization page
			console.warn('Catch troubles')
			console.dir(trouble);
		} else {

		}
	},
	'change:reviews': async function(model, reviews){
		console.log('[change:reviews]');
		console.dir(reviews);

		UITools.emptyNode(CONTROLS.reviewList);

		var review, title_s;

		// // TODO create document fragment
		for (var i = 0; i < reviews.length; i++) {
			let $li = UITools.cr('li');
			let r = reviews[i];

			if (r.hotel) {
				title_s = r.hotel.getShortName();
			} else {
				title_s = '';
			}

			$li.className = 'review-item';
			$li.insertAdjacentHTML('beforeEnd', 
			`<h3 class="review-item_place">${title_s}</h3>
			<p class="review-item_title">${r.title}</p>
			<pre class="review-item_description">${r.description}</pre>
			<p class="review-item_publication-time">${r.datePublished}</p>
			<div class="review-item_tool-panel"><a href="#" class="" data-co="remove">Remove</a><a href="#" data-co="update">Edit</a></div>`);


			CONTROLS.reviewList.appendChild($li);	

			let reviewControls = UITools.findNodes($li);
			let _unbind = UITools.bindEvents(reviewControls, {
				'click remove': function(e) {
					e.preventDefault();
					MODEL.delReview(r.id, r.subject, r);

					_unbind();
					$li.remove();
				},
				'click update': function(e) {
					e.preventDefault();
					console.log('Update');
					console.dir(r);

					// Switch review form to the edit mode 
					MODEL.currentEditReview = r;
				}
			});
		}	
	},
	'change:currentEditReview': function(model, formData){
		if (formData) {
			if (formData.hotel) {
				CONTROLS.reviewFormHotelField.value = formData.hotel.name_s;
				CONTROLS.reviewFormCityField.value = formData.hotel.locality_s;
				CONTROLS.reviewFormCountryField.value = formData.hotel.country_s;
			}

			CONTROLS.reviewFormTitleField.value = formData.title; 
			CONTROLS.reviewFormDescriptionField.value = formData.description;
			CONTROLS.reviewFormIdField.value = formData.id;
		} else {
			CONTROLS.reviewFormCityField.value = '';
			CONTROLS.reviewFormHotelField.value = '';
			CONTROLS.reviewFormCountryField.value = '';
			CONTROLS.reviewFormTitleField.value = ''; 
			CONTROLS.reviewFormDescriptionField.value = '';
		}
	},
});



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
