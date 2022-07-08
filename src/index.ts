/// <reference types="@fastly/js-compute" />

import { createRequestHandler } from '@remix-run/cloudflare';
import type * as Build from '@remix-run/dev/server-build';

import * as build from './build';
import assets from './utils/assets';
import customLog from './utils/custom-log';
import { formData, modifyConstructor } from './utils/patches';

fastly.log = customLog;

const FastlyRequest = Request;
// @ts-ignore Cannot assign to 'Request' because it is a class. ts(2629)
Request = modifyConstructor(FastlyRequest);
Request.prototype = FastlyRequest.prototype;

// @ts-ignore Property 'formData' does not exist on type 'Request'. ts(2339)
Request.prototype.formData = formData;

addEventListener('fetch', createEventHandler());

function createEventHandler(): (event: FetchEvent) => void {
  const requestHandler = createRequestHandler(build as typeof Build, 'development');

  const handleEvent = async (event: FetchEvent): Promise<Response> => {
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
