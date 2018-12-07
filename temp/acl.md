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
var store = $rdf.graph()  // Init a new empty graph
var contentType = 'text/turtle'
var baseUrl = 'https://nmaltsev.inrupt.net/'
var parsedGraph = $rdf.parse(data, store, baseUrl, contentType);

    $rdf.parse(data,function(triples){
        for (var i in triples){
            console.log(triples[i]);
        }
    })

```