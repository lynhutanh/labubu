import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { intersection } from "lodash";
import { STATUS } from "src/kernel/constants";
import { ROLE } from "src/modules/user/constants";
import { AuthService } from "../services";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const role = this.reflector.get<string>("role", context.getHandler());

    if (!role) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    let token =
      request.headers.authorization ||
      request.headers.Authorization ||
      request.query.Authorization;

    // Strip "Bearer " prefix if present
    if (token && typeof token === "string" && token.startsWith("Bearer ")) {
      token = token.substring(7, token.length);
    }

    if (!token || token === "null" || token === "undefined") {
      return false;
    }

    const session = await this.authService.verifySession(token);
    if (!session) {
      return false;
    }

    const user =
      request.user || (await this.authService.getSourceFromSession(token));

    const isAdmin = !!(user?.role && user.role === ROLE.ADMIN);

    if (!user || (!isAdmin && user.status !== STATUS.ACTIVE)) {
      return false;
    }

    if (!request.user) request.user = user;
    request.authUser = request.authUser || session;
    request.authSession = session;
    if (!request.jwToken) request.jwToken = token;

    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const requiredRoles = Array.isArray(role) ? role : [role];
    const diff = intersection(userRoles, requiredRoles);
    return diff.length > 0;
  }
}
