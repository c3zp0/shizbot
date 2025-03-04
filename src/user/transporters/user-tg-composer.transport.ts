import { Composer } from 'grammy';
import { CustomContext } from '../../common/types/custom-context.type';
import { kyselyDb } from '../../common/db/kysely/config';

const userComposer = new Composer<CustomContext>();

userComposer.command('me', async (ctx: CustomContext) => {
    const user = await kyselyDb
        .selectFrom('users as u')
        .select((eb) => [eb.fn<number>('count', ['u.id']).as('total')])
        .where('u.tg_id', '=', ctx.from?.id || 0)
        .selectAll()
        .groupBy('u.id')
        .execute();
    await ctx.reply(JSON.stringify(user) || 'err');
});

export { userComposer };
