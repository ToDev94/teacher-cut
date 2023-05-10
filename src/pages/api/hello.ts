// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse, PageConfig } from "next";
const formidable = require("formidable");
import fs from "fs";
import { Writable } from "stream";

import path from "path";
const PDFDocument = require("pdfkit");
const { MongoClient } = require("mongodb");

const Redis = require("ioredis");

const XLSX = require("xlsx");

const dataDirPath = path.join(__dirname);
// const dataStoreDir = path.join(process.cwd(), "data.json");

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

const redis = new Redis({
  host: "redis-15626.c16.us-east-1-2.ec2.cloud.redislabs.com",
  port: 15626,
  username: "default",
  password: "5ZnC5EzFLOb6EnxS0m5l2DQY0uLD78vE",
  retryStrategy() {
    redis.quit();
  },
});
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  redis.on("connect", () => {
    console.log("connected to redis successfully!");
  });
  if (req.method === "POST") {
    try {
      const chunks = [];
      await formidablePromise(req, {
        ...formidableConfig,
        fileWriteStreamHandler: () => fileConsumer(chunks),
      });

      const workBook = XLSX.read(Buffer.concat(chunks), { type: "buffer" });
      const data = XLSX.utils.sheet_to_json(
        workBook.Sheets[workBook.SheetNames[0]]
      );

      await redis.set("teachersData", JSON.stringify(data));

      // const teacherData = await readDirXLSXPromise(dataFilePath);

      // await CreateFilePromise(dataStoreDir, JSON.stringify(teacherData));

      return res.status(201).end();
    } catch (err) {
      console.log(err);
    }
  }

  const pdfDoc = new PDFDocument({
    size: "A4",
    margins: {
      top: 50,
      bottom: 50,
      left: 20,
      right: 50,
    },
    rlt: true,
    autoFirstPage: false,
  });

  // const data = await readJSONFilePromise(dataStoreDir);

  const data = await redis.get("teachersData");
  const dataObj = JSON.parse(data);

  const Doc = generatePdfDoc(dataObj, pdfDoc);

  res.writeHead(200, { "Content-Type": "application/pdf" });

  Doc.pipe(res);

  Doc.end();

  return;
}

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

