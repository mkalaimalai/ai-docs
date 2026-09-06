# Extended AI Vendor Directory — Mapped to the GPB A&E Offsite

**Companion to:** `GPB-AE-Offsite-Notes.md` and `GPB-Offsite-Agentic-Landscape.md`
**Compiled:** September 2026

This is the wider sweep — the AI-native vendors and `.ai` sites in each capability area, including the categories the first landscape document didn't cover: architectural observability, AI code review, autonomous FinOps, and agent governance infrastructure.

**Two health warnings before the lists.**

1. **This category turns over roughly quarterly.** Confirmed casualties and changes in the last year alone: Octomind (AI testing) vanished; Bloop, the company behind Vibe Kanban, shut down in April 2026 with the project continuing community-maintained and fully local; Graphite was acquired by Cursor in December 2025. Verify a vendor is still trading before you put it in a plan.
2. **Benchmark claims in this space are mostly self-published and mutually contradictory.** On AI code review, one vendor-run benchmark of 118 real bugs across 45 repos put Greptile at 24% detection while Greptile's own head-to-head puts it >50% ahead of CodeRabbit. Treat every number as a hypothesis, not evidence. The only numbers worth acting on are the ones you generate on your own repos.

---

## 1. Architectural observability & agentic modernisation
### Maps to: Notes §3 (patterns), §8 (Meridian/ACL), §17 (domain boundaries)

This is the category most directly aimed at Rod's hexagonal-drift skill — and the one I under-covered last time.

| Product | Site | What it does | Fit |
|---|---|---|---|
| **vFunction** | vfunction.com | AI-driven architectural observability: baselines how an app is architected, identifies domains and cross-domain pollution, monitors architectural drift against the intended boundaries and dependency rules over time, and generates prescriptive modernisation "to do" tasks. Custom rules and alerts (e.g. enforce an architectural policy across hundreds of microservices), OpenTelemetry integration, and a Refactoring Engine that automates extraction of identified domains into services. **vFunction 4.5 added the vFunction Agent** — you give the intent, the agent handles implementation, working through TODOs in one conversational workflow. | **The closest commercial product to what §3 and §8 describe.** Their Q1 2026 framing is worth quoting internally: the differentiator is not who generates more code, but who can define bounded contexts correctly, maintain behavioural integrity during refactoring, and embed governance and resilience into the modernisation process. Also cites the Gartner line that by 2026, 80% of technical debt will be architectural technical debt. |
| **CAST** (Imaging / Highlight) | castsoftware.com | Static architectural mapping of large estates, portfolio-level cloud-readiness scoring | The incumbent alternative; heavier, less agentic |
| **Moderne** | moderne.ai | Deterministic multi-repo transformation on the Lossless Semantic Tree | Covered in the previous doc; pairs with vFunction — vFunction finds the boundary, OpenRewrite moves the code |
| **CodeScene** | codescene.com | Behavioural code analysis — hotspots, coupling and knowledge risk from git history | Directly operationalises the transcript's "git history is context" observation |
| **IcePanel** | icepanel.io | C4 model diagramming with a live catalog; pairs with EventCatalog | Business-facing architecture view for the §7 audience |
| **Structurizr** | structurizr.com | Architecture-as-code (C4 DSL) — diagrams generated from a model in git | The OSS-adjacent option if you want the model in the repo |
| **Mechanical Orchard** | mechanical-orchard.com | AI-assisted mainframe/legacy rewrite with behavioural equivalence verification | Relevant to the §8 parallel-run verification pattern, if mainframe is in scope |
| **Blitzy** | blitzy.com | Autonomous large-scale codebase transformation | Watch-list; verify claims independently |

---

## 2. AI code review — the missing gate in §11 and §14
### Maps to: Notes §11 (PR gates), §14 (shift-left enforcement), §18 (multi-lens review)

