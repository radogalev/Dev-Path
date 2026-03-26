const keywordTopicMap = {
  html: ['Document structure', 'Semantic elements', 'Accessibility basics'],
  css: ['Selectors and specificity', 'Layout systems', 'Responsive styling'],
  javascript: ['Variables and control flow', 'Functions and scope', 'DOM interactions'],
  react: ['Components and props', 'State and lifecycle', 'Routing and data flow'],
  api: ['Request/response cycle', 'Error handling', 'Authentication patterns'],
  database: ['Data modeling', 'Query patterns', 'Performance and indexing'],
  security: ['Threat modeling', 'Authentication', 'Secure coding practices'],
  docker: ['Images and containers', 'Container networking', 'Volume and persistence'],
  cloud: ['Compute and storage', 'Deployment models', 'Scalability and reliability'],
  testing: ['Unit tests', 'Integration tests', 'Debugging workflow']
};

const fallbackTopics = ['Core concepts', 'Hands-on implementation', 'Best practices'];

const commonResources = [
  { label: 'MDN Web Docs', url: 'https://developer.mozilla.org/' },
  { label: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/' },
  { label: 'W3Schools Reference', url: 'https://www.w3schools.com/' }
];

const codingResources = [
  { label: 'LeetCode Practice', url: 'https://leetcode.com/problemset/' },
  { label: 'Codewars Challenges', url: 'https://www.codewars.com/' },
  { label: 'Exercism', url: 'https://exercism.org/' }
];

function inferTopicsFromTitle(title) {
  const lower = title.toLowerCase();
  for (const [keyword, topics] of Object.entries(keywordTopicMap)) {
    if (lower.includes(keyword)) {
      return topics;
    }
  }
  return fallbackTopics;
}

function getGoalByType(type) {
  switch (type) {
    case 'video':
      return 'Understand the concepts and explain them in your own words.';
    case 'interactive':
      return 'Practice actively by completing the guided coding tasks.';
    case 'project':
      return 'Build a working solution and document your implementation choices.';
    default:
      return 'Study the lesson and apply what you learned.';
  }
}

function getResourcesByType(type, title) {
  const lower = title.toLowerCase();

  if (lower.includes('react')) {
    return [
      { label: 'React Docs', url: 'https://react.dev/learn' },
      { label: 'JavaScript Info', url: 'https://javascript.info/' },
      ...commonResources
    ];
  }

  if (lower.includes('node') || lower.includes('express')) {
    return [
      { label: 'Node.js Docs', url: 'https://nodejs.org/en/docs' },
      { label: 'Express Guide', url: 'https://expressjs.com/en/guide/routing.html' },
      ...commonResources
    ];
  }

  if (lower.includes('sql') || lower.includes('database')) {
    return [
      { label: 'PostgreSQL Docs', url: 'https://www.postgresql.org/docs/' },
      { label: 'SQLBolt', url: 'https://sqlbolt.com/' },
      ...commonResources
    ];
  }

  if (type === 'interactive' || type === 'project') {
    return [...codingResources, ...commonResources];
  }

  return commonResources;
}

function buildCodingProblem({ lecture, topics }) {
  const normalizedTitle = lecture.title.toLowerCase();

  let prompt = `Implement a function named solveTask that demonstrates the key ideas from ${lecture.title}.`;
  let inputDescription = 'A string input representing the user action or data payload.';
  let outputDescription = 'A transformed string or computed result based on the lesson logic.';
  let exampleInput = '"sample-input"';
  let exampleOutput = '"sample-output"';

  if (normalizedTitle.includes('html') || normalizedTitle.includes('css')) {
    prompt = 'Write a function that validates whether a given list of CSS class names follows BEM naming rules.';
    inputDescription = 'An array of class names, e.g. ["card", "card__title", "card--active"].';
    outputDescription = 'A boolean value: true if all names are valid BEM, otherwise false.';
    exampleInput = '["card", "card__title", "card--active"]';
    exampleOutput = 'true';
  } else if (normalizedTitle.includes('javascript') || normalizedTitle.includes('function')) {
    prompt = 'Write a function that groups an array of objects by a key and returns the grouped result.';
    inputDescription = 'An array of objects and a grouping key string.';
    outputDescription = 'An object where each key contains an array of matching items.';
    exampleInput = 'groupBy([{type:"A"},{type:"B"},{type:"A"}], "type")';
    exampleOutput = '{ A: [{type:"A"},{type:"A"}], B: [{type:"B"}] }';
  } else if (normalizedTitle.includes('react')) {
    prompt = 'Create a reusable React component that renders a searchable list and filters items by user input.';
    inputDescription = 'A list of strings passed as props.';
    outputDescription = 'Rendered JSX that updates as the search query changes.';
    exampleInput = 'items=["React", "Vue", "Angular"], query="re"';
    exampleOutput = 'Renders: ["React"]';
  } else if (normalizedTitle.includes('api') || normalizedTitle.includes('express') || normalizedTitle.includes('node')) {
    prompt = 'Implement an API handler that validates request input and returns standardized success/error responses.';
    inputDescription = 'A request object with body fields and a response object.';
    outputDescription = 'HTTP JSON response with { success, data?, error? } format.';
    exampleInput = '{ body: { email: "test@example.com" } }';
    exampleOutput = '{ success: true, data: { email: "test@example.com" } }';
  } else if (normalizedTitle.includes('sql') || normalizedTitle.includes('database')) {
    prompt = 'Write a function that builds a parameterized SQL query for searching users by optional filters.';
    inputDescription = 'An object with optional filters: name, minAge, maxAge.';
    outputDescription = 'An object containing query text and parameter values.';
    exampleInput = '{ name: "Ana", minAge: 20 }';
    exampleOutput = '{ text: "SELECT ... WHERE name ILIKE $1 AND age >= $2", values: ["%Ana%", 20] }';
  }

  return {
    title: `${lecture.title} Coding Challenge`,
    difficulty: lecture.type === 'project' ? 'Hard' : lecture.type === 'interactive' ? 'Medium' : 'Easy',
    prompt,
    inputDescription,
    outputDescription,
    constraints: [
      'Write clean, readable code with meaningful naming.',
      'Handle at least one edge case.',
      'Include a small example call or test at the bottom.'
    ],
    exampleInput,
    exampleOutput,
    starterCode: `function solveTask(input) {\n  // Topic focus: ${topics[0]}\n  // TODO: implement your solution\n  return input;\n}\n\n// Example\nconsole.log(solveTask("sample-input"));`
  };
}

export function buildLessonContent({ lecture, milestone, pathTitle }) {
  const topics = inferTopicsFromTitle(lecture.title);
  const resources = getResourcesByType(lecture.type, lecture.title);
  const codingProblem = buildCodingProblem({ lecture, topics });

  const overview = `${lecture.title} is part of the ${pathTitle} path in the "${milestone.title}" module. In this lesson, you will learn the practical fundamentals and how they are used in real engineering workflows.`;

  const explanation = [
    `Start by understanding why ${lecture.title.toLowerCase()} matters in production systems and team projects.`,
    `Then focus on implementation details and common mistakes so you can write cleaner, more reliable code.`,
    `Finish by applying the concepts to a small task and reflecting on trade-offs and best practices.`
  ];

  return {
    overview,
    goal: getGoalByType(lecture.type),
    topics,
    explanation,
    resources,
    codingProblem
  };
}
