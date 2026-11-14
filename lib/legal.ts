export type LegalKind = "about" | "privacy" | "terms" | "accessibility";
type Section = { heading: string; paragraphs: string[] };
type Document = { title: string; intro: string; sections: Section[] };
export const operator = { name: "Clickabily", email: "info@clickabily.com" };
export const updated = "2026-11-14";
export const legal: Record<"he" | "en", Record<LegalKind, Document>> = {
  he: {
    about: {
      title: "על Munchadoo",
      intro: "פחות התלבטויות. יותר ביסים.",
      sections: [
        {
          heading: "מה אנחנו עושים",
          paragraphs: [
            "Munchadoo עוזרת לבחור איפה לאכול בעזרת חיפוש מסעדות בסביבה והגרלה מתוך התוצאות המתאימות. בזמן ההמתנה אפשר לשחק יחד במשחקים קצרים למשפחות, זוגות, חברים ועמיתים.",
          ],
        },
        {
          heading: "מי מפעיל את השירות",
          paragraphs: [
            "Munchadoo מופעלת על ידי Clickabily. לפניות כלליות, פרטיות ונגישות: info@clickabily.com.",
          ],
        },
        {
          heading: "איך נבחרות המסעדות",
          paragraphs: [
            "נתוני המסעדות מתקבלים מ־Google Maps. החיפוש מוגבל לעד 20 תוצאות מהספק ומסונן לפי הבחירות שלכם. ההגרלה אקראית מתוך המקומות הפתוחים שהוחזרו; היא אינה סקירה של כל המסעדות באזור ואינה המלצה מקצועית על איכות או התאמה.",
            "האיורים באתר הם להמחשה ואינם תמונות של המסעדות. כרגע אין מסלולי קידום בתשלום או משקל מסחרי בהגרלה.",
          ],
        },
        {
          heading: "מה עדיין לא כלול",
          paragraphs: [
            "השירות נמצא בשלב ניסוי. אין הזמנה, תשלום או משלוח בתוך Munchadoo. אין חיבור פעיל ל־Wolt או לתן ביס ואין טענה לשותפות איתם.",
          ],
        },
      ],
    },
    privacy: {
      title: "מדיניות פרטיות ואחסון בדפדפן",
      intro:
        "המדיניות מתארת את המידע המשמש את הגרסה הנוכחית של Munchadoo ואת הבחירות שבידיכם.",
      sections: [
        {
          heading: "המפעילה ויצירת קשר",
          paragraphs: [
            "השירות מופעל על ידי Clickabily. לפניות בנוגע למידע אישי, עיון, תיקון או מחיקה ולהעדפות פרטיות, כתבו ל־info@clickabily.com.",
          ],
        },
        {
          heading: "חיפוש מסעדות ומיקום",
          paragraphs: [
            "כדי לחפש, נשלחים לשרת Munchadoo מיקום מרכז החיפוש, הרדיוס, סוג האוכל והשפה. השרת מעביר ל־Google את המיקום ופרטי החיפוש הדרושים לקבלת מסעדות. בהקלדת שלושה תווים ומעלה בעיר או כתובת, לאחר הפסקה קצרה, הטקסט נשלח לשרת ול־Google כדי להציג מיקומים לבחירה. לאחר בחירה נשלח מרכז המיקום.",
            "מיקום המכשיר מתבקש רק בלחיצה על ״מצאו אוכל קרוב אליי״ ולאחר הרשאת הדפדפן. מסירתו היא בחירה שלכם ולא חובה: אפשר לבחור אזור ידנית ולהמשיך להשתמש במשחקים. סירוב להרשאה מונע רק את איתור מיקום המכשיר.",
            "אין מעקב מיקום ברקע. אם תבחרו לזכור את מיקום המכשיר, הקואורדינטות, הדיוק וזמן השמירה יישמרו במכשיר לשבעה ימים. ביטול הסימון מוחק את הרשומה. רשומה שפג תוקפה נמחקת בביקור הבא. כתובת שמחזירה Google אינה נשמרת באחסון זה. אין שמירה במסד נתונים או בלוגים ייעודיים. בקשות רשת עשויות לכלול מידע טכני, כגון כתובת IP וסוג הדפדפן, בפני שרת השירות וספקי התקשורת הרלוונטיים.",
          ],
        },
        {
          heading: "Google וקישורים חיצוניים",
          paragraphs: [
            "Google מספקת את נתוני המקומות ומעבדת את הבקשות לפי המדיניות שלה. הנתונים עשויים להיות מעובדים מחוץ למדינת מגוריכם. מדיניות הפרטיות של Google מקושרת למטה וחלה על עיבוד המידע על ידה.",
            "פתיחת קישור למפות מעבירה אתכם לשירות של Google עם זיהוי המסעדה שנבחרה. שם חלים התנאים והעדפות הפרטיות של אותו שירות. אנו לא מעבירים את מפתח השרת לדפדפן.",
          ],
        },
        {
          heading: "קוקיז, אחסון מקומי והסכמה",
          paragraphs: [
            "בגרסה הנוכחית קוד האפליקציה משתמש באחסון מקומי בדפדפן (localStorage), ולא בעוגיות פרסום. אין פיקסלים פרסומיים, שירות מדידה חיצוני או גופנים שנטענים מספק חיצוני.",
            "האחסון החיוני שומר את בחירת הפרטיות שלכם למשך עד 180 יום ואת בקשתכם לדחות הצעות התקנה למשך שבעה ימים. אין צורך לאשר מדידה כדי לחפש, להגריל או לשחק.",
            "רק אם תאשרו מדידה מקומית, נשמור בדפדפן נוסח כפתור התקנה, זמני ביקור ומוני הצגה, לחיצה, אישור בקשת התקנה ופתיחה כאפליקציה. הנתונים אינם נשלחים לשרת, ואינם כוללים מיקום, מסעדות או תשובות במשחק. לחיצה על התקנה אינה נחשבת אוטומטית להתקנה מוצלחת.",
            "אפשר לשנות את הבחירה דרך ״הגדרות פרטיות וקוקיז״ בתחתית כל עמוד. ביטול האישור מוחק את רשומת המדידה המקומית. בתום תקופת ההסכמה, המדידה תיעצר והנתונים יימחקו בביקור או בפעולה הבאים; אם לא חוזרים לאתר, נתוני הדפדפן נותרים עד מחיקה דרך הדפדפן.",
          ],
        },
        {
          heading: "משחקים ופניות אלינו",
          paragraphs: [
            "אין כרגע חשבון משתמש או פרופיל ילד. מצב המשחק והתשובות נשמרים בזיכרון העמוד בלבד ואינם נשלחים לשרת. ילדים יכולים לשחק עם מבוגר בלי למסור פרטים אישיים.",
            "אם תפנו באימייל, נקבל את כתובתכם ואת תוכן הפנייה לצורך מענה וטיפול, וייתכן שנצטרך לשמור תיעוד הדרוש לטיפול בפנייה או לחובות שבדין. הימנעו משליחת מידע רגיש שאינו נחוץ.",
          ],
        },
        {
          heading: "הזכויות והאפשרויות שלכם",
          paragraphs: [
            "ניתן לבקש מידע על העיבוד, עיון במידע אישי, תיקון ובמקרים המתאימים מחיקה, הגבלה או התנגדות, בהתאם לדין החל. ייתכן שנבקש אימות זהות מידתי. אין בכך הבטחה למחיקה כשקיימת חובה חוקית לשמור מידע.",
            "איננו מקבלים את רשומת המדידה המקומית ולכן אין לנו דרך לחפש אותה לפי שמכם. אפשר למחוק אותה באמצעות ביטול ההסכמה או מחיקת נתוני האתר בדפדפן. הרשאת מיקום ניתנת לביטול בהגדרות הדפדפן או המכשיר.",
            "שינויים מהותיים בעיבוד המידע יעודכנו במדיניות, וכאשר נדרש תתבקש הסכמה חדשה. ניתן לפנות גם לרשות להגנת הפרטיות או לרשות המוסמכת במקום מגוריכם.",
          ],
        },
      ],
    },
    terms: {
      title: "תנאי שימוש",
      intro:
        "Munchadoo היא כלי עזר לבחירת מסעדות ולמשחק משותף. אלה גבולות השירות בגרסת הניסוי.",
      sections: [
        {
          heading: "המפעילה והשירות",
          paragraphs: [
            "השירות מופעל על ידי Clickabily. לפניות: info@clickabily.com. השימוש אינו דורש כרגע תשלום או חשבון. שינוי מהותי בתנאים יוצג בעמוד זה; שירות בתשלום, אם יתווסף, ידרוש תנאים והסכמה נפרדים.",
          ],
        },
        {
          heading: "מידע על מסעדות",
          paragraphs: [
            "שעות פתיחה, כתובות וסיווגי אוכל מתקבלים מספק חיצוני ויכולים להיות חסרים או לא עדכניים. מומלץ לבדוק עם המסעדה לפני הגעה. סימון ״פתוח״ אינו הבטחה לקבלת הזמנות או לזמינות משלוחים.",
            "אין להסיק מסוג מטבח או מתוצאה בהגרלה מידע על אלרגנים, כשרות, נגישות פיזית, בטיחות מזון או התאמה תזונתית. יש לברר פרטים אלה ישירות עם המסעדה.",
          ],
        },
        {
          heading: "הגרלות וקישורים",
          paragraphs: [
            "הבחירה אקראית מתוך קבוצת התוצאות המתאימות שהתקבלה, ללא הבטחה לכלול כל עסק באזור. אין זכייה כספית או פרס, ואין צורך בתשלום להשתתפות.",
            "התקשרות עם מסעדה או שירות חיצוני נעשית מול אותו גורם. Munchadoo אינה מקבלת הזמנות או תשלומים ואינה מפעילה משלוחים. שימוש בתוכן ובשירותי Google Maps כפוף גם לתנאי Google Maps/Google Earth המקושרים למטה ולמדיניות הפרטיות של Google.",
          ],
        },
        {
          heading: "שימוש הוגן ותוכן",
          paragraphs: [
            "אין לנסות לעקוף מגבלות שימוש, לפגוע בזמינות השירות, לגשת למידע שאינו מיועד לכם או לבצע איסוף אוטומטי בלתי מורשה. השימוש בנתוני ספקים כפוף לזכויות ולתנאים שלהם.",
            "השם, העיצוב והתוכן המקורי של Munchadoo מוגנים לפי הדין החל; סימנים ותוכן של צדדים שלישיים שייכים לבעליהם. אין בעמוד זה מתן רישיון להפצה מחדש של נתוני מסעדות.",
          ],
        },
        {
          heading: "זמינות וזכויות",
          paragraphs: [
            "ייתכנו שגיאות, הפסקות ושינויים בשירות. נשתדל לטפל בדיווחים ולהציג מגבלות ידועות. אין בתנאים אלה כדי לשלול זכות צרכנית, אחריות או סעד שלא ניתן להתנות עליהם לפי הדין החל.",
            "אפשר לדווח על בעיה, מידע מטעה או פגיעה בזכויות באמצעות כתובת הקשר. נא לצרף קישור ותיאור קצר בלי מידע אישי מיותר.",
          ],
        },
      ],
    },
    accessibility: {
      title: "הצהרת נגישות",
      intro:
        "אנו פועלים לאפשר שימוש נוח ב־Munchadoo גם לאנשים עם מוגבלות. העמוד מתאר את ההתאמות ואת מגבלות הבדיקה הידועות.",
      sections: [
        {
          heading: "התאמות שבוצעו",
          paragraphs: [
            "נוספו קישור לדילוג לתוכן, מיקוד מקלדת בולט, תוויות לפקדים, הודעות מצב לקוראי מסך ומבנה כותרות. ניתן להפעיל כפתורים באמצעות מקלדת ולסגור חלונות באמצעות Escape.",
            "שופרו ניגודיות טקסט, גדלי טקסט ושטחי לחיצה. בתחתית האתר ניתן להפעיל טקסט מוגדל, ניגודיות גבוהה וצמצום תנועה. העדפת צמצום תנועה של מערכת ההפעלה מכובדת גם ללא שינוי באתר.",
            "הממשק תומך בעברית ובאנגלית ובכיווניות מתאימה. אפשר להשתמש בהגדלה של הדפדפן ללא הגבלה מכוונת מצד האתר.",
          ],
        },
        {
          heading: "מצב הבדיקה והמגבלות",
          paragraphs: [
            "יעד העבודה הוא נגישות ברמת AA לפי הנחיות WCAG הרלוונטיות, תוך התייחסות לתקן הישראלי 5568 ולדין החל. טרם הושלמה ביקורת נגישות עצמאית מקיפה, ואין בהצהרה זו אישור לעמידה מלאה בתקן.",
            "יש להשלים בדיקות עם קוראי מסך, מכשירים ניידים והתקנה למסך הבית. חלונות הרשאת המיקום וההתקנה נשלטים בידי הדפדפן. קישורים למפות מובילים לשירות חיצוני שאינו מנוהל על ידינו.",
            "בחירת אזור ידנית ומשחקים זמינים גם ללא הרשאת מיקום או התקנה. אין צורך להפעיל כלי נגישות כדי להשתמש בפעולות הליבה.",
          ],
        },
        {
          heading: "נתקלתם בקושי?",
          paragraphs: [
            "פנו ל־Clickabily באימייל info@clickabily.com עם כתובת העמוד, הפעולה שניסיתם לבצע, תיאור הקושי, וסוג הדפדפן או הטכנולוגיה המסייעת אם ידועים. אין צורך לציין אבחנה רפואית.",
            "אפשר לבקש מידע או סיוע בפורמט נגיש חלופי. נבחן את הפנייה ונשיב לגבי אופן הטיפול. כתובת זו היא כתובת לפניות נגישות, ללא הצהרה שמונה רכז נגישות מוסמך.",
          ],
        },
      ],
    },
  },
  en: {
    about: {
      title: "About Munchadoo",
      intro: "Less deciding. More munching.",
      sections: [
        {
          heading: "What we do",
          paragraphs: [
            "Munchadoo helps you choose where to eat through nearby restaurant search and a random pick from matching results. Short shared-device games bring families, couples, friends and coworkers together while they wait.",
          ],
        },
        {
          heading: "Who operates Munchadoo",
          paragraphs: [
            "Munchadoo is operated by Clickabily. For general, privacy and accessibility enquiries, contact info@clickabily.com.",
          ],
        },
        {
          heading: "How places are selected",
          paragraphs: [
            "Restaurant data comes from Google Maps. Searches return up to 20 provider results, filtered by your choices. Draws are random among the returned open places, not an exhaustive local directory or professional assessment of quality or suitability.",
            "Artwork is illustrative, not restaurant photography. There are currently no paid placements or commercial weighting in draws.",
          ],
        },
        {
          heading: "Current limitations",
          paragraphs: [
            "This is a pilot. Munchadoo does not process orders, payments or deliveries. No Wolt or Ten Bis integration is active and no partnership is claimed.",
          ],
        },
      ],
    },
    privacy: {
      title: "Privacy and browser storage policy",
      intro:
        "This policy explains the data used by the current version of Munchadoo and your choices.",
      sections: [
        {
          heading: "Operator and contact",
          paragraphs: [
            "Clickabily operates this service. Contact info@clickabily.com for privacy questions, access, correction or deletion requests and privacy preferences.",
          ],
        },
        {
          heading: "Search and location",
          paragraphs: [
            "Search sends the search centre, radius, cuisine and language to the Munchadoo server. The server sends Google the location and search parameters needed to retrieve places. After three or more characters and a brief typing pause, city or address autocomplete sends the entered text to our server and Google to return locations for you to choose. Selecting a result uses its centre.",
            "Device location is requested only when you select “Find food near me” and allow the browser permission. Providing it is voluntary, not mandatory: you can select an area and play games instead. Declining only prevents automatic device positioning.",
            "We do not track location in the background. If you choose to remember device location, coordinates, accuracy and save time are stored on this device for seven days. Unchecking deletes the record; expired records are deleted on the next visit. Google address text is not persisted. No location is saved in a database or dedicated logs. Network requests may expose technical information such as IP address and browser type to the service server and relevant network providers.",
          ],
        },
        {
          heading: "Google and external links",
          paragraphs: [
            "Google supplies place information and processes requests under its policies. Data may be processed outside your country. Google’s privacy policy, linked below, applies to its processing.",
            "Opening a Maps link takes you to Google with the selected place identifier. That service’s terms and privacy choices apply there. Our server API key is not sent to your browser.",
          ],
        },
        {
          heading: "Cookies, local storage and consent",
          paragraphs: [
            "Current application code uses browser localStorage, not advertising cookies. There are no advertising pixels, external analytics services or remotely loaded fonts.",
            "Essential storage keeps your privacy choice for up to 180 days and your request to snooze installation offers for seven days. Optional measurement is not required for search, draws or games.",
            "Only if you allow local measurement do we save the installation button variant, visit timestamps and counts of offers, clicks, prompt acceptance and standalone launches in this browser. This data is not sent to a server and contains no locations, restaurants or game answers. A click does not automatically mean an installation succeeded.",
            "Use “Privacy & cookie settings” at the bottom of any page to change your choice. Withdrawing deletes the local measurement record. Once consent expires, measurement stops and its record is removed on the next visit or action. If you do not return, browser data remains until removed through your browser.",
          ],
        },
        {
          heading: "Games and enquiries",
          paragraphs: [
            "There are currently no user accounts or child profiles. Game progress and answers stay in page memory and are not sent to a server. Children can play with an adult without submitting personal details.",
            "If you email us, we receive your address and message to respond and handle your enquiry. Records may be retained as needed to resolve the enquiry or meet legal obligations. Please avoid unnecessary sensitive information.",
          ],
        },
        {
          heading: "Your rights and controls",
          paragraphs: [
            "Subject to applicable law, you may request information about processing, access, correction and, where applicable, deletion, restriction or objection. Proportionate identity verification may be needed. Deletion may be limited by legal retention obligations.",
            "We do not receive the local measurement record and cannot look it up by your name. Remove it by withdrawing consent or clearing site data. Revoke location permission in browser or device settings.",
            "Material changes to processing will be reflected here, with renewed consent where required. You can also contact the relevant data protection authority in your jurisdiction.",
          ],
        },
      ],
    },
    terms: {
      title: "Terms of use",
      intro:
        "Munchadoo helps with restaurant choices and shared games. These are the limits of the current pilot.",
      sections: [
        {
          heading: "Operator and service",
          paragraphs: [
            "The service is operated by Clickabily. Contact info@clickabily.com. No payment or account is currently required. Material changes will be reflected here; any future paid service will require separate terms and agreement.",
          ],
        },
        {
          heading: "Restaurant information",
          paragraphs: [
            "Opening hours, addresses and cuisine categories come from a third party and may be missing or out of date. Confirm details with the restaurant before travelling. “Open” does not guarantee order acceptance or delivery availability.",
            "Cuisine labels and random selections do not establish allergens, dietary suitability, kosher status, physical accessibility or food safety. Check these directly with the restaurant.",
          ],
        },
        {
          heading: "Draws and external services",
          paragraphs: [
            "Selection is random within the returned eligible results, not every business in the area. There is no financial prize or required payment to participate.",
            "Transactions with restaurants or external services are with those parties. Munchadoo does not take orders, payments or handle deliveries. Use of Google Maps content and services is also subject to the Google Maps/Google Earth terms linked below and Google’s privacy policy.",
          ],
        },
        {
          heading: "Fair use and content",
          paragraphs: [
            "Do not bypass usage limits, disrupt availability, access data not intended for you or perform unauthorised automated collection. Provider data remains subject to its applicable rights and terms.",
            "Munchadoo’s name, design and original content are protected under applicable law. Third-party marks and content belong to their respective owners. These terms do not license redistribution of restaurant data.",
          ],
        },
        {
          heading: "Availability and rights",
          paragraphs: [
            "Errors, interruptions and changes may occur. We aim to address reports and communicate known limitations. These terms do not exclude consumer rights, liability or remedies that cannot lawfully be excluded.",
            "Report problems, misleading content or rights concerns using the contact address, with a link and brief explanation without unnecessary personal data.",
          ],
        },
      ],
    },
    accessibility: {
      title: "Accessibility statement",
      intro:
        "We work to make Munchadoo usable by people with disabilities. This statement describes current adjustments and known testing limitations.",
      sections: [
        {
          heading: "Adjustments made",
          paragraphs: [
            "The interface includes a skip link, visible keyboard focus, labelled controls, screen-reader status messages and structured headings. Buttons support keyboard use and dialogs can be closed with Escape.",
            "Text contrast, text sizes and touch targets have been improved. Larger text, high contrast and reduced motion controls are available in the footer. System reduced-motion preferences are also respected.",
            "Hebrew and English are supported with appropriate direction. Browser zoom is not deliberately restricted.",
          ],
        },
        {
          heading: "Testing status and limitations",
          paragraphs: [
            "Our development target is AA accessibility under applicable WCAG guidance, with consideration of Israeli Standard 5568 and applicable law. A comprehensive independent accessibility audit has not been completed. This statement does not certify full conformance.",
            "Further testing with screen readers, mobile devices and home-screen installation is needed. Location and installation prompts are controlled by the browser. Maps links lead to an external service outside our control.",
            "Manual area selection and games work without device location or installation. Accessibility tools do not need to be enabled to use core functions.",
          ],
        },
        {
          heading: "Report a barrier",
          paragraphs: [
            "Contact Clickabily at info@clickabily.com with the page address, intended action, problem and browser or assistive technology if known. No medical diagnosis is required.",
            "You may request information or help in an alternative accessible format. We will review your enquiry and respond about handling it. This contact address is not a claim that a certified accessibility coordinator has been appointed.",
          ],
        },
      ],
    },
  },
};
