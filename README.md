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

It is also possible to use noflo-swagger-client as a library, registering NoFlo components programmatically. This is useful for example when utilizing [noflo-nodejs as a library](https://github.com/noflo/noflo-nodejs#embedding-runtime-in-an-existing-service).

```javascript
const loader = new noflo.ComponentLoader(process.cwd());
const def = {
  url: 'http://petstore.swagger.io/v2/swagger.json',
};
loader.listComponents(() => {
  registerSwaggerComponents(loader, 'petstore', def))
    .then(() => {
      console.log('Components registered!');
    });
});
```

## Assembly line components

This library can also create [NoFlo Assembly Line](https://github.com/noflo/noflo-assembly/wiki) compatible components. Just add `assembly: true` to the API definition parameters.

In `package.json`:

```json
{
  "dependencies": {
    ...
  },
  "noflo": {
    "swagger": {
      "petstore": {
        "url": "https://petstore3.swagger.io/api/v3/openapi.json",
        "assembly": true
      }
    }
  }
}
```

These components will only contain `in` and `out` ports. The key `parameter` of the input message will be used as request parameters, and the API response will be written as the message parameter `response`. Error handling is handled using the [noflo-assembly conventions](https://github.com/noflo/noflo-assembly/wiki/Error-handling).

## Populating authorization data from environment variables

In addition to [registering authorization keys](https://github.com/swagger-api/swagger-js/blob/2b950ee77f814069b9f1d92a422eeb56c47ac2b5/docs/migration/migration-2-x-to-3-x.md#authorizations) via the API definition passed to NoFlo Swagger Client initially, it can also be done via environment variables. This is especially useful when generating the components in the declarative way.

The environment variables supported are formatted with `SWAGGER_<NAMESPACE>_<KEYNAME>`.
For example to populate the API key to the pet store API used as example above, you'd set it with `SWAGGER_PETSTORE_APIKEY`. With this, all components needing API key authentication will set the `api_key` header to the value from the environment variable.

## Component icons

Custom icon can be set for a library by adding an `icon` key to the definition.

## Changes

* 0.2.2 (2020-09-16)
  - Added custom icon support
* 0.2.1 (2020-09-16)
  - Added support for populating authorization keys from environment variables
* 0.2.0 (2020-09-15)
  - Added support for generating [NoFlo Assembly Line](https://github.com/noflo/noflo-assembly/wiki) components
* 0.1.1 (2020-09-11)
  - Improved test coverage
* 0.1.0 (2020-09-09)
  - Initial release
