const { addDays, format, subDays } = require("date-fns");
exports.addDays = (lastActive, days) => {
  const now = new Date();
  let resultDate;
  let formattedResult;
  if (!lastActive) {
    resultDate = addDays(now, days);
    formattedResult = format(resultDate, "yyyy-MM-dd HH:mm:ss");
  }

  const dateLastActive = new Date(lastActive);
  if (dateLastActive > now) {
    resultDate = addDays(dateLastActive, days);
    formattedResult = format(resultDate, "yyyy-MM-dd HH:mm:ss");
  } else {
    resultDate = addDays(now, days);
    formattedResult = format(resultDate, "yyyy-MM-dd HH:mm:ss");
  }

  return new Date(formattedResult);
};
