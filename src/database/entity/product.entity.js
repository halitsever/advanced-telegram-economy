var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Product",
  tableName: "products",
  columns: {
    id: {
      primary: true,
      type: "int",
    },
    product: {
      type: "varchar",
    },
    user: {
      type: "int",
    },
  },
});
