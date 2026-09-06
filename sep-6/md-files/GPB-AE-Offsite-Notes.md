# GPB Architecture & Engineering Offsite — Structured Notes

**Source:** raw ASR transcript of the multi-day A&E / LDA offsite hosted by Rod Thomas (GPB CTO), with sessions from Pat (data), Eddie Hsu, John (testing/behaviour capture), and Niraja + Jordan (AI tooling).
**Purpose of this document:** turn the transcript into readable, section-by-section working notes that can be lifted directly into design docs, ADRs, and the platform implementation plan.

### How to read this
- The transcript is speech-to-text and heavily garbled. Where the intent is unambiguous I have restored the real term and flagged it in **Appendix B — Transcription corrections**. The most important one: **"Roman / Rowan event" = "domain event"** and **"flow mart / flow chart" = EventCatalog's FlowMart demo catalog**.
- Each section has: **Notes** (what was said), **Positions & decisions** (what was asserted as direction), **Open questions** (what was left unresolved), and **References & standards** (external anchors for the write-up).
- Slide numbers from the deck are preserved where they were called out, so this maps back to the ~280-page pack.

---

## Part I — Architecture as a Product

### 1. Framing: the value is in the product, not the primitive

**Notes**
- Model providers have moved past selling raw intelligence. They have worked out how to consumerise and monetise beyond tokens — Claude Code, Cowork, and the equivalents from OpenAI and Google. Microsoft is deliberately set aside as a different case (Copilot as a partnership/orchestration play rather than a first-party model play).
- The point: the value is not in the piece, it is in the **reduction of the knowledge required to use the piece**. A harness on top of an engine that removes months or years of engineering effort is what creates stickiness.
- Applied internally: A&E has no shortage of tools, vendors, or capabilities. What is lacking is **understanding of how to combine them**. Every org has pockets of just-enough understanding to meet local requirements, which caps what can be done at scale.
- Adoption of Anthropic inside the firm went from near-zero to pervasive in ~6 months. The tool of choice will change again; the platform must not be bet on a single vendor.

**Positions & decisions**
- This forum (the LDA table) is the only group with visibility across all orgs and is therefore the right body to decide which features, functions, and capabilities become platform.
- Shift the mental model from *"we enabled a dashboard for the user to…"* / *"we defined 7 stages for the developer to…"* (human at the front of every step) to a platform that runs the work.
- This is a **long-horizon vision**, not a delivery plan. Parts are feasible today; other parts depend on capability improvements that will arrive as accelerants.

**References & standards**
- Team Topologies — platform-as-product framing: https://teamtopologies.com/
- Thoughtworks / Evan Bottcher, "What I Talk About When I Talk About Platforms": https://martinfowler.com/articles/talk-about-platforms.html
- CNCF Platforms White Paper: https://tag-app-delivery.cncf.io/whitepapers/platforms/

---

### 2. From advisory function to consumable product

**Notes**
- Architecture today = documentation, review journeys, static published standards, Confluence pages, compliance reviews, PowerPoint walkthroughs. Some of this will always be needed for communication upward and outward — but it should not be **how the function operates**.
- The shift: from *device/advice we offer* → *a consumable product that creates the substrate the organisation runs on*.
- Critical distinction raised in the room and accepted: a **reference implementation is not a product**. Existing internal frameworks (auth, logging, firm principles) are capabilities with reference implementations, and their use is discretionary. Teams deploy them five versions behind and mis-use them, and it still "works". The interpretive layer is the failure.
- The Claude Code analogy: the model is available to be used however you want; the harness abstracts it away so the user states intent and the harness figures out how to leverage the engine.
- The consumer of this product is internal: ~4,500 developers who spend perhaps 20% of their time on business logic and 80% on toil, chasing CTC reports, product conversations, and handoffs.

**Positions & decisions**
- Architecture as a Product = productising the architecture function so it is embedded in the DNA and fabric of day-to-day engineering — omnipresent, guardrails included, guessing removed.
- Scope is deliberately the **outer loop** (post-build: release, deploy, environment, governance, cost), not inner-loop software development. That fight is for later (see §20).
- Rod's line to hold onto: **"Make the right way the easy way."**

**Open questions**
- Is the product for a *developer* or for a *product team*? Challenged in the room — the definitions of developer / product owner / engineer are converging, and the product may need to target the team, not the role.
- Relationship to the existing **Technology Domain Model (TDM)**: not intended to change org structure or domain ownership. The platform starts at the **point of convergence** where every domain ends up doing the same operational work.

**References & standards**
- Internal Developer Platform concepts: https://internaldeveloperplatform.org/
- Backstage (platform portal / software catalog): https://backstage.io/
- Spotify's "golden paths": https://engineering.atspotify.com/2020/08/how-we-use-golden-paths-to-solve-fragmentation-in-our-software-ecosystem/

---

### 3. Patterns as products

**Notes**
- Analogy used: SpaceX reusable rockets, and buildings going up faster than software gets written — both rest on **blueprints with repeatability**. Every org here has patterns; what is missing is the collective scale across the table. Two teams build the same pattern, both believe theirs is better, neither reuses.
- Deliberate wording: **pattern**, not *reusable component*. A pattern does not force one implementation. A pattern is a clearly defined, agreed approach that can have multiple instances / strategy variants (AWS strategy, GCP strategy, Gaia strategy for the same pattern).
- The pattern is less about the API-level implementation specifics and more about **how it runs**: is HA on by default, is resiliency built in, is fault tolerance built in, is it actually tested at that level.
- Catalogue model: teams select from a catalogue of patterns (event-driven, API, batch processing, stream ingestion). Legacy gets patterns too — including possibly supporting a deliberate "anti-pattern-as-pattern" for old estates, or forcing transformation to a target pattern.
- Cross-cutting concerns (e.g. OpenTelemetry) sit as **substrate** beneath all patterns, or as composable patterns that other patterns compose in.
- Aim for the **80%**, not the 1% edge case. Most applications write to a table and read it back out to an API, a message, or a UI. "We're not building rockets."
- Deviation is allowed but becomes an explicit exception conversation before build, not before production.

**Positions & decisions**
- The pattern is the product (slide ~139). Engineers select the proper pattern; the platform takes care of everything else.
- Governance is by code, not by document. Enforcement is automated, not policed by people.
- Prior attempts (a patterns working group ~2–3 years ago, led at one point out of a central team) failed. The stated reasons: document-centric, no teeth, and the technology wasn't there yet. Explicit acknowledgement: *"It's not entirely wrong, some things are just early."* Learn from it — do not repeat the meeting-driven, documentation-first approach.
- New approach: reverse-engineer existing systems with AI tooling to discover the patterns already in use, cluster them, and converge on the ones with the largest population / best adoption opportunity. Data-driven, not committee-driven.

**Open questions**
- **Prioritisation of which patterns to build first** — raised and explicitly deferred. Suggested starting point from the room: low-risk CRUD / Spring Boot-based apps, and the backlog of known CTC/credit-related remediations.
- How much variability actually needs supporting to cover 80%?

**References & standards**
- AWS Amplify as the cited external analogue of a patternised assembly: https://docs.amplify.aws/
- Terraform modules / Verified Modules pattern: https://developer.hashicorp.com/terraform/language/modules
- OpenTelemetry: https://opentelemetry.io/
- Backstage Software Templates (scaffolder): https://backstage.io/docs/features/software-templates/

---

### 4. Executable architecture and automated enforcement

**Notes**
- "Architecture as code" here means **executable architecture**, not just IaC. A pattern definition is fed in, codified, and auto-generates the constituent components — networking, VPCs, pipelines, security, observability — resulting in a running environment.
- Contrast with today: raising a request, answering the same set of questions, waiting weeks for an AWS account, with no visibility of where the request sits.
- Hierarchical policy: firm → AWM → CTO → LOB → team, with defaults set to known best practice and an override path where genuinely needed.
- Enforcement points named: pattern-constrained provisioning, build fails on non-compliance, deployment policy gates.
- The architect role shifts: from reviewing designs and chasing compliance evidence → to **building patterns, defining capabilities, encoding standards into the platform**. There is then no path to production that bypasses the standards.
- Abstraction goes all the way down: if the pattern is the contract, the underlying cloud (AWS / GCP / Azure / Gaia / Atlas) becomes an implementation detail. This is the actual fulfilment of the Terraform promise — describe in code, don't care where it runs.
- Cost/risk feedback loop: because the platform knows the infrastructure, it knows the cost. A platform costing $100k/month serving 150 requests/month produces a poor **risk score**, and the platform can then recommend cheaper patterns and hold the LDA accountable.
- Adoption lever discussed openly: *"You don't get a Claude Code licence unless you adopt."* And: the platform is the fast path to fixing an existing amber/red posture — **the illusion of choice**.

