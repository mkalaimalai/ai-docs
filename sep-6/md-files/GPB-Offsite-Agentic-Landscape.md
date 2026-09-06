# Agentic Solutions, Products & Repos — Mapped to the GPB A&E Offsite

**Companion to:** `GPB-AE-Offsite-Notes.md`
**Compiled:** September 2026
**How to use it:** each section maps 1:1 to a section of the offsite notes. For each capability you get (a) what agentic solutions exist today, (b) commercial products worth studying, (c) GitHub projects worth copying from, and (d) a **verdict** — buy / steal the pattern / build.

A note on selection: I've filtered for things that are (1) actually shipping in 2026, not roadmap, (2) either open source or deeply documented enough to learn the architecture from, and (3) compatible with a regulated, on-prem-leaning estate. Vendors that require sending production telemetry or source to a SaaS control plane are flagged.

---

## 0. The five findings that matter most

Before the section-by-section detail, these are the ones that change the plan:

1. **Harness already ships most of the delivery broker.** Autonomous Worker Agents and the Agent Marketplace went GA on 30 June 2026 — agents as governed pipeline steps in CI, CD, IaCM and security, reasoning over Harness's *Software Delivery Knowledge Graph*, running under sandboxing, scoped credentials and audit trails, with per-pipeline choice of Anthropic/OpenAI/Gemini models. Harness also now has an **AI Asset Catalog** that discovers every agent, skill and plugin in your repos and who owns them, plus AgentTrace for agent decision paths, an MCP server exposing Harness to Claude Code, and Harness IDP (Backstage-based) and Harness Chaos Engineering. You are paying for a large fraction of §12, §14, §10 and §18's governance problem already.
2. **The replay substrate in §13 exists as open source.** Keploy (Apache 2.0) captures API calls, DB queries and queue traffic at the kernel level with eBPF — no code changes, no sidecar — and replays them with auto-generated dependency mocks. That is precisely the "record real behaviour, replay without downstream dependencies running" design, minus the UI-click capture. Tusk Drift is the same idea, PR-native, with an open CLI.
3. **EventCatalog has become agent-native.** It now ships an MCP server (scopable to a domain), an Agents product that maintains catalog documentation from PR diffs, Skills that teach *any* agent EventCatalog conventions, and CI breaking-change detection that identifies affected consumers before merge. The §7 "catalogue is the agent interface" argument is no longer speculative.
4. **The marketplace blocker in §18 is solvable today without nested marketplaces** — see §J. The pattern is a *registry-first generated manifest* plus per-repo `permissions.deny`, which is how Datadog runs it. You don't need nesting; you need generation and filtering.
5. **The remediation gap is a determinism problem, not a model problem.** Moderne's own position — worth reading before you build anything here — is that agentic coding alone doesn't close it. The winning architecture everywhere is *deterministic transformation first (OpenRewrite LST recipes), agent only for the residue*, with reachability/upgrade-impact analysis supplied as context rather than left for the model to infer. Endor Labs reports agents doing security tasks 2.8× faster with 92% fewer tokens when given that pre-computed context.

---

## A. Architecture as a Product / platform-as-product (Notes §1–4)

### Agentic solutions
- **Port** — repositioned in 2026 as an "Agentic Engineering Platform": Context Lake, workflow orchestration, agent governance, with the portal as a command centre for agents that resolve incidents, remediate vulnerabilities and enforce standards. Closest commercial articulation of exactly what Rod described.
- **Cortex** — scorecards + ownership + standards enforcement as the *framework agents evaluate against*. The relevant idea: not every autonomous workflow should start with a prompt; many should start with a standard.
- **Harness AI DevOps Agent** — conversational generation of pipeline YAML and IaC configs, pipeline troubleshooting, OpenAPI spec generation from existing code.
- **CNOE / `ai-platform-engineering` (CAIPE)** — open-source multi-agent system for platform engineering: a supervisor agent plus ArgoCD, PagerDuty, GitHub, Jira/Confluence, Slack sub-agents, integrating with Backstage. The clearest open reference architecture for "platform capabilities as a fleet of specialist agents".

### Products to learn from
| Product | What to study | Caveat |
|---|---|---|
| Port (port.io) | Context Lake concept; agent governance model; how they turn a catalog into an agent action surface | SaaS |
| Cortex | Scorecards as machine-readable standards | SaaS |
| Humanitec | Platform Orchestrator pattern — sits between developer interface and infra, wraps existing Terraform modules with governance, applies rules per environment when a developer *or agent* requests a deployment | Self-hosted option exists |
| Kratix | "Promises" — a clean model for platform capabilities as versioned, composable contracts | OSS |
| Roadie | Managed Backstage — study for what you don't want to operate | SaaS |

