import prisma from './prisma';

export const seedBranches = async () => {
    try {
        const existingBranches = await prisma.branch.count();
        
        if (existingBranches === 0) {
            console.log('🌱 Seeding branches...');
            
            await prisma.branch.createMany({
                data: [
                    {
                        name: 'Steakz Downtown',
                        address: '123 Main Street',
                        city: 'Istanbul',
                        district: 'Beşiktaş',
                        phone: '+90 212 555 0101',
                        email: 'downtown@steakz.com',
                        description: 'Our flagship restaurant in the heart of the city',
                        features: ['Valet Parking', 'Private Dining', 'Wine Cellar'],
                        mondayHours: '11:00-23:00',
                        tuesdayHours: '11:00-23:00',
                        wednesdayHours: '11:00-23:00',
                        thursdayHours: '11:00-23:00',
                        fridayHours: '11:00-00:00',
                        saturdayHours: '11:00-00:00',
                        sundayHours: '12:00-22:00',
                        isActive: true,
                        latitude: 41.0082,
                        longitude: 28.9784
                    },
                    {
                        name: 'Steakz Bosphorus',
                        address: '456 Waterfront Avenue',
                        city: 'Istanbul',
                        district: 'Ortaköy',
                        phone: '+90 212 555 0102',
                        email: 'bosphorus@steakz.com',
                        description: 'Scenic location with Bosphorus view',
                        features: ['Bosphorus View', 'Outdoor Seating', 'Live Music'],
                        mondayHours: '12:00-23:00',
                        tuesdayHours: '12:00-23:00',
                        wednesdayHours: '12:00-23:00',
                        thursdayHours: '12:00-23:00',
                        fridayHours: '12:00-00:00',
                        saturdayHours: '12:00-00:00',
                        sundayHours: '12:00-22:00',
                        isActive: true,
                        latitude: 41.0473,
                        longitude: 29.0266
                    },
                    {
                        name: 'Steakz Ankara',
                        address: '789 Capital Boulevard',
                        city: 'Ankara',
                        district: 'Çankaya',
                        phone: '+90 312 555 0103',
                        email: 'ankara@steakz.com',
                        description: 'Premium dining in the capital',
                        features: ['Business Lunch', 'Meeting Rooms', 'Parking'],
                        mondayHours: '11:00-22:00',
                        tuesdayHours: '11:00-22:00',
                        wednesdayHours: '11:00-22:00',
                        thursdayHours: '11:00-22:00',
                        fridayHours: '11:00-23:00',
                        saturdayHours: '11:00-23:00',
                        sundayHours: '12:00-21:00',
                        isActive: true,
                        latitude: 39.9334,
                        longitude: 32.8597
                    },
                    {
                        name: 'Steakz İzmir',
                        address: '321 Coastal Road',
                        city: 'İzmir',
                        district: 'Alsancak',
                        phone: '+90 232 555 0104',
                        email: 'izmir@steakz.com',
                        description: 'Mediterranean coast dining experience',
                        features: ['Sea View', 'Fresh Seafood', 'Terrace Dining'],
                        mondayHours: '12:00-23:00',
                        tuesdayHours: '12:00-23:00',
                        wednesdayHours: '12:00-23:00',
                        thursdayHours: '12:00-23:00',
                        fridayHours: '12:00-00:00',
                        saturdayHours: '12:00-00:00',
                        sundayHours: '12:00-22:00',
                        isActive: true,
                        latitude: 38.4192,
                        longitude: 27.1287
                    }
                ]
            });
            
            console.log('✅ Branches seeded successfully');
        } else {
            console.log('ℹ️ Branches already exist');
        }
    } catch (error) {
        console.error('❌ Error seeding branches:', error);
    }
};
