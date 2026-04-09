import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-residency',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './residency.component.html',
  styleUrls: ['./residency.component.css'],
})
export class ResidencyComponent {
  enterContest() {
    window.location.href = '/contest';
  }
}
