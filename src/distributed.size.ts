
export interface SizeOptions {
	type: 'fixed' | 'dynamic';
	ratio?: number; // the ratio to which to split the remaining width across dynamic items
}

export class DistributedItem {
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
	public get idealSize(): number {
		return this._idealSize;
	}
	constructor(
		public readonly options: SizeOptions
	) {}

	public setIdealSize(size: number) {
		this._idealSize = size;
	}
}

/*
	array of size items, the total size is distributed across items according to their setting
*/
export class DistributedSize {
	private _item: DistributedItem[] = [];
	private _fixedItems: DistributedItem[] = [];
	private _dynamicItems: DistributedItem[] = [];

	public setItems(items: DistributedItem[]): DistributedSize {
		this._item = items;
		this._fixedItems = items.filter( i => i.options.type === 'fixed');
		this._dynamicItems = items.filter( i => i.options.type === 'dynamic');
		return this;
	}
	public calculate(size: number) {
		let remainingSize = size;
		// subtract fixed size
		this.distributeDynamics(remainingSize);
	}

	private distributeDynamics(size: number) {
		let 

	}
}