### GitHub to copy from
- `backstage/backstage` — catalog descriptor format, scaffolder templates, permission framework
- `cnoe-io/ai-platform-engineering` — multi-agent platform engineering reference (A2A + MCP sub-agents)
- `syntasso/kratix` — Promise API for platform capabilities
- `score-spec/score` + `humanitec/score-*` — workload specification as the developer-facing intent contract
- `crossplane/crossplane` — compositions as the "pattern with multiple strategy implementations" model from §3

### Verdict
**Steal the pattern, don't buy the portal.** You already have Harness IDP (Backstage-based) and a licence. The genuinely new idea to import is Humanitec's *orchestrator* separation — developer interface, orchestrator, execution — which is exactly the experience/broker/execution split in §12. Study CAIPE as the reference for turning §3's pattern catalogue into a fleet of narrow, auditable agents rather than one large one.

---

## B. Patterns as products & automated enforcement (Notes §3–4)

### Agentic solutions
The mature answer here is deliberately *not* agentic at the enforcement point. Enforcement stays deterministic (policy engines, LST transformations); agents author, discover and remediate.

- **Moderne / OpenRewrite** — recipes operate on a Lossless Semantic Tree, so transformations are deterministic and semantically accurate rather than regex or model guesswork; Moderne orchestrates recipes across thousands of repos with coordinated PRs, impact preview and audit trail. This is the single best fit for "codify the pattern, then enforce it across the estate", and it also covers §14.
- **OPA/Rego + Conftest, Kyverno, HashiCorp Sentinel** — the policy hierarchy from §4 (firm → AWM → GPB → LOB → team) is a Rego bundle hierarchy, not a new build.
- **Agent-authored recipes** — the emerging pattern is an agent that discovers a repeated pattern across repos and *emits an OpenRewrite recipe or Rego policy*, which is then reviewed once and applied deterministically forever. That is the highest-leverage thing your architecture skills should produce.

### GitHub to copy from
- `openrewrite/rewrite` + `openrewrite/rewrite-spring`, `rewrite-migrate-java` — recipe structure, and the catalogue model for patterns
- `open-policy-agent/conftest`, `open-policy-agent/gatekeeper`
- `kyverno/kyverno` — policy-as-code with mutation as well as validation
- `crossplane/crossplane` compositions — one pattern, per-cloud strategy implementations

### Verdict
**Build the recipes, buy nothing yet.** Rod's hexagonal-architecture drift skill and the pattern-conformance skills are the right shape; the upgrade is to make their *output* a deterministic artefact (a recipe or a policy) rather than a report. Evaluate Moderne commercially only once you have >10 recipes you want to run across 400 repos with audit trails.

---

## C. Event catalogue, domain events, schema governance (Notes §6–8)

### Agentic solutions
- **EventCatalog Agents** (`event-catalog/agents`) — AI agents that read a PR diff, understand EventCatalog conventions (domains, services, events, commands, queries, channels, specs) and maintain the catalog documentation for you rather than you hand-writing catalog files. Guided by published **Skills** (`event-catalog/skills`) so any agent — not just theirs — produces correct catalog output.
- **EventCatalog MCP server** — agents query the architecture graph: find resources, inspect schemas and ownership, follow producers/consumers, analyse change impact. Crucially it can be **scoped to a domain or system**, giving an agent only the reachable subgraph. That is your entitlement model for agent access to architecture.
- **Breaking-change detection in CI** — the agent reviews a schema change against the catalog, flags the break, and names the affected consumers before merge. This is §6's schema governance, automated.
- **Buf** (`bufbuild/buf`) — `buf breaking` for deterministic protobuf compatibility gates; the same discipline for Avro/JSON Schema via Confluent Schema Registry compatibility modes.

### Products to learn from
| Product | What to study |
|---|---|
| EventCatalog Cloud | Federation model for multiple catalogs across orgs — directly relevant to GPB/IPB/USPB flavours in §6 |
| Confluent Stream Governance | Schema registry + stream lineage + data contracts as a single product |
| Microcks | Turning AsyncAPI/OpenAPI specs into live mocks *and* contract tests — bridges §7 and §13 |
| Solace Event Portal | The commercial "event catalogue with runtime discovery" model, for comparison |

