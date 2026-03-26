import argparse
import json
import re
from dataclasses import dataclass

from sqlalchemy.orm import sessionmaker

from ai_logic import AIProvider, AIError
from db.models.db_config import engine
from db.models.lessons import Lesson
from db.models.roadmap import Roadmap, RoadmapNode
from db.models.tasks import Task


SessionLocal = sessionmaker(bind=engine)


@dataclass
class LessonContext:
    lesson: Lesson
    node: RoadmapNode | None
    roadmap: Roadmap | None
    milestone: RoadmapNode | None


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


def _remove_existing_assessments(session, *, lesson_id: int):
    session.query(Task).filter(
        Task.lesson_id == lesson_id,
        Task.assessment_kind.in_(["coding", "theory"]),
    ).delete(synchronize_session=False)


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


def _language_for_lesson(path_slug: str, title: str) -> str:
    lower = (title or "").lower()
    path = (path_slug or "").lower().strip()

    if re.search(r"\bhtml\b|\bsemantic\b|\baria\b", lower):
        return "HTML"
    if re.search(r"\bcss\b|\bflexbox\b|\bgrid\b|\bmedia quer(?:y|ies)?\b|\bresponsive\b", lower):
        return "CSS"
    if re.search(r"\btypescript\b|\binterface(?:s)?\b|\bgeneric(?:s)?\b", lower):
        return "TypeScript"
    if re.search(r"\breact\b|\bjsx\b|\bhook(?:s)?\b|\bredux\b|\brouter\b|\bcomponent(?:s)?\b", lower):
        return "React (JSX)"
    if re.search(r"\bpython\b|\bpytest\b|\bfastapi\b|\bsqlalchemy\b|\balembic\b|\bpandas\b|\bnumpy\b|\bsklearn\b|\bscikit\b", lower):
        return "Python"
    if re.search(r"\bexpress(?:\.js)?\b|\bnode(?:\.js)?\b|\bjavascript\b|\bnpm\b|\bdom\b|\bevent\b|\bpromise(?:s)?\b|\bfetch\b", lower):
        return "JavaScript"
    if re.search(r"\bmongo(?:db)?\b|\bmongoose\b", lower):
        return "JavaScript"
    if re.search(r"\bjwt\b|\boauth\b|\brbac\b|\bcors\b|\bcsrf\b|\bxss\b|\bsanitization\b|\bauth(?:entication)?\b", lower):
        return "JavaScript"
    if re.search(r"\bsql\b|\bpostgres(?:ql)?\b|\bjoin(?:s)?\b|\bschema\b|\bindex(?:es)?\b|\bmigration(?:s)?\b", lower):
        return "SQL"
    if re.search(r"\bgit(?:hub)?\b|\bdocker\b|\bci/cd\b|\bcli\b|\bshell\b|\bbash\b", lower):
        return "Shell"

    if path == "backend":
        if re.search(
            r"\bconditionals\b|\bloops\b|\bfunctions\b|\bdecorators\b|\bgenerators\b|\barrays\b|\blinked\b|\bstacks\b|\bqueues\b|\btrees\b|\bsorting\b|\bsearching\b|\bbig o\b|\boop\b|\bfile i/o\b",
            lower,
        ):
            return "Python"
        return "JavaScript"
    if path == "frontend":
        return "JavaScript"
    if path == "fullstack":
        return "JavaScript"
    if path == "mobile":
        return "TypeScript"
    if path == "database":
        return "SQL"
    if path == "data":
        return "Python"
    if path == "cloud":
        return "Shell"

    return "JavaScript"


def _starter_code(language: str) -> str:
    normalized = (language or "").lower()
    if normalized == "html":
        return "<main>\n  <section>\n    <h1>Implement lesson task</h1>\n  </section>\n</main>"
    if normalized == "css":
        return ".container {\n  display: block;\n}\n\n/* Implement task styles */"
    if normalized == "typescript":
        return "type Input = unknown;\n\nexport function solve(input: Input): unknown {\n  return input;\n}"
    if normalized in {"react (jsx)", "react", "jsx"}:
        return "import { useState } from 'react';\n\nexport default function LessonTask() {\n  const [value, setValue] = useState('');\n  return <input value={value} onChange={(e) => setValue(e.target.value)} />;\n}"
    if normalized == "python":
        return "def solve(input_data):\n    return input_data"
    if normalized == "sql":
        return "SELECT *\nFROM table_name\nWHERE 1 = 1;"
    if normalized == "shell":
        return "# implement the required shell workflow"
    return "function solve(input) {\n  return input;\n}"


