import { uniqBy } from "lodash";
import { ObjectId } from "mongodb";

export const checkLengthTrimString = (str: string) => {
  if (!str) return null;
  if (str?.length && str?.trim()) {
    return str.trim();
  }
  return null;
};

export const getPersonName = (member: any) => {
  if (!member) return "N/A";
  const memberName =
    checkLengthTrimString(member.name) ||
    checkLengthTrimString(member.username) ||
    "N/A";
  return memberName;
};

export const uniqByObjectId = (ids: ObjectId[]) =>
  uniqBy(ids.filter(Boolean), (id) => id.toString());
