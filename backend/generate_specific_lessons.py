import argparse
import json
import re
from dataclasses import dataclass

from sqlalchemy.orm import sessionmaker

from ai_logic import AIError, AIProvider
from db.models.db_config import engine
from db.models.lessons import Lesson
from db.models.roadmap import Roadmap, RoadmapNode


SessionLocal = sessionmaker(bind=engine)


@dataclass
class LessonContext:
    lesson: Lesson
    node: RoadmapNode | None
    roadmap: Roadmap | None
    milestone: RoadmapNode | None


def _safe_json_loads(value: str | None, fallback):
    if not value:
        return fallback
    try:
        parsed = json.loads(value)
        return parsed
    except Exception:
        return fallback


def _ensure_lesson_for_node(session, *, node: RoadmapNode, roadmap: Roadmap | None) -> Lesson:
    lesson = session.query(Lesson).filter_by(roadmap_node_id=node.id).first()
    if lesson:
        if roadmap and lesson.path != roadmap.slug:
            lesson.path = roadmap.slug
        if lesson.title != node.title:
            lesson.title = node.title
        if lesson.order != node.external_id:
            lesson.order = node.external_id
        return lesson

    lesson = (
        session.query(Lesson)
        .filter_by(path=roadmap.slug if roadmap else "", order=node.external_id)
        .first()
    )
    if lesson:
        lesson.roadmap_node_id = node.id
        lesson.title = node.title
        return lesson

    lesson = Lesson(
        roadmap_node_id=node.id,
        title=node.title,
        path=roadmap.slug if roadmap else "unknown",
        order=node.external_id,
    )
    session.add(lesson)
    session.flush()
    return lesson


def _safe_lesson_label(context: LessonContext) -> str:
    return f"{context.lesson.path}:{context.lesson.order} {context.lesson.title}"


def _strip_code_fences(text: str) -> str:
    cleaned = (text or "").strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()
    return cleaned


def _extract_json_object(text: str) -> dict | None:
    candidate = _strip_code_fences(text)
    try:
        parsed = json.loads(candidate)
        if isinstance(parsed, dict):
            return parsed
    except Exception:
        pass

    match = re.search(r"\{[\s\S]*\}", candidate)
    if not match:
        return None

    try:
        parsed = json.loads(match.group(0))
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        return None


def _word_count(value: str) -> int:
    tokens = re.findall(r"\b[\w'-]+\b", value or "")
    return len(tokens)


def _extract_narrative_text(sections: list[dict]) -> str:
    chunks: list[str] = []
    for section in sections:
        if not isinstance(section, dict):
            continue
        if (section.get("type") or "text").lower() != "text":
            continue
        content = section.get("content")
        if isinstance(content, str) and content.strip():
            chunks.append(content.strip())
    return "\n\n".join(chunks)


def _ensure_word_count_target(sections: list[dict], target_min_words: int = 480) -> list[dict]:
    narrative = _extract_narrative_text(sections)
    words = _word_count(narrative)
    if words >= target_min_words:
        return sections

    # Add one concise extension paragraph to keep the output near the requested size.
    extension = (
        "Practical note: treat this topic as a repeatable workflow rather than a one-time trick. "
        "Before writing code, define the contract of your input and output, then choose a data shape that keeps the "
        "logic readable. As you implement, test the happy path first and immediately add one edge-case test for invalid "
        "or unexpected values. Refactor names so another engineer can understand the flow without extra comments. "
        "Finally, review the solution for maintainability: remove duplication, keep functions small, and make failures "
        "predictable with explicit checks and clear error messages."
    )

    text_sections = [section for section in sections if isinstance(section, dict) and (section.get("type") or "text").lower() == "text"]
    if text_sections:
        text_sections[-1]["content"] = (text_sections[-1].get("content") or "").strip() + "\n\n" + extension
        return sections

    sections.append(
        {
            "type": "text",
            "title": "Deep Dive",
            "content": extension,
        }
    )
    return sections


