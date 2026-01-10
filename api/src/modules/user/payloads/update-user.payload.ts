import { ApiProperty } from "@nestjs/swagger";
import {
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
  IsEnum,
} from "class-validator";
import { Transform } from "class-transformer";
import { ROLE } from "../constants";
import { STATUS } from "src/kernel/constants";

export class UpdateUserPayload {
  @ApiProperty({ description: "User name", required: false })
  @IsOptional()
  @IsString({ message: "Tên phải là chuỗi" })
  @MaxLength(100, { message: "Tên không được quá 100 ký tự" })
  @Transform(({ value }) => value?.trim())
  name?: string;

  @ApiProperty({ description: "Email", required: false })
  @IsOptional()
  @IsEmail({}, { message: "Email không hợp lệ" })
  @Transform(({ value }) => value?.trim().toLowerCase())
  email?: string;

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

  @ApiProperty({ description: "Avatar path", required: false })
  @IsOptional()
  @IsString({ message: "Avatar path phải là chuỗi" })
  avatarPath?: string;

  @ApiProperty({ description: "Avatar ID", required: false })
  @IsOptional()
  @IsString({ message: "Avatar ID phải là chuỗi" })
  avatarId?: string;

  @ApiProperty({ description: "Date of birth", required: false })
  @IsOptional()
  @IsString({ message: "Ngày sinh phải là chuỗi" })
  dateOfBirth?: string;

  @ApiProperty({
    description: "User role",
    enum: [ROLE.USER, ROLE.ADMIN],
    required: false,
  })
  @IsOptional()
  @IsEnum([ROLE.USER, ROLE.ADMIN], {
    message: `Role phải là ${ROLE.USER} hoặc ${ROLE.ADMIN}`,
  })
  role?: string;

  @ApiProperty({
    description: "User status",
    enum: [STATUS.ACTIVE, STATUS.INACTIVE],
    required: false,
  })
  @IsOptional()
  @IsEnum([STATUS.ACTIVE, STATUS.INACTIVE], {
    message: `Status phải là ${STATUS.ACTIVE} hoặc ${STATUS.INACTIVE}`,
  })
  status?: string;
}
