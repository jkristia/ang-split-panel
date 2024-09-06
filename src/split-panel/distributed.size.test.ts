import { SizeItem, DistributedSize } from "./distributed.size"


describe('disributed item', () => {
	it('ratio always set', () => {
		let item = new SizeItem({ type: 'fixed' });
		expect(item.ratio).toBe(1);
		item = new SizeItem({ type: 'dynamic' });
		expect(item.ratio).toBe(0.1);
		item = new SizeItem({ type: 'dynamic', ratio: -1 });
		expect(item.ratio).toBe(0.1);
		item = new SizeItem({ type: 'dynamic', ratio: 0.9 });
		expect(item.ratio).toBe(0.9);
	})
	it('setIdeal with min size', () => {
		let item = new SizeItem({ type: 'dynamic', minSize: 100 });
		expect(item.setIdealSize(101).idealSize).toBe(101)
		expect(item.setIdealSize(99).idealSize).toBe(100)
	})
	it('infer type from options', () => {
		let item = new SizeItem({});
		expect(item.options.type).toBe('dynamic');
		expect(item.ratio).toBe(1)
		item = new SizeItem({ ratio: 0.5 });
		expect(item.options.type).toBe('dynamic');
		expect(item.ratio).toBe(0.5)
		item = new SizeItem({ ratio: 0.5, size: 123 });
		expect(item.options.type).toBe('fixed');
		expect(item.size).toBe(123)
		item = new SizeItem({ size: 321 });
		expect(item.options.type).toBe('fixed');
		expect(item.size).toBe(321)
	})
})
describe('calculate size', () => {
	it('dynamic items with no ratio, no min', () => {
		const size = new DistributedSize().setItems([
			new SizeItem({ type: 'dynamic' }),
			new SizeItem({ type: 'dynamic' }),
			new SizeItem({ type: 'dynamic' }),
		]);
		size.calculate(333);
		expect(size.items[0].idealSize).toBe(111);
		expect(size.items[1].idealSize).toBe(111);
		expect(size.items[2].idealSize).toBe(111);
		size.calculate(99);
		expect(size.items[0].idealSize).toBe(33);
		expect(size.items[1].idealSize).toBe(33);
		expect(size.items[2].idealSize).toBe(33);
	})
	it('dynamic items with ratio, no min', () => {
		const size = new DistributedSize().setItems([
			new SizeItem({ type: 'dynamic', ratio: 60 }),
			new SizeItem({ type: 'dynamic', ratio: 30 }),
			new SizeItem({ type: 'dynamic', ratio: 10 }),
		]);
		size.calculate(100);
		expect(size.items[0].idealSize).toBe(60);
		expect(size.items[1].idealSize).toBe(30);
		expect(size.items[2].idealSize).toBe(10);
		size.calculate(50);
		expect(size.items[0].idealSize).toBe(30);
		expect(size.items[1].idealSize).toBe(15);
		expect(size.items[2].idealSize).toBe(5);

		size.setItems([
			new SizeItem({ type: 'dynamic', ratio: 0.6 }),
			new SizeItem({ type: 'dynamic', ratio: 0.3 }),
			new SizeItem({ type: 'dynamic', ratio: 0.1 }),
		]);
		size.calculate(100);
		expect(size.items[0].idealSize).toBeCloseTo(60, 3)
		expect(size.items[1].idealSize).toBeCloseTo(30, 3)
		expect(size.items[2].idealSize).toBeCloseTo(10, 3)
	})
	it('dynamic items with ration and min size', () => {
		const size = new DistributedSize().setItems([
			new SizeItem({ type: 'dynamic', ratio: 60, minSize: 30 }),
			new SizeItem({ type: 'dynamic', ratio: 30, minSize: 30 }),
			new SizeItem({ type: 'dynamic', ratio: 10, minSize: 30 }),
		]);
		size.calculate(100);
		expect(size.items[0].idealSize).toBeCloseTo(60, 3);
		expect(size.items[1].idealSize).toBeCloseTo(30, 3);
		expect(size.items[2].idealSize).toBeCloseTo(30, 3);
		size.calculate(50);
		expect(size.items[0].idealSize).toBeCloseTo(30, 3);
		expect(size.items[1].idealSize).toBeCloseTo(30, 3);
		expect(size.items[2].idealSize).toBeCloseTo(30, 3);
	})
	it('fixed + dyn size, no min', () => {
		const size = new DistributedSize().setItems([
			new SizeItem({ type: 'fixed', size: 100 }),
			new SizeItem({ type: 'dynamic', ratio: 75 }),
			new SizeItem({ type: 'dynamic', ratio: 25 }),
		]);
		size.calculate(200);
		expect(size.items[0].idealSize).toBe(100);
		expect(size.items[1].idealSize).toBe(75);
		expect(size.items[2].idealSize).toBe(25);
		size.calculate(110);
		expect(size.items[0].idealSize).toBe(100);
		expect(size.items[1].idealSize).toBe(7.5);
		expect(size.items[2].idealSize).toBe(2.5);
	})
	it('maxAvailableSizeForItem', () => {
		const size = new DistributedSize().setItems([
			new SizeItem({ type: 'fixed', size: 100, minSize: 50 }),
			new SizeItem({ type: 'dynamic', minSize: 50 }),
			new SizeItem({ type: 'fixed', size: 100, minSize: 50 }),
		]);
		const item = size.items[0];
		let maxAvail = size.maxAvailableSizeForItem(item, 400);
		expect(maxAvail).toBe(250);
		maxAvail = size.maxAvailableSizeForItem(item, 300);
		expect(maxAvail).toBe(150);
		maxAvail = size.maxAvailableSizeForItem(item, 150);
		expect(maxAvail).toBe(0);
	})
	it('set size from drag', () => {
		const size = new DistributedSize().setItems([
			new SizeItem({ type: 'fixed', size: 100, minSize: 50 }),
			new SizeItem({ type: 'dynamic', minSize: 50 }),
			new SizeItem({ type: 'fixed', size: 100, minSize: 50 }),
		]);
		const width = 400;
		size.calculate(width);
		expect(size.items[0].size).toBe(100);
		expect(size.items[1].size).toBe(200);
		expect(size.items[2].size).toBe(100);
		expect(size.totalAllocatedSize).toBe(400);
		// 'drag' width of first item
		const item = size.items[0];
		let avail = size.maxAvailableSizeForItem(item, width);
		item.setSizeFromDrag(150, avail);
		size.calculate(width);
		expect(size.items[0].size).toBe(150);
		expect(size.items[1].size).toBe(150);
		expect(size.items[2].size).toBe(100);
		expect(size.totalAllocatedSize).toBe(400);

		avail = size.maxAvailableSizeForItem(item, width);
		item.setSizeFromDrag(300, avail);
		size.calculate(width);
		expect(size.items[0].size).toBe(250);
		expect(size.items[1].size).toBe(50);
		expect(size.items[2].size).toBe(100);
		expect(size.totalAllocatedSize).toBe(400);
	})
	it('squeeze on reducing size', () => {
		const size = new DistributedSize().setItems([
			new SizeItem({ type: 'fixed', size: 150, minSize: 50 }),
			new SizeItem({ type: 'dynamic', minSize: 50 }),
			new SizeItem({ type: 'fixed', size: 100, minSize: 50 }),
		]);
		size.calculate(400);
		expect(size.items[0].size).toBe(150);
		expect(size.items[1].size).toBe(150);
		expect(size.items[2].size).toBe(100);
		expect(size.totalAllocatedSize).toBe(400);
		size.calculate(300);
		expect(size.items[0].size).toBe(150);
		expect(size.items[1].size).toBe(50);
		expect(size.items[2].size).toBe(100);
		expect(size.totalAllocatedSize).toBe(300);
		size.calculate(299);
		expect(size.items[0].size).toBe(149);
		expect(size.items[1].size).toBe(50);
		expect(size.items[2].size).toBe(100);
		expect(size.totalAllocatedSize).toBe(299);
		size.calculate(160);
		expect(size.items[0].size).toBe(50);
		expect(size.items[1].size).toBe(50);
		expect(size.items[2].size).toBe(60);
		expect(size.totalAllocatedSize).toBe(160);
		size.calculate(150); // min size
		expect(size.items[0].size).toBe(50);
		expect(size.items[1].size).toBe(50);
		expect(size.items[2].size).toBe(50);
		expect(size.totalAllocatedSize).toBe(150);
		// what next, overflow or squeeze evenly ?

	})
	it('drag dynamic panel', () => {
		const size = new DistributedSize().setItems([
			new SizeItem({ type: 'fixed', size: 100, minSize: 50 }),
			new SizeItem({ type: 'dynamic', ratio: 1, minSize: 10 }),
			new SizeItem({ type: 'dynamic', ratio: 1, minSize: 10 }),
			new SizeItem({ type: 'dynamic', ratio: 1, minSize: 10 }),
			new SizeItem({ type: 'fixed', size: 100, minSize: 50 }),
		]);
		const width = 500;
		size.calculate(width);
		// all items equal width
		size.items.forEach(i => expect(i.size).toBe(100));
		const dragItem = size.items[1]
		let avail = size.maxAvailableSizeForItem(dragItem, width);
		dragItem.setSizeFromDrag(90, avail, size.items);
		expect(size.items[1].options.ratio).toBe(0.3)
		expect(size.items[1].size).toBe(90)
		expect(size.items[2].options.ratio).toBe(0.35)
		expect(size.items[2].size).toBe(105)
		expect(size.items[3].options.ratio).toBe(0.35)
		expect(size.items[3].size).toBe(105)

		dragItem.setSizeFromDrag(25, avail, size.items);
		expect(size.items[1].options.ratio).toBeCloseTo(0.0833, 4)
		expect(size.items[1].size).toBe(25)
		expect(size.items[2].options.ratio).toBeCloseTo(0.4583, 4)
		expect(size.items[2].size).toBe(137.5)
		expect(size.items[3].options.ratio).toBeCloseTo(0.4583, 4)
		expect(size.items[3].size).toBe(137.5)
	})
	it('get size setting', () => {
		const size = new DistributedSize().setItems([
			new SizeItem({ type: 'fixed', size: 100, minSize: 50 }),
			new SizeItem({ type: 'dynamic', minSize: 50 }),
			new SizeItem({ type: 'dynamic', minSize: 50 }),
		]);
		size.calculate(400);
		expect(size.splitValues).toEqual({
			items: [
				{ type: 'fixed', size: 100 },
				{ type: 'dynamic', ratio: 0.1 },
				{ type: 'dynamic', ratio: 0.1 },
			]
		})
		size.calculate(153);
		expect(size.splitValues).toEqual({
			items: [
				{ type: 'fixed', size: 53 },
				{ type: 'dynamic', ratio: 0.1 },
				{ type: 'dynamic', ratio: 0.1 },
			]
		})
		size.items[1].setSizeFromDrag(200, 300, size.items)
		expect(size.splitValues).toEqual({
			items: [
				{ type: 'fixed', size: 53 },
				{ type: 'dynamic', ratio: 2 },
				{ type: 'dynamic', ratio: 0.5 },
			]
		})
	})
	it('max size', () => {
		const size = new DistributedSize().setItems([
			new SizeItem({ type: 'fixed', size: 100, minSize: 50, maxSize: 200 }),
			new SizeItem({ type: 'dynamic', minSize: 50 }),
			new SizeItem({ type: 'dynamic', minSize: 50 }),
		]);
		const width = 400;
		const item = size.items[0];
		size.calculate(400);
		let avail = size.maxAvailableSizeForItem(item, width);
		item.setSizeFromDrag(150, avail);
		size.calculate(width);
		expect(size.items[0].size).toBe(150);
		expect(size.items[1].size).toBe(125);
		expect(size.items[2].size).toBe(125);
		expect(size.totalAllocatedSize).toBe(400);

		avail = size.maxAvailableSizeForItem(item, width);
		item.setSizeFromDrag(300, avail);
		size.calculate(width);
		expect(size.items[0].size).toBe(200);
		expect(size.items[1].size).toBe(100);
		expect(size.items[2].size).toBe(100);
		expect(size.totalAllocatedSize).toBe(400);

	})
})