import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedBranches() {
  await prisma.branch.deleteMany();
  
  await prisma.branch.createMany({
    data: [
      {
        name: "Downtown Location",
        address: "123 Gourmet Boulevard",
        city: "City Center",
        district: "Downtown, 12345 Premium District",
        phone: "+1 (555) 123-4567",
        email: "downtown@steakz.com",
        description: "Our flagship location in the heart of the city, featuring elegant dining rooms and a sophisticated atmosphere perfect for business meetings and special occasions.",
        features: ["🅿️ Valet Parking", "🍷 Wine Cellar", "👔 Private Dining", "🏢 Business Center", "🎵 Live Piano"],
        mondayHours: "5:00 PM - 11:00 PM",
        tuesdayHours: "5:00 PM - 11:00 PM",
        wednesdayHours: "5:00 PM - 11:00 PM",
        thursdayHours: "5:00 PM - 11:00 PM",
        fridayHours: "5:00 PM - 12:00 AM",
        saturdayHours: "5:00 PM - 12:00 AM",
        sundayHours: "4:00 PM - 10:00 PM",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
        latitude: 40.7128,
        longitude: -74.0060,
        isActive: true
      },
      {
        name: "Waterfront Location",
        address: "456 Marina Drive",
        city: "Waterfront District",
        district: "Harbor View, 12346",
        phone: "+1 (555) 234-5678",
        email: "waterfront@steakz.com",
        description: "Spectacular oceanfront dining with panoramic water views. Features an outdoor terrace and dock access for guests arriving by boat.",
        features: ["🌊 Ocean View", "🛥️ Boat Access", "🎉 Event Space", "🌅 Outdoor Terrace", "🦞 Fresh Seafood Bar"],
        mondayHours: "5:30 PM - 11:00 PM",
        tuesdayHours: "5:30 PM - 11:00 PM",
        wednesdayHours: "5:30 PM - 11:00 PM",
        thursdayHours: "5:30 PM - 11:00 PM",
        fridayHours: "5:30 PM - 12:30 AM",
        saturdayHours: "5:30 PM - 12:30 AM",
        sundayHours: "4:30 PM - 10:30 PM",
        imageUrl: "https://images.unsplash.com/photo-1559329007-40df8213c871?auto=format&fit=crop&w=800&q=80",
        latitude: 40.7589,
        longitude: -73.9851,
        isActive: true
      },
      {
        name: "Garden District Location",
        address: "789 Rose Garden Lane",
        city: "Garden District",
        district: "Botanical Quarter, 12347",
        phone: "+1 (555) 345-6789",
        email: "garden@steakz.com",
        description: "Nestled in the beautiful Garden District, this location features indoor and outdoor garden dining with a romantic atmosphere surrounded by lush greenery.",
        features: ["🌸 Garden Dining", "🌿 Outdoor Patio", "💒 Wedding Venue", "🍃 Farm-to-Table", "🎭 Live Entertainment"],
        mondayHours: "5:00 PM - 10:30 PM",
        tuesdayHours: "5:00 PM - 10:30 PM",
        wednesdayHours: "5:00 PM - 10:30 PM",
        thursdayHours: "5:00 PM - 10:30 PM",
        fridayHours: "5:00 PM - 11:30 PM",
        saturdayHours: "4:30 PM - 11:30 PM",
        sundayHours: "4:30 PM - 10:00 PM",
        imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        latitude: 40.7282,
        longitude: -74.0776,
        isActive: true
      },
      {
        name: "Skyline Rooftop Location",
        address: "321 High Street, 45th Floor",
        city: "Financial District",
        district: "Skyline Tower, 12348",
        phone: "+1 (555) 456-7890",
        email: "skyline@steakz.com",
        description: "Experience dining among the clouds at our exclusive rooftop location. Offering 360-degree city views and contemporary cuisine 45 floors above the bustling streets.",
        features: ["🏙️ City Views", "🌃 Rooftop Dining", "🍸 Sky Bar", "🌟 VIP Lounge", "🚁 Helicopter Pad"],
        mondayHours: "6:00 PM - 11:30 PM",
        tuesdayHours: "6:00 PM - 11:30 PM",
        wednesdayHours: "6:00 PM - 11:30 PM",
        thursdayHours: "6:00 PM - 11:30 PM",
        fridayHours: "6:00 PM - 1:00 AM",
        saturdayHours: "6:00 PM - 1:00 AM",
        sundayHours: "5:00 PM - 11:00 PM",
        imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80",
        latitude: 40.7061,
        longitude: -74.0087,
        isActive: true
      }
    ]
  });
  
  console.log('✅ Branches seeded successfully!');
}

seedBranches()
  .catch(e => { 
    console.error(e); 
    process.exit(1); 
  })
  .finally(() => prisma.$disconnect());
