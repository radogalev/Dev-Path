import json
import re
from datetime import datetime

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import sessionmaker
from ai_logic import ai_router

from db.models.db_config import engine
from db.models.lessons import Lesson
from db.models.roadmap import Roadmap, RoadmapNode
from db.models.tasks import Task
from db.models.theory_results import UserTheoryTestResult
from db.models.users import User, UserLessonProgress, UserTaskProgress

router = APIRouter()
SessionLocal = sessionmaker(bind=engine)


class LecturePayload(BaseModel):
    id: int
    title: str
    duration: str | None = None
    type: str


class MilestonePayload(BaseModel):
    id: int
    title: str
    description: str | None = None
    lectures: list[LecturePayload]


class RoadmapPayload(BaseModel):
    title: str
    description: str | None = None
    color: str | None = None
    milestones: list[MilestonePayload]


class ProblemPayload(BaseModel):
    id: str | None = None
    pathId: str | None = None
    milestoneId: int
    lectureId: int | None = None
    title: str
    difficulty: str | None = None
    language: str | None = None
    prompt: str
    inputDescription: str | None = None
    outputDescription: str | None = None
    constraints: list[str] | None = None
    exampleInput: str | None = None
    exampleOutput: str | None = None
    starterCode: str | None = None


class LearningBootstrapPayload(BaseModel):
    roadmaps: dict[str, RoadmapPayload]
    problems: list[ProblemPayload] = []


def _normalize_text(value: str) -> str:
    return (value or "").lower().strip()


def _duration_to_minutes(value: str | None) -> int | None:
    if not value:
        return None

    lowered = value.lower().strip()
    try:
        if "hr" in lowered:
            amount = float(lowered.split("hr")[0].strip())
            return int(amount * 60)
        if "min" in lowered:
            amount = float(lowered.split("min")[0].strip())
            return int(amount)
        return int(float(lowered))
    except Exception:
        return None


def _infer_topics(lesson_title: str) -> list[str]:
    title = _normalize_text(lesson_title)
    topic_map = {
        "html": ["Semantic structure", "Accessibility", "Forms and validation"],
        "css": ["Selectors", "Layout", "Responsive design"],
        "javascript": ["Language fundamentals", "DOM and events", "Async programming"],
        "react": ["Components", "State and hooks", "Routing and architecture"],
        "api": ["HTTP and contracts", "Validation", "Error handling"],
        "database": ["Schema modeling", "Queries and joins", "Performance"],
        "testing": ["Unit tests", "Integration tests", "Automation"],
        "security": ["Threats", "Auth patterns", "Secure coding"],
    }

    for keyword, topics in topic_map.items():
        if keyword in title:
            return topics

    return ["Core concepts", "Implementation", "Best practices"]


def _infer_coding_language(path_slug: str, lesson_title: str) -> str:
    title = _normalize_text(lesson_title)
    path = _normalize_text(path_slug)

    if re.search(r"\bhtml\b|\bsemantic\b|\baria\b", title):
        return "HTML"
    if re.search(r"\bcss\b|\bflexbox\b|\bgrid\b|\bmedia quer(?:y|ies)?\b|\bresponsive\b", title):
        return "CSS"
    if re.search(r"\btypescript\b", title):
        return "TypeScript"
    if re.search(r"\breact\b|\bjsx\b|\bhook\b|\bredux\b|\brouter\b|\bcomponent\b", title):
        return "React (JSX)"
    if re.search(r"\bpython\b|\bpytest\b|\bfastapi\b|\bsqlalchemy\b|\balembic\b", title):
        return "Python"
    if re.search(
        r"\bml\b|\bmachine learning\b|\bscikit\b|\bsklearn\b|\bpandas\b|\bnumpy\b|\bmatplotlib\b|\bseaborn\b|\bmodel\b|\bcalculus\b|\blinear algebra\b|\bstatistics\b|\bprobability\b|\bgradient\b",
        title,
    ):
        return "Python"
    if re.search(r"\bexpress(?:\.js)?\b|\bnode(?:\.js)?\b|\bjavascript\b|\bnpm\b|\bdom\b|\bevent\b|\bpromise\b|\bfetch\b", title):
        return "JavaScript"
    if re.search(r"\bmongo(?:db)?\b|\bmongoose\b", title):
        return "JavaScript"
    if re.search(r"\bjwt\b|\boauth\b|\brbac\b|\bcors\b|\bcsrf\b|\bxss\b|\bsanitization\b|\bauth(?:entication)?\b", title):
        return "JavaScript"
    if re.search(r"\bsql\b|\bpostgres\b|\bjoin(?:s)?\b|\bschema\b|\bindex(?:es)?\b", title):
        return "SQL"
    if re.search(r"\bgit\b|\bgithub\b|\bdocker\b|\bci/cd\b|\bcli\b", title):
        return "Shell"

    if path == "backend" and re.search(
        r"\bconditionals\b|\bloops\b|\bfunctions\b|\bdecorators\b|\bgenerators\b|\barrays\b|\blinked\b|\bstacks\b|\bqueues\b|\btrees\b|\bsorting\b|\bsearching\b|\bbig o\b|\boop\b|\bfile i/o\b",
        title,
    ):
        return "Python"

    if path == "data":
        return "Python"

    if path == "database":
        return "SQL"

    if path == "cloud":
        return "Shell"

    if path == "backend":
        return "JavaScript"
    if path == "frontend":
        return "JavaScript"
    if path == "fullstack":
        return "JavaScript"
    if path == "mobile":
        return "TypeScript"

    return "JavaScript"


