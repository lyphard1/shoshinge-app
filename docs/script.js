// 正信偈アプリのJavaScriptファイル
// 音声再生、テキストハイライト、画像表示を管理

// DOM要素の取得
const audioElement = document.createElement('audio');
audioElement.id = 'audio';
// 初期表示で大きな音声データを全取得しない（メタデータのみ取得）
audioElement.preload = 'metadata';
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
// タイミング補正UI
const offsetMinusBtn = document.getElementById('offsetMinusBtn');
const offsetPlusBtn = document.getElementById('offsetPlusBtn');
const offsetResetBtn = document.getElementById('offsetResetBtn');
const offsetValueEl = document.getElementById('offsetValue');

// グローバル変数
let currentMode = 'shoshinge';
let pages = [];
let currentActivePage = null;
let currentImageIndex = -1;
// モード別のハイライト補正（秒）。音声に対して + はハイライトを遅らせる。
const highlightOffset = {
  shoshinge: 0,
  wasan: 0
};
const OFFSET_STEP = 0.1; // 秒
function getEffectiveTime(t) {
  // 現在モードの補正を適用した時間を返す（ハイライト・ページ計算用）
  const off = highlightOffset[currentMode] || 0;
  const eff = t - off;
  return eff < 0 ? 0 : eff;
}
function updateOffsetDisplay() {
  const v = highlightOffset[currentMode] || 0;
  offsetValueEl.textContent = `${v.toFixed(1)}s`;
}

// 画像ファイルリスト（モード別）
const imageFiles = {
  shoshinge: [
    "帰命無量寿如来.png", "覩見諸仏浄土因.png", "五劫思惟之摂受.png", "清浄歓喜智慧光.png",
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
    "解脱の光輪きはもなし.png", "南無阿弥陀仏6.png", "光雲無碍如虚空.png", "南無阿弥陀仏7.png",
    "南無阿弥陀仏8.png", "南無阿弥陀仏9.png", "清浄光明ならびなし.png", "南無阿弥陀仏10.png",
    "佛光照曜最第一.png", "願以此功徳.png"
  ]
};

