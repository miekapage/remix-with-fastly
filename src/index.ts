import type { ServerBuild } from '@remix-run/server-runtime';

import { createEventHandler } from './create-event-handler';
import customLog from './utils/custom-log';
import { clone, formData, modifyConstructor, statusText } from './utils/patches';

// eslint-disable-next-line import/no-unresolved
import * as build from './build';

fastly.log = customLog;

const FastlyRequest = Request;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Cannot assign to 'Request' because it is a class. ts(2629)
Request = modifyConstructor(FastlyRequest);
Request.prototype = FastlyRequest.prototype;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Property 'clone' does not exist on type 'Request'. ts(2339)
Request.prototype.clone = clone;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Property 'formData' does not exist on type 'Request'. ts(2339)
Request.prototype.formData = formData;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Property 'statusText' does not exist on type 'Response'. ts(2339)
Response.prototype.statusText = statusText;

addEventListener('fetch', createEventHandler({ build: build as unknown as ServerBuild }));
