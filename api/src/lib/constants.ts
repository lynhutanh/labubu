export const SORT_BY = {
  UPDATED_AT: "updatedAt",
  CREATED_AT: "createdAt",
};

export const SORT = {
  ASCENDING: "asc",
  DESCENDING: "desc",
};

type PromiseSettledResult<T> =
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: any };

export function mapSettledValues<T>(
  results: PromiseSettledResult<T>[],
): (T | null)[] {
  return results.map((r) => (r && r.status === "fulfilled" ? r.value : null));
}
