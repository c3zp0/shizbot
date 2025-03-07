import { Composer } from 'grammy';
import { CustomContext } from '../common/types/custom-context.type';

const randomComposer = new Composer<CustomContext>();

randomComposer.command('random', (ctx: CustomContext) => {
    if (!ctx.message) {
        throw new Error('ctx.message is undefined');
    }
    ctx.session.jobInProgress = 'random';
    ctx.session.jobStage = 'first_number';
    ctx.reply('Enter random start: ', {
        reply_markup: { force_reply: true },
        reply_parameters: { message_id: ctx.message?.message_id },
    });
});

randomComposer
    .on('message')
    .filter((ctx: CustomContext) => ctx.session.jobInProgress === 'random')
    .filter((ctx: CustomContext) => ctx.session.jobStage === 'first_number')
    .use(async (ctx: CustomContext) => {
        if (!ctx.message || !ctx.message.text) {
            ctx.session.clear(ctx);
            throw new Error('Message in random not provided');
        }
        const randomStart = Number(ctx.message?.text);
        if (Number.isNaN(randomStart) || !Number.isFinite(randomStart)) {
            if (ctx.session.stageRetry == 3) {
                ctx.session.clear(ctx);
                await ctx.reply('Превышено количество попыток');
                throw new Error('User an idiot');
            }
            ctx.session.stageRetry += 1;
            await ctx.reply(
                `Enter random start: ${ctx.session.stageRetry ? `\nAttempt number ${ctx.session.stageRetry}` : ''}`,
                {
                    reply_markup: { force_reply: true },
                    reply_parameters: { message_id: ctx.message?.message_id },
                },
            );
            return;
        }
        ctx.session.randomStart = randomStart;
        ctx.session.jobStage = 'last_number';
        ctx.reply('Enter random end: ', {
            reply_markup: { force_reply: true },
            reply_parameters: { message_id: ctx.message?.message_id },
        });
    });

randomComposer
    .on('message')
    .filter((ctx: CustomContext) => ctx.session.jobInProgress === 'random')
    .filter((ctx: CustomContext) => ctx.session.jobStage === 'last_number')
    .use(async (ctx: CustomContext) => {
        if (!ctx.message) {
            throw new Error('ctx.message is undefined');
        }
        if (!ctx.session.randomStart) {
            throw new Error();
        }
        const max = Number(ctx.message?.text);

        if (Number.isNaN(max) || !Number.isFinite(max)) {
            if (ctx.session.stageRetry == 3) {
                ctx.session.clear(ctx);
                await ctx.reply('Превышено количество попыток');
                throw new Error('User an idiot');
            }
            ctx.session.stageRetry += 1;
            await ctx.reply(
                `Enter random end: ${ctx.session.stageRetry ? `\nAttempt number ${ctx.session.stageRetry}` : ''}`,
                {
                    reply_markup: { force_reply: true },
                    reply_parameters: { message_id: ctx.message?.message_id },
                },
            );
            return;
        }
        const min = Number(ctx.session.randomStart);
        const random = Math.floor(Math.random() * (max - min + 1) + min);
        ctx.session.clear(ctx);
        ctx.reply(random.toString());
    });

export { randomComposer };
