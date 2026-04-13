import { Employee } from '../types';

const STORAGE_KEY = 'employees';
const DELAY_MS = 800;

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Simulate fetching from our "backend" (localStorage)
  fetchEmployees: async (): Promise<Employee[]> => {
    await delay(DELAY_MS);
    // Simulate random error (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('500: Internal Server Error (Simulated)');
    }
    
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // Real fetch from external API
  fetchExternalEmployees: async (): Promise<Employee[]> => {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) throw new Error('Failed to fetch from external API');
    const users = await response.json();
    
    // Map external user data to our Employee format
    return users.map((user: any) => ({
      id: crypto.randomUUID(), 
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: 'Engineering', 
      role: 'Software Engineer', 
      experience: Math.floor(Math.random() * 10) + 1, 
      skills: ['TypeScript', 'React', 'Rest API']
    }));
  },

  addEmployee: async (employee: Employee): Promise<Employee> => {
    await delay(DELAY_MS);
    const data = localStorage.getItem(STORAGE_KEY);
    const employees = data ? JSON.parse(data) : [];
    const newEmployees = [...employees, employee];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEmployees));
    return employee;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await delay(DELAY_MS);
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const employees = JSON.parse(data);
      const newEmployees = employees.filter((e: Employee) => e.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEmployees));
    }
  }
};
