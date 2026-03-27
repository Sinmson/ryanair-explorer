import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to light mode when no preference is stored', () => {
    expect(service.darkMode()).toBe(false);
  });

  it('should toggle dark mode', () => {
    expect(service.darkMode()).toBe(false);
    service.toggle();
    expect(service.darkMode()).toBe(true);
    service.toggle();
    expect(service.darkMode()).toBe(false);
  });
});