def _language_template(language: str) -> dict:
    normalized = _normalize_text(language)

    if normalized == "html":
        return {
            "inputDescription": "Use the starter markup and adapt it to the lesson requirements.",
            "outputDescription": "A valid semantic HTML snippet that demonstrates the target concept.",
            "exampleInput": "Starter HTML template",
            "exampleOutput": "Accessible and semantically correct HTML",
            "starterCode": "<main>\n  <section>\n    <h1>Lesson Practice</h1>\n    <p>Implement the required HTML structure here.</p>\n  </section>\n</main>",
        }

    if normalized == "css":
        return {
            "inputDescription": "Use the starter stylesheet and implement styles for the lesson concept.",
            "outputDescription": "A stylesheet that clearly demonstrates the required CSS behavior.",
            "exampleInput": "Starter CSS rules",
            "exampleOutput": "Working CSS for the requested layout/styling concept",
            "starterCode": ".container {\n  display: block;\n}\n\n/* Add styles for this lesson */",
        }

    if normalized == "typescript":
        return {
            "inputDescription": "Implement the function and types needed for this task.",
            "outputDescription": "Type-safe implementation that solves the lesson problem.",
            "exampleInput": "Input data matching declared types",
            "exampleOutput": "Correct output with strict typing",
            "starterCode": "type Input = unknown;\n\nfunction solve(input: Input): unknown {\n  // Implement lesson logic\n  return input;\n}",
        }

    if normalized in {"react (jsx)", "jsx", "react"}:
        return {
            "inputDescription": "Extend the component starter and implement the lesson behavior.",
            "outputDescription": "A React component that demonstrates the required concept.",
            "exampleInput": "Starter React component",
            "exampleOutput": "Rendered component with working lesson-specific behavior",
            "starterCode": "import { useState } from 'react';\n\nexport default function LessonPractice() {\n  const [value, setValue] = useState('');\n\n  return (\n    <div>\n      {/* Implement the lesson concept here */}\n      <input value={value} onChange={(event) => setValue(event.target.value)} />\n    </div>\n  );\n}",
        }

    if normalized == "python":
        return {
            "inputDescription": "Implement the Python function for the described scenario.",
            "outputDescription": "A correct Python solution that handles the core and edge cases.",
            "exampleInput": "Sample Python input values",
            "exampleOutput": "Expected function return value",
            "starterCode": "def solve(input_data):\n    # Implement lesson logic\n    return input_data",
        }

    if normalized == "sql":
        return {
            "inputDescription": "Use SQL statements to solve the data task.",
            "outputDescription": "A correct SQL query/script for the requested operation.",
            "exampleInput": "Tables and sample rows",
            "exampleOutput": "Result set matching the task requirements",
            "starterCode": "SELECT *\nFROM table_name\nWHERE 1 = 1;",
        }

    if normalized == "shell":
        return {
            "inputDescription": "Use terminal commands/scripts to complete the workflow.",
            "outputDescription": "A valid sequence of commands that performs the requested task.",
            "exampleInput": "Repository or project state",
            "exampleOutput": "Command output/state after successful execution",
            "starterCode": "# Add the commands required for this lesson\n",
        }

    return {
        "inputDescription": "Input data needed by your implementation.",
        "outputDescription": "Expected output produced by your solution.",
        "exampleInput": "sample input",
        "exampleOutput": "sample output",
        "starterCode": "function solve(input) {\n  // Implement lesson logic\n  return input;\n}",
    }
def _default_hard_challenge(selected_path: str, tasks_solved: int) -> dict:
    language = "Python" if _normalize_text(selected_path) == "backend" else "JavaScript"
    return {
        "title": "Runtime Hard Challenge",
        "difficulty": "Hard",
        "language": language,
        "prompt": (
            f"You solved {tasks_solved} tasks and unlocked a harder challenge. "
            "Build a solution that processes multiple query types efficiently and validates malformed inputs."
        ),
        "inputDescription": "A collection of operations with parameters.",
        "outputDescription": "An ordered list of results for each operation.",
        "constraints": [
            "Handle invalid input gracefully.",
            "Optimize for large datasets where possible.",
            "Keep the implementation modular and testable.",
        ],
        "exampleInput": "operations = [{'type': 'sum', 'a': 2, 'b': 3}, {'type': 'mul', 'a': 4, 'b': 5}]",
        "exampleOutput": "[5, 20]",
        "starterCode": "",
    }


def _parse_challenge_json(raw_text: str) -> dict | None:
    if not raw_text:
        return None

    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
        cleaned = re.sub(r"```$", "", cleaned).strip()

    try:
        parsed = json.loads(cleaned)
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        pass

    start_idx = cleaned.find("{")
    end_idx = cleaned.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        try:
            parsed = json.loads(cleaned[start_idx : end_idx + 1])
            return parsed if isinstance(parsed, dict) else None
        except Exception:
            return None

    return None


