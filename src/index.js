'use strict';
import App from './App';
// eslint-disable-next-line no-unused-vars
import css1 from './page.css';
// eslint-disable-next-line no-unused-vars
import css2 from './game.css';

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
// https://keycode.info/
function preventDefaultOnKeys(event) {
	const prevent = ['Space', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
	if (prevent.includes(event.code)) event.preventDefault();
}

window.addEventListener('keydown', preventDefaultOnKeys, false);

window.pixiapp = new App();
