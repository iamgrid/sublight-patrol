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

new App();
