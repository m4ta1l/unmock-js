import * as io from "io-ts";
import { cnst_, extendT, tuple_, type_ } from "json-schema-poet";
import {
  JSONArray,
  JSONObject,
  JSONPrimitive,
  JSONSchemaObject,
  JSSTAllOf,
  JSSTAnyOf,
  JSSTAnything,
  JSSTEmpty,
  JSSTList,
  JSSTNot,
  JSSTObject,
  JSSTOneOf,
  JSSTTuple,
} from "json-schema-strictly-typed";
import { valAsConst } from "openapi-refinements";
import * as querystring from "query-string";
import NodeBackend from "./backend";
import { CodeAsInt, HTTPMethod } from "./interfaces";
import { Schema, ValidEndpointType } from "./service/interfaces";
import { ServiceStore } from "./service/serviceStore";

/*************************************************
 * (Extended, Dynamic) JSON Schema defined below *
 *************************************************
 */
// Used to differentiate between e.g. `{ foo: { type: "string" } }` as a literal value
// (i.e. key `foo` having the value of `{type: "string"}`) and a dynamic JSON schema
const DynamicJSONSymbol: unique symbol = Symbol();
export interface IDynamicJSONValue {
  dynamic: typeof DynamicJSONSymbol;
}
const isDynamic = (unk: unknown): unk is IDynamicJSONValue =>
  typeof unk === "object" &&
  unk !== null &&
  (unk as any).dynamic === DynamicJSONSymbol;
const DynamicJSONValue: io.Type<
  IDynamicJSONValue,
  IDynamicJSONValue
> = new io.Type<IDynamicJSONValue, IDynamicJSONValue>(
  "DynamicJSONValueType",
  isDynamic,
  (input, context) =>
    isDynamic(input) ? io.success(input) : io.failure(input, context),
  io.identity,
);

const RecursiveUnion: io.Type<
  RecursiveUnionType,
  RecursiveUnionType
> = io.recursion("JSO", () =>
  io.union([
    JSONPrimitive,
    JSONObject,
    JSONArray,
    ExtendedArray,
    ExtendedObject,
  ]),
);
const JSO: io.Type<ExtendedJSONSchema, ExtendedJSONSchema> = io.recursion(
  "JSO",
  () => JSONSchemaObject(RecursiveUnion, DynamicJSONValue),
);

export type RecursiveUnionType =
  | JSONPrimitive
  | JSONObject
  | JSONArray
  | IExtendedArrayType
  | IExtendedObjectType;

// Define json schema types extended with the dynamic json value property
export type ExtendedJSONSchema = JSONSchemaObject<
  RecursiveUnionType,
  IDynamicJSONValue
>;
export type ExtendedPrimitiveType = JSONPrimitive | ExtendedJSONSchema | RegExp;
export type ExtendedValueType =
  | ExtendedPrimitiveType
  | IExtendedArrayType
  | IExtendedObjectType
  | JSONArray
  | JSONObject;
export interface IExtendedObjectType
  extends Record<string, ExtendedValueType> {} // Defined as interface due to circular reasons
export interface IExtendedArrayType extends Array<ExtendedValueType> {} // Defined as interface due to circular reference
type EJSEmpty = JSSTEmpty<{}>; // Used as a shortcut

const IORegExp = new io.Type<RegExp, RegExp>(
  "IORegExp",
  (unk: unknown): unk is RegExp => unk instanceof RegExp,
  (input, context) =>
    input instanceof RegExp ? io.success(input) : io.failure(input, context),
  io.identity,
);

// Define matching codecs for the above types
const ExtendedPrimitive = io.union([JSONPrimitive, JSO, IORegExp]);
const ExtendedValue: io.Type<
  ExtendedValueType,
  ExtendedValueType
> = io.recursion("ExtendedValue", () =>
  io.union([
    ExtendedPrimitive,
    JSONArray,
    JSONObject,
    ExtendedObject,
    ExtendedArray,
  ]),
);
const ExtendedObject: io.Type<
  IExtendedObjectType,
  IExtendedObjectType
> = io.recursion("ExtendedObject", () => io.record(io.string, ExtendedValue));
const ExtendedArray: io.Type<
  IExtendedArrayType,
  IExtendedArrayType
> = io.recursion("ExtendedArray", () => io.array(ExtendedValue));

