const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const cloudinary = require('../config/cloudinary');
const Place = require('../models/Place');
const Food = require('../models/Food');
const Tour = require('../models/Tour');

const args = process.argv.slice(2);
const shouldApply = args.includes('--apply');
const limitArg = args.find((arg) => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : null;

const uploadsDir = path.join(__dirname, '..', 'uploads');
const cloudinaryBaseFolder = 'danatrip/migrated';

const stats = {
  scanned: 0,
  candidates: 0,
  migrated: 0,
  missingFile: 0,
  skippedNonLocal: 0,
  errors: 0,
};

const isHttpUrl = (value) => /^https?:\/\//i.test(value || '');

const getUploadsFilenameFromUrl = (value) => {
  if (!value || typeof value !== 'string') return null;
  if (value.startsWith('/uploads/')) return value.slice('/uploads/'.length);

  if (isHttpUrl(value)) {
    try {
      const url = new URL(value);
      const marker = '/uploads/';
      const idx = url.pathname.indexOf(marker);
      if (idx >= 0) return url.pathname.slice(idx + marker.length);
    } catch (error) {
      return null;
    }
  }

  return null;
};

const migrateImageUrl = async ({ currentUrl, folder }) => {
  stats.scanned += 1;

  if (!currentUrl) return { changed: false, value: currentUrl };

  const fileName = getUploadsFilenameFromUrl(currentUrl);
  if (!fileName) {
    stats.skippedNonLocal += 1;
    return { changed: false, value: currentUrl };
  }

  stats.candidates += 1;

  const localPath = path.join(uploadsDir, path.basename(fileName));
  if (!fs.existsSync(localPath)) {
    stats.missingFile += 1;
    console.warn(`[MISSING] ${currentUrl} -> ${localPath}`);
    return { changed: false, value: currentUrl };
  }

  if (!shouldApply) {
    return { changed: false, value: currentUrl, preview: `[DRY-RUN] ${currentUrl}` };
  }

  const result = await cloudinary.uploader.upload(localPath, {
    folder: `${cloudinaryBaseFolder}/${folder}`,
    resource_type: 'image',
  });

  stats.migrated += 1;
  return { changed: true, value: result.secure_url };
};

const processPlace = async (place) => {
  let changed = false;

  const mainImage = await migrateImageUrl({
    currentUrl: place.hinhAnhChinh,
    folder: 'place/main',
  });
  if (mainImage.changed) {
    place.hinhAnhChinh = mainImage.value;
    changed = true;
  }

  for (let i = 0; i < (place.hinhAnh || []).length; i += 1) {
    const item = place.hinhAnh[i];
    const migrated = await migrateImageUrl({
      currentUrl: item.urlAnh,
      folder: 'place/album',
    });
    if (migrated.changed) {
      place.hinhAnh[i].urlAnh = migrated.value;
      changed = true;
    }
  }

  for (let i = 0; i < (place.diemThamQuan || []).length; i += 1) {
    const item = place.diemThamQuan[i];
    const migrated = await migrateImageUrl({
      currentUrl: item.hinhAnh,
      folder: 'place/visit-points',
    });
    if (migrated.changed) {
      place.diemThamQuan[i].hinhAnh = migrated.value;
      changed = true;
    }
  }

  for (let i = 0; i < (place.view360 || []).length; i += 1) {
    const item = place.view360[i];
    const migrated = await migrateImageUrl({
      currentUrl: item.thumbnail,
      folder: 'place/view360',
    });
    if (migrated.changed) {
      place.view360[i].thumbnail = migrated.value;
      changed = true;
    }
  }

  if (changed && shouldApply) {
    await place.save();
  }
};

const processFood = async (food) => {
  let changed = false;

  const mainImage = await migrateImageUrl({
    currentUrl: food.hinhAnh,
    folder: 'food/main',
  });
  if (mainImage.changed) {
    food.hinhAnh = mainImage.value;
    changed = true;
  }

  for (let i = 0; i < (food.albumAnh || []).length; i += 1) {
    const item = food.albumAnh[i];
    const migrated = await migrateImageUrl({
      currentUrl: item.urlAnh,
      folder: 'food/album',
    });
    if (migrated.changed) {
      food.albumAnh[i].urlAnh = migrated.value;
      changed = true;
    }
  }

  if (changed && shouldApply) {
    await food.save();
  }
};

const processTour = async (tour) => {
  let changed = false;

  for (let i = 0; i < (tour.hinhAnh || []).length; i += 1) {
    const item = tour.hinhAnh[i];
    const migrated = await migrateImageUrl({
      currentUrl: item.urlAnh,
      folder: 'tour/album',
    });
    if (migrated.changed) {
      tour.hinhAnh[i].urlAnh = migrated.value;
      changed = true;
    }
  }

  if (changed && shouldApply) {
    await tour.save();
  }
};

const processDocs = async (label, docs, processor) => {
  console.log(`\n[${label}] Processing ${docs.length} documents`);
  let count = 0;

  for (const doc of docs) {
    if (limit && count >= limit) break;
    try {
      await processor(doc);
      count += 1;
      if (count % 20 === 0) {
        console.log(`[${label}] Processed ${count}`);
      }
    } catch (error) {
      stats.errors += 1;
      console.error(`[${label}] Error doc ${doc._id}: ${error.message}`);
    }
  }
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('Thiếu MONGO_URI trong .env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected MongoDB | Mode: ${shouldApply ? 'APPLY' : 'DRY-RUN'}`);

  const [places, foods, tours] = await Promise.all([
    Place.find(),
    Food.find(),
    Tour.find(),
  ]);

  await processDocs('Place', places, processPlace);
  await processDocs('Food', foods, processFood);
  await processDocs('Tour', tours, processTour);

  console.log('\n=== Migration Summary ===');
  console.log(`scanned: ${stats.scanned}`);
  console.log(`candidates(local uploads): ${stats.candidates}`);
  console.log(`migrated: ${stats.migrated}`);
  console.log(`missingFile: ${stats.missingFile}`);
  console.log(`skippedNonLocal: ${stats.skippedNonLocal}`);
  console.log(`errors: ${stats.errors}`);
};

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error(`Migration failed: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  });
