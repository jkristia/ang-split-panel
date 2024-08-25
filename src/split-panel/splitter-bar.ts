import { ISvgDragUpdate, MouseTracker } from "./mouse-tracker";

export type SplitterPosition = 'left' | 'right' | 'top' | 'bottom';
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
			// this._owner.style.padding = '0 0 0 0';
			elm.style.visibility = 'visible';
		} else {
			// this._owner.style.padding = '0';
			elm.style.visibility = 'hidden';
		}
	}
	constructor(private _owner: HTMLElement, private _position: SplitterPosition) {
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

		if (this._position === 'left') {
			this._elm.classList.add('splitter-bar', 'vert', 'left');
		}
		if (this._position === 'right') {
			this._elm.classList.add('splitter-bar', 'vert', 'right');
		}
		if (this._position === 'bottom') {
			this._elm.classList.add('splitter-bar', 'horz', 'bottom');
		}
		if (this._position === 'top') {
			this._elm.classList.add('splitter-bar', 'horz', 'top');
		}
		this.enabled = true;
		this._tracker = new MouseTracker(this._elm, this).onDragUpdate((dragevent, info: ISvgDragUpdate) => {
			if (dragevent !== 'update') {
				this._elm?.classList.remove('is-tracking')
				return;
			}
			this._elm?.classList.add('is-tracking')
			const horizontal = this._position === 'top' || this._position === 'bottom';
			if (this.enabled && horizontal === false && fn && info.trackX) {
				fn(info);
			}
			if (this.enabled && horizontal === true && fn && info.trackY) {
				fn(info);
			}
		});
		return this;
	}
}
