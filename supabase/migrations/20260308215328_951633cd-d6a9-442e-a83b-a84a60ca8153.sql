INSERT INTO skills (name, category) VALUES
-- Healthcare
('Nursing Care', 'Healthcare'), ('Clinical Research', 'Healthcare'), ('Public Health', 'Healthcare'), ('Pharmacy', 'Healthcare'), ('Medical Laboratory', 'Healthcare'), ('Patient Management', 'Healthcare'), ('Health & Safety', 'Healthcare'),
-- Education
('Curriculum Development', 'Education'), ('Classroom Management', 'Education'), ('Educational Technology', 'Education'), ('Lesson Planning', 'Education'), ('Student Counseling', 'Education'), ('Early Childhood Education', 'Education'),
-- Agriculture
('Crop Science', 'Agriculture'), ('Animal Husbandry', 'Agriculture'), ('Agribusiness', 'Agriculture'), ('Soil Science', 'Agriculture'), ('Horticulture', 'Agriculture'), ('Agricultural Extension', 'Agriculture'), ('Food Technology', 'Agriculture'),
-- Environment
('Environmental Impact Assessment', 'Environment'), ('GIS & Remote Sensing', 'Environment'), ('Wildlife Management', 'Environment'), ('Water Resource Management', 'Environment'), ('Climate Change Adaptation', 'Environment'),
-- Engineering
('Structural Engineering', 'Engineering'), ('Mechanical Engineering', 'Engineering'), ('Electrical Engineering', 'Engineering'), ('Quantity Surveying', 'Engineering'), ('Civil Engineering', 'Engineering'), ('MS Project', 'Engineering'), ('ArchiCAD', 'Engineering'),
-- Legal
('Contract Law', 'Legal'), ('Corporate Law', 'Legal'), ('Legal Research', 'Legal'), ('Litigation', 'Legal'), ('Compliance', 'Legal'), ('Conveyancing', 'Legal'),
-- HR & Admin
('Human Resource Management', 'HR & Admin'), ('Recruitment & Selection', 'HR & Admin'), ('Payroll Management', 'HR & Admin'), ('Office Administration', 'HR & Admin'), ('Records Management', 'HR & Admin'), ('Labour Relations', 'HR & Admin'),
-- Marketing
('Social Media Marketing', 'Marketing'), ('Content Writing', 'Marketing'), ('SEO/SEM', 'Marketing'), ('Brand Management', 'Marketing'), ('Market Research', 'Marketing'), ('Public Relations', 'Marketing'), ('Event Management', 'Marketing'),
-- Finance
('Budgeting & Forecasting', 'Finance'), ('Taxation', 'Finance'), ('Auditing', 'Finance'), ('Risk Management', 'Finance'), ('Banking Operations', 'Finance'), ('Insurance', 'Finance'), ('CPA Kenya', 'Finance'), ('QuickBooks', 'Finance'),
-- Logistics
('Supply Chain Management', 'Logistics'), ('Procurement', 'Logistics'), ('Warehousing', 'Logistics'), ('Fleet Management', 'Logistics'), ('Inventory Management', 'Logistics'), ('Customs & Clearing', 'Logistics'),
-- Hospitality & Tourism
('Hospitality Management', 'Hospitality & Tourism'), ('Tour Guiding', 'Hospitality & Tourism'), ('Food & Beverage Service', 'Hospitality & Tourism'), ('Hotel Front Office', 'Hospitality & Tourism'), ('Housekeeping', 'Hospitality & Tourism'), ('Travel Coordination', 'Hospitality & Tourism'),
-- Media & Communication
('Journalism', 'Media & Communication'), ('Video Production', 'Media & Communication'), ('Graphic Design', 'Media & Communication'), ('Photography', 'Media & Communication'), ('Broadcasting', 'Media & Communication'), ('Copy Editing', 'Media & Communication'),
-- Soft Skills
('Sales & Negotiation', 'Soft Skills'), ('Leadership', 'Soft Skills'), ('Team Collaboration', 'Soft Skills'), ('Problem Solving', 'Soft Skills'), ('Time Management', 'Soft Skills'), ('Critical Thinking', 'Soft Skills'), ('Customer Service', 'Soft Skills'), ('Presentation Skills', 'Soft Skills'),
-- IT
('Cybersecurity', 'IT'), ('Networking (Cisco)', 'IT'), ('System Administration', 'IT'), ('Cloud Computing', 'IT'), ('Mobile App Development', 'IT'), ('Database Administration', 'IT'), ('IT Support', 'IT'),
-- Design
('UI/UX Design', 'Design'), ('Web Design', 'Design'),
-- NGO & Development
('M&E (Monitoring & Evaluation)', 'NGO & Development'), ('Grant Writing', 'NGO & Development'), ('Community Development', 'NGO & Development'), ('Program Management', 'NGO & Development'), ('Proposal Writing', 'NGO & Development'),
-- Business
('Entrepreneurship', 'Business'), ('Business Development', 'Business'), ('Strategic Planning', 'Business'), ('Operations Management', 'Business')
ON CONFLICT (name) DO NOTHING;