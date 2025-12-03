-- MySQL Schema for TooFlow v2
-- Based on Supabase types in lib/supabase.ts

SET FOREIGN_KEY_CHECKS = 0;

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50),
    priority VARCHAR(50),
    color VARCHAR(20),
    start_date DATE,
    end_date DATE,
    owner_id VARCHAR(36) NOT NULL,
    created_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES profiles(id)
);

-- Project Members Table
CREATE TABLE IF NOT EXISTS project_members (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    project_id VARCHAR(36) NOT NULL,
    assignee_id VARCHAR(36),
    creator_id VARCHAR(36),
    assigned_to VARCHAR(36), -- Legacy/Duplicate field? Keeping for compatibility
    created_by VARCHAR(36), -- Legacy/Duplicate field? Keeping for compatibility
    due_date DATE,
    completed_at TIMESTAMP NULL,
    estimated_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (creator_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    `read` BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;