**Positions & decisions**
- Outcome-oriented, not documentation-oriented: the deliverable is a working, adopted platform.
- FinOps must be built in from the start; it cannot be retrofitted culturally. Cloud spend is up ~45% YoY without a corresponding increase in adoption — that is the cost-avoidance thesis that funds the whole programme.
- Named cost trap to educate on: decommissioning a private-cloud (Gaia) SEAL without telling the charge-back team means you keep paying the forecast for years while also paying for public cloud.

**References & standards**
- Policy as code: Open Policy Agent / Rego — https://www.openpolicyagent.org/ ; Conftest — https://www.conftest.dev/
- HashiCorp Sentinel: https://developer.hashicorp.com/sentinel
- FinOps Foundation framework: https://www.finops.org/framework/
- Crossplane (control-plane provisioning): https://www.crossplane.io/
- Score (workload specification): https://score.dev/

---

## Part II — Event-Driven Interoperability

### 5. Workflow masquerading: why orchestration doesn't scale

**Notes**
- Today's systems are built with tight coupling: CRM → order management → system D → system B, with dependency sequencing, retries, callbacks, loops, codified inside a workflow that is often maintained by Operations.
- Many defined workflows never cross the application boundary — no handoff to another person or team — so they create operational maintenance overhead for no interoperability benefit.
- Consequence: nobody can say what the system's actual state is, and the advisor cannot tell the client where their request sits. Name change example: client submits, forms go out unpopulated, documents already provided are re-requested, work sits in queues, advisor and client both blind.
- On the client-onboarding and client-information teams, the pivot has been away from orchestration toward **choreography** — observing behaviours rather than prescribing "it must be this next step".
- Business driver: advisors are being asked to go from ~16 clients to a much larger book. They cannot hold both the business events and the personal context (client's daughter's birthday, graduation) for that many relationships. Today only the case-management system captures a partial view, and only for service requests.
- Claimed outcome from the choreography model: account opening moved from multiple weeks (domestic) / ~11 weeks (international, already best-in-market) to **~7 minutes**.

**Positions & decisions**
- Move from rigid, point-to-point, dependency-chained integration to loosely coupled event-driven interoperability. System A does its job and announces it; interested parties filter and react. The onus moves from the invoker to the subscriber.
- Parallelism is the scale argument: many consumers process the same event concurrently; a new business process can join with no coordination with the producer.
- A2A (agent-to-agent) is explicitly **not** the same thing: A2A is a rigid contract in a dependency chain, effectively a workflow. Use it only where the dependency genuinely fits; prefer events. Specs will churn — the platform, not 4,000 developers, should absorb spec changes.
- Cultural/education need acknowledged: developers default to a service + database + synchronous call. Teaching what an event is, what a domain event is, what a system event is, is a real workstream.

**References & standards**
- Choreography vs orchestration (Microservices patterns, Chris Richardson): https://microservices.io/patterns/data/saga.html
- Martin Fowler, "What do you mean by Event-Driven?": https://martinfowler.com/articles/201701-event-driven.html
- A2A protocol: https://a2a-protocol.org/

---

### 6. Domain events vs system (canonical) events

> This is the single most important conceptual section in the pack. In the transcript "domain event" is consistently mis-rendered as "Roman event" / "Rowan event".

**Notes**
- **Domain event = a business fact.** Source of truth, endures over time, past tense. Systems change; the fact that on this date this client changed their name does not. Example facts: party created, entity joined a plan, affiliations established, trade ordered and executed.
- **Canonical / system-behaviour event = system mechanics.** "My system synchronised with profile", "requested a screen", "propagated a profile change", "allocation completed", "step 7 of 12 done". Indicative of how systems operate; usually irrelevant to the business or the client.
- Ownership split: **business facts are owned by product owners and defined with Data**; system behaviour events are owned by technical architects and created freely by engineering. Anything not defined by the data owners defaults to a system behaviour event.
- Domain events are modelled on **parties** (client, prospect, lead, entity) to build a relationship graph and accumulate knowledge over time — replacing today's "query every domain system individually" pattern (ask KYC when KYC completed, ask the mortgage system when the last request was, etc.).
- A system behaviour can *trigger* a domain event: all the order-processing steps are system behaviours; "trade ordered on this date, executed on that date" is the business fact published at the end.
- Ambient agents will subscribe to **both** — an agent may care about "allocation finished" (a system behaviour) with no interest in the rest of the journey.
- Warning discussed: the boundary erodes. Teams start calling "the batch is done" a business fact. It isn't — that's a component of how you wrote it.
- Payload discipline: the inherited Meridian event carries ~700 attributes. That is data dumping labelled as an event. Correct model = metadata envelope + business payload; if you need the full object, take the identifier and query the owning domain (API / GraphQL through the service mesh), so entitlement policy is enforced at the front door.
- Naming discipline: Meridian has ~350 bespoke event names because variability is encoded in the **name** (`PartyCreated.CWM…`). Every new variant forces a new subscription in every consumer. Correct model: `PartyCreated` is the event; line of business, region, and other variables are **attributes you filter on**. Same rule applies to global vs LOB flavours — no `GPB.PartyCreated` vs `USPB.PartyCreated`; one event, conditional payloads where genuinely needed.

**Positions & decisions**
- Federated by default. There is **no single central bus** as an architectural requirement — but there will be a **pattern** for the event bus, and aggregation for consumption is a separate concern from transport.
- Bus choice (Kafka/MSK vs EventBridge) becomes a pattern default, with EventBridge preferred for filtering capability and managed infrastructure unless there is a reason. "You never even know it's running."
- The **outbox pattern** is built into the pattern out of the box: persist the fact in the domain database in the same transaction, then publish — no publishing of events for transactions that failed.
- Event definitions are part of the code, validated and versioned through CI, and registered against firm standards. Prefer **skills over standardised libraries/SDKs** to enforce this — an explicit anti-SDK position.
- Adhere to published event naming/schema standards (CloudEvents-class specs) as the standard contract.
- Anti-corruption layer used as the migration mechanism (see §8).

**Open questions**
- Where exactly the line sits for external consumers — should external/partner systems only ever consume business events? (Leaning yes.)
- How to handle the transitional estate where point-to-point synchronous mutation genuinely requires a response.

**References & standards**
- CloudEvents specification (CNCF): https://cloudevents.io/
- AsyncAPI: https://www.asyncapi.com/
- Transactional Outbox pattern: https://microservices.io/patterns/data/transactional-outbox.html
- Domain events / DDD: Eric Evans DDD, and https://martinfowler.com/eaaDev/DomainEvent.html
- Event Storming (for the fact-discovery workshops this implies): https://www.eventstorming.com/
- Schema Registry / compatibility modes: https://docs.confluent.io/platform/current/schema-registry/fundamentals/index.html

---

### 7. The event catalogue — a business lens on architecture

**Notes**
- Demo shown (slide ~153) was **EventCatalog** using its **FlowMart** sample catalog. Open source, markdown/MDX-backed, versioned, overridable, with a Backstage plugin.
- What it shows, per domain (e.g. Payments): overview and metadata, services offered, the **ubiquitous domain language / domain model as business definitions**, entities and value types, data products published to the mesh, and the events with their producers, subscribers, channel/bus, and delivery semantics (e.g. "this Kafka channel is not exactly-once").
- Environment-aware: dev / test / prod views, each showing the version of the schema actually running there.
- Journey view: "walk me through the renewal flow" traverses placed order → order initiated → … so journey and behaviour questions stop requiring an architect in the room. "PowerPoints become outdated; this is a real-time view of the system as built."
- Positioning against the internal **AI3 / Architecture Workbench**: not a tool bake-off. AI3 is rich and appropriate for architecture/AM users, but too complex for product owners and business stakeholders. The catalogue is the simplified, domain-only, business-facing lens; AI3 is the deeper code/SEAL/repo layer. The AI3 team's response was that they already model business/functional/data domains as the metamodel and that switching between the simple view and the code-level view is a straightforward extension.
- Regulatory value called out explicitly: the ability to stand in front of the OCC / SEC / ECB and explain what we do, why, and how, at every level of granularity — with the controls implemented at business-domain level and at pattern level visible in the same place. Tie-in to conversations with the controls organisation.
- **This is also the agent interface.** The catalogue is a queryable registry of behaviour across every registered domain, so an agent can discover tools, interfaces, and eventing mechanisms without a separate service registry.

