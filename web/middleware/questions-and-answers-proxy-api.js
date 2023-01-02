export default function applyQuestionsAndAnswersPublicEndpoints(app) {

  app.get("/proxy-api/question", async (req, res) => {
    const jsonObject = { content: "proxy be working" };
    res.status(200).send(jsonObject);
  });

}