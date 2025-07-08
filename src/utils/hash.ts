// import bycrypt for password hashing
import bcrypt from 'bcrypt';

// Function to hash a password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10; // Number of salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash the password
    return hashedPassword; // Return the hashed password
}

// Function to compare a plain password with a hashed password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    const isMatch = await bcrypt.compare(password, hashedPassword); // Compare passwords
    return isMatch; // Return true if match, false otherwise
}
