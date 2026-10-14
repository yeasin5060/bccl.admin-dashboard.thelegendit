// Pseudo-random number generator with deterministic seed for realistic sample data
export function createPRNG(seed = 2026) {
  let s = seed;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export const R = createPRNG(2026);

export const pad2 = (n) => (n < 10 ? '0' : '') + n;

export const formatMoney = (n) =>
  '৳' + new Intl.NumberFormat('en-IN').format(Math.round(n || 0));

export const formatTimeHHMM = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
};

export const TIER = {
  Founder: { adm: 0, m: 3000, g: 6 },
  Life: { adm: 800000, m: 2500, g: 5 },
  Permanent: { adm: 300000, m: 2000, g: 4 },
  Corporate: { adm: 500000, m: 5000, g: 6 },
  Associate: { adm: 100000, m: 1500, g: 2 },
  Diplomatic: { adm: 0, m: 1000, g: 3 },
  Temporary: { adm: 25000, m: 3000, g: 1 },
};

export const INITIAL_MEMBERS_RAW = [
  ['Anika Rahman', 'আনিকা রহমান', 'Permanent', 'BD', 0],
  ['Tahmid Hasan', '', 'Associate', 'BD', 0],
  ['Nusrat Jahan', '', 'Life', 'BD', 1],
  ['Farhan Chowdhury', '', 'Corporate', 'BD', 0],
  ['Sadia Islam', '', 'Founder', 'BD', 0],
  ['Mahfuz Ahmed', '', 'Permanent', 'BD', 2],
  ['Rafiq Uddin', '', 'Life', 'BD', 0],
  ['Tasnim Akter', '', 'Associate', 'BD', 0],
  ['Li Wei', '李伟', 'Corporate', 'CN', 0],
  ['Wang Fang', '王芳', 'Temporary', 'CN', 0],
  ['Zhang Min', '张敏', 'Permanent', 'CN', 3],
  ['Chen Hao', '陈浩', 'Corporate', 'CN', 0],
  ['Liu Yang', '刘洋', 'Temporary', 'CN', 1],
  ['Zhao Lei', '赵磊', 'Associate', 'CN', 0],
  ['Sun Mei', '孙梅', 'Permanent', 'CN', 0],
  ['Zhou Jun', '周俊', 'Temporary', 'CN', 0],
  ['Amb. Sample One', '', 'Diplomatic', 'DIP', 0],
  ['Amb. Sample Two', '', 'Diplomatic', 'DIP', 0],
];

export const INITIAL_MEMBERS = INITIAL_MEMBERS_RAW.map((m, i) => ({
  id: i === 0 ? 'BCC-0482' : 'BCC-' + ('0000' + (100 + i * 37)).slice(-4),
  name: m[0],
  alt: m[1],
  tier: m[2],
  nat: m[3],
  over: m[4],
  spend: Math.round(R() * 40000 + 3000),
  year: 2008 + Math.floor(R() * 16),
}));

export const getMemberStatus = (m) =>
  m.over === 0 ? 'Active' : m.over >= 3 ? 'Suspended' : 'Overdue';

export const getMemberDue = (m) => (TIER[m.tier] ? m.over * TIER[m.tier].m : 0);

export const INITIAL_APPLICATIONS = [
  {
    id: 'A-31',
    name: 'Imran Kabir',
    tier: 'Associate',
    prop: 'Anika Rahman',
    sec: 'Farhan Chowdhury',
    note: 'Software engineer, age 34',
  },
  {
    id: 'A-32',
    name: 'Huang Tao 黄涛',
    tier: 'Corporate',
    prop: 'Li Wei',
    sec: 'Chen Hao',
    note: 'Nominee for a Chinese engineering firm',
  },
  {
    id: 'A-33',
    name: 'Maliha Sultana',
    tier: 'Permanent',
    prop: 'Sadia Islam',
    sec: 'Rafiq Uddin',
    note: 'Physician, Gulshan',
  },
];

