import { Component } from '@angular/core';
import { ContestTiers } from '../../../shared/contest-tiers/contest-tiers';
import { EntryForm } from '../../../shared/entry-form/entry-form';

@Component({
  selector: 'app-college-creator',
  imports: [ContestTiers, EntryForm],
  templateUrl: './college-creator.html',
  styleUrl: './college-creator.scss',
})
export class CollegeCreator {}
