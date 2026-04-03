import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthResponse } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  isLoginMode = true;
  isLoading = false;
  error = '';
  success = '';
  
  loginData = {
    email: '',
    password: ''
  };
  
  registerData = {
    username: '',
    email: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  onSwitchMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
    this.success = '';
  }

  onSubmit(): void {
    this.isLoading = true;
    this.error = '';
    this.success = '';

    if (this.isLoginMode) {
      this.authService.login(this.loginData.email, this.loginData.password).subscribe({
        next: (response: AuthResponse) => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Login failed';
          this.isLoading = false;
        }
      });
    } else {
      this.authService.register(
        this.registerData.username,
        this.registerData.email,
        this.registerData.password
      ).subscribe({
        next: (response: AuthResponse) => {
          this.success = 'Registration successful! Please login with your credentials.';
          this.isLoginMode = true;
          this.registerData = { username: '', email: '', password: '' };
          this.loginData.email = this.registerData.email;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Registration failed';
          this.isLoading = false;
        }
      });
    }
  }
}
