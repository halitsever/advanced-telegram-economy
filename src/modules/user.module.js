const database = require("../database/index");
const userEntity = require("../database/entity/user.entitiy");
const userRepository = database.getRepository(userEntity);

/** Returns the user, creating the record on first use. TypeORM drops undefined where values and would match any row, hence the id check. */
const getUser = async ({ id }) => {
  if (id === undefined || id === null) return null;
  const user = await userRepository.findOneBy({ id });
  if (user) return user;

  const newUser = { id, balance: 0, last_payback_time: 0, case: false };
  await setUser({ user: newUser });
  return newUser;
};

const findUser = async (options) => {
  return await userRepository.find(options);
};

const setUser = async ({ user }) => {
  await userRepository.save(user);
};

module.exports = { getUser, setUser, findUser };
