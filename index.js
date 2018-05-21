'use strict';

console.log('App start');

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.channelAccessToken,
  channelSecret: process.env.channelSecret
};

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
      let greetingString = '您好，我是這次同學會的詢問機器人 bon-bot，有關同學會的細節都可以詢問我喔~\n輸入 help，查詢關鍵字';
      replyText.text = greetingString;
      return Promise.all([
        eventType,
        client.pushMessage(sourceId, replyText)
      ]);
    }

    if ((eventType === 'message' || messageType === 'text') && userId !== verifyUserId) {
      if (event.message.text === 'help' || event.message.text === 'Help') {
        replyText.text = '輸入 同學會，了解同學會細節\n輸入 點餐，點當天餐點\n輸入 map，取得餐廳位置圖';
        client.replyMessage(replyToken, replyText);
        return eventType;
      }
      if (event.message.text === 'bon-bot') {
        replyText.text = '您好\n輸入 help，查詢關鍵字\n輸入 同學會，了解同學會細節\n輸入 點餐，點當天餐點\n輸入 map，取得餐廳位置圖';
        client.replyMessage(replyToken, replyText);
        return eventType;
      }
      if (event.message.text === '點餐') {
        replyText.text = 'https://goo.gl/forms/oW6wjAxHvdICnQ952';
        client.replyMessage(replyToken, replyText);
        return eventType;
      }
      if (event.message.text === '同學會') {
        replyText.text = '時間：2018/06/16 17:30\n地點：西湖祕密花園\n地址：苗栗縣西湖鄉金獅村茶亭九鄰六之一號';
        client.replyMessage(replyToken, replyText);
        return eventType;
      }
      if (event.message.text === 'map' || event.message.text === 'Map') {
        replyText.text = 'https://ppt.cc/flYqnx';
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
