"""
Canonical skill names and the aliases that should map to them.

Keys are the canonical form used everywhere downstream (lowercase, no dots).
Values are alternative spellings, abbreviations and versions, written in lowercase.
To support a new skill, add a key; to catch a new spelling, add it to the list.
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

    # Other
    "system design": [],
    "data structures and algorithms": ["dsa", "data structures", "algorithms"],
    "figma": [],
    "excel": ["ms excel", "microsoft excel"],
}
