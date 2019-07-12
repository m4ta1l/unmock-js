import { Response, Responses, Schema } from "../service/interfaces";
import defProvider from "../service/state/providers";
import {
  getValidResponsesForOperationWithState,
  spreadStateFromService,
} from "../service/state/validator";

const arraySchema: Schema = {
  type: "array",
  items: {
    properties: {
      id: {
        type: "integer",
        format: "int32",
      },
    },
  },
};
const schema: Schema = {
  properties: {
    test: {
      type: "object",
      properties: {
        id: {
          type: "integer",
          format: "int64",
        },
      },
    },
    name: {
      type: "string",
    },
    foo: {
      type: "object",
      properties: {
        bar: {
          type: "object",
          properties: {
            id: {
              type: "integer",
            },
          },
        },
      },
    },
    tag: { type: "string" },
  },
};
const response: Response = {
  content: {
    "application/json": {
      schema,
    },
  },
  description: "foobar",
};
const op = { responses: { 200: { ...response } } };
const arrResponses: { responses: Responses } = {
  responses: {
    200: {
      description: "foobar",
      content: { "application/json": { schema: arraySchema } },
    },
  },
};

describe("Tests spreadStateFromService", () => {
  it("with empty path", () => {
    const resp = response.content as any;
    const spreadState = spreadStateFromService(
      resp["application/json"].schema,
      {},
    );
    expect(spreadState).toEqual({}); // Empty state => empty spread state
  });

  it("with specific path", () => {
    const resp = response.content as any;
    const spreadState = spreadStateFromService(
      resp["application/json"].schema,
      { test: { id: "a" } },
    );
    expect(spreadState).toEqual({
      // Spreading from "test: { id : { ... " to also inlucde properties
      properties: {
        test: {
          properties: {
            id: null, // Will be removed due to wrong type
          },
        },
      },
    });
  });

  it("with vague path", () => {
    const resp = response.content as any;
    const spreadState = spreadStateFromService(
      resp["application/json"].schema,
      { id: 5 },
    );
    // no "id" in top-most level or immediately under properties\items
    expect(spreadState).toEqual({ id: null });
  });

  it("with missing parameters", () => {
    const resp = response.content as any;
    const spreadState = spreadStateFromService(
      resp["application/json"].schema,
      { ida: "a" },
    );
    expect(spreadState.ida).toBeNull(); // Nothing to spread
  });
});

describe("Tests getValidResponsesForOperationWithState", () => {
  it("with empty state", () => {
    const spreadState = getValidResponsesForOperationWithState(
      op,
      defProvider(),
    );
    expect(spreadState.error).toBeUndefined();
    expect(spreadState.responses).toEqual({
      200: {
        "application/json": {},
      },
    });
  });

  it("invalid parameter returns error", () => {
    const spreadState = getValidResponsesForOperationWithState(
      op,
      defProvider({
        boom: 5,
      }),
    );
    expect(spreadState.error).toContain("Can't find definition for 'boom'");
  });

  it("empty schema returns error", () => {
    const spreadState = getValidResponsesForOperationWithState(
      {
        responses: {
          200: { content: { "application/json": {} }, description: "foo" },
        },
      },
      defProvider(),
    );
    expect(spreadState.error).toContain("No schema defined");
  });

  it("with $code specified", () => {
    const spreadState = getValidResponsesForOperationWithState(
      op,
      defProvider({
        $code: 200,
      }),
    );
    expect(spreadState.error).toBeUndefined();
    expect(spreadState.responses).toEqual({ 200: { "application/json": {} } });
  });

  it("with $size in top-level specified", () => {
    const spreadState = getValidResponsesForOperationWithState(
      arrResponses,
      defProvider({ $size: 5 }),
    );
    expect(spreadState.error).toBeUndefined();
    expect(spreadState.responses).toEqual({
      200: {
        "application/json": {
          minItems: 5,
          maxItems: 5,
        },
      },
    });
  });

  it("with missing $code specified", () => {
    const spreadState = getValidResponsesForOperationWithState(
      op,
      defProvider({
        $code: 404,
      }),
    );
    expect(spreadState.responses).toBeUndefined();
    expect(spreadState.error).toContain(
      "Can't find response for given status code '404'!",
    );
  });

  it("with no $code specified", () => {
    const spreadState = getValidResponsesForOperationWithState(
      op,
      defProvider({
        test: { id: 5 },
      }),
    );
    expect(spreadState.error).toBeUndefined();
    expect(spreadState.responses).toEqual({
      200: {
        "application/json": {
          properties: {
            test: {
              properties: {
                id: 5,
              },
            },
          },
        },
      },
    });
  });
});