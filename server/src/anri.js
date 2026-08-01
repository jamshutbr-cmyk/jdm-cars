/**
 * Анри — модератор контента JDM Cars.
 * Проверяет посты перед публикацией в ленту.
 * Работает локально, без внешних API.
 */

// Список матных/оскорбительных слов (основные корни — покрывают словоформы)
const BAD_WORDS = [
  'хуй', 'хуе', 'хую', 'хуя', 'хуёв', 'хуёс', 'хуяс',
  'пизд', 'пиздё', 'пизды',
  'еба', 'ебат', 'ебан', 'ебла', 'ёба', 'ёбан',
  'блят', 'блядь', 'бляд',
  'сука', 'суки', 'суку',
  'мудак', 'мудил',
  'пидор', 'пидар', 'пидр',
  'залуп', 'залупа',
  'ублюд',
  'шлюх', 'шлюха',
  'ёб', 'yoba', 'yob',
  'fuck', 'fck', 'fuk', 'fuq',
  'shit', 'sht',
  'bitch', 'btch',
  'nigga', 'niger', 'nigger',
  'cunt', 'cnt',
  'ass', 'arse',
  'cock', 'cok',
  'dick', 'dik',
  'pussy', 'pus5y',
  // Латинская транслитерация русского мата — самый частый способ обхода фильтра
  'hui', 'huy', 'huj', 'xuy', 'xui', 'xuy',
  'pizd', 'pizda', 'pizdec', 'pisda',
  'eba', 'ebat', 'eban', 'ebla', 'ebu4', 'ebuchi',
  'blyat', 'blya', 'bliad', 'blyad',
  'suka', 'suki', 'suku',
  'mudak', 'mudila',
  'pidor', 'pidar', 'pidr', 'pidoras',
  'zalup',
  'ublyud',
  'shluha', 'shlyuha',
];

// Известные автомобильные бренды — хотя бы один токен должен быть узнаваем
const KNOWN_BRANDS = [
  'toyota', 'honda', 'nissan', 'mazda', 'subaru', 'mitsubishi', 'lexus', 'infiniti', 'acura',
  'suzuki', 'daihatsu', 'isuzu', 'scion',
  'bmw', 'mercedes', 'audi', 'volkswagen', 'vw', 'porsche', 'opel', 'ford', 'chevrolet',
  'dodge', 'jeep', 'cadillac', 'lincoln', 'buick', 'gmc', 'pontiac',
  'hyundai', 'kia', 'genesis', 'daewoo',
  'ferrari', 'lamborghini', 'maserati', 'alfa', 'fiat', 'lancia',
  'peugeot', 'renault', 'citroen', 'bugatti',
  'volvo', 'saab', 'skoda', 'seat', 'lada', 'ваз', 'газ', 'уаз',
  'land', 'rover', 'jaguar', 'bentley', 'rolls', 'aston', 'mclaren',
  'tesla', 'rivian', 'lucid',
  'rx', 'gt', 'gtr', 'sti', 'evo', 'wrx', 'supra', 'skyline', 'silvia', 'integra',
  'civic', 'accord', 'camry', 'corolla', 'celica', 'mx', 'rx7', 'rx8',
  'impreza', 'legacy', 'outback', 'lancer', 'eclipse', 'galant',
  'anreal', // разрешаем кастомные названия
];

/**
 * Нормализует строку для проверки: нижний регистр, убираем l33t-speak
 */