const spreadAndSchemify = (
  e?: IExtendedObjectType,
  f: (e: ExtendedValueType) => JSSTAnything<EJSEmpty, {}> = JSONSchemify,
) =>
  e ? Object.entries(e).reduce((a, b) => ({ ...a, [b[0]]: f(b[1]) }), {}) : {};

// hack until we get around to doing full typing :-(
const removeDynamicSymbol = (schema: any): JSONSchemaObject<EJSEmpty, {}> => {
  if (schema instanceof Array) {
    return (schema as unknown) as JSONSchemaObject<EJSEmpty, {}>;
  }
  if (typeof schema === "object") {
    const { dynamic, ...rest } = schema;
    return spreadAndSchemify(
      dynamic === DynamicJSONSymbol ? rest : schema,
      removeDynamicSymbol,
    ) as JSONSchemaObject<EJSEmpty, {}>;
  }
  return schema;
};

export const JSONSchemify = (
  e: ExtendedValueType,
): JSSTAnything<EJSEmpty, {}> =>
  isDynamic(e)
    ? removeDynamicSymbol(
        // we cover all of the nested cases,
        // followed by un-nested cases
        JSSTAllOf(RecursiveUnion, DynamicJSONValue).is(e)
          ? { ...e, allOf: e.allOf.map(JSONSchemify) }
          : JSSTAnyOf(RecursiveUnion, DynamicJSONValue).is(e)
          ? { ...e, anyOf: e.anyOf.map(JSONSchemify) }
          : JSSTOneOf(RecursiveUnion, DynamicJSONValue).is(e)
          ? { ...e, oneOf: e.oneOf.map(JSONSchemify) }
          : JSSTNot(RecursiveUnion, DynamicJSONValue).is(e)
          ? { ...e, not: JSONSchemify(e.not) }
          : JSSTList(RecursiveUnion, DynamicJSONValue).is(e)
          ? { ...e, items: JSONSchemify(e.items) }
          : JSSTTuple(RecursiveUnion, DynamicJSONValue).is(e)
          ? { ...e, oneOf: e.items.map(JSONSchemify) }
          : JSSTObject(RecursiveUnion, DynamicJSONValue).is(e)
          ? {
              ...e,
              ...(e.additionalProperties
                ? { additionalProperties: JSONSchemify(e.additionalProperties) }
                : {}),
              ...spreadAndSchemify(e.patternProperties),
              ...spreadAndSchemify(e.properties),
            }
          : e,
      )
    : ExtendedArray.is(e) || JSONArray.is(e)
    ? tuple_<EJSEmpty, {}>({})(e.map(JSONSchemify))
    : ExtendedObject.is(e) || JSONObject.is(e)
    ? type_<EJSEmpty, {}>({})(spreadAndSchemify(e), {})
    : e instanceof RegExp
    ? { type: "string", pattern: e.source }
    : // total hack comes from the conversion from schema to json-schema
      // this works because valAsConst only ever yields valid JSON schema
      // we should mitigate this by makeing a "subset" type
      // common to both OAS & JSON Schema
      (valAsConst(cnst_<{}>({})(e).const) as JSSTAnything<EJSEmpty, {}>);

// Define poet to recognize the new "dynamic type"
const jspt = extendT<ExtendedJSONSchema, IDynamicJSONValue>({
  dynamic: DynamicJSONSymbol,
});

export const u = jspt;

/*******************************
 * Nock-like API defined below *
 *******************************
 */
// Defined nock-like syntax to create/update a service on the fly
type UpdateCallback = (
  store: ServiceStore,
) => (
  queriesFromCallToQueries: Record<string, Schema>,
) => ({
  statusCode,
  data,
  headers,
}: {
  statusCode: CodeAsInt | "default";
  headers: Record<string, Schema>;
  data: Schema;
}) => ServiceStore;

// Placeholder for poet input type, to have
// e.g. standard object => { type: "object", properties: { ... }}, number => { type: "number", const: ... }
type Primitives = string | number | boolean;
type InputToPoet = { [k: string]: any } | Primitives | Primitives[];

// How the fluent dynamic service API looks like (e.g. specifies `get(endpoint: string) => DynamicServiceSpec`)
export interface IFluentDynamicService {
  tldr(): void;
  get(endpoint: ValidEndpointType): DynamicServiceSpec;
  head(endpoint: ValidEndpointType): DynamicServiceSpec;
  post(endpoint: ValidEndpointType): DynamicServiceSpec;
  put(endpoint: ValidEndpointType): DynamicServiceSpec;
  patch(endpoint: ValidEndpointType): DynamicServiceSpec;
  delete(endpoint: ValidEndpointType): DynamicServiceSpec;
  options(endpoint: ValidEndpointType): DynamicServiceSpec;
  trace(endpoint: ValidEndpointType): DynamicServiceSpec;
}

