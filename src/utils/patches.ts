/////// REQUEST PATCHES ///////

// new Request()
// Fastly seems to expect only `new Request(ExistingRequest)`
// or `new Request(url, init)` but Remix also allows
// `new Request(url, ExistingRequest)`
// This was causing POST bodies to be lost
export function modifyConstructor(
  FastlyRequest: typeof Request
): (input: RequestInfo, init: RequestInit | Request) => Request {
  return function (urlOrRequest: RequestInfo, requestOrInit: RequestInit | Request = {}) {
    if (requestOrInit instanceof FastlyRequest) {
      // ignore url parameter for now. too complicated to handle
      // can't set url (get only)
      // destructuring request loses the body
      return new FastlyRequest(requestOrInit);
    }
    return new FastlyRequest(urlOrRequest, requestOrInit);
  };
}

// Request.clone()
// required in spec, not mentioned in Fastly types
// only Response.clone is mentioned as TBD
// NOTE: remix doesn't require body stream to be duplicated
export function clone(this: Request): Request {
  return new Request(this);
}

// Request.formData()
// required in spec, not mentioned in Fastly types
class FakeFormData {
  append(key: string, value: string | undefined) {
    this[`${key}`] = value;
  }
  get(key: string) {
    return this[`${key}`];
  }
}
export async function formData(this: Request): Promise<FakeFormData | void> {
  try {
    return (await this.text()).split('&').reduce((accumulator: FakeFormData, item: string) => {
      const [key, value] = item.split('=');
      accumulator.append(key, value ? value : undefined);
      return accumulator;
    }, new FakeFormData());
  } catch {
    console.log('failed to fake formdata');
  }
}

/////// RESPONSE PATCHES ///////

// Response.statusText
// Fastly response fails Remix's isResponse
// Remix's isResponse looks for typeof statusText === 'string'
// required in spec, not mentioned in Fastly types
export const statusText = '';
