import * as mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { posix, sep } from "path";

export const getExt = (path: string) => {
  const i = path.lastIndexOf(".");
  return i < 0 ? "" : path.substr(i);
};

export const isEmail = (text: string) => {
  const re = /\S+@\S+\.\S+/;
  return re.test(text);
};

export const generateUuid = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const getFileName = (fullPath: string, removeExtension: boolean) => {
  const name = fullPath.replace(/^.*[\\\/]/, "");
  return removeExtension ? name.replace(/\.[^/.]+$/, "") : name;
};

export const getFilePath = (fullPath: string) =>
  fullPath.substring(
    0,
    fullPath.lastIndexOf(fullPath.includes("\\") ? "\\" : "/"),
  );

export const randomString = (len: number, charSetInput?: string) => {
  const charSet =
    charSetInput ||
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomStr = "";
  for (let i = 0; i < len; i += 1) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    randomStr += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomStr;
};

export const isUrl = (str: string) => {
  const regex =
    /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  return regex.test(str);
};

export const replaceSpecialChars = (str: string, char = "_") => {
  if (!str || typeof str !== "string") {
    return "";
  }
  return str.replace(/[^a-zA-Z0-9 ]/g, char);
};

export const createAlias = (str: string) => {
  if (!str || typeof str !== "string") {
    return "";
  }
  return str.toLowerCase().replace(/[&\/\\#,+()$~%.'":*?<>{}\s]/g, "-");
};

export const truncate = (str: string, length = 100) =>
  str.length > length ? `${str.substring(0, length - 3)}...` : str;

export const stripTags = (input: string, allowed?: string) => {
  if (!input || typeof input !== "string") {
    return "";
  }

  const allowedTmp = (
    `${allowed || ""}`.toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []
  ).join("");
  const tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  const commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input
    .replace(commentsAndPhpTags, "")
    .replace(tags, ($0, $1) =>
      allowedTmp.indexOf(`<${$1.toLowerCase()}>`) > -1 ? $0 : "",
    );
};

export const removeScriptTag = (input: string) => {
  if (!input || typeof input !== "string") {
    return "";
  }
  return input.replace(/<script[^>]*>.*?<\/script>/gi, "");
};

export const isObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

export const toObjectId = (id: string | ObjectId) =>
  new mongoose.Types.ObjectId(id as any);

export const toPosixPath = (str: string) => {
  if (!str) return "";
  return str.split(sep).join(posix.sep);
};
