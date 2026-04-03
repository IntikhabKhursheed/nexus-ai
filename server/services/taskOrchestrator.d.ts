declare module '../services/taskOrchestrator.js' {
  class TaskOrchestrator {
    generateProjectPlan(goal: string): Promise<{
      success: boolean;
      tasks: Array<{
        title: string;
        description: string;
        priority: 'High' | 'Medium' | 'Low';
      }>;
      projectType: string;
      goal: string;
    }>;
  }
  export = TaskOrchestrator;
}