def _generate_runtime_hard_challenge(selected_path: str, tasks_solved: int) -> dict:
    fallback = _default_hard_challenge(selected_path, tasks_solved)
    stack = "backend" if _normalize_text(selected_path) == "backend" else "frontend"
    prompt = (
        "Generate exactly one hard coding challenge and return JSON only. "
        "Required keys: title, difficulty, language, prompt, inputDescription, outputDescription, "
        "constraints, exampleInput, exampleOutput, starterCode. "
        "difficulty must be Hard and constraints must be an array of strings. "
        f"Target stack: {stack}. Student solved tasks: {tasks_solved}. "
        "Make the challenge interview-level and practical."
    )

    try:
        ai_text = ai_router.provider.prompt_ai(prompt)
        parsed = _parse_challenge_json(ai_text)
        if not parsed:
            return fallback

        return {
            "title": parsed.get("title") or fallback["title"],
            "difficulty": "Hard",
            "language": parsed.get("language") or fallback["language"],
            "prompt": parsed.get("prompt") or fallback["prompt"],
            "inputDescription": parsed.get("inputDescription") or fallback["inputDescription"],
            "outputDescription": parsed.get("outputDescription") or fallback["outputDescription"],
            "constraints": parsed.get("constraints") if isinstance(parsed.get("constraints"), list) else fallback["constraints"],
            "exampleInput": parsed.get("exampleInput") or fallback["exampleInput"],
            "exampleOutput": parsed.get("exampleOutput") or fallback["exampleOutput"],
            "starterCode": parsed.get("starterCode") or fallback["starterCode"],
        }
    except Exception:
        return fallback


def _build_lesson_content(path_title: str, milestone_title: str, lesson_title: str, lesson_type: str) -> dict:
    topics = _infer_topics(lesson_title)
    overview = (
        f"{lesson_title} is part of the {path_title} path in {milestone_title}. "
        "This lesson focuses on practical concepts and production-ready usage."
    )

    goal_by_type = {
        "video": "Understand and explain the concept clearly.",
        "interactive": "Practice by implementing the core concept.",
        "project": "Ship a complete feature using this concept.",
    }
    goal = goal_by_type.get((lesson_type or "").lower(), "Learn and apply the lesson concept.")

    explanation = [
        f"Start with why {lesson_title.lower()} matters in real projects.",
        "Identify the core patterns and avoid common mistakes.",
        "Apply the concept in a practical exercise and review trade-offs.",
    ]

    resources = [
        {"label": "MDN Web Docs", "url": "https://developer.mozilla.org/"},
        {"label": "freeCodeCamp", "url": "https://www.freecodecamp.org/learn/"},
        {"label": "W3Schools Reference", "url": "https://www.w3schools.com/"},
    ]

    return {
        "overview": overview,
        "goal": goal,
        "topics": topics,
        "explanation": explanation,
        "resources": resources,
    }


def _generate_coding_problem(path_slug: str, lesson_title: str, lesson_type: str) -> dict:
    difficulty = "Hard" if lesson_type == "project" else "Medium" if lesson_type == "interactive" else "Easy"
    language = _infer_coding_language(path_slug, lesson_title)
    template = _language_template(language)
    return {
        "title": f"Coding Practice: {lesson_title}",
        "difficulty": difficulty,
        "language": language,
        "kind": "coding",
        "prompt": (
            f"Create a focused solution that demonstrates '{lesson_title}'. "
            "Your solution should apply the core lesson technique in one realistic scenario."
        ),
        "inputDescription": template["inputDescription"],
        "outputDescription": template["outputDescription"],
        "constraints": [
            "Keep the solution focused on the lesson topic",
            "Use clear naming and readable structure",
            "Handle one basic edge case in your implementation",
        ],
        "exampleInput": template["exampleInput"],
        "exampleOutput": template["exampleOutput"],
        "starterCode": template["starterCode"],
    }


def _apply_coding_payload_defaults(
    payload: dict,
    path_slug: str,
    lesson_title: str,
    lesson_type: str,
    *,
    force_language: bool = False,
) -> dict:
    merged = dict(payload or {})
    generated_defaults = _generate_coding_problem(path_slug, lesson_title, lesson_type)

    if force_language:
        previous_language = _normalize_text(merged.get("language") or "")
        target_language = _normalize_text(generated_defaults.get("language") or "")
        merged["language"] = generated_defaults.get("language")

        if previous_language != target_language and target_language != "javascript":
            for field in [
                "title",
                "prompt",
                "inputDescription",
                "outputDescription",
                "constraints",
                "exampleInput",
                "exampleOutput",
                "starterCode",
            ]:
                merged[field] = generated_defaults.get(field)

        starter_code = merged.get("starterCode") or ""
        if target_language != "javascript" and not _is_starter_aligned_with_language(target_language, starter_code):
            for field in ["inputDescription", "outputDescription", "exampleInput", "exampleOutput", "starterCode"]:
                merged[field] = generated_defaults.get(field)

    for key, value in generated_defaults.items():
        if key == "kind":
            continue

        current = merged.get(key)
        if current is None:
            merged[key] = value
            continue

        if isinstance(current, str) and not current.strip():
            merged[key] = value
            continue

        if isinstance(current, list) and len(current) == 0:
            merged[key] = value

    merged["kind"] = "coding"
    return merged