export const STAFF_RAW = [
  ['Rahim Khan', 'Front desk', 'Duty manager', 'M', 42000],
  ['Shirin Akter', 'Front desk', 'Receptionist', 'E', 32000],
  ['Liang Yu 梁宇', 'Front desk', 'Chinese-language host', 'M', 46000],
  ['Jamal Hossain', 'Housekeeping', 'Supervisor', 'M', 30000],
  ['Rina Begum', 'Housekeeping', 'Room attendant', 'M', 22000],
  ['Kabir Ali', 'Housekeeping', 'Room attendant', 'E', 22000],
  ['Chef Wu 吴师傅', 'Kitchen', 'Head chef, Chinese', 'E', 95000],
  ['Chef Salam', 'Kitchen', 'Head chef, Bangladeshi', 'E', 80000],
  ['Mitu Das', 'Restaurant', 'Captain', 'E', 34000],
  ['Zaman Sheikh', 'Restaurant', 'Waiter', 'E', 24000],
  ['Nasir Uddin', 'Bar', 'Bartender', 'E', 36000],
  ['Peng Lin 彭琳', 'Café', 'Tea master', 'M', 38000],
  ['Coach Arif', 'Fitness', 'Gym trainer', 'M', 40000],
  ['Coach Mei 美', 'Fitness', 'Table tennis coach', 'E', 42000],
  ['Sabina Yasmin', 'Accounts', 'Accountant', 'M', 58000],
  ['Hanif Mia', 'Security', 'Security lead', 'N', 28000],
];

export const DEPARTMENTS = [
  'Front desk',
  'Housekeeping',
  'Kitchen',
  'Restaurant',
  'Bar',
  'Café',
  'Fitness',
  'Accounts',
  'Security',
];

const attList = [
  'in', 'in', 'in', 'late', 'in', 'out', 'in', 'out',
  'in', 'in', 'out', 'in', 'in', 'out', 'leave', 'in'
];

export const INITIAL_STAFF = STAFF_RAW.map((s, i) => ({
  id: 'E-' + (1001 + i),
  name: s[0],
  dept: s[1],
  role: s[2],
  shift: s[3],
  basic: s[4],
  att: attList[i] || 'in',
  ot: Math.floor(R() * 14),
  adv: i % 5 === 0 ? 3000 : 0,
}));

export const INITIAL_SHIFTS = (() => {
  const g = {};
  DEPARTMENTS.forEach((d) => {
    g[d] = [0, 1, 2, 3, 4, 5, 6].map(() => {
      const opts = ['M', 'E', 'N', 'off'];
      return opts[Math.floor(R() * 4)];
    });
  });
  return g;
})();

export const INITIAL_ROOMS = [
  { no: 101, type: 'Deluxe', rate: 6500, st: 'occ', guest: 'Mr. Zhang, CN delegation', nights: 3 },
  { no: 102, type: 'Deluxe', rate: 6500, st: 'vac', guest: '', nights: 0 },
  { no: 103, type: 'Deluxe', rate: 6500, st: 'occ', guest: 'Ms. Karim', nights: 1 },
  { no: 104, type: 'Deluxe', rate: 6500, st: 'cln', guest: '', nights: 0 },
  { no: 105, type: 'Deluxe', rate: 6500, st: 'res', guest: 'Dr. Lin (arrives today)', nights: 2 },
  { no: 106, type: 'Deluxe', rate: 6500, st: 'vac', guest: '', nights: 0 },
  { no: 201, type: 'Executive', rate: 8500, st: 'occ', guest: 'Mr. Ahmed', nights: 2 },
  { no: 202, type: 'Executive', rate: 8500, st: 'vac', guest: '', nights: 0 },
  { no: 203, type: 'Executive', rate: 8500, st: 'mnt', guest: '', nights: 0 },
  { no: 204, type: 'Executive', rate: 8500, st: 'res', guest: 'Mr. Wang (arrives today)', nights: 4 },
  { no: 301, type: 'Jade suite', rate: 12000, st: 'occ', guest: 'H.E. Delegation', nights: 5 },
  { no: 302, type: 'Jade suite', rate: 12000, st: 'vac', guest: '', nights: 0 },
];

