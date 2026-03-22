import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-global-tour',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './global-tour.component.html',
  styleUrls: ['./global-tour.component.css'],
})
export class GlobalTourComponent {}
