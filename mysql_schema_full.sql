-- Esquema Completo para Migración a MySQL (TooFlow v2)
-- Basado en análisis del código frontend y requerimientos funcionales

-- 1. Usuarios y Perfiles
CREATE TABLE profiles (
    id VARCHAR(36) PRIMARY KEY, -- UUID from Auth
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    full_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user',
    last_seen DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Configuración de Usuario
CREATE TABLE user_settings (
    user_id VARCHAR(36) PRIMARY KEY,
    theme VARCHAR(20) DEFAULT 'light',
    notifications_email BOOLEAN DEFAULT TRUE,
    notifications_push BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'es',
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- 3. Proyectos
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active', -- active, archived, completed
    priority VARCHAR(50) DEFAULT 'medium',
    color VARCHAR(50),
    start_date DATE,
    end_date DATE,
    owner_id VARCHAR(36) NOT NULL,
    created_by VARCHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES profiles(id),
    FOREIGN KEY (created_by) REFERENCES profiles(id)
);

-- 4. Miembros del Proyecto
CREATE TABLE project_members (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member, viewer
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_member (project_id, user_id)
);

-- 5. Tareas
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo', -- todo, in_progress, review, done
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
    project_id VARCHAR(36) NOT NULL,
    assignee_id VARCHAR(36),
    creator_id VARCHAR(36),
    due_date DATETIME,
    completed_at DATETIME,
    estimated_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2),
    position INT DEFAULT 0, -- Para ordenamiento Kanban/Lista
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES profiles(id),
    FOREIGN KEY (creator_id) REFERENCES profiles(id)
);

-- 6. Subtareas
CREATE TABLE subtasks (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    position INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 7. Comentarios (Polimórfico o tablas separadas, aquí separadas por claridad)
CREATE TABLE task_comments (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);

CREATE TABLE project_comments (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- 8. Archivos Adjuntos
CREATE TABLE attachments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    file_type VARCHAR(100),
    size_bytes BIGINT,
    uploaded_by VARCHAR(36) NOT NULL,
    task_id VARCHAR(36), -- Puede ser NULL si es de proyecto
    project_id VARCHAR(36), -- Puede ser NULL si es solo de tarea (aunque tarea pertenece a proyecto)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES profiles(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- 9. Historial de Actividad (Audit Log)
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- task, project, comment
    entity_id VARCHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL, -- created, updated, deleted, status_changed
    details JSON, -- Para guardar valores anteriores/nuevos
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- 10. Notificaciones
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL, -- mention, assignment, due_date, reply
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- 11. Recordatorios
CREATE TABLE reminders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36) NOT NULL,
    remind_at DATETIME NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 12. Chat del Equipo
CREATE TABLE chat_channels (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255), -- NULL para chats directos
    type VARCHAR(20) DEFAULT 'public', -- public, private, direct
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_members (
    channel_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (channel_id, user_id),
    FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    channel_id VARCHAR(36) NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES profiles(id)
);

-- Índices para optimización
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_chat_messages_channel ON chat_messages(channel_id, created_at);
