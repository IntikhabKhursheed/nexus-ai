/**
 * Blueprint system to detect project types and provide anchor tasks
 * Ensures consistent, relevant task generation for different project types
 */

const blueprints: Record<string, string[]> = {
  game: [
    "Design core game loop and state management",
    "Implement player movement and collision detection", 
    "Create rendering engine with sprites",
    "Build game physics system",
    "Add audio and sound effects",
    "Implement save/load game state",
    "Create main menu and UI overlay"
  ],
  
  saas: [
    "Set up project structure and development environment",
    "Design database schema for user management",
    "Implement JWT authentication and authorization",
    "Create RESTful API endpoints",
    "Build responsive frontend dashboard",
    "Add real-time notifications system",
    "Set up CI/CD deployment pipeline"
  ],

  portfolio: [
    "Create responsive layout and navigation structure",
    "Design personal branding and hero section",
    "Build project showcase grid with filtering",
    "Implement project detail pages with modal views",
    "Add contact form with validation",
    "Create about page with skills section",
    "Optimize for SEO and performance"
  ],

  ecommerce: [
    "Set up product database schema and models",
    "Build product catalog with search and filtering",
    "Implement shopping cart functionality",
    "Create user authentication and profiles",
    "Integrate payment gateway (Stripe/PayPal)",
    "Build order management system",
    "Add inventory tracking and alerts"
  ],

  chat: [
    "Set up WebSocket server for real-time messaging",
    "Implement user authentication and presence system",
    "Design chat interface with message bubbles",
    "Create message persistence and history",
    "Add typing indicators and read receipts",
    "Build private and group chat rooms",
    "Implement file sharing and emoji support"
  ],

  mobile: [
    "Set up React Native development environment",
    "Design app navigation and tab structure",
    "Implement native device feature integrations",
    "Create responsive UI components",
    "Build offline data synchronization",
    "Add push notifications system",
    "Prepare for app store deployment"
  ],

  api: [
    "Design RESTful API architecture",
    "Set up Express.js server structure",
    "Implement authentication middleware",
    "Create database models and migrations",
    "Build API documentation with Swagger",
    "Add rate limiting and caching",
    "Set up API monitoring and logging"
  ],

  default: [
    "Research requirements and create technical specifications",
    "Design core architecture and system components",
    "Implement basic functionality and features",
    "Create user interface and experience design",
    "Set up testing framework and write tests",
    "Deploy application and configure production environment",
    "Monitor performance and optimize system"
  ]
};

export function detectProjectType(goal: string): string {
  const goalLower = goal.toLowerCase();
  
  if (goalLower.includes('game') || goalLower.includes('gaming')) {
    return 'game';
  }
  if (goalLower.includes('saas') || goalLower.includes('software as a service')) {
    return 'saas';
  }
  if (goalLower.includes('portfolio') || goalLower.includes('showcase') || goalLower.includes('personal website')) {
    return 'portfolio';
  }
  if (goalLower.includes('ecommerce') || goalLower.includes('shop') || goalLower.includes('store')) {
    return 'ecommerce';
  }
  if (goalLower.includes('chat') || goalLower.includes('messaging')) {
    return 'chat';
  }
  if (goalLower.includes('mobile') || goalLower.includes('app') && (goalLower.includes('ios') || goalLower.includes('android'))) {
    return 'mobile';
  }
  if (goalLower.includes('api') || goalLower.includes('backend') || goalLower.includes('server')) {
    return 'api';
  }
  
  return 'default';
}

export function getAnchorTasks(projectType: string): string[] {
  return blueprints[projectType] || blueprints.default;
}
