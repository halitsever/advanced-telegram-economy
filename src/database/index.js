const typeorm = require("typeorm");

const dataSource = new typeorm.DataSource({
  type: "better-sqlite3",
  database: "data.sqlite",
  synchronize: true,
  entities: [require("./entity/user.entitiy"), require("./entity/product.entity"), require("./entity/coupon.entity")],
});

dataSource.initialize();

module.exports = dataSource;
