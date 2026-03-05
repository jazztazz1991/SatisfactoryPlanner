import fs from "fs";
import path from "path";
import https from "https";

const DATA_URL =
  "https://raw.githubusercontent.com/greeny/SatisfactoryTools/dev/data/data.json";
const OUTPUT_PATH = path.resolve(
  process.cwd(),
  "db/data/satisfactory-data.json"
);

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode} from ${url}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => undefined);
        reject(err);
      });
  });
}

async function main() {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  console.log(`Downloading game data from:\n  ${DATA_URL}`);
  await download(DATA_URL, OUTPUT_PATH);
  const stat = fs.statSync(OUTPUT_PATH);
  console.log(
    `Saved to ${OUTPUT_PATH} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