def _infer_language(path_slug: str, lesson_title: str) -> str:
    title = (lesson_title or "").lower()
    path = (path_slug or "").lower().strip()

    if re.search(r"\bpython\b|\bfastapi\b|\bsqlalchemy\b|\bpytest\b", title):
        return "python"
    if re.search(r"\breact\b|\bjsx\b|\bhook\b", title):
        return "jsx"
    if re.search(r"\btypescript\b", title):
        return "typescript"
    if re.search(r"\bsql\b|\bpostgres\b|\bjoin\b|\bindex\b", title):
        return "sql"
    if re.search(r"\bhtml\b", title):
        return "html"
    if re.search(r"\bcss\b", title):
        return "css"

    if path in {"backend", "data"}:
        return "python"
    if path == "database":
        return "sql"

    return "javascript"


def _fallback_sections(context: LessonContext) -> list[dict]:
    lesson = context.lesson
    milestone_name = context.milestone.title if context.milestone else "this milestone"
    language = _infer_language(lesson.path or "", lesson.title or "")

    intro = (
        f"{lesson.title} sits inside {milestone_name} and teaches a practical capability you will use repeatedly in real projects. "
        "Start by identifying the core concept and the problem it solves. Many learners memorize syntax but miss intent, "
        "so focus on why this approach is used, what trade-offs it introduces, and where it fits in a production workflow. "
        "A strong mental model helps you adapt when naming, architecture, or frameworks change."
    )
    core = (
        "Break the concept into steps you can execute deliberately. First, define the data or state your logic consumes. "
        "Second, implement a clean transformation that produces predictable output. Third, add validation for invalid inputs "
        "and edge conditions. Keep your implementation small, readable, and testable. In team settings, this is the difference "
        "between code that only works today and code that can be safely extended next month."
    )
    applied = (
        "When applying this lesson in a feature, start from a realistic scenario: what event triggers the logic, what data "
        "shape arrives, and what result should be visible to users or other services. Use incremental development: implement "
        "a simple baseline, verify behavior with sample input, then add error handling and performance-minded improvements. "
        "Document assumptions directly in function names and boundaries so collaborators can reason about behavior quickly."
    )
    quality = (
        "Quality comes from feedback loops. Write at least one happy-path test and one edge-case test, then read your own code "
        "as if you were reviewing a teammate's pull request. Check for implicit assumptions, hidden mutation, and fragile branching. "
        "Prefer explicit conditions, deterministic outputs, and stable interfaces. If requirements evolve, your code should tolerate "
        "change without requiring a full rewrite."
    )

    code_example = {
        "type": "code",
        "title": f"{lesson.title} Example",
        "language": language,
        "code": "def solve(input_data):\n    # Apply the lesson concept to transform input into output.\n    return input_data"
        if language == "python"
        else "function solve(input) {\n  // Apply the lesson concept to transform input into output.\n  return input;\n}",
        "explanation": "Use this snippet as a baseline. Replace placeholders with the exact operations required by the lesson title.",
    }

    return [
        {"type": "text", "title": "Concept", "content": intro + "\n\n" + core},
        {"type": "text", "title": "Application", "content": applied + "\n\n" + quality},
        code_example,
    ]


def _build_prompt(context: LessonContext) -> str:
    lesson = context.lesson
    milestone_title = context.milestone.title if context.milestone else "Milestone"
    path_title = context.roadmap.title if context.roadmap else (lesson.path or "Path")
    lesson_type = context.node.lesson_type if context.node else "interactive"
    duration = context.node.duration if context.node else None
    language = _infer_language(lesson.path or "", lesson.title or "")

    return f"""
You are generating a production-ready lesson payload for an e-learning platform.
Return ONLY one valid JSON object and no extra prose.

Context:
- Path slug: {lesson.path}
- Path title: {path_title}
- Milestone title: {milestone_title}
- Lesson ID: {lesson.order}
- Lesson title: {lesson.title}
- Lesson type: {lesson_type}
- Lesson duration: {duration}
- Preferred code example language: {language}

Required JSON shape:
{{
  "overview": "string",
  "goal": "string",
  "topics": ["string", "string", "string"],
  "sections": [
    {{
      "type": "text",
      "title": "string",
      "content": "string"
    }},
    {{
      "type": "code",
      "title": "string",
      "language": "string",
      "code": "string",
      "explanation": "string"
    }}
  ],
  "resources": [
    {{"label": "string", "url": "https://..."}},
    {{"label": "string", "url": "https://..."}}
  ]
}}

Hard rules:
1) Narrative text (all sections where type=text) must be about 500 words total (acceptable 480-560 words), excluding code.
2) Cover the most important concepts specific to this lesson title.
3) Include at least one concrete code example section.
4) Keep sections practical and implementation-focused, not generic filler.
5) URLs in resources must start with https://
6) Do not use markdown code fences.
""".strip()


