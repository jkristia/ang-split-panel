
export type ISvgDragEvent = 'begin' | 'update' | 'end';
export interface ISvgDragUpdate {
	elm: SVGElement | HTMLElement | null;
	trackX?: boolean;
	trackY?: boolean;
	initialX: number;
	initialY: number;
	curX: number;
	curY: number;
	diffX: number;
	diffY: number;
}
export class MouseTracker {

	public Threshold = 0;
	static primaryButton = 1;
	static secondaryButton = 2;

	protected _dragInfo: ISvgDragUpdate = {
		elm: null,
		initialX: 0,
		initialY: 0,
		curX: 0,
		curY: 0,
		diffX: 0,
		diffY: 0,
	};
	private _isTracking = false;

	private _onDragInfoFn: (ev: ISvgDragEvent, info: ISvgDragUpdate) => void = (ev, info) => {
		console.log(`drag info ${this._elm.id} `, ev, info);
	};
	public onDragUpdate(fn: (ev: ISvgDragEvent, info: ISvgDragUpdate) => void): MouseTracker {
		this._onDragInfoFn = fn;
		return this;
	}
	public get isTracking(): boolean {
		return this._isTracking;
	}
	constructor(private _elm: SVGElement | HTMLElement, private _owner?: any) {
		this.setup();
	}
	public initialMouseDown(ev: MouseEvent) {
		this.mousedown(ev);
	}
	private setup(): MouseTracker {
		this._initialMouseDownFn = this._elm.onmousedown;
		this._initialMouseUpFn = this._elm.onmouseup;
		this._elm.onmousedown = (ev: MouseEvent): void => {
			// console.log('drag onmousedown');
			this.mousedown(ev);
		};
		this._elm.onmousemove = (ev: MouseEvent): void => {
			// console.log('drag onmousemove', this.isTracking);
			if (!this.isTracking) {
				return;
			}
			this.mousemove(ev);
		};
		this._elm.onmouseup = (ev: MouseEvent): void => {
			// console.log('drag onmouseup');
			this.mouseup(ev);
		};
		return this;
	}
	private _initialMouseDownFn: any = null;
	private _initialMouseUpFn: any = null;
	public clear() {
		this.clearListening();
		this._elm.onmousedown = this._initialMouseDownFn;
		this._elm.onmousemove = null;
		this._elm.onmouseup = this._initialMouseUpFn;
	}
	private mousedown(ev: MouseEvent) {
		// prevent drag on right click
		this.setupListening();
		if (ev.buttons === MouseTracker.secondaryButton) {
			return;
		}
		if (ev.buttons !== MouseTracker.primaryButton) {
			return;
		}
		this.beginDrag(ev);
		ev.stopPropagation();
	}
	private beginDrag(event: MouseEvent): void {
		this._isTracking = true;
		this._dragInfo.elm = this._elm;
		this._dragInfo.initialX = event.clientX;
		this._dragInfo.initialY = event.clientY;
		this._dragInfo.curX = event.clientX;
		this._dragInfo.curY = event.clientY;
		this._onDragInfoFn('begin', this._dragInfo);
		this.dumpInfo();
	}

	private updateDrag(event: MouseEvent): void {
		if (!this._isTracking) {
			return;
		}
		let lastx = this._dragInfo.curX;
		let lasty = this._dragInfo.curY;
		this._dragInfo.curX = event.clientX;
		this._dragInfo.curY = event.clientY;

		if (!this._dragInfo.trackX) {
			this._dragInfo.trackX = Math.abs(this._dragInfo.initialX - this._dragInfo.curX) > this.Threshold;
			if (this._dragInfo.trackX) {
				lastx = this._dragInfo.initialX;
			}
		}
		if (!this._dragInfo.trackY) {
			this._dragInfo.trackY = Math.abs(this._dragInfo.initialY - this._dragInfo.curY) > this.Threshold;
			if (this._dragInfo.trackY) {
				lasty = this._dragInfo.initialY;
			}
		}
		if (this._dragInfo.trackX || this._dragInfo.trackY) {
			this._dragInfo.diffX = lastx - this._dragInfo.curX;
			this._dragInfo.diffY = lasty - this._dragInfo.curY;
			this._onDragInfoFn('update', this._dragInfo);
			this.clearClickHandler();
		}
		this.dumpInfo();
	}

	private endDrag(/* event: MouseEvent*/): void {
		this._isTracking = false;
		this._onDragInfoFn('end', this._dragInfo);
		// console.log(`endDrag ${this._isThumbTracking}`);
		this.dumpInfo();
	}

	private mousemove = (ev: MouseEvent) => {
		this.updateDrag(ev);
		ev.stopPropagation();
	};
	private mouseup = (ev: MouseEvent) => {
		this.clearListening();
		if (ev.button === MouseTracker.secondaryButton) {
			return;
		}
		this.endDrag(/* ev*/);
		ev.stopPropagation();
		// console.log('tracker mouseup');
	};

	private _clickHandlerFn: any = null;
	private clearClickHandler() {
		this._elm.onclick = null;
	}
	private restoreClickHandler() {
		if (this._elm.onclick === null && this._clickHandlerFn !== null) {
			this._elm.onclick = this._clickHandlerFn;
		}
	}
	private setupListening() {
		document.addEventListener('mousemove', this.mousemove);
		document.addEventListener('mouseup', this.mouseup);
		this._clickHandlerFn = this._elm.onclick;
	}
	private clearListening() {
		document.removeEventListener('mousemove', this.mousemove);
		document.removeEventListener('mouseup', this.mouseup);
		setTimeout(() => {
			this.restoreClickHandler();
		}, 0);
	}
	private dumpInfo() {
		// let i = this._dragInfo;
		// console.log(`${i.initialX}, ${i.curX}, ${i.diffX}, drag = ${i.trackX}`);
		// console.log(`${i.initialX}: ${i.initialY}, ${i.curX}:${i.curY}, ${i.diffX}:${i.diffY}, drag = ${this._isThumbTracking}`);
	}
}



