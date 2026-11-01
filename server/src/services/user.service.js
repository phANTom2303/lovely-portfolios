import bcrypt from "bcrypt";
import * as userRepo from "#repositories/user.repo.js"; 
import { NotFoundError } from "#src/lib/errors.js";

export const getUserById = async (id) => {
    const user = await userRepo.findById(id);
    return user;
};

export const getUserByEmail = async (email) => {
    const user = await userRepo.findByEmail(email);
    return user;
};

export const createUser = async (userData) => {
    const { name, email, password, phone_no } = userData;

    const hashUp = 10;
    const hashedPassword = await bcrypt.hash(password, hashUp);

    const createdUser = await userRepo.createUser({
        name,
        email,
        password: hashedPassword,
        phone_no,
    });

    return createdUser;
};

export const updateUser = async (id, fields) => {
    const updatedUser = await userRepo.update(id, fields);
    
    if (!updatedUser) {
        throw new NotFoundError(`User with id "${id}" not found or no changes made`);
    }
    
    return updatedUser;
};

export const deleteUser = async (id) => {
    const deletedUser = await userRepo.remove(id);
    
    if (!deletedUser) {
        throw new NotFoundError(`User with id "${id}" not found`);
    }
    
    return deletedUser;
};