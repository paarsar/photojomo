import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { environment } from '../../../environments/environment';

interface HeroSlide {
  src: string;
  objectPosition?: string;
  filter?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit, OnDestroy {
  firstWaveUrl = environment.firstWaveUrl;

  heroSlides: HeroSlide[] = [
    {
      src: 'assets/images/beach_image.jpg',
      objectPosition: '72% center',
      filter: 'url(#hero-sharpen) saturate(1.34) contrast(1.1) brightness(1.06) hue-rotate(-2deg)'
    },
    { src: 'assets/images/BG4.jpg' },
    { src: 'assets/images/iStock-1316997695.jpg' },
    { src: 'assets/images/iStock-1232115076.jpg' }
  ];

  currentIndex = 0;
  private autoPlayTimer: any;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  get currentSlide(): HeroSlide {
    return this.heroSlides[this.currentIndex];
  }

  get currentImage(): string {
    return this.currentSlide.src;
  }

  get currentObjectPosition(): string | null {
    return this.currentSlide.objectPosition ?? null;
  }

  get currentFilter(): string {
    return this.currentSlide.filter ?? 'saturate(1.34) contrast(1.1) brightness(1.06) hue-rotate(-2deg)';
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.heroSlides.length) % this.heroSlides.length;
    this.resetAutoPlay();
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.heroSlides.length;
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
