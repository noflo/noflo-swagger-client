noflo-swagger-client
====================

This library can be used for generating NoFlo components for accessing any REST API described by [Swagger/OpenAPI](https://swagger.io). Each API method will get its own component, with the top-level parameters becoming separate inports.

## Declarative usage

In Node.js NoFlo projects it is possible to register Swagger files for component generation by declaring them in your `package.json`. Example:

```json
{
  "version": "...",
  "dependencies": {
    ...
  },
  "noflo": {
    "swagger": {
      "petstore": {
        "url": "https://petstore3.swagger.io/api/v3/openapi.json"
      }
    }
  }
}
```

This would generate a component for each [Swagger pet store](https://petstore3.swagger.io/) method using the `petstore` namespace. So you'd get components like `petstore/FindPetByID`.

## Usage as a library

TODO
