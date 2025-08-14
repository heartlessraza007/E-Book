import {
  AddUserSkillData,
  AddUserSkillError,
  AddUserSkillRequest,
  AskAIRequest,
  AskAiData,
  AskAiError,
  CheckHealthData,
  CreateJobData,
  CreateJobError,
  CreateJobRequest,
  GetAssessmentStateData,
  GetAssessmentStateError,
  GetAssessmentStateParams,
  GetAvailableSkillsData,
  GetUserBadgesData,
  GetUserSkillsData,
  IngestTelemetryData,
  IngestTelemetryError,
  IssueBadgeData,
  IssueBadgeError,
  IssueBadgeRequest,
  ListJobsData,
  StartAssessmentData,
  StartAssessmentError,
  StartAssessmentRequest,
  SubmitAnswerData,
  SubmitAnswerError,
  SubmitAnswerParams,
  SubmitAnswerRequest,
  TelemetryIngestRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Returns a list of available skills to add.
   *
   * @tags dbtn/module:skills, dbtn/hasAuth
   * @name get_available_skills
   * @summary Get Available Skills
   * @request GET:/routes/skills/available
   */
  get_available_skills = (params: RequestParams = {}) =>
    this.request<GetAvailableSkillsData, any>({
      path: `/routes/skills/available`,
      method: "GET",
      ...params,
    });

  /**
   * @description Fetches all skills for the authenticated user.
   *
   * @tags dbtn/module:skills, dbtn/hasAuth
   * @name get_user_skills
   * @summary Get User Skills
   * @request GET:/routes/skills/user
   */
  get_user_skills = (params: RequestParams = {}) =>
    this.request<GetUserSkillsData, any>({
      path: `/routes/skills/user`,
      method: "GET",
      ...params,
    });

  /**
   * @description Adds a new skill for the authenticated user.
   *
   * @tags dbtn/module:skills, dbtn/hasAuth
   * @name add_user_skill
   * @summary Add User Skill
   * @request POST:/routes/skills/user
   */
  add_user_skill = (data: AddUserSkillRequest, params: RequestParams = {}) =>
    this.request<AddUserSkillData, AddUserSkillError>({
      path: `/routes/skills/user`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Starts a new assessment for a given skill.
   *
   * @tags dbtn/module:assessments, dbtn/hasAuth
   * @name start_assessment
   * @summary Start Assessment
   * @request POST:/routes/assessments
   */
  start_assessment = (data: StartAssessmentRequest, params: RequestParams = {}) =>
    this.request<StartAssessmentData, StartAssessmentError>({
      path: `/routes/assessments`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Gets the current state of an assessment.
   *
   * @tags dbtn/module:assessments, dbtn/hasAuth
   * @name get_assessment_state
   * @summary Get Assessment State
   * @request GET:/routes/assessments/{assessment_id}
   */
  get_assessment_state = ({ assessmentId, ...query }: GetAssessmentStateParams, params: RequestParams = {}) =>
    this.request<GetAssessmentStateData, GetAssessmentStateError>({
      path: `/routes/assessments/${assessmentId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Submits an answer for a question in an assessment.
   *
   * @tags dbtn/module:assessments, dbtn/hasAuth
   * @name submit_answer
   * @summary Submit Answer
   * @request POST:/routes/assessments/{assessment_id}/response
   */
  submit_answer = (
    { assessmentId, ...query }: SubmitAnswerParams,
    data: SubmitAnswerRequest,
    params: RequestParams = {},
  ) =>
    this.request<SubmitAnswerData, SubmitAnswerError>({
      path: `/routes/assessments/${assessmentId}/response`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Receives a conversation history and gets a response from an AI model.
   *
   * @tags dbtn/module:ai, dbtn/hasAuth
   * @name ask_ai
   * @summary Ask Ai
   * @request POST:/routes/ask-ai
   */
  ask_ai = (data: AskAIRequest, params: RequestParams = {}) =>
    this.request<AskAiData, AskAiError>({
      path: `/routes/ask-ai`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Issues a new badge for a completed and passed assessment.
   *
   * @tags dbtn/module:badges, dbtn/hasAuth
   * @name issue_badge
   * @summary Issue Badge
   * @request POST:/routes/badges/issue
   */
  issue_badge = (data: IssueBadgeRequest, params: RequestParams = {}) =>
    this.request<IssueBadgeData, IssueBadgeError>({
      path: `/routes/badges/issue`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Retrieves all badges for the authenticated user.
   *
   * @tags dbtn/module:badges, dbtn/hasAuth
   * @name get_user_badges
   * @summary Get User Badges
   * @request GET:/routes/badges
   */
  get_user_badges = (params: RequestParams = {}) =>
    this.request<GetUserBadgesData, any>({
      path: `/routes/badges`,
      method: "GET",
      ...params,
    });

  /**
   * @description Lists all open job postings.
   *
   * @tags dbtn/module:jobs, dbtn/hasAuth
   * @name list_jobs
   * @summary List Jobs
   * @request GET:/routes/jobs
   */
  list_jobs = (params: RequestParams = {}) =>
    this.request<ListJobsData, any>({
      path: `/routes/jobs`,
      method: "GET",
      ...params,
    });

  /**
   * @description Creates a new job posting. (Note: In a real app, this would be restricted to authorized recruiters/orgs)
   *
   * @tags dbtn/module:jobs, dbtn/hasAuth
   * @name create_job
   * @summary Create Job
   * @request POST:/routes/jobs
   */
  create_job = (data: CreateJobRequest, params: RequestParams = {}) =>
    this.request<CreateJobData, CreateJobError>({
      path: `/routes/jobs`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Ingests a batch of telemetry events from a user's assessment session. This is the core endpoint for the Anti-Fabrication Layer. - **request**: A batch of telemetry events. - **user**: The authenticated user, provided by the auth dependency.
   *
   * @tags Telemetry, dbtn/module:telemetry, dbtn/hasAuth
   * @name ingest_telemetry
   * @summary Ingest Telemetry
   * @request POST:/routes/v1/telemetry/ingest
   */
  ingest_telemetry = (data: TelemetryIngestRequest, params: RequestParams = {}) =>
    this.request<IngestTelemetryData, IngestTelemetryError>({
      path: `/routes/v1/telemetry/ingest`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
