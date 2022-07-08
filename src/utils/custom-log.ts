function getAllProperties(object: Record<PropertyKey, any>): Record<PropertyKey, any> {
  if (object.constructor.name === 'Object') {
    return object;
  } else if (object.constructor.name === 'Headers') {
    return Object.fromEntries(object as Iterable<readonly [PropertyKey, any]>);
  } else {
    let allTheKeys = Object.getOwnPropertyNames(object);
    let layer = Object.getPrototypeOf(object);
    while (layer.constructor.name !== 'Object') {
      allTheKeys = [...allTheKeys, ...Object.getOwnPropertyNames(layer)];
      layer = Object.getPrototypeOf(layer);
    }
    return allTheKeys.reduce((accumulator, key) => {
      const property = object[`${key}`];
      try {
        return {
          ...accumulator,
          [key]:
            property && typeof property === 'object' ? getAllProperties(property) : property,
        };
      } catch (error: any) {
        return {
          ...accumulator,
          [key]: `ERROR: ${error?.message}`,
        };
      }
    }, {});
  }
}

export default function customLog(...items: any[]): void {
  for (const item of items) {
    item && typeof item === 'object'
      ? console.log(JSON.stringify(getAllProperties(item), undefined, 2))
      : console.log(item);
  }
}
