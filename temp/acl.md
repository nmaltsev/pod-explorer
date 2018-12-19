## Wrong file 

```
@prefix n0: <http://www.w3.org/ns/auth/acl#>.
@prefix f3d3: <https://nmaltsev.inrupt.net//f3d3a910-test2/>.
@prefix c: <https://nmaltsev.inrupt.net/profile/card#>.
@prefix n1: <https://nmaltsev.inrupt.net//f3d3a910-test2/#>.
@prefix n2: <http://xmlns.com/foaf/0.1/>.

""
    a n0:Authorization;
    n0:accessTo "", f3d3:;
    n0:agent c:me;
    n0:mode n0:Read, n0:Write.
n1:f3d3a910-test2
    a n0:Authorization;
    n0:accessTo f3d3:;
    n0:agent c:me;
    n0:agentClass n2:Agent;
    n0:defaultForNew f3d3:;
    n0:mode n0:Read.
```


## Normal for public folder
```
# ACL resource for the well-known folder
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

# The owner has all permissions
<#owner>
    a acl:Authorization;
    acl:agent <https://nmaltsev.inrupt.net/profile/card#me>;
    acl:accessTo <./>;
    acl:defaultForNew <./>;
    acl:mode acl:Read, acl:Write, acl:Control.

# The public has read permissions
<#public>
    a acl:Authorization;
    acl:agentClass foaf:Agent;
    acl:accessTo <./>;
    acl:defaultForNew <./>;
    acl:mode acl:Read.
```


## Parsing Triple

```Javascript
data = `
# ACL resource for the well-known folder
@prefix acl: <http://www.w3.org/ns/auth/acl#>.
@prefix foaf: <http://xmlns.com/foaf/0.1/>.

# The owner has all permissions
<#owner>
    a acl:Authorization;
    acl:agent <https://nmaltsev.inrupt.net/profile/card#me>;
    acl:accessTo <./>;
    acl:defaultForNew <./>;
    acl:mode acl:Read, acl:Write, acl:Control.

# The public has read permissions
<#public>
    a acl:Authorization;
    acl:agentClass foaf:Agent;
    acl:accessTo <./>;
    acl:defaultForNew <./>;
    acl:mode acl:Read.
`;

var g = $rdf.graph();
// $rdf.parse(data, store, baseUrl, contentType); 'text/turtle'
$rdf.parse(data, g, 'https://nmaltsev.inrupt.net/', 'text/n3');
```



```
var acl = $rdf.graph(); // configgraph

acl.add($rdf.sym("#0"), RDF("type"), WAC("Authorization"));
acl.add($rdf.sym("#0"), WAC("accessTo"), $rdf.sym(""));
acl.add($rdf.sym("#0"), WAC('accessTo'), $rdf.sym(args.configurl.href));
acl.add($rdf.sym("#0"), WAC('resourceKey'), $rdf.lit(constants.ACL_KEY));
acl.add($rdf.sym("#0"), WAC('mode'), WAC('Read'));
acl.add($rdf.sym("#0"), WAC('mode'), WAC('Write'));

acl.add($rdf.sym("#1"), RDF("type"), WAC("Authorization"));
acl.add($rdf.sym("#1"), WAC("accessTo"), $rdf.sym(""));
acl.add($rdf.sym("#1"), WAC('accessTo'), $rdf.sym(args.configurl.href));
acl.add($rdf.sym("#1"), WAC('agent'), $rdf.sym(args.userwebid));
acl.add($rdf.sym("#1"), WAC('mode'), WAC('Read'));
acl.add($rdf.sym("#1"), WAC('mode'), WAC('Write'));

var aclserial = new $rdf.Serializer(acl).toN3(acl);

```




## Example

```
@prefix acl: <http://www.w3.org/ns/auth/acl#> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

[acl:accessTo <card>; acl:mode acl:Read; acl:agentClass foaf:Agent].
[acl:accessTo <card>; acl:mode acl:Read, acl:Write;  acl:agent <card#i>].
```
This means that anyone may read card, and <card#i> can read &write it. ( we won't put the prefixes in any more from here on )


