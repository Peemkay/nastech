/* Seed data for local development — realistic Nigerian refurbished-device catalog. */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const naira = (n: number) => n * 100; // kobo

const CONDITION_QUESTIONS = [
  {
    question: "What is the screen condition?",
    options: [
      { label: "No scratches, like new", deductionBps: 0 },
      { label: "Minor scratches, not visible when on", deductionBps: 500 },
      { label: "Visible scratches or a hairline crack", deductionBps: 2500 },
    ],
  },
  {
    question: "Does it power on and function normally?",
    options: [
      { label: "Yes, fully functional", deductionBps: 0 },
      { label: "Minor issues (e.g. weak speaker, slow charging)", deductionBps: 1500 },
      { label: "Major issues or does not power on", deductionBps: 6000 },
    ],
  },
  {
    question: "What is the body/frame condition?",
    options: [
      { label: "Like new, no dents or scratches", deductionBps: 0 },
      { label: "Minor wear, small marks", deductionBps: 500 },
      { label: "Visible dents or scratches", deductionBps: 1500 },
    ],
  },
  {
    question: "What is the battery health?",
    options: [
      { label: "Excellent (90%+)", deductionBps: 0 },
      { label: "Good (80-90%)", deductionBps: 500 },
      { label: "Poor (below 80%) or swollen", deductionBps: 1500 },
    ],
  },
];

