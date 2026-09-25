import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
const origin = "https://educode.test";
const urls = [
  "/",
  "/cari",
  "/latihan",
  "/runner",
  "/offline.html",
  "/_next/static/app.js",
];
const source = (await readFile("scripts/sw-template.js", "utf8")).replace(
  "/* PWA_CONFIG */ null",
  JSON.stringify({ version: "test-build", urls }),
);
function harness(failAt = "") {
  const handlers = {},
    stores = new Map();
  let offline = false,
    claimed = false;
  const key = (value) =>
    new URL(typeof value === "string" ? value : value.url, origin).href;
  class LocalRequest extends Request {
    constructor(url, options) {
      super(new URL(url, origin), options);
    }
  }
  const caches = {
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const map = stores.get(name);
      return {
        put: async (k, v) => map.set(key(k), v.clone()),
        match: async (k) => map.get(key(k))?.clone(),
      };
    },
    delete: async (name) => stores.delete(name),
    keys: async () => [...stores.keys()],
    match: async (k) => {
      for (const map of stores.values())
        if (map.has(key(k))) return map.get(key(k)).clone();
    },
  };
  const self = {
    location: { origin },
    addEventListener: (type, fn) => (handlers[type] = fn),
    clients: {
      claim: async () => {
        claimed = true;
      },
    },
    skipWaiting: () => {},
  };
  const fetch = async (request) => {
    const path = new URL(
      typeof request === "string" ? request : request.url,
      origin,
    ).pathname;
    if (offline || path === failAt) throw Error("Network offline");
    return new Response(path === "/runner" ? "runner" : `page:${path}`, {
      headers: {
        "Content-Type": path.endsWith(".js")
          ? "application/javascript"
          : "text/html",
      },
    });
  };
  vm.runInNewContext(source, {
    self,
    caches,
    fetch,
    Request: LocalRequest,
    Response,
    URL,
    AbortSignal,
    Promise,
    Error,
  });
  const dispatch = async (type, extra = {}) => {
    let pending;
    handlers[type]({
      ...extra,
      waitUntil: (p) => (pending = p),
      respondWith: (p) => (pending = p),
    });
    return await pending;
  };
  return {
    stores,
    dispatch,
    setOffline: () => (offline = true),
    claimed: () => claimed,
  };
}
test("offline install is complete and serves unvisited pages, query search and runner", async () => {
  const h = harness();
  await h.dispatch("install");
  await h.dispatch("activate");
  assert.equal(h.claimed(), true);
  h.setOffline();
  for (const path of ["/", "/latihan", "/cari?q=harga", "/runner"]) {
    const response = await h.dispatch("fetch", {
      request: {
        method: "GET",
        url: origin + path,
        mode: "navigate",
        headers: new Headers(),
      },
    });
    assert.equal(response.status, 200);
    assert.equal(
      await response.text(),
      path === "/runner" ? "runner" : `page:${path.split("?")[0]}`,
    );
  }
  const unknown = await h.dispatch("fetch", {
    request: {
      method: "GET",
      url: origin + "/unknown",
      mode: "navigate",
      headers: new Headers(),
    },
  });
  assert.equal(await unknown.text(), "page:/offline.html");
});
test("failed package never leaves a partially ready cache", async () => {
  const h = harness("/runner");
  await assert.rejects(h.dispatch("install"));
  assert.equal(h.stores.size, 0);
});
test("flight, POST and third-party responses are not confused with cached documents", async () => {
  const h = harness();
  await h.dispatch("install");
  h.setOffline();
  for (const request of [
    { method: "GET", url: origin + "/?_rsc=abc", headers: new Headers() },
    { method: "GET", url: origin + "/", headers: new Headers({ RSC: "1" }) },
    { method: "POST", url: origin + "/", headers: new Headers() },
    { method: "GET", url: "https://other.test/", headers: new Headers() },
  ])
    assert.equal(await h.dispatch("fetch", { request }), undefined);
});
test("activation preserves unrelated caches and one previous build", async () => {
  const h = harness();
  h.stores.set("other-app", new Map());
  h.stores.set("educode-offline-oldest", new Map());
  h.stores.set("educode-offline-previous", new Map());
  await h.dispatch("install");
  await h.dispatch("activate");
  assert.ok(h.stores.has("other-app"));
  assert.ok(h.stores.has("educode-offline-previous"));
  assert.equal(h.stores.has("educode-offline-oldest"), false);
});
