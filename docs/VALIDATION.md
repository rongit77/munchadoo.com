# בדיקת האבטיפוס הראשון

תאריך: 14 בנובמבר 2026. סביבת הבדיקות הסופית: Node 24.22.1, Next.js 16.4.6 ו־Vitest 5.1.0. זו בדיקת אבטיפוס עם נתוני דמה, לא אימות ספק חי.

## בדיקות אוטומטיות

- lint: עבר ללא שגיאות או אזהרות.
- typecheck: עבר. הפקודה מייצרת גם טיפוסי Next לפני בדיקה, כדי לתמוך ב־checkout נקי.
- 13 בדיקות יחידה עברו: רדיוס כולל גבול מדויק, קלט לא תקין, מטבח, deduplication, אזור ריק, סטטוסים, בחירה ללא חזרה, אפס/מועמדת אחת, מיפוי אחיד של אינדקסי הגרלה, בדיקת סטטוס דרך ספק ושלמות משחקים בשתי שפות וארבעה קהלים.
- production build: עבר; דף הבית נוצר בהצלחה.
- audit לאחר עדכון תלויות: אפס ממצאים מדווחים.
- CI מוגדר ב־.github/workflows/ci.yml; ריצה מרוחקת אינה חלק מהאימות המקומי הזה.

## בדיקות דפדפן שבוצעו

התצוגה המקומית החזירה HTTP 200 ונבדקה בדפדפן הפנימי, בתצוגת מחשב ובתצוגת מובייל צרה.

- מסך הבית בעברית, קמע, סינון וכרטיסי מקומות.
- הגרלה ופתיחת חלון תוצאה עם תווית דמה ומיקוד בכפתור סגירה.
- מעבר לאנגלית ול־LTR.
- מעבר לאזור חיפה מחזיר אפס תוצאות וכפתור הגרלה מושבת; חזרה לדמו בתל אביב משחזרת תוצאות.
- מסנן פיצה משאיר מועמדת פתוחה אחת ומציג הודעה מתאימה.
- לחיצה חוזרת על מסנן פעיל אינה משאירה את כפתור ההגרלה במצב טעינה.
- ביטול מסנן פתוחות מציג מקום ששעותיו לא ידועות עם תווית נפרדת.
- מעבר מחלון התוצאה למשחקים.
- משחק בחירות באנגלית: בחירה, חמישה סיבובים ומסך סיום.
- משחק רמזים בעברית: חשיפת התשובה.
- במובייל בעברית נבדקה התאמת רוחב המסמך לרוחב התצוגה ללא גלילה אופקית.

## מה עדיין לא אומת

הרשאת מיקום שנדחתה ו־timeout ממכשיר אמיתי, בדיקת נגישות מלאה בקורא מסך, הגדרת reduced motion במערכת, כיסוי כל גדלי המסך, דפדפני Safari/Firefox, CI מרוחק ותקלות של ספק אמיתי. קוד הטיפול בשגיאות מיקום ו־reduced motion קיים, אך אינו מוצג כאן כבדיקה שבוצעה.

חישוב שעות פתיחה לפי אזור זמן, חצות ושעון קיץ אינו קיים בספק הדמה וייבנה עם האינטגרציה החיה. אין במוצר הזה עדיין חשבונות, הזמנות, ניווט למקומות אמיתיים או חדרים מרובי מכשירים.

## חיבור Google Places

בדיקה חיה באזור תל אביב החזירה שלוש מסעדות פתוחות. בדפדפן אומתו שמות וכתובות אמיתיים, הגרלה עם אימות נוסף וקישור Maps הכולל place ID. 20 בדיקות יחידה עברו, כולל validation, unknown/closed, סינון מרחק, שגיאות ספק, מפתח חסר ומכסות מקומיות; lint, typecheck ו־production build עברו. אין טענה שנבדקו כיסוי עולמי, מעברי שעון או הרשאות מיקום במכשירים נוספים.

## התקנה למסך הבית

