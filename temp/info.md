https://linkeddata.github.io/rdflib.js/Documentation/webapp-intro.html
http://linkeddata.github.io/rdflib.js/Documentation/turtle-intro.html
http://graphitethesis.icanhasweb.net/
https://www.w3.org/TR/turtle/
http://planetrdf.com/guide/
rdf.js description 
    http://rdf.js.org/
    https://github.com/rdfjs/rdfjs.github.io/wiki/Architecture#low-level
rdf.js source https://searchcode.com/codesearch/view/7502380/

ACL
  https://github.com/solid/solid-spec/blob/master/acl-inheritance.md
  https://www.w3.org/wiki/WebAccessControl
  https://github.com/solid/web-access-control-spec

  https://melvincarvalho.com/#me

```  
const me = store.sym('https://example.com/alice/card#me');
const profile = me.doc();       //i.e. store.sym(''https://example.com/alice/card#me')
```


We add a name to the store as though it was stored in the profile
```
const VCARD = new $rdf.Namespace(‘http://www.w3.org/2006/vcard/ns#‘);
store.add(me, VCARD(‘fn’), “John Bloggs”, profile);
```


#Поменять хначение в документе
You can make a new statement using:
```let st = new $rdf.Statement(me, FOAF(‘name’), “Joe Bloggs”, me.doc());```


minergate-cli --user hash.eater@gmail.com --xmr 2

model.fetcher.load(model.fetcher.store.sym('https://nmaltsev.inrupt.net/public/bookmarks.ttl').doc())


example a RDF entry (like creation)
```
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

<profile.ttl#me>   a   foaf:Person ;
          foaf:name "Alice";
          foaf:knows  <students.ttl#bob> .
  
```




--------------------------------------------------------------
https://schema.org/Hotel
https://schema.org/Restaurant

http://www.easyrdf.org/converter
From review:
```
@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

[]
  a schema:Product ;
  schema:aggregateRating [
    a schema:AggregateRating ;
    schema:ratingValue "3.5"^^xsd:string ;
    schema:reviewCount "11"^^xsd:string
  ] ;
  schema:description "0.7 cubic feet countertop microwave. Has six preset cooking categories and convenience features like Add-A-Minute and Child Lock."^^xsd:string ;
  schema:image <http://njh.me/kenmore-microwave-17in.jpg> ;
  schema:name "Kenmore White 17\" Microwave"^^xsd:string ;
  schema:offers [
    a schema:Offer ;
    schema:availability "http://schema.org/InStock"^^xsd:string ;
    schema:price "55.00"^^xsd:string ;
    schema:priceCurrency "USD"^^xsd:string
  ] ;
  schema:review [
    a schema:Review ;
    schema:author "Ellie"^^xsd:string ;
    schema:datePublished "2011-04-01"^^schema:Date ;
    schema:description "The lamp burned out and now I have to replace it."^^xsd:string ;
    schema:name "Not a happy camper"^^xsd:string ;
    schema:reviewRating [
      a schema:Rating ;
      schema:bestRating "5"^^xsd:string ;
      schema:ratingValue "1"^^xsd:string ;
      schema:worstRating "1"^^xsd:string
    ]
  ], [
    a schema:Review ;
    schema:author "Lucas"^^xsd:string ;
    schema:datePublished "2011-03-25"^^schema:Date ;
    schema:description "Great microwave for the price. It is small and fits in my apartment."^^xsd:string ;
    schema:name "Value purchase"^^xsd:string ;
    schema:reviewRating [
      a schema:Rating ;
      schema:bestRating "5"^^xsd:string ;
      schema:ratingValue "4"^^xsd:string ;
      schema:worstRating "1"^^xsd:string
    ]
  ] .
```

