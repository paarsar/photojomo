import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { SiteFooterComponent } from './components/site-footer/site-footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SiteFooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  readonly showMobileFooter$;

  constructor(router: Router) {
    this.showMobileFooter$ = router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => !router.url.startsWith('/caribbean-connections')),
    );

    router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
      .subscribe((event) => {
        const currentUrl = router.url;
        if (event.url.startsWith('/info/') && !currentUrl.startsWith('/info/')) {
          try {
            sessionStorage.setItem(
              'legalModalReturnState',
              JSON.stringify({
                returnUrl: currentUrl,
                returnScrollY: typeof window !== 'undefined' ? window.scrollY : 0,
              }),
            );
          } catch {}
        }
      });
  }
}