def _deserialize_payload(raw_payload: str | None) -> dict:
    if not raw_payload:
        return {}

    try:
        parsed = json.loads(raw_payload)
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        return {}


def _is_starter_aligned_with_language(language: str, starter_code: str) -> bool:
    starter = starter_code or ""
    lowered = starter.lower()
    normalized_language = _normalize_text(language)

    if not starter.strip():
        return False

    if normalized_language == "python":
        return "def " in lowered
    if normalized_language == "sql":
        return any(token in lowered for token in ["select", "insert", "update", "delete"])
    if normalized_language == "shell":
        return starter.strip().startswith("#") or any(token in lowered for token in ["git ", "npm ", "docker "])
    if normalized_language == "html":
        return "<" in starter and ">" in starter
    if normalized_language == "css":
        return "{" in starter and "}" in starter
    if normalized_language == "typescript":
        return "type " in lowered or ("function" in lowered and ":" in starter)
    if normalized_language in {"react (jsx)", "jsx", "react"}:
        return "return (" in lowered or "usestate" in lowered
    if normalized_language == "javascript":
        return "function" in lowered or "=>" in lowered

    return True


def _backfill_assessments_for_lessons(session, *, path_filter: str | None = None) -> dict:
    lessons_query = session.query(Lesson)
    if path_filter:
        lessons_query = lessons_query.filter_by(path=path_filter)

    lessons = lessons_query.order_by(Lesson.path.asc(), Lesson.order.asc()).all()

    coding_created = 0
    coding_updated = 0
    theory_created = 0
    lessons_processed = 0

    for lesson in lessons:
        if not lesson.roadmap_node_id:
            continue

        lesson_node = session.query(RoadmapNode).filter_by(id=lesson.roadmap_node_id).first()
        if not lesson_node:
            continue

        path_slug = lesson.path or ""

        coding_task = (
            session.query(Task)
            .filter_by(lesson_id=lesson.id, assessment_kind="coding", sort_order=1)
            .first()
        )
        existing_coding_payload = _deserialize_payload(coding_task.payload_json) if coding_task else {}

        if not existing_coding_payload:
            coding_payload = _generate_coding_problem(path_slug, lesson.title, lesson_node.lesson_type or "interactive")
            coding_created += 1
        else:
            coding_payload = _apply_coding_payload_defaults(
                existing_coding_payload,
                path_slug,
                lesson.title,
                lesson_node.lesson_type or "interactive",
                force_language=True,
            )
            coding_updated += 1

        coding_payload.setdefault("difficulty", lesson.difficulty or "Easy")

        _upsert_assessment(
            session,
            lesson=lesson,
            lesson_node_id=lesson_node.id,
            sort_order=1,
            kind="coding",
            payload=coding_payload,
        )

        theory_task = (
            session.query(Task)
            .filter_by(lesson_id=lesson.id, assessment_kind="theory", sort_order=2)
            .first()
        )
        if not theory_task:
            theory_created += 1

        theory_payload = _generate_theory_test(lesson.title)
        _upsert_assessment(
            session,
            lesson=lesson,
            lesson_node_id=lesson_node.id,
            sort_order=2,
            kind="theory",
            payload=theory_payload,
        )

        lessons_processed += 1

    return {
        "lessonsProcessed": lessons_processed,
        "codingCreated": coding_created,
        "codingUpdated": coding_updated,
        "theoryCreated": theory_created,
    }


def _generate_theory_test(lesson_title: str) -> dict:

    return {
        "title": f"{lesson_title} Theory Test",
        "difficulty": "Easy",
        "language": "Theory",
        "kind": "theoretical",
        "questions": [
            {
                "id": "Q1",
                "question": f"Which statement best describes {lesson_title}?",
                "options": [
                    {"id": "A", "text": f"A correct explanation of {lesson_title} and its practical use."},
                    {"id": "B", "text": "A partially correct statement missing the core idea."},
                    {"id": "C", "text": "A description of an unrelated concept."},
                    {"id": "D", "text": "A claim that this concept is never useful."},
                ],
                "correctOption": "A",
            },
            {
                "id": "Q2",
                "question": f"Why is {lesson_title} important when building applications?",
                "options": [
                    {"id": "A", "text": "It helps design correct and maintainable solutions."},
                    {"id": "B", "text": "It removes the need for testing."},
                    {"id": "C", "text": "It applies only to backend systems."},
                    {"id": "D", "text": "It is not relevant in production."},
                ],
                "correctOption": "A",
            },
            {
                "id": "Q3",
                "question": f"Choose the most accurate understanding of {lesson_title}.",
                "options": [
                    {"id": "A", "text": "A practical and accurate explanation."},
                    {"id": "B", "text": "A vague statement with key gaps."},
                    {"id": "C", "text": "A definition of another topic."},
                    {"id": "D", "text": "A reason to ignore the concept."},
                ],
                "correctOption": "A",
            },
        ],
    }


