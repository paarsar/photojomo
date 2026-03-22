import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-contest',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './contest.component.html',
  styleUrls: ['./contest.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ContestComponent {}