def _difficulty(lesson_type: str | None, fallback: str | None) -> str:
    if fallback:
        return fallback
    if lesson_type == "project":
        return "Hard"
    if lesson_type == "interactive":
        return "Medium"
    return "Easy"


def _fallback_assessment(context: LessonContext) -> tuple[dict, dict]:
    lesson = context.lesson
    lesson_type = context.node.lesson_type if context.node else "interactive"
    difficulty = _difficulty(lesson_type, lesson.difficulty)
    language = _language_for_lesson(lesson.path or "", lesson.title or "")

    coding = {
        "title": f"Coding Practice: {lesson.title}",
        "difficulty": difficulty,
        "language": language,
        "kind": "coding",
        "prompt": f"Implement a practical task focused on '{lesson.title}' with clear validation and edge-case handling.",
        "inputDescription": "Input needed to solve this lesson-specific task.",
        "outputDescription": "Expected output generated by a correct implementation.",
        "constraints": [
            "Implement the exact lesson concept.",
            "Handle at least one non-trivial edge case.",
            "Return deterministic output.",
        ],
        "exampleInput": "lesson-specific input",
        "exampleOutput": "lesson-specific output",
        "starterCode": _starter_code(language),
    }

    theory = {
        "title": f"{lesson.title} Theory Test",
        "difficulty": "Easy",
        "language": "Theory",
        "kind": "theoretical",
        "questions": [
            {
                "id": "Q1",
                "question": f"Which statement best explains the core concept of '{lesson.title}'?",
                "options": [
                    {"id": "A", "text": "The option that captures the core concept and practical purpose."},
                    {"id": "B", "text": "A partially true option that misses the core requirement."},
                    {"id": "C", "text": "An option describing a different concept."},
                    {"id": "D", "text": "An option claiming the concept has no practical value."},
                ],
                "correctOption": "A",
            },
            {
                "id": "Q2",
                "question": f"In a real project using '{lesson.title}', what is the best first action?",
                "options": [
                    {"id": "A", "text": "Apply the lesson pattern, validate outputs, and review edge cases."},
                    {"id": "B", "text": "Skip validation and rely only on manual checks."},
                    {"id": "C", "text": "Add complexity before defining requirements."},
                    {"id": "D", "text": "Ignore input constraints and infer behavior later."},
                ],
                "correctOption": "A",
            },
            {
                "id": "Q3",
                "question": f"Which mistake is most likely when implementing '{lesson.title}' incorrectly?",
                "options": [
                    {"id": "A", "text": "Ignoring edge cases and assuming ideal input."},
                    {"id": "B", "text": "Using deterministic and testable logic."},
                    {"id": "C", "text": "Comparing output with expected behavior."},
                    {"id": "D", "text": "Documenting assumptions and constraints."},
                ],
                "correctOption": "A",
            },
        ],
    }

    return coding, theory


def _build_prompt(context: LessonContext) -> str:
    lesson = context.lesson
    path_title = context.roadmap.title if context.roadmap else (lesson.path or "Path")
    milestone_title = context.milestone.title if context.milestone else "Milestone"
    lesson_type = context.node.lesson_type if context.node else "interactive"
    lesson_duration = context.node.duration if context.node else None
    language = _language_for_lesson(lesson.path or "", lesson.title or "")
    difficulty = _difficulty(lesson_type, lesson.difficulty)

    return f"""
You are generating assessment content for one specific lesson in an e-learning platform.
Create UNIQUE, LESSON-SPECIFIC content. Do not use generic placeholders.

Lesson context:
- Path slug: {lesson.path}
- Path title: {path_title}
- Milestone: {milestone_title}
- Lesson ID: {lesson.order}
- Lesson title: {lesson.title}
- Lesson type: {lesson_type}
- Lesson duration: {lesson_duration}
- Preferred coding language: {language}
- Difficulty: {difficulty}

Return ONLY valid JSON object with this exact shape:
{{
  "coding": {{
    "title": "string",
    "difficulty": "Easy|Medium|Hard",
    "language": "string",
    "kind": "coding",
    "prompt": "string - concrete task tied to this exact lesson",
    "inputDescription": "string",
    "outputDescription": "string",
    "constraints": ["string", "string", "string"],
    "exampleInput": "string",
    "exampleOutput": "string",
    "starterCode": "string"
  }},
  "theory": {{
    "title": "string",
    "difficulty": "Easy|Medium|Hard",
    "language": "Theory",
    "kind": "theoretical",
    "questions": [
      {{
        "id": "Q1",
        "question": "string - concept check",
        "options": [
          {{"id":"A","text":"string"}},
          {{"id":"B","text":"string"}},
          {{"id":"C","text":"string"}},
          {{"id":"D","text":"string"}}
        ],
        "correctOption": "A|B|C|D"
      }},
      {{
        "id": "Q2",
        "question": "string - applied scenario for this lesson",
        "options": [
          {{"id":"A","text":"string"}},
          {{"id":"B","text":"string"}},
          {{"id":"C","text":"string"}},
          {{"id":"D","text":"string"}}
        ],
        "correctOption": "A|B|C|D"
      }},
      {{
        "id": "Q3",
        "question": "string - common mistake detection",
        "options": [
          {{"id":"A","text":"string"}},
          {{"id":"B","text":"string"}},
          {{"id":"C","text":"string"}},
          {{"id":"D","text":"string"}}
        ],
        "correctOption": "A|B|C|D"
      }}
    ]
  }}
}}

Hard requirements:
- No placeholders such as "sample", "example task", "generic", "lorem".
- The coding prompt must mention concrete operations relevant to this lesson title.
- Keep output compact and practical.
""".strip()


