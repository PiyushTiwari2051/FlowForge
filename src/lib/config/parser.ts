import { AppConfig, NormalizedConfig } from "./types";
import { DEFAULTS } from "./defaults";

export function parseConfig(raw: any): NormalizedConfig {
  const warnings: string[] = [];

  const warn = (path: string, message: string) => {
    const logMsg = `[Config Warning at ${path}]: ${message}`;
    warnings.push(logMsg);
    console.warn(logMsg);
  };

  if (!raw || typeof raw !== "object") {
    warn("root", "Config is not an object or is null. Using default application configuration.");
    return { ...DEFAULTS };
  }

  const result: any = {};

  // 1. App Block
  if (typeof raw.app !== "object" || raw.app === null) {
    warn("app", "app block missing or invalid. Falling back to default.");
    result.app = { ...DEFAULTS.app };
  } else {
    result.app = {};
    // name
    if (typeof raw.app.name !== "string" || !raw.app.name.trim()) {
      warn("app.name", "name is missing or invalid. Defaulting to 'FlowForge App'.");
      result.app.name = DEFAULTS.app.name;
    } else {
      result.app.name = raw.app.name.trim();
    }
    // description
    if (raw.app.description !== undefined && typeof raw.app.description !== "string") {
      warn("app.description", "description must be a string. Defaulting to empty.");
      result.app.description = DEFAULTS.app.description;
    } else {
      result.app.description = raw.app.description || DEFAULTS.app.description;
    }
    // language
    const validLanguages = ["en", "hi", "ar", "fr", "es"];
    if (!raw.app.language || !validLanguages.includes(raw.app.language)) {
      warn("app.language", `language '${raw.app.language}' is invalid. Defaulting to 'en'.`);
      result.app.language = DEFAULTS.app.language;
    } else {
      result.app.language = raw.app.language;
    }
    // theme
    const validThemes = ["dark", "light", "system"];
    if (!raw.app.theme || !validThemes.includes(raw.app.theme)) {
      warn("app.theme", `theme '${raw.app.theme}' is invalid. Defaulting to 'dark'.`);
      result.app.theme = DEFAULTS.app.theme;
    } else {
      result.app.theme = raw.app.theme;
    }
    // primaryColor
    if (raw.app.primaryColor && typeof raw.app.primaryColor !== "string") {
      warn("app.primaryColor", "primaryColor must be a string. Defaulting to default color.");
      result.app.primaryColor = DEFAULTS.app.primaryColor;
    } else {
      result.app.primaryColor = raw.app.primaryColor || DEFAULTS.app.primaryColor;
    }
    // logo
    if (raw.app.logo && typeof raw.app.logo !== "string") {
      warn("app.logo", "logo must be a string. Defaulting to empty.");
      result.app.logo = "";
    } else {
      result.app.logo = raw.app.logo || "";
    }
  }

  // 2. Auth Block
  if (typeof raw.auth !== "object" || raw.auth === null) {
    warn("auth", "auth block missing or invalid. Falling back to default.");
    result.auth = { ...DEFAULTS.auth };
  } else {
    result.auth = {};
    // methods
    if (!Array.isArray(raw.auth.methods)) {
      warn("auth.methods", "methods must be an array. Defaulting to ['email'].");
      result.auth.methods = [...DEFAULTS.auth.methods];
    } else {
      const validMethods = ["email", "google", "github"];
      const cleanMethods = raw.auth.methods.filter((m: any) => {
        const isValid = validMethods.includes(m);
        if (!isValid) warn("auth.methods", `Removed invalid authentication method '${m}'.`);
        return isValid;
      });
      result.auth.methods = cleanMethods.length > 0 ? cleanMethods : [...DEFAULTS.auth.methods];
    }
    // allowSignup
    result.auth.allowSignup = typeof raw.auth.allowSignup === "boolean" ? raw.auth.allowSignup : DEFAULTS.auth.allowSignup;
    // ui
    if (typeof raw.auth.ui !== "object" || raw.auth.ui === null) {
      result.auth.ui = { ...DEFAULTS.auth.ui };
    } else {
      result.auth.ui = {
        logo: typeof raw.auth.ui.logo === "string" ? raw.auth.ui.logo : DEFAULTS.auth.ui.logo,
        primaryColor: typeof raw.auth.ui.primaryColor === "string" ? raw.auth.ui.primaryColor : DEFAULTS.auth.ui.primaryColor,
        welcomeMessage: typeof raw.auth.ui.welcomeMessage === "string" ? raw.auth.ui.welcomeMessage : DEFAULTS.auth.ui.welcomeMessage,
      };
    }
  }

  // 3. Database Block
  if (typeof raw.database !== "object" || raw.database === null || !Array.isArray(raw.database.tables)) {
    warn("database", "database block or tables list missing/invalid. Defaulting to empty list.");
    result.database = { tables: [] };
  } else {
    result.database = { tables: [] };
    const tablesList = raw.database.tables;

    tablesList.forEach((tableRaw: any, tIndex: number) => {
      const path = `database.tables[${tIndex}]`;
      if (!tableRaw || typeof tableRaw !== "object") {
        warn(path, "Table definition must be an object. Skipping table.");
        return;
      }

      // table name validation: lowercase alphanumeric + underscores
      let tableName = typeof tableRaw.name === "string" ? tableRaw.name.trim().toLowerCase() : "";
      tableName = tableName.replace(/[^a-z0-9_]/g, "_");
      if (!tableName) {
        tableName = `table_${tIndex}`;
        warn(`${path}.name`, `Table name is missing or invalid. Defaulting to '${tableName}'.`);
      }

      const table: any = {
        name: tableName,
        displayName: typeof tableRaw.displayName === "string" ? tableRaw.displayName.trim() : tableName.charAt(0).toUpperCase() + tableName.slice(1),
        fields: [],
      };

      // fields validation
      if (!Array.isArray(tableRaw.fields) || tableRaw.fields.length === 0) {
        warn(`${path}.fields`, `Table '${tableName}' has no fields defined. Adding a default 'name' field.`);
        table.fields.push({
          name: "name",
          type: "string",
          required: true,
          unique: false,
          default: "",
          label: "Name",
        });
      } else {
        const validTypes = ["string", "number", "boolean", "date", "email", "url", "text"];
        tableRaw.fields.forEach((fieldRaw: any, fIndex: number) => {
          const fPath = `${path}.fields[${fIndex}]`;
          if (!fieldRaw || typeof fieldRaw !== "object") {
            warn(fPath, "Field definition must be an object. Skipping field.");
            return;
          }

          let fieldName = typeof fieldRaw.name === "string" ? fieldRaw.name.trim() : "";
          // Field names should be alphanumeric+underscores, start with a letter
          fieldName = fieldName.replace(/[^a-zA-Z0-9_]/g, "");
          if (!fieldName) {
            fieldName = `field_${fIndex}`;
            warn(`${fPath}.name`, `Field name is missing or invalid. Defaulting to '${fieldName}'.`);
          }

          let fieldType = typeof fieldRaw.type === "string" ? fieldRaw.type.trim().toLowerCase() : "";
          if (!validTypes.includes(fieldType)) {
            warn(`${fPath}.type`, `Field '${fieldName}' has invalid type '${fieldType}'. Defaulting to 'string'.`);
            fieldType = "string";
          }

          table.fields.push({
            name: fieldName,
            type: fieldType,
            required: typeof fieldRaw.required === "boolean" ? fieldRaw.required : false,
            unique: typeof fieldRaw.unique === "boolean" ? fieldRaw.unique : false,
            default: fieldRaw.default !== undefined ? fieldRaw.default : null,
            label: typeof fieldRaw.label === "string" ? fieldRaw.label : fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
          });
        });
      }

      result.database.tables.push(table);
    });
  }

  const tableNames = result.database.tables.map((t: any) => t.name);

  // 4. API Block
  if (typeof raw.api !== "object" || raw.api === null || !Array.isArray(raw.api.endpoints)) {
    warn("api", "api block or endpoints list missing/invalid. Defaulting to empty list.");
    result.api = { endpoints: [] };
  } else {
    result.api = { endpoints: [] };
    raw.api.endpoints.forEach((epRaw: any, epIndex: number) => {
      const path = `api.endpoints[${epIndex}]`;
      if (!epRaw || typeof epRaw !== "object") {
        warn(path, "Endpoint definition must be an object. Skipping endpoint.");
        return;
      }

      let epPath = typeof epRaw.path === "string" ? epRaw.path.trim() : "";
      if (!epPath.startsWith("/")) {
        epPath = "/" + epPath;
        warn(`${path}.path`, `Path must start with '/'. Coerced to '${epPath}'.`);
      }

      const method = typeof epRaw.method === "string" ? epRaw.method.trim().toUpperCase() : "GET";
      const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
      if (!validMethods.includes(method)) {
        warn(`${path}.method`, `Invalid HTTP method '${method}'. Skipping endpoint.`);
        return;
      }

      const tableName = typeof epRaw.table === "string" ? epRaw.table.trim().toLowerCase() : "";
      if (!tableNames.includes(tableName)) {
        warn(`${path}.table`, `Endpoint refers to table '${tableName}' which does not exist. Skipping endpoint.`);
        return;
      }

      const action = typeof epRaw.action === "string" ? epRaw.action.trim().toLowerCase() : "list";
      const validActions = ["list", "create", "update", "delete", "get"];
      if (!validActions.includes(action)) {
        warn(`${path}.action`, `Invalid endpoint action '${action}'. Defaulting to 'list'.`);
      }

      result.api.endpoints.push({
        path: epPath,
        method,
        table: tableName,
        action: validActions.includes(action) ? action : "list",
        auth: typeof epRaw.auth === "boolean" ? epRaw.auth : true,
        pagination: typeof epRaw.pagination === "boolean" ? epRaw.pagination : false,
        filters: Array.isArray(epRaw.filters) ? epRaw.filters.filter((f: any) => typeof f === "string") : [],
      });
    });
  }

  // 5. UI Block
  if (typeof raw.ui !== "object" || raw.ui === null || !Array.isArray(raw.ui.pages)) {
    warn("ui", "ui block or pages list missing/invalid. Falling back to default dashboard page.");
    result.ui = { ...DEFAULTS.ui };
  } else {
    result.ui = { pages: [] };
    raw.ui.pages.forEach((pageRaw: any, pIndex: number) => {
      const path = `ui.pages[${pIndex}]`;
      if (!pageRaw || typeof pageRaw !== "object") {
        warn(path, "Page definition must be an object. Skipping page.");
        return;
      }

      let route = typeof pageRaw.route === "string" ? pageRaw.route.trim() : "";
      if (!route.startsWith("/")) {
        route = "/" + route;
        warn(`${path}.route`, `Page route must start with '/'. Coerced to '${route}'.`);
      }

      const page: any = {
        route,
        title: typeof pageRaw.title === "string" ? pageRaw.title.trim() : "Page " + pIndex,
        icon: typeof pageRaw.icon === "string" ? pageRaw.icon.trim() : "Layout",
        showInNav: typeof pageRaw.showInNav === "boolean" ? pageRaw.showInNav : true,
        components: [],
      };

      if (Array.isArray(pageRaw.components)) {
        pageRaw.components.forEach((compRaw: any, cIndex: number) => {
          const cPath = `${path}.components[${cIndex}]`;
          if (!compRaw || typeof compRaw !== "object") {
            warn(cPath, "Component must be an object. Skipping component.");
            return;
          }

          const compId = typeof compRaw.id === "string" ? compRaw.id.trim() : `comp_${pIndex}_${cIndex}`;
          const type = typeof compRaw.type === "string" ? compRaw.type.trim().toLowerCase() : "unknown";
          const table = typeof compRaw.table === "string" ? compRaw.table.trim().toLowerCase() : undefined;

          if (table && !tableNames.includes(table)) {
            warn(`${cPath}.table`, `Component refers to table '${table}' which does not exist in configuration.`);
          }

          page.components.push({
            id: compId,
            type,
            table,
            config: typeof compRaw.config === "object" && compRaw.config !== null ? compRaw.config : {},
          });
        });
      }

      result.ui.pages.push(page);
    });

    if (result.ui.pages.length === 0) {
      warn("ui.pages", "No valid pages parsed. Falling back to default dashboard page.");
      result.ui = { ...DEFAULTS.ui };
    }
  }

  // 6. Features Block
  if (!Array.isArray(raw.features)) {
    result.features = [];
  } else {
    const validFeatures = ["csv_import", "notifications", "export_github", "localization", "multi_auth"];
    result.features = raw.features.filter((f: any) => {
      const isValid = validFeatures.includes(f);
      if (!isValid) warn("features", `Skipping unknown feature '${f}'.`);
      return isValid;
    });
  }

  // 7. Notifications Block
  if (typeof raw.notifications !== "object" || raw.notifications === null) {
    result.notifications = { triggers: [] };
  } else {
    result.notifications = { triggers: [] };
    if (Array.isArray(raw.notifications.triggers)) {
      raw.notifications.triggers.forEach((trigRaw: any, tIndex: number) => {
        const path = `notifications.triggers[${tIndex}]`;
        if (!trigRaw || typeof trigRaw !== "object") {
          warn(path, "Trigger definition must be an object. Skipping.");
          return;
        }

        const onEvent = typeof trigRaw.on === "string" ? trigRaw.on.trim().toLowerCase() : "";
        const validEvents = ["record_created", "record_updated", "record_deleted", "user_signup"];
        if (!validEvents.includes(onEvent)) {
          warn(`${path}.on`, `Invalid event hook '${onEvent}'. Skipping trigger.`);
          return;
        }

        const type = typeof trigRaw.type === "string" ? trigRaw.type.trim().toLowerCase() : "in_app";
        const validTypes = ["in_app", "email"];
        if (!validTypes.includes(type)) {
          warn(`${path}.type`, `Invalid notification delivery type '${type}'. Defaulting to 'in_app'.`);
        }

        result.notifications.triggers.push({
          on: onEvent,
          type: validTypes.includes(type) ? type : "in_app",
          message: typeof trigRaw.message === "string" ? trigRaw.message.trim() : "Operation executed successfully.",
        });
      });
    }
  }

  result._warnings = warnings;
  return result as NormalizedConfig;
}