export const OUTLETS = {
  silk: { n: 'Silk Route', z: '丝路餐厅', pre: 'T', cnt: 10 },
  bar: { n: 'Lantern Bar', z: '灯笼酒吧', pre: 'B', cnt: 9 },
  cafe: { n: 'Tea Garden Café', z: '茶园咖啡馆', pre: 'C', cnt: 8 },
};

export const MENU = {
  silk: [
    { k: 'pd', n: 'Peking duck, half', z: '北京烤鸭', p: 3200, c: 'Chinese', alc: false, o: 'silk' },
    { k: 'kp', n: 'Kung Pao chicken', z: '宫保鸡丁', p: 780, c: 'Chinese', alc: false, o: 'silk' },
    { k: 'mt', n: 'Mapo tofu', z: '麻婆豆腐', p: 620, c: 'Chinese', alc: false, o: 'silk' },
    { k: 'ds', n: 'Dim sum basket', z: '点心', p: 540, c: 'Chinese', alc: false, o: 'silk' },
    { k: 'sp', n: 'Sweet and sour prawn', z: '糖醋虾', p: 1150, c: 'Chinese', alc: false, o: 'silk' },
    { k: 'er', n: 'Egg fried rice', z: '蛋炒饭', p: 420, c: 'Chinese', alc: false, o: 'silk' },
    { k: 'kb', n: 'Kacchi biryani', z: 'কাচ্চি', p: 950, c: 'Bangladeshi', alc: false, o: 'silk' },
    { k: 'bb', n: 'Beef bhuna', z: 'ভুনা', p: 880, c: 'Bangladeshi', alc: false, o: 'silk' },
    { k: 'ip', n: 'Ilish paturi', z: 'ইলিশ পাতুরি', p: 1400, c: 'Bangladeshi', alc: false, o: 'silk' },
    { k: 'md', n: 'Mishti doi', z: 'মিষ্টি দই', p: 180, c: 'Bangladeshi', alc: false, o: 'silk' },
  ],
  bar: [
    { k: 'jt', n: 'Jasmine tea mocktail', z: '茉莉茶', p: 450, c: 'Soft', alc: false, o: 'bar' },
    { k: 'lc', n: 'Lychee cooler', z: '荔枝', p: 420, c: 'Soft', alc: false, o: 'bar' },
    { k: 'bs', n: 'Borhani spritz', z: 'বোরহানি', p: 380, c: 'Soft', alc: false, o: 'bar' },
    { k: 'bj', n: 'Baijiu shot', z: '白酒', p: 700, c: 'Licensed', alc: true, o: 'bar' },
    { k: 'cb', n: 'Craft beer', z: '啤酒', p: 600, c: 'Licensed', alc: true, o: 'bar' },
    { k: 'hw', n: 'House wine, glass', z: '红酒', p: 750, c: 'Licensed', alc: true, o: 'bar' },
    { k: 'mp', n: 'Masala peanuts', z: '', p: 260, c: 'Bites', alc: false, o: 'bar' },
    { k: 'sr', n: 'Spring rolls', z: '春卷', p: 480, c: 'Bites', alc: false, o: 'bar' },
  ],
  cafe: [
    { k: 'st', n: 'Sylhet tea, pot', z: 'সিলেট চা', p: 250, c: 'Tea', alc: false, o: 'cafe' },
    { k: 'lj', n: 'Longjing tea, pot', z: '龙井', p: 420, c: 'Tea', alc: false, o: 'cafe' },
    { k: 'cp', n: 'Cappuccino', z: '', p: 320, c: 'Coffee', alc: false, o: 'cafe' },
    { k: 'et', n: 'Egg tart', z: '蛋挞', p: 160, c: 'Bakes', alc: false, o: 'cafe' },
    { k: 'mc', n: 'Mooncake', z: '月饼', p: 350, c: 'Bakes', alc: false, o: 'cafe' },
    { k: 'sg', n: 'Singara', z: 'সিঙ্গারা', p: 90, c: 'Bakes', alc: false, o: 'cafe' },
    { k: 'md2', n: 'Mishti doi', z: 'মিষ্টি দই', p: 180, c: 'Bakes', alc: false, o: 'cafe' },
  ],
};

