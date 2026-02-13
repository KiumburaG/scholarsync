/*
  Warnings:

  - You are about to drop the column `total_hours` on the `activities` table. All the data in the column will be lost.
  - You are about to drop the column `award_amount_received` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `match_score` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `outcome` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `outcome_date` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `parent_application_id` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `stage_number` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `time_spent_minutes` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `total_stages` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `user_rating` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `extracted_text` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `is_current` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `mime_type` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `parsed_data` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `replaces_document_id` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `accuracy_rating` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `ai_detection_score` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `flow_rating` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `generation_method` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `plagiarism_score` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `quality_score` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `selected_variant` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `times_edited` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `tone_rating` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `user_feedback` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `user_rating` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `variants_generated` on the `essays` table. All the data in the column will be lost.
  - You are about to drop the column `application_effort_score` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `award_amount_max` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `award_amount_min` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `competition_level` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `confidence_score` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `deadline_timezone` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `eligibility` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `estimated_applicants` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `form_complexity` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `has_captcha` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `is_multi_stage` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `keywords` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `last_scraped` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `mission_statement` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `notification_date` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `number_of_awards` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `recurring` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `required_documents` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `requires_recommendations` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `total_award_pool` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `scholarships` table. All the data in the column will be lost.
  - You are about to drop the column `expected_graduation` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `financial_need_indicator` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `military_status` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `profile_strength_score` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `school_type` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to alter the column `gpa` on the `user_profiles` table. The data in that column could be lost. The data in that column will be cast from `Decimal(3,2)` to `DoublePrecision`.
  - You are about to drop the column `email_verified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_login` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `marketing_emails` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `profile_completed` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `terms_accepted` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `terms_accepted_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `access_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `essay_feedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `recommendations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `scraping_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_analytics` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_profile_id` to the `activities` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deadline` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `application_id` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `documents` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `essays` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `scholarships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `application_url` to the `scholarships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eligibility_requirements` to the `scholarships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `scholarships` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "access_logs" DROP CONSTRAINT "access_logs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_user_id_fkey";

-- DropForeignKey
ALTER TABLE "applications" DROP CONSTRAINT "applications_parent_application_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_replaces_document_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_user_id_fkey";

-- DropForeignKey
ALTER TABLE "essay_feedback" DROP CONSTRAINT "essay_feedback_essay_id_fkey";

-- DropForeignKey
ALTER TABLE "essay_feedback" DROP CONSTRAINT "essay_feedback_user_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_application_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_document_id_fkey";

-- DropForeignKey
ALTER TABLE "recommendations" DROP CONSTRAINT "recommendations_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_analytics" DROP CONSTRAINT "user_analytics_user_id_fkey";

-- DropIndex
DROP INDEX "scholarships_deadline_idx";

-- DropIndex
DROP INDEX "scholarships_url_key";

-- DropIndex
DROP INDEX "scholarships_verified_idx";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "total_hours",
ADD COLUMN     "user_profile_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "award_amount_received",
DROP COLUMN "match_score",
DROP COLUMN "outcome",
DROP COLUMN "outcome_date",
DROP COLUMN "parent_application_id",
DROP COLUMN "priority",
DROP COLUMN "stage_number",
DROP COLUMN "started_at",
DROP COLUMN "time_spent_minutes",
DROP COLUMN "total_stages",
DROP COLUMN "user_rating",
ADD COLUMN     "amount_awarded" INTEGER,
ADD COLUMN     "deadline" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "progress_percentage" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "extracted_text",
DROP COLUMN "is_current",
DROP COLUMN "mime_type",
DROP COLUMN "parsed_data",
DROP COLUMN "replaces_document_id",
DROP COLUMN "user_id",
DROP COLUMN "version",
ADD COLUMN     "application_id" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "essays" DROP COLUMN "accuracy_rating",
DROP COLUMN "ai_detection_score",
DROP COLUMN "flow_rating",
DROP COLUMN "generation_method",
DROP COLUMN "plagiarism_score",
DROP COLUMN "quality_score",
DROP COLUMN "selected_variant",
DROP COLUMN "times_edited",
DROP COLUMN "tone_rating",
DROP COLUMN "user_feedback",
DROP COLUMN "user_rating",
DROP COLUMN "variants_generated",
ADD COLUMN     "user_id" TEXT NOT NULL,
ALTER COLUMN "application_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "scholarships" DROP COLUMN "application_effort_score",
DROP COLUMN "award_amount_max",
DROP COLUMN "award_amount_min",
DROP COLUMN "competition_level",
DROP COLUMN "confidence_score",
DROP COLUMN "deadline_timezone",
DROP COLUMN "eligibility",
DROP COLUMN "estimated_applicants",
DROP COLUMN "form_complexity",
DROP COLUMN "has_captcha",
DROP COLUMN "is_multi_stage",
DROP COLUMN "keywords",
DROP COLUMN "last_scraped",
DROP COLUMN "mission_statement",
DROP COLUMN "name",
DROP COLUMN "notification_date",
DROP COLUMN "number_of_awards",
DROP COLUMN "recurring",
DROP COLUMN "required_documents",
DROP COLUMN "requires_recommendations",
DROP COLUMN "total_award_pool",
DROP COLUMN "url",
DROP COLUMN "verified",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "application_url" TEXT NOT NULL,
ADD COLUMN     "eligibility_requirements" JSONB NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "title" VARCHAR(500) NOT NULL,
ALTER COLUMN "source" SET DEFAULT 'manual';

-- AlterTable
ALTER TABLE "user_profiles" DROP COLUMN "expected_graduation",
DROP COLUMN "financial_need_indicator",
DROP COLUMN "military_status",
DROP COLUMN "profile_strength_score",
DROP COLUMN "school_type",
ADD COLUMN     "graduation_year" INTEGER,
ADD COLUMN     "preferred_scholarship_types" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "profile_strength" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "gpa" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email_verified",
DROP COLUMN "last_login",
DROP COLUMN "marketing_emails",
DROP COLUMN "profile_completed",
DROP COLUMN "terms_accepted",
DROP COLUMN "terms_accepted_at";

-- DropTable
DROP TABLE "access_logs";

-- DropTable
DROP TABLE "essay_feedback";

-- DropTable
DROP TABLE "recommendations";

-- DropTable
DROP TABLE "scraping_logs";

-- DropTable
DROP TABLE "user_analytics";

-- CreateTable
CREATE TABLE "match_scores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scholarship_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "eligibility_status" TEXT NOT NULL,
    "missing_requirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gpa_match" DOUBLE PRECISION NOT NULL,
    "major_match" DOUBLE PRECISION NOT NULL,
    "deadline_proximity" DOUBLE PRECISION NOT NULL,
    "profile_strength" DOUBLE PRECISION NOT NULL,
    "activity_match" DOUBLE PRECISION NOT NULL,
    "academic_standing_match" DOUBLE PRECISION NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_scores_user_id_scholarship_id_key" ON "match_scores"("user_id", "scholarship_id");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "user_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "essays" ADD CONSTRAINT "essays_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
