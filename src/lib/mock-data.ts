export type Category = {
  slug: string;
  label: string;
  emoji: string;
};

export type VariantOption = { label: string; value: string };
export type VariantGroup = { name: string; options: VariantOption[] };

export type Product = {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string; // slug
  description: string;
  image?: string;
  images?: string[];
  specs?: Record<string, string>;
  variantGroups?: VariantGroup[];
  tags?: string[];
  hasVariants?: boolean;
  name_i18n?: Record<string, string>;
  description_i18n?: Record<string, string>;
};

function pic(seed: string) {
  return `https://picsum.photos/seed/${seed}/800/600`;
}

export const CATEGORIES: Category[] = [
  { slug: "navigation",    label: "Навигация",              emoji: "🧭" },
  { slug: "anchoring",     label: "Якорное снаряжение",     emoji: "⚓" },
  { slug: "deck-hardware", label: "Палубное оборудование",  emoji: "🔩" },
  { slug: "mooring",       label: "Швартовка",              emoji: "🪢" },
  { slug: "engines",       label: "Двигатели",              emoji: "⚙️" },
  { slug: "electrical",    label: "Электрика",              emoji: "⚡" },
  { slug: "safety",        label: "Безопасность",           emoji: "🦺" },
  { slug: "rigging",       label: "Такелаж",                emoji: "🎿" },
];

export const BRANDS = [
  "Garmin", "Raymarine", "Maxwell", "Lewmar",
  "Vetus", "Plastimo", "Navico", "Furuno",
];

