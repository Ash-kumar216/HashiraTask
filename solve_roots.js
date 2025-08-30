const fs = require("fs");
const path = require("path");

// Lagrange interpolation
function lagrangeInterpolation(points, k) {
  let coeffs = new Array(k).fill(0);

  for (let i = 0; i < k; i++) {
    let xi = points[i][0];
    let yi = points[i][1];

    let term = new Array(k).fill(0);
    term[0] = 1;

    let denom = 1;

    for (let j = 0; j < k; j++) {
      if (i !== j) {
        let xj = points[j][0];

        // Multiply term polynomial by (x - xj)
        for (let d = k - 1; d > 0; d--) {
          term[d] = term[d] * (-xj) + (term[d - 1] || 0);
        }
        term[0] *= -xj;

        denom *= (xi - xj);
      }
    }

    let scale = yi / denom;
    for (let d = 0; d < k; d++) {
      coeffs[d] += term[d] * scale;
    }
  }

  return coeffs;
}

// Process a single JSON input file
function processFile(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const n = parseInt(data.keys.n);
    const k = parseInt(data.keys.k);

    let points = [];
    for (let i = 1; i <= k; i++) {
      let base = parseInt(data[i.toString()].base);
      let valueStr = data[i.toString()].value;
      let yi = parseInt(valueStr, base);
      points.push([i, yi]);
    }

    let coeffs = lagrangeInterpolation(points, k);

    let outputFile = `output_${path.basename(filePath, ".json")}.txt`;
    fs.writeFileSync(outputFile, coeffs.join(", "));

    console.log(`✅ Processed ${filePath} → ${outputFile}`);
  } catch (err) {
    console.error(`❌ Error processing ${filePath}:`, err.message);
  }
}

// Run on all JSON files in folder
fs.readdirSync(".")
  .filter(file => file.endsWith(".json"))
  .forEach(file => processFile(file));
