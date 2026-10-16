import json
import sys
from pathlib import Path

# Ensure UTF-8 stdout on Windows
if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add current directory to path
sys.path.append(str(Path(__file__).resolve().parent))

from pipeline.scorer import score_and_rank
from pipeline.rewriter import rewrite_and_build_portfolio


def run_demo():
    print("=" * 70)
    print("[*] LOVELY PORTFOLIO AI PIPELINE: ANYA'S LIVE DEMONSTRATION")
    print("=" * 70)

    # 1. Target Job Description (Step 1 output simulation)
    sample_jd = {
        "jobRole": "Backend Developer Intern",
        "mustHaveSkills": ["python", "fastapi", "postgresql"],
        "preferredSkills": ["docker", "redis", "rest apis"],
        "goodToHaveSkills": ["aws", "git"],
        "responsibilities": [
            "design and build high-throughput microservices",
            "write clean, tested unit code",
            "optimize database queries and caching",
        ],
        "domainKeywords": [
            "backend",
            "microservices",
            "api",
            "database",
            "distributed systems",
        ],
        "experienceLevel": "fresher",
    }

    print("\n[+] TARGET JOB DESCRIPTION:")
    print(f"  * Role: {sample_jd['jobRole']}")
    print(f"  * Must-Have Skills: {', '.join(sample_jd['mustHaveSkills'])}")
    print(f"  * Preferred Skills: {', '.join(sample_jd['preferredSkills'])}")
    print(f"  * Key Responsibilities: {'; '.join(sample_jd['responsibilities'])}")

    # 2. Candidate Resume Entities (Step 2 output simulation)
    sample_entities = [
        {
            "reId": 1,
            "reType": "project",
            "title": "Share Market Tracker",
            "description": "Built a real time stock price tracker with live data feeds using WebSockets and Node.js.",
            "originalSkills": ["JS", "Node", "Postgres"],
            "normalizedSkills": ["javascript", "nodejs", "postgresql"],
            "fromDate": "2024-01-01",
            "toDate": "2024-05-01",
        },
        {
            "reId": 2,
            "reType": "project",
            "title": "REST API for College ERP",
            "description": "Designed and built a modular REST API for college management system with automated grade calculations.",
            "originalSkills": ["Python", "FastAPI", "PostgreSQL"],
            "normalizedSkills": ["python", "fastapi", "postgresql"],
            "fromDate": "2024-06-01",
            "toDate": "2024-08-01",
        },
        {
            "reId": 3,
            "reType": "work_exp",
            "title": "Backend Intern at Startup",
            "description": "Worked on Node.js microservices and REST APIs with Redis caching layer.",
            "originalSkills": ["Node.js", "REST APIs", "Redis"],
            "normalizedSkills": ["nodejs", "rest apis", "redis"],
            "fromDate": "2023-06-01",
            "toDate": "2023-08-01",
        },
        {
            "reId": 4,
            "reType": "project",
            "title": "Landscape Photography Gallery",
            "description": "Static photography gallery showcasing DSLR photos from Himachal trip.",
            "originalSkills": ["HTML", "CSS", "Lightroom"],
            "normalizedSkills": ["html", "css", "lightroom"],
            "fromDate": "2023-01-01",
            "toDate": "2023-03-01",
        },
    ]

    sample_user_profile = {
        "name": "Anya Saxena",
        "professionalTitle": "Backend & Cloud Engineer",
        "about": "Computer Science engineer passionate about building high-throughput distributed APIs and backend architectures.",
        "currentLocation": "Bhubaneswar, India",
        "socials": {
            "github": "https://github.com/AnyaSaxena24",
            "linkedin": "https://linkedin.com/in/anya-saxena",
        },
    }

    print(f"\n[+] CANDIDATE: {sample_user_profile['name']} ({sample_user_profile['professionalTitle']})")
    print(f"  * Submitted {len(sample_entities)} resume entities for evaluation.")

    # 3. RUN STEP 3: LLM Batch Scoring
    print("\n" + "-" * 70)
    print("[*] [STEP 3] RUNNING LLM BATCH SCORING (Groq)...")
    print("-" * 70)

    try:
        scored_entities = score_and_rank(sample_entities, sample_jd)
        print(f"[OK] Scoring Complete! {len(scored_entities)} entities qualified (threshold >= 0.15):\n")
        for idx, e in enumerate(scored_entities, 1):
            print(f"  [{idx}] {e['title']} ({e['reType']})")
            print(f"      * Score: {e.get('score', 0):.2f}")
            print(f"      * Reasoning: {e.get('reasoning', 'N/A')}")
            print(f"      * Skills: {', '.join(e.get('normalizedSkills', []))}\n")
    except Exception as e:
        print(f"[ERROR] in Step 3 Scorer: {e}")
        return

    # 4. RUN STEP 4: Content Rewriting
    print("-" * 70)
    print("[*] [STEP 4] RUNNING LLM CONTENT REWRITING (Groq JSON Mode)...")
    print("-" * 70)

    try:
        portfolio = rewrite_and_build_portfolio(scored_entities, sample_jd, sample_user_profile)
        print("[OK] Rewriting Complete! Portfolio JSON generated successfully.\n")

        print("[+] REWRITTEN ENTITY DESCRIPTIONS:")
        for section in portfolio.get("sections", []):
            print(f"\n  SECTION: {section.get('sectionTitle', section.get('reType', '').upper())}")
            for entity in section.get("entities", []):
                print(f"     * Title: {entity.get('title')}")
                print(f"     * Rewritten Description:")
                print(f"       \"{entity.get('rewrittenDescription')}\"")
                print(f"     * Skills Highlighted: {', '.join(entity.get('skills', []))}")

        # Save to demo output file
        output_file = Path(__file__).resolve().parent / "generated_portfolio_demo.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(portfolio, f, indent=2)

        print("\n" + "=" * 70)
        print(f"[SAVED] Full Portfolio JSON saved to: {output_file.name}")
        print("[DONE] END-TO-END DEMO FINISHED SUCCESSFULLY!")
        print("=" * 70)

    except Exception as e:
        print(f"[ERROR] in Step 4 Rewriter: {e}")


if __name__ == "__main__":
    run_demo()