Two research findings make this category unavoidable given your direction of travel: Veracode tested 100+ LLMs and found 45% of AI-generated code samples introduced an OWASP Top 10 vulnerability; and Faros AI measured that once AI-generated code enters a pipeline, review time increased 91% and PR size grew 154%. **If you accelerate generation without an automated review gate, you move the bottleneck rather than removing it** — which is exactly what §14 predicted.

| Product | Site | Note |
|---|---|---|
| **Qodo** | qodo.ai | Governance-first — a configurable rule system that enforces specific engineering standards, multi-agent architecture with auto-learning rules, and coverage across all four major git providers (relevant given your Bitbucket estate). Built on PR-Agent, which they handed to the community as open source in April 2026. **The best fit for "encode our architecture standards as review rules."** |
| **CodeRabbit** | coderabbit.ai | Layers AI on 40+ bundled linters and SAST scanners; broadest platform support including GitLab, Azure DevOps and Bitbucket; noisier (~10.8 comments/PR) |
| **Greptile** | greptile.com | Indexes the whole codebase before commenting; catches issues that depend on callers, shared modules and internal APIs — invisible from the diff alone. Self-hosting and GitLab support. Turns code review into architecture review |
| **Macroscope** | macroscope.com | Claims the only integrated detect–fix–validate auto-fix loop; publishes the 118-bug benchmark others are measured against |
| **Cursor BugBot** | cursor.com/bugbot | Extremely selective (~0.9 comments/PR, nearly all runtime-relevant) — the low-noise option |
| **Kodus** | kodus.io | Open source AI code review — the self-hostable option |
| **PR-Agent** | github.com/qodo-ai/pr-agent | Open source; the base layer several products are built on |
| **SonarQube / Codacy** | sonarsource.com, codacy.com | Deterministic SAST plus AI layer in one product. Worth remembering the trade-off: SAST applies deterministic rules and returns the same result every run; AI review reads intent and catches logic errors no rule expresses, **at the cost of reproducibility** — which matters for audit evidence |

**Deployment filter for JPMC:** most of these are SaaS-only. Enterprise Server support, air-gapped deployment, cross-repo context and a rules layer are the four requirements that eliminate most of the list. Qodo and Greptile are the two that survive it; Graphite Diamond explicitly lacks all four.

---

## 3. Autonomous FinOps — this partially fills the gap I said was empty
### Maps to: Notes §4 (cost as the economic engine), §10 (risk score from unit cost)

Last time I said nothing joins unit economics to architecture-pattern recommendation. That's still true for the *recommendation* half, but the *autonomous action* half now exists.

| Product | Site | What it does |
|---|---|---|
| **Sedai** | sedai.io | The genuinely autonomous one: reinforcement-learning platform with dedicated cost, performance and safety agents, three operating modes including full autopilot, executing **SLO-aware** optimisation continuously across compute and Kubernetes. Palo Alto Networks reported $3.5M saved. Extended in 2026 to GPU/inference/model-serving cost |
| **Cast AI** | cast.ai | Kubernetes-only: real-time pod rightsizing, spot automation with interruption protection, bin-packing. Stops at the infrastructure layer |
| **nOps / Clara** | nops.io | AWS-focused; Clara detects anomalies, identifies root cause and routes actions; Compute Copilot autonomously manages spot fleets |
| **ProsperOps** | prosperops.com | Autonomous RI/Savings Plan management — strong for high-spend AWS with stable workloads |
| **Cloudgov.ai** | cloudgov.ai | **Read-only multicloud agent with approval-gated remediation, explicitly built for regulated teams** — the shape most likely to pass your controls |
| **Vantage** | vantage.sh | Cost visibility and reporting; the reference for allocation done well |
| **Harness CCM** | harness.io | Rightsizing and scheduling — already in your platform |
| **IBM Turbonomic** | ibm.com/turbonomic | Hybrid/multi-cloud resource optimisation; heavy enterprise implementation |
| **Amnic / usage.ai / PointFive** | amnic.com, usage.ai | Newer entrants; PointFive's TokenShift also compresses tokens for coding agents |

