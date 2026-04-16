import type {
  AnyField,
  FormSchema,
  ListField,
  OutputBlock,
  OutputFieldBlock,
  Page,
  TextField,
} from "./form-schema";
import type { LabelBlock } from "./display-blocks";
import type { Condition, VisibleIfFormula } from "./visible-if-formula";
import { validateFormSchema } from "./form-schema-validate";

const formula = (conditions: Record<string, Condition>): VisibleIfFormula => ({
  conditions,
  formula: Object.keys(conditions)[0] ?? "",
});

const textField = (
  id: string,
  overrides: Partial<TextField> = {},
): TextField => ({
  id,
  kind: "text",
  label: id,
  ...overrides,
});

const labelBlock = (
  id: string,
  overrides: Partial<LabelBlock> = {},
): LabelBlock => ({
  id,
  kind: "label",
  text: id,
  ...overrides,
});

const fieldBlock = (
  id: string,
  fieldId: string,
  overrides: Partial<OutputFieldBlock> = {},
): OutputFieldBlock => ({ id, fieldId, ...overrides });

const page = (id: string, fields: Array<AnyField | LabelBlock>): Page => ({
  id,
  fields,
});

const baseSchema = (overrides: Partial<FormSchema> = {}): FormSchema => ({
  title: "Test form",
  pages: [],
  outputViews: [],
  ...overrides,
});

const view = (
  id: string,
  blocks: OutputBlock[],
  overrides: Partial<FormSchema["outputViews"][number]> = {},
): FormSchema["outputViews"][number] => ({
  id,
  type: "default",
  blocks,
  ...overrides,
});

