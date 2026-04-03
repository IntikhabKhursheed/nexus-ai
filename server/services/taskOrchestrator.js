/**
 * Task Orchestrator - Main logic for AI-powered task generation
 * Coordinates blueprint detection, AI calls, and fallback logic
 */

const AIService = require('./aiService');
const { extractJSONFromAIResponse } = require('../utils/parseAIResponse');
const { detectProjectType, getAnchorTasks } = require('./blueprint');

class TaskOrchestrator {
  constructor() {
    this.aiService = new AIService();
  }

  async generateProjectPlan(goal) {
    try {
      // Detect project type and get anchor tasks
      const projectType = detectProjectType(goal);
      const anchorTasks = getAnchorTasks(projectType);

      // Call AI with anchor tasks
      const aiResponse = await this.aiService.generateTasks(goal, anchorTasks);
      
      // Parse AI response
      let tasks = extractJSONFromAIResponse(aiResponse);
      
      // Retry mechanism: if AI fails or returns invalid tasks
      if (!tasks || tasks.length < 3) {
        console.log('AI response invalid, retrying with stricter prompt...');
        
        const retryResponse = await this.aiService.generateTasks(goal, anchorTasks);
        tasks = extractJSONFromAIResponse(retryResponse);
      }
      
      // Final fallback: if still no valid tasks, use anchor tasks
      if (!tasks || tasks.length === 0) {
        console.log('Using anchor tasks as final fallback');
        tasks = anchorTasks.slice(0, 5).map((task, index) => ({
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
      const simpleTasks = [
        {
          title: `Plan ${goal} architecture`,
          description: `Design technical architecture for ${goal}`,
          priority: 'High'
        },
        {
          title: `Build ${goal} core features`,
          description: `Implement main functionality for ${goal}`,
          priority: 'High'
        },
        {
          title: `Test ${goal} implementation`,
          description: `Create test suite for ${goal}`,
          priority: 'Medium'
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

module.exports = TaskOrchestrator;
