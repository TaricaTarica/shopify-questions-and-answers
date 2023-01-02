export default function applyQrCodePublicEndpoints(app) {

  
  app.get("/public-api/question", async (req, res) => {
    const jsonObject = { content: "proxy be working" };
    res.status(200).send(jsonObject);
  });

}