// 音声ファイルリスト（モード別）
// 備考: 絶対パスだと Live Server で 404 になるため、docs を基準にした相対パスに統一
const audioFiles = {
  shoshinge: 'audio/shoshinge.mp3',
  wasan: 'audio/nenbutuwasan.mp3'
};// 正信偈と念仏和讃のデータ（タイムコード付き）
const originalPagesData = [
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 6.851926, end: 21.518901, text: '帰命無量寿如来', ruby: 'きみょうむりょうじゅにょらい' }, { start: 21.518901, end: 30.021894, text: '南無不可思議光', ruby: 'なむふかしぎこう' }, { start: 30.682321, end: 37.864461, text: '法蔵菩薩因位時', ruby: 'ほうぞうぼさついんにじ' }, { start: 38.524887, end: 45.156671, text: '在世自在王仏所', ruby: 'ざいせいじざいおうぶっしょ' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 45.78958, end: 52.146187, text: '覩見諸仏浄土因', ruby: 'とけんしょぶつじょうどいん' }, { start: 52.806613, end: 59.053149, text: '国土人天之善悪', ruby: 'こくどにんでんしぜんまく' }, { start: 59.631022, end: 65.987628, text: '建立無上殊勝願', ruby: 'こんりゅうむじょうしゅしょうがん' }, { start: 66.510466, end: 72.674448, text: '超発希有大弘誓', ruby: 'ちょうほつけーうだいぐぜい' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 73.224804, end: 79.361268, text: '五劫思惟之摂受', ruby: 'ごこうしゆいししょうじゅ' }, { start: 79.884106, end: 86.130641, text: '重誓名声聞十方', ruby: 'じゅうせいみょうしょうもんじっぽう' }, { start: 86.708514, end: 92.872496, text: '普放無量無辺光', ruby: 'ふほうむりょうむへんこう' }, { start: 93.477887, end: 99.614351, text: '無碍無対光炎王', ruby: 'むげむたいこうえんのう' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 100.137189, end: 106.1911, text: '清浄歓喜智慧光', ruby: 'しょうじょうかんぎちえこう' }, { start: 106.768973, end: 112.87792, text: '不断難思無称光', ruby: 'ふだんなんじむしょうこう' }, { start: 113.455793, end: 119.399633, text: '超日月光照塵刹', ruby: 'ちょうにちがっこうしょうじんせつ' }, { start: 120.032542, end: 126.003899, text: '一切群生蒙光照', ruby: 'いっさいぐんじょうむこうしょう' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 126.664326, end: 132.525612, text: '本願名号正定業', ruby: 'ほんがんみょうごうしょうじょうごう' }, { start: 133.158521, end: 139.129879, text: '至心信楽願為因', ruby: 'ししんしんぎょうがんにいん' }, { start: 139.707752, end: 145.679109, text: '成等覚証大涅槃', ruby: 'じょうとうがくしょうだいねはん' }, { start: 146.284501, end: 152.145787, text: '必至滅度願成就', ruby: 'ひっしめつどがんじょうじゅ' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 152.778696, end: 158.584947, text: '如来所以興出世', ruby: 'にょらいしょいこうしゅっせ' }, { start: 159.107784, end: 165.079142, text: '唯説弥陀本願海', ruby: 'ゆいせつみだほんがんかい' }, { start: 165.629497, end: 171.600855, text: '五濁悪時群生海', ruby: 'ごじょくあくじぐんじょうかい' }, { start: 172.096175, end: 177.902426, text: '応信如来如実言', ruby: 'おんしんにょらいにょじつごん' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 178.397746, end: 184.28655, text: '能発一念喜愛心', ruby: 'のうほついちねんきあいしん' }, { start: 184.78187, end: 190.560603, text: '不断煩悩得涅槃', ruby: 'ふだんぼんじょうとくねはん' }, { start: 191.055923, end: 197.054798, text: '凡聖逆謗斉廻入', ruby: 'ぼんじょうぎゃくほうさいえにゅう' }, { start: 197.550118, end: 203.356369, text: '如衆水入海一味', ruby: 'にょしゅうすいにゅうかいいちみ' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 203.96176, end: 209.795529, text: '摂取心光常照護', ruby: 'せっしゅしんこうじょうしょうご' }, { start: 210.373402, end: 216.317242, text: '已能雖破無明闇', ruby: 'いのうすいはむみょうあん' }, { start: 216.867598, end: 222.646331, text: '貪愛瞋憎之雲霧', ruby: 'とんないしんぞうしうんむ' }, { start: 223.196686, end: 228.947901, text: '常覆真実信心天', ruby: 'じょうふしんじつしんじんてん' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 229.553293, end: 235.304508, text: '譬如日光覆雲霧', ruby: 'にょらいにっこうふうんむ' }, { start: 235.827346, end: 241.661114, text: '雲霧之下明無闇', ruby: 'うんむしげみょうむあん' }, { start: 242.128916, end: 247.90765, text: '獲信見敬大慶喜', ruby: 'ぎゃくしんけんきょうだいきょうき' }, { start: 248.458005, end: 254.099149, text: '即横超截五悪趣', ruby: 'そくおうちょうぜつごあくしゅ' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 254.677023, end: 260.345685, text: '一切善悪凡夫人', ruby: 'いっさいぜんあくぼんぶにん' }, { start: 260.868522, end: 266.702291, text: '聞信如来弘誓願', ruby: 'もんしんにょらいくぜいがん' }, { start: 267.170093, end: 272.866273, text: '仏言広大勝解者', ruby: 'ぶつごんこうだいしょうげしゃ' }, { start: 273.334075, end: 279.663164, text: '是人名分陀利華', ruby: 'ぜにんみょうふんだりけ' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 279.773235, end: 285.084166, text: '弥陀仏本願念仏', ruby: 'みだぶつほんがんねんぶつ' }, { start: 285.77211, end: 291.385737, text: '邪見驕慢悪衆生', ruby: 'じゃけんきょうまんなくしゅじょう' }, { start: 291.853539, end: 297.577236, text: '信楽受持甚以難', ruby: 'しんぎょうじゅじじんになん' }, { start: 298.072556, end: 303.658665, text: '難中之難無過斯', ruby: 'なんちゅうしなんむかし' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 304.236538, end: 309.850165, text: '印度西天之論家', ruby: 'いんどさいてんしろんげ' }, { start: 310.345485, end: 319.013584, text: '中夏日域之高僧', ruby: 'ちゅうかじちいきしこうそう' }, { start: 319.591458, end: 325.01246, text: '顕大聖興世正意', ruby: 'けんだいしょうこうせしょうい' }, { start: 325.562815, end: 331.176442, text: '明如来本誓応機', ruby: 'みょうにょらいほんぜいおうき' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 331.644244, end: 337.312906, text: '釈迦如来楞伽山', ruby: 'しゃかにょらいりょうがせん' }, { start: 337.863261, end: 346.42129, text: '為衆告命南天竺', ruby: 'いしゅうごうみょうなんてんじく' }, { start: 347.026681, end: 352.447683, text: '龍樹大士出於世', ruby: 'りゅうじゅだいじしゅっとせ' }, { start: 353.080592, end: 358.501594, text: '悉能摧破有無見', ruby: 'しつのうざいはうむけん' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 358.996914, end: 364.500469, text: '宣説大乗無上法', ruby: 'せんぜつだいじょうむじょうほう' }, { start: 365.023307, end: 370.609416, text: '証歓喜地生安楽', ruby: 'しょうかんぎじしょうあんらく' }, { start: 371.0497, end: 376.663326, text: '顕示難行陸路苦', ruby: 'けんじなんぎょうろくろく' }, { start: 377.103611, end: 382.469577, text: '信楽易行水道楽', ruby: 'しんぎょういぎょうしいどうらく' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 383.157522, end: 388.771148, text: '憶念弥陀仏本願', ruby: 'おくねんみだほんがんかい' }, { start: 389.211433, end: 397.796979, text: '自然即時入必定', ruby: 'じねんそくじにゅうひつじょう' }, { start: 398.347334, end: 403.878407, text: '唯能常称如来号', ruby: 'ゆいのうじょうしょうにょらいごう' }, { start: 404.456281, end: 409.959836, text: '応報大悲弘誓恩', ruby: 'おうほうだいひぐぜいがん' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 410.427638, end: 415.903676, text: '天親菩薩造論説', ruby: 'てんじんぼさつぞうろんせつ' }, { start: 416.536585, end: 422.205247, text: '帰命無碍光如来', ruby: 'きみょうむげこうにょらい' }, { start: 422.728084, end: 428.176604, text: '依修多羅顕真実', ruby: 'えしゅうたらけんしんじつ' }, { start: 428.699442, end: 434.230515, text: '光闡横超大誓願', ruby: 'こうせんおうちょうだいせいがん' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 434.780871, end: 440.201873, text: '広由本願力回向', ruby: 'こうゆほんがんりきえこう' }, { start: 440.752228, end: 446.228266, text: '為度群生彰一心', ruby: 'いどぐんじょうしょういっしん' }, { start: 446.833657, end: 452.447283, text: '帰入功徳大宝海', ruby: 'きにゅうくどくだいほうかい' }, { start: 452.915085, end: 458.391123, text: '必獲入大会衆数', ruby: '筆逆にゅうだいえしゅしゅう' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 459.024032, end: 464.555105, text: '得至蓮華蔵世界', ruby: 'とくしれんげぞうせいかい' }, { start: 464.967872, end: 470.443909, text: '即証真如法性身', ruby: 'そくしょうしんにょほっしょうじん' }, { start: 470.994265, end: 476.49782, text: '遊煩悩林現神通', ruby: 'ゆうぼんのうりんげんじんずう' }, { start: 476.965622, end: 482.414142, text: '入生死園示応化', ruby: 'にゅうしょうじおんじおうげ' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 482.964497, end: 488.495571, text: '本師曇鸞梁天子', ruby: 'ほんしげんくうみょうぶっきょう' }, { start: 488.935855, end: 494.521964, text: '常向鸞処菩薩礼', ruby: 'じょうこうらんしょぼさつらい' }, { start: 494.989766, end: 500.575875, text: '三蔵流支授浄教', ruby: 'さんぞうるしじゅじょうきょう' }, { start: 500.961123, end: 506.464679, text: '焚焼仙経帰楽邦', ruby: 'ぼんじょうせんぎょうきらくほう' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 507.015034, end: 512.463554, text: '天親菩薩論註解', ruby: 'てんじんぼつさろんちゅうげ' }, { start: 512.958874, end: 518.407394, text: '報土因果顕誓願', ruby: '' }, { start: 519.012785, end: 524.433787, text: '往還回向由他力', ruby: '' }, { start: 524.929107, end: 530.322591, text: '正定之因唯信心', ruby: 'しょうじょうしいんゆいしんじん' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 530.817911, end: 536.459055, text: '惑染凡夫信心発', ruby: 'わくぜんぼんぶしんじんぽつ' }, { start: 536.926857, end: 542.540484, text: '証知生死即涅槃', ruby: 'しょうちしょうじそくねはん' }, { start: 543.035804, end: 548.566877, text: '必至無量光明土', ruby: 'ひっしむりょうこうみょうど' }, { start: 549.062197, end: 554.620788, text: '諸有衆生皆普化', ruby: 'しょうしゅじょうかいふけ' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 555.033554, end: 560.592145, text: '道綽決聖道難証', ruby: 'どうしゃっけっしょうどうなんしょう' }, { start: 561.03243, end: 566.72861, text: '唯明浄土可通入', ruby: 'ゆいみょうじょうどかつうにゅう' }, { start: 567.22393, end: 572.892591, text: '万善自力貶勤修', ruby: 'まんぜんじりきへんごんしゅう' }, { start: 573.332876, end: 578.698842, text: '円満徳号勧専称', ruby: 'えんまんとくごうかんせんしょう' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 579.22168, end: 584.6702, text: '三不三信誨慇懃', ruby: 'さんぷさんしんけおんごん' }, { start: 585.16552, end: 590.779146, text: '像末法滅同悲引', ruby: 'ぞうまつほうめつどうひいん' }, { start: 591.301984, end: 597.025682, text: '一生造悪値弘誓', ruby: 'いっしょうぞうあくちぐぜい' }, { start: 597.548519, end: 611.224854, text: '至安養界証妙果', ruby: 'しあんにょうがいしょうみょうか' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 612.325565, end: 627.845591, text: '善導独明仏正意', ruby: 'ぜんどうどくみょうぶっしょうい' }, { start: 628.010698, end: 636.568727, text: '矜哀定散与逆悪', ruby: 'こうあいじょうさんよぎゃくあく' }, { start: 637.091564, end: 644.769024, text: '光明名号顕因縁', ruby: 'こうみょうみょうごうけんいんねんし' }, { start: 645.264344, end: 651.951164, text: '開入本願大智海', ruby: 'かいにゅうほんがんだいちかい' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 652.391448, end: 658.968197, text: '行者正受金剛心', ruby: 'ぎょうじゃしょうじゅこんごうしん' }, { start: 659.380963, end: 665.792605, text: '慶喜一念相応後', ruby: 'きょうきいちねんそうおうご' }, { start: 666.150336, end: 672.479425, text: '与韋提等獲三忍', ruby: 'よいだいとうぎゃくさんにん' }, { start: 672.91971, end: 679.056174, text: '即証法性之常楽', ruby: 'そくしょうほっしょうしじょうらく' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 679.606529, end: 685.9081, text: '源信広開一代教', ruby: 'げんしんこうかいいちだいきょう' }, { start: 686.348384, end: 692.484849, text: '偏帰安養勧一切', ruby: 'へんきあんにょうかんいっさい' }, { start: 692.897615, end: 699.199186, text: '専雑執心判浅深', ruby: 'せんぞうしゅうしんはんせんじん' }, { start: 699.556917, end: 705.720899, text: '報化二土正弁立', ruby: 'ほうけにどししょうべんりゅう' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 706.07863, end: 712.105023, text: '極重悪人唯称仏', ruby: 'ごくじゅうあくにんゆいしょうぶつ' }, { start: 712.600343, end: 718.70929, text: '我亦在彼摂取中', ruby: 'がやくざいひせっしゅちゅう' }, { start: 719.067021, end: 725.203485, text: '煩悩障眼雖不見', ruby: 'ぼんのうしょうげんすいふけん' }, { start: 725.588734, end: 731.422503, text: '大悲無倦常照我', ruby: 'だいひむけんじょうしょうが' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 731.94534, end: 737.971733, text: '本師源空明仏教', ruby: 'ほんしげんくうみょうぶっきょう' }, { start: 738.412018, end: 744.410893, text: '憐愍善悪凡夫人', ruby: 'れんみんぜんあくぼんぶにん' }, { start: 744.878695, end: 751.042677, text: '真宗教証興片州', ruby: 'しんしゅうきょうしょうこうへんしゅう' }, { start: 751.400408, end: 757.206659, text: '選択本願弘悪世', ruby: 'せんじゃくほんがんぐあくせい' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 757.674955, end: 763.694693, text: '還来生死輪転家', ruby: 'げんらいしょうじりんでんげ' }, { start: 764.114675, end: 770.14608, text: '決以疑情為所止', ruby: 'けっちぎじょういしょし' }, { start: 770.558979, end: 776.693487, text: '速入寂静無為楽', ruby: 'そくにゅうじゃくじょうむいらく' }, { start: 777.076893, end: 783.919228, text: '必以信心為能入', ruby: 'ひっちしんじんいのうにゅう' }] },
  // --- 正信偈 (shoshinge) ---
  { section: 'shoshinge', verses: [{ start: 784.450099, end: 795.837291, text: '弘経大士宗師等', ruby: 'ぐきょうだいじしゅうしとう' }, { start: 796.257273, end: 807.624777, text: '拯済無辺極濁悪', ruby: 'じょうさいむへんごくじょくあく' }, { start: 808.044759, end: 819.384264, text: '道俗時衆共同心', ruby: 'どうぞくじしゅうぐどうしん' }, { start: 820.112232, end: 828.87585, text: '唯可信斯高僧説', ruby: 'ゆいかしんしこうそうせつ' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 0.392687, end: 9.34268, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 11.76425, end: 20.468814, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 21.139654, end: 28.911586, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 29.484255, end: 36.863499, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 37.485254, end: 44.979032, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 45.764406, end: 53.274546, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 54.059921, end: 56.170614, text: '南', ruby: 'な' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 56.694196, end: 65.56238, text: '彌陀成佛のこのかたは', ruby: 'みだじょうぶつのこのかたは' }, { start: 66.216858, end: 75.477728, text: 'いまに十劫をへたまへり', ruby: 'いまにじっこうをへたまえり' }, { start: 75.477728, end: 91.201573, text: '法身の光輪きはもなく', ruby: 'ほっしんのこうりんきはもなく' }, { start: 91.823328, end: 107.890774, text: '世の盲冥をてらすなり', ruby: 'せのもうみょうをてらすなり' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 108.479804, end: 120.554932, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 121.340306, end: 128.719551, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 129.292219, end: 136.360587, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 136.998703, end: 144.377948, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 144.999702, end: 152.608014, text: '南', ruby: 'な' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 153.246131, end: 155.3241, text: '智慧の光明はかりなし', ruby: 'ちえのこうみょうはかりなし' }, { start: 155.684063, end: 173.420429, text: '有量の諸相ことごとく', ruby: 'うりょうのしょそうことごとく' }, { start: 173.420429, end: 187.000857, text: '光暁かぶらぬものはなし', ruby: 'こうけうかむらなものはなし' }, { start: 187.557164, end: 202.348377, text: '眞實明に帰命せよ', ruby: 'しんじつみょうにきみょうせよ' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 202.921046, end: 214.603486, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 215.290689, end: 222.5554, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 223.046259, end: 230.474589, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 230.998172, end: 238.246521, text: '南無', ruby: 'なも' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 238.802827, end: 246.116624, text: '阿弥陀仏', ruby: 'あみだーんぶ' }, { start: 246.362054, end: 256.391936, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 256.391936, end: 263.722095, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 264.212954, end: 271.264959, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 271.755818, end: 280.182228, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 280.182228, end: 286.677927, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 287.266957, end: 294.089895, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 294.662564, end: 301.780017, text: '南', ruby: 'な' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 302.254514, end: 304.545188, text: '解脱の光輪きはもなし', ruby: '' }, { start: 305.085133, end: 325.766652, text: '光触かぶるものはみな', ruby: '' }, { start: 326.175702, end: 339.379804, text: '有無をはなるとのべたまふ', ruby: '' }, { start: 339.968835, end: 352.322116, text: '平等覚に帰命せよ', ruby: '' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 352.927509, end: 364.446329, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 365.411685, end: 372.087365, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 372.561862, end: 380.628309, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 380.628309, end: 387.025836, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 387.631229, end: 394.421443, text: '南', ruby: 'な' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 394.863216, end: 397.088442, text: '光雲無碍如虚空', ruby: '' }, { start: 397.808369, end: 417.802686, text: '一切の有碍にさはりなし', ruby: '' }, { start: 417.802686, end: 431.661267, text: '光沢かぶらぬものぞなき', ruby: '' }, { start: 432.217574, end: 444.521769, text: '難思議を帰命せよ', ruby: '' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 445.088238, end: 456.454284, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 457.16572, end: 463.941306, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 464.449475, end: 471.106488, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 471.580779, end: 482.3709, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 482.86213, end: 495.109001, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 495.109001, end: 503.527667, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 503.96808, end: 511.522858, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 512.031027, end: 519.772134, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 520.263364, end: 527.665692, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 528.089166, end: 535.305165, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 535.830273, end: 543.385051, text: '南', ruby: 'な' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 543.927098, end: 546.02753, text: '清浄光明ならびなし', ruby: '' }, { start: 546.264675, end: 567.184297, text: '遇斯光のゆえなれば', ruby: '' }, { start: 567.184297, end: 580.75146, text: '一切の業繋ものぞこりぬ', ruby: '' }, { start: 581.258681, end: 596.491667, text: '畢竟依を帰命せよ', ruby: '' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 597.031611, end: 609.024929, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 609.597598, end: 616.895033, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 617.353168, end: 624.63424, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 625.157823, end: 632.373448, text: '南無阿弥陀仏', ruby: 'なもあみだーんぶ' }, { start: 632.831583, end: 640.521705, text: '南', ruby: 'な' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 640.97984, end: 643.188705, text: '佛光照曜最第一', ruby: '' }, { start: 643.385048, end: 660.188783, text: '光炎王仏となづけたり', ruby: '' }, { start: 660.188783, end: 675.438131, text: '三塗の黒闇ひらくなり', ruby: '' }, { start: 675.863542, end: 689.460332, text: '大応供を帰命せよ', ruby: '' }] },
  // --- 念仏和讃 (wasan) ---
  { section: 'wasan', verses: [{ start: 689.983914, end: 702.353557, text: '願以此功徳', ruby: '' }, { start: 703.106207, end: 722.200616, text: '平等施一切', ruby: '' }, { start: 722.200616, end: 732.606824, text: '同発菩提心', ruby: '' }, { start: 733.146769, end: 742.91486, text: '往生安楽国', ruby: '' }] },
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
      if (!isNaN(verseData.start)) {
        audioElement.currentTime = verseData.start;
        // 停止中は自動再生しない。UIだけ即時反映
        // ハイライトは補正時間で再計算
        const highlighted = highlightVerse(getEffectiveTime(audioElement.currentTime));
        updateActivePage(highlighted);
        // 再生中/停止中に関わらず進捗バーを即時更新（timeupdate待ちでズレないように）
        if (audioElement.duration && isFinite(audioElement.duration)) {
          progressBar.style.width = (audioElement.currentTime / audioElement.duration) * 100 + '%';
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
  // 補正ボタン
  if (offsetMinusBtn && offsetPlusBtn && offsetResetBtn && offsetValueEl) {
    offsetMinusBtn.addEventListener('click', () => {
      highlightOffset[currentMode] = parseFloat((highlightOffset[currentMode] - OFFSET_STEP).toFixed(2));
      updateOffsetDisplay();
      const highlighted = highlightVerse(getEffectiveTime(audioElement.currentTime));
      updateActivePage(highlighted);
    });
    offsetPlusBtn.addEventListener('click', () => {
      highlightOffset[currentMode] = parseFloat((highlightOffset[currentMode] + OFFSET_STEP).toFixed(2));
      updateOffsetDisplay();
      const highlighted = highlightVerse(getEffectiveTime(audioElement.currentTime));
      updateActivePage(highlighted);
    });
    offsetResetBtn.addEventListener('click', () => {
      highlightOffset[currentMode] = 0;
      updateOffsetDisplay();
      const highlighted = highlightVerse(getEffectiveTime(audioElement.currentTime));
      updateActivePage(highlighted);
    });
    updateOffsetDisplay();
  }
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
  updateOffsetDisplay();
  highlightVerse(getEffectiveTime(0));
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
  // currentTime は補正済みの時間を渡す想定
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
      playBtn.classList.add('active');
      pauseBtn.classList.remove('active');
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
    playBtn.classList.add('active');
    pauseBtn.classList.remove('active');
  }
}

