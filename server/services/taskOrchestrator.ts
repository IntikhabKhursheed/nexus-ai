/**
 * Task Orchestrator - Main logic for AI-powered task generation
 * Coordinates blueprint detection, AI calls, and fallback logic
 */

import AIService from './aiService';
import { extractJSONFromAIResponse } from '../utils/parseAIResponse';
import { detectProjectType, getAnchorTasks } from './blueprint';

class TaskOrchestrator {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  async generateProjectPlan(goal: string): Promise<{
    success: boolean;
    source: 'ai' | 'fallback';
    attempts: number;
    tasks: Array<{
      title: string;
      description: string;
      priority: 'High' | 'Medium' | 'Low';
    }>;
    projectType: string;
    goal: string;
  }> {
    try {
      let attempts = 0;
      // Detect project type and get anchor tasks
      const projectType = detectProjectType(goal);
      const anchorTasks = getAnchorTasks(projectType);

      // Call AI for exact goal-specific tasks
      attempts += 1;
      const aiResponse = await this.aiService.generateTasks(goal, anchorTasks);
      
      // Parse AI response
      let tasks = extractJSONFromAIResponse(aiResponse);
      // Retry once if the model came back empty or malformed.
      if (!tasks || tasks.length < 3) {
        console.log('AI returned too few tasks, retrying with a stronger prompt...');
        attempts += 1;
        const retryResponse = await this.aiService.generateTasks(goal, anchorTasks);
        tasks = extractJSONFromAIResponse(retryResponse);
      }

      if (!tasks || tasks.length < 3) {
        console.log('AI tasks were still invalid after retry, using anchor task fallback');
        tasks = anchorTasks.slice(0, 5).map((task: string, index: number) => ({
          title: task,
          description: `Implement ${task.toLowerCase()} for ${goal}`,
          priority: index < 2 ? 'High' : index < 4 ? 'Medium' : 'Low'
        }));

        return {
          success: false,
          source: 'fallback',
          attempts,
          tasks,
          projectType,
          goal
        };
      }
      
      return {
        success: true,
        source: 'ai',
        attempts,
        tasks,
        projectType,
        goal
      };
      
    } catch (error) {
      console.error('Task orchestration failed:', error);
      
      // Emergency fallback: simple dynamic tasks
      const projectType = detectProjectType(goal);
      const anchorTasks = getAnchorTasks(projectType);
      
      const simpleTasks: Array<{
        title: string;
        description: string;
        priority: 'High' | 'Medium' | 'Low';
      }> = [
        {
          title: `Plan ${goal} architecture`,
          description: `Design technical architecture and system design for ${goal}`,
          priority: 'High'
        },
        {
          title: `Build ${goal} core features`,
          description: `Implement main functionality and core modules for ${goal}`,
          priority: 'High'
        },
        {
          title: `Setup ${goal} database`,
          description: `Configure and optimize database schema for ${goal}`,
          priority: 'High'
        },
        {
          title: `Implement ${goal} API`,
          description: `Build REST/GraphQL API endpoints for ${goal}`,
          priority: 'High'
        },
        {
          title: `Test ${goal} implementation`,
          description: `Create comprehensive test suite for ${goal}`,
          priority: 'Medium'
        },
        {
          title: `Deploy ${goal}`,
          description: `Setup CI/CD and deployment pipeline for ${goal}`,
          priority: 'Medium'
        },
        {
          title: `Document ${goal}`,
          description: `Create API documentation and technical guides for ${goal}`,
          priority: 'Low'
        }
      ];
      
      return {
        success: false,
        source: 'fallback',
        attempts: 1,
        tasks: simpleTasks,
        projectType: 'fallback',
        goal
      };
    }
  }
}

export default TaskOrchestrator;
