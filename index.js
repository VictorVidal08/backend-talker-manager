const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// ref async function: https://nodejs.dev/learn/reading-files-with-nodejs

const talkers = async () => {
  try {
    const data = await fs.readFile('./talker.json', { encoding: 'utf8' });
    // console.log(data);
    return JSON.parse(data);
  } catch (err) {
    // console.log(err);
    return err;
  }
};

talkers();

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_req, res) => {
  const talkersResponse = await talkers();
  // console.log(talkersResponse);
  if (talkersResponse.length === 0) {
    return res.status(HTTP_OK_STATUS).json([]);
  }
  return res.status(HTTP_OK_STATUS).json(talkersResponse);
});

app.listen(PORT, () => {
  console.log('Online');
});
