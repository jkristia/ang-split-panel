
export interface SizeOptions {
	type?: 'fixed' | 'dynamic';
	ratio?: number; 	// the ratio to which to split the remaining width across dynamic items
	size?: number;		// size for fixed sized panels
	minSize?: number;	// minSize, idealSize will be set to this, actual width depends on 'squeeze' method
	canDrag?: boolean;	// enable splitter 
}

export class SizeItem {
	private _idealSize: number = 0;
	private _sizeFromDrag?: number;
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
		if (this._sizeFromDrag !== undefined) {
			return this._sizeFromDrag;
		}
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
	) {
		if (!this.options.type && this.options.size) {
			this.options.type = 'fixed';
		}
		if (!this.options.type && this.options.ratio) {
			this.options.type = 'dynamic';
		}
		if (!this.options.type && !this.options.ratio) {
			this.options.type = 'dynamic';
			this.options.ratio = 1;
		}
		if (this.options.type === 'fixed' && this.options.size) {
			this._idealSize = this.options.size;
		}
	}

	public setSizeFromDrag(newSize: number, maxAvailableSize: number) {
		newSize = Math.min(newSize, maxAvailableSize);
		this._sizeFromDrag = Math.max(this.minSize, newSize);
	}
	public setIdealSize(size: number): SizeItem {
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
	public maxAvailableSizeForItem(item: SizeItem, AvailableSize: number): number {
		// return max available size when excluding the passed item
		// for fixed item it is the current size
		// for dynamic items it is the min size
		this._items.forEach(i => {
			if (i === item) {
				return
			}
			if (i.options.type === 'fixed') {
				AvailableSize -= i.size;
			}
			if (i.options.type === 'dynamic') {
				AvailableSize -= i.minSize;
			}
		})
		return AvailableSize;
	}
	public get totalAllocatedSize(): number {
		return this._items.map(i => i.size).reduce((sum, cur) => sum + cur);
	}
	public calculate(size: number) {
		let remainingSize = size;
		// subtract fixed size
		this._fixedItems.forEach(item => {
			const size = item.size || 0;
			item.setIdealSize(size);
			remainingSize -= size;
		});
		this.distributeDynamics(remainingSize);
		const totalAllocated = this.totalAllocatedSize
		if (size < totalAllocated) {
			// need to squeeze, pass the amout we must squeeze
			this.squeezeToFit(totalAllocated - size)
		}
	}
	private distributeDynamics(size: number) {
		// distribute dynamic item size according to ratio
		size = Math.max(0, size);
		let ratios = this._dynamicItems.map(r => r.ratio).reduce((sum, cur) => sum + cur, 0);
		this._dynamicItems.forEach(i => i.setIdealSize(size * (i.ratio / ratios)));
	}
	private squeezeToFit(toRemove: number) {
		// start by reducing fixed panels with value larger than minValue
		for (const item of this._fixedItems) {
			if (item.size > item.minSize) {
				// remove as much as possible, will be clmaped to minSize
				const oldSize = item.size;
				const newSize = item.size - toRemove;
				item.setSizeFromDrag(newSize, newSize);
				toRemove -= (oldSize - item.size);
				if (toRemove <= 0) {
					return;
				}
			}
		}
	}
}