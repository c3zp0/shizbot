import { BotCommandsEnum } from '../enum/bot-commands.enum';

export const BOT_COMMANDS = [
    {
        command: BotCommandsEnum.MESSAGES_COUNTER,
        description:
            'Количество отправленных сообщений за все время и за сегодня',
    },
    {
        command: BotCommandsEnum.OWN_VOICES_DURATION,
        description:
            'Длительность голосовых сообщений в секундах за сегодня и все время',
    },
    {
        command: BotCommandsEnum.TOP_MESSAGES_BY_CHAT,
        description:
            'Список пользователей с наибольшим количеством отправленных сообщений',
    },
    {
        command: BotCommandsEnum.CHAT_TOP_VOICES,
        description:
            'Список пользователей с самой большой общей длительностью голосовых сообщений за все время',
    },
    {
        command: BotCommandsEnum.TOP_VOICES_TODAY,
        description:
            'Список пользователей с самой большой общей длительностью голосовых сообщений за сегодня',
    },
    {
        command: BotCommandsEnum.RANDOM,
        description:
            'Сгенерировать случайное чисто в диапозоне. Нужно будет отвечать на вопросы бота',
    },
    {
        command: BotCommandsEnum.WIKI,
        description: 'Поиск в википедии',
    },
    {
        command: BotCommandsEnum.MESSAGES_BY_YEAR,
        description: 'Получить количество сообщений в месяц за последний год',
    },
];
