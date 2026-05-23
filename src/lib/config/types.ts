export interface AppConfig {
  app?: {
    name?: string;
    description?: string;
    language?: "en" | "hi" | "ar" | "fr" | "es";
    theme?: "dark" | "light" | "system";
    primaryColor?: string;
    logo?: string;
  };
  auth?: {
    methods?: Array<"email" | "google" | "github">;
    allowSignup?: boolean;
    ui?: {
      logo?: string;
      primaryColor?: string;
      welcomeMessage?: string;
    };
  };
  database?: {
    tables?: Array<{
      name: string;
      displayName?: string;
      fields: Array<{
        name: string;
        type: "string" | "number" | "boolean" | "date" | "email" | "url" | "text";
        required?: boolean;
        unique?: boolean;
        default?: any;
        label?: string;
      }>;
    }>;
  };
  api?: {
    endpoints?: Array<{
      path: string;
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      table: string;
      action: "list" | "create" | "update" | "delete" | "get";
      auth?: boolean;
      pagination?: boolean;
      filters?: string[];
    }>;
  };
  ui?: {
    pages?: Array<{
      route: string;
      title: string;
      icon?: string;
      showInNav?: boolean;
      components: Array<{
        id: string;
        type: "form" | "table" | "dashboard" | "card" | "chart" | string;
        table?: string;
        config?: Record<string, any>;
      }>;
    }>;
  };
  features?: Array<
    | "csv_import"
    | "notifications"
    | "export_github"
    | "localization"
    | "multi_auth"
  >;
  notifications?: {
    triggers?: Array<{
      on: "record_created" | "record_updated" | "record_deleted" | "user_signup";
      type: "in_app" | "email";
      message: string;
    }>;
  };
}

export interface NormalizedConfig {
  app: {
    name: string;
    description: string;
    language: "en" | "hi" | "ar" | "fr" | "es";
    theme: "dark" | "light" | "system";
    primaryColor: string;
    logo: string;
  };
  auth: {
    methods: Array<"email" | "google" | "github">;
    allowSignup: boolean;
    ui: {
      logo: string;
      primaryColor: string;
      welcomeMessage: string;
    };
  };
  database: {
    tables: Array<{
      name: string;
      displayName: string;
      fields: Array<{
        name: string;
        type: "string" | "number" | "boolean" | "date" | "email" | "url" | "text";
        required: boolean;
        unique: boolean;
        default: any;
        label: string;
      }>;
    }>;
  };
  api: {
    endpoints: Array<{
      path: string;
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
      table: string;
      action: "list" | "create" | "update" | "delete" | "get";
      auth: boolean;
      pagination: boolean;
      filters: string[];
    }>;
  };
  ui: {
    pages: Array<{
      route: string;
      title: string;
      icon: string;
      showInNav: boolean;
      components: Array<{
        id: string;
        type: "form" | "table" | "dashboard" | "card" | "chart" | string;
        table?: string;
        config: Record<string, any>;
      }>;
    }>;
  };
  features: Array<
    | "csv_import"
    | "notifications"
    | "export_github"
    | "localization"
    | "multi_auth"
  >;
  notifications: {
    triggers: Array<{
      on: "record_created" | "record_updated" | "record_deleted" | "user_signup";
      type: "in_app" | "email";
      message: string;
    }>;
  };
}
