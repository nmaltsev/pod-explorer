import * as UITools from '../utils/common.js';
import {PopupBuilder} from '../utils/popup_builder.js';

// @param {Object} data
// @param {String} data.text
// @param {String} data.title
// @param {Function} data.onsave(text_s)
function createTextPopup(data) {
	return new PopupBuilder({
		className: 'm3-dialog __text',
		content: `
			<form data-co="form" class="layout-row">
				<h3 class="layout-row_cell-auto edit-popup_title" data-co="title"></h3>
				<textarea data-co="text-content" class="layout-row_cell-full edit-popup_textbox"></textarea>
				<div class="layout-row_cell-auto btnline">
					<button type="reset" class="basebtn __gray">Close</button>
					<button type="submit" class="basebtn __blue">Update</button>
				</div>
			</form>
		`,
		events: {
			'textContent keydown': function(e) {
				// console.dir(e)
				let $textBox = e.target;

				if (e.keyCode == 9) {
					e.preventDefault();
					e.stopPropagation();

					let start = $textBox.selectionStart;
					let end = $textBox.selectionEnd;
					console.log('Selection %s - %s', start, end);
					$textBox.value = $textBox.value.substring(0, start) + '\t' + $textBox.value.substring(end);

					// put caret at right position again
					$textBox.selectionStart = $textBox.selectionEnd = start + 1;
				}
				
			},
			'form submit': function(e){
				e.preventDefault();

				if (data.onsave) {
					data.onsave(this.controls.textContent.value);
				}
				this.close();	
			},
			'form reset': function(e){
				e.preventDefault();

				this.close();
			}
		},
	}, {
		onopen: function(view) {
			console.log('O');
			console.dir(data);

			this.controls.textContent.value = data.text;
			this.controls.title.innerText = data.title;
		},
		onclose: function(view){

		},

	});
};

export {
	createTextPopup,
}