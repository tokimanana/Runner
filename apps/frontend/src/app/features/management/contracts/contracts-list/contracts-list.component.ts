import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contracts-list',
  imports: [],
  templateUrl: './contracts-list.component.html',
  styleUrl: './contracts-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractsListComponent {}
