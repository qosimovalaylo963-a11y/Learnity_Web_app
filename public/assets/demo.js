const INITIAL_SEED_STATE = {
    users: [
        {
            id: 1,
            full_name: 'Learnity Platform Owner',
            email: 'owner@learnity.org',
            password_plain_demo: 'Learnity!Owner#2026',
            role: 'OWNER',
            status: 'active',
            phone_or_telegram: '+998 90 000 00 01',
            bio: 'Founder & Principal Architect of Learnity — The Lively Teaching Project.',
            can_generate_codes: true,
            can_invite_members: true,
            can_create_announcements: true,
            delegatable_permissions: {
                can_access_subject: true,
                can_view_materials: true,
                can_upload_materials: true,
                can_publish_materials: true,
                can_create_links: true,
                can_upload_videos: true,
                can_invite_members: true,
                can_generate_codes: true,
            },
        },
        {
            id: 2,
            full_name: 'Dr. Aziza Karimova',
            email: 'aziza.staff@learnity.org',
            password_plain_demo: 'Staff!Bio#2026',
            role: 'STAFF',
            status: 'active',
            phone_or_telegram: '+998 90 111 22 33',
            bio: 'Senior Molecular Biology & Research Methodology Lead Mentor.',
            can_generate_codes: true,
            can_invite_members: true,
            can_create_announcements: true,
            delegatable_permissions: {
                can_access_subject: true,
                can_view_materials: true,
                can_upload_materials: true,
                can_create_links: true,
            },
        },
        {
            id: 3,
            full_name: 'Javohirbek Mirzayev',
            email: 'javohir.staff@learnity.org',
            password_plain_demo: 'Staff!Code#2026',
            role: 'STAFF',
            status: 'active',
            phone_or_telegram: '+998 90 222 33 44',
            bio: 'Lead Systems Architect & Algorithm Clinic Instructor.',
            can_generate_codes: false,
            can_invite_members: false,
            can_create_announcements: true,
            delegatable_permissions: {},
        },
        {
            id: 4,
            full_name: 'Jasmina Alimova',
            email: 'jasmina.member@learnity.org',
            password_plain_demo: 'Member!Pass#2026',
            role: 'MEMBER',
            status: 'active',
            phone_or_telegram: '+998 93 555 66 77',
            bio: 'Autumn/Winter Cohort Student focusing on Biology, Chemistry & Programming.',
            can_generate_codes: true,
            can_invite_members: true,
            can_create_announcements: false,
            delegatable_permissions: {
                can_access_subject: true,
                can_view_materials: true,
                can_upload_materials: true,
            },
        },
    ],
    subjects: [
        {
            id: 1,
            slug: 'computer-science',
            name: 'Computer Science',
            category: 'Computing & Algorithms',
            short_description:
                'Algorithms, data structures, software engineering, and hands-on system architecture.',
            intro_html:
                'Build production software systems, master algorithmic problem-solving, debug live codebases in 1-on-1 clinics, and ship collaborative team projects.',
            icon_name: 'terminal',
            accent_color: '#f97316',
            lead_instructor: 'Javohirbek Mirzayev',
            schedule_label: 'Tue, Thu & Sat · 19:00 UZT',
            display_order: 1,
        },
        {
            id: 2,
            slug: 'biology',
            name: 'Biology',
            category: 'Life & Molecular Sciences',
            short_description:
                'Cellular systems, genetics, wet-lab microscopy protocols, and physiological modeling.',
            intro_html:
                'Explore molecular biology, genetics, cellular respiration, and ecological systems through interactive laboratory protocols, microscopy walks, and peer case studies.',
            icon_name: 'dna',
            accent_color: '#10b981',
            lead_instructor: 'Dr. Aziza Karimova',
            schedule_label: 'Tue & Thu · 17:30 UZT',
            display_order: 2,
        },
        {
            id: 3,
            slug: 'chemistry',
            name: 'Chemistry',
            category: 'Physical & Organic Sciences',
            short_description:
                'Stoichiometry, organic synthesis mechanisms, titration labs, and thermochemistry.',
            intro_html:
                'Master reaction kinetics, molecular orbital theory, analytical titration techniques, and organic synthesis mechanisms with guided workshop problem sets.',
            icon_name: 'flask-conical',
            accent_color: '#f59e0b',
            lead_instructor: 'Sardor Rakhimov',
            schedule_label: 'Mon & Wed · 18:00 UZT',
            display_order: 3,
        },
        {
            id: 4,
            slug: 'mathematics',
            name: 'Mathematics',
            category: 'Pure & Applied Analysis',
            short_description:
                'Multivariable calculus, linear algebra, combinatorics, and proof construction.',
            intro_html:
                'Develop rigorous proof writing, linear algebra intuition, differential equations modeling, and competitive problem-solving strategies.',
            icon_name: 'sigma',
            accent_color: '#ec4899',
            lead_instructor: 'Prof. Rustam Yuldashev',
            schedule_label: 'Tue & Sat · 16:00 UZT',
            display_order: 4,
        },
        {
            id: 5,
            slug: 'economics',
            name: 'Economics',
            category: 'Markets & Policy Analysis',
            short_description: 'Microeconomic theory, macroeconomic modeling, game theory, and econometrics.',
            intro_html:
                'Analyze market equilibria, monetary and fiscal policy, behavioral incentives, and empirical datasets through real-world economic case studies.',
            icon_name: 'trending-up',
            accent_color: '#38bdf8',
            lead_instructor: 'Madina Saidova',
            schedule_label: 'Mon & Thu · 16:30 UZT',
            display_order: 5,
        },
        {
            id: 6,
            slug: 'business',
            name: 'Business',
            category: 'Strategy & Entrepreneurship',
            short_description:
                'Corporate strategy, financial modeling, product operations, and venture building.',
            intro_html:
                'Evaluate unit economics, competitive strategy, organizational design, and go-to-market execution in interactive Harvard-style case workshops.',
            icon_name: 'briefcase',
            accent_color: '#a855f7',
            lead_instructor: 'Madina Saidova',
            schedule_label: 'Fridays · 18:00 UZT',
            display_order: 6,
        },
        {
            id: 7,
            slug: 'global-politics',
            name: 'Global Politics',
            category: 'International Relations & Governance',
            short_description:
                'Geopolitics, comparative governance, diplomacy simulations, and policy debate.',
            intro_html:
                'Examine international institutions, sovereignty, human rights frameworks, and conflict resolution through structured diplomatic simulations and debates.',
            icon_name: 'globe',
            accent_color: '#14b8a6',
            lead_instructor: 'Dr. Aziza Karimova',
            schedule_label: 'Saturdays · 14:00 UZT',
            display_order: 7,
        },
        {
            id: 8,
            slug: 'physics',
            name: 'Physics',
            category: 'Mechanics & Electromagnetism',
            short_description:
                'Classical mechanics, circuit analysis, wave optics, and experimental telemetry.',
            intro_html:
                'Bridge mathematical derivation with physical intuition through sensor experiments, circuit prototyping, and olympiad-grade mechanics clinics.',
            icon_name: 'atom',
            accent_color: '#6366f1',
            lead_instructor: 'Timur Alimov',
            schedule_label: 'Wed & Fri · 17:00 UZT',
            display_order: 8,
        },
    ],
    user_subjects: [
        // Dr. Aziza (user 2): Biology (2) & Global Politics (7)
        {
            user_id: 2,
            subject_id: 2,
            can_access_subject: 1,
            can_view_materials: 1,
            can_upload_materials: 1,
            can_publish_materials: 1,
            can_create_links: 1,
            can_upload_videos: 1,
            can_moderate: 1,
        },
        {
            user_id: 2,
            subject_id: 7,
            can_access_subject: 1,
            can_view_materials: 1,
            can_upload_materials: 1,
            can_publish_materials: 1,
            can_create_links: 1,
            can_upload_videos: 1,
            can_moderate: 1,
        },
        // Javohirbek (user 3): Computer Science (1), Mathematics (4), Physics (8)
        {
            user_id: 3,
            subject_id: 1,
            can_access_subject: 1,
            can_view_materials: 1,
            can_upload_materials: 1,
            can_publish_materials: 1,
            can_create_links: 1,
            can_upload_videos: 1,
            can_moderate: 0,
        },
        {
            user_id: 3,
            subject_id: 4,
            can_access_subject: 1,
            can_view_materials: 1,
            can_upload_materials: 1,
            can_publish_materials: 1,
            can_create_links: 1,
            can_upload_videos: 1,
            can_moderate: 0,
        },
        {
            user_id: 3,
            subject_id: 8,
            can_access_subject: 1,
            can_view_materials: 1,
            can_upload_materials: 1,
            can_publish_materials: 1,
            can_create_links: 1,
            can_upload_videos: 1,
            can_moderate: 0,
        },
        // Jasmina (user 4, Member): Computer Science (1), Biology (2), Chemistry (3)
        {
            user_id: 4,
            subject_id: 1,
            can_access_subject: 1,
            can_view_materials: 1,
            can_upload_materials: 1,
            can_publish_materials: 0,
            can_create_links: 1,
            can_upload_videos: 1,
            can_moderate: 0,
        },
        {
            user_id: 4,
            subject_id: 2,
            can_access_subject: 1,
            can_view_materials: 1,
            can_upload_materials: 1,
            can_publish_materials: 0,
            can_create_links: 1,
            can_upload_videos: 0,
            can_moderate: 0,
        },
        {
            user_id: 4,
            subject_id: 3,
            can_access_subject: 1,
            can_view_materials: 1,
            can_upload_materials: 0,
            can_publish_materials: 0,
            can_create_links: 0,
            can_upload_videos: 0,
            can_moderate: 0,
        },
    ],
    staff_profiles: [
        {
            id: 1,
            user_id: 2,
            full_name: 'Dr. Aziza Karimova',
            position: 'Lead Biology & Research Mentor',
            department: 'Life Sciences & Methodology',
            photo_url: 'assets/photos/1573496359142-b8d87734a5a2.webp',
            bio: 'PhD in Molecular Genetics. Leads wet-lab microscopy workshops and undergraduate research publication clinics.',
            responsibilities:
                'Biology curriculum design, microscopy workshops, Capstone research supervision',
            assigned_subjects_label: 'Biology, Research Skills',
            display_order: 1,
            is_visible: 1,
        },
        {
            id: 2,
            user_id: 3,
            full_name: 'Javohirbek Mirzayev',
            position: 'Principal Algorithms & Programming Instructor',
            department: 'STEM & Algorithm Lab',
            photo_url: 'assets/photos/1534528741775-53994a69daeb.webp',
            bio: 'Senior Systems Engineer & competitive programming coach specializing in data structures and interactive web architectures.',
            responsibilities:
                '1-on-1 debugging clinics, hackathon sprint mentorship, Programming & Mathematics labs',
            assigned_subjects_label: 'Programming, Mathematics, Physics',
            display_order: 2,
            is_visible: 1,
        },
        {
            id: 3,
            user_id: null,
            full_name: 'Madina Saidova',
            position: 'Academic Writing & Debate Coordinator',
            department: 'Humanities & Rhetoric',
            photo_url: 'assets/photos/1580489944761-15a19d654956.webp',
            bio: 'Fulbright scholar and parliamentary debate adjudicator guiding students in analytical rhetoric and scholarly publishing.',
            responsibilities: 'Parliamentary debate tournaments, essay peer-review studios, English seminars',
            assigned_subjects_label: 'English, Academic Writing',
            display_order: 3,
            is_visible: 1,
        },
        {
            id: 4,
            user_id: null,
            full_name: 'Sardor Rakhimov',
            position: 'Chemistry & Experimental Lab Specialist',
            department: 'Physical Sciences',
            photo_url: 'assets/photos/1507003211169-0a1dd7228f2d.webp',
            bio: 'Analytical chemist passionate about transforming textbook stoichiometry into vivid, hands-on reaction laboratories.',
            responsibilities: 'Lab safety & titration protocols, organic synthesis workshops',
            assigned_subjects_label: 'Chemistry',
            display_order: 4,
            is_visible: 1,
        },
    ],
    resources: [
        {
            id: 1,
            subject_id: 1,
            author_user_id: 2,
            author_name: 'Dr. Aziza Karimova',
            title: 'Cellular Respiration & ATP Synthase Wet-Lab Protocol',
            description:
                'Step-by-step spectrophotometry lab guide and mitochondrial electron transport chain problem set.',
            resource_type: 'pdf',
            category: 'Laboratory Protocols',
            external_url: 'https://openstax.org/books/biology-2e/pages/7-introduction',
            duration_or_size: '2.4 MB PDF · 18 Pages',
            moderation_status: 'Published',
            is_featured: 1,
            created_at: '2026-11-01 10:00:00',
        },
        {
            id: 2,
            subject_id: 1,
            author_user_id: 2,
            author_name: 'Dr. Aziza Karimova',
            title: 'CRISPR-Cas9 Gene Editing Visual Seminar',
            description: 'Recorded walkthrough of guide-RNA design and off-target cleavage analysis.',
            resource_type: 'youtube',
            category: 'Video Lessons',
            external_url: 'https://www.youtube.com/watch?v=2pp17E4E-O8',
            duration_or_size: '24 min Video',
            moderation_status: 'Published',
            is_featured: 1,
            created_at: '2026-11-02 14:30:00',
        },
        {
            id: 3,
            subject_id: 2,
            author_user_id: 1,
            author_name: 'Sardor Rakhimov',
            title: 'Acid-Base Titration Curves & Buffer Equilibrium Deck',
            description:
                'Interactive lecture slides covering Henderson-Hasselbalch derivations and equivalence point indicators.',
            resource_type: 'presentation',
            category: 'Lecture Slides',
            external_url: 'https://chem.libretexts.org/',
            duration_or_size: '42 Slides · PPTX/PDF',
            moderation_status: 'Published',
            is_featured: 1,
            created_at: '2026-11-03 11:15:00',
        },
        {
            id: 4,
            subject_id: 3,
            author_user_id: 1,
            author_name: 'Timur Alimov',
            title: 'RC & RLC Oscillating Circuits Telemetry Lab',
            description: 'Oscilloscope measurement workbook and damping factor calculation templates.',
            resource_type: 'study_guide',
            category: 'Experimental Labs',
            external_url: 'https://phet.colorado.edu/en/simulations/circuit-construction-kit-ac',
            duration_or_size: 'Interactive Sim + Guide',
            moderation_status: 'Published',
            is_featured: 1,
            created_at: '2026-11-04 09:00:00',
        },
        {
            id: 5,
            subject_id: 4,
            author_user_id: 1,
            author_name: 'Prof. Rustam Yuldashev',
            title: 'Eigenvalues, Diagonalization & Spectral Theorem Clinic',
            description:
                'Problem set with geometric visualizations of linear transformations and invariant subspaces.',
            resource_type: 'pdf',
            category: 'Problem Sets',
            external_url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/',
            duration_or_size: '1.8 MB PDF · 22 Problems',
            moderation_status: 'Published',
            is_featured: 1,
            created_at: '2026-11-05 16:00:00',
        },
        {
            id: 6,
            subject_id: 5,
            author_user_id: 1,
            author_name: 'Madina Saidova',
            title: 'British Parliamentary Debate Motion Framing & Rebuttal Guide',
            description:
                'Structured framework for constructing principled arguments, whip speeches, and points of information.',
            resource_type: 'study_guide',
            category: 'Debate & Rhetoric',
            external_url: 'https://writingcenter.fas.harvard.edu/pages/strategies-essay-writing',
            duration_or_size: '14-Page Handbook',
            moderation_status: 'Published',
            is_featured: 1,
            created_at: '2026-11-06 12:00:00',
        },
        {
            id: 7,
            subject_id: 6,
            author_user_id: 1,
            author_name: 'Madina Saidova',
            title: 'Writing Systematic Literature Reviews & APA 7th Reference Architecture',
            description:
                'Template and annotated exemplar showing synthesis matrices and transition cohesion.',
            resource_type: 'pdf',
            category: 'Manuscript Templates',
            external_url:
                'https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_style_introduction.html',
            duration_or_size: '1.5 MB PDF',
            moderation_status: 'Published',
            is_featured: 1,
            created_at: '2026-11-07 15:20:00',
        },
        {
            id: 8,
            subject_id: 7,
            author_user_id: 2,
            author_name: 'Dr. Aziza Karimova',
            title: 'Experimental Hypothesis Testing & P-Value Interpretation',
            description:
                'Workshop presentation on sample size estimation, confidence intervals, and avoiding p-hacking.',
            resource_type: 'presentation',
            category: 'Research Methodology',
            external_url: 'https://www.nature.com/collections/qghhqm',
            duration_or_size: '36 Slides',
            moderation_status: 'Published',
            is_featured: 1,
            created_at: '2026-11-08 10:10:00',
        },
        {
            id: 9,
            subject_id: 8,
            author_user_id: 3,
            author_name: 'Javohirbek Mirzayev',
            title: 'Graph Algorithms, Dijkstra & Dynamic Programming Live Clinic',
            description: 'Annotated code repository, complexity proofs, and visual trace walkthroughs.',
            resource_type: 'youtube',
            category: 'Algorithm Clinics',
            external_url: 'https://cp-algorithms.com/',
            duration_or_size: '38 min Clinic + Repo',
            moderation_status: 'Published',
            is_featured: 1,
            created_at: '2026-11-08 18:45:00',
        },
    ],
    applications: [
        {
            id: 1,
            application_uid: 'LRN-APP-901A',
            full_name: 'Dilshodabonu Rustamova',
            email: 'dilshoda.r@example.com',
            phone_or_telegram: '+998 90 945 12 34',
            requested_role: 'MEMBER',
            interested_subjects: '["Biology","Chemistry","Research Skills"]',
            track: 'STEM & Algorithm Lab',
            schedule_preference: 'Weekday Intensive',
            educational_background:
                '2nd-year BSc Biotechnology undergraduate at National University of Uzbekistan.',
            motivation_statement:
                'I want to transition from passive textbook reading to designing wet-lab experiments and preparing a research paper for Demo Day.',
            status: 'Pending',
            review_notes: '',
            created_at: '2026-11-08 11:20:00',
            email_notification_sent: 0,
            email_delivery_detail: 'Saved to database & Owner Dashboard',
        },
        {
            id: 2,
            application_uid: 'LRN-APP-902B',
            full_name: 'Bekzod Nurmatov',
            email: 'bekzod.dev@example.com',
            phone_or_telegram: '@bekzod_codes',
            requested_role: 'STAFF',
            interested_subjects: '["Programming","Mathematics"]',
            track: 'Peer Mentorship & Teaching Practicum',
            schedule_preference: 'Weekend Labs',
            educational_background: 'Senior Computer Engineering student & ICPC regional finalist.',
            motivation_statement:
                'Excited to mentor small student groups in graph algorithms and code review clinics.',
            status: 'Pending',
            review_notes: '',
            created_at: '2026-11-08 15:40:00',
            email_notification_sent: 0,
            email_delivery_detail: 'Saved to database & Owner Dashboard',
        },
        {
            id: 3,
            application_uid: 'LRN-APP-903C',
            full_name: 'Malika Umarova',
            email: 'malika.u@example.com',
            phone_or_telegram: '+998 93 321 88 99',
            requested_role: 'MEMBER',
            interested_subjects: '["English","Academic Writing"]',
            track: 'Academic English & Public Debate',
            schedule_preference: 'Weekday Intensive',
            educational_background:
                'High school senior preparing for international university research fellowships.',
            motivation_statement:
                'Looking to sharpen my analytical essay structure and parliamentary debate skills.',
            status: 'Approved',
            review_notes: 'Strong writing portfolio.',
            created_at: '2026-11-07 09:15:00',
            email_notification_sent: 1,
            email_delivery_detail: 'Delivered',
        },
    ],
    invitation_codes: [
        {
            id: 1,
            plain_demo_only: 'LRN-STEM-2026-JOIN',
            code_prefix: 'LRN-STEM-••••',
            target_role: 'MEMBER',
            issuer_user_id: 1,
            issuer_name: 'Learnity Platform Owner',
            label: 'Autumn STEM Cohort Starter Invite',
            max_uses: 10,
            uses_count: 0,
            expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
            status: 'active',
            permissions: [
                {
                    subject_id: 1,
                    subject_name: 'Biology',
                    subject_slug: 'biology',
                    can_access_subject: 1,
                    can_view_materials: 1,
                    can_upload_materials: 1,
                    can_publish_materials: 0,
                    can_create_links: 1,
                    can_upload_videos: 0,
                    can_invite_members: 0,
                    can_generate_codes: 0,
                },
                {
                    subject_id: 2,
                    subject_name: 'Chemistry',
                    subject_slug: 'chemistry',
                    can_access_subject: 1,
                    can_view_materials: 1,
                    can_upload_materials: 1,
                    can_publish_materials: 0,
                    can_create_links: 1,
                    can_upload_videos: 0,
                    can_invite_members: 0,
                    can_generate_codes: 0,
                },
                {
                    subject_id: 4,
                    subject_name: 'Mathematics',
                    subject_slug: 'mathematics',
                    can_access_subject: 1,
                    can_view_materials: 1,
                    can_upload_materials: 1,
                    can_publish_materials: 0,
                    can_create_links: 1,
                    can_upload_videos: 0,
                    can_invite_members: 0,
                    can_generate_codes: 0,
                },
                {
                    subject_id: 8,
                    subject_name: 'Programming',
                    subject_slug: 'programming',
                    can_access_subject: 1,
                    can_view_materials: 1,
                    can_upload_materials: 1,
                    can_publish_materials: 0,
                    can_create_links: 1,
                    can_upload_videos: 0,
                    can_invite_members: 0,
                    can_generate_codes: 0,
                },
            ],
        },
    ],
    announcements: [
        {
            id: 1,
            subject_id: null,
            subject_name: 'Platform-Wide',
            author_name: 'Learnity Academic Council',
            title: 'Autumn/Winter Cohort Live Lab Schedule & Demo Day Milestones',
            body: 'Welcome to the Learnity interactive ecosystem. Weekly small-group lab sessions begin this Monday. Check your assigned Subject Hubs for pre-lab readings and equipment checklists.',
            priority: 'important',
            audience: 'all',
            is_pinned: 1,
            created_at: '2026-11-08 09:00:00',
        },
        {
            id: 2,
            subject_id: 1,
            subject_name: 'Biology',
            author_name: 'Dr. Aziza Karimova',
            title: 'Fluorescence Microscopy Lab Preparation',
            body: "Please review the ATP Synthase spectrophotometry protocol PDF before Thursday's wet-lab session.",
            priority: 'normal',
            audience: 'subject',
            is_pinned: 1,
            created_at: '2026-11-08 14:00:00',
        },
    ],
    activity_logs: [
        {
            id: 1,
            actor_name: 'Learnity Platform Owner',
            actor_role: 'OWNER',
            action_type: 'SYSTEM_BOOT',
            description:
                'Initialized Learnity database schema, 8 core subjects, persistent media library, and role-based access control.',
            ip_address: '127.0.0.1',
            created_at: '2026-11-09 09:00:00',
        },
    ],
    templates: [
        {
            template_key: 'application_received_owner',
            subject: '[Learnity] New {{requested_role}} Application — {{full_name}} ({{application_uid}})',
            body: 'Hello Learnity Owner,\n\nA new {{requested_role}} application has been submitted by {{full_name}} ({{email}}).\nSubjects: {{interested_subjects}}\nMotivation: {{motivation_statement}}',
        },
        {
            template_key: 'application_status_applicant',
            subject: 'Update on Your Learnity Application ({{application_uid}}) — {{status}}',
            body: 'Hello {{full_name}},\n\nYour application ({{application_uid}}) has been updated to {{status}}.\nNotes: {{review_notes}}\n{{invitation_section}}',
        },
    ],
    activeSessionUserId: null,
};

