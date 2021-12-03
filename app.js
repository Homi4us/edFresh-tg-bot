var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const TelegramBot = require('node-telegram-bot-api');
const token = '5048594795:AAHhWddUUmEon7AENAblBQXbeSidhfEEHxM';

const bot = new TelegramBot(token, {polling: true});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Global var.

var msgToDelete =[]

//

app.get('/collaboration', (req,res)=>{
  var senderId = req.query.senderId
  var recieverId = req.query.recieverId
  var sender = req.query.sender
  var reciever = req.query.reciever

  var invitationMenu = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: '✅ Да', callback_data:`yes-${sender}-${reciever}-${senderId}-${recieverId}`}],
        [{text: '❌ Нет', callback_data: `no-${sender}-${reciever}-${senderId}-${recieverId}`}]
      ],

    })
  };

  var text = `@${sender} хочет сотрудничать с вами. Примем приглашение?`

  bot.sendMessage(recieverId,text,invitationMenu).then((msg)=>{
      
      let msg_id = msg.message_id;
      msgToDelete[`del-${recieverId}`] = msg_id

      msgToDelete
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true});
  })

})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// telegram bot


bot.onText(/\/start/, (msg, match) => {
 
  const chatId = msg.chat.id;

  console.log(msg.chat)
  
  var resp = `Привет, ${msg.chat.username}`
  
  bot.sendMessage(chatId, resp);
});


bot.on('callback_query', (msg)=>{
  var chatId = msg.from.id;
  var data = msg.data.split("-")

  var answer = data[0]
  var reciever = data[1]
  var sender = data[2]
  var recieverId = data[3]
  var senderId = data[4]

  bot.deleteMessage(senderId,msgToDelete[`del-${senderId}`])

  if(answer == "yes") {
    bot.sendMessage(recieverId,`@${sender} принял ваш запрос! :)`)
    bot.sendMessage(senderId, `Отлично! Теперь вы сотрудничаете с @${reciever}`)
  } else {
    bot.sendMessage(recieverId,`@${sender} отклонил ваш запрос! :(`)
    bot.sendMessage(senderId, `Хорошо...Может в следующий раз`)
  } 
})

module.exports = app;
