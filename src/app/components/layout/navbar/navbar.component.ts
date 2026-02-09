import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyService } from '../../../services/currency.service';
import { AuthService } from '../../../services/auth.service';

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
    public authService: AuthService
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

  changeCurrency(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currencyService.setCurrency(select.value);
  }

  logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}
