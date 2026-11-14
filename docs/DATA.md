# מודל נתונים ואינטגרציות

## ישויות מוצעות

| ישות | שדות עיקריים | כללים |
| --- | --- | --- |
| SearchRequest | latitude, longitude, radiusMeters, locale, cuisine | גבולות קלט; מיקום זמני ללא כתיבה ללוג |
| Place | provider, providerPlaceId, name, coordinates, address, timezone, cuisines, openStatus, fetchedAt, sourceUrl, attribution | מפתח מורכב ספק ומזהה; unknown מותר; שדות אופציונליים נשארים חסרים |
| OrderLink | provider, url, verifiedAt, availabilityStatus | קישור הוא הפניה בלבד; זמינות משלוח יכולה להיות unknown |
| DrawSession | candidateIds, previousWinnerId, selectedId, selectedAt | זמני במכשיר ב־MVP; מועמדות מסוננות ומנוכות כפילויות |
| GameDefinition | id, locale, audience, prompts, durationMinutes | תוכן מקורי ובקרת התאמה לקהל |
| GameSession | gameId, turnIndex, playerCount, completed | אין צורך בשמות אמיתיים או חשבונות |

## חוזה ספק מוצע

PlacesProvider יחשוף searchNearby(request) ו־getPlaceStatus(id, now). התשובה תכלול results, fetchedAt, coverage/truncation, attribution ו־error מסוג מוגדר. מתאם חי אחראי לנרמול, רעננות ותנאי ספק; מתאם דמה מסמן במפורש את מקור הדמה.

## אבטחה ואמינות

מפתחות ספק נשמרים בצד השרת. יש לאמת קואורדינטות, רדיוס ומספר תוצאות, להגביל בקשות ולהשתמש ב־timeouts. אין להציג דירוג, אלרגנים, שעות או זמני משלוח מומצאים. קישורי יציאה הם HTTPS ממקור מאומת; אין לקבל יעד חופשי לפרוקסי. אין לאחסן payload מלא של ספק כברירת מחדל.

## שיתופי פעולה

Wolt ותן ביס הם יעדים עתידיים לבדיקה. לפני פיתוח מתאם יש לתעד אישור שימוש, שווקים נתמכים, שדות זמינים, כללי מיתוג, הרשאות ודרך ביטול. גם ספק מסעדות כללי דורש בדיקת תנאים וכיסוי. אין להניח שהרשאת הפניה מקנה גישה לנתוני משלוחים או הזמנות.
