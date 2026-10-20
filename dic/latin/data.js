// Ред: [nom, gen, gender (m/f/n), превод, decl?]
// - decl е по избор – само когато склонението не личи от родителния падеж (напр. reus, rei → 2)
// - дума, която е в няколко раздела, се описва веднъж изцяло, а в другите – само с [nom]
// - думите се групират по правен институт (раздел), от който се получава полето categories
const SECTIONS = {
  'Въведение в римското право': [
    ['ius', 'iuris', 'n', 'право'],
    ['iustitia', 'iustitiae', 'f', 'справедливост'],
    ['consuetudo', 'consuetudinis', 'f', 'правен обичай'],
    ['iurisprudentia', 'iurisprudentiae', 'f', 'науката за правото'],
    ['iurisconsultus', 'iurisconsulti', 'm', 'юрист, който дава правни съвети'],
    ['lex', 'legis', 'f', 'закон'],
    ['senatusconsultum', 'senatusconsulti', 'n', 'сенатусконсулт, акт на Сената'],
    ['edictum', 'edicti', 'n', 'едикт, акт на магистрат или император'],
    ['mandatum', 'mandati', 'n', 'императорска конституция с инструкции; договор за поръчка'],
    ['rescriptum', 'rescripti', 'n', 'императорска конституция – отговор на запитване на частно лице'],
    ['epistula', 'epistulae', 'f', 'императорска конституция с указания към администратори или съдии'],
    ['decretum', 'decreti', 'n', 'императорско решение по конкретен спор'],
    ['codex', 'codicis', 'm', 'сборник с императорски конституции'],
    ['institutio', 'institutionis', 'f', 'институции – учебник за начинаещи юристи'],
    ['novella', 'novellae', 'f', 'новела – конституция на Юстиниан след 533 г.'],
    ['digestum', 'digesti', 'n', 'дигести – част от Юстиниановата компилация'],
    ['pandecta', 'pandectae', 'f', 'пандекти (дигести)']
  ],
  'Държавно устройство и публична власт': [
    ['populus', 'populi', 'm', 'народ'],
    ['rogatio', 'rogationis', 'f', 'гласуване в народното събрание'],
    ['intercessio', 'intercessionis', 'f', 'възпрепятстване на друг магистрат (вето)']
  ],
  'Административно право': [
    ['magistratus', 'magistratus', 'm', 'магистрат'],
    ['praetor', 'praetoris', 'm', 'претор'],
    ['censor', 'censoris', 'm', 'цензор'],
    ['quaestor', 'quaestoris', 'm', 'квестор'],
    ['aedilis', 'aedilis', 'm', 'едил'],
    ['curator', 'curatoris', 'm', 'куратор, попечител'],
    ['gubernator', 'gubernatoris', 'm', 'провинциален управител'],
    ['imperium', 'imperii', 'n', 'висша военна и гражданска власт'],
    ['potestas', 'potestatis', 'f', 'власт, сила'],
    ['municipium', 'municipii', 'n', 'самоуправляваща се градска община'],
    ['colonia', 'coloniae', 'f', 'територия със заселени римски граждани'],
    ['officium', 'officii', 'n', 'служба'],
    ['militia', 'militiae', 'f', 'военна служба'],
    ['officialis', 'officialis', 'm', 'императорски служител'],
    ['palatinus', 'palatini', 'm', 'служител на дворцовата администрация'],
    ['gubernatio', 'gubernationis', 'f', 'държавно управление'],
    ['duovir', 'duoviri', 'm', 'член на колегия от двама'],
    ['triumvir', 'triumviri', 'm', 'член на колегия от трима'],
    ['annona', 'annonae', 'f', 'обществени доставки на храни'],
    ['metallum', 'metalli', 'n', 'рудник'],
    ['munus', 'muneris', 'n', 'повинност']
  ],
  'Финансово право': [
    ['aerarium', 'aerarii', 'n', 'хазна под управление на Сената'],
    ['fiscus', 'fisci', 'm', 'хазна под управление на императора'],
    ['aurum', 'auri', 'n', 'злато'],
    ['argentum', 'argenti', 'n', 'сребро'],
    ['nummus', 'nummi', 'm', 'дребна медна монета'],
    ['multa', 'multae', 'f', 'глоба']
  ],
  'Военно право': [
    ['militia'],
    ['miles', 'militis', 'm', 'войник'],
    ['legio', 'legionis', 'f', 'легион'],
    ['legionarius', 'legionarii', 'm', 'легионер'],
    ['veteranus', 'veterani', 'm', 'ветеран'],
    ['castrum', 'castri', 'n', 'укрепен военен лагер'],
    ['eques', 'equitis', 'm', 'конник'],
    ['auxilium', 'auxilii', 'n', 'помощна военна част'],
    ['ala', 'alae', 'f', 'помощна конница'],
    ['cohors', 'cohortis', 'f', 'кохорта'],
    ['perduellio', 'perduellionis', 'f', 'държавна измяна'],
    ['disciplina', 'disciplinae', 'f', 'обучение, наука, порядък, правила']
  ],
  'Наказателно право': [
    ['crimen', 'criminis', 'n', 'престъпление'],
    ['coercitio', 'coercitionis', 'f', 'принуда, налагана от магистрат'],
    ['dolus', 'doli', 'm', 'умисъл; измама'],
    ['culpa', 'culpae', 'f', 'вина'],
    ['fraus', 'fraudis', 'f', 'правонарушение'],
    ['parricidium', 'parricidii', 'n', 'отцеубийство'],
    ['homicidium', 'homicidii', 'n', 'убийство'],
    ['veneficium', 'veneficii', 'n', 'отровителство'],
    ['adulterium', 'adulterii', 'n', 'прелюбодеяние'],
    ['rapina', 'rapinae', 'f', 'грабеж'],
    ['poena', 'poenae', 'f', 'наказание'],
    ['confiscatio', 'confiscationis', 'f', 'отнемане на имуществото в полза на фиска'],
    ['deportatio', 'deportationis', 'f', 'изгнание'],
    ['relegatio', 'relegationis', 'f', 'заточение'],
    ['verberatio', 'verberationis', 'f', 'бичуване'],
    ['carcer', 'carceris', 'm', 'затвор']
  ],
  'Наказателен процес': [
    ['cognitio', 'cognitionis', 'f', 'разглеждане на делото'],
    ['accusatio', 'accusationis', 'f', 'обвинение'],
    ['damnatio', 'damnationis', 'f', 'осъждане'],
    ['appellatio', 'appellationis', 'f', 'обжалване'],
    ['infamia', 'infamiae', 'f', 'безчестие'],
    ['intestabilitas', 'intestabilitatis', 'f', 'невъзможност за свидетелстване поради осъждане'],
    ['testis', 'testis', 'm', 'свидетел']
  ],
  'Международно право': [
    ['gens', 'gentis', 'f', 'род'],
    ['populus'],
    ['hostis', 'hostis', 'm', 'враг'],
    ['hospes', 'hospitis', 'm', 'гост'],
    ['hospitium', 'hospitii', 'n', 'гостоприемство, убежище'],
    ['latinus', 'latini', 'm', 'латин, жител на Латинската лига'],
    ['peregrinus', 'peregrini', 'm', 'чужденец'],
    ['stipendiarius', 'stipendiarii', 'm', 'подчинен, плащащ данък stipendium'],
    ['tributarius', 'tributarii', 'm', 'подчинен, плащащ данък tributum'],
    ['pax', 'pacis', 'f', 'мир'],
    ['pactio', 'pactionis', 'f', 'помирение'],
    ['pactum', 'pacti', 'n', 'съглашение, пакт']
  ],
  'Сакрално и църковно право': [
    ['templum', 'templi', 'n', 'храм'],
    ['sacerdos', 'sacerdotis', 'm', 'жрец'],
    ['pontifex', 'pontificis', 'm', 'жрец (понтифекс)'],
    ['augur', 'auguris', 'm', 'птицегадател'],
    ['vestalis', 'vestalis', 'f', 'жрица на богинята Веста'],
    ['sacrificium', 'sacrificii', 'n', 'жертвоприношение'],
    ['ecclesia', 'ecclesiae', 'f', 'църква'],
    ['episcopus', 'episcopi', 'm', 'епископ'],
    ['monachus', 'monachi', 'm', 'монах'],
    ['haereticus', 'haeretici', 'm', 'еретик'],
    ['paganus', 'pagani', 'm', 'езичник']
  ],
  'Лично право': [
    ['persona', 'personae', 'f', 'маска, лице, личност'],
    ['caput', 'capitis', 'n', 'глава, начало'],
    ['ingenuus', 'ingenui', 'm', 'свободно роден'],
    ['libertinus', 'libertini', 'm', 'освободен роб'],
    ['servus', 'servi', 'm', 'роб'],
    ['peregrinus'],
    ['colonus', 'coloni', 'm', 'колон – прикрепен към земята бивш арендатор'],
    ['incorporatus', 'incorporati', 'm', 'лице, прикрепено към занаят'],
    ['associatio', 'associationis', 'f', 'сдружение'],
    ['corpus', 'corporis', 'n', 'корпорация, сдружение от лица'],
    ['manus', 'manus', 'f', 'съпружеска власт'],
    ['tutor', 'tutoris', 'm', 'настойник'],
    ['curator'],
    ['commercium', 'commercii', 'n', 'способност да се извършват правни сделки']
  ],
  'Семейно право': [
    ['conubium', 'conubii', 'n', 'брачна дееспособност'],
    ['manus'],
    ['concubinatus', 'concubinatus', 'm', 'конкубинат – съжителство без брак'],
    ['dos', 'dotis', 'f', 'зестра'],
    ['legitimatio', 'legitimationis', 'f', 'узаконяване на дете'],
    ['adoptio', 'adoptionis', 'f', 'осиновяване на чужд подвластен'],
    ['adrogatio', 'adrogationis', 'f', 'осиновяване на неподвластен'],
    ['emancipatio', 'emancipationis', 'f', 'освобождаване от бащина власт']
  ],
  'Вещно право': [
    ['res', 'rei', 'f', 'нещо, вещ, дело'],
    ['patrimonium', 'patrimonii', 'n', 'имущество'],
    ['bonum', 'boni', 'n', 'имущество, блага'],
    ['possessio', 'possessionis', 'f', 'владение'],
    ['dominium', 'dominii', 'n', 'собственост'],
    ['dominus', 'domini', 'm', 'собственик, господар'],
    ['proprietas', 'proprietatis', 'f', 'собственост'],
    ['universitas', 'universitatis', 'f', 'съвкупност от вещи'],
    ['fructus', 'fructus', 'm', 'плод, добив'],
    ['detentio', 'detentionis', 'f', 'държане'],
    ['condominium', 'condominii', 'n', 'съсобственост'],
    ['occupatio', 'occupationis', 'f', 'завладяване'],
    ['thesaurus', 'thesauri', 'm', 'съкровище'],
    ['accessio', 'accessionis', 'f', 'присъединяване'],
    ['specificatio', 'specificationis', 'f', 'преработване'],
    ['inaedificatio', 'inaedificationis', 'f', 'построяване'],
    ['usucapio', 'usucapionis', 'f', 'придобивна давност по цивилното право'],
    ['mancipatio', 'mancipationis', 'f', 'манципация'],
    ['traditio', 'traditionis', 'f', 'предаване на вещта'],
    ['usufructus', 'usufructus', 'm', 'плодоползване'],
    ['usus', 'usus', 'm', 'ползване'],
    ['habitatio', 'habitationis', 'f', 'право на обитаване'],
    ['superficies', 'superficiei', 'f', 'право на строеж'],
    ['hypotheca', 'hypothecae', 'f', 'ипотека']
  ],
  'Облигационно право': [
    ['obligatio', 'obligationis', 'f', 'задължение, облигационно отношение'],
    ['debitum', 'debiti', 'n', 'дълг'],
    ['contractus', 'contractus', 'm', 'договор по цивилното право'],
    ['delictum', 'delicti', 'n', 'деликт'],
    ['quasicontractus', 'quasicontractus', 'm', 'квазиконтракт'],
    ['quasidelictum', 'quasidelicti', 'n', 'квазиделикт'],
    ['consensus', 'consensus', 'm', 'съгласие'],
    ['dissensus', 'dissensus', 'm', 'несъгласие'],
    ['error', 'erroris', 'm', 'грешка'],
    ['metus', 'metus', 'm', 'заплашване'],
    ['dolus'],
    ['solutio', 'solutionis', 'f', 'изпълнение'],
    ['novatio', 'novationis', 'f', 'подновяване на задължението'],
    ['compensatio', 'compensationis', 'f', 'прихващане'],
    ['casus', 'casus', 'm', 'случай, случайно събитие'],
    ['depositum', 'depositi', 'n', 'влог'],
    ['commodatum', 'commodati', 'n', 'заем за послужване'],
    ['mutuum', 'mutui', 'n', 'заем за потребление'],
    ['pignus', 'pigneris', 'n', 'залог'],
    ['mandatum'],
    ['societas', 'societatis', 'f', 'договор за гражданско дружество'],
    ['permutatio', 'permutationis', 'f', 'замяна'],
    ['pactum'],
    ['furtum', 'furti', 'n', 'кражба'],
    ['culpa']
  ],
  'Наследствено право': [
    ['heres', 'heredis', 'm', 'наследник'],
    ['cognatus', 'cognati', 'm', 'кръвен роднина'],
    ['defunctus', 'defuncti', 'm', 'покойник, наследодател'],
    ['hereditas', 'hereditatis', 'f', 'наследство'],
    ['successio', 'successionis', 'f', 'наследяване'],
    ['testamentum', 'testamenti', 'n', 'завещание'],
    ['legatum', 'legati', 'n', 'завет']
  ],
  'Граждански процес': [
    ['sententia', 'sententiae', 'f', 'съдебно решение, присъда'],
    ['actor', 'actoris', 'm', 'ищец'],
    ['reus', 'rei', 'm', 'ответник, обвиняем', 2],
    ['actio', 'actionis', 'f', 'иск, действие'],
    ['iudex', 'iudicis', 'm', 'съдия'],
    ['iudicium', 'iudicii', 'n', 'съд, съдебен процес']
  ],
  'Общи понятия': [
    ['causa', 'causae', 'f', 'причина, основание, дело'],
    ['cornu', 'cornus', 'n', 'рог'],
    ['actus', 'actus', 'm', 'действие'],
    ['fides', 'fidei', 'f', 'добросъвестност, вяра'],
    ['dies', 'diei', 'm', 'ден, срок']
  ]
};

// Подреждане по раздели → плосък списък; дума в няколко раздела получава няколко категории
const WORDS = (() => {
  const byNom = new Map();
  for (const [category, rows] of Object.entries(SECTIONS)) {
    for (const [nom, gen, gender, bg, decl] of rows) {
      if (!byNom.has(nom)) byNom.set(nom, {nom, gen, gender, bg, ...(decl && {decl}), categories: []});
      const w = byNom.get(nom);
      if (!w.categories.includes(category)) w.categories.push(category);
    }
  }
  return [...byNom.values()];
})();