import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplitContainerModule } from '../split-panel/split-container';
import { CommonModule } from '@angular/common';

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
}
