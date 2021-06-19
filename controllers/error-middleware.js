const errorMiddleware = (error, req, res, next) => {
  if (error.logMessage) {
    console.log(new Date(), error.logMessage);
  }
  res.send({
    error: {
      code: error.code,
      msg: error.msg,
    },
  }).status(error.status);
}

module.exports = errorMiddleware;