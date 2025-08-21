import { MessageEntity as TelegrafMessageEntity } from 'telegraf/types';

/**
 * TypeScript analogue of aiogram text formatting functions
 * Based on https://github.com/aiogram/aiogram/blob/dev-3.x/aiogram/utils/formatting.py
 */

// Types
type NodeType = Text | FormatElement;

interface MessageEntity {
  type: TelegrafMessageEntity['type'];
  offset: number;
  length: number;
  url?: string;
  user?: Record<string, any>;
  language?: string;
  custom_emoji_id?: string;
}

interface MessageKwargs {
  text: string;
  entities?: MessageEntity[];
}

abstract class FormatElement {
  public content: (string | FormatElement)[] = [];

  constructor(...content: (string | FormatElement | NodeType)[]) {
    this.content = content.flat();
  }

  abstract getType(): TelegrafMessageEntity['type'] | 'text';

  toString(): string {
    return this.content.map((item) => item.toString()).join('');
  }

  getExtraFields(): Record<string, any> {
    return {};
  }

  asKwargs(): MessageKwargs {
    const text = this.toString();
    const entities: MessageEntity[] = [];
    let offset = 0;

    for (const item of this.content) {
      if (typeof item === 'string') {
        offset += item.length;
      } else if (item instanceof FormatElement) {
        const itemData = item.asKwargs();
        if (item.getType() !== 'text') {
          entities.push({
            type: item.getType() as TelegrafMessageEntity['type'],
            offset: offset,
            length: itemData.text.length,
            ...item.getExtraFields(),
          });
        }
        entities.push(
          ...(itemData.entities?.map((entity) => ({
            ...entity,
            offset: offset + entity.offset,
          })) ?? []),
        );
        offset += itemData.text.length;
      }
    }

    return { text, entities: entities.length > 0 ? entities : undefined };
  }
}

// Base classes
class Text extends FormatElement {
  static type: string = 'text';

  getType(): TelegrafMessageEntity['type'] | 'text' {
    return 'text';
  }

  concat(...other: NodeType[]): Text {
    return new Text(...this.content, ...other);
  }
}

// Formatting elements
class Bold extends FormatElement {
  static type: string = 'bold';

  getType(): TelegrafMessageEntity['type'] {
    return 'bold';
  }
}

class Italic extends FormatElement {
  static type: string = 'italic';

  getType(): TelegrafMessageEntity['type'] {
    return 'italic';
  }
}

class Underline extends FormatElement {
  static type: string = 'underline';

  getType(): TelegrafMessageEntity['type'] {
    return 'underline';
  }
}

class Strikethrough extends FormatElement {
  static type: string = 'strikethrough';

  getType(): TelegrafMessageEntity['type'] {
    return 'strikethrough';
  }
}

class Spoiler extends FormatElement {
  static type: string = 'spoiler';

  getType(): TelegrafMessageEntity['type'] {
    return 'spoiler';
  }
}

class Code extends FormatElement {
  static type: string = 'code';

  getType(): TelegrafMessageEntity['type'] {
    return 'code';
  }
}

class Pre extends FormatElement {
  language?: string;
  static type: string = 'pre';

  constructor(
    language?: string,
    ...content: (string | FormatElement | NodeType)[]
  ) {
    super(...content);
    this.language = language;
  }

  getType(): TelegrafMessageEntity['type'] {
    return 'pre';
  }

  getExtraFields(): Record<string, any> {
    return this.language ? { language: this.language } : {};
  }
}

class TextLink extends FormatElement {
  url: string;
  static type: string = 'text_link';

  constructor(url: string, ...content: (string | FormatElement | NodeType)[]) {
    super(...content);
    this.url = url;
  }

  getType(): TelegrafMessageEntity['type'] {
    return 'text_link';
  }

  getExtraFields(): Record<string, any> {
    return { url: this.url };
  }
}

class TextMention extends FormatElement {
  user: Record<string, unknown>;
  static type: string = 'text_mention';

  constructor(
    user: Record<string, unknown>,
    ...content: (string | FormatElement | NodeType)[]
  ) {
    super(...content);
    this.user = user;
  }

  getType(): TelegrafMessageEntity['type'] {
    return 'text_mention';
  }

  getExtraFields(): Record<string, any> {
    return { user: this.user };
  }
}

class CustomEmoji extends FormatElement {
  customEmojiId: string;
  static type: string = 'custom_emoji';

  constructor(
    customEmojiId: string,
    ...content: (string | FormatElement | NodeType)[]
  ) {
    super(...content);
    this.customEmojiId = customEmojiId;
  }

  getType(): TelegrafMessageEntity['type'] {
    return 'custom_emoji';
  }

  getExtraFields(): Record<string, any> {
    return { custom_emoji_id: this.customEmojiId };
  }
}

class BlockQuote extends FormatElement {
  static type: string = 'blockquote';

  getType(): TelegrafMessageEntity['type'] {
    return 'blockquote';
  }
}

// Special elements
class HashTag extends FormatElement {
  static type: string = 'hashtag';

  getType(): TelegrafMessageEntity['type'] {
    return 'hashtag';
  }
}

class CashTag extends FormatElement {
  static type: string = 'cashtag';

  getType(): TelegrafMessageEntity['type'] {
    return 'cashtag';
  }
}

