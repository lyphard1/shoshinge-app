// 正信偈アプリのJavaScriptファイル
// 音声再生、テキストハイライト、画像表示を管理

// DOM要素の取得
const audioElement = document.createElement('audio');
audioElement.id = 'audio';
document.body.appendChild(audioElement);
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const progressBarContainer = document.getElementById('progressBarContainer');
const progressBar = document.getElementById('progressBar');
const pagesContainer = document.getElementById('pagesContainer');
const scriptureImage = document.getElementById('scriptureImage');
const modeButtons = {
  shoshinge: document.getElementById('btn-shoshinge'),
  wasan: document.getElementById('btn-wasan')
};

// グローバル変数
let currentMode = 'shoshinge';
let pages = [];
let currentActivePage = null;
let currentImageIndex = -1;

// 画像ファイルリスト（モード別）
const imageFiles = {
  shoshinge: [
    "帰命無量寿如来.png", "都見諸仏浄土因.png", "五劫思惟之摂受.png", "清浄歓喜智慧光.png",
    "本願名号正定業.png", "如来所以興出世.png", "能発一念喜愛心.png", "摂取心光常照護.png",
    "譬如日光覆雲霧.png", "一切善悪凡夫人.png", "弥陀仏本願念仏.png", "印度西天之論家.png",
    "釈迦如来楞伽山.png", "宣説大乗無上法.png", "憶念弥陀仏本願.png", "天親菩薩造論説.png",
    "広由本願力回向.png", "得至蓮華蔵世界.png", "本師曇鸞梁天子.png", "天親菩薩論註解.png",
    "惑染凡夫信心発.png", "道綽決聖道難証.png", "三不三信誨慇懃.png", "善導独明仏正意.png",
    "行者正受金剛心.png", "源信広開一代教.png", "極重悪人唯称仏.png", "本師源空明仏教.png",
    "還来生死輪転家.png", "弘経大士宗師等.png"
  ],
  wasan: [
    "南無阿弥陀仏1.png", "南無阿弥陀仏2.png", "彌陀成佛のこのかたは.png", "南無阿弥陀仏3.png",
    "智慧の光明はかりなし.png", "南無阿弥陀仏4.png", "阿弥陀仏.png", "南無阿弥陀仏5.png",
    "解脱の光輪きはもなく.png", "南無阿弥陀仏6.png", "光雲無碍如虚空.png", "南無阿弥陀仏7.png",
    "南無阿弥陀仏8.png", "南無阿弥陀仏9.png", "清浄光明ならびなし.png", "南無阿弥陀仏10.png",
    "佛光照曜最第一.png", "願以此功徳.png"
  ]
};

// 音声ファイルリスト（モード別）
    const audioFiles = {
      shoshinge: '/shoshinge-app/audio/shoshinge.mp3',
      wasan: '/shoshinge-app/audio/nenbutuwasan.mp3'
    };// 正信偈と念仏和讃のデータ（タイムコード付き）
