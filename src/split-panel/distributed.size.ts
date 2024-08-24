
export interface SizeOptions {
	type: 'fixed' | 'dynamic';
	ratio?: number; 	// the ratio to which to split the remaining width across dynamic items
	minSize?: number;	// minSize, idealSize will be set to this, actual width depends on 'squeeze' method
}

export class SizeItem {
	private _idealSize: number = 0;
	public get ratio(): number {
		if (this.options.type === 'fixed') {
			return 1;
		}
		if (this.options.ratio === undefined || this.options.ratio < 0.1) {
			return 0.1;
		}
		return this.options.ratio;
	}
	public get size(): number {
		return this._idealSize;
	}
	public get idealSize(): number {
		return this._idealSize;
	}
	public get minSize(): number {
		if (this.options.minSize !== undefined && this.options.minSize >= 0) {
			return this.options.minSize;
		}
		return 0;
	}
	constructor(
		public readonly options: SizeOptions
	) { }

	public setIdealSize(size: number): SizeItem  {
		this._idealSize = Math.max(this.minSize, size);
		return this;
	}
}

/*
	array of size items, the total size is distributed across items according to their setting
*/
export class DistributedSize {

	// squeeze = 'fit_to_size' | 'min_size'
	private _items: SizeItem[] = [];
	private _fixedItems: SizeItem[] = [];
	private _dynamicItems: SizeItem[] = [];
	public get items(): SizeItem[] {
		return this._items;
	}

	public setItems(items: SizeItem[]): DistributedSize {
		this._items = items;
		this._fixedItems = items.filter(i => i.options.type === 'fixed');
		this._dynamicItems = items.filter(i => i.options.type === 'dynamic');
		return this;
	}
	public calculate(size: number) {
		let remainingSize = size;
		// subtract fixed size
		this.distributeDynamics(remainingSize);
	}
	private distributeDynamics(size: number) {
		// distribute dynamic item size according to ratio
		let ratios = this._dynamicItems.map(r => r.ratio).reduce((sum, cur) => sum + cur, 0);
		this._dynamicItems.forEach(i => i.setIdealSize(size * (i.ratio / ratios)));
	}
}