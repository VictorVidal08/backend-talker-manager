const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const crypto = require('crypto');
const emailValidation = require('./emailValidation');
const passwordValidation = require('./passwordvalidation');
const nameValidation = require('./nameValidation');
const ageValidation = require('./ageValidation');
const talkValidation = require('./talkValidation');
const rateValidation = require('./rateValidation');
const authValidation = require('./authorizationValidation');

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
    return err;
  }
};

function generateToken() {
  return crypto.randomBytes(8).toString('hex');
}

module.exports = generateToken;

// talkers();

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_req, res) => {
  const talkersResponse = await talkers();
  if (talkersResponse.length === 0) {
    return res.status(HTTP_OK_STATUS).json([]);
  }
  return res.status(HTTP_OK_STATUS).json(talkersResponse);
});

app.get('/talker/:id', async (req, res) => {
  const { id } = req.params;
  const talkersResponse = await talkers();
  const talkerId = await talkersResponse.find((el) => el.id === Number(id));

  if (!talkerId) return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });

  return res.status(HTTP_OK_STATUS).json(talkerId);
});

app.post('/login', emailValidation, passwordValidation, (_req, res) => {
  const token = generateToken();

  res.status(HTTP_OK_STATUS).json({ token });
});

app.post('/talker', 
  authValidation,
  nameValidation,
  ageValidation,
  talkValidation,
  rateValidation,
  async (req, res) => {
    const { name, age, talk } = req.body;
    const result = await talkers();
    console.log(result);
    const lastEl = result[result.length - 1];
  
    const newTalker = {
      id: lastEl.id + 1,
      name,
      age,
      talk,
    };
  
    const content = await fs.readFile('./talker.json', { encoding: 'utf8' });
    const data = JSON.parse(content);
    data.push(newTalker);
  
    await fs.writeFile('./talker.json', JSON.stringify(data));
    return res.status(201).json(newTalker);
});

app.put('/talker/:id', 
  authValidation,
  nameValidation,
  ageValidation,
  talkValidation,
  rateValidation,
  async (req, res) => {
  const { name, age, talk } = req.body;
  const { id } = req.params;
  // console.log(typeof (id)); vem como string.
  const numberId = Number(id);
  const result = await talkers();
  const removingEl = result.filter((e) => e.id !== numberId);
  const editTalker = {
    name,
    age,
    id: numberId,
    talk,
  };
  removingEl.push(editTalker);
  await fs.writeFile('./talker.json', JSON.stringify(removingEl));
  return res.status(200).json(editTalker);
});

app.listen(PORT, () => {
  console.log('Online');
});
