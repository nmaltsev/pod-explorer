const RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const WAC = $rdf.Namespace("http://www.w3.org/ns/auth/acl#");
const FOAF = $rdf.Namespace("http://xmlns.com/foaf/0.1/");


const ACL_ACCESS_MODES = {
	read: WAC('Read'),
	write: WAC('Write'),
	control: WAC('Control'),
};


class ACLManager {
	constructor (webId_s) {
		this.g = $rdf.graph(); 
		this.webId_s = webId_s;
		this.$webId = $rdf.sym(webId_s);
		this.self_Namespace = $rdf.Namespace(this.$webId.site().value);
	}
	addRule (ruleName_s) {
		return new ACLRule(ruleName_s, this);
	}
	serialize () {
		return new $rdf.Serializer(this.g).toN3(this.g);
	}
	fromRulesets(rulesets) {
		// TODO
	}
}

class ACLRule {
	constructor (ruleName_s, manager) {
		// this._name = '#' + ruleName_s;
		this._manager = manager;	
		this._rule = $rdf.sym(this._manager.self_Namespace('#' + ruleName_s)),

		this._manager.g.add(
			this._rule,
			RDF("type"), 
			WAC("Authorization")
		);
	}
	setResource(uri_s) {
		this._manager.g.add(
			this._rule,
			WAC("accessTo"), 
			$rdf.sym(uri_s)
		);
		this._manager.g.add(
			this._rule,
			WAC("defaultForNew"), 
			$rdf.sym(uri_s)
		);
		return this;
	}
	accessMode() {
		let i = arguments.length;
		while (i--> 0) {
			this._manager.g.add(
				this._rule,
				WAC("mode"), 
				arguments[i]
			);	
		}

		return this;
	}
	forNotAuthorized() {
		this._manager.g.add(
			this._rule,
			WAC("agentClass"), 
			FOAF('Agent')
		);
		
		return this;		
	}
	forMe() {
		this._manager.g.add(
			this._rule,
			WAC("agent"), 
			this._manager.$webId
		);
		
		return this;
	}
	// Also for group too.
	// webId - url of webId or group 
	forUsers(webIds) {
		let i = webIds.length;

		while(i-- > 0) {
			this._manager.g.add(
				this._rule,
				WAC("agent"), 
				$rdf.sym(webIds[i])
			);	
		}
		
		return this;
	}
}

class Ruleset {
	constructor (id_s) {
		this.id = id_s;
	}
	setAgentClass(list) {
		this.agentClass = list;

		if (
			Array.isArray(list) &&
			list.length == 1 &&
			list[0] == FOAF('Agent').value
		) {
			this.isPublic = true;
		}
	}
}

class ACLParser {
	constructor(data, webId_s) {
		this.g = $rdf.graph();
		this.webId_s = webId_s;
		this.$webId = $rdf.sym(webId_s);
		this.self_Namespace = $rdf.Namespace(this.$webId.site().value);

		// $rdf.parse(data, store, baseUrl, contentType); 'text/turtle'
		$rdf.parse(data, this.g, this.$webId.site().value, 'text/n3');
	}
	_extractList(subject, ns) {
		let temp = this.g.statementsMatching(subject, ns);

		return temp ? temp.map(function(line){return line.object.value;}): null;
	}
	getRules() {
		let rulesSubGraphs = this.g.statementsMatching(
			null, 
			RDF('type'), 
			WAC("Authorization")
		);

		let i = rulesSubGraphs && rulesSubGraphs.length;
		let out = [];
		var subject, ruleset;

		while (i-- > 0) {
			subject = rulesSubGraphs[i].subject;
			ruleset = new Ruleset(subject.value.split('#')[1]);

			ruleset.mode = this._extractList(subject, WAC("mode"));
			ruleset.accessTo = this._extractList(subject, WAC('accessTo'));
			ruleset.defaultForNew = this._extractList(subject, WAC('defaultForNew'));
			ruleset.agent = this._extractList(subject, WAC('agent'));
			ruleset.setAgentClass(this._extractList(subject, WAC('agentClass')));

			out.push(ruleset);
		}
		return out;
	}
}


export {
	ACLManager,
	ACL_ACCESS_MODES,
	ACLParser,
	Ruleset
}
