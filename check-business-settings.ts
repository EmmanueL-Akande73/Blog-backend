import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBusinessSettings() {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { category: 'BUSINESS' }
    });
    console.log('Business settings:');
    settings.forEach(setting => {
      console.log(`- ${setting.key}: ${setting.value} (${setting.description})`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBusinessSettings();
