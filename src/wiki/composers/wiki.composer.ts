import { Composer, InlineKeyboard } from 'grammy';
import { CustomContext } from '../../common/types/custom-context.type';
import { WikiService } from '../services/wiki.service';
import { WikiController } from '../controllers/wiki.controller';
import Redis from '../../common/db/redis/redis';
import { RedisConnectionEnum } from '../../common/enum/redis-connection.enum';

const wikiComposer = new Composer<CustomContext>();

const wikiService = new WikiService(
    Redis.getRedisConnection(RedisConnectionEnum.WIKI_CACHE),
);
const wikiController = new WikiController(wikiService);

wikiComposer.command('w', async (ctx: CustomContext) => {
    if (!ctx.message || !ctx.message.text) {
        throw new Error();
    }
    if (ctx.message.text.trim() === '/w') {
        await ctx.reply('Добавьте строку для поиска', {
            reply_parameters: { message_id: ctx.message.message_id },
        });
        throw new Error('Request without search string');
    }
    const searchString = ctx.message.text
        .trim()
        .slice(2, ctx.message.text.length)
        .trim();
    const keyboard = await wikiController.search(searchString, 1);
    await ctx.reply(`Поиск википедии по слову: "${searchString}"`, {
        reply_markup: {
            inline_keyboard: keyboard.inline_keyboard,
        },
        parse_mode: 'Markdown',
    });
});

wikiComposer.callbackQuery(/^page_(\d+)_(.+)/, async (ctx: CustomContext) => {
    if (!ctx.match) {
        throw new Error('Nothing was captured');
    }

    if (
        !ctx.callbackQuery ||
        !ctx.callbackQuery.message ||
        !ctx.chat?.id ||
        !ctx.callbackQuery.message.text
    ) {
        throw new Error();
    }

    const page = parseInt(ctx.match[1]);
    const searchString = ctx.match[2];

    const keyboard = await wikiController.search(searchString, page);

    await ctx.api.editMessageText(
        ctx.chat.id,
        ctx.callbackQuery?.message?.message_id,
        ctx.callbackQuery?.message?.text,
        {
            reply_markup: {
                inline_keyboard: keyboard.inline_keyboard,
            },
            parse_mode: 'Markdown',
        },
    );
    await ctx.answerCallbackQuery();
});

wikiComposer.callbackQuery(/^wiki_(\d+)/, async (ctx: CustomContext) => {
    if (!ctx.match) {
        throw new Error('Nothing was captured');
    }
    if (
        !ctx.callbackQuery ||
        !ctx.callbackQuery.message ||
        !ctx.chat?.id ||
        !ctx.callbackQuery.message.text
    ) {
        throw new Error();
    }
    const pageId = ctx.match[1];
    const data = await wikiController.getArticle(parseInt(pageId));
    const keyboard = new InlineKeyboard().url(
        'More',
        `https://ru.wikipedia.org/?curid=${pageId}`,
    );
    await ctx.editMessageText(data.query.pages[pageId].extract, {
        reply_markup: { inline_keyboard: keyboard.inline_keyboard },
    });
    await ctx.answerCallbackQuery();
});

export { wikiComposer };
