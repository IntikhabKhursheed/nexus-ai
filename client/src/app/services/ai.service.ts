import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AIAnalysis {
  analysis: string;
  timestamp: string;
}

export interface ProjectPlan {
  tasks: Array<{
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    subtasks?: string[];
  }>;
  goal: string;
  timestamp: string;
}

export interface ProductivityInsights {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  insight: string;
  timestamp: string;
}

export interface SubtaskResponse {
  subtasks: Array<{ title: string; completed: boolean }>;
  taskTitle: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private apiUrl = environment.apiUrl + '/ai';

  constructor(private http: HttpClient) {}

  analyzeTasks(): Observable<AIAnalysis> {
    return this.http.post<AIAnalysis>(`${this.apiUrl}/analyze`, {});
  }

  generateProjectPlan(goal: string): Observable<ProjectPlan> {
    return this.http.post<ProjectPlan>(`${this.apiUrl}/generate-plan`, { goal });
  }

  getProductivityInsights(): Observable<ProductivityInsights> {
    return this.http.get<ProductivityInsights>(`${this.apiUrl}/productivity`);
  }

  generateSubtasks(taskTitle: string): Observable<SubtaskResponse> {
    return this.http.post<SubtaskResponse>(`${this.apiUrl}/generate-subtasks`, { taskTitle });
  }
}
