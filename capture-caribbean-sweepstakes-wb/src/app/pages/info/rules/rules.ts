import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rules',
  imports: [RouterLink],
  template: `
    <div style="max-width:800px;margin:4rem auto;padding:0 2rem;font-family:'Sora',sans-serif;">
      <h1 style="margin-bottom:1.5rem;">Sweepstakes Official Rules</h1>
      <p><a routerLink="/" style="color:#df5e26;">← Back to Sweepstakes</a></p>
      <p style="margin-top:2rem;color:#505050;">Official rules content coming soon.</p>
    </div>
  `,
})
export class Rules {}
