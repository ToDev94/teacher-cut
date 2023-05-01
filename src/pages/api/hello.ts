// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse, PageConfig } from "next";
const formidable = require("formidable");
import fs from "fs";
const fsp = require("fs").promises;
import path from "path";
const PDFDocument = require("pdfkit");

const XLSX = require("xlsx");

const dataDirPath = path.join(__dirname);
const dataStoreDir = path.join(__dirname, "data.json");

const formidableConfig = {
  keepExtensions: true,
  uploadDir: dataDirPath,

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
  if (req.method === "POST") {
    const dataFilePath = await formidablePromise(req, formidableConfig);

    const teacherData = await readDirXLSXPromise(dataFilePath);
    await CreateFilePromise(dataStoreDir, JSON.stringify(teacherData));
    const teacherStrData = JSON.stringify(teacherData);
    return res.status(201).end();
  }
  const pdfDoc = new PDFDocument();
  try {
    const biData = await readJSONFilePromise(dataStoreDir);
    const teacherData = JSON.parse(JSON.stringify(biData));

    pdfDoc.text(teacherData[0].name);

    res.writeHead(200, { "Content-Type": "application/pdf" });

    pdfDoc.pipe(res);
  } catch (err) {
    console.log(err);
  }
  pdfDoc.end();
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

      return resolve(files.file.filepath);
    });
  });
}

function readJSONFilePromise(dir) {
  return new Promise((resolve, reject) => {
    fs.readFile(dir, (err, data) => {
      if (err) return reject(err);

      return resolve(data.toString());
    });
  });
}

function readDirXLSXPromise(dir) {
  return new Promise((resolve, reject) => {
    fs.readFile(dir, (err, data) => {
      if (err) return reject(err);

      const spreadsheet = XLSX.read(data);

      const teacherdata = XLSX.utils.sheet_to_json(
        spreadsheet.Sheets[spreadsheet.SheetNames[0]]
      );
      fs.unlinkSync(dir);
      return resolve(teacherdata);
    });
  });
}

function CreateFilePromise(dir, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dir, content, (err) => {
      if (err) return reject(err);

      return resolve("Done!");
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
