// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse, PageConfig } from "next";
const formidable = require("formidable");
import fs from "fs";
const fsp = require("fs").promises;
import path from "path";
const PDFDocument = require("pdfkit");

import reader from "xlsx";

const formidableConfig = {
  keepExtensions: true,
  uploadDir: "./uploads",

  multiples: false,
};

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await formidablePromise(req, formidableConfig);
  // const dirPath = path.join(__dirname, "uploads");
  /*  const data = await readDirPromise("./uploads");

  const dataPath = `./uploads/${data[0]}`;

  const sheetFile = reader.readFile(dataPath);

  const sheetsData = reader.utils.sheet_to_json(
    sheetFile.Sheets[sheetFile.SheetNames[0]]
  );
  generatePdfDoc(res); */
  const stat = fs.statSync("./downloads/output.pdf");

  const readFileStream = fs.createReadStream("./downloads/output.pdf");

  res.writeHead(200, { "Content-Type": "application/pdf" });

  readFileStream.pipe(res);
}

// const saveFile = async (file) => {
//   const data = fs.readFileSync(file.path);
//   fs.writeFileSync(`./public/${file.name}`, data);
//   await fs.unlinkSync(file.path);
//   return;
// };

function formidablePromise(req, opts) {
  return new Promise((resolve, reject) => {
    const form = formidable(opts);

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      return resolve({ fields, files });
    });
  });
}

function readDirPromise(dir) {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) return reject(err);

      return resolve(files);
    });
  });
}

function generatePdfDoc(res) {
  const opts = {
    type: "docx",
    pageMargins: "590",
    pageSize: "A4",
    author: "taoufik",
    creator: "taoufik",
    description: "teacher pay cut report",
    title: "pay cut notification",
  };

  const doc = new PDFDocument({ compress: false });

  doc.fontSize(25).text("Some text with an embedded font!", 100, 100);

  return doc.pipe(fs.createWriteStream("./downloads/output.pdf"));
}
