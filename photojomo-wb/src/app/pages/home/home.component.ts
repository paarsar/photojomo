import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';

const BASE = 'https://capturecaribbean.figma.site/_assets/v11';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit, OnDestroy {

  heroImages = [
    `${BASE}/5162c9366bc452fc11600eed14119d07029a44c5.png`,
    `${BASE}/a2590f7f77d750fd96de6f089f30c3571606f94e.png`,
    `${BASE}/245f38c25cab0ccfdfe98428cc23b15fd41e6472.png`
  ];

  currentIndex = 0;
  private autoPlayTimer: any;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();   
  }

  get currentImage(): string {
    return this.heroImages[this.currentIndex];
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.heroImages.length) % this.heroImages.length;
    this.resetAutoPlay();
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.heroImages.length;
    this.resetAutoPlay();
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.resetAutoPlay();
  }

  private startAutoPlay(): void {
    this.autoPlayTimer = setInterval(() => this.next(), 20000);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
  }

  private resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}
