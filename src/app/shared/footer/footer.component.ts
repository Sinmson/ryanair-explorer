import { Component } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  imports: [TranslocoPipe],
})
export class FooterComponent {
  protected readonly currentYear = new Date().getFullYear();
}
