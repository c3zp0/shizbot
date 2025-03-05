import { NextFunction } from 'grammy';
import { IBotMiddleware } from '../../interfaces/bot-middleware.interface';
import { UserService } from '../../../user/services/user.service';
import { UserEntity } from '../../../user/entities/user.entity';
import { ChatService } from '../../../chat/services/chat.service';
import { ChatEntity } from '../../../chat/entities/chat.entity';
import { CustomContext } from '../../types/custom-context.type';
import { dataSource } from '../../db/config';

export class BotUserMiddleware implements IBotMiddleware {
    private userService: UserService;
    private chatService: ChatService;

    constructor() {
        this.userService = new UserService(
            dataSource.getRepository(UserEntity),
        );
        this.chatService = new ChatService(
            dataSource.getRepository(ChatEntity),
        );
    }

    async handler(ctx: CustomContext, next: NextFunction) {
        if (!ctx.from) {
            throw new Error('Cannot determine from props');
        }
        if (!ctx.chat) {
            throw new Error('Cannot determine chat id');
        }
        let user = await this.userService.findOneByTgId(ctx.from.id);
        if (!user) {
            user = await this.userService.createFromTgProfile(
                ctx.from.id,
                ctx.from.first_name,
                ctx.from.is_bot,
                ctx.from.username,
            );
        }
        if (
            !user.chats ||
            !user.chats.find((chat) => chat.chatId === ctx.chat?.id)
        ) {
            const chat = await this.chatService.create(
                ctx.chat.id,
                ctx.chat.title,
                ctx.chat.type === 'private',
                user,
            );
            if (!user.chats) {
                user.chats = [];
            }
            user.chats.push(chat);
        }
        ctx.user = user;
        ctx.session.userId = user.tgId;
        await next();
    }
}
