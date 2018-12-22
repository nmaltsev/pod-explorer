import * as UITools from '../utils/common.js';
import {PopupBuilder} from '../utils/popup_builder.js';

// @param {Object} data
// @param {String} data.text
// @param {String} data.image
// @param {String} data.title
function createContentPopup(data) {
	return new PopupBuilder({
		className: 'm3-dialog __content',
		content: `
			<form data-co="form" class="layout-row">
				<h3 class="layout-row_cell-auto edit-popup_title" data-co="title"></h3>
				<div class="layout-row_cell-full edit-popup_content-wrapper">
					<pre data-co="text-content" class="edit-popup_text-block"></pre>
					<div data-co="image-wrap" class="m3-dialog-scroller edit-popup_image-wrap">
						<img class="edit-popup_image" data-co="image">
					</div>
				</div>
				<div class="layout-row_cell-auto  btnline">
					<button type="submit" class="basebtn __blue">Close</button>
				</div>
			</form>
		`,
		events: {
			'form submit': function(e){
				e.preventDefault();
				this.close();	
			},
			'image load': function() {

			},
			'image error': function() {

			},
		},
	}, {
		onopen: function(view) {
			view.controls.title.textContent = data.title;

			if (data.hasOwnProperty('text')) {
				UITools.toggle(view.controls.textContent, true);
				UITools.toggle(view.controls.imageWrap, false);
				view.controls.textContent.innerHTML = UITools.escape(data.text);	
			} else if (data.hasOwnProperty('image')) {
				UITools.toggle(view.controls.imageWrap, true);
				UITools.toggle(view.controls.textContent, false);
				view.controls.image.setAttribute('src', data.image);
			} else {
				alert('Unsupported viewer format');
			}
		},
		onclose: function(view){

		},
	});
};

export {
	createContentPopup,
}