import { Filter } from 'grammy';
import { CustomContext } from '../../common/types/custom-context.type';
import * as datetimeUtil from '../../common/utils/datetime.util';
import { UserEntity } from '../../user/entities/user.entity';
import { UserService } from '../../user/services/user.service';
import { VoiceService } from '../services/voice.service';
import { ChatEntity } from '../../chat/entities/chat.entity';
import { FORWARDED_VOICE_MESSAGE_RESPONSE } from '../contraints/voice-reponses.constraint';
import {
    MESSAGE_IS_OUTDATED_LOG,
    NO_CHAT_IN_CONTEXT,
    NO_CHAT_IN_USER_CHATS,
    NO_MESSAGE_IN_CONTEXT,
} from '../../common/constraints/logs.constraint';

export class VoiceController {
    constructor(
        private readonly _voiceService: VoiceService,
        private readonly _userService: UserService,
    ) {}

    async getTodayTopVoiceUsers(ctx: CustomContext) {
        if (!ctx.message) {
            throw new Error('Voice handler without message body');
        }
        if (!ctx.message.chat || !ctx.chat) {
            throw new Error('Voice handler without chat properties');
        }

        if (ctx.isOutDatedMessage) {
            throw new Error('Message is out dated');
        }

        const now = new Date();
        const start = new Date(
            `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
        );
        const end = new Date(start);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        const top = await this._voiceService.getTopVoicesLengthByChat(
            ctx.chat.id,
            { start, end },
        );
        if (top.size === 0) {
            await ctx.api.sendMessage(
                ctx.chat.id,
                'Еще нет ни одного зарегистрированного голосовного сообщения',
            );
            throw new Error('Ни одного гс за сегодня');
        }
        const promises: Promise<UserEntity | null>[] = [];
        top.forEach((_, key) => {
            promises.push(this._userService.findById(key));
        });
        const message = `Топ воис абьюзеров за сегодня:\n`;
        const users = await Promise.all(promises);

        await ctx.api.sendMessage(
            ctx.chat.id,
            users.reduce((acc, user) => {
                if (!user) {
                    return acc;
                }
                const length = top.get(user.id);
                return `${acc}<a href="t.me/${user.tgUsername}">${user.tgFirstName}</a> - ${length ? datetimeUtil.parseSecondsIntoTimeString(length) : 0}\n`;
            }, message),
            { parse_mode: 'HTML', link_preview_options: { is_disabled: true } },
        );
    }

    async getTopVoiceUsers(ctx: CustomContext) {
        if (!ctx.message) {
            throw new Error('Voice handler without message body');
        }
        if (!ctx.message.chat || !ctx.chat) {
            throw new Error('Voice handler without chat properties');
        }

        if (ctx.isOutDatedMessage) {
            throw new Error('Message is out dated');
        }

        const topTotal = await this._voiceService.getTopVoicesLengthByChat(
            ctx.chat.id,
        );
        if (topTotal.size === 0) {
            await ctx.api.sendMessage(
                ctx.chat.id,
                'Еще нет ни одного зарегистрированного голосовного сообщения',
            );
            throw new Error('Еще ни одного голосовго сообщения');
        }
        const promises: Promise<UserEntity | null>[] = [];
        topTotal.forEach((_, key) => {
            promises.push(this._userService.findById(key));
        });
        const message = `Топ воис абьюзеров:\n`;
        const users = await Promise.all(promises);

        await ctx.api.sendMessage(
            ctx.chat.id,
            users.reduce((acc, user) => {
                if (!user) {
                    return acc;
                }
                const length = topTotal.get(user.id);
                return `${acc}<a href="t.me/${user.tgUsername}">${user.tgFirstName}</a> - ${length ? datetimeUtil.parseSecondsIntoTimeString(length) : 0}\n`;
            }, message),
            { parse_mode: 'HTML', link_preview_options: { is_disabled: true } },
        );
    }

    async handleVoice(ctx: Filter<CustomContext, ':voice' | ':video_note'>) {
        if (!ctx.message) {
            throw new Error(NO_MESSAGE_IN_CONTEXT('voice handler'));
        }
        if (!ctx.message.chat || !ctx.chat) {
            throw new Error(NO_CHAT_IN_CONTEXT('voice handler', ctx.msgId));
        }

        if (ctx.message.forward_origin) {
            await ctx.reply(FORWARDED_VOICE_MESSAGE_RESPONSE, {
                reply_parameters: { message_id: ctx.message.message_id },
            });
            throw new Error('Forwared voice message');
        }

        let duration, fileId, fileUniqueId, fileSize;
        if (ctx.message.video_note) {
            duration = ctx.message.video_note.duration;
            fileId = ctx.message.video_note.thumbnail?.file_id;
            fileUniqueId = ctx.message.video_note.thumbnail?.file_unique_id;
            fileSize = ctx.message.video_note.thumbnail?.file_size;
        } else {
            duration = ctx.message.voice?.duration;
            fileId = ctx.message.voice?.file_id;
            fileUniqueId = ctx.message.voice?.file_unique_id;
            fileSize = ctx.message.voice?.file_size;
        }

        const chatId = ctx.user.chats.find(
            (chat: ChatEntity) => chat.chatId === ctx.chat?.id,
        )?.id;
        if (!chatId) {
            throw new Error(NO_CHAT_IN_USER_CHATS('voice handler', ctx.user));
        }
        if (
            duration === undefined ||
            fileId === undefined ||
            fileUniqueId === undefined
        ) {
            return;
        }

        await this._voiceService.create(
            duration,
            fileId,
            fileUniqueId,
            fileSize,
            ctx.user,
            chatId,
        );
        if (ctx.isOutDatedMessage) {
            throw new Error(
                MESSAGE_IS_OUTDATED_LOG(
                    'voice handler',
                    ctx.message.message_id,
                ),
            );
        }
        const { count, duration: voicesDuration } =
            await this._voiceService.getUserVoicesCount(ctx.user, ctx.chat.id);
        const now = new Date();
        const start = new Date(
            `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
        );
        const end = new Date(start);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);
        const { duration: todayDuration } =
            await this._voiceService.getUserVoicesCount(ctx.user, ctx.chat.id, {
                start,
                end,
            });
        const amountOfVoicesReply =
            'Ваше общее количество голосовых сообщений: ' + count + '\n\n';
        const todayAmountOfVoicesReply =
            'Сегодня вы отправили сообщений на ' +
            datetimeUtil.parseSecondsIntoTimeString(todayDuration);
        const todayVoicesPercentage = (voicesDuration / todayDuration) * 100;
        const todayVoicesPercentageReply = `, это ${todayVoicesPercentage.toFixed(1)}% от общего числа`;
        await ctx.reply(
            amountOfVoicesReply +
                todayAmountOfVoicesReply +
                todayVoicesPercentageReply,
            { reply_parameters: { message_id: ctx.message.message_id } },
        );
    }

    async ownVoicesLength(ctx: CustomContext) {
        if (!ctx.message) {
            throw new Error('Voice handler without message body');
        }
        if (!ctx.message.chat || !ctx.chat) {
            throw new Error('Voice handler without chat properties');
        }

        if (ctx.isOutDatedMessage) {
            throw new Error('Message is out dated');
        }

        const now = new Date();
        const start = new Date(
            `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
        );
        const end = new Date(start);
        end.setHours(23);
        end.setMinutes(59);
        end.setSeconds(59);

        const totalUserVoicesLength =
            await this._voiceService.getUsersVoicesLength(
                ctx.user,
                ctx.chat.id,
            );
        const todayUserVoicesLength =
            await this._voiceService.getUsersVoicesLength(
                ctx.user,
                ctx.chat.id,
                {
                    start,
                    end,
                },
            );

        const totalChatVoicesLength =
            await this._voiceService.getChatTotalVoicesDuration(ctx.chat.id);

        const totalDurationMessage = `Общеем время голосовых сообщений: ${datetimeUtil.parseSecondsIntoTimeString(totalUserVoicesLength)}`;
        const todayDurationMessage = `Длительность голосовых сообщений за сегодня: ${datetimeUtil.parseSecondsIntoTimeString(todayUserVoicesLength)}`;

        const partOfTotal = `Процент всех гс от общей длительности по чату: ${Math.round((totalUserVoicesLength / totalChatVoicesLength) * 100)}`;

        const message = `${totalDurationMessage}\n${todayDurationMessage}\n\n${totalChatVoicesLength ? partOfTotal : ''}`;

        await ctx.reply(message, {
            reply_parameters: { message_id: ctx.message.message_id },
        });
    }
}
