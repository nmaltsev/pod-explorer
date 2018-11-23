https://linkeddata.github.io/rdflib.js/Documentation/webapp-intro.html
http://linkeddata.github.io/rdflib.js/Documentation/turtle-intro.html


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