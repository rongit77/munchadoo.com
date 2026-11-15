# החלטות טכנולוגיות

תאריך בסיס: 14 בנובמבר 2026. הבחירות הטכניות להלן הן ברירות מחדל מוצעות לפיתוח, ולא החלטות שאושרו בעבר על ידי המשתמש.

| מזהה | מצב | החלטה ונימוק | מתי לבחון מחדש |
| --- | --- | --- | --- |
| ADR-001 | מוצע | Web רספונסיבי ב־TypeScript ו־Next.js כדי לאחד ממשק ושרת קטן בפרויקט אחד | לפני הקמת השלד ובחירת סביבת אירוח |
| ADR-002 | מוצע | ספק מסעדות מאחורי ממשק PlacesProvider, ומתאם דמה לפיתוח | אחרי בדיקת כיסוי, עלות ותנאי שימוש באזור הניסוי |
| ADR-003 | מוצע | ללא מסד נתונים ב־MVP המקומי; מצב משחק זמני במכשיר | כשנדרשים חדרים, חשבונות או התמדה |
| ADR-004 | מוצע | בהמשך PostgreSQL לנתוני מוצר; נתוני ספק נשמרים רק לפי תנאיו | לפני מימוש חדרים ונתוני משתמשים |
| ADR-005 | מוצע | מילוני עברית ואנגלית, RTL/LTR ומפתחות טקסט מההתחלה | בכל הרחבת שפה |
| ADR-006 | מוצע | Vitest ללוגיקת סינון והגרלה, Playwright לזרימות קריטיות | לאחר בחירת גרסאות ותשתית |
| ADR-007 | דרישת מוצר | אינטגרציות Wolt ותן ביס מותנות בגישה מורשית; אין תלות בהן להשקה | עם קבלת הסכם וגישה מתועדת |
| ADR-008 | ברירת מחדל תפעולית | מאגר GitHub פרטי; ללא פריסה ציבורית אוטומטית בשלב ההקמה | לפי הנחיית בעל הפרויקט |

## גבולות המערכת

הדפדפן שולח בקשת חיפוש לשרת Munchadoo. השרת מאמת קלט, מגביל קצב, קורא לספק דרך מתאם ומחזיר שדות מותרים. ספק חי אחד מספיק לפיילוט. קוד ההגרלה ומשחקי ההמתנה אינם תלויים במותג ספק. יש לשמור הפרדה בין נתוני מקור, נתונים מחושבים ותוכן משחק מקורי.

## החלטות פתוחות

אזור ניסוי, ספק מסעדות, תקציב חודשי ומגבלת בקשות, אירוח, מדיניות analytics, שם הקמע והעיצוב הסופי. היעדר החלטות אלה אינו חוסם שלד עם נתוני דמה. הוא כן חוסם התחייבות לעלות, כיסוי או השקה חיה.

## בדיקות לפני בחירת תלויות וספקים

במשימת השלד יש לבדוק תיעוד רשמי עדכני, גרסאות נתמכות והתאמה לסביבת האירוח, ולנעול גרסאות. אין כאן קביעה של גרסאות או מחירים. בבחירת ספק יש לתעד זכויות הצגה ואחסון, ייחוס, תמונות, תנאי cache, כיסוי שעות פתיחה, מכסות ועלות צפויה.


## מימוש האבטיפוס הראשון

ADR-001, ADR-002, ADR-003, ADR-005 ו־ADR-006 מיושמים כעת בחלקם: Next.js App Router עם TypeScript, מתאם דמה, מצב זמני בזיכרון, מילוני עברית ואנגלית ו־Vitest. זהו מימוש הנדסי במסגרת הבקשה להתחיל בפיתוח. אין מסד נתונים או ספק חי. בדיקות דפדפן בוצעו דרך תצוגה מקומית; סוויטת Playwright מתמשכת עדיין לא נוספה.

הגרסאות המדויקות נעולות ב־package-lock.json. Node 24 נבחר לסביבת הפיתוח ול־CI. כלי הבדיקות עודכן ל־Vitest 5.1.0 בעקבות דוח תלויות; override נקודתי ל־minimatch 11.0.1 תחת typescript-estree פותר את ממצא ה־audit. יש לבחון הסרתו כאשר תלויות המקור יכילו את התיקון.

