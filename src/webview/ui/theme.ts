type Theme = 'light' | 'dark' | 'auto';

export class ThemeManager {
  private currentTheme: Theme = 'auto';
  private vscode: any;

  constructor(vscode: any) {
    this.vscode = vscode;
  }

  initialize(preference: Theme): void {
    this.currentTheme = preference || 'auto';
    this.apply();
  }

  toggle(): void {
    if (this.currentTheme === 'auto') {
      const isDark = this.detectVsCodeTheme() === 'dark';
      this.currentTheme = isDark ? 'light' : 'dark';
    } else {
      this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    }
    this.apply();
    this.persist();
  }

  getEffective(): 'light' | 'dark' {
    return this.currentTheme === 'auto' ? this.detectVsCodeTheme() : this.currentTheme;
  }

  private apply(): void {
    const effective = this.getEffective();
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(effective);
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: effective }));
  }

  private detectVsCodeTheme(): 'light' | 'dark' {
    return document.body.classList.contains('vscode-light') ? 'light' : 'dark';
  }

  private persist(): void {
    this.vscode.postMessage({ type: 'settingChanged', key: 'theme', value: this.currentTheme });
  }
}
