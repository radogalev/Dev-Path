"""
Script to seed 3 jobs for each roadmap path into the database.
"""

import os
from datetime import datetime, timedelta
from sqlalchemy.orm import sessionmaker
from db.models.db_config import engine
from db.models.jobs import Job

SessionLocal = sessionmaker(bind=engine)

# Job templates for each path/profession
jobs_data = {
    "frontend": [
        {
            "title": "Junior Frontend Developer",
            "company": "TechStart Inc.",
            "location": "San Francisco, CA",
            "profession": "frontend",
            "description": "We're looking for a talented Frontend Developer to join our dynamic team. You'll work with modern JavaScript frameworks like React and Vue to build beautiful, responsive web applications.\n\nResponsibilities:\n- Develop and maintain frontend applications\n- Collaborate with designers and backend developers\n- Write clean, maintainable code\n- Participate in code reviews\n\nRequirements:\n- Strong knowledge of HTML5, CSS3, and JavaScript\n- Experience with React or Vue.js\n- Understanding of responsive design\n- Git version control\n\nNice to Have:\n- Experience with TypeScript\n- Knowledge of state management (Redux, Vuex)\n- Experience with testing frameworks",
            "salary": "$70,000 - $90,000",
            "job_type": "Full-time",
        },
        {
            "title": "Senior React Developer",
            "company": "CloudSoft Solutions",
            "location": "New York, NY (Remote)",
            "profession": "frontend",
            "description": "Join our innovative team building a SaaS platform used by thousands. We need an experienced React developer who can architect scalable frontend solutions.\n\nResponsibilities:\n- Lead frontend architecture and best practices\n- Mentor junior developers\n- Optimize application performance\n- Implement new features from design mockups\n\nRequirements:\n- 5+ years of frontend development experience\n- Deep expertise in React and JavaScript\n- Experience with state management solutions\n- Strong UI/UX understanding\n\nNice to Have:\n- GraphQL experience\n- Familiar with testing frameworks (Jest, Cypress)\n- Knowledge of webpack and bundlers",
            "salary": "$120,000 - $160,000",
            "job_type": "Full-time",
        },
        {
            "title": "Frontend Intern",
            "company": "WebCreative Agency",
            "location": "Austin, TX",
            "profession": "frontend",
            "description": "Great opportunity for a student or career changer! Help us build responsive websites for our clients under the mentorship of our senior developers.\n\nResponsibilities:\n- Implement designs using HTML/CSS/JavaScript\n- Assist in debugging and troubleshooting\n- Learn modern web development practices\n- Contribute ideas to design discussions\n\nRequirements:\n- Knowledge of HTML, CSS, and JavaScript\n- Understanding of responsive design\n- Attention to detail\n- Willingness to learn\n\nNice to Have:\n- Basic React knowledge\n- Portfolio with sample projects",
            "salary": "$20 - $25/hour",
            "job_type": "Internship",
        },
    ],
    "backend": [
        {
            "title": "Python Backend Developer",
            "company": "DataFlow Systems",
            "location": "Seattle, WA",
            "profession": "backend",
            "description": "Help us build robust APIs and scalable backend systems. We use Python and modern web frameworks to power our data processing platform.\n\nResponsibilities:\n- Design and develop REST APIs\n- Work with databases (PostgreSQL, Redis)\n- Implement authentication and security\n- Write unit and integration tests\n\nRequirements:\n- 2+ years Python development experience\n- Experience with frameworks like Django or FastAPI\n- SQL database knowledge\n- Understanding of API design principles\n\nNice to Have:\n- Experience with microservices\n- Docker and Kubernetes knowledge\n- Message queue experience (RabbitMQ, Kafka)",
            "salary": "$90,000 - $120,000",
            "job_type": "Full-time",
        },
        {
            "title": "Node.js Backend Engineer",
            "company": "RealTime Apps Co.",
            "location": "Remote",
            "profession": "backend",
            "description": "Join our team building real-time applications with Node.js. You'll work on high-performance systems handling millions of requests.\n\nResponsibilities:\n- Build and maintain Node.js services\n- Design database schemas\n- Implement caching strategies\n- Monitor and optimize performance\n\nRequirements:\n- 3+ years Node.js experience\n- Strong JavaScript/TypeScript skills\n- Database design knowledge\n- Experience with REST APIs\n\nNice to Have:\n- GraphQL experience\n- MongoDB and NoSQL databases\n- Cloud platform experience (AWS, GCP, Azure)",
            "salary": "$110,000 - $140,000",
            "job_type": "Full-time",
        },
        {
            "title": "Backend Development Contractor",
            "company": "StartupXYZ",
            "location": "Flexible",
            "profession": "backend",
            "description": "Short-term contract to build payment processing APIs. 3-6 month engagement with possibility to extend.\n\nResponsibilities:\n- Develop payment integration APIs\n- Implement webhook handlers\n- Write comprehensive documentation\n- Set up testing and CI/CD\n\nRequirements:\n- Experience with payments (Stripe, PayPal)\n- API development experience\n- Any backend language proficiency\n- Problem-solving skills\n\nNice to Have:\n- Financial system knowledge\n- PCI compliance understanding",
            "salary": "$100 - $130/hour",
            "job_type": "Contract",
        },
    ],
    "fullstack": [
        {
            "title": "Full Stack Web Developer",
            "company": "Digital Innovations",
            "location": "Boston, MA",
            "profession": "fullstack",
            "description": "We're building web applications end-to-end and need developers who can own both frontend and backend. Perfect for someone who loves full-stack development.\n\nResponsibilities:\n- Develop complete features from database to UI\n- Collaborate with product team\n- Optimize application performance\n- Deploy and maintain applications\n\nRequirements:\n- 3+ years full-stack development\n- Frontend: React or Vue\n- Backend: Node.js, Python, or Java\n- Database and SQL knowledge\n\nNice to Have:\n- DevOps experience\n- Docker/Kubernetes\n- CI/CD pipeline knowledge",
            "salary": "$100,000 - $130,000",
            "job_type": "Full-time",
        },
        {
            "title": "Mern Stack Developer",
            "company": "WebStack Inc.",
            "location": "Remote",
            "profession": "fullstack",
            "description": "Exciting opportunity to work with the latest MERN stack technologies. Build scalable applications from concept to production.\n\nResponsibilities:\n- Develop MongoDB, Express, React, Node.js applications\n- Implement full CRUD operations\n- Manage state and implement caching\n- Deploy to cloud platforms\n\nRequirements:\n- Strong React and Node.js experience\n- MongoDB and Express knowledge\n- Understanding of REST APIs\n- Problem-solving ability\n\nNice to Have:\n- TypeScript experience\n- AWS deployment experience\n- Testing framework knowledge (Jest, Cypress)",
            "salary": "$95,000 - $125,000",
            "job_type": "Full-time",
        },
        {
            "title": "Full Stack Developer - Startup",
            "company": "EcoTech Startup",
            "location": "Austin, TX",
            "profession": "fullstack",
            "description": "Join a fast-growing startup revolutionizing sustainable technology! Wear many hats and make a direct impact.\n\nResponsibilities:\n- Build new features across the stack\n- Optimize database queries\n- Improve user experience\n- Share knowledge with team\n\nRequirements:\n- 2+ years full-stack experience\n- JavaScript/TypeScript proficiency\n- SQL and NoSQL databases\n- Git and version control\n\nNice to Have:\n- Startup experience\n- Agile methodology\n- UI/UX awareness",
            "salary": "$85,000 - $110,000",
            "job_type": "Full-time",
        },
    ],
    "devops": [
        {
            "title": "DevOps Engineer",
            "company": "CloudInfra Corp.",
            "location": "Remote",
            "profession": "devops",
            "description": "Help us build and maintain our cloud infrastructure. You'll work with containers, orchestration, and CI/CD pipelines.\n\nResponsibilities:\n- Manage Kubernetes clusters\n- Design deployment strategies\n- Implement monitoring and logging\n- Automate infrastructure provisioning\n\nRequirements:\n- Docker and Kubernetes knowledge\n- CI/CD pipeline experience\n- Linux system administration\n- Cloud platform expertise (AWS/GCP/Azure)\n\nNice to Have:\n- Terraform or Infrastructure as Code\n- Prometheus and ELK stack\n- Security best practices",
            "salary": "$110,000 - $150,000",
            "job_type": "Full-time",
        },
        {
            "title": "Site Reliability Engineer (SRE)",
            "company": "TechScale Solutions",
            "location": "San Francisco, CA",
            "profession": "devops",
            "description": "Drive reliability and scalability of our systems. We need an SRE who understands both infrastructure and software engineering.\n\nResponsibilities:\n- Design reliable systems and architecture\n- Implement monitoring and alerting\n- Incident response and post-mortems\n- Performance optimization\n\nRequirements:\n- Strong Linux/Unix knowledge\n- Programming skills (Python, Go, or similar)\n- Distributed systems understanding\n- Cloud platform experience\n\nNice to Have:\n- Kubernetes expertise\n- Observability tools (Grafana, Datadog)\n- Security and compliance knowledge",
            "salary": "$130,000 - $170,000",
            "job_type": "Full-time",
        },
        {
            "title": "Junior DevOps Engineer",
            "company": "CloudStart Services",
            "location": "Remote",
            "profession": "devops",
            "description": "Starting your DevOps journey? Join our team and learn from experienced engineers while contributing to our infrastructure.\n\nResponsibilities:\n- Assist in deployment automation\n- Monitor application health\n- Maintain documentation\n- Learn cloud and container technologies\n\nRequirements:\n- Linux basics knowledge\n- Understanding of networking\n- Familiarity with scripting\n- Willingness to learn\n\nNice to Have:\n- Docker basics\n- AWS or cloud platform exposure\n- Any CI/CD pipeline experience",
            "salary": "$70,000 - $90,000",
            "job_type": "Full-time",
        },
    ],
}

def seed_jobs():
    """Insert job data into the database"""
    session = SessionLocal()
    
    try:
        # Clear existing jobs (optional)
        # session.query(Job).delete()
        
        job_count = 0
        for profession, jobs_list in jobs_data.items():
            for job_data in jobs_list:
                # Check if job already exists
                existing = session.query(Job).filter_by(
                    title=job_data["title"],
                    company=job_data["company"]
                ).first()
                
                if existing:
                    print(f"Job already exists: {job_data['title']}")
                    continue
                
                job = Job(
                    title=job_data["title"],
                    company=job_data["company"],
                    location=job_data["location"],
                    profession=job_data["profession"],
                    description=job_data["description"],
                    salary=job_data["salary"],
                    job_type=job_data["job_type"],
                    date_posted=datetime.utcnow(),
                    is_active=True,
                )
                
                session.add(job)
                job_count += 1
                print(f"Added: {job_data['title']} at {job_data['company']}")
        
        session.commit()
        print(f"\n✅ Successfully added {job_count} jobs to the database!")
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error seeding jobs: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    print("🚀 Starting job seeding...\n")
    seed_jobs()
