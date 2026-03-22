import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule, NavbarComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {

  form: FormGroup;
  robotChecked = false;
  submitting = false;
  submitSuccess = false;
  submitError = false;

  constructor(private fb: FormBuilder, private contactService: ContactService) {
    this.form = this.fb.group({
      firstName:    ['', Validators.required],
      lastName:     ['', Validators.required],
      email:        ['', [Validators.required, Validators.email]],
      confirmEmail: ['', [Validators.required, Validators.email]],
      message:      ['']
    }, { validators: this.emailsMatch });
  }

  private emailsMatch(group: AbstractControl) {
    const email        = group.get('email')?.value;
    const confirmEmail = group.get('confirmEmail')?.value;
    return email === confirmEmail ? null : { emailMismatch: true };
  }

  get canSubmit(): boolean {
    return this.form.valid && this.robotChecked && !this.submitting;
  }

  onSubmit(): void {
    if (!this.canSubmit) return;

    this.submitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    const { firstName, lastName, email, message } = this.form.value;

    this.contactService.submit({ firstName, lastName, email, message }).subscribe({
      next: () => {
        this.submitSuccess = true;
        this.submitting = false;
        this.form.reset();
        this.robotChecked = false;
      },
      error: () => {
        this.submitError = true;
        this.submitting = false;
      }
    });
  }
}