29 בדיקות עברו: נוסף כיסוי לדחייה למשך שבוע, שמירת נוסח, storage פגום, זיהוי iPad במצב desktop, manifest, הסתרה במצב מותקן/לא זמין, פתיחה ידנית בזמן cooldown והפרדה בין אישור בקשה להתקנה. lint, typecheck ו־build עברו. manifest.webmanifest הוחזר מהשרת עם שלושה אייקונים ומצב standalone; האייקון נבדק חזותית.

בדפדפן המקומי נבדקו כפתור קבוע, הצגת הדרכה לדפדפן ללא prompt, דחיית הכרטיס, פתיחה ידנית לאחר דחייה ומעבר עברית/אנגלית. התקנה native ואירוע beforeinstallprompt אמיתי, מסכי iOS והתקנה בטלפונים לא אומתו. המדידה מקומית בלבד ואינה מוכיחה שיפור בהתקנות או חזרה לאחר שבוע.

## פרטיות, עמודי מידע ונגישות

37 בדיקות עברו; lint, typecheck ו־production build עברו. נבדקו חסימת קריאה/כתיבה אופציונלית ללא הסכמה, מחיקת מידע legacy, סירוב, אישור, ביטול, תפוגה, רשומות פגומות ואחסון חסום. בדיקות עמודים מאמתות קישור קשר, יעד דילוג, h1 ותנאי Google. כל כותבי האחסון במוצר עוברים דרך lib/privacy.ts; אין טעינת גופנים חיצונית בקוד. בדיקת תוצרי הדפדפן לא מצאה את מפתח Google.

בדפדפן: חלונית התאמה אישית ללא סימון אופציונלי מראש; חיוניים בלבד נשמרו לאחר מעבר/טעינה של עמוד הפרטיות; אישור נבדק בפתיחה חוזרת ובוטל; עמודי פרטיות/אודות והעדפות פעלו בעברית/אנגלית. הגדלת טקסט ל־20px ברמת השורש וניגודיות גבוהה לא יצרו גלילה אופקית ברוחב 863px שנבדק; צמצום תנועה הופעל; main יחיד ויעדי aria-describedby תקינים. סינון DOM בסיסי זיהה ניגודיות נמוכה בכפתור ההגרלה ובתווית האיור ותוקנו הצבעים. נבדקה תמונת המסך במצב מוגדל ובניגודיות גבוהה.

לא בוצעה ביקורת WCAG מלאה, בדיקת קורא מסך אמיתי, סוויטת מקלדת מלאה, בדיקת נייד פיזי או בדיקת 400% zoom. לא ניתן להסיק תאימות משפטית או תו נגישות מהבדיקות. מגבלות אלו מפורטות בהצהרת הנגישות וב־PRIVACY-ACCESSIBILITY-REVIEW.md.

## Namecheap publication — 2026-11-14

SSH key authentication verified to the configured hosting account. Published release
`20261114T213429Z-428` using `scripts/publish.sh` from the local workstation.
Lint, typecheck, all 37 tests and isolated production build passed. Remote HTTPS
certificate validation, home-page response and byte comparison of a compiled JS
asset passed using the hosting IP explicitly while DNS propagates. Existing cPanel
environment variables and node_modules were preserved. Backup was created under
`~/munchadoo-releases/20261114T213429Z-428/backup`. Automatic rollback is implemented
but has not been fault-injection tested. Live restaurant-provider search was not
part of this deployment smoke check. macOS tar metadata warnings were non-fatal.

## Global location selection

Removed the preset-only selector and implicit Tel Aviv centre. Device geolocation
is explicit and requests high accuracy, with timeout/permission errors retained.
Added server-side Places Text Search for city/address candidates, selected explicitly
before restaurant search. No location persistence or background tracking. Privacy
copy updated for address text. 39 tests, lint, typecheck and production build passed;
live public-city query for Ra'anana succeeded and candidate selection was exercised
in the local browser. Actual device positioning/permission denial on phones remains
unverified. This change is prepared locally, not yet published.
