'use strict';
import App from './App';
// eslint-disable-next-line no-unused-vars
import css from './sublight-patrol.css';

function toggleFooter() {
	const footer = document.getElementById('footer');
	const toggler_chevron = document.getElementById('toggle-footer__chevron');
	const toggler_text = document.getElementById('toggle-footer__text');

	if (footer.style.display === 'none') {
		footer.style.display = 'grid';
		toggler_text.innerHTML = 'Hide Footer';
		toggler_chevron.style.transform = 'rotate(0deg)';
	} else {
		footer.style.display = 'none';
		toggler_text.innerHTML = 'Show Footer';
		toggler_chevron.style.transform = 'rotate(180deg)';
	}
}

document.getElementById('toggle-footer__link').onclick = toggleFooter;

// prevent keyboard scroll events (space and arrow keys) on window
window.addEventListener(
	'keydown',
	function (e) {
		if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
			e.preventDefault();
		}
	},
	false
);

new App();
