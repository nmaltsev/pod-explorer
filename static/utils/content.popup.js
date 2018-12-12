import * as UITools from '../scripts/common.js';
import {PopupBuilder} from '../libs/popup_builder.js';

// @param {Object} data
// @param {Strung} data.text
function createContentPopup(data) {
	return new PopupBuilder({
		className: 'm3-dialog __content',
		content: `
			<form data-co="form" class="">
				<pre data-co="text-content" class="content-dialog-wrapper"></pre>
				<div class="mb4" data-co="ruleset-list"></div>
				
				<div class="btnline">
					<button type="reset" class="basebtn __gray">Close</button>
					<button type="submit" class="basebtn __blue">Update</button>
				</div>
			</form>
		`,
		events: {
			'form submit': function(e){
				e.preventDefault();
					this.close();	
			},
			'form reset': function(e){
				e.preventDefault();

				this.close();
			}
		},
	}, {
		onopen: function(view) {
			view.controls.textContent.innerHTML = UITools.escape(data.text)
		},
		onclose: function(view){

		},

	});


};

export {
	createContentPopup,
}