-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "last_login" TIMESTAMP(3),
    "terms_accepted" BOOLEAN NOT NULL DEFAULT false,
    "terms_accepted_at" TIMESTAMP(3),
    "marketing_emails" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "street_address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT DEFAULT 'United States',
    "current_school" TEXT,
    "school_type" TEXT,
    "expected_graduation" TIMESTAMP(3),
    "major" TEXT,
    "minor" TEXT,
    "gpa" DECIMAL(3,2),
    "academic_standing" TEXT,
    "citizenship" TEXT,
    "ethnicity" TEXT,
    "gender" TEXT,
    "first_generation" BOOLEAN,
    "military_status" TEXT,
    "financial_need_indicator" TEXT,
    "background" TEXT,
    "challenges" TEXT,
    "academic_journey" TEXT,
    "career_goals" TEXT,
    "why_education" TEXT,
    "personal_values" TEXT,
    "profile_strength_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "organization" TEXT,
    "role" TEXT,
    "description" TEXT,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "hours_per_week" INTEGER,
    "total_hours" INTEGER,
    "achievements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scholarships" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "organization" TEXT,
    "description" TEXT,
    "mission_statement" TEXT,
    "url" TEXT NOT NULL,
    "award_amount_min" INTEGER,
    "award_amount_max" INTEGER,
    "number_of_awards" INTEGER,
    "total_award_pool" INTEGER,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TIMESTAMP(3) NOT NULL,
    "deadline_timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "notification_date" TIMESTAMP(3),
    "eligibility" JSONB NOT NULL,
    "essay_prompts" JSONB NOT NULL,
    "required_documents" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requires_recommendations" INTEGER NOT NULL DEFAULT 0,
    "competition_level" TEXT,
    "estimated_applicants" INTEGER,
    "application_effort_score" INTEGER,
    "form_complexity" TEXT,
    "has_captcha" BOOLEAN NOT NULL DEFAULT false,
    "is_multi_stage" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL,
    "last_scraped" TIMESTAMP(3),
    "confidence_score" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scholarship_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT,
    "match_score" INTEGER,
    "started_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "outcome_date" TIMESTAMP(3),
    "outcome" TEXT,
    "award_amount_received" INTEGER,
    "time_spent_minutes" INTEGER NOT NULL DEFAULT 0,
    "parent_application_id" TEXT,
    "stage_number" INTEGER NOT NULL DEFAULT 1,
    "total_stages" INTEGER NOT NULL DEFAULT 1,
    "notes" TEXT,
    "user_rating" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "essays" (
    "id" TEXT NOT NULL,
    "application_id" TEXT NOT NULL,
    "prompt_text" TEXT NOT NULL,
    "word_limit" INTEGER,
    "generated_essay" TEXT,
    "final_essay" TEXT,
    "generation_method" TEXT,
    "variants_generated" INTEGER NOT NULL DEFAULT 1,
    "selected_variant" INTEGER,
    "quality_score" INTEGER,
    "word_count" INTEGER,
    "user_rating" INTEGER,
    "user_feedback" TEXT,
    "tone_rating" INTEGER,
    "accuracy_rating" INTEGER,
    "flow_rating" INTEGER,
    "times_edited" INTEGER NOT NULL DEFAULT 0,
    "ai_detection_score" DECIMAL(3,2),
    "plagiarism_score" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "essays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "replaces_document_id" TEXT,
    "extracted_text" TEXT,
    "parsed_data" JSONB,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "application_id" TEXT,
    "recommender_name" TEXT NOT NULL,
    "recommender_email" TEXT,
    "recommender_relationship" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'not_requested',
    "requested_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3),
    "document_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_analytics" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "applications_started" INTEGER NOT NULL DEFAULT 0,
    "applications_submitted" INTEGER NOT NULL DEFAULT 0,
    "essays_generated" INTEGER NOT NULL DEFAULT 0,
    "essays_edited" INTEGER NOT NULL DEFAULT 0,
    "total_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "scholarships_won" INTEGER NOT NULL DEFAULT 0,
    "money_won" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "essay_feedback" (
    "id" TEXT NOT NULL,
    "essay_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "feedback_type" TEXT NOT NULL,
    "overall_rating" INTEGER,
    "tone_rating" INTEGER,
    "accuracy_rating" INTEGER,
    "flow_rating" INTEGER,
    "comment" TEXT,
    "original_text" TEXT,
    "edited_text" TEXT,
    "sections_changed" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "essay_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scraping_logs" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scholarships_found" INTEGER NOT NULL DEFAULT 0,
    "scholarships_new" INTEGER NOT NULL DEFAULT 0,
    "scholarships_updated" INTEGER NOT NULL DEFAULT 0,
    "errors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "scraping_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "resource_type" TEXT,
    "resource_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "scholarships_url_key" ON "scholarships"("url");

-- CreateIndex
CREATE INDEX "scholarships_deadline_idx" ON "scholarships"("deadline");

-- CreateIndex
CREATE INDEX "scholarships_verified_idx" ON "scholarships"("verified");

-- CreateIndex
CREATE UNIQUE INDEX "applications_user_id_scholarship_id_key" ON "applications"("user_id", "scholarship_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_analytics_user_id_date_key" ON "user_analytics"("user_id", "date");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_scholarship_id_fkey" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_parent_application_id_fkey" FOREIGN KEY ("parent_application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essays" ADD CONSTRAINT "essays_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_replaces_document_id_fkey" FOREIGN KEY ("replaces_document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_analytics" ADD CONSTRAINT "user_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essay_feedback" ADD CONSTRAINT "essay_feedback_essay_id_fkey" FOREIGN KEY ("essay_id") REFERENCES "essays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essay_feedback" ADD CONSTRAINT "essay_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