### GitHub to copy from
- `event-catalog/eventcatalog` (core), `event-catalog/agents`, `event-catalog/skills`, `event-catalog/mcp-server`, `event-catalog/generators` (OpenAPI/AsyncAPI/Kafka/EventBridge ingestion), `event-catalog/backstage-plugin-eventcatalog`, `event-catalog/flowmart-schema-registry` (the demo you saw), `event-catalog/federation-organization-example`, `event-catalog/eventcatalog-linter`
- `microcks/microcks` — CNCF; spec-driven mocking + contract testing
- `asyncapi/generator`, `cloudevents/spec`
- `bufbuild/buf` — breaking-change detection as a CI gate

### Verdict
**Adopt EventCatalog, extend it — don't rebuild it.** Specifically: the generators give you the CI-time inference from §7; the MCP server with domain scoping gives you the agent interface and the entitlement boundary in one; the Agents + Skills give you self-maintaining documentation; and the federation example addresses the GPB-vs-LOB flavour question. The only genuinely custom piece is the **quarantine mechanism** (non-compliant SEALs deploy but don't appear in the catalog) — that's a CI policy gate you write, roughly 200 lines.

---

## D. Environments, delivery broker, preview environments (Notes §9, §11, §12)

### Agentic solutions
- **Harness Autonomous Worker Agents** — each agent pairs a prompt, a model connector and optional MCP data sources into a single pipeline step, usable across CI/CD/IaCM/security. Six prebuilt agents including Autofix, Code Review and IaCM Remediation. Verint and United Airlines reportedly built production agents in ~4 days. This is your delivery broker's agent layer, already governed.
- **GitHub Agentic Workflows** (preview May 2026) — intent-driven AI inside repository automation with guardrails.
- **Dagger** — programmable CI as a typed API with LLM primitives; the best open model for "pipeline as code an agent can call" rather than YAML an agent edits.

### The three pieces you should not build
| Need from §12 | Existing solution |
|---|---|
| Intent → workload spec | **Score** (`score-spec/score`) — the deployment-intent contract, cloud-agnostic, with Humanitec/Kubernetes/Compose implementations. This *is* your `platform deploy dev` input format. |
| Promotion record & progression history | **Kargo** (`akuity/kargo`) — stage-based promotion of immutable artefacts through environments with a full promotion history. Exactly §11's build-once/promote-many and §12's promotion record. |
| Progressive delivery | **Argo Rollouts** — canary/blue-green with analysis-driven automated rollback |

### Preview environments — the cost problem in §12
- **Signadot** — request-level isolation ("sandboxes") inside one shared baseline cluster: you spin up only the service under test, and route only tagged requests to it. This directly answers "an environment per PR is too expensive" *and* "we don't want all downstream dependencies running". Study this before building ephemeral namespaces.
- **Uffizzi**, **Bunnyshell**, **Okteto** — full ephemeral environment platforms with TTL destruction
- **Argo CD ApplicationSet PR Generator** — the OSS primitive: an environment per open PR, destroyed on merge/close, ~30 lines of YAML

### Artefact immutability & evidence (§11)
- **SLSA** provenance levels; **sigstore/cosign** for signing; **in-toto** attestations. The "evidence that cannot be disputed, almost like a blockchain" line in the transcript has a standards answer: signed, verifiable build provenance attached to the artefact.

### GitHub to copy from
- `akuity/kargo`, `argoproj/argo-rollouts`, `argoproj/argo-cd`
- `score-spec/score`, `humanitec/humanitec-score-*`
- `dagger/dagger`
- `signadot/*` (operator + examples), `UffizziCloud/uffizzi`
- `sigstore/cosign`, `slsa-framework/slsa-github-generator`
- `liquibase/liquibase`, `flyway/flyway` — for the unresolved schema-sequencing problem in §12

### Verdict
**Buy nothing new; assemble Score (intent) + Harness (execution) + Kargo (promotion) + Signadot (preview isolation).** The delivery broker is then genuinely thin: intent resolution, policy lookup, archetype selection. That is weeks of work, not quarters — and it is a credible MVP candidate for §20.

---

## E. Reliability, chaos, and AI SRE (Notes §10)

### Agentic solutions
- **AI SRE is now a real category with production deployments.** Three architectural camps worth understanding before choosing: *telemetry-based* correlation (Traversal, Datadog Bits AI), *graph-based* change traversal (Anyshift — answers "what changed?" as a query against a versioned infrastructure graph rather than inferring from telemetry), and *integration-based agentic* parallel hypothesis investigation (Resolve.ai, Cleric).
- **The honest state of play:** autonomous *investigation* is real and reliable in 2026; autonomous *remediation* — unattended high-impact production change — is still supervised almost everywhere. Plan for investigate-autonomously, remediate-under-approval.
- **Agent-designed chaos experiments** — the emerging pattern is: agent analyses the service dependency graph + historical incidents + current architecture, identifies untested failure modes, proposes *ranked experiment candidates*, human approves, and execution stays on established chaos tooling (FIS, Litmus, Chaos Mesh, Gremlin). The agent's contribution is hypothesis breadth across a system too large to hold in one head — not running the experiment. That is exactly the right division of labour for §10.