// How the actual dynamic service spec looks like (e.g. `reply(statusCode: number, data: InputToPoet): ...`)
//                                                      `replyWithFile(....)`
interface IDynamicServiceSpec {
  /**
   * Sets the reply schema for the previous base URL, endpoint and HTTP method.
   * @param statusCode
   * @param data
   */
  query(
    data?: Record<string, InputToPoet>,
  ): IFluentDynamicService & IDynamicServiceSpec;
  reply(
    statusCode: CodeAsInt | "default",
    data?: InputToPoet | InputToPoet[],
    headers?: InputToPoet,
  ): IFluentDynamicService & IDynamicServiceSpec;
  reply(
    data: InputToPoet | InputToPoet[],
  ): IFluentDynamicService & IDynamicServiceSpec;
}

export class DynamicServiceSpec implements IDynamicServiceSpec {
  private data: Schema = {};
  private headers: Record<string, Schema> = {};
  private queriesFromCallToQueries: Record<string, Schema> = {};

  // Default status code passed in constructor
  constructor(
    private updater: UpdateCallback,
    private statusCode: CodeAsInt | "default" = 200,
    private baseUrl: string,
    private accumulatedQueries: Record<string, Schema>,
    private requestHeaders: Record<string, JSSTAnything<JSSTEmpty<{}>, {}>>,
    private serviceStore: ServiceStore,
    private name?: string,
  ) {}

  public query(
    data?: Record<string, InputToPoet>,
  ): IFluentDynamicService & IDynamicServiceSpec {
    this.queriesFromCallToQueries = {
      ...this.queriesFromCallToQueries,
      ...this.accumulatedQueries,
      ...(data
        ? Object.entries(data).reduce(
            (a, b) => ({ ...a, [b[0]]: JSONSchemify(b[1]) }),
            {},
          )
        : {}),
    } as Record<string, Schema>;

    const methods = buildFluentNock(
      this.serviceStore,
      this.baseUrl,
      this.requestHeaders,
      this.name,
    );
    const dss = new DynamicServiceSpec(
      this.updater,
      this.statusCode,
      this.baseUrl,
      this.queriesFromCallToQueries,
      this.requestHeaders,
      this.serviceStore,
      this.name,
    );

    return {
      ...methods,
      query: dss.query.bind(dss),
      reply: dss.reply.bind(dss),
    };
  }

  public reply(
    maybeStatusCode: CodeAsInt | "default" | InputToPoet | InputToPoet[],
    maybeData?: InputToPoet | InputToPoet[],
    maybeHeaders?: Record<string, InputToPoet>,
  ): IFluentDynamicService & IDynamicServiceSpec {
    if (maybeData !== undefined) {
      this.data = JSONSchemify(maybeData) as Schema; // TODO should this be some JSSTX?
      this.statusCode = maybeStatusCode as CodeAsInt | "default";
    } else if (
      (typeof maybeStatusCode === "number" &&
        maybeStatusCode >= 100 &&
        maybeStatusCode <= 599) ||
      maybeStatusCode === "default"
    ) {
      // we assume it's a status code
      this.statusCode = maybeStatusCode as CodeAsInt | "default";
    } else {
      this.data = JSONSchemify(maybeStatusCode) as Schema;
    }
    this.headers = maybeHeaders
      ? (Object.entries(maybeHeaders).reduce(
          (a, b) => ({ ...a, [b[0]]: JSONSchemify(b[1]) }),
          {},
        ) as Record<string, Schema>)
      : {};
    const store = this.updater(this.serviceStore)({
      ...this.queriesFromCallToQueries,
      ...this.accumulatedQueries,
    })({
      data: this.data,
      headers: this.headers,
      statusCode: this.statusCode,
    });

    const methods = buildFluentNock(
      store,
      this.baseUrl,
      this.requestHeaders,
      this.name,
    );
    const dss = new DynamicServiceSpec(
      this.updater,
      this.statusCode,
      this.baseUrl,
      { ...this.queriesFromCallToQueries, ...this.accumulatedQueries },
      this.requestHeaders,
      store,
      this.name,
    );
    // Have to manually update the methods to match `IDynamicServiceSpec`
    return {
      ...methods,
      query: dss.query.bind(dss),
      reply: dss.reply.bind(dss),
    };
  }
}

