# Unified Code Intelligence Platform: Vision & Architecture

## Executive Summary

We envision a **Unified Code Intelligence Platform** that merges static code analysis, runtime observability, infrastructure-as-code, and organizational knowledge into a single, queryable graph — and exposes it to Large Language Models (LLMs) for autonomous software engineering automation across the SDLC.

Today, these data sources exist in silos. Code lives in repositories. Runtime behavior lives in APM dashboards. Infrastructure definitions live in Terraform modules. Engineering best practices live in Slack channels and Confluence pages. No single system connects them — and no AI agent can reason across all of them simultaneously.

This platform changes that.

---

## Problem Statement

Static code analysis tools (using ASTs or LSTs) can parse source code and resolve structural dependencies — which class calls which method, which service imports which module. But static analysis alone cannot capture:

- **Runtime dependencies**: Cross-service calls that occur through message brokers, event buses, or dynamically resolved endpoints invisible in the source code.
- **Infrastructure topology**: How services are deployed, networked, and scaled — information locked inside Terraform, Kubernetes manifests, and Helm charts.
- **Operational behavior**: Which code paths are hot (high traffic) vs. cold (dead code), where latency accumulates, and where errors propagate — information that only application logs and distributed traces reveal.
- **Institutional knowledge**: Architectural patterns, coding standards, post-mortem learnings, and best practices that live in engineering team channels, wikis, and design documents.

Without unifying these signals, any AI-assisted automation operates with an incomplete picture — leading to hallucinated suggestions, missed dependencies, and refactoring decisions made without operational context.

---

## Proposed Solution

Build a **dual-graph architecture** comprising:

### 1. Code Graph (Structural + Runtime + Infrastructure)

A unified graph that combines three layers:

**Static Layer** — Parsed from source code using Lossless Semantic Trees (LSTs) for Java/Kotlin and Tree-sitter ASTs for TypeScript/Python. This layer captures classes, methods, interfaces, endpoints, DTOs, dependencies, and their structural relationships (calls, implements, injects, extends, publishes, subscribes).

**Runtime Layer** — Ingested from OpenTelemetry distributed traces and structured application logs. This layer captures actual service-to-service invocations, measured latencies, error rates, throughput patterns, and request flow paths as observed in production. Traces are correlated to static code entities via span attributes (`code.function`, `code.namespace`, `service.name`).

**Infrastructure Layer** — Parsed from Infrastructure-as-Code artifacts (Terraform, Kubernetes YAML, Helm charts, Docker Compose files). This layer captures deployment topology, networking rules, resource allocations, environment configurations, and service mesh routing — connecting logical code entities to their physical runtime environments.

All three layers are persisted in **Neo4j** as a single connected graph, with cross-layer edges bridging static definitions to their runtime behavior and infrastructure context.

### 2. Knowledge Graph (Patterns + Best Practices + Institutional Memory)

A complementary graph that captures organizational intelligence:

- **Architectural patterns**: Approved patterns for circuit breakers, retry policies, CQRS, Saga orchestration, and event-driven communication.
- **Coding standards**: Team-specific conventions, naming rules, testing requirements, and review checklists.
- **Engineering channel knowledge**: Extracted from Slack discussions, design documents, ADRs (Architecture Decision Records), post-mortems, and runbooks.
- **Historical decisions**: Why certain libraries were chosen, which approaches were tried and abandoned, and what trade-offs were accepted.

This knowledge is extracted, structured, and stored alongside the Code Graph — enabling the LLM to reason not just about *what the code does*, but about *what the team intends and values*.

---

## Target Use Cases

With both graphs unified and exposed to an LLM via tool-use (MCP or function calling), the platform enables automation across the SDLC:

### Feature Development
- **Adding a new feature**: The LLM queries the Code Graph to understand existing service boundaries, identifies affected endpoints and data flows, checks the Infrastructure Graph for deployment constraints, and references the Knowledge Graph for approved patterns — then generates implementation scaffolding aligned with the team's architecture.
- **Enhancing an existing feature**: The LLM traces the feature's current code paths (static), verifies actual runtime usage patterns (dynamic), checks for infrastructure dependencies (IaC), and applies relevant best practices (knowledge) before suggesting modifications.