**The number for your CTO deck:** the FinOps Foundation's State of FinOps 2026 surveyed 1,192 practitioners representing >$83bn of annual cloud spend and found 98% now manage AI spend, up from 31% two years earlier. Cloud waste is estimated at ~$44.5bn annually. And the concept worth importing directly into §4: **shift-left FinOps** — cost-modelling a workload *before* it is provisioned rather than remediating after the bill. That is precisely the environment-profile-plus-cost-estimate gate you described.

---

## 4. AI SRE and incident response — the `.ai` roster
### Maps to: Notes §10

Beyond the four in the previous doc, the fuller field:

| Product | Site | Angle |
|---|---|---|
| Resolve AI | resolve.ai | Parallel hypothesis investigation; targets ~80% autonomous resolution |
| Traversal | traversal.com | Causal RCA at scale; **on-prem option** |
| Cleric | cleric.ai | Autonomous SRE teammate investigating alerts 24/7, delivering RCA in Slack |
| Anyshift | anyshift.io | Versioned infrastructure graph — answers "what changed?" as a query rather than inferring from telemetry |
| NeuBird | neubird.ai | Agentic co-pilot for enterprise IT; 230K+ alerts resolved |
| Sherlocks AI | sherlocks.ai | AI-native SRE assistant with institutional memory |
| Wild Moose | wildmoose.ai | First responder — root cause surfaced in under a minute |
| Kubiya | kubiya.ai | Agentic platform with Slack/Teams natural-language commands, Terraform and CI/CD automation, RBAC |
| SRE.ai | sre.ai | NL agents for enterprise DevOps workflows |
| CloudThinker | cloudthinker.io | AgenticOps positioning, broader than incident response |
| Metoro | metoro.io | Runs the full loop — detect, investigate, verify, open a fix |
| Aurora | aurorasre.ai | Agentic investigation; publishes a useful taxonomy of the category |
| Parity | tryparity.com | Kubernetes reliability agent |
| **HolmesGPT / K8sGPT** | github.com/robusta-dev/holmesgpt, k8sgpt.ai | The open-source, self-hostable options |

**Sovereign/self-hosted note:** at least one vendor in this space now runs entirely inside your environment with zero data egress specifically for regulated estates (banking, rail, defence), pricing against infrastructure size rather than seats or log volume. That deployment model — not the model quality — is the filter that matters for you.

---

## 5. Testing and quality — the `.ai` roster
### Maps to: Notes §13

| Product | Site | Angle |
|---|---|---|
| **Keploy** | keploy.io | eBPF record-replay with auto-generated dependency mocks (Apache 2.0) — covered previously, still the top pick |
| **Tusk** | usetusk.ai | Drift: live traffic record/replay as API tests, PR-native regression detection |
| **Momentic** | momentic.ai | Most developer-forward of the low-code platforms; exploratory testing exposed via MCP; note tests live in the platform and can't be exported as code |
| **mabl** | mabl.com | Broadest single-platform coverage: web, mobile, API, performance, accessibility |
| **QA.tech** | qa.tech | Autonomous QA agents; publishes an unusually honest comparison of the field |
| **Bug0** | bug0.com | Planner/Generator/Healer pattern with MCP integration; describes the multi-lens agent-team testing model (functional + security + accessibility + performance on the same flow, sharing one browser context) |
| **Checksum** | checksum.ai | Generates Playwright/Cypress tests **from real user sessions** — the commercial version of §13's capture half |
| **testRigor** | testrigor.com | Plain-English test authoring, strong self-healing |
| **Functionize** | functionize.com | Imports existing Selenium/Cypress suites instead of requiring a rewrite |
| **QA Wolf** | qawolf.com | QA-as-a-service generating Playwright at scale |
| **Antithesis** | antithesis.com | Deterministic simulation with time control — the only credible answer to your T+1/T+2 batch problem |
| **AgentQL** | agentql.com | NL queries with self-healing selectors that plug into Playwright |
| **Stagehand / Browserbase** | browserbase.com | "Playwright that AI can use"; exposes the underlying page object so you can mix approaches |
| **Skyvern** | skyvern.com | Browser workflows via LLM + computer vision |
| **TestDino** | testdino.com | Reporting/analytics layer over the Playwright agent ecosystem |

