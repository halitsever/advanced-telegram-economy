var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "Coupon",
  tableName: "coupons",
  columns: {
    id: {
      primary: true,
      type: "int",
      isGenerated: true,
    },
    code: {
      type: "varchar",
    },
    user: {
      type: "int",
    },
  },
});