const originalPagesData = [
  // --- 正信偈 (shoshinge) ---
  {
    section: 'shoshinge', verses: [
      { start: 7.1, end: 21.9, text: '帰命無量寿如来', ruby: 'きみょうむりょうじゅにょらい' },
      { start: 21.9, end: 30.9, text: '南無不可思議光', ruby: 'なむふかしぎこう' },
      { start: 30.9, end: 38.7, text: '法蔵菩薩因位時', ruby: 'ほうぞうぼさついんにじ' },
      { start: 38.7, end: 46.0, text: '在世自在王仏所', ruby: 'ざいせいじざいおうぶっしょ' }
    ]
  },
  // 以下、正信偈の全データ（ruby付き）
  { section: 'shoshinge', verses: [{ start: 46.0, end: 53.0, text: '覩見諸仏浄土因', ruby: 'とけんしょぶつじょうどいん' }, { start: 53.0, end: 59.9, text: '国土人天之善悪', ruby: 'こくどにんでんしぜんまく' }, { start: 59.9, end: 66.9, text: '建立無上殊勝願', ruby: 'こんりゅうむじょうしゅしょうがん' }, { start: 66.9, end: 73.4, text: '超発希有大弘誓', ruby: 'ちょうほつけーうだいぐぜい' }] },
  { section: 'shoshinge', verses: [{ start: 73.4, end: 80.1, text: '五劫思惟之摂受', ruby: 'ごこうしゆいししょうじゅ' }, { start: 80.1, end: 86.9, text: '重誓名声聞十方', ruby: 'じゅうせいみょうしょうもんじっぽう' }, { start: 86.9, end: 93.7, text: '普放無量無辺光', ruby: 'ふほうむりょうむへんこう' }, { start: 93.7, end: 100.4, text: '無碍無対光炎王', ruby: 'むげむたいこうえんのう' }] },
  { section: 'shoshinge', verses: [{ start: 100.4, end: 107.0, text: '清浄歓喜智慧光', ruby: 'しょうじょうかんぎちえこう' }, { start: 107.0, end: 113.7, text: '不断難思無称光', ruby: 'ふだんなんじむしょうこう' }, { start: 113.7, end: 120.2, text: '超日月光照塵刹', ruby: 'ちょうにちがっこうしょうじんせつ' }, { start: 120.2, end: 126.8, text: '一切群生蒙光照', ruby: 'いっさいぐんじょうむこうしょう' }] },
  { section: 'shoshinge', verses: [{ start: 126.8, end: 133.3, text: '本願名号正定業', ruby: 'ほんがんみょうごうしょうじょうごう' }, { start: 133.3, end: 140.0, text: '至心信楽願為因', ruby: 'ししんしんぎょうがんにいん' }, { start: 140.0, end: 146.5, text: '成等覚証大涅槃', ruby: 'じょうとうがくしょうだいねはん' }, { start: 146.5, end: 153.0, text: '必至滅度願成就', ruby: 'ひっしめつどがんじょうじゅ' }] },
  { section: 'shoshinge', verses: [{ start: 153.0, end: 159.3, text: '如来所以興出世', ruby: 'にょらいしょいこうしゅっせ' }, { start: 159.3, end: 165.9, text: '唯説弥陀本願海', ruby: 'ゆいせつみだほんがんかい' }, { start: 165.9, end: 172.3, text: '五濁悪時群生海', ruby: 'ごじょくあくじぐんじょうかい' }, { start: 172.3, end: 178.7, text: '応信如来如実言', ruby: 'おんしんにょらいにょじつごん' }] },
  { section: 'shoshinge', verses: [{ start: 178.7, end: 185.0, text: '能発一念喜愛心', ruby: 'のうほついちねんきあいしん' }, { start: 185.0, end: 191.4, text: '不断煩悩得涅槃', ruby: 'ふだんぼんじょうとくねはん' }, { start: 191.4, end: 197.7, text: '凡聖逆謗斉廻入', ruby: 'ぼんじょうぎゃくほうさいえにゅう' }, { start: 197.7, end: 204.2, text: '如衆水入海一味', ruby: 'にょしゅうすいにゅうかいいちみ' }] },
  { section: 'shoshinge', verses: [{ start: 204.2, end: 210.6, text: '摂取心光常照護', ruby: 'せっしゅしんこうじょうしょうご' }, { start: 210.6, end: 217.1, text: '已能雖破無明闇', ruby: 'いのうすいはむみょうあん' }, { start: 217.1, end: 223.5, text: '貪愛瞋憎之雲霧', ruby: 'とんないしんぞうしうんむ' }, { start: 223.5, end: 229.7, text: '常覆真実信心天', ruby: 'じょうふしんじつしんじんてん' }] },
  { section: 'shoshinge', verses: [{ start: 229.7, end: 236.0, text: '譬如日光覆雲霧', ruby: 'にょらいにっこうふうんむ' }, { start: 236.0, end: 242.7, text: '雲霧之下明無闇', ruby: 'うんむしげみょうむあん' }, { start: 242.7, end: 248.7, text: '獲信見敬大慶喜', ruby: 'ぎゃくしんけんきょうだいきょうき' }, { start: 248.7, end: 254.9, text: '即横超截五悪趣', ruby: 'そくおうちょうぜつごあくしゅ' }] },
  { section: 'shoshinge', verses: [{ start: 254.9, end: 261.1, text: '一切善悪凡夫人', ruby: 'いっさいぜんあくぼんぶにん' }, { start: 261.1, end: 267.4, text: '聞信如来弘誓願', ruby: 'もんしんにょらいくぜいがん' }, { start: 267.4, end: 273.7, text: '仏言広大勝解者', ruby: 'ぶつごんこうだいしょうげしゃ' }, { start: 273.7, end: 279.9, text: '是人名分陀利華', ruby: 'ぜにんみょうふんだりけ' }] },
  { section: 'shoshinge', verses: [{ start: 279.9, end: 285.9, text: '弥陀仏本願念仏', ruby: 'みだぶつほんがんねんぶつ' }, { start: 285.9, end: 292.1, text: '邪見驕慢悪衆生', ruby: 'じゃけんきょうまんなくしゅじょう' }, { start: 292.1, end: 298.3, text: '信楽受持甚以難', ruby: 'しんぎょうじゅじじんになん' }, { start: 298.3, end: 304.4, text: '難中之難無過斯', ruby: 'なんちゅうしなんむかし' }] },
  { section: 'shoshinge', verses: [{ start: 304.4, end: 310.6, text: '印度西天之論家', ruby: 'いんどさいてんしろんげ' }, { start: 310.6, end: 319.8, text: '中夏日域之高僧', ruby: 'ちゅうかじちいきしこうそう' }, { start: 319.8, end: 325.8, text: '顕大聖興世正意', ruby: 'けんだいしょうこうせしょうい' }, { start: 325.8, end: 331.9, text: '明如来本誓応機', ruby: 'みょうにょらいほんぜいおうき' }] },
  { section: 'shoshinge', verses: [{ start: 331.9, end: 338.1, text: '釈迦如来楞伽山', ruby: 'しゃかにょらいりょうがせん' }, { start: 338.1, end: 347.2, text: '為衆告命南天竺', ruby: 'いしゅうごうみょうなんてんじく' }, { start: 347.2, end: 353.3, text: '龍樹大士出於世', ruby: 'りゅうじゅだいじしゅっとせ' }, { start: 353.3, end: 359.3, text: '悉能摧破有無見', ruby: 'しつのうざいはうむけん' }] },
  { section: 'shoshinge', verses: [{ start: 359.3, end: 365.3, text: '宣説大乗無上法', ruby: 'せんぜつだいじょうむじょうほう' }, { start: 365.3, end: 371.3, text: '証歓喜地生安楽', ruby: 'しょうかんぎじしょうあんらく' }, { start: 371.3, end: 377.3, text: '顕示難行陸路苦', ruby: 'けんじなんぎょうろくろく' }, { start: 377.3, end: 383.4, text: '信楽易行水道楽', ruby: 'しんぎょういぎょうしいどうらく' }] },
  { section: 'shoshinge', verses: [{ start: 383.4, end: 389.5, text: '憶念弥陀仏本願', ruby: 'おくねんみだほんがんかい' }, { start: 389.5, end: 398.6, text: '自然即時入必定', ruby: 'じねんそくじにゅうひつじょう' }, { start: 398.6, end: 404.7, text: '唯能常称如来号', ruby: 'ゆいのうじょうしょうにょらいごう' }, { start: 404.7, end: 410.7, text: '応報大悲弘誓恩', ruby: 'おうほうだいひぐぜいがん' }] },
  { section: 'shoshinge', verses: [{ start: 410.7, end: 416.7, text: '天親菩薩造論説', ruby: 'てんじんぼさつぞうろんせつ' }, { start: 416.7, end: 422.9, text: '帰命無碍光如来', ruby: 'きみょうむげこうにょらい' }, { start: 422.9, end: 429.0, text: '依修多羅顕真実', ruby: 'えしゅうたらけんしんじつ' }, { start: 429.0, end: 434.9, text: '光闡横超大誓願', ruby: 'こうせんおうちょうだいせいがん' }] },
  { section: 'shoshinge', verses: [{ start: 434.9, end: 440.8, text: '広由本願力回向', ruby: 'こうゆほんがんりきえこう' }, { start: 440.8, end: 447.1, text: '為度群生彰一心', ruby: 'いどぐんじょうしょういっしん' }, { start: 447.1, end: 453.1, text: '帰入功徳大宝海', ruby: 'きにゅうくどくだいほうかい' }, { start: 453.1, end: 459.2, text: '必獲入大会衆数', ruby: '筆逆にゅうだいえしゅしゅう' }] },
  { section: 'shoshinge', verses: [{ start: 459.2, end: 465.2, text: '得至蓮華蔵世界', ruby: 'とくしれんげぞうせいかい' }, { start: 465.2, end: 471.2, text: '即証真如法性身', ruby: 'そくしょうしんにょほっしょうじん' }, { start: 471.2, end: 477.2, text: '遊煩悩林現神通', ruby: 'ゆうぼんのうりんげんじんずう' }, { start: 477.2, end: 483.1, text: '入生死園示応化', ruby: 'にゅうしょうじおんじおうげ' }] },
  { section: 'shoshinge', verses: [{ start: 483.1, end: 489.1, text: '本師曇鸞梁天子', ruby: 'ほんしげんくうみょうぶっきょう' }, { start: 489.1, end: 495.3, text: '常向鸞処菩薩礼', ruby: 'じょうこうらんしょぼさつらい' }, { start: 495.3, end: 501.3, text: '三蔵流支授浄教', ruby: 'さんぞうるしじゅじょうきょう' }, { start: 501.3, end: 507.2, text: '焚焼仙経帰楽邦', ruby: 'ぼんじょうせんぎょうきらくほう' }] },
  { section: 'shoshinge', verses: [{ start: 507.2, end: 513.2, text: '天親菩薩論註解', ruby: 'てんじんぼつさろんちゅうげ' }, { start: 519.2, end: 525.1, text: '正定之因唯信心', ruby: 'しょうじょうしいんゆいしんじん' }] },
  { section: 'shoshinge', verses: [{ start: 525.1, end: 531.1, text: '惑染凡夫信心発', ruby: 'わくぜんぼんぶしんじんぽつ' }, { start: 531.1, end: 537.1, text: '証知生死即涅槃', ruby: 'しょうちしょうじそくねはん' }, { start: 537.1, end: 543.2, text: '必至無量光明土', ruby: 'ひっしむりょうこうみょうど' }, { start: 543.2, end: 549.3, text: '諸有衆生皆普化', ruby: 'しょうしゅじょうかいふけ' }] },
  { section: 'shoshinge', verses: [{ start: 549.3, end: 555.3, text: '道綽決聖道難証', ruby: 'どうしゃっけっしょうどうなんしょう' }, { start: 555.3, end: 561.3, text: '唯明浄土可通入', ruby: 'ゆいみょうじょうどかつうにゅう' }, { start: 561.3, end: 567.5, text: '万善自力貶勤修', ruby: 'まんぜんじりきへんごんしゅう' }, { start: 567.5, end: 573.6, text: '円満徳号勧専称', ruby: 'えんまんとくごうかんせんしょう' }] },
  { section: 'shoshinge', verses: [{ start: 573.6, end: 579.5, text: '三不三信誨慇懃', ruby: 'さんぷさんしんけおんごん' }, { start: 579.5, end: 585.3, text: '像末法滅同悲引', ruby: 'ぞうまつほうめつどうひいん' }, { start: 585.3, end: 591.5, text: '一生造悪値弘誓', ruby: 'いっしょうぞうあくちぐぜい' }, { start: 591.5, end: 597.8, text: '至安養界証妙果', ruby: 'しあんにょうがいしょうみょうか' }] },
  { section: 'shoshinge', verses: [{ start: 597.8, end: 612.5, text: '善導独明仏正意', ruby: 'ぜんどうどくみょうぶっしょうい' }, { start: 612.5, end: 628.3, text: '矜哀定散与逆悪', ruby: 'こうあいじょうさんよぎゃくあく' }, { start: 628.3, end: 637.4, text: '光明名号顕因縁', ruby: 'こうみょうみょうごうけんいんねんし' }, { start: 637.4, end: 645.5, text: '開入本願大智海', ruby: 'かいにゅうほんがんだいちかい' }] },
  { section: 'shoshinge', verses: [{ start: 645.5, end: 652.7, text: '行者正受金剛心', ruby: 'ぎょうじゃしょうじゅこんごうしん' }, { start: 652.7, end: 659.6, text: '慶喜一念相応後', ruby: 'きょうきいちねんそうおうご' }, { start: 659.6, end: 666.4, text: '与韋提等獲三忍', ruby: 'よいだいとうぎゃくさんにん' }, { start: 666.4, end: 673.1, text: '即証法性之常楽', ruby: 'そくしょうほっしょうしじょうらく' }] },
  { section: 'shoshinge', verses: [{ start: 673.1, end: 679.9, text: '源信広開一代教', ruby: 'げんしんこうかいいちだいきょう' }, { start: 679.9, end: 686.5, text: '偏帰安養勧一切', ruby: 'へんきあんにょうかんいっさい' }, { start: 686.5, end: 693.2, text: '専雑執心判浅深', ruby: 'せんぞうしゅうしんはんせんじん' }, { start: 693.2, end: 699.8, text: '報化二土正弁立', ruby: 'ほうけにどししょうべんりゅう' }] },
  { section: 'shoshinge', verses: [{ start: 699.8, end: 706.4, text: '極重悪人唯称仏', ruby: 'ごくじゅうあくにんゆいしょうぶつ' }, { start: 706.4, end: 712.9, text: '我亦在彼摂取中', ruby: 'がやくざいひせっしゅちゅう' }, { start: 712.9, end: 719.4, text: '煩悩障眼雖不見', ruby: 'ぼんのうしょうげんすいふけん' }, { start: 719.4, end: 725.8, text: '大悲無倦常照我', ruby: 'だいひむけんじょうしょうが' }] },
  { section: 'shoshinge', verses: [{ start: 725.8, end: 732.2, text: '本師源空明仏教', ruby: 'ほんしげんくうみょうぶっきょう' }, { start: 732.2, end: 738.7, text: '憐愍善悪凡夫人', ruby: 'れんみんぜんあくぼんぶにん' }, { start: 738.7, end: 745.1, text: '真宗教証興片州', ruby: 'しんしゅうきょうしょうこうへんしゅう' }, { start: 745.1, end: 751.7, text: '選択本願弘悪世', ruby: 'せんじゃくほんがんぐあくせい' }] },
  { section: 'shoshinge', verses: [{ start: 751.7, end: 757.9, text: '還来生死輪転家', ruby: 'げんらいしょうじりんでんげ' }, { start: 757.9, end: 764.3, text: '決以疑情為所止', ruby: 'けっちぎじょういしょし' }, { start: 764.3, end: 770.9, text: '速入寂静無為楽', ruby: 'そくにゅうじゃくじょうむいらく' }, { start: 770.9, end: 777.3, text: '必以信心為能入', ruby: 'ひっちしんじんいのうにゅう' }] },
  { section: 'shoshinge', verses: [{ start: 777.3, end: 784.8, text: '弘経大士宗師等', ruby: 'ぐきょうだいじしゅうしとう' }, { start: 784.8, end: 796.5, text: '拯済無辺極濁悪', ruby: 'じょうさいむへんごくじょくあく' }, { start: 796.5, end: 809.2, text: '道俗時衆共同心', ruby: 'どうぞくじしゅうぐどうしん' }, { start: 809.2, end: 821.1, text: '唯可信斯高僧説', ruby: 'ゆいかしんしこうそうせつ' }] },

  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 3.9, end: 12, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 12, end: 21.4, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 21.4, end: 29.7, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 29.7, end: 37.7, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  { section: 'wasan', verses: [{ start: 37.7, end: 45.9, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 45.9, end: 54.3, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 54.3, end: 56.8, text: '南', ruby: 'な' }] },
  { section: 'wasan', verses: [{ start: 56.8, end: 75.6, text: '彌陀成佛のこのかたは', ruby: 'みだじょうぶつのこのかたは' }, { start: 75.6, end: 92, text: 'いまに十劫をへたまへり', ruby: 'いまにじっこうをへたまえり' }, { start: 92, end: 102.3, text: '法身の光輪きはもなく', ruby: 'ほっしんのこうりんきはもなく' }, { start: 108.7, end: 121.4, text: '世の盲冥をてらすなり', ruby: 'せのもうみょうをてらすなり' }] },
  { section: 'wasan', verses: [{ start: 121.5, end: 129.5, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 129.5, end: 137.2, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 137.2, end: 145.2, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 145.2, end: 153.4, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 153.4, end: 155.9, text: '南', ruby: 'な' }] },
  { section: 'wasan', verses: [{ start: 155.9, end: 173.7, text: '智慧の光明はかりなし', ruby: 'ちえのこうみょうはかりなし' }, { start: 173.7, end: 187.8, text: '有量の諸相ことごとく', ruby: 'うりょうのしょそうことごとく' }, { start: 187.8, end: 203.2, text: '光暁かぶらぬものはなし', ruby: 'こうけうかむらなものはなし' }, { start: 203.2, end: 215.5, text: '眞實明に帰命せよ', ruby: 'しんじつみょうにきみょうせよ' }] },
  { section: 'wasan', verses: [{ start: 215.5, end: 223.3, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 223.3, end: 231.3, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 231.3, end: 239, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 239, end: 246.7, text: '南無', ruby: 'なも' }] },
  { section: 'wasan', verses: [{ start: 246.7, end: 256.7, text: '阿弥陀仏', ruby: 'あみだーんぶ' }, { start: 256.7, end: 264.5, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 264.5, end: 272, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 272, end: 280.4, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  { section: 'wasan', verses: [{ start: 280.4, end: 288.4, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 288.4, end: 296.4, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 296.4, end: 304.4, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 304.4, end: 312.4, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  { section: 'wasan', verses: [{ start: 312.4, end: 330.2, text: '解脱の光輪きはもなく', ruby: 'げだつのこうりんきはもなく' }, { start: 330.2, end: 343.3, text: '世の盲冥をてらすなり', ruby: 'せのもうみょうをてらすなり' }, { start: 343.3, end: 355.6, text: '智慧の光明はかりなし', ruby: 'ちえのこうみょうはかりなし' }, { start: 355.6, end: 367.9, text: '有量の諸相ことごとく', ruby: 'うりょうのしょそうことごとく' }] },
  { section: 'wasan', verses: [{ start: 367.9, end: 375.7, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 375.7, end: 383.7, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 383.7, end: 391.7, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 391.7, end: 399.7, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  { section: 'wasan', verses: [{ start: 399.7, end: 417.5, text: '光雲無碍如虚空', ruby: 'こううんむげにょくう' }, { start: 417.5, end: 430.6, text: '世の盲冥をてらすなり', ruby: 'せのもうみょうをてらすなり' }, { start: 430.6, end: 442.9, text: '智慧の光明はかりなし', ruby: 'ちえのこうみょうはかりなし' }, { start: 442.9, end: 455.2, text: '有量の諸相ことごとく', ruby: 'うりょうのしょそうことごとく' }] },
  { section: 'wasan', verses: [{ start: 455.2, end: 463, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 463, end: 471, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 471, end: 479, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 479, end: 487, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  { section: 'wasan', verses: [{ start: 487, end: 495, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 495, end: 503, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 503, end: 511, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 511, end: 519, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  { section: 'wasan', verses: [{ start: 519, end: 536.8, text: '清浄光明ならびなし', ruby: 'しょうじょうこうみょうならびなし' }, { start: 536.8, end: 549.9, text: '世の盲冥をてらすなり', ruby: 'せのもうみょうをてらすなり' }, { start: 549.9, end: 562.2, text: '智慧の光明はかりなし', ruby: 'ちえのこうみょうはかりなし' }, { start: 562.2, end: 574.5, text: '有量の諸相ことごとく', ruby: 'うりょうのしょそうことごとく' }] },
  { section: 'wasan', verses: [{ start: 574.5, end: 582.3, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 582.3, end: 590.3, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 590.3, end: 598.3, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 598.3, end: 606.3, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  { section: 'wasan', verses: [{ start: 606.3, end: 614.3, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 614.3, end: 622.3, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 622.3, end: 630.3, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 630.3, end: 638.3, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  { section: 'wasan', verses: [{ start: 638.3, end: 656.1, text: '佛光照曜最第一', ruby: 'ぶつこうしょうようさいだいいち' }, { start: 656.1, end: 669.2, text: '世の盲冥をてらすなり', ruby: 'せのもうみょうをてらすなり' }, { start: 669.2, end: 681.5, text: '智慧の光明はかりなし', ruby: 'ちえのこうみょうはかりなし' }, { start: 681.5, end: 693.8, text: '有量の諸相ことごとく', ruby: 'うりょうのしょそうことごとく' }] },
  { section: 'wasan', verses: [{ start: 693.8, end: 701.6, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 701.6, end: 709.6, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 709.6, end: 717.6, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 717.6, end: 725.6, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] }
];

// ページ要素を作成する関数
function createPageElement(pageData) {
  const pageDiv = document.createElement('div');
  pageDiv.classList.add('page');
  pageDiv.dataset.section = pageData.section;
  pageData.verses.forEach(verseData => {
    const verseDiv = document.createElement('div');
    verseDiv.classList.add('verse');
    verseDiv.dataset.start = verseData.start;
    verseDiv.dataset.end = verseData.end;

  const rubyElement = document.createElement('ruby');
  // 一部ブラウザで <rb> の扱いが不安定なため、span.rb を使用
  const rbElement = document.createElement('span');
  rbElement.classList.add('rb');
    // 一文字ずつspan化（後でchar単位でハイライト）
    const text = verseData.text || '';
    for (let i = 0; i < text.length; i++) {
      const charSpan = document.createElement('span');
      charSpan.classList.add('char');
      charSpan.textContent = text[i];
      charSpan.dataset.charIndex = i;
      rbElement.appendChild(charSpan);
    }

    const rtElement = document.createElement('rt');
    rtElement.textContent = verseData.ruby || '';

    rubyElement.appendChild(rbElement);
    rubyElement.appendChild(rtElement);
    verseDiv.appendChild(rubyElement);

    verseDiv.addEventListener('click', () => {
      if (!isNaN(verseData.start) && audioElement.duration) {
        audioElement.currentTime = verseData.start;
        if (audioElement.paused) {
          audioElement.play().catch(e => console.error("Error playing on verse click:", e));
        }
      }
    });

    pageDiv.appendChild(verseDiv);
  });
  return pageDiv;
}

// 初期化関数
function initialize() {
  pagesContainer.innerHTML = '';
  pages = [];
  originalPagesData.forEach(pageData => {
    const pageElement = createPageElement(pageData);
    pagesContainer.appendChild(pageElement);
    pages.push(pageElement);
  });
  switchMode(currentMode, true);
  playBtn.addEventListener('click', playAudio);
  pauseBtn.addEventListener('click', pauseAudio);
  audioElement.addEventListener('timeupdate', handleTimeUpdate);
  audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
  audioElement.addEventListener('ended', handleAudioEnded);
  audioElement.addEventListener('error', handleAudioError);
  progressBarContainer.addEventListener('click', handleProgressBarClick);
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  showImage(0);
  console.log("Application initialized.");
}

// モード切替関数
function switchMode(mode, isInitialLoad = false) {
  if (!isInitialLoad && currentMode === mode) return;
  console.log(`Switching mode to: ${mode}`);
  currentMode = mode;
  currentActivePage = null;
  Object.values(modeButtons).forEach(btn => btn.classList.remove('active'));
  if (modeButtons[mode]) modeButtons[mode].classList.add('active');
  const newAudioSrc = audioFiles[mode];
  const currentFileName = audioElement.currentSrc.substring(audioElement.currentSrc.lastIndexOf('/') + 1);
  const newFileName = newAudioSrc.substring(newAudioSrc.lastIndexOf('/') + 1);
  if (isInitialLoad || currentFileName !== newFileName) {
    audioElement.pause();
    audioElement.src = newAudioSrc;
    audioElement.load();
    audioElement.currentTime = 0;
    progressBar.style.width = '0%';
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    console.log(`Audio source set to: ${newAudioSrc}`);
  }
  const firstPageOfMode = pages.find(p => p.dataset.section === mode);
  pages.forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
    p.querySelectorAll('.verse.highlight').forEach(v => v.classList.remove('highlight'));
  });
  if (firstPageOfMode) {
    firstPageOfMode.style.display = 'flex';
    firstPageOfMode.classList.add('active');
    currentActivePage = firstPageOfMode;
    console.log("Showing first page of mode:", mode);
  } else {
    console.warn("No pages found for mode:", mode);
  }
  highlightVerse(0);
  updateActivePage(null);
  showImage(0);
}

// 画像表示関数（エラーハンドリング強化）
function showImage(index) {
  if (index === currentImageIndex) return;
  const imageList = imageFiles[currentMode];
  if (imageList && index >= 0 && index < imageList.length) {
    const imageName = imageList[index];
    const imagePath = `image/${imageName}`;
    scriptureImage.src = imagePath;
    scriptureImage.alt = imageName.replace('.png', '');
    currentImageIndex = index;

    // 画像ロードエラーハンドリング
    scriptureImage.onerror = () => {
      console.warn(`Image not found: ${imagePath}`);
      scriptureImage.src = "";
      scriptureImage.alt = "画像が見つかりません";
    };
  } else {
    scriptureImage.src = "";
    scriptureImage.alt = "";
    currentImageIndex = -1;
  }
}

// ハイライト関数
function highlightVerse(currentTime) {
  let highlightedVerseElement = null;
  let overallVerseIndex = -1;
  let currentPageIndex = -1;
  const pagesOfMode = pages.filter(p => p.dataset.section === currentMode);
  for (let i = 0; i < pagesOfMode.length; i++) {
    const page = pagesOfMode[i];
    const versesOnPage = Array.from(page.querySelectorAll('.verse'));
    for (let j = 0; j < versesOnPage.length; j++) {
      const v = versesOnPage[j];
      const start = parseFloat(v.dataset.start);
      const end = parseFloat(v.dataset.end);
      if (!isNaN(start) && !isNaN(end) && currentTime >= start && currentTime < end) {
        highlightedVerseElement = v;
        currentPageIndex = i;
        break;
      }
    }
    if (highlightedVerseElement) break;
  }
  // 既存のハイライトをリセット（句・文字）
  pages.forEach(p => {
    p.querySelectorAll('.verse.highlight').forEach(v => v.classList.remove('highlight'));
    p.querySelectorAll('.char.highlight-char').forEach(c => c.classList.remove('highlight-char'));
  });
  if (highlightedVerseElement) {
    highlightedVerseElement.classList.add('highlight');
    // 文字単位ハイライト
    const verseStart = parseFloat(highlightedVerseElement.dataset.start);
    const verseEnd = parseFloat(highlightedVerseElement.dataset.end);
    const verseDuration = verseEnd - verseStart;
    const elapsedTime = currentTime - verseStart;
  const chars = Array.from(highlightedVerseElement.querySelectorAll('.rb .char'));
    if (chars.length > 0 && verseDuration > 0) {
      const charDuration = verseDuration / chars.length;
      let charIndex = Math.floor(elapsedTime / charDuration);
      if (charIndex < 0) charIndex = 0;
      if (charIndex >= chars.length) charIndex = chars.length - 1;
      // 念のため、その句内の既存charハイライトを除去してから付与
      chars.forEach(c => c.classList.remove('highlight-char'));
      chars[charIndex].classList.add('highlight-char');
    }
    showImage(currentPageIndex);
  } else {
    if (audioElement.paused && audioElement.currentTime === 0) {
      showImage(0);
    }
  }
  return highlightedVerseElement;
}

// アクティブページ更新関数
function updateActivePage(highlightedVerseElement) {
  let pageToShow = null;
  if (highlightedVerseElement) {
    pageToShow = pages.find(p => p.dataset.section === currentMode && p.contains(highlightedVerseElement));
  }
  if (!pageToShow) {
    if (!audioElement.paused) {
      pageToShow = currentActivePage;
    } else {
      pageToShow = pages.find(p => p.dataset.section === currentMode);
      if (audioElement.currentTime > 0) {
        const pageAtCurrentTime = pages.find(p => {
          if (p.dataset.section !== currentMode) return false;
          const verses = p.querySelectorAll('.verse');
          const firstVerseStart = verses.length > 0 ? parseFloat(verses[0].dataset.start) : NaN;
          const lastVerseEnd = verses.length > 0 ? parseFloat(verses[verses.length - 1].dataset.end) : NaN;
          return !isNaN(firstVerseStart) && !isNaN(lastVerseEnd) && audioElement.currentTime >= firstVerseStart && audioElement.currentTime < lastVerseEnd;
        });
        if (pageAtCurrentTime) pageToShow = pageAtCurrentTime;
      }
    }
  }
  pages.forEach(p => {
    if (p === pageToShow) {
      if (!p.classList.contains('active')) {
        p.style.display = 'flex';
        p.classList.add('active');
      }
      currentActivePage = p;
    } else {
      p.style.display = 'none';
      p.classList.remove('active');
    }
  });
}

// 再生関数
function playAudio() {
  const playPromise = audioElement.play();
  if (playPromise !== undefined) {
    playPromise.then(_ => {
      playBtn.disabled = true;
      pauseBtn.disabled = false;
      console.log("Audio playback started.");
    }).catch(error => {
      console.error("Audio playback failed:", error);
      alert("音声の再生を開始できませんでした。");
      playBtn.disabled = false;
      pauseBtn.disabled = true;
    });
  } else {
    playBtn.disabled = true;
    pauseBtn.disabled = false;
  }
}

// 一時停止関数
function pauseAudio() {
  audioElement.pause();
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  console.log("Audio playback paused.");
}

// 時間更新ハンドラー
function handleTimeUpdate() {
  if (audioElement.duration) {
    progressBar.style.width = (audioElement.currentTime / audioElement.duration) * 100 + '%';
  }
  const highlightedVerseElement = highlightVerse(audioElement.currentTime);
  updateActivePage(highlightedVerseElement);
}

// メタデータロードハンドラー
function handleLoadedMetadata() {
  console.log("Audio metadata loaded. Duration:", audioElement.duration, "Src:", audioElement.currentSrc);
  progressBar.style.width = '0%';
  playBtn.disabled = false;
  pauseBtn.disabled = true;
}

// 終了ハンドラー
function handleAudioEnded() {
  console.log("Audio ended.");
  playBtn.disabled = false;
  pauseBtn.disabled = true;
}

// エラーハンドラー（強化）
function handleAudioError(e) {
  console.error("Audio Error:", audioElement.error, "Src:", audioElement.currentSrc);
  const err = audioElement.error;
  let message = `音声ファイルの読み込み/再生に失敗しました。\nファイル: ${audioElement.currentSrc.split('/').pop()}`;
  if (err) {
    message += `\nエラーコード: ${err.code}`;
    switch (err.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        message += ' (読み込み中止)';
        break;
      case MediaError.MEDIA_ERR_NETWORK:
        message += ' (ネットワークエラー)';
        break;
      case MediaError.MEDIA_ERR_DECODE:
        message += ' (デコードエラー)';
        break;
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        message += ' (ファイル形式非対応/ファイルが見つからない)';
        break;
      default:
        message += ' (不明なエラー)';
    }
  }
  alert(message);
  playBtn.disabled = true;
  pauseBtn.disabled = true;
}

// プログレスバークリックハンドラー
function handleProgressBarClick(e) {
  if (!audioElement.duration || !isFinite(audioElement.duration)) {
    console.warn("Cannot seek: Audio duration not available or invalid.");
    return;
  }
  const rect = progressBarContainer.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const newTime = (offsetX / rect.width) * audioElement.duration;
  if (isFinite(newTime)) {
    audioElement.currentTime = newTime;
    console.log(`Seeked to: ${newTime.toFixed(2)}s`);
    const highlightedVerseElement = highlightVerse(audioElement.currentTime);
    updateActivePage(highlightedVerseElement);
    progressBar.style.width = (audioElement.currentTime / audioElement.duration) * 100 + '%';
  } else {
    console.warn("Cannot seek: Calculated time is not finite.", newTime);
  }
}

// DOMContentLoadedイベントで初期化
document.addEventListener('DOMContentLoaded', initialize);
