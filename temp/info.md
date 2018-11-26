https://linkeddata.github.io/rdflib.js/Documentation/webapp-intro.html
http://linkeddata.github.io/rdflib.js/Documentation/turtle-intro.html
http://graphitethesis.icanhasweb.net/
https://www.w3.org/TR/turtle/
http://planetrdf.com/guide/

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