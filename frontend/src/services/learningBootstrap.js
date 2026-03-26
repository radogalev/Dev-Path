import { learningRoadmaps } from '../data/roadmaps';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const BOOTSTRAP_VERSION = 'learning-bootstrap-v2';

export async function bootstrapLearningData() {
  try {
    const doneVersion = localStorage.getItem(BOOTSTRAP_VERSION);
    if (doneVersion === 'done') {
      return;
    }

    const response = await fetch(`${BACKEND_URL}/learning/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roadmaps: learningRoadmaps,
      }),
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    if (data?.success) {
      localStorage.setItem(BOOTSTRAP_VERSION, 'done');
    }
  } catch (error) {
    console.error('Learning data bootstrap failed:', error);
  }
}
