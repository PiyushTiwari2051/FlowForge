import { parseConfig } from "./parser";
import { DEFAULTS } from "./defaults";
import * as assert from "assert";

function runTests() {
  console.log("🚀 Starting Config Parser Verification Tests...\n");

  // Test 1: Null / Undefined input
  console.log("Running Test 1: Null/Undefined Input...");
  const res1 = parseConfig(null);
  assert.deepStrictEqual(res1.app.name, DEFAULTS.app.name);
  assert.deepStrictEqual(res1.ui.pages.length, DEFAULTS.ui.pages.length);
  console.log("✅ Test 1 Passed!");

  // Test 2: Empty Object {}
  console.log("Running Test 2: Empty Object {} Input...");
  const res2 = parseConfig({});
  assert.deepStrictEqual(res2.app.name, DEFAULTS.app.name);
  assert.deepStrictEqual(res2.database.tables.length, 0);
  assert.deepStrictEqual(res2.api.endpoints.length, 0);
  console.log("✅ Test 2 Passed!");

  // Test 3: Invalid Database Types Coercion
  console.log("Running Test 3: Invalid Database field types...");
  const badDbConfig = {
    database: {
      tables: [
        {
          name: "Clients!@",
          fields: [
            { name: "email_address", type: "xyz", required: true },
            { name: "age", type: "number" }
          ]
        }
      ]
    }
  };
  const res3 = parseConfig(badDbConfig);
  assert.strictEqual(res3.database.tables[0].name, "clients__");
  assert.strictEqual(res3.database.tables[0].fields[0].name, "email_address");
  // Check default type coercion: xyz -> string
  assert.strictEqual(res3.database.tables[0].fields[0].type, "string");
  assert.strictEqual(res3.database.tables[0].fields[1].type, "number");
  console.log("✅ Test 3 Passed!");

  // Test 4: Endpoint referencing non-existent table
  console.log("Running Test 4: Endpoint referencing non-existent table...");
  const badApiConfig = {
    database: {
      tables: [{ name: "users", fields: [{ name: "name", type: "string" }] }]
    },
    api: {
      endpoints: [
        { path: "users", method: "GET", table: "users", action: "list" },
        { path: "posts", method: "GET", table: "posts", action: "list" } // Should be skipped because posts doesn't exist
      ]
    }
  };
  const res4 = parseConfig(badApiConfig);
  assert.strictEqual(res4.api.endpoints.length, 1);
  assert.strictEqual(res4.api.endpoints[0].table, "users");
  console.log("✅ Test 4 Passed!");

  // Test 5: Config with Unknown Page Components
  console.log("Running Test 5: Unknown UI component...");
  const badUiConfig = {
    ui: {
      pages: [
        {
          route: "dashboard",
          title: "Dashboard",
          components: [
            { id: "c1", type: "kanban", table: "users" }
          ]
        }
      ]
    }
  };
  const res5 = parseConfig(badUiConfig);
  assert.strictEqual(res5.ui.pages[0].route, "/dashboard");
  assert.strictEqual(res5.ui.pages[0].components[0].type, "kanban");
  console.log("✅ Test 5 Passed!");

  console.log("\n🎉 All Config Parser Layer Tests Passed Successfully!");
}

try {
  runTests();
  process.exit(0);
} catch (error) {
  console.error("❌ Test Suite Failed:", error);
  process.exit(1);
}
