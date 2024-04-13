let caseCount = 0;

const caseStore = () => {
  return {
    increase() {
      caseCount++;
    },
    reset() {
      caseCount = 0;
    },
    get() {
      return caseCount;
    },
  };
};

module.exports = caseStore();
