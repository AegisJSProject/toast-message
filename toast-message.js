const sheet = new CSSStyleSheet();
const ANIMATION_DURATION = 400;
const ANIMATION_EASING = 'ease-out';
const SELECTOR_PREFIX = 'toast-message';
const PROPS = {
	'top': { syntax: '<length-percentage> | auto', initialValue: 'auto' },
	'bottom': { syntax: '<length-percentage> | auto', initialValue: 'auto' },
	'left': { syntax: '<length-percentage> | auto', initialValue: 'auto' },
	'right': { syntax: '<length-percentage> | auto', initialValue: 'auto' },
	'margin-x': { syntax: '<length-percentage> | auto', initialValue: 'auto' },
	'translate-y': { syntax: '<length-percentage>', initialValue: '100%' },
	'offset': { syntax: '<length-percentage>', initialValue: '20px' }
};

if (typeof CSS.registerProperty === 'function') {
	for (const [name, { syntax = '*', inherits = true, initialValue }] of Object.entries(PROPS)) {
		try {
			CSS.registerProperty({
				name: `--${SELECTOR_PREFIX}-${name}`,
				syntax,
				inherits,
				initialValue,
			});
		} catch {
			// Ignore already registered props
		}
	}
}

sheet.replace(`@layer components.toast {
	:host {
		/* Use custom properties driven by the position attribute */
		inset-block-start: var(--${SELECTOR_PREFIX}-top, ${PROPS.top.initialValue});
		inset-block-end: var(--${SELECTOR_PREFIX}-bottom, var(--${SELECTOR_PREFIX}-offset, ${PROPS.offset.initialValue}));
		inset-inline-start: var(--${SELECTOR_PREFIX}-left, ${PROPS.left.initialValue});
		inset-inline-end: var(--${SELECTOR_PREFIX}-right, ${PROPS.right.initialValue});
		margin-inline: var(--${SELECTOR_PREFIX}-margin-x, ${PROPS['margin-x'].initialValue});
		border: 1px solid rgba(128, 128, 128, 0.3);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-radius: 8px;
		font-family: system-ui, sans-serif;
		padding: 12px 16px;
		width: max-content;
		max-width: 90vw;
		max-height: 80vh;
		overflow: auto;
		align-items: center;
		gap: 16px;
	}

	:host(:state(open)) {
		display: flex;
	}

	:host([popover="manual"]:state(open))::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
	}

	:host([theme="light"]) {
		color-scheme: light;
	}

	:host([theme="dark"]) {
		color-scheme: dark;
	}

	:host([position^="top"]) {
		--${SELECTOR_PREFIX}-top: var(--${SELECTOR_PREFIX}-offset, ${PROPS.offset.initialValue});
		--${SELECTOR_PREFIX}-bottom: auto;
		--${SELECTOR_PREFIX}-translate-y: -100%;
	}

	:host([position^="bottom"]),
	:host(:not([position])) { /* Default */
		--${SELECTOR_PREFIX}-top: auto;
		--${SELECTOR_PREFIX}-bottom: var(--${SELECTOR_PREFIX}-offset, ${PROPS.offset.initialValue});
		--${SELECTOR_PREFIX}-translate-y: 100%;
	}

	:host([position$="start"]) {
		--${SELECTOR_PREFIX}-left: var(--${SELECTOR_PREFIX}-offset, ${PROPS.offset.initialValue});
		--${SELECTOR_PREFIX}-right: auto;
		--${SELECTOR_PREFIX}-margin-x: 0;
	}

	:host([position$="end"]) {
		--${SELECTOR_PREFIX}-left: auto;
		--${SELECTOR_PREFIX}-right: var(--${SELECTOR_PREFIX}-offset, ${PROPS.offset.initialValue});
		--${SELECTOR_PREFIX}-margin-x: 0;
	}

	:host([position$="center"]),
	:host(:not([position])) { /* Default */
		--${SELECTOR_PREFIX}-left: 0;
		--${SELECTOR_PREFIX}-right: 0;
		--${SELECTOR_PREFIX}-margin-x: auto;
	}

	[part="close"] {
		background: none;
		border: none;
		font-size: 16px;
		font-weight: bold;
		cursor: pointer;
		padding: 0;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	[part="close"]:hover,
	[part="close"]:focus-visible {
		opacity: 1;
	}

	@media (prefers-reduced-motion: no-preference) {
		:host {
			opacity: 0;
			transform: translateY(var(--${SELECTOR_PREFIX}-translate-y, ${PROPS['translate-y'].initialValue}));

			transition:
				opacity ${ANIMATION_DURATION}ms ${ANIMATION_EASING},
				transform ${ANIMATION_DURATION}ms ${ANIMATION_EASING},
				display ${ANIMATION_DURATION}ms allow-discrete,
				overlay ${ANIMATION_DURATION}ms allow-discrete;
		}

		:host(:popover-open) {
			opacity: 1;
			transform: translateY(0);
		}

		@starting-style {
			:host(:popover-open) {
				opacity: 0;
				transform: translateY(var(--${SELECTOR_PREFIX}-translate-y, ${PROPS['translate-y'].initialValue}));
			}
		}
	}
}`);

