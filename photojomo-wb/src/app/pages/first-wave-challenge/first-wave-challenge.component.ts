import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-first-wave-challenge',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './first-wave-challenge.component.html',
  styleUrls: ['./first-wave-challenge.component.css'],
})
export class FirstWaveChallengeComponent {
  enterContest() {
    window.location.href = '/contest';
  }
}
