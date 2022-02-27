import { Component, OnInit, OnDestroy, Inject } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { AuthService } from '@cswp/auth'
import { Router } from '@angular/router'
import { Subscription } from 'rxjs'
import { IUser } from '@cswp/api-interfaces'

@Component({
  selector: 'cswp-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup
  subs!: Subscription
  submitted = false

  constructor(
    @Inject({ apiUrl: 'Injected in login.component.ts' })
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(3)
      ])
    })

    this.subs = this.authService
      .getUserFromLocalStorage()
      .subscribe((user: IUser | undefined) => {
        if (user) {
          console.log('User already logged in > to dashboard')
          this.router.navigate(['/'])
        }
      })
  }

  ngOnDestroy(): void {
    if (this.subs) {
      this.subs.unsubscribe()
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.submitted = true
      const email = this.loginForm.value.email
      const password = this.loginForm.value.password
      this.authService.login(email, password).subscribe((user) => {
        if (user) {
          console.log('Logged in')
          this.router.navigate(['/'])
        }
        this.submitted = false
      })
    } else {
      this.submitted = false
      console.error('loginForm invalid')
    }
  }
}