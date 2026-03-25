import { Component, HostListener, Input, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: { style: 'display: contents' },
})
export class NavbarComponent {
  @Input() wrapperClass = 'css-fbgm56 css-8hhw9a css-roiesn';
  dropdownOpen = false;
  menuOpen = false;
  scrolled = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 20;
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
    this.dropdownOpen = false;
  }

  closeMenu(): void {
    this.menuOpen = false;
    this.dropdownOpen = false;
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.dropdownOpen = false;
    this.menuOpen = false;
  }
}
