--
-- PostgreSQL database dump
--

\restrict p03vaO53BqMHWBXCI1CK8piQ6TsB31pcDta6XBlIbMQOGxgyCpQ1fn7QgxYlyFl

-- Dumped from database version 14.15 (Homebrew)
-- Dumped by pg_dump version 17.7 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: ActionEventNotifType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ActionEventNotifType" AS ENUM (
    'announcement',
    'misseddeadline',
    'reminder',
    'personalreminder'
);


--
-- Name: ConversationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ConversationType" AS ENUM (
    'direct',
    'multiple',
    'community'
);


--
-- Name: EmailType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmailType" AS ENUM (
    'verification',
    'password_reset',
    'partial_signup',
    'welcome',
    'other',
    'commitment',
    'memberaction',
    'commitmentreminder',
    'memberactionreminder',
    'forum_digest',
    'missed_deadline',
    'missed_second_deadline',
    'custom_action_reminder',
    'contract_suspended'
);


--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'text',
    'email',
    'push'
);


--
-- Name: ParticipantRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ParticipantRole" AS ENUM (
    'admin',
    'member',
    'owner'
);


--
-- Name: ParticipantState; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ParticipantState" AS ENUM (
    'invited',
    'joined'
);


--
-- Name: action_activity_source_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_activity_source_enum AS ENUM (
    'user',
    'admin_override'
);


--
-- Name: action_activity_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_activity_type_enum AS ENUM (
    'user_joined',
    'user_completed',
    'user_declined',
    'user_wont_complete',
    'user_dismissed'
);


--
-- Name: action_customstattype_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_customstattype_enum AS ENUM (
    'none',
    'users_invited'
);


--
-- Name: action_event_newstatus_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_event_newstatus_enum AS ENUM (
    'draft',
    'planned',
    'gathering_commitments',
    'office_action',
    'member_action',
    'resolution',
    'completed',
    'failed',
    'abandoned'
);


--
-- Name: action_reminder_cohorttype_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_reminder_cohorttype_enum AS ENUM (
    'all_uncompleted',
    'group',
    'custom'
);


--
-- Name: action_reminder_timingmode_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_reminder_timingmode_enum AS ENUM (
    'absolute',
    'from_deadline'
);


--
-- Name: action_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_type_enum AS ENUM (
    'Funding',
    'Activity',
    'Ongoing'
);


--
-- Name: action_update_notifytype_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_update_notifytype_enum AS ENUM (
    'none',
    'action_cohort',
    'all_members',
    'tag'
);


--
-- Name: action_visibilitymode_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.action_visibilitymode_enum AS ENUM (
    'public',
    'all_members',
    'participating_groups'
);


--
-- Name: comment_parentobjecttype_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.comment_parentobjecttype_enum AS ENUM (
    'post',
    'action',
    'activity'
);


--
-- Name: community_invite_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.community_invite_status_enum AS ENUM (
    'request_pending',
    'request_rejected',
    'invitee_pending',
    'invitee_accepted',
    'invitee_rejected',
    'cancelled'
);


--
-- Name: contract_event_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contract_event_type_enum AS ENUM (
    'signed',
    'suspended'
);


--
-- Name: friend_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.friend_status_enum AS ENUM (
    'pending',
    'accepted',
    'declined',
    'none'
);


--
-- Name: notification_category_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_category_enum AS ENUM (
    'action_event',
    'forum_reply',
    'friend_request',
    'friend_request_accepted',
    'action_update',
    'likes',
    'removed_from_community',
    'removed_from_community_for_leader',
    'member_left_community',
    'member_suspended_removed_from_community',
    'member_joined_community',
    'community_assigned',
    'new_member_referred',
    'community_invite_created',
    'community_invite_rejected',
    'community_invite_accepted',
    'onetime_invite_request_created',
    'onetime_invite_request_approved',
    'onetime_invite_request_rejected',
    'community_invite_request_created',
    'community_invite_request_rejected'
);


--
-- Name: notification_priority_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.notification_priority_enum AS ENUM (
    'low',
    'high'
);


--
-- Name: onetime_invite_request_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.onetime_invite_request_status_enum AS ENUM (
    'pending',
    'approved',
    'rejected'
);


--
-- Name: onetime_invite_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.onetime_invite_status_enum AS ENUM (
    'request_pending',
    'request_rejected',
    'link_unused',
    'link_used'
);


--
-- Name: recent_search_objecttype_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.recent_search_objecttype_enum AS ENUM (
    'user',
    'action',
    'post',
    'recent',
    'other'
);


--
-- Name: reminder_group_cohorttype_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reminder_group_cohorttype_enum AS ENUM (
    'all_uncompleted',
    'group_leads_with_uncompleted',
    'tag',
    'custom'
);


--
-- Name: reminder_group_timingmode_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.reminder_group_timingmode_enum AS ENUM (
    'absolute',
    'from_deadline',
    'within_range',
    'within_relative_range',
    'event_launch'
);


--
-- Name: user_action_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_action_status_enum AS ENUM (
    'completed',
    'joined',
    'seen',
    'declined',
    'none'
);


--
-- Name: user_away_range_reason_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_away_range_reason_enum AS ENUM (
    'vacation',
    'emergency',
    'other'
);


--
-- Name: user_formdatapreference_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_formdatapreference_enum AS ENUM (
    'public',
    'private'
);


--
-- Name: user_forumdigestpreference_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_forumdigestpreference_enum AS ENUM (
    'off',
    'daily',
    'weekly'
);


--
-- Name: user_preferredactionreminderchannel_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_preferredactionreminderchannel_enum AS ENUM (
    'text',
    'email',
    'push'
);


--
-- Name: user_socialnotifspreference_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_socialnotifspreference_enum AS ENUM (
    'all',
    'digest',
    'none'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: action; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action (
    id integer NOT NULL,
    name character varying NOT NULL,
    category character varying NOT NULL,
    image character varying,
    body character varying NOT NULL,
    "shortDescription" character varying,
    type public.action_type_enum DEFAULT 'Activity'::public.action_type_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "commitmentThreshold" integer,
    "donationAmount" integer DEFAULT 500,
    "taskContents" character varying,
    "taskFormId" integer,
    "timeEstimate" integer,
    commitmentless boolean DEFAULT false NOT NULL,
    "everyoneShouldComplete" boolean DEFAULT false NOT NULL,
    archived boolean DEFAULT false NOT NULL,
    "suiteId" integer,
    priority integer DEFAULT 0 NOT NULL,
    "usersJoined" integer DEFAULT 0 NOT NULL,
    "preventCompletion" boolean DEFAULT false NOT NULL,
    "useManualCohort" boolean DEFAULT false NOT NULL,
    "publicOnly" boolean DEFAULT false NOT NULL,
    "squareThumbnailImage" character varying,
    "squareThumbnailImageAlt" character varying,
    "manualCohortUserIds" integer[],
    "usersCompleted" integer DEFAULT 0 NOT NULL,
    "shouldCompleteAfterDeadline" boolean DEFAULT false NOT NULL,
    "visibilityMode" public.action_visibilitymode_enum DEFAULT 'public'::public.action_visibilitymode_enum NOT NULL,
    optional boolean DEFAULT false NOT NULL,
    onboarding boolean DEFAULT false NOT NULL,
    "isContractSigningAction" boolean DEFAULT false NOT NULL,
    "isForumParticipationAction" boolean DEFAULT false NOT NULL,
    "computedAutocompleteAt" timestamp with time zone,
    "customStatType" public.action_customstattype_enum,
    "customStatLabel" character varying,
    "customStatValue" integer,
    "customStatGoal" integer
);


--
-- Name: action_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_activity (
    id integer NOT NULL,
    "actionId" integer NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    metadata text,
    dollar_amount integer,
    type public.action_activity_type_enum NOT NULL,
    "editableContentId" integer,
    "declineReason" character varying,
    "isMoral" boolean,
    "outOfTime" boolean,
    "taskFormResponseId" integer,
    "likesCount" integer DEFAULT 0 NOT NULL,
    source public.action_activity_source_enum DEFAULT 'user'::public.action_activity_source_enum NOT NULL
);


--
-- Name: action_activity_comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_activity_comment (
    id integer NOT NULL,
    content character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    "activityId" integer,
    "authorId" integer
);


--
-- Name: action_activity_comment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_activity_comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_activity_comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_activity_comment_id_seq OWNED BY public.action_activity_comment.id;


--
-- Name: action_activity_comment_likes_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_activity_comment_likes_user (
    "actionActivityCommentId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: action_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_activity_id_seq OWNED BY public.action_activity.id;


--
-- Name: action_activity_likes_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_activity_likes_user (
    "actionActivityId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: action_authors_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_authors_user (
    "actionId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: action_event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_event (
    id integer NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    date timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "actionId" integer,
    "newStatus" public.action_event_newstatus_enum DEFAULT 'draft'::public.action_event_newstatus_enum NOT NULL,
    "suiteManaged" boolean DEFAULT false NOT NULL
);


--
-- Name: action_event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_event_id_seq OWNED BY public.action_event.id;


--
-- Name: action_event_notif; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_event_notif (
    id integer NOT NULL,
    channel public."NotificationChannel" NOT NULL,
    sent boolean DEFAULT false NOT NULL,
    "mailId" integer,
    "userId" integer,
    "mmsId" integer,
    type public."ActionEventNotifType" DEFAULT 'announcement'::public."ActionEventNotifType" NOT NULL,
    idempotency_key text,
    "reminderGroupId" integer,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: action_event_notif_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_event_notif_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_event_notif_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_event_notif_id_seq OWNED BY public.action_event_notif.id;


--
-- Name: action_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_id_seq OWNED BY public.action.id;


--
-- Name: action_manual_cohort_users_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_manual_cohort_users_user (
    "actionId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: action_participating_groups_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_participating_groups_group (
    "actionId" integer NOT NULL,
    "groupId" integer NOT NULL
);


--
-- Name: action_participating_tags_tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_participating_tags_tag (
    "actionId" integer NOT NULL,
    "tagId" uuid NOT NULL
);


--
-- Name: action_reminder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_reminder (
    id integer NOT NULL,
    "emailMessage" text NOT NULL,
    "textMessage" text NOT NULL,
    "sendAtAbsolute" timestamp with time zone,
    "sentAt" timestamp with time zone,
    "memberActionEventId" integer,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "emailSubject" text NOT NULL,
    "cohortType" public.action_reminder_cohorttype_enum,
    "timingMode" public.action_reminder_timingmode_enum NOT NULL,
    "sendAtSecondsFromDeadline" integer
);


--
-- Name: action_reminder_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_reminder_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_reminder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_reminder_id_seq OWNED BY public.action_reminder.id;


--
-- Name: action_reminder_users_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_reminder_users_user (
    "actionReminderId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: action_share_url; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_share_url (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    url character varying NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    data jsonb NOT NULL,
    "userId" integer,
    "actionId" integer,
    sid character varying
);


--
-- Name: action_stats_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_stats_record (
    id integer NOT NULL,
    "actionId" integer NOT NULL,
    "actionName" character varying NOT NULL,
    "usersCompleted" integer NOT NULL,
    "usersJoined" integer NOT NULL,
    "completionRate" double precision NOT NULL,
    "lastCalculatedAt" timestamp with time zone NOT NULL,
    "actionCompletedAt" timestamp with time zone,
    "showInChart" boolean DEFAULT true NOT NULL,
    "memberActionStartDate" timestamp with time zone,
    "memberActionEndDate" timestamp with time zone,
    "usersWithdrawn" integer DEFAULT 0 NOT NULL
);


--
-- Name: action_stats_record_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_stats_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_stats_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_stats_record_id_seq OWNED BY public.action_stats_record.id;


--
-- Name: action_suite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_suite (
    id integer NOT NULL,
    name character varying NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: action_suite_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_suite_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_suite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_suite_id_seq OWNED BY public.action_suite.id;


--
-- Name: action_update; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_update (
    id integer NOT NULL,
    title text NOT NULL,
    date timestamp with time zone NOT NULL,
    "visibleAt" timestamp with time zone NOT NULL,
    "notifyType" public.action_update_notifytype_enum DEFAULT 'none'::public.action_update_notifytype_enum NOT NULL,
    "actionId" integer,
    "contentId" integer,
    "associatedEventId" integer,
    "shortNotifString" text NOT NULL,
    "tagId" uuid
);


--
-- Name: action_update_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.action_update_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: action_update_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.action_update_id_seq OWNED BY public.action_update.id;


--
-- Name: city; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.city (
    id integer NOT NULL,
    name character varying NOT NULL,
    admin1 character varying(20) NOT NULL,
    admin2 character varying(80) NOT NULL,
    "countryCode" character varying(2) NOT NULL,
    "countryName" character varying NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    "asciiName" character varying,
    "englishName" character varying
);


--
-- Name: comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment (
    id integer NOT NULL,
    "authorId" integer NOT NULL,
    "parentObjectType" public.comment_parentobjecttype_enum NOT NULL,
    "parentObjectId" integer NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "parentId" integer,
    pinned boolean DEFAULT false NOT NULL,
    "editableContentId" integer,
    "likesCount" integer DEFAULT 0 NOT NULL
);


--
-- Name: comment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comment_id_seq OWNED BY public.comment.id;


--
-- Name: comment_likes_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_likes_user (
    "commentId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: communique; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communique (
    id integer NOT NULL,
    title character varying NOT NULL,
    "bodyText" text NOT NULL,
    "headerImage" character varying,
    "dateCreated" timestamp without time zone DEFAULT now() NOT NULL,
    "dateUpdated" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: communique_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.communique_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communique_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.communique_id_seq OWNED BY public.communique.id;


--
-- Name: communique_users_read; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communique_users_read (
    "communiqueId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: community; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying,
    photo character varying,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    public boolean DEFAULT false NOT NULL,
    "maxCapacity" integer DEFAULT 10,
    "allowMemberInvites" boolean DEFAULT true NOT NULL,
    "allowStaffAssignments" boolean DEFAULT true NOT NULL,
    CONSTRAINT "CHK_e3b803cade15a7f3393e73d015" CHECK ((((public = false) AND ("allowMemberInvites" = false) AND ("allowStaffAssignments" = false)) OR ("maxCapacity" IS NOT NULL))),
    CONSTRAINT chk_public_requires_member_invites CHECK (((public = false) OR ("allowMemberInvites" = true))),
    CONSTRAINT chk_public_requires_staff_assignments CHECK (((public = false) OR ("allowStaffAssignments" = true)))
);


--
-- Name: community_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.community_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: community_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.community_id_seq OWNED BY public.community.id;


--
-- Name: community_invite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_invite (
    id integer NOT NULL,
    status public.community_invite_status_enum NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "invitingUserId" integer,
    "invitedUserId" integer,
    "communityId" integer,
    "deletedAt" timestamp with time zone
);


--
-- Name: community_invite_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.community_invite_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: community_invite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.community_invite_id_seq OWNED BY public.community_invite.id;


--
-- Name: community_leaders_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_leaders_user (
    "communityId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: community_users_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_users_user (
    "communityId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: contract_event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contract_event (
    id integer NOT NULL,
    type public.contract_event_type_enum NOT NULL,
    date timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    automatic boolean DEFAULT false NOT NULL,
    "userId" integer,
    "autoSuspendKey" character varying
);


--
-- Name: contract_event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contract_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contract_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contract_event_id_seq OWNED BY public.contract_event.id;


--
-- Name: conversation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation (
    id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    type public."ConversationType" NOT NULL,
    title character varying NOT NULL,
    photo character varying,
    "communityId" integer,
    CONSTRAINT "CHK_1732f98a11baec912cf67f5787" CHECK ((((type = 'direct'::public."ConversationType") AND ("communityId" IS NULL)) OR ((type = 'multiple'::public."ConversationType") AND ("communityId" IS NULL)) OR ((type = 'community'::public."ConversationType") AND ("communityId" IS NOT NULL))))
);


--
-- Name: conversation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversation_id_seq OWNED BY public.conversation.id;


--
-- Name: custom_validator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_validator (
    id integer NOT NULL,
    type character varying NOT NULL,
    "idArgument" character varying,
    expression character varying
);


--
-- Name: custom_validator_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.custom_validator_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: custom_validator_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.custom_validator_id_seq OWNED BY public.custom_validator.id;


--
-- Name: daily_stats_record; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_stats_record (
    id integer NOT NULL,
    "dayId" character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    "signedMembers" integer NOT NULL,
    "suspendedMembers" integer NOT NULL,
    "actionsCompleted" integer NOT NULL,
    "invitesCreated" integer NOT NULL,
    "invitesAccepted" integer NOT NULL,
    "anonFormSubmissions" integer DEFAULT 0 NOT NULL
);


--
-- Name: daily_stats_record_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.daily_stats_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: daily_stats_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.daily_stats_record_id_seq OWNED BY public.daily_stats_record.id;


--
-- Name: editable_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.editable_content (
    id integer NOT NULL,
    body text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: editable_content_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.editable_content_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: editable_content_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.editable_content_id_seq OWNED BY public.editable_content.id;


--
-- Name: form; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form (
    id integer NOT NULL,
    title text NOT NULL,
    schema jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: form_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.form_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.form_id_seq OWNED BY public.form.id;


--
-- Name: form_response; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_response (
    id integer NOT NULL,
    "formId" integer NOT NULL,
    answers jsonb NOT NULL,
    "userId" integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "schemaSnapshot" jsonb NOT NULL,
    "visibilityValidatorResults" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "deviceType" text,
    "publicAnswers" jsonb DEFAULT '{}'::jsonb NOT NULL,
    sid text,
    "phDistinctId" character varying,
    "sessionReplayUrl" text
);


--
-- Name: form_response_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.form_response_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: form_response_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.form_response_id_seq OWNED BY public.form_response.id;


--
-- Name: forum_digest_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.forum_digest_log (
    id integer NOT NULL,
    "digestDate" date NOT NULL,
    "preferenceUsed" public.user_forumdigestpreference_enum NOT NULL,
    "notificationsCount" integer NOT NULL,
    "notificationIds" integer[] DEFAULT '{}'::integer[] NOT NULL,
    "notificationsSummary" jsonb,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: forum_digest_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.forum_digest_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: forum_digest_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.forum_digest_log_id_seq OWNED BY public.forum_digest_log.id;


--
-- Name: friend; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friend (
    id integer NOT NULL,
    status public.friend_status_enum DEFAULT 'none'::public.friend_status_enum NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "acceptedAt" timestamp without time zone,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "requesterId" integer,
    "addresseeId" integer,
    "sentNotifId" integer,
    "acceptedNotifId" integer
);


--
-- Name: friend_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.friend_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: friend_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.friend_id_seq OWNED BY public.friend.id;


--
-- Name: group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."group" (
    id integer NOT NULL,
    name character varying NOT NULL,
    description character varying NOT NULL,
    "publicDisplayName" character varying,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.group_id_seq OWNED BY public."group".id;


--
-- Name: group_participating_in_action; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_participating_in_action (
    "groupId" integer NOT NULL,
    "actionId" integer NOT NULL
);


--
-- Name: group_users_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_users_user (
    "groupId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image (
    id integer NOT NULL,
    "dateCreated" timestamp with time zone DEFAULT now() NOT NULL,
    "dateUpdated" timestamp with time zone DEFAULT now() NOT NULL,
    key character varying NOT NULL,
    mime character varying NOT NULL,
    size integer NOT NULL
);


--
-- Name: image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.image_id_seq OWNED BY public.image.id;


--
-- Name: mail; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mail (
    id integer NOT NULL,
    "sentMessageId" text,
    "to" character varying NOT NULL,
    status character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "emailType" public."EmailType" NOT NULL,
    cid character varying,
    "clickedLink" boolean DEFAULT false NOT NULL,
    "renderedHtml" text
);


--
-- Name: mail_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mail_id_seq OWNED BY public.mail.id;


--
-- Name: message; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    body character varying NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "authorId" integer,
    "conversationId" integer,
    "replyToId" uuid,
    "deletedAt" timestamp with time zone,
    attachments jsonb DEFAULT '[]'::jsonb NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: mms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mms (
    id integer NOT NULL,
    "to" character varying NOT NULL,
    "from" character varying NOT NULL,
    body character varying NOT NULL,
    status text NOT NULL,
    "twilioSid" character varying NOT NULL,
    "errorMessage" character varying,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "errorCode" integer,
    cid character varying,
    "clickedLink" boolean DEFAULT false NOT NULL
);


--
-- Name: mms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mms_id_seq OWNED BY public.mms.id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification (
    id integer NOT NULL,
    category public.notification_category_enum NOT NULL,
    message character varying NOT NULL,
    "webAppLocation" character varying,
    "mobileAppLocation" character varying,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "userId" integer,
    "actionUpdateId" integer,
    "groupingKey" character varying,
    "groupingCount" integer,
    "commentId" integer,
    "sendTime" timestamp with time zone DEFAULT now() NOT NULL,
    "targetContent" character varying,
    "onetimeInviteId" integer,
    "readAt" timestamp without time zone,
    "shouldPush" boolean DEFAULT true NOT NULL,
    "pushDispatchedAt" timestamp with time zone,
    "pushClaimedBy" character varying,
    "pushClaimedAt" timestamp without time zone,
    priority public.notification_priority_enum DEFAULT 'low'::public.notification_priority_enum NOT NULL
);


--
-- Name: notification_associated_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_associated_users (
    "notificationId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: notification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notification_id_seq OWNED BY public.notification.id;


--
-- Name: onetime_invite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onetime_invite (
    id integer NOT NULL,
    invitee character varying NOT NULL,
    code character varying NOT NULL,
    "invitingUserId" integer,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "communityId" integer,
    status public.onetime_invite_status_enum NOT NULL,
    "inviteeDescription" character varying,
    "deletedAt" timestamp with time zone,
    info character varying,
    "usedAt" timestamp with time zone
);


--
-- Name: onetime_invite_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.onetime_invite_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: onetime_invite_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.onetime_invite_id_seq OWNED BY public.onetime_invite.id;


--
-- Name: onetime_invite_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.onetime_invite_request (
    id integer NOT NULL,
    invitee character varying NOT NULL,
    "inviteeDescription" character varying,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "invitingUserId" integer,
    "communityId" integer,
    status public.onetime_invite_request_status_enum DEFAULT 'pending'::public.onetime_invite_request_status_enum NOT NULL
);


--
-- Name: onetime_invite_request_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.onetime_invite_request_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: onetime_invite_request_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.onetime_invite_request_id_seq OWNED BY public.onetime_invite_request.id;


--
-- Name: participant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.participant (
    id integer NOT NULL,
    role public."ParticipantRole" NOT NULL,
    state public."ParticipantState" DEFAULT 'joined'::public."ParticipantState" NOT NULL,
    "joinedAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "conversationId" integer,
    "userId" integer,
    "lastReadMessageId" uuid,
    "userHidden" boolean DEFAULT false NOT NULL
);


--
-- Name: participant_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.participant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: participant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.participant_id_seq OWNED BY public.participant.id;


--
-- Name: payment_user_data_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_user_data_token (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "paymentIntentId" character varying,
    "firstName" character varying,
    "lastName" character varying,
    email character varying
);


--
-- Name: personal_action_reminder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_action_reminder (
    id integer NOT NULL,
    "sentAt" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "memberActionEventId" integer,
    "userId" integer,
    "groupId" integer,
    "skippedForCompletion" boolean DEFAULT false NOT NULL
);


--
-- Name: personal_action_reminder_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_action_reminder_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_action_reminder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_action_reminder_id_seq OWNED BY public.personal_action_reminder.id;


--
-- Name: post; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post (
    id integer NOT NULL,
    title character varying NOT NULL,
    "authorId" integer NOT NULL,
    "actionId" integer,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    pinned boolean DEFAULT false NOT NULL,
    "editableContentId" integer,
    "visibleAt" timestamp with time zone,
    "qaMode" boolean DEFAULT false NOT NULL,
    "expertLabel" character varying
);


--
-- Name: post_authors_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_authors_user (
    "postId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: post_experts_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_experts_user (
    "postId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: post_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.post_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: post_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.post_id_seq OWNED BY public.post.id;


--
-- Name: post_likes_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_likes_user (
    "postId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: prefill_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prefill_user (
    id integer NOT NULL,
    "firstName" character varying NOT NULL,
    "lastName" character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying NOT NULL,
    "cityId" integer
);


--
-- Name: prefill_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prefill_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prefill_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prefill_user_id_seq OWNED BY public.prefill_user.id;


--
-- Name: push; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.push (
    id integer NOT NULL,
    "expoPushToken" character varying NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    body character varying NOT NULL,
    screen character varying,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "receiptId" character varying,
    "ticketStatus" character varying,
    "receiptStatus" character varying,
    "errorCode" character varying,
    "errorMessage" character varying,
    "lastCheckedStatusAt" timestamp without time zone,
    "idempotencyKey" character varying,
    "notificationId" integer,
    "actionEventNotifId" integer
);


--
-- Name: push_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.push_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: push_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.push_id_seq OWNED BY public.push.id;


--
-- Name: recent_search; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recent_search (
    id integer NOT NULL,
    "objectId" integer NOT NULL,
    "objectType" public.recent_search_objecttype_enum NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: recent_search_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recent_search_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recent_search_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recent_search_id_seq OWNED BY public.recent_search.id;


--
-- Name: reminder_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reminder_group (
    id integer NOT NULL,
    name character varying NOT NULL,
    "emailMessage" text NOT NULL,
    "emailSubject" text NOT NULL,
    "textMessage" text NOT NULL,
    "memberActionEventId" integer,
    "cohortType" public.reminder_group_cohorttype_enum,
    "timingMode" public.reminder_group_timingmode_enum DEFAULT 'within_range'::public.reminder_group_timingmode_enum NOT NULL,
    send_range_start timestamp with time zone,
    send_range_end timestamp with time zone,
    "sendAtAbsolute" timestamp with time zone,
    "sendAtSecondsFromDeadline" integer,
    "allSent" boolean DEFAULT false NOT NULL,
    "actionSuiteId" integer,
    "deadlineEventId" integer,
    relative_range_start_seconds_from_deadline integer,
    relative_range_end_seconds_from_deadline integer,
    "useSuiteTaskCount" boolean DEFAULT true NOT NULL,
    "pushMessage" text DEFAULT ''::text NOT NULL,
    "userTagId" uuid,
    CONSTRAINT "CHK_9b31a4f7019205096c6cdf8a69" CHECK (((send_range_start IS NULL) OR (send_range_end IS NULL) OR (send_range_start <= send_range_end))),
    CONSTRAINT "CHK_a0d02d5c399e70d5fbd9cabeed" CHECK (((("timingMode" = 'absolute'::public.reminder_group_timingmode_enum) AND ("sendAtAbsolute" IS NOT NULL)) OR (("timingMode" = 'from_deadline'::public.reminder_group_timingmode_enum) AND ("sendAtSecondsFromDeadline" IS NOT NULL)) OR (("timingMode" = 'within_range'::public.reminder_group_timingmode_enum) AND (send_range_start IS NOT NULL) AND (send_range_end IS NOT NULL)) OR (("timingMode" = 'within_relative_range'::public.reminder_group_timingmode_enum) AND (relative_range_start_seconds_from_deadline IS NOT NULL) AND (relative_range_end_seconds_from_deadline IS NOT NULL)) OR (("timingMode" = 'event_launch'::public.reminder_group_timingmode_enum) AND ("memberActionEventId" IS NOT NULL)))),
    CONSTRAINT "CHK_b81bb4192a6ae7d40a39c88a86" CHECK (((relative_range_start_seconds_from_deadline IS NULL) OR (relative_range_end_seconds_from_deadline IS NULL) OR (relative_range_start_seconds_from_deadline >= relative_range_end_seconds_from_deadline)))
);


--
-- Name: reminder_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.reminder_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: reminder_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.reminder_group_id_seq OWNED BY public.reminder_group.id;


--
-- Name: reminder_group_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reminder_group_users (
    "reminderGroupId" integer NOT NULL,
    "userId" integer NOT NULL
);


--
-- Name: tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag (
    name character varying NOT NULL,
    description character varying NOT NULL,
    "publicDisplayName" character varying,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL
);


--
-- Name: tag_participating_in_action; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag_participating_in_action (
    "actionId" integer NOT NULL,
    "tagId" uuid NOT NULL
);


--
-- Name: tag_users_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tag_users_user (
    "userId" integer NOT NULL,
    "tagId" uuid NOT NULL
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    admin boolean DEFAULT false NOT NULL,
    "profilePicture" character varying,
    "profileDescription" character varying,
    over18 boolean,
    "referredById" integer,
    "cityId" integer,
    "referralCode" character varying,
    "stripeCustomerId" character varying,
    "isNotSignedUpPartialProfile" boolean DEFAULT false NOT NULL,
    anonymous boolean DEFAULT false NOT NULL,
    "phoneNumber" character varying,
    "phoneNumberValidated" boolean DEFAULT false NOT NULL,
    "phoneNumberUnsubscribed" boolean DEFAULT false NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "socialNotifsPreference" public.user_socialnotifspreference_enum DEFAULT 'all'::public.user_socialnotifspreference_enum NOT NULL,
    "turnedOffAllNotifs" boolean DEFAULT false NOT NULL,
    "emailNotifsEnabled" boolean DEFAULT true NOT NULL,
    "textNotifsEnabled" boolean DEFAULT true NOT NULL,
    "pushNotifsEnabled" boolean DEFAULT true NOT NULL,
    staff boolean DEFAULT false NOT NULL,
    "welcomeMailId" integer,
    "forumDigestPreference" public.user_forumdigestpreference_enum DEFAULT 'off'::public.user_forumdigestpreference_enum NOT NULL,
    "preferredReminderTime" time without time zone,
    "timeZone" text,
    "preferredActionReminderChannel" public.user_preferredactionreminderchannel_enum DEFAULT 'text'::public.user_preferredactionreminderchannel_enum NOT NULL,
    "shareEmailWithCommunityLead" boolean DEFAULT true NOT NULL,
    "sharePhoneNumberWithCommunityLead" boolean DEFAULT true NOT NULL,
    "formDataPreference" public.user_formdatapreference_enum DEFAULT 'public'::public.user_formdatapreference_enum NOT NULL,
    "customCityString" character varying,
    "shareInfoPublicly" boolean DEFAULT false NOT NULL,
    "pushesForLikes" boolean DEFAULT true NOT NULL,
    "pushesForComments" boolean DEFAULT true NOT NULL,
    "pushesForFriendRequests" boolean DEFAULT true NOT NULL,
    "optInMmsId" integer,
    "undergoingGroupAssignment" boolean DEFAULT false NOT NULL,
    "remindAboutUncompletedGroupMembers" boolean DEFAULT true NOT NULL,
    "referredByInviteId" integer,
    "pendingCommunityId" integer
);


--
-- Name: user_action; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_action (
    id integer NOT NULL,
    status public.user_action_status_enum DEFAULT 'none'::public.user_action_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "dateCommitted" timestamp without time zone,
    "dateCompleted" timestamp without time zone,
    deadline timestamp without time zone,
    "userId" integer,
    "actionId" integer
);


--
-- Name: user_action_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_action_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_action_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_action_id_seq OWNED BY public.user_action.id;


--
-- Name: user_away_range; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_away_range (
    id integer NOT NULL,
    "userId" integer NOT NULL,
    "startDate" timestamp with time zone NOT NULL,
    "endDate" timestamp with time zone NOT NULL,
    note text,
    reason public.user_away_range_reason_enum DEFAULT 'other'::public.user_away_range_reason_enum NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_away_range_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_away_range_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_away_range_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_away_range_id_seq OWNED BY public.user_away_range.id;


--
-- Name: user_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_device (
    "deviceType" character varying,
    "expoPushToken" character varying,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "userId" integer,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL
);


--
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: action id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action ALTER COLUMN id SET DEFAULT nextval('public.action_id_seq'::regclass);


--
-- Name: action_activity id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity ALTER COLUMN id SET DEFAULT nextval('public.action_activity_id_seq'::regclass);


--
-- Name: action_activity_comment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_comment ALTER COLUMN id SET DEFAULT nextval('public.action_activity_comment_id_seq'::regclass);


--
-- Name: action_event id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_event ALTER COLUMN id SET DEFAULT nextval('public.action_event_id_seq'::regclass);


--
-- Name: action_event_notif id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_event_notif ALTER COLUMN id SET DEFAULT nextval('public.action_event_notif_id_seq'::regclass);


--
-- Name: action_reminder id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_reminder ALTER COLUMN id SET DEFAULT nextval('public.action_reminder_id_seq'::regclass);


--
-- Name: action_stats_record id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_stats_record ALTER COLUMN id SET DEFAULT nextval('public.action_stats_record_id_seq'::regclass);


--
-- Name: action_suite id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_suite ALTER COLUMN id SET DEFAULT nextval('public.action_suite_id_seq'::regclass);


--
-- Name: action_update id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_update ALTER COLUMN id SET DEFAULT nextval('public.action_update_id_seq'::regclass);


--
-- Name: comment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment ALTER COLUMN id SET DEFAULT nextval('public.comment_id_seq'::regclass);


--
-- Name: communique id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communique ALTER COLUMN id SET DEFAULT nextval('public.communique_id_seq'::regclass);


--
-- Name: community id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community ALTER COLUMN id SET DEFAULT nextval('public.community_id_seq'::regclass);


--
-- Name: community_invite id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_invite ALTER COLUMN id SET DEFAULT nextval('public.community_invite_id_seq'::regclass);


--
-- Name: contract_event id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_event ALTER COLUMN id SET DEFAULT nextval('public.contract_event_id_seq'::regclass);


--
-- Name: conversation id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation ALTER COLUMN id SET DEFAULT nextval('public.conversation_id_seq'::regclass);


--
-- Name: custom_validator id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_validator ALTER COLUMN id SET DEFAULT nextval('public.custom_validator_id_seq'::regclass);


--
-- Name: daily_stats_record id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_stats_record ALTER COLUMN id SET DEFAULT nextval('public.daily_stats_record_id_seq'::regclass);


--
-- Name: editable_content id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.editable_content ALTER COLUMN id SET DEFAULT nextval('public.editable_content_id_seq'::regclass);


--
-- Name: form id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form ALTER COLUMN id SET DEFAULT nextval('public.form_id_seq'::regclass);


--
-- Name: form_response id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_response ALTER COLUMN id SET DEFAULT nextval('public.form_response_id_seq'::regclass);


--
-- Name: forum_digest_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_digest_log ALTER COLUMN id SET DEFAULT nextval('public.forum_digest_log_id_seq'::regclass);


--
-- Name: friend id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend ALTER COLUMN id SET DEFAULT nextval('public.friend_id_seq'::regclass);


--
-- Name: group id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."group" ALTER COLUMN id SET DEFAULT nextval('public.group_id_seq'::regclass);


--
-- Name: image id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image ALTER COLUMN id SET DEFAULT nextval('public.image_id_seq'::regclass);


--
-- Name: mail id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail ALTER COLUMN id SET DEFAULT nextval('public.mail_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: mms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mms ALTER COLUMN id SET DEFAULT nextval('public.mms_id_seq'::regclass);


--
-- Name: notification id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification ALTER COLUMN id SET DEFAULT nextval('public.notification_id_seq'::regclass);


--
-- Name: onetime_invite id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onetime_invite ALTER COLUMN id SET DEFAULT nextval('public.onetime_invite_id_seq'::regclass);


--
-- Name: onetime_invite_request id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onetime_invite_request ALTER COLUMN id SET DEFAULT nextval('public.onetime_invite_request_id_seq'::regclass);


--
-- Name: participant id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participant ALTER COLUMN id SET DEFAULT nextval('public.participant_id_seq'::regclass);


--
-- Name: personal_action_reminder id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_action_reminder ALTER COLUMN id SET DEFAULT nextval('public.personal_action_reminder_id_seq'::regclass);


--
-- Name: post id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post ALTER COLUMN id SET DEFAULT nextval('public.post_id_seq'::regclass);


--
-- Name: prefill_user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prefill_user ALTER COLUMN id SET DEFAULT nextval('public.prefill_user_id_seq'::regclass);


--
-- Name: push id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push ALTER COLUMN id SET DEFAULT nextval('public.push_id_seq'::regclass);


--
-- Name: recent_search id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recent_search ALTER COLUMN id SET DEFAULT nextval('public.recent_search_id_seq'::regclass);


--
-- Name: reminder_group id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_group ALTER COLUMN id SET DEFAULT nextval('public.reminder_group_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Name: user_action id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_action ALTER COLUMN id SET DEFAULT nextval('public.user_action_id_seq'::regclass);


--
-- Name: user_away_range id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_away_range ALTER COLUMN id SET DEFAULT nextval('public.user_away_range_id_seq'::regclass);


--
-- Data for Name: action; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action VALUES (10, 'Make a reliability plan', 'meta', '', 'This action is to help the office understand how members plan to complete tasks.', 'This action is to help the office understand how members plan to complete tasks.', 'Activity', '2025-08-31 19:37:32.879977', '2026-02-10 10:50:00.153484-08', NULL, 500, NULL, 5, 3, true, true, false, 1, -1, 4, false, false, false, NULL, NULL, '{}', 101, false, 'public', false, true, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (59, 'Decide whether to make basic profile information public', 'meta', NULL, 'Public information about members will increase the Alliance’ transparency.', 'Public information about members will improve the Alliance’s transparency.', 'Activity', '2026-01-06 23:12:12.894119', '2026-02-10 10:50:00.161782-08', NULL, 500, NULL, 53, 1, true, false, false, 14, 11, 5, true, false, false, NULL, NULL, '{}', 55, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (66, 'Read the Alliance’s recent progress update', 'Meta', NULL, 'The office recently wrote a public progress update that describes the key learnings from the actions the Alliance has run so far. This update includes information about members’ reliability, members’ experience, action production, and other topics.

You can read the progress update [here](https://worldalliance.org/progress/early-action-learnings). ', 'Reading the update will help members better understand the Alliance’s operations.', 'Activity', '2026-01-13 22:57:29.632', '2026-02-10 10:50:00.168936-08', NULL, 500, NULL, 59, 10, true, true, false, 16, 0, 4, false, false, false, NULL, NULL, '{}', 38, false, 'all_members', true, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (15, 'Unsubscribe from unwanted catalogs', 'environment', '', ' ', 'Save paper by unsubscribing from unused catalogs.', 'Activity', '2025-09-23 22:33:02.208504', '2026-02-10 10:50:00.17807-08', NULL, 500, NULL, 11, 10, true, false, true, NULL, 0, 0, false, false, false, NULL, NULL, '{}', 0, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (18, 'Provide a quote about Alliance participation', 'meta', '', ' ', 'Member quotes will strengthen our pitch to potential Alliance staff, endorsers, and funders.', 'Activity', '2025-10-06 20:21:53.021518', '2026-02-10 10:50:00.189964-08', NULL, 500, NULL, 14, 5, true, false, false, 2, 0, 6, true, false, false, NULL, NULL, '{}', 33, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (50, 'Report a pothole in your community', 'poverty', NULL, 'This action asks members to report potholes to their respective municipalities. The goals of this action are to:

1. Fill potholes.
2. Introduce members to an effective way to engage with local government.

### Costs of potholes

Potholes cost the world billions of dollars in vehicle damages, accidents, and increased emissions annually. Authoritative information is sparse, but surveys indicate potholes cost US drivers [$3B in 2016](https://wanada.org/pothole-damage-costs-u-s-drivers-3-billion-a-year/) and UK drivers [£1.5B in 2024](https://www.etelimited.co.uk/news/potholes-cost-nations-drivers-over-a-billion-pounds-in-repairs). 

Around [3 percent of drivers](https://www.autoinsurance.com/research/pothole-damage/) in America need repairs due to potholes each year, with an average repair cost of just over $300. An unexpected $300 repair bill is a significant financial burden for low-income individuals.

### Repairing potholes

Businesses [charge $45 to $150 or higher](https://pavemade.com/pages/understanding-the-costs-involved-in-asphalt-repair-3) to repair a pothole, depending on size and depth. Statistics about the cost of municipal pothole repairs are difficult to find, but a [Texas Department of Transportation audit](https://www.governing.com/archive/who-should-fix-the.html) suggests the cost of road repairs is 2-5x cheaper for government workers. 

Estimates suggest that there are [55 million potholes](https://www.niradynamics.com/latest/potholes-sweden-europe-usa) in the US, which implies an average yearly cost of around $50 per pothole.

If a pothole is not repaired early, water can [accumulate under the pavement](https://www.asphaltmagazine.com/preventing-and-repairing-potholes-and-pavement-cracks/) and cause larger failures that are more expensive to repair.

### Reporting potholes

If a pothole is reported to a local municipality in the US, they are generally required to fill it in “reasonable time,” [often](https://www.houstonpotholes.org/) [within](https://www.sf.gov/data--pothole-response) [3](https://www.cityofrochester.gov/departments/department-environmental-services-des/pothole-repair) [days](https://www.seattle.gov/transportation/projects-and-programs/programs/maintenance-and-paving/potholes). Even if the municipality does not fill the pothole, it becomes liable for damages caused by the reported pothole in the future. 

To verify response times, the office asked two people to locate and report potholes in North Andover, Massachusetts and Berkeley, California. Both potholes were filled within 72 hours.

Even though pothole reports are highly effective, available data suggests that residents rarely report potholes. For instance, in 2021 only [20% of the potholes repaired](https://www.nlc.org/article/2022/10/28/using-ai-and-machine-learning-to-proactively-address-urban-blight/) by the City of Memphis had been reported by citizens; the rest were identified by street maintenance crews.

```imgcap
1762827853197.webp
Before and after of a pothole a member reported in Berkeley, California.
```

```imgcap
1762827924484.webp
The service request filled by the City of Berkeley.
```
', 'Reporting potholes could prevent thousands of dollars in damages and will help members learn about local government.', 'Activity', '2025-11-11 02:26:48.620421', '2026-02-10 10:50:00.200826-08', NULL, 500, NULL, 44, 15, true, false, false, 7, 0, 6, true, false, false, 'https://worldalliance.org/api/images/1765911493684.webp', 'A pothole reported by a member', '{}', 32, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (55, 'Participate in a survey on ethical AI privacy settings', 'technology', NULL, '', 'Results will inform a follow-up AI data use campaign. ', 'Activity', '2025-12-10 21:50:18.209569', '2026-02-10 10:50:00.207149-08', NULL, 500, NULL, 48, 5, true, false, false, NULL, 0, 1, false, false, true, NULL, NULL, '{}', 0, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (34, 'Personalize your task reminders', 'meta', NULL, 'The strategic office is collecting extra information from members to make task reminders more helpful.

First, the office is testing a new community program in which members can help remind one another to complete tasks.

Second, the office is collecting information about preferred reminder times.', 'A new community program and other options are now available to make task reminders more helpful to you.', 'Activity', '2025-10-24 23:55:49.133134', '2026-02-10 10:50:00.220391-08', NULL, 500, NULL, 28, 2, true, false, false, 4, 0, 6, true, false, false, NULL, NULL, '{}', 32, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (58, 'Review three previous Alliance actions', 'meta', NULL, 'A review of past actions will help new members better understand the Alliance.', 'A review of past actions will help new members better understand the Alliance.', 'Activity', '2025-12-25 05:49:05.160234', '2026-02-10 10:50:00.227955-08', NULL, 500, NULL, 52, 15, true, false, false, 13, 0, 0, false, true, false, NULL, NULL, '{70,81,84,85,87,88,89,90,92,93,94,95,96,98,99}', 12, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (16, 'Place yourself on the National Do Not Mail List', 'environment', '', 'Reduce junk mail and save paper by registering on the National Do Not Mail List', 'Reduce junk mail and save paper by registering on the National Do Not Mail List', 'Activity', '2025-09-23 23:22:14.160584', '2026-02-10 10:50:00.233798-08', NULL, 500, NULL, 12, 5, true, false, true, NULL, 0, 0, false, false, false, NULL, NULL, '{}', 0, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (17, 'Prepare for future actions involving Instagram', 'meta', '', 'Some future alliance tasks will require members to have Instagram accounts. If you do not have an account, please create one.', 'Create an Instagram account for use in future Alliance tasks.', 'Activity', '2025-09-24 22:20:31.179107', '2026-02-10 10:50:00.110262-08', NULL, 500, NULL, 13, 10, true, false, true, NULL, 0, 0, false, false, false, NULL, NULL, '{}', 0, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (72, 'Explore the platform', '', NULL, 'This action is to help familiarize new members with the platform.', 'This action is to help familiarize new members with the platform.', 'Activity', '2026-01-28 22:47:19.051', '2026-02-10 10:50:00.131833-08', NULL, 500, NULL, 65, 3, true, true, false, 1, -3, 0, false, false, false, NULL, NULL, '{}', 9, false, 'all_members', false, true, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (9, 'Set up your account', 'meta', '', 'This action is to ensure members can easily learn about one another.', 'Profile pictures and descriptions help members learn about one another.', 'Activity', '2025-08-29 21:07:00.984566', '2026-02-10 10:50:00.175445-08', NULL, 500, NULL, 3, 3, true, true, false, 1, -2, 3, false, false, false, 'https://worldalliance.org/api/images/1765925205045.webp', 'Members', '{}', 94, false, 'public', false, true, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (57, 'Read a few general updates', 'meta', NULL, 'This action is to provide members with a few updates relevant to the holiday season.', 'This action is to provide members with a few updates relevant to the holiday season.', 'Activity', '2025-12-16 04:09:22.367695', '2026-02-10 10:50:00.213786-08', NULL, 500, NULL, 49, 3, true, false, false, 11, 1, 5, true, false, false, NULL, NULL, '{}', 45, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (70, 'Collect unclaimed property for a potential future donation', 'poverty', NULL, 'Unclaimed property refers to money that is owed to a person, but could not be delivered to them. The government holds onto this money until the person claims it.

This action helps members claim money that they are owed. Since the office helped members collect money that they may not have claimed otherwise, we suggest that members donate about half of the money they receive. These contributions will help the Alliance achieve our goal of donating $500 to GiveDirectly.', 'Members will have the option to donate some of the money they collect in a future action.', 'Activity', '2026-01-16 05:28:23.429749', '2026-02-10 10:50:00.145013-08', NULL, 500, NULL, 63, 15, true, false, false, 19, 0, 4, false, false, false, NULL, NULL, '{}', 65, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (11, 'Sign your membership contract', 'meta', '', 'The reliability of members allows us to make effective plans. This action requests an initial commitment from new members.', 'The reliability of members allows us to make effective plans.', 'Activity', '2025-09-07 21:49:19.675966', '2026-02-10 10:50:00.241792-08', NULL, 500, NULL, 6, 2, true, true, false, 1, 10, 3, false, false, false, NULL, NULL, '{}', 102, false, 'public', false, true, true, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (48, 'Plan for next week’s pothole-related task', 'poverty', NULL, 'The action due on November 24th is to "Report a pothole in your community." To learn about the benefits of reporting potholes, refer to [the description of that action](https://worldalliance.org/actions/50).

Since that task requires going outside, members are asked to plan for how they are going to complete that task.', 'This action is to ensure members can successfully complete next week’s task.', 'Activity', '2025-11-11 01:22:27.510393', '2026-02-10 10:50:00.250368-08', NULL, 500, NULL, 42, 5, true, false, false, 6, 1, 6, true, false, false, 'https://worldalliance.org/api/images/1765921963882.webp', 'A pothole reported by a member', '{}', 36, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (71, 'Contribute to a discussion about Alliance culture', '', NULL, 'The culture of the Alliance is ultimately up to members to create and uphold. An explicit, Alliance-wide discussion will help us develop our culture intentionally and collectively, rather than randomly and in isolation.

The relevant forum post is located at this link: https://worldalliance.org/forum/post/16', 'In order to work effectively, the Alliance will need to establish a constructive culture.', 'Activity', '2026-01-28 21:47:17.459791', '2026-02-10 10:50:00.259598-08', NULL, 500, NULL, 64, 15, true, false, false, 20, 0, 4, false, false, false, NULL, NULL, '{}', 59, false, 'all_members', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (46, 'Suggest a problem that could be addressed by a future Alliance action', 'meta', NULL, 'The strategic office intends to develop a process by which members can contribute to Alliance action planning.

To inform the design of this process, the office is asking members to give an example of a problem that the Alliance could address. The goal is to understand the range of members’ ideas before deciding how much direction or structure to provide.

Until we have a formal process, please email [mark@worldalliance.org](mailto:mark@worldalliance.org) with any suggested actions.', 'Suggestions will inform a process by which members can contribute to action planning.', 'Activity', '2025-11-02 23:38:42.15678', '2026-02-10 10:50:00.268836-08', NULL, 500, NULL, 41, 8, true, false, false, 5, 0, 6, false, false, false, NULL, NULL, '{}', 37, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (62, 'Ask experts questions about the recent US withdrawal from international institutions', 'environment, poverty, democracy, technology', NULL, 'Engaging with experts will help members better understand the past and future of international cooperation. We are hosting this discussion in light of the United States’ recent decision to withdraw from 66 international institutions, including the United Nations Framework Convention on Climate Change (UNFCCC) and Intergovernmental Panel on Climate Change (IPCC).

**Forum post where the discussion will occur: [https://worldalliance.org/forum/post/15](https://worldalliance.org/forum/post/15).**', 'Engaging with experts will help members better understand the past and future of international cooperation.', 'Activity', '2026-01-13 22:16:51.81739', '2026-02-10 10:50:00.276968-08', NULL, 500, NULL, 55, 10, true, true, false, 16, 3, 4, false, false, false, NULL, NULL, '{}', 25, false, 'all_members', true, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (12, 'Get to know the platform', 'meta', '', 'You are now on an **action page**. An action page contains all relevant information about a particular collective action and provide updates on action progress.

This onboarding action is to help you become familiar with the platform. Below is what you should know:

### Platform organization
The platform is organized into 5 main pages. You can get to any of them by using the navigation bar at the top of every page.
1.  **Tasks** is where you will see all tasks you need to complete.
2. **Activity** is where you can see, upvote, and comment on other members'' activity.
3. **Actions** is where you can view the full list of actions the Alliance has taken.
4. **Forum**  is used for discussions and questions.
5. **Priorities** contains updates on our status and our progress on key issues.

### Action stages
Actions can enter 5 different stages. Since this onboarding action never ends nor requires commitments, it is always in the **Members taking action** stage. See the "Stage" section on the right hand side of this page.

Description of all action stages:
1. **Gathering commitments** means the office is confirming that members will participate in an action. We will only take action if every member who is needed confirms.
2. **Pending office action** means that the office is handling intermediate logistics.
3. **Members taking action** means that it is time for members to act.
4. **Pending office resolution** means that the office is handling logistics necessary to obtain final results.
5. **Resolved** means that the action has either succeeded or failed.', 'This action is to help members become familiar with the website.', 'Activity', '2025-09-08 18:37:20.473352', '2026-02-10 10:50:00.285074-08', NULL, 500, NULL, 7, 2, true, true, true, 1, 0, 2, false, false, false, NULL, NULL, '{}', 43, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (60, 'Collect e-waste for proper disposal', 'environment, poverty', NULL, 'This action asks members to collect e-waste and make a plan for its proper disposal. Next week, members will properly dispose of their e-waste. The goals of this action are to:
1. Inform members of the costs of improperly discarded e-waste.
2. Dispose of e-waste properly.

**Costs of e-waste**

Electronic waste (e-waste), such as old phones, batteries, and chargers, is usually thrown away with normal trash. A widely cited report claims that e-waste is responsible for about [70% of heavy metals in landfills](http://web.archive.org/web/20130930082652/https://infohouse.p2ric.org/ref/41/40164.htm), which subsequently leach into surrounding soil, air, and water over time or as a result of improper landfill management.

[Most e-waste ends up in landfills](https://www.cnn.com/2024/03/20/climate/electronic-waste-recycling-climate-un) in developing countries such as Ghana and Nigeria. People, including children, collect and dismantle e-waste in nearby landfills for short-term income. Toxic materials released from the e-waste causes severe health problems, including [reduced IQ, impaired lung function, and still births](https://www.greenpolicyplatform.org/sites/default/files/downloads/resource/9789240023901-eng.pdf). Continued deposition of e-waste [discourages investment](https://www.sciencedirect.com/topics/earth-and-planetary-sciences/waste-export) in longer-term, safer local industry.

**Recycling e-waste**

As of 2022, only about [22% of e-waste is properly recycled](http://web.archive.org/web/20240326015506/https://api.globalewaste.org/publications/file/297/Global-E-waste-Monitor-2024.pdf). 

Comprehensive reclamation of precious metals from e-waste would significantly reduce emissions-producing and exploitative mining activities. For instance, over 34,000 tons of cobalt [ended up in e-waste](https://www.cobaltinstitute.org/news/mining-cobalt-from-waste-capturing-lost-value-in-a-responsible-cobalt-value-chain/) in 2022, over one-sixth of the cobalt mined in the same time period.', 'Members will properly dispose of their collected e-waste the week of January 12th.', 'Activity', '2026-01-07 01:25:38.955467', '2026-02-10 10:50:00.292896-08', NULL, 500, NULL, 54, 14, true, false, false, 14, 10, 5, true, false, false, 'https://dj92mxbdjuclo.cloudfront.net/1767751266007.webp', 'E-waste in the Alliance office', '{}', 48, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (74, 'Consider inviting new members to the Alliance', 'meta', NULL, 'This action is the first “growth action”, an action that asks members to consider inviting people to the Alliance.

Our current goal is to **grow to at least 110 members** from our current [79 members](https://worldalliance.org/members) (a ~40% increase in size). At this size, we will be able to test new group and invite processes, as well as run actions that involve more external coordination.

Members’ invitations in this action will:

1. Help us reach our next stage of growth.
2. Help us assess whether members can reliably bring in another member—and, therefore, whether the Alliance can grow when it needs to grow.', 'Growth actions will help the Alliance reach its next stage of growth.', 'Activity', '2026-02-04 23:16:04.520366', '2026-02-10 10:50:00.300137-08', NULL, 500, NULL, 67, 10, true, false, false, 21, 0, 5, false, false, false, '', NULL, '{}', 23, false, 'all_members', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (73, 'Read about Alliance growth plans', 'meta', NULL, 'In this action, members will read about our plans for growth.

Our current goal is to **grow to at least 110 members** from our current [79 members](https://worldalliance.org/members) (a ~40% increase in size). At this size, we will be able to test new group and invite processes, as well as run actions that involve more external coordination.

So far, the office has asked specific people to become group leads, and group leads have invited members on an ad hoc basis. **Now, anyone can become a group lead, and anyone can invite new members.**', 'We plan to grow in stages in preparation for a public launch.', 'Activity', '2026-02-04 23:00:05.823444', '2026-02-10 10:50:00.317368-08', NULL, 500, NULL, 66, 5, true, false, false, 21, 1, 5, false, false, false, NULL, NULL, '{}', 40, false, 'all_members', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (51, 'Provide feedback to the office', 'Meta', NULL, 'The office periodically requests feedback from members to improve its platform, processes, and actions. 

In addition to general feedback, Alliance governance requires that members participate in a simple oversight process after “3 months have passed and 10 tasks have been completed by Alliance members” since the last oversight process.

Additional information about Alliance governance can be found [here](https://worldalliance.org/governance).', 'Periodic feedback from members helps the Alliance improve and is required for its governance.', 'Activity', '2025-11-20 18:42:24.431', '2026-02-10 10:50:00.309956-08', NULL, 500, NULL, 45, 15, true, false, false, 8, 0, 6, true, false, false, NULL, NULL, '{}', 35, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (64, 'Properly dispose of the e-waste you collected', 'environment', NULL, 'Last week, members collected e-waste and planned for its proper disposal. This week, members will properly dispose of their e-waste. The goals of these actions are to: 
1. Inform members of the costs of improperly discarded e-waste.
2. Dispose of e-waste properly.

Members collected a total 57 kg (126 lbs) of e-waste last week.

Information about e-waste and the consequences of improper disposal can be found in the description of [Collect e-waste for proper disposal](https://worldalliance.org/actions/60).

', 'Proper disposal of e-waste will prevent it from ending up in landfills.', 'Activity', '2026-01-13 23:41:36.421262', '2026-02-10 10:50:00.323571-08', NULL, 500, NULL, 57, 15, true, false, false, 17, -1, 3, true, true, false, 'https://dj92mxbdjuclo.cloudfront.net/1768347427200.webp', 'Member e-waste', '{12,64,10,7,33,20,66,98,48,55,41,28,94,44,42,88,70,21,68,96,84,31,29,24,17}', 21, false, 'all_members', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (13, 'Participate in a discussion about potential habit changes', 'meta', '', 'We are planning a series of near-term collective actions. Once we reach 100 members, we would like to run an action in which all members adopt the same habit change for a two-week period to achieve measurable real-world impact, such as waste reduction. The goal is to explore whether members are more motivated to make habit changes for impact when others do the same.

To help plan this action, we are asking members to suggest small, manageable habit changes that could be trialed by the group.

The discussion is hosted at this link (not in the comments below): [https://worldalliance.org/forum/post/6](https://worldalliance.org/forum/post/6).', 'This discussion is about small habit changes that would be impactful with 100 members.', 'Activity', '2025-09-16 23:45:31.914519', '2026-02-10 10:50:00.32983-08', NULL, 500, NULL, 8, 5, true, false, false, 1, 0, 2, true, false, false, NULL, NULL, '{}', 33, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (32, 'Answer questions about nonprofit website copy and design', 'poverty', NULL, 'Tech-savvy corporations regularly experiment with their website copy and design. Most nonprofits lack the resources to do such experimentation, even though simple changes can significantly increase donations. For example, GiveDirectly’s experiments with their website design resulted in a [34% increase in the chance](https://www.givedirectly.org/fundraising-experiments/) that a website visitor would donate.

In the future, the office’s ability to easily obtain feedback from members could help many nonprofits gather the data they need to improve their donation conversion rates. To test this idea at a small scale, the office has designed a series of questions that may help three nonprofits improve their websites.

After members answer the questions, the office will deliver summarized and anonymized recommendations to each nonprofit.

Sources for quotes from GiveDirectly recipients: [Victor in Kenya](https://www.givedirectly.org/cameras-2021/) (caption of Jediadah’s 9th photo), [Zawadi in Kenya](https://live.givedirectly.org/profile/9e0cf58f-a3f4-4c46-b163-2e2f5b17b75e?s=support%20allowed%20me%20to%20take%20my%20daughter%2C%20who%20was%20in%20critical%20condition%2C%20to%20the%20hospital%20and%20save%20her%20life&p=1), [Lonely in Malawi](https://live.givedirectly.org/profile/0197e658-15b1-708e-90da-2fd24b03fb99?s=school&p=2), [Naomi in Kenya](https://live.givedirectly.org/profile/019850ed-526a-7073-bebe-3a0e37c8318e?s=life&p=2), and [Sabastian in Kenya](https://live.givedirectly.org/profile/9e0cc024-3815-47fa-accd-e43fac7345ac?s=explained%20so%20well&p=1).', 'This action is to test if website feedback is useful to nonprofits and to establish initial contact with potential future partners.', 'Activity', '2025-10-24 20:10:34.251125', '2026-02-10 10:50:00.335968-08', NULL, 500, NULL, 26, 12, true, false, false, 4, 0, 6, true, false, false, NULL, NULL, '{}', 30, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (52, 'Participate in an experiment to measure awareness of AI data use practices', 'technology', NULL, 'Artificial intelligence (AI) services, such as ChatGPT, have the potential to leak users’ personal information as a result of model training processes.

For instance, a user’s chats with an AI may be used to train a future AI model. The model could memorize the data and, once released, [surface it to another user](https://arxiv.org/abs/2310.15469). Companies do not offer methods of erasing information from the “memories” of their AI models. Therefore, once the model has been trained and released to the public, the user has very little control over any data they knowingly or unknowingly contributed.

Companies sometimes offer settings that allow users to control how their data is used. However, users are often opted into sharing their data for training and other purposes by default.

Two-in-three Americans claim to possess ["little to no understanding"](https://www.pewresearch.org/internet/2023/10/18/how-americans-view-data-privacy/) of how their data is used by digital services. When application developers are required to request permission to track their users proactively, a [large majority of users](https://www.flurry.com/blog/att-opt-in-rate-monthly-updates/) deny them.

Few studies exist on the impact of opt-in vs. opt-out policies that address AI privacy concerns.

This action will measure members’ awareness of and inclination to change major AI services’ privacy settings. If the responses suggest that opt-in policies would better serve users than an opt-out policy, we will use the data to kick-start a follow-up campaign that:

1. Helps members’ friends and family take steps to protect their privacy.
2. Pushes the media to promote the adoption of AI data use opt-in policies.', 'Results will inform a follow-up AI data use campaign. ', 'Activity', '2025-12-02 03:45:31.688534', '2026-02-10 10:50:00.34581-08', NULL, 500, NULL, 46, 10, true, false, false, 9, 0, 6, true, false, false, NULL, NULL, '{}', 35, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (14, 'Sign a letter requesting news coverage of a bring-your-own-cup cafe coalition', 'environment', NULL, 'Relevant background:
- 50 billion disposable cups are [thrown away yearly](https://www.nature.com/articles/d41586-023-03562-w) in the US.
- To reduce waste, many cafes allow customers to bring their own reusable cups from home.
- [Research suggests](https://www.sciencedirect.com/science/article/pii/S0969698922000017) that education about disposable cup waste is more effective than discounts at causing customers to bring their own cups. 

What the office did:
- The office assembled a coalition of 5 cafes with 12 total locations. They agreed to encourage customers to bring their own cups by posting flyers with information about the impact of disposable cup waste.
- The materials and participating cafes can be found at [https://byoc.cafe](https://byoc.cafe).
- To encourage cafes to join, the office told them that Alliance members would co-sign a letter asking local news outlets to write about the coalition.

Next steps:
- After members sign the letter, the office will send it off to local journalists.
- Ideally, a journalist will agree to write about the cafes.
- The office will send the article to the cafes.
- If this initiative succeeds, the office will use it as an example when it requests that businesses make similar policy changes in the future.

```imgcap
1759964091349.webp
Farmers Union Coffee Roasters in Eugene, WA
```

```imgcap
1759964078852.webp
FIT BAR Superfood Cafe in Seattle, WA
```', 'This action is to test whether promised media outreach can prompt businesses to take action.', 'Activity', '2025-09-23 21:09:04.173612', '2026-02-10 10:50:00.352131-08', NULL, 500, NULL, 10, 4, true, false, false, 2, 0, 6, true, false, false, 'https://worldalliance.org/api/images/1765912025673.webp', 'A cafe team took this photo for the article', '{}', 33, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (47, 'Decide how to allocate $1,000 next week', 'meta', NULL, 'In order to run smoothly, the Alliance will require that members can quickly reach agreements about how to act.

To test a process for reaching agreement in a low-stakes setting, the office has solicited $1,000 from a donor, which we will determine how to spend together. This week, we will collect proposals and decide on a voting system. Next week, we will vote on proposals.

Below is the commitment provided by the donor:

> I, Lukas Finnveden, commit to donate $1,000 to the cause selected by Alliance member consensus via a process designed by the Alliance office, as long as I am legally able to do so and I do not believe the donation to be against humanity’s best interests.', 'This action asks members to consider different voting methods and solicits proposals for donations.', 'Activity', '2025-11-02 23:39:36.519875', '2026-02-10 10:50:00.358579-08', NULL, 500, NULL, 40, 7, true, false, false, 5, 1, 6, true, false, false, NULL, NULL, '{}', 38, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (75, 'Test current action', '', NULL, '', 'This is an action that will show in the tasks page for CI testing.', 'Activity', '2026-02-10 18:39:53.77735', '2026-02-10 10:50:00.365157-08', NULL, 500, NULL, 68, 0, true, false, false, NULL, 0, 5, false, false, false, NULL, NULL, '{}', 0, false, 'all_members', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (56, 'Invite friends and family to fill out our AI privacy survey', 'technology', NULL, 'Two weeks ago, members completed a survey designed to measure awareness of AI data use practices. The survey revealed that:
1. Most members were uncomfortable with their data being used to train AI.
2. Most members were unaware of settings that allowed them to control whether their data was used to train AI.

ChatGPT was the most-used platform among members, with 28 of 34 respondents using the service; 19 of those 28 respondents would prefer not to have models trained on their conversations. However, only half of those respondents had already switched off the relevant setting. 

We expect members’ friends and family members to have similar privacy preferences. Having friends and family fill out the same survey that members completed [two weeks ago](https://worldalliance.org/actions/52) will:
1. Help members’ friends and family control their data.
2. Bolster our planned follow-up campaign with additional evidence. We plan to share our data with relevant researchers, journalists, non-profits, and contacts at OpenAI and Google.', 'Additional data will help us conduct a follow-up awareness campaign.', 'Activity', '2025-12-15 22:02:16.399669', '2026-02-10 10:50:00.384-08', NULL, 500, NULL, 50, 12, true, false, false, 11, 2, 5, false, false, false, 'https://worldalliance.org/api/images/1765910145202.webp', 'A survey flyer that a member displayed in their community', '{}', 42, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (53, 'Prepare to submit a public comment to your local government', 'democracy', NULL, 'Local government is an important and relatively low-profile vehicle for societal change. In the United States, local governments controlled [$1.9 trillion](https://www.urban.org/policy-centers/cross-center-initiatives/state-and-local-finance-initiative/state-and-local-backgrounders/state-and-local-expenditures) in 2021. For context, state spending amounted to about [$1.8 trillion](https://www.urban.org/policy-centers/cross-center-initiatives/state-and-local-finance-initiative/state-and-local-backgrounders/state-and-local-expenditures) while federal spending was [$6.8 trillion](https://www.cbo.gov/publication/58268) during the same time period.

Research suggests the preferences of public commenters correlate with [local lawmakers’ votes](https://onlinelibrary.wiley.com/doi/abs/10.1111/ajps.12900). Research also suggests that [high-quality public comments](https://regulatorystudies.columbian.gwu.edu/quality-not-quantity-key-effective-commenting) can have disproportionate influence. 

The office has planned a series of actions to help each member produce a high-quality public comment that could influence local policy and to help members connect local issues to the Alliance’s priorities:

* **This week, members will identify and research issues of concern in their municipality.**
* Then, the office will develop recommendations for each member''s comment - for instance, by identifying policies that address their issue of concern.
* Then, members will use the office''s personalized recommendations to write and submit public comments and discuss their chosen issues with other members.
* Finally, the office will analyze meeting minutes for members’ municipalities to determine inclusion of members’ comments in meeting agendas.', 'Members will use this week''s research to submit a public comment the week of December 29th.', 'Activity', '2025-12-08 23:07:52.414405', '2026-02-10 10:50:00.371565-08', NULL, 500, NULL, 47, 15, true, false, false, 10, 3, 6, false, false, false, NULL, NULL, '{}', 38, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (49, 'Approve proposals for how to spend $1,000', 'meta', NULL, 'We are testing a process for reaching agreement in a low-stakes setting. Last week, members submitted proposals and decided on a voting process. Information about last week’s action can be found at this link: [Decide how to allocate $1,000 next week](https://worldalliance.org/actions/47).

The results of last week’s vote:

* Members who voted for “Top 5” (23 votes) mostly did so because they wanted to guarantee that the $1,000 was spent.
* Members who voted for “75% approval” (15 votes) mostly did so because they wanted a strong chance that the $1,000 would be spent, but would still satisfy a majority of members.
* No members voted for “100% approval.” Many members indicated they believed that we should prioritize taking action over full consensus.

This week, members will indicate their approval of each of the 15 proposals the office has curated. After, the office will pick a winning proposal from the top 5 proposals and spend the money.

**Details on update calculations:**

We allocated $600 to Cool Earth to offset a year of CO2 emissions for all current Alliance members.
1. A [2016 report](https://www.givingwhatwecan.org/reports/cool-earth) by Giving What We Can estimates that a $1 donation to Cool Earth can offset 1 ton of CO2.
2. The average US resident produces around [15 tons](https://climate.mit.edu/ask-mit/how-much-ton-carbon-dioxide) of CO2 per year.
3. There are 40 Alliance members.

40 members x 15 tons CO2/member x $1/ton CO2 ≈ $600.

We allocated $400 to GiveDirectly to cover about 5 months of expenditure for a single household in Kenya, Malawi, Mozambique, Rwanda, or Uganda.
1. GiveDirectly’s direct cash transfer program gives each household in a village about $1,000.
2. $1,000 USD is about 12 months'' expenditure for the average household in poverty in the countries where GiveDirectly works. See, for instance, Chapter 6 of [Uganda National Household Survey 2019/2020](https://www.ubos.org/wp-content/uploads/publications/09_2021Uganda-National-Survey-Report-2019-2020.pdf).

5 months x $1,000/12 months ≈ $400', 'The office will pick a final winner from the 5 proposals with the highest approval.', 'Activity', '2025-11-11 02:06:15.383204', '2026-02-10 10:50:00.377794-08', NULL, 500, NULL, 43, 5, true, false, false, 6, 2, 6, true, false, false, NULL, NULL, '{}', 37, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (54, 'Submit a public comment to your local government', 'democracy', NULL, 'Local government is an important and relatively low-profile vehicle for societal change. In the United States, local governments controlled [$1.9 trillion](https://www.urban.org/policy-centers/cross-center-initiatives/state-and-local-finance-initiative/state-and-local-backgrounders/state-and-local-expenditures) in 2021. For context, state spending amounted to about [$1.8 trillion](https://www.urban.org/policy-centers/cross-center-initiatives/state-and-local-finance-initiative/state-and-local-backgrounders/state-and-local-expenditures) while federal spending was [$6.8 trillion](https://www.cbo.gov/publication/58268) during the same time period.

Public comments, often submitted via email or online forms, allow citizens to provide direct input to governments. These comments are often integrated into public meeting agendas (such as city council meetings or zoning board meetings) to help governments understand public sentiment. Recent research analyzing more than 20 years of public comment data from San Francisco determined the preferences of public commenters correlate with [local lawmakers’ votes](https://onlinelibrary.wiley.com/doi/abs/10.1111/ajps.12900).

The same study also found the demographics of public commenters to be unrepresentative of the public at large along key demographic lines. By nature of its commitment-based membership model, the Alliance has the opportunity to reduce the disproportionate influence of vocal minorities on public comments.

[A few weeks ago](https://worldalliance.org/actions/53), members researched an issue or pending policy in their communities. Now, members will submit a comment on that issue and discuss their chosen issue with other members.

Going forward, the office will track the meeting minutes of members’ municipalities to determine whether or not our comments were addressed publicly.', 'Local governments may respond to high-quality public comments that advance Alliance priorities.', 'Activity', '2025-12-08 23:31:26.321475', '2026-02-10 10:50:00.389813-08', NULL, 500, NULL, 51, 15, true, false, false, 12, -1, 5, false, true, false, NULL, NULL, '{7,10,11,12,15,17,19,20,21,23,24,26,29,31,35,36,38,42,44,49,51,54,55,62,64,67,68,71,72,76,77,79,80,82,83,86}', 27, true, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);
INSERT INTO public.action VALUES (26, 'Read and discuss an article about global inequality', 'poverty', NULL, 'In the near future, we will take actions related to poverty relief. 

To establish relevant background information, we will read and discuss [Global inequality is huge](https://ourworldindata.org/global-inequality-opportunity-to-give). This article gives important figures about global income inequality and describes possible interventions, some of which the Alliance may support in the future.

The discussion is hosted at this link (not in the comments below): [https://worldalliance.org/forum/post/9](https://worldalliance.org/forum/post/9)', 'This action is to introduce members to high-level statistics about global inequality and to establish shared knowledge for future actions.', 'Activity', '2025-10-14 17:54:18.057466', '2026-02-10 10:50:00.395963-08', NULL, 500, NULL, 22, 15, true, false, false, 3, 0, 6, false, false, false, NULL, NULL, '{}', 29, false, 'public', false, false, false, false, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: action_activity; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_activity VALUES (679, 11, 10, '2025-10-18 01:08:00', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (678, 10, 10, '2025-10-18 01:08:00', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (677, 9, 10, '2025-10-18 01:08:00', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (676, 11, 7, '2025-10-18 01:07:00', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (675, 10, 7, '2025-10-18 01:07:00', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (674, 9, 7, '2025-10-18 01:07:00', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (681, 26, 15, '2025-10-18 03:53:00', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (687, 13, 10, '2025-10-18 04:35:00', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (686, 12, 10, '2025-10-18 04:35:00', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (685, 13, 7, '2025-10-18 04:35:00', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (201, 12, 7, '2025-09-29 21:42:56.229715', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 1, 'user');
INSERT INTO public.action_activity VALUES (660, 10, 11, '2025-10-18 01:01:00', NULL, NULL, 'user_completed', NULL, NULL, NULL, NULL, NULL, 1, 'user');
INSERT INTO public.action_activity VALUES (1108, 60, 11, '2026-01-12 22:08:39.732591', NULL, NULL, 'user_dismissed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (1220, 66, 24, '2026-01-15 02:03:20.184639', NULL, NULL, 'user_dismissed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (1222, 66, 11, '2026-01-15 03:14:23.079835', NULL, NULL, 'user_dismissed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (1219, 62, 24, '2026-01-15 02:03:18.43767', NULL, NULL, 'user_dismissed', NULL, NULL, NULL, NULL, NULL, 0, 'user');
INSERT INTO public.action_activity VALUES (1337, 70, 15, '2026-01-27 22:26:13.060211', NULL, NULL, 'user_dismissed', NULL, NULL, NULL, NULL, NULL, 0, 'user');


--
-- Data for Name: action_activity_comment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: action_activity_comment_likes_user; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: action_activity_likes_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_activity_likes_user VALUES (201, 10);
INSERT INTO public.action_activity_likes_user VALUES (660, 7);


--
-- Data for Name: action_authors_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_authors_user VALUES (14, 10);
INSERT INTO public.action_authors_user VALUES (14, 7);
INSERT INTO public.action_authors_user VALUES (18, 10);
INSERT INTO public.action_authors_user VALUES (18, 7);
INSERT INTO public.action_authors_user VALUES (52, 10);
INSERT INTO public.action_authors_user VALUES (52, 7);
INSERT INTO public.action_authors_user VALUES (52, 24);
INSERT INTO public.action_authors_user VALUES (54, 10);
INSERT INTO public.action_authors_user VALUES (54, 7);
INSERT INTO public.action_authors_user VALUES (54, 24);
INSERT INTO public.action_authors_user VALUES (53, 10);
INSERT INTO public.action_authors_user VALUES (53, 7);
INSERT INTO public.action_authors_user VALUES (53, 24);
INSERT INTO public.action_authors_user VALUES (51, 10);
INSERT INTO public.action_authors_user VALUES (51, 7);
INSERT INTO public.action_authors_user VALUES (51, 24);
INSERT INTO public.action_authors_user VALUES (50, 10);
INSERT INTO public.action_authors_user VALUES (50, 7);
INSERT INTO public.action_authors_user VALUES (50, 24);
INSERT INTO public.action_authors_user VALUES (48, 10);
INSERT INTO public.action_authors_user VALUES (48, 7);
INSERT INTO public.action_authors_user VALUES (48, 24);
INSERT INTO public.action_authors_user VALUES (49, 10);
INSERT INTO public.action_authors_user VALUES (49, 7);
INSERT INTO public.action_authors_user VALUES (47, 10);
INSERT INTO public.action_authors_user VALUES (47, 7);
INSERT INTO public.action_authors_user VALUES (32, 10);
INSERT INTO public.action_authors_user VALUES (32, 7);
INSERT INTO public.action_authors_user VALUES (34, 10);
INSERT INTO public.action_authors_user VALUES (34, 7);
INSERT INTO public.action_authors_user VALUES (26, 10);
INSERT INTO public.action_authors_user VALUES (26, 7);
INSERT INTO public.action_authors_user VALUES (13, 10);
INSERT INTO public.action_authors_user VALUES (13, 7);
INSERT INTO public.action_authors_user VALUES (11, 10);
INSERT INTO public.action_authors_user VALUES (11, 7);
INSERT INTO public.action_authors_user VALUES (10, 10);
INSERT INTO public.action_authors_user VALUES (10, 7);
INSERT INTO public.action_authors_user VALUES (9, 10);
INSERT INTO public.action_authors_user VALUES (9, 7);
INSERT INTO public.action_authors_user VALUES (56, 10);
INSERT INTO public.action_authors_user VALUES (56, 7);
INSERT INTO public.action_authors_user VALUES (56, 24);
INSERT INTO public.action_authors_user VALUES (55, 10);
INSERT INTO public.action_authors_user VALUES (55, 7);
INSERT INTO public.action_authors_user VALUES (57, 10);
INSERT INTO public.action_authors_user VALUES (57, 7);
INSERT INTO public.action_authors_user VALUES (57, 24);
INSERT INTO public.action_authors_user VALUES (58, 10);
INSERT INTO public.action_authors_user VALUES (58, 7);
INSERT INTO public.action_authors_user VALUES (59, 7);
INSERT INTO public.action_authors_user VALUES (59, 10);
INSERT INTO public.action_authors_user VALUES (60, 7);
INSERT INTO public.action_authors_user VALUES (60, 24);
INSERT INTO public.action_authors_user VALUES (60, 10);
INSERT INTO public.action_authors_user VALUES (60, 23);
INSERT INTO public.action_authors_user VALUES (62, 23);
INSERT INTO public.action_authors_user VALUES (62, 10);
INSERT INTO public.action_authors_user VALUES (62, 7);
INSERT INTO public.action_authors_user VALUES (64, 23);
INSERT INTO public.action_authors_user VALUES (64, 10);
INSERT INTO public.action_authors_user VALUES (64, 24);
INSERT INTO public.action_authors_user VALUES (64, 7);
INSERT INTO public.action_authors_user VALUES (66, 23);
INSERT INTO public.action_authors_user VALUES (66, 10);
INSERT INTO public.action_authors_user VALUES (66, 7);
INSERT INTO public.action_authors_user VALUES (70, 23);
INSERT INTO public.action_authors_user VALUES (70, 10);
INSERT INTO public.action_authors_user VALUES (70, 7);
INSERT INTO public.action_authors_user VALUES (71, 10);
INSERT INTO public.action_authors_user VALUES (71, 7);
INSERT INTO public.action_authors_user VALUES (72, 10);
INSERT INTO public.action_authors_user VALUES (72, 7);
INSERT INTO public.action_authors_user VALUES (73, 10);
INSERT INTO public.action_authors_user VALUES (73, 7);
INSERT INTO public.action_authors_user VALUES (74, 10);
INSERT INTO public.action_authors_user VALUES (74, 7);


--
-- Data for Name: action_event; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_event VALUES (38, 'Action completed', '', '2025-10-13 17:58:51.004-07', '2025-10-13 17:58:51.180255-07', 13, 'completed', false);
INSERT INTO public.action_event VALUES (34, 'Members taking action', '', '2025-10-08 19:47:01.263-07', '2025-10-14 19:46:00.24288-07', 14, 'member_action', false);
INSERT INTO public.action_event VALUES (14, 'Members taking action', '', '2025-08-29 14:17:15.49-07', '2025-08-29 14:18:00.26812-07', 9, 'member_action', false);
INSERT INTO public.action_event VALUES (36, 'Members taking action', '', '2025-10-08 19:47:16.526-07', '2025-10-15 18:41:00.039066-07', 18, 'member_action', false);
INSERT INTO public.action_event VALUES (18, 'Members taking action', '', '2025-08-15 11:37:00-07', '2025-09-08 11:38:07.368967-07', 12, 'member_action', false);
INSERT INTO public.action_event VALUES (16, 'Members taking action', '', '2025-08-25 12:38:00-07', '2025-08-31 12:39:00.139087-07', 10, 'member_action', false);
INSERT INTO public.action_event VALUES (19, 'Members taking action', '', '2025-09-16 17:37:59.039-07', '2025-09-16 17:37:59.175502-07', 13, 'member_action', false);
INSERT INTO public.action_event VALUES (35, 'Pending office action', '', '2025-10-15 21:00:00-07', '2025-10-08 19:47:01.866327-07', 14, 'office_action', false);
INSERT INTO public.action_event VALUES (37, 'Pending office action', '', '2025-10-15 21:00:00-07', '2025-10-08 19:47:16.777661-07', 18, 'office_action', false);
INSERT INTO public.action_event VALUES (88, 'Pending office action', '', '2025-11-17 23:59:00-08', '2025-11-10 19:23:35.940843-08', 49, 'office_action', true);
INSERT INTO public.action_event VALUES (45, 'Pending office action', '', '2025-10-23 23:59:00-07', '2025-10-15 12:59:07.130856-07', 26, 'office_action', false);
INSERT INTO public.action_event VALUES (44, 'Members taking action', '', '2025-10-16 20:00:00-07', '2025-10-24 00:00:00.335301-07', 26, 'member_action', false);
INSERT INTO public.action_event VALUES (92, 'Action completed', '', '2025-11-18 09:41:27.244-08', '2025-11-18 09:41:27.335801-08', 18, 'completed', false);
INSERT INTO public.action_event VALUES (93, 'Action completed', '', '2025-11-18 09:41:36.705-08', '2025-11-18 09:41:36.796448-08', 34, 'completed', false);
INSERT INTO public.action_event VALUES (94, 'Action completed', '', '2025-11-18 09:41:49.124-08', '2025-11-18 09:41:49.197525-08', 26, 'completed', false);
INSERT INTO public.action_event VALUES (90, 'Action completed', 'This action is no longer part of onboarding.', '2025-11-11 13:47:15.699-08', '2025-11-11 13:47:15.847839-08', 12, 'completed', false);
INSERT INTO public.action_event VALUES (62, 'Pending office action', '', '2025-11-01 23:59:00-07', '2025-10-25 18:00:04.162988-07', 32, 'office_action', false);
INSERT INTO public.action_event VALUES (87, 'Action completed', '', '2025-11-17 23:59:00-08', '2025-11-10 19:23:35.921164-08', 48, 'completed', true);
INSERT INTO public.action_event VALUES (60, 'Pending office action', '', '2025-11-01 23:59:00-07', '2025-10-25 17:59:42.378547-07', 34, 'office_action', false);
INSERT INTO public.action_event VALUES (17, 'Members taking action', '', '2025-08-14 21:51:00-07', '2025-09-07 14:52:00.030658-07', 11, 'member_action', false);
INSERT INTO public.action_event VALUES (61, 'Members taking action', '', '2025-10-25 18:00:03.79-07', '2025-11-02 00:00:00.304447-07', 32, 'member_action', false);
INSERT INTO public.action_event VALUES (59, 'Members taking action', '', '2025-10-25 17:59:00-07', '2025-11-02 00:00:00.304447-07', 34, 'member_action', false);
INSERT INTO public.action_event VALUES (71, 'Members taking action', '', '2025-11-02 17:00:00-08', '2025-11-02 16:42:50.107305-08', 47, 'member_action', true);
INSERT INTO public.action_event VALUES (72, 'Members taking action', '', '2025-11-02 17:00:00-08', '2025-11-02 16:42:50.12498-08', 46, 'member_action', true);
INSERT INTO public.action_event VALUES (73, 'Pending office action', '', '2025-11-09 23:59:00-08', '2025-11-02 16:42:50.30198-08', 47, 'office_action', true);
INSERT INTO public.action_event VALUES (74, 'Pending office action', '', '2025-11-09 23:59:00-08', '2025-11-02 16:42:50.305652-08', 46, 'office_action', true);
INSERT INTO public.action_event VALUES (80, 'Pending office action', '', '2025-11-24 23:59:00-08', '2025-11-10 19:21:36.381852-08', 50, 'office_action', true);
INSERT INTO public.action_event VALUES (85, 'Members taking action', '', '2025-11-10 19:23:35.706-08', '2025-11-10 19:23:35.796959-08', 48, 'member_action', true);
INSERT INTO public.action_event VALUES (86, 'Members taking action', '', '2025-11-10 19:23:35.706-08', '2025-11-10 19:23:35.82936-08', 49, 'member_action', true);
INSERT INTO public.action_event VALUES (96, 'Action completed', '', '2025-11-23 13:53:37.817-08', '2025-11-23 13:53:37.937062-08', 49, 'completed', false);
INSERT INTO public.action_event VALUES (95, 'Action completed', '', '2025-11-11 13:52:00-08', '2025-11-23 13:52:32.954619-08', 47, 'completed', false);
INSERT INTO public.action_event VALUES (99, 'Members taking action', '', '2025-11-24 18:01:20.138-08', '2025-11-24 18:01:20.23403-08', 51, 'member_action', true);
INSERT INTO public.action_event VALUES (100, 'Pending office action', '', '2025-12-01 23:59:00-08', '2025-11-24 18:01:20.324957-08', 51, 'office_action', true);
INSERT INTO public.action_event VALUES (79, 'Members taking action', '', '2025-11-10 19:24:00-08', '2025-11-10 19:21:36.26217-08', 50, 'member_action', true);
INSERT INTO public.action_event VALUES (101, 'Action completed', '', '2025-11-26 11:42:14.711-08', '2025-11-26 11:42:14.820345-08', 50, 'completed', false);
INSERT INTO public.action_event VALUES (104, 'Members taking action', '', '2025-12-01 20:38:27.932-08', '2025-12-01 20:38:28.034392-08', 52, 'member_action', true);
INSERT INTO public.action_event VALUES (105, 'Pending office action', '', '2025-12-08 23:59:00-08', '2025-12-01 20:38:28.114913-08', 52, 'office_action', true);
INSERT INTO public.action_event VALUES (106, 'Action completed', '', '2025-12-03 09:56:59.361-08', '2025-12-03 09:56:59.488053-08', 51, 'completed', false);
INSERT INTO public.action_event VALUES (107, 'Action completed', '', '2025-12-08 15:47:31.419-08', '2025-12-08 15:47:31.506165-08', 14, 'completed', false);
INSERT INTO public.action_event VALUES (110, 'Members taking action', '', '2025-12-08 18:20:00.317-08', '2025-12-08 18:20:00.488752-08', 53, 'member_action', true);
INSERT INTO public.action_event VALUES (113, 'Planned', '', '2025-12-08 18:24:05.755-08', '2025-12-08 18:24:05.835751-08', 54, 'planned', false);
INSERT INTO public.action_event VALUES (115, 'Action completed', '', '2025-12-09 11:33:32.158-08', '2025-12-09 11:33:32.252512-08', 32, 'completed', false);
INSERT INTO public.action_event VALUES (116, 'Members taking action', '', '2025-12-10 16:51:52.037-08', '2025-12-10 16:51:52.160931-08', 55, 'member_action', false);
INSERT INTO public.action_event VALUES (117, 'Members taking action', '', '2025-12-15 21:18:55.592-08', '2025-12-15 21:18:55.713811-08', 57, 'member_action', true);
INSERT INTO public.action_event VALUES (118, 'Members taking action', '', '2025-12-15 21:18:55.592-08', '2025-12-15 21:18:55.776407-08', 56, 'member_action', true);
INSERT INTO public.action_event VALUES (120, 'Pending office action', '', '2025-12-22 23:59:00-08', '2025-12-15 21:18:55.928049-08', 56, 'office_action', true);
INSERT INTO public.action_event VALUES (121, 'Action completed', '', '2025-12-15 21:24:36.069-08', '2025-12-15 21:24:36.173676-08', 52, 'completed', false);
INSERT INTO public.action_event VALUES (155, 'Members taking action', '', '2026-01-28 19:00:00-08', '2026-01-28 18:03:26.30826-08', 71, 'member_action', true);
INSERT INTO public.action_event VALUES (122, 'Members taking action', '', '2025-12-29 21:00:00-08', '2025-12-24 22:09:09.427109-08', 54, 'member_action', true);
INSERT INTO public.action_event VALUES (123, 'Pending office action', '', '2026-01-05 23:59:00-08', '2025-12-24 22:09:09.54707-08', 54, 'office_action', true);
INSERT INTO public.action_event VALUES (124, 'Members taking action', '', '2025-12-29 21:00:00-08', '2025-12-24 22:13:34.014554-08', 58, 'member_action', true);
INSERT INTO public.action_event VALUES (130, 'Members taking action', '', '2026-01-06 18:56:27.948-08', '2026-01-06 18:56:28.225116-08', 59, 'member_action', true);
INSERT INTO public.action_event VALUES (131, 'Members taking action', '', '2026-01-06 18:56:27.948-08', '2026-01-06 18:56:28.257998-08', 60, 'member_action', true);
INSERT INTO public.action_event VALUES (132, 'Pending office action', '', '2026-01-13 23:59:00-08', '2026-01-06 18:56:28.355973-08', 59, 'office_action', true);
INSERT INTO public.action_event VALUES (133, 'Pending office action', '', '2026-01-13 23:59:00-08', '2026-01-06 18:56:28.384813-08', 60, 'office_action', true);
INSERT INTO public.action_event VALUES (140, 'Members taking action', '', '2026-01-13 23:59:00-08', '2026-01-13 16:41:51.664034-08', 64, 'member_action', true);
INSERT INTO public.action_event VALUES (146, 'Members taking action', '', '2026-01-13 18:42:32.618-08', '2026-01-13 18:42:32.685173-08', 62, 'member_action', true);
INSERT INTO public.action_event VALUES (147, 'Members taking action', '', '2026-01-13 18:42:32.618-08', '2026-01-13 18:42:32.732127-08', 66, 'member_action', true);
INSERT INTO public.action_event VALUES (148, 'Pending office action', '', '2026-01-20 23:59:00-08', '2026-01-13 18:42:32.826154-08', 62, 'office_action', true);
INSERT INTO public.action_event VALUES (149, 'Pending office action', '', '2026-01-20 23:59:00-08', '2026-01-13 18:42:32.859673-08', 66, 'office_action', true);
INSERT INTO public.action_event VALUES (150, 'Action completed', '', '2026-01-14 11:16:49.235-08', '2026-01-14 11:16:49.406422-08', 60, 'completed', false);
INSERT INTO public.action_event VALUES (156, 'Pending office action', '', '2026-02-04 23:59:00-08', '2026-01-28 18:03:26.437414-08', 71, 'office_action', true);
INSERT INTO public.action_event VALUES (125, 'Action completed', '', '2026-01-05 23:59:00-08', '2025-12-24 22:13:34.136747-08', 58, 'completed', true);
INSERT INTO public.action_event VALUES (157, 'Members taking action', '', '2026-02-03 12:55:54.759-08', '2026-02-03 12:55:54.859839-08', 72, 'member_action', false);
INSERT INTO public.action_event VALUES (119, 'Action completed', '', '2025-12-22 23:59:00-08', '2025-12-15 21:18:55.895461-08', 57, 'completed', true);
INSERT INTO public.action_event VALUES (111, 'Action completed', '', '2025-12-15 23:59:00-08', '2025-12-08 18:20:00.808097-08', 53, 'completed', true);
INSERT INTO public.action_event VALUES (153, 'Members taking action', '', '2026-01-21 18:00:00-08', '2026-01-21 12:49:15.572324-08', 70, 'member_action', true);
INSERT INTO public.action_event VALUES (154, 'Pending office action', '', '2026-01-28 23:59:00-08', '2026-01-21 18:01:30.072155-08', 70, 'office_action', true);
INSERT INTO public.action_event VALUES (158, 'Action completed', '', '2026-02-04 16:50:37.032-08', '2026-02-04 16:50:37.266511-08', 54, 'completed', false);
INSERT INTO public.action_event VALUES (159, 'Action completed', '', '2026-02-04 16:55:44.378-08', '2026-02-04 16:55:44.586907-08', 59, 'completed', false);
INSERT INTO public.action_event VALUES (141, 'Action completed', '', '2026-01-21 23:59:00-08', '2026-01-14 09:32:17.776606-08', 64, 'completed', true);
INSERT INTO public.action_event VALUES (162, 'Pending office action', '', '2026-02-12 23:59:00-08', '2026-02-05 19:17:51.187432-08', 73, 'office_action', true);
INSERT INTO public.action_event VALUES (163, 'Pending office action', '', '2026-02-12 23:59:00-08', '2026-02-05 19:17:51.233208-08', 74, 'office_action', true);
INSERT INTO public.action_event VALUES (160, 'Members taking action', '', '2026-02-05 19:20:00-08', '2026-02-05 19:22:14.000421-08', 73, 'member_action', true);
INSERT INTO public.action_event VALUES (161, 'Members taking action', '', '2026-02-05 19:20:00-08', '2026-02-05 19:17:51.016187-08', 74, 'member_action', true);
INSERT INTO public.action_event VALUES (164, 'Members taking action', '', '2026-02-10 10:40:19.377-08', '2026-02-10 10:40:19.396649-08', 75, 'member_action', false);
INSERT INTO public.action_event VALUES (165, 'Pending office action', '', '2026-02-17 10:40:12.412-08', '2026-02-10 10:40:19.419427-08', 75, 'office_action', false);


--
-- Data for Name: action_event_notif; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: action_manual_cohort_users_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_manual_cohort_users_user VALUES (54, 11);
INSERT INTO public.action_manual_cohort_users_user VALUES (54, 23);
INSERT INTO public.action_manual_cohort_users_user VALUES (54, 7);
INSERT INTO public.action_manual_cohort_users_user VALUES (54, 10);
INSERT INTO public.action_manual_cohort_users_user VALUES (54, 24);
INSERT INTO public.action_manual_cohort_users_user VALUES (54, 15);


--
-- Data for Name: action_participating_groups_group; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_participating_groups_group VALUES (26, 3);
INSERT INTO public.action_participating_groups_group VALUES (14, 3);
INSERT INTO public.action_participating_groups_group VALUES (18, 3);
INSERT INTO public.action_participating_groups_group VALUES (10, 3);
INSERT INTO public.action_participating_groups_group VALUES (11, 3);
INSERT INTO public.action_participating_groups_group VALUES (9, 3);
INSERT INTO public.action_participating_groups_group VALUES (12, 3);
INSERT INTO public.action_participating_groups_group VALUES (13, 3);
INSERT INTO public.action_participating_groups_group VALUES (32, 3);
INSERT INTO public.action_participating_groups_group VALUES (34, 3);
INSERT INTO public.action_participating_groups_group VALUES (47, 3);
INSERT INTO public.action_participating_groups_group VALUES (46, 3);
INSERT INTO public.action_participating_groups_group VALUES (50, 3);
INSERT INTO public.action_participating_groups_group VALUES (48, 3);
INSERT INTO public.action_participating_groups_group VALUES (49, 3);
INSERT INTO public.action_participating_groups_group VALUES (51, 3);
INSERT INTO public.action_participating_groups_group VALUES (52, 3);


--
-- Data for Name: action_participating_tags_tag; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_participating_tags_tag VALUES (26, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (14, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (18, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (10, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (11, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (9, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (12, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (13, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (32, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (34, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (47, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (46, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (50, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (48, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (49, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (51, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (52, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (53, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (54, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (55, '91ebbc8b-b416-49d2-bd70-d023acab72da');
INSERT INTO public.action_participating_tags_tag VALUES (56, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (57, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (60, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (59, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (66, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (62, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (70, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (71, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (72, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (73, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (74, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.action_participating_tags_tag VALUES (75, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');


--
-- Data for Name: action_reminder; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_reminder VALUES (11, 'Hi #{name},

You have 11.5 hours to complete your Alliance action: "Read and discuss an article about global inequality."

Please complete the action at this link: https://worldalliance.org/actions/26', 'You have 11.5 hours to complete your Alliance action: https://worldalliance.org/actions/26', '2025-10-23 12:30:00-07', '2025-10-23 12:30:10.636-07', 44, '2025-10-23 12:25:50.951358-07', '11.5 hours until action deadline', NULL, 'absolute', NULL);
INSERT INTO public.action_reminder VALUES (14, 'Hi #{name},

You have 6 hours to complete your Alliance action: "Read and discuss an article about global inequality."

Please complete the action at this link: https://worldalliance.org/actions/26', 'You have 6 hours to complete your Alliance action: https://worldalliance.org/actions/26', '2025-10-23 18:00:00-07', '2025-10-23 18:00:10.45-07', 44, '2025-10-23 17:20:32.52657-07', '6 hours until action deadline', NULL, 'absolute', NULL);
INSERT INTO public.action_reminder VALUES (8, 'test', 'test', '2025-10-22 23:04:00-07', '2025-10-22 23:04:00.327-07', 44, '2025-10-22 23:03:43.807866-07', 'Action Reminder', NULL, 'absolute', NULL);
INSERT INTO public.action_reminder VALUES (9, 'test', 'test', '2025-10-23 08:00:00-07', '2025-10-23 08:00:00.466-07', 44, '2025-10-22 23:25:30.165162-07', 'Action Reminder', NULL, 'absolute', NULL);
INSERT INTO public.action_reminder VALUES (2, 'no message', 'no message', '2025-10-17 20:00:00-07', '2025-10-17 20:00:02.998-07', 44, '2025-10-16 21:49:48.790243-07', 'Action Reminder', NULL, 'absolute', NULL);
INSERT INTO public.action_reminder VALUES (3, 'no message', 'no message', '2025-10-18 20:00:00-07', '2025-10-18 20:00:02.896-07', 44, '2025-10-18 15:36:29.180219-07', 'Action Reminder', NULL, 'absolute', NULL);
INSERT INTO public.action_reminder VALUES (6, 'no message', 'no message', '2025-10-19 20:00:00-07', '2025-10-19 20:00:03.012-07', 44, '2025-10-18 15:40:23.333129-07', 'Action Reminder', NULL, 'absolute', NULL);
INSERT INTO public.action_reminder VALUES (7, 'no message', 'no message', '2025-10-21 20:00:00-07', '2025-10-21 20:00:02.714-07', 44, '2025-10-18 15:41:00.559731-07', 'Action Reminder', NULL, 'absolute', NULL);
INSERT INTO public.action_reminder VALUES (13, 'Hi #{name},

You have 2 hours to complete your Alliance action: "Read and discuss an article about global inequality."

Please complete the action at this link: #{link}', 'You have 2 hours to complete your Alliance action: #{link}', '2025-10-23 22:00:00-07', '2025-10-23 22:00:05.208-07', 44, '2025-10-23 17:15:33.973684-07', '2 hours until action deadline', 'all_uncompleted', 'absolute', NULL);
INSERT INTO public.action_reminder VALUES (17, 'Hi,
An action needs your completion: "#{action}"

You have #{days} left to complete it. Please do so at the below link.
#{link}', 'You have #{days} left to complete #{action}. #{link}', NULL, '2025-10-29 18:00:06.726-07', 61, '2025-10-25 18:00:04.37158-07', 'You have #{days} left to complete #{action}', 'all_uncompleted', 'from_deadline', 280740);
INSERT INTO public.action_reminder VALUES (15, 'Hi,
An action needs your completion: "#{action}"

You have #{days} left to complete it. Please do so at the below link.
#{link}', 'You have #{days} left to complete #{action}. #{link}', NULL, '2025-10-29 18:00:11.032-07', 59, '2025-10-25 17:59:42.619181-07', 'You have #{days} left to complete #{action}', 'all_uncompleted', 'from_deadline', 280740);
INSERT INTO public.action_reminder VALUES (21, 'Hi,

You have 4.5 hours left to complete "#{action}."  Please do so: #{link}', 'Reminder: you have 4.5 hours left to complete #{action}. #{link}', NULL, '2025-11-01 19:30:11.196-07', 59, '2025-11-01 19:20:06.567205-07', 'Reminder: you have 4.5 hours left to complete #{action}', 'all_uncompleted', 'from_deadline', 16200);
INSERT INTO public.action_reminder VALUES (18, 'Hi,

An action needs your completion: "#{action}"

You have #{days} left to complete it. Please do so at the below link.
#{link}', 'Reminder: you have #{days} left to complete #{action}. #{link}', NULL, '2025-10-31 18:00:06.638-07', 61, '2025-10-25 18:00:04.57635-07', 'Reminder: you have #{days} left to complete #{action}', 'all_uncompleted', 'from_deadline', 107940);
INSERT INTO public.action_reminder VALUES (16, 'Hi,

An action needs your completion: "#{action}"

You have #{days} left to complete it. Please do so at the below link.
#{link}', 'Reminder: you have #{days} left to complete #{action}. #{link}', NULL, '2025-10-31 18:00:13.245-07', 59, '2025-10-25 17:59:42.76589-07', 'Reminder: you have #{days} left to complete #{action}', 'all_uncompleted', 'from_deadline', 107940);
INSERT INTO public.action_reminder VALUES (20, 'Hi #{firstname},

You have 12 hours left to complete "#{action}". Please do so at #{link}', 'Reminder: you have 12 hours left to complete #{action} at #{link}', NULL, '2025-11-01 12:00:07.946-07', 61, '2025-10-31 18:09:17.081906-07', 'Reminder: you have 12 hours left to complete #{action}', 'all_uncompleted', 'from_deadline', 43200);
INSERT INTO public.action_reminder VALUES (19, 'Hi #{firstname},

You have 12 hours left to complete "#{action}". Please do so at #{link}', 'Reminder: you have 12 left to complete #{action} at #{link}', NULL, '2025-11-01 12:00:14.654-07', 59, '2025-10-31 18:07:10.998393-07', 'Reminder: you have 12 hours left to complete #{action}', 'all_uncompleted', 'from_deadline', 43200);
INSERT INTO public.action_reminder VALUES (22, 'Hi,

You have 4.5 hours left to complete "#{action}." Please do so: #{link}', 'Reminder: you have 4.5 hours left to complete #{action}. #{link}', NULL, '2025-11-01 19:30:06.48-07', 61, '2025-11-01 19:20:55.352126-07', 'Reminder: you have 4.5 hours left to complete #{action}', 'all_uncompleted', 'from_deadline', 16200);
INSERT INTO public.action_reminder VALUES (23, 'Hi #{firstname},

You have 120 minutes left to complete #{action}. Please do so: #{link}', 'Reminder: you have 120 minutes left to complete #{action}. #{link}', NULL, '2025-11-01 22:00:04.737-07', 59, '2025-11-01 21:55:03.175528-07', 'Reminder: you have 120 minutes left to complete #{action}', 'all_uncompleted', 'from_deadline', 7200);
INSERT INTO public.action_reminder VALUES (24, 'Hi #{firstname},

You have 120 minutes left to complete #{action}. Please do so: #{link}', 'Reminder: you have 120 minutes left to complete #{action}. #{link}', NULL, '2025-11-01 22:00:02.57-07', 61, '2025-11-01 21:55:54.246816-07', 'Reminder: you have 120 minutes left to complete #{action}', 'all_uncompleted', 'from_deadline', 7200);
INSERT INTO public.action_reminder VALUES (26, 'Hi #{firstname},

You have 30 minutes left to complete "#{action}." Please do so: #{link}', 'Alert: you have 30 minutes left to complete #{action}. #{link}', NULL, '2025-11-01 23:30:04.189-07', 61, '2025-11-01 21:59:36.789972-07', 'Alert: you have 30 minutes left to complete #{action}', 'all_uncompleted', 'from_deadline', 1800);
INSERT INTO public.action_reminder VALUES (25, 'Hi #{firstname},

You have 30 minutes left to complete "#{action}." Please do so: #{link}', 'Alert: you have 30 minutes left to complete #{action}. #{link}', NULL, '2025-11-01 23:30:07.357-07', 59, '2025-11-01 21:58:09.44567-07', 'Alert: you have 30 minutes left to complete #{action}', 'all_uncompleted', 'from_deadline', 1800);


--
-- Data for Name: action_reminder_users_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_reminder_users_user VALUES (2, 24);
INSERT INTO public.action_reminder_users_user VALUES (3, 24);
INSERT INTO public.action_reminder_users_user VALUES (3, 10);
INSERT INTO public.action_reminder_users_user VALUES (6, 24);
INSERT INTO public.action_reminder_users_user VALUES (6, 10);
INSERT INTO public.action_reminder_users_user VALUES (7, 24);
INSERT INTO public.action_reminder_users_user VALUES (7, 10);
INSERT INTO public.action_reminder_users_user VALUES (8, 7);
INSERT INTO public.action_reminder_users_user VALUES (8, 10);
INSERT INTO public.action_reminder_users_user VALUES (9, 7);
INSERT INTO public.action_reminder_users_user VALUES (9, 10);
INSERT INTO public.action_reminder_users_user VALUES (11, 15);
INSERT INTO public.action_reminder_users_user VALUES (14, 15);


--
-- Data for Name: action_share_url; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_share_url VALUES ('7ba997f4-7f69-41d1-8b11-6ee94506c172', 'https://worldalliance.org/actions/55?sid=share-13592774af', '2025-12-15 19:33:05.462141-08', '2025-12-15 19:33:05.462141-08', '{"sid": "share-13592774af"}', 10, 55, 'share-13592774af');
INSERT INTO public.action_share_url VALUES ('925266a7-d937-426d-b499-d0315a4b9641', 'https://worldalliance.org/actions/55?sid=share-c4e8d495af', '2025-12-15 21:37:31.097822-08', '2025-12-15 21:37:31.097822-08', '{"sid": "share-c4e8d495af"}', 15, 55, 'share-c4e8d495af');
INSERT INTO public.action_share_url VALUES ('ffca3736-f581-49a4-8c58-c43b8e2fc723', 'https://worldalliance.org/actions/55?sid=share-4f026733e9', '2025-12-10 17:05:58.603675-08', '2025-12-10 17:05:58.603675-08', '{"sid": "share-4f026733e9"}', 7, 55, 'share-4f026733e9');
INSERT INTO public.action_share_url VALUES ('5bad5e4f-1767-45d8-b826-893185d45da8', 'https://worldalliance.org/actions/55?sid=share-0c0a07d27e', '2025-12-10 17:42:20.623277-08', '2025-12-10 17:42:20.623277-08', '{"sid": "share-0c0a07d27e"}', 24, 55, 'share-0c0a07d27e');
INSERT INTO public.action_share_url VALUES ('bc65f342-9eac-4bcd-9d3c-7d6cb29de2a5', 'https://worldalliance.org/actions/55?sid=share-ac6731adf1', '2025-12-10 18:37:30.405125-08', '2025-12-10 18:37:30.405125-08', '{"sid": "share-ac6731adf1"}', 11, 55, 'share-ac6731adf1');
INSERT INTO public.action_share_url VALUES ('9b7c2798-8a10-427f-8929-01c2472033cc', 'https://worldalliance.org/actions/55?sid=share-466ef08cae', '2025-12-18 11:30:24.786934-08', '2025-12-18 11:30:24.786934-08', '{"sid": "share-466ef08cae"}', 23, 55, 'share-466ef08cae');


--
-- Data for Name: action_stats_record; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_stats_record VALUES (1, 13, 'Participate in a discussion about potential habit changes', 33, 33, 1, '2026-02-10 01:00:00.003-08', '2025-10-13 17:58:51.004-07', true, '2025-09-16 17:37:59.039-07', '2025-10-13 17:58:51.004-07', 0);
INSERT INTO public.action_stats_record VALUES (2, 14, 'Sign a letter requesting news coverage of a bring-your-own-cup cafe coalition', 33, 33, 1, '2026-02-10 01:00:00.003-08', '2025-12-08 15:47:31.419-08', true, '2025-10-08 19:47:01.263-07', '2025-10-15 21:00:00-07', 0);
INSERT INTO public.action_stats_record VALUES (3, 9, 'Set up your account', 94, 118, 0.7966101694915254, '2026-02-10 01:00:00.003-08', NULL, false, '2025-08-29 14:17:15.49-07', NULL, 0);
INSERT INTO public.action_stats_record VALUES (4, 18, 'Provide a quote about Alliance participation', 33, 33, 1, '2026-02-10 01:00:00.003-08', '2025-11-18 09:41:27.244-08', true, '2025-10-08 19:47:16.526-07', '2025-10-15 21:00:00-07', 0);
INSERT INTO public.action_stats_record VALUES (5, 12, 'Get to know the platform', 43, 43, 1, '2026-02-10 01:00:00.003-08', '2025-11-11 13:47:15.699-08', false, '2025-08-15 11:37:00-07', '2025-11-11 13:47:15.699-08', 0);
INSERT INTO public.action_stats_record VALUES (6, 10, 'Make a reliability plan', 101, 119, 0.8487394957983193, '2026-02-10 01:00:00.003-08', NULL, false, '2025-08-25 12:38:00-07', NULL, 0);
INSERT INTO public.action_stats_record VALUES (7, 49, 'Approve proposals for how to spend $1,000', 37, 38, 0.9736842105263158, '2026-02-10 01:00:00.003-08', '2025-11-23 13:53:37.817-08', true, '2025-11-10 19:23:35.706-08', '2025-11-17 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (8, 26, 'Read and discuss an article about global inequality', 29, 31, 0.9354838709677419, '2026-02-10 01:00:00.003-08', '2025-11-18 09:41:49.124-08', true, '2025-10-16 20:00:00-07', '2025-10-23 23:59:00-07', 1);
INSERT INTO public.action_stats_record VALUES (9, 34, 'Personalize your task reminders', 32, 34, 0.9411764705882353, '2026-02-10 01:00:00.003-08', '2025-11-18 09:41:36.705-08', true, '2025-10-25 17:59:00-07', '2025-11-01 23:59:00-07', 0);
INSERT INTO public.action_stats_record VALUES (10, 32, 'Answer questions about nonprofit website copy and design', 30, 33, 0.9090909090909091, '2026-02-10 01:00:00.003-08', '2025-12-09 11:33:32.158-08', true, '2025-10-25 18:00:03.79-07', '2025-11-01 23:59:00-07', 0);
INSERT INTO public.action_stats_record VALUES (11, 48, 'Plan for next week’s pothole-related task', 36, 37, 0.972972972972973, '2026-02-10 01:00:00.003-08', '2025-11-17 23:59:00-08', true, '2025-11-10 19:23:35.706-08', '2025-11-17 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (12, 11, 'Sign your membership contract', 102, 119, 0.8571428571428571, '2026-02-10 01:00:00.003-08', NULL, false, '2025-08-14 21:51:00-07', NULL, 0);
INSERT INTO public.action_stats_record VALUES (13, 47, 'Decide how to allocate $1,000 next week', 38, 39, 0.9743589743589743, '2026-02-10 01:00:00.003-08', '2025-11-11 13:52:00-08', true, '2025-11-02 17:00:00-08', '2025-11-09 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (14, 46, 'Suggest a problem that could be addressed by a future Alliance action', 37, 39, 0.9487179487179487, '2026-02-10 01:00:00.003-08', NULL, true, '2025-11-02 17:00:00-08', '2025-11-09 23:59:00-08', 1);
INSERT INTO public.action_stats_record VALUES (15, 50, 'Report a pothole in your community', 32, 36, 0.8888888888888888, '2026-02-10 01:00:00.003-08', '2025-11-26 11:42:14.711-08', true, '2025-11-10 19:24:00-08', '2025-11-24 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (16, 51, 'Provide feedback to the office', 35, 35, 1, '2026-02-10 01:00:00.003-08', '2025-12-03 09:56:59.361-08', true, '2025-11-24 18:01:20.138-08', '2025-12-01 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (17, 52, 'Participate in an experiment to measure awareness of AI data use practices', 35, 36, 0.9722222222222222, '2026-02-10 01:00:00.003-08', '2025-12-15 21:24:36.069-08', true, '2025-12-01 20:38:27.932-08', '2025-12-08 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (18, 53, 'Prepare to submit a public comment to your local government', 38, 40, 0.95, '2026-02-10 01:00:00.003-08', '2025-12-15 23:59:00-08', true, '2025-12-08 18:20:00.317-08', '2025-12-15 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (19, 54, 'Submit a public comment to your local government', 27, 30, 0.9, '2026-02-10 01:00:00.003-08', '2026-02-04 16:50:37.032-08', true, '2025-12-29 21:00:00-08', '2026-01-05 23:59:00-08', 1);
INSERT INTO public.action_stats_record VALUES (20, 55, 'Participate in a survey on ethical AI privacy settings', 0, 1, 0, '2026-02-10 01:00:00.003-08', NULL, false, '2025-12-10 16:51:52.037-08', NULL, 0);
INSERT INTO public.action_stats_record VALUES (21, 57, 'Read a few general updates', 45, 45, 1, '2026-02-10 01:00:00.003-08', '2025-12-22 23:59:00-08', true, '2025-12-15 21:18:55.592-08', '2025-12-22 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (22, 56, 'Invite friends and family to fill out our AI privacy survey', 42, 43, 0.9767441860465116, '2026-02-10 01:00:00.003-08', NULL, true, '2025-12-15 21:18:55.592-08', '2025-12-22 23:59:00-08', 2);
INSERT INTO public.action_stats_record VALUES (30, 71, 'Contribute to a discussion about Alliance culture', 59, 67, 0.8805970149253731, '2026-02-10 01:00:00.003-08', NULL, true, '2026-01-28 19:00:00-08', '2026-02-04 23:59:00-08', 1);
INSERT INTO public.action_stats_record VALUES (23, 58, 'Review three previous Alliance actions', 12, 14, 0.8571428571428571, '2026-02-10 01:00:00.003-08', '2026-01-05 23:59:00-08', true, '2025-12-29 21:00:00-08', '2026-01-05 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (24, 59, 'Decide whether to make basic profile information public', 55, 57, 0.9649122807017544, '2026-02-10 01:00:00.003-08', '2026-02-04 16:55:44.378-08', true, '2026-01-06 18:56:27.948-08', '2026-01-13 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (25, 60, 'Collect e-waste for proper disposal', 48, 50, 0.96, '2026-02-10 01:00:00.003-08', '2026-01-14 11:16:49.235-08', true, '2026-01-06 18:56:27.948-08', '2026-01-13 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (26, 64, 'Properly dispose of the e-waste you collected', 21, 23, 0.9130434782608695, '2026-02-10 01:00:00.003-08', '2026-01-21 23:59:00-08', true, '2026-01-13 23:59:00-08', '2026-01-21 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (27, 62, 'Ask experts questions about the recent US withdrawal from international institutions', 25, 67, 0.373134328358209, '2026-02-10 01:00:00.003-08', NULL, false, '2026-01-13 18:42:32.618-08', '2026-01-20 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (28, 66, 'Read the Alliance’s recent progress update', 38, 67, 0.5671641791044776, '2026-02-10 01:00:00.003-08', NULL, false, '2026-01-13 18:42:32.618-08', '2026-01-20 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (31, 72, 'Explore the platform', 9, 32, 0.28125, '2026-02-10 01:00:00.003-08', NULL, false, '2026-02-03 12:55:54.759-08', NULL, 0);
INSERT INTO public.action_stats_record VALUES (29, 70, 'Collect unclaimed property for a potential future donation', 65, 67, 0.9701492537313433, '2026-02-10 01:00:00.003-08', NULL, true, '2026-01-21 18:00:00-08', '2026-01-28 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (32, 73, 'Read about Alliance growth plans', 40, 77, 0.5194805194805194, '2026-02-10 01:00:00.003-08', NULL, true, '2026-02-05 19:20:00-08', '2026-02-12 23:59:00-08', 0);
INSERT INTO public.action_stats_record VALUES (33, 74, 'Consider inviting new members to the Alliance', 23, 76, 0.3026315789473684, '2026-02-10 01:00:00.003-08', NULL, true, '2026-02-05 19:20:00-08', '2026-02-12 23:59:00-08', 0);


--
-- Data for Name: action_suite; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_suite VALUES (1, 'Onboarding', '2025-11-02 10:00:13.389084-08', '2025-11-02 10:00:13.389084-08');
INSERT INTO public.action_suite VALUES (2, 'Week 1: BYOC + Quotes', '2025-11-02 10:01:12.92837-08', '2025-11-02 10:01:12.92837-08');
INSERT INTO public.action_suite VALUES (3, 'Week 2: Inequality discussion', '2025-11-02 11:24:25.892215-08', '2025-11-02 11:24:25.892215-08');
INSERT INTO public.action_suite VALUES (4, 'Week 3: Personalize reminders + Nonprofit website feedback', '2025-11-02 11:24:55.390057-08', '2025-11-02 11:24:55.390057-08');
INSERT INTO public.action_suite VALUES (5, 'Week 4: $1000 voting + action/problem suggestions', '2025-11-02 11:25:34.160491-08', '2025-11-02 11:25:34.160491-08');
INSERT INTO public.action_suite VALUES (6, 'Week 5: $1000 voting + pothole preparation ', '2025-11-10 17:14:35.09596-08', '2025-11-10 17:14:35.09596-08');
INSERT INTO public.action_suite VALUES (7, 'Week 6: Report a pothole', '2025-11-10 18:27:06.525216-08', '2025-11-10 18:27:06.525216-08');
INSERT INTO public.action_suite VALUES (8, 'Week 7: Feedback', '2025-11-21 11:18:28.81803-08', '2025-11-21 11:18:28.81803-08');
INSERT INTO public.action_suite VALUES (9, 'Week 8: AI data use', '2025-12-01 20:31:29.27753-08', '2025-12-01 20:31:29.27753-08');
INSERT INTO public.action_suite VALUES (10, 'Week 9: Local problem identification', '2025-12-08 16:40:53.881208-08', '2025-12-08 16:40:53.881208-08');
INSERT INTO public.action_suite VALUES (11, 'Week 10: AI Privacy FaF campiagn + read updates', '2025-12-15 20:39:40.825001-08', '2025-12-15 20:39:40.825001-08');
INSERT INTO public.action_suite VALUES (12, 'Week 11: Submit public comment', '2025-12-24 21:02:42.274748-08', '2025-12-24 21:02:42.274748-08');
INSERT INTO public.action_suite VALUES (13, 'Week 11: Review three previous Alliance actions', '2025-12-24 21:47:52.090848-08', '2025-12-24 21:47:52.090848-08');
INSERT INTO public.action_suite VALUES (14, 'Week 12: Member directory + e-waste planning', '2026-01-06 16:49:56.088899-08', '2026-01-06 16:49:56.088899-08');
INSERT INTO public.action_suite VALUES (17, 'Week 13: E-waste', '2026-01-13 15:20:08.123428-08', '2026-01-13 15:20:08.123428-08');
INSERT INTO public.action_suite VALUES (16, 'Week 13: Expert AMA + progress update', '2026-01-13 14:21:12.546465-08', '2026-01-13 14:21:12.546465-08');
INSERT INTO public.action_suite VALUES (19, 'Week 14: Collect unclaimed property for a potential future donation', '2026-01-15 21:55:54.63807-08', '2026-01-15 21:55:54.63807-08');
INSERT INTO public.action_suite VALUES (20, 'Week 15: Culture discussion', '2026-01-28 17:09:34.24629-08', '2026-01-28 17:09:34.24629-08');
INSERT INTO public.action_suite VALUES (21, 'Week 16: Growth reading + invites', '2026-02-04 14:44:32.277233-08', '2026-02-04 14:44:32.277233-08');


--
-- Data for Name: action_update; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.action_update VALUES (1, 'The office will decide amongst the 5 proposals with the highest approval', '2025-11-12 14:05:00-08', '2025-11-23 14:05:25.911-08', 'none', 47, 118, 95, 'NA', NULL);
INSERT INTO public.action_update VALUES (2, 'We allocated $1,000 to Cool Earth and GiveDirectly', '2025-11-23 14:06:50.124-08', '2025-11-23 14:06:50.124-08', 'all_members', 49, 119, 96, 'We allocated $1,000 to Cool Earth and GiveDirectly', NULL);
INSERT INTO public.action_update VALUES (3, 'We reported 19 potholes and 1 crumbling wall', '2025-11-26 11:43:00-08', '2025-11-26 11:28:52.06-08', 'all_members', 50, 122, 101, 'We reported 19 potholes and 1 crumbling wall', NULL);
INSERT INTO public.action_update VALUES (4, 'We processed the results of the member survey', '2025-12-03 10:02:00-08', '2025-12-03 09:56:45.545-08', 'all_members', 51, 124, 106, 'We processed the results of the member survey', NULL);
INSERT INTO public.action_update VALUES (5, 'Our bring-your-own-cup cafe coalition received media coverage', '2025-12-08 15:52:00-08', '2025-12-08 15:47:19.122-08', 'all_members', 14, 128, 107, 'Our bring-your-own-cup cafe coalition received media coverage', NULL);
INSERT INTO public.action_update VALUES (6, 'Nonprofits responded positively to our compiled website feedback', '2025-12-09 11:35:35.966-08', '2025-12-09 11:35:35.966-08', 'all_members', 32, 134, 115, 'Nonprofits responded positively to our compiled website feedback', NULL);
INSERT INTO public.action_update VALUES (7, 'Our survey found that most members do not want their data used for AI training', '2025-12-15 21:24:00-08', '2025-12-15 21:23:37.545-08', 'all_members', 52, 136, 121, 'Our survey found that most members do not want their data used for AI training', NULL);
INSERT INTO public.action_update VALUES (8, 'Our external survey found that most friends and family do not want their data used for AI training', '2026-01-12 18:22:00-08', '2026-01-12 18:16:56.046-08', 'none', 56, 152, 120, 'Our external survey found that most friends and family do not want their data used for AI training', NULL);
INSERT INTO public.action_update VALUES (9, 'Members collected 57 kg (126 lbs) of e-waste.', '2026-01-14 11:16:59.456-08', '2026-01-14 11:16:59.456-08', 'none', 60, 196, 150, 'Members collected 55 kg (121 lbs) of e-waste.', NULL);
INSERT INTO public.action_update VALUES (10, 'Our AI privacy survey was featured on the homepage of Digiday', '2026-01-27 09:55:00-08', '2026-01-27 09:37:40.117-08', 'all_members', 56, 241, 120, 'Our AI privacy survey was featured on the homepage of Digiday', NULL);
INSERT INTO public.action_update VALUES (11, 'We surpassed our $500 donation goal, so we''re raising it to $1,000', '2026-01-27 11:01:00-08', '2026-01-27 10:58:22.344-08', 'all_members', 70, 242, 153, 'We surpassed our $500 "unclaimed properties" donation goal, so we''re raising it to $1,000', NULL);
INSERT INTO public.action_update VALUES (12, 'Members expect to donate over $2,000 to GiveDirectly', '2026-01-30 13:12:00-08', '2026-01-30 13:03:14.456-08', 'none', 70, 263, 154, 'Members expect to donate over $2,000 in unclaimed properties', NULL);
INSERT INTO public.action_update VALUES (13, 'We added a public member directory to our "people" page', '2026-02-04 16:56:00-08', '2026-02-04 16:50:05.65-08', 'none', 59, 308, 132, 'We added a public member directory to our "people" page', NULL);


--
-- Data for Name: city; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.comment VALUES (41, 7, 'post', 5, true, '2025-09-03 23:57:36.879826', '2025-09-03 17:14:36.402909-07', NULL, false, 9, 0);
INSERT INTO public.comment VALUES (42, 10, 'activity', 35, false, '2025-09-05 18:42:37.027475', '2025-09-05 11:42:37.027475-07', NULL, false, 10, 0);
INSERT INTO public.comment VALUES (43, 10, 'activity', 44, false, '2025-09-07 22:49:47.865117', '2025-09-07 15:49:47.865117-07', NULL, false, 13, 0);
INSERT INTO public.comment VALUES (44, 7, 'post', 6, false, '2025-09-17 01:34:16.934164', '2025-09-16 18:34:16.934164-07', NULL, false, 15, 0);
INSERT INTO public.comment VALUES (45, 10, 'post', 6, false, '2025-09-17 01:49:21.964578', '2025-09-16 18:49:21.964578-07', NULL, false, 16, 0);
INSERT INTO public.comment VALUES (46, 11, 'post', 6, false, '2025-09-17 03:21:34.323256', '2025-09-16 20:21:34.323256-07', NULL, false, 17, 0);
INSERT INTO public.comment VALUES (47, 24, 'post', 6, false, '2025-09-17 22:35:34.798093', '2025-09-17 15:35:34.798093-07', NULL, false, 18, 0);
INSERT INTO public.comment VALUES (48, 23, 'post', 6, false, '2025-09-17 23:20:11.069785', '2025-09-17 16:20:11.069785-07', NULL, false, 19, 0);
INSERT INTO public.comment VALUES (49, 15, 'post', 6, false, '2025-09-17 23:37:25.066574', '2025-09-17 16:37:25.066574-07', 46, false, 20, 0);
INSERT INTO public.comment VALUES (50, 11, 'post', 6, false, '2025-09-18 04:45:38.315891', '2025-09-17 21:45:38.315891-07', 49, false, 21, 0);
INSERT INTO public.comment VALUES (90, 10, 'post', 9, true, '2025-10-15 19:06:05.209353', '2025-10-15 12:06:35.504454-07', NULL, false, 64, 0);
INSERT INTO public.comment VALUES (91, 23, 'post', 9, false, '2025-10-17 03:39:59.997122', '2025-10-16 20:39:59.997122-07', NULL, false, 66, 0);
INSERT INTO public.comment VALUES (92, 7, 'post', 9, false, '2025-10-17 04:53:40.440456', '2025-10-16 21:53:40.440456-07', NULL, false, 67, 0);
INSERT INTO public.comment VALUES (101, 10, 'post', 9, false, '2025-10-20 18:03:54.19097', '2025-10-20 11:03:54.19097-07', NULL, false, 76, 0);
INSERT INTO public.comment VALUES (102, 11, 'post', 9, false, '2025-10-21 03:24:10.152881', '2025-10-20 20:24:10.152881-07', NULL, false, 77, 0);
INSERT INTO public.comment VALUES (106, 24, 'post', 9, true, '2025-10-22 18:00:37.746634', '2025-10-22 12:21:19.328207-07', NULL, false, 81, 0);
INSERT INTO public.comment VALUES (111, 15, 'post', 9, false, '2025-10-24 01:17:11.838263', '2025-10-23 18:17:11.838263-07', NULL, false, 86, 0);
INSERT INTO public.comment VALUES (122, 24, 'post', 9, false, '2025-10-24 16:46:25.173511', '2025-10-24 09:46:25.173511-07', NULL, false, 97, 0);
INSERT INTO public.comment VALUES (131, 10, 'activity', 600, true, '2025-11-12 05:38:59.324838', '2025-11-11 21:40:23.726387-08', NULL, false, 106, 0);
INSERT INTO public.comment VALUES (132, 10, 'activity', 600, true, '2025-11-12 05:42:08.1316', '2025-11-11 21:42:11.098787-08', NULL, false, 107, 0);
INSERT INTO public.comment VALUES (133, 15, 'activity', 600, true, '2025-11-12 18:58:56.649649', '2025-11-12 10:59:17.427903-08', NULL, false, 108, 0);
INSERT INTO public.comment VALUES (134, 10, 'activity', 600, false, '2025-11-13 05:25:50.04809', '2025-11-12 21:25:50.04809-08', NULL, false, 109, 0);
INSERT INTO public.comment VALUES (138, 7, 'activity', 619, false, '2025-11-13 20:29:03.351059', '2025-11-13 12:29:03.351059-08', NULL, false, 113, 0);
INSERT INTO public.comment VALUES (141, 7, 'post', 11, false, '2025-11-21 03:25:52.891408', '2025-11-20 19:25:52.891408-08', NULL, false, 117, 0);
INSERT INTO public.comment VALUES (147, 10, 'action', 50, false, '2025-12-04 01:45:58.304818', '2025-12-03 17:45:58.304818-08', NULL, false, 127, 0);
INSERT INTO public.comment VALUES (148, 11, 'action', 14, false, '2025-12-08 23:57:37.937267', '2025-12-08 15:57:37.937267-08', NULL, false, 129, 0);
INSERT INTO public.comment VALUES (153, 11, 'action', 32, false, '2025-12-11 03:17:27.453237', '2025-12-10 19:17:27.453237-08', NULL, false, 135, 0);
INSERT INTO public.comment VALUES (161, 7, 'post', 13, false, '2026-01-10 06:33:26.542626', '2026-01-09 22:33:26.542626-08', NULL, false, 146, 0);
INSERT INTO public.comment VALUES (164, 15, 'action', 32, true, '2026-01-12 23:38:39.390161', '2026-01-12 15:39:28.229296-08', NULL, false, 150, 0);
INSERT INTO public.comment VALUES (166, 10, 'post', 15, false, '2026-01-13 23:33:22.082258', '2026-01-13 15:33:22.082258-08', NULL, false, 154, 0);
INSERT INTO public.comment VALUES (168, 10, 'post', 15, false, '2026-01-14 02:30:22.34775', '2026-01-13 18:30:22.34775-08', NULL, false, 156, 0);
INSERT INTO public.comment VALUES (169, 15, 'post', 15, false, '2026-01-14 02:35:02.950678', '2026-01-13 18:35:02.950678-08', NULL, false, 157, 0);
INSERT INTO public.comment VALUES (171, 23, 'post', 15, false, '2026-01-14 02:39:54.836922', '2026-01-13 18:39:54.836922-08', NULL, false, 159, 0);
INSERT INTO public.comment VALUES (172, 23, 'post', 15, false, '2026-01-14 02:41:45.841746', '2026-01-13 18:41:45.841746-08', NULL, false, 160, 0);
INSERT INTO public.comment VALUES (174, 7, 'post', 15, false, '2026-01-14 03:00:30.166895', '2026-01-13 19:00:30.166895-08', NULL, false, 162, 0);
INSERT INTO public.comment VALUES (175, 11, 'post', 15, false, '2026-01-14 03:32:36.060249', '2026-01-13 19:32:36.060249-08', NULL, false, 163, 0);
INSERT INTO public.comment VALUES (177, 11, 'post', 15, false, '2026-01-14 03:40:16.398635', '2026-01-13 19:40:16.398635-08', 168, false, 165, 0);
INSERT INTO public.comment VALUES (252, 7, 'activity', 1351, false, '2026-01-28 21:13:22.690495', '2026-01-28 13:13:22.690495-08', NULL, false, 243, 0);
INSERT INTO public.comment VALUES (253, 10, 'activity', 1351, false, '2026-01-28 21:14:00.615661', '2026-01-28 13:14:00.615661-08', NULL, false, 244, 0);
INSERT INTO public.comment VALUES (256, 10, 'activity', 1356, false, '2026-01-28 23:43:42.017665', '2026-01-28 15:43:42.017665-08', NULL, false, 247, 0);
INSERT INTO public.comment VALUES (268, 11, 'post', 16, false, '2026-01-30 06:06:41.158192', '2026-01-29 22:06:41.158192-08', NULL, false, 260, 0);
INSERT INTO public.comment VALUES (291, 7, 'activity', 1406, false, '2026-02-03 22:54:09.785827', '2026-02-03 14:54:09.785827-08', NULL, false, 284, 0);
INSERT INTO public.comment VALUES (292, 7, 'activity', 1410, false, '2026-02-03 22:54:27.497182', '2026-02-03 14:54:27.497182-08', NULL, false, 285, 0);
INSERT INTO public.comment VALUES (309, 10, 'activity', 1421, false, '2026-02-04 18:01:20.09572', '2026-02-04 10:01:20.09572-08', NULL, false, 302, 0);
INSERT INTO public.comment VALUES (316, 24, 'post', 16, false, '2026-02-05 02:02:38.929558', '2026-02-04 18:02:38.929558-08', NULL, false, 310, 0);
INSERT INTO public.comment VALUES (344, 10, 'activity', 1453, false, '2026-02-05 16:34:24.607694', '2026-02-05 08:34:24.607694-08', NULL, false, 338, 0);
INSERT INTO public.comment VALUES (351, 7, 'activity', 1488, false, '2026-02-06 06:09:44.438874', '2026-02-05 22:09:44.438874-08', NULL, false, 345, 0);
INSERT INTO public.comment VALUES (353, 7, 'activity', 1508, false, '2026-02-06 19:35:18.159216', '2026-02-06 11:35:18.159216-08', NULL, false, 347, 0);
INSERT INTO public.comment VALUES (355, 10, 'activity', 1516, false, '2026-02-07 00:48:21.022675', '2026-02-06 16:48:21.022675-08', NULL, false, 349, 0);


--
-- Data for Name: comment_likes_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.comment_likes_user VALUES (44, 15);
INSERT INTO public.comment_likes_user VALUES (45, 24);
INSERT INTO public.comment_likes_user VALUES (47, 7);
INSERT INTO public.comment_likes_user VALUES (47, 10);
INSERT INTO public.comment_likes_user VALUES (44, 10);
INSERT INTO public.comment_likes_user VALUES (47, 15);
INSERT INTO public.comment_likes_user VALUES (48, 10);
INSERT INTO public.comment_likes_user VALUES (49, 10);
INSERT INTO public.comment_likes_user VALUES (46, 10);
INSERT INTO public.comment_likes_user VALUES (49, 7);
INSERT INTO public.comment_likes_user VALUES (50, 7);
INSERT INTO public.comment_likes_user VALUES (50, 15);
INSERT INTO public.comment_likes_user VALUES (45, 7);
INSERT INTO public.comment_likes_user VALUES (48, 7);
INSERT INTO public.comment_likes_user VALUES (46, 7);
INSERT INTO public.comment_likes_user VALUES (50, 10);
INSERT INTO public.comment_likes_user VALUES (91, 7);
INSERT INTO public.comment_likes_user VALUES (91, 10);
INSERT INTO public.comment_likes_user VALUES (92, 10);
INSERT INTO public.comment_likes_user VALUES (101, 7);
INSERT INTO public.comment_likes_user VALUES (102, 10);
INSERT INTO public.comment_likes_user VALUES (102, 7);
INSERT INTO public.comment_likes_user VALUES (91, 24);
INSERT INTO public.comment_likes_user VALUES (111, 10);
INSERT INTO public.comment_likes_user VALUES (111, 7);
INSERT INTO public.comment_likes_user VALUES (122, 10);
INSERT INTO public.comment_likes_user VALUES (141, 10);
INSERT INTO public.comment_likes_user VALUES (147, 7);
INSERT INTO public.comment_likes_user VALUES (148, 7);
INSERT INTO public.comment_likes_user VALUES (148, 10);
INSERT INTO public.comment_likes_user VALUES (153, 7);
INSERT INTO public.comment_likes_user VALUES (153, 10);
INSERT INTO public.comment_likes_user VALUES (161, 10);
INSERT INTO public.comment_likes_user VALUES (166, 7);
INSERT INTO public.comment_likes_user VALUES (168, 7);
INSERT INTO public.comment_likes_user VALUES (169, 7);
INSERT INTO public.comment_likes_user VALUES (169, 10);
INSERT INTO public.comment_likes_user VALUES (172, 10);
INSERT INTO public.comment_likes_user VALUES (171, 10);
INSERT INTO public.comment_likes_user VALUES (174, 10);
INSERT INTO public.comment_likes_user VALUES (175, 10);
INSERT INTO public.comment_likes_user VALUES (177, 7);
INSERT INTO public.comment_likes_user VALUES (177, 10);
INSERT INTO public.comment_likes_user VALUES (175, 7);
INSERT INTO public.comment_likes_user VALUES (268, 7);
INSERT INTO public.comment_likes_user VALUES (268, 10);
INSERT INTO public.comment_likes_user VALUES (268, 11);
INSERT INTO public.comment_likes_user VALUES (292, 11);
INSERT INTO public.comment_likes_user VALUES (309, 7);
INSERT INTO public.comment_likes_user VALUES (316, 7);
INSERT INTO public.comment_likes_user VALUES (316, 10);
INSERT INTO public.comment_likes_user VALUES (351, 10);
INSERT INTO public.comment_likes_user VALUES (353, 10);


--
-- Data for Name: communique; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: communique_users_read; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: community; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.community VALUES (4, 'Eamon''s group', 'Reminder and discussion group for Eamon''s friends and family', NULL, '2025-11-17 21:06:28.816114-08', '2025-11-17 21:06:28.816114-08', false, 10, true, true);
INSERT INTO public.community VALUES (8, 'Dulce''s group', 'Reminder and discussion group for Dulce''s friends', NULL, '2025-11-24 22:48:11.538899-08', '2025-11-24 22:48:11.538899-08', false, 10, true, true);
INSERT INTO public.community VALUES (10, 'Dana''s group', 'Reminder and discussion group for Dana''s friends and family', NULL, '2026-01-12 13:25:28.206533-08', '2026-01-12 13:25:28.206533-08', false, 10, true, true);
INSERT INTO public.community VALUES (11, 'Luka''s group', 'Reminder and discussion group for Luka''s friends', NULL, '2026-01-14 09:45:58.8016-08', '2026-01-14 09:45:58.8016-08', false, 10, true, true);
INSERT INTO public.community VALUES (12, 'Kylen''s group', 'Reminder and discussion group for Kylen''s group', NULL, '2026-01-14 10:07:54.721259-08', '2026-01-14 10:07:54.721259-08', false, 10, true, true);
INSERT INTO public.community VALUES (13, 'Rishi''s group', 'Reminder and discussion group for Rishi''s friends and family.', NULL, '2026-01-22 19:51:27.193524-08', '2026-01-22 19:51:27.193524-08', false, 10, true, true);
INSERT INTO public.community VALUES (14, 'Selena''s group', 'Reminder and discussion group for Selena''s friends', NULL, '2026-01-23 15:04:03.217613-08', '2026-01-23 15:04:03.217613-08', false, 10, true, true);
INSERT INTO public.community VALUES (15, 'Liam''s group', 'Reminder and discussion group for Liam''s friends', NULL, '2026-01-25 10:25:49.600415-08', '2026-01-25 10:25:49.600415-08', false, 10, true, true);
INSERT INTO public.community VALUES (9, 'Charles''s Group', 'Reminder and discussion group for Charles''s friends', '1770257072542.webp', '2025-12-02 18:46:53.707717-08', '2026-02-04 18:04:32.615458-08', false, 20, true, true);
INSERT INTO public.community VALUES (3, 'Bryan''s group', 'Bryan''s Alliance group for action reminders', '1770266780508.webp', '2025-11-17 21:00:27.031145-08', '2026-02-04 20:46:20.574971-08', true, 40, true, true);
INSERT INTO public.community VALUES (1, 'Grant''s Group', 'Reminder and discussion group for Grant''s friends.', 'https://dj92mxbdjuclo.cloudfront.net/1770248545092.webp', '2025-11-13 11:13:21.459209-08', '2026-02-05 19:41:45.512422-08', false, 50, true, true);
INSERT INTO public.community VALUES (16, 'Alex''s Group', 'Reminder and discussion group for Alex''s friends', 'https://dj92mxbdjuclo.cloudfront.net/1770248820613.webp', '2026-01-28 11:29:06.265884-08', '2026-02-05 22:45:14.044389-08', false, 25, true, true);
INSERT INTO public.community VALUES (7, 'Sidney and Mark''s group', 'Sidney and Mark''s reminder group for Alliance members.', 'https://dj92mxbdjuclo.cloudfront.net/1770241578852.webp', '2025-11-24 21:44:13.642688-08', '2026-02-07 13:27:41.946797-08', false, 30, true, true);
INSERT INTO public.community VALUES (17, 'Alex''s Group', 'Reminder and discussion group for Alex''s friends', NULL, '2026-02-08 10:35:22.200172-08', '2026-02-08 10:35:22.200172-08', false, NULL, false, false);


--
-- Data for Name: community_invite; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: community_leaders_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.community_leaders_user VALUES (1, 11);
INSERT INTO public.community_leaders_user VALUES (4, 24);
INSERT INTO public.community_leaders_user VALUES (7, 7);
INSERT INTO public.community_leaders_user VALUES (7, 10);


--
-- Data for Name: community_users_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.community_users_user VALUES (1, 11);
INSERT INTO public.community_users_user VALUES (4, 24);
INSERT INTO public.community_users_user VALUES (4, 15);
INSERT INTO public.community_users_user VALUES (7, 7);
INSERT INTO public.community_users_user VALUES (7, 10);


--
-- Data for Name: contract_event; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.contract_event VALUES (3, 'signed', '2025-09-16 20:12:41.393-07', '2025-12-08 11:10:00.58197-08', false, 11, NULL);
INSERT INTO public.contract_event VALUES (14, 'signed', '2025-09-17 16:09:56.696-07', '2025-12-08 11:10:00.58197-08', false, 23, NULL);
INSERT INTO public.contract_event VALUES (30, 'signed', '2025-09-21 12:10:09.374-07', '2025-12-08 11:10:00.58197-08', false, 15, NULL);
INSERT INTO public.contract_event VALUES (36, 'signed', '2025-09-17 15:29:07.322-07', '2025-12-08 11:10:00.58197-08', false, 24, NULL);
INSERT INTO public.contract_event VALUES (37, 'signed', '2025-10-08 18:03:23.79-07', '2025-12-08 11:10:00.58197-08', false, 10, NULL);
INSERT INTO public.contract_event VALUES (38, 'signed', '2025-10-04 17:50:28.395-07', '2025-12-08 11:10:00.58197-08', false, 7, NULL);
INSERT INTO public.contract_event VALUES (98, 'suspended', '2026-01-22 16:31:54.259-08', '2026-01-22 16:31:54.259222-08', false, 23, NULL);


--
-- Data for Name: conversation; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: custom_validator; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.custom_validator VALUES (1, 'SignedContract', NULL, NULL);
INSERT INTO public.custom_validator VALUES (2, 'AddedProfileDescription', NULL, NULL);
INSERT INTO public.custom_validator VALUES (3, 'UploadedPhoto', NULL, NULL);
INSERT INTO public.custom_validator VALUES (4, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (5, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (6, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (7, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (8, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (9, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (10, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (11, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (12, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (13, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (14, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (15, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (16, 'AddedProfileDescription', NULL, NULL);
INSERT INTO public.custom_validator VALUES (17, 'RepliedToForumPost', NULL, NULL);
INSERT INTO public.custom_validator VALUES (18, 'HasPhoneNumber', NULL, NULL);
INSERT INTO public.custom_validator VALUES (19, 'IsPhoneNumberValid', NULL, NULL);
INSERT INTO public.custom_validator VALUES (20, 'MemberTag', NULL, NULL);
INSERT INTO public.custom_validator VALUES (21, 'MemberCommunity', NULL, NULL);
INSERT INTO public.custom_validator VALUES (22, 'AnyCommunity', NULL, NULL);
INSERT INTO public.custom_validator VALUES (23, 'MemberTag', '17b76614-3266-4aa4-87c8-2f29516253c1', NULL);
INSERT INTO public.custom_validator VALUES (24, 'MemberTag', '17b76614-3266-4aa4-87c8-2f29516253c', NULL);
INSERT INTO public.custom_validator VALUES (25, 'MemberTag', '17b76614-3266-4aa4-87c8-2f29516253c1 ', NULL);
INSERT INTO public.custom_validator VALUES (26, 'MemberTag', '17b76614-3266-4aa4-87c8-2f29516253c1  ', NULL);
INSERT INTO public.custom_validator VALUES (27, 'MemberTag', '17b76614-3266-4aa4-87c8-2f29516253c13', NULL);
INSERT INTO public.custom_validator VALUES (28, 'RepliedToForumPost', '9', NULL);
INSERT INTO public.custom_validator VALUES (29, 'CustomExpression', NULL, '(user) => Date.now() - new Date(user.contractEvents[0].date).getTime() > 1000 * 60 * 60 * 24 * 7 * 3');
INSERT INTO public.custom_validator VALUES (30, 'CustomExpression', NULL, '(user) => user.contractEvents.length ? Date.now() - new Date(user.contractEvents[0].date).getTime() > 1000 * 60 * 60 * 24 * 7 * 4 : false');
INSERT INTO public.custom_validator VALUES (31, 'CustomExpression', NULL, '(user) => user.contractEvents.length ? Date.now() - new Date(user.contractEvents[0].date).getTime() > 1000 * 60 * 60 * 24 * 7 * 3 : false');


--
-- Data for Name: daily_stats_record; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.daily_stats_record VALUES (4, '2025-12-08', '2025-12-08 08:00:00.007', 39, 5, 611, 39, 9, 0);
INSERT INTO public.daily_stats_record VALUES (10, '2025-12-20', '2025-12-20 08:00:00.017', 53, 4, 728, 59, 22, 73);
INSERT INTO public.daily_stats_record VALUES (6, '2025-12-10', '2025-12-10 08:00:00.008', 41, 5, 633, 41, 12, 0);
INSERT INTO public.daily_stats_record VALUES (13, '2025-12-23', '2025-12-23 08:00:00.005', 55, 4, 787, 63, 25, 103);
INSERT INTO public.daily_stats_record VALUES (2, '2025-12-06', '2025-12-06 08:00:00.029', 38, 5, 599, 32, 8, 0);
INSERT INTO public.daily_stats_record VALUES (11, '2025-12-21', '2025-12-21 08:00:00.013', 54, 4, 735, 61, 24, 78);
INSERT INTO public.daily_stats_record VALUES (9, '2025-12-19', '2025-12-19 08:00:00.017', 51, 4, 723, 57, 19, 56);
INSERT INTO public.daily_stats_record VALUES (3, '2025-12-07', '2025-12-07 08:00:00.006', 38, 5, 603, 32, 8, 0);
INSERT INTO public.daily_stats_record VALUES (12, '2025-12-22', '2025-12-22 08:00:00.034', 55, 4, 757, 63, 25, 86);
INSERT INTO public.daily_stats_record VALUES (5, '2025-12-09', '2025-12-09 08:00:00.018', 41, 5, 632, 40, 12, 0);
INSERT INTO public.daily_stats_record VALUES (7, '2025-12-17', '2025-12-17 20:00:00.034', 49, 4, 707, 50, 18, 33);
INSERT INTO public.daily_stats_record VALUES (1, '2025-12-05', '2025-12-05 08:00:00.014', 37, 5, 597, 28, 7, 0);
INSERT INTO public.daily_stats_record VALUES (8, '2025-12-18', '2025-12-18 08:00:00.037', 50, 4, 712, 52, 18, 35);
INSERT INTO public.daily_stats_record VALUES (14, '2025-12-24', '2025-12-24 08:00:00.004', 56, 4, 792, 63, 26, 113);
INSERT INTO public.daily_stats_record VALUES (15, '2025-12-25', '2025-12-25 08:00:00.003', 56, 4, 792, 63, 26, 116);
INSERT INTO public.daily_stats_record VALUES (16, '2025-12-26', '2025-12-26 08:00:00.003', 57, 4, 794, 63, 26, 118);
INSERT INTO public.daily_stats_record VALUES (17, '2025-12-27', '2025-12-27 08:00:00.02', 58, 4, 797, 63, 27, 118);
INSERT INTO public.daily_stats_record VALUES (18, '2025-12-28', '2025-12-28 08:00:00.005', 58, 4, 797, 63, 27, 119);
INSERT INTO public.daily_stats_record VALUES (19, '2025-12-29', '2025-12-29 08:00:00.003', 58, 4, 797, 63, 27, 119);
INSERT INTO public.daily_stats_record VALUES (20, '2025-12-30', '2025-12-30 08:00:00.005', 58, 4, 799, 63, 27, 119);
INSERT INTO public.daily_stats_record VALUES (21, '2025-12-31', '2025-12-31 08:00:00.006', 59, 4, 803, 63, 28, 120);
INSERT INTO public.daily_stats_record VALUES (22, '2026-01-01', '2026-01-01 08:00:00.026', 59, 4, 805, 64, 28, 121);
INSERT INTO public.daily_stats_record VALUES (23, '2026-01-02', '2026-01-02 08:00:00.01', 60, 4, 808, 65, 29, 121);
INSERT INTO public.daily_stats_record VALUES (24, '2026-01-03', '2026-01-03 08:00:00.02', 61, 4, 814, 66, 30, 122);
INSERT INTO public.daily_stats_record VALUES (25, '2026-01-04', '2026-01-04 08:00:00.016', 61, 4, 816, 66, 30, 122);
INSERT INTO public.daily_stats_record VALUES (26, '2026-01-05', '2026-01-05 08:00:00.01', 61, 4, 832, 66, 30, 122);
INSERT INTO public.daily_stats_record VALUES (27, '2026-01-06', '2026-01-06 08:00:00.007', 61, 4, 842, 66, 30, 122);
INSERT INTO public.daily_stats_record VALUES (28, '2026-01-07', '2026-01-07 08:00:00.005', 61, 4, 858, 66, 31, 122);
INSERT INTO public.daily_stats_record VALUES (29, '2026-01-08', '2026-01-08 08:00:00.009', 62, 4, 875, 66, 31, 122);
INSERT INTO public.daily_stats_record VALUES (30, '2026-01-09', '2026-01-09 08:00:00.015', 63, 4, 883, 67, 32, 122);
INSERT INTO public.daily_stats_record VALUES (31, '2026-01-10', '2026-01-10 08:00:00.006', 65, 4, 894, 72, 34, 122);
INSERT INTO public.daily_stats_record VALUES (32, '2026-01-11', '2026-01-11 08:00:00.009', 66, 4, 902, 73, 35, 122);
INSERT INTO public.daily_stats_record VALUES (33, '2026-01-12', '2026-01-12 08:00:00.009', 67, 4, 921, 73, 36, 122);
INSERT INTO public.daily_stats_record VALUES (34, '2026-01-13', '2026-01-13 08:00:00.003', 71, 5, 954, 84, 42, 122);
INSERT INTO public.daily_stats_record VALUES (35, '2026-01-14', '2026-01-14 08:00:00.004', 73, 5, 998, 87, 45, 122);
INSERT INTO public.daily_stats_record VALUES (36, '2026-01-15', '2026-01-15 08:00:00.021', 73, 5, 1021, 88, 46, 122);
INSERT INTO public.daily_stats_record VALUES (37, '2026-01-16', '2026-01-16 08:00:00.003', 72, 6, 1030, 88, 47, 122);
INSERT INTO public.daily_stats_record VALUES (38, '2026-01-17', '2026-01-17 08:00:00.023', 73, 6, 1038, 96, 50, 122);
INSERT INTO public.daily_stats_record VALUES (39, '2026-01-18', '2026-01-18 08:00:00.003', 73, 6, 1044, 96, 51, 122);
INSERT INTO public.daily_stats_record VALUES (40, '2026-01-19', '2026-01-19 08:00:00.008', 74, 6, 1059, 97, 53, 122);
INSERT INTO public.daily_stats_record VALUES (41, '2026-01-20', '2026-01-20 08:00:00.008', 74, 6, 1065, 97, 53, 122);
INSERT INTO public.daily_stats_record VALUES (42, '2026-01-21', '2026-01-21 08:00:00.004', 74, 6, 1070, 97, 53, 122);
INSERT INTO public.daily_stats_record VALUES (43, '2026-01-22', '2026-01-22 08:00:00.007', 73, 7, 1090, 97, 53, 122);
INSERT INTO public.daily_stats_record VALUES (44, '2026-01-23', '2026-01-23 08:00:00.019', 72, 9, 1097, 98, 54, 122);
INSERT INTO public.daily_stats_record VALUES (45, '2026-01-24', '2026-01-24 08:00:00.023', 72, 9, 1103, 98, 54, 122);
INSERT INTO public.daily_stats_record VALUES (46, '2026-01-25', '2026-01-25 08:00:00.008', 72, 10, 1107, 99, 55, 122);
INSERT INTO public.daily_stats_record VALUES (47, '2026-01-26', '2026-01-26 08:00:00.005', 72, 10, 1108, 100, 55, 122);
INSERT INTO public.daily_stats_record VALUES (48, '2026-01-27', '2026-01-27 08:00:00.006', 72, 10, 1114, 103, 55, 122);
INSERT INTO public.daily_stats_record VALUES (49, '2026-01-28', '2026-01-28 08:00:00.038', 73, 10, 1129, 104, 56, 122);
INSERT INTO public.daily_stats_record VALUES (50, '2026-01-29', '2026-01-29 08:00:00.009', 75, 12, 1161, 108, 60, 122);
INSERT INTO public.daily_stats_record VALUES (51, '2026-01-30', '2026-01-30 08:00:00.034', 74, 13, 1166, 108, 60, 122);
INSERT INTO public.daily_stats_record VALUES (52, '2026-01-31', '2026-01-31 08:00:00.003', 74, 13, 1170, 108, 60, 122);
INSERT INTO public.daily_stats_record VALUES (53, '2026-02-01', '2026-02-01 08:00:00.01', 74, 13, 1172, 109, 60, 122);
INSERT INTO public.daily_stats_record VALUES (54, '2026-02-02', '2026-02-02 08:00:00.003', 74, 13, 1179, 109, 60, 122);
INSERT INTO public.daily_stats_record VALUES (55, '2026-02-03', '2026-02-03 08:00:00.004', 74, 13, 1182, 111, 60, 122);
INSERT INTO public.daily_stats_record VALUES (56, '2026-02-04', '2026-02-04 08:00:00.005', 76, 13, 1193, 113, 62, 122);
INSERT INTO public.daily_stats_record VALUES (57, '2026-02-05', '2026-02-05 08:00:00.025', 77, 13, 1230, 114, 62, 122);
INSERT INTO public.daily_stats_record VALUES (58, '2026-02-06', '2026-02-06 08:00:00.005', 81, 13, 1277, 124, 66, 122);
INSERT INTO public.daily_stats_record VALUES (59, '2026-02-07', '2026-02-07 08:00:00.004', 84, 13, 1302, 131, 69, 122);
INSERT INTO public.daily_stats_record VALUES (60, '2026-02-08', '2026-02-08 08:00:00.006', 85, 13, 1314, 132, 70, 122);
INSERT INTO public.daily_stats_record VALUES (61, '2026-02-09', '2026-02-09 08:00:00.007', 86, 13, 1325, 138, 71, 122);
INSERT INTO public.daily_stats_record VALUES (62, '2026-02-10', '2026-02-10 08:00:00.013', 86, 13, 1325, 138, 71, 122);


--
-- Data for Name: editable_content; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.editable_content VALUES (7, '', '[]', '2025-09-07 14:38:42.683376-07', '2025-09-07 14:38:42.683376-07');
INSERT INTO public.editable_content VALUES (8, '', '[]', '2025-09-07 14:38:42.683376-07', '2025-09-07 14:38:42.683376-07');
INSERT INTO public.editable_content VALUES (9, 'fdsfdsa', '[]', '2025-09-07 14:38:42.683376-07', '2025-09-07 14:38:42.683376-07');
INSERT INTO public.editable_content VALUES (10, 'nice!', '[]', '2025-09-07 14:38:42.683376-07', '2025-09-07 14:38:42.683376-07');
INSERT INTO public.editable_content VALUES (11, 'wow heres a cool one', '[]', '2025-09-07 14:38:42.683376-07', '2025-09-07 14:38:42.683376-07');
INSERT INTO public.editable_content VALUES (12, 'i added a description!', '[]', '2025-09-07 14:38:42.683376-07', '2025-09-07 14:38:42.683376-07');
INSERT INTO public.editable_content VALUES (13, 'This was so easy!', '[]', '2025-09-07 15:49:47.851564-07', '2025-09-07 15:49:47.851564-07');
INSERT INTO public.editable_content VALUES (17, 'I want to recycle 25% more.', '[]', '2025-09-16 20:21:34.312084-07', '2025-09-17 16:47:16.679854-07');
INSERT INTO public.editable_content VALUES (21, 'Quick math suggests ~200-350 average plastic bottles for an average recycling bin', '[]', '2025-09-17 21:45:38.304729-07', '2025-09-17 21:45:38.304729-07');
INSERT INTO public.editable_content VALUES (22, 'I would like to reduce carbon emissions via more public transit and walking. Also interested in omitting single use paper towels, reducing single-use plastic.', '[]', '2025-09-17 22:19:34.130481-07', '2025-09-17 22:19:34.130481-07');
INSERT INTO public.editable_content VALUES (18, 'I''m hoping to decrease my carbon emissions by increasing the amount of car trips that are carpooled and reducing unnecessary trips in general.', '[]', '2025-09-17 15:35:34.786373-07', '2025-09-17 15:35:34.786373-07');
INSERT INTO public.editable_content VALUES (23, 'I will use washable rags instead paper towels, and cloth napkins instead of paper napkins.', '[]', '2025-09-18 02:32:31.829435-07', '2025-09-18 02:32:31.829435-07');
INSERT INTO public.editable_content VALUES (15, 'I''m personally interested in trying to completely avoid single-use plastics. It seems like the average American consumes ~1.5 kg of single-use plastics per week, so if 100 members participated for 2 weeks, we''d collectively avoid ~300 kg of plastic waste.', '[]', '2025-09-16 18:34:16.923911-07', '2025-09-16 18:34:16.923911-07');
INSERT INTO public.editable_content VALUES (16, 'I want to try only spending money on groceries, utilities, rent, transportation, medications, and hygiene products. ', '[]', '2025-09-16 18:49:21.950468-07', '2025-09-16 18:49:21.950468-07');
INSERT INTO public.editable_content VALUES (24, 'Great goal, me too!!', '[]', '2025-09-18 13:23:27.144894-07', '2025-09-18 13:23:27.144894-07');
INSERT INTO public.editable_content VALUES (30, 'Good goal! I’d like to work on that too. Possibly through planning trips more effectively, eg running errands close to work to combine two unavoidable trips into one', '[]', '2025-09-19 20:11:29.742913-07', '2025-09-19 20:11:29.742913-07');
INSERT INTO public.editable_content VALUES (19, 'I''d like to try to reduce my plastic usage.', '[]', '2025-09-17 16:20:11.05893-07', '2025-09-17 16:20:11.05893-07');
INSERT INTO public.editable_content VALUES (20, 'I also would like to try recycling and composting more. I currently do this very little mostly due to not having good processes/receptacles set up, but this is probably easy to do. (I wonder what the environmental impact is of purchasing a new recycling bin is and how much recycling I''d need to do to offset this?)', '[]', '2025-09-17 16:37:25.055529-07', '2025-09-17 16:37:25.055529-07');
INSERT INTO public.editable_content VALUES (25, 'Excellent idea!!', '[]', '2025-09-18 13:23:48.800351-07', '2025-09-18 13:23:48.800351-07');
INSERT INTO public.editable_content VALUES (31, 'I am OK doing small changes to habits.  But we should all consider all the time the need and therefore our readiness to also work on changes that will help all of us to change (ie policy, and therefore politics)', '[]', '2025-09-21 00:05:01.011089-07', '2025-09-21 00:05:01.011089-07');
INSERT INTO public.editable_content VALUES (14, 'We’ll be inviting more members over the next few weeks. Once we reach 100, we’d like to launch a habit-focused collective action: asking members to make a 2-week habit change that is small on its own but **adds up to measurable impact when 100 people do it collectively.**

Examples include adopting a vegetarian diet, pausing online purchases, and swapping washable rags for paper towels.

After the 2 weeks, we’ll ask members how the change went and if they plan to continue practicing the habit.

It would be useful for our planning to understand what kinds of changes members would be interested in trying out. **We''re especially looking for changes that will have quantifiable effects.**

Please leave suggestions here.', '[]', '2025-09-16 17:12:59.278687-07', '2025-09-19 13:18:14.887801-07');
INSERT INTO public.editable_content VALUES (26, 'Always turn off the lights when you leave a room.', '[]', '2025-09-19 13:22:50.756238-07', '2025-09-19 13:22:50.756238-07');
INSERT INTO public.editable_content VALUES (27, 'Is the idea to limit consumption to the essential, as opposed to the non-esssential?', '[]', '2025-09-19 13:46:04.563298-07', '2025-09-19 13:46:18.485425-07');
INSERT INTO public.editable_content VALUES (28, 'Yep. I also want to measure how much I spend on non-essentials. ', '[]', '2025-09-19 15:16:21.294502-07', '2025-09-19 15:16:21.294502-07');
INSERT INTO public.editable_content VALUES (29, 'I want to be more mindful about water usage—particularly when doing the dishes or making sure I do full loads of laundry.', '[]', '2025-09-19 16:28:26.43196-07', '2025-09-19 16:28:26.43196-07');
INSERT INTO public.editable_content VALUES (32, 'Carry hand sanitizer with you. Pick up at least 1 item of sidewalk trash each day, toss approprtiately.', '[]', '2025-09-22 10:47:01.607944-07', '2025-09-22 10:47:15.311393-07');
INSERT INTO public.editable_content VALUES (33, 'Additionally, replace old incandescent and CFLs with LEDs.', '[]', '2025-09-22 10:50:56.652237-07', '2025-09-22 10:50:56.652237-07');
INSERT INTO public.editable_content VALUES (34, 'I want to be more careful about my grocery purchases. To purchase only what I can reasonably eat during that week alongside meal planning so that no ingredient/leftover goes to waste. ', '[]', '2025-09-22 21:19:23.406507-07', '2025-09-22 21:19:23.406507-07');
INSERT INTO public.editable_content VALUES (35, 'Not ordering delivery or out. If you do, eat at the restaurant to reduce plastic and disposable containers. ', '[]', '2025-09-23 20:31:59.724254-07', '2025-09-23 20:31:59.724254-07');
INSERT INTO public.editable_content VALUES (36, 'gratitude exercises', '[]', '2025-09-24 11:54:28.433077-07', '2025-09-24 11:54:28.433077-07');
INSERT INTO public.editable_content VALUES (37, 'Take a day where you don''t use devices (phone or computer). I personally do this most Saturdays and like it a lot, I typically do a variant where I allow myself to use devices if I have a specific well formulated intention that would serve the day well, and then I set them back down as soon as I''m done. ', '[]', '2025-09-24 21:18:00.817684-07', '2025-09-24 21:18:00.817684-07');
INSERT INTO public.editable_content VALUES (38, 'Leaning into the quantifiable aspect:
- donating $40x100 = one life saved according to Givewell''s current numbers
- Cleaning up X lbs of trash 
- Moving $X of purchasing to alternatives (e.g. using Libby instead of Audible, I don''t have any examples of this that I think would be particularly good though)
- I''d personally like to try being more strict about only buying animal products that make a notable effort to treat animals more kindly (e.g. AWA eggs). This could probably be quantified relatively easily. ', '[]', '2025-09-24 21:41:37.810615-07', '2025-09-24 21:41:37.810615-07');
INSERT INTO public.editable_content VALUES (39, 'I like 2-4. I think for the purposes of this action we wouldn''t think of donating as a habit change, but I''m excited to try some form of regular small-scale donation pooling in the near future.', '[]', '2025-09-24 21:51:47.588198-07', '2025-09-24 21:51:47.588198-07');
INSERT INTO public.editable_content VALUES (40, 'I want to bring a trash bag whenever going on a hike to pickup trash on the trail. ', '[]', '2025-09-25 04:16:22.57177-07', '2025-09-25 04:16:22.57177-07');
INSERT INTO public.editable_content VALUES (41, 'who is the office?', '[]', '2025-09-25 08:39:53.771987-07', '2025-09-25 08:39:53.771987-07');
INSERT INTO public.editable_content VALUES (42, 'The office is the set of full-time people managing the Alliance. See:
- [People](https://worldalliance.org/people)
- [Guide which describes our structure](https://worldalliance.org/guide)', '[]', '2025-09-26 18:11:20.587106-07', '2025-09-26 18:11:20.587106-07');
INSERT INTO public.editable_content VALUES (43, 'I want to make looseleaf tea every day!', '[]', '2025-09-28 20:14:18.453741-07', '2025-09-28 20:14:18.453741-07');
INSERT INTO public.editable_content VALUES (44, 'This is a great idea! I''ve been wanting to clean up some trash around the Caltrain station that I typically take in to work. I have trash bags and will get tongs this next week.', '[]', '2025-09-28 20:57:01.981083-07', '2025-09-28 20:57:01.981083-07');
INSERT INTO public.editable_content VALUES (45, 'I want to volunteer and become more involved in my immediate community, but sometimes face a language barrier due to my rusty Spanish. I''d like to begin practicing Spanish for 15 minutes each day and take 60 minute long conversational classes with a Spanish teach on a platform like italki. I''ll also look into using spaced repetition apps like Anki. ', '[]', '2025-09-28 21:01:35.963689-07', '2025-09-28 21:01:35.963689-07');
INSERT INTO public.editable_content VALUES (1, '', '[]', '2025-09-07 14:38:42.683376-07', '2025-11-11 21:42:15.869962-08');
INSERT INTO public.editable_content VALUES (2, 'testing', '[]', '2025-09-07 14:38:42.683376-07', '2025-11-11 21:46:03.758084-08');
INSERT INTO public.editable_content VALUES (5, 'the alliance is by far the most wholesome social media network that I''ve been part of!', '[]', '2025-09-07 14:38:42.683376-07', '2025-11-24 23:05:27.154255-08');
INSERT INTO public.editable_content VALUES (178, 'Also the US has always been a major contributor to climate sciences. I am concerned by what will happen to the National Center for Atmospheric Research  (NCAR) or the National Oceanic and Atmospheric Administration (NOAA). Already the EPA has seen its mandate reduced. ', '[]', '2026-01-14 05:58:11.501118-08', '2026-01-14 05:58:11.501118-08');
INSERT INTO public.editable_content VALUES (284, 'Welcome!', '[]', '2026-02-03 14:54:09.780274-08', '2026-02-03 14:54:09.780274-08');
INSERT INTO public.editable_content VALUES (46, 'Idea: Attending a hearing on an active local political issue giving public comment. 
Example: I recently went to a hearing on the planning and zoning commission in San Francisco and advocated for building more housing. There are small enough hearings but have high impact as the number of attendees is <100. The people that showed up are older, wealthier, and advocated against housing as it would lower their property values. My comment was this is an acceptable tradeoff if more people can afford to live in the city, including people who keep the city running (teachers, cleaning staff, firefigheters).
Time: Time involvement is as little as 15 minutes, assuming people can attend on a weekday. 
Impact: High and quantifiable (can measure fraction of comments for/against an issue), and the ultimate outcome is a pass/no pass of an issue out of committee. Low-attendance hearings like this can have disproportionate impact, and is largely insulated from polarizing national politics.

(This assumes that a decent fraction (>20) of members are located in the San Francisco Bay Area)', '[]', '2025-09-30 00:59:02.374393-07', '2025-09-30 00:59:02.374393-07');
INSERT INTO public.editable_content VALUES (47, 'Goal: Reducing waste in developed countries.
Possible Action #1: Measuring one''s weekly trash/compost/recycling breakdown. Ideally this would be as easy as a photo.
Progress over time: Reduced landfill usage by 1000kg over 1 month.
Possible Action #2: Counting the number of rush deliveries from online shopping.
Progress over time: Measuring this can help reduce the usage over time, and having ~100 members would start to show progress in a meaningful way (e.g. 1 ton CO2e reduced from shipping).', '[]', '2025-09-30 01:03:43.95507-07', '2025-09-30 01:03:43.95507-07');
INSERT INTO public.editable_content VALUES (48, 'Goal: Collective boycott of problematic/dangerous brands. Impact would be an economic reduction of revenue for a business that would notice it, which ideally reduces that company''s incentive to continue the dangerous activity.
A high level example might be stopping Disney+ subscriptions to punish ABC''s decision to cancel Kimmel''s show (which seemed to work).
I can''t readily think of a case where ~100 members boycotting something would have a significant impact on a business''s bottom line. Perhaps for a geographically small region (e.g. San Francisco Bay Area) 100 members might have an effect. Or maybe for a service that is overrepresented in the 100 first members of The World Alliance, e.g. tech service that we all use (punish Duolingo for using AI to fire people by sending bug reports with the bug report all having the same message?) I''m kind of reaching here but I think there might be something that 100 people can do.', '[]', '2025-09-30 01:07:36.320581-07', '2025-09-30 01:07:36.320581-07');
INSERT INTO public.editable_content VALUES (49, 'Love this - a fun way to make this collective could be sharing a picture from transit/walking that other Alliance members could react to in a social media way to further incentivize doing more transit/walking. kind of similar to how Strava uses social media as reinforcement for running/biking among it''s members?', '[]', '2025-09-30 01:10:25.756483-07', '2025-09-30 01:10:25.756483-07');
INSERT INTO public.editable_content VALUES (50, '* Open the windows instead of using AC in the car (when it''s not raining and you''re not on the highway)
* Wear a jacket instead of turning on heaters
* Be awake while the sun is up and asleep when it''s down and avoid turning on lights in rooms with decent natural lighting (more viable during the summer)
* Avoid chicken and beef (maybe only consume for some fixed max number of meals per day)', '[]', '2025-09-30 14:34:03.715702-07', '2025-09-30 14:34:03.715702-07');
INSERT INTO public.editable_content VALUES (51, 'I want to start air-drying my clothes instead of using a dryer. Cuts down on energy use (which also  saves on the bills :)) ', '[]', '2025-09-30 22:45:34.629422-07', '2025-09-30 22:45:34.629422-07');
INSERT INTO public.editable_content VALUES (52, 'We''re planning to hold off on "adversarial" action such as boycotts until we reach a scale at which is likely to be more effective + we also think our group will grow more healthily if our focus to start is carrots instead of sticks. But happy to consider any particular opportunity.', '[]', '2025-10-03 17:05:23.681997-07', '2025-10-03 17:05:23.681997-07');
INSERT INTO public.editable_content VALUES (53, 'Increase use of public transportation/bikes, as opposed to car ', '[]', '2025-10-03 18:45:17.220612-07', '2025-10-03 18:45:17.220612-07');
INSERT INTO public.editable_content VALUES (54, 'I try to keep on healthy diet.  Eat more veggies/fruits…stay away from junk foods, and exercise.  I realized that being healthy is more important than anything else. ', '[]', '2025-10-05 21:12:21.144732-07', '2025-10-05 21:12:21.144732-07');
INSERT INTO public.editable_content VALUES (55, 'does stopping checking social media count? possibly reduction? or would additive qualities be better, like reading poetry?', '[]', '2025-10-07 13:00:45.61285-07', '2025-10-07 13:00:45.61285-07');
INSERT INTO public.editable_content VALUES (56, 'Reducing social media usage counts (I want to do this myself too). However, it would be great if suggested habit changes would have a measurable positive impact on the world that can be aggregated across members.', '[]', '2025-10-07 13:49:34.257158-07', '2025-10-07 13:49:34.257158-07');
INSERT INTO public.editable_content VALUES (57, 'Keep a couple of small tupperwares in the car or my bag so that when I take leftovers from a restaurant I can pack them in my own reusable containers. ', '[]', '2025-10-07 19:02:25.415739-07', '2025-10-07 19:02:25.415739-07');
INSERT INTO public.editable_content VALUES (58, 'Reduce plastic waste from grocery purchases (ideally by buying things with no packaging, but failing that recyclable)
Perform preventative maintenance on daily drivers to keep lifetimes long', '[]', '2025-10-07 19:43:02.332738-07', '2025-10-07 19:43:02.332738-07');
INSERT INTO public.editable_content VALUES (59, 'I want to bring a reusable shopping tote to the grocery store instead of getting a paper bag each time. ', '[]', '2025-10-08 10:10:20.142219-07', '2025-10-08 10:10:20.142219-07');
INSERT INTO public.editable_content VALUES (3, 'The goals of the Alliance will require that members engage in good-faith dialogue with other members, sometimes about sensitive topics. Please remember that every member is here because they want to make the world a better place and they likely deserve the benefit of the doubt.

So, **please be polite to one another**. The office will moderate the forum and add more specific guidelines if necessary.', '[]', '2025-09-07 14:38:42.683376-07', '2025-10-10 14:02:43.405012-07');
INSERT INTO public.editable_content VALUES (60, 'I looked at the article that suggests education is more effective than financial incentives, and certainly education seems crucial. Still it seems to me that I’ve read that charging people fairly tiny amounts for plastic bags at the grocery store, has dramatically reduced plastic bag usage in certain countries. (https://www.gov.uk/government/news/plastic-bag-use-falls-by-more-than-98-after-charge-introduction) What about suggesting that customers who bring their own cups get some type of reward? It could be worked into a store’s “loyalty program.” For instance, customers could have a check-off card for a free drink after bringing their own cup 10x or whatever.', '[]', '2025-10-13 20:05:03.529269-07', '2025-10-13 20:08:38.938827-07');
INSERT INTO public.editable_content VALUES (61, 'Please:
- Read [Global inequality is huge](https://ourworldindata.org/global-inequality-opportunity-to-give).
- Answer the following questions: **What in the article surprised you? Do the figures or proposed interventions change the way you want to act, if at all?** Feel free to share any other thoughts and reflections.', '[]', '2025-10-15 10:36:48.335719-07', '2025-10-15 10:36:48.335719-07');
INSERT INTO public.editable_content VALUES (62, 'hi', '[]', '2025-10-15 11:19:23.866529-07', '2025-10-15 11:19:23.866529-07');
INSERT INTO public.editable_content VALUES (64, 'test comment', '[]', '2025-10-15 12:06:05.19404-07', '2025-10-15 12:06:05.19404-07');
INSERT INTO public.editable_content VALUES (65, 'future post', '[]', '2025-10-16 14:46:23.852087-07', '2025-10-16 14:46:23.852087-07');
INSERT INTO public.editable_content VALUES (104, 'Text is best for me.', '[]', '2025-11-01 18:25:57.844354-07', '2025-11-01 18:25:57.844354-07');
INSERT INTO public.editable_content VALUES (109, '', '["1763011549832.webp"]', '2025-11-12 21:25:50.036256-08', '2025-11-12 21:25:50.036256-08');
INSERT INTO public.editable_content VALUES (4, 'The municipality responded to my email, and they have programmed the repair of the wall.  It is, however, not clear when the actual work will be done...', '[]', '2025-09-07 14:38:42.683376-07', '2025-11-13 10:20:47.897252-08');
INSERT INTO public.editable_content VALUES (195, 'The blog cited data up to 2021. With the recent withdrawals from the IPCC and the UNFCCC, I''d expect that the financial contribution from US would decrease significantly. Will other countries contribute less as well, following US''s lead? It is a BIG question. As the biggest economy in the world, US''s recent actions are truly worrisome.', '[]', '2026-01-14 11:14:30.874096-08', '2026-01-14 11:14:30.874096-08');
INSERT INTO public.editable_content VALUES (285, 'Welcome!', '[]', '2026-02-03 14:54:27.490664-08', '2026-02-03 14:54:27.490664-08');
INSERT INTO public.editable_content VALUES (66, 'I found the following sentences particularly surprising, "When participants learned the actual global median income, their generosity increased considerably. They not only expressed support for higher foreign aid spending, but also changed their behavior: their willingness to donate to international charities rose by 55% compared to those who remained unaware of the true global income disparity."

I didn''t expect that something as simple as asking people to predict the median income and then telling them the real median income would be enough to change people''s willingness to help. Although, I do wonder if the fact that people SAID they were more likely to donate actually means that they truly ARE more likely to donate.

This makes me think that a large-scale campaign to simply make people aware of a few statistics may be more effective than I would''ve thought at helping out with a problem like this.', '[]', '2025-10-16 20:39:59.986741-07', '2025-10-16 20:39:59.986741-07');
INSERT INTO public.editable_content VALUES (67, '"American citizens are ten times richer than they believe, compared to the global median" is surprising to me, and seems like an opportunity. I hope that one day we can establish direct and personal channels of communication between people in rich and poor countries so that those in rich countries can see and feel how far their help can go. I would like to connect more with people from other countries on my own time, perhaps via a penpal program.', '[]', '2025-10-16 21:53:40.428082-07', '2025-10-16 21:54:07.272565-07');
INSERT INTO public.editable_content VALUES (68, 'I''ve read a very similar articles before through Effective Altruism. Still, every time, I find that my internal benchmark for what it means to be globally rich, is so so poorly calibrated. Blows my mind how stark the differences in wealth are. This is motivating to donate globally for sure. I like the penpal program idea Sidney mentioned - donating to a direct channel feels more rewarding than arbitrarily giving to an organization (although a lot of organizations do have channels that report how the money was used / it''s impact).', '[]', '2025-10-16 22:41:51.279076-07', '2025-10-16 22:41:51.279076-07');
INSERT INTO public.editable_content VALUES (69, 'I spent 10 minutes with my spouse estimating global median income, and after we looked up the result I felt... fed up with these stupid levels of relative abundance and immediately donated 2% of my income to GiveDirectly. ', '[]', '2025-10-17 09:49:17.934551-07', '2025-10-17 09:49:17.934551-07');
INSERT INTO public.editable_content VALUES (70, 'This makes me happy.', '[]', '2025-10-17 15:32:06.347816-07', '2025-10-17 15:32:06.347816-07');
INSERT INTO public.editable_content VALUES (71, 'Yes, it would be good to have more foreign aid, as well as more charity.  The reality, however, is that governments are cutting back. The US leads (cancel US-AID) but others are also going in this direction.  Charity makes one feel good.  It can help, but it cannot be the solution.  What is really needed is to help poor countries to develop their economies - especially to move away from simply exporting resources to making use of those resources themselves. But the global north has been reluctant to allow that - as they don’t want a too successful global south.  So, let us focus on what matters most: to create better conditions for economic development in the global south.  And there are many different paths forward for that.', '[]', '2025-10-17 19:17:39.692879-07', '2025-10-17 19:17:39.692879-07');
INSERT INTO public.editable_content VALUES (73, 'I was largely not surprised by the scale of global inequality. I would also be more curious as to wealth, where I expect the numbers might be even more disparate.
In so far as I was not surprised, it doesn''t really change how I wish to act, though having some more numbers on hand is always useful. One thing it made me think about was sort of the balance between charitable giving and business investment; charitable acts and USAID have certainly saved thousands of lives, but it doesn''t seem like it has broken the cycle so to speak. Kind of callous perhaps, but focusing more on raising productivity may be a better lens long term than saving lives. The right way of doing so, however, isn''t necessarily obvious, and improving health is generally necessary for productivity.', '[]', '2025-10-18 18:30:24.938198-07', '2025-10-18 18:31:47.856534-07');
INSERT INTO public.editable_content VALUES (72, 'Unfortunately, not surprised by the great disparities documented and described in the article as I''ve seen similar data previously.   Love the tip about Give Directly and will add it to my giving list.

What did surprise somewhat was the jump from a problem to a limited set of redistribution solutions (i.e., giving away fish as expressed in the old parable).   Redistribution is useful no doubt, and a handy remedy for the relatively wealthy individuals who are the audience of the article.   But a more comprehensive and complex set of solutions would include a focus on the sustainable activity of "fishing" itself.   So, as another commenter here already pointed out, this means helping poorer countries develop their own economies.  And this would include acting in ways that don''t impose added costs on poorer countries as they "fish," like making the climate more hostile, which richer countries do disproportionately.', '[]', '2025-10-18 09:20:21.762719-07', '2025-10-18 13:35:51.470665-07');
INSERT INTO public.editable_content VALUES (75, 'Not surprised disparity is so huge - it’s huge between 20k/year no savings and a billionaire also. Think I’d still rather contribute towards local need now. Maybe when income is more disposable, I’ll donate internationally. ', '[]', '2025-10-19 20:32:44.491489-07', '2025-10-19 20:32:44.491489-07');
INSERT INTO public.editable_content VALUES (74, 'Mark and I agree that charity is not the full solution, but think it can be part of the solution. In particular, charity (including cash transfers, per our understanding) can target solutions that bolster development.

Of course there are larger and more systemic changes that are needed, but providing assistance or donations to aid organizations is something that we can do feasibly in the near future given the number of members we have. These aid organizations may focus on education, health, or water access, or anything else. We will do our best to understand which solutions are most conducive to long-term development.', '[]', '2025-10-18 20:20:12.035146-07', '2025-10-18 20:39:09.277203-07');
INSERT INTO public.editable_content VALUES (105, 'For reference: 101002964407', '[]', '2025-11-11 21:30:23.389663-08', '2025-11-11 21:30:23.389663-08');
INSERT INTO public.editable_content VALUES (113, 'Good news!', '[]', '2025-11-13 12:29:03.32708-08', '2025-11-13 12:29:03.32708-08');
INSERT INTO public.editable_content VALUES (98, 'In the current US “policy / national executive leadership” reality this data is so sobering and another stark example of how much good can be done with so little (“little” in terms of what is actually available and realistic for so many Americans and Europeans in particular). 

Our family has set up a formal “giving fund” this year and will be establishing an annual giving plan by year end. This article makes me think differently about both the amount and destinations of these gifts. ', '[]', '2025-10-24 11:08:00.139931-07', '2025-10-24 11:08:00.139931-07');
INSERT INTO public.editable_content VALUES (101, 'I found this article to be very interesting. Unfortunately, I seemed to fall into the category of Americans who vastly overestimated the global median income.  While I was aware of much of the general information presented, I was unaware of many of the exact numbers. This has made me realize that any action I take could be much more impactful than I originally thought, with donations that won''t significantly affect me being potentially life-changing to others. My chances of donating to a cause like GiveDirectly have definitely increased after reading this.', '[]', '2025-10-28 21:51:34.690321-07', '2025-10-28 21:51:34.690321-07');
INSERT INTO public.editable_content VALUES (106, '', '[{"key": "1762925939234.webp", "url": "https://worldalliance.org/api/images/1762925939234.webp"}]', '2025-11-11 21:38:59.314911-08', '2025-11-11 21:38:59.314911-08');
INSERT INTO public.editable_content VALUES (110, 'I''d like to always give a non-insignificant amount to unhoused people / people on the street who ask, at least $20. I was raised to believe that donations like that are pointless but I''m starting to feel otherwise; I think part of it is just recognizing what people in my community need.', '[]', '2025-11-13 05:53:46.587865-08', '2025-11-13 05:53:46.587865-08');
INSERT INTO public.editable_content VALUES (114, 'Feel free to track the repair of my small pothole! City of South San Francisco request #20420703 :)', '[]', '2025-11-14 21:31:59.286733-08', '2025-11-14 21:32:29.385581-08');
INSERT INTO public.editable_content VALUES (286, 'Hi hi!! I admire the work you’re doing :) Excited to be involved ', '[]', '2026-02-03 15:01:24.074935-08', '2026-02-03 15:01:24.074935-08');
INSERT INTO public.editable_content VALUES (99, 'I am willing to try this, but I think I would prefer a text message to remind me than a phone call.  ', '[]', '2025-10-26 04:12:03.166159-07', '2025-10-26 04:12:03.166159-07');
INSERT INTO public.editable_content VALUES (81, '.', '[]', '2025-10-22 11:00:37.730386-07', '2025-10-22 12:21:16.28995-07');
INSERT INTO public.editable_content VALUES (102, 'Minimizing the use of disposable or single-use products, something I''ve tried to stick with recently, is relying only on my reusable water bottle rather than plastic ones. I don''t know how much plastic the average person uses, but I think 100 people over 2 weeks could have a measurable impact.', '[]', '2025-10-28 22:05:35.576254-07', '2025-10-28 22:05:35.576254-07');
INSERT INTO public.editable_content VALUES (77, 'Such disparity was sadly unsurprising, but I was surprised at both how many lives prior aid has saved and how many lives will be lost by revoking such aid. Such figures make real change seem much more achievable: I am now more inclined to sooner orient my career toward helping others.', '[]', '2025-10-20 20:24:10.138317-07', '2025-10-20 20:24:10.138317-07');
INSERT INTO public.editable_content VALUES (82, 'I thought I was prepared for the numbers in inequality but still shocked to see the extremes. I will make a yearly calendar reminder to donate to https://www.givedirectly.org/. ', '[]', '2025-10-22 13:23:58.708739-07', '2025-10-22 13:23:58.708739-07');
INSERT INTO public.editable_content VALUES (107, '', '[{"key": "1762926127931.webp", "url": "https://worldalliance.org/api/images/1762926127931.webp"}]', '2025-11-11 21:42:08.076226-08', '2025-11-11 21:42:08.076226-08');
INSERT INTO public.editable_content VALUES (111, 'I''ve been thinking a lot recently about the balance of individual vs. collective action - particularly the famous Michael Maniates paper on individualization (https://www.sindark.com/phd/thesis/sources/Maniates.pdf). For a while I eschewed individual habit changes for a systemic approach but I think that there is some value to living out values / envisioning new alternatives.', '[]', '2025-11-13 05:56:10.974224-08', '2025-11-13 05:56:10.974224-08');
INSERT INTO public.editable_content VALUES (78, 'First of all, sorry if I’m somehow posting these articles wrong. I’m trying to make edits to be more responsive to the questions you actually asked, so sorry if I do this twice, or something.

First, I wasn''t surprised by the article, as I’ve had some awareness, since poring over the National Geographic as a young kid, complete with photos of people living in hair-raising conditions, about the vast chasm among people and countries when it comes to living standards and the prevalence of horrifying poverty. Moving from a town full of poverty to the Bay Area when I was 18 (to go to college) also placed “in my face” the extreme inequality in the US. 

Second, the article doesn’t make me want to “change the way I act,” since I’ve always donated money to nonprofits, including internationally. I’ve always felt I should “do something,” again, I guess, because of my “exposure,” if you will, to inequality. There is the question of how much to give, at any given time, which is dependent on a lot of life factors, most of which are unpredictable, which makes me more risk averse. (I’ve often thought, since we’re self-employed and my Blue Shield premium is more monstrous even than my rent, that once I’m on Medicare, I’m more likely to give more.) 

I like the Give Directly website, and I feel like the individual stories would definitely help motivate giving in a GoFundMe kind of way. I just made a one-time donation myself. The site seems well-tailored for people attuned to social media - a good update on older forms of “charity.”  It does seem like GoFundMe type campaigns can be very helpful for individuals, at least in specific, one-time situations, like dealing with the Altadena fires or a medical emergency. It seems like Give Directly could be very helpful for individuals and small communities. 

It would be interesting to know how many people do a monthly pledge. I always fear monthly pledges for fear of unintentionally running down my savings. Also, I’ve always felt it’s concerning when people have to rely on GoFundMe for medical care, for instance. It seems like basic things like medical care should be more systematic. I haven’t reviewed enough of Give Directly’s website to really understand the scope, however. 

It seems to me that part of the issue is inculcating in people the idea that “doing something” should be part of their daily life, a systematic thing. It would be interesting to know more about the monthly pledgers on GiveDirectly. Maybe there’s info on the website I haven’t uncovered. In general I’m curious, for people who have, empirically,  systematically donated in the past, what made them do it? More generally I think it would be interesting, to know more about the circumstances under which people actually have, in the past, systematically donated money to people they’re never going to meet. 

A couple other examples of large systematic donations by groups of people come to mind. One is the practice of tithing, which I think is still at least somewhat “a thing” in the Mormon Church. A second is the Giving Pledge initiated by Warren Buffett and the Gates Foundation. In both of those instances, it seems like “giving” is part of group norms - one group being the Mormons, and the other group being, presumably, notably wealthy people who maybe know the Gateses /Warren Buffett and also are altruistic? (I haven’t researched the Giving Pledge or who does it, but it seems like it has gotten off the ground.) 

Then of course there is Effective Altruism. I don’t know much about it, but I think Mark does? What works for them?? Are group norms involved? Is there a “community” approach that reinforces the giving? 

Now that I think about it, while I periodically donate to various charities and nonprofits, I’m not usually very systematic about it. But one area where I have been systematic, did involve a group, and group norms. As a member of the First Presbyterian Church of Altadena, for years I raised money in connection with the CROP Hunger Walk, an event organized each fall by Church World Service for their projects helping needy communities throughout the world.  (I plan to resume doing this when I return to Pasadena.) I probably never would have “gone to the trouble” of trying to solicit donations — I hate asking people for money — schlepping over with canned goods for local food banks (also part of the walk), recruited my kids to walk with us, etc., were it not for the fact that taking part in the CROP Hunger Walk was part of the norms and traditions of our Church, as it is of many houses of worship in Pasadena and throughout the country. 

Churches traditionally have raised money for needy communities, including overseas - they’ve probably done it for centuries — so declining church enrollment bodes ill for this source of money. I don’t know if anyone has systematically studied the benefits to recipients of church aid. That would be interesting to know more about.

Anyway the suggestion made in this forum of trying to inculcate this idea of systematic giving as a community norm, for example in school, seems to be a very good one. 

Having said all of this, it does seem like, for significant and lasting improvement in living standards, which require things like water, electricity and health infrastructure, a more organized approach than individual donations is probably a prerequisite.', '[]', '2025-10-20 20:58:35.255416-07', '2025-10-21 06:48:01.101021-07');
INSERT INTO public.editable_content VALUES (79, 'Systematic/community giving is something we want the Alliance to enable in the future, when we are a much larger group. The hope is Alliance members will be able to trust that their collective dollars are allocated according to a coherent, expert-developed, shared plan.

This would be comparable to the systematic foreign aid enabled by taxation. Expected differences are that Alliance membership is and can only ever be voluntary; we want to be transparent and lean; and we likely want to be more focused than government foreign aid programs on economic self-sufficiency (easier said than done and we have much to learn). 

One fact that is interesting to me is that Americans tend to think that ~25% of the federal budget goes to foreign aid, and think that about 10% should actually go to foreign aid. Both of those numbers are far higher than actual <1%. When people learn of the actual percentage, they become more pro-aid.

This makes us wonder if the right combination of information and direct, personal connection to those in need could motivate wealthy individuals around the world to make large, regular, voluntary contributions.', '[]', '2025-10-21 10:14:41.92387-07', '2025-10-21 10:14:41.92387-07');
INSERT INTO public.editable_content VALUES (80, 'A more mundane way to increase giving is to pay closer attention to donor experience and copy. GiveDirectly''s experiments on this front have resulted in $3M/year more donations, as described in [https://www.lennysnewsletter.com/p/how-givedirectly-increased-donations](https://www.lennysnewsletter.com/p/how-givedirectly-increased-donations) and [https://www.givedirectly.org/fundraising-experiments/](https://www.givedirectly.org/fundraising-experiments/).

Re LA fires: GiveDirectly helped get over $2.5M to low-income families impacted by the LA fires! The program is described at [https://www.givedirectly.org/lafires/](https://www.givedirectly.org/lafires/).', '[]', '2025-10-21 10:28:37.141815-07', '2025-10-21 10:31:09.289677-07');
INSERT INTO public.editable_content VALUES (76, 'I spent some time reading about similar things a few years ago, but misremembered the GDP/capita of India as double what it actually was, which resulted in me overestimating the global median income as double what it actually was. A doubling of global median income would change the lives of more than 4 billion people and likely provide capital that would aid development of local industry.

Such numbers are very abstract to me because it is almost impossible for me to imagine the living conditions of such people. The environment where I live assumes people have much higher incomes. And this is only the *median* income; according to the world bank, almost 700 million people live on less than $800 a year ($2.15 a day, the World Banks line for extreme poverty). 

Reading interviews from [https://live.givedirectly.org/](https://live.givedirectly.org/) gives me concrete examples of what it *means* to have such low income. An excerpt from the an interview with Kadzo in Kenya from 4 days ago:
> We haven’t been able to harvest anything in the last two planting seasons, leaving my family of three in a bit of a tight spot. It’s fascinating how our daily meals now depend entirely on my casual labour. What if I miss a day? The thought of going to bed hungry weighs heavily on my mind. Sometimes, we even manage only a single meal a day because of the scarcity of food. I can not help but wonder: will the rains come this planting season? I’m holding onto the hope that they will help alleviate our hunger challenges. Is it curious how much nature influences our lives?

As of now, GiveDirectly has 120,351 other stories.', '[]', '2025-10-20 11:03:54.177491-07', '2025-10-22 13:57:21.313364-07');
INSERT INTO public.editable_content VALUES (83, 'The surprising statement for me was if you make 20k post tax you’re the top 10% income. But this doesn’t really surprise in the way that “wow i make so much money” but more like “knowing it and yet i don’t really feel it”. I’ve lived and worked in other foreign countries (both developed and developing), and honestly it doesn’t feel different. Prices was adjusted for salary, i was just getting by and hustling every day, and life just goes on for both US and outside. So i don’t think the solution is just asking for the average american to give more (even though this is a super good thing to recognize we could always give more) but with the billionaire system so that’s it’s more long term. 

Granted i have a good office job in all of these cases, which in some countries that might be already a luxury.', '[]', '2025-10-23 09:28:34.399178-07', '2025-10-23 09:29:47.604856-07');
INSERT INTO public.editable_content VALUES (63, 'Please:
- Read [Global inequality is huge](https://ourworldindata.org/global-inequality-opportunity-to-give).
- Answer the following questions: **What in the article surprised you? Do the figures or proposed interventions change the way you want to act, if at all?** Feel free to share any other thoughts and reflections.

Remember to go back to your "Tasks" page and complete the action after you have contributed to the discussion.', '[]', '2025-10-15 11:54:27.452903-07', '2025-10-23 09:52:37.16294-07');
INSERT INTO public.editable_content VALUES (84, 'My feelings are mixed. I do believe in giving as directly as possible assuming least amount of admin overhead, providing aid & assistance to those in need as efficient and effectively as possible. That said, we do need to find more ways to get the word out on the issues and also wish the press would help. No Kings is nice but what is the overall vision here besides removing the King from office? How are our progressive leaders speaking to the benefits of decreasing global inequality (in a systemically broken government we can''t even address this in the US)? And lastly, how raising awareness benefits the givers ( spiritually, financially (tax break?), etc.) which I think should be part of any message since most people, like it or not, prioritize self interest.', '[]', '2025-10-23 11:28:21.615285-07', '2025-10-23 11:28:21.615285-07');
INSERT INTO public.editable_content VALUES (281, 'Agreed. We will also retain the withdrawal option specified in the contract to accommodate cases of significant deviation.', '[]', '2026-02-02 14:48:38.199711-08', '2026-02-02 14:48:38.199711-08');
INSERT INTO public.editable_content VALUES (209, 'Act locally! Quite a large number of cities and states launched a movement in the US "We are still in" , meaning still in the Paris agreement on climate change.  These cities and States were pledging to reduce their greenhouse gases emissions.', '[]', '2026-01-15 06:32:19.36591-08', '2026-01-15 06:32:19.36591-08');
INSERT INTO public.editable_content VALUES (85, 'I wasn''t particularly surprised by anything in the article, in the sense that if I sat down for a minute and thought about any of this, I would probably have predicted most of the information provided. Unfortunately, I have not in fact done that. I stopped donating regularly when I moved to a different country and took a massive pay cut (in exchange for things I found more valuable than money, of course) with a vague resolution to start again once I had the logistics set up, but then I never did, and completely forgot about it. In that sense, the article has changed the way I act, because I''m going to start donating regularly again.', '[]', '2025-10-23 16:25:42.867586-07', '2025-10-23 16:25:42.867586-07');
INSERT INTO public.editable_content VALUES (86, 'Good article. Not super surprising but always the sort of reminder that basically makes me feel positively about charitable giving. Sad to think of current USAID cuts and how much work would need to be done just to get us back to where we were a year ago. The whole concept of ''lifestyle creep'' and people feeling poor as a globally very rich American is interesting to think about: it''s hard to know how many struggling Americans are truly facing just super high costs of living vs. have an in some ways crazy high expectation of luxury that guides their spending. Re: the global average income that the article there''s always some question in my mind about how "global average income" as a figure exists in the context of things like global cost of living and exchange rates, and so I wonder if there'' some adjacent metric people use that''s more free of this for discussing relative amounts of poverty. Though luckily this sort of doesn''t matter when considering the impact that direct charitable giving can have, because exchange rates etc. work in our favor. ', '[]', '2025-10-23 18:17:11.824349-07', '2025-10-23 18:17:11.824349-07');
INSERT INTO public.editable_content VALUES (97, 'Like many others in this forum, I was not surprised by the scale of global inequality, nor was I surprised by the relatively low-cost initiatives that can easily improve standards of living and life quality across the globe. What did surprise me, though, was a) the fact that an annual post-tax income of $20,000 puts one in the global 10% and b) the relative effectiveness of direct cash transfers. To the first point, there has been much emphasis on the need to tax wealthy individuals — especially the ultra-wealthy — and redistribute that income, yet it is impressive and really heartening to see how much impact any single person in the developed world can have for the price of just two cups of coffee. As the article points out, if we reconceptualize our idea of who is “rich,” it may expand the pool of willing and eligible donors who can make the world better.
To the second point, the article discusses the foreign aid programs of countries like the US, the Gavi alliance, and other similar initiatives. I wonder if these programs — particularly USAID — would be more effective if they were to simply give an equivalent amount of aid in the form of cash transfers?', '[]', '2025-10-24 09:46:25.15163-07', '2025-10-24 09:46:25.15163-07');
INSERT INTO public.editable_content VALUES (100, 'We will pass this on to Bryan!', '[]', '2025-10-26 11:26:08.943834-07', '2025-10-26 11:26:33.429709-07');
INSERT INTO public.editable_content VALUES (103, 'Text is preferred. ', '[]', '2025-10-30 19:23:56.6138-07', '2025-10-30 19:23:56.6138-07');
INSERT INTO public.editable_content VALUES (108, 'hmmm', '[{"key": "1762973936500.webp", "url": "https://worldalliance.org/api/images/1762973936500.webp"}]', '2025-11-12 10:58:56.628015-08', '2025-11-12 10:58:56.628015-08');
INSERT INTO public.editable_content VALUES (87, 'I liked this article. I still felt surprised seeing the global median income statistic, even though I guessed within 1.5-2x of the correct figure when prompted to slow down and do so by the article. Even though I can rationally give a reasonable guess, the American mindset of what income is associated with poverty means that the instant reaction is still one of "wow....that number is really low". And I think that both that shock of trying to imagine billions of people worldwide living off of that income, as well as the realization that donating what feels like a small amount to you (i.e. someone from America/developed country) could be a significant percentage of someone''s yearly wage, are really strong motivators for one to give charitably. 

That being said, this just makes me think about exponential impacts that could be realized by targeting this type of message at the very very wealthy, even by American/developed country standards, as I think there exists a similar problem of average/median citizens of developed countries underestimating the inequality between them and the financial elites of their countries. Like if every average citizen of a developed country can help, say, on the order of 10^2-10^3 people in the world''s poorest countries via direct aid, and an average centimillionaire could very comfortably part with life-changing money for 10^2-10^3 average Americans, then one could conclude that this said centimillionaire has the resources to directly benefit millions of lives, if they can be convinced/given the avenues to do so. I do think we all have the obligation to keep ourselves informed and help how we can, given the gaps we are either aware of or just newly made aware of, but additionally how/to whom we choose to pass this message on should be just as important an obligation.', '[]', '2025-10-23 21:16:32.644393-07', '2025-10-23 21:16:32.644393-07');
INSERT INTO public.editable_content VALUES (88, 'I always believed that there are huge inequities between nations. However the actual number is truly shocking. Governmental aids are effective in combating diseases in a large scale, while the model like DirectGive seems efficient in providing immediate relief to a family or community.  However, improving local economies and providing long term jobs would be a sustainable and self-propelling solution.

One note about the article. Citing the average income without the context of cost of living in different countries leaves holes in authors’ arguments. For example, one can hardly feel rich in California with $20000 annual income.', '[]', '2025-10-23 21:31:43.654536-07', '2025-10-23 21:31:43.654536-07');
INSERT INTO public.editable_content VALUES (89, 'It was truly surprising how low the global average median income is. 

What unfortunately wasn’t surprising was how few countries have upheld their promise of contributing 0.15% of their national income to least developed countries. Further the contributions are experiencing funding cuts. 

I think learning about the methods for donating and how easily accessible they are is promising, and honestly I wouldn''t mind donating small sums. But I think the biggest impact would result from many people doing this, ordinary everyday folks who can spare a few dollars. But how do we reach and convince them?

This also doesn’t address the obnoxious income and wealth disparities that exist, but it’s something. ', '[]', '2025-10-23 22:00:15.704991-07', '2025-10-23 22:00:15.704991-07');
INSERT INTO public.editable_content VALUES (90, 'It''s interesting to see the inequality numbers. After going to Africa for safari, it was clear that income inequality was massive. People there live on just a few dollars a day versus the average lunch in SF costing over $20. While there I was motivated to help the local people and the local tribes. Reading this article, I''m reminded that I should do more to help. ', '[]', '2025-10-23 22:11:40.694552-07', '2025-10-23 22:11:40.694552-07');
INSERT INTO public.editable_content VALUES (91, 'The inequality numbers written out are shocking, I have always known that the US has a lot more resources, but the raw numbers are definitely eye opening. Agreed that making people more aware of the stark differences between what they think countries like the US contribute vs how much they actually do could go a long way in ensuring that consistent aid is delivered to organizations. Definitely encourages me to do more, and sheds more light on the fact that every little bit does in fact help.  ', '[]', '2025-10-23 22:15:16.204275-07', '2025-10-23 22:15:16.204275-07');
INSERT INTO public.editable_content VALUES (92, 'The fact that the top 10% of income earners starts at a salary of 20k blew my mind. It’s interesting how most of us think of “the rich” as people wealthier than ourselves, when really most of the US is rich in the context of the world. This definitely strengthens the argument of why the US should contribute more money to foreign aid.', '[]', '2025-10-23 23:03:57.762933-07', '2025-10-23 23:03:57.762933-07');
INSERT INTO public.editable_content VALUES (93, 'Typing this on Siri, so there may be typos, but I enjoyed reading the article. I was particularly surprised by some of the statistics on the type of countries that were the most likely to provide money to the poor. I was surprised the only three countries met the United Nations targets. It was interesting that those countries were Luxembourg, Sweden, etc. I also was interested by the organizations call for more foreign aid. I wonder how they identified that intervention in particular and I wonder what type of foreign aid they would find most relevant and how does supporting foreign a compared to other interventions for instance Supporting cancer, breakthroughs or scientific research in one one’s home country and I wonder what the blog would think about supporting private companies versus nonprofit.', '[]', '2025-10-23 23:23:40.215166-07', '2025-10-23 23:23:40.215166-07');
INSERT INTO public.editable_content VALUES (94, 'For me, these were the most interesting tidbits:
- Foreign aid still dwarfs private philanthropy and is one of the biggest channels of global redistribution.
- [Americans] imagine they are only a little richer than the typical person worldwide, when they are vastly richer...The gap between perception and reality matters when it comes to foreign aid and charitable giving. Nair’s research revealed that correcting false beliefs can directly impact a person’s willingness to support people in poorer countries.

Wonder how we can make alleviate the perception gap to encourage giving. ', '[]', '2025-10-23 23:35:28.173292-07', '2025-10-23 23:35:28.173292-07');
INSERT INTO public.editable_content VALUES (95, 'It’s very interesting to see how wealth and income inequality breakdown worldwide. I was surprised by how much exponentially bigger the gaps were when the entire world is pictured compared to the data in the gaps in the US. It makes me think a lot about how widely different our lifestyles are from the majority of the world and how we often leave developing countries out of these conversations where we work towards equality, which is inherently unequal.', '[]', '2025-10-23 23:37:43.940802-07', '2025-10-23 23:37:43.940802-07');
INSERT INTO public.editable_content VALUES (96, 'I first learned of the scale of global economic inequality in a moral philosophy class that covered Peter Singer''s "child drowning in a shallow pond" analogy. Tl;dr - most people wouldn''t think twice about ruining their $100 shoes by wading into a pond to save a drowning child, so why aren''t they equally willing to donate $100 to an impoverished community and save even more lives. Our discussion on this paper drilled deeper into the perceived moral difference and exigence between saving the life of someone first hand and one who you are never likely to meet. These discussions and a few great Vlog Brothers (Hank and John Green) videos on the topic have shaped my beliefs on this topic today.

 I think that the best stewards of communities are participants in or members of that community, but am also compelled by the wild exchange rate between USD and other currencies. When donating to international non-profits, I hope that my funds are being used as effectively as possible, with spending decisions directed by true stakeholders in the community being supported (eg GiveDirectly). But even if they aren''t, the absolute difference in scale between currencies makes most "waste" inconsequential towards the ultimate goal of charity.', '[]', '2025-10-23 23:57:17.934932-07', '2025-10-23 23:57:17.934932-07');
INSERT INTO public.editable_content VALUES (115, 'After almost an hour, I hadn’t found any potholes on Pasadena city streets that seemed worth reporting, another piece of evidence in support of a view I’d formed over the course of many years, that Pasadena may actually be pretty well run, as far as cities go. Then I looked in Eagle Rock for about 40 minutes, including parking and looking at various areas more closely, and didn’t find any potholes worth reporting, although there were some really terrible, tripping-hazard sidewalks. Finally I found a couple potholes on Pasadena Ave at the very south edge of South Pasadena. They weren’t terribly egregious but at least I didn’t feel embarrassed reporting them. I spent last year in Houston and feel like I experienced a lot more potholes there.', '[]', '2025-11-20 12:18:04.119531-08', '2025-11-20 12:18:04.119531-08');
INSERT INTO public.editable_content VALUES (116, 'I used to believe in giving to charitable organizations as the best way to provide "support" for anyone I come across that seems homeless. I thought that the $ I gave directly might be wasted on drugs & alcohol which of course I did not support so given to charity seemed to make sense. My brother''s position was that although that could be true, if given directly you would definitely be providing relief to a person''s immediate pain & comfort and at least they''d be getting 100% of the $ (and may be used for drugs, food, clothing, etc.). So, since then, I have chosen both methods. I don''t believe there is a right or wrong approach, life is filled with grayness. Whatever you do, directly or indirectly, your care is what matters most. ', '[]', '2025-11-20 14:54:20.753222-08', '2025-11-20 14:54:20.753222-08');
INSERT INTO public.editable_content VALUES (117, 'Re: Eagle Rock sidewalks, you could try reporting through LA''s 311 ([https://myla311.lacity.gov/s/](https://myla311.lacity.gov/s/)), although I read elsewhere that these repairs can take awhile.', '[]', '2025-11-20 19:25:52.867037-08', '2025-11-20 19:26:48.027008-08');
INSERT INTO public.editable_content VALUES (118, 'Voting results:
* 23 members voted for “Top 5.” They mostly did so because they wanted to guarantee that the $1,000 was spent.
* 15 members voted for “75% approval.” They mostly did so because they wanted a strong chance that the $1,000 would be spent, but also wanted to satisfy a majority of members.
* No members voted for “100% approval.” Many members suggested that we should prioritize taking action over full consensus.', '[]', '2025-11-23 14:10:13.480207-08', '2025-11-23 14:10:13.480207-08');
INSERT INTO public.editable_content VALUES (170, 'Not that I am aware of. Also, I don''t believe that withdrawing from an organisation is the best way to improve it - especially for a large country like the US, that could have significant voice for change. Rather, institutions need to be strengthened by Member States by being active inside.  You need to ask, however, what is the purpose of such mass withdrawals from these organisations?  To make them better, or instead to deconstruct the international institutions created over the decades since WWII.', '[]', '2026-01-13 22:25:15.498494-08', '2026-01-13 22:45:54.06521-08');
INSERT INTO public.editable_content VALUES (179, 'I wouldn''t say a tide, but at least a backlash in environmental policies. In a world of competition the cost of energy is a very important factor. Adressing climate change means transitioning away from fossil fuels, which is  sometimes tricky or expensive.  When oil becomes  cheap in a major economy like the US because of unleashed extraction and denial of climate change, other economies  are driven to postpone or weaken their environmentl policies, and even to go back to oil, in order to compete on a level playing field.   ', '[]', '2026-01-14 06:21:09.155892-08', '2026-01-14 06:21:09.155892-08');
INSERT INTO public.editable_content VALUES (6, 'Actually I’m coming back to this because I’m not 100% sure I’d want to make a public comment on this. The main reason I put this “zone zero” comment was that, after an hour and a half of working on this assignment, it was the most “feasible-seeming” answer I could give that met assignment criteria. (I do think by spending 10 minutes it’s very hard to give a quality answer.)  I know something about and respect Howells, the fellow who wrote the underlying article, but I’m just not sure, given the enforcement difficulties. This troubled me so I have come back. I was more inclined to do something about the Elephant Hill Open Space in El Sereno, which meets the preventing environmental harm goal, albeit in my county, not my city; but after over an hour of researching I couldn’t find some ongoing project that seemed amenable to a public comment. Maybe the staff could? Here is an article link. https://www.latimes.com/travel/newsletter/2025-11-13/la-the-wild-elephant-hill-hiking-trail', '[]', '2025-09-07 14:38:42.683376-07', '2025-12-11 11:46:30.502415-08');
INSERT INTO public.editable_content VALUES (119, 'The most-approved proposals were:
1. Donate $1,000 to [Hurricane Melissa survivors](https://www.givedirectly.org/hurricanemelissa/) in Jamaica via GiveDirectly (28 members)
2. Donate $1,000 to [GiveDirectly](https://www.givedirectly.org/) (25 members)
3. Donate $1,000 to [Cool Earth](https://www.coolearth.org/) (24 members)
4. Donate $1,000 to [Feeding America](https://www.feedingamerica.org/) (19 members)
5. Donate $1,000 to the [Malala Fund](https://malala.org/) (19 members)
6. Give the office full discretion on how to use the $1,000 to grow the team (19 members)

The office decided to split the $1,000 between two initiatives. 
1. $600 was donated to [Cool Earth](https://www.coolearth.org/). This amount was calculated to offset a year of CO2 emissions for all current Alliance members.
2. $400 was donated to [GiveDirectly](https://www.givedirectly.org/). This amount will cover about 5 months of expenditure for a single household in Kenya, Malawi, Mozambique, Rwanda, or Uganda.

Donation receipts:
(Note: The donor chose to cover credit card fees so that Cool Earth and GiveDirectly would receive the full amounts.)

![Cool Earth receipt](https://worldalliance.org/api/images/1763935520222.webp)

![GiveDirectly receipt](https://worldalliance.org/api/images/1763935553152.webp)', '[]', '2025-11-23 14:12:27.572659-08', '2025-11-23 14:12:27.572659-08');
INSERT INTO public.editable_content VALUES (120, 'I like the explanation of how the fund was allocated. Thanks.', '[]', '2025-11-24 11:33:17.264201-08', '2025-11-24 11:33:17.264201-08');
INSERT INTO public.editable_content VALUES (121, 'No sign yet of the expected repair... 🙁', '[]', '2025-11-25 01:02:49.369402-08', '2025-11-25 01:02:49.369402-08');
INSERT INTO public.editable_content VALUES (122, 'Collectively, members found and reported 19 potholes in the United States and 1 crumbling wall in Switzerland.

By our estimate below of a $50 annual cost per pothole, we have prevented over ~$1,000 in expected damages.

If you''d like to share updates on the status of your reported potholes, you can do so in the discussion section below or on your personal action activity, which you can find on your profile.', '[]', '2025-11-26 11:43:01.83632-08', '2025-11-26 11:43:01.83632-08');
INSERT INTO public.editable_content VALUES (123, '2 Potoholes tracking status at Church/28th St.... still pending:

https://sfmta.tfaforms.net/157?case_num=1406409', '[]', '2025-12-01 14:46:41.077943-08', '2025-12-01 14:46:41.077943-08');
INSERT INTO public.editable_content VALUES (125, 'Wow Berkeley sent a crew to fix my reported pothole within 2 days! ', '[]', '2025-12-03 14:07:02.360262-08', '2025-12-03 14:07:02.360262-08');
INSERT INTO public.editable_content VALUES (126, 'Berkeley reported filled 2 days later, and I checked today. They patched some parts - it''s still a rough patch but better. I wonder if municipalities goodhart this a bit to check the box of ''responded'' so they are no longer liable', '[]', '2025-12-03 14:20:42.945284-08', '2025-12-03 14:20:42.945284-08');
INSERT INTO public.editable_content VALUES (127, 'According to SF 311 tracker, my pothole was repaired ~2 days after I reported it. Haven''t checked it out yet though.', '[]', '2025-12-03 17:45:58.292142-08', '2025-12-03 17:46:22.919139-08');
INSERT INTO public.editable_content VALUES (176, 'They are certainly not familiar with the "details".  But many leaders are continuously briefed on the key issues, especially as preparations for the meetings of the COPs approach, where Heads of States and Governments (HoSGs) have to participate in discussions, and sometimes decision-making. As part of the UN secretariats, I have participated in many events where HoSGs were interacting on climate change.  Many of them were very well briefed - others less so... Beyond the briefings, many leaders (past and present) are personally interested in addressing climate change (Lula, Merkel, Obama, Rudd - just to name a few)', '[]', '2026-01-13 22:58:54.291264-08', '2026-01-13 22:58:54.291264-08');
INSERT INTO public.editable_content VALUES (173, 'For now, all the rest of the State Parties are continuing their efforts undertaking Paris Agreement unchanged.  Depending on the continuation of US domestic policies against low-/zero-carbon energy and political and economic pressure on other countries, this may change over time. Some such developments are already visible (e.g., some weakening of ambition in the EU)', '[]', '2026-01-13 22:37:07.103356-08', '2026-01-13 23:00:24.125907-08');
INSERT INTO public.editable_content VALUES (180, 'Thank you for the confirmation :)
Unfortunately, I''ve not gotten texts so far - emails work fine though, am getting weekly task notifications. Double checked my settings and everything seems in order (text/SMS is enabled for everything, phone number has the prefix as well)', '[]', '2026-01-14 06:27:51.96419-08', '2026-01-14 06:27:51.96419-08');
INSERT INTO public.editable_content VALUES (213, 'While I have not seen any public confirmation from the UN depositary of a formal U.S. withdrawal from the UNFCCC, in principle the United States could still participate as a Party at the next COP. Should such a formal notification be submitted, it would only take effect one year after the date of receipt, in accordance with Article 25, paragraph 2, of the UNFCCC.

That said, based on what occurred in Belém, it is reasonable to assume that the United States will not be present at the negotiating table at the next COP. The immediate consequence is that the U.S. will not participate in decision-making. And, ultimately, climate negotiations are not climate action—the process is now moving toward implementation rather than methodology. As Brice says, act locally!', '[]', '2026-01-15 09:27:37.287712-08', '2026-01-15 09:27:37.287712-08');
INSERT INTO public.editable_content VALUES (246, 'Response from my city supervisors legislative aide:

--

Hi Akash,

This is awesome - thank you! Very happy to see we are aligned with limiting the TNCs on Market. Did you hear from Scott Feeny or Rishav Rout? I had passed on your contact info to them as they are supporters of Better Market. 

Re homelessness ask - let me connect with my colleague Jen, who staffs more on the Hairball and Bernal, because she will know the right contacts for homelessness. 

Re neighborhood asks - this is great, and is aligned with current efforts we are undertaking to get a list of priorities for each neighborhood. Jen from our office has been working with transit advocates there, including Mahdi I believe, and they recently shared a comprehensive proposal of their ask ... (cut off for brevity)', '[]', '2026-01-28 14:13:33.290069-08', '2026-01-28 14:13:33.290069-08');
INSERT INTO public.editable_content VALUES (282, '"I don''t doubt there being cases where gamification worked out - but wanting to do good purely as its own motivation is something I appreciate greatly."

This post really resonates with me and changed my perspective on this topic. I originally suggested gamification as a tactic for increasing action completion rates, as some people tend to be externally motivated. But you are right that it could attract the wrong members to the Alliance and end up hurting us in the long term. If people are really internally driven to make the world a better place, that is all the motivation they need to complete difficult tasks. The real reward comes from seeing the results of our actions and progress over time, as Grant highlighted in his post below.', '[]', '2026-02-02 20:49:13.366226-08', '2026-02-02 20:49:13.366226-08');
INSERT INTO public.editable_content VALUES (289, 'I did a search on Cowspiracy and came across [Ninety Minutes to Reduce One''s Intention to Eat Meat: A Preliminary Experimental Investigation on the Effect of Watching the Cowspiracy Documentary on Intention to Reduce Meat Consumption](https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2020.00069/full)—seems like a pretty influential documentary.

In the future, it would be neat to use Alliance actions to try to measure the helpfulness of this sort of education.', '[]', '2026-02-03 19:48:21.560569-08', '2026-02-03 19:51:43.1146-08');
INSERT INTO public.editable_content VALUES (262, 'A principle I would say is to Walk In Love. "And walk in love, as Christ loved us and gave himself up for us, a fragrant offering and sacrifice to God."

I would say that one of the most impactful ways we can be helpful is to each other.', '[]', '2026-01-30 12:52:38.745464-08', '2026-01-30 12:52:38.745464-08');
INSERT INTO public.editable_content VALUES (263, 'The total amount members expect to donate is over $2,000, more than four times our initial goal of $500.

We do not know the exact amount because some members do not know exactly how much unclaimed property they have, and there may be duplicate claims among members from the same family.', '[]', '2026-01-30 13:12:06.466319-08', '2026-01-30 13:13:41.692436-08');
INSERT INTO public.editable_content VALUES (124, '# Member oversight question

**94% of members** expected more than 80% of their contributions to result in outcomes they approve of. Therefore, [we cleared our 75% threshold](https://worldalliance.org/governance) for this oversight process.

# How we plan to address common feedback

**54% of members wanted more interaction with other members.** In the short term, we plan to facilitate greater interaction in our new [Groups](https://worldalliance.org/groups) feature (see the new “Groups” tab in the menu on the left) by encouraging group leads to facilitate small-scale discussions and organize meetings. In addition, for every action we plan going forward, we will consider potential discussion opportunities.  

**Many members wanted a single place to view important Alliance updates.** We will replace the Priorities page with a new [Information](https://worldalliance.org/information) page that describes our current priorities, relevant updates, and key resources (such as our upcoming FAQ).

**Some members could not complete actions while on vacation** due to a poor Internet connection. We added an “Away” feature to your [Settings](https://worldalliance.org/settings) page where you can schedule a period of time in which you are not expected to complete actions.

# Member opinions on actions

**We saw a large diversity of favorite and least favorite actions.** Clear favorites were [“Report a pothole in your community”](https://worldalliance.org/actions/50) (20 selections) and [“](https://worldalliance.org/actions/50)[Decide how to allocate $1,000 next week”](https://worldalliance.org/actions/47) (19 selections).

**There was a correlation between favorite and least favorite actions**; actions that were several members’ favorites were other members’ least favorites, such as [“Read and discuss an article about global inequality”](https://worldalliance.org/actions/26) (14 favorites, 5 least favorites) and [“Report a pothole in your community”](https://worldalliance.org/actions/50) (20 favorites, 6 least favorites).

# Willingness to invite new members

**The median willingness to invite new members was an 8/10.**

Soon, members will be able to invite new members through their [group](https://worldalliance.org/groups).', '[]', '2025-12-03 10:02:04.119683-08', '2025-12-03 10:02:04.119683-08');
INSERT INTO public.editable_content VALUES (130, 'Love to see it', '[]', '2025-12-08 16:00:00.412941-08', '2025-12-08 16:00:00.412941-08');
INSERT INTO public.editable_content VALUES (129, 'Awesome and very promising!', '[]', '2025-12-08 15:57:37.927012-08', '2025-12-08 16:04:56.106379-08');
INSERT INTO public.editable_content VALUES (131, 'I''m also in Berkeley; they sent one the morning after I reported it!', '[]', '2025-12-08 16:06:29.683531-08', '2025-12-08 16:06:29.683531-08');
INSERT INTO public.editable_content VALUES (132, 'Great coverage.   On the front page of a coffee store trade mag no less!   New stores may sign up for program after reading this.  Way to go Alliance!', '[]', '2025-12-08 17:15:52.41617-08', '2025-12-08 17:15:52.41617-08');
INSERT INTO public.editable_content VALUES (133, 'Real world impact, very cool', '[]', '2025-12-08 20:23:22.739894-08', '2025-12-08 20:23:22.739894-08');
INSERT INTO public.editable_content VALUES (128, 'Bhavi Patel, a journalist at Barista Magazine ("a destination for coffee professionals" with "tens of thousands of readers"), published an article about the bring-your-own cup cafe coalition we created: [https://www.baristamagazine.com/washington-cafes-are-uniting-to-combat-disposable-cup-waste-and-they-want-you-to-join-them/](https://www.baristamagazine.com/washington-cafes-are-uniting-to-combat-disposable-cup-waste-and-they-want-you-to-join-them/)

**Recall that media coverage was not itself the desired outcome of this action. The desired outcome was the cafes'' adoption of a sustainable policy**, which happened in advance because the cafes could count on Alliance members to help them achieve follow-up coverage. We have now fulfilled our promise to the cafes.

Recap of what happened:
1. The Alliance office created [https://byoc.cafe/](https://byoc.cafe/).
2. The Alliance office reached out to several cafes in the Renton, WA area, asking them to adopt and advertise a bring-your-own cup policy provided that Alliance members would help them attain media coverage.
3. The cafes agreed to adopt the policy and printed out flyers to advertise the policy to customers.
4. Alliance members signed a letter asking journalists to cover the coalition of cafes.
5. The Alliance office sent the letter to a few relevant journalists.
6. Bhavi interviewed some of the cafe owners and wrote the article.

![Barista Magazine article](https://worldalliance.org/api/images/1765237298519.webp)', '[]', '2025-12-08 15:52:34.756606-08', '2025-12-08 15:52:34.756606-08');
INSERT INTO public.editable_content VALUES (134, '**GiveDirectly**

Survey responses suggested 3 ways to improve GiveDirectly’s website:
1. Remove the interactive elements from the “Giving cash is” section.
2. Display recipient stories by default instead of placing them behind portraits.
3. Replace longer stories with short quotes.

We sent this information to Olivia, a senior manager of growth at GiveDirectly. Her response:

> Thanks so much for putting this together and sharing! Really helpful insights — several of them touching on improvements we''re currently making for the website, e.g. formatting for the recipient stories. We''re planning to move towards this new card design — will look into shortening the quotes as well based on your feedback.

![New GiveDirectly card design](https://worldalliance.org/api/images/1765308908685.webp)

In a follow-up call, Olivia indicated interest in future collaboration with the Alliance, e.g. to test strategies for word-of-mouth donation recommendations.

**New Incentives**

Survey responses indicated “Vaccinations Encouraged” was very confusing. A majority of members (18/30) guessed “Vaccinations Encouraged” meant the number of people to whom New Incentives recommended vaccinations. The intended meaning of "Vaccinations encouraged" is the number of vaccinations incentivized by corresponding cash transfers.

We sent this information to New Incentives’ Communications Manager. She thanked us for the information and indicated she would talk to her team and brainstorm ideas for more effective communication.

**Learning Alliance**

Members understood the goal of the Learning Alliance, but did not understand what the Learning Alliance actually did. A majority of responses (17/30) expressed difficulty in locating or understanding information, often complaining that it was buried in dense paragraphs.

We sent this information to the founders of the Learning Alliance. They thanked us for the feedback, which supported their own beliefs on how to improve their website. They are currently prioritizing new programs and training staff, but hope to revise their website in the first half of 2026.
', '[]', '2025-12-09 11:36:44.111993-08', '2025-12-09 11:36:44.111993-08');
INSERT INTO public.editable_content VALUES (135, 'Yay', '[]', '2025-12-10 19:17:27.441836-08', '2025-12-10 19:17:27.441836-08');
INSERT INTO public.editable_content VALUES (174, 'Yes, many.  The US departing from the IPCC, for example, does not necessarily stop US scientists from contributing to the IPCC''s efforts directly or indirectly. Philanthropy can help to fill the financial gaps in the budgets of the UNFCCC and the IPCC, and in some cases also pay the salaries of scientists, whose funding may have disappeared.  An other important departure of the US is from the Green Climate Fund - and there also, philanthropy can help - at least for some time. And there are many non-state actors, such as local authorities (e.g., State of California, cities worldwide, etc.) which can do a lot, and they have clearly said they would.', '[]', '2026-01-13 22:40:42.438041-08', '2026-01-13 23:01:41.47459-08');
INSERT INTO public.editable_content VALUES (169, 'The US is a top emitter currently (about 12% of global) and historically  (about a quarter of all emissions to date).  Withdrawal from UNFCCC and IPCC does not automatically result in emissions increasing.  However, it is the domestic  policies the current administration has put in which at best slow down emission cuts (e.g., through renewables) and at worse actually increase US emissions.  And while that will make a difference, in terms of global total, it is not huge. A potential secondary effect of other countries being discouraged by the US from high ambition in their emission cuts, could result in additional emission cuts being avoided. We can see many examples of such weakening of efforts, such as in the EU.  The challenge is that at a time when global emissions should be dropping rapidly to stay within the 1.5-2C goal of the Paris Agreement, the total result of US actions will slow down the overall efforts.', '[]', '2026-01-13 22:24:37.423024-08', '2026-01-13 23:11:48.367203-08');
INSERT INTO public.editable_content VALUES (181, 'We''ve never seen such a systematic withdrawal. But in the past there were some multilateral conventions the US didn''t join, like the law of the sea (UNCLOS) which is strong and functional in spite of the absence of the US', '[]', '2026-01-14 06:29:17.282915-08', '2026-01-14 06:29:17.282915-08');
INSERT INTO public.editable_content VALUES (341, '> I think it''s useful to seriously consider making solving huge global problems - including quite urgent ones - the alliance''s and our individual responsibilities.

Agreed, especially because nobody else in the world has assumed responsibility for their resolution (many dedicated people make important progress on these issues all the time, but nobody has stepped up to assume responsibility for the problems in full - who would or could?).

It sounds highly ambitious to assume this responsibility, and it is, but the classic advice is that if we want something to get done, the "buck" must stop somewhere.', '[]', '2026-02-05 10:45:39.32531-08', '2026-02-05 10:45:54.378634-08');
INSERT INTO public.editable_content VALUES (136, 'Overall, our survey revealed that:
1. Most members were uncomfortable with their data being used to train AI.
2. Most members were unaware of settings that allowed them to control whether their data was used to train AI.

28 of 34 respondents used ChatGPT. 19 of those 28 respondents did not want their data used for AI training. However, only half of those respondents had already switched off the relevant setting.

26 of 34 respondents used Meta products. 23 of those 26 respondents did not want Meta to use their data for training, including some members who were OK with OpenAI using their data for training.

Several members who did not want Gemini to be trained on their conversations did not toggle the relevant setting because the same setting controls whether Google erases chat histories.

Given these results, we are launching a [follow-up action](https://worldalliance.org/actions/56) to invite more people to complete our survey.', '[]', '2025-12-15 21:25:01.282875-08', '2025-12-15 21:25:01.282875-08');
INSERT INTO public.editable_content VALUES (137, 'Associated action: [https://worldalliance.org/actions/54](https://worldalliance.org/actions/54).

Please answer the following questions about your public comment:
1. What was your issue of concern, and why did you choose it?
2. What was your proposed solution, and why did you choose it?

Remember to go back to your "Tasks" page and complete the action after you have contributed to the discussion.', '[]', '2025-12-23 20:54:29.609072-08', '2025-12-23 20:54:29.609072-08');
INSERT INTO public.editable_content VALUES (138, 'There was no option for choosing your country / phone number''s registered country, so I included the international call prefix when inputting my phone #. I assume this is wanted for people outside the US, but am leaving this comment just in case :)', '[]', '2025-12-30 11:06:07.794836-08', '2025-12-30 11:06:07.794836-08');
INSERT INTO public.editable_content VALUES (139, 'This is most likely over by now, but in case anyone reads it in the future I''ll leave a couple things I changed a few years back, ending w/the mindset that brought me there. Hope it sparks similar ideas if this seems like something worthwhile ;)

Instead of going vegetarian or vegan or the like, which is not really for me, I instead only *mostly* eat like one would. Like most everything, diets are also more than just a binary of y/n options. In other words many of my meals consist of, or at the very least include, what would normally be seen as "vegan" things (moreso than they did before I mean). A similar and halfway common version of this is having "fruit Friday", or some such, instead of changing one''s regular diet.

Another change was that when I do buy meat, I tend to choose fish/poultry (birdmeat) over pork/lamb over beef. I still eat all types, however pork, lamb, and even more so beef have a much much heftier negative impact (e.g. on the environment) - thereby choosing them less often eliminates most of the negative consequences, even if I were to not eat more vegan meals otherwise.

It''s a nice compromise that I''ve seen can work for many that otherwise don''t change their lifestyle, not because they don''t want to but simply because turning full on vegan is too much for them & they simply didn''t think of the fact that you don''t have to go all the way. Sometimes 20% of the effort can bring 80% of the result ^_^', '[]', '2025-12-30 12:03:02.503934-08', '2025-12-30 12:03:02.503934-08');
INSERT INTO public.editable_content VALUES (140, 'Mark and I have a similar attitude towards meat consumption.', '[]', '2025-12-31 17:12:28.891612-08', '2025-12-31 17:12:28.891612-08');
INSERT INTO public.editable_content VALUES (141, 'This reminded me of my experience of China’s cities (e.g., Guangzhou) which were often incredibly green and lush and felt quite futuristic in this sense. I remember seeing watering trucks quite frequently throughout the day. I’m not saying this doesn’t have drawbacks (maybe requires careful local ecosystem research etc) but that I feel this is a vision of the possible future that we were sold in the past and haven’t realized, but that other places have invested in (i.e., it’s possible). At least we got self-driving cars xd', '[]', '2026-01-04 15:51:01.256978-08', '2026-01-04 15:51:01.256978-08');
INSERT INTO public.editable_content VALUES (142, 'Just read about Guangzhou''s  Yuejiang Ecological Belt, very neat: [https://www.gz.gov.cn/guangzhouinternational/government/honoursandawards/content/post_7400800.html](https://www.gz.gov.cn/guangzhouinternational/government/honoursandawards/content/post_7400800.html)', '[]', '2026-01-06 11:22:10.17994-08', '2026-01-06 11:22:10.17994-08');
INSERT INTO public.editable_content VALUES (143, 'For those of you living in SF, Recology linked to this website for locations that accept various recycled objects (including e-waste). https://www.sfenvironment.org/sfrecycles', '[]', '2026-01-07 09:16:33.431032-08', '2026-01-07 09:24:15.339704-08');
INSERT INTO public.editable_content VALUES (144, 'Just wanted to share - got a quick response from OneShoreline after I submitted my comment on their work helping San Mateo County develop sea level rise mitigation strategies! ', '["1767845129901.webp"]', '2026-01-07 20:05:30.096539-08', '2026-01-07 20:05:30.096539-08');
INSERT INTO public.editable_content VALUES (145, 'I also got an acknowledgment from Arcadia city council.
', '["1768022634715.webp"]', '2026-01-09 21:23:54.926338-08', '2026-01-09 21:23:54.926338-08');
INSERT INTO public.editable_content VALUES (146, '', '["1768026806400.webp"]', '2026-01-09 22:33:26.531784-08', '2026-01-09 22:33:26.531784-08');
INSERT INTO public.editable_content VALUES (151, 'I got two responses from Berkeley + an ask for further suggestions + copied in relevant people who work on this.', '["1768262660962.webp"]', '2026-01-12 16:04:21.093463-08', '2026-01-12 16:04:21.093463-08');
INSERT INTO public.editable_content VALUES (147, 'I asked ChatGPT and got the answer below. It may not be accurate, but the big picture should be more or less correct.  It seems there is still a lot needed to be improved.

————
Global Reality (Summary)

	•	~20% of global e-waste is formally recycled
	•	~80% is landfilled, incinerated, informally recycled, or undocumented
	•	Even “recycled” e-waste often crosses borders multiple times
————
E-waste does not end up in a single place; its final destination depends on how and where it is collected, processed, and regulated. In practice, e-waste typically follows one of five paths:
⸻

1. Certified Recycling Facilities (Best-Case Outcome)

In countries with strong enforcement (e.g., U.S., EU, Japan):
	•	E-waste is processed by certified recyclers (R2, e-Stewards).
	•	Devices are:
	•	Manually dismantled
	•	Components sorted (plastics, circuit boards, metals)
	•	Materials are sent to specialized downstream processors:
	•	Precious metals → smelters/refiners (often in Canada, Germany, Belgium, Japan)
	•	Plastics → plastic reprocessors
	•	Glass → leaded glass treatment (for CRTs)

End result: Materials re-enter manufacturing supply chains.

⸻

2. Export to Developing Countries (Common but Problematic)

A significant share of global e-waste is exported—legally or illegally—to:
	•	West Africa (Ghana, Nigeria)
	•	South Asia (India, Pakistan)
	•	Southeast Asia (Vietnam, Thailand, Indonesia)
	•	China (historically; now restricted)

Often labeled as “used electronics” or “donations.”

End result:
	•	Valuable metals extracted
	•	Non-valuable or toxic residues dumped or burned

⸻

3. Informal Recycling Operations (High Environmental Cost)

In many importing countries:
	•	Devices are dismantled by hand
	•	Metals recovered using:
	•	Open-air burning
	•	Acid leaching
	•	Workers often lack protective equipment

End result:
	•	Soil, air, and water contamination
	•	Severe health impacts
	•	Only ~20–30% of material value recovered

⸻

4. Landfills and Incinerators (Still Happens)

Despite recycling programs:
	•	Some e-waste is:
	•	Incorrectly disposed of
	•	Rejected by recyclers due to cost
	•	Ends up in:
	•	Municipal landfills
	•	Waste-to-energy incinerators

End result:
	•	Toxic metals (lead, mercury, cadmium) can leach or volatilize
	•	Permanent material loss

⸻

5. Data Destruction and Refurbishment Path

Higher-value devices (phones, laptops, servers):
	•	Are refurbished and resold domestically or internationally
	•	Components reused or harvested

End result:
	•	Extended device lifespan
	•	Reduced material extraction demand

⸻

Global Reality (Summary)
	•	~20% of global e-waste is formally recycled
	•	~80% is landfilled, incinerated, informally recycled, or undocumented
	•	Even “recycled” e-waste often crosses borders multiple times

⸻

How to Ensure E-Waste Ends Up Responsibly

If this is actionable for you:
	1.	Use R2 or e-Stewards certified recyclers
	2.	Avoid vague “free recycling” programs with no transparency
	3.	Prefer manufacturer take-back programs
	4.	Ask where downstream processing occurs', '[]', '2026-01-10 10:07:17.23473-08', '2026-01-10 10:08:25.339014-08');
INSERT INTO public.editable_content VALUES (148, 'I got a response from Arcadia Unified School District Board of Education.', '["1768106431199.webp"]', '2026-01-10 20:40:31.358061-08', '2026-01-10 20:40:31.358061-08');
INSERT INTO public.editable_content VALUES (149, 'thanks for pointing that out! (and sorry for the late reply, we dont have good notifs set up for this yet). putting the full number including international prefix should work fine and is exactly what we expect, but we should definitely add a comment clarifying. let us know if you don''t end up getting text notifications or if something goes wrong though!', '[]', '2026-01-12 15:21:15.38843-08', '2026-01-12 15:22:24.250696-08');
INSERT INTO public.editable_content VALUES (150, 'true', '[]', '2026-01-12 15:38:39.372234-08', '2026-01-12 15:38:39.372234-08');
INSERT INTO public.editable_content VALUES (152, 'Members brought in a total of 122 external respondents. The members who brought in the most respondents were:
1. [Xiuqin Wu](https://worldalliance.org/member/21) (18)
2. [Janos Pasztor](https://worldalliance.org/member/33) (16)
3. [Bryan Xu](https://worldalliance.org/member/20) (14)

Of the 88 respondents who use ChatGPT, 72% did not want OpenAI to train AI models on their conversations. 54% of those who did not want their data used for training turned off the setting immediately.

Most (78%) of respondents use Meta products and 94% of those individuals did not want Meta to train AI models on their information. 

These results are consistent with our findings from the member-only survey.

The office’s next step is to share these results with journalists.', '[]', '2026-01-12 18:22:24.114478-08', '2026-01-12 18:24:30.272216-08');
INSERT INTO public.editable_content VALUES (182, 'What would you say are the biggest impacts of the current US''s "anti-multilateralism" - for lack of a better term - attitude?
More precisely, I am interested in consequences you feel are often overlooked or otherwise understated.', '[]', '2026-01-14 08:16:51.119296-08', '2026-01-14 08:16:51.119296-08');
INSERT INTO public.editable_content VALUES (264, 'I strongly agree w/this. To me, there being good in the world or things improving aren''t laws of the cosmos - guarantees, common sense, something to just be expected, or whatever other way one could phrase it. It''s not impossible for things to improve; it is possible. But for that possibility to become a reality, quite often in my opinion, someone actually has to work for it. Things CAN improve... if there''s effort put into improving things.', '[]', '2026-01-31 07:19:14.654582-08', '2026-01-31 07:19:59.454466-08');
INSERT INTO public.editable_content VALUES (229, 'How could interaction between countries look like from now on, given that this withdrawal appears to signal the current U.S. government''s distaste for friendly, non-binding international cooperation? 

It appears that globally, nationalism is rising, while interest in globalism (free trade, climate change, etc) seems to be waning. What are the potential consequences of the U.S. antagonizing other countries through these actions? ', '[]', '2026-01-18 19:05:21.902747-08', '2026-01-18 19:05:21.902747-08');
INSERT INTO public.editable_content VALUES (265, 'I adore, a strong word I know but it''s the truth, that gamifying is explicitly stated as not being on the agenda [as of writing]. Intellectually speaking I can see how it would serve as a great incentive for increasing completion rate, as well as member count, but I can also see many a way in which it could backfire and be a reason for its end if overdone.

Perhaps it''s my bias speaking because I''ve seen similar things happen in the past - I don''t doubt there being cases where gamification worked out -  but wanting to do good purely as its own motivation is something I appreciate greatly. Getting gratification out of external reasons, rather than simply acting out of a want to do good, often times leads to a slow and gradual goal misalignment [in my opinion]. Slowly priorities shift, in large part due to the brain simply starting to associate the "good" part of trying to do good with the game-like rewards; it doesn''t help that that results in emotionally feeling well for the reward rather than the act itself.
I also believe that said lack of extrinsic motivators is not only a simple but also a great way to achieve high completion rates on tasks. It serves as a filter - the people who join the Alliance do so purely out of wanting to contribute to its goals, not for any other reason. Those who sign on as members are thereby inherently more self-motivated, naturally resulting in a high completion rate.

Two guides to my internal compass that I like to always keep in mind are the following:
- the Golden Rule, "Do unto others as you would be done unto yourself"
- and quote/saying/belief, “Shoot for the moon. Even if you miss, you''ll land among the stars.”
Both to me are as beautiful as they are simple. Help - out of no other reason than you yourself would [likely] want to be helped. Strive for ideals, even if you fail you''ll at least have made some difference (or lacking even that, have the knowledge that you tried). I''m under no illusion that I''ll save the world, but I do not deny the fact that I sometimes do have the power to help in smaller and/or localized scales. Do I believe the Alliance can save the world? No, chances are it never will do something so grand, but I can *envision* a future where such an organization of people affects the globe positively. Whether it actually does or not aside, it already has smaller effects today - which in of itself is worth it to me.
TL;DR - find your own reasons that intrinsically motivate you to do good. If you believe the Alliance does/has the potential to do good, then engaging with the Alliance will be a natural thing to do.', '[]', '2026-01-31 08:17:26.481257-08', '2026-01-31 08:17:26.481257-08');
INSERT INTO public.editable_content VALUES (153, 'On January 7th, 2026, the U.S. decided to [withdraw from 66 international institutions](https://www.whitehouse.gov/presidential-actions/2026/01/withdrawing-the-united-states-from-international-organizations-conventions-and-treaties-that-are-contrary-to-the-interests-of-the-united-states/). Among these institutions are the [UNFCCC](https://en.wikipedia.org/wiki/United_Nations_Framework_Convention_on_Climate_Change) and [IPCC](https://en.wikipedia.org/wiki/Intergovernmental_Panel_on_Climate_Change).

The office has arranged for 4 experts to answer members’ questions about international cooperation:

- [Fareed Yasseen](https://en.wikipedia.org/wiki/Fareed_Mustafa_Kamil_Yasseen), former Iraqi Ambassador to the United States; former Iraq Climate Envoy and adviser to the Prime Minister on climate change.
- [Janos Pasztor](https://en.wikipedia.org/wiki/Janos_Pasztor_\(diplomat\)), former UN Assistant Secretary-General for Climate Change.
- [Brice Lalonde](https://en.wikipedia.org/wiki/Brice_Lalonde), former French Minister of the Environment; Executive Coordinator of United Nations Conference on Sustainable Development.
- [Laurence Pollier](https://fr.linkedin.com/in/laurence-pollier-cc2024), former UNFCCC Subsidiary Body for Implementation Coordinator.

Post your questions below. Topics that may be of interest:
- Consequences of the U.S. withdrawal (e.g. on agenda-setting, funding, scientific expertise, specific countries’ attitudes towards cooperation, global balance of power, biosphere)
- Contextualization of U.S. withdrawal (e.g. how it relates to the U.S.’s previous withdrawal from the Paris Agreement)
- What can be done next, and by whom
- Successes and limitations of international cooperation on climate change and other issues
- The experts’ general beliefs and experiences

These experts are on the Alliance platform and will aim to answer all questions that are asked throughout the next week.', '[]', '2026-01-13 14:25:37.902047-08', '2026-01-13 14:25:37.902047-08');
INSERT INTO public.editable_content VALUES (154, 'In your experience(s), how familiar are various world leaders and other officials with the details of UNFCCC conference proceedings/recommendations/outcomes?', '[]', '2026-01-13 15:33:22.073124-08', '2026-01-13 15:35:21.367272-08');
INSERT INTO public.editable_content VALUES (155, 'Historically, how influential was the US specifically as a member of the UNFCCC and/or IPCC (as compared to other countries or nation-states)?', '[]', '2026-01-13 18:12:18.478657-08', '2026-01-13 18:13:22.405601-08');
INSERT INTO public.editable_content VALUES (156, 'In your mind(s), are there any historical events similar to this mass withdrawal?', '[]', '2026-01-13 18:30:22.336217-08', '2026-01-13 18:31:22.576208-08');
INSERT INTO public.editable_content VALUES (157, 'To what extent has the U.S. souring on international climate cooperation over the last few years contributed to a general tide of other countries expending less effort addressing climate issues, or has the U.S. mainly acted alone with international cooperation otherwise remaining strong?', '[]', '2026-01-13 18:35:02.938342-08', '2026-01-13 18:35:02.938342-08');
INSERT INTO public.editable_content VALUES (158, 'US is one of the major CO2 emission sources. In your opinion, how severely will US’s withdrawal from Climate Change protocols impact the world’s efforts?', '[]', '2026-01-13 18:38:51.556515-08', '2026-01-13 18:38:51.556515-08');
INSERT INTO public.editable_content VALUES (160, 'What is the general attitude that Iraqis have (and had at the time) to the US invasion? I imagine they have been quite negative, but it would be nice to put more color to that description in my head.

I would also be interested to better understand how the general attitude towards the US invasion has changed over time.', '[]', '2026-01-13 18:41:45.829076-08', '2026-01-13 18:41:45.829076-08');
INSERT INTO public.editable_content VALUES (161, 'The current US administration posed a deep cut on fundings for climate and environmental research. Will it have a significant impact on IPCC?', '[]', '2026-01-13 18:44:12.435283-08', '2026-01-13 18:44:12.435283-08');
INSERT INTO public.editable_content VALUES (162, 'Are there ways that people in the US (scientists, funders, city/state governments, etc.) could still contribute meaningfully to international cooperation on climate change?', '[]', '2026-01-13 19:00:30.158767-08', '2026-01-13 19:00:30.158767-08');
INSERT INTO public.editable_content VALUES (163, 'How do you think the US withdrawals will impact the attitudes and contributions of other countries, especially those who emit significantly less carbon than the US?', '[]', '2026-01-13 19:32:36.052851-08', '2026-01-13 19:32:36.052851-08');
INSERT INTO public.editable_content VALUES (164, 'What legal and non-legal consequences can other nations impose or enforce against the US for its unilateral withdrawal from international agreements and norms? If no consequences, how can other nations be expected to abide by these agreements and norms in the future?', '[]', '2026-01-13 19:33:49.110695-08', '2026-01-13 19:34:32.932914-08');
INSERT INTO public.editable_content VALUES (165, 'To add to this: if there have been any similar historical events to the US withdrawals, have you ever seen any of them lead to a stronger system afterward?', '[]', '2026-01-13 19:40:16.391795-08', '2026-01-13 19:40:16.391795-08');
INSERT INTO public.editable_content VALUES (166, 'How much irreversible damage will be done assuming the US rejoins in a future administration 3 years from now?', '[]', '2026-01-13 19:41:02.770523-08', '2026-01-13 19:41:02.770523-08');
INSERT INTO public.editable_content VALUES (167, 'To add: are there any roles that the US formerly filled that no other countries are able to?', '[]', '2026-01-13 19:41:28.40137-08', '2026-01-13 19:41:28.40137-08');
INSERT INTO public.editable_content VALUES (168, 'Yes, it will.  The core budget of the IPCC is small - a few million dollars a year.  Funding is voluntary from various sources.  The US Gov. has been providing ¼ to a ⅓ of these funds.  So, if it disappears, it has an impact.  On the other hand, the amount in an absolute sense is small, therefore it can be made up from other sources over time.', '[]', '2026-01-13 22:15:54.614927-08', '2026-01-13 22:15:54.614927-08');
INSERT INTO public.editable_content VALUES (171, 'There is some debate between lawyers on whether the US can easily rejoin the UNFCCC or not.  But notwithstanding this debate, the US - if willing - will find a way to rejoin.  If it takes time, decisions may be made by the COPs the US may not like. But none of these are truly irreversible.  However, it is fair to say that breaking things is easier than rebuilding new.  ', '[]', '2026-01-13 22:30:08.570691-08', '2026-01-13 22:30:08.570691-08');
INSERT INTO public.editable_content VALUES (230, 'In what ways can the United States remain competitive while responding to the economic, strategic, and diplomatic pressures of China’s clean-energy leadership? Does this pressure push the U.S. government to improve in the future?', '[]', '2026-01-18 22:19:46.061535-08', '2026-01-18 22:36:10.020846-08');
INSERT INTO public.editable_content VALUES (172, 'There are no legal consequences.  The UNFCCC treaty has articles that allow State Parties to withdraw.  The US would be expected to follow the procedures in those articles.  Non-legal consequences is an other matter altogether - especially since these would be against the world''s largest economy (at least for now) and the world''s largest military power.  Nevertheless, if other State Parties cooperate, one could expect actions like non-investing in certain sectors; not inviting the US for certain activities, etc.  However, in my view these would not be helpful. ', '[]', '2026-01-13 22:34:44.470688-08', '2026-01-13 22:34:44.470688-08');
INSERT INTO public.editable_content VALUES (175, 'Not that I am aware of.', '[]', '2026-01-13 22:42:16.86669-08', '2026-01-13 22:42:16.86669-08');
INSERT INTO public.editable_content VALUES (177, 'The US has always played important roles, both in the IPCC and the UNFCCC.  So much of the science has been US driven/developed. But this is changing and also accelerated by US domestic actions to reduce funding for climate science. At the same time, the opposite is happening in China.  The US has always participated in the COPs in serious numbers. There was a time (long time ago) when China had just 2 delegates coming to the COP. Now it is many hundreds.  The world is changing!  The US often played key roles to move the agendas forward, but not always necessarily in ways that helped the overall climate objectives. For example, the US negotiated hard to make the Kyoto Protocol as weak as possible, and once it achieved that, it went ahead, and did not ratify it.  For the Paris Agreement PA), the US was very helpful, for example to engage with China (the G2), but it was US insistence to make the emission reductions voluntary and not legally binding that weakened the PA... etc....', '[]', '2026-01-13 23:31:38.144969-08', '2026-01-13 23:31:38.144969-08');
INSERT INTO public.editable_content VALUES (183, 'Among laymen it appears to me as though it''s a somewhat common opinion that such actions (i.e. withdrawing from international organizations) are essentially done out of the current US''s simple albeit aggressive money-first stance. Could you, as people that have been *actually* involved in international issues themselves, please give your thoughts on the matter?
One of many justifications for holding this belief is that the US even pulled out of the UN organizations Children in Armed Conflict and Violence Against Children, which [to my knowledge] are solely focused on protecting children and have no goals outside of that. The argument here being that if you withdraw from of those you care about the "lost" money of cooperating with them more important than the safety of children. This question doesn''t specifically pertain to these two organizations, however if you have any comments on this topic I would love to hear them as well! :)', '[]', '2026-01-14 08:17:11.113149-08', '2026-01-14 08:17:11.113149-08');
INSERT INTO public.editable_content VALUES (184, 'A sentiment that''s somewhat starting to gain traction, at least among my circle of friends, is that there''s a certain positive aspect to the US being so "unfriendly" and aggressive. That being that certain figures, political or otherwise, are being all but forced to cut relations with the US  - further leading to, in our case, more self-reliance for the EU. This coming from the fact that the aforementioned figures can''t deny or gloss over the US''s unsavory actions anymore, because of their blatant disregard for both its own as well as internationals laws and agreements.
Perhaps it''s the naivety of youth, since I am one and my friends likewise are, but we''re searching for silver linings in an otherwise bad situation. If I could have your takes on this I would greatly appreciate it!', '[]', '2026-01-14 08:17:42.602447-08', '2026-01-14 08:17:42.602447-08');
INSERT INTO public.editable_content VALUES (185, 'Provided it''s not considered too off-topic, how do you feel about COP''s workings and accomplishments?
COP has had [as far as my understanding goes] less than stellar results in the past few years, which isn''t helped in the least by the many lobbyists attending - to the point that I''ve heard that some members of the UNFCCC are even planning to hold a new conference (hosted by Colombia and the Netherlands), with the wishes and intent to get more concrete results. Additionally, provided you''ve heard of the "First International Conference on the Just Transition Away from Fossil Fuels", I would like to know what you think might come of it as well.', '[]', '2026-01-14 08:17:59.082069-08', '2026-01-14 08:17:59.082069-08');
INSERT INTO public.editable_content VALUES (186, 'There are many ways to address this issue.  I would like to start with the responsibility of the Parties to the UNFCCC. The "COP" is nothing more than the conference of the Parties - or put an other way, the meeting of the Parties to the UNFCCC.  They do this once a year, and they make decisions, agree on budgets, etc.  So the first point I would like to make is that let us not look at the accomplishments of the  COP, but rather those of the Parties (ie states, and some regional economic organisations) and judge what they bring to the collective. If the Parties are not ready for high ambition, they will simply ensure that no COP decision can emerge that requires countries to be more ambitious than what they are prepared for.

An other way is to look at the efficiency of the COP process, and see to what extent it could be improved to help Parties to come to good (ambitious decisions). There are many ideas for such "efficiency" improvements, including limiting the total size of the COPs (not much success on that); agreeing to a voting system so that not all decisions would have to be made by consensus (there have been efforts to do this for the last 3 decades, so it needs serious political support to make this happen); encouraging groups of countries (ie not the totality of Parties) to agree on specific measures (such as the Colombia-Netherlands initiative); etc.   And there is a lot more....', '[]', '2026-01-14 08:32:12.014022-08', '2026-01-14 08:32:12.014022-08');
INSERT INTO public.editable_content VALUES (187, 'US withdrawal from these entities has nothing to do with their costs to the US taxpayer.  The costs in total are just a few billions, which is really peanuts for a large government like the US.  I would suggest that part of the reason is ideological (as expressed by the president) and part of it is a show, a demonstration of the new policy to ignore international organisations, and and also international law.', '[]', '2026-01-14 08:35:28.72003-08', '2026-01-14 08:35:28.72003-08');
INSERT INTO public.editable_content VALUES (188, 'The US has been the main actor building up the international system as we know it during the decades since WWII (the international law, norms, and the institutions that support those), so having the "mother" of all this now quit makes multilateral work that much more difficult. It is not impossible - and in some cases, the absence of the US can make the negotiations easier (at least in the short term) - but the remainder of the international community will have to rebuild the institutions and processes to enable good progress without such a significant country.', '[]', '2026-01-14 08:41:59.033509-08', '2026-01-14 08:41:59.033509-08');
INSERT INTO public.editable_content VALUES (207, 'Donald Trump has often denied the reality of climate change, and in his first presidency has already withdrawn the US from the Paris climate agreement of 2015.  As for the other 65 organizations, I think it is rather a surprise to see so many withdrawals in one go, but we know the President disregards most international organizations and thinks they don''t offer value for money.
What are the interests of the US for now?   It''s for each of you to answer. I suppose the President wants to implement a MAGA policy in his personal way and that he believes the US can stand alone in today''s world.', '[]', '2026-01-15 06:09:51.540828-08', '2026-01-15 06:09:51.540828-08');
INSERT INTO public.editable_content VALUES (208, 'For the time being the other large economy that is still complying with the United Nations Climate Change agreement, and more generally advocates  a orderly multilateral world,   is China. China  is actually championing green technologies but it is reluctant to assume a role of leadership.  The European Union would probably want to play that role, but its economy is lagging and it must decide whether it wants to become a federation or stay a loose union of sovereign states', '[]', '2026-01-15 06:27:11.348503-08', '2026-01-15 06:27:11.348503-08');
INSERT INTO public.editable_content VALUES (189, 'To build on Janos’ response, I would like to elaborate on the decision-making process under the UNFCCC. All decisions are taken by consensus. While there is no formal definition of consensus, in UN practice it refers to the adoption of decisions by general agreement, in the absence of any formal objection. This means that, for a decision to be adopted by the COP (as well as the CMP and the CMA), no Party raise its flag to object.

Decisions are taken by consensus because Parties have been unable, since COP1, to agree on voting rules as set out in the draft Rules of Procedure. As a result, the draft Rules of Procedure are applied with the exception of the rule on voting. In the absence of voting, consensus remains the only means of adopting decisions.

At the closing of COP30, the COP President announced the creation of two “roadmaps” (1) halting and reverting deforestation and 2) transitioning away from fossil fuels. Politically, these roadmaps played an important role in helping to calm concerns and in bringing the room to closure. They mattered in that moment. But once the plenary ends, we return to the fundamentals of how the UNFCCC process works: under the draft Rules of Procedure, a COP President’s authority is procedural. Presidencies can steer, convene and facilitate consensus — often in very challenging circumstances — but they cannot create new mandates on behalf of Parties.

In this case, the roadmaps were not presented for adoption, and consequently they do not carry formal status within the UNFCCC process. They remain Presidency initiatives, with political value for those who choose to engage with them, but they do not create obligations for Parties or for the Governing and Subsidiary Bodies unless and until Parties decide otherwise.  Presidency initiatives can help unlock difficult moments — and sometimes they are essential to getting us over the line. But once the gavel falls, it is important to distinguish political gestures from procedural mandates.  That clarity maintains trust in the process and preserves the legitimacy of the consensus Parties are working so hard to achieve.', '[]', '2026-01-14 09:27:45.111214-08', '2026-01-14 09:27:45.111214-08');
INSERT INTO public.editable_content VALUES (190, 'To what extent can the EU''s weakening of ambition be attributed to the US vs. its own societies and politics (which are themselves, of course, influenced to some degree by the US)?', '[]', '2026-01-14 09:37:04.95794-08', '2026-01-14 09:37:04.95794-08');
INSERT INTO public.editable_content VALUES (191, 'https://www.cgdev.org/blog/has-china-really-provided-more-climate-finance-developing-countries-us', '[]', '2026-01-14 09:39:04.268178-08', '2026-01-14 09:39:04.268178-08');
INSERT INTO public.editable_content VALUES (192, 'just got the test text test, it went through now ^_^', '[]', '2026-01-14 09:50:24.321191-08', '2026-01-14 09:50:24.321191-08');
INSERT INTO public.editable_content VALUES (193, 'yay great! yeah there was a problem with our text sending configuration (hadn''t enabled permission for some international areas) that is now fixed so you should be able to get reminder/announcement texts in the future', '[]', '2026-01-14 09:51:24.764801-08', '2026-01-14 09:51:24.764801-08');
INSERT INTO public.editable_content VALUES (194, 'Since COP21 in Paris, host countries have invited world leaders to participate in a "Leaders’ Summit" as part of the conference, offering a platform for national statements and peer-level exchanges. For instance, 150 HoSG attended COP 21, around 120 in Glasgow for COP 26, over 100 in Sharm el-Sheikh COP 27, 150 in Dubai COP 28, 80 in Baku COP 29 and around 30-60 leaders in Belém COP 30. If the leaders themselves are not familiar with the details, their teams are!', '[]', '2026-01-14 09:58:02.020684-08', '2026-01-14 09:58:02.020684-08');
INSERT INTO public.editable_content VALUES (197, 'Here''s my current guesses on the top effects of these withdrawals (with the hope that y''all experts can correct me / point out what''s missing)
- further loss of legitimacy/trust in the US (other actors are less likely to want to put effort into coordination with the US on a variety of topics in the future. General loss of coordination on these topics and/or ceding coordination facilitation to other actors like China on things like climate, trade, security, etc.). 
- loss of funding over the next ~4 years
  - Roughly $1B for UNFPA & UN Women, very roughly 40,000 additional deaths of mothers and children. 
  - Roughly $200M for scientific & political research across the other institutions. 

On the climate side of things, I''m not sure how much of an effect it will have on warming. My current uninformed guess is something like 0.1º - 0.3º of additional warming due to the Trump admin here and elsewhere (e.g. scaling down climate finance). 

Any corrections / other top effects you would highlight at a similar scale?', '[]', '2026-01-14 11:29:36.224311-08', '2026-01-14 11:29:36.224311-08');
INSERT INTO public.editable_content VALUES (198, 'Looking ahead, assuming (a big assumption I am aware) that the next US administration works with urgency to return to pre-2024 energy and climate policies, what kind of “recovery timeline” do/might you expect for regaining our global pre-2024 momentum?', '[]', '2026-01-14 12:56:05.852709-08', '2026-01-14 12:56:05.852709-08');
INSERT INTO public.editable_content VALUES (199, 'Arguably I suppose, this type of  withdrawal is awful. If there was 1 thing that you recommend to us individuals that directly supports facilitating tactical, focused, multilateral, multinational cooperative efforts, what would that be? ', '[]', '2026-01-14 14:18:47.936105-08', '2026-01-14 14:18:47.936105-08');
INSERT INTO public.editable_content VALUES (196, 'Members collected a total of 57 kg (126 lbs) of e-waste and plan to dispose of it this week.


![Some photos of e-waste collected by members](https://dj92mxbdjuclo.cloudfront.net/1768418139810.webp)', '[]', '2026-01-14 11:17:22.481122-08', '2026-01-14 15:30:47.210944-08');
INSERT INTO public.editable_content VALUES (200, 'It is probably both.  Essentially internal, but that internal scene is also being impacted by what is happening in Washington.  Maybe Brice and Laurence might weigh in on this.', '[]', '2026-01-14 22:21:08.259148-08', '2026-01-14 22:21:08.259148-08');
INSERT INTO public.editable_content VALUES (201, 'With the US withdrawal from these international institutions, are there any signs of other large world economies stepping up to fill that void in terms of leadership that you think could motivate the EU, etc. to not loosen their own policies and move the world towards positive change?', '[]', '2026-01-14 23:14:35.352516-08', '2026-01-14 23:14:35.352516-08');
INSERT INTO public.editable_content VALUES (202, '- Was the withdrawal preceded by any signs or policy changes? 
- What are the Interests of the United States for now?', '[]', '2026-01-15 04:40:04.643751-08', '2026-01-15 04:40:04.643751-08');
INSERT INTO public.editable_content VALUES (203, 'How does this decision affect U.S. soft power and credibility in other international negotiations (trade, security, health), if at all? ', '[]', '2026-01-15 04:45:18.553839-08', '2026-01-15 04:45:18.553839-08');
INSERT INTO public.editable_content VALUES (204, 'I believe the soft power is hurt because it is built on respect, trust, and leadership in multilateral institutions like those this administration has left. On the other side, it seems the US has chosen to use hard power and bilateral agrements.  So one could say the US hard power is increasing', '[]', '2026-01-15 05:48:26.140187-08', '2026-01-15 05:48:26.140187-08');
INSERT INTO public.editable_content VALUES (205, 'The withdrawal from UNFCCC (the Convention adopted in 1992, the framework treaty) was preceeded by the withdrawal *January 2025) of the USA from the Paris Agreement (PA) (a treaty adopted in 2015 under the Convention). The PA is a separate treaty that operates within the institutional and legal framework of the Convention. 
For now the US Administration does not seem to have any interest in the process - they did not show up in Belém. However, climate action and implementation of the provisions of the UNFCCC and the PA does not stop with the withdrawal from the process, as outlined in several of the comments below.', '[]', '2026-01-15 05:53:50.469847-08', '2026-01-15 05:54:14.109827-08');
INSERT INTO public.editable_content VALUES (211, 'Predictability is very important in politics, as trust, rule of law, international procedures... For the last 70 years the world was in a sort of pax americana era that probably got Europe to feel comfortable and fall asleep. The wake up is a bit brutal! It takes time to move away from a geopolitical order to a new one. Let''s not forget that it was the US who invented the United Nations and the international institutions attached to them. So today the same US are shaking it up and nodding to something like a division of the world among great empires ( the US, Russia, China). 
Well, the EU doesn''t seem strong enough to be the fourth. What worries me it that in human history, new international orders are brough in by wars. And we really don''t want a war.', '[]', '2026-01-15 07:20:13.924048-08', '2026-01-15 07:20:13.924048-08');
INSERT INTO public.editable_content VALUES (206, 'I agree, mostly driven by its own societies. The US plays a secondary role by adding uncertainty that makes it difficult to turn climate leadership into a socially credible project.', '[]', '2026-01-15 06:00:21.126855-08', '2026-01-15 06:02:01.645645-08');
INSERT INTO public.editable_content VALUES (210, 'Politics is one thing, science is another, markets and technology another again. Quite a lot of commentators, energy experts, believe that the next energy wave will be electrification, because electricity can be produced without emetting carbon dioxide, because it also carries information and because it is so ubiquitous and so multipurpose. Therefore in spite of political rethorics, markets and technologies could drive the American economy in a climate compatible path faster than expected.  It means that with a change in politics, the recovery timeline could go even faster, especially if the US becomes wary of China''s advance in green technologies.', '[]', '2026-01-15 06:51:15.802055-08', '2026-01-15 06:51:15.802055-08');
INSERT INTO public.editable_content VALUES (212, 'I would add the competition around the price of energy. The American energy poliy brings the price of oil very low, making it difficult to substitute alternatives sources of energy, therefore slowing down the climate friendly efforts.
', '[]', '2026-01-15 07:24:33.369575-08', '2026-01-15 07:24:33.369575-08');
INSERT INTO public.editable_content VALUES (214, 'What''s the biggest impact in daily life a person can make in recycling?', '[]', '2026-01-15 11:22:42.441393-08', '2026-01-15 11:22:42.441393-08');
INSERT INTO public.editable_content VALUES (215, 'How do these international organizations think about individual habits and ways to change them (recycling, public transportation use, etc.) in their planning? ', '[]', '2026-01-15 11:35:08.436297-08', '2026-01-15 11:35:08.436297-08');
INSERT INTO public.editable_content VALUES (216, 'Action for Climate Empowerment (ACE) is a framework established under the UN Framework Convention on Climate Change to encompass work carried out pursuant to Article 6 of the Convention and Article 12 of the Paris Agreement. Its overarching objective is to empower all members of society to engage in climate action through the six ACE elements: climate change education, public awareness, training, public participation, public access to information, and international cooperation on these issues.

Under the Glasgow work programme, Parties adopted a four-year ACE action plan (Decisions 23/CP.27 and 22/CMA.4), which sets out short-term, clear, and time-bound activities across the four priority areas of the work programme and the six ACE elements in a balanced manner. The action plan represents a concrete step toward empowering all members of society, including children and youth, to participate meaningfully in climate action.

Implementation of the Glasgow work programme and its action plan is regularly monitored by the COP and reviewed as necessary.', '[]', '2026-01-15 12:35:26.544103-08', '2026-01-15 12:35:26.544103-08');
INSERT INTO public.editable_content VALUES (217, 'What was it like to talk to the Iraq Prime Minister about climate change?', '[]', '2026-01-15 16:26:45.859448-08', '2026-01-15 16:26:45.859448-08');
INSERT INTO public.editable_content VALUES (218, 'Yes finance is a big question. The last climate conferences have updated the assessment of  the financial goal needed by developing countries to confront climate change. 300 billions a year and looking for a thousand more years later. An impressive number.
The OECD is tracking the flows of climate finance. see: https://www.oecd.org/en/about/news/announcements/2025/10/oecd-contributions-to-assessments-of-progress-on-mobilising-and-aligning-finance-with-climate-goals.html
It is difficult to define the scope of climate finance because it depends of what you add: grants, loans, private investments, and what you divide as finance for development and finance for climate. In the last decade, attention has shifted to adaptation, damage remediation or compensation. And it also brings endless debates on the efficiency of the financing.', '[]', '2026-01-16 05:40:26.808889-08', '2026-01-16 05:40:26.808889-08');
INSERT INTO public.editable_content VALUES (219, 'What can we expect to see from the U.S after this withdrawal? And given the size and influence of the U.S, what impact might this withdrawal have on the institutions themselves?', '[]', '2026-01-16 14:31:07.626477-08', '2026-01-16 14:31:07.626477-08');
INSERT INTO public.editable_content VALUES (220, 'Why is China reluctant to assume a role of leadership? Do you mean in the context of climate change efforts specifically, or in general?', '[]', '2026-01-16 14:41:33.808955-08', '2026-01-16 14:41:33.808955-08');
INSERT INTO public.editable_content VALUES (221, 'Without the U.S. in bodies like the UNFCCC/IPCC, who is most likely to shape the global climate agenda now and what topics might get deprioritized?', '[]', '2026-01-16 14:47:46.432426-08', '2026-01-16 14:47:46.432426-08');
INSERT INTO public.editable_content VALUES (222, 'This is a very general question, but with the US currently out, is there any stomach, among the rest of the planet, for  rules with some kind of enforceability to be reconsidered? Might China & EU, for example, spearhead such a thing, given China’s dominant position, I think, in producing solar panels, and the EU’s use of same?  And combining this with a push for using less US oil? Feel free to ignore this question because I feel pretty ignorant, but I was just wondering if, without the US, where fossil money, so to speak, is still very influential, the notion of a bigger role for these institutions could be contemplated.', '[]', '2026-01-16 16:45:49.816295-08', '2026-01-16 16:45:49.816295-08');
INSERT INTO public.editable_content VALUES (223, 'I think this is a good question.', '[]', '2026-01-16 16:50:00.410956-08', '2026-01-16 16:50:00.410956-08');
INSERT INTO public.editable_content VALUES (224, 'With the U.S. withdrawing from both the UNFCCC and the IPCC after decades of participation, what actually changes inside the system of international climate cooperation? Beyond the symbolism, how does this affect agenda-setting, scientific credibility, funding flows, and trust among countries, especially for those that have historically looked to U.S. engagement as a signal of seriousness?', '[]', '2026-01-16 18:53:39.053706-08', '2026-01-16 18:53:39.053706-08');
INSERT INTO public.editable_content VALUES (225, 'I have been wondering about a puzzling phenomenon. On one hand,  news media publishes more messages on Global warming and urgency to cut greenhouse emissions; On the other hand, sales of  gas guzzling SUVs and pickup trucks in US keep increasing. As of now, about three quarters of new automobile sales are SUVs and trucks. What causes the discrepancy? Does it mean that lots of people really don’t care or just pay lip service? Do you observe similar trend in other countries?', '[]', '2026-01-16 21:37:55.797129-08', '2026-01-16 21:37:55.797129-08');
INSERT INTO public.editable_content VALUES (226, 'Since 2015, it seems like the US has been bouncing back-and-forth every 4 years between climate policies. What kind of equilibrium do we reach when we have this behavior, and what do you think it will mean long-term for climate policy globally?', '[]', '2026-01-16 22:07:04.64099-08', '2026-01-16 22:07:04.64099-08');
INSERT INTO public.editable_content VALUES (159, 'I am curious to better understand the discourse that happened on the Iraqi side during and after the US invasion of Iraq in 2003. What sorts of decisions was the Iraqi government contemplating? What did negotiations with the US look like? What were some of the priorities the Iraqi government was trying to balance?', '[]', '2026-01-13 18:39:54.829864-08', '2026-01-17 09:08:22.046016-08');
INSERT INTO public.editable_content VALUES (227, 'Too bad that we all have so much e waste but standard waste pickup of garbage + recycle + compost doesn''t cover it. I had so much e waste in my garage and storage that I wanted to dispose responsibly but never had the motivation to go drop off until the Alliance pushed me. Wish this was easier - how come there is no standard collection service. I suspect it''s not commercially feasible.', '[]', '2026-01-18 12:34:04.222221-08', '2026-01-18 12:34:04.222221-08');
INSERT INTO public.editable_content VALUES (228, 'Oh another point - as I found some expensive old routers and extenders like Eero and Orbi, I thought maybe someone could use them instead of turning to e waste so I posted in Craigslist for free give away and sure enough within a few hours people came and collected it with the promise to use them. Hopefully they do reuse and dispose responsibly if not. Should''ve made them promise they''d dispose responsibly if ithe products didn''t work for them.. 

We know the mantra - just need to practice it always - reduce - reuse - recycle - finally dispose responsibly ', '[]', '2026-01-18 12:41:08.009462-08', '2026-01-18 12:41:08.009462-08');
INSERT INTO public.editable_content VALUES (266, '> Getting gratification out of external reasons, rather than simply acting out of a want to do good, often times leads to a slow and gradual goal misalignment [in my opinion].

> It serves as a filter - the people who join the Alliance do so purely out of wanting to contribute to its goals, not for any other reason.

Mark and I agree. It''s helpful to hear that others share this sentiment.', '[]', '2026-01-31 13:44:59.801661-08', '2026-01-31 20:49:44.914534-08');
INSERT INTO public.editable_content VALUES (231, 'The UNFCCC process will continue to be shaped by the remaining key drivers:

China, which views the IPCC more as a calculator than a guiding compass, is both the largest emitter and a major investor in renewable energy and will largely define what is feasible.
The European Union, with its strong trust in the IPCC and robust regulatory frameworks and standards, will seek to exert normative and political influence.
The Global South (including BASIC, the African Group, and AILAC), which holds varied levels of trust in the IPCC, will continue to prioritize historical responsibility, development needs, and climate finance.
Financial actors (such as multilateral development banks and insurers) and the private sector will play an increasingly influential role, as the debate shifts from how to save the planet to which investments remain viable.

Overall, the focus is likely to move further toward adaptation, resilience, loss and damage, and means of implementation, rather than mitigation.', '[]', '2026-01-19 01:03:04.146966-08', '2026-01-19 01:03:04.146966-08');
INSERT INTO public.editable_content VALUES (232, 'Yes, maybe not commercially viable, but perhaps still a worthwhile public service. It was interesting to hear from European members about ease of drop-off in Slovenia, Switzerland, etc. Sounded like some combination of walkability in those places and more standardized/ubiquitous/efficient waste collection systems.', '[]', '2026-01-19 10:50:07.800631-08', '2026-01-19 10:50:07.800631-08');
INSERT INTO public.editable_content VALUES (233, 'Katherine, I thought Mark Carney''s WEF speech was relevant: [https://www.weforum.org/stories/2026/01/davos-2026-special-address-by-mark-carney-prime-minister-of-canada/](https://www.weforum.org/stories/2026/01/davos-2026-special-address-by-mark-carney-prime-minister-of-canada/)', '[]', '2026-01-21 10:51:39.641422-08', '2026-01-21 10:51:39.641422-08');
INSERT INTO public.editable_content VALUES (234, 'From my contacts with Chinese actors:  China does not wish to be catapulted into the position the US left (whatever that role was - and we can discuss how much the US actually led the process). They want to continue to play leadership role on issues they are leading, and will continue to lead (clean energy, EVs, infrastructure development, South-South Cooperation, etc.). This is true for areas other than climate change as well.  They don’t necessarily see a world led by one or an other country as such.  Instead, countries which have the capacities should play key roles with the global institutions (such as the UN - see China’s Global Governance Initiative of Sep 2025).', '[]', '2026-01-21 23:02:22.316774-08', '2026-01-21 23:02:22.316774-08');
INSERT INTO public.editable_content VALUES (235, 'The simple answer is yes.  The US needs to improve.  Whether one agrees or not with all the details of the Chinese strategy toward clean energy, EVs, etc., They have a clear strategy, and are moving in the direction set by the strategy, which is toward the new concept of an “electro state”. The US government , on the other hand is trying to kill the efforts going in that direction, and instead putting policies in place that are going in the opposite direction, back toward a “petrostate”. This is a strategic mistake, that will cost the US dearly in the years to come.', '[]', '2026-01-21 23:08:17.95536-08', '2026-01-21 23:08:17.95536-08');
INSERT INTO public.editable_content VALUES (236, 'At the minimum, the impact of such bouncing back and forth will be a reduction of overall ambition. It will also show to other countries that the US is not a reliable partner.  And this would be very unfortunate.  (C.f. Yesterday’s developments at the WEF meeting in Davos).', '[]', '2026-01-21 23:12:10.315945-08', '2026-01-21 23:12:10.315945-08');
INSERT INTO public.editable_content VALUES (237, 'Yes, this is a good question, and yes Carney’s speech at Davos is not just relevant, but a key analysis of where we are, and how we can move forward.  I strongly recommend to read the speech. What seems to be emerging here is a new world order where many continue to believe in common values, multilateralism and a rules-based order, but in this new world (which is not yet there, but is evolving) the rules and compliance to them will no longer be the responsibility of one hegemonic superpower. This is big, and addressing all the implications requires a lot more than a quick response.  Maybe we can make this into a full topic after this one on the climate change issues is completed.', '[]', '2026-01-21 23:20:58.408049-08', '2026-01-21 23:20:58.408049-08');
INSERT INTO public.editable_content VALUES (239, 'I just read Carney’s speech - I definitely agree, it is an incisive analysis of the current situation and a well-thought out strategy for Canada and others.  ', '[]', '2026-01-22 18:39:22.366788-08', '2026-01-22 18:39:22.366788-08');
INSERT INTO public.editable_content VALUES (112, 'Will have to read this. Part of the idea here is that this would not, in fact, be individual action; 100 is small, but much bigger than 1. With millions of members, these sorts of collective habit changes would amount to something significant.

There''s also a culture I hope to create in which we simply do what is in our power to make the world better. Right now, we cannot make much of a dent in the political realm, so these sorts of habit changes do not obviously trade off against more effective political actions.', '[]', '2025-11-13 09:47:28.087292-08', '2026-01-23 21:12:26.889395-08');
INSERT INTO public.editable_content VALUES (240, 'Honestly, though, I wonder about so-called American “hegemony.” Again,  I’m not that well-informed, and maybe it’s my "rust-belt" upbringing (and I say that lovingly since I absolutely love my old home in the so-called American heartland and wish the jobs were still there), but given the decline of our manufacturing and defense sectors, I worry that my country’s economy is built upon a house of cards. I worry that it’s not “just” the current administration, but that the basic infrastructure supporting the “Pax Americana” has evaporated, while much of Congress  - who simply take American hegemony for granted — seems oblivious. However, this is off-topic, I guess. People talk about the 20th century as being “the American Century.” For at least ten years I’ve been thinking the next one will be “The China Century.” We’ll see.', '[]', '2026-01-22 18:44:12.538678-08', '2026-01-22 22:22:14.237631-08');
INSERT INTO public.editable_content VALUES (241, 'Krystal Scanlon, a reporter at Digiday (2 million monthly visits), featured our AI privacy survey in an article about ChatGPT ads. The article is currently displayed on Digiday''s homepage. Link to article: https://digiday.com/marketing/as-chatgpts-growth-slows-ads-look-like-the-next-risky-move/

![Paragraphs of article that reference our AI privacy survey](https://dj92mxbdjuclo.cloudfront.net/1769536044651.webp)

The office''s next step is to share the article and our data with relevant researchers and contacts at OpenAI.', '[]', '2026-01-27 09:57:20.33599-08', '2026-01-27 09:57:20.33599-08');
INSERT INTO public.editable_content VALUES (242, 'Members have indicated that they plan to donate more money than we initially expected, so we are raising this action''s donation goal from $500 to $1,000.', '[]', '2026-01-27 11:01:55.389667-08', '2026-01-27 11:01:55.389667-08');
INSERT INTO public.editable_content VALUES (243, 'Welcome!', '[]', '2026-01-28 13:13:22.684341-08', '2026-01-28 13:13:22.684341-08');
INSERT INTO public.editable_content VALUES (244, 'Thanks for joining!', '[]', '2026-01-28 13:14:00.608304-08', '2026-01-28 13:14:00.608304-08');
INSERT INTO public.editable_content VALUES (245, 'Love the family zoning / D8 shoutout!', '[]', '2026-01-28 14:05:06.550054-08', '2026-01-28 14:05:06.550054-08');
INSERT INTO public.editable_content VALUES (247, 'Welcome!', '[]', '2026-01-28 15:43:42.008882-08', '2026-01-28 15:43:42.008882-08');
INSERT INTO public.editable_content VALUES (248, 'This discussion is for members to consider what kind of culture they would like to build together. In this discussion, members will:
- Describe a cultural principle or principles that they think will help the Alliance succeed.
- Explain why they think those principles are important.
- Explain what specific things they think we can all do to uphold those principles.

To kick off the discussion, we (Sidney and Mark) will share our own perspective.

When we think about what we want our culture to look like, we think about our shared goal: to end global poverty, environmental destruction, the decline of democratic institutions, and dangerous technological development. We hope to bring together many millions of people to pursue this goal, which will be a challenging and delicate task.

What kind of culture can we build to help us achieve our shared goal – in particular, by enabling complex coordination?

For us, three big ideas come to mind:
1. **Being responsible**: we will each need to understand that others are counting on us.
2. **Being cooperative**: we will need to avoid excessive focus on disagreements.
3. **Being focused on outcomes**: we will need to prevent perfection from being the enemy of good.

## Being responsible

An “alliance” is an agreement between people to advance their shared goals. For an alliance to work, the members who comprise it must trust one another to do their part (as some of the experts pointed out in our [discussion about UN institutions](https://worldalliance.org/forum/post/15)).

Here are some ways we think this idea applies to the Alliance:

1. **We think it is important that members take the contract seriously.** If members reliably complete their Alliance tasks, then the office can count on them when planning future actions, and other members can believe their efforts are being matched.    
2. We hope members will take personal ownership of the success of the Alliance. When members support or argue with other members, talk positively or negatively about the Alliance with friends, complete tasks with more or less care, etc., **these actions either help or harm our long-term potential.**
3. In the future, we may need to take actions that are inconvenient or difficult. In order to make such tradeoffs, we hope that members will **take seriously the idea that we have influence** over the problems we want to solve.
 
We sometimes receive suggestions to rely more on incentives and engagement tactics to “get members to complete tasks,” rather than to rely on members'' responsibility. For example, we could gamify actions with a point system or use more emotional appeal in our task descriptions. While such an approach might provide short-term benefits, we believe it would undermine long-term trust, focus, and cohesion. At the extreme end, it would shift us away from our purpose:

- We’d have to market ourselves rather than communicate honestly.
- We’d have to evaluate actions based on their sensationalism rather than their effectiveness.
- Instead of being a shared undertaking, the Alliance would simply become a small group (the office) cajoling members to participate.

We think of members as equal partners in the Alliance. We treat members with respect, and hope that members will do the same by keeping their commitments.

## Being cooperative

The Alliance hopes to use broad agreement in order to spur action. For example, [“between 80-89% of the world’s population want stronger climate action.”](https://www.theguardian.com/environment/2025/sep/02/politicians-underestimate-support-climate-action-limiting-policies-study) Our focus on [global crises](https://worldalliance.org/guide#priorities) reflects not only urgency and scale, but also the existence of substantial common ground.

We do not intend for the Alliance to judge what is generally “right” and “wrong,” nor do we intend to solve every problem. We think that trying to do so will cause the Alliance to fracture and prevent us from accomplishing the goals that we already know we share.

We want to focus on **solving specific problems**, and to focus on **what we agree on rather than what we disagree on**. We think this means:

1. Being willing to work with people we disagree with.
2. Disagreeing respectfully and productively with one another. It may help to keep in mind that every member of the Alliance is here because they want to make the world better.
3. Helping others even when it does not benefit oneself. A member may not find a particular action compelling, but by contributing nonetheless, they enable reciprocity: others will, in turn, support the actions that matter most to that member.

We hope that a cooperative culture will allow us to eventually bridge interests, geographies, and ideologies.

## Being focused on outcomes

First and foremost, we want to accomplish a goal together. We think the Alliance should be fair and effective. However, we do not think that the desire to be “perfectly fair” or “optimally effective” should prevent action that makes the world better.

We think this means:

1. Focusing on what **we can do to have an impact, rather than what we wish others would do**. While we will sometimes pressure the actors most responsible for global problems, direct action will often be more effective.
2. **Weighing actions against the costs and benefits of inaction.** The actions we will take will inevitably involve tradeoffs and risks that deserve scrutiny. However, even if an action does not address every root cause or equity concern, it could still improve the world relative to the status quo.
3. Giving the Alliance room to **make mistakes and learn from them**.

Many of the consequences of global crises are irreversible – species going extinct, for instance, or lives lost to extreme poverty. We hope to be able to act with appropriate urgency.

## Discussion

As mentioned, please: 
- Describe at least one principle (either one that is important to you, or one of the above) that you think will help the Alliance succeed.
- Explain why you think the principle is important.
- Explain what specific things you think we can all do to uphold the principle.', '[]', '2026-01-28 17:46:14.713125-08', '2026-02-04 20:38:33.339078-08');
INSERT INTO public.editable_content VALUES (249, 'I believe the ability of members to hold civil discussions in the presence of stark disagreements is central to the success of the Alliance. Although the Alliance is structured upon rather noncontroversial driving goals, members may eventually encounter disagreements regarding the best ways to pursue such goals. 

If disagreeing members feel that their (potentially unpopular) opinions are not being heard or represented by the majority, they may respond by either escalating combative discussions or leaving the Alliance. These are both harmful outcomes, as the Alliance relies on every member feeling represented. Our success is also dependent on ideological diversity, which necessitates a culture of civil discourse.

We can all uphold this principle by "putting ourselves in the other person''s shoes" before we respond to a comment or action that we disagree with. This requires us to be outspoken when we do disagree, but to do so in a considerate way.', '[]', '2026-01-28 19:48:10.121633-08', '2026-01-28 19:48:10.121633-08');
INSERT INTO public.editable_content VALUES (278, 'I think that being focused on outcomes will help the alliance succeed the most. If we can prioritize measurable progress, we can maintain the momentum necessary to tackle massive, intimidating problems. By accepting that an imperfect but immediate action is more valuable than an ideal plan that never leaves the drawing board, we can turn our shared effort into real results. Of course, there is always a balance to be had since if we focus on outcomes too much, we sacrifice the thoroughness necessary to ensure our actions don''t have unintended long-term consequences. Specifically we can all uphold this principle by supporting a chosen course of action even if it wasn''t our first choice, provided it moves us toward our shared goal. This means prioritizing participation over perfection, moving forward despite a lack of total consensus, and coming into each action with an open mind.', '[]', '2026-02-01 23:19:20.613245-08', '2026-02-01 23:19:20.613245-08');
INSERT INTO public.editable_content VALUES (250, 'Focusing on agreement is one of the best ways the Alliance can move forward to be effective. Given that the strength of the Alliance lies in the membership, alignment on a specific solution enables us to be more effective in certain situations, whether it''s by taking action together or influencing the right organizations. For many issues with broadly global alignment, a lack of direction generally seems to be one of the biggest reasons to inaction. 

Diversity of perspectives is acknowledged to be an important factor in making organizations more impactful, and as Alex said, an individual lack of consensus can be a useful signal that the discussion or solution is missing an important perspective. However, one of our most limited resources is time. 

I believe we can be more productive if we focus on action towards a solution. This could mean resolving our tasks within the deadlines and avoiding discourse without action. One aspect of acting on a solution is, occasionally, figuring out what that solution even is. If we individually aim to converge on a solution during our discussions, we can start taking action sooner than if we spend our time on just discussion.', '[]', '2026-01-28 22:03:16.539836-08', '2026-01-28 22:03:16.539836-08');
INSERT INTO public.editable_content VALUES (251, 'Globalism is waning in the US, but it is not waning everywhere. Certainly not from a Chinese perspective, and  neither in Europe (though perhaps less than before). But since the US is such an important player, its absence makes things more difficult.  The current world order (with all its rules and norms, as well as institutions) has essentially been set up by the USA - and done in a way to advance US interests. Now, it is the USA that is throwing all this in the trash can, and many believe that this will be hugely detrimental to the USA while it will help others...  The big challenge you have identified is that the USA is both economically and militarily very strong, and can antagonise (and indeed has been antagonising) countries and institutions. ', '[]', '2026-01-28 22:26:08.144786-08', '2026-01-28 22:26:08.144786-08');
INSERT INTO public.editable_content VALUES (252, 'The "being cooperative" principle resonates with me a lot. This is a quality that allows any community, including the Alliance, to thrive. This does not necessarily entail agreeing with others, but rather being kind to and understanding of others, even despite differing opinions. Giving the benefit of the doubt, as it were.

These types of interactions also mutually generate positive associations with the Alliance and its community, which is good for the long term health and stability of memberships in the Alliance (and therefore good for the world as well).

I think the internet is known to be a place where people act cynical or uncharitable (even if they may not act that way in-person). It is important that the Alliance, being an online community, attempt to prevent this undesirable behavior as much as possible.

I like the idea that we should "keep in mind that every member of the Alliance is here because they want to make the world better." Not only that, but also that we should keep in mind that kindness begets kindness. Being charitable to others is not simply a single standalone event, but it contributes to a more desirable culture and community. And picking fights and trying to assert dominance may feel good in the moment, but also provides others with a negative impression of you.

Hopefully we can all act more cooperatively not only to fellow members of the Alliance, but in our lives in general.', '[]', '2026-01-28 22:30:50.073092-08', '2026-01-28 22:30:50.073092-08');
INSERT INTO public.editable_content VALUES (253, 'Katherine, you are raising some really important issues that have impacts on a number of the questions and answers in this exchange here.  Difficult to deal with all of this in such brief ways, but let me try just a few points.  I would have to disagree with you about the "decline of the defense sector".  The opposite is in fact true in the USA - but Defense-related production may have moved from traditional places to others.   The effect of globalisation (and let us remind ourselves - the globalised world economy was essentially created by the US to advance its own interests) has left many in America poorer, but one needs to ask the question to what extent that was due to "globalisation" as such, or lack of worker-friendly policies in the USA - especially since the Reagan era.  Thomas Picketty explains this in his excellent book: "A Brief History of Equality". The "American Century" is clearly weakening, and the Chinese world is strengthening.  However, I am not sure that what is in front of us is a "Chinese century". The world is more complex than just a US or a Chinese century...  ', '[]', '2026-01-28 22:41:20.377856-08', '2026-01-28 22:41:20.377856-08');
INSERT INTO public.editable_content VALUES (254, '“I like the idea that we should "keep in mind that every member of the Alliance is here because they want to make the world better."” This statement resonates with me deeply. Both at in a general, long-term manner and especially at this particular point in time when so much of the US and global news seems to be focused on actions by people who do not seem to be working to make the world a better. 

I think our community would be strengthened by having the opportunity to see more clearly and more easily reminders (and data) of the outcomes that have been produced by prior actions.', '[]', '2026-01-29 10:25:16.443171-08', '2026-01-29 10:25:16.443171-08');
INSERT INTO public.editable_content VALUES (256, '> If we individually aim to converge on a solution during our discussions, we can start taking action sooner than if we spend our time on just discussion.

I''ve noticed that online discussions often become very general/abstract and turn into a debate about the validity of a general principle or class of actions. The generality of these debates makes them very difficult to resolve, especially in a timely manner. Your suggestion to focus discussion on topics/questions that are relevant for taking action could counteract that tendency.', '[]', '2026-01-29 12:50:25.760349-08', '2026-01-29 12:50:25.760349-08');
INSERT INTO public.editable_content VALUES (255, '> I think our community would be strengthened by having the opportunity to see more clearly and more easily reminders (and data) of the outcomes that have been produced by prior actions.

We are working on it! Right now, action updates that we send out are buried in notifications. We plan to display them more visibly on the homepage. You can also see past updates on the [Information page](https://worldalliance.org/information).', '[]', '2026-01-29 10:31:05.477213-08', '2026-01-29 15:40:29.861965-08');
INSERT INTO public.editable_content VALUES (280, 'Of the three principles above, I think "being responsible" is the most important for the Alliance''s success. I first realized this in my high school AP Environmental Science class when we watched Planet Earth and Cowspiracy. These documentaries showed how our individual choices, like eating less beef, can impact the planet if a lot of people committed to it. This reflects the idea of responsibility, as personal commitment is the foundation of effective collective action. 

Specific things we can do to uphold the principle of "being responsible" include taking the Alliance contract seriously and reliably completing our weekly tasks.', '[]', '2026-02-02 13:58:04.846349-08', '2026-02-02 13:58:04.846349-08');
INSERT INTO public.editable_content VALUES (258, '"We hope that a cooperative culture will allow us to eventually bridge interests, geographies, and ideologies."

Agreed on the outcome for a path to scaling and making real impact. Scaling is important to having enough clout to address the problem areas. 

However, I don''t see how we grow big enough to make any significant dent in any of the (absolutely massive) 4 problem areas. 

I think for boosting motivation and getting buy-in beyond the current alliance membership of early adopters, it would help to see:

1) the current plan from the management team on plans to tackle even one of the 4 problem areas and how those plans break down into our weekly 15 minute assignments. So far I haven''t gotten to see the vision on how we get to a level of scale or buy-in beyond our weekly ad-hoc tasks (which are not nothing, some progress beats 0 progress). 

2) I do think some gamification is worth investing time in developing. The reason social media is so addictive is the gamification element - in lieu of in person social reinforcement, we get our sense of fulfillment through internet points and parasocial liking and commenting. I think the closest example so far from the alliance has been us posting our successful local govt interactions - it has been heartening and exciting to see all the responses from others. This lends credence to the idea that we can actually make a systemic change on any of those 4 major problem areas (which otherwise feels quite bleak).

tl;dr would be great to have a public master plan and celebrate our weekly accomplishments towards that master plan (to be clear, neither of these is an easy task 🫠)
', '[]', '2026-01-29 18:21:43.013694-08', '2026-01-29 18:21:43.013694-08');
INSERT INTO public.editable_content VALUES (259, 'Glad you liked the responses to the comment action.

Some responses to your thoughts: 
- We don''t feel qualified yet to give a "master plan" at such a level of specificity that it can be broken down into our current 15-minute tasks - in order to do this, we will need to build a very large team of experts, and hope to do so before we launch publicly.
- However, we can certainly paint in broad strokes our plan to get from where we are now to our launch, as well as explain how we expect to grow after our launch. We think the former will involve planned growth pushes via member invitations (we will be launching our first growth-oriented action next week!). We think the latter will involve member invitations but also a lot of spontaneous discovery. We plan on adding a nicer, more detailed roadmap to our [Information page](https://worldalliance.org/information) in the coming days.
- We do plan to improve our social features for those who want them (currently around 1/2 of members), as well as make action updates prettier and display them more prominently.
', '[]', '2026-01-29 21:47:54.075947-08', '2026-01-29 21:47:54.075947-08');
INSERT INTO public.editable_content VALUES (257, 'With respect to the principle of responsibility, it seems like this is foundational to Alliance effectiveness and differentiation as a model.   There are probably other types of organizations that can function or are even designed to function with variable or lower levels of member participation.

But the Alliance''s model is one that requires more like a consistent 90%+.   Which is not to say they are unusually insistent or demanding on members.    But to deliver the promised level of effectiveness, the model needs high and predictable levels of  participation.

 Why?   My understanding is that the Alliance wants to be able to make credible assertions about what it can do to outside actors and influencers.   For example, if you (coffee shop, e-waste processor, elected official, etc.) agree or fail to do "X", then the Alliance will do "Y".    With predictability and proven levels of participation in its pocket, the Alliance can secure agreements or alter behaviors that it otherwise couldn''t, thereby multiplying and leveraging its force.

Perhaps the model of a trade union illustrates the point.   Members of a union may not want to strike, as it causes them personal pain and loss, but they''ve pledged to do so and will do so if union leaders call them to it.   Crucially, this is understood by all parties, and so union leaders can accomplish at lot at the bargaining table, usually without ever having to call a strike.   Credibility creates a force multiplier.

So I suspect the Alliance is saying that for it to achieve its potential as a unique organization, it needs members to be at 100% or at 0%.   Contract in place, or not in place.   Pre-committed  or not.   And either is totally okay!   Respect to everyone and the choices they make.  :-)   But the Alliance''s model is simply optimized and searching for member fit at the ~100% level.', '[]', '2026-01-29 17:46:43.521519-08', '2026-02-01 15:32:46.179183-08');
INSERT INTO public.editable_content VALUES (277, 'The principle that most resonates with me is focusing on outcomes. In the case of the Alliance, I think the way we do things matters less than the results, considering the positive outcomes we strive for. As a group, and especially a group that is growing, we are bound to reach disagreements about fairness or optimized actions. I think these concerns are a lower priority, as we will never get things done if we waste all of our time focusing on finding the best things to do. It''s best to just do, then worry about improving as we go.  I think focusing on this principle, especially while the Alliance is still young, will help us grow and become the group we want to be. My suggestion for following this principle is to avoid spending too much time or effort using polls or suggestions for smaller goals, accepting non-unanimous agreements, and focusing more weekly tasks on efforts that will result in a tangible outcome.', '[]', '2026-02-01 22:30:58.887464-08', '2026-02-01 22:45:02.832978-08');
INSERT INTO public.editable_content VALUES (283, 'This task is coming at me at a challenging time (i.e., too little time). I read through the starting point from Sidney and Mark, and fundamentally I agree with it.  I also browsed through the discussion, but there I am afraid I did not have the time to do a thorough job to read and respond.  I would, however, like to add one important issue.  We will have to find better ways to interact and come to certain conclusions on challenging issues.  When our numbers become bigger, we need to invent some political process that will work within the Alliance.  An interesting example is the reference to 80-89% of people want climate action.  But the real challenge comes when you break this down to figure out what kind of action?  Do we put all our energies (literally and figuratively) into making nuclear fusion work, or do we focus on solar PV?  I am simplifying, and in some ways exaggerating, but there will often be situations when the Alliance has to have a path to decisions on certain issues.', '[]', '2026-02-03 10:29:19.953418-08', '2026-02-03 10:46:00.880663-08');
INSERT INTO public.editable_content VALUES (287, 'As much as I believe focusing on outcomes is the priority, the most important contributor to that end is through a focus on personal responsibility. If you want to change the world, start with yourself and lead by example. But cooperation is key, as strength in numbers will help us reach each goal. 
To avoid excessive disagreements, when debating an issue, it may be helpful to begin with a suggestion for how the issue may be best handled before or in lieu of stating criticism of another idea. 
I agree incentives are not the right path, as it leads people to do things for reasons other than for the intended goal and which will not lead to the kind of change that Alliance is seeking. 
To avoid excessive disagreements, when debating an issue, it may be helpful to begin with a suggestion for how the issue may be best handled before or in lieu of stating criticism of another idea. 
', '[]', '2026-02-03 17:47:03.103027-08', '2026-02-03 17:47:03.103027-08');
INSERT INTO public.editable_content VALUES (267, 'I think for me the “being focused on outcomes” principle is very important.  I also agree with the three sub-principles (focusing on what we ourselves can do, using cost-benefit analysis, and allowing room to make mistakes.) We all have limited time, and we’re all here, not primarily for social or entertainment reasons, but to try to accomplish something positive toward the Alliance’s four-fold goals. 

I think displaying specific task outcomes for Alliance members to see, to the extent possible, is an important motivator. In general I think people don’t do things they agree with/think are good because those things are costly in time or money or attention/thought and  they feel that "their little bit” just doesn’t matter (cost-benefit analysis again!)   Low voter turnout is a classic example. Therefore, as others have mentioned, I think, whenever Mark, Sidney & the staff can manage it, coming up with a tangible, visible, easily interpreted display of any concrete bits of progress resulting from our tasks, even very small, seems quite helpful. People are hungry for good news that can be communicated easily to friends and colleagues. The photos of E-waste collected, for example, were (I thought) impactful. I think it would be good to make these displays of progress somehow more prominent on the platform - you may already be planning this. 

Of course, small actions can sometimes lead to big outcomes, with careful strategy and, of course, luck, or, as we now call it, virality :)  The carefully-strategized Montgomery Bus Boycott/role of Rosa Parks comes to mind. In any case, crafting and implementing strategy usually requires strong leadership, with this, at least for now, being Mark & Sidney’s bailiwick. 

I also like “being cooperative” and “being responsible,” and the way you’ve set out those goals, though those issues aren’t as salient for me, since I generally find myself promptly dropping out of groups where those values are not more or less upheld.  (I’m not active on social media.)  I trust that these values will be upheld as long as the group is mostly people personally known by Mark and Sidney.  Once the group is opened to the public, or whatever, and gets to be bigger, I’m not sure how maintaining  standards of cooperation and responsibility will work. Obviously people can be dropped from the group if they do not comply with their contracts. Re: cooperation, I do feel like I’ve read that active moderation is very helpful on this score. Also, just the fact that the Alliance is not built around profit-making will help a lot, I should think, since, as I understand it, a lot of social media is more or less geared around getting people worked up, in order to keep them on the platform and reading ads or whatever.', '[]', '2026-01-31 15:15:48.212329-08', '2026-01-31 15:40:47.633842-08');
INSERT INTO public.editable_content VALUES (268, 'I agree! Christ''s model of selfless love would strongly benefit Alliance culture. We''re able to make a much stronger impact when our actions are rooted in serving others, and a collective pursuit of this service can spark genuine change in the world.', '[]', '2026-01-31 21:46:19.712576-08', '2026-01-31 21:46:19.712576-08');
INSERT INTO public.editable_content VALUES (260, 'A principle I weigh heavily is **optimism**---the shared belief that coordinated action can change outcomes.

I believe in the promise of the Alliance, and I don''t think the Alliance can succeed without that belief being broadly held. The model asks people to reliably show up week after week, making small but meaningful contributions whose impact may not always be immediately visible. That only makes sense if Alliance members are optimistic that such actions compound and that collective effort pointed in the right direction can make nontrivial dents in massive problems.

To uphold an optimistic culture, we can:

- Frequently share evidence of progress, even when it''s incremental
- Frame uncertainty as reassurance that the Alliance is tackling real problems, not as discouragement
- Remind ourselves that we''re participating in the Alliance because change is possible, not because it''s guaranteed

Optimism isn''t about certainty; it''s about choosing to believe that trust, coordination, and consistent steps can stack up against admittedly daunting issues. Without this belief, the Alliance cannot exist.', '[]', '2026-01-29 22:06:41.143261-08', '2026-01-29 22:10:24.621324-08');
INSERT INTO public.editable_content VALUES (261, 'Grant''s post resonates with me. Coming from a place of realistic optimism will lead toward better engagement and persistence, proactive problem-solving, improved team relationships, and overall satisfaction while making those small but meaningful contributions week after week.  ', '[]', '2026-01-30 07:50:44.520996-08', '2026-01-30 07:50:44.520996-08');
INSERT INTO public.editable_content VALUES (279, ' I think part of being cooperative is also being willing to perform actions that slightly deviate from your own values. That is, it’s easy to do things for others and be somewhat proactive even if you don’t find a particular action compelling, but it’s another thing to still cooperate when you believe the action runs counter to some of your beliefs.... even if it’s in service of some greater goal you believe in.

Now, I don’t think anyone should completely disregard their deeply rooted values for the sake of the group, that’s very dangerous, but I think, in smaller ways, it may sometimes be necessary, and that’s ok. I think recognizing that, and spending time figuring out where you draw the line, is important. In some ways, the Alliance needs to push for a kind of collective humility, and with that, cooperation comes much more easily.

I think this is especially important given that the major goals of the Alliance are ambiguous in what they even mean. I have some idea, w.r.t. my own experiences, of what these could be, but I can easily imagine how others may deviate from my perspective based on race, gender, and most importantly, class.', '[]', '2026-02-02 13:43:20.577168-08', '2026-02-02 13:43:20.577168-08');
INSERT INTO public.editable_content VALUES (238, 'Bryan, I think this is happening everywhere.  But the US being probably the most consumerist country in the world, these developments are more visible.  Consumption is a key component of emissions.  And the kind of cars being driven are a key part of that.  So why do people choose SUVs?  Well, some don’t care about climate change.   Others care, but believe that somebody else should do something about it (like the Chinese or the Indians - this is very convenient).  Then there is the pressure from the car manufactures.  And the pressure from the neighbors.    And then the beliefs that you need a big heavy car for your own security… It is a kind of vicious  circle…', '[]', '2026-01-21 23:37:15.890053-08', '2026-02-03 10:46:17.29762-08');
INSERT INTO public.editable_content VALUES (288, 'For me, one core piece of our culture should be thoughtful engagement. That means we can disagree, but we do it with curiosity and good faith. We critique ideas, not people. We explain our reasoning. We listen fully before responding. If we model intellectual generosity now, that becomes the baseline for everyone who joins later.
I also think culture connects directly to diversity. If new members walk into a space where inside dynamics feel closed off or where only the loudest voices shape decisions, we’ll unintentionally narrow who feels welcome. But if we prioritize clarity, openness, and shared ownership, we create room for more perspectives to meaningfully participate. The culture we build will determine not just who joins, but who stays and contributes.
Another piece for me is reliability. Trust grows when people follow through. If we say we’ll complete something, we do it, or we communicate early if we can’t. That kind of accountability isn’t about pressure; it’s about building a community where we can depend on each other and therefore take on bigger goals together.
Finally, I think it would help if we normalize re-centering on our mission when small disagreements start to pull us sideways. It’s okay to debate, but we should keep asking ourselves: does this move us closer to our priorities? That kind of shared focus protects both our relationships and our impact.
', '[]', '2026-02-03 18:42:47.683115-08', '2026-02-03 18:42:47.683115-08');
INSERT INTO public.editable_content VALUES (272, 'I agree and think this is important!', '[]', '2026-02-01 12:20:33.285899-08', '2026-02-01 12:20:33.285899-08');
INSERT INTO public.editable_content VALUES (273, 'I think part of my reasoning here is related to being more of a "mistake theorist" than "conflict theorist": https://slatestarcodex.com/2018/01/24/conflict-vs-mistake/', '[]', '2026-02-01 12:31:21.77846-08', '2026-02-01 12:31:21.77846-08');
INSERT INTO public.editable_content VALUES (274, 'I spent a few more mins looking into the polling, here''s one article with some polling results (which I think illustrates somewhat how different the answers can be depending on the exact question being asked): https://epic.uchicago.edu/news/2025-poll-americans-views-on-climate-change-and-policy-in-15-charts/', '[]', '2026-02-01 12:39:14.619881-08', '2026-02-01 12:39:14.619881-08');
INSERT INTO public.editable_content VALUES (275, 'I believe a key principle to help the Alliance succeed is open-mindedness. This quality ensures that every member respects diverse perspectives and beliefs. It fosters an environment where unique approaches to different issues are welcomed. By embracing diverse viewpoints, we can enhance our collaborative efficiency. Cultivating an open-minded culture is essential for the Alliance to thrive, as it allows all members to express their ideas without fear of being disrespected. It encourages innovative strategies for modern issues. Ultimately, this inclusivity facilitates cooperation and strengthens our collaborative problem-solving capabilities.  Open-mindedness is vital for the Alliance, facilitating mutual respect and a willingness to explore new solutions to societal challenges. By prioritizing an open mind to diverse thought, we can improve our collaboration and drive more efficient outcomes.', '[]', '2026-02-01 16:37:36.286493-08', '2026-02-01 16:37:36.286493-08');
INSERT INTO public.editable_content VALUES (276, 'The principle that resonates with me most is prioritizing outcomes over having a perfect plan or "right move." Since the Alliance''s goals require similar amounts of effort from all or most members, coordination can be difficult when everyone envisions a different approach to the same problem.  Especially when reaching a detailed consensus among many diverse perspectives is already inherently challenging, waiting for unanimous agreement on every detail could mean waiting indefinitely.

This is why members may need to recognize that not everyone will share the same vision for a proposed solution. The overall priority for accomplishing a goal is best described as one that allows for members to voice concerns without getting too focused on less important details, as ultimately, taking more imperfect actions is better than taking none at all.

', '[]', '2026-02-01 18:50:32.892533-08', '2026-02-01 18:50:32.892533-08');
INSERT INTO public.editable_content VALUES (316, 'This resonates with me as well. Although totally aligned on not gamifying, I do believe there will eventually need to be space for some sort of membership tiering so people can be responsible at a level at which they can dedicate their efforts. Maybe they could fluctuate or people can take on optional tasks as well. ', '[]', '2026-02-04 20:46:49.976774-08', '2026-02-04 20:46:49.976774-08');
INSERT INTO public.editable_content VALUES (307, 'I think the proposed cultural pillars are a good start but are missing at least an immune system against epistemic & value decay.

Context / Background:

I think there’s a tendency for groups to decay into certain dynamics that are hard to escape, and it’s good to have cultural immune systems to protect from those natural pressures (like an immune system protecting a body from infection). These dynamics can emerge from seemingly benign individual motivations like "desire to connect / be included" and "caring about the mission/group". Here’s my rough ontology broken out by immune system:

**Epistemic & value decay** (mitigated by a culture of truth-seeking, openness, and honesty. This feels like the biggest missing immune system and why I recommended scout mindset).

1. **Memetic** - Generally, ideas that spread best aren’t necessarily true or effective. This can lead to values drifting into more extreme or dilute versions of themselves.
2. **Groupthink** - Cohesion/conformity get more rewarded than accuracy. Cognitive biases become strengths, dissent feels costly and people self-censor/evaporate, blind spots and tribalism get reinforced.
3. **Evaporative** - Many types of decay are sped up when people with different values/ideas/etc find it easier to leave than engage.
4. **Consequentialist** - Small ethical compromises accumulate "for the sake of the mission/org".

**Identity decay** (mitigated by a holding group membership/identity lightly and keeps focus on the work itself.)

5. **Identity reification** - The group reifies a certain self-image leading to perverse outcomes (victim triangle dynamics, role rigidity, tribalism).
    - **Victim-aggressor inversion** - The group maintains a self-image of being persecuted even as it gains power, using that narrative to justify aggressive actions as defensive.
    - **Ingroup / outgroup** - Group identity focuses on ingroup / outgroup dynamics rather than commitment to shared values.
    - **Founder/leader** - Identity gets wrapped up with specific founders/leaders. Criticism of the leader becomes criticism of the mission, and the leader''s blind spots become the group''s.
6. **Signaling / Purity spirals** - Members compete to show status/commitment through increasingly extreme behavior.

**Execution decay** (mitigated by focusing on outcomes, accountability, and mission clarity)**:**

7. **Mission creep/drift** - Gradual expansion or distraction beyond focus/competence until the group is spread thin or distracted and ineffective at original goals.
8. **Sclerosis** - Processes, values, and structures that made sense early on become rigid and resist adaptation, members feel helpless to ''the system''.
9. **Corruption** - Focus gradually shifts to benefitting the individuals/institution rather than the mission.

Overall I think the Alliance’s existing leadership and membership, along with the outcome-focused pillar form a good start for an immune system against most of the identity & execution decay dynamics, but I would advocate for the addition (or reformulation) of a cultural pillar to make us more robust to epistemic & value decay (and generally for the office to be attentive to the evolution of these dynamics).', '[]', '2026-02-04 16:44:55.859972-08', '2026-02-04 16:46:35.554016-08');
INSERT INTO public.editable_content VALUES (269, 'One principle that is especially important to me is remembering that we are acting together as a collective, not as individuals optimizing for our own preference. In that sense, members will definitely have to make some compromises when we tackle future challenges, because the complexity of the problems we''ll attempt to solve call for trust and coordination. This has definitely been something I''ve learned as I''ve worked in groups that have a larger common goal, as when members aren''t on the same page, progress severely stalls.

While it will definitely be hard at some points to be the one who makes the compromise, Grant''s post about optimism is a great reminder to look back on when that happens. Ultimately, we will all share the same broader goal, so it is only through cooperation that we will be able to achieve, even if it may not be achieved the exact way you may envision.', '[]', '2026-02-01 00:16:02.34609-08', '2026-02-01 00:16:02.34609-08');
INSERT INTO public.editable_content VALUES (270, 'Agreed. I think the fact the Alliance exists is very important by itself. And I wonder how to cope with all the newcomers that should be galvanized by the news of its existence. Just the fact a new organization with no real shape his emerging in different areas of the world because the people involved want to improve the situation, that gives hope! 
I like “Shoot for the moon. Even if you miss, you''ll land among the stars." I have noticed there is an area of activism where a lot can be done because nobody tries, it seems too difficult, it''s the area of transnational issues. A few years ago I started to suggest the creation of an international  scientific body of chemists on the model of the climate IPCC. Nobody thought it was possible. Well, with some friends we managed to gather a group of scientists who lobbied their country and ( lots of efforts...) the world has now a new institution called " the Intergovernmental Science-Policy Panel on Chemicals, Waste and Pollution (ISP-CWP) under the umbrella of the UN environment organization. 
When Greenpeace was founded, Bob Hunter (the Vancouver journalist at the origin) told me: "I hesitated between creating a mouvement  (we would say a NGO) or a Church." Surely our actions are rooted in a deep ethical sense of our responsibility  towards Mother Earth! Later the Greenpeace sailors  went from the victory to victory, astonished by the easyness of these victories! Nobody before them had done anything to protect the sea against dumping waste, polluting the waters, overfishing.
This brings me to the idea that the planet needs a steward that does not exist yet. So we are in charge of global affairs, global affairs that trickle down in each part of the world, that affect all of us. It means we must find the articulation between  our patriotism  (our country) and the care of the planet (the planet being the humanity but also - and here you have an argument- all living creatures)
For instance there is another "common" that is endangered : the outer space crowded with bits of satellites, burn residues,  parts of rockets, paint flakes, junk of any sort. Something like 15 000 tonnes and 40 000 large bits (millions smaller) circling arount the Earth at  20 000 km/h. Do we have an international concern ? No!
', '[]', '2026-02-01 02:03:12.647956-08', '2026-02-01 02:03:12.647956-08');
INSERT INTO public.editable_content VALUES (271, 'A principle I think is important is "rigor" or "carefulness" or something like that, plus "avoiding polarization". If the Alliance succeeds, it will have a huge influence and the Office will have an enormous amount of power. It is easy to be overconfident about whether some particular drastic action is helpful, and end up doing something harmful (or relatedly, having much less positive impact than you could have done with slightly more careful thinking). I''m especially concerned about politicization/polarization/tribalism. 
For instance, in the post above, there is a claim that "80-89% of the world''s population want stronger climate action". This particular statistic isn''t that important, but claims like these are important to determining what the Alliance prioritizes - if in fact only a minority of people supported stronger climate action that would be a important signal for the Alliance to reconsider whether this is something they should be pushing on, and to try to understand why some people don''t think this is a good idea. So I would want to trust that the Office is being careful about how much to trust these kinds of statistics, and especially to avoid adopting the viewpoint of one narrow political or social demographic. In this case, the citation for that statistic goes to an article in the Guardian, which represents a particular social/political/demographic group that is unusually sympathetic to environmental concerns. It is also my understanding that you can get polls to come out with very different numbers depending on how you word the questions etc. So I would not want to take that statistic at face value for determining how much global support there really is - I would want to look at the actual studies that were done, the methodology, the affiliations of the authors, whether there are contradictory studies. I think it''s important for members to hold the Office to very high standards if we''re trusting them to select actions and direct the energies of a large number of members.', '[]', '2026-02-01 12:18:05.920711-08', '2026-02-01 12:18:05.920711-08');
INSERT INTO public.editable_content VALUES (290, 'I do believe outcomes are obviously important but should not negate honest efforts. Effective communication of outcomes, whether successful or not, that result from clearly stated goals should help recruitment and inspire members either by sharing in success, learning by mistakes, or rethinking tactics/strategy. Retrospectives can help if orchestrated effectively.

I''m not sold on the idea of feeling that you need to communicate a culture. I think an optimal “culture” is developed organically by member and leadership actions & behaviors, leading by example, being empathetic, inclusive, showing humility, and being humble - just some immediate thoughts :-)

I also don''t think that you can tell people they need to be responsible or have communal values or ethics, they either have them or they don''t. We all live in glass houses filled with ambiguity and trade offs about things we value, with varying degrees of narcissist tendencies, some based on privilege, some on basic survival. In either case, an open mind and willingness to lean in is what matters most. Share more, listen better, show up. Ugggh… love to all!

', '[]', '2026-02-03 20:49:02.763996-08', '2026-02-03 20:49:02.763996-08');
INSERT INTO public.editable_content VALUES (291, 'I believe that maintaining the Alliance’s core values will become harder as the membership grows and we get closer to the vision (a large number of people committed to taking small actions that compound and result in strong positive outcomes). It’s inevitable that a higher percentage of members will be less reliable and disagree more on certain paths of action. 

However, I agree with the office and others in the forum that mention an outcome-focused culture. This alone will mitigate the problems I mentioned earlier - if we can facilitate concrete improvements to the Alliance’s main issues, that itself will incentivize more people to contribute, especially if those improvements are a direct, undeniable result of reliability. 

I also heavily agree with the idea of improving the world relative to the status quo. In my opinion, there’s a huge sense of pessimism regarding these issues (ie, “the systems that cause the issues are unbreakable, so why bother?”). Tailoring actions around this goal will help create real impact, even if it’s small, and motivate members to contribute. 

I’m curious about anyone’s thoughts on how the Alliance’s processes and challenges will change as the organization grows. ', '[]', '2026-02-03 21:34:12.405676-08', '2026-02-03 21:34:12.405676-08');
INSERT INTO public.editable_content VALUES (292, 'Interesting research article! I think producing something similar with Alliance actions is a great idea.', '[]', '2026-02-03 21:45:06.830412-08', '2026-02-03 21:45:06.830412-08');
INSERT INTO public.editable_content VALUES (293, 'To me, the most critical principle is being responsible and accountable to our commitment to the Alliance, which to me  is the same as being focused on outcomes. 

Having taken our commitment seriously, we are bound to cooperate and harmonize our efforts, and work through our differences of opinion, blessed by our diversity.

We are already taking a very important step in this direction - to take the time and effort to complete our assignments.  If each of us continues to do so, and we continue to add similar committed members, and the leadership continues to set the goals and direction for the rest of us, we will make a difference to the world.', '[]', '2026-02-03 22:38:31.040789-08', '2026-02-03 22:38:31.040789-08');
INSERT INTO public.editable_content VALUES (294, 'To me, culture of love seems to be a fundamental ingredient for successful nonprofit organizations. Most religions embrace love. Spreading love while doing tasks allows us to achieve outcomes as well as care for related people and things.', '[]', '2026-02-03 22:51:53.754466-08', '2026-02-03 22:51:53.754466-08');
INSERT INTO public.editable_content VALUES (295, 'Love this. I wonder about a practice for improving open mindedness, and if that might be or could be one of the most important goals for the Alliance.', '[]', '2026-02-04 00:44:31.875247-08', '2026-02-04 00:44:31.875247-08');
INSERT INTO public.editable_content VALUES (296, 'I strongly support many of the principles and comments by fellow members as I have added my like/heart under these principles/comments. I would just add that in the future when our membership has grown to a significant level, it would be beneficial to creat tiers of membership that require different level of commitment or effort to grow membership.', '[]', '2026-02-04 01:22:20.191813-08', '2026-02-04 01:22:20.191813-08');
INSERT INTO public.editable_content VALUES (297, 'I''m a proponent if setting SMART goals to help with clarity & expectations , that plus conducting retrospectives as goals are met or not.

"Components of a SMART Goal
Specific:
Define exactly what you want to achieve (e.g., what, why, who).

Measurable:
Include criteria to measure progress (e.g., how much, how many).

Achievable:
Ensure the goal is realistic based on skills and resources

Relevant:
Ensure the goal aligns with broader objectives.

Time-bound:
Set a firm deadline or timeframe. "', '[]', '2026-02-04 07:40:47.086281-08', '2026-02-04 07:40:47.086281-08');
INSERT INTO public.editable_content VALUES (298, 'If I were to add a cultural pillar, it would be ''scout mindset'', "the motivation to see things as they are, not as you wish they were." A mix of openness, truth-seeking, and being willing to face reality even if it''s uncomfortable. As contrasted with the ''soldier mindset'' which is more about defending one''s beliefs. ', '[]', '2026-02-04 09:18:48.633673-08', '2026-02-04 09:18:48.633673-08');
INSERT INTO public.editable_content VALUES (317, '+1 to this. Transparency is key especially when the ask is to focus on outcomes and be cooperative. Especially being transparent on things we don’t want to focus on or have decided not to spend time on (whether temporarily or permanently).', '[]', '2026-02-04 20:48:33.044676-08', '2026-02-04 20:48:33.044676-08');
INSERT INTO public.editable_content VALUES (299, 'I think the principle of cooperation is important as described because its quite likely we will have tasks that we don’t necessarily understand the importance of or even maybe agree with, and we should be able to rely on folks to complete then regardless (up to a point, of course). 

That being said, I think we should expand the pillar of cooperation to include task creation - folks should feel welcome and encouraged to pitch tasks to the team that they think are worth consideration, even if they’re not fully formed ideas yet. This allows idea gen to also be more decentralized and I think increases people’s investment in the community. ', '[]', '2026-02-04 09:43:15.264969-08', '2026-02-04 09:43:15.264969-08');
INSERT INTO public.editable_content VALUES (300, 'Yes, it would be great if members wanted to pitch ideas. We plan to develop a better process for this, but in the meantime, please feel free to email us: [contact@worldalliance.org](mailto:contact@worldalliance.org).', '[]', '2026-02-04 09:47:33.813103-08', '2026-02-04 09:47:33.813103-08');
INSERT INTO public.editable_content VALUES (301, '> I would just add that in the future when our membership has grown to a significant level, it would be beneficial to creat tiers of membership that require different level of commitment or effort to grow membership.

Great suggestion - we have plans to do so. Our plan is to have a baseline member contract, and offer optional additional commitments for members who wish to use more of their resources to aid the Alliance. We want to be careful about how these contracts affect weight in Alliance governance so all members remain equal partners in the Alliance.', '[]', '2026-02-04 09:58:01.445611-08', '2026-02-04 09:58:01.445611-08');
INSERT INTO public.editable_content VALUES (302, 'Welcome!', '[]', '2026-02-04 10:01:20.088644-08', '2026-02-04 10:01:20.088644-08');
INSERT INTO public.editable_content VALUES (303, 'I liked this post! It does seem like we should worry about ending up too far in the direction of a kind of conflict-adjacent theory that sounds like "what if we just ask people to abide by these principles that we decided are universal while ignoring the kind of complex incentive-webs that caused people to act the way they do and that we might not totally have the power to adjust." Also that there could be a level of ''mistake hardness'' that makes the kind of mass pressure activities we want to do implausible for certain systems, though this can hopefully be mitigated by some forms of expert research for actions.', '[]', '2026-02-04 10:08:27.428273-08', '2026-02-04 10:08:27.428273-08');
INSERT INTO public.editable_content VALUES (305, '> I''m not sold on the idea of feeling that you need to communicate a culture. I think an optimal “culture” is developed organically by member and leadership actions & behaviors, leading by example, being empathetic, inclusive, showing humility, and being humble - just some immediate thoughts :-)

I agree that culture is largely communicated through "show, don''t tell." We will do our best to embody the culture through actions, the design of the platform, communications, and other facets of the Alliance :) 

I do think, however, that as we grow it''s important for members to have common knowledge of our norms and expectations. Explicit discussions like this one can help members understand the what and why of Alliance culture, which will (I hope) both allow the culture to develop organically and make it easier for new members to become a part of.', '[]', '2026-02-04 10:20:52.972356-08', '2026-02-04 21:52:20.001017-08');
INSERT INTO public.editable_content VALUES (336, 'I recently read the book Abundance by Ezera Klein and one of my biggest takeaways was his claim that many of the bottlenecks in Liberal policymaking today is the attempt to solve too many problems in one bill. In the attempt to create an “optimally effective” solution, the solution ends up being far too complicated to enforce, and comes far too late to achieve the intended effects with the urgency required. Americans recognize these bottlenecks as evident from their criticism of “the bureaucracy.” I believe that these same Americans are anxious for a group that can achieve results. Therefore, I believe the principle of “being focused on outcomes” is the best way to attract the kind of support that will benefit the alliance, as well as the type of people who are eager to be a part of such a group as the alliance. Having this principle embedded in the group culture early on will help guard against the pressure to address every problem later on, and the efficiency-killing consequences of decision paralysis. To achieve results, the alliance must be willing and able to make decisions and act on them, even if imperfect. To uphold this principle, members must be instructed on the specific, tangible goal of certain actions and be developed/trained in a way where they can direct their actions towards this specific goal and have the conviction of mind to resist criticism of its seemingly limited scope.', '[]', '2026-02-04 23:43:10.506602-08', '2026-02-04 23:43:10.506602-08');
INSERT INTO public.editable_content VALUES (342, '> How will we respond to the first task that majority of Alliance members decline to carry out out of disagreement?
Thank you for bringing this up - we think this is quite important to consider this explicitly beforehand, possibly even worth having a dedicated discussion about.

Realistically, we should expect this will happen. When it does happen, it could be for any number of reasons: the office makes a big mistake, or members lack important context, or perhaps an issue is so urgent that it is worth doing something even in the face of predictable disagreement.

When this happens, I hope that all parties will be able to take the long view, and to consider the action in the overall context and trajectory of the Alliance. In some scenarios, the office may need to seriously reconsider its people and processes for action evaluation. In different scenarios, it may be appropriate for members to lend the benefit of the doubt, and continue to believe in and take responsibility for the long-term possibilities of the Alliance rather than react too strongly or too negatively, or instinctively cast blame on others before looking inwards.

Personally, I hope that members will also understand that the office is simply a group of people, all of whom make mistakes constantly, and will do their best to learn.', '[]', '2026-02-05 11:41:30.140181-08', '2026-02-05 11:41:30.140181-08');
INSERT INTO public.editable_content VALUES (306, 'Grant''s post distills it well.How do we show this optimism as a cultural value? How do show others that coordinated optimism can help with meaningful change? How will these proof points get others to believe in our goals?', '[]', '2026-02-04 12:54:40.961734-08', '2026-02-04 12:54:40.961734-08');
INSERT INTO public.editable_content VALUES (304, 'Re: challenges as we grow: I strongly agree that a major challenge will be retaining the ability to solve problems as we come to disagree more about the "how" vs. the "why." (We are less worried about members becoming unreliable because we restrict membership to people who complete tasks reliably - so from our perspective, what would have been a reliability problem is actually more of a growth/accessibility problem.)

There likely won''t be a silver-bullet solution. But, some things we think will help:
- Building an outcomes-focused culture, as you said, which can be more concretely realized in various ways. For instance, we could have a discussions norm of asking explicitly whether or not a disagreement is relevant to our goals (Katherine Carpio''s idea below).
- Developing decision-making processes that allow us to evaluate the tradeoffs of actions efficiently and thoroughly (as Janos Pasztor suggested below). We anticipate that this will be very challenging; we do not know how to do this yet, nor do we currently have the capacity to accommodate such a process for every action. However, when we develop and run these processes in the future, we think it will be good to not take for granted that we are all here to solve the same problems. When we disagree, we hope that everyone will believe that we disagree about facts, not fundamental morality, and that this will allow us to disagree more kindly and productively.
- Subjecting decision-making processes to democratic approval before implementing them. This way, most members will hopefully agree about the "way to make decisions," and therefore be more willing to accept specific outcomes that a process produces, even if they have some disagreement with those specific outcomes.
- We are very excited about the fact that reliability means we will have a constant, open line of communication with members. **This means that in cases of severe disagreement, we may be able to make significant progress by running actions that help everyone understand everyone else''s viewpoints.** From our perspective, this stands in stark contrast to the current state of political affairs in which everyone receives information from different sources, and therefore cannot come to agreement over time. (There are studies on deliberation that suggest that people''s opinions can change very quickly when they are exposed to opposing viewpoints expressed in good faith.)', '[]', '2026-02-04 10:19:20.543281-08', '2026-02-04 10:28:37.009166-08');
INSERT INTO public.editable_content VALUES (339, 'Agreed - we think a lot about how to best convey the direction of the Alliance and the progress we have made. 

* We currently don''t have a roadmap of external goals because we have such high uncertainty over the impact we''ll be able to have. We have a small roadmap on our [Information](https://worldalliance.org/information) page. As we learn more, we hope to plan actions as part of a broader strategy to achieve specific objectives, which we will convey to members. To do this rigorously, we''ll need a large team of experts, and hope have such a team before we launch publicly.
* We made action updates more visible by now displaying the on the homepage after tasks are completed.', '[]', '2026-02-05 10:23:54.211998-08', '2026-02-05 10:23:54.211998-08');
INSERT INTO public.editable_content VALUES (308, 'The 42 members who chose to share their profile information publicly are now displayed in our public member directory: [https://worldalliance.org/people](https://worldalliance.org/people)

![Member directory](https://dj92mxbdjuclo.cloudfront.net/1770253183572.webp)', '[]', '2026-02-04 16:55:38.16238-08', '2026-02-04 17:00:00.29768-08');
INSERT INTO public.editable_content VALUES (309, 'I read the blurb about the task a week ago but didn''t read the office''s suggested principles (didn''t have time, also wanted to think about it myself first). The main idea that came to mind was "Being respectful," both of other members (e.g. in forum discussions, and particularly when disagreeing with someone; being willing to engage in productive discussion and avoiding assumption of bad intentions) as well as of our commitment to the office (doing tasks on time, acknowledging that our actions can have a meaningful influence on the Alliance''s culture and effectiveness).

This seems to be a mix of "Being responsible" and "Being cooperative", which I think is a better way of explaining the concept. "Being respectful" is pretty vague and can cover a lot of things besides responsibility and cooperation.', '[]', '2026-02-04 17:59:52.527426-08', '2026-02-04 17:59:52.527426-08');
INSERT INTO public.editable_content VALUES (310, 'A common thread between the theme of being outcome-focused and being  cooperative is the idea of humility (as @Bob Grand so nicely put it). Humility means, as members, being willing to recognize that we do not know everything the office is doing and to trust their hard work. Thus, we are not overly critical and are instead curious and patient. Humility also means that the office is willing to recognize their solutions might need improvement to become the best possible action; or, that the action may not work despite the best possible research, implementation, and intention, due to outside factors. For an endeavor as big and hopeful as this one, humility seems like a critical foundation for learning and eventual success.', '[]', '2026-02-04 18:02:38.91689-08', '2026-02-04 18:02:38.91689-08');
INSERT INTO public.editable_content VALUES (312, 'Being focused on outcomes is important for success of the Alliance so that members feel their time towards efforts are worthwhile. 
Measuring impact and reporting back to members is a great way to do this after tasks. These also give good conversation starters for spreading the word about the alliance to get new members. 
', '[]', '2026-02-04 18:28:57.234209-08', '2026-02-04 18:28:57.234209-08');
INSERT INTO public.editable_content VALUES (311, 'I generally feel that critical thinking / theory is really important. By this I mean trying to understand what it means to hold various positions or take certain actions and in particular, how the way we conceptualize things changes the world. There''s obviously a balance to be had -- we shouldn''t spend all of our time thinking and not acting, and we shouldn''t constantly reevaluate our policies and concepts to the point of disarray -- but not enough can certainly lead to unintentionally harmful / undesired outcomes. Thinking critically is pretty difficult and I think we could all stand to do more of it. Especially if/as/when the alliance gains more influence, meaningfully encouraging such behavior from all members and integrating it transparently seems essential to avoiding just creating another institution with different people (whom we might like more than current politicians/billionaires) at the wheel. I remain pretty skeptical that this isn''t a likely outcome at the moment.


Some actionables: 
- I would like to see more explicit and transparent discussion from the office re. internal political processes and how we can make sure this doesn''t just concentrate power in their hands. I would want member participation to be a primary part of this and to clearly affect alliance plans / policy. I don''t know alliance leadership personally and so am not in a position to trust that I''m not contributing to them gaining influence, which they may then use in undesirable (not agreed-upon) ways. Basically, we should try to make it as straightforward as possible for members to determine to what degree they align with the alliance beyond just the four stated causes.
- Some of the alliance''s (or the office''s?) positions seem overly simplistic / naive to me; I don''t think this reflects reality and thus may lead to either being ineffective or to members / alliance as a whole being misled. It also indicates to me that these positions may have been constructed without sufficient input from other parties. 
    - For example, I think the idea of "broad agreement" is quite simplistic. Janos said something similar below, but to reiterate, even if we agree on a cause, many ways of achieving it may be more disagreeable to members than protecting status quo. Portraying approval in such a way can then be deceptive. Discussion of and input on nuances could be concretely available for those interested without overwhelming those who don''t have bandwidth. For instance, making more transparent how the office chooses which actions we all do by exposing the thought process / discussions they had.
    - Re. focusing on what we agree on -- is there any logging of what we disagree on so that we know and can make sure we''re doing actions that are generally not in that space? Do we know what we disagree on in the first place? I feel like if this is meant seriously, some explicit processes surrounding it would be in order.
- I appreciate this week''s style of action -- explicit solicitation of discussion to help shape alliance culture / goals. I think it''s really good to conceptualize this sort of thing as an action. 
    - I would add that it might be better to begin by stating the questions, and then giving the office''s stances (perhaps even as a comment instead of in the post body). Opening the discussion by first telling me your beliefs and without explicitly welcoming dissent or negation of these beliefs (primarily asked members to posit) makes me feel like your beliefs are much more important than my own / unlikely to change substantively from this discussion. You did explicitly welcome us to agree with and elaborate on one of your points though. 
    - Understanding any avenues in which this action did genuinely change your beliefs / alliance roadmap, or at least cause you to have more uncertainty on some area or investigate it further, would help us. 

I don''t mean to be overly negative but I do believe negation is a crucial part of any self-critical constructive process :)', '[]', '2026-02-04 18:28:36.504328-08', '2026-02-04 18:31:41.769072-08');
INSERT INTO public.editable_content VALUES (313, 'I appreciate your effort formalizing this for us and feel like this kind of critical thought should definitely have a place here! It''s not enough to just have "good intentions". ', '[]', '2026-02-04 18:37:43.199985-08', '2026-02-04 18:37:43.199985-08');
INSERT INTO public.editable_content VALUES (314, 'I think maintain a positive atmosphere, value members'' contributions, suport each others to achieve goals are important.', '[]', '2026-02-04 19:03:16.391869-08', '2026-02-04 19:03:16.391869-08');
INSERT INTO public.editable_content VALUES (315, 'I think a couple important cultural pillars for me are transparency and equality. When it comes to what tasks or actions are going to be taken by the Alliance, I think it will be important to have a transparent decision making process where members have an equal chance to provide their input. I agree that cooperation and focusing on outcomes should make up the foundation for the kind of culture we want to build, but I also think it''s important to not slip into a state where a few people make decisions and the rest do as they''re told. I think some amount of healthy disagreement is needed because I believe that''s how we collectively come to the best ideas we can at the time with the collective best knowledge we have. I do agree we should not let disagreements prevent us from taking actions, and some sort of framework for how to move forward despite disagreements will also be important to have as part of our culture. I think this can help build a sense of ownership, responsibility, and respect. ', '[]', '2026-02-04 19:23:49.878966-08', '2026-02-04 19:23:49.878966-08');
INSERT INTO public.editable_content VALUES (318, 'The cultural quality I''ll suggest, which aligns well with what Sidney and Mark wrote, is "bias towards action". On surface level, there''s lots of work to be doing, so let''s get it done! Especially when actions are easily reversible or low effort, let''s jump in. Even if just to experiment. In my opinion, we are a long long ways from "introducing weasels to New Zealand" level of influence that would hazard caution, even if we aspire to eventually promote collective action on that scale.  

This idea also applies when it comes to growing a culture. The words by which we claim to abide and the way we interface is important. But it''s exceedingly possible for orgs to have bylaws and constitutions that differ vastly from their actual culture and practices. "Bias towards action" applies here as well- what we do decides who we are, not our opinions, not our preferences, our actions. The best way to promote a cultural tenet is to embody it, and the best way to measure our success it to assess what we do. 

Adhering to the contract, maintaining high task completion, and evident effort on behalf of the office are key. Y''all will set the tone; the culture this org takes on will be an extension of your actions and decisions. 

Some other things to keep in mind while I''m rambling: 1) What mechanisms, intentional or implicit, will serve to confer status within our membership. We should consult some David W. Marx here. Towards what will we confer cachet. 2) What cultural practices that aren''t related to collective active or altruism do we want to explore to organically beckon culture? Maybe we collectively make revelry on July 6th (philosopher Peter Singer''s birthday), or mail a card to someone else in the alliance. Maybe those things are best created organically. 3) How will we come to define and internalize the relationship between "the office" and regular Alliance members- can we skirt connotations of big brother / cult leaders that are not uncommon in organizations when a central body disseminates instructions? How will we respond to the first task that majority of Alliance members decline to carry out out of disagreement? ', '[]', '2026-02-04 21:41:45.902532-08', '2026-02-04 21:41:45.902532-08');
INSERT INTO public.editable_content VALUES (319, 'For me, being cooperative and open-minded matter the most. Most of the time, my friends and I align on the issues in the world we worry about, the problems we want to solve, from AI safety to homelessness in SF. However, we often approach these problems with different solutions because of our diverse backgrounds and experiences. To me, it is important to focus on our common goals, like Sidney and Mark said, and to be open to a wide range of ideas. Because there is no silver bullet for these complex problems, I think progress is most likely when we allow multiple approaches to coexist and inform one another.', '[]', '2026-02-04 21:44:33.564978-08', '2026-02-04 21:44:33.564978-08');
INSERT INTO public.editable_content VALUES (320, '+1', '[]', '2026-02-04 21:46:25.507917-08', '2026-02-04 21:46:25.507917-08');
INSERT INTO public.editable_content VALUES (321, 'From the Alliance front page: "The Alliance is a global group of people cooperating to improve the world. Our priorities are extreme poverty, environmental destruction, the breakdown of democratic institutions, and dangerous technological development."

We joined the Alliance because we agree on the goals and want to make the world a better place by doing what we can, one task at a time.  I think we should all remember this and try to support each other, and respect each other even if we disagree in discussions. We should also try to assume suggestions/comments from others are coming with good intentions. We can only achieve our goals if we work together towards them. Being open, honest, respectful, and calm will go a long way to build trust among members. ', '[]', '2026-02-04 21:51:12.940143-08', '2026-02-04 21:51:12.940143-08');
INSERT INTO public.editable_content VALUES (322, 'regarding the cooperation point, what is the mechanism through which members can disagree? am personally happy to receive direction like robotic sheep, but it feels like there’s a missing mapping: if i find an action compelling, i do it; if i’m neutral, i do it as a quid pro quo; if i actively disagree, it seems natural to not do the action. but then am i still upholding the contract?', '[]', '2026-02-04 21:56:46.811258-08', '2026-02-04 21:56:46.811258-08');
INSERT INTO public.editable_content VALUES (323, 'I believe positivity is important to the wellbeing of the Alliance. A positive environment shapes how members interact with each other and with the Office. When people assume good intent and respond thoughtfully, conversations stay focused on solving problems rather than defending positions, which helps decisions move faster and with less friction. It also encourages members to share early ideas or acknowledge mistakes sooner — often where better solutions emerge. In practice, this looks like acknowledging others’ efforts, asking clarifying questions before criticizing, and offering specific improvement suggestions instead of blame. Positivity doesn’t mean avoiding criticism; it means giving direct feedback in a way that preserves trust.', '[]', '2026-02-04 22:13:55.076948-08', '2026-02-04 22:13:55.076948-08');
INSERT INTO public.editable_content VALUES (324, 'Per the contract, you can withdraw from an action if you believe it is immoral. The contract leaves it to you to decide where you draw the line.', '[]', '2026-02-04 22:14:45.402586-08', '2026-02-04 22:14:45.402586-08');
INSERT INTO public.editable_content VALUES (325, 'One  principle I think is important is to be able to hear other peoples views with an open mind. Diversity is a key to success and we all come different backgrounds and will have different opinions on topics. It’s important to remember to listen and try to see from others perspectives before chiming in with one’s own views. There’s a lot we can all learn from each other’s different walks of life. One thing we can do to ensure we are practicing open mindedness is fully take in what others are saying and process it before thinking of what our response is gonna be or our own opinions on it. This will help us be more collaborative and be able to support each other by better understanding one another. ', '[]', '2026-02-04 22:34:34.22625-08', '2026-02-04 22:34:34.22625-08');
INSERT INTO public.editable_content VALUES (326, 'As I am studying abroad in Thailand right now, I am learning a lot about Thai social structures and relationships. Thai culture has a concept called the “circle of concern”, and anyone who you have a common goal with or any connection to is considered within your circle of concern. In order to maintain social harmony and uphold your reputation, you must make decisions that support the relationships within your circle of concern. 

This can be applied to the Alliance because we can think about problem-solving and setting aside time to complete tasks as necessary aspects of maintaining harmony in the group. Rather than trying to perfect solutions, we need to think about what would work best for common interests within our circle of concern- in this case, the common goals of the Alliance. It’s important to prioritize progress rather than the perfect solution, which means setting aside some of our own interests to maintain harmony and effective collaboration within this group.', '[]', '2026-02-04 22:39:30.851775-08', '2026-02-04 22:39:30.851775-08');
INSERT INTO public.editable_content VALUES (327, 'The principle that most resonated with me was ‘Responsibility’. In order for us to have any sort of positive impact we have to put in the time and that means completing tasks when they’re due. 
The Alliance is dependent on collective action. I don’t see how we can function without responsible members committing their time every week. I will say, I am a bit on the backend of things when it comes to timeliness, but the tasks can and should be completed. 
Receiving the automated messages alerting/reminding us that a task is due is actually so helpful. But if that doesn’t seem to do the trick, members can also set up there own alarms or dedicated specific times for when they want to work on the week’s tasks.  ', '[]', '2026-02-04 22:41:46.837168-08', '2026-02-04 22:41:46.837168-08');
INSERT INTO public.editable_content VALUES (328, 'For me, the visible direction of the alliance is important for it to succeed. I think it’s important because the overall goals can sometimes be hazy when working in 15 minute increments weekly. I think possibly having a published roadmap of goals so we could see how the tasks tie into them would help with that.', '[]', '2026-02-04 22:46:27.657635-08', '2026-02-04 22:46:27.657635-08');
INSERT INTO public.editable_content VALUES (329, 'In my mind, the most important principle is the following (which you stated):
"Helping others even when it does not benefit oneself. A member may not find a particular action compelling, but by contributing nonetheless, they enable reciprocity: others will, in turn, support the actions that matter most to that member."
Not only is it important as a principle, I think it is even more essential to place a great deal of emphasis on, because it is so counter to current cultural norms. Like I think most folks agree that we should "disagree respectfully" in most cases, and likely try to do so normally. However, doing things not directly beneficial to oneself because others benefit more than it cost you has very much fallen out of current fashion (see the book The Upswing).
I think so much of the challenges we face ultimately come about because people fail to uphold this principle. Everybody acting fully self-interestedly to the extent that the law allows them creates deep harms (for profit health insurance?) and well as simple inefficiencies (traffic jams would happen less if people didn''t try to beat traffic, allowing everyone (including those doing the lane changes!) to get to their destinations faster).
Honestly, I think the biggest way to uphold this principle is to show that other people are doing it too. Most of the time I''ve talked to people about this idea, they say "nobody will be the first one to do it," and that is why they won''t; but if you constantly remind people that it does happen, then they don''t feel like they are the only ones sacrificing for a pointless cause. Maybe an interesting thing to do could be to have everybody rate how much they care about the subject of each of the actions they''ve taken; then, folks could see how the rest of the alliance is going out of their way for something they don''t deeply care about to help advance the causes they do? ', '[]', '2026-02-04 22:54:04.589864-08', '2026-02-04 22:54:04.589864-08');
INSERT INTO public.editable_content VALUES (330, 'One principle that first came to mind as being important is almost a mix between the first two outlined principles of being responsible and cooperative. I would define this important defining principle to be accountability, both to other members of the alliance as well as to those we intend to benefit through individual tasks. I find this to be paramount in ensuring that the alliance is able to function efficiently as well as be able to maintain other guiding principles. I think that upholding accountability to those we seek to benefit is integral to keeping the alliance alive and continuing to strive to do good by keeping those we want to help in mind. I think that continuing to have these sorts of forums/discussions amongst the alliance is the best way to maintain our accountability by providing/encouraging a platform for sharing thoughts of members and allowing them to interact. Accountability can also be maintained in a more personal, direct sense by encouraging other friends in the alliance to stay involved or find ways to give feedback.', '[]', '2026-02-04 22:54:43.802955-08', '2026-02-04 22:54:43.802955-08');
INSERT INTO public.editable_content VALUES (331, 'I think the principle most likely to result in success for the Alliance is cooperation, and to a further extent collaboration. I think cooperation between Alliance members can make achieving our shared goals seem like a more manageable task. As an individual, many of the problems addressed in the introduction can seem daunting, and lead to inaction or apathy. Cooperation is therefore crucial to preserving the momentum needed to reach larger audiences and achieve bigger goals. Furthermore, I think that collaboration between the Alliance and other organizations and individuals is a natural progression of this principle. Utilizing our strengths and filling the gaps of our weaknesses by working transparently and collaboratively with others is a fantastic way to multiply the positive effect of our tasks. 

In regard to upholding this principle, I think that working hard to understand these challenges from different perspectives and seeing the bigger picture of each focus area is very important. It can be easy to see tasks as single actions taken by individuals, but engaging with other members and seeing the larger impact of working collaboratively can make even the most lofty of the Alliance''s goals seem tangible and achievable. ', '[]', '2026-02-04 22:54:49.531914-08', '2026-02-04 22:54:49.531914-08');
INSERT INTO public.editable_content VALUES (335, 'I think it is critical that we stay true to our opinions so that the future culture of alliance can remain truthful and not just turn into a echo chamber.', '[]', '2026-02-04 23:22:32.802782-08', '2026-02-04 23:22:32.802782-08');
INSERT INTO public.editable_content VALUES (337, 'a lot of the improving the world stuff i think about and have experience with has to do with poverty alleviation, so the principle i thought of was a balance between caution and optimism: 
- there are good reasons why extreme poverty hasn''t been solved yet. it''s a dry, distasteful pill to swallow, but all these global resources and energy have been poured into global poverty alleviation, yet the proportion of resources that have historically gone into truly effective, sustainable alleviation/development is astonishingly small.
- put those resources into the wrong hands, even well-meaning hands, and you get devastating unintended consequences. wanting to create large scale change means risking adverse effects that are difficult to quantify. we have to act with urgency, but we have to match the scale of impact accordingly by dedicating the utmost caution and care to every action we take. 
- (i think tackling other priorities (environmental destruction, the breakdown of democratic institutions, and dangerous technological development) should operate with different balances. e.g. a direct action initiative to protect the environment of a certain region is less likely to have negative, unintended consequences on the people living there, compared to involvement in its social or political institutions) 

i think we can: 
- make sure discussion is always intentional. we should be incredibly cautious, and we should critically discuss ideas and courses of action, but if we get stuck in the muck, no change will ever happen. our discussions should be held with the intention of reaching a course of action or inaction. 
---- but discussion can reach an impasse: as mentioned in the post, improving the world relative to the status quo requires weighing things. but if it comes to it, which may happen when the alliance strives for its higher goals, i don''t feel qualified to make decisions on if a cost to family A is outweighed by a benefit to family B. i''d like to see how other alliance members critically engage with actions that are deeply moral. would a majority agreement change my own morals? what measures will be used to justify an action? 
- always seek and utilize local knowledge. e.g. with big poverty action, we can discuss for hours, but most of us have never experienced living in the places our actions target. with the power that collective action holds, we should make sure we''re not utilizing expert knowledge that claims to know better, but learn from people living there
- be aware of the ideologies we buy into, but don''t let public perception stop good action: this is kind of like organizing a large social movement and even if the social movement doesn''t explicitly lean into a political left or right, it''s going to have to take action, and that action will inevitably be put a some political box. the existence of so many ways of how to go about the alliance''s goals reflects all the paths we could take, but they won''t be seen the same by the public. yet members should be able to confidently say that the action wasn''t top down and ideologically driven but inspired from the ground up! 

open to any thoughts!! ', '[]', '2026-02-05 00:17:35.046274-08', '2026-02-05 00:17:35.046274-08');
INSERT INTO public.editable_content VALUES (338, 'Welcome!', '[]', '2026-02-05 08:34:24.601058-08', '2026-02-05 08:34:24.601058-08');
INSERT INTO public.editable_content VALUES (340, 'I like this concept, and generally find it fascinating when social harmony is maintained explicitly. I appreciate this attitude because I feel like cooperation/harmony are often invisible when things are going well, and so they are forgotten and do not receive attention/care needed to prevent them from degrading.', '[]', '2026-02-05 10:30:53.884036-08', '2026-02-05 10:30:53.884036-08');
INSERT INTO public.editable_content VALUES (333, 'This is something I also strongly agree with. Especially in our current political & cultural environment, it can be really easy to feel cynical about the power of collective action - to see all the protests & the petitions & the calls to action, yet feel like things are still only getting worse. Collective action of any sort requires some level of optimism & (what can feel like) blind belief that your small contribution can somehow add up to anything, whether it''s voting or boycotting or even just working with others to clean up your neighborhood.

This kind of optimism also feels tied up with trust for me: I sustain the optimism by trusting in the other members to also uphold their commitments, thereby ensuring my individual contribution gets multiplied into something much bigger. If the link from an individual action to the overall goals is not clear to me, trusting in the overarching principles & the process by which we''ve chosen the actions can help me stay motivated & believe that this action is still something worth doing, even if I don''t fully understand why.', '[]', '2026-02-04 23:04:39.242537-08', '2026-02-04 23:04:39.242537-08');
INSERT INTO public.editable_content VALUES (332, '(Mark and I are writing this together.)

Hi James, first off – thank you for this substantive engagement. It means a lot to us to see others taking the Alliance seriously, and we think taking it seriously means thinking hard about ways that it could fail. We will now respond point by point.

> seems essential to avoiding just creating another institution with different people 

We do not think that there is, or will be, a “secret sauce” that prevents the Alliance from facing the many problems that other institutions face. We think that at least for the foreseeable future, the quality of the world’s institutions will continue to be sensitive to the quality of the people within them. This makes it all the more important that we (both office and members) take our jobs seriously.

There are many factors that will help us as an institution – critical thinking included, regular communication between members included (see Sidney’s reply to [Rishi](https://worldalliance.org/forum/post/16?replyId=298) about some of the benefits we think this will confer) – and there are also many unique challenges we will face as a result of our structure that other institutions do not. We expect to make many mistakes, and we hope you will understand that we are learning as we go.

> I would like to see more explicit and transparent discussion from the office re. internal political processes and how we can make sure this doesn''t just concentrate power in their hands.

We would love to have much more information available about our ideas for governance processes. We have not been able to spend substantive time providing such information, nor do we have particularly sophisticated processes yet that we have believed to require explanation beyond what is currently available on our website (e.g., our [Governance](https://worldalliance.org/governance) page and basic explanations for our actions, e.g. [pothole-reporting explanation](https://worldalliance.org/actions/50)). We plan to attend more to our communication as we grow, as it will both become more important and we will have more internal capacity.

In lieu of “official” information, we’ll outline some of our personal perspectives on this issue. These are, by the way, subject to change – we ultimately want to develop processes and governance that make it most likely that we can resolve global crises.

We (Mark and I) expect that as the Alliance grows, the office will have more power. We currently believe that, in the long run, a coherent strategy will be necessary to make progress on our core priorities, and that coherence and urgency will require power to be somewhat concentrated. This is not ideal from our perspective, but once again: we have not solved the general problem of institutional design as a society, and we believe various experimental, decentralized models of organizations do not yet offer sufficient coordination potential.

Ultimately, membership in the Alliance is voluntary. This implicit “vote” holds the office accountable because any power the office has is power entrusted to the office by members. 

To build on this foundation, we think about three broad strategies for mitigating the risks of power concentration:
1. We have, and will continue to develop, formal governance. Our current governance process requires us to run a regular oversight action every 3 months that attempts to understand overall member approval (binding) as well as miscellaneous member opinions (non-binding, but taken seriously). The next such process will be run towards the end of February. (We will likely want to make a few modifications to this process soon, subject to member approval.)
2. We will maintain a high level of transparency so that, to borrow your words, it is as “straightforward as possible for members to determine to what degree they align with the Alliance.” We are currently not as transparent as we want to be in the long run. In addition to generally making much more information available, we plan to introduce many processes that help members learn about how the office makes decisions. For example, we might have “office hours” in which staff answer member questions, audits of office activity, member advisory boards (random or elected), or “votes of no confidence” for specific Alliance staff positions.
3. Collecting information and preferences from members and integrating it into various processes internally. There are two halves to this:
  - We plan to regularly solicit information about member beliefs, preferences, and aspects of the member experience. For example, we plan to run regular feedback actions, survey randomly sampled members, etc.
  - We plan to design processes that allow members to actively provide information to the office. We expect most members will not do so regularly, but we want to ensure that those that do can efficiently share information with the relevant parties. Currently, members can share information with any staff member by messaging them on the platform; in the long run, processes for surfacing information will have to be designed thoughtfully, and will leverage technology, designated staff positions, and potentially Alliance community structures.

> Some of the alliance''s (or the office''s?) positions seem overly simplistic / naive to me

First, it seems helpful to clarify that the positions in the post are Mark’s and my perspective (not the Alliance’s or the office’s).

More substantively, we believe the characterization of the principles we have laid out, and particularly “broad agreement,” as “overly simplistic / naive” is too cynical. We agree that it will be difficult to translate broad agreement about a cause into concrete actions. But core to the Alliance is the belief there are worlds that are preferred to our current world by the vast majority of people, including worlds free of global crises.

When we speak of broad agreement, we are laying out what gives us hope that the Alliance might succeed. There will be many times, and many places, to discuss implementation and cleverly overcome challenges; this is the bulk of the work ahead of us. It is our strong belief that if we cannot collectively recognize what so many of us have in common, if we cannot share a hope or a dream, then we will not succeed.

> Re. focusing on what we agree on -- is there any logging of what we disagree on so that we know and can make sure we''re doing actions that are generally not in that space

Right now, members can withdraw from actions if they believe they are immoral. This has not happened yet, but if/when it does, we plan to have an option to make individual withdrawals public.

Members are welcome to express disagreement by commenting on actions or posting on the forum. We also tend to check actions with a handful of members prior to launching them, but we currently do so informally. In the future we plan to develop processes to solicit such feedback more systematically (perhaps with randomly sampled members).

We’re interested in learning more about member preferences and beliefs, both to find areas of agreement and disagreement. We might run a general “beliefs and values” survey as a starting point, although we will likely wait until we have a higher diversity of members so the action is more informative, or until the information becomes more action-relevant.

We’re nervous about explicitly selecting for actions with high agreement and filtering out actions with disagreement. We want to take actions that we strongly believe will advance our priorities, even when not all members agree that those actions do so. If we avoid actions with disagreement deliberately, our beliefs risk becoming distorted by incorrect consensus opinions. As a result, new members may not join the Alliance unless their beliefs accord with our preexisting consensus. This distorted member body could distort actions further, which could further distort the member body, until the Alliance is defined by a narrow worldview. (This is all related to the memetic and group-think risks [Kyle](https://worldalliance.org/forum/post/16?replyId=314) wrote about.)

Finally, Mark and I agree with [Diane’s](https://worldalliance.org/forum/post/16?replyId=286) comment that sometimes “part of being cooperative is also being willing to perform actions that slightly deviate from your own values.”

> I would add that it might be better to begin by stating the questions, and then giving the office''s stances (perhaps even as a comment instead of in the post body).

Good suggestion - we have moved the questions to the top (though retained them at the bottom as well for ease of reading). 

We considered leaving our perspective in a comment, but we wanted to provide a basic perspective for members to build upon to start the discussion. As a result, we would have had to pin our comment, which felt more self-important than keeping our perspective in the post body.

> Understanding any avenues in which this action did genuinely change your beliefs / alliance roadmap, or at least cause you to have more uncertainty on some area or investigate it further, would help us.

We plan to write an action update once the action is complete, summarizing major points that members have brought up.

One thing that stood out to us was the volume of comments about wanting to see more progress updates. In response, we’ve:
- Added a temporary, textual roadmap to our Information page that we plan to make more detailed and visual in the future.
- Moved action updates out of the Notifications page onto the homepage so that they are more prominent.
- Decided with the team to run some kind of regular action keeping members up-to-date on our internal activities, key stats, and so on. We aren’t sure exactly what this will look like yet, but we should begin to do this in the next few weeks.

> I don''t mean to be overly negative but I do believe negation is a crucial part of any self-critical constructive process :)

:)', '[]', '2026-02-04 22:58:35.600289-08', '2026-02-04 23:08:49.369033-08');
INSERT INTO public.editable_content VALUES (334, 'One of my favorite blog posts is called "Staring into the abyss as a core life skill": https://www.benkuhn.net/abyss/. Brief explanation from the author: "Staring into the abyss means thinking reasonably about things that are uncomfortable to contemplate, like arguments against your religious beliefs, or in favor of breaking up with your partner." I unfortunately think more skilled staring into the abyss and acting appropriately in response, is becoming increasingly important, quite rapidly. 

Ethnopopulism is on the rise, and democracies around the world are crumbling. Extreme global poverty reduction appears to be slowing down. Deaths from factory farming and CO2 emissions continue to increase. I''m worried that by default, rapid advances in AI capabilities, combined with the people who lead frontier AI labs and the countries most able to regulate them, will lead to concentration of power and abuse of said power, reckless development, and incompetent regulation of these technologies. It is easier emotionally not to confront what is difficult about the world. Global issues are no government''s or individual''s responsibility to solve. They''re also everyone''s responsibility to solve. 

I don''t have particularly insightful recommendations. I think it''s useful to seriously consider making solving huge global problems - including quite urgent ones - the alliance''s and our individual responsibilities. And it''s also useful to figure out how to make trying our best to solve them rewarding, enjoyable, and sustainable. One way is to do so in community/alliance with others. :)', '[]', '2026-02-04 23:21:09.088215-08', '2026-02-04 23:21:09.088215-08');
INSERT INTO public.editable_content VALUES (343, '> but if it comes to it, which may happen when the alliance strives for its higher goals, i don''t feel qualified to make decisions on if a cost to family A is outweighed by a benefit to family B. i''d like to see how other alliance members critically engage with actions that are deeply moral. would a majority agreement change my own morals? what measures will be used to justify an action?

We strongly desire to advance our priorities in a way that improves the world for everyone. Unfortunately, the world will force tradeoffs that mean it won''t always be possible to do this. I don''t think there''s an easy answer here, but agree that we should incorporate local knowledge, be highly cautious, and think carefully about all the consequences of our actions. 

We''ve also considered some other ways of approaching tradeoffs, although all of this is a bit hand-wavy and theoretical, and no general prescription can be made without knowing the specific details: 
* As we grow, we will develop a long-term plan that makes nearly everyone better off, and explain how specific actions are part of this plan. So actions with tradeoffs will ideally move us towards a long-term future without those tradeoffs.
* If the tradeoffs for an action are harsh, we might pair it with an action with the "opposite" tradeoffs, so both actions together result in nearly everyone being better off on a shorter timescale.
* In situations where tradeoffs are made, we will be extra careful to communicate the reasoning behind the tradeoff.', '[]', '2026-02-05 13:42:18.834121-08', '2026-02-05 13:42:18.834121-08');
INSERT INTO public.editable_content VALUES (344, 'thanks mark!! ', '[]', '2026-02-05 22:09:15.308281-08', '2026-02-05 22:09:15.308281-08');
INSERT INTO public.editable_content VALUES (345, 'Welcome, Clare!', '[]', '2026-02-05 22:09:44.430025-08', '2026-02-05 22:09:44.430025-08');
INSERT INTO public.editable_content VALUES (346, '> Honestly, I think the biggest way to uphold this principle is to show that other people are doing it too.

I like this thought, and will think about ways to do it. One idea for the future is to sometimes pair an action that benefits Party A and costs Party B with an action that benefits Party B and costs Party A.', '[]', '2026-02-06 10:17:26.634071-08', '2026-02-06 10:17:26.634071-08');
INSERT INTO public.editable_content VALUES (347, 'Welcome Jaden!', '[]', '2026-02-06 11:35:18.15242-08', '2026-02-06 11:35:18.15242-08');
INSERT INTO public.editable_content VALUES (348, 'Thanks, I’m excited to be a part of this!', '[]', '2026-02-06 11:44:10.720081-08', '2026-02-06 11:44:10.720081-08');
INSERT INTO public.editable_content VALUES (349, 'Welcome Rona!', '[]', '2026-02-06 16:48:21.01564-08', '2026-02-06 16:48:21.01564-08');
INSERT INTO public.editable_content VALUES (350, 'Seconded! A book that I think would be great reading (esp for the Alliance leadership) is The Power of Us - big focus on using learnings from social psych to fully realize the benefit of diverse groups. I think this will be especially important as membership increases and the Alliance takes on increasingly bigger pieces of these complex problems.', '[]', '2026-02-06 18:33:25.962473-08', '2026-02-06 18:33:25.962473-08');
INSERT INTO public.editable_content VALUES (351, 'I think a culture of (self-)education is going to be an important part of the Alliance - I see this as being largely a combo of the "Responsibility" and "Outcomes Focus" pillars mentioned above, but one could argue all three pillars contribute. As more people join the Alliance and it looks to tackle increasingly hard problems and subproblems of interest, it''s quite likely that many members will be well-intentioned but inadequately informed about current circumstances, proposed solutions, consequences, costs, etc. As a result, I think members have an obligation to seek more information about the actions they participate in, and teach and learn from each other as well - this can be as simple as staying informed on the news regularly, but might be more involved too (e.g. picking up a book in a topic of interest or starting a discussion post on the Alliance forum). Likewise, I think Alliance leadership would do well to prioritize education as a part of the creation/facilitation of specific actions, because it''s possible that in being asked to do something as part of the Alliance, members encounter an issue in depth for the first time. This might even come in the form of bringing on domain-specific researchers or educators as staff, depending on the topic at hand. 

I think it''s really important for the overall morale and effectiveness of the Alliance that in a news cycle dominated by big problems that seem insurmountable or unsolvable, or even untouchable by regular individuals, we learn that we can actually do something, and specifically what we can do (and as mentioned by many other people on this post, that we see the progress we help create). Although "education" is quite broad and can be very complex, I think it''s still a sound assumption that the more the Alliance knows (on average and in aggregate), the ceiling of good grows monotonically. 
', '[]', '2026-02-06 18:51:07.545635-08', '2026-02-06 18:51:07.545635-08');
INSERT INTO public.editable_content VALUES (352, 'Welcome!', '[]', '2026-02-07 20:55:09.250553-08', '2026-02-07 20:55:09.250553-08');
INSERT INTO public.editable_content VALUES (353, 'Great job, way to stay consistent, starting a plan is key.', '[]', '2026-02-07 20:55:27.485125-08', '2026-02-07 20:55:27.485125-08');
INSERT INTO public.editable_content VALUES (354, 'Great! Way to stay outside your comfort zone!', '[]', '2026-02-07 20:56:23.412793-08', '2026-02-07 20:56:39.995427-08');
INSERT INTO public.editable_content VALUES (355, 'Hm I think I would go even further than that and be worried that in at least some cases the reasons people aren''t doing actions that seem obviously good to us aren''t because the person is insufficiently altruistic or coordinated or motivated enough, but because the actions aren''t actually positive (or at least aren''t a good use of time relative to other things). I think this is especially true for anything that''s a "pressure activity" where it''s a somewhat zero-sum bid to allocate resources or attention to one thing rather than other things. 

Maybe something like "humility" is also what I care about here (that''s important both for taking the right actions and for not alienating people)', '[]', '2026-02-08 16:28:59.710181-08', '2026-02-08 16:28:59.710181-08');


--
-- Data for Name: form; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.form VALUES (23, '[DUMMY] Invite page form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "field-1760488463558", "kind": "checkbox", "label": "**Step 1**: Tell us which cafe you will contact.", "required": false}, {"id": "field-1760488474644", "kind": "text", "label": "", "required": false}, {"id": "field-1760488479989", "kind": "checkbox", "label": "**Step 2**: Contact the cafe with the message we wrote [here](here).", "required": false}]}], "title": "[DUMMY] Invite page form", "submit": {"label": "Complete"}, "description": ""}', '2025-10-14 17:34:18.407933-07', '2025-10-14 17:34:47.037917-07');
INSERT INTO public.form VALUES (8, 'Habit change discussion form', '{"slug": "untitled-form", "pages": [{"id": "page-1", "title": "", "fields": [{"id": "field-1758065903021", "kind": "checkbox", "label": "Leave 1 response and upvote/comment on other ideas you find interesting [on this forum discussion](https://worldalliance.org/forum/post/6).", "required": true}]}], "title": "Habit change discussion form", "submit": {"label": "Complete"}, "version": 1, "description": ""}', '2025-09-16 16:40:28.032135-07', '2025-10-09 16:00:34.936457-07');
INSERT INTO public.form VALUES (11, 'Unsubscribe catalog form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "field-1758667704623", "kind": "radio", "label": "Which of the following applies to you:", "options": [{"label": "I can easily find a catalog I wish to unsubscribe from.", "value": "option1"}, {"label": "I do not receive catalogs I wish to unsubscribe from.", "value": "option2"}, {"label": "I recieve catalogs I wish to unsubscribe from, but I must delay until I receive one in the mail.", "value": "option3"}], "required": true}, {"id": "field-1758666877824", "kind": "checkbox", "label": "**Step 1**: Find a catalog you wish to unsubscribe from.", "required": true, "visibleIf": {"when": "field-1758667704623", "equals": "option1"}}, {"id": "field-1758666878538", "kind": "checkbox", "label": "**Step 2**: Make an account at [https://catalogchoice.org/](https://catalogchoice.org/) (a non-profit working to stop junk mail).", "required": true, "visibleIf": {"when": "field-1758667704623", "equals": "option1"}}, {"id": "field-1758666879024", "kind": "checkbox", "label": "**Step 3**: Search for the catalogue you wish to unsubscribe from and follow the listed instructions.", "required": true, "visibleIf": {"when": "field-1758667704623", "equals": "option1"}}]}], "title": "Unsubscribe catalog form", "submit": {"label": "Complete"}, "description": ""}', '2025-09-23 15:52:43.332676-07', '2025-09-23 16:20:23.589062-07');
INSERT INTO public.form VALUES (13, 'Instagram creation', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "field-1758750281312", "kind": "radio", "label": "Do you have an Instagram account?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No", "value": "option2"}], "required": true}, {"id": "field-1758750312741", "kind": "text", "label": "What is your handle?", "required": true, "visibleIf": {"when": "field-1758750281312", "equals": "option1"}, "placeholder": "@example_handle"}, {"id": "field-1758750519336", "kind": "text", "label": "Go to [instagram.com](https://instagram.com) and create an account. Then put your handle below.", "required": true, "visibleIf": {"when": "field-1758750281312", "equals": "option2"}, "placeholder": "@example_handle"}]}], "title": "Instagram creation", "submit": {"label": "Complete"}, "description": ""}', '2025-09-24 14:52:12.20859-07', '2025-09-24 14:52:12.20859-07');
INSERT INTO public.form VALUES (12, 'Register on national do not mail list', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "field-1758669782900", "kind": "checkbox", "label": "**Step 1**: Fill out the registration at [https://www.directmail.com/mail_preference/](https://www.directmail.com/mail_preference/).", "required": true}, {"id": "field-1758669783583", "kind": "checkbox", "label": "**Step 2**: After submitting your registration, click the confirmation email that is sent to you.", "required": true}]}], "title": "Register on national do not mail list", "submit": {"label": "Complete"}, "description": ""}', '2025-09-23 16:26:30.162208-07', '2025-09-23 16:29:38.996549-07');
INSERT INTO public.form VALUES (14, 'Member quotes form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1759786915272", "kind": "text", "text": "In the near future, we will expand our team, collect endorsements from public figures, and solicit donations from philanthropists.\n\nIn outreach to these potential supporters, the office plans to feature quotes from members about their interest in the Alliance.\n\nSome examples taken from member profile descriptions:\n* “I am very concerned about where the world is going, and I expect that the Alliance will be able to help to nudge all of us in better directions.”\n* “I am very excited about the Alliance. Every small achievement towards its goals will produce lasting impacts on the wellbeing of our humanity.”", "markdown": true}, {"id": "field-1759787148637", "kind": "textarea", "rows": 3, "label": "What concerns you about the world, and what about the Alliance is interesting or exciting to you? Answers that are 2+ sentences are preferable.", "required": true}, {"id": "field-1759958254830", "kind": "checkbox", "label": "Make my quote anonymous to external supporters.", "required": false}]}], "title": "Member quotes form", "submit": {"label": "Complete"}, "description": ""}', '2025-10-06 13:25:29.550454-07', '2025-10-13 14:23:36.070428-07');
INSERT INTO public.form VALUES (10, 'Sign BYOC Letter', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1759788532407", "kind": "text", "text": "We''re trialing a program in which we ask businesses to make policy changes and, in return, members do media outreach on behalf of the businesses.\n\nWe''ve successfully assembled a coalition of 5 cafes with 11 total locations that will now encourage customers to bring their own cups by posting flyers with information about the impact of disposable cup waste.", "markdown": true}, {"id": "block-1759974138020", "kind": "spacer", "size": "xs"}, {"id": "block-1759972867918", "alt": "Image", "src": "https://worldalliance.org/api/images/1759973522236.webp", "kind": "image"}, {"id": "block-1759974143473", "kind": "spacer", "size": "xs"}, {"id": "block-1759973548099", "kind": "text", "text": "By signing this letter, you:\n- Make it more likely that a reporter rewards the positive action of this coalition.\n- Make it more likely that we can run larger-scale versions of this program in the future.\n\nPlease review:", "markdown": true}, {"id": "block-1759788761671", "html": "<p class=\"bg-zinc-100 px-5 py-4\">We are members of a citizens group writing to you about an initiative that might interest your readers: 5 cafes in Washington with 12 total locations have formed a coalition that will adopt and promote bring-your-own-cup policies using research-backed materials.<br/><br/>\n\nA feature of this coalition would bring attention to cafe owners who are taking action for the public good. It may also help readers discover cafes that align with their values and encourage other cafes to join the coalition.<br/><br/>\n\nWe respectfully urge you to share this story of local business leadership and impact.\n</p>", "kind": "html"}, {"id": "field-1759971606001", "kind": "text", "label": "", "required": false, "placeholder": "Sign with your full name"}]}], "title": "Sign BYOC Letter", "submit": {"label": "Complete"}, "description": ""}', '2025-09-23 14:20:36.620832-07', '2025-10-08 19:50:40.814913-07');
INSERT INTO public.form VALUES (55, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1768342624161", "kind": "text", "text": "The office has arranged for 4 experts to answer members’ questions about international cooperation:\n\n- [Fareed Yasseen](https://en.wikipedia.org/wiki/Fareed_Mustafa_Kamil_Yasseen), former Iraqi Ambassador to the United States; former Iraq Climate Envoy and adviser to the Prime Minister on climate change.\n- [Janos Pasztor](https://en.wikipedia.org/wiki/Janos_Pasztor_(diplomat)), former UN Assistant Secretary-General for Climate Change.\n- [Brice Lalonde](https://en.wikipedia.org/wiki/Brice_Lalonde), former French Minister of the Environment; Executive Coordinator of United Nations Conference on Sustainable Development.\n- [Laurence Pollier](https://fr.linkedin.com/in/laurence-pollier-cc2024), former UNFCCC Subsidiary Body for Implementation Coordinator.\n\nOn January 7th, 2026, the U.S. decided to [withdraw from 66 international institutions](https://www.whitehouse.gov/presidential-actions/2026/01/withdrawing-the-united-states-from-international-organizations-conventions-and-treaties-that-are-contrary-to-the-interests-of-the-united-states/). Among these institutions are:\n\n- **The United Nations Framework Convention on Climate Change (UNFCCC)**, which is the treaty under which international negotiations on climate change occur. The UNFCCC has near-universal membership: prior to the US withdrawal, 198 countries were party to the agreement. It is responsible for the annual Conference of the Parties (COP) meetings that host international climate negotiations, including those that led to the 1997 Kyoto Protocol and 2015 Paris Agreement.\n- **The Intergovernmental Panel on Climate Change (IPCC)**, which is the UN body in charge of producing scientific assessments and widely considered the leading scientific authority on climate change. IPCC reports are used by governments and by the UNFCCC for decision-making.\n\nThe U.S. has been a member of the IPCC since 1988 and ratified the UNFCCC in 1992. U.S. participation in these institutions is widely viewed as essential to the credibility, ambition, and implementation of global climate agreements.\n\nTo help members better understand the U.S. withdrawal, as well as the role of international cooperation in combating climate change and other issues, the above experts will aim to answer all questions that members ask in the next 7 days.\n\n**Forum post where the discussion will occur: [https://worldalliance.org/forum/post/15](https://worldalliance.org/forum/post/15)**\n\nAsk any questions on the forum post. Topics that may be of interest:\n\n- Consequences of the U.S. withdrawal (e.g. on agenda-setting, funding, scientific expertise, specific countries’ attitudes towards cooperation, global balance of power, biosphere)\n- Contextualization of U.S. withdrawal (e.g. how it relates to the U.S.’s previous withdrawal from the Paris Agreement)\n- What can be done next, and by whom\n- Successes and limitations of international cooperation on climate change and other issues\n- The experts’ general beliefs and experiences", "markdown": true}, {"id": "field-1768342749524", "kind": "checkbox", "label": "I have posted any questions I want to ask on the forum.", "required": true}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-13 14:17:09.908084-08', '2026-01-13 14:28:13.962615-08');
INSERT INTO public.form VALUES (26, 'Nonprofit website feedback form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1761336676218", "kind": "text", "text": "The office has designed a series of questions whose responses could help three nonprofits increase donation rates. The questions vary in specificity so that we can learn which forms of feedback are most useful.", "markdown": false}, {"id": "field-1761437194294", "kind": "radio", "label": "Which device are you using?", "options": [{"label": "Computer or tablet", "value": "computer"}, {"label": "Phone", "value": "phone"}], "required": true}, {"id": "block-1761336685697", "kind": "header", "text": "GiveDirectly", "level": 4}, {"id": "block-1761336718366", "kind": "text", "text": "Go to [givedirectly.org](https://givedirectly.org) and explore the site for two minutes.", "markdown": true}, {"id": "field-1761336699662", "kind": "checkbox", "label": "Once you’re done, check this box to reveal the questions.", "required": true}, {"id": "field-1761336754218", "kind": "radio", "label": "**Question 1**: Have you been to GiveDirectly''s website before?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true, "visibleIf": {"when": "field-1761336699662", "equals": true}}, {"id": "block-1761426500511", "alt": "Image", "src": "https://worldalliance.org/api/images/1761437242902.webp", "kind": "image", "visibleIf": [{"when": "field-1761336699662", "equals": true}, {"when": "field-1761437194294", "equals": "computer"}]}, {"id": "field-1761336805914", "kind": "radio", "label": "**Question 2**: Did you click any of the text underneath \"Giving cash is\"?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true, "visibleIf": [{"when": "field-1761336699662", "equals": true}, {"when": "field-1761437194294", "equals": "computer"}]}, {"id": "block-1761437303345", "alt": "Image", "src": "https://worldalliance.org/api/images/1761437381229.webp", "kind": "image", "visibleIf": [{"when": "field-1761437194294", "equals": "phone"}, {"when": "field-1761336699662", "equals": true}]}, {"id": "field-1761437267761", "kind": "radio", "label": "**Question 2**: Did you tap the arrows underneath \"Giving cash is\"?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true, "visibleIf": [{"when": "field-1761437194294", "equals": "phone"}, {"when": "field-1761336699662", "equals": true}]}, {"id": "field-1761336846409", "max": 6, "min": 0, "kind": "number", "label": "**Question 3**: How many recipient stories did you read on the home page? There were 6 total images that revealed stories if you hovered or tapped.", "required": true, "visibleIf": {"when": "field-1761336699662", "equals": true}}, {"id": "field-1761336991077", "kind": "radio", "label": "**Question 4**: Did you leave the home page?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true, "visibleIf": {"when": "field-1761336699662", "equals": true}}, {"id": "field-1761337170071", "kind": "multiselect", "label": "**Question 5**: Which quotes reflect most positively on GiveDirectly? (max 3)", "options": [{"label": "I cannot stop thanking GiveDirectly. Thank you, thank you. - Victor in Kenya", "value": "option1"}, {"label": "[GiveDirectly’s] support allowed me to take my daughter, who was in critical condition, to the hospital and save her life. - Zawadi in Kenya", "value": "option2"}, {"label": "I plan to spend my recent transfer paying for my next term school fees, buying books and also livestock. - Lonely in Malawi", "value": "option3"}, {"label": "When I received the transfer, the first thing I bought was what I had dreamt of for many years; a sewing machine. Today, that dream has become a reality. I have set up a small but thriving tailoring shop in our market centre. - Naomi in Kenya", "value": "option4"}, {"label": "It’s hard to think of anything that should be changed, as they’ve approached this perfectly—letting us be in charge of our choices, believing in us, and providing us with resources we need. - Sabastian in Kenya", "value": "option5"}], "required": true, "visibleIf": {"when": "field-1761336699662", "equals": true}, "maxSelections": 3, "randomizeOptions": true}, {"id": "field-1761337417897", "kind": "radio", "label": "**Question 6**: Would you prefer the home page display short recipient quotes (like the ones in question 5) or longer recipient stories?", "options": [{"label": "Short quotes", "value": "short"}, {"label": "Longer stories", "value": "long"}], "required": true, "visibleIf": {"when": "field-1761336699662", "equals": true}, "randomizeOptions": true}, {"id": "field-1761440068192", "kind": "textarea", "rows": 1, "label": "**Question 7**: Any other comments about your experience?", "required": false, "visibleIf": [{"when": "field-1761336699662", "equals": true}]}]}, {"id": "page-2", "title": "Page 2", "fields": [{"id": "block-1761337616798", "kind": "header", "text": "New Incentives", "level": 4}, {"id": "block-1761337627097", "kind": "text", "text": "Go to [newincentives.org](https://newincentives.org) and explore the site for 2 minutes.", "markdown": true}, {"id": "field-1761347378494", "kind": "checkbox", "label": "Once you’re done, check this box to reveal the questions.", "required": true}, {"id": "field-1761347389211", "kind": "radio", "label": "**Question 1**: Have you been to New Incentives'' website before?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true, "visibleIf": [{"when": "field-1761347378494", "equals": true}]}, {"id": "field-1761347396478", "kind": "radio", "label": "**Question 2**: Which tagline do you prefer:", "options": [{"label": "Guided by evidence, we provide cash incentives to increase childhood vaccination rates.", "value": "option1"}, {"label": "Paying caregivers to vaccinate their children is proven to prevent disease.", "value": "option2"}, {"label": "We pay caregivers to vaccinate their children. ", "value": "option3"}], "required": true, "visibleIf": [{"when": "field-1761347378494", "equals": true}], "randomizeOptions": true}, {"id": "field-1761439890672", "kind": "textarea", "rows": 1, "label": "**Question 3**: The “Our Reach” section claims 5.8 million “Infants Enrolled.” What do you think \"infants enrolled\" means?", "required": true, "visibleIf": [{"when": "field-1761347378494", "equals": true}]}, {"id": "field-1761439912821", "kind": "textarea", "rows": 1, "label": "**Question 4**: The “Our Reach” section claims 25 million “Cash Transfers Disbursed.” What do you think \"cash transfers disbursed\" means?", "required": true, "visibleIf": [{"when": "field-1761347378494", "equals": true}]}, {"id": "field-1761439934321", "kind": "textarea", "rows": 1, "label": "**Question 5**: The “Our Reach” section claims 87 million “Vaccinations Encouraged.” What do you think \"vaccinations encouraged\" means?", "required": true, "visibleIf": [{"when": "field-1761347378494", "equals": true}]}, {"id": "field-1761439964054", "kind": "textarea", "rows": 1, "label": "**Question 6**: Any other comments about your experience?", "required": false, "visibleIf": [{"when": "field-1761347378494", "equals": true}]}]}, {"id": "page-3", "title": "Page 3", "fields": [{"id": "block-1761347774744", "kind": "header", "text": "Learning Alliance", "level": 4}, {"id": "block-1761347782343", "kind": "text", "text": "Go to [learningalliance.net](https://learningalliance.net) and explore the site for 2 minutes.", "markdown": true}, {"id": "field-1761347970572", "kind": "checkbox", "label": "Once you’re done, check this box to reveal the questions.", "required": true}, {"id": "field-1761440109324", "kind": "textarea", "rows": 1, "label": "**Question 1**: Based on what you''ve seen, what does the Learning Alliance do? Please answer in 1-2 sentences.", "required": true, "visibleIf": [{"when": "field-1761347970572", "equals": true}]}, {"id": "field-1761440130339", "kind": "textarea", "rows": 1, "label": "**Question 2**: What feedback do you have for the Learning Alliance website? How could it be improved?", "required": true, "visibleIf": [{"when": "field-1761347970572", "equals": true}]}, {"id": "field-1761440143959", "kind": "textarea", "rows": 1, "label": "**Question 3**: Any other comments about your experience?", "required": false, "visibleIf": [{"when": "field-1761347970572", "equals": true}]}]}], "title": "Nonprofit website feedback form", "submit": {"label": "Complete"}, "description": ""}', '2025-10-24 13:12:16.057719-07', '2025-10-30 23:28:36.235553-07');
INSERT INTO public.form VALUES (28, 'Reminder personalization form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1761350176614", "kind": "text", "text": "The office is testing a **community support program** in which you can receive task reminders from a fellow Alliance member. The goals of this program are to make task reminders more personal and effective and to increase community connection.\n\nUnder the program, you would be assigned a dedicated contact responsible for helping you complete tasks.\n\n1. By default, they won’t reach out to you unless a deadline is approaching, in which case they may send you a text or give you a call. \n2. However, if you have particular preferences, you can let them know. For example, you could ask them to call in the middle of the week, or to send you a text earlier than the deadline if you’re going to go on vacation.\n3. You can message them with any questions you have about any task.\n\nThis program is optional; however, **participation is strongly recommended.**\n\nAt first, we’ll have the same designated contact available to everyone: [Bryan Xu](https://worldalliance.org/user/20), a member who has volunteered to start this program. Eventually, anyone who would like to take responsibility for a member group will be able to do so.", "markdown": true}, {"id": "field-1761350573202", "kind": "radio", "label": "Would you like a designated contact?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true}, {"id": "field-1761428619777", "kind": "checkbox", "label": "Please add Bryan Xu to your contact list: 1-626-664-1534", "required": true, "visibleIf": [{"when": "field-1761350573202", "equals": "yes"}]}, {"id": "field-1761428648994", "kind": "phone", "label": "What is your phone number?", "required": true, "visibleIf": [{"when": "field-1761350573202", "equals": "yes"}, {"validatorId": 18, "resultEquals": false}], "placeholder": "Enter phone number"}, {"id": "field-1761428680673", "kind": "timezone", "label": "What''s your timezone?", "required": true, "visibleIf": [{"when": "field-1761350573202", "equals": "yes"}]}, {"id": "field-1761428690829", "kind": "time", "label": "What time of day would you prefer to be contacted?", "required": true, "visibleIf": [{"when": "field-1761350573202", "equals": "yes"}]}, {"id": "field-1761428747272", "kind": "radio", "label": "Are you interested in becoming a designated contact for other members?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true, "visibleIf": [{"when": "field-1761350573202", "equals": "yes"}]}, {"id": "block-1761428782351", "kind": "text", "text": "We’re moving from email to text notifications as our default for reminders. You can still disable text notifications in your settings.", "markdown": false, "visibleIf": [{"when": "field-1761350573202", "equals": "no"}, {"validatorId": 18, "resultEquals": false}]}, {"id": "field-1761428827376", "kind": "phone", "label": "What is your phone number?", "required": true, "visibleIf": [{"when": "field-1761350573202", "equals": "no"}, {"validatorId": 18, "resultEquals": false}], "placeholder": "Enter phone number"}, {"id": "field-1761428860142", "kind": "timezone", "label": "We''re also planning to personalize notification times. What’s your timezone?", "required": true, "visibleIf": [{"when": "field-1761350573202", "equals": "no"}]}, {"id": "field-1761428862322", "kind": "time", "label": "What time of day would you prefer to be sent reminders?", "required": true, "visibleIf": [{"when": "field-1761350573202", "equals": "no"}]}, {"id": "field-1761428865451", "kind": "radio", "label": "Are you interested in becoming a designated contact for other members?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true, "visibleIf": [{"when": "field-1761350573202", "equals": "no"}]}]}], "title": "Reminder personalization form", "submit": {"label": "Complete"}, "description": ""}', '2025-10-24 16:56:01.714587-07', '2025-10-28 13:48:20.168013-07');
INSERT INTO public.form VALUES (50, 'Invite friends and family to fill out our AI privacy survey', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1765858054922", "kind": "text", "text": "Two weeks ago, members completed a survey designed to measure awareness of AI data use practices. The survey revealed that:\n1. Most members are uncomfortable with their data being used to train AI.\n2. Most members were unaware of settings that allowed them to control whether their data was used to train AI.\n\nThis week, members will ask friends and family to fill out the same survey, which will:\n1. Help your friends and family control their data.\n2. Bolster a follow-up campaign with additional evidence. We plan to share our data with relevant researchers, journalists, non-profits, and contacts at OpenAI.\n\nWe’ve created unique survey links so that we can track which members bring in which survey respondents. After the action, we’ll share an update recognizing the members who brought in the most survey respondents (with permission) and tell you which respondents you brought in.\n", "markdown": true}, {"id": "block-1765860849997", "kind": "header", "text": "Direct messages", "level": 3}, {"id": "block-1765858127272", "kind": "text", "text": "Send your unique survey link to at least 3 people, e.g. friends or family members.\n", "markdown": true}, {"id": "field-1765858138855", "kind": "custom", "label": "Action share URL", "required": false, "componentId": "action-share-url", "componentConfig": {"actionId": 55}}, {"id": "block-1765858234605", "kind": "text", "text": "An example message:\n\n“Hi [name], I am part of an online group called the Alliance that takes weekly action to create positive change. This week, we’re running a survey to understand whether people want their data used to train AI models. Could you fill out this survey? It will tell you which settings to toggle if you want to keep your data private and only takes 5 minutes to complete. Thanks! [link]”", "markdown": true}, {"id": "field-1765858269188", "min": 3, "kind": "number", "label": "How many people did you send the survey to?", "output": {"output": true}, "required": true}, {"id": "block-1765864933850", "kind": "header", "text": "Flyer (optional)", "level": 3}, {"id": "block-1765864603905", "kind": "text", "text": "**We created [this page](https://worldalliance.org/flyerexport) to allow you to download a custom flyer** with a QR code that goes to your unique survey link.", "markdown": true}, {"id": "block-1765864634753", "alt": "Image", "src": "https://worldalliance.org/api/images/1765864640250.webp", "kind": "image", "caption": "To test our flyer, we asked a member to display it at their farmers’ market booth."}, {"id": "field-1765864628370", "kind": "file", "label": "Optional: print out our flyer, post it in a public location (e.g. a telephone pole, a bulletin board at your workplace), and upload a photo.", "output": {"output": true}, "required": false}, {"id": "block-1765864944883", "kind": "header", "text": "Other channels (optional)", "level": 4}, {"id": "field-1765864656855", "kind": "multiselect", "label": "Optional: bring in additional respondents via other channels. Please select the channels you plan to use (this will reveal follow-up questions).", "options": [{"label": "**Share with a group** (e.g. Telegram channel, Discord server, mailing list)", "value": "social"}, {"label": "**Share on social media** (e.g. Instagram story, LinkedIn post)", "value": "group"}, {"label": "**Other**", "value": "other"}], "required": false}, {"id": "field-1765864748888", "kind": "number", "label": "How many people were in the group you shared the survey to?", "output": {"output": true}, "required": true, "visibleIf": [{"when": "field-1765864656855", "includesOption": "social"}]}, {"id": "field-1765864771295", "kind": "file", "label": "Upload a screenshot of your post or story.", "output": {"output": true}, "required": true, "visibleIf": [{"when": "field-1765864656855", "includesOption": "group"}]}, {"id": "field-1765864785932", "kind": "number", "label": "How many followers do you have?", "required": false, "visibleIf": [{"when": "field-1765864656855", "includesOption": "group"}]}, {"id": "field-1765864800934", "kind": "textarea", "rows": 2, "label": "Other:", "output": {"output": true}, "required": true, "visibleIf": [{"when": "field-1765864656855", "includesOption": "other"}]}]}], "title": "Invite friends and family to fill out our AI privacy survey", "submit": {"label": "Complete"}, "description": "", "outputViews": [{"id": "output-view-1765858840821-rm", "type": "default", "title": "View 1", "blocks": [{"id": "output-field-1765858848053-jj9e", "format": "textonly", "fieldId": "field-1765858269188", "showLabel": true, "labelOverride": "Number of people I shared the survey with"}, {"id": "output-field-1765861724160-qbl2", "format": "textonly", "fieldId": "field-1765864628370", "showLabel": true, "labelOverride": "Flyer photo"}, {"id": "output-field-1765858873487-qr8h", "format": "textonly", "fieldId": "field-1765864748888", "showLabel": true, "labelOverride": "Number of people in the group that I shared to"}, {"id": "output-field-1765858920519-ytkl", "format": "textonly", "fieldId": "field-1765864771295", "showLabel": true, "labelOverride": "Social media post or story"}, {"id": "output-field-1765858922086-ey0i", "format": "textonly", "fieldId": "field-1765864800934", "showLabel": true, "labelOverride": "Other"}], "description": ""}]}', '2025-12-15 20:20:14.479243-08', '2025-12-18 08:38:06.945225-08');
INSERT INTO public.form VALUES (51, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1766550158018", "kind": "text", "text": "2 weeks ago, Alliance members submitted issues of concern in [Prepare to submit a public comment to your local government](https://worldalliance.org/actions/53).\n\nSince then, [Eamon](https://worldalliance.org/member/24), a staff member, compiled 1-3 suggestions for each member''s public comment. **These suggestions are not necessarily representative of Eamon’s, or the office’s, beliefs – they were selected to be diverse, reasonably specific, and likely underrepresented in typical public comments.**\n\nThis week, members will use these suggestions to submit public comments. Over the next few weeks, the office will analyze meeting minutes for members’ municipalities. We will notify you if your comments were addressed in any meetings.", "markdown": true}, {"id": "block-1766550313973", "kind": "header", "text": "Step 1", "level": 2}, {"id": "block-1766550338186", "kind": "text", "text": "Read the suggestion(s) compiled for you below.", "markdown": false}, {"id": "block-1766550397857", "kind": "quote", "text": "Placeholder for member''s issue of concern", "manualPerUser": true, "manualUserContent": {"7": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: SF dumps sewage into the Bay during storms. This is bad for recreation, kills wildlife, threatens endangered species. This is an environmental issue."}, "10": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: I am concerned about the tension between the rising cost of living, to which the natural solution is more housing, and the wishes of people who live in SF to not have more housing built in their cities. I am generally aware of the NIMBY and YIMBY movements, but don''t follow the discourse closely and don''t know what policy levers these groups try to influence. I''m especially interested in policy solutions that consider both the preference of many people in SF to not have more housing vs general economic/social benefits of having more housing."}, "11": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Berkeley''s City Council recently voted to encrypt police radio channels. Without transparency, Berkeley risks corrupt police activity and stepping away from democracy."}, "12": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: gas powered leaf blowers are excessive air and noise environmental polluters, often exceeding 75 decibels and the emissions of internal combustion engines."}, "15": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: I''m concerned about the SFMTA system not being allocated sufficient budget. I''ve heard about imminent pretty drastic cuts to many services, which seems not great to me. This is related to poverty / economic equality as the most affected citizens are those who rely on the affordable transportation that buses, etc. provide them."}, "17": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Too many homeless people, little if any progress to effectively deal with root causes. Real estate prices too high to house low income families. No effort to promote minimum basic income and building low income housing."}, "19": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: I searched for environmental impact in San Francisco. It is connected to our concern around environmental destruction. The article stated that although the marshes have improved with the work humans have done over the years, when you go inland toward the Delta, the quality of water and volume of water is poor. This is impacting fish and will have other downstream impacts as it continues. The report card that is issued as part of this study also refreshes once every 5 years which means it’s something to pay attention to."}, "20": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Homelessness. There are more than 100 homeless people in Arcadia. Economic hardship is one of the major factors."}, "21": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: After 20 minutes searching, I didn’t find an item that I think very closely related the  Alliance’s priorities.  I think AI education could be one. But I am not sure how a municipal government can help."}, "23": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Poverty rate in SF increased dramatically in 2023."}, "24": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: This story discusses increased flooding in a section of town. In recent years, I have noticed increased runoff in our community after rain storms, which accumulates heavy metals and pesticides that are dangerous for the environment and our watershed. This flooding is, in part, due to our town’s development of formerly-permeable land (like woodlands) without building sufficient infrastructure to capture and retain rainwater. This relates to our focus area of environmental degradation."}, "26": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Wetland loss and overall watershed health in the bay area. This is important to me because it''s in my city and it has to do with the issue I feel strongest about."}, "29": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: The 16th Street and Mission intersection in San Francisco is a hotspot for fencing of stolen goods and drug use. Mayor Lurie has vowed to crack down on illegal activity in the area. However, maintaining an extended police presence there is only displacing people to other parts of Mission Street (e.g. 24th); now does it address the structural issues that lead to homeless and crime in the area. This issue relates to the Alliance''s priority on extreme poverty."}, "31": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: I''m choosing infill development. The housing shortage in the bay leads to housing being unaffordable for many. By increasing supply through building housing on previously wasted land, such as parking lots, the supply is able to be increased without the environmental impact of the urban sprawl growing."}, "35": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Though homelessness isn''t as obvious in Taipei as it is in cities in other countries, it does still exist. But possibly because it''s not as obvious, I don''t often hear about it either. I looked up homelessness because it''s related to poverty."}, "36": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: SOMA residents blame concentration of service centers in the community of enabling the houseless community to continue drug use and desecration. The conditions covered in this article focus mostly on residents safety concerns but they stem from poverty, one of the Alliance’s priority issues."}, "38": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: I would like to address homelessness in my neighborhood and surrounding neighborhoods. There are 2-3 spots in my neighborhood, Portola, that have unhoused people, mostly close to the highway. There is another spot under an intersection that has unhoused people. I''d like to get these people to systemic relief, both for them and also for the benefit of the housed people in my community."}, "42": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: The nashville participatory budgeting issue shows the caveats of trying to open up public voting for where city investment goes. The alliance requires participation to be a part of the decisions, in nashville participation was not required so it was not very effective before it got cut."}, "44": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Stratification of economic society in San Mateo and California at large. Larger trend of Asian and non-Hispanic white individuals seeing wage increases, all others seeing wage decreases and struggling in service jobs. This is related to poverty, which curiously is highest in California compared to all other states when one adjusts for the standard of living (PPIC)."}, "49": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Millbrae and the adjacent municipality of Burlingame are debating the process of how, where and how much to build barriers to protect against sea level rise. This is a complex issue with many stakeholders and views that aligns well with the Alliance''s overall mission to protect against environmental destruction."}, "51": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Phoenix area has been ranked as high as 4th worst in the country for high ozone days, which is a significant public health concern. Ground-level ozone (smog) is a powerful lung irritant react in the presence of sunlight and heat. This address into climate change concerns in Alliance’s priorities."}, "54": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: I was more inclined to do something about the Elephant Hill Open Space in El Sereno, which meets the preventing environmental harm goal, albeit in my county, not my city; but after over an hour of researching I couldn’t find some ongoing project that seemed amenable to a public comment."}, "55": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Menlo Park has deployed the Flock Safety cameras, which enable automated tracking of vehicles in the area. I consider this to be significant government overreach corresponding to a \"dangerous technological development\" and potentially \"decline of democratic institutions\" as it moves us significantly closer to a surveillance state."}, "62": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: The article explains how Trump’s federal crackdown on campus protests is pressuring even Berkeley to scale back its long standing free speech culture. This connects to the decline of democratic institutions because government pressure on universities weakens free expression and reduces the independence of places meant to encourage open debate."}, "64": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: There was an AI toy stuffed animal for children that gave inappropriate and potentially dangerous advice. I think it’s important to ensure impressionable children are not exposed to dangerous information. This specific toy was taken off the market, but this highlights a larger issue with lack of regulation of AI for younger audiences."}, "67": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: My chosen issue is the homelessness problem in San Jose. This is connected to the ideas of wealth inequality in a wealthy part of the United States."}, "68": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: I chose the issue of a lack of resources for homeless people in Boston struggling during winter months. This issue falls in line with the Alliance''s goal of helping end severe poverty. From different articles I read, homeless shelters are often lacking in funds and supplies to properly accommodate the influx of homeless individuals during harsh conditions. I believe advocating for action from the city would be a tremendous help and pave the way for further support and resources for the homeless community in Boston."}, "71": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Poverty in Boston."}, "72": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: The city of San Jose faces the issue of homelessness. \"Based on the  2023 City of San José Homeless Point in Time Count, more than 6,250 people are unhoused in the City on any given day, including nearly 4,500 who live outdoors.\" This connects to The Alliance''s priority of aiding extreme poverty, since I believe homelessness falls into that category."}, "76": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Herbicides have been detected on trees throughout Champaign-Urbana. They took leaf samples from many trees including in parks and around schools. Herbicide pollution relates to the priority of environmental destruction."}, "77": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Poverty in Hialeah. Cost of living has been burdening families in the city. Recently had local elections and cost of living has been the biggest issue."}, "79": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: lack of housing, air quality, and walking and cycling path, not pedestrain friendly..."}, "80": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: In NYC, SNAP benefits (food stamps) are changing in March 2026 for able bodied adults without disabilities where they need to begin reporting work or volunteer hours to continue receiving benefits. The government currently isn’t doing much to spread this information from what I can tell, and I could easily see a world where many qualifying people lose coverage because they didn’t realize they needed to report these. Poverty and food security is already a big issue in NYC, and SNAP problems worsen conditions for those that need it most."}, "82": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Discussion of how AI should be used in education at Berkeley high schools. Some relevance to dangerous technological development: how well do ordinary people understand AI, is it easy to ensure it''s net positive, are people making decisions in sensible ways (e.g. correct prioritization of concerns about environmental impact vs less effective learning vs inaccurate information)?"}, "83": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: At a high-level, barriers to human interaction and connection have increased due to internet, smartphones, social media, commodification of people, etc; I view this as contributing to the breakdown of democracy. The more specific and local result is that in-person interactions are difficult to come by sans some pre-specified shared interest or institution. The short student article is about the lack of people-first third spaces in Berkeley that don''t require spending money or some other kind of buy in."}, "86": {"id": "block-1766550397857", "kind": "quote", "text": "**Your issue of concern**: Earlier this year, Berkeley passed an ordinance to ban algorithmic rent-pricing software. However, the ban is currently on hold because the software company, RealPage, sued the city. This connects to the Alliance’s priority on dangerous technological development because such algorithmic rent-pricing software can harm renters and worsen affordability."}}}, {"id": "block-1766550515659", "kind": "text", "text": "Suggestions only appear here if you completed [Prepare to submit a public comment to your local government](https://worldalliance.org/actions/53).", "markdown": true, "manualPerUser": true, "manualUserContent": {"11": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: Advocate to the Berkeley City Council for a return to open police channels altogether. A downside of this suggestion is that it is unlikely to be adopted due to the [overwhelming support](https://localnewsmatters.org/2025/11/04/berkeley-city-council-votes-to-encrypt-police-radio-communications-drawing-public-outcry/) for this policy by the city council, implying most city councilors would not support the change. In addition, the vote was done to comply with a state directive.", "markdown": true}, "12": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: Advocate for the City of Saratoga to offer rebates to residents and commercial businesses to purchase electric lawn and garden equipment. While [AB 1346](https://leginfo.legislature.ca.gov/faces/billNavClient.xhtml?bill_id=202120220AB1346) prohibits the sale of gas-powered garden equipment, it does not provide for the rapid transition from gas-powered equipment to electric equipment; individual municipalities have taken this upon themselves. Although the effectiveness of this program does not appear to have been studied, similar rebate programs for electrification initiatives have been shown to [boost](https://link.springer.com/article/10.1007/s10640-022-00691-0) the adoption of electric appliances. ", "markdown": true}, "17": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for San Francisco to redirect resources from programs that seek to diminish visible homelessness, such as encampment sweeps, towards evidence-based programs that provide long-term treatment and housing solutions. In particular, you could comment on the fact that Mayor Lurie recently [passed legislation](https://www.sfchronicle.com/totalsf/article/lurie-s-new-rv-policy-promises-enforcement-sf-21097528.php) aiming to decrease the presence of RVs on the streets. This legislation does not appear to significantly increase total available housing options.", "markdown": true}, "19": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for San Francisco to invest greater resources into the installation of [rain gardens](https://www.epa.gov/soakuptherain/soak-rain-rain-gardens) and other green infrastructure that would prevent waste from entering the Bay during storms, which tend to overwhelm San Francisco''s combined wastewater-stormwater sewer system.", "markdown": true}, "20": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: According to the [article you provided](https://www.arcadiaca.gov/enrich/recreation___community_services/homeless_services/causes_of_homelessness.php), the leading cause of homelessness in Arcadia is “a growing gap between income and affordable housing.” Most people who are homeless, according to this article, are employed but do not make enough money to afford housing.\n\nYou could advocate for Arcadia to incentivize multifamily zoning by cutting taxes, slashing fees, or expediting processes for eligible developers. California [legalized](https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/sb-9-fact-sheet.pdf) converting single-family homes to multi-family homes with a limited approval process, and Arcadia is [striving to permit](https://www.arcadiaca.gov/shape/development_services_department/planning___zoning/housing_element_update.php?referrer=grok.com) an additional 3,200 units by 2031. Converting single-family lots to multi-family lots could quickly add [more housing stock](https://www.catrentalstore.com/en_US/blog/building-timelines.html) to the market.", "markdown": true}, "21": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for Arcadia Unified School District to adopt the recommendations of the [California Public Schools: Artificial Intelligence Working Group](https://www.cde.ca.gov/ci/pl/aiineducationworkgroup.asp), which is currently working to develop statewide guidance for educators around the use of AI in school. It is likely that the findings of this group will not be presented until the spring of 2026, meaning districts will not be able to implement the policies until the 2026-2027 school year.", "markdown": true}, "23": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for the city to adopt incentives that will encourage developers to participate in the plan to upzone San Francisco’s western and northern neighborhoods.\n\nMany [experts attribute](https://www.sfchronicle.com/california/article/poverty-rate-state-california-21079414.php) the high rate of poverty in San Francisco to high housing costs. In an effort to lower these costs, the city recently upzoned several neighborhoods to [encourage greater development](https://missionlocal.org/2025/12/sf-upzoning-passes-board/) and increase housing supply.\n\nHowever, the city’s chief economist [found](https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/10/250700_economic_impact_final.pdf) that this plan would only result in an additional 14,600 units — far short of the state-mandated 36,000 housing units by 2031. The plan could be [bolstered](https://newspack-missionlocal.s3.amazonaws.com/mission/wp-content/uploads/2025/10/San-Francisco-Housing-Element-Rezoning-Letter-2025.10.29-Report-Attached.pdf) by reducing fees or cutting taxes for housing developers to make housing construction more attractive.", "markdown": true}, "26": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for San Francisco to invest greater resources into the installation of [rain gardens](https://www.epa.gov/soakuptherain/soak-rain-rain-gardens) and other green infrastructure that would prevent waste from entering the Bay during storms, which tend to overwhelm San Francisco''s combined wastewater-stormwater sewer system.", "markdown": true}, "29": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for San Francisco to revive and expand the Law Enforcement Assisted Diversion (LEAD) Program at 16th & Mission.\n\nSan Francisco previously operated a LEAD pilot program from 2017-2019 that specifically targeted the 16th Street/Mission BART station, allowing police to redirect low-level drug offenders to treatment and social services instead of jail. [Research found](https://www.researchgate.net/publication/353464708_A_Process_Evaluation_of_San_Francisco''s_Law_Enforcement_Assisted_Diversion_Program) that participants had significantly fewer arrests and spent roughly 41 fewer days in jail per year while gaining access to housing and treatment.\n\nHowever, the pilot ended when [state grant funding expired](https://www.bscc.ca.gov/s_cppleadgrant/), and the city never made it permanent. The program could be revived and strengthened by allocating dedicated city funding, improving police training to increase [officer buy-in](https://journals.sagepub.com/doi/10.1177/08874034211033328), and integrating LEAD with existing resources like Drug Court and the [Restore shelter-to-treatment program](https://abc7news.com/post/san-francisco-expand-program-offers-shelter-beds-drug-addicts-accept-treatment/16188239/).", "markdown": true}, "31": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for the elimination of parking minimums in Sunnyvale.\n  \n[Parking minimums](https://www.smartgrowthamerica.org/knowledge-hub/news/parking-minimums-are-a-barrier-to-housing-development/) mandate the creation of a specific number of parking spots per development, depending on the development type. In Sunnyvale, for instance, each [single family home built](https://ecode360.com/42731285) needs to create at least one new parking space and a restaurant must have 9 parking spaces per 1,000 square feet of space.\n  \nResearch on cities that have eliminated parking minimums shows developers build less parking when given the choice. Reducing land devoted to parking frees up space for housing, creates demand for public transportation, and makes more new homes legal; for instance, 68% of new homes permitted in Buffalo since the reform [would have been illegal](https://bipartisanpolicy.org/article/eliminating-parking-minimums-in-buffalo-ny/) under the previous zoning code.", "markdown": true}, "35": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for amendments to the Public Assistance Act that would assess homeless individuals'' welfare eligibility based solely on their own income.\n\nTaiwan''s current welfare eligibility rules [count estranged relatives'' income](https://pubs.aip.org/aip/acp/article-abstract/2685/1/040014/2888833/Homeless-people-welfare-eligibility-and?redirectedFrom=PDF) and require a registered address. These rules both disqualify many homeless people with incomes far below the poverty line and prevent homeless people from receiving assistance precisely because they do not have a home. The government [recently expanded employment program](https://english.mol.gov.tw/21139/21192/79378/) access for homeless individuals, suggesting some political openness to reform.", "markdown": true}, "36": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for San Francisco to redirect resources from programs that seek to diminish visible homelessness, such as encampment sweeps, towards evidence-based programs that provide long-term treatment and housing solutions. In particular, you could comment on the fact that Mayor Lurie recently [passed legislation](https://www.sfchronicle.com/totalsf/article/lurie-s-new-rv-policy-promises-enforcement-sf-21097528.php) aiming to decrease the presence of RVs on the streets. This legislation does not appear to significantly increase total available housing options.", "markdown": true}, "38": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for San Francisco to redirect resources from programs that seek to diminish visible homelessness, such as encampment sweeps, towards evidence-based programs that provide long-term treatment and housing solutions. In particular, you could comment on the fact that Mayor Lurie recently [passed legislation](https://www.sfchronicle.com/totalsf/article/lurie-s-new-rv-policy-promises-enforcement-sf-21097528.php) aiming to decrease the presence of RVs on the streets. This legislation does not appear to significantly increase total available housing options.", "markdown": true}, "42": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for the restoration of participatory budgeting in Nashville. While its critics point to the low turnout of only 13,000 voters — a voter turnout of 2% — supporters argue that this was the first iteration and awareness takes time. The benefits of participatory budgeting, [including](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5287147) reductions in corruption, increases in democratic accountability, and empowering of marginalized communities could increase long-term trust in local government and offset initial costs.", "markdown": true}, "44": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for San Mateo to incentivize developers to convert single-family homes into multi-family units. Many [experts believe](https://cepr.org/voxeu/columns/housing-and-inequality-critical-link-economic-disparities) expensive housing exacerbates economic stratification; expensive housing, in turn, is related to housing supply. \n  \n[Housing stock](https://www.cityofsanmateo.org/1586/Housing) in San Mateo is about 55% multi-family units and 45% single-family homes. To create more housing, California [legalized](https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/sb-9-fact-sheet.pdf) converting single-family homes to multi-family homes with a limited approval process; however, municipalities can make this type of construction more attractive to developers via additional tax incentives and reduced fees.", "markdown": true}, "49": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: Right now, OneShoreline is [reviewing community feedback](https://oneshoreline.org/wp-content/uploads/2024/11/Revised-Draft-Alternatives-Public-Engagement-Presentation-%E2%80%93-Burlingame-Fall-2024.pdf) to identify a “Least Environmentally Damaging Practicable Alternative (LEDPA).” You could advocate for OneShoreline to explicitly evaluate an onshore alternative as part of its selection of a LEDPA. An onshore approach—using tools such as easements, selective property acquisition, setbacks, and elevation—could significantly reduce harm to Bay habitats by avoiding encroachment into the Bay. If cost or feasibility is a limiting factor, you could ask OneShoreline to be more transparent about those constraints rather than excluding onshore solutions from consideration.", "markdown": true}, "51": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for Arizona to incentivize vehicle owners to convert their cars to electric vehicles (EVs). Since Phoenix is [highly car-dependent](https://www.azfamily.com/2025/10/06/phoenix-metro-ranked-low-walkability-lawmaker-takes-transit-challenge/) and the city’s scorching summers make walkability impractical, one solution is to reduce the pollution by converting vehicles with combustion engines to those that are electric. Arizona [does not currently](https://qmerit.com/location/arizona/) have any incentive to adopt EVs, but [research has shown](https://www.sciencedirect.com/science/article/abs/pii/S0301421518302891) that for every $1,000 rebate on EVs offered, sales of EVs increase by 2.6%. ", "markdown": true}, "54": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for the Elephant Hill Open Space and Stormwater Infrastructure Feasibility Study.\n\nSave Elephant Hill submitted a $300,000 [Technical Resources Program](https://safecleanwaterla.org/content/uploads/2023/10/TRP-Elephant-Hill-Open-Space-and-Stormwater-Infrastructure.pdf) (TRP) application for fiscal year 2024-2025 to the Upper Los Angeles River Watershed Area Steering Committee (WASC).\n\nA formal study would quantify how many acre-feet of water Elephant Hill infiltrates annually, how much it saves in imported water costs, and what it would cost to replicate those services with built infrastructure. Preliminary estimates suggest the 110-acre hillside captures roughly 73 acre-feet of water per year, a service worth between $6–29 million over 30 years. Accounting for the cost of replacing Elephant Hill''s green infrastructure services could justify a higher budget to secure the site.", "markdown": true}, "55": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: Straightforwardly, you could advocate for the city to end its deployment of Flock Safety cameras. You could cite the specific concern that it was [reported](https://www.paloaltoonline.com/investigative-story/2025/08/19/menlo-park-police-broke-state-law-shared-license-plate-data-out-of-state/) in August of 2025 that Menlo Park’s police allowed out-of-state police departments access to their Flock camera data, violating California law and suggesting a lack of command over the technology. Moreover, the [ACLU points out](https://www.aclu.org/news/privacy-technology/flock-roundup) that Flock’s security systems are a “dragnet” because they have been used for more than their stated purpose. For instance, they have allowed local law enforcement to cooperate with ICE and they have been used to identify people who illegally received abortions.", "markdown": true}, "62": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could submit a comment to the UC Board of Regents requesting that they require UC campuses to refuse disclosure of student, faculty, or staff personal information to federal investigators without a valid subpoena or court order.\n\nWritten comments received 48 hours before a meeting addressing specific agenda items will be distributed to Board members. The next Regents meeting is January 20-21, 2026 at UCLA. Regents policy would be binding on UC Berkeley and all other UC campuses, preventing future incidents similar to [the disclosure of 160 names](https://www.insidehighered.com/news/quick-takes/2025/09/16/berkeley-releases-160-names-complies-us-investigation) in September.", "markdown": true}, "67": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for San Jose to follow the recommendations of the auditor mentioned in [your referenced article](https://localnewsmatters.org/2025/11/02/san-jose-audit-reveals-homeless-programs-plagued-by-poor-oversight-and-accountability/). San Jose auditors’ reports are not law –  without citizens pushing for the adoption of auditors’ recommendations, the city is less likely to be held accountable to its own auditors.", "markdown": true}, "68": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for Boston to legalize the conversion of single-family homes into multifamily homes.\n\nOne of the [main causes](https://www.aei.org/housing-center/bostons-backward-housing-policy-more-demand-will-only-exacerbate-the-supply-crisis/) identified for the city’s unaffordable housing is the dominance of single-family homes, which are less efficient uses of space and less affordable than their multifamily counterparts. If Boston legalized this reform, which neighboring Cambridge did recently, it would add an additional 750 homes per year to the city’s housing stock.", "markdown": true}, "71": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: Housing is one of the largest costs for residents of Boston.\n\nYou could advocate for Boston to legalize the conversion of single-family homes into multi-family homes. One of the [main causes](https://www.aei.org/housing-center/bostons-backward-housing-policy-more-demand-will-only-exacerbate-the-supply-crisis/) identified for the city’s unaffordable housing is the dominance of single-family homes, which are less efficient uses of space and less affordable than multi-family homes. If Boston legalized conversion (as neighboring Cambridge [did recently](https://www.boston.com/news/politics/2025/02/11/cambridge-eliminates-single-family-zoning-in-historic-move/)), this could add an additional 750 homes per year to the city’s housing stock.", "markdown": true}, "72": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: An audit of San Jose’s homelessness outreach efforts revealed that some of the city’s nonprofits failed to meet targets or reporting requirements. In addition, the auditor “could not identify all of [San Jose’s] expenditures” of the more than $302 million spent to address the homelessness crisis since 2020.\n\nYou could advocate for the city to follow the recommendations of the auditor. San Jose auditors’ reports are not law – without citizens pushing for the adoption of auditors’ recommendations, the city is less likely to be held accountable to its own auditors.", "markdown": true}, "76": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: Advocate for Urbana-Champaign to plant species that will sequester herbicides and other harmful chemicals.\n\n[Phytoremediation](https://www.annualreviews.org/content/journals/10.1146/annurev.arplant.49.1.643) is the process of planting certain species of flora which can absorb heavy metals, pollutants, and herbicides. [Studies on phytoremediation](https://www.sciencedirect.com/science/article/abs/pii/S0045653523012109) have shown that certain plants can sequester about half of the herbicide present in soil, in addition to other pollutants. Urbana-Champain can incorporate this procedure into public land management strategies to mitigate the amount of damage caused by herbicides.", "markdown": true}, "77": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for Hialeah to develop its own tax credit system to attract development of “middle housing.”\n\nHialeah needs 12,000 new homes to address its housing gap. Middle housing—duplexes, triplexes, and townhouses—can supply many of them without transforming neighborhoods. Florida''s [Live Local Act](https://www.floridahousing.org/live-local-act) already clears the path by letting developers build on underused commercial and industrial land.\nProperty tax credits on qualifying parcels could draw builders to Hialeah. Middle housing projects can be finished [within a year](https://www.catrentalstore.com/en_US/blog/building-timelines.html), so the city could make progress on affordability in a short time frame.", "markdown": true}, "79": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for the creation of pedestrian-friendly infrastructure across the San Gabriel Valley during future development. Pedestrian-friendly infrastructure, such as wide sidewalks, safe crosswalks, and pedestrian-only areas, have been shown to improve safety and mobility as well as foster “interaction, mutual understanding, and a sense of belonging.”", "markdown": true}, "80": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for New York City to better resource existing efforts that help SNAP recipients stay eligible and avoid procedural mistakes. For instance, New York’s Human Resources Administration is [rolling out programs](https://nysfocus.com/2025/12/12/whats-next-for-new-yorkers-on-snap) to connect recipients with work programs and health providers that help them stay eligible for SNAP in light of the new requirements.\n\nIncreasing staff capacity, expanding partnerships with community-based organizations, and improving digital communication tools could substantially reduce the number of eligible individuals losing coverage.", "markdown": true}, "82": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could request district guidelines that measure learning outcomes and decide if an AI tool harms learning.\n\nA recent review in [Educational Psychology Review](https://link.springer.com/article/10.1007/s10648-025-10020-8) documents \"inversion effects\" where use of AI learning tools lead to shallower processing and worse outcomes. For example, students using ChatGPT performed better during AI-assisted tasks but performed worse on post-task evaluations. Public information suggests Berkeley Unified School District (BUSD)’s AI working group is focused on privacy and academic honesty, but takes for granted the way that AI tools will help students learn. Your comment could help push the district to produce guidelines that measure learning outcomes and decide if an AI tool harms students.\n\nIt may be helpful to mention that you work on AI safety professionally.", "markdown": true}, "83": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for a “third spaces lab” in Berkeley. Boston, for instance, hosted a [“third spaces lab”](https://www.boston.gov/departments/new-urban-mechanics/third-spaces-lab) where the city developed different ideas for third spaces, such as a [play space for children](https://www.bostonglobe.com/2024/08/16/opinion/culturehouse-third-places-boston/) outside of city hall or a free summer lunch gathering weekly. Ideas came from collaboration among experts, stakeholders, and community members.", "markdown": true}, "86": {"id": "block-1766550515659", "kind": "text", "text": "**Suggestion 1**: You could advocate for a watchdog in Berkeley to report AB 325 violations.\n\nThe Biden Administration [investigated algorithmic rent-pricing](https://bidenwhitehouse.archives.gov/cea/written-materials/2024/12/17/the-cost-of-anticompetitive-pricing-algorithms-in-rental-housing/) and found it responsible for rent increases averaging $70 per month—a figure they described as \"likely a lower bound.\" In response, Governor Newsom signed [AB 325](https://www.wilmerhale.com/en/insights/client-alerts/20251114-california-zeroes-in-on-common-pricing-algorithms) into law, closing the loopholes that allowed landlords to share nonpublic rental data with third-party algorithms. The law takes effect in 2026.\n\nIf Berkeley cannot ban algorithmic rent-pricing outright, it can monitor the problem and pass information to the California Attorney General’s office.", "markdown": true}}}, {"id": "block-1766550634822", "kind": "text", "text": "", "markdown": true, "manualPerUser": true, "manualUserContent": {"11": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: Advocate for the Berkeley City Council to give grants to public media. One of the problems identified by advocates appears to be the lack of readily-available information in their communities about things that are happening on the ground. This leaves the police scanner as one of the few sources of accurate information to improve the community. California has lost one-third of its newspapers since 2005. Local media is critical for keeping the public informed about local affairs and can make people more aware of the issues in their community. By using city financial resources to bolster existing public media organizations, the city council could address the core of the problem while maintaining police safety.", "markdown": true}, "17": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for San Francisco to develop or expand facilities and staffing that could accommodate more mental health treatment beds. In particular, you could comment that the controversy surrounding Mayor Lurie’s [recent plan](https://missionlocal.org/2025/05/sf-behavioral-health-center-add-remove-beds-department-public-health/) to add new treatment beds, resulting from the plan’s proposal to relocate existing residents, demonstrates a need for greater infrastructure.\n\nEvidence suggests that mental health beds reduce hospital readmissions and emergency visits, which are major drivers of homelessness costs and a general vicious cycle for unhoused people. San Francisco faces a major shortage of these beds. A comment supporting this approach could signal to city officials that residents prioritize evidence-based, cost-effective solutions, beyond immediate concerns such as crime or encampments that receive more day-to-day attention.", "markdown": true}, "19": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for the State Water Board to adopt Sacramento River flow requirements at the higher end of the proposed 45-65% range.  \n\nFreshwater diversion is a primary driver of poor health indicators in the California Delta; when too much water is pulled out for human uses, the ecosystem suffers. The State Water Board is [deciding what percentage](https://mavensnotebook.com/2025/12/12/bay-delta-plan-state-water-board-releases-new-analysis-to-advance-latest-proposed-bay-delta-plan-updates/) of the Sacramento River natural flow must be protected for fish and wildlife, with the current proposal ranging from 45-65%. Agricultural and municipal water interests typically push for lower percentages to maximize water available for human uses, while environmental advocates argue that decades of prioritizing diversions over ecosystem health have led to the current degraded conditions.", "markdown": true}, "20": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for Arcadia to expand rental assistance programs, such as the one it already has in partnership with Union Station Homeless Services. Expansion of these programs could prevent a future increase in homelessness by serving a greater number of households.", "markdown": true}, "21": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: Since California’s guidance will not be available until the 2026-2027 school year, you could advocate for Arcadia Unified School District to adopt a temporary policy concerning artificial intelligence in K-12 education based on guidance from other states. For instance, Massachusetts has published [comprehensive documents concerning the use of AI](https://www.doe.mass.edu/edtech/ai/ai-guidance.pdf) in educational settings.", "markdown": true}, "23": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for San Francisco to expand outreach and assistance for the California Earned Income Tax Credit (EITC) and federal EITC, which many eligible residents fail to claim.\n  \nThe EITC is an anti-poverty program in the United States that [lifts millions of families](https://taxpolicycenter.org/briefing-book/how-does-earned-income-tax-credit-affect-poor-families) out of poverty annually. However, a [2021 survey](https://www.healthaffairs.org/doi/10.1377/hlthaff.2022.00713) estimates more than 25% of eligible residents do not claim these credits—either because they don''t know they qualify, distrust the tax system, or lack access to filing assistance. Expanding outreach through trusted community messengers or mobile tax prep sites could ensure more low-income San Francisco residents receive credits.", "markdown": true}, "26": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for the State Water Board to adopt Sacramento River flow requirements at the higher end of the proposed 45-65% range.  \n\nFreshwater diversion is a primary driver of poor health indicators in the California Delta; when too much water is pulled out for human uses, the ecosystem suffers. The State Water Board is [deciding what percentage](https://mavensnotebook.com/2025/12/12/bay-delta-plan-state-water-board-releases-new-analysis-to-advance-latest-proposed-bay-delta-plan-updates/) of the Sacramento River natural flow must be protected for fish and wildlife, with the current proposal ranging from 45-65%. Agricultural and municipal water interests typically push for lower percentages to maximize water available for human uses, while environmental advocates argue that decades of prioritizing diversions over ecosystem health have led to the current degraded conditions.", "markdown": true}, "36": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for San Francisco to develop or expand facilities and staffing that could accommodate more mental health treatment beds. In particular, you could comment that the controversy surrounding Mayor Lurie’s [recent plan](https://missionlocal.org/2025/05/sf-behavioral-health-center-add-remove-beds-department-public-health/) to add new treatment beds, resulting from the plan’s proposal to relocate existing residents, demonstrates a need for greater infrastructure.\n\nEvidence suggests that mental health beds reduce hospital readmissions and emergency visits, which are major drivers of homelessness costs and a general vicious cycle for unhoused people. San Francisco faces a major shortage of these beds. A comment supporting this approach could signal to city officials that residents prioritize evidence-based, cost-effective solutions, beyond immediate concerns such as crime or encampments that receive more day-to-day attention.", "markdown": true}, "38": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for San Francisco to develop or expand facilities and staffing that could accommodate more mental health treatment beds. In particular, you could comment that the controversy surrounding Mayor Lurie’s [recent plan](https://missionlocal.org/2025/05/sf-behavioral-health-center-add-remove-beds-department-public-health/) to add new treatment beds, resulting from the plan’s proposal to relocate existing residents, demonstrates a need for greater infrastructure.\n\nEvidence suggests that mental health beds reduce hospital readmissions and emergency visits, which are major drivers of homelessness costs and a general vicious cycle for unhoused people. San Francisco faces a major shortage of these beds. A comment supporting this approach could signal to city officials that residents prioritize evidence-based, cost-effective solutions, beyond immediate concerns such as crime or encampments that receive more day-to-day attention.", "markdown": true}, "42": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for an amendment to the Charter of Nashville and Davidson County that re-balances budgeting authority away from the mayor and toward the Metro Council. Under the current structure, the mayor appears to have been able to unilaterally terminate the participatory budgeting pilot. As a result, one possible solution is to put greater budgetary control into the hands of the Metro Council, giving the program a chance for its future to be dependent on democratic deliberation.", "markdown": true}, "44": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for San Mateo to expand outreach and assistance for the California Earned Income Tax Credit (EITC) and federal EITC, which many eligible residents fail to claim.\n\nThe EITC is an anti-poverty program in the United States that [lifts millions of families](https://taxpolicycenter.org/briefing-book/how-does-earned-income-tax-credit-affect-poor-families) out of poverty annually. However, a [2021 survey](https://www.healthaffairs.org/doi/10.1377/hlthaff.2022.00713) estimates more than 25% of eligible residents do not claim these credits—either because they don''t know they qualify, distrust the tax system, or lack access to filing assistance. Expanding outreach through trusted community messengers or mobile tax prep sites could ensure more low-income San Mateo residents receive credits.", "markdown": true}, "51": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for Phoenix to adopt a goal of a zero-emission vehicle fleet. [Research shows](https://publicinterestnetwork.org/wp-content/uploads/2025/08/Fact-Sheet-EVs-and-Government-Fleets-8-12-2025.pdf) that if local governments in Arizona adopt electric vehicles for their municipally-owned fleet instead of sticking with combustion engines, they will save $100 million, in addition to improving air quality. Phoenix has [already adopted](https://www.phoenix.gov/content/dam/phoenix/publictransitsite/documents/en_route_october_2024_final.pdf) a goal of carbon-free buses by 2040. This is in-line with cities like Seattle, who have rapidly adopted zero-emission vehicles across their fleet, including for police and fire departments.", "markdown": true}, "62": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for state legislation limiting what California public universities can voluntarily disclose to federal agencies; that is, request legislation prohibiting voluntary disclosure of identifying information to federal agencies without a subpoena. Chair Senator Sasha Pérez (D-District 25) has already publicly urged CSU to \"take all legal steps to resist divulging employee''s private information\" in response to Trump administration pressure—she may be receptive to sponsoring a bill codifying these protections. State law would have binding legal force and protect students and faculty at UC, CSU, and community colleges statewide.", "markdown": true}, "67": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for San Jose to increase funding for outreach and monitoring staff in the Housing Department. The auditor''s report highlighted key gaps: the department lacks dedicated outreach workers and staff to monitor grant recipients. In 2024, the city only implemented low-cost recommendations—launching a homeless data dashboard and establishing more comprehensive annual goals. With proper financial investment in staffing, the city could achieve significant reductions in homelessness in future years.", "markdown": true}, "68": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for Governor Healey to open the State Transportation Building to homeless individuals during cold weather.\n\nCurrently, Boston opens [South Station](http://masslive.com/weather/2023/02/bostons-south-station-to-open-for-homeless-as-dangerous-arctic-blast-arrives-in-mass.html) to homeless individuals on a case-by-case basis when the weather is extremely cold. This use of public resources allows the city to efficiently and safely provide shelter for people who otherwise would not have any. The State Transportation Building at 10 Park Plaza—which was used as an overnight shelter for homeless families [in 2023](https://fortune.com/2023/11/20/massachusetts-homeless-boston-transportation-building-shelter-system-7500-families/)—offers another state-owned facility that could be activated during harsh winters under the same discretionary framework.", "markdown": true}, "71": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: An estimated one-in-three Boston residents are “food insecure,” driven by rising grocery prices and wages that have failed to keep pace with rising prices.\n\nYou could advocate for Boston to pilot public grocery stores, especially because the idea has already been proposed by [city councilors](https://www.cbsnews.com/boston/news/government-owned-grocery-stores-boston-proposal/). Public grocery stores have seen some success in other parts of the US and internationally, and can [pass on savings](https://cdn.vanderbilt.edu/vu-sub/wp-content/uploads/sites/281/2024/03/18104854/Public-Grocery-Stores.pdf) to consumers as the result of their non-profit model and reduced overhead.", "markdown": true}, "72": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for San Jose to increase funding for outreach and monitoring staff in the Housing Department. The auditor''s report highlighted key gaps: the department lacks dedicated outreach workers and staff to monitor grant recipients. In 2024, the city only implemented low-cost recommendations—launching a homeless data dashboard and establishing more comprehensive annual goals. With proper financial investment in staffing, the city could achieve significant reductions in homelessness in future years.", "markdown": true}, "76": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: Advocate for a local prohibition on the use of herbicides.\n\nWhile most herbicides [appear to originate](https://prairierivers.org/front-page/2023/08/new-data-confirms-widespread-herbicide-pollution-in-champaign-urbana/) from industrial use in nearby farmland, a local prohibition on herbicide use would still reduce their presence in the environment. For instance, a [longitudinal study](https://journals.ashs.org/view/journals/horttech/35/3/article-p281.xml) of Connecticut schools after a ban on the use of herbicides on school grounds observed a decrease in exposure to herbicides among children.", "markdown": true}, "77": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for Florida to expand restrictions on foreign ownership of homes.\n\nCurrently, Florida restricts home ownership for individuals from certain countries.  About 20% of all home purchases in South Florida in 2022-2023 were from [foreign nationals](https://southfloridaagentmagazine.com/2023/12/08/south-florida-foreign-home-buyers/#:~:text=South%20Florida%20is%20a%20top%20choice%20for,foreign%20buyers%2C%20accounting%20for%2056%25%20of%20sales) who do not live in the area full-time. These individuals, many of whom are wealthy in their home countries, are able to outbid South Florida residents, which may drive up home prices and costs of living.", "markdown": true}, "79": {"id": "block-1766550634822", "kind": "text", "text": "", "markdown": true}, "80": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for New York City to run a public information campaign to raise awareness about emergency food resources, including local food pantries, community fridges, and nonprofit food distribution networks. A coordinated campaign—potentially leveraging NYC 311, social media, and transit ads—could ensure affected residents are aware of where to find immediate assistance.", "markdown": true}, "83": {"id": "block-1766550634822", "kind": "text", "text": "**Suggestion 2**: You could advocate for the City of Berkeley to coordinate with community groups, such as the [Berkeley Neighborhoods Council](https://berkeleyneighborhoodscouncil.com/statement-purpose), to fund and promote innovative third spaces across the city. In New York City, for instance, Bryant Park is managed by the [Bryant Park Corporation](https://bryantpark.org/about-us), which is a public-private partnership with the New York City government. Once an unsafe area that was considered an example of New York’s decline, the park now sees [12 million visitors annually](https://bryantpark.org/) and is a hub of community programming and free events. This model of collaboration with groups and individuals who know the area well could serve as a model for Berkeley.", "markdown": true}}}, {"id": "block-1766550795099", "kind": "header", "text": "Step 2", "level": 2}, {"id": "block-1766550922672", "kind": "text", "text": "Submit a public comment (about one paragraph) to your local government with:\n1. Your issue of concern. Ideally, you would include any personal experiences you have had with the issue, and why you care about it.\n2. A proposed solution to help your comment stand out.\n\nYour comment can be inspired by Eamon''s suggestions, but it does not need to be.\n\nBelow is an example comment:", "markdown": true}, {"id": "block-1766642349621", "kind": "quote", "text": "To whom it may concern,\n\nI would like the city to explicitly evaluate onshore alternatives as part of its selection of a Least Environmentally Damaging Practicable Alternative (LEDPA) for sea level rise protection. I am deeply concerned about the existing near-shore proposals'' potential to disturb eelgrass beds, which are important to me because they support biodiversity and quality fishing. I fish on the relevant shoreline regularly.\n\nAn onshore alternative supported by targeted easements, selective acquisition, and elevation could protect communities from flooding while avoiding damage to these habitats. If cost makes these options infeasible, I want know, and I think OneShoreline''s website should be more transparent about this."}, {"id": "block-1766551109689", "kind": "text", "text": "", "markdown": false, "manualPerUser": true, "manualUserContent": {"11": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the Berkeley City Clerk at [council@berkeleyca.gov](mailto:council@berkeleyca.gov).", "markdown": true}, "12": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: [https://saratogaca.form.transform.civicplus.com/50019](https://saratogaca.form.transform.civicplus.com/50019)", "markdown": true}, "17": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the San Francisco Board of Supervisors at [board.of.supervisors@sfgov.org](mailto:board.of.supervisors@sfgov.org).", "markdown": true}, "19": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: For suggestion 1, you can email the Board of Supervisors: [bos@sfgov.org](mailto:bos@sfgov.org). For suggestion 2, you can email [SacDeltaComments@waterboards.ca.gov](SacDeltaComments@waterboards.ca.gov).\n", "markdown": true}, "20": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the Arcadia City Council at [CityCouncil@ArcadiaCA.gov](mailto:CityCouncil@ArcadiaCA.gov).", "markdown": true}, "21": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: the email addresses of Arcadia Unified School District Board of Education members can be found here: [https://www.ausd.net/apps/pages/Board](https://www.ausd.net/apps/pages/Board)", "markdown": true}, "23": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the San Francisco Board of Supervisors at [board.of.supervisors@sfgov.org](mailto:board.of.supervisors@sfgov.org).", "markdown": true}, "26": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: For suggestion 1, you can email the Board of Supervisors: [bos@sfgov.org](mailto:bos@sfgov.org). For suggestion 2, you can email [SacDeltaComments@waterboards.ca.gov](SacDeltaComments@waterboards.ca.gov).", "markdown": true}, "29": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the San Francisco Board of Supervisors at [board.of.supervisors@sfgov.org](mailto:board.of.supervisors@sfgov.org).", "markdown": true}, "31": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the Sunnyvale City Council at [council@sunnyvale.ca.gov](mailto:council@sunnyvale.ca.gov).", "markdown": true}, "35": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Ministry of Health and Welfare at [https://www.email.mohw.gov.tw/enSendEmail](https://www.email.mohw.gov.tw/enSendEmail).", "markdown": true}, "36": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the San Francisco Board of Supervisors at [board.of.supervisors@sfgov.org](mailto:board.of.supervisors@sfgov.org).", "markdown": true}, "38": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the San Francisco Board of Supervisors at [board.of.supervisors@sfgov.org](mailto:board.of.supervisors@sfgov.org).", "markdown": true}, "42": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: For suggestion 1, contact the Nashville Mayor’s Office [here](https://hub.nashville.gov/s/request-type/a0ut0000000IlH8AAK/contact-the-mayors-office?language=en_US). For suggestion 2, contact the Nashville Metro Council [here](https://www.nashville.gov/departments/council/webform/contact-council-members).", "markdown": true}, "44": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email [citycouncil@cityofsanmateo.org](mailto:citycouncil@cityofsanmateo.org).", "markdown": true}, "49": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email [info@oneshoreline.org](mailto:info@oneshoreline.org). OneShoreline is a government-created entity.", "markdown": true}, "51": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: If you are using suggestion 1, you can identify your state legislator [here](https://www.azleg.gov/findmylegislator/), then contact them. If you are using suggestion 2, you can identify your city council district [here](https://www.phoenix.gov/administration/mayorcouncil/find-my-council-district.html) and then contact your councilor [here](https://www.phoenix.gov/administration/mayorcouncil.html).", "markdown": true}, "54": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email Supervisor Hilda Solis (District 1, which includes El Sereno) at  [FirstDistrict@bos.lacounty.gov](mailto:FirstDistrict@bos.lacounty.gov). She sits on the Board of Supervisors that gives final approval, and her office can put pressure on the WASC and Public Works to prioritize the application.", "markdown": true}, "55": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the Menlo Park City Council at [city.council@menlopark.gov](mailto:city.council@menlopark.gov). ", "markdown": true}, "62": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: You can the UC Board of Regents Office of the Secretary and Chief of Staff at [regentsoffice@ucop.edu](regentsoffice@ucop.edu). You can email the Senate Education Committee at [SEDN.committee@senate.ca.gov](SEDN.committee@senate.ca.gov).", "markdown": true}, "67": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email [city.clerk@sanjoseca.gov](mailto:city.clerk@sanjoseca.gov).", "markdown": true}, "68": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the Boston City Council at [city.council@boston.gov](mailto:city.council@boston.gov).", "markdown": true}, "71": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the Boston City Council at [city.council@boston.gov](mailto:city.council@boston.gov).", "markdown": true}, "72": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email [city.clerk@sanjoseca.gov](mailto:city.clerk@sanjoseca.gov).", "markdown": true}, "76": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: You can email the Champaign City Council at [council@champaignil.gov](council@champaignil.gov). You can email the Urbana City Council at [CityCouncil@UrbanaIL.gov](CityCouncil@UrbanaIL.gov).\n", "markdown": true}, "77": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: For a city-level comment (e.g. suggestion 1), you can email the Hialeah City Council President [here](https://www.hialeahfl.gov/964/Luis-Rodriguez).\n\nFor a state-level comment, you can identify your state representative [here](https://www.flhouse.gov/FindYourRepresentative) and identify your state senator [here](https://www.flsenate.gov/senators), then contact them.", "markdown": true}, "79": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: You can email John Wu, a San Gabriel City Council member, here: [https://www.sangabrielcity.com/1613/John-Wu](https://www.sangabrielcity.com/1613/John-Wu)", "markdown": true}, "80": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Find your New York City Council Member and their contact information [here](https://council.nyc.gov/districts/).", "markdown": true}, "82": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: You can reach Superintendent Enikia Ford Morthel at [superintendent@berkeley.net](superintendent@berkeley.net). You can reach the School Board at [board@berkeley.net](board@berkeley.net).", "markdown": true}, "83": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the Berkeley City Clerk at [council@berkeleyca.gov](mailto:council@berkeleyca.gov).", "markdown": true}, "86": {"id": "block-1766551109689", "kind": "text", "text": "**How to submit your comment**: Email the Berkeley City Clerk at [council@berkeleyca.gov](mailto:council@berkeleyca.gov).", "markdown": true}}}, {"id": "field-1766641911284", "kind": "checkbox", "label": "I submitted my comment.", "required": true}, {"id": "field-1766551610354", "kind": "textarea", "rows": 3, "label": "Paste the comment you submitted here.", "output": {"output": true}, "required": true}, {"id": "field-1766641762208", "kind": "textarea", "rows": 2, "label": "Do you have any thoughts about your experience writing and submitting the comment?", "required": false}, {"id": "block-1766640345930", "kind": "header", "text": "Step 3 (optional)", "level": 2}, {"id": "field-1766640468864", "kind": "checkbox", "label": "Read and reply to other members'' comments for this action: [https://worldalliance.org/feed/54](https://worldalliance.org/feed/54).", "required": false}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": "", "outputViews": [{"id": "output-view-1766551627622-ce", "type": "default", "title": "View 1", "blocks": [{"id": "output-field-1766551629489-bi9z", "format": "field", "fieldId": "field-1766551610354", "showLabel": true, "labelOverride": "My public comment:"}], "description": ""}]}', '2025-12-23 20:24:28.918755-08', '2025-12-31 15:56:19.888529-08');
INSERT INTO public.form VALUES (37, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1761670048977", "kind": "text", "text": "Welcome to the Alliance. We’re a group of people learning to coordinate to address urgent problems: extreme poverty, environmental destruction, the breakdown of democratic institutions, and dangerous technological development. This is still an early experiment, but our goal is to build the capacity to create large-scale, global impact.\n\n**Reliability is our foundation.** We can only enact precise, complex plans if we can depend on each other. If someone fails to complete an action, then an entire chain of coordination may break and others’ efforts may go to waste.\n\nWe ask for a relatively small amount of time, and we work hard to make the best use of members’ contributions. In turn, we expect members to show up, even when doing so is tedious or inconvenient.\n\nAs a result, the first task that all members complete is to review and sign a contract to be reliable. We will treat your signature seriously: when you join us, you will expand the scope of what we can achieve, and we will plan actions trusting that you will participate.", "markdown": true}, {"id": "field-1761670134225", "kind": "checkbox", "label": "**Step 1**: Go to your contract page at [this link](/contract).", "required": true}, {"id": "field-1761670160835", "kind": "checkbox", "label": "**Step 2**: Sign the contract.", "required": true}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": ""}', '2025-10-28 09:47:34.033343-07', '2025-10-28 13:32:00.900498-07');
INSERT INTO public.form VALUES (7, 'Platform learning form', '{"slug": "untitled-form", "pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1758131272715", "kind": "text", "text": "This is a **task** that explains how to participate in a **collective action.**\n\nClicking \"Details\" will take you to a page that describes the purpose and stage of the collective action in full detail.\n\nPlease follow the below steps, checking off the boxes as you go.", "markdown": true}, {"id": "field-1757374138274", "kind": "checkbox", "label": "**Step 1**: If you haven''t already, click the \"Details\" button to go to details page for this collective action.", "required": true}, {"id": "field-1757373158531", "kind": "checkbox", "label": "**Step 2**: You should now be on a page titled \"Get to know the platform.\" Read the description below this box to become familiar with the online platform. ", "required": true}, {"id": "field-1757375760212", "kind": "checkbox", "label": "**Step 3**: Go back to your \"Tasks\" page.", "required": true}, {"id": "block-1757526444482", "kind": "text", "text": "After you have completed all 3 steps and checked their corresponding boxes, click the \"Complete\" button below.", "markdown": false}]}], "title": "Platform learning form", "submit": {"label": "Complete"}, "version": 1, "description": ""}', '2025-09-08 12:17:00.842056-07', '2025-11-11 13:43:37.859364-08');
INSERT INTO public.form VALUES (38, 'Reliability plan form (2)', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": []}], "title": "Reliability plan form (2)", "submit": {"label": "Complete"}, "description": ""}', '2025-10-28 13:54:11.903154-07', '2025-10-28 13:54:49.304227-07');
INSERT INTO public.form VALUES (39, 'Reliability form 25OCT28 update', '{"slug": "untitled-form", "pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1761685068051", "kind": "text", "text": "You are responsible for completing tasks on time. However, we offer a variety of systems to help. ", "markdown": true}, {"id": "field-1757527742080", "kind": "phone", "label": "By default, you will receive **text notifications** when you are assigned a task. Please enter your phone number below. ", "required": true, "placeholder": "(999) 999-9999"}, {"id": "field-1761685585408", "kind": "timezone", "label": "Automated notifications will occur at your preferred time. What’s your timezone?", "required": true}, {"id": "field-1761692184325", "kind": "time", "label": "What time of day would you prefer to be sent notifications?", "required": true}]}, {"id": "page-2", "title": "Page 2", "fields": [{"id": "block-1761692738480", "kind": "text", "text": "The office is testing a **community support program** in which you can receive task reminders from a fellow Alliance member. The goals of this program are to make task reminders more personal and effective and to increase community connection.\n\nUnder the program, you would be assigned a dedicated contact responsible for helping you complete tasks.\n\n1. By default, they will only reach out to you if a deadline is approaching.\n2. However, if you have particular preferences, you can let them know. For example, you could ask them to call in the middle of the week, or to send you a text earlier than the deadline if you’re going to go on vacation.\n3. You can message them with any questions you have about any task.\n\nThis program is optional; however, **participation is strongly recommended.**\n\nAt first, we’ll have the same designated contact available to everyone: [Bryan Xu](https://worldalliance.org/user/20), a member who has volunteered to start this program. Eventually, anyone who would like to take responsibility for a member group will be able to do so.", "markdown": true}, {"id": "field-1761692743909", "kind": "radio", "label": "Would you like a designated contact?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true}, {"id": "field-1761692746444", "kind": "checkbox", "label": "Please add Bryan Xu to your contact list: 1-626-664-1534", "required": true, "visibleIf": [{"when": "field-1761692743909", "equals": "yes"}]}, {"id": "field-1761692825870", "kind": "radio", "label": "Are you interested in becoming a designated contact for other members?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true}]}, {"id": "page-3", "title": "Page 3", "fields": [{"id": "field-1761692883765", "kind": "multiselect", "label": "Below are other methods members employ for completing tasks on time. Would you like to try any of these other methods?", "options": [{"label": "Make a recurring calendar event", "value": "option1"}, {"label": "Set a recurring alarm on my phone", "value": "option2"}, {"label": "None", "value": "option3"}, {"label": "Other", "value": "option4"}], "required": true}, {"id": "field-1761692951031", "kind": "text", "label": "Please create a recurring calendar event now.", "required": true, "visibleIf": [{"when": "field-1761692883765", "equals": "option1"}], "placeholder": "What time is the event? E.g., Mondays at 6pm."}, {"id": "field-1761692952880", "kind": "text", "label": "Please create a recurring alarm now.", "required": true, "visibleIf": [{"when": "field-1761692883765", "equals": "option2"}], "placeholder": "What time is the alarm? E.g., Mondays at 6pm."}, {"id": "field-1761692953826", "kind": "text", "label": "When will you have time to complete the tasks? ", "required": true, "visibleIf": [{"when": "field-1761692883765", "equals": "option3"}], "placeholder": "Please be as specific as you can. E.g., Mondays at 6pm."}, {"id": "field-1761692954610", "kind": "text", "label": "Explain your plan.", "required": true, "visibleIf": [{"when": "field-1761692883765", "equals": "option4"}], "placeholder": "Please be as specific as you can."}]}], "title": "Reliability form 25OCT28 update", "submit": {"label": "Complete"}, "version": 1, "description": ""}', '2025-10-28 13:54:32.01566-07', '2025-10-28 16:18:29.901042-07');
INSERT INTO public.form VALUES (41, 'action suggestion form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1762128306086", "kind": "text", "text": "What is a problem you want the Alliance to address or an idea for an action we could take with **up to 1,000 members**?", "markdown": true}, {"id": "field-1762128332630", "kind": "textarea", "rows": 3, "label": "Your response can refer to a problem at any scale, from a sub-problem of one of our four priorities to a specific issue in your local community.", "required": true}, {"id": "field-1762128370328", "kind": "checkbox", "label": "I would like my suggestion to be anonymous.", "required": false}]}], "title": "action suggestion form", "submit": {"label": "Complete"}, "description": ""}', '2025-11-02 16:04:59.639259-08', '2025-11-02 16:14:55.130104-08');
INSERT INTO public.form VALUES (40, '1k voting form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1762126957436", "kind": "text", "text": "A donor has committed to give $1,000 to a specific proposal agreed upon by Alliance members. \n\nThis week, members will:\n1. Submit proposals for how to use $1,000.\n2. Decide on a voting process.", "markdown": true}, {"id": "block-1762127627610", "kind": "spacer", "size": "xs"}, {"id": "block-1762127192127", "kind": "text", "text": "### Step 1\n\nGive one proposal for how we should spend $1,000, along with a justification. Reminder that our priorities, in no particular order, are:\n\n1. Ending extreme poverty\n2. Ending environmental destruction\n3. Strengthening democratic institutions\n4. Preventing unsafe technological development\n5. Increasing the capacity of the Alliance\n\nExamples of proposals (please come up with your own):\n- Donate to GiveDirectly, which addresses global poverty.\n- Provide a small grant to a local school to create a native plant garden, which supports biodiversity.\n- Offer a referral bonus for the next Alliance staff member, which could help the team grow.", "markdown": true}, {"id": "field-1762127183108", "kind": "textarea", "rows": 4, "label": "Your proposal:", "required": true}, {"id": "field-1762128498193", "kind": "checkbox", "label": "I would like my proposal to be anonymous.", "required": false}]}, {"id": "page-2", "title": "Page 2", "fields": [{"id": "block-1762127540883", "kind": "text", "text": "### Step 2\n\nNext week:\n1. The office will curate 15 proposals from members’ suggestions.\n2. Members will indicate whether or not they approve of each proposal.\n3. The office will select a winning proposal. ", "markdown": true}, {"id": "field-1762127559764", "kind": "radio", "label": "Which proposals should the office pick the winner from?", "options": [{"label": "**The top 5 proposals**: Pick from the 5 proposals with the highest number of approving members.", "value": "option1"}, {"label": "**Proposals with 75% approval**: Pick from proposals that more than 30 members approve of. If no proposal reaches 75% approval, the $1,000 will not be spent.", "value": "option2"}, {"label": "**Proposals with 100% approval**: Pick from proposals that everybody approves of. If no proposal reaches 100% approval, the $1,000 will not be spent.", "value": "option3"}], "required": true}, {"id": "field-1762129222350", "kind": "textarea", "rows": 3, "label": "Briefly explain your choice.", "required": true}]}], "title": "1k voting form", "submit": {"label": "Complete"}, "description": ""}', '2025-11-02 15:46:51.625081-08', '2025-11-03 09:51:38.7354-08');
INSERT INTO public.form VALUES (43, 'Approve proposals for how to spend $1,000 form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1762826818829", "kind": "text", "text": "Last week, a majority of members voted for the office to **pick from the 5 proposals that receive the most approval**. Information about last week’s action can be found at: [Decide how to allocate $1,000 next week](https://worldalliance.org/actions/47).\n\nA summary of members'' explanations of their votes:\n- Members who voted for “Top 5” (23 votes) mostly did so because they wanted to guarantee that the $1,000 was spent.\n- Members who voted for “75% approval” (15 votes) mostly did so because they wanted a strong chance that the $1,000 would be spent, but also wanted to satisfy a majority of members.\n- No members voted for “100% approval.” Many members suggested that we should prioritize taking action over full consensus.\n\nAccordingly, the office has curated 15 proposals from member suggestions. \n", "markdown": true}, {"id": "field-1762826848242", "kind": "multiselect", "label": "Check all proposals that you approve of. Proposals are listed in random order.", "options": [{"label": "Donate $1,000 to [GiveDirectly](https://www.givedirectly.org/).", "value": "GiveDirectly"}, {"label": "Donate $1,000 to [Hurricane Melissa survivors in Jamaica](https://www.givedirectly.org/hurricanemelissa/?ref=home) (through GiveDirectly).", "value": "Melissa"}, {"label": "Donate $1,000 to [New Incentives](https://www.newincentives.org/).", "value": "New Incentives"}, {"label": "Donate $1,000 to the [Malala Fund](https://malala.org/).", "value": "Malala Fund"}, {"label": "Donate $1,000 to [Cool Earth](https://www.coolearth.org/).", "value": "Cool Earth"}, {"label": "Donate $1,000 to [Feeding America](https://www.feedingamerica.org/).", "value": "Feeding America"}, {"label": "Donate $1,000 to [Control AI](https://controlai.com/).", "value": "Control AI"}, {"label": "Donate $1,000 to the [Prairie Land Conservancy](https://www.prairielandconservancy.org/index.html).", "value": "Prairie Land Conservancy"}, {"label": "Donate $1,000 to [Habitat for Humanity](https://www.habitat.org/).", "value": "Habitat for Humanity"}, {"label": "Donate $1,000 to the [Eden Reforestation Projects](https://eden-plus.org/).", "value": "Eden Reforestation Projects"}, {"label": "Give each member $25 to purchase any products or services that will help them lead a more ethical lifestyle (for example, buying a compost bin or paying for a course).", "value": "ethical lifestyle"}, {"label": "Give the office full discretion on how to use the $1,000 to grow the team.", "value": "full discretion"}, {"label": "Give $1,000 to a school to create a native plant garden.", "value": "plant garden"}, {"label": "Use $1,000 to host a fundraiser for a non-profit that also advertises the Alliance.", "value": "fundraiser"}, {"label": "Pay a high school or college student $1,000 to develop an app for a future Alliance need.", "value": "develop an app"}], "required": true, "defaultValue": null, "randomizeOptions": true}]}], "title": "Approve proposals for how to spend $1,000 form", "submit": {"label": "Complete"}, "description": ""}', '2025-11-10 18:06:35.547975-08', '2025-11-10 21:47:37.604967-08');
INSERT INTO public.form VALUES (49, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1765858176072", "kind": "text", "text": "This is the last action of 2025. Thank you for honoring your commitment to the Alliance and for your efforts to improve the world.\n\nHere is our upcoming action schedule:\n\n- **12/15-12/22 (this week):** [AI survey](https://worldalliance.org/actions/56)\n- **12/22-12/29:** Holiday break (no new actions)\n- **12/29-1/5:** [Public comment action](https://worldalliance.org/actions/54)\n- **1/5-1/12:** Optional electronic waste collection\n", "markdown": true}, {"id": "block-1765862134092", "kind": "text", "text": "We''ve added an \"away\" feature to [Settings](https://worldalliance.org/settings). If you will be offline for an extended holiday vacation, please mark your absence now.", "markdown": true}, {"id": "field-1765862083574", "kind": "checkbox", "label": "I''ve marked myself as \"away\" for any vacation I am taking during the holidays.", "required": true}, {"id": "block-1765858681222", "kind": "text", "text": "After the holiday break, we''ll run an optional action that involves the collection and drop-off of members'' electronic waste. Find a non-exhaustive list of e-waste items [here](https://www.cleancreeks.org/DocumentCenter/View/206/Electronic-Waste-Items-List-PDF).\n\n1. If you produce any e-waste over the holidays (e.g., if you replace an old phone) it would be helpful if you could hold onto it until 1/5.\n2. To multiply the impact of your e-waste drop-off, we encourage you to collect e-waste from friends and family you may be seeing over the holidays.\n", "markdown": true}, {"id": "field-1765859140309", "kind": "textarea", "rows": 3, "label": "(Optional) If you plan to collect e-waste from friends and family over the holidays, please share how you plan to do so. For instance, you could ask for e-waste when you visit particular houses; or, if you have a get-together planned, you could ask guests to bring their e-waste to the get-together.", "required": false}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2025-12-15 20:13:40.870973-08', '2025-12-15 21:57:33.338021-08');
INSERT INTO public.form VALUES (42, 'Make a plan for next week’s pothole-related task form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1762824176360", "kind": "text", "text": "In an upcoming task, members will:\n1. Spend 10 minutes looking for a pothole (a hole in the road surface).\n2. Report it to their municipalities.\n\nTo learn about the benefits of reporting potholes, refer to the description of the corresponding action [here](https://worldalliance.org/actions/50).\n\nTo test the upcoming task, the office asked a member ([Grant Hough](https://worldalliance.org/user/11)) to locate and report a pothole. He found one 300ft from his house and it was filled within 24 hours:", "markdown": true}, {"id": "block-1762827521852", "alt": "Image", "src": "https://worldalliance.org/api/images/1762827526660.webp", "kind": "image"}, {"id": "block-1762836506629", "kind": "text", "text": "**Spending 10 minutes looking for a pothole may require advanced planning, so this task asks you to make a plan.** The upcoming task is due in 2 weeks, but you can complete it early.", "markdown": true}, {"id": "field-1762836581751", "kind": "textarea", "rows": 3, "label": "When are you going to spend 10 minutes between now and November 24th looking for a pothole? For instance, you could do so on a walk around your neighborhood or during your commute.", "required": true}, {"id": "block-1762826516396", "kind": "text", "text": "Now, take any actions you need in order to ensure you’ll look for a pothole, such as setting reminders or making a calendar event.", "markdown": false}, {"id": "field-1762829000450", "kind": "textarea", "rows": 3, "label": "What did you do to ensure you’ll look for a pothole?", "required": true}]}], "title": "Make a plan for next week’s pothole-related task form", "submit": {"label": "Complete"}, "description": ""}', '2025-11-10 17:22:46.713103-08', '2025-11-11 09:13:40.807719-08');
INSERT INTO public.form VALUES (5, 'Reliability form 25OCT28 update', '{"slug": "untitled-form", "pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1761685068051", "kind": "text", "text": "You are responsible for completing tasks on time. However, we offer a variety of systems to help. ", "markdown": true}, {"id": "block-1761693746972", "kind": "header", "text": "Notifications", "level": 3}, {"id": "field-1757527742080", "kind": "phone", "label": "By default, you will receive **text notifications** when you are assigned a task. Please enter your phone number below.", "required": true, "placeholder": "", "customValidatorId": 19, "autoExtractUserData": true}, {"id": "block-1761694220260", "kind": "text", "text": "You can pick a preferred time to receive automated notifications. Please pick a time when you are likely to be free.", "markdown": false}, {"id": "field-1761685585408", "kind": "timezone", "label": "What’s your timezone?", "required": true, "autoExtractUserData": true}, {"id": "field-1761692184325", "kind": "time", "label": "What time of day would you prefer to be sent notifications?", "required": true, "autoExtractUserData": true}]}, {"id": "page-2", "title": "Page 2", "fields": [{"id": "block-1761694458696", "kind": "text", "text": "You are responsible for completing tasks on time. However, we offer a variety of systems to help. ", "markdown": true}, {"id": "block-1761693724496", "kind": "header", "text": "Groups", "level": 3}, {"id": "block-1761692738480", "kind": "text", "text": "In addition to being a general member of the Alliance, you can also join a smaller Alliance group. Alliance groups consist of members who hold one another accountable and can convene for smaller-scale activities, such as discussions.\n\nYour group lead will remind you of deadlines and answer any questions you have about your tasks.", "markdown": true}, {"id": "field-1761692743909", "kind": "radio", "label": "Would you like to join a group? If so, we will match you to an existing group in 3-5 days.", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true, "visibleIf": [{"validatorId": 22, "resultEquals": false}]}, {"id": "field-1764895591141", "kind": "checkbox", "label": "You were added to a group automatically when you signed up. Click on the \"Groups\" page in the menu to see your group.", "required": true, "visibleIf": [{"validatorId": 22, "resultEquals": true}]}]}, {"id": "page-3", "title": "Page 3", "fields": [{"id": "block-1761694470582", "kind": "text", "text": "You are responsible for completing tasks on time. However, we offer a variety of systems to help. ", "markdown": true}, {"id": "block-1761693782406", "kind": "header", "text": "Other systems", "level": 3}, {"id": "block-1770399385015", "kind": "text", "text": "Members use a variety of other methods to complete tasks on time. Right now, every task has a 7-day window in which it can be completed, so you can set a recurring reminder for yourself at any time."}, {"id": "field-1761692883765", "kind": "multiselect", "label": "Which of these methods do you plan to use?", "options": [{"label": "Make a recurring calendar event", "value": "option1"}, {"label": "Set a recurring alarm on my phone", "value": "option2"}, {"label": "None", "value": "option3"}, {"label": "Other", "value": "option4"}], "required": true}, {"id": "field-1765503420282", "kind": "textarea", "rows": 1, "label": "Please create a recurring calendar event now.", "required": true, "visibleIf": [{"when": "field-1761692883765", "includesOption": "option1"}], "placeholder": "What time is the event? E.g., Mondays at 6pm."}, {"id": "field-1765503477581", "kind": "textarea", "rows": 1, "label": "Please create a recurring alarm now.", "required": true, "visibleIf": [{"when": "field-1761692883765", "includesOption": "option2"}], "placeholder": "What time is the alarm? E.g., Mondays at 6pm."}, {"id": "field-1765488765875", "kind": "textarea", "rows": 2, "label": "(Optional) Explain your plan to complete tasks on time. This will help us develop recommendations for future members.", "required": false, "visibleIf": [{"when": "field-1761692883765", "includesOption": "option4"}], "placeholder": "Please be as specific as you can."}]}], "title": "Reliability form 25OCT28 update", "submit": {"label": "Complete"}, "version": 1, "description": "", "outputViews": []}', '2025-08-31 12:36:09.618317-07', '2026-02-06 09:37:46.082534-08');
INSERT INTO public.form VALUES (44, 'Notify your local government about a pothole in your community Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1762828080779", "kind": "text", "text": "If a pothole is reported to a local municipality in the US, they are generally required to fill it in “reasonable time,” often within 3 days.\n\nMost members live in the US, where there are an estimated 8 potholes for every mile of road. Therefore, it is likely that many members (though not all) will be able to quickly find a pothole.", "markdown": false}, {"id": "block-1762837593758", "kind": "header", "text": "Step 1", "level": 4}, {"id": "field-1762828105195", "kind": "checkbox", "label": "Spend 10 minutes looking for a pothole (a hole in the road surface). If you find one, take a photo of the pothole and note its address and size", "required": true}, {"id": "field-1762828146411", "kind": "radio", "label": "Did you find a pothole?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true}, {"id": "block-1762837620595", "kind": "header", "text": "Step 2", "level": 4, "visibleIf": [{"when": "field-1762828146411", "equals": "yes"}]}, {"id": "field-1762828245962", "kind": "file", "label": "Upload the photo of the pothole you took.", "output": {"output": true}, "required": true, "visibleIf": [{"when": "field-1762828146411", "equals": "yes"}]}, {"id": "block-1762837632531", "kind": "header", "text": "Step 3", "level": 4, "visibleIf": [{"when": "field-1762828146411", "equals": "yes"}]}, {"id": "field-1762837823371", "kind": "radio", "label": "Google your city + “report a pothole” (for example: “Berkeley report a pothole”) to find your municipality''s pothole report form or phone number.", "options": [{"label": "I reported the pothole.", "value": "success"}, {"label": "I could not find a way to report a pothole to my municipality.", "value": "fail"}], "required": true, "visibleIf": [{"when": "field-1762828146411", "equals": "yes"}]}]}], "title": "Notify your local government about a pothole in your community Form", "submit": {"label": "Complete"}, "description": "", "outputViews": [{"id": "output-view-1763517367507-4c", "type": "default", "title": "Default", "blocks": [{"id": "block-1763517421357-ec7h", "kind": "text", "text": "Pothole photo:", "markdown": false}, {"id": "output-field-1763517372276-x3t9", "format": "textonly", "fieldId": "field-1762828245962", "showLabel": false, "labelOverride": "eeee"}], "description": ""}]}', '2025-11-10 18:33:20.982893-08', '2025-11-18 18:00:52.933491-08');
INSERT INTO public.form VALUES (45, 'Conduct a member oversight review of the Alliance', '{"pages": [{"id": "page-1", "title": "Open-ended questions", "fields": [{"id": "block-1764030747698", "kind": "text", "text": "We are asking for feedback to improve our platform, processes, and actions. This feedback also includes an oversight question, which is part of our [governance process](https://worldalliance.org/governance).", "markdown": true}, {"id": "block-1763680562478", "kind": "header", "text": "Open-ended questions", "level": 2}, {"id": "field-1763680093122", "kind": "textarea", "rows": 2, "label": "**1.** Please tell us about anything you want — observational, suggestive, positive, negative — about your experience with the Alliance.", "required": false}, {"id": "field-1763680594578", "kind": "textarea", "rows": 3, "label": "**2.** What is the Alliance? Please explain in your own words. The office will use these responses to improve our communications.", "required": true}]}, {"id": "page-2", "title": "Action questions", "fields": [{"id": "block-1764031114099", "kind": "text", "text": "We are asking for feedback to improve our platform, processes, and actions. This feedback also includes an oversight question, which is part of our [governance process](https://worldalliance.org/governance).", "markdown": true}, {"id": "block-1763928314093", "kind": "header", "text": "Action questions", "level": 2}, {"id": "field-1764031525298", "kind": "radio", "label": "**3. Main oversight question:** Do you expect that, going forward, at least 80% of your contributions to the Alliance will result in outcomes that you approve of?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true}, {"id": "field-1764031542629", "kind": "textarea", "rows": 2, "label": "Please explain why you expect this:", "required": true, "visibleIf": [{"when": "field-1764031525298", "equals": "no"}]}, {"id": "field-1763680709825", "kind": "multiselect", "label": "**4.** What triggers you to complete a task?", "options": [{"label": "I complete the action after I receive a text reminder", "value": "option1"}, {"label": "I spontaneously think of the Alliance in my free time", "value": "option2"}, {"label": "I wait until near the deadline", "value": "option3"}, {"label": "I have an alarm/calendar event", "value": "option4"}, {"label": "Something else", "value": "option5"}], "required": true}, {"id": "field-1763680809212", "kind": "textarea", "rows": 2, "label": "Please elaborate:", "required": true, "visibleIf": [{"when": "field-1763680709825", "includesOption": "option5"}]}, {"id": "field-1763680941271", "kind": "textarea", "rows": 2, "label": "**5.** Have you experienced any challenges when completing actions?", "required": true}, {"id": "field-1763680972796", "kind": "multiselect", "label": "**6.** Select your favorite actions so far (max 3):", "options": [{"label": "[Participate in a discussion about potential habit changes](https://worldalliance.org/actions/13)", "value": "Habit_Changes"}, {"label": "[Sign a letter requesting news coverage of a bring-your-own-cup cafe coalition](https://worldalliance.org/actions/14)", "value": "Letter_BYOC"}, {"label": "[Provide a quote about Alliance participation](https://worldalliance.org/actions/18)", "value": "Quote_BYOC"}, {"label": "[Read and discuss an article about global inequality](https://worldalliance.org/actions/26)", "value": "Global_Inequality"}, {"label": "[Answer questions about nonprofit website copy and design](https://worldalliance.org/actions/32)", "value": "Nonprofit_Design"}, {"label": "[Decide how to allocate $1,000](https://worldalliance.org/actions/47)", "value": "Allocate_1000"}, {"label": "[Suggest a problem that could be addressed by a future Alliance action](https://worldalliance.org/actions/46)", "value": "Suggest_Action"}, {"label": "[Approve proposals for how to spend $1,000](https://worldalliance.org/actions/49)", "value": "Approve_1000_Proposals"}, {"label": "[Personalize your task reminders](https://worldalliance.org/actions/34)", "value": "Personalize_Reminders"}, {"label": "[Report a pothole in your community](https://worldalliance.org/tasks)", "value": "Report_Pothole"}, {"label": "I did not have a favorite action", "value": "No_Favorite"}], "required": true, "defaultValue": null, "maxSelections": 3, "randomizeOptions": false}, {"id": "field-1763682110769", "kind": "textarea", "rows": 2, "label": "**7.** Why were the actions you selected your favorites? If you did not have a favorite, please write N/A.", "required": true}, {"id": "field-1763682314463", "kind": "multiselect", "label": "**8.** Select your least favorite actions so far (max 3):", "options": [{"label": "[Participate in a discussion about potential habit changes](https://worldalliance.org/actions/13)", "value": "Habit_Changes"}, {"label": "[Sign a letter requesting news coverage of a bring-your-own-cup cafe coalition](https://worldalliance.org/actions/14)", "value": "Letter_BYOC"}, {"label": "[Provide a quote about Alliance participation](https://worldalliance.org/actions/18)", "value": "Quote_BYOC"}, {"label": "[Read and discuss an article about global inequality](https://worldalliance.org/actions/26)", "value": "Global_Inequality"}, {"label": "[Answer questions about nonprofit website copy and design](https://worldalliance.org/actions/32)", "value": "Nonprofit_Design"}, {"label": "[Decide how to allocate $1,000](https://worldalliance.org/actions/47)", "value": "Allocate_1000"}, {"label": "[Suggest a problem that could be addressed by a future Alliance action](https://worldalliance.org/actions/46)", "value": "Suggest_Action"}, {"label": "[Approve proposals for how to spend $1,000](https://worldalliance.org/actions/49)", "value": "Approve_1000_Proposals"}, {"label": "[Personalize your task reminders](https://worldalliance.org/actions/34)", "value": "Personalize_Reminders"}, {"label": "[Report a pothole in your community](https://worldalliance.org/tasks)", "value": "Report_Pothole"}, {"label": "I did not have a least favorite action", "value": "No_Favorite"}], "required": true, "maxSelections": 3, "randomizeOptions": false}, {"id": "field-1763682600964", "kind": "textarea", "rows": 3, "label": "**9.** Why were the actions you selected your least favorites? If you did not have a least favorite, please write N/A.", "required": true}]}, {"id": "page-4", "title": "Platform questions", "fields": [{"id": "block-1764031125643", "kind": "text", "text": "We are asking for feedback to improve our platform, processes, and actions. This feedback also includes an oversight question, which is part of our [governance process](https://worldalliance.org/governance).", "markdown": true}, {"id": "block-1763928360734", "kind": "header", "text": "Platform questions", "level": 2}, {"id": "field-1764034127020", "kind": "radio", "label": "**10.** Do you want more, less, or the same amount of interaction with fellow members?", "options": [{"label": "More", "value": "more"}, {"label": "Same", "value": "same"}, {"label": "Less", "value": "less"}], "required": true}, {"id": "field-1764034149855", "kind": "textarea", "rows": 2, "label": "Are there any particular kinds of interactions you would like?", "required": false, "visibleIf": [{"when": "field-1764034127020", "equals": "more"}]}, {"id": "field-1763683505336", "kind": "textarea", "rows": 2, "label": "**11.** Have you experienced any difficulties using the Alliance website?", "required": true}, {"id": "field-1763683571431", "kind": "textarea", "rows": 2, "label": "**12.** Are there any features you would like us to add to the website?", "required": true}]}, {"id": "page-5", "title": "Conclusion", "fields": [{"id": "block-1764031131196", "kind": "text", "text": "We are asking for feedback to improve our platform, processes, and actions. This feedback also includes an oversight question, which is part of our [governance process](https://worldalliance.org/governance).", "markdown": true}, {"id": "block-1763928373939", "kind": "header", "text": "Conclusion", "level": 2}, {"id": "field-1764008755004", "kind": "range", "label": "**13.** On a scale from 1 to 10, how willing are you to invite a friend to join the Alliance?", "endLabel": "Extremely willing", "required": true, "startLabel": "Not at all willing", "optionCount": 10}, {"id": "field-1764031793265", "kind": "textarea", "rows": 3, "label": "**14.** Do you have any questions about the Alliance? We will answer common questions in an upcoming public FAQ.", "required": true}, {"id": "field-1763684191754", "kind": "textarea", "rows": 2, "label": "**15.** Are there any other thoughts or feedback that you would like to share?", "required": false}]}], "title": "Conduct a member oversight review of the Alliance", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2025-11-20 15:07:35.206-08', '2025-11-24 18:11:36.816071-08');
INSERT INTO public.form VALUES (3, 'Onboarding form', '{"slug": "untitled-form", "pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "field-1756502285865", "kind": "checkbox", "label": "**Step 1**: Go to your profile page by clicking your name in the left menu.", "required": true, "visibleIf": [{"deviceType": ["tablet", "desktop"]}]}, {"id": "field-1763071739304", "kind": "checkbox", "label": "**Step 1**: Go to your profile page by tapping the default profile photo in the top right.", "required": true, "visibleIf": [{"deviceType": ["mobile"]}]}, {"id": "field-1757526963938", "kind": "checkbox", "label": "**Step 2**: Upload a profile photo by clicking \"Edit Profile\" and clicking your profile picture.", "required": true, "visibleIf": [{"deviceType": ["tablet", "desktop"]}], "customValidatorId": 3}, {"id": "field-1763071833670", "kind": "checkbox", "label": "**Step 2**: Upload a profile photo by tapping \"Edit Profile\" and tapping your profile picture.", "required": true, "visibleIf": [{"deviceType": ["mobile"]}], "customValidatorId": 3}, {"id": "field-1756502321564", "kind": "checkbox", "label": "**Step 3**: Write a few sentences about yourself in your profile description.", "required": true, "customValidatorId": 2}, {"id": "block-1768431883854", "kind": "text", "text": "**Step 4**: Where do you spend most of your time?\n\nActions are often location-specific. If we do not know your location:\n- We will be unable to assign certain tasks to you.\n- Some tasks we assign will not include helpful, location-specific details.", "markdown": true}, {"id": "field-1768431586758", "kind": "city", "label": "In the future, you can change your location in [Settings](https://worldalliance.org/settings).", "required": false, "minLength": 1, "placeholder": "Search for a city"}]}], "title": "Onboarding form", "submit": {"label": "Complete"}, "version": 1, "description": "", "outputViews": []}', '2025-08-26 10:26:25.364324-07', '2026-02-03 12:47:07.965184-08');
INSERT INTO public.form VALUES (56, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1768346176031", "kind": "text", "text": "The office recently wrote a public progress update that describes the key learnings from the actions the Alliance has run so far. This update includes information about members’ reliability, members’ experience, action production, and other topics.\n\nYou can read the progress update [here](https://worldalliance.org/progress/early-action-learnings).", "markdown": false}, {"id": "field-1768346289629", "kind": "checkbox", "label": "I read the progress update.", "required": false}, {"id": "field-1768346325497", "kind": "textarea", "rows": 3, "label": "[Optional] If you have any questions, leave them here and the office will do our best to get back to you.", "required": false}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-13 15:19:28.545-08', '2026-01-13 15:19:28.545-08');
INSERT INTO public.form VALUES (52, 'Review three previous Alliance actions', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1766641763839", "kind": "text", "text": "This week, most members will complete [Submit a public comment to your local government](https://worldalliance.org/actions/53) as a follow-up to [Prepare to submit a public comment to your local government](https://worldalliance.org/actions/53).\n\nSince you were not a member during the preparatory action, you will instead review three past actions to develop a better understanding of the Alliance. In a previous feedback survey, these three actions were among members'' favorites.", "markdown": true}, {"id": "block-1766641774939", "kind": "header", "text": "Action 1: Report a pothole in your community", "level": 3}, {"id": "block-1766641780905", "kind": "text", "text": "**Step 1**: Review [Report a pothole in your community](https://worldalliance.org/actions/50). You can also view photos of the potholes members reported [here](https://worldalliance.org/feed/50).", "markdown": true}, {"id": "field-1766641784706", "kind": "textarea", "rows": 2, "label": "**Step 2**: Do you have thoughts or questions about this action?", "required": true}, {"id": "block-1766641787538", "kind": "header", "text": "Action 2: Decide how to allocate $1000", "level": 3}, {"id": "block-1766641788939", "kind": "text", "text": "**Step 1**: Review [Decide how to allocate $1,000 next week](https://worldalliance.org/actions/47).", "markdown": true}, {"id": "block-1766642019206", "kind": "text", "text": "**Step 2**: Review the follow-up action [Approve proposals for how to spend $1,000](https://worldalliance.org/actions/49).", "markdown": true}, {"id": "field-1766641790739", "kind": "textarea", "rows": 2, "label": "**Step 3**: Do you have thoughts or questions about this action?", "required": true}, {"id": "block-1766641791939", "kind": "header", "text": "Action 3: Read and discuss an article about global inequality", "level": 3}, {"id": "block-1766641792439", "kind": "text", "text": "**Step 1**: Review [Read and discuss an article about global inequality](https://worldalliance.org/actions/26).", "markdown": true}, {"id": "field-1766641793906", "kind": "textarea", "rows": 2, "label": "**Step 2**: Do you have thoughts or questions about this action?", "required": false}, {"id": "block-1766642110322", "kind": "text", "text": "**Step 3 (optional)**: Complete the action by reading the article and leaving a comment on the associated forum post.\n", "markdown": true}]}], "title": "Review three previous Alliance actions", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2025-12-24 21:56:01.493715-08', '2026-01-04 11:00:07.938463-08');
INSERT INTO public.form VALUES (60, 'Properly dispose of the e-waste you collected', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1768347827078", "kind": "text", "text": "Last week, members:\n\n- Read about the impacts of improper e-waste disposal on the environment and health of informal waste workers.\n- Gathered a total of [X kg (Y lbs)] of e-waste.\n\nThis week, you will drop off the e-waste you collected (unless you dropped it off already).", "markdown": true}, {"id": "block-1768347842258", "kind": "text", "text": "**Step 1**: Please drop off your e-waste. You can review the plan you made on [last week’s action page](https://worldalliance.org/actions/60).", "markdown": true}, {"id": "field-1768347877179", "kind": "checkbox", "label": "I have dropped off my e-waste", "required": true}, {"id": "field-1768347929308", "kind": "textarea", "rows": 1, "label": "How did you drop off your e-waste?", "required": false}, {"id": "field-1768347902207", "kind": "textarea", "rows": 1, "label": "Roughly how long did it take you to drop off your e-waste?", "required": false}, {"id": "block-1768348002428", "kind": "text", "text": "**Step 2**: (Optional) Do you have any additional comments?", "markdown": true}, {"id": "field-1768347974166", "kind": "textarea", "rows": 2, "label": "For instance, please tell us if dropping off your e-waste was substantially better or worse than expected, or if you collected more e-waste since you completed the previous action.", "required": false}]}], "title": "Properly dispose of the e-waste you collected", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-13 15:48:51.371-08', '2026-01-13 16:15:26.736-08');
INSERT INTO public.form VALUES (59, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1768346176031", "kind": "text", "text": "The office recently wrote a public progress update that describes key learnings from the actions the Alliance has run so far. This update includes information about members’ reliability, members’ experience, action production, and other topics.\n\nYou can read the progress update [here](https://worldalliance.org/progress/early-action-learnings).", "markdown": true}, {"id": "field-1768346289629", "kind": "checkbox", "label": "I read the progress update.", "required": true}, {"id": "field-1768346325497", "kind": "textarea", "rows": 2, "label": "(Optional) If you have any questions, leave them here and we will do our best to get back to you.", "required": false}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-13 15:19:28.545-08', '2026-01-13 18:47:32.604842-08');
INSERT INTO public.form VALUES (57, 'Properly dispose of the e-waste you collected', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1768347827078", "kind": "text", "text": "Last week, members:\n\n- Read about the impacts of improper e-waste disposal on the environment and health of informal waste workers.\n- Gathered a total of 57 kg (126 lbs) of e-waste.\n\nThis week, you will drop off the e-waste you collected (unless you dropped it off already).", "markdown": true}, {"id": "block-1768347842258", "kind": "text", "text": "**Step 1**: Drop off your e-waste. You can review the plan you made on [last week’s action page](https://worldalliance.org/actions/60).", "markdown": true}, {"id": "field-1768347877179", "kind": "checkbox", "label": "I have dropped off my e-waste", "required": true}, {"id": "field-1768347929308", "kind": "textarea", "rows": 1, "label": "How did you drop off your e-waste?", "required": false}, {"id": "field-1768347902207", "kind": "textarea", "rows": 1, "label": "Roughly how long did it take you to drop off your e-waste?", "required": false}, {"id": "block-1768348002428", "kind": "text", "text": "**Step 2**: Do you have any additional comments?", "markdown": true}, {"id": "field-1768347974166", "kind": "textarea", "rows": 2, "label": "For instance, please share if dropping off your e-waste was substantially better or worse than expected, or if you collected more e-waste since you completed the previous action.", "required": false}]}], "title": "Properly dispose of the e-waste you collected", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-13 15:48:51.371121-08', '2026-01-14 15:23:02.594417-08');
INSERT INTO public.form VALUES (46, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1764647309603", "kind": "text", "text": "Artificial intelligence (AI) services, such as ChatGPT, have the potential to leak users’ personal information as a result of model training processes.\n\nFor instance, a model could memorize personal data during training and, once it is released, [surface the data to another user](https://arxiv.org/abs/2310.15469). Companies do not offer methods of erasing information from the “memories” of their released AI models.\n\nUsers are often opted into sharing their data for training and other purposes by default (opt-out policies). However, when other digital services are required to request permission proactively (opt-in policies), [a large majority of users deny them](https://www.flurry.com/blog/att-opt-in-rate-monthly-updates/). This suggests that services with opt-out policies may violate many of their users'' expectations about the way their data is used.\n\nThis action will measure members’ awareness of and inclination to change major AI services’ privacy settings. **If members’ responses suggest that an opt-in policy would better serve users than an opt-out policy, we will use the data to kick-start a follow-up campaign** that:\n1. Helps members’ friends and family take steps to protect their privacy.\n2. Pushes the media to promote the adoption of AI data use opt-in policies.", "markdown": true}, {"id": "field-1764647399426", "kind": "textarea", "rows": 3, "label": "What do you currently know about the way your data is used by companies that deliver AI services – particularly OpenAI, Google, X/Twitter, and Meta?", "required": true}]}, {"id": "page-2", "title": "OAI", "fields": [{"id": "block-1764647433459", "kind": "header", "text": "OpenAI", "level": 2}, {"id": "block-1764647448616", "kind": "text", "text": "By default, OpenAI has permission to [use your conversations](https://openai.com/policies/row-privacy-policy/) with ChatGPT to train future AI models, including any files or images you upload and any personal information you share (such as names, locations, and private thoughts).", "markdown": true}, {"id": "field-1764647472849", "kind": "radio", "label": "Do you use ChatGPT?", "options": [{"label": "Yes (will reveal a follow-up question)", "value": "option1"}, {"label": "No", "value": "option2"}], "required": true}, {"id": "field-1764647518446", "kind": "radio", "label": "Do you want OpenAI to train AI models on your conversations?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No (will reveal a follow-up question)", "value": "option2"}], "required": true, "visibleIf": [{"when": "field-1764647472849", "equals": "option1"}]}, {"id": "block-1764647582721", "kind": "text", "text": "You can opt out by following these steps:\n\n1. Sign into your ChatGPT account\n2. Go to [https://chatgpt.com/#settings/DataControls](https://chatgpt.com/#settings/DataControls) \n3. Turn off “Improve the model for everyone”", "markdown": true, "visibleIf": [{"when": "field-1764647518446", "equals": "option2"}, {"when": "field-1764647472849", "equals": "option1"}]}, {"id": "field-1764647622352", "kind": "radio", "label": "Did you turn off “Improve the model for everyone”?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No", "value": "option2"}, {"label": "I did this in the past", "value": "option3"}], "required": true, "visibleIf": [{"when": "field-1764647518446", "equals": "option2"}, {"when": "field-1764647472849", "equals": "option1"}]}]}, {"id": "page-3", "title": "Google", "fields": [{"id": "block-1764647711365", "kind": "header", "text": "Google", "level": 2}, {"id": "block-1764647727050", "kind": "text", "text": "By default, Google has permission to [use your conversations](https://myactivity.google.com/u/1/product/gemini) with its AI product, Gemini, to train future AI models. Some users load their personal data from other Google services into their conversations with Gemini, such as Gmail, Google Photos, and Google Calendar.", "markdown": true}, {"id": "field-1764647772042", "kind": "radio", "label": "Do you use Gemini?", "options": [{"label": "Yes (will reveal a follow-up question)", "value": "option1"}, {"label": "No", "value": "option2"}], "required": true}, {"id": "field-1764647853497", "kind": "radio", "label": "Do you want Google to train AI models on your conversations?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No (will reveal a follow-up question)", "value": "option2"}], "required": true, "visibleIf": [{"when": "field-1764647772042", "equals": "option1"}]}, {"id": "block-1764647906429", "kind": "text", "text": "You can opt out by following these steps:\n\n1. Sign into your Google account\n2. Go to [https://myactivity.google.com/u/1/product/gemini](https://myactivity.google.com/u/1/product/gemini)\n3. Turn off “Keep activity”", "markdown": true, "visibleIf": [{"when": "field-1764647853497", "equals": "option2"}, {"when": "field-1764647772042", "equals": "option1"}]}, {"id": "field-1764647953803", "kind": "radio", "label": "Did you turn off “Keep activity”?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No", "value": "option2"}, {"label": "I did this in the past", "value": "option3"}], "required": true, "visibleIf": [{"when": "field-1764647853497", "equals": "option2"}, {"when": "field-1764647772042", "equals": "option1"}]}]}, {"id": "page-4", "title": "X/Twitter", "fields": [{"id": "block-1764648007710", "kind": "header", "text": "X/Twitter", "level": 2}, {"id": "block-1764648022496", "kind": "text", "text": "By default, X/Twitter has permission to [use your conversations](https://help.x.com/en/using-x/about-grok) with its AI product, Grok, along with your tweets, likes, comments, and profile information to train future AI models.", "markdown": true}, {"id": "field-1764648046304", "kind": "radio", "label": "Do you use X/Twitter?", "options": [{"label": "Yes (will reveal a follow-up question)", "value": "option1"}, {"label": "No", "value": "option2"}], "required": true}, {"id": "field-1764648072974", "kind": "radio", "label": "Do you want X/Twitter to train AI models on your information?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No (will reveal a follow-up question)", "value": "option2"}], "required": true, "visibleIf": [{"when": "field-1764648046304", "equals": "option1"}]}, {"id": "block-1764648109669", "kind": "text", "text": "You can opt out by following these steps:\n\n1. Sign into your X/Twitter account\n2. Go to [https://x.com/settings/grok_settings](https://x.com/settings/grok_settings)\n3. Uncheck “Allow your public data as well as your interactions, inputs, and results with Grok and xAI to be used for training and fine-tuning”", "markdown": true, "visibleIf": [{"when": "field-1764648072974", "equals": "option2"}, {"when": "field-1764648046304", "equals": "option1"}]}, {"id": "field-1764648160491", "kind": "radio", "label": "Did you uncheck the setting?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No", "value": "option2"}, {"label": "I did this in the past", "value": "option3"}], "required": true, "visibleIf": [{"when": "field-1764648072974", "equals": "option2"}, {"when": "field-1764648046304", "equals": "option1"}]}]}, {"id": "page-5", "title": "Meta", "fields": [{"id": "block-1764648199373", "kind": "header", "text": "Meta", "level": 2}, {"id": "block-1764648204663", "kind": "text", "text": "By default, Meta has permission to [use your conversations](https://www.facebook.com/privacy/genai/) with its AI product, Meta AI, along with your public posts, likes, comments, and photos to train future AI models. ", "markdown": true}, {"id": "field-1764648235188", "kind": "radio", "label": "Do you use any Meta products (Facebook, Instagram, Whatsapp)?", "options": [{"label": "Yes (will reveal a follow-up question)", "value": "option1"}, {"label": "No", "value": "option2"}], "required": true}, {"id": "field-1764648255183", "kind": "radio", "label": "Do you want Meta to train AI models on your information?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No (will reveal a follow-up question)", "value": "option2"}], "required": true, "visibleIf": [{"when": "field-1764648235188", "equals": "option1"}]}, {"id": "block-1764648283704", "kind": "text", "text": "Meta does not provide an option to prevent your data from being used to train future AI models.", "markdown": false, "visibleIf": [{"when": "field-1764648255183", "equals": "option2"}, {"when": "field-1764648235188", "equals": "option1"}]}, {"id": "field-1764648324095", "kind": "radio", "label": "Would you have opted out given the opportunity to do so?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No", "value": "option2"}], "required": true, "visibleIf": [{"when": "field-1764648255183", "equals": "option2"}, {"when": "field-1764648235188", "equals": "option1"}]}]}, {"id": "page-6", "title": "Page 6", "fields": [{"id": "block-1764648358364", "kind": "header", "text": "Conclusion", "level": 2}, {"id": "field-1764648364183", "kind": "textarea", "rows": 3, "label": "Did you know about the existence of any of the settings that we covered before you completed this action?", "required": true}, {"id": "field-1764648378954", "kind": "textarea", "rows": 3, "label": "Did you opt out of having your data used for any of the services? Why or why not?", "required": true}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2025-12-01 19:48:53.232453-08', '2025-12-01 23:09:00.979272-08');
INSERT INTO public.form VALUES (54, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1767749166619", "kind": "text", "text": "In this action, you will gather e-waste from around your house and make a plan for its proper disposal. Next week, you will dispose of your e-waste.", "markdown": true}, {"id": "block-1767749266283", "kind": "header", "text": "Part 1: Reading", "level": 2}, {"id": "field-1767753842409", "kind": "checkbox", "label": "First, quickly scan the photos in this NPR article: [https://www.npr.org/sections/goats-and-soda/2024/10/05/g-s1-6411/electronics-public-health-waste-ghana-phones-computers](https://www.npr.org/sections/goats-and-soda/2024/10/05/g-s1-6411/electronics-public-health-waste-ghana-phones-computers)", "required": true}, {"id": "block-1767749191299", "kind": "text", "text": "Then, read the following information about e-waste we have compiled for you:\n\nElectronic waste (e-waste), such as old phones, batteries, and chargers, is usually thrown away with  normal trash. A widely cited report claims that e-waste is responsible for [about 70% of heavy metals in landfills](http://web.archive.org/web/20130930082652/https://infohouse.p2ric.org/ref/41/40164.htm), which subsequently leach into surrounding soil, air, and water over time or as a result of improper landfill management.\n\n[Most e-waste ends up in landfills](https://www.cnn.com/2024/03/20/climate/electronic-waste-recycling-climate-un) in developing countries such as Ghana and Nigeria; it is often exported to these countries illegally. People, including children, collect and dismantle e-waste in nearby landfills for short-term income. Toxic materials released from the e-waste cause severe health problems, including [reduced IQ, impaired lung function, and still births](https://www.greenpolicyplatform.org/sites/default/files/downloads/resource/9789240023901-eng.pdf). Continued deposition of e-waste [discourages investment](https://www.sciencedirect.com/topics/earth-and-planetary-sciences/waste-export) in longer-term, safer local industry.\n\nComprehensive reclamation of precious metals from e-waste would significantly reduce emissions-producing and exploitative mining activities. For instance, over 34,000 tons of [cobalt ended up in e-waste](https://www.cobaltinstitute.org/news/mining-cobalt-from-waste-capturing-lost-value-in-a-responsible-cobalt-value-chain/) in 2022, over one-sixth of the cobalt mined in the same time period.\n\nAs of 2022, [only about 22% of e-waste is properly recycled](http://web.archive.org/web/20240326015506/https://api.globalewaste.org/publications/file/297/Global-E-waste-Monitor-2024.pdf).\n\nE-waste recycling providers are effective at keeping materials out of landfills. For example, [Electronic Recyclers International](https://eridirect.com/) claims that [all materials sent to them are 100% recycled.](https://eridirect.com/sustainability/products-we-recycle/) Therefore, if all members expected to complete this action collect 1 lb of e-waste on average, **we could prevent 51 lbs of e-waste from ending up in landfills.**", "markdown": true}]}, {"id": "page-2", "title": "Page 2", "fields": [{"id": "block-1767749289821", "kind": "header", "text": "Part 2: Collection", "level": 2}, {"id": "block-1767749619021", "kind": "text", "text": "Before you collect e-waste, take a moment to research how you would dispose of it.\n\nMunicipal programs, non-profits, and various organizations such as [Goodwill](https://sfgoodwill.org/donate/donate-electronics/), [Staples](https://stores.staples.com/search) and [Best Buy](https://www.bestbuy.com/site/store-locator) offer free e-waste recycling. **You can Google “e-waste + [your city]” for help.**", "markdown": true}, {"id": "field-1767750625233", "kind": "textarea", "rows": 3, "label": "Describe how you would dispose of your e-waste, even if you think it will take more than 15 minutes. Take note of any items limits your drop-off location may have.", "required": true}, {"id": "block-1767749693950", "kind": "text", "text": "If you think you cannot dispose of your e-waste in 15 minutes, you are not required to (but are encouraged to) complete next week’s disposal action. **If you opt out of these actions, you will not receive a task to complete next week.**", "markdown": true}, {"id": "field-1767749663667", "kind": "radio", "label": "Will you complete next week''s disposal action? If you don''t have any e-waste yourself, you can still complete the task by collecting e-waste from friends and family. ", "options": [{"label": "Yes (will reveal follow-up steps)", "value": "yes"}, {"label": "No", "value": "no"}], "required": true}, {"id": "field-1767929175252", "kind": "textarea", "rows": 2, "label": "Why won''t you complete next week''s disposal action?", "required": true, "visibleIf": [{"when": "field-1767749663667", "equals": "no"}]}, {"id": "field-1767749747502", "kind": "textarea", "rows": 3, "label": "**Step 1**: Make a plan to ensure you will dispose of your e-waste. (For example, you could set a phone alarm to drop it off on the way to work.)", "required": true, "visibleIf": [{"when": "field-1767749663667", "equals": "yes"}]}, {"id": "block-1767749827565", "kind": "text", "text": "**Step 2**: Collect as many old, unwanted electronic waste items as you can. Any product that has a plug or a battery is considered e-waste. Some common e-waste items are:\n- Phones and laptops\n- Light bulbs\n- Chargers\n- Batteries\n- Headphones\n\nA longer list can be found [here](https://www.cleancreeks.org/DocumentCenter/View/206/Electronic-Waste-Items-List-PDF).", "markdown": true, "visibleIf": [{"when": "field-1767749663667", "equals": "yes"}]}, {"id": "field-1767749913966", "kind": "radio", "label": "Did you collect any e-waste?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true, "visibleIf": [{"when": "field-1767749663667", "equals": "yes"}]}, {"id": "block-1767750001221", "kind": "text", "text": "**Step 3 (optional):** Increase your impact by asking friends, family, or housemates to give you any e-waste they might have. A request could look like:\n\n*“I’m part of a group called the Alliance that takes weekly action to create positive change. This week, we’re collecting e-waste to recycle. I’m going to drop off e-waste next week at a recycling facility, so when I see you later today, it would be great if you could bring any e-waste you have.”*", "markdown": true, "visibleIf": [{"when": "field-1767749663667", "equals": "yes"}]}, {"id": "field-1767750156706", "kind": "radio", "label": "Did you collect any e-waste from others?", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": true, "visibleIf": [{"when": "field-1767749663667", "equals": "yes"}]}, {"id": "block-1767750324580", "kind": "text", "text": "**Step 4**: Take a photo of and measure your collected e-waste.", "markdown": true, "visibleIf": [{"when": "field-1767749663667", "equals": "yes"}]}, {"id": "field-1767750395397", "kind": "file", "label": "Photo:", "output": {"output": true}, "required": true, "visibleIf": [{"when": "field-1767749663667", "equals": "yes"}]}, {"id": "field-1767750418558", "kind": "textarea", "rows": 1, "label": "Estimated weight:", "output": {"output": true}, "required": true, "visibleIf": [{"when": "field-1767749663667", "equals": "yes"}]}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": "", "outputViews": [{"id": "output-view-1767750812727-fk", "type": "default", "title": "View 1", "blocks": [{"id": "output-field-1767750819972-8scs", "format": "field", "fieldId": "field-1767750395397", "showLabel": true}, {"id": "output-field-1767750823001-boeu", "format": "field", "fieldId": "field-1767750418558", "showLabel": true}], "description": ""}]}', '2026-01-06 17:26:21.58877-08', '2026-01-08 19:28:02.246083-08');
INSERT INTO public.form VALUES (48, 'Public AI data privacy survey', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1764647309603", "kind": "text", "text": "AI services, such as ChatGPT, train AI models on user data by default. This **opt-out policy** means many users are not aware of the way that their data is used, exposing them to privacy risks.\n\nFor instance, an AI model can memorize personal data and [leak it to another user](https://arxiv.org/abs/2310.15469). AI services do not offer ways to erase information from the “memories” of their released AI models.\n\nBy contrast, an **opt-in policy** would prevent training by default and allow users who wish to share their data for training to do so.\n\nIn a pilot survey, **two-thirds of respondents did not want their conversations used to train ChatGPT**. Many respondents opted out of sharing their data during the survey. These results suggest users may prefer an opt-in policy over an opt-out policy.\n\n**If this follow-up survey replicates these findings, we will use them to run an advocacy campaign** that engages journalists, researchers, and advocacy organizations to promote opt-in data policies as an industry standard.", "markdown": true}, {"id": "field-1765411205105", "kind": "textarea", "rows": 1, "label": "What is your name?", "required": true}, {"id": "field-1764647399426", "kind": "textarea", "rows": 3, "label": "What do you currently know about the way your data is used by companies that deliver AI services – particularly OpenAI, Google, X/Twitter, and Meta?", "required": false}]}, {"id": "page-2", "title": "OAI", "fields": [{"id": "block-1764647433459", "kind": "header", "text": "OpenAI", "level": 2}, {"id": "block-1764647448616", "kind": "text", "text": "By default, OpenAI has permission to [use your conversations](https://openai.com/policies/row-privacy-policy/) with ChatGPT to train future AI models, including any files or images you upload and any personal information you share (such as names, locations, and private thoughts).", "markdown": true}, {"id": "field-1764647472849", "kind": "radio", "label": "Do you use ChatGPT?", "options": [{"label": "Yes (will reveal a follow-up question)", "value": "option1"}, {"label": "No", "value": "option2"}], "required": true}, {"id": "field-1764647518446", "kind": "radio", "label": "Do you want OpenAI to train AI models on your conversations?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No (will reveal a follow-up question)", "value": "option2"}], "required": true, "visibleIf": [{"when": "field-1764647472849", "equals": "option1"}]}, {"id": "block-1766171747015", "kind": "text", "text": "Because you said \"Yes\" to the above question, we will not reveal follow-up steps that explain how to opt out.", "markdown": false, "visibleIf": [{"when": "field-1764647472849", "equals": "option1"}, {"when": "field-1764647518446", "equals": "option1"}]}, {"id": "block-1764647582721", "kind": "text", "text": "**You can opt out by following these steps:**\n\n1. Sign into your ChatGPT account\n2. Go to [https://chatgpt.com/#settings/DataControls](https://chatgpt.com/#settings/DataControls) \n3. Turn off “Improve the model for everyone”", "markdown": true, "visibleIf": [{"when": "field-1764647518446", "equals": "option2"}, {"when": "field-1764647472849", "equals": "option1"}]}, {"id": "block-1766083484628", "alt": "Image", "src": "https://worldalliance.org/api/images/1766176416769.webp", "kind": "image", "visibleIf": [{"when": "field-1764647472849", "equals": "option1"}, {"when": "field-1764647518446", "equals": "option2"}]}, {"id": "field-1764647622352", "kind": "radio", "label": "Did you turn off “Improve the model for everyone”?", "options": [{"label": "Yes, I just turned it off", "value": "option1"}, {"label": "No", "value": "option2"}, {"label": "I did this in the past", "value": "option3"}], "required": true, "visibleIf": [{"when": "field-1764647518446", "equals": "option2"}, {"when": "field-1764647472849", "equals": "option1"}]}, {"id": "field-1766164877436", "kind": "textarea", "rows": 2, "label": "Why did you not turn off \"Improve the model for everyone\" even though you don''t want OpenAI to train AI models on your conversations?", "required": true, "visibleIf": [{"when": "field-1764647472849", "equals": "option1"}, {"when": "field-1764647518446", "equals": "option2"}, {"when": "field-1764647622352", "equals": "option2"}]}]}, {"id": "page-3", "title": "Google", "fields": [{"id": "block-1764647711365", "kind": "header", "text": "Google", "level": 2}, {"id": "block-1764647727050", "kind": "text", "text": "By default, Google has permission to [use your conversations](https://myactivity.google.com/u/1/product/gemini) with its AI product, Gemini, to train future AI models. Some users load their personal data from other Google services into their conversations with Gemini, such as Gmail, Google Photos, and Google Calendar.", "markdown": true}, {"id": "field-1764647772042", "kind": "radio", "label": "Do you use Gemini?", "options": [{"label": "Yes (will reveal a follow-up question)", "value": "option1"}, {"label": "No", "value": "option2"}], "required": true}, {"id": "field-1764647853497", "kind": "radio", "label": "Do you want Google to train AI models on your conversations?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No (will reveal a follow-up question)", "value": "option2"}], "required": true, "visibleIf": [{"when": "field-1764647772042", "equals": "option1"}]}, {"id": "block-1766171831075", "kind": "text", "text": "Because you said \"Yes\" to the above question, we will not reveal follow-up steps that explain how to opt out.", "markdown": false, "visibleIf": [{"when": "field-1764647772042", "equals": "option1"}, {"when": "field-1764647853497", "equals": "option1"}]}, {"id": "block-1764647906429", "kind": "text", "text": "**You can opt out by following these steps:**\n\n1. Sign into your Google account\n2. Go to [https://myactivity.google.com/u/1/product/gemini](https://myactivity.google.com/u/1/product/gemini)\n3. Turn off “Keep activity”", "markdown": true, "visibleIf": [{"when": "field-1764647853497", "equals": "option2"}, {"when": "field-1764647772042", "equals": "option1"}]}, {"id": "field-1764647953803", "kind": "radio", "label": "Did you turn off “Keep activity”?", "options": [{"label": "Yes, I just turned it off", "value": "option1"}, {"label": "No", "value": "option2"}, {"label": "I did this in the past", "value": "option3"}], "required": true, "visibleIf": [{"when": "field-1764647853497", "equals": "option2"}, {"when": "field-1764647772042", "equals": "option1"}]}, {"id": "field-1766165005502", "kind": "textarea", "rows": 2, "label": "Why did you not turn off \"Keep Activity\" even though you don''t want Google to train AI models on your conversations?", "required": true, "visibleIf": [{"when": "field-1764647772042", "equals": "option1"}, {"when": "field-1764647853497", "equals": "option2"}, {"when": "field-1764647953803", "equals": "option2"}]}]}, {"id": "page-4", "title": "X/Twitter", "fields": [{"id": "block-1764648007710", "kind": "header", "text": "X/Twitter", "level": 2}, {"id": "block-1764648022496", "kind": "text", "text": "By default, X/Twitter has permission to [use your conversations](https://help.x.com/en/using-x/about-grok) with its AI product, Grok, along with your tweets, likes, comments, and profile information to train future AI models.", "markdown": true}, {"id": "field-1764648046304", "kind": "radio", "label": "Do you use X/Twitter?", "options": [{"label": "Yes (will reveal a follow-up question)", "value": "option1"}, {"label": "No", "value": "option2"}], "required": true}, {"id": "field-1764648072974", "kind": "radio", "label": "Do you want X/Twitter to train AI models on your information?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No (will reveal a follow-up question)", "value": "option2"}], "required": true, "visibleIf": [{"when": "field-1764648046304", "equals": "option1"}]}, {"id": "block-1766171847034", "kind": "text", "text": "Because you said \"Yes\" to the above question, we will not reveal follow-up steps that explain how to opt out.", "markdown": false, "visibleIf": [{"when": "field-1764648046304", "equals": "option1"}, {"when": "field-1764648072974", "equals": "option1"}]}, {"id": "block-1764648109669", "kind": "text", "text": "**You can opt out by following these steps:**\n\n1. Sign into your X/Twitter account\n2. Go to [https://x.com/settings/grok_settings](https://x.com/settings/grok_settings)\n3. Uncheck “Allow your public data as well as your interactions, inputs, and results with Grok and xAI to be used for training and fine-tuning”", "markdown": true, "visibleIf": [{"when": "field-1764648072974", "equals": "option2"}, {"when": "field-1764648046304", "equals": "option1"}]}, {"id": "field-1764648160491", "kind": "radio", "label": "Did you uncheck the setting?", "options": [{"label": "Yes, I just turned it off", "value": "option1"}, {"label": "No", "value": "option2"}, {"label": "I did this in the past", "value": "option3"}], "required": true, "visibleIf": [{"when": "field-1764648072974", "equals": "option2"}, {"when": "field-1764648046304", "equals": "option1"}]}, {"id": "field-1766165083095", "kind": "textarea", "rows": 2, "label": "Why did you not uncheck the setting even though you don''t want X/Twitter to train AI models on your conversations?", "required": true, "visibleIf": [{"when": "field-1764648046304", "equals": "option1"}, {"when": "field-1764648072974", "equals": "option2"}, {"when": "field-1764648160491", "equals": "option2"}]}]}, {"id": "page-5", "title": "Meta", "fields": [{"id": "block-1764648199373", "kind": "header", "text": "Meta", "level": 2}, {"id": "block-1764648204663", "kind": "text", "text": "By default, Meta has permission to [use your conversations](https://www.facebook.com/privacy/genai/) with its AI product, Meta AI, along with your public posts, likes, comments, and photos to train future AI models. ", "markdown": true}, {"id": "field-1764648235188", "kind": "radio", "label": "Do you use any Meta products (Facebook, Instagram, Whatsapp)?", "options": [{"label": "Yes (will reveal a follow-up question)", "value": "option1"}, {"label": "No", "value": "option2"}], "required": true}, {"id": "field-1764648255183", "kind": "radio", "label": "Do you want Meta to train AI models on your information?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No (will reveal a follow-up question)", "value": "option2"}], "required": true, "visibleIf": [{"when": "field-1764648235188", "equals": "option1"}]}, {"id": "block-1764648283704", "kind": "text", "text": "Meta does not provide an option to prevent your data from being used to train future AI models.", "markdown": false, "visibleIf": [{"when": "field-1764648255183", "equals": "option2"}, {"when": "field-1764648235188", "equals": "option1"}]}, {"id": "field-1764648324095", "kind": "radio", "label": "Would you have opted out given the opportunity to do so?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No", "value": "option2"}], "required": true, "visibleIf": [{"when": "field-1764648255183", "equals": "option2"}, {"when": "field-1764648235188", "equals": "option1"}]}]}, {"id": "page-6", "title": "Conclusion", "fields": [{"id": "block-1764648358364", "kind": "header", "text": "Conclusion", "level": 2}, {"id": "field-1765413073951", "kind": "textarea", "rows": 3, "label": "Did you opt out of having your data used for any of the services? Why or why not?", "required": false}, {"id": "field-1765411272771", "kind": "textarea", "rows": 1, "label": "How did you hear about this survey?", "required": false}, {"id": "field-1765412890582", "kind": "textarea", "rows": 2, "label": "Anything else you want to add?", "required": false}, {"id": "block-1765412484502", "kind": "header", "text": "Follow-up", "level": 2}, {"id": "field-1765412692285", "kind": "email", "label": "Leave your email if you would like to receive updates about the follow-up campaign (we won''t send you more than 3 emails).", "required": false}, {"id": "block-1765411661652", "kind": "text", "text": "This experiment is run by the Alliance, an online community that takes weekly action on issues such as environmental destruction, poverty, and unsafe technological development. Previously, members of the Alliance filled out this exact survey as their weekly action.\n\nYou can learn more about the Alliance by reading our [guide](https://worldalliance.org/guide/) and our [FAQ](https://worldalliance.org/faq/).", "markdown": true}, {"id": "field-1765411401186", "kind": "radio", "label": "Are you interested in joining the Alliance? Membership is currently invite-only and a 15 minute/week commitment.", "options": [{"label": "Yes", "value": "yes"}, {"label": "No", "value": "no"}], "required": false}, {"id": "field-1765411624819", "kind": "textarea", "rows": 2, "label": "Please share a bit about yourself and why you''re interested.", "required": true, "visibleIf": [{"when": "field-1765411401186", "equals": "yes"}]}, {"id": "field-1765412830668", "kind": "email", "label": "Please leave your email so we can be in touch. ", "required": true, "visibleIf": [{"when": "field-1765411401186", "equals": "yes"}, {"when": "field-1765412692285", "hasValue": false}]}]}], "title": "Public AI data privacy survey", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2025-12-10 13:50:18.128116-08', '2025-12-22 09:23:46.62263-08');
INSERT INTO public.form VALUES (53, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1767741144114", "kind": "text", "text": "Prospective members and supporters (such as experts and non-profits with whom we may collaborate for future actions) who visit the Alliance website commonly ask the office about current members. Therefore, we plan to add a public member directory to our [People page](https://worldalliance.org/people).", "markdown": true}, {"id": "block-1767741231042", "alt": "Image", "src": "https://dj92mxbdjuclo.cloudfront.net/1767741264579.webp", "kind": "image", "caption": "A few members gathered in San Francisco, California to take a photo for our website."}, {"id": "block-1767741299625", "kind": "text", "text": "Decide whether you want your own **name, profile photo, and bio** to appear in the Alliance''s public member directory. We encourage you to say \"Yes\" because it will help the Alliance improve its transparency.", "markdown": true}, {"id": "field-1767742035206", "kind": "custom", "label": "Custom Component", "required": false, "componentId": "share-info-publicly-toggle", "autoExtractUserData": {"target": "shareInfoPublicly"}}, {"id": "block-1767742069502", "kind": "text", "text": "In the future, you can change this setting on your [Settings page](https://worldalliance.org/settings).", "markdown": true}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-06 15:13:35.657311-08', '2026-01-07 08:39:43.966859-08');
INSERT INTO public.form VALUES (66, 'Read about Alliance growth plans form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1770246027255", "kind": "text", "text": "In this action, members will read about the office’s plans for growth.\n\nMembership is invite-only as we prepare for a public launch. Until then, our **plan is to grow cautiously in stages: invite new members, then refine the Alliance’s processes before growing again.**\n\nWe have largely [learned the lessons](https://worldalliance.org/progress/early-action-learnings) we wanted to learn from our current membership size, including:\n- How current members and groups tend to complete tasks and build habits.\n- How to design simple, small-scale actions.\n- How our online platform can be improved, such as by making action updates more accessible.\n\nNow, our goal is to **grow to at least 110 members** from our current [79 members](https://worldalliance.org/members) (a ~40% increase in size). At this size, we hope to:\n- Test new community structures and invite processes, such as a way for group leads to share knowledge with one other.\n- Test more complex actions, such as those that involve more external collaboration.\n- Be in a better position to build external support, such as from experts and partners.\n\nOur pre-launch growth plans require:\n\n1. **Groups**, so that members can support and hold each other accountable.\n2. **Member invitations**, so that we can grow carefully and sustainably."}, {"id": "block-1770246076125", "kind": "header", "text": "Read about groups", "level": 3}, {"id": "block-1770246081979", "kind": "text", "text": "To build trust and reliability, the Alliance is organized into accountability groups. Each group has a lead who ensures their members complete tasks on time. Members are accountable to their group lead.\n\nMost members are already in a group. You can see your group on the [Groups](https://worldalliance.org/groups) page.\n\nWe’ve found that new members have a smoother experience, and are more likely to complete tasks reliably, when they are held accountable by another member. Therefore, we aim to place new members into a group as soon as they join."}, {"id": "field-1770246088588", "kind": "checkbox", "label": "**Step 1**: Read our guide to accountability groups: [https://worldalliance.org/groups-guide](https://worldalliance.org/groups-guide)", "required": true, "defaultValue": null}, {"id": "block-1770246091110", "kind": "header", "text": "Read about invites", "level": 3}, {"id": "block-1770246096104", "kind": "text", "text": "So far, the office has asked specific people to become group leads, and group leads have invited members on an ad hoc basis.\n\n**Now, anyone can become a group lead, and anyone can invite new members.**\n\nWe hope that this change means that:\n\n1. We will start to see a slow trickle of new members.\n2. When we want to, we will be able to grow the Alliance in large increments by launching actions that ask members to invite others."}, {"id": "field-1770246097583", "kind": "checkbox", "label": "**Step 2**: Explore the new [invites page](https://worldalliance.org/invites) located in the sidebar.", "required": true}, {"id": "field-1770246189764", "kind": "textarea", "rows": 2, "label": "Do you have any questions or comments about growth plans, groups, or invites?", "required": false}]}], "title": "Read about Alliance growth plans form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-02-04 15:03:50.106256-08', '2026-02-05 19:29:27.061365-08');
INSERT INTO public.form VALUES (47, '', '{"pages": [{"id": "page-1", "title": "Task", "fields": [{"id": "block-1765235388887", "kind": "text", "text": "Public comments, often submitted via email or online forms, allow citizens to provide direct input to governments. These comments are often integrated into public meeting agendas (such as city council meetings or zoning board meetings) to help governments understand public sentiment.\n\nThe office has planned a series of actions to help each member produce a high-quality public comment that could influence local policy and to help members connect local issues to the Alliance’s priorities:\n\n* **This week, members will identify and research issues of concern in their municipality.**\n* Then, the office will develop recommendations for each member''s comment — for instance, by identifying policies that address their issue of concern.\n* Then, members will use the office''s personalized recommendations to write and submit public comments and discuss their chosen issues with other members. (Upcoming action [here](https://worldalliance.org/actions/54).)\n* Finally, the office will analyze meeting minutes for members’ municipalities to determine whether members’ comments were included in meeting agendas.\n\n**Note:** The Alliance will be on holiday break, and no new tasks will be assigned, from December 22-28.\n\nExamples of issues of concern in local news:\n\n1. [Groups push back on Montana’s ‘data center boom’ in petition before utility commission](https://montanafreepress.org/2025/11/18/groups-push-back-on-montanas-data-center-boom/)\n2. [By the shrinking Colorado, AZ Dems and environmentalists rally for climate action](https://www.azcentral.com/story/news/local/arizona-environment/2025/10/28/adelita-grijalva-sierra-club-urge-environmental-protections-colorado-river-water/86937006007/)\n3. [Nashville’s ‘participatory budgeting’ experiment is over. How will residents get a say in city spending?](https://wpln.org/post/nashvilles-participatory-budgeting-experiment-is-over-how-will-residents-get-a-say-in-city-spending/)", "markdown": true}, {"id": "block-1765241917018", "kind": "text", "text": "**Step 1:** Spend 10 minutes identifying and researching a current issue in your municipality that is connected to one of our priorities: extreme poverty, environmental destruction, the decline of democratic institutions, and dangerous technological development.\n\nTo identify a specific issue, you could:\n1. Look up your city + one of our priorities (or a related smaller-scale issue). For example: \"poverty in Austin,\" \"polluted estuary in Oakland,\" \"facial recognition in London.\"\n2. Browse your preferred local news source. If you do not have one, we have created a non-comprehensive spreadsheet with sources for members'' municipalities [here](https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vSPyPPUXTOTgL6XE3qQXW_KvbSFoHl8nGwF7dH7IJ1Hsz8wgS9zYwTfPjuxVOKmtGUYNKcrfSwowCqr/pubhtml?gid=0&single=true).\n\n", "markdown": true}, {"id": "field-1765248993025", "kind": "textarea", "rows": 1, "label": "**Step 2:** What city do you live in?", "required": true}, {"id": "field-1765236018251", "kind": "textarea", "rows": 4, "label": "**Step 3:** Provide a short summary (2-3 sentences) of your chosen issue. Please explain how it is connected to one of the Alliance’s priorities.", "output": {"output": true}, "required": true}, {"id": "field-1765236037598", "kind": "textarea", "rows": 1, "label": "**Step 4:** Provide a link to a news article or other information source that discusses the issue. This reference will help the office conduct follow-up research on your behalf.", "output": {"output": true}, "required": true}]}], "title": "", "submit": {"label": "Complete"}, "description": "", "outputViews": [{"id": "output-view-1765408702691-la", "type": "default", "title": "View 1", "blocks": [{"id": "output-field-1765408789386-4ggz", "format": "field", "fieldId": "field-1765236018251", "showLabel": true, "labelOverride": "Issue of concern:"}, {"id": "output-field-1765408820887-r81p", "format": "field", "fieldId": "field-1765236037598", "showLabel": true, "labelOverride": "Information source:"}], "description": ""}]}', '2025-12-08 15:10:25.953578-08', '2025-12-10 15:27:33.948084-08');
INSERT INTO public.form VALUES (63, 'Collect unclaimed property for a potential future donation form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1769022606338", "kind": "text", "text": "In this action, members will collect money owed to them in the form of “unclaimed property.” In a follow-up action, members will have the option to donate some of the money they received.\n\nUnclaimed property is money that is owed but could not be delivered to a person—perhaps because the person moved, or because a company lost their contact information. When this happens, the money is transferred to the government, which holds it until the owner claims it.\n\nRecent estimates found [1 in 7 Americans have unclaimed property](https://unclaimed.org/what-is-unclaimed-property/). To verify this, we searched the relevant state websites for the five members of our office along with each of our parents. On average, our families had $129 in unclaimed property.\n\nBecause this action will help members recover money that may have otherwise gone unclaimed, we suggest that members donate 50% of the money they find.\n\n**Our collective goal is to donate at least $1,000 to GiveDirectly, which is about $14 per member.** A large body of research supports GiveDirectly''s effectiveness, and we hope the Alliance can continue to build a relationship with them. (We previously [donated $400](https://worldalliance.org/actions/49) to GiveDirectly and [shared website feedback](https://worldalliance.org/actions/32) with them.)\n\nThe next page will show you how to check if you have unclaimed property.", "markdown": true}]}, {"id": "page-2", "title": "Page 2", "fields": [{"id": "block-1768541564247", "kind": "text", "text": "**Step 1**: To check if you have unclaimed properties, search “<your state/country> unclaimed properties” on Google. For example, you might search “California unclaimed property” or “France unclaimed property.”\n\nLook for your official government website in the search results.", "markdown": true}, {"id": "block-1768541575329", "kind": "text", "text": "We were able to find unclaimed property websites for France and Australia. We were not able to find unclaimed property websites for Slovenia, Taiwan, Switzerland, and Austria.", "markdown": false, "visibleIf": [{"validatorId": 23, "resultEquals": true}]}, {"id": "block-1768541616279", "alt": "Image", "src": "https://dj92mxbdjuclo.cloudfront.net/1768541659574.webp", "kind": "image", "caption": "Image from the California unclaimed property website."}, {"id": "field-1768541700113", "kind": "radio", "label": "Do you have any unclaimed property?\n\nAdditional note: if you have lived in multiple places, you could check multiple government websites.", "options": [{"label": "Yes (will reveal follow-up question)", "value": "option1"}, {"label": "No", "value": "option2"}, {"label": "I ran into problems checking", "value": "option3"}], "required": true, "defaultValue": null}, {"id": "field-1768541961044", "kind": "textarea", "rows": 1, "label": "What problem(s) did you run into?", "required": false, "visibleIf": [{"when": "field-1768541700113", "equals": "option3"}]}, {"id": "field-1768542048893", "kind": "textarea", "rows": 1, "label": "How much money did you find?", "required": false, "visibleIf": [{"when": "field-1768541700113", "equals": "option1"}]}, {"id": "field-1768542078826", "kind": "radio", "label": "Did you claim your unclaimed property?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No", "value": "option2"}], "required": false, "visibleIf": [{"when": "field-1768541700113", "equals": "option1"}]}, {"id": "field-1768542411891", "kind": "textarea", "rows": 1, "label": "Why did you choose to not claim your unclaimed property?", "required": false, "visibleIf": [{"when": "field-1768542078826", "equals": "option2"}]}, {"id": "block-1768542475190", "kind": "text", "text": "**Step 2 (Optional)**: We strongly recommend checking if your family members (e.g. parents, siblings, etc.) have unclaimed property; our parents had more than 100 times the unclaimed property we did.", "markdown": true}, {"id": "field-1768542566557", "kind": "radio", "label": "Did you check if any family members have unclaimed property?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No", "value": "option2"}], "required": false}, {"id": "field-1768542589074", "kind": "textarea", "rows": 1, "label": "How much total money did you find for your family members?", "required": false, "visibleIf": [{"when": "field-1768542566557", "equals": "option1"}]}, {"id": "field-1768542612057", "kind": "radio", "label": "Did you help your family members claim their unclaimed property?", "options": [{"label": "Yes", "value": "option1"}, {"label": "No", "value": "option2"}], "required": false, "visibleIf": [{"when": "field-1768542566557", "equals": "option1"}]}, {"id": "block-1768542630623", "kind": "text", "text": "**Step 3:** In a couple of weeks, we will run a follow-up action in which members may donate some of the property they claimed to GiveDirectly.", "markdown": true}, {"id": "field-1768542638474", "kind": "textarea", "rows": 1, "label": "During this follow-up action, how much do you expect to donate? Including any family members who received unclaimed property and may be willing to donate.", "required": true}]}], "title": "Collect unclaimed property for a potential future donation form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-15 21:45:10.474171-08', '2026-01-27 10:59:36.886186-08');
INSERT INTO public.form VALUES (58, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1768346176031", "kind": "text", "text": "The office recently wrote a public progress update that describes the key learnings from the actions the Alliance has run so far. This update includes information about members’ reliability, members’ experience, action production, and other topics.\n\nYou can read the progress update [here](https://worldalliance.org/progress/early-action-learnings).", "markdown": false}, {"id": "field-1768346289629", "kind": "checkbox", "label": "I read the progress update.", "required": false}, {"id": "field-1768346325497", "kind": "textarea", "rows": 3, "label": "[Optional] If you have any questions, leave them here and the office will do our best to get back to you.", "required": false}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-13 15:19:28.545-08', '2026-01-13 15:19:28.545-08');
INSERT INTO public.form VALUES (61, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1768346176031", "kind": "text", "text": "The office recently wrote a public progress update that describes the key learnings from the actions the Alliance has run so far. This update includes information about members’ reliability, members’ experience, action production, and other topics.\n\nYou can read the progress update [here](https://worldalliance.org/progress/early-action-learnings).", "markdown": true}, {"id": "field-1768346289629", "kind": "checkbox", "label": "I read the progress update.", "required": true}, {"id": "field-1768346325497", "kind": "textarea", "rows": 2, "label": "(Optional) If you have any questions, leave them here and the office will do our best to get back to you.", "required": false}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-13 15:19:28.545-08', '2026-01-13 16:48:58.627-08');
INSERT INTO public.form VALUES (62, 'Untitled Form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1768342624161", "kind": "text", "text": "The office has arranged for 4 experts to answer members’ questions about international cooperation:\n\n- [Fareed Yasseen](https://en.wikipedia.org/wiki/Fareed_Mustafa_Kamil_Yasseen), former Iraqi Ambassador to the United States; former Iraq Climate Envoy and adviser to the Prime Minister on climate change.\n- [Janos Pasztor](https://en.wikipedia.org/wiki/Janos_Pasztor_(diplomat)), former UN Assistant Secretary-General for Climate Change.\n- [Brice Lalonde](https://en.wikipedia.org/wiki/Brice_Lalonde), former French Minister of the Environment; Executive Coordinator of United Nations Conference on Sustainable Development.\n- [Laurence Pollier](https://fr.linkedin.com/in/laurence-pollier-cc2024), former UNFCCC Subsidiary Body for Implementation Coordinator.\n\nOn January 7th, 2026, the U.S. decided to [withdraw from 66 international institutions](https://www.whitehouse.gov/presidential-actions/2026/01/withdrawing-the-united-states-from-international-organizations-conventions-and-treaties-that-are-contrary-to-the-interests-of-the-united-states/). Among these institutions are:\n\n- **The United Nations Framework Convention on Climate Change (UNFCCC)**, which is the treaty under which international negotiations on climate change occur. The UNFCCC has near-universal membership: prior to the US withdrawal, 198 countries were party to the agreement. It is responsible for the annual Conference of the Parties (COP) meetings that host international climate negotiations, including those that led to the 1997 Kyoto Protocol and 2015 Paris Agreement.\n- **The Intergovernmental Panel on Climate Change (IPCC)**, which is the UN body in charge of producing scientific assessments and widely considered the leading scientific authority on climate change. IPCC reports are used by governments and by the UNFCCC for decision-making.\n\nThe U.S. has been a member of the IPCC since 1988 and ratified the UNFCCC in 1992. U.S. participation in these institutions is widely viewed as essential to the credibility, ambition, and implementation of global climate agreements.\n\nTo help members better understand the U.S. withdrawal, as well as the role of international cooperation in combating climate change and other issues, the above experts will aim to answer all questions that members ask in the next 7 days.\n\n**Forum post where the discussion will occur: [https://worldalliance.org/forum/post/15](https://worldalliance.org/forum/post/15)**\n\nAsk any questions on the forum post. Topics that may be of interest:\n\n- Consequences of the U.S. withdrawal (e.g. on agenda-setting, funding, scientific expertise, specific countries’ attitudes towards cooperation, global balance of power, biosphere)\n- Contextualization of U.S. withdrawal (e.g. how it relates to the U.S.’s previous withdrawal from the Paris Agreement)\n- What can be done next, and by whom\n- Successes and limitations of international cooperation on climate change and other issues\n- The experts’ general beliefs and experiences", "markdown": true}, {"id": "field-1768342749524", "kind": "checkbox", "label": "I have posted any questions I want to ask on the forum.", "required": true}]}], "title": "Untitled Form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-13 14:17:09.908-08', '2026-01-13 14:28:13.962-08');
INSERT INTO public.form VALUES (22, 'Inequality reading', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1760464020063", "kind": "text", "text": "One of our stated goals is to create a world where everyone has the resources and freedom to achieve happiness and fulfillment. Achieving this goal will likely involve bolstering foreign aid.\n\nBefore we take related actions, we will establish a shared understanding of the magnitude of global income inequality. This foundation is especially important because people (typically in America) who are surveyed about global income inequality dramatically underestimate its scale.\n\nOur World in Data is a non-profit whose mission is to publish the ”research and data to make progress against the world’s largest problems.” They write articles to make raw data from sources like the World Bank accessible and understandable.", "markdown": false}, {"id": "field-1760466875904", "kind": "checkbox", "label": "**Step 1**: Read this article from Our World in Data: [Global inequality is huge](https://ourworldindata.org/global-inequality-opportunity-to-give).", "required": true}, {"id": "field-1760468927498", "kind": "checkbox", "label": "**Step 2**: Leave 1 response on [this associated forum discussion](https://worldalliance.org/forum/post/9).", "required": true, "customValidatorId": 28}]}], "title": "Inequality reading", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2025-10-14 10:48:46.347679-07', '2026-01-28 17:20:21.237397-08');
INSERT INTO public.form VALUES (6, 'Contract form', '{"slug": "untitled-form", "pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1757282221917", "kind": "text", "text": "Welcome to the Alliance. We’re a group of people coordinating to address global crises: extreme poverty, environmental destruction, the breakdown of democratic institutions, and dangerous technological development.\n\n**Membership in the Alliance means:**\n1. You will receive tasks on this page. They will require no more than 15 minutes per week.\n2. You are expected to complete every task you receive by its deadline.\n\nOur vision is that these tasks will someday enable millions of people worldwide to carry out expert-developed plans. Right now, we are running small experiments to prepare for future growth.\n\nWe take member reliability seriously because it is what allows us to make effective plans. Therefore, the first task that all members complete is to review and sign a contract that describes our exact expectations.", "markdown": true}, {"id": "field-1757281780973", "kind": "checkbox", "label": "**Step 1**: Go to your contract page at [this link](/contract).", "required": true}, {"id": "field-1757281816692", "kind": "checkbox", "label": "**Step 2**: Sign the contract.", "required": true, "customValidatorId": 1}]}], "title": "Contract form", "submit": {"label": "Complete"}, "version": 1, "description": "", "outputViews": []}', '2025-09-07 14:50:29.096611-07', '2026-02-03 12:36:00.262144-08');
INSERT INTO public.form VALUES (64, 'Contribute to a discussion about Alliance culture form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1769636891588", "kind": "text", "text": "“Culture” refers to the shared values, norms, and behaviors that shape how a community interacts and evolves. For instance, our culture affects how members discuss topics with one another, as well as how thoughtfully members complete Alliance tasks.\n\nOur long-term culture will depend on the culture we establish while the Alliance is small. Future members will likely look at previous actions, discussions, and activities to understand how they are expected to behave.\n\nThe Alliance’s culture is important because it will determine (for example):\n\n- The long-term diversity of our membership.\n- To what degree we are focused on our priorities or distracted by minor disagreements.\n- How much we can rely on each other, and therefore how much we can accomplish.\n\nUltimately, the culture of the Alliance is up to members to create and uphold.\n\nWe are hosting an explicit, Alliance-wide discussion to help us develop our culture intentionally and collectively, rather than randomly and in isolation. We will use this discussion to write more extensively about our desired culture elsewhere, such as in our [guide](https://worldalliance.org/guide).", "markdown": true}, {"id": "block-1769650953894", "url": "https://worldalliance.org/forum/post/16", "kind": "biglink", "text": "Please read and respond to this forum post."}, {"id": "field-1769636910271", "kind": "checkbox", "label": "I have contributed to the discussion.", "required": true}]}], "title": "Contribute to a discussion about Alliance culture form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-28 13:48:18.664948-08', '2026-01-28 18:53:10.824069-08');
INSERT INTO public.form VALUES (65, 'Explore the platform form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "field-1769641789516", "kind": "multiselect", "label": "These are some pages that are helpful to know about:", "options": [{"label": "Click **Information** in the menu to see Alliance resources and action updates in one place.", "value": "option1"}, {"label": "Go through the member directory (accessible on the **Information** page) and send friend requests to people you know.", "value": "option2"}, {"label": "Click **Actions** in the menu to see past Alliance actions.", "value": "option3"}, {"label": "Click **Messages** in the menu. Feel free to send staff members any questions, comments, or concerns.", "value": "option4"}], "required": false}, {"id": "field-1769641739257", "kind": "multiselect", "label": "To develop a sense for the kinds of actions the Alliance takes, you can review a few previous actions that members reported enjoying:", "options": [{"label": "Review [Report a pothole in your community](https://worldalliance.org/actions/50).", "value": "option1"}, {"label": "Review [Decide how to allocate $1,000 next week](https://worldalliance.org/actions/47).", "value": "option2"}, {"label": "Review [Read and discuss an article about global inequality](https://worldalliance.org/actions/26). Feel free to contribute to the associated discussion.", "value": "option3"}], "required": false}]}], "title": "Explore the platform form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-01-28 14:47:55.01-08', '2026-02-03 12:52:10.775892-08');
INSERT INTO public.form VALUES (67, 'Consider inviting new members to the Alliance form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "block-1770246985092", "kind": "text", "text": "Our current goal is to **grow to at least 110 members** from our current [79 members](https://worldalliance.org/members) (a \\~40% increase in size). Learning, rather than growth, is our primary objective at this stage; however, incremental growth helps us learn new lessons.\n\nAt this size, we hope to:\n- Test new community structures and invite processes, such as a way for group leads to share knowledge with one other.\n- Test more complex actions, such as those that involve more external collaboration.\n- Be in a better position to build external support, such as that of experts and partners.\n\nThis action is the Alliance''s first “growth action.” **If each member can successfully invite at least 1 new person, then each growth action could more than double the size of the Alliance**. In theory, it would take ten growth actions to increase membership a thousand-fold.\n\n![Alliance growth diagram](https://dj92mxbdjuclo.cloudfront.net/1770255651460.webp)"}, {"id": "block-1770247694063", "kind": "text", "text": "**Inviting members is optional.** If you choose to invite new members, your invitations will:\n1. Help us reach our next stage of growth.  \n2. Help us assess whether we can effectively invite new members—and, therefore, whether the Alliance can grow when it needs to grow.\n3. Help us improve future growth actions. For example, we will develop an understanding of how to craft invitations and who to invite.\n\n**How to invite a new member**:\n1. Go to our new [Invites](http://www.worldalliance.org/invites) page.\n2. Decide whether or not you are willing to ensure the new member completes tasks for their first few weeks (by sending them reminders if needed). If you are, then click \"Myself\" in answer to the first question; if not, click \"Someone else.\"\n3. Go through the invite creation process.\n4. Click \"Share invite link\" in the invitation that appears below, and send it to the person you are inviting.\n\nIn early tests, about one-third of invites were accepted. Therefore, **we recommend inviting at least 3 people.**\n\nWhen sending invites, it is likely best to personalize your description of the Alliance, and why you think the invitee should join - some members have had more success with casual invitations, and others with formal and lengthy explanations. However, here is a sample invitation for reference:"}, {"id": "block-1770336091643", "kind": "quote", "text": "Hi [Name], would you be interested in joining a community I''m part of called the Alliance? It''s a group that takes regular action to improve the world. I think it could be fun to complete the 15-minute weekly tasks together. For example, we''ve dropped off e-waste, voted on ways to donate a pool of $1K, and recently did a Q&A with ex-UN diplomats.\n\nHere''s an invite link: [your link]"}, {"id": "block-1770247316647", "kind": "text", "text": "**For members who recently joined the Alliance:** it may make sense to wait to invite new members. However, you are more than welcome to send invitations if you would like; you might enjoy completing Alliance tasks alongside family and friends.", "visibleIf": [{"validatorId": 31, "resultEquals": false}]}, {"id": "field-1770338026569", "kind": "number", "label": "How many people did you invite?", "required": false}, {"id": "field-1770247789030", "kind": "textarea", "rows": 1, "label": "Do you have any comments or questions?", "required": false}]}], "title": "Consider inviting new members to the Alliance form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-02-04 15:18:41.424409-08', '2026-02-05 20:52:46.584282-08');
INSERT INTO public.form VALUES (68, 'Test current action form', '{"pages": [{"id": "page-1", "title": "Page 1", "fields": [{"id": "field-1770748795855", "kind": "textarea", "rows": 3, "label": "Please fill this in", "required": false}, {"id": "field-1770748801349", "kind": "checkbox", "label": "Please check this box", "required": true}]}], "title": "Test current action form", "submit": {"label": "Complete"}, "description": "", "outputViews": []}', '2026-02-10 10:40:09.939863-08', '2026-02-10 10:40:09.939863-08');


--
-- Data for Name: form_response; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: forum_digest_log; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.forum_digest_log VALUES (2, '2026-01-05', 'daily', 1, '{1126}', '[{"url": "https://worldalliance.org/actions/54/activity/982?replyId=157&cid=6a4ce95f1d", "message": "New reply from James Bowden", "createdAt": "Jan 4, 11:51 PM"}]', '2026-01-05 05:00:01.428178', 7);
INSERT INTO public.forum_digest_log VALUES (3, '2026-01-14', 'daily', 5, '{1439,1440,1442,1443,1445}', '[{"url": "https://worldalliance.org/forum/post/15?replyId=175&cid=ed9aea0d7f", "message": "New reply from Grant Hough", "createdAt": "Jan 14, 3:32 AM"}, {"url": "https://worldalliance.org/forum/post/15?replyId=176&cid=ed9aea0d7f", "message": "New reply from Patrick T.", "createdAt": "Jan 14, 3:33 AM"}, {"url": "https://worldalliance.org/forum/post/15?replyId=177&cid=ed9aea0d7f", "message": "New reply from Grant Hough", "createdAt": "Jan 14, 3:40 AM"}, {"url": "https://worldalliance.org/forum/post/15?replyId=178&cid=ed9aea0d7f", "message": "New reply from Justin Peck", "createdAt": "Jan 14, 3:41 AM"}, {"url": "https://worldalliance.org/forum/post/15?replyId=179&cid=ed9aea0d7f", "message": "New reply from Grant Hough", "createdAt": "Jan 14, 3:41 AM"}]', '2026-01-14 05:00:00.791014', 7);
INSERT INTO public.forum_digest_log VALUES (4, '2026-01-19', 'daily', 1, '{1792}', '[{"url": "https://worldalliance.org/forum/post/15?replyId=240&cid=be29b0bbb7", "message": "New reply from Selina Kim", "createdAt": "Jan 19, 3:05 AM"}]', '2026-01-19 05:00:01.236104', 7);
INSERT INTO public.forum_digest_log VALUES (5, '2026-01-29', 'daily', 1, '{2160}', '[{"url": "https://worldalliance.org/forum/post/16?replyId=257&cid=2ac3727461", "message": "New reply from Alex Hockett", "createdAt": "Jan 29, 3:48 AM"}]', '2026-01-29 05:00:01.015423', 7);
INSERT INTO public.forum_digest_log VALUES (6, '2026-02-03', 'daily', 1, '{2424}', '[{"url": "https://worldalliance.org/forum/post/16?replyId=289&cid=b2b1bec953", "message": "New reply from Justin Peck", "createdAt": "Feb 3, 4:49 AM"}]', '2026-02-03 05:00:01.683784', 7);
INSERT INTO public.forum_digest_log VALUES (7, '2026-02-04', 'daily', 1, '{2459}', '[{"url": "https://worldalliance.org/forum/post/16?replyId=297&cid=b2f789d8ed", "message": "New reply from Bob Grand", "createdAt": "Feb 4, 4:49 AM"}]', '2026-02-04 05:00:01.348023', 7);
INSERT INTO public.forum_digest_log VALUES (8, '2026-02-07', 'daily', 2, '{2896,2898}', '[{"url": "https://worldalliance.org/forum/post/16?replyId=356&cid=f50482b62b", "message": "New reply from Bowen Jiang", "createdAt": "Feb 7, 2:33 AM"}, {"url": "https://worldalliance.org/forum/post/16?replyId=357&cid=f50482b62b", "message": "New reply from Bowen Jiang", "createdAt": "Feb 7, 2:51 AM"}]', '2026-02-07 05:00:01.050775', 7);


--
-- Data for Name: friend; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.friend VALUES (7, 'accepted', '2025-07-18 15:05:36.369376-07', '2025-07-20 18:09:53.882', '2025-07-20 11:09:53.884968-07', 10, 7, 10, 12);
INSERT INTO public.friend VALUES (8, 'accepted', '2025-08-24 17:27:12.115329-07', NULL, '2025-08-24 17:27:12.115329-07', 7, 11, NULL, NULL);
INSERT INTO public.friend VALUES (17, 'accepted', '2025-08-29 11:05:45.691451-07', NULL, '2025-08-29 11:05:45.691451-07', 7, 15, NULL, NULL);
INSERT INTO public.friend VALUES (18, 'accepted', '2025-08-29 16:21:48.914147-07', '2025-08-29 23:43:48.563', '2025-08-29 16:43:48.568651-07', 15, 10, 62, 63);
INSERT INTO public.friend VALUES (9, 'accepted', '2025-08-25 09:01:32.058269-07', '2025-09-17 03:16:17.87', '2025-09-16 20:16:17.875684-07', 10, 11, 49, 83);
INSERT INTO public.friend VALUES (34, 'accepted', '2025-09-17 15:10:03.610807-07', NULL, '2025-09-17 15:10:03.610807-07', 7, 23, NULL, NULL);
INSERT INTO public.friend VALUES (35, 'accepted', '2025-09-17 15:27:59.784012-07', NULL, '2025-09-17 15:27:59.784012-07', 7, 24, NULL, NULL);
INSERT INTO public.friend VALUES (37, 'accepted', '2025-09-17 15:32:25.204698-07', '2025-09-17 22:52:28.752', '2025-09-17 15:52:28.753824-07', 24, 10, 88, 90);
INSERT INTO public.friend VALUES (36, 'accepted', '2025-09-17 15:32:15.099376-07', '2025-09-17 23:05:44.192', '2025-09-17 16:05:44.194012-07', 24, 15, 87, 91);
INSERT INTO public.friend VALUES (40, 'accepted', '2025-09-17 16:12:43.803654-07', '2025-09-17 23:15:10.514', '2025-09-17 16:15:10.523458-07', 23, 10, 92, 93);
INSERT INTO public.friend VALUES (32, 'accepted', '2025-09-16 20:49:05.157474-07', '2025-09-17 23:47:21.644', '2025-09-17 16:47:21.647846-07', 15, 11, 86, 97);


--
-- Data for Name: group; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."group" VALUES (1, 'Staff', 'alliance strategic office staff', NULL, '2025-09-24 21:53:01.935484-07', '2025-09-24 21:53:01.935484-07');
INSERT INTO public."group" VALUES (2, 'Action testing', 'testing', NULL, '2025-10-07 18:05:46.020321-07', '2025-10-08 19:23:38.576063-07');
INSERT INTO public."group" VALUES (3, 'All Members', 'every alliance member', NULL, '2025-10-21 10:24:14.290786-07', '2025-10-21 10:24:14.290786-07');
INSERT INTO public."group" VALUES (4, 'Mark', 'just Mark', NULL, '2025-10-25 13:49:57.469335-07', '2025-10-25 13:49:57.469335-07');


--
-- Data for Name: group_participating_in_action; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: group_users_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.group_users_user VALUES (1, 7);
INSERT INTO public.group_users_user VALUES (1, 10);
INSERT INTO public.group_users_user VALUES (1, 15);
INSERT INTO public.group_users_user VALUES (2, 10);
INSERT INTO public.group_users_user VALUES (2, 7);
INSERT INTO public.group_users_user VALUES (2, 15);
INSERT INTO public.group_users_user VALUES (1, 24);
INSERT INTO public.group_users_user VALUES (3, 7);
INSERT INTO public.group_users_user VALUES (3, 10);
INSERT INTO public.group_users_user VALUES (3, 15);
INSERT INTO public.group_users_user VALUES (3, 23);
INSERT INTO public.group_users_user VALUES (3, 11);
INSERT INTO public.group_users_user VALUES (3, 24);
INSERT INTO public.group_users_user VALUES (4, 10);


--
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: mail; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: message; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.migrations VALUES (1, 1750267410680, 'Baseline1750267410680');
INSERT INTO public.migrations VALUES (2, 1750389047258, 'Addreferralcode1750389047258');
INSERT INTO public.migrations VALUES (3, 1750568457263, 'ActionActivities1750568457263');
INSERT INTO public.migrations VALUES (4, 1750569227837, 'ActionactivityDeleteCascade1750569227837');
INSERT INTO public.migrations VALUES (5, 1750713125479, 'AddStripeCustomerId1750713125479');
INSERT INTO public.migrations VALUES (6, 1750802129511, 'PartialProfiles1750802129511');
INSERT INTO public.migrations VALUES (7, 1751312972243, 'MoreActionStates1751312972243');
INSERT INTO public.migrations VALUES (8, 1751322398201, 'ActionThresholds1751322398201');
INSERT INTO public.migrations VALUES (9, 1751325266207, 'ActionActivityTypeEnum1751325266207');
INSERT INTO public.migrations VALUES (10, 1751487010451, 'NewThresholdfields1751487010451');
INSERT INTO public.migrations VALUES (11, 1751490471504, 'RemoveOldLaunchTimeFields1751490471504');
INSERT INTO public.migrations VALUES (12, 1751578845535, 'RenameUpdateDate1751578845535');
INSERT INTO public.migrations VALUES (13, 1751592853058, 'ActionBodyColumns1751592853058');
INSERT INTO public.migrations VALUES (14, 1751652582979, 'AnonAccount1751652582979');
INSERT INTO public.migrations VALUES (15, 1751678120378, 'Actionstatusenum1751678120378');
INSERT INTO public.migrations VALUES (16, 1752032309122, 'S3imagekeys1752032309122');
INSERT INTO public.migrations VALUES (17, 1752349106197, 'NestedReplies1752349106197');
INSERT INTO public.migrations VALUES (18, 1753125000000, 'ClearableNotifsFix1753125000000');
INSERT INTO public.migrations VALUES (19, 1753142216990, 'DeletedReplyBool1753142216990');
INSERT INTO public.migrations VALUES (20, 1754617930775, 'Deletedpostflag1754617930775');
INSERT INTO public.migrations VALUES (21, 1754679631095, 'Recentsearches1754679631095');
INSERT INTO public.migrations VALUES (22, 1754963631142, 'Actionactivitycomments1754963631142');
INSERT INTO public.migrations VALUES (23, 1754967403380, 'Likesjointables1754967403380');
INSERT INTO public.migrations VALUES (24, 1755028684560, 'Commentrefactor1755028684560');
INSERT INTO public.migrations VALUES (25, 1755735754417, 'Pinnedpost1755735754417');
INSERT INTO public.migrations VALUES (26, 1755801171209, 'Pinnedcomments1755801171209');
INSERT INTO public.migrations VALUES (27, 1755896055433, 'Forms1755896055433');
INSERT INTO public.migrations VALUES (28, 1755909439830, 'Changeactionformrelation1755909439830');
INSERT INTO public.migrations VALUES (29, 1756146150979, 'UserNotifs1756146150979');
INSERT INTO public.migrations VALUES (30, 1756152249064, 'Actioneventnotifs1756152249064');
INSERT INTO public.migrations VALUES (31, 1756154265356, 'Actioneventnotifssentat1756154265356');
INSERT INTO public.migrations VALUES (32, 1756156176735, 'Notifcascadedelete1756156176735');
INSERT INTO public.migrations VALUES (33, 1756156356781, 'Forumcascadedelete1756156356781');
INSERT INTO public.migrations VALUES (34, 1756156356782, 'Deletereply1756156356782');
INSERT INTO public.migrations VALUES (35, 1756250558456, 'NumericalTimeEstimate1756250558456');
INSERT INTO public.migrations VALUES (36, 1756249967023, 'NotifChanging1756249967023');
INSERT INTO public.migrations VALUES (37, 1756337175565, 'AddStaffCol1756337175565');
INSERT INTO public.migrations VALUES (38, 1756423286573, 'Commitmentless1756423286573');
INSERT INTO public.migrations VALUES (39, 1756503859413, 'ActionEventDeadline1756503859413');
INSERT INTO public.migrations VALUES (40, 1756513601882, 'Welcomeemail1756513601882');
INSERT INTO public.migrations VALUES (41, 1757000000000, 'Commentattachments1757000000000');
INSERT INTO public.migrations VALUES (42, 1756927890472, 'Test1756927890472');
INSERT INTO public.migrations VALUES (43, 1757120451633, 'ProfilesForNotifs1757120451633');
INSERT INTO public.migrations VALUES (44, 1757271542280, 'ContractDateSigned1757271542280');
INSERT INTO public.migrations VALUES (45, 1757386366115, 'DeclineActions1757386366115');
INSERT INTO public.migrations VALUES (46, 1757387410265, 'Declinemorality1757387410265');
INSERT INTO public.migrations VALUES (47, 1757441529611, 'Wontcomplete1757441529611');
INSERT INTO public.migrations VALUES (48, 1757536198643, 'OutOfTime1757536198643');
INSERT INTO public.migrations VALUES (49, 1757634802107, 'PostLikes1757634802107');
INSERT INTO public.migrations VALUES (50, 1757722056270, 'MmsMessages1757722056270');
INSERT INTO public.migrations VALUES (51, 1757722513771, 'Numericalerrormessage1757722513771');
INSERT INTO public.migrations VALUES (52, 1757802592977, 'Phonevalidation1757802592977');
INSERT INTO public.migrations VALUES (53, 1758047417381, 'Officeactionstate1758047417381');
INSERT INTO public.migrations VALUES (54, 1758048211310, 'Nodeadlines1758048211310');
INSERT INTO public.migrations VALUES (55, 1758061051025, 'ReminderNotifs1758061051025');
INSERT INTO public.migrations VALUES (56, 1758064159255, 'Moreemailtypes1758064159255');
INSERT INTO public.migrations VALUES (57, 1758065543356, 'Notiftype1758065543356');
INSERT INTO public.migrations VALUES (58, 1758250319005, 'FormresponseTimeInfo1758250319005');
INSERT INTO public.migrations VALUES (59, 1758296250267, 'Schemasnapshot1758296250267');
INSERT INTO public.migrations VALUES (60, 1758387184247, 'SuspendedDate1758387184247');
INSERT INTO public.migrations VALUES (61, 1758415133449, 'FixDrift1758415133449');
INSERT INTO public.migrations VALUES (62, 1758746251063, 'NotifCIDs1758746251063');
INSERT INTO public.migrations VALUES (63, 1758764478356, 'UserGroups1758764478356');
INSERT INTO public.migrations VALUES (64, 1758776943329, 'ForumDigestPreference1758776943329');
INSERT INTO public.migrations VALUES (65, 1758778210913, 'DigestLog1758778210913');
INSERT INTO public.migrations VALUES (66, 1758906659289, 'Showtononparticipatingflag1758906659289');
INSERT INTO public.migrations VALUES (67, 1759256395511, 'MissedDeadlineEmailTypes1759256395511');
INSERT INTO public.migrations VALUES (68, 1759264377444, 'EventNotifEnum1759264377444');
INSERT INTO public.migrations VALUES (69, 1759626300624, 'TaskFormResponseForActivity1759626300624');
INSERT INTO public.migrations VALUES (70, 1759781786127, 'Uniqueactivities1759781786127');
INSERT INTO public.migrations VALUES (71, 1759863532414, 'PostsVisibleAt1759863532414');
INSERT INTO public.migrations VALUES (72, 1759951196990, 'Textoptincheck1759951196990');
INSERT INTO public.migrations VALUES (73, 1759968744456, 'Formresponsedeletecascade1759968744456');
INSERT INTO public.migrations VALUES (74, 1760379812689, 'Deadlinenotifssentat1760379812689');
INSERT INTO public.migrations VALUES (75, 1760390419519, 'Everyonecompleteflag1760390419519');
INSERT INTO public.migrations VALUES (76, 1760477186244, 'Archiveactions1760477186244');
INSERT INTO public.migrations VALUES (77, 1760481651646, 'Customvalidatorenitity1760481651646');
INSERT INTO public.migrations VALUES (78, 1760558269321, 'Customreminders1760558269321');
INSERT INTO public.migrations VALUES (79, 1760562989548, 'Includelinkoption1760562989548');
INSERT INTO public.migrations VALUES (80, 1760639003060, 'Timestamptzcolumns1760639003060');
INSERT INTO public.migrations VALUES (81, 1760650031668, 'Nullablevisibleat1760650031668');
INSERT INTO public.migrations VALUES (82, 1760657438193, 'Searchothertype1760657438193');
INSERT INTO public.migrations VALUES (83, 1761012485054, 'Actionupdates1761012485054');
INSERT INTO public.migrations VALUES (84, 1761072119094, 'Gr1761072119094');
INSERT INTO public.migrations VALUES (85, 1761245834055, 'Customsubject1761245834055');
INSERT INTO public.migrations VALUES (86, 1761248186615, 'Unifyreminders1761248186615');
INSERT INTO public.migrations VALUES (87, 1761248186625, 'Nullableabsoluteremindertime1761248186625');
INSERT INTO public.migrations VALUES (88, 1761248186635, 'Noextralinkflag1761248186635');
INSERT INTO public.migrations VALUES (89, 1761353824723, 'Saveemailhtml1761353824723');
INSERT INTO public.migrations VALUES (90, 1761594699882, 'Remindergroups1761594699882');
INSERT INTO public.migrations VALUES (91, 1761605196689, 'Personalreminders1761605196689');
INSERT INTO public.migrations VALUES (92, 1761621312524, 'Storegroupcohort1761621312524');
INSERT INTO public.migrations VALUES (93, 1761622703035, 'Cascadedeletepersonalreminders1761622703035');
INSERT INTO public.migrations VALUES (94, 1761672164441, 'Associateactioneventgroups1761672164441');
INSERT INTO public.migrations VALUES (95, 1761674464146, 'Skippedflag1761674464146');
INSERT INTO public.migrations VALUES (96, 1761682862184, 'Groupcohort1761682862184');
INSERT INTO public.migrations VALUES (97, 1761700464697, 'Onetimeinvite1761700464697');
INSERT INTO public.migrations VALUES (98, 1761700577420, 'Onetimeinvitedate1761700577420');
INSERT INTO public.migrations VALUES (99, 1761847346939, 'Newremindergroups1761847346939');
INSERT INTO public.migrations VALUES (100, 1761861895829, 'SuiteCreateCols1761861895829');
INSERT INTO public.migrations VALUES (101, 1761867612621, 'Actionpriority1761867612621');
INSERT INTO public.migrations VALUES (102, 1761935029958, 'Suiteevents1761935029958');
INSERT INTO public.migrations VALUES (103, 1761937800398, 'Notifcreatedat1761937800398');
INSERT INTO public.migrations VALUES (104, 1761949383994, 'Nosendnotifsto1761949383994');
INSERT INTO public.migrations VALUES (105, 1762194912303, 'Cascaderemindergroups1762194912303');
INSERT INTO public.migrations VALUES (106, 1762195037248, 'Cascadeupdates1762195037248');
INSERT INTO public.migrations VALUES (107, 1762198697178, 'Cachedvisiblility1762198697178');
INSERT INTO public.migrations VALUES (108, 1762213867340, 'AddUserAwayRange1762213867340');
INSERT INTO public.migrations VALUES (109, 1762213867342, 'Awayranges1762213867342');
INSERT INTO public.migrations VALUES (110, 1762368533743, 'Usersjoinedcolumn1762368533743');
INSERT INTO public.migrations VALUES (111, 1762382136057, 'MoreUpdateData1762382136057');
INSERT INTO public.migrations VALUES (112, 1762383251845, 'UpdateDate1762383251845');
INSERT INTO public.migrations VALUES (113, 1762389130370, 'PreferredChannel1762389130370');
INSERT INTO public.migrations VALUES (114, 1762477997440, 'Communities1762477997440');
INSERT INTO public.migrations VALUES (115, 1762555212639, 'Relativeranges1762555212639');
INSERT INTO public.migrations VALUES (116, 1762556545562, 'Flipordercheck1762556545562');
INSERT INTO public.migrations VALUES (117, 1762905754982, 'PreventCompletionFlag1762905754982');
INSERT INTO public.migrations VALUES (118, 1762972600442, 'Notifgrouping1762972600442');
INSERT INTO public.migrations VALUES (119, 1762972682554, 'Notifcount1762972682554');
INSERT INTO public.migrations VALUES (120, 1762975989161, 'Associatedusers1762975989161');
INSERT INTO public.migrations VALUES (121, 1763061740798, 'FormDeviceType1763061740798');
INSERT INTO public.migrations VALUES (122, 1763066352415, 'CommunityInvites1763066352415');
INSERT INTO public.migrations VALUES (123, 1763075654871, 'CommunityInviteNotifTypes1763075654871');
INSERT INTO public.migrations VALUES (124, 1763079916146, 'Sharesettings1763079916146');
INSERT INTO public.migrations VALUES (125, 1763408742060, 'SuiteTaskCountFlag1763408742060');
INSERT INTO public.migrations VALUES (126, 1763421787617, 'CommentsInNotifEntity1763421787617');
INSERT INTO public.migrations VALUES (127, 1763424141091, 'Formuniqueness1763424141091');
INSERT INTO public.migrations VALUES (128, 1763514313090, 'FormPreference1763514313090');
INSERT INTO public.migrations VALUES (129, 1763515495174, 'Publicanswers1763515495174');
INSERT INTO public.migrations VALUES (130, 1763574654994, 'NoShowInTimeline1763574654994');
INSERT INTO public.migrations VALUES (131, 1763578621003, 'NotifSendTime1763578621003');
INSERT INTO public.migrations VALUES (132, 1763578790124, 'CreateActionEventIndices1763578790124');
INSERT INTO public.migrations VALUES (133, 1763592322863, 'BasicConvos1763592322863');
INSERT INTO public.migrations VALUES (134, 1763601339547, 'FleshedOutmessaging1763601339547');
INSERT INTO public.migrations VALUES (135, 1763664445743, 'MessagesCascade1763664445743');
INSERT INTO public.migrations VALUES (136, 1763755796310, 'Notiftargettext1763755796310');
INSERT INTO public.migrations VALUES (137, 1763756665128, 'ManualActionCohorts1763756665128');
INSERT INTO public.migrations VALUES (138, 1764196399181, 'ParticipantUniqueConstraint1764196399181');
INSERT INTO public.migrations VALUES (139, 1764625956605, 'Imageattachments1764625956605');
INSERT INTO public.migrations VALUES (140, 1764651269167, 'HidingChats1764651269167');
INSERT INTO public.migrations VALUES (141, 1764798958984, 'CreateAwayRangeReason1764798958984');
INSERT INTO public.migrations VALUES (142, 1764805647137, 'GroupsToTags1764805647137');
INSERT INTO public.migrations VALUES (143, 1764811125211, 'Communityvalidator1764811125211');
INSERT INTO public.migrations VALUES (144, 1764871376993, 'UniqueCommunityConvo1764871376993');
INSERT INTO public.migrations VALUES (145, 1764894662670, 'Dailystats1764894662670');
INSERT INTO public.migrations VALUES (146, 1764897656856, 'StoredLikes1764897656856');
INSERT INTO public.migrations VALUES (147, 1764970323201, 'BackfillLikes1764970323201');
INSERT INTO public.migrations VALUES (148, 1764971261360, 'ActivityIndex1764971261360');
INSERT INTO public.migrations VALUES (149, 1765216053240, 'ContractEvents1765216053240');
INSERT INTO public.migrations VALUES (150, 1765219590830, 'Contractcascading1765219590830');
INSERT INTO public.migrations VALUES (151, 1765219762281, 'ContracteventIndex1765219762281');
INSERT INTO public.migrations VALUES (152, 1765229288270, 'Plannedstate1765229288270');
INSERT INTO public.migrations VALUES (153, 1765304868453, 'AutosuspendKey1765304868453');
INSERT INTO public.migrations VALUES (154, 1765307309311, 'Contractsuspendedemailtype1765307309311');
INSERT INTO public.migrations VALUES (155, 1765403460916, 'PublicOnly1765403460916');
INSERT INTO public.migrations VALUES (156, 1765411429408, 'ActionShareLink1765411429408');
INSERT INTO public.migrations VALUES (157, 1764811931629, 'AddOnetimeInviteRequest1764811931629');
INSERT INTO public.migrations VALUES (158, 1764884282360, 'AddCommunityInviteCreatedNotification1764884282360');
INSERT INTO public.migrations VALUES (159, 1764893652492, 'SplitOnetimeInviteRequests1764893652492');
INSERT INTO public.migrations VALUES (160, 1764901809483, 'InviteRequestNotification1764901809483');
INSERT INTO public.migrations VALUES (161, 1765304639906, 'InviteRequestStatus1765304639906');
INSERT INTO public.migrations VALUES (162, 1765316813691, 'InviteRequestNotificationCategories1765316813691');
INSERT INTO public.migrations VALUES (163, 1765321014287, 'RemoveUnusedNotificationCategory1765321014287');
INSERT INTO public.migrations VALUES (164, 1765408390983, 'SwitchIsvalidToStatus1765408390983');
INSERT INTO public.migrations VALUES (165, 1765409475973, 'MergeOnetimeInviteRequest1765409475973');
INSERT INTO public.migrations VALUES (166, 1765413517474, 'DeleteInviteRequest1765413517474');
INSERT INTO public.migrations VALUES (167, 1765417613290, 'SidInResponse1765417613290');
INSERT INTO public.migrations VALUES (168, 1765416750764, 'ReadatTimestamp1765416750764');
INSERT INTO public.migrations VALUES (169, 1765476067577, 'SidColumn1765476067577');
INSERT INTO public.migrations VALUES (170, 1765479400717, 'ActionAuthors1765479400717');
INSERT INTO public.migrations VALUES (171, 1765914669962, 'Squarethumbnail1765914669962');
INSERT INTO public.migrations VALUES (172, 1766083713067, 'CustomCityStrings1766083713067');
INSERT INTO public.migrations VALUES (173, 1766170657666, 'PhFormId1766170657666');
INSERT INTO public.migrations VALUES (174, 1766173540865, 'SessionReplayUrl1766173540865');
INSERT INTO public.migrations VALUES (175, 1766095252523, 'NewCityNames1766095252523');
INSERT INTO public.migrations VALUES (176, 1766192324518, 'UserCitySetNull1766192324518');
INSERT INTO public.migrations VALUES (177, 1766193134488, 'CityIndices1766193134488');
INSERT INTO public.migrations VALUES (178, 1766431028217, 'AnonFormStats1766431028217');
INSERT INTO public.migrations VALUES (179, 1767634469644, 'PublicInfoFlag1767634469644');
INSERT INTO public.migrations VALUES (180, 1767656151583, 'DismissAction1767656151583');
INSERT INTO public.migrations VALUES (181, 1767662581187, 'DevicePushTokens1767662581187');
INSERT INTO public.migrations VALUES (182, 1767723571737, 'NewDeviceId1767723571737');
INSERT INTO public.migrations VALUES (183, 1767740780520, 'SwitchToManualArray1767740780520');
INSERT INTO public.migrations VALUES (184, 1767744666879, 'CachedUsersCompleted1767744666879');
INSERT INTO public.migrations VALUES (185, 1767747265825, 'ShouldCompleteAfterDeadline1767747265825');
INSERT INTO public.migrations VALUES (186, 1767814942035, 'PushNotifEntities1767814942035');
INSERT INTO public.migrations VALUES (187, 1767817644146, 'PushCheckedAt1767817644146');
INSERT INTO public.migrations VALUES (188, 1767818951964, 'PushNotifPrefs1767818951964');
INSERT INTO public.migrations VALUES (189, 1767825700237, 'PushNotifLinking1767825700237');
INSERT INTO public.migrations VALUES (190, 1767825876692, 'PushDefaultTrue1767825876692');
INSERT INTO public.migrations VALUES (191, 1767895932290, 'ReminderPushMessages1767895932290');
INSERT INTO public.migrations VALUES (192, 1767898017690, 'Notifsclaimedby1767898017690');
INSERT INTO public.migrations VALUES (193, 1767898126532, 'Notifsclaimedat1767898126532');
INSERT INTO public.migrations VALUES (194, 1767910488984, 'VisibilityMode1767910488984');
INSERT INTO public.migrations VALUES (195, 1767981223513, 'ActionStatsRecord1767981223513');
INSERT INTO public.migrations VALUES (196, 1767981804213, 'ActionStatsRecordShow1767981804213');
INSERT INTO public.migrations VALUES (197, 1767981916411, 'ActionStatsRecordStartEnd1767981916411');
INSERT INTO public.migrations VALUES (198, 1768165126566, 'ActivitySourceEnum1768165126566');
INSERT INTO public.migrations VALUES (199, 1768247113359, 'OptionalFlag1768247113359');
INSERT INTO public.migrations VALUES (200, 1768328517844, 'PostExperts1768328517844');
INSERT INTO public.migrations VALUES (201, 1768419237414, 'BetterOptInMms1768419237414');
INSERT INTO public.migrations VALUES (202, 1768503413752, 'Taguuid1768503413752');
INSERT INTO public.migrations VALUES (203, 1768504999853, 'TagIndices1768504999853');
INSERT INTO public.migrations VALUES (204, 1768505277411, 'Stringvalidatorids1768505277411');
INSERT INTO public.migrations VALUES (205, 1768505807207, 'Tt1768505807207');
INSERT INTO public.migrations VALUES (206, 1769021242460, 'OnboardingMember1769021242460');
INSERT INTO public.migrations VALUES (207, 1769021900523, 'RenameOnboardingColumn1769021900523');
INSERT INTO public.migrations VALUES (208, 1769113976463, 'IntroductoryMember1769113976463');
INSERT INTO public.migrations VALUES (209, 1769639546392, 'PriorityNotifs1769639546392');
INSERT INTO public.migrations VALUES (210, 1769642223093, 'MultiplePostAuthors1769642223093');
INSERT INTO public.migrations VALUES (211, 1769645653830, 'OnboardingFlag1769645653830');
INSERT INTO public.migrations VALUES (212, 1769726880759, 'ActionWithdrawStats1769726880759');
INSERT INTO public.migrations VALUES (213, 1769449998749, 'CommunityInviteCreatedNotifCategory1769449998749');
INSERT INTO public.migrations VALUES (214, 1769467363239, 'GroupAssignment1769467363239');
INSERT INTO public.migrations VALUES (215, 1769476531814, 'RemovedFromGroupNotifCategory1769476531814');
INSERT INTO public.migrations VALUES (216, 1769552393098, 'GroupAssignmentAndMemberLeftNotifCategories1769552393098');
INSERT INTO public.migrations VALUES (217, 1769553511301, 'PublicGroups1769553511301');
INSERT INTO public.migrations VALUES (218, 1769625580708, 'MemberJoinedCommunityNotifCategory1769625580708');
INSERT INTO public.migrations VALUES (219, 1769709250564, 'CommunityInviteRequest1769709250564');
INSERT INTO public.migrations VALUES (220, 1769712932590, 'CommunityInviteRequestsNotifCategories1769712932590');
INSERT INTO public.migrations VALUES (221, 1769732171671, 'DeletedAtFieldForInvites1769732171671');
INSERT INTO public.migrations VALUES (222, 1769733368326, 'LeaveGroupReminderNotifCategory1769733368326');
INSERT INTO public.migrations VALUES (223, 1770073380411, 'CommunityColumnsAllowMemberInvitesAndStaffAssignments1770073380411');
INSERT INTO public.migrations VALUES (224, 1770077777191, 'CommunityMaxCapacityDefault101770077777191');
INSERT INTO public.migrations VALUES (225, 1770150462408, 'LeaderReminderAndSetting1770150462408');
INSERT INTO public.migrations VALUES (226, 1770158027915, 'NotifPrioset1770158027915');
INSERT INTO public.migrations VALUES (227, 1770165396360, 'NotifCategoryNewMemberReferred1770165396360');
INSERT INTO public.migrations VALUES (228, 1770167050165, 'ExpressionValidator1770167050165');
INSERT INTO public.migrations VALUES (229, 1770240614835, 'ContractFlag1770240614835');
INSERT INTO public.migrations VALUES (230, 1770246695706, 'OnetimeInviteInfo1770246695706');
INSERT INTO public.migrations VALUES (231, 1770252977160, 'PendingCommunity1770252977160');
INSERT INTO public.migrations VALUES (232, 1770255058721, 'OnetimeInviteOnDelete1770255058721');
INSERT INTO public.migrations VALUES (233, 1770313616164, 'ForumAction1770313616164');
INSERT INTO public.migrations VALUES (234, 1770314034560, 'ActionsComputedAutocompleteAt1770314034560');
INSERT INTO public.migrations VALUES (235, 1770314744796, 'DeleteOnboardingMember1770314744796');
INSERT INTO public.migrations VALUES (236, 1770406405323, 'InviteUsedat1770406405323');
INSERT INTO public.migrations VALUES (237, 1770664541625, 'NotifCategoryRemovedFromCommunityForLeader1770664541625');
INSERT INTO public.migrations VALUES (238, 1770659668385, 'CustomStatValue1770659668385');
INSERT INTO public.migrations VALUES (239, 1770664618054, 'NoneStat1770664618054');
INSERT INTO public.migrations VALUES (240, 1770665222438, 'RemoveNotifCategoryLeftCommunityReminder1770665222438');
INSERT INTO public.migrations VALUES (241, 1770677602671, 'RemoveOnboardingcomplete1770677602671');
INSERT INTO public.migrations VALUES (242, 1770748416129, 'AllowMessageDelete1770748416129');
INSERT INTO public.migrations VALUES (243, 1770748521462, 'CommunityInviteCascade1770748521462');
INSERT INTO public.migrations VALUES (244, 1770749209310, 'Welcomemailcascade1770749209310');


--
-- Data for Name: mms; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.notification VALUES (836, 'likes', '2 people liked your completion of: Prepare to submit a public comment to your local government', '/actions/53/activity/834', NULL, '2025-12-14 14:59:00.885366-08', '2026-01-06 14:17:54.969218-08', 23, NULL, 'activity_like:834', 2, NULL, '2025-12-14 14:59:00.885366-08', 'Prepare to submit a public comment to your local government', NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (382, 'likes', '3 people liked your action activity', '/actions/50/activity/683', NULL, '2025-11-17 21:15:46.781483-08', '2025-11-19 20:47:15.863848-08', 11, NULL, 'activity_like:683', 3, NULL, '2025-11-17 21:15:46.781483-08', NULL, NULL, NULL, false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (941, 'likes', 'Sidney Hough liked your completion of: Invite friends and family to fill out our AI privacy survey', '/actions/56/activity/870', NULL, '2025-12-15 22:25:43.074435-08', '2025-12-15 22:36:33.837207-08', 10, NULL, 'activity_like:870', 1, NULL, '2025-12-15 22:25:43.074435-08', 'Invite friends and family to fill out our AI privacy survey', NULL, '2025-12-16 06:36:33.834', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (383, 'likes', 'Mark Xu liked your action activity', '/actions/48/activity/682', NULL, '2025-11-17 21:15:47.286732-08', '2025-11-17 21:15:47.286732-08', 11, NULL, 'activity_like:682', 1, NULL, '2025-11-17 21:15:47.286732-08', NULL, NULL, NULL, false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (973, 'likes', '3 people liked your completion of: Invite friends and family to fill out our AI privacy survey', '/actions/56/activity/890', NULL, '2025-12-18 11:18:52.225335-08', '2025-12-30 11:06:30.436826-08', 10, NULL, 'activity_like:890', 3, NULL, '2025-12-18 11:18:52.225335-08', 'Invite friends and family to fill out our AI privacy survey', NULL, '2025-12-25 05:11:09.649', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1415, 'forum_reply', 'New reply from Mark Xu', '/forum/post/15?replyId=168', NULL, '2026-01-13 18:30:22.373512-08', '2026-01-13 18:30:59.716188-08', 7, NULL, NULL, NULL, 168, '2026-01-13 18:30:22.373512-08', NULL, NULL, '2026-01-14 02:30:59.716', true, NULL, 'e0ad0c8f34104d72beefedf36c5de7fb', '2026-01-14 02:31:00.013921', 'low');
INSERT INTO public.notification VALUES (951, 'likes', '2 people liked your completion of: Read a few general updates', '/actions/57/activity/878', NULL, '2025-12-16 11:43:34.377294-08', '2026-01-04 17:13:04.266417-08', 15, NULL, 'activity_like:878', 2, NULL, '2025-12-16 11:43:34.377294-08', 'Read a few general updates', NULL, '2026-01-05 01:13:04.266', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (813, 'friend_request_accepted', 'Ruby Chen accepted your friend request', '/member/86', NULL, '2025-12-13 02:50:43.604734-08', '2025-12-21 22:15:17.466968-08', 7, NULL, NULL, NULL, NULL, '2025-12-13 02:50:43.604734-08', NULL, NULL, '2025-12-22 06:15:17.466', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (793, 'friend_request', 'Jakob Shackleton wants to be friends', '/member/85', NULL, '2025-12-11 07:22:03.970014-08', '2025-12-11 11:20:59.638433-08', 10, NULL, NULL, NULL, NULL, '2025-12-11 07:22:03.970014-08', NULL, NULL, '2025-12-11 19:20:59.62', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1040, 'likes', '3 people liked your completion of: Read a few general updates', '/actions/57/activity/939', NULL, '2025-12-22 14:08:30.566602-08', '2025-12-25 08:44:19.856851-08', 11, NULL, 'activity_like:939', 3, NULL, '2025-12-22 14:08:30.566602-08', 'Read a few general updates', NULL, NULL, false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1030, 'friend_request_accepted', 'Amy Xiong accepted your friend request', '/member/88', NULL, '2025-12-21 23:55:03.011385-08', '2025-12-22 08:57:38.899007-08', 7, NULL, NULL, NULL, NULL, '2025-12-21 23:55:03.011385-08', NULL, NULL, '2025-12-22 16:57:38.898', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (998, 'friend_request_accepted', 'Leo Zhang accepted your friend request', '/member/77', NULL, '2025-12-20 17:00:36.049616-08', '2025-12-24 21:11:54.500738-08', 10, NULL, NULL, NULL, NULL, '2025-12-20 17:00:36.049616-08', NULL, NULL, '2025-12-25 05:11:54.501', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (815, 'friend_request', 'Amy Xiong wants to be friends', '/member/88', NULL, '2025-12-13 10:26:34.497767-08', '2025-12-13 17:51:20.598964-08', 10, NULL, NULL, NULL, NULL, '2025-12-13 10:26:34.497767-08', NULL, NULL, '2025-12-14 01:51:20.596', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1037, 'friend_request_accepted', 'Owen Belamaric accepted your friend request', '/member/92', NULL, '2025-12-22 13:04:42.066456-08', '2025-12-22 17:59:56.111952-08', 7, NULL, NULL, NULL, NULL, '2025-12-22 13:04:42.066456-08', NULL, NULL, '2025-12-23 01:59:56.111', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (307, 'friend_request_accepted', 'Bryan Xu accepted your friend request', '/profile', NULL, '2025-11-10 00:01:18.875667-08', '2025-11-10 00:01:18.875667-08', 11, NULL, NULL, NULL, NULL, '2025-11-10 00:01:18.875667-08', NULL, NULL, NULL, false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1145, 'friend_request_accepted', 'Caden Mikkelsen accepted your friend request', '/member/80', NULL, '2026-01-05 19:43:49.581145-08', '2026-01-06 13:52:12.952981-08', 10, NULL, NULL, NULL, NULL, '2026-01-05 19:43:49.581145-08', NULL, NULL, '2026-01-06 21:52:12.953', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (794, 'friend_request', 'Jakob Shackleton wants to be friends', '/member/85', NULL, '2025-12-11 07:25:11.620508-08', '2026-01-06 14:17:54.969218-08', 23, NULL, NULL, NULL, NULL, '2025-12-11 07:25:11.620508-08', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1209, 'friend_request', 'Charles Lien wants to be friends', '/member/64', NULL, '2026-01-09 07:42:24.40328-08', '2026-01-09 09:26:52.141623-08', 23, NULL, NULL, NULL, NULL, '2026-01-09 07:42:24.40328-08', NULL, NULL, '2026-01-09 17:26:52.141', true, NULL, '32a1a64752e744a7baf2d18227ff1eaa', '2026-01-09 18:25:00.211196', 'low');
INSERT INTO public.notification VALUES (857, 'friend_request_accepted', 'Ruby Chen accepted your friend request', '/member/86', NULL, '2025-12-15 21:20:36.387652-08', '2026-01-06 13:52:17.621141-08', 10, NULL, NULL, NULL, NULL, '2025-12-15 21:20:36.387652-08', NULL, NULL, '2026-01-06 21:52:17.621', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (996, 'likes', '2 people liked your completion of: Invite friends and family to fill out our AI privacy survey', '/actions/56/activity/905', NULL, '2025-12-20 12:09:48.135176-08', '2026-01-06 14:17:54.969218-08', 23, NULL, 'activity_like:905', 2, NULL, '2025-12-20 12:09:48.135176-08', 'Invite friends and family to fill out our AI privacy survey', NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1123, 'friend_request_accepted', 'Wendy M Denham accepted your friend request', '/member/93', NULL, '2026-01-04 13:55:00.118762-08', '2026-01-06 13:50:45.935688-08', 10, NULL, NULL, NULL, NULL, '2026-01-04 13:55:00.118762-08', NULL, NULL, '2026-01-06 21:50:45.936', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1149, 'friend_request_accepted', 'Linda Tong accepted your friend request', '/member/29', NULL, '2026-01-05 22:32:46.45449-08', '2026-01-06 13:28:17.374756-08', 10, NULL, NULL, NULL, NULL, '2026-01-05 22:32:46.45449-08', NULL, NULL, '2026-01-06 21:28:17.374', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (976, 'friend_request', 'Aileen Zhang wants to be friends', '/member/90', NULL, '2025-12-18 13:15:14.320843-08', '2026-01-06 14:17:54.969218-08', 23, NULL, NULL, NULL, NULL, '2025-12-18 13:15:14.320843-08', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (403, 'likes', 'Sidney Hough liked your action activity', '/actions/10/activity/660', NULL, '2025-11-20 19:30:38.480782-08', '2025-11-20 19:30:38.480782-08', 11, NULL, 'activity_like:660', 1, NULL, '2025-11-20 19:30:38.480782-08', NULL, NULL, NULL, false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (856, 'likes', '2 people liked your completion of: Prepare to submit a public comment to your local government', '/actions/53/activity/851', NULL, '2025-12-15 20:59:58.701095-08', '2026-01-09 09:32:59.56943-08', 24, NULL, 'activity_like:851', 2, NULL, '2025-12-15 20:59:58.701095-08', 'Prepare to submit a public comment to your local government', NULL, '2026-01-09 17:32:59.568', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (930, 'likes', '3 people liked your completion of: Read a few general updates', '/actions/57/activity/857', NULL, '2025-12-15 21:37:24.252321-08', '2025-12-30 12:05:40.149957-08', 7, NULL, 'activity_like:857', 3, NULL, '2025-12-15 21:37:24.252321-08', 'Read a few general updates', NULL, '2025-12-16 05:46:05.244', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (458, 'likes', '2 people liked your action activity', '/actions/50/activity/708', NULL, '2025-11-24 18:02:34.878024-08', '2026-01-09 09:32:59.56943-08', 24, NULL, 'activity_like:708', 2, NULL, '2025-11-24 18:02:34.878024-08', NULL, NULL, '2026-01-09 17:32:59.568', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (522, 'likes', '4 people liked your action activity', '/actions/51/activity/734', NULL, '2025-11-29 21:44:35.308302-08', '2025-12-09 22:58:09.835218-08', 11, NULL, 'activity_like:734', 4, NULL, '2025-11-29 21:44:35.308302-08', NULL, NULL, NULL, false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (931, 'likes', '3 people liked your completion of: Read a few general updates', '/actions/57/activity/853', NULL, '2025-12-15 21:37:37.94326-08', '2025-12-30 11:06:32.493894-08', 10, NULL, 'activity_like:853', 3, NULL, '2025-12-15 21:37:37.94326-08', 'Read a few general updates', NULL, '2025-12-25 05:11:15.936', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (940, 'likes', '3 people liked your completion of: Invite friends and family to fill out our AI privacy survey', '/actions/56/activity/868', NULL, '2025-12-15 22:21:39.626882-08', '2025-12-30 11:25:55.73617-08', 7, NULL, 'activity_like:868', 3, NULL, '2025-12-15 22:21:39.626882-08', 'Invite friends and family to fill out our AI privacy survey', NULL, '2025-12-21 02:26:51.182', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1404, 'forum_reply', 'New reply from Mark Xu', '/forum/post/15?replyId=166', NULL, '2026-01-13 15:33:22.108862-08', '2026-01-13 15:33:51.662582-08', 7, NULL, NULL, NULL, 166, '2026-01-13 15:33:22.108862-08', NULL, NULL, '2026-01-13 23:33:51.662', true, NULL, '9a5ede7c052840e2bcb110b0808ede74', '2026-01-13 23:34:00.026235', 'low');
INSERT INTO public.notification VALUES (541, 'likes', '2 people liked your action activity', '/actions/51/activity/750', NULL, '2025-12-01 21:03:09.151733-08', '2026-01-09 09:32:59.56943-08', 24, NULL, 'activity_like:750', 2, NULL, '2025-12-01 21:03:09.151733-08', NULL, NULL, '2026-01-09 17:32:59.568', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1085, 'friend_request_accepted', 'Luka Waland accepted your friend request', '/member/100', NULL, '2025-12-30 11:17:47.766754-08', '2025-12-30 12:13:27.496329-08', 7, NULL, NULL, NULL, NULL, '2025-12-30 11:17:47.766754-08', NULL, NULL, '2025-12-30 20:13:27.495', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (633, 'likes', '3 people liked your action activity', '/actions/52/activity/782', NULL, '2025-12-07 21:33:13.69309-08', '2025-12-09 22:58:14.852387-08', 11, NULL, 'activity_like:782', 3, NULL, '2025-12-07 21:33:13.69309-08', NULL, NULL, NULL, false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (2280, 'action_update', 'Members expect to donate over $2,000 in unclaimed properties', '/actions/70', '/actions/70', '2026-01-30 13:12:06.644682-08', '2026-02-04 15:45:55.264472-08', 11, 12, NULL, NULL, NULL, '2026-01-30 13:12:00-08', NULL, NULL, '2026-02-04 23:45:55.264', true, NULL, 'f8e02136418c4b5da9737221e4dca0c4', '2026-01-30 21:13:00.140057', 'high');
INSERT INTO public.notification VALUES (790, 'likes', '4 people liked your completion of: Prepare to submit a public comment to your local government', '/actions/53/activity/810', NULL, '2025-12-10 15:34:29.012942-08', '2025-12-30 11:06:32.927649-08', 10, NULL, 'activity_like:810', 4, NULL, '2025-12-10 15:34:29.012942-08', 'Prepare to submit a public comment to your local government', NULL, '2025-12-11 17:33:12.329', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (784, 'friend_request', 'Elizabeth Barnes wants to be friends', '/member/82', NULL, '2025-12-09 11:41:48.345044-08', '2025-12-09 11:44:04.312336-08', 7, NULL, NULL, NULL, NULL, '2025-12-09 11:41:48.345044-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (789, 'likes', '2 people liked your action activity', '/actions/53/activity/809', NULL, '2025-12-10 15:32:36.194258-08', '2025-12-10 15:34:30.431976-08', 15, NULL, 'activity_like:809', 2, NULL, '2025-12-10 15:32:36.194258-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (397, 'likes', 'Bowen Jiang liked your action activity', '/actions/50/activity/696', NULL, '2025-11-19 20:47:18.967263-08', '2025-11-20 09:49:06.596811-08', 15, NULL, 'activity_like:696', 1, NULL, '2025-11-19 20:47:18.967263-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (100, 'forum_reply', 'Grant Hough replied to your comment', '/forum/post/6?replyId=50', '/forum/post/6?replyId=50', '2025-09-17 21:45:38.344302-07', '2025-09-23 09:49:13.999423-07', 15, NULL, NULL, NULL, NULL, '2025-09-17 21:45:38.344302-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (238, 'forum_reply', 'New reply from Geoff Hough', '/forum/post/9?replyId=97', NULL, '2025-10-18 09:20:21.803092-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-18 09:20:21.803092-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (239, 'forum_reply', 'New reply from Connor Cremers', '/forum/post/9?replyId=98', NULL, '2025-10-18 18:30:24.990381-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-18 18:30:24.990381-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (241, 'forum_reply', 'New reply from Sidney Hough', '/forum/post/9?replyId=99', NULL, '2025-10-18 20:20:12.078206-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-18 20:20:12.078206-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (242, 'forum_reply', 'New reply from James Valencia', '/forum/post/9?replyId=100', NULL, '2025-10-19 20:32:44.521845-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-19 20:32:44.521845-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (249, 'forum_reply', 'New reply from Eamon OCearuil', '/forum/post/9?replyId=106', NULL, '2025-10-22 11:00:37.769998-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-22 11:00:37.769998-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (243, 'forum_reply', 'New reply from Grant Hough', '/forum/post/9?replyId=102', NULL, '2025-10-20 20:24:10.175225-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-20 20:24:10.175225-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (245, 'forum_reply', 'New reply from Katherine Elwood Hashimoto', '/forum/post/9?replyId=103', NULL, '2025-10-20 20:58:35.291444-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-20 20:58:35.291444-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (244, 'friend_request_accepted', 'Alex Hodges accepted your friend request', '/profile', NULL, '2025-10-20 20:45:04.630766-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-20 20:45:04.630766-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (247, 'forum_reply', 'New reply from Sidney Hough', '/forum/post/9?replyId=104', NULL, '2025-10-21 10:14:41.973153-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-21 10:14:41.973153-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (254, 'forum_reply', 'New reply from aurin liu', '/forum/post/9?replyId=110', NULL, '2025-10-23 16:25:42.908655-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 16:25:42.908655-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (250, 'forum_reply', 'New reply from Xiuqin Wu', '/forum/post/9?replyId=107', NULL, '2025-10-22 13:23:58.759648-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-22 13:23:58.759648-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (50, 'friend_request', 'Geoff Hough wants to be friends', '/profile', NULL, '2025-08-25 15:06:32.831679-07', '2025-09-17 17:08:06.691318-07', 11, NULL, NULL, NULL, NULL, '2025-08-25 15:06:32.831679-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (296, 'friend_request_accepted', 'Rishi Vaidya accepted your friend request', '/profile', NULL, '2025-11-02 17:01:35.068757-08', '2025-11-10 20:57:37.157424-08', 7, NULL, NULL, NULL, NULL, '2025-11-02 17:01:35.068757-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (26, 'forum_reply', 'casey manning replied to your comment', '/actions/4/activity/7?replyId=6', '/actions/4/activity/7?replyId=6', '2025-08-14 15:37:25.543394-07', '2025-11-10 20:57:58.858796-08', 10, NULL, NULL, NULL, NULL, '2025-08-14 15:37:25.543394-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (49, 'friend_request', 'Mark Xu wants to be friends', '/profile', NULL, '2025-08-25 09:01:32.058269-07', '2025-09-17 17:08:06.691318-07', 11, NULL, NULL, NULL, NULL, '2025-08-25 09:01:32.058269-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (86, 'friend_request', 'Casey Manning wants to be friends', '/profile', NULL, '2025-09-16 20:49:05.157474-07', '2025-09-17 17:08:06.691318-07', 11, NULL, NULL, NULL, NULL, '2025-09-16 20:49:05.157474-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (97, 'friend_request_accepted', 'Grant Hough accepted your friend request', '/profile', NULL, '2025-09-17 16:47:21.647846-07', '2025-10-09 15:49:57.180221-07', 15, NULL, NULL, NULL, NULL, '2025-09-17 16:47:21.647846-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (106, 'friend_request', 'Keller Strother  wants to be friends', '/profile', NULL, '2025-09-18 13:20:29.826439-07', '2025-10-28 19:41:46.230978-07', 11, NULL, NULL, NULL, NULL, '2025-09-18 13:20:29.826439-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (3, 'friend_request', 'casey manning wants to be friends', '/profile', NULL, '2025-07-16 16:02:49.255951-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-07-16 16:02:49.255951-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (128, 'forum_reply', 'Liam Rosenfeld replied to your comment', '/forum/post/6?replyId=59', '/forum/post/6?replyId=59', '2025-09-19 20:11:29.781785-07', '2025-11-10 17:09:50.602287-08', 24, NULL, NULL, NULL, NULL, '2025-09-19 20:11:29.781785-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (90, 'friend_request_accepted', 'Mark Xu accepted your friend request', '/profile', NULL, '2025-09-17 15:52:28.753824-07', '2025-12-04 18:25:36.287889-08', 24, NULL, NULL, NULL, NULL, '2025-09-17 15:52:28.753824-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (18, 'forum_reply', 'casey manning replied to your comment', '/forum/post/1?replyId=10', '/forum/post/1?replyId=10', '2025-07-21 16:51:21.866873-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-07-21 16:51:21.866873-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (12, 'friend_request_accepted', 'Sidney Hough accepted your friend request', '/profile', NULL, '2025-07-20 11:09:53.884968-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-07-20 11:09:53.884968-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (19, 'forum_reply', 'casey manning replied to your comment', '/forum/post/1?replyId=13', '/forum/post/1?replyId=13', '2025-07-21 17:25:12.111729-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-07-21 17:25:12.111729-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (11, 'friend_request_accepted', 'Admin accepted your friend request', '/profile', NULL, '2025-07-18 15:05:52.818204-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-07-18 15:05:52.818204-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (22, 'forum_reply', 'casey manning replied to your comment', '/forum/post/1?replyId=18', '/forum/post/1?replyId=18', '2025-07-23 14:02:05.280384-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-07-23 14:02:05.280384-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (34, 'forum_reply', 'Admin replied to your comment', '/forum/post/4?replyId=14', '/forum/post/4?replyId=14', '2025-08-20 21:26:42.258747-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-08-20 21:26:42.258747-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (37, 'forum_reply', 'Admin replied to your comment', '/forum/post/4?replyId=17', '/forum/post/4?replyId=17', '2025-08-20 21:43:12.933831-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-08-20 21:43:12.933831-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (54, 'friend_request_accepted', 'Geoff Hough accepted your friend request', '/user/12', NULL, '2025-08-26 11:01:45.233171-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-08-26 11:01:45.233171-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (39, 'forum_reply', 'Sidney Hough replied to your action activity', '/actions/6/activity/13?replyId=20', '/actions/6/activity/13?replyId=20', '2025-08-20 22:26:35.373027-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-08-20 22:26:35.373027-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (38, 'forum_reply', 'Sidney Hough replied to your action activity', '/actions/6/activity/13?replyId=19', '/actions/6/activity/13?replyId=19', '2025-08-20 22:26:24.368884-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-08-20 22:26:24.368884-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (136, 'friend_request', 'Dulce Celeste Martinez wants to be friends', '/profile', NULL, '2025-09-22 21:04:20.911718-07', '2025-09-23 09:49:13.085707-07', 15, NULL, NULL, NULL, NULL, '2025-09-22 21:04:20.911718-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (10, 'friend_request', 'Mark Xu wants to be friends', '/profile', NULL, '2025-07-18 15:05:36.369376-07', '2025-12-21 09:27:45.900436-08', 7, NULL, NULL, NULL, NULL, '2025-07-18 15:05:36.369376-07', NULL, NULL, '2025-12-21 17:27:45.9', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (112, 'forum_reply', 'Keller Strother  replied to your comment', '/forum/post/6?replyId=53', '/forum/post/6?replyId=53', '2025-09-18 13:23:27.1927-07', '2026-01-06 14:17:54.969218-08', 23, NULL, NULL, NULL, NULL, '2025-09-18 13:23:27.1927-07', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (107, 'friend_request', 'Keller Strother  wants to be friends', '/profile', NULL, '2025-09-18 13:20:38.827392-07', '2026-01-06 14:17:54.969218-08', 23, NULL, NULL, NULL, NULL, '2025-09-18 13:20:38.827392-07', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (29, 'forum_reply', 'casey manning replied to your comment', '/forum/post/1?replyId=10', '/forum/post/1?replyId=10', '2025-08-14 21:21:11.045377-07', '2025-11-10 20:57:58.512136-08', 7, NULL, NULL, NULL, NULL, '2025-08-14 21:21:11.045377-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (87, 'friend_request', 'Eamon OCearuil wants to be friends', '/profile', NULL, '2025-09-17 15:32:15.099376-07', '2025-09-17 16:05:41.319263-07', 15, NULL, NULL, NULL, NULL, '2025-09-17 15:32:15.099376-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (96, 'forum_reply', 'Casey Manning replied to your comment', '/forum/post/6?replyId=49', '/forum/post/6?replyId=49', '2025-09-17 16:37:25.096485-07', '2025-09-17 17:08:06.691318-07', 11, NULL, NULL, NULL, NULL, '2025-09-17 16:37:25.096485-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (110, 'friend_request', 'Keller Strother  wants to be friends', '/profile', NULL, '2025-09-18 13:21:27.000509-07', '2025-09-23 09:49:15.71289-07', 15, NULL, NULL, NULL, NULL, '2025-09-18 13:21:27.000509-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (63, 'friend_request_accepted', 'Mark Xu accepted your friend request', '/profile', NULL, '2025-08-29 16:43:48.568651-07', '2025-09-23 09:49:03.836279-07', 15, NULL, NULL, NULL, NULL, '2025-08-29 16:43:48.568651-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (105, 'forum_reply', 'Bryan Xu replied to your forum post', '/forum/post/6?replyId=52', '/forum/post/6?replyId=52', '2025-09-18 02:32:31.858435-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-18 02:32:31.858435-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (113, 'forum_reply', 'Keller Strother  replied to your forum post', '/forum/post/6?replyId=54', '/forum/post/6?replyId=54', '2025-09-18 13:23:48.826378-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-18 13:23:48.826378-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (85, 'forum_reply', 'Grant Hough replied to your forum post', '/forum/post/6?replyId=46', '/forum/post/6?replyId=46', '2025-09-16 20:21:34.338117-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-16 20:21:34.338117-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (91, 'friend_request_accepted', 'Casey Manning accepted your friend request', '/profile', NULL, '2025-09-17 16:05:44.194012-07', '2025-11-10 17:09:58.366306-08', 24, NULL, NULL, NULL, NULL, '2025-09-17 16:05:44.194012-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (46, 'forum_reply', 'casey manning replied to your action activity', '/actions/6/activity/13?replyId=27', '/actions/6/activity/13?replyId=27', '2025-08-21 17:26:17.36662-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-08-21 17:26:17.36662-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (48, 'forum_reply', 'Grant Hough replied to your comment', '/forum/post/4?replyId=32', '/forum/post/4?replyId=32', '2025-08-24 18:08:29.236662-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-08-24 18:08:29.236662-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (69, 'forum_reply', 'Sidney Hough replied to your forum post', '/forum/post/5?replyId=41', '/forum/post/5?replyId=41', '2025-09-03 16:57:36.896307-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-03 16:57:36.896307-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (83, 'friend_request_accepted', 'Grant Hough accepted your friend request', '/profile', NULL, '2025-09-16 20:16:17.875684-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-16 20:16:17.875684-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (179, 'friend_request', 'Alex Hodges wants to be friends', '/user/48', NULL, '2025-09-30 22:32:04.798362-07', '2025-09-30 23:00:10.320633-07', 15, NULL, NULL, NULL, NULL, '2025-09-30 22:32:04.798362-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (189, 'friend_request', 'Hong Vo wants to be friends', '/user/51', NULL, '2025-10-05 11:14:31.832935-07', '2025-10-06 09:34:03.820496-07', 15, NULL, NULL, NULL, NULL, '2025-10-05 11:14:31.832935-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (208, 'friend_request', 'Linda Tong wants to be friends', '/user/29', NULL, '2025-10-08 10:03:12.357203-07', '2025-10-08 10:03:55.684536-07', 15, NULL, NULL, NULL, NULL, '2025-10-08 10:03:12.357203-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (169, 'forum_reply', 'New reply from Sidney Hough', '/forum/post/6?replyId=74', NULL, '2025-09-28 21:01:36.028981-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-28 21:01:36.028981-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (191, 'friend_request', 'Lang Hua wants to be friends', '/user/50', NULL, '2025-10-05 20:57:14.331741-07', '2025-10-28 19:41:46.230978-07', 11, NULL, NULL, NULL, NULL, '2025-10-05 20:57:14.331741-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (93, 'friend_request_accepted', 'Mark Xu accepted your friend request', '/profile', NULL, '2025-09-17 16:15:10.523458-07', '2026-01-06 14:17:54.969218-08', 23, NULL, NULL, NULL, NULL, '2025-09-17 16:15:10.523458-07', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (149, 'friend_request', 'Solomon Kim wants to be friends', '/user/39', NULL, '2025-09-24 11:53:13.056907-07', '2026-01-06 14:17:54.969218-08', 23, NULL, NULL, NULL, NULL, '2025-09-24 11:53:13.056907-07', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (168, 'forum_reply', 'New reply from Sidney Hough', '/forum/post/6?replyId=73', NULL, '2025-09-28 20:57:02.029335-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-28 20:57:02.029335-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (226, 'friend_request_accepted', 'Linda Tong accepted your friend request', '/profile', NULL, '2025-10-15 16:32:55.621646-07', '2025-10-28 19:41:46.230978-07', 11, NULL, NULL, NULL, NULL, '2025-10-15 16:32:55.621646-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (88, 'friend_request', 'Eamon OCearuil wants to be friends', '/profile', NULL, '2025-09-17 15:32:25.204698-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-17 15:32:25.204698-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (121, 'forum_reply', 'Geoff Hough replied to your comment', '/forum/post/6?replyId=56', '/forum/post/6?replyId=56', '2025-09-19 13:46:04.599536-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-19 13:46:04.599536-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (92, 'friend_request', 'Shreshth Srivastava wants to be friends', '/profile', NULL, '2025-09-17 16:12:43.803654-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-17 16:12:43.803654-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (135, 'friend_request_accepted', 'David Kim accepted your friend request', '/profile', NULL, '2025-09-22 17:09:08.676056-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-22 17:09:08.676056-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (62, 'friend_request', 'Casey Manning wants to be friends', '/profile', NULL, '2025-08-29 16:21:48.914147-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-08-29 16:21:48.914147-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (65, 'friend_request', 'Bob Grand wants to be friends', '/profile', NULL, '2025-08-31 13:29:44.732472-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-08-31 13:29:44.732472-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (64, 'forum_reply', 'Bob Grand replied to your action activity', '/actions/9/activity/27?replyId=39', '/actions/9/activity/27?replyId=39', '2025-08-31 13:29:40.584002-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-08-31 13:29:40.584002-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (66, 'forum_reply', 'Bob Grand replied to your forum post', '/forum/post/5?replyId=40', '/forum/post/5?replyId=40', '2025-08-31 13:31:58.245253-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-08-31 13:31:58.245253-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (68, 'friend_request_accepted', 'Eamon OCearuil accepted your friend request', '/profile', NULL, '2025-09-02 19:37:53.627915-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-02 19:37:53.627915-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (70, 'friend_request', 'Audrey Xu wants to be friends', '/profile', NULL, '2025-09-05 11:39:35.988807-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-05 11:39:35.988807-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (7, 'forum_reply', 'Admin replied to your comment', '/forum/post/1?replyId=4', '/forum/post/1?replyId=4', '2025-07-18 14:44:20.49324-07', '2025-11-10 20:57:56.417731-08', 7, NULL, NULL, NULL, NULL, '2025-07-18 14:44:20.49324-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (293, 'friend_request', 'Charles Lien wants to be friends', '/user/64', NULL, '2025-11-02 12:22:29.214019-08', '2025-11-11 11:35:30.7946-08', 15, NULL, NULL, NULL, NULL, '2025-11-02 12:22:29.214019-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (280, 'friend_request_accepted', 'Bowen Jiang accepted your friend request', '/profile', NULL, '2025-10-29 18:20:19.580988-07', '2025-11-02 11:16:57.978838-08', 11, NULL, NULL, NULL, NULL, '2025-10-29 18:20:19.580988-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (279, 'friend_request', 'Bowen Jiang wants to be friends', '/user/49', NULL, '2025-10-29 18:20:10.678677-07', '2025-10-29 22:33:59.517728-07', 15, NULL, NULL, NULL, NULL, '2025-10-29 18:20:10.678677-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (257, 'forum_reply', 'New reply from Bowen Jiang', '/forum/post/9?replyId=112', NULL, '2025-10-23 21:16:32.685869-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 21:16:32.685869-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (258, 'forum_reply', 'New reply from Bryan Xu', '/forum/post/9?replyId=113', NULL, '2025-10-23 21:31:43.696194-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 21:31:43.696194-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (259, 'forum_reply', 'New reply from Dulce Celeste Martinez', '/forum/post/9?replyId=114', NULL, '2025-10-23 22:00:15.733705-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 22:00:15.733705-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (260, 'forum_reply', 'New reply from Danny Leung', '/forum/post/9?replyId=115', NULL, '2025-10-23 22:11:40.731066-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 22:11:40.731066-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (261, 'forum_reply', 'New reply from Audrey Xu', '/forum/post/9?replyId=116', NULL, '2025-10-23 22:15:16.246395-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 22:15:16.246395-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (274, 'forum_reply', 'New reply from Stefan Murphy', '/forum/post/6?replyId=127', NULL, '2025-10-28 22:05:35.605435-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-10-28 22:05:35.605435-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (13, 'forum_reply', 'casey manning replied to your comment', '/forum/post/1?replyId=5', '/forum/post/1?replyId=5', '2025-07-20 22:52:56.586969-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-07-20 22:52:56.586969-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (288, 'friend_request_accepted', 'Kate Hough accepted your friend request', '/profile', NULL, '2025-10-31 17:55:39.135714-07', '2025-11-17 21:06:37.395263-08', 11, NULL, NULL, NULL, NULL, '2025-10-31 17:55:39.135714-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (24, 'forum_reply', 'casey manning replied to your action activity', '/actions/4/activity/7?replyId=5', '/actions/4/activity/7?replyId=5', '2025-08-14 15:37:16.557015-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-08-14 15:37:16.557015-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (30, 'forum_reply', 'Mark Xu replied to your action activity', '/actions/4/activity/7?replyId=11', '/actions/4/activity/7?replyId=11', '2025-08-15 12:00:15.534586-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-08-15 12:00:15.534586-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (25, 'forum_reply', 'casey manning replied to your action activity', '/actions/4/activity/7?replyId=6', '/actions/4/activity/7?replyId=6', '2025-08-14 15:37:25.543394-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-08-14 15:37:25.543394-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (28, 'forum_reply', 'casey manning replied to your comment', '/forum/post/1?replyId=9', '/forum/post/1?replyId=9', '2025-08-14 21:20:58.706918-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-08-14 21:20:58.706918-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (127, 'forum_reply', 'Liam Rosenfeld replied to your forum post', '/forum/post/6?replyId=59', '/forum/post/6?replyId=59', '2025-09-19 20:11:29.781785-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-19 20:11:29.781785-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (80, 'forum_reply', 'Mark Xu replied to your forum post', '/forum/post/6?replyId=45', '/forum/post/6?replyId=45', '2025-09-16 18:49:21.985104-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-16 18:49:21.985104-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (94, 'forum_reply', 'Shreshth Srivastava replied to your forum post', '/forum/post/6?replyId=48', '/forum/post/6?replyId=48', '2025-09-17 16:20:11.091897-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-17 16:20:11.091897-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (45, 'forum_reply', 'Mark Xu replied to your comment', '/forum/post/4?replyId=26', '/forum/post/4?replyId=26', '2025-08-21 15:55:54.429618-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-08-21 15:55:54.429618-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (99, 'forum_reply', 'Grant Hough replied to your forum post', '/forum/post/6?replyId=50', '/forum/post/6?replyId=50', '2025-09-17 21:45:38.344302-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-17 21:45:38.344302-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (109, 'friend_request', 'Keller Strother  wants to be friends', '/profile', NULL, '2025-09-18 13:21:02.634501-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-18 13:21:02.634501-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (111, 'forum_reply', 'Keller Strother  replied to your forum post', '/forum/post/6?replyId=53', '/forum/post/6?replyId=53', '2025-09-18 13:23:27.1927-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-18 13:23:27.1927-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (119, 'forum_reply', 'Geoff Hough replied to your forum post', '/forum/post/6?replyId=55', '/forum/post/6?replyId=55', '2025-09-19 13:22:50.784561-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-19 13:22:50.784561-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (122, 'forum_reply', 'Mark Xu replied to your forum post', '/forum/post/6?replyId=57', '/forum/post/6?replyId=57', '2025-09-19 15:16:21.341443-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-19 15:16:21.341443-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (132, 'forum_reply', 'Bob Grand replied to your forum post', '/forum/post/6?replyId=61', '/forum/post/6?replyId=61', '2025-09-22 10:47:01.661667-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-22 10:47:01.661667-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (89, 'forum_reply', 'Eamon OCearuil replied to your forum post', '/forum/post/6?replyId=47', '/forum/post/6?replyId=47', '2025-09-17 15:35:34.817052-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-17 15:35:34.817052-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (95, 'forum_reply', 'Casey Manning replied to your forum post', '/forum/post/6?replyId=49', '/forum/post/6?replyId=49', '2025-09-17 16:37:25.096485-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-17 16:37:25.096485-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (103, 'forum_reply', 'Audrey Xu replied to your forum post', '/forum/post/6?replyId=51', '/forum/post/6?replyId=51', '2025-09-17 22:19:34.158324-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-17 22:19:34.158324-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (120, 'forum_reply', 'Geoff Hough replied to your forum post', '/forum/post/6?replyId=56', '/forum/post/6?replyId=56', '2025-09-19 13:46:04.599536-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-19 13:46:04.599536-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (124, 'forum_reply', 'David Kim replied to your forum post', '/forum/post/6?replyId=58', '/forum/post/6?replyId=58', '2025-09-19 16:28:26.467126-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-19 16:28:26.467126-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (133, 'forum_reply', 'Bob Grand replied to your forum post', '/forum/post/6?replyId=62', '/forum/post/6?replyId=62', '2025-09-22 10:50:56.689266-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-22 10:50:56.689266-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (138, 'forum_reply', 'Dulce Celeste Martinez replied to your forum post', '/forum/post/6?replyId=63', '/forum/post/6?replyId=63', '2025-09-22 21:19:23.441569-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-22 21:19:23.441569-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (143, 'friend_request', 'Danny Leung wants to be friends', '/user/26', NULL, '2025-09-23 20:28:34.583419-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-23 20:28:34.583419-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (144, 'forum_reply', 'Danny Leung replied to your forum post', '/forum/post/6?replyId=64', '/forum/post/6?replyId=64', '2025-09-23 20:31:59.75766-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-23 20:31:59.75766-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (151, 'forum_reply', 'Kyle Scott replied to your forum post', '/forum/post/6?replyId=66', '/forum/post/6?replyId=66', '2025-09-24 21:18:00.851737-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-24 21:18:00.851737-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (152, 'forum_reply', 'Kyle Scott replied to your forum post', '/forum/post/6?replyId=67', '/forum/post/6?replyId=67', '2025-09-24 21:41:37.836498-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-24 21:41:37.836498-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (156, 'forum_reply', 'Xiuqin Wu replied to your forum post', '/forum/post/6?replyId=69', '/forum/post/6?replyId=69', '2025-09-25 04:16:22.605909-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-25 04:16:22.605909-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (163, 'friend_request', 'James Valencia wants to be friends', '/user/42', NULL, '2025-09-28 20:12:14.837441-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-28 20:12:14.837441-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (165, 'forum_reply', 'New reply from Sidney Hough', '/forum/post/6?replyId=72', NULL, '2025-09-28 20:14:18.485802-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-28 20:14:18.485802-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (171, 'forum_reply', 'New reply from Akash Borde', '/forum/post/6?replyId=75', NULL, '2025-09-30 00:59:02.413775-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-30 00:59:02.413775-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (172, 'forum_reply', 'New reply from Akash Borde', '/forum/post/6?replyId=76', NULL, '2025-09-30 01:03:43.985596-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-30 01:03:43.985596-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (173, 'forum_reply', 'New reply from Akash Borde', '/forum/post/6?replyId=77', NULL, '2025-09-30 01:07:36.347046-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-30 01:07:36.347046-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (174, 'friend_request', 'Akash Borde wants to be friends', '/user/38', NULL, '2025-09-30 01:07:50.118598-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-30 01:07:50.118598-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (176, 'forum_reply', 'New reply from Akash Borde', '/forum/post/6?replyId=78', NULL, '2025-09-30 01:10:25.793367-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-30 01:10:25.793367-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (177, 'forum_reply', 'New reply from aurin liu', '/forum/post/6?replyId=79', NULL, '2025-09-30 14:34:03.755446-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-30 14:34:03.755446-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (180, 'forum_reply', 'New reply from Alex Hodges', '/forum/post/6?replyId=80', NULL, '2025-09-30 22:45:34.65725-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-09-30 22:45:34.65725-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (185, 'forum_reply', 'New reply from Bowen Jiang', '/forum/post/6?replyId=82', NULL, '2025-10-03 18:45:17.248648-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-10-03 18:45:17.248648-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (205, 'forum_reply', 'New reply from Connor Cremers', '/forum/post/6?replyId=87', NULL, '2025-10-07 19:43:02.361709-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-10-07 19:43:02.361709-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (200, 'friend_request', 'Katherine Elwood Hashimoto wants to be friends', '/user/54', NULL, '2025-10-07 18:58:52.93779-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-10-07 18:58:52.93779-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (201, 'forum_reply', 'New reply from Katherine Elwood Hashimoto', '/forum/post/6?replyId=86', NULL, '2025-10-07 19:02:25.453623-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-10-07 19:02:25.453623-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (210, 'forum_reply', 'New reply from Linda Tong', '/forum/post/6?replyId=88', NULL, '2025-10-08 10:10:20.178887-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-10-08 10:10:20.178887-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (222, 'friend_request_accepted', 'aurin liu accepted your friend request', '/profile', NULL, '2025-10-14 15:50:06.088307-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-10-14 15:50:06.088307-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (283, 'friend_request_accepted', 'Charles Lien accepted your friend request', '/profile', NULL, '2025-10-31 08:04:32.780678-07', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-10-31 08:04:32.780678-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (301, 'friend_request_accepted', 'Stefan Murphy accepted your friend request', '/profile', NULL, '2025-11-03 17:47:36.805597-08', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-11-03 17:47:36.805597-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (297, 'friend_request_accepted', 'Justin Peck accepted your friend request', '/profile', NULL, '2025-11-02 18:59:06.517293-08', '2025-11-10 17:03:46.751698-08', 7, NULL, NULL, NULL, NULL, '2025-11-02 18:59:06.517293-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (78, 'friend_request', 'Xiuqin Wu wants to be friends', '/profile', NULL, '2025-09-07 15:35:46.441894-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-07 15:35:46.441894-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (108, 'friend_request', 'Keller Strother  wants to be friends', '/profile', NULL, '2025-09-18 13:20:52.029386-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-18 13:20:52.029386-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (126, 'friend_request', 'Liam Rosenfeld wants to be friends', '/profile', NULL, '2025-09-19 20:03:40.236149-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-19 20:03:40.236149-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (166, 'friend_request', 'Sam Spinner wants to be friends', '/user/44', NULL, '2025-09-28 20:54:39.495385-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-09-28 20:54:39.495385-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (184, 'friend_request', 'Bowen Jiang wants to be friends', '/user/49', NULL, '2025-10-03 18:43:17.348809-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-03 18:43:17.348809-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (193, 'friend_request', 'Lang Hua wants to be friends', '/user/50', NULL, '2025-10-05 20:59:29.44719-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-05 20:59:29.44719-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (221, 'friend_request_accepted', 'Connor Cremers accepted your friend request', '/profile', NULL, '2025-10-11 10:28:18.213345-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-11 10:28:18.213345-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (231, 'forum_reply', 'New reply from Shreshth Srivastava', '/forum/post/9?replyId=91', NULL, '2025-10-16 20:40:00.317074-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-16 20:40:00.317074-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (194, 'forum_reply', 'New reply from Lang Hua', '/forum/post/6?replyId=83', NULL, '2025-10-05 21:12:21.186645-07', '2025-11-10 22:30:41.551264-08', 7, NULL, NULL, NULL, NULL, '2025-10-05 21:12:21.186645-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (232, 'forum_reply', 'New reply from Sidney Hough', '/forum/post/9?replyId=92', NULL, '2025-10-16 21:53:40.461053-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-16 21:53:40.461053-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (233, 'forum_reply', 'New reply from Akash Borde', '/forum/post/9?replyId=93', NULL, '2025-10-16 22:41:51.315832-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-16 22:41:51.315832-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (234, 'forum_reply', 'New reply from Kyle Scott', '/forum/post/9?replyId=94', NULL, '2025-10-17 09:49:17.973591-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-17 09:49:17.973591-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (236, 'forum_reply', 'New reply from Sidney Hough', '/forum/post/9?replyId=95', NULL, '2025-10-17 15:32:06.396265-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-17 15:32:06.396265-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (237, 'forum_reply', 'New reply from Janos Pasztor', '/forum/post/9?replyId=96', NULL, '2025-10-17 19:17:39.740121-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-17 19:17:39.740121-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (252, 'forum_reply', 'New reply from Hong Vo', '/forum/post/9?replyId=108', NULL, '2025-10-23 09:28:34.439582-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 09:28:34.439582-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (253, 'forum_reply', 'New reply from Bob Grand', '/forum/post/9?replyId=109', NULL, '2025-10-23 11:28:21.652355-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 11:28:21.652355-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (256, 'forum_reply', 'New reply from Casey Manning', '/forum/post/9?replyId=111', NULL, '2025-10-23 18:17:11.864333-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 18:17:11.864333-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (264, 'forum_reply', 'New reply from Justin Peck', '/forum/post/9?replyId=117', NULL, '2025-10-23 23:03:57.812107-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 23:03:57.812107-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (267, 'forum_reply', 'New reply from Nicholas Mullins', '/forum/post/9?replyId=120', NULL, '2025-10-23 23:37:43.97834-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 23:37:43.97834-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (268, 'forum_reply', 'New reply from Sam Spinner', '/forum/post/9?replyId=121', NULL, '2025-10-23 23:57:17.967424-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 23:57:17.967424-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (266, 'forum_reply', 'New reply from Linda Tong', '/forum/post/9?replyId=119', NULL, '2025-10-23 23:35:28.210217-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-23 23:35:28.210217-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (269, 'forum_reply', 'New reply from Eamon OCearuil', '/forum/post/9?replyId=122', NULL, '2025-10-24 09:46:25.192932-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-24 09:46:25.192932-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (270, 'forum_reply', 'New reply from Keller Strother', '/forum/post/9?replyId=123', NULL, '2025-10-24 11:08:00.201153-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-24 11:08:00.201153-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (273, 'forum_reply', 'New reply from Stefan Murphy', '/forum/post/9?replyId=126', NULL, '2025-10-28 21:51:34.724615-07', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-10-28 21:51:34.724615-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (298, 'friend_request_accepted', 'Janos Pasztor accepted your friend request', '/profile', NULL, '2025-11-02 22:44:28.468731-08', '2025-11-10 20:24:49.669615-08', 10, NULL, NULL, NULL, NULL, '2025-11-02 22:44:28.468731-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (73, 'friend_request', 'Bryan Xu wants to be friends', '/profile', NULL, '2025-09-05 12:09:07.518448-07', '2025-11-10 20:25:11.663775-08', 10, NULL, NULL, NULL, NULL, '2025-09-05 12:09:07.518448-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (290, 'friend_request_accepted', 'Kate Hough accepted your friend request', '/profile', NULL, '2025-10-31 17:55:43.463202-07', '2025-11-11 20:07:21.723693-08', 10, NULL, NULL, NULL, NULL, '2025-10-31 17:55:43.463202-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (302, 'friend_request_accepted', 'Dulce Celeste Martinez accepted your friend request', '/profile', NULL, '2025-11-09 13:59:22.950332-08', '2025-11-12 21:25:04.716294-08', 10, NULL, NULL, NULL, NULL, '2025-11-09 13:59:22.950332-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (309, 'forum_reply', 'New reply from Casey Manning', '/actions/50/activity/600?replyId=133', NULL, '2025-11-12 10:58:56.676972-08', '2025-11-14 17:17:34.170126-08', 10, NULL, NULL, NULL, NULL, '2025-11-12 10:58:56.676972-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (371, 'likes', 'Sidney Hough liked your action activity', '/actions/48/activity/682', NULL, '2025-11-17 21:05:36.589362-08', '2025-11-17 21:10:23.428219-08', 11, NULL, 'activity_like:682', 1, NULL, '2025-11-17 21:05:36.589362-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (331, 'likes', 'Bowen Jiang liked your action activity', '/actions/50/activity/600', NULL, '2025-11-14 21:29:15.922084-08', '2025-11-15 10:31:46.192417-08', 10, NULL, 'activity_like:600', 1, NULL, '2025-11-14 21:29:15.922084-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (350, 'friend_request_accepted', 'Ruairi OCearuil accepted your friend request', '/profile', NULL, '2025-11-16 18:37:14.328441-08', '2025-11-16 18:56:41.971087-08', 10, NULL, NULL, NULL, NULL, '2025-11-16 18:37:14.328441-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (365, 'friend_request_accepted', 'Solomon Kim accepted your friend request', '/profile', NULL, '2025-11-17 08:57:43.175425-08', '2025-11-17 09:39:16.031916-08', 10, NULL, NULL, NULL, NULL, '2025-11-17 08:57:43.175425-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (351, 'friend_request_accepted', 'Ruairi OCearuil accepted your friend request', '/profile', NULL, '2025-11-16 18:37:20.609885-08', '2025-11-17 09:40:29.592991-08', 7, NULL, NULL, NULL, NULL, '2025-11-16 18:37:20.609885-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (330, 'likes', 'Bowen Jiang liked your action activity', '/actions/50/activity/599', NULL, '2025-11-14 21:29:15.049653-08', '2025-11-17 10:06:42.491072-08', 7, NULL, 'activity_like:599', 1, NULL, '2025-11-14 21:29:15.049653-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (51, 'forum_reply', 'Admin replied to your comment', '/forum/post/4?replyId=33', '/forum/post/4?replyId=33', '2025-08-25 15:17:51.986924-07', '2025-11-17 21:11:05.721392-08', 11, NULL, NULL, NULL, NULL, '2025-08-25 15:17:51.986924-07', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (394, 'likes', '2 people liked your action activity', '/actions/50/activity/696', NULL, '2025-11-19 09:36:43.565883-08', '2025-11-19 09:40:00.769162-08', 15, NULL, 'activity_like:696', 2, NULL, '2025-11-19 09:36:43.565883-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (395, 'likes', 'Mark Xu liked your action activity', '/actions/50/activity/696', NULL, '2025-11-19 10:41:09.744032-08', '2025-11-19 10:41:35.274525-08', 15, NULL, 'activity_like:696', 1, NULL, '2025-11-19 10:41:09.744032-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (396, 'likes', 'Mark Xu liked your action activity', '/actions/50/activity/696', NULL, '2025-11-19 10:41:45.443016-08', '2025-11-19 14:06:04.379146-08', 15, NULL, 'activity_like:696', 1, NULL, '2025-11-19 10:41:45.443016-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (404, 'likes', 'Mark Xu liked your comment', '/forum/post/11?replyId=141', NULL, '2025-11-20 21:26:59.905789-08', '2025-11-20 21:29:03.196437-08', 7, NULL, 'forum_like:comment:141', 1, NULL, '2025-11-20 21:26:59.905789-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (312, 'forum_reply', 'New reply from Olivia C', '/forum/post/6?replyId=135', NULL, '2025-11-13 05:53:46.61794-08', '2025-12-10 23:18:20.224638-08', 7, NULL, NULL, NULL, NULL, '2025-11-13 05:53:46.61794-08', NULL, NULL, '2025-12-11 07:18:20.223', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (332, 'likes', 'Bowen Jiang liked your action activity', '/actions/50/activity/615', NULL, '2025-11-14 21:29:16.709594-08', '2026-01-06 14:17:54.969218-08', 23, NULL, 'activity_like:615', 1, NULL, '2025-11-14 21:29:16.709594-08', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (392, 'likes', 'Mark Xu liked your action activity', '/actions/50/activity/599', NULL, '2025-11-18 18:51:36.427735-08', '2025-12-03 10:32:30.858707-08', 7, NULL, 'activity_like:599', 1, NULL, '2025-11-18 18:51:36.427735-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (459, 'likes', 'Mark Xu liked your completion of: Provide feedback to the office', '/actions/51/activity/709', NULL, '2025-11-24 18:07:52.0306-08', '2025-11-26 14:42:27.155831-08', 7, NULL, 'activity_like:709', 1, NULL, '2025-11-24 18:07:52.0306-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (461, 'likes', '2 people liked your completion of: Provide feedback to the office', '/actions/51/activity/711', NULL, '2025-11-24 18:12:08.58509-08', '2025-12-30 11:06:33.996674-08', 10, NULL, 'activity_like:711', 2, NULL, '2025-11-24 18:12:08.58509-08', 'Provide feedback to the office', NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (462, 'likes', 'Mark Xu liked your completion of: Provide feedback to the office', '/actions/51/activity/712', NULL, '2025-11-24 19:06:17.064274-08', '2026-01-06 14:17:54.969218-08', 23, NULL, 'activity_like:712', 1, NULL, '2025-11-24 19:06:17.064274-08', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (529, 'likes', '3 people liked your action activity', '/actions/51/activity/741', NULL, '2025-12-01 14:52:21.718552-08', '2025-12-08 16:05:32.505194-08', 15, NULL, 'activity_like:741', 3, NULL, '2025-12-01 14:52:21.718552-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (536, 'likes', '3 people liked your action activity', '/actions/52/activity/747', NULL, '2025-12-01 20:42:16.310438-08', '2025-12-08 16:05:31.410935-08', 7, NULL, 'activity_like:747', 3, NULL, '2025-12-01 20:42:16.310438-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (551, 'likes', '4 people liked your action activity', '/actions/52/activity/762', NULL, '2025-12-02 13:31:07.878724-08', '2025-12-08 16:05:29.559345-08', 15, NULL, 'activity_like:762', 4, NULL, '2025-12-02 13:31:07.878724-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (703, 'likes', '2 people liked your comment', '/actions/14?replyId=148', NULL, '2025-12-08 16:37:45.196782-08', '2025-12-08 20:23:20.201755-08', 11, NULL, 'forum_like:comment:148', 2, NULL, '2025-12-08 16:37:45.196782-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (537, 'likes', '4 people liked your completion of: Participate in an experiment to measure awareness of AI data use practices', '/actions/52/activity/748', NULL, '2025-12-01 20:42:52.992142-08', '2025-12-30 11:06:33.372505-08', 10, NULL, 'activity_like:748', 4, NULL, '2025-12-01 20:42:52.992142-08', 'Participate in an experiment to measure awareness of AI data use practices', NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (710, 'likes', '2 people liked your completion of: Prepare to submit a public comment to your local government', '/actions/53/activity/793', NULL, '2025-12-08 19:06:04.887849-08', '2025-12-22 10:43:36.190717-08', 7, NULL, 'activity_like:793', 2, NULL, '2025-12-08 19:06:04.887849-08', 'Prepare to submit a public comment to your local government', NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (712, 'likes', 'Sidney Hough liked your completion of: Prepare to submit a public comment to your local government', '/actions/53/activity/795', NULL, '2025-12-08 19:16:46.989923-08', '2025-12-24 21:11:28.681403-08', 10, NULL, 'activity_like:795', 1, NULL, '2025-12-08 19:16:46.989923-08', NULL, NULL, '2025-12-25 05:11:28.681', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (603, 'action_update', 'We processed the results of the member survey', '/actions/51', '/actions/51', '2025-12-03 10:02:04.373913-08', '2025-12-22 11:24:13.365583-08', 7, 4, NULL, NULL, NULL, '2025-12-03 10:02:00-08', NULL, NULL, '2025-12-22 19:24:13.366', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (834, 'likes', '3 people liked your completion of: Prepare to submit a public comment to your local government', '/actions/53/activity/836', NULL, '2025-12-14 14:58:46.518743-08', '2025-12-22 10:42:51.168281-08', 11, NULL, 'activity_like:836', 3, NULL, '2025-12-14 14:58:46.518743-08', 'Prepare to submit a public comment to your local government', NULL, NULL, false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (2346, 'likes', 'Ananya Veligeti liked your comment: Thanks for joining!', '/actions/11/activity/1351?replyId=253', NULL, '2026-01-30 15:30:46.987334-08', '2026-01-30 15:52:08.213363-08', 10, NULL, 'forum_like:comment:253', 1, NULL, '2026-01-30 15:30:46.987334-08', 'Thanks for joining!', NULL, '2026-01-30 23:52:08.212', true, NULL, '83b5e77f5560444c9b755b2748f88c4f', '2026-01-30 23:31:00.016023', 'low');
INSERT INTO public.notification VALUES (1041, 'likes', '4 people liked your completion of: Invite friends and family to fill out our AI privacy survey', '/actions/56/activity/938', NULL, '2025-12-22 14:08:32.547019-08', '2026-01-04 13:54:08.134139-08', 11, NULL, 'activity_like:938', 4, NULL, '2025-12-22 14:08:32.547019-08', 'Invite friends and family to fill out our AI privacy survey', NULL, NULL, false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (2345, 'likes', 'Ananya Veligeti liked your comment: Welcome!', '/actions/11/activity/1351?replyId=252', NULL, '2026-01-30 15:30:45.795945-08', '2026-01-30 15:45:24.953259-08', 7, NULL, 'forum_like:comment:252', 1, NULL, '2026-01-30 15:30:45.795945-08', 'Welcome!', NULL, '2026-01-30 23:45:24.953', true, NULL, '83b5e77f5560444c9b755b2748f88c4f', '2026-01-30 23:31:00.016023', 'low');
INSERT INTO public.notification VALUES (1065, 'likes', 'Mark Xu liked your completion of: Invite friends and family to fill out our AI privacy survey', '/actions/56/activity/966', NULL, '2025-12-23 09:20:30.282071-08', '2026-01-09 09:32:59.56943-08', 24, NULL, 'activity_like:966', 1, NULL, '2025-12-23 09:20:30.282071-08', 'Invite friends and family to fill out our AI privacy survey', NULL, '2026-01-09 17:32:59.568', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1063, 'likes', '2 people liked your completion of: Invite friends and family to fill out our AI privacy survey', '/actions/56/activity/962', NULL, '2025-12-22 22:29:25.428508-08', '2026-01-04 17:13:17.338919-08', 15, NULL, 'activity_like:962', 2, NULL, '2025-12-22 22:29:25.428508-08', 'Invite friends and family to fill out our AI privacy survey', NULL, '2026-01-05 01:13:17.338', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1088, 'likes', 'Luka Waland liked your post: Personal habit changes to be trialed by 100 members', '/forum/post/6', NULL, '2025-12-30 11:31:06.975853-08', '2025-12-30 12:13:17.775648-08', 7, NULL, 'forum_like:post:6', 1, NULL, '2025-12-30 11:31:06.975853-08', 'Personal habit changes to be trialed by 100 members', NULL, '2025-12-30 20:13:17.775', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1408, 'likes', '3 people liked your comment: In your experience(s), how familiar are various world leaders and other officials with the details of UNFCCC conference proceedings/recommendations/outcomes?', '/forum/post/15?replyId=166', NULL, '2026-01-13 16:21:41.253755-08', '2026-01-14 11:15:55.39653-08', 10, NULL, 'forum_like:comment:166', 3, NULL, '2026-01-13 16:21:41.253755-08', 'In your experience(s), how familiar are various world leaders and other officials with the details of UNFCCC conference proceedings/recommendations/outcomes?', NULL, '2026-01-14 00:49:23.817', true, NULL, 'c22a8385041e474da059a1e2ba16dbf7', '2026-01-14 00:22:00.116395', 'low');
INSERT INTO public.notification VALUES (1068, 'likes', 'Mark Xu liked your completion of: Read a few general updates', '/actions/57/activity/967', NULL, '2025-12-23 09:20:32.575945-08', '2026-01-09 09:32:59.56943-08', 24, NULL, 'activity_like:967', 1, NULL, '2025-12-23 09:20:32.575945-08', 'Read a few general updates', NULL, '2026-01-09 17:32:59.568', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1086, 'likes', 'Luka Waland liked your post: Code of Conduct', '/forum/post/5', NULL, '2025-12-30 11:28:15.862795-08', '2025-12-30 12:02:50.002191-08', 10, NULL, 'forum_like:post:5', 1, NULL, '2025-12-30 11:28:15.862795-08', 'Code of Conduct', NULL, '2025-12-30 20:02:50.001', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (806, 'likes', '2 people liked your comment: Yay', '/actions/32?replyId=153', NULL, '2025-12-12 13:23:52.616203-08', '2025-12-31 10:44:31.850386-08', 11, NULL, 'forum_like:comment:153', 2, NULL, '2025-12-12 13:23:52.616203-08', 'Yay', NULL, '2025-12-13 23:38:24.909', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (610, 'likes', '2 people liked your comment: According to SF 311 tracker, my pothole was repaired ~2 days after I reported it. Haven''t checked it out yet though.', '/actions/50?replyId=147', NULL, '2025-12-03 18:33:40.68833-08', '2025-12-31 12:20:00.585937-08', 10, NULL, 'forum_like:comment:147', 2, NULL, '2025-12-03 18:33:40.68833-08', 'According to SF 311 tracker, my pothole was repaired ~2 days after I reported it. Haven''t checked it out yet though.', NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (805, 'likes', '2 people liked your comment: I''m also in Berkeley; they sent one the morning after I reported it!', '/actions/50?replyId=150', NULL, '2025-12-12 13:23:16.722536-08', '2025-12-31 12:20:05.080756-08', 11, NULL, 'forum_like:comment:150', 2, NULL, '2025-12-12 13:23:16.722536-08', 'I''m also in Berkeley; they sent one the morning after I reported it!', NULL, '2025-12-13 00:30:57.459', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1098, 'likes', '6 people liked your completion of: Submit a public comment to your local government', '/actions/54/activity/982', NULL, '2025-12-31 15:49:14.633891-08', '2026-01-05 18:55:43.821339-08', 7, NULL, 'activity_like:982', 6, NULL, '2025-12-31 15:49:14.633891-08', 'Submit a public comment to your local government', NULL, '2025-12-31 23:58:42.18', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1129, 'likes', '5 people liked your completion of: Submit a public comment to your local government', '/actions/54/activity/1004', NULL, '2026-01-04 18:52:19.773559-08', '2026-01-06 14:17:19.206031-08', 15, NULL, 'activity_like:1004', 5, NULL, '2026-01-04 18:52:19.773559-08', 'Submit a public comment to your local government', NULL, '2026-01-06 22:17:19.206', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1118, 'likes', '3 people liked your completion of: Submit a public comment to your local government', '/actions/54/activity/994', NULL, '2026-01-03 13:32:42.373707-08', '2026-01-06 14:17:54.969218-08', 23, NULL, 'activity_like:994', 3, NULL, '2026-01-03 13:32:42.373707-08', 'Submit a public comment to your local government', NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1115, 'likes', '6 people liked your completion of: Submit a public comment to your local government', '/actions/54/activity/991', NULL, '2026-01-02 17:43:30.464437-08', '2026-01-05 18:55:47.920875-08', 10, NULL, 'activity_like:991', 6, NULL, '2026-01-02 17:43:30.464437-08', 'Submit a public comment to your local government', NULL, '2026-01-03 18:10:25.069', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1186, 'friend_request_accepted', 'Kylen Fleishman accepted your friend request', '/member/101', NULL, '2026-01-07 15:24:30.10177-08', '2026-01-07 15:47:01.715183-08', 10, NULL, NULL, NULL, NULL, '2026-01-07 15:24:30.10177-08', NULL, NULL, '2026-01-07 23:47:01.715', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1462, 'likes', '2 people liked your completion of: Collect e-waste for proper disposal', '/actions/60/activity/1184', NULL, '2026-01-13 21:10:40.871736-08', '2026-01-13 21:12:57.97123-08', 24, NULL, 'activity_like:1184', 2, NULL, '2026-01-13 21:10:40.871736-08', 'Collect e-waste for proper disposal', NULL, NULL, true, NULL, '1ca26b4f63af45b7a2791e931be7f3c5', '2026-01-14 05:11:00.004776', 'low');
INSERT INTO public.notification VALUES (1101, 'likes', 'Luka Waland liked your comment: Mark and I have a similar attitude towards meat consumption.', '/forum/post/6?replyId=156', NULL, '2026-01-01 09:27:00.159762-08', '2026-01-06 14:17:42.586018-08', 7, NULL, 'forum_like:comment:156', 1, NULL, '2026-01-01 09:27:00.159762-08', 'Mark and I have a similar attitude towards meat consumption.', NULL, '2026-01-06 22:17:42.585', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1199, 'friend_request', 'Kuhan Jeyapragasan wants to be friends', '/member/104', NULL, '2026-01-08 18:12:05.717924-08', '2026-01-08 19:23:01.72239-08', 7, NULL, NULL, NULL, NULL, '2026-01-08 18:12:05.717924-08', NULL, NULL, '2026-01-09 03:23:01.722', true, NULL, '32a1a64752e744a7baf2d18227ff1eaa', '2026-01-09 18:25:00.211196', 'low');
INSERT INTO public.notification VALUES (1146, 'likes', '3 people liked your completion of: Submit a public comment to your local government', '/actions/54/activity/1015', NULL, '2026-01-05 20:21:34.782524-08', '2026-01-06 09:17:06.474036-08', 11, NULL, 'activity_like:1015', 3, NULL, '2026-01-05 20:21:34.782524-08', 'Submit a public comment to your local government', NULL, '2026-01-06 07:04:23.688', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1192, 'friend_request_accepted', 'Laura Lenkic accepted your friend request', '/member/103', NULL, '2026-01-07 22:41:10.691313-08', '2026-01-08 00:48:27.429557-08', 10, NULL, NULL, NULL, NULL, '2026-01-07 22:41:10.691313-08', NULL, NULL, '2026-01-08 08:48:27.429', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (997, 'likes', '2 people liked your completion of: Read a few general updates', '/actions/57/activity/906', NULL, '2025-12-20 12:09:48.727912-08', '2026-01-06 14:17:54.969218-08', 23, NULL, 'activity_like:906', 2, NULL, '2025-12-20 12:09:48.727912-08', 'Read a few general updates', NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (281, 'friend_request', 'Bowen Jiang wants to be friends', '/user/49', NULL, '2025-10-29 18:20:35.626364-07', '2026-01-06 14:17:54.969218-08', 23, NULL, NULL, NULL, NULL, '2025-10-29 18:20:35.626364-07', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (628, 'likes', '3 people liked your action activity', '/actions/52/activity/774', NULL, '2025-12-06 18:53:46.238659-08', '2026-01-06 14:17:54.969218-08', 23, NULL, 'activity_like:774', 3, NULL, '2025-12-06 18:53:46.238659-08', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1156, 'likes', '4 people liked your completion of: Decide whether to make basic profile information public', '/actions/59/activity/1022', NULL, '2026-01-06 18:59:36.786494-08', '2026-01-09 21:25:26.732793-08', 10, NULL, 'activity_like:1022', 4, NULL, '2026-01-06 18:59:36.786494-08', 'Decide whether to make basic profile information public', NULL, '2026-01-07 03:18:35.772', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1161, 'likes', '3 people liked your completion of: Collect e-waste for proper disposal', '/actions/60/activity/1025', NULL, '2026-01-06 19:19:31.851893-08', '2026-01-09 13:44:32.002917-08', 23, NULL, 'activity_like:1025', 3, NULL, '2026-01-06 19:19:31.851893-08', 'Collect e-waste for proper disposal', NULL, '2026-01-08 21:58:27.2', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1162, 'likes', '3 people liked your completion of: Decide whether to make basic profile information public', '/actions/59/activity/1029', NULL, '2026-01-06 20:08:30.200535-08', '2026-01-07 09:20:55.351544-08', 15, NULL, 'activity_like:1029', 3, NULL, '2026-01-06 20:08:30.200535-08', 'Decide whether to make basic profile information public', NULL, '2026-01-07 04:15:36.388', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1417, 'forum_reply', 'New reply from Casey Manning', '/forum/post/15?replyId=169', NULL, '2026-01-13 18:35:02.978909-08', '2026-01-13 18:35:32.557778-08', 7, NULL, NULL, NULL, 169, '2026-01-13 18:35:02.978909-08', NULL, NULL, '2026-01-14 02:35:32.558', true, NULL, '6ea30f9819f94b52b15ccb5789de9e15', '2026-01-14 02:36:00.155524', 'low');
INSERT INTO public.notification VALUES (1160, 'likes', '4 people liked your completion of: Decide whether to make basic profile information public', '/actions/59/activity/1023', NULL, '2026-01-06 19:18:43.726297-08', '2026-01-09 21:25:23.409016-08', 7, NULL, 'activity_like:1023', 4, NULL, '2026-01-06 19:18:43.726297-08', 'Decide whether to make basic profile information public', NULL, '2026-01-07 04:08:19.261', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1205, 'likes', '4 people liked your completion of: Collect e-waste for proper disposal', '/actions/60/activity/1063', NULL, '2026-01-08 21:34:10.24171-08', '2026-01-12 02:07:24.782817-08', 7, NULL, 'activity_like:1063', 4, NULL, '2026-01-08 21:34:10.24171-08', 'Collect e-waste for proper disposal', NULL, '2026-01-09 05:34:37.373', true, NULL, '32a1a64752e744a7baf2d18227ff1eaa', '2026-01-09 18:25:00.211196', 'low');
INSERT INTO public.notification VALUES (717, 'likes', '2 people liked your action activity', '/actions/52/activity/799', NULL, '2025-12-08 20:35:26.33675-08', '2026-01-09 09:32:59.56943-08', 24, NULL, 'activity_like:799', 2, NULL, '2025-12-08 20:35:26.33675-08', NULL, NULL, '2026-01-09 17:32:59.568', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1148, 'likes', 'Mark Xu liked your completion of: Submit a public comment to your local government', '/actions/54/activity/1014', NULL, '2026-01-05 21:16:11.003812-08', '2026-01-09 09:32:59.56943-08', 24, NULL, 'activity_like:1014', 1, NULL, '2026-01-05 21:16:11.003812-08', 'Submit a public comment to your local government', NULL, '2026-01-09 17:32:59.568', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1196, 'likes', '5 people liked your completion of: Collect e-waste for proper disposal', '/actions/60/activity/1057', NULL, '2026-01-08 11:32:47.458543-08', '2026-01-13 19:00:45.639909-08', 10, NULL, 'activity_like:1057', 5, NULL, '2026-01-08 11:32:47.458543-08', 'Collect e-waste for proper disposal', NULL, '2026-01-08 19:33:49.195', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1157, 'likes', '3 people liked your completion of: Decide whether to make basic profile information public', '/actions/59/activity/1024', NULL, '2026-01-06 19:03:38.872261-08', '2026-01-09 13:44:31.455367-08', 23, NULL, 'activity_like:1024', 3, NULL, '2026-01-06 19:03:38.872261-08', 'Decide whether to make basic profile information public', NULL, '2026-01-08 21:58:23.35', false, NULL, NULL, NULL, 'low');
INSERT INTO public.notification VALUES (1214, 'likes', '3 people liked your completion of: Decide whether to make basic profile information public', '/actions/59/activity/1067', NULL, '2026-01-09 19:52:09.890472-08', '2026-01-09 22:21:42.1654-08', 11, NULL, 'activity_like:1067', 3, NULL, '2026-01-09 19:52:09.890472-08', 'Decide whether to make basic profile information public', NULL, NULL, true, NULL, '64435e91f22747d99df80e7ee3b5614b', '2026-01-10 03:53:00.115755', 'low');
INSERT INTO public.notification VALUES (1420, 'forum_reply', 'New reply from Shreshth Srivastava', '/forum/post/15?replyId=171', NULL, '2026-01-13 18:39:54.86114-08', '2026-01-13 18:43:05.031856-08', 7, NULL, NULL, NULL, 171, '2026-01-13 18:39:54.86114-08', NULL, NULL, '2026-01-14 02:43:05.032', true, NULL, 'b56c92fab44a47d487f3d9f6c52431f1', '2026-01-14 02:40:00.205117', 'low');
INSERT INTO public.notification VALUES (1247, 'friend_request_accepted', 'Laura Lenkic accepted your friend request', '/member/103', NULL, '2026-01-11 09:54:14.086589-08', '2026-01-11 10:26:26.453666-08', 7, NULL, NULL, NULL, NULL, '2026-01-11 09:54:14.086589-08', NULL, NULL, '2026-01-11 18:26:26.453', true, NULL, '277556d704a54f74a6c05ac6204122d9', '2026-01-11 17:55:00.008885', 'low');
INSERT INTO public.notification VALUES (1244, 'friend_request_accepted', 'Rongsheng Luo accepted your friend request', '/member/87', NULL, '2026-01-11 09:32:00.227295-08', '2026-01-11 10:36:52.253727-08', 10, NULL, NULL, NULL, NULL, '2026-01-11 09:32:00.227295-08', NULL, NULL, '2026-01-11 18:36:52.254', true, NULL, '7ab35304a0744488bf76d51d78cd276e', '2026-01-11 17:33:00.117224', 'low');
INSERT INTO public.notification VALUES (1421, 'forum_reply', 'New reply from Shreshth Srivastava', '/forum/post/15?replyId=172', NULL, '2026-01-13 18:41:45.865517-08', '2026-01-13 18:42:13.172268-08', 7, NULL, NULL, NULL, 172, '2026-01-13 18:41:45.865517-08', NULL, NULL, '2026-01-14 02:42:13.172', true, NULL, '01ed89a676b54f2ab15056af21bb5bd5', '2026-01-14 02:42:00.021884', 'low');
INSERT INTO public.notification VALUES (2442, 'friend_request_accepted', 'Rachel Zhou accepted your friend request', '/member/135', NULL, '2026-02-03 15:00:23.855354-08', '2026-02-03 15:01:53.71116-08', 11, NULL, NULL, NULL, NULL, '2026-02-03 15:00:23.855354-08', NULL, NULL, '2026-02-03 23:01:53.71', true, NULL, '893835e31fc84889bc4dbb895377090f', '2026-02-03 23:01:00.059813', 'low');
INSERT INTO public.notification VALUES (1496, 'friend_request_accepted', 'brice Lalonde accepted your friend request', '/member/108', NULL, '2026-01-14 05:48:54.260211-08', '2026-01-14 09:30:57.341713-08', 10, NULL, NULL, NULL, NULL, '2026-01-14 05:48:54.260211-08', NULL, NULL, '2026-01-14 17:30:57.341', true, NULL, '9f798a392ce14821a5c4302634a47923', '2026-01-14 13:49:00.119826', 'low');
INSERT INTO public.notification VALUES (1275, 'likes', 'Mark Xu liked your comment', '/forum/post/13?replyId=161', NULL, '2026-01-12 17:44:59.93762-08', '2026-01-12 17:46:14.108711-08', 7, NULL, 'forum_like:comment:161', 1, NULL, '2026-01-12 17:44:59.93762-08', '', NULL, '2026-01-13 01:46:14.107', true, NULL, 'b2f542dcf5f344f7b4d3535fc8c88ae8', '2026-01-13 01:45:00.040162', 'low');
INSERT INTO public.notification VALUES (1439, 'forum_reply', 'New reply from Grant Hough', '/forum/post/15?replyId=175', NULL, '2026-01-13 19:32:36.08461-08', '2026-01-13 21:00:00.788291-08', 7, NULL, NULL, NULL, 175, '2026-01-13 19:32:36.08461-08', NULL, NULL, '2026-01-14 05:00:00.788', true, NULL, 'c2e239d616514943a76e1c0466070fa5', '2026-01-14 03:33:00.128806', 'low');
INSERT INTO public.notification VALUES (1269, 'likes', '5 people liked your completion of: Collect e-waste for proper disposal', '/actions/60/activity/1109', NULL, '2026-01-12 17:42:14.176687-08', '2026-01-17 04:58:04.151947-08', 15, NULL, 'activity_like:1109', 5, NULL, '2026-01-12 17:42:14.176687-08', 'Collect e-waste for proper disposal', NULL, '2026-01-14 05:24:46.564', true, NULL, 'eb7f743979db47c08ce7b413ce2f608a', '2026-01-13 01:43:00.119417', 'low');
INSERT INTO public.notification VALUES (1450, 'likes', '3 people liked your comment: How do you think the US withdrawals will impact the attitudes and contributions of other countries, especially those who emit significantly less carbon than the US?', '/forum/post/15?replyId=175', NULL, '2026-01-13 19:45:18.527983-08', '2026-01-14 11:19:34.368849-08', 11, NULL, 'forum_like:comment:175', 3, NULL, '2026-01-13 19:45:18.527983-08', 'How do you think the US withdrawals will impact the attitudes and contributions of other countries, especially those who emit significantly less carbon than the US?', NULL, NULL, true, NULL, 'fcccadb29fdb448bae9abb9b15c5f929', '2026-01-14 03:46:00.110972', 'low');
INSERT INTO public.notification VALUES (1438, 'likes', '3 people liked your comment: Are there ways that people in the US (scientists, funders, city/state governments, etc.) could still contribute meaningfully to international cooperation on climate change?', '/forum/post/15?replyId=174', NULL, '2026-01-13 19:01:56.350275-08', '2026-01-14 11:18:35.411951-08', 7, NULL, 'forum_like:comment:174', 3, NULL, '2026-01-13 19:01:56.350275-08', 'Are there ways that people in the US (scientists, funders, city/state governments, etc.) could still contribute meaningfully to international cooperation on climate change?', NULL, '2026-01-14 05:10:48.753', true, NULL, '31cc20b8f20a4516b5404aa5a5e7bf12', '2026-01-14 03:02:00.007471', 'low');
INSERT INTO public.notification VALUES (1441, 'forum_reply', 'New reply from Grant Hough', '/forum/post/15?replyId=177', NULL, '2026-01-13 19:40:16.425758-08', '2026-01-13 19:45:01.997835-08', 10, NULL, NULL, NULL, 177, '2026-01-13 19:40:16.425758-08', NULL, NULL, '2026-01-14 03:45:01.997', true, NULL, 'b4442ea7188f4fc3b23dead59ba8fa28', '2026-01-14 03:41:00.012932', 'low');
INSERT INTO public.notification VALUES (1453, 'likes', 'Mark Xu liked your completion of: Decide whether to make basic profile information public', '/actions/59/activity/1174', NULL, '2026-01-13 20:29:14.618634-08', '2026-01-13 20:29:14.618634-08', 24, NULL, 'activity_like:1174', 1, NULL, '2026-01-13 20:29:14.618634-08', 'Decide whether to make basic profile information public', NULL, NULL, true, NULL, '9b994150201c45eca3c223a222731ea1', '2026-01-14 04:30:00.254431', 'low');
INSERT INTO public.notification VALUES (1442, 'forum_reply', 'New reply from Grant Hough', '/forum/post/15?replyId=177', NULL, '2026-01-13 19:40:16.425758-08', '2026-01-13 21:00:00.788291-08', 7, NULL, NULL, NULL, 177, '2026-01-13 19:40:16.425758-08', NULL, NULL, '2026-01-14 05:00:00.788', true, NULL, 'b4442ea7188f4fc3b23dead59ba8fa28', '2026-01-14 03:41:00.012932', 'low');
INSERT INTO public.notification VALUES (1436, 'likes', '3 people liked your completion of: Ask experts questions about the recent US withdrawal from international institutions', '/actions/62/activity/1169', NULL, '2026-01-13 19:01:29.042869-08', '2026-01-14 10:21:32.274688-08', 7, NULL, 'activity_like:1169', 3, NULL, '2026-01-13 19:01:29.042869-08', 'Ask experts questions about the recent US withdrawal from international institutions', NULL, '2026-01-14 05:10:53.169', true, NULL, '31cc20b8f20a4516b5404aa5a5e7bf12', '2026-01-14 03:02:00.007471', 'low');
INSERT INTO public.notification VALUES (1434, 'likes', '4 people liked your completion of: Ask experts questions about the recent US withdrawal from international institutions', '/actions/62/activity/1157', NULL, '2026-01-13 19:00:43.134645-08', '2026-01-15 16:59:25.245595-08', 10, NULL, 'activity_like:1157', 4, NULL, '2026-01-13 19:00:43.134645-08', 'Ask experts questions about the recent US withdrawal from international institutions', NULL, '2026-01-14 03:01:25.741', true, NULL, '6befbebe76164d9f85d3b73904f97824', '2026-01-14 03:01:00.009579', 'low');
INSERT INTO public.notification VALUES (1401, 'likes', '6 people liked your post: Expert Q&A on U.S. withdrawal from international institutions', '/forum/post/15', NULL, '2026-01-13 14:37:59.036736-08', '2026-01-15 10:08:49.70354-08', 7, NULL, 'forum_like:post:15', 6, NULL, '2026-01-13 14:37:59.036736-08', 'Expert Q&A on U.S. withdrawal from international institutions', NULL, '2026-01-13 22:40:31.979', true, NULL, '08069a71b8da406eb2d956a3b4560550', '2026-01-13 22:38:00.017091', 'low');
INSERT INTO public.notification VALUES (1435, 'likes', '4 people liked your completion of: Read the Alliance’s recent progress update', '/actions/66/activity/1158', NULL, '2026-01-13 19:00:43.695759-08', '2026-01-17 04:58:04.684884-08', 10, NULL, 'activity_like:1158', 4, NULL, '2026-01-13 19:00:43.695759-08', 'Read the Alliance’s recent progress update', NULL, '2026-01-14 03:01:34.808', true, NULL, '6befbebe76164d9f85d3b73904f97824', '2026-01-14 03:01:00.009579', 'low');
INSERT INTO public.notification VALUES (2153, 'likes', '15 people liked your post: Alliance culture discussion', '/forum/post/16', NULL, '2026-01-28 19:06:01.567773-08', '2026-02-05 22:10:29.08216-08', 10, NULL, 'forum_like:post:16:user:10', 15, NULL, '2026-01-28 19:06:01.567773-08', 'Alliance culture discussion', NULL, '2026-01-29 03:13:27.668', true, NULL, 'a2af0d166ce24ce990be670487768a4b', '2026-01-29 03:07:00.038039', 'low');
INSERT INTO public.notification VALUES (1778, 'likes', '3 people liked your completion of: Properly dispose of the e-waste you collected', '/actions/64/activity/1248', NULL, '2026-01-17 16:29:12.805894-08', '2026-01-19 12:29:43.046961-08', 7, NULL, 'activity_like:1248', 3, NULL, '2026-01-17 16:29:12.805894-08', 'Properly dispose of the e-waste you collected', NULL, '2026-01-18 00:30:20.7', true, NULL, '9fea990f883c4b06b71e1a725f12fd2b', '2026-01-18 00:30:00.226683', 'low');
INSERT INTO public.notification VALUES (1548, 'likes', 'Luka Waland liked your comment: yay great! yeah there was a problem with our text sending configuration (hadn''t enabled permission for some international areas) that is now fixed so you should be able to get reminder/announcement texts in the future', '/actions/10?replyId=205', NULL, '2026-01-14 09:51:35.065226-08', '2026-01-14 09:52:04.880333-08', 15, NULL, 'forum_like:comment:205', 1, NULL, '2026-01-14 09:51:35.065226-08', 'yay great! yeah there was a problem with our text sending configuration (hadn''t enabled permission for some international areas) that is now fixed so you should be able to get reminder/announcement texts in the future', NULL, '2026-01-14 17:52:04.879', true, NULL, 'a098d83364634fa2983123133dcfc101', '2026-01-14 17:52:00.049278', 'low');
INSERT INTO public.notification VALUES (1779, 'likes', '3 people liked your completion of: Properly dispose of the e-waste you collected', '/actions/64/activity/1249', NULL, '2026-01-17 16:30:25.213956-08', '2026-01-19 12:29:42.603527-08', 10, NULL, 'activity_like:1249', 3, NULL, '2026-01-17 16:30:25.213956-08', 'Properly dispose of the e-waste you collected', NULL, '2026-01-18 01:10:39.467', true, NULL, 'c41118dfd6c54b81baab51102e86afd5', '2026-01-18 00:31:00.12367', 'low');
INSERT INTO public.notification VALUES (1881, 'friend_request', 'Alex Hockett wants to be friends', '/member/127', NULL, '2026-01-24 17:05:13.991102-08', '2026-01-24 21:24:14.232793-08', 7, NULL, NULL, NULL, NULL, '2026-01-24 17:05:13.991102-08', NULL, NULL, '2026-01-25 05:24:14.231', true, NULL, 'b9f7909348c644b991168f1e65dee77d', '2026-01-25 01:06:00.037677', 'low');
INSERT INTO public.notification VALUES (1416, 'likes', '2 people liked your comment: In your mind(s), are there any historical events similar to this mass withdraw?', '/forum/post/15?replyId=168', NULL, '2026-01-13 18:31:10.319848-08', '2026-01-14 06:56:58.411095-08', 10, NULL, 'forum_like:comment:168', 2, NULL, '2026-01-13 18:31:10.319848-08', 'In your mind(s), are there any historical events similar to this mass withdraw?', NULL, '2026-01-14 02:33:15.056', true, NULL, '4ddfd847a999424089842112ea4528a6', '2026-01-14 02:32:00.13655', 'low');
INSERT INTO public.notification VALUES (1552, 'friend_request_accepted', 'Luka Waland accepted your friend request', '/member/100', NULL, '2026-01-14 10:28:04.814954-08', '2026-01-14 15:26:44.93483-08', 15, NULL, NULL, NULL, NULL, '2026-01-14 10:28:04.814954-08', NULL, NULL, '2026-01-14 23:26:44.934', true, NULL, 'ca764cc9836d4f0c95150b556da9b77f', '2026-01-14 18:29:00.107943', 'low');
INSERT INTO public.notification VALUES (1418, 'likes', '4 people liked your comment: To what extent has the U.S. souring on international climate cooperation over the last few years contributed to a general tide of other countries expending less effort addressing climate issues, or has the U.S. mainly acted alone with international cooperation otherwise remaining strong?', '/forum/post/15?replyId=169', NULL, '2026-01-13 18:35:31.008775-08', '2026-01-18 19:18:39.935157-08', 15, NULL, 'forum_like:comment:169', 4, NULL, '2026-01-13 18:35:31.008775-08', 'To what extent has the U.S. souring on international climate cooperation over the last few years contributed to a general tide of other countries expending less effort addressing climate issues, or has the U.S. mainly acted alone with international cooperation otherwise remaining strong?', NULL, '2026-01-19 03:18:39.935', true, NULL, '6ea30f9819f94b52b15ccb5789de9e15', '2026-01-14 02:36:00.155524', 'low');
INSERT INTO public.notification VALUES (1464, 'likes', '3 people liked your comment: To add: are there any roles that the US formerly filled that no other countries are able to?', '/forum/post/15?replyId=179', NULL, '2026-01-13 21:13:28.681783-08', '2026-01-14 11:16:23.172497-08', 11, NULL, 'forum_like:comment:179', 3, NULL, '2026-01-13 21:13:28.681783-08', 'To add: are there any roles that the US formerly filled that no other countries are able to?', NULL, NULL, true, NULL, '8501252a794c4e5d98e833ad58a88b87', '2026-01-14 05:14:00.134303', 'low');
INSERT INTO public.notification VALUES (1463, 'likes', '4 people liked your comment: To add to this: if there have been any similar historical events to the US withdrawals, have you ever seen any of them lead to a stronger system afterward?', '/forum/post/15?replyId=177', NULL, '2026-01-13 21:11:27.406307-08', '2026-01-14 11:16:46.086385-08', 11, NULL, 'forum_like:comment:177', 4, NULL, '2026-01-13 21:11:27.406307-08', 'To add to this: if there have been any similar historical events to the US withdrawals, have you ever seen any of them lead to a stronger system afterward?', NULL, NULL, true, NULL, 'db65900ff2c94890b1931b417fefd9b0', '2026-01-14 05:12:00.109487', 'low');
INSERT INTO public.notification VALUES (2445, 'likes', 'Grant Hough liked your comment: Welcome!', '/actions/11/activity/1410?replyId=292', NULL, '2026-02-03 15:02:03.576744-08', '2026-02-03 15:07:11.717045-08', 7, NULL, 'forum_like:comment:292', 1, NULL, '2026-02-03 15:02:03.576744-08', 'Welcome!', NULL, '2026-02-03 23:07:11.716', true, NULL, '3c28d423eb294662b80638eb0cc7a96f', '2026-02-03 23:03:00.143317', 'low');
INSERT INTO public.notification VALUES (2511, 'likes', 'Sidney Hough liked your comment: Welcome!', '/actions/11/activity/1421?replyId=309', NULL, '2026-02-04 10:34:29.195471-08', '2026-02-04 10:42:20.385509-08', 10, NULL, 'forum_like:comment:309', 1, NULL, '2026-02-04 10:34:29.195471-08', 'Welcome!', NULL, '2026-02-04 18:42:20.385', true, NULL, '740ca358da4744f6880f15373c130b9f', '2026-02-04 18:35:00.092043', 'low');
INSERT INTO public.notification VALUES (1763, 'likes', '4 people liked your comment: I think this is a good question.', '/forum/post/15?replyId=234', NULL, '2026-01-16 16:50:14.686694-08', '2026-01-17 04:57:39.720807-08', 7, NULL, 'forum_like:comment:234', 4, NULL, '2026-01-16 16:50:14.686694-08', 'I think this is a good question.', NULL, '2026-01-17 00:50:19.407', true, NULL, 'c0d618c2c7d041438dd0a9a84a074e62', '2026-01-17 00:51:00.022556', 'low');
INSERT INTO public.notification VALUES (1428, 'likes', '4 people liked your completion of: Read the Alliance’s recent progress update', '/actions/66/activity/1160', NULL, '2026-01-13 18:48:43.598171-08', '2026-01-17 04:58:05.011619-08', 7, NULL, 'activity_like:1160', 4, NULL, '2026-01-13 18:48:43.598171-08', 'Read the Alliance’s recent progress update', NULL, '2026-01-14 02:55:21.283', true, NULL, 'd9855de6f5f644bdb36a33f4913fd3cb', '2026-01-14 02:49:00.134404', 'low');
INSERT INTO public.notification VALUES (1871, 'likes', 'Luka Waland liked your completion of: Collect unclaimed property for a potential future donation', '/actions/70/activity/1289', NULL, '2026-01-23 08:25:14.911808-08', '2026-01-23 09:55:31.582433-08', 10, NULL, 'activity_like:1289', 1, NULL, '2026-01-23 08:25:14.911808-08', 'Collect unclaimed property for a potential future donation', NULL, '2026-01-23 17:55:31.582', true, NULL, '4eef26b65a964eba91561138ea98a481', '2026-01-23 16:26:00.087765', 'low');
INSERT INTO public.notification VALUES (1672, 'likes', '3 people liked your completion of: Ask experts questions about the recent US withdrawal from international institutions', '/actions/62/activity/1223', NULL, '2026-01-14 20:48:57.035079-08', '2026-01-17 09:09:05.008843-08', 23, NULL, 'activity_like:1223', 3, NULL, '2026-01-14 20:48:57.035079-08', 'Ask experts questions about the recent US withdrawal from international institutions', NULL, '2026-01-17 17:09:05.008', true, NULL, '7d841588303c4c0383f7377fa3b76a59', '2026-01-15 04:49:00.011924', 'low');
INSERT INTO public.notification VALUES (1671, 'likes', '3 people liked your completion of: Ask experts questions about the recent US withdrawal from international institutions', '/actions/62/activity/1221', NULL, '2026-01-14 20:48:56.927282-08', '2026-01-21 17:48:45.299907-08', 11, NULL, 'activity_like:1221', 3, NULL, '2026-01-14 20:48:56.927282-08', 'Ask experts questions about the recent US withdrawal from international institutions', NULL, '2026-01-22 01:48:45.3', true, NULL, '7d841588303c4c0383f7377fa3b76a59', '2026-01-15 04:49:00.011924', 'low');
INSERT INTO public.notification VALUES (1901, 'friend_request_accepted', 'Alex Hockett accepted your friend request', '/member/127', NULL, '2026-01-26 20:54:11.94219-08', '2026-01-26 20:55:03.662022-08', 10, NULL, NULL, NULL, NULL, '2026-01-26 20:54:11.94219-08', NULL, NULL, '2026-01-27 04:55:03.661', true, NULL, '309aed8920e6453daadec39943685036', '2026-01-27 04:55:00.233588', 'low');
INSERT INTO public.notification VALUES (1678, 'friend_request_accepted', 'Laurence POLLIER accepted your friend request', '/member/118', NULL, '2026-01-15 00:25:54.70574-08', '2026-01-15 08:52:48.267502-08', 10, NULL, NULL, NULL, NULL, '2026-01-15 00:25:54.70574-08', NULL, NULL, '2026-01-15 16:52:48.267', true, NULL, 'd2aedfdb201a487bb52db652e1a9e27d', '2026-01-15 08:26:00.004102', 'low');
INSERT INTO public.notification VALUES (1824, 'likes', 'Mark Xu liked your completion of: Collect unclaimed property for a potential future donation', '/actions/70/activity/1287', NULL, '2026-01-21 18:06:35.203753-08', '2026-01-21 18:06:35.203753-08', 11, NULL, 'activity_like:1287', 1, NULL, '2026-01-21 18:06:35.203753-08', 'Collect unclaimed property for a potential future donation', NULL, NULL, true, NULL, '19a83e0d8e774361a5fd84cbdd9a5e08', '2026-01-22 02:07:00.11944', 'low');
INSERT INTO public.notification VALUES (2186, 'likes', '2 people liked your completion of: Contribute to a discussion about Alliance culture', '/actions/71/activity/1376', NULL, '2026-01-28 22:32:37.795507-08', '2026-01-31 08:18:04.83096-08', 10, NULL, 'activity_like:1376', 2, NULL, '2026-01-28 22:32:37.795507-08', 'Contribute to a discussion about Alliance culture', NULL, '2026-01-29 06:39:43.822', true, NULL, '4ee84e673c9043eebb00d92a0544c970', '2026-01-29 06:33:00.120213', 'low');
INSERT INTO public.notification VALUES (1553, 'likes', 'Bryan Xu liked your comment: https://www.cgdev.org/blog/has-china-really-provided-more-climate-finance-developing-countries-us', '/forum/post/15?replyId=203', NULL, '2026-01-14 11:03:40.835426-08', '2026-01-14 11:04:41.7607-08', 7, NULL, 'forum_like:comment:203', 1, NULL, '2026-01-14 11:03:40.835426-08', 'https://www.cgdev.org/blog/has-china-really-provided-more-climate-finance-developing-countries-us', NULL, '2026-01-14 19:04:41.76', true, NULL, '9838a602dc1d4695bc0e0b4a81547b28', '2026-01-14 19:04:00.134106', 'low');
INSERT INTO public.notification VALUES (2166, 'friend_request', 'Tegan Fleishman wants to be friends', '/member/132', NULL, '2026-01-28 20:46:17.894733-08', '2026-01-28 22:20:54.383123-08', 7, NULL, NULL, NULL, NULL, '2026-01-28 20:46:17.894733-08', NULL, NULL, '2026-01-29 06:20:54.383', true, NULL, 'ee598e5081054cf3ae060629361fb4c5', '2026-01-29 04:47:00.135595', 'high');
INSERT INTO public.notification VALUES (1427, 'likes', '2 people liked your comment: I am curious to better understand the discourse that happened on the Iraqi side during and after the US invasion of Iraq in 2003. What sorts of decisions was the Iraqi government contemplating? What did negotiations with the US look like? What were some of the priorities the Iraqi govenrment was trying to balance?', '/forum/post/15?replyId=171', NULL, '2026-01-13 18:48:13.349928-08', '2026-01-16 21:49:03.006216-08', 23, NULL, 'forum_like:comment:171', 2, NULL, '2026-01-13 18:48:13.349928-08', 'I am curious to better understand the discourse that happened on the Iraqi side during and after the US invasion of Iraq in 2003. What sorts of decisions was the Iraqi government contemplating? What did negotiations with the US look like? What were some of the priorities the Iraqi govenrment was trying to balance?', NULL, '2026-01-15 00:53:48.973', true, NULL, 'd9855de6f5f644bdb36a33f4913fd3cb', '2026-01-14 02:49:00.134404', 'low');
INSERT INTO public.notification VALUES (1789, 'likes', 'Mark Xu liked your completion of: Properly dispose of the e-waste you collected', '/actions/64/activity/1260', NULL, '2026-01-18 18:56:16.839024-08', '2026-01-18 18:56:16.839024-08', 24, NULL, 'activity_like:1260', 1, NULL, '2026-01-18 18:56:16.839024-08', 'Properly dispose of the e-waste you collected', NULL, NULL, true, NULL, 'f4d1c7e344c34834b62532d8459f606b', '2026-01-19 02:57:00.122011', 'low');
INSERT INTO public.notification VALUES (1790, 'likes', 'Mark Xu liked your completion of: Read the Alliance’s recent progress update', '/actions/66/activity/1259', NULL, '2026-01-18 18:56:17.403916-08', '2026-01-18 18:56:17.403916-08', 23, NULL, 'activity_like:1259', 1, NULL, '2026-01-18 18:56:17.403916-08', 'Read the Alliance’s recent progress update', NULL, NULL, true, NULL, 'f4d1c7e344c34834b62532d8459f606b', '2026-01-19 02:57:00.122011', 'low');
INSERT INTO public.notification VALUES (1426, 'likes', '2 people liked your comment: What is the general attitude that Iraqis have (and had at the time) to the US invasion? I imagine they have been quite negative, but it would be nice to put more color to that description in my head.

I would also be interested to better understand how the general attitude towards the US invasion has changed over time.', '/forum/post/15?replyId=172', NULL, '2026-01-13 18:48:12.75784-08', '2026-01-16 21:49:04.019236-08', 23, NULL, 'forum_like:comment:172', 2, NULL, '2026-01-13 18:48:12.75784-08', 'What is the general attitude that Iraqis have (and had at the time) to the US invasion? I imagine they have been quite negative, but it would be nice to put more color to that description in my head.

I would also be interested to better understand how the general attitude towards the US invasion has changed over time.', NULL, '2026-01-15 04:21:30.35', true, NULL, 'd9855de6f5f644bdb36a33f4913fd3cb', '2026-01-14 02:49:00.134404', 'low');
INSERT INTO public.notification VALUES (1765, 'likes', 'Mark Xu liked your comment: To what extent can the EU''s weakening of ambition be attributed to the US vs. its own societies and politics (which are themselves, of course, influenced to some degree by the US)?', '/forum/post/15?replyId=202', NULL, '2026-01-16 16:50:51.542751-08', '2026-01-16 19:43:28.304207-08', 7, NULL, 'forum_like:comment:202', 1, NULL, '2026-01-16 16:50:51.542751-08', 'To what extent can the EU''s weakening of ambition be attributed to the US vs. its own societies and politics (which are themselves, of course, influenced to some degree by the US)?', NULL, '2026-01-17 03:43:28.303', true, NULL, 'c0d618c2c7d041438dd0a9a84a074e62', '2026-01-17 00:51:00.022556', 'low');
INSERT INTO public.notification VALUES (2524, 'likes', 'Mark Xu liked your completion of: Contribute to a discussion about Alliance culture', '/actions/71/activity/1426', NULL, '2026-02-04 16:17:16.538397-08', '2026-02-05 10:08:12.344762-08', 15, NULL, 'activity_like:1426', 1, NULL, '2026-02-04 16:17:16.538397-08', 'Contribute to a discussion about Alliance culture', NULL, '2026-02-05 18:08:12.344', true, NULL, 'df3dfc85b03841ff9afcb818ba579e64', '2026-02-05 00:18:00.18027', 'low');
INSERT INTO public.notification VALUES (1808, 'likes', 'Mark Xu liked your comment: Yes, maybe not commercially viable, but perhaps still a worthwhile public service. It was interesting to hear from European members about ease of drop-off in Slovenia, Switzerland, etc. Sounded like some combination of walkability in those places and more standardized/ubiquitous/efficient waste collection systems.', '/actions/64?replyId=243', NULL, '2026-01-19 10:50:32.648519-08', '2026-01-19 11:20:03.244541-08', 7, NULL, 'forum_like:comment:243', 1, NULL, '2026-01-19 10:50:32.648519-08', 'Yes, maybe not commercially viable, but perhaps still a worthwhile public service. It was interesting to hear from European members about ease of drop-off in Slovenia, Switzerland, etc. Sounded like some combination of walkability in those places and more standardized/ubiquitous/efficient waste collection systems.', NULL, '2026-01-19 19:20:03.244', true, NULL, 'd62390e4ea0643d583be112affc73bc0', '2026-01-19 18:51:00.134456', 'low');
INSERT INTO public.notification VALUES (2152, 'likes', 'Mark Xu liked your completion of: Collect unclaimed property for a potential future donation', '/actions/70/activity/1361', NULL, '2026-01-28 19:03:47.514016-08', '2026-01-28 19:03:47.514016-08', 24, NULL, 'activity_like:1361', 1, NULL, '2026-01-28 19:03:47.514016-08', 'Collect unclaimed property for a potential future donation', NULL, NULL, true, NULL, '61d6b7c77fdf486cbb3eb9e1e17610d5', '2026-01-29 03:04:00.007458', 'low');
INSERT INTO public.notification VALUES (2168, 'friend_request_accepted', 'Selina Kim accepted your friend request', '/member/124', NULL, '2026-01-28 20:50:07.66315-08', '2026-01-28 21:59:36.835621-08', 10, NULL, NULL, NULL, NULL, '2026-01-28 20:50:07.66315-08', NULL, NULL, '2026-01-29 05:59:36.835', true, NULL, '83166275f6d94386a027e8c647379c14', '2026-01-29 04:51:00.146026', 'low');
INSERT INTO public.notification VALUES (1831, 'likes', '2 people liked your completion of: Collect unclaimed property for a potential future donation', '/actions/70/activity/1296', NULL, '2026-01-21 19:57:37.777091-08', '2026-01-23 08:25:15.514937-08', 7, NULL, 'activity_like:1296', 2, NULL, '2026-01-21 19:57:37.777091-08', 'Collect unclaimed property for a potential future donation', NULL, '2026-01-22 04:03:41.811', true, NULL, '189f054bd71e4ccfba43850ec7f7212c', '2026-01-22 03:58:00.013496', 'low');
INSERT INTO public.notification VALUES (1501, 'likes', 'Luka Waland liked your comment: thanks for pointing that out! (and sorry for the late reply, we dont have good notifs set up for this yet). putting the full number including international prefix should work fine and is exactly what we expect, but we should definitely add a comment clarifying. let us know if you don''t end up getting text notifications or if something goes wrong though!', '/actions/10?replyId=163', NULL, '2026-01-14 06:22:29.992681-08', '2026-01-18 19:18:43.044966-08', 15, NULL, 'forum_like:comment:163', 1, NULL, '2026-01-14 06:22:29.992681-08', 'thanks for pointing that out! (and sorry for the late reply, we dont have good notifs set up for this yet). putting the full number including international prefix should work fine and is exactly what we expect, but we should definitely add a comment clarifying. let us know if you don''t end up getting text notifications or if something goes wrong though!', NULL, '2026-01-19 03:18:43.045', true, NULL, '6cd2dfcc6a8443deb4cbf6701116b5bb', '2026-01-14 14:23:00.105941', 'low');
INSERT INTO public.notification VALUES (1820, 'likes', '2 people liked your comment: Katherine, I thought Mark Carney''s WEF speech was relevant: [https://www.weforum.org/stories/2026/01/davos-2026-special-address-by-mark-carney-prime-minister-of-canada/](https://www.weforum.org/stories/2026/01/davos-2026-special-address-by-mark-carney-prime-minister-of-canada/)', '/forum/post/15?replyId=244', NULL, '2026-01-21 10:51:54.623206-08', '2026-01-22 18:25:20.076898-08', 7, NULL, 'forum_like:comment:244', 2, NULL, '2026-01-21 10:51:54.623206-08', 'Katherine, I thought Mark Carney''s WEF speech was relevant: [https://www.weforum.org/stories/2026/01/davos-2026-special-address-by-mark-carney-prime-minister-of-canada/](https://www.weforum.org/stories/2026/01/davos-2026-special-address-by-mark-carney-prime-minister-of-canada/)', NULL, '2026-01-21 19:12:53.079', true, NULL, '484abec9daea47df9ee1426ffc1a4f33', '2026-01-21 18:52:00.157734', 'low');
INSERT INTO public.notification VALUES (2114, 'friend_request_accepted', 'Logan Gecils accepted your friend request', '/member/95', NULL, '2026-01-27 12:47:59.811734-08', '2026-01-27 13:28:32.979933-08', 7, NULL, NULL, NULL, NULL, '2026-01-27 12:47:59.811734-08', NULL, NULL, '2026-01-27 21:28:32.98', true, NULL, 'd7d387c316644016b11dd4aaa8d2269b', '2026-01-27 20:48:00.001562', 'low');
INSERT INTO public.notification VALUES (2150, 'likes', 'Nathan Tang liked your comment: Welcome!', '/actions/11/activity/1356?replyId=256', NULL, '2026-01-28 16:46:31.837709-08', '2026-01-28 17:08:08.694154-08', 10, NULL, 'forum_like:comment:256', 1, NULL, '2026-01-28 16:46:31.837709-08', 'Welcome!', NULL, '2026-01-29 01:08:08.694', true, NULL, 'bbb01ebaaf0342638812cee1d0e03560', '2026-01-29 00:47:00.128755', 'low');
INSERT INTO public.notification VALUES (2225, 'likes', '3 people liked your completion of: Contribute to a discussion about Alliance culture', '/actions/71/activity/1383', NULL, '2026-01-29 22:12:56.02913-08', '2026-02-03 15:11:20.248654-08', 11, NULL, 'activity_like:1383', 3, NULL, '2026-01-29 22:12:56.02913-08', 'Contribute to a discussion about Alliance culture', NULL, NULL, true, NULL, '990f049a0a8344a6bac7bb73c74335e7', '2026-01-30 06:13:00.012481', 'low');
INSERT INTO public.notification VALUES (2192, 'likes', 'Julian Lang liked your post: Expert Q&A on U.S. withdrawal from international institutions', '/forum/post/15', NULL, '2026-01-29 04:26:40.696203-08', '2026-01-29 07:24:26.413019-08', 7, NULL, 'forum_like:post:15:user:7', 1, NULL, '2026-01-29 04:26:40.696203-08', 'Expert Q&A on U.S. withdrawal from international institutions', NULL, '2026-01-29 15:24:26.412', true, NULL, 'fe0b432d756c450997a7b9ca34d0e6a9', '2026-01-29 12:27:00.12498', 'low');
INSERT INTO public.notification VALUES (2208, 'friend_request', 'Alex Hockett wants to be friends', '/member/127', NULL, '2026-01-29 16:55:21.389523-08', '2026-01-29 16:55:21.389523-08', 11, NULL, NULL, NULL, NULL, '2026-01-29 16:55:21.389523-08', NULL, NULL, NULL, true, NULL, 'c4ccd66163ab41049f994111e7de507c', '2026-01-30 00:56:00.026867', 'high');
INSERT INTO public.notification VALUES (2179, 'likes', '2 people liked your completion of: Contribute to a discussion about Alliance culture', '/actions/71/activity/1375', NULL, '2026-01-28 22:23:50.643874-08', '2026-01-31 08:18:05.481141-08', 7, NULL, 'activity_like:1375', 2, NULL, '2026-01-28 22:23:50.643874-08', 'Contribute to a discussion about Alliance culture', NULL, '2026-01-29 06:32:32.008', true, NULL, 'f6a83532972d4d0d83260207e28b91c5', '2026-01-29 06:24:00.014041', 'low');
INSERT INTO public.notification VALUES (2420, 'likes', 'Mark Xu liked your comment: Agreed. We will also retain the withdrawal option specified in the contract to accommodate cases of significant deviation.', '/forum/post/16?replyId=288', NULL, '2026-02-02 14:50:47.330693-08', '2026-02-02 14:58:45.831443-08', 7, NULL, 'forum_like:comment:288', 1, NULL, '2026-02-02 14:50:47.330693-08', 'Agreed. We will also retain the withdrawal option specified in the contract to accommodate cases of significant deviation.', NULL, '2026-02-02 22:58:45.83', true, NULL, '8b2d553dee47431ea2d1dd46932a973c', '2026-02-02 22:51:00.031423', 'low');
INSERT INTO public.notification VALUES (1958, 'action_update', 'Our AI privacy survey was featured on the homepage of Digiday', '/actions/56', '/actions/56', '2026-01-27 09:57:20.56491-08', '2026-01-27 09:57:27.843522-08', 7, 10, NULL, NULL, NULL, '2026-01-27 09:55:00-08', NULL, NULL, '2026-01-27 17:57:27.844', true, NULL, 'c01b08e52f7648efbc99172809551086', '2026-01-27 17:58:00.135412', 'high');
INSERT INTO public.notification VALUES (2426, 'likes', '2 people liked your comment: > Getting gratification out of external reasons, rather than simply acting out of a want to do good, often times leads to a slow and gradual goal misalignment [in my opinion].

> It serves as a filter - the people who join the Alliance do so purely out of wanting to contribute to its goals, not for any other reason.

Mark and I agree. It''s helpful to hear that others share this sentiment.', '/forum/post/16?replyId=273', NULL, '2026-02-02 21:19:27.691904-08', '2026-02-03 02:21:06.381088-08', 7, NULL, 'forum_like:comment:273', 2, NULL, '2026-02-02 21:19:27.691904-08', '> Getting gratification out of external reasons, rather than simply acting out of a want to do good, often times leads to a slow and gradual goal misalignment [in my opinion].

> It serves as a filter - the people who join the Alliance do so purely out of wanting to contribute to its goals, not for any other reason.

Mark and I agree. It''s helpful to hear that others share this sentiment.', NULL, '2026-02-03 05:21:12.391', true, NULL, '9c782bb37a314c1fbdea008f9e671f34', '2026-02-03 05:20:00.102754', 'low');
INSERT INTO public.notification VALUES (2205, 'friend_request', 'Alex Hockett wants to be friends', '/member/127', NULL, '2026-01-29 13:58:32.109174-08', '2026-01-29 15:50:19.498186-08', 15, NULL, NULL, NULL, NULL, '2026-01-29 13:58:32.109174-08', NULL, NULL, '2026-01-29 23:50:19.497', true, NULL, '7cc7e8e9653a46a38af5bb6af4391ebc', '2026-01-29 21:59:00.037868', 'high');
INSERT INTO public.notification VALUES (2221, 'forum_reply', 'New reply from Grant Hough', '/forum/post/16?replyId=268', NULL, '2026-01-29 22:06:41.19706-08', '2026-01-29 22:07:20.162479-08', 7, NULL, NULL, NULL, 268, '2026-01-29 22:06:41.19706-08', NULL, NULL, '2026-01-30 06:07:20.162', true, NULL, '344b5985a70c4ecdad8dc3bbf08c2db5', '2026-01-30 06:07:00.118168', 'low');
INSERT INTO public.notification VALUES (2220, 'forum_reply', 'New reply from Grant Hough', '/forum/post/16?replyId=268', NULL, '2026-01-29 22:06:41.19706-08', '2026-01-29 22:07:21.350885-08', 10, NULL, NULL, NULL, 268, '2026-01-29 22:06:41.19706-08', NULL, NULL, '2026-01-30 06:07:21.351', true, NULL, '344b5985a70c4ecdad8dc3bbf08c2db5', '2026-01-30 06:07:00.118168', 'low');
INSERT INTO public.notification VALUES (2206, 'likes', '3 people liked your comment: > If we individually aim to converge on a solution during our discussions, we can start taking action sooner than if we spend our time on just discussion.

I''ve noticed that online discussions often become very general/abstract and turn into a debate about the validity of a general principle or class of actions. The generality of these debates makes them very difficult to resolve, especially in a timely manner. Your suggestion to focus discussion on topics/questions that are relevant for taking action could counteract that tendency.', '/forum/post/16?replyId=264', NULL, '2026-01-29 15:20:52.400731-08', '2026-01-31 13:45:49.450977-08', 10, NULL, 'forum_like:comment:264', 3, NULL, '2026-01-29 15:20:52.400731-08', '> If we individually aim to converge on a solution during our discussions, we can start taking action sooner than if we spend our time on just discussion.

I''ve noticed that online discussions often become very general/abstract and turn into a debate about the validity of a general principle or class of actions. The generality of these debates makes them very difficult to resolve, especially in a timely manner. Your suggestion to focus discussion on topics/questions that are relevant for taking action could counteract that tendency.', NULL, '2026-01-29 23:39:44.135', true, NULL, '144ef361fd794b6684f92364c7e5672b', '2026-01-29 23:21:00.135037', 'low');
INSERT INTO public.notification VALUES (2201, 'likes', '4 people liked your comment: "I think our community would be strengthened by having the opportunity to see more clearly and more easily reminders (and data) of the outcomes that have been produced by prior actions."

We are working on it! Right now, action updates that we send out are buried in notifications. We plan to display them more visibly on the homepage. You can also see past updates on the [Information page](https://worldalliance.org/information).', '/forum/post/16?replyId=263', NULL, '2026-01-29 10:49:29.25019-08', '2026-02-04 00:55:39.573203-08', 7, NULL, 'forum_like:comment:263', 4, NULL, '2026-01-29 10:49:29.25019-08', '"I think our community would be strengthened by having the opportunity to see more clearly and more easily reminders (and data) of the outcomes that have been produced by prior actions."

We are working on it! Right now, action updates that we send out are buried in notifications. We plan to display them more visibly on the homepage. You can also see past updates on the [Information page](https://worldalliance.org/information).', NULL, '2026-01-29 19:14:34.43', true, NULL, '5ba853cf819b4af8aa34c17c4bc686b1', '2026-01-29 18:50:00.129515', 'low');
INSERT INTO public.notification VALUES (2223, 'likes', '2 people liked your comment: Glad you liked the responses to the comment action.

Some responses to your thoughts: 
- We don''t feel qualified yet to give a "master plan" at such a level of specificity that it can be broken down into our current 15-minute tasks - in order to do this, we will need to build a very large team of experts, and hope to do so before we launch publicly.
- However, we can certainly paint in broad strokes our plan to get from where we are now to our launch, as well as explain how we expect to grow after our launch. We think the former will involve planned growth pushes via member invitations (we will be launching our first growth-oriented action next week!). We think the latter will involve member invitations but also a lot of spontaneous discovery. We plan on adding a nicer, more detailed roadmap to our [Information page](https://worldalliance.org/information) in the coming days.
- We do plan to improve our social features for those who want them (currently around 1/2 of members), as well as make action updates prettier and display them more prominently.
', '/forum/post/16?replyId=267', NULL, '2026-01-29 22:07:56.116951-08', '2026-01-31 07:10:52.724026-08', 7, NULL, 'forum_like:comment:267', 2, NULL, '2026-01-29 22:07:56.116951-08', 'Glad you liked the responses to the comment action.

Some responses to your thoughts: 
- We don''t feel qualified yet to give a "master plan" at such a level of specificity that it can be broken down into our current 15-minute tasks - in order to do this, we will need to build a very large team of experts, and hope to do so before we launch publicly.
- However, we can certainly paint in broad strokes our plan to get from where we are now to our launch, as well as explain how we expect to grow after our launch. We think the former will involve planned growth pushes via member invitations (we will be launching our first growth-oriented action next week!). We think the latter will involve member invitations but also a lot of spontaneous discovery. We plan on adding a nicer, more detailed roadmap to our [Information page](https://worldalliance.org/information) in the coming days.
- We do plan to improve our social features for those who want them (currently around 1/2 of members), as well as make action updates prettier and display them more prominently.
', NULL, '2026-01-30 06:25:13.298', true, NULL, 'eee8d73c260c4a23ba8a44096b602d37', '2026-01-30 06:08:00.021701', 'low');
INSERT INTO public.notification VALUES (2421, 'friend_request_accepted', 'Diane Tchuindjo accepted your friend request', '/member/128', NULL, '2026-02-02 16:08:20.754903-08', '2026-02-02 16:17:20.769395-08', 7, NULL, NULL, NULL, NULL, '2026-02-02 16:08:20.754903-08', NULL, NULL, '2026-02-03 00:17:20.769', true, NULL, '0e85bc5db9d74786b78ec2185d10d2e4', '2026-02-03 00:09:00.131345', 'low');
INSERT INTO public.notification VALUES (2253, 'action_update', 'Members expect to donate over $2,000 in unclaimed properties', '/actions/70', '/actions/70', '2026-01-30 13:12:06.56117-08', '2026-01-30 13:12:12.054277-08', 10, 12, NULL, NULL, NULL, '2026-01-30 13:12:00-08', NULL, NULL, '2026-01-30 21:12:12.055', true, NULL, 'f8e02136418c4b5da9737221e4dca0c4', '2026-01-30 21:13:00.140057', 'high');
INSERT INTO public.notification VALUES (2457, 'likes', '2 people liked your comment: I did a search on Cowspiracy and came across [Ninety Minutes to Reduce One''s Intention to Eat Meat: A Preliminary Experimental Investigation on the Effect of Watching the Cowspiracy Documentary on Intention to Reduce Meat Consumption](https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2020.00069/full)—seems like a pretty influential documentary.

In the future, it would be neat to use Alliance actions to try to measure the helpfulness of this sort of education.', '/forum/post/16?replyId=296', NULL, '2026-02-03 19:53:47.272543-08', '2026-02-03 21:37:10.15021-08', 7, NULL, 'forum_like:comment:296', 2, NULL, '2026-02-03 19:53:47.272543-08', 'I did a search on Cowspiracy and came across [Ninety Minutes to Reduce One''s Intention to Eat Meat: A Preliminary Experimental Investigation on the Effect of Watching the Cowspiracy Documentary on Intention to Reduce Meat Consumption](https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2020.00069/full)—seems like a pretty influential documentary.

In the future, it would be neat to use Alliance actions to try to measure the helpfulness of this sort of education.', NULL, '2026-02-04 03:57:41.29', true, NULL, 'cbad3378ec784a8285848e4dc425b68a', '2026-02-04 03:54:00.124792', 'low');
INSERT INTO public.notification VALUES (2492, 'likes', '4 people liked your comment: Yes, it would be great if members wanted to pitch ideas. We plan to develop a better process for this, but in the meantime, please feel free to email us: [contact@worldalliance.org](mailto:contact@worldalliance.org).', '/forum/post/16?replyId=307', NULL, '2026-02-04 09:49:16.753972-08', '2026-02-05 10:08:22.254837-08', 7, NULL, 'forum_like:comment:307', 4, NULL, '2026-02-04 09:49:16.753972-08', 'Yes, it would be great if members wanted to pitch ideas. We plan to develop a better process for this, but in the meantime, please feel free to email us: [contact@worldalliance.org](mailto:contact@worldalliance.org).', NULL, '2026-02-04 18:25:19.449', true, NULL, '15859a9626a743ca8d6922acbac3d602', '2026-02-04 17:50:00.221583', 'low');
INSERT INTO public.notification VALUES (691, 'action_update', 'Our bring-your-own-cup cafe coalition received media coverage', '/actions/14', '/actions/14', '2025-12-08 15:52:34.963571-08', '2025-12-15 15:59:15.98195-08', 7, 5, NULL, NULL, NULL, '2025-12-08 15:52:00-08', NULL, NULL, '2025-12-15 23:59:15.981', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (1334, 'action_update', 'Our external survey found that most friends and family do not want their data used for AI training', '/actions/56', '/actions/56', '2026-01-12 18:22:24.361547-08', '2026-01-12 18:36:39.951444-08', 24, 8, NULL, NULL, NULL, '2026-01-12 18:22:00-08', NULL, NULL, '2026-01-13 02:36:39.947', true, NULL, '01d6c3dc55f245b0ac453900903d05cb', '2026-01-13 02:23:00.159916', 'high');
INSERT INTO public.notification VALUES (1294, 'action_update', 'Our external survey found that most friends and family do not want their data used for AI training', '/actions/56', '/actions/56', '2026-01-12 18:22:24.215639-08', '2026-01-12 19:11:13.782509-08', 11, 8, NULL, NULL, NULL, '2026-01-12 18:22:00-08', NULL, NULL, '2026-01-13 03:11:13.781', true, NULL, '01d6c3dc55f245b0ac453900903d05cb', '2026-01-13 02:23:00.159916', 'high');
INSERT INTO public.notification VALUES (560, 'action_update', 'We processed the results of the member survey', '/actions/51', '/actions/51', '2025-12-03 10:02:04.185166-08', '2025-12-03 10:02:04.185166-08', 11, 4, NULL, NULL, NULL, '2025-12-03 10:02:00-08', NULL, NULL, NULL, false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (648, 'action_update', 'Our bring-your-own-cup cafe coalition received media coverage', '/actions/14', '/actions/14', '2025-12-08 15:52:34.808456-08', '2025-12-08 15:52:34.808456-08', 11, 5, NULL, NULL, NULL, '2025-12-08 15:52:00-08', NULL, NULL, NULL, false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (689, 'action_update', 'Our bring-your-own-cup cafe coalition received media coverage', '/actions/14', '/actions/14', '2025-12-08 15:52:34.95614-08', '2026-01-09 09:32:59.56943-08', 24, 5, NULL, NULL, NULL, '2025-12-08 15:52:00-08', NULL, NULL, '2026-01-09 17:32:59.568', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (730, 'action_update', 'Nonprofits responded positively to our compiled website feedback', '/actions/32', '/actions/32', '2025-12-09 11:36:44.180574-08', '2025-12-10 19:16:50.884215-08', 11, 6, NULL, NULL, NULL, '2025-12-09 11:35:35.966-08', NULL, NULL, '2025-12-11 03:16:50.864', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (771, 'action_update', 'Nonprofits responded positively to our compiled website feedback', '/actions/32', '/actions/32', '2025-12-09 11:36:44.328494-08', '2026-01-09 09:32:59.56943-08', 24, 6, NULL, NULL, NULL, '2025-12-09 11:35:35.966-08', NULL, NULL, '2026-01-09 17:32:59.568', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (762, 'action_update', 'Nonprofits responded positively to our compiled website feedback', '/actions/32', '/actions/32', '2025-12-09 11:36:44.298051-08', '2025-12-09 16:12:58.913817-08', 15, 6, NULL, NULL, NULL, '2025-12-09 11:35:35.966-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (772, 'action_update', 'Nonprofits responded positively to our compiled website feedback', '/actions/32', '/actions/32', '2025-12-09 11:36:44.33377-08', '2025-12-09 11:36:56.043448-08', 10, 6, NULL, NULL, NULL, '2025-12-09 11:35:35.966-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (773, 'action_update', 'Nonprofits responded positively to our compiled website feedback', '/actions/32', '/actions/32', '2025-12-09 11:36:44.337022-08', '2025-12-22 11:24:08.577904-08', 7, 6, NULL, NULL, NULL, '2025-12-09 11:35:35.966-08', NULL, NULL, '2025-12-22 19:24:08.578', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (883, 'action_update', 'Our survey found that most members do not want their data used for AI training', '/actions/52', '/actions/52', '2025-12-15 21:25:01.445355-08', '2025-12-15 21:25:01.445355-08', 11, 7, NULL, NULL, NULL, '2025-12-15 21:24:00-08', NULL, NULL, NULL, false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (748, 'action_update', 'Nonprofits responded positively to our compiled website feedback', '/actions/32', '/actions/32', '2025-12-09 11:36:44.246642-08', '2026-01-06 14:17:54.969218-08', 23, 6, NULL, NULL, NULL, '2025-12-09 11:35:35.966-08', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (882, 'action_update', 'Our survey found that most members do not want their data used for AI training', '/actions/52', '/actions/52', '2025-12-15 21:25:01.442197-08', '2026-01-06 14:17:54.969218-08', 23, 7, NULL, NULL, NULL, '2025-12-15 21:24:00-08', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (413, 'action_update', 'We allocated $1,000 to Cool Earth and GiveDirectly', '/actions/49', '/actions/49', '2025-11-23 14:12:27.617149-08', '2025-12-08 16:05:39.253541-08', 11, 2, NULL, NULL, NULL, '2025-11-23 14:06:50.124-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (428, 'action_update', 'We allocated $1,000 to Cool Earth and GiveDirectly', '/actions/49', '/actions/49', '2025-11-23 14:12:27.693154-08', '2025-11-24 17:15:13.612547-08', 24, 2, NULL, NULL, NULL, '2025-11-23 14:06:50.124-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (420, 'action_update', 'We allocated $1,000 to Cool Earth and GiveDirectly', '/actions/49', '/actions/49', '2025-11-23 14:12:27.659712-08', '2025-12-01 15:04:11.953672-08', 10, 2, NULL, NULL, NULL, '2025-11-23 14:06:50.124-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (424, 'action_update', 'We allocated $1,000 to Cool Earth and GiveDirectly', '/actions/49', '/actions/49', '2025-11-23 14:12:27.676704-08', '2025-12-02 11:16:42.045887-08', 15, 2, NULL, NULL, NULL, '2025-11-23 14:06:50.124-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (495, 'action_update', 'We reported 19 potholes and 1 crumbling wall', '/actions/50', '/actions/50', '2025-11-26 11:43:02.041861-08', '2025-12-04 18:25:22.224487-08', 24, 3, NULL, NULL, NULL, '2025-11-26 11:43:00-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (488, 'action_update', 'We reported 19 potholes and 1 crumbling wall', '/actions/50', '/actions/50', '2025-11-26 11:43:01.992817-08', '2025-11-29 22:41:06.960926-08', 10, 3, NULL, NULL, NULL, '2025-11-26 11:43:00-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (492, 'action_update', 'We reported 19 potholes and 1 crumbling wall', '/actions/50', '/actions/50', '2025-11-26 11:43:02.014004-08', '2025-12-02 11:16:15.359165-08', 15, 3, NULL, NULL, NULL, '2025-11-26 11:43:00-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (481, 'action_update', 'We reported 19 potholes and 1 crumbling wall', '/actions/50', '/actions/50', '2025-11-26 11:43:01.914253-08', '2025-12-08 16:05:52.971165-08', 11, 3, NULL, NULL, NULL, '2025-11-26 11:43:00-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (444, 'action_update', 'We allocated $1,000 to Cool Earth and GiveDirectly', '/actions/49', '/actions/49', '2025-11-23 14:12:27.756815-08', '2026-01-06 14:17:54.969218-08', 23, 2, NULL, NULL, NULL, '2025-11-23 14:06:50.124-08', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (515, 'action_update', 'We reported 19 potholes and 1 crumbling wall', '/actions/50', '/actions/50', '2025-11-26 11:43:02.126441-08', '2025-12-07 11:15:03.377882-08', 7, 3, NULL, NULL, NULL, '2025-11-26 11:43:00-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (449, 'action_update', 'We allocated $1,000 to Cool Earth and GiveDirectly', '/actions/49', '/actions/49', '2025-11-23 14:12:27.77469-08', '2025-12-04 13:27:43.482475-08', 7, 2, NULL, NULL, NULL, '2025-11-23 14:06:50.124-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (602, 'action_update', 'We processed the results of the member survey', '/actions/51', '/actions/51', '2025-12-03 10:02:04.371249-08', '2025-12-03 10:56:12.081751-08', 10, 4, NULL, NULL, NULL, '2025-12-03 10:02:00-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (595, 'action_update', 'We processed the results of the member survey', '/actions/51', '/actions/51', '2025-12-03 10:02:04.350431-08', '2025-12-04 13:25:45.229975-08', 15, 4, NULL, NULL, NULL, '2025-12-03 10:02:00-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (601, 'action_update', 'We processed the results of the member survey', '/actions/51', '/actions/51', '2025-12-03 10:02:04.368635-08', '2025-12-04 18:24:29.352759-08', 24, 4, NULL, NULL, NULL, '2025-12-03 10:02:00-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (690, 'action_update', 'Our bring-your-own-cup cafe coalition received media coverage', '/actions/14', '/actions/14', '2025-12-08 15:52:34.95973-08', '2025-12-08 17:46:31.547947-08', 10, 5, NULL, NULL, NULL, '2025-12-08 15:52:00-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (683, 'action_update', 'Our bring-your-own-cup cafe coalition received media coverage', '/actions/14', '/actions/14', '2025-12-08 15:52:34.93727-08', '2025-12-09 09:35:26.658111-08', 15, 5, NULL, NULL, NULL, '2025-12-08 15:52:00-08', NULL, NULL, '2025-12-11 03:12:31.344327', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (510, 'action_update', 'We reported 19 potholes and 1 crumbling wall', '/actions/50', '/actions/50', '2025-11-26 11:43:02.103486-08', '2026-01-06 14:17:54.969218-08', 23, 3, NULL, NULL, NULL, '2025-11-26 11:43:00-08', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (578, 'action_update', 'We processed the results of the member survey', '/actions/51', '/actions/51', '2025-12-03 10:02:04.238577-08', '2026-01-06 14:17:54.969218-08', 23, 4, NULL, NULL, NULL, '2025-12-03 10:02:00-08', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (666, 'action_update', 'Our bring-your-own-cup cafe coalition received media coverage', '/actions/14', '/actions/14', '2025-12-08 15:52:34.874002-08', '2026-01-06 14:17:54.969218-08', 23, 5, NULL, NULL, NULL, '2025-12-08 15:52:00-08', NULL, NULL, '2026-01-06 22:17:53.725', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (907, 'action_update', 'Our survey found that most members do not want their data used for AI training', '/actions/52', '/actions/52', '2025-12-15 21:25:01.730317-08', '2025-12-22 11:24:02.89772-08', 7, 7, NULL, NULL, NULL, '2025-12-15 21:24:00-08', NULL, NULL, '2025-12-22 19:24:02.897', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (906, 'action_update', 'Our survey found that most members do not want their data used for AI training', '/actions/52', '/actions/52', '2025-12-15 21:25:01.718995-08', '2026-01-06 14:11:33.133004-08', 10, 7, NULL, NULL, NULL, '2025-12-15 21:24:00-08', NULL, NULL, '2026-01-06 22:11:33.133', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (896, 'action_update', 'Our survey found that most members do not want their data used for AI training', '/actions/52', '/actions/52', '2025-12-15 21:25:01.545879-08', '2025-12-17 16:09:20.195125-08', 15, 7, NULL, NULL, NULL, '2025-12-15 21:24:00-08', NULL, NULL, '2025-12-18 00:09:20.193', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (915, 'action_update', 'Our survey found that most members do not want their data used for AI training', '/actions/52', '/actions/52', '2025-12-15 21:25:01.818801-08', '2026-01-09 09:32:59.56943-08', 24, 7, NULL, NULL, NULL, '2025-12-15 21:24:00-08', NULL, NULL, '2026-01-09 17:32:59.568', false, NULL, NULL, NULL, 'high');
INSERT INTO public.notification VALUES (1301, 'action_update', 'Our external survey found that most friends and family do not want their data used for AI training', '/actions/56', '/actions/56', '2026-01-12 18:22:24.238448-08', '2026-01-13 11:41:09.522337-08', 23, 8, NULL, NULL, NULL, '2026-01-12 18:22:00-08', NULL, NULL, '2026-01-13 19:41:09.522', true, NULL, '01d6c3dc55f245b0ac453900903d05cb', '2026-01-13 02:23:00.159916', 'high');
INSERT INTO public.notification VALUES (1305, 'action_update', 'Our external survey found that most friends and family do not want their data used for AI training', '/actions/56', '/actions/56', '2026-01-12 18:22:24.25145-08', '2026-01-18 19:18:34.593035-08', 15, 8, NULL, NULL, NULL, '2026-01-12 18:22:00-08', NULL, NULL, '2026-01-19 03:18:34.593', true, NULL, '01d6c3dc55f245b0ac453900903d05cb', '2026-01-13 02:23:00.159916', 'high');
INSERT INTO public.notification VALUES (1320, 'action_update', 'Our external survey found that most friends and family do not want their data used for AI training', '/actions/56', '/actions/56', '2026-01-12 18:22:24.306174-08', '2026-01-12 19:07:50.447827-08', 10, 8, NULL, NULL, NULL, '2026-01-12 18:22:00-08', NULL, NULL, '2026-01-13 03:07:50.446', true, NULL, '01d6c3dc55f245b0ac453900903d05cb', '2026-01-13 02:23:00.159916', 'high');
INSERT INTO public.notification VALUES (1333, 'action_update', 'Our external survey found that most friends and family do not want their data used for AI training', '/actions/56', '/actions/56', '2026-01-12 18:22:24.358524-08', '2026-01-12 18:22:35.735567-08', 7, 8, NULL, NULL, NULL, '2026-01-12 18:22:00-08', NULL, NULL, '2026-01-13 02:22:35.734', true, NULL, '01d6c3dc55f245b0ac453900903d05cb', '2026-01-13 02:23:00.159916', 'high');
INSERT INTO public.notification VALUES (1599, 'action_update', 'Members collected 57 kg (126 lbs) of e-waste.', '/actions/60', '/actions/60', '2026-01-14 11:17:22.67029-08', '2026-01-14 11:17:28.490568-08', 10, 9, NULL, NULL, NULL, '2026-01-14 11:16:59.456-08', NULL, NULL, '2026-01-14 19:17:28.49', true, NULL, 'dcf389da6b2f4469a72c01766fa363d9', '2026-01-14 19:18:00.122075', 'high');
INSERT INTO public.notification VALUES (1603, 'action_update', 'Members collected 57 kg (126 lbs) of e-waste.', '/actions/60', '/actions/60', '2026-01-14 11:17:22.684785-08', '2026-01-14 18:02:48.46496-08', 24, 9, NULL, NULL, NULL, '2026-01-14 11:16:59.456-08', NULL, NULL, '2026-01-15 02:02:48.464', true, NULL, 'dcf389da6b2f4469a72c01766fa363d9', '2026-01-14 19:18:00.122075', 'high');
INSERT INTO public.notification VALUES (1580, 'action_update', 'Members collected 57 kg (126 lbs) of e-waste.', '/actions/60', '/actions/60', '2026-01-14 11:17:22.612763-08', '2026-01-14 16:53:26.921961-08', 23, 9, NULL, NULL, NULL, '2026-01-14 11:16:59.456-08', NULL, NULL, '2026-01-15 00:53:26.921', true, NULL, 'dcf389da6b2f4469a72c01766fa363d9', '2026-01-14 19:18:00.122075', 'high');
INSERT INTO public.notification VALUES (1586, 'action_update', 'Members collected 57 kg (126 lbs) of e-waste.', '/actions/60', '/actions/60', '2026-01-14 11:17:22.63149-08', '2026-01-15 11:23:57.609599-08', 15, 9, NULL, NULL, NULL, '2026-01-14 11:16:59.456-08', NULL, NULL, '2026-01-15 19:23:57.609', true, NULL, 'dcf389da6b2f4469a72c01766fa363d9', '2026-01-14 19:18:00.122075', 'high');
INSERT INTO public.notification VALUES (1916, 'action_update', 'Our AI privacy survey was featured on the homepage of Digiday', '/actions/56', '/actions/56', '2026-01-27 09:57:20.42412-08', '2026-01-27 09:57:20.42412-08', 23, 10, NULL, NULL, NULL, '2026-01-27 09:55:00-08', NULL, NULL, NULL, true, NULL, 'c01b08e52f7648efbc99172809551086', '2026-01-27 17:58:00.135412', 'high');
INSERT INTO public.notification VALUES (1574, 'action_update', 'Members collected 57 kg (126 lbs) of e-waste.', '/actions/60', '/actions/60', '2026-01-14 11:17:22.589034-08', '2026-01-14 11:17:22.589034-08', 11, 9, NULL, NULL, NULL, '2026-01-14 11:16:59.456-08', NULL, NULL, NULL, true, NULL, 'dcf389da6b2f4469a72c01766fa363d9', '2026-01-14 19:18:00.122075', 'high');
INSERT INTO public.notification VALUES (1649, 'action_update', 'Members collected 57 kg (126 lbs) of e-waste.', '/actions/60', '/actions/60', '2026-01-14 11:17:22.82883-08', '2026-01-14 11:19:11.48564-08', 7, 9, NULL, NULL, NULL, '2026-01-14 11:16:59.456-08', NULL, NULL, '2026-01-14 19:19:11.486', true, NULL, 'dcf389da6b2f4469a72c01766fa363d9', '2026-01-14 19:18:00.122075', 'high');
INSERT INTO public.notification VALUES (2019, 'action_update', 'We surpassed our $500 "unclaimed properties" donation goal, so we''re raising it to $1,000', '/actions/70', '/actions/70', '2026-01-27 11:01:55.452292-08', '2026-01-27 11:01:55.452292-08', 23, 11, NULL, NULL, NULL, '2026-01-27 11:01:00-08', NULL, NULL, NULL, true, NULL, '8f526304636c46acb96de431d3e4cad8', '2026-01-27 19:02:00.116754', 'high');
INSERT INTO public.notification VALUES (2030, 'action_update', 'We surpassed our $500 "unclaimed properties" donation goal, so we''re raising it to $1,000', '/actions/70', '/actions/70', '2026-01-27 11:01:55.487039-08', '2026-01-27 11:01:55.487039-08', 24, 11, NULL, NULL, NULL, '2026-01-27 11:01:00-08', NULL, NULL, NULL, true, NULL, '8f526304636c46acb96de431d3e4cad8', '2026-01-27 19:02:00.116754', 'high');
INSERT INTO public.notification VALUES (2046, 'action_update', 'We surpassed our $500 "unclaimed properties" donation goal, so we''re raising it to $1,000', '/actions/70', '/actions/70', '2026-01-27 11:01:55.559319-08', '2026-01-27 14:22:21.045728-08', 15, 11, NULL, NULL, NULL, '2026-01-27 11:01:00-08', NULL, NULL, '2026-01-27 22:22:21.046', true, NULL, '8f526304636c46acb96de431d3e4cad8', '2026-01-27 19:02:00.116754', 'high');
INSERT INTO public.notification VALUES (2044, 'action_update', 'We surpassed our $500 "unclaimed properties" donation goal, so we''re raising it to $1,000', '/actions/70', '/actions/70', '2026-01-27 11:01:55.550812-08', '2026-01-27 18:09:45.554823-08', 11, 11, NULL, NULL, NULL, '2026-01-27 11:01:00-08', NULL, NULL, '2026-01-28 02:09:45.553', true, NULL, '8f526304636c46acb96de431d3e4cad8', '2026-01-27 19:02:00.116754', 'high');
INSERT INTO public.notification VALUES (2061, 'action_update', 'We surpassed our $500 "unclaimed properties" donation goal, so we''re raising it to $1,000', '/actions/70', '/actions/70', '2026-01-27 11:01:55.61001-08', '2026-01-27 11:02:15.719771-08', 7, 11, NULL, NULL, NULL, '2026-01-27 11:01:00-08', NULL, NULL, '2026-01-27 19:02:15.72', true, NULL, '8f526304636c46acb96de431d3e4cad8', '2026-01-27 19:02:00.116754', 'high');
INSERT INTO public.notification VALUES (2029, 'action_update', 'We surpassed our $500 "unclaimed properties" donation goal, so we''re raising it to $1,000', '/actions/70', '/actions/70', '2026-01-27 11:01:55.484118-08', '2026-01-27 11:29:16.617911-08', 10, 11, NULL, NULL, NULL, '2026-01-27 11:01:00-08', NULL, NULL, '2026-01-27 19:29:16.618', true, NULL, '8f526304636c46acb96de431d3e4cad8', '2026-01-27 19:02:00.116754', 'high');
INSERT INTO public.notification VALUES (1927, 'action_update', 'Our AI privacy survey was featured on the homepage of Digiday', '/actions/56', '/actions/56', '2026-01-27 09:57:20.458874-08', '2026-01-27 09:57:20.458874-08', 24, 10, NULL, NULL, NULL, '2026-01-27 09:55:00-08', NULL, NULL, NULL, true, NULL, 'c01b08e52f7648efbc99172809551086', '2026-01-27 17:58:00.135412', 'high');
INSERT INTO public.notification VALUES (1941, 'action_update', 'Our AI privacy survey was featured on the homepage of Digiday', '/actions/56', '/actions/56', '2026-01-27 09:57:20.513234-08', '2026-01-27 09:57:20.513234-08', 11, 10, NULL, NULL, NULL, '2026-01-27 09:55:00-08', NULL, NULL, NULL, true, NULL, 'c01b08e52f7648efbc99172809551086', '2026-01-27 17:58:00.135412', 'high');
INSERT INTO public.notification VALUES (1943, 'action_update', 'Our AI privacy survey was featured on the homepage of Digiday', '/actions/56', '/actions/56', '2026-01-27 09:57:20.518924-08', '2026-01-27 14:22:58.592917-08', 15, 10, NULL, NULL, NULL, '2026-01-27 09:55:00-08', NULL, NULL, '2026-01-27 22:22:58.592', true, NULL, 'c01b08e52f7648efbc99172809551086', '2026-01-27 17:58:00.135412', 'high');
INSERT INTO public.notification VALUES (1926, 'action_update', 'Our AI privacy survey was featured on the homepage of Digiday', '/actions/56', '/actions/56', '2026-01-27 09:57:20.455849-08', '2026-01-27 09:57:30.111788-08', 10, 10, NULL, NULL, NULL, '2026-01-27 09:55:00-08', NULL, NULL, '2026-01-27 17:57:30.113', true, NULL, 'c01b08e52f7648efbc99172809551086', '2026-01-27 17:58:00.135412', 'high');
INSERT INTO public.notification VALUES (2271, 'action_update', 'Members expect to donate over $2,000 in unclaimed properties', '/actions/70', '/actions/70', '2026-01-30 13:12:06.616541-08', '2026-01-30 15:48:22.641929-08', 15, 12, NULL, NULL, NULL, '2026-01-30 13:12:00-08', NULL, NULL, '2026-01-30 23:48:22.634', true, NULL, 'f8e02136418c4b5da9737221e4dca0c4', '2026-01-30 21:13:00.140057', 'high');
INSERT INTO public.notification VALUES (2241, 'action_update', 'Members expect to donate over $2,000 in unclaimed properties', '/actions/70', '/actions/70', '2026-01-30 13:12:06.520453-08', '2026-01-30 13:12:06.520453-08', 23, 12, NULL, NULL, NULL, '2026-01-30 13:12:00-08', NULL, NULL, NULL, true, NULL, 'f8e02136418c4b5da9737221e4dca0c4', '2026-01-30 21:13:00.140057', 'high');
INSERT INTO public.notification VALUES (2297, 'action_update', 'Members expect to donate over $2,000 in unclaimed properties', '/actions/70', '/actions/70', '2026-01-30 13:12:06.699501-08', '2026-01-30 13:12:10.505004-08', 7, 12, NULL, NULL, NULL, '2026-01-30 13:12:00-08', NULL, NULL, '2026-01-30 21:12:10.505', true, NULL, 'f8e02136418c4b5da9737221e4dca0c4', '2026-01-30 21:13:00.140057', 'high');
INSERT INTO public.notification VALUES (2505, 'likes', 'Mark Xu liked your comment: I liked this post! It does seem like we should worry about ending up too far in the direction of a kind of conflict-adjacent theory that sounds like "what if we just ask people to abide by these principles that we decided are universal while ignoring the kind of complex incentive-webs that caused people to act the way they do and that we might not totally have the power to adjust." Also that there could be a level of ''mistake hardness'' that makes the kind of mass pressure activities we want to do implausible for certain systems, though this can hopefully be mitigated by some forms of expert research for actions.', '/forum/post/16?replyId=310', NULL, '2026-02-04 10:21:41.999901-08', '2026-02-04 14:49:13.083094-08', 15, NULL, 'forum_like:comment:310', 1, NULL, '2026-02-04 10:21:41.999901-08', 'I liked this post! It does seem like we should worry about ending up too far in the direction of a kind of conflict-adjacent theory that sounds like "what if we just ask people to abide by these principles that we decided are universal while ignoring the kind of complex incentive-webs that caused people to act the way they do and that we might not totally have the power to adjust." Also that there could be a level of ''mistake hardness'' that makes the kind of mass pressure activities we want to do implausible for certain systems, though this can hopefully be mitigated by some forms of expert research for actions.', NULL, '2026-02-04 22:49:13.082', true, NULL, '4c8a189a671f456387747a54f1716a7b', '2026-02-04 18:22:00.031914', 'low');
INSERT INTO public.notification VALUES (2535, 'action_update', 'We added a public member directory to our "people" page', '/actions/59', '/actions/59', '2026-02-04 16:55:38.248444-08', '2026-02-04 16:55:38.248444-08', 23, 13, NULL, NULL, NULL, '2026-02-04 16:56:00-08', NULL, NULL, NULL, true, NULL, '5f638107b90745459a2d6341fbb703d4', '2026-02-05 00:56:00.028849', 'high');
INSERT INTO public.notification VALUES (2555, 'action_update', 'We added a public member directory to our "people" page', '/actions/59', '/actions/59', '2026-02-04 16:55:38.310045-08', '2026-02-04 16:55:38.310045-08', 24, 13, NULL, NULL, NULL, '2026-02-04 16:56:00-08', NULL, NULL, NULL, true, NULL, '5f638107b90745459a2d6341fbb703d4', '2026-02-05 00:56:00.028849', 'high');
INSERT INTO public.notification VALUES (2566, 'action_update', 'We added a public member directory to our "people" page', '/actions/59', '/actions/59', '2026-02-04 16:55:38.343947-08', '2026-02-05 10:07:58.626532-08', 15, 13, NULL, NULL, NULL, '2026-02-04 16:56:00-08', NULL, NULL, '2026-02-05 18:07:58.626', true, NULL, '5f638107b90745459a2d6341fbb703d4', '2026-02-05 00:56:00.028849', 'high');
INSERT INTO public.notification VALUES (2576, 'action_update', 'We added a public member directory to our "people" page', '/actions/59', '/actions/59', '2026-02-04 16:55:38.381501-08', '2026-02-04 22:56:14.267421-08', 11, 13, NULL, NULL, NULL, '2026-02-04 16:56:00-08', NULL, NULL, '2026-02-05 06:56:14.267', true, NULL, '5f638107b90745459a2d6341fbb703d4', '2026-02-05 00:56:00.028849', 'high');
INSERT INTO public.notification VALUES (2548, 'action_update', 'We added a public member directory to our "people" page', '/actions/59', '/actions/59', '2026-02-04 16:55:38.289294-08', '2026-02-04 16:56:15.7221-08', 10, 13, NULL, NULL, NULL, '2026-02-04 16:56:00-08', NULL, NULL, '2026-02-05 00:56:15.722', true, NULL, '5f638107b90745459a2d6341fbb703d4', '2026-02-05 00:56:00.028849', 'high');
INSERT INTO public.notification VALUES (2592, 'action_update', 'We added a public member directory to our "people" page', '/actions/59', '/actions/59', '2026-02-04 16:55:38.431595-08', '2026-02-04 17:01:38.504112-08', 7, 13, NULL, NULL, NULL, '2026-02-04 16:56:00-08', NULL, NULL, '2026-02-05 01:01:38.504', true, NULL, '5f638107b90745459a2d6341fbb703d4', '2026-02-05 00:56:00.028849', 'high');
INSERT INTO public.notification VALUES (2507, 'likes', '4 people liked your comment: > I would just add that in the future when our membership has grown to a significant level, it would be beneficial to creat tiers of membership that require different level of commitment or effort to grow membership.

Great suggestion - we have plans to do so. Our plan is to have a baseline member contract, and offer optional additional commitments for members who wish to use more of their resources to aid the Alliance. We want to be careful about how these contracts affect weight in Alliance governance so all members remain equal partners in the Alliance.', '/forum/post/16?replyId=308', NULL, '2026-02-04 10:25:31.487582-08', '2026-02-05 22:17:17.49124-08', 10, NULL, 'forum_like:comment:308', 4, NULL, '2026-02-04 10:25:31.487582-08', '> I would just add that in the future when our membership has grown to a significant level, it would be beneficial to creat tiers of membership that require different level of commitment or effort to grow membership.

Great suggestion - we have plans to do so. Our plan is to have a baseline member contract, and offer optional additional commitments for members who wish to use more of their resources to aid the Alliance. We want to be careful about how these contracts affect weight in Alliance governance so all members remain equal partners in the Alliance.', NULL, '2026-02-04 18:42:20.385', true, NULL, 'f983676b2b664479808ed07768c53e9c', '2026-02-04 18:26:00.114235', 'low');
INSERT INTO public.notification VALUES (2260, 'action_update', 'Members expect to donate over $2,000 in unclaimed properties', '/actions/70', '/actions/70', '2026-01-30 13:12:06.581816-08', '2026-02-04 18:03:57.815293-08', 24, 12, NULL, NULL, NULL, '2026-01-30 13:12:00-08', NULL, NULL, '2026-02-05 02:03:57.815', true, NULL, 'f8e02136418c4b5da9737221e4dca0c4', '2026-01-30 21:13:00.140057', 'high');
INSERT INTO public.notification VALUES (2641, 'forum_reply', 'New reply from Eamon OCearuil', '/forum/post/16?replyId=316', NULL, '2026-02-04 18:02:38.987007-08', '2026-02-04 19:02:43.476518-08', 7, NULL, NULL, NULL, 316, '2026-02-04 18:02:38.987007-08', NULL, NULL, '2026-02-05 03:02:43.477', true, NULL, '0c064871190941929931e8f2b21d3e04', '2026-02-05 02:03:00.14429', 'low');
INSERT INTO public.notification VALUES (2640, 'forum_reply', 'New reply from Eamon OCearuil', '/forum/post/16?replyId=316', NULL, '2026-02-04 18:02:38.987007-08', '2026-02-04 19:25:01.453543-08', 10, NULL, NULL, NULL, 316, '2026-02-04 18:02:38.987007-08', NULL, NULL, '2026-02-05 03:25:01.454', true, NULL, '0c064871190941929931e8f2b21d3e04', '2026-02-05 02:03:00.14429', 'low');
INSERT INTO public.notification VALUES (2790, 'likes', 'Sidney Hough liked your comment: > How will we respond to the first task that majority of Alliance members decline to carry out out of disagreement?
Thank you for bringing this up - we think this is quite important to consider this explicitly beforehand, possibly even worth having a dedicated discussion about.

Realistically, we should expect this will happen. When it does happen, it could be for any number of reasons: the office makes a big mistake, or members lack important context, or perhaps an issue is so urgent that it is worth doing something even in the face of predictable disagreement.

When this happens, I hope that all parties will be able to take the long view, and to consider the action in the overall context and trajectory of the Alliance. In some scenarios, the office may need to seriously reconsider its people and processes for action evaluation. In different scenarios, it may be appropriate for members to lend the benefit of the doubt, and continue to believe in and take responsibility for the long-term possibilities of the Alliance rather than react too strongly or too negatively, or instinctively cast blame on others before looking inwards.

Personally, I hope that members will also understand that the office is simply a group of people, all of whom make mistakes constantly, and will do their best to learn.', '/forum/post/16?replyId=348', NULL, '2026-02-05 11:51:13.993107-08', '2026-02-05 13:04:11.513761-08', 10, NULL, 'forum_like:comment:348', 1, NULL, '2026-02-05 11:51:13.993107-08', '> How will we respond to the first task that majority of Alliance members decline to carry out out of disagreement?
Thank you for bringing this up - we think this is quite important to consider this explicitly beforehand, possibly even worth having a dedicated discussion about.

Realistically, we should expect this will happen. When it does happen, it could be for any number of reasons: the office makes a big mistake, or members lack important context, or perhaps an issue is so urgent that it is worth doing something even in the face of predictable disagreement.

When this happens, I hope that all parties will be able to take the long view, and to consider the action in the overall context and trajectory of the Alliance. In some scenarios, the office may need to seriously reconsider its people and processes for action evaluation. In different scenarios, it may be appropriate for members to lend the benefit of the doubt, and continue to believe in and take responsibility for the long-term possibilities of the Alliance rather than react too strongly or too negatively, or instinctively cast blame on others before looking inwards.

Personally, I hope that members will also understand that the office is simply a group of people, all of whom make mistakes constantly, and will do their best to learn.', NULL, '2026-02-05 21:04:11.513', true, NULL, 'b91056d736d84bc3b3b62f64ad8fadd0', '2026-02-05 19:52:00.173869', 'low');
INSERT INTO public.notification VALUES (2154, 'likes', '15 people liked your post: Alliance culture discussion', '/forum/post/16', NULL, '2026-01-28 19:06:01.587125-08', '2026-02-05 22:10:29.095684-08', 7, NULL, 'forum_like:post:16:user:7', 15, NULL, '2026-01-28 19:06:01.587125-08', 'Alliance culture discussion', NULL, '2026-01-29 03:06:54.367', true, NULL, 'a2af0d166ce24ce990be670487768a4b', '2026-01-29 03:07:00.038039', 'low');
INSERT INTO public.notification VALUES (2837, 'likes', '2 people liked your comment: Welcome, Clare!', '/actions/11/activity/1488?replyId=351', NULL, '2026-02-05 22:11:44.708134-08', '2026-02-05 22:22:28.19933-08', 7, NULL, 'forum_like:comment:351', 2, NULL, '2026-02-05 22:11:44.708134-08', 'Welcome, Clare!', NULL, '2026-02-06 06:16:47.068', true, NULL, 'e6830c9abbc4401190f2ae4fdaf9da99', '2026-02-06 06:12:00.038417', 'low');
INSERT INTO public.notification VALUES (2671, 'likes', 'Mark Xu liked your completion of: Contribute to a discussion about Alliance culture', '/actions/71/activity/1428', NULL, '2026-02-04 20:06:03.299085-08', '2026-02-04 20:06:03.299085-08', 24, NULL, 'activity_like:1428', 1, NULL, '2026-02-04 20:06:03.299085-08', 'Contribute to a discussion about Alliance culture', NULL, NULL, true, NULL, '2cad07e6fb63434b945fc3d3a543b873', '2026-02-05 04:07:00.018016', 'low');
INSERT INTO public.notification VALUES (2819, 'likes', 'Mark Xu liked your completion of: Read about Alliance growth plans', '/actions/73/activity/1475', NULL, '2026-02-05 20:40:44.540413-08', '2026-02-05 21:27:04.476873-08', 11, NULL, 'activity_like:1475', 1, NULL, '2026-02-05 20:40:44.540413-08', 'Read about Alliance growth plans', NULL, '2026-02-06 05:27:04.475', true, NULL, '1e85736071b24226a29802ca32b4a332', '2026-02-06 04:41:00.009328', 'low');
INSERT INTO public.notification VALUES (2822, 'likes', '2 people liked your completion of: Read about Alliance growth plans', '/actions/73/activity/1464', NULL, '2026-02-05 20:50:13.204967-08', '2026-02-06 08:04:12.654608-08', 10, NULL, 'activity_like:1464', 2, NULL, '2026-02-05 20:50:13.204967-08', 'Read about Alliance growth plans', NULL, '2026-02-06 04:50:20.842', true, NULL, '190f6bd253754e9ca1b2ec73a097dcb8', '2026-02-06 04:51:00.00982', 'low');
INSERT INTO public.notification VALUES (2862, 'likes', 'Mark Xu liked your comment: > Honestly, I think the biggest way to uphold this principle is to show that other people are doing it too.

I like this thought, and will think about ways to do it. One idea for the future is to sometimes pair an action that benefits Party A and costs Party B with an action that benefits Party B and costs Party A.', '/forum/post/16?replyId=352', NULL, '2026-02-06 10:17:37.31619-08', '2026-02-06 10:17:46.699745-08', 7, NULL, 'forum_like:comment:352', 1, NULL, '2026-02-06 10:17:37.31619-08', '> Honestly, I think the biggest way to uphold this principle is to show that other people are doing it too.

I like this thought, and will think about ways to do it. One idea for the future is to sometimes pair an action that benefits Party A and costs Party B with an action that benefits Party B and costs Party A.', NULL, '2026-02-06 18:17:46.699', true, NULL, 'e6ae26a4ceb4488794073728eb5cfa06', '2026-02-06 18:18:00.030821', 'low');
INSERT INTO public.notification VALUES (2506, 'likes', '5 people liked your comment: Re: challenges as we grow: I strongly agree that a major challenge will be retaining the ability to solve problems as we come to disagree more about the "how" vs. the "why." (We are less worried about members becoming unreliable because we restrict membership to people who complete tasks reliability - so from our perspective, what would have been a reliability problem is actually more of a growth/accessibility problem.)

There likely won''t be a silver-bullet solution. But, some things we think will help:
- Building an outcomes-focused culture, as you said, which can be more concretely realized in various ways. For instance, we could have a discussions norm of asking explicitly whether or not a disagreement is relevant to our goals (Katherine Carpio''s idea below).
- Developing decision-making processes that allow us to evaluate the tradeoffs of actions efficiently and thoroughly (as Janos Pasztor suggested below). We anticipate that this will be very challenging; we do not know how to do this yet, nor do we currently have the capacity to accommodate such a process for every action. However, when we develop and run these processes in the future, we think it will be good to not take for granted that we are all here to solve the same problems. When we disagree, we hope everyone will believe that we disagree about facts, not fundamental morality, and that this will allow us to disagree more kindly and productively.
- Subjecting decision-making processes to democratic approval before implementing them. This way, most members will hopefully agree about the "way to make decisions," and therefore be more willing to accept specific decisions that the process produces, even if they have some disagreement.
- We are very excited about the fact that reliability means we will have a constant, open line of communication with members. **This means that in cases of severe disagreement, we may be able to make significant progress by running actions that help everyone understand everyone else''s viewpoints.** From our perspective, this stands in stark contrast to the current state of political affairs in which everyone receives information from different sources, and therefore cannot come to agreement over time. (There are studies on deliberation that suggest that people''s opinions can change very quickly when they are exposed to opposing viewpoints expressed in good faith.)', '/forum/post/16?replyId=311', NULL, '2026-02-04 10:24:04.376163-08', '2026-02-04 22:39:37.548037-08', 7, NULL, 'forum_like:comment:311', 5, NULL, '2026-02-04 10:24:04.376163-08', 'Re: challenges as we grow: I strongly agree that a major challenge will be retaining the ability to solve problems as we come to disagree more about the "how" vs. the "why." (We are less worried about members becoming unreliable because we restrict membership to people who complete tasks reliability - so from our perspective, what would have been a reliability problem is actually more of a growth/accessibility problem.)

There likely won''t be a silver-bullet solution. But, some things we think will help:
- Building an outcomes-focused culture, as you said, which can be more concretely realized in various ways. For instance, we could have a discussions norm of asking explicitly whether or not a disagreement is relevant to our goals (Katherine Carpio''s idea below).
- Developing decision-making processes that allow us to evaluate the tradeoffs of actions efficiently and thoroughly (as Janos Pasztor suggested below). We anticipate that this will be very challenging; we do not know how to do this yet, nor do we currently have the capacity to accommodate such a process for every action. However, when we develop and run these processes in the future, we think it will be good to not take for granted that we are all here to solve the same problems. When we disagree, we hope everyone will believe that we disagree about facts, not fundamental morality, and that this will allow us to disagree more kindly and productively.
- Subjecting decision-making processes to democratic approval before implementing them. This way, most members will hopefully agree about the "way to make decisions," and therefore be more willing to accept specific decisions that the process produces, even if they have some disagreement.
- We are very excited about the fact that reliability means we will have a constant, open line of communication with members. **This means that in cases of severe disagreement, we may be able to make significant progress by running actions that help everyone understand everyone else''s viewpoints.** From our perspective, this stands in stark contrast to the current state of political affairs in which everyone receives information from different sources, and therefore cannot come to agreement over time. (There are studies on deliberation that suggest that people''s opinions can change very quickly when they are exposed to opposing viewpoints expressed in good faith.)', NULL, '2026-02-04 18:25:19.449', true, NULL, 'bbb5f5c24e994900aa94d531f2a25b11', '2026-02-04 18:25:00.118046', 'low');
INSERT INTO public.notification VALUES (2508, 'likes', '3 people liked your comment: > I''m not sold on the idea of feeling that you need to communicate a culture. I think an optimal “culture” is developed organically by member and leadership actions & behaviors, leading by example, being empathetic, inclusive, showing humility, and being humble - just some immediate thoughts :-)

I agree that culture is largely communicated through "show, don''t tell." We will do our best to embody the culture through actions, the design platform, communications, and other facets of the Alliance :) 

I do think, however, that as we grow it''s important for members to have common knowledge of our norms and expectations. Explicit discussions like this one can help members understand the what and why of Alliance culture, which will (I hope) both allow the culture to develop organically and make it easier for new members to become a part of.

', '/forum/post/16?replyId=312', NULL, '2026-02-04 10:25:34.440816-08', '2026-02-04 22:41:00.306671-08', 10, NULL, 'forum_like:comment:312', 3, NULL, '2026-02-04 10:25:34.440816-08', '> I''m not sold on the idea of feeling that you need to communicate a culture. I think an optimal “culture” is developed organically by member and leadership actions & behaviors, leading by example, being empathetic, inclusive, showing humility, and being humble - just some immediate thoughts :-)

I agree that culture is largely communicated through "show, don''t tell." We will do our best to embody the culture through actions, the design platform, communications, and other facets of the Alliance :) 

I do think, however, that as we grow it''s important for members to have common knowledge of our norms and expectations. Explicit discussions like this one can help members understand the what and why of Alliance culture, which will (I hope) both allow the culture to develop organically and make it easier for new members to become a part of.

', NULL, '2026-02-04 18:42:20.385', true, NULL, 'f983676b2b664479808ed07768c53e9c', '2026-02-04 18:26:00.114235', 'low');
INSERT INTO public.notification VALUES (2890, 'likes', 'Mark Xu liked your completion of: Read about Alliance growth plans', '/actions/73/activity/1515', NULL, '2026-02-06 16:51:39.837825-08', '2026-02-06 17:24:22.431916-08', 15, NULL, 'activity_like:1515', 1, NULL, '2026-02-06 16:51:39.837825-08', 'Read about Alliance growth plans', NULL, '2026-02-07 01:24:22.431', true, NULL, '7f19d41c04ff48ef9631442500634f7f', '2026-02-07 00:52:00.134662', 'low');
INSERT INTO public.notification VALUES (2889, 'likes', '2 people liked your completion of: Consider inviting new members to the Alliance', '/actions/74/activity/1518', NULL, '2026-02-06 16:51:37.687446-08', '2026-02-07 20:30:46.173021-08', 15, NULL, 'activity_like:1518', 2, NULL, '2026-02-06 16:51:37.687446-08', 'Consider inviting new members to the Alliance', NULL, '2026-02-07 01:21:02.958', true, NULL, '7f19d41c04ff48ef9631442500634f7f', '2026-02-07 00:52:00.134662', 'low');
INSERT INTO public.notification VALUES (2872, 'likes', 'Mark Xu liked your comment: Welcome Jaden!', '/actions/11/activity/1508?replyId=353', NULL, '2026-02-06 11:35:41.395389-08', '2026-02-06 11:38:07.009883-08', 7, NULL, 'forum_like:comment:353', 1, NULL, '2026-02-06 11:35:41.395389-08', 'Welcome Jaden!', NULL, '2026-02-06 19:38:07.009', true, NULL, 'e6e2672468c747e290aa6524a6610570', '2026-02-06 19:36:00.115349', 'low');
INSERT INTO public.notification VALUES (2737, 'likes', '5 people liked your comment: (Mark and I are writing this together.)

Hi James, first off – thank you for this substantive engagement. It means a lot to us to see others taking the Alliance seriously, and we think taking it seriously means thinking hard about ways that it could fail. We will now respond point by point.

> seems essential to avoiding just creating another institution with different people 

We do not think that there is, or will be, a “secret sauce” that prevents the Alliance from facing the many problems that other institutions face. We think that at least for the foreseeable future, the quality of the world’s institutions will continue to be sensitive to the quality of the people within them. This makes it all the more important that we (both office and members) take our jobs seriously.

There are many factors that will help us as an institution – critical thinking included, regular communication between members included (see Sidney’s reply to [Rishi](https://worldalliance.org/forum/post/16?replyId=298) about some of the benefits we think this will confer) – and there are also many unique challenges we will face as a result of our structure that other institutions do not. We expect to make many mistakes, and we hope you will understand that we are learning as we go.

> I would like to see more explicit and transparent discussion from the office re. internal political processes and how we can make sure this doesn''t just concentrate power in their hands.

We would love to have much more information available about our ideas for governance processes. We have not been able to spend substantive time providing such information, nor do we have particularly sophisticated processes yet that we have believed to require explanation beyond what is currently available on our website (e.g., our [Governance](https://worldalliance.org/governance) page and basic explanations for our actions, e.g. [pothole-reporting explanation](https://worldalliance.org/actions/50)). We plan to attend more to our communication as we grow, as it will both become more important and we will have more internal capacity.

In lieu of “official” information, we’ll outline some of our personal perspectives on this issue. These are, by the way, subject to change – we ultimately want to develop processes and governance that make it most likely that we can resolve global crises.

We (Mark and I) expect that as the Alliance grows, the office will have more power. We currently believe that, in the long run, a coherent strategy will be necessary to make progress on our core priorities, and that coherence and urgency will require power to be somewhat concentrated. This is not ideal from our perspective, but once again: we have not solved the general problem of institutional design as a society, and we believe various experimental, decentralized models of organizations do not yet offer sufficient coordination potential.

Ultimately, membership in the Alliance is voluntary. This implicit “vote” holds the office accountable because any power the office has is power entrusted to the office by members. 

To build on this foundation, we think about three broad strategies for mitigating the risks of power concentration:
1. We have, and will continue to develop, formal governance. Our current governance process requires us to run a regular oversight action every 3 months that attempts to understand overall member approval (binding) as well as miscellaneous member opinions (non-binding, but taken seriously). The next such process will be run towards the end of February. (We will likely want to make a few modifications to this process soon, subject to member approval.)
2. We will maintain a high level of transparency so that, to borrow your words, it is as “straightforward as possible for members to determine to what degree they align with the Alliance.” We are currently not as transparent as we want to be in the long run. In addition to generally making much more information available, we plan to introduce many processes that help members learn about how the office makes decisions. For example, we might have “office hours” in which staff answer member questions, audits of office activity, member advisory boards (random or elected), or “votes of no confidence” for specific Alliance staff positions.
3. Collecting information and preferences from members and integrating it into various processes internally. There are two halves to this:
  - We plan to regularly solicit information about member beliefs, preferences, and aspects of the member experience. For example, we plan to run regular feedback actions, survey randomly sampled members, etc.
  - We plan to design processes that allow members to actively provide information to the office. We expect most members will not do so regularly, but we want to ensure that those that do can efficiently share information with the relevant parties. Currently, members can share information with any staff member by messaging them on the platform; in the long run, processes for surfacing information will have to be designed thoughtfully, and will leverage technology, designated staff positions, and potentially Alliance community structures.

> Some of the alliance''s (or the office''s?) positions seem overly simplistic / naive to me

First, it seems helpful to clarify that the positions in the post are Mark’s and my perspective (not the Alliance’s or the office’s).

More substantively, we believe the characterization of the principles we have laid out, and particularly “broad agreement,” as “overly simplistic / naive” is too cynical. We agree that it will be difficult to translate broad, high-level, agreement about a cause into concrete ways of advancing that cause. But core to the Alliance is the belief there are worlds that are preferred to our current world by the vast majority of people, including worlds free of global crises.

When we speak of broad agreement, we are laying out what gives us hope that the Alliance might succeed. There will be many times, and many places, to discuss implementation and cleverly overcome challenges; this is the bulk of the work ahead of us. It is our strong belief that if we cannot collectively recognize what so many of us have in common, if we cannot share a hope or a dream, then we will not succeed.

> Re. focusing on what we agree on -- is there any logging of what we disagree on so that we know and can make sure we''re doing actions that are generally not in that space

Right now, members can withdraw from actions if they believe they are immoral. This has not happened yet, but if/when it does, we plan to have an option to make individual withdrawals public.

Members are welcome to express disagreement by commenting on actions or posting on the forum. We also tend to check actions with a handful of members prior to launching them, but we currently do so informally. In the future we plan to develop processes to solicit such feedback more systematically (perhaps with randomly sampled members).

We’re interested in learning more about member preferences and beliefs, both to find areas of agreement and disagreement. We might run a general “beliefs and values” survey as a starting point, although we will likely wait until we have a higher diversity of members so the action is more informative, or until this information becomes more action-relevant.

We’re a bit nervous about explicitly selecting for actions with high agreement and filtering actions with disagreement. We want to take actions that we strongly believe will advance our priorities, even when not all members agree that those actions do so. If we avoid actions with disagreement deliberately, our beliefs risk becoming distorted by incorrect consensus opinions. As a result, new members might not join the Alliance unless their beliefs accord with our preexisting consensus. This distorted member body could distort actions further, which could further distort the member body until the Alliance is defined by a narrow worldview. (This is all related to the memetic and group-think risks [Kyle](https://worldalliance.org/forum/post/16?replyId=314) wrote about)

Finally, Mark and I agree with [Diane’s](https://worldalliance.org/forum/post/16?replyId=286) comment that sometimes “part of being cooperative is also being willing to perform actions that slightly deviate from your own values.”

> I would add that it might be better to begin by stating the questions, and then giving the office''s stances (perhaps even as a comment instead of in the post body).

Good suggestion - we have moved the questions to the top (though retained them at the bottom as well for ease of reading). 

We considered leaving our perspective in a comment, but we wanted to provide a basic perspective for members to build upon to start the discussion. As a result, we would have had to pin our comment, which felt more self-important than keeping our perspective in the post body.

> Understanding any avenues in which this action did genuinely change your beliefs / alliance roadmap, or at least cause you to have more uncertainty on some area or investigate it further, would help us.

We plan to write an action update once the action is complete, summarizing major points that members have brought up.

One thing that stood out to us was the volume of comments about wanting to see more progress updates. In response, we’ve:
- Added a temporary, textual roadmap to our Information page that we plan to make more detailed and visual in the future.
- Moved action updates out of the Notifications page onto the homepage so that they are more prominent.
- Decided with the team to run some kind of regular action keeping members up-to-date on our internal activities, key stats, and so on. We aren’t sure exactly what this will look like yet, but should begin to do this in the next few weeks.

> I don''t mean to be overly negative but I do believe negation is a crucial part of any self-critical constructive process :)

:)', '/forum/post/16?replyId=338', NULL, '2026-02-04 22:59:58.132024-08', '2026-02-05 22:16:00.132619-08', 7, NULL, 'forum_like:comment:338', 5, NULL, '2026-02-04 22:59:58.132024-08', '(Mark and I are writing this together.)

Hi James, first off – thank you for this substantive engagement. It means a lot to us to see others taking the Alliance seriously, and we think taking it seriously means thinking hard about ways that it could fail. We will now respond point by point.

> seems essential to avoiding just creating another institution with different people 

We do not think that there is, or will be, a “secret sauce” that prevents the Alliance from facing the many problems that other institutions face. We think that at least for the foreseeable future, the quality of the world’s institutions will continue to be sensitive to the quality of the people within them. This makes it all the more important that we (both office and members) take our jobs seriously.

There are many factors that will help us as an institution – critical thinking included, regular communication between members included (see Sidney’s reply to [Rishi](https://worldalliance.org/forum/post/16?replyId=298) about some of the benefits we think this will confer) – and there are also many unique challenges we will face as a result of our structure that other institutions do not. We expect to make many mistakes, and we hope you will understand that we are learning as we go.

> I would like to see more explicit and transparent discussion from the office re. internal political processes and how we can make sure this doesn''t just concentrate power in their hands.

We would love to have much more information available about our ideas for governance processes. We have not been able to spend substantive time providing such information, nor do we have particularly sophisticated processes yet that we have believed to require explanation beyond what is currently available on our website (e.g., our [Governance](https://worldalliance.org/governance) page and basic explanations for our actions, e.g. [pothole-reporting explanation](https://worldalliance.org/actions/50)). We plan to attend more to our communication as we grow, as it will both become more important and we will have more internal capacity.

In lieu of “official” information, we’ll outline some of our personal perspectives on this issue. These are, by the way, subject to change – we ultimately want to develop processes and governance that make it most likely that we can resolve global crises.

We (Mark and I) expect that as the Alliance grows, the office will have more power. We currently believe that, in the long run, a coherent strategy will be necessary to make progress on our core priorities, and that coherence and urgency will require power to be somewhat concentrated. This is not ideal from our perspective, but once again: we have not solved the general problem of institutional design as a society, and we believe various experimental, decentralized models of organizations do not yet offer sufficient coordination potential.

Ultimately, membership in the Alliance is voluntary. This implicit “vote” holds the office accountable because any power the office has is power entrusted to the office by members. 

To build on this foundation, we think about three broad strategies for mitigating the risks of power concentration:
1. We have, and will continue to develop, formal governance. Our current governance process requires us to run a regular oversight action every 3 months that attempts to understand overall member approval (binding) as well as miscellaneous member opinions (non-binding, but taken seriously). The next such process will be run towards the end of February. (We will likely want to make a few modifications to this process soon, subject to member approval.)
2. We will maintain a high level of transparency so that, to borrow your words, it is as “straightforward as possible for members to determine to what degree they align with the Alliance.” We are currently not as transparent as we want to be in the long run. In addition to generally making much more information available, we plan to introduce many processes that help members learn about how the office makes decisions. For example, we might have “office hours” in which staff answer member questions, audits of office activity, member advisory boards (random or elected), or “votes of no confidence” for specific Alliance staff positions.
3. Collecting information and preferences from members and integrating it into various processes internally. There are two halves to this:
  - We plan to regularly solicit information about member beliefs, preferences, and aspects of the member experience. For example, we plan to run regular feedback actions, survey randomly sampled members, etc.
  - We plan to design processes that allow members to actively provide information to the office. We expect most members will not do so regularly, but we want to ensure that those that do can efficiently share information with the relevant parties. Currently, members can share information with any staff member by messaging them on the platform; in the long run, processes for surfacing information will have to be designed thoughtfully, and will leverage technology, designated staff positions, and potentially Alliance community structures.

> Some of the alliance''s (or the office''s?) positions seem overly simplistic / naive to me

First, it seems helpful to clarify that the positions in the post are Mark’s and my perspective (not the Alliance’s or the office’s).

More substantively, we believe the characterization of the principles we have laid out, and particularly “broad agreement,” as “overly simplistic / naive” is too cynical. We agree that it will be difficult to translate broad, high-level, agreement about a cause into concrete ways of advancing that cause. But core to the Alliance is the belief there are worlds that are preferred to our current world by the vast majority of people, including worlds free of global crises.

When we speak of broad agreement, we are laying out what gives us hope that the Alliance might succeed. There will be many times, and many places, to discuss implementation and cleverly overcome challenges; this is the bulk of the work ahead of us. It is our strong belief that if we cannot collectively recognize what so many of us have in common, if we cannot share a hope or a dream, then we will not succeed.

> Re. focusing on what we agree on -- is there any logging of what we disagree on so that we know and can make sure we''re doing actions that are generally not in that space

Right now, members can withdraw from actions if they believe they are immoral. This has not happened yet, but if/when it does, we plan to have an option to make individual withdrawals public.

Members are welcome to express disagreement by commenting on actions or posting on the forum. We also tend to check actions with a handful of members prior to launching them, but we currently do so informally. In the future we plan to develop processes to solicit such feedback more systematically (perhaps with randomly sampled members).

We’re interested in learning more about member preferences and beliefs, both to find areas of agreement and disagreement. We might run a general “beliefs and values” survey as a starting point, although we will likely wait until we have a higher diversity of members so the action is more informative, or until this information becomes more action-relevant.

We’re a bit nervous about explicitly selecting for actions with high agreement and filtering actions with disagreement. We want to take actions that we strongly believe will advance our priorities, even when not all members agree that those actions do so. If we avoid actions with disagreement deliberately, our beliefs risk becoming distorted by incorrect consensus opinions. As a result, new members might not join the Alliance unless their beliefs accord with our preexisting consensus. This distorted member body could distort actions further, which could further distort the member body until the Alliance is defined by a narrow worldview. (This is all related to the memetic and group-think risks [Kyle](https://worldalliance.org/forum/post/16?replyId=314) wrote about)

Finally, Mark and I agree with [Diane’s](https://worldalliance.org/forum/post/16?replyId=286) comment that sometimes “part of being cooperative is also being willing to perform actions that slightly deviate from your own values.”

> I would add that it might be better to begin by stating the questions, and then giving the office''s stances (perhaps even as a comment instead of in the post body).

Good suggestion - we have moved the questions to the top (though retained them at the bottom as well for ease of reading). 

We considered leaving our perspective in a comment, but we wanted to provide a basic perspective for members to build upon to start the discussion. As a result, we would have had to pin our comment, which felt more self-important than keeping our perspective in the post body.

> Understanding any avenues in which this action did genuinely change your beliefs / alliance roadmap, or at least cause you to have more uncertainty on some area or investigate it further, would help us.

We plan to write an action update once the action is complete, summarizing major points that members have brought up.

One thing that stood out to us was the volume of comments about wanting to see more progress updates. In response, we’ve:
- Added a temporary, textual roadmap to our Information page that we plan to make more detailed and visual in the future.
- Moved action updates out of the Notifications page onto the homepage so that they are more prominent.
- Decided with the team to run some kind of regular action keeping members up-to-date on our internal activities, key stats, and so on. We aren’t sure exactly what this will look like yet, but should begin to do this in the next few weeks.

> I don''t mean to be overly negative but I do believe negation is a crucial part of any self-critical constructive process :)

:)', NULL, '2026-02-05 07:09:03.832', true, NULL, 'dd703a10882f4319856d603eadb8e90d', '2026-02-05 07:00:00.055268', 'low');
INSERT INTO public.notification VALUES (2782, 'likes', 'Mark Xu liked your comment: Per the contract, you can withdraw from an action if you believe it is immoral. The contract leaves it to you to decide where you draw the line.', '/forum/post/16?replyId=330', NULL, '2026-02-05 10:30:57.66826-08', '2026-02-05 10:46:20.76591-08', 7, NULL, 'forum_like:comment:330', 1, NULL, '2026-02-05 10:30:57.66826-08', 'Per the contract, you can withdraw from an action if you believe it is immoral. The contract leaves it to you to decide where you draw the line.', NULL, '2026-02-05 18:46:20.766', true, NULL, '1149e11829c54c6f9e624d31f9a04077', '2026-02-05 18:31:00.125852', 'low');
INSERT INTO public.notification VALUES (2877, 'friend_request_accepted', 'Lucas Zheng accepted your friend request', '/member/134', NULL, '2026-02-06 12:16:19.519009-08', '2026-02-06 12:16:19.519009-08', 11, NULL, NULL, NULL, NULL, '2026-02-06 12:16:19.519009-08', NULL, NULL, NULL, true, NULL, 'ad0679f7e8784b3cbf2b686f60ee006d', '2026-02-06 20:17:00.003959', 'low');
INSERT INTO public.notification VALUES (2785, 'likes', 'Mark Xu liked your comment: > I think it''s useful to seriously consider making solving huge global problems - including quite urgent ones - the alliance''s and our individual responsibilities.

Agreed, especially because nobody else in the world has assumed responsibility for their resolution (many dedicated people make important progress on these issues all the time, but nobody has stepped up to assume responsibility for the problems in full - who would or could?).

It sounds highly ambitious to assume this responsibility, and it is, but the classic advice is that if we want something to get done, the "buck" must stop somewhere.', '/forum/post/16?replyId=347', NULL, '2026-02-05 10:59:09.791155-08', '2026-02-05 10:59:45.987123-08', 7, NULL, 'forum_like:comment:347', 1, NULL, '2026-02-05 10:59:09.791155-08', '> I think it''s useful to seriously consider making solving huge global problems - including quite urgent ones - the alliance''s and our individual responsibilities.

Agreed, especially because nobody else in the world has assumed responsibility for their resolution (many dedicated people make important progress on these issues all the time, but nobody has stepped up to assume responsibility for the problems in full - who would or could?).

It sounds highly ambitious to assume this responsibility, and it is, but the classic advice is that if we want something to get done, the "buck" must stop somewhere.', NULL, '2026-02-05 18:59:45.987', true, NULL, '0b168a7bb35b4cbcbe797e2914e1d436', '2026-02-05 19:00:00.02821', 'low');
INSERT INTO public.notification VALUES (2779, 'likes', 'Sidney Hough liked your comment: Agreed - we think a lot about how to best convey the direction of the Alliance and the progress we have made. 

* We currently don''t have a roadmap of external goals because we have such high uncertainty over the impact we''ll be able to have. We have a small roadmap on our [Information](https://worldalliance.org/information) page. As we learn more, we hope to plan actions as part of a broader strategy to achieve specific objectives, which we will convey to members. To do this rigorously, we''ll need a large team of experts, and hope have such a team before we launch publicly.
* We made action updates more visible by now displaying the on the homepage after tasks are completed.', '/forum/post/16?replyId=345', NULL, '2026-02-05 10:30:25.123705-08', '2026-02-05 10:58:57.688668-08', 10, NULL, 'forum_like:comment:345', 1, NULL, '2026-02-05 10:30:25.123705-08', 'Agreed - we think a lot about how to best convey the direction of the Alliance and the progress we have made. 

* We currently don''t have a roadmap of external goals because we have such high uncertainty over the impact we''ll be able to have. We have a small roadmap on our [Information](https://worldalliance.org/information) page. As we learn more, we hope to plan actions as part of a broader strategy to achieve specific objectives, which we will convey to members. To do this rigorously, we''ll need a large team of experts, and hope have such a team before we launch publicly.
* We made action updates more visible by now displaying the on the homepage after tasks are completed.', NULL, '2026-02-05 18:58:57.689', true, NULL, '1149e11829c54c6f9e624d31f9a04077', '2026-02-05 18:31:00.125852', 'low');
INSERT INTO public.notification VALUES (2791, 'likes', 'Sidney Hough liked your comment: I like this concept, and generally find it fascinating when social harmony is maintained explicitly. I appreciate this attitude because I feel like cooperation/harmony are often invisible when things are going well, and so they are forgotten and do not receive attention/care needed to prevent them from degrading.', '/forum/post/16?replyId=346', NULL, '2026-02-05 13:00:58.950646-08', '2026-02-05 13:04:11.513761-08', 10, NULL, 'forum_like:comment:346', 1, NULL, '2026-02-05 13:00:58.950646-08', 'I like this concept, and generally find it fascinating when social harmony is maintained explicitly. I appreciate this attitude because I feel like cooperation/harmony are often invisible when things are going well, and so they are forgotten and do not receive attention/care needed to prevent them from degrading.', NULL, '2026-02-05 21:04:11.513', true, NULL, '85f4867120114fde9f38dffc63290677', '2026-02-05 21:01:00.174744', 'low');
INSERT INTO public.notification VALUES (2653, 'likes', '5 people liked your comment: A common thread between the theme of being outcome-focused and being  cooperative is the idea of humility (as @Bob Grand so nicely put it). Humility means, as members, being willing to recognize that we do not know everything the office is doing and to trust their hard work. Thus, we are not overly critical and are instead curious and patient. Humility also means that the office is willing to recognize their solutions might need improvement to become the best possible action; or, that the action may not work despite the best possible research, implementation, and intention, due to outside factors. For an endeavor as big and hopeful as this one, humility seems like a critical foundation for learning and eventual success.', '/forum/post/16?replyId=316', NULL, '2026-02-04 19:03:00.196588-08', '2026-02-05 17:38:57.868677-08', 24, NULL, 'forum_like:comment:316', 5, NULL, '2026-02-04 19:03:00.196588-08', 'A common thread between the theme of being outcome-focused and being  cooperative is the idea of humility (as @Bob Grand so nicely put it). Humility means, as members, being willing to recognize that we do not know everything the office is doing and to trust their hard work. Thus, we are not overly critical and are instead curious and patient. Humility also means that the office is willing to recognize their solutions might need improvement to become the best possible action; or, that the action may not work despite the best possible research, implementation, and intention, due to outside factors. For an endeavor as big and hopeful as this one, humility seems like a critical foundation for learning and eventual success.', NULL, '2026-02-06 01:38:57.868', true, NULL, 'ec9382b352674e70bb3ec52498890f54', '2026-02-05 03:04:00.135452', 'low');
INSERT INTO public.notification VALUES (2799, 'likes', '2 people liked your completion of: Read about Alliance growth plans', '/actions/73/activity/1461', NULL, '2026-02-05 19:36:45.139906-08', '2026-02-06 08:04:26.280784-08', 7, NULL, 'activity_like:1461', 2, NULL, '2026-02-05 19:36:45.139906-08', 'Read about Alliance growth plans', NULL, '2026-02-06 03:43:19.04', true, NULL, '5e0427dae6da4f4cb547efc2549794e3', '2026-02-06 03:37:00.007068', 'low');
INSERT INTO public.notification VALUES (2845, 'friend_request', 'Leo Chun wants to be friends', '/member/140', NULL, '2026-02-05 22:50:55.604097-08', '2026-02-05 22:50:55.604097-08', 11, NULL, NULL, NULL, NULL, '2026-02-05 22:50:55.604097-08', NULL, NULL, NULL, true, NULL, '1d38c54e1f9e40e8983fdf04ee1768d6', '2026-02-06 06:51:00.007055', 'high');
INSERT INTO public.notification VALUES (2899, 'friend_request_accepted', 'Clare Hao accepted your friend request', '/member/139', NULL, '2026-02-06 19:16:44.669237-08', '2026-02-07 11:38:13.157224-08', 10, NULL, NULL, NULL, NULL, '2026-02-06 19:16:44.669237-08', NULL, NULL, '2026-02-07 19:38:13.153', true, NULL, '0d7c1936c2b44901ad36b5cc99c79f9c', '2026-02-07 03:17:00.176749', 'low');
INSERT INTO public.notification VALUES (2866, 'member_joined_community', 'Jaden Peck joined your group (Grant''s Group)', '/groups?tab=members&communityId=1', NULL, '2026-02-06 11:32:34.69098-08', '2026-02-06 19:44:19.617486-08', 11, NULL, NULL, NULL, NULL, '2026-02-06 11:32:34.69098-08', NULL, NULL, '2026-02-07 03:44:19.617', true, NULL, 'db374e51235d4d84b4ee5a300cee82ef', '2026-02-06 19:33:00.15675', 'high');
INSERT INTO public.notification VALUES (2795, 'likes', '4 people liked your comment: > but if it comes to it, which may happen when the alliance strives for its higher goals, i don''t feel qualified to make decisions on if a cost to family A is outweighed by a benefit to family B. i''d like to see how other alliance members critically engage with actions that are deeply moral. would a majority agreement change my own morals? what measures will be used to justify an action?

We strongly desire to advance our priorities in a way that improves the world for everyone. Unfortunately, the world will force tradeoffs that mean it won''t always be possible to do this. I don''t think there''s an easy answer here, but agree that we should incorporate local knowledge, be highly cautious, and think carefully about all the consequences of our actions. 

We''ve also considered some other ways of approaching tradeoffs, although all of this is a bit hand-wavy and theoretical, and no general prescription can be made without knowing the specific details: 
* As we grow, we will develop a long-term plan that makes nearly everyone better off, and explain how specific actions are part of this plan. So actions with tradeoffs will ideally move us towards a long-term future without those tradeoffs.
* If the tradeoffs for an action are harsh, we might pair it with an action with the "opposite" tradeoffs, so both actions together result in nearly everyone being better off on a shorter timescale.
* In situations where tradeoffs are made, we will be extra careful to communicate the reasoning behind the tradeoff.', '/forum/post/16?replyId=349', NULL, '2026-02-05 14:00:57.322798-08', '2026-02-07 20:53:58.157051-08', 10, NULL, 'forum_like:comment:349', 4, NULL, '2026-02-05 14:00:57.322798-08', '> but if it comes to it, which may happen when the alliance strives for its higher goals, i don''t feel qualified to make decisions on if a cost to family A is outweighed by a benefit to family B. i''d like to see how other alliance members critically engage with actions that are deeply moral. would a majority agreement change my own morals? what measures will be used to justify an action?

We strongly desire to advance our priorities in a way that improves the world for everyone. Unfortunately, the world will force tradeoffs that mean it won''t always be possible to do this. I don''t think there''s an easy answer here, but agree that we should incorporate local knowledge, be highly cautious, and think carefully about all the consequences of our actions. 

We''ve also considered some other ways of approaching tradeoffs, although all of this is a bit hand-wavy and theoretical, and no general prescription can be made without knowing the specific details: 
* As we grow, we will develop a long-term plan that makes nearly everyone better off, and explain how specific actions are part of this plan. So actions with tradeoffs will ideally move us towards a long-term future without those tradeoffs.
* If the tradeoffs for an action are harsh, we might pair it with an action with the "opposite" tradeoffs, so both actions together result in nearly everyone being better off on a shorter timescale.
* In situations where tradeoffs are made, we will be extra careful to communicate the reasoning behind the tradeoff.', NULL, '2026-02-05 23:28:08.983', true, NULL, '230fc35cd6c74488a7b3d3f8234e9d8d', '2026-02-05 22:01:00.007437', 'low');
INSERT INTO public.notification VALUES (2909, 'friend_request_accepted', 'Nathan Tang accepted your friend request', '/member/130', NULL, '2026-02-07 20:46:43.417615-08', '2026-02-07 20:46:43.417615-08', 11, NULL, NULL, NULL, NULL, '2026-02-07 20:46:43.417615-08', NULL, NULL, NULL, true, NULL, 'e69c8b2b4ed646a09356068167f9c755', '2026-02-08 04:47:00.017862', 'low');
INSERT INTO public.notification VALUES (2222, 'likes', '10 people liked your comment: A principle I weigh heavily is **optimism**---the shared belief that coordinated action can change outcomes.

I believe in the promise of the Alliance, and I don''t think the Alliance can succeed without that belief being broadly held. The model asks people to reliably show up week after week, making small but meaningful contributions whose impact may not always be immediately visible. That only makes sense if Alliance members are optimistic that such actions compound and that collective effort pointed in the right direction can make nontrivial dents in big problems.

To uphold an optimistic culture, we can:

- Frequently share evidence of progress, even when it''s incremental
- Frame uncertainty as reassurance that the Alliance is tackling real problems, not as discouragement
- Remind ourselves that we''re participating in the Alliance because change is possible, not because it''s guaranteed

Here, optimism isn''t about certainty. It''s about choosing to believe that trust, coordination, and consistent steps can stack up against admittedly daunting issues. Without this belief, the Alliance cannot exist.', '/forum/post/16?replyId=268', NULL, '2026-01-29 22:07:39.737543-08', '2026-02-07 20:50:43.962541-08', 11, NULL, 'forum_like:comment:268', 10, NULL, '2026-01-29 22:07:39.737543-08', 'A principle I weigh heavily is **optimism**---the shared belief that coordinated action can change outcomes.

I believe in the promise of the Alliance, and I don''t think the Alliance can succeed without that belief being broadly held. The model asks people to reliably show up week after week, making small but meaningful contributions whose impact may not always be immediately visible. That only makes sense if Alliance members are optimistic that such actions compound and that collective effort pointed in the right direction can make nontrivial dents in big problems.

To uphold an optimistic culture, we can:

- Frequently share evidence of progress, even when it''s incremental
- Frame uncertainty as reassurance that the Alliance is tackling real problems, not as discouragement
- Remind ourselves that we''re participating in the Alliance because change is possible, not because it''s guaranteed

Here, optimism isn''t about certainty. It''s about choosing to believe that trust, coordination, and consistent steps can stack up against admittedly daunting issues. Without this belief, the Alliance cannot exist.', NULL, NULL, true, NULL, 'eee8d73c260c4a23ba8a44096b602d37', '2026-01-30 06:08:00.021701', 'low');


--
-- Data for Name: notification_associated_users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.notification_associated_users VALUES (100, 11);
INSERT INTO public.notification_associated_users VALUES (86, 15);
INSERT INTO public.notification_associated_users VALUES (97, 11);
INSERT INTO public.notification_associated_users VALUES (90, 10);
INSERT INTO public.notification_associated_users VALUES (87, 24);
INSERT INTO public.notification_associated_users VALUES (93, 10);
INSERT INTO public.notification_associated_users VALUES (96, 15);
INSERT INTO public.notification_associated_users VALUES (85, 11);
INSERT INTO public.notification_associated_users VALUES (91, 15);
INSERT INTO public.notification_associated_users VALUES (83, 11);
INSERT INTO public.notification_associated_users VALUES (309, 15);
INSERT INTO public.notification_associated_users VALUES (88, 24);
INSERT INTO public.notification_associated_users VALUES (92, 23);
INSERT INTO public.notification_associated_users VALUES (80, 10);
INSERT INTO public.notification_associated_users VALUES (94, 23);
INSERT INTO public.notification_associated_users VALUES (99, 11);
INSERT INTO public.notification_associated_users VALUES (122, 10);
INSERT INTO public.notification_associated_users VALUES (89, 24);
INSERT INTO public.notification_associated_users VALUES (95, 15);
INSERT INTO public.notification_associated_users VALUES (231, 23);
INSERT INTO public.notification_associated_users VALUES (232, 7);
INSERT INTO public.notification_associated_users VALUES (236, 7);
INSERT INTO public.notification_associated_users VALUES (241, 7);
INSERT INTO public.notification_associated_users VALUES (249, 24);
INSERT INTO public.notification_associated_users VALUES (243, 11);
INSERT INTO public.notification_associated_users VALUES (247, 7);
INSERT INTO public.notification_associated_users VALUES (256, 15);
INSERT INTO public.notification_associated_users VALUES (269, 24);
INSERT INTO public.notification_associated_users VALUES (371, 7);
INSERT INTO public.notification_associated_users VALUES (382, 10);
INSERT INTO public.notification_associated_users VALUES (383, 10);
INSERT INTO public.notification_associated_users VALUES (382, 7);
INSERT INTO public.notification_associated_users VALUES (392, 10);
INSERT INTO public.notification_associated_users VALUES (394, 7);
INSERT INTO public.notification_associated_users VALUES (394, 10);
INSERT INTO public.notification_associated_users VALUES (395, 10);
INSERT INTO public.notification_associated_users VALUES (396, 10);
INSERT INTO public.notification_associated_users VALUES (403, 7);
INSERT INTO public.notification_associated_users VALUES (404, 10);
INSERT INTO public.notification_associated_users VALUES (458, 7);
INSERT INTO public.notification_associated_users VALUES (458, 10);
INSERT INTO public.notification_associated_users VALUES (459, 10);
INSERT INTO public.notification_associated_users VALUES (461, 7);
INSERT INTO public.notification_associated_users VALUES (462, 10);
INSERT INTO public.notification_associated_users VALUES (522, 10);
INSERT INTO public.notification_associated_users VALUES (522, 7);
INSERT INTO public.notification_associated_users VALUES (522, 15);
INSERT INTO public.notification_associated_users VALUES (529, 10);
INSERT INTO public.notification_associated_users VALUES (529, 7);
INSERT INTO public.notification_associated_users VALUES (536, 10);
INSERT INTO public.notification_associated_users VALUES (537, 7);
INSERT INTO public.notification_associated_users VALUES (541, 10);
INSERT INTO public.notification_associated_users VALUES (541, 7);
INSERT INTO public.notification_associated_users VALUES (551, 7);
INSERT INTO public.notification_associated_users VALUES (551, 10);
INSERT INTO public.notification_associated_users VALUES (610, 7);
INSERT INTO public.notification_associated_users VALUES (628, 10);
INSERT INTO public.notification_associated_users VALUES (628, 7);
INSERT INTO public.notification_associated_users VALUES (633, 7);
INSERT INTO public.notification_associated_users VALUES (633, 10);
INSERT INTO public.notification_associated_users VALUES (551, 11);
INSERT INTO public.notification_associated_users VALUES (537, 11);
INSERT INTO public.notification_associated_users VALUES (536, 11);
INSERT INTO public.notification_associated_users VALUES (529, 11);
INSERT INTO public.notification_associated_users VALUES (703, 7);
INSERT INTO public.notification_associated_users VALUES (703, 10);
INSERT INTO public.notification_associated_users VALUES (710, 10);
INSERT INTO public.notification_associated_users VALUES (712, 7);
INSERT INTO public.notification_associated_users VALUES (717, 10);
INSERT INTO public.notification_associated_users VALUES (717, 7);
INSERT INTO public.notification_associated_users VALUES (789, 10);
INSERT INTO public.notification_associated_users VALUES (790, 7);
INSERT INTO public.notification_associated_users VALUES (789, 7);
INSERT INTO public.notification_associated_users VALUES (805, 7);
INSERT INTO public.notification_associated_users VALUES (806, 7);
INSERT INTO public.notification_associated_users VALUES (834, 10);
INSERT INTO public.notification_associated_users VALUES (836, 10);
INSERT INTO public.notification_associated_users VALUES (834, 7);
INSERT INTO public.notification_associated_users VALUES (836, 7);
INSERT INTO public.notification_associated_users VALUES (856, 7);
INSERT INTO public.notification_associated_users VALUES (856, 10);
INSERT INTO public.notification_associated_users VALUES (930, 10);
INSERT INTO public.notification_associated_users VALUES (931, 7);
INSERT INTO public.notification_associated_users VALUES (940, 10);
INSERT INTO public.notification_associated_users VALUES (941, 7);
INSERT INTO public.notification_associated_users VALUES (951, 10);
INSERT INTO public.notification_associated_users VALUES (951, 7);
INSERT INTO public.notification_associated_users VALUES (973, 7);
INSERT INTO public.notification_associated_users VALUES (996, 10);
INSERT INTO public.notification_associated_users VALUES (997, 10);
INSERT INTO public.notification_associated_users VALUES (996, 7);
INSERT INTO public.notification_associated_users VALUES (997, 7);
INSERT INTO public.notification_associated_users VALUES (1040, 10);
INSERT INTO public.notification_associated_users VALUES (1041, 10);
INSERT INTO public.notification_associated_users VALUES (1041, 7);
INSERT INTO public.notification_associated_users VALUES (1040, 7);
INSERT INTO public.notification_associated_users VALUES (1063, 7);
INSERT INTO public.notification_associated_users VALUES (1063, 10);
INSERT INTO public.notification_associated_users VALUES (1065, 10);
INSERT INTO public.notification_associated_users VALUES (1068, 10);
INSERT INTO public.notification_associated_users VALUES (806, 10);
INSERT INTO public.notification_associated_users VALUES (1098, 10);
INSERT INTO public.notification_associated_users VALUES (1115, 7);
INSERT INTO public.notification_associated_users VALUES (1118, 10);
INSERT INTO public.notification_associated_users VALUES (1118, 7);
INSERT INTO public.notification_associated_users VALUES (1129, 10);
INSERT INTO public.notification_associated_users VALUES (1129, 7);
INSERT INTO public.notification_associated_users VALUES (1098, 11);
INSERT INTO public.notification_associated_users VALUES (1129, 11);
INSERT INTO public.notification_associated_users VALUES (1115, 11);
INSERT INTO public.notification_associated_users VALUES (1146, 10);
INSERT INTO public.notification_associated_users VALUES (1148, 10);
INSERT INTO public.notification_associated_users VALUES (1146, 7);
INSERT INTO public.notification_associated_users VALUES (1156, 7);
INSERT INTO public.notification_associated_users VALUES (1157, 7);
INSERT INTO public.notification_associated_users VALUES (1157, 10);
INSERT INTO public.notification_associated_users VALUES (1160, 10);
INSERT INTO public.notification_associated_users VALUES (1161, 10);
INSERT INTO public.notification_associated_users VALUES (1162, 7);
INSERT INTO public.notification_associated_users VALUES (1162, 10);
INSERT INTO public.notification_associated_users VALUES (1196, 7);
INSERT INTO public.notification_associated_users VALUES (1205, 10);
INSERT INTO public.notification_associated_users VALUES (1214, 10);
INSERT INTO public.notification_associated_users VALUES (1214, 7);
INSERT INTO public.notification_associated_users VALUES (1269, 10);
INSERT INTO public.notification_associated_users VALUES (1275, 10);
INSERT INTO public.notification_associated_users VALUES (1269, 11);
INSERT INTO public.notification_associated_users VALUES (1269, 7);
INSERT INTO public.notification_associated_users VALUES (1401, 10);
INSERT INTO public.notification_associated_users VALUES (1404, 10);
INSERT INTO public.notification_associated_users VALUES (1408, 7);
INSERT INTO public.notification_associated_users VALUES (1415, 10);
INSERT INTO public.notification_associated_users VALUES (1416, 7);
INSERT INTO public.notification_associated_users VALUES (1417, 15);
INSERT INTO public.notification_associated_users VALUES (1418, 7);
INSERT INTO public.notification_associated_users VALUES (1418, 10);
INSERT INTO public.notification_associated_users VALUES (1420, 23);
INSERT INTO public.notification_associated_users VALUES (1421, 23);
INSERT INTO public.notification_associated_users VALUES (1426, 10);
INSERT INTO public.notification_associated_users VALUES (1427, 10);
INSERT INTO public.notification_associated_users VALUES (1428, 10);
INSERT INTO public.notification_associated_users VALUES (1436, 10);
INSERT INTO public.notification_associated_users VALUES (1438, 10);
INSERT INTO public.notification_associated_users VALUES (1401, 11);
INSERT INTO public.notification_associated_users VALUES (1439, 11);
INSERT INTO public.notification_associated_users VALUES (1441, 11);
INSERT INTO public.notification_associated_users VALUES (1442, 11);
INSERT INTO public.notification_associated_users VALUES (1450, 10);
INSERT INTO public.notification_associated_users VALUES (1453, 10);
INSERT INTO public.notification_associated_users VALUES (1462, 7);
INSERT INTO public.notification_associated_users VALUES (1463, 7);
INSERT INTO public.notification_associated_users VALUES (1462, 10);
INSERT INTO public.notification_associated_users VALUES (1463, 10);
INSERT INTO public.notification_associated_users VALUES (1464, 10);
INSERT INTO public.notification_associated_users VALUES (1450, 7);
INSERT INTO public.notification_associated_users VALUES (1671, 10);
INSERT INTO public.notification_associated_users VALUES (1672, 10);
INSERT INTO public.notification_associated_users VALUES (1671, 7);
INSERT INTO public.notification_associated_users VALUES (1672, 7);
INSERT INTO public.notification_associated_users VALUES (1763, 10);
INSERT INTO public.notification_associated_users VALUES (1765, 10);
INSERT INTO public.notification_associated_users VALUES (1778, 10);
INSERT INTO public.notification_associated_users VALUES (1779, 7);
INSERT INTO public.notification_associated_users VALUES (1789, 10);
INSERT INTO public.notification_associated_users VALUES (1790, 10);
INSERT INTO public.notification_associated_users VALUES (1808, 10);
INSERT INTO public.notification_associated_users VALUES (1820, 10);
INSERT INTO public.notification_associated_users VALUES (1824, 10);
INSERT INTO public.notification_associated_users VALUES (1831, 10);
INSERT INTO public.notification_associated_users VALUES (2152, 10);
INSERT INTO public.notification_associated_users VALUES (2153, 7);
INSERT INTO public.notification_associated_users VALUES (2154, 10);
INSERT INTO public.notification_associated_users VALUES (2179, 10);
INSERT INTO public.notification_associated_users VALUES (2186, 7);
INSERT INTO public.notification_associated_users VALUES (2201, 10);
INSERT INTO public.notification_associated_users VALUES (2206, 7);
INSERT INTO public.notification_associated_users VALUES (2153, 11);
INSERT INTO public.notification_associated_users VALUES (2154, 11);
INSERT INTO public.notification_associated_users VALUES (2220, 11);
INSERT INTO public.notification_associated_users VALUES (2221, 11);
INSERT INTO public.notification_associated_users VALUES (2222, 7);
INSERT INTO public.notification_associated_users VALUES (2222, 10);
INSERT INTO public.notification_associated_users VALUES (2223, 10);
INSERT INTO public.notification_associated_users VALUES (2225, 10);
INSERT INTO public.notification_associated_users VALUES (2225, 7);
INSERT INTO public.notification_associated_users VALUES (2420, 10);
INSERT INTO public.notification_associated_users VALUES (2426, 10);
INSERT INTO public.notification_associated_users VALUES (2445, 11);
INSERT INTO public.notification_associated_users VALUES (2457, 10);
INSERT INTO public.notification_associated_users VALUES (2492, 10);
INSERT INTO public.notification_associated_users VALUES (2505, 10);
INSERT INTO public.notification_associated_users VALUES (2506, 10);
INSERT INTO public.notification_associated_users VALUES (2507, 7);
INSERT INTO public.notification_associated_users VALUES (2508, 7);
INSERT INTO public.notification_associated_users VALUES (2511, 7);
INSERT INTO public.notification_associated_users VALUES (2506, 11);
INSERT INTO public.notification_associated_users VALUES (2153, 24);
INSERT INTO public.notification_associated_users VALUES (2154, 24);
INSERT INTO public.notification_associated_users VALUES (2524, 10);
INSERT INTO public.notification_associated_users VALUES (2640, 24);
INSERT INTO public.notification_associated_users VALUES (2641, 24);
INSERT INTO public.notification_associated_users VALUES (2653, 7);
INSERT INTO public.notification_associated_users VALUES (2653, 10);
INSERT INTO public.notification_associated_users VALUES (2671, 10);
INSERT INTO public.notification_associated_users VALUES (2737, 10);
INSERT INTO public.notification_associated_users VALUES (2737, 11);
INSERT INTO public.notification_associated_users VALUES (2779, 7);
INSERT INTO public.notification_associated_users VALUES (2782, 10);
INSERT INTO public.notification_associated_users VALUES (2785, 10);
INSERT INTO public.notification_associated_users VALUES (2790, 7);
INSERT INTO public.notification_associated_users VALUES (2791, 7);
INSERT INTO public.notification_associated_users VALUES (2795, 7);
INSERT INTO public.notification_associated_users VALUES (2799, 10);
INSERT INTO public.notification_associated_users VALUES (2819, 10);
INSERT INTO public.notification_associated_users VALUES (2822, 7);
INSERT INTO public.notification_associated_users VALUES (2837, 10);
INSERT INTO public.notification_associated_users VALUES (2862, 10);
INSERT INTO public.notification_associated_users VALUES (2872, 10);
INSERT INTO public.notification_associated_users VALUES (2889, 10);
INSERT INTO public.notification_associated_users VALUES (2890, 10);


--
-- Data for Name: onetime_invite; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: onetime_invite_request; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: participant; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: payment_user_data_token; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.payment_user_data_token VALUES ('258c8be4-c402-4542-b9a8-f3e57a4cde7f', 'pi_3RdkfsQ3i6almwvv0vmZ7rMM', NULL, NULL, NULL);
INSERT INTO public.payment_user_data_token VALUES ('77d6f2d9-c0a6-48bf-ab16-47d81537a221', 'pi_3Rdkh8Q3i6almwvv0zkvcNWp', NULL, NULL, NULL);
INSERT INTO public.payment_user_data_token VALUES ('d85ca023-1fe7-4619-942e-a47c22e7005b', 'pi_3RdkhUQ3i6almwvv1VE0KkoG', NULL, NULL, NULL);
INSERT INTO public.payment_user_data_token VALUES ('472ce134-41f9-4c0f-8d31-4956fa8a0b4a', 'pi_3RdkhVQ3i6almwvv2sA3KnTt', NULL, NULL, NULL);
INSERT INTO public.payment_user_data_token VALUES ('08a6eed6-b04b-4cba-a8e3-79cee2180c90', 'pi_3RdkhWQ3i6almwvv1vpXRKgO', NULL, NULL, NULL);
INSERT INTO public.payment_user_data_token VALUES ('54b21013-1f00-467f-b90a-ec23bfb897d6', 'pi_3RdkhYQ3i6almwvv2NyWXsqW', NULL, NULL, NULL);
INSERT INTO public.payment_user_data_token VALUES ('c3a30b2f-2245-4e58-98be-71beeaeaf69f', 'pi_3RdxEAQ3i6almwvv16AoXOwu', NULL, NULL, NULL);
INSERT INTO public.payment_user_data_token VALUES ('03f2646f-e984-4363-b368-57d143e7f89c', 'pi_3RgvjJQ3i6almwvv2xEc1AFn', NULL, NULL, NULL);
INSERT INTO public.payment_user_data_token VALUES ('af04445e-302a-4705-b46c-11b2d4223f1f', 'pi_3RhIxkQ3i6almwvv2VhI1JXy', NULL, NULL, NULL);
INSERT INTO public.payment_user_data_token VALUES ('565396ec-1c75-4bf3-8b0f-9d87a62a2655', 'pi_3RhaPjQ3i6almwvv01NIxxBb', NULL, NULL, NULL);


--
-- Data for Name: personal_action_reminder; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: post; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.post VALUES (5, 'Code of Conduct', 10, NULL, '2025-08-29 16:42:42.384886-07', '2025-10-10 14:02:43.398878-07', false, true, 3, '2025-08-29 16:42:42.384886-07', false, NULL);
INSERT INTO public.post VALUES (8, 'test post', 15, NULL, '2025-10-15 11:19:23.878022-07', '2025-10-15 11:20:32.890105-07', true, false, 62, '2025-10-18 02:19:00-07', false, NULL);
INSERT INTO public.post VALUES (9, 'Discussion on "Global inequality is huge”', 10, NULL, '2025-10-15 11:54:27.463538-07', '2025-10-28 21:51:34.698-07', false, false, 63, '2025-10-23 09:52:37.047-07', false, NULL);
INSERT INTO public.post VALUES (12, 'Public comment discussion', 7, NULL, '2025-12-23 20:54:29.616475-08', '2025-12-24 21:27:10.103204-08', true, false, 137, '2025-12-29 20:00:00-08', false, NULL);
INSERT INTO public.post VALUES (6, 'Personal habit changes to be trialed by 100 members', 7, NULL, '2025-09-16 17:12:59.287532-07', '2025-12-31 17:12:28.897-08', false, false, 14, '2025-09-16 17:12:59.287532-07', false, NULL);
INSERT INTO public.post VALUES (16, 'Alliance culture discussion', 10, NULL, '2026-01-28 17:46:14.72598-08', '2026-02-08 16:28:59.717-08', false, false, 248, '2026-02-04 20:38:33.26-08', false, NULL);
INSERT INTO public.post VALUES (15, 'Expert Q&A on U.S. withdrawal from international institutions', 7, NULL, '2026-01-13 14:25:37.909104-08', '2026-01-28 22:41:20.382-08', false, false, 153, '2026-01-13 14:25:37.907-08', true, NULL);


--
-- Data for Name: post_authors_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.post_authors_user VALUES (5, 10);
INSERT INTO public.post_authors_user VALUES (8, 15);
INSERT INTO public.post_authors_user VALUES (9, 10);
INSERT INTO public.post_authors_user VALUES (12, 7);
INSERT INTO public.post_authors_user VALUES (6, 7);
INSERT INTO public.post_authors_user VALUES (15, 7);
INSERT INTO public.post_authors_user VALUES (16, 10);
INSERT INTO public.post_authors_user VALUES (16, 7);


--
-- Data for Name: post_experts_user; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: post_likes_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.post_likes_user VALUES (5, 7);
INSERT INTO public.post_likes_user VALUES (6, 15);
INSERT INTO public.post_likes_user VALUES (5, 15);
INSERT INTO public.post_likes_user VALUES (6, 10);
INSERT INTO public.post_likes_user VALUES (9, 7);
INSERT INTO public.post_likes_user VALUES (9, 15);
INSERT INTO public.post_likes_user VALUES (9, 11);
INSERT INTO public.post_likes_user VALUES (9, 24);
INSERT INTO public.post_likes_user VALUES (15, 10);
INSERT INTO public.post_likes_user VALUES (15, 11);
INSERT INTO public.post_likes_user VALUES (16, 7);
INSERT INTO public.post_likes_user VALUES (16, 10);
INSERT INTO public.post_likes_user VALUES (16, 11);
INSERT INTO public.post_likes_user VALUES (16, 24);


--
-- Data for Name: prefill_user; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: push; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: recent_search; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: reminder_group; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: reminder_group_users; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: tag; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tag VALUES ('Staff', 'alliance strategic office staff', NULL, '2025-09-24 21:53:01.935484-07', '2025-09-24 21:53:01.935484-07', 'dceb6979-92eb-4ce1-a708-89dce907c808');
INSERT INTO public.tag VALUES ('All Members', 'every alliance member', NULL, '2025-10-21 10:24:14.290786-07', '2025-10-21 10:24:14.290786-07', 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.tag VALUES ('Mark', 'just Mark', NULL, '2025-10-25 13:49:57.469335-07', '2025-10-25 13:49:57.469335-07', '91ebbc8b-b416-49d2-bd70-d023acab72da');
INSERT INTO public.tag VALUES ('non-US', 'tag for non-US-based members', NULL, '2026-01-21 11:16:02.235201-08', '2026-01-21 11:16:02.235201-08', '17b76614-3266-4aa4-87c8-2f29516253c1');


--
-- Data for Name: tag_participating_in_action; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: tag_users_user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.tag_users_user VALUES (7, 'dceb6979-92eb-4ce1-a708-89dce907c808');
INSERT INTO public.tag_users_user VALUES (10, 'dceb6979-92eb-4ce1-a708-89dce907c808');
INSERT INTO public.tag_users_user VALUES (15, 'dceb6979-92eb-4ce1-a708-89dce907c808');
INSERT INTO public.tag_users_user VALUES (24, 'dceb6979-92eb-4ce1-a708-89dce907c808');
INSERT INTO public.tag_users_user VALUES (7, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.tag_users_user VALUES (10, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.tag_users_user VALUES (15, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.tag_users_user VALUES (23, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.tag_users_user VALUES (11, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.tag_users_user VALUES (24, 'df2912a1-3ea3-463a-b4b9-ee68bb7e4e28');
INSERT INTO public.tag_users_user VALUES (10, '91ebbc8b-b416-49d2-bd70-d023acab72da');
INSERT INTO public.tag_users_user VALUES (23, 'dceb6979-92eb-4ce1-a708-89dce907c808');


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."user" VALUES (10, 'Mark Xu', 'user10@example.com', '$2b$10$xmfGrvkaIvhgzruAUoRwguo3dCVj1L1Umya1m77gN/qFDsgNcVB0O', '2025-07-18 15:00:55.747984-07', '2026-01-29 14:32:32.972331-08', true, '1763446793321.webp', 'I lead the Alliance with [Sidney Hough](https://worldalliance.org/member/7). I''m interested in the ways that trust facilitates coordination.

I was previously a researcher at the [Alignment Research Center](https://alignment.org), where I worked to prevent AI deception. Before that, I studied mathematics and computer science at Caltech.

I live in San Francisco, California, USA. I enjoy backpacking, birding, and cooking. My personal website is [markxu.com](https://markxu.com).', NULL, NULL, NULL, 'xcqtspgf0gh', 'cus_SuDJdOQPrx9zGb', false, false, '15550100', true, false, false, 'all', false, true, true, false, true, NULL, 'off', '19:00:00', 'America/Los_Angeles', 'text', true, true, 'public', NULL, true, true, true, true, NULL, false, true, NULL, NULL);
INSERT INTO public."user" VALUES (23, 'Shreshth Srivastava', 'user23@example.com', '$2b$10$xmfGrvkaIvhgzruAUoRwguo3dCVj1L1Umya1m77gN/qFDsgNcVB0O', '2025-09-17 15:10:03.504731-07', '2026-01-13 15:32:04.645122-08', false, '1758150707124.webp', 'Trying to help others as much as I can :)', NULL, 7, NULL, 'lsupo9yhyoo', 'cus_T4cnObOBwfmzJ0', false, false, '15550100', true, false, false, 'all', false, false, true, true, false, NULL, 'off', '14:00:00', 'America/Los_Angeles', 'text', true, false, 'private', NULL, true, true, true, true, NULL, false, true, NULL, NULL);
INSERT INTO public."user" VALUES (15, 'Casey Manning', 'user15@example.com', '$2b$10$xmfGrvkaIvhgzruAUoRwguo3dCVj1L1Umya1m77gN/qFDsgNcVB0O', '2025-08-29 11:05:45.56292-07', '2026-01-28 16:21:32.355722-08', true, '1759615494554.webp', 'Tell me if you find any bugs.', NULL, 7, NULL, '0n8p16at3wh', 'cus_T336rBi3rwzkRs', false, false, '15550100', true, false, false, 'all', false, false, true, true, true, NULL, 'off', '16:00:00', 'America/Los_Angeles', 'text', true, true, 'public', '', true, true, true, true, NULL, false, true, NULL, NULL);
INSERT INTO public."user" VALUES (24, 'Eamon OCearuil', 'user24@example.com', '$2b$10$xmfGrvkaIvhgzruAUoRwguo3dCVj1L1Umya1m77gN/qFDsgNcVB0O', '2025-09-17 15:27:59.696436-07', '2026-01-12 12:56:50.365104-08', false, '1760472541034.webp', 'I believe that most of the challenges we face can be solved through coordinated, collective action.

', NULL, 7, NULL, 'lw1i4hq76hs', 'cus_TaTVZxK6TDfpF6', false, false, '15550100', true, false, false, 'all', false, true, true, true, false, NULL, 'off', '14:30:00', 'America/Bogota', 'text', true, true, 'public', NULL, false, true, true, true, NULL, false, true, NULL, NULL);
INSERT INTO public."user" VALUES (11, 'Grant Hough', 'user11@example.com', '$2b$10$xmfGrvkaIvhgzruAUoRwguo3dCVj1L1Umya1m77gN/qFDsgNcVB0O', '2025-08-24 17:27:12.008249-07', '2026-01-29 14:13:45.838137-08', true, '1769724825763.webp', 'I study EECS @ UC Berkeley. I like skiing, biking, hiking, and taking pictures.

[granthough.com](https://granthough.com)', true, 7, NULL, 'wrpzq7q80jm', 'cus_Svfb45M1kT3AOP', false, false, '15550100', true, false, false, 'all', false, true, true, true, false, NULL, 'off', '12:00:00', 'America/Los_Angeles', 'text', true, true, 'public', '', true, true, true, true, NULL, false, true, NULL, NULL);
INSERT INTO public."user" VALUES (7, 'Sidney Hough', 'user7@example.com', '$2b$10$xmfGrvkaIvhgzruAUoRwguo3dCVj1L1Umya1m77gN/qFDsgNcVB0O', '2025-07-04 09:55:18.151271-07', '2026-01-27 13:29:02.689053-08', true, '1758062160555.webp', 'I lead the Alliance with [Mark Xu](https://worldalliance.org/member/10). I believe that if individual people around the world can rely on one another, we can make significant progress on our greatest shared problems. I am personally excited about how we can eventually conduct large-scale nature preservation and restoration.

I live in San Francisco, California, USA. [sidney.com](https://sidney.com)', NULL, NULL, NULL, '09vjxetx3lwd', 'cus_SuDKRrE9Dr3ByM', false, false, '15550100', true, false, false, 'all', false, true, true, true, true, NULL, 'daily', '20:00:00', 'America/Los_Angeles', 'text', true, true, 'public', NULL, true, true, true, true, NULL, false, true, NULL, NULL);


--
-- Data for Name: user_action; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_away_range; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_away_range VALUES (6, 24, '2025-12-21 21:00:00-08', '2026-01-03 20:59:00-08', 'Christmas travel', 'vacation', '2025-12-11 14:43:15.06617-08', '2025-12-11 14:43:15.06617-08');
INSERT INTO public.user_away_range VALUES (31, 15, '2026-01-16 00:00:00-08', '2026-01-30 23:59:00-08', NULL, 'vacation', '2026-01-09 13:01:23.801039-08', '2026-01-09 13:01:23.801039-08');
INSERT INTO public.user_away_range VALUES (32, 11, '2026-01-09 00:00:00-08', '2026-01-16 23:59:00-08', 'Skiing', 'vacation', '2026-01-09 19:27:36.07845-08', '2026-01-09 19:27:36.07845-08');


--
-- Data for Name: user_device; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: action_activity_comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.action_activity_comment_id_seq', 1, false);


--
-- Name: action_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.action_activity_id_seq', 1547, true);


--
-- Name: action_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.action_event_id_seq', 165, true);


--
-- Name: action_event_notif_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.action_event_notif_id_seq', 4418, true);


--
-- Name: action_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.action_id_seq', 75, true);


--
-- Name: action_reminder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.action_reminder_id_seq', 26, true);


--
-- Name: action_stats_record_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.action_stats_record_id_seq', 33, true);


--
-- Name: action_suite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.action_suite_id_seq', 21, true);


--
-- Name: action_update_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.action_update_id_seq', 13, true);


--
-- Name: comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.comment_id_seq', 361, true);


--
-- Name: communique_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.communique_id_seq', 1, false);


--
-- Name: community_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.community_id_seq', 17, true);


--
-- Name: community_invite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.community_invite_id_seq', 2, true);


--
-- Name: contract_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.contract_event_id_seq', 123, true);


--
-- Name: conversation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.conversation_id_seq', 83, true);


--
-- Name: custom_validator_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.custom_validator_id_seq', 31, true);


--
-- Name: daily_stats_record_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.daily_stats_record_id_seq', 62, true);


--
-- Name: editable_content_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.editable_content_id_seq', 355, true);


--
-- Name: form_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.form_id_seq', 68, true);


--
-- Name: form_response_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.form_response_id_seq', 1570, true);


--
-- Name: forum_digest_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.forum_digest_log_id_seq', 8, true);


--
-- Name: friend_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.friend_id_seq', 354, true);


--
-- Name: group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.group_id_seq', 4, true);


--
-- Name: image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.image_id_seq', 1, false);


--
-- Name: mail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mail_id_seq', 752, true);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 244, true);


--
-- Name: mms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mms_id_seq', 1386, true);


--
-- Name: notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notification_id_seq', 2939, true);


--
-- Name: onetime_invite_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.onetime_invite_id_seq', 149, true);


--
-- Name: onetime_invite_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.onetime_invite_request_id_seq', 1, false);


--
-- Name: participant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.participant_id_seq', 269, true);


--
-- Name: personal_action_reminder_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.personal_action_reminder_id_seq', 1, false);


--
-- Name: post_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.post_id_seq', 16, true);


--
-- Name: prefill_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prefill_user_id_seq', 1, false);


--
-- Name: push_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.push_id_seq', 1, false);


--
-- Name: recent_search_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recent_search_id_seq', 526, true);


--
-- Name: reminder_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reminder_group_id_seq', 97, true);


--
-- Name: user_action_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_action_id_seq', 29, true);


--
-- Name: user_away_range_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_away_range_id_seq', 38, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_id_seq', 145, true);


--
-- Name: action_activity_comment PK_015f6a0d836728246f6b657cae0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_comment
    ADD CONSTRAINT "PK_015f6a0d836728246f6b657cae0" PRIMARY KEY (id);


--
-- Name: user_device PK_0232591a0b48e1eb92f3ec5d0d1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_device
    ADD CONSTRAINT "PK_0232591a0b48e1eb92f3ec5d0d1" PRIMARY KEY (id);


--
-- Name: recent_search PK_028dfa7d985553e500797e1b8c8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recent_search
    ADD CONSTRAINT "PK_028dfa7d985553e500797e1b8c8" PRIMARY KEY (id);


--
-- Name: post_authors_user PK_04a9cea1a823a059cdefb41d1b1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_authors_user
    ADD CONSTRAINT "PK_04a9cea1a823a059cdefb41d1b1" PRIMARY KEY ("postId", "userId");


--
-- Name: action_suite PK_051c30af2740df553849334cf46; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_suite
    ADD CONSTRAINT "PK_051c30af2740df553849334cf46" PRIMARY KEY (id);


--
-- Name: tag_users_user PK_095c7eb736c8f563d9066c8b0a6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_users_user
    ADD CONSTRAINT "PK_095c7eb736c8f563d9066c8b0a6" PRIMARY KEY ("tagId", "userId");


--
-- Name: action_participating_tags_tag PK_0a6c24ad104c01e8fb53ceaa543; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_participating_tags_tag
    ADD CONSTRAINT "PK_0a6c24ad104c01e8fb53ceaa543" PRIMARY KEY ("actionId", "tagId");


--
-- Name: comment PK_0b0e4bbc8415ec426f87f3a88e2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY (id);


--
-- Name: comment_likes_user PK_0ccf128d9efb17164fd55b75ef3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_likes_user
    ADD CONSTRAINT "PK_0ccf128d9efb17164fd55b75ef3" PRIMARY KEY ("commentId", "userId");


--
-- Name: action_activity_comment_likes_user PK_0e200f4fb2e6e108d13ac288fd9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_comment_likes_user
    ADD CONSTRAINT "PK_0e200f4fb2e6e108d13ac288fd9" PRIMARY KEY ("actionActivityCommentId", "userId");


--
-- Name: action_reminder_users_user PK_1a5c8ed8aff6278b38f4adcbdd9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_reminder_users_user
    ADD CONSTRAINT "PK_1a5c8ed8aff6278b38f4adcbdd9" PRIMARY KEY ("actionReminderId", "userId");


--
-- Name: friend PK_1b301ac8ac5fcee876db96069b6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend
    ADD CONSTRAINT "PK_1b301ac8ac5fcee876db96069b6" PRIMARY KEY (id);


--
-- Name: group PK_256aa0fda9b1de1a73ee0b7106b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."group"
    ADD CONSTRAINT "PK_256aa0fda9b1de1a73ee0b7106b" PRIMARY KEY (id);


--
-- Name: action PK_2d9db9cf5edfbbae74eb56e3a39; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action
    ADD CONSTRAINT "PK_2d9db9cf5edfbbae74eb56e3a39" PRIMARY KEY (id);


--
-- Name: prefill_user PK_340c83004e4f9df9b9807750f71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prefill_user
    ADD CONSTRAINT "PK_340c83004e4f9df9b9807750f71" PRIMARY KEY (id);


--
-- Name: tag_participating_in_action PK_368d457b6a338de19d40a37b8a5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_participating_in_action
    ADD CONSTRAINT "PK_368d457b6a338de19d40a37b8a5" PRIMARY KEY ("tagId", "actionId");


--
-- Name: community_invite PK_3fa26c1d014add9faa6a191892b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_invite
    ADD CONSTRAINT "PK_3fa26c1d014add9faa6a191892b" PRIMARY KEY (id);


--
-- Name: action_update PK_40d41e727317ac0cdc2d4e166a7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_update
    ADD CONSTRAINT "PK_40d41e727317ac0cdc2d4e166a7" PRIMARY KEY (id);


--
-- Name: onetime_invite_request PK_44edb7bc42046b57df3e46aaa0f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onetime_invite_request
    ADD CONSTRAINT "PK_44edb7bc42046b57df3e46aaa0f" PRIMARY KEY (id);


--
-- Name: action_participating_groups_group PK_51d6e627aa19c844033f94f5ce5; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_participating_groups_group
    ADD CONSTRAINT "PK_51d6e627aa19c844033f94f5ce5" PRIMARY KEY ("actionId", "groupId");


--
-- Name: mail PK_5407da42b983ba54c6c62d462d3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mail
    ADD CONSTRAINT "PK_5407da42b983ba54c6c62d462d3" PRIMARY KEY (id);


--
-- Name: group_participating_in_action PK_58d69b0e23ec82c907a6bd306dd; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_participating_in_action
    ADD CONSTRAINT "PK_58d69b0e23ec82c907a6bd306dd" PRIMARY KEY ("groupId", "actionId");


--
-- Name: form_response PK_590558d307109b9ee2aa8f8e8e2; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_response
    ADD CONSTRAINT "PK_590558d307109b9ee2aa8f8e8e2" PRIMARY KEY (id);


--
-- Name: participant PK_64da4237f502041781ca15d4c41; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participant
    ADD CONSTRAINT "PK_64da4237f502041781ca15d4c41" PRIMARY KEY (id);


--
-- Name: action_authors_user PK_6768188568e61ffce02d6486224; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_authors_user
    ADD CONSTRAINT "PK_6768188568e61ffce02d6486224" PRIMARY KEY ("actionId", "userId");


--
-- Name: communique_users_read PK_6c4af504a28d4d007a34ec09029; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communique_users_read
    ADD CONSTRAINT "PK_6c4af504a28d4d007a34ec09029" PRIMARY KEY ("communiqueId", "userId");


--
-- Name: personal_action_reminder PK_6d4846ed4254ec57d30429078d8; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_action_reminder
    ADD CONSTRAINT "PK_6d4846ed4254ec57d30429078d8" PRIMARY KEY (id);


--
-- Name: notification PK_705b6c7cdf9b2c2ff7ac7872cb7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY (id);


--
-- Name: action_stats_record PK_73963760a90135214e0a60387f0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_stats_record
    ADD CONSTRAINT "PK_73963760a90135214e0a60387f0" PRIMARY KEY (id);


--
-- Name: action_manual_cohort_users_user PK_7fee82bdbd4354a011282584e71; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_manual_cohort_users_user
    ADD CONSTRAINT "PK_7fee82bdbd4354a011282584e71" PRIMARY KEY ("actionId", "userId");


--
-- Name: notification_associated_users PK_810ee49f737e22ffe0fc1bfcef1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_associated_users
    ADD CONSTRAINT "PK_810ee49f737e22ffe0fc1bfcef1" PRIMARY KEY ("notificationId", "userId");


--
-- Name: conversation PK_864528ec4274360a40f66c29845; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation
    ADD CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY (id);


--
-- Name: action_reminder PK_87cdd2517d1756d61f03d2cacde; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_reminder
    ADD CONSTRAINT "PK_87cdd2517d1756d61f03d2cacde" PRIMARY KEY (id);


--
-- Name: onetime_invite PK_889e0382dc8a6c738672e2e2110; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onetime_invite
    ADD CONSTRAINT "PK_889e0382dc8a6c738672e2e2110" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: tag PK_8e4052373c579afc1471f526760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY (id);


--
-- Name: form PK_8f72b95aa2f8ba82cf95dc7579e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form
    ADD CONSTRAINT "PK_8f72b95aa2f8ba82cf95dc7579e" PRIMARY KEY (id);


--
-- Name: post_likes_user PK_91dfae767678b39354875c2894f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes_user
    ADD CONSTRAINT "PK_91dfae767678b39354875c2894f" PRIMARY KEY ("postId", "userId");


--
-- Name: custom_validator PK_96663d08aadf09369bd67e60e9f; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_validator
    ADD CONSTRAINT "PK_96663d08aadf09369bd67e60e9f" PRIMARY KEY (id);


--
-- Name: mms PK_9d51f82c22c8d7a4d4916beed70; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mms
    ADD CONSTRAINT "PK_9d51f82c22c8d7a4d4916beed70" PRIMARY KEY (id);


--
-- Name: contract_event PK_a0a0fdb2918e838e546c3b5fd01; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_event
    ADD CONSTRAINT "PK_a0a0fdb2918e838e546c3b5fd01" PRIMARY KEY (id);


--
-- Name: action_share_url PK_a9453b847c9391e923ef24333ba; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_share_url
    ADD CONSTRAINT "PK_a9453b847c9391e923ef24333ba" PRIMARY KEY (id);


--
-- Name: reminder_group_users PK_ac0adf27ce5069d59558804249b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_group_users
    ADD CONSTRAINT "PK_ac0adf27ce5069d59558804249b" PRIMARY KEY ("reminderGroupId", "userId");


--
-- Name: community_leaders_user PK_aeaa152ce211bb0210b6655ff43; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_leaders_user
    ADD CONSTRAINT "PK_aeaa152ce211bb0210b6655ff43" PRIMARY KEY ("communityId", "userId");


--
-- Name: city PK_b222f51ce26f7e5ca86944a6739; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city
    ADD CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY (id);


--
-- Name: message PK_ba01f0a3e0123651915008bc578; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY (id);


--
-- Name: post PK_be5fda3aac270b134ff9c21cdee; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY (id);


--
-- Name: daily_stats_record PK_c459b27857cad18ca37dfb89cd0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_stats_record
    ADD CONSTRAINT "PK_c459b27857cad18ca37dfb89cd0" PRIMARY KEY (id);


--
-- Name: action_activity PK_c48bfc3bed3be79c9c7a45bcce0; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity
    ADD CONSTRAINT "PK_c48bfc3bed3be79c9c7a45bcce0" PRIMARY KEY (id);


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: community PK_cae794115a383328e8923de4193; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community
    ADD CONSTRAINT "PK_cae794115a383328e8923de4193" PRIMARY KEY (id);


--
-- Name: user_action PK_d035e078f4d722c689a98556169; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_action
    ADD CONSTRAINT "PK_d035e078f4d722c689a98556169" PRIMARY KEY (id);


--
-- Name: post_experts_user PK_d0e928113e6b5df44806b2cd65c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_experts_user
    ADD CONSTRAINT "PK_d0e928113e6b5df44806b2cd65c" PRIMARY KEY ("postId", "userId");


--
-- Name: image PK_d6db1ab4ee9ad9dbe86c64e4cc3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT "PK_d6db1ab4ee9ad9dbe86c64e4cc3" PRIMARY KEY (id);


--
-- Name: push PK_ddc3812b04a238cbf8606c12ea6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push
    ADD CONSTRAINT "PK_ddc3812b04a238cbf8606c12ea6" PRIMARY KEY (id);


--
-- Name: community_users_user PK_de24dfe0468b0f2a59b548e4508; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_users_user
    ADD CONSTRAINT "PK_de24dfe0468b0f2a59b548e4508" PRIMARY KEY ("communityId", "userId");


--
-- Name: communique PK_de72f01ed4a95e4bd9f26dcb833; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communique
    ADD CONSTRAINT "PK_de72f01ed4a95e4bd9f26dcb833" PRIMARY KEY (id);


--
-- Name: group_users_user PK_e075467711f75a7f49fb79c79ef; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_users_user
    ADD CONSTRAINT "PK_e075467711f75a7f49fb79c79ef" PRIMARY KEY ("groupId", "userId");


--
-- Name: reminder_group PK_e25ad93cc4910091a6598e42945; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_group
    ADD CONSTRAINT "PK_e25ad93cc4910091a6598e42945" PRIMARY KEY (id);


--
-- Name: payment_user_data_token PK_eaab4debcd7e6acae65bd330dd9; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_user_data_token
    ADD CONSTRAINT "PK_eaab4debcd7e6acae65bd330dd9" PRIMARY KEY (id);


--
-- Name: action_event PK_f1514b15f14d59f574b8bb43185; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_event
    ADD CONSTRAINT "PK_f1514b15f14d59f574b8bb43185" PRIMARY KEY (id);


--
-- Name: action_activity_likes_user PK_f784ded2d25b84acd8be7254982; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_likes_user
    ADD CONSTRAINT "PK_f784ded2d25b84acd8be7254982" PRIMARY KEY ("actionActivityId", "userId");


--
-- Name: forum_digest_log PK_fa054fb646d4ed2f621ce76754e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_digest_log
    ADD CONSTRAINT "PK_fa054fb646d4ed2f621ce76754e" PRIMARY KEY (id);


--
-- Name: action_event_notif PK_ff0e162aa47ae9c99bba51bcb61; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_event_notif
    ADD CONSTRAINT "PK_ff0e162aa47ae9c99bba51bcb61" PRIMARY KEY (id);


--
-- Name: user_away_range PK_user_away_range; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_away_range
    ADD CONSTRAINT "PK_user_away_range" PRIMARY KEY (id);


--
-- Name: friend REL_25e9f5c2b6bc3e9d3113071693; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend
    ADD CONSTRAINT "REL_25e9f5c2b6bc3e9d3113071693" UNIQUE ("acceptedNotifId");


--
-- Name: friend REL_aa669daa3adf8f99c1b7e818e1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend
    ADD CONSTRAINT "REL_aa669daa3adf8f99c1b7e818e1" UNIQUE ("sentNotifId");


--
-- Name: action_event_notif REL_fd6ab11e416542ef85262fac56; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_event_notif
    ADD CONSTRAINT "REL_fd6ab11e416542ef85262fac56" UNIQUE ("mailId");


--
-- Name: action_stats_record UQ_039342acfb38b737a707ebf8ecb; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_stats_record
    ADD CONSTRAINT "UQ_039342acfb38b737a707ebf8ecb" UNIQUE ("actionId");


--
-- Name: post UQ_05e0157b1ef173459241c190d89; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "UQ_05e0157b1ef173459241c190d89" UNIQUE ("editableContentId");


--
-- Name: user UQ_0bfe583759eb0305b60117be840; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_0bfe583759eb0305b60117be840" UNIQUE ("stripeCustomerId");


--
-- Name: action_event_notif UQ_15bced7e658d4169c0850e9ed4a; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_event_notif
    ADD CONSTRAINT "UQ_15bced7e658d4169c0850e9ed4a" UNIQUE ("mmsId");


--
-- Name: comment UQ_1bffff3c7014b70ee0bdb1cc839; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "UQ_1bffff3c7014b70ee0bdb1cc839" UNIQUE ("editableContentId");


--
-- Name: user UQ_339e33707542cf7d38347f8169e; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_339e33707542cf7d38347f8169e" UNIQUE ("welcomeMailId");


--
-- Name: forum_digest_log UQ_3decf9c272d99420d12117b417d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_digest_log
    ADD CONSTRAINT "UQ_3decf9c272d99420d12117b417d" UNIQUE ("userId", "digestDate");


--
-- Name: participant UQ_3eb9345f4e759a2c536e69b9f6d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participant
    ADD CONSTRAINT "UQ_3eb9345f4e759a2c536e69b9f6d" UNIQUE ("conversationId", "userId");


--
-- Name: form_response UQ_596e5cea71948ee219d37c6ef51; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_response
    ADD CONSTRAINT "UQ_596e5cea71948ee219d37c6ef51" UNIQUE ("userId", "formId");


--
-- Name: user_action UQ_649286366665d12427427df5439; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_action
    ADD CONSTRAINT "UQ_649286366665d12427427df5439" UNIQUE ("userId", "actionId");


--
-- Name: user UQ_72d0238566c1c1611459d672d47; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_72d0238566c1c1611459d672d47" UNIQUE ("referredByInviteId");


--
-- Name: friend UQ_907157e850aae30cf8189e9cc54; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend
    ADD CONSTRAINT "UQ_907157e850aae30cf8189e9cc54" UNIQUE ("requesterId", "addresseeId");


--
-- Name: action_activity UQ_9641dee187a19400c6fd1f716f7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity
    ADD CONSTRAINT "UQ_9641dee187a19400c6fd1f716f7" UNIQUE ("taskFormResponseId");


--
-- Name: user UQ_a110e7ea3a0882d731c025f508b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_a110e7ea3a0882d731c025f508b" UNIQUE ("optInMmsId");


--
-- Name: action_activity UQ_activity_user_action_type; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity
    ADD CONSTRAINT "UQ_activity_user_action_type" UNIQUE ("userId", "actionId", type);


--
-- Name: conversation UQ_cabc48e77be83f96838b9d394a1; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation
    ADD CONSTRAINT "UQ_cabc48e77be83f96838b9d394a1" UNIQUE ("communityId");


--
-- Name: daily_stats_record UQ_cbcca62c7bcc14a88b131cc3cce; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_stats_record
    ADD CONSTRAINT "UQ_cbcca62c7bcc14a88b131cc3cce" UNIQUE ("dayId");


--
-- Name: action_activity UQ_dadaa998b72ef0cf43d636f5688; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity
    ADD CONSTRAINT "UQ_dadaa998b72ef0cf43d636f5688" UNIQUE ("editableContentId");


--
-- Name: user UQ_e12875dfb3b1d92d7d7c5377e22; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE (email);


--
-- Name: contract_event UQ_fb9201b7927f167863569b10283; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_event
    ADD CONSTRAINT "UQ_fb9201b7927f167863569b10283" UNIQUE ("userId", "autoSuspendKey");


--
-- Name: editable_content editable_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.editable_content
    ADD CONSTRAINT editable_content_pkey PRIMARY KEY (id);


--
-- Name: IDX_03c51abf6cdd2bcf3a9c7b1947; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_03c51abf6cdd2bcf3a9c7b1947" ON public.comment_likes_user USING btree ("userId");


--
-- Name: IDX_0615c89d8434c3259d7d1e74eb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0615c89d8434c3259d7d1e74eb" ON public.action_participating_groups_group USING btree ("groupId");


--
-- Name: IDX_0a3786b421b95d8710e050c250; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0a3786b421b95d8710e050c250" ON public.reminder_group_users USING btree ("reminderGroupId");


--
-- Name: IDX_0a3ecfe10aed060b0e00e2bf31; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_0a3ecfe10aed060b0e00e2bf31" ON public.post_authors_user USING btree ("userId");


--
-- Name: IDX_1336a7e2e9fcac3b052e397f4b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_1336a7e2e9fcac3b052e397f4b" ON public.tag_users_user USING btree ("userId");


--
-- Name: IDX_1527bfc5c1820d47e29461957a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_1527bfc5c1820d47e29461957a" ON public.post_experts_user USING btree ("userId");


--
-- Name: IDX_1604350f3dbc7ed40cd3bf53a3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_1604350f3dbc7ed40cd3bf53a3" ON public.action_manual_cohort_users_user USING btree ("actionId");


--
-- Name: IDX_17b572f3cd8b553a625c1b5650; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_17b572f3cd8b553a625c1b5650" ON public.action_activity_comment_likes_user USING btree ("actionActivityCommentId");


--
-- Name: IDX_1b6e13ef0e9174962dea4be254; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_1b6e13ef0e9174962dea4be254" ON public.community_users_user USING btree ("userId");


--
-- Name: IDX_2478cc32e836d8a58fad381813; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_2478cc32e836d8a58fad381813" ON public.communique_users_read USING btree ("communiqueId");


--
-- Name: IDX_488f25c6897226813db2de109e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_488f25c6897226813db2de109e" ON public.action_participating_tags_tag USING btree ("tagId");


--
-- Name: IDX_48c3e4213a219da599ea512cff; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_48c3e4213a219da599ea512cff" ON public.reminder_group_users USING btree ("userId");


--
-- Name: IDX_55722b3246a5420a711fe6674e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_55722b3246a5420a711fe6674e" ON public.action_manual_cohort_users_user USING btree ("userId");


--
-- Name: IDX_55edea38fece215a3b66443a49; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_55edea38fece215a3b66443a49" ON public.group_users_user USING btree ("userId");


--
-- Name: IDX_570a9fcca47e3eb48546536d7f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_570a9fcca47e3eb48546536d7f" ON public.contract_event USING btree ("userId", date);


--
-- Name: IDX_631290356ede4fcbb402128732; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_631290356ede4fcbb402128732" ON public.post_likes_user USING btree ("postId");


--
-- Name: IDX_68566be22dc060e05a74e631f2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_68566be22dc060e05a74e631f2" ON public.action_activity_comment_likes_user USING btree ("userId");


--
-- Name: IDX_6e446b5ec2f5b912fb6bfa1426; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_6e446b5ec2f5b912fb6bfa1426" ON public.action_event USING btree ("actionId", "newStatus", date);


--
-- Name: IDX_6fea3fc4e962f850616f1ce32a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_6fea3fc4e962f850616f1ce32a" ON public.action_reminder_users_user USING btree ("actionReminderId");


--
-- Name: IDX_7bd8e2e28e847d95aed0ee69bb; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7bd8e2e28e847d95aed0ee69bb" ON public.action_participating_tags_tag USING btree ("actionId");


--
-- Name: IDX_7cdf718f68ee929831cb33791d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_7cdf718f68ee929831cb33791d" ON public.action_authors_user USING btree ("userId");


--
-- Name: IDX_8b55d6247fb7ce805226f712a8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_8b55d6247fb7ce805226f712a8" ON public.post_experts_user USING btree ("postId");


--
-- Name: IDX_9413d47a9cc263e46230bb6e6d; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_9413d47a9cc263e46230bb6e6d" ON public.notification_associated_users USING btree ("notificationId");


--
-- Name: IDX_95ee61f695d6d1fad8a556b4c2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_95ee61f695d6d1fad8a556b4c2" ON public.action_participating_groups_group USING btree ("actionId");


--
-- Name: IDX_9731c5cf710ac09d1f5d7cc4aa; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_9731c5cf710ac09d1f5d7cc4aa" ON public.group_participating_in_action USING btree ("groupId");


--
-- Name: IDX_97fd88ea4947706be1cf93095b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_97fd88ea4947706be1cf93095b" ON public.group_participating_in_action USING btree ("actionId");


--
-- Name: IDX_9c50141afdd5ff547b39c6ea2a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_9c50141afdd5ff547b39c6ea2a" ON public.notification_associated_users USING btree ("userId");


--
-- Name: IDX_9d78b27171039a9e0832ccdda4; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_9d78b27171039a9e0832ccdda4" ON public.action_reminder_users_user USING btree ("userId");


--
-- Name: IDX_ac2dc02851d77738e7aba2782f; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ac2dc02851d77738e7aba2782f" ON public.tag_users_user USING btree ("tagId");


--
-- Name: IDX_action_activity_type_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_action_activity_type_createdAt" ON public.action_activity USING btree (type, "createdAt");


--
-- Name: IDX_ada19ab2e4c07d694de5df043a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ada19ab2e4c07d694de5df043a" ON public.community_leaders_user USING btree ("communityId");


--
-- Name: IDX_b024b96d07ee747696b4377fe8; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_b024b96d07ee747696b4377fe8" ON public.action_event USING btree ("actionId", date);


--
-- Name: IDX_b0a20bd6ef1b97861a20e194b9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_b0a20bd6ef1b97861a20e194b9" ON public.tag_participating_in_action USING btree ("tagId");


--
-- Name: IDX_b162d4fb5dcbe59d7032dc465b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_b162d4fb5dcbe59d7032dc465b" ON public.community_leaders_user USING btree ("userId");


--
-- Name: IDX_b1a1ce2a2776e6850b73de0537; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_b1a1ce2a2776e6850b73de0537" ON public.comment_likes_user USING btree ("commentId");


--
-- Name: IDX_b54707a37309bc7d1ebae52044; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_b54707a37309bc7d1ebae52044" ON public.action_activity_likes_user USING btree ("userId");


--
-- Name: IDX_b62b70e20a2fc1a450658b2ef7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_b62b70e20a2fc1a450658b2ef7" ON public.tag_participating_in_action USING btree ("actionId");


--
-- Name: IDX_c85556b8f7e06191ed32c7d0f1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_c85556b8f7e06191ed32c7d0f1" ON public.community_users_user USING btree ("communityId");


--
-- Name: IDX_cb01ab97e2366a49a2045d91f3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cb01ab97e2366a49a2045d91f3" ON public.communique_users_read USING btree ("userId");


--
-- Name: IDX_cf12f6bdbaf03a9b6b62c7ccd7; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cf12f6bdbaf03a9b6b62c7ccd7" ON public.action_authors_user USING btree ("actionId");


--
-- Name: IDX_d4ca1aad756e65a301a90daed1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_d4ca1aad756e65a301a90daed1" ON public.action_activity_likes_user USING btree ("actionActivityId");


--
-- Name: IDX_ead0e1d265ff04fe467343be56; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_ead0e1d265ff04fe467343be56" ON public.action_event_notif USING btree (idempotency_key) WHERE (idempotency_key IS NOT NULL);


--
-- Name: IDX_ec7439ad132e39ffe77fba5fed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_ec7439ad132e39ffe77fba5fed" ON public.post_likes_user USING btree ("userId");


--
-- Name: IDX_f5a7d64ef41260aecf95941796; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_f5a7d64ef41260aecf95941796" ON public.push USING btree ("idempotencyKey") WHERE ("idempotencyKey" IS NOT NULL);


--
-- Name: IDX_fe6cce7d479552c17823e267af; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fe6cce7d479552c17823e267af" ON public.group_users_user USING btree ("groupId");


--
-- Name: IDX_fecb124dd2fb002ffb157fb158; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fecb124dd2fb002ffb157fb158" ON public.post_authors_user USING btree ("postId");


--
-- Name: idx_city_english_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_city_english_name_trgm ON public.city USING gin (lower(("englishName")::text) public.gin_trgm_ops);


--
-- Name: idx_city_name_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_city_name_trgm ON public.city USING gin (lower((name)::text) public.gin_trgm_ops);


--
-- Name: comment_likes_user FK_03c51abf6cdd2bcf3a9c7b19476; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_likes_user
    ADD CONSTRAINT "FK_03c51abf6cdd2bcf3a9c7b19476" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post FK_05e0157b1ef173459241c190d89; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "FK_05e0157b1ef173459241c190d89" FOREIGN KEY ("editableContentId") REFERENCES public.editable_content(id) ON DELETE CASCADE;


--
-- Name: action_participating_groups_group FK_0615c89d8434c3259d7d1e74ebb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_participating_groups_group
    ADD CONSTRAINT "FK_0615c89d8434c3259d7d1e74ebb" FOREIGN KEY ("groupId") REFERENCES public."group"(id);


--
-- Name: reminder_group_users FK_0a3786b421b95d8710e050c2505; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_group_users
    ADD CONSTRAINT "FK_0a3786b421b95d8710e050c2505" FOREIGN KEY ("reminderGroupId") REFERENCES public.reminder_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_authors_user FK_0a3ecfe10aed060b0e00e2bf318; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_authors_user
    ADD CONSTRAINT "FK_0a3ecfe10aed060b0e00e2bf318" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tag_users_user FK_1336a7e2e9fcac3b052e397f4ba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_users_user
    ADD CONSTRAINT "FK_1336a7e2e9fcac3b052e397f4ba" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: post_experts_user FK_1527bfc5c1820d47e29461957a8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_experts_user
    ADD CONSTRAINT "FK_1527bfc5c1820d47e29461957a8" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_event_notif FK_15bced7e658d4169c0850e9ed4a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_event_notif
    ADD CONSTRAINT "FK_15bced7e658d4169c0850e9ed4a" FOREIGN KEY ("mmsId") REFERENCES public.mms(id);


--
-- Name: action_manual_cohort_users_user FK_1604350f3dbc7ed40cd3bf53a37; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_manual_cohort_users_user
    ADD CONSTRAINT "FK_1604350f3dbc7ed40cd3bf53a37" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_activity_comment_likes_user FK_17b572f3cd8b553a625c1b5650f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_comment_likes_user
    ADD CONSTRAINT "FK_17b572f3cd8b553a625c1b5650f" FOREIGN KEY ("actionActivityCommentId") REFERENCES public.action_activity_comment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_event FK_18c6fac65146d867a3b8b721262; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_event
    ADD CONSTRAINT "FK_18c6fac65146d867a3b8b721262" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: community_users_user FK_1b6e13ef0e9174962dea4be2545; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_users_user
    ADD CONSTRAINT "FK_1b6e13ef0e9174962dea4be2545" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: comment FK_1bffff3c7014b70ee0bdb1cc839; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_1bffff3c7014b70ee0bdb1cc839" FOREIGN KEY ("editableContentId") REFERENCES public.editable_content(id) ON DELETE CASCADE;


--
-- Name: notification FK_1ced25315eb974b73391fb1c81b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "FK_1ced25315eb974b73391fb1c81b" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: communique_users_read FK_2478cc32e836d8a58fad381813e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communique_users_read
    ADD CONSTRAINT "FK_2478cc32e836d8a58fad381813e" FOREIGN KEY ("communiqueId") REFERENCES public.communique(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: community_invite FK_25a58fb069d7149e6c8660ec34d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_invite
    ADD CONSTRAINT "FK_25a58fb069d7149e6c8660ec34d" FOREIGN KEY ("invitingUserId") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: friend FK_25e9f5c2b6bc3e9d31130716931; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend
    ADD CONSTRAINT "FK_25e9f5c2b6bc3e9d31130716931" FOREIGN KEY ("acceptedNotifId") REFERENCES public.notification(id) ON DELETE SET NULL;


--
-- Name: action_share_url FK_26313b4e81fe098c368a84cc07c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_share_url
    ADD CONSTRAINT "FK_26313b4e81fe098c368a84cc07c" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: comment FK_276779da446413a0d79598d4fbd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: action_event_notif FK_30a4322efaa2df30f9cfbdf7e5f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_event_notif
    ADD CONSTRAINT "FK_30a4322efaa2df30f9cfbdf7e5f" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user FK_339e33707542cf7d38347f8169e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_339e33707542cf7d38347f8169e" FOREIGN KEY ("welcomeMailId") REFERENCES public.mail(id) ON DELETE SET NULL;


--
-- Name: action_activity FK_348c2ac5fa8d45c7f31487291e4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity
    ADD CONSTRAINT "FK_348c2ac5fa8d45c7f31487291e4" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: form_response FK_3600cba60926c01106e6818d693; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_response
    ADD CONSTRAINT "FK_3600cba60926c01106e6818d693" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: form_response FK_377d5f3d5ecb0c02e785dda5fdc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_response
    ADD CONSTRAINT "FK_377d5f3d5ecb0c02e785dda5fdc" FOREIGN KEY ("formId") REFERENCES public.form(id) ON DELETE CASCADE;


--
-- Name: action_activity FK_451c6a1b9e6018fe21061aa8506; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity
    ADD CONSTRAINT "FK_451c6a1b9e6018fe21061aa8506" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: participant FK_455f31ed76f79d7578833407d2d; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participant
    ADD CONSTRAINT "FK_455f31ed76f79d7578833407d2d" FOREIGN KEY ("lastReadMessageId") REFERENCES public.message(id) ON DELETE SET NULL;


--
-- Name: user FK_4789e1e3f6716141e9195c1e145; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_4789e1e3f6716141e9195c1e145" FOREIGN KEY ("pendingCommunityId") REFERENCES public.community(id);


--
-- Name: action_participating_tags_tag FK_488f25c6897226813db2de109eb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_participating_tags_tag
    ADD CONSTRAINT "FK_488f25c6897226813db2de109eb" FOREIGN KEY ("tagId") REFERENCES public.tag(id);


--
-- Name: reminder_group_users FK_48c3e4213a219da599ea512cfff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_group_users
    ADD CONSTRAINT "FK_48c3e4213a219da599ea512cfff" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_manual_cohort_users_user FK_55722b3246a5420a711fe6674e0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_manual_cohort_users_user
    ADD CONSTRAINT "FK_55722b3246a5420a711fe6674e0" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_users_user FK_55edea38fece215a3b66443a498; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_users_user
    ADD CONSTRAINT "FK_55edea38fece215a3b66443a498" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: reminder_group FK_614f018df34e5573ccdd46425fd; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_group
    ADD CONSTRAINT "FK_614f018df34e5573ccdd46425fd" FOREIGN KEY ("memberActionEventId") REFERENCES public.action_event(id) ON DELETE CASCADE;


--
-- Name: post_likes_user FK_631290356ede4fcbb4021287321; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes_user
    ADD CONSTRAINT "FK_631290356ede4fcbb4021287321" FOREIGN KEY ("postId") REFERENCES public.post(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_activity_comment_likes_user FK_68566be22dc060e05a74e631f29; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_comment_likes_user
    ADD CONSTRAINT "FK_68566be22dc060e05a74e631f29" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_activity_comment FK_6dec6b0073a697cb8b61148f7ab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_comment
    ADD CONSTRAINT "FK_6dec6b0073a697cb8b61148f7ab" FOREIGN KEY ("activityId") REFERENCES public.action_activity(id) ON DELETE CASCADE;


--
-- Name: personal_action_reminder FK_6f2a4dc2bfd7df8630a2251756b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_action_reminder
    ADD CONSTRAINT "FK_6f2a4dc2bfd7df8630a2251756b" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: action_update FK_6fc20f9c69f4283d5ef0c05d5ba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_update
    ADD CONSTRAINT "FK_6fc20f9c69f4283d5ef0c05d5ba" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: action_reminder_users_user FK_6fea3fc4e962f850616f1ce32a5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_reminder_users_user
    ADD CONSTRAINT "FK_6fea3fc4e962f850616f1ce32a5" FOREIGN KEY ("actionReminderId") REFERENCES public.action_reminder(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_reminder FK_70e92c769bcd8fd2314dd6d960b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_reminder
    ADD CONSTRAINT "FK_70e92c769bcd8fd2314dd6d960b" FOREIGN KEY ("memberActionEventId") REFERENCES public.action_event(id) ON DELETE CASCADE;


--
-- Name: user FK_72d0238566c1c1611459d672d47; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_72d0238566c1c1611459d672d47" FOREIGN KEY ("referredByInviteId") REFERENCES public.onetime_invite(id);


--
-- Name: friend FK_77431e45d96b9c20941edf49df2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend
    ADD CONSTRAINT "FK_77431e45d96b9c20941edf49df2" FOREIGN KEY ("requesterId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: action_participating_tags_tag FK_7bd8e2e28e847d95aed0ee69bba; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_participating_tags_tag
    ADD CONSTRAINT "FK_7bd8e2e28e847d95aed0ee69bba" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_authors_user FK_7cdf718f68ee929831cb33791d5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_authors_user
    ADD CONSTRAINT "FK_7cdf718f68ee929831cb33791d5" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: message FK_7cf4a4df1f2627f72bf6231635f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_7cf4a4df1f2627f72bf6231635f" FOREIGN KEY ("conversationId") REFERENCES public.conversation(id) ON DELETE CASCADE;


--
-- Name: post FK_7e0117be72db6790be8567374f3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "FK_7e0117be72db6790be8567374f3" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON DELETE SET NULL;


--
-- Name: user_away_range FK_7e4ed9228611c23a5813be11c8a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_away_range
    ADD CONSTRAINT "FK_7e4ed9228611c23a5813be11c8a" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: action FK_8455eea77529f7b542576b3e77e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action
    ADD CONSTRAINT "FK_8455eea77529f7b542576b3e77e" FOREIGN KEY ("suiteId") REFERENCES public.action_suite(id);


--
-- Name: action_activity_comment FK_873ad8a45a9345e6e6bf7395fb6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_comment
    ADD CONSTRAINT "FK_873ad8a45a9345e6e6bf7395fb6" FOREIGN KEY ("authorId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: action_update FK_891d217b99508a780a59d9e118c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_update
    ADD CONSTRAINT "FK_891d217b99508a780a59d9e118c" FOREIGN KEY ("contentId") REFERENCES public.editable_content(id);


--
-- Name: post_experts_user FK_8b55d6247fb7ce805226f712a89; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_experts_user
    ADD CONSTRAINT "FK_8b55d6247fb7ce805226f712a89" FOREIGN KEY ("postId") REFERENCES public.post(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: push FK_8daafc4efe487397000cb943012; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push
    ADD CONSTRAINT "FK_8daafc4efe487397000cb943012" FOREIGN KEY ("notificationId") REFERENCES public.notification(id) ON DELETE CASCADE;


--
-- Name: notification FK_8dcb425fddadd878d80bf5fa195; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "FK_8dcb425fddadd878d80bf5fa195" FOREIGN KEY ("commentId") REFERENCES public.comment(id) ON DELETE CASCADE;


--
-- Name: notification FK_923f398e7539af13e8ad06fa79f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "FK_923f398e7539af13e8ad06fa79f" FOREIGN KEY ("onetimeInviteId") REFERENCES public.onetime_invite(id) ON DELETE CASCADE;


--
-- Name: notification_associated_users FK_9413d47a9cc263e46230bb6e6dc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_associated_users
    ADD CONSTRAINT "FK_9413d47a9cc263e46230bb6e6dc" FOREIGN KEY ("notificationId") REFERENCES public.notification(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_participating_groups_group FK_95ee61f695d6d1fad8a556b4c21; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_participating_groups_group
    ADD CONSTRAINT "FK_95ee61f695d6d1fad8a556b4c21" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_activity FK_9641dee187a19400c6fd1f716f7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity
    ADD CONSTRAINT "FK_9641dee187a19400c6fd1f716f7" FOREIGN KEY ("taskFormResponseId") REFERENCES public.form_response(id) ON DELETE CASCADE;


--
-- Name: group_participating_in_action FK_9731c5cf710ac09d1f5d7cc4aa6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_participating_in_action
    ADD CONSTRAINT "FK_9731c5cf710ac09d1f5d7cc4aa6" FOREIGN KEY ("groupId") REFERENCES public."group"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: group_participating_in_action FK_97fd88ea4947706be1cf93095b7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_participating_in_action
    ADD CONSTRAINT "FK_97fd88ea4947706be1cf93095b7" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: notification_associated_users FK_9c50141afdd5ff547b39c6ea2ae; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_associated_users
    ADD CONSTRAINT "FK_9c50141afdd5ff547b39c6ea2ae" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_reminder_users_user FK_9d78b27171039a9e0832ccdda40; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_reminder_users_user
    ADD CONSTRAINT "FK_9d78b27171039a9e0832ccdda40" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user FK_a110e7ea3a0882d731c025f508b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_a110e7ea3a0882d731c025f508b" FOREIGN KEY ("optInMmsId") REFERENCES public.mms(id);


--
-- Name: community_invite FK_a172473353c73e761ea78a3f658; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_invite
    ADD CONSTRAINT "FK_a172473353c73e761ea78a3f658" FOREIGN KEY ("communityId") REFERENCES public.community(id) ON DELETE CASCADE;


--
-- Name: contract_event FK_a37c8efb594c7e19c7151fb2976; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contract_event
    ADD CONSTRAINT "FK_a37c8efb594c7e19c7151fb2976" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: action_event_notif FK_a4aa7f8a48a1580f89e5b9f4434; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_event_notif
    ADD CONSTRAINT "FK_a4aa7f8a48a1580f89e5b9f4434" FOREIGN KEY ("reminderGroupId") REFERENCES public.reminder_group(id) ON DELETE SET NULL;


--
-- Name: community_invite FK_a6d6065cedd23f74e7ca5976059; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_invite
    ADD CONSTRAINT "FK_a6d6065cedd23f74e7ca5976059" FOREIGN KEY ("invitedUserId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: friend FK_aa669daa3adf8f99c1b7e818e1a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend
    ADD CONSTRAINT "FK_aa669daa3adf8f99c1b7e818e1a" FOREIGN KEY ("sentNotifId") REFERENCES public.notification(id) ON DELETE SET NULL;


--
-- Name: tag_users_user FK_ac2dc02851d77738e7aba2782fe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_users_user
    ADD CONSTRAINT "FK_ac2dc02851d77738e7aba2782fe" FOREIGN KEY ("tagId") REFERENCES public.tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: community_leaders_user FK_ada19ab2e4c07d694de5df043af; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_leaders_user
    ADD CONSTRAINT "FK_ada19ab2e4c07d694de5df043af" FOREIGN KEY ("communityId") REFERENCES public.community(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user FK_adc492faf309ebf60ca6425e183; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_adc492faf309ebf60ca6425e183" FOREIGN KEY ("referredById") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: tag_participating_in_action FK_b0a20bd6ef1b97861a20e194b99; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_participating_in_action
    ADD CONSTRAINT "FK_b0a20bd6ef1b97861a20e194b99" FOREIGN KEY ("tagId") REFERENCES public.tag(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: community_leaders_user FK_b162d4fb5dcbe59d7032dc465b3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_leaders_user
    ADD CONSTRAINT "FK_b162d4fb5dcbe59d7032dc465b3" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: comment_likes_user FK_b1a1ce2a2776e6850b73de0537c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_likes_user
    ADD CONSTRAINT "FK_b1a1ce2a2776e6850b73de0537c" FOREIGN KEY ("commentId") REFERENCES public.comment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: action_activity_likes_user FK_b54707a37309bc7d1ebae52044e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_likes_user
    ADD CONSTRAINT "FK_b54707a37309bc7d1ebae52044e" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tag_participating_in_action FK_b62b70e20a2fc1a450658b2ef75; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tag_participating_in_action
    ADD CONSTRAINT "FK_b62b70e20a2fc1a450658b2ef75" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: participant FK_b915e97dea27ffd1e40c8003b3b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participant
    ADD CONSTRAINT "FK_b915e97dea27ffd1e40c8003b3b" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: prefill_user FK_b94d6c2a51a9d969bc628b225d4; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prefill_user
    ADD CONSTRAINT "FK_b94d6c2a51a9d969bc628b225d4" FOREIGN KEY ("cityId") REFERENCES public.city(id);


--
-- Name: user_device FK_bda1afb30d9e3e8fb30b1e90af7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_device
    ADD CONSTRAINT "FK_bda1afb30d9e3e8fb30b1e90af7" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: user FK_beb5846554bec348f6baf449e83; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "FK_beb5846554bec348f6baf449e83" FOREIGN KEY ("cityId") REFERENCES public.city(id) ON DELETE SET NULL;


--
-- Name: user_action FK_c025478b45e60017ed10c77f99c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_action
    ADD CONSTRAINT "FK_c025478b45e60017ed10c77f99c" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: participant FK_c03594530101ba8d1cf05bb137b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.participant
    ADD CONSTRAINT "FK_c03594530101ba8d1cf05bb137b" FOREIGN KEY ("conversationId") REFERENCES public.conversation(id) ON DELETE CASCADE;


--
-- Name: post FK_c6fb082a3114f35d0cc27c518e0; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: message FK_c72d82fa0e8699a141ed6cc41b3; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_c72d82fa0e8699a141ed6cc41b3" FOREIGN KEY ("authorId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: community_users_user FK_c85556b8f7e06191ed32c7d0f1a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_users_user
    ADD CONSTRAINT "FK_c85556b8f7e06191ed32c7d0f1a" FOREIGN KEY ("communityId") REFERENCES public.community(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification FK_ca6c77e63273e35f3cdb07632f9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT "FK_ca6c77e63273e35f3cdb07632f9" FOREIGN KEY ("actionUpdateId") REFERENCES public.action_update(id) ON DELETE CASCADE;


--
-- Name: conversation FK_cabc48e77be83f96838b9d394a1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation
    ADD CONSTRAINT "FK_cabc48e77be83f96838b9d394a1" FOREIGN KEY ("communityId") REFERENCES public.community(id) ON DELETE CASCADE;


--
-- Name: communique_users_read FK_cb01ab97e2366a49a2045d91f3b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communique_users_read
    ADD CONSTRAINT "FK_cb01ab97e2366a49a2045d91f3b" FOREIGN KEY ("userId") REFERENCES public."user"(id);


--
-- Name: action_share_url FK_cdd9f4178c5ace26b273f684aee; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_share_url
    ADD CONSTRAINT "FK_cdd9f4178c5ace26b273f684aee" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: action_update FK_cedb614899842fd9333b5695f39; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_update
    ADD CONSTRAINT "FK_cedb614899842fd9333b5695f39" FOREIGN KEY ("associatedEventId") REFERENCES public.action_event(id);


--
-- Name: action_authors_user FK_cf12f6bdbaf03a9b6b62c7ccd7a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_authors_user
    ADD CONSTRAINT "FK_cf12f6bdbaf03a9b6b62c7ccd7a" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: reminder_group FK_d1c7c429a93421ddcabf29da31f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_group
    ADD CONSTRAINT "FK_d1c7c429a93421ddcabf29da31f" FOREIGN KEY ("actionSuiteId") REFERENCES public.action_suite(id) ON DELETE SET NULL;


--
-- Name: user_action FK_d3240b1f0d4d106ca61ea874fdf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_action
    ADD CONSTRAINT "FK_d3240b1f0d4d106ca61ea874fdf" FOREIGN KEY ("actionId") REFERENCES public.action(id) ON DELETE CASCADE;


--
-- Name: action_activity_likes_user FK_d4ca1aad756e65a301a90daed1b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity_likes_user
    ADD CONSTRAINT "FK_d4ca1aad756e65a301a90daed1b" FOREIGN KEY ("actionActivityId") REFERENCES public.action_activity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: onetime_invite_request FK_d4f29888717b1fc7ef88d2acbd5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onetime_invite_request
    ADD CONSTRAINT "FK_d4f29888717b1fc7ef88d2acbd5" FOREIGN KEY ("communityId") REFERENCES public.community(id) ON DELETE SET NULL;


--
-- Name: action_activity FK_dadaa998b72ef0cf43d636f5688; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_activity
    ADD CONSTRAINT "FK_dadaa998b72ef0cf43d636f5688" FOREIGN KEY ("editableContentId") REFERENCES public.editable_content(id) ON DELETE CASCADE;


--
-- Name: reminder_group FK_dbb157db646be57f5e14f7deedf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_group
    ADD CONSTRAINT "FK_dbb157db646be57f5e14f7deedf" FOREIGN KEY ("userTagId") REFERENCES public.tag(id);


--
-- Name: message FK_dc84d76f927b87f616cbedcf2e5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "FK_dc84d76f927b87f616cbedcf2e5" FOREIGN KEY ("replyToId") REFERENCES public.message(id);


--
-- Name: action_update FK_de574ee379db67b585ac575549e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_update
    ADD CONSTRAINT "FK_de574ee379db67b585ac575549e" FOREIGN KEY ("tagId") REFERENCES public.tag(id);


--
-- Name: forum_digest_log FK_de674e50a7a30010e79ba980027; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.forum_digest_log
    ADD CONSTRAINT "FK_de674e50a7a30010e79ba980027" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: onetime_invite FK_e0efae2c92aa901b772a2e46bc8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onetime_invite
    ADD CONSTRAINT "FK_e0efae2c92aa901b772a2e46bc8" FOREIGN KEY ("invitingUserId") REFERENCES public."user"(id) ON DELETE SET NULL;


--
-- Name: comment FK_e3aebe2bd1c53467a07109be596; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT "FK_e3aebe2bd1c53467a07109be596" FOREIGN KEY ("parentId") REFERENCES public.comment(id) ON DELETE CASCADE;


--
-- Name: onetime_invite_request FK_e42b68a56b3c9e93e7d612001ff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onetime_invite_request
    ADD CONSTRAINT "FK_e42b68a56b3c9e93e7d612001ff" FOREIGN KEY ("invitingUserId") REFERENCES public."user"(id);


--
-- Name: friend FK_e482969c0ef69f005533209143e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friend
    ADD CONSTRAINT "FK_e482969c0ef69f005533209143e" FOREIGN KEY ("addresseeId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: onetime_invite FK_e6e907fcc20d0bae0b230397076; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.onetime_invite
    ADD CONSTRAINT "FK_e6e907fcc20d0bae0b230397076" FOREIGN KEY ("communityId") REFERENCES public.community(id) ON DELETE SET NULL;


--
-- Name: personal_action_reminder FK_e819434446cf699c7e8c95d3ac7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_action_reminder
    ADD CONSTRAINT "FK_e819434446cf699c7e8c95d3ac7" FOREIGN KEY ("memberActionEventId") REFERENCES public.action_event(id) ON DELETE CASCADE;


--
-- Name: personal_action_reminder FK_eb9ab174d0c4d33a14fc4f7dfa8; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_action_reminder
    ADD CONSTRAINT "FK_eb9ab174d0c4d33a14fc4f7dfa8" FOREIGN KEY ("groupId") REFERENCES public.reminder_group(id) ON DELETE CASCADE;


--
-- Name: reminder_group FK_ebb602a83fdb0710084455ec2bf; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reminder_group
    ADD CONSTRAINT "FK_ebb602a83fdb0710084455ec2bf" FOREIGN KEY ("deadlineEventId") REFERENCES public.action_event(id) ON DELETE SET NULL;


--
-- Name: post_likes_user FK_ec7439ad132e39ffe77fba5fed9; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes_user
    ADD CONSTRAINT "FK_ec7439ad132e39ffe77fba5fed9" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: push FK_f2755b9165fbafc978a23940edb; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.push
    ADD CONSTRAINT "FK_f2755b9165fbafc978a23940edb" FOREIGN KEY ("actionEventNotifId") REFERENCES public.action_event_notif(id) ON DELETE CASCADE;


--
-- Name: action_event_notif FK_fd6ab11e416542ef85262fac56b; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.action_event_notif
    ADD CONSTRAINT "FK_fd6ab11e416542ef85262fac56b" FOREIGN KEY ("mailId") REFERENCES public.mail(id);


--
-- Name: group_users_user FK_fe6cce7d479552c17823e267aff; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_users_user
    ADD CONSTRAINT "FK_fe6cce7d479552c17823e267aff" FOREIGN KEY ("groupId") REFERENCES public."group"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_authors_user FK_fecb124dd2fb002ffb157fb158e; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_authors_user
    ADD CONSTRAINT "FK_fecb124dd2fb002ffb157fb158e" FOREIGN KEY ("postId") REFERENCES public.post(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict p03vaO53BqMHWBXCI1CK8piQ6TsB31pcDta6XBlIbMQOGxgyCpQ1fn7QgxYlyFl

