const database = require("../database/index");
const productEntity = require("../database/entity/product.entity");
const productRepository = database.getRepository(productEntity);

const isUserHaveThisProduct = async ({ id, productName }) => {
  const userProducts = await getUserProduct({ id: id });
  return userProducts.filter((el) => el.product == productName).length >= 1;
};

const getUserProduct = async ({ id }) => {
  const product = await productRepository.find({
    where: {
      user: id,
    },
  });
  return product ? product : [];
};

module.exports = { isUserHaveThisProduct, getUserProduct };
