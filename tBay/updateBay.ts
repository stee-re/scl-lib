import { SetAttributes } from "@openscd/oscd-api";

function updateSourceRef(
  element: Element,
  {
    oldSubstation,
    oldVoltageLevel,
    oldBay,
    newBay,
  }: {
    oldSubstation: string;
    oldVoltageLevel: string;
    oldBay: string;
    newBay: string;
  },
): SetAttributes[] {
  const sourceRefs = Array.from(
    element.ownerDocument.querySelectorAll(
      'Private[type="eIEC61850-6-100"]>LNodeInputs>SourceRef',
    ),
  );

  const setAttributes: SetAttributes[] = [];

  sourceRefs.forEach((srcRef) => {
    const source = srcRef.getAttribute("source");
    if (!source) return;

    const oldPath = `${oldSubstation}/${oldVoltageLevel}/${oldBay}`;

    if (!source.startsWith(oldPath)) return;

    const newPath = `${oldSubstation}/${oldVoltageLevel}/${newBay}`;
    setAttributes.push({
      element: srcRef,
      attributes: { source: source.replace(oldPath, newPath) },
    });
  });

  return setAttributes.filter((update) => update) as SetAttributes[];
}

function updateConnectivityNodes(
  element: Element,
  {
    substation,
    voltageLevel,
    bayName,
  }: {
    substation: string;
    voltageLevel: string;
    bayName: string;
  },
): SetAttributes[] {
  const cNodes = Array.from(element.getElementsByTagName("ConnectivityNode"));

  const updates: SetAttributes[] = [];

  cNodes.forEach((cNode) => {
    const cNodeName = cNode.getAttribute("name");
    if (!cNodeName) return;

    const connectivityNode = `${substation}/${voltageLevel}/${bayName}/${cNodeName}`;
    updates.push({
      element: cNode,
      attributes: { pathName: connectivityNode },
    });

    const oldConnectivityNode = cNode.getAttribute("pathName");
    if (!oldConnectivityNode) return;

    updates.push(
      ...updateTerminals(element, {
        oldConnectivityNode,
        connectivityNode,
        bayName,
      }),
    );
  });

  return updates.filter((update) => update) as SetAttributes[];
}

function updateTerminals(
  element: Element,
  {
    oldConnectivityNode,
    connectivityNode,
    bayName,
  }: {
    oldConnectivityNode: string;
    connectivityNode: string;
    bayName: string;
  },
): SetAttributes[] {
  const terminals = Array.from(
    element.closest("Substation")!.querySelectorAll(
      `Terminal[connectivityNode="${oldConnectivityNode}"],
       NeutralPoint[connectivityNode="${oldConnectivityNode}"]`,
    ),
  );

  const setAttributes = terminals.map((terminal) => ({
    element: terminal,
    attributes: {
      connectivityNode,
      bayName,
    },
  }));

  return setAttributes;
}

/** Updates `Bay` attributes and cross-referenced elements
 * @param setAttributes - setAttributes edit on `Bay` attributes
 * @returns Completed update edit array */
export function updateBay(setAttributes: SetAttributes): SetAttributes[] {
  if (setAttributes.element.tagName !== "Bay") return [setAttributes];

  const bay = setAttributes.element;
  const attributes = setAttributes.attributes;

  if (!attributes || !attributes.name) return [setAttributes];

  const oldName = bay.getAttribute("name");
  const substationName = bay.closest("Substation")?.getAttribute("name");
  const voltageLevelName = bay.closest("VoltageLevel")?.getAttribute("name");

  const newName = attributes.name;
  if (!substationName || !voltageLevelName || !oldName || oldName === newName)
    return [setAttributes];

  return [setAttributes].concat(
    ...updateConnectivityNodes(bay, {
      substation: substationName,
      voltageLevel: voltageLevelName,
      bayName: newName,
    }),
    ...updateSourceRef(bay, {
      oldSubstation: substationName,
      oldVoltageLevel: voltageLevelName,
      oldBay: oldName,
      newBay: newName,
    }),
  );
}
