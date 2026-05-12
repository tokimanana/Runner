import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-hotels',
  imports: [RouterOutlet],
  templateUrl: './hotels.component.html',
  styleUrl: './hotels.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelsComponent {}
