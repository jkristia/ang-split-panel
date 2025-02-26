/*
	Jesper Kristiansen
	https://github.com/jkristia/ang-split-panel
*/

import {
	AfterViewInit, Component, ContentChildren, ElementRef, EventEmitter, Input, NgModule,
	OnDestroy, OnInit, Output, QueryList
} from "@angular/core";
import { SizeItem, DistributedSize, SizeOptions, SplitValues, ItemSplitValue } from "./distributed.size";
import { SplitterBar, SplitterPosition } from "./splitter-bar";
import { IDragEvent, IDragUpdate } from "./mouse-tracker";

@Component({
	selector: 'split-panel',
	template: `<ng-content></ng-content>`,
	styleUrls: ['./split-container.scss'],
})
export class SplitPanel implements OnInit {
	private _elm: HTMLElement;
	private _size!: SizeItem;
	private _splitter: SplitterBar | null = null;
	@Input() options: SizeOptions = { type: 'dynamic' };

	public offset = 0;
	public owner?: SplitContainer;
	public lastPanel = false;
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
	public setSavedSize(size: ItemSplitValue) {
		this.size.setSavedSize(size);
	}

	public attachSplitter(fn: (dragEvent: IDragEvent, info: IDragUpdate) => void) {
		if (!this._splitter) {
			let position: SplitterPosition = this.lastPanel ? 'left' : 'right';
			const horizontal = this.owner?.options.direction === 'horizontal';
			if (horizontal) {
				position = this.lastPanel ? 'top' : 'bottom';
			}
			let initialSize = 0;
			this._splitter = new SplitterBar(this.elm, position).attach((dragEvent, info) => {
				if (dragEvent === 'begin') {
					initialSize = this.size.size;
					return;
				}
				if (dragEvent === 'end') {
					initialSize = 0;
					if (fn) {
						fn(dragEvent, info);
					}
					return;
				}
				const barOffset = 10;
				const allItems = this.owner?.size.items;
				if (position === 'top') {
					const diff = info.initialY - info.curY;
					const height = initialSize + diff;

					const r = this.owner!.elm.getBoundingClientRect();
					const maxAvailableSize = this.owner?.size.maxAvailableSizeForItem(this.size, r.height) || 0;
					this.size.setSizeFromDrag(height, maxAvailableSize, allItems);
				}
				if (position === 'bottom') {
					const diff = info.initialY - info.curY;
					const height = initialSize - diff;

					const r = this.owner!.elm.getBoundingClientRect();
					const maxAvailableSize = this.owner?.size.maxAvailableSizeForItem(this.size, r.height) || 0;
					this.size.setSizeFromDrag(height, maxAvailableSize, allItems);
				}
				if (position === 'left') {
					const diff = info.initialX - info.curX;
					const width = initialSize + diff;
					const r = this.owner!.elm.getBoundingClientRect();
					const maxAvailableSize = this.owner?.size.maxAvailableSizeForItem(this.size, r.width) || 0;
					this.size.setSizeFromDrag(width, maxAvailableSize, allItems);
				}
				if (position === 'right') {
					const diff = info.initialX - info.curX;
					const width = initialSize - diff;
					const r = this.owner!.elm.getBoundingClientRect();
					const maxAvailableSize = this.owner?.size.maxAvailableSizeForItem(this.size, r.width) || 0;
					this.size.setSizeFromDrag(width, maxAvailableSize, allItems);
				}
				if (fn) {
					fn(dragEvent, info);
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
	styleUrls: ['./split-container.scss'],
})
export class SplitContainer implements OnInit, AfterViewInit, OnDestroy {
	private _resize: ResizeObserver | null = null;
	private _size = new DistributedSize();
	private _elm: HTMLElement;
	@Input() options: SplitContainerOptions = { direction: 'vertical' };
	@Output() dragEnd = new EventEmitter<SplitValues>();
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
	public setSavedSize(size?: SplitValues) {
		if (!size) {
			return;
		}
		const panels = this._panels?.toArray() || [];
		if (panels.length !== size.items.length) {
			return;
		}
		panels.forEach( (p, i) => p.setSavedSize(size.items[i]))
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
		if (panels.length <= 1) {
			// do not enable splitter if only 1 panel
			return;
		}
		// if last panel, splitter bar is either left or top
		panels[panels.length - 1].lastPanel = true;
		panels.forEach(p => {
			if (p.options.canDrag) {
				p.attachSplitter((dragEvent, info) => {
					if (dragEvent === 'end') {
						this.dragEnd.emit(this.size.splitValues);
					}
					if (dragEvent === 'update') {
						const r = this._elm.getBoundingClientRect();
						this.handleSizeChange(r.width, r.height);
					}
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