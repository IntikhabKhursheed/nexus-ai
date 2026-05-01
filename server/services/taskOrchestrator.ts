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
    tasks: Array<{
      title: string;
      description: string;
      priority: 'High' | 'Medium' | 'Low';
    }>;
    projectType: string;
    goal: string;
  }> {
    try {
      // Detect project type and get anchor tasks
      const projectType = detectProjectType(goal);
      const anchorTasks = getAnchorTasks(projectType);

      // Call AI for exact goal-specific tasks
      const aiResponse = await this.aiService.generateTasks(goal, anchorTasks);
      
      // Parse AI response
      let tasks = extractJSONFromAIResponse(aiResponse);
      
      const isSpecific = (title: string) => {
        const goalWords = Array.from(new Set((goal.toLowerCase().match(/\b[\w']+\b/g) || []).map(w => w.trim())));
        const titleWords = new Set((title.toLowerCase().match(/\b[\w']+\b/g) || []).map(w => w.trim()));
        return goalWords.some(word => word && titleWords.has(word));
      };

      const tasksAreSpecific = tasks?.every(task => task.title && isSpecific(task.title));

      // Retry mechanism: if AI fails, returns invalid tasks, or generates generic tasks
      if (!tasks || tasks.length < 3 || !tasksAreSpecific) {
        console.log('AI returned generic tasks, retrying...');
        
        const retryResponse = await this.aiService.generateTasks(goal, anchorTasks);
        tasks = extractJSONFromAIResponse(retryResponse);
      }

      const retrySpecific = tasks?.every(task => task.title && isSpecific(task.title));
      if (!tasks || tasks.length < 3 || !retrySpecific) {
        throw new Error('AI returned generic tasks, retrying...');
      }
      
      // Final fallback: if still no valid tasks, use anchor tasks
      if (!tasks || tasks.length === 0) {
        console.log('Using anchor tasks as final fallback');
        tasks = anchorTasks.slice(0, 5).map((task: string, index: number) => ({
          title: task,
          description: `Implement ${task.toLowerCase()} for ${goal}`,
          priority: index < 2 ? 'High' : index < 4 ? 'Medium' : 'Low'
        }));
      }
      
      return {
        success: true,
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
        tasks: simpleTasks,
        projectType: 'fallback',
        goal
      };
    }
  }
}

export default TaskOrchestrator;
