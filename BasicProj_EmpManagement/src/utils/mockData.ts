import { Employee } from '../types';

export const generateMockEmployees = (count: number = 100): Employee[] => {
  const departments = ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance'];
  const roles = ['Junior', 'Senior', 'Lead', 'Manager', 'Director', 'Intern'];
  const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  const skillsList = ['React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'Excel', 'Communication', 'Leadership', 'Project Management', 'Git', 'Docker', 'AWS', 'Design', 'Writing'];

  const employees: Employee[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    
    let roleSuffix = 'Specialist';
    if (department === 'Engineering') roleSuffix = 'Developer';
    if (department === 'HR') roleSuffix = 'Coordinator';
    if (department === 'Sales') roleSuffix = 'Representative';
    
    const role = `${roles[Math.floor(Math.random() * roles.length)]} ${roleSuffix}`;
    
    // Generate 1-5 random unique skills
    const numSkills = Math.floor(Math.random() * 5) + 1;
    const empSkills = new Set<string>();
    while(empSkills.size < numSkills) {
        empSkills.add(skillsList[Math.floor(Math.random() * skillsList.length)]);
    }

    employees.push({
      id: (now + i).toString(), // Ensure unique IDs
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`, // Add i to email to ensure uniqueness
      phone: `555-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      department: department,
      role: role,
      experience: Math.floor(Math.random() * 20),
      skills: Array.from(empSkills)
    });
  }

  return employees;
};