### Products to learn from
| Product | Why |
|---|---|
| Resolve.ai | Built by OpenTelemetry co-creators; parallel hypothesis investigation; targets ~80% autonomous resolution |
| Traversal | Causal RCA at scale, **on-premise deployment option** — rare in this category and material for a bank |
| Anyshift | Versioned infrastructure graph as the RCA substrate — closest to your §7 catalogue thesis applied to ops |
| Datadog Bits AI SRE / New Relic SRE Agent / Azure SRE Agent | The incumbent path if you're already deep in one stack (you're on Dynatrace — check their Davis AI agent roadmap on the same axes) |
| Harness Chaos Engineering | Already in your licensed platform |
| Steadybit / Gremlin | Experiment libraries and reliability scoring models worth copying conceptually |

**Caution flag:** independent research (LogicMonitor 2026 SRE Report) found resilience engineering widely valued but production chaos testing still uncommon, with low organisational tolerance for deliberate failure injection. Your §10 "conscious chaos" ambition is ahead of the market — plan the cultural side, not just the tooling.

### GitHub to copy from
- `agamm/awesome-ai-sre` — 100+ tools, the fastest way to scan the category
- `robusta-dev/holmesgpt` — open-source agentic investigation (the OSS answer to Cleric/Resolve)
- `k8sgpt-ai/k8sgpt` — CNCF sandbox; diagnosis-as-code with an operator model
- `chaos-mesh/chaos-mesh`, `litmuschaos/litmus`, `chaostoolkit/chaostoolkit` — experiment-as-code, version-controlled, CI-integrated
- `aws/aws-fault-injection-simulator` examples; `Netflix/chaosmonkey` (historical)

### Verdict
**Buy an AI SRE only after the reliability profiles exist.** These tools are only as good as the telemetry and topology you give them — the guides are explicit that teams with sparse logs and no tracing have a bad time. §10's profile-driven provisioning (which standardises Dynatrace instrumentation at deploy) is the *prerequisite*, not the follow-on. Build the chaos-experiment-proposer agent yourself against Harness Chaos + FIS; it's a skill, not a product.

---

## F. Testing: behaviour capture and replay (Notes §13)

This is where the offsite design most closely matches something you can adopt off the shelf.

### Agentic solutions
- **Keploy** (`keploy/keploy`, Apache 2.0) — eBPF kernel-level capture of HTTP, gRPC, database wire protocols, Redis and message-queue traffic in a single session, zero code change, sub-microsecond overhead; replays as deterministic tests with **auto-generated dependency mocks**. It explicitly handles non-deterministic fields (timestamps). Compare with proxy-based tools that only see HTTP and with VCR-style libraries that only hook language-specific HTTP clients. Claim: 10–50× faster than Testcontainers-based integration tests with no environment parity issues.
- **Tusk Drift** (`Use-Tusk/tusk-cli`) — record live API traffic, replay traces as tests, detect API drift in PRs automatically, with an AI setup agent. Cloud and local modes.
- **Speedscale** — Kubernetes-native capture via sidecars/service mesh; the differentiator is replay-as-load-test, so the load profile is your real traffic shape rather than a guessed curve. Relevant to the performance-testing ambition mentioned at the end of §14.
- **Playwright Test Agents (v1.56+)** — the Planner / Generator / Healer triad, driven through **Playwright MCP** using accessibility-tree snapshots, network traces and console diagnostics rather than screenshots or brittle selectors. `npx playwright init-agents --loop=claude` generates the agent definitions into your repo. **This is exactly the intent-based-locator self-healing capability being hand-built internally** — it now ships in the framework.
- **Agent teams for testing** — the pattern already in the wild: Functional, Security, Accessibility and Performance agents traversing the *same* user flow in parallel, sharing one browser context via MCP and logging to one trace. Same shape as §18's multi-lens code review.
- **Checksum** — generates Playwright/Cypress tests from real user sessions; the commercial version of the record-real-behaviour half of §13.

