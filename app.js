"use strict";

require('dotenv').config();
const fs = require('fs');
const Mastodon = require('mastodon');

function loadDictionary() {
  const rawDict = fs.readFileSync('EDMTDictionary.json');
  const json = JSON.parse(rawDict);
  return json;
}

const dict = loadDictionary();

function selectWord() {
  //TODO: Get word in a more deterministic way based on date
  //TODO: filter words with very log definitions
  const wordIndex = Math.floor(Math.random() * dict.length);
  const wordObj = dict[wordIndex];
  return wordObj;
}

function generateMsg() {
  let msg;
  while (true) {
    const wordObj = selectWord();
    const word = wordObj.word;
    const desc = wordObj.description;
    msg = `Today's word: ${word}\n\n${desc}`;

    if (msg.length < 5000) {
      break;
    }
  }

  return msg;
}

generateMsg();



const M = new Mastodon({
  access_token: process.env.ACCESS_TOKEN,
  timeout_ms: 60*1000,
  api_url: 'https://c.im/api/v1/'
});

function postMsg() {
  const msg = generateMsg();

  M.post('statuses', {
    status: msg 
  }, (err, data, response) => {
    console.log('ERR:', err);
    console.log('DATA:', data);
    console.log('RESP:', response);
  });
}

let lastDate = (new Date()).getDate();

function tick() {
  const curDate = (new Date()).getDate();
  if (curDate !== lastDate) {
    console.log('POSTING @', new Date());
    postMsg();
    lastDate = curDate;
  }
}

//tick every 5 minutes
setInterval(tick, 1000 * 60 * 5);
