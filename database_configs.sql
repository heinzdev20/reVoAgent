-- database_configs.sql
-- Database initialization script for reVoAgent + Cognee Memory Integration

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS revoagent;
CREATE SCHEMA IF NOT EXISTS cognee;
CREATE SCHEMA IF NOT EXISTS memory;

-- Set search path
SET search_path TO revoagent, cognee, memory, public;

-- Create users table
CREATE TABLE IF NOT EXISTS revoagent.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS revoagent.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES revoagent.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS revoagent.agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    configuration JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS revoagent.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES revoagent.users(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS revoagent.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES revoagent.conversations(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES revoagent.agents(id),
    message_type VARCHAR(50) NOT NULL, -- 'user', 'agent', 'system'
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cognee Memory Tables
CREATE TABLE IF NOT EXISTS cognee.knowledge_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding_vector FLOAT8[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);

-- Create knowledge relationships table
CREATE TABLE IF NOT EXISTS cognee.knowledge_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_entity_id UUID REFERENCES cognee.knowledge_entities(id) ON DELETE CASCADE,
    target_entity_id UUID REFERENCES cognee.knowledge_entities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    weight FLOAT DEFAULT 1.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(source_entity_id, target_entity_id, relationship_type)
);

-- Create memory sessions table
CREATE TABLE IF NOT EXISTS memory.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES revoagent.users(id) ON DELETE CASCADE,
    context JSONB DEFAULT '{}',
    statistics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memory interactions table
CREATE TABLE IF NOT EXISTS memory.interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES memory.sessions(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES revoagent.agents(id),
    interaction_type VARCHAR(100) NOT NULL,
    input_text TEXT,
    output_text TEXT,
    memory_context JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agent memory table
CREATE TABLE IF NOT EXISTS memory.agent_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id UUID REFERENCES revoagent.agents(id) ON DELETE CASCADE,
    memory_type VARCHAR(100) NOT NULL,
    memory_key VARCHAR(255) NOT NULL,
    memory_value JSONB NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(agent_id, memory_type, memory_key)
);

-- Create patterns table
CREATE TABLE IF NOT EXISTS memory.patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_type VARCHAR(100) NOT NULL,
    pattern_name VARCHAR(255) NOT NULL,
    pattern_data JSONB NOT NULL,
    frequency INTEGER DEFAULT 1,
    confidence FLOAT DEFAULT 0.0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create external integrations table
CREATE TABLE IF NOT EXISTS revoagent.external_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_type VARCHAR(100) NOT NULL, -- 'github', 'slack', 'jira'
    integration_name VARCHAR(255) NOT NULL,
    configuration JSONB NOT NULL,
    credentials JSONB NOT NULL, -- Encrypted
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create integration memory table
CREATE TABLE IF NOT EXISTS memory.integration_memory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES revoagent.external_integrations(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL,
    external_type VARCHAR(100) NOT NULL, -- 'repository', 'channel', 'ticket'
    memory_data JSONB NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(integration_id, external_id, external_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON revoagent.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON revoagent.users(username);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON revoagent.sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON revoagent.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON revoagent.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON revoagent.conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON revoagent.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON revoagent.messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON revoagent.messages(created_at);

-- Cognee indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_entities_type ON cognee.knowledge_entities(entity_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_entities_id ON cognee.knowledge_entities(entity_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_entities_created_at ON cognee.knowledge_entities(created_at);
CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_source ON cognee.knowledge_relationships(source_entity_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_target ON cognee.knowledge_relationships(target_entity_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_type ON cognee.knowledge_relationships(relationship_type);

-- Memory indexes
CREATE INDEX IF NOT EXISTS idx_memory_sessions_session_id ON memory.sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_memory_sessions_user_id ON memory.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_interactions_session_id ON memory.interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_memory_interactions_agent_id ON memory.interactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_memory_interactions_created_at ON memory.interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_memory_agent_id ON memory.agent_memory(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_memory_type ON memory.agent_memory(memory_type);
CREATE INDEX IF NOT EXISTS idx_agent_memory_key ON memory.agent_memory(memory_key);
CREATE INDEX IF NOT EXISTS idx_patterns_type ON memory.patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_name ON memory.patterns(pattern_name);
CREATE INDEX IF NOT EXISTS idx_patterns_frequency ON memory.patterns(frequency);

-- GIN indexes for JSONB and array columns
CREATE INDEX IF NOT EXISTS idx_knowledge_entities_metadata_gin ON cognee.knowledge_entities USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_knowledge_relationships_metadata_gin ON cognee.knowledge_relationships USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_memory_sessions_context_gin ON memory.sessions USING GIN(context);
CREATE INDEX IF NOT EXISTS idx_memory_interactions_context_gin ON memory.interactions USING GIN(memory_context);
CREATE INDEX IF NOT EXISTS idx_agent_memory_value_gin ON memory.agent_memory USING GIN(memory_value);
CREATE INDEX IF NOT EXISTS idx_agent_memory_tags_gin ON memory.agent_memory USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_patterns_data_gin ON memory.patterns USING GIN(pattern_data);
CREATE INDEX IF NOT EXISTS idx_patterns_tags_gin ON memory.patterns USING GIN(tags);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_entities_content_fts ON cognee.knowledge_entities USING GIN(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_messages_content_fts ON revoagent.messages USING GIN(to_tsvector('english', content));

-- Insert default agents
INSERT INTO revoagent.agents (agent_type, name, description, configuration) VALUES
('code_analyst', 'Code Analyst', 'Specialized in code analysis and pattern recognition', '{"memory_enabled": true, "tags": ["code_analysis", "patterns", "quality"]}'),
('debug_detective', 'Debug Detective', 'Expert in debugging and error resolution', '{"memory_enabled": true, "tags": ["debugging", "errors", "solutions"]}'),
('workflow_manager', 'Workflow Manager', 'Manages workflows and process optimization', '{"memory_enabled": true, "tags": ["workflows", "processes", "automation"]}'),
('knowledge_coordinator', 'Knowledge Coordinator', 'Coordinates knowledge across agents', '{"memory_enabled": true, "tags": ["coordination", "knowledge", "synthesis"]}'),
('security_auditor', 'Security Auditor', 'Security analysis and compliance', '{"memory_enabled": true, "tags": ["security", "compliance", "audit"]}'),
('performance_optimizer', 'Performance Optimizer', 'Performance tuning and optimization', '{"memory_enabled": true, "tags": ["performance", "optimization", "tuning"]}')
ON CONFLICT DO NOTHING;

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON revoagent.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON revoagent.agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON revoagent.conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_entities_updated_at BEFORE UPDATE ON cognee.knowledge_entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_memory_sessions_updated_at BEFORE UPDATE ON memory.sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_memory_updated_at BEFORE UPDATE ON memory.agent_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patterns_updated_at BEFORE UPDATE ON memory.patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_external_integrations_updated_at BEFORE UPDATE ON revoagent.external_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_memory_updated_at BEFORE UPDATE ON memory.integration_memory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW memory.agent_statistics AS
SELECT 
    a.id,
    a.agent_type,
    a.name,
    COUNT(DISTINCT i.id) as total_interactions,
    COUNT(DISTINCT am.id) as memory_entries,
    AVG((i.performance_metrics->>'generation_time')::float) as avg_generation_time,
    MAX(i.created_at) as last_interaction
FROM revoagent.agents a
LEFT JOIN memory.interactions i ON a.id = i.agent_id
LEFT JOIN memory.agent_memory am ON a.id = am.agent_id
WHERE a.is_active = true
GROUP BY a.id, a.agent_type, a.name;

CREATE OR REPLACE VIEW memory.session_summary AS
SELECT 
    s.id,
    s.session_id,
    s.user_id,
    COUNT(DISTINCT i.id) as total_interactions,
    COUNT(DISTINCT i.agent_id) as agents_used,
    MIN(i.created_at) as first_interaction,
    MAX(i.created_at) as last_interaction,
    s.statistics
FROM memory.sessions s
LEFT JOIN memory.interactions i ON s.id = i.session_id
GROUP BY s.id, s.session_id, s.user_id, s.statistics;

-- Grant permissions
GRANT USAGE ON SCHEMA revoagent TO revoagent;
GRANT USAGE ON SCHEMA cognee TO revoagent;
GRANT USAGE ON SCHEMA memory TO revoagent;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA revoagent TO revoagent;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cognee TO revoagent;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA memory TO revoagent;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA revoagent TO revoagent;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA cognee TO revoagent;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA memory TO revoagent;

-- Create admin user (password should be changed in production)
INSERT INTO revoagent.users (username, email, password_hash, is_superuser) VALUES
('admin', 'admin@revoagent.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6QJw.2Qjaa', true) -- password: admin123
ON CONFLICT (email) DO NOTHING;

COMMIT;