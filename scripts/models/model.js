import * as UITools from './../utils/common.js';

class Hotel {
	constructor (name_s) {
		this.name_s = name_s;
	}
	setAddress (locality_s, country_s){
		this.locality_s = locality_s;
		this.country_s = country_s;
		return this;
	}
	getShortName() {
		let out = this.name_s;
		if (this.locality_s) out += ', ' + this.locality_s;
		if (this.country_s) out += ', ' + this.country_s;

		return out;
	}
}

// Model Class
const Model = UITools.$decorateWatchers([
	'viewedWebId',	// Selected user
	'webId', // Current authorized user
	'bookmarks',
	'reviews',
	'troubles',
	'currentEditReview',
], class Model extends UITools.Events {
	constructor (){
		super();
		let store = $rdf.graph();
		// Fetcher instance will store all the collected data!
		this.fetcher = new $rdf.Fetcher(store);
		this.updater = new $rdf.UpdateManager(store);
		this.namespace = {
			foaf: $rdf.Namespace('http://xmlns.com/foaf/0.1/'),
			bookmark: $rdf.Namespace('http://www.w3.org/2002/01/bookmark#'),
			solid: $rdf.Namespace('http://www.w3.org/ns/solid/terms#'),
			rdf: $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
      		dc: $rdf.Namespace('http://purl.org/dc/terms/'),
      		schemaOrg: $rdf.Namespace('https://schema.org/'),
      		review: $rdf.Namespace('https://schema.org/Review#'),
		};
		this.sessionId = this.generateRandToken(2);
	}

	generateDocumentUID (){
		return '#' + this.sessionId + '.' + this.generateRandToken(2);
	}

	generateRandToken(n) {
		return ~~((1 << n *10) * Math.random());
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

	// Trouble: it brings cached variant, do not try to upload!!
	
	async fetchPublicTypeIndex (isForce) {
		this.publicTypeIndex = this.fetcher.store.any(
			$rdf.sym(this.webId), 
			this.namespace.solid('publicTypeIndex'), 
			null, 
			$rdf.sym(this.webId.split('#')[0]));

		// Load the person's data into the store
		await this.fetcher.load(this.publicTypeIndex, {force: isForce});

		if (0) return;

		// Display bookmarks details
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

			// Subscribe on updation
			this.updater.addDownstreamChangeListener(this.bookmarkInstance.doc(), async () => {
				console.log('[BOOKMARKS UPDATED]');
				console.dir(arguments)

				// If updation is happened, we make force reload of bookmarks list 
				await this.reloadBookmarks();
				// // Read bookmarks from bookmarks.ttl file
				this.bookmarks = this.extractBookmarks();
				// this.fetchBookmarks(true);
			});

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
			await solid.auth.fetch(this.publicTypeIndex.value, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/sparql-update' },
				body: query,
				credentials: 'include',
			}); /*.then((ret) => {
				console.log("finished", ret)
			});*/

			this.bookmarks = [];
		}

		// Get review details
		this.reviewTypeRegistration = this.fetcher.store.any(
			null, 
			this.namespace.solid('forClass'), 
			this.namespace.review('Review'), // this.namespace.schemaOrg('Review')
			this.publicTypeIndex // null
		);

		if (this.reviewTypeRegistration && this.reviewTypeRegistration.value) {
			this.reviewInstance = this.fetcher.store.any(
				this.reviewTypeRegistration, 
				this.namespace.solid('instance')
			);			

			// Subscribe on updation
			this.updater.addDownstreamChangeListener(this.reviewInstance.doc(), async () => {
				console.log('Reviews updated');
				this.fetchReviews(true);
			});

			return await this.fetchReviews();
		} else { // There is no reviews.ttl, create it
			await this.createReviewFile();
			return this.reviews = [];
		}
	}

	async reloadBookmarks() {
		if (this.bookmarkInstance) {
			await this.fetcher.load(this.bookmarkInstance, {force: true});	
		}
	}

	async fetchBookmarks (isForce) {
		let bookmarkInstance = this.fetcher.store.any(
			this.bookmarkTypeRegistration, 
			this.namespace.solid('instance')
		);
		let loadProps = {};
		if (isForce) loadProps.force = true;
		// Load the person's data into the store

		try {
			await this.fetcher.load(this.bookmarkInstance, loadProps);	
		} catch (e) {
			await solid.auth.fetch(this.bookmarkInstance, {
				method : 'PATCH',
				headers : {'content-type' : 'application/sparql-update'},
				body : ''
			});
		}
		// Display their details
		this.bookmarks = this.extractBookmarks();
	}

	extractBookmarks() {
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
				// console.log("bookmark " + i, bookmarksInstance[i])
			}

			return bookmarks;
		} else {
			return [];
		}
	}

	async sendBookmark(id_s, uri_s, title_s) {
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
			this.trigger('bookmarkSended', this);
		}).catch(err => {
			console.log("error updating", source, err)
		});
	}

	

	escape4rdf(property) {
		return property.replace(/\"/g, '\'');
	}

	// Id must be beginned with `#`
	async sendReview(id_s, title_s, description_s, hotel){
		// https://schema.org/Review
		let source = this.reviewInstance.value;
		let date_s = new Date().toISOString();
		const query = `INSERT DATA {
			@prefix schema: <https://schema.org/> .
			@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
			@prefix foaf: <http://xmlns.com/foaf/0.1/>.

			<${id_s}> a schema:Review ;
			foaf:maker <${this.webId}>;
			schema:author "Ellie"^^xsd:string ;
			schema:datePublished "${date_s}"^^schema:dateTime ;
			schema:description """${this.escape4rdf(description_s)}"""^^xsd:string ;
			schema:name """${this.escape4rdf(title_s)}"""^^xsd:string ;
			schema:reviewRating [
				a schema:Rating ;
				schema:bestRating "5"^^xsd:string ;
				schema:ratingValue "1"^^xsd:string ;
				schema:worstRating "1"^^xsd:string
			] ;
			schema:hotel [
				a schema:Hotel ;
				schema:name """${this.escape4rdf(hotel.name_s)}"""^^xsd:string ;
				schema:address [
					a schema:PostalAddress ;
					schema:addressCountry "${this.escape4rdf(hotel.country_s)}"^^xsd:string ;
					schema:addressLocality "${this.escape4rdf(hotel.locality_s)}"^^xsd:string ;
					schema:addressRegion "Alpes-Maritimes"^^xsd:string ;
					schema:postalCode "006200"^^xsd:string ;
					schema:streetAddress "Rue de France 20"^^xsd:string
				] ;
			] .
		}`;

		// Send a PATCH request to update the source
		solid.auth.fetch(source, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/sparql-update' },
			body: query,
			credentials: 'include',
		}).then((ret) => {
			this.trigger('reviewSended', this);
		}).catch(err => {
			console.log("error updating", source, err)
		});

	}

	createReviewFile() {
		const query = `INSERT DATA {
			<#Review> a <http://www.w3.org/ns/solid/terms#TypeRegistration> ;
				<http://www.w3.org/ns/solid/terms#forClass> <https://schema.org/Review> ;
				<http://www.w3.org/ns/solid/terms#instance> </public/reviews.ttl> .
				<> <http://purl.org/dc/terms/references> <#Review> .
			}`;
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
	}

	async fetchReviews (isForce) {
		let loadProps = {};
		if (isForce) loadProps.force = true;

		try {
			await this.fetcher.load(this.reviewInstance, loadProps);
			// Display their details
			this.reviews = this.extractReviews();		
		} catch (e) {
			// Attention: there is strange backend behaviour. File may exists in the public index, but it doesn't exist on file system. 
			this.createReviewFile();
			this.reviews = [];
			// ...
			// await solid.auth.fetch(this.reviewInstance, {
			// 	method : 'PATCH',
			// 	headers : {'content-type' : 'application/sparql-update'},
			// 	body : ''
			// });
		}
	}

	extractReviews() {
		const reviewStore = this.fetcher.store.statementsMatching(
			null, 
			this.namespace.rdf('type'), 
			this.namespace.schemaOrg('Review')
		);

		if (reviewStore && reviewStore.length) {
			let reviews = [];
			console.log('reviewStore');
			console.dir(reviewStore)

			for (var i = 0; i < reviewStore.length; i++) {
				let subject = reviewStore[i].subject;
				let review = {id: '#' + subject.value.split('#')[1], subject: reviewStore[i]};
				let author = this.fetcher.store.any(subject, this.namespace.schemaOrg('author')); 
				let datePublished = this.fetcher.store.any(subject, this.namespace.schemaOrg('datePublished'));
				let description = this.fetcher.store.any(subject, this.namespace.schemaOrg('description'));
				let name = this.fetcher.store.any(subject, this.namespace.schemaOrg('name'));
				let hotelInstance = this.fetcher.store.any(subject, this.namespace.schemaOrg('hotel'));

				console.log('Subject');
				console.dir(subject);
				console.dir(name)

				if (author) review.author = author.value;
				if (datePublished) review.datePublished = new Date(datePublished.value);
				if (description) review.description = description.value;
				if (name) review.title = name.value;

				if (hotelInstance) {
					// TODO transform in Class
					let hotelName = this.fetcher.store.any(hotelInstance, this.namespace.schemaOrg('name'));
					let addressInstance = this.fetcher.store.any(hotelInstance, this.namespace.schemaOrg('address'));

					review.hotel = new Hotel(hotelName ? hotelName.value : '');
	
					if (addressInstance) {
						let country = this.fetcher.store.any(addressInstance, this.namespace.schemaOrg('addressCountry'));
						let locality = this.fetcher.store.any(addressInstance, this.namespace.schemaOrg('addressLocality'));
						review.hotel.setAddress(locality && locality.value, country && country.value);
					}
				}
				reviews.push(review);
			}

			return reviews;
		} else {
			return [];
		}
	}

	async deleteReviewFile() {
		await this.fetcher.webOperation('DELETE', this.reviewInstance.uri);		
	}
 
	async delReview(id_s, subject,r) {
		console.log('DelRevie');
		console.dir(arguments);
		console.dir(subject);
		console.dir(subject.toNT());

		// var query = "DELETE DATA { " + oldS.toNT() + " }";
  //       if (oldS['why'] && oldS['why']['value'].length > 0) {
  //         graphURI = oldS['why']['value'];
  //       } else {
  //         graphURI = oldS['subject']['value'];
  //       }
  		var query = "DELETE DATA { " + subject.toNT() + " }";
  		console.log(query);

		// return;
		// // console.dir(del)
		// const query = `DELETE DATA {
		// 	@prefix schema: <https://schema.org/> .
		// 	@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
		// 	@prefix foaf: <http://xmlns.com/foaf/0.1/>.

		// 	<${id_s}> a schema:Review ;
		// 	foaf:maker <${this.webId}>.
		// }`;

		// Send a PATCH request to update the source
		solid.auth.fetch(this.reviewInstance.value, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/sparql-update' },
			body: query,
			credentials: 'include',
		}).then((ret) => {
			// this.trigger('reviewSended', this);
		}).catch(err => {
			console.log("error updating", source, err)
		});
	}

	async updateReview(id_s, title_s, description_s, hotel) {
		let date_s = new Date().toISOString();
		const query = `
		@prefix schema: <https://schema.org/> .
		@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
		@prefix foaf: <http://xmlns.com/foaf/0.1/>.

		DELETE DATA {
			<${id_s}> a schema:Review ;
			foaf:maker <${this.webId}>.
		}
		INSERT DATA {
			<${id_s}> a schema:Review ;
			foaf:maker <${this.webId}>;
			schema:author "Ellie"^^xsd:string ;
			schema:datePublished "${date_s}"^^schema:dateTime ;
			schema:description """${this.escape4rdf(description_s)}"""^^xsd:string ;
			schema:name """${this.escape4rdf(title_s)}"""^^xsd:string ;
			schema:reviewRating [
				a schema:Rating ;
				schema:bestRating "5"^^xsd:string ;
				schema:ratingValue "1"^^xsd:string ;
				schema:worstRating "1"^^xsd:string
			] ;
			schema:hotel [
				a schema:Hotel ;
				schema:name """${this.escape4rdf(hotel.name_s)}"""^^xsd:string ;
				schema:address [
					a schema:PostalAddress ;
					schema:addressCountry "${this.escape4rdf(hotel.country_s)}"^^xsd:string ;
					schema:addressLocality "${this.escape4rdf(hotel.locality_s)}"^^xsd:string ;
					schema:addressRegion "Alpes-Maritimes"^^xsd:string ;
					schema:postalCode "006200"^^xsd:string ;
					schema:streetAddress "Rue de France 20"^^xsd:string
				] ;
			] .
		}
		`;

		// Send a PATCH request to update the source
		solid.auth.fetch(this.reviewInstance.value, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/sparql-update' },
			body: query,
			credentials: 'include',
		}).then((ret) => {
			this.trigger('reviewSended', this);
		}).catch(err => {
			console.log("error updating", source, err)
		});
	}
});

export {
	Model,
	Hotel 
};