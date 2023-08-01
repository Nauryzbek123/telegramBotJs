const users = require("../models/users");
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('6637208860:AAElgzEm6XcbygbY7L-qiShbbAGd4DIFu3g');
bot.start(async (ctx) => {
    try {
      const newUser = new users({ username: ctx.from.username });
      await newUser.save();
      ctx.reply('Вы были добавлены в список');
    } catch (err) {
      console.log(err);
      ctx.reply('Не удалось загурзить');
    }
  });
bot.command('Список', async (ctx) => {
    try {
      const allUsers = await users.find({}, 'username ');
      if (allUsers.length === 0) {
        return ctx.reply('Список стажеров пуст');
      }
      const userList = allUsers.map((user) => `${user.username} ${user.usersurname}`);
      ctx.reply('List of users:', Markup.keyboard(userList).oneTime().resize().extra());
      ctx.session.userList = allUsers;
    } catch (err) {
      console.log(err);
      ctx.reply('Ошибка при получении списка стажеров');
    }
  });
bot.launch();