export const MENU_ITEMS_MAP = {};
Object.keys(MENU).forEach((k) => {
  MENU[k].forEach((item) => {
    MENU_ITEMS_MAP[item.k] = item;
  });
});

export const INITIAL_TABLES = (() => {
  const result = {};
  Object.keys(OUTLETS).forEach((o) => {
    result[o] = [];
    const cfg = OUTLETS[o];
    for (let i = 1; i <= cfg.cnt; i++) {
      result[o].push({
        id: cfg.pre + i,
        seats: o === 'bar' && i <= 6 ? 1 : i % 3 === 0 ? 6 : 4,
        st: 'free',
        lines: [],
        member: '',
        permit: false,
      });
    }
  });

  // Sample active tables
  const tSilk2 = result.silk.find((t) => t.id === 'T2');
  if (tSilk2) {
    tSilk2.st = 'open';
    tSilk2.lines = [
      { k: 'ds', q: 2, s: 'served' },
      { k: 'kp', q: 1, s: 'served' },
    ];
  }
  const tSilk5 = result.silk.find((t) => t.id === 'T5');
  if (tSilk5) {
    tSilk5.st = 'open';
    tSilk5.lines = [
      { k: 'pd', q: 1, s: 'ready' },
      { k: 'er', q: 2, s: 'cook' },
    ];
  }
  const tSilk7 = result.silk.find((t) => t.id === 'T7');
  if (tSilk7) {
    tSilk7.st = 'bill';
    tSilk7.lines = [
      { k: 'bb', q: 2, s: 'served' },
      { k: 'kb', q: 2, s: 'served' },
      { k: 'md', q: 4, s: 'served' },
    ];
  }
  const tBar2 = result.bar.find((t) => t.id === 'B2');
  if (tBar2) {
    tBar2.st = 'open';
    tBar2.lines = [{ k: 'jt', q: 2, s: 'served' }];
  }
  const tCafe3 = result.cafe.find((t) => t.id === 'C3');
  if (tCafe3) {
    tCafe3.st = 'open';
    tCafe3.lines = [
      { k: 'lj', q: 1, s: 'cook' },
      { k: 'et', q: 2, s: 'cook' },
    ];
  }

  return result;
})();

export const OUTLET_NAMES = [
  'Silk Route',
  'Lantern Bar',
  'Tea Garden',
  'Guest house',
  'Membership dues',
  'Fitness',
  'Events',
];

export const PAYMENT_METHODS = [
  'bKash',
  'Nagad',
  'Alipay',
  'WeChat Pay',
  'Card',
  'Member account',
  'Cash',
];

export const PAYMENT_FEES = {
  bKash: 0.015,
  Nagad: 0.014,
  Alipay: 0.028,
  'WeChat Pay': 0.028,
  Card: 0.022,
  'Member account': 0,
  Cash: 0,
};

export const INITIAL_TRANSACTIONS = (() => {
  const rr = createPRNG(99);
  const now = new Date();
  const ranges = {
    'Silk Route': [900, 6500],
    'Lantern Bar': [600, 3800],
    'Tea Garden': [250, 1600],
    'Guest house': [6500, 28000],
    'Membership dues': [1500, 5000],
    Fitness: [500, 2500],
    Events: [1500, 9000],
  };

  const list = [];
  for (let i = 0; i < 30; i++) {
    const outlet = OUTLET_NAMES[Math.floor(rr() * 7)];
    const r = ranges[outlet];
    let d = new Date(now);
    d.setHours(7 + Math.floor(i * 0.5), Math.floor(rr() * 60), 0, 0);
    if (d > now) d = new Date(now.getTime() - i * 60000 * 3);
    const st = rr() < 0.07 ? 'Failed' : rr() < 0.06 ? 'Pending' : 'Success';
    const amount = Math.round((r[0] + rr() * (r[1] - r[0])) / 10) * 10;
    const method = PAYMENT_METHODS[Math.floor(rr() * rr() * 7)];
    list.push({
      id: 'TX-' + (48210 + i),
      t: d,
      outlet,
      method,
      amount,
      st,
    });
  }
  list.sort((a, b) => b.t - a.t);
  return list;
})();

