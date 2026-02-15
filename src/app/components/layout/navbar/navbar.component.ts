import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CurrencyService } from '../../../services/currency.service';
import { AuthService } from '../../../services/auth.service';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  currentDate = new Date();

  constructor(
    public currencyService: CurrencyService,
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  get currencies() {
    return this.currencyService.getCurrencies();
  }

  get currentCurrency() {
    return this.currencyService.getCurrentCurrency();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  async changeCurrency(event: Event) {
    const select = event.target as HTMLSelectElement;
    await this.currencyService.setCurrency(select.value);
  }

  async logout() {
    if (confirm('Voulez-vous vraiment vous deconnecter ?')) {
      await this.authService.logout();
      this.router.navigateByUrl('/auth');
    }
  }

  async toggleTheme() {
    await this.themeService.toggleTheme();
  }
}
