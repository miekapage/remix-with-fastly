# remix-fastly-compute-edge-adapter

## App structure/behavior

### ./app
Remix code. Currently this is the Remix demo app. It builds into ./src/build (server) and ./public/build (client)

### ./src
Fastly code. This is any request/response handling, and is also the adapter to serve the Remix app. It builds into ./bin (vanilla js & then wasm binary) and then is compressed into ./pkg

## Getting started:

### `npm install`

This includes a Remix-based `postinstall` script that would look like `remix setup {platform}`: currently `{platform}` can be either `cloudflare-workers` or `node`. Fastly does not run in a node environment, but using cloudflare as the platform installs unnecessary dependencies.

The `postinstall` script that is run in this project ('./scripts/setup-remix-for-fastly.js') is copied from [@remix-run/dev/setup.js](https://github.com/remix-run/remix/blob/main/packages/remix-dev/setup.ts) but references an empty-ish fake library ('./@fake-remix-run/fastly) that has the structure Remix expects so that it can finish setting itself up.

The structure that is currently faked would eventually address platform needs like session storage.

### `npm run build`

THIS ONLY BUILDS FASTLY. The reasoning: under the hood, fastly cli runs the `build` script as part of `fastly compute serve`, which is the local dev server command. If a Remix build is thrown in, then during dev work, any Remix changes will result in a double build, one by Remix's watcher, and one by Fastly's `serve --watch`.

Before building, there's a `clean` to remove the Fastly build in ./bin (& ./pkg) because a new build can error silently and not replace the old build in ./bin. Saves you the heartache.

This command alone is prob not helpful locally. These are the useful ones:

#### `npm run build:prod`

Cleans out all the build artifacts and then builds everything (via the remix & fastly commands below) in production mode (the default for both Remix and Fastly via webpack).

#### `npm run build:dev`

Cleans out all the build artifacts and then builds everything under `NODE_ENV=development`

### `npm run build:remix`

Builds Remix with `remix build`, compiling `ts` from ./app into `js` in ./src/build (server) and ./public/build (client)

###  `npm run build:fastly`

0. This requires Remix to already have a build.
1. Builds Fastly via webpack, compiling `ts` from ./src into './bin/index.js'. At this point, already-built Remix is imported:
  ./src/build: imported (`* as build`) and then served directly (with no manipulation) into the request handler
  ./public/build: files imported as "asset/source" via webpack's `require.context()`, stored in an `assets` object, & served on request. compute @ edge version of "hosting" static files
2. Compiles `js` into './bin/main.wasm'
3. Packages wasm binary into './pkg/{project-name}.tar.gz'

### `npm run dev`

Runs the following in parallel:
`dev:remix`: Builds Remix in development mode then watches ./app for remix changes and rebuilds into ./src/build
`dev:fastly`: Runs the Fastly compute @ edge server locally and watches ./src for changes. This can either be a fastly code change in ./src, or remix changes that are built into ./src/build.

NOTE 1: `fastly compute serve --watch` runs the package `build` script on every rebuild. If a Remix build is part of the `build` script, it will be rebuilt twice as part of the `dev` script. (This is why there is no Remix build as part of the build script.)

NOTE 2: The "watch" directory for `fastly compute serve --watch` is hardcoded as 'src' for JavaScript. Building into ./src/build (a departure from a root ./build remix default) allows the fastly process to be aware of changes to the Remix code.

## More notes

### Logging
I built a custom `fastly.log` for server stuff (even Remix server stuff, but with the caveat that you should prob do `fastly && fastly.log` since it will end up in the client too).  Fastly puts a wrapper around `console.log` and it's pretty hard to work with. Remix client side should still be `console.log`

### Types
Lots of `@ts-ignores` with corresponding `eslint-disable this @ts-ignore`. Fastly still has a few of methods missing from the Request & Response classes that are needed for Remix apps. These are not permanent, but they are needed until Fastly adds the methods in (and fixes some types).