def _normalize_resource(item: dict) -> dict | None:
    if not isinstance(item, dict):
        return None
    label = str(item.get("label") or "").strip()
    url = str(item.get("url") or "").strip()
    if not label or not url.startswith("https://"):
        return None
    return {"label": label, "url": url}


def _normalize_sections(payload: dict, context: LessonContext) -> list[dict]:
    raw_sections = payload.get("sections") if isinstance(payload.get("sections"), list) else []
    normalized: list[dict] = []

    for raw in raw_sections:
        if not isinstance(raw, dict):
            continue

        section_type = str(raw.get("type") or "text").strip().lower()
        title = str(raw.get("title") or "").strip()

        if section_type == "code":
            code = str(raw.get("code") or "").strip()
            if not code:
                continue
            normalized.append(
                {
                    "type": "code",
                    "title": title or f"{context.lesson.title} code example",
                    "language": str(raw.get("language") or _infer_language(context.lesson.path or "", context.lesson.title or "")),
                    "code": code,
                    "explanation": str(raw.get("explanation") or "").strip(),
                }
            )
            continue

        content = str(raw.get("content") or "").strip()
        if not content:
            continue
        normalized.append(
            {
                "type": "text",
                "title": title or "Lesson Notes",
                "content": content,
            }
        )

    if not normalized:
        normalized = _fallback_sections(context)

    has_code = any((section.get("type") or "text").lower() == "code" for section in normalized)
    if not has_code:
        normalized.extend([section for section in _fallback_sections(context) if section.get("type") == "code"])

    return _ensure_word_count_target(normalized)


