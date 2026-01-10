import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
  MinLength,
  IsEnum,
} from "class-validator";
import { Transform } from "class-transformer";
import { ROLE } from "../constants";
import { STATUS } from "src/kernel/constants";

export class CreateUserPayload {
  @ApiProperty({ description: "User name", example: "Nguyễn Văn A" })
  @IsOptional()
  @IsString({ message: "Tên phải là chuỗi" })
  @MaxLength(100, { message: "Tên không được quá 100 ký tự" })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({ description: "Email", example: "user@example.com" })
  @IsNotEmpty({ message: "Email là bắt buộc" })
  @IsEmail({}, { message: "Email không hợp lệ" })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;

  @ApiProperty({ description: "Username", example: "username" })
  @IsNotEmpty({ message: "Username là bắt buộc" })
  @IsString({ message: "Username phải là chuỗi" })
  @MinLength(3, { message: "Username phải có ít nhất 3 ký tự" })
  @MaxLength(50, { message: "Username không được quá 50 ký tự" })
  @Transform(({ value }) => value?.trim().toLowerCase())
  username: string;

  @ApiProperty({ description: "Password", example: "password123", required: false })
  @IsOptional()
  @IsString({ message: "Mật khẩu phải là chuỗi" })
  @MinLength(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" })
  password?: string;

  @ApiProperty({ description: "Phone number", required: false })
  @IsOptional()
  @IsString({ message: "Số điện thoại phải là chuỗi" })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @ApiProperty({
    description: "Gender",
    enum: ["male", "female", "other"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["male", "female", "other"], {
    message: "Giới tính phải là male, female hoặc other",
  })
  gender?: string;

  @ApiProperty({ description: "Address", required: false })
  @IsOptional()
  @IsString({ message: "Địa chỉ phải là chuỗi" })
  @MaxLength(500, { message: "Địa chỉ không được quá 500 ký tự" })
  @Transform(({ value }) => value?.trim())
  address?: string;

  @ApiProperty({
    description: "User role",
    enum: [ROLE.USER, ROLE.ADMIN],
    default: ROLE.USER,
  })
  @IsOptional()
  @IsEnum([ROLE.USER, ROLE.ADMIN], {
    message: `Role phải là ${ROLE.USER} hoặc ${ROLE.ADMIN}`,
  })
  role?: string = ROLE.USER;

  @ApiProperty({
    description: "User status",
    enum: [STATUS.ACTIVE, STATUS.INACTIVE],
    default: STATUS.ACTIVE,
  })
  @IsOptional()
  @IsEnum([STATUS.ACTIVE, STATUS.INACTIVE], {
    message: `Status phải là ${STATUS.ACTIVE} hoặc ${STATUS.INACTIVE}`,
  })
  status?: string = STATUS.ACTIVE;
}
