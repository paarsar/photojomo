import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-saint-lucia',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './saint-lucia.component.html',
  styleUrls: ['./saint-lucia.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SaintLuciaComponent {}