def _upsert_assessment(
    session,
    *,
    lesson: Lesson,
    lesson_node_id: int,
    sort_order: int,
    kind: str,
    payload: dict,
) -> None:
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
    task.payload_json = json.dumps(payload)
    task.difficulty = payload.get("difficulty")


@router.post("/learning/bootstrap")
async def bootstrap_learning_data(payload: LearningBootstrapPayload):
    if not payload.roadmaps:
        return {"success": False, "message": "No roadmap data supplied"}

    seeded_paths = 0
    seeded_lessons = 0

    try:
        with SessionLocal() as session:
            for path_slug, roadmap_payload in payload.roadmaps.items():
                roadmap = session.query(Roadmap).filter_by(slug=path_slug).first()
                if not roadmap:
                    roadmap = Roadmap(
                        slug=path_slug,
                        title=roadmap_payload.title,
                        description=roadmap_payload.description,
                        color=roadmap_payload.color,
                    )
                    session.add(roadmap)

                roadmap.title = roadmap_payload.title
                roadmap.description = roadmap_payload.description
                roadmap.color = roadmap_payload.color
                session.flush()

                for milestone_index, milestone in enumerate(roadmap_payload.milestones, start=1):
                    milestone_node = (
                        session.query(RoadmapNode)
                        .filter_by(
                            roadmap_id=roadmap.id,
                            node_type="milestone",
                            external_id=milestone.id,
                        )
                        .first()
                    )

                    if not milestone_node:
                        milestone_node = RoadmapNode(
                            roadmap_id=roadmap.id,
                            node_type="milestone",
                            external_id=milestone.id,
                            title=milestone.title,
                            description=milestone.description,
                            duration=None,
                            lesson_type=None,
                            sort_order=milestone_index,
                        )
                        session.add(milestone_node)

                    milestone_node.parent_id = None
                    milestone_node.title = milestone.title
                    milestone_node.description = milestone.description
                    milestone_node.sort_order = milestone_index
                    milestone_node.duration = None
                    milestone_node.lesson_type = None
                    session.flush()

                    for lecture_index, lecture in enumerate(milestone.lectures, start=1):
                        lecture_node = (
                            session.query(RoadmapNode)
                            .filter_by(
                                roadmap_id=roadmap.id,
                                node_type="lesson",
                                external_id=lecture.id,
                            )
                            .first()
                        )

                        if not lecture_node:
                            lecture_node = RoadmapNode(
                                roadmap_id=roadmap.id,
                                node_type="lesson",
                                external_id=lecture.id,
                                title=lecture.title,
                                description=None,
                                duration=lecture.duration,
                                lesson_type=lecture.type,
                                sort_order=lecture_index,
                            )
                            session.add(lecture_node)

                        lecture_node.parent_id = milestone_node.id
                        lecture_node.title = lecture.title
                        lecture_node.description = None
                        lecture_node.duration = lecture.duration
                        lecture_node.lesson_type = lecture.type
                        lecture_node.sort_order = lecture_index
                        session.flush()

                        lesson = session.query(Lesson).filter_by(path=path_slug, order=lecture.id).first()
                        if not lesson:
                            lesson = Lesson(path=path_slug, order=lecture.id, title=lecture.title)
                            session.add(lesson)

                        structured_content = _build_lesson_content(
                            path_title=roadmap_payload.title,
                            milestone_title=milestone.title,
                            lesson_title=lecture.title,
                            lesson_type=lecture.type,
                        )

                        lesson.roadmap_node_id = lecture_node.id
                        lesson.title = lecture.title
                        lesson.content = json.dumps(structured_content)
                        lesson.overview = structured_content["overview"]
                        lesson.goal = structured_content["goal"]
                        lesson.topics_json = json.dumps(structured_content["topics"])
                        lesson.explanation_json = json.dumps(structured_content["explanation"])
                        lesson.resources_json = json.dumps(structured_content["resources"])
                        lesson.duration_minutes = _duration_to_minutes(lecture.duration)
                        lesson.difficulty = "Hard" if lecture.type == "project" else "Medium" if lecture.type == "interactive" else "Easy"
                        seeded_lessons += 1

                seeded_paths += 1

            session.commit()

        return {
            "success": True,
            "paths": seeded_paths,
            "lessons": seeded_lessons,
            "message": "Learning content persisted to database",
        }
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": str(error)},
        )


class BackfillAssessmentsPayload(BaseModel):
    pathId: str | None = None


@router.post("/learning/assessments/backfill")
async def backfill_learning_assessments(payload: BackfillAssessmentsPayload):
    try:
        with SessionLocal() as session:
            stats = _backfill_assessments_for_lessons(session, path_filter=payload.pathId)
            session.commit()

        return {
            "success": True,
            "message": "Assessments generated/backfilled",
            **stats,
        }
    except Exception as error:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": str(error)},
        )


