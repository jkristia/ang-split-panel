import {
	AfterViewInit, Component, ContentChildren, ElementRef, Input, NgModule, OnDestroy, OnInit, QueryList
} from "@angular/core";
import { SizeItem, DistributedSize, SizeOptions } from "./distributed.size";
import { SplitterBar } from "./splitter-bar";
import { ISvgDragUpdate } from "./mouse-tracker";

@Component({
	selector: 'split-panel',
	template: `<ng-content></ng-content>`,
	styleUrl: './split-container.scss',
})
export class SplitPanel implements OnInit {
	private _elm: HTMLElement;
	private _size!: SizeItem;
	private _splitter: SplitterBar | null = null;
	@Input() options: SizeOptions = { type: 'dynamic' };

	public offset = 0;
	public owner?: SplitContainer;
	public get size(): SizeItem {
		return this._size;
	}
	public get elm(): HTMLElement {
		return this._elm;
	}
	constructor(elm: ElementRef) {
		this._elm = elm.nativeElement;
		this._elm.style.position = 'absolute';
	}
	ngOnInit(): void {
		this._size = new SizeItem(this.options)
	}

	public attachSplitter(fn: (info: ISvgDragUpdate) => void) {
		if (!this._splitter) {
			const horizontal = this.owner?.options.direction === 'horizontal';
			this._splitter = new SplitterBar(this.elm, horizontal).attach((info) => {
				// if (this.resizedSize === null) {
				// 	this.resizedSize = this._size.size;
				// }
				// let cursize = this.resizedSize;
				// let splitpos = this._splitter.center();
				// if (this.isHorizontal) {
				// 	// move left - only if drag.cur < center.x
				// 	if (info.diffY > 0 && info.curY <= splitpos.y) {
				// 		this.resizedSize += info.diffY;
				// 	}
				// 	// move right - only if drag.cur > center.x
				// 	if (info.diffY < 0 && info.curY >= splitpos.y) {
				// 		this.resizedSize += info.diffY;
				// 	}
				// }
				// if (this.isVertical) {
				const width = info.curX - this.offset - 10; // .rect.left;
				const r = this.owner!.elm.getBoundingClientRect();
				const maxAvailableSize = this.owner?.size.maxAvailableSizeForItem(this.size, r.width) || 0;
				this.size.setSizeFromDrag(width, maxAvailableSize);
				console.log('new width ', width)
				//     this.size.setWidthFromSplitterDrag(width);
				// }
				// if (this.resizedSize < 10) {
				// 	this.resizedSize = 10;
				// }
				// only notify if there is a change
				if (fn/* && cursize !== this.resizedSize*/) {
					fn(info);
				}
			});
		}
	}

}

export interface SplitContainerOptions {
	direction: 'vertical' | 'horizontal'
}

@Component({
	selector: 'split-container',
	template: `
		<div class="split-panels-container">
			<ng-content></ng-content>
		</div>
	`,
	styleUrl: './split-container.scss',
})
export class SplitContainer implements OnInit, AfterViewInit, OnDestroy {
	private _resize: ResizeObserver | null = null;
	private _size = new DistributedSize();
	private _elm: HTMLElement;
	@Input() options: SplitContainerOptions = { direction: 'vertical' };
	@ContentChildren(SplitPanel) _panels?: QueryList<SplitPanel>

	public get size(): DistributedSize {
		return this._size;
	}
	public get elm(): HTMLElement {
		return this._elm;
	}

	constructor(elm: ElementRef) {
		this._elm = elm.nativeElement;
	}
	ngOnInit(): void {
		this._resize = new ResizeObserver(elms => {
			const r = elms[0].contentRect;
			// skp initial empty rect, this happens for nested split containers
			if (r.width === 0 && r.height === 0) {
				return;
			}
			this.handleSizeChange(r.width, r.height)
		});
		this._resize.observe(this.elm.parentElement as HTMLElement);
	}
	ngAfterViewInit(): void {
		const panels = this._panels?.toArray() || [];
		panels.forEach(panel => panel.owner = this);
		const items = panels.map(panel => panel.size);
		this._size.setItems(items);
		this.setupSplitter();
	}
	ngOnDestroy(): void {
		this._resize?.disconnect();
	}

	private handleSizeChange(width: number, height: number) {
		const panels = this._panels?.toArray() || [];
		const vertical = this.options.direction === 'vertical';
		let offset = 0;
		if (vertical) {
			this._size.calculate(width);
			panels.forEach(panel => {
				panel.elm.style.top = '0px';
				panel.elm.style.bottom = '0px';
				panel.elm.style.left = `${offset}px`;
				panel.elm.style.width = `${panel.size.size}px`;
				panel.offset = offset;
				offset += panel.size.size;
			})
		} else {
			this._size.calculate(height);
			panels.forEach(panel => {
				panel.elm.style.top = `${offset}px`;
				panel.elm.style.height = `${panel.size.size}px`;
				panel.elm.style.left = '0px';
				panel.elm.style.right = '0px';
				panel.offset = offset;
				offset += panel.size.size;
			})
		}
	}
	private setupSplitter() {
		const panels = this._panels?.toArray() || [];
		panels.forEach(p => {
			if (p.options.canDrag) {
				p.attachSplitter((info) => {
					const r = this._elm.getBoundingClientRect();
					this.handleSizeChange(r.width, r.height);
				})
			}
		})
	}

}

@NgModule({
	declarations: [
		SplitContainer,
		SplitPanel,
	],
	exports: [
		SplitContainer,
		SplitPanel,
	]
})
export class SplitContainerModule { }