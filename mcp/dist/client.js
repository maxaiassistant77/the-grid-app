import fetch from 'node-fetch';
export class GridApiClient {
    config;
    baseUrl;
    constructor(config) {
        this.config = config;
        this.baseUrl = config.baseUrl || 'https://the-grid-app.vercel.app/api';
    }
    async makeRequest(endpoint, method = 'GET', body) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
        };
        try {
            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            return await response.json();
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Grid API request failed: ${error.message}`);
            }
            throw new Error('Grid API request failed with unknown error');
        }
    }
    async reportTask(data) {
        // Convert task report to the stats format expected by the API
        const complexity_breakdown = {};
        complexity_breakdown[data.complexity] = 1;
        const statsData = {
            tasks_completed: 1,
            complexity_breakdown,
            activities: [{
                    type: 'task',
                    complexity: data.complexity,
                    description: data.description,
                    metadata: data.type ? { type: data.type } : undefined
                }]
        };
        return await this.makeRequest('/agent/stats', 'POST', statsData);
    }
    async reportStats(data) {
        return await this.makeRequest('/agent/stats', 'POST', data);
    }
    async reportSkills(data) {
        return await this.makeRequest('/agent/skills', 'POST', data);
    }
    async reportMemory(data) {
        return await this.makeRequest('/agent/memory', 'POST', data);
    }
    async getMyStats() {
        // This would need the agent ID, which we can extract from the API key validation
        // For now, we'll make a heartbeat call to get our agent info, then fetch profile
        const heartbeatResponse = await this.makeRequest('/agent/heartbeat', 'POST', {});
        const agentId = heartbeatResponse?.agent_id;
        if (!agentId) {
            throw new Error('Could not determine agent ID from API key');
        }
        return await this.makeRequest(`/agent/profile/${agentId}`, 'GET');
    }
    async getLeaderboard(query = {}) {
        const params = new URLSearchParams();
        if (query.tab)
            params.set('tab', query.tab);
        if (query.limit)
            params.set('limit', query.limit.toString());
        const endpoint = `/leaderboard?${params.toString()}`;
        return await this.makeRequest(endpoint, 'GET');
    }
    async heartbeat(data = {}) {
        return await this.makeRequest('/agent/heartbeat', 'POST', {
            metadata: data
        });
    }
}
//# sourceMappingURL=client.js.map