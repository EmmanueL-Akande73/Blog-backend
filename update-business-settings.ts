import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateBusinessSettings() {
  try {
    console.log('🔄 Updating business settings to euros...');
    
    // Update delivery fee to euro amount
    await prisma.systemSetting.update({
      where: { key: 'delivery_fee' },
      data: { 
        value: '4.99',
        description: 'Standard delivery fee amount in euros'
      }
    });
    
    console.log('✅ Updated delivery fee to €4.99');
    console.log('✅ Business settings updated successfully!');
  } catch (error) {
    console.error('❌ Error updating business settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateBusinessSettings();
