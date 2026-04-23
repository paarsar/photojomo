import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './site-footer.component.html',
  styleUrls: ['./site-footer.component.css'],
})
export class SiteFooterComponent {
  private readonly router = inject(Router);

  legalModalState() {
    return {
      returnUrl: this.router.url,
      returnScrollY: typeof window !== 'undefined' ? window.scrollY : 0,
    };
  }
}
