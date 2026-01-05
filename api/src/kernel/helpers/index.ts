import * as StringHelper from "./string.helper";
import * as ViewHelper from "./view.helper";
import * as MulterHelper from "./multer.helper";

export { StringHelper, ViewHelper, MulterHelper };

export function getOffset(page: number = 1, limit: number = 10): number {
  return (page - 1) * limit;
}
