import * as UITools from './common.js';


const popupUri = '/pages/popup.html';


const CONTROLS = UITools.findNodes();

// Model Class
const Model = UITools.$decorate({
	'_viewedWebId': 'viewedWebId',	// Selected user
	'_webId': 'webId', // Current authorized user
}, class Model extends UITools.Events {
	constructor (){
		super();
		let store = $rdf.graph();
		// Fetcher instance will store all the collected data!
		this.fetcher = new $rdf.Fetcher(store);
		this.foaf = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
	}
	async populate(webId) {
		await this.fetcher.load(webId);
	}
	getNameOf(webId) {
		const nameInstance = this.fetcher.store.any($rdf.sym(webId), this.foaf('name'));
		return nameInstance.value;
	}
	getFriendsOf(webId) {
		return this.fetcher.store.each($rdf.sym(webId), this.foaf('knows'));
	}
	
	// async fetchPublicTypeIndex () {
	// 	const BOOKMARK = $rdf.Namespace('http://www.w3.org/2002/01/bookmark#');
	// 	const SOLID = $rdf.Namespace('http://www.w3.org/ns/solid/terms#');
		
	// 	const store = $rdf.graph();
	// 	const fetcher = new $rdf.Fetcher(store);
	// 	console.dir([
	// 		$rdf.sym(this.webId), 
	// 		SOLID('publicTypeIndex'), 
	// 		null, 
	// 		$rdf.sym(this.webId.split('#')[0])
	// 	])

	// 	this.publicTypeIndex = store.any(
	// 		$rdf.sym(this.webId), 
	// 		SOLID('publicTypeIndex'), 
	// 		null, 
	// 		$rdf.sym(this.webId.split('#')[0]));
      	
 //      	// Load the person's data into the store
 //      	await fetcher.load(this.publicTypeIndex);
 //      	console.log('this.publicTypeIndex ready')
 //      	console.dir(this.publicTypeIndex);
 //      	return;
 //      // Display their details
 //      template.profile.bookmarkTypeRegistration = store.any(null, SOLID("forClass"), BOOKMARK("Bookmark"))
 //      console.log("bookmarkTypeRegistration", template.profile.bookmarkTypeRegistration)
 //      if (template.profile.bookmarkTypeRegistration && template.profile.bookmarkTypeRegistration.value) {
 //        template.profile.bookmarkInstance = store.any(template.profile.bookmarkTypeRegistration, SOLID("instance"));
 //        template.profile.bookmarkInstance = template.profile.bookmarkInstance.value
 //        fetchBookmarks()
 //      } else {
 //        console.log("no bookmark files, creating")
 //        const query = `INSERT DATA {
 //            <#Bookmark> a <http://www.w3.org/ns/solid/terms#TypeRegistration> ;
 //              <http://www.w3.org/ns/solid/terms#forClass> <http://www.w3.org/2002/01/bookmark#Bookmark> ;
 //              <http://www.w3.org/ns/solid/terms#instance> </public/bookmarks.ttl> .
 //              <> <http://purl.org/dc/terms/references> <#Bookmark> .
 //            }`
 //        // Send a PATCH request to update the source
 //        console.log("sending PATCH query to",template.profile.publicTypeIndex.value ,query)
 //        solid.auth.fetch(template.profile.publicTypeIndex.value, {
 //          method: 'PATCH',
 //          headers: { 'Content-Type': 'application/sparql-update' },
 //          body: query,
 //          credentials: 'include',
 //        }).then((ret) => {
 //          console.log("finished", ret)
 //        })
 //      }
 //      render()
	// }
	/*async fetchData () {
		


		const store = $rdf.graph();
		const SOLID = $rdf.Namespace('http://www.w3.org/ns/solid/terms#');

		this.publicTypeIndex = store.any(
			$rdf.sym(this.webId), 
			SOLID('publicTypeIndex'), 
			null, 
			$rdf.sym(this.webId.split('#')[0])
		);
		
		const BOOKMARK = $rdf.Namespace('https://www.w3.org/2002/01/bookmark#');
      	
		console.log('Call fetchData %s', this.webId)
		console.dir(this.publicTypeIndex);
		const fetcher = new $rdf.Fetcher(store);
      // Load the person's data into the store
      await fetcher.load(template.profile.publicTypeIndex);



      	const fetcher = new $rdf.Fetcher(store);
      	const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
      	const DC = $rdf.Namespace('http://purl.org/dc/terms/')
      	// Load the person's data into the store
      	await fetcher.load(this.publicTypeIndex);
      	// Display their details
      	let bookmarkTypeRegistration = store.any(null, SOLID("forClass"), BOOKMARK("Bookmark"))
      	
      	console.log("bookmarkTypeRegistration", bookmarkTypeRegistration)
      	console.dir(this);

      	if (bookmarkTypeRegistration && bookmarkTypeRegistration.value) {
        	let bookmarkInstance = store.any(bookmarkTypeRegistration, SOLID("instance")).value;
	      	// Load the person's data into the store
	      	console.log("bookmarkInstance", template.profile.bookmarkInstance)
	      	console.dir(this)
      	
      		await fetcher.load(template.profile.bookmarkInstance);
      		// Display their details
      		const bookmarks = store.statementsMatching(null, RDF("type"), BOOKMARK("Bookmark"));
      		console.log("Bookmarks", bookmarks);
      	
	      	if (bookmarks && bookmarks.length) {
	        	template.bookmarks = []
	        	for (var i = 0; i < bookmarks.length; i++) {
		          	let bookmark = bookmarks[i]
		          	let subject = bookmark.subject
		          	let title = store.any(subject, DC('title'))
		          	let created = store.any(subject, DC('created'))
		          	let recall = store.any(subject, BOOKMARK('recall'))
	          		
	          		if (subject && recall && created && title) {
			            template.bookmarks.push({
			              "subject": subject.value,
			              "recall": recall.value,
			              "created": created.value,
			              "title": title.value
			            })
	          		}
	          		console.log("bookmark " + i, bookmark)
	        	}
	        	
	        	console.log("template.bookmarks", template.bookmarks)
	        	// render()
	      	}
      		// console.log()
      	}
      	// render()		
	}*/
});


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

	}
});