const updateStore = (
  baseUrl: string,
  method: HTTPMethod,
  endpoint: ValidEndpointType,
  query: Record<string, Schema>,
  requestHeaders: Record<string, Schema>,
  body?: Schema,
  name?: string,
) => (store: ServiceStore) => (
  queriesFromCallToQueries: Record<string, Schema>,
) => ({
  statusCode,
  headers,
  data,
}: {
  statusCode: CodeAsInt | "default";
  headers: Record<string, Schema>;
  data: Schema;
}) =>
  store.updateOrAdd({
    baseUrl,
    method,
    endpoint,
    query: { ...query, ...queriesFromCallToQueries },
    requestHeaders,
    responseHeaders: headers,
    body,
    statusCode,
    response: data,
    name,
  });

const endpointToQs = (endpoint: ValidEndpointType) =>
  Object.entries(
    querystring.parse(
      typeof endpoint === "string" ? endpoint.split("?")[1] || "" : "",
    ),
  ).reduce(
    (a, b) => ({
      ...a,
      [b[0]]: JSONSchemify(b[1] === undefined ? null : b[1]),
    }),
    {},
  ) || {};

const naked = (endpoint: ValidEndpointType) =>
  typeof endpoint === "string" ? endpoint.split("?")[0] : endpoint;

const HTTPMethodsWithCommonStatusResponses = {
  get: 200,
  head: 200,
  post: 201,
  put: 204,
  patch: 204,
  delete: 200,
  options: 200,
  trace: 200,
};

const buildFluentNock = (
  store: ServiceStore,
  baseUrl: string,
  requestHeaders: Record<string, JSSTAnything<EJSEmpty, {}>>,
  name?: string,
): IFluentDynamicService =>
  ((fds: IFluentDynamicService) => ({
    ...fds,
    tldr: () =>
      [
        "/",
        "/{a}",
        "/{a}/{b}",
        "/{a}/{b}/{c}",
        "/{a}/{b}/{c}/{d}",
        "/{a}/{b}/{c}/{d}/{e}",
        "/{a}/{b}/{c}/{d}/{e}/{f}",
        "/{a}/{b}/{c}/{d}/{e}/{f}/{g}",
        "/{a}/{b}/{c}/{d}/{e}/{f}/{g}/{h}",
      ].forEach(p =>
        Object.entries(
          HTTPMethodsWithCommonStatusResponses,
          // "cast" fds to any to leave the TS world for dynamic method calls
          // "cast" back to IDynamicServiceSpec for consistency
        ).forEach(([method, code]) =>
          ((fds as any)[method](p) as IDynamicServiceSpec).reply(code),
        ),
      ),
  }))(Object.entries(HTTPMethodsWithCommonStatusResponses).reduce(
    (o, [method, code]) => ({
      ...o,
      [method]:
        method === "post" || method === "patch" || method === "put"
          ? (endpoint: ValidEndpointType, requestBody?: ExtendedJSONSchema) =>
              new DynamicServiceSpec(
                updateStore(
                  baseUrl,
                  method as HTTPMethod,
                  naked(endpoint),
                  endpointToQs(endpoint) || {},
                  requestHeaders as Record<string, Schema>,
                  requestBody !== undefined
                    ? (JSONSchemify(requestBody) as Schema)
                    : undefined,
                  name,
                ),
                code as CodeAsInt,
                baseUrl,
                endpointToQs(endpoint) || {},
                requestHeaders,
                store,
                name,
              )
          : (endpoint: ValidEndpointType) =>
              new DynamicServiceSpec(
                updateStore(
                  baseUrl,
                  method as HTTPMethod,
                  naked(endpoint),
                  endpointToQs(endpoint) || {},
                  requestHeaders as Record<string, Schema>,
                  undefined,
                  name,
                ),
                code as CodeAsInt,
                baseUrl,
                endpointToQs(endpoint) || {},
                requestHeaders,
                store,
                name,
              ),
    }),
    {},
  ) as IFluentDynamicService);

export const nockify = ({
  backend,
  baseUrl,
  requestHeaders,
  name,
}: {
  backend: NodeBackend;
  baseUrl: string;
  requestHeaders: Record<string, JSSTAnything<EJSEmpty, {}>>;
  name?: string;
}) => buildFluentNock(backend.serviceStore, baseUrl, requestHeaders, name);
