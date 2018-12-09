// More about ACL
// https://www.w3.org/wiki/WebAccessControl
// https://github.com/solid/web-access-control-spec

// TODO 
// acl:agentGroup  <https://alice.example.com/work-groups#Accounting>;
// acl:agentGroup  <https://alice.example.com/work-groups#Management>.
// [acl:accessTo <card>; acl:mode acl:Read; acl:agentClass <http://my.example.net/groups/friends#group>].

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
	import(rulesets) {
		let i = rulesets.length, ruleset, rule;

		while (i-- > 0) {
			ruleset = rulesets[i];
			this
				.addRule(ruleset.id)
				.setResources(ruleset.accessTo)
				.accessMode(ruleset.mode)
				.forUsers(ruleset.agent)
				.forAgentClasses(ruleset.agentClass);

		}
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
	setResources(uri_list) {
		let i = uri_list.length;

		while(i-- > 0) {
			this.setResource(uri_list[i]);
		}
		return this;
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
		let list = Array.isArray(arguments[0]) ? arguments[0] : arguments;
		let i = list.length;

		while (i--> 0) {
			this._manager.g.add(
				this._rule,
				WAC("mode"), 
				list[i]
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
	forAgentClasses(agentClasses) {
		let i = agentClasses.length;

		console.log('agentClasses')
		console.dir(agentClasses)

		while (i-- > 0) {
			this._manager.g.add(
				this._rule,
				WAC("agentClass"), 
				$rdf.sym(agentClasses[i])
			);	
		}
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
	// 
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
	_extractList(subject, ns, getValue) {
		let temp = this.g.statementsMatching(subject, ns);

		return temp ? temp.map(getValue 
			? function(line){return line.object.value;}
			: function(line){return line.object;}
		): null;
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

			console.log('MODES parsed');
			this.g.statementsMatching(subject, WAC("mode"));

			ruleset.mode = this._extractList(subject, WAC("mode"));
			ruleset.accessTo = this._extractList(subject, WAC('accessTo'), true);
			ruleset.defaultForNew = this._extractList(subject, WAC('defaultForNew'), true);
			ruleset.agent = this._extractList(subject, WAC('agent'), true);
			ruleset.setAgentClass(this._extractList(subject, WAC('agentClass'), true));

			out.push(ruleset);
		}
		return out;
	}
}

function createSafeRuleset(uri_s, webId_s) {
	let rule = new Ruleset('default');

	rule.accessTo = [uri_s];
	rule.agent = [webId_s];
	rule.mode = [ACL_ACCESS_MODES.control, ACL_ACCESS_MODES.read, ACL_ACCESS_MODES.write];
	rule.defaultForNew = [uri_s];

	return rule;
}

export {
	ACLManager,
	ACL_ACCESS_MODES,
	ACLParser,
	Ruleset,
	createSafeRuleset
}
