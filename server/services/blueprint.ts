/**
 * Blueprint system to detect project types and provide anchor tasks
 * Ensures consistent, relevant task generation for different project types
 */

const blueprints: Record<string, string[]> = {
  game: [
    "Design core game loop and state management",
    "Implement player movement and collision detection",
    "Create rendering engine with sprites and assets",
    "Build game physics and collision handling",
    "Add audio, sound effects, and game feedback",
    "Implement save/load game state",
    "Create main menu and UI overlay"
  ],

  saas: [
    "Set up project structure and development environment",
    "Design database schema for user management and subscriptions",
    "Implement JWT authentication and authorization",
    "Create RESTful or GraphQL API endpoints",
    "Build responsive frontend dashboard",
    "Add usage analytics and real-time notifications",
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
    "Set up product database schema and inventory models",
    "Build product catalog with search, filtering, and categories",
    "Implement shopping cart and checkout flow",
    "Integrate payment gateway and order processing",
    "Add customer accounts and order history",
    "Build inventory tracking and stock alerts",
    "Implement promotions, coupons, and pricing rules"
  ],

  chat: [
    "Set up WebSocket or real-time messaging backend",
    "Implement user authentication and presence system",
    "Design chat interface with message bubbles",
    "Create message persistence and history",
    "Add typing indicators and read receipts",
    "Build private and group chat rooms",
    "Implement file sharing and emoji support"
  ],

  mobile: [
    "Set up mobile development environment and navigation",
    "Design adaptive mobile UI components",
    "Implement native device integrations",
    "Build offline data synchronization",
    "Add push notifications and background updates",
    "Optimize performance for mobile devices",
    "Prepare for App Store and Play Store deployment"
  ],

  api: [
    "Design RESTful or GraphQL API architecture",
    "Set up Express.js server structure and routing",
    "Implement authentication middleware and API security",
    "Create database models and migrations",
    "Build API documentation and developer guides",
    "Add rate limiting and caching",
    "Set up API monitoring and logging"
  ],

  health: [
    "Design patient record schema and health data models",
    "Implement appointment booking and scheduling workflows",
    "Create medical API integration for lab results and prescriptions",
    "Build user authentication and HIPAA-style privacy controls",
    "Add patient dashboards and health metrics tracking",
    "Implement notifications for appointments and medication reminders",
    "Secure sensitive medical data and audit access"
  ],

  blog: [
    "Design blog content model and author profiles",
    "Build article listing, search, and categorization",
    "Implement rich text editor and SEO metadata",
    "Create commenting and social sharing features",
    "Add author dashboard and publishing workflow",
    "Implement subscriber sign-up and newsletter integration",
    "Optimize performance and content delivery"
  ],

  default: [
    "Research requirements and create technical specifications",
    "Design core architecture and system components",
    "Implement the most important feature set",
    "Create user interface and experience design",
    "Set up testing framework and write tests",
    "Deploy application and configure production environment",
    "Monitor performance and optimize system"
  ]
};

export function detectProjectType(goal: string): string {
  const goalLower = goal.toLowerCase();

  if (goalLower.includes('health') || goalLower.includes('medical') || goalLower.includes('clinic') || goalLower.includes('fitness')) {
    return 'health';
  }
  if (goalLower.includes('ecommerce') || goalLower.includes('shop') || goalLower.includes('store') || goalLower.includes('marketplace')) {
    return 'ecommerce';
  }
  if (goalLower.includes('blog') || goalLower.includes('publication') || goalLower.includes('content') || goalLower.includes('newsletter')) {
    return 'blog';
  }
  if (goalLower.includes('game') || goalLower.includes('gaming')) {
    return 'game';
  }
  if (goalLower.includes('saas') || goalLower.includes('software as a service') || goalLower.includes('platform')) {
    return 'saas';
  }
  if (goalLower.includes('portfolio') || goalLower.includes('showcase') || goalLower.includes('personal website')) {
    return 'portfolio';
  }
  if (goalLower.includes('chat') || goalLower.includes('messaging') || goalLower.includes('chatbot')) {
    return 'chat';
  }
  if (goalLower.includes('mobile') || goalLower.includes('android') || goalLower.includes('ios') || goalLower.includes('app')) {
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