### Mocking / virtualisation (the "don't run downstream" half)
- **Microcks** (CNCF) — mocks *and* contract tests generated from OpenAPI/AsyncAPI/gRPC/GraphQL specs. Because it's spec-driven and the specs come from your event catalogue, this closes the §7↔§13 loop cleanly.
- **WireMock** (already in use), **Hoverfly**, **mountebank**, **Testcontainers**, **LocalStack**

### Synthetic & masked test data (§13's referential-integrity problem)
- **SDV** (`sdv-dev/SDV`) — multi-table synthesis that preserves referential integrity, which is the hard part
- **Tonic.ai**, **Gretel**, **Synthesized** — commercial masking/subsetting with cross-database consistency
- **`Greenmask`**, **`pgAnonymizer`** — open-source Postgres subset + anonymise

### GitHub to copy from
- `keploy/keploy` ← read the eBPF capture and mock-generation design first
- `Use-Tusk/tusk-cli`
- `microcks/microcks`
- `microsoft/playwright` (agents + MCP), `browserbase/stagehand`, `browser-use/browser-use`, `Skyvern-AI/skyvern`
- `sdv-dev/SDV`, `GreenmaskIO/greenmask`
- `tugkanboz/awesome-ai-testing` — curated index of the whole category

### Verdict
**Adopt Keploy for the API/dependency layer and Playwright Test Agents for the UI layer; keep the internal work for the parts neither covers** — namely the production *user-journey* capture in Connect/desktop apps, the ECI-consistent seed data, and the mesh-linked obfuscation. Those are genuinely differentiated. Rebuilding eBPF traffic capture and selector self-healing is not.

**Known limits still unsolved by any product:** stateful multi-step mutation with reset semantics, and T+1/T+2 batch cycle simulation. If you want a differentiated internal capability, that's where to spend it — and look at **Antithesis** (deterministic hypervisor-level simulation with time control) as the only credible commercial approach to the time-travel problem.

---

## G. SBOM-driven lifecycle management (Notes §14)

### Agentic solutions
- **Endor Labs AURI Agents** — the most complete articulation of your §14 design. *SCA Remediation* takes an open dependency vulnerability, uses reachability and upgrade-impact analysis to pick the safest fix, and opens a PR **with the evidence justifying the change in the PR body**. *AI SAST Triage* confirms true positives against the exact commit SHA, patches the confirmed, and routes the rest with a stated reason rather than a shrug. Plus exception workflows a developer can request from a PR comment and AppSec can approve into policy. Their **Agent Kit is open source** — agents defined as Markdown and YAML recipes, executing in your environment via `gh`/`glab`, no new runtime, no vendor model spend.
- **Moderne / OpenRewrite** — deterministic recipe application across the whole estate with impact preview and coordinated PRs. Moderne's published argument is that agentic coding alone can't close the remediation gap; the numbers they cite (average time-to-fix 252 days and rising, ~45% of enterprise vulnerabilities unpatched after a year, >59,000 CVEs expected in 2026) are the ones to put in front of your CTOs.
- **NVIDIA Agent Morpheus** — open framework for AI-accelerated CVE triage; reported ~9.3× speedup in CVE processing. Worth reading for the pipeline design.
- **Harness IaCM Remediation + Autofix agents** — already in your platform.
- **Renovate / Dependabot + Copilot autofix** — the baseline you already know fails on adoption, not capability.

### The confidence problem — what actually fixes it
Every credible vendor in this space now leads with *evidence*, not automation: reachability (is the vulnerable function actually called), upgrade impact (what else breaks), and verification (does the change pass). That is the same conclusion §14 reached from the other direction — the blocker is regression confidence, not the version bump. **The preview environment + Keploy replay from §D/§F is the missing evidence generator.** Chain them: SBOM finding → deterministic recipe or agent patch → preview environment → replay recorded production journeys → attach the pass/fail evidence to the PR.

### GitHub to copy from
- `endorlabs/agent-kit` — Markdown/YAML agent recipes; steal the packaging model for *all* your architecture skills, not just security
- `openrewrite/rewrite` + the CVE/Spring/Java migration recipe repos
- `nv-morpheus/Morpheus` (Agent Morpheus workflow)
- `CycloneDX/*`, `anchore/syft` + `anchore/grype` — SBOM generation and matching
- `renovatebot/renovate` — the config model for version-currency policy hierarchies
- `ossf/scorecard`

### Verdict
**Steal Endor's architecture, whether or not you buy Endor.** The reusable idea: pre-compute the expensive context (reachability, upgrade impact, affected consumers) into a structured artefact the agent consumes, instead of asking a model to infer it. They report 2.8× faster and 92% fewer tokens versus unaugmented agents — and in your estate the equivalent pre-computed context is SCG plus the event catalogue. That is a direct, concrete use for the Semantic Code Graph.

