import { EnvProcessor } from "./processor";
import { OnPremOptions } from "./schema";

describe('processor', () => {
  const options: OnPremOptions = {
    config: 'my-config-name',
    project: "art"

  };
  const processor = new EnvProcessor(options);

  beforeEach(() => {

  });
  it('Look For Base Json Path In Angular.json', () => {
    processor.lookForBaseJsonPathInNG()
  })
});
