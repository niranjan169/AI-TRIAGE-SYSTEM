import { supabase, IS_DEMO_MODE } from '../lib/supabase';

// Register new user
export const registerUser = async (userData) => {
    if (IS_DEMO_MODE) {
        // Demo mode - use localStorage
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

        const userExists = existingUsers.find(u => u.email === userData.email);
        if (userExists) {
            throw new Error('Email already registered');
        }

        const newUser = {
            id: `local_${Date.now()}`,
            ...userData,
            created_at: new Date().toISOString()
        };

        existingUsers.push(newUser);
        localStorage.setItem('users', JSON.stringify(existingUsers));

        return newUser;
    }

    // Database mode - use Supabase
    // Check if user exists
    const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single();

    if (existingUser) {
        throw new Error('Email already registered');
    }

    // Insert new user
    const { data, error } = await supabase
        .from('users')
        .insert([{
            email: userData.email,
            password: userData.password, // In production, hash this!
            name: userData.name,
            role: userData.role
        }])
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Login user
export const loginUser = async (email, password, role) => {
    if (IS_DEMO_MODE) {
        // Demo mode - use localStorage
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

        const user = existingUsers.find(
            u => u.email === email && u.password === password
        );

        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (user.role !== role) {
            throw new Error(`This account is registered as ${user.role}`);
        }

        return user;
    }

    // Database mode - use Supabase
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password) // In production, compare hashed passwords!
        .single();

    if (error || !data) {
        throw new Error('Invalid email or password');
    }

    if (data.role !== role) {
        throw new Error(`This account is registered as ${data.role}`);
    }

    // Update last login
    await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

    return data;
};

// Get user by email
export const getUserByEmail = async (email) => {
    if (IS_DEMO_MODE) {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        return existingUsers.find(u => u.email === email);
    }

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

    if (error) return null;
    return data;
};

// Get all users (admin only)
export const getAllUsers = async () => {
    if (IS_DEMO_MODE) {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role, created_at, last_login')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

// Update user
export const updateUser = async (userId, updates) => {
    if (IS_DEMO_MODE) {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const index = existingUsers.findIndex(u => u.id === userId);

        if (index !== -1) {
            existingUsers[index] = { ...existingUsers[index], ...updates };
            localStorage.setItem('users', JSON.stringify(existingUsers));
            return existingUsers[index];
        }
        return null;
    }

    const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Delete user
export const deleteUser = async (userId) => {
    if (IS_DEMO_MODE) {
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const filtered = existingUsers.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filtered));
        return true;
    }

    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

    if (error) throw error;
    return true;
};
