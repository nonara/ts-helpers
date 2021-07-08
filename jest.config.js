module.exports = {
  testEnvironment: "node",
  preset: 'ts-jest',
  testRegex: '.*(test|spec)\\.tsx?$',
  moduleFileExtensions: [ 'ts', 'tsx', 'js', 'jsx', 'json', 'node' ],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/test/tsconfig.json'
    }
  },
  modulePaths: [ "<rootDir>" ],
  roots: [ '<rootDir>' ]
}
