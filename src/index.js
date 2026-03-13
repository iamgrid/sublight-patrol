'use strict';
import App from './App';
// eslint-disable-next-line no-unused-vars
import css1 from './page.css';
// eslint-disable-next-line no-unused-vars
import css2 from './game.css';

const footerStates = {
	all_visible: 'all_visible',
	footer_hidden: 'footer_hidden',
	all_hidden: 'all_hidden',
};

let footerState = footerStates.all_visible;

function toggleFooter() {
	const controlsDiv = document.getElementById('footer__controls');
	const footerBottomDiv = document.getElementById('footer__bottom');
	const toggler_chevron = document.getElementById('toggle-footer__chevron');
	const toggler_text = document.getElementById('toggle-footer__text');

	let newState = null;
	if (footerState === footerStates.all_visible) {
		newState = footerStates.footer_hidden;
	} else if (footerState === footerStates.footer_hidden) {
		newState = footerStates.all_hidden;
	} else if (footerState === footerStates.all_hidden) {
		newState = footerStates.all_visible;
	}

	if (newState === footerStates.footer_hidden) {
		footerBottomDiv.style.display = 'none';
		controlsDiv.style.display = 'block';
		controlsDiv.classList.add('footer__controls--bottom-footer-hidden');
		toggler_text.innerHTML = 'Hide Keyboard Mapping';
		toggler_chevron.style.transform = 'rotate(0deg)';
	} else if (newState === footerStates.all_hidden) {
		footerBottomDiv.style.display = 'none';
		controlsDiv.style.display = 'none';
		controlsDiv.classList.remove('footer__controls--bottom-footer-hidden');
		toggler_text.innerHTML = 'Show Footer & Keyboard Mapping';
		toggler_chevron.style.transform = 'rotate(180deg)';
	} else if (newState === footerStates.all_visible) {
		footerBottomDiv.style.display = 'flex';
		controlsDiv.style.display = 'block';
		controlsDiv.classList.remove('footer__controls--bottom-footer-hidden');
		toggler_text.innerHTML = 'Hide Footer';
		toggler_chevron.style.transform = 'rotate(0deg)';
	}

	footerState = newState;
}

document.getElementById('toggle-footer__link').onclick = toggleFooter;

let atpState = 'hidden';
let isATPTransitioning = false;

function toggleATP() {
	if (isATPTransitioning) {
		return;
	}
	const atpDiv = document.getElementById('atp');
	const atpMain = document.getElementById('atp__main');
	if (atpState === 'visible') {
		isATPTransitioning = true;
		atpMain.style.opacity = '0';
		setTimeout(() => {
			atpDiv.classList.remove('atp--active');
			isATPTransitioning = false;
			atpState = 'hidden';
		}, 300);
	} else {
		isATPTransitioning = true;
		atpDiv.classList.add('atp--active');
		setTimeout(() => {
			atpMain.style.opacity = '1';
			isATPTransitioning = false;
			atpState = 'visible';
		}, 50);
	}
}

document.getElementById('atp__header').onclick = toggleATP;

window.pixiapp = new App();