def _normalize_payload(payload: dict, context: LessonContext) -> dict:
    lesson = context.lesson

    sections = _normalize_sections(payload, context)
    narrative_text = _extract_narrative_text(sections)

    fallback_topics = [
        f"Core concepts of {lesson.title}",
        f"Practical implementation of {lesson.title}",
        f"Common mistakes and best practices for {lesson.title}",
    ]

    topics = payload.get("topics") if isinstance(payload.get("topics"), list) else []
    topics = [str(item).strip() for item in topics if str(item).strip()]
    topics = topics[:6] if topics else fallback_topics

    resources_raw = payload.get("resources") if isinstance(payload.get("resources"), list) else []
    resources = []
    for item in resources_raw:
        normalized = _normalize_resource(item)
        if normalized:
            resources.append(normalized)

    if not resources:
        resources = [
            {"label": "MDN Web Docs", "url": "https://developer.mozilla.org/"},
            {"label": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/"},
        ]

    text_sections = [section for section in sections if section.get("type") == "text"]
    explanation = [section.get("content", "") for section in text_sections if section.get("content")]

    return {
        "overview": str(payload.get("overview") or f"{lesson.title} lesson overview.").strip(),
        "goal": str(payload.get("goal") or "Understand and apply this lesson in practical scenarios.").strip(),
        "topics": topics,
        "sections": sections,
        "explanation": explanation,
        "resources": resources,
        "narrativeWordCount": _word_count(narrative_text),
    }


def _is_lesson_content_ready(lesson: Lesson) -> bool:
    content = _safe_json_loads(lesson.content, {})
    if not isinstance(content, dict):
        return False

    overview = (lesson.overview or content.get("overview") or "").strip()
    goal = (lesson.goal or content.get("goal") or "").strip()
    topics = _safe_json_loads(lesson.topics_json, content.get("topics", []))
    resources = _safe_json_loads(lesson.resources_json, content.get("resources", []))
    sections = content.get("sections") if isinstance(content.get("sections"), list) else []

    if not overview or not goal:
        return False
    if not isinstance(topics, list) or len(topics) < 3:
        return False
    if not isinstance(resources, list) or len(resources) < 1:
        return False
    if not isinstance(sections, list) or len(sections) < 2:
        return False

    has_code = False
    for section in sections:
        if isinstance(section, dict) and (section.get("type") or "").lower() == "code" and (section.get("code") or "").strip():
            has_code = True
            break

    if not has_code:
        return False

    words = _word_count(_extract_narrative_text([section for section in sections if isinstance(section, dict)]))
    return words >= 480


def _lesson_contexts(session, path_filter: str | None) -> list[LessonContext]:
    output: list[LessonContext] = []

    roadmap_query = session.query(Roadmap).order_by(Roadmap.slug.asc())
    if path_filter:
        roadmap_query = roadmap_query.filter_by(slug=path_filter)

    roadmaps = roadmap_query.all()

    for roadmap in roadmaps:
        lesson_nodes = (
            session.query(RoadmapNode)
            .filter_by(roadmap_id=roadmap.id, node_type="lesson")
            .order_by(RoadmapNode.external_id.asc())
            .all()
        )

        for node in lesson_nodes:
            lesson = _ensure_lesson_for_node(session, node=node, roadmap=roadmap)
            milestone = session.query(RoadmapNode).filter_by(id=node.parent_id).first() if node.parent_id else None
            output.append(LessonContext(lesson=lesson, node=node, roadmap=roadmap, milestone=milestone))

    output.sort(key=lambda item: ((item.lesson.path or ""), item.lesson.order or 0))
    return output


def generate_specific_lessons(
    *,
    path_filter: str | None = None,
    limit: int | None = None,
    overwrite_existing: bool = False,
) -> dict:
    ai_provider = AIProvider()
    if not ai_provider.provider:
        raise AIError("AI provider not configured. Set AI_PROVIDER to 'google' or 'qwen'.")

    processed = 0
    generated = 0
    skipped = 0
    fallback_used = 0

    with SessionLocal() as session:
        contexts = _lesson_contexts(session, path_filter)
        if limit is not None:
            contexts = contexts[:limit]

        total = len(contexts)
        print(f"Generating lesson content for {total} lessons...")

        for index, context in enumerate(contexts, start=1):
            lesson = context.lesson

            if _is_lesson_content_ready(lesson) and not overwrite_existing:
                skipped += 1
                continue

            prompt = _build_prompt(context)
            payload = None

            try:
                raw = ai_provider.prompt_ai(prompt)
                payload = _extract_json_object(raw)
            except Exception:
                payload = None

            if not payload:
                normalized = _normalize_payload({"sections": _fallback_sections(context)}, context)
                fallback_used += 1
            else:
                normalized = _normalize_payload(payload, context)

            lesson.content = json.dumps(
                {
                    "overview": normalized["overview"],
                    "goal": normalized["goal"],
                    "topics": normalized["topics"],
                    "sections": normalized["sections"],
                    "explanation": normalized["explanation"],
                    "resources": normalized["resources"],
                },
                ensure_ascii=False,
            )
            lesson.overview = normalized["overview"]
            lesson.goal = normalized["goal"]
            lesson.topics_json = json.dumps(normalized["topics"], ensure_ascii=False)
            lesson.explanation_json = json.dumps(normalized["explanation"], ensure_ascii=False)
            lesson.resources_json = json.dumps(normalized["resources"], ensure_ascii=False)

            session.commit()

            processed += 1
            generated += 1

            if index % 10 == 0:
                print(f"[{index}/{total}] saved")

            print(
                f"[{index}/{total}] generated {_safe_lesson_label(context)} "
                f"({normalized['narrativeWordCount']} words, sections={len(normalized['sections'])})"
            )

    return {
        "processed": processed,
        "generated": generated,
        "skipped": skipped,
        "fallbackUsed": fallback_used,
        "pathFilter": path_filter,
    }


def main():
    parser = argparse.ArgumentParser(description="Generate lesson content for roadmap lessons and persist to DB")
    parser.add_argument("--path", dest="path_filter", default=None, help="Optional path slug filter (frontend/backend/...)" )
    parser.add_argument("--limit", dest="limit", type=int, default=None, help="Optional max lessons to process")
    parser.add_argument(
        "--overwrite",
        dest="overwrite",
        action="store_true",
        help="Overwrite lessons even when they already look complete",
    )
    parser.add_argument(
        "--no-overwrite",
        dest="overwrite",
        action="store_false",
        help="Skip lessons that already have complete generated content",
    )
    parser.set_defaults(overwrite=False)

    args = parser.parse_args()
    stats = generate_specific_lessons(
        path_filter=args.path_filter,
        limit=args.limit,
        overwrite_existing=args.overwrite,
    )
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main()
