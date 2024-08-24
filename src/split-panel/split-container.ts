import {
	AfterViewInit, Component, ContentChildren, ElementRef, Input, NgModule, OnDestroy, OnInit, QueryList
} from "@angular/core";
import { SizeItem, DistributedSize, SizeOptions } from "./distributed.size";

@Component({
	selector: 'split-panel',
	template: `<ng-content></ng-content>`,
	styleUrl: './split-container.scss',
})
export class SplitPanel implements OnInit {
	private _elm: HTMLElement;
	private _size!: SizeItem;
	@Input() options: SizeOptions = { type: 'dynamic' };

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

	public get elm(): HTMLElement {
		return this._elm;
	}

	constructor(elm: ElementRef) {
		this._elm = elm.nativeElement;
	}
	ngOnInit(): void {
		this._resize = new ResizeObserver(elms => {
			const r = elms[0].contentRect;
			this.handleSizeChange(r.width, r.height)
		});
		this._resize.observe(this.elm.parentElement as HTMLElement);
	}
	ngAfterViewInit(): void {
		const items = (this._panels?.toArray() || []).map(panel => panel.size);
		this._size.setItems(items);
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
				offset += panel.size.size;
			})
		} else {
			this._size.calculate(height);
			panels.forEach(panel => {
				panel.elm.style.top = `${offset}px`;
				panel.elm.style.height = `${panel.size.size}px`;
				panel.elm.style.left = '0px';
				panel.elm.style.right = '0px';
				offset += panel.size.size;
			})
		}
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