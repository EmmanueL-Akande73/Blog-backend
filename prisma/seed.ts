import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data in the correct order to avoid foreign key constraint errors
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users with different roles
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.user.createMany({
    data: [
      {
        username: 'admin',
        email: 'admin@steakz.com',
        password: hashedPassword,
        role: 'ADMIN'
      },
      {
        username: 'hq_manager',
        email: 'hq.manager@steakz.com',
        password: hashedPassword,
        role: 'HEADQUARTER_MANAGER'
      },
      {
        username: 'branch_manager',
        email: 'branch.manager@steakz.com',
        password: hashedPassword,
        role: 'BRANCH_MANAGER'
      },
      {
        username: 'cashier',
        email: 'cashier@steakz.com',
        password: hashedPassword,
        role: 'CASHIER'
      },
      {
        username: 'chef',
        email: 'chef@steakz.com',
        password: hashedPassword,
        role: 'CHEF'
      },
      {
        username: 'customer',
        email: 'customer@steakz.com',
        password: hashedPassword,
        role: 'CUSTOMER'
      }
    ]
  });

  // Create menu items
  await prisma.menuItem.createMany({
    data: [
      // Appetizers
      { name: 'Garlic Bread', description: 'Toasted artisan bread with roasted garlic and herbs', price: 7.50, category: 'APPETIZER', imageUrl: 'https://images.unsplash.com/photo-1619985632132-34dc4e0ef829?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Bruschetta', description: 'Grilled bread with fresh tomato, basil and balsamic glaze', price: 9.50, category: 'APPETIZER', imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Calamari Rings', description: 'Crispy fried squid rings with marinara sauce', price: 11.50, category: 'APPETIZER', imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Shrimp Cocktail', description: 'Fresh jumbo shrimp with cocktail sauce', price: 14.50, category: 'APPETIZER', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      
      // Mains
      { name: 'Prime Ribeye', description: 'Our signature 16oz dry-aged ribeye, perfectly marbled and grilled to your preference. Served with garlic mashed potatoes and seasonal vegetables.', price: 38.50, category: 'MAIN', imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Filet Mignon', description: 'Tender 8oz center-cut filet, the most tender cut available. Seasoned with our special blend and cooked to perfection with a red wine reduction.', price: 35.50, category: 'MAIN', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'T-Bone Supreme', description: 'A generous 20oz T-bone combining the best of both worlds - tender filet and flavorful strip steak. A true carnivore\'s delight.', price: 42.50, category: 'MAIN', imageUrl: 'https://images.unsplash.com/photo-1602741103019-e59ede43b0b0?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'New York Strip', description: '14oz well-marbled strip steak with bold flavor and firm texture', price: 32.50, category: 'MAIN', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Grilled Salmon', description: 'Fresh Atlantic salmon fillet with lemon butter and dill', price: 26.50, category: 'MAIN', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Surf and Turf', description: '8oz filet mignon paired with lobster tail', price: 48.50, category: 'MAIN', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      
      // Desserts
      { name: 'Classic Cheesecake', description: 'Rich and creamy New York style cheesecake with berry compote', price: 8.50, category: 'DESSERT', imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with molten center and vanilla ice cream', price: 9.50, category: 'DESSERT', imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Crème Brûlée', description: 'Classic vanilla custard with caramelized sugar top', price: 8.50, category: 'DESSERT', imageUrl: 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Tiramisu', description: 'Traditional Italian dessert with coffee-soaked ladyfingers', price: 8.50, category: 'DESSERT', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      
      // Beverages
      { name: 'House Wine Red', description: 'Full-bodied red wine selection', price: 7.50, category: 'BEVERAGE', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'House Wine White', description: 'Crisp and refreshing white wine', price: 7.50, category: 'BEVERAGE', imageUrl: 'https://images.unsplash.com/photo-1551798507-629020c64c8b?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Craft Beer', description: 'Selection of local and imported craft beers', price: 5.50, category: 'BEVERAGE', imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Fresh Lemonade', description: 'Homemade lemonade with fresh lemons', price: 4.50, category: 'BEVERAGE', imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Espresso', description: 'Rich Italian espresso coffee', price: 3.50, category: 'BEVERAGE', imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', isAvailable: true },
      { name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 4.50, category: 'BEVERAGE', imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=400&q=80', isAvailable: true },
    ]
  });
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
