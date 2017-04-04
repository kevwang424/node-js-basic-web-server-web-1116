"use strict";

const http         = require('http');
const finalhandler = require('finalhandler');
const Router       = require('router');
const bodyParser = require('body-parser');
const Message = require('./message');
const bcrypt = require('bcrypt')

let messages = [];
var COUNT = 1
const saltRounds = 10

const router = new Router({ mergeParams: true });
router.use(bodyParser.json());

router.get('/', (request, response) => {
  response.setHeader("Content-Type", "text/plain; charset=utf-8")
  response.end("Hello, World!");
});

router.post('/message', (request, response) => {
  var messageObj = new Message(COUNT, request.body.message)
  messages.push(messageObj)
  response.setHeader("Content-Type", "application/json; charset=utf-8")
  response.end(`${messageObj.id}`)
  COUNT += 1
});

router.get('/messages', (request, response) => {

  var all = JSON.stringify(messages)

  if (request._parsedUrl.query === "encrypt=true") {
    return bcrypt.hash(all, saltRounds, function(err, answer) {
      response.setHeader("Content-Type", "text/plain; charset=utf-8")
      response.end(answer)
    })
  }

  response.setHeader("Content-Type", "application/json; charset=utf-8")
  response.end(all)
})

router.get('/message/:id', (request, response) => {

  var index = request.params.id - 1
  var messageObj = JSON.stringify(messages[index])

  if (request._parsedUrl.query === "encrypt=true"){

    return bcrypt.hash(messageObj, saltRounds, function(err, answer) {
      response.setHeader("Content-Type", "text/plain; charset=utf-8")
      response.end(answer)
    })

  }

  response.setHeader("Content-Type", "application/json; charset=utf-8")
  response.end(messageObj)

})



const server = http.createServer((request, response) => {
  router(request, response, finalhandler(request, response));
});

exports.listen = function(port, callback) {
  server.listen(port, callback);
};

exports.close = function(callback) {
  server.close(callback);
};
