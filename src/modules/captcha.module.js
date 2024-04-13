const generateRandomNumbers = (numberCount) => {
  const numbers = [];
  for (let index = 0; index < numberCount; index++) numbers.push(Math.floor(Math.random() * 10000) + 1);
  return numbers;
};

const getCaptcha = () => {
  const numbers = generateRandomNumbers(5);
  const selectedNumber = numbers[Math.floor(Math.random() * numbers.length)];

  return {
    numbers,
    answer: selectedNumber,
  };
};

module.exports = { getCaptcha };
