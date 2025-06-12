-- /database/init.sql
-- reVoAgent Advanced Database Schema
-- Three-Engine Architecture with Memory Integration

-- =============================================================================
-- DATABASE SETUP
-- =============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- CREATE EXTENSION IF NOT EXISTS "vector"; -- Uncomment if pgvector is available

-- =============================================================================
-- CORE SYSTEM TABLES
-- =============================================================================

-- System metrics and monitoring
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    disk_usage DECIMAL(5,2),
    network_usage DECIMAL(5,2),
    active_requests INTEGER,
    queue_length INTEGER,
    response_time DECIMAL(10,6),
    uptime DECIMAL(5,2),
    metadata JSONB DEFAULT '{}'
);

-- Three-Engine status tracking
CREATE TABLE engine_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    engine_type VARCHAR(50) NOT NULL, -- memory, parallel, creative
    status VARCHAR(20) DEFAULT 'active',
    metrics JSONB NOT NULL,
    performance_score DECIMAL(5,2),
    cost DECIMAL(10,4) DEFAULT 0.0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- AGENT MANAGEMENT TABLES
-- =============================================================================

-- Agent definitions and status
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL, -- code, workflow, knowledge, communication
    status VARCHAR(20) DEFAULT 'active', -- active, idle, error, maintenance
    capabilities JSONB DEFAULT '[]',
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agent performance tracking
CREATE TABLE agent_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) REFERENCES agents(agent_id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tasks_completed INTEGER DEFAULT 0,
    tasks_active INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2),
    average_response_time DECIMAL(10,6),
    memory_usage DECIMAL(10,2),
    performance_score DECIMAL(5,2),
    cost DECIMAL(10,4) DEFAULT 0.0
);

-- =============================================================================
-- TASK MANAGEMENT TABLES
-- =============================================================================

-- Task definitions and tracking
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(100) UNIQUE NOT NULL,
    task_type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    assigned_agents JSONB DEFAULT '[]',
    result TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    processing_time DECIMAL(10,6),
    cost DECIMAL(10,4) DEFAULT 0.0
);

-- Task execution history
CREATE TABLE task_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(100) REFERENCES tasks(task_id),
    agent_id VARCHAR(100) REFERENCES agents(agent_id),
    execution_order INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'running',
    result TEXT,
    error_message TEXT,
    processing_time DECIMAL(10,6),
    cost DECIMAL(10,4) DEFAULT 0.0
);

-- =============================================================================
-- MEMORY ENGINE TABLES
-- =============================================================================

-- Knowledge entities
CREATE TABLE memory_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id VARCHAR(100) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    -- embedding vector(1536), -- Uncomment if pgvector is available
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    source VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relationships between entities
CREATE TABLE memory_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_entity_id VARCHAR(100) REFERENCES memory_entities(entity_id),
    to_entity_id VARCHAR(100) REFERENCES memory_entities(entity_id),
    relationship_type VARCHAR(100) NOT NULL,
    strength DECIMAL(3,2) DEFAULT 1.0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Memory access patterns and analytics
CREATE TABLE memory_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id VARCHAR(100) REFERENCES memory_entities(entity_id),
    agent_id VARCHAR(100) REFERENCES agents(agent_id),
    access_type VARCHAR(50) NOT NULL, -- read, write, search
    query TEXT,
    relevance_score DECIMAL(5,4),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id VARCHAR(100),
    metadata JSONB DEFAULT '{}'
);

-- =============================================================================
-- COST ANALYTICS TABLES
-- =============================================================================

-- Cost tracking per operation
CREATE TABLE cost_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operation_type VARCHAR(100) NOT NULL, -- task, memory_search, agent_call
    operation_id VARCHAR(100),
    agent_id VARCHAR(100),
    model_provider VARCHAR(50), -- deepseek, llama, openai, anthropic
    model_name VARCHAR(100),
    tokens_input INTEGER DEFAULT 0,
    tokens_output INTEGER DEFAULT 0,
    cost DECIMAL(10,6) DEFAULT 0.0,
    processing_time DECIMAL(10,6),
    metadata JSONB DEFAULT '{}'
);

-- Monthly cost summaries
CREATE TABLE cost_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    total_operations INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(12,4) DEFAULT 0.0,
    local_processing_percentage DECIMAL(5,2) DEFAULT 0.0,
    cloud_fallback_percentage DECIMAL(5,2) DEFAULT 0.0,
    savings_vs_cloud DECIMAL(12,4) DEFAULT 0.0,
    breakdown JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, month)
);

-- =============================================================================
-- EXTERNAL INTEGRATIONS TABLES
-- =============================================================================

-- Integration configurations
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) UNIQUE NOT NULL, -- github, slack, jira
    status VARCHAR(20) DEFAULT 'disconnected',
    configuration JSONB DEFAULT '{}',
    credentials_encrypted TEXT,
    last_sync TIMESTAMP,
    sync_status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Integration activity logs
CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(100) REFERENCES integrations(service_name),
    action VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    request_data JSONB,
    response_data JSONB,
    error_message TEXT,
    processing_time DECIMAL(10,6),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- WORKFLOW MANAGEMENT TABLES
-- =============================================================================

-- Workflow definitions
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    definition JSONB NOT NULL, -- workflow steps and configuration
    status VARCHAR(20) DEFAULT 'active',
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_executed TIMESTAMP
);