export class HTMLToastMessageElement extends HTMLElement {
	#shadow = this.attachShadow({ mode: 'closed' });
	#internals = this.attachInternals();
	#controller;
	#resolvers;
	#timeout = NaN;
	#previousActive = null;

	constructor() {
		super();
		const container = document.createElement('div');
		const slot = document.createElement('slot');
		const close = document.createElement('button');
		const closeIcon = document.createElement('slot');

		slot.name = 'content';
		close.type = 'button';
		close.command = 'hide-popover';
		close.commandForElement = this;
		close.part.add('close');
		close.ariaLabel = 'Dismiss';
		closeIcon.name = 'close';
		closeIcon.textContent = 'X';
		container.part.add('container');
		close.append(closeIcon);
		container.append(slot);
		this.#shadow.adoptedStyleSheets = [sheet];
		this.#shadow.append(container, close);
		this.#internals.role = 'status';
	}

	/**
	 * @return {boolean}
	 */
	get autoRemove() {
		return this.hasAttribute('autoremove');
	}

	/**
	 * @param {boolean}
	 */
	set autoRemove(val) {
		this.toggleAttribute('autoremove', val);
	}

	/**
	 * @return {boolean}
	 */
	get autoShow() {
		return this.hasAttribute('autoshow');
	}

	/**
	 * @param {boolean}
	 */
	set autoShow(val) {
		this.toggleAttribute('autoshow', val);
	}

	/**
	 * @returns {number}
	 */
	get duration() {
		return this.hasAttribute('duration') ? parseInt(this.getAttribute('duration')) : NaN;
	}

	/**
	 * @param {number}
	 */
	set duration(val) {
		if (Number.isSafeInteger(val) && val > 0) {
			this.setAttribute('duration', val);
		} else if (typeof val === 'string') {
			this.duration = parseInt(val);
		} else {
			this.removeAttribute('duration');
		}
	}

	/**
	 * @returns {"light"|"dark"|"auto"}
	 */
	get theme() {
		return this.getAttribute('theme') ?? 'auto';
	}

	/**
	 * @param {"light"|"dark"|"auto"}
	 */
	set theme(val) {
		if (typeof val === 'string' && val.length !== 0) {
			this.setAttribute('theme', val);
		} else {
			this.removeAttribute('theme');
		}
	}

	/**
	 * @returns {"top-start"|"top-center"|"top-end"|"bottom-start"|"bottom-center"|"bottom-end"}
	*/
	get position() {
		return this.getAttribute('position') ?? 'bottom-center';
	}

	/**
	 * @param {"top-start"|"top-center"|"top-end"|"bottom-start"|"bottom-center"|"bottom-end"} val
	 */
	set position(val) {
		if (typeof val === 'string' && val.length !== 0) {
			this.setAttribute('position', val);
		} else {
			this.removeAttribute('position');
		}
	}

	/**
	 * @returns {boolean}
	 */
	get open() {
		return this.#internals.states.has('open');
	}

	/**
	 * @return {Promise<void>}
	 */
	get whenDismissed() {
		if (this.open) {
			return this.#resolvers?.promise;
		} else {
			return Promise.resolve();
		}
	}

