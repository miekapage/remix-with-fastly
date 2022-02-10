import type { ServerBuild, ServerPlatform } from '@remix-run/server-runtime';
import { createRequestHandler } from '@remix-run/server-runtime';
import { ServerMode } from '@remix-run/server-runtime/mode';

import assets from './utils/assets';

export function createEventHandler({
  build,
  getLoadContext: _getLoadContext, // not sure what we can do w load context yet
  mode, // remix will default to ServerMode.Production if undefined
}: {
  build: ServerBuild;
  getLoadContext?: () => unknown;
  mode?: ServerMode;
}): (event: FetchEvent) => void {
  // matches what cloudlare passes in as platform.
  // the rest of the adaptors use { formatServerError: node.formatServerError }
  const platform: ServerPlatform = {};

  // make sure request handler is already defined for prod
  // but if dev env, it will be redefined (once) in handleEvent
  let requestHandler = createRequestHandler(build, platform, mode);
  let checkedEnvironment = !!mode;

  const handleEvent = async (event: FetchEvent): Promise<Response> => {
    // this is the first chance we have to determine that fastly is running locally,
    // out-of-the-box. the rest of the remix adaptors expect to have env variables when
    // the custom request handler is first created above. maybe we can manually define
    // a separate flag earlier when we run dev.
    if (!checkedEnvironment) {
      checkedEnvironment = true;
      if (fastly.env.get('FASTLY_HOSTNAME') === 'localhost') {
        requestHandler = createRequestHandler(build, platform, ServerMode.Development);
      }
    }

    const { request } = event;
    const { pathname } = new URL(request.url);
    const asset = assets[`${pathname}`];
    if (asset) {
      return new Response(asset.source, {
        status: 200,
        headers: new Headers({ 'content-type': asset.type }),
      });
    }

    return requestHandler(request);
  };

  return (event: FetchEvent) => event.respondWith(handleEvent(event));
}
