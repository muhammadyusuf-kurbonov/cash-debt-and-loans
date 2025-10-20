import { Injectable } from '@nestjs/common';
import * as enTranslations from './en.json';
import * as ruTranslations from './ru.json';
import * as uzTranslations from './uz.json';
import { getProperty } from 'dot-prop';

export type Language = 'en' | 'ru' | 'uz';

@Injectable()
export class I18nService {
  private readonly translations: Record<Language, object> = {
    en: enTranslations as object,
    ru: ruTranslations as object,
    uz: uzTranslations as object,
  };

  getTranslation(key: string, lang: Language = 'ru'): string {
    return getProperty(this.translations[lang], key, key);
  }

  getIntlNumberFormat(lang: Language = 'ru'): Intl.NumberFormat {
    return Intl.NumberFormat(
      lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US',
      { style: 'decimal' },
    );
  }

  getUserLanguage(telegramId: number): Language {
    // In a real implementation, you would fetch the user's language preference from a database
    // For now, defaulting to English - you could implement logic to determine
    // the language based on Telegram locale settings or user profile
    return 'ru';
  }
}