@router.get("/learning/roadmaps")
async def get_roadmaps():
    with SessionLocal() as session:
        roadmaps = session.query(Roadmap).order_by(Roadmap.title.asc()).all()
        return {
            "success": True,
            "roadmaps": [
                {
                    "pathId": roadmap.slug,
                    "title": roadmap.title,
                    "description": roadmap.description,
                    "color": roadmap.color,
                }
                for roadmap in roadmaps
            ],
        }


@router.get("/learning/roadmaps/{path_id}")
async def get_roadmap(path_id: str):
    with SessionLocal() as session:
        roadmap = session.query(Roadmap).filter_by(slug=path_id).first()
        if not roadmap:
            return {"success": False, "message": "Roadmap not found"}

        milestones = (
            session.query(RoadmapNode)
            .filter_by(roadmap_id=roadmap.id, node_type="milestone")
            .order_by(RoadmapNode.sort_order.asc())
            .all()
        )

        milestone_payload = []
        for milestone in milestones:
            lessons = (
                session.query(RoadmapNode)
                .filter_by(parent_id=milestone.id, node_type="lesson")
                .order_by(RoadmapNode.sort_order.asc())
                .all()
            )

            milestone_payload.append(
                {
                    "id": milestone.external_id,
                    "title": milestone.title,
                    "description": milestone.description,
                    "lectures": [
                        {
                            "id": lesson.external_id,
                            "title": lesson.title,
                            "duration": lesson.duration,
                            "type": lesson.lesson_type,
                        }
                        for lesson in lessons
                    ],
                }
            )

        return {
            "success": True,
            "roadmap": {
                "pathId": roadmap.slug,
                "title": roadmap.title,
                "description": roadmap.description,
                "color": roadmap.color,
                "milestones": milestone_payload,
            },
        }


@router.get("/learning/lesson/{path_id}/{lecture_id}")
async def get_lesson_bundle(path_id: str, lecture_id: int):
    with SessionLocal() as session:
        roadmap = session.query(Roadmap).filter_by(slug=path_id).first()
        lesson = session.query(Lesson).filter_by(path=path_id, order=lecture_id).first()

        if not roadmap or not lesson or not lesson.roadmap_node_id:
            return {"success": False, "message": "Lesson not found"}

        lesson_node = session.query(RoadmapNode).filter_by(id=lesson.roadmap_node_id).first()
        milestone_node = session.query(RoadmapNode).filter_by(id=lesson_node.parent_id).first() if lesson_node else None

        tasks = session.query(Task).filter_by(lesson_id=lesson.id).order_by(Task.sort_order.asc()).all()

        coding = None
        theory = None
        for task in tasks:
            parsed = {}
            if task.payload_json:
                try:
                    parsed = json.loads(task.payload_json)
                except Exception:
                    parsed = {}

            if task.assessment_kind == "coding":
                coding = parsed
            if task.assessment_kind == "theory":
                theory = parsed

        content = {}
        if lesson.content:
            try:
                content = json.loads(lesson.content)
            except Exception:
                content = {}

        topics = []
        if lesson.topics_json:
            try:
                topics = json.loads(lesson.topics_json)
            except Exception:
                topics = []
        if not isinstance(topics, list):
            topics = []
        if not topics:
            topics = content.get("topics", []) if isinstance(content.get("topics"), list) else []

        explanation = []
        if lesson.explanation_json:
            try:
                explanation = json.loads(lesson.explanation_json)
            except Exception:
                explanation = []
        if not isinstance(explanation, list):
            explanation = []
        if not explanation:
            explanation = content.get("explanation", []) if isinstance(content.get("explanation"), list) else []

        resources = []
        if lesson.resources_json:
            try:
                resources = json.loads(lesson.resources_json)
            except Exception:
                resources = []
        if not isinstance(resources, list):
            resources = []
        if not resources:
            resources = content.get("resources", []) if isinstance(content.get("resources"), list) else []

        sections = content.get("sections", []) if isinstance(content.get("sections"), list) else []
        if not sections:
            if isinstance(content.get("parts"), list):
                sections = content.get("parts", [])
            elif isinstance(content.get("lessonParts"), list):
                sections = content.get("lessonParts", [])

        # Keep API output render-ready even when legacy/generated lessons only have explanation paragraphs.
        if not sections and explanation:
            synthesized_sections = []
            for idx, item in enumerate(explanation, start=1):
                if isinstance(item, str):
                    text = item.strip()
                elif isinstance(item, dict):
                    text = str(item.get("content") or item.get("text") or item.get("body") or "").strip()
                else:
                    text = ""

                if not text:
                    continue

                synthesized_sections.append(
                    {
                        "type": "text",
                        "title": f"Part {idx}",
                        "content": text,
                    }
                )

            sections = synthesized_sections

        return {
            "success": True,
            "lesson": {
                "id": lesson.order,
                "title": lesson.title,
                "duration": lesson_node.duration if lesson_node else None,
                "type": lesson_node.lesson_type if lesson_node else None,
                "pathId": path_id,
                "pathTitle": roadmap.title,
                "milestone": {
                    "id": milestone_node.external_id if milestone_node else None,
                    "title": milestone_node.title if milestone_node else "",
                    "description": milestone_node.description if milestone_node else "",
                },
                "content": {
                    "overview": lesson.overview or content.get("overview") or "",
                    "goal": lesson.goal or content.get("goal") or "",
                    "topics": topics,
                    "explanation": explanation,
                    "sections": sections,
                    "resources": resources,
                },
                "lessonTable": {
                    "id": lesson.id,
                    "roadmapNodeId": lesson.roadmap_node_id,
                    "title": lesson.title,
                    "path": lesson.path,
                    "order": lesson.order,
                    "content": content if isinstance(content, dict) else {},
                    "overview": lesson.overview or "",
                    "goal": lesson.goal or "",
                    "topics": topics,
                    "explanation": explanation,
                    "resources": resources,
                    "difficulty": lesson.difficulty,
                    "durationMinutes": lesson.duration_minutes,
                },
                "codingProblem": coding,
                "theoryTest": theory,
            },
        }