def _normalize_assessment(payload: dict, context: LessonContext) -> tuple[dict, dict]:
    lesson = context.lesson
    lesson_type = context.node.lesson_type if context.node else "interactive"
    fallback_difficulty = _difficulty(lesson_type, lesson.difficulty)
    fallback_language = _language_for_lesson(lesson.path or "", lesson.title or "")

    coding_raw = payload.get("coding") if isinstance(payload.get("coding"), dict) else {}
    theory_raw = payload.get("theory") if isinstance(payload.get("theory"), dict) else {}

    coding = {
        "title": coding_raw.get("title") or f"Coding Practice: {lesson.title}",
        "difficulty": coding_raw.get("difficulty") or fallback_difficulty,
        "language": coding_raw.get("language") or fallback_language,
        "kind": "coding",
        "prompt": coding_raw.get("prompt") or f"Implement a task specific to '{lesson.title}'.",
        "inputDescription": coding_raw.get("inputDescription") or "Input needed to solve the lesson task.",
        "outputDescription": coding_raw.get("outputDescription") or "Expected output for a correct solution.",
        "constraints": coding_raw.get("constraints") if isinstance(coding_raw.get("constraints"), list) and coding_raw.get("constraints") else [
            "Implement the core lesson concept.",
            "Handle one edge case.",
            "Keep output deterministic.",
        ],
        "exampleInput": coding_raw.get("exampleInput") or "lesson specific input",
        "exampleOutput": coding_raw.get("exampleOutput") or "lesson specific output",
        "starterCode": coding_raw.get("starterCode") or _starter_code(coding_raw.get("language") or fallback_language),
    }

    questions = theory_raw.get("questions") if isinstance(theory_raw.get("questions"), list) else []
    normalized_questions = []
    for index in range(3):
        item = questions[index] if index < len(questions) and isinstance(questions[index], dict) else {}
        options = item.get("options") if isinstance(item.get("options"), list) else []
        option_map = {opt.get("id"): opt.get("text") for opt in options if isinstance(opt, dict)}
        normalized_questions.append(
            {
                "id": f"Q{index + 1}",
                "question": item.get("question") or f"Lesson check {index + 1} for {lesson.title}.",
                "options": [
                    {"id": "A", "text": option_map.get("A") or "Correct option."},
                    {"id": "B", "text": option_map.get("B") or "Plausible but incorrect option."},
                    {"id": "C", "text": option_map.get("C") or "Unrelated option."},
                    {"id": "D", "text": option_map.get("D") or "Incorrect option."},
                ],
                "correctOption": item.get("correctOption") if item.get("correctOption") in {"A", "B", "C", "D"} else "A",
            }
        )

    theory = {
        "title": theory_raw.get("title") or f"{lesson.title} Theory Test",
        "difficulty": theory_raw.get("difficulty") or "Easy",
        "language": "Theory",
        "kind": "theoretical",
        "questions": normalized_questions,
    }

    return coding, theory


