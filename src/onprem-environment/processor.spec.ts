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
const ANGULAR_JSON_MOCK_ER = {
  projects: {
    testApp: {
      architect: {
        build: {
          configurations: {}
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
    let envPath = processor.lookForBaseJsonPathInNG(ANGULAR_JSON_MOCK);
    expect(envPath.path).toBe("test/path/to/file");
  });

  it('Look For Base Json Path In Angular.json should fail', () => {
    let envPath = processor.lookForBaseJsonPathInNG(ANGULAR_JSON_MOCK_ER);
    expect(envPath.path).toBe(undefined);
    expect(envPath.error).toBeDefined();
  });

});
