import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMenuItems() {
  try {
    const items = await prisma.menuItem.findMany();
    console.log('Current menu items:');
    items.forEach(item => {
      console.log(`- ${item.name}: $${item.price}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMenuItems();
