const database = require("../database/index");
const userEntity = require("../database/entity/user.entitiy");
const userRepository = database.getRepository(userEntity);

const getUser = async ({ id }) => {
  const user = await userRepository.findOneBy({ id });

  if (!user) {
    const newUser = {
      id: id,
      balance: 0,
    };
    await setUser({ user: newUser });
  }

  return user;
};

const findUser = async (options) => {
  return await userRepository.find(options);
};

const setUser = async ({ user }) => {
  await userRepository.save(user);
};

module.exports = { getUser, setUser, findUser };
