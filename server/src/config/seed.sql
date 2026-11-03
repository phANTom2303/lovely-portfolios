-- ============================================================
-- Portfolio Database — Test Seed Data
--
-- Seeds a rich, mixed-domain profile (Full-Stack Engineering + AI/ML)
-- for an EXISTING user, so the AI pipeline can be tested on which
-- projects / experiences it highlights for different job descriptions.
--
-- The target user is read from the session setting `seed.user_id`.
--
--   Via API :  POST /seed   { "user_id": "<uuid>" }
--   Via psql:  psql -d <db> -c "SET seed.user_id = '<uuid>'" -f seed.sql
--              (psql runs -c and -f in the same session, in order)
--
-- WARNING: this is a RESET + SEED for that user. It first deletes the
-- user's existing education, resume entities, skills, links and
-- resume-entity assets. The users row and portfolios are left alone.
-- ============================================================

DO $seed$
DECLARE
    uid UUID := NULLIF(current_setting('seed.user_id', true), '')::UUID;
    rid INTEGER;
BEGIN
    IF uid IS NULL THEN
        RAISE EXCEPTION 'seed.user_id is not set';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM users WHERE id = uid) THEN
        RAISE EXCEPTION 'User % does not exist', uid;
    END IF;

    -- --------------------------------------------------------
    -- RESET existing resume data for this user
    -- (resume_entity delete cascades to its skills/links/assets)
    -- --------------------------------------------------------
    DELETE FROM resume_entity WHERE user_id = uid;
    DELETE FROM skills        WHERE user_id = uid;
    DELETE FROM links         WHERE user_id = uid;
    DELETE FROM education     WHERE user_id = uid;

    -- --------------------------------------------------------
    -- PROFILE (only fill in fields the user hasn't set)
    -- --------------------------------------------------------
    UPDATE users SET
        professional_title = COALESCE(professional_title, 'Software Engineer — Full Stack & Applied AI'),
        about = COALESCE(about,
            'Software engineer with ~4 years of experience spanning production full-stack web systems '
            || '(React, Node.js, PostgreSQL, AWS) and applied machine learning (PyTorch, Transformers, RAG/LLM apps). '
            || 'Enjoys taking products from prototype to scale and bridging the gap between ML research and real users.'),
        current_location = COALESCE(current_location, 'Bengaluru, India')
    WHERE id = uid;

    -- --------------------------------------------------------
    -- EDUCATION (4)
    -- --------------------------------------------------------
    INSERT INTO education (user_id, institute_name, education_type, from_date, to_date, marks, mark_type, total_mark, stream) VALUES
    (uid, 'Delhi Public School, Pune',                 'secondary',        '2014-04-01', '2016-03-31', 94.2, 'percentage', 100, 'General (CBSE)'),
    (uid, 'Delhi Public School, Pune',                 'higher_secondary', '2016-04-01', '2018-03-31', 92.8, 'percentage', 100, 'Science — Physics, Chemistry, Mathematics, Computer Science'),
    (uid, 'National Institute of Technology, Karnataka','under_graduate',  '2018-08-01', '2022-05-31', 8.7,  'gpa',        10,  'B.Tech, Computer Science and Engineering'),
    (uid, 'Upgrad x IIIT Bangalore (Online)',          'diploma',          '2023-01-01', '2024-01-31', 3.9,  'gpa',        4,   'Post Graduate Diploma in Machine Learning & AI');

    -- --------------------------------------------------------
    -- PROFILE-LEVEL SKILLS (re_id NULL)
    -- --------------------------------------------------------
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, NULL FROM unnest(ARRAY[
        -- Languages
        'JavaScript', 'TypeScript', 'Python', 'Go', 'SQL',
        -- Frontend
        'React', 'Next.js', 'Tailwind CSS', 'Redux',
        -- Backend
        'Node.js', 'Express', 'NestJS', 'FastAPI', 'GraphQL', 'REST APIs', 'WebSockets',
        -- Data
        'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'pgvector',
        -- Cloud / DevOps
        'AWS', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions',
        -- AI / ML
        'PyTorch', 'TensorFlow', 'Hugging Face Transformers', 'LangChain', 'LLMs',
        'RAG', 'Computer Vision', 'NLP', 'MLflow', 'scikit-learn', 'OpenCV'
    ]) AS s;

    -- --------------------------------------------------------
    -- PROFILE-LEVEL LINKS (re_id NULL)
    -- --------------------------------------------------------
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, NULL, 'https://github.com/seed-dev',              'GitHub',   'Open-source work and side projects'),
    (uid, NULL, 'https://linkedin.com/in/seed-dev',         'LinkedIn', 'Professional profile'),
    (uid, NULL, 'https://kaggle.com/seeddev',               'Kaggle',   'Competition notebooks and datasets'),
    (uid, NULL, 'https://seeddev.hashnode.dev',             'Tech Blog','Writing on web architecture and applied ML');

    -- ========================================================
    -- PROJECTS (6) — 3 Full-Stack, 3 AI/ML
    -- ========================================================

    -- [Full-Stack] 1. E-commerce marketplace
    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'project', 'ShopSphere — Multi-Vendor E-Commerce Marketplace', 'Full-Stack Web Application',
        'Built a multi-vendor marketplace where sellers manage storefronts, inventory and orders. '
        || 'Next.js (SSR + ISR) frontend with a Node.js/Express REST API and PostgreSQL. Integrated Stripe Connect '
        || 'for split payouts, Redis for cart/session caching and rate limiting, and an Elasticsearch-backed product search '
        || 'with faceted filters. Containerised with Docker and deployed to AWS ECS behind CloudFront; CI/CD with GitHub Actions. '
        || 'Load-tested to 1,200 RPS with p95 latency under 180 ms after query/index optimisation.',
        '2023-02-01', '2023-07-31', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Next.js','React','TypeScript','Node.js','Express','PostgreSQL','Redis','Stripe','Elasticsearch','Docker','AWS','GitHub Actions']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://github.com/seed-dev/shopsphere',  'Source Code', 'Monorepo with web app and API'),
    (uid, rid, 'https://shopsphere-demo.vercel.app',      'Live Demo',   'Demo store with seeded sellers');

    -- [Full-Stack] 2. Real-time collaboration
    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'project', 'Collabo — Real-Time Collaborative Kanban Board', 'Full-Stack / Real-Time Systems',
        'Trello-style project board with live multi-user editing, presence indicators and offline support. '
        || 'React + TypeScript client with optimistic updates (Redux Toolkit Query) and a Node.js Socket.IO server '
        || 'horizontally scaled with the Redis adapter. Data in MongoDB with change streams for audit history. '
        || 'Implemented JWT auth with refresh-token rotation, role-based access control and drag-and-drop with conflict resolution. '
        || 'End-to-end tests with Playwright; deployed on AWS (EC2 Auto Scaling + ALB).',
        '2022-09-01', '2023-01-31', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['React','TypeScript','Redux','Node.js','Socket.IO','WebSockets','MongoDB','Redis','JWT','Playwright','AWS']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://github.com/seed-dev/collabo', 'Source Code', 'Client and server repository'),
    (uid, rid, 'https://collabo.seeddev.app',         'Live Demo',   'Open two tabs to see live sync');

    -- [Full-Stack] 3. Logistics microservices
    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'project', 'FleetOps — Logistics Tracking Platform', 'Microservices / Backend-Heavy Full Stack',
        'Event-driven fleet management platform tracking 5k+ simulated vehicles in real time. '
        || 'NestJS microservices communicating over Kafka, a GraphQL gateway with subscriptions for live map updates, '
        || 'and PostgreSQL + PostGIS for geospatial queries (geofencing, nearest-depot routing). A Go ingestion service '
        || 'handles GPS telemetry at ~20k events/sec. React + Mapbox dashboard. Deployed on Kubernetes (EKS) via Helm '
        || 'and Terraform, with Prometheus/Grafana observability.',
        '2024-01-01', '2024-06-30', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['NestJS','Go','Kafka','GraphQL','PostgreSQL','PostGIS','React','Mapbox','Kubernetes','Terraform','Prometheus','Microservices']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://github.com/seed-dev/fleetops',             'Source Code',  'Services, Helm charts and Terraform'),
    (uid, rid, 'https://seeddev.hashnode.dev/fleetops-architecture','Architecture Write-up', 'Design decisions and benchmarks');

    -- [AI/ML] 4. RAG knowledge assistant
    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'project', 'DocuMind — RAG-Powered Enterprise Knowledge Assistant', 'LLM Application / Retrieval-Augmented Generation',
        'Chat assistant that answers questions over 40k+ internal documents (PDFs, Confluence, Slack exports) with cited sources. '
        || 'Python/FastAPI backend with LangChain orchestration, hybrid retrieval (BM25 + dense embeddings in pgvector) and a '
        || 'cross-encoder re-ranker. Built an evaluation harness (RAGAS + hand-labelled golden set) that raised answer '
        || 'faithfulness from 71% to 89%. Supports multiple LLM providers with streaming responses, prompt caching and '
        || 'guardrails for PII redaction.',
        '2024-07-01', '2024-11-30', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Python','LLMs','RAG','LangChain','FastAPI','pgvector','Embeddings','Prompt Engineering','RAGAS','NLP']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://github.com/seed-dev/documind',              'Source Code', 'Backend, ingestion pipeline and eval harness'),
    (uid, rid, 'https://seeddev.hashnode.dev/evaluating-rag-systems','Blog Post',  'How we measured and improved RAG faithfulness');

    -- [AI/ML] 5. Computer vision safety system
    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'project', 'VisionGuard — Real-Time PPE Compliance Detection', 'Computer Vision / Edge AI',
        'Detects missing helmets and safety vests on construction-site CCTV feeds in real time. '
        || 'Fine-tuned YOLOv8 in PyTorch on a custom 12k-image dataset (labelled with CVAT, augmented with Albumentations), '
        || 'reaching 0.91 mAP@0.5. Exported to ONNX and optimised with TensorRT to run at 30 FPS on an NVIDIA Jetson Orin. '
        || 'OpenCV-based multi-stream pipeline with object tracking (ByteTrack) and an alerting dashboard.',
        '2023-08-01', '2023-12-31', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Python','PyTorch','Computer Vision','YOLOv8','OpenCV','ONNX','TensorRT','Object Detection','Edge AI','Data Augmentation']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://github.com/seed-dev/visionguard',          'Source Code',  'Training and inference code'),
    (uid, rid, 'https://www.youtube.com/watch?v=seeddemo01',      'Demo Video',   'Detection running on live site footage');

    -- [AI/ML] 6. Fine-tuned transformer for ticket triage
    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'project', 'TriageNet — Fine-Tuned Transformer for Support Ticket Routing', 'NLP / MLOps',
        'Multi-label classifier that routes customer support tickets to the right team and predicts urgency. '
        || 'Fine-tuned DeBERTa-v3 with LoRA (Hugging Face Transformers + PEFT) on 250k historical tickets, beating the '
        || 'TF-IDF + logistic regression baseline by 14 F1 points. Experiment tracking and model registry in MLflow, '
        || 'training on AWS SageMaker, and serving via a Dockerised FastAPI endpoint with drift monitoring (Evidently AI). '
        || 'Reduced manual triage time by ~60% in a pilot.',
        '2025-01-01', '2025-05-31', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Python','NLP','Hugging Face Transformers','LoRA','Fine-Tuning','MLflow','AWS SageMaker','FastAPI','Docker','MLOps','scikit-learn']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://github.com/seed-dev/triagenet',              'Source Code', 'Training, evaluation and serving code'),
    (uid, rid, 'https://huggingface.co/seed-dev/triagenet-deberta',  'Model Card',  'Published model weights and metrics');

    -- ========================================================
    -- WORK EXPERIENCE (4)
    -- ========================================================

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'work_exp', 'Web Development Intern', 'PixelCraft Studios',
        'Built responsive marketing sites and an internal CMS for a design agency using React and Firebase. '
        || 'Converted Figma designs into reusable components and improved Lighthouse performance scores from 62 to 95.',
        '2020-05-01', '2020-08-31', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['React','JavaScript','Firebase','HTML','CSS','Figma']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://pixelcraft.example.com', 'Company Website', 'PixelCraft Studios');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'work_exp', 'Machine Learning Research Intern', 'Neural Insights Lab',
        'Researched semi-supervised learning for medical image segmentation. Implemented U-Net and consistency-regularisation '
        || 'baselines in PyTorch, improving Dice score by 6% with 20% of the labels. Co-authored a workshop paper.',
        '2021-01-01', '2021-06-30', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Python','PyTorch','Computer Vision','Deep Learning','Image Segmentation','Research']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://neuralinsights.example.org', 'Lab Website', 'Neural Insights Lab');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'work_exp', 'Software Engineer (Full Stack)', 'Finlytics — Fintech',
        'Owned the merchant dashboard and payments reconciliation service used by 3,000+ merchants. '
        || 'Built features end-to-end in React/TypeScript and Node.js, designed PostgreSQL schemas and migrated a monolith '
        || 'module into event-driven services on AWS (Lambda, SQS, RDS). Cut reconciliation job runtime from 4 h to 25 min. '
        || 'Led adoption of OpenAPI contracts and raised test coverage from 40% to 85%.',
        '2022-07-01', '2024-03-31', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['React','TypeScript','Node.js','PostgreSQL','AWS','AWS Lambda','SQS','Microservices','OpenAPI','Jest']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://finlytics.example.com', 'Company Website', 'Finlytics');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'work_exp', 'AI Engineer', 'Cognify AI',
        'Building LLM-powered products for enterprise customers. Designed the RAG platform behind the company''s '
        || 'document Q&A product (Python, FastAPI, pgvector), an agentic workflow engine with tool calling, and an '
        || 'offline/online evaluation pipeline. Fine-tuned small open models for classification to cut inference cost by 70%. '
        || 'Mentors two junior engineers.',
        '2024-04-01', NULL, 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Python','LLMs','RAG','AI Agents','FastAPI','pgvector','LangChain','Fine-Tuning','Evaluation','Docker']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://cognify.example.ai', 'Company Website', 'Cognify AI');

    -- ========================================================
    -- CERTIFICATIONS (5)
    -- ========================================================

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'certification', 'AWS Certified Solutions Architect — Associate', 'Amazon Web Services',
        'Validated ability to design distributed, highly available and cost-optimised systems on AWS.',
        '2023-03-15', '2026-03-15', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['AWS','Cloud Architecture']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://www.credly.com/badges/seed-aws-saa', 'Credly Badge', 'Verify certification');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'certification', 'Deep Learning Specialization', 'DeepLearning.AI (Coursera)',
        'Five-course specialization covering neural networks, hyperparameter tuning, CNNs, sequence models and transformers.',
        '2021-09-01', NULL, 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Deep Learning','TensorFlow','Neural Networks']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://coursera.org/verify/specialization/SEEDDL01', 'Certificate', 'Coursera verification');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'certification', 'Meta Front-End Developer Professional Certificate', 'Meta (Coursera)',
        'Covered advanced React, UX/UI principles, accessibility, testing and front-end performance.',
        '2022-02-01', NULL, 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['React','JavaScript','Accessibility','UI/UX']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://coursera.org/verify/professional-cert/SEEDFE01', 'Certificate', 'Coursera verification');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'certification', 'Google Cloud Professional Machine Learning Engineer', 'Google Cloud',
        'Validated skills in framing ML problems, building and productionising models with Vertex AI, and MLOps practices.',
        '2024-09-10', '2026-09-10', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['GCP','Vertex AI','MLOps','Machine Learning']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://www.credential.net/seed-gcp-pmle', 'Credential', 'Verify certification');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'certification', 'Certified Kubernetes Application Developer (CKAD)', 'The Linux Foundation / CNCF',
        'Hands-on exam covering designing, building and deploying cloud-native applications on Kubernetes.',
        '2024-05-20', '2027-05-20', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Kubernetes','Docker','Helm']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://www.credly.com/badges/seed-ckad', 'Credly Badge', 'Verify certification');

    -- ========================================================
    -- ACHIEVEMENTS (4)
    -- ========================================================

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'achievements', 'Winner — National Smart Cities Hackathon', '1st Place out of 420 teams',
        'Built a full-stack civic issue reporting app (React Native, Node.js, PostgreSQL) with an image classifier '
        || 'that auto-categorises complaints, in 36 hours.',
        '2021-02-12', '2021-02-14', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['React Native','Node.js','PostgreSQL','Image Classification']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://devpost.com/software/seed-civicfix', 'Devpost', 'Hackathon submission');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'achievements', 'Kaggle Competitions Expert — Silver Medal', 'Top 3% in a 2,800-team NLP competition',
        'Ensemble of fine-tuned transformer models with pseudo-labelling for a text-similarity competition.',
        '2022-11-01', '2023-01-31', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['NLP','Hugging Face Transformers','PyTorch','Ensembling']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://kaggle.com/seeddev/competitions', 'Kaggle Profile', 'Competition results');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'achievements', 'Spot Award for Engineering Excellence', 'Finlytics',
        'Recognised for leading the reconciliation service rewrite that eliminated a class of payout mismatches '
        || 'and saved ~200 support hours per month.',
        '2023-10-01', NULL, 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Node.js','System Design','Leadership']) AS s;

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'achievements', 'Best Paper Award — Student Track', 'International Conference on Applied ML (ICAML) 2021',
        'Awarded for the paper on label-efficient medical image segmentation produced during the Neural Insights Lab internship.',
        '2021-12-10', NULL, 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Deep Learning','Computer Vision','Research']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://arxiv.org/abs/2112.00000', 'Paper', 'arXiv preprint');

    -- ========================================================
    -- EXTRA-CURRICULAR (4)
    -- ========================================================

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'extra_curricular', 'Lead — Web & App Development Club', 'NIT Karnataka',
        'Led a 40-member club, ran weekly full-stack workshops (MERN stack) and shipped the official college fest website '
        || 'handling 50k+ visits.',
        '2020-08-01', '2021-07-31', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['MERN Stack','Leadership','Teaching']) AS s;

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'extra_curricular', 'Founder — AI Reading Group', 'NIT Karnataka',
        'Started a fortnightly paper-reading group covering transformers, diffusion models and RL; grew to 80+ members.',
        '2021-01-01', '2022-05-31', 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Machine Learning','Public Speaking','Community Building']) AS s;

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'extra_curricular', 'Volunteer Coding Mentor', 'Code for Kids Foundation',
        'Teaches weekend Python and Scratch classes to underprivileged school students.',
        '2022-09-01', NULL, 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Mentoring','Python']) AS s;

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'extra_curricular', 'Hackathon Mentor & Judge', 'Major League Hacking (MLH) events',
        'Mentors student teams on system design and ML integration, and judges at 3–4 hackathons a year.',
        '2023-01-01', NULL, 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Mentoring','System Design']) AS s;

    -- ========================================================
    -- OTHERS (4)
    -- ========================================================

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'others', 'Open-Source Contributor — LangChain & FastAPI', 'Open Source',
        'Merged 12 PRs across LangChain (pgvector retriever fixes, docs) and FastAPI (dependency-injection edge cases).',
        '2023-06-01', NULL, 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Open Source','Python','LangChain','FastAPI']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://github.com/pulls?q=author%3Aseed-dev', 'Merged PRs', 'List of contributions');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'others', 'Conference Talk — "Shipping RAG to Production"', 'PyCon India 2025',
        'Talk on evaluation, latency budgets and failure modes when deploying retrieval-augmented LLM apps.',
        '2025-09-20', NULL, 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['RAG','LLMs','Public Speaking']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://www.youtube.com/watch?v=seedtalk01', 'Talk Recording', 'YouTube recording');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'others', 'Technical Blog — 30+ Articles', 'Hashnode',
        'Writes about web performance, PostgreSQL internals and applied ML; 150k+ total reads.',
        '2022-01-01', NULL, 'active')
    RETURNING re_id INTO rid;
    INSERT INTO skills (skill_name, user_id, re_id)
    SELECT s, uid, rid FROM unnest(ARRAY['Technical Writing','PostgreSQL','Web Performance']) AS s;
    INSERT INTO links (user_id, re_id, link, title, description) VALUES
    (uid, rid, 'https://seeddev.hashnode.dev', 'Blog', 'All articles');

    INSERT INTO resume_entity (user_id, re_type, title, subtitle, description, from_date, to_date, status)
    VALUES (uid, 'others', 'Languages', 'English (Fluent), Hindi (Native), Kannada (Conversational)',
        'Comfortable working in distributed, multilingual teams.',
        NULL, NULL, 'active');

    RAISE NOTICE 'Seed data inserted for user %', uid;
END
$seed$;