export const EVENT_PREPARATION_FLOW = [
  'Hire AV and sound',
  'Confirm Bangla–Mandarin interpreter',
  'Menu tasting with both kitchens',
  'Send trilingual invitations',
  'Open RSVP and seating plan',
  'Brief staff and cover shifts',
];

export const EVENT_TEMPLATES = [
  {
    id: 'cny',
    ic: '🏮',
    n: 'Chinese New Year Gala',
    z: '春节联欢',
    b: 'চীনা নববর্ষ উৎসব',
    cat: 'Cultural',
    venue: 'Grand banquet hall',
    cap: 300,
    price: 3500,
    budget: 450000,
    x: ['Lion dance team booked', 'Red envelope table', 'Fireworks permission (terrace)'],
  },
  {
    id: 'mid',
    ic: '🥮',
    n: 'Mid-Autumn Moon Night',
    z: '中秋赏月夜',
    b: 'মধ্য-শরৎ চাঁদনি রাত',
    cat: 'Cultural',
    venue: 'Terrace and Lantern Bar',
    cap: 120,
    price: 2200,
    budget: 180000,
    x: ['Mooncake order', 'Lantern riddles printed', 'Moon-viewing seating'],
  },
  {
    id: 'pb',
    ic: '🌅',
    n: 'Pohela Boishakh Morning',
    z: '孟加拉新年晨会',
    b: 'পহেলা বৈশাখ সকাল',
    cat: 'Cultural',
    venue: 'Tea Garden and lawn',
    cap: 200,
    price: 1500,
    budget: 220000,
    x: ['Panta-ilish breakfast set', 'Alpona artists', 'Red-and-white dress code note'],
  },
  {
    id: 'vd',
    ic: '🇧🇩',
    n: 'Victory Day Dinner',
    z: '胜利日晚宴',
    b: 'বিজয় দিবসের নৈশভোজ',
    cat: 'Dining',
    venue: 'Grand banquet hall',
    cap: 300,
    price: 3000,
    budget: 380000,
    x: ['Cultural programme lineup', 'Flag and stage décor', 'Guest-of-honour protocol'],
  },
  {
    id: 'tt',
    ic: '🏓',
    n: 'Friendship Table Tennis Cup',
    z: '友谊乒乓杯',
    b: 'মৈত্রী টেবিল টেনিস কাপ',
    cat: 'Sports',
    venue: 'Table tennis room',
    cap: 64,
    price: 500,
    budget: 90000,
    x: ['Draw sheet and umpires', 'Trophies and medals', 'Warm-up tables'],
  },
  {
    id: 'dm',
    ic: '🥟',
    n: 'Dim Sum and Pitha Masterclass',
    z: '点心与皮塔课',
    b: 'ডিম সাম ও পিঠা ক্লাস',
    cat: 'Dining',
    venue: 'Silk Route kitchen',
    cap: 24,
    price: 2800,
    budget: 60000,
    x: ['Ingredients per station', 'Aprons', 'Recipe cards in two languages'],
  },
  {
    id: 'ts',
    ic: '🍵',
    n: 'Tea Tasting: Sylhet meets Fujian',
    z: '锡尔赫特遇见福建',
    b: 'চা-চক্র',
    cat: 'Dining',
    venue: 'Tea Garden Café',
    cap: 30,
    price: 1200,
    budget: 35000,
    x: ['Six teas sourced', 'Tasting notes cards', 'Water temperature kettles'],
  },
  {
    id: 'dr',
    ic: '🕊️',
    n: 'Diplomatic Reception',
    z: '外交招待会',
    b: 'কূটনৈতিক সংবর্ধনা',
    cat: 'Diplomatic',
    venue: 'Banquet hall and conference room',
    cap: 150,
    price: 0,
    budget: 320000,
    x: ['Guest list from embassies', 'Protocol seating', 'Interpretation booth tested'],
  },
];

