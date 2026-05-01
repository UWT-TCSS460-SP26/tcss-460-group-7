module.exports = {
  apiReference: () => (_request, response) => {
    response.status(200).send('Scalar mock');
  },
};
