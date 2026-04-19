export async function getStory(id) {
  try {
    const stories = await getStories();
    return stories.find(s => s.id == id);
  } catch {
    return null;
  }
}
