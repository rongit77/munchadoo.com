import type { Locale } from "./places";
export type Audience = "family" | "couple" | "friends" | "work";
export type GameType = "would" | "guess";
const would: Record<Audience, Record<Locale, [string, string][]>> = {
  family: {
    he: [
      ["פיצה לארוחת בוקר", "פנקייק לארוחת ערב"],
      ["גלידה שלא נמסה", "פופקורן שלא נגמר"],
      ["לבשל עם רובוט", "לאכול עם דינוזאור"],
      ["לגדל עץ של מנגו", "לגלות נהר של שוקו"],
      ["פיקניק על הירח", "מסעדה מתחת לים"],
    ],
    en: [
      ["Pizza for breakfast", "Pancakes for dinner"],
      ["Ice cream that never melts", "Popcorn that never runs out"],
      ["Cook with a robot", "Dine with a dinosaur"],
      ["Grow a mango tree", "Discover a chocolate river"],
      ["A picnic on the moon", "A restaurant under the sea"],
    ],
  },
  couple: {
    he: [
      ["לבשל יחד בלי מתכון", "לצאת למסעדה בהפתעה"],
      ["פיקניק בשקיעה", "ארוחת בוקר מול הים"],
      ["לחלוק את הקינוח האחרון", "להזמין שני קינוחים שונים"],
      ["סדנת פסטה", "סיור טעימות בשוק"],
      ["שולחן על גג", "שולחן בגינה"],
    ],
    en: [
      ["Cook together without a recipe", "Try a surprise restaurant"],
      ["A sunset picnic", "Breakfast by the sea"],
      ["Share the last dessert", "Order two different desserts"],
      ["A pasta workshop", "A market tasting tour"],
      ["A rooftop table", "A garden table"],
    ],
  },
  friends: {
    he: [
      ["כל אחד מזמין לאחר", "כולם חולקים הכול"],
      ["טיול בעקבות טאקו", "טיול בעקבות פיצה"],
      ["תחרות קישוט עוגות", "תחרות הכנת כריכים"],
      ["אותה מסעדה כל שבוע", "מקום חדש בכל פעם"],
      ["ארוחת לילה", "בראנץ׳ ארוך"],
    ],
    en: [
      ["Order for each other", "Share every dish"],
      ["A taco road trip", "A pizza road trip"],
      ["A cake decorating contest", "A sandwich building contest"],
      ["The same place every week", "A new place every time"],
      ["A late-night meal", "A very long brunch"],
    ],
  },
  work: {
    he: [
      ["ארוחת צוות על הדשא", "ארוחת צוות על הגג"],
      ["קפה מושלם תמיד", "ארוחת צהריים מפתיעה"],
      ["יום פיצה שבועי", "יום מרקים שבועי"],
      ["להמציא שם למנה", "לעצב את התפריט"],
      ["ארוחה בלי לדבר על עבודה", "סיעור מוחות על קינוח"],
    ],
    en: [
      ["A team lunch on the lawn", "A team lunch on the roof"],
      ["Always perfect coffee", "A surprise lunch each day"],
      ["A weekly pizza day", "A weekly soup day"],
      ["Name a new dish", "Design the menu"],
      ["A lunch with no work talk", "Brainstorm over dessert"],
    ],
  },
};
const guesses: Record<Locale, { clues: string[]; answer: string }[]> = {
  he: [
    {
      clues: [
        "אני עגולה, אבל מגיעה במשולשים.",
        "יש לי שמיכה של גבינה.",
        "התוספות שלי תמיד פותחות ויכוח.",
      ],
      answer: "פיצה 🍕",
    },
    {
      clues: [
        "אני אוהב להסתובב על מזלג.",
        "אני מגיע עם רוטב, אבל לא עם כפית.",
        "יש לי בני דודים בצורת פרפרים.",
      ],
      answer: "ספגטי 🍝",
    },
    {
      clues: [
        "אני מגיעה בכדור, אבל לא משחקים בי.",
        "בקיץ צריך לאכול אותי מהר.",
        "לפעמים הבית שלי עשוי מוופל.",
      ],
      answer: "גלידה 🍦",
    },
    {
      clues: [
        "אני פריך מבחוץ ורך מבפנים.",
        "אני אוהב טחינה וחברים בפיתה.",
        "חומוס הוא חומר הגלם שלי.",
      ],
      answer: "פלאפל 🧆",
    },
    {
      clues: [
        "אני עטוף היטב.",
        "האורז שלי דביק בכוונה.",
        "לפעמים אוכלים אותי עם מקלות.",
      ],
      answer: "סושי 🍣",
    },
  ],
  en: [
    {
      clues: [
        "I am round, but arrive in triangles.",
        "I wear a blanket of cheese.",
        "My toppings always start a debate.",
      ],
      answer: "Pizza 🍕",
    },
    {
      clues: [
        "I love twirling around a fork.",
        "I arrive with sauce, but not a spoon.",
        "Some of my cousins look like butterflies.",
      ],
      answer: "Spaghetti 🍝",
    },
    {
      clues: [
        "I come in scoops, not slices.",
        "You have to eat me fast in summer.",
        "Sometimes my home is made of a waffle.",
      ],
      answer: "Ice cream 🍦",
    },
    {
      clues: [
        "I am crisp outside and soft inside.",
        "I love tahini and a cozy pita.",
        "Chickpeas are my main ingredient.",
      ],
      answer: "Falafel 🧆",
    },
    {
      clues: [
        "I am neatly wrapped.",
        "My rice is sticky on purpose.",
        "Sometimes you eat me with chopsticks.",
      ],
      answer: "Sushi 🍣",
    },
  ],
};
export function gameCards(type: GameType, audience: Audience, locale: Locale) {
  return type === "would"
    ? would[audience][locale].map((options) => ({
        options,
        clues: [] as string[],
        answer: "",
      }))
    : guesses[locale].map((card) => ({ ...card, options: [] as string[] }));
}