@router.get("/learning/dashboard/{user_id}")
async def get_dashboard_learning_summary(user_id: int):
    with SessionLocal() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return {"success": False, "message": "User not found"}

        selected_path = user.selected_path or "frontend"
        roadmap = session.query(Roadmap).filter_by(slug=selected_path).first()
        if not roadmap:
            return {
                "success": False,
                "message": "Roadmap not found for selected path",
                "selectedPath": selected_path,
            }

        milestones = (
            session.query(RoadmapNode)
            .filter_by(roadmap_id=roadmap.id, node_type="milestone")
            .order_by(RoadmapNode.sort_order.asc())
            .all()
        )

        milestone_payload = []
        total_lessons = 0
        for milestone in milestones:
            lesson_nodes = (
                session.query(RoadmapNode)
                .filter_by(parent_id=milestone.id, node_type="lesson")
                .order_by(RoadmapNode.sort_order.asc())
                .all()
            )
            total_lessons += len(lesson_nodes)
            milestone_payload.append(
                {
                    "id": milestone.external_id,
                    "title": milestone.title,
                    "description": milestone.description,
                    "lectures": [
                        {
                            "id": node.external_id,
                            "title": node.title,
                            "duration": node.duration,
                            "type": node.lesson_type,
                        }
                        for node in lesson_nodes
                    ],
                }
            )

        current_lecture = user.current_lecture or 1
        active_lesson = session.query(Lesson).filter_by(path=selected_path, order=current_lecture).first()
        active_coding_problem = None
        active_theory_test = None

        if active_lesson:
            active_tasks = (
                session.query(Task)
                .filter_by(lesson_id=active_lesson.id)
                .order_by(Task.sort_order.asc())
                .all()
            )
            for task in active_tasks:
                parsed_payload = _deserialize_payload(task.payload_json)
                if task.assessment_kind == "coding":
                    active_coding_problem = parsed_payload or None
                elif task.assessment_kind == "theory":
                    active_theory_test = parsed_payload or None

        completed_count = (
            session.query(UserLessonProgress)
            .filter_by(user_id=user.id, is_completed=True)
            .join(Lesson, Lesson.id == UserLessonProgress.lesson_id)
            .filter(Lesson.path == selected_path)
            .count()
        )

        tasks_solved = (
            session.query(UserTaskProgress)
            .filter_by(user_id=user.id, is_completed=True)
            .count()
        )

        return {
            "success": True,
            "dashboard": {
                "selectedPath": selected_path,
                "roadmap": {
                    "title": roadmap.title,
                    "description": roadmap.description,
                    "milestones": milestone_payload,
                },
                "progress": {
                    "currentLecture": current_lecture,
                    "totalLessons": total_lessons,
                    "completedLessons": max(completed_count, max(current_lecture - 1, 0)),
                    "tasksSolved": tasks_solved,
                    "shouldPromptHardTask": tasks_solved > 3,
                    "activeLessonTitle": active_lesson.title if active_lesson else None,
                },
                "activeLesson": {
                    "id": active_lesson.order if active_lesson else current_lecture,
                    "title": active_lesson.title if active_lesson else None,
                    "codingProblem": active_coding_problem,
                    "theoryTest": active_theory_test,
                },
            },
        }


@router.get("/learning/dashboard/hard-challenge/{user_id}")
async def get_dashboard_hard_challenge(user_id: int):
    with SessionLocal() as session:
        user = session.query(User).filter_by(id=user_id).first()
        if not user:
            return {"success": False, "message": "User not found"}

        tasks_solved = (
            session.query(UserTaskProgress)
            .filter_by(user_id=user.id, is_completed=True)
            .count()
        )

        if tasks_solved <= 3:
            return {
                "success": True,
                "shouldPrompt": False,
                "tasksSolved": tasks_solved,
                "challenge": None,
            }

        challenge = _generate_runtime_hard_challenge(user.selected_path or "frontend", tasks_solved)
        return {
            "success": True,
            "shouldPrompt": True,
            "tasksSolved": tasks_solved,
            "challenge": challenge,
        }


class CompleteLessonPayload(BaseModel):
    userId: int
    pathId: str
    lessonId: int


