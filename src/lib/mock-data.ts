export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: "internship" | "trainee" | "entry-level";
  industry: string;
  skills: string[];
  salary?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  deadline: string;
  postedDate: string;
  remote: boolean;
  applicants: number;
}

export const MOCK_JOBS: Job[] = [
  {
    id: "1",
    title: "Software Engineering Intern",
    company: "Safaricom PLC",
    companyLogo: "S",
    location: "Nairobi",
    type: "internship",
    industry: "Technology",
    skills: ["JavaScript", "React", "Node.js", "Git"],
    salary: "KES 40,000 - 60,000",
    description: "Join Safaricom's engineering team to build scalable digital solutions that impact millions of Kenyans. You'll work alongside senior engineers on M-PESA and digital services.",
    requirements: ["BSc in Computer Science or related field", "Knowledge of JavaScript/TypeScript", "Understanding of REST APIs", "Currently enrolled or recently graduated"],
    responsibilities: ["Develop and maintain web applications", "Write clean, testable code", "Participate in code reviews", "Collaborate with cross-functional teams"],
    deadline: "2026-04-15",
    postedDate: "2026-03-01",
    remote: false,
    applicants: 142,
  },
  {
    id: "2",
    title: "Graduate Trainee - Finance",
    company: "Equity Bank",
    companyLogo: "E",
    location: "Nairobi",
    type: "trainee",
    industry: "Banking & Finance",
    skills: ["Financial Analysis", "Excel", "Accounting", "Communication"],
    salary: "KES 55,000 - 75,000",
    description: "Equity Bank's prestigious Graduate Trainee Program offers a comprehensive 12-month rotational experience across key banking departments.",
    requirements: ["Bachelor's degree in Finance, Accounting or Business", "Minimum Upper Second Class Honours", "Graduated within the last 2 years", "Strong analytical skills"],
    responsibilities: ["Rotate through banking departments", "Analyze financial reports", "Support customer relationship management", "Prepare presentations for senior management"],
    deadline: "2026-04-30",
    postedDate: "2026-03-05",
    remote: false,
    applicants: 287,
  },
  {
    id: "3",
    title: "Junior Data Analyst",
    company: "Kenya Power",
    companyLogo: "K",
    location: "Nairobi",
    type: "entry-level",
    industry: "Energy",
    skills: ["Python", "SQL", "Power BI", "Statistics"],
    salary: "KES 50,000 - 70,000",
    description: "Analyze energy consumption data and generate insights to improve power distribution efficiency across Kenya.",
    requirements: ["Degree in Statistics, Mathematics or Computer Science", "Proficiency in Python and SQL", "Experience with data visualization tools", "Less than 2 years experience"],
    responsibilities: ["Clean and analyze large datasets", "Create dashboards and reports", "Identify trends in power consumption", "Present findings to stakeholders"],
    deadline: "2026-05-10",
    postedDate: "2026-03-02",
    remote: false,
    applicants: 98,
  },
  {
    id: "4",
    title: "Marketing Intern",
    company: "Jumia Kenya",
    companyLogo: "J",
    location: "Nairobi",
    type: "internship",
    industry: "E-Commerce",
    skills: ["Digital Marketing", "Social Media", "Content Creation", "Analytics"],
    description: "Help drive Jumia's marketing campaigns across digital channels. You'll gain hands-on experience in e-commerce marketing.",
    requirements: ["Pursuing or completed degree in Marketing or Communications", "Strong writing skills", "Familiarity with social media platforms", "Creative thinking"],
    responsibilities: ["Create social media content", "Assist in campaign planning", "Monitor marketing analytics", "Support email marketing campaigns"],
    deadline: "2026-04-20",
    postedDate: "2026-03-04",
    remote: true,
    applicants: 203,
  },
  {
    id: "5",
    title: "Graduate Civil Engineer",
    company: "China Wu Yi",
    companyLogo: "C",
    location: "Mombasa",
    type: "entry-level",
    industry: "Construction",
    skills: ["AutoCAD", "Project Management", "Structural Analysis", "MS Project"],
    salary: "KES 60,000 - 85,000",
    description: "Join one of Kenya's largest infrastructure projects. Work on highway and bridge construction along the Mombasa corridor.",
    requirements: ["BSc Civil Engineering", "Registered with EBK or in process", "Strong technical drawing skills", "Willingness to work on-site"],
    responsibilities: ["Assist in structural design reviews", "Monitor construction progress", "Prepare engineering reports", "Ensure quality compliance"],
    deadline: "2026-05-01",
    postedDate: "2026-03-06",
    remote: false,
    applicants: 67,
  },
  {
    id: "6",
    title: "UX/UI Design Intern",
    company: "Andela",
    companyLogo: "A",
    location: "Nairobi",
    type: "internship",
    industry: "Technology",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
    description: "Design beautiful, user-centered interfaces for Andela's talent platform used by thousands of engineers across Africa.",
    requirements: ["Portfolio demonstrating UI/UX skills", "Proficiency in Figma", "Understanding of design principles", "Enrolled in or completed relevant degree"],
    responsibilities: ["Design user interfaces for web apps", "Conduct user research sessions", "Create interactive prototypes", "Maintain design system components"],
    deadline: "2026-04-25",
    postedDate: "2026-03-03",
    remote: true,
    applicants: 156,
  },
];

export const INDUSTRIES = [
  "Technology",
  "Banking & Finance",
  "Energy",
  "E-Commerce",
  "Construction",
  "Healthcare",
  "Education",
  "Telecommunications",
  "Manufacturing",
  "NGO & Development",
];

export const LOCATIONS = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Remote",
];

export const SKILLS = [
  "JavaScript", "React", "Python", "SQL", "Excel",
  "Node.js", "TypeScript", "Git", "Docker", "AWS",
  "Figma", "AutoCAD", "Power BI", "Communication",
  "Project Management", "Financial Analysis", "Digital Marketing",
  "Data Analysis", "Machine Learning", "Accounting",
];

export const STATS = [
  { label: "Active Jobs", value: "2,400+", icon: "briefcase" },
  { label: "Graduates Placed", value: "8,500+", icon: "users" },
  { label: "Partner Companies", value: "350+", icon: "building" },
  { label: "Universities", value: "45+", icon: "graduation" },
];
