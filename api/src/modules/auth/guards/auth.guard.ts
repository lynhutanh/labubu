import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { STATUS } from "src/kernel/constants";
import { AuthService } from "../services";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let token =
      request.headers.authorization ||
      request.headers.Authorization ||
      request.query.Authorization;

    // Strip "Bearer " prefix if present
    if (token && typeof token === "string" && token.startsWith("Bearer ")) {
      token = token.substring(7);
    }

    if (!token || token === "null" || token === "undefined") return false;

    const session = await this.authService.verifySession(token);
    if (!session) {
      return false;
    }

    const user =
      request.user || (await this.authService.getSourceFromSession(token));
    if (!user || user.status !== STATUS.ACTIVE) {
      return false;
    }

    if (!request.user) request.user = user;
    request.authUser = request.authUser || session;
    request.authSession = session;
    if (!request.jwToken) request.jwToken = token;
    return true;
  }
}