### Code Quality & Review
- **Automated code review**: The LLM evaluates pull requests not just syntactically, but against the team's documented standards, architectural patterns, and the runtime impact of changed code paths.
- **Anomaly detection in code**: Identifies deviations from established patterns — e.g., a service bypassing the standard circuit breaker pattern, or a new endpoint missing the required authentication middleware — by cross-referencing the Knowledge Graph.
- **Dead code identification**: Cross-references static method definitions against runtime trace data to identify code that exists in the repository but is never executed in production.

### Testing & Reliability
- **Flaky test detection and diagnosis**: Correlates test failure patterns with runtime trace anomalies, infrastructure state changes, and recent code modifications to identify root causes.
- **Blast radius analysis**: Before merging a change, queries the graph to determine all transitive runtime dependents, affected infrastructure components, and downstream services.

### Incident Response & Observability
- **Root cause analysis**: When an alert fires, the LLM traverses from the error span in the Runtime Layer, up through the Static Layer to identify the responsible code, across to the Infrastructure Layer to check for resource or configuration issues, and into the Knowledge Graph for relevant post-mortem patterns.
- **Performance optimization**: Identifies hot paths where measured latency exceeds expected thresholds, correlates with infrastructure resource limits, and suggests optimizations grounded in team-approved patterns.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    LLM AGENT LAYER                          │
│         (Claude Code / Custom Agents via MCP)               │
│                                                             │
│   Natural Language → Graph Queries → Contextual Reasoning   │
└──────────────────────────┬──────────────────────────────────┘
                           │ Tool-Use / MCP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    QUERY & API LAYER                        │
│            (Cypher Queries + Vector Search)                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
┌──────────────────────┐  ┌──────────────────────────────────┐
│   KNOWLEDGE GRAPH    │  │          CODE GRAPH              │
│                      │  │                                  │
│  • Patterns          │  │  ┌────────────────────────────┐  │
│  • Best Practices    │  │  │    STATIC LAYER            │  │
│  • ADRs              │  │  │    (LST / AST parsing)     │  │
│  • Post-Mortems      │  │  ├────────────────────────────┤  │
│  • Team Standards    │  │  │    RUNTIME LAYER           │  │
│                      │  │  │    (OTel Traces + Logs)    │  │
│                      │  │  ├────────────────────────────┤  │
│                      │  │  │    INFRASTRUCTURE LAYER    │  │
│                      │  │  │    (Terraform / K8s / Helm)│  │
│                      │  │  └────────────────────────────┘  │
└──────────┬───────────┘  └───────────────┬──────────────────┘
           │                              │
           └──────────────┬───────────────┘
                          ▼
              ┌──────────────────────┐
              │       Neo4j          │
              │   (+ pgvector for    │
              │    embeddings)       │
              └──────────────────────┘
```

---

## Ingestion Pipeline

| Source                  | Parser / Collector                     | Graph Layer      |
|-------------------------|----------------------------------------|------------------|
| Java/Kotlin source      | OpenRewrite LST (Moderne CLI)          | Static           |
| TypeScript/React source | Tree-sitter / ts-morph                 | Static           |
| Python source           | Tree-sitter / Python AST               | Static           |
| Terraform / HCL         | Tree-sitter (HCL grammar) / custom     | Infrastructure   |
| Kubernetes YAML         | YAML parser + schema mapping           | Infrastructure   |
| Helm Charts             | Template rendering + YAML parsing      | Infrastructure   |
| Distributed traces      | OpenTelemetry Collector → Neo4j        | Runtime          |
| Application logs        | Fluent Bit / Vector → structured parse | Runtime          |
| Slack channels          | Slack API → LLM extraction → graph     | Knowledge        |
| Confluence / ADRs       | Document parser → LLM extraction       | Knowledge        |
| Post-mortems            | Structured templates → graph           | Knowledge        |
| Git history             | Git log → commit/author/change nodes   | Static + Runtime |

---

## Key Design Principle

The central insight is that **the LLM should never receive raw code as its only context**. Instead, the LLM receives structured, pre-computed graph context — spanning code structure, runtime behavior, infrastructure topology, and institutional knowledge — enabling it to reason with the same multi-dimensional awareness that a senior staff engineer brings to every decision.

The graph is the context. The LLM is the reasoning engine. Together, they form the foundation of truly intelligent software engineering automation.
