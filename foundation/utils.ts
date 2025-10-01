import { Insert, Remove } from "@openscd/oscd-api";
/** User selection of a data structure
 * @example
 * user selects data object `Beh` to be enum `on` and `test`
 * ```ts
 * {
 *   Beh: {
 *      stVal: {on: {}, test: {}}
 *      q: {}
 *      t: {}
 *   }
 * }
 * ```
 */
export type TreeSelection = {
  [name: string]: TreeSelection;
};

/** Intent to set or remove (if null) attributes on element */
export type Update = {
  element: Element;
  attributes: Partial<Record<string, string | null>>;
};

/** Represents the user's intent to change an XMLDocument */
export type Edit = Insert | Update | Remove | Edit[];

export function isUpdate(edit: Edit): edit is Update {
  return (edit as Update).element !== undefined;
}


/** Utility function to create element with `tagName` and its`attributes` */
export function createElement(
  doc: XMLDocument,
  tag: string,
  attrs: Record<string, string | null | undefined>,
): Element {
  const element = doc.createElementNS(doc.documentElement.namespaceURI, tag);
  Object.entries(attrs)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, value]) => typeof value === "string")
    .forEach(([name, value]) => element.setAttribute(name, value!));

  return element;
}

/** @returns the cartesian product of `arrays` */
export function crossProduct<T>(...arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (a, b) => <T[][]>a.flatMap((d) => b.map((e) => [d, e].flat())),
    [[]],
  );
}
