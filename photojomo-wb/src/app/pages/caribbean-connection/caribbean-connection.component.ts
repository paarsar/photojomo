import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-caribbean-connection',
  standalone: true,
  imports: [RouterLink, NavbarComponent],
  templateUrl: './caribbean-connection.component.html',
  styleUrls: ['./caribbean-connection.component.css'],
})
export class CaribbeanConnectionComponent {
  readonly testimonials = [
    {
      avatar:
        'https://capturecaribbean.figma.site/_assets/v11/c750c0042ff0d38ae0247c453ad5a8117c0263ec.png',
      quote:
        '\u201CFinally, a space that celebrates our unique Caribbean perspective and connects us across islands.\u201D',
      name: 'Harry Maguire',
      role: 'Visual Artist, Trinidad',
    },
    {
      avatar:
        'https://capturecaribbean.figma.site/_assets/v11/c750c0042ff0d38ae0247c453ad5a8117c0263ec.png',
      quote:
        '\u201CPhotojomo gave me a platform to share my island\u2019s story with a global audience.\u201D',
      name: 'Amara Clarke',
      role: 'Photographer, Jamaica',
    },
    {
      avatar:
        'https://capturecaribbean.figma.site/_assets/v11/c750c0042ff0d38ae0247c453ad5a8117c0263ec.png',
      quote:
        '\u201CThis community lifted my work and introduced me to collaborators across the region.\u201D',
      name: 'Devon Alleyne',
      role: 'Filmmaker, Barbados',
    },
  ];

  currentSlide = 0;
  slideState: 'idle' | 'exit-next' | 'exit-prev' | 'enter-next' | 'enter-prev' = 'idle';
  private transitioning = false;
  private readonly fadeDurationMs = 600;

  get current() {
    return this.testimonials[this.currentSlide];
  }

  prev(event?: Event): void {
    event?.stopPropagation();
    this.go(-1);
  }

  next(event?: Event): void {
    event?.stopPropagation();
    this.go(1);
  }

  private go(delta: number): void {
    if (this.transitioning) return;
    this.transitioning = true;
    const dir = delta > 0 ? 'next' : 'prev';
    this.slideState = `exit-${dir}`;
    setTimeout(() => {
      this.currentSlide =
        (this.currentSlide + delta + this.testimonials.length) % this.testimonials.length;
      this.slideState = `enter-${dir}`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.slideState = 'idle';
          setTimeout(() => {
            this.transitioning = false;
          }, this.fadeDurationMs);
        });
      });
    }, this.fadeDurationMs);
  }
}
