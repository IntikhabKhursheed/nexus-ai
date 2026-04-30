import { Router } from 'express';
import { analyzeTasks, generateProjectPlan, getProductivityInsights, generateSubtasks } from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.get('/productivity', getProductivityInsights);
router.post('/analyze', analyzeTasks);
router.post('/generate-plan', generateProjectPlan);
router.post('/generate-subtasks', generateSubtasks);

export default router;
