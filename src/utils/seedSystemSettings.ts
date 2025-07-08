import prisma from './prisma';

export const seedSystemSettings = async () => {
    try {
        // Check if settings already exist
        const existingSettings = await prisma.systemSetting.count();
        
        if (existingSettings > 0) {
            console.log('System settings already exist, skipping seed');
            return;
        }

        const defaultSettings = [
            // General Settings
            {
                key: 'maintenance_mode',
                value: 'false',
                description: 'Enable/disable maintenance mode for the entire system',
                category: 'GENERAL',
                dataType: 'BOOLEAN'
            },
            {
                key: 'site_name',
                value: 'Steakz Premium Steakhouse',
                description: 'The name of the restaurant/site',
                category: 'GENERAL',
                dataType: 'STRING'
            },
            {
                key: 'contact_email',
                value: 'admin@steakz.com',
                description: 'Main contact email for the restaurant',
                category: 'GENERAL',
                dataType: 'STRING'
            },
            {
                key: 'contact_phone',
                value: '+1-234-567-8900',
                description: 'Main contact phone number',
                category: 'GENERAL',
                dataType: 'STRING'
            },
            
            // Security Settings
            {
                key: 'max_login_attempts',
                value: '5',
                description: 'Maximum number of failed login attempts before account lockout',
                category: 'SECURITY',
                dataType: 'NUMBER'
            },
            {
                key: 'session_timeout',
                value: '30',
                description: 'Session timeout in minutes',
                category: 'SECURITY',
                dataType: 'NUMBER'
            },
            {
                key: 'password_min_length',
                value: '8',
                description: 'Minimum password length requirement',
                category: 'SECURITY',
                dataType: 'NUMBER'
            },
            {
                key: 'require_2fa',
                value: 'false',
                description: 'Require two-factor authentication for admin users',
                category: 'SECURITY',
                dataType: 'BOOLEAN'
            },
            
            // Performance Settings
            {
                key: 'cache_duration',
                value: '3600',
                description: 'Cache duration in seconds',
                category: 'PERFORMANCE',
                dataType: 'NUMBER'
            },
            {
                key: 'max_concurrent_orders',
                value: '100',
                description: 'Maximum number of concurrent orders allowed',
                category: 'PERFORMANCE',
                dataType: 'NUMBER'
            },
            {
                key: 'api_rate_limit',
                value: '1000',
                description: 'API rate limit per hour per user',
                category: 'PERFORMANCE',
                dataType: 'NUMBER'
            },
            
            // Business Settings
            {
                key: 'default_order_timeout',
                value: '30',
                description: 'Default order timeout in minutes',
                category: 'BUSINESS',
                dataType: 'NUMBER'
            },
            {
                key: 'max_reservation_days',
                value: '30',
                description: 'Maximum days in advance for reservations',
                category: 'BUSINESS',
                dataType: 'NUMBER'
            },
            {
                key: 'delivery_fee',
                value: '4.99',
                description: 'Standard delivery fee amount in euros',
                category: 'BUSINESS',
                dataType: 'NUMBER'
            },
            {
                key: 'tax_rate',
                value: '0.08',
                description: 'Tax rate percentage (0.08 = 8%)',
                category: 'BUSINESS',
                dataType: 'NUMBER'
            },
            
            // Email Settings
            {
                key: 'smtp_server',
                value: 'smtp.gmail.com',
                description: 'SMTP server for sending emails',
                category: 'EMAIL',
                dataType: 'STRING'
            },
            {
                key: 'smtp_port',
                value: '587',
                description: 'SMTP server port',
                category: 'EMAIL',
                dataType: 'NUMBER'
            },
            {
                key: 'email_notifications',
                value: 'true',
                description: 'Enable/disable email notifications',
                category: 'EMAIL',
                dataType: 'BOOLEAN'
            }
        ];

        for (const setting of defaultSettings) {
            await prisma.systemSetting.create({
                data: setting
            });
        }

        console.log('✅ System settings seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding system settings:', error);
    }
};
