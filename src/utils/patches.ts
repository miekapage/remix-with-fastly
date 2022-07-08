/////// REQUEST PATCHES ///////

// new Request()
// Fastly seems to expect only `new Request(ExistingRequest)`
// or `new Request(url, init)` even tho the type says otherwise
// Remix exoects`new Request(url, ExistingRequest)`
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

// Request.formData()
// required in spec, type exists, doesn't seem to be implemented
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
