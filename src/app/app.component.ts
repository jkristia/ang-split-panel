import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplitContainer, SplitContainerModule } from '../split-panel/split-container';
import { CommonModule } from '@angular/common';
import { SplitValues } from '../split-panel/distributed.size';

interface SplitValuesMap {
	[key: string]: SplitValues;
}

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [
		CommonModule,
		RouterOutlet,
		SplitContainerModule
	],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
	title = 'ang-split-panel';
	private _valueKey = 'split-value'

	private _splitValues: SplitValuesMap = {}
	@ViewChild('split1') split1?: SplitContainer;
	@ViewChild('split2') split2?: SplitContainer;

	ngAfterViewInit(): void {
		const dataJson = localStorage.getItem(this._valueKey);
		if (dataJson) {
			this._splitValues = JSON.parse(dataJson) as SplitValuesMap;
			const split = this._splitValues;
			console.log(split)
			if (this.split1 && split['split1']) {
				this.split1.setSavedSize(split['split1']);
			}
			if (this.split2 && split['split2']) {
				this.split2.setSavedSize(split['split2']);
			}
		}
	}

	onDragEnd(id: string, data: SplitValues) {
		this._splitValues[id] = data
		localStorage.setItem(this._valueKey, JSON.stringify(this._splitValues, null, ' '));
	}
}
