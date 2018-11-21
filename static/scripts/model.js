import * as UITools from './common.js';

// Model Class
const Model = UITools.$decorateWatchers([
	'viewedWebId',	// Selected user
	'webId', // Current authorized user
	'bookmarks',
	'reviews',
	'troubles',
], class Model extends UITools.Events {
	constructor (){
		super();
		let store = $rdf.graph();
		// Fetcher instance will store all the collected data!
		this.fetcher = new $rdf.Fetcher(store);
		this.namespace = {
			foaf: $rdf.Namespace('http://xmlns.com/foaf/0.1/'),
			bookmark: $rdf.Namespace('http://www.w3.org/2002/01/bookmark#'),
			solid: $rdf.Namespace('http://www.w3.org/ns/solid/terms#'),
			rdf: $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
      		dc: $rdf.Namespace('http://purl.org/dc/terms/'),
		};
	}

	async populate(webId) {
		this.troubles = null;
		try {
			await this.fetcher.load(webId);	
		} catch (e) {
			this.troubles = e;
		}
	}

	getNameOf(webId) {
		const nameInstance = this.fetcher.store.any($rdf.sym(webId), this.namespace.foaf('name'));
		return nameInstance.value;
	}

	getFriendsOf(webId) {
		return this.fetcher.store.each($rdf.sym(webId), this.namespace.foaf('knows'));
	}
	
	async fetchPublicTypeIndex () {
		this.publicTypeIndex = this.fetcher.store.any(
			$rdf.sym(this.webId), 
			this.namespace.solid('publicTypeIndex'), 
			null, 
			$rdf.sym(this.webId.split('#')[0]));

		// Load the person's data into the store
		await this.fetcher.load(this.publicTypeIndex);

		// Display their details
		this.bookmarkTypeRegistration = this.fetcher.store.any(
			null, 
			this.namespace.solid('forClass'), 
			this.namespace.bookmark('Bookmark')
		);
 
 		if (this.bookmarkTypeRegistration && this.bookmarkTypeRegistration.value) {
			this.bookmarkInstance = this.fetcher.store.any(
				this.bookmarkTypeRegistration, 
				this.namespace.solid('instance')
			);

			await this.fetchBookmarks();
		} else {
        	console.log('no bookmark files, creating')
        	const query = `INSERT DATA {
            <#Bookmark> a <http://www.w3.org/ns/solid/terms#TypeRegistration> ;
              <http://www.w3.org/ns/solid/terms#forClass> <http://www.w3.org/2002/01/bookmark#Bookmark> ;
              <http://www.w3.org/ns/solid/terms#instance> </public/bookmarks.ttl> .
              <> <http://purl.org/dc/terms/references> <#Bookmark> .
            }`
			// Send a PATCH request to update the source
			console.log('sending PATCH query to', this.publicTypeIndex.value ,query)
			solid.auth.fetch(this.publicTypeIndex.value, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/sparql-update' },
				body: query,
				credentials: 'include',
			}).then((ret) => {
				console.log("finished", ret)
			});

			this.bookmarks = [];
		}
	}
	async fetchBookmarks () {
		let bookmarkInstance = this.fetcher.store.any(
			this.bookmarkTypeRegistration, 
			this.namespace.solid('instance')
		);
		// Load the person's data into the store

		try {
			await this.fetcher.load(this.bookmarkInstance);	
		} catch (e) {
			await solid.auth.fetch(template.profile.bookmarkInstance, {
				method : 'PATCH',
				headers : {'content-type' : 'application/sparql-update'},
				body : ''
			});
		}
  		// Display their details
		const bookmarksInstance = this.fetcher.store.statementsMatching(
			null, 
			this.namespace.rdf('type'), 
			this.namespace.bookmark('Bookmark')
		);

		if (bookmarksInstance && bookmarksInstance.length) {
			let bookmarks = []

			for (var i = 0; i < bookmarksInstance.length; i++) {
				let subject = bookmarksInstance[i].subject;

				let title = this.fetcher.store.any(subject, this.namespace.dc('title'))
				let created = this.fetcher.store.any(subject, this.namespace.dc('created'))
				let recall = this.fetcher.store.any(subject, this.namespace.bookmark('recall'))

				if (subject && recall && created && title) {
					bookmarks.push({
						subject: subject.value,
						recall: recall.value,
						created: created.value,
						title: title.value
					});
				}
				console.log("bookmark " + i, bookmarksInstance[i])
			}

			this.bookmarks = bookmarks;
		}
	}

	async sendReview(id_s, uri_s, title_s) {
		let source = this.bookmarkInstance.value;
		let date_s = new Date().toISOString();
		const query = `INSERT DATA {
			<${id_s}> a <http://www.w3.org/2002/01/bookmark#Bookmark> ;
			<http://purl.org/dc/terms/title>   """${title_s}""" ;
			<http://xmlns.com/foaf/0.1/maker>   <${this.webId}> ;
			<http://purl.org/dc/terms/created>  "${date_s}"^^<http://www.w3.org/2001/XMLSchema#dateTime> ;
			<http://www.w3.org/2002/01/bookmark#recall> <${uri_s}> .
		}`;
		// Send a PATCH request to update the source
		solid.auth.fetch(source, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/sparql-update' },
			body: query,
			credentials: 'include',
		}).then((ret) => {
			console.log("finished", ret)
			// location.reload()
			this.trigger('bookmarkSended', this);
		}).catch(err => {
			console.log("error updating", source, err)
		});
	}

});

export {
	Model	
};