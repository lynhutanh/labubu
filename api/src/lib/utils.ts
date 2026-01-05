import { Logger } from "@nestjs/common";

const logger = new Logger("AppLogger");

export async function logError(nameFunction: string, e: any) {
  const error = await e;
  logger.error("Error", nameFunction, error);
}

export async function logData(message?: any, ...optionalParams: any[]) {
  logger.log(message, ...optionalParams);
}

export async function logWarn(message?: any, ...optionalParams: any[]) {
  logger.warn(message, ...optionalParams);
}