describe("validateFormSchema", () => {
  it("returns no errors for an empty schema", () => {
    expect(validateFormSchema(baseSchema())).toEqual([]);
  });

  it("returns no errors for a valid outputBlockVisible reference", () => {
    const schema = baseSchema({
      pages: [page("p1", [textField("f1")])],
      outputViews: [
        view("v1", [
          fieldBlock("blk-field", "f1"),
          labelBlock("blk-label", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "blk-field", isVisible: true },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([]);
  });

  it("flags a missing output block reference", () => {
    const schema = baseSchema({
      outputViews: [
        view("v1", [
          labelBlock("blk-label", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "does-not-exist" },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([
      {
        viewId: "v1",
        blockId: "blk-label",
        message: 'References missing output block "does-not-exist"',
      },
    ]);
  });

  it("allows a display block to reference another display block by id", () => {
    const schema = baseSchema({
      outputViews: [
        view("v1", [
          labelBlock("other-label"),
          labelBlock("blk", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "other-label" },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([]);
  });

  it("allows a field block to reference a display block by id", () => {
    const schema = baseSchema({
      pages: [page("p1", [textField("f1")])],
      outputViews: [
        view("v1", [
          labelBlock("disp"),
          fieldBlock("blk-field", "f1", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "disp" },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([]);
  });

  it("allows a field block to carry an outputBlockVisible condition pointing at another field block", () => {
    const schema = baseSchema({
      pages: [page("p1", [textField("f1"), textField("f2")])],
      outputViews: [
        view("v1", [
          fieldBlock("blk-a", "f1"),
          fieldBlock("blk-b", "f2", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "blk-a", isVisible: true },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([]);
  });

  it("flags a 2-block cycle of outputBlockVisible references", () => {
    const schema = baseSchema({
      pages: [page("p1", [textField("f1"), textField("f2")])],
      outputViews: [
        view("v1", [
          fieldBlock("blk-a", "f1", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "blk-b" },
            }),
          }),
          fieldBlock("blk-b", "f2", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "blk-a" },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([
      {
        viewId: "v1",
        blockId: "blk-a",
        message:
          "Cycle in outputBlockVisible references: blk-a -> blk-b -> blk-a",
      },
    ]);
  });

  it("flags a self-loop outputBlockVisible reference", () => {
    const schema = baseSchema({
      pages: [page("p1", [textField("f1")])],
      outputViews: [
        view("v1", [
          fieldBlock("blk-a", "f1", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "blk-a" },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([
      {
        viewId: "v1",
        blockId: "blk-a",
        message: "Cycle in outputBlockVisible references: blk-a -> blk-a",
      },
    ]);
  });

  it("flags a 3-block cycle of outputBlockVisible references", () => {
    const schema = baseSchema({
      pages: [
        page("p1", [textField("f1"), textField("f2"), textField("f3")]),
      ],
      outputViews: [
        view("v1", [
          fieldBlock("blk-a", "f1", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "blk-b" },
            }),
          }),
          fieldBlock("blk-b", "f2", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "blk-c" },
            }),
          }),
          fieldBlock("blk-c", "f3", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "blk-a" },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([
      {
        viewId: "v1",
        blockId: "blk-a",
        message:
          "Cycle in outputBlockVisible references: blk-a -> blk-b -> blk-c -> blk-a",
      },
    ]);
  });

  it("allows a valid DAG of outputBlockVisible references (no cycle)", () => {
    const schema = baseSchema({
      pages: [
        page("p1", [textField("f1"), textField("f2"), textField("f3")]),
      ],
      outputViews: [
        view("v1", [
          fieldBlock("blk-a", "f1"),
          fieldBlock("blk-b", "f2", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "blk-a" },
            }),
          }),
          fieldBlock("blk-c", "f3", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "blk-b" },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([]);
  });

  it("flags an empty-string outputBlockVisible target as missing", () => {
    const schema = baseSchema({
      outputViews: [
        view("v1", [
          labelBlock("blk", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "" },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([
      {
        viewId: "v1",
        blockId: "blk",
        message: 'References missing output block ""',
      },
    ]);
  });

  it("rejects outputBlockVisible on an input field's visibleIfFormula", () => {
    const schema = baseSchema({
      pages: [
        page("p1", [
          textField("f1", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "anything" },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([
      {
        blockId: "f1",
        message:
          '"outputBlockVisible" condition is only valid on output-view blocks',
      },
    ]);
  });

  it("rejects outputBlockVisible on an input field's requiredIf", () => {
    const schema = baseSchema({
      pages: [
        page("p1", [
          textField("f1", {
            requiredIf: { outputBlockVisible: "anything" },
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([
      {
        blockId: "f1",
        message:
          '"outputBlockVisible" condition is only valid on output-view blocks',
      },
    ]);
  });

  it("rejects outputBlockVisible on a display block inside a page", () => {
    const schema = baseSchema({
      pages: [
        page("p1", [
          labelBlock("disp", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "x" },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([
      {
        blockId: "disp",
        message:
          '"outputBlockVisible" condition is only valid on output-view blocks',
      },
    ]);
  });

  it("recurses into list sub-fields", () => {
    const nested: ListField = {
      id: "list1",
      kind: "list",
      label: "list1",
      fields: [
        textField("inner", {
          visibleIfFormula: formula({
            c1: { outputBlockVisible: "nope" },
          }),
        }),
      ],
    };
    const schema = baseSchema({
      pages: [{ id: "p1", fields: [nested] }],
    });
    expect(validateFormSchema(schema)).toEqual([
      {
        blockId: "inner",
        message:
          '"outputBlockVisible" condition is only valid on output-view blocks',
      },
    ]);
  });

  it("ignores unrelated condition kinds", () => {
    const schema = baseSchema({
      pages: [
        page("p1", [
          textField("f1", {
            visibleIfFormula: formula({
              c1: { when: "f2", equals: "yes" },
              c2: { expr: "1 + 1" },
              c3: { validatorId: 42 },
              c4: { deviceType: ["mobile"] },
            }),
          }),
        ]),
      ],
      outputViews: [
        view("v1", [
          fieldBlock("blk-field", "f1"),
          labelBlock("blk", {
            visibleIfFormula: formula({
              c1: { when: "f1", hasValue: true },
              c2: { validatorId: 7, resultEquals: false },
            }),
          }),
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([]);
  });

  it("reports multiple errors across pages and output views", () => {
    const schema = baseSchema({
      pages: [
        page("p1", [
          textField("f1", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "x" },
            }),
          }),
        ]),
      ],
      outputViews: [
        view("v1", [
          labelBlock("blk", {
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "missing" },
            }),
          }),
        ]),
      ],
    });
    const errors = validateFormSchema(schema);
    expect(errors).toHaveLength(2);
    expect(errors).toContainEqual({
      blockId: "f1",
      message:
        '"outputBlockVisible" condition is only valid on output-view blocks',
    });
    expect(errors).toContainEqual({
      viewId: "v1",
      blockId: "blk",
      message: 'References missing output block "missing"',
    });
  });

  it("uses <unnamed> for a display block with no id", () => {
    const schema = baseSchema({
      outputViews: [
        view("v1", [
          {
            kind: "label",
            text: "no-id",
            visibleIfFormula: formula({
              c1: { outputBlockVisible: "missing" },
            }),
          },
        ]),
      ],
    });
    expect(validateFormSchema(schema)).toEqual([
      {
        viewId: "v1",
        blockId: "<unnamed>",
        message: 'References missing output block "missing"',
      },
    ]);
  });
});
