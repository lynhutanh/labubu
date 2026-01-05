import { IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";

export class ZaloPayCallbackPayload {
  @IsString()
  @IsNotEmpty()
  data: string;

  @IsString()
  @IsNotEmpty()
  mac: string;

  @IsOptional()
  @IsNumber()
  type?: number;
}

export class ZaloPayDirectCallbackPayload {
  @IsString()
  @IsNotEmpty()
  appid: string;

  @IsString()
  @IsNotEmpty()
  apptransid: string;

  @IsString()
  @IsNotEmpty()
  pmcid: string;

  @IsString()
  @IsNotEmpty()
  bankcode: string;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsOptional()
  @IsString()
  discountamount?: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  checksum: string;
}
