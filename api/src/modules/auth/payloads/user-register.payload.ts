import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Validate,
  MinLength,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Username } from "src/modules/user/validators/username.validator";

export class UserRegisterPayload {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @Validate(Username)
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gender: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;
}