function readJSONFilePromise(dir) {
  return new Promise((resolve, reject) => {
    fs.readFile(dir, (err, data) => {
      if (err) return reject(err);

      return resolve(JSON.parse(data.toString()));
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

const fileConsumer = (acc) => {
  const writable = new Writable({
    write: (chunk, _enc, next) => {
      acc.push(chunk);
      next();
    },
  });

  return writable;
};

function generatePdfDoc(items, pdfDoc) {
  items.forEach((item) => {
    pdfDoc.addPage();
    const text1 = "الجمهورية  الجزائرية الديمقراطية الشعبية ";

    const text2 = "مديرية التربية لولاية الوادي";
    const text3 = "ثانوية:المجاهد إبراهيم شرفي";
    const text4 = "رمز المؤسسة:...............";
    const text5 = "رمز الموظف:" + item["الرمز"];
    const text6 = "إشعار بالخصم من الراتب";
    const text7 = `يخصم من راتب السيد)ة(: ${item["الإسم"]} نفوسي`;
    const text8 = `الرتبة: ${item["الصفة"]}       الصفة: ${item["الرتبة"]} `;
    const text9 = "المــــدة";
    const text15 = ` ${item["المدة"]} أيام`;
    const text10 = "مـــــــن";
    const text11 = "الـــــــى";
    const text12 = "السبب";
    const text13 = "حرربـ.......................في:.......................";
    const listarry = ["مدير التربية", "ملف المؤسسة", "المقتصد", "المعني"];
    const text16 = item["من "];
    const text17 = item["إلى"];
    const text18 = item["السبب"];

    const fontPath = path.join(process.cwd(), "public", "ARIAL.TTF");
    pdfDoc
      .font(fontPath)
      .fontSize(16)
      .text(text1, {
        underline: true,

        align: "center",
        features: ["rtla"],
      });
    pdfDoc
      .font(fontPath)
      .fontSize(16)
      .text("وزارة التربية الوطنية", {
        underline: true,

        align: "center",
        features: ["rtla"],
      });

    pdfDoc.moveDown(1);
    pdfDoc
      .font(fontPath)
      .fontSize(14)
      .text(text2, {
        align: "right",
        continued: true,
        features: ["rtla"],
        indent: -50,
      });

    pdfDoc.font(fontPath).fontSize(14).text(text4, {
      align: "left",
      width: 30,
    });
    pdfDoc
      .font(fontPath)
      .fontSize(14)
      .text(text3, {
        align: "right",
        continued: true,
        features: ["rtla"],
        indent: -40,
      });

    pdfDoc.font(fontPath).fontSize(14).text(text5, {
      align: "left",
      width: 30,
    });

    pdfDoc.moveDown(4);

    pdfDoc
      .font(fontPath)
      .fontSize(20)
      .text(text6, {
        underline: true,

        align: "center",
        features: ["rtla"],
      });

    pdfDoc.moveDown(2);

    pdfDoc
      .font(fontPath)
      .fontSize(16)
      .text(text7, {
        align: "center",
        features: ["rtla"],
        indent: 15,
      });

    pdfDoc.moveDown(1);
    pdfDoc
      .font(fontPath)
      .fontSize(16)
      .text(text8, {
        align: "center",
        features: ["rtla"],
        continued: true,
      });

    pdfDoc.lineWidth(1);

    pdfDoc.lineCap("butt").rect(22.5, 350, 550, 100).stroke();

    pdfDoc.moveTo(22.5, 375).lineTo(572, 375).stroke();
    pdfDoc.moveTo(160, 350).lineTo(160, 450).stroke();
    pdfDoc.moveTo(297.5, 350).lineTo(297.5, 450).stroke();
    pdfDoc.moveTo(297.5, 350).lineTo(297.5, 450).stroke();
    pdfDoc.moveTo(435, 350).lineTo(435, 450).stroke();

    pdfDoc
      .font(fontPath)
      .fontSize(16)
      .text(text9, 140, 355, {
        align: "center",
        features: ["rtla"],
      });

    pdfDoc
      .font(fontPath)
      .fontSize(16)
      .text(text10, 200, 355, {
        align: "center",
        features: ["rtla"],
      });

    pdfDoc
      .font(fontPath)
      .fontSize(16)
      .text(text11, -70, 355, {
        align: "center",
        features: ["rtla"],
      });

    pdfDoc
      .font(fontPath)
      .fontSize(16)
      .text(text12, -345, 355, {
        align: "center",
        features: ["rtla"],
      });

    pdfDoc.moveDown(10);

    pdfDoc
      .font(fontPath)
      .fontSize(14)
      .text(text13, 30, 550, {
        align: "left",
        features: ["rtla"],
        link: null,
        indent: 10,
      });

    pdfDoc.moveDown(4);
    const text14 = "مدير المؤسسة";

    pdfDoc
      .font(fontPath)
      .fontSize(14)
      .text(text14, -250, 600, {
        align: "center",
        features: ["rtla"],
      });

    pdfDoc
      .font(fontPath)
      .fontSize(14)
      .text("نسخة إلى السادة:", {
        align: "right",
        features: ["rtla"],

        continued: true,
      });

    pdfDoc.moveDown(2);

    pdfDoc.list(listarry, {
      bulletRadius: 1,
    });

    pdfDoc.font(fontPath).fontSize(16).text(text15, 100, 400, {
      align: "center",

      link: null,
    });

    pdfDoc
      .font(fontPath)
      .fontSize(16)
      .text(text16, 200, 400, {
        align: "center",
        features: ["rtla"],
        link: null,
      });
    pdfDoc
      .font(fontPath)
      .fontSize(16)
      .text(text17, -50, 400, {
        align: "center",
        features: ["rtla"],
        link: null,
      });
    pdfDoc
      .font(fontPath)
      .fontSize(16)
      .text(text18, -300, 400, {
        align: "center",
        features: ["rtla"],
        link: null,
      });
  });

  return pdfDoc;
}

function reverseText(text) {
  return text.split(" ").reverse().join(" ");
}
