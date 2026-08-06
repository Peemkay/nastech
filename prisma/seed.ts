/* Seed data — realistic Nigerian device catalog, repair services & regions. */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const naira = (n: number) => n * 100; // kobo

const ALL_STATES = [
  "Abia", "Adamawa", "AkwaIbom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

// Repair catalog varies by device type — mobile-ish devices, laptops, and small accessories each get a fitting set.
const REPAIR_ISSUES_MOBILE = [
  { name: "Screen Replacement", type: "HARDWARE", price: 45000, duration: "Same day" },
  { name: "Battery Replacement", type: "HARDWARE", price: 15000, duration: "Same day" },
  { name: "Charging Port Repair", type: "HARDWARE", price: 12000, duration: "Same day" },
  { name: "Camera Repair", type: "HARDWARE", price: 18000, duration: "Same day" },
  { name: "Water Damage Treatment", type: "HARDWARE", price: 20000, duration: "24-48 hours" },
  { name: "Software / OS Issue", type: "SOFTWARE", price: 5000, duration: "1-2 hours" },
  { name: "Virus / Malware Removal", type: "SOFTWARE", price: 5000, duration: "1-2 hours" },
];
const REPAIR_ISSUES_LAPTOP = [
  { name: "Screen Replacement", type: "HARDWARE", price: 45000, duration: "Same day" },
  { name: "Battery Replacement", type: "HARDWARE", price: 25000, duration: "Same day" },
  { name: "Keyboard Replacement", type: "HARDWARE", price: 15000, duration: "Same day" },
  { name: "Motherboard Repair", type: "HARDWARE", price: 30000, duration: "3-5 days" },
  { name: "Software / OS Reinstall", type: "SOFTWARE", price: 8000, duration: "Same day" },
  { name: "Virus / Malware Removal", type: "SOFTWARE", price: 6000, duration: "1-2 hours" },
  { name: "Data Recovery", type: "SOFTWARE", price: 18000, duration: "1-3 days" },
];
const REPAIR_ISSUES_ACCESSORY = [
  { name: "Speaker / Audio Repair", type: "HARDWARE", price: 10000, duration: "Same day" },
  { name: "Button / Controller Repair", type: "HARDWARE", price: 8000, duration: "Same day" },
  { name: "Battery / Charging Issue", type: "HARDWARE", price: 9000, duration: "Same day" },
  { name: "Software Reset / Update", type: "SOFTWARE", price: 4000, duration: "1 hour" },
];
const REPAIR_ISSUES_BY_CATEGORY: Record<string, typeof REPAIR_ISSUES_MOBILE> = {
  smartphones: REPAIR_ISSUES_MOBILE,
  tablets: REPAIR_ISSUES_MOBILE,
  smartwatches: REPAIR_ISSUES_ACCESSORY,
  laptops: REPAIR_ISSUES_LAPTOP,
  audio: REPAIR_ISSUES_ACCESSORY,
  consoles: REPAIR_ISSUES_ACCESSORY,
};

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

  // No demo users are seeded — real deployments must never ship a known
  // password. If INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD are set and no
  // admin exists yet, create the first one (mirrors lib/bootstrap-admin.ts,
  // which also self-heals this on first /admin/login visit if this step is skipped).
  const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL;
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (initialAdminEmail && initialAdminPassword) {
    const existingAdmin = await prisma.user.findFirst({ where: { role: { in: ["ADMIN", "SUPERADMIN"] } } });
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          name: process.env.INITIAL_ADMIN_NAME || "Admin",
          email: initialAdminEmail.toLowerCase(),
          passwordHash: await bcrypt.hash(initialAdminPassword, 10),
          role: "SUPERADMIN",
          phoneVerified: true,
        },
      });
      console.log("👤 Bootstrap admin created:", initialAdminEmail);
    }
  }

  // Serviceable regions — only FCT (Abuja) is enabled by default; admin turns others on later.
  for (const state of ALL_STATES) {
    await prisma.serviceRegion.upsert({
      where: { state },
      update: {},
      create: { state, enabled: state === "FCT" },
    });
  }

  const createdProducts: { id: string; slug: string }[] = [];

  for (const [ci, cat] of CATEGORIES.entries()) {
    const category = await prisma.deviceCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: ci },
      create: { slug: cat.slug, name: cat.name, icon: cat.icon, sortOrder: ci },
    });

    const repairIssues = REPAIR_ISSUES_BY_CATEGORY[cat.slug] ?? REPAIR_ISSUES_ACCESSORY;
    for (const [ri, issue] of repairIssues.entries()) {
      const existing = await prisma.repairIssue.findFirst({ where: { categoryId: category.id, name: issue.name } });
      if (!existing) {
        await prisma.repairIssue.create({
          data: {
            categoryId: category.id,
            name: issue.name,
            type: issue.type,
            basePriceKobo: naira(issue.price),
            durationHint: issue.duration,
            sortOrder: ri,
          },
        });
      }
    }

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

        // Also list the flagship model of each brand as brand-new (sealed, full price, no discount).
        if (mi === 0) {
          const storage = m.storageOptions[m.storageOptions.length - 1];
          const slug = `${m.slug}-new`;
          const name = `${b.name} ${m.name}${storage ? ` ${storage}` : ""}`;
          const product = await prisma.product.upsert({
            where: { slug },
            update: { name, priceKobo: m.baseValueKobo, stock: 3 },
            create: {
              sku: `NAS-${m.slug.toUpperCase()}-NEW`,
              name,
              slug,
              categoryId: category.id,
              brandId: brand.id,
              modelId: model.id,
              grade: "NEW",
              storage,
              priceKobo: m.baseValueKobo,
              compareAtPriceKobo: null,
              stock: 3,
              description: `Brand-new, sealed ${b.name} ${m.name}, with full manufacturer warranty.`,
              specs: { Brand: b.name, Model: m.name, ...(storage ? { Storage: storage } : {}), Condition: "Brand New", Warranty: "Manufacturer warranty" },
              images: [],
            },
          });
          createdProducts.push(product);
        }
      }
    }
  }

  const repairIssueCount = await prisma.repairIssue.count();
  console.log(`✅ Seeded ${CATEGORIES.length} categories, ${createdProducts.length} products, ${repairIssueCount} repair services, ${ALL_STATES.length} regions (FCT enabled).`);
  console.log("No demo users seeded. Set INITIAL_ADMIN_EMAIL / INITIAL_ADMIN_PASSWORD to bootstrap the first admin, or register + verify a real account from the site.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