from Hotel:
```
@prefix schema: <http://schema.org/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

[]
  a schema:Hotel ;
  schema:address [
    a schema:PostalAddress ;
    schema:addressCountry "AT"^^xsd:string ;
    schema:addressLocality "Innsbruck"^^xsd:string ;
    schema:addressRegion "Tyrol"^^xsd:string ;
    schema:postalCode "6020"^^xsd:string ;
    schema:streetAddress "Technikerstrasse 21"^^xsd:string
  ] ;
  schema:description """A beautifully located business hotel right in the
heart of the alps. Watch the sun rise over the scenic Inn valley while
enjoying your morning coffee."""^^xsd:string ;
  schema:name "ACME Hotel Innsbruck"^^xsd:string ;
  schema:photo "http://www.acme-innsbruck.at//media/hotel_front.png"^^xsd:string ;
  schema:priceRange "$100 - $240"^^xsd:string ;
  schema:starRating [
    a schema:Rating ;
    schema:ratingValue "4"^^xsd:string
  ] ;
  schema:telephone "+43 512 8000-0"^^xsd:string .
```
-----------------------------------

# Comparisment of two formats

```
@prefix ex: <http://example.org/> . 
@prefix foaf: <http://xmlns.com/foaf/0.1/> . 
ex:Arne foaf:knows ex:Kjetil ; 
        foaf:familyName "Hassel" .
```

```
{ 
    "@context": { 
        "ex": "http://example.org/", 
        "foaf": "http://xmlns.com/foaf/0.1/" 
    }, 
    "@id": "ex:Arne", 
    "foaf:knows": "ex:Kjetil", 
    "foaf:familyName": "Hassel" 
} 
{ 
    "@context": { 
        "ex": "http://example.org/", 
        "foaf": "http://xmlns.com/foaf/0.1/" 
    }, 
    "@id": "ex:Arne", 
    "foaf:knows": { 
        "foaf:nick": [ "Bjarne", "Buddy" ] 
    } 
} 
```

```
$rdf.parse(data.toString(), kb, 'foaf.rdf', 'application/rdf+xml', function(err, kb) {
    if (err) { /* error handling */ }

    var me = kb.sym('http://kindl.io/christoph/foaf.rdf#me');

    // - add new properties
    kb.add(me, FOAF('mbox'), kb.sym('mailto:e0828633@student.tuwien.ac.at'));
    kb.add(me, FOAF('nick'), 'ckristo');

    // - alter existing statement
    kb.removeMany(me, FOAF('age'));
    kb.add(me, FOAF('age'), kb.literal(25, null, XSD('integer')));

    // - find some existing statements and iterate over them
    var statements = kb.statementsMatching(me, FOAF('mbox'));
    statements.forEach(function(statement) {
        console.log(statement.object.uri);
    });

    // - delete some statements
    kb.removeMany(me, FOAF('mbox'));

    // - print modified RDF document
    $rdf.serialize(undefined, kb, undefined, 'application/rdf+xml', function(err, str) {
        console.log(str);
    });
});
```


var reviewStore = model.fetcher.store.statementsMatching(
  null, 
  model.namespace.rdf('type'), 
  model.namespace.schemaOrg('Review')
);


``` javascript
var acl = _storage.test();
acl.g.statementsMatching(null,null, $rdf.sym('http://www.w3.org/ns/auth/acl#Authorization'))

acl.g.statementsMatching($rdf.sym('https://nmaltsev.inrupt.net/#public'))
acl.g.removeMany($rdf.sym('https://nmaltsev.inrupt.net/#public')
```




### For report
- mistakes in documentation or bugs in solid servers
- no tools for debugging. We have to create small file manager for exploring changes after requests.
- poor documentation with explanation of basic operations and concepts
- small community of developers - There are around 100 projects on github that use rdflib.js with outdated api version. All of them belongs to students that have written launch application and developers of Solid (Current and past)

Bugs
1. Rdflib.js graph doesnot allow to work with relative paths, it works with only absolute urls. So most examples with rdf request need an adoptation before they can be used.
2. Slid server does not save manage rights of the owner. Owner can block access to him self.


some stranges:
1. .acl and .meta files are not visible, but accessible. (Or theur visibility may be not documentated)
2. Filename of root files/folders stat with first slash symbol. But with default acl reatrictments they are accessible without that slash.

Some limitations:
1. There is no any API for message passing throught solid server. We need to create that system throught the shared file in the POD. It is not ideal. All aplication need to create there own message passing system.

That have we done
- explore current state of solid project. Try to score it readibility to using in production.




