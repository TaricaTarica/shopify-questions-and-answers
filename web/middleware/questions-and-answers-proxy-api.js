import { QRCodesDB } from "../questions-and-answers-db.js";
import {
  getShopUrlFromRequest,
  parseQuestionBody,
} from "../helpers/qr-codes.js";

export default function applyQuestionsAndAnswersPublicEndpoints(app) {

  app.get("/proxy-api/questions", async (req, res) => {
    const jsonObject = { content: "proxy be working" };
    res.status(200).send(jsonObject);
  });

  app.post("/proxy-api/questions", async (req, res) => {
    try {
      const question = await QRCodesDB.create({
        ...(await parseQuestionBody(req)),
        shopDomain: await getShopUrlFromRequest(req),
      });
      res.status(201).send(question);
    } catch (error) {
      console.log('error: ', error);
      res.status(500).send(error.message);
    }
  });

}