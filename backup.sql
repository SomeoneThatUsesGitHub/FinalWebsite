--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_permissions (
    id integer NOT NULL,
    code text NOT NULL,
    display_name text NOT NULL,
    description text DEFAULT ''::text,
    icon text DEFAULT 'FileText'::text,
    category text DEFAULT 'content'::text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_permissions OWNER TO neondb_owner;

--
-- Name: admin_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_permissions_id_seq OWNER TO neondb_owner;

--
-- Name: admin_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admin_permissions_id_seq OWNED BY public.admin_permissions.id;


--
-- Name: articles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.articles (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    excerpt text NOT NULL,
    image_url text,
    author_id integer,
    category_id integer,
    published boolean DEFAULT true NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    comment_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    sources text
);


ALTER TABLE public.articles OWNER TO neondb_owner;

--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_id_seq OWNER TO neondb_owner;

--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    color text DEFAULT '#FF4D4D'::text NOT NULL
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.contact_messages (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    subject text NOT NULL,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    assigned_to integer
);


ALTER TABLE public.contact_messages OWNER TO neondb_owner;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.contact_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contact_messages_id_seq OWNER TO neondb_owner;

--
-- Name: contact_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.contact_messages_id_seq OWNED BY public.contact_messages.id;


--
-- Name: custom_roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.custom_roles (
    id integer NOT NULL,
    name text NOT NULL,
    display_name text NOT NULL,
    description text DEFAULT ''::text,
    color text DEFAULT '#6366f1'::text,
    is_system boolean DEFAULT false,
    priority integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.custom_roles OWNER TO neondb_owner;

--
-- Name: custom_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.custom_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.custom_roles_id_seq OWNER TO neondb_owner;

--
-- Name: custom_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.custom_roles_id_seq OWNED BY public.custom_roles.id;


--
-- Name: educational_content; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.educational_content (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    summary text NOT NULL,
    image_url text NOT NULL,
    topic_id integer NOT NULL,
    author_id integer,
    published boolean DEFAULT true NOT NULL,
    likes integer DEFAULT 0 NOT NULL,
    views integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.educational_content OWNER TO neondb_owner;

--
-- Name: educational_content_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.educational_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.educational_content_id_seq OWNER TO neondb_owner;

--
-- Name: educational_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.educational_content_id_seq OWNED BY public.educational_content.id;


--
-- Name: educational_quizzes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.educational_quizzes (
    id integer NOT NULL,
    content_id integer NOT NULL,
    question text NOT NULL,
    option1 text NOT NULL,
    option2 text NOT NULL,
    option3 text NOT NULL,
    correct_option integer NOT NULL,
    explanation text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.educational_quizzes OWNER TO neondb_owner;

--
-- Name: educational_quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.educational_quizzes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.educational_quizzes_id_seq OWNER TO neondb_owner;

--
-- Name: educational_quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.educational_quizzes_id_seq OWNED BY public.educational_quizzes.id;


--
-- Name: educational_topics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.educational_topics (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    description text NOT NULL,
    image_url text NOT NULL,
    icon text,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    author_id integer
);


ALTER TABLE public.educational_topics OWNER TO neondb_owner;

--
-- Name: educational_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.educational_topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.educational_topics_id_seq OWNER TO neondb_owner;

--
-- Name: educational_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.educational_topics_id_seq OWNED BY public.educational_topics.id;


--
-- Name: election_reactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.election_reactions (
    id integer NOT NULL,
    election_id integer NOT NULL,
    author character varying(255) NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.election_reactions OWNER TO neondb_owner;

--
-- Name: election_reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.election_reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.election_reactions_id_seq OWNER TO neondb_owner;

--
-- Name: election_reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.election_reactions_id_seq OWNED BY public.election_reactions.id;


--
-- Name: elections; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.elections (
    id integer NOT NULL,
    country text NOT NULL,
    country_code text NOT NULL,
    title text NOT NULL,
    date timestamp without time zone NOT NULL,
    type text NOT NULL,
    results json NOT NULL,
    description text,
    upcoming boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.elections OWNER TO neondb_owner;

--
-- Name: elections_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.elections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.elections_id_seq OWNER TO neondb_owner;

--
-- Name: elections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.elections_id_seq OWNED BY public.elections.id;


--
-- Name: flash_infos; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.flash_infos (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    image_url text,
    active boolean DEFAULT true NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    category_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    url text
);


ALTER TABLE public.flash_infos OWNER TO neondb_owner;

--
-- Name: flash_infos_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.flash_infos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.flash_infos_id_seq OWNER TO neondb_owner;

--
-- Name: flash_infos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.flash_infos_id_seq OWNED BY public.flash_infos.id;


--
-- Name: live_coverage_editors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.live_coverage_editors (
    id integer NOT NULL,
    coverage_id integer NOT NULL,
    editor_id integer NOT NULL,
    role text
);


ALTER TABLE public.live_coverage_editors OWNER TO neondb_owner;

--
-- Name: live_coverage_editors_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.live_coverage_editors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.live_coverage_editors_id_seq OWNER TO neondb_owner;

--
-- Name: live_coverage_editors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.live_coverage_editors_id_seq OWNED BY public.live_coverage_editors.id;


--
-- Name: live_coverage_questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.live_coverage_questions (
    id integer NOT NULL,
    coverage_id integer NOT NULL,
    username text NOT NULL,
    content text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    answered boolean DEFAULT false
);


ALTER TABLE public.live_coverage_questions OWNER TO neondb_owner;

--
-- Name: live_coverage_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.live_coverage_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.live_coverage_questions_id_seq OWNER TO neondb_owner;

--
-- Name: live_coverage_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.live_coverage_questions_id_seq OWNED BY public.live_coverage_questions.id;


--
-- Name: live_coverage_updates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.live_coverage_updates (
    id integer NOT NULL,
    coverage_id integer NOT NULL,
    content text NOT NULL,
    author_id integer,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    image_url text,
    important boolean DEFAULT false,
    is_answer boolean DEFAULT false,
    question_id integer,
    youtube_url text,
    article_id integer,
    update_type text DEFAULT 'normal'::text,
    election_results text
);


ALTER TABLE public.live_coverage_updates OWNER TO neondb_owner;

--
-- Name: live_coverage_updates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.live_coverage_updates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.live_coverage_updates_id_seq OWNER TO neondb_owner;

--
-- Name: live_coverage_updates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.live_coverage_updates_id_seq OWNED BY public.live_coverage_updates.id;


--
-- Name: live_coverages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.live_coverages (
    id integer NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    subject text NOT NULL,
    context text DEFAULT ''::text,
    image_url text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.live_coverages OWNER TO neondb_owner;

--
-- Name: live_coverages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.live_coverages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.live_coverages_id_seq OWNER TO neondb_owner;

--
-- Name: live_coverages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.live_coverages_id_seq OWNED BY public.live_coverages.id;


--
-- Name: live_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.live_events (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    image_url text,
    live_url text,
    active boolean DEFAULT false NOT NULL,
    scheduled_for timestamp without time zone,
    category_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.live_events OWNER TO neondb_owner;

--
-- Name: live_events_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.live_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.live_events_id_seq OWNER TO neondb_owner;

--
-- Name: live_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.live_events_id_seq OWNED BY public.live_events.id;


--
-- Name: news_updates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.news_updates (
    id integer NOT NULL,
    title text NOT NULL,
    content text,
    icon text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.news_updates OWNER TO neondb_owner;

--
-- Name: news_updates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.news_updates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.news_updates_id_seq OWNER TO neondb_owner;

--
-- Name: news_updates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.news_updates_id_seq OWNED BY public.news_updates.id;


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.newsletter_subscribers (
    id integer NOT NULL,
    email text NOT NULL,
    subscription_date timestamp without time zone DEFAULT now() NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.newsletter_subscribers OWNER TO neondb_owner;

--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.newsletter_subscribers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.newsletter_subscribers_id_seq OWNER TO neondb_owner;

--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.newsletter_subscribers_id_seq OWNED BY public.newsletter_subscribers.id;


--
-- Name: political_glossary; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.political_glossary (
    id integer NOT NULL,
    term text NOT NULL,
    definition text NOT NULL,
    examples text,
    category text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.political_glossary OWNER TO neondb_owner;

--
-- Name: political_glossary_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.political_glossary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.political_glossary_id_seq OWNER TO neondb_owner;

--
-- Name: political_glossary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.political_glossary_id_seq OWNED BY public.political_glossary.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.role_permissions (
    id integer NOT NULL,
    role_id integer NOT NULL,
    permission_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.role_permissions OWNER TO neondb_owner;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.role_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_permissions_id_seq OWNER TO neondb_owner;

--
-- Name: role_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.role_permissions_id_seq OWNED BY public.role_permissions.id;


--
-- Name: team_applications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.team_applications (
    id integer NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    "position" text NOT NULL,
    message text NOT NULL,
    cv_url text,
    status text DEFAULT 'pending'::text NOT NULL,
    submission_date timestamp without time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp without time zone,
    reviewed_by integer,
    notes text
);


ALTER TABLE public.team_applications OWNER TO neondb_owner;

--
-- Name: team_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.team_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_applications_id_seq OWNER TO neondb_owner;

--
-- Name: team_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.team_applications_id_seq OWNED BY public.team_applications.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    display_name text NOT NULL,
    role text DEFAULT 'editor'::text NOT NULL,
    avatar_url text,
    title text,
    is_team_member boolean DEFAULT false,
    bio text,
    custom_role_id integer
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: videos; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.videos (
    id integer NOT NULL,
    title text NOT NULL,
    video_id text NOT NULL,
    views integer DEFAULT 0,
    published_at timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.videos OWNER TO neondb_owner;

--
-- Name: videos_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.videos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.videos_id_seq OWNER TO neondb_owner;

--
-- Name: videos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.videos_id_seq OWNED BY public.videos.id;


--
-- Name: admin_permissions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_permissions ALTER COLUMN id SET DEFAULT nextval('public.admin_permissions_id_seq'::regclass);


--
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: contact_messages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contact_messages ALTER COLUMN id SET DEFAULT nextval('public.contact_messages_id_seq'::regclass);


--
-- Name: custom_roles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_roles ALTER COLUMN id SET DEFAULT nextval('public.custom_roles_id_seq'::regclass);


--
-- Name: educational_content id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_content ALTER COLUMN id SET DEFAULT nextval('public.educational_content_id_seq'::regclass);


--
-- Name: educational_quizzes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_quizzes ALTER COLUMN id SET DEFAULT nextval('public.educational_quizzes_id_seq'::regclass);


--
-- Name: educational_topics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_topics ALTER COLUMN id SET DEFAULT nextval('public.educational_topics_id_seq'::regclass);


--
-- Name: election_reactions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.election_reactions ALTER COLUMN id SET DEFAULT nextval('public.election_reactions_id_seq'::regclass);


--
-- Name: elections id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.elections ALTER COLUMN id SET DEFAULT nextval('public.elections_id_seq'::regclass);


--
-- Name: flash_infos id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.flash_infos ALTER COLUMN id SET DEFAULT nextval('public.flash_infos_id_seq'::regclass);


--
-- Name: live_coverage_editors id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_editors ALTER COLUMN id SET DEFAULT nextval('public.live_coverage_editors_id_seq'::regclass);


--
-- Name: live_coverage_questions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_questions ALTER COLUMN id SET DEFAULT nextval('public.live_coverage_questions_id_seq'::regclass);


--
-- Name: live_coverage_updates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_updates ALTER COLUMN id SET DEFAULT nextval('public.live_coverage_updates_id_seq'::regclass);


--
-- Name: live_coverages id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverages ALTER COLUMN id SET DEFAULT nextval('public.live_coverages_id_seq'::regclass);


--
-- Name: live_events id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_events ALTER COLUMN id SET DEFAULT nextval('public.live_events_id_seq'::regclass);


--
-- Name: news_updates id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.news_updates ALTER COLUMN id SET DEFAULT nextval('public.news_updates_id_seq'::regclass);


--
-- Name: newsletter_subscribers id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletter_subscribers ALTER COLUMN id SET DEFAULT nextval('public.newsletter_subscribers_id_seq'::regclass);


--
-- Name: political_glossary id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.political_glossary ALTER COLUMN id SET DEFAULT nextval('public.political_glossary_id_seq'::regclass);


--
-- Name: role_permissions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions ALTER COLUMN id SET DEFAULT nextval('public.role_permissions_id_seq'::regclass);


--
-- Name: team_applications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_applications ALTER COLUMN id SET DEFAULT nextval('public.team_applications_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: videos id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.videos ALTER COLUMN id SET DEFAULT nextval('public.videos_id_seq'::regclass);


--
-- Data for Name: admin_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_permissions (id, code, display_name, description, icon, category, created_at) FROM stdin;
1	dashboard	Tableau de bord	Accès au tableau de bord admin	LayoutDashboard	general	2025-04-12 17:05:28.941442
2	articles	Articles	Gestion des articles	FileText	content	2025-04-12 17:05:29.104809
3	flash_infos	Flash Infos	Gestion des flash infos	AlertTriangle	content	2025-04-12 17:05:29.25287
4	videos	Vidéos	Gestion des vidéos	Video	content	2025-04-12 17:05:29.405181
5	categories	Catégories	Gestion des catégories	TagsIcon	content	2025-04-12 17:05:29.557562
6	educational_topics	Sujets éducatifs	Gestion des sujets éducatifs	GraduationCap	content	2025-04-12 17:05:29.714109
7	educational_content	Contenu éducatif	Gestion du contenu éducatif	Book	content	2025-04-12 17:05:29.865458
8	live_coverage	Suivi en direct	Gestion des suivis en direct	Radio	content	2025-04-12 17:05:30.015191
9	users	Utilisateurs	Gestion des utilisateurs	Users	system	2025-04-12 17:05:30.167059
10	roles	Rôles	Gestion des rôles et permissions	ShieldCheck	system	2025-04-12 17:05:30.316139
11	applications	Candidatures	Gestion des candidatures	FileCheck	system	2025-04-12 17:05:30.47118
12	messages	Messages	Gestion des messages de contact	MessageSquare	communication	2025-04-12 17:05:30.621525
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.articles (id, title, slug, content, excerpt, image_url, author_id, category_id, published, featured, view_count, comment_count, created_at, updated_at, sources) FROM stdin;
34	Jordan Bardella, Président en 2027 ?eeee	jordan-bardella-president-en-2027	<p><strong>Introduction</strong><br><br>Le 31 mars, le monde politique français est chamboulé par la décision clé du tribunal ecorrectionnel de Paris : Marine Le Pen est reconnue coupable de détournements de fonds publics lors de son mandat de députée au Parlement européen. Cette décision s’accompagne d’une inéligibilité de cinq ans avec exécution provisoire. Cette mesure signifie que la cheffe de file du Rassemblement national ne pourrait pas se représenter aux élections présidentielles de 2027.&nbsp;<br><br>Depuis cette décision, certaines rumeurs laissent entendre qu’un autre espoir se dessine pour le parti d’extrême droite. Cet espoir réside au bras droit de Marine Le Pen qui n’est autre que Jordan Bardella. Quelles sont les opportunités politiques pour le jeune président du Rassemblement national ? Est-il prêt à endosser le rôle de candidat aux grandes élections de 2027 ?<br><br><strong>De l'accession à la consécration</strong></p><div articleid="34" articleslug="jordan-bardella-president-en-2027" articletitle="Jordan Bardella, Président en 2027 ?" articleimageurl="https://s.france24.com/media/display/6eb5ce2c-0f0d-11f0-ae0d-005056a90284/w:1280/p:16x9/AP24190498417175.jpg" articleexcerpt="Le 31 mars, le monde politique français est chamboulé par la décision clé du tribunal correctionnel de Paris : Marine Le Pen est reconnue coupable de détournements de fonds publics lors de son mandat de députée au Parlement européen. " articlecreatedat="2025-04-07T23:33:35.713Z" data-type="article-embed" data-article-id="34" data-article-slug="jordan-bardella-president-en-2027"></div><p>Si Jordan Bardella est le premier président du Rassemblement national n’étant pas directement issu de la famille Le Pen, son parcours politique n’a pas toujours été une évidence. Issu d’une famille aisée, tel que l’informe Pierre-Stéphane Fort (auteur de la biographie non officielle de l’homme politique), Jordan Bardella s’investit assez jeune au sein du parti du Front national de Marine Le Pen. Mais il prend véritablement sa place en politique lorsqu’il décide d’abandonner ses études à l’université pour devenir la figure de proue du nouveau projet du parti et de son rebranding. Un vent de fraîcheur souffle sur le Rassemblement national qui veut rallier davantage de jeunes à sa cause et Jordan Bardella devient le gendre idéal des électeurs français d’extrême droite. Il élève son éloquence et son image publique pour qu’elles ne lui fassent jamais défaut et ça fonctionne.</p><p>Il enchaîne alors successivement les postes de conseiller régional, porte-parole et puis vice-président du parti. Il accède ensuite à la tête de liste du Rassemblement national aux élections européennes de 2019 avant de succéder à la présidence du parti, autrefois détenue par Marine Le Pen. Cette montée en flèche le conduit à devenir député européen et le pousse même vers la possibilité de devenir Premier ministre français au terme des élections législatives de 2024. Ces dernières furent le résultat de la dissolution de l’Assemblée nationale, décision du président Emmanuel Macron, le 9 juin 2024.<strong><br><br>Jordan Bardella : Président en 2027 ?</strong></p><p>Bien que Marine Le Pen trouve que Jordan Bardella soit un véritable “atout” pour son parti, elle espère cependant ne pas devoir “user de cet atout trop tôt”. Cette confession à Gilles Bouleau au journal télévisé de TF1 laisse entrevoir une réalité assez spectaculaire. En effet, Marine Le Pen ne compte pas “se faire éliminer” par cette “atteinte à l’état de droit” et attendrait que son procès en appel la délivre de sa peine d’inéligibilité. Mais compte tenu des délais de procédure, l’annulation de son éviction semble proche de l’impossible. Une question cruciale se pose : Jordan Bardella pourrait-il succéder à la candidature aux élections présidentielles de 2027 ?</p><p>À nouveau, ce scénario ne semble pas être imaginable. Selon les informations récoltées par Politico, la réaction de Marine Le Pen n’est pas de bonne augure pour le jeune président du parti. Car si la peine encourue par l’ancienne cheffe du Rassemblement national n’était finalement pas résorbée, il serait trop tard pour que la potentielle campagne menée par Jordan Bardella porte ses fruits. Le jeune homme politique serait également confronté à un dilemme : celui du clivage qu’il pourrait créer au sein de son propre parti s’il décidait d’écarter Marine Le Pen de la course présidentielle. À nouveau, ce scénario reste peu probable étant donné la fidélité incontestée de Jordan Bardella à celle qui lui a donné une carrière.<br><br>De plus, il est important de noter que Bardella aura 31 ans en 2027. S'il venait à être élu, il deviendrait le plus jeune président de l'Histoire de la France, battant ainsi Emmanuel Macron, élu à 39 ans en 2017. Certains pourraient voir cette barrière de l'âge comme un manque d'expérience, d'autant plus que Bardella n'a aucune expérience professionnelle préalable, si ce n'est son mandat de député européen. À ce sujet, de nombreux opposants n'hésitent pas à lui rappeler que cela ne "compte pas", car il est rarement présent au Parlement.<br><br><strong>Conclusion</strong></p><p>Une candidature de Bardella en 2027 à l'élection présidentielle semble donc peu probable, non seulement en raison des délais laissés par la décision en appel du procès de Marine Le Pen, qui compliqueraient l'organisation d'une campagne concrète, mais aussi en raison de son jeune âge et de ses faiblesses sur le plan professionnel.</p><p>D'autant plus qu'il se retrouverait face à des candidats comme Édouard Philippe, ou peut-être même Gabriel Attal, qui, qui sait, pourraient facilement le discréditer lors des débats ou des meetings en raison de leur maîtrise approfondie du milieu.</p>	Le 31 mars, le monde politique français est chamboulé par la décision clé du tribunal correctionnel de Paris : Marine Le Pen est reconnue coupable de détournements de fonds publics lors de son mandat de députée au Parlement européen. 	https://s.france24.com/media/display/6eb5ce2c-0f0d-11f0-ae0d-005056a90284/w:1280/p:16x9/AP24190498417175.jpg	\N	1	t	f	86	0	2025-04-07 23:33:35.713893	2025-04-14 17:41:04.619	Le Monde, La RTBF
42	3ew24	3324	<p>wer</p><p>wer</p><p>wer</p><p>wer</p><p>wer</p>	23423	https://navaway.fr/wp-content/uploads/2024/10/Drapeau-de-lUnion-europeenne-contre-le-parlement-a-Bruxelles.jpg	\N	1	f	f	2	0	2025-04-08 22:54:34.546549	2025-04-10 18:00:07.694	\N
43	wrewrwerwer1212	w324	<p>Toujours élu, jamais candidatToujours élu, jamais candidatToujours élu, jamais candidat</p>	werwer	https://s.france24.com/media/display/6eb5ce2c-0f0d-11f0-ae0d-005056a90284/w:1280/p:16x9/AP24190498417175.jpg	11	8	t	t	1	0	2025-04-14 17:43:28.419649	2025-04-14 17:44:18.394	wrew
35	Test	test	<div articleid="34" articleslug="jordan-bardella-president-en-2027" articletitle="Jordan Bardella, Président en 2027 ?" articleimageurl="https://s.france24.com/media/display/6eb5ce2c-0f0d-11f0-ae0d-005056a90284/w:1280/p:16x9/AP24190498417175.jpg" articleexcerpt="Le 31 mars, le monde politique français est chamboulé par la décision clé du tribunal correctionnel de Paris : Marine Le Pen est reconnue coupable de détournements de fonds publics lors de son mandat de députée au Parlement européen. " articlecreatedat="2025-04-07T23:33:35.713Z" data-type="article-embed" data-article-id="34" data-article-slug="jordan-bardella-president-en-2027"></div>	test	https://navaway.fr/wp-content/uploads/2024/10/Drapeau-de-lUnion-europeenne-contre-le-parlement-a-Bruxelles.jpg	\N	1	t	f	30	0	2025-04-07 23:34:26.672838	2025-04-10 18:22:45.958	\N
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.categories (id, name, slug, color) FROM stdin;
1	Politique France	politique-france	#0D47A1
2	International	international	#E53935
3	Économie	economie	#2E7D32
5	Société	societe	#6A1B9A
6	Culture	culture	#FFC107
8	test	test	#1e40af
4	Environnement	environnement	#00796B
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.contact_messages (id, name, email, phone, subject, message, created_at, is_read, assigned_to) FROM stdin;
1	rewr	testerw940@gmail.com	04646441	Test sujet	https://f0efa827-965e-41c0-8844-441a2ce4f102-00-38gz9gw0od1uw.janeway.replit.dev/admin/messageshttps://f0efa827-965e-41c0-8844-441a2ce4f102-00-38gz9gw0od1uw.janeway.replit.dev/admin/messages	2025-04-11 19:56:53.577626	t	11
2	Noah Heine	testerw940@gmail.com	04646441	Test sujet	bonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbonbon	2025-04-11 20:16:24.502629	t	7
\.


--
-- Data for Name: custom_roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.custom_roles (id, name, display_name, description, color, is_system, priority, created_at, updated_at) FROM stdin;
2	administrator	Administrateur	Accès complet à toutes les fonctionnalités	#EF4444	t	100	2025-04-12 17:05:30.773332	2025-04-12 17:05:30.773332
3	editor	Éditeur	Accès à la gestion du contenu	#3B82F6	t	50	2025-04-12 17:05:32.814431	2025-04-12 17:05:32.814431
5	media_manager	Gestionnaire de médias	Peut gérer uniquement les vidéos	#8B5CF6	f	20	2025-04-12 17:07:08.014872	2025-04-12 17:07:08.014872
1	directeur_rh	Directeur des RH	Directeur des Ressources Humaines.	#3B82F6	f	10	2025-04-12 17:03:41.473726	2025-04-12 17:28:22.767
4	content_manager	Gestionnaire de contenu	Peut gérer uniquement les articles et flash infos	#10B981	f	30	2025-04-12 17:07:07.480624	2025-04-12 17:34:15.318
6	admin_admin	Admin		#3B82F6	f	10	2025-04-12 17:59:37.264887	2025-04-12 17:59:37.264887
\.


--
-- Data for Name: educational_content; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.educational_content (id, title, slug, content, summary, image_url, topic_id, author_id, published, likes, views, created_at, updated_at) FROM stdin;
1	werwerwer	werwerwer	<p>le le</p>	werwer	https://placehold.co/600x400/3b82f6/white?text=Contenu+%C3%A9ducatif	1	\N	t	0	11	2025-04-13 21:14:29.879589	2025-04-13 21:14:29.879589
\.


--
-- Data for Name: educational_quizzes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.educational_quizzes (id, content_id, question, option1, option2, option3, correct_option, explanation, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: educational_topics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.educational_topics (id, title, slug, description, image_url, icon, color, "order", created_at, updated_at, author_id) FROM stdin;
1	testsdfsdf	testsdfsdf	Mr CastellaniMr CastellaniMr CastellaniMr CastellaniMr CastellaniMr Castellani	https://s.france24.com/media/display/70b309ec-1656-11f0-b1fc-005056bfb2b6/w:1280/p:16x9/AP25100664419570.jpg	\N	#3b82f6	0	2025-04-12 02:15:19.809068	2025-04-12 02:16:46.938	11
\.


--
-- Data for Name: election_reactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.election_reactions (id, election_id, author, content, created_at) FROM stdin;
2	2	noah	ewqr	2025-04-14 00:56:51.487456
\.


--
-- Data for Name: elections; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.elections (id, country, country_code, title, date, type, results, description, upcoming, created_at) FROM stdin;
2	France	DE	Election Présidentielle 2022	2025-04-14 00:00:00	Présidentielle	"{\\"title\\":\\"Election Présidentielle 2022\\",\\"date\\":\\"14 April 2025\\",\\"type\\":\\"Présidentielle\\",\\"results\\":[{\\"candidate\\":\\"Le Pen\\",\\"party\\":\\"LFI\\",\\"percentage\\":10,\\"votes\\":70000,\\"color\\":\\"#3b82f6\\"},{\\"candidate\\":\\"Melenchon\\",\\"party\\":\\"RN\\",\\"percentage\\":90,\\"votes\\":967896,\\"color\\":\\"#bbf73b\\"}]}"	élu meilleur parc d’Allemagne : pour les meilleures attractions. Les meilleurs hôtels à thème. Les meilleurs spectacles. Et la meilleure gastronomie. Préparez-vous à vivre les meilleures aventures !	f	2025-04-13 23:04:55.051296
\.


--
-- Data for Name: flash_infos; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.flash_infos (id, title, content, image_url, active, priority, category_id, created_at, updated_at, url) FROM stdin;
3	retrter	treterttretert	https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80	t	1	\N	2025-04-07 21:53:17.084889	2025-04-07 21:53:17.084889	https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80
\.


--
-- Data for Name: live_coverage_editors; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.live_coverage_editors (id, coverage_id, editor_id, role) FROM stdin;
\.


--
-- Data for Name: live_coverage_questions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.live_coverage_questions (id, coverage_id, username, content, "timestamp", status, answered) FROM stdin;
\.


--
-- Data for Name: live_coverage_updates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.live_coverage_updates (id, coverage_id, content, author_id, "timestamp", image_url, important, is_answer, question_id, youtube_url, article_id, update_type, election_results) FROM stdin;
\.


--
-- Data for Name: live_coverages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.live_coverages (id, title, slug, subject, context, image_url, active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: live_events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.live_events (id, title, description, image_url, live_url, active, scheduled_for, category_id, created_at, updated_at) FROM stdin;
1	DIRECT : Débat présidentiel	Suivez en direct le débat entre les candidats à l'élection présidentielle.	https://images.unsplash.com/photo-1495602787267-96ab76127c2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80	https://www.youtube.com/embed/live_stream?channel=UC5FXM2fLJ29utR0wnMkTxoQ	f	2025-04-06 21:37:39.646165	1	2025-04-06 21:37:39.646165	2025-04-06 21:37:39.646165
\.


--
-- Data for Name: news_updates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.news_updates (id, title, content, icon, active, created_at) FROM stdin;
\.


--
-- Data for Name: newsletter_subscribers; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.newsletter_subscribers (id, email, subscription_date, active) FROM stdin;
4	24@gmai.com	2025-04-16 20:37:55.556097	t
\.


--
-- Data for Name: political_glossary; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.political_glossary (id, term, definition, examples, category, created_at, updated_at) FROM stdin;
1	Le	Article 26.3 de la Déclaration universelle des droits de l'homme	dsadsydas	test	2025-04-13 19:37:32.157484+00	2025-04-13 19:39:04.469+00
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.role_permissions (id, role_id, permission_id, created_at) FROM stdin;
1	2	1	2025-04-12 17:05:31.002743
2	2	2	2025-04-12 17:05:31.159714
3	2	3	2025-04-12 17:05:31.311782
4	2	4	2025-04-12 17:05:31.461371
5	2	5	2025-04-12 17:05:31.617125
6	2	6	2025-04-12 17:05:31.765918
7	2	7	2025-04-12 17:05:31.914573
8	2	8	2025-04-12 17:05:32.069659
9	2	9	2025-04-12 17:05:32.21868
10	2	10	2025-04-12 17:05:32.369119
11	2	11	2025-04-12 17:05:32.518232
12	2	12	2025-04-12 17:05:32.666896
13	1	11	2025-04-12 17:28:22.948435
14	4	9	2025-04-12 17:34:15.503289
15	6	1	2025-04-12 17:59:37.348147
16	6	11	2025-04-12 17:59:37.4296
17	6	12	2025-04-12 17:59:37.505117
18	6	10	2025-04-12 17:59:37.581558
19	6	2	2025-04-12 17:59:37.584488
20	6	3	2025-04-12 17:59:37.589069
21	6	9	2025-04-12 17:59:37.59131
22	6	6	2025-04-12 17:59:37.596421
23	6	4	2025-04-12 17:59:37.59877
24	6	8	2025-04-12 17:59:37.60367
25	6	7	2025-04-12 17:59:37.604103
26	6	5	2025-04-12 17:59:37.614164
\.


--
-- Data for Name: team_applications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.team_applications (id, full_name, email, phone, "position", message, cv_url, status, submission_date, reviewed_at, reviewed_by, notes) FROM stdin;
1	Noah Heine	testerw940@gmail.com	04646441	veilleur-actualite	dsfGraphisteGraphisteGraphisteGraphisteGraphisteGraphiste	\N	approved	2025-04-10 22:48:40.08537	2025-04-10 22:49:14.279	11	A contacter
3	Noah Heine	testerw940@gmail.com	04646441	graphiste-designer	Et aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panel	\N	approved	2025-04-11 20:21:53.785256	2025-04-11 20:23:23.332	7	Bonne candidature
4	Noah Heine	testerw940@gmail.com	04646441	veilleur-actualite	Et aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panelEt aussi y'a un bug les longs textes s'affichent horizontalement dans a partie "Message" sur l'admin panel	\N	rejected	2025-04-11 20:22:17.351931	2025-04-11 20:25:46.275	7	werewerewerewerewerewerewerewerewerewerewerewerewerewerewerewerewerewerewerewere
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, display_name, role, avatar_url, title, is_team_member, bio, custom_role_id) FROM stdin;
11	tempAdmin	$2b$10$vX5KqFGzDzKrPWMJ0CJn/uYexz3JELcCjGCoCyqcbPSkDNdDenYZu	Administrateur Temporaireee	admin		Administrateure	t	Compte administrateur temporairee	6
7	Noah	$2b$10$kyVHH29niI8EZ80ZAppuwemcuo9hysHfTvkkRQfR3t2UHYBUmVuBK	Noah Heine	editor	https://www.politiquensemble.be/web/image/5510-f43d399d/46bbffd5-9632-4c42-abf1-da2cf88a8ef4.webp	Directeur Exécutif	f	Test	2
10	Guest_1	$2b$10$Vpuyu/Al6P4zukv0HYO3jOW3brxin6knTKoDmxi9zg4UqdYv.gXpC	Guest	editor		test	t		4
\.


--
-- Data for Name: videos; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.videos (id, title, video_id, views, published_at, created_at, updated_at) FROM stdin;
8	test	uh7CY2N_Y8Y	0	2025-04-07 22:14:28.709462	2025-04-07 22:14:28.709462	2025-04-07 22:14:28.709462
9	Test2	8DCssw2JssM	0	2025-04-07 23:32:16.452156	2025-04-07 23:32:16.452156	2025-04-07 23:32:16.452156
\.


--
-- Name: admin_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admin_permissions_id_seq', 12, true);


--
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.articles_id_seq', 43, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.categories_id_seq', 9, true);


--
-- Name: contact_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.contact_messages_id_seq', 2, true);


--
-- Name: custom_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.custom_roles_id_seq', 6, true);


--
-- Name: educational_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.educational_content_id_seq', 1, true);


--
-- Name: educational_quizzes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.educational_quizzes_id_seq', 1, true);


--
-- Name: educational_topics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.educational_topics_id_seq', 1, true);


--
-- Name: election_reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.election_reactions_id_seq', 2, true);


--
-- Name: elections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.elections_id_seq', 2, true);


--
-- Name: flash_infos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.flash_infos_id_seq', 3, true);


--
-- Name: live_coverage_editors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.live_coverage_editors_id_seq', 9, true);


--
-- Name: live_coverage_questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.live_coverage_questions_id_seq', 6, true);


--
-- Name: live_coverage_updates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.live_coverage_updates_id_seq', 30, true);


--
-- Name: live_coverages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.live_coverages_id_seq', 10, true);


--
-- Name: live_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.live_events_id_seq', 1, true);


--
-- Name: news_updates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.news_updates_id_seq', 1, false);


--
-- Name: newsletter_subscribers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.newsletter_subscribers_id_seq', 4, true);


--
-- Name: political_glossary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.political_glossary_id_seq', 1, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.role_permissions_id_seq', 26, true);


--
-- Name: team_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.team_applications_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 12, true);


--
-- Name: videos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.videos_id_seq', 9, true);


--
-- Name: admin_permissions admin_permissions_code_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_code_key UNIQUE (code);


--
-- Name: admin_permissions admin_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_pkey PRIMARY KEY (id);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: articles articles_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_slug_unique UNIQUE (slug);


--
-- Name: categories categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_unique UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: custom_roles custom_roles_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_roles
    ADD CONSTRAINT custom_roles_name_key UNIQUE (name);


--
-- Name: custom_roles custom_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.custom_roles
    ADD CONSTRAINT custom_roles_pkey PRIMARY KEY (id);


--
-- Name: educational_content educational_content_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_content
    ADD CONSTRAINT educational_content_pkey PRIMARY KEY (id);


--
-- Name: educational_content educational_content_slug_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_content
    ADD CONSTRAINT educational_content_slug_key UNIQUE (slug);


--
-- Name: educational_quizzes educational_quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_quizzes
    ADD CONSTRAINT educational_quizzes_pkey PRIMARY KEY (id);


--
-- Name: educational_topics educational_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_topics
    ADD CONSTRAINT educational_topics_pkey PRIMARY KEY (id);


--
-- Name: educational_topics educational_topics_slug_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_topics
    ADD CONSTRAINT educational_topics_slug_key UNIQUE (slug);


--
-- Name: election_reactions election_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.election_reactions
    ADD CONSTRAINT election_reactions_pkey PRIMARY KEY (id);


--
-- Name: elections elections_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.elections
    ADD CONSTRAINT elections_pkey PRIMARY KEY (id);


--
-- Name: flash_infos flash_infos_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.flash_infos
    ADD CONSTRAINT flash_infos_pkey PRIMARY KEY (id);


--
-- Name: live_coverage_editors live_coverage_editors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_editors
    ADD CONSTRAINT live_coverage_editors_pkey PRIMARY KEY (id);


--
-- Name: live_coverage_questions live_coverage_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_questions
    ADD CONSTRAINT live_coverage_questions_pkey PRIMARY KEY (id);


--
-- Name: live_coverage_updates live_coverage_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_updates
    ADD CONSTRAINT live_coverage_updates_pkey PRIMARY KEY (id);


--
-- Name: live_coverages live_coverages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverages
    ADD CONSTRAINT live_coverages_pkey PRIMARY KEY (id);


--
-- Name: live_coverages live_coverages_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverages
    ADD CONSTRAINT live_coverages_slug_unique UNIQUE (slug);


--
-- Name: live_events live_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_events
    ADD CONSTRAINT live_events_pkey PRIMARY KEY (id);


--
-- Name: news_updates news_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.news_updates
    ADD CONSTRAINT news_updates_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: political_glossary political_glossary_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.political_glossary
    ADD CONSTRAINT political_glossary_pkey PRIMARY KEY (id);


--
-- Name: political_glossary political_glossary_term_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.political_glossary
    ADD CONSTRAINT political_glossary_term_key UNIQUE (term);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- Name: team_applications team_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_applications
    ADD CONSTRAINT team_applications_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: videos videos_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.videos
    ADD CONSTRAINT videos_pkey PRIMARY KEY (id);


--
-- Name: articles articles_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: articles articles_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: contact_messages contact_messages_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: educational_content educational_content_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_content
    ADD CONSTRAINT educational_content_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: educational_content educational_content_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_content
    ADD CONSTRAINT educational_content_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.educational_topics(id);


--
-- Name: educational_quizzes educational_quizzes_content_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_quizzes
    ADD CONSTRAINT educational_quizzes_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.educational_content(id) ON DELETE CASCADE;


--
-- Name: educational_topics educational_topics_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.educational_topics
    ADD CONSTRAINT educational_topics_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: election_reactions election_reactions_election_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.election_reactions
    ADD CONSTRAINT election_reactions_election_id_fkey FOREIGN KEY (election_id) REFERENCES public.elections(id) ON DELETE CASCADE;


--
-- Name: flash_infos flash_infos_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.flash_infos
    ADD CONSTRAINT flash_infos_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: live_coverage_editors live_coverage_editors_coverage_id_live_coverages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_editors
    ADD CONSTRAINT live_coverage_editors_coverage_id_live_coverages_id_fk FOREIGN KEY (coverage_id) REFERENCES public.live_coverages(id);


--
-- Name: live_coverage_editors live_coverage_editors_editor_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_editors
    ADD CONSTRAINT live_coverage_editors_editor_id_users_id_fk FOREIGN KEY (editor_id) REFERENCES public.users(id);


--
-- Name: live_coverage_questions live_coverage_questions_coverage_id_live_coverages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_questions
    ADD CONSTRAINT live_coverage_questions_coverage_id_live_coverages_id_fk FOREIGN KEY (coverage_id) REFERENCES public.live_coverages(id);


--
-- Name: live_coverage_updates live_coverage_updates_article_id_articles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_updates
    ADD CONSTRAINT live_coverage_updates_article_id_articles_id_fk FOREIGN KEY (article_id) REFERENCES public.articles(id);


--
-- Name: live_coverage_updates live_coverage_updates_author_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_updates
    ADD CONSTRAINT live_coverage_updates_author_id_users_id_fk FOREIGN KEY (author_id) REFERENCES public.users(id);


--
-- Name: live_coverage_updates live_coverage_updates_coverage_id_live_coverages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_updates
    ADD CONSTRAINT live_coverage_updates_coverage_id_live_coverages_id_fk FOREIGN KEY (coverage_id) REFERENCES public.live_coverages(id);


--
-- Name: live_coverage_updates live_coverage_updates_question_id_live_coverage_questions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_coverage_updates
    ADD CONSTRAINT live_coverage_updates_question_id_live_coverage_questions_id_fk FOREIGN KEY (question_id) REFERENCES public.live_coverage_questions(id);


--
-- Name: live_events live_events_category_id_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.live_events
    ADD CONSTRAINT live_events_category_id_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.admin_permissions(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.custom_roles(id) ON DELETE CASCADE;


--
-- Name: team_applications team_applications_reviewed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.team_applications
    ADD CONSTRAINT team_applications_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: users users_custom_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_custom_role_id_fkey FOREIGN KEY (custom_role_id) REFERENCES public.custom_roles(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

