import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect, input } from '@angular/core';
import { AuthState } from '../../core/auth/auth.state';
import { UserRole } from '../../models/user.model';

@Directive({ selector: '[appRole]', standalone: true })
export class RoleDirective {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authState = inject(AuthState);
  private hasView = false;

  appRole = input.required<UserRole | UserRole[]>();

  constructor() {
    effect(() => {
      const roles = this.appRole();
      const user = this.authState.user();
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      const hasRole = user ? allowedRoles.includes(user.role) : false;

      if (hasRole && !this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!hasRole && this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    });
  }
}
