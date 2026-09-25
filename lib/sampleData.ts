export interface SampleTranscript {
  id: string;
  name: string;
  description: string;
  transcript: string;
}

export const SAMPLE_TRANSCRIPTS: SampleTranscript[] = [
  {
    id: 'sprint-planning',
    name: 'Sprint 24 Planning & Tech Debt Review',
    description: 'Engineering team discussing auth refactor, database indexing, and release deadlines.',
    transcript: `Alex (Product Lead): Alright team, let's lock in our Sprint 24 commitments. Top priority is the authentication flow overhaul and the customer dashboard latency issue.

Priya (Senior Backend): I looked into the latency. It's definitely the missing composite index on the events table. I will write the database migration and benchmark the query performance by this Thursday, October 1st.

Marcus (Tech Lead): Great. Regarding the auth overhaul: we discussed using NextAuth with Google OAuth. Alex, we need to decide if we are deprecating the legacy session cookie approach immediately or keeping a 30-day grace period.

Alex: Let's keep a 30-day backward-compatibility grace period for mobile app users so we don't break existing sessions. That is an official decision.

Marcus: Got it. I will take ownership of setting up NextAuth v5 and configuring the Google Cloud OAuth scopes for Calendar and Gmail by next Monday, October 5th.

Elena (Frontend Lead): On frontend, we need to redesign the review dashboard cards and connect the Jira API dispatch button. Elena will finish the UI component overhaul by Friday, October 2nd.

Alex: Perfect. Also, Priya, could you email the security audit team with our OAuth data access rationale by tomorrow afternoon?

Priya: Yes, I'll send that security compliance memo by Wednesday 3 PM.

Alex: Decision confirmed: Sprint 24 freeze date is October 10th, and QA signoff is required before any staging merge.`
  },
  {
    id: 'product-roadmap',
    name: 'Q4 Product Roadmap & Vendor Selection',
    description: 'Executive sync on AI provider selection, enterprise pricing tier, and launch dates.',
    transcript: `Sarah (VP of Product): Welcome everyone. Today we are deciding between Groq, OpenAI, and Anthropic for our live meeting transcript parser.

David (Head of Engineering): We ran latency benchmarks on 5,000 token transcripts. Groq with Llama-3.3-70b achieved 450 tokens/second with sub-second response times, whereas the alternatives took 6-9 seconds. Given our real-time UX requirement, Groq is clearly the superior choice and cuts API costs by 70%.

Sarah: That settles it. Official decision: We are selecting Groq as our primary LLM inference engine for all transcript processing pipelines.

David: I'll coordinate the Groq enterprise tier provisioning and API key distribution across the backend microservices by October 3rd.

Chloe (Head of Sales): For our enterprise tier, customers are asking for direct Jira and Slack channel integrations. Chloe will reach out to our top 5 pilot customers to gather their webhook specifications by Friday, October 2nd.

Sarah: Decision made on pricing: Enterprise tier will be priced at $49/seat/month, including unlimited transcripts and multi-tool automations.

David: Chloe, please send me the pilot customer feedback notes by Monday so we can scope Jira custom fields accordingly.`
  },
  {
    id: 'client-kickoff',
    name: 'Enterprise Client Architecture Kickoff',
    description: 'Vendor sync discussing single sign-on, data residency, and SLA commitments.',
    transcript: `Jason (Solutions Architect): Thanks for joining the kickoff. Let's confirm the integration requirements for Acme Corp's deployment.

Rachel (Client Tech Lead): Our compliance team requires all database records to reside in Supabase AWS us-east-1 region, with row-level security enabled.

Jason: We agree to host the dedicated database instances in us-east-1 with RLS policies strictly enforced. That is our agreed architecture standard.

Rachel: For user management, we want Google Workspace single sign-on with automatic calendar event creation for any assigned action items.

Jason: Jason will deploy the staging environment with Google Calendar API integration configured by October 4th.

Rachel: And Rachel will provide Acme Corp's OAuth Client ID and verified domain list by October 1st.`
  }
];
