import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Task, TaskService, CreateTaskRequest } from '../services/task.service';
import { AuthService } from '../services/auth.service';
import { AIService, ProjectPlan, ProductivityInsights, SubtaskResponse } from '../services/ai.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  tasks: Task[] = [];
  isLoading = false;
  error = '';
  projectPlan: ProjectPlan | null = null;
  isGeneratingPlan = false;
  goalInput = '';
  showAddTaskModal = false;
  productivityInsights: ProductivityInsights | null = null;
  isLoadingInsights = false;
  
  newTask: CreateTaskRequest = {
    title: '',
    description: '',
    priority: 'medium'
  };

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private router: Router,
    private aiService: AIService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadProductivityInsights();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.error = '';
    
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.isLoading = false;
        // Refresh insights after tasks are loaded
        this.loadProductivityInsights();
      },
      error: (err) => {
        this.error = 'Failed to load tasks';
        this.isLoading = false;
      }
    });
  }

  loadProductivityInsights(): void {
    this.isLoadingInsights = true;
    
    this.aiService.getProductivityInsights().subscribe({
      next: (insights) => {
        this.productivityInsights = insights;
        this.isLoadingInsights = false;
      },
      error: (err) => {
        console.error('Failed to load productivity insights:', err);
        this.isLoadingInsights = false;
      }
    });
  }

  generateProjectPlan(): void {
    if (!this.goalInput.trim()) return;

    this.isGeneratingPlan = true;
    this.error = '';
    
    this.aiService.generateProjectPlan(this.goalInput).subscribe({
      next: (plan) => {
        this.projectPlan = plan;
        this.isGeneratingPlan = false;
        
        // Automatically create tasks from generated plan
        plan.tasks.forEach(generatedTask => {
          const task = {
            title: generatedTask.title,
            description: generatedTask.description,
            priority: generatedTask.priority.toLowerCase() as 'high' | 'medium' | 'low',
            subtasks: generatedTask.subtasks || []
          };
          
          this.taskService.createTask(task).subscribe({
            next: (createdTask) => {
              this.tasks.unshift(createdTask);
            },
            error: (err) => {
              console.error('Failed to create generated task:', err);
            }
          });
        });
        
        // Clear the goal input and plan
        this.goalInput = '';
        this.projectPlan = null;
      },
      error: (err) => {
        this.error = 'Failed to generate project plan';
        this.isGeneratingPlan = false;
      }
    });
  }

  openAddTaskModal(): void {
    this.showAddTaskModal = true;
  }

  closeAddTaskModal(): void {
    this.showAddTaskModal = false;
    this.newTask = { title: '', description: '', priority: 'medium' };
  }

  addTask(): void {
    if (!this.newTask.title.trim()) return;

    this.taskService.createTask(this.newTask).subscribe({
      next: (task) => {
        this.tasks.unshift(task);
        this.closeAddTaskModal();
      },
      error: (err) => {
        this.error = 'Failed to create task';
      }
    });
  }

  updateTaskStatus(task: Task): void {
    const updatedStatus = task.status === 'completed' ? 'pending' : 'completed';
    const updatedTask = { ...task, status: updatedStatus as 'pending' | 'completed' };
    
    this.taskService.updateTask(task._id, { status: updatedStatus }).subscribe({
      next: () => {
        const index = this.tasks.findIndex(t => t._id === task._id);
        if (index !== -1) {
          this.tasks[index] = { ...this.tasks[index], status: updatedStatus };
        }
      },
      error: (err) => {
        this.error = 'Failed to update task';
      }
    });
  }

  deleteTask(taskId: string): void {
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t._id !== taskId);
      },
      error: (err) => {
        this.error = 'Failed to delete task';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  toggleTaskExpansion(task: Task): void {
    task.isExpanded = !task.isExpanded;
  }

  generateSubtasks(task: Task): void {
    if (!task.subtasks || task.subtasks.length === 0) {
      this.aiService.generateSubtasks(task.title).subscribe({
        next: (response: SubtaskResponse) => {
          task.subtasks = response.subtasks.map((st: { title: string; completed: boolean }) => st.title);
        },
        error: (err: any) => {
          console.error('Failed to generate subtasks:', err);
        }
      });
    }
  }
}
