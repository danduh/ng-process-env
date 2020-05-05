import { EnvProcessor } from "./processor";
import { OnPremOptions } from "./schema";

const ANGULAR_JSON_MOCK = {
  projects: {
    testApp: {
      architect: {
        build: {
          configurations: {
            testConfig: {
              fileReplacements: [
                {
                  replace: "test/path/to/file/environment.ts",
                  with: "test/path/to/file/environment.ts"
                }
              ]
            }
          }
        }
      }
    }
  }
};

describe('processor', () => {
  const options: OnPremOptions = {
    config: 'my-config-name',
    project: "testApp"

  };
  let processor: EnvProcessor;

  beforeEach(() => {
    processor = new EnvProcessor(options);
  });

  it('Look For Base Json Path In Angular.json', () => {
    let path = processor.lookForBaseJsonPathInNG(ANGULAR_JSON_MOCK);
    expect(path).toBe("test/path/to/file");
  })
});
