import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';

interface ContestInfo {
  title: string;
}

const CONTESTS: Record<string, ContestInfo> = {
  'general':           { title: 'General Contest' },
  'emerging-creator':  { title: 'Emerging Creator Contest' },
  'college-creator':   { title: 'College Creator Contest' },
  'master-your-craft': { title: 'Master Your Craft Contest' },
};

@Component({
  selector: 'app-contest-entry',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent],
  templateUrl: './contest-entry.component.html',
  styleUrls: ['./contest-entry.component.css'],
})
export class ContestEntryComponent implements OnInit {
  contest: ContestInfo = CONTESTS['general'];
  contestId = 'general';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.contestId = this.route.snapshot.paramMap.get('id') ?? 'general';
    this.contest   = CONTESTS[this.contestId] ?? CONTESTS['general'];
  }
}