const demoKey = 'learnity_v3_1_db';
const previewSchemas = {
    users: (r) =>
        Number.isSafeInteger(r.id) &&
        typeof r.full_name === 'string' &&
        typeof r.email === 'string' &&
        ['OWNER', 'STAFF', 'MEMBER'].includes(r.role) &&
        ['active', 'disabled', 'suspended'].includes(r.status),
    subjects: (r) => Number.isSafeInteger(r.id) && validSlug(r.slug) && typeof r.name === 'string',
    user_subjects: (r) => Number.isSafeInteger(r.user_id) && Number.isSafeInteger(r.subject_id),
    staff_profiles: (r) => Number.isSafeInteger(r.id) && typeof r.full_name === 'string',
    resources: (r) =>
        Number.isSafeInteger(r.id) && Number.isSafeInteger(r.subject_id) && typeof r.title === 'string',
    applications: (r) =>
        Number.isSafeInteger(r.id) && typeof r.full_name === 'string' && typeof r.email === 'string',
    invitation_codes: (r) =>
        Number.isSafeInteger(r.id) &&
        ['STAFF', 'MEMBER'].includes(r.target_role) &&
        Number.isInteger(r.max_uses) &&
        Number.isInteger(r.uses_count) &&
        Number.isFinite(Date.parse(r.expires_at)) &&
        Array.isArray(r.permissions) &&
        r.permissions.every((v) => plainRecord(v) && Number.isSafeInteger(v.subject_id)),
    announcements: (r) => Number.isSafeInteger(r.id) && typeof r.title === 'string',
    activity_logs: (r) => Number.isSafeInteger(r.id) && typeof r.description === 'string',
    templates: (r) =>
        typeof r.template_key === 'string' && typeof r.body === 'string' && typeof r.subject === 'string',
};
function loadLocalDb() {
    const fallback = structuredClone(INITIAL_SEED_STATE);
    let snapshot;
    try {
        const raw = localStorage.getItem(demoKey);
        snapshot = raw && raw.length <= 16000000 ? jsonValue(raw, plainRecord, null) : null;
    } catch {
        snapshot = null;
    }
    if (!snapshot) return fallback;
    for (const [key, valid] of Object.entries(previewSchemas)) {
        if (
            Array.isArray(snapshot[key]) &&
            snapshot[key].length <= 20000 &&
            snapshot[key].every((row) => plainRecord(row) && valid(row))
        )
            fallback[key] = snapshot[key];
    }
    if (!fallback.users.some((u) => u.role === 'OWNER'))
        fallback.users = structuredClone(INITIAL_SEED_STATE.users);
    fallback.activeSessionUserId = fallback.users.some(
        (u) => u.id === snapshot.activeSessionUserId && u.status === 'active',
    )
        ? snapshot.activeSessionUserId
        : null;
    if (plainRecord(snapshot.siteContent)) {
        const x = snapshot.siteContent;
        fallback.siteContent = {
            heroPhotoState: safePhotoState(x.heroPhotoState),
            lessonCards: safeCards(x.lessonCards),
            pageTexts: plainRecord(x.pageTexts) ? x.pageTexts : {},
            logoUrl: safeUrl(x.logoUrl, true),
        };
    }
    for (const user of fallback.users) {
        if (!user.credential && !user.password_plain_demo) {
            const seed = INITIAL_SEED_STATE.users.find((u) => u.id === user.id && u.email === user.email);
            if (seed) user.password_plain_demo = seed.password_plain_demo;
        }
    }
    return fallback;
}
let storageWarning = false;
function saveLocalDb(state) {
    try {
        localStorage.setItem(
            demoKey,
            JSON.stringify(state, (key, value) => (key === 'password_plain_demo' ? undefined : value)),
        );
        return true;
    } catch {
        if (!storageWarning) {
            storageWarning = true;
            notifyToast('Browser storage is unavailable or full. Demo changes will last for this tab only.');
        }
        return false;
    }
}
const localDb = loadLocalDb();
const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
async function previewCredential(password, salt = toHex(crypto.getRandomValues(new Uint8Array(16)))) {
    if (!crypto.subtle)
        throw new Error('Open the preview on localhost, HTTPS, or from the extracted folder to sign in.');
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
        'deriveBits',
    ]);
    const bits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: Uint8Array.from(salt.match(/../g), (v) => parseInt(v, 16)),
            iterations: 180000,
            hash: 'SHA-256',
        },
        key,
        256,
    );
    return salt + '.' + toHex(new Uint8Array(bits));
}
async function migratePreviewUsers() {
    for (const user of localDb.users) {
        if (typeof user.password_plain_demo === 'string') {
            user.credential = await previewCredential(user.password_plain_demo);
            delete user.password_plain_demo;
        }
    }
    saveLocalDb(localDb);
}
let credentialSetup;
async function ensureDemoCredentials() {
    if (!credentialSetup)
        credentialSetup = migratePreviewUsers().catch((error) => {
            credentialSetup = null;
            throw error;
        });
    await credentialSetup;
}
const demoReady = crypto.subtle ? ensureDemoCredentials().catch(() => {}) : Promise.resolve();
function demoDownload(name, type, body) {
    const link = document.createElement('a'),
        url = URL.createObjectURL(new Blob([body], { type }));
    link.href = url;
    link.download = name;
    link.rel = 'noopener noreferrer';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function demoCsv(event) {
    if (!isPreview) return;
    event.preventDefault();
    if (currentUser?.role !== 'OWNER') return;
    const fields = [
        'application_uid',
        'full_name',
        'email',
        'phone_or_telegram',
        'requested_role',
        'interested_subjects',
        'track',
        'schedule_preference',
        'status',
        'created_at',
        'review_notes',
    ];
    const cell = (value) =>
        '"' +
        String(value ?? '')
            .replace(/^(?=\s*[=+@-]|[\t\r])/, "'")
            .replace(/"/g, '""') +
        '"';
    const rows = [
        fields.join(','),
        ...localDb.applications.map((a) => fields.map((f) => cell(a[f])).join(',')),
    ];
    demoDownload('learnity-applications.csv', 'text/csv;charset=utf-8', rows.join('\r\n'));
}
function enrichLocalUser(u) {
    if (!u) return null;
    const subjPerms = localDb.user_subjects
        .filter((us) => us.user_id === u.id)
        .map((us) => {
            const s = localDb.subjects.find((sub) => sub.id === us.subject_id);
            return { ...us, subject_slug: s ? s.slug : '', subject_name: s ? s.name : '' };
        });
    const subjectPermMap = {};
    subjPerms.forEach((sp) => {
        subjectPermMap[sp.subject_id] = sp;
        if (sp.subject_slug) subjectPermMap[sp.subject_slug] = sp;
    });
    return {
        ...Object.fromEntries(
            Object.entries(u).filter(([key]) => !['credential', 'password_plain_demo'].includes(key)),
        ),
        can_generate_codes: Boolean(u.can_generate_codes || u.role === 'OWNER'),
        can_invite_members: Boolean(u.can_invite_members || u.role === 'OWNER'),
        can_create_announcements: Boolean(u.can_create_announcements || u.role === 'OWNER'),
        subjectPermissions: subjPerms,
        subjectPermMap,
    };
}

async function localApiFallback(url, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    let body = {};
    if (options.body && typeof options.body === 'string') {
        body = jsonValue(options.body, plainRecord, null);
        if (!body || Object.keys(body).some((k) => ['constructor', '__proto__', 'prototype'].includes(k)))
            throw new Error('Invalid form data.');
    }
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    const sessUser = enrichLocalUser(localDb.users.find((u) => u.id === localDb.activeSessionUserId));

    if (
        /^\/api\/(owner|admin)\//.test(pathname) &&
        !pathname.endsWith('/login') &&
        !pathname.endsWith('/logout') &&
        sessUser?.role !== 'OWNER'
    )
        throw new Error('Owner authorization required.');
    if (
        method !== 'GET' &&
        ![
            '/api/applications',
            '/api/auth/login',
            '/api/admin/login',
            '/api/auth/register-invite',
            '/api/invitations/verify',
        ].includes(pathname) &&
        !sessUser
    )
        throw new Error('Sign in to continue.');
    const addLog = (actionType, desc) => {
        localDb.activity_logs.unshift({
            id: Date.now(),
            actor_name: sessUser ? sessUser.full_name : 'Visitor',
            actor_role: sessUser ? sessUser.role : 'VISITOR',
            action_type: actionType,
            description: desc,
            ip_address: '127.0.0.1',
            created_at: new Date().toISOString(),
        });
        saveLocalDb(localDb);
    };

    if (pathname === '/api/public/stats' && method === 'GET') {
        return {
            applicationsCount: localDb.applications.length,
            membersCount: localDb.users.filter((u) => u.role === 'MEMBER' && u.status === 'active').length,
            staffCount: localDb.staff_profiles.filter((s) => s.is_visible).length,
            subjectsCount: localDb.subjects.length,
            resourcesCount: localDb.resources.filter((r) => r.moderation_status === 'Published').length,
            mediaCount: lessonCards.length + 1,
        };
    }

    if (pathname === '/api/site-content' && method === 'GET') {
        const content = localDb.siteContent || {
            heroPhotoState,
            lessonCards,
            pageTexts: savedPageTexts,
            logoUrl: '',
        };
        return {
            content: {
                ...content,
                lessonCards:
                    sessUser?.role === 'OWNER'
                        ? content.lessonCards
                        : content.lessonCards.filter((c) => !c.is_archived && c.is_visible !== false),
            },
        };
    }

    if (
        (pathname === '/api/admin/site-content' || pathname === '/api/owner/site-content') &&
        method === 'PUT'
    ) {
        if (!sessUser || sessUser.role !== 'OWNER') throw new Error('Owner authorization required.');
        localDb.siteContent = {
            heroPhotoState: safePhotoState(body.heroPhotoState),
            lessonCards: safeCards(body.lessonCards),
            pageTexts: plainRecord(body.pageTexts) ? body.pageTexts : {},
            logoUrl: safeUrl(body.logoUrl, true),
        };
        addLog('SITE_CONTENT_UPDATED', 'Updated public website text and gallery framing.');
        return { ok: true };
    }

    if (pathname === '/api/auth/me' && method === 'GET') {
        return { authenticated: Boolean(sessUser), user: sessUser };
    }

    if ((pathname === '/api/auth/login' || pathname === '/api/admin/login') && method === 'POST') {
        const email = String(body.email || '')
            .trim()
            .toLowerCase();
        const pass = String(body.password || '');
        const found = email
            ? localDb.users.find((u) => u.email.toLowerCase() === email)
            : localDb.users.find((u) => u.role === 'OWNER');
        await ensureDemoCredentials();
        if (
            !found ||
            !/^[0-9a-f]{32}\.[0-9a-f]{64}$/.test(found.credential) ||
            (await previewCredential(pass, found.credential.split('.')[0])) !== found.credential
        ) {
            throw new Error('Invalid credentials. Please verify your email and password.');
        }
        if (found.status !== 'active') throw new Error(`Account is ${found.status}.`);
        localDb.activeSessionUserId = found.id;
        saveLocalDb(localDb);
        const enriched = enrichLocalUser(found);
        addLog('LOGIN_SUCCESS', `${enriched.role} signed in (${enriched.email}).`);
        return { ok: true, user: enriched, csrfToken: 'local-csrf' };
    }

    if ((pathname === '/api/auth/logout' || pathname === '/api/admin/logout') && method === 'POST') {
        localDb.activeSessionUserId = null;
        saveLocalDb(localDb);
        return { ok: true };
    }

    if (pathname === '/api/auth/profile' && method === 'PUT') {
        if (!sessUser) throw new Error('Authentication required.');
        const u = localDb.users.find((x) => x.id === sessUser.id);
        if (body.full_name) u.full_name = String(body.full_name).trim();
        if (body.phone_or_telegram !== undefined) u.phone_or_telegram = String(body.phone_or_telegram).trim();
        if (body.bio !== undefined) u.bio = String(body.bio).trim();
        if (body.new_password) {
            await ensureDemoCredentials();
            u.credential = await previewCredential(String(body.new_password));
        }
        saveLocalDb(localDb);
        return { ok: true, user: enrichLocalUser(u) };
    }

    if (pathname === '/api/applications' && method === 'POST') {
        const uid = 'LRN-APP-' + Math.random().toString(36).slice(2, 6).toUpperCase();
        const subjs = Array.isArray(body.interested_subjects)
            ? body.interested_subjects
            : [body.track || 'Biology'];
        const newApp = {
            id: Date.now(),
            application_uid: uid,
            full_name: String(body.full_name || body.name || '').trim(),
            email: String(body.email || 'applicant@learnity.org').trim(),
            phone_or_telegram: String(body.phone_or_telegram || body.phone || '').trim(),
            requested_role:
                String(body.requested_role || 'MEMBER').toUpperCase() === 'STAFF' ? 'STAFF' : 'MEMBER',
            interested_subjects: JSON.stringify(subjs),
            track: String(body.track || subjs.join(', ')),
            schedule_preference: String(body.schedule_preference || body.schedule || 'Weekday Intensive'),
            educational_background: String(body.educational_background || ''),
            motivation_statement: String(body.motivation_statement || ''),
            status: 'Pending',
            review_notes: '',
            created_at: new Date().toISOString(),
            email_notification_sent: 0,
            email_delivery_detail:
                'Saved to database & Owner Dashboard (Configure OWNER_EMAIL & SMTP in .env for live email delivery)',
        };
        localDb.applications.unshift(newApp);
        addLog(
            'APPLICATION_SUBMITTED',
            `New ${newApp.requested_role} application ${uid} from ${newApp.full_name}.`,
        );
        return {
            ok: true,
            application: newApp,
            emailDelivery: { sent: false, detail: newApp.email_delivery_detail },
        };
    }

    if (
        (pathname === '/api/owner/applications' || pathname === '/api/admin/applications') &&
        method === 'GET'
    ) {
        if (!sessUser || sessUser.role !== 'OWNER') throw new Error('Owner authentication required.');
        return {
            applications: localDb.applications.map((r) => ({
                ...r,
                name: r.full_name,
                phone: r.phone_or_telegram,
                schedule: r.schedule_preference,
                createdAt: r.created_at,
                interested_subjects_list: jsonValue(
                    r.interested_subjects,
                    (a) => Array.isArray(a) && a.every((x) => typeof x === 'string'),
                    [],
                ),
            })),
        };
    }

    const appMatch = /^\/api\/(?:owner|admin)\/applications\/(\d+)$/.exec(pathname);
    if (appMatch && (method === 'PUT' || method === 'PATCH')) {
        if (!sessUser || sessUser.role !== 'OWNER') throw new Error('Owner authentication required.');
        const id = Number(appMatch[1]);
        const app = localDb.applications.find((a) => a.id === id);
        if (!app) throw new Error('Application not found.');
        if (body.status) app.status = body.status;
        if (body.review_notes !== undefined) app.review_notes = body.review_notes;
        let generatedInviteCard = null;
        if (app.status === 'Approved' && body.generate_invite) {
            const plainCode = `LRN-${toHex(crypto.getRandomValues(new Uint8Array(2))).toUpperCase()}-${toHex(crypto.getRandomValues(new Uint8Array(2))).toUpperCase()}-2026`;
            const invObj = {
                id: Date.now(),
                plain_demo_only: plainCode,
                code_prefix: plainCode.slice(0, 8) + '-••••',
                target_role: app.requested_role,
                issuer_user_id: sessUser.id,
                issuer_name: sessUser.full_name,
                label: `Approved ${app.application_uid}`,
                max_uses: 1,
                uses_count: 0,
                expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
                status: 'active',
                permissions: localDb.subjects.slice(0, 2).map((s) => ({
                    subject_id: s.id,
                    subject_name: s.name,
                    subject_slug: s.slug,
                    can_access_subject: 1,
                    can_view_materials: 1,
                    can_upload_materials: app.requested_role === 'STAFF' ? 1 : 0,
                    can_publish_materials: app.requested_role === 'STAFF' ? 1 : 0,
                    can_create_links: 1,
                    can_upload_videos: 0,
                    can_invite_members: 0,
                    can_generate_codes: 0,
                })),
            };
            localDb.invitation_codes.unshift(invObj);
            generatedInviteCard = {
                invitationId: invObj.id,
                plainCode,
                codePrefix: invObj.code_prefix,
                targetRole: invObj.target_role,
                subjects: invObj.permissions.map((p) => p.subject_name),
                expiresAt: invObj.expires_at,
            };
        }
        saveLocalDb(localDb);
        return { ok: true, application: app, generatedInviteCard };
    }

    if (appMatch && method === 'DELETE') {
        const id = Number(appMatch[1]);
        localDb.applications = localDb.applications.filter((a) => a.id !== id);
        saveLocalDb(localDb);
        return { ok: true };
    }

    if (pathname === '/api/invitations/verify' && method === 'POST') {
        const clean = String(body.code || '')
            .trim()
            .toUpperCase();
        const inv = localDb.invitation_codes.find((c) => (c.plain_demo_only || '').toUpperCase() === clean);
        if (!inv) throw new Error('Invalid invitation code. Try demo code: LRN-STEM-2026-JOIN');
        if (Date.parse(inv.expires_at) <= Date.now()) throw new Error('Invitation code has expired.');
        if (inv.status !== 'active') throw new Error(`Invitation code is ${inv.status}.`);
        if (inv.uses_count >= inv.max_uses) throw new Error('Invitation code has reached max uses.');
        return {
            valid: true,
            invitation: {
                id: inv.id,
                codePrefix: inv.code_prefix,
                targetRole: inv.target_role,
                issuerName: inv.issuer_name,
                label: inv.label,
                maxUses: inv.max_uses,
                usesCount: inv.uses_count,
                remainingUses: inv.max_uses - inv.uses_count,
                expiresAt: inv.expires_at,
                status: inv.status,
                permissions: inv.permissions,
            },
        };
    }

    if (pathname === '/api/auth/register-invite' && method === 'POST') {
        const clean = String(body.invitation_code || body.code || '')
            .trim()
            .toUpperCase();
        const inv = localDb.invitation_codes.find((c) => (c.plain_demo_only || '').toUpperCase() === clean);
        if (
            !inv ||
            Date.parse(inv.expires_at) <= Date.now() ||
            inv.status !== 'active' ||
            inv.uses_count >= inv.max_uses
        ) {
            throw new Error('Invalid, expired, or exhausted invitation code.');
        }
        const email = String(body.email || '')
            .trim()
            .toLowerCase();
        if (localDb.users.some((u) => u.email.toLowerCase() === email)) {
            throw new Error('An account with this email already exists.');
        }
        const newUser = {
            id: Date.now(),
            full_name: String(body.full_name || '').trim(),
            email,
            credential: await previewCredential(String(body.password || '')),
            role: inv.target_role === 'STAFF' ? 'STAFF' : 'MEMBER',
            status: 'active',
            phone_or_telegram: '',
            bio: `Joined via invitation (${inv.code_prefix})`,
            can_generate_codes: inv.permissions.some((p) => p.can_generate_codes === 1),
            can_invite_members: inv.permissions.some((p) => p.can_invite_members === 1),
            can_create_announcements: false,
            delegatable_permissions: { can_access_subject: true, can_view_materials: true },
        };
        localDb.users.push(newUser);
        inv.permissions.forEach((p) => {
            localDb.user_subjects.push({
                user_id: newUser.id,
                subject_id: p.subject_id,
                can_access_subject: p.can_access_subject,
                can_view_materials: p.can_view_materials,
                can_upload_materials: p.can_upload_materials,
                can_publish_materials: p.can_publish_materials,
                can_create_links: p.can_create_links,
                can_upload_videos: p.can_upload_videos,
                can_moderate: 0,
            });
        });
        inv.uses_count += 1;
        if (inv.uses_count >= inv.max_uses) inv.status = 'exhausted';
        localDb.activeSessionUserId = newUser.id;
        saveLocalDb(localDb);
        addLog('INVITATION_REGISTERED', `${newUser.full_name} joined via ${inv.code_prefix}.`);
        return { ok: true, user: enrichLocalUser(newUser), csrfToken: 'local-csrf' };
    }

    if (pathname === '/api/invitations' && method === 'GET') {
        if (!sessUser?.can_generate_codes) throw new Error('Invitation permission required.');
        return {
            invitations: localDb.invitation_codes.filter(
                (x) => sessUser.role === 'OWNER' || x.issuer_user_id === sessUser.id,
            ),
        };
    }

    if (pathname === '/api/invitations' && method === 'POST') {
        if (!sessUser || (sessUser.role !== 'OWNER' && !sessUser.can_generate_codes)) {
            throw new Error('Not authorized to generate invitation codes.');
        }
        const subjectIds = (body.subject_ids || []).map(Number);
        if (!subjectIds.length) throw new Error('Select at least one subject.');
        const plainCode = `LRN-${toHex(crypto.getRandomValues(new Uint8Array(2))).toUpperCase()}-${toHex(crypto.getRandomValues(new Uint8Array(2))).toUpperCase()}-${toHex(crypto.getRandomValues(new Uint8Array(2))).toUpperCase()}`;
        const codePrefix = plainCode.slice(0, 8) + '-••••';
        const targetRole = sessUser.role === 'OWNER' && body.target_role === 'STAFF' ? 'STAFF' : 'MEMBER';
        const p = body.permissions || {};
        const perms = subjectIds.map((sid) => {
            const s = localDb.subjects.find((x) => x.id === sid);
            return {
                subject_id: sid,
                subject_name: s ? s.name : 'Subject',
                subject_slug: s ? s.slug : '',
                can_access_subject: 1,
                can_view_materials: p.can_view_materials !== false ? 1 : 0,
                can_upload_materials: p.can_upload_materials ? 1 : 0,
                can_publish_materials: p.can_publish_materials ? 1 : 0,
                can_create_links: p.can_create_links ? 1 : 0,
                can_upload_videos: p.can_upload_videos ? 1 : 0,
                can_invite_members: p.can_invite_members ? 1 : 0,
                can_generate_codes: p.can_generate_codes ? 1 : 0,
            };
        });
        const expiresAt = new Date(Date.now() + Number(body.expires_in_days || 14) * 86400000).toISOString();
        const invObj = {
            id: Date.now(),
            plain_demo_only: plainCode,
            code_prefix: codePrefix,
            target_role: targetRole,
            issuer_user_id: sessUser.id,
            issuer_name: sessUser.full_name,
            label: body.label || `${targetRole} Invitation`,
            max_uses: Number(body.max_uses || 1),
            uses_count: 0,
            expires_at: expiresAt,
            status: 'active',
            permissions: perms,
        };
        localDb.invitation_codes.unshift(invObj);
        addLog('INVITATION_GENERATED', `Generated ${targetRole} code ${codePrefix}.`);
        return {
            ok: true,
            invitationCard: {
                id: invObj.id,
                plainCode,
                codePrefix,
                targetRole,
                label: invObj.label,
                maxUses: invObj.max_uses,
                usesCount: 0,
                expiresAt,
                issuerName: sessUser.full_name,
                subjects: perms.map((x) => ({
                    id: x.subject_id,
                    name: x.subject_name,
                    slug: x.subject_slug,
                })),
                permissions: perms,
                registrationUrl: `/?invite=${encodeURIComponent(plainCode)}#join-with-code`,
            },
        };
    }

    const revMatch = /^\/api\/invitations\/(\d+)\/revoke$/.exec(pathname);
    if (revMatch && method === 'POST') {
        const inv = localDb.invitation_codes.find((c) => c.id === Number(revMatch[1]));
        if (inv) inv.status = 'revoked';
        saveLocalDb(localDb);
        return { ok: true };
    }

    if (pathname === '/api/subjects' && method === 'GET') {
        return {
            subjects: localDb.subjects.map((s) => ({
                ...s,
                publishedResourcesCount: localDb.resources.filter(
                    (r) => r.subject_id === s.id && r.moderation_status === 'Published',
                ).length,
                hasAccess: sessUser
                    ? sessUser.role === 'OWNER' ||
                      Boolean(sessUser.subjectPermMap?.[s.id]?.can_access_subject)
                    : false,
                userPermissions: sessUser
                    ? sessUser.role === 'OWNER'
                        ? {
                              can_access_subject: 1,
                              can_view_materials: 1,
                              can_upload_materials: 1,
                              can_publish_materials: 1,
                              can_create_links: 1,
                              can_upload_videos: 1,
                              can_moderate: 1,
                          }
                        : sessUser.subjectPermMap?.[s.id] || null
                    : null,
            })),
        };
    }

    if (pathname === '/api/subjects' && method === 'POST') {
        if (!sessUser || sessUser.role !== 'OWNER') throw new Error('Only Owner can create subjects.');
        const name = String(body.name || '').trim();
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const newSubj = {
            id: Date.now(),
            slug,
            name,
            category: body.category || 'Interdisciplinary Track',
            short_description: body.short_description || `${name} collaborative learning workshop.`,
            intro_html: body.intro_html || body.short_description || `${name} learning hub.`,
            icon_name: body.icon_name || 'book-open',
            accent_color: body.accent_color || '#6366f1',
            lead_instructor: body.lead_instructor || 'Learnity Academic Team',
            schedule_label: body.schedule_label || 'Weekly Live Lab',
            display_order: localDb.subjects.length + 1,
        };
        localDb.subjects.push(newSubj);
        saveLocalDb(localDb);
        return { ok: true, subject: newSubj };
    }

    const subjDelMatch = /^\/api\/subjects\/(\d+)$/.exec(pathname);
    if (subjDelMatch && method === 'DELETE') {
        localDb.subjects = localDb.subjects.filter((s) => s.id !== Number(subjDelMatch[1]));
        saveLocalDb(localDb);
        return { ok: true };
    }

    const subjSlugMatch = /^\/api\/subjects\/([a-z0-9-]+)$/i.exec(pathname);
    if (subjSlugMatch && method === 'GET') {
        const slug = subjSlugMatch[1].toLowerCase();
        const subject = localDb.subjects.find((s) => s.slug === slug);
        if (!subject) throw new Error('Subject not found.');
        if (!sessUser) throw new Error('Please sign in to access Subject Learning Hubs.');
        const hasAccess =
            sessUser.role === 'OWNER' || Boolean(sessUser.subjectPermMap?.[subject.id]?.can_access_subject);
        if (!hasAccess)
            throw new Error(`Access denied: Your account does not have permission to view ${subject.name}.`);
        const perms =
            sessUser.role === 'OWNER'
                ? {
                      can_access_subject: 1,
                      can_view_materials: 1,
                      can_upload_materials: 1,
                      can_publish_materials: 1,
                      can_create_links: 1,
                      can_upload_videos: 1,
                      can_moderate: 1,
                  }
                : sessUser.subjectPermMap[subject.id];
        const resources = localDb.resources.filter((r) => r.subject_id === subject.id);
        const announcements = localDb.announcements.filter(
            (a) => !a.subject_id || a.subject_id === subject.id,
        );
        return { subject, permissions: perms, resources, announcements };
    }

    if (pathname === '/api/resources' && method === 'POST') {
        if (!sessUser) throw new Error('Authentication required.');
        const sid = Number(body.subject_id);
        const canPub =
            sessUser.role === 'OWNER' || Boolean(sessUser.subjectPermMap?.[sid]?.can_publish_materials);
        const created = {
            id: Date.now(),
            subject_id: sid,
            author_user_id: sessUser.id,
            author_name: sessUser.full_name,
            title: String(body.title || 'Untitled Resource'),
            description: String(body.description || ''),
            resource_type: body.resource_type || 'study_guide',
            category: body.category || 'Core Study Materials',
            external_url: body.external_url || '',
            file_url: '',
            duration_or_size: body.duration_or_size || 'Interactive Material',
            moderation_status: canPub ? 'Published' : 'Pending Review',
            is_featured: 0,
            created_at: new Date().toISOString(),
        };
        localDb.resources.unshift(created);
        addLog('RESOURCE_CREATED', `Added ${created.resource_type} "${created.title}".`);
        return { ok: true, resource: created };
    }

    const resMatch = /^\/api\/resources\/(\d+)$/.exec(pathname);
    if (resMatch && (method === 'PUT' || method === 'PATCH')) {
        const r = localDb.resources.find((x) => x.id === Number(resMatch[1]));
        if (r && body.moderation_status) r.moderation_status = body.moderation_status;
        if (r && body.title) r.title = body.title;
        saveLocalDb(localDb);
        return { ok: true, resource: r };
    }
    if (resMatch && method === 'DELETE') {
        localDb.resources = localDb.resources.filter((x) => x.id !== Number(resMatch[1]));
        saveLocalDb(localDb);
        return { ok: true };
    }

    if (pathname === '/api/staff' && method === 'GET') {
        return {
            staff: localDb.staff_profiles.filter(
                (s) => (sessUser && sessUser.role === 'OWNER') || s.is_visible,
            ),
        };
    }

    if (pathname === '/api/staff/workspace' && method === 'GET') {
        const assignedIds =
            sessUser.role === 'OWNER'
                ? localDb.subjects.map((s) => s.id)
                : sessUser.subjectPermissions.filter((p) => p.can_access_subject).map((p) => p.subject_id);
        return {
            user: sessUser,
            assignedSubjects: localDb.subjects.filter((s) => assignedIds.includes(s.id)),
            resources: localDb.resources
                .filter((r) => assignedIds.includes(r.subject_id))
                .map((r) => {
                    const s = localDb.subjects.find((x) => x.id === r.subject_id);
                    return { ...r, subject_name: s ? s.name : '', subject_slug: s ? s.slug : '' };
                }),
            announcements: localDb.announcements,
        };
    }

    if (pathname === '/api/owner/staff' && method === 'POST') {
        const sp = {
            id: Date.now(),
            user_id: null,
            full_name: body.full_name,
            position: body.position || 'Academic Mentor',
            department: body.department || 'Academic Mentorship',
            photo_url: body.photo_url || 'assets/photos/1534528741775-53994a69daeb.webp',
            bio: body.bio || '',
            responsibilities: body.responsibilities || '',
            assigned_subjects_label: body.assigned_subjects_label || 'Biology',
            display_order: localDb.staff_profiles.length + 1,
            is_visible: 1,
        };
        localDb.staff_profiles.push(sp);
        saveLocalDb(localDb);
        return { ok: true, staffProfile: sp };
    }

    const stfMatch = /^\/api\/owner\/staff\/(\d+)$/.exec(pathname);
    if (stfMatch && (method === 'PUT' || method === 'PATCH')) {
        const sp = localDb.staff_profiles.find((x) => x.id === Number(stfMatch[1]));
        if (sp) {
            for (const key of [
                'full_name',
                'position',
                'department',
                'bio',
                'responsibilities',
                'assigned_subjects_label',
                'photo_url',
            ])
                if (typeof body[key] === 'string') sp[key] = body[key];
            if (body.is_visible !== undefined) sp.is_visible = body.is_visible ? 1 : 0;
        }
        saveLocalDb(localDb);
        return { ok: true, staffProfile: sp };
    }
    if (stfMatch && method === 'DELETE') {
        localDb.staff_profiles = localDb.staff_profiles.filter((x) => x.id !== Number(stfMatch[1]));
        saveLocalDb(localDb);
        return { ok: true };
    }

    if (pathname === '/api/owner/overview' && method === 'GET') {
        const subjectBreakdown = localDb.subjects.map((s) => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            accent_color: s.accent_color,
            resourcesCount: localDb.resources.filter((r) => r.subject_id === s.id).length,
            enrolledUsersCount: localDb.user_subjects.filter(
                (u) => u.subject_id === s.id && u.can_access_subject,
            ).length,
        }));
        return {
            metrics: {
                totalMembers: localDb.users.filter((u) => u.role === 'MEMBER').length,
                activeMembers: localDb.users.filter((u) => u.role === 'MEMBER' && u.status === 'active')
                    .length,
                totalStaff: localDb.users.filter((u) => u.role === 'STAFF').length,
                pendingApplications: localDb.applications.filter((a) => a.status === 'Pending').length,
                totalSubjects: localDb.subjects.length,
                publishedResources: localDb.resources.filter((r) => r.moderation_status === 'Published')
                    .length,
                pendingResources: localDb.resources.filter((r) => r.moderation_status === 'Pending Review')
                    .length,
                totalPhotos: lessonCards.length + 1,
            },
            subjectBreakdown,
            users: localDb.users.map((u) => enrichLocalUser(u)),
            subjects: localDb.subjects,
            applications: localDb.applications,
            invitations: localDb.invitation_codes,
            resources: localDb.resources.map((r) => {
                const s = localDb.subjects.find((x) => x.id === r.subject_id);
                return { ...r, subject_name: s ? s.name : '', subject_slug: s ? s.slug : '' };
            }),
            announcements: localDb.announcements,
            templates: localDb.templates,
            activityLogs: localDb.activity_logs,
        };
    }

    if (pathname === '/api/owner/users' && method === 'POST') {
        const nu = {
            id: Date.now(),
            full_name: body.full_name,
            email: body.email,
            credential: await previewCredential(String(body.password || '')),
            role: body.role || 'MEMBER',
            status: 'active',
            phone_or_telegram: body.phone_or_telegram || '',
            bio: body.bio || '',
            can_generate_codes: Boolean(body.can_generate_codes),
            can_invite_members: Boolean(body.can_invite_members),
            can_create_announcements: Boolean(body.can_create_announcements),
            delegatable_permissions: {},
        };
        localDb.users.push(nu);
        (body.subject_ids || []).forEach((sid) => {
            localDb.user_subjects.push({
                user_id: nu.id,
                subject_id: Number(sid),
                can_access_subject: 1,
                can_view_materials: 1,
                can_upload_materials: nu.role === 'STAFF' ? 1 : 0,
                can_publish_materials: nu.role === 'STAFF' ? 1 : 0,
                can_create_links: 1,
                can_upload_videos: nu.role === 'STAFF' ? 1 : 0,
                can_moderate: 0,
            });
        });
        saveLocalDb(localDb);
        return { ok: true, user: nu };
    }

    const usrMatch = /^\/api\/owner\/users\/(\d+)$/.exec(pathname);
    if (usrMatch && (method === 'PUT' || method === 'PATCH')) {
        const u = localDb.users.find((x) => x.id === Number(usrMatch[1]));
        if (u) {
            if (body.status && u.role !== 'OWNER') u.status = body.status;
            if (body.can_generate_codes !== undefined)
                u.can_generate_codes = Boolean(body.can_generate_codes);
            if (Array.isArray(body.subject_permissions)) {
                localDb.user_subjects = localDb.user_subjects.filter((us) => us.user_id !== u.id);
                body.subject_permissions.forEach((sp) => {
                    localDb.user_subjects.push({
                        user_id: u.id,
                        subject_id: Number(sp.subject_id),
                        can_access_subject: sp.can_access_subject ? 1 : 0,
                        can_view_materials: sp.can_view_materials ? 1 : 0,
                        can_upload_materials: sp.can_upload_materials ? 1 : 0,
                        can_publish_materials: sp.can_publish_materials ? 1 : 0,
                        can_create_links: sp.can_create_links ? 1 : 0,
                        can_upload_videos: sp.can_upload_videos ? 1 : 0,
                        can_moderate: sp.can_moderate ? 1 : 0,
                    });
                });
            }
        }
        saveLocalDb(localDb);
        return { ok: true };
    }

    if (pathname === '/api/announcements' && method === 'POST') {
        const subj = localDb.subjects.find((s) => s.id === Number(body.subject_id));
        const ann = {
            id: Date.now(),
            subject_id: body.subject_id ? Number(body.subject_id) : null,
            subject_name: subj ? subj.name : 'Platform-Wide',
            author_name: sessUser ? sessUser.full_name : 'Owner',
            title: body.title,
            body: body.body,
            priority: body.priority || 'normal',
            audience: body.audience || 'all',
            is_pinned: body.is_pinned ? 1 : 0,
            created_at: new Date().toISOString(),
        };
        localDb.announcements.unshift(ann);
        saveLocalDb(localDb);
        return { ok: true, announcement: ann };
    }

    const annDelMatch = /^\/api\/announcements\/(\d+)$/.exec(pathname);
    if (annDelMatch && method === 'DELETE') {
        localDb.announcements = localDb.announcements.filter((a) => a.id !== Number(annDelMatch[1]));
        saveLocalDb(localDb);
        return { ok: true };
    }

    if (pathname === '/api/owner/backup' && method === 'POST') {
        addLog('DATABASE_BACKUP', 'Created snapshot backup of Learnity database.');
        await ensureDemoCredentials();
        const stamp = Date.now(),
            name = 'learnity-demo-' + stamp + '.json';
        demoDownload(
            name,
            'application/json',
            JSON.stringify({ ...localDb, activeSessionUserId: null }, null, 2),
        );
        return { ok: true, backupFile: name, timestamp: stamp };
    }

    if (pathname === '/api/owner/notification-templates' && method === 'PUT') {
        const t = localDb.templates.find((x) => x.template_key === body.template_key);
        if (t) {
            t.subject = body.subject;
            t.body = body.body;
        }
        saveLocalDb(localDb);
        return { ok: true };
    }

    if (pathname === '/api/member/dashboard' && method === 'GET') {
        if (!sessUser) throw new Error('Please sign in.');
        const accessibleIds =
            sessUser.role === 'OWNER'
                ? localDb.subjects.map((s) => s.id)
                : sessUser.subjectPermissions.filter((p) => p.can_access_subject).map((p) => p.subject_id);
        return {
            user: sessUser,
            subjects: localDb.subjects.map((s) => ({
                ...s,
                hasAccess: accessibleIds.includes(s.id),
                permissions: sessUser.subjectPermMap?.[s.id] || null,
            })),
            recentResources: localDb.resources
                .filter((r) => accessibleIds.includes(r.subject_id) && r.moderation_status === 'Published')
                .map((r) => {
                    const s = localDb.subjects.find((x) => x.id === r.subject_id);
                    return {
                        ...r,
                        subject_name: s ? s.name : '',
                        subject_slug: s ? s.slug : '',
                        accent_color: s ? s.accent_color : '#6366f1',
                    };
                }),
            announcements: localDb.announcements.filter(
                (a) => !a.subject_id || accessibleIds.includes(a.subject_id),
            ),
            personalActivity: localDb.activity_logs.slice(0, 10),
        };
    }

    throw new Error('This preview action is unavailable.');
}
