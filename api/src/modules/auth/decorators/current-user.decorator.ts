import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user =
      req.user ||
      (req.args && req.args[0] && req.args[0].user) ||
      (req.args && req.args[0] && req.args[0].authUser);
    return user;
  },
);