export const INITIAL_EVENTS = [
  {
    id: 1,
    n: 'Inter-club table tennis tournament',
    cat: 'Sports',
    d: '2026-10-16',
    t: '15:00',
    venue: 'Table tennis room',
    cap: 64,
    reg: 42,
    price: 500,
    done: 3,
    x: ['Draw sheet and umpires', 'Trophies and medals', 'Warm-up tables'],
  },
  {
    id: 2,
    n: 'Dim sum and pitha masterclass',
    cat: 'Dining',
    d: '2026-10-23',
    t: '16:00',
    venue: 'Silk Route kitchen',
    cap: 24,
    reg: 18,
    price: 2800,
    done: 4,
    x: EVENT_TEMPLATES[5].x,
  },
  {
    id: 3,
    n: 'Tea tasting: Sylhet meets Fujian',
    cat: 'Dining',
    d: '2026-10-31',
    t: '17:00',
    venue: 'Tea Garden Café',
    cap: 30,
    reg: 26,
    price: 1200,
    done: 5,
    x: EVENT_TEMPLATES[6].x,
  },
  {
    id: 4,
    n: 'Victory Day dinner',
    cat: 'Dining',
    d: '2026-12-16',
    t: '19:30',
    venue: 'Grand banquet hall',
    cap: 300,
    reg: 130,
    price: 3000,
    done: 2,
    x: EVENT_TEMPLATES[3].x,
  },
].map((e) => ({
  ...e,
  chk: EVENT_PREPARATION_FLOW.concat(e.x).map((task, i) => ({
    s: task,
    d: i < e.done,
  })),
}));

export const INITIAL_FACILITIES = [
  ['Gym', '健身房', 30, 12],
  ['Swimming pool', '游泳池', 20, 7],
  ['Squash courts', '壁球', 4, 2],
  ['Table tennis', '乒乓球', 8, 5],
  ['Yoga studio', '瑜伽室', 16, 0],
];

export const INITIAL_CLASSES = [
  ['06:30', 'Tai chi on the lawn', '太极', 20, 14],
  ['07:30', 'Morning yoga', '', 16, 11],
  ['16:00', 'Kids squash coaching', '', 10, 8],
  ['17:00', 'Table tennis coaching', '乒乓球训练', 12, 9],
  ['18:00', 'Aqua fitness', '', 15, 6],
];

export const SLOT_TIMES = ['15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
export const SLOT_FACILITIES = [
  'Squash court 1',
  'Squash court 2',
  'Table tennis A',
  'Table tennis B',
];

export const INITIAL_SLOTS = (() => {
  const result = {};
  SLOT_FACILITIES.forEach((f) => {
    SLOT_TIMES.forEach((t) => {
      result[f + t] = R() < 0.35;
    });
  });
  return result;
})();

export const ROLE_VIEWS = {
  admin: ['dash', 'members', 'staff', 'stay', 'pos', 'fit', 'pay', 'rep', 'events'],
  front: ['dash', 'members', 'stay', 'fit', 'events'],
  cashier: ['dash', 'pos', 'pay'],
  hr: ['dash', 'staff', 'rep'],
};

export const ROLE_NAMES = {
  admin: 'General manager',
  front: 'Front desk',
  cashier: 'Outlet cashier',
  hr: 'HR and accounts',
};

export const TRANSLATIONS = {
  en: {
    dash: 'Dashboard',
    members: 'Members',
    staff: 'Employees',
    stay: 'Accommodation',
    pos: 'Dining and Bar',
    fit: 'Fitness and Sports',
    pay: 'Payments',
    rep: 'Reports',
    events: 'Events and Templates',
  },
  bn: {
    dash: 'ড্যাশবোর্ড',
    members: 'সদস্য',
    staff: 'কর্মী',
    stay: 'থাকার ব্যবস্থা',
    pos: 'রেস্তোরাঁ ও বার',
    fit: 'ফিটনেস ও খেলা',
    pay: 'পেমেন্ট',
    rep: 'প্রতিবেদন',
    events: 'অনুষ্ঠান ও টেমপ্লেট',
  },
  zh: {
    dash: '总览',
    members: '会员',
    staff: '员工',
    stay: '住宿',
    pos: '餐饮与酒吧',
    fit: '健身与运动',
    pay: '支付',
    rep: '报表',
    events: '活动与模板',
  },
};

export const SEVEN_DAY_TREND = [412000, 466000, 438000, 521000, 498000, 587000];
