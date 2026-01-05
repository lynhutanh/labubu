import { IsString, IsOptional, IsInt } from "class-validator";
import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";

export class SearchRequest {
  @ApiProperty()
  @IsOptional()
  @IsString()
  q = "";

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Transform(({ value }) => {
    if (!value) return 10;
    if (value > 1000) return 1000;
    return value;
  })
  limit: number = 10;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Transform(({ value }) => {
    if (!value || value < 0) return 0;
    return value;
  })
  offset: number = 0;

  @ApiProperty()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Transform(({ value }) => {
    if (!value || value < 1) return undefined;
    return value;
  })
  page?: number;

  @ApiProperty()
  @Optional()
  @IsString()
  sortBy = "updatedAt";

  @ApiProperty()
  @Optional()
  @IsString()
  @Transform(({ value }) => {
    if (value !== "asc") return "desc";
    return "asc";
  })
  sort = "desc";
}
