/**
 * Shared source rows + helpers for legacy script.js demo listings (seed / storage upload).
 */
export const SEED_NOTE_PREFIX = "LEGACY_SAMPLE_IMPORT:v1:";

/** Source: root script.js sampleCars — mapped by hand */
export const LEGACY_SAMPLE_ROWS = [
  {
    key: "hyundai-elantra-spac-2015",
    car_make: "Hyundai",
    car_model: "Elantra SPAC",
    year: "2015",
    price: 93000,
    mileage: 85000,
    mileageNote:
      "(legacy mileage text: ₵3K Commission — km not supplied)",
    location: "Botwe",
    status: "completed",
    hot: true,
    images: [
      "Car Photos/Hyundai Elantra SPAC 2015/1.jpg",
      "Car Photos/Hyundai Elantra SPAC 2015/2.jpg",
      "Car Photos/Hyundai Elantra SPAC 2015/3.jpg",
      "Car Photos/Hyundai Elantra SPAC 2015/4.jpg",
    ],
  },
  {
    key: "acura-mdx-a-spec-2022",
    car_make: "Acura",
    car_model: "MDX A-Spec",
    year: "2022",
    price: 1200000,
    mileage: 45760,
    mileageNote: null,
    location: "Ashongman Estate",
    status: "completed",
    images: [
      "Car Photos/Acura MDX/1.jpg",
      "Car Photos/Acura MDX/2.jpg",
      "Car Photos/Acura MDX/3.jpg",
      "Car Photos/Acura MDX/4.jpg",
    ],
  },
  {
    key: "hyundai-tucson-2013",
    car_make: "Hyundai",
    car_model: "Tucson",
    year: "2013 — 2024 registered",
    price: 160000,
    mileage: 60000,
    mileageNote: null,
    location: "Accra",
    status: "completed",
    hot: true,
    images: [
      "Car Photos/Hyundai Tucson/1.jpg",
      "Car Photos/Hyundai Tucson/2.jpg",
      "Car Photos/Hyundai Tucson/3.jpg",
      "Car Photos/Hyundai Tucson/4.jpg",
    ],
  },
  {
    key: "toyota-corolla-s-2015",
    car_make: "Toyota",
    car_model: "Corolla S",
    year: "2015",
    price: 140000,
    mileage: 95000,
    mileageNote:
      "(legacy mileage text: Fully Loaded Option — approximate km placeholder)",
    location: "Dansoman",
    status: "completed",
    hot: true,
    images: [
      "Car Photos/Toyota Corolla S 2015/1.jpg",
      "Car Photos/Toyota Corolla S 2015/2.jpg",
      "Car Photos/Toyota Corolla S 2015/3.jpg",
      "Car Photos/Toyota Corolla S 2015/4.jpg",
    ],
  },
  {
    key: "mercedes-c250-spac-2015",
    car_make: "Mercedes-Benz",
    car_model: "C250 SPAC",
    year: "2015",
    price: 135000,
    mileage: 88000,
    mileageNote:
      "(legacy mileage text: ₵5K Commission — km not supplied; placeholder)",
    location: "Dansoman",
    status: "completed",
    images: [
      "Car Photos/Benz C250 SPAC/1.jpg",
      "Car Photos/Benz C250 SPAC/2.jpg",
      "Car Photos/Benz C250 SPAC/3.jpg",
      "Car Photos/Benz C250 SPAC/4.jpg",
    ],
  },
  {
    key: "toyota-corolla-le-2018",
    car_make: "Toyota",
    car_model: "Corolla LE",
    year: "2018 (registered 2022)",
    price: 143000,
    mileage: 98690,
    mileageNote: null,
    location: "Accra",
    status: "completed",
    hot: true,
    images: [
      "Car Photos/TC LE 2018/1.jpg",
      "Car Photos/TC LE 2018/2.jpg",
      "Car Photos/TC LE 2018/3.jpg",
      "Car Photos/TC LE 2018/4.jpg",
    ],
  },
  {
    key: "toyota-corolla-le-2016",
    car_make: "Toyota",
    car_model: "Corolla LE",
    year: "2016 (registered 2021)",
    price: 128000,
    mileage: 72000,
    mileageNote:
      "(legacy used registration note as mileage badge — approximate km)",
    location: "Accra",
    status: "completed",
    hot: true,
    images: [
      "Car Photos/TC LE 2016/1.jpg",
      "Car Photos/TC LE 2016/2.jpg",
      "Car Photos/TC LE 2016/3.jpg",
      "Car Photos/TC LE 2016/4.jpg",
    ],
  },
  {
    key: "mercedes-c250-2018",
    car_make: "Mercedes-Benz",
    car_model: "C250",
    year: "2018",
    price: 195000,
    mileage: 93750,
    mileageNote: null,
    location: "Tantra Hills",
    status: "completed",
    hot: true,
    images: [
      "Car Photos/Benz C250/1.jpg",
      "Car Photos/Benz C250/2.jpg",
      "Car Photos/Benz C250/3.jpg",
      "Car Photos/Benz C250/4.jpg",
    ],
  },
  {
    key: "chevy-suburban-2016",
    car_make: "Chevrolet",
    car_model: "Suburban",
    year: "2016",
    price: 1600000,
    mileage: 28000,
    mileageNote: null,
    location: "Accra",
    status: "completed",
    images: [
      "Car Photos/Chevy Suburban/1.jpg",
      "Car Photos/Chevy Suburban/2.jpg",
      "Car Photos/Chevy Suburban/3.jpg",
      "Car Photos/Chevy Suburban/4.jpg",
    ],
  },
  {
    key: "ford-escape-2014",
    car_make: "Ford",
    car_model: "Escape",
    year: "2014",
    price: 162000,
    mileage: 89980,
    mileageNote: null,
    location: "Dome",
    status: "completed",
    hot: true,
    images: [
      "Car Photos/Ford Escape/1.jpg",
      "Car Photos/Ford Escape/2.jpg",
      "Car Photos/Ford Escape/3.jpg",
      "Car Photos/Ford Escape/4.jpg",
    ],
  },
  {
    key: "hyundai-elantra-2014-sold",
    car_make: "Hyundai",
    car_model: "Elantra",
    year: "2014",
    price: 132000,
    mileage: 138000,
    mileageNote: null,
    location: "Dansoman",
    status: "sold",
    images: [
      "Car Photos/Elantra 2014/1.jpg",
      "Car Photos/Elantra 2014/2.jpg",
      "Car Photos/Elantra 2014/3.jpg",
      "Car Photos/Elantra 2014/4.jpg",
    ],
  },
  {
    key: "toyota-corolla-le-2015-sold",
    car_make: "Toyota",
    car_model: "Corolla LE",
    year: "2015",
    price: 150000,
    mileage: 95890,
    mileageNote: null,
    location: "Dansoman",
    status: "sold",
    images: [
      "Car Photos/Toyota Corolla LE/1.jpg",
      "Car Photos/Toyota Corolla LE/2.jpg",
      "Car Photos/Toyota Corolla LE/3.jpg",
      "Car Photos/Toyota Corolla LE/4.jpg",
    ],
  },
  {
    key: "toyota-camry-se-2010",
    car_make: "Toyota",
    car_model: "Camry SE",
    year: "2010",
    price: 320000,
    mileage: 100000,
    mileageNote: "(legacy: 100,000+ km)",
    location: "Accra",
    status: "completed",
    images: [
      "Car Photos/Toyota Camry SE 2010/1.jpg",
      "Car Photos/Toyota Camry SE 2010/photo_12_2025-09-01_22-05-28.jpg",
      "Car Photos/Toyota Camry SE 2010/3.jpg",
      "Car Photos/Toyota Camry SE 2010/4.jpg",
    ],
  },
  {
    key: "hyundai-elantra-2013",
    car_make: "Hyundai",
    car_model: "Elantra",
    year: "2013 (registered 2021)",
    price: 89500,
    mileage: 105000,
    mileageNote:
      "(legacy mileage: Negotiable — placeholder km)",
    location: "Adenta",
    status: "completed",
    images: [
      "Car Photos/HE 2013/1.jpg",
      "Car Photos/HE 2013/2.jpg",
      "Car Photos/HE 2013/3.jpg",
    ],
  },
];