---

## 6. Data, catalogs and agentic governance — the `.ai` roster
### Maps to: Notes §15–17

| Product | Site | Angle |
|---|---|---|
| **Atlan** | atlan.com | MCP-native governance; Gartner MQ Leader 2026 for D&A Governance |
| **Marmot** | marmotdata.io | Open source, native MCP, single Go binary on Postgres — no Kafka, graph store or search cluster to run |
| **DQLabs / Prizm** | dqlabs.ai | Catalog + observability + DQ as one continuously validated context layer exposed to agents via MCP |
| **Secoda / Select Star / data.world** | secoda.co, selectstar.com, data.world | Mid-market and knowledge-graph-shaped alternatives |
| **Promethium** | promethium.ai | Publishes the "data product management for AI agents" architecture — metadata as operational infrastructure agents query at decision time |
| **Dataworkers** | dataworkers.io | Apache-2.0 agent-native data stack; useful six-layer reference architecture (storage, transformation, metadata, agents, observability, governance) |
| **Monte Carlo / Soda** | montecarlodata.com, soda.io | Data observability feeding trust signals into the contract |
| **Tonic / Gretel / Synthesized** | tonic.ai, gretel.ai, synthesized.io | Masking, subsetting and synthesis with cross-database referential integrity — the §13 seed-data problem |
| **OvalEdge** | ovaledge.com | Publishes the governance-*by*-agents vs governance-*of*-agents distinction, which is the framing to adopt |

**The claim to test:** Atlan's research that 40% of AI agents fail without proper context layers, because agents lack the business definitions and governance signals experienced employees carry in their heads. Whether or not the number holds, it is the argument for §16's AI-ready metadata programme.

---

## 7. Agentic SDLC platforms & coding agents
### Maps to: Notes §18

| Product | Site | Angle |
|---|---|---|
| **Augment Code** | augmentcode.com | Context Engine over 400–500k file codebases, MCP-compatible; Cosmos coordinates agents across triage, authoring, review and verification. Covered in detail previously |
| **Cognition / Devin** | devin.ai, cognition.ai | Autonomous engineer; also now owns Windsurf |
| **Factory** | factory.ai | "Droids" — enterprise agent fleet with strong audit posture |
| **Sourcegraph Amp** | ampcode.com | Agentic coding on top of Sourcegraph's code intelligence — the closest philosophical cousin to SCG |
| **Tessl** | tessl.io | Spec-centric development — the code becomes the artefact, the spec is the source |
| **Cursor** | cursor.com | Background agents + BugBot; acquired Graphite |
| **Kilo** | kilocode.ai | Hosted Gastown, plus their own agent |
| **Manus** | manus.im | Task-driven reasoning engine rather than a PR comment bot — an "AI analyst" shape worth studying for architecture review |

---

## 8. Agent governance infrastructure — the newest category
### Maps to: Notes §18's unresolved marketplace and skills problem

This barely existed a year ago and is now where the enterprise action is.