-- Workflow executions
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id VARCHAR(100) UNIQUE NOT NULL,
    workflow_id VARCHAR(100) REFERENCES workflows(workflow_id),
    status VARCHAR(20) DEFAULT 'running',
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- =============================================================================
-- SECURITY AND AUDIT TABLES
-- =============================================================================

-- User sessions and authentication
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(200) UNIQUE NOT NULL,
    user_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Audit logs for security tracking
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(100),
    session_id VARCHAR(200),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- System metrics indexes
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp);
CREATE INDEX idx_engine_metrics_type_timestamp ON engine_metrics(engine_type, timestamp);

-- Agent indexes
CREATE INDEX idx_agents_category ON agents(category);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agent_performance_agent_timestamp ON agent_performance(agent_id, timestamp);

-- Task indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_task_executions_task_agent ON task_executions(task_id, agent_id);

-- Memory indexes
-- CREATE INDEX idx_memory_entities_embedding ON memory_entities USING ivfflat (embedding vector_cosine_ops); -- Uncomment if pgvector is available
CREATE INDEX idx_memory_entities_content_gin ON memory_entities USING gin(to_tsvector('english', content));
CREATE INDEX idx_memory_entities_tags ON memory_entities USING gin(tags);
CREATE INDEX idx_memory_relationships_from_to ON memory_relationships(from_entity_id, to_entity_id);

-- Cost analytics indexes
CREATE INDEX idx_cost_analytics_timestamp ON cost_analytics(timestamp);
CREATE INDEX idx_cost_analytics_provider ON cost_analytics(model_provider);
CREATE INDEX idx_cost_summaries_year_month ON cost_summaries(year, month);

-- Integration indexes
CREATE INDEX idx_integration_logs_service_timestamp ON integration_logs(service_name, timestamp);

-- Workflow indexes
CREATE INDEX idx_workflow_executions_workflow_status ON workflow_executions(workflow_id, status);

-- Security indexes
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);

-- =============================================================================
-- INITIAL DATA SETUP
-- =============================================================================

-- Insert initial agents
INSERT INTO agents (agent_id, name, category, capabilities) VALUES
-- Code Specialists
('code-analyst', 'Code Analyst', 'code', '["code_analysis", "syntax_checking", "best_practices"]'),
('debug-detective', 'Debug Detective', 'code', '["debugging", "error_detection", "troubleshooting"]'),
('security-scanner', 'Security Scanner', 'code', '["security_analysis", "vulnerability_detection", "compliance"]'),
('perf-optimizer', 'Performance Optimizer', 'code', '["performance_analysis", "optimization", "profiling"]'),
('doc-generator', 'Documentation Generator', 'code', '["documentation", "api_docs", "code_comments"]'),

-- Workflow Agents
('workflow-manager', 'Workflow Manager', 'workflow', '["workflow_design", "process_automation", "coordination"]'),
('devops-integration', 'DevOps Integration', 'workflow', '["ci_cd", "deployment", "infrastructure"]'),
('cicd-pipeline', 'CI/CD Pipeline', 'workflow', '["continuous_integration", "continuous_deployment", "testing"]'),
('test-coordinator', 'Testing Coordinator', 'workflow', '["test_automation", "quality_assurance", "validation"]'),
('deploy-manager', 'Deployment Manager', 'workflow', '["deployment", "release_management", "rollback"]'),

-- Knowledge Agents
('knowledge-coord', 'Knowledge Coordinator', 'knowledge', '["knowledge_management", "information_synthesis", "learning"]'),
('memory-synthesis', 'Memory Synthesis', 'knowledge', '["memory_integration", "pattern_recognition", "context_building"]'),
('pattern-recognition', 'Pattern Recognition', 'knowledge', '["pattern_analysis", "trend_detection", "insights"]'),
('learning-optimizer', 'Learning Optimizer', 'knowledge', '["adaptive_learning", "model_improvement", "optimization"]'),
('context-manager', 'Context Manager', 'knowledge', '["context_awareness", "session_management", "state_tracking"]'),

-- Communication Agents
('multi-agent-chat', 'Multi-Agent Chat', 'communication', '["chat_coordination", "message_routing", "collaboration"]'),
('slack-integration', 'Slack Integration', 'communication', '["slack_api", "notifications", "team_communication"]'),
('github-integration', 'GitHub Integration', 'communication', '["github_api", "repository_management", "code_collaboration"]'),
('jira-integration', 'JIRA Integration', 'communication', '["jira_api", "issue_tracking", "project_management"]'),
('notification-manager', 'Notification Manager', 'communication', '["notifications", "alerts", "messaging"]');

-- Insert initial engine metrics
INSERT INTO engine_metrics (engine_type, metrics, performance_score) VALUES
('memory', '{"entities": 1247893, "relationships": 892456, "speed": 95, "accuracy": 97.8}', 95.0),
('parallel', '{"workers": 8, "load": 45.2, "throughput": 150, "active_tasks": 0}', 92.0),
('creative', '{"patterns": 15, "novelty": 94.0, "innovation": 7.2, "discovered": 1247}', 89.0);

-- Insert initial cost summary
INSERT INTO cost_summaries (year, month, total_cost, local_processing_percentage, savings_vs_cloud) VALUES
(EXTRACT(YEAR FROM CURRENT_DATE), EXTRACT(MONTH FROM CURRENT_DATE), 21.00, 94.7, 2847.00);