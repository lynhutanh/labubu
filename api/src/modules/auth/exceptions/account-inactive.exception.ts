import { HttpStatus } from "@nestjs/common";
import { RuntimeException } from "src/kernel/exceptions/runtime.exception";

export class AccountInactiveException extends RuntimeException {
  constructor(
    msg: string | object = "This account is de-activated",
    error = "ACCOUNT_INACTIVE",
  ) {
    super(msg, error, HttpStatus.FORBIDDEN);
  }
}
