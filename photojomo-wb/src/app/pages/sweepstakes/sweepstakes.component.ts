import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

interface SweepstakesRequest {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  phoneNumber: string;
  address: string;
  city: string;
  stateProvince: string;
  zipPostalCode: string;
  countryOfResidence: string;
  contentType: string;
  agreedToRules: boolean;
}

interface SweepstakesResponse {
  id: string;
  message: string;
  success: boolean;
}

@Component({
  selector: 'app-sweepstakes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sweepstakes.component.html',
  styleUrls: ['./sweepstakes.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SweepstakesComponent {
  // Form fields
  firstName = '';
  lastName = '';
  email = '';
  confirmEmail = '';
  phoneNumber = '';
  address = '';
  city = '';
  stateProvince = '';
  zipPostalCode = '';
  countryOfResidence = '';
  contentType = '';
  agreedToRules = false;

  // State
  submitting = false;
  submitted = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  get formValid(): boolean {
    return (
      this.firstName.trim() !== '' &&
      this.lastName.trim() !== '' &&
      this.email.trim() !== '' &&
      this.email === this.confirmEmail &&
      this.phoneNumber.trim() !== '' &&
      this.address.trim() !== '' &&
      this.city.trim() !== '' &&
      this.stateProvince.trim() !== '' &&
      this.zipPostalCode.trim() !== '' &&
      this.countryOfResidence.trim() !== '' &&
      this.agreedToRules
    );
  }

  async onSubmit(): Promise<void> {
    if (!this.formValid || this.submitting) return;

    this.submitting = true;
    this.errorMessage = '';

    const payload: SweepstakesRequest = {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      email: this.email.trim(),
      confirmEmail: this.confirmEmail.trim(),
      phoneNumber: this.phoneNumber.trim(),
      address: this.address.trim(),
      city: this.city.trim(),
      stateProvince: this.stateProvince.trim(),
      zipPostalCode: this.zipPostalCode.trim(),
      countryOfResidence: this.countryOfResidence.trim(),
      contentType: this.contentType.trim(),
      agreedToRules: this.agreedToRules,
    };

    try {
      await firstValueFrom(
        this.http.post<SweepstakesResponse>(
          `${environment.apiBaseUrl}/sweepstakes`,
          payload
        )
      );
      this.submitted = true;
    } catch (err) {
      this.errorMessage = 'Something went wrong. Please try again.';
    } finally {
      this.submitting = false;
    }
  }
}