export const PRODUCTS: Product[] = [
  // Navigation
  { id: "p01", image: "https://fishermans-marine.com/cdn/shop/files/819JV34rFFL._AC_SX679_600x.jpg?v=1717794568", images: ["https://fishermans-marine.com/cdn/shop/files/819JV34rFFL._AC_SX679_600x.jpg?v=1717794568"], name: "Garmin ECHOMAP UHD2 94sv", sku: "GRM-ECHOMAP-94SV", brand: "Garmin", category: "navigation", description: "Картплоттер 9\", Ultra HD, встроенный трансдьюсер 50/200 кГц, карты Navionics+. Яркий дисплей, виден при солнечном свете. Сенсорное и кнопочное управление.", specs: { "Размер экрана": "9\"", "Разрешение": "800 × 480", "Частота обновления": "50/200 кГц", "Карты": "Navionics+", "NMEA 2000": "Да", "Водозащита": "IPX7" }, hasVariants: false },
  { id: "p02", image: "https://nvnmarine.com/cdn/shop/files/97570-garmin-gpsmap-943xsv-combo-gps-fishfinder-preloaded-0.jpg?v=1734801594&width=1400", images: ["https://nvnmarine.com/cdn/shop/files/97570-garmin-gpsmap-943xsv-combo-gps-fishfinder-preloaded-0.jpg?v=1734801594&width=1400"], name: "Garmin GPSMAP 943xsv", sku: "GRM-GPSMAP-943XSV", brand: "Garmin", category: "navigation", description: "Многофункциональный дисплей 9\", GPS/Sonar, совместим с Panoptix." },
  { id: "p03", image: "https://d73v3rdaoqh96.cloudfront.net/image/308061165312/image_s32pn4e87l75jfpv5mfgsfl33m/-FWEBP-Sx360", images: ["https://d73v3rdaoqh96.cloudfront.net/image/308061165312/image_s32pn4e87l75jfpv5mfgsfl33m/-FWEBP-Sx360"], name: "Raymarine Axiom+ 12", sku: "RMR-AXIOM-PLUS-12", brand: "Raymarine", category: "navigation", description: "Картплоттер 12\", встроенный RealVision 3D, LightHouse Charts." },
  { id: "p04", image: "https://nvnmarine.com/cdn/shop/products/raymarine-axiom-pro-9-1_98b15fbe-7648-4271-8964-54e5c4fb5fad.jpg?v=1673147504&width=1400", images: ["https://nvnmarine.com/cdn/shop/products/raymarine-axiom-pro-9-1_98b15fbe-7648-4271-8964-54e5c4fb5fad.jpg?v=1673147504&width=1400"], name: "Raymarine Axiom2 Pro 9 RVX", sku: "RMR-AXIOM2PRO-9RVX", brand: "Raymarine", category: "navigation", description: "Профессиональный MFD 9\", RealVision 3D, совместим с Evolution." },
  { id: "p05", image: "https://nvnmarine.com/cdn/shop/products/simrad-go12-xse-chartplotter-1_297f6776-ad14-4f2a-afa7-2bcb91f55600.jpg?v=1673168445&width=1400", images: ["https://nvnmarine.com/cdn/shop/products/simrad-go12-xse-chartplotter-1_297f6776-ad14-4f2a-afa7-2bcb91f55600.jpg?v=1673168445&width=1400"], name: "Navico GO12 XSE", sku: "NVC-GO12-XSE", brand: "Navico", category: "navigation", description: "Картплоттер 12\" с эхолотом StructureScan 3D, карты C-MAP." },
  { id: "p06", image: "https://www.furuno.com/img/products/chartplotter/gp-1971f/GP-1971F.jpg", images: ["https://www.furuno.com/img/products/chartplotter/gp-1971f/GP-1971F.jpg"], name: "Furuno GP-1971F", sku: "FRN-GP1971F", brand: "Furuno", category: "navigation", description: "GPS/картплоттер 9\", TFT LCD, 30 Вт сонар, NMEA 2000." },
  // Anchoring
  { id: "p07", image: "https://webshop.vetus.com/storage/P10256410000_7.webp", images: ["https://webshop.vetus.com/storage/P10256410000_7.webp"], name: "Maxwell RC8 Windlass", sku: "MXW-RC8-12V", brand: "Maxwell", category: "anchoring", description: "Электрический шпиль 12В, 800 Вт, подходит для якорных цепей 8 мм. Самовыбирающий, горизонтальный монтаж, нержавеющий корпус.", specs: { "Напряжение": "12В / 24В", "Мощность": "800 Вт", "Тяга": "600 кг", "Цепь": "8 мм", "Трос": "до 14 мм", "Монтаж": "горизонтальный" }, variantGroups: [{ name: "Напряжение", options: [{ label: "12В", value: "12v" }, { label: "24В", value: "24v" }] }, { name: "Комплектация", options: [{ label: "Только шпиль", value: "bare" }, { label: "Со шкивом для троса", value: "with-rope" }] }], hasVariants: true },
  { id: "p08", image: "https://webshop.vetus.com/storage/P10257610000_8.webp", images: ["https://webshop.vetus.com/storage/P10257610000_8.webp"], name: "Maxwell RC10 Windlass", sku: "MXW-RC10-12V", brand: "Maxwell", category: "anchoring", description: "Электрический шпиль 12В, 1000 Вт, цепь/трос 10 мм.", hasVariants: true },
  { id: "p09", image: "https://www.lofrans.com/images/items/itm_TIGRES.jpg", images: ["https://www.lofrans.com/images/items/itm_TIGRES.jpg"], name: "Vetus LOFRANS Tigres", sku: "VTS-LFR-TIGRES-12", brand: "Vetus", category: "anchoring", description: "Вертикальный шпиль 12В, тяга 700 кг, цепь 8–10 мм." },
  { id: "p10", image: "https://www.go2marine.com/cdn/shop/files/238300-Lofrans-Project-1000-Low-Profile-Vertical-Windlass-1000-watt-12v_0.jpg?v=1771347124&width=500", images: ["https://www.go2marine.com/cdn/shop/files/238300-Lofrans-Project-1000-Low-Profile-Vertical-Windlass-1000-watt-12v_0.jpg?v=1771347124&width=500"], name: "Vetus LOFRANS Project 1000", sku: "VTS-LFR-PROJ1000", brand: "Vetus", category: "anchoring", description: "Горизонтальный якорный шпиль, 12/24В, 1000 Вт." },
  { id: "p11", name: "Plastimo Spade Anchor S6", sku: "PLT-SPA-S6-15KG", brand: "Plastimo", category: "anchoring", description: "Якорь Spade 15 кг, нержавеющая сталь, для судов 10–13 м. Исключительное держание на любом дне: песок, ил, водоросли, скала.", specs: { "Вес": "15 кг", "Материал": "нержавеющая сталь 316L", "Суда до": "13 м", "Дно": "любое", "Сертификат": "ISO 11592" }, variantGroups: [{ name: "Вес", options: [{ label: "12 кг", value: "12kg" }, { label: "15 кг", value: "15kg" }, { label: "20 кг", value: "20kg" }] }], hasVariants: true },
  { id: "p12", name: "Plastimo Fortress FX-23", sku: "PLT-FTR-FX23", brand: "Plastimo", category: "anchoring", description: "Складной якорь 6.8 кг, алюминиевый сплав, отличное держание." },
  // Deck Hardware
  { id: "p13", image: "https://www.lewmar.com/media/catalog/product/cache/6964484727c91d8a7ee1545fdc866f01/n/e/new-ocean-self-tailing-winch-1500x1500.jpg", images: ["https://www.lewmar.com/media/catalog/product/cache/6964484727c91d8a7ee1545fdc866f01/n/e/new-ocean-self-tailing-winch-1500x1500.jpg"], name: "Lewmar Ocean 46 Winch", sku: "LWM-OCN46-2SPD", brand: "Lewmar", category: "deck-hardware", description: "Двухскоростная лебёдка, 3 тяговых усилия, анодированный алюминий. Класс мощности 46, для яхт 11–14 м.", specs: { "Класс": "46", "Скорости": "2", "Тяга": "680 кг", "Материал": "анодированный алюминий", "Яхты": "11–14 м" }, variantGroups: [{ name: "Исполнение", options: [{ label: "Хромированное", value: "chrome" }, { label: "Матовое", value: "matte" }] }, { name: "Ручка", options: [{ label: "Без ручки", value: "no-handle" }, { label: "С ручкой 250 мм", value: "handle-250" }] }], hasVariants: true },
  { id: "p14", image: "https://www.lewmar.com/media/catalog/product/cache/6964484727c91d8a7ee1545fdc866f01/n/e/new-evo-self-tailing-winch-gry-1500x1500_8.jpg", images: ["https://www.lewmar.com/media/catalog/product/cache/6964484727c91d8a7ee1545fdc866f01/n/e/new-evo-self-tailing-winch-gry-1500x1500_8.jpg"], name: "Lewmar EVO 60ST Winch", sku: "LWM-EVO60ST", brand: "Lewmar", category: "deck-hardware", description: "Самотравящая лебёдка EVO, 3 скорости, нержавеющий корпус." },
  { id: "p15", image: "https://www.lewmar.com/media/catalog/product/cache/4b0f3e1802af3ad040658295c63fd385/n/e/new-evo-hydraulic-self-tailing-winch-gry-1500x1500_3.jpg", images: ["https://www.lewmar.com/media/catalog/product/cache/4b0f3e1802af3ad040658295c63fd385/n/e/new-evo-hydraulic-self-tailing-winch-gry-1500x1500_3.jpg"], name: "Vetus Lewmar 65 Self-Tailing", sku: "VTS-LWM-65ST", brand: "Vetus", category: "deck-hardware", description: "Самотравящая лебёдка 65, 3 передачи, матовый алюминий." },
  { id: "p16", name: "Plastimo Compass Classic 135B", sku: "PLT-CMP-135B", brand: "Plastimo", category: "deck-hardware", description: "Компас для рулевого 135 мм, внутренняя подсветка." },
  { id: "p17", name: "Plastimo Iris 50 Compass", sku: "PLT-CMP-IRIS50", brand: "Plastimo", category: "deck-hardware", description: "Подвесной компас Iris 50 мм, аварийный, с азимутальным кольцом." },
  // Mooring
  { id: "p18", name: "Vetus Mooring Line 20m", sku: "VTS-MRL-20M-12MM", brand: "Vetus", category: "mooring", description: "Швартовный конец 20 м, ø 12 мм, двойное плетение, синий.", hasVariants: true },
  { id: "p19", name: "Vetus Mooring Line 10m", sku: "VTS-MRL-10M-12MM", brand: "Vetus", category: "mooring", description: "Швартовный конец 10 м, ø 12 мм, двойное плетение, синий.", hasVariants: true },
  { id: "p20", name: "Plastimo Fender F6", sku: "PLT-FND-F6-WHT", brand: "Plastimo", category: "mooring", description: "Кранец цилиндрический F6, белый, ПВХ, для яхт до 9 м.", hasVariants: true },
  { id: "p21", name: "Plastimo Fender F8", sku: "PLT-FND-F8-WHT", brand: "Plastimo", category: "mooring", description: "Кранец цилиндрический F8, белый, ПВХ, для яхт 9–12 м.", hasVariants: true },
  { id: "p22", name: "Vetus Fender Holder", sku: "VTS-FND-HLDR-SS", brand: "Vetus", category: "mooring", description: "Держатель кранца из нержавеющей стали, регулируемый угол." },
  // Engines
  { id: "p23", image: "https://ab-marineservice.com/wp-content/uploads/2022/05/vetus_m415_1.jpg", images: ["https://ab-marineservice.com/wp-content/uploads/2022/05/vetus_m415_1.jpg"], name: "Vetus M4.15 Diesel", sku: "VTS-M4-15-D", brand: "Vetus", category: "engines", description: "Дизельный двигатель 14 л.с., 3-цилиндровый, охлаждение водой." },
  { id: "p24", image: "https://webshop.vetus.com/storage/M435A___A40000.webp", images: ["https://webshop.vetus.com/storage/M435A___A40000.webp"], name: "Vetus M4.35 Diesel", sku: "VTS-M4-35-D", brand: "Vetus", category: "engines", description: "Дизельный двигатель 35 л.с., 4-цилиндровый, турбонаддув." },
  // Electrical
  { id: "p25", image: "https://nvnmarine.com/cdn/shop/files/59633-garmin-gmi-20-marine-instrument-display-0.jpg?v=1734803742&width=1400", images: ["https://nvnmarine.com/cdn/shop/files/59633-garmin-gmi-20-marine-instrument-display-0.jpg?v=1734803742&width=1400"], name: "Garmin GMI 20 Instrument", sku: "GRM-GMI20", brand: "Garmin", category: "electrical", description: "Морской дисплей NMEA 2000, 3.5\" цветной, водонепроницаемый." },
  { id: "p26", image: "https://nvnmarine.com/cdn/shop/products/raymarine-i70s-multifunction-instrument-1.jpg?v=1673146501&width=1400", images: ["https://nvnmarine.com/cdn/shop/products/raymarine-i70s-multifunction-instrument-1.jpg?v=1673146501&width=1400"], name: "Raymarine i70s Instrument", sku: "RMR-I70S", brand: "Raymarine", category: "electrical", description: "Мультифункциональный дисплей SeaTalk ng, 3.5\", дневной." },
  { id: "p27", image: "https://theyachtrigger.com/cdn/shop/files/62238XL.jpg?v=1714752060&width=1000", images: ["https://theyachtrigger.com/cdn/shop/files/62238XL.jpg?v=1714752060&width=1000"], name: "Navico Triton² Display", sku: "NVC-TRITON2-WIND", brand: "Navico", category: "electrical", description: "Инструментный дисплей ветра/скорости, NMEA 2000, 4.1\"." },
  // Safety
  { id: "p28", name: "Plastimo Life Jacket 150N Pro", sku: "PLT-LJ150-PRO-XL", brand: "Plastimo", category: "safety", description: "Спасательный жилет 150N, автоматический, ISO 12402-3. Подходит для прибрежного плавания и гонок.", specs: { "Плавучесть": "150N", "Стандарт": "ISO 12402-3", "Активация": "авто + ручная", "Вес пользователя": "40+ кг" }, variantGroups: [{ name: "Размер", options: [{ label: "S/M (40–70 кг)", value: "sm" }, { label: "L/XL (70–120 кг)", value: "lxl" }, { label: "XXL (120+ кг)", value: "xxl" }] }, { name: "Цвет", options: [{ label: "Оранжевый", value: "orange" }, { label: "Тёмно-синий", value: "navy" }] }], hasVariants: true },
  { id: "p29", name: "Plastimo Life Jacket 275N Auto", sku: "PLT-LJ275-AUTO-XL", brand: "Plastimo", category: "safety", description: "Спасательный жилет 275N, с подъёмным воротником, ISO 12402-2. Для оффшорных переходов.", specs: { "Плавучесть": "275N", "Стандарт": "ISO 12402-2", "Активация": "авто + ручная", "Воротник": "надувной" }, variantGroups: [{ name: "Размер", options: [{ label: "S/M (40–70 кг)", value: "sm" }, { label: "L/XL (70–120 кг)", value: "lxl" }] }], hasVariants: true },
  // Rigging
  { id: "p30", image: "https://www.lewmar.com/media/catalog/product/cache/6964484727c91d8a7ee1545fdc866f01/n/e/new-control-block-single-swivel-head.jpg", images: ["https://www.lewmar.com/media/catalog/product/cache/6964484727c91d8a7ee1545fdc866f01/n/e/new-control-block-single-swivel-head.jpg"], name: "Lewmar Ball-Bearing Block 40mm", sku: "LWM-BLK-BB40", brand: "Lewmar", category: "rigging", description: "Одношкивный блок 40 мм, шарикоподшипники, нагрузка до 1400 кг." },
  { id: "p31", image: "https://www.lewmar.com/media/catalog/product/cache/6964484727c91d8a7ee1545fdc866f01/n/e/new-high-load-racing-web-block-1500x1500.jpg", images: ["https://www.lewmar.com/media/catalog/product/cache/6964484727c91d8a7ee1545fdc866f01/n/e/new-high-load-racing-web-block-1500x1500.jpg"], name: "Lewmar High Load Block 57mm", sku: "LWM-BLK-HL57", brand: "Lewmar", category: "rigging", description: "Блок высокой нагрузки 57 мм, нержавеющая сталь, 3500 кг." },
  { id: "p32", name: "Vetus 8-Strand Mooring Line", sku: "VTS-RIG-8STR-12MM", brand: "Vetus", category: "rigging", description: "Плетёный трос 8 прядей, ø 12 мм, нейлон, белый, 100 м." },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function filterProducts(params: {
  category?: string;
  brand?: string;
  q?: string;
}): Product[] {
  return PRODUCTS.filter((p) => {
    if (params.category && p.category !== params.category) return false;
    if (params.brand && p.brand.toLowerCase() !== params.brand.toLowerCase()) return false;
    if (params.q) {
      const q = params.q.toLowerCase();
      if (
        !p.name.toLowerCase().includes(q) &&
        !p.sku.toLowerCase().includes(q) &&
        !p.brand.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}
