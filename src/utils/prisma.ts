// Import PrismaClient from the Prisma package
import { PrismaClient } from '@prisma/client'

// Instantiate a new PrismaClient instance
const prisma = new PrismaClient()

// Export the Prisma client for use throughout the app
export default prisma
