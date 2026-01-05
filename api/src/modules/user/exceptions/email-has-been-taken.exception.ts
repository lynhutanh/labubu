import { HttpStatus } from "@nestjs/common";
import { RuntimeException } from "src/kernel/exceptions/runtime.exception";

export class EmailHasBeenTakenException extends RuntimeException {
  constructor(
    msg:
      | string
      | object = "This email has been taken, please choose another one",
    error = "EMAIL_HAS_BEEN_TAKEN",
  ) {
    super(msg, error, HttpStatus.BAD_REQUEST);
  }
}