	connectedCallback() {
		this.#controller = new AbortController();

		if (! this.hasAttribute('popover')) {
			this.popover = 'manual';
		}

		this.addEventListener('beforetoggle', ({ newState }) => {
			if (newState === 'open') {
				this.#previousActive = this.getRootNode().activeElement;
			}
		}, { passive: true, signal: this.#controller.signal });

		this.addEventListener('toggle', ({ newState }) => {
			if (newState === 'open') {
				this.#resolvers = Promise.withResolvers();
				const duration = this.duration;
				this.#internals.states.add('open');

				if (! Number.isNaN(duration)) {
					this.#timeout = setTimeout(() => {
						if (this.matches(':hover, :focus-within')) {
							const controller = new AbortController();
							const signal = AbortSignal.any([controller.signal, this.#controller.signal]);
							const callback = ({ currentTarget }) => {
								if (! currentTarget.matches(':hover, :focus-within')) {
									currentTarget.hidePopover();
									controller.abort();
								}
							};

							this.addEventListener('mouseleave', callback, { signal });
							this.addEventListener('focusout', callback, { signal });
						} else {
							this.hidePopover();
						}
					}, duration);
				}
			} else {
				this.#internals.states.delete('open');
				this.#resolvers?.resolve?.();

				if (! Number.isNaN(this.#timeout)) {
					clearTimeout(this.#timeout);
					this.#timeout = NaN;
				}

				if (this.autoRemove) {
					this.remove();
				}

				if (this.#previousActive instanceof Element) {
					this.#previousActive.focus();
					this.#previousActive = null;
				}
			}
		}, { passive: true, signal: this.#controller.signal });

		if (this.autoShow) {
			this.showPopover();
		}
	}

	disconnectedCallback() {
		if (! this.#controller.signal.aborted) {
			this.#controller.abort(new DOMException('Disconnected', 'AbortError'));
		}
	}

	[Symbol.dispose]() {
		if (this.open) {
			this.hidePopover();
		}

		if (this.isConnected) {
			this.remove();
		}
	}

	/**
	 *
	 * @param {string|Element} content
	 * @param {object} config
	 * @param {number} [config.duration]
	 * @param {boolean} [config.autoRemove=false]
	 * @param {boolean} [config.autoShow=false]
	 * @param {"manual"|"auto"|"hint"} [config.popover="manual"]
	 * @param {"light"|"dark"|"auto"}[config.theme]
	 * @returns {HTMLToastMessageElement}
	 */
	static create(content, {
		duration,
		autoRemove = false,
		autoShow = false,
		popover = 'manual',
		position = 'bottom-center',
		theme,
		signal,
	} = {}) {
		signal?.throwIfAborted?.();
		const el = new this();

		if (content instanceof Element) {
			content.slot = 'content';
			el.append(content);
		} else if (typeof content === 'string') {
			const slotted = document.createElement('p');
			slotted.slot = 'content';
			slotted.textContent = content;
			el.append(slotted);
		}

		if (Number.isSafeInteger(duration) && duration > 0) {
			el.duration = duration;
		}

		if (autoRemove) {
			el.autoRemove = true;
		}

		if (autoShow) {
			el.autoShow = true;
		}

		if (typeof theme === 'string') {
			el.theme = theme;
		}

		if (typeof position === 'string') {
			el.position = position;
		}

		el.popover = popover;

		if (signal instanceof AbortSignal) {
			signal.addEventListener('abort', () => el.hidePopover(), { once: true });
		}

		return el;
	}

	/**
	 *
	 * @param {string|Element} content
	 * @param {object} config
	 * @param {number} [config.duration]
	 * @param {boolean} [config.autoRemove=true]
	 * @param {boolean} [config.autoShow=true]
	 * @param {"manual"|"auto"|"hint"} [config.popover="manual"]
	 * @param {"light"|"dark"|"auto"}[config.theme]
	 * @param {string|HTMLElement} [config.parent]
	 * @param {DocumentOrShadowRoot} [config.base]
	 * @returns {HTMLToastMessageElement}
	 */
	static toast(content, {
		duration,
		autoRemove = true,
		autoShow = true,
		popover = 'manual',
		position = 'bottom-center',
		theme,
		parent = document.body,
		base = document,
		signal,
	} = {}) {
		if (typeof parent === 'string') {
			return this.toast(content, {
				duration,
				autoRemove,
				autoShow,
				popover,
				theme,
				parent: base.getElementById(parent),
				signal,
			});
		} else if (parent instanceof HTMLElement) {
			const toast = this.create(content, { duration, autoRemove, autoShow, theme, popover, position, signal });
			parent.append(toast);
			return toast;
		} else {
			throw new TypeError('Parent must be an HTMLElement or valid id.');
		}
	}

	static {
		customElements.define('toast-message', this);
	}
}
