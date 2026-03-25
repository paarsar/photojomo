import { Component } from '@angular/core';
import { ContestTiers } from '../../../shared/contest-tiers/contest-tiers';
import { EntryForm } from '../../../shared/entry-form/entry-form';

@Component({
  selector: 'app-general',
  imports: [ContestTiers, EntryForm],
  templateUrl: './general.html',
  styleUrl: './general.scss',
})
export class General {}
