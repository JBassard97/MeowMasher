// NODE.JS
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { MagentaText } = require("jbassard97nodecolors");

const outputPath = path.join(
  __dirname,
  "..",
  "dev",
  "outputs",
  "subUpgrades.pdf",
);
const inputPath = path.join(__dirname, "..", "src", "data", "subUpgrades.json");

const ROW_TYPE_COLORS = {
  clickPowerAdder: "#92ccf6",
  clickPowerMultiplier: "#bb8ffd",
  upgradeMultiplier: "#b1feb7",
  percentOfMpsClickAdder: "#fcddaa",
  catAdopt: "#feb2cb",
  livingRoom: "#ed78fe",
  thousandFingers: "yellow",
};

// Ensure output directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.readFile(inputPath, "utf-8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const jsonData = JSON.parse(data);
  // const sortedJsonData = jsonData.sort((a, b) => a.cost - b.cost);

  generatePdf(jsonData);
});

function generatePdf(data) {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 40,
  });

  doc.pipe(fs.createWriteStream(outputPath));

  doc
    .fontSize(18)
    .fillColor("#000")
    .text(`Sub Upgrades (${data.length})`, { align: "center" });
  doc.moveDown(1);

  const columns = Object.keys(data[0]);

  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Slightly shrink table width and center it
  const tableWidth = pageWidth * 0.96;
  const tableLeft = doc.page.margins.left + (pageWidth - tableWidth) / 2;

  const columnWidth = tableWidth / columns.length;
  const CELL_PADDING = 6;

  let y = doc.y;

  const drawCellBorder = (x, y, w, h) => {
    doc.rect(x, y, w, h).stroke();
  };

  // --- Header drawing function ---
  function drawHeader() {
    doc.font("Helvetica-Bold").fontSize(10);

    let headerHeight = 0;

    // First pass: measure header heights
    columns.forEach((col) => {
      const textHeight = doc.heightOfString(col, {
        width: columnWidth - CELL_PADDING * 2,
      });
      headerHeight = Math.max(headerHeight, textHeight + CELL_PADDING * 2);
    });

    // Optional minimum height
    headerHeight = Math.max(headerHeight, 25);

    // Draw header cells
    columns.forEach((col, i) => {
      const x = tableLeft + i * columnWidth;
      drawCellBorder(x, y, columnWidth, headerHeight);

      doc.fillColor("#000"); // always black
      doc.text(col, x + CELL_PADDING, y + CELL_PADDING, {
        width: columnWidth - CELL_PADDING * 2,
      });
    });

    y += headerHeight;

    doc.font("Helvetica").fontSize(9); // reset for rows
  }

  // Draw initial header
  drawHeader();

  // --- Rows ---
  data.forEach((row) => {
    let maxRowHeight = 0;

    // First pass: measure heights
    columns.forEach((col) => {
      let value = row[col];

      if (typeof value === "object") {
        value = JSON.stringify(value);
      }

      const textHeight = doc.heightOfString(String(value), {
        width: columnWidth - CELL_PADDING * 2,
      });

      const cellHeight = textHeight + CELL_PADDING * 2;
      maxRowHeight = Math.max(maxRowHeight, cellHeight);
    });

    // Page break if needed
    if (y + maxRowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      drawHeader(); // repeat header
    }

    // --- Row background by type ---
    const rowColor = ROW_TYPE_COLORS[row.type];
    if (rowColor) {
      doc
        .rect(tableLeft, y, tableWidth, maxRowHeight)
        .fillOpacity(0.35)
        .fill(rowColor)
        .fillOpacity(1);
    }

    // Draw cells
    columns.forEach((col, i) => {
      const x = tableLeft + i * columnWidth;
      const rawValue = row[col];

      // Blackout undefined cells
      if (rawValue === undefined) {
        doc
          .rect(x, y, columnWidth, maxRowHeight)
          .fillOpacity(0.9)
          .fill("#000")
          .fillOpacity(1);
      }

      drawCellBorder(x, y, columnWidth, maxRowHeight);

      if (rawValue !== undefined) {
        let value = rawValue;

        if (typeof value === "object") {
          value = JSON.stringify(value);
        }

        doc.fillColor("#000"); // always black text
        doc.text(String(value), x + CELL_PADDING, y + CELL_PADDING, {
          width: columnWidth - CELL_PADDING * 2,
          align: typeof rawValue === "number" ? "right" : "left",
        });
      }
    });

    y += maxRowHeight;
  });

  doc.end();
  console.log(MagentaText("PDF generated:"), outputPath);
}