const CATEGORIES = [
  {
    slug: "smartphones",
    name: "Smartphones",
    icon: "smartphone",
    brands: [
      {
        name: "Apple",
        slug: "apple",
        models: [
          { name: "iPhone 15 Pro", slug: "iphone-15-pro", baseValueKobo: naira(820000), storageOptions: ["128GB", "256GB", "512GB"], releaseYear: 2023 },
          { name: "iPhone 14", slug: "iphone-14", baseValueKobo: naira(580000), storageOptions: ["128GB", "256GB"], releaseYear: 2022 },
          { name: "iPhone 13 Pro", slug: "iphone-13-pro", baseValueKobo: naira(490000), storageOptions: ["128GB", "256GB"], releaseYear: 2021 },
          { name: "iPhone 13", slug: "iphone-13", baseValueKobo: naira(410000), storageOptions: ["128GB", "256GB"], releaseYear: 2021 },
          { name: "iPhone 11", slug: "iphone-11", baseValueKobo: naira(250000), storageOptions: ["64GB", "128GB"], releaseYear: 2019 },
        ],
      },
      {
        name: "Samsung",
        slug: "samsung",
        models: [
          { name: "Galaxy S23 Ultra", slug: "galaxy-s23-ultra", baseValueKobo: naira(650000), storageOptions: ["256GB", "512GB"], releaseYear: 2023 },
          { name: "Galaxy S22", slug: "galaxy-s22", baseValueKobo: naira(380000), storageOptions: ["128GB", "256GB"], releaseYear: 2022 },
          { name: "Galaxy A54", slug: "galaxy-a54", baseValueKobo: naira(220000), storageOptions: ["128GB", "256GB"], releaseYear: 2023 },
        ],
      },
      {
        name: "Infinix",
        slug: "infinix",
        models: [
          { name: "Note 30 Pro", slug: "note-30-pro", baseValueKobo: naira(140000), storageOptions: ["128GB", "256GB"], releaseYear: 2023 },
          { name: "Zero 30", slug: "zero-30", baseValueKobo: naira(160000), storageOptions: ["256GB"], releaseYear: 2023 },
        ],
      },
      {
        name: "Tecno",
        slug: "tecno",
        models: [{ name: "Camon 20 Pro", slug: "camon-20-pro", baseValueKobo: naira(130000), storageOptions: ["128GB", "256GB"], releaseYear: 2023 }],
      },
    ],
  },
  {
    slug: "laptops",
    name: "Laptops",
    icon: "laptop",
    brands: [
      {
        name: "Apple",
        slug: "apple",
        models: [
          { name: "MacBook Air M2", slug: "macbook-air-m2", baseValueKobo: naira(950000), storageOptions: ["256GB", "512GB"], releaseYear: 2022 },
          { name: "MacBook Pro 13\" M1", slug: "macbook-pro-13-m1", baseValueKobo: naira(780000), storageOptions: ["256GB", "512GB"], releaseYear: 2020 },
        ],
      },
      {
        name: "HP",
        slug: "hp",
        models: [
          { name: "EliteBook 840 G8", slug: "elitebook-840-g8", baseValueKobo: naira(420000), storageOptions: ["256GB", "512GB"], releaseYear: 2021 },
          { name: "Pavilion 15", slug: "pavilion-15", baseValueKobo: naira(280000), storageOptions: ["256GB", "512GB"], releaseYear: 2022 },
        ],
      },
      {
        name: "Dell",
        slug: "dell",
        models: [{ name: "Latitude 7420", slug: "latitude-7420", baseValueKobo: naira(400000), storageOptions: ["256GB", "512GB"], releaseYear: 2021 }],
      },
      {
        name: "Lenovo",
        slug: "lenovo",
        models: [{ name: "ThinkPad X1 Carbon", slug: "thinkpad-x1-carbon", baseValueKobo: naira(460000), storageOptions: ["256GB", "512GB"], releaseYear: 2021 }],
      },
    ],
  },
  {
    slug: "tablets",
    name: "Tablets",
    icon: "tablet",
    brands: [
      {
        name: "Apple",
        slug: "apple",
        models: [
          { name: "iPad Air 5th Gen", slug: "ipad-air-5", baseValueKobo: naira(420000), storageOptions: ["64GB", "256GB"], releaseYear: 2022 },
          { name: "iPad 9th Gen", slug: "ipad-9", baseValueKobo: naira(240000), storageOptions: ["64GB", "256GB"], releaseYear: 2021 },
        ],
      },
      {
        name: "Samsung",
        slug: "samsung",
        models: [{ name: "Galaxy Tab S8", slug: "galaxy-tab-s8", baseValueKobo: naira(320000), storageOptions: ["128GB", "256GB"], releaseYear: 2022 }],
      },
    ],
  },
  {
    slug: "smartwatches",
    name: "Smartwatches",
    icon: "watch",
    brands: [
      {
        name: "Apple",
        slug: "apple",
        models: [
          { name: "Watch Series 8", slug: "watch-series-8", baseValueKobo: naira(220000), storageOptions: [], releaseYear: 2022 },
          { name: "Watch SE", slug: "watch-se", baseValueKobo: naira(150000), storageOptions: [], releaseYear: 2022 },
        ],
      },
      {
        name: "Samsung",
        slug: "samsung",
        models: [{ name: "Galaxy Watch 5", slug: "galaxy-watch-5", baseValueKobo: naira(130000), storageOptions: [], releaseYear: 2022 }],
      },
    ],
  },
  {
    slug: "audio",
    name: "Audio",
    icon: "headphones",
    brands: [
      {
        name: "Apple",
        slug: "apple",
        models: [{ name: "AirPods Pro 2", slug: "airpods-pro-2", baseValueKobo: naira(140000), storageOptions: [], releaseYear: 2022 }],
      },
      {
        name: "Sony",
        slug: "sony",
        models: [{ name: "WH-1000XM5", slug: "wh-1000xm5", baseValueKobo: naira(160000), storageOptions: [], releaseYear: 2022 }],
      },
      {
        name: "JBL",
        slug: "jbl",
        models: [{ name: "Live 660NC", slug: "live-660nc", baseValueKobo: naira(50000), storageOptions: [], releaseYear: 2021 }],
      },
    ],
  },
  {
    slug: "consoles",
    name: "Gaming Consoles",
    icon: "gamepad-2",
    brands: [
      {
        name: "Sony",
        slug: "sony",
        models: [{ name: "PlayStation 5", slug: "ps5", baseValueKobo: naira(480000), storageOptions: ["825GB"], releaseYear: 2020 }],
      },
      {
        name: "Microsoft",
        slug: "microsoft",
        models: [{ name: "Xbox Series X", slug: "xbox-series-x", baseValueKobo: naira(440000), storageOptions: ["1TB"], releaseYear: 2020 }],
      },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding NASTECH Gadgets…");

  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", activeGateways: ["PAYSTACK", "FLUTTERWAVE", "BANK_TRANSFER"] },
  });

  const passwordHash = await bcrypt.hash("Admin@12345", 10);
  await prisma.user.upsert({
    where: { email: "admin@nastech.ng" },
    update: {},
    create: { name: "NASTECH Super Admin", email: "admin@nastech.ng", passwordHash, role: "SUPERADMIN" },
  });
  await prisma.user.upsert({
    where: { email: "ops@nastech.ng" },
    update: {},
    create: { name: "NASTECH Ops Admin", email: "ops@nastech.ng", passwordHash: await bcrypt.hash("Ops@12345", 10), role: "ADMIN" },
  });
  const customer = await prisma.user.upsert({
    where: { email: "chidinma@example.com" },
    update: {},
    create: { name: "Chidinma Okafor", email: "chidinma@example.com", phone: "08012345678", passwordHash: await bcrypt.hash("Customer@123", 10), role: "CUSTOMER" },
  });

  const createdProducts: { id: string; slug: string }[] = [];

  for (const [ci, cat] of CATEGORIES.entries()) {
    const category = await prisma.deviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: ci },
      create: { slug: cat.slug, name: cat.name, icon: cat.icon, sortOrder: ci },
    });

    for (const q of CONDITION_QUESTIONS) {
      const existing = await prisma.conditionQuestion.findFirst({ where: { categoryId: category.id, question: q.question } });
      const question = existing
        ? existing
        : await prisma.conditionQuestion.create({ data: { categoryId: category.id, question: q.question, sortOrder: CONDITION_QUESTIONS.indexOf(q) } });
      for (const [oi, opt] of q.options.entries()) {
        const existingOpt = await prisma.conditionOption.findFirst({ where: { questionId: question.id, label: opt.label } });
        if (!existingOpt) {
          await prisma.conditionOption.create({ data: { questionId: question.id, label: opt.label, deductionBps: opt.deductionBps, sortOrder: oi } });
        }
      }
    }

    for (const b of cat.brands) {
      const brand = await prisma.brand.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: b.slug } },
        update: { name: b.name },
        create: { categoryId: category.id, slug: b.slug, name: b.name },
      });

      for (const [mi, m] of b.models.entries()) {
        const model = await prisma.deviceModel.upsert({
          where: { brandId_slug: { brandId: brand.id, slug: m.slug } },
          update: { name: m.name, baseValueKobo: m.baseValueKobo, storageOptions: m.storageOptions, releaseYear: m.releaseYear },
          create: { brandId: brand.id, slug: m.slug, name: m.name, baseValueKobo: m.baseValueKobo, storageOptions: m.storageOptions, releaseYear: m.releaseYear },
        });

        // Create one refurbished storefront listing per model (skip every 3rd to vary stock/availability).
        if (mi % 3 !== 2) {
          const grade = mi % 2 === 0 ? "GOOD" : "LIKE_NEW";
          const discountFactor = grade === "LIKE_NEW" ? 0.85 : 0.72;
          const priceKobo = Math.round((m.baseValueKobo * discountFactor) / 1000) * 1000;
          const compareAtPriceKobo = Math.round((m.baseValueKobo * 1.05) / 1000) * 1000;
          const storage = m.storageOptions[m.storageOptions.length - 1];
          const slug = `${m.slug}-${grade.toLowerCase().replace("_", "-")}`;

          const name = `${b.name} ${m.name}${storage ? ` ${storage}` : ""}`;
          const product = await prisma.product.upsert({
            where: { slug },
            update: { name, priceKobo, compareAtPriceKobo, stock: 4 + mi },
            create: {
              sku: `NAS-${m.slug.toUpperCase()}-${grade}`,
              name,
              slug,
              categoryId: category.id,
              brandId: brand.id,
              modelId: model.id,
              grade,
              storage,
              priceKobo,
              compareAtPriceKobo,
              stock: 4 + mi,
              description: `Certified refurbished ${b.name} ${m.name}. Inspected and graded "${grade === "LIKE_NEW" ? "Like New" : "Good"}" across a 40-point quality check, backed by a 12-month NASTECH warranty.`,
              specs: { Brand: b.name, Model: m.name, ...(storage ? { Storage: storage } : {}), Condition: grade === "LIKE_NEW" ? "Like New" : "Good", Warranty: "12 months" },
              images: [],
            },
          });
          createdProducts.push(product);
        }
      }
    }
  }

  // A couple of sample reviews for demo purposes (guarded so re-running the seed doesn't duplicate them).
  if (createdProducts.length > 0) {
    const existingReviews = await prisma.review.count({ where: { userId: customer.id } });
    if (existingReviews === 0) {
      await prisma.review.createMany({
        data: [
          { productId: createdProducts[0].id, userId: customer.id, rating: 5, comment: "Arrived in great condition, exactly as described. Fast delivery to Lagos!" },
          { productId: createdProducts[Math.min(2, createdProducts.length - 1)].id, userId: customer.id, rating: 4, comment: "Very good value for money. Minor scuff on the back but works perfectly." },
        ],
      });
    }
  }

  console.log(`✅ Seeded ${CATEGORIES.length} categories, ${createdProducts.length} products.`);
  console.log("👤 Admin login:      admin@nastech.ng / Admin@12345");
  console.log("👤 Ops admin login:  ops@nastech.ng / Ops@12345");
  console.log("👤 Customer login:   chidinma@example.com / Customer@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
