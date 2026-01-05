import { render as MustacheRender } from "mustache";
import { join } from "path";
import { readFileSync, existsSync } from "fs";

const VIEW_DIR = join(__dirname, "..", "..", "..", "views");

export const renderFile = (view: string, options?: any, cb?: any) => {
  if (typeof options === "function") {
    cb = options;
  }
  if (typeof cb !== "function") {
    cb = function cbFunc() {};
  }

  const viewDir = options.viewDir || VIEW_DIR;
  const file = existsSync(view) ? view : join(viewDir, view);
  const content = readFileSync(file, "utf8");
  cb(null, MustacheRender(content, options));
};
