import { Component } from '@angular/core';
import { ContestTiers } from '../../../shared/contest-tiers/contest-tiers';
import { EntryForm } from '../../../shared/entry-form/entry-form';

@Component({
  selector: 'app-professional',
  imports: [ContestTiers, EntryForm],
  templateUrl: './professional.html',
  styleUrl: './professional.scss',
})
export class Professional {}
