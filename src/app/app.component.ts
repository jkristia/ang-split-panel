import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplitContainerModule } from '../split-panel/split-container';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SplitContainerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ang-split-panel';
}