class BotCommand extends FormatElement {
  static type: string = 'bot_command';

  getType(): TelegrafMessageEntity['type'] {
    return 'bot_command';
  }
}

class Url extends FormatElement {
  static type: string = 'url';

  getType(): TelegrafMessageEntity['type'] {
    return 'url';
  }
}

class Email extends FormatElement {
  static type: string = 'email';

  getType(): TelegrafMessageEntity['type'] {
    return 'email';
  }
}

class PhoneNumber extends FormatElement {
  static type: string = 'phone_number';

  getType(): TelegrafMessageEntity['type'] {
    return 'phone_number';
  }
}

// Utility functions
function asLine({
  items = [],
  end = '\n',
  sep = '',
}: {
  items: (string | FormatElement | NodeType)[];
  end?: string;
  sep?: string;
}): Text {
  const content: (string | FormatElement)[] = [];

  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      content.push(sep);
    }
    content.push(items[i]);
  }
  content.push(end);

  return new Text(...content);
}

function asList({
  items = [],
  when = null,
  sep = '\n',
}: {
  items: (string | FormatElement | NodeType)[];
  when?: any;
  sep?: string;
}): Text {
  if (when !== null && !when) {
    return new Text();
  }

  const content: (string | FormatElement)[] = [];

  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      content.push(sep);
    }
    content.push(items[i]);
  }

  return new Text(...content);
}

function asMarkedList({
  items = [],
  marker = '• ',
  when = null,
  sep = '\n',
}: {
  items: (string | FormatElement | NodeType)[];
  marker?: string;
  when?: any;
  sep?: string;
}): Text {
  if (when !== null && !when) {
    return new Text();
  }

  const content: (string | FormatElement)[] = [];

  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      content.push(sep);
    }
    content.push(marker, items[i]);
  }

  return new Text(...content);
}

function asNumberedList({
  items = [],
  when = null,
  sep = '\n',
}: {
  items: (string | FormatElement | NodeType)[];
  when?: any;
  sep?: string;
}): Text {
  if (when !== null && !when) {
    return new Text();
  }

  const content: (string | FormatElement)[] = [];

  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      content.push(sep);
    }
    content.push(`${i + 1}. `, items[i]);
  }

  return new Text(...content);
}

function asSection({
  title,
  items = [],
  sep = '\n',
}: {
  title: string | FormatElement;
  items: (string | FormatElement | NodeType)[];
  sep?: string;
}): Text {
  const content: (string | FormatElement)[] = [new Bold(title)];

  for (const item of items) {
    content.push(sep, item);
  }

  return new Text(...content);
}

// Node types mapping
const NODE_TYPES: Record<string, object> = {
  text: Text,
  hashtag: HashTag,
  cashtag: CashTag,
  bot_command: BotCommand,
  url: Url,
  email: Email,
  phone_number: PhoneNumber,
  bold: Bold,
  italic: Italic,
  underline: Underline,
  strikethrough: Strikethrough,
  spoiler: Spoiler,
  code: Code,
  pre: Pre,
  text_link: TextLink,
  text_mention: TextMention,
  custom_emoji: CustomEmoji,
  blockquote: BlockQuote,
};

// Apply entity function
function applyEntity(entity: MessageEntity, ...nodes: NodeType[]): NodeType {
  const NodeClass = NODE_TYPES[entity.type];
  if (!NodeClass) {
    return new Text(...nodes);
  }

  // Handle special cases that need extra parameters
  if (entity.type === 'pre' && entity.language) {
    return new Pre(entity.language, ...nodes);
  } else if (entity.type === 'text_link' && entity.url) {
    return new TextLink(entity.url, ...nodes);
  } else if (entity.type === 'text_mention' && entity.user) {
    return new TextMention(entity.user, ...nodes);
  } else if (entity.type === 'custom_emoji' && entity.custom_emoji_id) {
    return new CustomEmoji(entity.custom_emoji_id, ...nodes);
  } else {
    return new (NodeClass as any)(...nodes) as FormatElement;
  }
}

// Export all classes and functions
export {
  Text,
  FormatElement,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Spoiler,
  Code,
  Pre,
  TextLink,
  TextMention,
  CustomEmoji,
  BlockQuote,
  HashTag,
  CashTag,
  BotCommand,
  Url,
  Email,
  PhoneNumber,
  asLine,
  asList,
  asMarkedList,
  asNumberedList,
  asSection,
  applyEntity,
  NODE_TYPES,
  type MessageEntity,
  type MessageKwargs,
  type NodeType,
};

// Usage examples:
/*
// Basic formatting
const message = new Text(
  "Hello, ",
  new Bold("world"),
  "! This is ",
  new Italic("italic"),
  " and this is ",
  new Code("code"),
  "."
);

// Using utility functions
const list = asMarkedList(
  "First item",
  new Bold("Second bold item"),
  "Third item"
);

const numberedList = asNumberedList(
  "First",
  "Second",
  "Third"
);

// Links
const link = new TextLink("https://example.com", "Click here");

// Pre-formatted code with language
const codeBlock = new Pre("javascript", "console.log('Hello, world!');");

// Convert to Telegram API format
const apiData = message.asKwargs();
// Returns: { text: "Hello, world! This is italic and this is code.", entities: [...] }
*/
