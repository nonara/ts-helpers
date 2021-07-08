import {
  camelToSnake, CamelToSnakeOptions, getConverterOptions, snakeToCamel, SnakeToCamelOptions, truthyStr
} from '../../src';


/* ****************************************************************************************************************** *
 * Config
 * ****************************************************************************************************************** */

const testConfigs = <(SnakeToCamelOptions | CamelToSnakeOptions | undefined)[]>[
  void 0,
  { copyPrototype: true },
  { copyPrototype: true, copyMethod: 'entries' },
  { copyPrototype: true, copyMethod: 'descriptors' },
  { copyPrototype: false },
  { copyPrototype: false, copyMethod: 'entries' },
  { copyPrototype: false, copyMethod: 'descriptors' },
];


/* ****************************************************************************************************************** *
 * Helpers
 * ****************************************************************************************************************** */

class SnakeClass {
  my_method() {}
  my_prop = 'hello'
}

class CamelClass {
  myMethod() {}
  myProp = 'hello'
}

const defaultDescriptor: PropertyDescriptor = { value: true, enumerable: true, configurable: true, writable: true };

const createBaseObj = (basePropName: string, cls: typeof SnakeClass | typeof CamelClass) => Object.create(cls, {
  [basePropName]: { ...defaultDescriptor },
  'unconfigurable': { ...defaultDescriptor, configurable: false },
  'nonenumerable': { ...defaultDescriptor, enumerable: false }
});


/* ****************************************************************************************************************** *
 * Tests
 * ****************************************************************************************************************** */

describe(`Case Converters`, () => {
  describe(`String Conversion`, () => {
    test(`snakeToCamel() converts string`, () => {
      expect(snakeToCamel('my_snake_label')).toBe('mySnakeLabel');
    });

    test(`camelToSnake() converts string`, () => {
      expect(camelToSnake('myCamelLabel')).toBe('my_camel_label');
    });
  });

  describe(`Object Conversion`, () => {
    const baseSnakeObj = createBaseObj('my_base_prop', SnakeClass);
    const baseCamelObj = createBaseObj('myBaseProp', CamelClass);
    const { copyMethod: defaultCopyMethod } = getConverterOptions();

    const testConfigsMap = testConfigs.map(c => <[ string, (typeof testConfigs)[number] ]>[
      !c ? '[default]' : Object.entries(c).reduce((acc, [k,v]) => acc + `${truthyStr(acc, ', ')}${k}: ${v}`, ''),
      c
    ]);

    function testConverter(
      converterFn: typeof snakeToCamel | typeof camelToSnake,
      options?: CamelToSnakeOptions | SnakeToCamelOptions,
    )
    {
      const destCase = converterFn === snakeToCamel ? 'camel' : 'snake';
      const srcObj = destCase === 'snake' ? baseCamelObj : baseSnakeObj;
      const destObj = destCase === 'snake' ? baseSnakeObj : baseCamelObj;
      const cls = destCase === 'snake' ? CamelClass : SnakeClass;
      const expectedProto = options?.copyPrototype ? cls : Object.prototype;
      const copyMethod = options?.copyMethod ?? defaultCopyMethod;

      const res = (converterFn as Function)(srcObj, options);

      test(`Has prototype: ${expectedProto.constructor.name}`, () => {
        expect(Object.getPrototypeOf(res)).toBe(expectedProto);
      });

      test(`Copies ${copyMethod} into ${destCase} case`, () => {
        const resEntries = Object.entries(res);
        const destEntries = Object.entries(destObj);

        expect(destObj.hasOwnProperty('nonenumerable')).toBeTruthy();

        if (copyMethod === 'descriptors') {
          expect(Object.getOwnPropertyDescriptors(res)).toEqual(Object.getOwnPropertyDescriptors(destObj));
          expect(res.hasOwnProperty('nonenumerable')).toBeTruthy();
        } else {
          expect(Object.getOwnPropertyDescriptors(res)).not.toEqual(Object.getOwnPropertyDescriptors(destObj));
          expect(resEntries).toEqual(destEntries.filter(([k]) => k !== 'nonenumerable'));
          expect(res.hasOwnProperty('nonenumerable')).toBeFalsy();
        }
      });
    }

    describe(`snakeToCamel()`, () => {
      describe.each(testConfigsMap)('Options: %s', (k, options) => testConverter(snakeToCamel, options))
    });

    describe(`camelToSnake()`, () => {
      describe.each(testConfigsMap)('Options: %s', (k, options) => testConverter(camelToSnake, options))
    });
  });
});
