import argparse
import json
from dataclasses import dataclass

from sqlalchemy.orm import sessionmaker

from ai_logic import AIError
from db.models.db_config import engine
from db.models.lessons import Lesson
from db.models.roadmap import Roadmap, RoadmapNode
from generate_specific_lessons import generate_specific_lessons


SessionLocal = sessionmaker(bind=engine)


@dataclass
class GenerationStatus:
    total_lessons: int
    ready_lessons: int
    missing_lessons: int
    missing_items: list[dict]


def _safe_json_loads(value: str | None, fallback):
    if not value:
        return fallback
    try:
        return json.loads(value)
    except Exception:
        return fallback


def _narrative_word_count_from_sections(sections: list[dict]) -> int:
    words = 0
    for section in sections:
        if not isinstance(section, dict):
            continue
        if (section.get("type") or "text").lower() != "text":
            continue
        text = section.get("content") or ""
        words += len([token for token in str(text).replace("\n", " ").split(" ") if token.strip()])
    return words


def _lesson_ready(lesson: Lesson) -> tuple[bool, list[str]]:
    content = _safe_json_loads(lesson.content, {})

    overview = (lesson.overview or content.get("overview") or "").strip()
    goal = (lesson.goal or content.get("goal") or "").strip()
    topics = _safe_json_loads(lesson.topics_json, content.get("topics", []))
    resources = _safe_json_loads(lesson.resources_json, content.get("resources", []))
    sections = content.get("sections") if isinstance(content.get("sections"), list) else []

    missing = []
    if not overview:
        missing.append("overview")
    if not goal:
        missing.append("goal")
    if not isinstance(topics, list) or len(topics) < 3:
        missing.append("topics")
    if not isinstance(resources, list) or len(resources) < 1:
        missing.append("resources")
    if not isinstance(sections, list) or len(sections) < 2:
        missing.append("sections")

    has_code = False
    for section in sections:
        if isinstance(section, dict) and (section.get("type") or "").lower() == "code" and (section.get("code") or "").strip():
            has_code = True
            break
    if not has_code:
        missing.append("code_example")

    narrative_words = _narrative_word_count_from_sections([section for section in sections if isinstance(section, dict)])
    if narrative_words < 480:
        missing.append("narrative_word_count")

    return len(missing) == 0, missing


def _collect_generation_status(path_filter: str | None = None) -> GenerationStatus:
    with SessionLocal() as session:
        roadmap_query = session.query(Roadmap)
        if path_filter:
            roadmap_query = roadmap_query.filter_by(slug=path_filter)
        roadmaps = roadmap_query.all()

        roadmap_by_id = {item.id: item for item in roadmaps}
        roadmap_ids = list(roadmap_by_id.keys())

        lesson_nodes_query = session.query(RoadmapNode).filter_by(node_type="lesson")
        if roadmap_ids:
            lesson_nodes_query = lesson_nodes_query.filter(RoadmapNode.roadmap_id.in_(roadmap_ids))
        elif path_filter:
            lesson_nodes_query = lesson_nodes_query.filter(RoadmapNode.id == -1)

        lesson_nodes = lesson_nodes_query.order_by(RoadmapNode.roadmap_id.asc(), RoadmapNode.external_id.asc()).all()

        missing_items: list[dict] = []
        ready_lessons = 0

        for node in lesson_nodes:
            roadmap = roadmap_by_id.get(node.roadmap_id)
            path_slug = roadmap.slug if roadmap else "unknown"

            lesson = session.query(Lesson).filter_by(roadmap_node_id=node.id).first()
            if not lesson:
                missing_items.append(
                    {
                        "path": path_slug,
                        "lessonId": node.external_id,
                        "title": node.title,
                        "missing": ["lesson_row", "content"],
                    }
                )
                continue

            is_ready, missing = _lesson_ready(lesson)
            if is_ready:
                ready_lessons += 1
                continue

            missing_items.append(
                {
                    "path": lesson.path,
                    "lessonId": lesson.order,
                    "title": lesson.title,
                    "missing": missing,
                }
            )

        total_lessons = len(lesson_nodes)
        return GenerationStatus(
            total_lessons=total_lessons,
            ready_lessons=ready_lessons,
            missing_lessons=len(missing_items),
            missing_items=missing_items,
        )


def main():
    parser = argparse.ArgumentParser(
        description="Generate full lesson content (overview, topics, notes, code examples, resources) for roadmap lessons"
    )
    parser.add_argument("--path", dest="path_filter", default=None, help="Optional roadmap slug filter")
    parser.add_argument("--limit", dest="limit", type=int, default=None, help="Optional lesson limit")
    parser.add_argument(
        "--overwrite",
        dest="overwrite",
        action="store_true",
        help="Force regeneration and replace existing lesson content",
    )
    parser.add_argument(
        "--no-overwrite",
        dest="overwrite",
        action="store_false",
        help="Generate only missing lesson content",
    )
    parser.set_defaults(overwrite=False)

    args = parser.parse_args()

    before = _collect_generation_status(path_filter=args.path_filter)

    if before.total_lessons == 0:
        print(
            json.dumps(
                {
                    "success": False,
                    "message": "No roadmap lessons found to process.",
                    "pathFilter": args.path_filter,
                },
                indent=2,
            )
        )
        raise SystemExit(1)

    if before.missing_lessons == 0 and not args.overwrite:
        print(
            json.dumps(
                {
                    "success": True,
                    "message": "All lessons already have generated content. No rerun needed.",
                    "pathFilter": args.path_filter,
                    "totalLessons": before.total_lessons,
                    "readyLessons": before.ready_lessons,
                    "missingLessons": before.missing_lessons,
                },
                indent=2,
            )
        )
        return

    try:
        stats = generate_specific_lessons(
            path_filter=args.path_filter,
            limit=args.limit,
            overwrite_existing=args.overwrite,
        )

        after = _collect_generation_status(path_filter=args.path_filter)
        print(
            json.dumps(
                {
                    "success": after.missing_lessons == 0,
                    "message": (
                        "Lesson generation completed. No rerun required."
                        if after.missing_lessons == 0
                        else "Lesson generation finished with remaining missing items."
                    ),
                    **stats,
                    "totalLessons": after.total_lessons,
                    "readyLessons": after.ready_lessons,
                    "missingLessons": after.missing_lessons,
                    "remaining": after.missing_items[:20],
                },
                indent=2,
            )
        )

        if after.missing_lessons != 0:
            raise SystemExit(1)
    except AIError as error:
        print(json.dumps({"success": False, "message": str(error)}, indent=2))
        raise SystemExit(1)


if __name__ == "__main__":
    main()