Control to group
```
[acl:accessTo <card>; acl:mode acl:Read; acl:agentClass <http://my.example.net/groups/friends#group>].
[acl:accessTo <card>; acl:mode acl:Read, acl:Write;  acl:agentClass <groups/family#group>].
```
The resource <http://my.example.netgroups/friends> says:
`<#group> foaf:member <../user/alice#me>, <../user/bob#me>, <../user/charlie#me>. `
The resource <groups/family> says:
`<#group> foaf:member  <../people/don#me>, <../people/eloise#me>.`





const RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const WAC = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
const FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");

var acl = $rdf.graph();

acl.add($rdf.sym('https://nmaltsev.inrupt.net/#owner'), RDF("type"), WAC("Authorization"));
//acl.add($rdf.sym('https://nmaltsev.inrupt.net/#owner'), WAC("accessTo"), $rdf.sym('https://nmaltsev.inrupt.net/'));
acl.add($rdf.sym('https://nmaltsev.inrupt.net/#owner'), WAC('accessTo'), $rdf.sym('https://nmaltsev.inrupt.net//test5/'));
acl.add($rdf.sym("https://nmaltsev.inrupt.net/#owner"), WAC('agent'), $rdf.sym('https://nmaltsev.inrupt.net/profile/card#me'));
acl.add($rdf.sym("https://nmaltsev.inrupt.net/#owner"), WAC('mode'), WAC('Read'));
acl.add($rdf.sym("https://nmaltsev.inrupt.net/#owner"), WAC('mode'), WAC('Write'));


var aclserial = new $rdf.Serializer(acl).toN3(acl);
console.log(aclserial);    
// TODO try to save that graph

======================







<#owner>
    a acl:Authorization;
    acl:agent <https://nmaltsev.inrupt.net/profile/card#me>;
    acl:accessTo <./>;
    acl:defaultForNew <./>;
    acl:mode acl:Read, acl:Write, acl:Control.



=====================================
### Default settings
https://myosotis.inrupt.net/.acl
```
# Root ACL resource for the user account
@prefix acl: <http://www.w3.org/ns/auth/acl#>.

<#owner>
    a acl:Authorization;

    acl:agent <https://myosotis.inrupt.net/profile/card#me> ;

    # Optional owner email, to be used for account recovery:
    acl:agent <mailto:nsmalcev@bk.ru>;

    # Set the access to the root storage folder itself
    acl:accessTo </>;

    # All resources will inherit this authorization, by default
    acl:defaultForNew </>;

    # The owner has all of the access modes allowed
    acl:mode
        acl:Read, acl:Write, acl:Control.

# Data is private by default; no other agents get access unless specifically
# authorized in other .acls
```




```
  async initializeStore(webId: string) {
    let host: string = $rdf.sym(webId).site().value;

    const response0: SolidAPI.IResponce = await solid.auth.fetch(
            host + '/' + this.appFolderName, 
            {
                method: 'HEAD',
                headers: { 
                    'Content-Type': 'text/turtle',
                },
                credentials: 'include',
            }
    );
    if (response0.status == 404) {
      const response1 = await solid.auth.fetch(
        host, 
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'text/turtle',
            Slug: this.appFolderName,
            Link: '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
          },
          credentials: 'include',
        }
      );
      console.log('response1');
      console.dir(response1);

      const response2: SolidAPI.IResponce = await solid.auth.fetch(
        host + '/' + this.appFolderName + '/' + this.queueFile, 
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'text/turtle',
          },
          credentials: 'include',
          body: ''
        }
      );

      console.log('response2');
      console.dir(response2);
      let linkHeaders:ISolidEntityLinkHeader = parseLinkHeader(response2.headers.get('Link'));

      console.log('LinkHeaders');
      console.dir(linkHeaders);
      console.dir(linkHeaders.acl.href);

      if (!linkHeaders.acl || !linkHeaders.acl.href) {
        return;
      }
      let aclUrl:string = host + '/' + this.appFolderName + '/' + linkHeaders.acl.href;
      let requestBody:string = this.getACLRequestBody(host, aclUrl, webId);
      // 
  
      console.log('ACL URL: %s', aclUrl)
      const aclResponse: SolidAPI.IResponce = await solid.auth.fetch(
        aclUrl, 
        {
          method: 'PUT',
          headers: { 
            'Content-Type': 'text/turtle',
          },
          credentials: 'include',
          body: requestBody
        });
      console.dir(aclResponse);

    }

    appFolderName: string = 'test7.app.review.social-app';

    
  }

```






const RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const WAC = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
const FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
const VCARD = $rdf.Namespace("http://www.w3.org/2006/vcard/ns#");

var acl = $rdf.graph();

acl.add($rdf.sym('https://nmaltsev.inrupt.net/#owner'), RDF("type"), WAC("Authorization"));
//acl.add($rdf.sym('https://nmaltsev.inrupt.net/#owner'), WAC("accessTo"), $rdf.sym('https://nmaltsev.inrupt.net/'));
acl.add($rdf.sym('https://nmaltsev.inrupt.net/#owner'), WAC('accessTo'), $rdf.sym('https://nmaltsev.inrupt.net//test5/'));
acl.add($rdf.sym("https://nmaltsev.inrupt.net/#owner"), WAC('agent'), $rdf.sym('https://nmaltsev.inrupt.net/profile/card#me'));
acl.add($rdf.sym("https://nmaltsev.inrupt.net/#owner"), WAC('mode'), WAC('Read'));
acl.add($rdf.sym("https://nmaltsev.inrupt.net/#owner"), WAC('mode'), WAC('Write'));




var aclserial = new $rdf.Serializer(acl).toN3(acl);
console.log(aclserial);    
////////////////////////////////////////////////////////////

var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
var WAC = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
var FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");
var VCARD = $rdf.Namespace("http://www.w3.org/2006/vcard/ns#");

var acl = $rdf.graph();

acl.add($rdf.sym('https://nmaltsev.inrupt.net/'), RDF("type"), WAC("GroupListing"));
acl.add($rdf.sym('https://nmaltsev.inrupt.net/#owner'), RDF("type"), VCARD("Group"));
acl.add($rdf.sym('https://nmaltsev.inrupt.net/#owner'), VCARD("hasMember"), $rdf.sym('https://myosotis.inrupt.net/profile/card#me'));
var aclserial = new $rdf.Serializer(acl).toN3(acl);
console.log(aclserial);    

==================================================================
var ns = $rdf.Namespace('https://amadeus.inrupt.net//test24.app.review.social-app/friends.ttl');
var g = $rdf.graph();
var friendNS = $rdf.sym(ns('#friends'));

g.add($rdf.sym(ns('')), RDF("type"), WAC("GroupListing"));
g.add(friendNS, RDF("type"), VCARD("Group"));
g.add(friendNS, VCARD("hasMember"), $rdf.sym('https://myosotis.inrupt.net/profile/card#me'));

new $rdf.Serializer(g).toN3(g);


https://amadeus.inrupt.net//test24.app.review.social-app/gfriends.ttl#Accounting


==================================================================


@prefix    acl:  <http://www.w3.org/ns/auth/acl#>.
@prefix  vcard:  <http://www.w3.org/2006/vcard/ns#>.

<>  a  acl:GroupListing.

<#Accounting>
    a                vcard:Group;
    # vcard:hasUID     <urn:uuid:8831CBAD-1111-2222-8563-F0F4787E5398:ABGroup>;
    # dc:created       "2013-09-11T07:18:19+0000"^^xsd:dateTime;
    # dc:modified      "2015-08-08T14:45:15+0000"^^xsd:dateTime;

    # Accounting group members:
    vcard:hasMember  <https://myosotis.inrupt.net/profile/card#me>;
    vcard:hasMember  <https://lafayette.inrupt.net/profile/card#me>.