import unmock, { u } from "..";

describe("Tests dynamic path tests", () => {
  beforeEach(() => unmock.reloadServices());

  it("Adds a service", () => {
    expect(Object.keys(unmock.services).length).toEqual(0); // Uses the default location and not the test folder
    unmock
      .nock("https://foo.com")
      .get("/foo")
      .reply(200, { foo: u.str() });
    expect(Object.keys(unmock.services).length).toEqual(1);
  });

  it("Adds a service and changes state", () => {
    expect(Object.keys(unmock.services).length).toEqual(0); // Uses the default location and not the test folder
    unmock
      .nock("https://foo.com")
      .get("foo") // slash is prepended automatically
      .reply(200, { foo: u.str() });
    expect(Object.keys(unmock.services).length).toEqual(1);
    const service = unmock.services["foo.com"];
    if (service === undefined) {
      // type-checking mostly...
      throw new Error("Service was undefined??");
    }
    expect(() => service.state.get("/foo", { foo: "abc" })).not.toThrow();
  });

  it("Adds a service and updates it on consecutive calls", () => {
    expect(Object.keys(unmock.services).length).toEqual(0); // Uses the default location and not the test folder
    unmock
      .nock("https://foo.com")
      .get("foo") // slash is prepended automatically
      .reply(200, { foo: u.city() });
    unmock
      .nock("https://foo.com")
      .post("/foo")
      .reply(201);
    expect(Object.keys(unmock.services).length).toEqual(1);
    const service = unmock.services["foo.com"];
    if (service === undefined) {
      // type-checking mostly...
      throw new Error("Service was undefined??");
    }
    expect(() =>
      service.state("/foo", { $code: 201 }).get("/foo", { $code: 200 }),
    ).not.toThrow();
  });

  it("Adds a named service", () => {
    expect(Object.keys(unmock.services).length).toEqual(0); // Uses the default location and not the test folder
    unmock
      .nock("https://abc.com", "foo")
      .get("abc") // slash is prepended automatically
      .reply(200, { foo: u.str() });
    expect(Object.keys(unmock.services).length).toEqual(1);
    expect(() =>
      unmock.services.foo.state.get("/abc", { $code: 200 }),
    ).not.toThrow();
  });

  it("Chains multiple endpoints", () => {
    expect(Object.keys(unmock.services).length).toEqual(0); // Uses the default location and not the test folder
    unmock
      .nock("https://abc.com", "foo")
      .get("abc") // slash is prepended automatically
      .reply(200, { foo: u.str() })
      .post("bar")
      .reply(404);
    expect(Object.keys(unmock.services).length).toEqual(1);
    expect(() =>
      unmock.services.foo.state.post("/bar", { $code: 404 }),
    ).not.toThrow();
  });

  it("Chains multiple endpoints in multiple calls", () => {
    expect(Object.keys(unmock.services).length).toEqual(0); // Uses the default location and not the test folder
    const dynamicSpec = unmock
      .nock("https://abc.com", "foo")
      .get("foo")
      .reply(200, { city: u.city() });
    dynamicSpec.get("foo").reply(404, { msg: u.str() });
    const service = unmock.services.foo;
    expect(() => service.state.get("/foo", { $code: 404 })).not.toThrow();
  });

  it("Allows using same name with multiple servers", () => {
    expect(Object.keys(unmock.services).length).toEqual(0); // Uses the default location and not the test folder
    unmock
      .nock("https://abc.com", "foo")
      .get("foo")
      .reply(200, { city: u.city() });
    unmock
      .nock("https://def.com", "foo")
      .get("foo")
      .reply(404, { msg: u.str() });
    unmock
      .nock("https://abc.com", "foo")
      .get("foo")
      .reply(500);
    const service = unmock.services.foo;
    expect(() => service.state.get("/foo", { $code: 500 })).not.toThrow();
  });
});