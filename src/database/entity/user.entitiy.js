var EntitySchema = require("typeorm").EntitySchema;

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
    },
    balance: {
      default: 0,
      type: "int",
    },
    last_payback_time: {
      default: 0,
      type: "int",
    },
    case: {
      default: false,
      type: "boolean",
    },
  },
});