מקורות להכנת השלד: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Vitest migration](https://vitest.dev/guide/migration/).

## Google Places — ניסוי מקומי מאושר

המשתמש הפעיל Places API (New) והגדיר מפתח מקומי לצורך החיבור. Nearby Search עם field mask מוגדר (כולל currentOpeningHours, מדרגת Enterprise), עד 20 תוצאות לפי מרחק. Place Details מאמת openNow לפני הצגת זוכה; לא מחשבים שעות לפי שעון הדפדפן. אין תמונות, ביקורות או מחירים מומצאים, אין אחסון מתמשך של תוכן ספק. נשלחים רק שדות המיקום הנדרשים, ללא לוג קואורדינטות. מפתח בשרת בלבד.

מגבלות: 20 קריאות לדקה ו־100 לתהליך. הן אינן תקרת תקציב או הגנה מתאימה לאתר ציבורי. אין עדיין אישור פריסה; נדרשים הגבלת מפתח לשרת, מכסות Google, תנאי שימוש ומדיניות פרטיות ציבוריים, מדיניות תקציב ובדיקת כיסוי לפני פיילוט ציבורי. ייחוס Google Maps מוצג בצמוד לתוצאות ובחלון הזוכה; ייחוס ספק נוסף מוצג אם קיים.

מקורות: [Nearby Search](https://developers.google.com/maps/documentation/places/web-service/nearby-search), [Place Details](https://developers.google.com/maps/documentation/places/web-service/place-details), [Policies](https://developers.google.com/maps/documentation/places/web-service/policies).

## חוויית התקנת PWA

המשתמש אישר הצעה לאחר הצלחה והדרכה לפי מכשיר. ההצעה מופיעה inline אחרי פעולות מסעדה ובסיום משחק, ללא חסימת הניווט וללא הגבלת יכולות למשתמשים שלא מתקינים. לא מבקשים הרשאת notifications. beforeinstallprompt נשמר ומופעל רק בלחיצה ומנוצל פעם אחת. ב־Safari iOS ניתנות הוראות שיתוף והוספה למסך הבית; ביישומים פנימיים ממליצים לפתוח בדפדפן.

ניסוי נוסח נשמר בדפדפן בלבד; לא נבחר ספק analytics. אין עדיין נתוני המרה או חזרה אמיתיים. cooldown שבעה ימים נשמר מקומית; זיהוי standalone מסתיר את ההצעה. Manifest יציב עם id=/, scope=/, start_url=/ ואייקוני הקמע. אין service worker או offline cache: התקנה בדפדפנים תומכים אינה מחייבת עבודה ללא רשת, ומידע מסעדות נשאר חי.

מקורות: [Next.js PWA](https://nextjs.org/docs/app/guides/progressive-web-apps), [Installation prompt](https://web.dev/learn/pwa/installation-prompt).

## פרטיות ונגישות — עדכון מאושר

המפעילה כפי שנמסרה: Clickabily; פניות: info@clickabily.com. נוספו עמודי מידע דו־לשוניים ותנאים, קישורי מדיניות Google, הסכמה אופציונלית למדידה מקומית, ביטול ומחיקה, הפרדת snooze חיוני מהמדידה. מדידה מלפני מנגנון ההסכמה נמחקת כשאין הסכמה תקפה. הוסרו גופני Google החיצוניים.

טקסטים נגישים, ניווט מקלדת והודעות מצב משופרים; כלי נגישות משלימים את העבודה בבסיס. לא נטענת עמידה מלאה בתקן. מסמכי המשתמש משקפים את הגרסה הנוכחית; השלמות משפטיות ותפעוליות מתועדות ב־PRIVACY-ACCESSIBILITY-REVIEW.md.

## Munch Club, accounts and arcade — 2026-11-15

User expanded scope to guest/Google registration, profile, favorites, coins, badges and three games. The earlier no-accounts MVP boundary is superseded for this increment.

- SQLite via Node 24 `node:sqlite`, lazy connection, WAL and transactions, stored under `MUNCH_DATABASE_PATH` (default `data/munchadoo.sqlite`). Appropriate for the current single Namecheap host, not horizontal multi-host deployment. Data must remain outside public files and release replacement. `data/` is ignored and excluded from build staging.
- Google Identity Services with Web client ID, `jose` 6.2.17 signature verification against Google's JWKS. Verify issuer, audience, expiration, issue time and single-use session nonce; do not store Google tokens. No client secret required for this ID-token flow. Script loaded only after sign-in intent. New Google identity upgrades current guest; existing identity loads its established account without transferring guest coins.
- Opaque random sessions stored hashed, HttpOnly/SameSite=Lax/Secure in production, 30 days. Same-origin JSON mutation endpoints; per-process request throttle. SQLite contains nickname, Google subject if registered, place IDs and user-authored aliases, rounds, ledger. No email/photo persistence or restaurant data copying.
- Original brick-style figures for the requested LEGO-style slots; no LEGO branding or claimed affiliation. Wheel is interpreted as a separate party challenge game.
- Coins are non-purchasable, non-transferable play points with no current redemption or monetary value. Fixed 10 points for completing a round (correct number / any wheel or slot result), maximum 100 per UTC day per profile. All random outcomes and credits are server-owned; atomic unique round ledger prevents duplicate credit. Slots never debit coins. Guest resets can circumvent per-profile limits: real prizes must not rely on this pilot system without verified-account eligibility, abuse controls and separate reward terms.
- Six badges derived from completed rounds and favorite presence. Profile deletion removes account, sessions, rounds, favorites and ledger. Original question games retain their existing local-only behavior and do not award points in this increment.
- Sources: https://developers.google.com/identity/gsi/web/guides/verify-google-id-token ; https://developers.google.com/identity/gsi/web/guides/display-button ; https://nodejs.org/api/sqlite.html