/** Local public paths for same-origin URLs when files live under web/public */
export function publicPhotoUrls(relativePaths) {
  return relativePaths.map((rel) => {
    const trimmed = rel.replace(/^\/+/, "");
    const encoded =
      "/" +
      trimmed
        .split("/")
        .map((seg) => encodeURIComponent(seg))
        .join("/");
    return encoded;
  });
}

export function yearNumeric(year) {
  const n = parseInt(String(year).replace(/\D/g, "").slice(0, 4), 10);
  return Number.isFinite(n) && n >= 1950 && n <= 2100 ? n : null;
}

export function buildLegacySeedRows() {
  const sellerPhone =
    process.env.LEGACY_SEED_SELLER_PHONE ?? "+233505677556";

  return LEGACY_SAMPLE_ROWS.map((r) => {
    const photos = publicPhotoUrls(r.images);
    const yn = yearNumeric(r.year);
    const badges = [];
    if (r.hot) badges.push("Highlighted on legacy homepage (hot)");
    const descParts = [
      `Imported from legacy static homepage sample listing (${r.car_make} ${r.car_model}).`,
      r.mileageNote,
      badges.length ? badges.join(". ") + "." : "",
    ].filter(Boolean);

    return {
      car_make: r.car_make,
      car_model: r.car_model,
      year: r.year,
      year_numeric: yn,
      price: r.price,
      mileage: r.mileage,
      location: r.location,
      package_type: "free",
      car_condition: "Used",
      transmission: "Automatic",
      fuel_type: "Petrol",
      car_description: descParts.join(" "),
      seller_name: process.env.LEGACY_SEED_SELLER_NAME ?? "AutoSell Ghana",
      seller_phone: sellerPhone,
      seller_email: process.env.LEGACY_SEED_SELLER_EMAIL?.trim() || null,
      preferred_contact: "WhatsApp",
      additional_info:
        process.env.SEED_SKIP_PHOTO_PATHS === "1"
          ? null
          : `Original legacy image paths:\n${r.images.join("\n")}`,
      status: r.status,
      photos,
      photo_metadata: null,
      notes: `${SEED_NOTE_PREFIX}${r.key}`,
    };
  });
}

export async function purgeLegacySampleRows(supabase) {
  const { data: ids, error: selErr } = await supabase
    .from("car_submissions")
    .select("id")
    .ilike("notes", `${SEED_NOTE_PREFIX}%`);
  if (selErr) throw selErr;
  if (!ids?.length) return 0;
  const { error: delErr } = await supabase
    .from("car_submissions")
    .delete()
    .in(
      "id",
      ids.map((r) => r.id)
    );
  if (delErr) throw delErr;
  return ids.length;
}
