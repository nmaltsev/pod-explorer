import * as UITools from '../utils/common.js';
import {PopupBuilder} from '../utils/popup_builder.js';

// @param {function} next
function createResourcePopup(next) {
	return new PopupBuilder({
		className: 'm3-dialog __content',
		content: `
			<form data-co="form" class="">
				<label class="bookmark-form_row">
					<div>Resource name:</div>
					<input class="basefield" type="text" data-co="name" required/>
				</label>
				<label class="bookmark-form_row">
					<div>Resource Type:</div>
					<select data-co="type">
						<option value="folder">Folder</option>
						<option value="file">File</option>
					</select>
				</label>
				<div class="btnline">
					<button type="reset" class="basebtn __gray">Cancel</button>
					<button type="submit" class="basebtn __blue">Create</button>
				</div>
			</form>
		`,
		events: {
			'form submit': function(e){
				e.preventDefault();

				if (next) {
					next(
						this.controls.name.value,
						this.controls.type.value
					);
				}

				this.close();
			},
			'form reset': function() {
				e.preventDefault();
				this.close();
			},
		},
	}, {
		onopen: function(view) {
			setTimeout(function() {
				view.controls.name.focus();
			},100);
		},
		onclose: function(view){
		},
	});
};

export {
	createResourcePopup
}