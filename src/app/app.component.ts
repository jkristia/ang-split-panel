import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplitContainerModule } from '../split-panel/split-container';
import { CommonModule } from '@angular/common';
import { SplitValues } from '../split-panel/distributed.size';

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
export class AppComponent {
	title = 'ang-split-panel';

	onDragEnd(id: string, data: SplitValues) {
		console.log('id  : ', id)
		console.log('data: ', JSON.stringify(data, null, ' '))
		
	}
}
