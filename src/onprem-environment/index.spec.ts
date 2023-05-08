import { SchematicTestRunner, UnitTestTree } from "@angular-devkit/schematics/testing";

const collectionPath = require.resolve("../collection.json");

const NUMBER_OF_SCAFFOLDED_FILES = 21;

describe("process-env", () => {
  let appTree: UnitTestTree;


  async function getWorkspaceTree(appName = "may-app") {
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
      .runSchematic("workspace", workspaceOptions);

    appTree = await ngRunner
      .runSchematic("application", appOptions, appTree);

    return appTree;
  }


  it("works", async () => {

    const runner = new SchematicTestRunner("schematics", collectionPath);

    const tree = await runner
      .runSchematic("ng-add", {}, await getWorkspaceTree());
    expect(tree.files.length).toEqual(NUMBER_OF_SCAFFOLDED_FILES);
  });
});
