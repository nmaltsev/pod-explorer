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

