import { Component } from '@angular/core';
import { ContestTiers } from '../../../shared/contest-tiers/contest-tiers';
import { EntryForm } from '../../../shared/entry-form/entry-form';

@Component({
  selector: 'app-emerging-creator',
  imports: [ContestTiers, EntryForm],
  templateUrl: './emerging-creator.html',
  styleUrl: './emerging-creator.scss',
})
export class EmergingCreator {}
