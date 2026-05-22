import { execa } from "execa";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const $ = execa({
  verbose: "full",
});
(async () => {
  await $`yarn changelogen --bump`;

  const packageJson = JSON.parse(
    readFileSync(join(__dirname, "../package.json")),
  );

  // await Promise.all([
  //   $('yarn', ['workspace' ,'@mobilitycare/mobilitycare', 'cap:configure', '-y'], { verbose: "full", env: { VERSION: packageJson.version } }),
  //   $('yarn', ['workspace' ,'@mobilitycare/natalconnect', 'cap:configure', '-y'], { verbose: "full", env: { VERSION: packageJson.version } }),
  // ])

  const tag = `v${packageJson.version}`;
  const commitMessage = `chore(release): ${tag}`;

  await $`git add .`;
  await $`git commit -m ${commitMessage}`;
  await $`git tag -am ${tag} ${tag}`;
})();
