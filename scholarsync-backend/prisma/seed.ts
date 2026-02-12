import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ScholarshipSeedData {
  title: string;
  organization: string;
  amount: number;
  deadline: string;
  description: string;
  eligibilityRequirements: {
    minGPA?: number;
    academicStanding?: string[];
    majors?: string[];
    states?: string[];
    citizenshipRequired?: boolean;
    essayRequired?: boolean;
    recommendationsRequired?: number;
  };
  applicationUrl: string;
  tags: string[];
  essayPrompts: Array<{
    prompt: string;
    wordLimit: number;
    required: boolean;
  }>;
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Load scholarship data
  const scholarshipsPath = path.join(__dirname, 'seed-data', 'scholarships.json');
  const scholarshipsData: ScholarshipSeedData[] = JSON.parse(
    fs.readFileSync(scholarshipsPath, 'utf-8')
  );

  console.log(`📚 Found ${scholarshipsData.length} scholarships to seed\n`);

  // Seed scholarships
  let successCount = 0;
  let errorCount = 0;

  for (const scholarship of scholarshipsData) {
    try {
      await prisma.scholarship.create({
        data: {
          title: scholarship.title,
          organization: scholarship.organization,
          amount: scholarship.amount,
          deadline: new Date(scholarship.deadline),
          description: scholarship.description,
          eligibilityRequirements: scholarship.eligibilityRequirements,
          applicationUrl: scholarship.applicationUrl,
          tags: scholarship.tags,
          essayPrompts: scholarship.essayPrompts,
          isActive: true,
          source: 'seed',
        },
      });

      console.log(`✓ Created: ${scholarship.title}`);
      successCount++;
    } catch (error: any) {
      console.error(`✗ Failed to create ${scholarship.title}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Seed Summary:`);
  console.log(`   ✓ Success: ${successCount}`);
  console.log(`   ✗ Errors: ${errorCount}`);
  console.log(`   📚 Total: ${scholarshipsData.length}\n`);

  // Create some sample match scores for demonstration
  const users = await prisma.user.findMany({ take: 5 });
  const scholarships = await prisma.scholarship.findMany({ take: 5 });

  if (users.length > 0 && scholarships.length > 0) {
    console.log('🎯 Creating sample match scores...\n');

    for (const user of users) {
      for (const scholarship of scholarships) {
        try {
          await prisma.matchScore.create({
            data: {
              userId: user.id,
              scholarshipId: scholarship.id,
              score: Math.floor(Math.random() * 40) + 60, // Random score 60-100
              factors: {
                gpaMatch: Math.random(),
                majorMatch: Math.random(),
                deadlineProximity: Math.random(),
                profileStrength: Math.random(),
              },
              lastCalculated: new Date(),
            },
          });
        } catch (error) {
          // Skip if already exists
        }
      }
    }

    console.log('✓ Sample match scores created\n');
  }

  console.log('🎉 Database seed completed!\n');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
