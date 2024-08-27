import { ISvgDragEvent, ISvgDragUpdate, MouseTracker } from "./mouse-tracker";

export type SplitterPosition = 'left' | 'right' | 'top' | 'bottom';
export class SplitterBar {
	private _elm?: HTMLDivElement;
	private _tracker?: MouseTracker;
	private _enabled: boolean = false;
	private _width = 4;
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
			elm.style.visibility = 'visible';
		} else {
			elm.style.visibility = 'hidden';
		}
	}
	constructor(private _owner: HTMLElement, private _position: SplitterPosition) {
	}
	public attach(fn: (dragEvent: ISvgDragEvent, info: ISvgDragUpdate) => void): SplitterBar {
		if (this._elm) {
			// already attached
			return this;
		}
		this._elm = document.createElement('div');
		this._owner.append(this._elm);

		if (this._position === 'left') {
			this._elm.style.width = `${this._width}px`;
			this._elm.style.left = `-${this._width / 2}px`;
			this._elm.classList.add('splitter-bar', 'vert', 'left');
		}
		if (this._position === 'right') {
			this._elm.style.width = `${this._width}px`;
			this._elm.style.right = `-${this._width / 2}px`;
			this._elm.classList.add('splitter-bar', 'vert', 'right');
		}
		if (this._position === 'top') {
			this._elm.style.height = `${this._width}px`;
			this._elm.style.top = `-${this._width / 2}px`;
			this._elm.classList.add('splitter-bar', 'horz', 'top');
		}
		if (this._position === 'bottom') {
			this._elm.style.height = `${this._width}px`;
			this._elm.style.bottom = `-${this._width / 2}px`;
			this._elm.classList.add('splitter-bar', 'horz', 'bottom');
		}
		this.enabled = true;
		this._tracker = new MouseTracker(this._elm, this).onDragUpdate((dragevent, info: ISvgDragUpdate) => {
			if (dragevent === 'begin' || dragevent === 'end') {
				fn(dragevent, info);
			}
			if (dragevent !== 'update') {
				this._elm?.classList.remove('is-tracking')
				return;
			}
			this._elm?.classList.add('is-tracking')
			const horizontal = this._position === 'top' || this._position === 'bottom';
			if (this.enabled && horizontal === false && fn && info.trackX) {
				fn(dragevent, info);
			}
			if (this.enabled && horizontal === true && fn && info.trackY) {
				fn(dragevent, info);
			}
		});
		return this;
	}
}
