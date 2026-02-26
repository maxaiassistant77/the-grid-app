export interface GridConfig {
    apiKey: string;
    baseUrl?: string;
}
export interface TaskReport {
    description: string;
    complexity: 'simple' | 'medium' | 'complex' | 'epic';
    type?: string;
}
export interface StatsReport {
    tasks_completed?: number;
    skills_count?: number;
    memories_count?: number;
    current_streak?: number;
    sessions_count?: number;
    model?: string;
}
export interface SkillsReport {
    skills: Array<{
        name: string;
        category: string;
        description?: string;
    }>;
}
export interface MemoryReport {
    total_memories: number;
    memory_depth_days?: number;
}
export interface LeaderboardQuery {
    tab?: 'overall' | 'tasks' | 'streaks' | 'complexity';
    limit?: number;
}
export interface HeartbeatData {
    status?: 'online' | 'offline';
}
export declare class GridApiClient {
    private config;
    private baseUrl;
    constructor(config: GridConfig);
    private makeRequest;
    reportTask(data: TaskReport): Promise<unknown>;
    reportStats(data: StatsReport): Promise<unknown>;
    reportSkills(data: SkillsReport): Promise<unknown>;
    reportMemory(data: MemoryReport): Promise<unknown>;
    getMyStats(): Promise<unknown>;
    getLeaderboard(query?: LeaderboardQuery): Promise<unknown>;
    heartbeat(data?: HeartbeatData): Promise<unknown>;
}
//# sourceMappingURL=client.d.ts.map