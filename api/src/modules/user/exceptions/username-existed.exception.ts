import { HttpStatus } from "@nestjs/common";
import { RuntimeException } from "src/kernel/exceptions/runtime.exception";

export class UsernameExistedException extends RuntimeException {
  constructor(
    msg:
      | string
      | object = "This username has been taken, please choose another one",
    error = "USERNAME_EXISTED",
  ) {
    super(msg, error, HttpStatus.BAD_REQUEST);
  }
}
