/* @flow */

import { mutex } from './async';
import { NAMED_KEYS } from './keycode';
import * as string from './string';

export const open = mutex((content: string, { cancelable = false }: {| cancelable?: boolean |} = {}): Promise<void> => new Promise((resolve, reject) => {
	const overlay = string.html`<div id="alert_message_background"></div>`;
	const container = string.html`<div id="alert_message"></div>`;
	container.append(string.html`<div>${string.safe(content)}</div>`);
	document.body.append(overlay, container);

	function confirm() {
		resolve();
		close();
	}

	function cancel() {
		reject(new Error('User cancelled alert.'));
		close();
	}

	function close() {
		document.body.removeEventListener('keyup', listenForEscape);
		container.remove();
		overlay.remove();
	}

	function listenForEscape(e: KeyboardEvent) {
		if (e.key === NAMED_KEYS.Escape) {
			if (cancelable) cancel();
			else confirm();
		}
	}

	document.body.addEventListener('keyup', listenForEscape);

	if (cancelable) {
		container.append(
			makeButton('confirm', 'button-right', confirm),
			makeButton('cancel', 'button-right', cancel, true)
		);
	} else {
		container.append(makeButton('ok', undefined, confirm, true));
	}
}));

export function makeButton(text: string, cls?: string, onClick?: () => void, focus?: boolean) {
	const btn = document.createElement('input');
	btn.setAttribute('type', 'button');
	btn.setAttribute('value', text);
	if (onClick) btn.addEventListener('click', onClick);
	if (cls) btn.classList.add(cls);
	if (focus) requestAnimationFrame(() => { btn.focus(); });
	return btn;
}