**Positions & decisions**
- Registration is a **platform capability, not a team chore**. Metadata is captured incrementally, one repo at a time, through the CI/CD pipeline: infer at build, publish at deploy, register into a central context. Asynchronous, non-blocking, always current, self-registering.
- **Carrot and stick:** you only get the capability if you are on the platform, and you get the catalogue automatically once you are. If you fail the standards, you deploy but you are **quarantined** out of the catalogue, the LDA is notified in Teams, and the risk score reflects it. Not officially in the ecosystem.
- Discoverability must serve **both humans and agents**.

**Open questions**
- Build-time capture vs runtime "phone home" — the demo relies on deployed instances registering at runtime; how much is inferred from code at build vs reported at runtime needs settling.
- Canary deployments with two schemas live simultaneously — flagged as a good edge case, deferred (and noted that divergent DB configuration is the bigger problem there).
- Whether events should also be treated as a data asset registered in the data catalogue (Dex/DAX) — "concept over implementation, as long as the interfaces interoperate".

**References & standards**
- EventCatalog: https://www.eventcatalog.dev/ · GitHub: https://github.com/event-catalog/eventcatalog
- EventCatalog Backstage plugin: https://github.com/event-catalog/backstage-plugin-eventcatalog
- FlowMart demo catalog: https://github.com/event-catalog/flowmart-schema-registry
- Backstage Software Catalog + descriptor format: https://backstage.io/docs/features/software-catalog/descriptor-format
- CNCF TAG App Delivery on catalogues/discoverability: https://tag-app-delivery.cncf.io/

---

### 8. Anti-corruption layer and the Meridian strangler

**Notes**
- Meridian is a single system holding every domain type — party, relationships, coverage — in one ball. The target is to separate it into finer sub-domains aligned to the client-information domain.
- Mechanism: Meridian continues running in production and publishing its events. Those events cross the wire into an **anti-corruption layer** which filters, maps, and transforms them into the new sub-domain types, then publishes through the same service interface into the new model.
- This lets the new world be built against the **behaviours** it needs, with zero awareness of the legacy model, while running in parallel and verifying that new behaves the same as old. Over time resourcing shifts, the ACL goes away, and the old system goes away.
- Noted in the room: this matches an earlier original design document for the same system — worth comparing notes.
- Caveat raised: system-to-system comparison ignores heavy downstream operational processes. The approach is right as a starting point, but the model must be stress-tested by consumption (e.g. re-engineering KYC, IPB regulatory reports) rather than assumed.
- Reframing offered by Pat: this is an ecosystem seeking **homeostasis** — actors (agents, clients, regulators, CARDS 2.0 as the regulatory reporting platform) stress the ecosystem, and the event catalogue and publishing model adjust to meet the demand. A regulatory change should trigger "your event catalogue is no longer sufficient for my need", with a human in the loop at that point.

**Positions & decisions**
- The important pattern is the **domain + domain event** model; the ACL is contingent on what you're migrating and is illustrative rather than mandated.
- No expectation of SEAL/deployment model changes from this ("deploy however you want") — though SEAL-level lineage of producers/consumers is seen as a valuable by-product for AI3.

**References & standards**
- Anti-corruption layer: https://learn.microsoft.com/azure/architecture/patterns/anti-corruption-layer
- Strangler Fig: https://martinfowler.com/bliki/StranglerFigApplication.html
- Parallel Run: https://martinfowler.com/bliki/ParallelChange.html

---

## Part III — Cloud, Environments, and Reliability

### 9. Composable environments (slides ~160–166)

