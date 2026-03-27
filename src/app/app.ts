import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DocumentLangService } from './core/i18n/document-lang.service';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header />
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
})
export class AppComponent {
  private readonly _documentLang = inject(DocumentLangService);
}
