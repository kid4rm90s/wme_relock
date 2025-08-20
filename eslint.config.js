module.exports = [
  // Configuration for Node.js files (like this config file)
  {
    files: ["*.config.js", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly"
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    }
  },
  // Configuration for userscript files
  {
    files: ["*.user.js", "wme-relock.user.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // Userscript/Greasemonkey globals
        GM_info: "readonly",
        GM_xmlhttpRequest: "readonly",
        GM_addStyle: "readonly",
        unsafeWindow: "readonly",
        getWmeSdk: "readonly",
        
        // Browser globals
        window: "readonly",
        document: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        alert: "readonly",
        confirm: "readonly",
        localStorage: "readonly",
        
        // Waze Map Editor globals (that might be accessed via unsafeWindow)
        W: "readonly",
        WazeWrap: "readonly",
        OpenLayers: "readonly",
        $: "readonly",
        jQuery: "readonly"
      }
    },
    rules: {
      // Essential error prevention rules
      "no-undef": "error",              // Disallow undeclared variables
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Warn about unused variables, ignore those starting with _
      "no-dupe-args": "error",          // Disallow duplicate arguments in function definitions
      "no-dupe-keys": "error",          // Disallow duplicate keys in object literals
      "no-unreachable": "error",        // Disallow unreachable code
      "no-redeclare": "warn",           // Warn about variable redeclaration
      
      // Variable and scope rules
      "no-global-assign": "error",      // Disallow assignment to native objects
      "no-implicit-globals": "error",   // Disallow declarations in global scope
      "no-shadow": "warn",              // Disallow variable shadowing
      "no-shadow-restricted-names": "error", // Disallow shadowing restricted names
      "block-scoped-var": "error",      // Treat var as block scoped
      "no-use-before-define": ["error", {
        "functions": false,             // Allow function hoisting
        "classes": true,
        "variables": true
      }],
      
      // Code quality rules
      "no-delete-var": "error",         // Disallow deleting variables
      "no-label-var": "error",          // Disallow labels that share names with variables
      "prefer-const": "warn",           // Prefer const for variables that are never reassigned
      "no-var": "warn",                 // Prefer let/const over var
      
      // Userscript specific adjustments
      "no-console": "off",              // Allow console for userscript debugging
      "no-alert": "warn",               // Warn on alert usage
      "strict": ["error", "function"],  // Require strict mode in functions
      "no-implied-eval": "error",       // Disallow implied eval
      "no-eval": "error"                // Disallow eval
    }
  },
  {
    // Special rules for userscript header comments
    files: ["*.user.js"],
    rules: {
      "spaced-comment": "off"  // Allow userscript headers without spaces
    }
  }
];
