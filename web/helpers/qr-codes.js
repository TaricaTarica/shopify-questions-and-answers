import shopify from "../shopify.js";
import { questionsAndAnswersDB } from "../questions-and-answers-db.js";

/*
  The app's database stores the productId and the discountId.
  This query is used to get the fields the frontend needs for those IDs.
  By querying the Shopify GraphQL Admin API at runtime, data can't become stale.
  This data is also queried so that the full state can be saved to the database, in order to generate QR code links.
*/
const QA_ADMIN_QUERY = `
  query nodes($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        handle
        title
        images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
      }
      ... on ProductVariant {
        id
      }
    }
  }
`;

export async function getQrCodeOr404(req, res, checkDomain = true) {
  return undefined;
}

export async function getShopUrlFromRequest(req) {
  return `https://${req.query.shop}`;
}

export async function getShopUrlFromSession(req, res) {
  return `https://${res.locals.shopify.session.shop}`;
}

/*
Expected body content:

  question (string)
  questionedBy (string)
  questionedOn (string)
  productId (string)

*/
export async function parseQuestionBody(req, res) {
  return {
    question: req.body.question,
    questionedBy: req.body.questionedBy,
    questionedOn: req.body.questionedOn,
    productId: req.body.productId
  };
}

/*
  Replaces the productId with product data queried from the Shopify GraphQL Admin API
*/
export async function formatQrCodeResponse(req, res, rawCodeData) {
  const ids = [];

  /* Get every product from the database */
  rawCodeData.forEach(({ productId }) => {
    ids.push(productId);
  });

  /* Instantiate a new GraphQL client to query the Shopify GraphQL Admin API */
  const client = new shopify.api.clients.Graphql({
    session: res.locals.shopify.session,
  });

  /* Query the Shopify GraphQL Admin API */
  const adminData = await client.query({
    data: {
      query: QA_ADMIN_QUERY,

      /* The IDs that are pulled from the app's database are used to query product */
      variables: { ids },
    },
  });

  /*
    Replace the product, discount and variant IDs with the data fetched using the Shopify GraphQL Admin API.
  */
  const formattedData = rawCodeData.map((qrCode) => {
    const product = adminData.body.data.nodes.find(
      (node) => qrCode.productId === node?.id
    ) || {
      title: "Deleted product",
    };

    const discountDeleted =
      qrCode.discountId &&
      !adminData.body.data.nodes.find((node) => qrCode.discountId === node?.id);

    /*
      A user might create a QR code with a discount code and then later delete that discount code.
      For optimal UX it's important to handle that edge case.
      Use mock data so that the frontend knows how to interpret this QR Code.
    */
    if (discountDeleted) {
      questionsAndAnswersDB.update(qrCode.id, {
        ...qrCode,
        discountId: "",
        discountCode: "",
      });
    }

    /*
      Merge the data from the app's database with the data queried from the Shopify GraphQL Admin API
    */
    const formattedQRCode = {
      ...qrCode,
      product,
      discountCode: discountDeleted ? "" : qrCode.discountCode,
    };

    /* Since product.id already exists, productId isn't required */
    delete formattedQRCode.productId;

    return formattedQRCode;
  });

  return formattedData;
}

export async function getProductInfoForEachQuestion(questions, res) {
  const uniqueProductsIds = [...new Set(questions.map((question) => question.productId))];

  const products = await shopify.api.rest.Product.all({
    session: res.locals.shopify.session,
    ids: uniqueProductsIds.toString(),
    fields: "id,images,title",
  });

  questions.forEach(question => {
    question['product'] = products.find(product => product.id == question.productId);
  });

  return questions;
}