// 一時停止関数
function pauseAudio() {
  audioElement.pause();
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  playBtn.classList.remove('active');
  pauseBtn.classList.add('active');
  console.log("Audio playback paused.");
}

// 時間更新ハンドラー
function handleTimeUpdate() {
  if (audioElement.duration) {
    progressBar.style.width = (audioElement.currentTime / audioElement.duration) * 100 + '%';
  }
  const highlightedVerseElement = highlightVerse(getEffectiveTime(audioElement.currentTime));
  updateActivePage(highlightedVerseElement);
}

// メタデータロードハンドラー
function handleLoadedMetadata() {
  console.log("Audio metadata loaded. Duration:", audioElement.duration, "Src:", audioElement.currentSrc);
  progressBar.style.width = '0%';
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  playBtn.classList.remove('active');
  pauseBtn.classList.remove('active');
}

// 終了ハンドラー
function handleAudioEnded() {
  console.log("Audio ended.");
  playBtn.disabled = false;
  pauseBtn.disabled = true;
  playBtn.classList.remove('active');
  pauseBtn.classList.add('active');
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
    const effTime = getEffectiveTime(audioElement.currentTime);
    const highlightedVerseElement = highlightVerse(effTime);
    // ハイライトが取れない（無音区間など）場合でも、時間に合うページへ即時切り替え
    if (!highlightedVerseElement) {
      const pagesOfMode = pages.filter(p => p.dataset.section === currentMode);
      let targetPage = null;
      let targetIndex = -1;
      for (let i = 0; i < pagesOfMode.length; i++) {
        const p = pagesOfMode[i];
        const verses = p.querySelectorAll('.verse');
        if (verses.length === 0) continue;
        const firstStart = parseFloat(verses[0].dataset.start);
        const lastEnd = parseFloat(verses[verses.length - 1].dataset.end);
        if (!isNaN(firstStart) && !isNaN(lastEnd) && effTime >= firstStart && effTime < lastEnd) {
          targetPage = p;
          targetIndex = i;
          break;
        }
      }
      if (targetPage) {
        pages.forEach(p => {
          if (p === targetPage) {
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
        if (targetIndex >= 0) {
          showImage(targetIndex);
        }
      }
    } else {
      updateActivePage(highlightedVerseElement);
    }
    progressBar.style.width = (audioElement.currentTime / audioElement.duration) * 100 + '%';
  } else {
    console.warn("Cannot seek: Calculated time is not finite.", newTime);
  }
}

// DOMContentLoadedイベントで初期化
document.addEventListener('DOMContentLoaded', initialize);
