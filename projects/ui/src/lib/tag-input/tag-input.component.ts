import { Component, input, output } from '@angular/core';

export interface Tag {
  id: string;
  label: string;
}

@Component({
  selector: 'ui-tag-input',
  templateUrl: './tag-input.component.html',
  styleUrl: './tag-input.component.scss',
})
export class TagInputComponent {
  readonly tags = input.required<Tag[]>();
  readonly removable = input<boolean>(true);

  readonly removed = output<Tag>();
}