class CompleteTheoryTestPayload(BaseModel):
    userId: int
    pathId: str
    lessonId: int
    score: int
    totalQuestions: int
    passed: bool


@router.post("/learning/progress/complete-lesson")
async def complete_lesson(payload: CompleteLessonPayload):
    with SessionLocal() as session:
        user = session.query(User).filter_by(id=payload.userId).first()
        lesson = session.query(Lesson).filter_by(path=payload.pathId, order=payload.lessonId).first()
        if not user or not lesson:
            return {"success": False, "message": "User or lesson not found"}

        record = session.query(UserLessonProgress).filter_by(user_id=user.id, lesson_id=lesson.id).first()
        if not record:
            record = UserLessonProgress(user_id=user.id, lesson_id=lesson.id)
            session.add(record)

        record.is_completed = True
        record.completed_at = datetime.utcnow()
        user.current_lecture = max(user.current_lecture or 1, payload.lessonId + 1)

        session.commit()

        return {
            "success": True,
            "message": "Lesson completion stored",
            "currentLecture": user.current_lecture,
        }


@router.post("/learning/progress/complete-theory-test")
async def complete_theory_test(payload: CompleteTheoryTestPayload):
    with SessionLocal() as session:
        user = session.query(User).filter_by(id=payload.userId).first()
        lesson = session.query(Lesson).filter_by(path=payload.pathId, order=payload.lessonId).first()

        if not user or not lesson:
            return {"success": False, "message": "User or lesson not found"}

        result = (
            session.query(UserTheoryTestResult)
            .filter_by(user_id=user.id, path_id=payload.pathId, lesson_id=payload.lessonId)
            .first()
        )
        if not result:
            result = UserTheoryTestResult(
                user_id=user.id,
                path_id=payload.pathId,
                lesson_id=payload.lessonId,
                score=payload.score,
                total_questions=payload.totalQuestions,
                passed=payload.passed,
            )
            session.add(result)
        else:
            result.score = payload.score
            result.total_questions = payload.totalQuestions
            result.passed = payload.passed

        if payload.passed:
            progress = session.query(UserLessonProgress).filter_by(user_id=user.id, lesson_id=lesson.id).first()
            if not progress:
                progress = UserLessonProgress(user_id=user.id, lesson_id=lesson.id)
                session.add(progress)

            progress.is_completed = True
            progress.completed_at = datetime.utcnow()
            user.current_lecture = max(user.current_lecture or 1, payload.lessonId + 1)

        session.commit()
        session.refresh(user)

        return {
            "success": True,
            "message": "Theory test result saved",
            "result": {
                "score": result.score,
                "totalQuestions": result.total_questions,
                "passed": result.passed,
            },
            "currentLecture": user.current_lecture,
        }


@router.get("/learning/leaderboard")
async def get_learning_leaderboard(limit: int = 50):
    with SessionLocal() as session:
        # Ensure table exists when DB schema was created before this feature.
        UserTaskProgress.__table__.create(bind=engine, checkfirst=True)

        safe_limit = max(1, min(int(limit or 50), 200))

        lesson_counts = {
            row[0]: row[1]
            for row in (
                session.query(UserLessonProgress.user_id, func.count(UserLessonProgress.id))
                .filter(UserLessonProgress.is_completed == True)
                .group_by(UserLessonProgress.user_id)
                .all()
            )
        }

        task_counts = {
            row[0]: row[1]
            for row in (
                session.query(UserTaskProgress.user_id, func.count(UserTaskProgress.id))
                .filter(UserTaskProgress.is_completed == True)
                .group_by(UserTaskProgress.user_id)
                .all()
            )
        }

        theory_counts = {
            row[0]: row[1]
            for row in (
                session.query(UserTheoryTestResult.user_id, func.count(UserTheoryTestResult.id))
                .filter(UserTheoryTestResult.passed == True)
                .group_by(UserTheoryTestResult.user_id)
                .all()
            )
        }

        users = session.query(User).all()
        rows = []
        for user in users:
            lessons_completed = int(lesson_counts.get(user.id, 0))
            tasks_solved = int(task_counts.get(user.id, 0))
            theory_tests_solved = int(theory_counts.get(user.id, 0))
            total_score = lessons_completed + tasks_solved + theory_tests_solved

            rows.append(
                {
                    "userId": user.id,
                    "fullName": user.full_name,
                    "selectedPath": user.selected_path,
                    "lessonsCompleted": lessons_completed,
                    "tasksSolved": tasks_solved,
                    "theoryTestsSolved": theory_tests_solved,
                    "totalScore": total_score,
                }
            )

        rows.sort(
            key=lambda item: (
                -item["totalScore"],
                -item["lessonsCompleted"],
                -item["tasksSolved"],
                -item["theoryTestsSolved"],
                item["fullName"].lower() if item["fullName"] else "",
            )
        )

        limited_rows = rows[:safe_limit]
        for index, row in enumerate(limited_rows, start=1):
            row["rank"] = index

        return {
            "success": True,
            "leaderboard": limited_rows,
            "totalUsers": len(rows),
        }