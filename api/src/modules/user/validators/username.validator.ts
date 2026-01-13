import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ name: "username", async: false })
export class Username implements ValidatorConstraintInterface {
  validate(text: string): boolean {
    if (!text) return false;
    return /^[a-zA-Z0-9_]+$/.test(text);
  }

  defaultMessage(): string {
    return "Username can only contain letters, numbers, and underscores";
  }
}
