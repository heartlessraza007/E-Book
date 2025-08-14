import {
  AddUserSkillData,
  AddUserSkillRequest,
  AskAIRequest,
  AskAiData,
  CheckHealthData,
  CreateJobData,
  CreateJobRequest,
  GetAssessmentStateData,
  GetAvailableSkillsData,
  GetUserBadgesData,
  GetUserSkillsData,
  IngestTelemetryData,
  IssueBadgeData,
  IssueBadgeRequest,
  ListJobsData,
  StartAssessmentData,
  StartAssessmentRequest,
  SubmitAnswerData,
  SubmitAnswerRequest,
  TelemetryIngestRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Returns a list of available skills to add.
   * @tags dbtn/module:skills, dbtn/hasAuth
   * @name get_available_skills
   * @summary Get Available Skills
   * @request GET:/routes/skills/available
   */
  export namespace get_available_skills {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAvailableSkillsData;
  }

  /**
   * @description Fetches all skills for the authenticated user.
   * @tags dbtn/module:skills, dbtn/hasAuth
   * @name get_user_skills
   * @summary Get User Skills
   * @request GET:/routes/skills/user
   */
  export namespace get_user_skills {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserSkillsData;
  }

  /**
   * @description Adds a new skill for the authenticated user.
   * @tags dbtn/module:skills, dbtn/hasAuth
   * @name add_user_skill
   * @summary Add User Skill
   * @request POST:/routes/skills/user
   */
  export namespace add_user_skill {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AddUserSkillRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AddUserSkillData;
  }

  /**
   * @description Starts a new assessment for a given skill.
   * @tags dbtn/module:assessments, dbtn/hasAuth
   * @name start_assessment
   * @summary Start Assessment
   * @request POST:/routes/assessments
   */
  export namespace start_assessment {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = StartAssessmentRequest;
    export type RequestHeaders = {};
    export type ResponseBody = StartAssessmentData;
  }

  /**
   * @description Gets the current state of an assessment.
   * @tags dbtn/module:assessments, dbtn/hasAuth
   * @name get_assessment_state
   * @summary Get Assessment State
   * @request GET:/routes/assessments/{assessment_id}
   */
  export namespace get_assessment_state {
    export type RequestParams = {
      /** Assessment Id */
      assessmentId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAssessmentStateData;
  }

  /**
   * @description Submits an answer for a question in an assessment.
   * @tags dbtn/module:assessments, dbtn/hasAuth
   * @name submit_answer
   * @summary Submit Answer
   * @request POST:/routes/assessments/{assessment_id}/response
   */
  export namespace submit_answer {
    export type RequestParams = {
      /** Assessment Id */
      assessmentId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = SubmitAnswerRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitAnswerData;
  }

  /**
   * @description Receives a conversation history and gets a response from an AI model.
   * @tags dbtn/module:ai, dbtn/hasAuth
   * @name ask_ai
   * @summary Ask Ai
   * @request POST:/routes/ask-ai
   */
  export namespace ask_ai {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AskAIRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AskAiData;
  }

  /**
   * @description Issues a new badge for a completed and passed assessment.
   * @tags dbtn/module:badges, dbtn/hasAuth
   * @name issue_badge
   * @summary Issue Badge
   * @request POST:/routes/badges/issue
   */
  export namespace issue_badge {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = IssueBadgeRequest;
    export type RequestHeaders = {};
    export type ResponseBody = IssueBadgeData;
  }

  /**
   * @description Retrieves all badges for the authenticated user.
   * @tags dbtn/module:badges, dbtn/hasAuth
   * @name get_user_badges
   * @summary Get User Badges
   * @request GET:/routes/badges
   */
  export namespace get_user_badges {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetUserBadgesData;
  }

  /**
   * @description Lists all open job postings.
   * @tags dbtn/module:jobs, dbtn/hasAuth
   * @name list_jobs
   * @summary List Jobs
   * @request GET:/routes/jobs
   */
  export namespace list_jobs {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListJobsData;
  }

  /**
   * @description Creates a new job posting. (Note: In a real app, this would be restricted to authorized recruiters/orgs)
   * @tags dbtn/module:jobs, dbtn/hasAuth
   * @name create_job
   * @summary Create Job
   * @request POST:/routes/jobs
   */
  export namespace create_job {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateJobRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateJobData;
  }

  /**
   * @description Ingests a batch of telemetry events from a user's assessment session. This is the core endpoint for the Anti-Fabrication Layer. - **request**: A batch of telemetry events. - **user**: The authenticated user, provided by the auth dependency.
   * @tags Telemetry, dbtn/module:telemetry, dbtn/hasAuth
   * @name ingest_telemetry
   * @summary Ingest Telemetry
   * @request POST:/routes/v1/telemetry/ingest
   */
  export namespace ingest_telemetry {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TelemetryIngestRequest;
    export type RequestHeaders = {};
    export type ResponseBody = IngestTelemetryData;
  }
}