---

## H. Data products and agentic data governance (Notes §15–17)

### Agentic solutions
- **The catalogue has become the agent context layer.** Every major catalogue now exposes MCP so agents get governed context — glossary definitions, lineage, quality signals, certifications, access policies — before acting. The framing worth adopting internally: governance *by* agents and governance *of* agents are two different programmes and the strongest efforts run both.
- **Atlan** — MCP-native, Gartner MQ Leader 2026 for D&A Governance; the reference for "context-driven agentic data management".
- **Open source:** OpenMetadata (schema-first, formal open metadata standard, integrated DQ), DataHub (graph-based, event-driven metadata, 100+ connectors), Marmot (single Go binary on Postgres, native MCP — the low-footprint option).
- **The failure mode to quote:** agents fail without context layers because they lack the business definitions and governance signals experienced staff carry in their heads. That is §16's "AI-ready means metadata good enough for a machine to judge fitness for purpose", validated externally.

### Products to learn from
| Product | What to study |
|---|---|
| Atlan | MCP exposure of governed context; agent-facing entitlements |
| Collibra / Informatica CDGC | The regulated-enterprise governance surface you'll be compared against |
| dbt Semantic Layer / Cube | Metric definitions as governed, versioned artefacts — directly relevant to §16's 2027 standardised-metrics initiative |
| Confluent Stream Governance | Data contracts enforced at the stream, not just documented |

### GitHub to copy from
- `open-metadata/OpenMetadata`, `datahub-project/datahub`, `marmotdata/marmot`
- `bitol-io/open-data-contract-standard` (ODCS) and `open-data-product-standard` — the contract shape for §16
- `datacontract/datacontract-cli` — contract linting and enforcement in CI
- `OpenLineage/OpenLineage` + `MarquezProject/marquez` — the lineage backbone for §16's hop-elimination strategy
- `great-expectations/great_expectations`, `sodadata/soda-core` — DQ rules as code, attachable to the data product
- `edmcouncil/fibo` — the industry logical model to overlay, as discussed in §17

### Verdict
**Push the data contract into CI, agentically.** The highest-leverage thing available now is `datacontract-cli` + ODCS wired into the same pipeline step that registers the event catalogue — one CI stage that validates the event schema, the data contract and the SBOM, and quarantines on failure. That single stage is the physical embodiment of "the platform does it for you" across §7, §14 and §16 simultaneously.

---

## I. Multi-agent orchestration for engineering work (Notes §18)

### The three tiers (adopt this framing — it's the clearest in the field)
1. **In-session** — Claude Code subagents and Agent Teams. No extra tooling. Start here.
2. **Local fleet** — your machine spawns agents in isolated worktrees with dashboards, diff review and merge control. Best for 3–10 agents on known codebases. Tools: Conductor, Vibe Kanban, Gastown, Claude Squad, Cursor background agents.
3. **Cloud/async** — assign a task, close the laptop, come back to a PR. Claude Code web, GitHub Copilot coding agent, Codex web.

Most engineers in 2026 use all three: tier 1 interactive, tier 2 parallel sprints, tier 3 to drain the backlog overnight.

### Agentic solutions worth serious evaluation
- **Gastown + Beads** (`gastownhall/gastown`, `steveyegge/beads`) — v1.0 April 2026, v1.2.1 June 2026, ~16k stars, moved to the `gastownhall` org, hosted version from Kilo GA May 2026. Beads is now Dolt-backed (distributed graph issue tracker); Gastown adds Convoys (bundles of beads assigned to agents), worktree-based persistent storage that survives crashes, GUPP ("if there is work on your hook, you must run it"), and multi-harness support including Copilot CLI via lifecycle hooks. Honest assessment from the field: **chaotic, expert-oriented, "vibe coded" — not a polished enterprise product.**
- **Bernstein** (`bernstein.run`) — the one to look at hardest for a bank. A *deterministic* orchestrator for CLI coding agents with **no model in the coordination loop**, so parallel runs in per-task worktrees replay byte-identically; signed lineage plus an opt-in HMAC audit chain a reviewer can check offline; cluster mode and air-gap deployment. That is the regulated-environment answer to "we can't reproduce what the fleet did".
- **AgentFactory** (`LiteTrackerApp/agentfactory`, MIT) — "the open-source software factory": turns an issue backlog into shipped code through a development → QA → acceptance pipeline, with fleet overview, per-session cost tracking, and a Kanban of Backlog/Started/Finished/Failed/Stopped. The closest open equivalent to the Paperclip demo, and considerably more legible.
- **swarm-protocol** — headless coordination over MCP: claim work, detect file conflicts, heartbeat, hand off across sessions. Solves the coordination primitives without a UI.
- **wit** — locks individual *functions* rather than files using Tree-sitter, warning agents of conflicts before they write. The most elegant answer to §11's agent collision problem.
- **subtask** — a Claude Skill that runs tasks through subagents in git worktrees. Minimal, copyable.

