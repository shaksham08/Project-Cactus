const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDatabase = require('../src/config/db');
const User = require('../src/models/User');
const Test = require('../src/models/Test');

const parseArgs = () => {
  const args = {};

  process.argv.slice(2).forEach((rawArg) => {
    const [key, ...rest] = rawArg.replace(/^--/, '').split('=');
    args[key] = rest.length > 0 ? rest.join('=') : true;
  });

  return args;
};

const printUsage = () => {
  console.log(`
Usage:
  node scripts/create-test.js --input=./test-data.json --email=you@example.com [--password=secret]
  node scripts/create-test.js --input=./test-data.json --userId=<userId>

Options:
  --input       Path to a JSON file containing the test payload
  --email       User email to assign the test to
  --password    Password to create the user if it does not already exist
  --userId      MongoDB user ID to assign the test to
`);
};

const main = async () => {
  const args = parseArgs();
  const inputPath = args.input;
  const userId = args.userId;
  const email = args.email;
  const password = args.password;

  if (!inputPath || (!email && !userId)) {
    printUsage();
    process.exit(1);
  }

  const resolvedInputPath = path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);

  if (!fs.existsSync(resolvedInputPath)) {
    console.error(`Input file not found: ${resolvedInputPath}`);
    process.exit(1);
  }

  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(resolvedInputPath, 'utf-8'));
  } catch (error) {
    console.error('Failed to parse JSON input:', error.message);
    process.exit(1);
  }

  await connectDatabase();

  let owner = null;

  if (userId) {
    owner = await User.findById(userId);
    if (!owner) {
      console.error(`No user found with userId=${userId}`);
      process.exit(1);
    }
  } else {
    owner = await User.findOne({ email });
    if (!owner) {
      if (!password) {
        console.error(`No user found with email=${email}. Pass --password to create the user.`);
        process.exit(1);
      }

      owner = await User.create({
        fullName: email.split('@')[0],
        email,
        password,
      });
      console.log(`Created new user: ${owner.email} (id=${owner._id})`);
    }
  }

  const testDoc = {
    ...payload,
    owner: owner._id,
  };

  try {
    const createdTest = await Test.create(testDoc);
    console.log('Test created successfully:');
    console.log(`  id: ${createdTest._id}`);
    console.log(`  title: ${createdTest.title}`);
    console.log(`  owner: ${owner.email}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create test:');
    if (error.name === 'ValidationError') {
      Object.values(error.errors).forEach((err) => {
        console.error(`  - ${err.message}`);
      });
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
};

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
