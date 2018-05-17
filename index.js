'use strict';

console.log('App start');

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
// for andy not
const config = {
  channelAccessToken: 'YAj/SoBOpYZeCcAmeoL/u2SvF2XisBMeoJ7N5E0eJBfpZi33APwOByLAkkH+rZhynctYFAlvFDGepzL/cGT/TsHscIMJgbIFv8Qr6zWLJ4QI6NEKmmbtQjNQYj3WY0L/9xoTLlI6tFZTsK3WL/aEkAdB04t89/1O/w1cDnyilFU=',
  channelSecret: '6fa387c02b291fd45788644dc71a55c3'
};

// for rel bot 5
// const config = {
//   channelAccessToken: 'CHSFSSkScq10baLGKQO0AWVoZ6hTTA3x8xSbAiwF1TY4rNBDZqiPFXsgpgN9mycyQUBVcouOMaSOY83jZs0HiQaRZCUZgnn98r15EVDg40U/FFPGGyyRp/zHlSD3rZYZkCZRW7uEQHEufpW2YRG0+wdB04t89/1O/w1cDnyilFU=',
//   channelSecret: '21b2b8ce572c642f88c051edd182999b'
// };

const verifyUserId = 'Udeadbeefdeadbeefdeadbeefdeadbeef';

// create LINE SDK client
const client = new line.Client(config);

console.log('Line bot create');

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware(config), (req, res) => {
  let replyText = {
    type: 'text',
    text: ''
  }
  return Promise.all(req.body.events.map((event) => {
    let replyToken = event.replyToken;
    let eventType = undefined === event.type ? null : event.type;
    let messageType = undefined === event.message ? null : event.message.type;
    let userId = undefined === event.source.userId ? null : event.source.userId;

    if (eventType === 'join' || eventType === 'follow') {
      let sourceId = event.source.userId || event.source.roomId || event.source.groupId;
      let greetingString = '您好，我是這次同學會的詢問機器人 bon-bot，有關同學會的細節都可以詢問我喔~ \n 輸入 help，查詢關鍵字 \n 輸入 同學會，了解同學會細節 \n 輸入 點餐，點當天餐點';
      replyText.text = greetingString;
      return Promise.all([
        eventType,
        client.pushMessage(sourceId, replyText)
      ]);
    }

    if ((eventType === 'message' || messageType === 'text') && userId !== verifyUserId) {
      if (event.message === 'help') {
        replyText.text = '輸入 同學會，了解同學會細節 \n 輸入 點餐，點當天餐點';
        client.replyMessage(replyToken, replyText);
        return eventType;
      }
      if (event.message === 'bon-bot') {
        replyText.text = '您好 \n 輸入 help，查詢關鍵字 \n 輸入 同學會，了解同學會細節 \n 輸入 點餐，點當天餐點';
        client.replyMessage(replyToken, replyText);
        return eventType;
      }
      if (event.message === '點餐') {
        replyText.text = 'Url';
        client.replyMessage(replyToken, replyText);
        return eventType;
      }
      if (event.message === '同學會') {
        replyText.text = '時間：2018/06/16 17:30 \n 地點：西湖祕密花園';
        client.replyMessage(replyToken, replyText);
        return eventType;
      }
    }

    return Promise.resolve(eventType);
  })).then((eventType) => {
    let types = eventType[0];
    let type = types instanceof Array ? types[0] : null;
    let resJson = {
      status: 'success',
      type: type === null ? types : type
    };
    console.log(resJson);
    res.status(200).json(resJson);
  }).catch((err) => {
    console.error(err);
    res.status(500).json(err);
  });
});
