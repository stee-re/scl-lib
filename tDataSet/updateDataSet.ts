import { SetAttributes } from "@openscd/oscd-api";

import { updatedConfRev } from "../tControl/updateConfRev.js";
import { controlBlocks } from "../tControl/controlBlocks.js";

/** Utility function to update `DataSet` element and the `datSet` attribute of
 * all referenced control blocks
 * @param setAttributes - SetAttributes edit for the `DataSet` element
 * @returns SetAttributes actions for `DataSet`s attributes and its `datSet` references
 * */
export function updateDataSet(setAttributes: SetAttributes): SetAttributes[] {
  if (setAttributes.element.tagName !== "DataSet") return [];

  const dataSet = setAttributes.element;

  const parent = dataSet.parentElement as Element;
  if (!parent) return [];

  const dataSetUpdate = {
    element: dataSet,
    attributes: setAttributes.attributes,
  } as SetAttributes;

  const newName = setAttributes?.attributes?.name;
  if (!newName) return [dataSetUpdate];

  const controlBlockUpdates = controlBlocks(dataSet).map((element) => ({
    element,
    attributes: { datSet: newName, confRev: updatedConfRev(element) },
  })) as SetAttributes[];

  return [dataSetUpdate].concat(controlBlockUpdates);
}
