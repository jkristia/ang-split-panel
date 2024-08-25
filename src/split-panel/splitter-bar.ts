
/*
	.splitter-bar {
		top: 0px;
		position: absolute;
		width: 5px;
		height: 100%;
		background-color: blue;
		opacity: 0.1;

		&.right {
			right: 3px;
			z-index: 1000;
			&:hover {
				opacity: 1;
				background-color: greenyellow;
				cursor: ew-resize;
			}
		}
	}
*/

import { ISvgDragUpdate, MouseTracker } from "./mouse-tracker";

export class SplitterBar {
	private _elm?: HTMLDivElement;
	private _tracker?: MouseTracker;
	private _enabled: boolean = false;
	public get enabled(): boolean {
		return this._enabled;
	}
	public set enabled(value: boolean) {
		let elm = this._elm;
		if (!elm) {
			return;
		}
		this._enabled = value;
		if (value) {
			this._owner.style.padding = '0 0 0 0';
			elm.style.visibility = 'visible';
		} else {
			this._owner.style.padding = '0';
			elm.style.visibility = 'hidden';
		}
	}
	constructor(private _owner: HTMLElement, private _horizontal = false) {
	}
	public center(): { x: number, y: number } {
		let elm = this._elm;
		if (!elm) {
			return { x: 0, y: 0 };
		}
		let r = elm.getBoundingClientRect();
		let x = r.left + elm.clientWidth / 2;
		let y = r.top + elm.clientHeight / 2;
		return { x, y };
	}
	public attach(fn: (info: ISvgDragUpdate) => void): SplitterBar {
		if (this._elm) {
			// already attached
			return this;
		}
		this._elm = document.createElement('div');
		this._owner.append(this._elm);

		if (this._horizontal) {
			this._elm.classList.add('splitter-bar-horz');
			// attach right, add padding to panel to not overlap content
			this._elm.classList.add('bottom');
		} else {
			this._elm.classList.add('splitter-bar');
			// attach right, add padding to panel to not overlap content
			this._elm.classList.add('right');
		}
		this.enabled = true;
		this._tracker = new MouseTracker(this._elm, this).onDragUpdate((dragevent, info: ISvgDragUpdate) => {
			if (dragevent !== 'update') {
				return;
			}
			if (this.enabled && this._horizontal === false && fn && info.trackX) {
				fn(info);
			}
			if (this.enabled && this._horizontal === true && fn && info.trackY) {
				fn(info);
			}
		});
		return this;
	}
}
