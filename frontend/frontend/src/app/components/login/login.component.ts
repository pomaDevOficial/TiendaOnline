import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup,Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GlobalService } from '../../shared/services/Global.service';
import { NotificationService } from '../../shared/services/Notification.service';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-login',
    imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  hide = signal(true);

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private authService: AuthService,
    private globalService: GlobalService,
    private notify: NotificationService,) {

  // this.form = this.fb.group({
  //     email: ['', [Validators.required, Validators.email]],
  //     password: ['', [Validators.required, Validators.minLength(6)]]
  //   });
    this.form = this.globalService.fb.group({
      email: ['', GlobalService.required()],
      password: ['', GlobalService.required()],
    });
  }

  ngOnInit(): void {
  }

  

  onLogin() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.authService.login(email, password).subscribe();
    } else {
      this.notify.showWarning('Por favor, complete los campos correctamente');
    }
  }

}
