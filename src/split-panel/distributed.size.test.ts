import { DistributedItem, DistributedSize } from "./distributed.size"


describe('disributed item', () => {
	it('ratio always set', () => {
		let item = new DistributedItem({ type: 'fixed' });
		expect(item.ratio).toBe(1);
		item = new DistributedItem({ type: 'dynamic' });
		expect(item.ratio).toBe(0.1);
		item = new DistributedItem({ type: 'dynamic', ratio: -1 });
		expect(item.ratio).toBe(0.1);
		item = new DistributedItem({ type: 'dynamic', ratio: 0.9 });
		expect(item.ratio).toBe(0.9);
	})
	it('setIdeal with min size', () => {
		let item = new DistributedItem({ type: 'dynamic', minSize: 100 });
		expect(item.setIdealSize(101).idealSize).toBe(101)
		expect(item.setIdealSize(99).idealSize).toBe(100)
	})
})
describe('calculate size', () => {
	it('dynamic items with no ratio, no min', () => {
		const size = new DistributedSize().setItems([
			new DistributedItem({ type: 'dynamic' }),
			new DistributedItem({ type: 'dynamic' }),
			new DistributedItem({ type: 'dynamic' }),
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
			new DistributedItem({ type: 'dynamic', ratio: 60 }),
			new DistributedItem({ type: 'dynamic', ratio: 30 }),
			new DistributedItem({ type: 'dynamic', ratio: 10 }),
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
			new DistributedItem({ type: 'dynamic', ratio: 0.6 }),
			new DistributedItem({ type: 'dynamic', ratio: 0.3 }),
			new DistributedItem({ type: 'dynamic', ratio: 0.1 }),
		]);
		size.calculate(100);
		expect(size.items[0].idealSize).toBeCloseTo(60, 3)
		expect(size.items[1].idealSize).toBeCloseTo(30, 3)
		expect(size.items[2].idealSize).toBeCloseTo(10, 3)
	})
	it('dynamic items with ration and min size', () => {
		const size = new DistributedSize().setItems([
			new DistributedItem({ type: 'dynamic', ratio: 60, minSize: 30 }),
			new DistributedItem({ type: 'dynamic', ratio: 30, minSize: 30 }),
			new DistributedItem({ type: 'dynamic', ratio: 10, minSize: 30 }),
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
})