| Thing | Site | Why it matters |
|---|---|---|
| **Anthropic enterprise skills governance** | platform.claude.com/docs → Agent Skills → enterprise | The authoritative guidance: internal registry per skill, role-based bundles containing only what that role needs daily, skills in git for history and PR review |
| **LiteLLM** | litellm.ai | Can act as a central Claude Code plugin registry — admins govern which plugins are available org-wide, engineers install from one source, served as a marketplace URL |
| **Smithery** | smithery.ai | MCP and skills registry with cross-client install (Claude Code, Codex, Copilot, Cursor, Roo, OpenHands, and ~15 others) — useful as a model for how a *portable* skill registry should behave |
| **claude-plugins.dev** | claude-plugins.dev | Public discovery index (~12k plugins, ~63k agent skills at last count) — mainly useful as a scale reality-check on why curation matters |
| **skills.sh / skild.sh** | skills.sh | CLI-based skill installation from git — the distribution mechanism to copy |
| **Harness AI Asset Catalog** | harness.io | Discovers every agent, skill and plugin in your repos and who owns them — the governance-of-agents inventory, in a platform you already license |
| **OWASP GenAI / Agentic Top 10** | genai.owasp.org | The threat model you'll be asked for. Note the standing reality: there is no binary signing for plugins in 2026, so the defence is marketplace allowlist + runtime hooks + human review before entry |
| **AIUC-1** | — | Emerging certification standard for AI coding agent security, safety and reliability; Lovable is among the first pursuing it, with third-party audit scheduled summer 2026. Worth tracking as procurement language |

---

## 9. Platform / IDP adjacent
### Maps to: Notes §2, §4, §9, §12

| Product | Site | Angle |
|---|---|---|
| Port | port.io | Agentic engineering platform; Context Lake |
| Cortex | cortex.io | Scorecards and standards enforcement as the framework agents evaluate against |
| OpsLevel | opslevel.com | Standards enforcement, lighter than Cortex |
| Roadie | roadie.io | Managed Backstage |
| Humanitec | humanitec.com | Platform Orchestrator — governance applied when a developer *or agent* requests a deployment |
| Kratix | kratix.io | Promises as composable platform capability contracts |
| Facets / Qovery / env0 | facets.cloud, qovery.com, env0.com | Environment-as-a-service and Terraform orchestration layers |
| Firefly | firefly.ai | Cloud asset inventory, drift detection and IaC codification — relevant to §9's "we don't treat infrastructure as cattle" |
| DuploCloud | duplocloud.com | Full-stack agentic DevOps with structured approval workflows and audit trails — the compliance-shaped version |
| Northflank | northflank.com | Useful published comparisons of the whole IDP field |

---

## 10. How to evaluate any of these — a five-question filter

Given the volume, use a filter rather than a shortlist. For each candidate, ask:

1. **Where does execution happen?** In your environment, or does source/telemetry leave it? This eliminates ~60% of the list immediately for JPMC.
2. **Is it MCP-compatible / does it expose its context to other agents?** Anything that only works inside its own agent UI is a silo you'll have to unpick. Augment's context layer and EventCatalog's MCP server pass; most low-code testing platforms fail.
3. **Does it produce a deterministic, reviewable artefact?** A PR, a recipe, a policy, a signed attestation. Anything whose output is only a chat answer can't feed a control.
4. **Does it consume your context, or ask the model to guess?** The consistent finding across security, SRE and code review is that pre-computed context (reachability, topology, dependency graph) beats a bigger model. This is the question SCG is the answer to.
5. **Will it exist in 18 months?** Check funding, ownership changes and whether the OSS project is company-controlled. Three of the tools on these lists changed status in the last twelve months.

---

## 11. What still has no vendor

Updated from the previous doc, having now swept the wider field:

- **Unit-cost-per-request feeding architecture pattern recommendation and LDA accountability** (§4, §10). Sedai and Cloudgov autonomously *optimise* within the chosen architecture; nobody recommends a different *pattern* because your cost-per-request is wrong, and nobody routes that to an accountable architect. Still the most novel idea in the pack.
- **Business-fact vs system-behaviour event taxonomy enforcement** (§6). EventCatalog gives you the place to record and check it; the taxonomy and ownership split remain yours.
- **Stateful replay with reset semantics and T+1/T+2 time simulation** (§13). Antithesis is the only near-miss.
- **A credible benchmark of which engineering task classes parallelise profitably across agent fleets** (§18). Everyone publishes cost savings; nobody publishes the boundary.
- **Reconciling functional domains with data domains** (§17). Organisational.
