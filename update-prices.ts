import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePricesToEuros() {
  try {
    console.log('🔄 Updating menu item prices to euros...');

    // Define the price mapping from old prices to new euro prices
    const priceUpdates = [
      // Appetizers
      { name: 'Garlic Bread', newPrice: 7.99 },
      { name: 'Bruschetta', newPrice: 9.99 },
      { name: 'Calamari Rings', newPrice: 11.99 },
      { name: 'Shrimp Cocktail', newPrice: 14.99 },
      
      // Main Courses
      { name: 'Prime Ribeye', newPrice: 38.99 },
      { name: 'T-Bone Supreme', newPrice: 41.99 },
      { name: 'Grilled Salmon', newPrice: 26.99 },
      { name: 'Surf and Turf', newPrice: 49.99 },
      { name: 'Filet Mignon', newPrice: 35.99 },
      { name: 'New York Strip', newPrice: 27.99 },
      
      // Desserts
      { name: 'Classic Cheesecake', newPrice: 8.99 },
      { name: 'Tiramisu', newPrice: 8.99 },
      { name: 'Chocolate Lava Cake', newPrice: 7.99 },
      { name: 'Crème Brûlée', newPrice: 8.99 },
      
      // Beverages
      { name: 'House Wine Red', newPrice: 7.99 },
      { name: 'House Wine White', newPrice: 7.99 },
      { name: 'Fresh Lemonade', newPrice: 4.49 },
      { name: 'Espresso', newPrice: 3.49 },
      { name: 'Cappuccino', newPrice: 4.49 },
      { name: 'Craft Beer', newPrice: 4.49 }
    ];

    for (const update of priceUpdates) {
      const result = await prisma.menuItem.updateMany({
        where: { name: update.name },
        data: { price: update.newPrice }
      });
      
      if (result.count > 0) {
        console.log(`✅ Updated ${update.name}: €${update.newPrice}`);
      } else {
        console.log(`⚠️  Item not found: ${update.name}`);
      }
    }

    console.log('✅ All menu item prices updated to euros successfully!');
  } catch (error) {
    console.error('❌ Error updating prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePricesToEuros();
