import * as UITools from '../utils/common.js';
import {PopupBuilder} from '../utils/popup_builder.js';
import {ACL_ACCESS_MODES, createSafeRuleset, Ruleset} from './../models/acl_manager.js';

function createRulesetPopup(d) {
	return new PopupBuilder({
		className: 'm3-dialog __size-a',
		content: `
			<form data-co="form" class="">
				<div class="mb4" data-co="ruleset-list"></div>
				
				<div class="btnline">
					<button class="basebtn __gray" data-co="add">Add new ruleset</button>
					<button type="reset" class="basebtn __gray">Close</button>
					<button type="submit" class="basebtn __blue">Update</button>
				</div>
			</form>
		`,
		events: {
			'form click': function(e) {
				if (e.target.dataset.action == 'removeRuleset') {
					e.stopPropagation();
					let index = parseInt(e.target.dataset.index);
					this.rulesetControls[index] = 0;
					e.target.parentNode.remove();
				}
			},
			'add click': function(e) {
				e.preventDefault();
				this.rulesetControls.push(
					this.renderRuleset(
						createSafeRuleset(d.uri, _storage.webId, d.aclUri), 
						this.rulesetControls.length
					)
				);
			},
			'form submit': function(e){
				e.preventDefault();
				let rulesets = this.rulesetControls.filter(function(r){return r!=0;}).map((controls) => {
					let ruleset = new Ruleset(controls.fieldRulesetId.value);

					ruleset.mode = [];

					if (controls.checkboxRead.checked) ruleset.mode.push(ACL_ACCESS_MODES.read);
					if (controls.checkboxWrite.checked) ruleset.mode.push(ACL_ACCESS_MODES.write);
					if (controls.checkboxControl.checked) ruleset.mode.push(ACL_ACCESS_MODES.control);
					if (controls.checkboxAppend.checked) ruleset.mode.push(ACL_ACCESS_MODES.append);

					ruleset.accessTo = this.parseArray(controls.accessTo.value);
					ruleset.agent = this.parseArray(controls.agent.value);
					ruleset.setAgentClass(this.parseArray(controls.agentClass.value));
					ruleset.setGroup(this.parseArray(controls.group.value));
					ruleset.defaultForNew = this.parseArray(controls.defaultForNew.value);

					return ruleset;
				});


				_storage.updateACL(d.aclUri, rulesets).then(() => {
					this.close();	
				});
				// _storage.setACL(d.aclUri, d.uri).then(() => {
				// 	this.close();	
				// });
			},
			'form reset': function(e){
				e.preventDefault();

				this.close();
			}
		},
	}, {
		parseArray: function(str) {
			let s = str.replace(/\s/g, '');
			return s ? s.split(',') : [];
		},
		onopen: function(view) {
			this.rulesetControls = d.rulesets.map(function(ruleset, rulesetIndex) {
				return view.renderRuleset(ruleset, rulesetIndex);
			});
		},
		onclose: function(view){

		},
		rulesetControls: [],
		renderRuleset: function(ruleset, rulesetIndex) {
			let $tr = UITools.cr('div');

			$tr.className = 'ruleset-item';
			
			$tr.insertAdjacentHTML('beforeEnd', 
			`	<div class="ruleset-item_remove" data-action="removeRuleset" data-index="${rulesetIndex}">[x]</div>
				<label>
					<p class="">Ruleset id:</p>
					<input class="basefield" type="text" data-co="field-ruleset-id" required/>
				</label>
				<div class="mb2">
					<p>Access mode:</p>
					<label>
						<input type="checkbox" data-co="checkbox-read"/><span>Read</span>
					</label>
					<label>
						<input type="checkbox" data-co="checkbox-write"/><span>Write</span>
					</label>
					<label>
						<input type="checkbox" data-co="checkbox-append"/><span>Append</span>
					</label>
					<label>
						<input type="checkbox" data-co="checkbox-control"/><span>Control</span>
					</label>
				</div>
				<div>
					<p>Access to (Enter url of resource - folder or file):</p>
					<textarea class="basefield" data-co="accessTo"></textarea>
				</div>
				<div>
					<p>Granted to users (Enter webId):</p>
					<textarea class="basefield" data-co="agent"></textarea>
				</div>
				<div>
					<p>Granted to groups (Enter group url):</p>
					<textarea class="basefield" data-co="group"></textarea>
				</div>
				<div>
					<p>agentClass (http://xmlns.com/foaf/0.1/Agent for non authorized users):</p>
					<textarea class="basefield" data-co="agentClass"></textarea>
				</div>
				<div>
					<p>defaultForNew (Enter url of resource - folder or file):</p>
					<textarea class="basefield" data-co="defaultForNew"></textarea>
				</div>
			`);

			this.controls.rulesetList.appendChild($tr);	
			let controls = UITools.findNodes($tr);
		
			controls.fieldRulesetId.value = ruleset.id;
			console.log('ruleset.mode');
			console.dir(ruleset.mode);
			console.dir(ACL_ACCESS_MODES);

			(ruleset.mode || []).forEach(function(mode) {
				if (mode.value == ACL_ACCESS_MODES.read.value) controls.checkboxRead.checked = true;
				if (mode.value == ACL_ACCESS_MODES.write.value) controls.checkboxWrite.checked = true;
				if (mode.value == ACL_ACCESS_MODES.control.value) controls.checkboxControl.checked = true;
				if (mode.value == ACL_ACCESS_MODES.append.value) controls.checkboxAppend.checked = true;
			});

			controls.accessTo.value = (ruleset.accessTo || []).join(',\n');
			controls.agent.value = (ruleset.agent || []).join(',\n');
			controls.agentClass.value = (ruleset.agentClass || []).join(',\n');
			controls.defaultForNew.value = (ruleset.defaultForNew || []).join(',\n');
			controls.group.value = (ruleset.agentGroup || []).join(',\n');


			return controls;	
		},
	});
}

export {
	createRulesetPopup,
}