def _upsert_task(
    session,
    *,
    lesson: Lesson,
    lesson_node_id: int | None,
    kind: str,
    sort_order: int,
    payload: dict,
):
    task = (
        session.query(Task)
        .filter_by(lesson_id=lesson.id, assessment_kind=kind, sort_order=sort_order)
        .first()
    )

    if not task:
        task = Task(
            lesson_id=lesson.id,
            lesson_node_id=lesson_node_id,
            assessment_kind=kind,
            sort_order=sort_order,
            is_required=True,
        )
        session.add(task)

    task.title = payload.get("title") or f"{lesson.title} {kind.title()}"
    task.description = payload.get("prompt") or payload.get("title")
    task.payload_json = json.dumps(payload, ensure_ascii=False)
    task.difficulty = payload.get("difficulty")


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

    if not output:
        query = session.query(Lesson).order_by(Lesson.path.asc(), Lesson.order.asc())
        if path_filter:
            query = query.filter_by(path=path_filter)

        lessons = query.all()
        for lesson in lessons:
            node = session.query(RoadmapNode).filter_by(id=lesson.roadmap_node_id).first() if lesson.roadmap_node_id else None
            roadmap = session.query(Roadmap).filter_by(slug=lesson.path).first() if lesson.path else None
            milestone = session.query(RoadmapNode).filter_by(id=node.parent_id).first() if node and node.parent_id else None
            output.append(LessonContext(lesson=lesson, node=node, roadmap=roadmap, milestone=milestone))

    output.sort(key=lambda item: ((item.lesson.path or ""), item.lesson.order or 0))

    return output


def generate_specific_assessments(
    *,
    path_filter: str | None = None,
    limit: int | None = None,
    overwrite_existing: bool = True,
) -> dict:
    ai_provider = AIProvider()
    if not ai_provider.provider:
        raise AIError("AI provider not configured. Set AI_PROVIDER to 'google' or 'qwen'.")

    processed = 0
    skipped = 0
    generated = 0
    fallback_used = 0

    with SessionLocal() as session:
        contexts = _lesson_contexts(session, path_filter)
        if limit is not None:
            contexts = contexts[:limit]

        total = len(contexts)
        print(f"Generating assessments for {total} lessons...")

        for index, context in enumerate(contexts, start=1):
            lesson = context.lesson

            coding_task = session.query(Task).filter_by(lesson_id=lesson.id, assessment_kind="coding", sort_order=1).first()
            theory_task = session.query(Task).filter_by(lesson_id=lesson.id, assessment_kind="theory", sort_order=2).first()
            has_existing = coding_task is not None and theory_task is not None

            if has_existing and not overwrite_existing:
                skipped += 1
                continue

            if has_existing and overwrite_existing:
                _remove_existing_assessments(session, lesson_id=lesson.id)
                session.flush()

            prompt = _build_prompt(context)
            raw = ""
            parsed = None

            try:
                raw = ai_provider.prompt_ai(prompt)
                parsed = _extract_json_object(raw)
            except Exception:
                parsed = None

            if not parsed:
                coding_payload, theory_payload = _fallback_assessment(context)
                fallback_used += 1
            else:
                coding_payload, theory_payload = _normalize_assessment(parsed, context)

            _upsert_task(
                session,
                lesson=lesson,
                lesson_node_id=lesson.roadmap_node_id,
                kind="coding",
                sort_order=1,
                payload=coding_payload,
            )
            _upsert_task(
                session,
                lesson=lesson,
                lesson_node_id=lesson.roadmap_node_id,
                kind="theory",
                sort_order=2,
                payload=theory_payload,
            )

            # Persist each lesson immediately to avoid losing partial generation work.
            session.commit()

            processed += 1
            generated += 1

            if index % 10 == 0:
                print(f"[{index}/{total}] saved")

            print(f"[{index}/{total}] generated {_safe_lesson_label(context)}")

    return {
        "processed": processed,
        "generated": generated,
        "skipped": skipped,
        "fallbackUsed": fallback_used,
        "pathFilter": path_filter,
    }


def main():
    parser = argparse.ArgumentParser(description="Generate lesson-specific coding/theory assessments and persist to DB")
    parser.add_argument("--path", dest="path_filter", default=None, help="Optional path slug filter (frontend/backend/...)" )
    parser.add_argument("--limit", dest="limit", type=int, default=None, help="Optional max lessons to process")
    parser.add_argument(
        "--overwrite",
        dest="overwrite",
        action="store_true",
        help="Overwrite existing coding/theory tasks",
    )
    parser.add_argument(
        "--no-overwrite",
        dest="overwrite",
        action="store_false",
        help="Skip lessons that already have both coding and theory tasks",
    )
    parser.set_defaults(overwrite=True)

    args = parser.parse_args()
    stats = generate_specific_assessments(
        path_filter=args.path_filter,
        limit=args.limit,
        overwrite_existing=args.overwrite,
    )
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main()