function normalize(str) {
  return str
    .toLowerCase()
    .replace(/[0-9]/g, (c) => ({ '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '8': 'b' }[c] || c))
    .replace(/[^a-zа-яёa-z\s]/gi, ' ');
}

/**
 * Проверяет строку на наличие мата.
 * Проверяем и обычную нормализованную строку, и версию со схлопнутыми
 * повторяющимися буквами (чтобы ловить обход вида "хуууй", "fuuuck").
 */
function containsBadWords(text) {
  const norm = normalize(text);
  const collapsed = norm.replace(/(.)\1+/g, '$1');
  return BAD_WORDS.some((word) => norm.includes(word) || collapsed.includes(word));
}

/**
 * Проверяет, является ли строка бессмысленным набором символов
 * (тип "аоаоаоао", "fdasfdsf", "111111")
 */
function isGibberish(str) {
  if (!str || str.trim().length === 0) return false;
  const s = str.trim();

  // Слишком много повторяющихся символов подряд (ааааа, hhhhh)
  if (/(.)\1{4,}/.test(s)) return true;

  // Чередующиеся 2 символа (аоаоаоао, ababab)
  if (/^(.{1,2})\1{4,}$/.test(s.toLowerCase())) return true;

  // Только случайные согласные без гласных (от 6 символов и длиннее)
  const lettersOnly = s.replace(/[^a-zA-Zа-яёА-ЯЁ]/g, '');
  if (lettersOnly.length >= 6) {
    const vowelsRu = (lettersOnly.match(/[аеёиоуыэюяАЕЁИОУЫЭЮЯ]/g) || []).length;
    const vowelsEn = (lettersOnly.match(/[aeiouAEIOU]/g) || []).length;
    const totalVowels = vowelsRu + vowelsEn;
    // Меньше 10% гласных — подозрительно
    if (totalVowels / lettersOnly.length < 0.1) return true;
  }

  // Длинная цепочка согласных подряд (5+) — ловит случаи вроде "asdfgh",
  // у которых формально есть гласная, но её процент проходит по общему порогу.
  // 'y'/'ё' считаем гласноподобными, чтобы не ловить реальные слова
  // (Chrysler, Skyline, Wrangler и т.п.). Проверяем по каждому слову отдельно,
  // иначе граница между словами склеивает согласные и ловит нормальные
  // сокращения вроде "WRX STI" (конец одного слова + начало другого).
  const vowelLike = /[аеёиоуыэюяАЕЁИОУЫЭЮЯaeiouyAEIOUY]/;
  const hasLongConsonantRun = s.split(/\s+/).some((word) => {
    const letters = word.replace(/[^a-zA-Zа-яёА-ЯЁ]/g, '');
    let run = 0;
    let maxRun = 0;
    for (const ch of letters) {
      if (vowelLike.test(ch)) {
        run = 0;
      } else {
        run += 1;
        maxRun = Math.max(maxRun, run);
      }
    }
    return maxRun >= 5;
  });
  if (hasLongConsonantRun) return true;

  // Слишком короткое для бренда (меньше 2 символов)
  if (s.replace(/\s/g, '').length < 2) return true;

  return false;
}

/**
 * Основная функция модерации. Возвращает { ok: true } или { ok: false, reason: string }
 */
export function anriCheck({ brand, model, year, caption }) {
  // 1. Проверка на мат в любом поле
  const fieldsToCheck = [brand, model, caption].filter(Boolean).join(' ');
  if (containsBadWords(fieldsToCheck)) {
    return {
      ok: false,
      reason: 'Анри не пропустил: в тексте обнаружены недопустимые слова. Пожалуйста, исправьте и попробуйте снова.',
    };
  }

  // 2. Проверка бренда на бессмыслицу
  if (isGibberish(brand)) {
    return {
      ok: false,
      reason: `Анри: марка "${brand}" выглядит как набор случайных символов. Укажите настоящую марку автомобиля.`,
    };
  }

  // 3. Проверка модели на бессмыслицу
  if (isGibberish(model)) {
    return {
      ok: false,
      reason: `Анри: модель "${model}" выглядит как набор случайных символов. Укажите настоящую модель.`,
    };
  }

  // 4. Проверка года
  const yearNum = Number(year);
  const currentYear = new Date().getFullYear();
  if (!year || isNaN(yearNum) || yearNum < 1885 || yearNum > currentYear) {
    return {
      ok: false,
      reason: `Анри: год выпуска "${year}" не похож на настоящий. Укажите год от 1885 до ${currentYear}.`,
    };
  }

  // 5. Проверка описания на мат и бессмыслицу (если есть)
  if (caption && caption.trim().length > 0) {
    if (isGibberish(caption) && caption.trim().length > 10) {
      return {
        ok: false,
        reason: 'Анри: описание выглядит как случайный набор символов. Напишите что-нибудь осмысленное или оставьте поле пустым.',
      };
    }
  }

  // 6. Слишком короткий бренд (1 символ — не считается)
  if (brand.trim().length < 2) {
    return {
      ok: false,
      reason: 'Анри: укажите полное название марки (минимум 2 символа).',
    };
  }

  // 7. Слишком короткая модель
  if (model.trim().length < 1) {
    return {
      ok: false,
      reason: 'Анри: укажите модель автомобиля.',
    };
  }

  // 8. Слишком длинные поля
  if (brand.trim().length > 20) {
    return { ok: false, reason: 'Анри: название марки слишком длинное (максимум 20 символов).' };
  }
  if (model.trim().length > 20) {
    return { ok: false, reason: 'Анри: название модели слишком длинное (максимум 20 символов).' };
  }

  return { ok: true };
}