### Products to learn from
| Product | Why |
|---|---|
| Harness Agent DLC + AgentTrace | Agents as first-class artefacts requiring CI/CD, evals, AIBOM and firewalls; AgentTrace exposes which tools an agent used and where a run went wrong. The governance model you'll be asked for. |
| Augment Cosmos | Hosted fleet management where OSS orchestrators hit limits |
| GitHub Copilot coding agent / Agentic Workflows | The path of least resistance if enterprise policy constrains you |

### GitHub to copy from
- `andyrewlee/awesome-agent-orchestrators` — the live index; check it before building anything here
- `gastownhall/gastown`, `steveyegge/beads`
- `LiteTrackerApp/agentfactory`
- `BloopAI/vibe-kanban` (Apache-2.0; **note: Bloop shut down April 2026, now community-maintained and fully local — cloud features removed**)
- `smtg-ai/claude-squad`, `stravu/crystal`
- `Dicklesworthstone/mcp-agent-mail` — the inter-agent mailbox pattern Niraja described

### Verdict
**Keep Paperclip as the internal demo, evaluate Bernstein for anything that needs an audit trail, and steal Beads' dependency graph without adopting Beads.** Jira stays the system of capture (correct call), but the *dependency-graph-of-work* model is what makes fleets coherent — implement it as a Jira-backed projection, not a parallel tracker. Before any of this scales, answer the cost/benefit question raised in §18 with an actual benchmark: which task classes parallelise profitably. Nobody in the market has published that; it would be a genuinely differentiated internal asset.

---

## J. Skills and marketplace governance — the §18 blocker, solved

This is the most immediately actionable section. The single-flattened-marketplace problem does not require nested marketplaces.

### The mechanism
- **`strictKnownMarketplaces`** in managed settings is the enterprise control: an empty array is lockdown, a list is an allowlist, and a `hostPattern` regex gives domain-level control (e.g. `^github\.jpmchase\.com$`). Pair it with **`extraKnownMarketplaces`** to auto-inject the corporate marketplace so engineers never have to discover or configure it. Without this, anyone can add an arbitrary internet marketplace and run unreviewed code with their local credentials.
- **Private plugin sources work** when the source is a github.com repo under the same owner as the marketplace repo (fetched via the Claude GitHub App) or on your GitHub Enterprise host with the org's GitHub Enterprise App installed. Otherwise, vendor the plugin folders into the marketplace repo via git subtree or a CI step and use relative paths.
- **URL-sourced marketplaces with auth** — a marketplace can be served from a URL with HTTP headers, or a `headersHelper` command that mints a short-lived token on request. That means your marketplace manifest can be **generated and served by an internal service**, not hand-maintained in a repo.
- **`strict: false`** on a marketplace entry lets the *marketplace operator* define which files in a plugin repo are exposed as skills, agents and hooks — i.e. central curation over decentralised authoring. This is the lever for letting teams author freely while the platform controls exposure.

