## Angular Split panel 

An angular split panel component hwich supports a mix of fixed and dynamic panels.  
- fixed panel maintains its size when the window is resized.
- dynamic panel adjust it size according to the ratio setting to other dynamic panels.

Example of panel split. Work in progress

```html

<split-container>

	<split-panel [options]="{ size: 200, minSize: 100, canDrag: true }">
		<div class="panel border-right">Panel #1</div>
	</split-panel>

	<split-panel [options]="{ ratio: 2, minSize: 200, canDrag: true }">
		<div class="column border-right">
			<split-container [options]="{ direction: 'horizontal' }">
				<split-panel [options]="{ size: 200, minSize: 100, canDrag: true }">
					<div class="panel border-bottom">Panel #2</div>
				</split-panel>
				<split-panel [options]="{ ratio: 1, minSize: 50}">
					<div class="panel border-bottom">Panel #3</div>
				</split-panel>
				<split-panel [options]="{ size: 200, canDrag: true }">
					<div class="panel">Panel #4</div>
				</split-panel>
			</split-container>
		</div>
	</split-panel>

	<split-panel [options]="{ size: 200, canDrag: true }">
		<div class="panel">Panel #5</div>
	</split-panel>

</split-container>

```
![image](split-panel.png)
