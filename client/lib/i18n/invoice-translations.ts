export interface InvoiceTranslationDictionary {
  title: string;
  subtitle: string;
  breadcrumbDashboard: string;
  breadcrumbInvoices: string;
  badgeRegisteredInvoices: string;
  btnCreateTaxInvoice: string;
  searchPlaceholder: string;
  filterAll: string;
  filterPaid: string;
  filterPartiallyPaid: string;
  filterSent: string;
  filterOverdue: string;
  filterDraft: string;
  filterCancelled: string;
  thInvoiceNumber: string;
  thOrderRef: string;
  thBuyerEnterprise: string;
  thBuyerTin: string;
  thSubtotal: string;
  thVat: string;
  thTotalAmount: string;
  thDueDate: string;
  thStatus: string;
  thActions: string;
  emptyTitle: string;
  emptyDescription: string;
  modalTitle: string;
  modalSubtitle: string;
  btnCancel: string;
  btnIssueInvoice: string;
}

export const INVOICE_TRANSLATIONS: Record<
  "en" | "am" | "om" | "ti",
  InvoiceTranslationDictionary
> = {
  en: {
    title: "Commercial Tax Invoices & Billing",
    subtitle: "Issue compliant value-added tax (15% VAT) invoices with Ministry of Revenues electronic TIN validation",
    breadcrumbDashboard: "Dashboard",
    breadcrumbInvoices: "Invoices",
    badgeRegisteredInvoices: "Registered Invoices",
    btnCreateTaxInvoice: "Create Tax Invoice",
    searchPlaceholder: "Search invoices by invoice number, order #, buyer enterprise, or TIN...",
    filterAll: "All Invoices",
    filterPaid: "Paid in Full",
    filterPartiallyPaid: "Partially Paid",
    filterSent: "Sent / Pending",
    filterOverdue: "Overdue",
    filterDraft: "Draft",
    filterCancelled: "Cancelled",
    thInvoiceNumber: "Invoice #",
    thOrderRef: "Order Ref",
    thBuyerEnterprise: "Buyer Enterprise",
    thBuyerTin: "Buyer TIN",
    thSubtotal: "Subtotal",
    thVat: "15% VAT",
    thTotalAmount: "Total Amount",
    thDueDate: "Due Date",
    thStatus: "Status",
    thActions: "Actions",
    emptyTitle: "No Invoices Found",
    emptyDescription: "No tax invoices match your search criteria.",
    modalTitle: "Issue Official Commercial Tax Invoice",
    modalSubtitle: "Ministry of Revenues (MoR) validated VAT invoice with electronic TIN linkage",
    btnCancel: "Cancel",
    btnIssueInvoice: "Issue Commercial Invoice",
  },
  am: {
    title: "የንግድ ታክስ ደረሰኞች እና የክፍያ መጠየቂያዎች",
    subtitle: "የገቢዎች ሚኒስቴር የኤሌክትሮኒክ የTIN ማረጋገጫ ያላቸውን ህጋዊ የ15% የተጨማሪ እሴት ታክስ ደረሰኞችን ያውጡ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbInvoices: "ደረሰኞች",
    badgeRegisteredInvoices: "የተመዘገቡ ደረሰኞች",
    btnCreateTaxInvoice: "የታክስ ደረሰኝ ፍጠር",
    searchPlaceholder: "ደረሰኞችን በደረሰኝ ቁጥር፣ በትዕዛዝ ቁጥር፣ በገዢ ድርጅት ወይም በTIN ይፈልጉ...",
    filterAll: "ሁሉም ደረሰኞች",
    filterPaid: "ሙሉ በሙሉ የተከፈለ",
    filterPartiallyPaid: "በከፊል የተከፈለ",
    filterSent: "የተላከ / በመጠባበቅ ላይ",
    filterOverdue: "ጊዜው ያለፈበት",
    filterDraft: "ረቂቅ",
    filterCancelled: "ተሰርዟል",
    thInvoiceNumber: "የደረሰኝ #",
    thOrderRef: "የትዕዛዝ ማጣቀሻ",
    thBuyerEnterprise: "የገዢ ድርጅት",
    thBuyerTin: "የገዢ TIN",
    thSubtotal: "ንዑስ ድምር",
    thVat: "15% ተ.እ.ታ (VAT)",
    thTotalAmount: "ጠቅላላ መጠን",
    thDueDate: "የመክፈያ ቀን",
    thStatus: "ሁኔታ",
    thActions: "እርምጃዎች",
    emptyTitle: "ምንም ደረሰኞች አልተገኙም",
    emptyDescription: "ከፍለጋ መስፈርትዎ ጋር የሚዛመዱ የታክስ ደረሰኞች አልተገኙም።",
    modalTitle: "ህጋዊ የንግድ ታክስ ደረሰኝ አውጣ",
    modalSubtitle: "በገቢዎች ሚኒስቴር የተረጋገጠ የኤሌክትሮኒክ TIN ትስስር ያለው የተጨማሪ እሴት ታክስ ደረሰኝ",
    btnCancel: "ሰርዝ",
    btnIssueInvoice: "የንግድ ደረሰኝ አውጣ",
  },
  om: {
    title: "Nagahee Gibira Daldalaa fi Kaffaltii",
    subtitle: "Nagahee VAT (15%) seera qabeessa mirkanaa'ina TIN elektirooniksii Ministeera Galiiwwanii wajjin baasaa",
    breadcrumbDashboard: "Daashboordii",
    breadcrumbInvoices: "Nagaheewwan",
    badgeRegisteredInvoices: "Nagaheewwan Galmaa'an",
    btnCreateTaxInvoice: "Nagahee Gibiraa Uumi",
    searchPlaceholder: "Nagahee lakkoofsaan, ajajaan, dhaabbata bittaa ykn TINn barbaadi...",
    filterAll: "Nagaheewwan Hundaa",
    filterPaid: "Guutummaatti Kaffalame",
    filterPartiallyPaid: "Gartokkoon Kaffalame",
    filterSent: "Ergameera / Eegaa Jira",
    filterOverdue: "Yeroon Itti Darbe",
    filterDraft: "Wixinee",
    filterCancelled: "Haqameera",
    thInvoiceNumber: "Lakkoofsa Nagahee",
    thOrderRef: "Eeruu Ajajaa",
    thBuyerEnterprise: "Dhaabbata Bittaa",
    thBuyerTin: "TIN Bittaa",
    thSubtotal: "Ida'ama Xiqqaa",
    thVat: "VAT 15%",
    thTotalAmount: "Waliigala Hammaa",
    thDueDate: "Guyyaa Kaffaltii",
    thStatus: "Haala",
    thActions: "Tarkaanfii",
    emptyTitle: "Nagaheewwan Hin Argamne",
    emptyDescription: "Nagaheen gibiraa ulaagaa barbaacha keessanii wajjin walsimu hin jiru.",
    modalTitle: "Nagahee Gibira Daldalaa Seera Qabeessa Baasi",
    modalSubtitle: "Nagahee VAT mirkanaa'ina TIN Ministeera Galiiwwanii qabu",
    btnCancel: "Haqi",
    btnIssueInvoice: "Nagahee Daldalaa Baasi",
  },
  ti: {
    title: "ናይ ንግዲ ግብሪ ደረሰኝታትን ክፍሊታትን",
    subtitle: "ናይ ሚኒስትሪ ኣታዊታት ናይ ኤለክትሮኒክስ TIN መረጋገጺ ዘለዎም ናይ 15% VAT ደረሰኝታት ኣውጽኡ",
    breadcrumbDashboard: "ዳሽቦርድ",
    breadcrumbInvoices: "ደረሰኝታት",
    badgeRegisteredInvoices: "ዝተመዝገቡ ደረሰኝታት",
    btnCreateTaxInvoice: "ናይ ግብሪ ደረሰኝ ፍጠር",
    searchPlaceholder: "ደረሰኝታት ብቁጽሪ ደረሰኝ፣ ብቁጽሪ ትእዛዝ፣ ብትካል ዓዳጊ ወይ ብTIN ድለዩ...",
    filterAll: "ኩሎም ደረሰኝታት",
    filterPaid: "ሙሉእ ብሙሉእ ዝተኸፍለ",
    filterPartiallyPaid: "ብኽፋል ዝተኸፍለ",
    filterSent: "ዝተላእኸ / ዝጽበ",
    filterOverdue: "ግዚኡ ዝሓለፈ",
    filterDraft: "ረቂቕ",
    filterCancelled: "ዝተሰረዘ",
    thInvoiceNumber: "ቁጽሪ ደረሰኝ",
    thOrderRef: "መወከሲ ትእዛዝ",
    thBuyerEnterprise: "ትካል ዓዳጊ",
    thBuyerTin: "TIN ዓዳጊ",
    thSubtotal: "ንኡስ ድምር",
    thVat: "15% VAT",
    thTotalAmount: "ጠቕላላ መጠን",
    thDueDate: "ናይ ክፍሊት ዕለት",
    thStatus: "ኩነታት",
    thActions: "ተግባራት",
    emptyTitle: "ዋላ ሓደ ደረሰኝ ኣይተረኽበን",
    emptyDescription: "ምስ መምረጺኹም ዝሰማማዕ ናይ ግብሪ ደረሰኝ ኣይተረኽበን።",
    modalTitle: "ወግዓዊ ናይ ንግዲ ግብሪ ደረሰኝ ኣውጽእ",
    modalSubtitle: "ብሚኒስትሪ ኣታዊታት ዝተረጋገጸ ናይ ኤለክትሮኒክ TIN ዘለዎ ናይ VAT ደረሰኝ",
    btnCancel: "ሰርዝ",
    btnIssueInvoice: "ናይ ንግዲ ደረሰኝ ኣውጽእ",
  },
};