### The two patterns to copy
1. **Registry-first generation** (`avivsinai/skills-marketplace`): `registry/plugins.json` is the only hand-edited file and is the source of truth for metadata, commit pins and sync policy; `.claude-plugin/marketplace.json` is *generated* from it, with plugins pinned to an exact commit SHA so installs are reproducible. Plugin source stays in child repos. **This is the answer to "seven repos flattened into one marketplace by hand".** Generate the flat manifest; keep the namespacing in the registry.
2. **Per-repo filtering, not per-marketplace splitting** (DataDog `system-tests` PR #6420): commit a `.claude/settings.json` into each repo that registers the marketplace, enables the org plugin bundle, and uses `permissions.deny` rules to block skills irrelevant to that repo — with a documented allow/deny table in the PR description. No manual setup for contributors; correct skill surface per codebase. **This solves the discoverability and context-cost concern raised in the room without needing nesting.**
3. **Optional:** LiteLLM AI Gateway can act as the marketplace registry endpoint, serving `/claude-code/marketplace.json` with admin-controlled enable/disable per plugin — a self-hosted governance UI you already have the components for if you run a gateway.

### Read first
- Anthropic's **Skills for enterprise** guide — governance, security review, evaluation, internal registry per skill, role-based bundles containing only the skills relevant to that role's daily workflow, skills in Git for history and PR review
- **Create and distribute a plugin marketplace** — the `strict` field, URL sources, `headersHelper`, version/digest semantics
- **Manage plugins for your organization** — org-level marketplace distribution, private source rules

### The security reality
There is no binary signing for plugins in 2026. Static analysis won't catch a plugin that calls an LLM to generate malicious commands at runtime. The defence is: marketplace allowlist + runtime hooks + human code review before entry into the marketplace. Structure it as two repos — a marketplace manifest repo with approval metadata, and separate plugin source repos — so approval lists can change without touching plugin internals, and ship the managed-settings policy via your existing MDM/config management.

### Verdict
**This is a two-week job and it unblocks everything else in §18.** Propose it back to central as a concrete design rather than a request for more marketplaces: registry-first generation, SHA-pinned plugins, per-repo deny rules, `strictKnownMarketplaces` lockdown, two-repo separation. It gives central the control they want and gives AWM orgs the namespacing they need.

---

## K. Shortlist — the ten to look at first

| # | Thing | Section | Why it's first |
|---|---|---|---|
| 1 | Harness Autonomous Worker Agents + AI Asset Catalog + MCP server | D, G, I | Already licensed; agents as governed pipeline steps with audit trails |
| 2 | `keploy/keploy` | F | The §13 replay substrate, Apache 2.0, eBPF, zero code change |
| 3 | EventCatalog Agents + Skills + MCP server + generators | C | Turns §7 from a demo into a self-maintaining, agent-queryable catalogue |
| 4 | Claude Code marketplace mechanics (`strictKnownMarketplaces`, registry-first generation, per-repo deny) | J | Unblocks §18 in weeks |
| 5 | `score-spec/score` + `akuity/kargo` | D | Deployment intent + promotion history without building either |
| 6 | `endorlabs/agent-kit` | G | The Markdown/YAML agent recipe packaging model, plus the evidence-in-the-PR pattern |
| 7 | `openrewrite/rewrite` + Moderne | B, G | Deterministic transformation as the enforcement layer under the agents |
| 8 | Playwright Test Agents + Playwright MCP | F | Planner/Generator/Healer and intent-based locators, in the framework |
| 9 | Signadot | D | Request-level preview isolation — kills the per-PR environment cost objection |
| 10 | `bernstein.run` (Bernstein) | I | Deterministic, replayable, signed-lineage agent orchestration for a regulated estate |

---

## L. Where the market has nothing for you

Worth knowing so you don't go looking:

- **Stateful multi-step replay with reset semantics** and **T+1/T+2 batch time simulation** (§13). Antithesis is the only serious attempt at the time-control problem. This is a legitimate build.
- **Business-fact vs system-behaviour event classification at scale** (§6). No product enforces this distinction; EventCatalog gives you the place to record it and the CI hook to check it, but the taxonomy and the ownership split are yours.
- **Cost-per-request risk scoring feeding pattern recommendations** (§4, §10). FinOps tools give you cost; IDPs give you scorecards; nothing joins unit economics to architecture pattern recommendation and LDA accountability. This is the most genuinely novel idea in the whole pack and the one most worth publishing internally.
- **A published benchmark of which engineering task classes parallelise profitably across agent teams** (§18). Everyone is guessing.
- **Reconciling functional domains with data domains** (§17). Organisational, not tooling.

---

## M. Reading list, in order

1. Moderne — *Agentic Coding Can't Close the Remediation Gap* (the determinism argument, with the industry numbers)
2. Anthropic — *Skills for enterprise* and *Create and distribute a plugin marketplace*
3. Keploy — record-replay architecture docs (eBPF vs proxy vs VCR)
4. EventCatalog — *Ask your architecture* (MCP server, Agents, Skills)
5. Addy Osmani — *The Code Agent Orchestra* (the three-tier framing)
6. Steve Yegge — *Welcome to Gas Town* (beads, convoys, GUPP — read for the model, not the tool)
7. Endor Labs — *Agentic AppSec and Agentic Remediation* (pre-computed context as the token/accuracy lever)
8. DORA — *State of AI-Assisted Software Development* (the seven capabilities that decide whether AI helps or amplifies dysfunction; note the finding that delivery instability still rises with AI adoption)
9. CNCF TAG App Delivery — Platforms White Paper
10. `andyrewlee/awesome-agent-orchestrators` and `agamm/awesome-ai-sre` — keep both bookmarked; the category turns over roughly quarterly
