/* @flow */

import { ajax } from '../environment';
import type { Thing } from './Thing';
import { batch } from './async';
import { filterMap } from './array';
import { isLoggedIn } from './user';

const hideEndpoint = '/api/hide';
const unhideEndpoint = '/api/unhide';
export const [HIDE, UNHIDE] = ['hide', 'unhide'];

export const send = async (state: 'hide' | 'unhide', things: Thing[]) => {
	if (!isLoggedIn()) throw new Error('Not logged in');

	const values = filterMap(things, thing => {
		const id = thing.getFullname();
		const element = thing.getHideElement();
		return id && element && element.getAttribute('action') === state ? [{ id, element }] : undefined;
	});

	const updateElements = (action, text) => {
		for (const { element } of values) {
			if (action) element.setAttribute('action', action);
			if (element.classList.contains('noCtrlF')) element.setAttribute('data-text', text);
			else element.textContent = text;
		}
	};

	updateElements(undefined, state === HIDE ? 'hiding...' : 'unhiding...');

	try {
		await ajax({
			method: 'POST',
			url: state === HIDE ? hideEndpoint : unhideEndpoint,
			data: { id: values.map(({ id }) => id).join(',') },
			type: 'json',
		});
		updateElements(state === HIDE ? UNHIDE : HIDE, state === HIDE ? UNHIDE : HIDE);
	} catch (e) {
		updateElements(state === HIDE ? HIDE : UNHIDE, state === HIDE ? HIDE : UNHIDE);
		throw e;
	}
};

export const hide = batch(things => send(HIDE, things), { size: 50 });
export const unhide = batch(things => send(UNHIDE, things), { size: 50 });
