import { HttpStatus } from "@nestjs/common";
import { RuntimeException } from "src/kernel/exceptions/runtime.exception";

export class PasswordIncorrectException extends RuntimeException {
  constructor(
    msg: string | object = "Password is incorrect, please try again",
    error = "PASSWORD_INCORRECT",
  ) {
    super(msg, error, HttpStatus.BAD_REQUEST);
  }
}
