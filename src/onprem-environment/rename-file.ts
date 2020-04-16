import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";

export function renameFile(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    console.log(tree)
    // tree.rename(tree.)
    return tree;
  }
}
