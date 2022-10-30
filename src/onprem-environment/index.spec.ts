import { SchematicTestRunner, UnitTestTree } from "@angular-devkit/schematics/testing";

const collectionPath = require.resolve("../collection.json");

const NUMBER_OF_SCAFFOLDED_FILES = 27;

describe("process-env", () => {
  let appTree: UnitTestTree;


  async function getWorkspaceTree(appName = "may-app"){
    const ngRunner = new SchematicTestRunner("@schematics/angular", "");

    const workspaceOptions = {
      name: "workspace",
      newProjectRoot: "projects",
      version: "6.0.0",
    };

    const appOptions = {
      name: appName,
      inlineTemplate: false,
      routing: false,
      skipTests: false,
      skipPackageJson: false
    };

    appTree = await ngRunner
      .runSchematicAsync("workspace", workspaceOptions)
      .toPromise();
    appTree = await ngRunner
      .runSchematicAsync("application", appOptions, appTree)
      .toPromise();

    return appTree;
  }


  it("works", async () => {

    const runner = new SchematicTestRunner("schematics", collectionPath);

    const tree = await runner
      .runSchematicAsync("ng-add", {}, await getWorkspaceTree())
      .toPromise();
    expect(tree.files.length).toEqual(NUMBER_OF_SCAFFOLDED_FILES);
  });
});
