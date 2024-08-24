import { DistributedItem } from "./distributed.size"


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
})
describe('calculate size', () => {
})