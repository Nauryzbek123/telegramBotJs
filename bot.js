const { Telegraf, Markup,session} = require('telegraf');

const users = require('/Users/diasnauryzbek/Desktop/node.ex/models/users.js');
const { initDatabase } = require('./init-database');
const bot = new Telegraf('6637208860:AAElgzEm6XcbygbY7L-qiShbbAGd4DIFu3g');



initDatabase();

bot.use(session());

bot.start(async (ctx) => {
    try {
      const existingUser = await users.findOne({ username: ctx.from.username });
      if (existingUser) {
        ctx.reply('Вы уже были добавлены в список', {
            reply_markup: {
                inline_keyboard: [
                  [{ text: "Список стажеров", callback_data: "show_users" }],
                ],
              },  
        });
      } else {
        const newUser = new users({ username: ctx.from.username });
        await newUser.save();
        ctx.reply('Вы были добавлены в список', {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Список стажеров", callback_data: "show_users" }],
            ],
          },
        });
      }
    } catch (err) {
      console.log(err);
      ctx.reply('Не удалось загрузить');
    }
  });
  
/*bot.start(async (ctx) => {
  try {
    const newUser = new users({ username: ctx.from.username});
    await users.insertMany(newUser); 
    ctx.reply('Вы были добавлены в список', 
    {
        reply_markup: {
           inline_keyboard: [
            [ { text: "Список стажеров", callback_data: "show_users" },],
           ] 
        }
    }
    );
  } catch (err) {
    console.log(err);
    ctx.reply('Не удалось загрузить');
  }
}); */
bot.action('show_users', async (ctx) => {
    try {
      const allUsers = await users.find({}, 'username');
      console.log(allUsers)
      if (allUsers.length === 0) {
        return ctx.reply('Список стажеров пуст');
      }
      
      const userListButtons = allUsers.map((user) => {
        return [{ text: `${user.username} `, callback_data: `user-${user._id}` }];
      });
      
      ctx.reply('Список стажеров', {
        reply_markup: {
          inline_keyboard: userListButtons
        }
      });
    } catch (err) {
      ctx.reply('Ошибка при получении списка стажеров ' );
    }
  });
  bot.action(/^user-(\S+)$/, async (ctx) => {
    try {
      const userId = ctx.match[1]; 
      const selectedUser = await users.findById(userId); 
      if (!selectedUser) {
        return ctx.reply('Пользователь не найден');
      }
  
      const userDetails = `Имя пользователя: ${selectedUser.username}\n`
        + `Оценка функциональности: ${selectedUser.functionalgrade}\n`
        + `Оценка UI/UX: ${selectedUser.uiuxgrade}\n`
        + `Оценка кода: ${selectedUser.codegrade}`;
      ctx.reply(userDetails, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Поставить оценку", callback_data: `postGr-${userId}` }],
          ],
        },
      });
    } catch (err) {
      console.log(err);
      ctx.reply('Ошибка при получении информации о пользователе');
    }
  });
  
  const ratingList = [
    [{ text: "Рейтинг стажеров", callback_data: "show_rating" }]
  ];

  bot.action(/^postGr-(\S+)$/, async (ctx) => {
    try {
      const userId = ctx.match[1];
      const selectedUser = await users.findById(userId);
      if (!selectedUser) {
        return ctx.reply('Пользователь не найден');
      }
      ctx.session = {}; 
      ctx.session.currentStep = 'functionalgrade';
      ctx.session.selectedUser = selectedUser; 
      ctx.reply('Введите оценку функциональности (от 1 до 10):');
    } catch (err) {
      console.log(err);
      ctx.reply('Ошибка при получении информации о пользователе');
    }
  });
  
  bot.on('text', async (ctx) => {
    try {
      if (!ctx.session) {
        ctx.session = {}; 
      }
      const step = ctx.session.currentStep;
      if (!step) {
        return;
      }
      const rating = parseInt(ctx.message.text.trim());
      if (isNaN(rating) || rating < 1 || rating > 10) {
        ctx.reply('Пожалуйста, введите оценку от 1 до 10.');
        return;
      }
  
      if (step === 'functionalgrade') {
        ctx.session.functionalgrade = rating;
        ctx.session.currentStep = 'uiuxgrade';
        ctx.reply('Введите оценку UI/UX (от 1 до 10):');
      } else if (step === 'uiuxgrade') {
        ctx.session.uiuxgrade = rating;
        ctx.session.currentStep = 'codegrade';
        ctx.reply('Введите оценку кода (от 1 до 10):');
      } else if (step === 'codegrade') {
        ctx.session.codegrade = rating;
        const functionalgrade = ctx.session.functionalgrade;
        const uiuxgrade = ctx.session.uiuxgrade;
        const codegrade = ctx.session.codegrade;
  
        const selectedUser = ctx.session.selectedUser; 
        selectedUser.functionalgrade = functionalgrade;
        selectedUser.uiuxgrade = uiuxgrade;
        selectedUser.codegrade = codegrade;
        await selectedUser.save();
  
        delete ctx.session.functionalgrade;
        delete ctx.session.uiuxgrade;
        delete ctx.session.codegrade;
        delete ctx.session.currentStep;
        delete ctx.session.selectedUser; 
        
        ctx.reply('Оценки успешно сохранены.',);

        const allUsers = await users.find({});

    const ratedUsers = allUsers.map((user) => {
      const totalGrade = user.functionalgrade + user.uiuxgrade + user.codegrade;
      return {
        username: user.username,
        totalGrade,
      };
    });

    ratedUsers.sort((a, b) => b.totalGrade - a.totalGrade);

    let replyMessage = 'Рейтинг стажеров:\n';
    for (const [index, ratedUser] of ratedUsers.entries()) {
      replyMessage += `${index + 1}. ${ratedUser.username}: ${ratedUser.totalGrade}\n`;
    }

        ctx.reply(replyMessage
          );

      }
    } catch (err) {
      console.log(err);
      ctx.reply('Ошибка при обработке оценки.');
    }
  });
      
    
    
    bot.launch();



    