**Notes**
- Today: bespoke, hand-crafted environments everywhere. Every team interprets the general "if you go to public cloud you must…" standards differently, with variation even inside a single CTO tower — different tooling, different compute choices, different database choices. Everyone becomes an accidental infrastructure engineer.
- Precedent within AWM: alignment on an IaC module/pattern library that turned Terraform modules into controlled, reusable services — described as having delivered real benefit.
- The proposal is a level up: **environment as a composition of four codified profiles**
  1. **Application pattern** (what you're running)
  2. **Environment profile** (where — AWS today, GCP tomorrow, Atlas 1 today, Atlas 2 tomorrow)
  3. **Resilience profile** (codified from business need, not chosen ad hoc)
  4. **Deployment / rollout strategy** (inclusive of rollback)
- Deployment strategy is deliberately separated from resilience profile: canary at 10%→100% is a release concern; multi-instance failover is a resilience concern. Challenged in the room (application criticality drives both) and left as "possibly related, deliberately modelled separately".
- The deployment-window debate: most teams deploy on weekends or after hours because of confidence, not capability. Blue/green and canary largely aren't used in-place. Positions taken: developers should not be doing 15-hour weekend shifts and "eyes on glass like it's 1999"; agents generating code at pace cannot be made to wait until Saturday; deploy during the day when everyone is already there. Counter-point acknowledged: infrastructure/EKS upgrades are the genuinely hard weekend toil, and JPMC's setup makes in-place vs blue/green a real constraint (teams choose ECS over EKS specifically to avoid blue/green upgrades).
- Immutable infrastructure is not practised: "we definitely don't treat our infrastructure as cattle". Target is create-new / route / destroy-old, including for infra upgrades.
- Terraform instability and ticket-driven remediation was named as the real elephant — worth taking on as a problem in its own right.
- Also floated: an internal-only **CDN** so UI-facing, mostly-static apps stop running on always-on compute containers.

**Positions & decisions**
- Standardise the inputs, keep variability in the configuration, make the outcomes consistent and the environments identical by construction.
- "Designing for the cloud you actually want" — invisible infrastructure, not just a nicer developer experience.

**Open questions**
- Success metrics — DORA metrics (deployment frequency, change failure rate, MTTR, lead time) were proposed as the baseline; Rod's stated success measure was different and softer: developers get their weekends back, releases trigger from policy rather than eyes-on-glass, and the idea→production journey has less bureaucracy. **Both should be captured.**
- Who owns infra when it's abstracted — developers or SREs? Direction: neither carries the cognitive load; the platform holds the knowledge and the SRE focus moves to mitigation and reliability-by-design.

**References & standards**
- DORA / DevOps Research metrics: https://dora.dev/
- Immutable infrastructure & cattle-not-pets: https://martinfowler.com/bliki/ImmutableServer.html
- Argo Rollouts (progressive delivery): https://argo-rollouts.readthedocs.io/
- Crossplane / Terraform module registry patterns (as above)

---

### 10. Reliability by design and conscious chaos (slides ~198–205, 246)

**Notes**
- Problem statement: reliability is decided **too late and too locally** — one team makes a choice without understanding the ecosystem effect. Determining failover behaviour for a managed service is a manual research exercise every time.
- Proposed tiering, declared rather than designed:

| Tier | Topology | RTO/RPO | Cost | Failure behaviour |
|---|---|---|---|---|
| 1 — Standard | Single region, multi-AZ | Moderate to low | Moderate to low | AZ failover only; regional loss accepted |
| 2 — Enhanced | Multi-region, active/passive | Near-zero | Manageable | Regional failover with transition back |
| 3 — Critical | Multi-region, active/active | Near-zero | High | Active/active, high availability |
| 4 — Mission critical | Multi-region, self-healing | Zero downtime intent | Highest | Self-healing, multi-site active/active, geo-resilient |

- A distinct pattern was called out for **regionally localised** applications (e.g. Connect runs in every major region, EMEA down means EMEA is down, no cross-region traffic) — multi-AZ within region, no cross-region failover. Limited but real.
- Choosing a profile encodes: topology/region, traffic routing, failover logic, data replication, health checks. The platform then provisions multi-region compute, Route 53 + ALB traffic management, failover configuration, DB failover, and so on.
- Cost feedback is inseparable from this: observability (Dynatrace) is instrumented at deploy, so unit cost per request becomes visible. The $100k/month platform serving ~1,000 requests over 30 days gets a poor risk rating, and the platform recommends alternatives (e.g. spot/reserved, scale to zero, serverless) with a generated migration plan the LDA can act on.
- **Chaos engineering** becomes a first-class platform primitive rather than an annual fire-drill: latency injection, killing services, network drops, AZ/region failures, throttling — injected at every component level, continuously, unannounced.
- What is actually being tested is as much the **human response** as the system: do the alerts fire, does the team converge, are the comms channels right, does failover actually complete. The named pain: when something breaks, whose job is it to tell the business? Today the answer is unclear, and a generic firm-wide email doesn't land — business partners only react to named senders.
- Positive note from the room: AWS **FIS** is already wired into at least one pipeline with multiple experiments, including a production run (on a Saturday). Also noted: resilience and reliability were previously split into technical and business teams and have now converged.

**Positions & decisions**
- If resilience is optional it will be inconsistent. Resilience embedded = default. Declared ≠ optional: incomplete or inaccurate profiles block provisioning and block the CD stage.
- Reliability is not separate from patterns — it is a **description of the composition** (application pattern + environment profile + resilience profile + deployment strategy).
- Chaos must become a shared quad view: technology, operations, product, business continuity/risk. Because it's a risk issue, everyone is accountable.
- Self-funding logic: ephemeral, on-demand non-prod pays for higher production resilience.

**References & standards**
- AWS Fault Injection Service: https://aws.amazon.com/fis/
- Principles of Chaos Engineering: https://principlesofchaos.org/
- Chaos Mesh / LitmusChaos (CNCF): https://chaos-mesh.org/ · https://litmuschaos.io/
- AWS Well-Architected Reliability Pillar: https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html
- Google SRE Book (error budgets, incident response): https://sre.google/books/

---

## Part IV — Delivery, Testing, and Lifecycle

### 11. Branching, build-once, immutable artefacts (slides ~171 onward)

**Notes**
- The observed pattern challenged: merge to a release branch triggers a **new build**, so the artefact deployed to production is not the artefact tested in lower environments. Contested in the room — some pipelines do enforce a lower-environment deployment, a new control point is being built to block direct-to-prod, and monthly checks categorise questionable deployments. The refined statement everyone converged on: **the build may traverse the environments, but no one re-tests the release-branch build** — teams upload prior evidence, so the evidence is not tied to an execution of automated tests against that artefact.
- Deeper challenge raised: why is there a release branch at all? Why not trunk-based development? Counter: release branches isolate release code — a 25-year-old practice that has been outgrown. Hotfixes can branch from the last release or from a tag; the real problem is that Git itself is not well understood (moving pointers, tags, worktrees).
- Semantic versioning is nominally in place but meaningless in practice — versions are shipped with no semantic intent.
- Root cause fix: **build once, promote many.** Every CI run is a potential release candidate. Move dev → test → prod without rebuilding. Tag at release. Immutable artefacts with evidence that cannot be disputed — "almost like a blockchain".
- Agent-era implication: if AI agents and humans both work feature branches, collisions are guaranteed. Use **git worktrees** as per-agent isolation (a folder per branch) rather than five agents in one branch. This must be managed on the developer's behalf so complexity doesn't surface.
- A striking aside worth keeping: **git history is context.** It is the best context reference an agent has, and nobody talks about it. The "what happened in the last five days while I was away" skill is exactly this, applied at scale.
- Artifactory segmentation: develop branch → sandbox artifactory; release/master → release artifactory. This is part of why develop and release branches are separated, and it conflates CI and CD. Fix the tooling rather than the branch model — we own Harness and can make it do what we want.
- Testing is named as the real bottleneck once coding is accelerated: not enough automated testing, and "evidence of testing" is often manual.

**Positions & decisions**
- Separate CI from CD. A CI-only pipeline that produces a promotable artefact is missing today.
- Branch strategy should not be a per-team choice for ~80% of the organisation. The 20% who know what they're doing get freedom.
- Developers should not have to know the branching strategy at all — the workspace is created for them; this table knows the strategy, nobody else needs to.
- Templatised pipelines, not per-app pipeline instances created in a UI. One Java pipeline template with the rules codified; teams trigger it with data, not by cloning it.

**References & standards**
- Trunk-based development: https://trunkbaseddevelopment.com/
- Build once, deploy many / Continuous Delivery (Humble & Farley): https://continuousdelivery.com/
- SemVer: https://semver.org/
- Git worktrees: https://git-scm.com/docs/git-worktree
- SLSA (artefact provenance / immutability + attestation): https://slsa.dev/
- Sigstore / in-toto attestations: https://www.sigstore.dev/ · https://in-toto.io/

---

### 12. The delivery broker and the platform CLI (slides ~176–180, 184)

**Notes**
- Split the model into **experience** and **execution**. Harness is the execution engine behind the scenes and nobody needs to know it exists. The experience layer owns intent interpretation, policy enforcement, and pipeline mapping.
- Consumers of the experience layer are developers **and agents**. The Versel/Netlify analogy: an agent doesn't need to be told how to deploy.
- **CLI over MCP** was an explicit preference — a CLI becomes a tool that is leverageable in an IDE, in a sandbox container, and by humans and agents alike; MCP would restrict it to an agent contract. (Note: this aligns with the SCG/ELAERA constraint of bash/Python wrappers inside Skills.)
- Developer declares intent in configuration (services in this repo, deployment strategy, target environment, per-environment overrides) and then runs something as simple as `platform deploy dev`. A **delivery broker** in the middle resolves everything else.
- Broker responsibilities: resolve developer/team intent, load application metadata, select pipeline archetype, bind execution, report status. It also owns ALB/URL creation, blue-green/canary setup, and first-time configuration — the parts that today require a conversation with a named person.
- Metadata catalogue behind the broker holds: app class, runtime, environment model, rollout policy, compliance profile. Policy is hierarchical (firm / AWM / GPB / LOB / team) so what's permitted differs by level with defined override.
- Skill/agent inference: nothing prevents a skill from assessing the repo (AI3-style) and generating the intent configuration for you, with human override retained.
- Alignment noted with an external design introducing **deployment intent** and **deployment scope** — worth comparing and possibly adopting terminology.

**Positions & decisions**
- **Preview environments per feature/PR.** PR accepted → build that branch → deploy into an isolated preview → business user or product partner clicks and validates working software → accept or feed back → environment destroyed. If untouched, it expires after ~12 hours.
- **Candidate-cut policy** replaces "build on every merge", because an army of agents merging continuously makes per-merge builds wasteful (two million merge events is a lot of wasted compute). Options: time-based cuts, threshold-based (e.g. >50% of an epic's stories complete), full-epic completion, environment-readiness-based, or explicit request. The platform decides when to materialise because it has the context.
- The hierarchy to hold: feature branch → preview (validate in isolation) → merge (safe integration into trunk) → eligible change ledger → release set → candidate artefact (immutable) → promotion record → progression history. **Teams express intent; the platform owns the mechanics.**
- Governance is a function of policy definition: a risk-scored app might get a one-time exception with notification and then no more releases until remediated.

**Open questions**
- Upstream/downstream dependencies for preview environments → mocking (see §13), explicitly flagged as a bigger problem.
- Cost of an environment per PR — acknowledged; mitigated by short TTL and destroy-on-idle.
- Database/schema changes must be sequenced atomically with app deployment (Liquibase-style, admin-privilege model). Recognised as codifiable into the pattern with pipeline dependencies, but not solved.

**References & standards**
- Backstage / IDP + Harness IDP (Backstage-based, already licensed): https://developer.harness.io/docs/internal-developer-portal/
- Score workload spec (intent-based deployment): https://score.dev/
- Ephemeral/preview environments: https://vercel.com/docs/deployments/preview-deployments (as the reference experience)
- Liquibase / Flyway for schema change sequencing: https://www.liquibase.org/ · https://flywaydb.org/

---

### 13. Testing: behaviour as the asset (slides ~261–268)

**Notes**
- Cost framing: **non-prod costs more than production** across GPB. The firm tolerates paying more for prod because of the value proposition; that logic doesn't hold for non-prod. Dev environments are spun up and left forever; branches and environments are never cleaned up; always-on is inherited habit.
- The real driver of always-on non-prod is **dependency-driven environments** — your system must be up because ten other systems need it to test, so everything stays up 24/7. Contested (follow-the-sun usage across UK/US/India) but the counter-observation stands: dev environments are more idle than used.
- The proposed model, in phases:
  1. **Record real behaviour.** Capture production user interactions — clicks, accessibility tree, form elements, assertions/waits, and the data involved — plus the API request/response traffic.
  2. **Transform into reusable test artefacts.** Generate scripts (Playwright for web, desktop automation for thick clients) from a JSON representation of each step. Use **intent-based locators** rather than CSS selectors so the scripts self-heal when a button changes from "Submit" to "Enter".
  3. **Replay as a platform substrate.** On any deployment into a provisioned environment, replay the captured journeys — with downstream dependencies **proxied/simulated** rather than running.
  4. **Synthesise data.** Obfuscate production data into lower environments while preserving referential integrity across domains via the linkage/join graph on the data mesh.
- Implementation detail shared: WireMock deployed as a service in the CI/CD pipeline captures request/response traffic, writes Parquet, and that is used to derive an **API spec**; the spec is then matched against the data mesh metadata to find which elements exist as authoritative data and which must be synthesised. The Parquet is only used to build the spec, not to serve data at test time — the test data platform serves it. Interception is either byte-code injection at build or a sidecar proxy that routes based on a flag (sidecar preferred, since we don't own the code).
- Faker and SDV-class synthetic generators are both in use; the hard part is **referential integrity**, plus "seed data" that must pre-exist (e.g. valid ECIs when creating a mandate).
- Coverage insight offered: production behaviour tells you where the hotspots are and which paths are actually travelled. If only 40% of what you built is used, exhaustive coverage of the rest is wasted effort — cover the core the business depends on and evolve.
- Concrete corroboration from the room: a GSTP/USDP team is already building exactly this in Harness for their rebalancer component — every parameter of every production run is logged and replayed. Key insight: **choose components strategically.** Don't try to record UI clicks for the whole system (brittle); do it for the core calculation component of a well-componentised app.
- Second use case, arguably bigger than testing: **training and operational uplift.** Capture how the best operations user does a workflow, then show everyone else "the best person does this in five fewer steps", then eventually do it for them. Before we make everything an agent, we make a person an agent.

**Positions & decisions**
- You are testing **the system you control**. Downstream databases and behaviour are a black box you consume through a contract; contract-based verification plus mocking replaces full integration environments for the 80%.
- The platform can still stand up the real dependency chain on demand when the replay substrate is turned off — that's a configuration flag, not a request to another team. Turning it off affects your risk score and your accountability.
- Once deployed with no traffic on it, a fully integrated instance exists, so full end-to-end integration testing by replay is still available.

**Open questions / known limits**
- **State mutation.** Multi-step flows that mutate state and depend on prior mutations need a resettable, test-scoped state machine in the mock, plus a hash/versioned snapshot per instance so a test can be reset and rerun. Called out as unsolved from prior GPB work.
- **Overnight / T+1 / T+2 batch cycles.** Trading and settlement flows need the batch to play out; simulating elapsed time and accelerating date changes was suggested but not proven. These are the 20% that turn the substrate off.
- **Volume/performance** in containerised local mocks.
- Should the developer be able to run this fully locally (LocalStack + Docker + mocks)? Attempted; LocalStack lacks support for the required services. Atlas Workspace was floated as a possible answer.
- Testing pyramid / unit-test standards were raised and deferred as inner-loop scope.

**References & standards**
- Consumer-driven contract testing: Pact — https://pact.io/ ; Spring Cloud Contract — https://spring.io/projects/spring-cloud-contract
- WireMock: https://wiremock.org/ · Hoverfly: https://hoverfly.io/ · Karate: https://karatelabs.github.io/karate/
- Playwright: https://playwright.dev/
- Synthetic Data Vault (SDV): https://sdv.dev/ · Faker: https://faker.readthedocs.io/
- Testcontainers (for the Dockerised dependency idea): https://testcontainers.com/
- LocalStack: https://www.localstack.cloud/

---

### 14. SBOM-driven lifecycle management (slides ~275–278)

**Notes**
- Today's loop: scanners run (Snyk, Sonar, SAST), SBOMs are generated at scale, dependency trees and version drift are known — and **nothing is automated from it**. Findings become a manual triage queue, then a backlog that never shrinks. Log4Shell over Christmas is the canonical memory.
- The tooling that exists is human-initiated: FARM breaks are created, then a human triggers the remediation assistant. Feedback given: the assistant should **review the breaks and work through them itself**, escalating only exceptions.
- The bigger prize is not CVEs, it is **version currency**. If policy is "no more than N versions behind" and the platform keeps you current, most vulnerabilities disappear as a by-product. Fixing a CVE on a version you should not be running is wasted effort.
- Policy engine inputs: CVE severity threshold, compliance state, version currency (current minus two), with a hierarchical override model.
- SBOM risk ratings and firm risk ratings do not yet align — an active workstream with the corporate team; a managed-API offering gives an equivalent supported/end-of-life/recommended rating in the meantime, and the two can be swapped once the ratings align.
- **Why teams don't do it** — the most valuable part of this session was the honest diagnosis:
  - It isn't the version bump. It's the compile break, the removed method, the runtime failure discovered late.
  - It's the **regression testing burden** and the lack of automation — i.e. a confidence problem, not a prioritisation problem.
  - Product pressure: features vs no-joy work, every sprint.
  - Automated PR bots already exist and the PRs "wither and die" because nobody picks them up.
  - Prior autonomous attempt failed on confidence: the tool did 90%, the human did 10%, and the human credited themselves with all of it.
  - Counterpoint that lands: teams already carry a ~20–25% budget haircut for maintenance, and the list still isn't getting shorter.
- What works, evidenced by one team in the room with a single-digit FARM break count: **break the build in front of the developer, at development time.** A central registry of allowed versions; unknown or prohibited versions won't start locally, won't build, won't do anything. Breaking late means the person who introduced the problem never sees it.

**Positions & decisions**
- SBOM is the trigger, not the report. Detection → policy → **automated action** → exceptions only to the human backlog.
- Prioritise version currency uplift first, then residual CVEs.
- Confidence is bought with the **preview environment + replay testing** from §12–13: launch the environment, replay the journeys, observe, evidence it. That evidence has never existed before.
- Incentive alignment: unaccepted merges after the platform has done the work drive the risk score down, and that feeds year-end accountability. Also floated: shift-left to a PR blocker / mandatory PR-review gate, and a shared `create-PR` skill with hooks covering the 80% (XSS, SQL injection, secrets in code) across AWM.

**References & standards**
- CycloneDX: https://cyclonedx.org/ · SPDX: https://spdx.dev/
- OpenSSF Scorecard: https://securityscorecards.dev/ · OpenSSF best practices: https://openssf.org/
- Dependabot / Renovate as the reference automation: https://docs.renovatebot.com/
- OpenRewrite (automated framework/version migration recipes): https://docs.openrewrite.org/
- EPSS + KEV for CVE prioritisation: https://www.first.org/epss/ · https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- NIST SSDF (SP 800-218): https://csrc.nist.gov/Projects/ssdf

---

## Part V — Data Strategy (Pat's session)

### 15. Operating model and data ownership

**Notes**
- Starting diagnosis: no mechanism to manage dependencies, no alerting when a data product landed, and a data strategy that was "a series of point events" rather than a cohesive whole. Positives: the culture had already shifted (nobody asks "why are we doing this?"), and there was no shortage of capability (Starburst, Snowflake, Databricks).
- The structural fix: align data management to the **product structure** (~55–68 products organised into 5 service verticals), and embed data into the org so the **triad becomes a quad** — technology, data, operations, product. That gives an operating model with escalation paths and real teeth.
- First vertical stood up on the acquisition/onboarding lifecycle with a data executive hired in February; benefits already visible in SME coverage and in complete cohesion between the tech and data teams. Explicitly *not* building a CDO organisation for its own sake — the closer the integration, the more the lines disappear.
- **Data owner** = someone who knows their data, makes it consumable, and manages data quality — from preventative controls at digitisation (are we duplicating ECIs? are we assigning them at all?) through detective controls to use-case-level accountability.
- **Validated reliance**: you cannot say "I got the data from someone else, not my problem". Producers, distributors, and consumers all have skin in the game.
- **Data executive** rolls up data ownership from the systems of record so one accountable leader can staff and execute the duties (simplified into four buckets), rather than leaving data ownership as a side-of-desk checkbox. Cautionary tale: another firm's "application business owner" role appeared in ~2,200 policies and 10,000+ desktop procedures — and the regulator asked to interview ten of them.
- Peacetime vs wartime: we are not under a consent order, unlike peers who spent ~$1bn putting regulatory report lineage on spreadsheets. Use the window and the tooling.

**Positions & decisions**
- Strategic data provisioning: build data products **with purpose**, derived from Big Rock CEO priorities and risk/regulatory priorities — not "if you build it they will come".
- Normalise those use-case needs into domains, subdomains, data products, elements, and attributes, producing a **global logical model** for each core data product, with v1 satisfying the chosen use cases. Build once, use many.
- Use cases were chosen as **clusters** with common core data concepts — mostly party, account, relationship, coverage — which is why party/account came first.
- System of capture ≠ system of record ≠ data product. A data product is abstracted from any application, even when only one SOR holds it.

**References & standards**
- Data Mesh (Zhamak Dehghani): https://martinfowler.com/articles/data-mesh-principles.html
- Data product & data contract specs: https://bitol.io/ (ODCS/ODPS) · https://datacontract.com/
- DAMA-DMBOK: https://www.dama.org/cpages/body-of-knowledge
- BCBS 239 (risk data aggregation principles): https://www.bis.org/publ/bcbs239.htm
- DCAM: https://edmcouncil.org/frameworks/dcam/

---

### 16. Data products, AI-readiness, lineage, masking

**Notes**
- Contents of a data product: content and features, latency/temporality, data quality rules (technical and business) with quality scores, metadata, logical model / ontology, glossary terms, and a surrounding **data contract** — enough for you and others to be comfortable consuming it.
- The maturity gap: current practice is pipeline-centric (get the data out, put it in S3, expose via Snowflake) with ~1,100 raw datasets on the mesh. The leap is upgrading raw datasets to actual governed data products, done as controlled pilots so nothing breaks. Full global delivery targeted for 2027 if the pilot lands.
- One logical model underpinning **multiple distribution pipelines** — analytical, operational, transactional. Non-functional characteristics feed the technical architecture choice per pipeline.
- **AI-ready** primarily means uplifting metadata quality: if the machine cannot determine fitness for purpose from a clear expression of intent, the metadata isn't good enough. Data quality is the other half.
- Fitness for purpose is contextual, not absolute. The worked example: notional value published to seven decimal places is a data quality issue for FR Y-14 Schedule H (which requires truncation to five) and not an issue for anyone else — so it must be described, and intent must be granular enough to match.
- Consumption-side contracts are as important as producer contracts. CARDS 2.0 maintains a normalised understanding of the ~400 regulatory reports required for IPB, uses that as a requirements set, and then validates fitness for purpose against the mesh. A new court verdict in Germany changes what "good" looks like and should propagate back into the data procurement strategy — change management in both directions.
- **Lineage strategy:** eliminate the hops. Rather than tracing every hop back through aggregators and pass-throughs, standardise on system of record → mesh (as a core data product) → consumer, and maintain the system-of-capture / system-of-record relationship separately. Pass-through systems are heavily scrutinised — you have to prove the negative (no transformation logic).
- **Consistency of provisioning is the number one data quality rule.** Regulators examine across reports; the same element sourced two different ways for two reports is the finding, even if both are correct.
- Versioning: every data product is versioned. Grain may need to change as agents start consuming products — expect to split products into more discrete components to satisfy privacy, entitlement, and storage/compute constraints. Transmit as little data as necessary.
- **Bitemporality / milestoning** is a data product requirement, not an afterthought — as-is vs as-was is a regulatory requirement, and the performance-reporting example (an asset class that no longer exists but contributed to lifetime performance) is unsolved in several systems today.
- Compute-in-the-data-product (from the data mesh literature) was raised: if there's only one way to calculate a position, the logic shouldn't be replicated. Position taken: deliver it through the core data product mechanism, but **ownership of the logic stays with the business owner who owns the logic**, with model risk policy scoped explicitly.
- 2027 initiative flagged: standardised, governed **metrics** — extending the ontology/taxonomy into the metrics plane, including how metrics are visualised.
- **Masking and test data**: mask centrally as part of the data product offering rather than every team masking the same data. A project already exists taking production data, masking PII, and allowing pick-and-choose — to be connected to automated migration/regression testing (see §13).
- On MCP: teams are asking to build MCP servers to expose their data. Position taken — **don't proliferate MCPs**; point people at the mesh. Prefer a **data agent** / analytic skill that knows how to connect to Snowflake, do the processing, and act as the interface to the domain. Entitlements are already enforced at the mesh; bypassing it is dangerous. Analytical → mesh; transactional/journey → service mesh + GraphQL against the domain.

**References & standards**
- Open Data Contract Standard (Bitol/ODCS): https://bitol.io/
- OpenLineage: https://openlineage.io/ · Marquez: https://marquezproject.ai/
- Great Expectations / Soda (DQ rules as code): https://greatexpectations.io/ · https://www.soda.io/
- dbt semantic layer / metrics governance: https://docs.getdbt.com/docs/build/semantic-models
- FR Y-14 reporting forms: https://www.federalreserve.gov/apps/reportingforms/
- Model Context Protocol: https://modelcontextprotocol.io/

---

### 17. Data domains vs functional domains (slides 14, 20)

**Notes**
- Legacy functional domains were designed around human org structures, UIs, and workflows (front office, wealth planning, middle office, investment office), and applications were then built to fill those boxes.
- Data domains are abstracted from applications and normalised. Mapping example for the client lifecycle vertical: functional domains = client info management, client lifecycle management, client service, product innovation; data domains = party, account, client, relationship, mandate, suitability, coverage.
- A data domain can span multiple functional domains, but exactly one functional domain owns it; the rest are consumers.
- Tension acknowledged: the external view of the business is the four services on the public site (wealth planning, banking, lending, investing). Functional domains exist because financial services doesn't organise like a product company (Apple has a MacBook team and an iPhone team; we don't).
- Two directions debated:
  - **Collapse toward the verticals / business domains** (Rod's and Shane's preference) — map systems directly to how we support the business, down to the bounded context.
  - **Sync the two concepts** and have systems/application/functional/data architecture operate front-to-back in the same domain-bounded context within the verticals (Pat's proposal on slide 14).
- Counter-argument recorded: collapsing to data domains alone ignores the compute and business logic that sits in the functional domain, and would imply reorganising all of GPB — aspirational.
- The forward-looking argument for eventually collapsing: with agentic and hyper-personalised experiences, what remains is data, storage, and compute; the connective tissue of UIs and applications becomes less of a requirement. Not close today.
- Practical mitigation already applied: each functional domain mapped to exactly one vertical with a named domain owner, even where it's messy (fees exist everywhere but are mapped to the investment vertical so someone owns the fees data model).
- Party as the test case: a true party master enabling net-exposure roll-ups (total GPB exposure to a large institutional client, including its employee base) is not possible today.

**Positions & decisions**
- Move toward a single **architect** role at the vertical level rather than separate data / systems / functional architect roles.
- Skills and knowledge bases must be governed the same way data domains are — bounded by domain, reusable, not scattered across teams and MCP stores. **This is an architecture function.** (See §18.)

**Open questions**
- Whether knowledge bases are data products. Explicitly left open — "it's a discussion".
- Whether logical models can be generated from data products / physical metadata with industry models (e.g. FIBO) as an overlay. Consensus: an LLM can generate a draft, but a human data executive must sign it off until a baseline is established; after that it should snowball quickly.

**References & standards**
- FIBO (Financial Industry Business Ontology): https://spec.edmcouncil.org/fibo/
- BIAN service landscape (banking domain reference): https://bian.org/
- DDD bounded context: https://martinfowler.com/bliki/BoundedContext.html

---

## Part VI — AI Engineering Tooling (Niraja & Jordan session)

### 18. Skills, agent teams, worktrees, and orchestration

**Notes — client tooling**
- **Roo/Cline 3.58 (beta)**: skills can now be attached to slash commands; a skills marketplace is auto-discovered; the same skill file runs in the VS Code extension, the Roo CLI, Claude Code, and Copilot. **Write the skill once, use it everywhere** — that portability is the headline.
- **Git worktrees** now supported in the client: one code base, multiple parallel agent workstreams, each committing into its own worktree, merged at the end. Directly enables the human-vs-agent collision problem from §11.
- Composite slash command demo (`/commit`): diff → find or create the Jira via the Jira MCP → update it with what was done → commit with the reference → resolve it → push. The point is not the specific workflow but that MCP + skills + slash commands **compose**. Challenged in the room on whether create-Jira-after-the-fact is the behaviour we want to encourage; alternative shown by another team is `/create-jira-and-branch` which creates the branch with the Jira ID embedded so subsequent commits inherit it. Rod's intervention worth recording: **the motivation is traceability and culture, not scoring on an AI-for-tech metric.**
- Slash commands are currently **not shareable** across teams (no marketplace for them) — they live per-user unless committed into a repo. Flagged as something the platform should own so this doesn't stay IDE- and user-specific.

**Notes — subagents vs agent teams**
- **Subagents**: each has its own context; can run in parallel across models (Opus for one, Haiku for another); results return to the main agent. Roo cannot yet run agents in parallel — it will do the work sequentially. This is the main functional divergence from Claude Code today.
- **Agent teams**: a lead agent forms a team, assigns tasks, and the members communicate with each other over a mailbox/message bus, acknowledging and re-planning. Each member has its own context. Reported wins:
  - **Deep repo analysis** — ~250–400 repos analysed in under ~30 minutes, producing architecture, infra, front-end/back-end, functional breakdown, dependency maps, and identification of dead repos.
  - **Java version upgrade remediation** — fixing compilation and unit/integration test failures after a major upgrade. Pass rate moved from ~50–60% to ~90% by switching from a sequential approach to agent teams.
  - **Deep multi-lens code review** — separate security, performance, and functional agents on the same code base.
- Where it breaks down: over-decomposition. Extending agent teams across a whole long workflow burns context and coordination cost and produces worse results than breaking the work into specialised, bounded jobs. The judgement call ("which tasks parallelise well vs which cost more to renegotiate than to do") is a real, unsolved cost/benefit question — and the right question for a shared benchmark before rolling skills out broadly.

**Notes — orchestration frontier**
- **Beads** — git-backed, dependency-graph issue tracker designed as agent memory; replaces markdown plan files. Attractive because task dependency graphs are exactly what multi-agent work needs. Position: we live in the real world and Jira is our system of capture, so Jira stays — but the dependency-graph model is worth stealing.
- **Gastown** — the hybrid everyone pointed at: 20–30 agents in parallel, beads as the control/data plane, worktree-based persistent storage, clear task dependencies, tmux UI, multi-harness (Claude Code, Copilot, Codex, Gemini). Described as the best combination available today, and as expert-oriented rather than enterprise-ready.
- **Paperclip** demo — an agentic "organisation": hire a CEO agent, it decomposes the task, defines the personas needed, requests board approval to hire (a deliberate human cost control), then assigns and rebalances work across agent employees. Each employee has a persona, a skill set, and an **agent harness adaptor** (Claude Code today, Roo tomorrow) — so the model/vendor is swappable while the persona and skills stay. Postgres holds the org and task state; the real work state lives in the Claude sessions and the git repos. Memory is enabled so mistakes learned on one project persist rather than being re-typed into CLAUDE.md every time.
- Real workload run through it: Rod's **hexagonal architecture** skill (discover patterns, find anti-patterns, identify value objects, detect pattern variations, measure drift from target state) applied across ~30–40 repos. Parallelism at three levels — agent teams inside each repo skill, multiple repos per engineer agent, and a lead rebalancing when an engineer fell behind.
- Skills authoring philosophy from this session, worth adopting: **write pure atomic skills and give the agent the tools and the goal, rather than a regimental workflow.** Rigid workflows can't be re-planned mid-flight.

**Marketplace constraint (unresolved, needs a decision)**
- Claude Code's managed enterprise settings restrict which marketplaces can be loaded, and central has allocated **one marketplace for all of AWM**. Nested marketplaces are not supported (a deliberate security choice), so everything must be flattened at the plugin level in a single `marketplace.json`.
- Current workaround: seven code repositories exposed as seven plugins, namespaced by prefix (`am-core`, `am-sdlc`, `gstp-*`, etc.), with git submodules being explored to spread the underlying repos.
- Concerns raised in the room: context cost when plugins load, discoverability across thousands of skills, and management of the aggregate. Clarification given: plugin definitions and skill *descriptions* load; full skill bodies load only on invocation.
- Naming critique that landed: **"marketplace" should have been called "namespace"** — much of the confusion is the word.

**Positions & decisions**
- Skills authoring should be **democratised**, not gated — but the architecture function should own and publish the architecture-related skills (drift assessment against target-state patterns, hexagonal/microservice/serverless conformance, event-model conformance) and mandate their use so architecture decisions shift left.
- Orgs should each own their agentic swarm, not run from a central instance — they own the cost, the security posture, and the outcomes; central operation would not scale. Export/import of a working org (personas + skills) between teams is the sharing mechanism.
- Every capability we build should be **dogfooded through our own platform**, tested and released the same way, not built first and integrated later.
- AI-for-tech / the catalyst community are enablers, not the group that decides how skills should be structured. That guidance has to come from this table, and quickly, because the platform needs to know where skills, hooks, subagents, and agents live.

**References & standards**
- Claude Code skills, plugins, subagents: https://docs.claude.com/en/docs/claude-code/overview
- Agent Skills / SKILL.md format: https://docs.claude.com/en/docs/agents-and-tools/agent-skills
- Beads: https://github.com/steveyegge/beads · Yegge's write-up: https://steve-yegge.medium.com/introducing-beads-your-coding-agents-new-memory-upgrade-05a5a06fa1cc
- Gastown: https://github.com/gastownhall/gastown · https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04
- Roo Code: https://docs.roocode.com/
- MCP: https://modelcontextprotocol.io/
- Hexagonal architecture (ports & adapters): https://alistair.cockburn.us/hexagonal-architecture/
- OWASP Top 10 for LLM/agentic applications: https://genai.owasp.org/

---

## Part VII — Organisation, Role, and Next Steps

### 19. The LDA / domain architect role

**Notes**
- The role was renamed from design authority to **domain architect** deliberately: you are the chief architect for the domains you support, accountable for everything architecture-related in them.
- Definition offered: architecture is design *and* engineering. Design and build go together — you need to operate at every level, from business domain to capability to system design, including drawbacks and target state. **Ownership** is the key word: when the business head or CTO asks "who do I go to?", you are the answer.
- Counterweight from the room: the point of all of it is delivering business results to customers. Understanding how your role connects to the business is not always clear or direct, and that gap is itself a problem.
- Two honest observations:
  - Many LDAs describe the role as a side job on top of a day job. Left as an open question by Rod: is that true, is it a problem, and does it need fixing?
  - Multiple teams don't know who their LDA is, and some actively push back ("I don't need an architect"). The architect is often only pulled in for an approval or a fire.
- Reactivity: consensus that some reactivity is healthy — dogfooding your own product and feeling the pain of outages is part of being a good architect — but there is more opportunity to be proactive than is being taken.
- Branding problem named directly: engineers who don't believe you appreciate what they do, technically, won't bring work to you. Closing that chasm is a real workstream, and it differs by org.

**Positions & decisions**
- The LDA table is where the change happens. If this group doesn't push it, it doesn't move — regardless of what CTOs say.
- The Architecture Council can be pivoted to focus on this, one topic at a time, with lightweight decision records.

**References & standards**
- Architecture Decision Records: https://adr.github.io/ · https://github.com/joelparkerhenderson/architecture-decision-record
- Team Topologies enabling teams: https://teamtopologies.com/key-concepts

---

### 20. MVP, ways of working, and actions

**Notes**
- This is a **vision**, not a Monday execution plan. Expectation: months, not a year, given business pace — divide and conquer, bring capabilities back into the whole.
- Most of the pieces already exist somewhere in the room. The plan is to assemble working versions from existing parts and demonstrate a thin end-to-end slice, then break it apart into capabilities people own.
- Choose an MVP target that is meaningful, not trivial: not a system untouched for a decade, and not somebody's guarded flagship either. Suggested filters — teams not demonstrating the cultural pivot, applications that were never prioritised for transformation, work that has fallen below the line. Something where the win is visible precisely because it wasn't planned.
- Ways of working proposed: four hours a week each — but as **orchestrator of agents**, not four hours of hand-coding. Shared repos, the same tooling we're advocating, eating our own dog food.
- Funding logic: the efficiency freed by these improvements should be partly reinvested into building more of it, negotiated with CTOs, not fully absorbed into delivery velocity.
- Licences: anyone without Claude Code should raise their hand, with the explicit condition that a licence carries an expectation to contribute.
- On scope discipline: the pre-build / inner-loop conversation is deliberately deferred. The reason given is political variability, not lack of value — and it was noted that most of the time is spent post-build anyway, so accelerating code generation without fixing the outer loop realises nothing.

**Action list (as captured)**
1. Read the ~280-page pack and come back with reflections; weekly cadence to be set up (Teams channel, follow-up sessions).
2. Each LDA: identify candidate capabilities from your own CTO area, and what you can bring to the table — offered, not assigned.
3. Identify the MVP candidate application(s) — one or two examples, ideally one per CTO area to try something out.
4. Decide the skills/agents/hooks structure quickly (where they live, how they're governed, how they're published) because the platform depends on it.
5. Take the vision to your CTOs; Rod will run the leadership conversations in parallel, but assume you need to sell it.
6. Prioritise pattern build order (deferred from §3).
7. Compare notes on the ACL/Meridian design against the earlier original design document.
8. Collaborate with the AI-for-tech catalyst group rather than duplicating.

---

## Summary

The offsite made one argument in seven variations: **the firm has all the pieces and none of the assembly.** Every session — patterns, events, environments, delivery, testing, lifecycle, data — described the same failure mode, which is that a capability exists as a reference implementation whose correct use depends on an individual engineer's knowledge, and therefore gets used five versions behind, inconsistently, at the wrong cost, with no evidence.

The proposed fix is **Architecture as a Product**: stop offering advice and reference implementations, and ship a platform that makes the right way the easy way. Concretely that means patterns as versioned products with automated enforcement; domain events (business facts) cleanly separated from system-behaviour events and both discoverable through a self-registering catalogue that serves humans, regulators, and agents; environments composed from four declared profiles (application pattern, environment, resilience tier, deployment strategy) rather than hand-crafted; a delivery broker that turns developer intent into pipelines, preview environments, and immutable build-once artefacts; testing built from recorded production behaviour and replayed against proxied dependencies rather than always-on integration estates; and SBOM findings that trigger automated remediation with the confidence supplied by that replay evidence.

The economic engine underneath all of it is cost. Cloud spend is up ~45% year over year without a matching increase in adoption, non-prod costs more than production, and roughly a quarter of every team's budget is already allocated to maintenance that never shrinks. The claim is that the platform is self-funding: ephemeral non-prod and right-sized patterns pay for higher production resilience and buy back the engineering capacity to build the rest.

The data session made the same case in its own vocabulary — data products rather than pipelines, use-case-driven provisioning rather than build-it-and-they-will-come, consistency of provisioning as the number one quality rule, and metadata good enough that a machine can judge fitness for purpose. Its unresolved tension is structural: data domains and functional domains do not line up, and the room split between collapsing toward business verticals and syncing the two concepts front-to-back.

The AI tooling session showed that the execution capability is real and available now — portable skills, agent teams, worktrees, dependency-graph task planning, and multi-agent orchestration already delivering measurable results on version upgrades and repo analysis. The constraints are governance ones (a single flattened marketplace, unshared slash commands, no agreed skills taxonomy) and judgement ones (knowing which work parallelises and which does not).

What remains genuinely unresolved: pattern build order; the developer-vs-product-team question for who the product serves; state mutation and T+1/T+2 batch flows in the replay model; database schema sequencing in the delivery pipeline; the domain map reconciliation; whether knowledge bases are data products; and the LDA role itself — whether being an architect on the side of a day job is a fact to accept or a problem to fix. The next move is small and deliberate: pick one or two MVP candidates, assemble from what already exists, dogfood it through the platform being built, and reconvene weekly.

---

## Appendix A — Consolidated reference table

| Theme | Anchor references |
|---|---|
| Platform as product | Team Topologies · CNCF Platforms White Paper · internaldeveloperplatform.org · Backstage |
| Patterns & golden paths | Backstage Software Templates · Terraform modules · AWS Amplify · Spotify golden paths |
| Policy as code | Open Policy Agent / Rego · Conftest · HashiCorp Sentinel |
| Event-driven architecture | CloudEvents · AsyncAPI · Transactional Outbox · microservices.io · Event Storming |
| Event documentation | EventCatalog (+ Backstage plugin, FlowMart demo) · Schema Registry compatibility modes |
| Legacy migration | Strangler Fig · Anti-Corruption Layer · Parallel Change |
| Environments & IaC | Crossplane · Score · Argo Rollouts · Immutable Server |
| Reliability & chaos | AWS FIS · Principles of Chaos · Chaos Mesh · LitmusChaos · AWS Well-Architected Reliability Pillar · Google SRE Book |
| Delivery | Trunk-Based Development · Continuous Delivery · SemVer · SLSA · Sigstore / in-toto · DORA |
| Testing | Pact · Spring Cloud Contract · WireMock · Hoverfly · Karate · Playwright · Testcontainers · SDV · LocalStack |
| Supply chain / TLM | CycloneDX · SPDX · OpenSSF Scorecard · Renovate · OpenRewrite · EPSS · CISA KEV · NIST SSDF |
| Data | Data Mesh principles · Bitol ODCS/ODPS · datacontract.com · OpenLineage · Marquez · Great Expectations · DAMA-DMBOK · BCBS 239 · DCAM · FIBO · BIAN |
| Agentic engineering | Claude Code docs · Agent Skills (SKILL.md) · MCP · Beads · Gastown · Roo Code · OWASP GenAI Top 10 |
| Architecture practice | ADRs · Hexagonal architecture · Bounded Context |

---

## Appendix B — Transcription corrections

The ASR output was heavily corrupted. These are the substitutions applied, worth knowing before anyone else reads the raw file.

| Transcript | Actual |
|---|---|
| "Roman event", "Rowan event", "Romain" | **domain event** |
| "flow mart", "flow chart" (in the catalogue demo) | **FlowMart** (EventCatalog demo catalog) |
| "sneak" / "snake" | **Snyk** |
| "dino trace" | **Dynatrace** |
| "Round 53" | **Route 53** |
| "AOB", "ALB", "GOB" | **ALB / NLB** (AWS load balancers) |
| "a 5S", "fall injection service" | **AWS FIS** (Fault Injection Service) |
| "Likubes", "liquor based" | **Liquibase** |
| "coffee", "Kafta", "copper" | **Kafka** |
| "event braves", "a vent bridge" | **EventBridge** |
| "Monada / Monata / minata upgrade" | **Java version upgrade** (Maven-based) |
| "the DeNoto / Denota" | **Denodo** |
| "Starbur" | **Starburst** |
| "cards 2.0" | **CARDS 2.0** (regulatory reporting platform) |
| "23 wall" | **23 Wall** (programme) |
| "Y14 / FRY 14 schedule H" | **FR Y-14 Schedule H** |
| "dorametrics" | **DORA metrics** |
| "Versaill", "Barcel", "Versel" | **Vercel** |
| "clot code", "Paul Coe", "plot code" | **Claude Code** |
| "Rue", "Roo", "Klein", "cline" | **Roo Code / Cline** |
| "paper clip", "paperclips" | **Paperclip** (agentic org orchestrator) |
| "Gistan", "Gas town", "Guess them" | **Gastown** |
| "beets", "beeds", "bees" | **Beads** |
| "wire mark", "warm what" | **WireMock** |
| "over fly" | **Hoverfly** |
| "karate model" | **Karate** |
| "AirSyn / SDV" | **SDV (Synthetic Data Vault)** |
| "Farm Genie" | **FARM remediation assistant** (internal) |
| "seal", "CEO", "seals" (in deployment context) | **SEAL** (application identifier) |
| "Jules", "Jewels" | **Jules** (internal CI platform) |
| "hardness", "harness" | **Harness** |
| "Atlas won / Atlas 2" | **Atlas 1 / Atlas 2** (internal cloud platform) |
| "Guy / Gaia" | **Gaia** (internal private cloud) |
| "AI free", "AI 3" | **AI3 / Architecture Workbench** |
| "Dax", "Dex", "decks", "depths" | **DAX / Dex** (data catalogue) |
| "ECI", "DCI", "CCI" | **ECI** (client/entity identifier) |
| "TCF", "CTC" | **Tech Control Forum / technology controls** |
| "Krivon / tier 4" | **Tier 4 — mission critical** |
| "Kane's algorithm" | **Kahn's algorithm** (topological sort) |

---

## Appendix C — Glossary of internal terms used

- **A&E** — Architecture & Engineering
- **AWM / GPB / IPB / CWM / USPB** — Asset & Wealth Management / Global Private Bank / International Private Bank / Chase Wealth Management / U.S. Private Bank
- **LDA** — Lead/Domain Architect (renamed from design authority to domain architect)
- **TDM** — Technology Domain Model
- **SEAL** — application/system identifier used for deployment, controls, and lineage
- **AI3 / Architecture Workbench** — internal architecture metadata and lineage tooling
- **Meridian (DSP)** — legacy client-information system being decomposed by sub-domain
- **Connect** — client-facing platform, regionally deployed
- **GSTP / USDP** — platforms referenced for the rebalancer replay-testing example
- **CARDS 2.0** — regulatory reporting platform maintaining the normalised view of ~400 IPB reports
- **FARM** — firm application risk/break management (source of "farm breaks")
- **Harness / Jules / Spinnaker** — CI/CD tooling in use
- **Atlas / Gaia / EAC / Kickstart** — internal cloud platform, private cloud, infrastructure-as-code layer and module set
- **Quad** — technology + data + operations + product (the triad plus data)