// Model event listeners
MODEL.on('change:viewedWebId', async function(webId){
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

window.model = MODEL;



// async function sendReview() {
//     document.getElementById('modal').classList.remove('is-active')
//         let id = "#" + Math.random()
//         let uri = document.getElementById('uri').value
//         let title = document.getElementById('title').value
//         let source = template.profile.bookmarkInstance
//         let date = new Date().toISOString();
//         const query = ` INSERT DATA {
//             <${id}> a <https://www.w3.org/2002/01/bookmark#Bookmark> ;
//             <http://purl.org/dc/terms/title>   """${title}""" ;
//             <http://xmlns.com/foaf/0.1/maker>   <${template.profile.webId}> ;
//             <http://purl.org/dc/terms/created>  "${date}"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
//             <https://www.w3.org/2002/01/bookmark#recall> <${uri}> .
//           }`
//         // Send a PATCH request to update the source
//         console.log("query", query)
//         solid.auth.fetch(source, {
//           method: 'PATCH',
//           headers: { 'Content-Type': 'application/sparql-update' },
//           body: query,
//           credentials: 'include',
//         });
// }


// Update components to match the user's login status
solid.auth.trackSession(session => {
	const loggedIn_b = !!session;
	
	UITools.toggle(CONTROLS.logoutBlock, loggedIn_b);
	UITools.toggle(CONTROLS.loginBlock, !loggedIn_b);
	UITools.toggle(CONTROLS.loadingBlock, false);

	if (loggedIn_b) {
		MODEL.viewedWebId = session.webId;
		MODEL.webId = session.webId;
		MODEL.populate(MODEL.webId);

		CONTROLS.userLabel.textContent = session.webId;
	} else {
		CONTROLS.userLabel.textContent = '';		
	}
});

