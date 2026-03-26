import sqlalchemy
from sqlalchemy.orm import sessionmaker
from db.models.db_config import engine
from db.models.jobs import Job
from sqlalchemy import select

Session = sessionmaker(bind=engine)

with Session() as session:
    all_jobs = session.execute(select(Job).order_by(Job.date_posted.desc())).scalars().all()
    print(f"\n{'='*80}")
    print(f"Total Jobs: {len(all_jobs)}")
    print(f"{'='*80}\n")
    
    for job in all_jobs:
        print(f"ID: {job.id}")
        print(f"Title: {job.title}")
        print(f"Company: {job.company}")
        print(f"Location: {job.location}")
        print(f"Profession: {job.profession}")
        print(f"Job Type: {job.job_type}")
        print(f"Salary: {job.salary}")
        print(f"Active: {job.is_active}")
        print(f"Posted: {job.date_posted}")
        print("-" * 80)
    
    session.close()