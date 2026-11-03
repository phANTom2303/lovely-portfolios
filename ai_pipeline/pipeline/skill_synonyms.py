"""
Canonical skill names and the aliases that should map to them.

Keys are the canonical form used everywhere downstream (lowercase, no dots).
Values are alternative spellings, abbreviations and versions, written in lowercase.
To support a new skill, add a key here AND a display name in SKILL_DISPLAY_NAMES below
(a test fails if either is missing); to catch a new spelling, add it to the list.

The key is for matching only. SKILL_DISPLAY_NAMES holds the name shown on the portfolio.
"""

SKILL_SYNONYMS: dict[str, list[str]] = {
    # Languages
    "javascript": ["js", "java script", "ecmascript", "es6", "vanilla js"],
    "typescript": ["ts", "type script"],
    "python": ["py", "python3", "python 3"],
    "java": ["core java", "java 8", "java 11", "java 17"],
    "c": ["c language", "c programming"],
    "c++": ["cpp", "c plus plus"],
    "c#": ["csharp", "c sharp"],
    "go": ["golang"],
    "rust": ["rustlang"],
    "kotlin": [],
    "swift": [],
    "sql": ["structured query language"],
    "html": ["html5"],
    "css": ["css3"],

    # Frontend
    "react": ["reactjs", "react.js", "react js"],
    "angular": ["angularjs", "angular.js", "angular js"],
    "vuejs": ["vue", "vue.js", "vue js"],
    "nextjs": ["next.js", "next js"],
    "tailwind css": ["tailwind", "tailwindcss"],
    "redux": ["redux toolkit"],
    "flutter": [],

    # Backend
    "nodejs": ["node", "node.js", "node js"],
    "expressjs": ["express", "express.js", "express js"],
    "fastapi": ["fast api"],
    "django": [],
    "flask": [],
    "spring boot": ["springboot", "spring"],
    "rest apis": ["rest", "rest api", "restful", "restful api", "restful apis"],
    "graphql": ["graph ql"],
    "grpc": [],
    "microservices": ["microservice", "micro services"],

    # Databases and caches
    "postgresql": ["postgres", "postgre", "psql", "pg"],
    "mysql": ["my sql"],
    "mongodb": ["mongo", "mongo db"],
    "redis": [],
    "elasticsearch": ["elastic search", "elastic"],
    "sqlite": [],

    # Cloud and DevOps
    "aws": ["amazon web services"],
    "gcp": ["google cloud", "google cloud platform"],
    "azure": ["microsoft azure"],
    "docker": [],
    "kubernetes": ["k8s", "kube"],
    "terraform": [],
    "ci/cd": ["cicd", "ci cd", "continuous integration", "continuous deployment"],
    "git": ["version control"],
    "linux": ["unix"],
    "kafka": ["apache kafka"],

    # Data and ML
    "machine learning": ["ml"],
    "deep learning": ["dl"],
    "tensorflow": ["tensor flow"],
    "pytorch": ["torch", "py torch"],
    "pandas": [],
    "numpy": [],
    "scikit-learn": ["sklearn", "scikit learn"],

    # AI and LLM
    "langchain": ["lang chain"],
    "langgraph": ["lang graph"],
    "agentic pipeline": ["agentic pipelines", "agentic workflow", "agentic workflows"],

    # Other
    "system design": [],
    "data structures and algorithms": ["dsa", "data structures", "algorithms"],
    "figma": [],
    "excel": ["ms excel", "microsoft excel"],
}


# What a person reads on the portfolio. One entry per key of SKILL_SYNONYMS.
# Follows each tool's own official spelling (scikit-learn stays lowercase, gRPC, PyTorch, NumPy).
SKILL_DISPLAY_NAMES: dict[str, str] = {
    # Languages
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "python": "Python",
    "java": "Java",
    "c": "C",
    "c++": "C++",
    "c#": "C#",
    "go": "Go",
    "rust": "Rust",
    "kotlin": "Kotlin",
    "swift": "Swift",
    "sql": "SQL",
    "html": "HTML",
    "css": "CSS",

    # Frontend
    "react": "React",
    "angular": "Angular",
    "vuejs": "Vue.js",
    "nextjs": "Next.js",
    "tailwind css": "Tailwind CSS",
    "redux": "Redux",
    "flutter": "Flutter",

    # Backend
    "nodejs": "Node.js",
    "expressjs": "Express.js",
    "fastapi": "FastAPI",
    "django": "Django",
    "flask": "Flask",
    "spring boot": "Spring Boot",
    "rest apis": "REST APIs",
    "graphql": "GraphQL",
    "grpc": "gRPC",
    "microservices": "Microservices",

    # Databases and caches
    "postgresql": "PostgreSQL",
    "mysql": "MySQL",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "elasticsearch": "Elasticsearch",
    "sqlite": "SQLite",

    # Cloud and DevOps
    "aws": "AWS",
    "gcp": "GCP",
    "azure": "Azure",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "terraform": "Terraform",
    "ci/cd": "CI/CD",
    "git": "Git",
    "linux": "Linux",
    "kafka": "Kafka",

    # Data and ML
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scikit-learn": "scikit-learn",

    # AI and LLM
    "langchain": "LangChain",
    "langgraph": "LangGraph",
    "agentic pipeline": "Agentic Pipeline",

    # Other
    "system design": "System Design",
    "data structures and algorithms": "Data Structures and Algorithms",
    "figma": "Figma",
    "excel": "Excel",
}


# The section a skill is listed under in the portfolio. One entry per key of SKILL_SYNONYMS.
# A skill we have no entry for goes to "Other".
SKILL_CATEGORIES: dict[str, str] = {
    **dict.fromkeys(
        ["javascript", "typescript", "python", "java", "c", "c++", "c#", "go", "rust", "kotlin",
         "swift", "sql", "html", "css"],
        "Languages",
    ),
    **dict.fromkeys(
        ["react", "angular", "vuejs", "nextjs", "tailwind css", "redux", "flutter", "nodejs",
         "expressjs", "fastapi", "django", "flask", "spring boot"],
        "Frameworks & Libraries",
    ),
    **dict.fromkeys(
        ["postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite"],
        "Databases",
    ),
    **dict.fromkeys(
        ["aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ci/cd", "git", "linux", "kafka",
         "figma", "excel"],
        "Tools & DevOps",
    ),
    **dict.fromkeys(
        ["machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn",
         "langchain", "langgraph", "agentic pipeline"],
        "AI & Machine Learning",
    ),
    **dict.fromkeys(
        ["rest apis", "graphql", "grpc", "microservices", "system design", "data structures and algorithms"],
        "Concepts",
    ),
}
